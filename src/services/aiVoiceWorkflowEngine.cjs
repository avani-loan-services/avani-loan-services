// src/services/aiVoiceWorkflowEngine.cjs
// ─────────────────────────────────────────────────────────────────
// OmniDM / VAPI AI Voice Workflow & Advisory Handoff Engine
// AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const { getLead, updateLead } = require('./centralLeadEngine.cjs');
const { getQualificationSchema, evaluateQualification } = require('./loanQualificationEngine.cjs');
const { scheduleFollowUp } = require('./crmPipelineEngine.cjs');
const { recordProviderAttempt } = require('../models/ProviderLedger.cjs');

/**
 * Check if voice system is running in safe mock / test mode
 */
function isVoiceTestMode() {
  return process.env.VOICE_TEST_MODE === 'true' ||
         process.env.NODE_ENV === 'test' ||
         process.env.PROVIDER_MODE === 'mock' ||
         !process.env.OMNIDM_API_KEY ||
         process.env.OMNIDM_API_KEY.includes('MOCK');
}

/**
 * AI Voice Qualification Script Generator
 * Strict adherence to non-banking / DSA disclosure and zero OTP / password rules.
 */
function generateVoiceScript(lead) {
  const schema = getQualificationSchema(lead.loanProduct);
  const cleanName = (lead.fullName || 'Customer').replace(/^(Dr\.|CA)\s+/i, '');

  const greeting = `Namaskar ${cleanName}! I am calling from AVANI LOAN SERVICES, Latur. We received your request regarding a ${schema.loanType}. To help our loan advisors find you the best lender sanction, may I ask you a few quick questions?`;

  const disclaimer = `Please note that AVANI LOAN SERVICES is a Direct Selling Agent and loan advisory partner. All sanctions are subject to bank verification. We will never ask for your banking passwords, OTPs, or debit card PINs.`;

  return {
    loanType: schema.loanType,
    greeting,
    disclaimer,
    questions: schema.questions.map(q => ({
      id: q.id,
      prompt: `Please tell me your ${q.label}`
    }))
  };
}

/**
 * Execute or Simulate AI Voice Qualification Workflow
 */
async function runVoiceQualificationWorkflow(leadIdentifier, simulatedResponses = {}) {
  const lead = getLead(leadIdentifier);
  if (!lead) return { success: false, error: 'Lead not found' };

  const script = generateVoiceScript(lead);
  const correlationId = `VOICE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Safe Mock / Test Mode: Zero real telephone calls initiated
  if (isVoiceTestMode()) {
    console.log(`[AIVoiceEngine] [SAFE MOCK] Simulating AI Voice call for ${lead.leadId} (${lead.mobile}). Zero outbound calls made.`);

    // Record provider attempt
    await recordProviderAttempt({
      provider: 'OMNIDM_VOICE_MOCK',
      operation: 'CALL_SIMULATION',
      leadId: lead.leadId,
      correlationId,
      status: 'CALL_SIMULATED_SUCCESS',
      requestPayload: { phone: lead.mobile, loanProduct: lead.loanProduct }
    });

    // Merge simulated answers or synthesize from lead profile
    const qualificationAnswers = {
      fullName: lead.fullName,
      mobile: lead.mobile,
      city: lead.city || 'Latur',
      monthlyIncome: lead.monthlyIncome || '50000',
      existingEmi: lead.existingEmi || '0',
      loanAmount: lead.loanAmount || '500000',
      employmentType: lead.employmentType || 'Salaried',
      itrAvailable: 'Yes - Last 2+ Years',
      gstAvailable: 'Yes - Active GST with Returns',
      clearTitleDocs: 'Yes - Clear Title & Registered Deeds',
      ...simulatedResponses
    };

    // Run qualification evaluation
    const evaluation = evaluateQualification(lead.loanProduct, qualificationAnswers);

    // Update lead record
    const comms = lead.communicationHistory || [];
    comms.push({
      timestamp: new Date().toISOString(),
      channel: 'VOICE',
      event: 'AI_CALL_COMPLETED',
      provider: 'OMNIDM_SIMULATION',
      callDurationSeconds: 120,
      transcriptSummary: `Customer answered qualification questions for ${lead.loanProduct}. Lead scored ${evaluation.leadScore}/100 (${evaluation.leadScoreGrade}). Status: ${evaluation.qualificationStatus}.`,
      extractedAnswers: qualificationAnswers,
      simulated: true
    });

    const targetStatus = evaluation.qualificationStatus === 'QUALIFIED_FOR_REVIEW' ? 'QUALIFIED' : 'CONTACTED';

    const updated = updateLead(lead.leadId, {
      status: targetStatus,
      currentWorkflowState: targetStatus,
      qualificationStatus: evaluation.qualificationStatus,
      qualificationAnswers: qualificationAnswers,
      leadScore: evaluation.leadScore,
      leadScoreGrade: evaluation.leadScoreGrade,
      communicationHistory: comms,
      lastContactedAt: new Date().toISOString()
    }, 'AI_VOICE_AGENT');

    // Automatically create handoff follow-up task for loan advisor
    scheduleFollowUp(lead.leadId, {
      title: `Advisor Review: AI Qualified ${lead.loanProduct} (Score ${evaluation.leadScore})`,
      reason: 'CALL_BACK',
      priority: evaluation.leadScoreGrade,
      assignedTo: lead.assignedAdvisor || 'Sachin Shinde',
      notes: `AI Voice agent completed preliminary qualification. Customer requested ₹${lead.loanAmount}. Connect to finalize lender submission.`
    });

    return {
      success: true,
      simulated: true,
      callId: correlationId,
      leadId: lead.leadId,
      evaluation,
      handoffScheduled: true,
      lead: updated
    };
  }

  // Real production call invocation through OmniDM/VAPI
  try {
    const { initiateOmnidmCall } = require('./omnidmAgent.cjs');
    const result = await initiateOmnidmCall(lead);
    return {
      success: true,
      simulated: false,
      callId: result.providerCallId,
      leadId: lead.leadId
    };
  } catch (err) {
    console.error('[AIVoiceEngine] Error initiating call:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  generateVoiceScript,
  runVoiceQualificationWorkflow,
  isVoiceTestMode
};
