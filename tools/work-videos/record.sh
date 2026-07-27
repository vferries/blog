#!/bin/bash
# Capture + encode la vidéo de scroll d'une réalisation.
# Usage :
#   ./tools/work-videos/record.sh <slug> <url> [click-selector]
# [click-selector] : scénario liste → détail (scroll liste, clic, scroll
#   détail) au lieu du simple scroll de page. Voir README.
# Produit :
#   assets/video/work-<slug>.mp4     (800x500, H.264 muet, faststart)
#   images/work-<slug>-poster.jpg    (frame juste avant le début du scroll)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

SLUG="${1:?Usage: ./tools/work-videos/record.sh <slug> <url> [click-selector]}"
URL="${2:?Usage: ./tools/work-videos/record.sh <slug> <url> [click-selector]}"
CLICK_SELECTOR="${3:-}"

command -v ffmpeg >/dev/null || { echo "ffmpeg introuvable dans le PATH." >&2; exit 1; }
command -v node   >/dev/null || { echo "node introuvable dans le PATH." >&2; exit 1; }
[ -d "$DIR/node_modules" ] || (cd "$DIR" && npm install)

RAW="$(mktemp -u "${TMPDIR:-/tmp}/work-XXXXXX").webm"
trap 'rm -f "$RAW"' EXIT

NODE_OUTPUT="$(node "$DIR/record.mjs" "$URL" "$RAW" "$CLICK_SELECTOR")"
LEAD="$(printf '%s\n' "$NODE_OUTPUT" | sed -n 's/^LEAD_SECONDS=\(.*\)$/\1/p')"
: "${LEAD:?LEAD_SECONDS introuvable dans la sortie de record.mjs}"

# Coupe le temps mort (chargement + warm-up + settle) en gardant HOLD_S de
# page statique avant le scroll : pause hero volontaire pour laisser le
# temps de voir le header avant que ça défile.
HOLD_S=1.5
TRIM="$(LC_ALL=C awk -v lead="$LEAD" -v hold="$HOLD_S" 'BEGIN { t = lead - hold; if (t < 0) t = 0; printf "%.2f", t }')"

# Pause hero réellement présente dans le mp4 final (peut être < HOLD_S si le
# LEAD mesuré était plus court que HOLD_S, auquel cas TRIM est clampé à 0 et
# tout le lead est conservé tel quel).
EFFECTIVE_HOLD="$(LC_ALL=C awk -v lead="$LEAD" -v hold="$HOLD_S" 'BEGIN { t = (lead < hold) ? lead : hold; printf "%.2f", t }')"

# Le poster n'est plus la frame 0 (début du hold, parfois pas encore stabilisé)
# mais une frame vers la fin du hold, juste avant le début du scroll — la
# mieux rendue du hero statique. Marge de 0,3 s (pas 0,1 s) : vérifié
# empiriquement que le pipeline d'enregistrement vidéo de Playwright a un
# décalage d'environ 150-200 ms par rapport aux timestamps JS mesurés côté
# page — à 0,1 s de marge, la frame extraite montrait parfois un scroll déjà
# engagé (ex. cuisine : une ligne de recette supplémentaire déjà visible).
POSTER_MARGIN_S=0.3
POSTER_S="$(LC_ALL=C awk -v hold="$EFFECTIVE_HOLD" -v margin="$POSTER_MARGIN_S" 'BEGIN { t = hold - margin; if (t < 0) t = 0; printf "%.2f", t }')"

MP4="$ROOT/assets/video/work-$SLUG.mp4"
POSTER="$ROOT/images/work-$SLUG-poster.jpg"
MP4_BUDGET=819200      # 800 Ko
POSTER_BUDGET=153600   # 150 Ko

mkdir -p "$ROOT/assets/video"
ffmpeg -y -v error -ss "$TRIM" -i "$RAW" -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -preset slow -crf 28 -vf "scale=800:500" -movflags +faststart \
  "$MP4"

MP4_SIZE="$(LC_ALL=C stat -c%s "$MP4")"
if [ "$MP4_SIZE" -gt "$MP4_BUDGET" ]; then
  echo "Erreur : $MP4 dépasse le budget de 800 Ko ($MP4_SIZE octets). Remonter -crf dans record.sh (ex. 28 → 30) et relancer." >&2
  exit 1
fi

ffmpeg -y -v error -ss "$POSTER_S" -i "$MP4" -frames:v 1 -q:v 6 \
  "$POSTER"

POSTER_SIZE="$(LC_ALL=C stat -c%s "$POSTER")"
if [ "$POSTER_SIZE" -gt "$POSTER_BUDGET" ]; then
  echo "Erreur : $POSTER dépasse le budget de 150 Ko ($POSTER_SIZE octets). Remonter -q:v dans record.sh (ex. 6 → 8, plus petit = meilleure qualité/plus lourd) et relancer." >&2
  exit 1
fi

du -h "$MP4" "$POSTER"
