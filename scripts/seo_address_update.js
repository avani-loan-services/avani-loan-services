import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');

// Helper to get all .jsx files recursively
function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (let file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.jsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getFiles(srcDir);

for (let file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // 1. Update Address Strings
  const oldAddress = /RAJIV GANDHI CHAUK, OPP BANK OF BARODA,\s*ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD,\s*LATUR-413512, MAHARASHTRA INDIA/gi;
  const oldAddress2 = /RAJIV GANDHI CHAUK, OPP BANK OF BARODA, ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD, LATUR-413512, MAHARASHTRA INDIA/gi;
  const newAddressMulti = "Rajiv Gandhi Chauk, Opposite Bank of Baroda,<br />Above Monginis Cake Shop, Ausa Road,<br />Latur – 413512, Maharashtra India";
  const newAddressSingle = "Rajiv Gandhi Chauk, Opposite Bank of Baroda, Above Monginis Cake Shop, Ausa Road, Latur – 413512, Maharashtra India";

  if (oldAddress.test(content) || oldAddress2.test(content)) {
    content = content.replace(/RAJIV GANDHI CHAUK, OPP BANK OF BARODA,<br \/>ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD,<br \/>LATUR-413512, MAHARASHTRA INDIA/g, newAddressMulti);
    content = content.replace(/RAJIV GANDHI CHAUK, OPP BANK OF BARODA, ABOVE MONGINIOUS CAKE SHOP, AUSA ROAD, LATUR-413512, MAHARASHTRA INDIA/gi, newAddressSingle);
    changed = true;
  }
  
  // Update plain text variations without HTML tags
  if (content.includes("MONGINIOUS")) {
    content = content.replace(/MONGINIOUS/gi, "Monginis");
    changed = true;
  }
  if (content.includes("OPP BANK OF BARODA")) {
    content = content.replace(/OPP BANK OF BARODA/gi, "Opposite Bank of Baroda");
    changed = true;
  }

  // 2. Add SEO Hook to pages
  if (file.includes(path.join('src', 'pages'))) {
    if (!content.includes('useSEO')) {
      // Find the component name
      const funcMatch = content.match(/export default function ([A-Za-z0-9_]+)\s*\(/);
      if (funcMatch) {
        const componentName = funcMatch[1];
        
        // Add import
        content = `import useSEO from '../hooks/useSEO';\n` + content;
        
        // Add hook call inside component
        const hookCall = `\n  useSEO({ title: '${componentName} - Avani Loan Services', description: 'Professional loan services in Maharashtra including Home, Business, Personal and Education loans.', keywords: '${componentName}, Loan, Avani Finserv, Latur' });\n`;
        
        content = content.replace(/export default function [A-Za-z0-9_]+\s*\([^)]*\)\s*\{/, match => match + hookCall);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
}
