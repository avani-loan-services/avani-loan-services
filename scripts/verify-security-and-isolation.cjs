const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const patterns = [
  { name: 'MongoDB URI with Credentials', regex: /mongodb(\+srv)?:\/\/[a-zA-Z0-9_-]+:[^@\s"']+@[^\s"']+/gi },
  { name: 'Meta / Facebook Secret/Token', regex: /EAAB[a-zA-Z0-9]{20,}/gi },
  { name: 'AiSensy Secret API Key', regex: /aisensy[a-zA-Z0-9_-]{20,}/gi },
  { name: 'OmniDM Secret Key', regex: /omnidm[a-zA-Z0-9_-]{20,}/gi },
  { name: 'Private Key Block', regex: /-----BEGIN PRIVATE KEY-----/gi },
  { name: 'Hardcoded JWT Bearer Token', regex: /eyJ[a-zA-Z0-9_-]{15,}\.eyJ[a-zA-Z0-9_-]{15,}\.[a-zA-Z0-9_-]{15,}/gi },
  { name: 'Agro Foods Contamination', regex: /avani\s*agro\s*foods|avaniagrofoods|agro_foods/gi },
  { name: 'Legacy Commit SHA Contamination', regex: /3a873af3286889cda6a51746aa6948f6feb8ee3c/gi }
];

const scanDirs = ['src', 'scripts', 'dist'];
let totalFilesScanned = 0;
let totalFindings = 0;

function scanDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        scanDir(fullPath);
      }
    } else if (entry.isFile() && /\.(js|cjs|jsx|ts|tsx|json|html|css|md)$/i.test(entry.name)) {
      if (entry.name === 'verify-security-and-isolation.cjs') continue;
      totalFilesScanned++;
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const p of patterns) {
        const matches = content.match(p.regex);
        if (matches) {
          console.error(`❌ [ALERT] Found ${p.name} in ${path.relative(ROOT_DIR, fullPath)}:`, matches.slice(0, 2));
          totalFindings++;
        }
      }
    }
  }
}

console.log('═══════════════════════════════════════════════════════');
console.log('🛡️ RUNNING COMPREHENSIVE SECURITY & CONTAMINATION SCAN');
console.log('═══════════════════════════════════════════════════════');

for (const d of scanDirs) {
  const p = path.join(ROOT_DIR, d);
  if (fs.existsSync(p)) scanDir(p);
}

console.log(`\nFiles scanned: ${totalFilesScanned}`);
console.log(`Security / Contamination findings: ${totalFindings}`);

if (totalFindings === 0) {
  console.log('✅ CONTAMINATION SCAN: 0 FINDINGS (PASS)');
  console.log('✅ SECRET SCAN: 0 LEAKAGES (PASS)');
  process.exit(0);
} else {
  console.error('❌ SCAN FAILED: Findings detected!');
  process.exit(1);
}
