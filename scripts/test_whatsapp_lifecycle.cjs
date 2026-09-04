// scripts/test_whatsapp_lifecycle.cjs
const { dispatchOutboundWhatsApp, updateMessageStatus, getMessageStatus } = require('../src/services/whatsappProviderEngine.cjs');

async function testWhatsappLifecycle() {
  console.log('[Test] Running WhatsApp Lifecycle Test...');
  const res = await dispatchOutboundWhatsApp({
    toPhone: '919175635165',
    messageText: 'Test Lifecycle Message',
    leadId: 'AVL-20260811-000001',
    correlationId: 'CORR-TEST'
  });

  const msgId = res.providerMessageId;
  updateMessageStatus(msgId, 'SENT');
  updateMessageStatus(msgId, 'DELIVERED');
  updateMessageStatus(msgId, 'READ');

  const finalStatus = getMessageStatus(msgId);
  if (finalStatus.status !== 'READ') throw new Error('WhatsApp Lifecycle Test Failed');

  console.log(`- WAMID: ${msgId}, Final Status: ${finalStatus.status}`);
  console.log('✅ WhatsApp Lifecycle Test Passed');
  return { status: 'PASS', msgId, finalStatus: finalStatus.status };
}

if (require.main === module) {
  testWhatsappLifecycle().catch(err => {
    console.error('❌ WhatsApp Lifecycle Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testWhatsappLifecycle };
