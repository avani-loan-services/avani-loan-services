import useSEO from '../hooks/useSEO';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Video, BookOpen, Clock, Tag } from 'lucide-react';
import brandLogo from '../assets/avani-brand-logo.png';

// Import local professional images
import personalImg from '../assets/personal-loan.png';
import businessImg from '../assets/business-loan.png';
import educationImg from '../assets/education-loan.png';
import homeImg from '../assets/home-loan.png';
import mortgageImg from '../assets/mortgage-loan.png';
import cibilBanner from '../assets/avani_cibil_banner.png';

import './Blog.css';

const posts = [
  { id: 11, image: educationImg, category: 'School Funding', title: 'School Infrastructure & EdTech Loans in Maharashtra 2026', date: 'April 02, 2026', readTime: '7 min read', hasVideo: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', desc: 'Complete guide for private school trusts and directors to secure low-interest loans for Smart Classrooms, school buses, building expansion, and teacher salary reserves.' },
  { id: 12, image: educationImg, category: 'College Funding', title: 'College & University Higher Education Funding Guide', date: 'March 28, 2026', readTime: '9 min read', hasVideo: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', desc: 'How degree colleges, engineering institutes, and medical colleges in Latur & Maharashtra can access institutional expansion credit, plus 100% fee funding for students.' },
  { id: 1, image: cibilBanner, category: 'CIBIL Repair', title: 'CIBIL Score Kaise Badhayein – 7 Proven Tips in 2026', date: 'March 20, 2026', readTime: '6 min read', hasVideo: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', desc: 'Your CIBIL score is the key to getting any loan in India. Here are 7 expert credit correction strategies to boost your CIBIL score from 600 to 750+ within 12 months.' },
  { id: 2, image: homeImg, title: 'Complete Guide to Home Loans in Maharashtra 2026', category: 'Home Loan', date: 'March 10, 2026', readTime: '8 min read', hasVideo: false, desc: 'Everything you need to know about home loans in Maharashtra — eligibility, documents, EMI calculation, PMAY interest subsidy, and how to get rates starting from 7.3%.' },
  { id: 3, image: educationImg, title: 'How to Fund MBBS Abroad: Education Loans Explained', category: 'Education Loan', date: 'Feb 28, 2026', readTime: '7 min read', hasVideo: false, desc: 'Planning to study medicine abroad? Our complete guide covers education loans for MBBS in Russia, Philippines, Georgia, UK, USA and more.' },
  { id: 4, image: businessImg, title: 'Business Loan vs Working Capital Loan – What\'s Right for You?', category: 'Business Loan', date: 'Feb 15, 2026', readTime: '5 min read', hasVideo: false, desc: 'Confused between a business term loan and working capital facility? This guide explains both with real examples from Maharashtra businesses.' },
  { id: 5, image: mortgageImg, title: 'LAP Loan in Latur: How to Get Best Loan Against Property', category: 'Mortgage', date: 'Feb 05, 2026', readTime: '6 min read', hasVideo: false, desc: 'Loan Against Property is one of the smartest ways to raise large funds at low interest. Here\'s a location-specific guide for Latur property owners.' },
  { id: 6, image: personalImg, title: 'Personal Loan Rejection Reasons & How to Avoid Them', category: 'Personal Loan', date: 'Jan 28, 2026', readTime: '5 min read', hasVideo: false, desc: 'Getting rejected for a personal loan is frustrating. Here are the top 8 reasons banks reject applications and how you can fix them.' }
];

export default function Blog() {
  useSEO({ 
    title: 'Financial Blog, School & College Funding Guides - Avani Loan Services', 
    description: 'Expert financial guides on School Funding, College Loans, CIBIL Correction, Home & Business loans in Latur, Maharashtra.', 
    keywords: 'School Funding, College Funding, CIBIL Repair, Education Loan, Home Loan, Business Loan, Avani Loan Services Latur' 
  });

  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <div className="page-header-top">
            <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
            <div>
              <span className="badge">Blog, School & College Funding Guides</span>
              <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
            </div>
          </div>
          <h1>Loan Tips, School Funding & Financial Video Guides</h1>
          <p>Expert articles and video walkthroughs to help you secure fast loan approvals in Maharashtra</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="blog-grid">
            {posts.map(post => (
              <article key={post.id} className="blog-card glass-card animate-fade-in">
                <div className="blog-image" style={{ width: '100%', height: '210px', overflow: 'hidden', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', marginBottom: '16px', position: 'relative' }}>
                  <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {post.hasVideo && (
                    <button 
                      onClick={() => setActiveVideo(post)}
                      className="blog-video-play-badge"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.45)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div style={{ background: '#0052CC', borderRadius: '50%', padding: '12px', display: 'flex', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>
                        <PlayCircle size={32} color="#ffffff" />
                      </div>
                    </button>
                  )}
                </div>
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-separator">•</span>
                  <span className="blog-date">{post.date}</span>
                  <span className="blog-separator">•</span>
                  <span className="blog-read">{post.readTime}</span>
                </div>
                <h2 className="blog-title">{post.title}</h2>
                <p className="blog-desc">{post.desc}</p>
                <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                  {post.hasVideo ? (
                    <button onClick={() => setActiveVideo(post)} className="btn btn-outline" style={{ fontSize: '13px', width: '100%' }}>
                      📹 Watch Video Guide
                    </button>
                  ) : (
                    <Link to="/contact" className="blog-read-more">Read More & Get Free Advice →</Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Video Guide Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '720px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '16px 20px', background: '#0F172A', color: '#ffffff', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#ffffff' }}>📹 {activeVideo.title}</h3>
              <button onClick={() => setActiveVideo(null)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: '20px', cursor: 'pointer', marginLeft: 'auto' }}>✕</button>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ background: '#000000', borderRadius: '12px', height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', flexDirection: 'column', gap: '12px' }}>
                <Video size={48} color="#0052CC" />
                <h4 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>{activeVideo.title}</h4>
                <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '480px' }}>Video Walkthrough Provisioned: Contact Avani Loan Services at +91 9175635165 to get personalized Video Consultation & Document Verification.</p>
                <a href="https://wa.me/919175635165" target="_blank" rel="noopener noreferrer" className="btn btn-primary">💬 Request Video Consultation on WhatsApp</a>
              </div>
            </div>
            <div style={{ padding: '16px 24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', textRight: 'right' }}>
              <button onClick={() => setActiveVideo(null)} className="btn btn-outline">Close Player</button>
            </div>
          </div>
        </div>
      )}

      <section className="blog-cta-section section">
        <div className="container text-center">
          <h2>Have a Loan, School or College Funding Question?</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: 24 }}>Visit us: Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India — WhatsApp us now.</p>
          <a href="https://wa.me/919175635165" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">💬 WhatsApp for Free Advice</a>
        </div>
      </section>
    </div>
  );
}

