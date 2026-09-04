import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/avani-brand-logo.png';
import './Navbar.css';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('home'), path: '/' },
    { name: t('about'), path: '/about' },
    { name: t('loans'), path: '/loans' },
    { name: 'School Funding', path: '/loans#school-funding' },
    { name: 'College Funding', path: '/loans#college-funding' },
    { name: t('eligibility'), path: '/eligibility' },
    { name: t('cibil_check'), path: '/cibil-check' },
    { name: t('documents'), path: '/documents' },
    { name: t('calculators'), path: '/calculators' },
    { name: t('blog'), path: '/blog' },
    // Catalog opens in a new window
    { name: 'Catalog', path: 'https://www.avanifinserv.com/catalog', external: true },
    { name: t('contact'), path: '/contact' }
  ];

  return (
    <>
      <div className="notice-bar">
        <div className="container notice-content">
          <div className="lang-switcher">
            <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>Eng</button>
            <button className={`lang-btn ${language === 'mr' ? 'active' : ''}`} onClick={() => setLanguage('mr')}>मराठी</button>
            <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>हिंदी</button>
          </div>
          <span className="notice-text">⚠️ <strong>{language === 'en' ? 'Disclaimer' : language === 'mr' ? 'सुचना' : 'सूचना'}:</strong> {t('disclaimer')} ⚠️</span>
        </div>
      </div>
      <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand">
          <img src={logo} alt="Avani Loan Services Logo" className="logo" />
          <div className="brand-text">
            <span className="brand-avani">Avani</span>
            <span className="brand-sub">Loan Services</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul className="nav-list">
            {navLinks.map(link => (
              <li key={link.path}>
                {link.external ? (
                  <a
                    href={link.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`nav-link`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    to={link.path} 
                    className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}

          </ul>
          <Link to="/contact" className="btn btn-primary nav-cta">{t('apply_now')}</Link>
        </nav>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="mobile-nav animate-fade-in">
            <ul className="mobile-nav-list">
              {navLinks.map(link => (
                <li key={link.path}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link 
                      to={link.path} 
                      className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link to="/contact" className="btn btn-primary mobile-cta" onClick={() => setIsOpen(false)}>
                  {t('apply_now')}
                </Link>
              </li>
            <li>
              <a href="https://www.avanifinserv.com/catalog" target="_blank" rel="noopener noreferrer" className="nav-link">Catalog</a>
            </li>
            </ul>
          </div>
        )}
      </div>
    </header>
    </>
  );
}
