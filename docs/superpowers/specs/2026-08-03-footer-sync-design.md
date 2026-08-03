# Footer unifié En Veille — design

**Date** : 2026-08-03 · **Statut** : validé par Vincent (option « footer En Veille partout »)

## Objectif

Synchroniser le footer des pages Minimal Mistakes (`/blog/`, billets, `/about/`)
avec celui de la landing. Aujourd'hui les pages MM affichent le footer du thème
(« Follow: » + icônes Twitter/GitHub/Twitch + Feed + « Powered by Jekyll &
Minimal Mistakes »), en décalage avec l'identité En Veille. Item tracké dans
`NEXT.md` (« Footers désynchronisés », pré-validé section « Prochaines sessions
Claude »).

## Décision

Le footer En Veille (une ligne : `© AAAA En Veille — RSS — Fait à Toulouse
with :heart: and chocolatines`) devient le footer de **toutes** les pages.
Pas de rangée de liens sociaux dans le footer : ils restent portés par la
sidebar auteur des billets (`author.links`) et la section CTA de la landing.

## Markup — source unique

- **Nouveau** `_includes/footer.html` : shadowe le partial du remote theme
  (les layouts MM l'incluent déjà dans `<div class="page__footer"><footer>…`).
  Contenu :

  ```html
  <p class="ev-footer__line">© {{ site.time | date: "%Y" }} En Veille — <a href="{{ '/feed.xml' | relative_url }}">RSS</a> — Fait à Toulouse with :heart: and chocolatines</p>
  ```

- `_includes/ev-footer.html` devient un wrapper :
  `<footer class="ev-footer">{% include footer.html %}</footer>`.
  Ses deux appelants (`index.html`, `_pages/realisations.html`) ne changent pas.

## Styles

- La typographie de la ligne (mono `--font-mono`, `0.8125rem`, centré,
  `--ev-text-subtle`, `line-height: 1.8`, liens `--ev-text-muted` →
  `--ev-blue` au hover) déménage de `.ev-footer` (`landing.css`) vers
  `.ev-footer__line` dans **`enveille.css`** (chargé partout, dark mode auto
  via les tokens).
- `.ev-footer` dans `landing.css` ne conserve que le padding
  (`48px 32px 64px`).
- `.page__footer` est déjà thémé En Veille dans `enveille.css` (fond
  `--ev-bg-subtle`, bordure haute) : pas de changement attendu ; ajustement
  léger de padding seulement si le rendu le demande.

## Config

- Suppression du bloc `footer.links` dans `_config.yml` : seul le
  `footer.html` du thème le consommait, il devient mort avec l'override.

## Vérification

1. `bundle exec jekyll build` sans erreur.
2. HTML généré : la ligne unique présente sur landing, `/blog/`, un billet,
   `/about/`, `/realisations/` ; plus aucune trace de `page__footer-follow`
   ni « Powered by ».
3. `:heart:` rendu en `<img class="emoji">` par jemoji aussi sur les pages MM.
4. Capture Playwright light/dark du footer `/blog/` + landing.

## Livraison

Un commit unique (concern « footer sync »), message conventionnel en français,
directement sur `main` (repo solo). L'item de `NEXT.md` est coché dans un
commit `docs:` séparé, comme le veut l'habitude du repo.
