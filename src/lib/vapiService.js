// VAPI AI Integration Service for Avani Loan Services
// Handles outbound calling, lead management, and automation

const VAPI_API_KEY = process.env.VAPI_API_KEY || '';
const VAPI_API_URL = process.env.VAPI_API_URL || 'https://api.vapi.ai';
const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID || '';
const PHONE_NUMBER = process.env.VAPI_PHONE_NUMBER || '';

// AI Prompts for different loan products
const LOAN_PROMPTS = {
  personal: `You are an AI assistant for Avani Loan Services calling about Personal Loans. Your goal is to:
1. Greet the customer warmly in their preferred language (English, Hindi, or Marathi)
2. Introduce Avani Loan Services and the Personal Loan product
3. Ask about their loan requirement and purpose
4. Collect their basic details: name, income, employment type
5. Qualify them based on: salary, employment status, existing loans
6. If qualified, offer to send documents via WhatsApp or schedule a call with loan officer
7. Handle objections professionally
8. Book an appointment if interested

Keep responses concise, friendly, and focus on their needs. If they're not interested, ask why and offer alternatives.`,

  business: `You are an AI assistant for Avani Loan Services calling about Business Loans. Your goal is to:
1. Greet the customer warmly
2. Introduce Business Loan product (up to 50L for established businesses)
3. Ask about business type, turnover, and loan requirement
4. Collect: Business name, age, monthly turnover, bank statements availability
5. Qualify based on business profitability and bank statements
6. Offer loan options matching their business profile
7. Schedule meeting with business loan specialist
8. Send offer document via WhatsApp

Be professional and business-focused. Ask specific business questions.`,

  doctor: `You are an AI assistant for Avani Loan Services calling about Doctor Loans. Your goal is to:
1. Greet the doctor warmly
2. Introduce Doctor Loan product (specialized for doctors)
3. Ask about practice type (private/hospital), specialization, income
4. Collect: Doctor details, years of practice, monthly income, qualification
5. Mention special benefits for doctors (higher limits, lower rates)
6. Offer loan for practice expansion, equipment, or personal needs
7. Schedule with loan officer
8. Send customized offer

Show understanding of doctor's financial needs and practice challenges.`,

  home: `You are an AI assistant for Avani Loan Services calling about Home Loans. Your goal is to:
1. Greet customer warmly
2. Introduce Home Loan product
3. Ask about property details: location, price, type (new/resale)
4. Collect: Applicant details, income, existing EMI, desired loan amount
5. Mention competitive rates and quick approval
6. Discuss property documents needed
7. Explain process: pre-approval -> property evaluation -> disbursement
8. Schedule property verification
9. Book follow-up call with home loan specialist

Ask about their financial situation and timeline.`,

  education: `You are an AI assistant for Avani Loan Services calling about Education Loans. Your goal is to:
1. Greet student/parent warmly
2. Introduce Education Loan (India & Abroad)
3. Ask: Course, college, country, annual fees, co-applicant income
4. Collect: Student details, parent income, college admission letter
5. Explain: Loan covers tuition + living expenses
6. Mention: Lower interest, flexible repayment (moratorium during course)
7. Offer: Fast approval, document support
8. Schedule counseling call
9. Discuss scholarship opportunities

Be encouraging about their educational aspirations.`,

  mortgage: `You are an AI assistant for Avani Loan Services calling about Mortgage Loans. Your goal is to:
1. Greet customer warmly
2. Introduce Mortgage Loan product
3. Ask about property: type, location, current value, equity available
4. Collect: Property details, desired loan amount, purpose (business/personal)
5. Explain process: property valuation -> approval -> disbursement
6. Mention competitive rates for property-backed loans
7. Offer: Quick approval for good properties
8. Schedule property inspection
9. Discuss legal documentation

Focus on property value and loan-to-value ratio.`
};

// Call qualification criteria
const QUALIFICATION_CRITERIA = {
  personal: {
    minSalary: 15000, // Monthly minimum
    maxAge: 60,
    requiredDocs: ['salary slip', 'bank statement', 'pan card', 'aadhar']
  },
  business: {
    minTurnover: 500000, // Annual minimum
    minBusinessAge: 2,
    requiredDocs: ['bank statement', 'gst certificate', 'business proof', 'pan card']
  },
  doctor: {
    minIncome: 50000,
    maxAge: 65,
    requiredDocs: ['medical license', 'bank statement', 'practice proof', 'pan card']
  },
  home: {
    minPropertyValue: 1000000,
    minDownPayment: 0.2, // 20% minimum
    requiredDocs: ['property papers', 'valuation report', 'bank statement', 'pan card']
  },
  education: {
    minParentIncome: 100000,
    maxAge: 30,
    requiredDocs: ['admission letter', 'fee letter', 'parent income proof', 'pan card']
  }
};

// VAPI Service Methods
const vapiService = {
  // Initialize VAPI with config
  async initVAPI() {
    try {
      const response = await fetch(`${VAPI_API_URL}/assistants/${ASSISTANT_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    } catch (error) {
      console.error('VAPI initialization error:', error);
      throw error;
    }
  },

  // Create or update an assistant for a specific loan product
  async createAssistant(loanType) {
    try {
      const assistantData = {
        name: `Avani ${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan Assistant`,
        model: {
          provider: 'openai',
          model: 'gpt-4'
        },
        voice: {
          provider: 'google',
          voiceId: 'en-US-Neural2-A' // Professional male voice
        },
        firstMessage: `Hi! I'm calling from Avani Loan Services. I'm here to help you with information about our ${loanType} loan. Do you have a few minutes to chat?`,
        systemPrompt: LOAN_PROMPTS[loanType],
        endCallMessage: 'Thank you for speaking with me. Have a great day!',
        recordingEnabled: true,
        analysisPlan: {
          summaryDescription: `${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan Inquiry - Lead Qualification`,
          structuredDataPlan: {
            enabled: true,
            fields: ['customer_name', 'phone_number', 'email', 'loan_amount', 'monthly_income', 'qualification_status', 'next_action']
          }
        }
      };

      const response = await fetch(`${VAPI_API_URL}/assistants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assistantData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  },

  // Make outbound call
  async makeCall(phoneNumber, assistantId, loanType) {
    try {
      const callData = {
        phoneNumber: phoneNumber,
        assistantId: assistantId,
        assistantOverrides: {
          systemPrompt: LOAN_PROMPTS[loanType]
        },
        customerNumber: PHONE_NUMBER
      };

      const response = await fetch(`${VAPI_API_URL}/calls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  },

  // Get call recording and transcript
  async getCallDetails(callId) {
    try {
      const response = await fetch(`${VAPI_API_URL}/calls/${callId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting call details:', error);
      throw error;
    }
  },

  // Qualify lead based on call information
  qualifyLead(callData, loanType) {
    const criteria = QUALIFICATION_CRITERIA[loanType];
    const qualification = {
      status: 'pending',
      score: 0,
      checks: [],
      recommendations: []
    };

    // Scoring logic (0-100)
    let score = 50; // Base score

    if (callData.monthlyIncome >= criteria.minSalary) {
      score += 20;
      qualification.checks.push('✓ Income qualification met');
    } else {
      qualification.checks.push('✗ Income below requirement');
    }

    if (callData.age && callData.age <= criteria.maxAge) {
      score += 15;
      qualification.checks.push('✓ Age within acceptable range');
    }

    if (callData.existingEMI && callData.monthlyIncome > callData.existingEMI * 3) {
      score += 15;
      qualification.checks.push('✓ EMI to income ratio acceptable');
    }

    qualification.score = Math.min(score, 100);
    qualification.status = score >= 70 ? 'qualified' : 'needs_review';

    return qualification;
  },

  // Process webhook response from VAPI
  async processWebhook(webhookData) {
    try {
      const { callId, callStatus, transcript, analysis } = webhookData;

      // Extract structured data from analysis
      const extractedData = analysis?.structuredData || {};

      // Save to Google Sheets or database
      await this.saveLeadData({
        callId,
        timestamp: new Date().toISOString(),
        status: callStatus,
        ...extractedData,
        transcript
      });

      return {
        success: true,
        message: 'Webhook processed successfully',
        leadData: extractedData
      };
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  },

  // Save lead data to Google Sheets
  async saveLeadData(leadData) {
    try {
      const response = await fetch('/api/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(leadData)
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving lead data:', error);
      throw error;
    }
  },

  // Get call history and analytics
  async getCallAnalytics(startDate, endDate) {
    try {
      const response = await fetch(
        `${VAPI_API_URL}/calls?startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${VAPI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const calls = await response.json();

      // Process analytics
      const analytics = {
        totalCalls: calls.length,
        succeededCalls: calls.filter(c => c.status === 'ended').length,
        failedCalls: calls.filter(c => c.status === 'failed').length,
        averageDuration: calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length,
        conversationSuccessRate: (calls.filter(c => c.status === 'ended').length / calls.length) * 100
      };

      return analytics;
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  },

  // Send WhatsApp follow-up message
  async sendWhatsAppMessage(phoneNumber, message, loanType) {
    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          message,
          loanType
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  },

  // Send SMS reminder
  async sendSMSReminder(phoneNumber, appointmentDetails) {
    try {
      const message = `Hi! This is a reminder from Avani Loan Services. Your appointment is scheduled for ${appointmentDetails.date} at ${appointmentDetails.time}. Call: ${PHONE_NUMBER}`;

      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          message
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  },

  // Fetch call metrics dashboard data
  async getDashboardMetrics() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const analytics = await this.getCallAnalytics(lastMonth, today);

      return {
        todayMetrics: analytics,
        trends: {
          callVolume: 'trending up',
          conversionRate: '45%',
          averageCallDuration: '5m 30s'
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
};

export default vapiService;
