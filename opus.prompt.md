# Prompt per Opus 4.5 (deepseek-v4-flash-thinking)

## Task 1 — Bottone "Inizia Simulazione" invisibile

**File**: `public/simulation.html` e `public/css/simulation.css`

**Bug**: il bottone `#startButton` (classe `start-btn btn-primary w-full` alla riga 150) non è visibile nella configurazione della simulazione quando le carte bando sono presenti. Sembra un problema di clipping o layout.

**Diagnostica**:
- `.config-card` ha `overflow: clip` (riga 1512 di simulation.css)
- Il bottone sta dentro l'ultimo `.config-anim` (riga 149-152 di simulation.html)
- Il bottone è `disabled` di default ma `opacity: .6` (non 0)
- Il bottone eredita anche `btn-primary` che ha `position: relative; overflow: hidden;` (simulation.css:998-1001)

**Da fare**: risolvere il bug di visibilità. Il bottone deve essere:
- Visibile sempre (anche quando disabilitato, ma con opacità ridotta)
- Non tagliato da `overflow: clip` del parent
- La `::before` shine del `btn-primary` non deve uscire dai bordi
- Deve funzionare su mobile come su desktop

---

## Task 2 — Spostare feedback HTML fuori dal layout chat

**File**: `public/simulation.html`

Il feedback panel (`#feedbackPanel`) è attualmente dentro `.sim-layout` che su desktop diventa `display: grid` a 2 colonne (riga 594-607 di simulation.css). Il feedback panel è l'ultimo figlio quindi finisce nella colonna destra.

**Problema**: Su mobile il feedback panel viene collassato con un toggle e sta dentro lo stesso flusso della chat.

**Da fare**: Rendere il feedback panel un elemento fisso esterno al `.sim-layout` usando:
- Un modal/sheet a comparsa da destra su mobile
- Un pannello laterale sticky su desktop
- Togliere il toggle attuale `mobile-feedback-toggle` e sostituirlo con un drawer nativo
- Il feedback deve rimanere visibile/aggiornabile live durante lo streaming SSE

---

## Task 3 — Refactor streaming SSE: typewriter char-by-char reale

**File**: `public/simulation.html` (funzione `chiamaCommissarioStream`, riga 879)

**Stato attuale**: Lo streaming SSE funziona ma il rendering typewriter è adattivo (sliding window di 2-8 caratteri per frame RAF). Inoltre `extractMessaggioVisible()` cerca di estrarre il campo "messaggio" dal JSON parziale con regex fragile.

**Da fare**:
- Sostituire il typewriter RAF adattivo con tipo **char-by-char** vero con velocità controllabile (es. 30ms per char)
- Rimuovere `extractMessaggioVisible()` e il parsing parziale: mostrare direttamente il delta content nell'ordine in cui arriva dallo SSE
- Aggiungere pausa sulla punteggiatura (.,!?) — rallentare leggermente
- Aggiungere effetto **cursor lampeggiante** che scompare dopo X secondi di inattività
- Aggiungere effetto **glow pulsante** sulla bolla durante lo streaming (già esiste `streaming-aura` ma va integrato col nuovo flusso)

---

## Task 4 — Feedback panel: barre animate con dettagli espandibili e correzioni

**File**: `public/simulation.html` (sezione feedback, righe 194-329)

**Stato attuale**: Le barre feedback (chiarezza/struttura/contenuto) hanno un dettaglio testuale che appare al click sulla barra. Il pulsante "Non sono d'accordo" apre un textarea per correzione.

**Da fare**:
- Aggiungere **gradiente di colore** sulle barre (non colore pieno: rosso→giallo→verde in base allo score)
- Aggiungere **micro-label** sotto ogni barra con lo score numerico con animazione di "pop" quando cambia
- Il dettaglio espandibile dovrebbe avere un'animazione di **altezza fluida** (invece del `hidden` toggle attuale)
- La correzione "Non sono d'accordo" dovrebbe mandare il testo come `user` message nella chat (già fa) ma anche:
  - Aggiungere un **timestamp** alla correzione
  - Mostrare un **indicatore** nel bubble della chat che quella risposta è stata corretta
  - Aggiungere un feedback visivo di conferma ("Correzione ricevuta")

---

## Task 5 — Stream fallback: se SSE fallisce, usare non-stream come backup

**File**: `public/simulation.html` (funzione `inviaMessaggio`, riga 1319)

**Stato attuale**: `inviaMessaggio` chiama `chiamaCommissario` (non-stream) e poi `aggiungiMessaggioCommissario` per parsare la risposta.

**Da fare**:
- Provare prima `chiamaCommissarioStream` (SSE reale)
- Se lo stream fallisce (errore di rete, timeout, 502), fare **automatico fallback** a `chiamaCommissario` (non-stream)
- L'utente deve vedere un toast **discreto** "Passaggio a modalità testo" solo in caso di fallback, senza interrompere il flusso
- Salvare la preferenza in `sessionStorage` per non ritentare lo stream nella stessa sessione

---

## Task 6 — Estrarre il timer in un componente separato

**File**: `public/simulation.html` (funzioni `startTimer`, riga 738)

**Stato attuale**: Il timer è una funzione inline che aggiorna `timerDisplay` ogni secondo. Aggiunge classi `pulse-animation` sotto 60s e cambia colore sotto 120s.

**Da fare**: Refactor in un oggetto `SimTimer` con:
- `start(minutes)`, `pause()`, `resume()`, `stop()`
- Callback: `onTick(secondsLeft)`, `onWarning()`, `onCritical()`, `onExpired()`
- Deve **continuare a funzionare** anche se il tab va in background (usare `Date.now()` differenza invece di `setInterval` fidato)
- Emettere eventi personalizzati (`sim:timer-warning`, `sim:timer-critical`, `sim:timer-expired`) per disaccoppiamento
- Integrare la barra di progresso della sessione col timer

---

## Task 7 — Summary: più ricco di dati

**File**: `public/simulation.html` (funzione `endSimulation`, riga 1553)

**Stato attuale**: Il summary mostra: punteggio medio circolare, domande, tempo usato, chiarezza/struttura/contenuto.

**Da fare**: Aggiungere:
- **Trend**: freccia su/giù rispetto all'ultima simulazione (leggere da localStorage `last_scores`)
- **Punti deboli**: elencare le aree <5/10 con suggerimenti mirati
- **Tempo per risposta**: media tempo per risposta
- **Bottone "Condividi"**: copia testo riassuntivo (es. "Ho appena fatto una simulazione con ConcorsoAI: punteggio 7/10! 🎯")
- **Bottone "Scarica report"**: genera testo semplice con tutti i dati
- **Animazione**: i numeri devono "contare" dal 0 al valore finale (con GSAP o RAF) nel cerchio e nelle stat card

---

## Task 8 — Indicatore visivo: quando il commissario sta ancora scrivendo nell'attuale non-stream

**File**: `public/simulation.html` (funzione `aggiungiMessaggioCommissario`, riga 1202)

**Stato attuale**: C'è un thinking-row con animazione "orb spinning" + "wave bars" + "aura pulse" che mostra per 800ms fissi (setTimeout). Poi viene rimosso e sostituito dal messaggio.

**Da fare**: Rendere questo indicatore **reattivo**:
- Se stream: l'indicatore resta finché il primo chunk non arriva
- Se non-stream: usare un timer progressivo (se >3 secondi, mostrare "Il commissario sta preparando una risposta articolata...")
- Aggiungere una **barra di attesa** sotto il thinking che cresce (non linearmente, con ease)
- Se l'attesa supera 10 secondi: pulsante "Salta e riprova" visibile

---

## Task 9 — Dark mode toggle persistente

**File**: tutte le pagine (`public/*.html`)

**Stato attuale**: Solo tema chiaro (light mode). Palette brand blu su sfondo `#F7FBFF`.

**Da fare**:
- Aggiungere variabili CSS `prefers-color-scheme: dark` in `public/css/*.css`
- Creare un **toggle** nella navbar (icona luna/sole) che persiste in `localStorage`
- Tema dark: sfondo brand-900 (`#071D33`), testo chiaro, carte con bordo sottile brand-700
- Le animazioni GSAP devono funzionare anche in dark mode
- Il toggle deve essere accessibile (aria-label, keyboard)
- **Non** usare Tailwind dark variant: tutto con CSS custom properties e `data-theme="dark"` su `<html>`

---

## Task 10 — Config: salvataggio preferenze utente

**File**: `public/simulation.html`

**Stato attuale**: La difficoltà e durata sono salvate in `sessionStorage`. I bandi selezionati pure.

**Da fare**:
- Salvare l'**ultimo bando selezionato** in `localStorage` (cross-sessione)
- Salvare **difficoltà preferita** in `localStorage`
- Salvare **durata preferita** in `localStorage`
- Alla prossima apertura di `simulation.html`, pre-selezionare questi valori
- Aggiungere una UI chip "Riprendi ultima simulazione" se `cai_sim_in_progress` è ancora `true` in localStorage

---

## Task 11 — Micro-interazioni premium: hover magnetico sui bottoni

**File**: tutti i file dove ci sono bottoni (`btn-primary`, `btn-secondary`, `difficulty-card`, `bando-card`)

**Stato attuale**: C'è già un effetto di `rotateX/rotateY` sui difficulty-card e bando-card (funzione `initPremiumInteractions`, riga 1600 di simulation.html).

**Da fare**: Estendere l'effetto **magnetico** a:
- `#sendButton`: il bottone si sposta leggermente verso il mouse (magnetico 3D)
- `.btn-primary` e `.btn-secondary` nella dashboard e landing: tilt 3D leggero
- L'effetto deve essere fluido, non scattoso
- Deve rispettare `prefers-reduced-motion`

---

## Task 12 — Cache degli chunks del bando per simulazioni veloci

**File**: `public/simulation.html` (funzione `recuperaChunks`, riga 1390)

**Stato attuale**: Ogni volta che l'utente invia un messaggio, `recuperaChunks` fa una query Supabase `SELECT content FROM chunks WHERE bando_id IN (...)`.

**Da fare**:
- Alla prima chiamata, caricare i chunk e metterli in `sessionStorage` (o IndexedDB se > 100KB)
- Nelle chiamate successive, usare la cache invece di Supabase
- Se il bando selezionato cambia, invalidare la cache
- Mostrare un piccolo indicatore di "Materiali caricati" nella barra info della simulazione
- Se i chunk sono troppo grandi (> 50KB), non cachare ma mostrare avviso

---

## Task 13 — Servizio di quota simulazioni: integrazione con paywall

**File**: `public/simulation.html`, `api/quota.js`, `public/dashboard.html`

**Stato attuale**: Esiste già `api/quota.js` che controlla quante simulazioni ha fatto l'utente (3 per free). Ma non c'è un paywall lato client.

**Da fare**:
- In `simulation.html`, prima di avviare la simulazione, chiamare `/api/quota` con il token JWT
- Se `remaining <= 0` e plan è `free`, mostrare un **modal paywall** che invita a passare a Pro
- Il modal deve: mostrare il conteggio "Hai usato 3/3 simulazioni gratis questo mese", i piani disponibili, un pulsante per stripe
- Non bloccare l'accesso alla configurazione, solo l'avvio
- Includere un pulsante "Riprova più tardi" (il reset è a fine mese)
- Aggiungere su dashboard.html un indicatore di "Simulazioni rimanenti questo mese"

---

## Task 14 — Pulsante "Nuova simulazione" dopo completamento

**File**: `public/simulation.html`

**Stato attuale**: Dopo aver completato una simulazione, il summary mostra solo "Torna alla Dashboard" e "Riprova".

**Da fare**: Nel summary, sostituire "Riprova" con due opzioni:
- **"Nuova simulazione"** → va alla configurazione con bandi già selezionati
- **"Riprova stessa"** → ricomincia identica (stessi bandi, stessa difficoltà, stessa durata)
- Questi bottoni devono essere visibili ANCHE quando la simulazione finisce per timeout (timer a 0)
- Aggiungere una animazione di "slide" quando il summary appare

---

## Task 15 — Bug visivo: bando-card non mostra il nome su mobile

**File**: `public/css/simulation.css` (righe 300-307)

**Stato**: `.bando-name` ha `overflow: hidden; white-space: nowrap; text-overflow: ellipsis;`

**Da fare**: Il nome del bando su mobile viene troncato con ellipsis. Aggiungere un tooltip nativo o un popover che mostra il nome completo al tap/hover prolungato. In alternativa, permettere wrapping su mobile (2 righe) invece di ellipsis.

---

## Task 16 — Recupero sessioni interrotte

**File**: `public/simulation.html`

**Stato**: Se l'utente chiude il browser o fa refresh durante una simulazione, perde tutto.

**Da fare**:
- Salvare lo stato della simulazione in `sessionStorage` (ultimo messaggio, timer residue, storico messaggi, domanda corrente)
- Al caricamento di `simulation.html`, se `sessionStorage` ha uno stato salvato e non è scaduto (> 30 minuti fa), mostrare un modal: "Hai una simulazione in corso da [tempo]. Vuoi riprenderla?"
- Opzioni: "Riprendi", "Ricominica da capo"
- Se riprende, ripristinare chat, timer, messaggi
- Se sceglie "Ricominicia", pulire lo stato

---

## Istruzioni per Opus

Questi sono 16 task indipendenti o semi-dipenedenti. Non c'è un ordine obbligatorio. Ogni file modificato va letto prima con `Read`, le modifiche vanno fatte con `Edit`. Per task che toccano più file, usare `subagent-driven-development` per parallelizzare. Per ogni task alla fine:
- Verificare che il bottone "Inizia Simulazione" sia visibile (Task 1) — è **prioritario**
- Non rompere lo streaming SSE (Task 3)
- Non rompere il flusso di autenticazione/auth-patch.js

Non modificare i file in `src/` (legacy Minecraft), non modificare `api/` se non per `api/quota.js` nel task 13.