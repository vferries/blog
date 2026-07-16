# Kit favicon En Veille

2 variantes SVG adaptées à la taille d'affichage :

| Fichier | Taille cible | Contenu |
|---|---|---|
| `favicon-small.svg` | **16px** | Pixel art : chouette avec ailes, bec, power symbols, yeux — dessiné pixel par pixel pour rester lisible à 16×16 |
| `favicon-main.svg`  | **32px et plus** | Logo complet : cercle navy, ailes/sourcils dépassant du cercle, bec, yeux, power symbols |

**favicon-small** a été généré avec [RealFaviconGenerator](https://realfavicongenerator.net) puis traduit en SVG éditable (3.5 Ko, même rendu pixel-perfect que l'original).

**favicon-main** conserve toute la richesse du logo principal incluant les ailes stylisées qui dépassent du cercle.

## Fichiers à copier à la racine du site

```
favicon.ico              # ICO multi-résolution (16/32/48)
favicon.svg              # SVG moderne (= favicon-main)
favicon-16.png           # small pixel art
favicon-32.png           # main
favicon-48.png           # main
apple-touch-icon.png     # iOS 180×180 (main)
android-chrome-192.png   # PWA (main)
android-chrome-512.png   # PWA HD (main)
site.webmanifest         # PWA manifest
```

## Intégration Jekyll

Copier les fichiers à la racine du site Jekyll, puis ajouter le contenu de `HEAD-SNIPPET.html` dans `_includes/head/custom.html`.

## Régénérer les PNG si modification

```bash
# À partir des SVG sources
rsvg-convert -w 16  favicon-small.svg -o favicon-16.png
rsvg-convert -w 32  favicon-main.svg  -o favicon-32.png
rsvg-convert -w 48  favicon-main.svg  -o favicon-48.png
rsvg-convert -w 180 favicon-main.svg  -o apple-touch-icon.png
rsvg-convert -w 192 favicon-main.svg  -o android-chrome-192.png
rsvg-convert -w 512 favicon-main.svg  -o android-chrome-512.png
```

## Outils utiles pour regénérer les favicons petits

- **RealFaviconGenerator** — https://realfavicongenerator.net — ajuste intelligemment les différentes tailles
- **Sharp** (npm) — pour pipelines avec downsampling `kernel: 'nearest'`
- **ImageMagick** — `magick in.png -filter Point -dither None -resize 16x16 out.png`

Le pixel art 16px peut aussi être retravaillé manuellement dans un éditeur comme Aseprite ou Piskel.
