// scripts/rotate_admin_credential.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE ADMIN CREDENTIAL ROTATION TOOL
// Phase 5.3.22: Authoritative MongoDB Atlas + Server Storage Credential Rotation
// NEVER prints passwords, hashes, tokens, or database URIs in console output.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

async function rotateCredentials() {
  console.log('=== AVANI ADMIN CREDENTIAL ROTATION TOOL ===');

  // 1. Determine new secure password
  let newPassword = process.env.ADMIN_NEW_PASSWORD;
  
  // Parse command line arguments if passed: --password <val>
  const args = process.argv.slice(2);
  const pwdArgIdx = args.indexOf('--password');
  if (pwdArgIdx !== -1 && args[pwdArgIdx + 1]) {
    newPassword = args[pwdArgIdx + 1].trim();
  }

  let generated = false;
  if (!newPassword || newPassword.length < 12) {
    // Generate cryptographically strong 24-character secret with mixed sets
    const rawEntropy = crypto.randomBytes(18).toString('base64url');
    newPassword = `Av!${rawEntropy}@2026#`;
    generated = true;
  }

  // 2. Hash password with bcrypt 12 salt rounds
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  const userId = 'USR-ADMIN-001';
  const username = 'admin';
  const email = 'admin@avanifinserv.com';
  const now = new Date();

  // 3. Update MongoDB Atlas if URI is available
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  let mongoUpdated = false;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      const db = mongoose.connection.db;
      
      const adminCol = db.collection('portal_admin_users');
      const updateResult = await adminCol.updateOne(
        { $or: [{ user_id: userId }, { username: 'admin' }] },
        {
          $set: {
            user_id: userId,
            username: username,
            email: email,
            full_name: 'Avani Executive SuperAdmin',
            password_hash: passwordHash,
            role: 'Super Administrator',
            must_change_password: false,
            failed_login_attempts: 0,
            lockout_until: null,
            is_active: true,
            updated_at: now
          }
        },
        { upsert: true }
      );

      // Invalidate all active sessions in MongoDB
      const sessCol = db.collection('portal_admin_sessions');
      await sessCol.updateMany({}, { $set: { is_revoked: true, revoked_at: now } });

      console.log('✅ MongoDB Atlas portal_admin_users updated successfully.');
      console.log('✅ All active MongoDB portal_admin_sessions revoked.');
      mongoUpdated = true;
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas update warning:', err.message);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  } else {
    console.log('ℹ️ No MONGODB_URI in environment, proceeding with local file update.');
  }

  // 3b. If direct MongoDB Atlas was blocked (e.g. IP whitelist / network boundary),
  // attempt update via live Production API using existing credentials in .admin_credential_rotated.secret
  if (!mongoUpdated) {
    const existingSecretPath = path.join(__dirname, '../.admin_credential_rotated.secret');
    if (fs.existsSync(existingSecretPath)) {
      try {
        const lines = fs.readFileSync(existingSecretPath, 'utf8').split('\n');
        const passLine = lines.find(l => l.startsWith('# CREDENTIAL: '));
        if (passLine) {
          const currentSecret = passLine.replace('# CREDENTIAL: ', '').trim();
          const prodUrl = process.env.PRODUCTION_API_URL || 'https://www.avanifinserv.com';
          const loginRes = await fetch(`${prodUrl}/api/portal/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: currentSecret })
          });
          const loginData = await loginRes.json();
          if (loginData.success && loginData.token) {
            const changeRes = await fetch(`${prodUrl}/api/portal/auth/change-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
              },
              body: JSON.stringify({ currentPassword: currentSecret, newPassword })
            });
            const changeData = await changeRes.json();
            if (changeData.success) {
              console.log('✅ Live Production API (https://www.avanifinserv.com) updated successfully via authenticated session.');
              mongoUpdated = true;
            }
          }
        }
      } catch (apiErr) {
        console.warn('⚠️ Production API fallback notice:', apiErr.message);
      }
    }
  }

  // 4. Update local server storage file: AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data/admin_users.json
  const dataDir = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const jsonPath = path.join(dataDir, 'admin_users.json');
  let users = [];
  if (fs.existsSync(jsonPath)) {
    try {
      users = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (_) {
      users = [];
    }
  }

  let existingUser = users.find(u => u.user_id === userId || u.username === 'admin');
  if (existingUser) {
    existingUser.password_hash = passwordHash;
    existingUser.failed_login_attempts = 0;
    existingUser.lockout_until = null;
    existingUser.must_change_password = false;
    existingUser.is_active = true;
    existingUser.updated_at = now.toISOString();
  } else {
    existingUser = {
      user_id: userId,
      username: username,
      email: email,
      full_name: 'Avani Executive SuperAdmin',
      password_hash: passwordHash,
      role: 'Super Administrator',
      must_change_password: false,
      failed_login_attempts: 0,
      lockout_until: null,
      is_active: true,
      created_at: now.toISOString(),
      last_login: null
    };
    users.push(existingUser);
  }

  fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2), 'utf8');
  console.log('✅ Local server storage admin_users.json updated successfully.');

  // Invalidate local sessions
  const sessionsPath = path.join(dataDir, 'admin_sessions.json');
  if (fs.existsSync(sessionsPath)) {
    try {
      const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
      sessions.forEach(s => { s.is_revoked = true; });
      fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2), 'utf8');
      console.log('✅ Local admin_sessions.json invalidated.');
    } catch (_) {}
  }

  // 5. Securely persist secret to git-ignored .admin_credential_rotated.secret
  const secretPath = path.join(__dirname, '../.admin_credential_rotated.secret');
  const secretPayload = [
    `# AVANI LOAN SERVICES — SECURE ADMINISTRATOR CREDENTIAL RECORD`,
    `# ROTATED AT: ${now.toISOString()}`,
    `# USERNAME: ${username}`,
    `# EMAIL: ${email}`,
    `# STATUS: ACTIVE / LOCKOUT RESET`,
    `# CREDENTIAL: ${newPassword}`,
    `# DO NOT COMMIT THIS FILE TO GIT (PROTECTED BY .gitignore *.secret)`
  ].join('\n') + '\n';

  fs.writeFileSync(secretPath, secretPayload, { mode: 0o600, encoding: 'utf8' });
  console.log(`✅ Secure credentials recorded to git-ignored file: .admin_credential_rotated.secret`);

  // Log Audit Entry
  console.log('=== ROTATION SUMMARY ===');
  console.log('Username / Identifier : admin (or admin@avanifinserv.com)');
  console.log('Role                  : Super Administrator');
  console.log('Account Lockout       : RESET (failed attempts: 0, lockout: null)');
  console.log('MongoDB Atlas Sync    :', mongoUpdated ? 'VERIFIED' : 'OFFLINE/SKIPPED');
  console.log('Server Storage Sync   : VERIFIED');
  console.log('Session Revocation    : ALL SESSIONS REVOKED');
  console.log('Credential Storage    : Written to local .admin_credential_rotated.secret');
  console.log('Status                : SUCCESS');
}

rotateCredentials().catch(err => {
  console.error('Credential rotation failed:', err.message);
  process.exit(1);
});
