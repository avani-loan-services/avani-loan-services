// src/calculators/utils/formatters.js
// ─────────────────────────────────────────────────────────────────
// Indian Currency, Numerical & Number-to-Words Formatting Utilities
// ─────────────────────────────────────────────────────────────────

/**
 * Format a numeric value into Indian Rupee currency format (₹)
 * @param {number|string} val - Value to format
 * @param {object} options - Options for fraction digits
 * @returns {string} - e.g. "₹10,00,000" or "₹21,494.50"
 */
export function formatINR(val, options = {}) {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0';

  const defaultDecimals = Number.isInteger(num) ? 0 : 2;
  const maxDigits = options.maximumFractionDigits !== undefined ? options.maximumFractionDigits : defaultDecimals;
  const minDigits = options.minimumFractionDigits !== undefined ? options.minimumFractionDigits : (maxDigits > 0 ? 2 : 0);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(num);
}

/**
 * Format a number in Indian numbering system without currency symbol
 * @param {number|string} val
 * @param {number} decimals
 * @returns {string} - e.g. "10,00,000"
 */
export function formatNumber(val, decimals = 0) {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 * @param {number|string} val
 * @param {number} decimals
 * @returns {string} - e.g. "10.5%"
 */
export function formatPercent(val, decimals = 2) {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(decimals).replace(/\.?0+$/, '')}%`;
}

/**
 * Parse input string or number to valid clean numeric value
 * @param {any} val
 * @param {number} fallback
 * @returns {number}
 */
export function parseNumber(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

// Word maps for Indian Number-to-Words
const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(num) {
  let str = '';
  if (num >= 100) {
    str += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += ONES[num] + ' ';
  }
  return str.trim();
}

/**
 * Convert numeric amount to words in Indian numbering system
 * @param {number|string} amount - Input amount (e.g. 1250000.50)
 * @returns {string} - e.g. "Twelve Lakh Fifty Thousand Rupees and Fifty Paise Only"
 */
export function numberToIndianWords(amount) {
  const num = parseNumber(amount, 0);
  if (num === 0) return 'Zero Rupees Only';
  if (num < 0) return 'Minus ' + numberToIndianWords(Math.abs(num));

  // Split integer and paise
  const parts = num.toFixed(2).split('.');
  let integerPart = parseInt(parts[0], 10);
  const paisePart = parseInt(parts[1], 10);

  let words = '';

  // Arab (100 Crore = 1 Arab)
  if (integerPart >= 1000000000) {
    const arab = Math.floor(integerPart / 1000000000);
    words += convertBelowThousand(arab) + ' Arab ';
    integerPart %= 1000000000;
  }

  // Crores (1 Crore = 1,00,00,000)
  if (integerPart >= 10000000) {
    const crore = Math.floor(integerPart / 10000000);
    words += convertBelowThousand(crore) + ' Crore ';
    integerPart %= 10000000;
  }

  // Lakhs (1 Lakh = 1,00,000)
  if (integerPart >= 100000) {
    const lakh = Math.floor(integerPart / 100000);
    words += convertBelowThousand(lakh) + ' Lakh ';
    integerPart %= 100000;
  }

  // Thousands (1 Thousand = 1,000)
  if (integerPart >= 1000) {
    const thousand = Math.floor(integerPart / 1000);
    words += convertBelowThousand(thousand) + ' Thousand ';
    integerPart %= 1000;
  }

  // Hundreds and remaining units
  if (integerPart > 0) {
    words += convertBelowThousand(integerPart) + ' ';
  }

  words = words.trim();
  const rupeeUnit = (integerPart === 1 && words === 'One') ? 'Rupee' : 'Rupees';
  let result = words ? `${words} ${rupeeUnit}` : '';

  if (paisePart > 0) {
    const paiseWords = convertBelowThousand(paisePart);
    const paiseUnit = paisePart === 1 ? 'Paise' : 'Paise';
    if (result) {
      result += ` and ${paiseWords} ${paiseUnit}`;
    } else {
      result = `${paiseWords} ${paiseUnit}`;
    }
  }

  return `${result} Only`.trim();
}

