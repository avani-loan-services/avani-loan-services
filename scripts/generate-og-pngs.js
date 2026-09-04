#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const root = process.cwd();
const servicesPath = path.join(root, 'src', 'data', 'services.json');
const svgPath = path.join(root, 'public', 'og-default.svg');
const outDir = path.join(root, 'public', 'og');

async function main() {
  const raw = await fs.readFile(servicesPath, 'utf8');
  const services = JSON.parse(raw);
  await fs.mkdir(outDir, { recursive: true });
  const svgData = await fs.readFile(svgPath);

  for (const s of services) {
    const outFile = path.join(outDir, `${s.slug}.png`);
    console.log(`Rendering ${outFile}`);
    await sharp(svgData)
      .resize(1200, 630, { fit: 'cover' })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(outFile);
    const stats = await fs.stat(outFile);
    console.log(`Wrote ${outFile} (${stats.size} bytes)`);
  }

  console.log('All PNGs generated in public/og/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
