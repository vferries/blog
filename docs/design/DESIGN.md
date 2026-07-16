# En Veille — Design System

Système de design partagé entre les différentes surfaces de la marque En Veille (site principal, CV, Twitch, réseaux sociaux). Ce document est la **référence globale**. Chaque site peut définir ses propres variations dans son `DESIGN.md` local, qui référence celui-ci.

**Version** : 1.0.0 · **Dernière maj** : 2026-04

---

## 1. Logo

### Fichiers

| Variante | Fichier | Usage |
|---|---|---|
| Logo principal | `enveille-logo-final.svg` | Partout par défaut |
| _(à produire)_ | `enveille-logo-mono-white.svg` | Fond sombre, impression monochrome |
| _(à produire)_ | `enveille-logo-wordmark.svg` | En-têtes avec texte "En Veille" |
| _(à produire)_ | `enveille-favicon.svg` / `.ico` | Favicon optimisé petits formats |

### Règles d'usage

- **Espace de respect** : laisser au minimum la largeur d'un œil de la chouette tout autour du logo.
- **Taille minimale** : 32px (en dessous, utiliser le favicon simplifié).
- **Ne pas** : changer les couleurs arbitrairement, déformer les proportions, ajouter des effets (ombre, lueur, dégradé), faire tourner.
- **Export Figma** : toujours passer le SVG par `clean_figma_svg.py` avant commit (le script corrige les artefacts d'export Figma : micro-segments, zigzags, masques).

---

## 2. Palette

### Brand (couleurs du logo — non modifiables)

| Token | Valeur | Rôle |
|---|---|---|
| `--brand-navy` | `#001B3D` | Tête, sourcils, bec — couleur primaire |
| `--brand-blue` | `#007DA5` | Anneaux extérieurs — couleur secondaire |
| `--brand-cyan` | `#00F2FF` | Symboles power dans les yeux — accent |

Dans la palette générée, ces couleurs correspondent respectivement à `navy-950`, `blue-500` et `cyan-200`.

### Échelles

Chaque couleur dispose d'une échelle de 11 stops de 50 (le plus clair) à 950 (le plus sombre), générée en OKLCH pour une progression perceptuellement uniforme :

- `navy` · bleu profond, primaire
- `blue` · bleu moyen
- `cyan` · cyan brillant, accent
- `slate` · neutres légèrement bleutés (pour les textes, fonds, bordures)
- `green` · états de succès
- `amber` · avertissements
- `red` · erreurs / dangers

**Règle d'or** : dans un composant, on utilise les tokens **sémantiques** (`--color-bg`, `--color-text`...) par défaut. Les échelles brutes (`--navy-700`, `--slate-200`...) sont réservées aux cas où la sémantique ne couvre pas le besoin.

### Tokens sémantiques

Ces tokens s'adaptent automatiquement au mode clair/sombre via `prefers-color-scheme`.

| Token | Rôle |
|---|---|
| `--color-bg` | Fond de page |
| `--color-bg-subtle` | Fond alternatif (cards, sections) |
| `--color-bg-muted` | Fond accentué (callouts) |
| `--color-bg-inverse` | Fond inversé (pour contrastes forts) |
| `--color-text` | Texte principal |
| `--color-text-muted` | Texte secondaire |
| `--color-text-subtle` | Légendes, métadonnées |
| `--color-text-link` | Liens |
| `--color-border` | Bordures par défaut |
| `--color-border-focus` | Contour de focus (toujours cyan) |
| `--color-primary` | CTA primaires |
| `--color-accent` | Éléments d'accent |
| `--color-{success,warning,danger,info}-{bg,text,border}` | Pour les states (succès/warning/erreur/info) |
| `--color-code-{bg,text,border}` | Blocs de code |

### Contrastes (AA minimum)

- Texte sur `--color-bg` : `--color-text` (slate-900 sur blanc) → ratio ~17:1 ✓
- Texte sur `--brand-navy` : blanc → ratio ~15:1 ✓
- `--brand-cyan` sur `--brand-navy` : ratio ~10:1 ✓
- **Attention** : ne pas utiliser `--brand-cyan` comme texte sur fond blanc (ratio ~1.5:1, illisible).

---

## 3. Typographie

### Stack de fonts

| Token | Font | Usage |
|---|---|---|
| `--font-display` | Space Grotesk | H1–H3, éléments de marque, nombres clés |
| `--font-sans` | Inter | Body, UI, labels, formulaires — défaut |
| `--font-mono` | JetBrains Mono | Code, terminaux, valeurs techniques |

Chargement recommandé via `@fontsource` (npm) ou Google Fonts. Toujours précharger les weights 400 et 500.

```html
<!-- via fontsource -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk/500.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter/400.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/inter/500.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono/400.css">
```

### Échelle

Basée sur 16px = 1rem. Ratio ~1.2 (mineure tierce).

| Token | Taille | Usage typique |
|---|---|---|
| `--text-xs` | 12px | Métadonnées, tags |
| `--text-sm` | 14px | UI secondaire, légendes |
| `--text-base` | 16px | Body |
| `--text-lg` | 18px | Intro, accents |
| `--text-xl` | 20px | H6 |
| `--text-2xl` | 24px | H3 |
| `--text-3xl` | 30px | H2 |
| `--text-4xl` | 36px | H1 |
| `--text-5xl` | 48px | Titres hero |

### Weights

Seulement **400 regular** et **500 medium**. On évite 600/700 parce que les deux fonts choisies sont déjà très lisibles en medium — et ça évite les builds trop lourds.

### Line-height

- `--leading-tight` (1.2) pour les gros titres
- `--leading-snug` (1.4) pour H4–H6
- `--leading-normal` (1.6) pour body (défaut)
- `--leading-relaxed` (1.75) pour les lectures longues

---

## 4. Espacement, radius, ombres

### Espacement

Base 4px (`--space-1`). Pour tout `padding`, `margin`, `gap`, utiliser les tokens `--space-*`. On ne code **jamais** une valeur en px/rem brute.

### Radius

| Token | Valeur | Usage |
|---|---|---|
| `--radius-xs` | 2px | Badges, tags |
| `--radius-sm` | 4px | Boutons, inputs |
| `--radius-md` | 6px | Cards denses |
| `--radius-lg` | 10px | Cards standard (défaut) |
| `--radius-xl` | 16px | Modales, panneaux |
| `--radius-full` | 9999px | Avatars, pills |

### Ombres

Sobres, toutes calées sur le navy (teinte cohérente) plutôt que du noir pur.

- `--shadow-sm` : élément élevé au-dessus du fond (hover subtle)
- `--shadow-md` : cards, popovers
- `--shadow-lg` : modales, dropdowns importants
- `--shadow-focus` : anneau de focus cyan (accessibilité)

**Règle** : on préfère les bordures aux ombres pour séparer des blocs. L'ombre doit servir à indiquer l'élévation, pas la séparation.

---

## 5. Composants de base

Patterns canoniques à utiliser comme point de départ.

### Bouton primaire

```css
background: var(--color-primary);
color: var(--color-on-primary);
padding: var(--space-3) var(--space-5);
border-radius: var(--radius-md);
font-weight: var(--font-medium);
transition: background var(--duration-fast) var(--ease-out);
```

### Bouton accent (CTA fort, rare)

```css
background: var(--color-accent);    /* brand-cyan */
color: var(--color-on-accent);      /* navy */
```

### Card

```css
background: var(--color-bg-elevated);
border: 1px solid var(--color-border);
border-radius: var(--radius-lg);
padding: var(--space-6);
```

### Link

Défaut souligné (accessibilité). Sur du body, `--color-text-link` bleu. Sur fond sombre, bascule automatiquement en cyan via dark mode.

---

## 6. Intégration

### Dans un projet CSS vanilla

```html
<link rel="stylesheet" href="/tokens.css">
```

Puis utiliser les variables dans n'importe quel fichier CSS :

```css
.hero {
  padding: var(--space-12);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-xl);
}
```

### Dans un projet Tailwind

Créer un `tailwind.config.js` qui consomme `tokens.json` :

```js
const tokens = require('./tokens.json');
module.exports = {
  theme: {
    colors: {
      ...tokens.color.scales,
      brand: tokens.color.brand,
    },
    fontFamily: tokens.typography.font,
    spacing: tokens.space,
    borderRadius: tokens.radius,
  }
};
```

### Dans un projet React / CSS-in-JS

Importer `tokens.json` et construire un thème :

```ts
import tokens from './tokens.json';
const theme = {
  color: tokens.color.semantic.light,
  font: tokens.typography.font,
  // etc.
};
```

---

## 7. Mode sombre

Activé automatiquement via `prefers-color-scheme: dark`. Les tokens sémantiques sont remappés vers les bons stops des échelles. Les primitives ne changent pas.

Pour forcer manuellement un mode, encapsuler dans `[data-theme="dark"]` ou `[data-theme="light"]` — à ajouter si le besoin se présente.

**Checklist dark mode** :
- Fonds navy sombres (pas noir pur)
- Textes sur légère désaturation (`slate-50`, pas `#FFF`)
- Cyan devient la couleur primaire (brand-navy serait invisible)
- Ombres plus prononcées (noir à 50% vs navy à 6-10%)

---

## 8. Fichiers de ce système

| Fichier | Contenu |
|---|---|
| `DESIGN.md` | Ce document |
| `tokens.css` | Variables CSS à inclure dans chaque site |
| `tokens.json` | Même chose en JSON pour usages programmatiques |
| `palette.json` | Les échelles brutes (inputs de tokens.json) |
| `enveille-logo-final.svg` | Logo principal |
| `clean_figma_svg.py` | Outil de nettoyage des exports Figma |

---

## 9. Variations par site

Chaque site a son propre `DESIGN.md` qui :

1. **Référence** ce document comme source de vérité.
2. **Liste** uniquement les écarts locaux justifiés (ex : "Twitch force dark mode", "le CV utilise un h1 XL 64px au lieu de 48px").
3. **Documente** les composants propres au site.

Un écart doit toujours être **justifié** (contraintes techniques, contexte d'usage différent). Si une modification semble généralisable, elle remonte ici.

Sites à documenter :
- [ ] `enveille.info`
- [ ] `vferries.github.io/cv`
- [ ] `twitch.tv/EnVeilleCode`
- [ ] `x.com/VincentFERRIES`
