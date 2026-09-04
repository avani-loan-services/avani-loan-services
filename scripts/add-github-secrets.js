#!/usr/bin/env node
// Usage:
//  GH_TOKEN=<your_github_token> node scripts/add-github-secrets.js --owner <owner> --repo <repo>
// Optionally set --secrets NAME1,NAME2 to override default names. Defaults read values from process.env
// Requires: npm install libsodium-wrappers node-fetch

import fetch from 'node-fetch';
import sodium from 'libsodium-wrappers';

function getArg(name) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1];
}

const GH_TOKEN = process.env.GITHUB_TOKEN; // Use env variable for token
if (!GH_TOKEN) {
  console.error('Missing GH_TOKEN or GITHUB_TOKEN in environment. Provide a PAT with repo and repo:actions permissions.');
  process.exit(1);
}

const owner = getArg('--owner') || process.env.GITHUB_OWNER;
const repo = getArg('--repo') || process.env.GITHUB_REPO;
if (!owner || !repo) {
  console.error('Missing --owner or --repo. Example: --owner myorg --repo myrepo');
  process.exit(1);
}

const secretArg = getArg('--secrets');
const DEFAULT_SECRETS = [
  'VERCEL_TOKEN',
  'VERCEL_PROJECT',
  'SITE_URL',
  'VITE_HUBSPOT_FORM_ID',
  'VITE_HUBSPOT_PORTAL_ID',
  'VITE_HUBSPOT_REGION',
  'PABBLY_CONNECT_URL',
  'PICKY_ASSIST_URL',
  'GOOGLE_WEB_APP_URL'
];

const secretsToSet = secretArg ? secretArg.split(',').map(s=>s.trim()).filter(Boolean) : DEFAULT_SECRETS;

async function getPublicKey() {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/public-key`;
  const r = await fetch(url, { headers: { Authorization: `token ${GH_TOKEN}`, Accept: 'application/vnd.github+json' } });
  if (!r.ok) throw new Error(`Failed to fetch public key: ${r.status} ${await r.text()}`);
  return r.json();
}

async function encryptValue(publicKey, value) {
  await sodium.ready;
  const pk = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);
  const msg = sodium.from_string(value);
  const sealed = sodium.crypto_box_seal(msg, pk);
  return sodium.to_base64(sealed, sodium.base64_variants.ORIGINAL);
}

async function uploadSecret(name, encryptedValue, keyId) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/secrets/${encodeURIComponent(name)}`;
  const body = { encrypted_value: encryptedValue, key_id: keyId };
  const r = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `token ${GH_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`Failed to set secret ${name}: ${r.status} ${await r.text()}`);
  return r.json();
}

async function main() {
  console.log('Resolving public key for', owner, repo);
  const keyData = await getPublicKey();
  const keyId = keyData.key_id;
  const publicKey = keyData.key;

  for (const name of secretsToSet) {
    const value = process.env[name];
    if (!value) {
      console.log(`Skipping ${name}: not present in current environment`);
      continue;
    }
    console.log(`Encrypting and uploading ${name}`);
    const enc = await encryptValue(publicKey, value);
    await uploadSecret(name, enc, keyId);
    console.log(`Uploaded ${name}`);
  }

  console.log('All done.');
}

main().catch(err => { console.error(err); process.exit(1); });
