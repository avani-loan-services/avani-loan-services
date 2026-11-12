// src/routes/portalAuthRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED PORTAL AUTHENTICATION API ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const { authenticate, changePassword, issueSession, getHashFingerprint, ROLES } = require('../services/portalAuthService.cjs');
const { requirePortalAuth, requireRole } = require('../middleware/portalAuthMiddleware.cjs');
const db = require('../models/portalDatabase.cjs');

const isProductionEnv = () => process.env.NODE_ENV === 'production';

const getRateMax = () => {
  if (isProductionEnv()) return 5;
  const override = Number(process.env.PORTAL_TEST_RATE_MAX);
  if (Number.isFinite(override) && override > 0) return override;
  return process.env.NODE_ENV === 'test' ? 500 : 5;
};

// Rate limiting for login attempts: 5 requests per 15 minutes per IP in production
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.'
  }
});

// Dedicated rate limiter for password changes: 5 requests per 15 minutes per IP in production
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: getRateMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password update attempts from this IP address. Please try again after 15 minutes.'
  }
});

// POST /api/portal/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    const result = await authenticate(username, password, ip, userAgent);
    if (!result.success) {
      return res.status(result.status || 401).json(result);
    }

    // Set HTTP-only secure cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('avani_portal_token', result.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600 * 1000 // 8 hours
    });

    return res.json(result);
  } catch (err) {
    console.error('[PortalAuth] Login Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
});

// GET /api/portal/auth/me
router.get('/me', requirePortalAuth, async (req, res) => {
  let user = null;
  let authSource = 'local_store';

  if (db.isMongoConnected) {
    try {
      const { getPortalModels } = require('../models/portalSchemas.cjs');
      const models = getPortalModels();
      if (models.PortalAdminUser) {
        const mongoUser = await models.PortalAdminUser.findOne({ user_id: req.portalUser.userId }).lean();
        if (mongoUser) {
          user = mongoUser;
          authSource = 'mongodb_atlas';
          if (db.tables && db.tables.admin_users) {
            db.tables.admin_users.set(user.user_id, user);
          }
        }
      }
    } catch (_) {}
  }

  if (!user) {
    user = db.getById('admin_users', req.portalUser.userId);
    if (!user && db.tables && db.tables.admin_users) {
      user = db.tables.admin_users.get(req.portalUser.userId);
    }
  }
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, authenticated: false, message: 'User not found or inactive.' });
  }

  return res.json({
    success: true,
    authenticated: true,
    authSource,
    atlasConnected: Boolean(db.isMongoConnected),
    user: {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      mustChangePassword: user.must_change_password,
      updatedAt: user.updated_at || null,
      hashFingerprint: getHashFingerprint(user.password_hash)
    }
  });
});

// POST /api/portal/auth/change-password
router.post('/change-password', changePasswordLimiter, requirePortalAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    const result = await changePassword(req.portalUser.userId, currentPassword, newPassword, ip, userAgent);
    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    // Create a brand-new active session for the refreshed token while leaving all prior sessions revoked
    const updatedUser = db.getById('admin_users', req.portalUser.userId);
    const { token: refreshedToken } = await issueSession(updatedUser, ip, userAgent);
    result.token = refreshedToken;

    // Refresh cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('avani_portal_token', refreshedToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 3600 * 1000
    });

    return res.json(result);
  } catch (err) {
    console.error('[PortalAuth] Change Password Error:', err.message);
    return res.status(500).json({ success: false, message: 'Internal error while updating password.' });
  }
});

// POST /api/portal/auth/logout
router.post('/logout', requirePortalAuth, async (req, res) => {
  const ip = req.ip || '127.0.0.1';
  const sessionId = req.portalUser?.sessionId;

  if (sessionId) {
    const { revokeSession } = require('../services/portalAuthService.cjs');
    await revokeSession(sessionId);
  }

  db.logAudit(req.portalUser.userId, 'SYSTEM', 'LOGOUT', { sessionId }, ip);

  res.clearCookie('avani_portal_token', { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// User Management (Super Administrator only)
// GET /api/portal/auth/users
router.get('/users', requirePortalAuth, requireRole('Super Administrator'), (req, res) => {
  const users = db.getAll('admin_users').map(u => ({
    userId: u.user_id,
    username: u.username,
    email: u.email,
    fullName: u.full_name,
    role: u.role,
    isActive: u.is_active,
    mustChangePassword: u.must_change_password,
    lastLogin: u.last_login,
    createdAt: u.created_at
  }));
  return res.json({ success: true, users, availableRoles: ROLES });
});

// POST /api/portal/auth/users
router.post('/users', requirePortalAuth, requireRole('Super Administrator'), async (req, res) => {
  try {
    const { username, email, fullName, role, password } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields (username, email, role, password) are required.' });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: `Invalid role. Allowed roles: ${ROLES.join(', ')}` });
    }

    const existing = db.findOne('admin_users', u =>
      u.username.toLowerCase() === username.toLowerCase() ||
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      return res.status(409).json({ success: false, message: 'Username or email already exists.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      user_id: `USR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      full_name: fullName || username,
      password_hash: passwordHash,
      role,
      must_change_password: true,
      failed_login_attempts: 0,
      lockout_until: null,
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: null
    };

    db.upsert('admin_users', 'user_id', newUser);
    db.logAudit(req.portalUser.userId, 'SYSTEM', 'USER_CREATED', { created_user_id: newUser.user_id, role, username });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: {
        userId: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        isActive: newUser.is_active,
        mustChangePassword: newUser.must_change_password
      }
    });
  } catch (err) {
    console.error('[PortalAuth] Create User Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

module.exports = router;
