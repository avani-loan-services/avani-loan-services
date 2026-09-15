import React, { useState, useEffect, useCallback } from 'react';
import './TemplateDashboard.css';

export default function TemplateDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Modal / Preview State
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [scannerText, setScannerText] = useState('');
  const [scannerResult, setScannerResult] = useState(null);

  const showMessage = (text, type = 'info') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 6000);
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [resStats, resProds, resLogs] = await Promise.all([
        fetch('/api/templates/stats').then(r => r.json()),
        fetch('/api/templates/products').then(r => r.json()),
        fetch('/api/templates/audit').then(r => r.json())
      ]);

      if (resStats.success) setStats(resStats.stats);
      if (resProds.success) setProducts(resProds.products);
      if (resLogs.success) setAuditLogs(resLogs.logs || []);
    } catch (err) {
      showMessage(`Error loading initial data: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedProduct !== 'ALL') params.append('product', selectedProduct);
      if (selectedChannel !== 'ALL') params.append('channel', selectedChannel);
      if (selectedLanguage !== 'ALL') params.append('language', selectedLanguage);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('limit', '200');

      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTemplates(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, [selectedProduct, selectedChannel, selectedLanguage, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleGenerateAll = async () => {
    if (!window.confirm('Generate templates for all 10 products across WhatsApp, Social, Images, and Video Scripts?')) return;
    setLoading(true);
    showMessage('Generating comprehensive template libraries for all 10 products...', 'info');
    try {
      const res = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'ALL' })
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`Successfully generated ${data.summary.totalGenerated} templates across all 10 products!`, 'success');
        await fetchInitialData();
        await fetchTemplates();
      } else {
        showMessage(`Generation failed: ${data.error}`, 'error');
      }
    } catch (err) {
      showMessage(`Network error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProduct = async (productId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (data.success) {
        showMessage(`Generated ${data.count} templates for ${productId}!`, 'success');
        await fetchInitialData();
        await fetchTemplates();
      } else {
        showMessage(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      showMessage(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncMeta = async () => {
    setLoading(true);
    showMessage('Syncing live template statuses directly from Meta Graph API...', 'info');
    try {
      const res = await fetch('/api/templates/meta/sync');
      const data = await res.json();
      if (data.success) {
        showMessage(`Meta sync complete! Fetched ${data.totalOnMeta} templates from WABA. Matched & updated ${data.matchedAndUpdated} in local registry.`, 'success');
        await fetchInitialData();
        await fetchTemplates();
      } else {
        showMessage(`Meta sync warning: ${data.error}`, 'error');
      }
    } catch (err) {
      showMessage(`Meta sync error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMeta = async (templateId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${templateId}/submit-meta`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMessage(`Template submitted to Meta WABA! Status: ${data.metaStatus} (ID: ${data.metaTemplateId})`, 'success');
        await fetchTemplates();
        await fetchInitialData();
      } else {
        showMessage(`Meta submission failed: ${data.error || data.reason}`, 'error');
      }
    } catch (err) {
      showMessage(`Submission error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAiSensy = async (templateId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/templates/${templateId}/publish-aisensy`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showMessage(`Linked to AiSensy Campaign: ${data.aisensyCampaignName}`, 'success');
        await fetchTemplates();
        await fetchInitialData();
      } else {
        showMessage(`AiSensy error: ${data.error || data.reason}`, 'error');
      }
    } catch (err) {
      showMessage(`Publishing error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunScanner = () => {
    if (!scannerText.trim()) return;
    const lower = scannerText.toLowerCase();
    const agroTerms = ['avani agro', 'agro', 'moringa', 'spices', 'ingredients', 'export', 'bulk buyers', 'private label'];
    const claimTerms = ['100% approval', 'guaranteed approval', 'guaranteed sanction', 'instant guaranteed loan', 'increase cibil by'];

    const detectedAgro = agroTerms.filter(t => lower.includes(t));
    const detectedClaims = claimTerms.filter(t => lower.includes(t));

    setScannerResult({
      isClean: detectedAgro.length === 0 && detectedClaims.length === 0,
      detectedAgro,
      detectedClaims,
      charCount: scannerText.length,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const renderWhatsAppPreview = (t) => {
    return (
      <div className="wa-phone-container">
        <div className="wa-chat-header">
          <div className="wa-avatar">A</div>
          <div className="wa-header-info">
            <div className="wa-header-title">AVANI LOAN SERVICES</div>
            <div className="wa-header-sub">Official WhatsApp Business Account</div>
          </div>
        </div>
        <div className="wa-chat-body">
          <div className="wa-bubble">
            {t.headline && <div className="wa-bubble-header">{t.headline}</div>}
            <div className="wa-bubble-text">{t.body}</div>
            {t.footer && <div className="wa-bubble-footer">{t.footer}</div>}
            <div className="wa-bubble-meta">
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="wa-ticks">✓✓</span>
            </div>
          </div>
          {Array.isArray(t.cta) && t.cta.length > 0 && (
            <div className="wa-bubble-buttons">
              {t.cta.map((btn, i) => (
                <div key={i} className="wa-button-pill">
                  {typeof btn === 'string' ? btn : (btn.text || 'Action')}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="template-engine-container">
      {/* Top Banner */}
      <header className="engine-header">
        <div className="header-left">
          <span className="tenant-badge">TENANT: AVANI LOAN SERVICES</span>
          <h1>Productwise Content Template Engine</h1>
          <p className="header-sub">
            Sachin Shinde | 10 Distinct Loan Product Libraries | Meta WABA & AiSensy Automated Publishing
          </p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleSyncMeta} disabled={loading}>
            🔄 Sync Meta WABA
          </button>
          <button className="btn-primary" onClick={handleGenerateAll} disabled={loading}>
            ⚡ Generate All (10 Products)
          </button>
          <a href="/api/templates/export" className="btn-outline" download>
            📥 Export JSON
          </a>
        </div>
      </header>

      {/* Action Notification */}
      {actionMessage.text && (
        <div className={`notification-toast ${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="engine-nav">
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'products', label: '💼 10 Loan Products' },
          { id: 'templates', label: '📝 All Templates' },
          { id: 'whatsapp', label: '💬 WhatsApp Manager' },
          { id: 'social', label: '📱 Social Media (FB/IG/LI)' },
          { id: 'images', label: '🎨 Image Prompts' },
          { id: 'videos', label: '🎬 Video & Reel Scripts' },
          { id: 'approvals', label: '🛡️ Meta & AiSensy Approvals' },
          { id: 'scanner', label: '🔍 Agro Contamination Scanner' },
          { id: 'audit', label: '📋 Forensic Audit Log' }
        ].map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="engine-main">
        {/* ── TAB 1: DASHBOARD / OVERVIEW ── */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <span className="stat-label">Total Templates</span>
              <span className="stat-number">{stats ? stats.totalTemplates : '...'}</span>
              <span className="stat-sub">Across 10 Products</span>
            </div>
            <div className="stat-card stat-success">
              <span className="stat-label">Meta WABA Approved</span>
              <span className="stat-number">{stats ? stats.metaApproved : '...'}</span>
              <span className="stat-sub">Active & Verified on Meta</span>
            </div>
            <div className="stat-card stat-warning">
              <span className="stat-label">Pending Review</span>
              <span className="stat-number">
                {stats ? (stats.byStatus.PENDING + stats.byStatus.SUBMITTED) : '...'}
              </span>
              <span className="stat-sub">Submitted to Meta / AiSensy</span>
            </div>
            <div className="stat-card stat-info">
              <span className="stat-label">AiSensy Ready</span>
              <span className="stat-number">{stats ? stats.aisensyActive : '...'}</span>
              <span className="stat-sub">Campaign Trigger Linked</span>
            </div>

            {/* Architecture Card */}
            <div className="panel-card full-width">
              <h3>Authoritative Production Architecture & Hard Isolation</h3>
              <div className="arch-grid">
                <div className="arch-item">
                  <strong>Business ID:</strong>
                  <code>avani-loan-services</code> (Hard Locked)
                </div>
                <div className="arch-item">
                  <strong>Founder:</strong>
                  <span>Sachin Shinde</span>
                </div>
                <div className="arch-item">
                  <strong>Official WhatsApp:</strong>
                  <code>+91 91756 35165</code>
                </div>
                <div className="arch-item">
                  <strong>Meta WABA ID:</strong>
                  <code>1062614709598311</code> (Verified Live)
                </div>
                <div className="arch-item">
                  <strong>Phone Number ID:</strong>
                  <code>1147494668457940</code>
                </div>
                <div className="arch-item">
                  <strong>AiSensy Project:</strong>
                  <code>6a670f94d0c39f57eaa6799f</code>
                </div>
                <div className="arch-item">
                  <strong>Contamination Guard:</strong>
                  <span className="badge-pass">AGRO FOODS CONTAMINATION SCANNER ACTIVE</span>
                </div>
                <div className="arch-item">
                  <strong>Compliance Guard:</strong>
                  <span className="badge-pass">PROHIBITED FINANCIAL CLAIMS FILTER ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Products Quick Matrix */}
            <div className="panel-card full-width">
              <h3>10 Products Generation Status</h3>
              <div className="product-summary-grid">
                {products.map(p => (
                  <div key={p.id} className="prod-mini-card">
                    <div className="prod-mini-title">{p.name}</div>
                    <div className="prod-mini-count">
                      Templates: <strong>{stats?.byProduct[p.id] || 0}</strong>
                    </div>
                    <button
                      className="btn-xs"
                      onClick={() => handleGenerateProduct(p.id)}
                      disabled={loading}
                    >
                      ⚡ Re-generate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: 10 LOAN PRODUCTS ── */}
        {activeTab === 'products' && (
          <div className="products-view">
            <h2>Productwise Template Libraries</h2>
            <p className="tab-subtitle">
              Each product maintains its own dedicated Awareness, Lead Generation, Follow-up, Conversion, and Retargeting templates.
            </p>
            <div className="product-cards-list">
              {products.map(p => (
                <div key={p.id} className="product-detail-card">
                  <div className="card-top">
                    <span className="product-code-badge">{p.code}</span>
                    <h3>{p.name}</h3>
                    <span className="category-tag">{p.category}</span>
                  </div>
                  <div className="card-body-details">
                    <p><strong>Target Audiences:</strong> {p.targetAudience.join(', ')}</p>
                    <p><strong>Primary Topics:</strong> {p.topics.slice(0, 3).join(' • ')}...</p>
                    <p><strong>Compliance Disclaimer:</strong> <em>"{p.primaryCompliantDisclaimer}"</em></p>
                  </div>
                  <div className="card-footer-actions">
                    <button
                      className="btn-primary-sm"
                      onClick={() => {
                        setSelectedProduct(p.id);
                        setActiveTab('templates');
                      }}
                    >
                      📂 View Templates ({stats?.byProduct[p.id] || 0})
                    </button>
                    <button
                      className="btn-outline-sm"
                      onClick={() => handleGenerateProduct(p.id)}
                      disabled={loading}
                    >
                      ⚡ Generate Library
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: ALL TEMPLATES ── */}
        {(activeTab === 'templates' || activeTab === 'whatsapp' || activeTab === 'social' || activeTab === 'images' || activeTab === 'videos') && (
          <div className="templates-view">
            {/* Filter Bar */}
            <div className="filters-bar">
              <div className="filter-item search-box">
                <input
                  type="text"
                  placeholder="Search templates by name, headline, body..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filter-item">
                <label>Product:</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                  <option value="ALL">All 10 Products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="filter-item">
                <label>Channel:</label>
                <select
                  value={activeTab === 'whatsapp' ? 'WHATSAPP' : (activeTab === 'social' ? 'FACEBOOK' : selectedChannel)}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                >
                  <option value="ALL">All Channels</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="WHATSAPP_STATUS">WhatsApp Status</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Language:</label>
                <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                  <option value="ALL">All Languages</option>
                  <option value="en">English (en)</option>
                  <option value="mr">Marathi (mr)</option>
                  <option value="hi">Hindi (hi)</option>
                </select>
              </div>
              <div className="filter-item">
                <label>Status:</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="VALIDATED">Validated</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Templates List */}
            <div className="templates-count-banner">
              Showing <strong>{templates.length}</strong> templates
            </div>

            <div className="template-cards-grid">
              {templates.length === 0 ? (
                <div className="empty-state">
                  <p>No templates found matching your filters.</p>
                  <button className="btn-primary" onClick={handleGenerateAll} disabled={loading}>
                    Generate All Templates Now
                  </button>
                </div>
              ) : (
                templates.map(t => (
                  <div key={t.templateId} className="template-card">
                    <div className="t-card-header">
                      <span className={`channel-badge badge-${t.channel.toLowerCase()}`}>{t.channel}</span>
                      <span className="lang-badge">{t.language.toUpperCase()}</span>
                      <span className={`status-badge badge-${t.status.toLowerCase()}`}>{t.status}</span>
                    </div>

                    <h4 className="t-card-title">{t.headline || t.templateName}</h4>
                    <p className="t-card-id"><code>{t.templateId}</code></p>

                    <div className="t-card-body">
                      {t.body.substring(0, 180)}...
                    </div>

                    {t.channel === 'WHATSAPP' && (
                      <div className="meta-sync-info">
                        <span>Meta Status: <strong>{t.metaStatus || 'DRAFT'}</strong></span>
                        {t.metaTemplateId && <span>ID: <code>{t.metaTemplateId}</code></span>}
                      </div>
                    )}

                    <div className="t-card-actions">
                      <button className="btn-xs btn-outline" onClick={() => setPreviewTemplate(t)}>
                        👁️ Preview
                      </button>
                      {t.channel === 'WHATSAPP' && (
                        <>
                          <button
                            className="btn-xs btn-primary"
                            onClick={() => handleSubmitMeta(t.templateId)}
                            disabled={loading}
                          >
                            🚀 Submit Meta
                          </button>
                          <button
                            className="btn-xs btn-secondary"
                            onClick={() => handlePublishAiSensy(t.templateId)}
                            disabled={loading}
                          >
                            🔗 Link AiSensy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── TAB 8: APPROVALS & PUBLISHING ── */}
        {activeTab === 'approvals' && (
          <div className="approvals-view">
            <h2>Meta WhatsApp & AiSensy Approvals Central</h2>
            <p className="tab-subtitle">
              Live synchronization with Meta WhatsApp Business Account (WABA: 1062614709598311).
            </p>
            <div className="sync-banner">
              <div>
                <strong>Meta WABA Infrastructure:</strong> Connected & Active.
              </div>
              <button className="btn-primary" onClick={handleSyncMeta} disabled={loading}>
                🔄 Sync All Live Statuses from Meta
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Language</th>
                    <th>Meta Status</th>
                    <th>Meta Template ID</th>
                    <th>AiSensy Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.filter(t => t.channel === 'WHATSAPP').map(t => (
                    <tr key={t.templateId}>
                      <td><strong>{t.templateName}</strong></td>
                      <td>{t.product}</td>
                      <td><span className="badge-tag">{t.metaCategory || 'MARKETING'}</span></td>
                      <td>{t.language.toUpperCase()}</td>
                      <td>
                        <span className={`status-pill pill-${(t.metaStatus || 'DRAFT').toLowerCase()}`}>
                          {t.metaStatus || 'DRAFT'}
                        </span>
                      </td>
                      <td><code>{t.metaTemplateId || '—'}</code></td>
                      <td>
                        <span className={`status-pill pill-${(t.aisensyStatus || 'UNPUBLISHED').toLowerCase()}`}>
                          {t.aisensyStatus || 'UNPUBLISHED'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-xs"
                          onClick={() => handleSubmitMeta(t.templateId)}
                          disabled={loading}
                        >
                          Submit Meta
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 9: SCANNER ── */}
        {activeTab === 'scanner' && (
          <div className="scanner-view">
            <h2>Agro Foods Contamination & Financial Claim Scanner</h2>
            <p className="tab-subtitle">
              Strict isolation firewall. Test any marketing draft or prompt to ensure zero contamination with AVANI AGRO FOODS and verify compliance with RBI/DSA loan guidelines.
            </p>

            <div className="scanner-form">
              <textarea
                rows="6"
                placeholder="Paste marketing copy, image prompt, or customer message here to verify compliance..."
                value={scannerText}
                onChange={(e) => setScannerText(e.target.value)}
              />
              <button className="btn-primary" onClick={handleRunScanner}>
                🛡️ Scan for Contamination & Compliance
              </button>
            </div>

            {scannerResult && (
              <div className={`scan-results-box ${scannerResult.isClean ? 'box-pass' : 'box-fail'}`}>
                <h3>
                  {scannerResult.isClean ? '✅ PASSED — CLEAN FOR AVANI LOAN SERVICES' : '❌ FAILED — VIOLATIONS DETECTED'}
                </h3>
                <p>Checked at {scannerResult.timestamp} | {scannerResult.charCount} characters</p>

                {scannerResult.detectedAgro.length > 0 && (
                  <div className="violation-list">
                    <strong>🚫 Agro Foods Contamination Terms Detected:</strong>
                    <ul>
                      {scannerResult.detectedAgro.map((term, i) => (
                        <li key={i}>Prohibited term: <code>"{term}"</code></li>
                      ))}
                    </ul>
                  </div>
                )}

                {scannerResult.detectedClaims.length > 0 && (
                  <div className="violation-list">
                    <strong>⚠️ Prohibited Misleading Financial Claims Detected:</strong>
                    <ul>
                      {scannerResult.detectedClaims.map((term, i) => (
                        <li key={i}>Non-compliant claim: <code>"{term}"</code></li>
                      ))}
                    </ul>
                  </div>
                )}

                {scannerResult.isClean && (
                  <p className="clean-msg">
                    No Agro Foods references or prohibited financial guarantees found. Copy strictly adheres to Avani Loan Services tenant standards.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 10: AUDIT LOG ── */}
        {activeTab === 'audit' && (
          <div className="audit-view">
            <h2>Forensic Audit Trail</h2>
            <p className="tab-subtitle">Every template action, generation, and external API submission is recorded idempotently.</p>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User / Engine</th>
                    <th>Action</th>
                    <th>Product</th>
                    <th>Channel</th>
                    <th>External Platform</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log, idx) => (
                    <tr key={idx}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td><code>{log.who}</code></td>
                      <td>{log.action}</td>
                      <td>{log.product}</td>
                      <td>{log.channel}</td>
                      <td>{log.externalPlatform}</td>
                      <td>
                        <span className={`status-pill pill-${log.result.toLowerCase()}`}>
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── PREVIEW MODAL ── */}
      {previewTemplate && (
        <div className="modal-backdrop" onClick={() => setPreviewTemplate(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preview: {previewTemplate.templateName}</h3>
              <button className="modal-close" onClick={() => setPreviewTemplate(null)}>✕</button>
            </div>
            <div className="modal-body">
              {previewTemplate.channel === 'WHATSAPP' ? (
                renderWhatsAppPreview(previewTemplate)
              ) : previewTemplate.contentType === 'IMAGE_PROMPT' ? (
                <div className="image-prompt-preview">
                  <div className="mockup-artboard">
                    <div className="artboard-brand">AVANI LOAN SERVICES</div>
                    <div className="artboard-title">{previewTemplate.imagePrompt?.product || previewTemplate.headline}</div>
                    <div className="artboard-visual-desc">
                      [Scene: {previewTemplate.imagePrompt?.scene}]
                    </div>
                    <div className="artboard-footer">
                      <span>📞 +91 91756 35165</span>
                      <span>🌐 avanifinserv.com</span>
                    </div>
                  </div>
                  <div className="prompt-details">
                    <h4>Structured Image Generation Prompt:</h4>
                    <pre>{JSON.stringify(previewTemplate.imagePrompt, null, 2)}</pre>
                  </div>
                </div>
              ) : previewTemplate.contentType === 'VIDEO_SCRIPT' ? (
                <div className="video-script-preview">
                  <h4>Storyboard: {previewTemplate.headline}</h4>
                  <div className="storyboard-step">
                    <strong>0–3s Hook:</strong> {previewTemplate.videoScript?.hook}
                  </div>
                  <div className="storyboard-step">
                    <strong>3–10s Problem:</strong> {previewTemplate.videoScript?.problem}
                  </div>
                  <div className="storyboard-step">
                    <strong>10–25s Explanation:</strong> {previewTemplate.videoScript?.explanation}
                  </div>
                  <div className="storyboard-step">
                    <strong>25–35s Avani Guidance:</strong> Professional advisory by Sachin Shinde in Latur.
                  </div>
                  <div className="storyboard-step">
                    <strong>35–45s CTA:</strong> {previewTemplate.videoScript?.cta}
                  </div>
                  <div className="broll-box">
                    <strong>B-Roll Direction:</strong> {previewTemplate.videoScript?.bRoll}
                  </div>
                </div>
              ) : (
                <div className="social-card-preview">
                  <div className="social-header">
                    <div className="social-icon">{previewTemplate.channel[0]}</div>
                    <div>
                      <strong>AVANI LOAN SERVICES</strong>
                      <div className="social-meta">Sponsored • Financial Services</div>
                    </div>
                  </div>
                  <div className="social-body">
                    {previewTemplate.body}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
