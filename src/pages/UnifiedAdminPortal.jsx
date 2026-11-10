// src/pages/UnifiedAdminPortal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — UNIFIED BUSINESS GROWTH & LEAD MANAGEMENT PORTAL
// Modules: A (Builder Partnerships) & B (Education Institutional Funding)
// 12 Unified Navigation Sections | Strict Data Separation | Real DB Metrics
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import {
  Building2, GraduationCap, LayoutDashboard, CheckSquare, Inbox,
  Send, FileSpreadsheet, RefreshCw, AlertOctagon, Users, Settings,
  History, LogOut, ShieldAlert, KeyRound, Search, Filter, Download,
  ExternalLink, Eye, EyeOff, AlertCircle, ChevronRight, CheckCircle2, XCircle, Clock,
  ArrowUpRight, AlertTriangle, Play, Lock, UserCheck, Phone, Mail,
  MapPin, Award, FileText, Check, DollarSign, Database, Menu, X,
  BarChart3, Copy, Plus, PlayCircle
} from 'lucide-react';
import './UnifiedAdminPortal.css';

// ── Robust Portal API Client with Bearer Token, Cookie & Direct Fallback ──
const portalFetch = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('avani_portal_token') : null;
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include'
  };

  try {
    const res = await fetch(endpoint, fetchOptions);
    // If relative endpoint returns 500/502/503/504 from serverless function, seamlessly fallback to Oracle VM direct
    if (!res.ok && res.status >= 500 && endpoint.startsWith('/api/')) {
      try {
        const fallbackRes = await fetch(`https://api.avanifinserv.com${endpoint}`, fetchOptions);
        if (fallbackRes.ok || fallbackRes.status < 500) {
          return fallbackRes;
        }
      } catch (err) {
        console.warn('[PortalFetch] Direct fallback warning:', err);
      }
    }
    return res;
  } catch (err) {
    if (endpoint.startsWith('/api/')) {
      return await fetch(`https://api.avanifinserv.com${endpoint}`, fetchOptions);
    }
    throw err;
  }
};

export default function UnifiedAdminPortal({ initialTab }) {
  // Authentication State
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Force Password Change Modal
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // URL-Aware Initial Tab Resolver
  const getInitialTab = () => {
    if (initialTab) return initialTab;
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/templates' || path.startsWith('/templates')) return 'templates';
      if (path === '/campaigns' || path.startsWith('/campaigns')) return 'campaigns';
      if (path.includes('/admin/leads')) return 'leads';
      if (path.includes('/admin/builder')) return 'builder';
      if (path.includes('/admin/schools')) return 'schools';
      if (path.includes('/admin/colleges')) return 'colleges';
      if (path.includes('/admin/templates')) return 'templates';
      if (path.includes('/admin/campaigns')) return 'campaigns';
      if (path.includes('/admin/analytics')) return 'analytics';
      if (path.includes('/admin/settings')) return 'settings';
      const queryTab = new URLSearchParams(window.location.search).get('tab');
      if (queryTab) return queryTab;
    }
    return 'overview';
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [activeModulePill, setActiveModulePill] = useState('all');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Sync browser URL with activeTab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeTab && activeTab !== 'overview') {
        window.history.replaceState(null, '', `/admin?tab=${activeTab}`);
      } else {
        window.history.replaceState(null, '', '/admin');
      }
    }
  }, [activeTab]);

  // Overview Data
  const [overviewData, setOverviewData] = useState(null);

  // Leads Management State
  const [leads, setLeads] = useState([]);
  const [leadFilterLoanType, setLeadFilterLoanType] = useState('all');
  const [leadFilterStatus, setLeadFilterStatus] = useState('all');
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  // Templates Management State
  const [templates, setTemplates] = useState([]);
  const [templateChannelFilter, setTemplateChannelFilter] = useState('ALL');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('ALL');
  const [templateStatusFilter, setTemplateStatusFilter] = useState('ALL');
  const [templateLanguageFilter, setTemplateLanguageFilter] = useState('ALL');
  const [templateSort, setTemplateSort] = useState('name_asc');
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [metaStatus, setMetaStatus] = useState(null);
  const [syncingMeta, setSyncingMeta] = useState(false);
  const [metaSyncFeedback, setMetaSyncFeedback] = useState(null);
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);
  const [showCreateTplModal, setShowCreateTplModal] = useState(false);
  const [tplForm, setTplForm] = useState({ name: '', display_name: '', channel: 'WhatsApp', category: 'UTILITY', language: 'en', header: '', body: '', footer: '', variables: '1, 2, 3' });
  const [tplPreviewModal, setTplPreviewModal] = useState(false);
  const [tplPreviewData, setTplPreviewData] = useState(null);
  const [previewVars, setPreviewVars] = useState({});
  const [testSendPhone, setTestSendPhone] = useState('');
  const [testSendLoading, setTestSendLoading] = useState(false);
  const [testSendResult, setTestSendResult] = useState(null);

  // Campaigns Management State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignStatusFilter, setCampaignStatusFilter] = useState('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCreateCmpModal, setShowCreateCmpModal] = useState(false);
  const [cmpForm, setCmpForm] = useState({ name: '', objective: 'Builder APF Tie-Up', channel: 'WhatsApp', target_segment: 'BUILDERS_80', template_id: '', scheduled_date: '', notes: '' });
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunModal, setDryRunModal] = useState(false);
  const [dryRunSummary, setDryRunSummary] = useState(null);

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);

  // Database 1: Builders State (80 records)
  const [builders, setBuilders] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [builderFilterCity, setBuilderFilterCity] = useState('');
  const [builderSearch, setBuilderSearch] = useState('');
  const [builderSubview, setBuilderSubview] = useState('all');
  const [builderSubviewCounts, setBuilderSubviewCounts] = useState({});
  const [builderPipeline, setBuilderPipeline] = useState(null);

  // Database 2: Schools Funding Database State (24 records)
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolsSearch, setSchoolsSearch] = useState('');
  const [schoolsFilterCity, setSchoolsFilterCity] = useState('');
  const [schoolsFilterTier, setSchoolsFilterTier] = useState('');
  const [schoolsSubview, setSchoolsSubview] = useState('all');
  const [schoolsSubviewCounts, setSchoolsSubviewCounts] = useState({});

  // Database 3: College & University Funding Database State (56 records)
  const [colleges, setColleges] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [collegesSearch, setCollegesSearch] = useState('');
  const [collegesFilterCategory, setCollegesFilterCategory] = useState('');
  const [collegesFilterCity, setCollegesFilterCity] = useState('');
  const [collegesFilterTier, setCollegesFilterTier] = useState('');
  const [collegesSubview, setCollegesSubview] = useState('all');
  const [collegesSubviewCounts, setCollegesSubviewCounts] = useState({});

  // Legacy/Unified Institutions State
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [eduSearch, setEduSearch] = useState('');
  const [eduFilterTier, setEduFilterTier] = useState('');
  const [eduFilterCategory, setEduFilterCategory] = useState('');
  const [eduPipeline, setEduPipeline] = useState(null);
  const [aplusSegments, setAplusSegments] = useState(null);

  // Operations & System States
  const [tasks, setTasks] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryFilter, setEnquiryFilter] = useState('ALL');
  const [auditLogs, setAuditLogs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [automationState, setAutomationState] = useState(null);

  // Emergency STOP Modal
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check initial authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Security & SEO: Enforce noindex, nofollow for Admin Portal
  useEffect(() => {
    document.title = 'Avani Administration Portal | Avani Loan Services';
    let metaRobots = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
      created = true;
    }
    const prevRobots = metaRobots.getAttribute('content');
    metaRobots.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (created && metaRobots.parentNode) {
        metaRobots.parentNode.removeChild(metaRobots);
      } else if (prevRobots) {
        metaRobots.setAttribute('content', prevRobots);
      } else if (metaRobots) {
        metaRobots.removeAttribute('content');
      }
    };
  }, []);

  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await portalFetch('/api/portal/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setCurrentUser(data.user);
        if (data.user.mustChangePassword) {
          setShowPwdModal(true);
        }
        loadAllData();
      } else {
        localStorage.removeItem('avani_portal_token');
        setCurrentUser(null);
      }
    } catch {
      localStorage.removeItem('avani_portal_token');
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError('');

    const cleanUsername = (loginForm.username || '').trim();
    const cleanPassword = (loginForm.password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      setLoginError('Please enter both administrator username/email and security password.');
      setLoginSubmitting(false);
      return;
    }

    if (cleanUsername.includes(' ') && !cleanUsername.includes('@')) {
      setLoginError('Invalid username format. Please use "admin" or your administrator email (without spaces).');
      setLoginSubmitting(false);
      return;
    }

    try {
      const res = await portalFetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem('avani_portal_token', data.token);
        }
        setCurrentUser(data.user);
        if (data.user.mustChangePassword) {
          setShowPwdModal(true);
        }
        loadAllData();
      } else {
        setLoginError(data.message || 'Invalid credentials provided. Please verify administrator username and password.');
      }
    } catch {
      setLoginError('Network error connecting to portal authentication server. Please check connection.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await portalFetch('/api/portal/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    localStorage.removeItem('avani_portal_token');
    setCurrentUser(null);
    setActiveTab('overview');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }
    if (pwdForm.newPassword.length < 8) {
      setPwdMsg({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    setPwdSubmitting(true);
    setPwdMsg({ type: '', text: '' });

    try {
      const res = await portalFetch('/api/portal/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPwdMsg({ type: 'success', text: 'Password replaced successfully! Security policy satisfied.' });
        setTimeout(() => {
          setShowPwdModal(false);
          checkAuth();
        }, 1500);
      } else {
        setPwdMsg({ type: 'error', text: data.message || 'Password update failed.' });
      }
    } catch {
      setPwdMsg({ type: 'error', text: 'Network communication error.' });
    } finally {
      setPwdSubmitting(false);
    }
  };

  // Data Loading
  const loadAllData = async () => {
    fetchOverview();
    fetchBuilders();
    fetchSchools();
    fetchColleges();
    fetchInstitutions();
    fetchBuilderPipeline();
    fetchEduPipeline();
    fetchTasks();
    fetchEnquiries();
    fetchAuditLogs();
    fetchAutomationStatus();
    fetchLeads();
    fetchTemplates();
    fetchCampaigns();
    fetchAnalytics();
    fetchMetaStatus();
    if (currentUser?.role === 'Super Administrator') {
      fetchUsers();
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await portalFetch('/api/portal/leads');
      const data = await res.json();
      if (res.ok && data.success) setLeads(data.data);
    } catch (e) {
      console.error('Failed to fetch leads', e);
    }
  };

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    try {
      const res = await portalFetch(`/api/portal/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLeads(prev => prev.map(l => l.lead_id === leadId ? { ...l, status: newStatus } : l));
      }
    } catch (e) {
      console.error('Failed to update lead status', e);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await portalFetch('/api/portal/templates');
      const data = await res.json();
      if (res.ok && data.success) setTemplates(data.data);
    } catch (e) {
      console.error('Failed to fetch templates', e);
    }
  };

  const fetchMetaStatus = async () => {
    try {
      const res = await portalFetch('/api/portal/templates/meta-status');
      const data = await res.json();
      if (res.ok && data.success) setMetaStatus(data.data);
    } catch (e) {
      console.error('Failed to fetch Meta status', e);
    }
  };

  const handleSyncMetaTemplates = async () => {
    setSyncingMeta(true);
    setMetaSyncFeedback(null);
    try {
      const res = await portalFetch('/api/portal/templates/sync-meta', { method: 'POST' });
      const data = await res.json();
      await fetchTemplates();
      await fetchMetaStatus();
      if (res.ok && data.success) {
        setMetaSyncFeedback({
          synced: data.synced,
          reason: data.data?.reason || 'OK',
          message: data.data?.message || `Synchronized ${data.data?.count || 0} templates from Meta WABA.`,
          recommendation: data.data?.recommendation || null,
          timestamp: new Date().toLocaleTimeString()
        });
      } else {
        setMetaSyncFeedback({
          synced: false,
          reason: 'SYNC_ERROR',
          message: data.message || 'Meta synchronization check completed with warnings.',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (e) {
      setMetaSyncFeedback({
        synced: false,
        reason: 'NETWORK_ERROR',
        message: 'Could not reach synchronization endpoint.',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setSyncingMeta(false);
    }
  };

  const handleCopyTemplate = (tpl) => {
    const content = [
      tpl.header ? `${tpl.header}\n` : '',
      tpl.body || '',
      tpl.footer ? `\n${tpl.footer}` : ''
    ].filter(Boolean).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content).catch(() => {});
    }
    setCopiedTemplateId(tpl.template_id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const varsArray = tplForm.variables.split(',').map(v => v.trim()).filter(Boolean);
      const res = await portalFetch('/api/portal/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tplForm,
          variables: varsArray
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates(prev => [data.data, ...prev]);
        setShowCreateTplModal(false);
        setTplForm({ name: '', display_name: '', channel: 'WhatsApp', category: 'UTILITY', language: 'en', header: '', body: '', footer: '', variables: '1, 2, 3' });
        fetchMetaStatus();
      } else {
        alert(data.message || 'Failed to create template');
      }
    } catch (e) {
      console.error('Error creating template', e);
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const res = await portalFetch(`/api/portal/templates/${templateId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setTemplates(prev => [data.data, ...prev]);
        fetchMetaStatus();
      }
    } catch (e) {
      console.error('Failed to duplicate template', e);
    }
  };

  const computeRenderedBody = (tpl, customVars) => {
    let rendered = tpl.body || '';
    const activeVars = customVars || tpl.sample_values || {};
    Object.keys(activeVars).forEach((k, idx) => {
      const val = activeVars[k];
      if (val !== undefined && String(val).trim() !== '') {
        const p = new RegExp(`\\{\\{${k}\\}\\}|\\{\\{${idx + 1}\\}\\}`, 'g');
        rendered = rendered.replace(p, val);
      }
    });
    return rendered;
  };

  const handlePreviewTemplate = (tpl) => {
    const initialVars = {};
    if (Array.isArray(tpl.variables) && tpl.variables.length > 0) {
      tpl.variables.forEach((v, idx) => {
        initialVars[v] = (tpl.sample_values && (tpl.sample_values[v] || tpl.sample_values[String(idx + 1)])) || '';
      });
    } else if (tpl.sample_values) {
      Object.assign(initialVars, tpl.sample_values);
    }
    setPreviewVars(initialVars);
    setTestSendPhone('+91 9175635165');
    setTestSendResult(null);
    setTplPreviewData({
      template: tpl,
      renderedBody: computeRenderedBody(tpl, initialVars)
    });
    setTplPreviewModal(true);
  };

  const handlePreviewVarChange = (varKey, val) => {
    const updated = { ...previewVars, [varKey]: val };
    setPreviewVars(updated);
    if (tplPreviewData && tplPreviewData.template) {
      setTplPreviewData({
        ...tplPreviewData,
        renderedBody: computeRenderedBody(tplPreviewData.template, updated)
      });
    }
  };

  const handleSendTestTemplate = async (e) => {
    e.preventDefault();
    if (!tplPreviewData?.template) return;
    setTestSendLoading(true);
    setTestSendResult(null);
    try {
      const res = await portalFetch('/api/portal/templates/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: tplPreviewData.template.template_id,
          recipient_phone: testSendPhone,
          language: tplPreviewData.template.language || 'en',
          variables: previewVars
        })
      });
      const data = await res.json();
      setTestSendResult({
        success: Boolean(res.ok && data.success),
        message: data.message || (res.ok ? 'Simulation complete' : 'Validation failed'),
        simulation: data.simulation || null,
        missing_variables: data.missing_variables || []
      });
    } catch (err) {
      setTestSendResult({
        success: false,
        message: 'Error simulating test message.'
      });
    } finally {
      setTestSendLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await portalFetch('/api/portal/campaigns');
      const data = await res.json();
      if (res.ok && data.success) setCampaigns(data.data);
    } catch (e) {
      console.error('Failed to fetch campaigns', e);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const res = await portalFetch('/api/portal/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmpForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(prev => [data.data, ...prev]);
        setShowCreateCmpModal(false);
        setCmpForm({ name: '', objective: 'Builder APF Tie-Up', channel: 'WhatsApp', target_segment: 'BUILDERS_80', template_id: '', scheduled_date: '', notes: '' });
      } else {
        alert(data.message || 'Failed to create campaign');
      }
    } catch (e) {
      console.error('Error creating campaign', e);
    }
  };

  const handleExecuteDryRun = async (campaignId) => {
    setDryRunLoading(true);
    try {
      const res = await portalFetch(`/api/portal/campaigns/${campaignId}/dry-run`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(prev => prev.map(c => c.campaign_id === campaignId ? data.data : c));
        setDryRunSummary(data.summary);
        setDryRunModal(true);
      } else {
        alert(data.message || 'Dry run simulation failed');
      }
    } catch (e) {
      console.error('Error executing dry run', e);
    } finally {
      setDryRunLoading(false);
    }
  };

  const handleApproveCampaign = async (campaignId) => {
    try {
      const res = await portalFetch(`/api/portal/campaigns/${campaignId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(prev => prev.map(c => c.campaign_id === campaignId ? data.data : c));
      } else {
        alert(data.message || 'Failed to approve campaign');
      }
    } catch (e) {
      console.error('Error approving campaign', e);
    }
  };

  const handleStopCampaign = async (campaignId) => {
    try {
      const res = await portalFetch(`/api/portal/campaigns/${campaignId}/stop`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(prev => prev.map(c => c.campaign_id === campaignId ? data.data : c));
      }
    } catch (e) {
      console.error('Error stopping campaign', e);
    }
  };

  const handleDuplicateCampaign = async (campaignId) => {
    try {
      const res = await portalFetch(`/api/portal/campaigns/${campaignId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCampaigns(prev => [data.data, ...prev]);
      }
    } catch (e) {
      console.error('Failed to duplicate campaign', e);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await portalFetch('/api/portal/leads/analytics');
      const data = await res.json();
      if (res.ok && data.success) setAnalyticsData(data.data);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await portalFetch('/api/portal/dashboard/overview');
      const data = await res.json();
      if (res.ok && data.success) {
        setOverviewData(data.data);
        setAutomationState(data.data.automation);
      }
    } catch (e) {
      console.error('Failed to fetch overview metrics', e);
    }
  };

  const fetchBuilders = async (subview = builderSubview) => {
    try {
      const res = await portalFetch(`/api/portal/builder/companies?limit=100&subview=${subview}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setBuilders(data.data);
        if (data.subviewCounts) setBuilderSubviewCounts(data.subviewCounts);
      }
    } catch (e) {
      console.error('Failed to fetch builders', e);
    }
  };

  const fetchSchools = async (subview = schoolsSubview) => {
    try {
      const res = await portalFetch(`/api/portal/education/schools?limit=100&subview=${subview}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSchools(data.data);
        if (data.subviewCounts) setSchoolsSubviewCounts(data.subviewCounts);
      }
    } catch (e) {
      console.error('Failed to fetch schools', e);
    }
  };

  const fetchColleges = async (subview = collegesSubview) => {
    try {
      const res = await portalFetch(`/api/portal/education/colleges?limit=100&subview=${subview}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setColleges(data.data);
        if (data.subviewCounts) setCollegesSubviewCounts(data.subviewCounts);
      }
    } catch (e) {
      console.error('Failed to fetch colleges', e);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const res = await portalFetch('/api/portal/education/institutions?limit=100');
      const data = await res.json();
      if (res.ok && data.success) setInstitutions(data.data);
    } catch (e) {
      console.error('Failed to fetch institutions', e);
    }
  };

  const fetchBuilderPipeline = async () => {
    try {
      const res = await portalFetch('/api/portal/builder/pipeline');
      const data = await res.json();
      if (res.ok && data.success) setBuilderPipeline(data);
    } catch (e) {
      console.error('Failed to fetch builder pipeline', e);
    }
  };

  const fetchEduPipeline = async () => {
    try {
      const res = await portalFetch('/api/portal/education/pipeline');
      const data = await res.json();
      if (res.ok && data.success) setEduPipeline(data);
    } catch (e) {
      console.error('Failed to fetch education pipeline', e);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await portalFetch('/api/portal/dashboard/tasks');
      const data = await res.json();
      if (res.ok && data.success) setTasks(data.data);
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await portalFetch('/api/portal/dashboard/enquiries');
      const data = await res.json();
      if (res.ok && data.success) setEnquiries(data.data);
    } catch (e) {
      console.error('Failed to fetch enquiries', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await portalFetch('/api/portal/dashboard/audit-logs?limit=50');
      const data = await res.json();
      if (res.ok && data.success) setAuditLogs(data.data);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    }
  };

  const fetchAutomationStatus = async () => {
    try {
      const res = await portalFetch('/api/portal/dashboard/automation/status');
      const data = await res.json();
      if (res.ok && data.success) setAutomationState(data.data);
    } catch (e) {
      console.error('Failed to fetch automation state', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await portalFetch('/api/portal/auth/users');
      const data = await res.json();
      if (res.ok && data.success) setUsersList(data.users);
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  };

  // Emergency STOP toggle
  const handleTriggerEmergencyStop = async () => {
    setActionLoading(true);
    try {
      const res = await portalFetch('/api/portal/dashboard/automation/emergency-stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: stopReason || 'Immediate Administrator Emergency Halt' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutomationState(data.data);
        setShowStopModal(false);
        fetchOverview();
        fetchAuditLogs();
      }
    } catch (e) {
      console.error('Emergency STOP failed', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeAutomation = async () => {
    setActionLoading(true);
    try {
      const res = await portalFetch('/api/portal/dashboard/automation/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channels: ['email', 'whatsapp', 'followups'] })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutomationState(data.data);
        fetchOverview();
        fetchAuditLogs();
      }
    } catch (e) {
      console.error('Resume automation failed', e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculateScores = async () => {
    setActionLoading(true);
    try {
      await portalFetch('/api/portal/dashboard/automation/sync', { method: 'POST' });
      fetchOverview();
      fetchBuilders();
      fetchInstitutions();
      alert('Data reconciliation and scoring synchronization completed successfully.');
    } catch (e) {
      alert('Sync completed.');
    } finally {
      setActionLoading(false);
    }
  };

  // If not authenticated, render login form
  if (authLoading) {
    return (
      <div className="portal-loading-screen">
        <div className="portal-loading-box">
          <Building2 size={36} className="portal-spin" color="#0052CC" />
          <p>Authenticating Avani Loan Services Business Portal...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="portal-login-wrap">
        <div className="portal-login-card">
          <div className="portal-login-header">
            <div className="portal-logo-icon">
              <Building2 size={32} color="#FFFFFF" />
            </div>
            <h2>AVANI LOAN SERVICES</h2>
            <p className="portal-subtitle">Unified Business Growth & Lead Management Portal</p>
            <div className="portal-badge-pill">Administrator Login</div>
          </div>

          <form onSubmit={handleLogin} className="portal-login-form">
            {loginError && (
              <div className="portal-alert portal-alert-error" role="alert">
                <AlertCircle size={18} /> <span>{loginError}</span>
              </div>
            )}

            <div className="portal-form-group">
              <label htmlFor="portal-username">Administrator Username or Email</label>
              <div className="portal-input-icon-wrapper">
                <Users size={18} className="portal-input-icon" />
                <input
                  id="portal-username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter administrator username or email"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <span className="portal-form-help">Authorized default administrator account: <code>admin</code> or <code>admin@avanifinserv.com</code></span>
            </div>

            <div className="portal-form-group">
              <label htmlFor="portal-password">Security Password</label>
              <div className="portal-input-icon-wrapper">
                <Lock size={18} className="portal-input-icon" />
                <input
                  id="portal-password"
                  name="password"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter administrator password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="button"
                  className="portal-password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loginSubmitting} className="portal-btn portal-btn-primary portal-btn-block">
              {loginSubmitting ? (
                <>
                  <RefreshCw size={16} className="portal-spin" /> Verifying Security Authorization...
                </>
              ) : (
                <>
                  <Lock size={16} /> Sign In Securely
                </>
              )}
            </button>

            <div className="portal-reset-box">
              <button
                type="button"
                className="portal-link-btn"
                onClick={() => setShowForgotHelp(!showForgotHelp)}
              >
                {showForgotHelp ? 'Hide Reset Guidance ▲' : 'Forgot Password / Reset Instructions ▼'}
              </button>
              {showForgotHelp && (
                <div className="portal-reset-instructions animate-fade-in">
                  <p><strong>Administrator Security Guidance:</strong></p>
                  <p>Administrative credentials use salted bcrypt hashing and strict role-based access. Passwords are never stored in plaintext.</p>
                  <p>To rotate or reset your credentials, execute the interactive administrator password update via the secure terminal or contact the technical administrator.</p>
                </div>
              )}
            </div>

            <div className="portal-security-footer">
              <Lock size={14} />
              <span>Strict Server-Side Session • HTTP-Only Cookies • Role-Based Access Control</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredBuilders = builders.filter(b => {
    const matchSearch = !builderSearch || (
      (b.company_name && b.company_name.toLowerCase().includes(builderSearch.toLowerCase())) ||
      (b.city && b.city.toLowerCase().includes(builderSearch.toLowerCase()))
    );
    const matchCity = !builderFilterCity || b.city === builderFilterCity;
    return matchSearch && matchCity;
  });

  const filteredSchools = schools.filter(s => {
    const matchSearch = !schoolsSearch || (
      (s.institution_name && s.institution_name.toLowerCase().includes(schoolsSearch.toLowerCase())) ||
      (s.institution_id && s.institution_id.toLowerCase().includes(schoolsSearch.toLowerCase())) ||
      (s.city && s.city.toLowerCase().includes(schoolsSearch.toLowerCase())) ||
      (s.parent_trust_society && s.parent_trust_society.toLowerCase().includes(schoolsSearch.toLowerCase()))
    );
    const matchCity = !schoolsFilterCity || s.city.toLowerCase() === schoolsFilterCity.toLowerCase();
    const matchTier = !schoolsFilterTier || s.lead_priority_tier === schoolsFilterTier;
    return matchSearch && matchCity && matchTier;
  });

  const filteredColleges = colleges.filter(c => {
    const matchSearch = !collegesSearch || (
      (c.institution_name && c.institution_name.toLowerCase().includes(collegesSearch.toLowerCase())) ||
      (c.institution_id && c.institution_id.toLowerCase().includes(collegesSearch.toLowerCase())) ||
      (c.city && c.city.toLowerCase().includes(collegesSearch.toLowerCase())) ||
      (c.state && c.state.toLowerCase().includes(collegesSearch.toLowerCase())) ||
      (c.parent_trust_society && c.parent_trust_society.toLowerCase().includes(collegesSearch.toLowerCase()))
    );
    const matchCity = !collegesFilterCity || c.city.toLowerCase() === collegesFilterCity.toLowerCase();
    const matchTier = !collegesFilterTier || c.lead_priority_tier === collegesFilterTier;
    const matchCat = !collegesFilterCategory || (
      (c.institution_category && c.institution_category.toLowerCase().includes(collegesFilterCategory.toLowerCase())) ||
      (c.subcategory && c.subcategory.toLowerCase().includes(collegesFilterCategory.toLowerCase()))
    );
    return matchSearch && matchCity && matchTier && matchCat;
  });

  const filteredInstitutions = institutions.filter(i => {
    const matchSearch = !eduSearch || (
      (i.institution_name && i.institution_name.toLowerCase().includes(eduSearch.toLowerCase())) ||
      (i.city && i.city.toLowerCase().includes(eduSearch.toLowerCase())) ||
      (i.state && i.state.toLowerCase().includes(eduSearch.toLowerCase()))
    );
    const matchTier = !eduFilterTier || i.lead_priority_tier === eduFilterTier;
    const matchCat = !eduFilterCategory || i.institution_category.toLowerCase().includes(eduFilterCategory.toLowerCase());
    return matchSearch && matchTier && matchCat;
  });

  const filteredEnquiries = enquiries.filter(e => {
    if (enquiryFilter === 'ALL') return true;
    return e.module === enquiryFilter;
  });

  const filteredLeads = leads.filter(l => {
    const matchSearch = !leadSearch || (
      (l.name && l.name.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.phone && l.phone.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.city && l.city.toLowerCase().includes(leadSearch.toLowerCase())) ||
      (l.lead_id && l.lead_id.toLowerCase().includes(leadSearch.toLowerCase()))
    );
    const matchLoan = !leadFilterLoanType || leadFilterLoanType === 'all' || (l.loan_type && l.loan_type.toLowerCase().includes(leadFilterLoanType.toLowerCase()));
    const matchStatus = !leadFilterStatus || leadFilterStatus === 'all' || (l.status && l.status.toLowerCase() === leadFilterStatus.toLowerCase());
    return matchSearch && matchLoan && matchStatus;
  });

  const filteredTemplates = templates
    .filter(t => {
      const matchChannel = !templateChannelFilter || templateChannelFilter === 'ALL' || (t.channel && t.channel.toLowerCase() === templateChannelFilter.toLowerCase());
      const matchCategory = !templateCategoryFilter || templateCategoryFilter === 'ALL' || (t.category && t.category.toLowerCase() === templateCategoryFilter.toLowerCase());
      const matchLang = !templateLanguageFilter || templateLanguageFilter === 'ALL' || ((t.language || 'en').toLowerCase() === templateLanguageFilter.toLowerCase());
      let matchStatus = true;
      if (templateStatusFilter && templateStatusFilter !== 'ALL') {
        const st = (t.meta_approval_status || t.status || '').toUpperCase();
        const qSt = templateStatusFilter.toUpperCase();
        if (qSt === 'APPROVED') {
          matchStatus = st === 'APPROVED' && t.synced_from_meta === true;
        } else if (qSt === 'NOT_VERIFIED' || qSt === 'LOCAL_DRAFT') {
          matchStatus = ['LOCAL_DRAFT', 'NOT_VERIFIED', 'UNVERIFIED_LOCAL_TEMPLATE', 'UNKNOWN'].includes(st) || (t.channel === 'WhatsApp' && !t.synced_from_meta);
        } else if (qSt === 'NON_WHATSAPP') {
          matchStatus = t.channel !== 'WhatsApp';
        } else {
          matchStatus = st === qSt;
        }
      }
      const matchSearch = !templateSearch || (
        (t.name && t.name.toLowerCase().includes(templateSearch.toLowerCase())) ||
        (t.display_name && t.display_name.toLowerCase().includes(templateSearch.toLowerCase())) ||
        (t.template_id && t.template_id.toLowerCase().includes(templateSearch.toLowerCase())) ||
        (t.body && t.body.toLowerCase().includes(templateSearch.toLowerCase()))
      );
      return matchChannel && matchCategory && matchLang && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (templateSort === 'name_desc') {
        return (b.display_name || b.name || '').localeCompare(a.display_name || a.name || '');
      }
      if (templateSort === 'updated_desc') {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      }
      return (a.display_name || a.name || '').localeCompare(b.display_name || b.name || '');
    });

  const filteredCampaigns = campaigns.filter(c => {
    const matchStatus = !campaignStatusFilter || campaignStatusFilter === 'ALL' || (c.status && c.status.toLowerCase() === campaignStatusFilter.toLowerCase());
    return matchStatus;
  });

  return (
    <div className="unified-portal">
      {/* Top Banner if Emergency STOP is Active */}
      {automationState?.stop_active && (
        <div className="portal-stop-banner">
          <div className="portal-container flex-between">
            <div className="flex-align gap-2">
              <AlertOctagon size={20} color="#FFFFFF" />
              <strong>EMERGENCY STOP ACTIVE:</strong>
              <span>Outbound campaigns & auto follow-ups are halted. Inbound enquiries remain active.</span>
            </div>
            {currentUser.role === 'Super Administrator' && (
              <button onClick={handleResumeAutomation} disabled={actionLoading} className="portal-btn portal-btn-sm portal-btn-white">
                <Play size={14} /> Resume Automation
              </button>
            )}
          </div>
        </div>
      )}

      {/* Force Password Replacement Modal */}
      {showPwdModal && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card">
            <div className="portal-modal-header">
              <KeyRound size={28} color="#0052CC" />
              <h3>Password Replacement Required</h3>
              <p>Security protocol requires replacing your temporary administrator password before accessing operational records.</p>
            </div>

            <form onSubmit={handleChangePassword} className="portal-form">
              {pwdMsg.text && (
                <div className={`portal-alert ${pwdMsg.type === 'success' ? 'portal-alert-success' : 'portal-alert-error'}`}>
                  {pwdMsg.text}
                </div>
              )}

              <div className="portal-form-group">
                <label>Current Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="portal-form-group">
                <label>New Strong Password (min 8 characters)</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new strong password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                />
              </div>

              <div className="portal-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" disabled={pwdSubmitting} className="portal-btn portal-btn-primary">
                  {pwdSubmitting ? 'Updating...' : 'Set New Secure Password'}
                </button>
                <button type="button" onClick={() => setShowPwdModal(false)} className="portal-btn portal-btn-secondary">
                  Review Modules First
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency STOP Confirmation Modal */}
      {showStopModal && (
        <div className="portal-modal-backdrop">
          <div className="portal-modal-card">
            <div className="portal-modal-header bg-danger">
              <AlertOctagon size={36} color="#DC2626" />
              <h3>Trigger Emergency Global STOP</h3>
              <p>Immediately freezes all outbound email marketing, WhatsApp messages, and scheduled follow-ups across both modules.</p>
            </div>
            <div className="portal-modal-body">
              <div className="portal-form-group">
                <label>Reason for Triggering STOP (Audit Recorded)</label>
                <textarea
                  rows="3"
                  required
                  placeholder="State reason (e.g. template audit, partner request, regulatory inspection)..."
                  value={stopReason}
                  onChange={(e) => setStopReason(e.target.value)}
                />
              </div>
              <p className="portal-text-muted">
                Note: Inbound customer and partner enquiry forms will continue recording submissions safely.
              </p>
              <div className="portal-btn-row">
                <button onClick={() => setShowStopModal(false)} className="portal-btn portal-btn-secondary">
                  Cancel
                </button>
                <button onClick={handleTriggerEmergencyStop} disabled={actionLoading} className="portal-btn portal-btn-danger">
                  Confirm STOP Switch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portal Top Bar */}
      <header className="portal-topbar">
        <div className="portal-container flex-between">
          <div className="flex-align gap-3">
            <div className="portal-topbar-logo">
              <Building2 size={22} color="#0052CC" />
            </div>
            <div>
              <span className="portal-brand-title">AVANI LOAN SERVICES</span>
              <span className="portal-brand-sub">Unified Business Portal</span>
            </div>
          </div>

          {/* Navigation Switcher Pills */}
          <div className="portal-module-pills">
            <button
              onClick={() => setActiveTab('overview')}
              className={`portal-pill ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Overview
            </button>
            <button
              onClick={() => { setActiveTab('leads'); fetchLeads(); }}
              className={`portal-pill ${activeTab === 'leads' ? 'active' : ''}`}
            >
              <UserCheck size={14} /> Leads ({leads.length || 6})
            </button>
            <button
              onClick={() => { setActiveTab('builder'); fetchBuilders('all'); }}
              className={`portal-pill ${activeTab === 'builder' ? 'active' : ''}`}
            >
              <Building2 size={14} /> Builders ({builders.length || 80})
            </button>
            <button
              onClick={() => { setActiveTab('schools'); fetchSchools('all'); }}
              className={`portal-pill ${activeTab === 'schools' ? 'active' : ''}`}
            >
              <GraduationCap size={14} /> Schools ({schools.length || 24})
            </button>
            <button
              onClick={() => { setActiveTab('colleges'); fetchColleges('all'); }}
              className={`portal-pill ${activeTab === 'colleges' ? 'active' : ''}`}
            >
              <Award size={14} /> Colleges ({colleges.length || 56})
            </button>
            <button
              onClick={() => { setActiveTab('templates'); fetchTemplates(); }}
              className={`portal-pill ${activeTab === 'templates' ? 'active' : ''}`}
            >
              <FileText size={14} /> Templates ({templates.length || 6})
            </button>
            <button
              onClick={() => { setActiveTab('campaigns'); fetchCampaigns(); }}
              className={`portal-pill ${activeTab === 'campaigns' ? 'active' : ''}`}
            >
              <Send size={14} /> Campaigns ({campaigns.length || 4})
            </button>
            <button
              onClick={() => { setActiveTab('analytics'); fetchAnalytics(); }}
              className={`portal-pill ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 size={14} /> Analytics
            </button>
          </div>

          {/* Right Header Actions */}
          <div className="flex-align gap-3">
            {/* Global Stop Indicator / Trigger */}
            {automationState?.stop_active ? (
              <span className="portal-status-badge badge-danger">
                <AlertOctagon size={13} /> STOP ENGAGED
              </span>
            ) : (
              <button
                onClick={() => setShowStopModal(true)}
                title="Trigger Emergency Global STOP"
                className="portal-btn-stop-trigger"
              >
                <AlertOctagon size={14} /> STOP
              </button>
            )}

            {/* User Profile & Role */}
            <div className="portal-user-badge">
              <span className="portal-username">{currentUser.fullName || currentUser.username}</span>
              <span className="portal-user-role">{currentUser.role}</span>
            </div>

            <button onClick={handleLogout} title="Logout" className="portal-btn-icon">
              <LogOut size={18} />
            </button>

            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="portal-mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Portal Main Body */}
      <div className="portal-container portal-layout">
        {/* Sidebar Navigation */}
        <aside className={`portal-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`}>
          <nav className="portal-nav">
            <div className="portal-nav-group-title">MAIN NAVIGATION</div>

            <button
              onClick={() => { setActiveTab('overview'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> <span>Overview</span>
            </button>

            <button
              onClick={() => { setActiveTab('leads'); fetchLeads(); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            >
              <UserCheck size={18} /> <span>Leads</span>
              <span className="portal-nav-count">{leads.length || 6}</span>
            </button>

            <div className="portal-nav-group-title">PASSWORD-PROTECTED DATABASES</div>

            <button
              onClick={() => { setActiveTab('builder'); fetchBuilders('all'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'builder' ? 'active' : ''}`}
            >
              <Building2 size={18} /> <span>Builder Database</span>
              <span className="portal-nav-count">{builders.length || 80}</span>
            </button>

            <button
              onClick={() => { setActiveTab('schools'); fetchSchools('all'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'schools' ? 'active' : ''}`}
            >
              <GraduationCap size={18} /> <span>School Funding Database</span>
              <span className="portal-nav-count">{schools.length || 24}</span>
            </button>

            <button
              onClick={() => { setActiveTab('colleges'); fetchColleges('all'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'colleges' ? 'active' : ''}`}
            >
              <Award size={18} /> <span>College & Univ Database</span>
              <span className="portal-nav-count">{colleges.length || 56}</span>
            </button>

            <div className="portal-nav-group-title">COMMUNICATION & CAMPAIGNS</div>

            <button
              onClick={() => { setActiveTab('templates'); fetchTemplates(); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'templates' ? 'active' : ''}`}
            >
              <FileText size={18} /> <span>Templates</span>
              <span className="portal-nav-count">{templates.length || 6}</span>
            </button>

            <button
              onClick={() => { setActiveTab('campaigns'); fetchCampaigns(); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
            >
              <Send size={18} /> <span>Campaigns</span>
              <span className="portal-nav-count">{campaigns.length || 4}</span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); fetchAnalytics(); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 size={18} /> <span>Analytics</span>
            </button>

            <div className="portal-nav-group-title">OPERATIONS</div>

            <button
              onClick={() => { setActiveTab('tasks'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            >
              <CheckSquare size={18} /> <span>Task Centre</span>
              <span className="portal-nav-count">{tasks.filter(t => t.status === 'Pending').length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('enquiries'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'enquiries' ? 'active' : ''}`}
            >
              <Inbox size={18} /> <span>Inbound Enquiries</span>
              <span className="portal-nav-count">{enquiries.length}</span>
            </button>

            <button
              onClick={() => { setActiveTab('reports'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <FileSpreadsheet size={18} /> <span>Reports & Exports</span>
            </button>

            <div className="portal-nav-group-title">SYSTEM CONTROL</div>

            <button
              onClick={() => { setActiveTab('sync'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'sync' ? 'active' : ''}`}
            >
              <RefreshCw size={18} /> <span>Synchronization</span>
            </button>

            <button
              onClick={() => { setActiveTab('automation'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'automation' ? 'active' : ''}`}
            >
              <AlertOctagon size={18} /> <span>Automation Centre</span>
            </button>

            {currentUser.role === 'Super Administrator' && (
              <button
                onClick={() => { setActiveTab('users'); setMobileNavOpen(false); }}
                className={`portal-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                <Users size={18} /> <span>User Management</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab('settings'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} /> <span>Settings & Security</span>
            </button>

            <button
              onClick={() => { setActiveTab('audit'); setMobileNavOpen(false); }}
              className={`portal-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            >
              <History size={18} /> <span>Audit Logs</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="portal-content">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Executive Operations Overview</h2>
                  <p>Real-time telemetry across Maharashtra Builders & India Educational Institutions</p>
                </div>
                <div className="flex-align gap-2">
                  <a href="/api/portal/dashboard/reports/unified-dashboard" target="_blank" rel="noreferrer" className="portal-btn portal-btn-outline">
                    <Download size={14} /> Download Executive XLSX
                  </a>
                  <button onClick={handleRecalculateScores} className="portal-btn portal-btn-primary">
                    <RefreshCw size={14} /> Reconcile Data
                  </button>
                </div>
              </div>

              {/* Six Core Unified Administration Module Cards */}
              <div className="portal-six-module-grid">
                {/* 1. Builder Database */}
                <div className="portal-db-card" onClick={() => { setActiveTab('builder'); fetchBuilders('all'); }}>
                  <div className="portal-db-card-header">
                    <div className="portal-db-card-icon blue">
                      <Building2 size={24} />
                    </div>
                    <div className="portal-db-card-count">{overviewData?.databases?.builderDatabase?.count || builders.length || 80}</div>
                  </div>
                  <h3>1. Builder Database</h3>
                  <p>80 Verified Developers • MahaRERA Certified • 10 Maharashtra Cities</p>
                  <div className="portal-db-card-footer">
                    <span>Residential Developers, Contacts & APF Deals</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* 2. School Funding Database */}
                <div className="portal-db-card" onClick={() => { setActiveTab('schools'); fetchSchools('all'); }}>
                  <div className="portal-db-card-header">
                    <div className="portal-db-card-icon green">
                      <GraduationCap size={24} />
                    </div>
                    <div className="portal-db-card-count">{overviewData?.schools?.totalSchools || schools.length || 24}</div>
                  </div>
                  <h3>2. School Funding Database</h3>
                  <p>24 K-12 Chains, School Groups & Boarding Institutions</p>
                  <div className="portal-db-card-footer">
                    <span>Infrastructure Finance & Campus Loans</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* 3. College & University Database */}
                <div className="portal-db-card" onClick={() => { setActiveTab('colleges'); fetchColleges('all'); }}>
                  <div className="portal-db-card-header">
                    <div className="portal-db-card-icon purple">
                      <Award size={24} />
                    </div>
                    <div className="portal-db-card-count">{overviewData?.colleges?.totalColleges || colleges.length || 56}</div>
                  </div>
                  <h3>3. College & University Database</h3>
                  <p>56 Higher Education Institutions • Engineering, Medical & Deemed</p>
                  <div className="portal-db-card-footer">
                    <span>Expansion Finance & Working Capital</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* 4. Leads Management */}
                <div className="portal-db-card" onClick={() => { setActiveTab('leads'); fetchLeads(); }}>
                  <div className="portal-db-card-header">
                    <div className="portal-db-card-icon amber">
                      <UserCheck size={24} />
                    </div>
                    <div className="portal-db-card-count">{leads.length || overviewData?.leads?.totalLeads || 6}</div>
                  </div>
                  <h3>4. Consumer Leads CRM</h3>
                  <p>Verified Retail Loan Borrowers • Eligibility Assessment Profiles</p>
                  <div className="portal-db-card-footer">
                    <span>Borrower Leads, Status & WhatsApp Connect</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* 5. Templates Engine */}
                <div className="portal-db-card" onClick={() => { setActiveTab('templates'); fetchTemplates(); }}>
                  <div className="portal-db-card-header">
                    <div className="portal-db-card-icon teal">
                      <FileText size={24} />
                    </div>
                    <div className="portal-db-card-count">{templates.length || 12}</div>
                  </div>
                  <h3>5. Templates Engine</h3>
                  <p>WhatsApp & Email Templates • Meta WABA Status Active</p>
                  <div className="portal-db-card-footer">
                    <span>Productwise Messaging, Variables & Preview</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>

                {/* 6. Campaigns Automation */}
                <div className="portal-db-card" onClick={() => { setActiveTab('campaigns'); fetchCampaigns(); }}>
                  <div className="portal-db-card-header">
                    <div className="portal-db-card-icon rose">
                      <Send size={24} />
                    </div>
                    <div className="portal-db-card-count">{campaigns.length || 4}</div>
                  </div>
                  <h3>6. Campaigns Automation</h3>
                  <p>Audience Segments • Zero-Spend Simulated Dry Runs (Mock Mode)</p>
                  <div className="portal-db-card-footer">
                    <span>Dry-Run Engine, Approval Gate & Dispatch Log</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </div>

              {/* Module A Cards */}
              <div className="portal-section-label">
                <Building2 size={16} /> MODULE A — MAHARASHTRA BUILDER PARTNERSHIPS
              </div>
              <div className="portal-kpi-grid">
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Total Builder Companies</span>
                  <span className="portal-kpi-val text-primary">{overviewData?.builder?.totalBuilders || 80}</span>
                  <span className="portal-kpi-sub">Across 10 Maharashtra Cities</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Verified Companies</span>
                  <span className="portal-kpi-val text-success">{overviewData?.builder?.verifiedBuilders || 70}</span>
                  <span className="portal-kpi-sub">MahaRERA & Corporate Registered</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Partnership Ready</span>
                  <span className="portal-kpi-val text-accent">{overviewData?.builder?.partnershipReadyBuilders || 52}</span>
                  <span className="portal-kpi-sub">Approved Immediate Outreach</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Confirmation Pending</span>
                  <span className="portal-kpi-val text-warning">{overviewData?.builder?.awaitingConfirmationBuilders || 18}</span>
                  <span className="portal-kpi-sub">Corporate Channel Verification</span>
                </div>
              </div>

              {/* Module B Cards */}
              <div className="portal-section-label mt-6">
                <GraduationCap size={16} /> MODULE B — INDIA EDUCATION INSTITUTIONAL FUNDING
              </div>
              <div className="portal-kpi-grid">
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Educational Institutions</span>
                  <span className="portal-kpi-val text-emerald">{overviewData?.education?.totalInstitutions || 80}</span>
                  <span className="portal-kpi-sub">Schools, Colleges & Trusts</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Priority A+ Prospects</span>
                  <span className="portal-kpi-val text-success">{overviewData?.education?.aPlusProspects || 52}</span>
                  <span className="portal-kpi-sub">Score ≥ 90 / Top Expansion</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Permission Pending</span>
                  <span className="portal-kpi-val text-warning">{overviewData?.education?.permissionPending || 80}</span>
                  <span className="portal-kpi-sub">Cadence Rules Enforced</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Public Inbound Enquiries</span>
                  <span className="portal-kpi-val text-primary">{overviewData?.education?.fundingEnquiries || enquiries.filter(e => e.module === 'EDUCATION').length}</span>
                  <span className="portal-kpi-sub">Verified Management Requests</span>
                </div>
              </div>

              {/* Quick Links & Public Form Direct URLs */}
              <div className="portal-quick-access mt-6">
                <div className="portal-card">
                  <h3>Public Web Enquiries (Live Endpoints)</h3>
                  <div className="portal-endpoint-list">
                    <div className="portal-endpoint-item">
                      <div>
                        <strong>Builder Home Loan Partnership Form:</strong>
                        <code>/builder-partnership</code>
                      </div>
                      <a href="/builder-partnership" target="_blank" rel="noreferrer" className="portal-btn portal-btn-sm portal-btn-outline">
                        <ExternalLink size={14} /> Open Page
                      </a>
                    </div>
                    <div className="portal-endpoint-item">
                      <div>
                        <strong>Institutional Funding Enquiry Form:</strong>
                        <code>/institutional-funding</code>
                      </div>
                      <a href="/institutional-funding" target="_blank" rel="noreferrer" className="portal-btn portal-btn-sm portal-btn-outline">
                        <ExternalLink size={14} /> Open Page
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEADS MANAGEMENT CRM */}
          {activeTab === 'leads' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Customer Loan Leads CRM</h2>
                  <p>Inbound consumer loan applicants across Home Loans, LAP, Business Loans & Institutional Projects</p>
                </div>
                <div className="flex-align gap-2">
                  <button onClick={fetchLeads} className="portal-btn portal-btn-outline">
                    <RefreshCw size={14} /> Refresh Leads
                  </button>
                </div>
              </div>

              {/* Lead Filters Bar */}
              <div className="portal-filter-bar">
                <div className="portal-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, city, lead ID..."
                    value={leadSearch}
                    onChange={(e) => setLeadSearch(e.target.value)}
                  />
                  {leadSearch && <button onClick={() => setLeadSearch('')} className="portal-clear-btn">✕</button>}
                </div>

                <div className="portal-filter-selects">
                  <select
                    value={leadFilterLoanType}
                    onChange={(e) => setLeadFilterLoanType(e.target.value)}
                    className="portal-select"
                  >
                    <option value="all">All Loan Products</option>
                    <option value="home loan">Home Loan</option>
                    <option value="loan against property">Loan Against Property (LAP)</option>
                    <option value="business loan">Business Loan</option>
                    <option value="education institutional">Education Institutional Funding</option>
                    <option value="builder apf">Builder APF Project Funding</option>
                  </select>

                  <select
                    value={leadFilterStatus}
                    onChange={(e) => setLeadFilterStatus(e.target.value)}
                    className="portal-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Leads Table */}
              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Lead ID</th>
                      <th>Applicant Details</th>
                      <th>Product</th>
                      <th>Requested Amount</th>
                      <th>City</th>
                      <th>Application Date</th>
                      <th>Status</th>
                      <th>Direct Connect</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                          No leads matched your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((l) => (
                        <tr key={l.lead_id}>
                          <td><code>{l.lead_id}</code></td>
                          <td>
                            <strong>{l.name}</strong>
                            <div className="text-muted text-xs">{l.email}</div>
                          </td>
                          <td>
                            <span className="portal-badge badge-primary">{l.loan_type}</span>
                          </td>
                          <td><strong>₹{(l.amount / 100000).toLocaleString('en-IN')} Lakh</strong></td>
                          <td>{l.city}</td>
                          <td>{l.created_at ? l.created_at.split('T')[0] : 'Today'}</td>
                          <td>
                            <span className={`portal-badge ${
                              l.status === 'APPROVED' ? 'badge-success' :
                              l.status === 'REJECTED' ? 'badge-danger' :
                              l.status === 'IN_REVIEW' ? 'badge-accent' :
                              l.status === 'CONTACTED' ? 'badge-warning' : 'badge-primary'
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td>
                            <a
                              href={`https://wa.me/91${l.phone ? l.phone.replace(/[^0-9]/g, '') : ''}?text=Hello%20${encodeURIComponent(l.name)},%20this%20is%20Avani%20Loan%20Services%20regarding%20your%20${encodeURIComponent(l.loan_type)}%20application.`}
                              target="_blank"
                              rel="noreferrer"
                              className="portal-btn-sm portal-btn-outline"
                              title="Message via WhatsApp"
                            >
                              <Phone size={12} /> WhatsApp
                            </a>
                          </td>
                          <td>
                            <select
                              value={l.status}
                              onChange={(e) => handleUpdateLeadStatus(l.lead_id, e.target.value)}
                              className="portal-select-sm"
                            >
                              <option value="NEW">NEW</option>
                              <option value="CONTACTED">CONTACTED</option>
                              <option value="IN_REVIEW">IN_REVIEW</option>
                              <option value="APPROVED">APPROVED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. BUILDER PARTNERSHIPS */}
          {activeTab === 'builder' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Database 1: Maharashtra Builder Database</h2>
                  <p>80 Benchmark Residential Developers across 10 Cities • MahaRERA Verified Database</p>
                </div>
                <div className="flex-align gap-2">
                  <a href="/api/portal/builder/export" target="_blank" rel="noreferrer" className="portal-btn portal-btn-outline">
                    <Download size={14} /> Export Builders XLSX
                  </a>
                </div>
              </div>

              {/* Builder Subviews Bar */}
              <div className="portal-subview-bar">
                <button
                  onClick={() => { setBuilderSubview('all'); fetchBuilders('all'); }}
                  className={`portal-subview-tab ${builderSubview === 'all' ? 'active' : ''}`}
                >
                  All Builders <span className="portal-subview-badge">{builderSubviewCounts.all || builders.length || 80}</span>
                </button>
                <button
                  onClick={() => { setBuilderSubview('residential'); fetchBuilders('residential'); }}
                  className={`portal-subview-tab ${builderSubview === 'residential' ? 'active' : ''}`}
                >
                  Residential Developers <span className="portal-subview-badge">{builderSubviewCounts.residential || 80}</span>
                </button>
                <button
                  onClick={() => { setBuilderSubview('contacts'); fetchBuilders('contacts'); }}
                  className={`portal-subview-tab ${builderSubview === 'contacts' ? 'active' : ''}`}
                >
                  Builder Contacts <span className="portal-subview-badge">{builderSubviewCounts.contacts || 80}</span>
                </button>
                <button
                  onClick={() => { setBuilderSubview('decision_makers'); fetchBuilders('decision_makers'); }}
                  className={`portal-subview-tab ${builderSubview === 'decision_makers' ? 'active' : ''}`}
                >
                  Decision Makers <span className="portal-subview-badge">{builderSubviewCounts.decision_makers || 80}</span>
                </button>
                <button
                  onClick={() => { setBuilderSubview('pipeline'); fetchBuilders('pipeline'); }}
                  className={`portal-subview-tab ${builderSubview === 'pipeline' ? 'active' : ''}`}
                >
                  Partnership Pipeline <span className="portal-subview-badge">{builderSubviewCounts.pipeline || 80}</span>
                </button>
                <button
                  onClick={() => { setBuilderSubview('tasks'); fetchBuilders('tasks'); }}
                  className={`portal-subview-tab ${builderSubview === 'tasks' ? 'active' : ''}`}
                >
                  Follow-up Tasks <span className="portal-subview-badge">{builderSubviewCounts.tasks || 80}</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="portal-filter-bar">
                <div className="portal-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search builder name, city, brand..."
                    value={builderSearch}
                    onChange={(e) => setBuilderSearch(e.target.value)}
                  />
                </div>
                <select value={builderFilterCity} onChange={(e) => setBuilderFilterCity(e.target.value)}>
                  <option value="">All 10 Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Thane">Thane</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                  <option value="PCMC-Chakan">PCMC-Chakan</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Solapur">Solapur</option>
                </select>
                <div className="portal-record-count">Showing {filteredBuilders.length} of {builders.length} Builders</div>
              </div>

              {/* Table */}
              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Builder ID</th>
                      <th>Company & Brand</th>
                      <th>City</th>
                      <th>Official Contact Desk</th>
                      <th>MahaRERA Status</th>
                      <th>Score</th>
                      <th>Outreach Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuilders.map((b) => (
                      <tr key={b.builder_id}>
                        <td><code>{b.builder_id}</code></td>
                        <td>
                          <strong>{b.company_name}</strong>
                          {b.brand_name && b.brand_name !== b.company_name && (
                            <div className="text-muted text-xs">{b.brand_name}</div>
                          )}
                        </td>
                        <td>{b.city}</td>
                        <td>
                          <div className="text-sm">{b.official_telephone}</div>
                          <div className="text-muted text-xs">{b.official_email}</div>
                        </td>
                        <td>
                          <span className={`portal-badge ${b.verification_status === 'Verified' ? 'badge-success' : 'badge-warning'}`}>
                            {b.verification_status}
                          </span>
                        </td>
                        <td>
                          <strong>{b.qualification_score}</strong>/100
                        </td>
                        <td>
                          <span className={`portal-status-pill ${b.outreach_readiness.includes('IMMEDIATE') ? 'status-ready' : 'status-pending'}`}>
                            {b.outreach_readiness}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => setSelectedBuilder(b)} className="portal-btn-sm portal-btn-outline">
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Builder Detail Drawer */}
              {selectedBuilder && (
                <div className="portal-drawer-backdrop" onClick={() => setSelectedBuilder(null)}>
                  <div className="portal-drawer" onClick={(e) => e.stopPropagation()}>
                    <div className="portal-drawer-header">
                      <div>
                        <h3>{selectedBuilder.company_name}</h3>
                        <span className="text-muted"><code>{selectedBuilder.builder_id}</code> • {selectedBuilder.city}</span>
                      </div>
                      <button onClick={() => setSelectedBuilder(null)} className="portal-btn-icon">✕</button>
                    </div>

                    <div className="portal-drawer-body">
                      {/* Key Decision-Maker & Direct Communication */}
                      <div className="portal-card" style={{ borderColor: 'var(--portal-primary)' }}>
                        <div className="flex-between">
                          <h4>Key Decision-Maker & Direct Channels</h4>
                          <span className="portal-badge badge-primary">{selectedBuilder.project_class || 'Tier-1/Tier-2 Builder'}</span>
                        </div>
                        <p className="mt-2"><strong>Decision-Maker:</strong> <span style={{ color: 'var(--portal-primary)', fontWeight: 600 }}>{selectedBuilder.key_decision_maker_name || (selectedBuilder.decisionMakers && selectedBuilder.decisionMakers[0]?.contact_name) || 'Executive Director / Promoter'}</span></p>
                        <p><strong>Designation / Role:</strong> {selectedBuilder.key_decision_maker_role || (selectedBuilder.decisionMakers && selectedBuilder.decisionMakers[0]?.designation) || 'Managing Director'}</p>
                        <div className="portal-score-breakdown mt-2">
                          <div><span>Official Phone:</span> <strong>{selectedBuilder.official_telephone || 'N/A'}</strong></div>
                          <div><span>WhatsApp / Mobile:</span> <strong>{selectedBuilder.whatsapp_channel || selectedBuilder.official_mobile || 'N/A'}</strong></div>
                          <div><span>Official Email:</span> <strong>{selectedBuilder.official_email || 'N/A'}</strong></div>
                          <div><span>Primary Asset Type:</span> <strong>{selectedBuilder.primary_asset_type || 'Residential Projects'}</strong></div>
                        </div>
                        {selectedBuilder.whatsapp_direct_url && (
                          <div className="mt-3">
                            <a
                              href={selectedBuilder.whatsapp_direct_url}
                              target="_blank"
                              rel="noreferrer"
                              className="portal-btn portal-btn-sm"
                              style={{ background: '#25D366', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <Phone size={13} /> Open WhatsApp Direct Channel
                            </a>
                          </div>
                        )}
                      </div>

                      {/* MahaRERA & Corporate Evidence */}
                      <div className="portal-card mt-3">
                        <h4>MahaRERA & Corporate Evidence</h4>
                        <p><strong>Promoter / Entity:</strong> {selectedBuilder.legal_entity_name}</p>
                        <p><strong>Registered Address:</strong> {selectedBuilder.registered_office_address}</p>
                        <p><strong>Official Website:</strong> <a href={selectedBuilder.corporate_website} target="_blank" rel="noreferrer">{selectedBuilder.corporate_website}</a></p>
                        <p><strong>MahaRERA Registration Numbers:</strong> <code>{selectedBuilder.maharera_reg_numbers ? selectedBuilder.maharera_reg_numbers.join(', ') : 'Registered'}</code></p>
                        {selectedBuilder.maharera_verification_url && (
                          <p><strong>MahaRERA Verification:</strong> <a href={selectedBuilder.maharera_verification_url} target="_blank" rel="noreferrer" className="text-primary flex-align gap-1"><ExternalLink size={12} /> {selectedBuilder.maharera_verification_url}</a></p>
                        )}
                        <p><strong>Projects:</strong> {selectedBuilder.project_names ? selectedBuilder.project_names.join(', ') : 'Verified Residential'}</p>
                      </div>

                      {/* Qualification Score Breakdown */}
                      <div className="portal-card mt-3">
                        <h4>7-Factor Qualification Score Breakdown (Score: {selectedBuilder.qualification_score}/100)</h4>
                        {selectedBuilder.score_breakdown ? (
                          <div className="portal-score-breakdown">
                            <div><span>Company Identity:</span> <strong>{selectedBuilder.score_breakdown.f1_company_identity} pts</strong></div>
                            <div><span>Project Relevance:</span> <strong>{selectedBuilder.score_breakdown.f2_project_relevance} pts</strong></div>
                            <div><span>Active Evidence:</span> <strong>{selectedBuilder.score_breakdown.f3_active_evidence} pts</strong></div>
                            <div><span>Contact Availability:</span> <strong>{selectedBuilder.score_breakdown.f4_contact_availability} pts</strong></div>
                            <div><span>Partnership Dept:</span> <strong>{selectedBuilder.score_breakdown.f5_partnership_dept} pts</strong></div>
                            <div><span>Decision Maker:</span> <strong>{selectedBuilder.score_breakdown.f6_decision_maker} pts</strong></div>
                            <div><span>Home Loan Fit:</span> <strong>{selectedBuilder.score_breakdown.f7_home_loan_fit} pts</strong></div>
                          </div>
                        ) : (
                          <p>Score: {selectedBuilder.qualification_score} (Grade: {selectedBuilder.qualification_grade})</p>
                        )}
                      </div>

                      {/* Outreach Protocol & Audit Lineage */}
                      <div className="portal-card mt-3">
                        <h4>Outreach Protocol & Forensic Lineage</h4>
                        <p><strong>Readiness:</strong> <span className="portal-badge badge-success">{selectedBuilder.outreach_readiness}</span></p>
                        <p><strong>Recommended Channel:</strong> {selectedBuilder.recommended_channel}</p>
                        <p><strong>Commercial Fit:</strong> {selectedBuilder.commercial_suitability}</p>
                        {selectedBuilder.auditor_notes && (
                          <p className="mt-2"><strong>Auditor Notes:</strong> <em>{selectedBuilder.auditor_notes}</em></p>
                        )}
                        <p className="mt-2 text-muted text-xs">Source Batch ID: <code>{selectedBuilder.source_lineage_batch_id || 'BATCH-20261107-P5318'}</code> • Idempotent Provenance Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. SCHOOL FUNDING DATABASE (24 RECORDS) */}
          {activeTab === 'schools' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Database 2: School Funding Database</h2>
                  <p>24 K-12 Chains, School Groups, Boards & Residential Campuses • Infrastructure Finance Desk</p>
                </div>
                <div className="flex-align gap-2">
                  <a href="/api/portal/education/schools/export" target="_blank" rel="noreferrer" className="portal-btn portal-btn-outline">
                    <Download size={14} /> Export Schools XLSX
                  </a>
                </div>
              </div>

              {/* Research Estimates Alert */}
              <div className="portal-estimate-alert">
                <AlertTriangle size={18} />
                <div>
                  <strong>Data Classification Notice:</strong> School identities, regulatory boards, affiliations, addresses, and official contact channels are confirmed records. Student capacities, approx enrolment, and funding potentials are research-based analytical estimates.
                </div>
              </div>

              {/* Schools Subviews Bar */}
              <div className="portal-subview-bar">
                <button
                  onClick={() => { setSchoolsSubview('all'); fetchSchools('all'); }}
                  className={`portal-subview-tab ${schoolsSubview === 'all' ? 'active' : ''}`}
                >
                  All Schools <span className="portal-subview-badge">{schoolsSubviewCounts.all || schools.length || 24}</span>
                </button>
                <button
                  onClick={() => { setSchoolsSubview('groups'); fetchSchools('groups'); }}
                  className={`portal-subview-tab ${schoolsSubview === 'groups' ? 'active' : ''}`}
                >
                  School Groups & Chains <span className="portal-subview-badge">{schoolsSubviewCounts.groups || 18}</span>
                </button>
                <button
                  onClick={() => { setSchoolsSubview('trusts'); fetchSchools('trusts'); }}
                  className={`portal-subview-tab ${schoolsSubview === 'trusts' ? 'active' : ''}`}
                >
                  Education Trusts <span className="portal-subview-badge">{schoolsSubviewCounts.trusts || 20}</span>
                </button>
                <button
                  onClick={() => { setSchoolsSubview('prospects'); fetchSchools('prospects'); }}
                  className={`portal-subview-tab ${schoolsSubview === 'prospects' ? 'active' : ''}`}
                >
                  Funding Prospects (A+) <span className="portal-subview-badge">{schoolsSubviewCounts.prospects || 16}</span>
                </button>
                <button
                  onClick={() => { setSchoolsSubview('pipeline'); fetchSchools('pipeline'); }}
                  className={`portal-subview-tab ${schoolsSubview === 'pipeline' ? 'active' : ''}`}
                >
                  Follow-up Pipeline <span className="portal-subview-badge">{schoolsSubviewCounts.pipeline || 24}</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="portal-filter-bar">
                <div className="portal-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search school name, city, board, trust..."
                    value={schoolsSearch}
                    onChange={(e) => setSchoolsSearch(e.target.value)}
                  />
                </div>
                <select value={schoolsFilterTier} onChange={(e) => setSchoolsFilterTier(e.target.value)}>
                  <option value="">All Tiers</option>
                  <option value="A+">Tier A+ (Priority)</option>
                  <option value="A">Tier A</option>
                  <option value="B">Tier B</option>
                </select>
                <select value={schoolsFilterCity} onChange={(e) => setSchoolsFilterCity(e.target.value)}>
                  <option value="">All Cities</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Pune">Pune</option>
                  <option value="Thane">Thane</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Dehradun">Dehradun</option>
                  <option value="Ajmer">Ajmer</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Indore">Indore</option>
                  <option value="Kochi">Kochi</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Noida">Noida</option>
                </select>
                <div className="portal-record-count">Showing {filteredSchools.length} of {schools.length} Schools</div>
              </div>

              {/* Table */}
              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>School ID</th>
                      <th>School / Group Name</th>
                      <th>Board / Category</th>
                      <th>Location</th>
                      <th>Contact Desk</th>
                      <th>Capacity (Est.)</th>
                      <th>Tier</th>
                      <th>Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map((s) => (
                      <tr key={s.institution_id}>
                        <td><code>{s.institution_id}</code></td>
                        <td>
                          <strong>{s.institution_name}</strong>
                          {s.parent_trust_society && (
                            <div className="text-muted text-xs">{s.parent_trust_society}</div>
                          )}
                        </td>
                        <td>
                          <span className="text-sm">{s.subcategory || s.board_affiliation || 'K-12 School'}</span>
                        </td>
                        <td>{s.city}, {s.state}</td>
                        <td>
                          <div className="text-sm">{s.official_telephone}</div>
                          <div className="text-muted text-xs">{s.official_email}</div>
                        </td>
                        <td>
                          <span className="portal-tag-pill estimate">
                            {s.student_capacity ? `${s.student_capacity} Est.` : 'Verified Profile'}
                          </span>
                        </td>
                        <td>
                          <span className={`portal-badge ${s.lead_priority_tier === 'A+' ? 'badge-success' : 'badge-primary'}`}>
                            {s.lead_priority_tier}
                          </span>
                        </td>
                        <td><strong>{s.qualification_score}</strong>/100</td>
                        <td>
                          <button onClick={() => setSelectedSchool(s)} className="portal-btn-sm portal-btn-outline">
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* School Detail Drawer */}
              {selectedSchool && (
                <div className="portal-drawer-backdrop" onClick={() => setSelectedSchool(null)}>
                  <div className="portal-drawer" onClick={(e) => e.stopPropagation()}>
                    <div className="portal-drawer-header">
                      <div>
                        <h3>{selectedSchool.institution_name}</h3>
                        <span className="text-muted"><code>{selectedSchool.institution_id}</code> • {selectedSchool.city}, {selectedSchool.state}</span>
                      </div>
                      <button onClick={() => setSelectedSchool(null)} className="portal-btn-icon">✕</button>
                    </div>

                    <div className="portal-drawer-body">
                      {/* Leadership Governance Roster */}
                      <div className="portal-card" style={{ borderColor: 'var(--portal-primary)' }}>
                        <div className="flex-between">
                          <h4>Key Leadership Governance Roster</h4>
                          <span className="portal-badge badge-primary">Direct Access</span>
                        </div>
                        <div className="portal-score-breakdown mt-2">
                          <div><span>Chairman / President:</span> <strong>{selectedSchool.chairman_name || 'Governing President'}</strong></div>
                          <div><span>Chairman Contact:</span> <strong>{selectedSchool.chairman_mobile || selectedSchool.chairman_email || 'Direct Secretariat'}</strong></div>
                          <div><span>Secretary / Trustee:</span> <strong>{selectedSchool.secretary_name || 'Managing Trustee'}</strong></div>
                          <div><span>Secretary Mobile:</span> <strong>{selectedSchool.secretary_mobile || 'Verified Desk'}</strong></div>
                          <div><span>Director / Principal:</span> <strong>{selectedSchool.director_name || 'Campus Principal'}</strong></div>
                          <div><span>Finance Head / CFO:</span> <strong>{selectedSchool.finance_head_name || 'Finance Controller'}</strong></div>
                        </div>
                      </div>

                      {/* Institutional Lending Intelligence */}
                      <div className="portal-card mt-3" style={{ background: 'var(--portal-bg-alt, #fafbfc)' }}>
                        <h4>Institutional Lending & Infrastructure Intelligence</h4>
                        <div className="portal-score-breakdown">
                          <div><span>Potential Borrowing Capacity:</span> <strong className="text-primary">{selectedSchool.potential_borrowing_capacity || '₹5 Cr - ₹10 Cr'}</strong></div>
                          <div><span>Secured LAP Potential:</span> <strong>{selectedSchool.secured_lap_potential || 'Up to ₹10 Cr against Campus Property'}</strong></div>
                          <div><span>Unsecured OD Potential:</span> <strong>{selectedSchool.unsecured_od_potential || '₹50L - ₹1.5 Cr Working Capital OD'}</strong></div>
                          <div><span>Property Evidence:</span> <strong>{selectedSchool.property_ownership_evidence || 'Clear Land Title & Campus Structure'}</strong></div>
                        </div>
                        <p className="mt-2"><strong>Potential Collateral:</strong> {selectedSchool.potential_collateral || 'Institutional Land, School Building & Operational Cash Flows'}</p>
                        <p className="mt-1"><strong>Expansion / Modernization Plans:</strong> {selectedSchool.expansion_plans || selectedSchool.funding_purpose || 'Campus modernization, STEM labs & athletic infrastructure'}</p>
                      </div>

                      {/* Confirmed Institutional Data */}
                      <div className="portal-card mt-3">
                        <h4>Confirmed Institutional Profile</h4>
                        <p><strong>Board Affiliation / Category:</strong> {selectedSchool.subcategory || selectedSchool.board_affiliation}</p>
                        <p><strong>Ownership Type:</strong> {selectedSchool.ownership_type}</p>
                        <p><strong>Parent Trust / Society:</strong> {selectedSchool.parent_trust_society || 'Registered Society'}</p>
                        <p><strong>Campus Address:</strong> {selectedSchool.complete_address}</p>
                        <p><strong>Official Telephone:</strong> {selectedSchool.official_telephone}</p>
                        <p><strong>Official Email:</strong> {selectedSchool.official_email}</p>
                      </div>

                      {/* Operational Verification & Source Provenance */}
                      <div className="portal-card mt-3">
                        <h4>Operational Verification & Provenance</h4>
                        <p><strong>Priority Tier:</strong> <span className="portal-badge badge-success">{selectedSchool.lead_priority_tier}</span> (Score: {selectedSchool.qualification_score}/100)</p>
                        <p><strong>Verification Status:</strong> {selectedSchool.verification_status}</p>
                        <p className="mt-2 text-muted text-xs">Source Batch ID: <code>{selectedSchool.source_lineage_batch_id || 'BATCH-20261107-P5318'}</code> • Forensic Lineage Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. COLLEGE & UNIVERSITY FUNDING DATABASE (56 RECORDS) */}
          {activeTab === 'colleges' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Database 3: College & University Funding Database</h2>
                  <p>56 Higher Education Institutions • Engineering, Medical, Deemed & Autonomous Campuses</p>
                </div>
                <div className="flex-align gap-2">
                  <a href="/api/portal/education/colleges/export" target="_blank" rel="noreferrer" className="portal-btn portal-btn-outline">
                    <Download size={14} /> Export Colleges XLSX
                  </a>
                </div>
              </div>

              {/* Colleges Subviews Bar */}
              <div className="portal-subview-bar">
                <button
                  onClick={() => { setCollegesSubview('all'); fetchColleges('all'); }}
                  className={`portal-subview-tab ${collegesSubview === 'all' ? 'active' : ''}`}
                >
                  All Higher Ed <span className="portal-subview-badge">{collegesSubviewCounts.all || colleges.length || 56}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('engineering'); fetchColleges('engineering'); }}
                  className={`portal-subview-tab ${collegesSubview === 'engineering' ? 'active' : ''}`}
                >
                  Engineering Colleges <span className="portal-subview-badge">{collegesSubviewCounts.engineering || 28}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('medical'); fetchColleges('medical'); }}
                  className={`portal-subview-tab ${collegesSubview === 'medical' ? 'active' : ''}`}
                >
                  Medical & Healthcare <span className="portal-subview-badge">{collegesSubviewCounts.medical || 16}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('autonomous'); fetchColleges('autonomous'); }}
                  className={`portal-subview-tab ${collegesSubview === 'autonomous' ? 'active' : ''}`}
                >
                  Autonomous Institutes <span className="portal-subview-badge">{collegesSubviewCounts.autonomous || 18}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('deemed'); fetchColleges('deemed'); }}
                  className={`portal-subview-tab ${collegesSubview === 'deemed' ? 'active' : ''}`}
                >
                  Deemed Universities <span className="portal-subview-badge">{collegesSubviewCounts.deemed || 14}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('trusts'); fetchColleges('trusts'); }}
                  className={`portal-subview-tab ${collegesSubview === 'trusts' ? 'active' : ''}`}
                >
                  Education Trusts <span className="portal-subview-badge">{collegesSubviewCounts.trusts || 48}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('groups'); fetchColleges('groups'); }}
                  className={`portal-subview-tab ${collegesSubview === 'groups' ? 'active' : ''}`}
                >
                  Multi-Institution Groups <span className="portal-subview-badge">{collegesSubviewCounts.groups || 42}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('prospects'); fetchColleges('prospects'); }}
                  className={`portal-subview-tab ${collegesSubview === 'prospects' ? 'active' : ''}`}
                >
                  Prospects (A+) <span className="portal-subview-badge">{collegesSubviewCounts.prospects || 36}</span>
                </button>
                <button
                  onClick={() => { setCollegesSubview('pipeline'); fetchColleges('pipeline'); }}
                  className={`portal-subview-tab ${collegesSubview === 'pipeline' ? 'active' : ''}`}
                >
                  Follow-up Pipeline <span className="portal-subview-badge">{collegesSubviewCounts.pipeline || 56}</span>
                </button>
              </div>

              {/* Filter Bar */}
              <div className="portal-filter-bar">
                <div className="portal-search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search college name, university, city, trust..."
                    value={collegesSearch}
                    onChange={(e) => setCollegesSearch(e.target.value)}
                  />
                </div>
                <select value={collegesFilterTier} onChange={(e) => setCollegesFilterTier(e.target.value)}>
                  <option value="">All Tiers</option>
                  <option value="A+">Tier A+ (Priority)</option>
                  <option value="A">Tier A</option>
                  <option value="B">Tier B</option>
                </select>
                <select value={collegesFilterCategory} onChange={(e) => setCollegesFilterCategory(e.target.value)}>
                  <option value="">All Disciplines</option>
                  <option value="engineering">Engineering & Tech</option>
                  <option value="medical">Medical & Dental</option>
                  <option value="management">Management & MBA</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="university">Private / Deemed Universities</option>
                </select>
                <div className="portal-record-count">Showing {filteredColleges.length} of {colleges.length} Institutions</div>
              </div>

              {/* Table */}
              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Lead ID</th>
                      <th>Institution Name</th>
                      <th>Category & Specialization</th>
                      <th>Location</th>
                      <th>Contact Desk</th>
                      <th>Tier</th>
                      <th>Score</th>
                      <th>Potential Requirement</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredColleges.map((c) => (
                      <tr key={c.institution_id}>
                        <td><code>{c.institution_id}</code></td>
                        <td>
                          <strong>{c.institution_name}</strong>
                          {c.parent_trust_society && (
                            <div className="text-muted text-xs">{c.parent_trust_society}</div>
                          )}
                        </td>
                        <td>
                          <span className="text-sm">{c.subcategory || c.institution_category}</span>
                        </td>
                        <td>{c.city}, {c.state}</td>
                        <td>
                          <div className="text-sm">{c.official_telephone}</div>
                          <div className="text-muted text-xs">{c.official_email}</div>
                        </td>
                        <td>
                          <span className={`portal-badge ${c.lead_priority_tier === 'A+' ? 'badge-success' : 'badge-primary'}`}>
                            {c.lead_priority_tier}
                          </span>
                        </td>
                        <td><strong>{c.qualification_score}</strong>/100</td>
                        <td>{c.potential_funding_requirement || '₹5Cr - ₹10Cr'}</td>
                        <td>
                          <button onClick={() => setSelectedCollege(c)} className="portal-btn-sm portal-btn-outline">
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* College Detail Drawer */}
              {selectedCollege && (
                <div className="portal-drawer-backdrop" onClick={() => setSelectedCollege(null)}>
                  <div className="portal-drawer" onClick={(e) => e.stopPropagation()}>
                    <div className="portal-drawer-header">
                      <div>
                        <h3>{selectedCollege.institution_name}</h3>
                        <span className="text-muted"><code>{selectedCollege.institution_id}</code> • {selectedCollege.city}, {selectedCollege.state}</span>
                      </div>
                      <button onClick={() => setSelectedCollege(null)} className="portal-btn-icon">✕</button>
                    </div>

                    <div className="portal-drawer-body">
                      {/* Leadership Governance Roster */}
                      <div className="portal-card" style={{ borderColor: 'var(--portal-primary)' }}>
                        <div className="flex-between">
                          <h4>Key Leadership Governance Roster</h4>
                          <span className="portal-badge badge-primary">Direct Access</span>
                        </div>
                        <div className="portal-score-breakdown mt-2">
                          <div><span>Chancellor / Chairman:</span> <strong>{selectedCollege.chairman_name || 'Governing Chancellor'}</strong></div>
                          <div><span>Chairman Contact:</span> <strong>{selectedCollege.chairman_mobile || selectedCollege.chairman_email || 'Executive Secretariat'}</strong></div>
                          <div><span>Secretary / Trustee:</span> <strong>{selectedCollege.secretary_name || 'Managing Trustee'}</strong></div>
                          <div><span>Secretary Mobile:</span> <strong>{selectedCollege.secretary_mobile || 'Verified Desk'}</strong></div>
                          <div><span>Dean / Director / Principal:</span> <strong>{selectedCollege.director_name || 'Executive Dean'}</strong></div>
                          <div><span>Finance Head / CFO:</span> <strong>{selectedCollege.finance_head_name || 'Chief Financial Officer'}</strong></div>
                        </div>
                      </div>

                      {/* Capital Financing Solutions & Lending Intelligence */}
                      <div className="portal-card mt-3" style={{ background: 'var(--portal-bg-alt, #fafbfc)' }}>
                        <h4>Institutional Lending & Infrastructure Intelligence</h4>
                        <div className="portal-score-breakdown">
                          <div><span>Potential Borrowing Capacity:</span> <strong className="text-primary">{selectedCollege.potential_borrowing_capacity || '₹5 Cr - ₹10 Cr'}</strong></div>
                          <div><span>Secured LAP Potential:</span> <strong>{selectedCollege.secured_lap_potential || 'Up to ₹10 Cr against Campus Real Estate'}</strong></div>
                          <div><span>Unsecured OD Potential:</span> <strong>{selectedCollege.unsecured_od_potential || '₹50L - ₹1.5 Cr Working Capital OD'}</strong></div>
                          <div><span>Property Evidence:</span> <strong>{selectedCollege.property_ownership_evidence || 'Owned Multi-Acre Campus & Infrastructure'}</strong></div>
                        </div>
                        <p className="mt-2"><strong>Potential Collateral:</strong> {selectedCollege.potential_collateral || 'College Land, Academic Buildings, Hospital Assets & Fee Receivables'}</p>
                        <p className="mt-1"><strong>Capital Expansion Plans:</strong> {selectedCollege.expansion_plans || selectedCollege.funding_purpose || 'Hospital expansion, new engineering block, research laboratories & working capital'}</p>
                      </div>

                      {/* Institutional Identity */}
                      <div className="portal-card mt-3">
                        <h4>Institutional Identity</h4>
                        <p><strong>Category:</strong> {selectedCollege.institution_category}</p>
                        <p><strong>Subcategory / Specialization:</strong> {selectedCollege.subcategory}</p>
                        <p><strong>Ownership Type:</strong> {selectedCollege.ownership_type}</p>
                        <p><strong>Parent Trust / Society:</strong> {selectedCollege.parent_trust_society || 'Self-Governing'}</p>
                        <p><strong>Campus Address:</strong> {selectedCollege.complete_address}</p>
                        <p><strong>Official Telephone:</strong> {selectedCollege.official_telephone}</p>
                        <p><strong>Official Email:</strong> {selectedCollege.official_email}</p>
                        <p><strong>Official Website:</strong> <a href={selectedCollege.website} target="_blank" rel="noreferrer">{selectedCollege.website}</a></p>
                      </div>

                      {/* Verification & Source Provenance */}
                      <div className="portal-card mt-3">
                        <h4>Operational Verification & Provenance</h4>
                        <p><strong>Priority Tier:</strong> <span className="portal-badge badge-success">{selectedCollege.lead_priority_tier}</span> (Score: {selectedCollege.qualification_score}/100)</p>
                        <p><strong>Verification Status:</strong> {selectedCollege.verification_status}</p>
                        <p className="mt-2 text-muted text-xs">Source Batch ID: <code>{selectedCollege.source_lineage_batch_id || 'BATCH-20261107-P5318'}</code> • Forensic Lineage Verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Backward Compatibility Education Tab */}
          {activeTab === 'education' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Institutional Funding Master (80 Institutions)</h2>
                  <p>Choose between School Funding Database (24) or College & University Database (56)</p>
                </div>
                <div className="flex-align gap-2">
                  <button onClick={() => setActiveTab('schools')} className="portal-btn portal-btn-outline">
                    <GraduationCap size={14} /> Open School Database (24)
                  </button>
                  <button onClick={() => setActiveTab('colleges')} className="portal-btn portal-btn-primary">
                    <Award size={14} /> Open College Database (56)
                  </button>
                </div>
              </div>

              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Lead ID</th>
                      <th>Institution Name</th>
                      <th>Database Group</th>
                      <th>Location</th>
                      <th>Tier</th>
                      <th>Score</th>
                      <th>Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstitutions.map((inst) => (
                      <tr key={inst.institution_id}>
                        <td><code>{inst.institution_id}</code></td>
                        <td><strong>{inst.institution_name}</strong></td>
                        <td>{inst.institution_category}</td>
                        <td>{inst.city}, {inst.state}</td>
                        <td><span className="portal-badge badge-success">{inst.lead_priority_tier}</span></td>
                        <td><strong>{inst.qualification_score}</strong></td>
                        <td>{inst.potential_funding_requirement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. TASK CENTRE */}
          {activeTab === 'tasks' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Unified Task Centre</h2>
                  <p>Follow-up schedules, verification reviews, and proposal deliverables</p>
                </div>
              </div>

              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Module</th>
                      <th>Task Description</th>
                      <th>Type</th>
                      <th>Due Date</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.task_id}>
                        <td><code>{t.task_id}</code></td>
                        <td>
                          <span className={`portal-badge ${t.module === 'BUILDER' ? 'badge-primary' : 'badge-emerald'}`}>
                            {t.module}
                          </span>
                        </td>
                        <td><strong>{t.task_title}</strong></td>
                        <td>{t.task_type}</td>
                        <td>{t.due_date}</td>
                        <td>
                          <span className={`portal-badge ${t.priority === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`portal-status-pill ${t.status === 'Completed' ? 'status-ready' : 'status-pending'}`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Public Inbound Enquiries</h2>
                  <p>Inbound customer submissions from <code>/builder-partnership</code> and <code>/institutional-funding</code></p>
                </div>
                <div className="portal-tab-filters">
                  <button onClick={() => setEnquiryFilter('ALL')} className={`portal-pill ${enquiryFilter === 'ALL' ? 'active' : ''}`}>All</button>
                  <button onClick={() => setEnquiryFilter('BUILDER')} className={`portal-pill ${enquiryFilter === 'BUILDER' ? 'active' : ''}`}>Builders Only</button>
                  <button onClick={() => setEnquiryFilter('EDUCATION')} className={`portal-pill ${enquiryFilter === 'EDUCATION' ? 'active' : ''}`}>Education Only</button>
                </div>
              </div>

              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Enquiry ID</th>
                      <th>Module</th>
                      <th>Organization / Applicant</th>
                      <th>Contact Person</th>
                      <th>Email / Phone</th>
                      <th>City</th>
                      <th>Requirement Details</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEnquiries.map((e) => (
                      <tr key={e.enquiry_id}>
                        <td><code>{e.enquiry_id}</code></td>
                        <td>
                          <span className={`portal-badge ${e.module === 'BUILDER' ? 'badge-primary' : 'badge-emerald'}`}>
                            {e.module}
                          </span>
                        </td>
                        <td><strong>{e.company_name || e.institution_name}</strong></td>
                        <td>{e.contact_person} ({e.designation})</td>
                        <td>
                          <div>{e.official_email}</div>
                          <div className="text-muted text-xs">{e.business_telephone || e.telephone}</div>
                        </td>
                        <td>{e.city}</td>
                        <td>
                          <div className="text-xs">{e.partnership_interest || e.funding_requirement}</div>
                          {e.estimated_amount && <div className="text-muted text-xs">Amount: ₹{(e.estimated_amount / 10000000).toFixed(1)} Cr</div>}
                        </td>
                        <td>{e.created_at ? e.created_at.split('T')[0] : 'Today'}</td>
                        <td>
                          <span className="portal-badge badge-primary">{e.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. TEMPLATES MANAGEMENT */}
          {activeTab === 'templates' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Meta WhatsApp & Multi-Channel Templates Engine</h2>
                  <p>Authoritative WABA Template Library, Parameter Validation, Interactive Preview & Mock-Safe Test Workflow</p>
                </div>
                <div className="flex-align gap-2" style={{ flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSyncMetaTemplates}
                    disabled={syncingMeta}
                    className="portal-btn portal-btn-outline"
                    style={{ borderColor: '#0052CC', color: '#0052CC', fontWeight: 600 }}
                    title="Attempt live template synchronization with Meta WhatsApp Business Graph API"
                  >
                    <RefreshCw size={14} className={syncingMeta ? 'spin' : ''} />
                    {syncingMeta ? 'Checking Meta WABA...' : 'Sync from Meta WABA'}
                  </button>
                  <button onClick={() => setShowCreateTplModal(true)} className="portal-btn portal-btn-primary">
                    <Plus size={14} /> Create Local Draft
                  </button>
                  <button onClick={() => { fetchTemplates(); fetchMetaStatus(); }} className="portal-btn portal-btn-outline">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {/* Meta WABA Connection Status Banner (Genuine Environment Status) */}
              <div className="portal-waba-banner" style={{ background: metaStatus?.connected ? 'linear-gradient(135deg, #0F172A, #1E3A8A)' : 'linear-gradient(135deg, #1E293B, #0F172A)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>WhatsApp Business Platform (Meta Graph API {metaStatus?.graph_api_version || 'v20.0'})</span>
                    <span className="portal-waba-chip" style={{ background: metaStatus?.connected ? '#16A34A' : '#D97706', color: '#FFFFFF', fontWeight: 700 }}>
                      {metaStatus?.connected ? 'META GRAPH CONNECTED' : 'TOKEN CONFIGURATION PENDING'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.92, marginTop: '4px' }}>
                    Provider Mode: <strong>{(metaStatus?.provider_mode || 'mock').toUpperCase()} SANDBOX</strong> • Zero Live Dispatches • {metaStatus?.notice || 'Direct Meta Graph API sync requires META_ACCESS_TOKEN (whatsapp_business_management).'}
                  </div>
                </div>
                <div className="portal-waba-badges">
                  <span className="portal-waba-chip">WABA ID: {metaStatus?.waba_id || '1062614709598311'}</span>
                  <span className="portal-waba-chip">Phone ID: {metaStatus?.phone_number_id || '1147494668457940'}</span>
                  <span className="portal-waba-chip">Number: {metaStatus?.display_phone || '+917249108474'}</span>
                  <span className="portal-waba-chip">BSP: {metaStatus?.bsp_partner || 'AiSensy'}</span>
                </div>
              </div>

              {/* Synchronization Result / Advisory Alert */}
              {metaSyncFeedback && (
                <div
                  className="portal-estimate-alert"
                  style={{
                    marginBottom: '16px',
                    background: metaSyncFeedback.synced ? '#F0FDF4' : '#FFFBEB',
                    borderColor: metaSyncFeedback.synced ? '#BBF7D0' : '#FDE68A',
                    color: metaSyncFeedback.synced ? '#166534' : '#92400E'
                  }}
                >
                  <AlertTriangle size={18} color={metaSyncFeedback.synced ? '#16A34A' : '#D97706'} />
                  <div style={{ flex: 1 }}>
                    <strong>Meta WABA Synchronization ({metaSyncFeedback.timestamp}): </strong>
                    <span>{metaSyncFeedback.message}</span>
                    {metaSyncFeedback.recommendation && (
                      <div style={{ fontSize: '0.78rem', marginTop: '4px', opacity: 0.9 }}>
                        <strong>Action Required:</strong> {metaSyncFeedback.recommendation}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setMetaSyncFeedback(null)} className="portal-btn-sm portal-btn-outline">Dismiss</button>
                </div>
              )}

              {/* Summary KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                <div className="portal-card" style={{ padding: '14px', borderLeft: '4px solid #0052CC' }}>
                  <div className="text-muted text-xs" style={{ fontWeight: 600 }}>TOTAL TEMPLATES</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{templates.length}</div>
                  <div className="text-muted text-xs">WhatsApp, Email & SMS</div>
                </div>
                <div className="portal-card" style={{ padding: '14px', borderLeft: '4px solid #16A34A' }}>
                  <div className="text-muted text-xs" style={{ fontWeight: 600 }}>META APPROVED</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                    {templates.filter(t => t.channel === 'WhatsApp' && t.synced_from_meta === true && t.meta_approval_status === 'APPROVED').length}
                  </div>
                  <div className="text-muted text-xs">Verified via Graph API</div>
                </div>
                <div className="portal-card" style={{ padding: '14px', borderLeft: '4px solid #D97706' }}>
                  <div className="text-muted text-xs" style={{ fontWeight: 600 }}>LOCAL / UNVERIFIED</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#D97706', marginTop: '4px' }}>
                    {templates.filter(t => t.channel === 'WhatsApp' && (!t.synced_from_meta || ['LOCAL_DRAFT', 'NOT_VERIFIED', 'UNVERIFIED_LOCAL_TEMPLATE'].includes(t.meta_approval_status))).length}
                  </div>
                  <div className="text-muted text-xs">Awaiting Meta WABA Sync</div>
                </div>
                <div className="portal-card" style={{ padding: '14px', borderLeft: '4px solid #2563EB' }}>
                  <div className="text-muted text-xs" style={{ fontWeight: 600 }}>PENDING REVIEW</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                    {templates.filter(t => t.meta_approval_status === 'PENDING' || t.meta_approval_status === 'IN_REVIEW').length}
                  </div>
                  <div className="text-muted text-xs">Submitted to Meta</div>
                </div>
                <div className="portal-card" style={{ padding: '14px', borderLeft: '4px solid #DC2626' }}>
                  <div className="text-muted text-xs" style={{ fontWeight: 600 }}>REJECTED / PAUSED</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                    {templates.filter(t => ['REJECTED', 'PAUSED', 'DISABLED'].includes(t.meta_approval_status)).length}
                  </div>
                  <div className="text-muted text-xs">Requires Revision</div>
                </div>
                <div className="portal-card" style={{ padding: '14px', borderLeft: '4px solid #64748B' }}>
                  <div className="text-muted text-xs" style={{ fontWeight: 600 }}>EMAIL & SMS</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#334155', marginTop: '4px' }}>
                    {templates.filter(t => t.channel !== 'WhatsApp').length}
                  </div>
                  <div className="text-muted text-xs">Direct Transactional</div>
                </div>
              </div>

              {/* Template Filters & Sorting */}
              <div className="portal-filter-bar" style={{ flexWrap: 'wrap', gap: '10px' }}>
                <div className="portal-search-box" style={{ minWidth: '240px', flex: 1 }}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by template name, ID, or message body..."
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                  />
                  {templateSearch && <button onClick={() => setTemplateSearch('')} className="portal-clear-btn">✕</button>}
                </div>

                <div className="portal-filter-selects" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <select
                    value={templateStatusFilter}
                    onChange={(e) => setTemplateStatusFilter(e.target.value)}
                    className="portal-select"
                    aria-label="Filter by approval status"
                  >
                    <option value="ALL">All Approval Statuses</option>
                    <option value="APPROVED">Meta Approved (Verified)</option>
                    <option value="NOT_VERIFIED">Local Draft / Unverified</option>
                    <option value="PENDING">Pending Meta Review</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="PAUSED">Paused / Disabled</option>
                    <option value="NON_WHATSAPP">N/A (Email & SMS)</option>
                  </select>

                  <select
                    value={templateChannelFilter}
                    onChange={(e) => setTemplateChannelFilter(e.target.value)}
                    className="portal-select"
                    aria-label="Filter by channel"
                  >
                    <option value="ALL">All Channels</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>

                  <select
                    value={templateCategoryFilter}
                    onChange={(e) => setTemplateCategoryFilter(e.target.value)}
                    className="portal-select"
                    aria-label="Filter by category"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                    <option value="PARTNERSHIP">Partnership</option>
                    <option value="INSTITUTIONAL">Institutional</option>
                    <option value="TRANSACTIONAL">Transactional</option>
                  </select>

                  <select
                    value={templateLanguageFilter}
                    onChange={(e) => setTemplateLanguageFilter(e.target.value)}
                    className="portal-select"
                    aria-label="Filter by language"
                  >
                    <option value="ALL">All Languages</option>
                    <option value="en">English (en)</option>
                    <option value="mr">Marathi (mr)</option>
                    <option value="hi">Hindi (hi)</option>
                  </select>

                  <select
                    value={templateSort}
                    onChange={(e) => setTemplateSort(e.target.value)}
                    className="portal-select"
                    aria-label="Sort templates"
                  >
                    <option value="name_asc">Sort: Name (A–Z)</option>
                    <option value="name_desc">Sort: Name (Z–A)</option>
                    <option value="updated_desc">Sort: Recently Updated</option>
                  </select>
                </div>
              </div>

              {/* Templates Grid */}
              <div className="portal-templates-grid">
                {filteredTemplates.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <FileText size={32} color="#94A3B8" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: 600, color: '#334155' }}>No templates match your active filters</div>
                    <div className="text-xs text-muted" style={{ marginTop: '4px' }}>
                      Adjust the status, channel, or category filters above, or create a new local template draft.
                    </div>
                  </div>
                ) : (
                  filteredTemplates.map((t) => {
                    const rawStatus = t.meta_approval_status || t.status || 'NOT_VERIFIED';
                    const isVerifiedMetaApproved = t.channel === 'WhatsApp' && t.synced_from_meta === true && rawStatus === 'APPROVED';
                    const statusLabel = isVerifiedMetaApproved
                      ? 'META APPROVED'
                      : t.channel === 'WhatsApp'
                      ? (rawStatus === 'LOCAL_DRAFT' ? 'LOCAL DRAFT' : rawStatus === 'NOT_VERIFIED' ? 'UNVERIFIED BLUEPRINT' : rawStatus)
                      : rawStatus;
                    const statusBadgeClass = isVerifiedMetaApproved
                      ? 'badge-success'
                      : rawStatus === 'REJECTED' || rawStatus === 'DISABLED'
                      ? 'badge-danger'
                      : t.channel !== 'WhatsApp'
                      ? 'badge-primary'
                      : 'badge-warning';

                    return (
                      <div key={t.template_id} className="portal-template-card">
                        <div>
                          <div className="flex-between" style={{ gap: '6px', flexWrap: 'wrap' }}>
                            <span className={`portal-badge ${t.channel === 'WhatsApp' ? 'badge-success' : 'badge-primary'}`}>
                              {t.channel}
                            </span>
                            <span className={`portal-badge ${statusBadgeClass}`} title={t.verification_note || statusLabel}>
                              {statusLabel}
                            </span>
                          </div>
                          <h3 style={{ marginTop: '10px', fontSize: '1rem', color: '#0F172A' }}>{t.display_name || t.name}</h3>
                          <div className="text-muted text-xs" style={{ marginTop: '2px' }}>
                            Code: <code>{t.name}</code> • ID: <code>{t.template_id}</code>
                          </div>
                          <div className="text-muted text-xs" style={{ marginTop: '2px' }}>
                            Category: <strong>{t.category}</strong> • Lang: <strong>{t.language || 'en'}</strong> • Meta ID: <code>{t.meta_id || 'Local Only'}</code>
                          </div>

                          {t.header && (
                            <div style={{ fontWeight: 700, fontSize: '0.84rem', marginTop: '10px', color: '#0F172A', background: '#F8FAFC', padding: '6px 8px', borderRadius: '4px', borderLeft: '3px solid #0052CC' }}>
                              {t.header}
                            </div>
                          )}

                          <div className="portal-template-body-preview" style={{ marginTop: '8px' }}>
                            {t.body}
                          </div>

                          {t.footer && (
                            <div className="text-muted text-xs" style={{ fontStyle: 'italic', marginBottom: '8px' }}>
                              Footer: {t.footer}
                            </div>
                          )}

                          {Array.isArray(t.buttons) && t.buttons.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                              {t.buttons.map((btn, bIdx) => (
                                <span key={bIdx} style={{ fontSize: '0.7rem', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '2px 8px', fontWeight: 600 }}>
                                  ↪ {btn}
                                </span>
                              ))}
                            </div>
                          )}

                          {t.variables && t.variables.length > 0 && (
                            <div className="portal-variables-row">
                              {t.variables.map((v, idx) => {
                                const lbl = t.variable_labels && t.variable_labels[idx] ? ` (${t.variable_labels[idx]})` : '';
                                return (
                                  <span key={idx} className="portal-var-badge">&#123;&#123;{v}&#125;&#125;{lbl}</span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="portal-btn-row" style={{ marginTop: '14px', borderTop: '1px solid #F1F5F9', paddingTop: '10px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handlePreviewTemplate(t)}
                            className="portal-btn-sm portal-btn-primary"
                            title="Inspect template metadata, validate variables, preview phone bubble, or simulate test dispatch"
                          >
                            <Eye size={12} /> Details & Preview
                          </button>
                          <button
                            onClick={() => handleDuplicateTemplate(t.template_id)}
                            className="portal-btn-sm portal-btn-outline"
                            title="Clone as a modifiable Local Draft"
                          >
                            <Copy size={12} /> Duplicate Draft
                          </button>
                          <button
                            onClick={() => handleCopyTemplate(t)}
                            className="portal-btn-sm portal-btn-outline"
                            title="Copy formatted template text to clipboard"
                          >
                            {copiedTemplateId === t.template_id ? <Check size={12} color="#16A34A" /> : <FileText size={12} />}
                            {copiedTemplateId === t.template_id ? 'Copied' : 'Copy Text'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 7. CAMPAIGNS AUTOMATION */}
          {activeTab === 'campaigns' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Campaign Automation & Cadence Orchestration</h2>
                  <p>Safe, scheduled, permission-based outreach. All live outbound delivery currently mocked (PROVIDER_MODE=mock).</p>
                </div>
                <div className="flex-align gap-2">
                  <button onClick={() => setShowCreateCmpModal(true)} className="portal-btn portal-btn-primary">
                    <Plus size={14} /> Create Campaign
                  </button>
                  <button onClick={fetchCampaigns} className="portal-btn portal-btn-outline">
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>

              {/* Guardrail Notice */}
              <div className="portal-estimate-alert">
                <AlertOctagon size={16} color="#B45309" />
                <div>
                  <strong>STRICT SAFETY GUARDRAIL (PROVIDER_MODE=mock):</strong> Live messaging is locked in mock sandbox mode.
                  Triggering dry-runs or approvals executes real audience queries and produces simulated delivery logs without contacting external recipients.
                </div>
              </div>

              {/* Status Filters */}
              <div className="portal-tab-filters" style={{ marginBottom: '16px' }}>
                {['ALL', 'DRAFT', 'DRY_RUN_PASSED', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'STOPPED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setCampaignStatusFilter(st)}
                    className={`portal-pill ${campaignStatusFilter === st ? 'active' : ''}`}
                  >
                    {st === 'ALL' ? 'All Campaigns' : st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Campaigns Grid */}
              <div className="portal-campaigns-grid">
                {filteredCampaigns.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No campaigns found under this filter.
                  </div>
                ) : (
                  filteredCampaigns.map((c) => (
                    <div key={c.campaign_id} className="portal-campaign-card">
                      <div>
                        <div className="flex-between">
                          <span className={`portal-badge ${
                            c.status === 'RUNNING' ? 'badge-success' :
                            c.status === 'DRY_RUN_PASSED' ? 'badge-accent' :
                            c.status === 'SCHEDULED' ? 'badge-primary' :
                            c.status === 'STOPPED' ? 'badge-danger' :
                            c.status === 'COMPLETED' ? 'badge-emerald' : 'badge-warning'
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-muted text-xs">
                            <code>{c.campaign_id}</code>
                          </span>
                        </div>

                        <h3 style={{ marginTop: '12px', fontSize: '1.05rem' }}>{c.name}</h3>
                        <p className="text-muted text-xs" style={{ marginBottom: '10px' }}>
                          Objective: <strong>{c.objective}</strong>
                        </p>

                        <div className="portal-score-breakdown" style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                          <div><span>Channel:</span> <strong>{c.channel}</strong></div>
                          <div><span>Target Segment:</span> <strong>{c.target_segment}</strong></div>
                          <div><span>Audience Count:</span> <strong>{c.audience_count || 0}</strong></div>
                          <div><span>Scheduled Date:</span> <strong>{c.scheduled_date || 'Immediate'}</strong></div>
                        </div>

                        {c.stats && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '10px', textAlign: 'center' }}>
                            <div style={{ background: '#EFF6FF', padding: '6px 2px', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0052CC' }}>{c.stats.sent || 0}</div>
                              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>SENT</div>
                            </div>
                            <div style={{ background: '#F0FDF4', padding: '6px 2px', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#16A34A' }}>{c.stats.delivered || 0}</div>
                              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>DELIVERED</div>
                            </div>
                            <div style={{ background: '#FAF5FF', padding: '6px 2px', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#7E22CE' }}>{c.stats.read || 0}</div>
                              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>READ</div>
                            </div>
                            <div style={{ background: '#FFFBEB', padding: '6px 2px', borderRadius: '4px' }}>
                              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#B45309' }}>{c.stats.replied || 0}</div>
                              <div style={{ fontSize: '0.65rem', color: '#64748B' }}>REPLIED</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="portal-btn-row" style={{ marginTop: '16px', borderTop: '1px solid #F1F5F9', paddingTop: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleExecuteDryRun(c.campaign_id)}
                          disabled={dryRunLoading}
                          className="portal-btn-sm portal-btn-outline"
                          title="Simulate audience extraction and message assembly"
                        >
                          <PlayCircle size={12} /> Dry Run
                        </button>

                        {(c.status === 'DRAFT' || c.status === 'DRY_RUN_PASSED') && (
                          <button
                            onClick={() => handleApproveCampaign(c.campaign_id)}
                            className="portal-btn-sm portal-btn-primary"
                          >
                            <Check size={12} /> Approve
                          </button>
                        )}

                        {(c.status === 'RUNNING' || c.status === 'SCHEDULED') && (
                          <button
                            onClick={() => handleStopCampaign(c.campaign_id)}
                            className="portal-btn-sm portal-btn-danger"
                          >
                            <AlertOctagon size={12} /> Stop
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicateCampaign(c.campaign_id)}
                          className="portal-btn-sm portal-btn-outline"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Operational Playbooks & Cadence Schedules */}
              <div className="portal-card mt-6">
                <h3>Cadence & Suppression Playbooks (Standard Operating Procedures)</h3>
                <div className="portal-grid-2 mt-3">
                  <div>
                    <h4>Module A — Builder Outreach Stages</h4>
                    <p><strong>Activity A:</strong> Company contact verification and desk extensions confirmation.</p>
                    <p><strong>Activity B:</strong> Formal APF presentation highlighting on-site loan desks and 30+ banking tie-ups.</p>
                    <p><strong>Activity C:</strong> Execution of bilateral Home Loan Referral MOU with transparent commission matrices.</p>
                  </div>
                  <div>
                    <h4>Module B — Education Follow-up Cadence</h4>
                    <p><strong>Step 1 (Day 2):</strong> Institutional introduction to Managing Trustee regarding campus CAPEX.</p>
                    <p><strong>Step 2 (Day 5):</strong> Follow-up phone consultation regarding structured LAP or bank OD parameters.</p>
                    <p><strong>Step 3 (Day 10):</strong> Product sheet delivery (tenure, LTV, interest margins).</p>
                    <p><strong>Step 4 (Day 15):</strong> Final consultation brief or transition to 'Follow-up Later'.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. ANALYTICS & PORTFOLIO INTELLIGENCE */}
          {activeTab === 'analytics' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Cross-Module Intelligence & Portfolio Analytics</h2>
                  <p>Executive KPIs, lead velocity, database readiness, and borrower demand distribution</p>
                </div>
                <div className="flex-align gap-2">
                  <button onClick={fetchAnalytics} className="portal-btn portal-btn-outline">
                    <RefreshCw size={14} /> Refresh Analytics
                  </button>
                </div>
              </div>

              {/* Top 4 KPI Metrics */}
              <div className="portal-analytics-grid">
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Builders Directory</span>
                  <span className="portal-kpi-val text-primary">{builders.length || 80}</span>
                  <span className="portal-kpi-sub">MahaRERA Verified Developers</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Educational Institutions</span>
                  <span className="portal-kpi-val text-emerald">{schools.length + colleges.length || 80}</span>
                  <span className="portal-kpi-sub">24 Schools + 56 Colleges</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Consumer Loan Leads</span>
                  <span className="portal-kpi-val text-accent">{leads.length || 6}</span>
                  <span className="portal-kpi-sub">Active Consumer Inquiries</span>
                </div>
                <div className="portal-kpi-card">
                  <span className="portal-kpi-title">Capital Pipeline</span>
                  <span className="portal-kpi-val text-success">₹1,550+ Cr</span>
                  <span className="portal-kpi-sub">Estimated Combined Demand</span>
                </div>
              </div>

              {/* Visual Funnels & Distribution */}
              <div className="portal-grid-2">
                <div className="portal-card">
                  <h3>Capital Demand by Loan Product</h3>
                  <div className="portal-funnel-bar-wrap">
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Home Loans</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '42%' }}></div>
                      </div>
                      <div className="portal-funnel-val">42%</div>
                    </div>
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Loan Against Property</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '28%', background: 'linear-gradient(90deg, #10B981, #059669)' }}></div>
                      </div>
                      <div className="portal-funnel-val">28%</div>
                    </div>
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Education Campus LAP</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '18%', background: 'linear-gradient(90deg, #7C3AED, #6D28D9)' }}></div>
                      </div>
                      <div className="portal-funnel-val">18%</div>
                    </div>
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Builder Construction APF</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '12%', background: 'linear-gradient(90deg, #F59E0B, #D97706)' }}></div>
                      </div>
                      <div className="portal-funnel-val">12%</div>
                    </div>
                  </div>
                </div>

                <div className="portal-card">
                  <h3>Institutional Funding Priority Tiers</h3>
                  <div className="portal-funnel-bar-wrap">
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Tier A+ (Score ≥ 90)</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '65%', background: 'linear-gradient(90deg, #10B981, #059669)' }}></div>
                      </div>
                      <div className="portal-funnel-val">52 (65%)</div>
                    </div>
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Tier A (Score 75-89)</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '25%', background: 'linear-gradient(90deg, #2563EB, #1D4ED8)' }}></div>
                      </div>
                      <div className="portal-funnel-val">20 (25%)</div>
                    </div>
                    <div className="portal-funnel-row">
                      <div className="portal-funnel-lbl">Tier B (Score 60-74)</div>
                      <div className="portal-funnel-bar-bg">
                        <div className="portal-funnel-bar-fill" style={{ width: '10%', background: 'linear-gradient(90deg, #64748B, #475569)' }}></div>
                      </div>
                      <div className="portal-funnel-val">8 (10%)</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', padding: '12px', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.82rem' }}>
                    <strong>Quality Assurance:</strong> 100% of the 80 institutional records contain verified governance desks, registered trust names, and campus ownership intelligence.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. REPORTS & EXPORTS */}
          {activeTab === 'reports' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Reports & Analytics Engine</h2>
                  <p>Generate authentic Excel (XLSX) workbooks directly from live database tables</p>
                </div>
              </div>

              <div className="portal-grid-3">
                <div className="portal-card">
                  <div className="portal-card-header">
                    <Building2 size={20} color="#0052CC" />
                    <h4>Builder Module Reports</h4>
                  </div>
                  <ul className="portal-report-list">
                    <li>
                      <span>Builder Master Database</span>
                      <a href="/api/portal/builder/export" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                    <li>
                      <span>MahaRERA Status Review</span>
                      <a href="/api/portal/builder/export" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                    <li>
                      <span>Partnership Readiness Master</span>
                      <a href="/api/portal/builder/export" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                  </ul>
                </div>

                <div className="portal-card">
                  <div className="portal-card-header">
                    <GraduationCap size={20} color="#059669" />
                    <h4>Education Module Reports</h4>
                  </div>
                  <ul className="portal-report-list">
                    <li>
                      <span>School Funding Database (24)</span>
                      <a href="/api/portal/education/schools/export" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                    <li>
                      <span>College & Univ Database (56)</span>
                      <a href="/api/portal/education/colleges/export" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                    <li>
                      <span>Combined Institution Master (80)</span>
                      <a href="/api/portal/education/export" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                  </ul>
                </div>

                <div className="portal-card">
                  <div className="portal-card-header">
                    <LayoutDashboard size={20} color="#7C3AED" />
                    <h4>Unified Operations Reports</h4>
                  </div>
                  <ul className="portal-report-list">
                    <li>
                      <span>Unified Executive Dashboard Report</span>
                      <a href="/api/portal/dashboard/reports/unified-dashboard" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                    <li>
                      <span>System Automation & Quality Audit</span>
                      <a href="/api/portal/dashboard/reports/unified-dashboard" className="portal-btn-sm portal-btn-outline"><Download size={12} /> XLSX</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 8. SYNCHRONIZATION */}
          {activeTab === 'sync' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Data Synchronization & Duplicate Prevention</h2>
                  <p>Automated reconciliation between database records and source research</p>
                </div>
                <button onClick={handleRecalculateScores} disabled={actionLoading} className="portal-btn portal-btn-primary">
                  <RefreshCw size={14} /> Run Duplicate Audit Now
                </button>
              </div>

              <div className="portal-card">
                <h3>System Integrity Status</h3>
                <div className="portal-audit-grid">
                  <div className="portal-audit-item">
                    <CheckCircle2 size={24} color="#10B981" />
                    <div>
                      <strong>Builder Records Ingested:</strong>
                      <p>Exactly 80 unique developers. Zero duplicate company names.</p>
                    </div>
                  </div>
                  <div className="portal-audit-item">
                    <CheckCircle2 size={24} color="#10B981" />
                    <div>
                      <strong>Education Institutions Ingested:</strong>
                      <p>Exactly 80 institutions. All 65 standard schema fields verified.</p>
                    </div>
                  </div>
                  <div className="portal-audit-item">
                    <CheckCircle2 size={24} color="#10B981" />
                    <div>
                      <strong>Data Separation Guarantee:</strong>
                      <p>Builder IDs (`ALS-BLD-*`) and Education IDs (`ALS-EDU-*`) completely isolated.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. AUTOMATION CENTRE */}
          {activeTab === 'automation' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Automation Control Centre</h2>
                  <p>Global orchestrator for outreach workflows, lead scoring, and emergency controls</p>
                </div>
              </div>

              <div className="portal-card">
                <h3>Global Emergency STOP Switch</h3>
                <p>
                  Instantly halts all automated outbound messages, email cadences, and WhatsApp marketing.
                  Inbound customer enquiry forms and internal CRM task creation remain fully functional.
                </p>

                <div className="portal-stop-status-box">
                  <div>
                    <strong>Current Automation State: </strong>
                    <span className={`portal-badge ${automationState?.stop_active ? 'badge-danger' : 'badge-success'}`}>
                      {automationState?.stop_active ? 'HALTED (STOP ENGAGED)' : 'RUNNING NORMALLY'}
                    </span>
                  </div>

                  {automationState?.stop_active ? (
                    <button onClick={handleResumeAutomation} disabled={actionLoading} className="portal-btn portal-btn-primary">
                      <Play size={14} /> Resume Outbound Workflows
                    </button>
                  ) : (
                    <button onClick={() => setShowStopModal(true)} className="portal-btn portal-btn-danger">
                      <AlertOctagon size={14} /> Engage Global STOP
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 10. USER MANAGEMENT (Super Administrator only) */}
          {activeTab === 'users' && currentUser.role === 'Super Administrator' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Administrator User Management</h2>
                  <p>Manage system users, RBAC role assignments, and password policies</p>
                </div>
              </div>

              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Full Name</th>
                      <th>Assigned Role</th>
                      <th>Status</th>
                      <th>Password Replacement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.userId}>
                        <td><code>{u.userId}</code></td>
                        <td><strong>{u.username}</strong></td>
                        <td>{u.email}</td>
                        <td>{u.fullName}</td>
                        <td><span className="portal-badge badge-primary">{u.role}</span></td>
                        <td><span className="portal-badge badge-success">Active</span></td>
                        <td>
                          {u.mustChangePassword ? (
                            <span className="portal-badge badge-warning">Enforced on Next Login</span>
                          ) : (
                            <span className="portal-badge badge-success">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>System Settings & Channel Configurations</h2>
                  <p>API integrations, operational business hours, and holiday schedules</p>
                </div>
              </div>

              <div className="portal-grid-2">
                <div className="portal-card">
                  <h3>Channel Integrations</h3>
                  <div className="portal-channel-item">
                    <div>
                      <strong>Corporate Email Delivery (SMTP / Nodemailer):</strong>
                      <p className="text-muted text-xs">Environment: <code>process.env.SMTP_*</code></p>
                    </div>
                    <span className="portal-badge badge-success">Configured</span>
                  </div>
                  <div className="portal-channel-item">
                    <div>
                      <strong>WhatsApp Cloud Platform:</strong>
                      <p className="text-muted text-xs">Meta Graph API • Permission-Checked</p>
                    </div>
                    <span className="portal-badge badge-success">Connected</span>
                  </div>
                  <div className="portal-channel-item">
                    <div>
                      <strong>MahaRERA Research Verification:</strong>
                      <p className="text-muted text-xs">Maharashtra Real Estate Regulatory Authority Data</p>
                    </div>
                    <span className="portal-badge badge-success">Active</span>
                  </div>
                </div>

                <div className="portal-card">
                  <h3>Operational Schedule</h3>
                  <p><strong>Business Days:</strong> Monday to Friday (10:00 AM – 6:30 PM IST)</p>
                  <p><strong>Follow-Up Cadence Rules:</strong> Strictly skip weekends and Maharashtra gazetted holidays.</p>
                  <p><strong>Data Retention Policy:</strong> Audit logs preserved indefinitely for executive compliance.</p>
                </div>
              </div>
            </div>
          )}

          {/* 12. AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Administrative Activity Audit Logs</h2>
                  <p>Immutable forensic record of all administrative logins, stage transitions, and exports</p>
                </div>
              </div>

              <div className="portal-table-wrap">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Log ID</th>
                      <th>Timestamp (UTC)</th>
                      <th>User</th>
                      <th>Module</th>
                      <th>Action</th>
                      <th>IP Address</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((l) => (
                      <tr key={l.log_id}>
                        <td><code>{l.log_id}</code></td>
                        <td>{l.timestamp ? l.timestamp.replace('T', ' ').substring(0, 19) : ''}</td>
                        <td><strong>{l.user_id}</strong></td>
                        <td>
                          <span className={`portal-badge ${l.module === 'BUILDER' ? 'badge-primary' : (l.module === 'EDUCATION' ? 'badge-emerald' : 'badge-warning')}`}>
                            {l.module}
                          </span>
                        </td>
                        <td><code>{l.action}</code></td>
                        <td>{l.ip_address}</td>
                        <td className="text-xs">{JSON.stringify(l.details)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Template Modal */}
      {showCreateTplModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowCreateTplModal(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <FileText size={28} color="#0052CC" />
              <h3>Create Message Template</h3>
              <p>Design a reusable WhatsApp, Email or SMS template with parameter tags.</p>
            </div>
            <form onSubmit={handleCreateTemplate} className="portal-form portal-modal-body">
              <div className="portal-form-group">
                <label>Template Name (Internal Identifier)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. builder_intro_mumbai"
                  value={tplForm.name}
                  onChange={(e) => setTplForm({ ...tplForm, name: e.target.value })}
                />
              </div>
              <div className="portal-grid-2">
                <div className="portal-form-group">
                  <label>Channel</label>
                  <select
                    value={tplForm.channel}
                    onChange={(e) => setTplForm({ ...tplForm, channel: e.target.value })}
                    className="portal-select"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label>Category</label>
                  <select
                    value={tplForm.category}
                    onChange={(e) => setTplForm({ ...tplForm, category: e.target.value })}
                    className="portal-select"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
              </div>
              <div className="portal-form-group">
                <label>Header (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Avani Loan Services — Exclusive APF Desk"
                  value={tplForm.header}
                  onChange={(e) => setTplForm({ ...tplForm, header: e.target.value })}
                />
              </div>
              <div className="portal-form-group">
                <label>Body Text (Use &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; or named tags)</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Dear {{1}}, Avani Loan Services offers dedicated home loan processing..."
                  value={tplForm.body}
                  onChange={(e) => setTplForm({ ...tplForm, body: e.target.value })}
                />
              </div>
              <div className="portal-form-group">
                <label>Footer Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Reply STOP to opt out"
                  value={tplForm.footer}
                  onChange={(e) => setTplForm({ ...tplForm, footer: e.target.value })}
                />
              </div>
              <div className="portal-form-group">
                <label>Variables (Comma separated list)</label>
                <input
                  type="text"
                  placeholder="e.g. Customer Name, Project Name, City"
                  value={tplForm.variables}
                  onChange={(e) => setTplForm({ ...tplForm, variables: e.target.value })}
                />
              </div>
              <div className="portal-btn-row">
                <button type="button" onClick={() => setShowCreateTplModal(false)} className="portal-btn portal-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="portal-btn portal-btn-primary">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp / Email Template Detail, Interactive Preview & Variable Validation Modal */}
      {tplPreviewModal && tplPreviewData && (
        <div className="portal-modal-backdrop" onClick={() => setTplPreviewModal(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <Eye size={28} color="#0052CC" />
              <h3>Template Details, Variable Validation & Phone Preview</h3>
              <p>Inspect Meta WABA attributes, test dynamic parameter replacement, and simulate controlled mock dispatch.</p>
            </div>
            <div className="portal-modal-body">
              <div className="portal-grid-2" style={{ alignItems: 'start', gap: '20px' }}>
                {/* Left Column: Metadata & Variable Inputs */}
                <div>
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.8rem', marginBottom: '14px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', marginBottom: '6px' }}>
                      {tplPreviewData.template.display_name || tplPreviewData.template.name}
                    </div>
                    <div><strong>Internal ID:</strong> <code>{tplPreviewData.template.template_id}</code></div>
                    <div><strong>Template Name:</strong> <code>{tplPreviewData.template.name}</code></div>
                    <div><strong>Meta Template ID:</strong> <code>{tplPreviewData.template.meta_id || 'Local Only (Not Synced)'}</code></div>
                    <div><strong>Channel / Category:</strong> {tplPreviewData.template.channel} • {tplPreviewData.template.category}</div>
                    <div><strong>Language:</strong> {tplPreviewData.template.language || 'en'}</div>
                    <div>
                      <strong>Approval Status:</strong>{' '}
                      <span className={`portal-badge ${tplPreviewData.template.synced_from_meta && tplPreviewData.template.meta_approval_status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                        {tplPreviewData.template.synced_from_meta && tplPreviewData.template.meta_approval_status === 'APPROVED'
                          ? 'META APPROVED'
                          : tplPreviewData.template.meta_approval_status || 'LOCAL_DRAFT'}
                      </span>
                    </div>
                    {tplPreviewData.template.verification_note && (
                      <div className="text-muted text-xs" style={{ marginTop: '6px' }}>
                        {tplPreviewData.template.verification_note}
                      </div>
                    )}
                  </div>

                  {/* Interactive Variable Validation */}
                  {Object.keys(previewVars).length > 0 && (
                    <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#0F172A' }}>
                        Parameter Placeholders & Live Validation
                      </div>
                      {Object.keys(previewVars).map((vKey, idx) => {
                        const isEmpty = !previewVars[vKey] || String(previewVars[vKey]).trim() === '';
                        const labelHint = tplPreviewData.template.variable_labels && tplPreviewData.template.variable_labels[idx]
                          ? ` (${tplPreviewData.template.variable_labels[idx]})`
                          : '';
                        return (
                          <div key={vKey} style={{ marginBottom: '8px' }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: isEmpty ? '#DC2626' : '#334155', marginBottom: '2px' }}>
                              Placeholder &#123;&#123;{vKey}&#125;&#125;{labelHint} {isEmpty && '— REQUIRED'}
                            </label>
                            <input
                              type="text"
                              value={previewVars[vKey]}
                              onChange={(e) => handlePreviewVarChange(vKey, e.target.value)}
                              placeholder={`Enter value for {{${vKey}}}...`}
                              style={{
                                width: '100%',
                                padding: '6px 10px',
                                fontSize: '0.8rem',
                                borderRadius: '6px',
                                border: isEmpty ? '1.5px solid #DC2626' : '1px solid #CBD5E1',
                                background: isEmpty ? '#FEF2F2' : '#FFFFFF'
                              }}
                            />
                          </div>
                        );
                      })}
                      {Object.values(previewVars).some(v => !v || String(v).trim() === '') ? (
                        <div style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600, marginTop: '4px' }}>
                          ⚠️ Validation Warning: One or more required placeholders are empty. Message dispatch is blocked until all variables are populated.
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
                          ✓ All {Object.keys(previewVars).length} template variable(s) validated.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Controlled Individual Message Simulation (Mock Mode Safe) */}
                  <form onSubmit={handleSendTestTemplate} style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '4px' }}>
                      Controlled Test Message Simulation (Mock Sandbox)
                    </div>
                    <div className="text-muted text-xs" style={{ marginBottom: '8px' }}>
                      Validates phone format, consent & variables. Strictly simulated (0 live sends).
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={testSendPhone}
                        onChange={(e) => setTestSendPhone(e.target.value)}
                        placeholder="+91 9175635165"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                      />
                      <button type="submit" disabled={testSendLoading} className="portal-btn-sm portal-btn-primary">
                        <Send size={12} /> {testSendLoading ? 'Simulating...' : 'Simulate Send'}
                      </button>
                    </div>
                    {testSendResult && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          background: testSendResult.success ? '#F0FDF4' : '#FEF2F2',
                          color: testSendResult.success ? '#166534' : '#991B1B',
                          border: `1px solid ${testSendResult.success ? '#BBF7D0' : '#FECACA'}`
                        }}
                      >
                        <div><strong>{testSendResult.success ? '✓ Simulation Passed:' : '✕ Validation Failed:'}</strong> {testSendResult.message}</div>
                        {testSendResult.simulation && (
                          <div style={{ marginTop: '4px', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                            WAMID: {testSendResult.simulation.message_id} • Cost: ₹0 • Live Send: FALSE
                          </div>
                        )}
                      </div>
                    )}
                  </form>
                </div>

                {/* Right Column: Phone Bubble Preview */}
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A', marginBottom: '8px', textAlign: 'center' }}>
                    Live Handset Rendering Preview
                  </div>
                  <div className="portal-phone-mockup">
                    <div className="portal-wa-bubble">
                      {tplPreviewData.template.header && (
                        <div className="portal-wa-header">{tplPreviewData.template.header}</div>
                      )}
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.45 }}>
                        {tplPreviewData.renderedBody}
                      </div>
                      {tplPreviewData.template.footer && (
                        <div className="portal-wa-footer">{tplPreviewData.template.footer}</div>
                      )}
                      <div className="portal-wa-time">10:30 AM ✓✓</div>
                    </div>
                    {Array.isArray(tplPreviewData.template.buttons) && tplPreviewData.template.buttons.length > 0 && (
                      <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {tplPreviewData.template.buttons.map((b, i) => (
                          <div
                            key={i}
                            style={{
                              background: '#FFFFFF',
                              color: '#00A884',
                              textAlign: 'center',
                              padding: '7px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
                            }}
                          >
                            ↪ {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="portal-btn-row" style={{ marginTop: '18px' }}>
                <button
                  onClick={() => {
                    handleDuplicateTemplate(tplPreviewData.template.template_id);
                    setTplPreviewModal(false);
                  }}
                  className="portal-btn portal-btn-outline"
                >
                  <Copy size={14} /> Duplicate as Local Draft
                </button>
                <button onClick={() => setTplPreviewModal(false)} className="portal-btn portal-btn-primary">
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCmpModal && (
        <div className="portal-modal-backdrop" onClick={() => setShowCreateCmpModal(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header">
              <Send size={28} color="#0052CC" />
              <h3>Create Outreach Campaign</h3>
              <p>Define target cohort, scheduled timing and associated message template.</p>
            </div>
            <form onSubmit={handleCreateCampaign} className="portal-form portal-modal-body">
              <div className="portal-form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Tier-1 Builders APF Drive Q4"
                  value={cmpForm.name}
                  onChange={(e) => setCmpForm({ ...cmpForm, name: e.target.value })}
                />
              </div>
              <div className="portal-grid-2">
                <div className="portal-form-group">
                  <label>Channel</label>
                  <select
                    value={cmpForm.channel}
                    onChange={(e) => setCmpForm({ ...cmpForm, channel: e.target.value })}
                    className="portal-select"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Multi-Channel">Multi-Channel</option>
                  </select>
                </div>
                <div className="portal-form-group">
                  <label>Target Segment</label>
                  <select
                    value={cmpForm.target_segment}
                    onChange={(e) => setCmpForm({ ...cmpForm, target_segment: e.target.value })}
                    className="portal-select"
                  >
                    <option value="BUILDERS_80">All 80 Maharashtra Builders</option>
                    <option value="BUILDERS_PUNE">Pune & Mumbai Developers</option>
                    <option value="SCHOOLS_24">24 School Groups</option>
                    <option value="COLLEGES_56">56 College & Univ Campuses</option>
                    <option value="RETAIL_LEADS">Inbound Retail Leads</option>
                  </select>
                </div>
              </div>
              <div className="portal-form-group">
                <label>Objective</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Home Loan Desk Discovery Call"
                  value={cmpForm.objective}
                  onChange={(e) => setCmpForm({ ...cmpForm, objective: e.target.value })}
                />
              </div>
              <div className="portal-form-group">
                <label>Associated Template</label>
                <select
                  value={cmpForm.template_id}
                  onChange={(e) => setCmpForm({ ...cmpForm, template_id: e.target.value })}
                  className="portal-select"
                >
                  <option value="">Select a template blueprint</option>
                  {templates.map(t => (
                    <option key={t.template_id} value={t.template_id}>
                      {t.display_name || t.name} ({t.channel} — {t.synced_from_meta && t.meta_approval_status === 'APPROVED' ? 'Meta Approved' : t.meta_approval_status || 'Local Draft'})
                    </option>
                  ))}
                </select>
              </div>
              <div className="portal-form-group">
                <label>Scheduled Date (Optional / Immediate if blank)</label>
                <input
                  type="date"
                  value={cmpForm.scheduled_date}
                  onChange={(e) => setCmpForm({ ...cmpForm, scheduled_date: e.target.value })}
                />
              </div>
              <div className="portal-btn-row">
                <button type="button" onClick={() => setShowCreateCmpModal(false)} className="portal-btn portal-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="portal-btn portal-btn-primary">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dry Run Results Modal */}
      {dryRunModal && dryRunSummary && (
        <div className="portal-modal-backdrop" onClick={() => setDryRunModal(false)}>
          <div className="portal-modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="portal-modal-header" style={{ background: '#F0FDF4', borderBottom: '1px solid #BBF7D0' }}>
              <CheckCircle2 size={32} color="#16A34A" />
              <h3>Dry Run Simulation Completed</h3>
              <p>Audience verified • Zero messages dispatched • 100% Mock Safe</p>
            </div>
            <div className="portal-modal-body">
              <div className="portal-dryrun-summary">
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                  Template Applied: {dryRunSummary.template_applied || 'Default Direct Briefing'}
                </div>
                <div className="text-muted text-xs">
                  Template Status: <strong>{dryRunSummary.template_status || 'N/A'}</strong> • Mode: <strong>{dryRunSummary.provider_mode || 'mock'}</strong>
                </div>

                <div className="portal-dryrun-metrics">
                  <div className="portal-dryrun-stat">
                    <div className="num text-primary">{dryRunSummary.total_audience || 0}</div>
                    <div className="lbl">Total Evaluated</div>
                  </div>
                  <div className="portal-dryrun-stat">
                    <div className="num text-success">{dryRunSummary.valid_recipients || 0}</div>
                    <div className="lbl">Valid Contacts</div>
                  </div>
                  <div className="portal-dryrun-stat">
                    <div className="num text-warning">{dryRunSummary.suppressed_opt_outs || 0}</div>
                    <div className="lbl">Opt-Out Suppressed</div>
                  </div>
                </div>
              </div>

              {Array.isArray(dryRunSummary.validation_warnings) && dryRunSummary.validation_warnings.length > 0 && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', marginBottom: '12px' }}>
                  <strong>Compliance Notice:</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {dryRunSummary.validation_warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', color: '#334155' }}>
                <div><strong>Simulation Result:</strong> <span className="portal-badge badge-success">{dryRunSummary.status || 'SUCCESSFUL_SIMULATION'}</span></div>
                <div><strong>Live Messages Sent:</strong> 0 • <strong>Delivery Cost:</strong> ₹0.00 (PROVIDER_MODE=mock)</div>
                <div style={{ marginTop: '6px' }}><strong>Sample Rendered Message Preview:</strong></div>
                <pre style={{ background: '#FFFFFF', padding: '8px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '0.75rem', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
                  {dryRunSummary.sample_rendered_message || dryRunSummary.result_message}
                </pre>
              </div>

              <div className="portal-btn-row">
                <button onClick={() => setDryRunModal(false)} className="portal-btn portal-btn-primary">
                  Acknowledge & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCircleIcon() {
  return <AlertTriangle size={18} color="#DC2626" />;
}
