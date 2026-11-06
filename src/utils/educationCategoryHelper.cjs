// src/utils/educationCategoryHelper.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — MODULE B EDUCATION CATEGORY PARTITIONING
// Deterministic 24 Schools vs 56 Colleges & Universities
// Total: 80 Education Institutions
// ─────────────────────────────────────────────────────────────────────────────

const SCHOOL_IDS = new Set([
  'ALS-EDU-MH-MUM-003', // VIBGYOR Group of Schools
  'ALS-EDU-MH-MUM-004', // Ryan International Group of Schools
  'ALS-EDU-MH-MUM-005', // Podar Education Network
  'ALS-EDU-MH-THA-001', // Smt. Sunitidevi Singhania School
  'ALS-EDU-NAT-KA-006', // Greenwood High International School
  'ALS-EDU-NAT-TS-001', // CHIREC International School
  'ALS-EDU-NAT-DL-001', // The Delhi Public School Society (DPSS)
  'ALS-EDU-NAT-UK-002', // The Doon School
  'ALS-EDU-NAT-RJ-001', // Mayo College & Mayo College Girls School
  'ALS-EDU-NAT-RJ-002', // Jayshree Periwal Group of Schools
  'ALS-EDU-NAT-MP-001', // The Daly College
  'ALS-EDU-NAT-KL-001', // The Choice School & Choice Foundation
  'ALS-EDU-NAT-HR-001', // The Heritage School
  'ALS-EDU-MH-NSK-003', // Ashoka Education Foundation - Ashoka Universal Schools
  'ALS-EDU-NAT-HR-002', // G.D. Goenka Group - World Schools Chain
  'ALS-EDU-NAT-UP-005', // Shiv Nadar Foundation - Shiv Nadar Schools
  'ALS-EDU-MH-MUM-006', // Thakur Educational Trust - TCET & Schools
  'ALS-EDU-MH-NAV-002', // Mahatma Education Society - Pillai Group & CBSE/IB Schools
  'ALS-EDU-MH-PUN-006', // Dr. D. Y. Patil Pratishthan Akurdi & Schools
  'ALS-EDU-NAT-WB-001', // Techno India Group & CBSE Schools
  'ALS-EDU-MH-NAN-001', // Shri Sharda Bhavan Education Society & K-12 Schools
  'ALS-EDU-MH-BEE-001', // Navgan Shikshan Sanstha Rajuri - Secondary Schools Network
  'ALS-EDU-NAT-RJ-003', // Banasthali Vidyapith & K-12 Campus Schools
  'ALS-EDU-MH-SAT-001'  // Rayat Shikshan Sanstha - Karmaveer Bhaurao Patil Schools Network
]);

function isSchool(inst) {
  if (!inst) return false;
  return SCHOOL_IDS.has(inst.institution_id);
}

function isCollege(inst) {
  if (!inst) return false;
  return !SCHOOL_IDS.has(inst.institution_id);
}

function getCollegeSubtypes(inst) {
  const text = ((inst.subcategory || '') + ' ' + (inst.institution_name || '') + ' ' + (inst.institution_category || '')).toLowerCase();
  const subtypes = [];
  
  if (text.includes('engineering') || text.includes('technology') || text.includes('polytechnic')) {
    subtypes.push('engineering');
  }
  if (text.includes('medical') || text.includes('dental') || text.includes('nursing') || text.includes('hospital')) {
    subtypes.push('medical');
  }
  if (text.includes('autonomous')) {
    subtypes.push('autonomous');
  }
  if (text.includes('deemed')) {
    subtypes.push('deemed');
  }
  if (inst.ownership_type?.toLowerCase().includes('trust') || inst.parent_trust_society) {
    subtypes.push('trusts');
  }
  if (inst.institution_category === 'Multi-Institution Group' || text.includes('group') || text.includes('society')) {
    subtypes.push('groups');
  }
  if (inst.lead_priority_tier === 'A+' || inst.lead_priority_tier === 'A') {
    subtypes.push('prospects');
  }

  return subtypes;
}

function getSchoolSubtypes(inst) {
  const text = ((inst.subcategory || '') + ' ' + (inst.institution_name || '') + ' ' + (inst.parent_trust_society || '')).toLowerCase();
  const subtypes = [];

  if (text.includes('group') || text.includes('chain') || text.includes('network') || text.includes('society') || inst.institution_category === 'Multi-Institution Group') {
    subtypes.push('groups');
  }
  if (inst.ownership_type?.toLowerCase().includes('trust') || inst.parent_trust_society) {
    subtypes.push('trusts');
  }
  if (inst.lead_priority_tier === 'A+' || inst.lead_priority_tier === 'A') {
    subtypes.push('prospects');
  }

  return subtypes;
}

module.exports = {
  SCHOOL_IDS,
  isSchool,
  isCollege,
  getCollegeSubtypes,
  getSchoolSubtypes
};
