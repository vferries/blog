# Versionner le design system — design

**Date** : 2026-07-16 · **Statut** : validé

## Objectif

Le design system En Veille (docs + assets) vit aujourd'hui dans `.claude/` (gitignoré). Le versionner dans le repo pour le rendre réutilisable et pérenne. Le repo étant public, tout ce qui est versionné devient public — assumé.

## Décisions

- **Emplacement** : `docs/design/` (déjà exclu du build Jekyll via `_config.yml`).
- **Opération** : déplacement, pas copie — une seule source de vérité.
- **Périmètre versionné** :
  - `.claude/context/DESIGN.md` → `docs/design/DESIGN.md`
  - `.claude/context/DESIGN-site.md` → `docs/design/DESIGN-site.md`
  - `.claude/assets/{tokens.css, tokens.json, palette.json, enveille-logo-final.svg, favicon-main.svg, favicon-small.svg, clean_figma_svg.py, README.md}` → `docs/design/assets/`
- **Reste privé dans `.claude/`** : `context/CHANGELOG-session.md`, `context/INSTALL.md`, `previews/`.
- **Aucun changement** au `.gitignore` (`.claude/` reste ignoré) ni à l'exclude Jekyll.

## Mises à jour de références

- `CLAUDE.md` : la section « Contexte non versionné » ne liste plus que ce qui reste local ; ajouter un pointeur vers `docs/design/`.
- `CLAUDE.local.md` (non versionné) : chemins mis à jour.
- Chemins internes dans `DESIGN.md`, `DESIGN-site.md` et `assets/README.md` qui référencent `.claude/assets/` ou `.claude/context/`.

## Git

- Branche `docs/versionne-design-system` depuis `main`.
- Deux commits : (1) ajout de `docs/design/` (fichiers déplacés + chemins internes corrigés), (2) mise à jour des références dans `CLAUDE.md`.

## Vérification

- `bundle exec jekyll build` passe et `_site/docs/` n'existe pas.
- Aucune référence obsolète à `.claude/context/DESIGN*` ou `.claude/assets/` dans les fichiers versionnés (grep).
