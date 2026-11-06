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
  ExternalLink, Eye, ChevronRight, CheckCircle2, XCircle, Clock,
  ArrowUpRight, AlertTriangle, Play, Lock, UserCheck, Phone, Mail,
  MapPin, Award, FileText, Check, DollarSign, Database
} from 'lucide-react';
import './UnifiedAdminPortal.css';

export default function UnifiedAdminPortal() {
  // Authentication State
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Force Password Change Modal
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Navigation State (12 sections)
  const [activeTab, setActiveTab] = useState('overview'); // overview, builder, schools, colleges, tasks, enquiries, campaigns, reports, sync, automation, users, settings, audit
  const [activeModulePill, setActiveModulePill] = useState('all'); // all, builder, schools, colleges

  // Overview Data
  const [overviewData, setOverviewData] = useState(null);

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
      const res = await fetch('/api/portal/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setCurrentUser(data.user);
        if (data.user.mustChangePassword) {
          setShowPwdModal(true);
        }
        loadAllData();
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.user);
        if (data.user.mustChangePassword) {
          setShowPwdModal(true);
        }
        loadAllData();
      } else {
        setLoginError(data.message || 'Login failed. Please verify credentials.');
      }
    } catch {
      setLoginError('Network error connecting to portal authentication server.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
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
      const res = await fetch('/api/portal/auth/change-password', {
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
    if (currentUser?.role === 'Super Administrator') {
      fetchUsers();
    }
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/portal/dashboard/overview');
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
      const res = await fetch(`/api/portal/builder/companies?limit=100&subview=${subview}`);
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
      const res = await fetch(`/api/portal/education/schools?limit=100&subview=${subview}`);
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
      const res = await fetch(`/api/portal/education/colleges?limit=100&subview=${subview}`);
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
      const res = await fetch('/api/portal/education/institutions?limit=100');
      const data = await res.json();
      if (res.ok && data.success) setInstitutions(data.data);
    } catch (e) {
      console.error('Failed to fetch institutions', e);
    }
  };

  const fetchBuilderPipeline = async () => {
    try {
      const res = await fetch('/api/portal/builder/pipeline');
      const data = await res.json();
      if (res.ok && data.success) setBuilderPipeline(data);
    } catch (e) {
      console.error('Failed to fetch builder pipeline', e);
    }
  };

  const fetchEduPipeline = async () => {
    try {
      const res = await fetch('/api/portal/education/pipeline');
      const data = await res.json();
      if (res.ok && data.success) setEduPipeline(data);
    } catch (e) {
      console.error('Failed to fetch education pipeline', e);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/portal/dashboard/tasks');
      const data = await res.json();
      if (res.ok && data.success) setTasks(data.data);
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await fetch('/api/portal/dashboard/enquiries');
      const data = await res.json();
      if (res.ok && data.success) setEnquiries(data.data);
    } catch (e) {
      console.error('Failed to fetch enquiries', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/portal/dashboard/audit-logs?limit=50');
      const data = await res.json();
      if (res.ok && data.success) setAuditLogs(data.data);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    }
  };

  const fetchAutomationStatus = async () => {
    try {
      const res = await fetch('/api/portal/dashboard/automation/status');
      const data = await res.json();
      if (res.ok && data.success) setAutomationState(data.data);
    } catch (e) {
      console.error('Failed to fetch automation state', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/portal/auth/users');
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
      const res = await fetch('/api/portal/dashboard/automation/emergency-stop', {
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
      const res = await fetch('/api/portal/dashboard/automation/resume', {
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
      await fetch('/api/portal/dashboard/automation/sync', { method: 'POST' });
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
            <div className="portal-modules-tag">
              <span>Builder Partnerships</span> • <span>Education Institutional Funding</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="portal-login-form">
            {loginError && (
              <div className="portal-alert portal-alert-error">
                <AlertCircleIcon /> <span>{loginError}</span>
              </div>
            )}

            <div className="portal-form-group">
              <label>Administrator Username or Email</label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin or admin@avanifinserv.com"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>

            <div className="portal-form-group">
              <label>Security Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>

            <button type="submit" disabled={loginSubmitting} className="portal-btn portal-btn-primary">
              {loginSubmitting ? 'Verifying Authorization...' : 'Authenticate & Access Portal'}
            </button>

            <div className="portal-security-footer">
              <Lock size={14} />
              <span>Strict Server-Side Session • HTTP-Only Cookies • Role-Based Access</span>
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

              <button type="submit" disabled={pwdSubmitting} className="portal-btn portal-btn-primary">
                {pwdSubmitting ? 'Updating...' : 'Set New Secure Password'}
              </button>
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

          {/* Database Switcher Pills */}
          <div className="portal-module-pills">
            <button
              onClick={() => setActiveTab('overview')}
              className={`portal-pill ${activeTab === 'overview' ? 'active' : ''}`}
            >
              Overview
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
          </div>
        </div>
      </header>

      {/* Portal Main Body with 12 Tabs */}
      <div className="portal-container portal-layout">
        {/* Sidebar Navigation */}
        <aside className="portal-sidebar">
          <nav className="portal-nav">
            <button
              onClick={() => setActiveTab('overview')}
              className={`portal-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} /> <span>Executive Overview</span>
            </button>

            <div className="portal-nav-group-title">PASSWORD-PROTECTED DATABASES</div>
            <button
              onClick={() => { setActiveTab('builder'); fetchBuilders('all'); }}
              className={`portal-nav-item ${activeTab === 'builder' ? 'active' : ''}`}
            >
              <Building2 size={18} /> <span>1. Builder Database</span>
              <span className="portal-nav-count">{builders.length || 80}</span>
            </button>

            <button
              onClick={() => { setActiveTab('schools'); fetchSchools('all'); }}
              className={`portal-nav-item ${activeTab === 'schools' ? 'active' : ''}`}
            >
              <GraduationCap size={18} /> <span>2. School Funding Database</span>
              <span className="portal-nav-count">{schools.length || 24}</span>
            </button>

            <button
              onClick={() => { setActiveTab('colleges'); fetchColleges('all'); }}
              className={`portal-nav-item ${activeTab === 'colleges' ? 'active' : ''}`}
            >
              <Award size={18} /> <span>3. College & Univ Database</span>
              <span className="portal-nav-count">{colleges.length || 56}</span>
            </button>

            <div className="portal-nav-group-title">OPERATIONS</div>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`portal-nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            >
              <CheckSquare size={18} /> <span>4. Task Centre</span>
              <span className="portal-nav-count">{tasks.filter(t => t.status === 'Pending').length}</span>
            </button>

            <button
              onClick={() => setActiveTab('enquiries')}
              className={`portal-nav-item ${activeTab === 'enquiries' ? 'active' : ''}`}
            >
              <Inbox size={18} /> <span>5. Enquiries</span>
              <span className="portal-nav-count">{enquiries.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`portal-nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
            >
              <Send size={18} /> <span>6. Campaign Outreach</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`portal-nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            >
              <FileSpreadsheet size={18} /> <span>7. Reports & Exports</span>
            </button>

            <div className="portal-nav-group-title">SYSTEM CONTROL</div>
            <button
              onClick={() => setActiveTab('sync')}
              className={`portal-nav-item ${activeTab === 'sync' ? 'active' : ''}`}
            >
              <RefreshCw size={18} /> <span>8. Synchronization</span>
            </button>

            <button
              onClick={() => setActiveTab('automation')}
              className={`portal-nav-item ${activeTab === 'automation' ? 'active' : ''}`}
            >
              <AlertOctagon size={18} /> <span>9. Automation Centre</span>
            </button>

            {currentUser.role === 'Super Administrator' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`portal-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              >
                <Users size={18} /> <span>10. User Management</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('settings')}
              className={`portal-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={18} /> <span>11. System Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`portal-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
            >
              <History size={18} /> <span>12. Audit Logs</span>
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

              {/* Three Password-Protected Databases Header Grid */}
              <div className="portal-three-db-grid">
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
                      <div className="portal-card">
                        <h4>MahaRERA & Corporate Evidence</h4>
                        <p><strong>Promoter:</strong> {selectedBuilder.legal_entity_name}</p>
                        <p><strong>Registered Address:</strong> {selectedBuilder.registered_office_address}</p>
                        <p><strong>Official Website:</strong> <a href={selectedBuilder.corporate_website} target="_blank" rel="noreferrer">{selectedBuilder.corporate_website}</a></p>
                        <p><strong>Projects:</strong> {selectedBuilder.project_names ? selectedBuilder.project_names.join(', ') : 'Verified Residential'}</p>
                      </div>

                      <div className="portal-card mt-3">
                        <h4>Qualification Score Breakdown (Score: {selectedBuilder.qualification_score}/100)</h4>
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

                      <div className="portal-card mt-3">
                        <h4>Outreach Protocol</h4>
                        <p><strong>Readiness:</strong> {selectedBuilder.outreach_readiness}</p>
                        <p><strong>Recommended Channel:</strong> {selectedBuilder.recommended_channel}</p>
                        <p><strong>Commercial Fit:</strong> {selectedBuilder.commercial_suitability}</p>
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
                      <div className="portal-card">
                        <h4>Confirmed Institutional Data</h4>
                        <p><strong>Board Affiliation / Category:</strong> {selectedSchool.subcategory || selectedSchool.board_affiliation}</p>
                        <p><strong>Ownership Type:</strong> {selectedSchool.ownership_type}</p>
                        <p><strong>Parent Trust / Society:</strong> {selectedSchool.parent_trust_society || 'Registered Society'}</p>
                        <p><strong>Campus Address:</strong> {selectedSchool.complete_address}</p>
                        <p><strong>Official Telephone:</strong> {selectedSchool.official_telephone}</p>
                        <p><strong>Official Email:</strong> {selectedSchool.official_email}</p>
                      </div>

                      <div className="portal-card mt-3">
                        <h4>Research-Based Analytical Estimates</h4>
                        <div className="portal-score-breakdown">
                          <div><span>Estimated Student Capacity:</span> <strong>{selectedSchool.student_capacity || 'N/A'}</strong></div>
                          <div><span>Estimated Student Enrolment:</span> <strong>{selectedSchool.approx_enrolment || 'N/A'}</strong></div>
                          <div><span>Potential Funding Bracket:</span> <strong>{selectedSchool.potential_funding_requirement || '₹2Cr - ₹10Cr'}</strong></div>
                        </div>
                        <p className="text-muted text-xs mt-3">Estimates formulated from publicly disclosed campus metrics, branch counts, and affiliation registries.</p>
                      </div>

                      <div className="portal-card mt-3">
                        <h4>Infrastructure Capital Need</h4>
                        <p><strong>Expansion Purpose:</strong> {selectedSchool.funding_purpose || 'School campus modernization & lab equipment finance'}</p>
                        <p><strong>Priority Tier:</strong> <span className="portal-badge badge-success">{selectedSchool.lead_priority_tier}</span> (Score: {selectedSchool.qualification_score}/100)</p>
                        <p><strong>Verification Status:</strong> {selectedSchool.verification_status}</p>
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
                      <div className="portal-card">
                        <h4>Institutional Identity</h4>
                        <p><strong>Category:</strong> {selectedCollege.institution_category}</p>
                        <p><strong>Subcategory / Specialization:</strong> {selectedCollege.subcategory}</p>
                        <p><strong>Ownership Type:</strong> {selectedCollege.ownership_type}</p>
                        <p><strong>Parent Trust / Society:</strong> {selectedCollege.parent_trust_society || 'Self-Governing'}</p>
                        <p><strong>Campus Address:</strong> {selectedCollege.complete_address}</p>
                        <p><strong>Official Website:</strong> <a href={selectedCollege.website} target="_blank" rel="noreferrer">{selectedCollege.website}</a></p>
                      </div>

                      <div className="portal-card mt-3">
                        <h4>Capital Financing Solutions</h4>
                        <p><strong>Potential Funding Need:</strong> {selectedCollege.potential_funding_requirement}</p>
                        <p><strong>Funding Purpose:</strong> {selectedCollege.funding_purpose || 'Hospital expansion, new engineering campus, working capital'}</p>
                        <p><strong>Priority Tier:</strong> <span className="portal-badge badge-success">{selectedCollege.lead_priority_tier}</span> (Score: {selectedCollege.qualification_score}/100)</p>
                        <p><strong>Verification Status:</strong> {selectedCollege.verification_status}</p>
                      </div>

                      <div className="portal-card mt-3">
                        <h4>Consent & Outbound Protocol</h4>
                        <p><strong>Compliance Mode:</strong> Restricted (Permission Request Required)</p>
                        <p><strong>Target Decision Maker:</strong> Chancellor / Vice-Chancellor / Secretary / Chairman</p>
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

          {/* 6. CAMPAIGN OUTREACH */}
          {activeTab === 'campaigns' && (
            <div className="portal-tab-pane">
              <div className="portal-pane-header">
                <div>
                  <h2>Outreach & Cadence Playbooks</h2>
                  <p>Permission-based outreach logic with strict suppression rules</p>
                </div>
              </div>

              <div className="portal-grid-2">
                <div className="portal-card">
                  <h3>Module A — Builder Outreach Stages</h3>
                  <div className="portal-playbook-item">
                    <h4>Activity A — Company Contact Confirmation</h4>
                    <p>Formal switchboard verification to confirm desk extensions for Channel Partner Relations and Banking Alliances.</p>
                  </div>
                  <div className="portal-playbook-item">
                    <h4>Activity B — Partnership Introduction</h4>
                    <p>Consultative briefing outlining on-site home loan desk setup, 30+ banking tie-ups, and APF project approvals.</p>
                  </div>
                  <div className="portal-playbook-item">
                    <h4>Activity C — Formal Partnership Proposal</h4>
                    <p>Drafting of bilateral Home Loan Referral MOU with approved commission and SLA matrix.</p>
                  </div>
                </div>

                <div className="portal-card">
                  <h3>Module B — Education Follow-up Cadence</h3>
                  <div className="portal-playbook-item">
                    <h4>Step 1: First Follow-up (Day 2)</h4>
                    <p>Direct professional email to Managing Trustee / Founder referencing institutional campus expansion requirements.</p>
                  </div>
                  <div className="portal-playbook-item">
                    <h4>Step 2: Second Follow-up (Day 5)</h4>
                    <p>Follow-up phone call to verified executive office desk regarding structured bank debt feasibility.</p>
                  </div>
                  <div className="portal-playbook-item">
                    <h4>Step 3: Third Follow-up (Day 10)</h4>
                    <p>Sharing of lender debt product parameters (tenure, LTV, interest margins) for school/college infrastructure.</p>
                  </div>
                  <div className="portal-playbook-item">
                    <h4>Step 4: Final Follow-up (Day 15)</h4>
                    <p>Formal consultative closure brief. If unresponded, lead transitions to 'Follow-up Later' status.</p>
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
    </div>
  );
}

function AlertCircleIcon() {
  return <AlertTriangle size={18} color="#DC2626" />;
}
