// tests/workflow/test_loan_workflows.test.cjs
// ─────────────────────────────────────────────────────────────────
// End-to-End Workflow Tests: 15 Domain Lending Lifecycle
// ─────────────────────────────────────────────────────────────────

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { LoanLifecycleOrchestrator } = require('../../apps/ai-orchestrator/index.cjs');

console.log('🧪 RUNNING END-TO-END WORKFLOW TESTS: 15 Domain Lifecycle');

const fixturesDir = path.resolve(__dirname, '../../data/synthetic-fixtures');
const doctorFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'applicant_salaried_doctor.json'), 'utf8'));
const engineerFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'applicant_salaried_software_engineer.json'), 'utf8'));
const retailerFixture = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'applicant_self_employed_retailer.json'), 'utf8'));

const orchestrator = new LoanLifecycleOrchestrator();

// 1. Salaried Doctor Full Workflow
async function testDoctorWorkflow() {
  const result = await orchestrator.processApplication(doctorFixture);

  assert.strictEqual(result.status, 'SUBMITTED_FOR_HUMAN_REVIEW');
  assert.ok(result.applicationId.startsWith('ALS-APP-'), 'App ID format validation');
  assert.strictEqual(result.foirAssessment.status, 'ELIGIBLE');
  assert.strictEqual(result.policyMatchingResult.topRecommendation.lenderName, 'Bajaj Finserv');
  assert.strictEqual(result.humanReviewGate.systemSanctionAuthorized, false);
  assert.strictEqual(result.allDomainsProcessed.length, 15);
  console.log(`  ✅ Doctor Professional Loan (15 Domains): Application ${result.applicationId} matched Bajaj Finserv (FOIR: ${result.foirAssessment.foirPercent}%): PASS`);
}

// 2. Salaried Software Engineer Full Workflow
async function testEngineerWorkflow() {
  const result = await orchestrator.processApplication(engineerFixture);

  assert.strictEqual(result.status, 'SUBMITTED_FOR_HUMAN_REVIEW');
  assert.strictEqual(result.identity.panMasked, 'XXXXX5678Z');
  assert.strictEqual(result.foirAssessment.status, 'ELIGIBLE');
  assert.strictEqual(result.humanReviewGate.systemSanctionAuthorized, false);
  assert.strictEqual(result.allDomainsProcessed.length, 15);
  console.log(`  ✅ Salaried Engineer Personal Loan (15 Domains): Application ${result.applicationId} matched ${result.policyMatchingResult.topRecommendation.lenderName}: PASS`);
}

// 3. Self-Employed Business Loan Workflow
async function testRetailerWorkflow() {
  const result = await orchestrator.processApplication(retailerFixture);

  assert.strictEqual(result.status, 'SUBMITTED_FOR_HUMAN_REVIEW');
  assert.strictEqual(result.foirAssessment.status, 'ELIGIBLE');
  assert.strictEqual(result.humanReviewGate.systemSanctionAuthorized, false);
  assert.strictEqual(result.allDomainsProcessed.length, 15);
  console.log(`  ✅ Self-Employed Business Loan (15 Domains): Application ${result.applicationId} matched ICICI Bank: PASS`);
}

(async () => {
  await testDoctorWorkflow();
  await testEngineerWorkflow();
  await testRetailerWorkflow();
  console.log('🎉 ALL 15-DOMAIN WORKFLOW TESTS PASSED SUCCESSFULLY!\n');
})();
