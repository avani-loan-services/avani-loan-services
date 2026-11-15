// scripts/rotate_admin_credential.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — SECURE ADMIN CREDENTIAL ROTATION TOOL (PHASE 5.3.35)
// Authoritative MongoDB Atlas Interactive Administrator Credential Rotation
// Zero plaintext persistence, zero CLI/env password acceptance, strict target
// verification (avani_loan_services_prod / portal_admin_users / USR-ADMIN-001),
// bcrypt cost factor 12, password reuse rejection, and session revocation.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const fs = require('fs');
const path = require('path');

try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const AUTHORISED_TARGET = Object.freeze({
  databaseName: 'avani_loan_services_prod',
  adminCollectionName: 'portal_admin_users',
  sessionCollectionName: 'portal_admin_sessions',
  userId: 'USR-ADMIN-001',
  username: 'admin',
  email: 'admin@avanifinserv.com',
  bcryptCost: 12,
  minPasswordLength: 12
});

const FORBIDDEN_SECRET_FILES = Object.freeze([
  '.admin_credential_rotated.secret',
  '.admin_credential_handoff.secret'
]);

/**
 * Inspects whether legacy plaintext secret files exist in baseDir using
 * boolean fs.existsSync ONLY (never reading or displaying file contents).
 * Legacy files are strictly ignored and never read or written.
 */
function inspectLegacySecretFiles(baseDir = path.join(__dirname, '..')) {
  const detected = [];
  for (const fileName of FORBIDDEN_SECRET_FILES) {
    const fullPath = path.join(baseDir, fileName);
    if (fs.existsSync(fullPath)) {
      detected.push(fileName);
    }
  }
  return {
    legacySecretFilesDetected: detected.length > 0,
    detectedFileNames: detected,
    contentsRead: false,
    filesWritten: 0
  };
}

/**
 * Ensures no password was supplied via CLI flags or environment variables.
 * Never logs the offending argument or variable value.
 */
function validateCliAndEnvSafety(argv = process.argv.slice(2), env = process.env) {
  if (!Array.isArray(argv)) {
    throw new Error('SECURITY_VIOLATION: Invalid argument vector.');
  }
  for (const arg of argv) {
    const normalized = String(arg || '').toLowerCase();
    if (
      normalized === '--password' ||
      normalized === '-p' ||
      normalized.startsWith('--password=') ||
      normalized.startsWith('-p=') ||
      normalized.includes('secret')
    ) {
      throw new Error(
        'SECURITY_VIOLATION: Passing passwords via command-line arguments is prohibited.'
      );
    }
  }

  const forbiddenEnvKeys = [
    'ADMIN_NEW_PASSWORD',
    'ADMIN_PASSWORD',
    'NEW_ADMIN_PASSWORD',
    'ROTATE_ADMIN_PASSWORD'
  ];
  for (const key of forbiddenEnvKeys) {
    if (env && typeof env[key] === 'string' && env[key].length > 0) {
      throw new Error(
        `SECURITY_VIOLATION: Passing passwords via environment variable (${key}) is prohibited.`
      );
    }
  }

  return { safe: true };
}

/**
 * Validates password complexity (>= 12 chars, upper, lower, number, symbol,
 * no whitespace/control chars) without ever echoing or including the password
 * in returned messages or errors.
 */
function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length === 0) {
    return {
      valid: false,
      code: 'EMPTY_OR_INVALID_TYPE',
      reason: 'Password must be a non-empty string.'
    };
  }
  if (password.length < AUTHORISED_TARGET.minPasswordLength) {
    return {
      valid: false,
      code: 'TOO_SHORT',
      reason: `Password must be at least ${AUTHORISED_TARGET.minPasswordLength} characters long.`
    };
  }
  if (password.length > 128) {
    return {
      valid: false,
      code: 'TOO_LONG',
      reason: 'Password must not exceed 128 characters.'
    };
  }
  if (/[\s\x00-\x1F\x7F]/.test(password)) {
    return {
      valid: false,
      code: 'WHITESPACE_OR_CONTROL',
      reason: 'Password must not contain spaces or control characters.'
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      code: 'MISSING_UPPERCASE',
      reason: 'Password must include at least one uppercase letter (A-Z).'
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      code: 'MISSING_LOWERCASE',
      reason: 'Password must include at least one lowercase letter (a-z).'
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      code: 'MISSING_DIGIT',
      reason: 'Password must include at least one numeric digit (0-9).'
    };
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return {
      valid: false,
      code: 'MISSING_SPECIAL',
      reason: 'Password must include at least one special character/symbol.'
    };
  }
  return { valid: true, code: 'STRONG', reason: 'Password meets complexity requirements.' };
}

/**
 * Strictly validates that the target database, collections, and administrator
 * identity match the single authorised production target.
 */
function verifyTargetIdentity(target = {}) {
  if (target.databaseName !== AUTHORISED_TARGET.databaseName) {
    throw new Error(
      `TARGET_DATABASE_REJECTED: Expected database "${AUTHORISED_TARGET.databaseName}", got "${String(target.databaseName || 'unknown')}".`
    );
  }
  if (target.adminCollectionName !== AUTHORISED_TARGET.adminCollectionName) {
    throw new Error(
      `TARGET_COLLECTION_REJECTED: Expected admin collection "${AUTHORISED_TARGET.adminCollectionName}".`
    );
  }
  if (target.sessionCollectionName !== AUTHORISED_TARGET.sessionCollectionName) {
    throw new Error(
      `TARGET_COLLECTION_REJECTED: Expected session collection "${AUTHORISED_TARGET.sessionCollectionName}".`
    );
  }
  if (target.userId !== AUTHORISED_TARGET.userId) {
    throw new Error(
      `TARGET_ADMIN_ID_REJECTED: Expected administrator ID "${AUTHORISED_TARGET.userId}", got "${String(target.userId || 'unknown')}".`
    );
  }
  return true;
}

/**
 * Reads a password from an interactive TTY with zero character echo (no characters
 * or asterisks printed) and returns a Buffer containing UTF-8 bytes so the caller
 * can zero-fill the buffer after hashing.
 */
function promptHiddenPasswordBuffer(promptLabel, io = { stdin: process.stdin, stdout: process.stdout }) {
  const { stdin, stdout } = io;
  if (!stdin || !stdout || !stdin.isTTY || !stdout.isTTY || typeof stdin.setRawMode !== 'function') {
    return Promise.reject(
      new Error(
        'SECURE_INPUT_UNAVAILABLE: Interactive TTY with raw mode is required for no-echo password entry.'
      )
    );
  }

  return new Promise((resolve, reject) => {
    const chunks = [];
    let finished = false;

    const cleanup = () => {
      stdin.removeListener('data', onData);
      stdin.removeListener('error', onError);
      try {
        if (stdin.isTTY) stdin.setRawMode(false);
      } catch (_) {}
      try {
        stdin.pause();
      } catch (_) {}
    };

    const wipeChunks = () => {
      for (const c of chunks) {
        if (Buffer.isBuffer(c)) c.fill(0);
      }
      chunks.length = 0;
    };

    const onError = () => {
      if (finished) return;
      finished = true;
      cleanup();
      wipeChunks();
      reject(new Error('SECURE_INPUT_ERROR: Failed reading from interactive terminal.'));
    };

    const onData = (data) => {
      if (finished) return;
      const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');

      for (let i = 0; i < buf.length; i++) {
        const byte = buf[i];
        // Ctrl+C (0x03) or Ctrl+D (0x04)
        if (byte === 0x03 || byte === 0x04) {
          finished = true;
          cleanup();
          wipeChunks();
          stdout.write('\n');
          reject(new Error('OPERATION_ABORTED: Password entry cancelled by operator.'));
          return;
        }
        // Enter (\r = 0x0d, \n = 0x0a)
        if (byte === 0x0d || byte === 0x0a) {
          finished = true;
          cleanup();
          stdout.write('\n');
          const resultBuffer = Buffer.concat(chunks);
          wipeChunks();
          resolve(resultBuffer);
          return;
        }
        // Backspace (0x08 or 0x7f)
        if (byte === 0x08 || byte === 0x7f) {
          if (chunks.length > 0) {
            const last = chunks.pop();
            if (Buffer.isBuffer(last)) last.fill(0);
          }
          continue;
        }
        const single = Buffer.alloc(1);
        single[0] = byte;
        chunks.push(single);
      }
    };

    stdout.write(promptLabel);
    try {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.on('data', onData);
      stdin.on('error', onError);
    } catch (_) {
      cleanup();
      wipeChunks();
      reject(new Error('SECURE_INPUT_UNAVAILABLE: Unable to enable terminal raw mode.'));
    }
  });
}

/**
 * Core rotation routine operating against an abstract database adapter so that
 * unit tests can verify every security gate in memory without touching production
 * MongoDB, and production execution uses the live Mongoose connection.
 */
async function executeRotationWithAdapter({
  adapter,
  passwordBuffer,
  target = AUTHORISED_TARGET,
  bcryptCost = AUTHORISED_TARGET.bcryptCost
}) {
  let candidatePassword = null;
  let newPasswordHash = null;

  try {
    verifyTargetIdentity(target);

    if (bcryptCost !== 12) {
      throw new Error('INVALID_BCRYPT_COST: Approved bcrypt cost factor of 12 is mandatory.');
    }

    if (!Buffer.isBuffer(passwordBuffer)) {
      throw new Error('INVALID_PASSWORD_BUFFER: Password input must be provided as a Buffer.');
    }

    candidatePassword = passwordBuffer.toString('utf8');

    const strength = validatePasswordStrength(candidatePassword);
    if (!strength.valid) {
      const err = new Error(`WEAK_OR_INVALID_PASSWORD: ${strength.reason}`);
      err.code = strength.code;
      throw err;
    }

    // Verify database identity reported by the adapter
    const connectedDbName = await adapter.getDatabaseName();
    if (connectedDbName !== AUTHORISED_TARGET.databaseName) {
      throw new Error(
        `TARGET_DATABASE_REJECTED: Connected database "${String(connectedDbName)}" does not match "${AUTHORISED_TARGET.databaseName}".`
      );
    }

    const preAdminCount = await adapter.countAdminUsers();
    if (preAdminCount !== 1) {
      throw new Error(
        `ADMIN_COUNT_MISMATCH: Expected exactly 1 administrator record in "${AUTHORISED_TARGET.adminCollectionName}", found ${preAdminCount}.`
      );
    }

    const existingAdmin = await adapter.findAdminByUserId(AUTHORISED_TARGET.userId);
    if (!existingAdmin) {
      throw new Error(
        `TARGET_ADMIN_NOT_FOUND: Administrator "${AUTHORISED_TARGET.userId}" was not found in "${AUTHORISED_TARGET.adminCollectionName}".`
      );
    }

    if (
      existingAdmin.user_id !== AUTHORISED_TARGET.userId ||
      existingAdmin.username !== AUTHORISED_TARGET.username ||
      existingAdmin.email !== AUTHORISED_TARGET.email
    ) {
      throw new Error(
        'TARGET_ADMIN_MISMATCH: Existing administrator record fields do not match the authorised identity.'
      );
    }

    if (existingAdmin.is_active !== true) {
      throw new Error('TARGET_ADMIN_INACTIVE: Target administrator account is not active.');
    }

    // Reject password reuse if previous bcrypt hash is present
    if (typeof existingAdmin.password_hash === 'string' && existingAdmin.password_hash.startsWith('$2')) {
      const isReused = await bcrypt.compare(candidatePassword, existingAdmin.password_hash);
      if (isReused) {
        throw new Error(
          'PASSWORD_REUSE_REJECTED: New password must not match the existing administrator password.'
        );
      }
    }

    // Generate bcrypt hash with cost factor 12
    const salt = await bcrypt.genSalt(bcryptCost);
    newPasswordHash = await bcrypt.hash(candidatePassword, salt);

    if (!/^\$2[abxy]\$12\$/.test(newPasswordHash)) {
      throw new Error('HASH_GENERATION_FAILED: Generated hash did not match bcrypt cost factor 12 format.');
    }

    // Confirm hash verifies against candidatePassword before writing
    const selfVerify = await bcrypt.compare(candidatePassword, newPasswordHash);
    if (!selfVerify) {
      throw new Error('HASH_VERIFICATION_FAILED: Post-hash verification check failed.');
    }

    // Clear plaintext from buffer and local string reference before DB write
    passwordBuffer.fill(0);
    candidatePassword = null;

    const now = new Date();
    const updateResult = await adapter.updateAdminCredential(AUTHORISED_TARGET.userId, {
      password_hash: newPasswordHash,
      failed_login_attempts: 0,
      lockout_until: null,
      must_change_password: false,
      is_active: true,
      updated_at: now
    });

    if (!updateResult || updateResult.matchedCount !== 1) {
      throw new Error('UPDATE_FAILED: Target administrator update did not match exactly 1 record.');
    }

    const postAdminCount = await adapter.countAdminUsers();
    if (postAdminCount !== preAdminCount) {
      throw new Error('ACCOUNT_COUNT_INVARIANT_VIOLATION: Administrator account count changed unexpectedly.');
    }

    const updatedAdmin = await adapter.findAdminByUserId(AUTHORISED_TARGET.userId);
    if (
      !updatedAdmin ||
      updatedAdmin.user_id !== AUTHORISED_TARGET.userId ||
      updatedAdmin.failed_login_attempts !== 0 ||
      updatedAdmin.lockout_until !== null ||
      updatedAdmin.is_active !== true ||
      typeof updatedAdmin.password_hash !== 'string' ||
      !updatedAdmin.password_hash.startsWith('$2b$12$')
    ) {
      throw new Error('POST_UPDATE_VERIFICATION_FAILED: Updated administrator state could not be confirmed.');
    }

    // Revoke all existing sessions for USR-ADMIN-001
    const revokeResult = await adapter.revokeAdminSessions(AUTHORISED_TARGET.userId, now);
    const remainingActiveSessions = await adapter.countActiveAdminSessions(AUTHORISED_TARGET.userId);

    if (remainingActiveSessions !== 0) {
      throw new Error(
        `SESSION_REVOCATION_INCOMPLETE: ${remainingActiveSessions} unrevoked session(s) remain for ${AUTHORISED_TARGET.userId}.`
      );
    }

    return {
      status: 'ROTATION_CONFIRMED',
      database: connectedDbName,
      adminCollection: AUTHORISED_TARGET.adminCollectionName,
      sessionCollection: AUTHORISED_TARGET.sessionCollectionName,
      userId: AUTHORISED_TARGET.userId,
      username: AUTHORISED_TARGET.username,
      email: AUTHORISED_TARGET.email,
      bcryptCost: 12,
      minPasswordLengthEnforced: AUTHORISED_TARGET.minPasswordLength,
      failedLoginAttempts: updatedAdmin.failed_login_attempts,
      lockoutUntil: updatedAdmin.lockout_until,
      isActive: updatedAdmin.is_active,
      mustChangePassword: updatedAdmin.must_change_password,
      adminCountBefore: preAdminCount,
      adminCountAfter: postAdminCount,
      sessionsRevokedModifiedCount: revokeResult ? revokeResult.modifiedCount : 0,
      activeSessionsRemaining: remainingActiveSessions,
      plaintextFilesWritten: 0,
      updatedAt: now.toISOString()
    };
  } finally {
    if (Buffer.isBuffer(passwordBuffer)) {
      passwordBuffer.fill(0);
    }
    candidatePassword = null;
    newPasswordHash = null;
  }
}

/**
 * Builds a Mongoose-backed adapter for production execution.
 */
function createMongooseAdapter(db) {
  const adminCol = db.collection(AUTHORISED_TARGET.adminCollectionName);
  const sessCol = db.collection(AUTHORISED_TARGET.sessionCollectionName);

  return {
    async getDatabaseName() {
      return db.databaseName;
    },
    async countAdminUsers() {
      return adminCol.countDocuments({});
    },
    async findAdminByUserId(userId) {
      return adminCol.findOne({ user_id: userId });
    },
    async updateAdminCredential(userId, fields) {
      return adminCol.updateOne(
        {
          user_id: userId,
          username: AUTHORISED_TARGET.username,
          email: AUTHORISED_TARGET.email
        },
        { $set: fields },
        { upsert: false }
      );
    },
    async revokeAdminSessions(userId, now) {
      return sessCol.updateMany(
        {
          $and: [
            { $or: [{ user_id: userId }, { user_id: { $exists: false } }] },
            { is_revoked: { $ne: true } }
          ]
        },
        {
          $set: {
            is_revoked: true,
            revoked_at: now,
            updated_at: now
          }
        }
      );
    },
    async countActiveAdminSessions(userId) {
      return sessCol.countDocuments({
        $and: [
          { $or: [{ user_id: userId }, { user_id: { $exists: false } }] },
          { is_revoked: { $ne: true } }
        ]
      });
    }
  };
}

/**
 * Interactive CLI entrypoint for production administrator password rotation.
 */
async function runInteractiveCli() {
  validateCliAndEnvSafety(process.argv.slice(2), process.env);

  if (process.env.NODE_ENV === 'test' || process.env.APP_MODE === 'test') {
    throw new Error('TEST_MODE_BLOCK: Interactive production CLI will not execute when NODE_ENV/APP_MODE is "test".');
  }

  const legacyInspection = inspectLegacySecretFiles(path.join(__dirname, '..'));

  const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_URL;
  if (!mongoUri) {
    throw new Error('MISSING_MONGODB_URI: MONGODB_URI environment variable is not configured.');
  }

  console.log('====================================================================');
  console.log(' AVANI LOAN SERVICES — SECURE ADMINISTRATOR CREDENTIAL ROTATION');
  console.log(' Target Database   : avani_loan_services_prod');
  console.log(' Target Collection : portal_admin_users');
  console.log(' Target Admin ID   : USR-ADMIN-001 (admin / admin@avanifinserv.com)');
  console.log(' Security Policy   : Hidden TTY input, bcrypt(12), zero disk secrets');
  if (legacyInspection.legacySecretFilesDetected) {
    console.log(' Legacy Secret File: Ignored (never read or written)');
  }
  console.log('====================================================================');

  let firstBuf = null;
  let confirmBuf = null;

  try {
    firstBuf = await promptHiddenPasswordBuffer('Enter new administrator password (min 12 chars, 16+ recommended, hidden): ');
    confirmBuf = await promptHiddenPasswordBuffer('Confirm new administrator password (hidden): ');

    if (firstBuf.length !== confirmBuf.length || !firstBuf.equals(confirmBuf)) {
      throw new Error('PASSWORD_CONFIRMATION_MISMATCH: Entered passwords did not match.');
    }
    confirmBuf.fill(0);

    // Pre-validate strength before opening database connection
    const strengthCheck = validatePasswordStrength(firstBuf.toString('utf8'));
    if (!strengthCheck.valid) {
      throw new Error(`WEAK_OR_INVALID_PASSWORD: ${strengthCheck.reason}`);
    }

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.db;
    const adapter = createMongooseAdapter(db);

    const summary = await executeRotationWithAdapter({
      adapter,
      passwordBuffer: firstBuf,
      target: AUTHORISED_TARGET,
      bcryptCost: AUTHORISED_TARGET.bcryptCost
    });

    console.log('\n================== NON-SECRET ROTATION SUMMARY ==================');
    console.log('Status                        :', summary.status);
    console.log('Database                      :', summary.database);
    console.log('Admin Collection              :', summary.adminCollection);
    console.log('Administrator ID              :', summary.userId);
    console.log('Username / Email              :', `${summary.username} / ${summary.email}`);
    console.log('Hash Algorithm                : bcrypt (cost factor 12)');
    console.log('Account Active / Must Change  :', `${summary.isActive} / ${summary.mustChangePassword}`);
    console.log('Failed Login Attempts         :', summary.failedLoginAttempts);
    console.log('Lockout Until                 :', summary.lockoutUntil);
    console.log('Admin Count (Before -> After) :', `${summary.adminCountBefore} -> ${summary.adminCountAfter}`);
    console.log('Sessions Revoked              :', summary.sessionsRevokedModifiedCount);
    console.log('Active Sessions Remaining     :', summary.activeSessionsRemaining);
    console.log('Plaintext Files Written       :', summary.plaintextFilesWritten);
    console.log('Updated At (UTC)              :', summary.updatedAt);
    console.log('=================================================================\n');
  } finally {
    if (Buffer.isBuffer(firstBuf)) firstBuf.fill(0);
    if (Buffer.isBuffer(confirmBuf)) confirmBuf.fill(0);
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect();
      } catch (_) {}
    }
  }
}

if (require.main === module) {
  runInteractiveCli().catch((err) => {
    console.error(`[ROTATION_FAILED] ${err && err.message ? err.message : 'Unexpected rotation failure.'}`);
    process.exit(1);
  });
}

module.exports = {
  AUTHORISED_TARGET,
  FORBIDDEN_SECRET_FILES,
  inspectLegacySecretFiles,
  validateCliAndEnvSafety,
  validatePasswordStrength,
  verifyTargetIdentity,
  promptHiddenPasswordBuffer,
  executeRotationWithAdapter,
  createMongooseAdapter
};
