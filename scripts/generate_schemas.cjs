// scripts/generate_schemas.cjs
// Generate canonical JSON schemas for lending automation domains

const fs = require('fs');
const path = require('path');

const schemas = {
  'lead.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "LoanLead",
    "type": "object",
    "required": ["fullName", "mobile", "loanProduct"],
    "properties": {
      "leadId": { "type": "string" },
      "fullName": { "type": "string" },
      "mobile": { "type": "string", "pattern": "^[0-9]{10,12}$" },
      "email": { "type": "string", "format": "email" },
      "loanProduct": { "type": "string", "enum": ["PERSONAL_LOAN", "BUSINESS_LOAN", "DOCTOR_LOAN", "HOME_LOAN", "EDUCATION_LOAN", "MORTGAGE_LOAN"] },
      "requestedAmount": { "type": "number", "minimum": 10000 },
      "source": { "type": "string" },
      "correlationId": { "type": "string" }
    }
  },
  'consent.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "ConsentRecord",
    "type": "object",
    "required": ["consentGranted", "purpose", "timestamp"],
    "properties": {
      "consentGranted": { "type": "boolean" },
      "purpose": { "type": "string" },
      "consentSource": { "type": "string", "enum": ["WEB_FORM", "WHATSAPP_OPTIN", "VERBAL_TELECALL"] },
      "timestamp": { "type": "string" },
      "ipAddressMasked": { "type": "string" }
    }
  },
  'kyc_verification.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "KycVerificationRecord",
    "type": "object",
    "required": ["panMasked", "aadhaarMasked", "status"],
    "properties": {
      "panMasked": { "type": "string", "pattern": "^[X]{5}[0-9]{4}[A-Z]$" },
      "aadhaarMasked": { "type": "string", "pattern": "^[X]{8}[0-9]{4}$" },
      "status": { "type": "string", "enum": ["VERIFIED", "PENDING_DOCS", "REJECTED"] },
      "verifiedAt": { "type": "string" }
    }
  },
  'bank_statement.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "BankStatementNormalized",
    "type": "object",
    "required": ["accountNumberMasked", "totalCredits", "totalDebits", "bounceCount"],
    "properties": {
      "accountNumberMasked": { "type": "string" },
      "bankName": { "type": "string" },
      "totalCredits": { "type": "number" },
      "totalDebits": { "type": "number" },
      "estimatedSalaryIncome": { "type": "number" },
      "bounceCount": { "type": "integer", "minimum": 0 },
      "hasSevereBounceHistory": { "type": "boolean" }
    }
  },
  'foir_assessment.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "FoirAssessment",
    "type": "object",
    "required": ["verifiedMonthlyIncome", "foirPercent", "riskBand", "isWithinPolicy"],
    "properties": {
      "verifiedMonthlyIncome": { "type": "number", "minimum": 0 },
      "existingMonthlyObligations": { "type": "number", "minimum": 0 },
      "proposedMonthlyEmi": { "type": "number", "minimum": 0 },
      "totalMonthlyObligations": { "type": "number", "minimum": 0 },
      "foirPercent": { "type": "number", "minimum": 0, "maximum": 100 },
      "maxEligibleLoanAmount": { "type": "number", "minimum": 0 },
      "riskBand": { "type": "string", "enum": ["PRIME", "STANDARD", "STRETCHED", "CRITICAL_OVERBURDENED"] },
      "isWithinPolicy": { "type": "boolean" }
    }
  },
  'lender_policy.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "LenderPolicyRule",
    "type": "object",
    "required": ["policyId", "lenderId", "product", "policyVersion", "minimumIncomeMonthly", "maximumFoirPercent"],
    "properties": {
      "policyId": { "type": "string" },
      "lenderId": { "type": "string" },
      "product": { "type": "string" },
      "policyVersion": { "type": "string" },
      "minimumIncomeMonthly": { "type": "number" },
      "maximumFoirPercent": { "type": "number" },
      "minimumCibilScore": { "type": "integer" },
      "allowedGeographies": { "type": "array", "items": { "type": "string" } },
      "allowedEmploymentTypes": { "type": "array", "items": { "type": "string" } },
      "requiredDocuments": { "type": "array", "items": { "type": "string" } }
    }
  },
  'bureau_report.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "BureauReport",
    "type": "object",
    "required": ["score", "scoreBand", "dpdLast12Months"],
    "properties": {
      "score": { "type": "integer", "minimum": 300, "maximum": 900 },
      "scoreBand": { "type": "string", "enum": ["EXCELLENT", "GOOD", "FAIR", "HIGH_RISK"] },
      "dpdLast12Months": { "type": "integer", "minimum": 0 },
      "verifiedAt": { "type": "string" }
    }
  },
  'human_review.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "HumanReviewRecord",
    "type": "object",
    "required": ["status", "assignedUnderwriter", "systemSanctionAuthorized"],
    "properties": {
      "status": { "type": "string", "enum": ["PENDING_HUMAN_UNDERWRITER_APPROVAL", "APPROVED_BY_UNDERWRITER", "REJECTED_BY_UNDERWRITER"] },
      "assignedUnderwriter": { "type": "string" },
      "systemSanctionAuthorized": { "type": "boolean" },
      "reviewerNotes": { "type": "string" },
      "decisionTimestamp": { "type": "string" }
    }
  },
  'audit_event.schema.json': {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "AuditEventRecord",
    "type": "object",
    "required": ["auditId", "domain", "event", "status", "timestamp"],
    "properties": {
      "auditId": { "type": "string" },
      "domain": { "type": "string" },
      "event": { "type": "string" },
      "status": { "type": "string" },
      "timestamp": { "type": "string" },
      "details": { "type": "object" }
    }
  }
};

const outDir = path.resolve(__dirname, '../schemas');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Object.entries(schemas).forEach(([fileName, content]) => {
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`Generated schema: ${filePath}`);
});
