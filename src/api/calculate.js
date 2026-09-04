// src/api/calculate.js
// Vercel Serverless Function – handles loan eligibility calculation via queue/cache

import { getCache, setCache } from '../../cache.js';
import { eligibilityQueue } from '../../queues/eligibilityQueue.cjs';
import rateLimit from 'express-rate-limit';

// Rate limiter – 30 requests per minute per IP (same settings as Express route)
const calculateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Rate limit exceeded – try again later' },
});

export default async function handler(req, res) {
  // Apply rate limiting (Vercel doesn't have built‑in middleware, use manual check)
  await new Promise((resolve) => calculateLimiter(req, res, resolve));
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const payload = JSON.parse(req.body.payload || '{}');
    const filePaths = (req.body.filePaths && Array.isArray(req.body.filePaths))
      ? req.body.filePaths
      : [];
    // Cache check
    const cached = getCache(payload, filePaths);
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }
    // Enqueue job
    const job = await eligibilityQueue.add('process', { payload, filePaths });
    const result = await job.waitUntilFinished();
    setCache(payload, filePaths, result);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[api/calculate] error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
