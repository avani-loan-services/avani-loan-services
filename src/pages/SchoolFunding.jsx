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
  Bus,
  Laptop,
  Coins,
  Sparkles
} from 'lucide-react';
import { PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import brandLogo from '../assets/avani-brand-logo.png';
import educationImg from '../assets/education-loan.png';

export default function SchoolFunding() {
  useSEO({
    title: 'School Funding & Infrastructure Loans in Maharashtra | AVANI LOAN SERVICES',
    description: 'Specialized institutional finance for school trusts, private schools, CBSE/ICSE boards, Smart Classrooms, school buses, and campus expansion across Maharashtra.',
    keywords: 'school funding Maharashtra, school loan Latur, school infrastructure finance, education trust funding, school bus loan, Smart classroom funding'
  });

  const whatsappInquiryUrl = `https://wa.me/919175635165?text=${encodeURIComponent('Hello AVANI LOAN SERVICES, I am interested in School Funding & Infrastructure Finance for our educational institution. Please share details.')}`;

  return (
    <div className="school-funding-page">
      {/* ── Header ── */}
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Institutional Education Finance</span>
              <div className="page-header-address">
                Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India
              </div>
            </div>
          </div>
          <h1>School Infrastructure & Expansion Funding</h1>
          <p>
            Customized debt capital solutions for registered school trusts, private schools, and educational societies across Maharashtra. From ₹10 Lakhs up to ₹10 Crores.
          </p>
        </div>
      </section>

      {/* ── Hero Overview ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#0052CC', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
                Empowering Maharashtra Schools
              </span>
              <h2 style={{ fontSize: '2rem', color: '#091E3A', margin: '8px 0 16px 0', lineHeight: 1.3 }}>
                Capital for Modern Classrooms, Campus Expansion & Transport Fleets
              </h2>
              <p style={{ color: '#475569', lineHeight: 1.6, fontSize: '1rem', marginBottom: '20px' }}>
                Educational institutions face distinct cash flow patterns driven by academic term fee cycles. AVANI LOAN SERVICES bridges the gap by structuring structured institutional term loans and credit lines matched to your fee collection calendar.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/contact?product=School%20Funding" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  Apply for School Funding <ArrowRight size={16} />
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
                alt="School Infrastructure & Education Loan"
                style={{ width: '100%', height: 'auto', borderRadius: '8px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Funding Categories ── */}
      <section className="section section-bg">
        <div className="container">
          <h2 style={{ textAlign: 'center', color: '#091E3A', marginBottom: '10px' }}>
            Purpose-Built Institutional Schemes
          </h2>
          <p style={{ textAlign: 'center', color: '#64748B', maxWidth: '680px', margin: '0 auto 40px auto' }}>
            Multi-lender loan syndication specifically structured for educational trusts and societies.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Building2 size={36} color="#0052CC" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>Campus & Building Construction</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Funding for new classroom wings, scientific laboratories, sports grounds, modern auditoriums, and administrative blocks.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Laptop size={36} color="#0284C7" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>Smart Classrooms & EdTech</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Equipment finance for digital smart boards, robotics labs, computer centers, high-speed campus networking, and STEM infrastructure.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Bus size={36} color="#D97706" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>School Bus & Fleet Finance</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Specialized commercial vehicle loans for purchasing new or upgrading existing school buses, vans, and student transport vehicles.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '12px' }}>
              <Coins size={36} color="#16A34A" style={{ marginBottom: '14px' }} />
              <h3 style={{ color: '#091E3A', fontSize: '1.2rem', marginBottom: '8px' }}>Working Capital & Fee Bridging</h3>
              <p style={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.5 }}>
                Overdraft and term facilities to smooth seasonal cash flows, staff salaries, annual maintenance, and operational overheads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Loan Parameters & Eligibility ── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            <div className="glass-card" style={{ padding: '28px', borderRadius: '12px' }}>
              <h3 style={{ color: '#091E3A', fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#0052CC" /> Key Financial Terms
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Loan Amount</span>
                  <strong style={{ color: '#091E3A' }}>₹10 Lakhs to ₹10 Crores</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Interest Rate</span>
                  <strong style={{ color: '#0052CC' }}>9.50% – 13.50% p.a.</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Repayment Tenure</span>
                  <strong style={{ color: '#091E3A' }}>12 to 120 Months</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
                  <span style={{ color: '#64748B' }}>Moratorium</span>
                  <strong style={{ color: '#091E3A' }}>Available for construction</strong>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Collateral</span>
                  <strong style={{ color: '#091E3A' }}>Trust property / Unsecured up to ₹50L</strong>
                </li>
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '28px', borderRadius: '12px' }}>
              <h3 style={{ color: '#091E3A', fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#16A34A" /> Eligibility Criteria
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Registered Educational Trust, Society, or Section 8 entity in Maharashtra.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Minimum 3 consecutive academic years of successful operational history.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#16A34A', marginTop: '2px' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: '#334155' }}>Valid affiliation / NOC from State Board, CBSE, or ICSE.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Verifiable student fee collection bank records with positive cash balances.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.92rem', color: '#334155' }}>
                  <CheckCircle2 size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Clean credit repayment record of trustees and management committee.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Document Checklist CTA ── */}
      <section className="section section-bg">
        <div className="container text-center">
          <h2 style={{ color: '#091E3A', marginBottom: '12px' }}>Ready to Structure Your School Funding?</h2>
          <p style={{ color: '#64748B', maxWidth: '640px', margin: '0 auto 24px auto' }}>
            Review the detailed documentation checklist or speak directly with our Senior Institutional Advisory team in Latur.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/documents#school-funding" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} /> View School Document List
            </Link>
            <Link to="/contact?product=School%20Funding" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Apply for School Loan <ArrowRight size={16} />
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
