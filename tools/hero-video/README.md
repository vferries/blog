# hero-video — encodage de la vidéo hero « chouette »

La vidéo source est générée sur OpenArt (chouette perchée sous la Voie
lactée : rotation de tête, yeux qui s'allument en symboles power, envol).
Elle n'est **pas commitée** (≈5 Mo, régénérable côté OpenArt). Dernière
source utilisée : `openart-02178476426334700000000000000000000ffffc0a8704528bb6f_1784764420861_86833799.mp4`
(1920×1080, H.264, 24 fps, 5,04 s).

## Régénérer les assets

```bash
./tools/hero-video/encode.sh ~/Téléchargements/openart-....mp4
```

Produit `assets/video/hero-owl.mp4` (desktop), `assets/video/hero-owl-540.mp4`
(mobile ≤720px) et `images/hero-owl-poster.jpg` (frame 0, fallback statique).

## Pourquoi cet encodage

- `-force_key_frames "expr:lt(t,1.5)"` : la portion 0→1,4 s est scrubée
  via `video.currentTime` au scroll — une keyframe par frame rend le seek
  net. L'envol (1,4→5 s) est joué en lecture normale, GOP classique (`-g 48`).
- `-an` : la piste audio de la source est inutile (autoplay muted de toute façon).
- Timings consommés par `assets/js/landing.js` (IIFE HERO OWL, constante `SPLIT`).

Cibles de poids : desktop ≤ 8 Mo, mobile ≤ 2,5 Mo, poster ≤ 250 Ko.

**Encodage actuellement ajusté** : CRF 29 (desktop) / CRF 34 (mobile) + desktop 1440×810 + poster -q:v 6.
Poids réels : desktop 7.6 Mo, mobile 2.5 Mo, poster 228 Ko.
