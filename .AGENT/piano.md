# PIANO STRATEGICO — PROJECT ATLAS (Concorso AI)

**Versione**: 1.0
**Data**: 24 luglio 2026
**Autore**: Lead Product Designer — Project Atlas
**Scopo**: Trasformare lo stato attuale (semi-finito, qualità percepita ~4/10) in un prodotto finito, riconoscibile senza logo, che tra 5 anni sarà ancora elegante. Non stiamo scrivendo codice: stiamo costruendo un'esperienza.

**Vincoli non negoziabili** (`.AGENT/metodo.md` + `.AGENT/anti-slop.md`):
1. La chiarezza viene prima dell'estetica.
2. Ogni animazione deve migliorare la comprensione (mai "perché è figo").
3. Nessun componente esiste senza uno scopo (Why Test).
4. Lo spazio bianco è uno strumento, non spazio vuoto.
5. Se un elemento sembra un template (Tailwind UI, shadcn, ecc.), viene riprogettato da zero.
6. Il design deve essere riconoscibile senza il logo.

**Tono di base**: "Tranquillo. Facciamolo bene." (manifesto.md)

---

## 1. DIAGNOSI DELLO STATO ATTUALE

### 1.1 Quadro sinottico

| Area | Stato | File chiave | Note |
|---|---|---|---|
| Landing | Funzionante, 5 fix prioritari applicati (`IMPLEMENTAZIONE-5FASI.md`) | `public/index.html` | CTA unica ✅, trust ribbon ✅, pricing ✅ |
| Auth | Funzionante, Supabase email + Google OAuth | `public/auth.html` + `auth-patch.js` | Da non toccare |
| Dashboard | 4 tab definiti in `DASHBOARD-DESIGN.md`, implementazione parziale | `public/dashboard.html` + `public/css/dashboard.css` | Tab 1/3 ~70%, Tab 2 paywall mancante, Tab 4 placeholder |
| Simulazione | Monolite 1998 righe, funzionante ma con 6 criticità aperte | `public/simulation.html` + `simulation.css` (2353 righe) | Refactoring imperativo |
| History | Funzionante, fix clarity_score integrato | `public/history.html` | Da verificare in produzione |
| Backend AI | `api/chat.js` funzionante, 30 req/min | OpenRouter (Gemini 2.5 Flash default) | OK |
| Quota | `api/quota.js` esiste ma MAI chiamato | simulation.html | P1 |
| Telemetria | `api/track.js` stub — non chiamato da nessuna pagina | Tutte le HTML | P2 |
| Auth-tokenBearer su tutte le chiamate | Applicato | `api/chat.js` | OK |

### 1.2 I 15 problemi principali (in ordine di priorità qualitativa, non temporale)

1. **[P0] Design System NON unificato.** `:root` tokens in `dashboard.css` sono duplicati/sparsi nelle altre HTML inline. Manca un'unica fonte di verità.
2. **[P0] `simulation.html` monolitico (1998 righe)** — 3 fasi (Config/Briefing/Sim/Summary) nello stesso file. Ogni modifica rischia regressioni.
3. **[P0] Paywall Tab 2 incompleto.** Il Tab "Il tuo piano" mostrare paywall agli utenti Free, ma la UI non è progettata per convertire — solo per bloccare.
4. **[P1] Feedback panel sovrappone la chat su mobile** (`<375px`). Gerarchia visiva crolla.
5. **[P1] Empty state della chat pre-prima-domanda è completamente vuoto.** L'utente può pensare "la pagina non si è caricata".
6. **[P1] Incoerenza iconografica letale**: emoji (📄, 🟢🟡🔴) mischiate a SVG inline. Distrugge l'estetica professionale.
7. **[P1] Nessun check quota chiamato in `startSimulation()`.** Un Free con 0 simulazioni vede solo un errore 403 post-avvio.
8. **[P1] "Memoria di seduta" assente nel commissario AI.** Ogni risposta è trattata indipendentemente: niente follow-up "prima hai detto X, ora Y".
9. **[P2] Typewriter caret lineare** — il commissario sembra "macchina da scrivere", non umano. Mancano pause sui punti/virgole.
10. **[P2] Reazioni del commissario limitate a 2-3 espressioni.** Sessioni di 20-30 min diventano monotone.
11. **[P2] Fiamma Streak "videogame"** — l'animazione viola il principio "calma" del manifesto. È troppo giocoso per un candidato sotto pressione.
12. **[P2] Zero feedback audio/aptico.** Quando arriva un messaggio del commissario o l'utente invia, niente suono/vibrazione. L'esperienza è sorda.
13. **[P2] Tutorial tooltip senza persistenza tra sessioni.** Se l'utente chiude prima di finire, ricomincia da capo (fastidioso).
14. **[P2] `api/track.js` stub.** Non ci sono eventi di telemetria, quindi non possiamo misurare il successo di NIENTE di questo piano.
15. **[P2] Animazioni "ballerine" residue** (bounce/elastic) in alcuni micro-states — vietate dall'anti-slop.

### 1.3 Cosa sembra AI Slop (il nemico mortale)

- **Glassmorphism.** Alcuni blur su card (es. feedback panel mobile) sembrano presi da `dribbble.com/shots/popular`.
- **Gradienti brand → accent** nei bottoni primari (`linear-gradient(90deg, #2563EB, #0F4C81)` è di fatto accettabile, ma il *pulse animation* dei CTA hero è troppo "fighetto").
- **Ombre a 32px di blur** in certi toast. Il modello canonico è `--sh-2` ≤16px.
- **Ombra "magica" vicino alle icone** (filter: drop-shadow con rgba generici).
- **Testo "decorativo" senza scopo** ("Disdici con 1 clic" è OK perché ha scopo, ma shape decorative senza scopo no).

### 1.4 Cosa manca

- **Brand mark iconografico** (segnale visivo riconoscibile, anche solo ornamentale nel dettaglio scheda bando).
- **Punto di contatto per Pro nella dashboard** (CTA upgrade elegante — niente pop-up invasivo).
- **Insieme di icone SVG outline coeso** (stroke 1.5, set unico: Lucide o bespoke, basta che sia COERENTE).
- **Empty state canonico** (riusabile in tutte le liste/schede vuote).
- **Storia del "prima volta"** — il primo accesso dovrebbe essere un evento memorabile ma non rumoreggiante (3 step ≤ 8s totale).

### 1.5 Punteggio di qualità percepita: **4/10**

*Motivazione*: L'infrastruttura tecnica è solida (Supabase, AI streaming, autenticazione), il prodotto ha un'identità nota a parole (manifesto) e le fondamenta visive esistono (palette, font, tokens in `dashboard.css`). Ma l'esecuzione UI/UX è frammentata tra file, ci sono tracce di AI Slop nei micro-states, e l'esperienza non ha ancora il "ritmo" del manifesto. Il commissario AI — che è il pezzo forte — non respira ancora come una persona. Si vede il potenziale del tempio ma non è ancora un tempio. Un investitore direbbe "c'è qualcosa"; un designer attento direbbe "non ancora".

---

## 2. VISIONE FINALE

### 2.1 Il prodotto finito in 1 paragrafo

Concorso AI è uno spazio silenzioso, strutturato, dove un candidato sotto pressione trova un commissario che lo interroga con la stessa calma di un funzionario vero: niente fanfare, niente pupazzi animati, niente urla visive. L'utente apre il sito dopo una giornata pesante, sceglie cosa fare senza pensarci (simulazione oggi, piano domani), affronta la seduta e quando chiude il browser ha il passo successivo già chiaro in testa — senza ansia aggiunta dall'interfaccia.

### 2.2 I 5 Principi che definiscono il successo del redesign

1. **Calma.** Sfondi neutri (#F7FBFF, #FFFFFF). Contrasto solo dove serve un'azione. Mai due colori che competono.
2. **Una domanda per schermata.** Dashboard = "Cosa faccio adesso?". Simulazione = "Domanda del commissario". Progressi = "Come sto andando?". Mai due risposte nella stessa vista.
3. **Densità variabile = ritmo.** Una pagina deve avere zone di silenzio, zone di azione, zone di feedback — alternate. Mai tutto "urlante".
4. **Spazio bianco come strumento.** Ogni gap deve essere motivato. Se ritagli lo spazio e l'occhio non sa dove andare, lo spazio è sbagliato.
5. **Riconoscibile senza logo.** Tolto il marchio, deve restare: ombre a caduta singola (1-2px Y, max 16px blur), Geist Mono solo per dati, brand color `#0F4C81` solo per ACTION/STATE — mai decorativo.

### 2.3 L'esperienza utente in 3 frasi

1. **Apro Concorso AI dopo una giornata pesante**: la dashboard è silenziosa, una sola CTA chiara, niente che mi corre dietro.
2. **Avvio la simulazione**: il commissario mi fa la prima domanda dopo una pausa di riflessione naturale (~2-3s), le sue parole scorrono con il ritmo di una persona vera.
3. **Finisce la seduta, torno alla dashboard**: il punteggio è chiaro, so esattamente cosa rifare domani, e ho voglia di aprire di nuovo il sito domani mattina.

### 2.4 Cosa rende Project Atlas riconoscibile senza logo

- **Type-pair obbligatorio**: Geist (interfaccia) + Geist Mono (solo numeri, voti, date). Mai serif, mai font "di personalità".
- **Palette ristretta**: 1 brand (`#0F4C81`), 1 accent (`#2563EB`), 3 stati (success/warning/error). Basta.
- **Radius controllato**: 6-12px ovunque. Mai >16px.
- **Ombre singole** (no multistrato), max 16px blur, max 8px Y offset, 6-12% opacity.
- **Transizioni `cubic-bezier(0.25, 0, 0.15, 1)`** ovunque (mai `bounce`, `elastic`, `linear` salvo particolari eccezioni di entrata/uscita).
- **CTA che cambiano una parola**, non un colore: hover = 2px translateY + ombra +1. Niente gradienti, niente scale 1.04.

---

## 3. FASI DEL PROGETTO (6 PRINCIPALI)

> **Stima realistica**: 10 settimane di focus totale per un team di **1 Designer + 1 Developer** (full-time). Tempi ASPIRATIONALI ma verificati (vedi §6 Timeline). Atlas non ha fretta, ma neanche spreca tempo. Ogni settimana ha 1 deliverable concreto e 1 anti-slop review.

### FASE 1 — Fondamenta, Costituzione & Design System "Atlas" (3 settimane)

- **Durata**: 15 giorni lavorativi (Settimana 1-3). Struttura: Settimana 1 = kickoff (regole + decisioni), Settimane 2-3 = sistema visivo e catalogo componenti.
- **Obiettivo**: Sigillare la Costituzione PRIMA di toccare un pixel, poi costruire una fonte unica di verità visiva. Tutto il codice successivo consumerà solo da qui. Niente pixel di layout finché il kickoff non è firmato.
- **Deliverable kickoff (Settimana 1)**:
  - `Costituzione v2` (`.AGENT/costituzione.md`): 12 principi (gli 8 attuali + 4 nuovi: ZERO emoji in UI, ZERO bounce, RADIUS ≤ 12, ASIMMETRIA controllata).
  - `Anti-Slop Hall of Shame` (`.AGENT/anti-slop-shame.md`): 10 esempi VISIVI concreti di cosa è vietato (markup statico, non solo testo).
  - `DECISIONS.md` (`.AGENT/DECISIONS.md`): tabella markdown di decisioni "chiuse per sempre", append-only.
- **Deliverable design system (Settimane 2-3)**:
  1. `public/css/atlas-tokens.css` (≈ 60 righe): design tokens in `:root`. Palette, tipografia, spacing (4/8/12/16/24/32/48/64px), radius (6/8/10/12), ombre (sh-1 → sh-4), motion (`--ease-standard`, `--ease-emphasized`, durate 100/200/300/500ms). Tutto in CSS custom properties.
  2. `public/css/atlas-base.css` (≈ 120 righe): reset, body, link, focus-visible, button (primario/secondario/terziario), input, label, typography helper.
  3. `core-components.html` (pagina statica isolata): 8 macro-componenti renderizzati (Bottone, Card, Input, Toggle, Pill, Toast, Tooltip, Avatar). Ognuno con 3 varianti esplicite e il relativo snippet HTML. È il **catalogo vivente** del design system.
  4. Set icone SVG unificate: 24 icone base (upload, calendar, trophy, fire, chevron, check, x, mic, send, edit, trash, plus, doc, brain, clock, lock, dotsVertical, refresh, settings, user, mail, bell, sparkle, messageCircle). Stroke 1.5, monochrome. Tutte inline-ready.
- **Strumenti**: VS Code, Figma (solo Variabili e Constraints, niente frame statici), Lucide come reference iconografico.
- **Criteri di successo kickoff**: i 3 file `.AGENT/*.md` sono firmati per approvazione dal Founder. La Settimana 2 non parte senza firma di chiusura.
- **Criteri di successo design system**: 100% dei token in `:root`. Zero colori hex literali nei CSS secondari. `core-components.html` carica in 250ms su localhost con 24 elementi tutti renderizzati.
- **Controllo anti-slop (kickoff)**: **Reading Test**. Il Founder legge ad alta voce i 12 principi. Se uno qualunque fa ridere o sembra "fighetto", si riscrive.
- **Controllo anti-slop (design system)**: **Template Confusion Test**. Si sovrappone un bottone di Tailwind UI al nostro bottone principale in `core-components.html`. Se sono visivamente indistinguibili, il bottone va ridisegnato.

### FASE 2 — Architettura & Layout dei 4 Tab (1.5 settimane)

- **Durata**: 7 giorni lavorativi (Settimana 4 + inizio 5)
- **Obiettivo**: Il ritmo della dashboard. Nessun contenuto, solo struttura.
- **Deliverable**:
  1. `public/dashboard.html` REWRITE: shell HTML per i 4 Tab (Prepara / Il tuo piano / Progressi / Classifica). Ogni Tab è un `<section id="tab-N">` swapped via classe CSS (`.is-active`).
  2. Topbar ridisegnata: logo + 4 tab orizzontali + avatar/badgetier (Free/Pro). Active state: solo underline 2px + label brand. Niente pill, niente background colored.
  3. `public/css/layout.css` (≈ 200 righe): CSS Grid a 12 colonne desktop / 6 colonne mobile. Container max-width 1280px. Gap principale 24px, gap secondario 12px.
  4. **Paywall Tab 2 PROTOTIPO**: vista bloccata per Free (icona lucchetto outline + testo "Funzionalità Pro" + bottone "Passa a Pro"). Nient'altro.
- **Strumenti**: HTML semantico, CSS Grid + Flexbox, zero JS framework.
- **Criteri di successo**:
  - Tutte le 4 Tab hanno almeno l'header + skeleton vuoto con un messaggio di empty state canonico.
  - Tab 2 in Free mostra il paywall funzionante (CSS-only, link a `/pricing`).
  - Su viewport 375px, la topbar collassa in hamburger (se necessario) o resta orizzontale con label abbreviate.
- **Controllo anti-slop**: **Squint Test**. Il Designer chiude gli occhi a metà e guarda la dashboard. Devono risaltare SOLO: il contenuto principale di Tab 1 attivo e la CTA primaria "Inizia simulazione". Tutto il resto deve sparire in una sfumatura neutra. Se qualcosa urla, va ridisegnato.

### FASE 3 — Componenti Chiave (3 settimane)

- **Durata**: 15 giorni lavorativi (Settimane 5-7)
- **Obiettivo**: Tutti i 12 componenti critici sono definiti, documentati, e funzionanti.
- **Deliverable** (12 componenti):
  1. **Card Bando** (Tab 1, default + selected = 2 varianti)
  2. **Toggle group Difficoltà/Durata** (Tab 1, `.opt-toggle` esistente + `.is-active`)
  3. **Calendar 7 giorni** (Tab 2, 7 col Grid con stato: vuoto / completato / oggi / futuro)
  4. **Chat AI inline** (Tab 2, bubble commissario + bubble utente + system messages)
  5. **Gauge SVG 140px** (Tab 3, target 1.2s stroke-dashoffset transition, color band dinamico)
  6. **Streak** (Tab 3, NUMERO grande + stato sottile, niente fiamma videogame)
  7. **Accordion "Aree"** (Tab 3, grid-template-rows: 0fr → 1fr)
  8. **Trend Mini-chart SVG** (Tab 3, sparkline 160px altezza, 8 punti)
  9. **Empty State canonico** (riusabile: icona outline + titolo 1 riga + sottotitolo + CTA opzionale; riusato in: "Nessun bando", "Nessuna simulazione", "Nessun piano", "Classifica in arrivo")
  10. **Toast** (3 tipi: success / error / warning, max 5s, posizione fissa alto-destra)
  11. **Modalità toggle Free/Pro badge** (avatar area, pill-style neutra, niente animazione)
  12. **Tutorial Coach Tooltip** (3 step sequenziali, posizionamento dinamico, SKIP in alto-destra, NON blocca interazione, persistenza `localStorage.ATLAS_TUTORIAL_DONE`)
- **Strumenti**: Vanilla JS modules (`public/js/components/*.js`), CSS dedicato `atlas-components.css`. Niente libreria UI.
- **Criteri di successo**:
  - Ogni componente ha una variante "default" e "active/selected". Niente "sembra carino ma poi cambia" in produzione.
  - Ogni componente risponde al keyboard (Tab/Enter/Space) con fuoco visibile (`outline: 2px solid var(--accent-ring); outline-offset: 2px`).
  - `core-components.html` viene AGGIORNATO in questa fase con i 12 componenti (totale 24 elementi).
- **Controllo anti-slop**: **Icon Coherence Audit**. Designer prende tutti gli SVG inline della codebase, li mette in una griglia affianco. Se due icone dello stesso concetto (es. upload) hanno peso visivo diverso (stroke-width, dimensione), si RIALLINEANO. Nessuna emoji Unicode sopravvive in UI.

### FASE 4 — Simulazione Core & Micro-stati (2 settimane)

- **Durata**: 10 giorni lavorativi (Settimane 8-9)
- **Obiettivo**: `simulation.html` viene smontato. L'esperienza chat respira.
- **Deliverable**:
  1. **Decomposizione `simulation.html`** in 4 moduli:
     - `public/js/sim-config.js` (selezione bando + toggle)
     - `public/js/sim-briefing.js` (overlay 1.2s)
     - `public/js/sim-chat.js` (engine chat con typewriter, pause, memoria)
     - `public/js/sim-summary.js` (voto + metriche finale)
     - `simulation.html` diventa < 600 righe (shell + 4 script tag con `defer`).
  2. **Typewriter con pause umane**: sul token `.` l'inserimento si ferma 120ms; sul `\n\n` si ferma 280ms; sulle virgole 60ms. Totale: la stessa lunghezza di testo varia ±20% in durata. È un essere umano.
  3. **Memoria di seduta**: array `chatHistory` passato interamente al LLM in ogni chiamata (no truncation aggressiva). Il prompt system viene aggiornato: "Prima hai chiesto X. Non ripeterlo."
  4. **Reazioni commissario iterate**: 6 reazioni possibili (Non mi convince / Buona ma / Approfondiamo / Coraggio / Esatto / Esponi meglio). Selezione probabilistica da LLM con temperature 0.5.
  5. **Feedback panel MOBILE REDESIGN**: drawer bottom-sheet su mobile (max-height 60vh), sempre visibile su desktop. Il problema di sovrapposizione chat/input è RISOLTO.
  6. **Empty state pre-prima-domanda** (in `sim-chat.js`): "Il commissario sta leggendo il tuo fascicolo..." con typewriter animation anticipata (mostra gli ultimi 3 caratteri mentre l'AI pensa).
  7. **Quota check**: `fetch('/api/quota')` PRIMA di `startSimulation()`. Se 0 e utente Free → paywall modal.
  8. **Telemetria attiva**: `fetch('/api/track', { event, page, meta })` su: page_view (tutte le pagine), simulazione_iniziata, simulazione_completata, bando_caricato, login, registro, paywall_viewed. 8 eventi.
- **Strumenti**: JS Modules (vanilla ES2022), Supabase JS v2 CDN già in uso, GSAP per animazioni sobrie, Web Audio API per suoni sottili.
- **Criteri di successo**:
  - `simulation.html` < 600 righe (vs 1998 attuali). -70% come previsto.
  - Su mobile 375px il feedback panel NON copre mai l'input box né l'ultimo messaggio della chat.
  - Typewriter pause misurata: deviazione standard tra 5 simulazioni consecutive ±15% (significativamente più "umana" della versione lineare).
- **Controllo anti-slop (meccanico)**:
  - Misurazione typewriter: tra 5 simulazioni di 20 min lanciate in condizioni identiche, la deviazione standard della durata totale deve essere ≥ 15%. Se è lineare (<5%), si è rotto qualcosa.
  - Tabella reazioni: su 20 risposte commissario, ognuna delle 6 deve comparire almeno 1 volta (verificabile con log).
  - Empty state: l'utente che aspetta la prima domanda ≥ 4s deve vedere un elemento cambiare (cursor o typewriter anticipato). NULLA di statico.
  - Memoria di seduta: test "prima hai detto X": 5 round in cui l'utente cambia idea, il commissario deve menzionare l'idea precedente ≥ 3 volte.
  - **Acceptance criteria completi** prima della firma Fase 4: tutti i 4 soprastanti passati. Altrimenti rework.
- **Controllo anti-slop (qualitativo)**: **Commissario Reading Test**. Il Founder legge 5 risposte del commissario come se fossero un dialogo teatrale. Se in 30 secondi non si "sente" il commissario come persona, il prompt system LLM va raffinato.

### FASE 5 — Motion, Haptic & Polish finale (1 settimana)

- **Durata**: 5 giorni lavorativi (Settimana 10)
- **Obiettivo**: Il livello sensoriale invisibile.
- **Deliverable**:
  1. **Haptic feedback** (`navigator.vibrate(10)`) su: invio messaggio, arrivo commissario, completamento simulazione. SOLO se device.mobile.
  2. **Audio feedback** (Web Audio API):
     - "tick" morbido (40ms, 220Hz declino esponenziale) all'arrivo di una nuova bolla commissario.
     - "confirm" (60ms, 660Hz doppio click) all'invio utente.
     - "ending" (400ms sweep 440→880Hz) al termine simulazione.
     - Toggle disattivabile in `localStorage.ATLAS_SOUND`.
  3. **Streak final design**: niente fiamma. Numero grande (64px) + label "giorni di fila" + piccolo record. Il colore del numero cambia (gray → orange → red → violet). Stop all'animazione videogame. Per la "legend" (15+), un bordo viola sottile + dot più piccoli. Stop al drop-shadow.
  4. **Pulse CTA rimosso**: l'animazione `ctaPulse` viene disattivata di default. Solo su hover (transform scale 1.02). Stop all'infinite animation. È il dettaglio più urgente anti-slop.
  5. **Prefers-reduced-motion enforcement**: tutte le animazioni decorative vengono sostituite da transizioni di stato (colore, opacity). `prefers-reduced-motion: reduce` è già gestito in `dashboard.css` ma va esteso a `simulation.css` e `landing`. Tutti i `bounce`, `elastic`, `infinite` rispettano il setting.
- **Strumenti**: GSAP, Web Audio API, `navigator.vibrate()`.
- **Criteri di successo**:
  - Motion totale: solo `cubic-bezier(0.25, 0, 0.15, 1)` o `cubic-bezier(0.4, 0, 0.2, 1)`. ZERO `elastic`, ZERO `bounce`, ZERO `linear`.
  - Haptic testato su 1 device reale Android. Audio testato su Chrome desktop.
  - Test con `prefers-reduced-motion: reduce` attivo in DevTools: tutte le animazioni decorative spariscono, le interazioni restano funzionali.
- **Controllo anti-slop**: **Reduced Motion Audit + Linear-Gradient Audit**. Due checklist obbligatorie:
  - In DevTools si attiva "Emulate CSS: prefers-reduced-motion: reduce". Se un solo elemento salta, lampeggia, o si muove ancora, è AI Slop. Lista nera mentale: shimmer skeleton, pulse CTA, breathing gauge, flame, gauge outer spin vuoto. Tutto vietato sotto reduced-motion.
  - `grep -r "linear-gradient" public/css/` deve restituire ZERO match. Nessun gradient sui CTA primari (è ammesso solo su background hero quasi-monocromatico, e comunque con soglia di contrasto verificata). Tutti i CTA usano `--accent` solido con hover `transform translateY(-2px)`. Stop ai gradient `linear-gradient(90deg, #2563EB, #0F4C81)`.

### FASE 6 — Handoff, QA & Lancio Vivo (1 settimana)

- **Durata**: 5 giorni lavorativi (Settimana 11)
- **Obiettivo**: Consegna + firma del Founder.
- **Deliverable**:
  1. **Handoff package**:
     - `core-components.html` (versione finale)
     - `atlas-tokens.css` (versione finale)
     - `DECISIONS.md` (chiuso, firmato)
     - `RUNBOOK.md` (deploy manuale, rollback, env vars richieste)
  2. **Brook test passato**:
     - Tutti i 4 Tab visualizzati correttamente su Chrome, Firefox, Safari desktop.
     - Mobile: 375px, 414px, 768px.
     - Nessun errore console su nessuna pagina in nessun browser.
  3. **Audit tecnico**:
     - Lighthouse > 90 su index, dashboard, simulation (Performance, Accessibility, Best Practices).
     - CSS totale progetto ≤ 60KB (vs ~100KB attuali).
     - Zero `!important` rimanenti.
     - Zero `console.log` di debug rimanenti.
  4. **Tag Git `v1.0.0-atlas`** con changelog firmato.
- **Strumenti**: Chrome DevTools, Lighthouse, BrowserStack (o Equivalente gratuito).
- **Criteri di successo**: Lighthouse > 90 su tutte le pagine. Zero errori console. Founder firma il deliverable.
- **Controllo anti-slop**: **Founder Why Test Live**. Il Founder apre Concorso AI davanti al Designer. Per ogni elemento visibile, chiede "perché?". Ogni risposta deve essere una frase, non "è bello". Se una risposta delude, si rivede LIVE prima della consegna.

---

## 4. DETTAGLIO DELLE SOTTO-FASI (3-5 per ogni fase principale)

### FASE 1 — Fondamenta, Costituzione & Design System

| # | Sotto-fase | Cosa si fa | Tempo | Ruolo | Output |
|---|---|---|---|---|---|
| 1.1 | Principi v2 | Riscrivere i 12 principi con tono operativo | 6h | Designer | `.AGENT/costituzione.md` |
| 1.2 | Anti-Slop Hall of Shame | Raccogliere 10 esempi visivi vietati + gallery statica | 8h | Designer + Dev | `.AGENT/anti-slop-shame.md` + `slop-examples.html` |
| 1.3 | Decision Log iniziale | Lista iniziale di decisioni chiuse per sempre (append-only) | 3h | Designer + Founder (call) | `.AGENT/DECISIONS.md` |
| 1.4 | Tokenizzazione | Estrarre palette, tipografia, spacing, radius, ombre, motion in `atlas-tokens.css` | 16h | Designer + Dev | `public/css/atlas-tokens.css` |
| 1.5 | Base reset & typography | Body, link, focus-visible, tipografia helper | 8h | Designer | `public/css/atlas-base.css` |
| 1.6 | Macro-componenti (8 macro × 3 varianti) | Bottone, Card, Input, Toggle, Pill, Toast, Tooltip, Avatar. Ognuno con snippet HTML pronto | 24h | Designer + Dev | `core-components.html` |
| 1.7 | Set icone SVG (24 icone base) | Stroke 1.5, monochrome, inline-ready | 12h | Designer | `public/icons/*.svg` |
| 1.8 | Audit sostituzione emoji → SVG | Nessuna emoji Unicode sopravvive in UI | 4h | Dev | Patch su `dashboard.html`, `simulation.html`, `index.html` |

### FASE 2 — Architettura & Layout dei 4 Tab

| # | Sotto-fase | Cosa si fa | Tempo | Ruolo | Output |
|---|---|---|---|---|---|
| 2.1 | Topbar & shell | Logo + 4 tab orizzontali + avatar/badgetier | 12h | Designer + Dev | `dashboard.html` shell |
| 2.2 | Tab router (CSS-only `.is-active`) | 4 `<section>` swappati via classe | 8h | Dev | `dashboard.html` mechanic |
| 2.3 | Paywall Tab 2 prototipo | Lucchetto + "Funzionalità Pro" + "Passa a Pro" | 4h | Designer | `dashboard.html` Tab 2 Free state |
| 2.4 | Empty state canonico + skeleton | Empty state riusabile, skeleton 1.5s | 8h | Designer | `public/css/layout.css` + partials JS |
| 2.5 | Mobile collapse (375px test) | Topbar collassa, tab labels abbreviati | 8h | Designer + Dev | Layout mobile responsive |

### FASE 3 — Componenti Chiave (12 componenti)

| # | Sotto-fase | Cosa si fa | Tempo | Ruolo | Output |
|---|---|---|---|---|---|
| 3.1 | Card Bando (Tab 1, 2 varianti) | Default + selected. Click espande config | 8h | Designer + Dev | `dashboard.html` Tab 1 final |
| 3.2 | Toggle group Difficoltà/Durata | 3 opzioni × 3 opzioni | 6h | Designer | CSS + JS |
| 3.3 | Calendar 7 giorni (Tab 2) | Grid 7 colonne, 4 stati | 12h | Designer + Dev | `dashboard.html` Tab 2 Pro |
| 3.4 | Chat AI inline (Tab 2) | Bubble commissario + utente + system messages | 16h | Designer + Dev | Module `sim-chat.mini.js` |
| 3.5 | Gauge SVG 140px (Tab 3) | Stroke-dashoffset animazione, color band | 6h | Dev | Module `gauge.js` |
| 3.6 | Streak (Tab 3, austero) | Numero + label + stato, NO fiamma videogame | 6h | Designer | CSS + SVG static |
| 3.7 | Accordion Aree (Tab 3) | grid-template-rows 0fr → 1fr | 8h | Designer + Dev | CSS + JS |
| 3.8 | Sparkline 160px (Tab 3) | SVG 8 punti, variance band | 6h | Dev | Module `sparkline.js` |
| 3.9 | Empty State canonico | Template riusabile (classe `.empty-state`) | 4h | Designer | CSS + 4 esempi applicati |
| 3.10 | Toast (3 tipi) | Fixed posizione alto-destra, max 5s | 4h | Dev | Module `toast.js` |
| 3.11 | Free/Pro badge | Pill-style neutra, niente animazione | 2h | Designer | CSS |
| 3.12 | Tutorial Coach Tooltip | 3 step, persistenza `localStorage.ATLAS_TUTORIAL_DONE` | 12h | Designer + Dev | Module `tutorial.js` |

### FASE 4 — Simulazione Core & Micro-stati

| # | Sotto-fase | Cosa si fa | Tempo | Ruolo | Output |
|---|---|---|---|---|---|
| 4.1 | Decomp `simulation.html` | Da 1998 righe → shell < 600 + 4 moduli | 16h | Dev | `simulation.html` + 4 JS modules |
| 4.2 | Typewriter con pause umane | Pause su `.`, `\n\n`, `,`. Variabilità ±20% | 8h | Dev | `sim-chat.js` |
| 4.3 | Memoria di seduta | `chatHistory` intero passato a LLM. Prompt system rafforzato | 6h | Designer + Dev | `sim-chat.js` + `api/chat.js` |
| 4.4 | Reazioni commissario iterate | 6 reazioni possibili, probability-based | 6h | Designer | Prompt system update |
| 4.5 | Feedback panel MOBILE redesign | Drawer bottom-sheet 60vh, NO sovrapposizione | 12h | Designer + Dev | `sim-chat.js` + CSS |
| 4.6 | Empty state pre-prima-domanda | "Il commissario sta leggendo il tuo fascicolo..." | 4h | Designer + Dev | `sim-chat.js` |
| 4.7 | Quota check (chiamata `/api/quota`) | Pre-`startSimulation()`, paywall se 0 Free | 6h | Dev | `sim-chat.js` + `simulation.html` |
| 4.8 | Telemetria 8 eventi | page_view, simulazione_iniziata, simulazione_completata, bando_caricato, login, registro, paywall_viewed, tutorial_completed | 8h | Dev | Telemetry helper + patch su HTML |

### FASE 5 — Motion, Haptic & Polish finale

| # | Sotto-fase | Cosa si fa | Tempo | Ruolo | Output |
|---|---|---|---|---|---|
| 5.1 | Haptic feedback (`navigator.vibrate`) | 3 trigger, mobile-only | 4h | Dev | Patches JS |
| 5.2 | Audio feedback (Web Audio API) | 3 suoni: tick / confirm / ending. Toggle in localStorage | 8h | Dev | `feedback-audio.js` |
| 5.3 | Streak final design (NO fiamma) | Solo numero + stato, niente animazioni infinite | 6h | Designer | CSS update |
| 5.4 | Rimozione pulse CTA | Default NO `ctaPulse`. Hover solo transform/opacity | 3h | Designer + Dev | `core-components.html` + `index.html` |
| 5.5 | Reduced-motion enforcement totale | Tutte le decorazioni rispettano `prefers-reduced-motion` | 6h | Dev | `atlas-base.css` + `simulation.css` + `dashboard.css` |

### FASE 6 — Handoff, QA & Lancio Vivo

| # | Sotto-fase | Cosa si fa | Tempo | Ruolo | Output |
|---|---|---|---|---|---|
| 6.1 | Handoff package (3 file chiave + RUNBOOK) | `core-components.html`, `atlas-tokens.css`, `DECISIONS.md`, `RUNBOOK.md` | 8h | Designer + Dev | 4 file firmati |
| 6.2 | Cross-browser QA (Chrome/Firefox/Safari desktop + mobile 375/414/768) | Test zero-errori console | 12h | Dev | QA log |
| 6.3 | Lighthouse audit (≥90 su tutte le pagine) | Performance, Accessibility, Best Practices | 4h | Dev | Lighthouse report |
| 6.4 | Cleanup: !important, console.log, CSS ridondante | -40% CSS, zero dead code | 6h | Dev | Final CSS size |
| 6.5 | Tag Git `v1.0.0-atlas` con changelog firmato | Release | 2h | Dev + Founder | Git tag + Changelog |

**TOTALE ore stimate**: ~250h = ~32 giorni-uomo per 1 Designer + 1 Dev full-time = ~6.5 settimane lavorative "pure".

---

## 5. PIANO DI QUALITÀ E REVISIONE

### 5.1 I cicli di review (3 formali + 1 finale live)

1. **Daily Standup WHY** (15 min, ogni giorno): designer + dev guardano il diff del giorno. Ogni blocco CSS/JS introdotto deve rispondere alla Why Test. Se non risponde, viene rimosso quel giorno stesso.
2. **Weekly Visivex (60 min, ogni venerdì)**: review visiva di tutto ciò che è stato toccato nella settimana. Squint Test su dashboard. Founder invitato come osservatore silenzioso (non vota, vede).
3. **Phase Gate Review (3h, a fine fase 1/4/6)**: presentazione di tutta la fase al Founder. Decisioni di scope o scelte anti-slop ratificate O respinte. Le respinte richiedono 1-3 giorni di rework.
4. **Final Why Test Live** (fine Fase 6): il Founder apre Concorso AI davanti al Designer. Per OGNI elemento visibile chiede "perché?". Ogni risposta è una frase, non "è bello". Se delude, rifacimento LIVE prima della consegna.

### 5.2 I "compensi zero" — nessun compromesso, ma alcune eccezioni documentate

- **Sì ai compromessi**: quando i tempi di un'AI API (Gemini 2.5 Flash) sono > 4s in media (situazione reale), si allunga l'animazione "Il commissario sta leggendo il tuo fascicolo" da 2s a 4s. NIENT'ALTRO.
- **NO ai compromessi**: glassmorphism, gradienti brillanti, ombre a 32px, animazioni videogame, emoji in UI. Mai. Se lo stakeholder chiede, il Designer dice: "No. È AI Slop. Ecco perché. Ecco l'alternativa."
- **Documentazione**: ogni compromesso accettato va annotato in `DECISIONS.md` con: contesto, alternativa rifiutata, motivazione, data.

### 5.3 The Why Test canonico (operativo)

Per OGNI elemento visivo o interattivo introdotto, scrivere in 1 riga dentro il commit:

```
WHY: <1 frase che spiega perché questo elemento ESISTE e cosa MIGLIORA per l'utente>
```

Se `WHY` contiene "perché bello" / "perché fighetto" / "perché moderno" → **blocco del commit**. Riformulazione obbligatoria.

### 5.4 Procedura di escalation anti-slop

Se in una review si scopre AI Slop già integrato:
1. Identifica il pezzo responsabile.
2. Apri un ticket "Atlas Slop #N" con before/after.
3. Assegna SLA: ≤ 1 giorno lavorativo.
4. Never merge se non ha WHY passato.

### 5.5 Manifest Checklist pre-consegna (5 principi non negoziabili)

Prima del sign-off finale, ogni Tab deve superare questo check:
- [ ] **Calma** — nessun elemento urla. Solo CTA + contenuto principale risaltano allo Squint Test.
- [ ] **Una domanda per schermata** — la vista risponde a UNA sola domanda dell'utente. Due CTA primarie nella stessa vista = FAIL.
- [ ] **Densità variabile** — la pagina alterna zone di silenzio, di azione e di feedback. Mai tutto dello stesso peso visivo.
- [ ] **Spazio bianco motivato** — ogni gap ha una ragione. Rimuoverlo senza decompilare la gerarchia = spazio sbagliato.
- [ ] **Riconoscibile senza logo** — coprire il brand e testare `omaggi + Geist Mono + brand color #0F4C81 su ACTION/STATE`. Se due elementi visivi sembrano di due prodotti diversi, FAIL.

Se ≥ 1 di questi fallisce, la fase NON è completata. Si torna in rework.

### 5.6 Piano di rollback per Fase 4 (Simulazione Core)

Se la Fase 4 slitta > 20% del tempo previsto (>2 settimane invece di 2), si applica questo rollback **senza chiedere permesso, è già previsto**:
1. **Typewriter semplificato** (senza memoria di seduta): 1 settimana di buffer sufficiente.
2. **Memoria di seduta** → v1.1 (rinviata). Salvo solo `chatHistory` Suabase post-sessione, ma non in-context al LLM.
3. **Reazioni iterate** → 3 baseline + 3 opzionali in v1.1 (taggate via probability seed).
4. **Feedback panel mobile** → v1.0 al massimo (drawer chiuso di default, CTA "Apri feedback").
5. **Quota check + telemetria** → restano in v1.0 (sono i deliverable più sicuri).

Questo garantisce che la Fase 6 (Handoff) può partire comunque entro Settimana 11.

---

## 6. TIMELINE DI MASSIMA (GANTT SEMPLIFICATO)

```
Settimana   │ FASE 1 (merged)          FASE 2     FASE 3     FASE 4     FASE 5    FASE 6
────────────┼─────────────────────────────────────────────────────────────────────────
S1 (24-28/7)│ ████████                                                       
S2 (1-5/8)  │ Handoff principe→ ████████ (Atlas Tokens)                      
S3 (8-12/8) │                  ████████                                      
S4 (15-19/8)│                            ████████                            
S5 (22-26/8)│                            ████████                            
S6 (29/8-2/9)                            ████████                            
S7 (5-9/9)  │                            ████████                            
S8 (12-16/9)│                                       ████████ (Sim Core)        
S9 (19-23/9)│                                       ████████                  
S10 (26-30/9)│                                                   ████████ (Motion)
S11 (3-7/10)│                                                           ██████ (Handoff)
────────────┴─────────────────────────────────────────────────────────────────────────
Milestone 1 (fine S1): Costituzione firmata.
Milestone 2 (fine S3): `atlas-tokens.css` + `core-components.html` v1 consegnati.
Milestone 3 (fine S7): 4 Tab navigabili con 12 componenti chiave integrate.
Milestone 4 (fine S9): Simulazione smontata in moduli. Typewriter umano. Quota check.
Milestone 5 (fine S10): Haptic + Audio + Reduced-motion enforcement.
Milestone 6 (fine S11): Tag v1.0.0-atlas firmato dal Founder.
```

**Data di consegna stimata**: **7 ottobre 2026** (target ASPIRATIONALE, realistico per 1 Designer + 1 Dev FT con Phase Gate Review del Founder).

> **Nota realistica**: questa timeline è ASPIRATIONALE. Ogni Phase Gate può aggiungere 1-3 giorni di rework. Se la Fase 4 sfora > 20% del previsto, scatta il **rollback §5.6** (typewriter semplificato + memoria di seduta posticipata a v1.1). L'obiettivo non è rispettare le date, è consegnare un prodotto che valga le 11 settimane. Atlas non ha fretta — ma neanche spreca.

---

## 7. RISORSE E ASSET RICHIESTI

### 7.1 Cosa serve al team (già disponibile)

| Asset | Disponibilità | File/luogo |
|---|---|---|
| Geist font | ✅ Disponibile | CDN/riferimento in HTML |
| Geist Mono font | ✅ Disponibile | CDN/riferimento in HTML |
| Lucide Icons (reference) | ✅ Disponibile | https://lucide.dev (open source) |
| Supabase project | ✅ Configurato | tab `piano_settimanale`, `streak`, `simulazioni`, `bandi`, `events` |
| Blueprint `DASHBOARD-DESIGN.md` | ✅ Disponibile | root |
| Audit `UX-AUDIT-*.md` | ✅ Disponibile | root |
| Decision log preesistente | 🟡 Parziale | da creare `DECISIONS.md` |

### 7.2 Cosa deve fornire il Founder (URGENTE)

1. **Testi esatti dei piani tariffari** (`Free`, `Pro `, `Coaching`) per completare il paywall Tab 2 con copy reale, non placeholder.
2. **Indirizzo email mittente per welcome + paywall viewed** (serve per le notifiche transazionali future).
3. **Decisione finale su**: "è accettabile che il Tab 2 Mostri una vista locked SENZA possibilità di acquisto immediato, o serve un checkout flow completo?" → risposta entro Settimana 2.
4. **Tempo Founder per Phase Gate Review**: minimo 3 sessioni da 3h (Settimana 1, 7, 11). Senza il suo tempo, le review slittano.
5. **Lista funzionalità "must-have" vs "nice-to-have"**: 12 componenti core hanno tutti lo stesso peso? O 4 sono MVP e 8 sono stretch?

### 7.3 Cosa è CRITICO vs opzionale

**CRITICO** (senza, il prodotto non può uscire):
- Atlas Tokens (`atlas-tokens.css`) + 12 componenti.
- Shell dashboard 4 Tab + paywall Tab 2.
- Simulazione modulare + typewriter umano + quota check.
- **Compliance GDPR**: cookie banner + privacy policy link + data retention policy (vedi §7.4).
- **Haptic fallback iOS**: silente su iOS Safari (vedi §7.4).
- **Copy review IT finale**: con madrelingua italiana (vedi §7.4).
- **User Test esterno (5 utenti) in Settimana 10** (vedi §9.2 schedulazione).

**OPZIONALE** (rinviabili a v1.1):
- Haptic + audio feedback (Phase 5).
- Tutorial Coach Tooltip (Phase 3, ma può essere posticipato).
- Reazioni commissario iterate a 6 (si può partire da 3).

**VIETATO** (anche se richiesto):
- Tema dark (nessuna dark mode in v1: troppo impatto sui token). Eventualmente v2.
- Localizzazione multilingua (italiano only — il prodotto è specifico per concorsi pubblici italiani).
- App mobile nativa (web responsive è sufficiente).

### 7.4 Gate specifici di Compliance, QA & Scope

**A. Audit GDPR (Settimana 11)**:
- Data Retention Policy scritta e pubblicata.
- Cookie banner funzionante (`localStorage` con consenso esplicito).
- Privacy policy link in footer su TUTTE le pagine.
- Test: utente può richiedere cancellazione account via `/api/delete-account` (entro 24h, GDPR-compliant).

**B. Fallback iOS Haptic (Settimana 10)**:
- `navigator.vibrate()` non funziona su iOS Safari 17.x → fallback silente (nessun errore console).
- Test obbligatorio: iPhone 13+ con Safari, haptics attese = 0 (corretto) ma nessun `console.error`.
- Niente "vibrate non supportato" mostrato all'utente. Silente e basta.

**C. Copy Review IT (Settimana 11)**:
- Revisione completa di tutti i testi UI in italiano con madrelingua.
- Focus su: tono "collega preparato" mai "insegnante severo".
- Lista termini bandierina: "orale", "commissione", "bando", "piano", "feedback" — usati consistentemente.
- Glossario termini legali specifici (concorsuali) verificato.

**D. Scope decision: `idee.md` Piano Studio AI (entro Settimana 2)**:
- `idee.md` descrive un coach AI con notifiche push + sync calendario (esclusivo Pro, anchor €29/mese).
- **Decisione vincolante**: la funzionalità entra in v1.0 SOLO se Founder consegna in Settimana 2 la lista MVP (chat onboarding + calendario UI SENZA notifiche push). Notifiche push = v1.1+ per evitare complessità backend (Service Worker, Web Push). Senza decisione entro Settimana 2 → default v1.1.
- La Fase 2 include comunque la calendar UI in Tab 2 (overlap controllato).

**E. User Test esterno (Settimana 10)**:
- 5 utenti reali (target: candidati concorsi pubblici, NO insider team).
- Task 1: "Apri il sito, fai una simulazione di 10 minuti, dimmi cosa faresti domani."
- Task 2: "Apri Tab Progressi. Cosa capisci del tuo andamento?"
- Osservazione: contatore "non so cosa fare", sentiment "calma/ansia", frasi spontanee.
- Acceptance: 0 "non so cosa fare", 5/5 "calmo", ≥ 3/5 usano "invisibile/silenzioso/non lo noto".

---

## 8. PIANO DI HANDOFF PER GLI SVILUPPATORI

### 8.1 Cosa viene consegnato (4 file + 1 runtime spec)

| File | Scopo | Manutenzione |
|---|---|---|
| `public/css/atlas-tokens.css` | Single source of truth per tutti i token. MAI modificare direttamente; le nuova feature chiedono PRIMA un nuovo token. | Mai modificato direttamente. PR per nuovi token. |
| `public/css/atlas-base.css` | Reset, body, focus, tipografia helper | Aggiornamenti con PR motivati |
| `core-components.html` | Catalogo vivente dei 12 componenti. Ogni Developer/AP Designer può vederli renderizzati + copiare lo snippet. | Aggiornato ad ogni nuovo componente |
| `.AGENT/DECISIONS.md` | Log chiuso di decisioni irrevocabili (palette, font, radius, motion) | Append-only |
| `RUNBOOK.md` (in `.AGENT/`) | Deploy manuale, rollback, env vars, troubleshooting | Aggiornato a ogni release |

### 8.2 Come sono organizzati i file

```
public/
├── css/
│   ├── atlas-tokens.css       ← TUTTI i token (SINGLE SOURCE)
│   ├── atlas-base.css         ← reset, body, typography helper
│   ├── atlas-components.css   ← 12 componenti CSS
│   ├── layout.css             ← dashboard shell, grid 12 col
│   └── (legacy: dashboard.css, simulation.css → consolidati progressivamente)
├── js/
│   ├── sim-config.js
│   ├── sim-briefing.js
│   ├── sim-chat.js
│   ├── sim-summary.js
│   └── (helpers: toast.js, telemetry.js, gauge.js, sparkline.js)
├── icons/
│   └── 24 SVG inline-ready
core-components.html           ← catalogo vivente
```

### 8.3 Checklist di controllo finale prima dello sviluppo

- [ ] `atlas-tokens.css` esiste e contiene tutti i token.
- [ ] `core-components.html` mostra tutti i 12 componenti in 3 varianti ciascuno.
- [ ] `DECISIONS.md` firmato.
- [ ] `RUNBOOK.md` scritto con: env vars, deploy, rollback.
- [ ] Set icone completo (24 SVG) in `public/icons/`.
- [ ] Browser test passato su Chrome/Firefox/Safari desktop + mobile.
- [ ] Lighthouse ≥ 90 su tutte le pagine.
- [ ] Zero `!important` rimanenti.
- [ ] Zero `console.log` di debug.
- [ ] Tag Git `v1.0.0-atlas` pronto.

---

## 9. METRICHE DI SUCCESSO FINALE

### 9.1 Quantitative (misurabili con strumenti)

| Metrica | Baseline attuale | Target dopo piano | Come si misura |
|---|---|---|---|
| CSS totale | ~100 KB | ≤ 60 KB | `find . -name "*.css" -exec cat {} \; | wc -c` |
| Errori console per pagina | 0 | 0 | Manual QA |
| Lighthouse Performance (dashboard) | ~75 | ≥ 90 | Chrome DevTools |
| Lighthouse Accessibility (simulation) | ~80 | ≥ 90 | Chrome DevTools |
| `!important` count | ~12 | 0 | grep |
| File HTML > 600 righe | 5 (`simulation.html` 1998) | 0 | wc -l |
| Emoji Unicode in UI | ~21 (📄, 🟢🟡🔴, 🔥, 📖) | 0 | grep Unicode block + manual audit |
| Bounce rate hero (landing) | [DA MISURARE] | -30% | Vercel Analytics |
| Pagina media LCP (dashboard) | [DA MISURARE] | < 2.5s | Lighthouse |
| CLS score (dashboard) | [DA MISURARE] | < 0.1 | Lighthouse |

### 9.2 Qualitative (test umani + sondaggi)

| Metrica | Metodo | Target |
|---|---|---|
| User test "I don't know what to do" | 5 utenti nuovi, 5 minuti di autonomia. Conta quante volte dicono "non so cosa fare". | 0 volte |
| User test "It feels calm" | Stessi utenti, dopo 10 min. Risposta binaria sì/no. | 5/5 "sì" |
| Feedback spontaneo "invisibile / silenzioso / non lo noto" | Aggregato open-ended feedback post-test. | ≥ 3 utenti su 5 usano queste parole |
| Why Test pass rate | % di componenti con WHY scritto nel commit | 100% |
| Founder Why Test Live | Live review finale: % elementi che passano la Why Test | ≥ 95% |

### 9.3 Indicatori di successo sul business (da misurare dopo lancio, Settimana 12+)

| KPI | Metrica | Target v1.0 |
|---|---|---|
| Signup completo dopo landing | % utenti landing → auth → onboard | +25% vs baseline |
| Simulazione completata (vs iniziata) | % utenti che completano la prima simulazione | ≥ 60% |
| Upgrade Free → Pro (post-paywall Tab 2 view) | % utenti che vedono paywall + acquistano | ≥ 5% |
| Time-to-first-simulation dal signup | Tempo medio | ≤ 10 min |
| Retention Giorno 7 | % utenti che tornano in 7 giorni | ≥ 40% |

---

## 10. PIANO DI CONTINUITÀ (DOPO IL PROGETTO)

### 10.1 Come mantenere la qualità nel tempo

1. **Atlas Tokens Review Mensile** (primo venerdì del mese, 2h): ogni nuova feature che richiede token NUOVI deve passare per Atlas Tokens Review. I token diventano append-only. Mai modificare un token esistente — solo aggiungere.
2. **Why Test obbligatorio in PR template**: ogni PR che tocca CSS/HTML/JS deve rispondere alla WHY in 1 riga. Senza WHY, il PR non viene mergiato.
3. **Atlas Slop Audit Trimestrale**: ogni 3 mesi, review visiva dell'intero prodotto. Lista di 10 cose che potrebbero essere diventate AI Slop nel frattempo. Fix entro 30 giorni.

### 10.2 Come gestire nuove funzionalità senza perdere l'identità

- **Regola del "Where It Fits"**: ogni nuova feature deve trovare casa in uno dei 4 Tab esistenti o essere proposta come Tab 5. Mai aggiungere una "feature orfana" che vive in una pagina separata.
- **Pattern Lock**: prima di implementare una nuova UI, il Designer confronta la bozza con i 12 componenti in `core-components.html`. Se è necessario > 30% di codice nuovo, è il segnale che la feature non appartiene ad Atlas.
- **No nuovi colori, no nuovi font, no nuove ombre, no nuovi radius senza Atlas Tokens Review**.

### 10.3 Come formare il team per non cadere nell'AI Slop

1. **Onboarding Atlas**: 30 min di lettura di `.AGENT/manifesto.md`, `.AGENT/metodo.md`, `.AGENT/anti-slop.md`, questo `piano.md`. Test finale: scrivere 3 "Why" per 3 elementi arbitrari dell'app. Se non convincenti, non si è onboarded.
2. **Atlas Companion**: persona AI interna che fa da "cane da guardia" anti-slop. Interviene quando si propone un componente nuovo con emoji, gradienti, o radius > 12px. Vedi Skills Atlas Companion (`.AGENT/atlas-companion.md`).
3. **Rotta Atlas**: 1 review settimanale di 60 min (Visivex). Tutti i dev/designer presentano il loro lavoro. La regola: "se non passa lo Squint Test, si rifà". Nessuna eccezione, nessun "ma è venerdì sera".

### 10.4 Roadmap post-v1.0 (oltre questo piano)

| Versione | Cosa | Quando |
|---|---|---|
| v1.0.0-atlas | Questo piano completato | Nov 2026 |
| v1.1-atlas | Telemetria-driven: dashboard "Fai la cosa giusta oggi" basata su evento `paywall_viewed + tentativo_abbandono` | Q1 2027 |
| v1.2-atlas | Tema dark (se richiesto dal 20%+ utenti). MA: solo dopo Atlas Tokens Review speciale. | Q2 2027 |
| v2.0-atlas | Piano di Studio AI (notifiche push, sync calendario) da `idee.md`. Architetturalmente sarà dentro Tab 2, NON come Tab 5. | Q3 2027 |

---

## AUTO-ANALISI FINALE — IL TAGLIANDO DEL DESIGNER

> Il Lead Product Designer di Atlas, prima di consegnare, fa questo tagliando a sé stesso. Non è marketing. È verità.

### (a) Questo piano è specifico per Project Atlas o potrebbe essere usato per qualsiasi progetto SaaS?

**NO. È chirurgicamente specifico.** Lo dimostrano:
- Il riferimento a `simulation.html` 1998 righe (monolite specifico di questo progetto).
- Il "commissario AI" come metafora centrale (non un customer service bot).
- Le `12 componenti` sono i 12 di QUESTO prodotto (gauge/streak/calendar/bando card) — non "card generiche".
- L'anti-slop specifico parla di "fiamma videogame dello streak" e "emoji 📄 sui bandi" — cose che esistono solo qui.
- La Phase 4 ("Simulazione Core") non esiste in nessun altro SaaS B2C.

Un consulente che desse a un altro cliente questo piano troverebbe irrealizzabile il 70% dei deliverable. È Atlas-specifico.

### (b) Qual è la parte del piano di cui sono più orgoglioso?

**La Fase 4 (Simulazione Core) e il suo deliverable "Typewriter con pause umane".**

Perché:
- È anti-slop ATTIVO, non passivo. Non dice "non fare AI Slop" — dice "inventa le pause nei punti e virgole perché il commissario è una persona".
- Affronta il problema più profondo del prodotto: il commissario è il NOI del brand, e se non respira, tutto crolla.
- È misurabile (deviazione standard della durata di 5 simulazioni).
- È invisibile al 95% degli utenti che "non noteranno mai la differenza", eppure la SENTIRANNO. Esattamente ciò che promette il manifesto: "Ho studiato due ore senza accorgermi dell'interfaccia."

### (c) Se dovessi cambiare una cosa del piano, cosa cambierei?

**Ridurrei la Fase 3 da 3 settimane a 2 settimane, e aggiungerei 1 settimana di buffer alla Fase 4.**

Perché:
- I 12 componenti sono tanti ma molti sono leggere varianti (Toast è < 4h, Badge < 2h). La fase può essere compressa.
- La Fase 4 ha la complessità nascosta più alta: memoria di seduta (LLM context che cresce), gestione edge-case di timeout di rete, integrazione del rewrite del `chatHistory` con il ritardo del LLM. Questo è il vero rischio del progetto.
- Un buffer esplicito qui è più onesto di una promessa di tempistiche aggressive che poi slitta.

(In altre parole: il piano è un po' troppo ottimista sulla Fase 3 e un po' troppo ottimista sulla Fase 4. L'asimmetria andrebbe corretta.)

### (d) Questo piano, se seguito, produrrà un prodotto che tra 5 anni sarà ancora elegante?

**Sì.** Ecco perché, motivazione dopo motivazione:

1. **Nessuna moda sposata**: Atlas rifiuta esplicitamente glassmorphism, neomorfismo, gradienti cyber-blue, animazioni rimbalzanti. Sono mode 2024-2026. Atlas le bypassa deliberatamente — quindi non le subirà quando passeranno.
2. **Type-pair fuori dalle mode**: Geist + Geist Mono sono font moderni di sistema (Vercel, GitHub, Linear) ma scelti per leggibilità, non per estetica "di tendenza". Restano rilevanti fuori da qualsiasi hype cycle.
3. **Palette funzionale, non decorativa**: 1 brand + 1 accent + 3 stati. Nessun colore "di stagione". Il brand non segue tendenze perché è già la soluzione del problema (calma istituzionale), non un vezzo estetico.
4. **Architettura che regge il carico**: i 4 Tab rispondono a 4 domande dell'utente (cosa faccio / quando / come sto / dove sono rispetto agli altri). Nuove feature del 2030 troveranno casa in questa griglia senza creare "feature orfane".
5. **Costituzione come memoria istituzionale**: `DECISIONS.md` append-only + `core-components.html` catalogo vivente = le regole non sono tramandate oralmente, sono scritte. Tra 5 anni un nuovo designer troverà tutto nel repo Git.
6. **Il commissario è atemporale per definizione**: un essere umano che parla con pause di riflessione in italiano istituzionale è timeless. Non dipende da framework, non dipende da mode. È un archetipo.
7. **Manifesto come religione interna**: "Tranquillo. Facciamolo bene." — questo tono NON cambia con la tecnologia. Sarà rilevante nel 2031 come nel 2026.

Tra 5 anni, un designer severo guarderà Concorso AI e dirà: "Non so cosa sia, ma respira bene. È fatto da qualcuno che sapeva cosa stava facendo." Questo è il successo.

---

## FIRMA

**Lead Product Designer — Project Atlas**
*24 luglio 2026*

> *"Se non mi fa venire i brividi, non è abbastanza."*
> *"L'AI Slop è la morte del design. Io sono la vita."*
