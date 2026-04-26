#!/usr/bin/env node
/**
 * Generates the full PWA + favicon icon set from the real CHCC monogram
 * at /public/club-assets/chcc-monogram.png.
 *
 * Run:
 *   npm run icons:build
 *
 * Emits to /public/icons/. Also writes a trimmed companion next to the
 * source so app shells can render the monogram without surrounding
 * whitespace.
 */

import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCE = join(ROOT, "public", "club-assets", "chcc-monogram.png");
const ICONS_OUT = join(ROOT, "public", "icons");
const ASSETS_OUT = join(ROOT, "public", "club-assets");
mkdirSync(ICONS_OUT, { recursive: true });

// Hearth dark — used as the solid background for any-purpose tiles and
// apple-touch-icon (iOS strips alpha and looks bad against unknown bg).
const TILE_BG_DARK = { r: 26, g: 31, b: 28, alpha: 1 };
// Parchment cream — used for the light-tile favicon variant.
const TILE_BG_LIGHT = { r: 246, g: 241, b: 231, alpha: 1 };

/**
 * Loads the source monogram and trims surrounding transparency so we can
 * compose it onto tiles with predictable padding.
 */
async function loadTrimmedMark() {
  const trimmed = await sharp(SOURCE).trim().toBuffer({ resolveWithObject: true });
  return { buffer: trimmed.data, width: trimmed.info.width, height: trimmed.info.height };
}

/**
 * Centers the mark on a square tile of the given background colour. The
 * mark is scaled to occupy `coverage` (0–1) of the tile's shorter edge
 * so there's a consistent breathing zone.
 */
async function composeTile({ size, coverage, background, mark }) {
  const targetEdge = Math.round(size * coverage);
  const aspect = mark.width / mark.height;

  let markWidth;
  let markHeight;
  if (aspect >= 1) {
    markWidth = targetEdge;
    markHeight = Math.round(targetEdge / aspect);
  } else {
    markHeight = targetEdge;
    markWidth = Math.round(targetEdge * aspect);
  }

  const resizedMark = await sharp(mark.buffer)
    .resize(markWidth, markHeight, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: resizedMark,
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
}

/**
 * Writes the trimmed companion mark used by app shells. Preserves alpha
 * so it adapts to whatever surface colour it sits on.
 */
async function writeTrimmedCompanion(mark) {
  const out = join(ASSETS_OUT, "chcc-monogram-trimmed.png");
  // Re-encode at native size; the @next/image pipeline will resize as needed.
  const buf = await sharp(mark.buffer).png({ compressionLevel: 9 }).toBuffer();
  writeFileSync(out, buf);
  console.log(`wrote club-assets/chcc-monogram-trimmed.png  ${buf.length} bytes  (${mark.width}x${mark.height})`);
}

/**
 * The favicon.svg is the only vector asset shipped to browsers. Embed
 * the real PNG as a data URI inside an SVG wrapper so any-size rendering
 * stays crisp without bundling a separate raster pipeline.
 */
async function writeFaviconSvg(mark) {
  const dataUri = `data:image/png;base64,${mark.buffer.toString("base64")}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Chapel Hill Country Club">
  <rect width="64" height="64" rx="10" fill="#1a1f1c"/>
  <image href="${dataUri}" x="6" y="14" width="52" height="${Math.round((52 * mark.height) / mark.width)}" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
  writeFileSync(join(ICONS_OUT, "favicon.svg"), svg);
  console.log(`wrote icons/favicon.svg  ${svg.length} bytes`);
}

async function main() {
  const mark = await loadTrimmedMark();
  console.log(`source mark trimmed to ${mark.width}x${mark.height} (aspect ${(mark.width / mark.height).toFixed(3)})`);

  await writeTrimmedCompanion(mark);
  await writeFaviconSvg(mark);

  const tiles = [
    { name: "favicon-16.png",         size: 16,   coverage: 0.78, background: TILE_BG_DARK },
    { name: "favicon-32.png",         size: 32,   coverage: 0.78, background: TILE_BG_DARK },
    { name: "apple-touch-icon.png",   size: 180,  coverage: 0.74, background: TILE_BG_DARK },
    { name: "icon-192.png",           size: 192,  coverage: 0.74, background: TILE_BG_DARK },
    { name: "icon-512.png",           size: 512,  coverage: 0.74, background: TILE_BG_DARK },
    { name: "icon-1024.png",          size: 1024, coverage: 0.74, background: TILE_BG_DARK },
    // Maskable icons need extra safe-zone padding so launchers can crop
    // into circles/squircles without clipping the mark.
    { name: "icon-maskable-512.png",  size: 512,  coverage: 0.50, background: TILE_BG_DARK },
    { name: "icon-maskable-1024.png", size: 1024, coverage: 0.50, background: TILE_BG_DARK },
    // Light-on-light variant for browsers that prefer a parchment chrome.
    { name: "icon-light-512.png",     size: 512,  coverage: 0.74, background: TILE_BG_LIGHT },
  ];

  for (const tile of tiles) {
    const buf = await composeTile({
      size: tile.size,
      coverage: tile.coverage,
      background: tile.background,
      mark,
    });
    writeFileSync(join(ICONS_OUT, tile.name), buf);
    console.log(`wrote icons/${tile.name}  ${buf.length} bytes`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
