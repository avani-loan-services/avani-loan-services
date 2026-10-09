// src/components/catalog/DocumentModal.jsx
import React, { useEffect } from 'react';
import { X, FileText, CheckCircle, ShieldAlert, MessageCircle, Download } from 'lucide-react';
import { GENERAL_DOCUMENTS } from '../../data/catalogProducts';

export default function DocumentModal({ isOpen, onClose, selectedProduct }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const waDocText = encodeURIComponent(
    selectedProduct
      ? `Hello AVANI LOAN SERVICES, please send me the complete verified documents checklist for ${selectedProduct.title}.`
      : 'Hello AVANI LOAN SERVICES, please share the general loan documents checklist.'
  );

  return (
    <div className="doc-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="doc-modal-title">
      <div className="doc-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="doc-modal-header">
          <div>
            <div className="doc-modal-badge">
              <FileText size={14} />
              <span>Documentation Checklist</span>
            </div>
            <h2 id="doc-modal-title" className="doc-modal-title">
              {selectedProduct ? `Documents Required: ${selectedProduct.title}` : 'Loan Documents Checklist'}
            </h2>
            <p className="doc-modal-subtitle">
              Prepare these standard documents to expedite your loan underwriting and lender evaluation.
            </p>
          </div>
          <button className="doc-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="doc-modal-body">
          {/* Specific Product Documents if selected */}
          {selectedProduct && selectedProduct.commonDocuments && (
            <div className="doc-product-highlight">
              <h3 className="doc-section-heading">
                📋 Key Documents for {selectedProduct.title}
              </h3>
              <ul className="doc-list">
                {selectedProduct.commonDocuments.map((doc, idx) => (
                  <li key={idx} className="doc-list-item">
                    <CheckCircle size={18} className="doc-item-icon" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* General Comprehensive Checklists by Applicant Category */}
          <div className="doc-categories-container">
            <h3 className="doc-section-heading">
              📂 General Documentation Checklist by Borrower Profile
            </h3>
            <div className="doc-categories-grid">
              {GENERAL_DOCUMENTS.map((categoryGroup, index) => (
                <div key={index} className="doc-category-card">
                  <div className="doc-category-header">
                    <h4>{categoryGroup.category}</h4>
                    <span className="doc-category-sub">{categoryGroup.subtitle}</span>
                  </div>
                  <ul className="doc-list">
                    {categoryGroup.documents.map((docItem, dIdx) => (
                      <li key={dIdx} className="doc-list-item">
                        <CheckCircle size={16} className="doc-item-icon text-muted" />
                        <span>{docItem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Financial Disclaimer */}
          <div className="doc-disclaimer-box">
            <ShieldAlert size={20} className="doc-disclaimer-icon" />
            <div>
              <strong>Mandatory Documentation Notice:</strong>
              <p>
                Exact documents vary by product, applicant profile and lender. This is a general checklist, not a final lender-specific document list. Additional statutory, tax, or legal documentation may be requested during credit appraisal.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer CTAs */}
        <div className="doc-modal-footer">
          <a
            href={`https://wa.me/919175635165?text=${waDocText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa-modal"
          >
            <MessageCircle size={18} />
            <span>Request Detailed Checklist via WhatsApp</span>
          </a>
          <button className="btn btn-outline" onClick={onClose}>
            Close Checklist
          </button>
        </div>
      </div>
    </div>
  );
}
