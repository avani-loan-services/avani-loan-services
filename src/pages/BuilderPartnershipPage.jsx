// src/pages/BuilderPartnershipPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — BUILDER PARTNERSHIP INITIATIVE (PUBLIC ENQUIRY)
// Home Loan Referral Tie-Ups for Maharashtra Residential Property Developers
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Building2, ShieldCheck, CheckCircle2, Award, Clock, ArrowRight, Loader2, Send } from 'lucide-react';
import './BuilderPartnershipPage.css';

export default function BuilderPartnershipPage() {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    designation: '',
    official_email: '',
    business_telephone: '',
    city: 'Mumbai',
    website: '',
    residential_project_count: 1,
    partnership_interest: 'Home Loan Referral Tie-Up',
    preferred_discussion_time: 'Weekday Mornings (10 AM - 1 PM)',
    enquiry_description: '',
    privacy_acknowledgement: false,
    marketing_opt_in: false
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
      setErrorMsg('Please acknowledge the privacy policy to submit your enquiry.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/portal/public/builder-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setEnquiryId(data.enquiry_id);
      } else {
        setErrorMsg(data.message || 'Submission failed. Please check form details.');
      }
    } catch {
      setErrorMsg('Network connectivity issue. Please try again or reach our desk directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="builder-partnership-page">
      {/* Hero Section */}
      <section className="bp-hero">
        <div className="bp-container">
          <div className="bp-hero-badge">
            <Building2 size={16} /> Maharashtra Residential Builder Partnership
          </div>
          <h1 className="bp-hero-title">
            Empower Your Homebuyers With High-Speed Bank Loan Approvals
          </h1>
          <p className="bp-hero-subtitle">
            Avani Loan Services partners with Maharashtra’s premier residential developers to provide 
            dedicated on-site and digital home loan desks, 30+ leading banking alliances, and rapid loan sanction turnarounds.
          </p>
          <div className="bp-hero-stats">
            <div className="bp-stat">
              <span className="bp-stat-num">30+</span>
              <span className="bp-stat-label">Banking Alliances</span>
            </div>
            <div className="bp-stat">
              <span className="bp-stat-num">₹500Cr+</span>
              <span className="bp-stat-label">Retail Disbursed</span>
            </div>
            <div className="bp-stat">
              <span className="bp-stat-num">10 Cities</span>
              <span className="bp-stat-label">Maharashtra Hubs</span>
            </div>
            <div className="bp-stat">
              <span className="bp-stat-num">7 Days</span>
              <span className="bp-stat-label">Avg. Sanction Window</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Form */}
      <section className="bp-content-section">
        <div className="bp-container bp-grid">
          {/* Left: Value Proposition */}
          <div className="bp-info-column">
            <h2>Why Partner With Avani Loan Services?</h2>
            <p className="bp-desc">
              Homebuyer cancellation due to loan delays is the single biggest bottleneck in residential property sales.
              We embed dedicated home loan specialists into your sales office to deliver seamless bank underwriting.
            </p>

            <div className="bp-cards">
              <div className="bp-card">
                <div className="bp-card-icon"><ShieldCheck size={24} color="#0052CC" /></div>
                <div>
                  <h3>Multi-Bank Project Approvals (APF)</h3>
                  <p>We streamline APF (Approved Project Financial) tie-ups across SBI, HDFC Bank, ICICI, Axis, and leading housing finance companies.</p>
                </div>
              </div>

              <div className="bp-card">
                <div className="bp-card-icon"><Award size={24} color="#0052CC" /></div>
                <div>
                  <h3>Zero Cost to Developer</h3>
                  <p>Our dedicated customer desk, digital document portal, and liaison services are completely free for builders and developers.</p>
                </div>
              </div>

              <div className="bp-card">
                <div className="bp-card-icon"><CheckCircle2 size={24} color="#0052CC" /></div>
                <div>
                  <h3>Higher Booking Conversions</h3>
                  <p>Immediate buyer eligibility checks (FOIR, CIBIL, Multiplier) turn casual walk-in visitors into confirmed spot bookings.</p>
                </div>
              </div>
            </div>

            <div className="bp-cities-box">
              <h4>Active Maharashtra Operating Regions</h4>
              <p>Mumbai & MMR • Pune • Thane • Navi Mumbai • PCMC • Nagpur • Nashik • Chhatrapati Sambhajinagar • Kolhapur • Solapur</p>
            </div>
          </div>

          {/* Right: Enquiry Form */}
          <div className="bp-form-column">
            <div className="bp-form-card">
              {submitted ? (
                <div className="bp-success-card">
                  <div className="bp-success-icon"><CheckCircle2 size={48} color="#10B981" /></div>
                  <h3>Partnership Enquiry Registered</h3>
                  <p>Thank you for expressing interest in partnering with Avani Loan Services.</p>
                  <div className="bp-ref-box">
                    <span>Reference Tracking ID:</span>
                    <strong>{enquiryId}</strong>
                  </div>
                  <p className="bp-subtext">
                    Our Senior Banking Alliances Director will contact your office within 1 business day to schedule an introductory discovery meeting.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="bp-btn bp-btn-outline">
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bp-form">
                  <div className="bp-form-header">
                    <h3>Register Builder Partnership</h3>
                    <p>Connect with our Institutional Builder Alliances Desk</p>
                  </div>

                  {errorMsg && (
                    <div className="bp-error-box">{errorMsg}</div>
                  )}

                  <div className="bp-form-group">
                    <label>Company / Builder Name *</label>
                    <input
                      type="text"
                      name="company_name"
                      required
                      placeholder="e.g. Godrej Properties / VTP Realty"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bp-form-row">
                    <div className="bp-form-group">
                      <label>Contact Person *</label>
                      <input
                        type="text"
                        name="contact_person"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={formData.contact_person}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bp-form-group">
                      <label>Designation *</label>
                      <input
                        type="text"
                        name="designation"
                        required
                        placeholder="e.g. Head - Sales / Alliances"
                        value={formData.designation}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="bp-form-row">
                    <div className="bp-form-group">
                      <label>Official Email *</label>
                      <input
                        type="email"
                        name="official_email"
                        required
                        placeholder="alliances@company.com"
                        value={formData.official_email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="bp-form-group">
                      <label>Business Phone *</label>
                      <input
                        type="tel"
                        name="business_telephone"
                        required
                        placeholder="+91 98220 XXXXX"
                        value={formData.business_telephone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="bp-form-row">
                    <div className="bp-form-group">
                      <label>Operating City *</label>
                      <select name="city" value={formData.city} onChange={handleChange}>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Pune">Pune</option>
                        <option value="Thane">Thane</option>
                        <option value="Navi Mumbai">Navi Mumbai</option>
                        <option value="PCMC">Pimpri-Chinchwad (PCMC)</option>
                        <option value="Nagpur">Nagpur</option>
                        <option value="Nashik">Nashik</option>
                        <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                        <option value="Kolhapur">Kolhapur</option>
                        <option value="Solapur">Solapur</option>
                      </select>
                    </div>
                    <div className="bp-form-group">
                      <label>Residential Projects Count</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        name="residential_project_count"
                        value={formData.residential_project_count}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="bp-form-group">
                    <label>Corporate Website</label>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://www.yourcompany.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="bp-form-group">
                    <label>Partnership Interest</label>
                    <select name="partnership_interest" value={formData.partnership_interest} onChange={handleChange}>
                      <option value="Home Loan Referral Tie-Up">Home Loan Referral Tie-Up</option>
                      <option value="On-Site Loan Helpdesk Setup">On-Site Loan Helpdesk Setup</option>
                      <option value="Multi-Bank APF Project Approval">Multi-Bank APF Project Approval</option>
                      <option value="Construction Finance Advisory">Construction Finance Advisory</option>
                    </select>
                  </div>

                  <div className="bp-form-group">
                    <label>Enquiry Details / Project Brief</label>
                    <textarea
                      rows="3"
                      name="enquiry_description"
                      placeholder="Share details regarding your current residential launches and requirements..."
                      value={formData.enquiry_description}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Consents */}
                  <div className="bp-consents">
                    <label className="bp-checkbox-label">
                      <input
                        type="checkbox"
                        name="privacy_acknowledgement"
                        checked={formData.privacy_acknowledgement}
                        onChange={handleChange}
                        required
                      />
                      <span>I acknowledge that submitted business information will be used by Avani Loan Services solely for partnership assessment under our Privacy Policy. *</span>
                    </label>

                    <label className="bp-checkbox-label">
                      <input
                        type="checkbox"
                        name="marketing_opt_in"
                        checked={formData.marketing_opt_in}
                        onChange={handleChange}
                      />
                      <span>Optional: I agree to receive partnership updates and mortgage market intelligence via email and WhatsApp.</span>
                    </label>
                  </div>

                  <button type="submit" disabled={submitting} className="bp-btn bp-btn-primary">
                    {submitting ? (
                      <><Loader2 className="spinner" size={18} /> Registering Partnership...</>
                    ) : (
                      <><Send size={18} /> Submit Partnership Enquiry</>
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
