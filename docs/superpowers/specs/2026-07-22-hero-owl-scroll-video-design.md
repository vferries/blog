# Hero vidéo « chouette » pilotée au scroll — design

**Date** : 2026-07-22
**Statut** : validé (brainstorm avec Vincent)
**Branche** : `feat/hero-owl-scroll-video`

## Objectif

Intégrer la vidéo générée (chouette perchée sous la Voie lactée, tête qui pivote,
yeux qui s'allument en symboles power cyan — écho direct au logo, puis envol) en
fond full-bleed du hero de la landing, pilotée par le scroll :

1. **Step épinglé** : le hero reste à l'écran (sticky), le scroll scrubbe la
   rotation de tête + l'allumage des yeux.
2. **Scroll réel** : quand le pin se libère, la page défile normalement et
   l'envol se joue une fois, à vitesse normale.

## Source

- Fichier : `~/Téléchargements/openart-02178475332237200000000000000000000ffffc0a8a216930469_1784753513105_67369037.mp4`
- 1920×1080, H.264, 24 fps, 5,04 s (121 frames), 4,9 Mo, piste AAC inutile
- Watermark OpenArt (✦) en bas à droite (~x1836, y893)
- **Non commitée** (régénérable côté OpenArt) ; provenance et commande
  d'encodage documentées dans `tools/hero-video/README.md`

### Timeline mesurée (frames extraites)

| Temps | Contenu |
|---|---|
| 0 → ~1,5 s | Rotation de tête (profil → face), yeux pleinement allumés à ~1,4 s |
| 1,5 → 3,3 s | Chouette face caméra, quasi immobile |
| ~3,3 → 5,0 s | Déploiement des ailes, envol, branche vide |

## Décisions validées

| Question | Décision |
|---|---|
| Placement | Full-bleed en fond du hero entier, texte par-dessus avec scrim |
| Envol | Joué une fois à la libération du pin (pas scrubbé) |
| Mobile | Même expérience (pin + scrub), recadrage `object-position` soigné |
| Texte hero | H1/lede/CTA visibles d'emblée ; highlights cyan et accents italiques ne s'allument qu'en sync avec les yeux |
| Colonne logo | `.ev-hero__visual` supprimée (la chouette est le logo animé) |
| Watermark | Masqué par le scrim dégradé bas (pas de crop) |

## Découpe et timings

| Segment | Temps vidéo | Piloté par |
|---|---|---|
| Rotation + allumage + pose | 0 → 2,2 s | Scrub au scroll (pin) |
| Pose finale + envol + branche vide | 2,2 → 5,0 s | `play()` une fois |

- Couper le scrub à 2,2 s (et non 3,3 s) évite ~1 s de scrub « mort » ;
  l'envol joué inclut alors ~1 s où la chouette fixe le visiteur avant de
  décoller — beat cinématique voulu.
- Seuil `is-powered` : progression ≈ 0,65 du scrub (≈ t=1,4 s).
- `SPLIT = 2.2` et `POWER_THRESHOLD = 0.65` : constantes nommées en tête
  d'IIFE, ajustables au feeling en local.

## Structure HTML (`index.html`)

```html
<div class="ev-hero-pin">                      <!-- ~220vh desktop, ~180vh mobile -->
  <section class="ev-hero ev-hero--video">     <!-- sticky top:0, hauteur viewport -->
    <video class="ev-hero__bg" muted playsinline preload="auto"
           poster="/images/hero-owl-poster.jpg" aria-hidden="true"></video>
    <div class="ev-hero__scrim" aria-hidden="true"></div>
    <div class="ev-hero__grid"><!-- contenu texte actuel, sans .ev-hero__visual --></div>
  </section>
</div>
```

- Pas de `<source>` en dur : le JS injecte `src` (1080p ou 540p selon
  `matchMedia('(max-width: 720px)')`). Sans JS ou en
  `prefers-reduced-motion`, aucun octet vidéo téléchargé.
- Poster = frame 0 (chouette de profil) → pas de saut visuel quand la vidéo
  prend le relais au même timecode.

## CSS (`landing.css`)

- `.ev-hero-pin { height: 220vh }` (180vh ≤ 720px). En reduced-motion ou sans
  la classe JS : `height: auto`, pas de pin.
- `.ev-hero--video` : `position: sticky; top: 0; height: 100svh;
  overflow: hidden`. En haut de page, la nav (statique, au-dessus du
  wrapper) occupe le haut du viewport et le bas du hero dépasse légèrement
  le fold ; dès que la nav sort à l'écran, le hero épinglé occupe tout le
  viewport — pas de bande de fond visible sous lui pendant le pin.
- `.ev-hero__bg` : `position: absolute; inset: 0; object-fit: cover;
  object-position: 62% 50%` — la chouette (centrée dans la source) glisse
  dans la moitié droite, le texte respire à gauche. Valeur ajustée en
  portrait pour garder la chouette visible.
- `.ev-hero__scrim` : double dégradé — horizontal navy→transparent derrière
  le texte (lisibilité) + vertical bas vers `var(--bg)` de la page (fondu
  vers le marquee **et** masquage du watermark ✦).
- Hero « toujours sombre » : tokens texte/CTA forcés en variante dark (CTA
  cyan) quel que soit `prefers-color-scheme`. Le reste de la page ne change pas.
- États accents : les styles « éteints » (`.ev-hl` en `background-size: 0`,
  `em` sans emphase) ne s'appliquent que sous `.ev-hero--scrub` (classe posée
  par le JS à l'init) **et** `:not(.is-powered)`. Transition ~400 ms à
  l'allumage. Sans JS / reduced-motion : accents allumés d'office.

## JS (`landing.js` — nouvelle IIFE, style existant)

Machine à trois états, listener scroll throttlé rAF :

- **SCRUB** (p ∈ [0,1[ dans le pin) : `video.currentTime = p × SPLIT`.
  Seek seulement si |Δt| > 1/24 s. Toggle `is-powered` au seuil, dans les
  deux sens.
- **FLYAWAY** (p atteint 1) : `video.play()` une fois ; sur `ended`, la
  dernière frame (branche vide) reste affichée.
- **RESET** (p repasse < 1) : `pause()`, retour au mapping scrub (la
  chouette se reperche instantanément), flag envol nettoyé. Couvre aussi le
  scroll-up pendant que l'envol joue.
- Init : gardée par `prefers-reduced-motion` ; choix du src 540p/1080p ;
  pose `.ev-hero--scrub` sur le hero.
- Progression : `p = clamp((scrollY − wrapperTop) / (wrapperH − vh), 0, 1)`,
  `wrapperTop` mesuré au runtime (la nav est au-dessus du hero).

## Assets & encodage (`tools/hero-video/`)

`encode.sh` (même esprit que `tools/og-card/generate.sh`) : prend la source
en argument, produit :

| Sortie | Traitement | Cible poids |
|---|---|---|
| `assets/video/hero-owl.mp4` | 1080p, `-an`, CRF ≈ 23, keyframe chaque frame sur 0→2,3 s (`-force_key_frames "expr:lt(t,2.3)"`), GOP normal ensuite, `+faststart` | ≤ 8 Mo |
| `assets/video/hero-owl-540.mp4` | idem en 960×540 | ≤ 2,5 Mo |
| `images/hero-owl-poster.jpg` | frame 0 | ~150-200 Ko |

Si l'all-intra sur le ciel étoilé explose la cible : CRF plus haut sur la
portion scrub, ou repli 1440×810. Mesurer au réel.

## Fallbacks

| Contexte | Comportement |
|---|---|
| Sans JS | Poster statique en fond, accents allumés, scroll normal |
| `prefers-reduced-motion` | Idem, pas de pin, pas de téléchargement vidéo |
| Firefox | Identique aux autres (tout est JS, pas de `animation-timeline`) |

## Point d'attention UX

Le pin ajoute ~120vh de scroll « sur place » au premier geste. C'est le prix
du step 1 — distance volontairement courte pour rester un plaisir, pas un
péage. Ajustable via la hauteur de `.ev-hero-pin`.

## Vérification avant « done »

- Test local (`bundle exec jekyll serve`) Chrome + Firefox
- Émulation mobile (recadrage portrait, scrub tactile) et reduced-motion
- JS désactivé → poster + accents visibles
- Aller-retours de scroll agressifs autour du seuil et pendant l'envol
- Progress bar et quick-nav dots corrects avec la page rallongée
- Easter eggs intacts (logo 5 clics, Konami)
- Poids réseau mesuré (cibles ci-dessus), poster préchargé = LCP sain
