/* ============================================================
   En Veille — barre du haut
   Chargé sur toutes les pages, à la différence de landing.js qui ne sert que
   le layout landing. Vanilla, sans dépendance, défensif : si le markup
   n'est pas là, on sort sans rien casser.
   ============================================================ */

(function () {
  'use strict';

  // ==========================================================
  // ANCRES — rend la main au navigateur
  // Le thème instancie SmoothScroll('a[href*="#"]', { offset: 20 }) : un
  // scroll programmatique qui calcule lui-même la position finale et ignore
  // donc `scroll-margin-top`. Son offset de 20px datait d'une barre en
  // position: relative ; la barre est maintenant sticky et haute de 65px,
  // et la cible atterrissait 45px dessous.
  // SmoothScroll sort si `event.target.closest('[data-scroll-ignore]')`
  // matche : poser l'attribut sur <body> neutralise l'interception partout,
  // sans toucher au thème ni ajouter un 4ᵉ shadow de partial. La navigation
  // redevient native, donc honore `scroll-margin-top` — et reste fluide via
  // `html { scroll-behavior: smooth }` (enveille.css), qui repasse en `auto`
  // sous prefers-reduced-motion.
  // ==========================================================
  document.body.setAttribute('data-scroll-ignore', '');

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
    // Le panneau précède le bouton dans le DOM (la barre garde l'ordre
    // visuel desktop) : sans déplacement du focus, Tab après ouverture
    // partait dans la page et il fallait Shift+Tab pour atteindre le menu.
    // Pattern menu-button : focus sur le premier lien à l'ouverture, retour
    // sur le bouton à la fermeture par Escape. Pas de vol de focus sur le
    // clic extérieur — l'utilisateur vient de choisir une autre cible.
    const setOpen = (open, focus) => {
      nav.classList.toggle('ev-nav--open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open && focus) { const first = menu.querySelector('a'); if (first) first.focus(); }
      if (!open && focus) btn.focus();
    };
    btn.addEventListener('click', () => setOpen(!nav.classList.contains('ev-nav--open'), true));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !nav.classList.contains('ev-nav--open')) return;
      setOpen(false, true);
    });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('ev-nav--open')) return;
      if (!e.target.closest('.ev-nav')) setOpen(false);
    });
    // À tenir en phase avec le `@media (max-width: 1000px)` d'enveille.css qui
    // affiche le burger : sinon le panneau reste ouvert en passant en desktop.
    matchMedia('(min-width: 1001px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  })();

  // ==========================================================
  // RECHERCHE — toggle, état ARIA, Escape, moteur paresseux
  // Le panneau .search-content vient du thème, mais plus aucun script MM
  // ne tourne (footer_scripts a retiré main.min.js — jQuery et plugins
  // morts) : le toggle vit ici, et le moteur (lunr.min, lunr-store,
  // ev-search) n'est chargé qu'à la première ouverture — 57 Ko + parse
  // épargnés partout ailleurs.
  // ==========================================================
  (function initSearchToggle() {
    const btn = document.querySelector('.ev-nav__search');
    const panel = document.querySelector('.search-content');
    if (!btn || !panel) return;
    if (!panel.id) panel.id = 'search-content';
    btn.setAttribute('aria-controls', panel.id);
    const content = document.querySelector('.initial-content');
    const input = panel.querySelector('input#search');

    let enginePromise = null;
    const loadScript = (src) => new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('échec de chargement : ' + src));
      document.head.appendChild(s);
    });
    // lunr-store définit `store`, consommé par ev-search : ordre strict.
    // Chemins en dur : le site est servi à la racine (cf. ev-nav.html).
    const ensureEngine = () => {
      if (!enginePromise) {
        enginePromise = loadScript('/assets/js/lunr/lunr.min.js')
          .then(() => loadScript('/assets/js/lunr/lunr-store.js'))
          .then(() => loadScript('/assets/js/ev-search.js'))
          .catch((err) => {
            enginePromise = null; // on retentera au prochain clic
            console.warn('[ev-nav] moteur de recherche non chargé', err);
          });
      }
      return enginePromise;
    };

    const setOpen = (open) => {
      panel.classList.toggle('is--visible', open);
      if (content) content.classList.toggle('is--hidden', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) {
        ensureEngine();
        // Le markup MM livre l'input en tabindex="-1" (panneau caché) :
        // on le rend au flux de tabulation une fois visible.
        if (input) { input.tabIndex = 0; input.focus(); }
      }
    };
    btn.addEventListener('click', () => setOpen(!panel.classList.contains('is--visible')));
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !panel.classList.contains('is--visible')) return;
      setOpen(false);
      btn.focus();
    });
  })();

  // ==========================================================
  // THÈME — toggle manuel jour/nuit, 2 états, persisté
  // Défaut = système (aucun data-theme sur <html>). Le choix mémorisé est
  // posé avant la première peinture par le script inline de
  // head/ev-assets.html ; ici on ne gère que le clic et ses reflets
  // (aria-label, meta theme-color). L'icône bascule en CSS pur via la
  // paire de sélecteurs data-theme / media (bloc jumeau, enveille.css).
  // ==========================================================
  (function initThemeToggle() {
    const btn = document.querySelector('.ev-nav__theme');
    if (!btn) return;
    const systemDark = matchMedia('(prefers-color-scheme: dark)');
    const effective = () =>
      document.documentElement.dataset.theme || (systemDark.matches ? 'dark' : 'light');
    // Mêmes valeurs que les <meta name="theme-color"> de head/ev-assets.html
    const BAR_COLORS = { light: '#001B3D', dark: '#000331' };
    const sync = () => {
      const theme = effective();
      btn.setAttribute('aria-label',
        theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre');
      // Les deux metas portent un media= que l'override ne peut pas
      // satisfaire : on aligne leur contenu sur le thème effectif pour que
      // la barre d'adresse mobile suive aussi.
      document.querySelectorAll('meta[name="theme-color"]')
        .forEach((m) => { m.setAttribute('content', BAR_COLORS[theme]); });
    };
    btn.addEventListener('click', () => {
      const next = effective() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('ev-theme', next);
      } catch (err) {
        console.warn('[ev-nav] thème non persisté (storage indisponible)', err);
      }
      sync();
    });
    // L'OS peut changer de thème en cours de visite : tant qu'aucun choix
    // manuel n'est posé, aria-label et theme-color doivent suivre.
    systemDark.addEventListener('change', sync);
    sync();
  })();

})();
