# UX AUDIT REPORT — ConcorsoAI Simulation

## 1. ARCHITETTURA CORRENTE

| Componente | Percorso | Ruolo |
|---|---|---|
| **Simulazione (Tutto-in-uno)** | `public/simulation.html` (1998 righe) | Config → Briefing → Chat → Summary + logica JS |
| **Stili** | `public/css/simulation.css` (2353 righe) | CSS monolitico con Tailwind CDN + animazioni GSAP |
| **Backend AI** | `api/chat.js` (550 righe) | Proxy serverless Vercel → OpenRouter/BluesMinds (SSE streaming) |
| **DB Schema** | `scripts/create_simulazioni_table.sql` | Tabelle `simulazioni`, `bandi`, `chunks`, `events` su Supabase |
| **Dashboard** | `public/dashboard.html` | Punto di ingresso, CTA "Inizia Simulazione", riepilogo ultime |
| **Auth** | `public/auth-patch.js` | Gestione token |

Non ci sono cartelle `/simulation` né componenti separati. È una **SPA monolitica** in un unico HTML: tre `<main>` distinti (`#configPhase`, `#simulationPhase`, `#summaryPhase`) commutati via classi `hidden`/`phase-enter`.

---

## 2. FLUSSO UTENTE (USER JOURNEY)

```
Dashboard ──click "Inizia Simulazione"──> CONFIG PHASE
   ↑                                        │
   │    ┌─── 1. Seleziona bando/i           │
   │    ├─── 2. Scegli difficoltà (predef. Realistico)
   │    └─── 3. Scegli durata (predef. 20 min)
   │                                        ▼
   │                              BRIEFING OVERLAY (1.2s animazione)
   │                                        │
   │    ┌────────────────────────────────────┘
   │    ▼
   │  SIMULATION PHASE (chat)
   │    ├─── Commissario fa domanda (streaming typewriter)
   │    ├─── Utente risponde (testo o voce)
   │    ├─── Feedback live (3 barre: Chiarezza/Struttura/Contenuto)
   │    ├─── Correzione candidato ("Non sono d'accordo")
   │    └─── Timer countdown (10/20/30 min)
   │                                        │
   │    └─── Termina / Timer scaduto ───────▼
   │                              SUMMARY PHASE (voto + metriche)
   │                                        │
   │                ┌─── "Torna alla Dashboard" ──> DASHBOARD
   │                └─── "Riprova" ──> CONFIG PHASE
```

---

## 3. ANALISI UI/UX — CRITICITÀ

### 3.1 Stato Iniziale (Configuration)

- **✅ Punti forti:** Default intelligenti su difficoltà (Realistico) e durata (20 min). CTA "Inizia Simulazione" disabilitata con messaggio esplicito finché non si seleziona un bando. Animazioni GSAP fluide. Badge "Consigliato" su Realistico.
- **⚠️ Criticità:**
  - **Decision fatigue sulla selezione bandi:** la lista bandi scrolla in un'area di 248px — se l'utente ha molti bandi, deve capire che può selezionarne più di uno (il `role="checkbox"` non è intuitivo come un toggle esplicito).
  - **Nessun "tooltip" o spiegazione** sul significato dei 3 step: l'utente nuovo non sa cosa implica ogni difficoltà se non legge il testo descrittivo.
  - **"Preparazione della commissione" (briefing):** animazione di 1.2s + timeout 3s. Il pulsante "Salta" esiste ma è poco visibile (stile `.btn-secondary`, nessun contrasto). Utenti esperti vengono rallentati.

### 3.2 Stato di Avanzamento (During Simulation)

- **✅ Punti forti:** Progress bar sottile animata (`#sessionProgressFill`), pill "Domanda X/Y", timer con cambio colore a 2 min e pulse a 1 min. Counter animato con `progress-pop`.
- **⚠️ Criticità:**
  - **Effetto 0%:** La progress bar parte da 0% e arriva a 100% solo dopo l'ultima domanda. Non c'è una "tappa fissa" che dia senso di completamento parziale reale (es. "domanda 3 di 8 = 37%"). Funziona, ma è impersonale.
  - **Timer nascosto su mobile:** La pill del timer è compressa nella `info-bar` — su schermi piccoli il timer potrebbe essere percepito come secondario.
  - **Mancanza di "flow anticipato":** L'utente non sa quante domande totali sono previste fino a dopo l'avvio (es. 20 min = 8 domande). Questo valore non è mai comunicato nella Config Phase.

### 3.3 Feedback & Micro-interazioni

- **✅ Punti forti:**
  - Typewriter caret (`typewriter-caret`) durante streaming — effetto "commissario vivo".
  - Thinking animation elaborata (orb + sweep + wave bars).
  - Checkmark animato sui messaggi utente inviati.
  - Micro-confetti (`celebrateSend`) all'invio.
  - Barre feedback con animazione GSAP `expo.out`.
  - Stati Hover e Active su tutti i bottoni.
- **⚠️ Criticità:**
  - **Stato Loading dell'invio:** Il bottone `#sendButton` ha classe `.sending` (pulse animation) ma è **assente lo stato di disabled durante l'attesa AI** — in teoria il flag `isThinking` disabilita textarea e bottone, ma non c'è nessun feedback visivo sul bottone stesso (es. spinner sostitutivo della freccia ↑).
  - **Stato Disabled del mic:** Il pulsante vocale (`#voiceInputBtn`) non ha uno stato `disabled` distinto dallo stato `recording` — se il browser non supporta SpeechRecognition, rimane cliccabile ma non fa nulla.
  - **Assenza di "attesa feedback":** Dopo l'invio, l'utente vede solo la thinking bubble. Non c'è un tempo di attesa stimato ("Il commissario sta analizzando... di solito 3-5 secondi").
  - **Feedback panel competition:** Su mobile, il drawer feedback si sovrappone all'area chat e all'input. L'utente non può vedere la domanda mentre consulta il feedback.

### 3.4 Riduzione Carico Cognitivo

- **✅ Punti forti:** Design pulito con sfondo noise sottile. Cards con blur. Tre fasi ben distinte (config/sim/summary). Messaggi separati visivamente (avatar, gradienti, bordi).
- **⚠️ Criticità:**
  - **Unico file HTML (1998 righe):** Manutenibilità compromessa. Ogni modifica rischia regressioni.
  - **CSS monolitico (2353 righe):** Tante regole ridondanti (es. 3 blocchi separati per `.bando-card` v1/v2/v3). Sovrapposizioni e `!important` sparsi.
  - **Nessun empty state nella chat:** Prima della prima domanda, la `#chatArea` è totalmente vuota. L'utente potrebbe pensare che la pagina non si sia caricata.
  - **Messaggio di "correzione" nascosto:** Il flusso "Non sono d'accordo" apre un pannello con textarea — ma l'utente deve cliccare un piccolo bottone in fondo al feedback panel. Scopribilità bassa.
  - **Riepilogo statico:** La `#summaryPhase` mostra un bel cerchio con voto, ma non c'è una sezione "rivedi le risposte" o un confronto storico con simulazioni precedenti.
  - **Nessun salvagente:** Se l'utente chiude la pagina durante la simulazione, il flag `cai_sim_in_progress` permette di riprendere, ma non è chiaro come (il banner "Riprendi" nella dashboard è l'unico aggancio).

---

## 4. STRUTTURA DEL CODICE (Scheletro HTML / JS)

```html
<!-- simulation.html — tre <main> commutati via classi -->
<main id="configPhase" class="config-shell hidden">
  <section class="card config-card">
    <div class="bando-section">
    <div class="difficulty-section">
    <div class="duration-section">
  </section>
  <div class="config-sticky-bar">
    <button id="startButton" disabled>Inizia Simulazione</button>
  </div>
</main>

<main id="simulationPhase" class="sim-phase hidden">
  <nav class="sim-navbar">
  <section class="info-bar">
  <div class="sim-content">
    <section class="sim-layout">
      <div id="chatArea">
        <section class="commissioner-card">...</section>
    </aside>
    <aside id="feedbackPanel">
      <button id="disagreeBtn">Non sono d'accordo</button>
  </div>
  <section class="input-shell">
</main>

<main id="summaryPhase" class="summary-shell hidden">
  <!-- SVG circle punteggio + metriche + bottoni -->
</main>
```

```javascript
// Logica principale (tutta inline in simulation.html)
function init() → loadBandi() → animateInConfig()
function startSimulation() → playBriefingAnimation() → startSimulationUI()
function startSimulationUI() → startTimer() → avviaCommissario()
function avviaCommissario() → chiamaCommissario() → aggiungiMessaggioCommissario()
function inviaMessaggio(testo) → chiamaCommissario() → aggiornafeedbackLive()
function endSimulation() → saveSimulationResult() → mostra summary
```
