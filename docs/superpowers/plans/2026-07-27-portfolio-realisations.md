# Portfolio « Réalisations » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Section « Réalisations » sur la landing + page `/realisations/` data-driven, portant la nouvelle offre sites vitrines (escalire.fr, justbordas.fr), avec vidéos de scroll capturées via Playwright.

**Architecture:** `_data/realisations.yml` en source unique ; nav + footer extraits d'`index.html` en includes partagés ; page dédiée sur le layout `landing` réutilisé tel quel ; vidéos jouées par une IIFE défensive (IntersectionObserver). Spec validée : `docs/superpowers/specs/2026-07-27-portfolio-realisations-design.md`.

**Tech Stack:** Jekyll (GitHub Pages natif), CSS custom properties (pas de préprocesseur), JS vanilla (pas de build), Playwright-core + Chrome système + ffmpeg pour la capture (isolés dans `tools/`).

## Global Constraints

- Classes préfixées `.ev-` ; styles dans `assets/css/landing.css` uniquement (`enveille.css` intouché)
- JS vanilla en IIFE défensives dans `assets/js/landing.js` (skip si éléments absents)
- Aucune URL de billet ne change ; les 5 services et leur copy restent intacts
- Poids : chaque `work-*.mp4` ≤ 800 Ko, chaque poster ≤ 150 Ko
- Nouvelle dépendance **validée** : `playwright-core` (devDependency, `tools/work-videos/` seulement, `tools/` est exclu du build Jekyll)
- Breakpoints : mobile ≤ 720px, tablette ≤ 1000px
- Commits en français, préfixes conventionnels, un commit = un concern, terminés par `Co-authored-by: Claude <noreply@anthropic.com>` ; commit direct sur `main` (repo solo)
- Vérifs shell numériques : préfixer `LC_ALL=C` (locale fr)
- Pas de framework de test sur ce repo : le cycle de test d'une task = `bundle exec jekyll build` + assertions `grep`/`diff` sur `_site/`, puis vérif visuelle via `bundle exec jekyll serve`
- Faits marqués `# à confirmer` dans le YAML (années, stacks) : valeurs draft, Vincent corrige — ne pas inventer d'autres faits

---

### Task 1: Extraire nav + footer en includes (iso-rendu)

**Files:**
- Create: `_includes/ev-nav.html`
- Create: `_includes/ev-footer.html`
- Modify: `index.html:23-46` (nav) et `index.html:307-309` (footer)

**Interfaces:**
- Produces: `{% include ev-nav.html root="..." current="..." %}` — `root` : préfixe des ancres (vide sur `/`, `"/"` ailleurs) ; `current` : slug de la page pour `aria-current` (utilisé en Task 3). `{% include ev-footer.html %}` sans paramètre.

- [ ] **Step 1: Capturer le rendu de référence**

```bash
cd /home/vincent/projects/blog
bundle exec jekyll build -q
cp _site/index.html /tmp/claude-1000/-home-vincent-projects-blog/ef2c8a15-cb9d-4b78-b876-c4abde966b52/scratchpad/index-before.html
```

- [ ] **Step 2: Créer `_includes/ev-nav.html`**

Contenu = copie exacte d'`index.html:23-46`, avec les ancres préfixées par `{{ include.root }}` :

```html
{% comment %}
  Nav partagée landing / pages ev-*.
  root : préfixe des liens ancre — vide sur `/`, "/" sur les autres pages.
  current : slug de la page courante, pour aria-current (ex: "realisations").
{% endcomment %}
<!-- NAV -->
<nav class="ev-nav" id="ev-top">
  <div class="ev-nav__inner">
    <a href="/" class="ev-nav__brand">
      <img src="{{ '/images/logo.svg' | relative_url }}" alt=""> En Veille
    </a>
    <ul class="ev-nav__links" id="ev-nav-menu">
      <li><a href="{{ include.root }}#services">Services</a></li>
      <li><a href="{{ include.root }}#about">À propos</a></li>
      <li><a href="{{ '/blog/' | relative_url }}">Blog</a></li>
      <li><a href="https://vferries.github.io/cv/" rel="noopener">CV</a></li>
      <li><a href="{{ include.root }}#contact">Contact</a></li>
      <li class="ev-nav__status-item"><span class="ev-nav__status"><span class="ev-status-dot"></span>Disponible</span></li>
    </ul>
    <span class="ev-nav__status"><span class="ev-status-dot"></span>Disponible</span>
    <button class="ev-nav__burger" type="button" aria-expanded="false"
            aria-controls="ev-nav-menu" aria-label="Menu">
      <span></span><span></span><span></span>
      <svg class="ev-nav__power" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v8"/><path d="M6.3 6.6a8 8 0 1 0 11.4 0"/>
      </svg>
    </button>
  </div>
</nav>
```

(Le lien « Réalisations » n'est PAS ajouté ici — Task 3, quand la section existera.)

- [ ] **Step 3: Créer `_includes/ev-footer.html`**

Copie exacte d'`index.html:307-309` :

```html
<footer class="ev-footer">
  © {{ site.time | date: "%Y" }} En Veille — <a href="{{ '/feed.xml' | relative_url }}">RSS</a> — Fait à Toulouse with :heart: and chocolatines
</footer>
```

- [ ] **Step 4: Remplacer dans `index.html`**

Le bloc nav (`<!-- NAV -->` jusqu'à `</nav>`, lignes 23-46) devient :

```liquid
{% include ev-nav.html %}
```

Le bloc footer (`<footer class="ev-footer">…</footer>`, lignes 307-309) devient :

```liquid
{% include ev-footer.html %}
```

- [ ] **Step 5: Vérifier l'iso-rendu**

```bash
bundle exec jekyll build -q
diff -B -w /tmp/claude-1000/-home-vincent-projects-blog/ef2c8a15-cb9d-4b78-b876-c4abde966b52/scratchpad/index-before.html _site/index.html
```

Expected: aucune différence (whitespace toléré via `-B -w`). Toute autre différence = bug d'extraction, corriger avant de continuer.

- [ ] **Step 6: Commit**

```bash
git add _includes/ev-nav.html _includes/ev-footer.html index.html
git commit -m "refactor: extrait nav et footer de la landing en includes partagés

Préparation de la page /realisations/ : ev-nav.html (paramètres root/current)
et ev-footer.html, rendu strictement identique.

Co-authored-by: Claude <noreply@anthropic.com>"
```

---

### Task 2: Outillage `tools/work-videos/` + génération des assets

**Files:**
- Create: `tools/work-videos/package.json`
- Create: `tools/work-videos/.gitignore`
- Create: `tools/work-videos/record.mjs`
- Create: `tools/work-videos/record.sh`
- Create: `tools/work-videos/README.md`
- Create (générés): `assets/video/work-escalire.mp4`, `assets/video/work-justbordas.mp4`, `assets/video/work-cuisine.mp4`, `images/work-escalire-poster.jpg`, `images/work-justbordas-poster.jpg`, `images/work-cuisine-poster.jpg`

**Interfaces:**
- Produces: `./tools/work-videos/record.sh <slug> <url>` → `assets/video/work-<slug>.mp4` (800×500, H.264, muet, faststart) + `images/work-<slug>-poster.jpg` (frame 0). Ces chemins sont référencés par `_data/realisations.yml` (Task 3).
- Consumes: `google-chrome` système (déjà requis par `tools/og-card/`), `ffmpeg` (déjà requis par `tools/hero-video/`), `node`/`npm`.

- [ ] **Step 1: Créer `tools/work-videos/package.json`**

`playwright-core` (et non `playwright`) : pas de téléchargement de navigateur, on lance le Chrome système via `channel: 'chrome'`.

```json
{
  "name": "work-videos",
  "private": true,
  "type": "module",
  "devDependencies": {
    "playwright-core": "^1.45.0"
  }
}
```

- [ ] **Step 2: Créer `tools/work-videos/.gitignore`**

```
node_modules/
```

- [ ] **Step 3: Créer `tools/work-videos/record.mjs`**

```js
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
```

- [ ] **Step 4: Créer `tools/work-videos/record.sh`** (puis `chmod +x`)

```bash
#!/bin/bash
# Capture + encode la vidéo de scroll d'une réalisation.
# Usage :
#   ./tools/work-videos/record.sh <slug> <url>
# Produit :
#   assets/video/work-<slug>.mp4     (800x500, H.264 muet, faststart)
#   images/work-<slug>-poster.jpg    (frame 0)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

SLUG="${1:?Usage: ./tools/work-videos/record.sh <slug> <url>}"
URL="${2:?Usage: ./tools/work-videos/record.sh <slug> <url>}"

command -v ffmpeg >/dev/null || { echo "ffmpeg introuvable dans le PATH." >&2; exit 1; }
command -v node   >/dev/null || { echo "node introuvable dans le PATH." >&2; exit 1; }
[ -d "$DIR/node_modules" ] || (cd "$DIR" && npm install)

RAW="$(mktemp -u "${TMPDIR:-/tmp}/work-XXXXXX").webm"
trap 'rm -f "$RAW"' EXIT

node "$DIR/record.mjs" "$URL" "$RAW"

mkdir -p "$ROOT/assets/video"
ffmpeg -y -v error -i "$RAW" -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -preset slow -crf 28 -vf "scale=800:500" -movflags +faststart \
  "$ROOT/assets/video/work-$SLUG.mp4"

ffmpeg -y -v error -i "$ROOT/assets/video/work-$SLUG.mp4" -frames:v 1 -q:v 6 \
  "$ROOT/images/work-$SLUG-poster.jpg"

du -h "$ROOT/assets/video/work-$SLUG.mp4" "$ROOT/images/work-$SLUG-poster.jpg"
```

- [ ] **Step 5: Créer `tools/work-videos/README.md`**

````markdown
# work-videos — vidéos de scroll des réalisations

Capture le scroll d'un site (Playwright + Chrome système) et l'encode pour
les cartes de la section/page Réalisations.

## Usage

```bash
./tools/work-videos/record.sh escalire https://escalire.fr
./tools/work-videos/record.sh justbordas https://justbordas.fr
./tools/work-videos/record.sh cuisine https://vferries.github.io/cuisine/
```

Produit `assets/video/work-<slug>.mp4` (800×500, H.264 muet, ≤ 800 Ko visé)
et `images/work-<slug>-poster.jpg`. À relancer quand un site évolue —
capture reproductible (viewport 1280×800, scroll easé 7 s).

## Dépendances

- `node` + `npm` (`npm install` auto au premier run — `playwright-core` seul,
  pas de navigateur téléchargé : on utilise le `google-chrome` système)
- `ffmpeg`

Comme tout `tools/`, exclu du build Jekyll.
````

- [ ] **Step 6: Tester le script sur un site (échec attendu d'abord : vérifier le garde-fou)**

```bash
./tools/work-videos/record.sh 2>&1 | head -2
```

Expected: `Usage: ./tools/work-videos/record.sh <slug> <url>` (exit ≠ 0).

- [ ] **Step 7: Générer les 6 assets**

```bash
./tools/work-videos/record.sh escalire https://escalire.fr
./tools/work-videos/record.sh justbordas https://justbordas.fr
./tools/work-videos/record.sh cuisine https://vferries.github.io/cuisine/
```

Expected: les 6 fichiers créés, tailles affichées par `du -h`.

- [ ] **Step 8: Vérifier le budget poids**

```bash
LC_ALL=C find assets/video -name 'work-*.mp4' -size +800k
LC_ALL=C find images -name 'work-*-poster.jpg' -size +150k
```

Expected: aucune sortie. Si un mp4 dépasse : remonter `-crf` à 30 (voire 32) dans `record.sh` et régénérer.

- [ ] **Step 9: Contrôle visuel des vidéos**

```bash
xdg-open assets/video/work-escalire.mp4
xdg-open assets/video/work-justbordas.mp4
```

Vérifier : scroll fluide du haut vers le bas, animations des sites visibles (pas d'éléments figés en état pré-reveal), pas d'écran blanc au départ.

- [ ] **Step 10: Commits (outillage puis assets, deux concerns)**

```bash
git add tools/work-videos/
git commit -m "feat: outillage de capture des vidéos de scroll (tools/work-videos)

Playwright-core (devDependency isolée, Chrome système via channel) + ffmpeg.
./tools/work-videos/record.sh <slug> <url> → mp4 800x500 + poster.

Co-authored-by: Claude <noreply@anthropic.com>"

git add assets/video/work-*.mp4 images/work-*-poster.jpg
git commit -m "feat: vidéos de scroll escalire.fr et justbordas.fr + posters

Co-authored-by: Claude <noreply@anthropic.com>"
```

---

### Task 3: Données + section landing `#realisations`

**Files:**
- Create: `_data/realisations.yml`
- Modify: `index.html` (dot quick-nav ligne ~17 ; section après `</section>` des services ligne ~198)
- Modify: `_includes/ev-nav.html` (lien Réalisations)
- Modify: `assets/css/landing.css` (styles `.ev-work*`, délai burger 7e item)

**Interfaces:**
- Consumes: `{% include ev-nav.html %}` (Task 1), assets `work-*.mp4` / `work-*-poster.jpg` (Task 2).
- Produces: `site.data.realisations` — liste d'objets `{slug, name, url, domain, kind, location, year, pitch, story, stack, video, poster}` consommée aussi par la page (Task 4). Classes CSS `.ev-work__video`, `.ev-work__domain`, `.ev-work__meta` réutilisées en Task 4 et 5.

- [ ] **Step 1: Créer `_data/realisations.yml`**

```yaml
# Réalisations publiques — source unique (section landing + page /realisations/).
# Ajouter un projet = 1 entrée ici + ./tools/work-videos/record.sh <slug> <url>
- slug: escalire
  name: Librairie Escalire
  url: https://escalire.fr
  domain: escalire.fr
  kind: Librairie indépendante
  location: Escalquens
  year: 2026 # à confirmer
  pitch: >
    La vitrine d'une librairie indépendante : l'équipe, les rayons, les
    événements — et la commande en ligne sans algorithme.
  story: |
    Une librairie de quartier qui voulait exister en ligne sans passer par
    une usine e-commerce. On a fait l'inverse : un site vitrine chaleureux
    qui donne envie de pousser la porte — l'équipe, les rayons, les
    événements — et qui délègue la commande en ligne aux partenaires
    libraires (Place des Libraires). Léger, rapide, lisible sur mobile.
  stack: [HTML, CSS, JavaScript] # à confirmer
  video: /assets/video/work-escalire.mp4
  poster: /images/work-escalire-poster.jpg

- slug: justbordas
  name: Just Bordas
  url: https://justbordas.fr
  domain: justbordas.fr
  kind: Ferronnerie d'art
  location: Toulouse
  year: 2025 # à confirmer
  pitch: >
    Le portfolio d'un ferronnier d'art : pièces uniques en acier, verre et
    bois, mises en valeur sans fioritures.
  story: |
    Un artisan ferronnier — escaliers, cheminées, mobilier sur mesure — qui
    avait besoin d'un portfolio à la hauteur de ses pièces. Galeries photo
    soignées, prise de contact simple, mise en scène sobre : le site
    s'efface, le travail parle.
  stack: [HTML, CSS, JavaScript] # à confirmer
  video: /assets/video/work-justbordas.mp4
  poster: /images/work-justbordas-poster.jpg

- slug: cuisine
  name: Recettes de cuisine
  url: https://vferries.github.io/cuisine/
  domain: vferries.github.io/cuisine
  kind: Projet perso
  year: 2026
  pitch: >
    Mes recettes écrites en Cooklang, servies par un site Astro — recherche
    par ingrédients, filtres, favoris — et une app Android.
  story: |
    Un projet perso pour joindre la cuisine au code : les recettes sont
    écrites en Cooklang, un site Astro les sert — recherche par ingrédients,
    filtres par type, difficulté ou régime, tris, favoris — et une app
    Android les embarque. Le même soin que pour un site client, appliqué
    au plaisir.
  stack: [Astro, TypeScript, Cooklang, Kotlin]
  video: /assets/video/work-cuisine.mp4
  poster: /images/work-cuisine-poster.jpg
```

Note : `location` est absent du projet perso — le markup l'affiche
conditionnellement, comme `year`.

- [ ] **Step 2: Ajouter le dot quick-nav dans `index.html`**

Entre le dot Services et le dot À propos (ligne ~17-18) :

```html
  <a href="#realisations" class="ev-quick-nav__dot" data-label="Réalisations" data-target="realisations"></a>
```

- [ ] **Step 3: Ajouter le lien nav dans `_includes/ev-nav.html`**

Entre Services et À propos :

```html
      <li><a href="{{ include.root }}#realisations"{% if include.current == 'realisations' %} aria-current="page"{% endif %}>Réalisations</a></li>
```

- [ ] **Step 4: Insérer la section dans `index.html`**

Après le `</section>` de `#services` (ligne ~198), avant `<!-- ABOUT -->` :

```html
<!-- RÉALISATIONS -->
<section class="ev-work" id="realisations">
  <div class="ev-section-head ev-reveal">
    <div>
      <p class="ev-section-kicker">réalisations</p>
      <h2 class="ev-section-title">Des sites <em>faits main</em>, aussi</h2>
    </div>
    <p class="ev-section-sub">En Veille, c'est aussi des sites vitrines pour commerçants et artisans. Conçus, développés et mis en ligne en direct — rapides, lisibles, sans usine à gaz.</p>
  </div>

  <div class="ev-work__grid ev-reveal--stagger">
    {% for r in site.data.realisations %}
    <article class="ev-work__card">
      <a class="ev-work__media" href="{{ r.url }}" rel="noopener" aria-label="Visiter {{ r.domain }}">
        <video class="ev-work__video" muted loop playsinline preload="none"
               poster="{{ r.poster | relative_url }}"
               src="{{ r.video | relative_url }}" aria-hidden="true"></video>
      </a>
      <div class="ev-work__body">
        <h3 class="ev-work__name">{{ r.name }} <a href="{{ r.url }}" rel="noopener" class="ev-work__domain">{{ r.domain }} ↗</a></h3>
        <div class="ev-work__meta"><span>{{ r.kind }}</span>{% if r.location %}<span>{{ r.location }}</span>{% endif %}{% if r.year %}<span>{{ r.year }}</span>{% endif %}</div>
        <p class="ev-work__pitch">{{ r.pitch }}</p>
      </div>
    </article>
    {% endfor %}
  </div>

  <div class="ev-work__foot ev-reveal">
    <a href="{{ '/realisations/' | relative_url }}" class="ev-btn ev-btn--primary">
      Voir les réalisations
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
    <span class="ev-work__hint">Vous êtes commerçant ou artisan ? <a href="#contact">Parlons-en</a></span>
  </div>
</section>
```

- [ ] **Step 5: Ajouter les styles dans `assets/css/landing.css`**

Nouveau bloc après le bloc SERVICES (repérer `/* ====… ABOUT` et insérer avant) :

```css
/* ============================================================
   RÉALISATIONS (offre sites vitrines)
   ============================================================ */
.ev-work {
  max-width: 1200px; margin: 0 auto;
  padding: 120px 32px 80px;
}
.ev-work__grid {
  display: grid; gap: 24px;
  grid-template-columns: 1fr;
}
@media (min-width: 760px) { .ev-work__grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1000px) { .ev-work__grid { grid-template-columns: repeat(3, 1fr); } }
.ev-work__card {
  background: var(--ev-bg);
  border: 1px solid var(--ev-border-strong);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 300ms var(--ease-out), box-shadow 300ms var(--ease-out);
}
.ev-work__card:hover {
  border-color: var(--ev-blue);
  box-shadow: 0 30px 50px -30px rgba(0, 27, 61, 0.2);
}
.ev-work__media {
  display: block; aspect-ratio: 16 / 10;
  background: var(--ev-bg-subtle);
}
.ev-work__video { width: 100%; height: 100%; object-fit: cover; display: block; }
.ev-work__body { padding: 24px 28px 28px; }
.ev-work__name {
  font-family: var(--font-display); font-weight: 500;
  font-size: 1.375rem; margin: 0 0 10px;
  display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap;
}
.ev-work__domain {
  font-family: var(--font-mono); font-size: 0.8125rem;
  color: var(--ev-blue);
  transition: color 200ms var(--ease-out);
}
.ev-work__domain:hover { color: var(--ev-text); }
.ev-work__meta {
  font-family: var(--font-mono); font-size: 0.75rem;
  color: var(--ev-text-subtle);
  display: flex; gap: 10px; flex-wrap: wrap;
  margin-bottom: 14px;
}
.ev-work__meta span::before { content: "· "; color: var(--ev-text-subtle); }
.ev-work__meta span:first-child::before { content: ""; }
.ev-work__pitch {
  margin: 0; color: var(--ev-text-muted);
  font-size: 1rem; line-height: 1.6;
}
.ev-work__foot {
  margin-top: 48px;
  display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
}
.ev-work__hint { color: var(--ev-text-muted); font-size: 0.9375rem; }
.ev-work__hint a {
  color: var(--ev-blue);
  text-decoration: underline; text-underline-offset: 3px;
}
```

- [ ] **Step 6: Délai du 7e item du burger**

Dans `landing.css`, après la ligne `.ev-nav--open .ev-nav__links li:nth-child(6) { transition-delay: 440ms; }` (~ligne 222) :

```css
  .ev-nav--open .ev-nav__links li:nth-child(7) { transition-delay: 490ms; }
```

(La pastille « Disponible » `.ev-nav__status-item` devient le 7e item — le lien Réalisations décale tout d'un cran.)

- [ ] **Step 7: Vérifier le rendu généré**

```bash
bundle exec jekyll build -q
grep -c 'id="realisations"' _site/index.html          # expected: 1
grep -c 'work-escalire.mp4' _site/index.html          # expected: 1
grep -c 'work-justbordas.mp4' _site/index.html        # expected: 1
grep -c 'work-cuisine.mp4' _site/index.html           # expected: 1
grep -c 'data-target="realisations"' _site/index.html # expected: 1
grep -c 'href="#realisations"' _site/index.html       # expected: 2 (dot quick-nav + lien nav)
```

- [ ] **Step 8: Vérif visuelle**

`bundle exec jekyll serve` → http://localhost:4000 : section entre Services et À propos, posters visibles dans les cadres 16:10, dot quick-nav actif sur la section, lien nav présent (desktop + burger ≤ 720px, animation d'ouverture OK avec 7 items), dark mode OK.

- [ ] **Step 9: Commit**

```bash
git add _data/realisations.yml index.html _includes/ev-nav.html assets/css/landing.css
git commit -m "feat: section réalisations sur la landing (offre sites vitrines)

Data-driven via _data/realisations.yml (escalire.fr, justbordas.fr),
cartes vidéo 16:10, dot quick-nav et lien nav dédiés.

Co-authored-by: Claude <noreply@anthropic.com>"
```

---

### Task 4: Page `/realisations/` + OG card

**Files:**
- Create: `_pages/realisations.html`
- Create (généré): `images/og-realisations.png`
- Modify: `_layouts/landing.html:15,19` (override `page.og_image`)
- Modify: `assets/css/landing.css` (styles `.ev-work-hero`, `.ev-work-list`, `.ev-work-detail*`)

**Interfaces:**
- Consumes: `site.data.realisations` (Task 3), `ev-nav.html` avec `root`/`current` (Tasks 1+3), `ev-footer.html` (Task 1), classes `.ev-work__video`, `.ev-work__domain`, `.ev-work__meta` (Task 3), styles `.ev-cta` existants.
- Produces: page `/realisations/`, front matter `og_image` honoré par le layout `landing`.

- [ ] **Step 1: Override OG dans `_layouts/landing.html`**

Remplacer les deux lignes image (15 et 19) :

```html
  <meta property="og:image" content="{{ page.og_image | default: '/images/og-card.png' | absolute_url }}">
```

```html
  <meta name="twitter:image" content="{{ page.og_image | default: '/images/og-card.png' | absolute_url }}">
```

- [ ] **Step 2: Générer l'OG card dédiée**

```bash
./tools/og-card/generate.sh -o images/og-realisations.png \
  -q 'eyebrow=r%C3%A9alisations&title=Des%20sites%20faits%20main&tagline=Sites%20vitrines%20pour%20commer%C3%A7ants%20et%20artisans&domain=www.enveille.info'
```

Vérifier visuellement (`xdg-open images/og-realisations.png`) : accents rendus, texte non tronqué.

- [ ] **Step 3: Créer `_pages/realisations.html`**

```html
---
layout: landing
title: "Réalisations — sites vitrines faits main · En Veille"
description: "Sites vitrines pour commerçants et artisans, conçus et développés en direct par Vincent Ferries. Librairie Escalire, Just Bordas."
permalink: /realisations/
og_image: /images/og-realisations.png
---

<div class="ev-landing">

{% include ev-nav.html root="/" current="realisations" %}

<main id="main">

<header class="ev-work-hero">
  <p class="ev-section-kicker">réalisations</p>
  <h1 class="ev-section-title">Des sites <em>faits main</em></h1>
  <p class="ev-work-hero__lede">Pour les commerçants et artisans qui veulent exister en ligne sans usine à gaz : un site conçu, développé et mis en ligne en direct — rapide, lisible, à votre image. Voilà ce que ça donne.</p>
</header>

<div class="ev-work-list">
  {% for r in site.data.realisations %}
  <article class="ev-work-detail ev-reveal" id="{{ r.slug }}">
    <a class="ev-work-detail__media" href="{{ r.url }}" rel="noopener" aria-label="Visiter {{ r.domain }}">
      <video class="ev-work__video" muted loop playsinline preload="none"
             poster="{{ r.poster | relative_url }}"
             src="{{ r.video | relative_url }}" aria-hidden="true"></video>
    </a>
    <div class="ev-work-detail__body">
      <h2 class="ev-work-detail__name">{{ r.name }}</h2>
      <a class="ev-work__domain" href="{{ r.url }}" rel="noopener">{{ r.domain }} ↗</a>
      <div class="ev-work__meta"><span>{{ r.kind }}</span>{% if r.location %}<span>{{ r.location }}</span>{% endif %}{% if r.year %}<span>{{ r.year }}</span>{% endif %}</div>
      {{ r.story | markdownify }}
      <div class="ev-work-detail__stack">
        {% for s in r.stack %}<span>{{ s }}</span>{% endfor %}
      </div>
    </div>
  </article>
  {% endfor %}
</div>

<div class="ev-cta-wrap">
<section class="ev-cta ev-reveal">
  <h2>Le même pour <em>votre</em> commerce ?</h2>
  <p>Racontez-moi votre activité et ce que vous voulez montrer — je vous dis ce qui est possible, en combien de temps, et pour combien. Pas de formulaire : un email, et on en discute.</p>
  <a href="mailto:vincent.ferries@gmail.com?subject=Site%20vitrine" class="ev-cta__email">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    vincent.ferries@gmail.com
  </a>
</section>
</div>

</main>

{% include ev-footer.html %}

</div>
```

- [ ] **Step 4: Styles page dans `assets/css/landing.css`**

À la suite du bloc RÉALISATIONS de la Task 3 :

```css
/* --- page /realisations/ --- */
.ev-work-hero {
  max-width: 1200px; margin: 0 auto;
  padding: 96px 32px 24px;
}
.ev-work-hero__lede {
  font-size: 1.0625rem; color: var(--ev-text-muted);
  max-width: 54ch; line-height: 1.7;
  margin: 24px 0 0;
}
.ev-work-list {
  max-width: 1200px; margin: 0 auto;
  padding: 48px 32px 96px;
  display: grid; gap: 96px;
}
.ev-work-detail {
  display: grid; gap: 32px; align-items: center;
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .ev-work-detail { grid-template-columns: 1.2fr 1fr; gap: 64px; }
  .ev-work-detail:nth-child(even) .ev-work-detail__media { order: 2; }
}
.ev-work-detail__media {
  display: block; aspect-ratio: 16 / 10;
  border-radius: 10px; overflow: hidden;
  border: 1px solid var(--ev-border-strong);
  background: var(--ev-bg-subtle);
  transition: border-color 300ms var(--ease-out), box-shadow 300ms var(--ease-out);
}
.ev-work-detail__media:hover {
  border-color: var(--ev-blue);
  box-shadow: 0 30px 50px -30px rgba(0, 27, 61, 0.2);
}
.ev-work-detail__name {
  font-family: var(--font-display); font-weight: 500;
  font-variation-settings: 'opsz' 144;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.05; margin: 0 0 8px;
}
.ev-work-detail__body .ev-work__meta { margin: 12px 0 18px; }
.ev-work-detail__body p {
  color: var(--ev-text-muted); line-height: 1.7;
  margin: 0 0 16px; max-width: 54ch;
}
.ev-work-detail__stack { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.ev-work-detail__stack span {
  font-family: var(--font-mono); font-size: 0.75rem;
  color: var(--ev-text-subtle);
  border: 1px solid var(--ev-border-strong); border-radius: 999px;
  padding: 4px 12px;
}
```

- [ ] **Step 5: Vérifier le rendu généré**

```bash
bundle exec jekyll build -q
test -f _site/realisations/index.html && echo OK          # expected: OK
grep -c 'aria-current="page"' _site/realisations/index.html   # expected: 1
grep -c 'og-realisations.png' _site/realisations/index.html   # expected: 2 (og + twitter)
grep -c 'og-card.png' _site/index.html                        # expected: 2 (fallback intact)
grep -c 'Site%20vitrine' _site/realisations/index.html        # expected: 1
grep -c 'ev-work-detail' _site/realisations/index.html        # expected: ≥ 3
grep -c 'href="/#services"' _site/realisations/index.html     # expected: 1 (root="/")
```

- [ ] **Step 6: Vérif visuelle**

`bundle exec jekyll serve` → http://localhost:4000/realisations/ : nav identique à la landing (lien Réalisations souligné actif), alternance media/texte ≥ 900px, empilé en dessous, stack en pastilles mono, CTA final, footer présent, dark mode OK. Vérifier aussi que la sitemap contient la page : `grep realisations _site/sitemap.xml`.

- [ ] **Step 7: Commit**

```bash
git add _pages/realisations.html _layouts/landing.html assets/css/landing.css images/og-realisations.png
git commit -m "feat: page /realisations/ détaillée

Blocs alternés media/récit depuis _data/realisations.yml, CTA mailto
dédié (sujet « Site vitrine »), OG card propre via page.og_image.

Co-authored-by: Claude <noreply@anthropic.com>"
```

---

### Task 5: Lecture des vidéos (IIFE `initWorkVideos`)

**Files:**
- Modify: `assets/js/landing.js` (insérer avant le bloc `// CONSOLE MESSAGE`, ~ligne 497)

**Interfaces:**
- Consumes: éléments `.ev-work__video` (Tasks 3+4).
- Produces: rien (feature terminale).

- [ ] **Step 1: Ajouter l'IIFE**

```js
  // ==========================================================
  // RÉALISATIONS — vidéos de scroll jouées à la visibilité
  // Pas d'attribut autoplay : reduced-motion et no-JS => poster.
  // ==========================================================
  (function initWorkVideos() {
    const videos = document.querySelectorAll('.ev-work__video');
    if (!videos.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const play = (v) => { v.muted = true; v.play().catch(() => {}); };
    if (!('IntersectionObserver' in window)) { videos.forEach(play); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) play(e.target);
        else e.target.pause();
      });
    }, { threshold: 0.25 });
    videos.forEach((v) => io.observe(v));
  })();
```

- [ ] **Step 2: Vérifier lecture/pause**

`bundle exec jekyll serve`, sur `/` et `/realisations/` :
- scroller jusqu'aux cartes → les vidéos démarrent ;
- scroller au-delà → DevTools : `document.querySelectorAll('.ev-work__video')[0].paused` répond `true` quand la carte est hors viewport, `false` quand elle est visible.

- [ ] **Step 3: Vérifier les dégradations**

- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → recharger : posters statiques, `paused === true` partout.
- DevTools → Settings → Debugger → Disable JavaScript → recharger : posters statiques, layout intact.

- [ ] **Step 4: Commit**

```bash
git add assets/js/landing.js
git commit -m "feat: lecture des vidéos réalisations à la visibilité

IntersectionObserver play/pause, respect de prefers-reduced-motion,
poster statique sans JS.

Co-authored-by: Claude <noreply@anthropic.com>"
```

---

### Task 6: Documentation (AGENTS.md, NEXT.md)

**Files:**
- Modify: `AGENTS.md` (cible réelle du symlink `CLAUDE.md`)
- Modify: `NEXT.md`

**Interfaces:**
- Consumes: rien. Produces: rien (docs).

- [ ] **Step 1: Mettre à jour `AGENTS.md`**

1. Section « Structure » — ajouter la route et le data file :

```
/realisations/       # page réalisations (offre sites vitrines)
```

et dans la liste sous le bloc : `_data/realisations.yml` : réalisations publiques (source unique de la section landing `#realisations` et de `/realisations/`) ; `_includes/ev-nav.html` / `_includes/ev-footer.html` : nav et footer partagés landing ↔ pages ev-*.

2. Section « Features JS de la landing (à ne pas casser) » — ajouter :

```
- **Vidéos réalisations** : `.ev-work__video` jouées/pausées à la visibilité
  (IntersectionObserver), jamais en `prefers-reduced-motion`, poster sans JS.
```

3. Section « Outillage » — ajouter après « Vidéo hero (chouette) » :

```
### Vidéos réalisations (scroll des sites clients)

\`\`\`bash
./tools/work-videos/record.sh <slug> <url>
# → assets/video/work-<slug>.mp4, images/work-<slug>-poster.jpg
\`\`\`

Capture Playwright (`playwright-core` + Chrome système, npm install auto)
puis encodage ffmpeg. Voir `tools/work-videos/README.md`.
```

- [ ] **Step 2: Mettre à jour `NEXT.md`**

1. Dans « 💡 Idées qu'on n'a pas tranchées », remplacer la ligne `- Une page /projets/ avec mini-études de cas de missions passées (avec accord clients)` par :

```
- ~~Une page `/projets/` avec mini-études de cas~~ → fait autrement : `/realisations/` (sites vitrines publics, 2026-07). Reste la piste « missions anonymisées » façon git log à y ajouter (matière à fournir par Vincent).
```

2. Dans « 🔥 Maintenant », ajouter une sous-section :

```
### Réalisations — suites

- [ ] Corriger les faits marqués `# à confirmer` dans `_data/realisations.yml` (années, stacks) — Vincent
- [ ] Valider le copy de la section et de la page (ton, crédibilité commerciale) — Vincent
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md NEXT.md
git commit -m "docs: référence la section/page réalisations et l'outillage work-videos

Co-authored-by: Claude <noreply@anthropic.com>"
```

---

### Task 7: Vérification finale (spec « Vérification avant done »)

**Files:** aucun (sauf fixes découverts).

- [ ] **Step 1: Build propre**

```bash
bundle exec jekyll build 2>&1 | tail -5
```

Expected: pas d'erreur ni warning Liquid.

- [ ] **Step 2: Iso-nav entre les deux pages**

```bash
python3 - <<'EOF'
import re
def nav(p):
    html = open(p).read()
    m = re.search(r'<nav class="ev-nav".*?</nav>', html, re.S)
    return re.sub(r'(href=")/?(#)', r'\1\2', m.group(0))  # neutralise le préfixe root
a, b = nav('_site/index.html'), nav('_site/realisations/index.html')
print('NAV OK' if a.replace('aria-current="page" ', '').replace(' aria-current="page"', '')
      == b.replace('aria-current="page" ', '').replace(' aria-current="page"', '') else 'NAV DIFF')
EOF
```

Expected: `NAV OK`. Même check à l'œil pour le footer (2 lignes).

- [ ] **Step 3: Passe visuelle complète**

`bundle exec jekyll serve` puis, sur `/` ET `/realisations/` :

- [ ] Responsive : 360px, 720px, 1000px, desktop (DevTools device toolbar)
- [ ] Burger ≤ 720px : 7 items animés, lien Réalisations ferme le panneau au clic
- [ ] Quick-nav (landing) : dot Réalisations s'active au bon moment, remonte en haut OK
- [ ] Dark mode (DevTools → Rendering → prefers-color-scheme: dark)
- [ ] Reduced motion : aucun autoplay
- [ ] JS désactivé : posters, layout intact
- [ ] Les liens externes des cartes ouvrent bien escalire.fr / justbordas.fr / vferries.github.io/cuisine

- [ ] **Step 4: Budget poids final**

```bash
LC_ALL=C du -k assets/video/work-*.mp4 images/work-*-poster.jpg images/og-realisations.png
```

Expected: mp4 ≤ 800 Ko, posters ≤ 150 Ko chacun.

- [ ] **Step 5: Fixes éventuels puis push**

Tout écart trouvé = fix + commit dédié (`fix: …`). Puis :

```bash
git push
```

Tester en prod sur `www.enveille.info` après déploiement GitHub Pages (section landing, page, partage OG via un validateur type opengraph.xyz).
