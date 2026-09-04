// test_calc.cjs
// Simple script to test the new /calculate endpoint

const payload = {
  name: 'John Doe',
  phone: '1234567890',
  email: 'john@example.com',
  loanType: 'Personal Loan',
  amount: 50000,
  city: 'City',
  creditScore: 750,
  employmentType: 'Salaried',
  existingLoans: 0,
  requestedTenureMonths: 60,
  purpose: 'Home renovation'
};

(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/eligibility/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ payload: JSON.stringify(payload) })
    });
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
})();
