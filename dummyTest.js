import { syncLeadData } from './src/lib/syncLeads.js';

(async () => {
  const dummyData = {
    name: 'Test User',
    phone: '9999999999',
    loanType: 'Personal',
    amount: 500000,
    income: 60000,
    source: 'Dummy_Test',
    details: 'Dummy submission for testing purposes'
  };
  console.log('Starting dummy sync...');
  const result = await syncLeadData(dummyData);
  console.log('Dummy sync result:', result);
})();
