#!/usr/bin/env node
/**
 * Rasterises the CHCC monogram + a solid-tile variant into PNGs the
 * web app manifest, iOS, and Android need. Run:
 *
 *   npm run icons:build
 *
 * Emits to /public/icons/.
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "public", "icons");
mkdirSync(OUT, { recursive: true });

// Solid tile — dark forest background, gold mark. Used for any-purpose
// + apple-touch-icon (iOS hates transparency on touch icons).
const TILE_BG = "#1a1f1c";
const GOLD = "#b08d57";

function tileSvg(size) {
  const margin = Math.round(size * 0.18);
  const inner = size - margin * 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${TILE_BG}"/>
  <g transform="translate(${margin}, ${margin}) scale(${inner / 320})">
    <text x="160" y="200" text-anchor="middle"
      font-family="Crimson Pro, Cormorant Garamond, Georgia, serif"
      font-size="200" font-weight="500" fill="${GOLD}"
      letter-spacing="-12">CH</text>
    <text x="160" y="260" text-anchor="middle"
      font-family="Crimson Pro, Cormorant Garamond, Georgia, serif"
      font-size="42" letter-spacing="14" fill="${GOLD}">1922</text>
  </g>
</svg>`;
}

// Maskable — same mark but with extra safe-zone padding so launchers
// can crop into a circle/squircle without clipping.
function maskableSvg(size) {
  const margin = Math.round(size * 0.28);
  const inner = size - margin * 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${TILE_BG}"/>
  <g transform="translate(${margin}, ${margin}) scale(${inner / 320})">
    <text x="160" y="220" text-anchor="middle"
      font-family="Crimson Pro, Cormorant Garamond, Georgia, serif"
      font-size="220" font-weight="500" fill="${GOLD}"
      letter-spacing="-12">CH</text>
  </g>
</svg>`;
}

const targets = [
  { name: "icon-192.png",          svg: tileSvg(192),     size: 192 },
  { name: "icon-512.png",          svg: tileSvg(512),     size: 512 },
  { name: "icon-maskable-512.png", svg: maskableSvg(512), size: 512 },
  { name: "apple-touch-icon.png",  svg: tileSvg(180),     size: 180 },
];

for (const t of targets) {
  const buf = await sharp(Buffer.from(t.svg)).png().toBuffer();
  writeFileSync(join(OUT, t.name), buf);
  console.log(`wrote icons/${t.name}  ${buf.length} bytes`);
}
