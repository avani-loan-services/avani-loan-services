/**
 * AVANI LOAN SERVICES — PHASE 5.3.17
 * Authoritative Administrator Password Rotation in MongoDB Atlas & Local Storage
 * 
 * Complies with strict security rules:
 * - Generates high-entropy secret (32+ chars, alphanumeric + symbols).
 * - Hashes with bcrypt (work factor 12).
 * - Authoritatively updates MongoDB Atlas `portal_admin_users`.
 * - Synchronously updates local `admin_users.json`.
 * - Purges all active sessions in `admin_sessions.json`.
 * - Records immutable security audit entry.
 * - Writes strictly to git-ignored `.admin_credential_handoff.secret` (mode 0600).
 * - NEVER prints or logs the plaintext secret.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../src/models/database.cjs');
const mongoose = require('mongoose');

const DATA_DIR = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');
const USERS_FILE = path.join(DATA_DIR, 'admin_users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'admin_sessions.json');
const AUDIT_FILE = path.join(DATA_DIR, 'admin_audit_logs.json');
const HANDOFF_SECRET_FILE = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/16_PHASE_5_1_REMEDIATION/.admin_credential_handoff.secret');

function generateSecureSecret() {
  const bytes = crypto.randomBytes(24);
  return bytes.toString('base64url') + '#Av2026!';
}

async function run() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🔐 PHASE 5.3.17 — AUTHORITATIVE ADMINISTRATOR CREDENTIAL ROTATION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  // 1. Generate fresh high-entropy secret
  const freshSecret = generateSecureSecret();
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(freshSecret, salt);
  const now = new Date().toISOString();

  // 2. Connect to MongoDB Atlas
  await connectDB();
  const db = mongoose.connection.db;

  // 3. Update MongoDB Atlas portal_admin_users
  const mongoRes = await db.collection('portal_admin_users').updateOne(
    { username: 'admin' },
    {
      $set: {
        password_hash: passwordHash,
        must_change_password: false,
        failed_login_attempts: 0,
        lockout_until: null,
        updated_at: now
      }
    },
    { upsert: true }
  );
  console.log(`  ✅ [PASS] Updated MongoDB Atlas 'portal_admin_users' collection (matched: ${mongoRes.matchedCount}, modified: ${mongoRes.modifiedCount})`);

  // 4. Update local admin_users.json
  if (fs.existsSync(USERS_FILE)) {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    const adminIdx = users.findIndex(u => u.username === 'admin' || u.user_id === 'USR-ADMIN-001');
    if (adminIdx !== -1) {
      users[adminIdx].password_hash = passwordHash;
      users[adminIdx].must_change_password = false;
      users[adminIdx].failed_login_attempts = 0;
      users[adminIdx].lockout_until = null;
      users[adminIdx].updated_at = now;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
      console.log('  ✅ [PASS] Synchronized local admin_users.json on disk.');
    }
  }

  // 5. Invalidate all active sessions
  if (fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('  ✅ [PASS] Purged all active sessions from admin_sessions.json.');
  }

  // 6. Write secret to git-ignored handoff file
  const handoffContent = [
    '# ========================================================================',
    '# AVANI LOAN SERVICES — PHASE 5.3.17 CONFIDENTIAL ADMINISTRATOR HANDOFF',
    '# GENERATED AT: ' + now,
    '# WARNING: DO NOT COMMIT THIS FILE TO GIT OR PASTE INTO REPORTS',
    '# ========================================================================',
    '',
    'ADMIN_USERNAME=admin',
    `ADMIN_INITIAL_PASSWORD=${freshSecret}`,
    'LOGIN_URL=https://www.avanifinserv.com/admin',
    'API_LOGIN_URL=https://api.avanifinserv.com/api/portal/auth/login',
    ''
  ].join('\n');

  fs.writeFileSync(HANDOFF_SECRET_FILE, handoffContent, { encoding: 'utf8', mode: 0o600 });
  console.log('  ✅ [PASS] Securely written to .admin_credential_handoff.secret (mode 0600).');

  // 7. Record immutable audit entry
  if (fs.existsSync(AUDIT_FILE)) {
    const logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
    logs.unshift({
      log_id: `AUDIT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      user_id: 'USR-ADMIN-001',
      module: 'SECURITY',
      action: 'ADMIN_CREDENTIAL_ROTATED_PHASE_5_3_17',
      details: {
        reason: 'Phase 5.3.17 Final Production Acceptance — Cryptographic Rotation of Previously Exposed Passphrases',
        hashType: 'bcrypt_12_rounds',
        authoritativeTarget: 'MongoDB Atlas (portal_admin_users) + Local Storage',
        sessionsRevoked: true
      },
      ip_address: '127.0.0.1',
      user_agent: 'Phase5.3.17-AuthoritativeRotation',
      timestamp: now
    });
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
    console.log('  ✅ [PASS] Recorded audit entry in admin_audit_logs.json.');
  }

  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('  AUTHORITATIVE ROTATION COMPLETED SUCCESSFULLY');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  process.exit(0);
}

run().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
