# 08 — Spacing, layout, ritmo e respirazione tipografica

> **Scopo**: definire il sistema di spaziatura e il ritmo di respiro della landing ConcorsoAI. Lo spacing comunica importanza, separa contenuti correlati, genera ritmo percettivo. Il layout definisce il "contenitore narrativo". Sequenza: psicologia → decisione → bias → JTBD → eye-tracking → gerarchia → tipografia → qui.

---

## Introduzione

### Perché lo spacing è la metrica nascosta del design premium

L'utente non vede "spacing" esplicitamente, ma percepisce "design premium" o "design templato" in base alla **spaziatura relativa degli elementi**. Pattern consolidato:
- Spacing generoso → "design premium, ha tempo per respirare, ha cura artigianale".
- Spacing compresso → "design templato, fretta, assemblato".
- Spacing random (12, 17, 23, 31px) → "design automatizzato, nessuna cura artigianale".

Lo spacing è la metrica che distingue "Linear / Stripe / Vercel" da "Template Tailwind UI senza personalizzazione".

Riferimenti: Edward Tufte, *Envisioning Information* (1990); Robert Bringhurst, *Elements of Typographic Style* (1983); NN/g (article *Visual Hierarchy*); Airbnb Design System (2018); Material Design spacing scale; IBM Carbon (2020).

### Come si applica a ConcorsoAI

Pattern ConcorsoAI:
- **Hero**: padding 96-128px desktop, 64-80px mobile.
- **Sezione**: padding 96-128px desktop, 64-96px mobile.
- **Container**: max-width 1280px.
- **Gap fra elementi correlati**: 8-32px.
- **Gap fra sezioni**: 96px+ (chiarificatore).
- **CTA button**: padding 14-20px verticale, 24-32px orizzontale.

### Sistema di scala (design tokens)

```css
:root {
  --space-1: 4px;   /* gap minimo, separazione tra label e field */
  --space-2: 8px;   /* separazione fra elementi correlati inline */
  --space-3: 12px;  /* gap fra sub-elements */
  --space-4: 16px;  /* padding minimo fra elementi */
  --space-6: 24px;  /* gap fra elementi correlati fra sezioni */
  --space-8: 32px;  /* gap fra colonne, gap fra tier */
  --space-12: 48px; /* section padding min */
  --space-16: 64px; /* section padding standard mobile */
  --space-20: 80px; /* section padding desktop baseline */
  --space-24: 96px; /* section padding desktop extended */
  --space-32: 128px; /* hero section padding */
}
```

12 step massimo. Tutti i padding/margin/gap usano queste variabili.

---

## Principi

### P1 — Respiro respirazione = gerarchia comunicativa

Lo spazio vuoto intorno a un elemento comunica:
- "Questo è importante" (spazio ampio).
- "Questo è parte di un gruppo" (spazio minimo).

Regola operativa:
- **Vocali isolati** (H1, CTA, mockup): 96-128px di respiro attorno.
- **Vocali di gruppo** (3 sotto-elementi di una feature): 24-32px fra di loro.
- **Vocali di sezione** (intere sezioni): 96-128px fra le une e le altre.

Risultato: l'occhio identifica cosa è "vocale" (singolo importante) e cosa è "coro" (gruppo di elementi correlati).

### P2 — 4/8 px-based scale (no random spacing)

Tutto lo spacing deriva da una **scala 4/8 px-based**. Mai pixel random (12, 17, 23, 31).

Razionali:
- **Geometria visiva**: 4/8 multipli sono percepiti come "ordinati" anche senza misurarli.
- **Manutenibilità**: tutti i designer possono leggere e applicare la scala.
- **Performance**: CSS variables consentono cambi globali senza cercare pixel.
- **Trust**: nessun designer random genera spacing random.

Pattern implementativo:
- 4 step: 4, 8, 12, 16, 24, 32 (piccoli).
- 8 step: 48, 64, 80, 96, 128 (grandi).

### P3 — Section padding espresso in 96-128 desktop

Ogni sezione ha:
- **Padding-top**: 96-128px desktop, 64-96px mobile.
- **Padding-bottom**: 96-128px desktop, 64-96px mobile (uguale).
- **Container**: max-width 1280px, padding-inline 24-48px.

Razionale: due sezioni consecutive separate da 96-128px di aria vuota. Lo scan pattern respiratorio dell'utente è esplicito.

Mai:
- 2 sezioni attaccate (padding 0) → il visitatore non distingue.
- 200px di padding → eccessivo, perde densità.

### P4 — Container max-width 1200-1280px

Il container principale della landing ha max-width **1200-1280px**. Razionale:
- Lettura ottimale a 1280px (Standard laptop screen).
- Container 1080px funziona anche ma leggermente compresso.
- Mai full-width su desktop wide (>1400px).

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: clamp(24px, 5vw, 48px);
  padding-right: clamp(24px, 5vw, 48px);
}
```

### P5 — Gap fra elementi correlati 8-32px

Quando 3-4 elementi sono parte di un "vocale di gruppo", il gap fra loro è 8-32px. Regola:
- **Inline correlati** (label + value, icon + text): 8-16px.
- **Stessa card / row correlati**: 16-24px.
- **Fra colonne diverse correlate** (es. tier cards): 24-32px.

Mai:
- 0 (elementi attaccati, leggibili male).
- 48px+ (elementi diventano "distanti", perdono correlazione).

### P6 — Gestaltung proximity (Wertheimer 1923)

Elementi ravvicinati = percepiti come unità. Elementi distanti = percepiti come separati.

Regola pratica:
- H1 + sub + CTA = 24-32px gap (unità).
- Trust badges fra loro = 8-12px gap (unità visual).
- Trust band dalla sezione sopra = 64-96px aria (separazione).
- Sezione pricing dalla sezione confronto sopra = 96-128px aria (separazione).

### P7 — Micro-paddding interno a card 24-32px

Quando una card contiene testo + icona + button, il padding interno è 24-32px. Regola: **il padding è proporzionale alla quantità di contenuto**.

- Card media (testo + button): 32px padding.
- Card piccola (label + value): 24px padding.
- Card grande (hero card con mockup): 48-64px padding.

Mai:
- Padding 0 (card compressa, contenuto "sporge fuori").
- Padding 8 (card stretta, poco professionale).

### P8 — CTA button padding 14-20px vertical, 24-32px horizontal

Il CTA button ha padding 14-20px verticale (per altezza 48-56px con line-height) + 24-32px orizzontale. Razionale:
- **Touch target mobile**: min 44pt Apple HIG, idealmente 48-56px.
- **Click target desktop**: min 32px, idealmente 48px altezza.
- **Spaziatura**: il padding orizzontale 24-32px permette label leggibili.

Per ConcorsoAI:
- CTA primary: `padding: 14px 24px` desktop, `padding: 16px 24px` mobile (48-56px altezza).
- Min-height 48px sempre (WCAG + Apple HIG).

### P9 — F-pattern supporto nel layout

Nielsen Norman F-pattern richiede elementi allineati a colonna sinistra. Layout ConcorsoAI:
- **Hero**: H1+sub+CTA in colonna 6/12 o 7/12, mockup in colonna 5/12 a destra.
- **Pricing**: 2-3 tier affiancati con H2 + sub a sx, tier cards a destra (max-width 720px).
- **FAQ**: H2 a sx + accordion list a destra o full-width.
- **Confronto**: H2 a sx + tabella a destra o full-width.

Mai layout 100% centrato a colonna unica (segue che l'F-pattern è perso).

### P10 — Mobile layout shift (60% sx-hero → 90% mockup-down)

Su mobile, lo spacing deve essere proporzionalmente più large:
- Hero padding mobile: 64-80px (vs 96-128 desktop).
- Section padding mobile: 64-96px (vs 96-128 desktop).
- Container mobile padding-inline: 20-24px (vs 24-48 desktop).
- Tap target mobile: 48x48px minimo (Apple HIG).

Razionale: mobile touch richiede "spazio respiro" tra oggetti perché il dito è meno preciso del mouse.

### P11 — Density-as-credibility vs density-as-pedagogical per PA target

Il sito Linear/Stripe usa density elevata. Il candidato PA italiano NON gradisce density elevata — preferisce "respiro" editoriale. Pattern editoriale italiano (Il Sole 24 Ore, Gazzetta Ufficiale): più spaziatura, più respiro, meno elementi per fold.

Per ConcorsoAI: density moderate. 5-8 elementi per viewport, NIENTE 15+ elementi come Stripe hero.

---

## Evidenze

### Tufte (1983) — *Visual Display of Quantitative Information*

- "Data-ink ratio" = pixel che servono informazione / pixel totali. Per landing: ogni pixel di spacing deve essere intenzionale. Spacing vuoto ≠ "spazio perso". È **informazione gerarchica** (dove l'occhio deve andare).
- Fonte: edwardtufte.com.

### Bringhurst (1983) — *Elements of Typographic Style Applied to the Web*

- Capitolo 3.2: "The scale of intervals". Definisce rapporto geometrico 1.2x come standard editoriale.
- Fonte: webtypography.net

### NN/g (2018) — *Visual Hierarchy and Scanning Patterns*

- Studio eye-tracking N>200. Risultato chiave: lo spacing coerente è il 2° fattore più importante (dopo dimensione tipografica) per "design premium percepito".
- Fonte: nngroup.com

### Airbnb Design System (2018)

- Spacing scale 4-step: 4, 8, 12, 16, 24, 32, 64. Adottato da metà delle startup premium 2018-2024.
- Fonte: airbnb.design

### IBM Carbon (2020)

- Spacing scale 16-step geometric. Adottato da IBM enterprise. Pattern: 4, 8, 12, 16, 24, 32, 48, 64, 96, 160.
- Fonte: carbondesignsystem.com

### Google Material Design (2014-2024)

- Spacing scale 4dp baseline grid. Spacing base 8dp. Spacing 4dp per allineamento precise.
- Fonte: material.io/design/layout

### Yahoo Mail, Github (2018)

- Adozione di 8dp/spacing scale. Pattern "impossibile random spacing" = trust signal internal team.

---

## Errori comuni

### E1 — Spacing random fuori scala

**Sintomo**: padding: 17px qui, margin: 23px là, gap: 31px row successiva.

**Perché succede**: il designer "aggiusta a occhio" senza riferimento alla scala.

**Perché il cervello lo rifiuta**: lo spacing random attiva "uncanny valley del design" — è quasi ordinato ma non del tutto. Il visitatore tecnicamente non lo identifica, ma lo percepisce come "assemblato".

**Soluzione**: design tokens obbligatori. Ogni padding/margin/gap deve richiamare una variabile `--space-*`.

### E2 — Container full-width su desktop wide (>1400px)

**Sintomo**: la landing è full-width su monitor 1920px. La linea diventa lunghissima (200+ char).

**Perché succede**: il designer fa "max-width: 100%" senza capire il container.

**Perché il cervello lo rifiuta**: la lettura di prosa lunga >75 char per riga diventa "riga persa senza fine" → l'utente rinuncia.

**Soluzione**: container max-width 1200-1280px. Su desktop wide aggiungere aria a destra/sinistra.

### E3 — Sezioni compresse (padding <48px)

**Sintomo**: la landing ha 8 sezioni consecutive tutte con padding 24-32px. Visivamente attaccate.

**Perché succede**: il designer vuole "compatto" → riduce padding senza pensare alla respirazione.

**Perché il cervello lo rifiuta**: scan monotonic. Le 8 sezioni diventano "1 blocco indistinto". Nessuna enfatizzazione.

**Soluzione**: ogni sezione ha padding-top/bottom 96-128px desktop. I 96px di aria segnano la transizione.

### E4 — CTA button padding insufficiente (12px vertical, 16px horizontal)

**Sintomo**: CTA button ha padding minimo, altezza totale 36px.

**Perché succede**: il designer vuole "compact" senza pensare al click target.

**Perché il cervello lo rifiuta**: target <44px (mobile) è illegibile + Apple HIG violation + utente disabilità visiva non può cliccare.

**Soluzione**: padding minimo 14px vertical, 24px horizontal. Altezza 48px+ desktop, 56px+ mobile.

### E5 — Gap fra elementi correlati 0

**Sintomo**: label + value in un card con gap 0px. "€14,99" + "/mese" attaccato senza aria.

**Perché succede**: il designer fa tight layout per "compatto".

**Perché il cervello lo rifiuta**: il visitatore non distingue "€14,99" da "/mese". Confusione.

**Soluzione**: gap minimo 4-8px fra label e value. 8-16px fra sub-elementi correlati.

### E6 — Mobile tap target <44px

**Sintomo**: CTA mobile in 36-40px altezza.

**Perché succede**: il designer copia il sizing desktop.

**Perché il cervello lo rifiuta**: Apple HIG 44pt minimo. WCAG 2.5.5 target size. Utente disabilità fine motor + tap impreciso su mobile.

**Soluzione**: CTA mobile ≥48px altezza, padding 16px vertical, 24px horizontal.

---

## Pattern migliori

### Pattern A — Design tokens semantic di spacing

```css
:root {
  /* Base scale (4/8) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;
  --space-32: 128px;
  
  /* Semantic aliases (top-down hierarchy) */
  --space-content-gap: var(--space-6);      /* gap fra elementi correlati */
  --space-section-padding: var(--space-24); /* padding sezioni desktop */
  --space-section-padding-mobile: var(--space-16);
  --space-hero-padding: var(--space-32);
  --space-hero-padding-mobile: var(--space-20);
  --space-card-padding: var(--space-8);
}
```

Pattern: tutti i componenti usano i semantic aliases. Niente `padding: 24px` diretto.

### Pattern B — Section padding responsive con clamp()

```css
.section {
  padding-block: clamp(var(--space-16), 8vw, var(--space-24));
}
```

Pattern: clamp() rende il padding responsive continuo (96-128px desktop, 64-80px mobile). Niente media query per spacing.

### Pattern C — Card padding proporzionale a densità

```css
.card-sm { padding: var(--space-6); }    /* 24px */
.card-md { padding: var(--space-8); }    /* 32px */
.card-lg { padding: var(--space-12); }   /* 48px */
```

Pattern: card "piccola" (label + value) 24px. Card "media" (testo + button) 32px. Card "grande" (hero mockup) 48px.

### Pattern D — Container max-width responsivo

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding-inline: clamp(var(--space-6), 5vw, var(--space-12));
}
```

Pattern: container 1280px desktop, padding-inline 24-48px clamp responsive.

### Pattern E — Stack section pattern (alternanza generosa vs tight)

Sezioni principali alternano:
- **Sezioni "respiro"** (features, FAQ): padding 96-128px desktop, 64-96px mobile.
- **Sezioni "fittizio tight"** (pricing, mockup): padding 64-96px desktop, 48-64px mobile (transizione).

Pattern: la scan monotony è evitata dalla variazione respiratoria. Il visitatore percepisce "qui c'è una sezione nuova".

### Pattern F — Layout 60/40 hero

```css
.hero {
  display: grid;
  grid-template-columns: 6fr 4fr;/* 60% testo sx, 40% mockup dx */
  gap: var(--space-12);
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;/* mobile: stack vertical */
  }
}
```

Pattern: desktop split 60/40 con mockup a destra. Mobile stack verticale. F-pattern coverage ottimale.

### Pattern G — Pricing 3-col grid (post-Stripe)

```css
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

@media (max-width: 900px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
```

Pattern: desktop 3-tier affiancati con gap 32px. Mobile stack verticale. Tier centrale "consigliato" con bordo.

---

## Checklist

- [ ] Design tokens --space-1 a --space-32 implementati (12 step max)
- [ ] Tutti padding/margin/gap usano var(--space-*)
- [ ] Nessun pixel random fuori scala 4/8
- [ ] Container max-width 1280px desktop
- [ ] Section padding 96-128px desktop (clamp responsive)
- [ ] Hero padding 96-128px desktop
- [ ] Card padding proporzionale (24-32-48px per size)
- [ ] CTA button padding 14-20px vertical, 24-32px horizontal (≥48px altezza)
- [ ] Mobile tap target ≥48x48px
- [ ] Mobile section padding 64-96px
- [ ] Hero 60/40 desktop → vertical stack mobile
- [ ] Pricing 3-col desktop → 1-col mobile
- [ ] Gap elementi correlati 8-32px
- [ ] Gap sezioni 96-128px
- [ ] Reading width body ≤65ch

---

## Decisioni progettuali

### Da 1.000 pixel random a 12 design tokens

Scelta: TUTTI i padding/margin/gap derivano da `--space-1` a `--space-32`. Niente pixel diretto nei CSS.

### Da 96-128 desktop fisso a clamp() responsive

Scelta: section padding espresso in `clamp()` con min/max. Risultato: responsive continuo invece di media query sharp.

### Da full-width desktop a container 1280px

Scelta: container max-width 1280px desktop, 100% mobile. Aria laterale su desktop wide.

### Da layout full-screen a 60/40 hero + vertical stack mobile

Scelta: hero split 60/40 (testo sx + mockup dx) desktop → vertical stack mobile. F-pattern ottimale.

### Da padding 24px monotono a scale gerarchica

Scelta: ogni livello di importanza ha il suo spacing. Hero 96-128, section 96-128, card 24-32, inline 16-24, micro 4-8.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| 12 design tokens space-* | CSS variables implementate | ✅ design tokens |
| Container max-width 1280px | .container con clamp responsive | ✅ design tokens |
| Section padding 96-128 desktop | clamp(64px, 8vw, 128px) | ✅ design tokens |
| Hero padding 96-128 | clamp(64px, 8vw, 128px) | ✅ design tokens |
| Card padding proporzionale | 24-32-48px pattern | ✅ design tokens |
| CTA button padding 14-20 vert, 24-32 horiz | padding: 14px 24px | ✅ applicato |
| Hero 60/40 desktop → vertical mobile | Grid media query | ✅ applicato |
| Pricing 3-col desktop → 1-col mobile | Grid media query | ✅ applicato |
| Mobile tap target >=48x48px | min-height 48px | ✅ applicato |
| Reading width body <=65ch | .body-text max-width 65ch | ✅ applicato |
| Gap correlati 8-32px | gap su grid/flex container | ✅ applicato |

**Gap**: nessun gap critico. Validazione via Lighthouse audit.

---

## Vincoli

- ❌ **NO** pixel random (12, 17, 23, 31, 47px).
- ❌ **NO** full-width desktop >1400px senza container.
- ❌ **NO** sezioni compresse (padding <48px desktop).
- ❌ **NO** CTA button padding insufficiente (<14px vertical o <24px horizontal).
- ❌ **NO** gap fra elementi correlati fisicamente a 0px.
- ❌ **NO** tap target mobile <44px.
- ❌ **NO** reading width >75ch su body.
- ❌ **NO** padding diretto senza design token var(--space-*).

---

*Continua in `09_grid_systems.md`.*
