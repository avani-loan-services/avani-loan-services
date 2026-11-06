import useSEO from '../hooks/useSEO';
import brandLogo from '../assets/avani-brand-logo.png';
import './Privacy.css';

export default function Terms() {
  useSEO({
    title: 'Terms and Conditions | Avani Loan Services',
    description: 'Terms and conditions governing the financial facilitation and advisory services of Avani Loan Services in Maharashtra, India.',
    keywords: 'Terms, Conditions, Legal, Avani Loan Services, DSA, Financial Facilitation, Maharashtra'
  });

  return (
    <div className="terms-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Legal Terms</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Terms and Conditions</h1>
          <p>Effective Date: November 6, 2026</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-body glass-card">
            <h2>1. Nature of Business & Direct Selling Agent (DSA) Disclosure</h2>
            <p>
              Avani Loan Services operates as a professional financial facilitation firm, corporate advisory, and authorized Direct Selling Agent (DSA).
              We partner with Reserve Bank of India (RBI) regulated commercial banks, housing finance companies (HFCs), and Non-Banking Financial Companies (NBFCs).
            </p>
            <div className="notice-box" style={{ background: '#f8fafc', padding: '16px', borderLeft: '4px solid #2563eb', borderRadius: '4px', margin: '16px 0' }}>
              <strong>Important Statutory Disclosure:</strong> Avani Loan Services is <strong>NOT</strong> a bank, NBFC, or direct lender.
              We do not directly disburse loans, issue credit cards, accept public deposits, or collect advance cash security fees.
              All loan underwriting, interest rate approvals, sanction letters, and disbursements are executed exclusively by our partner banks and NBFCs at their sole discretion.
            </div>

            <h2>2. Permitted Use of Website & Consultation Services</h2>
            <p>
              By accessing this website (https://www.avanifinserv.com or https://avanifinserv.com), you agree to provide true, accurate, current, and complete information when submitting loan enquiries, builder partnership forms, or institutional funding requests.
              Any unauthorized use of our proprietary builder intelligence, institutional records, calculators, or administrative portals is strictly prohibited.
            </p>

            <h2>3. No Advance Fee Guarantee</h2>
            <p>
              Avani Loan Services strictly adheres to fair lending standards. We <strong>never</strong> request cash payments or advance processing fees through personal UPI IDs or unofficial channels.
              Official processing fees (if applicable) are paid directly to the lending bank or NBFC via designated banking instruments after receiving a formal sanction letter.
            </p>

            <h2>4. Intellectual Property Rights</h2>
            <p>
              All trademarks, service marks, logos, brand elements, calculators, software algorithms, and database compilations displayed on this portal are the intellectual property of Avani Loan Services or licensed partners.
              Unauthorized reproduction, web scraping, redistribution, or framing without prior written consent is actionable under the Copyright Act, 1957 and Information Technology Act, 2000.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              Avani Loan Services makes every reasonable effort to ensure the accuracy of loan calculators, interest rate estimates, and eligibility parameters.
              However, final eligibility, interest rates, loan-to-value (LTV) ratios, processing fees, and repayment schedules are determined solely by lending institutions after comprehensive credit appraisal and physical verification.
              Avani Loan Services shall not be held liable for any delay, rejection, or modification of loan terms by partner financial institutions.
            </p>

            <h2>6. Governing Law and Jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
              Any disputes or legal proceedings arising out of or relating to our services shall be subject to the exclusive jurisdiction of the competent courts in Latur, Maharashtra, India.
            </p>

            <h2>7. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding these Terms and Conditions, please contact our Legal & Compliance Desk:
            </p>
            <ul>
              <li><strong>Firm:</strong> Avani Loan Services</li>
              <li><strong>Corporate Address:</strong> Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</li>
              <li><strong>Telephone:</strong> <a href="tel:+919175635165">+91-9175635165</a></li>
              <li><strong>Email:</strong> <a href="mailto:enquiry@avanifinserv.com">enquiry@avanifinserv.com</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
