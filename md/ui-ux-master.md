# UI/UX MASTER — ConcorsoAI Design Knowledge Base

> **Fonte di verità.** Questo è il documento che guida il design e l'implementazione
> di ConcorsoAI. Ogni decisione di prodotto è motivata da ricerca, psicologia
> cognitiva, evidenze eye-tracking, principi WCAG, e pattern consolidati sui
> migliori SaaS mondiali (Stripe, Linear, Raycast, Granola, Vercel, Perplexity,
> Notion, Mercury).
>
> Non è una guida generica. È specifica a **ConcorsoAI**: SaaS italiano che
> simula l'orale dei concorsi pubblici, target candidato 25–45 anni, ansioso,
> con budget e tempo limitati, orientato a "Passare il concorso" non a
> "Usare un tool".

---

## INDICE

| # | Capitolo | Scopo |
|---|----------|-------|
| 1 | Fondamenti di UI | Definire cos'è UI premium e perché |
| 2 | Fondamenti di UX | Come pensa, decide, ricorda un essere umano |
| 3 | Psicologia cognitiva applicata | Bias, euristiche, scelta, motivazione |
| 4 | Gerarchia visiva | Cosa vede l'occhio prima, dopo, mai |
| 5 | Tipografia | Voce scritta del brand |
| 6 | Colori | Personalità, contrasto, palette discipline |
| 7 | Spacing | Ritmo, respiro, densità informativa |
| 8 | Grid e allineamento | Come organizzare lo spazio senza occhio |
| 9 | Layout | Composizione, asimmetria, ritmo verticale |
| 10 | Design System | Token, governance, evoluzione |
| 11 | Componenti | Anatomia di ogni elemento UI |
| 12 | UX Patterns | Onboarding → retention, errori, recovery |
| 13 | Microinterazioni | Hover, focus, press, loading, motion |
| 14 | Landing Page patterns | Hero, mockup, CTA, narrative |
| 15 | Auth patterns | Signup, login, password, session |
| 16 | Dashboard patterns | Info density, filtri, empty states |
| 17 | Accessibilità | WCAG 2.2 AA operativo |
| 18 | Mobile UX | Thumb zone, viewport, gestures |
| 19 | Anti-AI-Slop | Cosa NON fare (catalogo) |
| 20 | Decision tree operativi | Regole per designer e dev |

---

# 1. FONDAMENTI DI UI

## 1.1 Definizione operativa

La UI è l'**interfaccia testuale e grafica** tra l'intenzione dell'utente e la
logica del prodotto. Non è decorazione. È uno strumento con 3 funzioni:

1. **Orientare** — dire all'utente dove si trova e cosa può fare
2. **Decidere** — rendere ovvio cosa cliccare, comprare, lasciare
3. **Rassicurare** — far capire che il sistema sta funzionando

Una UI premium non è più bella. È **più orientante, più decidente, più
rassicurante**. La bellezza è una conseguenza.

## 1.2 I 4 requisiti non negoziabili di una UI premium

| Requisito | Misura |
|-----------|--------|
| **Chiarezza** | L'utente capisce cosa fare in <5 secondi |
| **Coerenza** | Lo stesso elemento si comporta uguale ovunque |
| **Restraint** | Niente che non serva alla conversione |
| **Restituzione** | Ogni azione riceve feedback (visivo, testuale, haptico) |

Se manca uno dei quattro, la pagina diventa "bella ma inutile" (= AI-slop).

## 1.3 La regola del "perché esiste"

Ogni elemento UI deve rispondere alla domanda:

> "Perché questo elemento esiste qui?"

Se non ha una risposta, l'elemento va rimosso. La pagina deve essere il
risultato di una serie di decisioni, non di default.

---

# 2. FONDAMENTI DI UX

## 2.1 Modello cognitivo dell'utente

L'utente non legge. **Scannerizza** (NN/g, Krug, NN/g eyetrack studies 2006–2022).

- Vede prima il pattern visivo (massa, colore, dimensione)
- Decifra il significato in 50–300 ms (System 1, Kahneman)
- Decide se proseguire (Fogg B=MAP: motivation × ability × prompt)
- Se decide di proseguire, attiva System 2 (deliberato, lento)

Tutta la UI deve essere ottimizzata per System 1. System 2 interviene solo
dopo il click — nel prodotto.

## 2.2 Tempo di attenzione

| Tempo | Cosa succede | Decisione dell'utente |
|-------|--------------|----------------------|
| 0–50 ms | First impression visiva | Rimane o esce (Lindgaard 2006) |
| 50–500 ms | Pattern recognition, layout | Comprende cosa può fare |
| 500 ms–3 s | Lettura H1 + sub | Decide se è "per me" |
| 3–10 s | Scroll, sezione 1 | Inizia a fidarsi o dubita |
| 10–60 s | Valutazione completa | Click o abbandono |

(NN/g first-impressions 2006, Krug scannability 2014)

## 2.3 Le 4 domande latenti

Per ogni schermata l'utente si pone inconsciamente:

1. **Dove sono?**
2. **Cosa posso fare qui?**
3. **Perché mi serve questo?**
4. **Quanto mi costa (tempo, soldi, fatica)?**

La UI deve rispondere alle 4 in ordine, prima ancora dell'azione.

## 2.4 Cognitive Load (Sweller 1988)

3 tipi di carico cognitivo:

- **Intrinsic** — complessità del task (inevitabile)
- **Extraneous** — confusione, rumore, layout sbagliato (DA ELIMINARE)
- **Germane** — apprendimento intenzionale (DA MASSIMIZZARE)

Una UI premium **uccide extraneous load** (gradient, glassmorphism, badge,
toast inutili, frasi motivazionali).

---

# 3. PSICOLOGIA COGNITIVA APPLICATA

## 3.1 System 1 / System 2 (Kahneman 2011)

| System 1 (veloce, automatico) | System 2 (lento, deliberato) |
|---|---|
| Primi 5 secondi di una pagina | Dopo il click, dentro il prodotto |
| Pattern, colori, masse visive | Confronti, calcoli, valutazioni |
| Istinto, bias | Logica, ragione |
| Ottimizzato per questa fase | Allocato qui solo se necessario |

**Regola operativa:** la landing è System 1. Dentro al prodotto (dashboard,
auth, simulazione) può/d deve essere System 2.

## 3.2 Loss aversion (Kahneman-Tversky 1979)

Persone perdono ≥2x psicologicamente rispetto a quanto guadagnano equivalentemente.
Operativamente:

- "30 giorni di Pro. Se non va bene, indietro tutto." → anti-loss framing
- "Cancelli quando vuoi, via tutto." → riduzione del rischio di perdita
- Mai countdown farlocco (FTC 2023 + Italian Garante)
- Mai "Only 3 spots left!" (dark pattern, EU consumer law)

## 3.3 Anchoring (Tversky-Kahneman 1974)

Il primo numero/info che vedi influenza tutti i giudizi successivi.

Operativamente:
- Pricing: mostra €14,99/month dopo aver mostrato "3 simulazioni gratis/mese"
- Trust: "30 giorni di Pro" prima del prezzo → anchor positivo
- Copy: "Senza carta" prima di "Registrati" → anchor rassicurante

## 3.4 Choice Overload (Iyengar-Lepper 2000)

24 jam → 3% conversione. 6 jam → 30% conversione.

**Regola:** max 3 opzioni in pricing, max 3 step in onboarding, max 3-5 voci
in lista comparativa. Mai >7±2 (Miller).

## 3.5 Cialdini × UI (2006)

| Principio | Pattern UI |
|-----------|-----------|
| **Reciprocity** | Free tier generoso prima del paywall |
| **Commitment** | Micro-yes progressivi (quiz, preferenze) prima del signup |
| **Social proof** | Testimonial veri (mai inventati), counter live se vero |
| **Authority** | Citazioni fonti normative, technical credibility |
| **Liking** | Microcopy onesto, brand voice amichevole ma non finto |
| **Scarcity** | Solo se reale (posti limitati in beta, NON finto) |
| **Unity** | Community ("Unisciti a 1.247 candidati questo mese") se vero |

## 3.6 Fogg Behavior Model (2009)

$$B = M \times A \times P$$

- **Motivation** (alto per candidato al concorso: ansia, paura fallimento, voglia
  di passare)
- **Ability** (la landing deve essere SEMPLICE, non motivante a vuoto)
- **Prompt** (CTA visibile, sempre, microcopy che rassicura)

**Insight:** investire in **A** (riduzione attrito, semplicità) batte
investire in **M** (motivazione a parole, hype).

## 3.7 Hick's Law (1952)

Tempo di decisione cresce logaritmicamente con il numero di scelte.

$$T = b \cdot \log_2(n + 1)$$

**Regola UI:**
- Nav: 3–5 voci + CTA
- Hero: 1 CTA unica
- Pricing: 2 tier (free + 1 paid)
- Footer: max 4 link per colonna

## 3.8 Miller's Law 7±2 (1956)

Working memory ≈ 7±2 chunks (riveduto: 4±1 chunks, Cowan 2001).

**Regola UI:**
- Liste: 3 massimo 5 items visibili
- Step processo: 3 step (chunked)
- Form: max 5 campi per step

## 3.9 Fitts's Law (1954)

Tempo per raggiungere un target è funzione di distanza/larghezza.

$$T = a + b \cdot \log_2(D/W + 1)$$

**Regola UI:**
- CTA primary: 44×44px minimo (iOS HIG), 48×48 (Material)
- Mobile sticky CTA: sempre presente dopo l'hero
- Edge/Corner targets hanno larghezza "infinita" (bordo schermo) → mobile
  thumb-friendly

## 3.10 Peak-End Rule (Kahneman)

Le persone ricordano un'esperienza in base al **picco** e alla **fine**, non
alla media.

Per ConcorsoAI:
- **Picco**: momento in cui la simulazione dà il feedback "Hai dimenticato
  le fonti normative, art. 12 L. 241/1990" → AHA
- **Fine**: chiusura "La parte difficile — lo studio — resta tua" → poetica,
  non minacciosa

## 3.11 Zeigarnik Effect (1927)

Le persone ricordano task incompiuti meglio di task completati.

**UI application:**
- Progress bar (Domanda 2/5) → task incompleto → motivazione a proseguire
- Onboarding checklist con X/Y completati
- Banner "Completa il tuo profilo" persistente finché non fatto

---

# 4. GERARCHIA VISIVA

## 4.1 Cos'è

Gerarchia visiva = **l'ordine in cui l'occhio umano legge una pagina**.

Basata su (Bertin, Semiology of Graphics 1967):

1. **Posizione** (top-left = anchor primario)
2. **Dimensione** (più grande = più importante)
3. **Colore/Contrasto** (più contrastato = più importante)
4. **Densità** (spazio vuoto = messaggio)
5. **Allineamento** (griglia = ordine)
6. **Forma** (irregolare = attira)

## 4.2 I pattern di lettura

| Pattern | Quando |
|---------|--------|
| **F-pattern** | Pagine dense di testo (blog, articoli, search results) |
| **Z-pattern** | Landing semplici, sopra il fold |
| **Gutenberg** | Pagine di stampa/editoriale |

Per ConcorsoAI landing: **Z-pattern sul primo fold, F-pattern nel resto**.

## 4.3 Anchor 1 / Anchor 2

Ogni pagina web ha SOLO due elementi che l'occhio NON deve perdere:

- **Anchor 1**: Hero H1 o equivalente (posizione top-left)
- **Anchor 2**: CTA primaria (il bottone che vogliamo cliccato)

Tutto il resto è **decoration** o **context**. Non competere con gli anchor.

## 4.4 Il test della sfocatura

Se sfocate la pagina, devono restare visibili:

1. H1 (la parola/frase più scura/più grande)
2. CTA (il blocco più contrastato)
3. Struttura dei titoli H2 (gerarchia ulteriore)

Se NON restano, ridisegnare.

## 4.5 Errori comuni

| Errore | Cosa vede l'occhio | Cosa dovrebbe vedere |
|--------|--------------------|--------------------:|
| H1 weight 400 = stesso del body | Uniforme, no focus | H1 weight 600, contrast +30% |
| CTA stesso colore di un altro bottone | Due CTA competono | CTA unica dominante |
| Sezioni tutte stesso peso visivo | Pianura, no ritmo | Masse alternate (Bertin) |
| Spaziature identiche tra sezioni | Robotico, AI-feel | Variabili (96/80/112/144px) |

---

# 5. TIPOGRAFIA

## 5.1 La regola d'oro della tipografia SaaS

**1 sola font family + eventualmente 1 mono variante** (Stripe, Linear,
Mercury, Notion, Raycast: tutti mono-family).

Perché:
- Coerenza percepita
- Performance (4 weight caricati)
- Trust (variazione = "assemblato" non "composto")

**Per ConcorsoAI:** Inter Variable 400/500/600 (caricato via fonts.bunny.net
GDPR-friendly, NON Google Fonts CDN). Niente mono variante nei testi
pubblici; mono solo per numeri importanti via `font-variant-numeric:
tabular-nums`.

## 5.2 Scale tipografica (1.2x ratio)

| Token | rem | px | Quando |
|-------|-----|----|--------|
| `--fs-caption` | 11px | caption, eyebrow, micro-label |
| `--fs-micro` | 13px | microcopy, hero-micro |
| `--fs-body` | 16px | base body |
| `--fs-lead` | 19–22px | lead paragraph |
| `--fs-h3` | 20–22px | sub-headings |
| `--fs-h2` | 30–48px | section H2 (clamp) |
| `--fs-h1` | 40–84px | hero H1 (clamp) |

**Uso di clamp()** per fluid typography:
`font-size: clamp(40px, 6.4vw, 84px);`

## 5.3 Line-height per tipo

| Tipo | line-height | Perché |
|------|-------------|--------|
| H1 | 1.0 | Compact, hero impact |
| H2 | 1.04 | Mid-tight |
| H3 | 1.25 | Leggermente aperto |
| Body | 1.5–1.65 | Leggibilità |
| Caption | 1.3–1.4 | Visibilità piccola |

## 5.4 Letter-spacing per tipo

| Tipo | letter-spacing |
|------|---------------|
| H1 | -0.04em (premium tightness) |
| H2 | -0.035em |
| H3 | -0.02em |
| Body | 0 (default) |
| Caption/eyebrow uppercase | +0.14em (articolazione) |

**Mai** letter-spacing negativo sotto -0.05em (illegibile).
**Mai** letter-spacing positivo +0.05em su body (effetto CAPS-LOCK).

## 5.5 Font-weight discipline

| Weight | Uso |
|--------|-----|
| **400** | Body prose, default |
| **500** | Eyebrow, button text, micro-emphasis |
| **600** | H1, brand, italic emphasis forte |

**Mai 700** su body o microcopy (URLATO percettivo).
**Mai 800** su body, su display solo se numeri (es. 90s timer).

## 5.6 Reading measure (larghezza riga)

| Contesto | Max-width |
|----------|-----------|
| Body | 56–64ch (~ 720–820px) |
| Essay/prosa | 32ch (~480px) — più stretto = più lettura attenta |
| Button text | libero (white-space: nowrap) |
| Caption | 80% del container |

(**Bringhurst, Elements of Typographic Style.**)

## 5.7 Sub-typography italiana

- **Virgolette italiane**: usa « » per il parlato (DOMANDA block),
  NON "..." standard americane
- **Maiuscole/minuscole**: i titoli in mixed-case, MAI tutto-uppercase
  tranne per caption/eyebrow
- **Punteggiatura**: spazio prima di `;:!?` (non dopo), no spazio per `.,`
  (italiana classica)
- **Enfasi**: italic solo per singole parole, MAI intere frasi

## 5.8 Errore comune: italic+bold su emphasis

❌ `<strong>...</strong>` + `font-weight: 700; font-style: italic`
→ effetto "marketing emo" (Vercel homepage clichè)

✅ `<em>...</em>` + `font-style: italic`
→ Italian editorial convention, sobrio, mantiene leggibilità

## 5.9 Performance tipografico

`font-display: swap` (no FOIT).
`<link rel="preconnect">` per CDN del font.
WOFF2 (non WOFF, NON TTF).
Subset latin + latin-ext.

---

# 6. COLORI

## 6.1 Filosofia: mono-cromo + accento chirurgico

**Regola Stripe/Linear:** 90% del UI è mono-cromatico (un solo hue family
di gray). 10% è il brand accent, usato SOLO in: CTA primary, link, stato
attivo. Mai background interi, mai decorative chrome.

Per ConcorsoAI mono-cromo warm:
- `--bg: #FAF8F3` (warm cream, "tipo carta")
- `--bg-2: #F2EDE2` (cream un gradino più cupo, usato 1 volta per differenziare sezione mockup)
- `--ink: #0F1115` (near-black, soft per retina)
- `--ink-soft: #2A2D34`
- `--ink-faint: #8A8E96` (meta-info)
- `--muted: #6B6F78` (caption)
- `--line: #E6DFD2` (warm divider)

## 6.2 Perché near-black `#0F1115` non pure black `#000`

`#000` su cream `#FAF8F3` ha contrasto 19:1 ma genera "vibrazione retina"
(halation su schermi OLED/clear-type). `#0F1115` ha contrasto ~17:1 ma
visivamente più morbido. Preferito da Linear, Stripe, Mercury, Vercel.

## 6.3 Tailwind palette personality

| Palette | Hue | Personalità |
|---------|-----|-------------|
| **Zinc** | cool gray | Developer tools, modern APIs (Vercel, shadcn default) |
| **Slate** | blue-gray | Enterprise, fintech (Stripe, Salesforce) |
| **Neutral** | pure achromatic | Editorial, content-first (Notion, Mercury) |
| **Stone** | warm brown-gray | Wellness, hospitality |
| **Gray** | slight green-gray | Legacy enterprise |

Per ConcorsoAI: **Stone/Neutral warm equivalents** (cream `#FAF8F3`, ink
`#0F1115`). Mai blue-tinted (è "fintech", "tech tool", non concorso pubblico).

## 6.4 OKLCH vs HSL vs RGB

Per design tokens moderni (Tailwind 4, Radix Colors):

- **HSL** non è percettivamente uniforme (giallo al 50% lightness = chiarissimo,
  blu al 50% = scuro)
- **OKLCH** è percettivamente uniforme (lightness = costante percezione
  indipendentemente da hue). Permette di generare scale 50→950 in modo
  programmaticamente affidabile.
- **Tailwind 4 default palette** usa OKLCH.

Raccomandazione: OKLCH per nuovi design tokens.

## 6.5 Quando forzare la rottura della palette

Status colors (error/warning/success/info) **rompono** sempre la palette
mono-cromatica. Servono per zero ambiguità cognitiva:

- Success: `#10B981` (green) → "Compilazione completata"
- Warning: `#D97706` (amber) → "Stai per esaurire le simulazioni gratuite"
- Error: `#DC2626` (rose-700) → "Email non valida"
- Info: `#0EA5E9` (sky) → "Novità nel piano Pro"

**MAI** usare status colors come CTA primary. (Es: mai bottone verde =
successo per "Iscriviti".)

## 6.6 Contrasto WCAG (vedi anche cap. 17)

| Testo | Ratio minimo |
|-------|--------------|
| Body normale (< 24px non-bold) | 4.5:1 (AA) |
| Body large (≥ 24px o ≥ 18.5px bold) | 3:1 (AA) |
| AAA | 7:1 (body) / 4.5:1 (large) |
| UI component / focus indicator | 3:1 (AA) |

ConcorsoAI cream `#FAF8F3` + ink `#0F1115`:
- Body: 16.97:1 ✓ AAA
- ink-soft: 13.5:1 ✓ AAA
- muted `#6B6F78`: 4.93:1 ✓ AA (limite)
- ink-faint `#8A8E96`: 3.21:1 (sotto AA — usato SOLO su captioni non essenziali)

---

# 7. SPACING

## 7.1 Sistema di spacing (multipli di 4)

| Token | px | Uso tipico |
|-------|----|-----------|
| `--s-1` | 4 | inline iconografia |
| `--s-2` | 8 | gap piccolo |
| `--s-3` | 12 | gap standard orizzontale |
| `--s-4` | 16 | padding card |
| `--s-5` | 24 | gap fra sezioni di testo |
| `--s-6` | 32 | padding section |
| `--s-7` | 40 | gap generoso |
| `--s-8` | 48 | margin-bottom blocco forte |
| `--s-9` | 64 | padding section heavy |
| `--s-10` | 96 | padding section principale |
| `--s-11` | 128 | solo hero top |

**Mai numeri fuori sistema**: mai 17px, 25px, 36px. Se serve una sfumatura,
arrotonda al token più vicino.

## 7.2 Ritmo verticale vs AI-feel

Pattern AI-feel: tutti i gap fra sezioni sono identici (es. sempre 96px) →
uniforme, piatto, generato.

Pattern premium (Bertin rhythm): **alternare masse**.

ConcorsoAI:
- Hero: padding `(--s-10) 0 (--s-10)` → 128px × 2
- Section 2 (S02 perché serve): padding `(--s-9) 0 (--s-9)` × OVERRIDE mobile → 80px × 2 (più tight)
- Section 3 (S03 fiducia): padding `(--s-10) 0 (--s-10)` → 128×2 + 2px ink border callout
- Section 4 (S04 mockup): padding `(--s-10) 0 (--s-10)` → 128×2 + bg-2 cream
- Section 5 (S05 prova): padding `(--s-9) 0 (--s-9)` → 80×2 (chiusura)

Pattern alternato: 112 → 80 → 128 → 128 → 80 = **compression/espansione**,
mai pianura.

## 7.3 Misure per mobile

Su mobile (≤ 720px):
- `--s-10` → 80px (era 96 desktop)
- `--s-9` → 56px (era 64-96 desktop)

Mai mantenere padding desktop su mobile — compressione necessaria per thumb
scrolling.

## 7.4 Whitespace come segnale

In design premium, **spazio vuoto è segnale**, non spreco.

Ogni "respiro" (gap 96px fra sezioni) dice all'utente: "stai entrando in un
nuovo pensiero, prenditi un momento".

Quando il respiro manca, il cervello percepisce densità = casino.

---

# 8. GRID E ALLINEAMENTO

## 8.1 Perché un grid

Bertin (1967): "Posizione è il primo livello di gerarchia visiva, prima di
dimensione e colore".

Un grid garantisce **coerenza di posizione** che l'occhio coglie
inconsciamente. Nessun elemento "fluttua".

## 8.2 Sistema ConcorsoAI

| Viewport | Colonne | Gutter | Container |
|----------|---------|--------|-----------|
| Desktop ≥ 1024 | 12 | 24px | 1200px |
| Tablet 720–1024 | 8 | 20px | 880px |
| Mobile < 720 | 4 | 16px | fluido |

Per la landing abbiamo scelto container **920px** (narrow editoriale).
Within container:
- 72px slot per section-num
- `1fr` per H2
- 80px slot per trust-list label column

## 8.3 Baseline alignment

La griglia verticale (baseline) deve allineare tutti i testi di un
medesimo paragrafo alla stessa **baseline** (non solo allineamento top).
In CSS questo richiede `vertical-align: baseline` sui testi e attenzione
a `line-height` (no fractional pixel drift).

## 8.4 Optical vs mathematical alignment

A volte la matematica inganna: un cerchio 24×24px centrato matematicamente
sembra basso rispetto al testo accanto. Va aggiustato 1px su o giù
manualmente — **optical alignment batte mathematical alignment** quando
l'occhio percepisce (Stripe, IBM Carbon lo fanno).

## 8.5 Common grid violations

| Cosa | Anti-pattern |
|------|--------------|
| Padding-left diverso da padding-right | "flat-lefted" layout |
| Margin bottom diverse tra sezioni simili | "AI feel" |
| Allineamento misto left/center/right su elementi correlati | "random" |

---

# 9. LAYOUT

## 9.1 Composizione asimmetrica vs simmetrica

Stripe, Linear, Granola: **asimmetria intenzionale**. L'occhio ama
variazione non randomica.

Esempi:
- Hero: H1 allineato a sx del container, sub parte più tardi (max-width
  44ch su H1 16ch)
- Mockup: bordi arrotondati 6px invece di 4 standard → micro-differenziazione
- Footer: brand-tag prende 2fr, nav 1fr ciascuna → asimmetria layout

Simmetria perfetta = template/AI-feel.

## 9.2 Above-the-fold: cosa DEVE esserci

Secondo Krug (Don't Make Me Think) + NN/g:

1. Logo/Nav
2. H1 (identifica cosa è)
3. Sub (identifica per chi è)
4. CTA primary
5. Microcopy rassicurante (no carta, cancelli subito)
6. Visual proof (mockup o screenshot)

**Mai caroselli, mai video auto-play, mai popup.**

## 9.3 Below-the-fold: come si legge

La decisione "scrollo o abbandono" si prende nei primi 3 secondi. Lo scroll
deve continuare a rispondere a domande progressive:

```
- Hero: "Cos'è?" → OK, capisco
- S02 perché: "Mi serve?" → Mi risuona
- S03 fiducia: "Mi posso fidare?" → Le prove
- S04 mockup: "Come funziona?" → Vedo il prodotto
- S05 prova: "Cosa ottengo?" → Confronto + CTA
```

Questo è il "decision flow ideale". Mai cambiare ordine senza motivo
forte.

## 9.4 Long-scroll vs short

**Long-scroll batte short** per SaaS B2C/B2B quando il prodotto è
intricato. Un utente che arriva al footer dopo 8 sezioni ha consumato il
copy che spiega il prodotto. Un utente che vede solo hero non ha ancora
fiducia.

ConcorsoAI: 5 sezioni = landing long-scroll bilanciata.

---

# 10. DESIGN SYSTEM

## 10.1 Cos'è un design system

Un design system è la **codifica delle decisioni** in token riusabili. NON
è un Figma library. È la **governance delle decisioni** che il team può
evolvere.

Componenti obbligatori:

| Strato | Tipo | Esempio |
|--------|------|---------|
| **Token primitivi** | Valori grezzi | `--ink: #0F1115`, `--s-7: 40px` |
| **Token semantici** | Valori di ruolo | `--color-text`, `--space-section` |
| **Componenti** | UI riusabili | Button, Input, Card, Modal |
| **Pattern** | Combinazioni | Pricing card, Empty state, Toast |

## 10.2 ConcorsoAI Token Stack

```css
:root {
  /* Palette */
  --bg, --bg-2, --ink, --ink-soft, --ink-faint, --muted, --line, --line-2

  /* Typography */
  --font-sans, --tracking: 0.14em

  /* Spacing */
  --s-1..--s-11 (4/8/12/16/24/32/40/48/64/96/128)

  /* Container */
  --container: 920px

  /* Motion */
  --t-fast: 120ms, --t-base: 200ms, --ease: cubic-bezier(0.16, 1, 0.3, 1)
}
```

## 10.3 Principi di governance

1. **Un solo valore per ruolo** — Due `--ink` token? Mai. Uno solo.
2. **Token usati o rimossi** — Mai dead tokens.
3. **Modifica del token = ricaduta globale** — Cambia `--ink` e tutte le
   100 occorrenze si aggiornano.
4. **Documentazione inline nel CSS** — ogni token con commento semantico.
5. **Versioning** — change log in `MASTER_PLAYBOOK.md` ogni volta che un
   token cambia.

---

# 11. COMPONENTI

## 11.1 Bottoni

### Anatomia

```
[ icona ][ label ] →    ← freccia se CTA
[ padding: 13px 20px ]
[ border-radius: 4 px ]  ← sharp, non pill
```

### Varianti

| Variante | When | Background | Border | Text |
|----------|------|-----------|--------|------|
| **Primary** | CTA unica per fold | `var(--ink)` | 1px ink | `var(--bg)` |
| **Secondary** | Azione supporting | `var(--bg)` | 1px ink | `var(--ink)` |
| **Ghost** | Inline in copy | transparent | 0 | `var(--ink)` underline |

### Decisioni vincolanti

- **Radius 4px, non 6/8/16**. 4 è sharp-editoriale (Apple, Mercury, Linear
  preferiscono). 8+ è morbido-pillola (Slush).
- **Primary bold, Secondary outline**. Mai primary-outline E secondary-filled
  (confusione).
- **Hover invertito**: bg ↔ color. Mai scale 1.05 (è gimmicky).
- **`arrow` animation**: `translateX(3px)` su hover, 200ms ease (Linear-style).
- **Focus-visible** sempre: outline 2px ink, offset 3px (WCAG 2.4.7).
- **Active state**: `transform: scale(0.985)` 120ms (Apple touch response).

## 11.2 Input (text field)

### Anatomia

```
[ label ]              (sopra l'input, 12px uppercase tracked)
[ input 17px ]         (44px tall, padding 12px 14px)
[ helper text ]        (sotto, 13px muted)
```

### Stati

| Stato | Visivo |
|-------|--------|
| Default | border 1px `var(--line)` |
| Focus | border `var(--ink)`, outline 0 (border è focus) |
| Error | border `var(--error)` (rose 600), helper text red |
| Disabled | bg `var(--bg-2)`, opacity 0.6, cursor not-allowed |

### Decisioni vincolanti

- **Mai placeholder come label**. Placeholder è solo hint temporaneo.
- **Mai label a destra dell'input** (occupa width, confusione).
- **Sempre label visibile** sopra l'input per accessibilità.
- **Error message concreto**: "L'email deve contenere @" non "Errore".

## 11.3 Form

### Principi

1. **Minimum fields** — ogni campo extra costa ~10% conversion (Baymard).
   Massimo 3-5 campi in signup autenticato.
2. **Single column** — anche se form ha 5 campi, MAI 2 colonne (eye-tracking
   rompe).
3. **Progress visible** — se multi-step, mostra "Step 2 of 3".
4. **Inline validation** — durante la digitazione (debounced), non solo
   onSubmit.
5. **Submit chiaro** — "Crea account" non "Submit" (Reinhart button study).

### ConcorsoAI signup (ipotizzato)

| Campo | Tipo | Validation |
|-------|------|-----------|
| email | text | regex posta + DNS check (no completo, solo sintassi) |
| password | password | strength meter visual + 8 char minimo |
| nome | text | solo se necessario per personalizzazione |

**Mai** chiedere: telefono, indirizzo, CAP, codice fiscale al signup.

## 11.4 Select / Dropdown

### Anatomia

- Native `<select>` per mobile (UX nativa).
- Custom dropdown SOLO desktop con molte opzioni.

### Quando custom

- 10+ opzioni: serve search interno.
- Opzioni con descrizione: richiede 2-line layout.
- Multi-select: richiede checkboxes + tags.

### Altrimenti usa `<select>` nativo. Davvero.

## 11.5 Checkbox & Radio

### Checkbox

- 18×18px quadrato con border-radius 2px.
- Check interno: ink, semibold glyph.
- Label a destra, aligned baseline.
- Mai checkbox "solo" senza label (anche se label è "Accetto termini").

### Radio

- 18×18px cerchio border 2px ink, dot interno 8px.
- Alternative moderna: è row-based group (Linear-style), non stacked.

## 11.6 Cards

### Anti-pattern: DA NON FARE

❌ Card-glassmorphism con ombra pesante = template AI.
❌ Card con border-radius 16px + shadow forte = "saas marketing template".
❌ Card identiche 3-up con icone emoji = "product grid from hell".

### Pattern premium

✅ Card editorial-like, border only, no shadow.
✅ Card asimmetriche: una grande + due piccole.
✅ Card con hierarchy typografica interna forte (no equal weights).

## 11.7 Table

### Decisioni

- Header: 12px uppercase tracked, ink-faint, sticky su scroll.
- Row: 14px regular, hover bg `var(--bg-2)`.
- Cell padding: 12px 16px.
- Zebra-stripes: NO (visually noise). Solo border-bottom 1px `var(--line)`.
- Sortable column: caret ` ↓/↑` 12px.
- Empty state: "Nessun risultato" + suggerimento ("Prova a filtrare per
  Materia 02").

## 11.8 Modal / Dialog

### Quando usare

- Conferma destructive ("Sei sicuro di voler cancellare l'account?") → modal
- Form complesso (es. settings avanzati) → modal o drawer
- Visualizzazione rapida (preview PDF) → modal or inline

### NON usare per:

- Errori (toast)
- Conferme positive piccole (toast)
- Welcome messages (banner inline)

### Anatomia

- **Max-width 480px** desktop (mai full-width)
- Padding 32px
- Border-radius 6px
- Border 1px ink, shadow sottile (`box-shadow: 0 4px 20px rgba(15,17,21,0.08)`)
- Backdrop scuro: `rgba(15,17,21,0.4)` con `backdrop-filter: blur(4px)`
- Focus trap obbligatorio
- ESC per chiudere
- Focus ritorna all'elemento che l'ha aperto

## 11.9 Toast / Notification

### Tipi

| Tipo | Icon | Colore | Dismiss |
|------|------|--------|---------|
| Success | none (per anti-AI-slop, usa solo il colore) | green border-left | 4s |
| Error | none | red border-left | 8s o manuale |
| Info | none | blue border-left | 4s |

### Posizione

- Bottom-right desktop
- Top center mobile (sopra sticky CTA)

### Anatomia

- Background cream
- Border-left 3px status color
- Padding 14px 18px
- Border-radius 4px
- Border 1px line
- Testo 14px, max 1 riga + opzionale 1 sub-linea
- CTA inline se azione richiesta

## 11.10 Tooltip

### Quando

- Solo su iconografia senza label.
- Mai su testo visibile (il testo È già la spiegazione).
- Mai su CTA primary (ruba attenzione al click).

### Anatomia

- Font-size 12px
- Padding 6px 10px
- Background ink, color bg
- Border-radius 4px
- Appare su hover dopo 300ms delay (non istantaneo, fastidioso)
- Scompare su hover-out dopo 100ms
- Position: sopra il target (default), con freccia 6px

## 11.11 Accordion / Disclosure

### Pattern FAQ

- Header: click tutta la riga, non solo caret
- Icon: caret `› → ‹` rotates 90° su open
- Body: entra con `max-height` transition, no display:none toggle
- Border-bottom tra items
- DefaultState: solo H3 visibile, body collapsed
- OpenState: H3 + body

### ConcorsoAI FAQ (5 domande vere)

1. Funziona senza internet? → No (server EU)
2. Quante simulazioni posso fare gratis? → 3 al mese, sempre
3. Posso disdire il Pro? → Sì, 1 click, nessun modulo
4. È specifico per il mio concorso? → Sì, estrae materie dal tuo bando
5. Supporto è in italiano? → Sì, email + orario ufficio

## 11.12 Tabs

### Pattern

- Border-bottom 2px ink per tab attiva
- Tab inattiva: muted, hover ink
- Padding 12px 16px
- Font-size 14px
- Max 5 tab (Miller 7±2 ma 5 per SaaS pratico)
- **MAI** tabs che scrollano orizzontalmente (mobile UX pessimo)

## 11.13 Navbar

### Componenti

- Logo (sx)
- 3-5 voci nav (centro o dx)
- CTA primary (dx, sempre visibile)

### Sticky decision

- **Sticky su desktop**: sì, con backdrop-blur (Linear/Granola pattern).
- **Sticky su mobile**: meglio "compact" (solo logo + CTA, niente menu).
- **NON** sticky bottom mobile (sticky top è più usabile).

### Background quando sticky

- Cream `rgba(250,248,243,0.82)` con `backdrop-filter: saturate(180%) blur(10px)`
- Border-bottom 1px line

## 11.14 Sidebar

### Quando

- Dashboard con molti tool (≥ 5 sezioni)
- App con gerarchia profonda

### Quando NON

- Landing page (sidebar = tool SaaS feel)
- App semplici (max 5 items, navbar è sufficiente)

### Pattern

- 240px wide desktop, full-width drawer mobile
- Icona 20px + label 14px per item, gap 24px
- Item attivo: bg `var(--bg-2)`, peso 500
- Collapse accordion per sub-sezioni

## 11.15 Footer

### Anatomia minima

```
[ brand+tag 2fr ]   [ nav A 1fr ]   [ nav B 1fr ]
─────────────────────────────────────────────────
[ © anno ]                              [ legal line ]
```

### Decisioni

- **Max 4 link per colonna nav**. Mai 8+ link.
- **Brand+tag ha sempre un "legal-line"** sotto (sede legale, P.IVA quando
  presente, beta status).
- **NO** link "Sign up" ridondante nel footer (è già in nav/hero).
- **NO** mega-footer con 24 link.

### ConcorsoAI Footer (3 colonne)

- Col 1: brand + ConcorsoAI description + legal line
- Col 2: nav Prodotto (3 link: In pratica, Prezzi, Contatti)
- Col 3: nav Legale (4 link: Termini, Privacy, Cookie, supporto email)

Footer legal: "© 2026 · Milano · Costruito in Italia. Beta aperta dal 2025."

## 11.16 CTA (calls-to-action)

### CTA unica globale

**Regola Iyengar:** una sola CTA primaria visibile per fold. Altre CTA
("Scopri di più", "Vedi come funziona") sono secondary o ghost.

### QuandoCTA multiple

Solo se servono **scelte reali** (es. pricing Free vs Pro). Altrimenti
sono competing signals che confondono.

### Microcopy sotto CTA

Sempre. Fogg MAP: ability si riduce con rassicurazione.

Esempi:
- "Senza carta. Cancellazione in 1 click."
- "60 secondi. Nessuno ti chiamerà."
- "Versione Pro: €14,99/mese. Cancellabile."

## 11.17 Pricing

### Decisioni vincolanti (Iyengar, ConcorsoAI)

- **2 tier soli** (Free + Pro). Mai 3+.
- **Free chiaramente FREE** (zero decimal, "gratis per sempre").
- **Pro accanto a Free**, non Enterprise lontano (decoy per ancorare).
- **Annual highlight** se disponibile (sconto vs mensile).
- **Cancellation microcopy** sotto (Trust reversal, Cialdini).

### Pattern

- Card 1 (Free): border 1px line, no fill
- Card 2 (Pro): **border 2px ink**, "Consigliato" pill (mai animata)
- Feature list con ✓ + label (no icone)

## 11.18 Hero (vedi cap. 14)

## 11.19 Dashboard

### Principi

- **Information density proporzionale al seniority dell'utente**.
  Utente nuovo = poco, utente power = tanto.
- **Hero stat al top**: 1 numero grande (es. "Ultima simulazione:
  punteggio 78/100"), poi 2-3 secondary stats.
- **Recenti attività sotto**: lista cronologica ultimi X eventi.

### Componenti

- **Header**: title + filter + search + (opzionale) CTA
- **Cards**: 2-4 grandi per overview
- **Charts**: max 3 visibili simultaneamente
- **Tables**: max 8 row visible, pagination dopo
- **Sidebar nav** se >5 tool

## 11.20 Charts

### Decisioni

- **Mono-cromatici con 1 accento** (mai 5 colors rainbow).
- **Labels inline**, no legend esterna quando possibile.
- **Tooltip on hover** con valore preciso.
- **Empty state**: "Dati insufficienti. Fai la prima simulazione."
- **Loading**: skeleton mantieni forma del chart, no spinner.

## 11.21 Search

### Pattern

- Cmd+K command palette (Linear/Raycast style): ⌘K opens overlay.
- Search bar inline nell'header: max-width 360px.
- **Mai** search fullscreen su mobile (UX pessimo).

### Algoritmo

- Debounce 200ms (non ogni keystroke).
- Mostra top 5 risultati live + "Vedi tutti →" se >5.
- Highlight match in bold all'interno del risultato.
- Empty state: "Nessun risultato per [query]".

## 11.22 Pagination

### Pattern

- **Infinte scroll** se lista è timeline-like (log attività).
- **Pagination numerata** se lista è search/filterable.
- **Load more button** hybrid (Twitter-style).

### Anti-pattern

- ❌ "Showing 1-10 of 1,247" + frecce 1/2/3/...125 (troppo lungo).
- ❌ "Previous / Next" senza numeri (impossibile saltare).

## 11.23 Loading states

### Skeleton vs spinner

| Quando | Use |
|--------|-----|
| Lista di items noti (cards, table rows) | Skeleton mantieni forma |
| Azione singola una tantum (submit form) | Spinner inline al submit button |
| Initial page load | Spinner fullscreen breve (mai > 1s) |
| Auto-refresh di dati | Top-progress-bar (1px ink) |

### Duration psicologica

- < 100ms: utente non percepisce (istantaneo)
- 100–300ms: OK
- 300–1000ms: serve feedback
- > 1s: serve skeleton + ETA possibilmente

## 11.24 Empty state

### Anatomia

```
[ illustrazione minimal o icona ]  (opzionale, ma spesso single-line text)
[ Cosa puoi fare? ]                (H3, prompt azione)
[ 1 riga helper ]                  (12px muted)
[ CTA primary ]                    (azione richiesta)
```

### Esempio ConcorsoAI

> "Nessuna simulazione ancora. Carica il tuo bando per iniziare."
> [ Carica bando → ]

## 11.25 Error state

### Inline (form validation)

- Border input `var(--error)` 2px
- Helper text sotto, in error color, con **fix concreto**
- Mai rosso per warning non-error

### Page-level (404, 500)

- H1 chiaro ("Pagina non trovata" / "Errore del server")
- Cosa è successo (1 riga plain language)
- Cosa può fare (2-3 opzioni con CTA)

## 11.26 Success state

### Inline

- Toast 4s auto-dismiss
- Border-left green 3px
- Icona: MAI (anti AI-slop)
- Action opzionale inline ("Visualizza")

### Page-level

- H1 ("Fatto.")
- Sottotitolo concreto ("Il tuo account è attivo. Puoi partire.")
- 1 CTA primaire

---

# 12. UX PATTERNS

## 12.1 Onboarding

### Principi

1. **First-run experience** progettata: non lasciare l'utente perso.
2. **Time-to-value** < 3 minuti. Se > 3 min, hai un problema.
3. **Empty states** sono onboarding mascherato (es. dashboard vuota con
   istruzioni).

### ConcorsoAI: 3 step

1. Registrazione (email + password)
2. Caricamento bando (upload PDF o paste testo)
3. Prima simulazione (1 question + 1 feedback)

## 12.2 Signup

### Decisioni Fogg + Baymard:

- Minimo campi (massimo 3)
- Single column form
- "Crea account" label (no "Submit")
- Microcopy rassicurante sotto: "Senza carta. Cancellazione in 1 click."
- Optional: signup con Google/Apple (riduce friction ulteriore)

### Anti-pattern: ❌

- 5+ campi (nome, cognome, città, professione, telefono)
- Re-entrare password
- CAPTCHA prima submit (solo dopo 1 failed attempt)

## 12.3 Login

### Decisioni

- Email + password (mai username)
- "Password dimenticata?" link sotto
- "Crea account" link a destra
- Mai social-login per primo (è alternativa)
- Remember-me checkbox (default checked)
- Auto-focus su email

## 12.4 Password reset

### Flow

1. Click "Password dimenticata?"
2. Modal inline nella stessa pagina (no redirect)
3. Email submit
4. Conferma "Ti abbiamo inviato un'email"
5. **MAI** rivelare se email esiste ("...o se l'email non è registrata")
   → privacy

## 12.5 Email verification

### Decisioni

- Email con link, no codici a 6 cifre (frustrante per utenti anziani)
- Link valido 24h
- Messaggio chiaro: "Clicca il link per attivare il tuo account"
- Se non arriva: "Controlla spam, o rispedisci email"

## 12.6 Sessions

### Decisioni

- Persistent cookie (long-lived) + activity timeout (security)
- "Sei rimasto collegato" checkbox default ON
- Idle timeout: 30 min (financial apps), 24h (consumer), 7d (low-sensitivity)
- Su ConcorsoAI: 30 giorni persistent, idle 24h

## 12.7 Upload (file)

### Pattern

- Drag & drop zone (border dashed, large)
- Click-to-fallback
- Progress bar con ETA
- Preview thumbnail dopo upload
- Error: file troppo grande, tipo sbagliato, NO aggiungere try manual

### ConcorsoAI: upload bando

- Drag & drop zone con icona paperclip 24px (no emoji!)
- Accept: PDF, TXT, DOC, DOCX
- Max 10MB
- Progress bar: 0% → 100% durante upload
- Anteprima: prime 3 righe del bando estratte
- CTA: "Inizia simulazione →" dopo conferma

## 12.8 Progress (multi-step)

### Pattern

- Progress bar 1px top (Linear/Vercel style)
- Step counter "Step 2 of 4"
- Breadcrumb per step
- Back/next buttons (no solo "Next")

## 12.9 Feedback (azioni utente)

### Quando dare feedback

- Submit completato: toast success
- Action fallita: inline error + toast dim
- Loading: skeleton o spinner
- Optimization background: top-progress-strip

## 12.10 Navigation

### Tipi

- **Primary nav**: top, 3-5 voci
- **Secondary nav**: dentro content (sidebar, breadcrumb)
- **Tertiary nav**: utility (settings, profile menu)

### Anti-pattern: ❌ mega-menu

E-commerce mega-menu (column di link) è studiato male per SaaS.
Stripe/Linear/Notion usano nav slim. Reinhart/NN/g confermano.

## 12.11 User Flow

### Style guide

- Conciso, max 5 step
- Decision points visibili
- Error path incluso
- Mappa mentale prima di UI

## 12.12 Friction reduction

### Elimina per priorità

1. Email verification (opzionale per read-only, required per write)
2. CAPTCHA (solo after 1 fail)
3. Phone verification (mai per SaaS Italian)
4. Address (mai unless shipping)
5. Payment (no per Free tier)

## 12.13 Retention

### Hooks

- **Email**: reminder sessioni non completate ("Hai 2 simulazioni rimaste")
- **Push** (mobile): "Domanda 1 di 5 — pronta?"
- **In-app progress**: "Hai completato 3 bimestri di pratica"

## 12.14 Activation (TTV)

Time-to-Value per ConcorsoAI:
- TTV target: 4 minuti dal signup alla prima simulazione completata
- Misura: % utenti che fanno 1 simulazione entro 24h
- Ottimizzazione: ridurre step tra signup → upload → simulazione

## 12.15 Trust

### Trust signals (in ordine di efficacia)

1. **Trasparenza operativa**: server EU, GDPR-compliant, no phoning
2. **Garanzia esplicita**: "30 giorni, indietro tutto"
3. **Identità reale**: sede legale, fondatori (non "team passionate")
4. **Recensioni terze**: Trustpilot, G2 (se li avete)
5. **Specificità numerica**: "X utenti questo mese" (solo se vero)
6. **Citazioni fonti normative**: come fa ConcorsoAI nel mockup

## 12.16 Conversion

### Sequenza del "sì"

```
ATTENTION (3s) → EVALUATION (10-20s) → TRUST (20-30s)
→ OBJECTION (30-50s) → COMMITMENT (click)
```

(Fonte: Brian Massey, Landing Page conversion)

## 12.17 Decision making

### Quando l'utente decide

NO a "thinking":
- Cosa fa il prodotto
- Quanto costa
- Se fidarsi

SÌ a "thinking":
- Confronto prezzi
- Differenze tra piani
- Errori possibili

## 12.18 Mental models

### Candidato concorso pubblico pensa:

- "Mi serve per X concorso specifico" → risposta sì/no immediata
- "Quanto mi costa in € e tempo" → risposta: gratis / poco / tanto
- "C'è rischio per me" → zero rischi con garanzia
- "Funziona davvero o è fuffa" → mockup credibile risolve

## 12.19 Error prevention

### Pattern

- Confirm destructive (modal)
- Disable button quando non valido (ma con reason chiaro)
- Auto-save (no "salva" button)
- Undo affordance (Cmd+Z, toast "Annulla")

## 12.20 Recovery

### Errori uomo

- "Ho cannato l'upload" → re-upload facile
- "Volevo cliccare altro" → undo/annulla
- "Ho visto troppo tardi" → email recap

### Errori macchina

- 500: "Riprova" + status link
- Timeout: "Salvato in bozza"
- Validation: inline specifico

## 12.21 Accessibility (vedi cap. 17)

---

# 13. MICROINTERAZIONI

## 13.1 Stati UI definiti

Ogni elemento interattivo ha 6 stati:

1. **Default** — statico
2. **Hover** — pointer sopra (200ms transition)
3. **Focus** — keyboard focus (2px ink outline, WCAG 2.4.7)
4. **Pressed/Active** — click moment (scale 0.985)
5. **Disabled** — non interagibile (opacity 0.5, cursor not-allowed)
6. **Loading** — in corso (spinner o skeleton)

**Mai** stato mancante → utente confuso.

## 13.2 Hover

### Principi

- Solo su desktop (no hover su mobile, usa :focus e :active)
- Transizione morbida 200ms ease
- Mai invert totale (bg ink ↔ bg): percepito come "click"
- Sub-translate su arrow (`translateX(3px)`) → Linear style

## 13.3 Focus

### Stile obbligatorio (WCAG 2.4.7)

```css
a:focus-visible, button:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: 3px;
  border-radius: 2px;
}
```

- Outline 2px (non 1px che è borderline invisibile)
- Offset 3px (distanza da elemento)
- Border-radius 2px (no se element è già angolare)

## 13.4 Pressed

### Pattern

```css
.btn:active { transform: scale(0.985); transition: 120ms; }
```

Apple touch response feel. Mai `transform: translateY(2px)` (vecchio).

## 13.5 Loading

### Decisioni (vedi 11.23)

- Skeleton per liste
- Spinner per azioni singole
- Top progress per background sync

## 13.6 Skeleton

### Principi

- Stessa shape del contenuto finale (no "rettangolo generico")
- Animation pulse: opacity 0.4 ↔ 0.8 a 1.4s
- Background `var(--bg-2)`, foreground `var(--line)`
- MAI > 3 secondi senza transition al content

## 13.7 Disabled

### Stile

- Opacity 0.5
- Cursor `not-allowed`
- `pointer-events: none` per non ricevere event
- NO color bg differente (color-less è più chiaro)

## 13.8 Transitions

### Easing curves

| Use | Curve |
|-----|-------|
| Default UI | `cubic-bezier(0.16, 1, 0.3, 1)` (Apple HIG, Linear) |
| Entrance | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exit | `cubic-bezier(0.7, 0, 0.84, 0)` |
| Sharp toggle | `cubic-bezier(0.4, 0, 0.2, 1)` |

### Duration

| Use | ms |
|-----|-----|
| Microinterazioni (button hover, color change) | 120–200 |
| Macro (modal open, drawer, page transition) | 280–360 |
| Page load | 600+ ma spesso immediato è meglio |

## 13.9 Cursor

### Decisioni

- `cursor: pointer` su tutti gli elementi `<a>` e `<button>`.
- `cursor: not-allowed` su disabled.
- `cursor: progress` su loading.
- `cursor: text` su `<input>` esplicito (default ma rafforzalo).
- MAI custom cursor (anni 90).

## 13.10 Motion (vedi cap. 19)

## 13.11 prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
```

**Sempre** presente, sempre onorato (WCAG 2.3.3 AAA).

---

# 14. LANDING PAGE PATTERNS

## 14.1 Sequenza narrativa (ConcorsoAI 5 sezioni)

| # | Sezione | Domanda utente | Output |
|---|---------|----------------|--------|
| 1 | Hero | "Cos'è?" | H1 chiaro + CTA |
| 2 | S02 perché serve | "Mi serve?" | Validation dolore |
| 3 | S03 fiducia | "Mi fido?" | Prova + garanzia |
| 4 | S04 mockup | "Come funziona?" | Mostra prodotto |
| 5 | S05 prova + CTA | "Cosa ottengo?" | Confronto + click |

## 14.2 Hero

### Decisioni vincolanti

| Elemento | Decisione |
|----------|-----------|
| **H1** | 2 frasi, max 9 parole totali |
| **Sub-H1** | max 18 parole |
| **CTA copy** | verb + promise ("Registrati gratis") non "Submit" |
| **Microcopy** | reassurance (no carta, cancel 1 click) |
| **Visual** | screenshot reale prodotto (NO mockup illustrato) |

### Anti-pattern

- ❌ Carosello auto-rotante (Baymard: +23% bounce)
- ❌ Video auto-play (Baymard: +40% bounce, Web Vitals penalizza)
- ❌ CTA nascosta sotto fold
- ❌ Hero con headline in maiuscolo gridato

## 14.3 Mockup

### Pattern premium (NON illustrazione!)

- Border 1-2px ink (sharp, not rounded massive)
- Background cream (mai gradient)
- Tipografia interna REAL (Inter 17px body, 21px highlight)
- Cursor blinking per "in corso di digitazione"
- Window chrome (3 dots, 1 attivo) + tab name
- Profile chip top-right (avatar 22px + nome)
- Progress bar 1px (Domanda N/M)
- Footer con citationi fonti normative

### Anti-pattern

- ❌ 3D illustration con shader
- ❌ Stock photo "team meeting"
- ❌ Dashboard screenshot fittizio senza context
- ❌ Cattura screenshot di competitor (etico + legale)

## 14.4 Headline

### Decisioni

- **Max 9 parole** (NN/g hero studies)
- **2 frasi separate** (a capo con `<br>`)
- **First sentence: emotion**, **second: question o reframe**
- **Mai** "Revolutionary AI", "Smart", "Powerful", "Innovative", "Transformative"

### ConcorsoAI pattern

```
L'orale è una conversazione.
Sai cosa dirai?
```

7 parole totali. Emozione (ansia) + reframe (è una conversazione, non un esame).

## 14.5 CTA Copy

### Decisioni

- **Verb + benefit**, non solo verb.
  - "Registrati gratis" (gratis = no friction)
  - "Inizia gratis" (inizia = immediate)
  - "Prova 30 giorni" (prova = risk-free)
- MAI "Submit", "Click here", "Get started!", "Learn more"

## 14.6 Trust signals (S03)

### Pattern

**Specificità batte quantità.**

Esempi:
- "Server · Italia (Hetzner)" — non "Cloud sicuro"
- "30 giorni di Pro. Se non va bene, indietro tutto." — non "Soddisfatti o rimborsati"
- "art. 12 L. 241/1990, art. 97 Cost." — non "Fonti normative"

### Anti-pattern

- ❌ Stock logo parade ("Trusted by 100,000+ companies")
- ❌ 5-star fake rating widget
- ❌ Trust badges inventati (BBB, "Verified Secure")

## 14.7 Pricing (vedi 11.17)

## 14.8 FAQ

### ConcorsoAI: 5 obiezioni vere

1. Carta richiesta? — No
2. Quante simulazioni gratis? — 3 al mese, sempre
3. Posso disdire? — Sì, 1 click
4. È specifico? — Sì, estrae dal tuo bando
5. Supporto? — Italiano, email, orario ufficio

Mai domande retoriche o generiche ("What is your product?", "How does it
work?").

## 14.9 Footer (vedi 11.15)

## 14.10 Above the Fold

### Cosa DEVE essere visibile senza scroll

1. Logo
2. H1
3. Sub-opzionale (se headline è già chiara)
4. CTA primary
5. Microcopy rassicurante
6. (opzionale) Mockup/visual che conferma cosa fa

### Cosa NON deve essere

- ❌ Cookie banner sopra la CTA
- ❌ Newsletter popup
- ❌ Exit-intent
- ❌ Chat widget invasivo

(Krug + NN/g first-fold studies 2020)

## 14.11 Narrative sequence

### Decision tree

```
SE utente è ansioso (concorso pubblico)
  ALLORA: mockup credibile al centro della pagina
  ALLORA: garante 30 giorni prominente (callout 2px ink)
  ALLORA: hero copy emotivo ma restrittivo

SE utente vuole velocità (TTV < 3 min)
  ALLORA: CTA sticky su mobile
  ALLORA: microcopy rassicurante ovunque
  ALLORA: nessun field extra

SE utente ha poco budget
  ALLORA: Free tier prominente
  ALLORA: Pro pricing €14,99/mese (ancora sotto €15/mese psychological)
  ALLORA: trial 30 giorni Pro, no carta
```

---

# 15. AUTH PATTERNS (vedi 12.2-12.6)

## 15.1 Signup fields massimi

**3 campi max** (Baymard, Fogg):
- email
- password
- (opzionale) nome

**0 campi** con OAuth Google/Apple (1 click signup).

## 15.2 Login fields

**2 campi**:
- email
- password

Mai "username".

## 15.3 Error messages

### Decisioni

- **Inline** sotto il field interessato.
- **No numero errore** ("Errore 401") — plain language.
- **Recovery action** quando possibile ("Hai dimenticato la password?").
- **Privacy**: non rivelare se l'email esiste.

### Esempi ConcorsoAI

- ❌ "Errore 401" → ✅ "Email o password non corrette."
- ❌ "Validation failed" → ✅ "L'email non è valida. Inserisci un indirizzo reale."
- ❌ "Account locked" → ✅ "Troppi tentativi. Riprova tra 5 minuti, o reimposta la password."

## 15.4 Loading auth

- Submit button: spinner inline replacing label durante submit.
- MAI fullscreen loader in auth (ruba controllo).

## 15.5 Trust in auth

- "Senza carta" sotto signup
- "Cancellazione libera" sotto login
- Logo visibile sempre (sa dove è)
- HTTPS obbligatorio
- "Non condividiamo i tuoi dati" footer auth micro-line

---

# 16. DASHBOARD PATTERNS

## 16.1 Information density

### Principi

- Senior user → alta densità (Stripe dashboard a regime)
- New user → bassa densità (empty states + onboarding)
- Reconcile: empty states didattici che mostrano "come sarà" con dati mock.

## 16.2 Hierarchy

### Regole

- **H2 weight 500, mai 700** (Gerarchia massima è hero)
- **Statistiche**: numero grande + label piccolo
- **Cards overview**: max 4 per fold, ognuna 1 stat principale
- **Chart max 3** per fold

## 16.3 Tables

### Decisioni (vedi 11.7)

- Header sticky su scroll
- Hover row bg `var(--bg-2)`
- Border-bottom tra row, no zebra
- Action in ultima colonna (Spostamento, Delete)
- Empty: "Nessun risultato" + suggerimento

## 16.4 Filters

### Pattern

- Filter chips sopra la tabella (2-5 visible, "+N" se di più)
- Sort dropdown vicino al primo header cliccabile
- **Mai** filter sidebar come Linear/Notion (overkill per SaaS semplici)

## 16.5 Search

### Pattern (vedi 11.21)

- Cmd+K command palette se tanti tool
- Search inline in dashboard header

## 16.6 Empty states

### Anatomia (vedi 11.24)

- Testo: cosa puoi fare (verb)
- Helper: perché è vuoto
- CTA: azione richiesta
- Nessuna illustrazione AI-generated

## 16.7 Progressive disclosure

### Regola

- **Mostra solo ciò che serve al momento corrente**
- Esempio: utente nuovo vede "Inizia prima simulazione", power user vede
  ultime 10 simulazioni.

## 16.8 Visual balance

- Asimmetria, non simmetria perfetta (Bertin)
- Elemento principale 30-40% larghezza, supporting 20% ciascuno

## 16.9 Navigation dashboard

- **Primary**: sidebar o top-nav con icone
- **Sub**: breadcrumb
- **Quick action**: CTA floating o in toolbar

---

# 17. ACCESSIBILITÀ (WCAG 2.2 AA)

## 17.1 Perché accessibilità

- **10–15% utenti** ha qualche forma di disabilità (WHO).
- **SEO**: motori di ricerca premiano conformità WCAG.
- **UX**: design accessibile = design universale = più utenti.
- **Legale**: EU accessibility act 2025.

## 17.2 WCAG 2.2 AA: requisiti operativi

### Perceivable

| CR | Description |
|----|-------------|
| 1.1.1 | Non-text content ha text alternative |
| 1.3.1 | Info, structure, relationships programmatically determinable |
| 1.4.1 | Color non è solo mezzo per comunicare |
| 1.4.3 | Contrast ratio minimo 4.5:1 o 3:1 large text |
| 1.4.10 | Reflow senza perdita (320px width) |
| 1.4.11 | Non-text contrast 3:1 |
| 1.4.12 | Text spacing adjustable |

### Operable

| CR | Description |
|----|-------------|
| 2.1.1 | Keyboard functional |
| 2.1.2 | No keyboard trap |
| 2.4.1 | Bypass blocks (skip link) |
| 2.4.7 | Focus visible (2px outline) |
| 2.5.8 | Target size 24×24 CSS px minimum |

### Understandable

| CR | Description |
|----|-------------|
| 3.1.1 | Language of page (html lang="it") |
| 3.3.1 | Error identification |
| 3.3.2 | Labels or instructions |
| 3.3.3 | Error suggestion |

### Robust

| CR | Description |
|----|-------------|
| 4.1.2 | Name, role, value programmatic |

## 17.3 ARIA patterns

| Landmark | Uso |
|----------|-----|
| `<header role="banner">` | Solo site-level header (non page) |
| `<nav aria-label="...">` | Ogni `<nav>` ha label specifico |
| `<main>` | Una per page |
| `<aside>` | Content tangentially related |
| `<footer role="contentinfo">` | Footer site-level |

| Role | Quando |
|------|--------|
| `aria-live="polite"` | Toast, "X utenti iscritti oggi" |
| `aria-live="assertive"` | Errori critici (mai overuse) |
| `aria-label` | Quando `<button>` ha solo icona |
| `aria-describedby` | Helper text addizionale |
| `aria-hidden="true"` | Icone decorative, label ripetuti |

## 17.4 Focus management

### Quando

- **Skip link** come primo focusable element
- **Modal**: focus trap dentro, ESC chiude, focus returns on close
- **Toast**: non ricevere focus, solo `aria-live`
- **Dropdown**: focus si muove con arrow keys

### Skip link template

```html
<a class="visually-hidden" href="#main">Salta al contenuto</a>
<main id="main" tabindex="-1">...</main>
```

## 17.5 Screen reader

### Cosa testare

- Hero letto per primo (H1 + sub + CTA)
- Tutti i button hanno accessible name (testo o aria-label)
- Form errors letti inline
- Live regions annunciate entro 5s

## 17.6 Reduced motion

### Implementazione

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Sempre** presente in **ogni** stylesheet.

## 17.7 Touch target sizes

| Standard | Min size |
|----------|----------|
| WCAG 2.2 AA | 24×24 CSS px |
| iOS HIG | 44×44 points |
| Material Design | 48×48 dp |

**ConcorsoAI decision**: 44px altezza minima per CTA, 36px per body links.

## 17.8 Errori comuni

| Errore | Fix |
|--------|-----|
| `<img>` senza alt | `alt="..."` sempre, anche se `alt=""` per decorativo |
| `<button>` senza testo | `<button aria-label="Chiudi">×</button>` |
| Color alone signaling | Mai dire "clicca il rosso" — usa icona + colore |
| Form senza label visibile | `<label for="...">` o aria-labelledby |
| Headings skip-level | Mai `<h1>` → `<h4>` (salta livelli) |
| Multiple `main` landmarks | Una sola `<main>` per page |

---

# 18. MOBILE UX

## 18.1 Thumb zones (Steven Hoober research)

```
┌─────────────────────┐
│                     │  ← Hard to reach
│   ┌──────────────┐  │
│   │  Top header  │  │
│   └──────────────┘  │
│                     │
│   C O N T E N T     │  ← Natural reach
│                     │
│                     │
│ ░░░░░░░░░░░░░░░░░░░ │  ← Bottom thumb zone
│   [    CTA    ]     │  ← Sticky CTA qui
└─────────────────────┘
```

- **Top**: tasti back/menu (rare tap)
- **Middle**: content (mano in resting position)
- **Bottom**: CTA sticky (Fitts's law, edge = infinite width)

## 18.2 Breakpoints

| Breakpoint | Range | Container |
|-----------|-------|-----------|
| sm | 320–480px | 100% - 40px padding |
| md | 481–720px | 100% - 40px padding |
| lg | 721–1024px | 880px max |
| xl | > 1024px | 920px max (ConcorsoAI) |

## 18.3 Mobile-specific decisions

### Navbar

- Brand + CTA only (hamburger opzionale se > 5 voci)
- Sticky top, **non bottom**

### CTA sticky

- **Solo dopo hero esce da viewport** (no clutter)
- Appare con slide-up + fade
- Touch target 44px+

### Form

- Input `font-size: ≥ 16px` (iOS non zooms su 16px+ input)
- Autocomplete hints attivi
- Submit button sempre visibile

### Tables mobile

- Card view (no scrollable table)
- Tap-to-expand per row details
- Filter chips collapsibili sotto hamburger

### Gestures

- Tap, scroll, swipe back: OK
- Pinch zoom: non disabilitare (a11y)
- Long-press: solo se ha affordance visiva
- Custom gestures: MAI su widget piccoli (a11y)

## 18.4 iOS safe-area

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

**Sempre** su elementi fixed o sticky bottom.

## 18.5 Mobile performance

- FCP < 1.8s
- LCP < 2.5s
- CLS < 0.1
- INP < 200ms
- Bundle < 100KB gzip

## 18.6 Mobile-first vs desktop-first

**Mobile-first CSS** è la pratica raccomandata (RWD, Google).

```css
/* Base styles = mobile */
.btn { padding: 12px 18px; }

/* Desktop upgrade */
@media (min-width: 720px) {
  .btn { padding: 13px 20px; }
}
```

---

# 19. ANTI-AI-SLOP

## 19.1 Cos'è AI-slop

Linguaggio/pattern che tradisce "generato da AI senza supervisione di un
designer". L'utente italiano è educato al sospetto verso siti "troppo finti".
AI-slop attiva diffidenza e riduce conversion del 30-50%.

## 19.2 Catalogo di prohibited patterns

### Visual

| ❌ Pattern | Perché è AI-slop |
|-----------|------------------|
| Gradient `linear-gradient(135deg, ...)` | Universalmente riconoscibile come AI-gen |
| Glow su button (box-shadow 0 0 30px) | Anni '90/2000 |
| Glassmorphism su cards | Templated, datato 2022 |
| Mega-menu hover-espanso | Nielsen -15-25% bounce |
| 3D illustration con shader | AI-gen detect |
| Stock photo "team meeting diverse people" | Templated |
| 3 card identiche con icone emoji | "feature grid from hell" |
| Aura/glow su H1 | Templated |
| Animated gradient background | "music viz" cliché |

### Copy

| ❌ Pattern | Perché è AI-slop |
|-----------|------------------|
| "Rivoluziona", "trasforma" | Marketing corporate |
| "Smart", "intelligent", "AI-powered" | Buzzword inflation |
| "Innovative", "next generation" | Claim non specifico |
| "Potenzia", "ottimizza", "sblocca" | Marketingese |
| "Piattaforma", "ecosistema", "soluzione" | Corporate senza concretezza |
| "Assistant", "copilot", "magic" | Brand OpenAI/AI-trendy |
| "Powered by AI" | Claim non-evidence |
| "Siamo appassionati" | Cliché corporate bio |
| Frasi motivazionali ("Impara *davvero*") | Counseling vibes |

### Interazione

| ❌ Pattern | Perché è AI-slop |
|-----------|------------------|
| Countdown timer fake | Dark pattern, FTC 2023 + Garante |
| Exit-intent popup | NN/g -40% trust |
| "Only 3 spots left" | Fake scarcity |
| Modale aggressive al primo scroll | NN/g bounce +60% |
| Carosello auto-advancing | WCAG, Baymard |
| Video auto-play con audio | Web Vitals penalizza |

### Data

| ❌ Pattern | Perché è AI-slop |
|-----------|------------------|
| "10.000+ utenti soddisfatti" (senza prove) | EU consumer law, FTC |
| "Trusted by 500 aziende" (logo parade inventato) | Trust crolla -30% |
| Testimonial con foto stock | Detect immediato |
| 5-star rating fittizio | Trust crolla |
| "Garanzia 100% soddisfatti" | Vago, non credibile |
| "Powered by [insert fancy tech]" | Bullshit bingo |

## 19.3 Il test "lo vedo in altri 100 siti?"

Se la sezione/frase potrebbe stare in un CRM, gestionale, SaaS HR, software
contabile, chatbot → **riscivila**.

Per ConcorsoAI: ogni sezione deve essere **specifica al candidato al concorso
pubblico italiano**. Rimuovi ciò che è generico.

## 19.4 Detection checklist

Per ogni elemento chiedi:

- Serve davvero?
- Aumenta conversione o la rallenta?
- Aumenta fiducia o la distrugge?
- È coerente col resto?
- Sembra progettato o generato?
- È una decisione o un default?
- È il miglior modo possibile?

Se la risposta è NO → rimuovi o migliora.

---

# 20. DECISION TREE OPERATIVI

## 20.1 Per Designer

### Sto scegliendo un colore:

1. È un ruolo semantico (text/bg/border/status)? → Token semantico
2. È brand-related? → Variabile brand (1 sola)
3. È status? → Verde/rosso/giallo/blu (rompi palette)
4. È decorative? → Non esiste, vai a 1.

### Sto scegliendo uno spacing:

1. È inline (4/8/12)? → Token `--s-1..3`
2. È padding card (16/24)? → Token `--s-4..5`
3. È section gap (32+/48/64/96)? → Token `--s-6..10`
4. È custom magic? → NO. Token o rivedi.

### Sto scegliendo un font-weight:

1. Body? → 400
2. Caption/eyebrow/button? → 500
3. Heading display? → 500-600
4. Mai 700+ su body

### Sto scegliendo una CTA copy:

1. Verb only ("Submit")? → Mai
2. Verb + benefit ("Registrati gratis")? → Default
3. Promise + reassurance ("Prova 30 giorni")? → Per Pro/Free tier switch
4. Aggiungi microcopy sotto SEMPRE

### Sto aggiungendo un'animazione:

1. Serve alla conversione? → Solo typewriter, progress, prefetch
2. È decorative? → Rimuovi
3. Ha prefers-reduced-motion? → Solo se sì
4. Performance: transform/opacity only

## 20.2 Per Frontend Developer

### Sto scrivendo un componente:

1. È semantic HTML5? → `<header>`, `<main>`, `<section>`, `<button>`
2. Ha aria-label quando solo icona? → Sì
3. Ha focus-visible? → 2px ink outline + offset 3px
4. Rispetta reduced-motion? → Sì con media query
5. Touch target ≥ 44px? → Sì
6. Contrast check passa WCAG AA? → Tool: Stark, Lighthouse

### Sto aggiungendo JS:

1. Functional senza JS? → Sì (progressive enhancement)
2. IntersectionObserver o short-circuit per old browser? → Fallback
3. aria-live per updates async? → Sì per toast/notifications
4. prefers-reduced-motion onorato? → Sì
5. Performance: < 50KB gzip totale landing

## 20.3 Per PM / Strategia

### Sta decidendo posizionamento:

1. Target audience chiaro? → "Candidato concorso pubblico italiano 25-45"
2. Pain viscerale? → "Paura di bloccarsi all'orale"
3. Job-to-be-done? → "Passare il concorso, sentirsi pronto"
4. Differenziazione vs alternativa? → "Specifico per il TUO bando, non generico"

### Sta decidendo pricing:

1. Max 2 tier (Iyengar)
2. Free chiaramente FREE
3. Paid €xx/mese (sotto €15 se vuoi psychological friction sotto)
4. Cancellation microcopy sotto

### Sta decidendo copy:

1. Evita le 11 buzzwords vietate (cap. 19)
2. Max 8-12 parole per frase
3. Specifico > generico (numeri, fonti, contesti)
4. Micro-yes progressivo nel flow

---

# CONCLUSIONE

## Cosa definisce un design premium

1. **Restraint** — niente che non serva
2. **Coerenza** — sistema, non caso
3. **Evidenza** — ogni decisione motivata
4. **Specificità** — niente che potrebbe stare in un altro prodotto
5. **Rispetto** — per utente, per accessibilità, per riduzione attrito

## Anti-AI-slop in 3 frasi

- Ogni pattern che vedresti in 100 SaaS diversi è sbagliato per te.
- Ogni claim non verificabile perde 30% trust.
- Ogni CTA copy vago perde 20% click.

## Operativamente

Questo documento è sufficiente per progettare qualsiasi schermata
di ConcorsoAI mantenendo:

- Coerenza visiva con il resto della piattaforma
- Conforme WCAG 2.2 AA
- Performance target (LCP < 2.5s, CLS < 0.1)
- Conversione misurabile
- Anti-AI-slop verificato

Un designer che legge questo documento può prendere qualsiasi decisione UI
per ConcorsoAI senza dover chiedere. Un frontend developer può implementarla
rispettando tutti i vincoli.

— Fine —

---

# APPENDICE A — Checklist Pre-Launch

## Visual

- [ ] No gradient su button
- [ ] No glow su elementi
- [ ] No glassmorphism
- [ ] No 3 card identiche con icone emoji
- [ ] No 3D illustration
- [ ] No stock photo team "diversity"
- [ ] No animation flashy/parallax

## Copy

- [ ] No buzzword (vedi cap. 19)
- [ ] No countdown fake
- [ ] No "100k users" senza prove
- [ ] No finti testimonial
- [ ] No finti press logos
- [ ] No emoji decorativi
- [ ] Micro-yes progressivo nel flow

## Accessibility

- [ ] WCAG 2.2 AA scanner passa
- [ ] Skip link presente
- [ ] Focus visible su tutti interactive
- [ ] Tab order logico
- [ ] aria-label dove serve
- [ ] html lang="it"
- [ ] prefers-reduced-motion onorato

## Performance

- [ ] Lighthouse mobile score ≥ 90 tutte categorie
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] Total bundle < 100KB gzip landing

## Conversion

- [ ] CTA visibile above fold
- [ ] CTA copy è verb + benefit
- [ ] Microcopy sotto CTA è rassicurante
- [ ] Una CTA primaria per fold (no competing signals)
- [ ] Trust signals specifici (no fake badges)

---

# APPENDICE B — Riferimenti

## Libri

- Kahneman, D. (2011). *Thinking, Fast and Slow*.
- Cialdini, R. (2006). *Influence: The Psychology of Persuasion*.
- Fogg, B. J. (2009). *Persuasive Technology*.
- Krug, S. (2014). *Don't Make Me Think* (3rd ed.).
- Bringhurst, R. (2004). *The Elements of Typographic Style*.
- Bertin, J. (1967). *Sémiologie graphique*.
- Cialdini, R. (2016). *Pre-Suasion*.
- Tufte, E. (2006). *Beautiful Evidence*.

## Standards

- WCAG 2.2 (W3C)
- ARIA Authoring Practices Guide (W3C)
- ITU BT.709 contrast formulas
- iOS HIG (Apple)
- Material Design 3 (Google)

## Research

- Nielsen Norman Group (nngroup.com)
- Baymard Institute (baymard.com)
- Google UX Research
- Lindgaard et al. (2006). "50ms first impressions"
- Iyengar & Lepper (2000). Jam Study
- Cowan (2001). Working memory 4±1
- Fitts (1954). Target acquisition law
- Hick (1952). Decision time
- Miller (1956). 7±2

## Prodotti di riferimento

- Stripe (stripe.com) — pricing, auth, error states
- Linear (linear.app) — typography, navigation, command palette
- Raycast (raycast.com) — extension model, search UX
- Granola (granola.ai) — AI product positioning
- Perplexity (perplexity.ai) — search input UX
- Vercel (vercel.com) — typography and spacing
- Notion (notion.so) — sidebar nav, blocks
- Mercury (mercury.com) — typography, color
- Apple HIG — accessibility, motion
- Microsoft Fluent 2 — inclusive design

---

*Fine del documento. Ogni sua parte è motivata da ricerca, evidenza o
decisione architetturale tracciabile. Per dubbi o aggiornamenti, fare
riferimento ai capitoli specifici.*
