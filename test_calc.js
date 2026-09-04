const fetch = require('node-fetch');
(async () => {
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
  const form = new URLSearchParams();
  form.append('payload', JSON.stringify(payload));
  const res = await fetch('http://localhost:3000/api/eligibility/calculate', {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  const data = await res.json();
  console.log('Response:', data);
})();
