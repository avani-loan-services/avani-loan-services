// src/services/publishingStateMachine.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — 11-Step Publishing State Machine
// ─────────────────────────────────────────────────────────────────

const PUBLISHING_STATES = Object.freeze({
  DRAFT: 'DRAFT',
  VALIDATED: 'VALIDATED',
  READY_FOR_SUBMISSION: 'READY_FOR_SUBMISSION',
  SUBMITTED_TO_META: 'SUBMITTED_TO_META',
  META_PENDING: 'META_PENDING',
  META_APPROVED: 'META_APPROVED',
  META_REJECTED: 'META_REJECTED',
  READY_FOR_AISENSY: 'READY_FOR_AISENSY',
  PUBLISHED_TO_AISENSY: 'PUBLISHED_TO_AISENSY',
  FAILED: 'FAILED',
  ARCHIVED: 'ARCHIVED'
});

// Directed Acyclic Graph of Permitted State Transitions
const PERMITTED_TRANSITIONS = {
  [PUBLISHING_STATES.DRAFT]: [
    PUBLISHING_STATES.VALIDATED,
    PUBLISHING_STATES.FAILED,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.VALIDATED]: [
    PUBLISHING_STATES.READY_FOR_SUBMISSION,
    PUBLISHING_STATES.DRAFT,
    PUBLISHING_STATES.FAILED,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.READY_FOR_SUBMISSION]: [
    PUBLISHING_STATES.SUBMITTED_TO_META,
    PUBLISHING_STATES.VALIDATED,
    PUBLISHING_STATES.FAILED,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.SUBMITTED_TO_META]: [
    PUBLISHING_STATES.META_PENDING,
    PUBLISHING_STATES.META_APPROVED,
    PUBLISHING_STATES.META_REJECTED,
    PUBLISHING_STATES.FAILED
  ],
  [PUBLISHING_STATES.META_PENDING]: [
    PUBLISHING_STATES.META_APPROVED,
    PUBLISHING_STATES.META_REJECTED,
    PUBLISHING_STATES.FAILED
  ],
  [PUBLISHING_STATES.META_APPROVED]: [
    PUBLISHING_STATES.READY_FOR_AISENSY,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.META_REJECTED]: [
    PUBLISHING_STATES.DRAFT,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.READY_FOR_AISENSY]: [
    PUBLISHING_STATES.PUBLISHED_TO_AISENSY,
    PUBLISHING_STATES.FAILED,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.PUBLISHED_TO_AISENSY]: [
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.FAILED]: [
    PUBLISHING_STATES.DRAFT,
    PUBLISHING_STATES.ARCHIVED
  ],
  [PUBLISHING_STATES.ARCHIVED]: [
    PUBLISHING_STATES.DRAFT
  ]
};

/**
 * Validate whether a transition from currentState to nextState is permitted
 */
function canTransition(currentState, nextState) {
  if (!currentState || !nextState) return false;
  if (currentState === nextState) return true; // Idempotent no-op

  const allowed = PERMITTED_TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

/**
 * Execute a state transition on a template object, throwing on illegal transitions
 */
function transitionTemplateState(template, nextState, reason = '') {
  const current = template.publishingState || template.status || PUBLISHING_STATES.DRAFT;

  if (!canTransition(current, nextState)) {
    throw new Error(`ILLEGAL_STATE_TRANSITION: Cannot transition template ${template.templateId} from '${current}' to '${nextState}'. Permitted: ${(PERMITTED_TRANSITIONS[current] || []).join(', ')}`);
  }

  template.publishingState = nextState;
  template.status = nextState;
  template.lastStateChange = {
    from: current,
    to: nextState,
    timestamp: new Date(),
    reason
  };

  return template;
}

/**
 * Functional state transition helper returning an outcome object
 */
function transitionState(fromState, toState, metadata = {}) {
  if (!canTransition(fromState, toState)) {
    return {
      success: false,
      error: `Illegal state transition from '${fromState}' to '${toState}'.`
    };
  }
  return {
    success: true,
    from: fromState,
    to: toState,
    timestamp: new Date(),
    metadata
  };
}

/**
 * Validates preconditions for bulk Meta submission
 */
function validateBulkSubmissionPreconditions(candidates = [], humanConfirmed = false) {
  if (!humanConfirmed) {
    return { valid: false, error: 'Explicit human confirmation is required before bulk submission.' };
  }
  for (const t of candidates) {
    if (t.qualityScore && t.qualityScore < 75) {
      return { valid: false, error: `Template ${t.templateId} quality score (${t.qualityScore}) is below threshold (75).` };
    }
  }
  return { valid: true };
}

module.exports = {
  PUBLISHING_STATES,
  PERMITTED_TRANSITIONS,
  canTransition,
  transitionTemplateState,
  transitionState,
  validateBulkSubmissionPreconditions
};

