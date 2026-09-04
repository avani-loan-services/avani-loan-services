// src/calculators/utils/validation.js
// ─────────────────────────────────────────────────────────────────
// Strict Input Validation Rules for Financial Calculator Suite
// ─────────────────────────────────────────────────────────────────

import { parseNumber } from './formatters.js';

/**
 * Validate numeric value within range
 */
export function validateNumber(val, { min = 0, max = Infinity, fieldName = 'Value', required = true } = {}) {
  if (val === '' || val === null || val === undefined) {
    if (required) return `${fieldName} is required.`;
    return null;
  }

  const num = parseNumber(val, NaN);
  if (isNaN(num)) {
    return `${fieldName} must be a valid number.`;
  }

  if (num < min) {
    return `${fieldName} cannot be less than ${min}.`;
  }

  if (num > max) {
    return `${fieldName} cannot exceed ${max.toLocaleString('en-IN')}.`;
  }

  return null;
}

/**
 * Validate Loan Amount (₹1,000 to ₹100 Crore)
 */
export function validateLoanAmount(val, fieldName = 'Loan Amount') {
  return validateNumber(val, { min: 1000, max: 1000000000, fieldName });
}

/**
 * Validate Interest Rate (0% to 100%)
 */
export function validateInterestRate(val, fieldName = 'Interest Rate') {
  return validateNumber(val, { min: 0, max: 100, fieldName });
}

/**
 * Validate Tenure (Months or Years)
 */
export function validateTenure(val, unit = 'years', fieldName = 'Tenure') {
  const max = unit === 'years' ? 50 : 600;
  const min = 1;
  return validateNumber(val, { min, max, fieldName });
}

/**
 * Validate FOIR Percentage (0% to 100%)
 */
export function validateFOIR(val, fieldName = 'FOIR %') {
  return validateNumber(val, { min: 1, max: 100, fieldName });
}

/**
 * Validate Multiplier (1 to 200)
 */
export function validateMultiplier(val, fieldName = 'Multiplier') {
  return validateNumber(val, { min: 1, max: 200, fieldName });
}

/**
 * Validate GST Percentage (0% to 50%)
 */
export function validateGST(val, fieldName = 'GST Rate') {
  return validateNumber(val, { min: 0, max: 50, fieldName });
}

/**
 * Validate Discount Percentage (0% to 100%)
 */
export function validateDiscountPercent(val, fieldName = 'Discount %') {
  return validateNumber(val, { min: 0, max: 100, fieldName });
}
