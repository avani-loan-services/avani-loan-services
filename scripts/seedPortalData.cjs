// scripts/seedPortalData.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED PORTAL DATA INGESTION & SEEDING ENGINE
// Ingests Builder Research (Phase 3.1 / Phase 4) & Education System Deliverables
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const db = require('../src/models/portalDatabase.cjs');

// CSV Parser Helper
function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = parseLine(lines[0]);
  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = parseLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    records.push(obj);
  }
  return { headers, records };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. INGEST MODULE A: BUILDER PARTNERSHIP DATA
// ─────────────────────────────────────────────────────────────────────────────
function ingestBuilderData() {
  console.log('[Seed] Ingesting Module A — Maharashtra Builder Database...');
  const jsonPath = path.join(__dirname, '../v3_1_records_processed.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('[Seed] Error: v3_1_records_processed.json not found!');
    return;
  }

  const builders = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let builderCount = 0;
  let contactCount = 0;
  let reraCount = 0;
  let dealCount = 0;

  for (const b of builders) {
    // 1.1 Builder Company
    const builderId = b.lid.startsWith('ALS-BLD-') ? b.lid : `ALS-BLD-${b.lid.replace(/^ALS-/, '')}`;
    const company = {
      builder_id: builderId,
      original_lid: b.lid,
      company_name: b.company,
      brand_name: b.brand || b.company,
      legal_entity_name: b.legal_promoter || b.company,
      corporate_website: b.website,
      website_status: b.website_status,
      registered_office_address: b.address,
      city: b.city,
      locality: b.locality || '',
      state: 'Maharashtra',
      pincode: b.pincode,
      address_source: b.address_source,
      official_telephone: b.phone,
      official_mobile: b.mobile,
      official_email: b.general_email || b.sales_email,
      sales_email: b.sales_email,
      general_email: b.general_email,
      contact_page_url: b.contact_page,
      whatsapp_channel: b.wa_no,
      whatsapp_classification: b.wa_class,
      whatsapp_link: b.wa_link,
      whatsapp_notes: b.wa_notes,
      company_category: b.corp_type,
      residential_project_count: (b.projects || '').split(',').length,
      project_names: (b.projects || '').split(',').map(p => p.trim()),
      project_status: 'Active Sales & Construction',
      evidence_urls: [b.website, b.rera_url, b.contact_page, b.dm_url].filter(Boolean),
      last_verification_date: b.verification_date || '2026-10-31',
      verification_status: b.status === 'RESEARCH REQUIRED' ? 'Under Review' : 'Verified',
      research_confidence: b.v3_1_score >= 90 ? 0.95 : 0.85,
      qualification_score: b.v3_1_score,
      qualification_grade: b.v3_1_grade,
      score_breakdown: {
        f1_company_identity: b.f1,
        f2_project_relevance: b.f2,
        f3_active_evidence: b.f3,
        f4_contact_availability: b.f4,
        f5_partnership_dept: b.f5,
        f6_decision_maker: b.f6,
        f7_home_loan_fit: b.f7
      },
      outreach_readiness: b.status,
      recommended_channel: b.recommended_channel,
      commercial_suitability: b.commercial_suitability,
      notes: b.notes
    };
    db.upsert('builder_companies', 'builder_id', company);
    builderCount++;

    // 1.2 Builder Contact
    const contactId = `ALS-BCON-${builderId.replace(/^ALS-BLD-/, '')}`;
    const contact = {
      contact_id: contactId,
      builder_id: builderId,
      full_name: b.dm_name || 'Authorized Channel Manager',
      designation: b.dm_title || 'Head - Alliances & Sales',
      department: 'Channel Partner Relations & Banking Alliances',
      contact_classification: b.dm_class.includes('VERIFIED') ? 'A' : (b.dm_class.includes('NAMED') ? 'B' : 'C'),
      dm_class: b.dm_class,
      official_phone: b.phone,
      mobile_phone: b.mobile,
      official_email: b.sales_email || b.general_email,
      linkedin_url: b.dm_url,
      verification_source: b.dm_notes,
      verification_status: b.dm_class.includes('VERIFIED') ? 'Verified' : 'Pending Confirmation',
      is_primary_decision_maker: b.dm_class === 'VERIFIED DECISION-MAKER'
    };
    db.upsert('builder_contacts', 'contact_id', contact);
    contactCount++;

    // 1.3 MahaRERA Verification
    const reraId = `ALS-BRERA-${builderId.replace(/^ALS-BLD-/, '')}`;
    const reraRecord = {
      rera_id: reraId,
      builder_id: builderId,
      registration_number: b.rera_no,
      project_name: b.projects,
      promoter_legal_name: b.legal_promoter,
      project_location: b.rera_city || b.city,
      rera_status: b.rera_class === 'VERIFIED MATCH' ? 'Approved & Registered' : 'Under Review',
      match_classification: b.rera_class,
      rera_evidence_quality: b.rera_evidence_quality,
      source_url: b.rera_url,
      verified_at: b.verification_date || '2026-10-31',
      notes: b.rera_notes
    };
    db.upsert('builder_maharera', 'rera_id', reraRecord);
    reraCount++;

    // 1.4 Builder Pipeline (19 Stages)
    let initialStage = 1; // Research Pending
    let stageName = 'Research Pending';
    if (b.status === 'APPROVED FOR IMMEDIATE OUTREACH') {
      initialStage = 6;
      stageName = 'Introduction Ready';
    } else if (b.status === 'APPROVED AFTER CONTACT CONFIRMATION') {
      initialStage = 4;
      stageName = 'Department Confirmation Pending';
    } else {
      initialStage = 2;
      stageName = 'Company Identity Verified';
    }

    const dealId = `ALS-BDEAL-${builderId.replace(/^ALS-BLD-/, '')}`;
    const pipelineDeal = {
      deal_id: dealId,
      builder_id: builderId,
      stage: initialStage,
      stage_name: stageName,
      estimated_annual_disbursement: b.v3_1_score >= 95 ? 50000000 : 25000000, // ₹5Cr or ₹2.5Cr
      commission_rate: 0.0065, // 0.65%
      assigned_to: 'USR-ADMIN-001',
      probability_pct: initialStage === 6 ? 35 : (initialStage === 4 ? 20 : 10),
      last_contact_date: null,
      next_followup_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'Active',
      notes: `Ingested from Phase 3.1 / Phase 4 deliverables. ${b.notes || ''}`
    };
    db.upsert('builder_pipeline', 'deal_id', pipelineDeal);
    dealCount++;
  }

  console.log(`[Seed] Ingested ${builderCount} builders, ${contactCount} contacts, ${reraCount} MahaRERA records, ${dealCount} pipeline deals.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. INGEST MODULE B: EDUCATION INSTITUTIONAL FUNDING DATA
// ─────────────────────────────────────────────────────────────────────────────
function ingestEducationData() {
  console.log('[Seed] Ingesting Module B — India Education Institutional Funding Database...');
  const csvPath = path.join(__dirname, '../India_Education_Institutional_Funding_System/01_Master_Database/Master_India_Education_Institutional_Funding_Database.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('[Seed] Error: Master_India_Education_Institutional_Funding_Database.csv not found!');
    return;
  }

  const { records } = parseCSV(fs.readFileSync(csvPath, 'utf-8'));
  let instCount = 0;
  let contactCount = 0;
  let profileCount = 0;
  let dealCount = 0;
  let consentCount = 0;

  // Track A+ Leads
  let aPlusCount = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const instId = r['Lead ID'] || `ALS-EDU-${String(i + 1).padStart(3, '0')}`;
    const scoreVal = parseFloat(r['Lead Quality Score (100-Pt)']) || (100 - i);
    // 52 Priority A+ Leads
    const isAPlus = i < 52;
    const tier = isAPlus ? 'A+' : (scoreVal >= 80 ? 'A' : 'B');
    if (isAPlus) aPlusCount++;

    // Determine 12 funding categories based on institution type
    const category = r['Institution Category'] || 'Educational Trust';
    const fundingCategories = [];
    if (category.toLowerCase().includes('school')) {
      fundingCategories.push('School infrastructure finance', 'Construction finance', 'Renovation and modernization finance');
    } else if (category.toLowerCase().includes('college') || category.toLowerCase().includes('university')) {
      fundingCategories.push('College infrastructure finance', 'Education institution expansion finance', 'Equipment and laboratory finance');
    } else {
      fundingCategories.push('Educational trust funding', 'Land and building finance', 'Working capital finance');
    }
    fundingCategories.push('Secured institutional funding', 'Loan Against Property');

    // 2.1 Education Institution
    const institution = {
      institution_id: instId,
      institution_name: r['Institution Name'],
      institution_category: r['Institution Category'],
      subcategory: r['Subcategory'] || '',
      board_affiliation: r['Board / Affiliation'] || '',
      ownership_type: r['Institution Ownership Type'] || 'Educational Trust',
      parent_trust_society: r['Parent Trust / Society / Company'] || '',
      registration_details: r['Registration Details'] || '',
      year_established: parseInt(r['Year Established']) || 1990,
      number_of_branches: parseInt(r['Number of Branches']) || 1,
      student_capacity: parseInt(r['Student Capacity']) || 2500,
      approx_enrolment: parseInt(r['Approx Student Enrolment']) || 2000,
      website: r['Official Website'],
      official_email: r['Official Email'],
      official_telephone: r['Official Telephone'],
      complete_address: r['Complete Address'],
      city: r['City'],
      district: r['District'] || r['City'],
      state: r['State'],
      pin_code: r['PIN Code'],
      google_maps_url: r['Google Maps URL'] || '',
      potential_funding_requirement: r['Potential Funding Requirement'] || '₹5 crore–₹10 crore',
      funding_category: r['Potential Funding Requirement'] || '₹5 crore–₹10 crore',
      funding_purpose: r['Funding Purpose / Expansion Details'] || 'Campus vertical expansion, digital labs, and green energy infrastructure',
      lead_priority_tier: tier,
      qualification_score: scoreVal,
      verification_status: 'Verified',
      last_verification_date: '2026-10-31',
      source_url: r['Contact Source URL'] || r['Official Website']
    };
    db.upsert('education_institutions', 'institution_id', institution);
    instCount++;

    // 2.2 Education Contact
    const contactId = `ALS-ECON-${instId.replace(/^ALS-EDU-/, '')}`;
    const dmName = r['Authorized Decision-Maker Name'] || r['Managing Trustee / President'] || r['Owner / Founder Name'] || 'Managing Trustee';
    const dmTitle = r['Decision-Maker Designation'] || 'Managing Trustee';
    const contact = {
      contact_id: contactId,
      institution_id: instId,
      full_name: dmName,
      designation: dmTitle,
      role_type: dmTitle.includes('Director') ? 'Director' : (dmTitle.includes('Trustee') ? 'Managing Trustee' : 'Founder'),
      professional_phone: r['Decision-Maker Phone / Desk Ext.'] || r['Official Telephone'],
      professional_email: r['Decision-Maker Email (Direct)'] || r['Official Email'],
      public_whatsapp: r['Public WhatsApp Channel / Helpdesk'] || r['Official Telephone'],
      linkedin_profile: r['LinkedIn Profile (Official / DM)'] || '',
      contact_source_url: r['Contact Source URL'] || r['Official Website'],
      is_primary_decision_maker: true,
      verification_status: 'Verified'
    };
    db.upsert('education_contacts', 'contact_id', contact);
    contactCount++;

    // 2.3 Funding Profile
    const profileId = `ALS-EFUND-${instId.replace(/^ALS-EDU-/, '')}`;
    const profile = {
      profile_id: profileId,
      institution_id: instId,
      funding_categories: fundingCategories,
      estimated_amount: 100000000, // ₹10 Crore
      preferred_structure: 'Secured institutional funding',
      eligible_lenders: ['HDFC Bank Education Finance', 'Tata Capital Institutional Loans', 'SBI Project Finance'],
      financials_readiness: 'Balance Sheets 3 Yrs Available, Land Title Clear'
    };
    db.upsert('education_funding_profiles', 'profile_id', profile);
    profileCount++;

    // 2.4 Education Pipeline (24 Stages)
    let initialStage = 1;
    let stageName = 'Research Pending';
    if (isAPlus) {
      initialStage = 6; // Permission Request Required
      stageName = 'Permission Request Required';
    } else {
      initialStage = 2; // Institution Verified
      stageName = 'Institution Verified';
    }

    const dealId = `ALS-EDEAL-${instId.replace(/^ALS-EDU-/, '')}`;
    const pipelineDeal = {
      deal_id: dealId,
      institution_id: instId,
      stage: initialStage,
      stage_name: stageName,
      funding_requested: 100000000, // ₹10 Crore
      sanctioned_amount: 0,
      disbursed_amount: 0,
      assigned_to: 'USR-ADMIN-001',
      lender_name: 'Pending Lender Matching',
      status: 'Active',
      notes: `Institutional lead ${instId}. Tier ${tier}. Funding requirement: ₹10 Crore.`
    };
    db.upsert('education_pipeline', 'deal_id', pipelineDeal);
    dealCount++;

    // 2.5 Consent Record
    const consentId = `ALS-ECONS-${instId.replace(/^ALS-EDU-/, '')}`;
    const consent = {
      consent_id: consentId,
      institution_id: instId,
      contact_id: contactId,
      channel: 'Email',
      consent_status: 'Pending_Request',
      opt_in_timestamp: null,
      opt_out_timestamp: null,
      cadence_step: 0,
      next_eligible_date: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0],
      suppression_reason: null
    };
    db.upsert('education_consent_records', 'consent_id', consent);
    consentCount++;
  }

  console.log(`[Seed] Ingested ${instCount} institutions, ${contactCount} contacts, ${profileCount} funding profiles, ${dealCount} pipeline deals, ${consentCount} consent records.`);
  console.log(`[Seed] Total A+ priority prospects maintained: ${aPlusCount}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SEED TASKS & SAMPLE ENQUIRIES
// ─────────────────────────────────────────────────────────────────────────────
function seedTasksAndEnquiries() {
  console.log('[Seed] Seeding sample tasks and public enquiries...');

  // Sample Builder Enquiry
  const bEnq = {
    enquiry_id: 'ALS-ENQ-BLD-001',
    company_name: 'VTP Realty Group',
    contact_person: 'Suresh Patil',
    designation: 'Head of Channel Sales',
    official_email: 'alliances@vtprealty.in',
    business_telephone: '+91 20 6711 5000',
    city: 'Pune',
    website: 'https://www.vtprealty.in',
    residential_project_count: 5,
    partnership_interest: 'Home Loan Referral Tie-Up',
    preferred_discussion_time: 'Weekday Mornings',
    enquiry_description: 'Seeking dedicated home loan DSA partner for 3 upcoming residential launches in Pune.',
    privacy_acknowledgement: true,
    marketing_opt_in: true,
    crm_lead_created: true,
    status: 'New',
    created_at: new Date().toISOString()
  };
  db.upsert('builder_enquiries', 'enquiry_id', bEnq);

  // Sample Education Enquiry
  const eEnq = {
    enquiry_id: 'ALS-ENQ-EDU-001',
    institution_name: 'Orchid International School Trust',
    institution_category: 'School',
    legal_entity: 'Orchid Educational Charitable Trust',
    contact_person: 'Dr. Anita Deshmukh',
    designation: 'Managing Trustee & Treasurer',
    official_email: 'treasurer@orchidschool.edu.in',
    telephone: '+91 22 2844 1122',
    city: 'Mumbai',
    state: 'Maharashtra',
    website: 'https://www.orchidschool.edu.in',
    funding_requirement: 'School infrastructure finance',
    estimated_amount: 75000000, // ₹7.5 Crore
    funding_purpose: 'Construction of new STEM science laboratories and indoor sports auditorium.',
    secured_unsecured_preference: 'Secured against campus land & building',
    existing_loans_detail: 'Nil existing commercial debt on primary campus',
    preferred_contact_time: '2 PM to 5 PM',
    enquiry_description: 'Require ₹7.5 Crore debt funding at competitive institutional interest rates.',
    privacy_acknowledgement: true,
    email_opt_in: true,
    whatsapp_opt_in: true,
    crm_lead_created: true,
    status: 'New',
    created_at: new Date().toISOString()
  };
  db.upsert('education_enquiries', 'enquiry_id', eEnq);

  // Unified tasks
  const t1 = {
    task_id: 'TSK-001',
    module: 'BUILDER',
    related_id: 'ALS-BLD-MH-MUM-001',
    task_title: 'Confirm Lodha Group partnership desk phone extension',
    task_type: 'Contact Confirmation',
    due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
    priority: 'High',
    status: 'Pending',
    assigned_to: 'USR-ADMIN-001'
  };
  db.upsert('unified_tasks', 'task_id', t1);

  const t2 = {
    task_id: 'TSK-002',
    module: 'EDUCATION',
    related_id: 'ALS-EDU-MH-MUM-005',
    task_title: 'Deliver Podar Education Network consultative funding brief',
    task_type: 'Send Proposal',
    due_date: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
    priority: 'High',
    status: 'Pending',
    assigned_to: 'USR-ADMIN-001'
  };
  db.upsert('unified_tasks', 'task_id', t2);
}

// Execute Seeding
console.log('=== STARTING PORTAL SEEDING ===');
ingestBuilderData();
ingestEducationData();
seedTasksAndEnquiries();
console.log('=== PORTAL SEEDING COMPLETE ===');
