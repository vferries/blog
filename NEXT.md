# NEXT — roadmap En Veille

État au 27 avril 2026, après audit complet du site. Priorités de haut en bas.

---

## 🔥 Maintenant

### Réalisations — suites

- [x] Corriger les faits marqués `# à confirmer` dans `_data/realisations.yml` (années, stacks) — confirmés 2026-07-28 (Escalire : Astro + Sveltia CMS · Just Bordas : HTML/CSS/JS pur · Cuisine : Astro + Compose ; les trois datent de 2026)
- [ ] Valider le copy de la section et de la page (ton, crédibilité commerciale) — Vincent

### Textes de la landing à affiner

- [ ] Valider ou réécrire le **lede du hero** (actuel : "Je suis Vincent. J'accompagne les équipes tech sur leurs projets de fond — backend JVM, front-end JS/TS, Android, et l'intégration concrète de l'IA dans les workflows de dev. Mission longue de préférence.")
  - "Mission longue de préférence" → renforce l'option 01 trop tôt, ou OK assumé ?
- [ ] Trancher entre **"depuis 2011"** (tag hero) et **"15 ans"** (stat + about) — cohérence formulation
- [ ] Caler les **durées/formats des 5 services** sur la réalité commerciale (actuellement inventées)
  - 01 Accompagnement : 6 mois min · 3-4 jours/sem · IRL partiel
  - 02 Audit : 2 semaines · livrable écrit
  - 03 IA dev : 4-8 semaines · livrable tournant
  - 04 Dev ponctuel : 2-6 semaines · forfait possible
  - 05 Formation/mentorat : 1j intensif · cycle 4×2h · mentorat hebdo
- [ ] Service 04 : "Moins cher qu'un recrutement" → argument banal, à challenger
- [ ] Stat **"8 technos en production"** : vague, à étayer ou retirer
- [ ] Stack frontend : `Vue, Angular, Jest` annoncés "tous les jours" — vraiment ?
- [ ] Stack mobile : `AOSP` — confirmer ou retirer si aspirationnel
- [ ] Section about (landing + page) : "**coups de main bénévoles**" reste vague — étayer ou retirer
- [ ] Page `/about/` : la liste des prestations a 4 items vs 5 sur la landing (manque "Développement ponctuel & POC") — volontaire ou à compléter ?

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
- [ ] **Sidebar des billets (`author_profile`)** :
  - Avatar `profile_square.jpg` ✓ (cohérent avec landing depuis le commit du jour)
  - RSS désormais couvert partout via le footer unifié (2026-08-03) ; pas de lien direct vers `/` (la landing) dans la sidebar, mais les pages MM y reviennent via le titre du site dans la masthead
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
- [ ] **Version monochrome blanche** pour fonds sombres (t-shirts, stickers, watermark)
- [ ] **Version monochrome navy** pour impression monochrome
- [ ] **Wordmark horizontal** : logo à gauche + "En Veille" en Fraunces 500 à droite — pour les en-têtes
- [ ] **Version "stacked"** : logo en haut + "En Veille" en dessous — pour avatars carrés (Twitch, X, GitHub)

Le script `docs/design/assets/clean_figma_svg.py` est à utiliser après chaque export Figma.

---

## 🌐 Autres surfaces à unifier

### `vferries.github.io/cv`
- [x] Audit : HTML/JS vanilla, CSS custom properties déjà alignées palette En Veille
- [x] Appliquer Fraunces (display + tagline italique) + Inter (body)
- [x] Header : brand strip avec logo + wordmark "En Veille · CV", lien retour
- [x] Bonus : OG card 1200×630 dédiée + favicon kit (SVG/ICO/PNG) + print refondu (photo carrée 150px, navy partout, typo 0.78rem → CV tient sur 2 pages)
- [ ] Footer du CV (section SOCIAL) : à voir si on aligne avec le footer du blog ou on laisse le ton CV-centric

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
- [ ] Ajouter `jekyll-redirect-from` et créer des redirects si des URLs ont bougé
- [x] **Konami code sur Firefox, Chrome et WebKit** → vérifié le 2026-08-05 sous Playwright, et un bug non lié au moteur en est sorti : le message « bien joué, curieux. » était en `position: absolute` sur un body statique, donc ancré au **document**, alors que le canvas est en `fixed`. Or les flèches du code scrollent la page en cours de saisie — 80px sur Chrome, 138px sur Firefox. Sur une page déjà scrollée le message sortait de l'écran (mesuré à top -2500px pour un viewport de 800). Passé en `fixed`. La détection, elle, lit `e.key` : rien de spécifique à un moteur
  - **Safari iOS : rien à tester**, l'easter egg est inatteignable sans clavier physique
  - WebKit 26.5 (moteur de Safari desktop) couvert dans la foulée : déclenchement et centrage OK page en haut comme scrollée, rendu du canvas et de la Fraunces italique conformes. Il réclame `libevent-2.1-7t64`, `libavif16` et `libmanette-0.2-0` côté système
- [x] **`prefers-reduced-transparency`** → fait le 2026-08-05 : les trois surfaces qui empilaient fond translucide et `backdrop-filter` (nav collante scrollée, panneau burger ≤720px, pastilles de quick-nav) passent opaques et sans flou. Le fond reprend `--ev-bg`, donc il suit light/dark sans règle en plus. Le panneau burger garde sa contrainte `max-width: 720px`, sans quoi la règle peindrait un fond derrière les liens de la nav desktop. Vérifié sous Chrome via CDP à 1280 et 375px. Firefox n'implémente pas encore la requête et ignore le bloc
- [ ] Mentions légales (SIREN si EI/société) — manque pour conformité
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
- Un toggle dark/light manuel en plus du `prefers-color-scheme` auto
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
