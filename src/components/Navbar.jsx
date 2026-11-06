import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Lock, PhoneCall, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../assets/avani-brand-logo.png';
import './Navbar.css';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileSubmenu, setMobileSubmenu] = useState(null);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
    setMobileSubmenu(null);
  }, [location.pathname]);

  const toggleMobileSubmenu = (menu) => {
    setMobileSubmenu(mobileSubmenu === menu ? null : menu);
  };

  return (
    <>
      {/* Top Regulatory & Language Notice Bar */}
      <div className="notice-bar">
        <div className="container notice-content">
          <div className="lang-switcher">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              Eng
            </button>
            <button
              className={`lang-btn ${language === 'mr' ? 'active' : ''}`}
              onClick={() => setLanguage('mr')}
            >
              मराठी
            </button>
            <button
              className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => setLanguage('hi')}
            >
              हिंदी
            </button>
          </div>
          <span className="notice-text">
            ⚠️ <strong>{language === 'en' ? 'Regulatory Notice' : language === 'mr' ? 'वैधानिक सुचना' : 'वैधानिक सूचना'}:</strong>{' '}
            {t('disclaimer')}{' '}
            <Link to="/disclaimer" className="notice-link" style={{ color: '#0c4a6e', textDecoration: 'underline', marginLeft: '6px' }}>
              {language === 'en' ? 'Read More' : language === 'mr' ? 'अधिक वाचा' : 'और जानें'}
            </Link>
          </span>
          <div className="notice-contact">
            <a href="tel:+919175635165" className="notice-phone-link">
              <PhoneCall size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              +91-9175635165
            </a>
          </div>
        </div>
      </div>

      {/* Main Corporate Header */}
      <header className="navbar">
        <div className="container nav-container">
          <Link to="/" className="brand" aria-label="Avani Loan Services Home">
            <img src={logo} alt="Avani Loan Services Logo" className="logo" />
            <div className="brand-text">
              <span className="brand-avani">Avani</span>
              <span className="brand-sub">Loan Services</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav" aria-label="Primary Navigation">
            <ul className="nav-list">
              {/* Home */}
              <li className="nav-item">
                <Link
                  to="/"
                  className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                  {t('home')}
                </Link>
              </li>

              {/* Loans & Services Dropdown */}
              <li
                className="nav-item has-dropdown"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`nav-link dropdown-toggle ${
                    location.pathname.startsWith('/services') || location.pathname === '/catalog' || location.pathname === '/loans'
                      ? 'active'
                      : ''
                  }`}
                  aria-expanded={activeDropdown === 'services'}
                >
                  <span>{t('loans')}</span>
                  <ChevronDown size={14} className="dropdown-chevron" />
                </button>
                {activeDropdown === 'services' && (
                  <div className="dropdown-menu animate-fade-in">
                    <Link to="/catalog" className="dropdown-item featured">
                      <strong>Loan Product Catalog</strong>
                      <small>Compare interest rates & tenures</small>
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/services/home-loan" className="dropdown-item">
                      Home Loan
                    </Link>
                    <Link to="/services/salary-loan" className="dropdown-item">
                      Salary Loan
                    </Link>
                    <Link to="/services/business-loan" className="dropdown-item">
                      Business Loan
                    </Link>
                    <Link to="/services/doctor-professional-loan" className="dropdown-item">
                      Doctor / Professional Loan
                    </Link>
                    <Link to="/services/chartered-accountant-loan" className="dropdown-item">
                      Chartered Accountant Loan
                    </Link>
                    <Link to="/services/education-loan" className="dropdown-item">
                      Education Loan
                    </Link>
                    <Link to="/loans" className="dropdown-item">
                      Loan Against Property (LAP)
                    </Link>
                    <Link to="/services" className="dropdown-item all-link">
                      View All 18+ Products →
                    </Link>
                  </div>
                )}
              </li>

              {/* Corporate Partnerships Dropdown */}
              <li
                className="nav-item has-dropdown"
                onMouseEnter={() => setActiveDropdown('partnerships')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`nav-link dropdown-toggle ${
                    location.pathname.includes('partnership') || location.pathname.includes('institutional')
                      ? 'active'
                      : ''
                  }`}
                  aria-expanded={activeDropdown === 'partnerships'}
                >
                  <span>Partnerships</span>
                  <ChevronDown size={14} className="dropdown-chevron" />
                </button>
                {activeDropdown === 'partnerships' && (
                  <div className="dropdown-menu animate-fade-in">
                    <Link to="/builder-partnership" className="dropdown-item">
                      <strong>Builder Partnerships</strong>
                      <small>Project APF & Buyer Mortgage Desk</small>
                    </Link>
                    <Link to="/institutional-funding" className="dropdown-item">
                      <strong>Institutional Funding</strong>
                      <small>School, College & University Finance</small>
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/loans#school-funding" className="dropdown-item">
                      School Infrastructure Finance
                    </Link>
                    <Link to="/loans#college-funding" className="dropdown-item">
                      College & University Expansion Funding
                    </Link>
                  </div>
                )}
              </li>

              {/* Calculators & Tools Dropdown */}
              <li
                className="nav-item has-dropdown"
                onMouseEnter={() => setActiveDropdown('calculators')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  className={`nav-link dropdown-toggle ${
                    location.pathname.startsWith('/calculators') ||
                    location.pathname === '/eligibility' ||
                    location.pathname === '/cibil-check' ||
                    location.pathname === '/documents'
                      ? 'active'
                      : ''
                  }`}
                  aria-expanded={activeDropdown === 'calculators'}
                >
                  <span>Calculators & Tools</span>
                  <ChevronDown size={14} className="dropdown-chevron" />
                </button>
                {activeDropdown === 'calculators' && (
                  <div className="dropdown-menu animate-fade-in">
                    <Link to="/calculators" className="dropdown-item featured">
                      <strong>Financial Calculator Suite</strong>
                      <small>21 Professional Finance Tools</small>
                    </Link>
                    <div className="dropdown-divider" />
                    <Link to="/calculators/loan/emi" className="dropdown-item">
                      EMI Calculator
                    </Link>
                    <Link to="/eligibility" className="dropdown-item">
                      AI Loan Eligibility Engine
                    </Link>
                    <Link to="/cibil-check" className="dropdown-item">
                      CIBIL Score Guide & Advisory
                    </Link>
                    <Link to="/documents" className="dropdown-item">
                      Document Checklist & Vault
                    </Link>
                    <Link to="/download-application" className="dropdown-item">
                      Download Application Form
                    </Link>
                  </div>
                )}
              </li>

              {/* About */}
              <li className="nav-item">
                <Link
                  to="/about"
                  className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                >
                  {t('about')}
                </Link>
              </li>

              {/* Contact */}
              <li className="nav-item">
                <Link
                  to="/contact"
                  className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                >
                  {t('contact')}
                </Link>
              </li>
            </ul>

            {/* Desktop Action Buttons */}
            <div className="nav-actions">
              <Link
                to="/admin/login"
                className="btn-admin-portal"
                title="Protected Partner & Admin Portal"
                rel="nofollow"
              >
                <Lock size={13} style={{ marginRight: '5px' }} />
                <span>Admin Login</span>
              </Link>
              <Link to="/apply" className="btn btn-primary nav-cta">
                {t('apply_now')}
              </Link>
            </div>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Mobile Navigation Drawer */}
          {isOpen && (
            <div className="mobile-nav animate-fade-in">
              <ul className="mobile-nav-list">
                <li>
                  <Link
                    to="/"
                    className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('home')}
                  </Link>
                </li>

                {/* Mobile Loans Accordion */}
                <li className="mobile-accordion">
                  <button
                    className="mobile-accordion-toggle"
                    onClick={() => toggleMobileSubmenu('services')}
                  >
                    <span>{t('loans')}</span>
                    <ChevronDown
                      size={16}
                      className={`accordion-icon ${mobileSubmenu === 'services' ? 'rotate' : ''}`}
                    />
                  </button>
                  {mobileSubmenu === 'services' && (
                    <div className="mobile-submenu">
                      <Link to="/catalog" onClick={() => setIsOpen(false)}>
                        Loan Product Catalog
                      </Link>
                      <Link to="/services/home-loan" onClick={() => setIsOpen(false)}>
                        Home Loan
                      </Link>
                      <Link to="/services/salary-loan" onClick={() => setIsOpen(false)}>
                        Salary Loan
                      </Link>
                      <Link to="/services/business-loan" onClick={() => setIsOpen(false)}>
                        Business Loan
                      </Link>
                      <Link to="/services/doctor-professional-loan" onClick={() => setIsOpen(false)}>
                        Doctor Loan
                      </Link>
                      <Link to="/services/chartered-accountant-loan" onClick={() => setIsOpen(false)}>
                        CA Loan
                      </Link>
                      <Link to="/services/education-loan" onClick={() => setIsOpen(false)}>
                        Education Loan
                      </Link>
                      <Link to="/loans" onClick={() => setIsOpen(false)}>
                        Loan Against Property
                      </Link>
                      <Link to="/services" onClick={() => setIsOpen(false)}>
                        All Services Overview
                      </Link>
                    </div>
                  )}
                </li>

                {/* Mobile Partnerships Accordion */}
                <li className="mobile-accordion">
                  <button
                    className="mobile-accordion-toggle"
                    onClick={() => toggleMobileSubmenu('partnerships')}
                  >
                    <span>Corporate Partnerships</span>
                    <ChevronDown
                      size={16}
                      className={`accordion-icon ${mobileSubmenu === 'partnerships' ? 'rotate' : ''}`}
                    />
                  </button>
                  {mobileSubmenu === 'partnerships' && (
                    <div className="mobile-submenu">
                      <Link to="/builder-partnership" onClick={() => setIsOpen(false)}>
                        Builder Partnerships
                      </Link>
                      <Link to="/institutional-funding" onClick={() => setIsOpen(false)}>
                        Institutional Funding
                      </Link>
                      <Link to="/loans#school-funding" onClick={() => setIsOpen(false)}>
                        School Infrastructure Finance
                      </Link>
                      <Link to="/loans#college-funding" onClick={() => setIsOpen(false)}>
                        College & University Expansion Funding
                      </Link>
                    </div>
                  )}
                </li>

                {/* Mobile Tools Accordion */}
                <li className="mobile-accordion">
                  <button
                    className="mobile-accordion-toggle"
                    onClick={() => toggleMobileSubmenu('tools')}
                  >
                    <span>Calculators & Tools</span>
                    <ChevronDown
                      size={16}
                      className={`accordion-icon ${mobileSubmenu === 'tools' ? 'rotate' : ''}`}
                    />
                  </button>
                  {mobileSubmenu === 'tools' && (
                    <div className="mobile-submenu">
                      <Link to="/calculators" onClick={() => setIsOpen(false)}>
                        Financial Calculator Suite
                      </Link>
                      <Link to="/calculators/loan/emi" onClick={() => setIsOpen(false)}>
                        EMI Calculator
                      </Link>
                      <Link to="/eligibility" onClick={() => setIsOpen(false)}>
                        AI Eligibility Engine
                      </Link>
                      <Link to="/cibil-check" onClick={() => setIsOpen(false)}>
                        CIBIL Score Guide
                      </Link>
                      <Link to="/documents" onClick={() => setIsOpen(false)}>
                        Document Vault
                      </Link>
                      <Link to="/download-application" onClick={() => setIsOpen(false)}>
                        Download Application Form
                      </Link>
                    </div>
                  )}
                </li>

                <li>
                  <Link
                    to="/about"
                    className={`mobile-nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('about')}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/blog"
                    className={`mobile-nav-link ${location.pathname === '/blog' ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('blog')}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/contact"
                    className={`mobile-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t('contact')}
                  </Link>
                </li>

                {/* Mobile Admin Portal Link */}
                <li className="mobile-admin-item">
                  <Link
                    to="/admin/login"
                    className="mobile-admin-link"
                    onClick={() => setIsOpen(false)}
                    rel="nofollow"
                  >
                    <Lock size={16} style={{ marginRight: '8px' }} />
                    <span>Admin Portal Login</span>
                  </Link>
                </li>

                {/* Mobile CTA */}
                <li>
                  <Link
                    to="/apply"
                    className="btn btn-primary mobile-cta"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('apply_now')}
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
