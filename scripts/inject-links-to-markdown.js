#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
const dataPath = path.join(root, 'src', 'data', 'services.json');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function walk(dir, fileList = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', '.git', 'public', 'dist', '.github'].includes(ent.name)) continue;
      await walk(full, fileList);
    } else if (ent.isFile() && ent.name.endsWith('.md')) {
      fileList.push(full);
    }
  }
  return fileList;
}

async function main() {
  const raw = await fs.readFile(dataPath, 'utf8');
  const services = JSON.parse(raw);
  const mappings = [];
  for (const s of services) {
    const url = `/services/${s.slug}`;
    const keys = new Set([...(s.keywords || []), s.h1, s.title || '']);
    // Sort longer phrases first to avoid partial matches
    const keysArr = Array.from(keys).filter(Boolean).sort((a,b) => b.length - a.length);
    for (const k of keysArr) mappings.push({ key: k, url });
  }

  const files = await walk(root);
  for (const file of files) {
    if (file.endsWith('DEPLOY.md')) continue;
    let content = await fs.readFile(file, 'utf8');
    const parts = content.split(/(```[\s\S]*?```)/g); // keep code fences intact
    let changed = false;
    let replacements = 0;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('```')) continue; // skip code blocks
      for (const m of mappings) {
        if (replacements >= 6) break; // limit replacements per file
        const regex = new RegExp('\\b' + escapeRegex(m.key) + '\\b', 'i');
        if (regex.test(parts[i])) {
          // avoid replacing if already in a markdown link
          const linkRegex = new RegExp('\\[' + escapeRegex(m.key) + '\\]\\(');
          if (linkRegex.test(parts[i])) continue;
          parts[i] = parts[i].replace(regex, `[${m.key}](${m.url})`);
          changed = true;
          replacements++;
        }
      }
    }
    if (changed) {
      await fs.writeFile(file, parts.join(''), 'utf8');
      console.log(`Updated links in ${file} (replacements: ${replacements})`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
