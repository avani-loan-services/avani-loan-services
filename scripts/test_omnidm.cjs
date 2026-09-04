// scripts/test_omnidm.cjs
const { initiateOmnidmCall, processOmnidmCallback } = require('../src/services/omnidmAgent.cjs');

async function testOmnidm() {
  console.log('[Test] Running OmniDM AI Voice Agent Test...');
  const callRes = await initiateOmnidmCall({
    mobile: '919175635165',
    leadId: 'AVL-20260811-000001',
    correlationId: 'CORR-OMNIDM-TEST'
  });

  const cbRes = await processOmnidmCallback({
    call_id: callRes.providerCallId,
    status: 'ANSWERED',
    phone_number: '919175635165',
    metadata: { leadId: 'AVL-20260811-000001', correlationId: 'CORR-OMNIDM-TEST' }
  });

  if (cbRes.postCallAction !== 'SEND_CONSULTATION_OFFER') throw new Error('OmniDM Post-call routing failed');

  console.log(`- Call ID: ${callRes.providerCallId}, Status: ${cbRes.callStatus}, Post-Call Action: ${cbRes.postCallAction}`);
  console.log('✅ OmniDM AI Voice Agent Test Passed');
  return { status: 'PASS' };
}

if (require.main === module) {
  testOmnidm().catch(err => {
    console.error('❌ OmniDM Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testOmnidm };
