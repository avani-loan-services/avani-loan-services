/**
 * AVANI LOAN SERVICES — PHASE 5.3.18
 * Pre-Import Production Database Immutable Backup Snapshot
 */

'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { connectDB } = require('../src/models/database.cjs');
const mongoose = require('mongoose');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_DIR = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/02_Backups', `Phase5_3_18_PreImport_${timestamp}`);

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('📦 PHASE 5.3.18: CREATING IMMUTABLE PRE-IMPORT BACKUP SNAPSHOT');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  await connectDB();
  const db = mongoose.connection && mongoose.connection.db;

  const collections = [
    'portal_builder_companies',
    'portal_education_institutions',
    'portal_builder_contacts',
    'portal_education_contacts',
    'portal_builder_maharera',
    'portal_education_consent_records',
    'portal_builder_pipeline',
    'portal_education_pipeline',
    'portal_admin_users',
    'portal_system_automation_state'
  ];

  const manifest = {
    backup_timestamp: new Date().toISOString(),
    database_name: db ? db.databaseName : 'local_json_only',
    collections_backed_up: {}
  };

  if (db) {
    for (const col of collections) {
      const docs = await db.collection(col).find({}).toArray();
      const filePath = path.join(BACKUP_DIR, `${col}.json`);
      fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');
      manifest.collections_backed_up[col] = {
        count: docs.length,
        bytes: fs.statSync(filePath).size
      };
      console.log(`  ✅ Backed up ${col}: ${docs.length} documents (${fs.statSync(filePath).size} bytes)`);
    }
  } else {
    console.log('  ℹ️ MongoDB offline locally, backing up local data JSON files.');
  }

  // Also back up local disk data directory
  const localDataDir = path.join(__dirname, '../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');
  const localBackupDir = path.join(BACKUP_DIR, 'local_data_json');
  fs.mkdirSync(localBackupDir, { recursive: true });
  const dataFiles = fs.readdirSync(localDataDir).filter(f => f.endsWith('.json'));
  for (const df of dataFiles) {
    fs.copyFileSync(path.join(localDataDir, df), path.join(localBackupDir, df));
  }
  console.log(`  ✅ Backed up ${dataFiles.length} local JSON files into snapshot`);

  const manifestPath = path.join(BACKUP_DIR, 'backup_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`\n🎉 Immutable snapshot completed successfully at:\n  ${BACKUP_DIR}`);

  process.exit(0);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
