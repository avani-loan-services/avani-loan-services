// src/pages/DownloadApplication.jsx
// ─────────────────────────────────────────────────────────────────
// Official Application Download & Document Kit Module
// AVANI LOAN SERVICES — Official Customer Forms & Application Portal
// ─────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileDown,
  Download,
  CheckCircle,
  FileText,
  Printer,
  ShieldCheck,
  Building,
  UserCheck,
  GraduationCap,
  Briefcase,
  HelpCircle,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import './Documents.css';

export default function DownloadApplication() {
  const [activeTab, setActiveTab] = useState('application-forms');
  const [downloadSuccess, setDownloadSuccess] = useState('');

  const handleDownloadKit = (kitName, filename) => {
    // Generate a structured printable application document / trigger browser print / download
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to download or print the official application kit.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AVANI LOAN SERVICES — ${kitName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #0f3460; padding-bottom: 20px; margin-bottom: 25px; }
          .header h1 { color: #0f3460; margin: 0 0 5px; font-size: 24px; text-transform: uppercase; letter-spacing: 0.5px; }
          .header p { margin: 0; color: #64748b; font-size: 13px; font-weight: 500; }
          .section-title { font-size: 15px; font-weight: 700; color: #0f3460; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px; margin-bottom: 12px; text-transform: uppercase; }
          .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
          .field { border: 1px dashed #94a3b8; padding: 8px 12px; border-radius: 4px; font-size: 12px; min-height: 24px; display: flex; flex-direction: column; justify-content: space-between; }
          .field-label { font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px; }
          .checkbox-group { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0; font-size: 12px; }
          .checkbox-item { display: flex; align-items: center; gap: 6px; }
          .box { width: 14px; height: 14px; border: 1px solid #475569; display: inline-block; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #64748b; display: flex; justify-content: space-between; }
          .sig-box { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-line { width: 220px; border-top: 1px solid #0f3460; text-align: center; padding-top: 5px; font-size: 11px; font-weight: 600; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AVANI LOAN SERVICES</h1>
          <p>Official Retail & Commercial Loan Application Kit • Latur, Maharashtra</p>
          <p>Support: +91-9175635165 | Web: www.avanifinserv.com</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 6px; margin-bottom: 20px; font-size: 12px;">
          <strong>Document:</strong> ${kitName} | <strong>Form Code:</strong> ALS-APP-2026-V2 | <strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}
        </div>

        <div class="section-title">1. Applicant Personal Details</div>
        <div class="form-grid">
          <div class="field"><span class="field-label">Full Name of Applicant (as per PAN):</span></div>
          <div class="field"><span class="field-label">Mobile Number:</span></div>
          <div class="field"><span class="field-label">Email Address:</span></div>
          <div class="field"><span class="field-label">PAN Number:</span></div>
          <div class="field"><span class="field-label">Aadhaar Number (Last 4 Digits):</span></div>
          <div class="field"><span class="field-label">Date of Birth (DD/MM/YYYY):</span></div>
        </div>

        <div class="section-title">2. Loan Request Details</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="box"></span> Salary / Personal Loan</div>
          <div class="checkbox-item"><span class="box"></span> Business Loan / Working Capital</div>
          <div class="checkbox-item"><span class="box"></span> Home Loan / Construction</div>
          <div class="checkbox-item"><span class="box"></span> Mortgage / Loan Against Property</div>
          <div class="checkbox-item"><span class="box"></span> Education Loan (India / Abroad)</div>
          <div class="checkbox-item"><span class="box"></span> CA / Doctor Professional Loan</div>
        </div>
        <div class="form-grid" style="margin-top: 10px;">
          <div class="field"><span class="field-label">Loan Amount Required (₹):</span></div>
          <div class="field"><span class="field-label">Preferred Tenure (Years / Months):</span></div>
        </div>

        <div class="section-title">3. Employment & Income Particulars</div>
        <div class="form-grid">
          <div class="field"><span class="field-label">Employer / Business Name:</span></div>
          <div class="field"><span class="field-label">Monthly Net In-Hand Income / Turnover:</span></div>
          <div class="field"><span class="field-label">Current Office / Business Address:</span></div>
          <div class="field"><span class="field-label">Existing Monthly EMI Obligations (₹):</span></div>
        </div>

        <div class="section-title">4. Mandatory Document Checklist (Enclosed)</div>
        <div class="checkbox-group">
          <div class="checkbox-item"><span class="box"></span> PAN Card Copy</div>
          <div class="checkbox-item"><span class="box"></span> Aadhaar Card Copy</div>
          <div class="checkbox-item"><span class="box"></span> Last 3-6 Months Bank Statements</div>
          <div class="checkbox-item"><span class="box"></span> Salary Slips (3 Mos) / ITR (2 Yrs)</div>
          <div class="checkbox-item"><span class="box"></span> Property Documents / Admission Letter (if applicable)</div>
        </div>

        <div class="sig-box">
          <div class="sig-line">Date & Place</div>
          <div class="sig-line">Applicant Signature</div>
        </div>

        <div class="footer">
          <span>AVANI LOAN SERVICES • Rajiv Gandhi Chauk, Opp Bank of Baroda, Latur - 413512</span>
          <span>Page 1 of 1 • Official Customer Copy</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setDownloadSuccess(`Generated ${kitName}. You can print or save it as PDF.`);
    setTimeout(() => setDownloadSuccess(''), 5000);
  };

  const documentKits = [
    {
      id: 'salaried-app-kit',
      title: 'Salaried Professional Loan Application Kit',
      category: 'Salary Loans',
      size: 'Official PDF Kit • 2 Pages',
      icon: <Briefcase size={24} className="text-primary" />,
      description: 'Standard application form, 3-month salary slip verification guide, and KYC checklist for private & government employees.',
      documentsIncluded: ['Universal Loan Application Form', 'Salary Slips & Form 16 Format', 'Banking Checklist (Net Banking / PDF)', 'Employer Identity Guidelines']
    },
    {
      id: 'business-app-kit',
      title: 'Business & SME Loan Application Kit',
      category: 'Business & LAP',
      size: 'Official PDF Kit • 3 Pages',
      icon: <Building size={24} className="text-primary" />,
      description: 'Comprehensive application form for traders, manufacturers, MSMEs, and proprietorships with ITR and GST worksheets.',
      documentsIncluded: ['Commercial Loan Application Form', 'GST 3B & 2A Reconciliation Guide', '2 Years ITR & Audit Balance Sheet Format', 'Property Collateral Submission Form']
    },
    {
      id: 'education-app-kit',
      title: 'Student Education Loan Application Kit',
      category: 'Education Loans',
      size: 'Official PDF Kit • 2 Pages',
      icon: <GraduationCap size={24} className="text-primary" />,
      description: 'Student & Co-borrower application package for Indian colleges and international study abroad programs.',
      documentsIncluded: ['Student + Co-Applicant Application Form', 'University Admission & Fee Structure Breakdown', 'Visa & GRE/IELTS Score Submission Format', 'Moratorium & Collateral Declaration']
    },
    {
      id: 'professional-app-kit',
      title: 'Doctor & CA Professional Loan Kit',
      category: 'Professional Loans',
      size: 'Official PDF Kit • 2 Pages',
      icon: <UserCheck size={24} className="text-primary" />,
      description: 'Specialized application kit for Chartered Accountants, Medical Doctors, Dentists, and Consulting Professionals.',
      documentsIncluded: ['Professional Loan Application Form', 'ICAI / Medical Council COP Submission', 'Clinic / Practice Proof Declaration', 'Fast-Track Sanction Checklist']
    }
  ];

  return (
    <div className="documents-page animate-fade-in">
      {/* Hero Section */}
      <section className="documents-hero" style={{ background: 'linear-gradient(135deg, #0f3460 0%, #16213e 100%)' }}>
        <div className="container text-center">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '30px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '16px' }}>
            <FileDown size={16} />
            <span>OFFICIAL DOWNLOAD PORTAL</span>
          </div>
          <h1 className="hero-title" style={{ color: '#ffffff' }}>Official Loan Application Downloads</h1>
          <p className="hero-subtitle" style={{ color: '#cbd5e1', maxWidth: '750px', margin: '0 auto' }}>
            Download, print, or review official AVANI LOAN SERVICES application forms, KYC checklists, and document kits for all retail and commercial loan products.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="documents-content-section section">
        <div className="container">
          {downloadSuccess && (
            <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '14px 20px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle size={20} />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e2e8f0', marginBottom: '32px' }}>
            <button
              onClick={() => setActiveTab('application-forms')}
              style={{
                padding: '12px 20px',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === 'application-forms' ? '3px solid #0f3460' : '3px solid transparent',
                color: activeTab === 'application-forms' ? '#0f3460' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem'
              }}
            >
              <FileText size={18} />
              <span>Application Kits & Forms</span>
            </button>

            <button
              onClick={() => setActiveTab('digital-submission')}
              style={{
                padding: '12px 20px',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === 'digital-submission' ? '3px solid #0f3460' : '3px solid transparent',
                color: activeTab === 'digital-submission' ? '#0f3460' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1rem'
              }}
            >
              <ShieldCheck size={18} />
              <span>Submission Guidelines</span>
            </button>
          </div>

          {activeTab === 'application-forms' && (
            <div className="grid grid-2" style={{ gap: '24px' }}>
              {documentKits.map((kit) => (
                <div key={kit.id} className="card" style={{ padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '10px' }}>
                        {kit.icon}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '20px' }}>
                        {kit.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f3460', marginBottom: '8px' }}>
                      {kit.title}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
                      {kit.description}
                    </p>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Included in this kit:</span>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#64748b' }}>
                        {kit.documentsIncluded.map((doc, idx) => (
                          <li key={idx} style={{ marginBottom: '3px' }}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleDownloadKit(kit.title, `${kit.id}.pdf`)}
                      className="btn btn-primary"
                      style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      <Download size={16} />
                      <span>Download / Print Kit</span>
                    </button>
                    <Link
                      to="/contact"
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', padding: '0 14px' }}
                      title="Request Doorstep Pickup in Latur"
                    >
                      <PhoneCall size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'digital-submission' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>
                How to Submit Your Completed Loan Application
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
                Follow these three simple steps to submit your completed application kit and supporting documents for rapid loan approval.
              </p>

              <div className="grid grid-3" style={{ gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #0f3460' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f3460', marginBottom: '6px' }}>Step 1</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Print & Fill Kit</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Download the application kit matching your loan profile. Fill in applicant, income, and bank details.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #e94560' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#e94560', marginBottom: '6px' }}>Step 2</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Attach KYC & Proofs</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Enclose PAN, Aadhaar, 3-6 months bank statement, and salary slips or ITR as listed in the checklist.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>Step 3</div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Submit Digitally / Offline</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Upload to our online document vault, send via WhatsApp (+91-9175635165), or request doorstep branch pickup.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', background: '#eff6ff', padding: '20px', borderRadius: '10px' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 4px', color: '#1e3a8a' }}>Prefer digital document submission?</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#3b82f6' }}>You can directly upload your documents to our encrypted AI Loan Verification vault.</p>
                </div>
                <Link to="/documents" className="btn btn-primary">
                  <span>Open Document Vault</span>
                  <ArrowRight size={16} />
                </Link>
                <a
                  href="https://wa.me/919175635165?text=Hello%20AVANI%20LOAN%20SERVICES,%20I%20have%20filled%20my%20loan%20application%20form%20and%20want%20to%20submit%20documents."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp Submission</span>
                </a>
              </div>
            </div>
          )}

          {/* Quick FAQ */}
          <div style={{ marginTop: '48px', borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f3460', marginBottom: '16px' }}>
              Frequently Asked Questions About Applications
            </h3>
            <div className="grid grid-2" style={{ gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Are these application forms accepted by all partner banks?</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Yes. AVANI LOAN SERVICES is an authorized loan facilitator with 40+ national banks and NBFCs. Our standardized kits capture all KYC and underwriting parameters required across lenders.</p>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>Can I get assistance filling out the form?</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Absolutely. Call our Latur office at +91-9175635165 or send a message on WhatsApp. Our advisors provide free form-filling and documentation guidance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
