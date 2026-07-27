// Capture une vidéo du scroll d'un site (pour les cartes réalisations).
// Scroll linéaire à vitesse constante (pas d'easing, pas d'accélération sur
// les pages longues — distance plafonnée). Support optionnel d'un clic sur
// un élément après le scroll de la liste (scénario liste → détail).
// Usage : node record.mjs <url> <out.webm> [click-selector]
import { chromium } from 'playwright-core';
import { rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const [url, out, clickSelector] = process.argv.slice(2);
if (!url || !out) {
  console.error('Usage: node record.mjs <url> <out.webm> [click-selector]');
  process.exit(1);
}

const SETTLE_MS = 1500;
const CLICK_SETTLE_MS = 800;
const SCROLL_SPEED_PX_S = 500;
const MAX_SCROLL_PX = 3200; // ~4 hauteurs de viewport (800px)
const MAX_SCROLL_MS = 8000;
const LIST_BUDGET_SHARE = 0.4; // part du budget temps pour le scroll de la liste

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: tmpdir(), size: { width: 1280, height: 800 } },
});

// L'enregistrement démarre dès la création de la page : on mesure ce temps
// mort (chargement + warm-up + settle) pour permettre à record.sh de le
// couper au montage — sinon la frame 0 du mp4 final tombe avant le premier
// paint.
const leadStart = performance.now();
const page = await context.newPage();
await page.goto(url, { waitUntil: 'networkidle' });

// Neutralise le smooth-scroll natif des sites (source probable des à-coups
// pendant le scroll scripté).
await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

// Warm-up bas → haut : déclenche les lazy-loads et stabilise scrollHeight
// avant l'enregistrement utile. Se déroule pendant la phase LEAD, trimée
// au montage de toute façon.
await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(400);
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(SETTLE_MS);
const leadSeconds = (performance.now() - leadStart) / 1000;

// Scroll linéaire (sans easing) de 0 à targetPx sur durationMs : vitesse
// constante, pas d'à-coup ni d'accélération de fin de page.
const linearScrollTo = (targetPage, targetPx, durationMs) => targetPage.evaluate(
  ([target, duration]) => new Promise((resolve) => {
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      scrollTo(0, target * t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  }),
  [targetPx, durationMs],
);

const scrollableHeight = (targetPage) => targetPage.evaluate(
  () => document.documentElement.scrollHeight - innerHeight,
);

if (clickSelector) {
  // Scénario liste → détail (ex. cuisine.vferries) : scroll de la liste sur
  // ~40 % du budget temps, clic sur le premier élément, chargement de la
  // page détail, puis scroll de cette page pour le reste du budget.
  const listBudgetMs = MAX_SCROLL_MS * LIST_BUDGET_SHARE;
  const listDistance = Math.min(await scrollableHeight(page), (SCROLL_SPEED_PX_S * listBudgetMs) / 1000);
  await linearScrollTo(page, listDistance, (listDistance / SCROLL_SPEED_PX_S) * 1000);

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click(clickSelector),
  ]);
  await page.waitForTimeout(CLICK_SETTLE_MS);

  const detailBudgetMs = MAX_SCROLL_MS * (1 - LIST_BUDGET_SHARE);
  const detailDistance = Math.min(await scrollableHeight(page), (SCROLL_SPEED_PX_S * detailBudgetMs) / 1000);
  await linearScrollTo(page, detailDistance, (detailDistance / SCROLL_SPEED_PX_S) * 1000);
} else {
  const distance = Math.min(await scrollableHeight(page), MAX_SCROLL_PX);
  const duration = Math.min((distance / SCROLL_SPEED_PX_S) * 1000, MAX_SCROLL_MS);
  await linearScrollTo(page, distance, duration);
}

await page.waitForTimeout(SETTLE_MS);
const video = page.video();
await context.close();
await rename(await video.path(), out);
await browser.close();

console.log(`LEAD_SECONDS=${leadSeconds.toFixed(2)}`);
