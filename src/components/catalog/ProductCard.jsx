// src/components/catalog/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  Building2,
  Stethoscope,
  Home,
  Layers,
  GraduationCap,
  Globe,
  Building,
  Award,
  ShieldCheck,
  ShieldAlert,
  FileText,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

const ICONS = {
  UserCheck: <UserCheck size={26} />,
  Building2: <Building2 size={26} />,
  Stethoscope: <Stethoscope size={26} />,
  Home: <Home size={26} />,
  Layers: <Layers size={26} />,
  GraduationCap: <GraduationCap size={26} />,
  Globe: <Globe size={26} />,
  Building: <Building size={26} />,
  Award: <Award size={26} />,
  ShieldAlert: <ShieldAlert size={26} />
};

export default function ProductCard({
  product,
  isExpanded,
  onToggleExpand,
  onOpenDocuments
}) {
  const icon = ICONS[product.iconName] || <UserCheck size={26} />;
  const encodedWa = encodeURIComponent(product.whatsappText);
  const waUrl = `https://wa.me/919175635165?text=${encodedWa}`;
  const applyUrl = `/contact?product=${encodeURIComponent(product.applyProductValue)}`;

  return (
    <div className={`catalog-card glass-card ${isExpanded ? 'card-active' : ''}`} id={`card-${product.id}`}>
      {/* Card Header */}
      <div className="card-top-row">
        <div className="card-icon-wrapper">
          {icon}
        </div>
        <div className="card-badges">
          <span className="card-category-badge">{product.categoryLabel}</span>
          {product.badge && <span className="card-feature-badge">{product.badge}</span>}
        </div>
      </div>

      {/* Product Titles */}
      <div className="card-title-section">
        <h3 className="card-product-title">{product.title}</h3>
        <p className="card-product-desc">{product.shortDescription}</p>
      </div>

      {/* Ideal For Target Box */}
      <div className="card-target-box">
        <span className="card-target-label">Ideal For:</span>
        <span className="card-target-value">{product.idealFor}</span>
      </div>

      {/* Key Benefits Preview */}
      <div className="card-benefits-box">
        <span className="card-benefits-label">Key Highlights:</span>
        <ul className="card-benefits-list">
          {product.keyBenefits.slice(0, 4).map((benefit, idx) => (
            <li key={idx} className="card-benefit-item">
              <CheckCircle2 size={16} className="card-benefit-check" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Compliance / Safe Note if special */}
      {product.safeNote && (
        <div className="card-safe-note">
          <small>ℹ️ {product.safeNote}</small>
        </div>
      )}

      {/* 4 Standardized Conversion Buttons */}
      <div className="card-cta-grid">
        {/* 1. Apply Now */}
        <Link to={applyUrl} className="btn card-btn-apply" title={`Apply for ${product.title}`}>
          <span>Apply Now</span>
          <ArrowRight size={15} />
        </Link>

        {/* 2. WhatsApp Advisor */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn card-btn-wa"
          title={`WhatsApp enquiry for ${product.title}`}
        >
          <MessageCircle size={15} />
          <span>WhatsApp</span>
        </a>

        {/* 3. Documents Required */}
        <button
          type="button"
          className="btn card-btn-docs"
          onClick={() => onOpenDocuments(product)}
          title={`View documents required for ${product.title}`}
        >
          <FileText size={15} />
          <span>Documents</span>
        </button>

        {/* 4. Check Eligibility */}
        <Link
          to={product.eligibilityRoute}
          className="btn card-btn-eligibility"
          title={`Check eligibility for ${product.title}`}
        >
          <ShieldCheck size={15} />
          <span>Eligibility</span>
        </Link>
      </div>

      {/* Expand / Details Toggle Button */}
      <div className="card-expand-toggle">
        <button
          type="button"
          className="btn-toggle-details"
          onClick={() => onToggleExpand(product.id)}
          aria-expanded={isExpanded}
          aria-controls={`details-${product.id}`}
        >
          <span>{isExpanded ? 'Hide Detailed Section' : 'View Full Details & Requirements'}</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Detailed Section Drawer (Expandable) */}
      {isExpanded && (
        <div className="card-expanded-drawer animate-fade-in" id={`details-${product.id}`}>
          <div className="drawer-divider"></div>

          {/* Overview */}
          <div className="drawer-section">
            <h4 className="drawer-heading">📖 Product Overview</h4>
            <p className="drawer-text">{product.shortDescription}</p>
          </div>

          {/* Who Can Consider */}
          <div className="drawer-section">
            <h4 className="drawer-heading">👥 Who Can Consider This Loan?</h4>
            <p className="drawer-text">{product.idealFor}</p>
          </div>

          {/* Common Uses */}
          {product.commonUses && (
            <div className="drawer-section">
              <h4 className="drawer-heading">🎯 Common Uses</h4>
              <ul className="drawer-list">
                {product.commonUses.map((use, uIdx) => (
                  <li key={uIdx}>{use}</li>
                ))}
              </ul>
            </div>
          )}

          {/* All Key Benefits */}
          <div className="drawer-section">
            <h4 className="drawer-heading">⭐ Key Benefits</h4>
            <ul className="drawer-list">
              {product.keyBenefits.map((b, bIdx) => (
                <li key={bIdx}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Typical Eligibility Factors */}
          <div className="drawer-section">
            <h4 className="drawer-heading">⚖️ Typical Eligibility Factors</h4>
            <ul className="drawer-list">
              {product.eligibilityFactors.map((factor, fIdx) => (
                <li key={fIdx}>{factor}</li>
              ))}
            </ul>
          </div>

          {/* Common Documents */}
          <div className="drawer-section">
            <h4 className="drawer-heading">📄 Common Documents</h4>
            <ul className="drawer-list">
              {product.commonDocuments.map((doc, dIdx) => (
                <li key={dIdx}>{doc}</li>
              ))}
            </ul>
          </div>

          {/* 5-Step Process */}
          <div className="drawer-section">
            <h4 className="drawer-heading">🔄 How It Works — 5-Step Process</h4>
            <div className="drawer-process-steps">
              <div className="d-step"><span>1</span> Submit Enquiry</div>
              <div className="d-step"><span>2</span> Eligibility Review</div>
              <div className="d-step"><span>3</span> Documentation</div>
              <div className="d-step"><span>4</span> Lender Evaluation</div>
              <div className="d-step"><span>5</span> Sanction & Disbursement*</div>
            </div>
            <small className="d-step-note">*Subject to lender approval & underwriting policies.</small>
          </div>

          {/* Drawer Quick Action Footer */}
          <div className="drawer-actions">
            <Link to={applyUrl} className="btn btn-primary">
              Apply for {product.title}
            </Link>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              <MessageCircle size={16} />
              <span>WhatsApp Advisor</span>
            </a>
            <button type="button" className="btn btn-outline" onClick={() => onOpenDocuments(product)}>
              <FileText size={16} />
              <span>Request Documents List</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
