// src/cache.cjs
// Simple in‑memory cache with TTL (time‑to‑live).
// Used by the eligibility endpoint to avoid duplicate Gemini calls.

const cache = new Map(); // key → { value, expiresAt }

function makeKey(payload, filePaths) {
  try {
    return JSON.stringify({ payload, filePaths });
  } catch (e) {
    // Fallback to a random key if serialization fails
    return Math.random().toString(36).substring(2, 15);
  }
}

function getCache(payload, filePaths) {
  const key = makeKey(payload, filePaths);
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCache(payload, filePaths, value, ttlMs = 5 * 60 * 1000) {
  const key = makeKey(payload, filePaths);
  const expiresAt = Date.now() + ttlMs;
  cache.set(key, { value, expiresAt });
}

module.exports = { getCache, setCache };
