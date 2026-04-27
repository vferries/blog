# NEXT — roadmap En Veille

État au 23 avril 2026. Priorités de haut en bas.

---

## 🔥 Maintenant

### Landing — passage en prod
- [ ] Appliquer le patch `enveille-landing-patch.zip` (voir `INSTALL.md` dedans)
- [ ] Tester `bundle exec jekyll serve` en local
- [ ] Vérifier les 3 billets en preview sont bien les plus récents
- [ ] Vérifier la nav sur mobile (le status "Disponible" peut déborder)
- [ ] Merger + push vers GitHub
- [ ] Tester en prod sur `www.enveille.info`

### Textes à affiner
- [ ] Valider ou réécrire le lede du hero (actuel : "Je suis Vincent. J'accompagne les équipes tech sur leurs projets de fond…")
- [ ] Vérifier les durées/formats des 5 services — ils sont inventés, à caler sur la réalité
- [ ] Relire la section "Mon approche" (actuelle : "Quinze ans dans le développement…")
- [ ] Choisir entre "depuis 2011" et "15 ans" dans le tag hero — cohérence

---

## ⏭ Prochainement

### Photo
- [x] Faire/choisir une photo de Vincent pour la section "À propos" (utilise `profile_square.png` en attendant mieux)
- [x] Dans `index.html`, remplacer le bloc `.ev-photo__placeholder` par `<img>`

### Page `/about/` à rafraîchir
La page existe mais date de 2015. À aligner avec le nouveau ton "senior tranquille".
- [ ] Garder la partie "Pourquoi ce nom ?" (c'est un bon storytelling)
- [ ] Ajouter une section plus récente : parcours freelance, missions types
- [ ] Retirer l'image `/images/peinard.jpg` en header (trop old-school)

---

## 🎨 Déclinaisons logo (pas encore faites)

Le logo principal existe (`/images/logo.svg`) mais il manque :

- [ ] **Favicon** multi-résolution (16, 32, 48, 64) — probablement une version simplifiée où les power buttons deviennent des points
- [ ] **Favicon SVG** pour les navigateurs récents
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

- [ ] Ajouter `jekyll-redirect-from` et créer des redirects si des URLs ont bougé
- [ ] Optimiser le poids des images dans `_posts/` (beaucoup sont > 200 Ko)
- [ ] OpenGraph par défaut pour les billets (image partage cohérente)
- [ ] Vérifier le comportement du Konami code sur Firefox / Safari iOS
- [ ] Ajouter un `.gitignore` pour `.claude/` si pas déjà présent
- [ ] Regarder `prefers-reduced-transparency` pour les effets de blur

---

## 💡 Idées qu'on n'a pas tranchées

- Un badge "Disponible jusqu'à tel mois" qui se met à jour automatiquement via un data file
- Un "onglet" live Twitch qui apparaît uniquement quand le stream est on (via l'API Twitch)
- Une page `/projets/` avec mini-études de cas de missions passées (avec accord clients)
- Un toggle dark/light manuel en plus du `prefers-color-scheme` auto
- Une version anglaise (ou au moins une bio EN dans le footer) pour clients non-FR

---

## 📦 Prochaines sessions Claude

Ce qui peut être fait en autonomie par Claude Code (commit à la clé) :

- Générer les variantes logo depuis le SVG principal (juste à la main dans un éditeur SVG, ou avec imagemagick pour le favicon .ico)
- Écrire le nouveau `/about/`
- Créer les mini-études de cas `/projets/<slug>.md`
- Auditer + patcher les 3 autres surfaces

Ce qui demande intervention humaine :
- Valider les textes (ton, crédibilité commerciale)
- Fournir la photo
- Valider les accords clients pour études de cas
- Publier sur Twitch/X les nouveaux assets
