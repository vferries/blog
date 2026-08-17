# enveille.info — design local

Document local au site **enveille.info**. Il hérite du design system global (voir tokens dans `assets/css/enveille.css`).

**Stack** : Jekyll + Minimal Mistakes (remote_theme), hébergé sur GitHub Pages.

---

## Structure fonctionnelle

| URL | Rôle | Layout |
|---|---|---|
| `/` | Landing services | `landing` (custom) |
| `/blog/` | Archive paginée des billets | `home` (Minimal Mistakes) |
| `/blog/page:num/` | Pages de pagination | `home` |
| `/<slug>/` | Billets individuels | `single` (Minimal Mistakes) |
| `/about/` | À propos | `single` |
| `/tags/`, `/categories/` | Archives par tag/catégorie | `tags`, `categories` |
| `/realisations/` | Réalisations + atelier de démos | `landing` |
| `/demos/<slug>/` | Démos d'enseignes fictives (statique, hors sitemap, `noindex`) | — (copie verbatim) |
| `/feed.xml` | RSS | — |

**Important** : les URLs des billets existants (`permalink: /:categories/:title/`) sont **préservées**. La pagination passe de `/page:num/` à `/blog/page:num/`.

---

## Architecture des assets

```
/
├── _config.yml                    # config Jekyll (titre, logo, nav, pagination)
├── _layouts/landing.html          # layout custom pour la landing
├── _includes/
│   ├── head/custom.html           # Google Fonts + chargement assets (shadow MM)
│   ├── masthead.html              # shadow MM : ne fait qu'inclure ev-nav.html
│   ├── footer.html                # shadow MM : source unique de la ligne footer
│   ├── ev-nav.html                # barre du haut — source unique, toutes les pages
│   └── ev-footer.html             # wrapper <footer class="ev-footer"> de footer.html
├── _pages/
│   ├── blog.md                    # /blog/ : archive paginée
│   ├── about.md, 404.md, etc.     # pages existantes (héritées)
├── _posts/*.md                    # billets (inchangés)
├── assets/
│   ├── css/
│   │   ├── enveille.css           # tokens + thème global (toutes les pages)
│   │   └── landing.css            # styles scopés sur body.landing
│   └── js/
│       ├── nav.js                 # barre du haut (scroll, burger) — toutes les pages
│       └── landing.js             # interactivité de la landing uniquement
├── images/
│   ├── logo.svg                   # nouveau logo (remplace logo.png)
│   ├── logo.png                   # conservé pour compatibilité
│   └── ...                        # images existantes (billets, profile)
└── index.html                     # landing avec layout: landing
```

---

## Design tokens

Définis dans `assets/css/enveille.css` en CSS custom properties. S'adaptent au mode clair/sombre via `prefers-color-scheme`.

**Palette brand** : `--brand-navy: #001B3D`, `--brand-blue: #007DA5`, `--brand-cyan: #00F2FF`.

**Typographie** :
- Display : **Fraunces** (variable, italique expressive)
- Body : **Inter**
- Code : **JetBrains Mono**
- Manuscrit : **Caveat** (utilisé sur la landing pour les accents chaleureux)

---

## Barre du haut

`.ev-nav` est la barre de toutes les pages, pas seulement de la landing : elle est rendue par `_includes/ev-nav.html`, que `_includes/masthead.html` (shadow du partial du thème) sert aux pages Minimal Mistakes, et que `index.html` et `_pages/realisations.html` incluent directement — ces deux pages n'étant pas rendues par le thème, le shadow ne les atteint pas. Ses styles vivent dans `enveille.css`, chargé partout.

---

## Spécificités de la landing

Ce qui reste propre à la landing, chargé par `_layouts/landing.html` pour les pages en `layout: landing` — la landing et `/realisations/` :
- `landing.css` (en plus de `enveille.css`) — ses règles présupposent la structure de la landing (grille de sections, hero, quick-nav) ; le charger ailleurs casserait la mise en page des pages qui ne la partagent pas
- `landing.js` pour les interactions (curseur, reveal, compteurs, easter eggs, Matrix rain sur Konami)

Toutes les classes de la landing sont préfixées `.ev-` pour ne pas entrer en conflit avec Minimal Mistakes.

Sur les pages billets, seuls les tokens et polices s'appliquent (via `enveille.css`), le layout Minimal Mistakes est conservé.

---

## Easter eggs

- **5 clics sur le logo** en 1 seconde → le body tilt à 2° puis revient
- **Konami code** (↑ ↑ ↓ ↓ ← → ← → B A) → pluie Matrix pendant 6 secondes
- **Console.log** ASCII dans la DevTools avec un message pour les curieux

---

## Cohérence avec les billets existants

Les 48 posts (2011-2022) gardent :
- leurs URLs actuelles
- leur layout `single` de Minimal Mistakes
- leur sidebar author, leurs commentaires Disqus, leur partage social

Ils héritent seulement de la **nouvelle typographie** et des **nouvelles couleurs** via `enveille.css`. Aucune migration de contenu.

---

## Points à travailler plus tard

- [ ] Remplacer la photo placeholder par une vraie photo de Vincent
- [ ] Décliner le logo en favicon (SVG + .ico multi-tailles) + version monochrome + wordmark
- [ ] Réécrire `/about/` pour le ton cohérent avec la landing
- [ ] Considérer l'avenir de `/mentoring/` (billet de 2015 référencé nulle part)
- [ ] Intégrer la description du statut "disponible" dynamiquement (via un data file)
- [ ] Internationaliser les meta OpenGraph
