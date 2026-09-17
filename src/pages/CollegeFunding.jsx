import React from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  CheckCircle2,
  Building2,
  GraduationCap,
  ArrowRight,
  MessageCircle,
  Phone,
  ShieldCheck,
  FileText,
  Landmark,
  Award,
  Microscope,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/avani-brand-logo.png';
import educationImg from '../assets/education-loan.png';

export default function CollegeFunding() {
  useSEO({
    title: 'College & Higher Education Funding in Maharashtra | AVANI LOAN SERVICES',
    description: 'Institutional debt syndication and project finance for engineering colleges, medical institutes, pharmacy colleges, polytechnics, and university campuses in Maharashtra.',
    keywords: 'college funding Maharashtra, higher education finance, engineering college loan Latur, medical college finance, NAAC university funding, education project finance'
  });

  const whatsappInquiryUrl = `https://wa.me/919175635165?text=${encodeURIComponent('Hello AVANI LOAN SERVICES, I am interested in College & Higher Education Institutional Funding for our institute. Please provide advisory assistance.')}`;

  return (
    <div className="college-funding-page">
      {/* ── Header ── */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Higher Education Debt Advisory</span>
              <div className="page-header-address">
                Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India
              </div>
            </div>
          </div>
          <h1>College & Higher Education Funding</h1>
          <p>
            Strategic credit syndication for universities, professional degree colleges, and higher educational trusts across Maharashtra. Structured financing from ₹25 Lakhs up to ₹25 Crores.
          </p>
        </div>
      </section>

      {/* ── Hero Overview ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#0052CC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                Advanced Campus Financing
              </span>
              <h2 style={{ fontSize: '2rem', color: '#091E3A', margin: '8px 0 16px 0', lineHeight: 1.3 }}>
                Project Capital for Professional Colleges, Advanced Labs & Hostels
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem', marginBottom: '20px' }}>
                Higher education institutions require substantial multi-year capital for laboratory certifications, regulatory compliances (AICTE, NMC, PCI, UGC), student hostel infrastructure, and NAAC accreditation standards. AVANI LOAN SERVICES provides custom-tailored project debt financing with long amortizations.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/contact?product=College%20Funding" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Apply for College Funding <ArrowRight size={16} />
                </Link>
                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ background: '#25D366', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <MessageCircle size={18} /> Chat on WhatsApp
                </a>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', overflow: 'hidden' }}>
              <img
                src={educationImg}
                alt="College Infrastructure & Higher Education Debt"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Specialized Financing Verticals ── */}
      <section className="section section-bg">
        <div className="container">
          <h2 style={{ textAlign: 'center', color: '#091E3A', marginBottom: '10px' }}>
            Higher Education Project Verticals
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', maxWidth: '680px', margin: '0 auto 40px auto' }}>
            Multi-lender loan syndication specifically structured for degree institutes and technical universities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Landmark size={36} color="#0052CC" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>Engineering & Technical Colleges</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Expansion capital for compute clusters, CNC workshop machinery, AI/Robotics centers of excellence, and department buildings.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Microscope size={36} color="#0284C7" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>Medical, Dental & Pharmacy Institutes</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Compliance-focused debt for hospital attachments, diagnostic equipment, pharmacology labs, and council licensing prerequisites.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Building2 size={36} color="#D97706" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>Student Hostels & Residential Towers</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Long-tenure term loans for on-campus student housing, dining halls, sports facilities, and faculty residential quarters.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Award size={36} color="#16A34A" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>NAAC & Accreditation Upgrades</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Financing dedicated to campus infrastructure enhancements mandated for achieving top-tier NAAC, NBA, and autonomous status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Metrics & Criteria ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '28px', borderRadius: '12px' }}>
              <h3 style={{ color: '#091E3A', fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#0052CC" /> Financial Facility Details
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Facility Quantum</span>
                  <strong style={{ color: '#091E3A' }}>₹25 Lakhs to ₹25 Crores</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Interest Rates</span>
                  <strong style={{ color: '#0052CC' }}>8.75% – 12.50% p.a.</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Amortization Tenure</span>
                  <strong style={{ color: '#091E3A' }}>Up to 15 Years</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Construction Moratorium</span>
                  <strong style={{ color: '#091E3A' }}>Up to 24 Months</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Structuring</span>
                  <strong style={{ color: '#091E3A' }}>Term Loan / Lease Rental / Escrow</strong>
                </li>
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '28px', borderRadius: '12px' }}>
              <h3 style={{ color: '#091E3A', fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#16A34A" /> Trust Eligibility Standards
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Approved by respective statutory councils (AICTE, NMC, PCI, UGC, DTE).</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Affiliated with recognized state university or operating as deemed/private university.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>3 years audited balance sheets with healthy debt service coverage ratio (DSCR).</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Clear title or long registered lease on campus land parcel.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Stable student enrollment rates and transparent fee escrow mechanisms.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Consultation CTA ── */}
      <section className="section section-bg">
        <div className="container text-center">
          <h2 style={{ color: '#091E3A', marginBottom: '12px' }}>Consult with Our Higher Education Financial Specialists</h2>
          <p style={{ color: '#64748B', maxWidth: '640px', margin: '0 auto 24px auto' }}>
            Schedule an in-person or confidential virtual briefing with our senior syndicate advisors in Latur for your college project funding.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/documents#college-funding" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> View College Document List
            </Link>
            <Link to="/contact?product=College%20Funding" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Apply for College Loan <ArrowRight size={16} />
            </Link>
            <a href={PHONE_NUMBER} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} /> Call {DISPLAY_PHONE}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
