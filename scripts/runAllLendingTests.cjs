// scripts/runAllLendingTests.cjs
// ─────────────────────────────────────────────────────────────────
// Master Autonomous Test Runner for AVANI LOAN SERVICES
// Executes Unit, Integration, Security, Workflow, and Calculator Suites
// ─────────────────────────────────────────────────────────────────

'use strict';

const { execSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

const testSuites = [
  { name: 'Unit: FOIR & DTI Engine', command: 'node tests/unit/test_foir_engine.test.cjs' },
  { name: 'Unit: Lender Policy Engine', command: 'node tests/unit/test_policy_engine.test.cjs' },
  { name: 'Unit: Statement & PII API', command: 'node tests/unit/test_statement_api.test.cjs' },
  { name: 'Unit: HubSpot Signature V3 & Replay Defense', command: 'node tests/unit/test_hubspot_signature.test.cjs' },
  { name: 'Integration: Provider Gateway & DLQ', command: 'node tests/integration/test_integration_gateway.test.cjs' },
  { name: 'Security: DPDP Act Consent & PII Protection', command: 'node tests/security/test_pii_and_consent.test.cjs' },
  { name: 'Workflow: 15-Domain End-to-End Lifecycle', command: 'node tests/workflow/test_loan_workflows.test.cjs' },
  { name: 'Calculators: 20 Pure Financial Tools (65 specs)', command: 'node scripts/test-calculators.js' },
  { name: 'Master: 20 Financial Tools Comprehensive Matrix (206 specs)', command: 'node scripts/testMasterFinancialTools.cjs' }
];

console.log('===================================================================');
console.log('🚀 AVANI LOAN SERVICES — MASTER TEST SUITE EXECUTION');
console.log('===================================================================\n');

let totalPassed = 0;
let totalFailed = 0;

for (const suite of testSuites) {
  console.log(`▶ Running ${suite.name}...`);
  try {
    execSync(suite.command, { cwd: projectRoot, stdio: 'inherit' });
    totalPassed++;
    console.log(`✔ [PASS] ${suite.name}\n`);
  } catch (err) {
    totalFailed++;
    console.error(`✖ [FAIL] ${suite.name}: ${err.message}\n`);
  }
}

console.log('===================================================================');
console.log(`🏁 TEST EXECUTION COMPLETE: ${totalPassed} SUITES PASSED, ${totalFailed} SUITES FAILED`);
console.log('===================================================================');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
