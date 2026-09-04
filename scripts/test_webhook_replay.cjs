// scripts/test_webhook_replay.cjs
const { registerWebhookEvent } = require('../src/models/WebhookInbox.cjs');

async function testWebhookReplay() {
  console.log('[Test] Running Webhook Replay Test...');
  const eventId = `EVT_REPLAY_TEST_${Date.now()}`;

  const reg1 = await registerWebhookEvent(eventId, 'META_WHATSAPP', { text: 'Hi' });
  const reg2 = await registerWebhookEvent(eventId, 'META_WHATSAPP', { text: 'Hi' });

  if (reg1.isDuplicate || !reg2.isDuplicate) {
    throw new Error('Webhook Replay Test Failed: Duplicate event not detected');
  }

  console.log(`- Event ID: ${eventId}, First Insert: ${!reg1.isDuplicate}, Second Insert Suppressed: ${reg2.isDuplicate}`);
  console.log('✅ Webhook Replay Test Passed');
  return { status: 'PASS', eventId };
}

if (require.main === module) {
  testWebhookReplay().catch(err => {
    console.error('❌ Webhook Replay Test Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testWebhookReplay };
