#!/bin/bash
# Capture + encode la vidéo de scroll d'une réalisation.
# Usage :
#   ./tools/work-videos/record.sh <slug> <url>
# Produit :
#   assets/video/work-<slug>.mp4     (800x500, H.264 muet, faststart)
#   images/work-<slug>-poster.jpg    (frame 0)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

SLUG="${1:?Usage: ./tools/work-videos/record.sh <slug> <url>}"
URL="${2:?Usage: ./tools/work-videos/record.sh <slug> <url>}"

command -v ffmpeg >/dev/null || { echo "ffmpeg introuvable dans le PATH." >&2; exit 1; }
command -v node   >/dev/null || { echo "node introuvable dans le PATH." >&2; exit 1; }
[ -d "$DIR/node_modules" ] || (cd "$DIR" && npm install)

RAW="$(mktemp -u "${TMPDIR:-/tmp}/work-XXXXXX").webm"
trap 'rm -f "$RAW"' EXIT

node "$DIR/record.mjs" "$URL" "$RAW"

mkdir -p "$ROOT/assets/video"
ffmpeg -y -v error -i "$RAW" -an -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -preset slow -crf 28 -vf "scale=800:500" -movflags +faststart \
  "$ROOT/assets/video/work-$SLUG.mp4"

ffmpeg -y -v error -i "$ROOT/assets/video/work-$SLUG.mp4" -frames:v 1 -q:v 6 \
  "$ROOT/images/work-$SLUG-poster.jpg"

du -h "$ROOT/assets/video/work-$SLUG.mp4" "$ROOT/images/work-$SLUG-poster.jpg"
