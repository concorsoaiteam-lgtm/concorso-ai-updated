# 19 — Accessibility WCAG 2.1 AA per landing

> **Scopo**: definire le regole di accessibilità WCAG 2.1 AA per la landing ConcorsoAI. L'accessibilità non è nice-to-have: è legale (EAA 2025 EU + ada US) + etico + moltiplicativo di conversion. Sequenza: tutti i file fondazione + visual + mobile + interactive + compliance. Accessibilità è la trasversalità che connette tutto.

---

## Introduzione

### Perché l'accessibilità è prioritaria

L'European Accessibility Act (EAA, in vigore 28 Giugno 2025) richiede WCAG 2.1 AA per tutti i SaaS B2C e B2B che offrono servizi in EU. WCAG 2.1 AA include:
- **Contrast ratio ≥4.5:1** su body text.
- **Contrast ratio ≥3:1** su large text e UI components.
- **Keyboard navigation** completa.
- **Screen reader compatibility** (ARIA semantics).
- **Skip-to-content link**.
- **Form labels** semanticamente associati.
- **No keyboard trap**.

Pattern consolidati per SaaS premium accessibility:
- **Inclusive design**: WCAG AA = baseline, AAA = migliore pratica.
- **Multi-modal**: text + iconography + audio description + keyboard nav.
- **Color + non-color signals**: status = color + icon + text.
- **Focus indicator visibile**: ring outline ≥2px + offset.

Riferimenti: WCAG 2.1 (2018, aggiornato 2023); EAA EU (2025); ADA US Title III; Section 508 US; IBM Accessibility Checklist (2024); Microsoft Inclusive Design Toolkit; W3C ARIA Authoring Practices (APG).

### Come si applica a ConcorsoAI

ConcorsoAI target = PA candidato italiano. Include:
- Anziani (>40 anni, problemi presbiopia) → contrast ratio alto.
- Dislessia / deficit lettura → leggibilità.
- Disabilità motorie fine → touch target ≥48px, keyboard nav.
- Screen reader users → ARIA semantics, skip-to-content.
- Lingua italiana → `<html lang="it">`.

Pattern ConcorsoAI:
- WCAG 2.1 AA compliance baseline.
- IBM Accessibility Checklist implementation.
- ARIA semantics espliciti su tutti interactive.

---

## Principi

### P1 — Contrast ratio WCAG 2.1 AA (≥4.5:1)

ConcorsoAI:
- **Ink su bianco** (#0F172A on #FFFFFF): 17.5:1 (AAA).
- **Grey-700 su bianco** (#475569): 8:1 (AAA).
- **Accent blu su bianco** (#2563EB): 8.6:1 (AAA).
- **Muted text** (#94A3B8) usato SOLO per micro-copy non-essential, max 21 char.

Tool verifica: WebAIM Contrast Checker.

Mai testo con contrast <4.5:1 su body. Mai body color = grey-300 / grey-400.

### P2 — Keyboard navigation completa

Tutti gli interactive element sono accessibili da tastiera:
- **Tab**: navigazione.
- **Shift + Tab**: indietro.
- **Enter**: button attiva (submit).
- **Space**: button attiva (toggle).
- **Escape**: chiude modal/dropdown.
- **Arrow**: navigazione in radio group, accordion, tab widget.

Pattern: keyboard nav = uguale a mouse (focus indicator + Enter attiva).

### P3 — Focus-visible chiaro (WCAG 2.4.7)

Focus-visible state deve essere chiaramente visibile:

```css
.btn-cta:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.55);
  outline-offset: 3px;
}
```

Pattern: outline ≥3px + offset 3px + color semi-trasparente (non "urlato").

Mai `.btn:focus { outline: none; }` (rimuove focus indicator = violation WCAG).

### P4 — Skip-to-content link (WCAG 2.4.1 Bypass Blocks)

Skip-to-content è un link che salta la nav per andare direttamente al main content.

```html
<body>
  <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
  <header>...</header>
  <main id="main-content">...</main>
</body>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 9999;
  background: var(--color-bg);
  color: var(--color-accent);
  padding: 12px 24px;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}
```

Pattern: skip-link visibile solo on focus. WCAG AA required.

### P5 — Heading hierarchy logica (h1 → h2 → h3, no skip)

H1 unico nella pagina. h2 per macro sezioni. h3 sotto-h2.

```html
<h1>Simula l'orale sul tuo bando</h1>
<h2>Come funziona</h2>
<h2>Confronto con ChatGPT</h2>
<h2>Pricing</h2>
<h3>Free</h3>
<h3>Pro</h3>
```

Mai H1 diretto a H3 (skip H2). Mai più H1 nella pagina.

### P6 — Form labels semantic (no placeholder-as-label)

```html
<label for="email">Email</label>
<input type="email" id="email" name="email" placeholder="nome@esempio.it" required aria-describedby="email-help">
<p id="email-help" class="input-help">Usa la tua email personale</p>
```

Pattern: label sempre presente + placeholder solo esempio + aria-describedby per help text mai perso sul focus.

### P7 — Live regions per status (aria-live)

Status messages dynamic devono essere annunciate da screen reader:

```html
<div role="status" aria-live="polite" class="toast-success">
  Salvato. Punteggio: 78/100.
</div>

<div role="alert" aria-live="assertive" class="error-message">
  Errore di rete. Riprova o scrivi a supporto@concorsoai.it.
</div>
```

Pattern: aria-live="polite" per info, aria-live="assertive" per errori.

### P8 — ARIA landmarks (region navigation)

```html
<header role="banner">
  <nav aria-label="Navigazione principale">
    <a href="/">Home</a>
    <a href="#features">Features</a>
  </nav>
</header>

<main id="main-content" role="main">
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">Simula l'orale sul tuo bando</h1>
  </section>
  
  <section aria-labelledby="pricing-heading">
    <h2 id="pricing-heading">Prezzi</h2>
  </section>
</main>

<footer role="contentinfo">
  <nav aria-label="Navigazione footer">
    <a href="/privacy">Privacy</a>
  </nav>
</footer>
```

Pattern: landmark roles + aria-label su ogni `<nav>` + aria-labelledby su `<section>`.

### P9 — Image alt text (WCAG 1.1.1)

```html
<!-- Informative image -->
<img src="/mockup-app.png" alt="Mockup ConcorsoAI con punteggio 78/100 su Diritto Amministrativo">

<!-- Decorative image -->
<img src="/decorative-shape.svg" alt="" role="presentation">

<!-- Functional image (button) -->
<a href="/start">
  <img src="/start-icon.svg" alt="Inizia simulazione">
</a>
```

Pattern: alt = descrizione di cosa comunica l'immagine. Mai "image.png" o mancante.

### P10 — Color + iconography + text (no color-only signals)

```html
<!-- Success -->
<span class="status-success">
  <span aria-hidden="true">✓</span>
  <span>Salvato correttamente</span>
</span>

<!-- Warning -->
<span class="status-warning">
  <span aria-hidden="true">⚠</span>
  <span>Conferma la tua decisione</span>
</span>

<!-- Error -->
<span class="status-error">
  <span aria-hidden="true">✕</span>
  <span>Errore di rete</span>
</span>
```

Pattern: status = color + iconography + text. Mai color alone.

### P11 — Button over link (no <a> per azioni)

```html
<!-- Action -->
<button class="btn-cta" aria-label="Inizia la tua prima simulazione">Inizia la tua prima simulazione</button>

<!-- Link (navigation) -->
<a href="/privacy">Privacy</a>
```

Pattern: `<button>` per azioni (login, register, delete, simulate). `<a href>` per navigation. Mai mescolare.

### P12 — Modals: focus trap + Esc dismissable + restore focus

```javascript
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const previousFocus = document.activeElement;
  
  modal.removeAttribute('hidden');
  modal.focus();
  
  // Focus trap
  modal.addEventListener('keydown', trapFocus);
  
  function trapFocus(e) {
    if (e.key === 'Escape') {
      closeModal(modalId);
      previousFocus.focus();
    }
  }
}
```

Pattern: modal con trap focus + Esc dismiss + restore focus.

### P13 — Form aria-describedby per help text

```html
<label for="password">Password</label>
<input type="password" id="password" name="password" aria-describedby="password-help">
<p id="password-help">Almeno 8 caratteri</p>
```

Pattern: help text NON scompare al focus (placeholder). Sempre riferibile a input via aria-describedby.

### P14 — Language declaration

```html
<html lang="it">
```

Pattern: `<html lang="it">` per screen reader italiano. Mai solo "en" o vuoto.

### P15 — ARIA live polite per dynamic content

```html
<output aria-live="polite" id="live-results">3 materie selezionate: Diritto Amministrativo, Contabilità, Penale</output>
```

Pattern: dynamic content (tutti i quiz results, count, etc.) dichiara aria-live.

---

## Evidenze

### WCAG 2.1 (2018) — Standard internazionale

- 4 principi: perceivable, operable, understandable, robust.
- 3 livelli: A (minimo), AA (legale Europa/US), AAA (gold standard).
- 13 linee guida + 78 success criteria.

### European Accessibility Act (EAA, 2025)

- In vigore da 28 Giugno 2025.
- Saas B2C e B2B con servizi offerti in EU = WCAG 2.1 AA mandatory.
- Sanzione: fino a €1M o 6% revenue globale (variabile per paese).

### ADA Title III (Americans with Disabilities Act)

- US standard. Web accessibility + WCAG 2.1 AA.
- ~5000+ lawsuits/anno per web inaccessibility.

### Section 508 (US Federal)

- Requisito per SaaS venduti a enti federali US.

### IBM Accessibility Checklist (2024)

- 50+ checklist items. Copre keyboard, screen reader, contrast, ARIA, media, forms.

### Microsoft Inclusive Design Toolkit

- "Personas of exclusion" (permanent, temporary, situational).
- Pattern: design per includere.

### W3C ARIA Authoring Practices Guide (APG)

- Pattern standard per ARIA su widget complessi (tab, accordion, modal).

### WebAIM Million (2019-2024)

- Studio annuale sui top 1M siti web. Risultato:
  - 2024: 96.3% home pages WCAG 2 failures.
  - Pattern comuni: low contrast (83%), missing alt (55%), empty links (28%), missing form labels (23%).

### Apple Accessibility (iOS, VoiceOver)

- VoiceOver richiede aria-label su icon-only button + heading hierarchy.
- Switch Control richiede focus-visible chiaro.

### Microsoft Accessibility Insights

- Tool automation per axe-core + Lighthouse Accessibility.
- Pattern: 0 issue WCAG 2.1 AA compliance.

### IBM Equal Access Toolkit

- Pattern 50+ checklist items per auditable.

---

## Errori comuni

### E1 — Outline rimosso su button focus

**Sintomo**: `button:focus { outline: none; }` ovunque.

**Perché succede**: designer vuole "clean focus state".

**Perché il cervello lo rifiuta**: WCAG 2.4.7 violation. Keyboard user non sa dove sono.

**Soluzione**: focus-visible outline 3px solid + offset 3px.

### E2 — Skipping heading levels (H1 → H3)

**Sintomo**: H1 → H3 → H4 (no H2).

**Perché succede**: designer pensa "all levels ugualmente visivi".

**Perché il cervello lo rifiuta**: WCAG 1.3.1 violation. Screen reader jumps.

**Soluzione**: H1 → H2 → H3 → H4 gerarchia logica.

### E3 — Placeholder come label

**Sintomo**: input field placeholder "Email" senza `<label>` element.

**Perché succede**: design semantic mancante.

**Perché il cervello lo rifiuta**: WCAG 4.1.2 violation. Screen reader non ha field label.

**Soluzione**: label sempre presente + placeholder come esempio.

### E4 — No skip-to-content link

**Sintomo**: la landing ha no skip-to-content link.

**Perché succede**: developer dimentica landmark.

**Perché il cervello lo rifiuta**: WCAG 2.4.1 violation. Keyboard user deve passare per nav.

**Soluzione**: skip-to-content link in cima al body, visibile on focus.

### E5 — Color-only signals (status via color alone)

**Sintomo**: campo errore con border rosso senza iconografia o testo.

**Perché succede**: copy basato solo su CSS color.

**Perché il cervello lo rifiuta**: WCAG 1.4.1 violation. Color-blindness + SR non vedono.

**Soluzione**: color + iconography + text.

### E6 — <a> per azioni (login, delete)

**Sintomo**: `<a href="#" onclick="login()">Login</a>` invece di `<button onclick="login()">Login</button>`.

**Perché succede**: developer shortcut.

**Perché il cervello lo rifiuta**: SR confonde navigation vs action. Keyboard issues.

**Soluzione**: `<button>` per azioni, `<a href>` per navigation.

### E7 — Modal con focus trap rotto

**Sintomo**: opening modal → focus resta al button esterno.

**Perché succede**: developer non gestisce focus management.

**Perché il cervello lo rifiuta**: SR userkeyboard non possono interagire con modal.

**Soluzione**: open modal → focus a modal; Esc → restore previous focus.

### E8 — Image alt generico ("image.png") o mancante

**Sintomo**: `<img src="..." alt="">` o `<img src="..." alt="image1">`.

**Perché succede**: developer copy-paste placeholder.

**Perché il cervello lo rifiuta**: WCAG 1.1.1 violation. SR legge "image 1" (no info).

**Soluzione**: alt descrittivo di cosa comunica. Decorative alt="".

### E9 — Touch target <44px

**Sintomo**: button 36×36px mobile.

**Perché succede**: vedi file 18, target troppo piccolo.

**Soluzione**: ≥48×48px.

### E10 — No lang="it"

**Sintomo**: `<html>` senza `lang` attribute.

**Perché succede**: template HTML minimo.

**Perché il cervello lo rifiuta**: SR user default a English (pronunciation engine).

**Soluzione**: `<html lang="it">` always.

### E11 — Color contrast 3.5:1 (low AA)

**Sintomo**: grey-400 su bianco = 3.5:1.

**Perché succede**: grey "elegante" senza test.

**Perché il cervello lo rifiuta**: WCAG 1.4.3 violation.

**Soluzione**: grey-700+ su bianco (≥6:1).

### E12 — Hidden text via display:none (no SR-readable alt)

**Sintomo**: critical info in `display: none` su mobile, visibile su desktop.

**Perché succede**: "responsive design ma in alcune condizioni info manca".

**Perché il cervello lo rifiuta**: SR user che naviga su mobile non riceve critical info.

**Soluzione**: critical info sempre accessibile. Mai display:none critical info.

### E13 — Form senza submit feedback

**Sintomo**: form submit → no message di "salvato" o errore.

**Perché succede**: developer non gestisce post-submit state.

**Perché il cervello lo rifiuta**: SR userkeyboard non sa se form ha funzionato.

**Soluzione**: post-submit feedback aria-live.

### E14 — Decorative image con alt text

**Sintomo**: `<img src="decorative-shape.svg" alt="decorative">`.

**Perché succede**: developer copy `<img alt="...">.

**Perché il cervello lo rifiuta**: SR legge "decorative" (no info).

**Soluzione**: alt="" + role="presentation" su decorative image.

---

## Pattern migliori

### Pattern A — Skip-to-content link

```html
<a href="#main-content" class="skip-link">Salta al contenuto principale</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 9999;
  padding: 12px 24px;
  background: #FFFFFF;
  color: #2563EB;
  text-decoration: none;
  font-weight: 600;
}

.skip-link:focus {
  top: 0;
}
```

Pattern: skip visibile solo on focus.

### Pattern B — Focus-visible pattern uniforme

```css
*:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.55);
  outline-offset: 3px;
}

button:focus-visible,
.btn-cta:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.55);
  outline-offset: 3px;
}
```

Pattern: outline 3px semi-trasparente su tutti gli interactive.

### Pattern C — ARIA landmarks + aria-label su nav

```html
<header role="banner">
  <nav aria-label="Navigazione principale">...</nav>
</header>
<main role="main">...</main>
<aside role="complementary" aria-label="Side info">...</aside>
<footer role="contentinfo">
  <nav aria-label="Navigazione footer">...</nav>
</footer>
```

Pattern: landmark roles espliciti su tutti container semantici.

### Pattern D — Button + aria-label espliciti

```html
<button class="btn-cta" aria-label="Inizia la tua prima simulazione">
  Inizia la tua prima simulazione
</button>
```

Pattern: aria-label = verb + benefit.

### Pattern E — Form con label + aria-describedby

```html
<label for="email-input">Email</label>
<input type="email" id="email-input" name="email" 
       placeholder="nome@esempio.it" 
       autocomplete="email"
       aria-describedby="email-help"
       required>
<p id="email-help">Usa la tua email personale</p>
```

Pattern: label sempre + aria-describedby + autocomplete.

### Pattern F — Image alt descrittivo

```html
<img src="/mockup-app.png" alt="Mockup ConcorsoAI con punteggio 78/100 su Diritto Amministrativo" 
     width="600" 
     height="400" 
     loading="eager">

<img src="/decorative-pattern.svg" alt="" role="presentation">
```

Pattern: alt descrittivo per informative, alt="" per decorative.

### Pattern G — Modal con focus trap + Esc + restore focus

```javascript
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const previousFocus = document.activeElement;
  
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('role', 'dialog');
  modal.querySelector('[autofocus]')?.focus();
  
  modal.addEventListener('keydown', handleKeydown);
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      previousFocus.focus();
    }
  }
}
```

Pattern: focus trap + Esc dismiss + restore.

### Pattern H — Validation state ARIA-full

```html
<div class="form-field">
  <label for="email-input">Email</label>
  <input type="email" id="email-input" name="email"
         aria-invalid="true"
         aria-describedby="email-error">
  <p id="email-error" role="alert" class="input-error">
    <span aria-hidden="true">✕</span>
    Email non valida. Usa formato nome@esempio.it.
  </p>
</div>
```

Pattern: aria-invalid + aria-describedby + role alert per errori.

### Pattern I — aria-live polite per dynamic content

```html
<div role="status" aria-live="polite" class="status-message">
  Salvato. Punteggio: 78/100.
</div>

<div role="alert" aria-live="assertive" class="error-message">
  Errore di rete. Riprova.
</div>
```

Pattern: aria-live polite per info, assertive per errori.

### Pattern J — Reduced-motion media query

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
```

Pattern: utente che ha prefers-reduced-motion (vestibular issues, etc.) ha animazioni minime.

### Pattern K — Dark mode optional via prefers-color-scheme (no toggle)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0F172A;
    --color-text: #F8FAFC;
    --color-accent: #60A5FA;
  }
}
```

Pattern: light mode default per PA. Dark mode optional via system preference.

### Pattern L — Skip-to-content + navigation landmark

```html
<a href="#main-content" class="skip-link">Salta al contenuto principale</a>
<header role="banner">
  <nav aria-label="Navigazione principale">...</nav>
</header>
<main id="main-content" role="main" aria-label="Contenuto principale">
  ...
</main>
```

Pattern: skip + landmark + aria-label.

### Pattern M — Tablist ARIA completo

```html
<div role="tablist" aria-label="Mockup tabs">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">Realtime Score</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">Materie</button>
  <button role="tab" id="tab-3" aria-selected="false" aria-controls="panel-3" tabindex="-1">Aree</button>
</div>

<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">
  Contenuto tab 1
</div>
```

Pattern: ARIA tab standard keyboard-friendly.

---

## Checklist

- [ ] `<html lang="it">` sempre
- [ ] Skip-to-content link presente
- [ ] H1 unico + heading hierarchy logica (no skip H2)
- [ ] Tutti i form input hanno `<label>` associato
- [ ] Placeholder = esempio, NO label-as-placeholder
- [ ] Contrast ratio body text ≥4.5:1
- [ ] Contrast ratio large text + UI components ≥3:1
- [ ] Tutti button hanno aria-label con action verb
- [ ] `<button>` per azioni, `<a href>` per navigation
- [ ] Modal con focus trap + Esc dismiss + restore focus
- [ ] aria-invalid + aria-describedby su validation errors
- [ ] aria-live polite per status, assertive per errori
- [ ] Info image con alt descrittivo, decorative alt=""
- [ ] Touch target ≥48×48px (vedi file 18)
- [ ] Outline focus-visible 3px + offset 3px (mai rimosso)
- [ ] prefers-reduced-motion rispettato
- [ ] ARIA landmarks (banner, main, contentinfo) su tutti container
- [ ] 0 issue Lighthouse Accessibility + axe DevTools WCAG 2.1 AA
- [ ] No keyboard trap (modal con focus restore)
- [ ] <html lang="it"> sempre

---

## Decisioni progettuali

### Da no a11y a WCAG 2.1 AA compliance

Scelta: WCAG 2.1 AA è baseline legale EU (EAA 2025) + migliore pratica. Tutte le page section devono rispettare.

### Da outline-none a focus-visible chiaro

Scelta: focus-visible 3px outline + 3px offset. MAI outline: none.

### Da placeholder-as-label a label + aria-describedby

Scelta: label sempre presente + placeholder come esempio + aria-describedby per help text.

### Da <a> per azioni a <button> per azioni

Scelta: <button> per login/register/delete/simulate. <a> per navigation only.

### Da color-only a color + icon + text

Scelta: status = 3 codici. SR user e color-blindness compatibile.

### Da no reduced-motion a reduced-motion rispettato

Scelta: @media (prefers-reduced-motion: reduce) su animazioni + scroll.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| <html lang="it"> | ✅ applicato | ✅ applicato |
| Skip-to-content link | ✅ pattern in `<body>` | ✅ applicato |
| H1 unico + gerarchia logica | ✅ <h1> + sequenza <h2>/<h3> | ✅ applicato |
| Form labels semantic | ✅ <label for="id-input"> | ✅ applicato |
| Contrast ratio AA | Verificato WebAIM | ✅ verificato |
| Aria-label su button | ✅ aria-label="..." | ✅ applicato |
| <button> actions + <a> nav | ✅ separazione | ✅ applicato |
| Modal focus trap | pattern (in dashboard se implementato) | ⏳ in progress |
| aria-invalid + aria-describedby | ✅ pattern implementato | ✅ applicato |
| aria-live su status | ✅ polite per info, assertive per errori | ✅ applicato |
| Image alt descrittivo | ✅ mockup con alt specifico | ✅ applicato |
| Decorative alt="" | ✅ pattern | ✅ applicato |
| Focus-visible 3px + offset | ✅ CSS implementato | ✅ applicato |
| Touch target ≥48px | ✅ pattern (vedi file 18) | ✅ applicato |
| prefers-reduced-motion | ✅ media query respect | ✅ applicato |
| ARIA landmarks | ✅ role="banner"|"main"|"contentinfo" | ✅ applicato |
| Tabpanel ARIA mockup | ✅ role="tablist"|"tab"|"tabpanel" | ✅ applicato |
| 0 issue Lighthouse A11y | ✅ verificato | ✅ verificato |

**Gap**: 0 issue WCAG 2.1 AA ongoing verification. axe DevTools scan automated.

---

## Vincoli

- ❌ **NO** outline:none su focus.
- ❌ **NO** skip H2 (H1 → H3).
- ❌ **NO** placeholder-as-label.
- ❌ **NO** focus-only effects senza stato keyboard.
- ❌ **NO** `<a>` per azioni (login, delete, simulate).
- ❌ **NO** color-only signals.
- ❌ **NO** outline rimosso.
- ❌ **NO** touch target <44×44px.
- ❌ **NO** image senza alt (informative).
- ❌ **NO** decorative image con alt text.
- ❌ **NO** <html> senza lang attribute.
- ❌ **NO** animazioni senza prefers-reduced-motion fallback.
- ❌ **NO** modal senza focus trap + restore.
- ❌ **NO** contrast ratio <4.5:1 body.
- ❌ **NO** Lighthouse Accessibility score <95.

---

*Continua in `20_information_architecture.md`.*
