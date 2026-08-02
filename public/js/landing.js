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
  //    (graceful fallback se IntersectionObserver mancante)
  // ==========================================================
  function initReveal() {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(function (el) {
      observer.observe(el);
    });
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
      // Tempo per parola: ~85ms = ritmo conversazionale lento
      var perWord = 85;
      spans.forEach(function (span, idx) {
        setTimeout(function () { span.classList.add('is-visible'); }, idx * perWord);
      });
      // Nascondi cursore finale dopo l'ultima parola
      setTimeout(function () {
        cursorEl.style.opacity = '0';
        textEl.setAttribute('aria-hidden', 'false');
        block.classList.add('is-done');
      }, spans.length * perWord + 350);
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
  // ==========================================================
  function initMobileStickyCta() {
    var sticky = document.getElementById('sticky-cta-mobile');
    if (!sticky) return;

    var hero = document.querySelector('.hero');
    if (!hero || !('IntersectionObserver' in window)) {
      // fallback: mostra sempre su mobile se hero non trovato
      if (window.matchMedia('(max-width: 720px)').matches) {
        sticky.classList.add('is-shown');
        sticky.setAttribute('aria-hidden', 'false');
      }
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // sticky visibile solo quando l'hero NON è più in viewport
        var heroOut = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        if (heroOut) {
          sticky.classList.add('is-shown');
          sticky.setAttribute('aria-hidden', 'false');
        } else {
          sticky.classList.remove('is-shown');
          sticky.setAttribute('aria-hidden', 'true');
        }
      });
    }, { threshold: 0 });

    io.observe(hero);
  }

  // ==========================================================
  // Bootstrap
  // ==========================================================
  function init() {
    initReveal();
    initTypewriter();
    initMobileStickyCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
