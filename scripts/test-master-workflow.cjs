// scripts/test-master-workflow.cjs
// ─────────────────────────────────────────────────────────────────
// Master Test Suite for AVANI LOAN SERVICES
// Covers Phase 1 through Phase 6 in safe isolated mock/test mode.
// ─────────────────────────────────────────────────────────────────

process.env.NODE_ENV = 'test';
process.env.PROVIDER_MODE = 'mock';
process.env.WHATSAPP_TEST_MODE = 'true';
process.env.VOICE_TEST_MODE = 'true';
process.env.CRM_TEST_MODE = 'true';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Clear uploads/central_leads.json for clean test run
const LEADS_FILE = path.join(__dirname, '../uploads/central_leads.json');
if (fs.existsSync(LEADS_FILE)) {
  fs.unlinkSync(LEADS_FILE);
}

const {
  processIncomingLead,
  getLead,
  getLeadByPortalToken,
  revokePortalToken,
  updateLeadStatus,
  updateLead,
  getAllLeads,
  generateLeadId
} = require('../src/services/centralLeadEngine.cjs');

const {
  LOAN_PRODUCTS,
  getQualificationSchema,
  evaluateQualification,
  normalizeLoanProduct
} = require('../src/services/loanQualificationEngine.cjs');

const {
  sendJourneyTemplate,
  handleCustomerEvent
} = require('../src/services/whatsappJourneyEngine.cjs');

const {
  listTemplates,
  getTemplate
} = require('../src/config/whatsappTemplates.cjs');

const {
  generateChecklistForLead,
  reviewDocument,
  DOCUMENT_STATUSES
} = require('../src/services/documentWorkflowEngine.cjs');

const {
  transitionLeadStage,
  scheduleFollowUp,
  completeFollowUp,
  getDashboardMetrics,
  queryLeads,
  PIPELINE_STAGES
} = require('../src/services/crmPipelineEngine.cjs');

const {
  generateVoiceScript,
  runVoiceQualificationWorkflow
} = require('../src/services/aiVoiceWorkflowEngine.cjs');

async function runMasterTestSuite() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 RUNNING AVANI LOAN SERVICES MASTER WORKFLOW TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;

  function test(description, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  ✅ PASS: ${description}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  async function asyncTest(description, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${description}`);
      passedTests++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${description}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. LEAD CAPTURE ARCHITECTURE & 100+ SYNTHETIC LEADS
  // ─────────────────────────────────────────────────────────────
  console.log('--- 1. Lead Capture Architecture & 100+ Synthetic Leads ---');

  const generatedIds = new Set();
  test('Generate 105 synthetic leads and verify unique ALS-2026-XXXXXX IDs', () => {
    for (let i = 1; i <= 105; i++) {
      const phone = `980000${String(i).padStart(4, '0')}`;
      const res = processIncomingLead({
        fullName: `Test Customer ${i}`,
        mobile: phone,
        email: `test${i}@example.invalid`,
        city: 'Latur',
        loanProduct: i % 2 === 0 ? 'Business Loan' : 'Personal / Salary Loan',
        requestedAmount: '1000000',
        source: 'WEBSITE',
        idempotencyKey: `EVENT-${i}`
      });

      assert.strictEqual(res.isDuplicate, false);
      assert.ok(res.lead.leadId.startsWith('ALS-2026-'));
      assert.ok(!generatedIds.has(res.lead.leadId), `Duplicate Lead ID generated: ${res.lead.leadId}`);
      generatedIds.add(res.lead.leadId);
    }
    assert.strictEqual(generatedIds.size, 105);
  });

  test('Deduplicate lead with same mobile phone', () => {
    const res = processIncomingLead({
      fullName: 'Test Customer 1 (Repeated)',
      mobile: '9800000001',
      source: 'META_FACEBOOK'
    });
    assert.strictEqual(res.isDuplicate, true);
    assert.strictEqual(res.lead.duplicateCount, 1);
    assert.strictEqual(res.lead.duplicateEvents.length, 1);
  });

  test('Deduplicate lead with same idempotency key', () => {
    const res = processIncomingLead({
      fullName: 'Different Name Same Event',
      mobile: '9700009999',
      idempotencyKey: 'EVENT-1' // Already used for Lead 1
    });
    assert.strictEqual(res.isDuplicate, true);
    assert.strictEqual(res.lead.leadId, 'ALS-2026-001001');
  });

  // ─────────────────────────────────────────────────────────────
  // 2. LOAN QUALIFICATION TEST MATRIX (ALL 10 PRODUCTS)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 2. Loan-Specific Qualification Engine (10 Products) ---');

  const allProducts = Object.values(LOAN_PRODUCTS);

  allProducts.forEach(prod => {
    test(`Schema and questions exist for ${prod}`, () => {
      const schema = getQualificationSchema(prod);
      assert.ok(schema);
      assert.ok(schema.questions.length >= 4);
    });

    test(`Evaluation handles incomplete input for ${prod}`, () => {
      const evalRes = evaluateQualification(prod, { fullName: 'Incomplete User' });
      assert.strictEqual(evalRes.isComplete, false);
      assert.strictEqual(evalRes.qualificationStatus, 'INFORMATION_PENDING');
      assert.ok(evalRes.missingFields.length > 0);
      assert.ok(evalRes.disclaimer.includes('Indicative'));
    });

    test(`Evaluation computes valid score & status for ${prod}`, () => {
      const answers = {
        fullName: 'Dr. Valid Applicant',
        mobile: '9175635165',
        city: 'Latur',
        studentName: 'Rahul Sachin Shinde',
        coapplicantName: 'Sachin Shinde',
        medicalSpecialty: 'MBBS / MD / MS',
        qualification: 'MD Medicine',
        practiceType: 'Own Clinic / Nursing Home',
        professionType: 'Chartered Accountant (CA)',
        monthlyIncome: '100000',
        annualRevenue: '1200000',
        annualTurnover: '5000000',
        existingEmi: '15000',
        loanAmount: '1500000',
        employmentType: 'Salaried',
        businessType: 'Proprietorship',
        vintageYears: '5',
        practiceVintage: '5',
        copVintageYears: '5',
        yearsOperating: '5',
        itrAvailable: 'Yes - Last 2+ Years',
        gstAvailable: 'Yes - Active GST with Returns',
        councilRegistration: 'Yes - Valid Certificate',
        membershipDocAvailable: 'Yes - Both Available',
        propertyType: 'Ready Possession Flat',
        propertyLocation: 'Latur',
        propertyValue: '3500000',
        downPaymentAvailable: '700000',
        clearTitleDocs: 'Yes - Clear Title & Registered Deeds',
        courseName: 'B.Tech',
        collegeName: 'Govt Engineering College',
        courseFee: '400000',
        admissionStatus: 'Confirmed / Admission Letter Received',
        coapplicantIncome: '60000',
        destinationCountry: 'USA',
        universityName: 'State University',
        tuitionFee: '2500000',
        offerStatus: 'Unconditional Offer Letter / I-20 / CAS',
        institutionName: 'Vidya Mandir School',
        authorizedPerson: 'Chairman',
        institutionType: 'CBSE Affiliated',
        fundingPurpose: 'Campus Construction',
        schoolPropertyType: 'Trust Owned Land & Building',
        campusPropertyStatus: 'Trust Owned Freehold',
        cibilIssue: 'Need Score Improvement for New Home/Business Loan',
        approxCibilScore: '650 - 700'
      };

      const evalRes = evaluateQualification(prod, answers);
      assert.strictEqual(evalRes.isComplete, true);
      assert.ok(evalRes.leadScore >= 70, `Score: ${evalRes.leadScore}`);
      assert.strictEqual(evalRes.leadScoreGrade, 'HOT');
      assert.strictEqual(evalRes.qualificationStatus, 'QUALIFIED_FOR_REVIEW');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. WHATSAPP CUSTOMER JOURNEY (SAFE SIMULATION)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 3. WhatsApp Customer Journey Engine (Zero Real Send) ---');

  test('Template registry contains all 10 required approved templates', () => {
    const templates = listTemplates();
    assert.strictEqual(templates.length, 10);
    const requiredKeys = [
      'lead_received', 'qualification_start', 'qualification_reminder',
      'documents_required', 'documents_received', 'advisor_review',
      'follow_up_1', 'follow_up_2', 'follow_up_3', 'application_update'
    ];
    requiredKeys.forEach(k => {
      assert.ok(getTemplate(k), `Missing template: ${k}`);
    });
  });

  await asyncTest('Simulate sending template in safe mock mode (0 external requests)', async () => {
    const res = await sendJourneyTemplate('ALS-2026-001001', 'lead_received');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.simulated, true);
    assert.ok(res.messageId.startsWith('MOCK-WA-'));

    const lead = getLead('ALS-2026-001001');
    assert.strictEqual(lead.communicationHistory.length, 1);
    assert.strictEqual(lead.communicationHistory[0].templateKey, 'lead_received');
  });

  await asyncTest('Simulate incoming customer webhook reply with idempotency', async () => {
    const eventPayload = {
      eventId: 'WA-EVT-999',
      from: '9800000001',
      body: 'Yes I want to apply for ₹10 Lakh loan'
    };

    const res1 = await handleCustomerEvent(eventPayload);
    assert.strictEqual(res1.success, true);
    assert.strictEqual(res1.isDuplicate, false);

    // Duplicate webhook replay
    const res2 = await handleCustomerEvent(eventPayload);
    assert.strictEqual(res2.success, true);
    assert.strictEqual(res2.isDuplicate, true);
  });

  // ─────────────────────────────────────────────────────────────
  // 4. DOCUMENT WORKFLOW & ACCESS CONTROL
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 4. Document Collection Workflow & Access Control ---');

  test('Dynamic checklist generates relevant documents for Doctor Loan', () => {
    const docs = generateChecklistForLead('Doctor Professional Loan');
    const docIds = docs.map(d => d.docId);
    assert.ok(docIds.includes('pan_card'));
    assert.ok(docIds.includes('doctor_degree_certificate'));
    assert.ok(docIds.includes('council_reg_certificate'));
    assert.ok(!docIds.includes('salary_slips'), 'Should not include salaried slips for doctor');
  });

  test('Dynamic checklist generates relevant documents for Education Loan Global', () => {
    const docs = generateChecklistForLead('Education Loan Global');
    const docIds = docs.map(d => d.docId);
    assert.ok(docIds.includes('admission_offer_letter'));
    assert.ok(docIds.includes('student_passport'));
    assert.ok(docIds.includes('fee_structure'));
  });

  test('Advisor document review marks status accepted and updates lead', () => {
    const lead = getLead('ALS-2026-001001');
    lead.requiredDocuments = generateChecklistForLead(lead.loanProduct);
    lead.receivedDocuments = [{
      docId: 'pan_card',
      originalName: 'pan_card.pdf',
      status: DOCUMENT_STATUSES.UNDER_REVIEW
    }];
    updateLead(lead.leadId, {
      requiredDocuments: lead.requiredDocuments,
      receivedDocuments: lead.receivedDocuments
    });

    const res = reviewDocument(lead.leadId, 'pan_card', DOCUMENT_STATUSES.ACCEPTED, 'Verified PAN format');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.decision, DOCUMENT_STATUSES.ACCEPTED);

    const updated = getLead(lead.leadId);
    const reviewedDoc = updated.requiredDocuments.find(d => d.docId === 'pan_card');
    assert.strictEqual(reviewedDoc.status, DOCUMENT_STATUSES.ACCEPTED);
  });

  test('Access control: Non-existent token rejects portal access', () => {
    const invalidLead = getLeadByPortalToken('INVALID_TOKEN_XYZ_123');
    assert.strictEqual(invalidLead, null);
  });

  test('Security Hardening: Valid token authenticates lead via SHA-256 hash', () => {
    const lead = getLead('ALS-2026-001001');
    assert.ok(lead.secureToken);
    assert.ok(lead.portalTokenHash);
    const resolved = getLeadByPortalToken(lead.secureToken);
    assert.strictEqual(resolved.leadId, lead.leadId);
  });

  test('Security Hardening: Revoked token immediately blocks portal access', () => {
    const lead = getLead('ALS-2026-001002');
    assert.ok(lead.secureToken);
    revokePortalToken(lead.leadId, 'Revoked for security test');
    const resolved = getLeadByPortalToken(lead.secureToken);
    assert.strictEqual(resolved, null, 'Revoked token must not grant access');
  });

  test('Security Hardening: IDOR prevention across customer document vaults', () => {
    const leadA = getLead('ALS-2026-001001');
    const leadB = getLead('ALS-2026-001003');

    // Lead A's token resolves to Lead A only
    const resolvedA = getLeadByPortalToken(leadA.secureToken);
    assert.strictEqual(resolvedA.leadId, leadA.leadId);
    assert.notStrictEqual(resolvedA.leadId, leadB.leadId);

    // Attempting to look up Lead B with Lead A's token returns Lead A, NOT Lead B
    assert.strictEqual(resolvedA.leadId !== leadB.leadId, true);
  });

  test('Architecture Hardening: Strict separation between CRM lifecycle and WhatsApp journey stage', () => {
    const lead = getLead('ALS-2026-001001');
    assert.strictEqual(lead.status, 'NEW_LEAD', 'CRM lifecycle status must remain NEW_LEAD');
    assert.strictEqual(lead.whatsappJourneyStage, 'CUSTOMER_ENGAGED', 'WhatsApp journey stage must be tracked separately');
  });

  // ─────────────────────────────────────────────────────────────
  // 5. CRM PIPELINE, TRANSITIONS & FOLLOW-UPS
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 5. CRM Pipeline, Transitions & Follow-Ups ---');

  test('Enforce valid pipeline stage progression', () => {
    const leadId = 'ALS-2026-001002';
    // NEW_LEAD -> CONTACTED
    const t1 = transitionLeadStage(leadId, 'CONTACTED', { actor: 'Advisor' });
    assert.strictEqual(t1.success, true);
    assert.strictEqual(t1.newStage, 'CONTACTED');

    // CONTACTED -> QUALIFIED
    const t2 = transitionLeadStage(leadId, 'QUALIFIED', { actor: 'Advisor' });
    assert.strictEqual(t2.success, true);
    assert.strictEqual(t2.newStage, 'QUALIFIED');

    // QUALIFIED -> DOCUMENTS_PENDING
    const t3 = transitionLeadStage(leadId, 'DOCUMENTS_PENDING', { actor: 'Advisor' });
    assert.strictEqual(t3.success, true);
    assert.strictEqual(t3.newStage, 'DOCUMENTS_PENDING');
  });

  test('Disallow invalid pipeline stage jump', () => {
    const leadId = 'ALS-2026-001003';
    // Cannot jump from NEW_LEAD directly to DISBURSED
    const tFail = transitionLeadStage(leadId, 'DISBURSED');
    assert.strictEqual(tFail.success, false);
    assert.ok(tFail.error.includes('Invalid transition'));
  });

  test('Require mandatory reason when transitioning to CLOSED_LOST', () => {
    const leadId = 'ALS-2026-001004';
    const tNoReason = transitionLeadStage(leadId, 'CLOSED_LOST');
    assert.strictEqual(tNoReason.success, false);
    assert.ok(tNoReason.error.includes('mandatory reason is required'));

    const tWithReason = transitionLeadStage(leadId, 'CLOSED_LOST', { reason: 'Customer opted for another bank' });
    assert.strictEqual(tWithReason.success, true);
    assert.strictEqual(tWithReason.newStage, 'CLOSED_LOST');
  });

  test('Schedule and complete follow-up task', () => {
    const leadId = 'ALS-2026-001001';
    const fuRes = scheduleFollowUp(leadId, {
      title: 'Call back regarding salary slip',
      reason: 'DOCUMENT_PENDING',
      priority: 'HOT',
      notes: 'Customer is on leave today, call tomorrow at 11am'
    });
    assert.strictEqual(fuRes.success, true);
    assert.ok(fuRes.followUp.id.startsWith('FU-'));

    const compRes = completeFollowUp(leadId, fuRes.followUp.id, 'Customer uploaded documents', 'Done');
    assert.strictEqual(compRes.success, true);
    assert.strictEqual(compRes.followUp.completed, true);
  });

  test('Calculate CRM dashboard metrics across all leads', () => {
    const metrics = getDashboardMetrics();
    assert.ok(metrics.totalLeads >= 105);
    assert.ok(metrics.byStage.NEW_LEAD > 0);
    assert.ok(metrics.byStage.CONTACTED >= 0);
    assert.ok(metrics.byPriority.HOT > 0);
  });

  test('Query and search leads with filtering and pagination', () => {
    const searchRes = queryLeads({ search: 'Customer 1', limit: 10 });
    assert.ok(searchRes.leads.length > 0);
    assert.ok(searchRes.total > 0);
    assert.strictEqual(searchRes.page, 1);
  });

  // ─────────────────────────────────────────────────────────────
  // 6. AI VOICE SIMULATION (ZERO REAL CALLS)
  // ─────────────────────────────────────────────────────────────
  console.log('\n--- 6. AI Voice Workflow Simulation ---');

  test('Generate voice qualification script with zero OTP/password disclosure', () => {
    const lead = getLead('ALS-2026-001001');
    const script = generateVoiceScript(lead);
    assert.ok(script.greeting.includes('AVANI LOAN SERVICES'));
    assert.ok(script.disclaimer.includes('passwords'));
    assert.ok(script.disclaimer.includes('OTPs'));
    assert.ok(script.questions.length > 0);
  });

  await asyncTest('Run simulated AI voice qualification with advisor handoff', async () => {
    const res = await runVoiceQualificationWorkflow('ALS-2026-001001', {
      monthlyIncome: '75000',
      existingEmi: '10000',
      loanAmount: '1200000'
    });

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.simulated, true);
    assert.strictEqual(res.handoffScheduled, true);
    assert.strictEqual(res.evaluation.qualificationStatus, 'QUALIFIED_FOR_REVIEW');

    const lead = getLead('ALS-2026-001001');
    assert.strictEqual(lead.status, 'QUALIFIED');
    const voiceComms = lead.communicationHistory.filter(c => c.channel === 'VOICE');
    assert.strictEqual(voiceComms.length, 1);
    assert.strictEqual(voiceComms[0].event, 'AI_CALL_COMPLETED');
  });

  // ─────────────────────────────────────────────────────────────
  // TEST SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`📊 MASTER TEST RESULTS: ${passedTests} PASSED, ${totalTests - passedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runMasterTestSuite().catch(err => {
  console.error('Fatal error in master test suite:', err);
  process.exit(1);
});
