// src/models/portalDatabase.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED PORTAL SECURE RELATIONAL STORAGE ENGINE
// Absolute Data Separation: Builder Module (A) vs Education Module (B)
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { isConnected } = require('./database.cjs');
const { getPortalModels } = require('./portalSchemas.cjs');

const DATA_DIR = path.join(__dirname, '../../AVANI_LOAN_SERVICES_UNIFIED_PORTAL/data');

const modelMap = {
  admin_users: 'PortalAdminUser',
  builder_companies: 'PortalBuilderCompany',
  builder_contacts: 'PortalBuilderContact',
  builder_maharera: 'PortalBuilderMahaRera',
  builder_pipeline: 'PortalBuilderPipeline',
  education_institutions: 'PortalEducationInstitution',
  education_contacts: 'PortalEducationContact',
  education_pipeline: 'PortalEducationPipeline',
  education_consent_records: 'PortalEducationConsentRecord',
  unified_tasks: 'PortalUnifiedTask',
  builder_enquiries: 'PortalPublicEnquiry',
  education_enquiries: 'PortalPublicEnquiry',
  admin_audit_logs: 'PortalAdminAuditLog',
  system_automation_state: 'PortalAutomationState'
};

const pkMap = {
  admin_users: 'user_id',
  admin_sessions: 'session_id',
  unified_tasks: 'task_id',
  builder_companies: 'builder_id',
  builder_contacts: 'contact_id',
  builder_maharera: 'rera_id',
  builder_pipeline: 'deal_id',
  builder_activities: 'activity_id',
  builder_enquiries: 'enquiry_id',
  education_institutions: 'institution_id',
  education_contacts: 'contact_id',
  education_funding_profiles: 'profile_id',
  education_pipeline: 'deal_id',
  education_consent_records: 'consent_id',
  education_enquiries: 'enquiry_id'
};

// Ensure storage directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-Memory table registers
const tables = {
  // Shared & Auth
  admin_users: new Map(),
  admin_sessions: new Map(),
  admin_audit_logs: [],
  system_automation_state: {
    state_id: 'GLOBAL_CONFIG',
    stop_active: false,
    stop_triggered_by: null,
    stop_triggered_at: null,
    stop_reason: null,
    email_marketing_active: true,
    whatsapp_marketing_active: true,
    auto_followups_active: true,
    inbound_enquiries_active: true,
    last_sync_timestamp: new Date().toISOString()
  },
  unified_tasks: new Map(),

  // Module A: Maharashtra Builder Partnerships (Strict Isolation)
  builder_companies: new Map(),
  builder_contacts: new Map(),
  builder_maharera: new Map(),
  builder_pipeline: new Map(),
  builder_activities: new Map(),
  builder_enquiries: new Map(),

  // Module B: India Education Institutional Funding (Strict Isolation)
  education_institutions: new Map(),
  education_contacts: new Map(),
  education_funding_profiles: new Map(),
  education_pipeline: new Map(),
  education_consent_records: new Map(),
  education_enquiries: new Map()
};

function getTableFilePath(tableName) {
  return path.join(DATA_DIR, `${tableName}.json`);
}

function persistTable(tableName) {
  try {
    const filePath = getTableFilePath(tableName);
    let payload;
    if (tableName === 'system_automation_state') {
      payload = tables.system_automation_state;
    } else if (Array.isArray(tables[tableName])) {
      payload = tables[tableName];
    } else if (tables[tableName] instanceof Map) {
      payload = Array.from(tables[tableName].values());
    }
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[PortalDB] Failed to persist ${tableName}:`, err.message);
  }
}

function loadTable(tableName) {
  try {
    const filePath = getTableFilePath(tableName);
    if (!fs.existsSync(filePath)) return false;
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (tableName === 'system_automation_state') {
      tables.system_automation_state = data;
    } else if (Array.isArray(tables[tableName])) {
      tables[tableName] = data;
    } else if (tables[tableName] instanceof Map) {
      tables[tableName].clear();
      const pkMap = {
        admin_users: 'user_id',
        admin_sessions: 'session_id',
        unified_tasks: 'task_id',
        builder_companies: 'builder_id',
        builder_contacts: 'contact_id',
        builder_maharera: 'rera_id',
        builder_pipeline: 'deal_id',
        builder_activities: 'activity_id',
        builder_enquiries: 'enquiry_id',
        education_institutions: 'institution_id',
        education_contacts: 'contact_id',
        education_funding_profiles: 'profile_id',
        education_pipeline: 'deal_id',
        education_consent_records: 'consent_id',
        education_enquiries: 'enquiry_id'
      };
      const pk = pkMap[tableName] || 'id';
      for (const item of data) {
        if (item && item[pk]) {
          tables[tableName].set(item[pk], item);
        }
      }
    }
    return true;
  } catch (err) {
    console.error(`[PortalDB] Failed to load table ${tableName}:`, err.message);
    return false;
  }
}

// Initialize tables from disk
function initDatabase() {
  const tableNames = Object.keys(tables);
  for (const name of tableNames) {
    loadTable(name);
  }

  // Ensure default initial administrator account exists
  seedDefaultAdmin();
}

function seedDefaultAdmin() {
  if (tables.admin_users.size === 0) {
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'AvaniAdmin@2026';
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(initialPassword, salt);

    const defaultAdmin = {
      user_id: 'USR-ADMIN-001',
      username: 'admin',
      email: 'admin@avanifinserv.com',
      full_name: 'Avani Executive SuperAdmin',
      password_hash: passwordHash,
      role: 'Super Administrator',
      must_change_password: true,
      failed_login_attempts: 0,
      lockout_until: null,
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: null
    };

    tables.admin_users.set(defaultAdmin.user_id, defaultAdmin);
    persistTable('admin_users');
    console.log('[PortalDB] Initialized default Super Administrator account (Force password change on first login enabled).');
  }
}

// CRUD Helpers
const db = {
  // Generic map queries
  getAll: (tableName) => {
    if (!tables[tableName]) return [];
    if (tables[tableName] instanceof Map) {
      return Array.from(tables[tableName].values());
    }
    return tables[tableName];
  },

  getById: (tableName, id) => {
    if (!tables[tableName]) return null;
    if (tables[tableName] instanceof Map) {
      return tables[tableName].get(id) || null;
    }
    return null;
  },

  find: (tableName, predicate) => {
    if (!tables[tableName]) return [];
    const all = db.getAll(tableName);
    return all.filter(predicate);
  },

  findOne: (tableName, predicate) => {
    const results = db.find(tableName, predicate);
    return results.length > 0 ? results[0] : null;
  },

  upsert: (tableName, pkField, record) => {
    if (!tables[tableName]) throw new Error(`Unknown table: ${tableName}`);
    const id = record[pkField];
    if (!id) throw new Error(`Primary key ${pkField} is required for ${tableName}`);

    const existing = db.getById(tableName, id);
    const now = new Date().toISOString();
    const updated = {
      ...existing,
      ...record,
      updated_at: now
    };
    if (!existing) {
      updated.created_at = updated.created_at || now;
    }

    tables[tableName].set(id, updated);
    persistTable(tableName);

    // Asynchronous dual-write to MongoDB if connected
    try {
      if (isConnected && isConnected()) {
        const models = getPortalModels();
        const modelName = modelMap[tableName];
        if (modelName && models[modelName]) {
          models[modelName].findOneAndUpdate(
            { [pkField]: id },
            { $set: updated },
            { upsert: true }
          ).catch(err => console.warn(`[PortalDB-Mongo] Upsert sync error on ${tableName}:`, err.message));
        }
      }
    } catch (_) {}

    return updated;
  },

  delete: (tableName, id) => {
    if (!tables[tableName] || !(tables[tableName] instanceof Map)) return false;
    const deleted = tables[tableName].delete(id);
    if (deleted) {
      persistTable(tableName);
      try {
        if (isConnected && isConnected()) {
          const models = getPortalModels();
          const modelName = modelMap[tableName];
          const pk = pkMap[tableName] || 'id';
          if (modelName && models[modelName]) {
            models[modelName].deleteOne({ [pk]: id }).catch(err => console.warn(`[PortalDB-Mongo] Delete sync error on ${tableName}:`, err.message));
          }
        }
      } catch (_) {}
    }
    return deleted;
  },

  // Audit Log Entry
  logAudit: (userId, module, action, details = {}, ip = '127.0.0.1', userAgent = 'PortalClient') => {
    const log = {
      log_id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      user_id: userId || 'SYSTEM',
      module, // 'BUILDER', 'EDUCATION', 'SYSTEM', 'AUTOMATION', 'ENQUIRY'
      action,
      details,
      ip_address: ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString()
    };
    tables.admin_audit_logs.unshift(log);
    // Keep max 5000 audit logs
    if (tables.admin_audit_logs.length > 5000) {
      tables.admin_audit_logs = tables.admin_audit_logs.slice(0, 5000);
    }
    persistTable('admin_audit_logs');

    try {
      if (isConnected && isConnected()) {
        const models = getPortalModels();
        if (models.PortalAdminAuditLog) {
          models.PortalAdminAuditLog.create(log).catch(() => {});
        }
      }
    } catch (_) {}

    return log;
  },

  // Automation State
  getAutomationState: () => tables.system_automation_state,
  updateAutomationState: (updates, userId = 'SYSTEM', ip = '127.0.0.1') => {
    tables.system_automation_state = {
      ...tables.system_automation_state,
      ...updates
    };
    persistTable('system_automation_state');
    db.logAudit(userId, 'AUTOMATION', 'UPDATE_AUTOMATION_STATE', updates, ip);

    try {
      if (isConnected && isConnected()) {
        const models = getPortalModels();
        if (models.PortalAutomationState) {
          models.PortalAutomationState.findOneAndUpdate(
            { state_id: 'GLOBAL_CONFIG' },
            { $set: tables.system_automation_state },
            { upsert: true }
          ).catch(() => {});
        }
      }
    } catch (_) {}

    return tables.system_automation_state;
  },

  // Direct persistence trigger
  persist: persistTable,
  init: initDatabase
};

// Initialize right away
initDatabase();

module.exports = db;
