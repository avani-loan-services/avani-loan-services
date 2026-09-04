// src/services/documentReminderEngine.cjs
// ─────────────────────────────────────────────────────────────────
// Controlled Automatic Document Reminder & Stop-Rule Engine
// ─────────────────────────────────────────────────────────────────

const { getAllLeads, updateLeadStatus } = require('./centralLeadEngine.cjs');
const { evaluateDocumentCompleteness } = require('./documentChecklistEngine.cjs');
const { notifyDocumentsPending, notifyDocumentsComplete } = require('./notificationService.cjs');

/**
 * Evaluate all leads and trigger document reminders / completion checkpoints
 */
async function processDocumentCheckpointsAndReminders() {
  const leads = getAllLeads();
  const results = {
    evaluated: leads.length,
    remindersSent: 0,
    markedComplete: 0,
    alreadyComplete: 0
  };

  for (const lead of leads) {
    if (lead.status === 'APPROVED' || lead.status === 'REJECTED' || lead.status === 'DISBURSED' || lead.status === 'LOST') {
      continue;
    }

    const evalResult = evaluateDocumentCompleteness(lead.loanProduct, lead.receivedDocuments || []);

    if (evalResult.isComplete && lead.status !== 'DOCUMENTS_COMPLETE' && lead.status !== 'READY_FOR_PROCESSING') {
      // STOP RULE: Mark complete, stop reminders, trigger internal escalation
      console.log(`[DocumentReminderEngine] Lead ${lead.leadId} reached DOCUMENTS_COMPLETE (100%). Triggering Stop Rule...`);
      updateLeadStatus(lead.leadId, 'DOCUMENTS_COMPLETE', 'All mandatory documents uploaded and verified');
      notifyDocumentsComplete(lead).catch(e => console.warn('[DocumentReminderEngine] Escalation error:', e.message));
      results.markedComplete += 1;
    } else if (!evalResult.isComplete && (lead.status === 'DOCUMENTS_PENDING' || lead.status === 'DOCUMENTS_PARTIAL' || lead.status === 'QUALIFIED')) {
      // Trigger controlled reminder
      const reminderCount = (lead.reminderCount || 0) + 1;
      if (reminderCount <= 3) { // Max 3 reminders rule
        console.log(`[DocumentReminderEngine] Lead ${lead.leadId} has ${evalResult.missingMandatory.length} missing documents. Sending Reminder #${reminderCount}...`);
        updateLeadStatus(lead.leadId, 'DOCUMENTS_PARTIAL', `Document reminder #${reminderCount} sent`);
        notifyDocumentsPending(lead, evalResult.missingMandatory).catch(e => console.warn('[DocumentReminderEngine] Reminder error:', e.message));
        results.remindersSent += 1;
      }
    } else if (lead.status === 'DOCUMENTS_COMPLETE') {
      results.alreadyComplete += 1;
    }
  }

  console.log('[DocumentReminderEngine] Checkpoint execution summary:', results);
  return results;
}

module.exports = {
  processDocumentCheckpointsAndReminders
};
