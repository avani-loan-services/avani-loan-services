import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { connectDB, getDatabaseHealth } = require('../src/models/database.cjs');

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (e) {
    // Isolated graceful fallback
  }

  const dbHealth = getDatabaseHealth();
  res.status(200).json({
    status: dbHealth.connected ? 'OK' : 'DEGRADED',
    service: 'AVANI LOAN SERVICES — AVANI AI CRM',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
}
