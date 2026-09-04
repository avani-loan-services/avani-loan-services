// src/api/eligibilityWorker.cjs
// Vercel server‑less function that spins up a BullMQ Worker to process any pending eligibility jobs.
// Intended to be invoked (e.g., via a webhook or scheduled request) to consume queued jobs.

const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const MockRedis = require('ioredis-mock');
const path = require('path');

// Redis connection – same fallback as queue.
let connection = new IORedis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});
connection.on('error', (err) => {
  console.warn('Redis connection error in worker, switching to mock:', err.message);
  connection.disconnect();
  connection = new MockRedis();
});

/**
 * Vercel handler – creates a temporary worker, processes any waiting jobs, then returns.
 */
module.exports = async (req, res) => {
  // Lazy‑load the eligibility engine inside the worker to avoid cold‑start overhead on the API entry.
  const eligibilityProcessor = async (job) => {
    const { payload, filePaths } = job.data;
    const { processEligibility } = require(path.resolve(__dirname, '../services/eligibilityEngine.cjs'));
    // The core engine returns the calculation result.
    return await processEligibility(payload, filePaths);
  };

  const worker = new Worker('eligibility', eligibilityProcessor, { connection });

  const processed = [];
  const errors = [];

  // Capture completion/failure events.
  worker.on('completed', (job, result) => {
    processed.push({ jobId: job.id, result });
  });
  worker.on('failed', (job, err) => {
    errors.push({ jobId: job.id, error: err.message || String(err) });
  });

  // Give the worker a short window to pick up any waiting jobs.
  // Vercel functions have a max timeout (typically 10 s), so we keep it brief.
  const waitMs = 4000; // 4 seconds – adjust if needed.
  await new Promise((resolve) => setTimeout(resolve, waitMs));

  // Gracefully shut down the worker and Redis connection.
  await worker.close();
  await connection.quit();

  // Respond with the outcomes of any jobs that finished during this window.
  if (errors.length) {
    res.status(500).json({ success: false, processed, errors });
  } else {
    const message = processed.length ? 'Processed pending jobs' : 'No pending jobs in queue';
    res.status(200).json({ success: true, message, processed });
  }
};
