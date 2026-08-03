# AGENTS.md — contexte projet

> Blog et landing Jekyll de **En Veille** (Vincent Ferries, dev indé).
> Ce fichier suit la convention cross-tool [AGENTS.md](https://agents.md). `CLAUDE.md` est un symlink vers ce fichier.
> Le design system (brand + site) est versionné dans `docs/design/`. Le contexte privé restant est dans `CLAUDE.local.md`.

## Stack

- **Jekyll** + thème **Minimal Mistakes** via `remote_theme`
- Hébergé sur **GitHub Pages** (CNAME `www.enveille.info`)
- Pas de build custom, GitHub Pages gère nativement
- Commentaires : Disqus (`blogvincent`)

## Lancer en local

```bash
bundle install
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

## Structure

```
/                    # landing services (layout custom)
/blog/               # archive paginée des billets
/<slug>/             # billets individuels
/about/              # à propos
/realisations/       # page réalisations (offre sites vitrines)
/feed.xml            # RSS
```

- `_posts/` : 46 billets depuis 2011, URLs permaliens `/:categories/:title/` (stables, ne pas changer)
- `_layouts/landing.html` : layout custom pour la landing (autonome, n'hérite d'aucun layout du thème)
- `_includes/head/custom.html` : chargement fonts + CSS/JS (le bloc `landing.css`/`landing.js` est conditionné par `{% if page.is_landing %}`)
- `_data/realisations.yml` : réalisations publiques (source unique de la section landing `#realisations` et de `/realisations/`)
- `_includes/ev-nav.html` : nav partagée landing ↔ pages ev-*
- `_includes/footer.html` : shadow du partial Minimal Mistakes → source unique de la ligne footer (landing + pages MM). `_includes/ev-footer.html` n'est plus qu'un wrapper `<footer class="ev-footer">` qui l'inclut. Le thème l'appelle via `include_cached` : ne jamais y mettre de variable de page.
- `assets/css/enveille.css` : design tokens + thème appliqué partout
- `assets/css/landing.css` : styles spécifiques à la landing (classes `.ev-*`)
- `assets/js/landing.js` : interactivité de la landing uniquement

## Coexistence billets ↔ nouveau design

Les 46 billets gardent leur layout `single` de Minimal Mistakes (sidebar author, Disqus, partage social). Ils héritent uniquement de la **typo** et des **couleurs** via `enveille.css`. Pas de migration de contenu, pas de touche au front matter existant.

La landing (`/`) utilise au contraire une nav custom `.ev-nav` qui remplace la masthead. `landing.css` et `landing.js` ne sont chargés QUE via le flag `is_landing: true` dans le front matter — ne pas charger globalement.

## Features JS de la landing (à ne pas casser)

Dans `assets/js/landing.js`, organisées en IIFE :
- **Reveal on scroll** : classes `.ev-reveal` / `.ev-reveal--stagger`
- **Compteurs animés** : éléments `.ev-stat__num[data-count]`
- **Progress bar** : `.ev-progress__bar` se remplit au scroll
- **Quick-nav dots** : `.ev-quick-nav__dot[data-target]` actifs selon la section visible
- **Burger mobile** : ≤720px la nav passe en burger (`.ev-nav__burger`), panneau
  `.ev-nav__links` ouvert via `.ev-nav--open` avec effet power-on CRT (scanline
  cyan puis déploiement), burger morphé en symbole power. La pastille
  "Disponible" quitte la barre du haut et rejoint le panneau (dupliquée en
  `.ev-nav__status-item`, dernier item, masquée au-delà de 720px). Escape/clic
  lien/resize referment.
- **Easter eggs** : 5 clics sur le logo en 1s → body tilt 2° · Konami code (↑↑↓↓←→←→BA) → pluie Matrix 6s · message ASCII en console
- **Hero owl scrub** : le wrapper `.ev-hero-pin` épingle le hero ; le scroll
  scrubbe la vidéo `.ev-hero__bg` (0→1,4 s, constante `SPLIT`), la classe
  `is-powered` allume les accents du H1 en sync avec les yeux, l'envol se
  joue à la libération du pin. Sans JS / reduced-motion : poster statique,
  pas de pin.
- **Vidéos réalisations** : `.ev-work__video` jouées/pausées à la visibilité
  (IntersectionObserver), jamais en `prefers-reduced-motion`, poster sans JS.

## Conventions

- **CSS** : custom properties uniquement, pas de préprocesseur (remote_theme = partials Jekyll inaccessibles)
- **JS** : vanilla, pas de framework, pas de build step
- **Classes landing** : toutes préfixées `.ev-` pour ne pas casser Minimal Mistakes
- **Commits** : convention classique (`feat:`, `fix:`, `docs:`...)
- **Responsive** : mobile ≤ 720px, tablette ≤ 1000px, desktop au-delà

## Outillage

### OG card (image de partage social)

Source de vérité : `tools/og-card/template.html` — un fichier HTML autonome qui rend la carte 1200×630 avec les vraies fontes (Fraunces, Inter, JetBrains Mono via Google Fonts).

**Régénérer la carte par défaut** (après modif du template ou des contenus) :

```bash
./tools/og-card/generate.sh
# → images/og-card.png
```

**Générer une carte custom** (pour un billet ou un autre contexte) :

```bash
./tools/og-card/generate.sh \
  -o images/og-billet-foo.png \
  -q 'title=Mon%20billet&tagline=Sous-titre%20perso'
```

Query params supportés par le template : `eyebrow`, `title`, `tagline`, `domain`. Encodage URL classique (`%20` pour les espaces).

**Workflow d'édition** : ouvrir `template.html` directement dans le navigateur pour preview live. Tweaker CSS/HTML/contenus en place. Tester `?title=...` dans l'URL avant de régénérer.

**Dépendances** : `google-chrome` (headless) + `magick` (ImageMagick, pour le crop final). Le dossier `tools/` est exclu du build Jekyll.

**Câblage côté site** :
- `_config.yml` → `og_image: /images/og-card.png` (utilisé par Minimal Mistakes pour `/blog/`, `/about/`, billets)
- `_layouts/landing.html` → meta tags `og:image` + `twitter:card: summary_large_image` explicites pour la landing

### Vidéo hero (chouette)

Source de vérité : `tools/hero-video/encode.sh` (la source OpenArt n'est pas
commitée — voir `tools/hero-video/README.md`). Régénérer les assets :

```bash
./tools/hero-video/encode.sh <source.mp4>
# → assets/video/hero-owl.mp4, assets/video/hero-owl-540.mp4, images/hero-owl-poster.jpg
```

La portion 0→1,5 s est encodée en keyframes denses (scrub `currentTime`
au scroll). Dépendance : `ffmpeg`.

### Vidéos réalisations (scroll des sites clients)

```bash
./tools/work-videos/record.sh <slug> <url>
# → assets/video/work-<slug>.mp4, images/work-<slug>-poster.jpg
```

Capture Playwright (`playwright-core` + Chrome système, npm install auto)
puis encodage ffmpeg. La capture fait ~1,5 s de pause sur le hero puis un scroll linéaire à vitesse constante. Scénario optionnel : « liste → détail » par sélecteur de clic (exemple : cuisine) — les détails vivent dans `tools/work-videos/README.md`.

## Points d'attention

- Les URLs des billets existants **ne doivent jamais changer** (SEO, backlinks)
- Le site est déployé automatiquement sur push master — tester en local d'abord
- Les animations scroll-driven (`animation-timeline: scroll(...)`) ne sont pas supportées sur Firefox — dégradation gracieuse prévue
- Le mode sombre est automatique via `prefers-color-scheme` (pas de toggle manuel)

## Roadmap

Voir `NEXT.md`.

## Design system (dans `docs/design/`)

- `docs/design/DESIGN.md` — design system global de la marque (cross-surfaces)
- `docs/design/DESIGN-site.md` — design spécifique à ce site (routing, layouts, easter eggs)
- `docs/design/assets/` — logo SVG, favicons, tokens, palette, script de nettoyage Figma

## Contexte non versionné (dans `.claude/`)

- `.claude/context/CHANGELOG-session.md` — journal des choix de design et rationale
- `.claude/context/INSTALL.md` — archive du patch initial de refresh (rarement utile, garde la trace)
- `.claude/previews/` — screenshots des itérations v1 à v4
