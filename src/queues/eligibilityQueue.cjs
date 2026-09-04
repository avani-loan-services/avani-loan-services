// src/queues/eligibilityQueue.cjs
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const MockRedis = require('ioredis-mock');

// Redis connection – configure via env vars for flexibility.
let connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});
// If the real Redis connection fails, fall back to an in‑memory mock (useful for local dev).
connection.on('error', (err) => {
  console.warn('Redis connection error, switching to in‑memory mock:', err.message);
  connection.disconnect();
  connection = new MockRedis();
});

// Export a single Queue instance that can be shared across the app.
const eligibilityQueue = new Queue('eligibility', { connection });

module.exports = { eligibilityQueue };
