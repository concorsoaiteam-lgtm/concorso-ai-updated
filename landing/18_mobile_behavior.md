# 18 — Mobile behavior & responsive UX

> **Scopo**: definire i pattern UX specifici per mobile della landing ConcorsoAI: thumb zone, scroll pattern, touch target, safe-area-inset, mobile sticky CTA, mobile-specific micro-interactions. Sequenza: tutti i file precedenti (psicologia → visual hierarchy → conversion patterns), poi mobile qui. Il mobile è **critical** per PA target: 70%+ del traffico è mobile-first.

---

## Introduzione

### Perché mobile è primary per PA target

Il candidato PA italiano (25-45 anni) consulta la landing:
- **Mobile (smartphone)**: 60-70% del traffico (Statista 2024 Italia).
- **Tablet**: 5-10%.
- **Desktop**: 25-35%.

Mobile = primary. La landing deve funzionare egregiamente su mobile **prima** che su desktop.

Pattern mobile-specific consolidati:
- **Thumb zone**: 1/3 basso del viewport è thumb-reachable (Steven Hoober research, 2012).
- **Touch target**: min 44×44px (Apple HIG), ideal 48×56px.
- **Safe-area-inset**: iOS notch + home indicator non viene coperto da CTA bottom.
- **Sticky bottom CTA**: pattern standard reti di conversione mobile (+15-22% conversion).
- **Mobile scroll**: scroll-mode totale (no scan-mode desktop, no F-pattern rigido).

Riferimenti: Apple Human Interface Guidelines (HIG); Material Design; NN/g Mobile UX (2018-2024); Baymard Mobile UX 2024; Smashing Magazine Mobile (2018-2024); Touch Gesture Reference (Luke Wroblewski); Mobile Fitts' Law (Scott Klemmer 2008).

### Come si applica a ConcorsoAI

Pattern ConcorsoAI:
- Mobile-first CSS (vedi file 09).
- Touch target ≥48px ovunque.
- Mobile sticky CTA bottom-fixed.
- Safe-area-inset iOS.
- Viewport meta configurato correttamente.
- Hero stacked-su-mobile (no overflow orizzontale).

---

## Principi

### P1 — Thumb zone (Apple HIG, Steven Hoober 2012)

Il 60-75% del tempo mobile, l'utente tiene il telefono con una mano. Il pollice raggiunge:
- **Top-quarter**: raramente (richiede stiramento).
- **Mid-quarter**: spesso (navigation).
- **Bottom-quarter**: sempre (CTA + back button).

Conseguenza: CTA primaria mobile in bottom-quarter o bottom-fixed (sticky).

ConcorsoAI:
- **Mobile sticky CTA**: bottom-sticky sempre visibile.
- **Bottom-back**: `<a href="/">Back to top</a>`.
- **Top nav**: solo logo + CTA secondaria (hamburger).

### P2 — Touch target ≥48×48px (Apple HIG)

Apple HIG 44×44pt minimo. WCAG 2.5.5 raccomanda 44×44px minimo. Best practice: 48×48px.

ConcorsoAI:
- **CTA mobile**: min-height 56px (full-width under hero).
- **Button tier mobile**: min-height 56px.
- **FAQ accordion trigger**: min-height 48px.
- **Link in body**: min-height 48px o accompagnato da padding laterale per "tap extension".

Pattern: ogni elemento interactive ha touch target ≥48×48px.

### P3 — Safe-area-inset iOS

iPhone X+ ha notch + home indicator. Elementi bottom-fixed senza safe-area-inset sono in parte fuori schermo.

CSS:
```css
.sticky-mobile-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

ConcorsoAI: ✅ applicato in `public/css/landing.css`.

### P4 — Mobile-first CSS

Scrivere CSS mobile-first, aggiungere enhancement desktop via min-width media query.

```css
/* Mobile-first default */
.hero {
  display: grid;
  grid-template-columns: 1fr;
  padding: 64px 24px;
}

/* Desktop enhancement */
@media (min-width: 768px) {
  .hero {
    grid-template-columns: 7fr 5fr;
    padding: clamp(80px, 8vw, 128px) 32px;
  }
}
```

Pattern: default mobile, desktop enhancement. Niente max-width media query (legacy).

### P5 — Single column mobile, multi-column desktop

Mobile stack verticale. Desktop multi-column. Pattern:

```css
.pricing-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-8);
}

@media (min-width: 768px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

ConcorsoAI: ✅ pricing 2 tier pre-Stripe (Free + Pro). 1-col mobile, 2-col desktop.

### P6 — Hamburger menu mobile <768px

Standard consolidato: mobile = hamburger menu. Niente nav orizzontale compresso.

```html
<nav class="nav">
  <a href="/" class="nav-logo">ConcorsoAI</a>
  
  <div class="nav-links-desktop">
    <a href="#features">Features</a>
    <a href="#pricing">Prezzi</a>
  </div>
  
  <button class="nav-mobile-toggle" aria-label="Menu mobile" aria-expanded="false">
    <span aria-hidden="true">☰</span>
  </button>
  
  <div class="nav-mobile-menu" hidden>
    <a href="#features">Features</a>
    <a href="#pricing">Prezzi</a>
    <a href="/auth">Accedi</a>
  </div>
</nav>
```

ConcorsoAI mobile: hamburger menu + logo + CTA secondaria.

### P7 — Viewport meta correttamente

Viewport meta **obbligatorio**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

`viewport-fit=cover` per estendere in safe-area su iOS X+.
Senza: rendering desktop su mobile, scroll orizzontale.

### P8 — Tap delay rimosso (touch-action: manipulation)

Browser mobile ha delay 300ms su tap. `touch-action: manipulation` lo rimuove:

```css
.btn-cta, .nav-link, .tier-card {
  touch-action: manipulation;
}
```

Pattern: no delay 300ms → click immediato. UX snappy.

### P9 — Font size ≥16px mobile (anti-zoom iOS)

iOS Safari zooma input fields con font-size <16px. Pattern:
- Tutti gli input mobile font-size ≥16px.
- Body mobile font-size ≥16px.

```css
body {
  font-size: clamp(1rem, 0.95rem + 0.2vw, 1.0625rem); /* 16-17px */
}

input, textarea, select {
  font-size: 16px;
}
```

Pattern: nessun zoom iOS automatico.

### P10 — No hover state su mobile (touch: hover:none)

Su mobile non c'è cursore. :hover non si triggera. Pattern:
- :hover styles sono ok (ignorati su mobile).
- :active styles si triggera (touch).
- @media (hover: hover) per mouse-only effects (no mobile).

```css
@media (hover: hover) {
  .btn-cta:hover { background: var(--color-accent-hover); }
}
```

ConcorsoAI: ✅ pattern implementato.

### P11 — Mobile image optimization

- **WebP/AVIF** invece di PNG/JPG (30%+ compressione).
- **`loading="lazy"`** sotto fold (non hero).
- **`decoding="async"`** su immagini non-(above-fold).
- **`srcset`** per retina display.

ConcorsoAI: immagini ottimizzate. Mockup hero eager + first-priority.

### P12 — Gestures native (swipe, tap, long-press)

Pattern mobile-special:
- **Swipe orizzontale** su tab hero → switch tab.
- **Tap** su pill materie → toggle selected.
- **Long-press** su link esterno → preview.

ConcorsoAI: swipe-or-tab-click su mockup 3-tab (entrambi funzionano).

### P13 — No overflow orizzontale su mobile

Pattern: nessun `overflow-x: scroll` o `width: 100vw minus padding`.

ConcorsoAI test: nessun overflow a viewport 360, 414, 768. Validato.

### P14 — Sticky CTA auto-hide su footer visibility

Mobile sticky CTA che copre footer quando questo arriva in viewport = UX terrible.

Pattern JS (IntersectionObserver):
```javascript
const observer = new IntersectionObserver(([entry]) => {
  const cta = document.querySelector('.sticky-mobile-cta');
  cta.style.opacity = entry.isIntersecting ? '0' : '1';
  cta.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
});
document.querySelectorAll('.footer').forEach(el => observer.observe(el));
```

ConcorsoAI: ⏳ in progress ma implementabile rapidamente.

### P15 — Animazioni ridotte su mobile (prefers-reduced-motion + performance)

Mobile ha performance limitata. Pattern:
- **No parallax** (lag notevole).
- **No infinite animations** (battery drain).
- **No hover-triggered animation** (non triggera).
- **prefers-reduced-motion** compliance.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

ConcorsoAI: ✅ prefers-reduced-motion rispettato.

---

## Evidenze

### Steven Hoober (2012) — Touch Zones research

- Studio N=1333 utenti mobile.
- Risultato: 75% interazioni in thumb-zone (1/3 basso a 1/2 destra).
- Pattern: CTA bottom-fixed + thumb-zone = +12-22% conversion.

### Apple Human Interface Guidelines (HIG)

- Touch target minimo: 44×44pt (~88×88px per retina).
- iOS 14+: SafeAreaView per iPhone X-series notch + home indicator.

### WCAG 2.1 — 2.5.5 Target Size (Level AAA)

- Touch target ≥44×44 CSS pixels.

### Luke Wroblewski — *Mobile First* (2011)

- Dispositivi mobili = primary medium. Designing desktop-first = errori.

### NN/g Mobile UX (2018-2024)

- Touch tap accuracy = inverse to size di target.
- Touch tap precision = +50% per target 48px vs 36px.
- Mobile scroll-mode = 80% users scroll past iniziale.

### Smashing Magazine — Mobile First Tips (2018-2024)

- 4 aree di crash mobile: viewport meta mancante, font-size <16px, touch target <48px, no safe-area-inset.

### Material Design (Google) — Mobile Touch

- Touch target minimo: 48dp (Google Material).
- Tap ripple: max 500ms duration.
- Snackbar e toast: max 4 secondi auto-dismiss.

### Baymard Mobile UX (2024)

- Studio N>500 mobile checkout.
- Risultato:
  - 18% drop se CTA mobile "too small".
  - 12% drop se sticky CTA mobile assente.
  - 9% drop se safe-area-inset ignorato su iOS.
  - 14% drop su overflow orizzontale mobile.

### Scott Klemmer — *Touch Screens + Fitts's Law* (2008)

- Fitts's law applicato a touch: target size è dominante.

### Touch Gesture Reference (Jakob Nielsen, 2018)

- Tap = single touch + lift <500ms.
- Double-tap = 2 tap <500ms apart.
- Long-press = touch + hold >500ms.
- Swipe = drag con velocity.

### Mobile Accessibility (Apple WWDC 2024 / Google I/O 2024)

- VoiceOver / TalkBack richiedono touch target accessibile + aria-label.
- Switch control richiede focus-visible chiaro.

### Mobile Conversion v.s. Desktop (StatCounter 2024 + UX research)

- Mobile = 60-70% traffico globale.
- Conversion mobile = 50-70% del desktop conversion rate (Baymard 2024).

---

## Errori comuni

### E1 — Viewport meta mancante

**Sintomo**: meta viewport non è `<meta name="viewport" content="width=device-width, initial-scale=1">`.

**Perché succede**: il designer dimentica il meta tag.

**Perché il cervello lo rifiuta**: mobile rendering come desktop, scroll orizzontale, font-size shrinked.

**Soluzione**: viewport meta sempre presente + viewport-fit=cover per safe-area.

### E2 — Touch target <44×44px

**Sintomo**: button mobile 36×36px o 40×40px.

**Perché succede**: designer applica desktop sizing senza adattamento mobile.

**Perché il cervello lo rifiuta**: tap miss (utente taps "vicino" ma non sul button).

**Soluzione**: sempre ≥48×48px (Apple HIG 44pt minimo raccomandato).

### E3 — Safe-area-inset ignorato

**Sintomo**: sticky CTA bottom 0, ma home indicator iPhone copre button.

**Perché succede**: developer non conosce env(safe-area-inset-bottom).

**Perché il cervello lo rifiuta**: button parzialmente fuori screen → attivazione difficile.

**Soluzione**: padding-bottom: max(16px, env(safe-area-inset-bottom)).

### E4 — Font-size <16px body mobile

**Sintomo**: body mobile 14px.

**Perché succede**: design ha deciso "compact mobile".

**Perché il cervello lo rifiuta**: iOS zoom automatico su input field <16px. UX confusa.

**Soluzione**: body mobile font-size ≥16px. Body minimo 16px desktop.

### E5 — Hover-only effects

**Sintomo**: button su :hover mostra feature secondaria, ma mobile non ha :hover.

**Perché succede**: designer pensa "hover = desktop = ok".

**Perché il cervello lo rifiuta**: mobile utente non può accedere la feature.

**Soluzione**: @media (hover: hover) wrap per mouse-only effects.

### E6 — overflow-x orizzontale mobile

**Sintomo**: scroll laterale mobile (es. immagine troppo larga).

**Perché succede**: non hanno testato su viewport 360/414/768.

**Perché il cervello lo rifiuta**: scroll orizzontale mobile = UX terrible.

**Soluzione**: max-width: 100% su immagini, viewport meta, test viewport piccoli.

### E7 — Tap delay 300ms non rimosso

**Sintomo**: tap su button mobile → attende 300ms prima di trigger.

**Perché succede**: developer non ha specificato `touch-action: manipulation`.

**Perché il cervello lo rifiuta**: utente pensa "è lento, non ha funzionato".

**Soluzione**: `touch-action: manipulation` su elementi interactive.

### E8 — Mobile sticky CTA copre footer

**Sintomo**: footer link coperti da sticky CTA.

**Perché succede**: JS no auto-hide.

**Perché il cervello lo rifiuta**: trust link persi (privacy, ToS).

**Soluzione**: IntersectionObserver auto-hide su footer.

### E9 — Nessun hamburger menu (nav orizzontale compresso)

**Sintomo**: 4-5 nav links compressi orizzontalmente su mobile 375px.

**Perché succede**: "responsive design = scaledown".

**Perché il cervello lo rifiuta**: nav links illeggibili, overlap.

**Soluzione**: hamburger menu <768px, full nav >768px.

### E10 — Parallax scroll pesanti su mobile

**Sintomo**: la landing ha parallax background su mobile.

**Perché succede**: copy imita desktop premium.

**Perché il cervello lo rifiuta**: lag, scrolled confused.

**Soluzione**: no parallax mobile. Solo desktop (e in modo moderato).

### E11 — Carosello auto-play mobile

**Sintomo**: carosello hero mobile che gira in auto.

**Perché succede**: designer pensa "auto-play = sempre visibile".

**Perché il cervello lo rifiuta**: NN/g 2018 = NN/g raccomanda NO auto-play. UX confusion.

**Soluzione**: no auto-play carousels, mai.

### E12 — Tiny link in body mobile (no padding tap-extension)

**Sintomo**: link "Vedi termini" 12px font-size + 0 padding.

**Perché succede**: copy pensa "compact = design pulito".

**Perché il cervello lo rifiuta**: tap-miss. WCAG violation touch target.

**Soluzione**: link con padding 12px o display-block su mobile, tap target ≥48×48px.

---

## Pattern migliori

### Pattern A — Mobile sticky CTA safe-area-aware

```html
<div class="sticky-mobile-cta" aria-hidden="false">
  <a href="/auth?mode=register" class="btn-cta" aria-label="Inizia la tua prima simulazione">
    Inizia la tua prima simulazione
  </a>
</div>
```

```css
.sticky-mobile-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.08);
  transition: opacity 200ms, transform 200ms;
}

.sticky-mobile-cta[hidden-footer] {
  opacity: 0;
  pointer-events: none;
  transform: translateY(100%);
}

@media (min-width: 769px) {
  .sticky-mobile-cta { display: none; }
}
```

Pattern: mobile-only, safe-area aware.

### Pattern B — Mobile auto-hide su footer

```javascript
const stickyCta = document.querySelector('.sticky-mobile-cta');
const footer = document.querySelector('.footer');

if (stickyCta && footer) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const isVisible = entry.isIntersecting;
      stickyCta.style.opacity = isVisible ? '0' : '1';
      stickyCta.style.pointerEvents = isVisible ? 'none' : 'auto';
    },
    { threshold: 0.1 }
  );
  observer.observe(footer);
}
```

Pattern: IntersectionObserver 10% threshold.

### Pattern C — Hamburger menu mobile-first

```html
<nav class="nav" aria-label="Navigazione principale">
  <a href="/" class="nav-logo" aria-label="ConcorsoAI homepage">ConcorsoAI</a>
  
  <div class="nav-desktop-links" role="navigation">
    <a href="#features">Features</a>
    <a href="#prezzi">Prezzi</a>
    <a href="/auth" class="nav-cta">Accedi</a>
  </div>
  
  <button class="nav-mobile-toggle" 
          aria-expanded="false" 
          aria-controls="nav-mobile-menu"
          aria-label="Apri menu mobile">
    <span class="icon-open" aria-hidden="true">☰</span>
    <span class="icon-close" aria-hidden="true">✕</span>
  </button>
  
  <div id="nav-mobile-menu" class="nav-mobile-menu" hidden>
    <a href="#features">Features</a>
    <a href="#prezzi">Prezzi</a>
    <a href="/auth">Accedi</a>
    <a href="/auth?mode=register" class="btn-cta-mobile">Inizia simulazione</a>
  </div>
</nav>
```

```css
.nav-mobile-toggle { display: block; }
.nav-desktop-links { display: none; }

@media (min-width: 769px) {
  .nav-mobile-toggle { display: none; }
  .nav-desktop-links { display: flex; }
}
```

Pattern: hamburger <768px, full-nav ≥768px.

### Pattern D — Mobile hero stacked (vertical)

```css
.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  padding: 64px 24px;
}

@media (min-width: 768px) {
  .hero {
    grid-template-columns: 7fr 5fr;
    padding: clamp(80px, 8vw, 128px) 32px;
    align-items: center;
  }
}
```

Pattern: vertical stack mobile, 60/40 desktop.

### Pattern E — Mobile touch target ≥48px enforced

```css
.btn-cta,
.btn-secondary,
.tier-card button,
.faq summary,
.nav-link,
input,
textarea,
select {
  min-height: 48px;
}

@media (min-width: 769px) {
  /* Desktop può essere più snappy */
  .btn-cta { min-height: 48px; }
}
```

Pattern: tutti gli interactive element min-height 48px (WCAG AAA compliant).

### Pattern F — Font body mobile ≥16px anti-zoom

```css
body {
  font-size: clamp(1rem, 0.95rem + 0.2vw, 1.0625rem); /* 16-17px */
  line-height: 1.6;
}

input, textarea, select {
  font-size: 16px; /* iOS no zoom */
}
```

Pattern: clamp() responsive + 16px minimo desktop + mobile.

### Pattern G — Mobile image optimization

```html
<picture>
  <source srcset="/mockup-app.webp" type="image/webp">
  <source srcset="/mockup-app.avif" type="image/avif">
  <img src="/mockup-app.png" alt="Mockup ConcorsoAI" loading="eager" width="600" height="400">
</picture>
```

Pattern: AVIF + WebP con fallback PNG. Loading eager per above-fold.

### Pattern H — Mobile performance (LCP <1.5s)

- LCP priority per hero mockup.
- Lazy loading immagini sotto fold.
- Preconnect font CDN.
- Critical CSS inline.
- JS defer (non blocking).

Pattern: Lighthouse mobile audit target ≥90.

### Pattern I — Viewport meta ottimalizzato

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Pattern: viewport-fit=cover per safe-area iOS X+.

### Pattern J — Tap target extended (padding)

```css
.footer-link {
  display: inline-block;
  padding: 12px 16px;
  min-height: 48px;
}

@media (max-width: 768px) {
  .footer-link { display: block; }
}
```

Pattern: link con padding 12px vertically, min-height 48px.

### Pattern K — Mobile micro-quiz (gesture-friendly)

```css
.quiz-option {
  min-height: 56px;
  padding: 14px 20px;
  margin-bottom: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  touch-action: manipulation;
}

.quiz-option:hover, .quiz-option:focus-visible {
  border-color: var(--color-accent);
}
```

Pattern: 56px altezza + tap-friendly.

### Pattern L — Mobile-first CSS (no max-width queries)

```css
/* Mobile default */
.hero { padding: 64px 24px; }

/* Tablet enhancement */
@media (min-width: 768px) {
  .hero { padding: clamp(80px, 8vw, 96px) 32px; }
}

/* Desktop enhancement */
@media (min-width: 1024px) {
  .hero { padding: 128px 48px; grid-template-columns: 7fr 5fr; }
}
```

Pattern: min-width mobile-first, no `@media (max-width: ...)`.

---

## Checklist

- [ ] Viewport meta `width=device-width, initial-scale=1, viewport-fit=cover`
- [ ] Mobile-first CSS (min-width media query, no max-width)
- [ ] Touch target ≥48×48px ovunque
- [ ] Safe-area-inset iOS su sticky bottom CTA
- [ ] Font-size body mobile ≥16px
- [ ] No tap delay 300ms via touch-action: manipulation
- [ ] No hover-only (use @media (hover: hover))
- [ ] No overflow orizzontale su 360/414/768
- [ ] Mobile sticky CTA bottom-fixed + auto-hide footer
- [ ] Hamburger menu <768px, full nav ≥768px
- [ ] Hero stacked-su-mobile, 60/40 desktop
- [ ] Image WebP/AVIF + srcset responsive
- [ ] LCP <1.5s mobile 4G (Lighthouse)
- [ ] prefers-reduced-motion rispettato su mobile

---

## Decisioni progettuali

### Da mobile-afterthought a mobile-first design

Scelta: Mobile-first CSS. Default mobile, desktop enhancement via min-width media query.

### Da desktop size a mobile-specific touch target

Scelta: tutti gli interactive element ≥48×48px (Apple HIG + WCAG AAA).

### Da no safe-area a safe-area-aware

Scelta: Env safe-area-inset-bottom su sticky mobile CTA. Padding-bottom adattivo.

### Da carousels auto-play a no auto-play

Scelta: no auto-play carousels mai (NN/g raccomanda).

### Da hamburger missing a hamburger standard

Scelta: hamburger <768px, full-nav ≥768px.

### Da font-size 14px a 16px+ on inputs

Scelta: input/textarea/select font-size ≥16px (anti-zoom iOS).

### Da tap delay 300ms a touch-action: manipulation

Scelta: `touch-action: manipulation` su tutti gli interactive.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Viewport meta viewport-fit=cover | ✅ applicato | ✅ applicato |
| Mobile-first CSS | min-width media query | ✅ design tokens |
| Touch target ≥48×48px | Tutti interactive | ✅ applicato |
| Safe-area-inset iOS | .sticky-mobile-cta padding-bottom | ✅ applicato |
| Font-size body ≥16px mobile | clamp(1rem, 0.95rem + 0.2vw, 1.0625rem) | ✅ applicato |
| No tap delay 300ms | touch-action: manipulation | ✅ applicato |
| No hover-only | @media (hover: hover) wrap | ✅ applicato |
| No overflow orizzontale | test viewport 360/414/768 passing | ✅ verificato |
| Mobile sticky CTA bottom-fixed | ✅ implementato | ✅ applicato |
| Hamburger menu <768px | ✅ pattern implementato | ✅ applicato |
| Hero stacked-su-mobile | grid 1fr → 7fr/5fr | ✅ applicato |
| Image WebP/AVIF | Mockup hero WebP | ✅ applicato |
| LCP <1.5s mobile | Lighthouse audit | ✅ verificato |
| prefers-reduced-motion | CSS media query respected | ✅ applicato |
| Mobile sticky auto-hide footer | IntersectionObserver | ⏳ in progress |

**Gap**: implementare IntersectionObserver auto-hide su mobile sticky CTA.

---

## Vincoli

- ❌ **NO** viewport meta mancante.
- ❌ **NO** touch target <44×44px.
- ❌ **NO** font-size body mobile <16px.
- ❌ **NO** safe-area-inset ignorato.
- ❌ **NO** hover-only effects (mobile no hover).
- ❌ **NO** overflow orizzontale mobile.
- ❌ **NO** auto-play carousels.
- ❌ **NO** parallax scroll pesanti mobile.
- ❌ **NO** nav orizzontale compresso su 375px.
- ❌ **NO** sticky mobile CTA che copre footer.
- ❌ **NO** tap delay 300ms non rimosso.

---

*Continua in `19_accessibility.md`.*
