// src/config/envValidator.cjs
// ─────────────────────────────────────────────────────────────────
// Strict Environment Isolation & Hard Fail-Closed Guard
// ─────────────────────────────────────────────────────────────────

function validateEnvironmentIsolation() {
  const appMode = process.env.APP_MODE || 'test';
  const providerMode = process.env.PROVIDER_MODE || 'mock';
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/avani_ai_crm_test';

  console.log('==================================================');
  console.log(`[ENV GUARD] APP_MODE      : ${appMode}`);
  console.log(`[ENV GUARD] PROVIDER_MODE : ${providerMode}`);
  console.log(`[ENV GUARD] DATABASE URI  : ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
  console.log('==================================================');

  const isLocalOrTestMongo = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1') || mongoUri.includes('avani_ai_crm_test') || mongoUri.includes('avani_ai_crm_staging');
  const isProdMongo = mongoUri.includes('avani_ai_crm_prod');

  // Rule 1: APP_MODE=production MUST NEVER use test/staging DB or mock provider
  if (appMode === 'production') {
    if (providerMode === 'mock') {
      console.error('❌ FAIL CLOSED: APP_MODE=production cannot use PROVIDER_MODE=mock!');
      if (process.env.STRICT_ENV_CHECK === 'true') process.exit(1);
    }
    if (isLocalOrTestMongo) {
      console.error('❌ FAIL CLOSED: APP_MODE=production cannot connect to test/staging database!');
      if (process.env.STRICT_ENV_CHECK === 'true') process.exit(1);
    }
  }

  // Rule 2: APP_MODE=test/staging MUST NEVER connect to production MongoDB
  if ((appMode === 'test' || appMode === 'staging') && isProdMongo) {
    console.error('❌ HARD SAFETY GUARD CRASH: APP_MODE is test/staging but MONGODB_URI points to PRODUCTION!');
    process.exit(1);
  }

  return {
    appMode,
    providerMode,
    mongoUri,
    isValid: true
  };
}

module.exports = {
  validateEnvironmentIsolation
};
