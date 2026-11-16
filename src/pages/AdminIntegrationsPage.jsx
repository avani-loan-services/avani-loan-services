import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function AdminIntegrationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/portal/integrations', { credentials: 'include' });
      if (res.status === 401) {
        setError('Authentication required. Please log in via /admin/login to view ecosystem integrations.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || 'Unable to load integrations.');
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err.message || 'Network error loading integrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTest = async (providerId) => {
    setNotice('');
    const res = await fetch(`/api/portal/integrations/${providerId}/test-connection`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({})
    });
    const json = await res.json().catch(() => ({}));
    setNotice(json.message || (res.ok ? 'Connection test completed.' : 'Permission denied or failed.'));
    loadData();
  };

  const handleToggle = async (providerId, enabled) => {
    setNotice('');
    const res = await fetch(`/api/portal/integrations/${providerId}/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ enabled })
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setNotice(json.message || 'Action requires Administrator privileges.');
      return;
    }
    loadData();
  };

  return (
    <div style={{ maxWidth: 1240, margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>AVANI Unified Ecosystem Control Centre</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#4b5563' }}>
            Core API, AVANI AI CRM, Loan Agents, Calling Agent, Providers, Workflows &amp; DLQ ({data?.mode || 'mock'} mode)
          </p>
        </div>
        <Link to="/admin/dashboard" style={{ padding: '0.5rem 1rem', background: '#111827', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>
          Back to Admin Dashboard
        </Link>
      </div>

      {notice && <div style={{ padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6, marginBottom: '1rem' }}>{notice}</div>}
      {loading && <p>Loading ecosystem integrations...</p>}
      {error && <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6 }}>{error}</div>}

      {data && (
        <>
          <h2>Ecosystem Services &amp; Provider Adapters ({data.providers?.length || 0})</h2>
          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '0.55rem' }}>Service</th>
                  <th style={{ padding: '0.55rem' }}>Project Ownership</th>
                  <th style={{ padding: '0.55rem' }}>Category</th>
                  <th style={{ padding: '0.55rem' }}>Status</th>
                  <th style={{ padding: '0.55rem' }}>Mode</th>
                  <th style={{ padding: '0.55rem' }}>Credentials</th>
                  <th style={{ padding: '0.55rem' }}>Health / Webhook</th>
                  <th style={{ padding: '0.55rem' }}>Errors / Retries</th>
                  <th style={{ padding: '0.55rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data.providers || []).map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.55rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.55rem' }}>{p.ownerProject}</td>
                    <td style={{ padding: '0.55rem' }}>{p.category}</td>
                    <td style={{ padding: '0.55rem' }}>{p.status}</td>
                    <td style={{ padding: '0.55rem' }}>{p.mode}</td>
                    <td style={{ padding: '0.55rem' }}>{p.credentialsConfigured ? 'Configured' : 'Missing'}</td>
                    <td style={{ padding: '0.55rem' }}><code>{p.healthEndpoint || p.webhook || 'N/A'}</code></td>
                    <td style={{ padding: '0.55rem' }}>{p.errorCount} / {p.retryCount}</td>
                    <td style={{ padding: '0.55rem', display: 'flex', gap: '0.4rem' }}>
                      <button type="button" onClick={() => handleTest(p.id)}>Test</button>
                      <button type="button" onClick={() => handleToggle(p.id, !p.enabled)}>
                        {p.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Unified Automation Workflows ({data.workflows?.length || 0})</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                  <th style={{ padding: '0.55rem' }}>ID</th>
                  <th style={{ padding: '0.55rem' }}>Version</th>
                  <th style={{ padding: '0.55rem' }}>Workflow</th>
                  <th style={{ padding: '0.55rem' }}>Trigger</th>
                  <th style={{ padding: '0.55rem' }}>Owner</th>
                  <th style={{ padding: '0.55rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.workflows || []).map(w => (
                  <tr key={w.workflowId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.55rem' }}><code>{w.workflowId}</code></td>
                    <td style={{ padding: '0.55rem' }}>{w.version}</td>
                    <td style={{ padding: '0.55rem' }}>{w.name}</td>
                    <td style={{ padding: '0.55rem' }}><code>{w.trigger}</code></td>
                    <td style={{ padding: '0.55rem' }}>{w.owner}</td>
                    <td style={{ padding: '0.55rem' }}>{w.enabled ? 'ENABLED' : 'PAUSED'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
