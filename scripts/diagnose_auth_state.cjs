// scripts/diagnose_auth_state.cjs
// Forensic inspection of admin user state in disk JSON vs MongoDB Atlas
// NEVER prints password hashes, tokens, secrets or credentials.

const fs = require('fs');
const path = require('path');
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const mongoose = require('mongoose');

async function run() {
  console.log('=== ADMIN AUTH FORENSIC STATE AUDIT ===');
  
  // 1. Inspect Disk File
  const jsonPath = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/admin_users.json');
  console.log('Disk File Path:', jsonPath);
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      console.log('Disk admin_users record count:', data.length);
      data.forEach((u, idx) => {
        console.log(`[Disk User ${idx + 1}]`);
        console.log('  user_id:', u.user_id);
        console.log('  username:', u.username);
        console.log('  email:', u.email);
        console.log('  role:', u.role);
        console.log('  is_active:', u.is_active);
        console.log('  must_change_password:', u.must_change_password);
        console.log('  failed_login_attempts:', u.failed_login_attempts);
        console.log('  lockout_until:', u.lockout_until);
        console.log('  has_password_hash:', Boolean(u.password_hash));
        console.log('  hash_length:', u.password_hash ? u.password_hash.length : 0);
        console.log('  hash_prefix:', u.password_hash ? u.password_hash.substring(0, 7) : 'NONE');
      });
    } catch (err) {
      console.error('Error reading disk file:', err.message);
    }
  } else {
    console.log('Disk file does not exist.');
  }

  // 2. Inspect MongoDB Atlas portal_admin_users
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('No MONGODB_URI found in environment.');
    process.exit(0);
  }

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('\nConnected to MongoDB Atlas successfully.');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections present in DB:', collections.map(c => c.name));

    const adminCol = db.collection('portal_admin_users');
    const mongoUsers = await adminCol.find({}).toArray();
    console.log('MongoDB portal_admin_users record count:', mongoUsers.length);
    mongoUsers.forEach((u, idx) => {
      console.log(`[Mongo User ${idx + 1}]`);
      console.log('  user_id:', u.user_id);
      console.log('  username:', u.username);
      console.log('  email:', u.email);
      console.log('  role:', u.role);
      console.log('  is_active:', u.is_active);
      console.log('  must_change_password:', u.must_change_password);
      console.log('  failed_login_attempts:', u.failed_login_attempts);
      console.log('  lockout_until:', u.lockout_until);
      console.log('  has_password_hash:', Boolean(u.password_hash));
      console.log('  hash_length:', u.password_hash ? u.password_hash.length : 0);
      console.log('  hash_prefix:', u.password_hash ? u.password_hash.substring(0, 7) : 'NONE');
    });

    // Check sessions
    const sessCol = db.collection('portal_admin_sessions');
    const mongoSessCount = await sessCol.countDocuments();
    console.log('MongoDB portal_admin_sessions count:', mongoSessCount);

  } catch (err) {
    console.error('MongoDB check error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('=== END DIAGNOSTIC ===');
  }
}

run();
