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
// Part du budget temps pour le scroll de la liste avant le clic. Volontairement
// faible : si l'élément ciblé par clickSelector est proche du haut de la liste
// (ex. 2e ligne sur cuisine), un scroll trop long le fait défiler hors du
// viewport avant le clic — Playwright auto-scroll alors pour l'atteindre, ce
// qui produit un saut visible. À ajuster si un futur site cible un élément
// plus bas dans une liste longue (le scroll pourrait alors rester bref sans
// dépasser la position de la cible, ou remonter la part vers ~40 %).
const LIST_BUDGET_SHARE = 0.05;

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

// scrollableHeight peut être négatif (page plus courte que le viewport) :
// on clampe à 0 pour éviter une distance/durée négative qui ferait boucler
// linearScrollTo indéfiniment (t = (now-start)/duration ne franchit jamais 1
// quand duration < 0).
const clampDistance = (raw, cap) => Math.max(0, Math.min(raw, cap));

// browser/context sont fermés dans le finally quoi qu'il arrive (ex. timeout
// de page.click sur un mauvais sélecteur) — sinon un échec laisse Chrome et
// le contexte d'enregistrement ouverts. L'erreur d'origine continue de
// remonter (process non-zero), c'est le comportement attendu.
let browser;
let context;
let leadSeconds;
try {
  browser = await chromium.launch({ channel: 'chrome' });
  context = await browser.newContext({
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
  leadSeconds = (performance.now() - leadStart) / 1000;

  if (clickSelector) {
    // Scénario liste → détail (ex. cuisine.vferries) : bref scroll de la liste
    // (LIST_BUDGET_SHARE du budget temps), clic sur l'élément ciblé, chargement
    // de la page détail, puis scroll de cette page pour le reste du budget.
    const listBudgetMs = MAX_SCROLL_MS * LIST_BUDGET_SHARE;
    const listDistance = clampDistance(await scrollableHeight(page), (SCROLL_SPEED_PX_S * listBudgetMs) / 1000);
    if (listDistance > 0) await linearScrollTo(page, listDistance, (listDistance / SCROLL_SPEED_PX_S) * 1000);

    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.click(clickSelector),
    ]);
    await page.waitForTimeout(CLICK_SETTLE_MS);

    const detailBudgetMs = MAX_SCROLL_MS * (1 - LIST_BUDGET_SHARE);
    const detailDistance = clampDistance(await scrollableHeight(page), (SCROLL_SPEED_PX_S * detailBudgetMs) / 1000);
    if (detailDistance > 0) await linearScrollTo(page, detailDistance, (detailDistance / SCROLL_SPEED_PX_S) * 1000);
  } else {
    const distance = clampDistance(await scrollableHeight(page), MAX_SCROLL_PX);
    const duration = Math.min((distance / SCROLL_SPEED_PX_S) * 1000, MAX_SCROLL_MS);
    if (distance > 0) await linearScrollTo(page, distance, duration);
  }

  await page.waitForTimeout(SETTLE_MS);
  const video = page.video();
  await context.close();
  await rename(await video.path(), out);
} finally {
  if (context) await context.close().catch(() => {});
  if (browser) await browser.close().catch(() => {});
}

console.log(`LEAD_SECONDS=${leadSeconds.toFixed(2)}`);
