// src/services/crmPipelineEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Primary CRM Pipeline, Transition Rules & Follow-Up Engine
// AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

const { getAllLeads, getAllLeadsAsync, getLead, updateLead } = require('./centralLeadEngine.cjs');

const PIPELINE_STAGES = [
  'NEW_LEAD',
  'CONTACTED',
  'QUALIFIED',
  'DOCUMENTS_PENDING',
  'DOCUMENTS_RECEIVED',
  'SUBMITTED',
  'SANCTIONED',
  'DISBURSED',
  'CLOSED_LOST'
];

// Valid forward and allowable lateral transitions
const ALLOWED_TRANSITIONS = {
  'NEW_LEAD': ['CONTACTED', 'QUALIFIED', 'CLOSED_LOST'],
  'CONTACTED': ['QUALIFIED', 'DOCUMENTS_PENDING', 'CLOSED_LOST'],
  'QUALIFIED': ['DOCUMENTS_PENDING', 'SUBMITTED', 'CLOSED_LOST'],
  'DOCUMENTS_PENDING': ['DOCUMENTS_RECEIVED', 'CLOSED_LOST'],
  'DOCUMENTS_RECEIVED': ['SUBMITTED', 'DOCUMENTS_PENDING', 'CLOSED_LOST'],
  'SUBMITTED': ['SANCTIONED', 'DOCUMENTS_PENDING', 'CLOSED_LOST'],
  'SANCTIONED': ['DISBURSED', 'CLOSED_LOST'],
  'DISBURSED': [], // Final success terminal stage
  'CLOSED_LOST': ['NEW_LEAD', 'CONTACTED'] // Allow reopening if customer re-engages
};

/**
 * Perform a controlled pipeline stage transition
 */
function transitionLeadStage(leadIdentifier, targetStage, options = {}) {
  const lead = getLead(leadIdentifier);
  if (!lead) return { success: false, error: 'Lead not found' };

  const currentStage = lead.status || 'NEW_LEAD';

  if (!PIPELINE_STAGES.includes(targetStage)) {
    return { success: false, error: `Invalid pipeline stage: ${targetStage}` };
  }

  // Check transition matrix
  const allowed = ALLOWED_TRANSITIONS[currentStage] || [];
  if (currentStage !== targetStage && !allowed.includes(targetStage)) {
    return {
      success: false,
      error: `Invalid transition from ${currentStage} to ${targetStage}. Allowed: ${allowed.join(', ') || 'none'}`
    };
  }

  // If moving to CLOSED_LOST, require reason
  if (targetStage === 'CLOSED_LOST' && (!options.reason && !options.lostReason)) {
    return {
      success: false,
      error: 'A mandatory reason is required when transitioning to CLOSED_LOST'
    };
  }

  const timestamp = new Date().toISOString();
  const actor = options.actor || 'Advisor';
  const reason = options.reason || options.lostReason || `Transitioned to ${targetStage}`;

  const timeline = lead.timeline || [];
  timeline.push({
    timestamp,
    fromStatus: currentStage,
    toStatus: targetStage,
    reason,
    actor
  });

  const updates = {
    status: targetStage,
    currentWorkflowState: targetStage,
    timeline,
    lastTouchDate: timestamp
  };

  if (targetStage === 'CLOSED_LOST') {
    updates.lostReason = reason;
    updates.closedAt = timestamp;
  }

  const updated = updateLead(lead.leadId, updates, actor);

  return {
    success: true,
    leadId: lead.leadId,
    previousStage: currentStage,
    newStage: targetStage,
    lead: updated
  };
}

/**
 * Schedule a new follow-up task
 */
function scheduleFollowUp(leadIdentifier, followUpData = {}) {
  const lead = getLead(leadIdentifier);
  if (!lead) return { success: false, error: 'Lead not found' };

  const followUpId = `FU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const timestamp = new Date().toISOString();

  const newFollowUp = {
    id: followUpId,
    leadId: lead.leadId,
    customerName: lead.fullName,
    mobile: lead.mobile,
    loanProduct: lead.loanProduct,
    title: followUpData.title || `Follow-up on ${lead.loanProduct}`,
    reason: followUpData.reason || 'CALL_BACK', // CALL_BACK | DOCUMENT_PENDING | CUSTOMER_NOT_RESPONDED | ADDITIONAL_DOCUMENT_REQUIRED | LENDER_UPDATE
    dueDate: followUpData.dueDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    priority: followUpData.priority || lead.priority || 'HOT',
    assignedTo: followUpData.assignedTo || lead.assignedAdvisor || 'Sachin Shinde',
    completed: false,
    createdAt: timestamp,
    notes: followUpData.notes || ''
  };

  const followUps = lead.followUps || [];
  followUps.push(newFollowUp);

  const updated = updateLead(lead.leadId, {
    followUps,
    nextFollowUp: newFollowUp.dueDate
  });

  return {
    success: true,
    followUp: newFollowUp,
    lead: updated
  };
}

/**
 * Mark a follow-up as completed
 */
function completeFollowUp(leadIdentifier, followUpId, outcome = '', notes = '') {
  const lead = getLead(leadIdentifier);
  if (!lead) return { success: false, error: 'Lead not found' };

  const followUps = lead.followUps || [];
  const target = followUps.find(f => f.id === followUpId);

  if (!target) return { success: false, error: 'Follow-up not found' };

  target.completed = true;
  target.completedAt = new Date().toISOString();
  target.outcome = outcome || 'COMPLETED';
  if (notes) target.notes = `${target.notes ? target.notes + ' | ' : ''}${notes}`;

  // Find next pending follow-up date
  const pending = followUps.filter(f => !f.completed).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextDate = pending.length > 0 ? pending[0].dueDate : '';

  const updated = updateLead(lead.leadId, {
    followUps,
    nextFollowUp: nextDate
  });

  return {
    success: true,
    followUp: target,
    lead: updated
  };
}

/**
 * Helper to compute dashboard metrics from a list of leads
 */
function computeMetricsFromLeads(leads) {
  const now = new Date();

  const metrics = {
    totalLeads: leads.length,
    byStage: {
      NEW_LEAD: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      DOCUMENTS_PENDING: 0,
      DOCUMENTS_RECEIVED: 0,
      SUBMITTED: 0,
      SANCTIONED: 0,
      DISBURSED: 0,
      CLOSED_LOST: 0
    },
    byPriority: {
      HOT: 0,
      WARM: 0,
      COLD: 0
    },
    byProduct: {},
    followUpsDueToday: 0,
    followUpsOverdue: 0,
    totalFollowUpsPending: 0
  };

  leads.forEach(l => {
    // Stage counts
    const s = l.status || 'NEW_LEAD';
    if (metrics.byStage[s] !== undefined) metrics.byStage[s]++;
    else metrics.byStage[s] = 1;

    // Priority counts
    const p = l.priority || 'HOT';
    if (metrics.byPriority[p] !== undefined) metrics.byPriority[p]++;

    // Product counts
    const prod = l.loanProduct || l.loanType || 'Personal Loan';
    metrics.byProduct[prod] = (metrics.byProduct[prod] || 0) + 1;

    // Follow-ups
    (l.followUps || []).forEach(f => {
      if (!f.completed) {
        metrics.totalFollowUpsPending++;
        const d = new Date(f.dueDate);
        if (d < now) {
          metrics.followUpsOverdue++;
        } else if (d.toDateString() === now.toDateString()) {
          metrics.followUpsDueToday++;
        }
      }
    });
  });

  return metrics;
}

/**
 * Get comprehensive dashboard metrics (Synchronous in-memory)
 */
function getDashboardMetrics() {
  return computeMetricsFromLeads(getAllLeads());
}

/**
 * Get comprehensive dashboard metrics (Asynchronous MongoDB Atlas + in-memory fallback)
 */
async function getDashboardMetricsAsync() {
  const leads = typeof getAllLeadsAsync === 'function' ? await getAllLeadsAsync() : getAllLeads();
  return computeMetricsFromLeads(leads);
}

/**
 * Helper to filter, search, and paginate leads
 */
function filterAndPaginateLeads(leads, params = {}) {
  let filtered = [...leads];

  // Search
  if (params.search) {
    const q = String(params.search).toLowerCase().trim();
    filtered = filtered.filter(l =>
      (l.leadId && l.leadId.toLowerCase().includes(q)) ||
      (l.fullName && l.fullName.toLowerCase().includes(q)) ||
      (l.mobile && l.mobile.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.city && l.city.toLowerCase().includes(q))
    );
  }

  // Filter by stage
  if (params.stage && params.stage !== 'all') {
    filtered = filtered.filter(l => (l.status || 'NEW_LEAD') === params.stage);
  }

  // Filter by product
  if (params.loanProduct && params.loanProduct !== 'all') {
    filtered = filtered.filter(l => (l.loanProduct || l.loanType) === params.loanProduct);
  }

  // Filter by priority
  if (params.priority && params.priority !== 'all') {
    filtered = filtered.filter(l => l.priority === params.priority);
  }

  // Filter by assigned advisor
  if (params.assignedAdvisor && params.assignedAdvisor !== 'all') {
    filtered = filtered.filter(l => l.assignedAdvisor === params.assignedAdvisor);
  }

  // Sort (default newest first)
  filtered.sort((a, b) => new Date(b.createdAt || b.firstTouchDate || 0) - new Date(a.createdAt || a.firstTouchDate || 0));

  const total = filtered.length;
  const page = parseInt(params.page || '1', 10);
  const limit = parseInt(params.limit || '50', 10);
  const offset = (page - 1) * limit;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    leads: paginated
  };
}

/**
 * Filter, search, and paginate leads (Synchronous in-memory)
 */
function queryLeads(params = {}) {
  return filterAndPaginateLeads(getAllLeads(), params);
}

/**
 * Filter, search, and paginate leads (Asynchronous MongoDB Atlas + in-memory fallback)
 */
async function queryLeadsAsync(params = {}) {
  const leads = typeof getAllLeadsAsync === 'function' ? await getAllLeadsAsync() : getAllLeads();
  return filterAndPaginateLeads(leads, params);
}

module.exports = {
  PIPELINE_STAGES,
  ALLOWED_TRANSITIONS,
  transitionLeadStage,
  scheduleFollowUp,
  completeFollowUp,
  getDashboardMetrics,
  getDashboardMetricsAsync,
  queryLeads,
  queryLeadsAsync
};

