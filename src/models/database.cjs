// src/models/database.cjs
// ─────────────────────────────────────────────────────────────────
// Database Connection & MongoDB Client Initialization
// ─────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

let isConnected = false;

// In-Memory Fallback Storage for isolated unit test mode when MongoDB is offline
const inMemoryDb = {
  leads: new Map(),
  conversations: new Map(),
  webhookInbox: new Map(),
  providerLedger: []
};

async function connectDB() {
  if (isConnected) return mongoose.connection;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/avani_ai_crm_test';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] Connected to MongoDB: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
    return mongoose.connection;
  } catch (err) {
    console.warn(`[Database] MongoDB connection failed (${err.message}). Utilizing Isolated In-Memory Storage.`);
    isConnected = false;
    return null;
  }
}

function getInMemoryStore() {
  return inMemoryDb;
}

module.exports = {
  connectDB,
  getInMemoryStore,
  isConnected: () => isConnected
};
