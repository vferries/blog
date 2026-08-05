# Barre du haut unifiée — design

**Date** : 2026-08-05 · **Statut** : validé par Vincent (niveau « même composant partout »)

## Objectif

Une seule barre du haut sur les 60 pages. Aujourd'hui `/` et `/realisations/`
portent `.ev-nav` (logo chouette, 6 liens, pastille « Disponible », burger
power-on CRT) tandis que les 58 pages Minimal Mistakes portent `.masthead` :
on change de barre en passant de `/` à `/blog/`.

`_includes/ev-nav.html` devient la **source unique**, incluse aussi bien par la
landing que par les pages du thème.

> Une première version de ce document cadrait un niveau « restyler la masthead
> en CSS ». Vincent a tranché pour le portage complet après avoir vu que les
> deux barres divergeaient aussi en **mécanisme responsive**, pas seulement en
> style. Le restylage, les tokens partagés et le correctif du logo `.site-logo`
> décrits alors sont donc caducs : on ne rapproche plus deux barres, on en
> supprime une.

## La divergence qui a motivé le choix

Mesuré sous Chrome sur `/ARC-Welder/` et `/` :

| Largeur | `.masthead` (greedy-nav) | `.ev-nav` |
|---|---|---|
| 1280 · 900 | 4 liens en ligne | 6 liens en ligne |
| 720 | 4 liens en ligne | burger + panneau |
| 500 | 4 liens en ligne | burger |
| 375 | 2 liens + 2 repliés | burger |

La landing bascule sur un **breakpoint fixe** à 720px. `greedy-nav` est un
algorithme JS **piloté par la place disponible** : il déplace un à un les liens
qui débordent vers un dropdown, ne replie rien avant ~400px, et jamais
totalement. Aucun restylage CSS ne réconcilie deux stratégies aussi
différentes.

## Ce que le portage ne coûte pas : la recherche

Contrairement à l'estimation initiale, **la recherche survit sans une ligne de
JS**. Vérifié dans le build :

- Le panneau `.search-content` est rendu par `_layouts/default.html` du thème
  (`{% if site.search == true %}`), **pas** par la masthead. Dans le DOM d'un
  billet il est à l'offset 20288 contre 4810 pour la barre.
- Le script du thème s'accroche par classe, pas par position :
  `$(".search__toggle").on("click", … $(".search-content").toggleClass(…))`.

Il suffit donc que `ev-nav.html` contienne un bouton `class="search__toggle"`
pour que le comportement soit conservé tel quel.

## Markup

**Nouveau `_includes/masthead.html`** — shadow du partial du thème, appelé par
`default.html` via `include_cached`. Il délègue à la nav partagée :

```liquid
{% include ev-nav.html root="/" %}
```

`include_cached` impose une contrainte : le partial est rendu **une seule fois**
puis réutilisé. Aucune variable de page ne doit y entrer — c'est déjà la règle
posée pour `footer.html`. Le paramètre `current`, qui pose `aria-current` sur
`/realisations/`, ne peut donc pas transiter par ce chemin : il reste réservé à
l'appel direct depuis `_pages/realisations.html`, qui n'est pas mis en cache.

**`_includes/ev-nav.html`** gagne deux choses :

1. `id="site-nav"` sur le `<nav>`, en plus de `ev-top`. Le partial
   `skip-links.html` du thème pointe sur `#site-nav` : sans cet id, le lien
   d'évitement clavier ne mène nulle part sur les 58 pages. `ev-top` est
   conservé, la landing s'en sert comme cible de retour. La landing a son propre
   lien d'évitement (`.ev-skip-link` vers `#main`), indépendant de celui du
   thème — il n'est pas concerné.
2. Un bouton de recherche, rendu conditionnellement :

   ```liquid
   {% if site.search == true %}
     <button class="search__toggle ev-nav__search" type="button">…</button>
   {% endif %}
   ```

   La classe `search__toggle` est ce à quoi le thème s'accroche ; `ev-nav__search`
   porte l'habillage En Veille.

   **La condition est `include.search`, pas `site.search`.** `_layouts/landing.html`
   est autonome : il ne rend aucun panneau `.search-content`. Un bouton de
   recherche y serait inerte. Seul le shadow de la masthead passe
   `search=true` ; les appels depuis `index.html` et `_pages/realisations.html`
   ne le passent pas. C'est le seul écart assumé entre les deux barres, et il
   est fonctionnel, pas cosmétique : proposer une recherche qui n'ouvre rien
   serait pire que ne pas l'afficher.

## Styles

Les règles `.ev-nav*` déménagent de `landing.css` vers **`enveille.css`**
(chargé partout). Elles sont **déplacées**, pas copiées : deux jeux de règles
dans deux fichiers rejoueraient exactement la divergence qu'on corrige.

Périmètre du déplacement : `.ev-nav`, `.ev-nav__inner`, `.ev-nav__brand`,
`.ev-nav__links`, `.ev-nav__status`, `.ev-status-dot`, `.ev-nav__burger`,
`.ev-nav__power`, les `@keyframes ev-nav-border`, le bloc responsive ≤720px et
la règle `[id] { scroll-margin-top: 84px }` — cette dernière est indispensable
dès lors qu'une barre collante existe sur les billets, où `scroll-margin-top`
vaut `0px` aujourd'hui.

Les règles devenues mortes disparaissent d'`enveille.css` : le bloc
« Nav top (masthead) » (`.masthead`, `.site-title`, `.site-subtitle`,
`.greedy-nav`). Le correctif `.site-logo` n'a plus lieu d'être, ce markup
n'étant plus rendu.

Le bloc `prefers-reduced-transparency` existant couvre déjà `.ev-nav` et
`.ev-nav__links` : il n'a pas à bouger, il s'applique désormais partout.

## JavaScript

Le burger vit dans une IIFE de `landing.js`, qui n'est chargé que par
`_layouts/landing.html`. Il lui faut un véhicule sur les pages du thème.

**Nouveau `assets/js/nav.js`** : l'IIFE du burger extraite telle quelle
(ouverture, effet power-on, fermeture sur Escape, sur clic de lien et au
resize).

Il doit être déclaré à **deux endroits**, parce que `_layouts/landing.html` est
autonome : il n'inclut pas `head/custom.html` et redéclare fontes et
feuilles de style en propre. Donc `head/custom.html` en `defer` pour les 58
pages du thème, **et** une balise `<script defer>` dans `landing.html` à côté
de `landing.js`. Ne le poser que dans `head/custom.html` laisserait la landing
sans burger — la régression exacte qu'on cherche à éviter ailleurs.

L'IIFE est **retirée** de `landing.js` dans le même mouvement. La laisser aux
deux endroits ferait doubler les écouteurs sur la landing : chaque clic sur le
burger basculerait l'état deux fois, donc pas du tout.

`landing.js` garde tout le reste — reveal, compteurs, progress bar, quick-nav,
easter eggs, scrub du hero, vidéos.

## greedy-nav

Le script `jquery.greedy-navigation.js` du thème reste chargé par `scripts.html`
et ne trouvera plus son markup (`#site-nav.greedy-nav`, `.visible-links`,
`.hidden-links`). Il doit devenir un no-op silencieux. **À vérifier
explicitement** : une erreur JS non attrapée sur les 58 pages du thème serait
une régression, et le fait qu'aucun effet visuel ne soit attendu ne garantit pas
qu'il ne jette pas.

## `_data/navigation.yml`

Le fichier ne pilote que `.visible-links` de la masthead. Une fois celle-ci
remplacée, plus rien ne le lit — `ev-nav.html` porte ses liens en dur.

**Décision** : le fichier est supprimé plutôt que laissé inerte. Un fichier de
données qu'on peut éditer sans effet est un piège, et c'est exactement le genre
d'écart qui coûte une session de debug six mois plus tard.

Conséquence assumée : les liens de la barre se modifient désormais dans
`_includes/ev-nav.html`. Un seul endroit, ce qui est le but.

## Conséquences assumées

- **La pastille « Disponible » apparaît sur les billets et les archives.** C'est
  la contrepartie directe de « même composant partout ». Si elle détonne sur un
  billet de 2013, la retirer demandera un paramètre d'include — à trancher au vu
  du rendu, pas avant.
- **Les liens passent de 4 à 6** sur les pages du thème, dont quatre ancres vers
  la landing (`/#services`, `/#realisations`, `/#about`, `/#contact`). `ev-nav`
  gère déjà ce préfixe via `include.root`.
- **Un 3ᵉ shadow de partial** couplé à l'upstream, après `footer.html` et
  `head/custom.html`. À rediffer à chaque bump de `remote_theme`, au même titre
  que les deux autres — la note existe déjà dans `NEXT.md`.

## Hors périmètre

- Le bug Disqus croisé en route : `embed.js` jette
  `Cannot read properties of null (reading 'appendChild')` quand l'ouverture de
  la recherche masque `.initial-content` sur un billet. Antérieur à ce chantier.
- L'alignement du CV, dont la brand strip vit dans un autre dépôt.

## Vérification

- Captures avant/après sur landing, billet, `/blog/`, `/about/` et une archive,
  en 1280, 720 et 375px.
- **La recherche répond toujours** : ouverture, saisie au clavier, résultats
  rendus. Référence avant travaux : 10 résultats pour « devoxx » sur `/blog/`.
  Attention, `page.fill()` ne déclenche pas l'écouteur — taper au clavier.
- Le burger ouvre et ferme sur les pages du thème, avec Escape, clic de lien et
  resize.
- **Aucun double écouteur sur la landing** : un clic sur le burger doit ouvrir,
  pas basculer deux fois. Et le burger de la landing doit toujours répondre —
  `nav.js` y arrive par une balise propre, pas par `head/custom.html`.
- **Pas de bouton de recherche sur la landing** : il n'y a pas de panneau à
  ouvrir dans ce layout.
- Le lien d'évitement « Aller à la navigation » atteint bien la barre.
- Aucune erreur console sur les pages du thème, greedy-nav comprise.
- Une ancre interne de billet amène sa cible sous la barre, pas dessous.
- La sidebar auteur des billets est elle aussi `sticky` : vérifier qu'elle ne
  glisse pas sous la barre.
- Contrôle `prefers-reduced-transparency` via CDP sur une page du thème.
- Rendu sur Firefox : `animation-timeline` n'y est pas supporté (mesuré à
  `false` sur Firefox 153 contre `true` sur Chrome et WebKit 26.5), donc la
  bordure basse reste transparente — dégradation déjà en vigueur sur la landing,
  désormais étendue aux pages du thème.
