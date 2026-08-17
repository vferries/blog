#!/usr/bin/env bash
# Synchronise les démos de l'atelier depuis le repo prospection.
# Source de vérité : ../prospection/demos/ — ce script copie et adapte :
#   demos/<slug>/index.html  (+ assets du slug dans le même dossier)
#   demos/fonts/             (woff2 partagés, @font-face réécrits en ../fonts/)
#   og_<slug>.jpg → og.jpg, og:image absolutisée, meta robots noindex injectée.
# Rejouable : chaque run repart de la source et écrase la copie.
set -euo pipefail

ICI="$(cd "$(dirname "$0")" && pwd)"
BLOG="$(cd "$ICI/../.." && pwd)"
SRC="${DEMOS_SRC:-$BLOG/../prospection/demos}"
DEST="$BLOG/demos"
DOMAINE="https://www.enveille.info"

# slug publié (tirets) → nom de fichier source (underscores)
SLUGS=(
  "vert-et-contre-tout:vert_et_contre_tout"
  "ampere-et-fils:ampere_et_fils"
  "l-aplat-pays:l_aplat_pays"
  "carreau-sur-table:carreau_sur_table"
  "chaud-devant:chaud_devant"
)

[ -d "$SRC" ] || { echo "source introuvable : $SRC" >&2; exit 1; }

mkdir -p "$DEST"
rm -rf "$DEST/fonts"
cp -r "$SRC/fonts" "$DEST/fonts"

for paire in "${SLUGS[@]}"; do
  slug="${paire%%:*}"; src_nom="${paire##*:}"
  dossier="$DEST/$slug"
  rm -rf "$dossier"
  mkdir -p "$dossier"

  # assets du slug (webp, mp4…) — copiés à plat, références relatives intactes
  find "$SRC" -maxdepth 1 -type f -name "${src_nom}_*" -exec cp {} "$dossier/" \;
  # carte og : nom stable dans le dossier du slug
  cp "$SRC/og_${src_nom}.jpg" "$dossier/og.jpg"

  # page : réécritures fonts + og + noindex
  sed -e "s|url('fonts/|url('../fonts/|g" \
      -e "s|content=\"og_${src_nom}.jpg\"><!-- à absolutiser lors de l'intégration au blog -->|content=\"$DOMAINE/demos/$slug/og.jpg\">|" \
      -e "s|<meta name=\"description\"|<meta name=\"robots\" content=\"noindex\">\n<meta name=\"description\"|" \
      "$SRC/${src_nom}.html" > "$dossier/index.html"

  # garde-fous : rien ne doit rester à réécrire
  grep -q "url('../fonts/" "$dossier/index.html" || { echo "$slug : fonts non réécrites" >&2; exit 1; }
  grep -q "$DOMAINE/demos/$slug/og.jpg" "$dossier/index.html" || { echo "$slug : og:image non absolutisée" >&2; exit 1; }
  grep -q 'content="noindex"' "$dossier/index.html" || { echo "$slug : noindex manquant" >&2; exit 1; }
  echo "OK $slug ($(du -sh "$dossier" | cut -f1))"
done

echo "fonts partagées : $(du -sh "$DEST/fonts" | cut -f1)"
