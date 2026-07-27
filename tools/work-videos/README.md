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

L'enregistrement démarre dès l'ouverture de la page, avant chargement +
scroll. `record.mjs` mesure ce temps mort (`LEAD_SECONDS`) et `record.sh`
le coupe au montage (`ffmpeg -ss`, en gardant ~0,3 s de page statique avant
le scroll) : la frame 0 du mp4 final — utilisée comme poster — tombe donc
sur une frame utile plutôt qu'un écran blanc.

## Dépendances

- `node` + `npm` (`npm install` auto au premier run — `playwright-core` seul,
  pas de navigateur téléchargé : on utilise le `google-chrome` système)
- `ffmpeg`

Comme tout `tools/`, exclu du build Jekyll.
