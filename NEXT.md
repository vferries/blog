# NEXT — roadmap En Veille

État au 27 avril 2026, après audit complet du site. Priorités de haut en bas.

---

## 🔥 Maintenant

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

- [ ] **Footers désynchronisés** :
  - Landing : `© AAAA — RSS — Fait à Toulouse with :heart: and chocolatines`
  - Pages MM (/blog/, billets, /about/) : icônes Twitter/GitHub/Twitch via `_config.yml` `footer.links`, sans email ni RSS
  - Décider : aligner les deux, ou assumer la différence ?
- [ ] **Sidebar des billets (`author_profile`)** :
  - Avatar `profile_square.png` ✓ (cohérent avec landing depuis le commit du jour)
  - Pas de lien direct vers `/` (la landing) ni vers RSS
  - Sur `/about/`, sidebar désactivée (`author_profile: false` dans le front matter) — l'intro de la page suffit
- [x] **Liens Twitter** : URLs migrées vers `x.com` (`_config.yml` ×2 + `index.html` ×1). Icônes (`fa-twitter`, SVG croix) volontairement conservées — choix visuel séparé.
- [ ] **Email** : partout `vincent.ferries@gmail.com` — garder Gmail ou créer `vincent@enveille.info` une fois le DNS prêt ?

### Photo

- [x] Faire/choisir une photo de Vincent pour la section "À propos" (utilise `profile_square.png` en attendant mieux)
- [x] Dans `index.html`, remplacer le bloc `.ev-photo__placeholder` par `<img>`

### Page `/about/` à rafraîchir

- [x] Refonte complète de la page (commit `eb74219`)
- [x] Garder la partie "Pourquoi ce nom ?" (storytelling conservé)
- [x] Ajouter une section parcours freelance, missions types
- [x] Retirer l'image `/images/peinard.jpg` en header (plus aucune référence dans le repo)

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

Le script `.claude/assets/clean_figma_svg.py` est à utiliser après chaque export Figma.

---

## 🌐 Autres surfaces à unifier

### `vferries.github.io/cv`
- [ ] Audit : stack actuelle, date de dernier refresh, cohérence avec la marque ?
- [ ] Appliquer les tokens (`enveille.css` importable) et Fraunces/Inter
- [ ] Header avec le nouveau logo + wordmark
- [ ] Footer cohérent avec le blog

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

- [ ] **OpenGraph par billet** : générer une image cohérente par défaut (template avec titre + logo) — sinon le partage d'un billet n'a pas d'image dédiée
- [ ] **Optimiser le poids des images dans `_posts/`** (beaucoup > 200 Ko)
- [ ] **28/46 billets sans `header:`** image → liste `/blog/` visuellement déséquilibrée. Ajouter un fallback header (gradient + titre) côté CSS, ou laisser tel quel
- [ ] Ajouter `jekyll-redirect-from` et créer des redirects si des URLs ont bougé
- [ ] Vérifier le comportement du Konami code sur Firefox / Safari iOS
- [ ] Regarder `prefers-reduced-transparency` pour les effets de blur
- [ ] Mentions légales (SIREN si EI/société) — manque pour conformité
- [ ] Vérifier que `:heart:` du footer landing est bien rendu par jemoji
- [x] **Compteur dans CLAUDE.md à jour** : 46 billets

### Landing — passage en prod (vérifications restantes)

- [ ] Vérifier la nav sur mobile (le status "Disponible" peut déborder)
- [ ] Vérifier les 3 billets en preview sont bien les plus récents (logique = `sort:date | reverse | limit:3`, OK technique mais à valider visuellement)
- [ ] Tester en prod sur `www.enveille.info` après chaque change

---

## 💡 Idées qu'on n'a pas tranchées

- Un badge "Disponible jusqu'à tel mois" qui se met à jour automatiquement via un data file (remplace le `Disponible` statique de la nav)
- Un "onglet" live Twitch qui apparaît uniquement quand le stream est on (via l'API Twitch)
- Une page `/projets/` avec mini-études de cas de missions passées (avec accord clients)
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
- Trancher Gmail vs `vincent@enveille.info`
- Trancher SIREN/mentions légales
- Fournir la photo studio dédiée (en remplacement de `profile_square.png`)
- Valider les accords clients pour études de cas
- Publier sur Twitch/X les nouveaux assets
