# NEXT — roadmap En Veille

État au 13 août 2026, après la revue quintuple (a11y · perf · SEO · code · UX). Priorités de haut en bas.

---

## 🔬 Revue du 2026-08-13 — à dépiler

5 agents en parallèle sur les sources, le build `_site/` et la prod. Les arbitrages déjà rendus plus bas dans ce fichier n'ont pas été re-signalés. Chiffres mesurés (ffprobe, curl, calculs WCAG), pas estimés.

### 🚑 Immédiat (bugs réels, effort S)

- [x] **« Quinze ans dans le développement » en dur** dans `index.html:230` → corrigé le 2026-08-13, passe par `{{ annees_dev }}` — faux (19 ans), et c'est le mécanisme de dérive que l'arbitrage du 2026-08-11 (`NEXT.md`, section anciennetés) était censé éradiquer. Passer par le calcul `site.time | minus: 2007` déjà en place à `index.html:100`
- [x] **Focus ring cyan illisible en light mode** sur `/` et `/realisations/` : `:focus-visible { outline: 2px solid var(--ev-cyan) }` (`enveille.css:431-434`) → **1,30:1** sur `--ev-bg` crème (SC 1.4.11 exige 3:1). Les pages MM sont sauvées par la spécificité supérieure du `main.css` du thème ; les deux pages commerciales ne chargent que `enveille.css` + `landing.css`. Bloquant AA → corrigé le 2026-08-13 : token `--ev-focus` (light `--blue-500`, dark cyan, hero et CTA se forcent le cyan). Vérifié Playwright dans les deux schemes
- [x] **`--ev-blue` (#007DA5) sous le seuil AA en light mode** : 4,39:1 sur `--ev-bg`, 4,05:1 sur `--ev-bg-subtle` (seuil 4,5). Colore tous les liens de corps de billet (`enveille.css:341`) + ~8 usages landing en texte normal. Remplaçant déjà dans la palette : `--blue-500` #006891 (5,80/5,35:1). Dark sain (10,49:1), pas touché. Bloquant AA → corrigé le 2026-08-13, vérifié au rendu (lien de billet = rgb(0,104,145))
- [x] **Vidéo hero téléchargée intégralement au chargement** : `landing.js:147-150` pose `video.src` + `load()` sans condition avec `preload="auto"` (`index.html:37`) → 3,05 Mo (desktop) en concurrence avec le poster LCP et les fontes → corrigé le 2026-08-13 : `preload="metadata"` + relèvement de l'indice à `auto` après `load`. Mesuré A/B au CDP : 3 043 Ko sur le fil avant, ~0,5 s de buffer après, le reste streamé à la demande pendant le scrub (vérifié fonctionnel, yeux allumés à 60 vh). Chrome n'étend pas le buffer sur le seul changement d'indice — assumé : pour un scrolleur immédiat ce n'est pas pire qu'avant (les 3 Mo concouraient avec tout le reste), et le ré-encodage `crf 31` (−39 %) réduira encore le segment scrubé

### ♿ Accessibilité (après le lot immédiat)

- [x] **Quick-nav : 6 liens vides** sans nom accessible (`index.html:21-28`, libellé en `::before content: attr(data-label)` que Firefox/Safari n'exposent pas), focusables alors que le conteneur est à `opacity: 0` avant le hero, et `<aside>` au lieu de `<nav>`. Bloquant AA · S → corrigé le 2026-08-13 : `<nav>` + `aria-label` par lien + `visibility: hidden` synchronisée sur le fondu. Vérifié Playwright : hors tabulation en haut de page, visible après scroll
- [x] **Surligneur cyan sous texte crème dans le H1** : `.ev-hl::before` (`landing.css:209-217`) peint `--ev-cyan` sous un texte forcé `#F1EBD9` → 1,16:1, le bas des glyphes de « savoir-faire » disparaît → arbitré le 2026-08-13 sur planche comparative : **variante B, surligneur plein** (bande sur tout le mot, encre navy par-dessus, ≈13:1). L'encre passe navy en même temps que la bande se peint (`ev-hl-ink` calée sur `ev-hl-draw`, transition calée sur `is-powered` côté scrub) — avant la bande, navy sur ciel navy serait invisible. Vérifié Playwright sur les deux chemins, aller et retour
- [x] **Reset reduced-motion vs animations scroll-driven** : hypothèse **non reproductible**, vérifiée au rendu le 2026-08-13 — Chrome ignore l'override `animation-duration` pour les animations à timeline de scroll (progress bar : 0px en haut, ~711px à mi-page, identique dans les deux modes). Rien à corriger. La 2ᵉ animation concernée (`ev-nav-border`) a été **supprimée** pour un autre motif (voir dette code : bordure de nav)
- [x] **5 animations JS hors `prefers-reduced-motion`** : compteurs (`landing.js:71-100`, remettent les stats à 0 puis animent — annule le fallback no-JS pour ces utilisateurs), titre magnétique, tilt cartes, curseur custom, pluie Matrix. Seuls hero owl et vidéos réalisations testaient la query → gardes ajoutées le 2026-08-13. Compteurs : valeurs finales du HTML conservées. Curseur : sortie avant `has-cursor`, donc le `cursor: none` du CSS reste inerte et les réglages OS du pointeur survivent (règle l'aspect reduced-motion de l'arbitrage `cursor: none` — l'arbitrage design lui-même reste ouvert). Konami : la récompense reste (fond + message, même durée), seule la pluie saute. Vérifié Playwright dans les deux modes
- [x] **Panneau burger : liens avant le bouton dans le DOM** (`ev-nav.html:28` vs `:62`) → au clavier il faut Shift+Tab pour atteindre le menu qu'on vient d'ouvrir ; et Escape/clic extérieur ferment sans rendre le focus au bouton (`nav.js:53-57`). 2.4.3 · M → corrigé le 2026-08-13 **sans réordonner le DOM** (ça aurait cassé l'ordre de tabulation desktop) : pattern menu-button — focus sur le premier lien à l'ouverture, retour au bouton sur Escape seulement (pas sur clic extérieur, l'utilisateur a choisi une autre cible). Vérifié Playwright au clavier
- [x] **Bouton recherche sans état ARIA ni fermeture Escape** : `ev-nav.html:54` sans `aria-expanded`/`aria-controls`, le script MM ne pose rien. Le bouton est à nous (shadow masthead), corrigeable côté projet. S → corrigé le 2026-08-13 : `aria-expanded` synchronisé après le handler jQuery du thème, `aria-controls` posé (id donné au panneau par JS), Escape repasse par le toggle MM (rétablit `.initial-content`) et rend le focus au bouton. Vérifié Playwright
- [x] **`html { font-size: 16px }`** (`enveille.css:96`) neutralise le réglage de taille de police du navigateur — tout le site est en `rem`. Passer à `100%`. S → fait le 2026-08-13. Vérifié CDP : 16px au réglage par défaut (rendu inchangé), 20px quand le navigateur le demande. La règle continue d'écraser les paliers 18/20px de MM, son rôle historique
- [ ] **Mouvement automatique > 5 s sans pause** (SC 2.2.2, niveau A) : vidéos réalisations en `loop` sans contrôle, marquee 40s, aurore CTA 12s, pastille pulse 2,4s partout. Mécanisme pause/stop à concevoir → voir arbitrages
- [x] **Hiérarchie headings `/blog/`** : h1 → h3 « Posts récents » → h2 items (upstream MM) → 9ᵉ shadow (`_layouts/home.html`, delta d'une ligne) le 2026-08-13 : le sous-titre passe en h2. Vérifié au build

### ⚡ Perf (landing 5,24 Mo dont 89 % vidéo · billet ~1 Mo hors Disqus · tout servi en `max-age=600`)

- [x] **Ré-encoder `hero-owl.mp4`** : 84 % du poids (2,55 Mo) sur les 1,4 s scrubées, sous un scrim à 42-78 %. Mesuré : `crf 31 -g 3` → 1,90 Mo (−39 %), granularité de seek intacte. La 540 est déjà à son plancher. S → fait le 2026-08-13 **depuis la source propre** (toujours dans ~/Téléchargements) et non en transcodage : 3,12 → 2,62 Mo (−16 % réel — le −39 % projeté mesurait un transcodage du fichier déjà compressé, qui compose les pertes). crf 33 sondé (2,20 Mo) : non retenu, la vidéo n'est plus sur le chemin critique depuis le preload différé, la qualité de l'asset signature prime. 36 keyframes de scrub identiques, comparaison image par image sans écart visible, scrub vérifié en page. Mobile et poster régénérés bit-identiques
- [x] **Disqus injecté au parse de chaque billet** : ~56 Ko gzip + cascade (20-40 requêtes, traceurs) avant toute interaction, sur des billets majoritairement sans commentaire → différé le 2026-08-13 via IntersectionObserver sur `#disqus_thread` (marge 600px), dans un **4ᵉ shadow de partial** (`comments-providers/disqus.html`, delta minimal sur l'upstream, à rediffer au bump). Vérifié en build production : 0 requête disqus.com au chargement, 1 après scroll. Piège découvert : MM ne rend la section commentaires qu'en `jekyll.environment == "production"` — consigné dans AGENTS.md
- [ ] **12 JPEG q90-100 oubliés par la passe du 2026-08-04** (mtime 23 avril) : 1 334 Ko → 632 Ko en q82, mêmes noms/URLs. Les pires : `rabot.jpg` q99, `startup-weekend.jpg` q99, `open_space.jpg` q98, `staples.jpg` q98. S
- [x] **FontAwesome sur chaque page MM** : 277 Ko (3 woff2 + CSS) pour ~15 icônes, URL `@latest` (cache 7 j) → remplacé le 2026-08-13 par des masques CSS (`enveille.css`, bloc « Icônes ») générés depuis les SVG officiels FA Free 6.5.2 (13 glyphes réellement rendus, inventoriés sur le build). `currentColor` : suivent light/dark et le fix contraste des icônes sociales. Shadow de `head.html` (5ᵉ) : delta = les 3 lignes CDN retirées. Vérifié au rendu deux thèmes, zéro requête jsDelivr
- [x] **`main.min.js` : 124 Ko de jQuery + plugins quasi morts** — SmoothScroll neutralisé par `nav.js:25`, GreedyNav sans cible, MagnificPopup/Gumshoe/FitVids sans consommateur. Seul le toggle recherche vivait → retiré le 2026-08-13 via `footer_scripts: []` (config seule, pas de shadow — la liste vide remplace le script du thème). Le toggle vit dans nav.js, FitVids remplacé par une règle `aspect-ratio` (les vieux billets embarquent des YouTube — vérifié responsive à 500px). Zéro jQuery sur tout le site
- [x] **Fraunces demandé en `opsz 9..144`** (148,8 Ko les 2 styles) quand le CSS n'utilise que 48 et 144 → **arbitré garder la plage** le 2026-08-13 : le dessin de la marque en nav (opsz 48, dont les wordmarks SVG sont dérivés) prime sur 73 Ko payés une fois par an de cache fonts.gstatic. Les `'SOFT'` inertes sont nettoyés (commit `960a685`)
- [x] **Lunr chargé en dur sur toutes les pages MM** (57 Ko + parse, 3 balises sans `defer`) alors que le panneau ne s'ouvre qu'au clic → paresseux le 2026-08-13 : shadow (6ᵉ) de `search/lunr-search-scripts.html` qui n'émet plus rien, nav.js charge lunr.min + lunr-store + `ev-search.js` à la première ouverture. `ev-search.js` = port vanilla fidèle du lunr-en.js upstream (qui dépendait de jQuery, parti avec main.min.js) — même sémantique de requête, même markup, libellé FR. Vérifié bout en bout : « devoxx » → 10 résultats, Escape, zéro erreur. Le stemmer reste anglais comme avant — statu quo assumé, changer l'indexation est un autre chantier
- [x] **Zéro `loading="lazy"`/`width`/`height` sur tout le build** : `/blog/` charge ses 12 vignettes d'un bloc (339 Ko), chaque billet tire les 4 vignettes « Vous aimerez aussi » (~124 Ko) → shadow `archive-single.html` (7ᵉ) le 2026-08-13 : `loading="lazy" decoding="async" width height` sur les vignettes de grille. Vérifié : sur un billet, 0/4 vignettes related au chargement, 4/4 après scroll. Sur `/blog/` Chrome précharge quand même tout en connexion rapide (son seuil de distance lazy est large) — le gain y dépend du réseau. Hors périmètre restant : les images de corps de billet (markdown pur, demanderait un plugin hors whitelist Pages) et les bandeaux `page__hero` (au-dessus de la ligne de flottaison, lazy nuirait)
- [ ] **`profile_square.jpg` 800×800/69 Ko dans un avatar plafonné 110 px** sur chaque page MM. Attention : le même fichier sert `.ev-photo` (~640 px utiles) → deux fichiers. S
- [x] ~~**Caveat : 50,9 Ko pour deux chaînes décoratives** (landing seule) — sous-ensemble `&text=` mesuré à 13,9 Ko. S~~ → **non retenu** (2026-08-13) : `text=` s'applique à toutes les familles de la requête, il faudrait un `<link>` séparé, et surtout le sous-ensemble casse en silence au premier changement de copy (glyphe manquant → fallback cursive système). 37 Ko sur la seule landing, cache Google immuable : fragilité > gain
- [x] **Poster hero 1920×1080/128 Ko servi tel quel au mobile**, découvert tard (pas de preload) → réglé le 2026-08-13 : le poster passe de l'attribut (pas de srcset) au **background CSS de l'élément vidéo** — sans src (no-JS, reduced-motion) la vidéo est transparente, le background tient lieu de poster, et le breakpoint 720 sert un 960×540 (57 Ko, −74). Le desktop redescend à 1440×810 (93 Ko, la résolution de la vidéo). `background-position` suit `object-position` (62 % / 50 % 42 % portrait — sinon la chouette sort du cadre, vu au premier essai). Preload media-gated `fetchpriority=high` dans le head landing. Vérifié : un seul poster chargé par viewport, rendu identique à l'attribut (desktop reduced-motion au pixel). JPEG conservé (WebP sondé par la revue : −45 Ko de plus, à voir si on veut le double format)
- [ ] `images/peinard.jpg` (114 Ko) : plus aucune référence, toujours publié. Poids mort de dépôt. S

### 🔍 SEO (techniquement propre, sémantiquement muet)

- [x] **Zéro JSON-LD sur les 57 URLs** : ni `Person`, ni `ProfessionalService`/`LocalBusiness` (NAP déjà publiée dans `/mentions-legales/`), ni `BlogPosting`, ni `BreadcrumbList`. MM conditionne son bloc à `site.social`, clé absente de `_config.yml`. M → fait le 2026-08-13 : `ProfessionalService` sur `/` et `/realisations/` (layout landing — localité seule, l'adresse complète reste sur la page légale ; `sameAs` depuis `_data/social.yml`), `BlogPosting` sur les 46 billets (`head/custom.html`, gaté `page.id` — pas dans ev-assets qui doit rester cachable). Validé `json.loads` sur 4 pages. Restent non faits, assumés : `BreadcrumbList` (faible valeur sans fil d'Ariane visible) et le bloc MM natif (`site.social` laissé absent pour ne pas doubler)
- [ ] **Le seul lien billets → landing est en `rel="nofollow"`** (sidebar auteur, `_config.yml:70-72`) : 46 billets, 15 ans de backlinks, zéro signal transmis. Un lien follow en contenu ou footer = S ; shadow `author-profile.html` = M
- [x] **`/blog/` sans meta description propre** (sert la générique du site, comme 6 autres pages) et h1 « Blog — En Veille » qui répète la marque → réglé le 2026-08-13 : `title: "Blog"` (seo.html suffixe la marque) + description dédiée (sans chiffre qui dériverait). `/tags/` reçoit aussi sa description
- [ ] **41/46 billets : excerpt < 70 caractères** (« Petit tutorial », « Manuel de survie ») → snippets réécrits par Google. Structure saine (0 trou, 0 doublon), seul le contenu est faible. M
- [x] **`/categories/` rend 0 entrée** (aucun billet n'a de `categories:`) et `/posts/` est orpheline — toutes deux au sitemap → réglé le 2026-08-13 : `/categories/` **supprimée** du build (page vide, zéro lien entrant, même politique que les archives /page2/), `/posts/` passe en `sitemap: false` en attendant que le regroupement par année de `/blog/` la relie ou la remplace
- [ ] **`/tags/` : 102 tags dont 86 à usage unique**, doublons de casse (`agilité`/`Agilité`, `Devoxx`/`Devoxx France`) → 393 entrées, seul rebond thématique offert et inutilisable. M
- [x] **Feed RSS plafonné à 10 billets sur 46** → `feed: posts_limit: 50` le 2026-08-13, vérifié : 46 entrées
- [x] **Head landing : jeu OG/Twitter partiel** — manquent `og:site_name`, `twitter:site`, `twitter:title`, `twitter:description` (que MM émet partout ailleurs) ; `og:image:alt` absent de tout le build. S → complété le 2026-08-13 (les 5 balises, `og:image:alt` sur la landing seule — côté thème c'est seo.html, pas le prix d'un shadow)
- [ ] **Pagination `/blog/page2-4/` au sitemap** avec title/description quasi identiques, sans noindex. S
- [x] **`/privacy` : `sitemap: false`** alors que `/mentions-legales/` y est — deux pages légales traitées différemment sans raison. S → aligné le 2026-08-13, `/privacy` rejoint le sitemap

### 🧭 UX structurel

- [x] **Les 3 billets vitrines de la landing = les 3 parties du même compte-rendu Devoxx 2022** (tri par date, `index.html:302-309`) → mécanisme livré le 2026-08-13 : `featured: true` en front matter épingle (dès 3 posés), repli sur les récents en attendant. **Le choix des 3 billets reste à Vincent** (arbitrages) — aucun changement visible tant qu'il n'est pas fait
- [x] **« Vous pourriez aimer aussi » : les 4 mêmes billets sur les 46 pages** (`related: true` sans LSI = les plus récents) → shadow (8ᵉ) de `page__related.html` le 2026-08-13 : billets partageant au moins un tag, du plus récent au plus ancien, complétés par les récents. Vérifié : `/devoxx-2022-part-1/` → 4 billets Devoxx. Limite connue : 86 tags à usage unique retombent sur le repli — le resserrage de la taxonomie (item dédié) élargira la couverture
- [x] **« Mis à jour : May 17, 2022 »** : dates en anglais sur site FR (pas de table de mois, `%b` non localisé) **et** libellé mensonger — le mensonge est structurel : MM affiche `page.date` avec le label « Mis à jour » quand `last_modified_at` est absent (le `modified:` des billets n'est **jamais lu** par le thème) → réglé le 2026-08-13 : `date_format: "%d/%m/%Y"` en config (numérique, neutre, zéro shadow) + `date_label: "Publié le :"` dans le bloc fr vendorisé (divergence d'upstream commentée sur place). Landing : mois français via `_includes/ev-date-fr.html` (table manuelle, `%b` non localisable)
- [ ] **Aucun pont commercial en fin de billet** : un billet se termine par tags → partage → Disqus. Piste sans shadow : `page.sidebar` custom via `defaults` ; encart après contenu = 4ᵉ shadow (`single.html`). S/M
- [ ] **`/blog/` n'affiche aucune date** (readtime seul) : 46 billets 2011→2022 sans repère chronologique. Date sur les cartes + regroupement par année = « archive de 15 ans » au lieu de « rien depuis 2022 ». M
- [ ] **La recherche n'indexe que les billets** (store MM = collections seules : ni `/about/`, ni `/realisations/`, ni les services) et le bouton loupe est absent des 2 pages commerciales (pas de panneau dans le layout landing). M
- [ ] **Les 5 cartes services portent une flèche `→` qui n'est ni lien ni ancre** — affordance de clic qui ne mène nulle part ; pas de point de conversion entre `#services` et la CTA finale (`index.html:317`). S
- [ ] **LinkedIn absent du site** (`_data/social.yml` = GitHub/Twitch/X) alors que les billets proposent « Partager sur LinkedIn » — le réseau du prospect B2B. S → **acté oui** le 2026-08-13, en attente de l'URL exacte du profil (ne pas la deviner)

### 🔧 Dette code

- [x] **Bordure nav sticky jamais affichée sans scroll-driven animations** (Firefox) : `enveille.css:161-167` ne pose la bordure que via `animation-timeline`, alors que `nav.js:34` calcule déjà `.ev-nav--scrolled` sans le consommer pour ça → corrigé le 2026-08-13, et le mal était plus large : **cassée aussi sur Chrome passé 200px** — sans `animation-fill-mode`, l'effet s'éteint après l'`animation-range` (mesuré : alpha 0,05 à 100px, 0,098 à 190px, 0 à 250px). Et `forwards` aurait peint la bordure en permanence sur Firefox (animation 0s sans timeline). L'animation est supprimée, la bordure suit `.ev-nav--scrolled` + transition — un seul mécanisme, tous moteurs, vérifié à 0/250/3000px sur landing et blog
- [ ] **Hero : aucun `error` handler** — vidéo manquante/404 = 190vh de scroll mort (`landing.js:147-152` engage le pin avant de savoir si ça charge) ; source mobile choisie une fois, jamais réévaluée en rotation ; couple 720px JS/CSS non documenté (contrairement au 1000/1001). S
- [ ] **Handler scroll quick-nav non throttlé** : jusqu'à 7 `getBoundingClientRect()` + `scrollHeight` par événement (`landing.js:299`), alors que le pattern rAF existe 90 lignes plus haut. S
- [x] **14 balises de `<head>` en double** entre `head/custom.html` et `landing.html:24-41` (favicons, fonts ×2, theme-color, enveille.css, nav.js) — corriger un seul fichier casse silencieusement l'autre moitié du site → extrait le 2026-08-13 dans `_includes/head/ev-assets.html` (prérequis du toggle de thème : le script de pré-peinture devait vivre à un seul endroit). Vérifié au diff du rendu : pages MM identiques au commentaire près, landing à jeu de balises identique, `nav.js` passe dans le head (defer, ordre préservé)
- [ ] **Hauteur de nav en 4 représentations** (84px ×2, 96px, `--ev-nav-h` posé seulement par le JS hero hors reduced-motion) + commentaires « ~65px ». Déclarer `--ev-nav-h` dans `:root`. S/M
- [ ] **CTA et markup `<video>` dupliqués** entre `index.html` et `_pages/realisations.html` — les attributs vidéo sont le contrat no-JS/reduced-motion de `initWorkVideos`. Extraire en includes. M
- [ ] **Code mort** : `.ev-container` défini, jamais utilisé, sa déclaration recopiée 13× ; `.ev-hero__scroll-hint` + 2 keyframes orphelins ; `.ev-clickable` dans le JS et le CSS, dans zéro template. S
- [ ] **Reset landing.css:39-51 cible des classes MM que la landing ne rend jamais** (`.masthead`, `.sidebar`, `.initial-content` — vérifié : 0 occurrence dans `_site/index.html`). Faux positif permanent de la procédure de bump. S
- [ ] **Couleurs de marque en dur hors tokens** : palette rejouée dans le canvas Matrix et le message console (`landing.js:371-511`), `#22c55e` « Disponible » réparti sur les 2 feuilles, `rgba(0,27,61,.2)` en box-shadow invisible en dark. M
- [ ] **`_config.yml` : `jekyll-gist` sans aucun `{% gist %}`** et `twitter_username` à plat mort (MM lit la forme imbriquée) — illusion de source unique pour le pseudo X. S

### ⚖️ Arbitrages à trancher (Vincent)

- [x] **Title/h1 de la home sans « développeur », « indépendant » ni « Toulouse »** → arbitré le 2026-08-13 : title enrichi (« En Veille — Vincent Ferries, développeur indépendant à Toulouse · JVM · JS/TS · IA »), le h1 (phrase de marque validée) ne bouge pas
- [x] **`cursor: none` sur toute la landing** (`landing.css:70-73`) → **arbitré garder** le 2026-08-13 : signature assumée pour le public cible, reduced-motion sert de porte de sortie (curseur système préservé depuis les gardes JS). Écart résiduel assumé pour les réglages OS de pointeur
- [x] **Mécanisme de pause des mouvements > 5 s** (SC 2.2.2) → arbitré le 2026-08-13 : les vidéos réalisations perdent leur `loop` (une lecture par passage à l'écran, rejeu au re-scroll — le plus gros de l'écart, fait). Marquee, aurore CTA et pastille restent assumés : décoratifs, faible amplitude, coupés en reduced-motion
- [x] **`mailto:vincent.ferries@gmail.com` partout** → **arbitré ne rien changer** le 2026-08-13 : le mailto direct vers gmail est assumé, pas de bouton copier ni d'adresse domaine
- [x] **Témoignages clients** → **reporté** le 2026-08-13 : « pas intéressé encore » — ne pas re-proposer, Vincent rouvrira s'il le souhaite
- [ ] **Page « comment ça se passe »** (process premier échange → livraison) : l'objection n°1 d'un commerçant, absente du site — copy à écrire ensemble
- [ ] **Choix des 3 billets `featured`** de la landing (remplace les 3 parties Devoxx 2022) — plan retenu le 2026-08-13 : les deux billets planifiés ci-dessous une fois publiés + un evergreen du fonds à choisir

### ✍️ Billets planifiés (2026-08-13)

Deux brouillons scaffoldés dans `_drafts/` (ignorés par le build Jekyll — structure proposée, tout ce qui est opinion/tarif/recommandation est en TODO, à écrire dans la voix de Vincent) :

- [ ] **« Des sites faits main : ce que je propose, et pourquoi »** (`_drafts/sites-vitrines-faits-main.md`) — l'offre landing/sites vitrines. Synergie : la section « comment ça se passe » est la page process identifiée manquante par la revue UX, le billet peut la nourrir
- [ ] **« Mon setup IA en 2026 : outils, abonnements, workflows »** (`_drafts/workflows-ia-2026.md`) — génération d'images (la chouette OpenArt du site = démo concrète et démontrable), setups Claude Code/opencode, abonnements conseillés
- À la publication : datér le fichier vers `_posts/`, relancer `./tools/og-card/generate-posts.py` (carte OG + vignette de grille auto), poser `featured: true`

---

## 🔥 Maintenant

### Réalisations — suites

- [x] Corriger les faits marqués `# à confirmer` dans `_data/realisations.yml` (années, stacks) — confirmés 2026-07-28 (Escalire : Astro + Sveltia CMS · Just Bordas : HTML/CSS/JS pur · Cuisine : Astro + Compose ; les trois datent de 2026)
- [x] Valider le copy de la section et de la page (ton, crédibilité commerciale) → revu le 2026-08-11, trois retouches
  - Le titre landing perd son **"aussi"** ("Des sites faits main, aussi") : le mot était dit deux fois en trois lignes, titre *et* sous-titre, et le titre divergeait de celui de `/realisations/`. Le "En Veille, c'est aussi" du sous-titre est conservé — c'est lui qui fait la couture avec les 5 services juste au-dessus
  - **"Usine à gaz" était écrit trois fois** sur deux pages qui se lisent à la suite (landing, lede de la page, + "usine e-commerce" dans la story Escalire). Le lede de `/realisations/` passe à "sans plateforme à louer tous les mois" — plus concret pour un commerçant, ce qu'il craint c'est l'abonnement. Il reste une occurrence par page, avec des mots différents
  - **"Voir les réalisations" → "Voir le détail de chaque projet"** : les deux grilles bouclent sur `site.data.realisations` **sans limite**, la landing affiche donc déjà les 3. Le bouton promettait d'autres références quand il ne donne que les stories longues et les stacks
  - **Le projet perso "Recettes de cuisine" reste dans la grille client**, arbitré : `kind: Projet perso` est affiché dans la méta et assumé dans la story, et c'est la seule preuve publique de la chaîne Astro + Kotlin/Compose. À savoir quand même : un prospect qui compte voit 2 clients, et la `description` de la page ne cite qu'Escalire et Just Bordas
  - Non touché car cohérent : la CTA de la page promet "ce qui est possible, en combien de temps, et pour combien" — c'est une promesse de devis, pas un argument de prix, donc sans conflit avec le "moins cher qu'un recrutement" retiré du service 04 le même jour

### Textes de la landing à affiner

- [x] Valider ou réécrire le **lede du hero** → tranché le 2026-08-11 : la fin devient "Mission longue de préférence, **ponctuel possible**." Le reste du lede est validé tel quel
  - **Le contexte commercial a bougé** : Vincent prend toujours quasi exclusivement des missions longues, mais cherche depuis peu à mettre en avant des développements plus courts, réalisés en parallèle d'une mission en cours. La restriction sèche du lede fermait exactement la porte qu'il veut ouvrir
  - Le message "mission longue" est dit **trois fois** (lede, badge "la préférée" du service 01, `about.md:22`) : l'adoucir dans le lede ne le fait pas disparaître
- [x] Trancher entre **"depuis 2011"** (tag hero) et **"15 ans"** (stat + about) → tranché le 2026-08-11, et les deux chiffres étaient **faux**, pas juste incohérents. Vincent développe depuis 2007 (19 ans) et est indépendant depuis 2016 (10 ans) : "15 ans" ne correspondait à rien, et "depuis 2011" datait le **blog**, pas le métier ni le statut
  - Tag hero et eyebrow de la carte OG passent à **"depuis 2007"**. La lecture "indé depuis 2007" est désambiguïsée par la stat "10 ans en indé" juste en dessous — c'est le couple qui rend le tag lisible, pas le tag seul
  - Les anciennetés sont **calculées au build** (`site.time | date: '%Y' | minus: 2007`), plus jamais écrites en dur : c'est exactement comme ça que "15 ans" a dérivé sans que personne ne le voie. Vérifié sur le build, Liquid rend bien des entiers (`19`, `10`) et non des décimaux
  - Réserve connue : GitHub Pages ne reconstruit qu'au push, le chiffre se met donc à jour au premier commit de l'année, pas au 1er janvier
  - **"2011" reste juste partout où il désigne le blog** et n'a pas été touché : `_config.yml:11`, `_pages/404.md:15`, `about.md:10`
  - Une seule carte OG à régénérer : `generate-posts.py` passe `eyebrow=Billet`, l'eyebrow par défaut ne vit que dans `images/og-card.png`
- [x] Caler les **durées/formats des 5 services** sur la réalité commerciale → **revues ligne par ligne le 2026-08-11 et validées telles quelles**. Elles n'étaient donc pas "inventées" au sens de fausses : elles correspondent à la pratique. Aucune modification
  - 01 Accompagnement : 6 mois min · 3-4 jours/sem · IRL partiel — le `3-4 jours/sem` est le seul chiffre du site qui engage le planning hebdo, et il explique matériellement comment le développement ponctuel tient à côté
  - 02 Audit : 2 semaines · livrable écrit
  - 03 IA dev : 4-8 semaines · livrable tournant
  - 04 Dev ponctuel : 2-6 semaines · forfait possible — durée **calendaire**, cohérente avec une réalisation en parallèle d'une mission en cours
  - 05 Formation/mentorat : 1j intensif · cycle 4×2h · mentorat hebdo — ce sont des formats, pas des durées
- [x] Service 04 : "Moins cher qu'un recrutement" → remplacé le 2026-08-11 par "**Vous gardez le code, les tests et la doc.**" C'était le seul argument du site à vendre un prix comparé quand les 4 autres services vendent un résultat — et se positionner sur le prix invite à te comparer à un tarif journalier
  - **On ne dit rien du "comment"** (soir et weekend, en parallèle des missions) : arbitré, le client achète un livrable et un délai, pas un planning. La méta reste "2-6 semaines · forfait possible"
- [x] Stat **"8 technos en production"** → remplacée le 2026-08-11 par **"10 ans en indé"**. Le chiffre était mou *et* démenti sur place : le mur de logos juste en dessous en aligne 14. L'ancienneté en indépendant, elle, n'était affichée nulle part
  - Les 4 stats sont réordonnées pour grouper les deux durées : 19 ans dans le dev · 10 ans en indé · 46 posts · 5 formats
- [x] Stack frontend : `Vue, Angular, Jest` — **confirmés le 2026-08-11**, c'est du vécu. Le bloc terminal se lit comme un inventaire de compétences, pas comme le contenu du sprint en cours. Rien à changer
- [x] Stack mobile : `AOSP` — **confirmé le 2026-08-11**, réel. Reste aux deux endroits (mur de logos + `const mobile`)
- [x] Section about (landing + page) : "**coups de main bénévoles**" → étayé le 2026-08-11. Ça couvre écoles et étudiants, assos toulousaines, open source et communautés locales. La landing garde la version courte ("écoles, assos, open source"), `/about/` déplie les trois
- [x] Page `/about/` : 4 items vs 5 → **volontaire, mais l'intro le disait mal**. "Ce que je fais le plus souvent" laissait croire à un oubli ; c'est devenu "Le cœur de mes missions", qui assume la sélection. La ligne suivante renvoie déjà vers `/#services` pour l'offre complète. 
  - **Rouvert dans la foulée le même jour** : la liste passe bien à 5. Le premier arbitrage reposait sur "le ponctuel n'est pas ce que tu fais le plus" — toujours vrai, mais ce n'est plus ce que Vincent veut mettre en avant. L'item est formulé comme l'offre en plus ("en parallèle d'une mission longue"), donc "Le cœur de mes missions" reste juste. Ordre aligné sur la landing (01 → 05)

### Cohérence des partages sociaux (priorité haute, en prod *aujourd'hui*)

- [x] **`og:image` du layout `landing.html`** pointe sur `/images/logo.png` qui est encore l'**ancien** bouton power → quand on partage `enveille.info`, le visiteur voit l'ancien logo
- [x] Idem **`/favicon.ico`** et **`/favicon.png`** à la racine = ancien logo → onglet navigateur, raccourcis mobile, etc. montrent l'ancien
- [x] Twitter card passée en `summary_large_image`, OG card 1200×630 livrée (cf. `tools/og-card/`)
- [x] Pas de référence favicon explicite dans le head MM → liens explicites ajoutés dans `head/custom.html` et `landing.html`

### Pages transverses à reprendre

- [x] **`/404.html`** : francisé, ton En Veille, liens de rebond vers `/`, `/blog/`, `/about/`
- [x] **`/privacy`** : réécrite honnêtement (Google Fonts, Disqus, GitHub Pages explicités)

---

## ⏭ Prochainement

### Cohérence visuelle entre landing et reste du site

- [x] **Footers désynchronisés** → unifiés (2026-08-03) : override local de `_includes/footer.html` = source unique (ligne « © … chocolatines » partout), `footer.links` retiré de `_config.yml`. Les sociaux restent portés par la sidebar auteur des billets et la CTA landing. Spec : `docs/superpowers/specs/2026-08-03-footer-sync-design.md`
- [x] **Sidebar des billets (`author_profile`)** — les trois points ci-dessous sont réglés, la case n'avait jamais été cochée :
  - Avatar `profile_square.jpg` ✓ (cohérent avec landing depuis le commit du jour)
  - RSS désormais couvert partout via le footer unifié (2026-08-03) ; pas de lien direct vers `/` (la landing) dans la sidebar, mais les pages MM y reviennent via la marque `.ev-nav__brand` de la barre du haut (depuis 2026-08-05 il n'y a plus ni masthead ni `.site-title`)
  - Sur `/about/`, sidebar désactivée (`author_profile: false` dans le front matter) — l'intro de la page suffit
- [x] **Liens Twitter** : URLs migrées vers `x.com` (`_config.yml` ×2 + `index.html` ×1). Icônes (`fa-twitter`, SVG croix) volontairement conservées — choix visuel séparé.

### Photo

- [x] Faire/choisir une photo de Vincent pour la section "À propos" (utilise `profile_square.jpg` en attendant mieux)
- [x] Dans `index.html`, remplacer le bloc `.ev-photo__placeholder` par `<img>`

### Page `/about/` à rafraîchir

- [x] Refonte complète de la page (commit `eb74219`)
- [x] Garder la partie "Pourquoi ce nom ?" (storytelling conservé)
- [x] Ajouter une section parcours freelance, missions types
- [x] Retirer l'image `/images/peinard.jpg` en header (plus aucune référence dans le repo)
- [x] **`/about/` n'a plus de liens sociaux** → réglé le 2026-08-04 : `{% raw %}{% include ev-socials.html class="ev-socials" %}{% endraw %}` posé en fin de section « On se parle ? ». La classe `.ev-socials` vit dans `enveille.css` (et non `landing.css`, pas chargé hors landing) et passe par les tokens, donc suit light/dark ; hover sur `--ev-blue` qui vaut cyan en dark et navy-blue en light. Deuxième consommateur de l'include après la CTA landing

---

## 🎨 Déclinaisons logo (pas encore faites)

Le logo principal existe (`/images/logo.svg`) mais il manque :

- [x] **Favicon** multi-résolution (16, 32, 48) — kit complet via RealFaviconGenerator, avec `favicon-small.svg` pixel-art pour le 16px
- [x] **Favicon SVG** pour les navigateurs récents
- [x] **Logo PNG à jour** pour OG image (512×512 actuellement, à partir d'`android-chrome-512.png`)
- [x] **OG card dédié 1200×630** : `images/og-card.png` (fond cream, Fraunces italique, logo). Régénérable via `./tools/og-card/generate.sh`
- [x] **Version monochrome blanche** pour fonds sombres (t-shirts, stickers, watermark) → `enveille-logo-mono-white.svg`, livrée le 2026-08-11
- [x] **Version monochrome navy** pour impression monochrome → `enveille-logo-mono-navy.svg`, même jour
  - Source : un export Figma **noir à géométrie découpée** fourni par Vincent — anneaux et globes réellement interrompus au passage des sourcils. Passé par `clean_figma_svg.py` (14 233 → 12 483 octets), `width`/`height` retirés de la racine pour s'aligner sur `enveille-logo-final.svg`
  - Les deux déclinaisons en sont **dérivées par substitution de couleur**, pas redessinées. Le noir n'est pas committé : reproductible depuis l'un des deux
  - **Deux itérations ont été nécessaires, et la première était de mon fait.** J'avais dérivé les variantes en passant les remplissages à `none`, croyant vider un disque décoratif. Ce remplissage faisait l'occlusion : sans lui, les anneaux traversaient les sourcils et les globes continuaient dessous. Le logo couleur ne découpe rien non plus — le cercle de l'œil y est un chemin fermé complet, c'est le sourcil **plein** dessiné par-dessus qui masque. Un monochrome portable n'ayant pas de peinture opaque, la coupe devait passer dans la géométrie. Détaillé dans `DESIGN.md`
  - Vérifié au rendu : navy sur crème / blanc / cyan / gris clair, blanc sur navy / noir / blue / gris t-shirt. Une seule couleur dans chaque fichier hors machinerie du `<mask>`
  - **Plancher à 48px** pour les monochromes (contre 32 pour la couleur) : à 32 les anneaux concentriques fusionnent, le trait n'ayant pas la présence d'une masse pleine. `DESIGN.md` corrigé en conséquence
- [x] **Wordmark horizontal** → `enveille-logo-wordmark.svg`, livré le 2026-08-11
- [x] **Version "stacked"** → `enveille-logo-stacked.svg`, même jour. **Mais pas pour Twitch ni X** : ces deux-là rognent les avatars en cercle et le texte y est coupé (vérifié au rendu). Elle sert GitHub, l'imprimé, les formats carrés. Pour un avatar rond, la chouette seule
  - Composés **par script** plutôt que dans Figma : le texte est vectorisé depuis le TTF de Fraunces via `fontTools` + `uharfbuzz` (crénage compris), donc zéro `<text>`, zéro `@font-face`, aucune dépendance de fonte dans les fichiers
  - Aucune proportion inventée : Fraunces 500 / `opsz` 48 / texte à la moitié du logo / gouttière au tiers viennent de `.ev-nav__brand` (`enveille.css:175-182`), qui compose déjà ce wordmark en HTML. Le rendu vectorisé a été comparé à celui de Chrome sous les mêmes réglages — c'est ce qui a révélé que l'axe `WONK` doit valoir **0** et non son défaut de 1, Google Fonts servant la variante non-wonky
  - La version empilée a fallu recaler : au rapport de la nav, le texte fait presque deux fois la largeur du logo et le bloc sort plus large que haut. Texte calé sur la largeur du logo, gouttière à une largeur d'œil
- [x] **Wordmarks monochromes** → les deux verrouillages existent aussi en blanc et en navy, composés sur le logo au trait : `enveille-logo-{wordmark,stacked}-mono-{white,navy}.svg`. Une seule couleur par fichier, vérifié. Le blanc est celui qui va sur une bannière Twitch ou une slide sombre
  - **Le script n'est pas committé** — il demande `fontTools`, `uharfbuzz` et le TTF de Fraunces pour des assets qu'on ne régénère pas. À redemander si la marque change de nom ou de fonte

Le script `docs/design/assets/clean_figma_svg.py` est à utiliser après chaque export Figma.

---

## 🌐 Autres surfaces à unifier

### `vferries.github.io/cv`
- [x] Audit : HTML/JS vanilla, CSS custom properties déjà alignées palette En Veille
- [x] Appliquer Fraunces (display + tagline italique) + Inter (body)
- [x] Header : brand strip avec logo + wordmark "En Veille · CV", lien retour
- [x] Bonus : OG card 1200×630 dédiée + favicon kit (SVG/ICO/PNG) + print refondu (photo carrée 150px, navy partout, typo 0.78rem → CV tient sur 2 pages)
- [x] Footer du CV (section SOCIAL) → **on le laisse tel quel** (arbitré le 2026-08-05). Le ton CV-centric est assumé : ce n'est pas la même surface que le blog, et l'aligner n'apporterait rien au lecteur d'un CV

### `twitch.tv/EnVeilleCode`
- [ ] Avatar : version stacked du logo
- [ ] Bannière : hero horizontal avec logo + "En Veille · Code streams from Toulouse"
- [ ] Panels : à refaire dans le style design system (possiblement avec Lucide icons)
- [ ] Overlays de stream (scene starting / BRB / ending) en accord visuel

### `x.com/VincentFERRIES`
- [ ] Avatar : version stacked du logo
- [ ] Header : bannière avec identité En Veille
- [ ] Bio : aligner ton avec la landing ("Dev indé · Toulouse · JVM / JS / IA · twitch.tv/EnVeilleCode")

---

## 🛠 Améliorations techniques

- [x] **Barre du haut unifiée** → 2026-08-05 : `ev-nav` sert toutes les pages via un shadow de `_includes/masthead.html`. Spec : `docs/superpowers/specs/2026-08-05-nav-unifiee-design.md`
  - Les deux barres divergeaient en **mécanisme**, pas qu'en style : la landing bascule sur un breakpoint fixe à 720px, `greedy-nav` déplaçait les liens un à un selon la place et ne repliait rien avant ~400px
  - La recherche survit sans JS : son panneau vient de `default.html` et son script s'accroche par classe, donc un bouton `.search__toggle` dans `ev-nav` suffit. Il est conditionné par `include.search`, le layout landing n'ayant pas de panneau
  - `skip-links.html` pointe sur `#site-nav` : `ev-nav` porte désormais cet id en plus de `ev-top`
  - **3ᵉ shadow de partial** après `footer.html` et `head/custom.html` — à rediffer à chaque bump de `remote_theme`
- [x] `scroll-margin-top` sous la nav sticky pour toutes les ancres → `[id] { scroll-margin-top: 84px }` dans `landing.css` (nav mesurée à 65px). Vérifié Playwright : 19px de marge sur `#realisations`
- [x] **Sans JS, tout le contenu `.ev-reveal` reste invisible** → corrigé (2026-07) : classe `no-js` sur `<html>` remplacée par `js` via script inline, override `html:not(.js)` dans `landing.css`, stats servies en dur dans le HTML (le JS les remet à 0 avant d'animer). Vérifié par capture Playwright JS off/on. Reste un cas mineur : le panneau burger mobile ne peut pas s'ouvrir sans JS (liens nav inaccessibles ≤720px, page one-page donc non bloquant)
- [x] **OpenGraph par billet** → fait le 2026-08-04 : une carte 1200×630 par billet dans `images/og/<slug>.png` (46 cartes, 1,4 Mo, ~29 Ko pièce), câblées via `header.og_image` qui prime sur `header.image`. Générateur idempotent : `./tools/og-card/generate-posts.py`
  - Au passage : les 18 billets qui avaient un `header.image` ne s'en sortaient pas mieux que les 28 autres — ce sont des bandeaux (900×230, 1600×500, un 1849×39, et un `.svg` que la plupart des plateformes refusent). Ils restent affichés en tête de billet, ils ne servent simplement plus de vignette
  - Et surtout : **aucune balise `twitter:*` n'était émise** sur les billets et les pages MM. `_config.yml` déclarait `twitter_username` à plat (convention Jekyll) là où MM lit `twitter.username` imbriqué. Corrigé — sans ça les cartes seraient rendues en petite vignette carrée par X
- [x] **Pages hors billets en `twitter:card: summary`** (petite vignette) → réglé le 2026-08-05 sur les 8 concernées : `/blog/` (+ pagination), `/about/`, `/categories/`, `/tags/`, `/posts/`, `/404`, `/privacy`. MM ne passe en `summary_large_image` que si `page_large_image` est défini (`seo.html:78`), ce qui demande un `header.og_image` en front matter — `site.og_image` seul n'alimente que `twitter:image` en petit format
  - `/blog/` et `/about/` ont une carte dédiée (`images/og/page-blog.png`, `images/og/page-about.png`), générée avec le template des billets puis quantifiée en PNG8 64 couleurs (28 Ko pièce). Les 6 autres pointent sur la carte générique — elles ne se partagent pas volontairement
  - Un `header.og_image` seul ne déclenche **pas** de hero : `single` et `archive` ne testent que `overlay_color`, `overlay_image` et `image`. Vérifié sur le build
- [x] **Optimiser le poids des images dans `_posts/`** → fait le 2026-08-04 : `images/` passe de **8,70 à 4,13 Mo**
  - 9 JPEG recompressés en place (`-strip -quality 82 -sampling-factor 4:2:0`), mêmes noms donc mêmes URLs. `kanban-at2012.jpg` était en 2560px pour un corps de billet large de ~700px → redescendu à 1600
  - 3 photos stockées en PNG converties en JPEG : leur canal alpha était intégralement opaque (vérifié : `min = max = 65535`, zéro pixel translucide), donc rien à préserver. PNG8 écarté — dithering visible sur le portrait, bandes sur le dégradé Devoxx. **Les 3 anciennes URLs `.png` répondent 404** : GitHub Pages ne redirige pas les fichiers statiques et `jekyll-redirect-from` ne couvre que les pages
  - `bio-photo.jpg` et `sample-image-1.jpg` supprimés (résidus du thème, 0 référence)
  - Restent 4 fichiers entre 200 et 400 Ko (`geekcamp`, `dos_mignon`, `dos_maison`, `sallecomble`) : déjà proches de leur plancher à q82, rien à gratter sans perte visible
- [x] **28/46 billets sans `header:` image** → réglé le 2026-08-05 : `/blog/` passe en grille 3 colonnes (`entries_layout: grid`, sidebar retirée, `paginate: 12`), chaque billet portant une vignette dédiée. Spec : `docs/superpowers/specs/2026-08-04-blog-grid-design.md`
  - La liste ne montrait **aucune** image auparavant, même pour les 18 billets qui avaient un bandeau : MM ne rend `.archive__item-teaser` qu'en mode `grid`
  - **La vignette est découplée du bandeau de page.** `header.image` reste le bandeau affiché en tête d'article ; `header.teaser` pointe sur une image dédiée sous `images/og/`, au ratio 1200:630 de la cellule. 16 sont dérivées du bandeau par un recadrage décidé à la génération et **ancré à l'ouest** (ces bandeaux portent leur titre à gauche), 30 sont des cartes teaser
  - Premier essai : réutiliser le bandeau tel quel et laisser `object-fit: cover` recadrer. 13 bandeaux sur 16 perdaient 40 à 52 % de leur largeur, `devoxx_fr_2016.jpg` rendant « OXX FRANCE 2 ». Le recadrage maîtrisé ramène ce cas à « DEVOXX FR »
  - **Coupe résiduelle assumée** : 8 bandeaux sur 16 tronquent encore un mot (tous des Devoxx — « FRANCE » en « FRAN » ou « FR », l'année des trois bandeaux 2022). Ce sont des bandeaux texte pleine largeur ; aucun recadrage ne les fait tenir en 1,9:1. Piste si ça gêne un jour : ne pas recadrer les bandeaux proches du ratio cible (les 2022 sont à 2,38:1, un simple letterbox coûterait 20 % de bandes)
  - `/blog/page5/` a disparu (46 billets sur 4 pages) — page d'archive paginée sans contenu propre, arbitrage validé
- [x] **« Recent Posts » sort en anglais sur `/blog/`** → réglé le 2026-08-05, et le symptôme cachait bien plus large : **toutes** les chaînes du thème étaient en anglais (« minute read », « Share on », « Tags: », « You May Also Enjoy », « Updated: », la pagination…)
  - Cause principale : **Jekyll ne lit `_data/` que depuis la source du site**, jamais depuis un thème — `DataReader#read` fait `site.in_source_dir(dir)`, point. Le `_data/ui-text.yml` de MM n'est donc **jamais** chargé sous `remote_theme` : `site.data.ui-text` était nil et chaque template retombait sur son `default:` anglais. Le bloc `fr` de la 4.28.0 est vendorisé dans `_data/ui-text.yml`
  - Cause secondaire : `locale: fr_FR` là où les clés du thème sont en BCP 47 (`fr`, `fr-FR`, `fr-BE`, `fr-CH`). Même le fichier en place, le lookup n'aurait rien résolu. Le thème normalise `site.locale` tout seul pour `<html lang>` (tiret) et `og:locale` (underscore) — mais le layout `landing` émettait `og:locale` brut, corrigé au passage
  - 5 libellés lecteur d'écran étaient vides dans le bloc `fr` d'upstream (`skip_content`, `search_label`…) → comblés. Reste l'`aria-label` de `<nav class="skip-links">`, codé en dur en anglais dans le partial : le corriger demanderait un 3ᵉ shadow, pas le prix
  - **À rejouer à chaque bump de `remote_theme`** : rediffer le bloc `fr` d'upstream contre `_data/ui-text.yml`
- [x] **Titres anglais sur les 3 archives** → traduits le 2026-08-05 : « Billets par catégorie / tag / année ». Seul le champ `title` bouge, les permalinks sont intacts
- [x] **Robustesse latente du générateur de vignettes** → traité le 2026-08-05. Suite de tests : `tools/og-card/test_generate_posts.py`, 23 cas en `unittest` stdlib (`python3 tools/og-card/test_generate_posts.py`), fixtures images fabriquées à la volée par ImageMagick
  - `tags()` : gère désormais les trois écritures Jekyll (flow, bloc, valeur simple). En style bloc elle renvoyait une chaîne vide **en silence** — la vignette perdait ses tags. Le découpage flow respecte les virgules entre guillemets
  - Piège rencontré au passage : traiter toute quote en délimiteur cassait un billet réel, l'apostrophe de « traitement d'images » avalant la suite de la liste. Une quote n'ouvre une valeur qu'en tête de celle-ci. Vérifié en rejouant `tags()` sur les 46 billets : zéro écart avec l'ancienne version
  - `derive_vignette()` : les deux branches sont couvertes, dont celle des sources plus hautes que le ratio cible — elle est correcte. Ancrage ouest, non-agrandissement, réduction au-delà de 1200px et sortie JPEG verrouillés
  - `ratio()` : **volontairement pas touchée**. Sa dépendance au délégué SVG d'ImageMagick est sans conséquence — le seul `header.image` en SVG est `twitch-logo.svg` à 9,1:1, au-dessus du seuil `RATIO_MAX` de 5:1. Délégué présent ou absent, le billet reçoit une carte teaser. La réécrire serait spéculatif
- [ ] **`.archive:has(.entries-grid)`** dans `enveille.css` neutralise un couloir de sidebar fantôme de MM (sans lui la grille tombe à 1 colonne). Pas de repli pour les navigateurs sans `:has()` — Baseline depuis fin 2023, dégradation silencieuse et non bloquante : la grille serait juste moins large
- [x] **Redirects d'URLs déplacées** → **on ne fait rien** (arbitré le 2026-08-05). `paginate_path` est passé de `/page:num/` à `/blog/page:num/` lors du refresh, donc `/page2/`, `/page3/`… répondent 404. Arbitrage assumé : ce sont des pages d'archive sans contenu propre, personne ne met en favori une page de liste de billets. Pas de `jekyll-redirect-from` à ajouter
  - À ne pas confondre avec les **3 anciennes URLs `.png`** cassées par l'optimisation d'images du 2026-08-04 (photos converties en JPEG). Cas distinct, déjà assumé plus haut — et que ce plugin ne couvrirait pas de toute façon, il ne gère que les pages, pas les fichiers statiques
- [x] **Konami code sur Firefox, Chrome et WebKit** → vérifié le 2026-08-05 sous Playwright, et un bug non lié au moteur en est sorti : le message « bien joué, curieux. » était en `position: absolute` sur un body statique, donc ancré au **document**, alors que le canvas est en `fixed`. Or les flèches du code scrollent la page en cours de saisie — 80px sur Chrome, 138px sur Firefox. Sur une page déjà scrollée le message sortait de l'écran (mesuré à top -2500px pour un viewport de 800). Passé en `fixed`. La détection, elle, lit `e.key` : rien de spécifique à un moteur
  - **Safari iOS : rien à tester**, l'easter egg est inatteignable sans clavier physique
  - WebKit 26.5 (moteur de Safari desktop) couvert dans la foulée : déclenchement et centrage OK page en haut comme scrollée, rendu du canvas et de la Fraunces italique conformes. Il réclame `libevent-2.1-7t64`, `libavif16` et `libmanette-0.2-0` côté système
- [x] **`prefers-reduced-transparency`** → fait le 2026-08-05 : les trois surfaces qui empilaient fond translucide et `backdrop-filter` (nav collante scrollée, panneau burger ≤720px, pastilles de quick-nav) passent opaques et sans flou. Le fond reprend `--ev-bg`, donc il suit light/dark sans règle en plus. Le panneau burger garde sa contrainte `max-width: 720px`, sans quoi la règle peindrait un fond derrière les liens de la nav desktop. Vérifié sous Chrome via CDP à 1280 et 375px. Firefox n'implémente pas encore la requête et ignore le bloc
- [x] **Mentions légales** → livrées le 2026-08-05 : `/mentions-legales/`, obligation LCEN qui n'était pas remplie (le site n'identifiait nulle part son éditeur). Identification de l'EURL, directeur de la publication, hébergeur, propriété intellectuelle, renvoi vers `/privacy` pour les données personnelles
  - Au passage : **`/privacy` n'était liée depuis nulle part**. Les deux pages rejoignent la ligne footer unique, donc toutes les pages du build — la LCEN demande un accès « facile, direct et permanent »
  - Le lien vers `/privacy` est **sans slash final** : c'est la seule forme que GitHub Pages résout pour ce permalink, `/privacy/` répond 404 en prod (vérifié). Le serveur de test local, lui, rend 404 sur les deux — il ne fait pas la résolution d'extension, ne pas s'y fier
- [x] Vérifier que `:heart:` du footer landing est bien rendu par jemoji → OK, rendu en `<img>` emoji GitHub (vérifié dans le build + capture)
- [x] **Compteur dans CLAUDE.md à jour** : 46 billets
- [x] **Contraste dark mode sous le seuil WCAG AA sur les pages MM** → corrigé le 2026-08-04 : le stop dark de `--ev-text-subtle` passe de `#837B66` à `#9A917C`. L'ancien tombait à **4,34:1** (et non 4,40 comme noté ici, recalcul WCAG 2.1) sur `--ev-bg-subtle` (#0E1428) du `.page__footer`, sous le seuil AA de 4,5. Le nouveau donne 5,84:1 sur le footer et 6,32:1 sur `--ev-bg` (#06091A) ; light mode inchangé (#6B6252, 5,63:1 et 5,19:1). Valeur choisie parce qu'elle existait déjà dans le système : le hero se la forçait en local (`landing.css:439`) pour ce même besoin — cet override reste nécessaire en light mode, où le hero garde ses tokens dark
  - À ne pas confondre avec les **icônes sociales de la sidebar**, corrigées le 2026-08-04 (commit `1cea53a`) : MM leur imposait des couleurs de marque en dur (GitHub 1,09:1 sur fond sombre), elles héritent désormais de la couleur du lien → 16,6:1 dans les deux modes
- [x] **`remote_theme` pinné** (2026-08-04) : `mmistakes/minimal-mistakes@4.28.0`. Sans ref, chaque build GitHub Pages résolvait sur `master` — un rename upstream de `footer.html` (ou de son appel depuis `default.html`) faisait disparaître le footer de toutes les pages MM sans commit ici, même risque pour l'override de `_includes/head/custom.html`. Le passage master → 4.28.0 a été diffé sur le `_site/` complet : seuls `dir="ltr"` (déplacé de `<html>` à `<body>`), `@keyframes intro` (`opacity: 0.01` → `0`) et deux PNG de skins catppuccin inutilisés changent. **À faire à chaque bump** : rejouer ce diff avant de monter la ref

### Landing — passage en prod (vérifications restantes)

- [x] Vérifier la nav sur mobile → OK à 375px : pas d'overflow horizontal, la pastille "Disponible" vit dans le panneau burger (vérifié Playwright + capture)
- [x] Vérifier les 3 billets en preview sont bien les plus récents → validé visuellement (série des talks Devoxx France 2022, les plus récents du blog)
- [ ] Tester en prod sur `www.enveille.info` après chaque change

---

## 💡 Idées qu'on n'a pas tranchées

- Un badge "Disponible jusqu'à tel mois" qui se met à jour automatiquement via un data file (remplace le `Disponible` statique de la nav)
- Un "onglet" live Twitch qui apparaît uniquement quand le stream est on (via l'API Twitch)
- ~~Une page `/projets/` avec mini-études de cas~~ → fait autrement : `/realisations/` (sites vitrines publics, 2026-07). Reste la piste « missions anonymisées » façon git log à y ajouter (matière à fournir par Vincent).
- ~~Un toggle dark/light manuel en plus du `prefers-color-scheme` auto~~ → **fait le 2026-08-13**, arbitré **2 états** (pas de retour « auto » dans le cycle : un clic = choix manuel définitif, persisté en localStorage `ev-theme`). Bouton dans `ev-nav.html` (statique, include_cached ok), icône = thème cible en CSS pur, pré-peinture par script inline de `head/ev-assets.html`. Les blocs dark du CSS vont désormais **par paires jumelles** (`@media` + `[data-theme="dark"]`) — consigné dans AGENTS.md
- Une version anglaise (ou au moins une bio EN dans le footer) pour clients non-FR

---

## 📦 Prochaines sessions Claude

Ce qui peut être fait en autonomie par Claude Code (commit à la clé) :

- Franciser /404.html et /privacy dans le ton En Veille
- Synchroniser footer landing ↔ footer MM (`_config.yml` `footer.links` + custom)
- Harmoniser `twitter.com` → `x.com` partout
- Désactiver `author_profile` sur /about/ (front matter)
- Générer les variantes logo depuis le SVG principal (imagemagick pour favicon multi-res, etc.)
- Mettre à jour le compteur de billets dans CLAUDE.md
- Auditer + patcher les 3 autres surfaces

Ce qui demande intervention humaine :

- Valider les textes (ton, crédibilité commerciale)
- Trancher SIREN/mentions légales
- Fournir la photo studio dédiée (en remplacement de `profile_square.jpg`)
- Valider les accords clients pour études de cas
- Publier sur Twitch/X les nouveaux assets
