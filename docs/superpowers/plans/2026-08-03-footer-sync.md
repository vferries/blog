# Footer unifié En Veille — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Le footer une-ligne de la landing (`© AAAA En Veille — RSS — Fait à Toulouse with :heart: and chocolatines`) devient le footer de toutes les pages, y compris celles rendues par Minimal Mistakes.

**Architecture:** Un `_includes/footer.html` local shadowe le partial du remote theme (les layouts MM l'incluent déjà dans `<div class="page__footer"><footer>…`). `_includes/ev-footer.html` (landing, `/realisations/`) devient un wrapper qui inclut la même source. La typo de la ligne migre de `landing.css` vers `enveille.css` (chargé partout).

**Tech Stack:** Jekyll + Minimal Mistakes (remote_theme), CSS custom properties, jemoji. Vérification : build Jekyll + grep du HTML généré + screenshots playwright-core (Chrome système).

## Global Constraints

- Spec approuvé : `docs/superpowers/specs/2026-08-03-footer-sync-design.md`
- Copy exacte de la ligne : `© {{ site.time | date: "%Y" }} En Veille — <a href="{{ '/feed.xml' | relative_url }}">RSS</a> — Fait à Toulouse with :heart: and chocolatines`
- Pas de nouvelle dépendance, pas de framework JS, CSS custom properties uniquement
- Classes custom préfixées `.ev-` (ne pas casser Minimal Mistakes)
- URLs des billets intouchées
- Commits : convention FR (`feat:`, `docs:`), pas de co-auteur, direct sur `main` (repo solo)
- Un commit feature (Task 1) + un commit docs roadmap (Task 2)

---

### Task 1: Footer partagé — markup, styles, config, vérification

**Files:**
- Create: `_includes/footer.html`
- Modify: `_includes/ev-footer.html` (fichier entier, 3 lignes)
- Modify: `assets/css/enveille.css` (section `/* Footer */`, ~ligne 199)
- Modify: `assets/css/landing.css` (bloc `.ev-footer`, lignes 1236-1244)
- Modify: `_config.yml` (suppression bloc `footer:`, lignes 74-84)

**Interfaces:**
- Consumes: rien (les appelants `index.html:321` et `_pages/realisations.html:55` incluent déjà `ev-footer.html` et ne changent pas)
- Produces: `_includes/footer.html` = source unique du contenu footer, classe CSS `.ev-footer__line` stylée globalement dans `enveille.css`

- [ ] **Step 1: Baseline — constater l'état actuel (le « test qui échoue »)**

```bash
cd /home/vincent/projects/blog
bundle exec jekyll build
grep -c 'page__footer-follow\|Powered by' _site/blog/index.html
```

Expected: build OK, compteur ≥ 2 (le footer thème est encore là — c'est ce qu'on va faire disparaître).

- [ ] **Step 2: Créer `_includes/footer.html` (override du thème, source unique)**

Contenu exact du fichier :

```html
<p class="ev-footer__line">© {{ site.time | date: "%Y" }} En Veille — <a href="{{ '/feed.xml' | relative_url }}">RSS</a> — Fait à Toulouse with :heart: and chocolatines</p>
```

- [ ] **Step 3: Réduire `_includes/ev-footer.html` à un wrapper**

Contenu exact du fichier (remplace tout) :

```html
<footer class="ev-footer">
  {% include footer.html %}
</footer>
```

- [ ] **Step 4: Ajouter `.ev-footer__line` dans `assets/css/enveille.css`**

Dans la section `/* Footer */` (~ligne 199), après le bloc `.page__footer-copyright, .page__footer-follow { … }`, ajouter :

```css
/* Ligne footer partagée landing ↔ pages MM (_includes/footer.html) */
.ev-footer__line {
  margin: 0;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.8;
  color: var(--ev-text-subtle);
}
.ev-footer__line a { color: var(--ev-text-muted); }
.ev-footer__line a:hover { color: var(--ev-blue); }
```

- [ ] **Step 5: Réduire `.ev-footer` au layout dans `assets/css/landing.css`**

Remplacer (lignes 1236-1244) :

```css
.ev-footer {
  padding: 48px 32px 64px;
  text-align: center;
  color: var(--ev-text-subtle);
  font-family: var(--font-mono); font-size: 0.8125rem;
  line-height: 1.8;
}
.ev-footer a { color: var(--ev-text-muted); }
.ev-footer a:hover { color: var(--ev-blue); }
```

par :

```css
.ev-footer {
  padding: 48px 32px 64px;
}
```

- [ ] **Step 6: Supprimer le bloc `footer:` de `_config.yml`**

Supprimer exactement ces lignes (74-84) — plus rien ne les consomme après l'override :

```yaml
footer:
  links:
    - label: "Twitter"
      icon: "fab fa-fw fa-twitter-square"
      url: "https://x.com/VincentFERRIES"
    - label: "GitHub"
      icon: "fab fa-fw fa-github"
      url: "https://github.com/vferries"
    - label: "Twitch"
      icon: "fab fa-twitch"
      url: "https://www.twitch.tv/EnVeilleCode"
```

(Ne pas toucher au bloc `author:` juste au-dessus — c'est lui qui alimente la sidebar des billets.)

- [ ] **Step 7: Rebuild et vérifier le HTML généré**

```bash
cd /home/vincent/projects/blog
bundle exec jekyll build
# La ligne unique est partout :
grep -l 'chocolatines' _site/index.html _site/blog/index.html _site/about/index.html _site/realisations/index.html
# Plus aucune trace du footer thème :
grep -c 'page__footer-follow\|Powered by' _site/blog/index.html || echo OK-disparu
# :heart: rendu par jemoji sur une page MM :
grep -o 'chocolatines' _site/blog/index.html && grep -c 'class="emoji"' _site/blog/index.html
```

Expected: les 4 fichiers listés par le premier grep ; deuxième grep → 0 occurrence ; `class="emoji"` ≥ 1 dans `/blog/`. Vérifier aussi un billet : `grep -l 'chocolatines' _site/devoxx-2022-part-1/index.html` doit matcher.

- [ ] **Step 8: Screenshots light/dark du footer (landing + /blog/)**

Écrire `/tmp/claude-1000/-home-vincent-projects-blog/b05bd546-41b4-4441-8aa1-d990eca53a4b/scratchpad/footer-shots.cjs` :

```js
const { chromium } = require('/home/vincent/projects/blog/tools/work-videos/node_modules/playwright-core');
const OUT = '/tmp/claude-1000/-home-vincent-projects-blog/b05bd546-41b4-4441-8aa1-d990eca53a4b/scratchpad/';
const shots = [
  { url: 'http://127.0.0.1:4000/blog/', scheme: 'light', out: 'footer-blog-light.png' },
  { url: 'http://127.0.0.1:4000/blog/', scheme: 'dark', out: 'footer-blog-dark.png' },
  { url: 'http://127.0.0.1:4000/', scheme: 'light', out: 'footer-landing-light.png' },
  { url: 'http://127.0.0.1:4000/', scheme: 'dark', out: 'footer-landing-dark.png' },
];
(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
  for (const s of shots) {
    const ctx = await browser.newContext({ colorScheme: s.scheme, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(s.url, { waitUntil: 'networkidle' });
    const el = page.locator('div.page__footer, footer.ev-footer').last();
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await el.screenshot({ path: OUT + s.out });
    await ctx.close();
  }
  await browser.close();
})();
```

Puis :

```bash
cd /home/vincent/projects/blog
bundle exec jekyll serve --no-watch --detach
node /tmp/claude-1000/-home-vincent-projects-blog/b05bd546-41b4-4441-8aa1-d990eca53a4b/scratchpad/footer-shots.cjs
pkill -f 'jekyll serve'
```

Expected: 4 PNG. Les lire (tool Read) et vérifier : même ligne mono centrée partout, ❤️ rendu, couleurs correctes en light (texte subtil sur fond subtil) et dark, lien RSS visible. Si l'espacement vertical jure sur les pages MM, ajuster le padding de `.page__footer` dans la section `/* Footer */` d'`enveille.css` (et re-screenshoter) avant de committer.

- [ ] **Step 9: Commit**

```bash
cd /home/vincent/projects/blog
git add _includes/footer.html _includes/ev-footer.html assets/css/enveille.css assets/css/landing.css _config.yml
git commit -m "feat: unifie le footer En Veille sur toutes les pages

Override local de _includes/footer.html (source unique incluse aussi par
ev-footer.html). Typo de la ligne déplacée dans enveille.css
(.ev-footer__line), footer.links retiré de _config.yml (mort avec
l'override — les sociaux restent via la sidebar auteur et la CTA landing)."
```

---

### Task 2: Cocher la roadmap et pousser

**Files:**
- Modify: `NEXT.md:50-53` (item « Footers désynchronisés »)

**Interfaces:**
- Consumes: Task 1 committée
- Produces: roadmap à jour, `main` poussé (déploiement GitHub Pages)

- [ ] **Step 1: Cocher l'item dans `NEXT.md`**

Remplacer (lignes 50-53) :

```markdown
- [ ] **Footers désynchronisés** :
  - Landing : `© AAAA — RSS — Fait à Toulouse with :heart: and chocolatines`
  - Pages MM (/blog/, billets, /about/) : icônes Twitter/GitHub/Twitch via `_config.yml` `footer.links`, sans email ni RSS
  - Décider : aligner les deux, ou assumer la différence ?
```

par :

```markdown
- [x] **Footers désynchronisés** → unifiés (2026-08-03) : override local de `_includes/footer.html` = source unique (ligne « © … chocolatines » partout), `footer.links` retiré de `_config.yml`. Les sociaux restent portés par la sidebar auteur des billets et la CTA landing. Spec : `docs/superpowers/specs/2026-08-03-footer-sync-design.md`
```

- [ ] **Step 2: Commit docs**

```bash
cd /home/vincent/projects/blog
git add NEXT.md
git commit -m "docs: coche la synchro des footers dans la roadmap"
```

- [ ] **Step 3: Pousser (déploie en prod via GitHub Pages)**

```bash
git push
```

Expected: push accepté. Vérifier ensuite en prod `https://www.enveille.info/blog/` (footer unifié) une fois le build Pages passé (~1-2 min).
