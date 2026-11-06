import useSEO from '../hooks/useSEO';
import brandLogo from '../assets/avani-brand-logo.png';
import './Privacy.css';

export default function Disclaimer() {
  useSEO({
    title: 'Disclaimer & Financial Regulatory Notice | Avani Loan Services',
    description: 'Statutory disclaimer and financial regulatory disclosures for Avani Loan Services — Loan advisory and DSA in Maharashtra.',
    keywords: 'Disclaimer, Regulatory Notice, Avani Loan Services, DSA, Loans, Maharashtra'
  });

  return (
    <div className="disclaimer-page">
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Regulatory Notice</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Financial & Regulatory Disclaimer</h1>
          <p>Important Legal Notice & Advisory Disclosures</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-body glass-card">
            <h2>1. Direct Selling Agent (DSA) Status</h2>
            <p>
              Avani Loan Services is an independent financial consulting and credit facilitation agency (Direct Selling Agent / Referral Partner) headquartered in Latur, Maharashtra.
              We are <strong>not</strong> a bank, Non-Banking Financial Company (NBFC), or housing finance company registered under Section 45-IA of the RBI Act, 1934.
            </p>

            <h2>2. No Direct Lending or Underwriting Authority</h2>
            <p>
              Avani Loan Services does not approve, underwrite, issue sanction letters, or disburse loans directly.
              Our role is strictly limited to assisting retail borrowers, business enterprises, residential property builders, and educational institutions in identifying suitable debt products, preparing documentation, and facilitating applications with RBI-regulated commercial banks and NBFCs.
            </p>

            <h2>3. Interest Rates, Tenures & Terms</h2>
            <p>
              Any interest rates, loan tenures, loan-to-value (LTV) ratios, and Equated Monthly Installment (EMI) figures displayed on this website or calculated using our financial tools are indicative estimates intended for informational and comparison purposes only.
              The final loan sanction, applicable interest rate (fixed or floating), processing charges, and documentation requirements are subject to the applicant's credit score (CIBIL/Experian), income verification, legal & technical title scrutiny of collateral, and the lending policy of the respective bank or NBFC.
            </p>

            <h2>4. Public Warning Against Advance Fraud</h2>
            <div className="notice-box" style={{ background: '#fffbeb', padding: '16px', borderLeft: '4px solid #d97706', borderRadius: '4px', margin: '16px 0' }}>
              <strong>Public Caution:</strong> Avani Loan Services does not collect advance cash payments, registration deposits, or refundable security amounts via personal payment apps or UPI for loan processing.
              If any person claiming to represent Avani Loan Services requests money transfer to a personal bank account or mobile wallet for loan sanction, please do not make the payment and immediately report it to <a href="mailto:enquiry@avanifinserv.com">enquiry@avanifinserv.com</a> or <a href="tel:+919175635165">+91-9175635165</a>.
            </div>

            <h2>5. Institutional & Builder Intelligence Disclosures</h2>
            <p>
              Information within our Builder Partnerships and Educational Institutional Funding databases is compiled from verified public regulatory registries (including MahaRERA, state university gazettes, AICTE, and public educational trust registries) and verified field research.
              Estimated funding requirements represent capacity analyses and do not constitute confirmed credit obligations or executed contracts until formal term sheets are exchanged between lenders and institutional authorities.
            </p>

            <h2>6. Third-Party Trademarks & Banking Names</h2>
            <p>
              All bank names, logos, and NBFC trademarks referenced on this website are the property of their respective financial institutions and are used solely for descriptive identification of partner financing channels.
            </p>

            <h2>7. Contact and Grievance Officer</h2>
            <p>
              For regulatory clarifications, feedback, or grievances, please reach our designated compliance officer:
            </p>
            <ul>
              <li><strong>Contact:</strong> Avani Loan Services Compliance Desk</li>
              <li><strong>Address:</strong> Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</li>
              <li><strong>Phone:</strong> <a href="tel:+919175635165">+91-9175635165</a></li>
              <li><strong>Email:</strong> <a href="mailto:enquiry@avanifinserv.com">enquiry@avanifinserv.com</a></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
