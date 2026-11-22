// Generates the default Open Graph / Twitter card image at public/og-default.png
// Run: node scripts/generate-og-image.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '../public/og-default.png');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0b0f"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#06b6d4"/>
      <stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="118" cy="150" r="9" fill="url(#accent)"/>
  <text x="140" y="161" font-family="Segoe UI, Arial, sans-serif" font-size="32" fill="#94a3b8">~/cyanix</text>
  <text x="100" y="356" font-family="Segoe UI, Arial, sans-serif" font-size="104" font-weight="700" fill="#f8fafc">Cyanix Blog</text>
  <text x="104" y="428" font-family="Segoe UI, Arial, sans-serif" font-size="36" fill="#22d3ee">Notes · Thoughts · Engineering Writing</text>
  <rect x="104" y="472" width="220" height="6" rx="3" fill="url(#accent)"/>
  <text x="104" y="540" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#64748b">cyanix-blog.vercel.app</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ quality: 92 }).toFile(out);
console.log('wrote', out);
