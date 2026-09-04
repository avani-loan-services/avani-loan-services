// scripts/test_environment_isolation.cjs
const { validateEnvironmentIsolation } = require('../src/config/envValidator.cjs');

async function testEnvironmentIsolation() {
  console.log('[Test] Running Environment Isolation Test...');
  const res = validateEnvironmentIsolation();
  if (!res.isValid) throw new Error('Environment Isolation Validation Failed');
  console.log('✅ Environment Isolation Test Passed');
  return { status: 'PASS', data: res };
}

if (require.main === module) {
  testEnvironmentIsolation().catch(err => {
    console.error('❌ Environment Isolation Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testEnvironmentIsolation };
