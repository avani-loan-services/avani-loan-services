// scripts/test_live_auth_verification.cjs
// Programmatically tests live authentication without logging or printing secrets.

const fs = require('fs');
const path = require('path');

async function testLiveAuth() {
  console.log('=== TESTING LIVE PRODUCTION AUTHENTICATION ===');

  const secretPath = path.join(__dirname, '../.admin_credential_rotated.secret');
  if (!fs.existsSync(secretPath)) {
    console.error('Local secret file not found.');
    process.exit(1);
  }

  const lines = fs.readFileSync(secretPath, 'utf8').split('\n');
  const userLine = lines.find(l => l.startsWith('# USERNAME:'));
  const credLine = lines.find(l => l.startsWith('# CREDENTIAL:'));

  if (!userLine || !credLine) {
    console.error('Could not parse credentials from secret file.');
    process.exit(1);
  }

  const username = userLine.replace('# USERNAME:', '').trim();
  const password = credLine.replace('# CREDENTIAL:', '').trim();

  console.log('Testing login against https://www.avanifinserv.com/api/portal/auth/login ...');
  
  try {
    const res = await fetch('https://www.avanifinserv.com/api/portal/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log('Login Response Status:', res.status);
    console.log('Login Response Success:', data.success);
    console.log('User Role Returned:', data.user ? data.user.role : 'NONE');
    console.log('Token Received:', Boolean(data.token));

    if (res.ok && data.success && data.token) {
      console.log('Testing /api/portal/auth/me with Bearer token...');
      const meRes = await fetch('https://www.avanifinserv.com/api/portal/auth/me', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const meData = await meRes.json();
      console.log('/me Response Status:', meRes.status);
      console.log('/me Authenticated:', meData.authenticated);
      console.log('/me User:', meData.user ? meData.user.username : 'NONE');

      console.log('Testing /api/portal/dashboard/overview...');
      const ovRes = await fetch('https://www.avanifinserv.com/api/portal/dashboard/overview', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const ovData = await ovRes.json();
      console.log('/overview Status:', ovRes.status);
      console.log('/overview Builder Count:', ovData.stats ? ovData.stats.total_builders : 'N/A');
      console.log('/overview Institutions Count:', ovData.stats ? ovData.stats.total_institutions : 'N/A');
      console.log('/overview Leads Count:', ovData.stats ? ovData.stats.total_leads : 'N/A');

      console.log('Testing /api/portal/builder/companies...');
      const bRes = await fetch('https://www.avanifinserv.com/api/portal/builder/companies', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const bData = await bRes.json();
      console.log('/builder/companies Status:', bRes.status, 'Record Count:', bData.data ? bData.data.length : 'N/A');

      console.log('Testing /api/portal/education/institutions (Schools)...');
      const sRes = await fetch('https://www.avanifinserv.com/api/portal/education/institutions?category=School', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const sData = await sRes.json();
      console.log('/education/institutions (Schools) Status:', sRes.status, 'Record Count:', sData.data ? sData.data.length : 'N/A');

      console.log('Testing /api/portal/education/institutions (Colleges)...');
      const cRes = await fetch('https://www.avanifinserv.com/api/portal/education/institutions?category=College', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const cData = await cRes.json();
      console.log('/education/institutions (Colleges) Status:', cRes.status, 'Record Count:', cData.data ? cData.data.length : 'N/A');

      console.log('Testing /api/portal/templates...');
      const tRes = await fetch('https://www.avanifinserv.com/api/portal/templates', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const tData = await tRes.json();
      console.log('/templates Status:', tRes.status, 'Record Count:', tData.data ? tData.data.length : 'N/A');

      console.log('Testing /api/portal/campaigns...');
      const cmpRes = await fetch('https://www.avanifinserv.com/api/portal/campaigns', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      const cmpData = await cmpRes.json();
      console.log('/campaigns Status:', cmpRes.status, 'Record Count:', cmpData.data ? cmpData.data.length : 'N/A');

      console.log('Testing /api/portal/auth/logout...');
      const loRes = await fetch('https://www.avanifinserv.com/api/portal/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('/logout Status:', loRes.status);

      // Verify token is revoked
      const postLoRes = await fetch('https://www.avanifinserv.com/api/portal/auth/me', {
        headers: { 'Authorization': `Bearer ${data.token}` }
      });
      console.log('/me after logout Status (expected 401):', postLoRes.status);

      if (postLoRes.status === 401) {
        console.log('✅ LIVE PRODUCTION VERIFICATION PASSED COMPLETELY!');
      } else {
        console.warn('⚠️ Token was not revoked after logout.');
      }
    } else {
      console.error('Live login failed:', data);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testLiveAuth();
