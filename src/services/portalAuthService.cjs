// src/services/portalAuthService.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED PORTAL AUTHENTICATION & RBAC ENGINE
// ─────────────────────────────────────────────────────────────────────────────

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/portalDatabase.cjs');

const JWT_SECRET = process.env.CALCULATOR_SESSION_SECRET || process.env.JWT_SECRET || 'AVANI_PORTAL_SECURE_KEY_2026_@FINSERV';
const TOKEN_EXPIRY = '8h';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const ROLES = [
  'Super Administrator',
  'Administrator',
  'Research Manager',
  'Sales Manager',
  'Sales Executive',
  'Read-Only Analyst'
];

// Permissions map
const ROLE_PERMISSIONS = {
  'Super Administrator': ['*'],
  'Administrator': [
    'builder:read', 'builder:write', 'builder:export', 'builder:delete',
    'education:read', 'education:write', 'education:export', 'education:delete',
    'crm:read', 'crm:write',
    'automation:read', 'automation:write', 'automation:stop',
    'enquiry:read', 'enquiry:write',
    'reports:read', 'reports:export',
    'audit:read'
  ],
  'Research Manager': [
    'builder:read', 'builder:write', 'builder:export',
    'education:read', 'education:write', 'education:export',
    'reports:read', 'reports:export'
  ],
  'Sales Manager': [
    'builder:read', 'builder:write', 'builder:export',
    'education:read', 'education:write', 'education:export',
    'crm:read', 'crm:write',
    'enquiry:read', 'enquiry:write',
    'reports:read', 'reports:export'
  ],
  'Sales Executive': [
    'builder:read', 'builder:write',
    'education:read', 'education:write',
    'crm:read', 'crm:write',
    'enquiry:read', 'enquiry:write'
  ],
  'Read-Only Analyst': [
    'builder:read', 'builder:export',
    'education:read', 'education:export',
    'crm:read',
    'enquiry:read',
    'reports:read', 'reports:export',
    'audit:read'
  ]
};

const DUMMY_BCRYPT_HASH = '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
const UNIFORM_LOGIN_ERROR = 'Invalid credentials or account unavailable.';

async function authenticate(usernameOrEmail, password, ip = '127.0.0.1', userAgent = '') {
  const identifier = (usernameOrEmail || '').trim().toLowerCase();
  if (!identifier || !password) {
    return { success: false, status: 400, message: 'Username/email and password are required.' };
  }

  // 1. Authoritative check in MongoDB Atlas if connected
  let user = null;
  if (db.isMongoConnected) {
    try {
      const { getPortalModels } = require('../models/portalSchemas.cjs');
      const models = getPortalModels();
      if (models.PortalAdminUser) {
        const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const mongoUser = await models.PortalAdminUser.findOne({
          $or: [
            { username: { $regex: new RegExp(`^${escaped}$`, 'i') } },
            { email: { $regex: new RegExp(`^${escaped}$`, 'i') } }
          ]
        }).lean();
        if (mongoUser) {
          user = mongoUser;
          if (db.tables && db.tables.admin_users) {
            db.tables.admin_users.set(user.user_id, user);
          }
        }
      }
    } catch (err) {
      console.warn('[PortalAuth] Atlas user lookup warning:', err.message);
    }
  }

  // 2. Fallback to in-memory/disk store
  if (!user) {
    user = db.findOne('admin_users', u =>
      (u.username && u.username.toLowerCase() === identifier) ||
      (u.email && u.email.toLowerCase() === identifier)
    );
  }

  if (!user) {
    // Burn comparable bcrypt compute time to prevent user-existence timing oracles
    await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
    db.logAudit(null, 'SYSTEM', 'LOGIN_FAILED_UNKNOWN_USER', { identifier }, ip, userAgent);
    return { success: false, status: 401, message: UNIFORM_LOGIN_ERROR };
  }

  if (!user.is_active) {
    await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
    db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_FAILED_INACTIVE', { identifier }, ip, userAgent);
    return { success: false, status: 401, message: UNIFORM_LOGIN_ERROR };
  }

  // Check lockout
  if (user.lockout_until) {
    const lockTime = new Date(user.lockout_until).getTime();
    if (Date.now() < lockTime) {
      const waitMins = Math.ceil((lockTime - Date.now()) / 60000);
      db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_FAILED_LOCKED', { identifier, waitMins }, ip, userAgent);
      return {
        success: false,
        status: 429,
        message: 'Too many failed authentication attempts. Account access temporarily locked; please try again later.'
      };
    } else {
      // Lock expired, reset
      user.lockout_until = null;
      user.failed_login_attempts = 0;
    }
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
    let message = UNIFORM_LOGIN_ERROR;
    let status = 401;

    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      user.lockout_until = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      status = 423;
      message = 'Too many failed authentication attempts. Account access temporarily locked; please try again later.';
      db.logAudit(user.user_id, 'SYSTEM', 'ACCOUNT_LOCKED', { identifier }, ip, userAgent);
    } else {
      const attemptsRemaining = MAX_FAILED_ATTEMPTS - user.failed_login_attempts;
      db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_FAILED_BAD_PASSWORD', { identifier, attemptsRemaining }, ip, userAgent);
    }
    await db.upsertAsync('admin_users', 'user_id', user);
    return { success: false, status, message };
  }

  // Login successful -> reset failed attempts
  user.failed_login_attempts = 0;
  user.lockout_until = null;
  user.last_login = new Date().toISOString();
  await db.upsertAsync('admin_users', 'user_id', user);

  // Create signed session via shared helper
  const { sessionId, token } = await issueSession(user, ip, userAgent);

  db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_SUCCESS', { role: user.role, sessionId, mustChangePassword: user.must_change_password }, ip, userAgent);

  return {
    success: true,
    token,
    user: {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      mustChangePassword: user.must_change_password
    }
  };
}

function getHashFingerprint(passwordHash) {
  if (!passwordHash) return null;
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(passwordHash)).digest('hex').slice(0, 12);
}

async function changePassword(userId, currentPassword, newPassword, ip = '127.0.0.1', userAgent = '') {
  let user = db.getById('admin_users', userId);
  if (db.isMongoConnected) {
    try {
      const { getPortalModels } = require('../models/portalSchemas.cjs');
      const models = getPortalModels();
      if (models.PortalAdminUser) {
        const mongoUser = await models.PortalAdminUser.findOne({ user_id: userId }).lean();
        if (mongoUser) user = mongoUser;
      }
    } catch (_) {}
  }
  if (!user) {
    return { success: false, status: 404, message: 'User not found.' };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    db.logAudit(userId, user.username, 'PASSWORD_CHANGE_FAILED_AUTH', {}, ip, userAgent);
    return { success: false, status: 400, message: 'Unable to verify current credentials.' };
  }

  const hasComplexity = typeof newPassword === 'string' &&
    newPassword.length >= 12 &&
    /[A-Z]/.test(newPassword) &&
    /[a-z]/.test(newPassword) &&
    /[0-9]/.test(newPassword) &&
    /[^A-Za-z0-9]/.test(newPassword);

  if (!hasComplexity) {
    return {
      success: false,
      status: 400,
      message: 'New password must be at least 12 characters and include uppercase, lowercase, number, and symbol.'
    };
  }

  const isReused = newPassword === currentPassword || await bcrypt.compare(newPassword, user.password_hash);
  if (isReused) {
    db.logAudit(userId, user.username, 'PASSWORD_CHANGE_REJECTED_REUSE', {}, ip, userAgent);
    return { success: false, status: 400, message: 'New password must differ from current password.' };
  }

  const salt = await bcrypt.genSalt(12);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  user.must_change_password = false;
  user.failed_login_attempts = 0;
  user.lockout_until = null;
  user.updated_at = new Date().toISOString();
  await db.upsertAsync('admin_users', 'user_id', user);

  // Invalidate all active sessions for this user upon password change (Session Revocation Boundary)
  if (db.tables && db.tables.admin_sessions) {
    for (const [sId, sess] of db.tables.admin_sessions.entries()) {
      if (sess.user_id === userId) {
        sess.is_revoked = true;
        db.tables.admin_sessions.set(sId, sess);
      }
    }
    if (typeof db.persist === 'function') {
      db.persist('admin_sessions');
    }
  }
  if (db.isMongoConnected) {
    try {
      const { getPortalModels } = require('../models/portalSchemas.cjs');
      const models = getPortalModels();
      if (models.PortalAdminSession) {
        await models.PortalAdminSession.updateMany(
          { user_id: userId, is_revoked: false },
          { $set: { is_revoked: true, revoked_at: new Date() } }
        );
      }
    } catch (sErr) {
      console.warn('[PortalAuth] Session revocation notice:', sErr.message);
    }
  }

  db.logAudit(user.user_id, 'SYSTEM', 'PASSWORD_CHANGED', {}, ip, userAgent);

  return {
    success: true,
    message: 'Password updated successfully. All prior sessions revoked.',
    updatedAt: user.updated_at,
    hashFingerprint: getHashFingerprint(user.password_hash)
  };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

async function isSessionActive(sessionId) {
  if (!sessionId) return false;
  // 1. Check in-memory store
  const sess = db.getById('admin_sessions', sessionId);
  if (sess) {
    if (sess.is_revoked) return false;
    if (new Date(sess.expires_at).getTime() < Date.now()) return false;
    return true;
  }
  // 2. Check MongoDB Atlas if connected
  if (db.isMongoConnected) {
    try {
      const { getPortalModels } = require('../models/portalSchemas.cjs');
      const models = getPortalModels();
      if (models.PortalAdminSession) {
        const s = await models.PortalAdminSession.findOne({ session_id: sessionId }).lean();
        if (s) {
          if (s.is_revoked) return false;
          if (new Date(s.expires_at).getTime() < Date.now()) return false;
          if (db.tables && db.tables.admin_sessions) {
            db.tables.admin_sessions.set(sessionId, s);
          }
          return true;
        }
      }
    } catch (_) {}
  }
  return false;
}

async function revokeSession(sessionId) {
  if (!sessionId) return false;
  const sess = db.getById('admin_sessions', sessionId);
  if (sess) {
    sess.is_revoked = true;
    db.upsert('admin_sessions', 'session_id', sess);
  }
  if (db.isMongoConnected) {
    try {
      const { getPortalModels } = require('../models/portalSchemas.cjs');
      const models = getPortalModels();
      if (models.PortalAdminSession) {
        await models.PortalAdminSession.findOneAndUpdate(
          { session_id: sessionId },
          { $set: { is_revoked: true } }
        );
      }
    } catch (_) {}
  }
  return true;
}

/**
 * Issues a new JWT session for a portal user and persists it to local store + MongoDB Atlas.
 */
async function issueSession(user, ip = '127.0.0.1', userAgent = '') {
  const crypto = require('crypto');
  const sessionId = `SESS-${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  const token = jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      sessionId,
      mustChangePassword: Boolean(user.must_change_password)
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  const session = {
    session_id: sessionId,
    user_id: user.user_id,
    token,
    ip_address: ip,
    user_agent: userAgent,
    is_revoked: false,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  };
  await db.upsertAsync('admin_sessions', 'session_id', session);
  return { sessionId, token, session };
}

function hasPermission(userRole, permission) {
  if (userRole === 'Super Administrator') return true;
  const userPerms = ROLE_PERMISSIONS[userRole] || [];
  return userPerms.includes('*') || userPerms.includes(permission);
}

module.exports = {
  authenticate,
  changePassword,
  issueSession,
  verifyToken,
  isSessionActive,
  revokeSession,
  hasPermission,
  getHashFingerprint,
  ROLES,
  ROLE_PERMISSIONS
};

