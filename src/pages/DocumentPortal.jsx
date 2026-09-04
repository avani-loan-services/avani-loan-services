// src/pages/DocumentPortal.jsx
// ─────────────────────────────────────────────────────────────────
// Customer Document Upload Portal for AVANI LOAN SERVICES
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Upload, CheckCircle2, FileText, AlertCircle, Lock } from 'lucide-react';
import useSEO from '../hooks/useSEO';

export default function DocumentPortal() {
  const { token } = useParams();
  useSEO({ title: 'Secure Document Upload — Avani Loan Services', description: 'Upload your verified loan documents securely.' });

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  useEffect(() => {
    fetchLeadInfo();
  }, [token]);

  const fetchLeadInfo = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/documents/portal/${token}`);
      if (res.data && res.data.success) {
        setLead(res.data.lead);
      } else {
        setError('Invalid or expired document submission link.');
      }
    } catch (err) {
      setError('Could not retrieve lead document requirements. Please check your link.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedCategory) {
      alert('Please select a document category and choose a file to upload.');
      return;
    }

    setUploading(true);
    setUploadSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('category', selectedCategory);
      formData.append('leadId', lead.leadId);

      const res = await axios.post(`/api/documents/portal/${token}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data && res.data.success) {
        setUploadSuccessMsg(`Successfully uploaded ${file.name} for category: ${selectedCategory}`);
        setFile(null);
        setSelectedCategory('');
        fetchLeadInfo(); // Refresh requirements & progress bar
      } else {
        alert(res.data.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('Upload failed. Please ensure file size is under 15MB and format is PDF, PNG, or JPG.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Loading your secure document portal...</h2>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div style={{ maxWidth: '600px', margin: '60px auto', padding: '30px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#dc2626" style={{ margin: '0 auto 15px' }} />
        <h3 style={{ color: '#991b1b' }}>Access Required</h3>
        <p style={{ color: '#b91c1c' }}>{error || 'Unable to authorize access to this document vault.'}</p>
        <Link to="/contact" className="btn btn-primary" style={{ marginTop: '15px' }}>Contact Loan Advisor</Link>
      </div>
    );
  }

  const { isComplete, completenessPercentage, totalRequired, receivedCount, missingDocuments } = lead.evalResult || {};

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Card */}
        <div style={{ background: '#1B3A6B', color: '#fff', padding: '30px', borderRadius: '12px 12px 0 0', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#93C5FD', marginBottom: '8px' }}>
            <Lock size={16} /> SECURE ENCRYPTED UPLOAD PORTAL
          </div>
          <h1 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: '#fff' }}>AVANI LOAN SERVICES</h1>
          <p style={{ margin: 0, opacity: 0.9 }}>Document Submission for <strong>{lead.fullName}</strong></p>

          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div><strong>Lead ID:</strong> <br />{lead.leadId}</div>
            <div><strong>Product:</strong> <br />{lead.loanProduct}</div>
            <div><strong>Status:</strong> <br /><span style={{ background: isComplete ? '#22c55e' : '#eab308', padding: '2px 8px', borderRadius: '10px', color: '#fff', fontSize: '0.75rem' }}>{lead.status}</span></div>
          </div>
        </div>

        {/* Progress Card */}
        <div style={{ background: '#fff', padding: '24px', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#1E293B' }}>Document Progress</h3>
            <span style={{ fontWeight: 'bold', color: isComplete ? '#16a34a' : '#0052CC' }}>{receivedCount} of {totalRequired} Received ({completenessPercentage}%)</span>
          </div>

          <div style={{ background: '#E2E8F0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${completenessPercentage}%`, background: isComplete ? '#16a34a' : '#0052CC', height: '100%', transition: 'width 0.5s ease' }}></div>
          </div>

          {isComplete && (
            <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={24} />
              <div>
                <strong>All Required Documents Uploaded!</strong>
                <div>Our verification team has been notified. Your application is being prepared for bank processing.</div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Form */}
        {!isComplete && (
          <div style={{ background: '#fff', padding: '24px', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', marginTop: '16px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0, color: '#1E293B', marginBottom: '15px' }}>Upload Pending Documents</h3>

            {uploadSuccessMsg && (
              <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '6px', marginBottom: '15px' }}>
                {uploadSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '16px' }}>
                <label className="input-label" style={{ fontWeight: 600 }}>Select Document Category *</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required className="form-input">
                  <option value="">-- Choose Category --</option>
                  {(missingDocuments || []).map((doc, idx) => (
                    <option key={idx} value={doc.id || doc.name}>{doc.name} {doc.mandatory ? '(Mandatory)' : '(Optional)'}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="input-label" style={{ fontWeight: 600 }}>Choose File (PDF, JPG, PNG - Max 15MB) *</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} required className="form-input" />
              </div>

              <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                <Upload size={18} style={{ marginRight: '8px' }} />
                {uploading ? 'Uploading Secure File...' : 'Upload Document'}
              </button>
            </form>
          </div>
        )}

        {/* Checklist */}
        <div style={{ background: '#fff', padding: '24px', borderRadius: '0 0 12px 12px', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', marginTop: '16px' }}>
          <h3 style={{ marginTop: 0, color: '#1E293B' }}>Required Documents Checklist</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(lead.requiredChecklist || []).map((req, idx) => {
              const isReceived = (lead.receivedDocuments || []).some(r => (typeof r === 'string' ? r : r.category || r.docId || r.name).toLowerCase().includes(req.id.toLowerCase()));
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: isReceived ? '#F0FDF4' : '#F8FAFC', borderRadius: '8px', border: `1px solid ${isReceived ? '#BBF7D0' : '#E2E8F0'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={18} color={isReceived ? '#16A34A' : '#64748B'} />
                    <span style={{ fontWeight: 500, color: isReceived ? '#166534' : '#334155' }}>{req.name}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', background: isReceived ? '#DCFCE7' : '#FEF3C7', color: isReceived ? '#15803D' : '#D97706' }}>
                    {isReceived ? '✓ Received' : '○ Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginTop: '20px' }}>
            <ShieldCheck size={16} color="#0052CC" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Your files are stored securely. AVANI LOAN SERVICES will perform human verification prior to bank submission.
          </p>
        </div>

      </div>
    </div>
  );
}
