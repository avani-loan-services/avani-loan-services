import React, { useState, useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Copy,
  Search,
  Sparkles,
  AlertCircle,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import './AssetLibrary.css';

export default function AssetLibrary() {
  useSEO({
    title: 'Media Asset Library — AVANI LOAN SERVICES',
    description: 'Centralized media asset repository with compliance scoring, image/video previews, and approval workflows.'
  });

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState('ALL');
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates/assets');
      const data = await res.json();
      if (data.success && Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
    } catch (err) {
      console.error('Failed to fetch media assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleApprove = async (assetId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/templates/assets/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, actor: 'Sachin Shinde' })
      });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => prev.map(a => (a.id === assetId ? data.asset : a)));
        if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset(data.asset);
        }
      }
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (assetId) => {
    const reason = prompt('Reason for rejection / revision:') || 'Needs creative revision';
    setActionLoading(true);
    try {
      const res = await fetch('/api/templates/assets/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, actor: 'Sachin Shinde', reason })
      });
      const data = await res.json();
      if (data.success) {
        setAssets(prev => prev.map(a => (a.id === assetId ? data.asset : a)));
        if (selectedAsset && selectedAsset.id === assetId) {
          setSelectedAsset(data.asset);
        }
      }
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = assets.filter(a => {
    if (filterType !== 'ALL' && a.type !== filterType) return false;
    if (filterProduct !== 'ALL' && a.product !== filterProduct) return false;
    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (a.title && a.title.toLowerCase().includes(q)) ||
                    (a.headline && a.headline.toLowerCase().includes(q)) ||
                    (a.prompt && a.prompt.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="asset-library-container">
      <header className="library-header">
        <div className="header-left">
          <h1>Media Asset Library</h1>
          <p className="header-sub">
            Authoritative visual and video concepts with automated quality scores and approval workflows.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-refresh" onClick={fetchAssets} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </header>

      {/* Filter Toolbar */}
      <div className="library-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search prompts, titles, hooks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="ALL">All Media Types</option>
            <option value="IMAGE">Images (100 Concepts)</option>
            <option value="VIDEO">Videos (300 Concepts)</option>
          </select>

          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}>
            <option value="ALL">All Loan Products</option>
            <option value="personal_loan">Personal Loan</option>
            <option value="business_loan">Business Loan</option>
            <option value="doctor_loan">Doctor Loan</option>
            <option value="home_loan">Home Loan</option>
            <option value="mortgage_loan">Mortgage Loan / LAP</option>
            <option value="education_loan_india">Education Loan (India)</option>
            <option value="education_loan_global">Education Loan (Global)</option>
            <option value="school_funding">School Funding</option>
            <option value="college_funding">College Funding</option>
            <option value="cibil_consultation">CIBIL Consultation</option>
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="READY_FOR_RENDERING">Ready For Rendering</option>
            <option value="GENERATED">Generated</option>
            <option value="APPROVED_INTERNAL">Approved Internal</option>
            <option value="REJECTED_INTERNAL">Rejected Internal</option>
            <option value="READY_TO_PUBLISH">Ready To Publish</option>
          </select>
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Loading media asset inventory...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="empty-state">
          <p>No media assets matched the selected filters.</p>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredAssets.map(asset => {
            const isImage = asset.type === 'IMAGE';
            const isApproved = asset.status === 'APPROVED_INTERNAL';

            return (
              <div key={asset.id} className="asset-card">
                <div className="asset-card-top">
                  <span className={`asset-type-badge ${isImage ? 'badge-img' : 'badge-vid'}`}>
                    {isImage ? <ImageIcon size={14} /> : <VideoIcon size={14} />}
                    {asset.format || '1:1'}
                  </span>

                  <span className={`status-pill pill-${asset.status.toLowerCase().replace(/_/g, '-')}`}>
                    {asset.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="asset-card-body">
                  <h3 className="asset-title">{asset.title}</h3>
                  {asset.headline && <p className="asset-headline">"{asset.headline}"</p>}

                  <div className="asset-meta-row">
                    <span className="meta-tag">{asset.product.replace(/_/g, ' ')}</span>
                    <span className="meta-tag">{asset.channel}</span>
                    <span className="meta-score">
                      <Sparkles size={12} /> {asset.qualityScore}/100
                    </span>
                  </div>

                  {isImage ? (
                    <div className="asset-prompt-preview">
                      <strong>Visual Prompt:</strong> {asset.prompt.slice(0, 120)}...
                    </div>
                  ) : (
                    <div className="asset-script-preview">
                      <strong>Script Hook:</strong> {asset.headline || (asset.script?.beats?.hook || 'Video Hook')}
                    </div>
                  )}
                </div>

                <div className="asset-card-actions">
                  <button
                    type="button"
                    className="btn-preview"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setPreviewModal(true);
                    }}
                  >
                    <Eye size={15} /> Details
                  </button>

                  <button
                    type="button"
                    className="btn-copy"
                    onClick={() => handleCopy(isImage ? asset.prompt : JSON.stringify(asset.script, null, 2), asset.id)}
                    title="Copy specification to clipboard"
                  >
                    {copiedId === asset.id ? <Check size={15} /> : <Copy size={15} />}
                  </button>

                  {!isApproved ? (
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => handleApprove(asset.id)}
                      disabled={actionLoading}
                      title="Approve internally"
                    >
                      <CheckCircle size={15} /> Approve
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => handleReject(asset.id)}
                      disabled={actionLoading}
                      title="Request revision"
                    >
                      <XCircle size={15} /> Revise
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Preview Modal */}
      {previewModal && selectedAsset && (
        <div className="asset-modal-overlay" onClick={() => setPreviewModal(false)}>
          <div className="asset-modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedAsset.title}</h2>
              <button type="button" className="btn-close-modal" onClick={() => setPreviewModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-meta-grid">
                <div><strong>Asset ID:</strong> <code>{selectedAsset.id}</code></div>
                <div><strong>Product:</strong> {selectedAsset.product.replace(/_/g, ' ')}</div>
                <div><strong>Format:</strong> {selectedAsset.format} ({selectedAsset.width}x{selectedAsset.height})</div>
                <div><strong>Channel:</strong> {selectedAsset.channel}</div>
                <div><strong>Language:</strong> {selectedAsset.language}</div>
                <div><strong>Status:</strong> {selectedAsset.status}</div>
                <div><strong>Quality Score:</strong> {selectedAsset.qualityScore}/100</div>
                <div><strong>Storage Provider:</strong> {selectedAsset.storageProvider}</div>
              </div>

              {selectedAsset.type === 'IMAGE' ? (
                <div className="modal-section">
                  <h4>Image Generation Specification</h4>
                  <div className="code-block">{selectedAsset.prompt}</div>
                  <p className="note-text">
                    Brand: AVANI LOAN SERVICES • Founder: Sachin Shinde • Watermark: +91 91756 35165 • Web: avanifinserv.com
                  </p>
                </div>
              ) : (
                <div className="modal-section">
                  <h4>Video Storyboard & Beats</h4>
                  {selectedAsset.script?.beats ? (
                    <div className="video-beats-list">
                      <div><strong>1. Hook (0-3s):</strong> {selectedAsset.script.beats.hook}</div>
                      <div><strong>2. Problem (3-8s):</strong> {selectedAsset.script.beats.problem}</div>
                      <div><strong>3. Solution (8-15s):</strong> {selectedAsset.script.beats.solution}</div>
                      <div><strong>4. CTA (15-20s):</strong> {selectedAsset.script.beats.cta}</div>
                      {selectedAsset.script.broll && <div><strong>B-Roll:</strong> {selectedAsset.script.broll}</div>}
                    </div>
                  ) : (
                    <div className="code-block">{JSON.stringify(selectedAsset.script, null, 2)}</div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-action btn-copy-full"
                onClick={() => handleCopy(selectedAsset.prompt || JSON.stringify(selectedAsset.script), 'modal')}
              >
                <Copy size={16} /> {copiedId === 'modal' ? 'Copied!' : 'Copy Full Spec'}
              </button>
              {selectedAsset.status !== 'APPROVED_INTERNAL' ? (
                <button
                  type="button"
                  className="btn-modal-action btn-approve"
                  onClick={() => handleApprove(selectedAsset.id)}
                  disabled={actionLoading}
                >
                  <CheckCircle size={16} /> Approve Asset
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-modal-action btn-reject"
                  onClick={() => handleReject(selectedAsset.id)}
                  disabled={actionLoading}
                >
                  <XCircle size={16} /> Request Revision
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
