# Archive `/blog/` en grille illustrée — design

**Date** : 2026-08-04 · **Statut** : validé par Vincent (grille 3 colonnes sans sidebar, vignettes mixtes photo + carte teaser)

## Objectif

Passer la liste `/blog/` d'une énumération purement textuelle à une grille
illustrée. Item tracké dans `NEXT.md` : « 28/46 billets sans `header:` image →
liste `/blog/` visuellement déséquilibrée ».

Ce qui débloque le chantier aujourd'hui : les 46 OG cards générées le même jour
donnent pour la première fois une image de marque cohérente pour **chaque**
billet. Le déséquilibre 18/28 n'est plus une fatalité.

Constat de départ : la liste actuelle n'affiche **aucune** image, même pour les
18 billets qui ont un `header.image`. Minimal Mistakes ne rend
`.archive__item-teaser` qu'en mode `grid` (`_includes/archive-single.html`),
jamais en mode `list`. Ces 18 bandeaux ne servent donc à rien sur `/blog/`.

## Décisions

Trois arbitrages, tranchés par Vincent :

1. **Vignettes mixtes.** Le `header.image` existant sert de vignette quand il
   est exploitable ; les billets sans bandeau reçoivent une carte générée. Une
   photo de conférence dit ce qu'aucune carte ne dira ; l'hétérogénéité qui en
   résulte se maîtrise au CSS (ratio et traitement de bord communs).
2. **3 colonnes, sidebar retirée, pleine largeur.** Une fois qu'on pose des
   images, elles ont besoin de place pour fonctionner. L'identité auteur reste
   portée par la masthead, le footer et `/about/`.
3. **Cartes teaser sans titre.** Les OG cards portent le titre en dur, or la
   grille MM le réaffiche en `<h2>` sous l'image. Une variante sans titre, où
   les tags prennent sa place, supprime le doublon et ajoute l'information qui
   manque le plus à une archive de 46 billets étalés sur 15 ans.

## Règle d'attribution des vignettes

Une règle unique, appliquée par le générateur :

Le ratio s'entend **largeur / hauteur** de l'image source.

| Cas | `header.teaser` | Nb |
|---|---|---|
| `header.image` de ratio ≤ 5:1 | ce même bandeau | 16 |
| `header.image` de ratio > 5:1 | `/images/og/teaser-<slug>.png` | 2 |
| pas de `header.image` | `/images/og/teaser-<slug>.png` | 28 |

Le seuil de 5:1 vit dans le code, **pas** sous forme de liste de slugs en dur :
un futur bandeau trop étroit sera capté sans intervention. Les deux cas
pathologiques actuels sont `geoloc.png` (1849×39, soit 47:1) et
`twitch-logo.svg` (455×50, soit 9:1) — illisibles dans une cellule quel que
soit le ratio retenu.

## Génération

### `tools/og-card/template.html`

Gagne un mode `variant=teaser` et un paramètre `tags`. En mode teaser :

- `.title` masqué
- les tags rendus à sa place en JetBrains Mono (`kubernetes · OPS`), en écho
  aux meta de la landing
- eyebrow, date, chouette et domaine inchangés

**Règle des tags** : les **3 premiers** du front matter, joints par ` · `. Le
plafond n'est pas cosmétique — un billet porte jusqu'à 6 tags et les
assemblages complets atteignent 50 caractères, ce qui déborderait la zone
laissée libre par le titre masqué.

Le template reste la source de vérité unique pour les deux types de carte : pas
de second fichier à maintenir en parallèle.

### `tools/og-card/generate-posts.py`

Étendu pour produire les teasers et câbler `header.teaser` selon la règle
ci-dessus. Contraintes conservées de la version actuelle :

- **idempotent** — un lancement sans option ne traite que ce qui manque
- **fidèle aux octets** — un billet en CRLF le reste (cf. le bug corrigé en
  `1aa7ea1`)
- `--force` et `--dry-run` couvrent aussi les teasers

### `_config.yml`

`teaser: /images/og-card.png` en filet de sécurité : si un billet est publié
avant un passage du générateur, sa cellule garde une image plutôt que de casser
l'alignement de la rangée.

## Rendu

### `blog/index.html`

```yaml
entries_layout: grid    # était list
author_profile: false   # était true
```

### `assets/css/enveille.css`

Minimal Mistakes rend sa grille en **floats** (largeurs en pourcentage sur
`.grid__item`, règles `:nth-child` pour les `clear`) et ne style pas du tout
`.entries-grid`. On neutralise les floats et on pose une vraie CSS grid :

```css
.entries-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 40px 32px;
}
.entries-grid .grid__item { float: none; width: auto; margin: 0; }
.entries-grid .archive__item-teaser { aspect-ratio: 1200 / 630; }
.entries-grid .archive__item-teaser img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
```

`auto-fill` donne 3 colonnes en desktop, 2 en tablette et 1 en mobile sans
media query. La valeur `340px` est à **caler sur la largeur de contenu réelle
mesurée** une fois la sidebar retirée, pas au jugé.

Le fichier cible est `enveille.css` et non `landing.css` : ce dernier n'est
chargé que sous le flag `is_landing`.

### Conséquence assumée

Les 16 bandeaux tournent autour de 3,3:1 ; dans une cellule en 1,9:1,
`object-fit: cover` les recadre latéralement en conservant environ 57 % de la
largeur d'origine, centrée. À vérifier billet par billet qu'aucun ne coupe un
mot lisible.

## Hors périmètre

- **`paginate: 10` n'est pas touché.** Passer à 12 donnerait des rangées
  pleines mais supprimerait `/blog/page5/`, une URL qui répond aujourd'hui. Les
  rangées de 3, 3, 3, 1 sont le prix honnête de la stabilité des URLs.
- **Les billets eux-mêmes.** `header.image` continue de s'afficher en tête
  d'article ; on ne fait qu'ajouter `header.teaser` à côté.
- **La locale « Recent Posts » en anglais**, constatée pendant l'exploration :
  bug réel mais indépendant, part dans `NEXT.md`.

## Vérification

1. Build Jekyll sans erreur.
2. Les 46 `header.teaser` pointent sur un fichier qui existe dans `_site/`.
3. Captures `/blog/` en 1280, 900 et 375 px, en light **et** en dark.
4. `/blog/page2/` à `/blog/page5/` répondent toujours.
5. Aucun débordement horizontal à 375 px.
6. Les 16 bandeaux recadrés ne coupent aucun mot lisible.
7. Une page de billet prise au hasard affiche toujours son `header.image`.

## Fichiers touchés

| Fichier | Nature |
|---|---|
| `tools/og-card/template.html` | mode `variant=teaser` + param `tags` |
| `tools/og-card/generate-posts.py` | génération teasers + câblage `header.teaser` |
| `blog/index.html` | front matter (2 lignes) |
| `_config.yml` | `teaser:` de repli (1 ligne) |
| `assets/css/enveille.css` | grille + vignettes |
| `_posts/*.md` (46) | ajout de `header.teaser` |
| `images/og/teaser-*.png` (30) | nouvelles vignettes |
| `NEXT.md`, `AGENTS.md` | documentation |
