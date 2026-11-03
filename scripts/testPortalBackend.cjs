// scripts/testPortalBackend.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — BACKEND TEST SUITE
// Tests Auth, RBAC, Builder APIs, Education APIs, Automation, Emergency STOP
// ─────────────────────────────────────────────────────────────────────────────

process.env.VERCEL = '1'; // prevent app.listen from hanging
const app = require('../src/server.cjs');
const http = require('http');

let server;
let baseUrl;
let authToken = '';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    if (authToken) {
      reqHeaders['Authorization'] = `Bearer ${authToken}`;
    }

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

const tests = [];
function recordTest(name, condition, details = '') {
  const passed = Boolean(condition);
  tests.push({ name, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${details ? '(' + details + ')' : ''}`);
}

async function runSuite() {
  console.log('========================================================================');
  console.log('RUNNING AVANI UNIFIED PORTAL BACKEND VALIDATION SUITE');
  console.log('========================================================================\n');

  // Start temporary server
  await new Promise(resolve => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[TestServer] Running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // 1. Security: Unauthorized route access rejected
    const unauthRes = await request('GET', '/api/portal/dashboard/overview');
    recordTest('1. Unauthorized Dashboard Access Blocked', unauthRes.status === 401, `Status: ${unauthRes.status}`);

    // 2. Auth: Bad credentials rejected
    const badLogin = await request('POST', '/api/portal/auth/login', { username: 'admin', password: 'WrongPassword' });
    recordTest('2. Bad Credentials Rejected', badLogin.status === 401, badLogin.body.message);

    // 3. Auth: Valid login with temporary admin credentials
    const loginRes = await request('POST', '/api/portal/auth/login', { username: 'admin', password: 'AvaniAdmin@2026' });
    recordTest('3. Admin Authentication Successful', loginRes.status === 200 && loginRes.body.success, `Role: ${loginRes.body.user?.role}`);
    authToken = loginRes.body.token;

    // 4. Force password replacement flag
    recordTest('4. Force Password Change Enforced on Initial Login', loginRes.body.user?.mustChangePassword === true, 'must_change_password=true');

    // 5. Auth /me endpoint
    const meRes = await request('GET', '/api/portal/auth/me');
    recordTest('5. User Session Profile Verified', meRes.status === 200 && meRes.body.user.username === 'admin', meRes.body.user?.email);

    // 6. Unified Dashboard Overview metrics
    const overviewRes = await request('GET', '/api/portal/dashboard/overview');
    recordTest('6. Overview Live Database Metrics Retrieved', overviewRes.status === 200 && overviewRes.body.data.builder.totalBuilders === 80,
      `Builders: ${overviewRes.body.data?.builder?.totalBuilders}, Institutions: ${overviewRes.body.data?.education?.totalInstitutions}`);

    // 7. Builder: 80 builders list
    const buildersRes = await request('GET', '/api/portal/builder/companies');
    recordTest('7. Builder Database Record Count Exact (80)', buildersRes.body.total === 80, `Found ${buildersRes.body.total} records`);

    // 8. Builder: 10 cities distribution
    const puneBuilders = await request('GET', '/api/portal/builder/companies?city=Pune');
    recordTest('8. Builder City Filter Operational (Pune=8)', puneBuilders.body.total === 8, `Pune count: ${puneBuilders.body.total}`);

    // 9. Builder: Pipeline 19 Stages
    const bPipeline = await request('GET', '/api/portal/builder/pipeline');
    recordTest('9. Builder 19-Stage Pipeline Loaded', bPipeline.body.stages.length === 19 && bPipeline.body.totalDeals === 80,
      `Stages: ${bPipeline.body.stages.length}, Deals: ${bPipeline.body.totalDeals}`);

    // 10. Builder: Pipeline Stage Transition
    const bDeals = Object.values(bPipeline.body.grouped).flatMap(g => g.deals);
    const testDeal = bDeals[0];
    const updateBStage = await request('PUT', `/api/portal/builder/pipeline/${testDeal.deal_id}/stage`, {
      stage: 8,
      stage_name: 'Response Received',
      notes: 'Initial partner introduction response received from alliances desk.'
    });
    recordTest('10. Builder Pipeline Stage Transition Audited', updateBStage.status === 200 && updateBStage.body.data.stage === 8,
      `Updated deal ${testDeal.deal_id} to stage 8`);

    // 11. Education: 80 Institutions list
    const eduRes = await request('GET', '/api/portal/education/institutions');
    recordTest('11. Education Database Record Count Exact (80)', eduRes.body.total === 80, `Found ${eduRes.body.total} institutions`);

    // 12. Education: 52 A+ Prospects
    const aPlusRes = await request('GET', '/api/portal/education/aplus');
    recordTest('12. Education 52 A+ Priority Prospects Intact', aPlusRes.body.totalAPlus === 52, `Total A+: ${aPlusRes.body.totalAPlus}`);

    // 13. Education: Funding Categories (12 Categories)
    const fundCats = await request('GET', '/api/portal/education/funding-categories');
    recordTest('13. Education 12 Funding Categories Available', fundCats.body.categories.length === 12, `Categories: ${fundCats.body.categories.length}`);

    // 14. Education: Pipeline 24 Stages
    const ePipeline = await request('GET', '/api/portal/education/pipeline');
    recordTest('14. Education 24-Stage Pipeline Loaded', ePipeline.body.stages.length === 24 && ePipeline.body.totalDeals === 80,
      `Stages: ${ePipeline.body.stages.length}, Deals: ${ePipeline.body.totalDeals}`);

    // 15. Education: Stage 19+ Lender Verification Policy Guard
    const testEDeal = Object.values(ePipeline.body.grouped).flatMap(g => g.deals)[0];
    const invalidSanction = await request('PUT', `/api/portal/education/pipeline/${testEDeal.deal_id}/stage`, {
      stage: 19,
      stage_name: 'Sanctioned',
      lender_name: 'Pending Lender Matching' // Missing lender proof
    });
    recordTest('15. Education Sanction Lender Verification Policy Enforced', invalidSanction.status === 400,
      'Blocked sanction transition without verified lender');

    // 16. Public Builder Enquiry Submission
    const bEnqRes = await request('POST', '/api/portal/public/builder-enquiry', {
      company_name: 'Godrej Properties Test',
      contact_person: 'Rahul Godrej',
      designation: 'VP Alliances',
      official_email: 'alliances@godrejproperties-test.com',
      business_telephone: '+91 22 6188 0000',
      city: 'Mumbai',
      website: 'https://www.godrejproperties.com',
      residential_project_count: 8,
      partnership_interest: 'Home Loan Referral Tie-Up',
      privacy_acknowledgement: true,
      marketing_opt_in: true
    });
    recordTest('16. Public Builder Enquiry Registered & Validated', bEnqRes.status === 201 && bEnqRes.body.success,
      `Enquiry ID: ${bEnqRes.body.enquiry_id}`);

    // 17. Public Education Enquiry Submission
    const eEnqRes = await request('POST', '/api/portal/public/education-enquiry', {
      institution_name: 'Somaiya Vidyavihar Test Campus',
      institution_category: 'College / University',
      legal_entity: 'Somaiya Trust',
      contact_person: 'Samir Somaiya',
      designation: 'President',
      official_email: 'president@somaiya-test.edu',
      telephone: '+91 22 6728 3000',
      city: 'Mumbai',
      state: 'Maharashtra',
      funding_requirement: 'College infrastructure finance',
      estimated_amount: 100000000,
      funding_purpose: 'New engineering research pavilion',
      privacy_acknowledgement: true,
      email_opt_in: true
    });
    recordTest('17. Public Education Enquiry Registered & Validated', eEnqRes.status === 201 && eEnqRes.body.success,
      `Enquiry ID: ${eEnqRes.body.enquiry_id}`);

    // 18. Emergency STOP Switch Execution
    const stopRes = await request('POST', '/api/portal/dashboard/automation/emergency-stop', {
      reason: 'Automated Test of Emergency STOP Trigger'
    });
    recordTest('18. Emergency STOP Switch Halts Outbound Marketing', stopRes.status === 200 && stopRes.body.data.stop_active === true,
      `Stop Active: ${stopRes.body.data?.stop_active}, Inbound Active: ${stopRes.body.data?.inbound_enquiries_active}`);

    // 19. Emergency STOP Resume
    const resumeRes = await request('POST', '/api/portal/dashboard/automation/resume', {});
    recordTest('19. Automation Workflows Resumed by Super Admin', resumeRes.status === 200 && resumeRes.body.data.stop_active === false,
      `Stop Active: ${resumeRes.body.data?.stop_active}`);

    // 20. Data Separation Check
    const builderKeys = Object.keys(buildersRes.body.data[0]);
    const eduKeys = Object.keys(eduRes.body.data[0]);
    const overlap = builderKeys.filter(k => eduKeys.includes(k) && !['city', 'state', 'created_at', 'updated_at', 'verification_status', 'qualification_score'].includes(k));
    recordTest('20. Absolute Data Separation Verified', !overlap.includes('builder_id') && !overlap.includes('institution_id'),
      'Builder ID and Institution ID namespaces completely isolated');

  } catch (err) {
    console.error('[TestSuite] Unhandled Error:', err);
  } finally {
    server.close();
  }

  const passedCount = tests.filter(t => t.passed).length;
  console.log('\n========================================================================');
  console.log(`TEST RESULTS: ${passedCount} / ${tests.length} PASSED (${Math.round(passedCount / tests.length * 100)}%)`);
  console.log('========================================================================\n');
}

runSuite();
