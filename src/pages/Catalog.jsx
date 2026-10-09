// src/pages/Catalog.jsx
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — Comprehensive Loan Product Catalog
// Production Responsive Implementation
// ─────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  CATALOG_CATEGORIES,
  CATALOG_PRODUCTS,
  GENERAL_DOCUMENTS,
  CATALOG_FAQS
} from '../data/catalogProducts';
import ProductCard from '../components/catalog/ProductCard';
import DocumentModal from '../components/catalog/DocumentModal';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowRight,
  FileText,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  Clock,
  Compass,
  Users,
  Award,
  ExternalLink
} from 'lucide-react';
import './Catalog.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export default function Catalog() {
  // ── SEO & Meta ──
  useSEO({
    title: 'Loan Products & Loan Consultancy Services in Latur & Maharashtra | AVANI LOAN SERVICES',
    description: 'Explore Personal, Business, Doctor, Home, Mortgage, Education, School & College Funding and professional loan consultancy services from AVANI LOAN SERVICES in Latur and across Maharashtra.',
    keywords: 'loan consultancy Latur, loan services Latur, personal loan Latur, business loan Latur, home loan Latur, education loan Latur, loan consultancy Maharashtra, business loan Maharashtra, education loan Maharashtra, mortgage loan Latur, doctor loan, CA professional loan, CIBIL guidance',
    canonical: 'https://www.avanifinserv.com/catalog'
  });

  // ── State Management ──
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedDocProduct, setSelectedDocProduct] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const location = useLocation();

  // Scroll to hash on load if present
  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.hash]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return CATALOG_PRODUCTS;
    return CATALOG_PRODUCTS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const toggleExpand = (productId) => {
    setExpandedCards(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleOpenDocuments = (product = null) => {
    setSelectedDocProduct(product);
    setIsDocModalOpen(true);
  };

  const handleToggleFaq = (index) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  // Structured Data (Schema.org)
  const jsonLdData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": "https://www.avanifinserv.com/#organization",
          "name": "AVANI LOAN SERVICES",
          "url": "https://www.avanifinserv.com/",
          "telephone": "+91-9175635165",
          "email": "enquiry@avanifinserv.com",
          "founder": {
            "@type": "Person",
            "name": "Sachin Shinde"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Old Barshi Road, 5 No Chauk, Kulswamini Nagar, Next to Sai School",
            "addressLocality": "Latur",
            "addressRegion": "Maharashtra",
            "postalCode": "413512",
            "addressCountry": "IN"
          },
          "sameAs": [
            "https://www.facebook.com/share/19Pvp8PqP2/",
            "https://www.instagram.com/avanifinservlatur/"
          ]
        },
        {
          "@type": "Service",
          "serviceType": "Loan Consultancy & Advisory Services",
          "provider": {
            "@id": "https://www.avanifinserv.com/#organization"
          },
          "areaServed": [
            { "@type": "City", "name": "Latur" },
            { "@type": "State", "name": "Maharashtra" }
          ],
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "AVANI LOAN SERVICES Loan Product Portfolio",
            "itemListElement": CATALOG_PRODUCTS.map((prod) => ({
              "@type": "Offer",
              "itemOffered": {
                "@type": "FinancialProduct",
                "name": prod.title,
                "description": prod.shortDescription,
                "category": prod.categoryLabel
              }
            }))
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": CATALOG_FAQS.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.a
            }
          }))
        }
      ]
    };
  }, []);

  return (
    <div className="catalog-page">
      {/* Schema.org Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }} />

      {/* ══════════════════════════════════════════════
          SECTION 1 — HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="cat-hero">
        <div className="cat-hero-bg-accent"></div>
        <div className="container cat-hero-container">
          <div className="cat-hero-badge">
            <Sparkles size={15} />
            <span>Financial Services & Loan Advisory</span>
          </div>

          <h1 className="cat-hero-headline">
            Find the Right Loan for Your Financial Goals
          </h1>

          <p className="cat-hero-subtext">
            AVANI LOAN SERVICES provides professional loan consultancy and advisory support for individuals, professionals, businesses, property buyers and students across Latur and Maharashtra.
          </p>

          <div className="cat-hero-ctas">
            {/* Primary CTA */}
            <Link to="/contact" className="btn btn-primary cat-btn-hero-primary" id="hero-apply-btn">
              <span>Apply Now</span>
              <ArrowRight size={18} />
            </Link>

            {/* Secondary CTA */}
            <a
              href="https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES%2C%20I%20would%20like%20to%20consult%20with%20an%20advisor%20regarding%20loan%20options."
              target="_blank"
              rel="noopener noreferrer"
              className="btn cat-btn-hero-wa"
              id="hero-wa-btn"
            >
              <MessageCircle size={18} />
              <span>WhatsApp an Advisor</span>
            </a>

            {/* Third CTA */}
            <Link to="/apply" className="btn btn-outline cat-btn-hero-eligibility" id="hero-eligibility-btn">
              <ShieldCheck size={18} />
              <span>Check Eligibility</span>
            </Link>
          </div>

          <div className="cat-hero-features-strip">
            <div className="cat-strip-item">
              <Compass size={18} className="cat-strip-icon" />
              <span>Expert Multi-Bank Guidance</span>
            </div>
            <div className="cat-strip-item">
              <MapPin size={18} className="cat-strip-icon" />
              <span>Latur & All Maharashtra Support</span>
            </div>
            <div className="cat-strip-item">
              <FileText size={18} className="cat-strip-icon" />
              <span>Doorstep Documentation</span>
            </div>
            <div className="cat-strip-item">
              <Clock size={18} className="cat-strip-icon" />
              <span>Fast Processing Support*</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — QUICK PRODUCT NAVIGATION / FILTERS
      ══════════════════════════════════════════════ */}
      <section className="cat-nav-section" id="product-nav">
        <div className="container">
          <div className="cat-nav-header">
            <h2 className="cat-nav-title">Browse Our Loan Products ({CATALOG_PRODUCTS.length})</h2>
            <p className="cat-nav-subtitle">Filter by category to explore targeted loan options and documentation requirements.</p>
          </div>

          <div className="cat-category-pills" role="tablist" aria-label="Loan Categories">
            {CATALOG_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 3 & 4 — PRODUCT CARDS & DETAILS GRID
      ══════════════════════════════════════════════ */}
      <section className="cat-grid-section">
        <div className="container">
          <div className="cat-products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isExpanded={!!expandedCards[product.id]}
                onToggleExpand={toggleExpand}
                onOpenDocuments={handleOpenDocuments}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="cat-no-results glass-card">
              <p>No products found in this category.</p>
              <button className="btn btn-primary" onClick={() => setActiveCategory('all')}>
                Show All Loan Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — TRUST SECTION (WHY CHOOSE US)
      ══════════════════════════════════════════════ */}
      <section className="cat-trust-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge">Transparent & Compliant</span>
            <h2 className="section-title">Why Choose AVANI LOAN SERVICES?</h2>
            <p className="section-subtitle">
              We provide factual, ethical loan consultancy. We partner with you to find the most suitable lender match without exaggerated claims or false guarantees.
            </p>
          </div>

          <div className="trust-cards-grid">
            <div className="trust-card glass-card">
              <div className="trust-icon-box">
                <Compass size={28} />
              </div>
              <h3 className="trust-card-title">Loan Consultancy & Advisory</h3>
              <p className="trust-card-desc">
                Unbiased loan consultancy evaluating options across 40+ nationalized banks, private banks, and leading NBFCs.
              </p>
            </div>

            <div className="trust-card glass-card">
              <div className="trust-icon-box">
                <Award size={28} />
              </div>
              <h3 className="trust-card-title">Product-Wise Guidance</h3>
              <p className="trust-card-desc">
                Specialized advisory structures for Salaried Employees, Business Owners, Doctors, CAs, and Educational Institutions.
              </p>
            </div>

            <div className="trust-card glass-card">
              <div className="trust-icon-box">
                <FileText size={28} />
              </div>
              <h3 className="trust-card-title">Documentation Assistance</h3>
              <p className="trust-card-desc">
                Careful pre-scrutiny of bank statements, ITRs, KYC, and property papers to ensure error-free file presentation.
              </p>
            </div>

            <div className="trust-card glass-card">
              <div className="trust-icon-box">
                <ShieldCheck size={28} />
              </div>
              <h3 className="trust-card-title">Eligibility & Profile Matching</h3>
              <p className="trust-card-desc">
                Detailed FOIR and income analysis before application, minimizing file rejections and protecting your credit score.
              </p>
            </div>

            <div className="trust-card glass-card">
              <div className="trust-icon-box">
                <Building2 size={28} />
              </div>
              <h3 className="trust-card-title">Rooted in Latur, Serving Maharashtra</h3>
              <p className="trust-card-desc">
                Physical presence on Old Barshi Road, Latur with prompt digital and doorstep assistance across all districts of Maharashtra.
              </p>
            </div>

            <div className="trust-card glass-card">
              <div className="trust-icon-box">
                <Clock size={28} />
              </div>
              <h3 className="trust-card-title">Fast Processing Support*</h3>
              <p className="trust-card-desc">
                Fast processing support — subject to lender eligibility, documentation, credit underwriting, and final approval.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — 5-STEP LOAN ASSISTANCE PROCESS
      ══════════════════════════════════════════════ */}
      <section className="cat-process-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge">Step-by-Step Pathway</span>
            <h2 className="section-title">Simple Loan Assistance Process</h2>
            <p className="section-subtitle">
              A transparent 5-step advisory journey from initial requirement to loan sanction.
            </p>
          </div>

          <div className="process-timeline">
            <div className="process-step-item">
              <div className="process-step-badge">1</div>
              <h3 className="process-step-title">Tell Us Your Requirement</h3>
              <p className="process-step-desc">
                Select your loan product and submit an online enquiry, or chat with our team on WhatsApp.
              </p>
            </div>

            <div className="process-step-item">
              <div className="process-step-badge">2</div>
              <h3 className="process-step-title">Eligibility Assessment</h3>
              <p className="process-step-desc">
                Our loan advisors evaluate your income, existing obligations, profile, and borrowing capacity.
              </p>
            </div>

            <div className="process-step-item">
              <div className="process-step-badge">3</div>
              <h3 className="process-step-title">Documentation</h3>
              <p className="process-step-desc">
                Submit the required KYC, financial statements, and property/academic documents for preliminary check.
              </p>
            </div>

            <div className="process-step-item">
              <div className="process-step-badge">4</div>
              <h3 className="process-step-title">Lender Evaluation</h3>
              <p className="process-step-desc">
                Your file is submitted to the chosen partner bank or NBFC for formal credit appraisal and verification.
              </p>
            </div>

            <div className="process-step-item">
              <div className="process-step-badge">5</div>
              <h3 className="process-step-title">Decision / Disbursement</h3>
              <p className="process-step-desc">
                Sanction letter is issued and funds disbursed into your account, subject to lender approval and terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 7 — COMPREHENSIVE DOCUMENTS SECTION
      ══════════════════════════════════════════════ */}
      <section className="cat-docs-section" id="documents">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge">Documentation Guidance</span>
            <h2 className="section-title">General Documents Checklist by Profile</h2>
            <p className="section-subtitle">
              Keep these documents handy to ensure a smooth, prompt loan evaluation experience.
            </p>
          </div>

          <div className="docs-profile-grid">
            {GENERAL_DOCUMENTS.map((grp, gIdx) => (
              <div key={gIdx} className="docs-profile-card glass-card">
                <div className="docs-profile-header">
                  <h3 className="docs-profile-title">{grp.category}</h3>
                  <span className="docs-profile-sub">{grp.subtitle}</span>
                </div>
                <ul className="docs-profile-list">
                  {grp.documents.map((d, dIdx) => (
                    <li key={dIdx} className="docs-profile-item">
                      <CheckCircle2 size={16} className="docs-profile-icon" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="docs-compliance-alert">
            <ShieldCheck size={24} className="docs-alert-icon" />
            <div>
              <strong>Important Documentation Notice:</strong>
              <p>
                Exact documents vary by product, applicant profile and lender. This is a general checklist, not a final lender-specific document list. Specific lenders may request additional verifications, bank account statements, or title reports.
              </p>
            </div>
          </div>

          <div className="docs-action-center text-center">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenDocuments(null)}
            >
              <FileText size={18} />
              <span>Open Interactive Document Vault</span>
            </button>
            <a
              href="https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES%2C%20please%20send%20me%20the%20complete%20verified%20documents%20checklist."
              target="_blank"
              rel="noopener noreferrer"
              className="btn cat-btn-hero-wa"
            >
              <MessageCircle size={18} />
              <span>Request Checklist on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 8 — PRODUCT FAQS (ACCORDION)
      ══════════════════════════════════════════════ */}
      <section className="cat-faq-section" id="faqs">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge">Frequently Asked Questions</span>
            <h2 className="section-title">Common Questions About Our Services</h2>
            <p className="section-subtitle">
              Get direct, transparent answers to questions regarding eligibility, processing, and our advisory role.
            </p>
          </div>

          <div className="cat-faq-accordion">
            {CATALOG_FAQS.map((faq, fIdx) => (
              <div key={fIdx} className={`faq-item glass-card ${openFaq === fIdx ? 'faq-open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => handleToggleFaq(fIdx)}
                  aria-expanded={openFaq === fIdx}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  {openFaq === fIdx ? <ChevronUp size={20} className="faq-chevron" /> : <ChevronDown size={20} className="faq-chevron" />}
                </button>
                {openFaq === fIdx && (
                  <div className="faq-answer-panel animate-fade-in">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 9 — FOOTER CALL-TO-ACTION SECTION
      ══════════════════════════════════════════════ */}
      <section className="cat-footer-cta-section">
        <div className="container">
          <div className="cat-cta-banner">
            <div className="cat-cta-content">
              <span className="badge" style={{ background: 'rgba(232, 163, 23, 0.2)', color: '#ffd166' }}>
                Start Your Loan Journey
              </span>
              <h2 className="cat-cta-title">Need Help Choosing the Right Loan?</h2>
              <p className="cat-cta-sub">
                Talk to AVANI LOAN SERVICES. Our dedicated advisors are available to assess your eligibility and guide your loan application across Latur and Maharashtra.
              </p>

              <div className="cat-cta-buttons">
                <a
                  href="https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES%2C%20I%20need%20help%20choosing%20the%20right%20loan.%20Please%20guide%20me."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn cat-btn-banner-wa"
                >
                  <MessageCircle size={18} />
                  <span>WhatsApp Now</span>
                </a>

                <Link to="/contact" className="btn cat-btn-banner-apply">
                  <span>Apply Online</span>
                  <ArrowRight size={18} />
                </Link>

                <Link to="/contact" className="btn cat-btn-banner-contact">
                  <span>Contact Us</span>
                </Link>
              </div>

              {/* Office Contact Info Strip */}
              <div className="cat-contact-summary-strip">
                <div className="c-strip-col">
                  <MapPin size={18} className="c-strip-icon" />
                  <span>
                    Old Barshi Road, 5 No Chauk, Kulswamini Nagar,<br />
                    Next to Sai School, Latur – 413512, Maharashtra, India
                  </span>
                </div>
                <div className="c-strip-col">
                  <Phone size={18} className="c-strip-icon" />
                  <span>+91 91756 35165</span>
                </div>
                <div className="c-strip-col">
                  <Mail size={18} className="c-strip-icon" />
                  <span>enquiry@avanifinserv.com</span>
                </div>
              </div>

              {/* Verified Social Links */}
              <div className="cat-social-strip">
                <span className="cat-social-label">Follow AVANI LOAN SERVICES:</span>
                <div className="cat-social-icons">
                  <a
                    href="https://www.facebook.com/share/19Pvp8PqP2/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cat-social-btn"
                    title="AVANI LOAN SERVICES on Facebook"
                  >
                    <FacebookIcon />
                  </a>
                  <a
                    href="https://www.instagram.com/avanifinservlatur/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cat-social-btn"
                    title="AVANI LOAN SERVICES on Instagram"
                  >
                    <InstagramIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 10 — PROFESSIONAL LEGAL DISCLAIMER
      ══════════════════════════════════════════════ */}
      <section className="cat-disclaimer-section">
        <div className="container">
          <div className="cat-legal-disclaimer">
            <p>
              <strong>Disclaimer:</strong> AVANI LOAN SERVICES provides loan consultancy and advisory support. Loan approval, interest rate, tenure, loan amount, documentation and other terms are subject to lender policies, applicant eligibility, verification and final approval. Information on this website is for general guidance and does not constitute a guarantee of loan approval or disbursement.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 11 — MOBILE STICKY BOTTOM ACTION BAR
      ══════════════════════════════════════════════ */}
      <div className="cat-mobile-sticky-bar" aria-label="Quick mobile contact actions">
        <a
          href="https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES%2C%20I%20am%20exploring%20your%20Loan%20Product%20Catalog%20and%20would%20like%20to%20consult%20with%20an%20advisor."
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-sticky-btn mobile-wa-btn"
        >
          <MessageCircle size={18} />
          <span>WhatsApp Us</span>
        </a>
        <Link to="/contact" className="mobile-sticky-btn mobile-apply-btn">
          <span>Apply Now</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* ══════════════════════════════════════════════
          INTERACTIVE DOCUMENT CHECKLIST MODAL
      ══════════════════════════════════════════════ */}
      <DocumentModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        selectedProduct={selectedDocProduct}
      />
    </div>
  );
}
