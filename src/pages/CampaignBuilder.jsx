import React, { useState, useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import {
  Calendar,
  Layers,
  Send,
  PlusCircle,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  Check,
  RefreshCw,
  FileText
} from 'lucide-react';
import './CampaignBuilder.css';

export default function CampaignBuilder() {
  useSEO({
    title: 'Campaign Automation & Publishing Queue — AVANI LOAN SERVICES',
    description: 'Multi-channel loan campaign orchestrator, 30-day pack generator, and unified publishing queue with regulatory safety gates.'
  });

  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'queue' | 'new'
  const [campaigns, setCampaigns] = useState([]);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Form State for New Campaign
  const [formName, setFormName] = useState('');
  const [formProduct, setFormProduct] = useState('business_loan');
  const [formLanguage, setFormLanguage] = useState('mr');
  const [formDuration, setFormDuration] = useState(30);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/templates/campaigns');
      const data = await res.json();
      if (data.success && Array.isArray(data.campaigns)) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/templates/publishing-queue');
      const data = await res.json();
      if (data.success && Array.isArray(data.queue)) {
        setQueue(data.queue);
      }
    } catch (err) {
      console.error('Failed to load publishing queue:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchQueue();
  }, []);

  const handleGeneratePack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActionSuccess('');
    try {
      const res = await fetch('/api/templates/campaigns/pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: formName || `${formProduct.replace(/_/g, ' ')} ${formLanguage.toUpperCase()} 30-Day Campaign`,
          product: formProduct,
          language: formLanguage,
          durationDays: Number(formDuration) || 30
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Generated Campaign Pack "${data.summary.campaignName}" with ${data.summary.totalPostsScheduled} scheduled multi-channel posts!`);
        fetchCampaigns();
        fetchQueue();
        setActiveTab('campaigns');
      }
    } catch (err) {
      console.error('Campaign pack generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishQueueItem = async (queueId) => {
    try {
      const res = await fetch('/api/templates/publishing-queue/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId, isMetaApproved: false })
      });
      const data = await res.json();
      fetchQueue();
      if (data.success) {
        alert('Publication processed! Item updated.');
      } else {
        alert(`Publishing blocked by safety gate: ${data.errors?.join(', ') || data.error}`);
      }
    } catch (err) {
      console.error('Publish call failed:', err);
    }
  };

  const handleRetryQueueItem = async (queueId) => {
    try {
      await fetch('/api/templates/publishing-queue/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId })
      });
      fetchQueue();
    } catch (err) {
      console.error('Retry call failed:', err);
    }
  };

  return (
    <div className="campaign-builder-container">
      <header className="builder-header">
        <div>
          <h1>Campaign Automation & Publishing</h1>
          <p className="builder-sub">
            Orchestrate multi-channel loan advisory campaigns across WhatsApp, Instagram, LinkedIn, and Facebook.
          </p>
        </div>
        <div className="builder-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <Layers size={16} /> Campaigns ({campaigns.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <Clock size={16} /> Publishing Queue ({queue.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            <PlusCircle size={16} /> New Campaign Pack
          </button>
        </div>
      </header>

      {actionSuccess && (
        <div className="success-banner">
          <CheckCircle size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* TAB 1: CAMPAIGNS LIST */}
      {activeTab === 'campaigns' && (
        <div className="tab-content">
          {campaigns.length === 0 ? (
            <div className="empty-state-box">
              <Sparkles size={36} className="empty-icon" />
              <h3>No Marketing Campaigns Created Yet</h3>
              <p>Launch your first automated 30-day multi-channel campaign pack for WhatsApp, Instagram, and LinkedIn.</p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setActiveTab('new')}
              >
                Create 30-Day Campaign Pack
              </button>
            </div>
          ) : (
            <div className="campaigns-grid">
              {campaigns.map(cmp => (
                <div key={cmp.campaignId} className="campaign-card">
                  <div className="cmp-header">
                    <span className="cmp-status">{cmp.status}</span>
                    <span className="cmp-lang">{cmp.language?.toUpperCase()}</span>
                  </div>
                  <h3>{cmp.name}</h3>
                  <p className="cmp-product">Product: <strong>{cmp.product?.replace(/_/g, ' ')}</strong></p>
                  <p className="cmp-dates">
                    Schedule: {cmp.startDate} to {cmp.endDate}
                  </p>

                  <div className="cmp-stats-row">
                    <div>
                      <span className="stat-label">Scheduled Posts</span>
                      <span className="stat-val">{cmp.calendarEntries?.length || 0}</span>
                    </div>
                    <div>
                      <span className="stat-label">Media Assets</span>
                      <span className="stat-val">{cmp.linkedMediaAssets?.length || 0}</span>
                    </div>
                  </div>

                  <div className="cmp-channels">
                    {cmp.channels?.map(ch => (
                      <span key={ch} className="channel-pill">{ch}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLISHING QUEUE */}
      {activeTab === 'queue' && (
        <div className="tab-content">
          <div className="queue-controls">
            <h2>Unified Publishing Queue</h2>
            <button type="button" className="btn-secondary" onClick={fetchQueue}>
              <RefreshCw size={14} /> Refresh Queue
            </button>
          </div>

          <div className="safety-callout">
            <AlertTriangle size={18} />
            <div>
              <strong>Truth in Publishing & Safety Enforcement:</strong>
              <p>
                Publishing is strictly gated by internal approval, compliance threshold ($\ge 75$), and zero foreign business references.
                WhatsApp broadcasts require Meta WABA approval. Where direct platform APIs are unconfigured, items remain safely in <code>READY_TO_PUBLISH</code> with manual export bundles.
              </p>
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="empty-state-box">
              <p>Publishing queue is currently empty. Generated campaign packs automatically populate this queue.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="queue-table">
                <thead>
                  <tr>
                    <th>Queue ID</th>
                    <th>Channel</th>
                    <th>Product</th>
                    <th>Language</th>
                    <th>Scheduled</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(item => (
                    <tr key={item.queueId}>
                      <td><code>{item.queueId.slice(-10)}</code></td>
                      <td><strong>{item.channel}</strong></td>
                      <td>{item.product?.replace(/_/g, ' ')}</td>
                      <td>{item.language?.toUpperCase()}</td>
                      <td>{item.scheduledTime}</td>
                      <td>
                        <span className={`queue-badge badge-${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.status === 'FAILED' ? (
                          <button
                            type="button"
                            className="btn-retry"
                            onClick={() => handleRetryQueueItem(item.queueId)}
                          >
                            <RotateCcw size={13} /> Retry
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-publish"
                            onClick={() => handlePublishQueueItem(item.queueId)}
                          >
                            <Send size={13} /> Process
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NEW CAMPAIGN PACK BUILDER */}
      {activeTab === 'new' && (
        <div className="tab-content">
          <div className="wizard-card">
            <h2>Generate 30-Day Loan Campaign Pack</h2>
            <p className="wizard-sub">
              Automatically creates 30 posts, 10 image concepts, 10 vertical reels, and WhatsApp sequences customized with platform-native adaptations.
            </p>

            <form onSubmit={handleGeneratePack} className="wizard-form">
              <div className="form-group">
                <label>Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g. Business Loan Diwali Working Capital Drive"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loan Product</label>
                  <select value={formProduct} onChange={e => setFormProduct(e.target.value)}>
                    <option value="business_loan">Business Loan (MSME / SME)</option>
                    <option value="personal_loan">Personal / Salary Loan</option>
                    <option value="doctor_loan">Doctor Loan</option>
                    <option value="home_loan">Home Loan</option>
                    <option value="mortgage_loan">Mortgage Loan / LAP</option>
                    <option value="education_loan_india">Education Loan (India)</option>
                    <option value="education_loan_global">Education Loan (Global)</option>
                    <option value="school_funding">School Funding</option>
                    <option value="college_funding">College Funding</option>
                    <option value="cibil_consultation">CIBIL Consultation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Primary Language</label>
                  <select value={formLanguage} onChange={e => setFormLanguage(e.target.value)}>
                    <option value="mr">Marathi (मराठी)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (Days)</label>
                  <input
                    type="number"
                    min="7"
                    max="60"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="pack-preview-box">
                <h4>What will be generated:</h4>
                <ul>
                  <li>✅ 30 Scheduled posts across LinkedIn, Instagram, Facebook, and WhatsApp</li>
                  <li>✅ 10 Dedicated Image Concepts with aspect ratio formatting</li>
                  <li>✅ 10 Vertical Video Reels with 4-beat scripts (Hook, Problem, Solution, CTA)</li>
                  <li>✅ Platform-native copy tailored for LinkedIn (FOIR/compliance) and Instagram (hooks)</li>
                  <li>✅ Synchronized directly into the 30-Day Content Calendar and Publishing Queue</li>
                </ul>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Generating 30-Day Campaign Pack...' : 'Generate Campaign Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
