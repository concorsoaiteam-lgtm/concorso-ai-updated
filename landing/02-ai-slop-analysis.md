# 02-ai-slop-analysis.md
## Guida Operativa Anti AI-Slop per il Team ConcorsoAI

> Documento operativo: come riconoscere, diagnosticare e **non commettere** AI-slop nella landing `public/index.html`, nelle pagine auth/dashboard/simulation, e nella comunicazione copy PA-oriented. Cross-linked con `01-reverse-engineering.md` (le 12 pattern premium + 11 anti-pattern già identificati sui 20 SaaS leader mondiali).

---

## 0. PERCHÉ QUESTA GUIDA

Nel biennio 2024-2026 l'ecosistema web è stato invaso da artefatti generati da LLM (ChatGPT, Claude, Cursor, v0, Bolt.new, Lovable) che condividono **un'impronta digitale quasi identica**: gradient viola-blu, glassmorphism inflazionato, hero "supercharge your workflow", spacing monotono, mockup fittizi, badge fiducia gonfiati.

Il problema non è la qualità tecnica: spesso questi artefatti funzionano, sono responsive, hanno ottimi CTA. Il problema è che **il cervello umano li detecta in 5 secondi** come "fatti da AI". E quel segnale di automazione abbassa il trust, fa scattare pattern recognition di "cheapness", e — paradossalmente — **inverte il trust signal**: il sito ben fatto ma percepito-AI ottiene *meno* fiducia di un sito imperfetto ma artigianale.

Questa guida ti dà:
1. La psicologia cognitiva di **perché** il cervello detecta l'AI-slop
2. **54 anti-pattern** specifici divisi in 18 visual + 18 copy + 18 tech/CSS
3. Per ogni anti-pattern: sintomo → perché succede → perché cervello lo rifiuta → come evitarlo
4. Una **checklist finale di 30 punti** concreti
5. Applicazione specifica a ConcorsoAI (cosa stiamo già facendo bene, cosa resta da presidiare)

**NON sostituisce** `01-reverse-engineering.md` — è il complemento: lì documentiamo cosa rende *premium*, qui cosa rende *slop*. Insieme formano il design bible del progetto.

---

## 1. LA PERCEZIONE UMANA — PERCHÉ IL CERVELLO RIFIUTA LO SLOP

### 1.1 Uncanny Valley del Design e Pattern Recognition Bias

Il sistema visivo umano opera come un **motore di previsione bayesiano** (predictive coding framework). Quando scansioniamo una landing page, il cervello confronta istantaneamente gli input visivi con archivi mnemonici di pattern già visti.

Le interfacce generate da AI tendono a interpretare le leggi della **Gestalt** in modo eccessivamente letterale: prossimità, chiusura, somiglianza applicate senza tensione. Manca l'**asimmetria intenzionale**, le imperfezioni calibrate che un designer umano introduce per guidare l'occhio in modo naturale.

La **Repetition Aversion** (letteralmente: avversione alla ripetizione) è poi il killer: troppi elementi metricamente identici distribuiti su griglie perfette = il cervello urla "questo è un TEMPLATE".

L'**Uncanny Valley** (Mori 1970, estesa al digitale) si manifesta quando un'interfaccia è *troppo pulita*: bordi pixel-perfect, spacing millimetrico perfetto, ombre uniformi, palette chirurgica. Il cervello non si fida: percepisce un'**artificiosità predatoria**, qualcosa progettato per ingannare.

**Cosa significa per ConcorsoAI**: serve calore umano. Tipografia curata ma NON perfetta, micro-imperfezioni volute (es. una parola in italic in un corpo regolare), loghi reali di materie non stilizzati-3D, citazioni normative reali.

### 1.2 Cognitive Fluency Rovesciata — Quando "Troppo Liscio" Significa "Cheap"

La **fluenza cognitiva** misura quanto facilmente il cervello elabora informazione. Jared Spool, Don Norman e la tradizione UX hanno storicamente sostenuto che più fluida = più fiducia. Ma nel 2024-2026 questo paradigma è **invertito**.

Quando un testo o un layout è *troppo* fluido, prevedibile, privo di asperità sintattiche, il cervello lo riclassifica come rumore bianco o spam. La distribuzione statistica "media" dell'LLM produce copy *insipido* — non cattivo, semplicemente privo di personalità.

Esempio:
- *AI-generated*: "Supercharge your productivity with seamless AI-powered workflow automation."
- *Human-crafted*: "Tre simulazioni gratis al mese. Senza carta. Senza attese."

Il cervello rileva **l'assenza di voce autoriale**, che AI = collasso di tutte le personalità sulla media universale.

**Cosa significa per ConcorsoAI**: JTBD specifico, voce istituzionale italiana non generica (no "we believe in empowering"), citazioni normative reali come prova di ricerca effettiva.

### 1.3 Signal of Effort vs Signal of Automation — La Dimostrazione del Lavoro

La teoria economica dei **segnali costosi** (costly signaling theory) spiega la percezione: un consumatore capisce intuitivamente se dietro un design c'è stata sofferenza creativa, iterazione, revisione (*signal of effort*).

L'AI produce un **segnale di automazione** (*signal of automation*) — zero costo di produzione, zero cura del dettaglio, e quindi zero rispetto per il destinatario. Come emerso nei thread Hacker News 2025 ("Why does AI slop feel so bad to read?"): leggere AI-slop viene percepito come **un'offesa personale** — "pensa che io sia così stupido da cascare in questo contenuto prodotto a costo zero".

**Cosa significa per ConcorsoAI**: segnali di sforzo concreto. Citazioni di articoli specifici (art. 97 Cost., DPR 487/1994), riferimento a commissioni reali, disclaimer verificabili ("L'AI può commettere errori su citazioni specifiche, verifica sempre sul bando ufficiale"). Il discomfort della trasparenza È il signal of effort.

### 1.4 Trust Signal Inversion — Come i Badge Distruggono la Fiducia

Fenomeno critico del 2025-2026: **anche quando un'interfaccia AI è tecnicamente ineccepibile**, se l'utente percepisce che è generata automaticamente, il livello di fiducia crolla PIÙ che per un sito umano imperfetto.

Paradossalmente: la perfezione sintetica viene letta come **tentativo deliberato di mascherare la mancanza di sostanza**. La cura artigianale (anche con un piccolo difetto) comunica onestà.

Esempio pratico ConcorsoAI:
- "Trusted by 10.000+ candidates" → BOOST di fiducia apparente, MA rovescia in sfiducia al primo dubbio
- "Costruito a Milano · Beta aperta · 3 simulazioni gratis al mese" → meno imponente, MA trasparente = boost di fiducia reale

---

## 2. VISUAL & DESIGN — L'ILLUSIONE DEL PREMIUM

### 2.1 Hero Section e Layout — La Fabbrica dei Cloni

#### 2.1.1 Hero Gradient Abuse
**Sintomo**: Sfondo hero con 2-3 gradient sovrapposti (radiale + lineare), spesso con blob astratti viola/cyan che fluttuano.
**Perché accade (LLM bias)**: I modelli associano "moderno/tecnologico" a gradient complessi, copiati da Tailwind UI presets / shadcn-ui templates.
**Perché cervello lo rifiuta**: assenza di fonte di luce logica = il cervello classifica come "sfondo fittizio", privo di profondità fisica.
**Come evitarlo**: max 1 gradient (o 0). Sfondo tinta unita oppure radial-gradient micro (`#fafafa` centro, leggermente più scuro ai bordi). Pattern Vercel/Stripe/Notion.
**Esempio**:
```css
/* Slop: */
.hero-slop { background: radial-gradient(circle, #6366f1 0%, transparent 50%), linear-gradient(to right, #3b82f6, #ec4899); }
/* Clean: */
.hero-clean { background: #FFFFFF; }
```

#### 2.1.2 Numero Canonico di Sezioni = 5
**Sintomo**: Hero → "Trusted by logos" → 3 card features → Stats → CTA finale. Esattamente 5 sezioni.
**Perché accade**: è la struttura media calcolata su migliaia di landing page, replica lo "scheletro" predefinito.
**Perché cervello lo rifiuta**: prevedibilità strutturale azzera l'interesse. L'utente medio ha visto 100 siti così.
**Come evitarlo**: variare struttura in base al prodotto. ConcorsoAI: hero interactiva → R1 mini-quiz → confronto crudo → metodo → beta con garanzia → fiducia finale → footer. = 7 sezioni non canoniche, ritmo asimmetrico (vedi `01-reverse-engineering.md` sez. 5).

#### 2.1.3 Glass Card-Stack Spostato
**Sintomo**: Intere sezioni come enormi card trasparenti sovrapposte con margini negativi e ombre.
**Perché accade**: replica di pattern Dribbble senza comprensione di responsive/densità informativa.
**Perché cervello lo rifiuta**: rompe il flusso verticale di lettura, l'utente non capisce dove finisce una sezione e inizia la successiva.
**Come evitarlo**: griglia pulita con gap generosi (96-160px tra sezioni), separatori tipografici minimali.

#### 2.1.4 Hero Centered Simmetrico
**Sintomo**: H1 + sub + 2 CTA + trusts tutti centrati verticalmente in pagina.
**Perché accade**: template LLM-balanced default. L'AI evita l'asimmetria perché "potrebbe non bilanciarsi".
**Perché cervello lo rifiuta**: simmetria centrale estenuante. Asimmetria è il segnale di un design intenzionale umano.
**Come evitarlo**: H1 + sub allineati a sinistra in colonna 7/12, CTA + mockup nella colonna destra 5/12. Pattern Anthropic/Linear/Stripe.

### 2.2 Componenti, Effetti e UI Abusati

#### 2.2.1 Glassmorphism Inflazionato
**Sintomo**: `backdrop-filter: blur(12px)` su ogni card, navbar, badge.
**Perché accade**: copia da Apple/Windows + librerie shadcn.
**Perché cervello lo rifiuta**: quando tutto è traslucido, il contrasto crolla, la gerarchia scompare.
**Come evitarlo**: max 1 elemento glass nella pagina (tipicamente navbar). Tutto il resto su superficie solida.
**ConcorsoAI**: navbar sticky con `backdrop-filter: blur(8px)` + bg `rgba(255,255,255,0.7)`. Tutte le altre card su bg solido `#FFFFFF` con border 1px.

#### 2.2.2 Card Border-Image Animato (Border Beam)
**Sintomo**: Card di feature con bordo animato continuo (conic-gradient rotante).
**Perché accade**: Magic UI / Aceternity UI components. LLM li inserisce per "dare effetto wow".
**Perché cervello lo rifiuta**: distrae perpetuamente, è espediente per mascherare mediocrità di proposta.
**Come evitarlo**: bordi statici `border: 1px solid var(--border-light)`. Animazioni SOLO su `:hover` (border-color shift 200ms).

#### 2.2.3 Mockup 3D Isometric Astratto
**Sintomo**: Cubi, sfere, toroidi metallici iridescenti nella hero che fluttuano.
**Perché accade**: dataset stock pieni di spline/blender 3d. LLM suggerisce per "riempire lo spazio vuoto".
**Perché cervello lo rifiuta**: forme che non comunicano il prodotto = rumore bianco visivo.
**Come evitarlo**: screenshot reale UI del prodotto. Se il prodotto non è ancora visivamente presentabile, mockup testuale (Linear, Stripe: copia tipografica data-driven) o animazione interattiva (Vercel CLI live).

#### 2.2.4 Border Radius 9999 Pill Ovunque
**Sintomo**: `rounded-full` su button, card, image, badge, input.
**Perché accade**: il "pill-shape" è simbolo universale di "moderno/amichevole" nei dataset LLM 2023+.
**Perché cervello lo rifiuta**: quando tutto è pillola, l'interfaccia perde stabilità strutturale. Sembra giocattolo.
**Come evitarlo**: scala differenziata — `border-radius: 4px` per input, `8px` per card/normal, `9999px` SOLO per i badge piccoli di stato.

#### 2.2.5 Box-Shadow 5+ Layer (Finto Neumorfismo)
**Sintomo**: `box-shadow: 0 1px 3px, 0 10px 15px, 0 20px 25px, 0 30px 40px, 0 40px 60px` su card.
**Perché accade**: copia da Tailwind `shadow-2xl` con riflessi multipli.
**Perché cervello lo rifiuta**: ombre troppo diffuse = "sporco visivo", elementi che fluttuano caoticamente.
**Come evitarlo**: max 1-2 layer. Pattern: `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08)` (soft 2-layer).

#### 2.2.6 Iconografia Lucide-Style Inflazionata
**Sintomo**: stessa icona tratto-sottile dappertutto (lucide / heroicons / tabler) in ogni card.
**Perché accade**: librerie React/Vue usate come default assoluto.
**Perché cervello lo rifiuta**: "banner blindness" — il cervello impara che sono ornamentali, le ignora.
**Come evitarlo**: usare icone SOLO quando aggiungono valore funzionale immediato (menu, azioni primarie). Per la suddivisione contenuti usare tipografia pulita. In ConcorsoAI: usare icone SVG custom per le materie (`pen` pillola, `book` libro, ecc.) — non set coerenti.

#### 2.2.7 Mockup UI Fittizia Senza Prodotto Reale
**Sintomo**: screenshot dashboard con dati finti ("Total Revenue: $45,231", nomi "John Doe", grafici a linea retta).
**Perché cervello lo rifiuta**: utenti esperti riconoscono placeholder, perde credibilità.
**Come evitarlo**: in ConcorsoAI il mockup 3-tab mostra ESEMPI di materie reali ("Diritto Amministrativo", "Contabilità") + citazioni reali nei quiz ("Cass. Pen. SS.UU. 2014, n. 38343" reale).

#### 2.2.8 Mockup Laptop-Frame Inflazionato
**Sintomo**: screenshot prodotto SEMPRE incorniciato in mockup MacBook Pro isometrico con browser chrome grigio.
**Perché cervello lo rifiuta**: cliché stravenduto.
**Come evitarlo**: screenshot prodotto senza cornice, con `border-radius: 12px` + `shadow-md`. Pattern Framer self-dogfooding.

#### 2.2.9 Emoji-Based Iconografia Inflazionata
**Sintomo**: 🚀 ✨ 💡 ⚡ 🛡️ inserite in titoli/pulsanti.
**Perché accade**: LLM associa emoji a "giovane/entusiasta".
**Perché cervello lo rifiuta**: aspetto amatoriale, newsletter-di-spam.
**Come evitarlo**: zero emoji. Per enfasi: corsivo tipografico, label testuale diretta.

### 2.3 Tipografia, Colori e Spacing Fallati

#### 2.3.1 Tipografia Gradient Text (H1 con background-clip)
**Sintomo**: H1 con `linear-gradient` + `background-clip: text` (arcobaleno o viola-azzurro).
**Perché accade**: tecnica semplicissima via Tailwind: `bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent`.
**Perché cervello lo rifiuta**: difficile da leggere per utenti con lievi problemi visivi, estetica cheap anni '90.
**Come evitarlo**: colore solido ad alto contrasto. Gerarchia tramite `font-weight` (700 H1 vs 400 body) + dimensioni.

#### 2.3.2 Palette Pastello Lavanda-Viola-Blu Inflazionata
**Sintomo**: indaco/viola elettrico (`#6366f1`, `#a855f7`) su sfondo scuro.
**Perché accade**: default Tailwind UI classes. Adam Wathan pubblicamente ammesso questo bias.
**Perché cervello lo rifiuta**: mercato saturo → associazione con template.
**Come evitarlo**: palette personalizzata. ConcorsoAI: blu istituzionale `#2563EB` (Trust by Stripe), bianco puro `#FFFFFF`, grigio neutrale `#3D5A8A`. NO viola inflazionato.

#### 2.3.3 Spacing Uniforme Monotono (24-32px su tutto)
**Sintomo**: stesso `padding` su badge, card, container, CTA.
**Perché accade**: LLM privo di senso del "ritmo visivo" (Gestalt); applica valori standardizzati.
**Perché cervello lo rifiuta**: monotonia spaziale azzera ritmo, tutto sembra piatto e senza priorità.
**Come evitarlo**: scala gerarchica 8/16/24/40/64/96/144px. Pattern Vercel/Stripe/Linear.

#### 2.3.4 Spacing Inconsistente Simmetrico (17/23/31px Random)
**Sintomo**: valori calcolati a caso, mix px/rem/percentuali in momenti diversi.
**Perché cervello lo rifiuta**: "uncanny valley del design" — l'utente non misura pixel ma percepisce imperfezione geometrica = sciatteria.
**Come evitarlo**: una scala UNICA basata su multipli di 4 o 8. Documentare nei design tokens (vedi `01-reverse-engineering.md`).

#### 2.3.5 CSS Variable Inflazionate (50+ Variabili Inutili)
**Sintomo**: `--my-padding-sm`, `--my-color-primary-1`, `--glass-border`, `--card-gradient-start` mai usate.
**Perché cervello lo rifiuta**: file CSS mastodontici, performance degradate, manutenzione caotica.
**Come evitarlo**: 10-15 token semanticamente raggruppati: `--space-2/4/8`, `--color-accent`, `--color-bg`, `--border-light`, `--radius-lg`, `--shadow-md`. FINE.

#### 2.3.6 Background Pattern Dotted/Grid Inflazionato
**Sintomo**: pattern di pallini o griglia su intere sezioni (stile carta millimetrata).
**Perché cervello lo rifiuta**: interferenze ottiche (moiré) su schermi HiDPI, fastidioso.
**Come evitarlo**: 0 pattern, oppure 1 dedicata (es. una sola sezione FAQ con griglia micro per dare struttura).

---

## 3. COPY & CONTENT — IL VUOTO PNEUMATICO

### 3.1 Hype Words e Headline Generiche

#### 3.1.1 Hype Words Inflazionati
**Sintomo**: supercharge, revolutionize, unleash, elevate, power-up, reimagine, in real-time, seamless, effortless, next-level, game-changing, cutting-edge.
**Perché accade**: questi termini sono i più frequenti nei dataset di training → LLM li genera per ogni prompt.
**Perché cervello li rifiuta**: "calorie vuote" — troppo inflazionati per comunicare nulla.
**Come evitarlo**: zero hype words. Verbo d'azione specifico + JTBD reale.
**ConcorsoAI**: NO "Rivoluziona lo studio", usa "Simula l'orale sul tuo bando".

#### 3.1.2 Hero H1 Verb + Noun Generico
**Sintomo**: "Build the future", "Create amazing things", "Make work easier", "Scale without limits", "Empower your team".
**Perché accade**: mancanza di contesto JTBD da parte dell'AI. Keyword stuffing semantico.
**Perché cervello lo rifiuta**: nessuna informazione specifica = nessuna decisione possibile per l'utente.
**Come evitarlo**: H1 JTBD con risultato immediato + natura esatta.
- *Slop*: "Build the future of software."
- *Real (Linear)*: "A new species of product tool."
- *Real (ConcorsoAI)*: "Simula l'orale sul tuo bando."

#### 3.1.3 Subheadline 2 Righe Dense di Buzzword
**Sintomo**: "AI-powered platform for modern teams that want to revolutionize workflow management with seamless cross-functional collaboration and enterprise-grade security."
**Perché accade**: l'IA cerca di coprire ogni angolo d'interesse in una frase sola = keyword stuffing sintattico.
**Perché cervello lo rifiuta**: la frase non può essere pronunciata in un respiro senza suonare comunicato stampa aziendale.
**Come evitarlo**: max 10-12 parole. Chi fa cosa e perché è diverso.
- *Real (Notion)*: "It's the all-in-one workspace for you and your team."
- *Real (ConcorsoAI)*: "Tre simulazioni gratis al mese · Senza carta · Beta aperta."

### 3.2 Template Mentali e Strutture Narrative Incollate

#### 3.2.1 CTA Identiche
**Sintomo**: "Get started" + "Learn more" + "Try for free" su ogni pulsante.
**Perché accade**: labels standard nel training set e-commerce/SaaS.
**Perché cervello lo rifiuta**: segnaposto emotivo, comunica "non ho pensato al tuo caso specifico".
**Come evitarlo**: CTA orientate al valore percepito specifico del momento.
- "Prova gratis per 14 giorni – Senza carta"
- "Crea il tuo primo report"
- *ConcorsoAI*: "Inizia la prima simulazione" / "Scopri i 4 step"

#### 3.2.2 Trust Signals Gonfiati Senza Nome
**Sintomo**: "Trusted by 100,000+ customers", "Used by Fortune 500 companies" senza loghi reali.
**Perché cervello lo rifiuta**: nessuna verifica possibile = segnale negativo invertito.
**Come evitarlo**: se i numeri non esistono, niente numeri. Se esistono pochi ma importanti, citazione specifica. ConcorsoAI (pre-launch): SOLO legal/tech compliance (server EU, GDPR, no-LLM-USA), NO "10K utenti soddisfatti".

#### 3.2.3 Pricing "Free" Ripetuto Maniacale
**Sintomo**: Free forever, Free to start, Free during beta, 100% Free Free Free.
**Perché cervello lo rifiuta**: aumenta sospetto su billing nascosto (dark pattern).
**Come evitarlo**: trasparenza chirurgica. ConcorsoAI: "3 simulazioni gratis al mese · Poi €9,99/mese senza sorprese".

#### 3.2.4 FAQ Sterili (Domande Inventate + Risposte 3 Paragrafi)
**Sintomo**: "What are the core operational benefits of integrating our collaborative tool? ... Integrates yields multifaceted operational paradigms..."
**Perché cervello lo rifiuta**: SEO padding senza sostanza, le domande non corrispondono a dubbi reali.
**Come evitarlo**: raccogliere le VERE obiezioni del customer service. ConcorsoAI attuale: 5 FAQ su temi reali (materie, GDPR, AI errors, refund, base giuridica). Each max 2 righe.

#### 3.2.5 "Our Mission" Generiche
**Sintomo**: "We believe in empowering teams and individuals to unlock their highest potential through intuitive technology."
**Perché cervello lo rifiuta**: paternalismo vuoto, nessuna genesi reale.
**Come evitarlo**: ConcorsoAI → NO mission. Dire CHI sei + DOVE (Costruito a Milano · Beta aperta) + garanzia.

#### 3.2.6 "Built for [Audience]" Template
**Sintomo**: "Built for founders. Built for designers. Built for developers. Built for enterprises."
**Perché cervello lo rifiuta**: tassonomia standard senza specificità del pain point.
**Come evitarlo**: ConcorsoAI → "Per chi ha superato la scritto e deve affrontare l'orale tra 30 giorni" (specifico).

#### 3.2.7 "All-in-One" Inflazionato
**Sintomo**: "The all-in-one platform for marketing, sales, project management, and customer support."
**Perché cervello lo rifiuta**: sindrome del coltellino svizzero — non specializzato = non risolve problemi specifici.
**Come evitarlo**: focus 1 superpotere funzionale. ConcorsoAI = "Un solo prodotto. Una sola cosa. L'orale."

### 3.3 Dark Pattern, Testimonial e Pricing Finti

#### 3.3.1 Pseudo-Testimonial con Avatar AI
**Sintomo**: "This product has completely transformed how our department operates. Highly recommended! — Jessica M., VP of Operations." + foto stock.
**Perché cervello lo rifiuta**: violazione della fiducia, dark pattern di reputazione.
**Come evitarlo**: solo screenshot reali di messaggi Slack / tweet / video-recensioni. ConcorsoAI pre-launch: NIENTE testimonials finte. Quando avrai i primi 5 beta user REALI, chiedi testimonianza nominativa (vedi `01-reverse-engineering.md` Pattern 8 Wall of Love VIP).

#### 3.3.2 "Say Goodbye to [Pain]" Pattern
**Sintomo**: "Say goodbye to messy spreadsheets and hello to automated clarity."
**Perché cervello lo rifiuta**: tropo stanco ereditato dalla TV anni '90.
**Come evitarlo**: confronto diretto prima/dopo senza formule retoriche. ConcorsoAI: tabella noi vs ChatGPT vs Da solo (vedi `01-reverse-engineering.md` Pattern Asymmetric Comparison).

#### 3.3.3 Statistiche Inventate
**Sintomo**: "73% of teams report increased productivity within the first 48 hours."
**Perché cervello lo rifiuta**: nessuna nota metodologica, nessun link a fonte terza verificabile.
**Come evitarlo**: zero statistiche finte. ConcorsoAI: trasparenza totale ("0 utenti paganti · beta aperta").

#### 3.3.4 "No Credit Card Required" Usato come Dark Pattern
**Sintomo**: enfatizzare "no cc required" quando il piano gratis nasconde barriere di blocco immediate o richiede dati pagamento dopo.
**Perché cervello lo rifiuta**: formula abusata che insospettisce utenti scaltri.
**Come evitarlo**: ConcorsoAI: "3 simulazioni gratis · Senza carta · Senza registrazione" (zero data capture prima del valore).

#### 3.3.5 3-Tier Pricing Identico (Free / Plus / Enterprise)
**Sintomo**: 3 colonne dove cambiano solo i numeri e nomi commerciali.
**Perché cervello lo rifiuta**: differenziazione fittizia.
**Come evitarlo**: quando Stripe live (Q3 2026), UN SOLO tier "Pro €9,99/mese" + Free limit mensile (es. 3 simulazioni/mese). Pareto: introdurre tier solo dopo product-market fit (vedi `01-reverse-engineering.md` sez. 5.2 Don't 4).

#### 3.3.6 CTA "Book a Demo" su Tool PLG
**Sintomo**: tool self-service nato per "provalo tu in 30s" → CTA "Book a Demo" con intermediario commerciale.
**Perché cervello lo rifiuta**: contraddizione strategica classica.
**Come evitarlo**: ConcorsoAI: ZERO "book a demo". CTA è sempre "Prova subito" o "Scarica l'app".

#### 3.3.7 "Made with Love" Footer Template
**Sintomo**: "Crafted with ❤️ by passionate creators around the world for dreamers and doers."
**Perché cervello lo rifiuta**: sentimentalismo zuccheroso, appesantisce il footer.
**Come evitarlo**: footer pulito con link rapidi (Privacy, Cookie, ToS, Recesso Art. 49 Cod. Consumo) + brand marker sobrio ("Costruito a Milano · Luglio 2026").

#### 3.3.8 Lorem Ipsum Residuo
**Sintomo**: "Lorem ipsum" o testi segnaposto lasciati live in homepage.
**Perché cervello lo rifiuta**: zero cura editoriale = zero cura utente.
**Come evitarlo**: pre-deploy proofreading pass obbligatorio su OGNI sezione. Mai pubblicare senza revisione finale.

---

## 4. TECH & CSS — IL DEBITO TECNICO INVISIBILE

> **Nota cognitiva importante**: questa sezione è scritta da un punto di vista dev-audit (DevTools/CSS source visibility), non dal punto di vista dell'utente che percepisce il *render* finale. La triade utente-richiesta "perché succede + perché il cervello lo percepisce + come evitarlo" si applica qui come catena indiretta: l'utente NON vede il CSS, ma il CSS scadente produce un **risultato visivo reso** che il cervello rifiuta (es. `transition: all` → jank percepito; `box-shadow 5-layer` → sporco visivo; z-index caos → elementi che scompaiono dietro altri; `@font-face` senza `font-display: swap` → FOIT percettibile come "sito lento/cheap").

### 4.1 DOM e Utility Classes Hell

### 4.1 DOM e Utility Classes Hell

#### 4.1.1 Tailwind Utility Classes Inflazionate
**Sintomo**: 15-30 classi su ogni `<div>`. Es: `<div class="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">`.
**Perché rivela AI-template**: LLM "sovra-specifica" ogni proprietà in HTML perché non ha visione olistica del foglio di stile.
**Come evitarlo**: classi semantiche con `@layer` + custom properties:
```css
.card-clean {
  display: flex; flex-direction: column; align-items: center;
  padding: 1.5rem; background: var(--surface-bg);
  border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);
  transition: box-shadow 0.3s ease;
}
```

#### 4.1.2 CSS-in-JS Inflazionato (`<style jsx>` per ogni componente)
**Sintomo**: blocchi `<style jsx>` o CSS-in-JS inline duplicati ad ogni render.
**Perché rivela AI-template**: AI compila stile localmente per non toccare i globali.
**Come evitarlo**: CSS modulari o classi semantiche in CSS globale. Custom properties per dinamicità.

#### 4.1.3 DOM Nesting Inutile
**Sintomo**: `<div><div><div><span>X</span></div></div></div>` per racchiudere una parola.
**Perché rivela AI-template**: AI assembla componenti senza ottimizzare l'albero DOM.
**Come evitarlo**: appiattire l'HTML, sfruttare selettori moderni. Massimo 2-3 livelli di nesting per qualsiasi componente.

### 4.2 Posizionamenti, Z-Index e Layout Fracassati

#### 4.2.1 `position: absolute; inset: 0` Inflazionato
**Sintomo**: `absolute + inset` su elementi che non hanno motivo architetturale di sovrapporsi.
**Perché rivela AI-template**: scorciatoia geometrica quando flex/grid non funzionano.
**Come evitarlo**: `display: grid; place-items: center` nativi, espliciti e puliti.

#### 4.2.2 `transform: translate(-50%, -50%)` per Centrare
**Sintomo**: pattern tutorial di 10 anni fa: `position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%)`.
**Perché rivela AI-template**: pattern onnipresente nei dataset storici di training CSS.
**Come evitarlo**: flexbox `display: flex; justify-content: center; align-items: center`.

#### 4.2.3 `z-index: 9999` Caos
**Sintomo**: `9999`, `99999`, `100000` su elementi arbitrari.
**Perché rivela AI-template**: AI alza z-index ogni volta che un elemento viene coperto, collassi di stacking contexts.
**Come evitarlo**: scala logica limitata `--z-dropdown: 100; --z-modal: 1000; --z-toast: 10000`. Mai superare 9999.

#### 4.2.4 `transition: all 0.3s` Universale
**Sintomo**: `* { transition: all 0.3s ease }` su tutto.
**Perché rivela AI-template**: scorciatoia per "tutto si muova dolcemente". Performance pessima — il browser ricalcola su qualsiasi proprietà.
**Come evitarlo**: transizioni ESPLICITE solo su proprietà performanti (`transform`, `opacity`):
```css
transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
```

#### 4.2.5 @media Query Inflazionate (12 Breakpoint)
**Sintomo**: 12 media query frammentate (`480`, `520`, `768`, `840`, `960`, `1024`...).
**Perché rivela AI-template**: rattoppa problemi responsive aggiungendo query spot ogni volta che un elemento si rompe.
**Come evitarlo**: 3-4 breakpoint logiche macro (Mobile/Tablet/Desktop/Wide) + `clamp()` font-size responsive + flex-wrap.

### 4.3 Hack Visivi, Performance e Accessibilità Dimenticate

#### 4.3.1 Google Fonts CDN Senza Preconnect
**Sintomo**: `<link href="https://fonts.googleapis.com/css?family=Inter">` senza `<link rel="preconnect">`.
**Perché rivela AI-template**: AI genera link tag copiando frammenti isolati. Impatto negativo su LCP.
**Come evitarlo**: preconnect + preload + `font-display: swap`. ConcorsoAI: Inter self-hosted via fonts.bunny.net GDPR-friendly (già implementato).

#### 4.3.2 @font-face Duplicato Senza `font-display: swap`
**Sintomo**: stesso font dichiarato 3 volte in 3 file diversi, senza `font-display: swap`.
**Perché rivela AI-template**: AI genera stili locali per ogni componente che richiede font.
**Come evitarlo**: centralizzare in un unico blocco globale con `font-display: swap`.

#### 4.3.3 CSS Specificity Hell (`!important` ovunque)
**Sintomo**: `!important` su layout/colori per vincere conflitti.
**Perché rivela AI-template**: AI non risolve conflitti di specificità, usa `!important` come cerotto.
**Come evitarlo**: rispettare la specificità naturale, usare `@layer` per controllare la cascade.

#### 4.3.4 Linear Gradient Inflazionati (VibeCode Purple)
**Sintomo**: `linear-gradient(135deg, #6366f1, #8b5cf6)` su bg, button, badge, everywhere.
**Perché rivela AI-template**: timbro visivo AI classico.
**Come evitarlo**: gradient solo su 1 elemento max. ConcorsoAI: zero gradient. CTA principale usa bgcolor solido `#2563EB` (l'unica istanza di "vibe" è il glow del mockup interattivo hero).

#### 4.3.5 Box-Shadow Multi-Layer Inflazionato
**Sintomo**: `box-shadow: 0 1px 3px, 0 4px 6px, 0 10px 15px, 0 20px 25px, 0 30px 40px` su card.
**Come evitarlo**: ombre leggere 1-2 layer max. Pattern: `0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08)`.

#### 4.3.6 Animazioni Solo `scale(1.05)` su Hover
**Sintomo**: ogni interattivo risponde al hover con `transform: scale(1.05)`.
**Perché rivela AI-template**: effetto micro-interazione standard preimpostato.
**Come evitarlo**: variazioni di opacity, translateY millimetrici, border-color shift. Es: `card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--border-hover); }`.

#### 4.3.7 Variabili localStorage con Nomi Lunghissimi e Sospetti
**Sintomo**: `localStorage.setItem('crypto-js-template-flag-2024-06-08b', 'true')` chiavi random/template residue in produzione.
**Perché rivela AI-template**: AI "si inventa" flag di stato o scaffolding tutorial.
**Come evitarlo**: pulire state management, standardizzare nomi. ConcorsoAI: chiavi tipo `concorsoai.sim.last.{userId}` pulite e documentate.

#### 4.3.8 `visibility: hidden` Inappropriato
**Sintomo**: `opacity: 0` o `visibility: hidden` per nascondere elementi che dovrebbero essere display:none.
**Perché rivela AI-template**: AI non valuta accessibilità/aria-hidden, usa scorciatoia di visibility.
**Come evitarlo**: `display: none` per elementi fuori flusso, o `hidden` HTML attribute nativo (rispettoso screen reader).

#### 4.3.9 Print Stylesheet Abbandonato
**Sintomo**: zero `@media print` su landing B2B o dashboard professionali.
**Perché rivela AI-template**: AI progetta solo viewport desktop/mobile.
**Come evitarlo**: aggiungere `@media print { .nav, .footer, .no-print { display: none } body { background: white; color: black } }` minimo.

---

## 5. CONCORSOAI APPLICABILITY — IL NOSTRO VACCINO

### 5.1 Landing Page (`public/index.html`) — Cosa Stiamo Facendo Bene e Cosa Presidiamo

#### 5.1.1 Già Conforme (da `01-reverse-engineering.md` + 12 pivot anti-slop)
- Già conforme: H1 JTBD: "Simula l'orale sul tuo bando."
- Già conforme: Subheadline 12 parole secche: "Tre simulazioni gratis al mese · Senza carta · Beta aperta."
- Già conforme: Trust band con elementi VERIFICABILI: GDPR, Server EU, No LLM USA, Garanzia 100% rimborsabile
- Già conforme: Footer marker reale: "Costruito a Milano"
- Già conforme: Zero hype words nel copy
- Già conforme: Zero emoji
- Già conforme: Zero statistiche inventate
- Già conforme: Zero pseudo-testimonials (zero testimonials finora, ok per pre-launch)
- Già conforme: Tipografia self-hosted Inter via bunny.net GDPR-friendly
- Già conforme: prefers-reduced-motion rispettato

#### 5.1.2 Cosa Presidiamo (possibili regressioni)
- Da presidiare: Mockup 3-tab hero: assicurarsi che le materie siano REALI (Diritto Amministrativo, Contabilità, ecc. — non "Sample Subject 1"). Le citazioni dei quiz devono essere reali (Cass. Pen. SS.UU. 2014, n. 38343 reale, NON inventata da LLM).
- Da presidiare: Tabella confronto: restare CONCRETI ("Noi: simulazione realistica con materie del bando · ChatGPT: generico senza personalizzazione" — non "ChatGPT: 73% imprecisions" che è fake).
- Da presidiare: FAQ: 5 max, domande vere PA-candidate. Escludere "What is our mission" (template).
- Da presidiare: CTA: "Inizia la prima simulazione" — non "Get started free".
- Da presidiare: CTA secondaria: "Scopri i 4 step" — non "Learn more".
- Da presidiare: Palette: blu `#2563EB` (Stripe-style institutional) + bianco + grigio. NO viola/indaco VibeCode.
- Da presidiare: Sfondi: tinta unita `#FFFFFF` + 1 radial-gradient micro nella hero ONLY, al di sotto del mockup. Nessun gradient sui CTA button.
- Da presidiare: Spacing: gerarchia 8/16/24/40/64/96/144px. Mai monotono 32px su tutto.

### 5.2 Auth e Dashboard — Disciplina Anti-Slop Mantenuta

#### 5.2.1 Auth (`auth.html`) — Check file-specifici
- **Da fare**: solo magic-link via Supabase. NO password creation form. NO social login providers esotici.
- **Da fare**: trust indicators primo paint (server EU + GDPR + "I tuoi dati restano in Italia") visibili sopra la card login.
- **Mai**: post-auth max 1 click per arrivare a "Inizia la prima simulazione". NO step obbligatori "completa il tuo profilo".
- **Mai**: finta urgenza anche quando Stripe attivo nel Q3 2026 (niente countdown "offerta Pro finisce in 3:59:59" sul auth page).
- **Mai**: error state generico. Solo messaggi concreti ("Magic link scaduto. Riprova."), mai "Something went wrong. Try again later."

#### 5.2.2 Dashboard (`dashboard.html`) — Check file-specifici
- **Da fare**: mantenere density-as-credibility esistente — gauge 140px (NON gonfiare a 180-200px per "stupire") + streak + aree accordion + trend SVG + recent sims list. NON sostituire con "bento grid 5 card generiche" (sarebbe regressione al pattern canonico AI-slop).
- **Da fare**: tipografia mono per i numeri (Geist Mono per timer/quota/punteggio, già caricato via `fontsource/geist-mono`).
- **Mai**: progress bar — solo "3/3 simulazioni gratis usate" o equivalente verificabile. Mai "97% al successo" senza dati.
- **Mai**: trust badge balloon senza garanzia writer-led specifica (niente badge minibanner "100% sicuro" generici).
- **Mai**: mockup screenshot del prodotto dentro la dashboard (siamo già nel prodotto, sarebbe tautologico).
- **Da fare**: streak dots reali, 7 giorni in ordine SX=6 giorni fa → DX=oggi. Mai numeri inventati di streak consecutivi.

#### 5.2.3 Simulation (`simulation.html`) — Check file-specifici
- **Mai**: citazioni normative plausibili ma inventate. Ogni articolo citato nei quiz (es. "Cass. Pen. SS.UU. 2014, n. 38343") DEVE essere verificabile su Normattiva. LLM tende a inventare numeri di articoli inesistenti — anti-pattern #33 del checklist.
- **Da fare**: disclaimer visibile MAX 1 occorrenza ("L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale."), non su ogni risposta.
- **Da fare**: nessun bias "risposta facile". Se la commissione potrebbe chiedere l'opposto della risposta AI, la risposta simulata deve evidenziare l'incertezza con "La commissione potrebbe anche chiedere il punto di vista opposto: [...]".
- **Da fare**: struttura risposta finale `{punteggio} + {commento specifico} + {riferimento normativo verificabile}`. Nessun punteggio senza spiegazione.

### 5.3 Tone of Voice e Micro-copy Istituzionale

#### 5.3.1 Cosa NON Scrivere Mai
- ❌ "Rivoluziona il tuo studio"
- ❌ "Supercharge la tua preparazione"
- ❌ "In real-time"
- ❌ "Live" (se non è davvero live — il mockup 3-tab è DEMO, non live)
- ❌ "Seamless"
- ❌ "73% of candidates..."
- ❌ "Unleash your potential"
- ❌ "Effortless learning"

#### 5.3.2 Cosa Scrivere Invece (PA-aware Italian)

Per gli esempi canonici di copy PA-compliant cfr. sezione 5.1.1 sopra; nessuna nuova istanza da elencare in questa sede per evitare duplicazione.

#### 5.3.3 Tooltips & Empty States
- Già conforme: **Empty state dashboard**: "Nessuna simulazione ancora. Inizia la prima per vedere le tue statistiche." (fattuale, NON motivazionale).
- Già conforme: **Error state**: "Errore di rete. Riprova o contatta supporto@concorsoai.it." (concreto, NON generico).
- Già conforme: **Success state**: "Simulazione completata. Punteggio: 78/100. Salvata nella tua dashboard." (fattuale, NON "Mission accomplished! 🎉").

---

## 6. CHECKLIST FINALE ANTI AI-SLOP (30 Punti)

### 6.1 Visual & Design (10 punti)

- [ ] **1. Gradient**: max 1 gradient nella hero, 0 altrove. NO radial+linear sovrapposti.
- [ ] **2. Glassmorphism**: max 1 elemento glass (tipicamente navbar). Tutte le altre card su solido.
- [ ] **3. Mockup 3D**: nessun mockup 3D astratto (cubi, sfere). Screenshot reali UI del prodotto SOLO.
- [ ] **4. Palette**: blu istituzionale + bianco + grigio neutro. NO viola/indaco inflazionato.
- [ ] **5. Border-radius**: scala differenziata (4px input, 8px card, 9999 SOLO badge piccoli). NO pill ovunque.
- [ ] **6. Box-shadow**: max 2 layer per ombra. NO 5-layer multi-shadow.
- [ ] **7. Tipografia gradient text**: ZERO H1 con `background-clip: text`. Colore solido.
- [ ] **8. Spacing**: scala gerarchica 8/16/24/40/64/96/144px. NO monotono 24-32px.
- [ ] **9. Hero alignment**: H1 + sub allineati a SINISTRA (no centered simmetrico).
- [ ] **10. Sezioni**: rompere la struttura canonica 5 sezioni. ConcorsoAI: 7+ sezioni asimmetriche con ritmo vario.

### 6.2 Copy & Content (10 punti)

- [ ] **11. Hype words**: zero "supercharge", "revolutionize", "unleash", "seamless", "effortless", "in real-time", "live".
- [ ] **12. H1 JTBD**: H1 NON è "verb + noun generico". H1 È "Simula l'orale sul tuo bando" o equivalente JBTD specifico.
- [ ] **13. Subheadline**: max 10-12 parole. Una sola riga.
- [ ] **14. CTA**: orientate al valore specifico del momento, NON "Get started" / "Learn more".
- [ ] **15. Trust signals**: SOLO verificabili (Server EU, GDPR, no LLM USA). NO numeri gonfiati.
- [ ] **16. FAQ**: max 5, domande vere PA-candidate. NO "What is our mission".
- [ ] **17. Testimonials**: zero fake. NO avatar AI. NO recensioni inventate.
- [ ] **18. Statistiche**: zero inventate. Tutte le % verificabili o eliminate.
- [ ] **19. Pricing**: trasparenza chirurgica. "3 simulazioni gratis/mese · Poi €9.99/mese senza sorprese" quando Stripe live.
- [ ] **20. Footer brand marker**: "Costruito a Milano · Luglio 2026" o equivalente REALE (NON "Made with ❤️").

### 6.3 Tech / CSS (10 punti)

- [ ] **21. Tailwind utility classes**: max 5-6 per elemento, NON 15-30. Usare classi semantiche quando possibile.
- [ ] **22. Font**: self-hosted via Bunny.net (GDPR), preconnect + preload + `font-display: swap`.
- [ ] **23. Z-index**: scala logica (100/1000/10000). Mai `9999` se non per il toast.
- [ ] **24. Transition**: SEMPRE esplicita su proprietà performanti (`transform`, `opacity`). NO `transition: all`.
- [ ] **25. Breakpoint**: max 3-4 macro (Mobile/Tablet/Desktop). Mai 12. Usare `clamp()` per responsive fluid.
- [ ] **26. `!important`**: zero. Mai, per nessuna ragione. Risolvere conflitti con `@layer`.
- [ ] **27. DOM nesting**: max 2-3 livelli per qualsiasi componente. Mai 5+ `<div>` vuoti.
- [ ] **28. localStorage naming**: chiavi pulite e documentate. Mai nomi random `crypto-js-template-flag-2024`.
- [ ] **29. Print stylesheet**: `@media print` minimo presente (anche solo per nascondere nav/footer).
- [ ] **30. prefers-reduced-motion**: TUTTE le animazioni custom rispettate (incluse keyframe infinite, scroll-driven, ecc.)

### 6.4 ConcorsoAI Core (5 punti bonus)

- [ ] **31. Materie reali**: nessuna "Sample Subject 1". Tutte le materie nei quiz sono reali concorsi PA italiani.
- [ ] **32. Citazioni normative reali**: ogni articolo citato è verificabile su Normattiva. Disclaimer "verifica sul bando ufficiale" presente.
- [ ] **33. Garanzia prominente**: quando Stripe live, "100% rimborsabile entro 30 giorni" visibile senza scroll fino al footer.
- [ ] **34. Italian PA-aware**: zero gergo tecnico developer (mai "LLM", "RAG", "tokens"). Sempre "bando", "commissione", "materie di esame", "risposta simulata".
- [ ] **35. Founder marker onesty**: footer dice chi siamo + dove + quando + garanzia. NO "Empowering teams worldwide".

---

## 7. FONTI & RIFERIMENTI

### Articoli e Blog di Designer
- Smashing Magazine (Vitaly Friedman) — Best practices CSS e architettura anti-AI-slop
- UX Movement — Pattern di micro-interaction inflazionati
- NN/g (Nielsen Norman Group) — Eye-tracking su landing AI-template

### Community & Discussioni Reali
- **Hacker News:**
  - Discovery query (link verifica umana necessaria per ID specifici): [news.ycombinator.com/?text=AI+slop](https://news.ycombinator.com/?text=AI+slop)
  - Citazione parametrizzata nel testo (sez. 1.3): la comunità Hacker News ha discusso attivamente AI-slop nel 2025-2026; gli ID dei singoli thread NON sono verificati automaticamente dal LLM-researcher e richiedono click-through umano prima di uso pubblico, in coerenza con il nostro stesso anti-pattern #33 (Founding Onesty / Fake Authority Citations).
  - Thread "The reason AI slop is slop isn't because models are not advanced enough" (2025)
- **Reddit:**
  - r/webdev, r/Frontend, r/copywriting, r/DesignPorn — pattern detection community
  - r/vibecoding — "vibe-coded" landing expose

### Studi Quantitativi
- Adrian Krebs — *Scoring Show HN Submissions for AI Design Patterns* (1.590 landing page analizzate via Playwright)
- 925Studios — *AI Slop Web Design Complete Guide 2026*
- Yash Kaku — *AI Slop in Brand Design: Why Every Brand Suddenly Looks the Same*

### Framework Teorici
- Don Norman — *The Design of Everyday Things* (cognitive fluency)
- Jared Spool — *Costly Signaling Theory in UX* (signal of effort)
- Mori, Masahiro — *Uncanny Valley* (1970), estesa al design digitale 2025
- Adam Wathan (Tailwind) — *Public admission of "lavender-purple" defaults in LLM training bias*
- Cialdini, R. — *Influence: The Psychology of Persuasion* (reciprocity, social proof)
- Kahneman, D. & Tversky, A. — *Prospect Theory* (loss aversion, anchoring)

### Cross-Ref Interni del Progetto ConcorsoAI
- `01-reverse-engineering.md` — pattern premium dei 20 SaaS leader mondiali (12 pattern + 11 anti-pattern)
- `01-reverse-engineering.md` sez. 5 — applicazione specifica a ConcorsoAI
- `slop-registry.md` — registro dei pattern slop intercettati + pivot applicati
- `public/index.html` — landing attuale (12 pivot anti-AI-slop + micro-fix già applicati)
- `auth.html`, `dashboard.html`, `simulation.html` — da auditare con checklist 6.1-6.4

---

*Fine del documento. 02-ai-slop-analysis.md, Luglio 2026. Word count effettivo: ~5.700 parole (54 anti-pattern × 60-110 parole ciascuno, percezione umana + ConcorsoAI applicability + checklist finale). Cross-linked con `01-reverse-engineering.md` come design bible completa del progetto: `01` = cosa rende premium, `02` = cosa rende slop.*
