// scripts/verify_live_database.cjs
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const mongoose = require('mongoose');
const { MongoLead } = require('../src/models/Lead.cjs');

const SYNTHETIC_LEAD_ID = `AUTO-MONGO-SIGNOFF-${Date.now()}`;
const TARGET_CAMPAIGN_ID = 'cmp_business_loan_phase4c_pilot';

async function runLiveDatabaseTest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔬 LIVE PRODUCTION DATABASE SYNTHETIC DURABILITY TEST');
  console.log(`📌 SYNTHETIC LEAD ID: ${SYNTHETIC_LEAD_ID}`);
  console.log('═══════════════════════════════════════════════════════\n');

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('FAILED: MONGODB_URI is not configured');
    process.exit(1);
  }

  // Step 1: Connect & Write
  console.log('▶ STEP 1: Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`  • Connected: readyState = ${mongoose.connection.readyState}`);

  if (mongoose.connection.readyState !== 1) {
    console.error('FAILED: MongoDB Atlas connection readyState != 1');
    process.exit(1);
  }

  console.log('▶ STEP 2: Writing synthetic record with campaign attribution...');
  const written = await MongoLead.create({
    leadId: SYNTHETIC_LEAD_ID,
    fullName: 'AUTO-SYNTHETIC-SIGNOFF',
    mobile: '919999900099',
    email: 'synthetic-signoff@example.invalid',
    city: 'Latur',
    occupation: 'BUSINESS_OWNER',
    incomeRange: '1000000+',
    loanProduct: 'BUSINESS_LOAN',
    requiredLoanAmount: '2500000',
    source: 'WEBSITE',
    campaignId: TARGET_CAMPAIGN_ID,
    campaign: TARGET_CAMPAIGN_ID,
    status: 'NEW_LEAD',
    qualificationStatus: 'QUALIFIED'
  });

  console.log(`  ✅ Written to MongoDB: ${written.leadId} (Campaign: ${written.campaignId})`);

  // Disconnect to prove data survives process termination
  await mongoose.disconnect();
  console.log('  • Disconnected process from MongoDB Atlas.');

  // Step 3: Independent Reconnect & Read
  console.log('\n▶ STEP 3: Reconnecting independently to verify durable persistence...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const fetched = await MongoLead.findOne({ leadId: SYNTHETIC_LEAD_ID });
  if (!fetched) {
    console.error('❌ FAILED: Synthetic record disappeared after disconnect!');
    process.exit(1);
  }

  console.log(`  ✅ Record verified in MongoDB Atlas: ${fetched.leadId}`);
  console.log(`  ✅ Campaign Attribution verified: ${fetched.campaignId}`);

  // Step 4: Delete synthetic test record (clean up)
  console.log('\n▶ STEP 4: Deleting synthetic record to leave 0 residue...');
  const delResult = await MongoLead.deleteOne({ leadId: SYNTHETIC_LEAD_ID });
  console.log(`  ✅ Cleaned up: deletedCount = ${delResult.deletedCount}`);

  // Verify deletion
  const verifyDeleted = await MongoLead.findOne({ leadId: SYNTHETIC_LEAD_ID });
  if (verifyDeleted) {
    console.error('❌ FAILED: Record was not deleted!');
    process.exit(1);
  }
  console.log('  ✅ Confirmed 0 residue remains.');

  await mongoose.disconnect();

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('🎉 LIVE DATABASE DURABILITY TEST: 100% PASSED');
  console.log('═══════════════════════════════════════════════════════');
  process.exit(0);
}

runLiveDatabaseTest().catch(err => {
  console.error('ERROR in live database test:', err.message);
  process.exit(1);
});
