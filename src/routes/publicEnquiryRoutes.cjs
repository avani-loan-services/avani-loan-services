// src/routes/publicEnquiryRoutes.cjs
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — PUBLIC ENQUIRY SYSTEMS (BUILDER & EDUCATION)
// Independent endpoints, server-side validation, duplicate prevention, CRM auto-sync
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const db = require('../models/portalDatabase.cjs');

// Rate limiting: max 10 enquiry submissions per hour per IP to prevent spam (relaxed in test mode)
const enquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 500 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many enquiry submissions from this IP address. Please try again later or contact our desk directly.'
  }
});

// Helper for email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+ \-()]{8,20}$/;

// ─────────────────────────────────────────────────────────────────────────────
// 1. POST /api/portal/public/builder-enquiry
// ─────────────────────────────────────────────────────────────────────────────
router.post('/builder-enquiry', enquiryLimiter, (req, res) => {
  try {
    const {
      company_name,
      contact_person,
      designation,
      official_email,
      business_telephone,
      city,
      website,
      residential_project_count,
      partnership_interest,
      preferred_discussion_time,
      enquiry_description,
      privacy_acknowledgement,
      marketing_opt_in
    } = req.body;

    // Server-side validation
    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ success: false, message: 'Company or builder name is required.' });
    }
    if (!contact_person || !contact_person.trim()) {
      return res.status(400).json({ success: false, message: 'Contact person name is required.' });
    }
    if (!official_email || !EMAIL_REGEX.test(official_email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid official email address is required.' });
    }
    if (!business_telephone || !PHONE_REGEX.test(business_telephone.trim())) {
      return res.status(400).json({ success: false, message: 'A valid business telephone number is required.' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'Operating city is required.' });
    }
    if (!privacy_acknowledgement) {
      return res.status(400).json({ success: false, message: 'Privacy policy acknowledgement is required to submit an enquiry.' });
    }

    // Duplicate submission check: match company name and email within last 24 hours
    const recentDuplicate = db.findOne('builder_enquiries', e =>
      e.company_name.toLowerCase() === company_name.trim().toLowerCase() &&
      e.official_email.toLowerCase() === official_email.trim().toLowerCase() &&
      (Date.now() - new Date(e.created_at).getTime() < 24 * 3600 * 1000)
    );

    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'A partnership enquiry from your organization was already received today. Our corporate alliances manager will contact you shortly.',
        enquiry_id: recentDuplicate.enquiry_id
      });
    }

    // Generate unique enquiry ID
    const enquiryId = `ALS-ENQ-BLD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newEnquiry = {
      enquiry_id: enquiryId,
      company_name: company_name.trim(),
      contact_person: contact_person.trim(),
      designation: designation ? designation.trim() : 'Channel Relations',
      official_email: official_email.trim().toLowerCase(),
      business_telephone: business_telephone.trim(),
      city: city.trim(),
      website: website ? website.trim() : '',
      residential_project_count: parseInt(residential_project_count) || 1,
      partnership_interest: partnership_interest || 'Home Loan Referral Tie-Up',
      preferred_discussion_time: preferred_discussion_time || 'General Business Hours',
      enquiry_description: enquiry_description ? enquiry_description.trim() : '',
      privacy_acknowledgement: Boolean(privacy_acknowledgement),
      marketing_opt_in: Boolean(marketing_opt_in),
      crm_lead_created: true,
      status: 'New',
      ip_address: req.ip || '127.0.0.1',
      created_at: new Date().toISOString()
    };

    db.upsert('builder_enquiries', 'enquiry_id', newEnquiry);

    // Auto-create a task for sales team
    const taskId = `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    db.upsert('unified_tasks', 'task_id', {
      task_id: taskId,
      module: 'BUILDER',
      related_id: enquiryId,
      task_title: `Inbound Builder Enquiry: ${company_name} (${city})`,
      task_type: 'Follow-up Call',
      due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: 'High',
      status: 'Pending',
      assigned_to: 'USR-ADMIN-001',
      created_at: new Date().toISOString()
    });

    db.logAudit('PUBLIC_FORM', 'ENQUIRY', 'SUBMIT_BUILDER_ENQUIRY', { enquiryId, company: company_name }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your Builder Partnership Enquiry has been registered successfully. Our Home Loan Alliance Director will contact you within 1 business day.',
      enquiry_id: enquiryId
    });
  } catch (err) {
    console.error('[PublicEnquiry] Builder Error:', err);
    const status = err.statusCode || err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Internal server error while processing enquiry.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. POST /api/portal/public/education-enquiry
// ─────────────────────────────────────────────────────────────────────────────
router.post('/education-enquiry', enquiryLimiter, (req, res) => {
  try {
    const {
      institution_name,
      institution_category,
      legal_entity,
      contact_person,
      designation,
      official_email,
      telephone,
      city,
      state,
      website,
      funding_requirement,
      estimated_amount,
      funding_purpose,
      secured_unsecured_preference,
      existing_loans_detail,
      preferred_contact_time,
      enquiry_description,
      privacy_acknowledgement,
      email_opt_in,
      whatsapp_opt_in
    } = req.body;

    // Server-side validation
    if (!institution_name || !institution_name.trim()) {
      return res.status(400).json({ success: false, message: 'Educational institution name is required.' });
    }
    if (!contact_person || !contact_person.trim()) {
      return res.status(400).json({ success: false, message: 'Authorized contact person name is required.' });
    }
    if (!designation || !designation.trim()) {
      return res.status(400).json({ success: false, message: 'Contact designation / management role is required.' });
    }
    if (!official_email || !EMAIL_REGEX.test(official_email.trim())) {
      return res.status(400).json({ success: false, message: 'A valid official email address is required.' });
    }
    if (!telephone || !PHONE_REGEX.test(telephone.trim())) {
      return res.status(400).json({ success: false, message: 'A valid telephone number is required.' });
    }
    if (!city || !city.trim()) {
      return res.status(400).json({ success: false, message: 'City is required.' });
    }
    if (!privacy_acknowledgement) {
      return res.status(400).json({ success: false, message: 'Privacy policy acknowledgement is required to submit an enquiry.' });
    }

    // Duplicate submission check
    const recentDuplicate = db.findOne('education_enquiries', e =>
      e.institution_name.toLowerCase() === institution_name.trim().toLowerCase() &&
      e.official_email.toLowerCase() === official_email.trim().toLowerCase() &&
      (Date.now() - new Date(e.created_at).getTime() < 24 * 3600 * 1000)
    );

    if (recentDuplicate) {
      return res.status(409).json({
        success: false,
        message: 'A funding consultation enquiry from your institution was already received today. Our Institutional Finance Desk will contact you shortly.',
        enquiry_id: recentDuplicate.enquiry_id
      });
    }

    // Generate unique enquiry ID
    const enquiryId = `ALS-ENQ-EDU-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newEnquiry = {
      enquiry_id: enquiryId,
      institution_name: institution_name.trim(),
      institution_category: institution_category || 'Educational Trust / College',
      legal_entity: legal_entity ? legal_entity.trim() : '',
      contact_person: contact_person.trim(),
      designation: designation.trim(),
      official_email: official_email.trim().toLowerCase(),
      telephone: telephone.trim(),
      city: city.trim(),
      state: state ? state.trim() : 'Maharashtra',
      website: website ? website.trim() : '',
      funding_requirement: funding_requirement || 'Institutional Infrastructure Finance',
      estimated_amount: parseFloat(estimated_amount) || 50000000,
      funding_purpose: funding_purpose ? funding_purpose.trim() : '',
      secured_unsecured_preference: secured_unsecured_preference || 'Secured against campus land & building',
      existing_loans_detail: existing_loans_detail ? existing_loans_detail.trim() : '',
      preferred_contact_time: preferred_contact_time || 'General Business Hours',
      enquiry_description: enquiry_description ? enquiry_description.trim() : '',
      privacy_acknowledgement: Boolean(privacy_acknowledgement),
      email_opt_in: Boolean(email_opt_in),
      whatsapp_opt_in: Boolean(whatsapp_opt_in),
      crm_lead_created: true,
      status: 'New',
      ip_address: req.ip || '127.0.0.1',
      created_at: new Date().toISOString()
    };

    db.upsert('education_enquiries', 'enquiry_id', newEnquiry);

    // Auto-create a task for institutional finance advisors
    const taskId = `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    db.upsert('unified_tasks', 'task_id', {
      task_id: taskId,
      module: 'EDUCATION',
      related_id: enquiryId,
      task_title: `Inbound Institutional Funding Enquiry: ${institution_name} (₹${(newEnquiry.estimated_amount / 10000000).toFixed(1)} Cr)`,
      task_type: 'Preliminary Eligibility Assessment',
      due_date: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      priority: 'High',
      status: 'Pending',
      assigned_to: 'USR-ADMIN-001',
      created_at: new Date().toISOString()
    });

    db.logAudit('PUBLIC_FORM', 'ENQUIRY', 'SUBMIT_EDUCATION_ENQUIRY', { enquiryId, institution: institution_name }, req.ip);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your Institutional Funding Enquiry has been recorded. Our Senior Education Finance Consultant will connect with you within 1 business day.',
      enquiry_id: enquiryId
    });
  } catch (err) {
    console.error('[PublicEnquiry] Education Error:', err);
    const status = err.statusCode || err.status || 500;
    return res.status(status).json({ success: false, message: err.message || 'Internal server error while processing enquiry.' });
  }
});

module.exports = router;
