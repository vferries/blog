# CLAUDE.md — contexte projet

> Blog et landing Jekyll de **En Veille** (Vincent Ferries, dev indé).
> Ce fichier est lu automatiquement par Claude Code au lancement.
> Pour le contexte brand/design détaillé (non versionné), voir `CLAUDE.local.md`.

## Stack

- **Jekyll** + thème **Minimal Mistakes** via `remote_theme`
- Hébergé sur **GitHub Pages** (CNAME `www.enveille.info`)
- Pas de build custom, GitHub Pages gère nativement
- Commentaires : Disqus (`blogvincent`)

## Lancer en local

```bash
bundle install
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

## Structure

```
/                    # landing services (layout custom)
/blog/               # archive paginée des billets
/<slug>/             # billets individuels
/about/              # à propos
/feed.xml            # RSS
```

- `_posts/` : 48 billets depuis 2011, URLs permaliens `/:categories/:title/` (stables, ne pas changer)
- `_layouts/landing.html` : layout custom pour la landing (hérite de `default`)
- `_includes/head/custom.html` : chargement fonts + CSS/JS (le bloc `landing.css`/`landing.js` est conditionné par `{% if page.is_landing %}`)
- `assets/css/enveille.css` : design tokens + thème appliqué partout
- `assets/css/landing.css` : styles spécifiques à la landing (classes `.ev-*`)
- `assets/js/landing.js` : interactivité de la landing uniquement

## Coexistence billets ↔ nouveau design

Les 48 billets gardent leur layout `single` de Minimal Mistakes (sidebar author, Disqus, partage social). Ils héritent uniquement de la **typo** et des **couleurs** via `enveille.css`. Pas de migration de contenu, pas de touche au front matter existant.

La landing (`/`) utilise au contraire une nav custom `.ev-nav` qui remplace la masthead. `landing.css` et `landing.js` ne sont chargés QUE via le flag `is_landing: true` dans le front matter — ne pas charger globalement.

## Features JS de la landing (à ne pas casser)

Dans `assets/js/landing.js`, organisées en IIFE :
- **Reveal on scroll** : classes `.ev-reveal` / `.ev-reveal--stagger`
- **Compteurs animés** : éléments `.ev-stat__num[data-count]`
- **Progress bar** : `.ev-progress__bar` se remplit au scroll
- **Quick-nav dots** : `.ev-quick-nav__dot[data-target]` actifs selon la section visible
- **Easter eggs** : 5 clics sur le logo en 1s → body tilt 2° · Konami code (↑↑↓↓←→←→BA) → pluie Matrix 6s · message ASCII en console

## Conventions

- **CSS** : custom properties uniquement, pas de préprocesseur (remote_theme = partials Jekyll inaccessibles)
- **JS** : vanilla, pas de framework, pas de build step
- **Classes landing** : toutes préfixées `.ev-` pour ne pas casser Minimal Mistakes
- **Commits** : convention classique (`feat:`, `fix:`, `docs:`...)
- **Responsive** : mobile ≤ 720px, tablette ≤ 1000px, desktop au-delà

## Points d'attention

- Les URLs des billets existants **ne doivent jamais changer** (SEO, backlinks)
- Le site est déployé automatiquement sur push master — tester en local d'abord
- Les animations scroll-driven (`animation-timeline: scroll(...)`) ne sont pas supportées sur Firefox — dégradation gracieuse prévue
- Le mode sombre est automatique via `prefers-color-scheme` (pas de toggle manuel)

## Roadmap

Voir `NEXT.md`.

## Contexte non versionné (dans `.claude/`)

- `.claude/context/DESIGN.md` — design system global de la marque (cross-surfaces)
- `.claude/context/DESIGN-site.md` — design spécifique à ce site (routing, layouts, easter eggs)
- `.claude/context/CHANGELOG-session.md` — journal des choix de design et rationale
- `.claude/context/INSTALL.md` — archive du patch initial de refresh (rarement utile, garde la trace)
- `.claude/assets/` — logo SVG, tokens, palette, script de nettoyage Figma
- `.claude/previews/` — screenshots des itérations v1 à v4
