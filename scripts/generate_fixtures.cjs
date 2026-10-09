// scripts/generate_fixtures.cjs
// Generate synthetic applicant test fixtures for autonomous development and testing

const fs = require('fs');
const path = require('path');

const fixtures = {
  'applicant_salaried_doctor.json': {
    "fixtureId": "SYNTH-001",
    "applicantName": "Dr. Aarav Deshmukh",
    "mobile": "919876543210",
    "pan": "ABCDE1234F",
    "aadhaar": "999988887777",
    "bankAccountNumber": "100200300400",
    "bankName": "State Bank of India",
    "city": "Latur",
    "geography": "MAHARASHTRA",
    "employmentType": "SELF_EMPLOYED_PROFESSIONAL",
    "profession": "DOCTOR",
    "loanProduct": "DOCTOR_LOAN",
    "monthlyIncome": 120000,
    "existingMonthlyObligations": 15000,
    "requestedLoanAmount": 2500000,
    "requestedTenureMonths": 60,
    "cibilScore": 780,
    "dpdLast12Months": 0,
    "ageYears": 35,
    "consentGranted": true,
    "optInGiven": true,
    "transactions": [
      { "date": "2026-08-01", "narration": "CONSULTING FEES CREDIT", "credit": 60000, "debit": 0, "balance": 120000 },
      { "date": "2026-08-15", "narration": "HOSPITAL RETAINERSHIP SALARY CR", "credit": 60000, "debit": 0, "balance": 180000 },
      { "date": "2026-08-18", "narration": "CAR LOAN EMI HDFC", "credit": 0, "debit": 15000, "balance": 165000 }
    ]
  },
  'applicant_self_employed_retailer.json': {
    "fixtureId": "SYNTH-002",
    "applicantName": "Suresh Patil",
    "mobile": "919822334455",
    "pan": "BGHPK4321M",
    "aadhaar": "888877776666",
    "bankAccountNumber": "500600700800",
    "bankName": "ICICI Bank",
    "city": "Latur",
    "geography": "MAHARASHTRA",
    "employmentType": "SELF_EMPLOYED_BUSINESS",
    "profession": "RETAIL_TRADER",
    "loanProduct": "BUSINESS_LOAN",
    "monthlyIncome": 85000,
    "existingMonthlyObligations": 12000,
    "requestedLoanAmount": 1000000,
    "requestedTenureMonths": 48,
    "cibilScore": 715,
    "dpdLast12Months": 0,
    "ageYears": 42,
    "consentGranted": true,
    "optInGiven": true,
    "transactions": [
      { "date": "2026-08-05", "narration": "UPI QR SALES COLLECTION", "credit": 45000, "debit": 0, "balance": 90000 },
      { "date": "2026-08-20", "narration": "DISTRIBUTOR PAYMENT", "credit": 0, "debit": 30000, "balance": 60000 },
      { "date": "2026-08-25", "narration": "BUSINESS CURRENT ACC SALES", "credit": 40000, "debit": 0, "balance": 100000 }
    ]
  },
  'applicant_salaried_software_engineer.json': {
    "fixtureId": "SYNTH-003",
    "applicantName": "Pooja Kulkarni",
    "mobile": "919765432109",
    "pan": "PQRST5678Z",
    "aadhaar": "777766665555",
    "bankAccountNumber": "300400500600",
    "bankName": "HDFC Bank",
    "city": "Pune",
    "geography": "MAHARASHTRA",
    "employmentType": "SALARIED",
    "profession": "SOFTWARE_ENGINEER",
    "loanProduct": "PERSONAL_LOAN",
    "monthlyIncome": 65000,
    "existingMonthlyObligations": 8000,
    "requestedLoanAmount": 500000,
    "requestedTenureMonths": 36,
    "cibilScore": 760,
    "dpdLast12Months": 0,
    "ageYears": 28,
    "consentGranted": true,
    "optInGiven": true,
    "transactions": [
      { "date": "2026-08-01", "narration": "INFOSYS SALARY CREDIT AUG26", "credit": 65000, "debit": 0, "balance": 95000 },
      { "date": "2026-08-05", "narration": "PERSONAL LOAN EMI", "credit": 0, "debit": 8000, "balance": 87000 }
    ]
  },
  'applicant_borderline_foir.json': {
    "fixtureId": "SYNTH-004",
    "applicantName": "Rahul Shinde",
    "mobile": "919123456780",
    "pan": "DEFGH9876Q",
    "aadhaar": "666655554444",
    "bankAccountNumber": "400500600700",
    "bankName": "Axis Bank",
    "city": "Latur",
    "geography": "MAHARASHTRA",
    "employmentType": "SALARIED",
    "profession": "CLERK",
    "loanProduct": "PERSONAL_LOAN",
    "monthlyIncome": 40000,
    "existingMonthlyObligations": 20000,
    "requestedLoanAmount": 500000,
    "requestedTenureMonths": 36,
    "cibilScore": 735,
    "dpdLast12Months": 0,
    "ageYears": 38,
    "consentGranted": true,
    "optInGiven": true,
    "transactions": []
  },
  'applicant_negative_bureau_cibil.json': {
    "fixtureId": "SYNTH-005",
    "applicantName": "Vikas Jadhav",
    "mobile": "919811223344",
    "pan": "JKLMN4321P",
    "aadhaar": "555544443333",
    "bankAccountNumber": "800900100200",
    "bankName": "Bank of Baroda",
    "city": "Latur",
    "geography": "MAHARASHTRA",
    "employmentType": "SALARIED",
    "profession": "SALES_EXEC",
    "loanProduct": "PERSONAL_LOAN",
    "monthlyIncome": 45000,
    "existingMonthlyObligations": 5000,
    "requestedLoanAmount": 300000,
    "requestedTenureMonths": 36,
    "cibilScore": 610,
    "dpdLast12Months": 60,
    "ageYears": 31,
    "consentGranted": true,
    "optInGiven": true,
    "transactions": [
      { "date": "2026-08-02", "narration": "ECS RETURN INSUFFICIENT FUNDS", "credit": 0, "debit": 500, "balance": 1200 },
      { "date": "2026-08-10", "narration": "CHQ RET BOUNCE CHARGES", "credit": 0, "debit": 590, "balance": 610 }
    ]
  },
  'applicant_missing_consent.json': {
    "fixtureId": "SYNTH-006",
    "applicantName": "Anita More",
    "mobile": "919833445566",
    "pan": "STUVW6789X",
    "aadhaar": "444433332222",
    "bankAccountNumber": "900100200300",
    "bankName": "Canara Bank",
    "city": "Latur",
    "geography": "MAHARASHTRA",
    "employmentType": "SALARIED",
    "profession": "TEACHER",
    "loanProduct": "PERSONAL_LOAN",
    "monthlyIncome": 55000,
    "existingMonthlyObligations": 0,
    "requestedLoanAmount": 400000,
    "requestedTenureMonths": 48,
    "cibilScore": 750,
    "dpdLast12Months": 0,
    "ageYears": 40,
    "consentGranted": false,
    "optInGiven": false,
    "transactions": []
  }
};

const outDir = path.resolve(__dirname, '../data/synthetic-fixtures');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

Object.entries(fixtures).forEach(([fileName, content]) => {
  const filePath = path.join(outDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`Generated fixture: ${filePath}`);
});
