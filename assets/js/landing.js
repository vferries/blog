/* ============================================================
   En Veille — landing interactivity
   No dependencies, vanilla JS. Tous les effets sont défensifs :
   si une API n'existe pas, on skip, pas de crash.
   ============================================================ */

(function () {
  'use strict';

  // ==========================================================
  // CUSTOM CURSOR (desktop only)
  // ==========================================================
  (function initCursor() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    // La traînée est du mouvement permanent, et sans has-cursor le
    // cursor: none du CSS ne s'applique pas : les réglages OS du pointeur
    // (taille, contraste) restent intacts pour qui demande moins de motion.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const body = document.body;
    const cursor = document.createElement('div');
    cursor.className = 'ev-cursor';
    const trail = document.createElement('div');
    trail.className = 'ev-cursor-trail';
    body.appendChild(cursor);
    body.appendChild(trail);
    body.classList.add('has-cursor');

    let x = 0, y = 0, tx = 0, ty = 0, running = false;
    const animate = () => {
      tx += (x - tx) * 0.2;
      ty += (y - ty) * 0.2;
      trail.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      if (Math.abs(x - tx) < 0.1 && Math.abs(y - ty) < 0.1) {
        running = false;
        return;
      }
      requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      if (!running) { running = true; requestAnimationFrame(animate); }
    });

    const activate = () => cursor.classList.add('active');
    const deactivate = () => cursor.classList.remove('active');
    document.querySelectorAll('a, button, .ev-service, .ev-post, .ev-photo, .ev-nav__brand, .ev-clickable').forEach(el => {
      el.addEventListener('pointerenter', activate);
      el.addEventListener('pointerleave', deactivate);
    });
  })();

  // ==========================================================
  // REVEAL ON SCROLL (IntersectionObserver)
  // ==========================================================
  (function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.ev-reveal, .ev-reveal--stagger').forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.ev-reveal, .ev-reveal--stagger').forEach(el => io.observe(el));
  })();

  // ==========================================================
  // COUNTERS
  // ==========================================================
  (function initCounters() {
    if (!('IntersectionObserver' in window)) return;
    // Le HTML porte déjà les valeurs finales (fallback no-JS) : les remettre
    // à 0 pour les animer imposerait 1,4s de chiffres qui défilent — on ne
    // touche à rien.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const animateCount = (el, target) => {
      const em = el.querySelector('em');
      if (!em) return;
      const start = performance.now();
      const dur = 1400;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        em.textContent = Math.round(target * ease(t));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target, +e.target.dataset.count);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => {
      // Le HTML porte la valeur finale (visible sans JS) : on repart de 0 avant d'animer
      const em = el.querySelector('em');
      if (em) em.textContent = '0';
      io.observe(el);
    });
  })();

  // ==========================================================
  // MAGNETIC HERO TITLE
  // ==========================================================
  (function initMagneticTitle() {
    if (!matchMedia('(hover: hover)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = document.querySelector('.ev-hero__title');
    const hero = document.querySelector('.ev-hero');
    if (!el || !hero) return;
    let rx = 0, ry = 0, tx = 0, ty = 0, running = false;
    const animate = () => {
      rx += (tx - rx) * 0.08;
      ry += (ty - ry) * 0.08;
      el.style.transform = `translate(${rx}px, ${ry}px)`;
      if (Math.abs(tx - rx) < 0.05 && Math.abs(ty - ry) < 0.05) {
        running = false;
        return;
      }
      requestAnimationFrame(animate);
    };
    const kick = () => { if (!running) { running = true; requestAnimationFrame(animate); } };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = (e.clientX - cx) / r.width * 14;
      ty = (e.clientY - cy) / r.height * 8;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  })();

  // ==========================================================
  // HERO OWL — scrub vidéo au scroll (pin), envol à la libération
  // ==========================================================
  (function initHeroOwl() {
    const SPLIT = 1.4;            // s — fin de la portion scrubée (tête + yeux)
    const POWER_THRESHOLD = 0.5;  // progression du scrub où les yeux s'allument
    const MIN_SEEK_DELTA = 1 / 24;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const pin = document.querySelector('.ev-hero-pin');
    const hero = document.querySelector('.ev-hero--video');
    const video = hero ? hero.querySelector('.ev-hero__bg') : null;
    if (!pin || !hero || !video) return;

    video.src = matchMedia('(max-width: 720px)').matches
      ? video.dataset.srcMobile
      : video.dataset.src;
    video.load();
    pin.classList.add('ev-hero-pin--on');
    hero.classList.add('ev-hero--scrub');

    // preload="metadata" côté HTML : les 3 Mo du mp4 ne doivent pas
    // concurrencer le poster LCP et les fontes au chargement. Une fois
    // la page chargée, on relève l'indice pour que le scrub trouve ses
    // segments sans attendre le premier seek.
    const warmVideo = () => { video.preload = 'auto'; };
    if (document.readyState === 'complete') warmVideo();
    else window.addEventListener('load', warmVideo, { once: true });

    // La nav sticky est dans le flux au-dessus du wrapper : sans correction,
    // le pin ne s'engage qu'après ~une hauteur de nav de scroll normal
    // (le hero "monte d'un cran" avant de se figer). On remonte le wrapper
    // sous la nav pour que le sticky soit engagé dès scrollY = 0.
    const nav = document.querySelector('.ev-nav');
    const fitUnderNav = () => {
      if (!nav) return;
      pin.style.marginTop = -nav.offsetHeight + 'px';
      // Exposé au CSS : le padding-top mobile du hero s'adosse à la
      // hauteur réelle de la nav au lieu d'un nombre magique
      pin.style.setProperty('--ev-nav-h', nav.offsetHeight + 'px');
    };
    fitUnderNav();
    window.addEventListener('resize', fitUnderNav);

    let flying = false;
    let ticking = false;

    const progress = () => {
      const r = pin.getBoundingClientRect();
      const travel = r.height - innerHeight;
      if (travel <= 0) return 1;
      return Math.min(1, Math.max(0, -r.top / travel));
    };

    const update = () => {
      ticking = false;
      const p = progress();
      hero.classList.toggle('is-powered', p >= POWER_THRESHOLD);
      if (p >= 1) {
        if (!flying) {
          flying = true;
          // Saut direct en bas de page (ancre, End, scroll restauré) :
          // ne pas rejouer la rotation de tête à vitesse réelle
          if (video.readyState >= 1 && video.currentTime < SPLIT) video.currentTime = SPLIT;
          video.play().catch(err => {
            // AbortError attendu quand pause() coupe un play() en vol (re-perchage)
            if (err.name !== 'AbortError') console.warn('hero owl:', err);
          });
        }
        return;
      }
      if (flying) { // remontée : la chouette se reperche, le scrub reprend la main
        flying = false;
        video.pause();
      }
      if (video.readyState >= 1) {
        const t = p * SPLIT;
        if (Math.abs(video.currentTime - t) > MIN_SEEK_DELTA) video.currentTime = t;
      }
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    video.addEventListener('loadedmetadata', update, { once: true });
    update();
  })();

  // ==========================================================
  // 3D TILT on service cards
  // ==========================================================
  (function initTilt() {
    if (!matchMedia('(hover: hover)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.ev-service').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 6;
        const rx = (0.5 - py) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  })();

  // ==========================================================
  // QUICK-NAV (show after hero, active section tracking)
  // ==========================================================
  (function initQuickNav() {
    const qnav = document.getElementById('ev-quick-nav');
    if (!qnav) return;
    const hero = document.querySelector('.ev-hero');
    const dots = Array.from(qnav.querySelectorAll('.ev-quick-nav__dot'));

    // Chaque dot suit une section VISIBLE réelle. Le dot "Hero" suit le
    // hero (sticky, il remplit le viewport pendant le pin), pas la <nav>
    // #ev-top : trop courte pour être « la section du haut », elle
    // n'allumait jamais son dot. On associe élément -> data-target.
    const tracked = [
      ['.ev-hero',     'ev-top'],
      ['#services',    'services'],
      ['#realisations','realisations'],
      ['#about',       'about'],
      ['#blog',        'blog'],
      ['#contact',     'contact'],
    ].map(([sel, target]) => [document.querySelector(sel), target])
     .filter(([el]) => el);

    // #ev-top est .ev-nav__inner, à l'intérieur de la <nav> sticky : il est
    // donc toujours en haut du viewport, et cliquer le dot Hero via l'ancre
    // est un no-op — le navigateur juge la cible déjà en place. On remonte
    // explicitement en haut. behavior par défaut = suit le scroll-behavior
    // CSS et prefers-reduced-motion, comme les ancres natives des autres dots.
    qnav.addEventListener('click', (e) => {
      const dot = e.target.closest('.ev-quick-nav__dot');
      if (!dot || dot.dataset.target !== 'ev-top') return;
      e.preventDefault();
      window.scrollTo({ top: 0 });
    });

    let current = null;
    const setActive = (target) => {
      if (target === current) return;
      current = target;
      dots.forEach(d => d.classList.toggle('active', d.dataset.target === target));
    };

    const update = () => {
      // Afficher la quick-nav une fois le hero passé.
      const trigger = hero ? hero.getBoundingClientRect().bottom : innerHeight;
      qnav.classList.toggle('on', trigger < innerHeight * 0.3);

      // Bas de page : la dernière section est souvent trop courte pour
      // que son haut atteigne la ligne de détection — on la force.
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
        setActive(tracked[tracked.length - 1][1]);
        return;
      }

      // Ligne de détection à 15 % du haut du viewport. La section active
      // est la dernière dont le haut a franchi cette ligne, c.-à-d. celle
      // qui occupe le haut de l'écran — exactement l'ancre atteinte au
      // clic sur un dot. Un seul « gagnant » possible : plus de décalage.
      const lineY = innerHeight * 0.15;
      let active = tracked[0][1];
      for (const [el, target] of tracked) {
        if (el.getBoundingClientRect().top <= lineY) active = target;
      }
      setActive(active);
    };

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  })();

  // ==========================================================
  // MARQUEE REVERSE ON CLICK
  // ==========================================================
  (function initMarquee() {
    const strip = document.querySelector('.ev-strip');
    const row = document.querySelector('.ev-strip__row');
    if (!strip || !row) return;
    let reversed = false;
    strip.addEventListener('click', () => {
      reversed = !reversed;
      row.style.animationDirection = reversed ? 'reverse' : 'normal';
    });
  })();

  // ==========================================================
  // LOGO EASTER EGG — 5 clicks = body tilt
  // ==========================================================
  (function initLogoEgg() {
    const brand = document.querySelector('.ev-nav__brand');
    if (!brand) return;
    let clicks = 0, lastClick = 0;
    brand.addEventListener('click', (e) => {
      const now = performance.now();
      clicks = (now - lastClick < 1000) ? clicks + 1 : 1;
      lastClick = now;
      if (clicks >= 5) {
        e.preventDefault();
        document.body.style.transition = 'transform 400ms';
        document.body.style.transform = 'rotate(2deg)';
        setTimeout(() => {
          document.body.style.transform = '';
          setTimeout(() => document.body.style.transition = '', 400);
        }, 400);
        clicks = 0;
      }
    });
  })();

  // ==========================================================
  // KONAMI CODE → MATRIX RAIN (for 5 seconds)
  // ==========================================================
  (function initKonami() {
    const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    let idx = 0;
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      const target = code[idx].toLowerCase();
      if (key === target) {
        idx++;
        if (idx === code.length) {
          triggerMatrix();
          idx = 0;
        }
      } else {
        idx = (key === code[0].toLowerCase()) ? 1 : 0;
      }
    });

    function triggerMatrix() {
      // Prevent double-trigger
      if (document.getElementById('ev-matrix')) return;

      const canvas = document.createElement('canvas');
      canvas.id = 'ev-matrix';
      Object.assign(canvas.style, {
        position: 'fixed', inset: '0', zIndex: '99999',
        pointerEvents: 'none',
        background: 'rgba(0, 3, 49, 0.92)',
        transition: 'opacity 500ms ease-out',
      });
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const resize = () => {
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        canvas.style.width = innerWidth + 'px';
        canvas.style.height = innerHeight + 'px';
        ctx.scale(dpr, dpr);
      };
      resize();
      window.addEventListener('resize', resize);

      const chars = '01{[(<>)]}/\\*+-=|λ∞∑∫ΔΩ#$@&%!?'.split('');
      const fontSize = 18;
      const cols = Math.ceil(innerWidth / fontSize);
      const drops = new Array(cols).fill(0).map(() => Math.random() * -50);
      const brightness = new Array(cols).fill(0).map(() => 0.5 + Math.random() * 0.5);

      const overlayText = document.createElement('div');
      Object.assign(overlayText.style, {
        // fixed, comme le canvas : en absolute le bloc se cale sur le document
        // et la saisie du code emporte le message hors de l'écran, les flèches
        // scrollant la page au passage (80px sur Chrome, 138px sur Firefox).
        position: 'fixed', inset: '0', zIndex: '100000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        color: '#00F2FF', fontFamily: "'Fraunces', serif",
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontWeight: '400', fontStyle: 'italic',
        letterSpacing: '-0.02em', textAlign: 'center',
        pointerEvents: 'none', gap: '12px',
      });
      overlayText.innerHTML = `
        <div>bien joué, curieux.</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.85rem;font-style:normal;color:rgba(0,242,255,0.65);letter-spacing:0.1em">> welcome_to_the_matrix.sh</div>
      `;
      canvas.parentNode.appendChild(overlayText);
      overlayText.style.opacity = '0';
      setTimeout(() => { overlayText.style.transition = 'opacity 600ms'; overlayText.style.opacity = '1'; }, 500);

      const start = performance.now();
      const duration = 6000;
      let rafId;

      const cleanup = () => {
        canvas.style.opacity = '0';
        overlayText.style.opacity = '0';
        setTimeout(() => {
          canvas.remove();
          overlayText.remove();
          window.removeEventListener('resize', resize);
        }, 500);
      };

      // Reduced motion : la récompense sans la pluie — le fond assombri et
      // le message restent (même durée de vie), la boucle plein écran de
      // glyphes qui tombent, non.
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setTimeout(cleanup, duration);
        return;
      }

      const draw = () => {
        const elapsed = performance.now() - start;
        // Fade at the end
        if (elapsed > duration) {
          cleanup();
          return;
        }

        ctx.fillStyle = 'rgba(0, 3, 49, 0.08)';
        ctx.fillRect(0, 0, innerWidth, innerHeight);

        ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
        for (let i = 0; i < cols; i++) {
          const y = drops[i] * fontSize;
          if (y > 0) {
            const ch = chars[Math.floor(Math.random() * chars.length)];
            // Lead character : bright cyan
            ctx.fillStyle = '#B8FCFF';
            ctx.fillText(ch, i * fontSize, y);
            // Trail : dim cyan
            if (y > fontSize) {
              ctx.fillStyle = `rgba(0, 242, 255, ${brightness[i] * 0.7})`;
              for (let t = 1; t < 20; t++) {
                const ty = y - t * fontSize;
                if (ty < 0) break;
                const tch = chars[Math.floor(Math.random() * chars.length)];
                const alpha = brightness[i] * (1 - t / 20) * 0.8;
                ctx.fillStyle = `rgba(0, 242, 255, ${alpha})`;
                ctx.fillText(tch, i * fontSize, ty);
              }
            }
          }
          drops[i]++;
          if (drops[i] * fontSize > innerHeight && Math.random() > 0.975) {
            drops[i] = Math.random() * -20;
            brightness[i] = 0.5 + Math.random() * 0.5;
          }
        }
        rafId = requestAnimationFrame(draw);
      };
      rafId = requestAnimationFrame(draw);
    }
  })();

  // ==========================================================
  // RÉALISATIONS — vidéos de scroll jouées à la visibilité
  // Pas d'attribut autoplay : reduced-motion et no-JS => poster.
  // ==========================================================
  (function initWorkVideos() {
    const videos = document.querySelectorAll('.ev-work__video');
    if (!videos.length) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const play = v => {
      v.muted = true;
      v.play().catch(err => {
        // AbortError attendu quand pause() coupe un play() en vol (sortie rapide du viewport)
        if (err.name !== 'AbortError') console.warn('work video:', err);
      });
    };
    if (!('IntersectionObserver' in window)) { videos.forEach(play); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) play(e.target);
        else e.target.pause();
      });
    }, { threshold: 0.25 });
    videos.forEach(v => io.observe(v));
  })();

  // ==========================================================
  // CONSOLE MESSAGE
  // ==========================================================
  console.log(
    '%c\n' +
    '   ╔══════════════════════════════╗\n' +
    '   ║                              ║\n' +
    '   ║   En Veille · since 2011     ║\n' +
    '   ║                              ║\n' +
    '   ║   Veille. Transmettre.       ║\n' +
    '   ║   On bosse ensemble ?        ║\n' +
    '   ║                              ║\n' +
    '   ║ → vincent.ferries@gmail.com  ║\n' +
    '   ║                              ║\n' +
    '   ║   ps: try the konami code 🦉 ║\n' +
    '   ╚══════════════════════════════╝\n',
    'color: #007DA5; font-family: monospace; font-size: 11px;'
  );
})();
