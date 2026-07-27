# Portfolio « Réalisations » — design validé

> Spec issue du brainstorming du 2026-07-27. Statut : validée section par section
> avec Vincent, en attente de relecture finale du document.

## Contexte & objectif

En Veille lance une **nouvelle offre commerciale : sites vitrines pour
commerçants et artisans locaux**. Deux réalisations publiques existent et sont
montrables (contrairement aux missions grands comptes sous NDA) :

- **escalire.fr** — librairie indépendante à Escalquens (vitrine + commande en
  ligne via partenaires)
- **justbordas.fr** — ferronnerie d'art côté Toulouse (portfolio artisan, acier
  / verre / bois)
- **vferries.github.io/cuisine** — projet perso (ajouté en cours de chantier) :
  recettes en Cooklang servies par un site Astro (recherche, filtres, favoris)
  + app Android Kotlin. Preuve de savoir-faire supplémentaire, étiquetée
  « projet perso » pour ne pas brouiller l'offre.

Vincent a tout fait sur les deux sites clients : design, développement, mise
en ligne, en direct avec les clients. Le projet cuisine est le sien.

Le portfolio matérialise cette offre. Les **5 services actuels restent
intacts** (cible équipes tech) : c'est la section portfolio elle-même qui porte
l'offre vitrine, à destination d'une seconde audience.

**Hors périmètre** : les « missions anonymisées » façon git log (piste de
juin 2026, toujours dans NEXT.md) restent un chantier séparé, ajoutable plus
tard sur la page dédiée.

## Décisions actées

| Question | Décision |
|---|---|
| Emplacement | Les deux : section teaser sur `/` + page dédiée |
| URL page | `/realisations/` |
| Périmètre page | Sites publics seuls (pas de missions anonymisées) |
| Positionnement | La section porte l'offre « sites vitrines » ; 5 services inchangés |
| Visuels | **Vidéos de scroll réelles** (les deux sites ont des animations au scroll — un screenshot figé les raterait, voire capturerait l'état pré-reveal) |
| Capture | Script Playwright dans `tools/` (**nouvelle dépendance, isolée, signalée et validée**) |
| Copy | Claude rédige à partir de l'info publique, Vincent corrige les faits |
| Données | Data-driven : `_data/realisations.yml`, source unique |

## Architecture

```
_data/realisations.yml          # source unique des projets
_includes/ev-nav.html           # nav extraite d'index.html, partagée
_includes/ev-footer.html        # footer extrait d'index.html, partagé
_pages/realisations.html        # page dédiée, layout `landing`, permalink /realisations/
index.html                      # + section #realisations (entre #services et #about)
assets/css/landing.css          # + classes .ev-work*
assets/js/landing.js            # + IIFE lecture des vidéos (IntersectionObserver)
assets/video/work-<slug>.mp4    # vidéos de scroll (~400-700 Ko chacune)
images/work-<slug>-poster.jpg   # posters
tools/work-videos/              # capture Playwright + encodage ffmpeg
```

Le layout `landing` est réutilisé tel quel pour la page (il est générique : nav,
hero et sections vivent dans le contenu, pas dans le layout). `landing.js` est
défensif (chaque IIFE skip si ses éléments manquent) : rien à conditionner.

### `_data/realisations.yml` — schéma

```yaml
- slug: escalire
  name: Librairie Escalire
  url: https://escalire.fr
  domain: escalire.fr
  kind: Librairie indépendante
  location: Escalquens    # optionnel (omis pour le projet perso)
  year: 2026              # optionnel ; à confirmer par Vincent
  pitch: >                # 1 ligne, carte landing
    ...
  story: |                # récit page dédiée, markdown
    ...
  stack: [HTML, CSS, JS]  # à confirmer par Vincent
  video: /assets/video/work-escalire.mp4
  poster: /images/work-escalire-poster.jpg
```

Ajouter un projet = 1 entrée YAML + 1 vidéo + 1 poster.

### Extraction nav + footer

La nav `.ev-nav` (index.html:24-46) et le footer `.ev-footer` (index.html:307-309)
sont déplacés dans `_includes/ev-nav.html` et `_includes/ev-footer.html`,
inclus depuis `index.html` et `realisations.html`. Paramètre `root` :

- Sur `/` : liens ancre (`#services`, `#about`, `#contact`)
- Sur `/realisations/` : liens absolus (`/#services`, `/#about`, `/#contact`)

Markup inchangé au pixel près — extraction pure, pas de refonte.

## Section landing `#realisations`

**Placement** : entre `#services` et `#about` (c'est une offre, elle se groupe
avec les services ; le about vient ensuite comme preuve humaine).

**Structure** — même patron que les sections existantes :

- `ev-section-head` : kicker mono `réalisations`, titre Fraunces avec un mot en
  italique, sous-titre porteur de l'offre
- Grille de cartes `.ev-work__card` (`ev-reveal--stagger`, 3 projets — 2
  colonnes en tablette, 3 en desktop ≥ 1000px) :
  - media : `<video>` de scroll (muette, loop, `playsinline`, `preload="none"`,
    poster) dans un cadre 16:10
  - nom du projet + `domaine.fr` en JetBrains Mono
  - meta mono : type · lieu · année
  - 1 ligne de pitch
  - lien externe vers le site (`rel="noopener"`)
- Pied de section : CTA « Voir les réalisations » → `/realisations/` +
  accroche « Vous êtes commerçant ou artisan ? Parlons-en » → `#contact`

**Navigation** :

- Quick-nav : dot `realisations` inséré entre Services et À propos
  (ordre : Hero · Services · Réalisations · À propos · Blog · Contact)
- Nav : lien « Réalisations » ajouté dans `.ev-nav__links` — visible en
  desktop ET dans le burger (même liste). Ancre `#realisations` sur `/`,
  `aria-current="page"` sur `/realisations/`

**Copy draft** (à corriger par Vincent à la relecture) :

- Titre : « Des sites <em>faits main</em>, aussi »
- Sous-titre : « En Veille, c'est aussi des sites vitrines pour commerçants et
  artisans. Conçus, développés et mis en ligne en direct — rapides, lisibles,
  sans usine à gaz. »
- Pitch Escalire : « La vitrine d'une librairie indépendante : l'équipe, les
  événements, et la commande en ligne sans algorithme. »
- Pitch Just Bordas : « Le portfolio d'un ferronnier d'art : pièces uniques en
  acier, verre et bois, mises en valeur sans fioritures. »

## Page `/realisations/`

`_pages/realisations.html` — front matter : `layout: landing`,
`permalink: /realisations/`, `title` et `description` SEO dédiés.

**Structure** :

1. Nav partagée (include, liens absolus, lien Réalisations marqué actif)
2. Header compact : titre Fraunces + intro de l'offre (pas de hero chouette,
   pas de quick-nav dots, pas de progress bar)
3. Un bloc par projet, **alternance media/texte** gauche-droite :
   - vidéo de scroll en grand (même asset que la landing)
   - nom, lien cliquable vers le site, meta type · lieu · année
   - récit court : contexte client → ce que Vincent a livré (design + dev +
     mise en ligne) → stack → particularités (perf, SEO local, accessibilité)
4. CTA final : « Le même pour votre commerce ? » → mailto
   `vincent.ferries@gmail.com?subject=Site%20vitrine` (sujet distinct du CTA
   landing = source identifiable)
5. Footer partagé

Reveal on scroll réutilisé (`.ev-reveal`).

**Récits draft** (faits à confirmer : année, stack, hébergement, contexte) :

- *Escalire* : librairie de quartier à Escalquens qui voulait exister en ligne
  sans passer par une usine e-commerce. Site vitrine chaleureux : l'équipe, les
  rayons, les événements, et la commande en ligne déléguée aux partenaires
  libraires (Place des Libraires, Alido). Léger, rapide, images optimisées.
- *Just Bordas* : artisan ferronnier (acier, verre, bois — escaliers,
  cheminées, mobilier sur mesure) qui avait besoin d'un portfolio à la hauteur
  de ses pièces. Galeries photo soignées, formulaire de contact, mise en scène
  sobre qui laisse le travail parler.

**SEO / partage** : OG card dédiée `images/og-realisations.png` générée avec
l'outillage existant (`tools/og-card/generate.sh -q 'title=Réalisations&...'`).
Le layout `landing` pointe l'OG card par défaut : ajouter un override
`page.og_image` dans le layout (fallback sur l'actuelle si absent).

## Vidéos de scroll

**Format cible** : ~800×500 (16:10), H.264 `faststart`, sans piste audio,
6-8 s de scroll fluide, CRF ≈ 28, **400-700 Ko par site**, + poster JPEG
(première frame). En comparaison : la vidéo hero existante fait 1,2-3 Mo.

**Capture** : `tools/work-videos/` avec son propre `package.json` —
**Playwright en devDependency** (nouvelle dépendance validée, isolée dans
`tools/`, exclu du build Jekyll comme le reste de `tools/`). Le script :

1. ouvre le site en viewport 1280×800
2. attend le chargement complet (fonts, images)
3. scrolle en douceur jusqu'en bas (easing, durée fixe)
4. enregistre en vidéo (screencast Playwright)
5. `ffmpeg` : scale/crop 800×500, CRF, faststart, extraction du poster

Reproductible à l'identique quand un site évolue. Un `README.md` documente
l'usage (`npm install` puis `./record.sh <slug> <url>` → assets committés).

**Lecture côté site** — petite IIFE défensive dans `landing.js` :

- Pas d'attribut `autoplay` : c'est le JS qui pilote
- IntersectionObserver : `play()` quand la vidéo entre dans le viewport,
  `pause()` quand elle en sort (batterie)
- `prefers-reduced-motion: reduce` → jamais de `play()`, poster statique
- Sans JS → poster statique (cohérent avec le hero)
- `preload="none"` : rien n'est téléchargé tant que la vidéo n'est pas jouée

## Ce qui ne change pas

- Les URLs des 46 billets (aucun impact)
- Les 5 services et leur copy
- Le hero, le blog, le about, le CTA de la landing
- `enveille.css` (tokens) — tout le nouveau style vit dans `landing.css`

## Vérification avant « done »

- `bundle exec jekyll serve` : `/` et `/realisations/` rendent sans erreur
- Nav et footer strictement identiques sur les deux pages (diff visuel)
- Quick-nav : le dot Réalisations s'active sur la bonne section
- Burger mobile ≤ 720px : lien Réalisations présent, panneau OK sur les 2 pages
- Dark mode auto sur les deux pages
- Émulation `prefers-reduced-motion` : aucun autoplay, posters visibles
- JS désactivé : posters statiques, layout intact
- Poids : chaque MP4 ≤ 800 Ko, posters ≤ 150 Ko
- Responsive : 360px, 720px, 1000px, desktop
- Les 2 vidéos jouent/pausent selon la visibilité (onglet Performance ou log)

## Suivi

- NEXT.md : cocher/mettre à jour l'entrée « page /projets/ » (idées non
  tranchées) et référencer l'offre vitrine
- CLAUDE.md : documenter la section réalisations + `tools/work-videos/`
