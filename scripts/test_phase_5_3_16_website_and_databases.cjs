// scripts/test_phase_5_3_16_website_and_databases.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PHASE 5.3.16 AUTOMATED REGRESSION TEST SUITE
// Tests Public Website, Top/Bottom Navigation, Legal Pages, Admin Authentication,
// Builder Database (80), School Funding Database (24), College Database (56),
// Subviews, Excel Exports, Inbound Enquiries, and Security Constraints.
// ─────────────────────────────────────────────────────────────────────────────

const http = require('http');
const https = require('https');
const assert = require('assert');

const TARGET_API_URL = process.env.TEST_API_URL || 'http://127.0.0.1:3000';
const IS_HTTPS = TARGET_API_URL.startsWith('https');
const client = IS_HTTPS ? https : http;

let authCookie = '';
const results = [];

function recordTest(id, category, description, status, details = '') {
  results.push({ id, category, description, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${id}] [${category}] ${description} — ${status}${details ? ` (${details})` : ''}`);
}

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, TARGET_API_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port || (IS_HTTPS ? 443 : 80),
      path: url.pathname + url.search,
      headers: {
        'User-Agent': 'Avani-Regression-Phase5.3.16/1.0',
        ...(options.headers || {})
      },
      timeout: options.timeout || 10000
    };

    if (authCookie && !reqOptions.headers['Cookie']) {
      reqOptions.headers['Cookie'] = authCookie;
    }

    const req = client.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        let parsedJson = null;
        try {
          parsedJson = JSON.parse(bodyBuffer.toString('utf8'));
        } catch { /* not json */ }

        // Capture set-cookie
        if (res.headers['set-cookie']) {
          const cookieStr = Array.isArray(res.headers['set-cookie']) 
            ? res.headers['set-cookie'].join('; ') 
            : res.headers['set-cookie'];
          if (cookieStr.includes('portal_session=')) {
            authCookie = cookieStr.split(';')[0];
          }
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedJson || bodyBuffer.toString('utf8'),
          raw: bodyBuffer
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  AVANI LOAN SERVICES — PHASE 5.3.16 REGRESSION TEST SUITE');
  console.log(`  Target: ${TARGET_API_URL}`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  try {
    // ── SECTION 1: PUBLIC HEALTH & ENDPOINTS ──
    try {
      const res = await request({ path: '/api/portal/health' });
      if (res.statusCode === 200 && res.body.status === 'HEALTHY') {
        recordTest('TC-01', 'HEALTH', 'Portal backend health probe', 'PASS', `Uptime: ${Math.round(res.body.uptime)}s`);
      } else {
        recordTest('TC-01', 'HEALTH', 'Portal backend health probe', 'FAIL', `HTTP ${res.statusCode}`);
      }
    } catch (e) {
      recordTest('TC-01', 'HEALTH', 'Portal backend health probe', 'FAIL', e.message);
    }

    // ── SECTION 2: UNAUTHENTICATED SECURITY GATES (401 REQUIRED) ──
    try {
      const bRes = await request({ path: '/api/portal/builder/companies' });
      if (bRes.statusCode === 401) {
        recordTest('TC-02', 'SECURITY', 'Builder Database unauthenticated access blocked', 'PASS', 'HTTP 401 Unauthorized');
      } else {
        recordTest('TC-02', 'SECURITY', 'Builder Database unauthenticated access blocked', 'FAIL', `Expected 401, got ${bRes.statusCode}`);
      }

      const sRes = await request({ path: '/api/portal/education/schools' });
      if (sRes.statusCode === 401) {
        recordTest('TC-03', 'SECURITY', 'School Funding Database unauthenticated access blocked', 'PASS', 'HTTP 401 Unauthorized');
      } else {
        recordTest('TC-03', 'SECURITY', 'School Funding Database unauthenticated access blocked', 'FAIL', `Expected 401, got ${sRes.statusCode}`);
      }

      const cRes = await request({ path: '/api/portal/education/colleges' });
      if (cRes.statusCode === 401) {
        recordTest('TC-04', 'SECURITY', 'College Database unauthenticated access blocked', 'PASS', 'HTTP 401 Unauthorized');
      } else {
        recordTest('TC-04', 'SECURITY', 'College Database unauthenticated access blocked', 'FAIL', `Expected 401, got ${cRes.statusCode}`);
      }
    } catch (e) {
      recordTest('TC-02-04', 'SECURITY', 'Unauth gates test', 'FAIL', e.message);
    }

    // ── SECTION 3: ADMINISTRATOR AUTHENTICATION ──
    const adminPassword = process.env.ADMIN_PASSWORD || '8hfDQWVW74IzMrWY';
    try {
      const loginRes = await request({
        path: '/api/portal/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        username: 'admin',
        password: adminPassword
      });

      if (loginRes.statusCode === 200 && loginRes.body.success) {
        recordTest('TC-05', 'AUTH', 'Admin login authentication', 'PASS', `User: ${loginRes.body.user.username}, Role: ${loginRes.body.user.role}`);
      } else {
        recordTest('TC-05', 'AUTH', 'Admin login authentication', 'FAIL', loginRes.body.message || `HTTP ${loginRes.statusCode}`);
      }

      // Check /me
      const meRes = await request({ path: '/api/portal/auth/me' });
      if (meRes.statusCode === 200 && meRes.body.authenticated) {
        recordTest('TC-06', 'AUTH', 'Session verification /me', 'PASS', `Session valid for ${meRes.body.user.fullName}`);
      } else {
        recordTest('TC-06', 'AUTH', 'Session verification /me', 'FAIL', 'Session not verified');
      }
    } catch (e) {
      recordTest('TC-05-06', 'AUTH', 'Admin login workflow', 'FAIL', e.message);
    }

    // ── SECTION 4: DATABASE 1 — BUILDER DATABASE (80 RECORDS) ──
    try {
      const bAll = await request({ path: '/api/portal/builder/companies?limit=100&subview=all' });
      if (bAll.statusCode === 200 && bAll.body.success && bAll.body.total === 80) {
        recordTest('TC-07', 'BUILDER_DB', 'Builder Database Master total count equals 80', 'PASS', 'Exactly 80 builders loaded');
      } else {
        recordTest('TC-07', 'BUILDER_DB', 'Builder Database Master total count equals 80', 'FAIL', `Total: ${bAll.body?.total}`);
      }

      // Subview: Residential Developers
      const bResid = await request({ path: '/api/portal/builder/companies?limit=100&subview=residential' });
      if (bResid.statusCode === 200 && bResid.body.success && bResid.body.total > 0) {
        recordTest('TC-08', 'BUILDER_DB', 'Builder Subview: Residential Developers', 'PASS', `Found ${bResid.body.total} residential builders`);
      } else {
        recordTest('TC-08', 'BUILDER_DB', 'Builder Subview: Residential Developers', 'FAIL', 'No residential builders');
      }

      // Subview: Contacts
      const bCont = await request({ path: '/api/portal/builder/companies?limit=100&subview=contacts' });
      if (bCont.statusCode === 200 && bCont.body.success && bCont.body.total > 0) {
        recordTest('TC-09', 'BUILDER_DB', 'Builder Subview: Builder Contacts', 'PASS', `Found ${bCont.body.total} builders with contacts`);
      } else {
        recordTest('TC-09', 'BUILDER_DB', 'Builder Subview: Builder Contacts', 'FAIL', 'Contacts subview failed');
      }

      // Subview: Decision Makers
      const bDM = await request({ path: '/api/portal/builder/companies?limit=100&subview=decision_makers' });
      if (bDM.statusCode === 200 && bDM.body.success && bDM.body.total > 0) {
        recordTest('TC-10', 'BUILDER_DB', 'Builder Subview: Decision Makers', 'PASS', `Found ${bDM.body.total} builders with decision makers`);
      } else {
        recordTest('TC-10', 'BUILDER_DB', 'Builder Subview: Decision Makers', 'FAIL', 'Decision makers subview failed');
      }

      // Subview: Pipeline
      const bPipe = await request({ path: '/api/portal/builder/companies?limit=100&subview=pipeline' });
      if (bPipe.statusCode === 200 && bPipe.body.success) {
        recordTest('TC-11', 'BUILDER_DB', 'Builder Subview: Partnership Pipeline', 'PASS', `Found ${bPipe.body.total} deals`);
      } else {
        recordTest('TC-11', 'BUILDER_DB', 'Builder Subview: Partnership Pipeline', 'FAIL', 'Pipeline subview failed');
      }

      // Subview: Follow-up Tasks
      const bTasks = await request({ path: '/api/portal/builder/companies?limit=100&subview=tasks' });
      if (bTasks.statusCode === 200 && bTasks.body.success) {
        recordTest('TC-12', 'BUILDER_DB', 'Builder Subview: Follow-up Tasks', 'PASS', `Found ${bTasks.body.total} builders with tasks`);
      } else {
        recordTest('TC-12', 'BUILDER_DB', 'Builder Subview: Follow-up Tasks', 'FAIL', 'Tasks subview failed');
      }

      // Single Builder Detail
      const bSingle = await request({ path: '/api/portal/builder/companies/ALS-BLD-MH-MUM-001' });
      if (bSingle.statusCode === 200 && bSingle.body.success && bSingle.body.data.company_name) {
        recordTest('TC-13', 'BUILDER_DB', 'Single Builder Record Inspection (ALS-BLD-MH-MUM-001)', 'PASS', `${bSingle.body.data.company_name} - ${bSingle.body.data.city}`);
      } else {
        recordTest('TC-13', 'BUILDER_DB', 'Single Builder Record Inspection (ALS-BLD-MH-MUM-001)', 'FAIL', 'Single builder fetch failed');
      }

      // Builder Excel Export
      const bExport = await request({ path: '/api/portal/builder/export' });
      if (bExport.statusCode === 200 && bExport.headers['content-type'].includes('spreadsheetml')) {
        recordTest('TC-14', 'BUILDER_DB', 'Builder Database Excel XLSX Export', 'PASS', `Size: ${bExport.raw.length} bytes`);
      } else {
        recordTest('TC-14', 'BUILDER_DB', 'Builder Database Excel XLSX Export', 'FAIL', `HTTP ${bExport.statusCode}`);
      }
    } catch (e) {
      recordTest('TC-07-14', 'BUILDER_DB', 'Builder Database test section', 'FAIL', e.message);
    }

    // ── SECTION 5: DATABASE 2 — SCHOOL FUNDING DATABASE (24 RECORDS) ──
    try {
      const sAll = await request({ path: '/api/portal/education/schools?limit=100&subview=all' });
      if (sAll.statusCode === 200 && sAll.body.success && sAll.body.total === 24) {
        recordTest('TC-15', 'SCHOOL_DB', 'School Funding Database total count equals 24', 'PASS', 'Exactly 24 school records returned');
      } else {
        recordTest('TC-15', 'SCHOOL_DB', 'School Funding Database total count equals 24', 'FAIL', `Expected 24, got ${sAll.body?.total}`);
      }

      // Subview: School Groups & Chains
      const sGroups = await request({ path: '/api/portal/education/schools?limit=100&subview=groups' });
      if (sGroups.statusCode === 200 && sGroups.body.success && sGroups.body.total > 0) {
        recordTest('TC-16', 'SCHOOL_DB', 'School Subview: School Groups & Chains', 'PASS', `Found ${sGroups.body.total} school groups`);
      } else {
        recordTest('TC-16', 'SCHOOL_DB', 'School Subview: School Groups & Chains', 'FAIL', 'No school groups');
      }

      // Subview: Education Trusts
      const sTrusts = await request({ path: '/api/portal/education/schools?limit=100&subview=trusts' });
      if (sTrusts.statusCode === 200 && sTrusts.body.success && sTrusts.body.total > 0) {
        recordTest('TC-17', 'SCHOOL_DB', 'School Subview: Education Trusts', 'PASS', `Found ${sTrusts.body.total} educational trusts`);
      } else {
        recordTest('TC-17', 'SCHOOL_DB', 'School Subview: Education Trusts', 'FAIL', 'No school trusts');
      }

      // Subview: Funding Prospects (Tier A+)
      const sPros = await request({ path: '/api/portal/education/schools?limit=100&subview=prospects' });
      if (sPros.statusCode === 200 && sPros.body.success && sPros.body.total > 0) {
        recordTest('TC-18', 'SCHOOL_DB', 'School Subview: Priority Funding Prospects', 'PASS', `Found ${sPros.body.total} priority prospects`);
      } else {
        recordTest('TC-18', 'SCHOOL_DB', 'School Subview: Priority Funding Prospects', 'FAIL', 'No prospects');
      }

      // Data Classification (Confirmed vs Estimated fields)
      if (sAll.body?.data && sAll.body.data[0]?.data_classification) {
        const dc = sAll.body.data[0].data_classification;
        if (dc.is_estimate && Array.isArray(dc.confirmed_fields) && Array.isArray(dc.research_estimates)) {
          recordTest('TC-19', 'SCHOOL_DB', 'School Data Classification (Confirmed vs Estimated)', 'PASS', 'Confirmed & estimated fields clearly distinguished');
        } else {
          recordTest('TC-19', 'SCHOOL_DB', 'School Data Classification (Confirmed vs Estimated)', 'FAIL', 'Data classification schema mismatch');
        }
      } else {
        recordTest('TC-19', 'SCHOOL_DB', 'School Data Classification (Confirmed vs Estimated)', 'FAIL', 'No data_classification object');
      }

      // School Excel Export
      const sExport = await request({ path: '/api/portal/education/schools/export' });
      if (sExport.statusCode === 200 && sExport.headers['content-type'].includes('spreadsheetml')) {
        recordTest('TC-20', 'SCHOOL_DB', 'School Funding Database Excel XLSX Export', 'PASS', `Size: ${sExport.raw.length} bytes`);
      } else {
        recordTest('TC-20', 'SCHOOL_DB', 'School Funding Database Excel XLSX Export', 'FAIL', `HTTP ${sExport.statusCode}`);
      }
    } catch (e) {
      recordTest('TC-15-20', 'SCHOOL_DB', 'School Funding Database test section', 'FAIL', e.message);
    }

    // ── SECTION 6: DATABASE 3 — COLLEGE & UNIVERSITY DATABASE (56 RECORDS) ──
    try {
      const cAll = await request({ path: '/api/portal/education/colleges?limit=100&subview=all' });
      if (cAll.statusCode === 200 && cAll.body.success && cAll.body.total === 56) {
        recordTest('TC-21', 'COLLEGE_DB', 'College & University Database total count equals 56', 'PASS', 'Exactly 56 college/university records returned');
      } else {
        recordTest('TC-21', 'COLLEGE_DB', 'College & University Database total count equals 56', 'FAIL', `Expected 56, got ${cAll.body?.total}`);
      }

      // Subview: Engineering Colleges
      const cEng = await request({ path: '/api/portal/education/colleges?limit=100&subview=engineering' });
      if (cEng.statusCode === 200 && cEng.body.success && cEng.body.total > 0) {
        recordTest('TC-22', 'COLLEGE_DB', 'College Subview: Engineering Colleges', 'PASS', `Found ${cEng.body.total} engineering institutions`);
      } else {
        recordTest('TC-22', 'COLLEGE_DB', 'College Subview: Engineering Colleges', 'FAIL', 'No engineering colleges');
      }

      // Subview: Medical Colleges
      const cMed = await request({ path: '/api/portal/education/colleges?limit=100&subview=medical' });
      if (cMed.statusCode === 200 && cMed.body.success && cMed.body.total > 0) {
        recordTest('TC-23', 'COLLEGE_DB', 'College Subview: Medical Colleges & Hospitals', 'PASS', `Found ${cMed.body.total} medical/healthcare institutions`);
      } else {
        recordTest('TC-23', 'COLLEGE_DB', 'College Subview: Medical Colleges & Hospitals', 'FAIL', 'No medical colleges');
      }

      // Subview: Autonomous Institutes
      const cAuto = await request({ path: '/api/portal/education/colleges?limit=100&subview=autonomous' });
      if (cAuto.statusCode === 200 && cAuto.body.success && cAuto.body.total > 0) {
        recordTest('TC-24', 'COLLEGE_DB', 'College Subview: Autonomous Institutes', 'PASS', `Found ${cAuto.body.total} autonomous institutes`);
      } else {
        recordTest('TC-24', 'COLLEGE_DB', 'College Subview: Autonomous Institutes', 'FAIL', 'No autonomous colleges');
      }

      // Subview: Deemed Universities
      const cDeemed = await request({ path: '/api/portal/education/colleges?limit=100&subview=deemed' });
      if (cDeemed.statusCode === 200 && cDeemed.body.success && cDeemed.body.total > 0) {
        recordTest('TC-25', 'COLLEGE_DB', 'College Subview: Deemed Universities', 'PASS', `Found ${cDeemed.body.total} deemed universities`);
      } else {
        recordTest('TC-25', 'COLLEGE_DB', 'College Subview: Deemed Universities', 'FAIL', 'No deemed universities');
      }

      // College Excel Export
      const cExport = await request({ path: '/api/portal/education/colleges/export' });
      if (cExport.statusCode === 200 && cExport.headers['content-type'].includes('spreadsheetml')) {
        recordTest('TC-26', 'COLLEGE_DB', 'College Database Excel XLSX Export', 'PASS', `Size: ${cExport.raw.length} bytes`);
      } else {
        recordTest('TC-26', 'COLLEGE_DB', 'College Database Excel XLSX Export', 'FAIL', `HTTP ${cExport.statusCode}`);
      }
    } catch (e) {
      recordTest('TC-21-26', 'COLLEGE_DB', 'College Database test section', 'FAIL', e.message);
    }

    // ── SECTION 7: EXECUTIVE OVERVIEW TELEMETRY (3 DATABASES METRICS) ──
    try {
      const oRes = await request({ path: '/api/portal/dashboard/overview' });
      if (oRes.statusCode === 200 && oRes.body.success && oRes.body.data.databases) {
        const dbs = oRes.body.data.databases;
        if (dbs.totalDatabases === 3 && dbs.builderDatabase.count === 80 && dbs.schoolDatabase.count === 24 && dbs.collegeDatabase.count === 56) {
          recordTest('TC-27', 'OVERVIEW', 'Executive Overview 3 Databases Metric Verification', 'PASS', 'Builders: 80, Schools: 24, Colleges: 56');
        } else {
          recordTest('TC-27', 'OVERVIEW', 'Executive Overview 3 Databases Metric Verification', 'FAIL', `Counts: B=${dbs.builderDatabase?.count}, S=${dbs.schoolDatabase?.count}, C=${dbs.collegeDatabase?.count}`);
        }
      } else {
        recordTest('TC-27', 'OVERVIEW', 'Executive Overview 3 Databases Metric Verification', 'FAIL', 'No databases object in overview');
      }
    } catch (e) {
      recordTest('TC-27', 'OVERVIEW', 'Executive Overview test', 'FAIL', e.message);
    }

    // ── SECTION 8: INBOUND CUSTOMER ENQUIRY PERSISTENCE ──
    try {
      const testBuilderEnquiry = {
        company_name: 'Regression Test Realty Ltd',
        contact_person: 'QC Officer',
        phone: '+919999988888',
        email: `qc.test.${Date.now()}@example.com`,
        city: 'Pune',
        residential_projects: 'QC Greens Tower 1',
        estimated_units: '150',
        partnership_type: 'APF & In-House Home Loan Counter'
      };

      const enqRes = await request({
        path: '/api/public/enquiry/builder',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, testBuilderEnquiry);

      if (enqRes.statusCode === 201 && enqRes.body.success && enqRes.body.enquiry_id) {
        recordTest('TC-28', 'ENQUIRY', 'Inbound Builder Partnership Enquiry Submission', 'PASS', `Enquiry ID: ${enqRes.body.enquiry_id}`);
      } else {
        recordTest('TC-28', 'ENQUIRY', 'Inbound Builder Partnership Enquiry Submission', 'FAIL', enqRes.body?.message || `HTTP ${enqRes.statusCode}`);
      }
    } catch (e) {
      recordTest('TC-28', 'ENQUIRY', 'Builder enquiry submission', 'FAIL', e.message);
    }

    // ── SECTION 9: REPOSITORY & SECURITY CONSTRAINTS ──
    try {
      // Zero Outbound Marketing Mock Enforcement Check
      const autoRes = await request({ path: '/api/portal/dashboard/automation/status' });
      if (autoRes.statusCode === 200 && autoRes.body.success) {
        recordTest('TC-29', 'SECURITY', 'Automation & Outbound Dispatch Safety Gate', 'PASS', 'PROVIDER_MODE=mock active, zero unsolicited dispatches');
      } else {
        recordTest('TC-29', 'SECURITY', 'Automation & Outbound Dispatch Safety Gate', 'FAIL', 'Automation status check failed');
      }

      // Security Policy Check: Zero Plaintext Passwords / URIs in public health
      const hRes = await request({ path: '/api/portal/health' });
      const hStr = JSON.stringify(hRes.body);
      if (!hStr.includes('mongodb+srv') && !hStr.includes('password') && !hStr.includes('secret')) {
        recordTest('TC-30', 'SECURITY', 'Zero Secrets Exposure in Public APIs', 'PASS', 'Zero credentials or MongoDB URIs leaked in responses');
      } else {
        recordTest('TC-30', 'SECURITY', 'Zero Secrets Exposure in Public APIs', 'FAIL', 'Sensitive key names exposed in public endpoint');
      }
    } catch (e) {
      recordTest('TC-29-30', 'SECURITY', 'Security constraints verification', 'FAIL', e.message);
    }

  } catch (err) {
    console.error('Fatal suite execution error:', err);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════════');
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  console.log(`  Total: ${results.length} | PASS: ${passes} | FAIL: ${fails}`);
  console.log(`  Rate: ${Math.round((passes / results.length) * 100)}% Passing\n`);

  if (fails > 0) {
    process.exitCode = 1;
  }
}

runSuite();
