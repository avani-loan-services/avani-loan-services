import useSEO from '../hooks/useSEO';
import brandLogo from '../assets/avani-brand-logo.png';
import './Privacy.css';

export default function Privacy() {
  useSEO({ title: 'Privacy - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: 'Privacy, Loan, Avani Finserv, Latur' });

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Legal</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Privacy Policy</h1>
          <p>Last updated: April 10, 2025</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="privacy-body glass-card">

            <p>Avani Loan Services ("we", "us", or "our") operates this website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.</p>

            <h2>1. Information We Collect</h2>
            <p>We collect information you voluntarily provide through our loan enquiry forms including:</p>
            <ul>
              <li>Full Name</li>
              <li>Mobile Number</li>
              <li>Email Address</li>
              <li>Loan Requirements (type, amount)</li>
              <li>City / Location</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>The information we collect is used exclusively to:</p>
            <ul>
              <li>Process your loan enquiry and connect you with our advisors</li>
              <li>Contact you for loan consultation services</li>
              <li>Send relevant loan offers (with your explicit consent)</li>
              <li>Improve our services and website experience</li>
            </ul>

            <h2>3. Data Sharing</h2>
            <p>Your personal data may be shared with:</p>
            <ul>
              <li>Banking partners and NBFCs to process your loan application</li>
              <li>Our CRM provider (Zoho CRM) for lead management</li>
            </ul>
            <p>We <strong>do not sell</strong> your data to third-party advertisers or data brokers.</p>

            <h2>4. Data Security</h2>
            <p>We implement reasonable security measures to protect your personal information. All form submissions are transmitted over HTTPS (SSL encrypted) connections.</p>

            <h2>5. Cookies</h2>
            <p>This website uses cookies to enhance your browsing experience. You can disable cookies in your browser settings, though this may affect some website functionality.</p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Request access to your personal data we hold</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>

            <h2>7. Contact Us Regarding Privacy</h2>
            <p>For any privacy-related inquiries, contact us at:</p>
            <ul>
              <li>📧 Email: <a href="mailto:enquiry@avanifinserv.com">enquiry@avanifinserv.com</a></li>
              <li>📞 Phone: <a href="tel:+919175635165">+91-9175635165</a></li>
              <li>📍 Address: Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</li>
            </ul>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this policy periodically. Continued use of our website constitutes acceptance of the updated policy.</p>

            <p className="privacy-footer">© 2025 Avani Loan Services. All rights reserved. Registered DSA — serving Maharashtra.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
