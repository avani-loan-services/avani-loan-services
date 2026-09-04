// scripts/test_ai_agent.cjs
const { processCustomerMessageWithAI } = require('../src/services/avaniAiAgent.cjs');

async function testAiAgent() {
  console.log('[Test] Running AVANI AI Agent Multilingual Test...');
  const res1 = await processCustomerMessageWithAI('नमस्कार');
  const res2 = await processCustomerMessageWithAI('मला डॉक्टर लोन पाहिजे.');
  const res3 = await processCustomerMessageWithAI('माझे उत्पन्न महिन्याला 1 लाख आहे.');

  if (res1.extraction.detectedLanguage !== 'Marathi') throw new Error('Language detection failed');
  if (res2.extraction.extractedFields.profession !== 'DOCTOR') throw new Error('Profession extraction failed');
  if (res3.extraction.extractedFields.monthlyIncome !== '100000') throw new Error('Income extraction failed');

  console.log(`- Language: ${res1.extraction.detectedLanguage}, Profession: ${res2.extraction.extractedFields.profession}, Income: ${res3.extraction.extractedFields.monthlyIncome}`);
  console.log('✅ AVANI AI Agent Test Passed');
  return { status: 'PASS' };
}

if (require.main === module) {
  testAiAgent().catch(err => {
    console.error('❌ AVANI AI Agent Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testAiAgent };
