// Usage: node scripts/optimize-images.mjs <srcDir> [outDir=public/bg]
// Converts every image in srcDir to WebP at 1920w and 960w.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [src, out = 'public/bg'] = process.argv.slice(2);
if (!src) {
  console.error('usage: node scripts/optimize-images.mjs <srcDir> [outDir]');
  process.exit(1);
}
fs.mkdirSync(out, { recursive: true });

for (const file of fs.readdirSync(src)) {
  const name = path.parse(file).name;
  const input = path.join(src, file);
  for (const [suffix, width, quality] of [['', 1920, 78], ['-sm', 960, 72]]) {
    const target = path.join(out, `${name}${suffix}.webp`);
    const info = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(target);
    console.log(target, `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(0)} KB`);
  }
}
