# work-videos — vidéos de scroll des réalisations

Capture le scroll d'un site (Playwright + Chrome système) et l'encode pour
les cartes de la section/page Réalisations.

## Usage

```bash
./tools/work-videos/record.sh escalire https://escalire.fr
./tools/work-videos/record.sh justbordas https://justbordas.fr
./tools/work-videos/record.sh cuisine https://vferries.github.io/cuisine/ \
  '.recipe-list a:has-text("Porc noir de Bigorre")'
```

Produit `assets/video/work-<slug>.mp4` (800×500, H.264 muet, ≤ 800 Ko visé)
et `images/work-<slug>-poster.jpg`. À relancer quand un site évolue —
capture reproductible (viewport 1280×800).

### Scroll

Scroll **linéaire** (sans easing) à vitesse constante (~500 px/s) : pas
d'à-coup, pas d'accélération sur les pages longues. La distance est
plafonnée à ~4 hauteurs de viewport (~3200 px, ~6,4 s à 500 px/s, capé à
8 s max) — au-delà, la page ne défile pas jusqu'en bas, mais la vitesse
reste constante. Ce plafond vaut pour la branche scroll simple ; la
branche clic (voir plus bas) dérive ses propres caps des budgets temps
(`LIST_BUDGET_SHARE` du budget pour la liste, le reste pour le détail), pas
de `~4 hauteurs de viewport`. Si la page est plus courte que le viewport, la
distance est clampée à 0 et le scroll est simplement sauté. `record.mjs`
injecte aussi `scroll-behavior: auto` sur
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

Quand il est fourni : bref scroll linéaire de la page (`LIST_BUDGET_SHARE`
du budget temps, 5 % par défaut — volontairement court), clic sur l'élément
trouvé, attente du chargement + court settle, puis scroll linéaire de la
page qui suit pour le reste du budget. Utilisé pour `cuisine` (liste de
recettes → détail d'une recette précise) avec le sélecteur
`.recipe-list a:has-text("Porc noir de Bigorre")` — cible le texte du lien,
robuste à un changement de tri/rang dans la liste. Vérifier avant capture
que le sélecteur ne matche qu'un seul élément (`page.locator(sel).count()`).

`LIST_BUDGET_SHARE` est délibérément bas : si l'élément ciblé est proche du
haut de la liste (cas de `cuisine`, 2ᵉ ligne), un scroll de liste trop long
le ferait défiler hors du viewport avant le clic — Playwright auto-scrolle
alors pour l'atteindre, ce qui produit un saut visible dans la vidéo. Si un
futur site cible un élément plus bas dans une liste longue, remonter la
part vers ~40 % (valeur d'origine) peut redevenir pertinent — à valider en
inspectant les frames autour du clic (pas de saut = OK).

### Pause hero + poster

L'enregistrement démarre dès l'ouverture de la page, avant chargement +
warm-up + scroll. `record.mjs` mesure ce temps mort (`LEAD_SECONDS`) et
`record.sh` le coupe au montage (`ffmpeg -ss`), en gardant `HOLD_S` (1,5 s)
de page statique avant le scroll : pause hero volontaire, le temps de voir
le header avant que ça défile. Si le `LEAD_SECONDS` mesuré est plus court
que `HOLD_S` (page très rapide à charger), la pause réellement présente
dans le mp4 final est simplement égale à ce lead — pas de coupe.

Le poster n'est plus la frame 0 (début du hold, pas toujours stabilisé)
mais une frame extraite à `HOLD_S - 0,3` s dans le mp4 final — vers la fin
du hold, juste avant le début du scroll, la mieux rendue du hero statique.
Marge de 0,3 s (pas moins) : le pipeline d'enregistrement vidéo de
Playwright a un décalage empirique d'environ 150-200 ms par rapport aux
timestamps JS mesurés côté page — une marge plus courte capture parfois une
frame où le scroll a déjà commencé. Léger saut visuel entre le poster et le
début de la lecture, accepté.

## Dépendances

- `node` + `npm` (`npm install` auto au premier run — `playwright-core` seul,
  pas de navigateur téléchargé : on utilise le `google-chrome` système)
- `ffmpeg`

Comme tout `tools/`, exclu du build Jekyll.
