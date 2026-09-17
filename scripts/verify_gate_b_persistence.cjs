// scripts/verify_gate_b_persistence.cjs
// ─────────────────────────────────────────────────────────────────
// Gate B Two-Process Durable Persistence & Idempotency Verification
// Tests:
// 1. Process A: Write synthetic lead GATE_B_SYNTHETIC_20260916
//    Attributed to cmp_business_loan_phase4c_pilot
//    Register synthetic webhook event GATE_B_SYNTHETIC_EVENT_20260916
// 2. Process A exits (process termination)
// 3. Process B: Independent Node child_process connects to DB
//    Reads GATE_B_SYNTHETIC_20260916
//    Verifies attribution cmp_business_loan_phase4c_pilot
//    Re-registers GATE_B_SYNTHETIC_EVENT_20260916 (tests idempotency / deduplication)
// ─────────────────────────────────────────────────────────────────

const path = require('path');
const dotenv = require('dotenv');

// Load environment in priority order
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { spawnSync } = require('child_process');
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const SYNTHETIC_LEAD_ID = 'GATE_B_SYNTHETIC_20260916';
const SYNTHETIC_EVENT_ID = 'GATE_B_SYNTHETIC_EVENT_20260916';
const TARGET_CAMPAIGN_ID = 'cmp_business_loan_phase4c_pilot';

const mode = process.argv.find(arg => arg.startsWith('--mode='))?.split('=')[1] || 'runner';

// Subprocess Phase A: Write
if (mode === 'write') {
  (async () => {
    const { connectDB, isConnected } = require('../src/models/database.cjs');
    const { MongoLead: LeadModel } = require('../src/models/Lead.cjs');
    const WebhookInbox = require('../src/models/WebhookInbox.cjs');

    console.log('[PROCESS A] Starting write execution...');
    await connectDB();

    const connected = isConnected();
    console.log(`[PROCESS A] MongoDB connected: ${connected} (readyState: ${mongoose.connection.readyState})`);

    if (!connected) {
      console.error('[PROCESS A] FAILED: MongoDB is not connected (readyState != 1). Cannot perform durable write.');
      process.exit(2);
    }

    try {
      // 1. Upsert Synthetic Lead with Campaign Attribution
      const lead = await LeadModel.findOneAndUpdate(
        { leadId: SYNTHETIC_LEAD_ID },
        {
          leadId: SYNTHETIC_LEAD_ID,
          fullName: 'Synthetic Audit Lead Gate B',
          mobile: '919999900001',
          email: 'synthetic.gateb@avaniloan.internal',
          city: 'Latur',
          occupation: 'BUSINESS_OWNER',
          incomeRange: '1000000+',
          loanProduct: 'BUSINESS_LOAN',
          requiredLoanAmount: '2500000',
          source: 'GATE_B_AUDIT',
          campaignId: TARGET_CAMPAIGN_ID,
          campaign: TARGET_CAMPAIGN_ID,
          leadStatus: 'NEW_LEAD',
          qualificationStatus: 'QUALIFIED',
          followUpStatus: 'PENDING',
          communicationStatus: 'CONSENT_RECORDED',
          idempotencyKey: `idemp_${SYNTHETIC_LEAD_ID}`,
          sourceEventId: SYNTHETIC_EVENT_ID,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      console.log(`[PROCESS A] Lead written to MongoDB: ${lead.leadId} (Campaign: ${lead.campaignId})`);

      // 2. Register Webhook Event (First submission)
      const regResult = await WebhookInbox.registerWebhookEvent(SYNTHETIC_EVENT_ID, 'GATE_B_AUDIT', {
        testId: SYNTHETIC_EVENT_ID,
        campaignId: TARGET_CAMPAIGN_ID,
        timestamp: new Date().toISOString()
      });

      console.log(`[PROCESS A] First event registered. Duplicate: ${regResult.isDuplicate}`);
      await mongoose.disconnect();
      console.log('[PROCESS A] Disconnected successfully. Exiting process.');
      process.exit(0);
    } catch (err) {
      console.error('[PROCESS A] Write error:', err.message);
      await mongoose.disconnect();
      process.exit(1);
    }
  })();
}

// Subprocess Phase B: Read & Idempotency
else if (mode === 'read') {
  (async () => {
    const { connectDB, isConnected } = require('../src/models/database.cjs');
    const { MongoLead: LeadModel } = require('../src/models/Lead.cjs');
    const WebhookInbox = require('../src/models/WebhookInbox.cjs');

    console.log('[PROCESS B] Starting read & idempotency execution...');
    await connectDB();

    const connected = isConnected();
    console.log(`[PROCESS B] MongoDB connected: ${connected} (readyState: ${mongoose.connection.readyState})`);

    if (!connected) {
      console.error('[PROCESS B] FAILED: MongoDB is not connected (readyState != 1). Cannot perform durable read.');
      process.exit(2);
    }

    try {
      // 1. Read Lead from MongoDB
      const lead = await LeadModel.findOne({ leadId: SYNTHETIC_LEAD_ID });
      if (!lead) {
        console.error(`[PROCESS B] FAILED: Lead ${SYNTHETIC_LEAD_ID} not found in MongoDB!`);
        process.exit(1);
      }
      console.log(`[PROCESS B] Read Lead: ${lead.leadId}`);
      console.log(`[PROCESS B] Campaign Attribution: ${lead.campaignId || lead.campaign}`);

      if ((lead.campaignId || lead.campaign) !== TARGET_CAMPAIGN_ID) {
        console.error(`[PROCESS B] FAILED: Campaign attribution mismatch: expected ${TARGET_CAMPAIGN_ID}`);
        process.exit(1);
      }

      // 2. Test Idempotency: Re-register the exact same event ID
      const secondReg = await WebhookInbox.registerWebhookEvent(SYNTHETIC_EVENT_ID, 'GATE_B_AUDIT', {
        testId: SYNTHETIC_EVENT_ID,
        replayed: true
      });

      console.log(`[PROCESS B] Second event registration. Duplicate detected: ${secondReg.isDuplicate}`);
      if (!secondReg.isDuplicate) {
        console.error('[PROCESS B] FAILED: Duplicate event was NOT suppressed!');
        process.exit(1);
      }

      await mongoose.disconnect();
      console.log('[PROCESS B] All durable persistence & idempotency tests PASSED.');
      process.exit(0);
    } catch (err) {
      console.error('[PROCESS B] Read/Idempotency error:', err.message);
      await mongoose.disconnect();
      process.exit(1);
    }
  })();
}

// Main Runner: Spawns Process A, waits for termination, then spawns Process B
else {
  (async () => {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🔬 RUNNING GATE B TWO-PROCESS DURABLE PERSISTENCE TEST');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('▶ STEP 1: Launching Process A (MongoDB Write)...');
    const procA = spawnSync(process.execPath, [__filename, '--mode=write'], {
      encoding: 'utf8',
      env: process.env
    });

    console.log(procA.stdout);
    if (procA.stderr) console.error(procA.stderr);

    if (procA.status !== 0) {
      console.log(`❌ PROCESS A TERMINATED WITH CODE ${procA.status}`);
      if (procA.status === 2 || (procA.stderr && procA.stderr.includes('whitelist')) || (procA.stdout && procA.stdout.includes('readyState != 1'))) {
        console.log('\n[DIAGNOSIS] ROOT CAUSE: MONGODB_ATLAS_NETWORK_ACCESS_RESTRICTION');
        console.log('MongoDB Atlas rejected the connection because the client IP is not in the Network Access list.');
      }
      process.exit(procA.status);
    }

    console.log('✅ STEP 1: Process A completed and terminated.\n');

    console.log('▶ STEP 2: Launching Process B in clean, separate Node runtime (MongoDB Read)...');
    const procB = spawnSync(process.execPath, [__filename, '--mode=read'], {
      encoding: 'utf8',
      env: process.env
    });

    console.log(procB.stdout);
    if (procB.stderr) console.error(procB.stderr);

    if (procB.status !== 0) {
      console.log(`❌ PROCESS B TERMINATED WITH CODE ${procB.status}`);
      process.exit(procB.status);
    }

    console.log('✅ STEP 2: Process B read verified data surviving outside process memory.');
    console.log('🎉 DURABLE PERSISTENCE & IDEMPOTENCY TEST: 100% PASSED');
    process.exit(0);
  })();
}
