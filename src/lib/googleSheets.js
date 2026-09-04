const SCRIPT_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SHEETS_SCRIPT_URL) || 
  "https://script.google.com/macros/s/AKfycbwadPvvLiVgLOUbIcnQm7ZeLEOsh1bamEYVJKi11ub8fZc-EAVugAv2WvgfTc5Izg7A4w/exec";

export const logToGoogleSheets = async (leadData) => {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      name: leadData.name || leadData.fullName || 'Customer',
      phone: leadData.phone || leadData.mobile || '',
      email: leadData.email || 'enquiry@avanifinserv.com',
      loanType: leadData.loanType || leadData.service || 'Personal Loan',
      amount: leadData.amount || leadData.requiredAmount || 0,
      monthlyIncome: leadData.monthlyIncome || 0,
      city: leadData.city || 'Latur',
      source: leadData.source || 'Website_Marketing_Portal'
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });

    console.log('✅ Google Sheets sync sent successfully');
    return response.ok;
  } catch (error) {
    console.error('Error logging to Google Sheets:', error);
    return false;
  }
};
