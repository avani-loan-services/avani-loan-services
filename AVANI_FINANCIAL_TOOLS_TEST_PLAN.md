# AVANI FINANCIAL TOOLS & LOAN ELIGIBILITY PLATFORM
## Master Automated Test Plan & Validation Protocol

**Organization:** AVANI LOAN SERVICES (https://www.avanifinserv.com/)  
**Document Code:** ALS-TEST-2026-001  
**Coverage Standard:** Minimum 5 Normal Cases, 3 Edge Cases, 2 Invalid Input Cases per Calculator (Total: >= 200 automated cases).

---

## 1. Test Strategy Overview
The test plan ensures 100% mathematical precision, boundary resistance, and functional integrity across all 20 calculators, authentication middleware, document processing, and zero-regression on existing routes.

### Test Suites:
1. **Mathematical Accuracy Suite**: Unit testing all 20 calculation formulas against independent banking reference models.
2. **Security & Auth Suite**: Verification of password gate, rate limiting, HttpOnly cookies, session expiration, and unauthorized access rejection.
3. **Document Engine Suite**: File format verification (PDF, JPG, PNG), size limit compliance, OCR execution, and read-only preservation of source files.
4. **Eligibility Engine Suite**: Verification of FOIR, Multiplier, and Product-specific calculation logic with document review overrides.
5. **Zero-Regression Suite**: Automated checks verifying that the public website, CRM, and WhatsApp webhook endpoints operate without error.

---

## 2. Calculator Test Matrix

### A. Loan Calculators (10 Tools)
| Calculator | Benchmark Case | Edge Case | Invalid Case |
|---|---|---|---|
| 1.1 EMI Calculator | ₹10L @ 10% for 5 yrs -> EMI ₹21,247 | Rate = 0%, Tenure = 40 yrs, Amount = ₹10 Cr | Negative amount, string input, 0 tenure |
| 1.2 FOIR Eligibility | Income ₹1L, EMI ₹20k, FOIR 50% -> Available ₹30k | Existing EMI > Income, FOIR = 100% | Negative income, negative existing EMI |
| 1.3 Multiplier Eligibility | Income ₹50k, 60x multiplier -> Gross ₹30L | Multiplier = 10x / 120x, Large obligations | Negative multiplier, 0 income |
| 1.4 Outstanding Loan | ₹10L @ 10% for 5 yrs after 24 EMIs | EMIs Paid = 0, EMIs Paid = Total Months | EMIs Paid > Total Months |
| 1.5 Foreclosure | ₹5L @ 2% fee + 18% GST -> Fee ₹10k, GST ₹1.8k | Fee = 0%, GST = 0%, Large other charges | Negative balance, negative GST |
| 1.6 Overdraft (OD) | Limit ₹10L, Utilized ₹4L @ 12% for 30 days | Utilized = 0, Utilized = Full Limit, 1 day | Utilized > Limit, Negative days |
| 1.7 Loan Comparison | Loan A (9.5%) vs Loan B (10.5%) for 5 yrs | Identical loans, 0% vs non-0% rate | Missing loan parameters |
| 1.8 Prepayment | ₹10L @ 10%, 48m left, ₹2L lump sum | Prepayment = Full balance, 0 lump sum | Prepayment > Balance |
| 1.9 Rate Change | ₹10L from 10% to 11% for 48m | Rate drops, Massive rate hike | New rate = 0 |
| 1.10 GST on Interest | ₹10,000 @ 18% -> CGST ₹900, SGST ₹900 | 0% GST, 28% GST | Negative base fee |

### B. Investment Calculators (5 Tools)
| Calculator | Benchmark Case | Edge Case | Invalid Case |
|---|---|---|---|
| 2.1 FD Calculator | ₹1L @ 7% for 12m quarterly -> ₹1,07,186 | Monthly vs Yearly compounding, 0% rate | Negative deposit, 0 months |
| 2.2 RD Calculator | ₹5,000/mo @ 7% for 12m | 1 month deposit, 10-year deposit | Negative monthly amount |
| 2.3 SIP Calculator | ₹10,000/mo @ 12% for 5 yrs -> ₹8,24,864 | 1 yr vs 30 yrs, 0% expected return | Negative monthly investment |
| 2.4 Interest (SI/CI) | ₹1L @ 10% for 2 yrs -> SI ₹20k, CI ₹21k | 1 day interest, Daily compounding | Negative principal |
| 2.5 PPF Calculator | ₹1.5L/yr @ 7.1% for 15 yrs -> Maturity > ₹40L | Partial yearly deposits, 15+ years | Contribution > ₹1.5 Lakh limit |

### C. Other Financial Tools (5 Tools)
| Calculator | Benchmark Case | Edge Case | Invalid Case |
|---|---|---|---|
| 3.1 GST Calculator | ₹1,000 @ 18% Add (₹1,180) & Remove (₹847.46) | 0%, 5%, 12%, 18%, 28% | Negative amounts |
| 3.2 Profit & Margin | Cost ₹800, Sale ₹1,000 -> Profit ₹200 (25%), Margin 20% | Breakeven (0 profit), 100% loss | Negative cost price |
| 3.3 Discount Calculator | ₹1,000 @ 10% discount -> ₹900 | 0% discount, 100% free | Discount > 100% |
| 3.4 Cash Note Counter | 500x10 + 200x5 + 100x20 = ₹8,000 (35 notes) | Custom denominations, 0 notes | Negative count |
| 3.5 Amount to Words | ₹12,50,000 -> Twelve Lakh Fifty Thousand Rupees Only | Single rupee, Crores, Decimal Paise | Negative values |

---

## 3. Test Execution Command
Run the master automated validation script via npm/node:
```powershell
node scripts/testMasterFinancialTools.cjs
```
