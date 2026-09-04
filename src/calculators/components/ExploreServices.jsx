// src/calculators/components/ExploreServices.jsx
// ─────────────────────────────────────────────────────────────────
// Contextual Loan Products & Service Recommendations Component
// Connects financial calculations to official AVANI LOAN SERVICES solutions
// ─────────────────────────────────────────────────────────────────

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  GraduationCap,
  Home,
  Building2,
  FileCheck,
  Stethoscope,
  BookOpen,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import '../styles/calculators.css';

export const LOAN_SERVICES = [
  {
    id: 'salary-loan',
    title: 'Salary Loan',
    subtitle: 'Fast personal loans for salaried employees',
    rate: 'From 10.50% p.a.',
    tenure: 'Up to 5 Years',
    link: '/services/salary-loan',
    calcLink: '/calculators/loan/emi',
    icon: <Briefcase size={20} />,
    description: 'Instant approvals with minimal paperwork for salaried professionals across Maharashtra.',
    calcTags: ['emi', 'foir', 'multiplier', 'outstanding', 'prepayment', 'rate-change']
  },
  {
    id: 'business-loan',
    title: 'Business Loan',
    subtitle: 'Working capital & expansion funding',
    rate: 'From 11.25% p.a.',
    tenure: 'Up to 7 Years',
    link: '/services/business-loan',
    calcLink: '/calculators/loan/overdraft',
    icon: <Building2 size={20} />,
    description: 'Customized credit limits, machinery loans, and working capital for SMEs and traders.',
    calcTags: ['emi', 'foir', 'multiplier', 'overdraft', 'outstanding', 'foreclosure']
  },
  {
    id: 'education-loan-india',
    title: 'Education Loan — India',
    subtitle: 'Secured & unsecured domestic studies',
    rate: 'From 8.85% p.a.',
    tenure: 'Up to 15 Years',
    link: '/services/education-loan',
    calcLink: '/calculators/loan/emi',
    icon: <GraduationCap size={20} />,
    description: 'Comprehensive tuition, hostel, and laptop funding with flexible course moratorium.',
    calcTags: ['emi', 'foir', 'outstanding', 'interest']
  },
  {
    id: 'education-loan-global',
    title: 'Education Loan — Global Studies',
    subtitle: 'Study abroad funding up to ₹1.5 Cr',
    rate: 'From 9.25% p.a.',
    tenure: 'Up to 15 Years',
    link: '/services/education-loan',
    calcLink: '/calculators/loan/emi',
    icon: <GraduationCap size={20} />,
    description: 'Pre-visa sanction letters, living expenses, and international university fee disbursal.',
    calcTags: ['emi', 'foir', 'gst-interest', 'interest']
  },
  {
    id: 'home-loan',
    title: 'Home Loan',
    subtitle: 'Purchase, construction & renovation',
    rate: 'From 8.40% p.a.',
    tenure: 'Up to 30 Years',
    link: '/services/home-loan',
    calcLink: '/calculators/loan/comparison',
    icon: <Home size={20} />,
    description: 'Lowest EMI schemes, doorstep documentation, and seamless balance transfer support.',
    calcTags: ['emi', 'foir', 'comparison', 'prepayment', 'rate-change', 'foreclosure']
  },
  {
    id: 'mortgage-lap',
    title: 'Mortgage / LAP',
    subtitle: 'Loan against residential/commercial property',
    rate: 'From 9.00% p.a.',
    tenure: 'Up to 20 Years',
    link: '/services/mortgage-lap',
    calcLink: '/calculators/loan/emi',
    icon: <Building2 size={20} />,
    description: 'Unlock high-value liquidity against your property with flexible repayment tenures.',
    calcTags: ['emi', 'foir', 'multiplier', 'outstanding', 'foreclosure']
  },
  {
    id: 'ca-loan',
    title: 'Chartered Accountant Loan',
    subtitle: 'Specialized financing for CAs & practitioners',
    rate: 'From 10.25% p.a.',
    tenure: 'Up to 5 Years',
    link: '/services/chartered-accountant-loan',
    calcLink: '/calculators/loan/multiplier-eligibility',
    icon: <FileCheck size={20} />,
    description: 'Collateral-free credit limits based on Certificate of Practice (COP) and ICAI seniority.',
    calcTags: ['emi', 'multiplier', 'foir', 'outstanding']
  },
  {
    id: 'doctor-loan',
    title: 'Doctor / Professional Loan',
    subtitle: 'Clinic setup & medical equipment finance',
    rate: 'From 9.75% p.a.',
    tenure: 'Up to 7 Years',
    link: '/services/doctor-professional-loan',
    calcLink: '/calculators/loan/foir-eligibility',
    icon: <Stethoscope size={20} />,
    description: 'Custom credit lines for MBBS, MD, BDS, architects, and certified professionals.',
    calcTags: ['emi', 'foir', 'multiplier', 'outstanding', 'foreclosure']
  },
  {
    id: 'school-college-funding',
    title: 'School & College Funding',
    subtitle: 'Institutional expansion & campus infrastructure',
    rate: 'From 9.50% p.a.',
    tenure: 'Up to 15 Years',
    link: '/loans#school-funding',
    calcLink: '/calculators/loan/comparison',
    icon: <BookOpen size={20} />,
    description: 'Secured and unsecured project loans for educational trusts, schools, and private colleges.',
    calcTags: ['emi', 'comparison', 'interest', 'foir']
  }
];

export default function ExploreServices({ currentCalcTag, heading = "Explore Our Loan Services" }) {
  // Sort or prioritize relevant services if a currentCalcTag is provided
  const servicesToDisplay = React.useMemo(() => {
    if (!currentCalcTag) return LOAN_SERVICES;
    return [...LOAN_SERVICES].sort((a, b) => {
      const aHas = a.calcTags.includes(currentCalcTag) ? 1 : 0;
      const bHas = b.calcTags.includes(currentCalcTag) ? 1 : 0;
      return bHas - aHas;
    });
  }, [currentCalcTag]);

  return (
    <section className="calc-explore-services animate-fade-in" aria-labelledby="explore-services-title">
      <div className="calc-explore-header">
        <div className="calc-explore-badge">
          <Sparkles size={14} />
          <span>Tailored Financial Solutions</span>
        </div>
        <h3 id="explore-services-title" className="calc-explore-title">
          {heading}
        </h3>
        <p className="calc-explore-desc">
          Calculated your estimates? Speak with our lending advisors for custom loan structuring, fast sanctions, and doorstep service.
        </p>
      </div>

      <div className="calc-explore-grid">
        {servicesToDisplay.map((service) => (
          <div key={service.id} className="calc-service-card">
            <div className="calc-service-top">
              <div className="calc-service-icon-box">{service.icon}</div>
              <div className="calc-service-rates">
                <span className="calc-service-rate-badge">{service.rate}</span>
                <span className="calc-service-tenure">{service.tenure}</span>
              </div>
            </div>

            <h4 className="calc-service-name">{service.title}</h4>
            <p className="calc-service-subtitle">{service.subtitle}</p>
            <p className="calc-service-text">{service.description}</p>

            <div className="calc-service-actions">
              <Link to={service.link} className="calc-service-primary-btn">
                <span>View Details</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES,%20I%20am%20interested%20in%20${encodeURIComponent(service.title)}.%20Please%20guide%20me.`}
                target="_blank"
                rel="noopener noreferrer"
                className="calc-service-wa-btn"
                title={`Enquire on WhatsApp for ${service.title}`}
              >
                <MessageCircle size={15} />
                <span>Enquire</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="calc-explore-cta-banner">
        <div className="calc-cta-info">
          <h4>Need immediate personalized loan assistance?</h4>
          <p>Talk to our loan experts in Latur for instant eligibility checks across 40+ leading partner banks & NBFCs.</p>
        </div>
        <div className="calc-cta-buttons">
          <a href="tel:+919175635165" className="calc-btn calc-btn-primary">
            <PhoneCall size={16} />
            <span>Call +91-9175635165</span>
          </a>
          <Link to="/contact" className="calc-btn calc-btn-secondary">
            <span>Book Free Consultation</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
