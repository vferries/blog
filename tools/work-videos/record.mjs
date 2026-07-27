// Capture une vidéo du scroll d'un site (pour les cartes réalisations).
// Le scroll est lent et easé pour laisser jouer les animations reveal du site.
// Usage : node record.mjs <url> <out.webm>
import { chromium } from 'playwright-core';
import { rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const [url, out] = process.argv.slice(2);
if (!url || !out) {
  console.error('Usage: node record.mjs <url> <out.webm>');
  process.exit(1);
}

const SCROLL_MS = 7000;
const SETTLE_MS = 1500;

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: tmpdir(), size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(SETTLE_MS);

await page.evaluate((duration) => new Promise((resolve) => {
  const total = document.documentElement.scrollHeight - innerHeight;
  const start = performance.now();
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    scrollTo(0, total * ease(t));
    if (t < 1) requestAnimationFrame(step);
    else resolve();
  };
  requestAnimationFrame(step);
}), SCROLL_MS);

await page.waitForTimeout(SETTLE_MS);
const video = page.video();
await context.close();
await rename(await video.path(), out);
await browser.close();
