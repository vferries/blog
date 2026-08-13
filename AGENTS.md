# AGENTS.md — contexte projet

> Blog et landing Jekyll de **En Veille** (Vincent Ferries, dev indé).
> Ce fichier suit la convention cross-tool [AGENTS.md](https://agents.md). `CLAUDE.md` est un symlink vers ce fichier.
> Le design system (brand + site) est versionné dans `docs/design/`. Le contexte privé restant est dans `CLAUDE.local.md`.

## Stack

- **Jekyll** + thème **Minimal Mistakes** via `remote_theme`, pinné sur `@4.28.0` (`_config.yml:16`) — **7 shadows de partials** dépendent des upstream, donc pas de suivi de `master` et un rediff obligatoire à chaque bump : `footer.html`, `head/custom.html`, `masthead.html`, `comments-providers/disqus.html` (Disqus différé), `head.html` (Font Awesome retiré), `search/lunr-search-scripts.html` (lunr paresseux), `archive-single.html` (vignettes lazy). `main.min.js` (jQuery) n'est plus chargé (`footer_scripts: []` dans la config) : le toggle de recherche vit dans `nav.js`, le câblage lunr dans `assets/js/ev-search.js`, les icônes en masques CSS dans `enveille.css`. Attention : MM ne rend la **section** commentaires qu'en build production (`jekyll.environment`) — pour tester Disqus en local : `JEKYLL_ENV=production PAGES_REPO_NWO=vferries/blog bundle exec jekyll build --baseurl ''` — le `--baseurl ''` est obligatoire, sans lui github-metadata retombe sur `/pages/vferries/blog` et toutes les URLs relatives du build cassent
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
- `_includes/head/ev-assets.html` : **source unique du head partagé** (script inline du thème, favicons, fontes, theme-color, `enveille.css`, `nav.js`), inclus par `_includes/head/custom.html` (pages MM) et `_layouts/landing.html`. Aucune variable de page dedans. Ne charge **pas** `landing.css`/`landing.js` — c'est `_layouts/landing.html`, autonome, qui les déclare
- `_data/realisations.yml` : réalisations publiques (source unique de la section landing `#realisations` et de `/realisations/`)
- `_includes/ev-nav.html` : **barre du haut, source unique de toutes les pages**. `_includes/masthead.html` (shadow du thème) la rend sur les pages Minimal Mistakes, `index.html` et `_pages/realisations.html` l'incluent directement. Le shadow passe par `include_cached` : n'y mettre aucune variable de page
- `assets/js/nav.js` : burger + backdrop-filter au scroll + toggle de thème. Chargé partout via `head/ev-assets.html`
- `_includes/footer.html` : shadow du partial Minimal Mistakes → source unique de la ligne footer (landing + pages MM). `_includes/ev-footer.html` n'est plus qu'un wrapper `<footer class="ev-footer">` qui l'inclut. Le thème l'appelle via `include_cached` : ne jamais y mettre de variable de page.
- `assets/css/enveille.css` : design tokens + thème appliqué partout
- `assets/css/landing.css` : styles spécifiques à la landing (classes `.ev-*`)
- `assets/js/landing.js` : interactivité de la landing uniquement

## Coexistence billets ↔ nouveau design

Les 46 billets gardent leur layout `single` de Minimal Mistakes (sidebar author, Disqus, partage social). Ils héritent uniquement de la **typo** et des **couleurs** via `enveille.css`. Pas de migration de contenu, pas de touche au front matter existant.

La nav `.ev-nav` est désormais servie **partout**, y compris sur les pages du thème, via un shadow de `_includes/masthead.html`. Ses styles vivent dans `enveille.css` (chargé partout), pas dans `landing.css`. `_data/navigation.yml` a été supprimé : il ne pilotait que la masthead d'origine.

`landing.css` et `landing.js` sont chargés par `_layouts/landing.html` seul, donc par les pages qui utilisent `layout: landing` — la landing et `/realisations/`. Ne pas les charger globalement : `landing.css` porte des règles qui présupposent la structure de la landing.

## Features JS de la landing (à ne pas casser)

Dans `assets/js/landing.js`, organisées en IIFE :
- **Reveal on scroll** : classes `.ev-reveal` / `.ev-reveal--stagger`
- **Compteurs animés** : éléments `.ev-stat__num[data-count]`
- **Progress bar** : `.ev-progress__bar` se remplit au scroll
- **Quick-nav dots** : `.ev-quick-nav__dot[data-target]` actifs selon la section visible
- **Burger mobile** : ≤1000px la nav passe en burger (`.ev-nav__burger`), panneau
  `.ev-nav__links` ouvert via `.ev-nav--open` avec effet power-on CRT (scanline
  cyan puis déploiement), burger morphé en symbole power. La pastille
  "Disponible" quitte la barre du haut et rejoint le panneau (dupliquée en
  `.ev-nav__status-item`, dernier item, masquée au-delà de 1000px). Escape/clic
  lien/resize referment. Le seuil vaut 1000px et non 720px parce que la barre
  desktop (marque + 6 liens + pastille + recherche) ne tient sur une ligne qu'à
  partir de ~870px — il est piloté par `@media (max-width: 1000px)` dans
  `enveille.css` et par `matchMedia('(min-width: 1001px)')` dans `nav.js`, les
  deux valeurs vont ensemble.
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

**Une carte par billet** : `tools/og-card/generate-posts.py` rend une carte pour chaque billet (titre + date en français) et câble `header.og_image` dans le front matter. Le même passage produit les **vignettes de la grille `/blog/`** et câble `header.teaser` — voir plus bas.

```bash
./tools/og-card/generate-posts.py            # ne régénère que ce qui manque
./tools/og-card/generate-posts.py --force    # régénère tout (~23 s pour 46)
./tools/og-card/generate-posts.py --dry-run  # montre sans écrire
```

Le script est idempotent : après avoir ajouté un billet, le relancer sans option ne touche que lui. Il délègue le rendu à `generate.sh` (même template, mêmes fontes) puis quantifie en PNG8 64 couleurs — le visuel est plat, la perte est invisible et le poids passe d'environ 110 à 30 Ko. Les cartes vivent dans `images/og/<slug>.png`, le slug venant du nom de fichier du billet.

`header.og_image` prime sur `header.image` côté Minimal Mistakes (`_includes/seo.html`) : les bandeaux de billets restent affichés, ils ne servent simplement plus de vignette de partage.

**Vignettes de la grille `/blog/`** : le même script produit une image dédiée par billet et câble `header.teaser`. Trois choses à ne pas confondre :

| Champ | Rôle | Format |
|---|---|---|
| `header.image` | bandeau affiché en tête d'article | tel quel, jamais modifié |
| `header.teaser` | vignette de la grille `/blog/` | ratio 1200:630 |
| `header.og_image` | vignette de partage social | 1200×630 exactement |

La vignette est **découplée du bandeau** : si le billet a un `header.image` de ratio ≤ 5:1, elle en est dérivée par un recadrage décidé à la génération et **ancré à l'ouest** (ces bandeaux portent leur titre à gauche) ; sinon c'est une carte teaser. Les dérivées sortent en **JPEG** (ce sont des photos) et les cartes en **PNG8** (rendu aplat) — appliquer PNG8 à une photo dithere, leçon déjà payée une fois sur le bandeau Devoxx.

Le recadrage ne fait jamais d'agrandissement : il travaille à la résolution native de la source et ne réduit que si elle dépasse 1200px de large.

**Câblage côté site** :
- `_config.yml` → `og_image: /images/og-card.png` (fallback pour `/blog/`, `/about/`, les archives)
- `_config.yml` → `teaser: /images/og-card.png` (repli si un billet est publié avant un passage du générateur)
- `_config.yml` → bloc `twitter: username:` **imbriqué** — MM ignore le `twitter_username` à plat de la convention Jekyll, et sans lui `seo.html` n'émet aucune balise `twitter:*` sur les pages du thème
- Front matter des billets → `header.og_image` vers leur carte dédiée
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
- Le mode sombre suit `prefers-color-scheme` par défaut, avec un **toggle manuel 2 états** dans la barre du haut (persisté en localStorage `ev-theme`, posé sur `<html data-theme>` avant la première peinture par `head/ev-assets.html`). Les blocs dark du CSS vont **par paires** (`@media` gardé par `:not([data-theme="light"])` + bloc jumeau `[data-theme="dark"]`) — toute modif d'un bloc dark se fait dans les deux

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
