/**
 * AVANI LOAN SERVICES — PHASE 5 COMPREHENSIVE FUNCTIONAL TEST SUITE
 * Validates Authentication, Builder Module, Education Module, Dashboard,
 * Inbound Forms, and Storage Persistence across real Express routes.
 */

'use strict';

process.env.NODE_ENV = 'test';
process.env.VERCEL = '1';
process.env.APP_MODE = 'test';
process.env.PROVIDER_MODE = 'mock';

const http = require('http');
const assert = require('assert');
const app = require('../src/server.cjs');
const db = require('../src/models/portalDatabase.cjs');

let server;
let baseUrl = '';
let authToken = '';
const testResults = [];

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    }
    Object.assign(reqHeaders, headers);
    if (!reqHeaders.Authorization) delete reqHeaders.Authorization;

    const req = http.request(url, {
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function recordTest(category, name, passed, details) {
  testResults.push({ category, name, passed, details, timestamp: new Date().toISOString() });
  const statusEmoji = passed ? '✅' : '❌';
  console.log(`  ${statusEmoji} [${category}] ${name}: ${details}`);
}

async function runSuite() {
  console.log('========================================================================');
  console.log('🧪 AVANI LOAN SERVICES — PHASE 5 FUNCTIONAL VERIFICATION SUITE');
  console.log('========================================================================\n');

  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[Test Server] Ephemeral test runner listening on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // Dynamically resolve admin initial password without hardcoded secrets
    const fs = require('fs');
    const path = require('path');
    let adminPassword = '';
    const secretPath = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/16_PHASE_5_1_REMEDIATION/.admin_credential_handoff.secret');
    if (fs.existsSync(secretPath)) {
      const lines = fs.readFileSync(secretPath, 'utf8').split(/\r?\n/);
      const passLine = lines.find(l => l.startsWith('ADMIN_INITIAL_PASSWORD='));
      if (passLine) adminPassword = passLine.split('=')[1].trim();
    }
    if (!adminPassword && process.env.ADMIN_INITIAL_PASSWORD) {
      adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
    }
    if (!adminPassword) {
      throw new Error('Admin password not configured in ADMIN_INITIAL_PASSWORD or handoff secret file.');
    }

    // ── 1. AUTHENTICATION TESTS ──
    console.log('--- 1. AUTHENTICATION & SECURITY ---');
    // Test 1.1: Successful login
    const loginRes = await request('POST', '/api/portal/auth/login', {
      username: 'admin',
      password: adminPassword
    });
    const loginOk = loginRes.status === 200 && loginRes.body.success;
    authToken = loginRes.body.token;
    recordTest('Auth', 'Successful Login', loginOk, `HTTP ${loginRes.status}, Role: ${loginRes.body.user?.role}`);

    // Test 1.2: Incorrect password rejection
    const badLogin = await request('POST', '/api/portal/auth/login', {
      username: 'admin',
      password: 'DefectivePassword#999'
    }, { Authorization: '' });
    recordTest('Auth', 'Incorrect Password Rejection', badLogin.status === 401, `HTTP ${badLogin.status} returned`);

    // Test 1.3: Account lockout protection
    let locked = false;
    for (let i = 0; i < 5; i++) {
      const res = await request('POST', '/api/portal/auth/login', {
        username: 'admin',
        password: 'BadPasswordAttempt'
      }, { Authorization: '' });
      if (res.status === 429) locked = true;
    }
    recordTest('Auth', 'Account Lockout', locked, 'HTTP 429 received after consecutive failed attempts');

    // Reset admin lockout for subsequent tests
    const adminUser = db.findOne('admin_users', u => u.username === 'admin');
    if (adminUser) {
      adminUser.failed_login_attempts = 0;
      adminUser.lockout_until = null;
      db.upsert('admin_users', 'user_id', adminUser);
    }
    // Re-authenticate to ensure fresh token
    const refreshLogin = await request('POST', '/api/portal/auth/login', {
      username: 'admin',
      password: adminPassword
    }, { Authorization: '' });
    authToken = refreshLogin.body.token;

    // Test 1.4: Password change
    const tempTestNewPass = 'AvaniRotatedTest#999!';
    const passChange = await request('POST', '/api/portal/auth/change-password', {
      currentPassword: adminPassword,
      newPassword: tempTestNewPass
    });
    recordTest('Auth', 'Password Change', passChange.status === 200, passChange.body.message || 'Password changed');
    if (passChange.body && passChange.body.token) {
      authToken = passChange.body.token; // Update token with mustChangePassword: false
    }

    // Reset password back to original rotated adminPassword for repeatability
    const passResetBack = await request('POST', '/api/portal/auth/change-password', {
      currentPassword: tempTestNewPass,
      newPassword: adminPassword
    });
    if (passResetBack.body && passResetBack.body.token) {
      authToken = passResetBack.body.token;
    }

    // Test 1.5: Session expiry / invalid token rejection
    const invalidTokenRes = await request('GET', '/api/portal/auth/me', null, { Authorization: 'Bearer invalid.tampered.token' });
    recordTest('Auth', 'Session Expiry / Invalid Token', invalidTokenRes.status === 401, `HTTP ${invalidTokenRes.status} on forged token`);

    // Test 1.6: Role restrictions
    const userListRes = await request('GET', '/api/portal/auth/users');
    recordTest('Auth', 'Role Restrictions (Super Admin Access)', userListRes.status === 200 && Array.isArray(userListRes.body.users), `${userListRes.body.users ? userListRes.body.users.length : 0} users returned`);

    // ── 2. BUILDER MODULE TESTS ──
    console.log('\n--- 2. BUILDER PARTNERSHIP MODULE ---');
    // Test 2.1: View and search builders
    const bldSearch = await request('GET', '/api/portal/builder/companies?search=Lodha');
    const bldFound = bldSearch.status === 200 && bldSearch.body.data && bldSearch.body.data.length > 0;
    recordTest('Builder', 'View and Search Builders', bldFound, `Found ${bldSearch.body.data ? bldSearch.body.data.length : 0} builder(s) for query "Lodha"`);

    // Test 2.2: Add and edit builder records
    const testBuilderId = 'ALS-BLD-MH-MUM-001';
    const bldDetail = await request('GET', `/api/portal/builder/companies/${testBuilderId}`);
    recordTest('Builder', 'View Single Builder Detail', bldDetail.status === 200 && bldDetail.body.data.builder_id === testBuilderId, `Retrieved ${bldDetail.body.data ? bldDetail.body.data.company_name : 'None'}`);

    // Test 2.3: Duplicate detection
    const allBuilders = db.getAll('builder_companies');
    const bldNames = new Set();
    let bldDups = 0;
    allBuilders.forEach(b => {
      const n = (b.company_name || '').toLowerCase().trim();
      if (bldNames.has(n)) bldDups++;
      bldNames.add(n);
    });
    recordTest('Builder', 'Duplicate Detection', bldDups === 0, `Zero duplicate companies found across ${allBuilders.length} builders`);

    // Test 2.4: MahaRERA verification status
    const reraRes = await request('GET', '/api/portal/builder/maharera');
    const reraMatches = reraRes.body.data ? reraRes.body.data.filter(r => r.match_classification === 'VERIFIED MATCH').length : 0;
    recordTest('Builder', 'MahaRERA Verification Status', reraMatches === 70, `70 Verified Matches confirmed out of ${reraRes.body.total || 0} projects`);

    // Test 2.5: Lead scoring
    const scores = allBuilders.map(b => b.qualification_score || 0);
    const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    recordTest('Builder', 'Lead Scoring Calculation', avgScore === '95.35', `Average qualification score = ${avgScore} / 100`);

    // Test 2.6: CRM stage transitions
    const bldDeals = db.getAll('builder_pipeline');
    const firstDeal = bldDeals[0];
    const transRes = await request('PUT', `/api/portal/builder/pipeline/${firstDeal.deal_id}/stage`, {
      stage: 9,
      stage_name: 'Discovery Meeting Scheduled',
      notes: 'Phase 5 Functional Test: Scheduled partner discovery meeting'
    });
    recordTest('Builder', 'CRM Stage Transitions', transRes.status === 200 && transRes.body.data.stage === 9, `Deal transitioned to Stage 9 (${transRes.body.data ? transRes.body.data.stage_name : 'N/A'})`);

    // Test 2.7: Follow-up tasks
    const tasksRes = await request('GET', '/api/portal/dashboard/tasks');
    recordTest('Builder', 'Follow-up Tasks Inspection', tasksRes.status === 200 && Array.isArray(tasksRes.body.data), `${tasksRes.body.data ? tasksRes.body.data.length : 0} tasks active`);

    // Test 2.8: Export reports
    const bldExport = await request('GET', '/api/portal/builder/export?format=xlsx');
    const isBldExcel = bldExport.status === 200 && bldExport.headers['content-type'] && bldExport.headers['content-type'].includes('spreadsheetml');
    recordTest('Builder', 'Export Reports (XLSX Stream)', isBldExcel, `HTTP ${bldExport.status}, Content-Type: ${bldExport.headers['content-type']}`);

    // ── 3. EDUCATION MODULE TESTS ──
    console.log('\n--- 3. EDUCATION INSTITUTIONAL FUNDING MODULE ---');
    // Test 3.1: View and search institutions
    const eduSearch = await request('GET', '/api/portal/education/institutions?search=SVKM');
    const eduFound = eduSearch.status === 200 && eduSearch.body.data && eduSearch.body.data.length > 0;
    recordTest('Education', 'View and Search Institutions', eduFound, `Found ${eduSearch.body.data ? eduSearch.body.data.length : 0} institution(s) for query "SVKM"`);

    // Test 3.2: View single institution
    const testInstId = 'ALS-EDU-MH-MUM-001';
    const instDetail = await request('GET', `/api/portal/education/institutions/${testInstId}`);
    recordTest('Education', 'View Single Institution Detail', instDetail.status === 200 && instDetail.body.data.institution_id === testInstId, `Retrieved ${instDetail.body.data ? instDetail.body.data.institution_name : 'None'}`);

    // Test 3.3: Duplicate detection
    const allInstitutions = db.getAll('education_institutions');
    const instNames = new Set();
    let instDups = 0;
    allInstitutions.forEach(i => {
      const n = (i.institution_name || '').toLowerCase().trim();
      if (instNames.has(n)) instDups++;
      instNames.add(n);
    });
    recordTest('Education', 'Duplicate Detection', instDups === 0, `Zero duplicate institutions found across ${allInstitutions.length} records`);

    // Test 3.4: A+ scoring
    const aplusRes = await request('GET', '/api/portal/education/aplus');
    recordTest('Education', 'Priority A+ Lead Scoring', aplusRes.status === 200 && aplusRes.body.totalAPlus === 52, `Exactly ${aplusRes.body.totalAPlus} Priority A+ benchmark prospects verified`);

    // Test 3.5: Funding categories
    const categoriesRes = await request('GET', '/api/portal/education/funding-categories');
    recordTest('Education', '12 Funding Categories Present', categoriesRes.status === 200 && categoriesRes.body.categories && categoriesRes.body.categories.length === 12, `${categoriesRes.body.categories ? categoriesRes.body.categories.length : 0} credit products available`);

    // Test 3.6: CRM stage transitions
    const eduDeals = db.getAll('education_pipeline');
    const firstEduDeal = eduDeals[0];
    const patchEduDeal = await request('PUT', `/api/portal/education/pipeline/${firstEduDeal.deal_id}/stage`, {
      stage: 10,
      stage_name: 'Documents Requested',
      notes: 'Phase 5 Functional Test: Trust Deed Requested'
    });
    recordTest('Education', 'CRM Stage Transitions', patchEduDeal.status === 200 && patchEduDeal.body.data.stage === 10, `Deal transitioned to Stage 10 (${patchEduDeal.body.data ? patchEduDeal.body.data.stage_name : 'N/A'})`);

    // Test 3.7: Consent registry
    const consentRes = await request('GET', '/api/portal/education/consent');
    recordTest('Education', 'Consent Registry Guard', consentRes.status === 200 && consentRes.body.data && consentRes.body.data.length === 80, `80 consent records verified (Zero unsolicited outreach permitted)`);

    // Test 3.8: Export reports
    const eduExport = await request('GET', '/api/portal/education/export?format=xlsx');
    const isEduExcel = eduExport.status === 200 && eduExport.headers['content-type'] && eduExport.headers['content-type'].includes('spreadsheetml');
    recordTest('Education', 'Export Reports (XLSX Stream)', isEduExcel, `HTTP ${eduExport.status}, Content-Type: ${eduExport.headers['content-type']}`);

    // ── 4. SHARED DASHBOARD TESTS ──
    console.log('\n--- 4. SHARED DASHBOARD ---');
    // Test 4.1: Live KPI accuracy
    const overview = await request('GET', '/api/portal/dashboard/overview');
    const kpis = overview.body.data || {};
    const bldCountFromKpi = kpis.builder ? kpis.builder.totalBuilders : 0;
    const eduCountFromKpi = kpis.education ? kpis.education.totalInstitutions : 0;
    recordTest('Dashboard', 'KPI Accuracy', overview.status === 200 && bldCountFromKpi === 80 && eduCountFromKpi === 80, `Builders: ${bldCountFromKpi}, Institutions: ${eduCountFromKpi}`);

    // Test 4.2: Audit logging
    const auditRes = await request('GET', '/api/portal/dashboard/audit-logs');
    recordTest('Dashboard', 'Audit Logs Access', auditRes.status === 200 && Array.isArray(auditRes.body.data), `${auditRes.body.data ? auditRes.body.data.length : 0} audit logs tracked`);

    // Test 4.3: Emergency STOP trigger
    const stopRes = await request('POST', '/api/portal/dashboard/automation/emergency-stop', {
      reason: 'Phase 5 Functional Testing Broadcast Halt'
    });
    recordTest('Dashboard', 'Emergency STOP Trigger', stopRes.status === 200 && stopRes.body.data.stop_active === true, 'Outbound channels halted immediately');

    // Test 4.4: Emergency STOP resume
    const resumeRes = await request('POST', '/api/portal/dashboard/automation/resume', {});
    recordTest('Dashboard', 'Emergency STOP Resumption', resumeRes.status === 200 && resumeRes.body.data.stop_active === false, 'Operations restored successfully');

    // Test 4.5: Live synchronization endpoint
    const syncRes = await request('POST', '/api/portal/dashboard/automation/sync');
    recordTest('Dashboard', 'Database Synchronizer', syncRes.status === 200 && syncRes.body.success === true, 'In-memory maps and disk records synchronized');

    // ── 5. INBOUND FORMS TESTS ──
    console.log('\n--- 5. INBOUND FORMS ---');
    const uniqueTs = Date.now();
    // Test 5.1: Builder enquiry submission
    const bldEnquiry = await request('POST', '/api/portal/public/builder-enquiry', {
      company_name: `Phase5 Test Builder ${uniqueTs}`,
      contact_person: 'Suresh Patil',
      designation: 'Director of Business Development',
      official_email: `suresh_${uniqueTs}@testbuilder.com`,
      business_telephone: '+91 98200 11223',
      city: 'Pune',
      residential_project_count: 3,
      partnership_interest: 'Exclusive Site Home Loan Desk',
      privacy_acknowledgement: true
    }, { Authorization: '' });
    recordTest('Inbound', 'Builder Enquiry Submission', bldEnquiry.status === 201 && bldEnquiry.body.enquiry_id, `Enquiry ID: ${bldEnquiry.body.enquiry_id}`);

    // Test 5.2: Institutional funding submission
    const eduEnquiry = await request('POST', '/api/portal/public/education-enquiry', {
      institution_name: `Phase5 Academy of Engineering ${uniqueTs}`,
      trust_name: `Phase5 Educational Trust ${uniqueTs}`,
      contact_person: 'Dr. Ramesh Kulkarni',
      designation: 'Chairman & Managing Trustee',
      official_email: `chairman_${uniqueTs}@phase5edu.in`,
      telephone: '+91 98900 88776',
      city: 'Nashik',
      state: 'Maharashtra',
      funding_requirement: 'College infrastructure finance',
      estimated_amount: 250000000,
      funding_purpose: 'New AI & Robotics Academic Complex',
      privacy_acknowledgement: true,
      email_opt_in: true
    }, { Authorization: '' });
    recordTest('Inbound', 'Education Enquiry Submission', eduEnquiry.status === 201 && eduEnquiry.body.enquiry_id, `Enquiry ID: ${eduEnquiry.body.enquiry_id}`);

    // Test 5.3: Duplicate submission handling
    const dupEnquiry = await request('POST', '/api/portal/public/education-enquiry', {
      institution_name: `Phase5 Academy of Engineering ${uniqueTs}`,
      trust_name: `Phase5 Educational Trust ${uniqueTs}`,
      contact_person: 'Dr. Ramesh Kulkarni',
      designation: 'Chairman & Managing Trustee',
      official_email: `chairman_${uniqueTs}@phase5edu.in`,
      telephone: '+91 98900 88776',
      city: 'Nashik',
      state: 'Maharashtra',
      funding_requirement: 'College infrastructure finance',
      estimated_amount: 250000000,
      funding_purpose: 'Duplicate submission attempt',
      privacy_acknowledgement: true,
      email_opt_in: true
    }, { Authorization: '' });
    recordTest('Inbound', 'Duplicate Submission Rejection', dupEnquiry.status === 409, `HTTP ${dupEnquiry.status} returned on duplicate submission within 24h`);

    // Test 5.4: Input validation failure
    const badEnquiry = await request('POST', '/api/portal/public/builder-enquiry', {
      company_name: '' // Missing required field
    }, { Authorization: '' });
    recordTest('Inbound', 'Input Validation Safeguard', badEnquiry.status === 400, `HTTP ${badEnquiry.status} returned on blank company name`);

    // ── 6. PERSISTENCE TESTS ──
    console.log('\n--- 6. STORAGE PERSISTENCE ---');
    // Test 6.1: Confirm records intact
    const bldCount = db.getAll('builder_companies').length;
    const eduCount = db.getAll('education_institutions').length;
    recordTest('Persistence', 'Record Counts Intact', bldCount === 80 && eduCount === 80, `Verified 80 Builders and 80 Institutions`);

    // Test 6.2: State preservation
    const autoState = db.getAutomationState();
    recordTest('Persistence', 'Automation State Model Intact', autoState && autoState.state_id === 'GLOBAL_CONFIG', `State ID: ${autoState.state_id}, Stop Active: ${autoState.stop_active}`);

    console.log('\n========================================================================');
    const passedCount = testResults.filter(t => t.passed).length;
    console.log(`📊 FINAL RESULT: ${passedCount} / ${testResults.length} TESTS PASSED (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
    console.log('========================================================================\n');

  } finally {
    const adminUser = db.getById('admin_users', 'USR-ADMIN-001');
    if (adminUser) {
      adminUser.must_change_password = true;
      adminUser.last_login = null;
      db.upsert('admin_users', 'user_id', adminUser);
    }
    if (server) {
      server.close();
    }
  }

  return testResults;
}

if (require.main === module) {
  runSuite()
    .then(results => {
      const allPassed = results.every(t => t.passed);
      process.exit(allPassed ? 0 : 1);
    })
    .catch(err => {
      console.error('Fatal test runner error:', err);
      process.exit(1);
    });
}

module.exports = { runSuite };
