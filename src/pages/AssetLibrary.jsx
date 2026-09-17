import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  ExternalLink,
  Filter
} from 'lucide-react';
import './AssetLibrary.css';

const PRODUCT_MEDIA_DATA = [
  {
    id: 'salary-loan',
    name: 'Salary Loan / Personal Loan',
    slug: 'salary-loan',
    category: 'Unsecured Personal Credit',
    tagline: 'Fast-Track Financial Freedom for Salaried Employees',
    description: 'Instant collateral-free funding for medical emergencies, wedding expenses, home renovation, or debt consolidation for corporate, IT, and government employees across Maharashtra.',
    tenure: '12 to 60 Months',
    ticketSize: 'Up to ₹25 Lakhs',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_F38B5C44_PERSONAL_LOAN.webp',
        alt: 'Avani Loan Services Personal and Salary Loan Solutions',
        caption: 'Corporate Salaried Loan Sanction Matrix'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_09E093E0_Man_wearing_white_shirt_vest_202608301652.webp',
        alt: 'Salaried Professional Loan Financial Advisory Consultation',
        caption: 'One-on-One Salaried Credit Advisory'
      }
    ],
    video: {
      src: '/media/videos/als_pl_corporate_promo.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_F38B5C44_PERSONAL_LOAN.webp',
      title: 'Salary Loan Overview & 48-Hour Processing Process'
    }
  },
  {
    id: 'business-loan',
    name: 'Business Loan & MSME Growth Capital',
    slug: 'business-loan',
    category: 'Commercial Business Finance',
    tagline: 'Uncollateralized Working Capital for Thriving Enterprises',
    description: 'Fuel business scaling, purchase commercial inventory, expand factory facilities, or manage cash flow cycles with customized business credit lines for proprietors, partnerships, and private limited firms.',
    tenure: '12 to 48 Months',
    ticketSize: 'Up to ₹50 Lakhs',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_51E9B697_BUSINESS_LOAN.webp',
        alt: 'Avani Loan Services Business Loan and MSME Growth Capital',
        caption: 'Commercial Business Capital Architecture'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_866F068A_Business_loans_for_MSMEs_2K_202608271727.webp',
        alt: 'MSME Machinery and Business Expansion Support',
        caption: 'Machinery & Working Capital Financing'
      }
    ],
    video: {
      src: '/media/videos/als_bl_shop_owner_guide.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_51E9B697_BUSINESS_LOAN.webp',
      title: 'MSME Business Loan Eligibility & Documentation Guide'
    }
  },
  {
    id: 'education-loan',
    name: 'Education Loan — India & Overseas',
    slug: 'education-loan',
    category: 'Higher Studies Project Financing',
    tagline: '100% Comprehensive Funding for Global Aspirations',
    description: 'Full-spectrum tuition fee, hostel accommodation, airfare, and living expense coverage for premier universities across India, USA, UK, Canada, Germany, Australia, and Singapore with extended moratorium options.',
    tenure: 'Up to 15 Years',
    ticketSize: 'Up to ₹1.5 Crores',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_38888E21_EDUCATION_LOAN.webp',
        alt: 'Avani Loan Services Domestic and International Education Loan',
        caption: 'Higher Education Degree Financing Matrix'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_02097073_Student_silhouette_airplane_taki_2K_202608301649.webp',
        alt: 'Global University Higher Studies Funding',
        caption: 'Global University Pre-Visa Sanctions'
      }
    ],
    video: {
      src: '/media/videos/als_el_education_guide.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_38888E21_EDUCATION_LOAN.webp',
      title: 'Domestic & Global Studies Education Loan Architecture'
    }
  },
  {
    id: 'home-loan',
    name: 'Home Loan & Housing Finance',
    slug: 'home-loan',
    category: 'Residential Real Estate Credit',
    tagline: 'Secure Your Dream Home with Prime Banking Rates',
    description: 'Long-term housing loans for ready-possession residential flats, under-construction apartments, independent house purchases, and plot acquisition + home construction with maximum tax benefits under Section 24 and 80C.',
    tenure: 'Up to 30 Years',
    ticketSize: 'Up to ₹5 Crores',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_D8F7EE85_HOME_LOAN.webp',
        alt: 'Avani Loan Services Residential Home Loan Housing Finance',
        caption: 'Residential Property Purchase Sanctions'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_FC2FD6C0_Modern_office_with_copy_space_202608301656.webp',
        alt: 'Home Buying Financial Guidance and Sanctions',
        caption: 'Legal Verification & Property Valuation Assistance'
      }
    ],
    video: {
      src: '/media/videos/als_hl_mortgage_explained.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_D8F7EE85_HOME_LOAN.webp',
      title: 'Home Loan Approval Roadmap & Documentation Essentials'
    }
  },
  {
    id: 'mortgage-lap',
    name: 'Mortgage Loan Against Property (LAP)',
    slug: 'mortgage-lap',
    category: 'Secured High-Value Credit',
    tagline: 'Unlock Hidden Liquidity in Residential & Commercial Real Estate',
    description: 'Substantial long-tenure credit secured by your freehold residential, commercial, or industrial property. Ideal for large-scale enterprise expansion, debt consolidation, or institutional capital investments.',
    tenure: 'Up to 15 Years',
    ticketSize: 'Up to ₹10 Crores',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_70B41AD4_MORTGAGE_LAON.webp',
        alt: 'Avani Loan Services Mortgage Loan Against Property LAP',
        caption: 'High-Value Secured Real Estate Credit'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_8938E41C_Why_banks_reject_loans_banner_202608301657.webp',
        alt: 'Secured Commercial and Residential Mortgage Capital',
        caption: 'Overcoming Lender Bottlenecks with Clear Titling'
      }
    ],
    video: {
      src: '/media/videos/als_hl_mortgage_explained.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_70B41AD4_MORTGAGE_LAON.webp',
      title: 'Mortgage LAP Loan Structuring & Valuation Process'
    }
  },
  {
    id: 'chartered-accountant-loan',
    name: 'Chartered Accountant Professional Loan',
    slug: 'chartered-accountant-loan',
    category: 'ICAI Certified Credit Facility',
    tagline: 'Dedicated Working Capital & Practice Expansion Credit for CAs',
    description: 'Exclusive collateral-free credit lines and professional term loans designed for practicing Chartered Accountants and audit firms to upgrade office infrastructure, hire associates, or manage seasonal audit liquidity.',
    tenure: '12 to 60 Months',
    ticketSize: 'Up to ₹50 Lakhs',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_17FD98A6_CHARTERED_ACCOUNT_LOAN_1to1.webp',
        alt: 'Avani Loan Services Chartered Accountant Professional Credit',
        caption: 'Chartered Accountant Practice Credit Matrix'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_AD00D117_CHARTERED_ACCOUNT_LOAN.webp',
        alt: 'ICAI CA Practice Setup and Expansion Financing',
        caption: 'Office Setup & Technology Upgradation Capital'
      }
    ],
    video: {
      src: '/media/videos/als_pl_corporate_promo.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_17FD98A6_CHARTERED_ACCOUNT_LOAN_1to1.webp',
      title: 'Professional Credit Line Structuring for Practicing CAs'
    }
  },
  {
    id: 'doctor-professional-loan',
    name: 'Doctor & Healthcare Professional Loan',
    slug: 'doctor-professional-loan',
    category: 'Medical Practitioner Credit Line',
    tagline: 'Advanced Medical Clinic & Diagnostic Equipment Financing',
    description: 'Customized healthcare credit for MBBS, MD, BDS, MDS, and AYUSH doctors to establish private clinics, procure advanced medical machinery, expand hospital wards, or refinance high-cost equipment leases.',
    tenure: '12 to 84 Months',
    ticketSize: 'Up to ₹75 Lakhs',
    images: [
      {
        src: '/media/thumbnails/thumb_ALS_IMG_7346F014_DOCTOR_LOAN.webp',
        alt: 'Avani Loan Services Doctor Medical Practitioner Loan',
        caption: 'Medical Practitioner Practice Expansion Loan'
      },
      {
        src: '/media/thumbnails/thumb_ALS_IMG_55604E4E_Doctor_Loan_9to16.webp',
        alt: 'Hospital and Healthcare Diagnostic Equipment Finance',
        caption: 'Advanced Diagnostic Equipment Financing'
      }
    ],
    video: {
      src: '/media/videos/als_dl_doctor_expand.mp4',
      poster: '/media/thumbnails/thumb_ALS_IMG_7346F014_DOCTOR_LOAN.webp',
      title: 'Doctor Loan Sanctions & Healthcare Asset Leasing'
    }
  }
];

export default function AssetLibrary() {
  useSEO({
    title: 'Marketing Media & Product Asset Library — AVANI LOAN SERVICES',
    description: 'Explore authentic, product-specific marketing media, loan explainer reels, and official visual resources across our 7 core financial solutions.'
  });

  const [activeCategory, setActiveCategory] = useState('ALL');

  const filteredProducts = activeCategory === 'ALL'
    ? PRODUCT_MEDIA_DATA
    : PRODUCT_MEDIA_DATA.filter(p => p.id === activeCategory);

  return (
    <div className="product-assets-page">
      {/* Hero Header */}
      <section className="assets-hero-banner">
        <div className="container">
          <div className="assets-badge">
            <ShieldCheck size={16} />
            <span>OFFICIAL MARKETING MEDIA REPOSITORY</span>
          </div>
          <h1 className="assets-hero-title">AVANI LOAN SERVICES Marketing Assets</h1>
          <p className="assets-hero-subtitle">
            Explore curated, product-specific marketing media, loan explainer videos, and visual loan resources verified by Avani Loan Services for borrowers across Maharashtra.
          </p>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <div className="assets-nav-sticky">
        <div className="container">
          <div className="assets-filter-wrapper">
            <div className="filter-label">
              <Filter size={15} />
              <span>Filter By Product:</span>
            </div>
            <div className="filter-pills-list">
              <button
                type="button"
                className={`product-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategory('ALL')}
              >
                All Products (7)
              </button>
              {PRODUCT_MEDIA_DATA.map(p => (
                <button
                  type="button"
                  key={p.id}
                  className={`product-pill ${activeCategory === p.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(p.id)}
                >
                  {p.name.split('/')[0].split('&')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product-Wise Media Showcase */}
      <section className="assets-showcase-section">
        <div className="container">
          <div className="product-media-cards-stack">
            {filteredProducts.map((prod, idx) => (
              <article key={prod.id} className="product-media-card" id={`product-${prod.id}`}>
                {/* Product Header */}
                <div className="product-card-header">
                  <div className="header-meta">
                    <span className="product-number-tag">SOLUTION 0{idx + 1}</span>
                    <span className="product-category-tag">{prod.category}</span>
                  </div>
                  <h2 className="product-title">{prod.name}</h2>
                  <p className="product-tagline">{prod.tagline}</p>
                  <p className="product-desc">{prod.description}</p>
                  <div className="product-stats-chips">
                    <span className="stat-chip">
                      <strong>Tenure:</strong> {prod.tenure}
                    </span>
                    <span className="stat-chip">
                      <strong>Ticket Size:</strong> {prod.ticketSize}
                    </span>
                    <span className="stat-chip highlight">
                      <CheckCircle2 size={14} /> Zero Client Commission
                    </span>
                  </div>
                </div>

                {/* Media Showcase Grid */}
                <div className="product-media-grid">
                  {/* Curated Images Column (Max 1-2) */}
                  <div className="media-column images-column">
                    <div className="column-title">
                      <ImageIcon size={18} />
                      <span>Verified Visual Creative Assets (Max 2)</span>
                    </div>
                    <div className="images-pair-grid">
                      {prod.images.map((img, i) => (
                        <div key={i} className="asset-media-frame image-frame">
                          <img
                            src={img.src}
                            alt={img.alt}
                            loading="lazy"
                            className="media-visual-img"
                          />
                          <div className="media-caption-bar">
                            <span className="caption-text">{img.caption}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Curated Video Column (Max 1) */}
                  <div className="media-column video-column">
                    <div className="column-title">
                      <VideoIcon size={18} />
                      <span>Product Video Reel & Explainer (Max 1)</span>
                    </div>
                    {prod.video ? (
                      <div className="asset-media-frame video-frame">
                        <video
                          controls
                          preload="metadata"
                          poster={prod.video.poster}
                          className="media-visual-video"
                        >
                          <source src={prod.video.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div className="media-caption-bar video-bar">
                          <span className="caption-text">{prod.video.title}</span>
                          <span className="video-badge">HD MP4</span>
                        </div>
                      </div>
                    ) : (
                      <div className="no-video-placeholder">
                        <p>High-definition video explainer in production.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action CTAs */}
                <div className="product-card-actions">
                  <div className="actions-left">
                    <Link to={`/services/${prod.slug}`} className="btn-action-primary">
                      <span>View Detailed Product Information</span>
                      <ArrowRight size={16} />
                    </Link>
                    <Link to={`/apply/${prod.slug}`} className="btn-action-apply">
                      <span>Apply Now</span>
                    </Link>
                    <Link to="/documents" className="btn-action-docs">
                      <span>Required Documents</span>
                    </Link>
                  </div>
                  <div className="actions-right">
                    <a
                      href={`https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES,%20I%20am%20interested%20in%20${encodeURIComponent(prod.name)}.%20Please%20guide%20me.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-action-whatsapp"
                    >
                      <PhoneCall size={15} />
                      <span>Consult Sachin Shinde (+91 91756 35165)</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
