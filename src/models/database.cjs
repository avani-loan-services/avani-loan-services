// src/models/database.cjs
// ─────────────────────────────────────────────────────────────────
// Database Connection & MongoDB Client Initialization for Serverless
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const dns = require('dns');

// Ensure SRV lookups resolve reliably on systems where local DNS forwarder refuses SRV queries
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

// Vercel Serverless global connection & promise cache pattern
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// In-Memory Fallback Storage for isolated unit test mode when MongoDB is offline
const inMemoryDb = {
  leads: new Map(),
  conversations: new Map(),
  webhookInbox: new Map(),
  providerLedger: [],
  counters: new Map()
};

/**
 * Check if active database connection is alive and ready
 */
function isConnected() {
  return Boolean(mongoose.connection && mongoose.connection.readyState === 1);
}

/**
 * Connect to MongoDB with serverless-safe promise caching and error isolation
 */
async function connectDB() {
  // 1. Reuse existing active connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is stale or closed, clear cached connection
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    // Fail fast if no URI is provided; do not spend 3000ms attempting localhost in serverless
    console.warn('[Database] MONGODB_URI is not configured. Utilizing In-Memory Fallback Storage (NOT persistent across serverless invocations).');
    return null;
  }

  // 2. Cache pending connection promise to prevent simultaneous connections during cold starts
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      bufferCommands: false // Fail fast rather than queuing operations indefinitely
    };

    mongoose.set('strictQuery', false);

    cached.promise = mongoose.connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log(`[Database] Connected to MongoDB: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
        cached.conn = mongooseInstance.connection;
        return cached.conn;
      })
      .catch((err) => {
        console.warn(`[Database] MongoDB connection failed (${err.message}). Utilizing Isolated In-Memory Storage.`);
        cached.promise = null;
        cached.conn = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    return null;
  }

  return cached.conn;
}

/**
 * Safely disconnect (useful for test teardown)
 */
async function disconnectDB() {
  if (mongoose.connection && mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cached.conn = null;
  cached.promise = null;
}

function getInMemoryStore() {
  return inMemoryDb;
}

module.exports = {
  connectDB,
  disconnectDB,
  getInMemoryStore,
  isConnected
};
