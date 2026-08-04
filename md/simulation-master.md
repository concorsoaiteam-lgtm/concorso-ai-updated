# ConcorsoAI — Simulation Master (`simulation.html`)

**Versione:** 1.0 · **Stato:** specifica di riferimento (NESSUN codice)
**Audience:** Senior Frontend Engineer · Senior Backend Engineer · Product Designer
**Obiettivo:** progettare `simulation.html` come il cuore del prodotto — la pagina che convince un utente gratuito che questo software vale davvero. Non una chat. Un software premium di allenamento all'orale.

**Documenti coerenti (da leggere prima):** `md/dashboard-master.md`, `md/ui-ux-master.md`, `UX-AUDIT-SIMULATION.md` (audit della versione attuale), `supabase/rls.sql`, `scripts/create_simulazioni_table.sql`.

**Contratto di deliverable:** questo documento è l'unica fonte di verità per l'implementazione. Se l'engineer incontra un punto non specificato, deve aprire una issue e chiedere — non decidere da solo. Niente "a mio gusto".

---

## 1. Executive Summary — le 10 decisioni di fondo

| # | Decisione | Perché |
|---|-----------|--------|
| D1 | **Non è una chat.** È una sessione strutturata: preparazione → interrogazione → report. L'utente percepisce un esame simulato, non un chatbot | Chat = attrito e ambiguità (cosa rispondo? quando?). Sessione = aspettative chiare, Zeigarnik (D§3.11), tensione positiva |
| D2 | **La prima domanda arriva in <1s dal click "Inizia"** (dalla question bank, zero LLM nel path critico) | L'aha moment è la prima domanda del SUO bando. Ogni secondo di attesa dopo il click è ansia |
| D3 | **Il feedback è il prodotto**: 3 dimensioni (Chiarezza/Struttura/Contenuto) 0-10 + testo streaming che cita la risposta + 1 suggerimento concreto | Feedback specifico = apprendimento (Hattie d=0.70). Feedback generico = AI wrapper |
| D4 | **Il feedback arriva in streaming (SSE)** con skeleton vivo, mai spinner | Percezione 200-500% migliore (dashboard-master §3.3) |
| D5 | **Mai punteggi aggressivi**: verde solo per "ok", ambra per "da lavorare", MAI rosso lampeggiante; nessun "hai sbagliato" | Growth mindset (Dweck): il feedback è direzione, non giudizio. L'orale vero non urla |
| D6 | **Il timer della sessione è un cronometro, non un countdown** (tranne modalità Difficile) | Countdown = ansia costante (test anxiety). Cronometro = contesto. La commissione non mette il timer sul tavolo |
| D7 | **La sessione si salva e si riprende** (persistenza locale + DB a ogni risposta, optimistic UI) | L'abbandono non è fallimento: "Salva e riprendi" elimina l'ansia del click sbagliato |
| D8 | **Il report segue la peak-end rule**: apertura calda → voto con count-up → punti di forza → aree da lavorare → prossimo passo concreto | La fine dell'esperienza decide il ricordo (Kahneman). Mai chiudere con un rosso freddo |
| D9 | **Free e Pro usano la stessa qualità.** Il Free vede il 100% del prodotto per 3 sessioni/mese. Pro = potenza (Difficile, piano settimanale, ripasso automatico, trend), non sblocco | Il limite è solo il contatore (dashboard-master D2, §5.3). A quota 0: springboard, mai muro |
| D10 | **Zero numeri inventati, zero frasi motivazionali fake, zero dark pattern** | Regola assoluta del progetto (dashboard-master §9, ui-ux-master §19) |

---

## 2. Fondamenti di ricerca (perché ogni scelta esiste)

> Ogni decisione di questo documento è agganciata a un principio qui sotto. Se una scelta di design contraddice una riga di questa tabella, è sbagliata.

### 2.1 Learning science applicata

| Principio | Evidenza | Implicazione prodotto |
|---|---|---|
| **Retrieval practice / testing effect** | Il test di materiale studiato supera la rilettura per ritenzione a lungo termine (Roediger & Karpicke 2006); l'effetto cresce con la distanza temporale (fino a +50% a una settimana). Il testing ha anche un *forward effect*: recuperare prima materiale migliora l'encoding di quello successivo (Pastötter & Bäuml 2014) | Ogni simulazione è un test a risposta aperta, mai un quiz a scelta multipla. L'utente deve *produrre* la risposta, non riconoscerla. Mai mostrare la risposta "giusta" prima del tentativo |
| **Active recall vs rilettura** | La rilettura crea illusione di competenza (fluency heuristic, Karpicke & Blunt 2011) | La domanda appare senza note. Il "mostra suggerimento" (hint) è un fallback che costa visibilità di abbandono: 2 hint a sessione, poi si prosegue |
| **Desirable difficulties** | Difficoltà desiderabili: la fatica a recuperare rafforza la memoria, ma oltre la soglia della frustrazione si spegne l'apprendimento (Bjork & Bjork 2011) | Tre modalità con difficoltà crescente. La modalità Difficile aggiunge *interruzioni del commissario* (follow-up, "può citare la fonte?") — la difficoltà è nel formato, non nel contenuto impossibile |
| **Cognitive load** | La working memory è limitata; il carico estraneo (interfaccia confusa, latenza) ruba risorse al ragionamento (Sweller 1988) | Schermata di sessione minimale: domanda, risposta, stato. Niente sidebar, niente banner, niente grafici durante la sessione. Tutto il rumore va nel report |
| **Spaced repetition** | La memoria decade esponenzialmente; i ripassi a intervalli crescenti massimizzano la consolidazione (Ebbinghaus; SM-2; Cepeda et al. 2006) | Le domande "deboli" (voto < 6 su una dimensione) vengono ripresentate nelle sessioni successive (Pro) e nel report: "Rifai le domande deboli". Intervalli 1-3-7-16 giorni |
| **Deliberate practice** | La performance esperta nasce da pratica strutturata, al limite della comfort zone, con feedback immediato e specifico (Ericsson et al. 1993) | La sessione scompone la performance in micro-abilità (chiarezza, struttura, contenuto, lessico, pertinenza). Il feedback è specifico alla risposta, mai "bravo/generico" |
| **Timing del feedback** | Il feedback è tra gli interventi educativi più efficaci (Hattie d≈0.70). Il feedback immediato serve per task procedurali; quello ritardato e riassuntivo serve per il ragionamento complesso (Shute 2008) | Il commissario NON interrompe la risposta (niente feedback a metà frase). Il feedback arriva a fine risposta: immediato (punteggi) + testuale; il report finale è la sintesi |
| **Test anxiety** | 20-40% degli studenti soffre di ansia da esame; erode la working memory e attiva immagini mentali negative di fallimento (Maier et al. 2021). L'esposizione controllata e la self-efficacy mitigano l'ansia (Ringeisen et al. 2019) | Modalità "Rapida" = esposizione a bassa posta. Il briefing pre-sessione normalizza ("Se ti blocchi, respira e riparti: succede anche in aula"). Mai pressione, mai colpevolizzare |
| **Peak-end rule** | L'esperienza è ricordata per il picco emotivo e per la fine, non per la media (Kahneman; Redelmeier & Kahneman 1996) | Picco = il feedback che cita la risposta ("Ha dimenticato l'art. 12 L. 241/1990"). Fine = report che si chiude con un prossimo passo concreto e una nota non giudicante |
| **Growth mindset** | Lodare il processo (non l'intelligenza) costruisce resilienza; il voto nudo senza contesto fissa la mentalità (Dweck 2007) | I punteggi sono sempre accompagnati da: confronto col tuo storico ("+0,4 rispetto alla tua media"), punti di forza specifici, "la prossima volta prova a…" |
| **Mastery thresholds** | Khan Academy e Duolingo richiedono performance ripetute sopra una soglia per sbloccare il livello successivo | Il ripasso automatico (Pro) rilancia una domanda finché non raggiunge ≥7 su tutte le dimensioni. Soglia documentata, mai segreta |

### 2.2 Principi dei prodotti migliori (estratti, non copiati)

| Prodotto | Principio estratto | Uso in simulation.html |
|---|---|---|
| **Duolingo** | Lo streak e il contatore di energia rendono la pratica un'abitudine con rinnovo, non un premio da consumare | La quota 3/mese nel sidebar (già implementata) + microcopy di ritorno. Niente "hearts" che bloccano la pratica: il fallimento è informazione |
| **Khan Academy** | Mastery learning: esercizio → hint → spiegazione → esercizio successivo. Il "livello" è per competenza, non per tempo | Il report scompone per argomento (dal bando) e il ripasso automatico è per argomento debole |
| **NotebookLM** | Tutto è grounded nelle FONTI dell'utente; le risposte citano i documenti | Ogni feedback può citare il bando e le fonti normative reali. Mai risposte "di cultura generale" quando l'utente ha caricato un bando |
| **ChatGPT / Claude** | Lo streaming e il caret pulsante vendono la velocità; il messaggio utente appare subito (optimistic) | Il feedback streaming con caret pulsante (pattern già in simulation.css). La risposta dell'utente appare istantaneamente |
| **Perplexity** | Le risposte con citazioni costruiscono fiducia | Nel report: "Argomenti coperti" elenca le materie realmente toccate; le domande difficili citano il bando |
| **Cursor / Linear** | Command palette, feedback di stato a ogni azione, empty states che spiegano il valore | La sessione ha keyboard-first (Ctrl/⌘+Invio per inviare, Esc per il menu pausa). Ogni stato ha un motivo |
| **Notion** | Calma tipografica, spazi generosi, gerarchia per contrasto non per rumore | La card domanda è tipograficamente pulita (body 16px, 64ch max). Il report usa gerarchia, non decorazione |
| **Mock interview tools** | La simulazione ha sempre: tempo, struttura a domande, auto-valutazione, replay | Timer visibile, domanda per domanda, report per domanda, "Rivedi le tue risposte" |

---

## 3. I 4 pilastri dell'esperienza

Ogni schermata deve essere progettata per sostenere questi quattro pilastri. Se un elemento non li serve, non esiste.

1. **Tensione positiva** — l'utente percepisce che sta "facendo sul serio": una sessione ha inizio, regole, ritmo e una fine. La tensione viene dal contenuto (la domanda vera), non da artifici (countdown aggressivi, musica, rosso).
2. **Concentrazione** — durante la sessione l'interfaccia sparisce: una sola colonna, zero rumore. Tutto il contenuto informativo secondario vive nel report.
3. **Immersione** — il commissario è una presenza coerente (tono, formato, citazioni), non una sequenza di prompt random. L'utente "dimentica" di essere davanti a un software.
4. **Professionalità** — ogni microcopy, ogni numero, ogni stato è curato come in un prodotto a pagamento. Il livello di rifinitura comunica il valore del prodotto.

---

## 4. Architettura informativa & flusso

### 4.1 Mappa del flusso (macro)

```
[INGRESSO] → gate (auth, bando, quota, ripresa)
     │
     ▼
[SETUP] modalità + durata + anteprima
     │  CTA "Inizia"
     ▼
[BRIEFING] 3 card rapide + regole dell'orale  (2.5s, skippabile)
     │
     ▼
[SESSIONE] loop: domanda → risposta → feedback → domanda successiva
     │
     ├─ "Salva e riprendi" → [PAUSA] (persistita)
     │
     └─ ultima domanda completata → [REPORT]
     │
     ▼
[REPORT] voto → dimensioni → punti forti/deboli → confronto storico
     → "Rifai le domande deboli" | "Nuova simulazione" | "Piano settimanale" (Pro)
```

### 4.2 Stati globali della pagina

| Stato | Trigger | Comportamento |
|---|---|---|
| `boot` | load | Skeleton full-screen mappato alla shell (mai spinner >1s) |
| `gate-error` | no sessione / no bando / quota 0 | Schermata dedicata con azione chiara (vedi §13) |
| `setup` | scelta config | Schermata setup |
| `briefing` | click "Inizia" | Transizione 260ms, sequenza 3 card |
| `running` | fine briefing | Sessione attiva |
| `paused` | Esc / click "Pausa" | Overlay pausa con "Riprendi" e "Salva ed esci" |
| `feedback` | invio risposta | Sottostato di `running` (vedi §5.7) |
| `report` | ultima domanda / termine | Schermata report |
| `error` | rete/timeout/server | Stato di errore con retry non distruttivo |

Transizione tra stati: mai `display:none` brusco. Ogni cambio di fase usa `view-in` (260ms `--ease`, già nel design system) o transizioni dedicate definite in §7.

### 4.3 Routing e stato URL

- `simulation.html` è una SPA a fase (come l'attuale): tre `<main>` commutati, **ma** ogni fase è renderizzata da funzione dedicata (vedi §15 file structure).
- Lo stato di sessione vive in `localStorage` (chiavi esistenti `cai_*`) + DB (tabella `simulazioni` con `status='in_progress'`).
- Nessuna query string necessaria; l'handoff dalla dashboard resta compatibile (`localStorage.setItem("cai_input_method", "bando")` ecc.).

---

## 5. Specifica schermata per schermata

### 5.1 Ingresso (gate)

**Ordine dei check (tutti server-side rispecchiati):**
1. Sessione Supabase valida (riusa `Dash.guard()` di `dash-common.js`). No → redirect `auth.html?mode=login`.
2. Bando attivo presente (`Dash.getActiveBando()`). No → schermata `gate-no-bando`: copy + CTA "Carica il bando" → `dashboard.html#bandi`.
3. Quota (Free): count simulazioni del mese corrente. Se `used >= 3` → NON bloccare l'ingresso: mostra la schermata setup con la quota visibilmente esaurita e il CTA sostituito dallo springboard (§10.3). L'utente può comunque vedere setup, anteprima e la domanda campione.
4. Sessione incompleta (`simulazioni.status='in_progress'` nelle ultime 24h) → banner "Riprendi la sessione di ieri" con i dati reali (modalità, domanda N/12). CTA primario "Riprendi", secondario "Nuova sessione".

**Microcopy del gate:**
- Nessun bando: *"Per simulare l'orale serve il bando del tuo concorso. Da lì nascono le domande."*
- Ripresa: *"Hai interrotto la sessione «Standard · 12 domande» alla domanda 7. Da dove riparti?"*

### 5.2 Setup

**Layout:** una colonna, max-width 560px, centrata. Nessuna sidebar (focus totale, pattern signup).

```
[eyebrow] Preparazione
[H1] Come vuoi allenarti?
[sub] Ogni sessione è una simulazione completa: domande dal tuo bando,
      risposta libera e correzione della commissione.

┌─ Card bando attivo ───────────────────────────────┐
│ [icona doc]  Nome del bando (troncato 40ch)       │
│              "3 argomenti · caricato il 12 luglio"│
│              [Cambia]  → dashboard.html#bandi     │
└───────────────────────────────────────────────────┘

┌─ Modalità (3 card orizzontali, radio) ────────────┐
│ [Standard] 12 domande · ritmo reale    [Consigliata]│
│ [Rapida]   6 domande · 10 minuti                   │
│ [Difficile] 12 domande · interruzioni · [Pro]      │
└───────────────────────────────────────────────────┘

[Sub-dettaglio della modalità selezionata — 2 righe, fattuali]
[Nota durata consigliata: "~20 minuti" — solo testo, NON un selettore]

[Sticky CTA bottom]  Inizia la simulazione →   (56px, thumb-zone mobile)
[Microcopy sotto]  "Si salva da sola: puoi chiudere e riprendere quando vuoi."
```

> **Niente selettore "ritmo/durata" separato** (Hick's law, choice overload §2.2):
> il ritmo è parte della modalità — Standard e Difficile usano il cronometro,
> Rapida pure (informale), Difficile aggiunge il countdown 90s nelle ultime
> 3 domande. La "durata consigliata" è una nota testuale, mai una scelta.
> Questo allinea `simulation.html` a dashboard-master §6.4.

**Regole della modalità:**

| Modalità | Domande | Tempo | Note | Piano |
|---|---|---|---|---|
| **Standard** | 12 | cronometro (non countdown) | ritmo di una prova reale | Free |
| **Rapida** | 6 | cronometro | esposizione a bassa posta, ottima per l'ansia | Free |
| **Difficile** | 12 | cronometro + **timer per domanda 90s** nelle ultime 3 | interruzioni del commissario, follow-up, richieste di fonte | Pro |

**Sub-dettaglio modalità (testo reale):**
- Standard: *"12 domande sul tuo bando, una alla volta. Dopo ogni risposta il commissario ti dà punteggi e correzione. ~20 minuti."*
- Rapida: *"6 domande, meno di 15 minuti. Ideale per iniziare o per i giorni pieni."*
- Difficile: *"12 domande con interruzioni e domande di approfondimento, come un orale tosto. Timer per domanda nelle ultime 3. Incluso in Pro."*

**Stati:**
- `setup-idle` — card modalità selezionata di default: **Standard** (default effetto, dashboard-master D1 pattern).
- `setup-disabled` — bando assente: card bando in stato errore, CTA disabilitato con motivo visibile (*"Carica il bando per iniziare"*).
- `setup-pro-locked` — Difficile selezionata da Free: pannello "anteprima Pro" (vedi §10.2), non un alert.
- `setup-0quota` — Free a 3/3: CTA diventa "Vedi un esempio di sessione" → springboard (§10.3).

**A11y:** le card modalità sono `<button role="radio" aria-checked>`, navigabili con frecce; il gruppo ha `role="radiogroup"` e `aria-label="Modalità"`.

**Validazione quota al click "Inizia" (fonte di verità):** il click non parte in cieco. Il client chiama la Edge Function `start-simulation` con `{bando_id, mode}`; la funzione valida il JWT, conta `simulazioni` del mese (server-side, mai fidarsi del client), verifica che il bando esista e che la question bank sia pronta, e risponde `{ok: true}` oppure `402` (quota) / `404` (bando/bank). Solo con `ok` si parte. L'evento `sim_started` si logga qui.

**Edge case — bank più piccola della modalità:** se il bando ha meno domande di 12, la sessione usa TUTTE le domande disponibili e la barra progress scala di conseguenza. Il setup lo comunica in modo fattuale: *"Questo bando ha 5 domande pronte: la sessione sarà più breve."* Mai generare domande extra a runtime (costo); mai ripetere la stessa domanda nella stessa sessione.

### 5.3 Briefing (pre-sessione)

**Scopo:** abbassare l'ansia (esposizione controllata), allineare le aspettative, e dare una micro-strategia. **Non è un caricamento:** dura 2.5s totali, ogni card 800ms, skippabile in ogni momento ("Salta" sempre visibile, focus su di esso).

```
[BRIEFING]
┌────────────────────────────┐
│ 1. "Hai davanti il tuo      │   (entra con fade+slide, 260ms)
│    bando. Le domande        │
│    arriveranno da lì."      │
├────────────────────────────┤
│ 2. "Rispondi come davanti   │
│    alla commissione:        │
│    frase di apertura,       │
│    sostanza, chiusura."     │
├────────────────────────────┤
│ 3. "Se ti blocchi: respira, │
│    riparti da quello che    │
│    sai. Anche in aula."     │
└────────────────────────────┘
[Salta]                    [Inizia]
```

**Regole:**
- Ogni card contiene UNA frase, ≤ 14 parole. Nessuna parola motivazionale vuota ("vinci", "spacca tutto").
- Al termine (o skip): transizione diretta a sessione. La prima domanda parte **istantaneamente** dalla question bank (§8.1).
- **Reduced motion:** le card appaiono tutte insieme senza animazione; il timer 2.5s diventa 0 (la sessione parte subito).

### 5.4 Sessione — shell

**Layout full-bleed (nessuna sidebar):**

```
┌──────────────────────────────────────────────────────────┐
│ ← [Salva e riprendi]     [chip: Standard · bando]        │
│ Domanda 4 / 12                    [cronometro 12:34]     │
│ ▓▓▓▓▓▓░░░░░░░░░░ (barra 2px, fill 120ms linear)          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   [chip argomento]  Diritto amministrativo               │
│   «Mi spieghi come si attua il principio di              │
│   proporzionalità nell'esercizio del potere              │
│   amministrativo discrezionale»                          │
│                                                          │
│   ┌─ La tua risposta ────────────────────────────────┐   │
│   │ textarea autosize (min 3 righe)                  │   │
│   │ [suggerimento]  ← espandibile, 2 a sessione      │   │
│   └──────────────────────────────────────────────────┘   │
│   124 parole · [Invio per inviare ⌘↵]  [Invia]           │
│                                                          │
│   ┌─ Feedback (dopo l'invio) ─────────────────────────┐  │
│   │ [skeleton 4 barre shimmer → punteggi + testo]     │  │
│   │ Chiarezza 7.5 ▓▓▓▓▓▓▓░   Struttura 6.0 ▓▓▓▓▓░░░   │  │
│   │ Contenuto 5.0 ▓▓▓▓▓░░░                            │  │
│   │ "La risposta è ben incardinata sul principio…      │  │
│   │  Mancava la fonte: art. 12 L. 241/1990."           │  │
│   │ [Domanda successiva →]  (appare dopo ~2.5s)        │  │
│   └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Top bar (56px):**
- Sinistra: **"Salva e riprendi"** (ghost, icona freccia indietro). Apre overlay pausa (§5.11).
- Centro: **Domanda N / 12** + barra 2px.
- Destra: chip modalità + **cronometro** (tabular-nums, 13px). In Difficile, le ultime 3 domande mostrano un countdown 90s che passa a warn ≤15s (mai rosso pulsante).
- Il cronometro è puramente informativo (D6): parte con la prima domanda, si ferma in pausa.

**Skeleton iniziale (prima domanda):** la shell è già renderizzata; solo la card domanda mostra 3 righe shimmer 400ms prima del testo (arrivo istantaneo dal bank). Se la domanda è già in memoria, nemmeno quello.

### 5.5 Card domanda

**Anatomia:**
- Chip argomento: `bandi_argomenti.nome`, con bordo line, testo muted (mai colori per argomento: un solo colore = professionalità).
- Testo domanda: `question_bank.testo`, body 16px, line-height 1.6, max 64ch. Virgolette « » (regola tipografica italiana, ui-ux §5.7).
- Badge difficoltà della domanda: nessuno (il formato della modalità basta; aggiungere badge = rumore).

**Transizione tra domande:**
1. Feedback della domanda N visibile + bottone "Domanda successiva" (appare dopo 2.5s, mai prima — il tempo di lettura del feedback è parte del valore).
2. Click → la domanda N+1 entra con `view-in` (260ms), il feedback N si compatta in una riga espandibile sotto la domanda corrente (**"Feedback domanda 4 — 6.8"**, che si espande in accordion). Questo consente all'utente di rivedere la risposta precedente senza perdere il flusso.
3. La textarea si svuota e riprende il focus (a11y: annuncio "Domanda 5 di 12").

**Perché il feedback compatto sotto:** l'utente può consultare il feedback precedente mentre risponde alla successiva — pattern "riparazione immediata" (NotebookLM/sidebar). Non si perde nulla, non si apre nulla.

### 5.6 Area risposta

**Anatomia:**
- `<textarea>` autosize (min 3 righe, max 12), font 16px (niente zoom iOS), bordo line-2, focus ink + ring 3px rgba(15,17,21,0.06).
- **Contatore parole** (13px, ink-faint, tabular-nums): *"124 parole"*. Aggiornamento live, debounce 0 (solo testo).
- **Hint espandibile** (ghost, 12.5px): *"Come si struttura una buona risposta"* → accordion con 3 punti reali:
  1. *"Apri con la risposta, non con la premessa."*
  2. *"Cita le fonti: legge, articolo, principio."*
  3. *"Chiudi con una frase che riporta alla domanda."*
- **Hint sul volume** (solo quando <40 parole al momento dell'invio tentato): *"Hai scritto 34 parole. Un orale vero vuole sostanza: prova ad argomentare di più, poi invia."* — NON blocca l'invio (l'utente decide).
- **Bottone Invia** (40px, thumb-zone): icona freccia su. Shortcut **Ctrl/⌘+Invio** (hint nel tooltip/`kbd`).

**Stati:**
| Stato | Textarea | Invio |
|---|---|---|
| idle | editabile | abilitato se testo non vuoto (trim) |
| sending | disabilitata | mostra barra indeterminata 1px (pattern auth), niente spinner |
| feedback | disabilitata (si riabilita alla domanda successiva) | — |
| error | editabile, testo PRESERVATO | riabilitato con toast di errore |

**Regola d'oro:** la risposta dell'utente non si perde MAI (error, timeout, chiusura, refresh).

### 5.7 Stati di invio e feedback

**Sequenza:**
1. Click invia → messaggio utente "parte" (optimistic): la textarea si blocca, il bottone mostra busy-bar, il feedback panel mostra **skeleton di 4 barre shimmer** con label *"Il commissario sta leggendo la tua risposta…"*.
2. La chiamata SSE parte (`api/chat.js` esistente, o la nuova Edge Function `ai-feedback` di dashboard-master Fase 0). Nessun placeholder: il primo frame di streaming arriva entro 1.5s.
3. **Streaming del feedback:** punteggi (3 barre + 2 avanzate) poi testo. I punteggi fanno count-up (400ms easeOut) **la prima volta che appaiono**. Il testo scorre con caret pulsante (pattern `typewriter-caret` esistente). Il caret sparisce a fine streaming (fade 200ms).
4. A fine streaming: appare **"Domanda successiva →"** dopo 2.5s (timing in §7). In Difficile, se il timer 90s scade durante la risposta: la risposta si invia automaticamente con nota *"Tempo scaduto: la risposta è stata inviata."* — mai perdere il testo scritto.

**Struttura del feedback testuale (contratto di output, ≤ 90 parole):**
1. **1 frase che cita la risposta** ("La risposta incardina correttamente il principio di proporzionalità…").
2. **1-2 frasi di correzione specifica** ("…ma non cita la base normativa.").
3. **1 riga "Mancava"** (facoltativa, solo se reale): *"Mancava: art. 12 L. 241/1990."*
4. **1 suggerimento concreto** ("La prossima volta apri citando la fonte: 'Il principio è oggi codificato dall'art. 12 L. 241/1990…'").
5. **MAI**: "Complimenti!", "Ottimo lavoro!", frasi generiche che non citano la risposta.

### 5.8 Feedback panel — punteggi

| Dimensione | Range | Colore (fill) | Etichetta in report |
|---|---|---|---|
| Chiarezza | 0-10 | `--ok-bright` se ≥7, `--warn` se 5-6.9, `--ink` se <5 | "Chiarezza" |
| Struttura | 0-10 | idem | "Struttura" |
| Contenuto | 0-10 | idem | "Contenuto" |
| Lessico (avanzata) | 0-10 | idem | "Lessico" |
| Pertinenza (avanzata) | 0-10 | idem | "Pertinenza" |

- Le 2 avanzate sono in un drawer "Mostra tutte e 5 le valutazioni" (pattern già presente in `simulation-rehaul.css`).
- **Mai rosso** per punteggi bassi: `<5` usa `--ink` (neutro). Il rosso è riservato agli errori di sistema, non al giudizio. (Regola anti-ansia, §2.1 test anxiety.)
- Ogni barra: 4px track, fill con `transition: width 400ms var(--ease)`, count-up del numero.
- Il punteggio viene salvato per dimensione in `simulazione_domande` (già previsto nello schema).

### 5.9 Termine sessione

**Due percorsi:**
1. **Naturale:** ultima domanda completata → il bottone "Domanda successiva" diventa "Vedi il risultato →" (stessa posizione, niente sorpresa).
2. **Manuale:** "Salva e riprendi" → overlay pausa con tre azioni: *Riprendi* (primary), *Salva ed esci* (ghost), *Termina la sessione* (danger ghost) — con modal di conferma: *"Vuoi terminare? Le risposte già date restano nello storico."* (nessuna perdita percepita).

**Transizione al report:** `report-in` 320ms — la schermata report entra con fade+slide mentre la sessione esce. Mai un "loading" intermedio (i dati del report sono già in memoria).

### 5.10 Report finale

**Ordine (peak-end rule, §2.1):**

```
[eyebrow] Simulazione completata · Standard · 20 min
[H1] Hai chiuso la sessione con 7,4      ← apertura calda, MAI "voto finale: 7.4"
[sub] 1,2 punti sopra la tua media delle ultime simulazioni.

┌─ Voto (gauge SVG 140px, count-up 600ms) ─────────────┐
│       ╭───╮                                          │
│       │7,4│  / 10   [badge: +0,4 vs media]           │
│       ╰───╯  "Solido"                                │
│  Etichetta: <6 "Da lavorare" · 6-7.9 "Solido" · ≥8 "Forte"│
└──────────────────────────────────────────────────────┘

[Row: 3 dimensioni]  Chiarezza 7.5 ▓▓▓▓▓▓▓░░  Struttura 6.0 ▓▓▓▓▓░░  Contenuto 5.0 ▓▓▓▓▓░░
[Row: confronto]     "Chiarezza +0,8 vs media · Struttura −0,2 vs media"

[Card: I tuoi punti forti]  (2 elementi reali, dai feedback)
  • "Incardinare la risposta nel principio giusto"  (Chiarezza)
  • "Chiudere con una frase che riporta alla domanda"  (Struttura)

[Card: Da lavorare]  (1-2 elementi, con motivazione reale)
  • "Citare le fonti normative: mancava l'art. 12 L. 241/1990 in 3 risposte su 4." (Contenuto)

[Card: Ripassa questi argomenti]  (top 2 per voto medio più basso, dati reali)
  • Diritto amministrativo · media 5,2 · [Rifai le domande deboli]  (Free)

[Accordion: Rivedi le domande]  → 12 righe: domanda · la tua risposta (troncata 2 righe, espandibile) · voto · feedback

[Footer azioni]
  [Rifai le domande deboli]  (primary, Free)  → nuova sessione solo con quelle
  [Nuova simulazione]        (ghost)
  [Piano settimanale]        (Pro, se Free → teaser Pro §10.2)
```

**Regole dure del report:**
- **Niente "percentuale di successo"**, niente "ti sei piazzato tra il X%". Solo numeri veri e confronti col proprio storico.
- **Tutti i dati sono reali** (voto da `simulazioni.voto_finale`, dimensioni da `simulazione_domande`, media calcolata dalle proprie simulazioni).
- **Sempre un prossimo passo** (D8): il report si chiude con un CTA d'azione, mai con un punto morto.
- **Rifai le domande deboli** = nuova sessione costruita con le domande a voto <6 (incluso il testo originale, senza rigenerare — costo zero). Per il Free conta come 1 simulazione di quota.
- Confronti: sempre rispetto alla **propria** media, mai a norme inventate.

**Grafico trend (nel caso il report sia agganciato a Storico):** mini-sparkline SVG senza librerie (pattern esistente `spark-svg` in history.html), punti = simulazioni, tooltip su hover. Se <2 punti: niente grafico, testo *"La prossima simulazione disegnerà il primo punto del tuo trend."*

### 5.11 Pausa / ripresa

- **Overlay pausa** (modal leggera, 440px max): cronometro fermo, stato salvato. Tre azioni: Riprendi / Salva ed esci / Termina.
- **Salva ed esci:** la sessione rimane `in_progress` nel DB; al rientro (gate §5.1) il banner di ripresa la ripristina **esattamente** (domanda N, risposta in corso preservata se c'era).
- **Persistenza:** dopo ogni feedback ricevuto si scrive `simulazione_domande` + si aggiorna `simulazioni` (optimistic, vedi §8.3). La riga "Salva e riprendi" è quindi sempre vera.

### 5.12 Layout mobile della sessione (dal audit: il drawer feedback copriva la domanda)

Su ≤768px la sessione resta una sola colonna e il feedback **non è mai un drawer che copre**:

```
┌ TopBar (wrappa su 2 righe: "Domanda 4/12" + cronometro sotto) ┐
│ ▓▓▓▓▓▓░░░░ (barra sotto la topbar, full-width)                  │
├───────────────────────────────────────────────────────────────┤
│ [chip argomento] · «Domanda…»                                   │
│ ┌─ La tua risposta ──────────────────────────────────────────┐ │
│ │ textarea (min 4 righe — pollici, font 16px, no zoom iOS)  │ │
│ └────────────────────────────────────────────────────────────┘ │
│ 34 parole · [Invia ↑]      ← in thumb-zone, sticky sopra la    │
│                              tastiera (fixed bottom, safe-area)│
│ ┌─ Feedback (inline, SOTTO l'area risposta, MAI overlay) ────┐ │
│ │ barre + testo, scorre con la pagina                        │ │
│ └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

- La barra Invia è `position: fixed; bottom: env(safe-area-inset-bottom)` e appare solo quando la sessione è attiva; tap target ≥44px.
- Il feedback si apre inline sotto la risposta e la pagina scrolla da sé (`scrollIntoView({behavior:'smooth'})`) — l'utente vede sempre la domanda sopra.
- La topbar wrappa: prima riga azioni + domanda, seconda riga cronometro + chip.
- Niente hover su mobile; stati focus/pressed al posto degli hover (ui-ux §18).

---

## 6. Component library (anatomia completa)

> Convenzioni: dimensioni in token (`--s-*`), motion in `--t-*`/`--ease`, testo in `--fs-*`. Tutti gli elementi interattivi hanno 6 stati (ui-ux §13.1). Tutti i focus usano il ring ink 2px globale.

| Componente | Anatomia | Stati | Motion | A11y |
|---|---|---|---|---|
| **TopBar** | h 56px, bg `--bg`, bordo sotto `--line`, sticky | — | bg immutato (niente blur durante la sessione: concentrazione) | landmark `header`, h1 fuori schermo `sr-only` con il nome del concorso |
| **ProgressBar** | track 2px `--line`, fill `--ink`, width = domanda/12 | — | fill 120ms linear, mai glow | `role="progressbar"` + `aria-valuenow` in % |
| **Cronometro** | 13px, tabular-nums, icona orologio 14px | idle / paused (si ferma) / warn (Difficile ≤15s) | nessuna animazione | `aria-live="off"` (non deve annunciare ogni secondo); annuncio solo a fine domanda |
| **Countdown 90s** (Difficile) | 15px, tabular-nums | ≥16s ink · ≤15s `--warn` (solo colore, no pulse) | nessuna | `aria-live="polite"` all'ultimo minuto |
| **QuestionCard** | chip argomento + testo «…» 16px/1.6, max 64ch | streaming-in (skeleton 3 righe) / ready | in: `view-in` 260ms | `aria-live="polite"` sull'area domanda al cambio |
| **ArgomentoChip** | padding 3px 9px, border `--line`, 11.5px 500, color `--muted` | — | — | testo semplice |
| **Textarea** | autosize 3-12 righe, 16px, bordo `--line-2`, focus ink + ring | idle / sending (disabled, opacity .75) / error (bordo `--error` + messaggio sotto) | bordo 120ms | `label` visibile sopra ("La tua risposta") o `aria-label` |
| **WordCounter** | 12.5px, `--ink-faint`, tabular-nums | aggiornamento live | 0 (testo) | parte della label `aria-describedby` |
| **SendButton** | 40px, icona ↑, primary ink | idle / busy (barra indeterminata 1px, mai spinner) / disabled | busy-bar 1.1s loop `--ease` | `aria-label="Invia risposta (Ctrl+Invio)"` |
| **FeedbackSkeleton** | 4 barre shimmer 10px, mappate al layout finale (CLS=0) | — | shimmer 1.4s linear | `aria-busy="true"` sul contenitore |
| **MetricBar** | label 11px tracked · numero 13px tabular · track 4px `--line` · fill colorato | count-up-in | fill 400ms `--ease`, count-up 400ms | semplice testo + `aria-label` con il valore |
| **FeedbackText** | 14px/1.6, max 60ch, con caret pulsante durante stream | streaming / done (caret fade 200ms) | caret blink 1s | `aria-live="polite"` |
| **NextButton** | primary, compare dopo 2.5s dal done | hidden / visible | in: fade+slide 200ms | focus auto al compare |
| **Accordion feedback** | riga compatta "Feedback domanda 4 · 6.8" + chevron | collapsed/expanded | max-height 220ms `--ease` | `aria-expanded`, contenuto `aria-hidden` speculare |
| **Toast** | bottom-center, bg `--ink`, testo `--bg`, 220ms (esiste già in `dash-common.js`) | — | 220ms `--ease`, auto-dismiss 3200ms | `role="status" aria-live="polite"`, mai focus |
| **Modal** | 440px max, bg `--bg`, bordo `--line`, shadow 0 24px 64px rgba(15,17,21,0.12) | — | 220ms `--ease`, focus trap, ESC chiude | `role="dialog" aria-modal` (pattern esistente) |
| **EmptyState** | `empty-mark` (cerchio 40px bg-2 + icona) + title 17px 600 + text 13.5px muted + CTA | — | — | struttura `h3`+`p` |
| **ErrorState** | `notice is-error` + messaggio + retry | — | — | `role="alert"` solo per errori bloccanti |
| **Gauge report** | SVG 140px, stroke 10px `--line`, fill `--ok-bright` (≥7) / `--warn` (5-6.9) / `--ink` (<5), numero centrale 36px tabular | count-up-in | stroke-dashoffset 600ms `--ease` | testo alternativo "Voto medio 7,4 su 10" |
| **CompareBadge** | "+0,4 vs media" · `--ok-bright` se positivo, `--ink-faint` se negativo (mai rosso) | — | in: 200ms | testo semplice |
| **KbdHint** | `kbd` 11px, font inherit | — | — | `aria-hidden` se decorativo |

---

## 7. Motion & microinterazioni (specifica esecutiva)

| # | Elemento | Trigger | Durata | Easing | Note |
|---|---|---|---|---|---|
| M1 | Cambio fase (setup→briefing→sessione→report) | azione | 260ms | `--ease` (cubic-bezier(0.16,1,0.3,1)) | mai stagger tra fasi |
| M2 | Card briefing | ingresso fase | 260ms fade+slide 4px | `--ease` | 3 card in sequenza, gap 120ms |
| M3 | Card domanda in | click "Domanda successiva" | 260ms | `--ease` | `view-in` esistente |
| M4 | Progress bar domande | cambio domanda | 120ms linear | linear | mai glow |
| M5 | Punteggi metriche | fine streaming | 400ms | `--ease` (width) + count-up 400ms easeOutCubic | count-up solo la prima volta |
| M6 | Testo feedback | streaming | per token | caret blink 1s steps | caret scompare con fade 200ms |
| M7 | Bottone "Domanda successiva" | 2.5s dopo done | 200ms fade+slide | `--ease` | mai prima di 2.5s |
| M8 | Accordion feedback | click | 220ms max-height | `--ease` | |
| M9 | Gauge report | ingresso report | 600ms | `--ease` | stroke-dashoffset |
| M10 | Count-up voto report | ingresso report | 600ms | easeOutCubic | tabular-nums |
| M11 | Busy-bar bottone | invio | 1.1s loop | `--ease` | barra indeterminata 1px |
| M12 | Skeleton shimmer | attesa | 1.4s linear loop | linear | barre 10px |
| M13 | Toast | azioni | 220ms in, 3200ms hold | `--ease` | bottom-center, 1 alla volta |
| M14 | Scroll risposta | focus/espansione | smooth | `--ease` | `scroll-behavior: smooth` solo in questa area |
| M15 | Countdown 90s | cambio colore a 15s | 0 (solo colore) | — | mai animazioni di allarme |

**Regole dure:**
- **prefers-reduced-motion:** tutto a 0.001ms (blocco globale `@media` già in dashboard.css) + i count-up e il briefing diventano istantanei via JS (`REDUCED_MOTION` check).
- Nessuna animazione infinita decorativa. Le uniche loop: skeleton shimmer, busy-bar, caret (tutti funzionali, tutti disattivati da reduced-motion).
- **Mai**: parallasse, glow, gradienti animati, confetti, particelle.

### 7.1 Scorciatoie da tastiera (tabella obbligatoria)

| Tasto | Azione | Note a11y |
|---|---|---|
| `Ctrl/⌘ + Invio` | Invia la risposta | funziona ovunque il documento abbia focus; hint `kbd` nel bottone |
| `Esc` | Apre/chiude l'overlay pausa | se la modal è aperta, chiude la modal (mai doppio binding) |
| `← / →` | Navigare le card modalità (in setup) | solo quando il radiogroup ha focus |
| `Tab` | Flusso naturale domanda → hint → invio | ordine DOM lineare |
| `1 / 2 / 3` | Selezionare Standard / Rapida / Difficile (in setup) | solo quando il radiogroup ha focus |

---

## 8. Performance (la pagina deve sembrare istantanea)

### 8.1 Path critico "Inizia → prima domanda" (<1s)

1. Al load della pagina: fetch della **question bank** del bando attivo (`question_bank` dove `bando_id = attivo`, select `testo, argomento_id, difficolta`) — nessuna chiamata LLM. Cache in memoria + `localStorage` (chiave `cai_qbank_<bandoId>`, TTL 7 giorni).
2. Al click "Inizia": la prima domanda è **già in memoria** → render immediato. Il briefing scorre sopra, non blocca.
3. La chiamata LLM (se serve feedback) parte solo all'invio della prima risposta.

### 8.2 Streaming

- Tutte le chiamate AI via SSE (`api/chat.js` esistente o Edge Function `ai-feedback`), con:
  - **cancel on disconnect** (se l'utente chiude, abortisce → risparmio token, dashboard-master §3.3);
  - **timeout** 25s lato client con retry idempotente (la risposta utente è già persistita, si può riprovare senza perdite);
  - primo frame <1.5s garantito (se il provider è lento: dopo 1.2s mostra "La risposta sta arrivando…" — mai un blocco muto).

**Contratto SSE (eventi normalizzati; l'engineer deve adattare `api/chat.js` a questo, non il contrario):**

| Evento | Payload | Uso client |
|---|---|---|
| `start` | `{question_id}` | rimuove lo skeleton, mostra il caret |
| `token` | `{text}` (delta) | append al testo streaming |
| `scores` | `{clarity, structure, content, lessico, pertinenza}` | count-up delle barre + persistenza |
| `done` | `{feedback_final}` | fine caret, timer 2.5s, bottone successiva |
| `error` | `{code, message}` | matrice errori §13 |

Il client è **idempotente**: se la connessione cade dopo `scores`, il retry non riduplica righe DB (chiave `simulazione_id + question_bank_id` con `upsert`).

### 8.3 Persistenza (optimistic UI)

| Evento | Scrittura | Sincronizzazione |
|---|---|---|
| Sessione avviata | `simulazioni` insert (`status='in_progress'`) | immediata |
| Risposta inviata | `simulazione_domande` insert con risposta (feedback nullo) | immediata (optimistic) |
| Feedback ricevuto | update `simulazione_domande` + punteggi | dopo lo streaming |
| Domanda successiva | update progress | immediata |
| Sessione completata | `simulazioni.status='completed'`, `voto_finale`, `ended_at` | immediata |

- Se una scrittura fallisce (offline): coda in `localStorage` (`cai_pending_ops`), flush al ritorno della connessione con `online` event. La UI non mostra mai errori per scritture in coda (solo un punto discreto *"Sincronizzazione in corso…"* vicino al cronometro).
- **Refresh a metà risposta:** la textarea si ripristina dal draft salvato (`beforeunload` → `localStorage` draft per domanda corrente). Mai perdere il testo.

### 8.4 Caricamento

- `simulation.html` è l'unica pagina ad alto impegno: niente script di libreria pesanti oltre a Supabase + telemetry (GSAP NON serve: tutte le animazioni sono CSS, e la versione attuale che usa GSAP va rimossa o limitata — decisione: **rimuovere GSAP** da simulation.html e usare CSS transitions + WAAPI dove serve count-up).
- **Lazy:** la question bank si carica dopo il paint (idle callback), il report SVG si costruisce solo al termine.
- **CLS=0:** skeleton mappati al layout reale; textarea con `resize: none` + autosize JS (niente jump).
- Obiettivi: LCP < 1.8s, INP < 200ms, bundle < 100KB gzip (solo supabase-js ~30KB + telemetry + CSS ~25KB).

---

## 9. Accessibilità (WCAG 2.2 AA operativo)

| Criterio | Implementazione in simulation.html |
|---|---|
| 1.3.1 info/relazioni | Le metriche sono liste `dl` o div con label associata; il punteggio non è mai SOLO colore (numero sempre presente) |
| 1.4.1 uso del colore | Colore dei punteggi (ok/warn/ink) è sempre accompagnato dal numero; il countdown warn ha anche il testo "90s" |
| 1.4.3 contrasto | Tutti i testi ≥4.5:1 (token esistenti rispettano il sistema); `--ink-faint` solo per caption non essenziali |
| 1.4.10 reflow | A 320px: la sessione resta una colonna; la top bar wrappa (cronometro sotto la barra progress); niente scroll orizzontale |
| 1.4.11 target | Bottoni ≥44px (Invia, Domanda successiva, CTA report); chevron accordion ≥24px con area click estesa |
| 2.1.1 tastiera | Tutto il flusso è keyboard: Tab tra elementi, Ctrl/⌘+Invio per inviare, Esc apre pausa, frecce per radiogroup modalità |
| 2.1.2 no trap | Modal e palette hanno focus trap con uscita ESC; il focus torna all'elemento che ha aperto |
| 2.4.1 bypass | Skip link all'inizio (`#sessione-main`) |
| 2.4.7 focus visibile | Ring ink 2px + offset 3px globale; il focus va gestito esplicitamente al cambio domanda (textarea) |
| 3.1.1 lingua | `lang="it"` (già) |
| 3.3.1/3.3.3 errori | Gli errori identificano il campo e danno il fix ("Il file supera 20 MB. Riducilo e riprova.") |
| 4.1.2 name/role/value | Radio modalità, progressbar, dialog, toggles: tutti con role e stato espliciti |
| **Screen reader** | `aria-live="polite"` su: area feedback (streaming), annuncio cambio domanda, cronometro a fine sessione. **Mai** `aria-live` sul countdown per-secondo |
| **Reduced motion** | Blocco globale + `REDUCED_MOTION` in JS (count-up, briefing) |

**Test obbligatori prima del rilascio:** keyboard-only full flow; VoiceOver/NVDA sui 5 stati principali (domanda, streaming, report, errore, pausa); zoom 200%; contrasto dei token semantici.

---

## 10. Free vs Pro — distinguere senza frustrare

### 10.1 Principi (dashboard-master §2, §5.3)

- Il Free vede il **100% del prodotto**: stessa qualità di domande, stesso feedback, stesso report. Il limite è solo il contatore (3/mese).
- **Mai** "sblocca le funzioni Pro" come framing. Il Pro è "porta l'allenamento a un altro livello".
- Una sola superficie di upgrade per schermata.

### 10.2 Superfici di upgrade (una per schermata)

1. **Setup:** selezionando "Difficile" da Free → pannello inline (non alert) con: anteprima di cosa fa la modalità + **una domanda campione reale dal suo bando** (generata al volo, costo ~$0.001) + CTA "Passa a Pro — 14,99€/mese" e via d'uscita "Continua con Standard".
2. **Report (Free):** card "Piano settimanale" sfocata (3 righe di anteprima non leggibili) con CTA Pro — **solo se** c'è un dato reale da agganciare (es. "Hai un trend positivo su Chiarezza: il piano settimanale lo sfrutta"). Se non c'è dato, la card non appare.
3. **Quota 0/3 (springboard):** vedi §10.3.

### 10.3 Springboard a quota 0 (mai un muro)

Alla pressione di "Inizia la simulazione" con quota esaurita:

```
┌─ Pannello (non alert) ────────────────────────────────┐
│ [eyebrow] Quota del mese usata                        │
│ [H2] Hai completato le 3 simulazioni gratuite.        │
│ [sub] Il Pro non toglie un limite: aggiunge potenza.  │
│                                                        │
│ 3 cose concrete (con preview visiva, MAI promesse):    │
│  • Simulazioni illimitate                              │
│  • Piano settimanale generato dal tuo bando            │
│  • Ripasso automatico delle domande deboli             │
│                                                        │
│ [Anteprima] "Guarda una domanda del tuo bando"         │
│   → genera davvero una domanda + feedback (costo basso)│
│                                                        │
│ [Passa a Pro — 14,99€/mese]   [Rinnovo il 1° [mese]]  │
└────────────────────────────────────────────────────────┘
```

- **Mai** countdown fake, mai sconti inventati, mai pressione (regola assoluta).
- Il prezzo si mostra sempre con l'ancora reale: *"meno di una lezione privata (25-50€/ora)"*.

---

## 11. Microcopy master (ogni stringa, in italiano)

> Regole tipografiche (ui-ux §5.7): virgolette « », "1°" per i giorni, numeri in `tabular-nums` nei dati, maiuscole solo per nomi propri.

| Contesto | Stringa |
|---|---|
| Gate — nessun bando | *"Per simulare l'orale serve il bando del tuo concorso. Da lì nascono le domande."* / CTA *"Carica il bando"* |
| Gate — ripresa | *"Hai interrotto «Standard · 12 domande» alla domanda 7."* / *"Riprendi"* / *"Nuova sessione"* |
| Setup H1 | *"Come vuoi allenarti?"* |
| Setup sub | *"Ogni sessione è completa: domande dal tuo bando, risposta libera e correzione della commissione."* |
| Setup microcopy | *"Si salva da sola: puoi chiudere e riprendere quando vuoi."* |
| Card bando | *"3 argomenti · caricato il 12 luglio"* / *"Cambia"* |
| Modalità Standard | *"12 domande sul tuo bando, una alla volta. Dopo ogni risposta il commissario ti dà punteggi e correzione. ~20 minuti."* |
| Modalità Rapida | *"6 domande, meno di 15 minuti. Ideale per iniziare o per i giorni pieni."* |
| Modalità Difficile | *"12 domande con interruzioni e approfondimenti, come un orale tosto. Timer per domanda nelle ultime 3. Incluso in Pro."* |
| Briefing 1 | *"Hai davanti il tuo bando. Le domande arriveranno da lì."* |
| Briefing 2 | *"Rispondi come davanti alla commissione: frase di apertura, sostanza, chiusura."* |
| Briefing 3 | *"Se ti blocchi: respira, riparti da quello che sai. Anche in aula."* |
| Salta briefing | *"Salta"* |
| Hint risposta | *"Come si struttura una buona risposta"* |
| Hint punto 1 | *"Apri con la risposta, non con la premessa."* |
| Hint punto 2 | *"Cita le fonti: legge, articolo, principio."* |
| Hint punto 3 | *"Chiudi con una frase che riporta alla domanda."* |
| Volume basso | *"Hai scritto N parole. Un orale vero vuole sostanza: prova ad argomentare di più, poi invia."* |
| Invia | *"Invia"* (icona ↑) + kbd *"Ctrl+Invio"* |
| Skeleton feedback | *"Il commissario sta leggendo la tua risposta…"* |
| Streaming lento | *"La risposta sta arrivando…"* (dopo 1.2s) |
| Difficile — tempo scaduto | *"Tempo scaduto: la risposta è stata inviata."* |
| Pausa | *"Riprendi"* / *"Salva ed esci"* / *"Termina la sessione"* |
| Modal termina | *"Vuoi terminare? Le risposte già date restano nello storico."* / *"Continua"* / *"Termina"* |
| Report H1 | *"Hai chiuso la sessione con 7,4."* |
| Report sub | *"1,2 punti sopra la tua media delle ultime simulazioni."* (solo se vero) |
| Etichette voto | *"Da lavorare"* (<6) · *"Solido"* (6-7.9) · *"Forte"* (≥8) |
| Report — punti forti | *"I tuoi punti forti"* |
| Report — da lavorare | *"Da lavorare"* |
| Report — ripassa | *"Ripassa questi argomenti"* |
| Report — rivedi | *"Rivedi le domande"* |
| Report — CTA | *"Rifai le domande deboli"* / *"Nuova simulazione"* / *"Piano settimanale"* |
| Report — trend vuoto | *"La prossima simulazione disegnerà il primo punto del tuo trend."* |
| Quota sidebar | *"Simulazioni questo mese"* · *"2/3"* · *"2 simulazioni rimaste · rinnovo il 1° ottobre"* · *"Quota del mese usata · rinnovo il 1° ottobre"* (già implementato) |
| Errore rete | *"La connessione è caduta. La tua risposta è al sicuro: riprova."* |
| Errore server | *"Il commissario è in ritardo. Riprova tra un momento."* |
| Errore quota server | *"Non riusciamo a verificare la quota. Riprova."* |
| Errore bando mancante | *"Il bando non è più disponibile. Torna alla dashboard e ricaricalo."* |

**Mai (checklist anti-slop):** "rivoluziona", "trasforma", "smart", "potenzia", "sblocca", "assistant", "magic", "powered by AI", "piattaforma", "ecosistema", frasi motivazionali ("ce la puoi fare!!"), "i nostri esperti".

---

## 12. Data model & integrazione

> Base: `dashboard-master.md §7`. Tutte le tabelle già esistono; la simulazione le consuma. RLS per-user già presente.

### 12.1 Letture

| Tabella | Uso | Query |
|---|---|---|
| `bandi` + `bandi_argomenti` | chip argomento, selezione attiva | `bandi_argomenti WHERE bando_id = attivo ORDER BY ordinamento` |
| `question_bank` | domande della sessione (mai rigenerate a runtime) | `WHERE bando_id = attivo ORDER BY RANDOM() LIMIT N` (o selezione per argomento debole nel "Rifai") |
| `simulazioni` | quota, ripresa, storico | esistenti |
| `simulazione_domande` | risposta + punteggi per domanda | insert/update per domanda |
| `streak` | — | non toccata dalla simulazione |

### 12.2 Scritture

`simulazioni` (insert all'avvio, update a fine):
- campi esistenti: `user_id`, `bando_id`, `modalita` (`standard`/`rapida`/`difficile`), `durata` (minuti), `status` (`in_progress`/`completed`), `voto_finale`, `started_at`, `ended_at`.
- **nuovo campo consigliato:** `ripresa_domanda_idx INT NULL` (indice della domanda corrente per la ripresa esatta).

`simulazione_domande` (una riga per domanda):
- `simulazione_id`, `question_bank_id`, `risposta`, `clarity`, `structure`, `content` (0-10), `lessico`, `pertinenza`, `feedback` (testo), `tokens_used`.

### 12.3 "Rifai le domande deboli"

- Query: `simulazione_domande WHERE simulazione_id = X AND (clarity < 6 OR structure < 6 OR content < 6)` → join `question_bank` per riusare il testo originale (costo zero).
- Nuova sessione con `modalita='ripasso'` (o flag su `simulazioni.modalita`), che nel report si etichetta *"Sessione di ripasso · 4 domande"*.

### 12.4 Telemetria (eventi, tabella `events` esistente)

| Evento | Quando | Payload |
|---|---|---|
| `sim_setup_viewed` | setup renderizzato | `{mode}` |
| `sim_started` | click Inizia | `{bando_id, mode, ritmo}` |
| `sim_question_viewed` | domanda mostrata | `{sim_id, idx}` |

| `sim_answer_sent` | risposta inviata | `{sim_id, idx, words}` |
| `sim_feedback_received` | streaming completato | `{sim_id, idx, latency_ms, scores}` |
| `sim_paused` / `sim_resumed` | pausa | `{sim_id}` |
| `sim_abandoned` | Salva ed esci senza tornare (48h) | `{sim_id, idx}` |
| `sim_completed` | report visto | `{sim_id, voto, duration_min}` |
| `sim_report_action` | click CTA report | `{action}` |
| `sim_upgrade_click` | click superfici Pro | `{surface}` |
| `sim_quota_springboard` | springboard visto | `{has_bando}` |

**Metriche di successo (obiettivo):** % utenti che completano la prima simulazione nel primo giorno (activation ≥ target), tempo medio sessione (10-20min), tasso di abbandono <15%, % Free a 3/3 che cliccano "Passa a Pro" ≥ 3%.

---

## 13. Matrice errori & recovery (nessuno stato morto)

| Errore | Dove | Messaggio | Recovery |
|---|---|---|---|
| No sessione Supabase | load | (redirect) | → `auth.html?mode=login` |
| Bando assente | gate | *"Per simulare l'orale serve il bando…"* | CTA → dashboard bandi |
| Quota 0 | setup | springboard §10.3 | anteprima o upgrade |
| Bando cancellato a metà sessione | risposta | *"Il bando non è più disponibile…"* | CTA → dashboard, sessione salvata |
| Rete caduta durante streaming | feedback | *"La connessione è caduta. La tua risposta è al sicuro: riprova."* | bottone Riprova (la risposta è persistita); dopo 3 retry: "Salva e riprendi" |
| Timeout 25s | streaming | *"Il commissario è in ritardo. Riprova tra un momento."* | Riprova idempotente |
| 429 quota/budget server | streaming | *"Non riusciamo a verificare la quota. Riprova."* | Riprova; se persistente → supporto |
| LLM output malformato | feedback | schema non valido → seconda chiamata (cascade) | se fallisce: punteggi calcolati localmente su euristiche + messaggio onesto *"Correzione parziale"* |
| Scrittura DB fallita | persistenza | nessun messaggio (coda locale) + punto *"Sincronizzazione in corso…"* | flush su `online` |
| Offline totale | load/setup | schermata offline dedicata con retry e data | retry button |
| Abbandono involontario (refresh) | sessione | draft preservato + banner ripresa al load | §5.1 gate punto 4 |

**Regola:** l'utente non deve MAI vedere un errore senza una via d'uscita. Ogni errore ha retry, alternativa o salvataggio.

---

## 14. Empty states (catalogo)

| Stato | Dove | Elementi |
|---|---|---|
| Nessun bando | gate/setup | `empty-mark` (icona doc) + title + text + CTA "Carica il bando" |
| Question bank vuota (bando non processato) | setup | *"Il bando è caricato ma le domande non sono ancora pronte."* + stato di elaborazione con skeleton vivo + CTA "Controlla la dashboard" |
| Nessuna simulazione precedente | report/confronto | la sezione confronto non appare; il report mostra solo dati della sessione corrente |
| Trend vuoto | report (agganciato a storico) | *"La prossima simulazione disegnerà il primo punto del tuo trend."* |
| Domande deboli assenti | "Rifai" | CTA disabilitato con motivo: *"Nessuna domanda sotto la soglia in questa sessione."* (caso positivo, non errore) |

---

## 15. Struttura del file per l'engineer (da implementare)

```
public/simulation.html          — shell SPA a 3 fasi + template
public/css/simulation.css       — riscritto sul design system cream/ink
                                (rimuovere gradienti/glass/blu residui della v. attuale)
public/css/simulation-rehaul.css— DA ELIMINARE (override blu → design system unico)
public/js/simulation.js         — NUOVO: tutta la logica (estrarre dall'HTML)
                                - state machine fasi (boot/setup/briefing/running/paused/report/error)
                                - sessione (domanda corrente, punteggi, timer)
                                - SSE client streaming
                                - persistenza (draft, coda ops, ripresa)
                                - rendering per fase (funzioni dedicate)
api/chat.js                     — SSE proxy (già esistente) o Edge Function ai-feedback
```

**Dipendenze:** `dash-common.js` (Dash: guard, supabase, toast, modal, animateCount, nextRenewalLabel, escapeHtml). Niente GSAP (CSS + rAF). Niente Tailwind (l'attuale simulation.css ne usa una copia: rimuovere).

**Ordine di implementazione consigliato:**
1. `simulation.js` state machine + gate + setup (con la question bank).
2. Sessione end-to-end con feedback mock (senza LLM) — verifica flusso e motion.
3. Integrazione SSE reale + persistenza DB + ripresa.
4. Report completo + "Rifai le domande deboli".
5. Springboard quota + superfici Pro.
6. Audit a11y + reduced-motion + performance (sezione 8/9).

---

## 16. Checklist finale anti-regressione

- [ ] La prima domanda appare in <1s dal click "Inizia" (da bank, mai LLM nel path critico)
- [ ] La risposta utente non si perde MAI (draft, coda, retry idempotente)
- [ ] Feedback: 3+2 dimensioni, count-up, streaming con caret, 1 suggerimento concreto, nessuna frase generica
- [ ] Nessun rosso per punteggi bassi (solo `--ink`); rosso riservato agli errori di sistema
- [ ] Cronometro, non countdown (tranne Difficile); nessun countdown fake
- [ ] Report: apertura calda → voto → punti forti → da lavorare → prossimo passo (peak-end)
- [ ] Tutti i numeri reali; confronti solo col proprio storico
- [ ] "Salva e riprendi" funziona a qualsiasi domanda (refresh incluso)
- [ ] Free vede il 100% del prodotto; springboard mai muro; 1 sola superficie upgrade per schermata
- [ ] WCAG AA: tastiera completa, aria-live corrette, focus gestito, reduced-motion, contrasto token
- [ ] CLS=0, LCP<1.8s, INP<200ms, bundle<100KB gzip
- [ ] GSAP e Tailwind rimossi; zero gradienti/glass/glow; design system cream/ink unico
- [ ] Telemetria degli 11 eventi §12.4 attiva
- [ ] Zero numeri inventati, zero frasi motivazionali, zero dark pattern

---

## 17. Decisioni aperte (da confermare, NON bloccanti per l'implementazione)

1. **Voice input** per la risposta (feature futura; cambia il modello di costo: richiede STT). L'architettura del feedback non cambia: si valuta il testo trascritto.
2. **Cascade provider** del feedback: Groq 70B → Gemini Flash fallback (dash-master §3.2) da calibrare con test reali in italiano.
3. **Soglia "domanda debole"**: <6 su una dimensione (default) — da validare con dati reali.
4. **"Rifai le domande deboli" conta quota?** Default: sì (1 simulazione). Alternativa da valutare: non contare per il Free (migliore retention, costo irrisorio).

---

## 18. Fonti di riferimento

- Roediger & Karpicke (2006), *The Testing Effect* · Pastötter & Bäuml (2014), *Forward testing effect*
- Karpicke & Blunt (2011), *Retrieval practice vs. concept mapping* · Bjork & Bjork (2011), *Desirable difficulties*
- Sweller (1988), *Cognitive load theory* · Ericsson et al. (1993), *Deliberate practice*
- Hattie (2009) · Shute (2008), *Feedback timing* · Cepeda et al. (2006), *Spacing effect*
- Maier et al. (2021), *Test anxiety, self-efficacy, mental images* · Ringeisen et al. (2019)
- Kahneman et al. (1993), *Peak-end rule* · Redelmeier & Kahneman (1996)
- Dweck (2007), *Growth mindset* · Settles (2016), *Duolingo HLR spaced repetition*
- `md/dashboard-master.md` · `md/ui-ux-master.md` · `UX-AUDIT-SIMULATION.md` (audit della v. attuale)
