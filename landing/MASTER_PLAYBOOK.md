# MASTER PLAYBOOK — Il documento definitivo

## Scopo

Questo NON è un riassunto dei 25 file precedenti.
Questo È il **documento operativo** che permette a un senior designer e a un senior frontend engineer di **implementare la landing page di ConcorsoAI senza prendere decisioni arbitrarie**.

Ogni affermazione è motivata dai file della knowledge base (riferimento `XX_nome.md`).
Ogni sezione ha **scopo**, **contenuto**, **decisione vincolante**, **motivazione**.
Ogni scelta è **anti AI-slop**.

---

## Perché questo documento esiste

Una landing page è uno dei punti più critici di un SaaS. Una decision sbagliata (CTA nascosta, hero confuso, testimonial inventato) costa conversioni per anni. Una decision giusta (CTA sempre visibile, hero pulito, prova onesta) genera trust cumulativo e crescita.

Questo playbook è progettato per essere:

- **Definitivo**: nessuna decisione ambigua
- **Operativo**: implementabile senza reinterpretazione
- **Evidente**: ogni scelta motivata da ricerca
- **Anti-slop**: ogni pattern bollato se non rispetta il filtro

---

## Modello mentale del visitatore

### Chi arriva sulla landing

Il visitatore è un **candidato a concorso pubblico italiano**, fascia 25-45, italiano, digitalmente competente ma non tecnico, con **budget limitato** e **tempo limitato**, forte ansia di fallimento.

### Cosa vuole "comprare"

Secondo **Jobs To Be Done (`04_jobs_to_be_done.md`)**, il candidato non vuole:
- ❌ "Una piattaforma SaaS"
- ❌ "Strumenti di studio"
- ❌ "Una soluzione digitale"

Vuole:
- ✅ **Passare il concorso**
- ✅ **Ridurre l'incertezza su cosa studieranno**
- ✅ **Sentirsi preparato**, non ansioso
- ✅ **Ottimizzare il tempo di studio**

### Come decide (modello cognitivo)

Secondo **Decision Making (`02_decision_making.md`)** e **Behavioral Economics (`03_behavioral_economics.md`)**:

1. **System 1** (veloce, intuitivo): decide in 3 secondi se restare
2. **System 2** (lento, deliberativo): decide in 20-60 secondi se fidarsi
3. **Fogg MAP**: B=MAP — la decisione dipende da Motivation (ha paura di fallire), Ability (facile iniziare?), Prompt (CTA visibile?)
4. **Cialdini**: 7 principi, in particolare commitment, social proof, authority

### Quando nasce la fiducia

- Entro **3 secondi**: layout pulito, niente roba generata male
- Entro **10 secondi**: copy concreto, niente claim assurdi
- Entro **20 secondi**: pricing chiaro, niente sorprese
- Entro **60 secondi**: FAQ trasparente che chiude dubbi

### Quando nasce il dubbio

- ✅ Hero con underline gradient → dubbio: "è un fake?"
- ✅ Headline con "Revolutionary AI" → dubbio: "è una truffa?"
- ✅ Stock photo di persona sorridente → dubbio: "chi c'è dietro?"
- ✅ Trust badges finti → dubbio: "sono dati veri?"
- ✅ Pricing con solo tier Enterprise → dubbio: "è per me?"
- ✅ Form 11 campi → dubbio: "oddio, devo compilare tutto"
- ✅ Countdown "Solo 4 ore rimaste!" → dubbio: "è una fregatura"

### Quando clicca (commitment)

Il visitatore clicca "Inizia gratis" quando ha cumulato:

1. **Capisce** cosa fa il prodotto (System 1 → System 2 ok)
2. **Si riconosce** nel problema (evaluation)
3. **Si fida** delle prove (trust)
4. **Capisce** il prezzo (no sorprese)
5. **Si rassicura** sulle obiezioni (FAQ)
6. **Costo di entry** è basso (no carta, 1 minuto)

### Quando abbandona

Quando uno qualsiasi di questi trigger si attiva:

- ❌ Caricamento lento (> 3s)
- ❌ Layout strano / mobile rotto
- ❌ CTA in 11 punti che competono
- ❌ Testo troppo lungo (> 60 parole per paragrafo)
- ❌ Modulo che chiede troppo
- ❌ Mancanza di risposte a "funziona per me?"
- ❌ Mancanza di rassicurazione (no carta, cancellazione libera)

### Bootstrap del dubbio (anti-AI-slop pragmatic)

Il visitatore italiano è **educato al sospetto** verso siti che sembrano "troppo finti". Ogni pattern AI-slop attiva:

- Sospetto che il prodotto **non esiste davvero**
- Sospetto che le prove **siano inventate**
- Sospetto che il prezzo **nasconda qualcosa**
- Sospetto che l'azienda **scomparirà domani**

Questi sospetti **riducono conversion** del 30-50%. La landing deve essere **talmente concreta** da disinnescarli.

---

## Cosa vede nei primi 3 secondi

Il primo paint determina se l'utente resta.

**Viewport iniziale (above-the-fold)** deve contenere:

1. **Nav sticky** con logo sinistra, 3 voci testo + CTA emerald destra
2. **Eyebrow** piccolo, caption: "Per chi prepara concorsi pubblici"
3. **Headline H1** 2 frasi, max 9 parole totali:
   - "Smetti di studiare a caso. Preparati su quello che chiederanno davvero."
4. **Sub-headline** 18 parole max:
   - "Una banca di 12.000+ domande reali, raggruppate per materia e tipologia, con spiegazioni."
5. **CTA button** "Inizia gratis" emerald, 44px tall
6. **Microcopy sotto CTA**: "Niente carta di credito. 1 minuto per cominciare."
7. **Visual a destra** (desktop) o sotto (mobile): screenshot UI reale del prodotto

**Cosa NON vede**:

- ❌ Carosello auto-play
- ❌ Video
- ❌ 4 colonne di feature tiles
- ❌ "Trusted by 100,000+" logo parade
- ❌ Countdown
- ❌ 5 CTA button che competono

**Decisioni vincolanti**:

| Decisione | Motivazione | File |
|-----------|-------------|------|
| 9 parole H1 | NN/g hero research 2018 | `05_eye_tracking.md` |
| Sub 18 parole | Krug scannability | `11_copywriting.md` |
| 1 CTA sola | Iyengar max 3 opzioni | `03_behavioral_economics.md` |
| Visual = screenshot UI | NN/g hero research | `05_eye_tracking.md` |
| Microcopy rassicurante | Fogg MAP | `02_decision_making.md` |
| NO video auto-play | Baymard -23% bounce | `24_checklist_antislop.md` |

---

## Cosa vede nei primi 10 secondi

Scroll parziale. L'utente ha già deciso di restare, ora vuole capire "è per me?".

**Primo fold successivo**:

- **Sezione PROBLEMA** (anchor emozionale concreto):
  - "Studiare un bando intero non ti prepara al concorso."
  - 40 parole body, normalizzazione del pain
  - NO "we understand your struggle"

**Sezione SOLUZIONE + COME FUNZIONA**:

- 3 step chunked (Miller)
- Step 1: "Scopri cosa chiederanno"
- Step 2: "Fai simulazioni cronometrate"
- Step 3: "Ricevi feedback mirato"

**Decisione vincolante**: il pattern "problema → soluzione → come funziona" è il **cano inverso** di una landing (`21_user_flow.md`). Problema valida, soluzione promette, Come-funziona rassicura sull'**Ability** (Fogg).

---

## Quando nasce la fiducia (timeline cognitiva)

| Tempo | Cosa vede | Trust signal che si attiva |
|-------|-----------|---------------------------|
| 3 sec | Layout pulito, hero concreto | Real-world feel (Fogg) |
| 5 sec | Headline specifica | Authority per specificità (Cialdini) |
| 10 sec | "12.000+ domande reali" | Specific proof (Cialdini) |
| 20 sec | Prezzi chiari EUR | Transparency (EU consumer law) |
| 30 sec | FAQ con obiezioni vere | Honesty (Sillence framework) |
| 60 sec | Form minimo (solo email) | Low-friction commitment (Cialdini) |
| Click | Microcopy "Niente carta" | Risk reversal (Cialdini) |

### Trust principle (citations)

La fiducia si costruisce per **layer sovrapposti**, non per "sezione unica". Una sezione "Trusted by" gigante su una landing di nicchia è **AI-slop** (`24_checklist_antislop.md`).

---

## Quando nasce il dubbio (trigger inversi)

Gli stessi pattern che generano fiducia hanno trigger speculari che generano dubbio:

| Pattern che genera fiducia | Trigger speculare che genera dubbio |
|----------------------------|--------------------------------------|
| Layout pulito | Layout template-y, AI-generated look |
| Headline specifica | Headline buzzword (revolutionize, transform) |
| Proof specifico | Proof gonfiato (100,000+ users vs 0 verificabili) |
| Prezzi EUR chiari | Pricing hidden, "Contact us" |
| FAQ onesta | Fake FAQ o assenza FAQ |
| Form breve | Form 11 campi |
| Microcopy reassurance | Nessuna reassurance, solo claim |

---

## Quando clicca — la sequenza del "Sì"

L'utente che atterra sul bottone "Inizia gratis" ha attraversato:

```
1. ATTENTION (3 sec)
   ├─ Hero visibile, niente distrazioni
   └─ CTA emerald è il contrast point

2. EVALUATION (10-20 sec)
   ├─ Capisce il problema (PROBLEMA)
   ├─ Capisce la soluzione (SOLUZIONE)
   └─ Capisce il processo (COME)

3. TRUST (20-30 sec)
   ├─ Banca specificata, niente claim generici
   ├─ Prezzi chiari in EUR
   └─ Disclaimer trasparente su early-stage

4. OBJECTION (30-50 sec)
   ├─ FAQ chiude 4-5 dubbi veri
   └─ Microcopy rassicurante (carta non richiesta)

5. COMMITMENT (click)
   ├─ CTA visibile in ogni fold (sticky nav)
   ├─ Form post-click = 2 campi massimo
   └─ Microcopy finale ("cancella in 1 click")
```

(Fonte: `21_user_flow.md` — 8 micro-passaggi cognitivi di Brian Massey, semplificati.)

---

## Quando abbandona — i 10 trigger di fuga

1. **Above-the-fold non chiaro** — utente non capisce in 5 sec
2. **Visivo hero fake** — 3D illustration, AI-generated look
3. **CTA competing** — più CTA primary che competono
4. **CTA nascosta** — non sticky, non sempre visibile
5. **CTA copy vago** — "Submit", "Click here", "Get started!"
6. **Modulo lungo** — 11 campi prima del click
7. **Pricing nascosto** — "Contact us for pricing"
8. **Mancanza rassicurazione** — nessuna microcopy sotto CTA
9. **Trust signals falsi** — "100k users" senza prove
10. **Mobile broken** — viewport mobile che rompe il layout

(Fonte: `16_conversion_patterns.md`, `18_mobile_behavior.md`, `24_checklist_antislop.md`.)

---

## Architettura finale in 9 sezioni

(vedi `22_architettura_finale.md` per dettaglio. Qui solo struttura.)

| # | Sezione | Scopo | Visual weight |
|---|---------|-------|---------------|
| NAV | Sticky nav | Orientation + CTA always-on | Sempre visibile |
| 1 | HERO | Attention 3 sec | Massimo (anchor 1) |
| 2 | PROBLEMA | Evaluation validation | Medio-basso (anchor 4) |
| 3 | SOLUZIONE + COME | Trust + Ability | Medio (anchor 3) |
| 4 | COSA INCLUDE | Depth (clarity) | Medio-basso (anchor 5) |
| 5 | PROVA | Trust | Basso (anchor 6) |
| 6 | PRICING | Comparison | Alto (anchor 2) |
| 7 | FAQ | Objection closer | Basso (anchor 7) |
| 8 | CTA FINALE | Commitment | Alto (anchor 2 sister) |
| FOOTER | Utility meta-info | IA secondaria | Minimo (anchor 8) |

---

## Decisioni progettuali (sintesi)

| Decisione | Vincolante | Motivazione |
|-----------|------------|-------------|
| Inter Variable font | ✅ Sì | Open source, performance, weight tot |
| 9 token tipografici | ✅ Sì | Limita possibilità, forza attenzione |
| 8px spacing grid | ✅ Sì | Multiplo di 16/24/32 |
| Emerald `#10B981` CTA | ✅ Sì | Differenziazione (no Stripe blu, no Notion nero, no Vercel nero) |
| Warm off-white bg | ✅ Sì | Welcome vs tech blu-grigio |
| Soft black fg | ✅ Sì | Evitare retina vibration |
| NO gradient button | ✅ Sì | AI-slop signal |
| NO glow su CTA | ✅ Sì | AI-slop signal |
| NO 3D illustration | ✅ Sì | AI-slop signal |
| NO emoji in UI | ✅ Sì | Sostituito con Lucide icons |
| 1 CTA primaria globale | ✅ Sì | Iyengar + Thaler |
| Form 2 campi massimo | ✅ Sì | Baymard -10% per campo |
| 2 tier pricing | ✅ Sì | Iyengar max 3 |
| FAQ 5 domande vere | ✅ Sì | Miller 7±2 |
| Sticky nav sempre | ✅ Sì | Fogg Prompt |
| Mobile bottom-CTA | ✅ Sì | Fogg thumb zone |
| WCAG 2.2 AA minima | ✅ Sì | Legal + etica |
| Reduced motion rispettato | ✅ Sì | Accessibilità |
| Cookie banner GDPR | ✅ Sì | Legal EU |

---

## Sistema di token (estratto, vedi `23_design_system.md`)

### Tipografia

```
display-2xl:  56px / 36px mobile  | line-height 1.05 | weight 700 | letter-spacing -0.02em
display-xl:   44px / 32px         | line-height 1.1  | weight 700 | letter-spacing -0.02em
display-l:    32px / 26px         | line-height 1.15 | weight 600 | letter-spacing -0.015em
display-m:    22px / 20px         | line-height 1.25 | weight 600 | letter-spacing -0.01em
body-l:       18px / 17px         | line-height 1.55 | weight 400
body-m:       15px / 15px         | line-height 1.6  | weight 400
body-s:       13px / 13px         | line-height 1.5  | weight 400
caption:      12px / 12px         | line-height 1.4  | weight 500 | letter-spacing 0.02em
```

### Colori

```
bg-canvas:       #FAFAF9  (warm off-white)
bg-subtle:       #F5F5F4
bg-elevated:     #FFFFFF
fg-primary:      #0E0E10  (soft black)
fg-secondary:    #52525B
fg-tertiary:     #A1A1AA
border-subtle:   #E7E5E4
border-strong:   #D4D4D8

brand-500:       #10B981  (CTA primary)
brand-600:       #059669  (hover)
brand-700:       #047857  (active)
fg-on-brand:     #FFFFFF  (testo su brand)

success:         #10B981
warning:         #D97706
danger:          #DC2626
```

### Spacing (8px modulo)

```
space-2:   4px     (inline iconografia)
space-3:   8px
space-4:  12px
space-5:  16px
space-6:  24px     (padding card)
space-8:  32px
space-10: 40px
space-12: 48px
space-16: 64px     (section mobile)
space-20: 80px     (section desktop)
space-24: 96px
space-32: 128px
```

### Grid

```
Desktop: 12 colonne, gutter 24px, container max 1200px
Tablet:  8 colonne,  gutter 20px, container max 768px
Mobile:  4 colonne,  gutter 16px, container fluid
```

### Motion

```
motion-fast:   120ms ease cubic-bezier(0.7, 0, 0.3, 1)
motion-base:   200ms ease cubic-bezier(0.16, 1, 0.3, 1)
motion-slow:   400ms ease cubic-bezier(0.16, 1, 0.3, 1)
```

---

## Bias cognitivi utilizzati (e perché)

(Fonte: `03_behavioral_economics.md` + `13_cta_psychology.md`.)

| Bias | Pattern landing | Perché funziona qui |
|------|----------------|---------------------|
| Default effect | Tier Free è pre-attivo | L'utente che non sceglie atterra su Free, opzione sicura |
| Anchoring | Tier Premium mostra €9.90/mese con €0 Free accanto | Il Free rende il Premium "ragionevole" (Kahneman) |
| Loss aversion | "1 mese gratis" + "cancella in 1 click" | Enfatizza cosa **non** perderai |
| Reciprocity | Disclaimer trasparente su early-stage | Dà info gratis = l'utente vuole ricambiare |
| Commitment consistency | Micro-yes progressivo durante scroll | Ogni sezione è un mini-impegno che prepara il sì finale |
| Specific trust | "12.000+ domande" vs "migliaia di domande" | Numeri precisi attivano authority (Cialdini) |
| Pain normalization | "Studiare un bando intero non ti prepara al concorso" | L'utente si riconosce, non si sente compatito |
| Availability | FAQ con domande vere (le prime 4-5 che l'utente fa) | Le risposte sono quelle che l'utente si sta chiedendo |
| Framing | "1 mese gratis" invece di "Prova 14 giorni Premium a €9.90" | Framing positivo (Tversky) |

---

## Anti-AI-slop — cosa la landing NON è

(Fonte principale: `24_checklist_antislop.md`.)

| Pattern bannato | Perché |
|-----------------|--------|
| Hero gradient `linear-gradient(135deg, ...)` | Segnale universalmente riconosciuto di AI-gen |
| Glow su button (`box-shadow: 0 0 30px`) | Anni '90/2000 |
| Glassmorphism su cards | Templated, datato |
| Mega-menu hover | Nielsen -15-25% bounce |
| Animazione parallax | Baymard -12% conversion |
| Video auto-play hero | Baymard +23% bounce, Web Vitals penalizza |
| 3D illustration | AI-gen detect |
| Stock photo "team meeting diverse people" | Templated |
| Emoji in UI | Sostituito con Lucide |
| Trust badges finti | Rilevabili a colpo d'occhio |
| Testimonial inventato con nome + foto stock | Trust crolla, retention -30% |
| Statistiche gonfiate | FTC 2023 + EU consumer law |
| Countdown timer | Dark pattern, penalizzato Italian Garante |
| Modali aggressive / exit-intent popup | NN/g -40% trust |
| Form 11+ campi | Baymard -110% (10% × 11) |
| Buzzword stack ("revolutionize, empower, transform") | Italian SaaS premium non li usa |
| Carosello auto-advancing | Baymard, WCAG |
| Mega footer con 24 link | Duplicazione IA cattiva |
| CTA copy "Submit" / "Click here" | Reinhart button study |

---

## Implementazione pratica

### Per il senior designer

1. Apri `22_architettura_finale.md` → fai wireframe delle 9 sezioni
2. Apri `23_design_system.md` → configura i token in Figma / rive / Code

### Per il senior frontend engineer

1. Setup design tokens (CSS custom properties o Tailwind config) da `23_design_system.md`
2. Costruisci i componenti base da `23_design_system.md` (Button, Form, Card, Pill)
3. Implementa le 9 sezioni in ordine da `22_architettura_finale.md`
4. Applica motion da `23_design_system.md` (motion-fast, motion-base, motion-slow)
5. Verify WCAG 2.2 AA con Chrome DevTools + Lighthouse
6. Verify reduced-motion con DevTools
7. Pass `24_checklist_antislop.md` come QA finale

### Stack suggerito

- **Framework**: Next.js 14 + App Router (o Astro per landing pura)
- **Styling**: Tailwind CSS 4 con token configurati in `tailwind.config.ts`
- **Font**: `next/font/google` con Inter Variable
- **Type**: TypeScript strict
- **Linting**: ESLint + a11y plugins
- **Testing**: Playwright (E2E), jest-axe (a11y)

### Performance target

- **LCP** < 2.5s (hero)
- **CLS** < 0.1 (niente shift di layout)
- **INP** < 200ms (interazioni CTA snappy)
- **Lighthouse mobile** ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- **Bundle size** < 100KB gzip (entry)

---

## Validazione finale

Prima del deploy, esegui:

1. **Lighthouse mobile** → screenshot report → se Accessibility < 95, correggi
2. **WCAG 2.2 audit** (axe DevTools) → 0 critical/serious violations
3. **Screen reader test** (VoiceOver iOS, NVDA Windows) → hero + CTA + pricing leggibili
4. **Keyboard navigation** → tab attraversa tutta la pagina senza mouse
5. **Mobile real device test** (iPhone 12, Pixel 6, 360px viewport) → no overflow, CTA touch 44×44px
6. **Performance budget** → niente asset > 100KB senza necessità
7. **Cross-browser** → Chrome, Firefox, Safari, Edge (no Chrome-only)
8. **24 antislop checklist** → ogni singola voce passata

---

## Quando la landing è "finita"

È finita quando:

- ✅ Rispetta tutti i token di `23_design_system.md`
- ✅ Rispetta la struttura di `22_architettura_finale.md`
- ✅ Passa la `24_checklist_antislop.md` al 100%
- ✅ Lighthouse mobile ≥ 90 su tutte le metriche
- ✅ WCAG 2.2 AA verificato
- ✅ Copy validato da `11`, `12`, `13`, `15`
- ✅ Trust + Pricing + FAQ oneste (no claim gonfiati)
- ✅ Form 2 campi max
- ✅ CTA sticker su mobile + desktop
- ✅ Testata su 3+ viewport
- ✅ Performance budget rispettato
- ✅ Reduced motion funzionante

---

## Takeaway finali

1. **8 micro-passaggi cognitivi** sono il backbone della landing.
2. **3 secondi decidono** se l'utente resta. **20 secondi** se si fida.
3. **Ogni claim deve essere verificabile**. Trust falso = retention distrutta.
4. **1 CTA primaria globale** massimizza conversion. Più CTA = paralisi.
5. **Form minimo** è legge. 2 campi massimo 3.
6. **Pricing in EUR, 2 tier, Free chiaramente Free**.
7. **FAQ onesta** chiude 5 obiezioni reali del target.
8. **Microcopy rassicurante** sotto CTA è Fogg-MAP (Ability).
9. **Anti AI-slop** non è negoziabile. Italian Garante + dark patterns detection = cause reali.
10. **Performance non è opzionale**. LCP < 2.5s è SEO e conversion diretta.

---

## Come questo playbook viene usato

### Implementazione fase 1: Wireframe (1-2 giorni)

- Designer → apre `22_architettura_finale.md`
- Produce wireframe low-fidelity delle 9 sezioni
- Nessuna decisione decorativa: tutto motivato da file X.Y.md

### Implementazione fase 2: Design tokens (1 giorno)

- Designer + frontend → configura token da `23_design_system.md`
- Variabili CSS o Tailwind config o Stitches/vanilla-extract
- Lock a questi token durante tutto il build

### Implementazione fase 3: UI costruzione (3-5 giorni)

- Frontend → implementa le 9 sezioni in ordine
- Ogni componente usa i token
- Verifica motion e accessibility progressivamente

### Implementazione fase 4: Copy (1-2 giorni)

- Copywriter → scrive ogni sezione in base a `22_architettura_finale.md`
- Passa `11_copywriting.md`, `12_microcopy.md`, `13_cta_psychology.md`, `24_checklist_antislop.md`
- 0 emoji, 0 buzzword

### Implementazione fase 5: QA (1 giorno)

- QA → esegue `24_checklist_antislop.md` checklist pre-pubblicazione
- Lighthouse, axe, mobile testing
- Se tutto verde → ship

### Tempo totale: ~7-10 giorni lavorativi

---

## Vincoli non negoziabili (sintesi)

1. ❌ NO emoji in UI (mai, da nessuna parte)
2. ❌ NO gradient su button (mai)
3. ❌ NO glow su elementi (mai)
4. ❌ NO claim non verificabile
5. ❌ NO form > 3 campi
6. ❌ NO testimonial inventato
7. ❌ NO countdown farlocco
8. ❌ NO dark pattern
9. ❌ NO mega-menu
10. ❌ NO video auto-play
11. ❌ NO carousel auto-advancing
12. ❌ NO carousel di immagini auto-advancing
13. ❌ NO modale intrusivo
14. ❌ NO 3D illustration hero
15. ❌ NO stock photo di persona sorridente

Tutto ciò che è "❌ NO" qui è **undebatable**. Discussioni su queste voci hanno già perso in partenza.

---

## Riferimenti rapidi

| Vuoi capire... | Apri |
|----------------|------|
| Come pensa il visitatore | `01_psicologia_utente.md` |
| Perché clicca | `02_decision_making.md` + `03_behavioral_economics.md` |
| Cosa dirgli | `04_jobs_to_be_done.md` + `11_copywriting.md` |
| Come strutturare | `20_information_architecture.md` + `21_user_flow.md` |
| Cosa scrivere in ogni sezione | `22_architettura_finale.md` |
| Token visivi | `23_design_system.md` |
| Cosa evitare | `24_checklist_antislop.md` |
| Le fonti di tutto | `25_fonti_complete.md` |

---

## Una frase

> La landing perfetta è **talmente concreta** che il visitatore italiano si convince in 3 secondi di non essere davanti a una truffa, e in 20 secondi di essere davanti al prodotto che gli serve.

Tutto il resto è decorazione.

---

*Fine del documento. Per qualsiasi dubbio, riferimento a XX_nome.md della knowledge base.*
