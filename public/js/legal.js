/* =========================================================================
   ConcorsoAI — legal pages interactions
   - Reveal-on-scroll: TOC e sezioni fade-up leggero all'ingresso viewport
   - single-pass (no stagger): quando il primo .legal-toc entra in viewport,
     tutti gli altri .legal-section/.legal-toc diventano visibili subito.
   - prefers-reduced-motion + IntersectionObserver fallback onesti.
   - Persistenza sessionStorage per evitare re-trigger al back-button.
   ========================================================================= */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initReveal() {
    var targets = document.querySelectorAll('.legal-toc, .legal-section');
    if (!targets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Se l'utente ha già scrollato questa pagina nella sessione, mostra tutto.
    var revealApplied = false;
    try {
      revealApplied = window.sessionStorage.getItem('concorso_legal_reveal') === '1';
    } catch (e) { /* privacy mode */ }
    if (revealApplied) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var first = document.querySelector('.legal-toc');
    if (!first) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        targets.forEach(function (el) { el.classList.add('is-visible'); });
        observer.unobserve(entry.target);
        try { window.sessionStorage.setItem('concorso_legal_reveal', '1'); } catch (e) {}
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    observer.observe(first);
  }

  // ANCORA (TOC link → sezione): scroll-margin-top ereditata dal CSS.
  // Cursore di pagina già a posto grazie a scroll-behavior: smooth globale.

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
