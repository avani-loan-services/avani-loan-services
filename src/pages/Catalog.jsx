import useSEO from '../hooks/useSEO';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/avani-brand-logo.png';
import personalImg from '../assets/personal-loan.png';
import businessImg from '../assets/business-loan.png';
import educationImg from '../assets/education-loan.png';
import homeImg from '../assets/home-loan.png';
import mortgageImg from '../assets/mortgage-loan.png';
import './Catalog.css';

// SVGs
const ApplyIcon = () => (
  <svg viewBox="0 0 24 24" className="btn-icon"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
);
const DocIcon = () => (
  <svg viewBox="0 0 24 24" className="btn-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/><polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
);
const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="btn-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
);

export default function Catalog() {
  useSEO({ title: 'Product Catalog - Avani Loan Services', description: 'Professional product catalog for Avani Loan Services.', keywords: 'Catalog, Loan, Avani Finserv, Latur' });

  return (
    <div className="catalog-wrapper">
      <div className="page-wrap">
        
        {/* COVER PAGE */}
        <div className="cover">
          <div className="cover-bg"></div>
          <div className="cover-overlay"></div>
          <div className="cover-circle1"></div><div className="cover-circle2"></div><div className="cover-circle3"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          
          <div className="cover-inner">
            <div className="cover-header">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light">Avani Loan Services</div>
                  <div className="logo-sub-light">Trusted DSA &middot; Latur</div>
                </div>
              </div>
              <div className="cover-badge">Product Catalog 2026-27</div>
            </div>
            
            <div className="cover-hero">
              <div className="cover-eyebrow">Trust &middot; Speed &middot; Transparency</div>
              <div className="cover-title">
                Premium<br/>
                <span className="t-gold">Financial</span><br/>
                <span className="t-blue">Services</span>
              </div>
              <div className="cover-div"></div>
              <div className="cover-desc">
                From Latur to all over Maharashtra. We offer premium Personal, Business, Education, Home, and Mortgage Loans. Certified DSA partners with major nationalized banks.
              </div>
              <div className="cover-services-grid">
                <div className="cover-chip"><span className="chip-dot"></span>Personal Loan</div>
                <div className="cover-chip"><span className="chip-dot"></span>Business Loan</div>
                <div className="cover-chip"><span className="chip-dot"></span>Education Loan</div>
                <div className="cover-chip"><span className="chip-dot"></span>Home Loan</div>
                <div className="cover-chip"><span className="chip-dot"></span>Mortgage / LAP</div>
                <div className="cover-chip"><span className="chip-dot"></span>CIBIL Improvement</div>
                <div className="cover-chip"><span className="chip-dot"></span>CA Loan</div>
                <div className="cover-chip"><span className="chip-dot"></span>Professional Loan</div>
              </div>
            </div>
            
            <div className="cover-footer">
              <div className="cover-contacts">
                <div><div className="cinfo-label">Website</div><div className="cinfo-val">avanifinserv.com</div></div>
                <div><div className="cinfo-label">Email</div><div className="cinfo-val">enquiry@avanifinserv.com</div></div>
                <div><div className="cinfo-label">Location</div><div className="cinfo-val">Latur, Maharashtra, India</div></div>
              </div>
              <div>
                <div className="cover-owner-name">Sachin Shinde</div>
                <div className="cover-owner-role">Founder & Director</div>
              </div>
            </div>
          </div>
        </div>

        {/* SCARD 1: Personal Loan */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${personalImg})` }}></div>
          <div className="scard-overlay-left"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">01</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">01 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">Salary<br/>Loan</div>
              <div className="scard-subtitle">Fast personal loans for salaried employees.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Our Personal Loans are designed to meet your immediate financial needs. Whether it's a medical emergency, a wedding, or a dream vacation, we offer quick disbursements with minimal paperwork.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: Up to ₹50L</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: 10.5% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 5 Years</div></div>
                <div className="feat"><div className="feat-txt">Processing: 48 Hours</div></div>
                <div className="feat"><div className="feat-txt">No Collateral Required</div></div>
                <div className="feat"><div className="feat-txt">Flexible Repayment Options</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20a%20Salary%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>

        {/* SCARD 2: Business Loan */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${businessImg})` }}></div>
          <div className="scard-overlay-right"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">02</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">02 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">Business<br/>Loan</div>
              <div className="scard-subtitle">Fuel your business growth with unsecured capital.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Avani Loan Services provides quick business loans for MSMEs and entrepreneurs. Enhance your working capital, expand operations, or purchase new equipment with ease.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: Up to ₹2Cr</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: 12% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 5 Years</div></div>
                <div className="feat"><div className="feat-txt">Quick Assessment & Approval</div></div>
                <div className="feat"><div className="feat-txt">Minimal Documentation</div></div>
                <div className="feat"><div className="feat-txt">Support for SMEs</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20a%20Business%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>
        
        {/* SCARD 3: Education Loan */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${educationImg})` }}></div>
          <div className="scard-overlay-left"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">03</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">03 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">Education<br/>Loan</div>
              <div className="scard-subtitle">Empowering students for a brighter future.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Study in India or abroad without financial worries. We help students cover tuition fees, accommodation, and travel expenses with flexible repayment terms.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: Up to ₹1.5Cr</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: 8.15% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 15 Years</div></div>
                <div className="feat"><div className="feat-txt">100% Finance Available</div></div>
                <div className="feat"><div className="feat-txt">For India & Overseas Studies</div></div>
                <div className="feat"><div className="feat-txt">Moratorium Period Options</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20an%20Education%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>
        
        {/* SCARD 4: Home Loan */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${homeImg})` }}></div>
          <div className="scard-overlay-right"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">04</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">04 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">Home<br/>Loan</div>
              <div className="scard-subtitle">Turn your dream home into reality.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Looking to buy your first home or construct on a plot? Avani Loan Services connects you with top banks for the best home loan rates, longest tenures, and simplest processing.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: As per eligibility</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: 8.5% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 30 Years</div></div>
                <div className="feat"><div className="feat-txt">For Purchase & Construction</div></div>
                <div className="feat"><div className="feat-txt">Low Processing Fees</div></div>
                <div className="feat"><div className="feat-txt">PMAY Subsidy Assistance</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20a%20Home%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>

        {/* SCARD 5: Mortgage / LAP */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${mortgageImg})` }}></div>
          <div className="scard-overlay-left"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">05</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">05 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">Mortgage<br/>LAP</div>
              <div className="scard-subtitle">Unlock the hidden value of your property.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Use your residential or commercial property to get a high-value loan at affordable rates. Perfect for business expansion, debt consolidation, or massive personal expenses.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: Up to 70% of Property</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: 9.0% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 15 Years</div></div>
                <div className="feat"><div className="feat-txt">Quick Property Valuation</div></div>
                <div className="feat"><div className="feat-txt">Residential & Commercial</div></div>
                <div className="feat"><div className="feat-txt">Maximum Funds, Lower EMI</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20a%20Mortgage%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>

        {/* SCARD 6: CA Loan */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${businessImg})` }}></div>
          <div className="scard-overlay-right"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">06</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">06 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">CA<br/>Loan</div>
              <div className="scard-subtitle">Exclusive professional loans for Chartered Accountants.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Tailor-made financial solutions for CAs to expand their practice, set up new offices, or meet personal goals without requiring collateral.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: Up to ₹1Cr</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: From 10.25% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 5 Years</div></div>
                <div className="feat"><div className="feat-txt">No Collateral Needed</div></div>
                <div className="feat"><div className="feat-txt">Customized Limits on COP</div></div>
                <div className="feat"><div className="feat-txt">Quick Approval Process</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20a%20CA%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>

        {/* SCARD 7: Doctor / Professional Loan */}
        <div className="scard">
          <div className="scard-photo" style={{ backgroundImage: `url(${businessImg})` }}></div>
          <div className="scard-overlay-left"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="scard-num-bg">07</div>
          
          <div className="scard-inner">
            <div className="scard-top">
              <div className="logo-wrap">
                <div className="logo-txt">
                  <div className="logo-name-light" style={{ fontSize: '18px' }}>Avani Loan Services</div>
                  <div className="logo-sub-light">avanifinserv.com</div>
                </div>
              </div>
              <div className="scard-seq">07 / 07</div>
            </div>
            
            <div className="scard-body">
              <div className="scard-title">Pro<br/>Loan</div>
              <div className="scard-subtitle">For Doctors and Certified Professionals.</div>
              <div className="scard-sep"></div>
              <div className="scard-desc">Expand your clinic or professional practice. Get customized funding for equipment purchase, working capital, or personal needs with flexible repayment.</div>
              <div className="features">
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Loan Amount: Up to ₹1Cr</div></div>
                <div className="feat"><div className="feat-dot"></div><div className="feat-txt">Interest Rate: From 10.25% p.a.</div></div>
                <div className="feat"><div className="feat-txt">Tenure: Up to 7 Years</div></div>
                <div className="feat"><div className="feat-txt">No Collateral for Equipment</div></div>
                <div className="feat"><div className="feat-txt">Special Rates for Doctors</div></div>
                <div className="feat"><div className="feat-txt">Flexible EMIs</div></div>
              </div>
            </div>
            
            <div className="scard-footer">
              <div className="btn-group">
                <Link to="/contact" className="cta-btn">
                  Apply Now <ApplyIcon />
                </Link>
                <Link to="/documents" className="cta-btn-outline">
                  View Documents <DocIcon />
                </Link>
                <a href="https://wa.me/919175635165?text=Hello!%20I'm%20interested%20in%20a%20Professional%20Loan." className="cta-btn-wa" target="_blank" rel="noopener noreferrer">
                  WhatsApp Us <WaIcon />
                </a>
              </div>
              <div className="scard-url">enquiry@avanifinserv.com &nbsp;|&nbsp; Latur, Maharashtra</div>
            </div>
          </div>
        </div>

        {/* CONTACT PAGE */}
        <div className="cpage">
          <div className="cpage-bg"></div>
          <div className="cpage-left-strip"></div>
          <div className="gold-bar-top"></div><div className="gold-bar-bot"></div>
          <div className="cpage-inner">
            <div className="cpage-header">
              <div>
                <div className="cpage-eyebrow">Ready for Financial Growth?</div>
                <div className="cpage-title">Contact <span className="t-gold">Us</span></div>
              </div>
              <div className="cpage-img" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=600&q=80')" }}></div>
            </div>
            <div className="cpage-grid">
              {/* Contact Details */}
              <div>
                <div className="csect-title">Avani Loan Services</div>
                
                <div className="cinfo">
                  <div className="cinfo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="cinfo-lbl">Office Address</div>
                    <div className="cinfo-vl">Old Barshi Road, 5 no Chauk,<br/>KulswaminiNagar, Latur-413531,<br/>Maharashtra, India</div>
                  </div>
                </div>

                <div className="cinfo">
                  <div className="cinfo-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="cinfo-lbl">Let's Talk</div>
                    <div className="cinfo-vl">+91 91756 35165<br/>enquiry@avanifinserv.com<br/>www.avanifinserv.com</div>
                  </div>
                </div>

              </div>
              
              {/* Portfolio Overview */}
              <div>
                <div className="csect-title">Our Loan Portfolio</div>
                <div className="svc-list">
                  <div className="svc-item"><div className="svc-num">1</div> Salary & Personal Loan</div>
                  <div className="svc-item"><div className="svc-num">2</div> Business Expansion Loan</div>
                  <div className="svc-item"><div className="svc-num">3</div> Education Loan (India & Global)</div>
                  <div className="svc-item"><div className="svc-num">4</div> Home Loan & Plot Purchase</div>
                  <div className="svc-item"><div className="svc-num">5</div> Mortgage / Loan Against Property</div>
                  <div className="svc-item"><div className="svc-num">6</div> Chartered Accountant Loan</div>
                  <div className="svc-item"><div className="svc-num">7</div> Doctor / Professional Loan</div>
                </div>
              </div>
            </div>
            
            <div className="cpage-footer">
              <div className="cpage-footer-top">
                <div className="logo-wrap">
                  <div className="logo-txt">
                    <div className="logo-name">Avani Loan Services</div>
                    <div className="logo-sub" style={{ color: 'var(--text-mid)' }}>Trusted Financial Partner</div>
                  </div>
                </div>
                <div className="tagline">From Latur to Maharashtra. <span>Empowering Dreams.</span></div>
              </div>
              <div className="disclaimer">
                <strong>Disclaimer:</strong> Avani Loan Services acts as a DSA channel partner. Loan approval, interest rates, and processing fees are at the sole discretion of the respective banks/NBFCs based on the applicant's CIBIL score, income, and documentation.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
