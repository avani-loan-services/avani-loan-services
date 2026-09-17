import React, { useState, useEffect } from 'react';
import useSEO from '../hooks/useSEO';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Search,
  Sparkles,
  CheckCircle,
  XCircle,
  Eye,
  Copy,
  Check,
  RefreshCw,
  Play
} from 'lucide-react';
import './AssetLibrary.css';

export default function AssetLibrary() {
  useSEO({
    title: 'Media Asset Library — AVANI LOAN SERVICES',
    description: 'Centralized media repository featuring authentic marketing images, video reels, and product compliance classification.'
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
    const reason = prompt('Reason for revision:') || 'Needs creative revision';
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

    if (filterProduct !== 'ALL') {
      if (filterProduct === 'education') {
        if (a.product !== 'education_loan_india' && a.product !== 'education_loan_global') return false;
      } else if (a.product !== filterProduct) {
        return false;
      }
    }

    if (filterStatus !== 'ALL' && a.status !== filterStatus) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (a.title && a.title.toLowerCase().includes(q)) ||
                    (a.headline && a.headline.toLowerCase().includes(q)) ||
                    (a.prompt && a.prompt.toLowerCase().includes(q)) ||
                    (a.product && a.product.toLowerCase().includes(q));
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
            Curated brand visual assets, marketing creatives, and educational video reels for Avani Loan Services.
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
            placeholder="Search assets, products, concepts..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select value={filterType} onChange={e => setFilterType(e.target.value)} aria-label="Filter Media Type">
            <option value="ALL">ALL MEDIA TYPES</option>
            <option value="IMAGE">IMAGES</option>
            <option value="VIDEO">VIDEOS</option>
          </select>

          <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)} aria-label="Filter Loan Category">
            <option value="ALL">ALL CATEGORIES</option>
            <option value="personal_loan">PERSONAL LOAN</option>
            <option value="business_loan">BUSINESS LOAN</option>
            <option value="doctor_loan">DOCTOR LOAN</option>
            <option value="home_loan">HOME LOAN</option>
            <option value="mortgage_loan">MORTGAGE / LAP</option>
            <option value="education">EDUCATION LOAN</option>
            <option value="school_funding">SCHOOL FUNDING</option>
            <option value="college_funding">COLLEGE FUNDING</option>
            <option value="ca_loan">CA PROFESSIONAL</option>
            <option value="cibil_consultation">CIBIL / CREDIT</option>
          </select>

          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} aria-label="Filter Approval Status">
            <option value="ALL">ALL STATUSES</option>
            <option value="APPROVED_INTERNAL">APPROVED</option>
            <option value="IMPORTED">IMPORTED</option>
            <option value="REVIEW_REQUIRED">REVIEW REQUIRED</option>
          </select>
        </div>
      </div>

      {/* Asset Grid */}
      {loading ? (
        <div className="library-loading">
          <div className="spinner"></div>
          <p>Loading media asset library...</p>
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
            const mediaUrl = asset.publicUrl || asset.thumbnailUrl;

            return (
              <div key={asset.id} className="asset-card">
                {/* Media Preview Window */}
                <div className="asset-media-preview" style={{ background: '#0f172a', borderRadius: '8px 8px 0 0', overflow: 'hidden', position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isImage ? (
                    <img
                      src={mediaUrl}
                      alt={asset.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/avani_cibil_banner.png';
                      }}
                    />
                  ) : (
                    <video
                      src={asset.publicUrl}
                      poster={asset.thumbnailUrl || '/assets/avani_cibil_banner.png'}
                      controls
                      preload="none"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}

                  <span className={`asset-type-badge ${isImage ? 'badge-img' : 'badge-vid'}`} style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    {isImage ? <ImageIcon size={14} /> : <VideoIcon size={14} />}
                    {isImage ? 'IMAGE' : 'VIDEO'}
                  </span>
                </div>

                <div className="asset-card-body" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className="meta-tag" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700' }}>
                      {asset.product ? asset.product.replace(/_/g, ' ') : 'General Brand'}
                    </span>
                    <span className="meta-score" style={{ fontSize: '0.8rem' }}>
                      <Sparkles size={12} /> {asset.qualityScore}/100
                    </span>
                  </div>

                  <h3 className="asset-title" style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 6px 0', color: '#0f274a', lineHeight: '1.3' }}>
                    {asset.title}
                  </h3>

                  {asset.caption && (
                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                      {asset.caption.length > 90 ? `${asset.caption.slice(0, 90)}...` : asset.caption}
                    </p>
                  )}
                </div>

                <div className="asset-card-actions" style={{ padding: '0 16px 16px 16px' }}>
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
                    onClick={() => handleCopy(asset.publicUrl || asset.prompt, asset.id)}
                    title="Copy URL"
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
          <div className="asset-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2>{selectedAsset.title}</h2>
              <button type="button" className="btn-close-modal" onClick={() => setPreviewModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {/* Media Player In Modal */}
              <div style={{ background: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', textAlign: 'center' }}>
                {selectedAsset.type === 'IMAGE' ? (
                  <img
                    src={selectedAsset.publicUrl || selectedAsset.thumbnailUrl}
                    alt={selectedAsset.title}
                    style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }}
                  />
                ) : (
                  <video
                    src={selectedAsset.publicUrl}
                    poster={selectedAsset.thumbnailUrl || '/assets/avani_cibil_banner.png'}
                    controls
                    autoPlay={false}
                    style={{ width: '100%', maxHeight: '360px' }}
                  />
                )}
              </div>

              <div className="modal-meta-grid">
                <div><strong>Asset ID:</strong> <code>{selectedAsset.id}</code></div>
                <div><strong>Product:</strong> {selectedAsset.product ? selectedAsset.product.replace(/_/g, ' ') : 'General'}</div>
                <div><strong>Format:</strong> {selectedAsset.format} ({selectedAsset.width}x{selectedAsset.height})</div>
                <div><strong>Channel:</strong> {selectedAsset.channel || 'WEBSITE'}</div>
                <div><strong>Language:</strong> {selectedAsset.language || 'en'}</div>
                <div><strong>Status:</strong> {selectedAsset.status}</div>
                <div><strong>Quality Score:</strong> {selectedAsset.qualityScore}/100</div>
                <div><strong>Mime:</strong> {selectedAsset.mimeType || 'media'}</div>
              </div>

              {selectedAsset.caption && (
                <div className="modal-section" style={{ marginTop: '16px' }}>
                  <h4>Description & Narrative</h4>
                  <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
                    {selectedAsset.caption}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-modal-action btn-copy-full"
                onClick={() => handleCopy(selectedAsset.publicUrl, 'modal')}
              >
                <Copy size={16} /> {copiedId === 'modal' ? 'Copied URL!' : 'Copy Media Link'}
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
