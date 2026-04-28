#!/bin/bash
# Génère une OG card PNG à partir de tools/og-card/template.html via Chrome headless.
# Usage :
#   ./tools/og-card/generate.sh                              # → images/og-card.png (par défaut)
#   ./tools/og-card/generate.sh -o images/og-billet.png \
#     -q 'title=Billet&tagline=Sous-titre%20perso'           # → carte custom
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
TEMPLATE="$DIR/template.html"

OUTPUT="$ROOT/images/og-card.png"
QUERY=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -o|--output) OUTPUT="$2"; shift 2 ;;
    -q|--query)  QUERY="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,7p' "$0"
      exit 0
      ;;
    *) echo "Option inconnue : $1" >&2; exit 1 ;;
  esac
done

CHROME="$(command -v google-chrome || command -v chromium || command -v chromium-browser)"
if [[ -z "$CHROME" ]]; then
  echo "Chrome/Chromium introuvable dans le PATH." >&2
  exit 1
fi

URL="file://$TEMPLATE"
[[ -n "$QUERY" ]] && URL="$URL?$QUERY"

mkdir -p "$(dirname "$OUTPUT")"

# Chrome headless ajoute un léger offset vertical à 1200x630.
# On capture en 1200x720 puis on crop précisément à 1200x630.
TMP="$(mktemp --suffix=.png)"
trap 'rm -f "$TMP"' EXIT

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --no-sandbox \
  --force-device-scale-factor=1 \
  --window-size=1200,720 \
  --virtual-time-budget=8000 \
  --run-all-compositor-stages-before-draw \
  --screenshot="$TMP" \
  --default-background-color=00000000 \
  "$URL" 2>/dev/null

magick "$TMP" -crop 1200x630+0+0 +repage "$OUTPUT"

echo "généré : $OUTPUT"
