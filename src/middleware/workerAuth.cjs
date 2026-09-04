// src/middleware/workerAuth.cjs
// ─────────────────────────────────────────────────────────────────
// Internal Worker Authentication Middleware
// ─────────────────────────────────────────────────────────────────

function workerAuthMiddleware(req, res, next) {
  const workerSecret = process.env.INTERNAL_WORKER_SECRET || 'AVANI_WORKER_SECRET_2026';
  const providedAuth = req.headers['x-worker-auth'];

  if (!providedAuth || providedAuth !== workerSecret) {
    console.warn(`[WorkerAuth] Unauthorized worker access attempt from IP: ${req.ip}`);
    return res.status(401).json({
      error: 'UNAUTHORIZED_WORKER',
      message: 'Missing or invalid x-worker-auth header.'
    });
  }

  next();
}

module.exports = {
  workerAuthMiddleware
};
