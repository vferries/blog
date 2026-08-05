# Barre du haut unifiée — design

**Date** : 2026-08-05 · **Statut** : validé par Vincent (niveau « réparer et rapprocher »)

## Objectif

Effacer la rupture visuelle entre la barre de la landing (`.ev-nav`, sur `/` et
`/realisations/`) et celle des 58 pages Minimal Mistakes (`.masthead`). On
change de barre en passant de `/` à `/blog/`, ce qui casse la continuité de
l'identité.

Le périmètre validé est **CSS seul** : aucun shadow de partial, aucune
fonctionnalité déplacée. La recherche et le menu responsive `greedy-nav`
continuent de fonctionner tels quels.

## Écart mesuré

Relevé sous Chrome à 1280px, landing contre `/ARC-Welder/` :

| | `.ev-nav` | `.masthead` |
|---|---|---|
| Hauteur | 65px | 65px — déjà identique |
| Position | `sticky`, top 0 | `relative` |
| Fond | `--ev-bg` à 88 %, translucide | `--ev-bg` opaque |
| Bordure basse | transparente, animée au scroll | 1px fixe |
| Largeur interne | 1200px | 1280px |
| Padding interne | 14px 32px | 16px |
| Liens | Inter 15px, `--ev-text-muted` | Fraunces 18,4px, `--ev-text` |

L'écart perçu vient d'abord de la **typo des liens**, ensuite de l'absence de
sticky. Les hauteurs coïncident déjà, il n'y a rien à recaler de ce côté.

## Bug préalable : le logo rend en 0×0

`_config.yml` déclare `logo: "/images/logo.svg"` et le partial du thème le pose
bien dans le DOM des 58 pages :

```html
<a class="site-logo" href="/"><img src="/images/logo.svg" alt="En Veille"></a>
```

Mais `images/logo.svg` ne porte qu'un `viewBox`, sans attributs `width` ni
`height`, et la feuille du thème ne pose qu'un `max-height: 2rem`. Un maximum
ne dimensionne rien : face à un SVG sans dimension intrinsèque, l'`<img>`
s'effondre à zéro. La chouette est donc invisible partout sauf sur la landing,
qui dimensionne son `.ev-nav__brand img` explicitement (`36px`).

**Correctif** : `.site-logo img { height: 2rem; width: auto; }` dans
`enveille.css`.

C'est la moitié de l'écart perçu, et ça se règle en une règle.

## Décision : des tokens partagés, pas une copie de valeurs

Recopier les valeurs de `.ev-nav` dans les règles `.masthead` réparerait
aujourd'hui pour laisser les deux barres re-diverger au premier tweak. Six
custom properties sont donc déclarées dans `enveille.css` (chargé partout), et
**les deux barres les consomment** :

| Token | Valeur | Remplace |
|---|---|---|
| `--ev-nav-bg` | `color-mix(in srgb, var(--ev-bg) 88%, transparent)` | fond en dur des deux |
| `--ev-nav-blur` | `blur(14px)` | `backdrop-filter` de `.ev-nav--scrolled` |
| `--ev-nav-maxw` | `1200px` | `max-width` des conteneurs internes |
| `--ev-nav-pad` | `14px 32px` | padding des conteneurs internes |
| `--ev-nav-link-size` | `0.9375rem` | taille des liens |
| `--ev-nav-offset` | `84px` | `scroll-margin-top` sous la barre collante |

`landing.css` remplace ses valeurs littérales par ces tokens. Il est chargé
après `enveille.css`, et les custom properties se résolvent à l'usage : l'ordre
ne pose pas de problème.

Les couleurs de lien n'ont pas besoin de nouveau token — `--ev-text-muted`,
`--ev-text` et `--ev-blue` existent déjà et sont partagées.

## Règles appliquées à `.masthead`

Dans `enveille.css`, en remplacement du bloc « Nav top (masthead) » actuel :

- `.masthead` : `position: sticky; top: 0; z-index: 20;`, fond `--ev-nav-bg`,
  `backdrop-filter: var(--ev-nav-blur)`, bordure basse transparente animée au
  scroll (mêmes `@keyframes` que la landing).
- `.masthead__inner-wrap` : `max-width: var(--ev-nav-maxw)`,
  `padding: var(--ev-nav-pad)`.
- `.greedy-nav .visible-links a` : `font-family: var(--font-sans)`,
  `font-size: var(--ev-nav-link-size)`, `font-weight: 500`, couleur
  `--ev-text-muted` → `--ev-text` au hover.
- `.site-logo img` : le correctif ci-dessus.

Le `backdrop-filter` est posé sans condition, là où la landing l'active en JS
via `.ev-nav--scrolled`. Au repos rien n'a défilé sous la barre, donc le flou
n'a rien à flouter : le rendu est identique, sans avoir à charger de JS sur les
pages du thème.

## Trois conséquences à traiter

**1. Le sticky masque les cibles d'ancres.** Sur un billet, `scroll-margin-top`
vaut `0px` aujourd'hui. La règle `[id] { scroll-margin-top: 84px }` existe bien
mais vit dans `landing.css`, qui n'est pas chargé sur les pages du thème. Elle
migre dans `enveille.css` en consommant `--ev-nav-offset`, et disparaît de
`landing.css`.

**2. La bordure animée n'existe pas sur Firefox.** Mesuré le 2026-08-05 via
`CSS.supports('animation-timeline', 'scroll(root)')` : `false` sur Firefox 153,
`true` sur Chrome et WebKit 26.5. La dégradation actuelle de la landing est
donc « bordure transparente ». Appliquée telle quelle à `.masthead`, elle
**supprimerait** sur Firefox une bordure aujourd'hui présente — une régression.
La règle est donc encadrée :

```css
@supports not (animation-timeline: scroll(root)) {
  .masthead { border-bottom-color: var(--ev-border); }
}
```

La condition elle-même a été contrôlée sur les trois moteurs : elle s'évalue à
`true` sur Firefox seul, ce qui est bien le comportement attendu.
`color-mix()`, `backdrop-filter` et `:has()` sont supportés partout.

**3. `prefers-reduced-transparency` doit couvrir la nouvelle surface.** Le bloc
posé le 2026-08-05 rend opaques `.ev-nav`, `.ev-nav__links` et `.ev-quick-nav`.
`.masthead` devient une quatrième surface translucide floutée : elle rejoint ce
bloc, sans quoi la préférence serait respectée sur la landing et ignorée sur les
58 autres pages.

## Hors périmètre

- Pastille « Disponible » et burger CRT sur les pages du thème.
- Alignement des jeux de liens (`_data/navigation.yml` en porte 4, `ev-nav` 6).
- Le remplacement de la masthead par `ev-nav.html` (niveau 3 écarté : il coûte
  un 3ᵉ shadow couplé à l'upstream et demande de réimplanter la recherche).
- Le bug Disqus trouvé en route — `embed.js` jette
  `Cannot read properties of null (reading 'appendChild')` quand l'ouverture de
  la recherche masque `.initial-content` sur un billet. Sans rapport avec la
  barre, à traiter séparément.

## Vérification

- Captures avant/après sur landing, billet et `/blog/`, en 1280 et 375px.
- La recherche répond toujours : ouverture du panneau, saisie au clavier,
  résultats rendus (contrôlé à 10 résultats pour « devoxx » avant travaux).
- La `greedy-nav` replie toujours ses liens en dropdown à l'étroit.
- La sidebar auteur des billets est elle aussi `sticky` : vérifier qu'elle ne
  glisse pas sous la barre, et ajuster son `top` le cas échéant.
- Le panneau de recherche et le dropdown `hidden-links` passent au-dessus de la
  barre, pas dessous : contrôler les `z-index` en vis-à-vis de `20`.
- Une ancre interne de billet amène bien sa cible sous la barre, pas dessous.
- Contrôle `prefers-reduced-transparency` via CDP, comme pour les trois autres
  surfaces.
