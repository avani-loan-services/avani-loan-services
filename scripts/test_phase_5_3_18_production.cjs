// scripts/test_phase_5_3_18_production.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PHASE 5.3.18 PRODUCTION REGRESSION & AUDIT SUITE
// Verifies 3 Databases (80 Builders, 24 Schools, 56 Colleges = 160 Total)
// Tests: Authentication, Data Integrity, Leadership Enrichment, Subviews & Exports
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const API_BASE = process.env.TEST_API_URL || 'http://127.0.0.1:3000';

console.log('═══════════════════════════════════════════════════════════════════');
console.log('🧪 AVANI LOAN SERVICES — PHASE 5.3.18 REGRESSION & AUDIT SUITE');
console.log(`   Target Endpoint: ${API_BASE}`);
console.log('═══════════════════════════════════════════════════════════════════\n');

// Helper for HTTP requests with cookies
function request(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(urlPath, API_BASE);
    const client = fullUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.cookie) {
      reqOptions.headers['Cookie'] = options.cookie;
    }

    const req = client.request(fullUrl, reqOptions, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        const setCookie = res.headers['set-cookie'];
        let cookie = null;
        if (setCookie) {
          cookie = setCookie.map(c => c.split(';')[0]).join('; ');
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookie,
          buffer,
          text: buffer.toString('utf8'),
          json: () => {
            try {
              return JSON.parse(buffer.toString('utf8'));
            } catch (e) {
              return null;
            }
          }
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runSuite() {
  const results = [];
  let testCookie = null;

  function record(testName, passed, details = '') {
    results.push({ testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${mark} | ${testName} ${details ? `(${details})` : ''}`);
  }

  try {
    // 1. Health check
    console.log('--- 1. API HEALTH & AUTHENTICATION ---');
    const health = await request('/health');
    record('Backend Health Check', health.statusCode === 200, `Status: ${health.statusCode}`);

    // Login as Admin
    function getAdminPassword() {
      if (process.env.ADMIN_PORTAL_PASSWORD) return process.env.ADMIN_PORTAL_PASSWORD;
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

    const adminPassword = getAdminPassword();
    const loginRes = await request('/api/portal/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        username: 'admin',
        password: adminPassword
      }
    });

    const loginData = loginRes.json();
    testCookie = loginRes.cookie;
    record('Admin Authentication', loginRes.statusCode === 200 && loginData && loginData.success, `User: ${loginData?.user?.username || 'N/A'}`);

    // 2. BUILDER DATABASE AUDIT (80 RECORDS)
    console.log('\n--- 2. BUILDER DATABASE AUDIT (80 ENTERPRISE TARGETS) ---');
    const builderRes = await request('/api/portal/builder/companies?limit=100', { cookie: testCookie });
    const bData = builderRes.json();
    const builders = bData?.data || [];

    record('Builder Database Total Count', builders.length === 80, `Count: ${builders.length}/80`);
    record('Builder Subview: All', bData?.subviewCounts?.all === 80, `Count: ${bData?.subviewCounts?.all}`);
    record('Builder Subview: Residential', bData?.subviewCounts?.residential > 0, `Count: ${bData?.subviewCounts?.residential}`);
    record('Builder Subview: Contacts', bData?.subviewCounts?.contacts === 80, `Count: ${bData?.subviewCounts?.contacts}`);
    record('Builder Subview: Decision Makers', bData?.subviewCounts?.decision_makers === 80, `Count: ${bData?.subviewCounts?.decision_makers}`);

    // Verify enrichment on builders
    const sampleBuilder = builders[0] || {};
    const hasKeyDecisionMaker = sampleBuilder.key_decision_maker_name && sampleBuilder.key_decision_maker_role;
    const hasBatchId = sampleBuilder.source_lineage_batch_id === 'BATCH-20261107-P5318';
    const hasScoreBreakdown = sampleBuilder.score_breakdown && (typeof sampleBuilder.score_breakdown.f1_residential_relevance === 'number' || typeof sampleBuilder.score_breakdown.f1_company_identity === 'number');

    record('Builder Enriched Decision-Maker Roster', !!hasKeyDecisionMaker, `DM: ${sampleBuilder.key_decision_maker_name} (${sampleBuilder.key_decision_maker_role})`);
    record('Builder Forensic Batch ID Provenance', !!hasBatchId, `Batch: ${sampleBuilder.source_lineage_batch_id}`);
    record('Builder 7-Factor Qualification Score Breakdown', !!hasScoreBreakdown, `Score: ${sampleBuilder.qualification_score}/100`);

    // 3. SCHOOL FUNDING DATABASE AUDIT (24 SCHOOLS)
    console.log('\n--- 3. SCHOOL FUNDING DATABASE AUDIT (24 K-12 & BOARDING) ---');
    const schoolRes = await request('/api/portal/education/schools?limit=100', { cookie: testCookie });
    const sData = schoolRes.json();
    const schools = sData?.data || [];

    record('School Funding Database Total Count', schools.length === 24, `Count: ${schools.length}/24`);
    record('School Subview: Groups', sData?.subviewCounts?.groups > 0, `Count: ${sData?.subviewCounts?.groups}`);
    record('School Subview: Trusts', sData?.subviewCounts?.trusts > 0, `Count: ${sData?.subviewCounts?.trusts}`);
    record('School Subview: Prospects', sData?.subviewCounts?.prospects > 0, `Count: ${sData?.subviewCounts?.prospects}`);

    const sampleSchool = schools[0] || {};
    const hasSchoolChairman = !!sampleSchool.chairman_name;
    const hasSchoolBorrowing = !!sampleSchool.potential_borrowing_capacity;
    const hasSchoolSecuredLAP = !!sampleSchool.secured_lap_potential;
    const hasSchoolBatchId = sampleSchool.source_lineage_batch_id === 'BATCH-20261107-P5318';

    record('School Leadership Roster (Chairman/President)', hasSchoolChairman, `Chairman: ${sampleSchool.chairman_name}`);
    record('School Lending Intelligence: Borrowing Capacity', hasSchoolBorrowing, `Capacity: ${sampleSchool.potential_borrowing_capacity}`);
    record('School Lending Intelligence: Secured LAP Potential', hasSchoolSecuredLAP, `LAP: ${sampleSchool.secured_lap_potential}`);
    record('School Forensic Lineage Provenance', hasSchoolBatchId, `Batch: ${sampleSchool.source_lineage_batch_id}`);

    // 4. COLLEGE & UNIVERSITY FUNDING DATABASE AUDIT (56 INSTITUTIONS)
    console.log('\n--- 4. COLLEGE & UNIVERSITY FUNDING DATABASE AUDIT (56 CAMPUSES) ---');
    const collegeRes = await request('/api/portal/education/colleges?limit=100', { cookie: testCookie });
    const cData = collegeRes.json();
    const colleges = cData?.data || [];

    record('College & University Database Total Count', colleges.length === 56, `Count: ${colleges.length}/56`);
    record('Colleges Subview: Engineering', cData?.subviewCounts?.engineering > 0, `Count: ${cData?.subviewCounts?.engineering}`);
    record('Colleges Subview: Medical', cData?.subviewCounts?.medical > 0, `Count: ${cData?.subviewCounts?.medical}`);
    record('Colleges Subview: Autonomous', cData?.subviewCounts?.autonomous > 0, `Count: ${cData?.subviewCounts?.autonomous}`);
    record('Colleges Subview: Deemed Universities', cData?.subviewCounts?.deemed > 0, `Count: ${cData?.subviewCounts?.deemed}`);

    const sampleCollege = colleges[0] || {};
    const hasCollegeChairman = !!sampleCollege.chairman_name;
    const hasCollegeBorrowing = !!sampleCollege.potential_borrowing_capacity;
    const hasCollegeCollateral = !!sampleCollege.potential_collateral;
    const hasCollegeBatchId = sampleCollege.source_lineage_batch_id === 'BATCH-20261107-P5318';

    record('College Leadership Roster (Chancellor/Chairman)', hasCollegeChairman, `Chancellor/Chairman: ${sampleCollege.chairman_name}`);
    record('College Lending Intelligence: Borrowing Capacity', hasCollegeBorrowing, `Capacity: ${sampleCollege.potential_borrowing_capacity}`);
    record('College Lending Intelligence: Collateral Assessment', hasCollegeCollateral, `Collateral: ${sampleCollege.potential_collateral?.substring(0, 40)}...`);
    record('College Forensic Lineage Provenance', hasCollegeBatchId, `Batch: ${sampleCollege.source_lineage_batch_id}`);

    // Total Enterprise Population Verification
    const totalEducation = schools.length + colleges.length;
    record('Combined Education Population (24 + 56 = 80)', totalEducation === 80, `Total: ${totalEducation}`);
    const grandTotal = builders.length + totalEducation;
    record('Grand Total Enterprise Targets (80 + 80 = 160)', grandTotal === 160, `Grand Total: ${grandTotal}`);

    // 5. EXCEL EXPORTS INTEGRITY
    console.log('\n--- 5. EXCEL EXPORT INTEGRITY AUDIT ---');
    const builderXlsx = await request('/api/portal/builder/export', { cookie: testCookie });
    record('Builder Excel Export Endpoint', builderXlsx.statusCode === 200 && builderXlsx.buffer.length > 5000, `Bytes: ${builderXlsx.buffer.length}`);

    const schoolsXlsx = await request('/api/portal/education/schools/export', { cookie: testCookie });
    record('Schools Excel Export Endpoint', schoolsXlsx.statusCode === 200 && schoolsXlsx.buffer.length > 5000, `Bytes: ${schoolsXlsx.buffer.length}`);

    const collegesXlsx = await request('/api/portal/education/colleges/export', { cookie: testCookie });
    record('Colleges Excel Export Endpoint', collegesXlsx.statusCode === 200 && collegesXlsx.buffer.length > 5000, `Bytes: ${collegesXlsx.buffer.length}`);

    const masterEduXlsx = await request('/api/portal/education/export', { cookie: testCookie });
    record('Master Education Excel Export Endpoint', masterEduXlsx.statusCode === 200 && masterEduXlsx.buffer.length > 5000, `Bytes: ${masterEduXlsx.buffer.length}`);

    // Summary
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = results.filter(r => !r.passed).length;

    console.log('\n═══════════════════════════════════════════════════════════════════');
    console.log(`📊 REGRESSION SUITE RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILS)`);
    console.log('═══════════════════════════════════════════════════════════════════');

    const auditOutput = {
      executed_at: new Date().toISOString(),
      api_base: API_BASE,
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      results
    };

    fs.writeFileSync(path.join(__dirname, '../scratch/phase_5_3_18_regression_results.json'), JSON.stringify(auditOutput, null, 2));

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test Suite Exception:', err);
    process.exit(1);
  }
}

runSuite();
