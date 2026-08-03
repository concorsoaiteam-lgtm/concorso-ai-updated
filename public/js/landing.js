/* =============================================================================
   ConcorsoAI — landing interactions
   Vanilla JS, no library. Responsible for:
     1. Fade-in reveal on scroll (IntersectionObserver)
     2. WOW MOMENT — typewriter effect on "Commissario AI" feedback
        triggered when the mockup enters the viewport
     3. Mobile sticky CTA show/hide after hero scroll

   Honors prefers-reduced-motion (WCAG 2.3.3).
   ============================================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================================
  // 1. Reveal-on-scroll via IntersectionObserver
  //    Tre categorie: (a) .reveal generico (fade+slide-up).
  //                     (b) .section-num chapter marker (fade+4px slide).
  //                     (c) .h2 headline (fade+8px slide, no delay).
  //    (graceful fallback se IntersectionObserver mancante)
  // ==========================================================
  // Per evitare "enginnered" repetition: il reveal-on-scroll si applica solo
  // al primo .section-num visibile in pagina (S01). Al suo scatto, tutti i
  // restanti .reveal/.section-num/.h2 diventano visibili immediatamente.
  // Persistito via sessionStorage per non riapplicare a ritorno pagina.
  // Pattern file 06 P7 gerarchia visiva: una sola "firma" di entrata,
  // no stagger ripetuto su tutte le sezioni.
  function initReveal() {
    var targets = document.querySelectorAll('.reveal, .section-num, .h2');
    if (!targets.length) return;

    // Honor prefers-reduced-motion + fallback no-IntersectionObserver
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Se l'utente ha giá visitato la pagina nella sessione, renderizza tutto.
    var revealApplied = false;
    try {
      revealApplied = window.sessionStorage.getItem('concorso_reveal_first_seen') === '1';
    } catch (e) { /* privacy-mode: fail-safe */ }
    if (revealApplied) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Single observer sul primo .section-num: quando entra in viewport,
    // sblocca tutti gli altri target. Evita stagger ripetuto (file 06/07).
    var firstSectionNum = document.querySelector('section .section-num');
    if (!firstSectionNum) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        // Marca tutti i restanti come visibili per ridurre stagger-cascade.
        targets.forEach(function (el) {
          if (el !== entry.target) el.classList.add('is-visible');
        });
        observer.unobserve(entry.target);
        try { window.sessionStorage.setItem('concorso_reveal_first_seen', '1'); } catch (e) {}
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    observer.observe(firstSectionNum);
  }

  // ==========================================================
  // 2. WOW MOMENT — typewriter effect on Commissario AI feedback
  //    Quando la mockup entra in viewport, il testo del feedback
  //    viene "scritto" parola per parola. Il cursore finale lampeggia
  //    mentre la scrittura è in corso, poi scompare a fine scrittura.
  // ==========================================================
  function initTypewriter() {
    var block = document.querySelector('.mockup-feedback');
    if (!block) return;

    var textEl = block.querySelector('.mockup-feedback-text');
    var cursorEl = block.querySelector('.mockup-cursor-final');
    if (!textEl || !cursorEl) return;

    // data-text è la fonte canonica del testo che verrà "scritto".
    // L'aria-label del paragrafo genitore fornisce lo stesso testo
    // a screen reader / no-JS fallback senza duplicazione.
    var fullText = block.getAttribute('data-text') || '';

    fullText = fullText.trim();
    if (fullText.length === 0) return;

    var confidenceTarget = parseInt(block.getAttribute('data-confidence'), 10) || 0;
    var confidenceEl = block.querySelector('.mockup-feedback-confidence-num');

    // Reduced motion o no-JS fallback → mostra tutto subito
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      textEl.textContent = fullText;
      textEl.setAttribute('aria-hidden', 'false');
      cursorEl.style.opacity = '0';
      block.classList.add('is-done');
      return;
    }

    // Prepara: il testo è inizialmente vuoto, splittato in parole
    var words = fullText.split(/\s+/);
    var spans = [];
    for (var i = 0; i < words.length; i++) {
      var span = document.createElement('span');
      span.className = 'mockup-feedback-word';
      span.textContent = words[i];
      spans.push(span);
      textEl.appendChild(span);
      // spazio tra le parole (tranne dopo l'ultima)
      if (i < words.length - 1) {
        textEl.appendChild(document.createTextNode(' '));
      }
    }

    function startTyping() {
      // Pause "thinking" col skeleton SHIMMER prima di partire con le parole:
      // 850ms = "l'AI sta pensando" → poi typewriter.
      // block has already class="is-loading" by HTML default; remove triggers skeleton fade-out.
      // Il reveal del testo avviene solo DOPO la pausa.
      setTimeout(function () {
        block.classList.remove('is-loading');
        var perWord = 85;
        spans.forEach(function (span, idx) {
          setTimeout(function () { span.classList.add('is-visible'); }, idx * perWord);
        });
        // Confidence badge si anima dopo l'ultima parola
        var totalTyping = spans.length * perWord + 280;
        setTimeout(function () {
          cursorEl.style.opacity = '0';
          textEl.setAttribute('aria-hidden', 'false');
          block.classList.add('is-done');
          // Anima confidenza 0 → target in 720ms ease-out, solo se > 0
          if (confidenceEl && confidenceTarget > 0 && !prefersReducedMotion) {
            var start = null;
            var dur = 720;
            function step2(ts) {
              if (start === null) start = ts;
              var p = Math.min(1, (ts - start) / dur);
              var eased = 1 - (1 - p) * (1 - p);
              confidenceEl.textContent = String(Math.round(confidenceTarget * eased));
              if (p < 1) window.requestAnimationFrame(step2);
              else confidenceEl.textContent = String(confidenceTarget);
            }
            window.requestAnimationFrame(step2);
          } else if (confidenceEl) {
            confidenceEl.textContent = String(confidenceTarget);
          }
        }, totalTyping);
      }, 850); // skeleton duration
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          startTyping();
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 }); // abbastanza dentro viewport

    io.observe(block);
  }

  // ==========================================================
  // 3. Mobile sticky CTA — visibile solo dopo che l'hero esce
  //    da viewport. Su desktop è sempre nascosto (display:none CSS).
  //
  //    P14 file 18: auto-hide su footer — la sticky bar NON deve
  //    coprire i link legal (privacy, ToS) del footer. Logica:
  //    visibile solo se hero FUORI viewport E footer NON visibile.
  // ==========================================================
  function initMobileStickyCta() {
    var sticky = document.getElementById('sticky-cta-mobile');
    if (!sticky) return;

    var isMobile = window.matchMedia('(max-width: 720px)').matches;
    if (!isMobile) {
      // Su desktop la barra non esiste (display:none CSS).
      // Settiamo aria-hidden=true comunque per coerenza semantica.
      sticky.setAttribute('aria-hidden', 'true');
      return;
    }

    var hero = document.querySelector('.hero');
    var footer = document.querySelector('.footer');

    function setShown(shown) {
      if (shown) {
        sticky.classList.add('is-shown');
        sticky.setAttribute('aria-hidden', 'false');
      } else {
        sticky.classList.remove('is-shown');
        sticky.setAttribute('aria-hidden', 'true');
      }
    }

    if (!('IntersectionObserver' in window) || !hero) {
      setShown(true);
      return;
    }

    var heroOut = false;
    var footerIn = false;

    function syncVisibility() {
      // Sticky CTA visibile: hero FUORI viewport AND footer NON visibile AND mobile.
      setShown(heroOut && !footerIn);
    }

    // Pre-seed: se la pagina è già scrollata all'init (utente che torna),
    // evita race condition con IO. Calcoliamo lo stato una volta a mano.
    var heroRect = hero.getBoundingClientRect();
    heroOut = heroRect.bottom < 0;
    if (footer) {
      var footerRect = footer.getBoundingClientRect();
      footerIn = footerRect.top < (window.innerHeight || document.documentElement.clientHeight);
    }
    syncVisibility();

    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        heroOut = !entry.isIntersecting;
        syncVisibility();
      });
    }, { threshold: 0 });
    heroObserver.observe(hero);

    if (footer) {
      var footerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          footerIn = entry.isIntersecting;
          syncVisibility();
        });
      }, { threshold: 0.1 });
      footerObserver.observe(footer);
    } else {
      footerIn = false;
    }
  }

  // ==========================================================
  // 4. Hero counter — numero "184 materie coperte" sale da 0 a target.
  //    Trigger: al primo reveal-on-scroll (single-pass).
  //    Persiste in sessionStorage per non ri-animare al back-button.
  //    Rispetta prefers-reduced-motion (mostra il valore finale subito).
  // ==========================================================
  function initHeroCounter() {
    var counters = document.querySelectorAll('.hero-counter[data-target]');
    if (!counters.length) return;

    // Honor prefers-reduced-motion + no-raf fallback
    if (prefersReducedMotion) {
      counters.forEach(function (el) { el.classList.add('is-counted'); });
      return;
    }

    // Skip if already animated in this session.
    var ran = false;
    try {
      ran = window.sessionStorage.getItem('concorso_counter_done') === '1';
    } catch (e) { /* privacy */ }
    if (ran) {
      counters.forEach(function (el) { el.classList.add('is-counted'); });
      return;
    }

    function animateOne(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      if (!target || target < 1) {
        el.classList.add('is-counted');
        return;
      }
      var duration = 1400; // 1.4s — conversazionale
      var start = null;
      el.textContent = '0';
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min(1, (ts - start) / duration);
        // ease-out quad: 1 - (1-t)^2
        var eased = 1 - (1 - progress) * (1 - progress);
        el.textContent = Math.round(target * eased).toString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = target.toString();
          el.classList.add('is-counted');
          try { window.sessionStorage.setItem('concorso_counter_done', '1'); } catch (e) {}
        }
      }
      window.requestAnimationFrame(step);
    }

    counters.forEach(animateOne);
  }

  // ==========================================================
  // Bootstrap
  // ==========================================================
  function init() {
    initReveal();
    initTypewriter();
    initMobileStickyCta();
    initHeroCounter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
