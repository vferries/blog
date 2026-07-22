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

- [ ] **Step 2: Tuning éventuel**

Ajuster **uniquement** : `SPLIT`, `POWER_THRESHOLD`, hauteurs `.ev-hero-pin--on` (ressenti de la distance de pin), `object-position`, stops/opacités des gradients du scrim (lisibilité vs visibilité de la chouette, couverture du watermark). Noter les valeurs finales.

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
