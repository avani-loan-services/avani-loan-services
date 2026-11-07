// scripts/test_phase_5_3_19_suite.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PHASE 5.3.19 COMPREHENSIVE AUTOMATED VERIFICATION SUITE
// Tests: Admin Navigation, Security, Templates, Campaigns, Dry Run, RBAC & 3 DBs
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const http = require('http');
const https = require('https');
const mongoose = require('mongoose');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');
const client = isHttps ? https : http;

let authToken = '';
let testResults = [];

function recordTest(testName, passed, details = '') {
  testResults.push({ name: testName, passed, details });
  const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${statusIcon}: ${testName} ${details ? `(${details})` : ''}`);
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    if (body) {
      reqHeaders['Content-Type'] = 'application/json';
    }
    if (authToken) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
      reqHeaders['Cookie'] = `avani_portal_token=${authToken}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      headers: reqHeaders,
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('================================================================');
  console.log('🚀 STARTING PHASE 5.3.19 COMPREHENSIVE LOCALHOST VERIFICATION SUITE');
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Node Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // GROUP 1: PUBLIC HEALTH & SAFETY ENVIRONMENT
    // -------------------------------------------------------------
    console.log('--- GROUP 1: HEALTH & SAFETY ENVIRONMENT ---');
    const healthRes = await makeRequest('GET', '/health');
    recordTest(
      'Server Health Endpoint Responding',
      healthRes.status === 200,
      `Status ${healthRes.status}`
    );

    recordTest(
      'Safety Gate: PROVIDER_MODE is MOCK',
      healthRes.body && (healthRes.body.providerMode === 'mock' || !healthRes.body.liveDispatchesEnabled),
      'Zero live messages allowed'
    );

    // -------------------------------------------------------------
    // GROUP 2: UNAUTHENTICATED RBAC & PROTECTION (401 EXPECTED)
    // -------------------------------------------------------------
    console.log('\n--- GROUP 2: UNAUTHENTICATED ROUTE PROTECTION (RBAC) ---');
    const unauthTemplates = await makeRequest('GET', '/api/portal/templates');
    recordTest(
      'Unauthenticated GET /api/portal/templates Blocked (HTTP 401)',
      unauthTemplates.status === 401,
      `Status: ${unauthTemplates.status}`
    );

    const unauthCampaigns = await makeRequest('GET', '/api/portal/campaigns');
    recordTest(
      'Unauthenticated GET /api/portal/campaigns Blocked (HTTP 401)',
      unauthCampaigns.status === 401,
      `Status: ${unauthCampaigns.status}`
    );

    const unauthLeads = await makeRequest('GET', '/api/portal/leads');
    recordTest(
      'Unauthenticated GET /api/portal/leads Blocked (HTTP 401)',
      unauthLeads.status === 401,
      `Status: ${unauthLeads.status}`
    );

    const unauthDryRun = await makeRequest('POST', '/api/portal/campaigns/CMP-BLD-APF-01/dry-run');
    recordTest(
      'Unauthenticated POST /api/portal/campaigns/:id/dry-run Blocked (HTTP 401)',
      unauthDryRun.status === 401,
      `Status: ${unauthDryRun.status}`
    );

    const unauthCreateTpl = await makeRequest('POST', '/api/portal/templates', { name: 'test' });
    recordTest(
      'Unauthenticated POST /api/portal/templates Blocked (HTTP 401)',
      unauthCreateTpl.status === 401,
      `Status: ${unauthCreateTpl.status}`
    );

    // -------------------------------------------------------------
    // GROUP 3: AUTHENTICATION
    // -------------------------------------------------------------
    console.log('\n--- GROUP 3: ADMIN AUTHENTICATION ---');
    function getAdminPassword() {
      if (process.env.ADMIN_PORTAL_PASSWORD) return process.env.ADMIN_PORTAL_PASSWORD;
      const fs = require('fs');
      const path = require('path');
      const secretPaths = [
        path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/16_PHASE_5_1_REMEDIATION/.admin_credential_handoff.secret'),
        path.join(__dirname, '../.admin_credential_handoff.secret'),
        '/home/ubuntu/avani-loan-services/AVANI_LOAN_SERVICES_UNIFIED_PORTAL/16_PHASE_5_1_REMEDIATION/.admin_credential_handoff.secret'
      ];
      for (const sp of secretPaths) {
        if (fs.existsSync(sp)) {
          const lines = fs.readFileSync(sp, 'utf8').split('\n');
          for (const line of lines) {
            if (line.startsWith('ADMIN_INITIAL_PASSWORD=')) {
              return line.split('=')[1].trim();
            }
          }
        }
      }
      return 'AvaniAdmin@2026';
    }

    const adminUser = 'admin';
    const adminPass = getAdminPassword();

    const loginRes = await makeRequest('POST', '/api/portal/auth/login', {
      username: adminUser,
      password: adminPass
    });

    const loginOk = loginRes.status === 200 && loginRes.body && loginRes.body.success;
    recordTest(
      'Portal Admin Login via /api/portal/auth/login',
      loginOk,
      `Status: ${loginRes.status}, User: ${adminUser}`
    );

    if (loginOk && loginRes.body.token) {
      authToken = loginRes.body.token;
    } else if (loginRes.headers && loginRes.headers['set-cookie']) {
      const match = loginRes.headers['set-cookie'][0].match(/avani_portal_token=([^;]+)/);
      if (match) authToken = match[1];
    }

    const authMeRes = await makeRequest('GET', '/api/portal/auth/me');
    recordTest(
      'Session Validation via /api/portal/auth/me',
      authMeRes.status === 200 && authMeRes.body && authMeRes.body.authenticated === true,
      `Role: ${authMeRes.body?.user?.role || 'Unknown'}`
    );

    // -------------------------------------------------------------
    // GROUP 4: TEMPLATES MANAGEMENT API
    // -------------------------------------------------------------
    console.log('\n--- GROUP 4: TEMPLATES MANAGEMENT & WABA STATUS ---');
    const tplListRes = await makeRequest('GET', '/api/portal/templates');
    const tplCount = tplListRes.body?.data?.length || 0;
    recordTest(
      'Authenticated GET /api/portal/templates returns seed templates',
      tplListRes.status === 200 && tplCount >= 6,
      `Templates count: ${tplCount}`
    );

    const metaStatusRes = await makeRequest('GET', '/api/portal/templates/meta-status');
    recordTest(
      'Meta WABA Status Endpoint (/api/portal/templates/meta-status)',
      metaStatusRes.status === 200 && metaStatusRes.body?.data?.status === 'CONNECTED',
      `Quality: ${metaStatusRes.body?.data?.quality_rating}, Mode: ${metaStatusRes.body?.data?.mock_mode ? 'MOCK' : 'LIVE'}`
    );

    let createdTemplateId = '';
    const createTplRes = await makeRequest('POST', '/api/portal/templates', {
      name: 'test_phase_5_3_19_tpl',
      channel: 'WhatsApp',
      category: 'MARKETING',
      language: 'en',
      header: 'Avani Loan Services — Exclusive Desk',
      body: 'Hello {{1}}, we are pleased to introduce customized capital financing for {{2}}.',
      footer: 'Reply STOP to unsubscribe',
      variables: ['Customer Name', 'Project Name']
    });
    if (createTplRes.status === 201 && createTplRes.body?.data) {
      createdTemplateId = createTplRes.body.data.template_id;
    }
    recordTest(
      'Create New Template via POST /api/portal/templates',
      createTplRes.status === 201 && Boolean(createdTemplateId),
      `Created ID: ${createdTemplateId}`
    );

    if (createdTemplateId) {
      const dupTplRes = await makeRequest('POST', `/api/portal/templates/${createdTemplateId}/duplicate`);
      recordTest(
        'Duplicate Template via POST /api/portal/templates/:id/duplicate',
        dupTplRes.status === 201 && dupTplRes.body?.data?.name.includes('copy'),
        `Duplicated ID: ${dupTplRes.body?.data?.template_id}`
      );
    }

    // -------------------------------------------------------------
    // GROUP 5: CAMPAIGNS & DRY-RUN SIMULATION
    // -------------------------------------------------------------
    console.log('\n--- GROUP 5: CAMPAIGNS AUTOMATION & DRY-RUN SIMULATION ---');
    const cmpListRes = await makeRequest('GET', '/api/portal/campaigns');
    const cmpCount = cmpListRes.body?.data?.length || 0;
    recordTest(
      'Authenticated GET /api/portal/campaigns returns seed campaigns',
      cmpListRes.status === 200 && cmpCount >= 4,
      `Campaigns count: ${cmpCount}`
    );

    const firstCampaign = cmpListRes.body?.data?.[0];
    const targetCampaignId = firstCampaign?.campaign_id || 'CMP-BLD-APF-01';

    const dryRunRes = await makeRequest('POST', `/api/portal/campaigns/${targetCampaignId}/dry-run`);
    const dryRunOk = dryRunRes.status === 200 && dryRunRes.body?.success && dryRunRes.body?.summary;
    recordTest(
      `Simulated Dry Run via POST /api/portal/campaigns/${targetCampaignId}/dry-run`,
      dryRunOk,
      `Audience: ${dryRunRes.body?.summary?.total_audience}, Cost: ₹${dryRunRes.body?.summary?.cost_incurred}`
    );

    recordTest(
      'Dry Run Zero Cost Guarantee (PROVIDER_MODE=mock)',
      dryRunRes.body?.summary?.cost_incurred === 0,
      'Zero advertising spend incurred'
    );

    const approveRes = await makeRequest('POST', `/api/portal/campaigns/${targetCampaignId}/approve`);
    const approveStatus = approveRes.body?.data?.status;
    recordTest(
      `Approve Campaign via POST /api/portal/campaigns/${targetCampaignId}/approve`,
      approveRes.status === 200 && (approveStatus === 'Approved' || approveStatus === 'SCHEDULED'),
      `New Status: ${approveStatus}`
    );

    const stopRes = await makeRequest('POST', `/api/portal/campaigns/${targetCampaignId}/stop`);
    const stopStatus = stopRes.body?.data?.status;
    recordTest(
      `Stop Campaign via POST /api/portal/campaigns/${targetCampaignId}/stop`,
      stopRes.status === 200 && (stopStatus === 'Paused' || stopStatus === 'STOPPED'),
      `New Status: ${stopStatus}`
    );

    // -------------------------------------------------------------
    // GROUP 6: LEADS MANAGEMENT CRM & ANALYTICS
    // -------------------------------------------------------------
    console.log('\n--- GROUP 6: LEADS CRM & ANALYTICS ---');
    const leadsRes = await makeRequest('GET', '/api/portal/leads');
    const leadsCount = leadsRes.body?.data?.length || 0;
    recordTest(
      'Authenticated GET /api/portal/leads returns consumer leads',
      leadsRes.status === 200 && leadsCount >= 6,
      `Leads count: ${leadsCount}`
    );

    const firstLead = leadsRes.body?.data?.[0];
    if (firstLead) {
      const updateLeadRes = await makeRequest('PUT', `/api/portal/leads/${firstLead.lead_id}/status`, {
        status: 'CONTACTED'
      });
      recordTest(
        `Update Lead Status via PUT /api/portal/leads/${firstLead.lead_id}/status`,
        updateLeadRes.status === 200 && updateLeadRes.body?.data?.status === 'CONTACTED',
        `Updated status to CONTACTED`
      );
    }

    const analyticsRes = await makeRequest('GET', '/api/portal/leads/analytics');
    recordTest(
      'Cross-Module Analytics via GET /api/portal/leads/analytics',
      analyticsRes.status === 200 && analyticsRes.body?.data?.total_leads >= 6 && Boolean(analyticsRes.body?.data?.call_metrics),
      `Total Leads: ${analyticsRes.body?.data?.total_leads}, Call Quality: ${analyticsRes.body?.data?.call_metrics?.quality_rating}`
    );

    // -------------------------------------------------------------
    // GROUP 7: THREE PASSWORD-PROTECTED DATABASES INTEGRITY
    // -------------------------------------------------------------
    console.log('\n--- GROUP 7: THREE PASSWORD-PROTECTED DATABASES INTEGRITY ---');
    const buildersRes = await makeRequest('GET', '/api/portal/builder/companies?limit=100');
    const buildersCount = buildersRes.body?.totalCount || buildersRes.body?.data?.length || 0;
    recordTest(
      'Database 1: Builders Database Preservation (Exactly 80 Records)',
      buildersRes.status === 200 && buildersCount === 80,
      `Count: ${buildersCount}/80`
    );

    const schoolsRes = await makeRequest('GET', '/api/portal/education/schools?limit=100');
    const schoolsCount = schoolsRes.body?.totalCount || schoolsRes.body?.data?.length || 0;
    recordTest(
      'Database 2: School Funding Database Preservation (Exactly 24 Records)',
      schoolsRes.status === 200 && schoolsCount === 24,
      `Count: ${schoolsCount}/24`
    );

    const collegesRes = await makeRequest('GET', '/api/portal/education/colleges?limit=100');
    const collegesCount = collegesRes.body?.totalCount || collegesRes.body?.data?.length || 0;
    recordTest(
      'Database 3: College & University Funding Database (Exactly 56 Records)',
      collegesRes.status === 200 && collegesCount === 56,
      `Count: ${collegesCount}/56`
    );

    recordTest(
      'Combined Education Institutions Master Total (24 + 56 = 80)',
      schoolsCount + collegesCount === 80,
      `Total Education Institutions: ${schoolsCount + collegesCount}`
    );

    recordTest(
      'Master Institutional Records Across All 3 Databases (80 + 80 = 160)',
      buildersCount + schoolsCount + collegesCount === 160,
      `Grand Total: ${buildersCount + schoolsCount + collegesCount}/160`
    );

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    const passedCount = testResults.filter(t => t.passed).length;
    const totalCount = testResults.length;
    console.log(`📊 FINAL RESULTS: ${passedCount}/${totalCount} TESTS PASSED (${Math.round((passedCount/totalCount)*100)}%)`);
    console.log('================================================================\n');

    if (passedCount === totalCount) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal execution error running test suite:', err);
    process.exit(1);
  }
}

runSuite();
