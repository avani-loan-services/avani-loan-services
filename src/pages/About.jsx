import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import { CheckCircle, Award, Users, TrendingUp, ArrowRight } from 'lucide-react';
import LeadForm from '../components/LeadForm';
import brandLogo from '../assets/avani-brand-logo.png';
import './About.css';

const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Baroda', 'Punjab National Bank', 'Bajaj Finserv', 'Tata Capital', 'Fullerton India'];
const stats = [
  { icon: <Users size={32} />, num: '500+', label: 'Happy Clients' },
  { icon: <Award size={32} />, num: '5+', label: 'Years Experience' },
  { icon: <TrendingUp size={32} />, num: '₹50Cr+', label: 'Loans Disbursed' },
  { icon: <CheckCircle size={32} />, num: '98%', label: 'Approval Rate' },
];

export default function About() {
  useSEO({ title: 'About - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: 'About, Loan, Avani Finserv, Latur' });

  return (
    <div className="about-page">
      {/* Page Header */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">About Us</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Latur's Most Trusted Loan Advisor</h1>
          <p>Serving Maharashtra with transparency and dedication since 2019</p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-image-block">
              <div className="about-logo-wrapper glass-card">
                <img src={brandLogo} alt="Avani Loan Services" className="about-logo" />
                <p className="img-location">📍 Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</p>
              </div>
              <div className="certifications">
                <div className="cert-badge"><Award size={18} /> Registered DSA Partner</div>
                <div className="cert-badge"><CheckCircle size={18} /> RBI Compliant</div>
              </div>
            </div>
            <div className="about-text">
              <span className="badge">Our Story</span>
              <h2>We Believe Everyone Deserves Financial Freedom</h2>
              <p><strong>🤝 AVANI LOAN SERVICE IS THE TRUSTED PARTNER OF STAR POWERZ DIGITAL TECHNOLOGIES PVT LTD</strong></p>
              <p><strong>Registered Office:</strong> 5-9-30/5, Level 2, Paigah Plaza, Basheerbagh, Hyderabad, Telangana, India - 500063</p>
              <p><strong>Owner:</strong> Sachin Shinde</p>
              <p>Avani Loan Services is a Latur-based Direct Selling Agent (DSA) helping individuals, business owners, and students across Maharashtra acquire the right loan product at the right rates.</p>
              <p style={{ marginTop: 16 }}>Founded with a mission to simplify the loan process for common people, we have partnered with 10+ leading banks and NBFCs ensuring you get competitive interest rates without running from branch to branch.</p>
              <ul className="about-points">
                {['Free loan consultation — no hidden charges', 'Expert guidance from application to disbursement', 'Serving Latur, Osmanabad, Nanded, Solapur & all Maharashtra', 'Bilingual support in Marathi, Hindi & English', 'Specialized in CIBIL score improvement advisory'].map((p, i) => (
                  <li key={i}><CheckCircle size={18} color="var(--primary)" /> {p}</li>
                ))}
              </ul>
              <Link to="/contact" className="btn btn-primary" style={{ marginTop: 24 }}>Book Free Consultation <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section section-bg stats-section">
        <div className="container">
          <div className="grid grid-4">
            {stats.map((s, i) => (
              <div key={i} className="stat-card glass-card text-center">
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-num">{s.num}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bank Partners */}
      <section className="section">
        <div className="container text-center">
          <span className="badge">Our Partners</span>
          <h2 className="section-title">Banks & NBFCs We Work With</h2>
          <p className="section-subtitle">We have tie-ups with all major banks so you always get the best rate.</p>
          <div className="banks-grid">
            {banks.map((b, i) => (
              <div key={i} className="bank-pill">{b}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mission-section section">
        <div className="container text-center">
          <span className="badge">Our Mission</span>
          <h2 className="section-title">Empowering Maharashtra, One Loan at a Time</h2>
          <p style={{ fontSize: '1.15rem', maxWidth: 700, margin: '0 auto 32px', color: 'var(--text-light)' }}>
            Our mission is to provide every person in Maharashtra access to fair, fast, and friction-free financial services — regardless of their background, occupation, or location.
          </p>
          <LeadForm compact={true} />
        </div>
      </section>
    </div>
  );
}
