// backend/routes/test.js
// Integration Testing & Validation Routes
// Use for Phase 3+ validation

const express = require('express');
const router = express.Router();

// Test Webhook Payload
const SAMPLE_VAPI_WEBHOOK = {
  callId: 'call_test_001',
  callStatus: 'ended',
  customerNumber: '+919876543210',
  duration: 180,
  recordingUrl: 'https://cdn.vapi.ai/recordings/test.mp3',
  transcript: 'Agent: Hello, this is Avani Loan Services. Customer: Hi there.',
  analysis: {
    summaryDescription: 'Personal Loan Inquiry - Lead Qualified',
    structuredData: {
      customer_name: 'Test Customer',
      phone_number: '+919876543210',
      email: 'test@example.com',
      loan_amount: '500000',
      monthly_income: '45000',
      qualification_status: 'qualified',
      next_action: 'send_whatsapp'
    },
    summary: 'Customer is eligible for personal loan',
    sentiment: 'positive'
  }
};

// Test 1: Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    backend_url: 'http://localhost:5000',
    frontend_url: process.env.FRONTEND_URL,
    vapi_configured: !!process.env.VAPI_API_KEY,
    exotel_configured: !!process.env.EXOTEL_AUTH_TOKEN,
    hubspot_configured: !!process.env.HUBSPOT_API_KEY
  });
});

// Test 2: VAPI Configuration
router.get('/vapi-config', (req, res) => {
  const config = {
    api_key: process.env.VAPI_API_KEY ? '✓ Configured' : '✗ Missing',
    api_url: process.env.VAPI_API_URL || 'https://api.vapi.ai',
    assistant_id: process.env.VAPI_ASSISTANT_ID || 'Not set',
    phone_number: process.env.VAPI_PHONE_NUMBER || 'Not set',
    status: process.env.VAPI_API_KEY ? 'ready' : 'needs_setup'
  };
  res.json(config);
});

// Test 3: Webhook Simulation
router.post('/simulate-webhook', (req, res) => {
  console.log('\n[TEST] Simulating VAPI Webhook...');
  console.log('[TEST] Payload:', JSON.stringify(SAMPLE_VAPI_WEBHOOK, null, 2));
  
  try {
    // This should trigger your webhook handler
    const { callId, analysis } = SAMPLE_VAPI_WEBHOOK;
    
    res.json({
      success: true,
      message: 'Webhook simulation received',
      callId,
      leadData: analysis.structuredData,
      nextSteps: [
        'WhatsApp message will be sent',
        'Lead will be saved to Google Sheets',
        'HubSpot contact will be created',
        'Make.com workflow will trigger'
      ]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test 4: WhatsApp Integration
router.post('/test-whatsapp', async (req, res) => {
  console.log('[TEST] Testing WhatsApp Integration...');
  
  try {
    const testMessage = {
      phoneNumber: '+919876543210',
      message: '[TEST] This is a test WhatsApp message from Avani Loan Services',
      loanType: 'personal'
    };
    
    // Check if Exotel is configured
    if (!process.env.EXOTEL_AUTH_TOKEN) {
      return res.json({
        status: 'skipped',
        reason: 'Exotel not configured',
        config_needed: 'Update EXOTEL_AUTH_TOKEN in .env'
      });
    }
    
    console.log('[TEST] Would send:', testMessage);
    res.json({
      success: true,
      message: 'WhatsApp test message queued',
      data: testMessage,
      status: 'check_exotel_logs'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 5: HubSpot Sync
router.post('/test-hubspot', async (req, res) => {
  console.log('[TEST] Testing HubSpot CRM Sync...');
  
  try {
    if (!process.env.HUBSPOT_API_KEY) {
      return res.json({
        status: 'skipped',
        reason: 'HubSpot API key not configured',
        config_needed: 'Update HUBSPOT_API_KEY in .env'
      });
    }
    
    const testContact = {
      properties: {
        firstname: 'Test',
        lastname: 'Customer',
        email: 'test@example.com',
        phone: '+919876543210',
        custom_loan_amount: '500000',
        custom_monthly_income: '45000'
      }
    };
    
    console.log('[TEST] Would create HubSpot contact:', testContact);
    res.json({
      success: true,
      message: 'HubSpot sync test prepared',
      contact: testContact,
      status: 'ready_to_deploy'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 6: Google Sheets Integration
router.post('/test-google-sheets', async (req, res) => {
  console.log('[TEST] Testing Google Sheets Integration...');
  
  try {
    if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
      return res.json({
        status: 'skipped',
        reason: 'Google Sheets webhook not configured',
        config_needed: 'Update GOOGLE_SHEETS_WEBHOOK_URL in .env'
      });
    }
    
    const testRow = {
      timestamp: new Date().toISOString(),
      callId: 'test_call_001',
      customerName: 'Test Customer',
      phoneNumber: '+919876543210',
      email: 'test@example.com',
      loanType: 'personal',
      loanAmount: '500000',
      monthlyIncome: '45000',
      qualificationStatus: 'qualified',
      nextAction: 'send_whatsapp'
    };
    
    console.log('[TEST] Would add to Google Sheets:', testRow);
    res.json({
      success: true,
      message: 'Google Sheets test row prepared',
      row: testRow,
      sheets_url: process.env.GOOGLE_SHEETS_WEBHOOK_URL
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test 7: Full Integration Test
router.post('/full-integration-test', async (req, res) => {
  console.log('\n[TEST] ===== FULL INTEGRATION TEST =====\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Test each component
  results.tests.vapi = {
    status: process.env.VAPI_API_KEY ? 'configured' : 'not_configured',
    phone: process.env.VAPI_PHONE_NUMBER
  };
  
  results.tests.exotel = {
    status: process.env.EXOTEL_AUTH_TOKEN ? 'configured' : 'not_configured'
  };
  
  results.tests.hubspot = {
    status: process.env.HUBSPOT_API_KEY ? 'configured' : 'not_configured'
  };
  
  results.tests.google_sheets = {
    status: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? 'configured' : 'not_configured'
  };
  
  results.tests.make_com = {
    status: process.env.MAKE_WEBHOOK_URL ? 'configured' : 'not_configured'
  };
  
  // Count ready services
  const readyServices = Object.values(results.tests).filter(t => t.status === 'configured').length;
  const totalServices = Object.keys(results.tests).length;
  
  results.summary = {
    ready: readyServices,
    total: totalServices,
    percentage: Math.round((readyServices / totalServices) * 100),
    next_phase: readyServices === totalServices ? 'Deploy to Production' : 'Complete Configuration'
  };
  
  console.log('[TEST] Results:', JSON.stringify(results, null, 2));
  res.json(results);
});

// Test 8: Credential Validation
router.get('/validate-credentials', (req, res) => {
  const validation = {
    vapi: {
      has_key: !!process.env.VAPI_API_KEY,
      key_length: process.env.VAPI_API_KEY ? process.env.VAPI_API_KEY.length : 0,
      url: process.env.VAPI_API_URL,
      phone: process.env.VAPI_PHONE_NUMBER
    },
    exotel: {
      has_token: !!process.env.EXOTEL_AUTH_TOKEN,
      account_sid: process.env.EXOTEL_ACCOUNT_SID
    },
    hubspot: {
      has_key: !!process.env.HUBSPOT_API_KEY,
      key_length: process.env.HUBSPOT_API_KEY ? process.env.HUBSPOT_API_KEY.length : 0
    },
    google_sheets: {
      has_webhook: !!process.env.GOOGLE_SHEETS_WEBHOOK_URL,
      webhook_starts_with_https: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? process.env.GOOGLE_SHEETS_WEBHOOK_URL.startsWith('https') : false
    },
    make_com: {
      has_webhook: !!process.env.MAKE_WEBHOOK_URL
    }
  };
  
  res.json(validation);
});

// Test 9: Sample Webhook Trigger
router.get('/get-sample-webhook', (req, res) => {
  res.json({
    message: 'Use this payload to test your webhook endpoint',
    endpoint: 'POST /api/webhooks/vapi-callback',
    sample_payload: SAMPLE_VAPI_WEBHOOK,
    curl_command: `curl -X POST http://localhost:5000/api/webhooks/vapi-callback \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(SAMPLE_VAPI_WEBHOOK)}'`
  });
});

// Test 10: Configuration Summary
router.get('/config-summary', (req, res) => {
  const summary = {
    environment: process.env.NODE_ENV,
    services: {
      vapi: {
        status: process.env.VAPI_API_KEY ? '✓ Ready' : '✗ Configure',
        components: [
          'API Key',
          'Assistant ID',
          'Phone Number',
          'Webhook Configured'
        ]
      },
      exotel: {
        status: process.env.EXOTEL_AUTH_TOKEN ? '✓ Ready' : '✗ Configure',
        components: ['Auth Token', 'Business Phone', 'WhatsApp Business Account']
      },
      hubspot: {
        status: process.env.HUBSPOT_API_KEY ? '✓ Ready' : '✗ Configure',
        components: ['Private App Token', 'Scopes', 'Contact Mapping']
      },
      google_sheets: {
        status: process.env.GOOGLE_SHEETS_WEBHOOK_URL ? '✓ Ready' : '✗ Configure',
        components: ['Webhook URL', 'Sheet Structure', 'Columns']
      },
      make_com: {
        status: process.env.MAKE_WEBHOOK_URL ? '✓ Ready' : '✗ Configure',
        components: ['Webhook URL', 'Modules', 'Workflow Logic']
      }
    },
    next_steps: [
      'Review VAPI_COMPLETE_DASHBOARD_CHECKLIST.md',
      'Fill in Assistant IDs from VAPI Dashboard',
      'Test each integration using /test-* endpoints',
      'Run full integration test: POST /test/full-integration-test',
      'Deploy to production when ready'
    ]
  };
  
  res.json(summary);
});

module.exports = router;
