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

async function authenticate(usernameOrEmail, password, ip = '127.0.0.1', userAgent = '') {
  const identifier = (usernameOrEmail || '').trim().toLowerCase();
  if (!identifier || !password) {
    return { success: false, status: 400, message: 'Username/email and password are required.' };
  }

  // Find user by username or email
  const user = db.findOne('admin_users', u =>
    (u.username && u.username.toLowerCase() === identifier) ||
    (u.email && u.email.toLowerCase() === identifier)
  );

  if (!user) {
    db.logAudit(null, 'SYSTEM', 'LOGIN_FAILED_UNKNOWN_USER', { identifier }, ip, userAgent);
    return { success: false, status: 401, message: 'Invalid credentials provided.' };
  }

  if (!user.is_active) {
    db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_FAILED_INACTIVE', { identifier }, ip, userAgent);
    return { success: false, status: 403, message: 'Account is deactivated. Contact Administrator.' };
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
        message: `Account is temporarily locked due to multiple failed login attempts. Try again in ${waitMins} minute(s).`
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
    let message = 'Invalid credentials provided.';

    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      user.lockout_until = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString();
      message = 'Account locked for 15 minutes due to 5 consecutive failed login attempts.';
      db.logAudit(user.user_id, 'SYSTEM', 'ACCOUNT_LOCKED', { identifier }, ip, userAgent);
    } else {
      const attemptsRemaining = MAX_FAILED_ATTEMPTS - user.failed_login_attempts;
      message = `Invalid credentials. ${attemptsRemaining} attempt(s) remaining before account lockout.`;
      db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_FAILED_BAD_PASSWORD', { identifier, attemptsRemaining }, ip, userAgent);
    }
    db.upsert('admin_users', 'user_id', user);
    return { success: false, status: 401, message };
  }

  // Login successful -> reset failed attempts
  user.failed_login_attempts = 0;
  user.lockout_until = null;
  user.last_login = new Date().toISOString();
  db.upsert('admin_users', 'user_id', user);

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      mustChangePassword: user.must_change_password
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

  // Record session
  const session = {
    session_id: `SESS-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    user_id: user.user_id,
    token,
    ip_address: ip,
    user_agent: userAgent,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString()
  };
  db.upsert('admin_sessions', 'session_id', session);

  db.logAudit(user.user_id, 'SYSTEM', 'LOGIN_SUCCESS', { role: user.role, mustChangePassword: user.must_change_password }, ip, userAgent);

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

async function changePassword(userId, currentPassword, newPassword, ip = '127.0.0.1', userAgent = '') {
  const user = db.getById('admin_users', userId);
  if (!user) {
    return { success: false, status: 404, message: 'User not found.' };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    return { success: false, status: 400, message: 'Current password is incorrect.' };
  }

  if (!newPassword || newPassword.length < 8) {
    return { success: false, status: 400, message: 'New password must be at least 8 characters long.' };
  }

  const salt = await bcrypt.genSalt(12);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  user.must_change_password = false;
  user.updated_at = new Date().toISOString();
  db.upsert('admin_users', 'user_id', user);

  db.logAudit(user.user_id, 'SYSTEM', 'PASSWORD_CHANGED', {}, ip, userAgent);

  return { success: true, message: 'Password updated successfully. You can now access all portal functions.' };
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function hasPermission(userRole, permission) {
  if (userRole === 'Super Administrator') return true;
  const userPerms = ROLE_PERMISSIONS[userRole] || [];
  return userPerms.includes('*') || userPerms.includes(permission);
}

module.exports = {
  authenticate,
  changePassword,
  verifyToken,
  hasPermission,
  ROLES,
  ROLE_PERMISSIONS
};
