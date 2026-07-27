# work-videos — vidéos de scroll des réalisations

Capture le scroll d'un site (Playwright + Chrome système) et l'encode pour
les cartes de la section/page Réalisations.

## Usage

```bash
./tools/work-videos/record.sh escalire https://escalire.fr
./tools/work-videos/record.sh justbordas https://justbordas.fr
./tools/work-videos/record.sh cuisine https://vferries.github.io/cuisine/ \
  '.recipe-list .recipe-row:first-child a'
```

Produit `assets/video/work-<slug>.mp4` (800×500, H.264 muet, ≤ 800 Ko visé)
et `images/work-<slug>-poster.jpg`. À relancer quand un site évolue —
capture reproductible (viewport 1280×800).

### Scroll

Scroll **linéaire** (sans easing) à vitesse constante (~500 px/s) : pas
d'à-coup, pas d'accélération sur les pages longues. La distance est
plafonnée à ~4 hauteurs de viewport (~3200 px, ~6,4 s à 500 px/s, capé à
8 s max) — au-delà, la page ne défile pas jusqu'en bas, mais la vitesse
reste constante. `record.mjs` injecte aussi `scroll-behavior: auto` sur
`<html>` pour neutraliser le smooth-scroll natif de certains sites (source
d'à-coups avec un `scrollTo` scripté), et fait un aller-retour bas→haut en
warm-up avant le scroll utile (déclenche les lazy-loads, stabilise
`scrollHeight`) — ce warm-up se déroule pendant la phase LEAD, trimée au
montage de toute façon (voir plus bas).

### Scénario liste → détail (paramètre clic optionnel)

`record.sh` accepte un 3ᵉ argument optionnel, un sélecteur CSS :

```bash
./tools/work-videos/record.sh <slug> <url> [click-selector]
```

Quand il est fourni : scroll linéaire de la page sur ~40 % du budget temps,
clic sur l'élément trouvé, attente du chargement + court settle, puis
scroll linéaire de la page qui suit pour le reste du budget. Utilisé pour
`cuisine` (liste de recettes → détail de la première recette) avec le
sélecteur `.recipe-list .recipe-row:first-child a` — cible "la première
recette" quel que soit son slug, robuste aux changements de contenu du
site.

### Poster (frame 0)

L'enregistrement démarre dès l'ouverture de la page, avant chargement +
warm-up + scroll. `record.mjs` mesure ce temps mort (`LEAD_SECONDS`) et
`record.sh` le coupe au montage (`ffmpeg -ss`, en gardant ~0,3 s de page
statique avant le scroll) : la frame 0 du mp4 final — utilisée comme
poster — tombe donc sur une frame utile plutôt qu'un écran blanc.

## Dépendances

- `node` + `npm` (`npm install` auto au premier run — `playwright-core` seul,
  pas de navigateur téléchargé : on utilise le `google-chrome` système)
- `ffmpeg`

Comme tout `tools/`, exclu du build Jekyll.
