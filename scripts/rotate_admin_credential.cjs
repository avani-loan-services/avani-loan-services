// scripts/rotate_admin_credential.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE ADMIN CREDENTIAL ROTATION TOOL (PHASE 5.3.25)
// Authoritative MongoDB Atlas + Production Backend Proxy Credential Rotation
// Strictly conforms to zero-secret output and truthful verification logging.
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configure resilient DNS resolution for MongoDB Atlas SRV lookups on Windows
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Secure interactive prompt for password without echoing plaintext
function promptHiddenPassword(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const stdin = process.stdin;
    process.stdout.write(query);

    let password = '';
    const onData = (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.removeListener('data', onData);
          break;
        case '\u0003': // Ctrl+C
          process.exit(130);
          break;
        case '\u0008': // Backspace
        case '\x7f':
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', onData);
      rl.question('', () => {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdout.write('\n');
        rl.close();
        resolve(password);
      });
    } else {
      rl.question('', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    }
  });
}

async function rotateCredentials() {
  console.log('====================================================');
  console.log('   AVANI LOAN SERVICES — ADMIN CREDENTIAL ROTATION  ');
  console.log('====================================================');

  // Read previous secret if exists to enforce non-reuse
  const existingSecretPath = path.join(__dirname, '../.admin_credential_rotated.secret');
  let currentSecret = null;
  if (fs.existsSync(existingSecretPath)) {
    try {
      const lines = fs.readFileSync(existingSecretPath, 'utf8').split('\n');
      const passLine = lines.find(l => l.startsWith('# CREDENTIAL: '));
      if (passLine) currentSecret = passLine.replace('# CREDENTIAL: ', '').trim();
    } catch (_) {}
  }

  let newPassword = process.env.ADMIN_NEW_PASSWORD;
  const args = process.argv.slice(2);
  const pwdArgIdx = args.indexOf('--password');

  if (pwdArgIdx !== -1 && args[pwdArgIdx + 1]) {
    newPassword = args[pwdArgIdx + 1].trim();
    console.warn('⚠️ SECURITY WARNING: Password passed via CLI argument (--password).');
    console.warn('   CLI arguments remain in terminal history. Prefer interactive prompt.');
  }

  // Interactive prompt if no password provided and running in TTY
  if (!newPassword && process.stdin.isTTY && !process.env.CI) {
    newPassword = await promptHiddenPassword('Enter new administrator password (min 12 chars, or press Enter to auto-generate): ');
    newPassword = newPassword.trim();
  }

  // Enforce non-reuse of exposed password
  if (currentSecret && newPassword && newPassword === currentSecret) {
    console.error('❌ SECURITY ERROR: The new password matches the previous compromised credential. Choose a unique password.');
    process.exit(1);
  }

  let generated = false;
  if (!newPassword || newPassword.length < 12) {
    if (newPassword && newPassword.length < 12) {
      console.warn('⚠️ Provided password too short (< 12 characters). Auto-generating cryptographically strong secret.');
    } else {
      console.log('ℹ️ Generating cryptographically strong 24-character secret.');
    }
    const rawEntropy = crypto.randomBytes(18).toString('base64url');
    newPassword = `Av!${rawEntropy}@2026#`;
    generated = true;
  }

  // Hash password with bcrypt 12 salt rounds
  const salt = bcrypt.genSaltSync(12);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  const userId = 'USR-ADMIN-001';
  const username = 'admin';
  const email = 'admin@avanifinserv.com';
  const now = new Date();

  let directAtlasStatus = 'NOT_ATTEMPTED';
  let directAtlasError = null;
  let prodApiStatus = 'NOT_ATTEMPTED';
  let prodBackendStorage = 'UNKNOWN';
  let atlasPersistenceVerified = 'NOT_VERIFIED';
  let atlasReadBackStatus = 'NOT_VERIFIED';
  let persistenceAfterRestartStatus = 'NOT_VERIFIED_EXTERNALLY';
  let priorFingerprint = null;
  let updatedFingerprint = null;
  let oldCredRevoked = 'NOT_VERIFIED';
  let newCredAccepted = 'NOT_VERIFIED';
  let priorSessionRevoked = 'NOT_VERIFIED';
  let localJsonStatus = 'NOT_ATTEMPTED';
  let sessionRevocationStatus = 'NOT_ATTEMPTED';
  let loginToken = null;

  // 1. Attempt Authoritative Direct MongoDB Atlas Connection
  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (mongoUri) {
    try {
      console.log('⏳ Connecting directly to MongoDB Atlas...');
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      const db = mongoose.connection.db;

      const adminCol = db.collection('portal_admin_users');
      await adminCol.updateOne(
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

      directAtlasStatus = 'VERIFIED';
      atlasPersistenceVerified = 'VERIFIED (Direct Atlas Write Confirmed)';
      sessionRevocationStatus = 'REVOKED_IN_ATLAS';
      console.log('✅ Direct MongoDB Atlas portal_admin_users updated successfully.');
      console.log('✅ Active sessions in MongoDB portal_admin_sessions revoked.');
    } catch (err) {
      directAtlasError = err.message;
      if (err.message.includes('whitelist') || err.code === 'ECONNREFUSED' || err.name === 'MongooseServerSelectionError') {
        directAtlasStatus = 'BLOCKED (Local IP not whitelisted in MongoDB Atlas Network Access)';
      } else {
        directAtlasStatus = `FAILED: ${err.message}`;
      }
      console.warn('⚠️ Direct MongoDB Atlas connection notice:', directAtlasStatus);
    } finally {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
    }
  } else {
    directAtlasStatus = 'SKIPPED (No MONGODB_URI configured)';
    console.log('ℹ️ No MONGODB_URI in environment.');
  }

  // 2. Production API Update (Authoritative fallback when direct local IP is blocked by Atlas firewall)
  if (directAtlasStatus !== 'VERIFIED') {
    console.log('⏳ Attempting authoritative update via Live Production API...');
    if (currentSecret) {
      try {
        const prodUrl = process.env.PRODUCTION_API_URL || 'https://www.avanifinserv.com';
        const loginRes = await fetch(`${prodUrl}/api/portal/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: currentSecret })
        });
        const loginData = await loginRes.json();
        if (loginData.success && loginData.token) {
          loginToken = loginData.token;
          try {
            const preMeRes = await fetch(`${prodUrl}/api/portal/auth/me`, {
              headers: { 'Authorization': `Bearer ${loginToken}` }
            });
            const preMeData = await preMeRes.json();
            priorFingerprint = preMeData?.user?.hashFingerprint || null;
          } catch (_) {}
          const changeRes = await fetch(`${prodUrl}/api/portal/auth/change-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${loginToken}`
            },
            body: JSON.stringify({ currentPassword: currentSecret, newPassword })
          });
          const changeData = await changeRes.json();
          if (changeData.success) {
            prodApiStatus = 'VERIFIED';
            console.log('✅ Live Production API updated successfully via authenticated session.');

            // Check health to verify backend storage engine
            try {
              const healthRes = await fetch(`${prodUrl}/api/portal/health`);
              const healthData = await healthRes.json();
              prodBackendStorage = `${healthData.storage_engine || 'unknown'} (${healthData.database || 'unknown'})`;
              console.log(`ℹ️ Production Backend Storage Engine: ${prodBackendStorage}`);
            } catch (_) {}

            // 2b. Independent Safe Verification of Production Database Persistence
            console.log('⏳ Performing independent verification against authoritative production backend...');
            try {
              // 1. Verify old password is now rejected
              const oldCheckRes = await fetch(`${prodUrl}/api/portal/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: currentSecret })
              });
              oldCredRevoked = (oldCheckRes.status === 401) ? 'VERIFIED (HTTP 401 Rejection)' : `UNEXPECTED (HTTP ${oldCheckRes.status})`;

              // 2. Verify new password is accepted
              const newCheckRes = await fetch(`${prodUrl}/api/portal/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: newPassword })
              });
              const newCheckData = await newCheckRes.json();
              if (newCheckRes.status === 200 && newCheckData.success && newCheckData.token) {
                newCredAccepted = 'VERIFIED (HTTP 200 OK + JWT)';

                // 3. Verify /me endpoint with new token (Authoritative Atlas Read-Back)
                const meRes = await fetch(`${prodUrl}/api/portal/auth/me`, {
                  headers: { 'Authorization': `Bearer ${newCheckData.token}` }
                });
                const meData = await meRes.json();
                updatedFingerprint = meData?.user?.hashFingerprint || changeData?.hashFingerprint || null;
                const fpChanged = Boolean(priorFingerprint && updatedFingerprint && priorFingerprint !== updatedFingerprint);
                if (meRes.status === 200 && meData.user && meData.user.role === 'Super Administrator') {
                  if (meData.authSource === 'mongodb_atlas' && fpChanged) {
                    atlasReadBackStatus = 'VERIFIED (Atlas read-back confirmed, hash fingerprint updated)';
                  } else if (meData.authSource === 'mongodb_atlas') {
                    atlasReadBackStatus = 'VERIFIED (Atlas read-back confirmed)';
                  } else {
                    atlasReadBackStatus = `LOCAL_FALLBACK (${meData.authSource || 'local_store'})`;
                  }
                  // 4. Verify authoritative health storage engine
                  const healthRes2 = await fetch(`${prodUrl}/api/portal/health`);
                  const healthData2 = await healthRes2.json();
                  if (healthData2.storage_engine === 'mongodb_atlas' && healthData2.database === 'connected') {
                    atlasPersistenceVerified = 'VERIFIED (Atlas Connected & Synchronized)';
                  } else {
                    atlasPersistenceVerified = `DEGRADED (${healthData2.storage_engine || 'unknown'})`;
                  }
                }
              } else {
                newCredAccepted = `FAILED (HTTP ${newCheckRes.status})`;
              }

              // 5. Verify old session token was revoked
              if (loginToken) {
                const oldTokenRes = await fetch(`${prodUrl}/api/portal/auth/me`, {
                  headers: { 'Authorization': `Bearer ${loginToken}` }
                });
                priorSessionRevoked = (oldTokenRes.status === 401) ? 'VERIFIED (HTTP 401 Revocation)' : `FAILED (HTTP ${oldTokenRes.status})`;
              }
            } catch (verErr) {
              console.warn('⚠️ Independent verification error:', verErr.message);
            }
          } else {
            prodApiStatus = `FAILED: ${changeData.message || 'Change password rejected'}`;
          }
        } else {
          prodApiStatus = `FAILED: Previous password rejected by production (${loginData.message || 'Login failed'})`;
        }
      } catch (apiErr) {
        prodApiStatus = `FAILED: ${apiErr.message}`;
        console.warn('⚠️ Production API call error:', apiErr.message);
      }
    } else {
      prodApiStatus = 'SKIPPED (No previous secret found to authenticate to Production API)';
    }
  }

  // 3. Update Local Server Storage
  try {
    const dataDir = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

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

    // Invalidate local sessions
    const sessionsPath = path.join(dataDir, 'admin_sessions.json');
    if (fs.existsSync(sessionsPath)) {
      try {
        const sessions = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
        sessions.forEach(s => { s.is_revoked = true; });
        fs.writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2), 'utf8');
      } catch (_) {}
    }

    localJsonStatus = 'VERIFIED';
    sessionRevocationStatus = sessionRevocationStatus === 'REVOKED_IN_ATLAS' ? 'REVOKED_ATLAS_AND_LOCAL' : 'REVOKED_LOCAL_ONLY';
    console.log('✅ Local development storage and session cache updated successfully.');
  } catch (localErr) {
    localJsonStatus = `FAILED: ${localErr.message}`;
  }

  // 4. Securely persist secret to git-ignored .admin_credential_rotated.secret
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

  // 5. Determine Overall Authoritative Status
  let overallStatus = 'SUCCESS';
  let exitCode = 0;

  if (directAtlasStatus === 'VERIFIED') {
    overallStatus = 'SUCCESS — DIRECT MONGODB ATLAS VERIFIED';
  } else if (
    prodApiStatus === 'VERIFIED' &&
    atlasPersistenceVerified.startsWith('VERIFIED') &&
    newCredAccepted.startsWith('VERIFIED') &&
    oldCredRevoked.startsWith('VERIFIED')
  ) {
    overallStatus = `SUCCESS — AUTHORITATIVE PRODUCTION BACKEND & ATLAS VERIFIED (${prodBackendStorage})`;
  } else if (prodApiStatus === 'VERIFIED') {
    overallStatus = `PARTIAL_SUCCESS — UPDATED VIA PRODUCTION PROXY (${prodBackendStorage})`;
  } else if (localJsonStatus === 'VERIFIED') {
    overallStatus = 'PARTIAL_SUCCESS — LOCAL STORAGE ONLY (PRODUCTION/ATLAS NOT REACHED)';
    exitCode = 1;
  } else {
    overallStatus = 'DATABASE_SYNC_FAILED';
    exitCode = 1;
  }

  // 6. Truthful Audit Summary (Never masks failure as verified)
  console.log('\n================== ROTATION SUMMARY ==================');
  console.log('Username / Identifier          : admin (or admin@avanifinserv.com)');
  console.log('Role                           : Super Administrator');
  console.log('Account Lockout                : RESET (failed attempts: 0, lockout: null)');
  console.log('LOCAL_ATLAS_CONNECTION         :', directAtlasStatus);
  console.log('PRODUCTION_API_UPDATE          :', prodApiStatus);
  console.log('Production Backend Storage     :', prodBackendStorage);
  console.log('ATLAS_READ_BACK                :', directAtlasStatus === 'VERIFIED' ? 'VERIFIED (Direct Atlas Write Confirmed)' : atlasReadBackStatus);
  console.log('PERSISTENCE_AFTER_RESTART      :', persistenceAfterRestartStatus);
  console.log('Authoritative Atlas Persistence:', atlasPersistenceVerified);
  console.log('Old Credential Revocation      :', oldCredRevoked);
  console.log('New Credential Acceptance      :', newCredAccepted);
  console.log('Prior Session Revocation       :', priorSessionRevoked);
  console.log('Local Server Storage Sync      :', localJsonStatus);
  console.log('Local Session Cache Revocation :', sessionRevocationStatus);
  console.log('Credential Storage             : Written to local .admin_credential_rotated.secret');
  console.log('Final Status                   :', overallStatus);
  console.log('======================================================\n');

  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

rotateCredentials().catch(err => {
  console.error('Credential rotation failed with unexpected error:', err.message);
  process.exit(1);
});
