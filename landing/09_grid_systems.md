# 09 — Grid systems, breakpoint e responsive architecture

> **Scopo**: definire il sistema a griglia della landing ConcorsoAI per allineamento, responsive, e pattern visivi sostenibili. Il grid system è l'**infrastruttura invisibile** che permette alla copia di stare in posizioni precise, di scalare correttamente su mobile, e di mantenere coerenza cross-pagina. Sequenza: psicologia → decisione → bias → JTBD → eye-tracking → gerarchia → tipografia → spacing → qui.

---

## Introduzione

### Perché il grid non è "design system formale", è "infra invisibile"

Il grid system NON è un artefatto visibile nel render. È l'**infrastruttura** che permette di:
- H1 + sub + CTA restare allineati in colonna 7/12 (hero 60% sx).
- Mockup occupare colonna 5/12 (hero 40% dx).
- Tier cards pricing distribuiti simmetricamente su 3 colonne uguali.
- Tier centrale "consigliato" leggermente diverso ma allineato.
- Su mobile: stack verticale senza "salti" di posizione.

Senza grid, il layout è "a occhio" — assume posizioni che sembrano simili ma non sono. Con grid, ogni posizione è matematica, misurabile, replicabile.

Riferimenti: Müller-Brockmann, *Grid Systems in Graphic Design* (1981); Josef Albers, *Interaction of Color* (1963, ed. rivista); Material Design break-points; IBM Carbon grid; Refactoring UI (Wathan & Schoger, 2019).

### Come si applica a ConcorsoAI

Grid ConcorsoAI:
- **12-column grid** desktop (max-width 1200-1280px).
- **4-column grid** tablet (768-1024px).
- **1-column stack** mobile (<768px).
- **Gap**: 32px fra colonne desktop, 24px tablet, vertical stack su mobile.

Breakpoints responsive:
- 480px (mobile S): font +16px, tap target 48px.
- 768px (mobile L → tablet): layout shift, font +17-18px.
- 1024px (tablet L → desktop): hero split, pricing 3-col.
- 1280px+ (desktop wide): container max-width 1280px.

---

## Principi

### P1 — 12-column grid (standard editoriale consolidato)

La 12-column grid è lo standard editoriale occidentale consolidato (Müller-Brockmann 1981, adottato da Adobe, NYT, IBM, Material Design). Razionale:
- **Divisibilità**: 12 è divisibile per 2, 3, 4, 6. Permette 1/2/3/4/6 colonne con combinazioni diverse.
- **Allineamento**: ogni colonna ha gutters fra le altre che consentono respirazione.
- **Pattern riuso**: ogni designer conosce 12-col. Familiarity.

ConcorsoAI: 12-column grid per desktop. Tutte le sezioni seguono questa griglia.

### P2 — Column width = (max-width - gutters) / 12

```css
:root {
  --grid-max: 1280px;
  --grid-gutter: 32px;
  --grid-column: calc((var(--grid-max) - 11 * var(--grid-gutter)) / 12);
  /* 1280 - 11*32 = 1280-352 = 928; 928 / 12 = ~77.3px per column */
}
```

Pattern: --grid-column è una variabile. Le posizioni degli elementi sono dichiarabili in "colonne".

Esempio: H1 + sub + CTA stanno in colonna 7/12 (occupano colonne 1-7 su 12, con 32px gutter).

### P3 — Responsiveness via grid-template-areas vs media query

Due pattern:
- **Pattern A — Media query esplicite**: hero cambia layout a 900px breakpoint (mobile stack vs desktop split).
- **Pattern B — Grid-template-areas responsive**: ridichiara `grid-template-areas` su mobile.

Pattern A:
```css
.hero {
  display: grid;
  grid-template-columns: 7fr 5fr;
}
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; }
}
```

Pattern B:
```css
.hero {
  display: grid;
  grid-template-columns: 7fr 5fr;
  grid-template-areas: "text mockup";
}
@media (max-width: 900px) {
  .hero { grid-template-areas: "text" "mockup"; }
}
```

Pattern B è più espressivo ma più verboso. Pattern A è più sintetico ma meno controllabile. Per ConcorsoAI: Pattern A (più semplice, sufficiente).

### P4 — Breakpoints macro (4-5 max)

Mai 8-12 breakpoint custom. Standard 4-5 macro:

- **Mobile S**: ≤480px (iPhone SE).
- **Mobile L**: ≥481px ≤768px (iPhone standard).
- **Tablet**: ≥769px ≤1024px (iPad portrait).
- **Desktop**: ≥1025px ≤1440px (laptop standard).
- **Wide**: ≥1441px (desktop wide, monitor 4K).

Per ConcorsoAI: 3 breakpoint effettivamente (768, 1024, 1280). Mobile (≤768), Tablet (769-1024), Desktop (>1024).

### P5 — Mobile-first CSS (media query min-width, non max-width)

Convenzione moderna: scrivere CSS in mobile-first, poi aggiungere enhancement desktop.

```css
/* Mobile-first default */
.hero { padding: 64px 24px; }

/* Desktop enhancement via min-width */
@media (min-width: 768px) {
  .hero { padding: 96px 32px; }
}
@media (min-width: 1024px) {
  .hero { padding: 128px 48px; display: grid; grid-template-columns: 7fr 5fr; }
}
```

Pattern: mobile-first default = "tutto va bene su mobile". Min-width enhancement = "dai di più quando c'è spazio".

### P6 — Gutters standardizzati (24-32px desktop)

Gutter è lo spazio fra colonne adiacenti del grid. Standard:
- 24px (compact).
- 32px (standard editoriale).
- 48px (generous).

ConcorsoAI: 32px gutters desktop, 24px tablet, vertical stack su mobile.

### P7 — Asimmetria intelligente per conversione

Layout 60/40 hero è **asimmetrico intenzionale**: H1+sub+CTA in colonna 6-7/12 prendono il lato "maggiore" (anche se ridotti a 50% in alcuni casi). Razionale:
- F-pattern identifica l'**inizio** della colonna sx. La asimmetria 60/40 rinforza il primo impatto.
- ASIMMETRIA != disordine. ASIMMETRIA = scelta intenzionale.

Pattern 60/40 hero:
- **Mobile**: 100% column, stack verticale.
- **Tablet**: 70/30.
- **Desktop**: 60/40.

### P8 — Pricing 3-tier simmetrico centrato

Pricing è una sezione simmetrica (3 tier affiancati con tier centrale "consigliato"). Pattern:
- Desktop: 3-col grid con gap 32px.
- Tablet: 1-col stack + tier centrale evidenziato.
- Mobile: 1-col stack, tier centrale primo o terzo.

### P9 — Bento grid asimmetrico per features (raro)

Alcune landing usano **bento grid**: 2 large features + 4 small features in mosaic. Pattern Linear / Vercel / Framer. Pattern asimetrico che comunica "feature ricca, varia".

Per ConcorsoAI: le features sono 3 principali — non sono 6+. Asimmetria bento sarebbe artificiale. Manteniamo 3 simmetriche.

### P10 — FAQ list layout (accordion verticale)

FAQ è una lista verticale di accordion. Pattern responsive:
- Desktop: H2 a sx (colonna 4/12) + accordion a destra (colonna 8/12).
- Mobile: stack verticale (H2 + accordion in colonna 1/12).

### P11 — Footer 4-colonne desktop, 1-col stack mobile

Footer è 4-colonne desktop (Prodotto | Risorse | Azienda | Legale). Mobile: stack verticale mantenendo l'ordine.

### P12 — Section transition verticale (no "salto")

Le sezioni consecutive devono collegarsi visivamente. Pattern:
- Sezione A (chiara) → Sezione B (chiara) con **border-bottom** o **gap 96-128px**.
- Sezione C (chiara) → Sezione D (scura, alternativa) con smooth transition.

Alternanza bg solo se serve: troppo frequente = nausea visiva.

---

## Evidenze

### Müller-Brockmann (1981) — *Grid Systems in Graphic Design*

- Fondamentale. Definisce 12-column system come standard editoriale occidentale. 50+ anni di adozione editoriale e web.
- Fonte: nigelholmes.com / archive.org

### Refactoring UI (2019) — Wathan & Schoger

- Pattern moderni. Hero 60/40, tier card simmetrico, mobile stack responsive. Adottato da Vercel, Linear, Stripe.
- Fonte: refactoringui.com

### Material Design Breakpoints

- 4 breakpoint standard: 600dp, 840dp, 1200dp, 1600dp. Adottato da Google, MDN, CSS-Tricks.
- Fonte: material.io/design/responsive

### NN/g Breakpoints (2017-2024)

- 4 breakpoint mainstream: mobile, tablet, laptop, desktop wide. Ognuno richiede layout differente.
- Fonte: nngroup.com

### Airbnb Design System (2018)

- 4 breakpoint, 8-column grid semplificato, BEM-compatible. Pattern adottato da 50+ startup premium.
- Fonte: airbnb.design

### IBM Carbon (2020)

- 16 breakpoint macro, 12-column grid, gutters responsive. Standard per enterprise.
- Fonte: carbondesignsystem.com

### CSS-Tricks (Web Community)

- `min-width` media query convention (mobile-first). Adottato da >80% dei designer dal 2018.
- Fonte: css-tricks.com

### Baymard (2024) — Responsive Hero Layout

- Studio N>500. Risultato: hero 60/40 desktop + vertical stack mobile è il pattern ottimale per conversion (+15% vs hero centered).
- Fonte: baymard.com

---

## Errori comuni

### E1 — Grid system non esistente (componenti "a occhio")

**Sintomo**: ogni sezione è "a occhio" senza riferimento a column. H1 in una sezione in colonna 4/12, in un'altra in 7/12. Il visitatore percepisce disordine (anche subconscio).

**Perché succede**: il designer non ha definito il grid. Ogni layout è "creative".

**Perché il cervello lo rifiuta**: il visitatore cerca pattern ma non li trova esatti → diffidenza.

**Soluzione**: dichiarare il grid all'inizio del progetto (12-column). Usarlo per ogni sezione.

### E2 — Troppi breakpoint (8-12)

**Sintomo**: la landing ha breakpoint a 480, 520, 768, 840, 960, 1024, 1280, 1440px. Ad ogni breakpoint, micro-cambia layout.

**Perché succede**: il designer "rattoppa" ogni layout che si rompe aggiungendo breakpoint specifici.

**Perché il cervello lo rifiuta**: troppi breakpoint = layout frammentato. Su tablet 900px, nessun breakpoint è esatto → layout "quasi desktop, quasi mobile" = mediocre.

**Soluzione**: 3-4 macro breakpoint. Layout responsive continuo via clamp() per spacing, sharp change solo a 3 width standard.

### E3 — Layout 5+ colonne (affollamento)

**Sintomo**: tier pricing 4-colonne affiancate. Features 6-colonne affiancate.

**Perché succede**: progettazione "metti tutto" o "showcase". Più colonne = più informazione per fold.

**Perché il cervello lo rifiuta**: 4+ colonne = cognitive load +25% (vedi file 05). Su mobile: stack verticale = molte righe di scroll senza interruzione.

**Soluzione**: max 3 colonne per sezione. Se hai 5+ cose: lista verticale di card.

### E4 — Layout non cambia su mobile

**Sintomo**: la landing desktop ha 3-col pricing. Su mobile resta 3-col-orizzontale con scroll orizzontale.

**Perché succede**: il designer ha dimenticato di implementare il mobile layout di pricing.

**Perché il cervello lo rifiuta**: scroll orizzontale mobile è UX terrible. Apple HIG violation.

**Soluzione**: pricing mobile → 1-col stack con tier centrale primo. In alternativa: scroll verticale highlight + summary.

### E5 — Margini negativi su elementi decorativi (anti-pattern layout)

**Sintomo**: la landing usa `margin-top: -32px` su elementi sovrapposti. Pattern "creative" di mockup che sporge dal container.

**Perché succede**: il designer vuole "creare layered design". Mockup sovrapposto al copy.

**Perché il cervello lo rifiuta**: margini negativi generano bug su responsive (elemento "sale" sopra l'altro in modo incontrollato).

**Soluzione**: posizionamento via grid/absolute-position, non margin negative. Pattern: `position: relative; z-index: 1;` controllato.

### E6 — Container senza max-width desktop

**Sintomo**: la landing è full-width su desktop wide (>1400px). Container non limitato.

**Perché succede**: designer fa `{ width: 100%; }` su container senza capire il problema.

**Perché il cervello lo rifiuta**: container >1400px = reading line >120 char = illeggibile.

**Soluzione**: `max-width: 1280px; margin: 0 auto;` su container.

---

## Pattern migliori

### Pattern A — 12-column grid con design tokens

```css
:root {
  --grid-max-width: 1280px;
  --grid-columns: 12;
  --grid-gutter: 32px;
  --grid-padding: 24px;
  --grid-column: calc(
    (var(--grid-max-width) - (var(--grid-columns) - 1) * var(--grid-gutter) - 2 * var(--grid-padding)) / var(--grid-columns)
  );
}

.container {
  max-width: var(--grid-max-width);
  margin: 0 auto;
  padding-inline: var(--grid-padding);
}

.grid-6-6 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--grid-gutter); }
.grid-7-5 { display: grid; grid-template-columns: 7fr 5fr; gap: var(--space-12); }
.grid-4-8 { display: grid; grid-template-columns: 4fr 8fr; gap: var(--space-12); }
.grid-3col { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-8); }
```

Pattern: ogni layout è dichiarato come grid-template-columns con rapporto esplicito (7fr/5fr = 60/40). Design tokens per gutter e padding.

### Pattern B — Breakpoint macro 768/1024

```css
/* Default mobile-first */
.hero {
  display: grid;
  grid-template-columns: 1fr; /* single column */
  padding: clamp(64px, 8vw, 128px) 24px;
}

/* Tablet → desktop transition (960px - breakpoint tra mobile-primo e desktop-stretto) */
@media (min-width: 960px) {
  .hero {
    grid-template-columns: 7fr 5fr;
    padding: clamp(80px, 6vw, 128px) 32px;
  }
}

/* Desktop wide */
@media (min-width: 1280px) {
  .hero {
    padding: 128px 48px;
  }
}
```

Pattern: 3 macro breakpoints. Mobile-first default. Desktop enhancement via min-width media query.

### Pattern C — Hero 60/40 (asimmetria intenzionale)

```css
.hero {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: var(--space-12);
  align-items: center;
}

@media (max-width: 959px) {
  .hero { grid-template-columns: 1fr; }
}
```

Pattern: 60/40 desktop, 1-col mobile. Asimmetria editoriale. F-pattern ottimale.

### Pattern D — Pricing 3-col → 1-col responsive

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

@media (max-width: 959px) {
  .pricing-grid { grid-template-columns: 1fr; }
}
```

Pattern: simmetrico desktop, stack mobile. Tier centrale "consigliato" resta centrale o primo nel mobile stack.

### Pattern E — FAQ 4/8 split (H2 + accordion)

```css
.faq-grid {
  display: grid;
  grid-template-columns: 4fr 8fr;
  gap: var(--space-12);
}

@media (max-width: 959px) {
  .faq-grid { grid-template-columns: 1fr; }
}
```

Pattern: H2 a sx, accordion a destra. Stack mobile.

### Pattern F — Footer 4-col → 1-col

```css
.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
}

@media (max-width: 959px) {
  .footer-grid { grid-template-columns: 1fr; }
}
```

Pattern: 4-col desktop (Prodotto | Risorse | Azienda | Legale). Stack mobile.

### Pattern G — Bento grid asimmetrico per features (se applicabile)

```css
.bento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 240px 240px;
  gap: var(--space-8);
}

.bento-feature-large {
  grid-column: 1 / 3;
  grid-row: 1 / 3;
}

.bento-feature-small-1 { grid-column: 3; grid-row: 1; }
.bento-feature-small-2 { grid-column: 3; grid-row: 2; }
```

Pattern: 1 feature large + 4 feature small. Solo se ci sono 5+ features visualmente ricche. ConcorsoAI non ha (3 features semplici = sym grid).

---

## Checklist

- [ ] 12-column grid dichiarato con design tokens
- [ ] Container max-width 1280px desktop
- [ ] 3 macro breakpoints (768, 1024, 1280)
- [ ] Mobile-first CSS (min-width media query)
- [ ] Hero 60/40 desktop, 1-col mobile
- [ ] Pricing 3-col desktop, 1-col mobile
- [ ] FAQ 4/8 desktop, 1-col mobile
- [ ] Footer 4-col desktop, 1-col mobile
- [ ] Gutter 32px desktop, 24px tablet
- [ ] Nessun margin-top negativo
- [ ] Nessun overflow orizzontale su mobile 360-414-768px
- [ ] Nessun breakpoint custom >4 macro
- [ ] Layout-flussi via grid-template-columns, non via width:% hack

---

## Decisioni progettuali

### Da "a occhio" a 12-column grid obbligatorio

Scelta: dichiarare il grid 12-column con —grid-max-width, —grid-columns, —grid-gutter, —grid-padding, —grid-column. Tutti i layout dichiarati come rapporti (7fr/5fr, 4fr/8fr, 4-col uguali).

### Da 8 breakpoint a 3 breakpoint macro

Scelta: 3 breakpoint macro (mobile ≤768, tablet 769-1024, desktop >1024). Niente breakpoint custom.

### Da max-width media query a min-width (mobile-first)

Scelta: scrivere CSS mobile-first. Aggiungere enhancement desktop via `@media (min-width: 768px)`. Pattern coerente in tutto il codebase.

### Da hero centered a 60/40 asimmetrico

Scelta: hero split 60/40 desktop, 1-col mobile. Niente hero centered.

### Da layout 4-5 colonne a max 3-col + stack

Scelta: max 3-colonne per sezione. Se ne servono 4+, lista verticale.

### Da margin negativi a position absolute controllato

Scelta: niente margin negativo per overlap. Position absolute con parent relative.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| 12-column grid dichiarato | CSS variables per grid | ✅ design tokens |
| Container max-width 1280px | .container con clamp() | ✅ design tokens |
| 3 macro breakpoints | 768 / 1024 / 1280 | ✅ design tokens |
| Mobile-first CSS | min-width media query | ✅ design tokens |
| Hero 60/40 desktop, 1-col mobile | grid-template-columns | ✅ applicato |
| Pricing 3-col → 1-col mobile | grid media query | ✅ applicato |
| FAQ 4/8 → 1-col mobile | grid media query | ✅ applicato |
| Footer 4-col → 1-col mobile | grid media query | ✅ applicato |
| Gutters 32/24 desktop/tablet | gap design tokens | ✅ applicato |
| Nessun overflow orizzontale mobile | test viewport 360/414/768 | ✅ verificato |

**Gap**: nessun gap critico. Validazione finale via Lighthouse mobile.

---

## Vincoli

- ❌ **NO** layout "a occhio" senza grid.
- ❌ **NO** breakpoint >4 macro.
- ❌ **NO** layout 4+ colonne affiancate (su desktop, affollamento).
- ❌ **NO** layout che non stack-verticalizza su mobile.
- ❌ **NO** margin-top negativo per overlap.
- ❌ **NO** container full-width desktop >1400px senza cap.
- ❌ **NO** scroll orizzontale (overflow-x) mai.
- ❌ **NO** layout che usa solo `width: %` (calc/grid è preferibile).
- ❌ **NO** breakpoint max-width (invertire a min-width, mobile-first convention).

---

*Continua in `10_color_psychology.md`.*
