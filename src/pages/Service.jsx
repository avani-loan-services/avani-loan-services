import useSEO from '../hooks/useSEO';
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import services from '../data/services.json';
import generateLongContent from '../utils/generateContent';
import { generateWhatsAppDocumentLink, PHONE_NUMBER, DISPLAY_PHONE } from '../utils/whatsappHelper';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';

export default function Service() {
  useSEO({ title: 'Service - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: 'Service, Loan, Avani Finserv, Latur' });

  const { slug } = useParams();
  const service = services.find((s) => s.slug === slug);

  useEffect(() => {
    if (service) {
      document.title = service.title;

      const setMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.name = name;
          document.head.appendChild(el);
        }
        el.content = content || '';
      };

      setMeta('description', service.metaDescription || '');

      // Open Graph & Twitter
      const setProperty = (prop, content) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', prop);
          document.head.appendChild(el);
        }
        el.content = content || '';
      };

      setProperty('og:title', service.title);
      setProperty('og:description', service.metaDescription || '');
      setProperty('og:type', 'website');
      setProperty('og:url', `${window.location.origin}/services/${service.slug}`);
      setProperty('og:image', `${window.location.origin}/logo.png`);

      const setNameMeta = (name, content) => {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.name = name;
          document.head.appendChild(el);
        }
        el.content = content || '';
      };

      setNameMeta('twitter:card', 'summary_large_image');
      setNameMeta('twitter:title', service.title);
      setNameMeta('twitter:description', service.metaDescription || '');
      setNameMeta('twitter:image', `${window.location.origin}/logo.png`);

      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.rel = 'canonical';
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = `${window.location.origin}/services/${service.slug}`;

      // Add hreflang alternates for English and Marathi
      const addAlternate = (hreflang, href) => {
        let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
        if (!el) {
          el = document.createElement('link');
          el.rel = 'alternate';
          el.hreflang = hreflang;
          document.head.appendChild(el);
        }
        el.href = href;
      };
      addAlternate('en', `${window.location.origin}/services/${service.slug}`);
      addAlternate('mr', `${window.location.origin}/mr/services/${service.slug}`);

      const existing = document.getElementById('service-json-ld');
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'service-json-ld';
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        name: service.h1,
        description: service.metaDescription,
        provider: {
          "@type": "LocalBusiness",
          name: 'Avani Loan Services',
          telephone: '+91-9175635165',
          url: window.location.origin,
          address: {
            "@type": "PostalAddress",
            streetAddress: 'Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India',
            addressLocality: 'Latur',
            addressRegion: 'Maharashtra',
            postalCode: '413512',
            addressCountry: 'IN'
          }
        }
      });
      document.head.appendChild(script);
    } else {
      document.title = 'Service Not Found - Avani Loan Services';
    }
  }, [service]);

  if (!service) {
    return (
      <div className="container">
        <h2>Service not found</h2>
        <p>The requested service does not exist.</p>
        <Link to="/services">View all services</Link>
      </div>
    );
  }

  return (
    <div className="container service-page" style={{ paddingBottom: '60px' }}>
      <nav style={{ marginBottom: 12 }}>
        <Link to="/">Home</Link> &nbsp;›&nbsp; <Link to="/services">Services</Link> &nbsp;›&nbsp; <span>{service.h1}</span>
      </nav>

      <h1>{service.h1}</h1>
      <div dangerouslySetInnerHTML={{ __html: (service.content && service.content.length > 200) ? service.content : generateLongContent(service) }} />

      <div className="service-ctas" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
        <Link to="/contact" state={{ loanType: service.h1 }} className="btn btn-primary">
          Apply for {service.h1} <ArrowRight size={16} />
        </Link>
        <a 
          href={generateWhatsAppDocumentLink(service.h1)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn"
          style={{ background: '#25D366', color: '#fff' }}
          aria-label={`Get ${service.h1} document checklist on WhatsApp`}
        >
          <MessageCircle size={18} style={{ marginRight: '6px' }} /> 📲 Get Document List on WhatsApp
        </a>
        <a 
          href={PHONE_NUMBER} 
          className="btn btn-outline"
          aria-label={`Call Avani Loan Services at 9175635165 for ${service.h1}`}
        >
          <Phone size={18} style={{ marginRight: '6px' }} /> 📞 Call {DISPLAY_PHONE}
        </a>
      </div>
    </div>
  );
}
