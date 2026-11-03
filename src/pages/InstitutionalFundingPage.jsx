// src/pages/InstitutionalFundingPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — INDIA EDUCATION INSTITUTIONAL FUNDING (PUBLIC ENQUIRY)
// ₹10 Lakh to ₹10 Crore Secured & Unsecured Capital for Schools, Colleges & Trusts
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { GraduationCap, Landmark, ShieldCheck, CheckCircle2, TrendingUp, Send, Loader2 } from 'lucide-react';
import './InstitutionalFundingPage.css';

export default function InstitutionalFundingPage() {
  const [formData, setFormData] = useState({
    institution_name: '',
    institution_category: 'Private CBSE / ICSE School',
    legal_entity: 'Educational Charitable Trust',
    contact_person: '',
    designation: '',
    official_email: '',
    telephone: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    website: '',
    funding_requirement: 'School infrastructure finance',
    estimated_amount: 50000000, // ₹5 Cr
    funding_purpose: '',
    secured_unsecured_preference: 'Secured against campus land & building',
    existing_loans_detail: '',
    preferred_contact_time: 'Afternoon (2 PM - 5 PM)',
    enquiry_description: '',
    privacy_acknowledgement: false,
    email_opt_in: false,
    whatsapp_opt_in: false
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.privacy_acknowledgement) {
      setErrorMsg('Please acknowledge the privacy policy to submit your funding consultation enquiry.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/portal/public/education-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setEnquiryId(data.enquiry_id);
      } else {
        setErrorMsg(data.message || 'Submission failed. Please check form inputs.');
      }
    } catch {
      setErrorMsg('Network connectivity issue. Please try again or reach our desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="institutional-funding-page">
      {/* Hero */}
      <section className="if-hero">
        <div className="if-container">
          <div className="if-hero-badge">
            <GraduationCap size={16} /> India Education Institutional Finance Desk
          </div>
          <h1 className="if-hero-title">
            Institutional Growth & Infrastructure Funding For Educational Institutions
          </h1>
          <p className="if-hero-subtitle">
            Avani Loan Services structures debt facilities from ₹10 Lakh to ₹10 Crore for private schools,
            engineering & medical colleges, universities, and educational trusts across India with leading commercial lenders.
          </p>

          <div className="if-hero-stats">
            <div className="if-stat">
              <span className="if-stat-num">₹10L – ₹10Cr</span>
              <span className="if-stat-label">Funding Ticket Sizes</span>
            </div>
            <div className="if-stat">
              <span className="if-stat-num">12 Products</span>
              <span className="if-stat-label">Specialized Categories</span>
            </div>
            <div className="if-stat">
              <span className="if-stat-num">15+ Yrs</span>
              <span className="if-stat-label">Long-Term Tenures</span>
            </div>
            <div className="if-stat">
              <span className="if-stat-num">Pan-India</span>
              <span className="if-stat-label">National Coverage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="if-content-section">
        <div className="if-container if-grid">
          {/* Left Column: Products & Proposition */}
          <div className="if-info-column">
            <h2>Institutional Funding Solutions</h2>
            <p className="if-desc">
              We evaluate each educational institution’s cash flows, student enrolment stability, fee receivables,
              and physical assets to match with the most competitive institutional bank underwriting.
            </p>

            <div className="if-products-grid">
              <div className="if-p-card">
                <Landmark size={22} color="#0F766E" />
                <div>
                  <h4>Campus Infrastructure Finance</h4>
                  <p>Funding for construction of school wings, lecture auditoriums, science blocks, and hostel towers.</p>
                </div>
              </div>

              <div className="if-p-card">
                <TrendingUp size={22} color="#0F766E" />
                <div>
                  <h4>Equipment & High-Tech Labs</h4>
                  <p>Robotics, AI computing labs, medical diagnostic apparatus, smart classrooms, and sports facilities.</p>
                </div>
              </div>

              <div className="if-p-card">
                <ShieldCheck size={22} color="#0F766E" />
                <div>
                  <h4>Trust & Society Debt Restructuring</h4>
                  <p>Consolidating high-cost liabilities into low-interest, long-tenure structured institutional loans.</p>
                </div>
              </div>
            </div>

            <div className="if-eligibility-box">
              <h4>Eligibility & Document Checklist</h4>
              <ul>
                <li>Valid Trust / Society / Section 8 Registration certificate</li>
                <li>Audited Balance Sheets & IT returns for last 3 financial years</li>
                <li>Affiliation letters (CBSE / ICSE / State Board / AICTE / UGC)</li>
                <li>Past 3 years student fee collection register & bank statements</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="if-form-column">
            <div className="if-form-card">
              {submitted ? (
                <div className="if-success-card">
                  <div className="if-success-icon"><CheckCircle2 size={48} color="#059669" /></div>
                  <h3>Funding Consultation Requested</h3>
                  <p>Thank you for submitting your institution's funding requirement.</p>
                  <div className="if-ref-box">
                    <span>Enquiry Reference Number:</span>
                    <strong>{enquiryId}</strong>
                  </div>
                  <p className="if-subtext">
                    Our Senior Institutional Finance Advisor will review your profile and reach out within 1 business day for a confidential consultation.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="if-btn if-btn-outline">
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="if-form">
                  <div className="if-form-header">
                    <h3>Request Funding Consultation</h3>
                    <p>Confidential institutional eligibility evaluation</p>
                  </div>

                  {errorMsg && (
                    <div className="if-error-box">{errorMsg}</div>
                  )}

                  <div className="if-form-group">
                    <label>Institution Name *</label>
                    <input
                      type="text"
                      name="institution_name"
                      required
                      placeholder="e.g. Podar International School / SVKM Trust"
                      value={formData.institution_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="if-form-row">
                    <div className="if-form-group">
                      <label>Institution Category *</label>
                      <select name="institution_category" value={formData.institution_category} onChange={handleChange}>
                        <option value="Private CBSE / ICSE School">Private CBSE / ICSE School</option>
                        <option value="State Board School">State Board School</option>
                        <option value="Engineering & Tech College">Engineering & Tech College</option>
                        <option value="Medical & Healthcare Institute">Medical & Healthcare Institute</option>
                        <option value="Arts, Science & Commerce College">Arts, Science & Commerce College</option>
                        <option value="Educational Charitable Trust">Educational Charitable Trust</option>
                        <option value="Coaching & Professional Academy">Coaching & Professional Academy</option>
                      </select>
                    </div>

                    <div className="if-form-group">
                      <label>Legal Entity Type</label>
                      <select name="legal_entity" value={formData.legal_entity} onChange={handleChange}>
                        <option value="Public Charitable Trust (BPT Act)">Public Charitable Trust (BPT Act)</option>
                        <option value="Societies Registration Act">Societies Registration Act</option>
                        <option value="Section 8 Company (Not-for-Profit)">Section 8 Company (Not-for-Profit)</option>
                        <option value="Private Limited Company">Private Limited Company</option>
                      </select>
                    </div>
                  </div>

                  <div className="if-form-row">
                    <div className="if-form-group">
                      <label>Authorized Contact Person *</label>
                      <input
                        type="text"
                        name="contact_person"
                        required
                        placeholder="e.g. Dr. A. K. Sharma"
                        value={formData.contact_person}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="if-form-group">
                      <label>Designation *</label>
                      <input
                        type="text"
                        name="designation"
                        required
                        placeholder="e.g. Managing Trustee / CFO / Director"
                        value={formData.designation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="if-form-row">
                    <div className="if-form-group">
                      <label>Official Email *</label>
                      <input
                        type="email"
                        name="official_email"
                        required
                        placeholder="trustee@institution.edu.in"
                        value={formData.official_email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="if-form-group">
                      <label>Direct Phone / Desk Ext *</label>
                      <input
                        type="tel"
                        name="telephone"
                        required
                        placeholder="+91 22 2844 XXXX"
                        value={formData.telephone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="if-form-row">
                    <div className="if-form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="e.g. Pune / Mumbai"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="if-form-group">
                      <label>State *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="e.g. Maharashtra"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="if-form-row">
                    <div className="if-form-group">
                      <label>Funding Requirement</label>
                      <select name="funding_requirement" value={formData.funding_requirement} onChange={handleChange}>
                        <option value="School infrastructure finance">School infrastructure finance</option>
                        <option value="College infrastructure finance">College infrastructure finance</option>
                        <option value="Education institution expansion finance">Education institution expansion finance</option>
                        <option value="Land and building finance">Land and building finance</option>
                        <option value="Construction finance">Construction finance</option>
                        <option value="Equipment and laboratory finance">Equipment and laboratory finance</option>
                        <option value="Working capital finance">Working capital finance</option>
                        <option value="Loan Against Property">Loan Against Property</option>
                        <option value="Educational trust funding">Educational trust funding</option>
                      </select>
                    </div>

                    <div className="if-form-group">
                      <label>Estimated Amount</label>
                      <select name="estimated_amount" value={formData.estimated_amount} onChange={handleChange}>
                        <option value="25000000">₹2.5 Crore</option>
                        <option value="50000000">₹5.0 Crore</option>
                        <option value="75000000">₹7.5 Crore</option>
                        <option value="100000000">₹10.0 Crore</option>
                        <option value="150000000">Above ₹10 Crore</option>
                      </select>
                    </div>
                  </div>

                  <div className="if-form-group">
                    <label>Funding Purpose & Campus Brief</label>
                    <textarea
                      rows="3"
                      name="funding_purpose"
                      placeholder="Describe expansion scope, new course launches, or infrastructure requirements..."
                      value={formData.funding_purpose}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Consents */}
                  <div className="if-consents">
                    <label className="if-checkbox-label">
                      <input
                        type="checkbox"
                        name="privacy_acknowledgement"
                        checked={formData.privacy_acknowledgement}
                        onChange={handleChange}
                        required
                      />
                      <span>I confirm that I am an authorized management representative and agree to confidential institutional review under the Privacy Policy. *</span>
                    </label>

                    <label className="if-checkbox-label">
                      <input
                        type="checkbox"
                        name="email_opt_in"
                        checked={formData.email_opt_in}
                        onChange={handleChange}
                      />
                      <span>Optional: I consent to receive institutional funding guidance reports via email.</span>
                    </label>

                    <label className="if-checkbox-label">
                      <input
                        type="checkbox"
                        name="whatsapp_opt_in"
                        checked={formData.whatsapp_opt_in}
                        onChange={handleChange}
                      />
                      <span>Optional: Connect with our desk via official WhatsApp channel.</span>
                    </label>
                  </div>

                  <button type="submit" disabled={submitting} className="if-btn if-btn-primary">
                    {submitting ? (
                      <><Loader2 className="spinner" size={18} /> Processing Request...</>
                    ) : (
                      <><Send size={18} /> Submit Funding Consultation Request</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
