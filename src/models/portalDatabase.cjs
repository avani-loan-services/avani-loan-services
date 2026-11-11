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
  admin_sessions: 'PortalAdminSession',
  builder_companies: 'PortalBuilderCompany',
  builder_contacts: 'PortalBuilderContact',
  builder_maharera: 'PortalBuilderMahaRera',
  builder_pipeline: 'PortalBuilderPipeline',
  education_institutions: 'PortalEducationInstitution',
  education_contacts: 'PortalEducationContact',
  education_funding_profiles: 'PortalEducationFundingProfile',
  education_pipeline: 'PortalEducationPipeline',
  education_consent_records: 'PortalEducationConsentRecord',
  unified_tasks: 'PortalUnifiedTask',
  builder_enquiries: 'PortalPublicEnquiry',
  education_enquiries: 'PortalPublicEnquiry',
  admin_audit_logs: 'PortalAdminAuditLog',
  system_automation_state: 'PortalAutomationState',
  portal_templates: 'PortalTemplate',
  portal_campaigns: 'PortalCampaign',
  portal_leads: 'PortalLead'
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
  education_enquiries: 'enquiry_id',
  portal_templates: 'template_id',
  portal_campaigns: 'campaign_id',
  portal_leads: 'lead_id'
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
  education_enquiries: new Map(),

  // Module C: Templates, Campaigns & Leads (Phase 5.3.19)
  portal_templates: new Map(),
  portal_campaigns: new Map(),
  portal_leads: new Map()
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
        education_enquiries: 'enquiry_id',
        portal_templates: 'template_id',
        portal_campaigns: 'campaign_id',
        portal_leads: 'lead_id'
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
  seedDefaultTemplates();
  seedDefaultCampaigns();
  seedDefaultLeads();
}

function seedDefaultAdmin() {
  if (tables.admin_users.size === 0) {
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || require('crypto').randomBytes(16).toString('base64url') + '#Av9!';
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

function seedDefaultTemplates() {
  const defaultTemplates = [
    {
      template_id: 'TPL-WABA-001',
      meta_id: null,
      name: 'als_lead_qualification_v1',
      display_name: 'Retail Loan Pre-Approval Eligibility (WhatsApp)',
      channel: 'WhatsApp',
      category: 'MARKETING',
      language: 'en',
      header: 'Avani Loan Services — Instant Eligibility',
      body: 'Hello {{1}}, thank you for inquiring about a {{2}} with Avani Loan Services. Your provisional borrowing eligibility is calculated up to {{3}}. Would you like to review lender offers and document requirements?',
      footer: 'RBI Registered NBFC & Banking Partner Desk | Latur, Maharashtra',
      buttons: ['View Offers', 'Speak to Advisor', 'Opt-out'],
      variables: ['1', '2', '3'],
      variable_labels: ['Customer Name', 'Loan Type', 'Eligibility Amount'],
      sample_values: { '1': 'Sachin Patil', '2': 'Home Loan', '3': '₹45,00,000' },
      meta_approval_status: 'NOT_VERIFIED',
      synced_from_meta: false,
      quality_score: 'UNKNOWN',
      verification_note: 'Local blueprint — requires Meta Graph API System User Token to verify live WABA approval status.',
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      template_id: 'TPL-WABA-002',
      meta_id: null,
      name: 'als_builder_apf_desk_v1',
      display_name: 'Builder APF Tie-up & Home Loan Desk (WhatsApp)',
      channel: 'WhatsApp',
      category: 'UTILITY',
      language: 'en',
      header: 'Builder Partnership & APF Desk',
      body: 'Dear {{1}}, team Avani Loan Services wishes to establish an on-site Home Loan desk for {{2}} in {{3}}. We partner with 30+ leading banks & HFCs for fast buyer sanctions and APF approvals. When can we schedule a 10-minute briefing?',
      footer: 'Avani Loan Services Corporate Partnerships Desk',
      buttons: ['Schedule Briefing', 'View Builder Deck', 'Decline'],
      variables: ['1', '2', '3'],
      variable_labels: ['Executive Name', 'Company Name', 'City'],
      sample_values: { '1': 'Mr. Abhishek Lodha', '2': 'Macrotech Developers (Lodha)', '3': 'Mumbai' },
      meta_approval_status: 'NOT_VERIFIED',
      synced_from_meta: false,
      quality_score: 'UNKNOWN',
      verification_note: 'Local blueprint — requires Meta Graph API System User Token to verify live WABA approval status.',
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      template_id: 'TPL-WABA-003',
      meta_id: null,
      name: 'als_school_infra_funding_v1',
      display_name: 'School Campus Expansion LAP (WhatsApp)',
      channel: 'WhatsApp',
      category: 'UTILITY',
      language: 'en',
      header: 'Institutional Education Financing Desk',
      body: 'Respected {{1}}, Avani Loan Services arranges structured term debt from ₹5 Cr to ₹10 Cr for campus expansion and classroom infrastructure for {{2}}. Would you like to review lender debt parameters for your upcoming capex?',
      footer: 'Avani Institutional Lending Desk | Mumbai & Maharashtra',
      buttons: ['Request Parameter Sheet', 'Opt-out'],
      variables: ['1', '2'],
      variable_labels: ['Trustee/Chairman Name', 'Institution Name'],
      sample_values: { '1': 'Mr. Rustom Kerawalla', '2': 'VIBGYOR High Group of Schools' },
      meta_approval_status: 'NOT_VERIFIED',
      synced_from_meta: false,
      quality_score: 'UNKNOWN',
      verification_note: 'Local blueprint — requires Meta Graph API System User Token to verify live WABA approval status.',
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      template_id: 'TPL-WABA-004',
      meta_id: null,
      name: 'als_college_university_capex_v1',
      display_name: 'College & University Capex Term Debt (WhatsApp)',
      channel: 'WhatsApp',
      category: 'UTILITY',
      language: 'en',
      header: 'Higher Education Institutional Banking Desk',
      body: 'Respected {{1}}, Avani Loan Services structures long-tenure institutional capex & equipment finance (₹5 Cr - ₹10 Cr) for {{2}} in {{3}}. May we share our institutional debt advisory sheet?',
      footer: 'Avani Loan Services Institutional Desk | Latur & Mumbai',
      buttons: ['Share Advisory Note', 'Request Call', 'Opt-out'],
      variables: ['1', '2', '3'],
      variable_labels: ['Chancellor/President Name', 'University/College Name', 'City'],
      sample_values: { '1': 'Shri Amrish R. Patel', '2': 'SVKM NMIMS University', '3': 'Mumbai' },
      meta_approval_status: 'NOT_VERIFIED',
      synced_from_meta: false,
      quality_score: 'UNKNOWN',
      verification_note: 'Local blueprint — requires Meta Graph API System User Token to verify live WABA approval status.',
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      template_id: 'TPL-EMAIL-001',
      meta_id: null,
      name: 'als_builder_mou_partnership_email',
      display_name: 'Corporate Builder Partnership MOU Proposal (Email)',
      channel: 'Email',
      category: 'PARTNERSHIP',
      language: 'en',
      header: 'Partnership Proposal: Exclusive Home Loan & APF Desk for {{1}}',
      body: 'Dear {{2}},\n\nAvani Loan Services is pleased to present our Builder Partnership Program for {{1}} in {{3}}.\n\nKey Partnership Deliverables:\n1. Dedicated On-Site / Virtual Home Loan Desk\n2. Empaneled with 30+ Leading Private, PSU Banks & HFCs\n3. Accelerated APF (Advance Processing Facility) tie-ups\n4. Transparent Referral Structure & SLA-backed Buyer Sanctions\n\nWe look forward to formalizing our mutual MOU.\n\nWarm regards,\nAvani Loan Services Alliances Team\n+91 9175635165 | partnerships@avanifinserv.com',
      footer: 'Old Barshi Road, 5 no Chauk, KulswaminiNagar, Latur-413531, Maharashtra',
      buttons: ['Download Partnership Deck', 'Schedule Meeting'],
      variables: ['1', '2', '3'],
      variable_labels: ['Company Name', 'Decision Maker Name', 'City'],
      sample_values: { '1': 'Godrej Properties', '2': 'Mr. Pirojsha Godrej', '3': 'Mumbai' },
      meta_approval_status: 'N/A (Email)',
      synced_from_meta: false,
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      template_id: 'TPL-EMAIL-002',
      meta_id: null,
      name: 'als_college_university_capex_email',
      display_name: 'Higher Education Structured Capex Debt (Email)',
      channel: 'Email',
      category: 'INSTITUTIONAL',
      language: 'en',
      header: 'Institutional Capex & Structured Term Debt Advisory for {{1}}',
      body: 'Respected {{2}},\n\nAvani Loan Services provides specialized institutional debt advisory for premier higher education campuses.\n\nFinancing Scope:\n- Campus Building Expansion & Lab Infrastructure (₹5 Cr - ₹10 Cr)\n- Long-tenure Secured LAP on Freehold Institutional Land\n- Working Capital Overdraft against Tuition Fee Receivables\n\nWe would welcome an opportunity to present a term-sheet advisory note.\n\nSincerely,\nAvani Institutional Banking Division\n+91 9175635165 | institutional@avanifinserv.com',
      footer: 'Avani Loan Services Institutional Desk',
      buttons: ['Request Advisory Note', 'Opt-out'],
      variables: ['1', '2'],
      variable_labels: ['Institution Name', 'Chancellor/Chairman Name'],
      sample_values: { '1': 'SVKM NMIMS University', '2': 'Shri Amrish R. Patel' },
      meta_approval_status: 'N/A (Email)',
      synced_from_meta: false,
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      template_id: 'TPL-SMS-001',
      meta_id: null,
      name: 'als_loan_application_sms',
      display_name: 'Loan Application Status Notice (SMS)',
      channel: 'SMS',
      category: 'TRANSACTIONAL',
      language: 'en',
      header: 'Avani Loan Application Update',
      body: 'Dear {{1}}, your loan application ref {{2}} has been received at Avani Loan Services. A dedicated loan advisor will contact you within 2 business hours. Support: +919175635165.',
      footer: 'Avani Loan Services',
      buttons: [],
      variables: ['1', '2'],
      variable_labels: ['Applicant Name', 'Application ID'],
      sample_values: { '1': 'Sachin Shinde', '2': 'ALS-APP-2026-8910' },
      meta_approval_status: 'N/A (SMS)',
      synced_from_meta: false,
      local_status: 'Active',
      created_by: 'system',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  if (tables.portal_templates.size === 0) {
    defaultTemplates.forEach(t => tables.portal_templates.set(t.template_id, t));
    persistTable('portal_templates');
    console.log('[PortalDB] Initialized 7 seed communication templates (unverified local blueprints).');
  } else {
    // Reconcile existing seed templates: ensure no unverified seed template claims 'APPROVED' without synced_from_meta === true
    let modified = false;
    for (const def of defaultTemplates) {
      const existing = tables.portal_templates.get(def.template_id);
      if (!existing) {
        tables.portal_templates.set(def.template_id, def);
        modified = true;
      } else if (existing.channel === 'WhatsApp' && !existing.synced_from_meta && existing.meta_approval_status === 'APPROVED') {
        existing.meta_approval_status = 'NOT_VERIFIED';
        existing.synced_from_meta = false;
        existing.verification_note = def.verification_note;
        existing.variable_labels = def.variable_labels || existing.variables;
        existing.variables = def.variables;
        tables.portal_templates.set(def.template_id, existing);
        modified = true;
      }
    }
    // Remove stale Phase 5.3.19 automated test dummy records if present
    for (const [id, tpl] of tables.portal_templates.entries()) {
      if (tpl.name && tpl.name.startsWith('test_phase_5_3_19_tpl')) {
        tables.portal_templates.delete(id);
        modified = true;
      }
    }
    if (modified) {
      persistTable('portal_templates');
      console.log('[PortalDB] Reconciled seed templates to prevent unverified Meta approval claims.');
    }
  }
}

function seedDefaultCampaigns() {
  if (tables.portal_campaigns.size === 0) {
    const defaultCampaigns = [
      {
        campaign_id: 'CMP-2026-BLD-01',
        name: 'Maharashtra Top 80 Builders APF & Home Loan Tie-Up Drive',
        objective: 'Builder APF & Loan Desk Partnership',
        channel: 'WhatsApp',
        target_segment: 'BUILDERS_80',
        target_segment_desc: 'Top 80 Maharashtra Builder & Developer Enterprises',
        template_id: 'TPL-WABA-002',
        status: 'Validation',
        total_audience: 80,
        eligible_audience: 80,
        suppressed_count: 0,
        consent_verified: true,
        dry_run_executed: true,
        dry_run_summary: {
          executed_at: '2026-11-06T10:00:00Z',
          provider_mode: 'mock',
          total_target_records: 80,
          suppressed_opt_outs: 0,
          validated_eligible_records: 80,
          template_applied: 'Builder APF Tie-up & Home Loan Desk (WhatsApp)',
          variables_validated: true,
          live_messages_dispatched: 0,
          status: 'SUCCESSFUL_SIMULATION',
          result_message: 'Dry Run Verified: 80/80 recipients eligible. 0 live dispatches (Mock Mode active).'
        },
        approval_status: 'Pending Owner Sign-off',
        approval_by: null,
        scheduled_date: '2026-11-15',
        notes: 'Targeting 80 verified Maharashtra enterprise builder headquarters across 10 cities.',
        created_by: 'admin',
        created_at: '2026-11-01T10:00:00Z',
        updated_at: '2026-11-06T10:00:00Z'
      },
      {
        campaign_id: 'CMP-2026-SCH-01',
        name: 'K-12 School Groups ₹5-10 Cr Infrastructure Financing',
        objective: 'School Campus Expansion LAP',
        channel: 'Email',
        target_segment: 'SCHOOLS_24',
        target_segment_desc: 'K-12 School Chains & Educational Trusts (24 Campuses)',
        template_id: 'TPL-EMAIL-002',
        status: 'Draft',
        total_audience: 24,
        eligible_audience: 24,
        suppressed_count: 0,
        consent_verified: true,
        dry_run_executed: false,
        dry_run_summary: null,
        approval_status: 'Draft',
        approval_by: null,
        scheduled_date: '2026-11-20',
        notes: 'Targeting managing trustees and founder chairpersons for school expansion debt.',
        created_by: 'admin',
        created_at: '2026-11-03T11:30:00Z',
        updated_at: '2026-11-03T11:30:00Z'
      },
      {
        campaign_id: 'CMP-2026-COL-01',
        name: 'Autonomous & Deemed Colleges Capex Debt Outreach',
        objective: 'Higher Education Term Debt',
        channel: 'Email',
        target_segment: 'COLLEGES_56',
        target_segment_desc: 'Colleges, Autonomous Institutes & Universities (56 Campuses)',
        template_id: 'TPL-EMAIL-002',
        status: 'Draft',
        total_audience: 56,
        eligible_audience: 56,
        suppressed_count: 0,
        consent_verified: true,
        dry_run_executed: false,
        dry_run_summary: null,
        approval_status: 'Draft',
        approval_by: null,
        scheduled_date: '2026-11-25',
        notes: 'Capex funding for engineering, medical, and autonomous university campuses.',
        created_by: 'admin',
        created_at: '2026-11-05T09:15:00Z',
        updated_at: '2026-11-05T09:15:00Z'
      },
      {
        campaign_id: 'CMP-2026-RET-01',
        name: 'Latur & Marathwada Retail Loan Applicant Follow-up',
        objective: 'Retail Lead Qualification',
        channel: 'WhatsApp',
        target_segment: 'RETAIL_LEADS',
        target_segment_desc: 'Verified Retail Loan Inquiries & Prospects',
        template_id: 'TPL-WABA-001',
        status: 'Awaiting Approval',
        total_audience: 45,
        eligible_audience: 45,
        suppressed_count: 0,
        consent_verified: true,
        dry_run_executed: true,
        dry_run_summary: {
          executed_at: '2026-11-06T14:00:00Z',
          provider_mode: 'mock',
          total_target_records: 45,
          suppressed_opt_outs: 0,
          validated_eligible_records: 45,
          template_applied: 'Retail Loan Pre-Approval Eligibility (WhatsApp)',
          variables_validated: true,
          live_messages_dispatched: 0,
          status: 'SUCCESSFUL_SIMULATION',
          result_message: 'Dry Run Verified: 45/45 leads eligible. 0 live dispatches (Mock Mode active).'
        },
        approval_status: 'Pending Owner Sign-off',
        approval_by: null,
        scheduled_date: '2026-11-10',
        notes: 'Qualified retail loan prospects in Latur and surrounding regions.',
        created_by: 'admin',
        created_at: '2026-11-06T14:00:00Z',
        updated_at: '2026-11-06T14:00:00Z'
      }
    ];

    defaultCampaigns.forEach(c => tables.portal_campaigns.set(c.campaign_id, c));
    persistTable('portal_campaigns');
    console.log('[PortalDB] Initialized 4 verified seed campaigns in mock mode.');
  }
}

function seedDefaultLeads() {
  if (tables.portal_leads.size === 0) {
    const defaultLeads = [
      {
        lead_id: 'ALS-LD-2026-001',
        name: 'Rajesh Narayan Deshmukh',
        phone: '+91 98220 14892',
        email: 'rajesh.deshmukh@gmail.com',
        city: 'Latur',
        loan_type: 'Home Loan',
        amount: 3500000,
        status: 'qualified',
        score: 765,
        created_at: '2026-11-05T08:30:00Z'
      },
      {
        lead_id: 'ALS-LD-2026-002',
        name: 'Dr. Sneha Milind Joshi',
        phone: '+91 94231 87210',
        email: 'dr.sneha.joshi@clinic.org',
        city: 'Pune',
        loan_type: 'Doctor Loan',
        amount: 7500000,
        status: 'qualified',
        score: 810,
        created_at: '2026-11-05T10:15:00Z'
      },
      {
        lead_id: 'ALS-LD-2026-003',
        name: 'Mahesh Trading Corporation',
        phone: '+91 98901 23456',
        email: 'mahesh.kulkarni@trading.in',
        city: 'Solapur',
        loan_type: 'Business Loan',
        amount: 5000000,
        status: 'pending',
        score: 720,
        created_at: '2026-11-05T11:45:00Z'
      },
      {
        lead_id: 'ALS-LD-2026-004',
        name: 'Venkatesh Balaji Agro Industries',
        phone: '+91 97654 32109',
        email: 'venkatesh.agro@gmail.com',
        city: 'Nanded',
        loan_type: 'Loan Against Property (LAP)',
        amount: 12000000,
        status: 'qualified',
        score: 780,
        created_at: '2026-11-06T09:20:00Z'
      },
      {
        lead_id: 'ALS-LD-2026-005',
        name: 'Pooja Anand Shinde',
        phone: '+91 91756 89234',
        email: 'pooja.shinde@techcorp.com',
        city: 'Mumbai',
        loan_type: 'Personal Loan',
        amount: 1500000,
        status: 'qualified',
        score: 790,
        created_at: '2026-11-06T14:10:00Z'
      },
      {
        lead_id: 'ALS-LD-2026-006',
        name: 'Aditya Ramesh Patil',
        phone: '+91 93256 78123',
        email: 'aditya.patil@outlook.com',
        city: 'Chhatrapati Sambhajinagar',
        loan_type: 'Education Loan',
        amount: 4000000,
        status: 'pending',
        score: 740,
        created_at: '2026-11-07T08:45:00Z'
      }
    ];

    defaultLeads.forEach(l => tables.portal_leads.set(l.lead_id, l));
    persistTable('portal_leads');
    console.log('[PortalDB] Initialized default retail & commercial loan leads.');
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

    // In production mode, authoritative cloud storage must be online to prevent silent data loss
    if (process.env.NODE_ENV === 'production' && (!isConnected || !isConnected())) {
      const err = new Error('Database service unavailable: Authoritative persistent cloud storage is offline.');
      err.statusCode = 503;
      err.status = 503;
      throw err;
    }

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

  upsertAsync: async (tableName, pkField, record) => {
    const updated = db.upsert(tableName, pkField, record);
    if (isConnected && isConnected()) {
      const models = getPortalModels();
      const modelName = modelMap[tableName];
      if (modelName && models[modelName]) {
        await models[modelName].findOneAndUpdate(
          { [pkField]: updated[pkField] },
          { $set: updated },
          { upsert: true }
        );
      }
    }
    return updated;
  },

  delete: (tableName, id) => {
    if (!tables[tableName] || !(tables[tableName] instanceof Map)) return false;

    // In production mode, authoritative cloud storage must be online to prevent silent data loss
    if (process.env.NODE_ENV === 'production' && (!isConnected || !isConnected())) {
      const err = new Error('Database service unavailable: Authoritative persistent cloud storage is offline.');
      err.statusCode = 503;
      err.status = 503;
      throw err;
    }

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
    // In production mode, authoritative cloud storage must be online to prevent silent state loss
    if (process.env.NODE_ENV === 'production' && (!isConnected || !isConnected())) {
      const err = new Error('Database service unavailable: Authoritative persistent cloud storage is offline.');
      err.statusCode = 503;
      err.status = 503;
      throw err;
    }

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
  init: initDatabase,
  syncFromAtlas,
  tables,
  get isMongoConnected() {
    return typeof isConnected === 'function' ? isConnected() : Boolean(isConnected);
  }
};

async function syncFromAtlas() {
  if (!isConnected || !isConnected()) return false;
  try {
    const models = getPortalModels();
    
    // 1. Authoritative Admin Users Sync
    if (models.PortalAdminUser) {
      const users = await models.PortalAdminUser.find({}).lean();
      if (users && users.length > 0) {
        tables.admin_users.clear();
        for (const u of users) {
          tables.admin_users.set(u.user_id, u);
        }
        persistTable('admin_users');
        console.log(`[PortalDB] Synchronized ${users.length} authoritative admin user(s) from MongoDB Atlas.`);
      } else if (tables.admin_users.size > 0) {
        for (const u of tables.admin_users.values()) {
          await models.PortalAdminUser.findOneAndUpdate({ user_id: u.user_id }, { $set: u }, { upsert: true });
        }
        console.log('[PortalDB] Initialized MongoDB Atlas portal_admin_users from local store.');
      }
    }

    // 2. Active Sessions Sync
    if (models.PortalAdminSession) {
      const now = new Date();
      const sessions = await models.PortalAdminSession.find({ is_revoked: { $ne: true }, expires_at: { $gt: now } }).lean();
      tables.admin_sessions.clear();
      for (const s of sessions) {
        tables.admin_sessions.set(s.session_id, s);
      }
    }

    // 3. Automation State Sync
    if (models.PortalAutomationState) {
      const state = await models.PortalAutomationState.findOne({ state_id: 'GLOBAL_CONFIG' }).lean();
      if (state) {
        tables.system_automation_state = { ...tables.system_automation_state, ...state };
      }
    }

    // 4. Clean stale test pollution in portal_templates and reconcile genuine blueprints
    if (models.PortalTemplate) {
      await models.PortalTemplate.deleteMany({ name: { $regex: /^test_phase_5_3_19_tpl/ } });
      const atlasTpls = await models.PortalTemplate.find({}).lean();
      for (const t of atlasTpls) {
        if (t && t.template_id) {
          const clean = { ...t };
          delete clean._id;
          delete clean.__v;
          // Guard against legacy hardcoded APPROVED without genuine Meta sync
          if (clean.channel === 'WhatsApp' && !clean.synced_from_meta && clean.meta_approval_status === 'APPROVED') {
            clean.meta_approval_status = 'NOT_VERIFIED';
          }
          tables.portal_templates.set(clean.template_id, clean);
        }
      }
      // Push local/seed templates that aren't in Atlas yet
      const atlasIds = new Set(atlasTpls.map(t => t.template_id));
      for (const localTpl of tables.portal_templates.values()) {
        if (!atlasIds.has(localTpl.template_id)) {
          await models.PortalTemplate.findOneAndUpdate(
            { template_id: localTpl.template_id },
            { $set: localTpl },
            { upsert: true }
          );
        }
      }
      persistTable('portal_templates');
    }

    // 5. Reconcile Campaigns & Leads with Atlas
    const reconcileCollection = async (tableName, modelKey, pk) => {
      const Model = models[modelKey];
      if (!Model) return;
      const atlasDocs = await Model.find({}).lean();
      const atlasMap = new Map();
      for (const doc of atlasDocs) {
        if (doc && doc[pk]) {
          const clean = { ...doc };
          delete clean._id;
          delete clean.__v;
          atlasMap.set(clean[pk], clean);
          tables[tableName].set(clean[pk], clean);
        }
      }
      for (const localDoc of tables[tableName].values()) {
        if (!atlasMap.has(localDoc[pk])) {
          await Model.findOneAndUpdate({ [pk]: localDoc[pk] }, { $set: localDoc }, { upsert: true });
        }
      }
      persistTable(tableName);
    };

    await reconcileCollection('portal_campaigns', 'PortalCampaign', 'campaign_id');
    await reconcileCollection('portal_leads', 'PortalLead', 'lead_id');
    await reconcileCollection('builder_companies', 'PortalBuilderCompany', 'builder_id');
    await reconcileCollection('education_institutions', 'PortalEducationInstitution', 'institution_id');
    await reconcileCollection('education_consent_records', 'PortalEducationConsentRecord', 'consent_id');

    return true;
  } catch (err) {
    console.warn('[PortalDB] Atlas synchronization warning:', err.message);
    return false;
  }
}

// Initialize right away
initDatabase();

module.exports = db;

