# Nav unifiée — plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Servir la même barre du haut (`_includes/ev-nav.html`) sur toutes les pages du site, en remplaçant la masthead de Minimal Mistakes.

**Architecture:** Un shadow de `_includes/masthead.html` délègue à `ev-nav.html`. Les styles `.ev-nav*` migrent de `landing.css` (chargé sur 2 pages) vers `enveille.css` (chargé partout). Les deux IIFE de nav sortent de `landing.js` vers un `assets/js/nav.js` chargé des deux côtés. La recherche du thème survit parce qu'elle s'accroche par classe.

**Tech Stack:** Jekyll 3.10 + Minimal Mistakes 4.28.0 en `remote_theme`, CSS custom properties (pas de préprocesseur), JS vanilla sans build. Vérifications sous Playwright (`playwright-core` dans `tools/work-videos/node_modules`).

## Global Constraints

- Spec de référence : `docs/superpowers/specs/2026-08-05-nav-unifiee-design.md`.
- **Les URLs des billets ne changent jamais.** Aucune tâche ne touche un permalink.
- CSS : custom properties uniquement, pas de préprocesseur. Classes landing préfixées `.ev-`.
- JS : vanilla, pas de framework, pas de build step.
- Commits en français, préfixes conventionnels (`feat:`, `fix:`, `refactor:`, `docs:`). Pas de co-signature.
- `_includes/masthead.html` sera appelé par le thème via `include_cached` : **aucune variable de page (`page.*`) ne doit y entrer**, le rendu est mis en cache et réutilisé.
- Breakpoint mobile : 720px.
- Ne jamais lancer `bundle exec jekyll build` depuis `_site/` — le `cd` persiste entre appels Bash et produit un `_site/_site/` parasite. Toujours revenir à la racine du repo.
- Le serveur de test local (`python3 -m http.server`) ne résout pas les extensions : `/privacy` y répond 404 alors qu'il répond 200 en prod. Ne pas diagnostiquer sur cette base.

---

## Préambule commun à toutes les tâches

Le site tourne en local et les vérifications passent par un serveur statique.

**Démarrer le serveur** (une fois, depuis la racine du repo) :

```bash
cd /home/vincent/projects/blog
bundle exec jekyll build --quiet
(cd _site && python3 -m http.server 8099 --bind 127.0.0.1 >/dev/null 2>&1 &)
```

**Après chaque modification**, rebuilder depuis la racine :

```bash
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
```

**Lancer un script Playwright** :

```bash
NODE_PATH=/home/vincent/projects/blog/tools/work-videos/node_modules node <script.js>
```

Chromium n'est pas dans le cache Playwright pour cette version : utiliser le Chrome système via `launch({channel:'chrome'})`. Firefox et WebKit se lancent sans option.

---

## Task 1 : Capturer l'état de référence

Sans référence chiffrée, on ne saura pas si la recherche ou la greedy-nav ont régressé.

**Files:**
- Create: `/tmp/claude-nav/baseline.js` (script jetable, hors repo)

**Interfaces:**
- Produces: un fichier `/tmp/claude-nav/baseline.json` que les tâches 6 et 7 comparent.

- [ ] **Step 1: Écrire le script de référence**

```javascript
// /tmp/claude-nav/baseline.js
const playwright = require('playwright-core');
const fs = require('fs');
const URL = 'http://127.0.0.1:8099';

async function sonde(page, chemin, largeur) {
  await page.setViewportSize({ width: largeur, height: 800 });
  await page.goto(URL + chemin, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  return await page.evaluate(() => {
    const bar = document.querySelector('.ev-nav, .masthead');
    const s = bar ? getComputedStyle(bar) : null;
    return {
      barre: bar ? bar.className : 'ABSENTE',
      hauteur: bar ? Math.round(bar.getBoundingClientRect().height) : -1,
      position: s ? s.position : null,
      nbLiens: document.querySelectorAll('.ev-nav__links a, .visible-links a').length,
      boutonRecherche: !!document.querySelector('.search__toggle'),
      panneauRecherche: !!document.querySelector('.search-content'),
      skipNav: !!document.querySelector('#site-nav'),
      debordePage: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
}

(async () => {
  const b = await playwright.chromium.launch({ channel: 'chrome' });
  const page = await b.newPage();
  const erreurs = [];
  page.on('pageerror', e => erreurs.push(e.message.split('\n')[0]));

  const out = {};
  for (const chemin of ['/', '/blog/', '/ARC-Welder/', '/about/', '/tags/']) {
    for (const largeur of [1280, 720, 375]) {
      out[`${chemin}@${largeur}`] = await sonde(page, chemin, largeur);
    }
  }

  // Recherche : taper au clavier, fill() ne déclenche pas l'écouteur
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(URL + '/blog/', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.click('.search__toggle');
  await page.waitForTimeout(300);
  await page.click('#search');
  await page.keyboard.type('devoxx', { delay: 80 });
  await page.waitForTimeout(1500);
  out.recherche = await page.evaluate(() => {
    const r = document.getElementById('results');
    return { nbEnfants: r ? r.children.length : -1,
             entete: r && r.children[0] ? r.children[0].textContent.trim() : null };
  });
  out.erreursConsole = erreurs;

  fs.writeFileSync('/tmp/claude-nav/baseline.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.recherche), '| erreurs:', erreurs.length);
  await b.close();
})();
```

- [ ] **Step 2: Exécuter et vérifier la référence**

```bash
mkdir -p /tmp/claude-nav
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
(cd _site && python3 -m http.server 8099 --bind 127.0.0.1 >/dev/null 2>&1 &)
sleep 1
NODE_PATH=/home/vincent/projects/blog/tools/work-videos/node_modules node /tmp/claude-nav/baseline.js
```

Attendu : `{"nbEnfants":11,"entete":"10 Résultat(s) trouvé(s)"}`.

Si le nombre de résultats diffère, **ne pas continuer** : la référence doit refléter l'état réel avant travaux. Noter la valeur obtenue et l'utiliser comme référence dans les tâches suivantes.

- [ ] **Step 3: Pas de commit**

Ce script est jetable et vit hors du repo. Rien à committer.

---

## Task 2 : Faire porter à `ev-nav` l'id, la recherche et le rôle de source unique

**Files:**
- Modify: `_includes/ev-nav.html`

**Interfaces:**
- Consumes: rien.
- Produces: un include acceptant trois paramètres — `root` (préfixe des ancres, `""` sur `/`, `"/"` ailleurs), `current` (slug pour `aria-current`), et **`search`** (booléen ; affiche le bouton de recherche quand vrai).

- [ ] **Step 1: Ajouter l'id `site-nav` et le bouton de recherche**

Remplacer les lignes 6-8 de `_includes/ev-nav.html` :

```html
<!-- NAV -->
<nav class="ev-nav" id="ev-top">
  <div class="ev-nav__inner">
```

par :

```html
<!-- NAV -->
{% comment %}
  id="site-nav" sur la <nav> : cible du lien d'évitement de skip-links.html.
  id="ev-top" descend sur .ev-nav__inner — le seul usage restant est l'ancre
  `href="#ev-top"` du dot Hero de la quick-nav, dont le clic est de toute façon
  intercepté par landing.js (preventDefault + scrollTo(0)). L'id ne sert donc
  que de cible sans JS, et l'inner est au même endroit de la page.
{% endcomment %}
<nav class="ev-nav" id="site-nav">
  <div class="ev-nav__inner" id="ev-top">
```

Puis, juste avant `</div>` fermant `.ev-nav__inner` (après le `</button>` du burger), insérer :

```html
    {% if include.search %}
      {% comment %}
        La classe search__toggle est ce à quoi le script du thème s'accroche
        ($(".search__toggle").on("click", …)). Le panneau .search-content est
        rendu par default.html, pas ici. Conditionné par include.search et non
        par site.search : le layout landing n'a pas de panneau, le bouton y
        serait inerte.
      {% endcomment %}
      <button class="search__toggle ev-nav__search" type="button">
        <span class="visually-hidden">{{ site.data.ui-text[site.locale].search_label | default: "Rechercher" }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
        </svg>
      </button>
    {% endif %}
```

- [ ] **Step 2: Mettre à jour le commentaire d'en-tête de l'include**

Remplacer le bloc `{% comment %}` des lignes 1-5 par :

```html
{% comment %}
  Barre du haut, source unique du site — landing, pages ev-* et pages du thème.
  root    : préfixe des liens ancre — vide sur `/`, "/" sur les autres pages.
  current : slug de la page courante, pour aria-current (ex: "realisations").
  search  : affiche le bouton de recherche. À ne passer que depuis le shadow de
            masthead.html : seul le layout du thème rend le panneau associé.
{% endcomment %}
```

- [ ] **Step 3: Rebuilder et vérifier que la landing n'a pas bougé**

```bash
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
grep -c 'id="site-nav"' _site/index.html          # attendu : 1
grep -c 'search__toggle' _site/index.html          # attendu : 0 (pas de search passé)
grep -c 'id="ev-top"' _site/index.html             # attendu : 1
```

- [ ] **Step 4: Commit**

```bash
git add _includes/ev-nav.html
git commit -m "refactor: prépare ev-nav à servir de barre unique

Ajoute id=\"site-nav\", cible du lien d'évitement de skip-links.html côté
thème, sans retirer ev-top dont la landing se sert comme ancre de retour.

Ajoute un bouton de recherche optionnel portant la classe search__toggle, à
laquelle le script du thème s'accroche. Il est conditionné par include.search
et non par site.search : le layout landing ne rend aucun panneau
.search-content, le bouton y serait inerte."
```

---

## Task 3 : Déplacer les styles de la nav vers `enveille.css`

Les règles sont **déplacées**, pas copiées : deux jeux dans deux fichiers rejoueraient la divergence qu'on corrige.

**Files:**
- Modify: `assets/css/landing.css` (retirer la ligne 100 et les lignes 102-233)
- Modify: `assets/css/enveille.css` (recevoir ces règles, retirer le bloc masthead)

**Interfaces:**
- Consumes: rien.
- Produces: `.ev-nav`, `.ev-nav__inner`, `.ev-nav__brand`, `.ev-nav__links`, `.ev-nav__status`, `.ev-status-dot`, `.ev-nav__burger`, `.ev-nav__power`, `.ev-nav__status-item`, `@keyframes ev-nav-border`, `@keyframes ev-crt-on`, et `[id] { scroll-margin-top: 84px }` disponibles sur **toutes** les pages.

- [ ] **Step 1: Couper les règles de `landing.css`**

Retirer de `assets/css/landing.css` :
- la ligne 100 : `[id] { scroll-margin-top: 84px; }`
- les lignes 102 à 233 incluses : le commentaire de section `NAV`, toutes les règles `.ev-nav*` / `.ev-status-dot`, le bloc `@media (max-width: 720px)` qui les concerne (lignes 197-225) et `@keyframes ev-crt-on` (lignes 226-233).

**Ne pas toucher** aux trois autres blocs `@media (max-width: 720px)` du fichier (lignes 498, 1139, 1243) ni au bloc `prefers-reduced-transparency` (1274) : ils concernent d'autres composants.

- [ ] **Step 2: Coller dans `enveille.css` en remplacement du bloc masthead**

Dans `assets/css/enveille.css`, supprimer le bloc `/* Nav top (masthead) */` (lignes 142-161 : `.masthead`, `.site-title`, `.site-subtitle`, `.greedy-nav`, `.greedy-nav a`, `.greedy-nav .visible-links a:before`) — ce markup n'est plus rendu.

À la place, coller les règles coupées à l'étape 1, précédées de :

```css
/* ============================================================
   NAV — barre du haut, identique sur toutes les pages.
   Vit ici et non dans landing.css : ce dernier n'est chargé que par
   le layout landing, alors que la barre est désormais rendue partout.
   ============================================================ */
```

Ajouter à la suite le style du bouton de recherche, qui n'existait pas dans `landing.css` :

```css
.ev-nav__search {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; padding: 0;
  background: none; border: 1px solid transparent; border-radius: 50%;
  color: var(--ev-text-muted); cursor: pointer;
  transition: color 200ms var(--ease-out), border-color 200ms var(--ease-out);
}
.ev-nav__search:hover { color: var(--ev-text); border-color: var(--ev-border-strong); }
```

- [ ] **Step 3: Vérifier que rien n'a été perdu ni dupliqué**

```bash
cd /home/vincent/projects/blog
for r in '\.ev-nav {' '\.ev-nav__inner' '\.ev-nav__brand' '\.ev-nav__links' '\.ev-nav__status' '\.ev-status-dot' '\.ev-nav__burger' '\.ev-nav__power' 'ev-nav-border' 'ev-crt-on' 'scroll-margin-top'; do
  printf "%-24s landing=%s enveille=%s\n" "$r" \
    "$(grep -c "$r" assets/css/landing.css)" "$(grep -c "$r" assets/css/enveille.css)"
done
```

Attendu : `landing=0` partout, `enveille>=1` partout. Un `landing` non nul signale une règle oubliée, un `enveille` à 0 une règle perdue.

```bash
grep -c 'masthead\|greedy-nav\|site-title\|site-subtitle' assets/css/enveille.css   # attendu : 0
```

- [ ] **Step 4: Rebuilder et vérifier la landing**

```bash
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
```

La landing doit être visuellement inchangée : les règles ont changé de fichier, mais les deux feuilles y sont chargées.

- [ ] **Step 5: Commit**

```bash
git add assets/css/landing.css assets/css/enveille.css
git commit -m "refactor: déplace les styles de la nav dans enveille.css

landing.css n'est chargé que par le layout landing, alors que la barre va
être rendue sur toutes les pages. Les règles .ev-nav*, leurs keyframes, le bloc
responsive 720px et la règle [id] { scroll-margin-top } déménagent donc dans
enveille.css, chargé partout.

Déplacées et non copiées : deux jeux de règles dans deux fichiers
rejoueraient exactement la divergence que ce chantier corrige.

Retire au passage le bloc masthead, dont le markup ne sera plus rendu, et
ajoute le style du bouton de recherche."
```

---

## Task 4 : Extraire les deux IIFE de nav vers `assets/js/nav.js`

**Files:**
- Create: `assets/js/nav.js`
- Modify: `assets/js/landing.js` (retirer les lignes 233-267)
- Modify: `_includes/head/custom.html` (charger le script)
- Modify: `_layouts/landing.html` (charger le script)

**Interfaces:**
- Consumes: le markup `.ev-nav`, `.ev-nav__burger`, `#ev-nav-menu` produit par la tâche 2.
- Produces: rien que d'autres tâches consomment. Les deux IIFE sont autonomes et défensives (`if (!nav) return`).

- [ ] **Step 1: Créer `assets/js/nav.js`**

```javascript
/* ============================================================
   En Veille — barre du haut
   Chargé sur toutes les pages, à la différence de landing.js qui ne sert que
   le layout landing. Vanilla, sans dépendance, défensif : si le markup
   n'est pas là, on sort sans rien casser.
   ============================================================ */

(function () {
  'use strict';

  // ==========================================================
  // NAV — applique le backdrop-filter uniquement quand on a scrollé
  // (le blur est coûteux à recalculer à chaque frame quand sticky)
  // ==========================================================
  (function initNavScroll() {
    const nav = document.querySelector('.ev-nav');
    if (!nav) return;
    const update = () => nav.classList.toggle('ev-nav--scrolled', window.scrollY > 4);
    update();
    window.addEventListener('scroll', update, { passive: true });
  })();

  // ==========================================================
  // BURGER MOBILE — power-on CRT
  // ==========================================================
  (function initBurger() {
    const nav = document.querySelector('.ev-nav');
    const btn = document.querySelector('.ev-nav__burger');
    const menu = document.getElementById('ev-nav-menu');
    if (!nav || !btn || !menu) return;
    const setOpen = (open) => {
      nav.classList.toggle('ev-nav--open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => setOpen(!nav.classList.contains('ev-nav--open')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('ev-nav--open')) return;
      if (!e.target.closest('.ev-nav')) setOpen(false);
    });
    matchMedia('(min-width: 721px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  })();

})();
```

- [ ] **Step 2: Retirer les deux IIFE de `landing.js`**

Supprimer les lignes 233 à 267 incluses (le commentaire `NAV — applique le backdrop-filter…`, `initNavScroll`, le commentaire `BURGER MOBILE`, `initBurger`).

Les laisser en place doublerait les écouteurs sur la landing : chaque clic sur le burger basculerait l'état deux fois, donc pas du tout.

- [ ] **Step 3: Charger le script des deux côtés**

Ajouter à la fin de `_includes/head/custom.html` :

```html
<!-- Barre du haut : burger + backdrop-filter au scroll. Chargé ici pour les
     pages du thème ; le layout landing, autonome, le déclare de son côté. -->
<script defer src="{{ '/assets/js/nav.js' | relative_url }}"></script>
```

Et dans `_layouts/landing.html`, juste avant la balise `landing.js` :

```html
  <script defer src="{{ '/assets/js/nav.js' | relative_url }}"></script>
```

`landing.html` n'inclut pas `head/custom.html` — il redéclare fontes et feuilles en propre. Ne poser le script qu'à un seul endroit laisserait la landing sans burger.

- [ ] **Step 4: Vérifier le chargement et l'absence de doublon**

```bash
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
grep -c 'nav\.js' _site/index.html            # attendu : 1
grep -c 'nav\.js' _site/ARC-Welder/index.html # attendu : 1
grep -c 'initBurger\|initNavScroll' _site/assets/js/landing.js  # attendu : 0
grep -c 'initBurger' _site/assets/js/nav.js   # attendu : 1
```

- [ ] **Step 5: Vérifier qu'un seul écouteur répond sur la landing**

```javascript
// /tmp/claude-nav/burger-simple.js
const playwright = require('playwright-core');
(async () => {
  const b = await playwright.chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 375, height: 800 } });
  await p.goto('http://127.0.0.1:8099/', { waitUntil: 'load' });
  await p.waitForTimeout(700);
  await p.click('.ev-nav__burger');
  await p.waitForTimeout(400);
  const ouvert = await p.evaluate(() => document.querySelector('.ev-nav').classList.contains('ev-nav--open'));
  console.log('un clic ouvre le panneau :', ouvert, ouvert ? '' : '← double écouteur probable');
  await b.close();
})();
```

Attendu : `true`. Un `false` signale que l'IIFE tourne deux fois.

- [ ] **Step 6: Commit**

```bash
git add assets/js/nav.js assets/js/landing.js _includes/head/custom.html _layouts/landing.html
git commit -m "refactor: sort les deux IIFE de nav dans assets/js/nav.js

landing.js n'est chargé que par le layout landing ; la barre va être rendue
sur toutes les pages et lui faut donc son propre véhicule.

initNavScroll part avec initBurger, et pas seulement lui : c'est cette IIFE
qui pose .ev-nav--scrolled, donc elle seule qui déclenche le backdrop-filter.
L'oublier livrerait une barre translucide qui ne floute jamais rien.

Le script est déclaré à deux endroits parce que _layouts/landing.html est
autonome : il n'inclut pas head/custom.html. Ne le poser que là laisserait la
landing sans burger.

Les IIFE sont retirées de landing.js dans le même mouvement : les garder aux
deux endroits doublerait les écouteurs et chaque clic basculerait l'état deux
fois, donc pas du tout."
```

---

## Task 5 : Remplacer la masthead par la nav partagée

C'est la tâche qui bascule les pages du thème.

**Files:**
- Create: `_includes/masthead.html`
- Delete: `_data/navigation.yml`

**Interfaces:**
- Consumes: `ev-nav.html` et son paramètre `search` (tâche 2), les styles (tâche 3), le JS (tâche 4).
- Produces: rien.

- [ ] **Step 1: Créer le shadow**

```html
{% comment %}
  Shadow du partial du thème. Les layouts Minimal Mistakes l'incluent via
  include_cached : le rendu est mis en cache et réutilisé, donc AUCUNE
  variable de page (page.*) ne doit entrer ici. C'est la même règle que pour
  _includes/footer.html.

  Conséquence : le paramètre `current` de ev-nav (qui pose aria-current) ne
  peut pas transiter par ce chemin. Il reste réservé à l'appel direct depuis
  _pages/realisations.html, qui n'est pas mis en cache.
{% endcomment %}
{% include ev-nav.html root="/" search=true %}
```

- [ ] **Step 2: Supprimer `_data/navigation.yml`**

```bash
git rm _data/navigation.yml
```

Plus rien ne le lit : il ne pilotait que `.visible-links` de la masthead. Le laisser en place ferait un fichier éditable sans effet, exactement le genre d'écart qui coûte une session de debug plus tard. Les liens se modifient désormais dans `_includes/ev-nav.html`.

- [ ] **Step 3: Rebuilder et vérifier la bascule**

```bash
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
grep -c 'class="masthead"' _site/ARC-Welder/index.html   # attendu : 0
grep -c 'class="ev-nav"' _site/ARC-Welder/index.html      # attendu : 1
grep -c 'search__toggle' _site/ARC-Welder/index.html      # attendu : 1
grep -c 'id="site-nav"' _site/ARC-Welder/index.html       # attendu : 1
grep -c 'search__toggle' _site/index.html                 # attendu : 0
```

- [ ] **Step 4: Vérifier qu'aucune page n'a perdu sa barre**

```bash
cd /home/vincent/projects/blog
total=$(find _site -name '*.html' | wc -l)
avec=$(grep -rl 'class="ev-nav"' _site --include='*.html' | wc -l)
echo "$avec / $total pages portent la barre"
```

Attendu : les deux nombres sont égaux.

- [ ] **Step 5: Commit**

```bash
git add _includes/masthead.html _data/navigation.yml
git commit -m "feat: sert la même barre du haut sur toutes les pages

Le shadow de masthead.html délègue à ev-nav.html : les pages du thème
portent désormais la barre de la landing, logo chouette, pastille et burger
power-on compris.

Le partial est appelé via include_cached, donc aucune variable de page n'y
entre — même contrainte que footer.html. Le paramètre current d'ev-nav reste
donc réservé à l'appel direct depuis realisations.html.

_data/navigation.yml disparaît : il ne pilotait que les liens de la masthead
et plus rien ne le lit. Le garder inerte serait un piège, les liens vivent
maintenant dans ev-nav.html."
```

---

## Task 6 : Vérifier les fonctions du thème survivantes

La bascule retire du markup dont des scripts du thème dépendent. Cette tâche cherche activement la casse.

**Files:**
- Create: `/tmp/claude-nav/regression.js` (jetable)

**Interfaces:**
- Consumes: `/tmp/claude-nav/baseline.json` (tâche 1).

- [ ] **Step 1: Écrire le script de régression**

```javascript
// /tmp/claude-nav/regression.js
const playwright = require('playwright-core');
const URL = 'http://127.0.0.1:8099';

(async () => {
  const b = await playwright.chromium.launch({ channel: 'chrome' });
  const page = await b.newPage({ viewport: { width: 1280, height: 800 } });
  const erreurs = [];
  // Capturer la STACK et pas seulement le message : l'erreur Disqus connue a
  // pour message « Cannot read properties of null (reading 'appendChild') »,
  // où le mot « disqus » n'apparaît nulle part — il n'est que dans la stack.
  // Filtrer sur le message laisserait passer 3 fausses régressions (mesuré en
  // tâche 1 : 3 occurrences, toutes Disqus).
  page.on('pageerror', e => erreurs.push({ msg: e.message.split('\n')[0], stack: e.stack || '' }));

  // 1. Aucune erreur console sur les pages du thème (greedy-nav n'a plus son markup)
  for (const chemin of ['/blog/', '/ARC-Welder/', '/about/', '/tags/', '/categories/']) {
    await page.goto(URL + chemin, { waitUntil: 'load' });
    await page.waitForTimeout(800);
  }
  const horsDisqus = erreurs.filter(e => !/disqus/i.test(e.stack) && !/disqus/i.test(e.msg));
  console.log('erreurs console hors Disqus :', horsDisqus.length ? horsDisqus.map(e => e.msg) : 'aucune');
  console.log('  (dont Disqus, attendues et hors périmètre :', erreurs.length - horsDisqus.length, ')');

  // 2. La recherche répond toujours — taper au clavier, pas fill()
  await page.goto(URL + '/blog/', { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.click('.search__toggle');
  await page.waitForTimeout(300);
  await page.click('#search');
  await page.keyboard.type('devoxx', { delay: 80 });
  await page.waitForTimeout(1500);
  console.log('recherche :', JSON.stringify(await page.evaluate(() => {
    const r = document.getElementById('results');
    return { nbEnfants: r ? r.children.length : -1,
             entete: r && r.children[0] ? r.children[0].textContent.trim() : null };
  })));

  // 3. Le lien d'évitement atteint la barre
  await page.goto(URL + '/ARC-Welder/', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  console.log('cible du skip-link présente :', await page.evaluate(() =>
    !!document.querySelector('a[href="#site-nav"]') && !!document.getElementById('site-nav')));

  // 4. Une ancre de billet ne finit pas sous la barre
  console.log('ancres :', JSON.stringify(await page.evaluate(() => {
    const cible = document.querySelector('.page__content [id]');
    if (!cible) return { pasDAncre: true };
    cible.scrollIntoView();
    const bar = document.querySelector('.ev-nav').getBoundingClientRect();
    const c = cible.getBoundingClientRect();
    return { sousLaBarre: c.top >= bar.bottom, margeTop: Math.round(c.top - bar.bottom) };
  })));

  await b.close();
})();
```

- [ ] **Step 2: Exécuter**

```bash
cd /home/vincent/projects/blog && bundle exec jekyll build --quiet
NODE_PATH=/home/vincent/projects/blog/tools/work-videos/node_modules node /tmp/claude-nav/regression.js
```

Attendu :
- `erreurs console hors Disqus : aucune` — une erreur ici vient probablement de `jquery.greedy-navigation.js`, qui ne trouve plus son markup. Si elle apparaît, la traiter avant de continuer.
- `recherche : {"nbEnfants":11,"entete":"10 Résultat(s) trouvé(s)"}` — identique à la référence de la tâche 1.
- `cible du skip-link présente : true`
- `ancres : {"sousLaBarre":true,...}`

L'erreur Disqus (`Cannot read properties of null (reading 'appendChild')`) est **antérieure** au chantier et hors périmètre : elle est filtrée volontairement.

- [ ] **Step 3: Corriger si nécessaire, sinon passer**

Si greedy-nav jette, **lire d'abord la stack** pour savoir ce qui manque :

```bash
NODE_PATH=/home/vincent/projects/blog/tools/work-videos/node_modules node -e "
const pw = require('playwright-core');
(async () => {
  const b = await pw.chromium.launch({channel:'chrome'});
  const p = await b.newPage();
  p.on('pageerror', e => console.log(e.stack.split('\n').slice(0,6).join('\n')));
  await p.goto('http://127.0.0.1:8099/ARC-Welder/', {waitUntil:'load'});
  await p.waitForTimeout(1200);
  await b.close();
})();
"
```

Masquer en CSS ne servirait à rien : une erreur JS se produit que l'élément soit visible ou non. Le correctif consiste à **fournir le markup minimal que le script attend**, inerte, dans le shadow `_includes/masthead.html` — typiquement un `<nav id="site-nav" class="greedy-nav">` vide, ou les `<ul class="visible-links">` / `<ul class="hidden-links">` que la stack désigne.

N'appliquer ce correctif **que si l'erreur est constatée**, et le décrire dans le message de commit avec la ligne de stack qui l'a motivé.

- [ ] **Step 4: Commit (seulement s'il y a eu un correctif)**

```bash
git add -A
git commit -m "fix: neutralise greedy-nav privée de son markup"
```

---

## Task 7 : Vérifier le rendu, le responsive et les préférences

**Files:**
- Create: `/tmp/claude-nav/rendu.js` (jetable)

- [ ] **Step 1: Écrire le script de rendu**

```javascript
// /tmp/claude-nav/rendu.js
const playwright = require('playwright-core');
const URL = 'http://127.0.0.1:8099';
const CIBLES = [['/', 'landing'], ['/blog/', 'blog'], ['/ARC-Welder/', 'billet'], ['/about/', 'about']];

(async () => {
  const b = await playwright.chromium.launch({ channel: 'chrome' });
  for (const [chemin, nom] of CIBLES) {
    for (const w of [1280, 720, 375]) {
      const p = await b.newPage({ viewport: { width: w, height: 800 } });
      await p.goto(URL + chemin, { waitUntil: 'load' });
      await p.waitForTimeout(700);
      const r = await p.evaluate(() => {
        const nav = document.querySelector('.ev-nav');
        const bg = document.querySelector('.ev-nav__burger');
        return {
          hauteur: nav ? Math.round(nav.getBoundingClientRect().height) : -1,
          position: nav ? getComputedStyle(nav).position : null,
          burger: bg ? getComputedStyle(bg).display !== 'none' : null,
          deborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      console.log(`${nom.padEnd(8)} ${String(w).padEnd(5)} ${JSON.stringify(r)}`);
      await p.screenshot({ path: `/tmp/claude-nav/${nom}-${w}.png` });
      await p.close();
    }
  }
  await b.close();
})();
```

- [ ] **Step 2: Exécuter et lire les captures**

```bash
NODE_PATH=/home/vincent/projects/blog/tools/work-videos/node_modules node /tmp/claude-nav/rendu.js
```

Attendu, sur les quatre pages : `position: "sticky"`, `deborde: false`, `burger: false` à 1280 et `true` à 720 et 375. Les hauteurs doivent être identiques d'une page à l'autre à largeur égale.

Ouvrir les 12 captures. Vérifier en particulier :
- la sidebar auteur des billets (elle est `sticky`) ne glisse pas sous la barre ;
- la pastille « Disponible » sur un billet — c'est une conséquence assumée, mais elle se juge sur le rendu ;
- le panneau de recherche et le panneau burger passent au-dessus de la barre, pas dessous.

- [ ] **Step 3: Vérifier le burger sur les pages du thème**

```javascript
// /tmp/claude-nav/burger-theme.js
const playwright = require('playwright-core');
(async () => {
  const b = await playwright.chromium.launch({ channel: 'chrome' });
  const p = await b.newPage({ viewport: { width: 375, height: 800 } });
  await p.goto('http://127.0.0.1:8099/ARC-Welder/', { waitUntil: 'load' });
  await p.waitForTimeout(700);
  const ouvre = async () => p.evaluate(() => document.querySelector('.ev-nav').classList.contains('ev-nav--open'));
  await p.click('.ev-nav__burger'); await p.waitForTimeout(400);
  console.log('ouvre au clic       :', await ouvre());
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log('ferme sur Escape    :', !(await ouvre()));
  await p.click('.ev-nav__burger'); await p.waitForTimeout(400);
  await p.setViewportSize({ width: 1100, height: 800 }); await p.waitForTimeout(400);
  console.log('ferme au resize     :', !(await ouvre()));
  await b.close();
})();
```

Les trois lignes doivent afficher `true`.

- [ ] **Step 4: Vérifier `prefers-reduced-transparency` sur une page du thème**

```javascript
// /tmp/claude-nav/transparence.js
const playwright = require('playwright-core');
(async () => {
  const b = await playwright.chromium.launch({ channel: 'chrome' });
  for (const reduce of [false, true]) {
    const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
    if (reduce) {
      const cdp = await p.context().newCDPSession(p);
      await cdp.send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
    }
    await p.goto('http://127.0.0.1:8099/ARC-Welder/', { waitUntil: 'load' });
    await p.waitForTimeout(600);
    console.log(reduce ? 'reduce' : 'défaut', JSON.stringify(await p.evaluate(() => {
      const n = document.querySelector('.ev-nav');
      n.classList.add('ev-nav--scrolled');
      const s = getComputedStyle(n);
      return { fond: s.backgroundColor, backdrop: s.backdropFilter };
    })));
    await p.close();
  }
  await b.close();
})();
```

Attendu : fond translucide + `blur(14px)` par défaut, fond opaque + `none` en `reduce`.

- [ ] **Step 5: Vérifier Firefox et WebKit**

```bash
NODE_PATH=/home/vincent/projects/blog/tools/work-videos/node_modules node -e "
const pw = require('playwright-core');
(async () => {
  for (const nom of ['firefox','webkit']) {
    const b = await pw[nom].launch();
    const p = await b.newPage({viewport:{width:1280,height:800}});
    const err = [];
    // Filtrer sur la stack : le mot « disqus » n'est pas dans le message
    p.on('pageerror', e => err.push((e.stack || '') + ' ' + e.message));
    await p.goto('http://127.0.0.1:8099/ARC-Welder/', {waitUntil:'load'});
    await p.waitForTimeout(900);
    console.log(nom, JSON.stringify(await p.evaluate(() => {
      const n = document.querySelector('.ev-nav'), s = getComputedStyle(n);
      return { position: s.position, bordure: s.borderBottomColor };
    })), '| erreurs:', err.filter(e => !/disqus/i.test(e)).length);
    await b.close();
  }
})();
"
```

Sur Firefox, `animation-timeline` n'est pas supporté : la bordure basse reste transparente. C'est la dégradation déjà en vigueur sur la landing, désormais étendue aux pages du thème — attendu, pas un défaut.

- [ ] **Step 6: Commit des ajustements éventuels**

S'il a fallu retoucher un `z-index` ou le `top` de la sidebar :

```bash
git add assets/css/enveille.css
git commit -m "fix: ajuste les empilements sous la barre collante"
```

---

## Task 8 : Mettre à jour la documentation

**Files:**
- Modify: `CLAUDE.md` (symlink vers `AGENTS.md`)
- Modify: `NEXT.md`

- [ ] **Step 1: Corriger `AGENTS.md`**

Trois passages deviennent faux :

1. Dans la liste des fichiers, `_includes/ev-nav.html : nav partagée landing ↔ pages ev-*` devient :

```markdown
- `_includes/ev-nav.html` : **barre du haut, source unique de toutes les pages**. `_includes/masthead.html` (shadow du thème) la rend sur les pages Minimal Mistakes, `index.html` et `_pages/realisations.html` l'incluent directement. Le shadow passe par `include_cached` : n'y mettre aucune variable de page
- `assets/js/nav.js` : burger + backdrop-filter au scroll. Chargé par `head/custom.html` **et** par `_layouts/landing.html`, ce dernier n'incluant pas le premier
```

2. La section « Coexistence billets ↔ nouveau design » affirme que la landing « utilise au contraire une nav custom `.ev-nav` qui remplace la masthead ». Remplacer par :

```markdown
La nav `.ev-nav` est désormais servie **partout**, y compris sur les pages du thème, via un shadow de `_includes/masthead.html`. Ses styles vivent dans `enveille.css` (chargé partout), pas dans `landing.css`. `_data/navigation.yml` a été supprimé : il ne pilotait que la masthead d'origine.
```

3. La ligne `_includes/head/custom.html : chargement fonts + CSS/JS (le bloc landing.css/landing.js est conditionné par {% if page.is_landing %})` est **fausse depuis un moment** : ce fichier ne contient aucun bloc conditionnel, `landing.css` et `landing.js` sont chargés par `_layouts/landing.html`. Remplacer par :

```markdown
- `_includes/head/custom.html` : favicons, fontes, `enveille.css`, `nav.js`. Ne charge **pas** `landing.css`/`landing.js` — c'est `_layouts/landing.html`, autonome, qui les déclare
```

- [ ] **Step 2: Cocher l'entrée dans `NEXT.md`**

Ajouter sous la section « Améliorations techniques » :

```markdown
- [x] **Barre du haut unifiée** → 2026-08-05 : `ev-nav` sert toutes les pages via un shadow de `_includes/masthead.html`. Spec : `docs/superpowers/specs/2026-08-05-nav-unifiee-design.md`
  - Les deux barres divergeaient en **mécanisme**, pas qu'en style : la landing bascule sur un breakpoint fixe à 720px, `greedy-nav` déplaçait les liens un à un selon la place et ne repliait rien avant ~400px
  - La recherche survit sans JS : son panneau vient de `default.html` et son script s'accroche par classe, donc un bouton `.search__toggle` dans `ev-nav` suffit. Il est conditionné par `include.search`, le layout landing n'ayant pas de panneau
  - `skip-links.html` pointe sur `#site-nav` : `ev-nav` porte désormais cet id en plus de `ev-top`
  - **3ᵉ shadow de partial** après `footer.html` et `head/custom.html` — à rediffer à chaque bump de `remote_theme`
```

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md NEXT.md
git commit -m "docs: acte la barre du haut unifiée

Corrige au passage une affirmation fausse depuis un moment dans AGENTS.md :
head/custom.html ne contient aucun bloc conditionné par page.is_landing,
landing.css et landing.js sont déclarés par _layouts/landing.html."
```

---

## Vérification finale avant push

```bash
cd /home/vincent/projects/blog
bundle exec jekyll build --quiet
total=$(find _site -name '*.html' | wc -l)
avec=$(grep -rl 'class="ev-nav"' _site --include='*.html' | wc -l)
echo "$avec / $total pages portent la barre"                         # les deux doivent être égaux
grep -rc 'class="masthead"' _site --include='*.html' | grep -v ':0'  # aucune sortie
python3 tools/og-card/test_generate_posts.py 2>&1 | tail -1          # OK
git status --short                                                   # arbre propre
```

Puis demander à Vincent avant de pousser : la bascule touche toutes les pages et la pastille « Disponible » apparaît sur les billets, ce qui se juge en regardant.
