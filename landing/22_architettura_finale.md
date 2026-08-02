# Architettura Finale della Landing

## Introduzione

Questo documento **fonde** i 21 file precedenti in una **specifica architetturale operativa**. Non è un riassunto: è la traduzione di ricerca, principi, evidenze e decisioni in una **sequenza di sezioni**, ognuna con scopo, contenuto, copy e microcopy.

L'obiettivo è che un senior designer possa aprire questo file e **progettare la landing** senza dover rileggere gli altri 21. Ogni decisione è tracciata al principio che la genera.

---

## Architettura in 8 sezioni

### SEZIONE 1 — NAVBAR (always-on, sticky)

**Scopo**: orientamento + accesso rapido a info + CTA sempre visibile.

**Contenuto**:

```
[ConcorsoAI logo]                        [Funzionalità] [Piani] [FAQ] [Accedi]  [Inizia gratis →]
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Voci nav | 3 voci primarie + 1 azione testuale | Miller 7±2 (NN/g) |
| "Accedi" stile | link testuale | Krug "Don't Make Me Think" |
| "Inizia gratis" stile | button emerald, sempre visibile | Thaler default effect |
| Sticky | true su desktop e mobile | Nielsen sticky nav 2019 |
| Scroll-spy | highlight sezione corrente | Anchor pattern (Vercel) |

**Microcopy**:

- Logo → home
- "Funzionalità" → scroll a sezione #features
- "Piani" → scroll a sezione #pricing
- "FAQ" → scroll a sezione #faq
- "Accedi" → /login (link testuale)
- "Inizia gratis" → /signup (button emerald)

---

### SEZIONE 2 — HERO

**Scopo**: orientation (NN/g 3 sec) + commitment iniziale (Cialdini).

**Contenuto**:

```
Logo (piccolo, 24px)
                                          ↓ 3 secondi
Eyebrow: "Per chi prepara concorsi pubblici"
Headline H1 (max 9 parole):
   "Smetti di studiare a caso.
   Preparati su quello che chiederanno davvero."
Sub (max 18 parole):
   "Una banca di 12.000+ domande reali, raggruppate
   per materia e tipologia, con spiegazioni."
[Marginalia - proof element piccolo]:
   "✓  Banca aggiornata mensilmente   ✓  Spiegazioni con fonte normativa"

CTA button: "Inizia gratis"  →  /signup
Sotto CTA: "Niente carta di credito. 1 minuto per cominciare."

[Visual element a destra o sotto]:
   Screenshot/mocking del prodotto — interfaccia quiz pulita
   No illustrazione 3D, no gradient, no glow.
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Headline | 2 frasi, max 9 parole | NN/g hero 2020 study |
| Sub headline | 18 parole max | Nielsen scannability |
| CTA copy | "Inizia gratis" verb + promise | Reinhart 2016 "Submit" study |
| CTA microcopy | reassurance sotto | Fogg MAP (Ability) |
| Visual | screenshot UI pulita, no 3D | AI slop avoidance |
| Proof element | 2 ✓ veri specifici | Cialdini specific proof |
| Layout | 1 colonna testo + 1 colonna visual | Linear/Notion/Stripe pattern |
| Mobile | stack verticale, visual sotto | NN/g mobile 2022 |

**Anti AI-slop**:

- ❌ NO gradient backgrounds
- ❌ NO glow su button
- ❌ NO 3D illustration
- ❌ NO emoji casuali
- ❌ NO headline motivazionale
- ❌ NO "Trasforma il tuo futuro"
- ❌ NO stock photo con diversità fake

---

### SEZIONE 3 — PROBLEMA (anchor emozionale)

**Scopo**: validation (l'utente si riconosce). Non emotional manipulation ma **normalization del pain**.

**Contenuto**:

```
Eyebrow: "Il problema"
Headline H2 (max 8 parole):
   "Studiare un bando intero non ti prepara al concorso."
Body (max 40 parole):
   "Hai 600 pagine di normativa. Manuali da 800 pagine. Slides
   di corsi che parlano di tutto. Ma il concorso chiederà solo
   30 domande specifiche. Studiare il 100% per rispondere al 5%
   è la ragione principale per cui la maggior parte dei candidati
   non passa."

[Opzionale, se pertinente]:
   3 micro-stat o 3 micro-citazioni (solo se VERE, non inventate)
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Pain acknowledgment | esplicito, senza "we feel your pain" cliché | Positioning (April Dunford) |
| Body copy | max 40 parole per leggibilità | Krug scannability |
| Stat/citazioni | solo se verificabili | Cialdini authoritative proof |
| Tone | concreto, non drammatico | Brand voice ConcorsoAI |

**Anti AI-slop**:

- ❌ NO "we understand your struggle"
- ❌ NO paragrafo lungo
- ❌ NO metafora forzata
- ❌ NO stock photo di persona frustrata

---

### SEZIONE 4 — SOLUZIONE + COME FUNZIONA

**Scopo**: evaluation (l'utente capisce se è per lui) + Ability (Fogg).

**Contenuto**:

```
Eyebrow: "Come funziona"
Headline H2:
   "Tre passi. Niente teoria, niente dispersione."

[SECTION divider]

[STEP 1]
Icona o numero "1"
Titolo: "Scopri cosa chiederanno"
Body: "La banca è organizzata per materia e tipologia di domanda.
       Puoi vedere le domande più frequenti degli ultimi 5 anni
       per il tuo specifico bando."

[STEP 2]
Icona o numero "2"
Titolo: "Fai simulazioni cronometrate"
Body: "Modalità simulazione d'esame: stesso numero di domande,
       stesso tempo, stesso formato. Niente sorprese il giorno del concorso."

[STEP 3]
Icona o numero "3"
Titolo: "Ricevi feedback mirato"
Body: "Per ogni domanda sbagliata, vedi la spiegazione con riferimento
       alla fonte normativa. Sai esattamente cosa ripassare."
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Numero step | 3 (limite inferiore Miller) | NN/g chunking |
| Layout step | verticale con numero grande a sinistra | Linear pattern |
| Icone | custom SVG semplici, no emoji | Iconography best practices |
| Tone body | concreto, no fluff | Brand ConcorsoAI |
| Visual proof | screenshot di un quiz (no mockup inventato) | Honest proof |

**Anti AI-slop**:

- ❌ NO "Empower your journey"
- ❌ NO icone emoji 🧠 📚 🎯
- ❌ NO gradient su ogni step
- ❌ NO animazione Lottie che spiega tutto
- ❌ NO 5 step solo per sembrare più

---

### SEZIONE 5 — COSA INCLUDE (`#features`)

**Scopo**: depth — l'utente scopre cosa c'è dentro.

**Contenuto**:

```
Eyebrow: "Cosa trovi dentro"
Headline H2:
   "Tutto ciò che serve, niente che non serve."

[Lista feature in 2-3 righe]:

✓  Banca di 12.000+ domande reali
✓  Spiegazioni con fonte normativa
✓  Simulazioni cronometrate
✓  Filtra per materia, tipologia, livello di difficoltà
✓  Storico degli errori per ripassare mirato
✓  Aggiornamenti mensili della banca
✓  Accesso da web, tablet e smartphone
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Numero feature | 6-8 (chunked) | Miller 7±2 |
| Layout | lista verticale con ✓ | NN/g scannability 2008 |
| Categorizzazione | flat, non a mega-gruppi | IA semplice |
| Tone | concreto e verificabile | Cialdini specific |
| Visivo | no icone mega-colorate | UI restraint |

**Anti AI-slop**:

- ❌ NO 4-col grid con feature icons mono
- ❌ NO "AI-powered" senza evidenza
- ❌ NO "Real-time" senza esempio
- ❌ NO mega-claims ("Infinite scalability")
- ❌ NO badges finti

---

### SEZIONE 6 — PROVA / REPUTATION (`#proof`)

**Scopo**: trust + riduzione del dubbio.

**Contenuto**:

```
Eyebrow: "Trasparenza"
Headline H2:
   "Cosa c'è davvero, cosa non c'è."

[Lista di 4-6 affermazioni oneste]:

✓  12.000+ domande reali, con risposta e fonte
✓  Aggiornata mensilmente con bando nuovi
✗  Nessuna domanda inventata
✗  Nessun claim non verificabile
✗  Nessuna statistica gonfiata

[Micro-disclaimer sotto]:
   "ConcorsoAI è in accesso anticipato. Stiamo raccogliendo feedback
   per migliorare. Se trovi qualcosa che non va, scrivici."

[CTA inline, piccola]:
   [Scrivici →]
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Counters loghi | NO loghi inventati | AI slop detection |
| Statistiche | solo se vere (no "10k users" inventati) | Honest proof (Cialdini) |
| Disclaimer | esplicito se si è in early stage | Trust transparency |
| Layout | 1 colonna, lista | NN/g scannability |
| Link contatto | presente, non "form to fill" | Exit-clearance |

**Anti AI-slop**:

- ❌ NO "Trusted by 100,000+ teams"
- ❌ NO testimonial inventati
- ❌ NO 5-star badges finti
- ❌ NO TrustPilot widget se non c'è realmente
- ❌ NO "Featured in Forbes" inventato
- ❌ NO loghi aziende senza permesso

---

### SEZIONE 7 — PRICING (`#pricing`)

**Scopo**: comparison + enable commitment.

**Contenuto**:

```
Eyebrow: "Piani"
Headline H2:
   "Prova gratis. Poi decidi."

[2 TIER massimo, side-by-side]:

LEFT — Free
   €0/mese
   ✓  Accesso alle domande pubbliche
   ✓  Spiegazioni base
   ✓  5 simulazioni/mese
   ✓  Storico errori base
   [Button secondario]: "Inizia gratis" → /signup

RIGHT — Premium  [Recommended pill]
   €9.90/mese  (oppure €99/anno)
   ✓  Tutto il piano Free
   ✓  Banca domande completa
   ✓  Simulazioni illimitate
   ✓  Spiegazioni approfondite con riferimenti normativi
   ✓  Storico errori avanzato
   ✓  Modalità ripasso rapido
   ✓  Aggiornamenti in tempo reale
   [Button primary emerald]: "Prova 1 mese gratis"  → /signup?plan=premium

Microcopy sotto:
   "Niente carta di credito per il Free. Puoi cancellare
    il Premium in qualsiasi momento dal tuo account."
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Numero tier | 2 (Iyengar choice architecture) | Iyengar 2000 jam study |
| Tier destro "recommended" | sì, emerald pill | Thaler default effect |
| Free vs Paid | entrambi accessibili | Conversion XL research |
| Free trial Premium | 1 mese senza carta | Smart Insights average trial |
| Cancellation microcopy | esplicita sotto | Trust reversal |
| Annual vs monthly | solo se genera chiarezza | Stripe pricing study |
| Visual emphasis | Premium leggermente più grande | Visual hierarchy (Bertin) |

**Anti AI-slop**:

- ❌ NO 5 tier con asterischi
- ❌ NO "Enterprise — Contact us" senza logica
- ❌ NO "Most popular" senza essere popolare davvero
- ❌ NO lifetime deal fake
- ❌ NO countdown di sconto
- ❌ NO "Starter / Pro / Business / Scale / Enterprise"

---

### SEZIONE 8 — FAQ (`#faq`)

**Scopo**: objection closing.

**Contenuto (5 Q&A)**:

```
Eyebrow: "Domande frequenti"
Headline H2:
   "Le 5 cose che ci chiedete di più."

Q1: "Funziona senza internet?"
A1: "No, serve connessione. Le domande sono in cloud
     per garantire aggiornamenti in tempo reale."

Q2: "Quante domande ha la banca?"
A2: "Ad oggi ~12.000 domande. Cresce ogni mese con i bandi
     nuovi pubblicati."

Q3: "Posso provare gratis?"
A3: "Sì. Il piano Free è gratis per sempre, senza carta.
     Il Premium ha 1 mese di prova gratuito."

Q4: "Come funziona il rinnovo?"
A4: "Il rinnovo è annuale o mensile, scelto da te.
     Cancellabile in 1 click dal tuo account, nessun vincolo."

Q5: "È per il mio concorso specifico?"
A5: "Abbiamo domande per le principali tipologie: enti locali,
     ministeri, scuola, forze dell'ordine. Se il tuo bando non
     è coperto, scrivici: lo aggiungiamo."
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Numero FAQ | 5 (limite cognitivo) | Miller |
| Tipo domande | obiezioni reali, non generic | Objection handling |
| Layout | accordion (clic per aprire) | NN/g accordion study |
| Tone | concreto e breve | Brand voice |
| Inline link | "scrivici" dove utile | Exit paths |

**Anti AI-slop**:

- ❌ NO "What is your return policy?" generiche
- ❌ NO 25 FAQ inutili
- ❌ NO domande retoriche
- ❌ NO risposte evasive

---

### SEZIONE 9 — CTA FINALE (`#cta-finale`)

**Scopo**: closing action.

**Contenuto**:

```
Headline H2:
   "Pronto a prepararti su quello che chiederanno davvero?"

Sub:
   "1 minuto per iniziare. Niente carta di credito."

CTA button (emerald): "Inizia gratis"  → /signup

Sotto:
   "Se non ti piace, cancelli in 1 click e abbiamo finito."
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Headline | 8 parole, domanda | NN/g CTA 2019 |
| Sub | rassicurazione (no carta) | Fogg Ability |
| Microcopy | cancellazione libera | Risk reversal (Cialdini) |
| CTA | emerald button grande | Color psychology (Bertin) |
| Layout | centered, full-width | Visual symmetry |

**Anti AI-slop**:

- ❌ NO "Limited time offer"
- ❌ NO countdown
- ❌ NO "Only 3 spots left"
- ❌ NO emoji freccia 🚀

---

### FOOTER

**Scopo**: utility legale + exit paths puliti.

**Contenuto**:

```
© 2026 ConcorsoAI        Privacy        Termini        Contatti        Status        Changelog
```

**Decisioni vincolanti**:

| Elemento | Decisione | Fonte |
|----------|-----------|-------|
| Numero link | max 5-6 (chunked) | Miller |
| Link | tutti utility → /privacy, /terms, /contatti | IA logic |
| NO duplicazione nav | se sei su piani, no ripetere nella nav | IA uniqueness |
| NO "Sign up competition" | nessuna CTA aggressiva | Trust retention |
| Versioning | se esiste changelog visibile | Honesty |

---

## Flussi di interazione

### Desktop

1. Pagina carica → utente vede NAV + HERO
2. Scroll → SEZIONE 3 (problema) → 4 (soluzione) → 5 (feature)
3. Continua scroll → 6 (prova) → 7 (pricing) → 8 (FAQ) → 9 (CTA finale) → FOOTER
4. CTA sticky sempre visibile
5. Click "Inizia gratis" → /signup

### Mobile

1. Pagina carica → utente vede NAV compatta (burger o logo+CTA) + HERO stacked
2. Scroll one-column attraverso tutte le sezioni
3. CTA sticky in basso (bottom bar) o nella nav superiore
4. Form post-click ottimizzato: solo email

### Returning visitor (via ref)

1. Pagina carica con hero short-form: skip-step hero
2. CTA sticky più prominente
3. Niente onboarding narrativo: redirect a /signup diretto

---

## Architettura visiva mappata

| Sezione | Visual weight (Bertin) |
|---------|------------------------|
| HERO | Massimo (eye anchor 1) |
| PROBLEMA | Medio-basso (eye anchor 4) |
| SOLUZIONE | Medio (eye anchor 3) |
| COSA INCLUDE | Medio-basso (eye anchor 5) |
| PROVA | Basso (eye anchor 6) |
| PRICING | Alto (eye anchor 2) |
| FAQ | Basso (eye anchor 7) |
| CTA FINALE | Alto (eye anchor 2 — secondo massimo) |
| FOOTER | Minimo (eye anchor 8) |

L'eye anchor 1 deve sempre essere **Hero**. Eye anchor 2 deve sempre essere **CTA pricing + CTA finale**. Eye anchor 8 deve sempre essere footer.

---

## Takeaway pratici

1. 9 sezioni, ognuna con **un solo scopo**.
2. Nav 3 voci + CTA sticky.
3. Hero = orientation + commitment (3 sec).
4. Problema prima di Soluzione (evaluation).
5. Come funziona in 3 step (chunked).
6. Cosa include = 6-8 feature verificabili.
7. Prova = trasparenza, non loghi finti.
8. Pricing = 2 tier, Free chiaramente accessibile.
9. FAQ = 5 obiezioni vere.
10. CTA finale = chiusura rassicurante.
11. Footer = solo meta-info, mai competitor della nav.
