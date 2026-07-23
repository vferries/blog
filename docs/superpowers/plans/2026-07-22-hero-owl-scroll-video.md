# Hero vidéo « chouette » pilotée au scroll — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intégrer la vidéo chouette (rotation de tête + yeux power + envol) en fond full-bleed du hero de la landing, scrubée au scroll pendant un pin sticky, avec envol joué une fois à la libération du pin.

**Architecture:** Un wrapper haut (`.ev-hero-pin`, 220vh) contient le hero passé en `position: sticky` plein viewport ; une IIFE dans `landing.js` mappe la progression du scroll dans le wrapper sur `video.currentTime` (0→2,2 s), puis déclenche `play()` (2,2→5 s) quand le pin se libère. Les assets vidéo sont encodés avec keyframes denses sur la portion scrubée via un script `tools/hero-video/encode.sh`.

**Tech Stack:** Jekyll (GitHub Pages, pas de build custom), CSS custom properties (pas de préprocesseur), JS vanilla (IIFE, pas de framework), ffmpeg/ffprobe pour l'encodage.

**Spec :** `docs/superpowers/specs/2026-07-22-hero-owl-scroll-video-design.md` (lire en premier)

## Global Constraints

- JS vanilla uniquement, une IIFE par feature dans `assets/js/landing.js`, défensif (API absente → skip, pas de crash)
- CSS custom properties uniquement, classes préfixées `.ev-`, pas de préprocesseur
- Aucune dépendance nouvelle (ffmpeg/ffprobe/chrome sont des outils locaux déjà utilisés par `tools/`)
- Les URLs des billets ne changent jamais ; ne pas toucher au front matter existant
- Le bloc texte du hero (tag, H1, lede, CTA) ne change pas d'un caractère
- Responsive : mobile ≤ 720px, tablette ≤ 1000px
- Commits en français, convention `feat:`/`docs:`/etc., **pas de co-auteur**
- Constantes de réglage (`SPLIT = 2.2`, `POWER_THRESHOLD = 0.65`, hauteurs de pin 220vh/180vh) : valeurs de départ, ajustables en Task 5 uniquement
- Pas de framework de test sur ce repo : chaque task se vérifie par build Jekyll, assertions shell (ffprobe, `node --check`) et contrôle visuel

---

### Task 1: Encodage des assets vidéo (`tools/hero-video/`)

**Files:**
- Create: `tools/hero-video/encode.sh` (exécutable)
- Create: `tools/hero-video/README.md`
- Create (générés) : `assets/video/hero-owl.mp4`, `assets/video/hero-owl-540.mp4`, `images/hero-owl-poster.jpg`

**Interfaces:**
- Consumes: la vidéo source `~/Téléchargements/openart-02178475332237200000000000000000000ffffc0a8a216930469_1784753513105_67369037.mp4` (1920×1080, 24 fps, 5,04 s — **non commitée**)
- Produces: les trois assets ci-dessus, servis par GitHub Pages aux chemins `/assets/video/hero-owl.mp4`, `/assets/video/hero-owl-540.mp4`, `/images/hero-owl-poster.jpg` (consommés par les Tasks 3 et 4)

- [ ] **Step 1: Écrire `tools/hero-video/encode.sh`**

```bash
#!/bin/bash
# Encode la vidéo hero "chouette" pour le scrub au scroll de la landing.
# La portion scrubée (0 → 2,3 s) est encodée en keyframes denses
# (une par frame) pour que video.currentTime seek net ; le reste
# (envol, joué en lecture normale) garde un GOP classique.
# Usage :
#   ./tools/hero-video/encode.sh <source.mp4>
# Produit :
#   assets/video/hero-owl.mp4      (desktop 1080p)
#   assets/video/hero-owl-540.mp4  (mobile 960x540)
#   images/hero-owl-poster.jpg     (frame 0, fond statique no-JS/reduced-motion)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

SOURCE="${1:?Usage: ./tools/hero-video/encode.sh <source.mp4>}"

command -v ffmpeg >/dev/null || { echo "ffmpeg introuvable dans le PATH." >&2; exit 1; }

mkdir -p "$ROOT/assets/video"

COMMON=(-an -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow
        -force_key_frames "expr:lt(t,2.3)" -g 48 -movflags +faststart)

ffmpeg -y -v error -i "$SOURCE" "${COMMON[@]}" -crf 23 \
  "$ROOT/assets/video/hero-owl.mp4"

ffmpeg -y -v error -i "$SOURCE" "${COMMON[@]}" -crf 23 -vf scale=960:540 \
  "$ROOT/assets/video/hero-owl-540.mp4"

ffmpeg -y -v error -i "$SOURCE" -frames:v 1 -q:v 4 \
  "$ROOT/images/hero-owl-poster.jpg"

du -h "$ROOT/assets/video/hero-owl.mp4" \
      "$ROOT/assets/video/hero-owl-540.mp4" \
      "$ROOT/images/hero-owl-poster.jpg"
```

Puis : `chmod +x tools/hero-video/encode.sh`

- [ ] **Step 2: Écrire `tools/hero-video/README.md`**

````markdown
# hero-video — encodage de la vidéo hero « chouette »

La vidéo source est générée sur OpenArt (chouette perchée sous la Voie
lactée : rotation de tête, yeux qui s'allument en symboles power, envol).
Elle n'est **pas commitée** (≈5 Mo, régénérable côté OpenArt). Dernière
source utilisée : `openart-02178475332237200000000000000000000ffffc0a8a216930469_1784753513105_67369037.mp4`
(1920×1080, H.264, 24 fps, 5,04 s).

## Régénérer les assets

```bash
./tools/hero-video/encode.sh ~/Téléchargements/openart-....mp4
```

Produit `assets/video/hero-owl.mp4` (desktop), `assets/video/hero-owl-540.mp4`
(mobile ≤720px) et `images/hero-owl-poster.jpg` (frame 0, fallback statique).

## Pourquoi cet encodage

- `-force_key_frames "expr:lt(t,2.3)"` : la portion 0→2,2 s est scrubée
  via `video.currentTime` au scroll — une keyframe par frame rend le seek
  net. L'envol (2,2→5 s) est joué en lecture normale, GOP classique (`-g 48`).
- `-an` : la piste audio de la source est inutile (autoplay muted de toute façon).
- Timings consommés par `assets/js/landing.js` (IIFE HERO OWL, constante `SPLIT`).

Cibles de poids : desktop ≤ 8 Mo, mobile ≤ 2,5 Mo, poster ≤ 250 Ko.
Si dépassement : monter le CRF (23 → 26) ou passer le desktop en 1440×810.
````

- [ ] **Step 3: Lancer l'encodage**

Run:
```bash
./tools/hero-video/encode.sh ~/Téléchargements/openart-02178475332237200000000000000000000ffffc0a8a216930469_1784753513105_67369037.mp4
```
Expected: trois lignes `du -h`, pas d'erreur ffmpeg.

- [ ] **Step 4: Vérifier les assets (assertions shell)**

Run (pas de piste audio — sortie attendue **vide** pour les deux) :
```bash
ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 assets/video/hero-owl.mp4
ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 assets/video/hero-owl-540.mp4
```

Run (densité de keyframes sur la portion scrubée) :
```bash
ffprobe -v error -select_streams v -show_entries frame=key_frame,pts_time -of csv=p=0 \
  assets/video/hero-owl.mp4 | LC_ALL=C awk -F, '$2 < 2.3 { total++; if ($1 == 1) kf++ } END { print kf "/" total }'
```
Expected: `56/56` (toutes les frames avant 2,3 s sont des keyframes).
(`LC_ALL=C` obligatoire : en locale fr_FR, awk parse la constante `2.3` comme `2` et affiche 48/48 à tort.)

Run (poids) :
```bash
du -b assets/video/hero-owl.mp4 assets/video/hero-owl-540.mp4 images/hero-owl-poster.jpg
```
Expected: ≤ 8 388 608 (desktop), ≤ 2 621 440 (mobile), ≤ 256 000 (poster).
**Si une cible est dépassée** : monter le CRF à 26 dans `encode.sh` (et/ou `-q:v 6` pour le poster), relancer Steps 3–4. Si ça ne suffit pas pour le desktop : ajouter `-vf scale=1440:810` et documenter dans le README. Committer la valeur retenue.

- [ ] **Step 5: Vérifier visuellement le poster**

Ouvrir/lire `images/hero-owl-poster.jpg` : chouette de profil sur la branche, Voie lactée — identique à la frame 0 de la source.

- [ ] **Step 6: Commit**

```bash
git add tools/hero-video/ assets/video/ images/hero-owl-poster.jpg
git commit -m "feat: outillage d'encodage + assets vidéo hero chouette"
```

---

### Task 2: CSS du hero vidéo (`assets/css/landing.css`)

**Files:**
- Modify: `assets/css/landing.css` (insertion d'un bloc après la section HERO existante, juste avant le commentaire `BUTTONS (landing specific)` ~ligne 385)

**Interfaces:**
- Consumes: tokens de `assets/css/enveille.css` (`--ev-bg`, `--brand-cyan`, `--cyan-200`, `--ease-out`, etc.)
- Produces: classes consommées par les Tasks 3 et 4 : `.ev-hero-pin`, `.ev-hero-pin--on`, `.ev-hero--video`, `.ev-hero__bg`, `.ev-hero__scrim`, `.ev-hero--scrub`, `.is-powered`

**Pourquoi cet ordre** : les règles arrivent avant le HTML (Task 3) et le JS (Task 4) — sélecteurs morts un commit durant, aucun impact visuel. `.ev-hero-pin--on` et `.ev-hero--scrub` ne sont posées que par le JS : sans JS ou en reduced-motion, pas de pin (hauteur auto), poster statique, accents allumés d'office.

- [ ] **Step 1: Insérer le bloc CSS**

À insérer dans `landing.css` juste **avant** le commentaire `/* ============================================================\n   BUTTONS (landing specific)` (les règles doivent venir **après** la section HERO existante : `.ev-hero--scrub .ev-hero__title em` est à égalité de spécificité avec `.ev-hero__title em`, c'est l'ordre dans le fichier qui tranche) :

```css
/* ============================================================
   HERO VIDÉO — chouette scrubée au scroll
   .ev-hero-pin--on (hauteur de pin) et .ev-hero--scrub (états
   accents) sont posées par le JS : sans JS ou en reduced motion,
   pas de pin, poster statique, accents allumés d'office.
   ============================================================ */
.ev-hero-pin--on { height: 220vh; }

.ev-hero--video {
  position: sticky; top: 0;
  height: 100svh;
  max-width: none;
  overflow: hidden;
  /* Le ciel étoilé impose son contraste : tokens forcés en variante
     dark quel que soit prefers-color-scheme ; le reste de la page
     ne bouge pas. --ev-bg n'est PAS surchargé (le fondu bas du scrim
     doit rejoindre le fond réel de la page). */
  --ev-text:          #F1EBD9;
  --ev-text-muted:    #C7BEA7;
  --ev-text-subtle:   #9A917C;
  --ev-border:        rgba(241, 235, 217, 0.18);
  --ev-bg-subtle:     rgba(6, 9, 26, 0.55);
  --ev-blue:          #43CFD6;
  --ev-primary:       var(--brand-cyan);
  --ev-primary-hover: var(--cyan-200);
  --ev-on-primary:    var(--brand-navy);
}
.ev-hero--video .ev-hero__grid {
  position: relative; z-index: 2;
  width: 100%; max-width: 1200px; margin: 0 auto;
}
.ev-hero__bg {
  position: absolute; inset: 0; z-index: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  object-position: 62% 50%;
}
.ev-hero__scrim {
  position: absolute; inset: 0; z-index: 1;
  pointer-events: none;
  background:
    /* lisibilité du texte : voile navy sur la gauche */
    linear-gradient(90deg, rgba(0, 3, 49, 0.78) 0%, rgba(0, 3, 49, 0.42) 38%, transparent 62%),
    /* vignette bas-droite : avale le watermark ✦ de la source */
    radial-gradient(260px 150px at 96% 84%, rgba(0, 3, 49, 0.92), transparent 72%),
    /* fondu vers la section suivante, suit le scheme de la page */
    linear-gradient(180deg, transparent 82%, var(--ev-bg) 100%);
}

/* Accents éteints tant que les yeux ne sont pas allumés */
.ev-hero--scrub .ev-hero__title em {
  color: inherit;
  transition: color 450ms var(--ease-out);
}
.ev-hero--scrub .ev-hero__title .ev-hl::before {
  animation: none;
  transform: skewX(-8deg) scaleX(0);
  transition: transform 450ms var(--ease-out);
}
.ev-hero--scrub.is-powered .ev-hero__title em { color: var(--ev-blue); }
.ev-hero--scrub.is-powered .ev-hero__title .ev-hl::before { transform: skewX(-8deg) scaleX(1); }

@media (max-width: 720px) {
  .ev-hero-pin--on { height: 180vh; }
  /* le padding mobile du hero est déjà géré par le bloc responsive
     existant en fin de fichier (.ev-hero, ~ligne 1016) */
  /* portrait : la chouette reste visible sous le texte empilé */
  .ev-hero__bg { object-position: 50% 42%; }
  .ev-hero__scrim {
    background:
      linear-gradient(180deg, rgba(0, 3, 49, 0.65) 0%, rgba(0, 3, 49, 0.35) 45%, transparent 65%),
      radial-gradient(200px 120px at 96% 86%, rgba(0, 3, 49, 0.92), transparent 72%),
      linear-gradient(180deg, transparent 80%, var(--ev-bg) 100%);
  }
}
```

- [ ] **Step 2: Vérifier que le build passe et que la landing est inchangée**

Run: `bundle exec jekyll build`
Expected: build OK sans warning nouveau.

Run: `grep -c "ev-hero--video" _site/assets/css/landing.css`
Expected: ≥ 1 (le CSS est bien publié). La landing rendue est visuellement identique (aucune des nouvelles classes n'existe encore dans le HTML).

- [ ] **Step 3: Commit**

```bash
git add assets/css/landing.css
git commit -m "feat: styles du hero vidéo (pin sticky, scrim, états is-powered)"
```

---

### Task 3: Structure HTML du hero (`index.html`)

**Files:**
- Modify: `index.html` (section `<!-- HERO -->`, lignes ~41–67)
- Modify: `assets/css/landing.css` (suppression des styles `.ev-hero__visual` devenus morts)

**Interfaces:**
- Consumes: classes CSS de la Task 2 ; chemins d'assets de la Task 1
- Produces: le DOM consommé par la Task 4 — `.ev-hero-pin` > `.ev-hero.ev-hero--video` > `video.ev-hero__bg[data-src][data-src-mobile][poster]` + `.ev-hero__scrim` + `.ev-hero__grid`

- [ ] **Step 1: Remplacer la section HERO dans `index.html`**

La section actuelle :

```html
<!-- HERO -->
<section class="ev-hero">
  <div class="ev-hero__grid">
    <div>
      <div class="ev-hero__tag">Dev indé · Toulouse · depuis 2011</div>
      ...
      </div>
    </div>
    <div class="ev-hero__visual" aria-hidden="true">
      <img src="{{ '/images/logo.svg' | relative_url }}" alt="">
    </div>
  </div>
</section>
```

devient (le `<div>` intérieur contenant tag/H1/lede/CTA est conservé **à l'identique**, seuls l'enveloppe et `.ev-hero__visual` changent) :

```html
<!-- HERO — fond vidéo chouette scrubé au scroll ; sans JS : poster statique -->
<div class="ev-hero-pin">
  <section class="ev-hero ev-hero--video">
    <video class="ev-hero__bg" muted playsinline preload="auto"
           poster="{{ '/images/hero-owl-poster.jpg' | relative_url }}"
           data-src="{{ '/assets/video/hero-owl.mp4' | relative_url }}"
           data-src-mobile="{{ '/assets/video/hero-owl-540.mp4' | relative_url }}"
           aria-hidden="true"></video>
    <div class="ev-hero__scrim" aria-hidden="true"></div>
    <div class="ev-hero__grid">
      <div>
        <!-- ⇩ bloc texte existant inchangé : tag, H1, lede, CTA ⇩ -->
      </div>
    </div>
  </section>
</div>
```

Le `src` de la vidéo est volontairement absent : c'est le JS (Task 4) qui l'injecte — sans JS ou en reduced-motion, zéro octet vidéo téléchargé.

- [ ] **Step 2: Supprimer les styles morts de `.ev-hero__visual` dans `landing.css`**

Supprimer :
- le bloc `.ev-hero__visual { ... }`, `.ev-hero__visual img { ... }`, `.ev-hero__visual::before { ... }` (~lignes 339–361)
- les keyframes associées `@keyframes ev-float-slow` et `@keyframes ev-breathe` (utilisées nulle part ailleurs — vérifier : `grep -c "ev-float-slow\|ev-breathe" assets/css/landing.css` doit retourner 2 après suppression des blocs, puis supprimer les keyframes → 0)
- la ligne `.ev-hero__visual { display: none; }` dans le bloc `@media (max-width: 720px)` (~ligne 1017)

- [ ] **Step 3: Vérifier le rendu**

Run: `bundle exec jekyll build`
Expected: build OK.

Run: `grep -A2 "ev-hero-pin" _site/index.html | head -8`
Expected: le wrapper, la balise `<video>` avec `poster="/images/hero-owl-poster.jpg"` et les deux `data-src`.

Run: `grep -c "ev-hero__visual\|ev-float-slow\|ev-breathe" _site/index.html _site/assets/css/landing.css`
Expected: `0` pour les deux fichiers.

Contrôle visuel rapide (poster en fond, texte lisible par-dessus, pas de pin — le JS n'existe pas encore) :
```bash
bundle exec jekyll serve --detach
google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1440,900 --screenshot=/tmp/hero-check.png http://127.0.0.1:4000/
pkill -f "jekyll serve"
```
Inspecter `/tmp/hero-check.png` : ciel étoilé + chouette de profil en fond du hero, H1 crème lisible sur le voile navy, fondu bas vers le fond de page, watermark ✦ invisible.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat: hero full-bleed vidéo chouette (wrapper pin, poster, scrim)"
```

---

### Task 4: JS — scrub, envol, reset (`assets/js/landing.js`)

**Files:**
- Modify: `assets/js/landing.js` (nouvelle IIFE insérée après le bloc `MAGNETIC HERO TITLE`, ~ligne 126)

**Interfaces:**
- Consumes: DOM de la Task 3 (`.ev-hero-pin`, `.ev-hero--video`, `.ev-hero__bg` avec `data-src`/`data-src-mobile`) ; classes CSS de la Task 2 (`.ev-hero-pin--on`, `.ev-hero--scrub`, `.is-powered`)
- Produces: rien (feature feuille)

- [ ] **Step 1: Insérer l'IIFE**

Après le bloc `MAGNETIC HERO TITLE` (même style défensif que le reste du fichier) :

```js
  // ==========================================================
  // HERO OWL — scrub vidéo au scroll (pin), envol à la libération
  // ==========================================================
  (function initHeroOwl() {
    const SPLIT = 2.2;            // s — fin de la portion scrubée (tête + yeux)
    const POWER_THRESHOLD = 0.65; // progression du scrub où les yeux s'allument
    const MIN_SEEK_DELTA = 1 / 24;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pin = document.querySelector('.ev-hero-pin');
    const hero = document.querySelector('.ev-hero--video');
    const video = hero ? hero.querySelector('.ev-hero__bg') : null;
    if (!pin || !hero || !video) return;

    video.src = matchMedia('(max-width: 720px)').matches
      ? video.dataset.srcMobile
      : video.dataset.src;
    video.load();
    pin.classList.add('ev-hero-pin--on');
    hero.classList.add('ev-hero--scrub');

    let flying = false;
    let ticking = false;

    const progress = () => {
      const r = pin.getBoundingClientRect();
      const travel = r.height - innerHeight;
      if (travel <= 0) return 1;
      return Math.min(1, Math.max(0, -r.top / travel));
    };

    const update = () => {
      ticking = false;
      const p = progress();
      hero.classList.toggle('is-powered', p >= POWER_THRESHOLD);
      if (p >= 1) {
        if (!flying) {
          flying = true;
          video.play().catch(() => {}); // muted : ne devrait jamais être bloqué
        }
        return;
      }
      if (flying) { // remontée : la chouette se reperche, le scrub reprend la main
        flying = false;
        video.pause();
      }
      if (video.readyState >= 1) {
        const t = p * SPLIT;
        if (Math.abs(video.currentTime - t) > MIN_SEEK_DELTA) video.currentTime = t;
      }
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    video.addEventListener('loadedmetadata', update, { once: true });
    update();
  })();
```

Comportements couverts : scrub aller-retour pendant le pin (seek seulement si Δ > 1 frame), toggle `is-powered` dans les deux sens, envol joué une seule fois par franchissement de p=1, `pause()` + retour au scrub si on remonte pendant (ou après) l'envol, dernière frame conservée après `ended` (branche vide), seek gardé par `readyState` tant que les métadonnées ne sont pas là.

- [ ] **Step 2: Vérifier la syntaxe**

Run: `node --check assets/js/landing.js`
Expected: aucune sortie (exit 0).

- [ ] **Step 3: Vérifier le comportement en local**

Run: `bundle exec jekyll serve --livereload` puis dans un navigateur sur `http://localhost:4000` :
1. Chargement : chouette de profil (frame 0), accents du H1 éteints (pas de highlight cyan, `em` couleur texte).
2. Scroll lent : la tête pivote en suivant le scroll, page immobile (pin). Scroll arrière : la tête revient.
3. À ~65 % du pin : yeux allumés **et** highlight cyan + italiques bleus apparaissent (transition 450 ms). Re-scroll arrière sous le seuil : accents s'éteignent.
4. Fin du pin : la page défile réellement, l'envol se joue une fois, la branche reste vide.
5. Remonter tout en haut : chouette re-perchée, scrub de nouveau fonctionnel, envol rejouable.

- [ ] **Step 4: Commit**

```bash
git add assets/js/landing.js
git commit -m "feat: scrub vidéo du hero au scroll (pin, is-powered, envol, reset)"
```

---

### Task 5: Vérification transverse + tuning des constantes

**Files:**
- Modify (si tuning nécessaire) : `assets/js/landing.js` (constantes), `assets/css/landing.css` (object-position, stops de gradients, hauteurs de pin)

**Interfaces:**
- Consumes: tout ce qui précède
- Produces: valeurs finales des constantes ; feu vert pour le merge

- [ ] **Step 1: Passe complète de la checklist spec (navigateur, `bundle exec jekyll serve`)**

- Chrome **et** Firefox : scrub fluide, envol, reset (tout est JS, aucun `animation-timeline` requis pour cette feature)
- Émulation mobile (≤720px, portrait) : chouette visible sous le texte, scrub tactile OK, fichier 540p chargé (onglet Réseau)
- Émulation `prefers-reduced-motion: reduce` (DevTools → Rendering) : pas de pin, poster statique, accents allumés, **aucune requête vidéo** (onglet Réseau)
- JS désactivé (DevTools → Settings → Debugger) : idem reduced-motion
- Light mode **et** dark mode : hero sombre identique, fondu bas du scrim rejoint le fond réel de la page (crème en light, sombre en dark)
- Watermark ✦ (bas-droite de la vidéo) invisible à toutes les étapes, y compris dernière frame (branche vide)
- Aller-retours agressifs : spam de molette autour de p=1 et pendant l'envol → pas d'état bloqué, pas d'exception console
- Progress bar en haut et quick-nav dots : cohérents avec la page rallongée (les dots n'apparaissent qu'après le pin — comportement existant conservé)
- Easter eggs : 5 clics logo (tilt), Konami (Matrix) — intacts
- Poids réseau premier chargement desktop : poster seul avant init JS, puis vidéo ≤ 8 Mo
- Ajouts revue de branche : CTA entièrement visible à p=0 sur laptop 768px de haut ; passe Tab clavier pendant le pin ; bande de fond sous le hero à la collapse de la toolbar mobile (svh) ; hard-reload avec scroll restauré en bas de page (envol hors écran harmless ?) ; qualité de l'envol (2,2→5 s) en lecture réelle au CRF final ; contraste du chip `.ev-hero__tag` à l'œil
- Ajouts extension : burger CRT sur mobile réel (scanline + déploiement + morph power, fermeture Escape/lien/resize) ; titre stable pendant le pin (plus de re-wrap) ; git-feed absent, marquee technos intact

- [ ] **Step 2: Tuning éventuel**

Ajuster **uniquement** : `SPLIT`, `POWER_THRESHOLD`, hauteurs `.ev-hero-pin--on` (ressenti de la distance de pin), `object-position`, stops/opacités des gradients du scrim (lisibilité vs visibilité de la chouette, couverture du watermark), et — ajouté suite à la revue de branche — le rythme vertical du hero pour tenir dans `100svh` (`box-sizing: border-box` sur `.ev-hero--video`, paddings verticaux, marges titre/lede scopées `--video`, réduction du H1 sous une media query `max-height`). Noter les valeurs finales.

- [ ] **Step 3: Commit (si tuning)**

```bash
git add assets/js/landing.js assets/css/landing.css
git commit -m "feat: ajuste les réglages du hero vidéo après test navigateur"
```

---

### Task 6: Documentation projet

**Files:**
- Modify: `AGENTS.md` (cible réelle du symlink `CLAUDE.md`)

**Interfaces:**
- Consumes: noms de classes/constantes des Tasks 1–4
- Produces: doc à jour pour les prochaines sessions

- [ ] **Step 1: Documenter la feature et l'outillage dans `AGENTS.md`**

Dans la section « Features JS de la landing (à ne pas casser) », ajouter :

```markdown
- **Hero owl scrub** : le wrapper `.ev-hero-pin` épingle le hero ; le scroll
  scrubbe la vidéo `.ev-hero__bg` (0→2,2 s, constante `SPLIT`), la classe
  `is-powered` allume les accents du H1 en sync avec les yeux, l'envol se
  joue à la libération du pin. Sans JS / reduced-motion : poster statique,
  pas de pin.
```

Dans la section « Outillage », ajouter après le bloc OG card :

````markdown
### Vidéo hero (chouette)

Source de vérité : `tools/hero-video/encode.sh` (la source OpenArt n'est pas
commitée — voir `tools/hero-video/README.md`). Régénérer les assets :

```bash
./tools/hero-video/encode.sh <source.mp4>
# → assets/video/hero-owl.mp4, assets/video/hero-owl-540.mp4, images/hero-owl-poster.jpg
```

La portion 0→2,3 s est encodée en keyframes denses (scrub `currentTime`
au scroll). Dépendance : `ffmpeg`.
````

- [ ] **Step 2: Vérifier le symlink**

Run: `readlink CLAUDE.md && git diff --stat`
Expected: `AGENTS.md` ; seules les lignes ajoutées apparaissent dans le diff.

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: documente le hero vidéo scrubé et son outillage d'encodage"
```

---

## Extension (2026-07-23) — retours utilisateur après revue de branche

Trois demandes de Vincent, validées en conversation : (7) couper le resserrement
scroll-driven du titre qui re-wrappe pendant le pin et concurrence le seek vidéo ;
(8) supprimer le git-feed de faux commits ; (9) burger menu mobile avec effet
« power-on CRT » (validé contre « terminal tapé » et « sobre »). S'exécutent
APRÈS les fixes de la revue de branche, séquentiellement.

### Task 7: Supprimer le resserrement scroll-driven du titre

**Files:**
- Modify: `assets/css/landing.css` (bloc `.ev-hero__title`, ~ligne 267)

**Interfaces:**
- Produces: rien — suppression pure. Le titre garde sa `font-variation-settings`
  statique (`'opsz' 144, 'SOFT' 30`) et son `letter-spacing: -0.03em`.

- [ ] **Step 1: Supprimer dans `.ev-hero__title`** les quatre lignes :

```css
  animation: ev-hero-tighten linear;
  animation-timeline: scroll(root);
  animation-range: 0 50vh;
  will-change: transform;
```

et le bloc `@keyframes ev-hero-tighten { ... }` qui suit la règle.
Pourquoi la suppression (pas un simple `animation: none` scopé) : le titre
n'existe que sur le hero de la landing, qui est désormais toujours le hero
vidéo — la version animée n'a plus aucun consommateur.

- [ ] **Step 2: Vérifier**

Run: `grep -c "ev-hero-tighten" assets/css/landing.css` → Expected: `0`
Run: `bundle exec jekyll build` → Expected: OK

- [ ] **Step 3: Commit**

```bash
git add assets/css/landing.css
git commit -m "fix: coupe le resserrement scroll-driven du titre (re-wrap pendant le pin)"
```

### Task 8: Supprimer le git-feed (faux commits)

**Files:**
- Modify: `index.html` (bloc `<div class="ev-git-feed" aria-hidden="true">…</div>` dans `.ev-intro-section`, ~lignes 100-115)
- Modify: `assets/css/landing.css` (règles `.ev-git-feed*` ~lignes 618-640 : bloc commenté « Git feed en filigrane », la media query 900px, `__line`, `__hash`, `__ref`, et `@keyframes ev-git-scroll`)

**Interfaces:**
- Produces: rien — suppression pure. Le marquee `.ev-strip` (technos) reste.

- [ ] **Step 1: Supprimer le bloc HTML** `.ev-git-feed` entier dans `index.html` (les deux `__line` dupliquées incluses).

- [ ] **Step 2: Supprimer les règles CSS** listées ci-dessus, y compris `@keyframes ev-git-scroll`.

- [ ] **Step 3: Vérifier**

Run: `grep -rc "ev-git" index.html assets/css/landing.css assets/js/landing.js` → Expected: `0` partout
Run: `bundle exec jekyll build` → Expected: OK ; `grep -c "ev-git" _site/index.html` → `0`

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat: retire le git-feed de faux commits de la section intro"
```

### Task 9: Burger menu mobile — effet power-on CRT

**Files:**
- Modify: `index.html` (nav, ajout du bouton burger)
- Modify: `assets/css/landing.css` (section NAV : burger, panneau, effet CRT)
- Modify: `assets/js/landing.js` (nouvelle IIFE `initBurger`, après `initNavScroll`)
- Modify: `AGENTS.md` (ligne dans « Features JS de la landing »)

**Interfaces:**
- Consumes: `.ev-nav` sticky existante (z-index 20), tokens (`--ev-cyan`, `--ev-bg`, `--ev-border`, `--ease-out`), breakpoint 720px
- Produces: classes `.ev-nav__burger`, `.ev-nav__power`, état `.ev-nav--open` ; le panneau est l'`ul.ev-nav__links` existante (id `ev-nav-menu` ajouté)

**Comportement :** desktop (>720px) inchangé. Mobile : nav sur UNE ligne
(brand + statut + burger, `flex-wrap: nowrap`), liens dans un panneau absolu
sous la nav. Ouverture = power-on CRT : le panneau apparaît d'abord comme une
scanline horizontale sur-brillante (scaleY ~0.02, glow cyan) qui tient ~170 ms
puis se déploie verticalement ; les items tombent en stagger ensuite. Le burger
(3 barres) se morphe en symbole power ⏻ (barres qui s'effacent, glyphe SVG
cyan qui tourne en place). Fermeture : clic burger, clic sur un lien, Escape,
ou passage >720px. Reduced-motion : le kill-switch global existant (animations
0.01ms) rend l'ouverture instantanée — rien à ajouter.

- [ ] **Step 1: HTML — bouton burger dans `.ev-nav__inner`** (après `.ev-nav__status`), et `id="ev-nav-menu"` sur l'`ul` :

```html
    <ul class="ev-nav__links" id="ev-nav-menu">
      …liens existants inchangés…
    </ul>
    <span class="ev-nav__status"><span class="ev-status-dot"></span>Disponible</span>
    <button class="ev-nav__burger" type="button" aria-expanded="false"
            aria-controls="ev-nav-menu" aria-label="Menu">
      <span></span><span></span><span></span>
      <svg class="ev-nav__power" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v8"/><path d="M6.3 6.6a8 8 0 1 0 11.4 0"/>
      </svg>
    </button>
```

- [ ] **Step 2: CSS — à la fin de la section NAV existante** :

```css
/* Burger mobile — power-on CRT (voir plan, Task 9) */
.ev-nav__burger {
  display: none; position: relative;
  width: 44px; height: 44px;
  border: 0; background: none; cursor: pointer; padding: 10px;
}
.ev-nav__burger span {
  display: block; height: 2px; border-radius: 1px;
  background: var(--ev-text); margin: 5px 0;
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);
}
.ev-nav__power {
  position: absolute; inset: 10px; width: 24px; height: 24px;
  fill: none; stroke: var(--ev-cyan); stroke-width: 2; stroke-linecap: round;
  opacity: 0; transform: rotate(-90deg) scale(0.6);
  transition: opacity 220ms var(--ease-out), transform 300ms var(--ease-out);
}
.ev-nav--open .ev-nav__burger span { opacity: 0; transform: scaleX(0.15); }
.ev-nav--open .ev-nav__power { opacity: 1; transform: rotate(0deg) scale(1); }

@media (max-width: 720px) {
  .ev-nav__inner { flex-wrap: nowrap; }
  .ev-nav__burger { display: block; }
  .ev-nav__links {
    position: absolute; top: 100%; left: 0; right: 0;
    margin: 0; padding: 18px 24px 22px;
    display: none; flex-direction: column; gap: 14px;
    background: color-mix(in srgb, var(--ev-bg) 96%, transparent);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--ev-border);
    transform-origin: top;
  }
  .ev-nav--open .ev-nav__links {
    display: flex;
    animation: ev-crt-on 420ms var(--ease-out) both;
  }
  .ev-nav__links li { opacity: 0; transform: translateY(-6px);
    transition: opacity 240ms var(--ease-out), transform 240ms var(--ease-out); }
  .ev-nav--open .ev-nav__links li { opacity: 1; transform: none; }
  .ev-nav--open .ev-nav__links li:nth-child(1) { transition-delay: 190ms; }
  .ev-nav--open .ev-nav__links li:nth-child(2) { transition-delay: 240ms; }
  .ev-nav--open .ev-nav__links li:nth-child(3) { transition-delay: 290ms; }
  .ev-nav--open .ev-nav__links li:nth-child(4) { transition-delay: 340ms; }
}
@keyframes ev-crt-on {
  0%   { transform: scaleY(0.02); filter: brightness(2.4);
         box-shadow: 0 2px 24px var(--ev-cyan); }
  40%  { transform: scaleY(0.02); filter: brightness(2.4);
         box-shadow: 0 2px 32px var(--ev-cyan); }
  100% { transform: scaleY(1); filter: brightness(1);
         box-shadow: 0 0 0 transparent; }
}
```

- [ ] **Step 3: JS — IIFE après `initNavScroll`** :

```js
  // ==========================================================
  // BURGER MOBILE — power-on CRT
  // ==========================================================
  (function initBurger() {
    const nav = document.querySelector('.ev-nav');
    const btn = document.querySelector('.ev-nav__burger');
    const menu = document.getElementById('ev-nav-menu');
    if (!nav || !btn || !menu) return;
    const setOpen = (open) => {
      nav.classList.toggle('ev-nav--open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => setOpen(!nav.classList.contains('ev-nav--open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 721px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  })();
```

- [ ] **Step 4: AGENTS.md** — ajouter dans « Features JS de la landing » :

```markdown
- **Burger mobile** : ≤720px la nav passe en burger (`.ev-nav__burger`), panneau
  `.ev-nav__links` ouvert via `.ev-nav--open` avec effet power-on CRT (scanline
  cyan puis déploiement), burger morphé en symbole power. Escape/clic lien/resize
  referment.
```

- [ ] **Step 5: Vérifier**

Run: `node --check assets/js/landing.js` → exit 0 ; `bundle exec jekyll build` → OK.
Screenshots headless mobile (390×844) : nav fermée sur UNE ligne (brand + statut
+ burger, pas de wrap) ; desktop 1440×900 : nav strictement identique à avant
(burger invisible). L'état ouvert et l'effet CRT se jugent en vrai navigateur
(passe Task 5).

- [ ] **Step 6: Commit**

```bash
git add index.html assets/css/landing.css assets/js/landing.js AGENTS.md
git commit -m "feat: burger menu mobile avec ouverture power-on CRT"
```

> **Écart validé (Vincent, en direct à l'agent pendant la task)** : la pastille
> « Disponible » est déplacée de la barre mobile vers le panneau burger
> (dupliquée en `.ev-nav__status-item`, dernier item, masquée desktop et
> barre mobile). Confirmé par Vincent au contrôleur après coup.

### Task 10: Pin engagé dès le premier cran de scroll

**Constat (Vincent, en test réel)** : un cran de scroll déplace le hero vers le
haut avant le gel. Cause : la nav sticky est dans le flux au-dessus de
`.ev-hero-pin` — le hero ne se fige que quand le haut du wrapper atteint le
haut du viewport, soit après ~une hauteur de nav de scroll normal.

**Fix** : remonter le wrapper sous la nav d'une hauteur de nav mesurée au
runtime → le sticky est engagé à scrollY = 0, le premier cran scrubbe
immédiatement. La nav (translucide, z-index 20) continue de survoler le haut
du hero ; le padding-top du hero (96px) garde le contenu dégagé. Sans JS /
reduced-motion : pas de marge, comportement statique inchangé.

**Files:**
- Modify: `assets/js/landing.js` (IIFE `initHeroOwl` uniquement)

- [ ] **Step 1: Dans `initHeroOwl`**, juste après les deux `classList.add`, insérer :

```js
    // La nav sticky est dans le flux au-dessus du wrapper : sans correction,
    // le pin ne s'engage qu'après ~une hauteur de nav de scroll normal
    // (le hero "monte d'un cran" avant de se figer). On remonte le wrapper
    // sous la nav pour que le sticky soit engagé dès scrollY = 0.
    const nav = document.querySelector('.ev-nav');
    const fitUnderNav = () => {
      pin.style.marginTop = nav ? -nav.offsetHeight + 'px' : '';
    };
    fitUnderNav();
    window.addEventListener('resize', fitUnderNav);
```

- [ ] **Step 2: Vérifier**

Run: `node --check assets/js/landing.js` → exit 0 ; `bundle exec jekyll build` → OK.
Comportement (cran disparu, scrub au premier cran de molette) : passe Task 5.

- [ ] **Step 3: Commit**

```bash
git add assets/js/landing.js
git commit -m "fix: engage le pin du hero dès le premier cran de scroll"
```

- [ ] **Step 4: Burger — fermeture au clic extérieur** (demande Vincent ; choisi
plutôt que le panneau pleine hauteur). Dans `initBurger`, après le listener
`keydown`, ajouter :

```js
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('ev-nav--open')) return;
      if (!e.target.closest('.ev-nav')) setOpen(false);
    });
```

(Le clic sur le bouton burger bulle depuis l'intérieur de `.ev-nav` → non
intercepté ici, pas de double toggle.)

- [ ] **Step 5: Vérifier**

Run: `node --check assets/js/landing.js` → exit 0.
Comportement (tap hors panneau referme) : passe Task 5.

- [ ] **Step 6: Commit**

```bash
git add assets/js/landing.js
git commit -m "feat: ferme le burger au clic hors de la nav"
```

- [ ] **Step 7: Lien Contact dans la nav** (demande Vincent). Dans `index.html`,
ajouter après le `<li>` CV :

```html
      <li><a href="#contact">Contact</a></li>
```

(La même `ul` sert desktop et panneau burger — le lien apparaît aux deux
endroits ; l'ancre `#contact` existe, c'est la cible du quick-nav dot.)
Étendre les délais de stagger du panneau dans `assets/css/landing.css` pour
couvrir les items 5 et 6 (le panneau contient désormais 5 liens +
`.ev-nav__status-item`) :

```css
  .ev-nav--open .ev-nav__links li:nth-child(5) { transition-delay: 390ms; }
  .ev-nav--open .ev-nav__links li:nth-child(6) { transition-delay: 440ms; }
```

(Vérifier au passage que l'item statut, dernier du panneau, a bien un délai —
sinon il apparaît pendant la scanline, avant les liens.)

- [ ] **Step 8: Vérifier**

Run: `bundle exec jekyll build` → OK ; `grep -c '"#contact"' _site/index.html` ≥ 2
(nav + CTA hero existant).

- [ ] **Step 9: Commit**

```bash
git add index.html assets/css/landing.css
git commit -m "feat: ajoute Contact à la nav (desktop + panneau burger)"
```
