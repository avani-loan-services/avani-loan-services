import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import vapiService from '../lib/vapiService';
import '../pages/AdminDashboard.css';
import brandLogo from '../assets/avani-brand-logo.png';

const AdminDashboard = () => {
  const { language } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [bulkUpload, setBulkUpload] = useState(null);

  const translations = {
    en: {
      dashboard: 'Admin Dashboard',
      overview: 'Overview',
      leads: 'Leads',
      campaigns: 'Campaigns',
      analytics: 'Analytics',
      settings: 'Settings',
      totalCalls: 'Total Calls',
      successRate: 'Success Rate',
      avgDuration: 'Avg Duration',
      qualifiedLeads: 'Qualified Leads',
      notQualified: 'Not Qualified',
      pending: 'Pending Review',
      leadName: 'Name',
      leadPhone: 'Phone',
      leadType: 'Loan Type',
      leadStatus: 'Status',
      leadScore: 'Score',
      action: 'Action',
      callNow: 'Call Now',
      sendWhatsApp: 'Send WhatsApp',
      scheduleCall: 'Schedule',
      campaignName: 'Campaign Name',
      contactsCount: 'Contacts',
      status: 'Status',
      startDate: 'Start Date',
      endDate: 'End Date',
      uploadContacts: 'Upload Contacts',
      downloadReport: 'Download Report',
      bulkCampaign: 'Create Bulk Campaign',
      selectFile: 'Select CSV File',
      loanType: 'Loan Type',
      uploadNow: 'Upload',
      noData: 'No data available',
      conversions: 'Conversions',
      dropoutRate: 'Dropout Rate',
      averageDuration: 'Average Duration',
      callQuality: 'Call Quality',
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      poor: 'Poor'
    },
    hi: {
      dashboard: 'व्यवस्थापक डैशबोर्ड',
      overview: 'अवलोकन',
      leads: 'लीड',
      campaigns: 'अभियान',
      analytics: 'विश्लेषण',
      settings: 'सेटिंग्स',
      totalCalls: 'कुल कॉल',
      successRate: 'सफलता दर',
      avgDuration: 'औसत अवधि',
      qualifiedLeads: 'योग्य लीड',
      notQualified: 'योग्य नहीं',
      pending: 'समीक्षा के लिए प्रतीक्षा',
      leadName: 'नाम',
      leadPhone: 'फोन',
      leadType: 'लोन प्रकार',
      leadStatus: 'स्थिति',
      leadScore: 'स्कोर',
      action: 'कार्य',
      callNow: 'अभी कॉल करें',
      sendWhatsApp: 'व्हाट्सएप भेजें',
      scheduleCall: 'शेड्यूल करें',
      campaignName: 'अभियान का नाम',
      contactsCount: 'संपर्क',
      status: 'स्थिति',
      startDate: 'प्रारंभ तारीख',
      endDate: 'समाप्ति तारीख',
      uploadContacts: 'संपर्क अपलोड करें',
      downloadReport: 'रिपोर्ट डाउनलोड करें',
      bulkCampaign: 'बल्क अभियान बनाएं',
      selectFile: 'CSV फ़ाइल चुनें',
      loanType: 'लोन प्रकार',
      uploadNow: 'अपलोड करें',
      noData: 'कोई डेटा उपलब्ध नहीं'
    },
    mr: {
      dashboard: 'प्रशासक डॅशबोर्ड',
      overview: 'अवलोकन',
      leads: 'लीड',
      campaigns: 'मोहिम',
      analytics: 'विश्लेषण',
      settings: 'सेटिंग्स',
      totalCalls: 'एकूण कॉल',
      successRate: 'यशस्वी दर',
      avgDuration: 'सरासरी अवधी',
      qualifiedLeads: 'योग्य लीड',
      notQualified: 'योग्य नाही',
      pending: 'पुनरावलोकन प्रतीक्षा',
      leadName: 'नाव',
      leadPhone: 'फोन',
      leadType: 'लोन प्रकार',
      leadStatus: 'स्थिती',
      leadScore: 'स्कोर',
      action: 'क्रिया',
      callNow: 'आता कॉल करा',
      sendWhatsApp: 'व्हाट्सअँप पाठवा',
      scheduleCall: 'शेड्यूल करा',
      campaignName: 'मोहिमेचे नाव',
      contactsCount: 'संपर्क',
      status: 'स्थिती',
      startDate: 'प्रारंभ तारीख',
      endDate: 'समाप्ती तारीख',
      uploadContacts: 'संपर्क अपलोड करा',
      downloadReport: 'रिपोर्ट डाउनलोड करा',
      bulkCampaign: 'बल्क मोहिम तयार करा',
      selectFile: 'CSV फाइल निवडा',
      loanType: 'लोन प्रकार',
      uploadNow: 'अपलोड करा',
      noData: 'कोणताही डेटा उपलब्ध नाही'
    }
  };

  const t = translations[language] || translations.en;

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await vapiService.getDashboardMetrics();
      setMetrics(data);

      // Mock leads data
      setLeads([
        {
          id: 1,
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          loanType: 'Personal Loan',
          status: 'qualified',
          score: 85,
          callDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Priya Singh',
          phone: '+91 87654 32109',
          loanType: 'Home Loan',
          status: 'pending',
          score: 72,
          callDate: '2024-01-14'
        },
        {
          id: 3,
          name: 'Amit Patel',
          phone: '+91 76543 21098',
          loanType: 'Business Loan',
          status: 'qualified',
          score: 92,
          callDate: '2024-01-13'
        },
        {
          id: 4,
          name: 'Dr. Neha Sharma',
          phone: '+91 65432 10987',
          loanType: 'Doctor Loan',
          status: 'not_qualified',
          score: 45,
          callDate: '2024-01-12'
        }
      ]);

      // Mock campaigns data
      setCampaigns([
        {
          id: 1,
          name: 'Personal Loan Campaign Jan 2024',
          contacts: 250,
          status: 'active',
          createdDate: '2024-01-01',
          successRate: 68
        },
        {
          id: 2,
          name: 'Home Loan Campaign',
          contacts: 180,
          status: 'completed',
          createdDate: '2023-12-15',
          successRate: 72
        }
      ]);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
    setLoading(false);
  };

  // Fetch metrics on mount
  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleUploadContacts = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target.result;
        const rows = csv.split('\n').slice(1); // Skip header

        const contacts = rows.map((row, idx) => {
          const [name, phone, email, loanType] = row.split(',');
          return { id: idx, name, phone, email, loanType };
        });

        // Create new campaign
        const newCampaign = {
          id: campaigns.length + 1,
          name: `Campaign - ${selectedLoan}`,
          contacts: contacts.length,
          status: 'created',
          createdDate: new Date().toISOString().split('T')[0],
          successRate: 0
        };

        setCampaigns([...campaigns, newCampaign]);
        alert(`Campaign created with ${contacts.length} contacts!`);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Error processing file');
      }
    };
    reader.readAsText(file);
  };

  const handleSendWhatsApp = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      try {
        await vapiService.sendWhatsAppMessage(
          lead.phone,
          `Hi ${lead.name}! This is a follow-up from Avani Loan Services regarding your ${lead.loanType} inquiry. We have a special offer for you. Call us at +91 9175635165 to know more!`,
          lead.loanType.split(' ')[0].toLowerCase()
        );
        alert('WhatsApp message sent!');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClass = {
      qualified: 'badge-success',
      pending: 'badge-warning',
      not_qualified: 'badge-danger',
      active: 'badge-success',
      completed: 'badge-info',
      created: 'badge-primary'
    };
    return statusClass[status] || 'badge-secondary';
  };

  const renderOverview = () => (
    <div className="dashboard-overview">
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>{t.totalCalls}</h3>
          <p className="metric-value">{metrics?.todayMetrics?.totalCalls || 0}</p>
          <span className="metric-label">Today</span>
        </div>
        <div className="metric-card">
          <h3>{t.successRate}</h3>
          <p className="metric-value">{metrics?.todayMetrics?.conversationSuccessRate?.toFixed(0) || 0}%</p>
          <span className="metric-label">This month</span>
        </div>
        <div className="metric-card">
          <h3>{t.avgDuration}</h3>
          <p className="metric-value">{Math.floor(metrics?.todayMetrics?.averageDuration / 60 || 0)}m</p>
          <span className="metric-label">Average</span>
        </div>
        <div className="metric-card">
          <h3>{t.qualifiedLeads}</h3>
          <p className="metric-value">{leads.filter(l => l.status === 'qualified').length}</p>
          <span className="metric-label">Ready to convert</span>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn btn-primary">
            📞 {t.bulkCampaign}
          </button>
          <button className="action-btn btn-secondary">
            📊 {t.downloadReport}
          </button>
          <button className="action-btn btn-info">
            📧 Send Bulk WhatsApp
          </button>
          <button className="action-btn btn-warning">
            ⚙️ {t.settings}
          </button>
        </div>
      </div>
    </div>
  );

  const renderLeads = () => (
    <div className="dashboard-leads">
      <div className="leads-header">
        <h3>Lead Management</h3>
        <div className="filter-controls">
          <select
            value={selectedLoan}
            onChange={(e) => setSelectedLoan(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Loan Types</option>
            <option value="personal">Personal Loan</option>
            <option value="business">Business Loan</option>
            <option value="home">Home Loan</option>
            <option value="doctor">Doctor Loan</option>
            <option value="education">Education Loan</option>
          </select>
        </div>
      </div>

      {leads.length === 0 ? (
        <p className="no-data">{t.noData}</p>
      ) : (
        <div className="leads-table">
          <table>
            <thead>
              <tr>
                <th>{t.leadName}</th>
                <th>{t.leadPhone}</th>
                <th>{t.leadType}</th>
                <th>{t.leadStatus}</th>
                <th>{t.leadScore}</th>
                <th>{t.action}</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className={`status-${lead.status}`}>
                  <td>{lead.name}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.loanType}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(lead.status)}`}>
                      {lead.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${lead.score}%` }}></div>
                      <span>{lead.score}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-small btn-call" title={t.callNow}>
                        📞
                      </button>
                      <button
                        className="btn-small btn-whatsapp"
                        title={t.sendWhatsApp}
                        onClick={() => handleSendWhatsApp(lead.id)}
                      >
                        💬
                      </button>
                      <button className="btn-small btn-schedule" title={t.scheduleCall}>
                        📅
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCampaigns = () => (
    <div className="dashboard-campaigns">
      <div className="campaigns-header">
        <h3>Active Campaigns</h3>
        <div className="upload-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleUploadContacts}
            className="file-input"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="btn-upload">
            📁 {t.uploadContacts}
          </label>
        </div>
      </div>

      {campaigns.length === 0 ? (
        <p className="no-data">{t.noData}</p>
      ) : (
        <div className="campaigns-list">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign-card">
              <div className="campaign-header">
                <h4>{campaign.name}</h4>
                <span className={`badge ${getStatusBadge(campaign.status)}`}>
                  {campaign.status.toUpperCase()}
                </span>
              </div>
              <div className="campaign-stats">
                <div className="stat">
                  <span className="stat-label">{t.contactsCount}</span>
                  <span className="stat-value">{campaign.contacts}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t.successRate}</span>
                  <span className="stat-value">{campaign.successRate}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">{t.startDate}</span>
                  <span className="stat-value">{campaign.createdDate}</span>
                </div>
              </div>
              <div className="campaign-actions">
                <button className="btn-small btn-primary">View</button>
                <button className="btn-small btn-secondary">Edit</button>
                <button className="btn-small btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="dashboard-analytics">
      <h3>Performance Analytics</h3>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>{t.conversions}</h4>
          <p className="analytics-value">245</p>
          <span className="analytics-trend">↑ 12% from last month</span>
        </div>
        <div className="analytics-card">
          <h4>{t.dropoutRate}</h4>
          <p className="analytics-value">18%</p>
          <span className="analytics-trend">↓ 5% improvement</span>
        </div>
        <div className="analytics-card">
          <h4>{t.averageDuration}</h4>
          <p className="analytics-value">5m 42s</p>
          <span className="analytics-trend">+32s longer</span>
        </div>
        <div className="analytics-card">
          <h4>{t.callQuality}</h4>
          <p className="analytics-value">{t.excellent}</p>
          <span className="analytics-trend">89% {t.excellent} calls</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <div className="page-header-top">
          <img src={brandLogo} alt="Avani Loan Services" className="page-header-logo" />
          <div>
            <h1>🎛️ {t.dashboard}</h1>
            <div className="page-header-address">Old Barshi Road, 5 no Chauk, next to Sai School, KulswaminiNagar, Latur-413531, Maharashtra, India</div>
          </div>
        </div>
        <p>Manage your AI calling campaigns and leads</p>
      </div>

      <div className="dashboard-nav">
        {['overview', 'leads', 'campaigns', 'analytics'].map((tab) => (
          <button
            key={tab}
            className={`nav-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'leads' && renderLeads()}
            {activeTab === 'campaigns' && renderCampaigns()}
            {activeTab === 'analytics' && renderAnalytics()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
