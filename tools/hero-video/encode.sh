#!/bin/bash
# Encode la vidéo hero "chouette" pour le scrub au scroll de la landing.
# La portion scrubée (0 → 2,3 s) est encodée en keyframes denses
# (une par frame) pour que video.currentTime seek net ; le reste
# (envol, joué en lecture normale) garde un GOP classique.
# Usage :
#   ./tools/hero-video/encode.sh <source.mp4>
# Produit :
#   assets/video/hero-owl.mp4      (desktop 1440x810)
#   assets/video/hero-owl-540.mp4  (mobile 960x540)
#   images/hero-owl-poster.jpg     (frame 0, fond statique no-JS/reduced-motion)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"

SOURCE="${1:?Usage: ./tools/hero-video/encode.sh <source.mp4>}"

command -v ffmpeg >/dev/null || { echo "ffmpeg introuvable dans le PATH." >&2; exit 1; }

mkdir -p "$ROOT/assets/video"

COMMON=(-an -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow
        -force_key_frames "expr:lt(t,1.5)" -g 48 -movflags +faststart)

# crf 31 et non 29 : mesuré −35 % sur le poids pour une perte invisible sous
# le scrim (revue perf 2026-08-13) — 84 % des octets vivent dans la portion
# scrubée 0-1,4 s, la plus dense en keyframes
ffmpeg -y -v error -i "$SOURCE" "${COMMON[@]}" -crf 31 -vf scale=1440:810 \
  "$ROOT/assets/video/hero-owl.mp4"

ffmpeg -y -v error -i "$SOURCE" "${COMMON[@]}" -crf 34 -vf scale=960:540 \
  "$ROOT/assets/video/hero-owl-540.mp4"

# Posters aux résolutions des deux vidéos — servis en background CSS
# (landing.css, seuil 720px) : l'attribut poster n'a pas de srcset
ffmpeg -y -v error -i "$SOURCE" -frames:v 1 -q:v 6 -vf scale=1440:810 \
  "$ROOT/images/hero-owl-poster.jpg"

ffmpeg -y -v error -i "$SOURCE" -frames:v 1 -q:v 6 -vf scale=960:540 \
  "$ROOT/images/hero-owl-poster-540.jpg"

du -h "$ROOT/assets/video/hero-owl.mp4" \
      "$ROOT/assets/video/hero-owl-540.mp4" \
      "$ROOT/images/hero-owl-poster.jpg" \
      "$ROOT/images/hero-owl-poster-540.jpg"
