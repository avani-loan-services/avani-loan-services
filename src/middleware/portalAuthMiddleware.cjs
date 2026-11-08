// src/middleware/portalAuthMiddleware.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED PORTAL AUTHENTICATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

const { verifyToken, isSessionActive, hasPermission } = require('../services/portalAuthService.cjs');

async function requirePortalAuth(req, res, next) {
  let token = null;

  // 1. Check HttpOnly Cookie first
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, c) => {
      const parts = c.trim().split('=');
      if (parts[0] && parts[1]) acc[parts[0]] = parts.slice(1).join('=');
      return acc;
    }, {});
    token = cookies['avani_portal_token'];
  }

  // 2. Authorization header fallback (Bearer <token>)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
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

  // 3. Server-side session verification (if token contains sessionId)
  if (decoded.sessionId) {
    const active = await isSessionActive(decoded.sessionId);
    if (!active) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: 'Session has been revoked or expired. Please log in again.'
      });
    }
  }

  req.portalUser = decoded;
  next();
}

function requirePortalCsrf(req, res, next) {
  // Defense-in-depth CSRF check on state-modifying requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    const requestedWith = req.headers['x-requested-with'] || '';
    const customCsrf = req.headers['x-avani-portal-csrf'] || '';
    const isStandardApi = contentType.includes('application/json') || requestedWith || customCsrf;

    if (!isStandardApi) {
      return res.status(403).json({
        success: false,
        message: 'Security validation failed: Request must specify valid content type or client headers.'
      });
    }
  }
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
  requirePortalCsrf,
  requirePasswordChangeChecked,
  requireRole,
  requirePermission
};
