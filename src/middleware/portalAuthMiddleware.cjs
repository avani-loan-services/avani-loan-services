// src/middleware/portalAuthMiddleware.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED PORTAL AUTHENTICATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

const { verifyToken, hasPermission } = require('../services/portalAuthService.cjs');

function requirePortalAuth(req, res, next) {
  let token = null;

  // 1. Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Cookie fallback
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const [k, v] = c.trim().split('=');
      acc[k] = v;
      return acc;
    }, {});
    token = cookies['avani_portal_token'];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Authentication required. Please login to access the administration portal.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Session has expired or is invalid. Please log in again.'
    });
  }

  req.portalUser = decoded;
  next();
}

function requirePasswordChangeChecked(req, res, next) {
  if (req.portalUser && req.portalUser.mustChangePassword) {
    return res.status(403).json({
      success: false,
      mustChangePassword: true,
      message: 'Password replacement required on initial login before proceeding.'
    });
  }
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.portalUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (req.portalUser.role === 'Super Administrator' || allowedRoles.includes(req.portalUser.role)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of the following roles: ${allowedRoles.join(', ')}`
    });
  };
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.portalUser) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (hasPermission(req.portalUser.role, permission)) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: `Access denied. Missing permission: ${permission}`
    });
  };
}

module.exports = {
  requirePortalAuth,
  requirePasswordChangeChecked,
  requireRole,
  requirePermission
};
