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
| `/feed.xml` | RSS | — |

**Important** : les URLs des billets existants (`permalink: /:categories/:title/`) sont **préservées**. La pagination passe de `/page:num/` à `/blog/page:num/`.

---

## Architecture des assets

```
/
├── _config.yml                    # config Jekyll (titre, logo, nav, pagination)
├── _data/navigation.yml           # menu principal
├── _layouts/landing.html          # layout custom pour la landing
├── _includes/head/custom.html     # Google Fonts + chargement assets
├── _pages/
│   ├── blog.md                    # /blog/ : archive paginée
│   ├── about.md, 404.md, etc.     # pages existantes (héritées)
├── _posts/*.md                    # billets (inchangés)
├── assets/
│   ├── css/
│   │   ├── enveille.css           # tokens + thème global (toutes les pages)
│   │   └── landing.css            # styles scopés sur body.landing
│   └── js/landing.js              # interactivité de la landing uniquement
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

## Spécificités de la landing

La landing (`/`) utilise une nav custom `.ev-nav` qui remplace la masthead de Minimal Mistakes. Elle charge, via `_layouts/landing.html` — le layout `landing`, aussi utilisé par `/realisations/` :
- `landing.css` (en plus de `enveille.css`)
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
