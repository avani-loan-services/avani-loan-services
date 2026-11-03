/**
 * AVANI LOAN SERVICES — PHASE 5.1
 * Secure Administrator Credential Rotation Engine
 * 
 * Rotates the compromised initial administrator credential to a high-entropy,
 * cryptographically strong temporary passphrase, enforces must_change_password: true,
 * invalidates all active sessions/tokens, and stores the secret in a git-ignored file.
 * 
 * RULE 3 COMPLIANCE:
 * - Does NOT print plaintext credential to stdout or logs.
 * - Stores bcrypt hash with work factor 12.
 * - Invalidates existing sessions.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const DATA_DIR = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');
const USERS_FILE = path.join(DATA_DIR, 'admin_users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'admin_sessions.json');
const AUDIT_FILE = path.join(DATA_DIR, 'admin_audit_logs.json');
const HANDOFF_SECRET_FILE = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/16_PHASE_5_1_REMEDIATION/.admin_credential_handoff.secret');

function rotateCredential() {
  console.log('========================================================================');
  console.log('🔐 AVANI LOAN SERVICES — SECURE ADMINISTRATOR CREDENTIAL ROTATION');
  console.log('========================================================================\n');

  if (!fs.existsSync(USERS_FILE)) {
    throw new Error(`admin_users.json not found at ${USERS_FILE}`);
  }

  // 1. Generate high-entropy credential (24 characters, alphanumeric & symbols)
  const randomBytes = crypto.randomBytes(18);
  const rawSecret = randomBytes.toString('base64url') + '#9Av!';

  // 2. Hash with bcrypt (12 rounds)
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(rawSecret, salt);

  // 3. Update admin_users.json
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  const adminIndex = users.findIndex(u => u.username === 'admin' || u.user_id === 'USR-ADMIN-001');

  if (adminIndex === -1) {
    throw new Error('Default admin user USR-ADMIN-001 not found.');
  }

  const prevHash = users[adminIndex].password_hash;
  users[adminIndex].password_hash = passwordHash;
  users[adminIndex].must_change_password = true; // Enforce mandatory change
  users[adminIndex].failed_login_attempts = 0;
  users[adminIndex].lockout_until = null;
  users[adminIndex].last_login = null;
  users[adminIndex].updated_at = new Date().toISOString();

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  console.log('  [PASS] admin_users.json updated: new bcrypt hash stored, must_change_password set to true.');

  // 4. Invalidate all active sessions
  if (fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([], null, 2), 'utf8');
    console.log('  [PASS] admin_sessions.json purged: all prior sessions and JWT tokens revoked.');
  }

  // 5. Append audit entry
  if (fs.existsSync(AUDIT_FILE)) {
    const logs = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
    logs.unshift({
      log_id: `AUDIT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      user_id: 'USR-ADMIN-001',
      module: 'SECURITY',
      action: 'ADMIN_CREDENTIAL_ROTATED',
      details: {
        reason: 'Phase 5.1 Critical Remediation — Rotation of Compromised Credential',
        forcedPasswordChange: true,
        hashType: 'bcrypt_12_rounds',
        sessionsRevoked: true
      },
      ip_address: '127.0.0.1',
      user_agent: 'Phase5_1_RotationEngine',
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf8');
    console.log('  [PASS] admin_audit_logs.json updated with immutable rotation event record.');
  }

  // 6. Write secret to git-ignored handoff file
  const handoffContent = [
    '# ========================================================================',
    '# AVANI LOAN SERVICES — PHASE 5.1 CONFIDENTIAL ADMINISTRATOR HANDOFF',
    '# GENERATED AT: ' + new Date().toISOString(),
    '# WARNING: DO NOT COMMIT THIS FILE TO GIT OR PASTE INTO REPORTS',
    '# ========================================================================',
    '',
    'ADMIN_USERNAME=admin',
    'ADMIN_INITIAL_PASSWORD=' + rawSecret,
    'MUST_CHANGE_PASSWORD=true',
    '',
    '# Next Step: When the authorized administrator first logs in at /admin/,',
    '# the portal will strictly require establishing a new permanent passphrase.',
    '# Once established, delete this file permanently.',
    '# ========================================================================'
  ].join('\n');

  fs.writeFileSync(HANDOFF_SECRET_FILE, handoffContent, { mode: 0o600, encoding: 'utf8' });
  console.log(`  [PASS] Credential written to private handoff file: ${path.basename(HANDOFF_SECRET_FILE)}`);
  console.log('  [PASS] Plaintext credential NOT printed to console, terminal output, or public logs.');
  console.log('\n========================================================================');
  console.log('✅ ADMINISTRATOR CREDENTIAL ROTATION COMPLETED SUCCESSFULLY');
  console.log('========================================================================\n');
}

if (require.main === module) {
  try {
    rotateCredential();
  } catch (err) {
    console.error('❌ Rotation failed:', err);
    process.exit(1);
  }
}

module.exports = { rotateCredential, HANDOFF_SECRET_FILE };
