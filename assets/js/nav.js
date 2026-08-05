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
