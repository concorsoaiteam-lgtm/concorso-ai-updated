# Come far sembrare la simulazione un vero colloquio con la commissione

**Report di ricerca** — 8 agosto 2026
**Scopo:** specifica di comportamento per la modalità vocale di ConcorsoAI. Niente grafica per ora: prima il comportamento, poi l'interfaccia.

> Questo documento è una **specifica**: non implementare nulla finché non lo si è letto insieme. Ogni sezione termina con una "Regola" concretamente implementabile.

---

## 1. Cosa rende realmente naturale una conversazione

La ricerca sul turn-taking umano è unanime su un punto: **la naturalezza non viene dalla voce, ma dal timing e dalla sincronizzazione dei turni**.

### I fatti empirici

- **Il gap medio tra i turni è di ~200 ms** (Stivers et al., 2009, studio cross-culturale su 10 lingue). Sotto i ~300 ms un passaggio di turno è percepito come fluido; oltre i 500–700 ms comincia a sembrare esitazione, riluttanza o lag tecnico.
- **È un paradosso cognitivo**: produrre una risposta richiede ≥600 ms di pianificazione (Indefrey & Levelt, 2004), quindi gli umani **non aspettano che l'altro finisca**: proiettano in anticipo il punto in cui il turno finirà (*Transition Relevance Place*, Sacks/Schegloff/Jefferson 1974) e lanciano la risposta in sovrapposizione.
- **Gli umani non usano il silenzio come segnale di fine turno.** Usano un fascio di indizi: completezza sintattica (se dico "la capitale della Francia è…" il turno non è finito anche se mi fermo), prosodia (caduta di F0 finale, allungamento dell'ultima sillaba), e predizione del contenuto (Magyari & de Ruiter, 2012; Gravano & Hirschberg, 2011).
- **Conseguenza diretta:** un sistema che considera "500 ms di silenzio = ho finito" è sbagliato per costruzione. O interrompe troppo presto (mentre il candidato sta cercando il termine giusto), o introduce troppa latenza (aspetta il silenzio anche quando la frase era già completa).

### Cosa significa per noi

La commissione non deve "rispondere", deve **partecipare a un turno**: parla → cede la parola in modo evidente → ascolta attivamente → reagisce nel momento giusto. Il candidato deve sentire che il sistema **sa** quando ha finito, senza dover aspettare in silenzio.

> **Regola 1.** L'endpointing (fine del turno utente) non può essere una soglia fissa di silenzio. Deve essere *dinamico*: accorciato se la frase è sintatticamente completa, allungato se c'è un filler ("ehm…", "allora…") o una struttura incompleta.

---

## 2. Cosa stiamo sbagliando oggi (stato reale del codice)

Analisi onesta dell'implementazione attuale (round 67–70). Il prodotto è già buono: il problema è che è una *chat con il microfono*, non un *colloquio*.

| Cosa facciamo oggi | Perché è il punto debole |
|---|---|
| **Endpointing a soglia fissa** (Silero VAD client-side, o timer di silenzio come fallback) | Interrompe il candidato che sta cercando una parola ("ehm… il procedimento… ecco, l'articolo…") o lo lascia in silenzio quando ha già finito. È esattamente il difetto che la letteratura descrive. |
| **Nessuna trascrizione incrementale** | Il testo del candidato appare solo a fine registrazione. L'utente non vede il sistema "ascoltare" in tempo reale: metà della percezione di presenza si perde. |
| **Feedback dopo ogni risposta, anche in simulazione** | Il panel feedback con metriche e "Domanda successiva" appare a ogni scambio: ricorda all'utente che è in un'app AI, non davanti a una commissione. La ricerca (sez. 7) dice il contrario: in simulazione il feedback va a fine sessione. |
| **La commissione è muta durante la risposta** | Niente backchannel, niente "capisco", niente segnale che sta seguendo. C'è solo l'anello *is-awaiting* sul microfono. |
| **Testo e voce non sincronizzati** | La domanda viene letta dal TTS ma il testo non avanza con la lettura: l'utente o ascolta o legge. La ricerca multimodale (sez. 5) dice che devono viaggiare insieme. |
| **"La commissione sta riflettendo" solo come etichetta** | Lo stato *reflecting* maschera la latenza (bene), ma è solo testo: nessun segnale acustico/visuale progressivo, quindi oltre ~1s il vuoto si sente. |
| **Il pannello registratore è un overlay separato** | La conversazione si "spegne" quando apri il registratore. In un colloquio, ascolto e risposta devono essere lo stesso momento, non schermate diverse. |
| **STT non streaming (server)** | L'audio va a Deepgram solo a fine registrazione: latenza ~1–2s prima del testo finale. Accettabile, ma va mascherata meglio (interim locali). |

**Punti che già funzionano bene (da non toccare):**
- State machine orale già presente: `q-speaking → user-turn → reflecting → fb-speaking`, mai un vuoto.
- La voce della commissione parte subito in modalità vocale (auto-enable TTS + warmup).
- Player completo: pausa/riprendi/stop/replay/velocità, waveform reale via AnalyserNode, sintesi per frasi con pause naturali.
- Barge-in: avviare il microfono ferma subito il TTS.
- STT server-side con fallback (Deepgram nova-3 → Groq whisper-large-v3-turbo), niente chiavi nel frontend.

> **Regola 2.** Non rifare la macchina a stati: migliorarla. Manca: endpointing dinamico, backchannel, sincronizzazione testo+voce, e la *separazione netta tra simulazione e feedback*.

---

## 3. Turn-taking: le regole concrete

### 3.1 Endpointing (fine del turno del candidato)

Il sistema deve decidere quando il candidato ha finito usando **tre segnali insieme**, non uno solo:

1. **Silenzio** (VAD): ma con timeout *variabile*.
2. **Completezza del testo** (trascrizione incrementale): se l'ultima frase è sintatticamente completa (punteggiatura finale, struttura soggetto-verbo-oggetto chiusa), il timeout si accorcia.
3. **Presenza di filler**: se l'ultimo token è "ehm", "uhm", "allora", "cioè", "ecco", "praticamente" → il turno NON è finito, si allunga il timeout.

Valori di riferimento (ricerca LiveKit / OpenAI Realtime / latenza voce):

| Condizione | Timeout di silenzio |
|---|---|
| Frase sintatticamente completa rilevata | **~300–400 ms** |
| Conversazionale/titubante (filler, struttura aperta) | **~1200 ms** |
| Tetto massimo assoluto (mai oltre) | **~2500 ms** |

In pratica, con un budget nullo, l'euristica è implementabile client-side: il VAD Silero c'è già; basta decidere il timeout in base a ciò che l'ASR incrementale (Web Speech API `interimResults`) ha prodotto fino a quel momento. Nessun modello nuovo, nessun costo.

> **Regola 3.** Timeout VAD dinamico: frase completa → 400 ms; filler/incompleto → 1200 ms; cap a 2500 ms. Nessuna soglia fissa.

### 3.2 Tempi di risposta della commissione

- Target time-to-first-word (TTFW) della commissione: **< 600 ms** ideale, **< 800 ms** accettabile per il nostro stack low-budget.
- Se il backend (LLM + valutazione) impiega **> 400–500 ms**, la latenza va **mascherata**, mai subita in silenzio:
  - un **segnale di riflessione** immediato (visuale: il palco passa a "riflette" appena finisci di parlare — già fatto);
  - oltre ~1,2 s, un **micro-filler acustico** o un suono discreto di "pensiero" (es. un "Mmh…" sintetizzato in cache, o un tic sonoro minimale, volume bassissimo). La ricerca ElevenLabs/Vapi chiama questo *soft timeout*.
- **Interruzioni (barge-in):** se il candidato parla mentre la commissione parla, il TTS deve fermarsi entro **100–150 ms** (già fatto in V.start, da rifinire). Dopo un'interruzione, se l'utente ha prodotto **zero parole** entro 2 s, la commissione riprende da dove era — evita le "interruzioni fantasma" da tosse o rumore.

> **Regola 4.** Budget di latenza: endpointing 400 ms + STT ~150 ms + primo token LLM ~200 ms + TTS ~150 ms. Oltre 500 ms di elaborazione: stato "riflette" istantaneo + micro-filler oltre ~1,2 s.

### 3.3 Ritmo della sessione

Un orale vero ha **pressione e ritmo**: la commissione non concede pause lunghe. Dopo la risposta, la domanda successiva deve arrivare con un gap percepito naturale (200–300 ms dopo la fine della reazione della commissione). In modalità simulazione la commissione **non deve chiedere conferma** ("Vuoi passare alla prossima?") — decide lei, come nella realtà.

> **Regola 5.** In simulazione la commissione governa il ritmo: niente bottoni "avanti" e niente conferme. In allenamento invece l'utente controlla il passo.

---

## 4. La commissione deve sembrare presente (backchannel e acknowledgment)

### Cosa dice la ricerca

- I backchannel ("mm-hm", "okay", cenni del capo) sono segnali del **listener** che non ambiscono a prendere il turno: dicono "ti sto seguendo, continua" (Yngve 1970; Ward & Tsukahara 2000 — i listener li piazzano in corrispondenza di *cali prosodici* del parlante).
- In conversazione naturale: **6–12 al minuto**. Troppi per una commissione.
- In un esame orale i backchannel sono **appropriati solo in forma neutrale e procedurale**:
  - ✔ "Va bene", "Prego", "Vada avanti", "Può proseguire", "La ascolto" → conduzione dell'esame.
  - ✔ Un minimale "Mm-hm" quando il candidato si blocca > 2,5 s a cercare il termine → "ti seguiamo, prendi tempo", evita l'interruzione prematura.
  - ✘ **MAI** "Perfetto!", "Esatto!", "Molto bene" a metà risposta: **filtrano un giudizio prematuro** e rompono la neutralità della commissione.
- La presenza percepita però non è solo vocale: la **social presence** (Short, Williams & Christie 1976; Gunawardena 1995) nasce da *risposta contingente* (reagisce a ciò che dico), *variazione prosodica* e *feedback di ascolto visibile*. Un indicatore di ascolto ben fatto sostituisce gran parte dei backchannel verbali senza sporcare l'audio.

### Regole per ConcorsoAI

| Modalità | Backchannel vocali | Segnali visivi |
|---|---|---|
| **Simulazione** | 0–1 per risposta, solo procedurali: "Va bene", "Prego" all'inizio; "Mm-hm" se il candidato si blocca >2,5 s | Stato di ascolto sempre attivo (waveform del microfono + label "Ti ascolto" / "Ti seguiamo") |
| **Allenamento** | 1–2: "Capisco", "Ho inteso", poi correzione immediata | Stesso + evidenza di ciò che ha capito (riprende le tue parole) |

> **Regola 6.** Frequenza backchannel: **≤2 al minuto**, solo neutri e procedurali, mai valutativi. Il grosso della presenza è visivo: waveform viva + label di ascolto, sempre.

---

## 5. Voce + testo: le due modalità devono lavorare insieme

Questo è il requisito che più distingue il prodotto. La ricerca (Google Conversation Design, Linee guida smart display, Live Transcribe; Mayer & Moreno) dà indicazioni precise:

### 5.1 Perché il testo sincronizzato è giusto qui (e quando invece fa male)

- **Mayer & Moreno — Redundancy Principle:** mostrare *parola per parola* lo stesso testo che viene letto è controproducente in contesti semplici (sovraccarica il canale visivo).
- **MA l'eccezione si applica a noi:** la ridondanza *aiuta* quando il materiale è **denso, tecnico, formale** (una domanda di concorso lo è), quando il parlato è **transitorio** (se perdi una parola per il rumore, non la recuperi più), e quando l'audio potrebbe non essere riproducibile (accessibilità, ambiente rumoroso). Una domanda d'esame è esattamente il caso in cui testo+voce insieme **aiutano**.
- **Google Live Transcribe (ricerca con Gallaudet):** non mostrare livelli di confidenza colorati (verde/giallo/rosso): distraggono. Distinguere invece **testo provvisorio** (dimmed) da **testo confermato** (opaco).

### 5.2 Come deve essere presentato: la "zona a tre livelli"

Non una chat. Tre zone gerarchiche:

1. **Il palco (ephemeral, in primo piano):** la frase corrente della commissione, in una **"exam prompt card"** centrata nella parte alta della pagina, tipografia grande (≥28–32 pt, righe spaziose). Mentre il TTS parla, **il testo avanza a blocchi di frase** (la frase in corso è evidenziata, le precedenti si attenuano). È un *teleprompter*, non un bubble di chat.
2. **La cronologia (fading, in basso):** gli scambi passati collassano in una riga compatta e semi-trasparente: `Q1 — domanda… → A1 — risposta…`. Consultabile, non dominante. Scroll up = pausa dello scroll automatico + pill "Torna al vivo".
3. **L'ancora di stato (ambient):** waveform/label che dice sempre chi sta parlando (commissione / candidato / riflettendo).

### 5.3 Sincronizzazione pratica (con TTS gratuito)

Il TTS on-device (Kokoro) **non espone timestamp parola-per-parola**. Ma la sintesi è già fatta **frase per frase** (per le pause naturali): quindi la sincronizzazione si ottiene **a livello di frase**, non di parola — al `play` di ogni frase, evidenzi la frase corrispondente. Costo: zero. Effetto: l'utente vede la domanda "formarsi" mentre viene letta.

Per il candidato: se il microfono usa la Web Speech API (quando disponibile), mostra **interim live** (testo provvisorio dimmed che si conferma); con il registratore→server STT, mostra "Ti sto ascoltando…" con waveform viva e il testo confermato a fine turno.

> **Regola 7.** Sincronizzazione **per frase** (non per parola, non fattibile gratis): la frase in corso si evidenzia mentre il TTS la legge. Interfaccia a 3 livelli: palco → cronologia compatta → stato ambient. Mai colori di confidenza.

---

## 6. L'esperienza del candidato: il flusso di un orale

### 6.1 Comportamento (non grafica)

Un colloquio vero è una **catena di turni**, non una sequenza di messaggi:

```
[1] La commissione annuncia e pone la domanda   → parla (testo sincronizzato)
[2] Cede la parola in modo esplicito            → "Tocca a te" + invito al microfono
[3] Il candidato risponde                       → ascolto attivo (waveform + interim)
[4] La commissione riflette (mai in silenzio)   → stato "riflette" + micro-filler se serve
[5] La commissione reagisce                     → in ALLENAMENTO: feedback immediato
                                                   in SIMULAZIONE: "Va bene." + segue
[6] Turno successivo, senza attriti             → gap 200–300 ms, mai bottoni "avanti"
```

### 6.2 Cosa vede l'utente in ogni fase

| Fase | Cosa vede | Cosa NON deve vedere |
|---|---|---|
| Commissione parla | Palco con la domanda che si evidenzia per frasi, waveform del TTS, label "La commissione" | Una chat che scorre in basso |
| Fine della domanda | Transizione morbida al turno del candidato: "Tocca a te" + invito al microfono (anello) | Un silenzio morto |
| Candidato risponde | Waveform viva + testo provvisorio che si conferma | Un overlay che "spegne" la conversazione |
| Elaborazione | "La commissione sta riflettendo…" + micro-filler oltre 1,2 s | Spinner generico |
| Commissione reagisce | Voce + palco di nuovo attivo (in allenamento: anche panel feedback) | Punteggi durante la simulazione |
| Passaggio al turno | Gap naturale 200–300 ms, domanda successiva | Bottone "Domanda successiva →" in simulazione vocale |

> **Regola 8.** In modalità vocale la risposta NON deve aprire un overlay: l'ascolto è la continuazione naturale della domanda, nello stesso spazio.

---

## 7. Feedback: separare la SIMULAZIONE dal FEEDBACK

### La ricerca (solida e convergente)

- **Hattie & Timperley (2007), modello del feedback:** il feedback potente agisce su *processo* e *autoregolazione* ("come hai ragionato"), non sul sé ("bravo"). Il feedback di solo livello *task* ("sbagliato/giusto") è debole.
- **Kulik & Kulik (1988):** il feedback **immediato** è potentissimo nell'istruzione assistita e nel correggere errori. Però…
- **Butler & Roediger (2008) e il testing effect (Roediger & Karpicke 2006):** il recupero (*retrieval*) è di per sé il motore della memoria. **Interrompere ogni recupero con una correzione rompe lo sforzo** e la "generazione" della risposta; il feedback ritardato consolida meglio la traccia in contesti complessi.
- **Pretesting effect (Mera et al., 2025):** provare a rispondere *prima* di sapere se hai sbagliato è ciò che crea apprendimento; il feedback immediato dopo serve a correggere lo schema.
- **Esami orali veri (viva voce strutturato, PMC6436443):** la commissione non valuta a ogni risposta; usa domande progressive e rubriche, e **resta neutrale** per non condizionare il candidato. Il voto arriva alla fine.

### La conclusione per le due modalità del prodotto

| | SIMULAZIONE (concorso) | ALLENAMENTO (ripasso/errore) |
|---|---|---|
| **Feedback per risposta** | **NO.** La commissione reagisce in modo naturale e prosegue. Niente metriche, niente punteggi, niente pannelli. | **SÌ.** Correzione immediata, a livello di processo ("il tuo ragionamento salta il passaggio X"), subito dopo la risposta. |
| **Feedback a fine sessione** | **SÌ, completo e personale** (report con punti forti/deboli, voto, errori, consigli — già esiste). Il testing effect giustifica: l'utente ha fatto uno sforzo di recupero senza stampelle. | Sì, riepilogo degli errori superati/rimasti. |
| **Sensazione dell'utente** | "Stavo facendo un esame." | "Sto imparando, mi stanno correggendo." |

Questo risolve anche il difetto attuale: il panel feedback a ogni risposta in modalità vocale *è* il motivo per cui sembra un'app AI. In simulazione: la commissione ascolta, dice "Va bene." (o fa una domanda di approfondimento se la risposta è stata debole — comportamento reale della commissione), e passa oltre. Il feedback vero arriva nel report finale.

> **Regola 9.** In simulazione: zero feedback intermedi, la commissione conduce. In allenamento: feedback immediato e processuale. Il report finale è l'unico momento valutativo in simulazione.

---

## 8. Interfaccia: comportamento per fase (specifica, non grafica)

Sintesi operativa di tutto quanto sopra, in ordine temporale:

1. **La commissione parla.** Il palco mostra la domanda che si illumina per frasi in sincrono col TTS. La cronologia è compatta sotto.
2. **Cede la parola.** Anello sul microfono + "Tocca a te" + microfono protagonista. Nessun bottone extra.
3. **Il candidato risponde.** Waveform viva (AnalyserNode), testo provvisorio live quando possibile, timer. La domanda resta **leggibile** (nessun blur, già risolto al round 67).
4. **End-of-turn.** Timeout dinamico (Regola 3). Il sistema non interrompe chi sta cercando la parola.
5. **Riflette.** Stato immediato "La commissione sta riflettendo…"; oltre ~1,2 s un micro-filler discreto. L'interfaccia non si congela mai.
6. **Reagisce.** Allenamento: feedback vocale + panel, poi domanda successiva quando l'utente è pronto. Simulazione: "Va bene." o approfondimento, poi turno successivo con gap 200–300 ms.
7. **Interruzione.** Il candidato parla mentre la commissione parla → TTS si ferma in ~100 ms; se l'utente non produce parole in 2 s, la commissione riprende.
8. **Fine sessione.** La commissione chiude ("Grazie, concludiamo qui.") → report. In simulazione il report è l'unico momento valutativo.

---

## 9. Architettura consigliata (budget ≈ zero)

La ricerca converge su un'architettura a **cascata leggera, tutta client-side per l'interazione**, con il server solo per STT e LLM. È esattamente lo stack che già abbiamo, con tre aggiunte piccole.

```
Browser (client)                          Server (Vercel Functions)
┌───────────────────────────────────┐    ┌──────────────────────────┐
│ Silero VAD (già c'è)              │    │ /api/stt (già c'è)       │
│   → endpointing DINAMICO          │    │   Deepgram nova-3        │
│   (timeout per completezza testo) │    │   → Groq whisper (fall.) │
│ Web Speech API interim (se disp.) │    │ /api/chat (già c'è)      │
│   → testo provvisorio live        │    │   → OmniRouter/LLM       │
│ Kokoro TTS on-device (già c'è)    │    │   → fallback provider    │
│   → sintesi per frase             │    └──────────────────────────┘
│   → SINCRO testo (frase attiva)   │
│ Player Web Audio (già c'è)        │
│   → waveform reale (AnalyserNode) │
│ State machine orale (già c'è)     │
│   → + backchannel e filler        │
└───────────────────────────────────┘
```

**Aggiunte (tutte low-cost):**
1. **Endpointing dinamico** — pura logica client-side sul risultato dell'ASR incrementale. €0.
2. **Sincro testo↔voce per frase** — riuso della segmentazione TTS già esistente. €0.
3. **Backchannel procedurali + micro-filler** — frasi corte in cache, sintetizzate all'avvio (o riusando frasi già sintetizzate). €0.
4. **Gating feedback** — un flag `S.mode === "simulazione"|"allenamento"` che decide se mostrare/sintetizzare il feedback per risposta. €0.
5. **STT incrementale vero** (Deepgram streaming) — **rimandato**: costa e aggiunge complessità. Il fallback "Web Speech interim quando disponibile + STT server alla fine" copre l'80% del beneficio a costo zero.

**Non serve**: nessun modello nuovo, nessun servizio nuovo, nessuna infra. La memoria sintetica e il diario errori restano come sono.

---

## 10. Cosa NON introdurre (anti-pattern)

1. **✘ Backchannel valutativi a metà risposta** ("Perfetto!", "Esatto!") — rompono la neutralità e filtrano il giudizio.
2. **✘ Sincronizzazione parola-per-parola** — richiede timestamp dal TTS; con TTS gratuito non è affidabile, e Mayer & Moreno dicono che in testi semplici ridondanza eccessiva peggiora. Frase-per-frase è il punto di equilibrio.
3. **✘ Streaming STT completo ora** — costo/complessità vs beneficio marginale dopo il punto 5 della sezione 9.
4. **✘ Feedback a ogni risposta in simulazione** — è la causa principale dell'effetto "app AI".
5. **✘ Effetti RGB/neon/glow, orb che pulsa** — la presenza si costruisce col timing, non con la grafica.
6. **✘ Bottoni "Domanda successiva →" in simulazione vocale** — la commissione decide, non l'utente.
7. **✘ Overlay registratore che nasconde la domanda** — il colloquio è un flusso unico; la domanda resta sempre leggibile.
8. **✘ "Hmm?" generico come gestione errore** — preferire il *ripristino parziale* (sez. 11).

---

## 11. Gestione degli errori (senza rompere l'immersione)

La ricerca sui sistemi di dialogo (Skantze 2021) è netta: i fallimenti di riconoscimento vanno recuperati **nel contesto**, non con reprompt robotici.

1. **ASR debole/parziale:** se la trascrizione è vuota o corta, la commissione dice "Non ho sentito bene, può ripetere?" — con la frase *precedente* del candidato riconosciuta parziale, mai "errore 500".
2. **Microfono negato:** stato chiaro e recuperabile, non un crash (già gestito — verificare il messaggio).
3. **TTS non disponibile (Kokoro non caricato / rete):** fallback `speechSynthesis` (già c'è) e, in ultima istanza, **modalità solo testo** con la stessa sincronizzazione — l'esperienza non muore se manca l'audio.
4. **Backend giù (/api/stt o /api/chat):** retry 1, poi messaggio umano della commissione ("La rete è instabile, riprovo") — mai un alert di sistema.
5. **Interruzione fantasma:** l'utente parla 200 ms (tosse) mentre la commissione parla → la commissione **riprende** da dov'era invece di restare in silenzio.
6. **Mai mostrare errori HTTP crudi** in modalità vocale: la commissione è il solo "coperchio" dell'app.

---

## 12. Costi e complessità

| Proposta | Impatto sulla naturalezza | Complessità | Costo | Priorità |
|---|---|---|---|---|
| Endpointing dinamico (timeout per completezza testo) | ⭐⭐⭐⭐⭐ (interrompere il candidato è il difetto n°1) | Bassa (logica client-side) | €0 | **1** |
| Gating feedback: simulazione senza feedback per risposta | ⭐⭐⭐⭐⭐ (elimina l'effetto "app AI") | Bassa (flag di modalità) | €0 | **2** |
| Sincro testo↔voce per frase (palco teleprompter) | ⭐⭐⭐⭐ (il requisito "leggere mentre ascolto") | Media (riuso segmentazione TTS) | €0 | **3** |
| Zona a 3 livelli: palco / cronologia compatta / stato | ⭐⭐⭐⭐ | Media (CSS/layout) | €0 | **4** |
| Backchannel procedurali + micro-filler oltre 1,2 s | ⭐⭐⭐ (presenza commissione) | Media (cache frasi TTS) | €0 | **5** |
| Interim live del candidato (Web Speech quando disponibile) | ⭐⭐⭐ (l'utente si vede ascoltato) | Media (fallback doppio motore) | €0 | **6** |
| Ripresa commissione dopo interruzione fantasma | ⭐⭐ | Bassa | €0 | 7 |
| STT streaming server-side (Deepgram streaming) | ⭐⭐⭐ ma marginale dopo #6 | Alta | € (streaming minuti) | Rimandata |
| Modello di turn-taking addestrato | ⭐⭐⭐⭐ teorico | Altissima | €€€ | **No** (l'euristica copre il 90%) |

**Verdetto:** con ~7 modifiche a bassa complessità e costo zero si ottiene la stragrande maggioranza del realismo. Il collo di bottiglia non è la tecnologia: è il **timing** (endpointing, gap tra turni) e la **separazione dei momenti** (simulazione ≠ feedback).

---

## 13. Proposta finale concreta per ConcorsoAI

**In una frase:** la modalità vocale deve passare da *chat con microfono* a *colloquio a turni* dove la commissione parla e viene letta in sincrono, ascolta con evidenza (waveform + testo provvisorio), riflette senza mai far sentire il vuoto, conduce la simulazione senza feedback intermedi e — solo in allenamento — corregge subito, a livello di processo.

Le 7 modifiche, in ordine (tutte €0, tutte misurabili):

1. **Endpointing dinamico** client-side (Regola 3).
2. **Gating feedback per modalità** (Regola 9): simulazione → nessun feedback per risposta; allenamento → feedback immediato processuale.
3. **Palco a 3 livelli** con sincro testo↔voce per frase (Regola 7).
4. **Backchannel procedurali** (Regola 6) + **micro-filler** oltre 1,2 s (Regola 4).
5. **Interim live** del candidato quando disponibile (Regola 8).
6. **Ripresa dopo interruzione fantasma** (sez. 11).
7. **Ritmo guidato dalla commissione** in simulazione: gap 200–300 ms, niente bottoni "avanti" (Regola 5).

Il test di accettazione è uno solo: **un utente che chiude la sessione dice "sembrava davvero un orale", non "che bella AI che risponde"**.

---

## 14. Fonti verificabili

### Turn-taking e timing
- Sacks, Schegloff & Jefferson (1974), *A Simplest Systematics for the Organization of Turn-Taking for Conversation*, Language 50(4) — il modello base dei turni.
- Stivers et al. (2009), *Universals and cultural variation in turn-taking in conversation*, PNAS 106(26) — gap mediano ~200 ms. https://pmc.ncbi.nlm.nih.gov/articles/PMC2705608/
- Levinson & Torreira (2015), *Timing in turn-taking and its implications for processing models of language*, Frontiers in Psychology 6:731 — il paradosso della produzione ≥600 ms.
- Magyari & de Ruiter (2012), *Prediction of turn-ends based on anticipation of upcoming words*, Frontiers in Psychology 3:376.
- Gravano & Hirschberg (2011), *Turn-taking cues in task-oriented dialogue* (Computer Speech & Language) — prosodia e completezza come indizi di fine turno.
- Skantze (2021), *Turn-taking in conversational systems and human-robot interaction: A review*, Computer Speech & Language. https://www.sciencedirect.com/science/article/pii/S088523082030111X
- Meyer (2023), *Timing in Conversation*, Journal of Cognition. https://journalofcognition.org/articles/10.5334/joc.268
- Macháček, Žmolíková & Szöke (2023), *Turning Whisper into Real-Time Transcription System* (Whisper Streaming / LocalAgreement), arXiv:2307.14743.
- LiveKit — *Turn Detection for Voice Agents* e docs *Turns Overview* (VAD, endpointing, min/max delay, dynamic). https://livekit.com/blog/turn-detection-voice-agents-vad-endpointing-model-based-detection · https://docs.livekit.io/agents/logic/turns/

### Backchannel, presenza, prodotti voce
- Ward & Tsukahara (2000), *Prosodic features which cue back-channel responses in English and Japanese*, Journal of Pragmatics.
- Yngve (1970), *On getting a word in edgewise* — definizione dei backchannel.
- Short, Williams & Christie (1976), *The Social Psychology of Telecommunications* — Social Presence Theory. https://en.wikipedia.org/wiki/Social_presence_theory
- Gunawardena (1995), *Social presence theory and implications for interactive online learning environments*.
- ElevenLabs — *Conversation Flow & Soft Timeout* (filler automatici oltre soglia, Turn Eagerness). https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow
- Deepgram — *Voice agent interruption handling & turn-taking* (barge-in). https://deepgram.com/learn/elevenlabs-barge-in-interruptions-turn-taking

### Multimodale (voce + testo)
- Google Conversation Design / smart display guidelines (distanza di lettura, font ≥32 pt, un'informazione primaria per volta). https://designers.google / https://developers.google.com
- Google Live Transcribe (ricerca con Gallaudet: niente colori di confidenza, testo provvisorio vs confermato).
- Mayer & Moreno, *Cognitive Theory of Multimedia Learning* — Redundancy Principle e le eccezioni (testo denso/transitorio).
- ChatGPT Advanced Voice (nessun transcript live) vs Gemini Live (`output_audio_transcription` server-side) vs ElevenLabs Reader (parola per parola).

### Feedback e apprendimento
- Hattie & Timperley (2007), *The Power of Feedback*, Review of Educational Research. https://journals.sagepub.com/doi/abs/10.3102/003465430298487
- Kulik & Kulik (1988), *Timing of feedback and verbal learning* — meta-analisi.
- Butler & Roediger (2008), *Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing*, Memory & Cognition. https://link.springer.com/article/10.3758/MC.36.3.604
- Roediger & Karpicke (2006), *Test-enhanced learning: taking memory tests improves long-term retention*, Psychological Science.
- Mera et al. (2025), *The Pretesting Effect: Exploring the Impact of Feedback and Final Test Timing*. https://pmc.ncbi.nlm.nih.gov/articles/PMC12292081/
- Struttura viva voce: *Structured and unstructured viva voce assessment* (Imran et al., 2019). https://pmc.ncbi.nlm.nih.gov/articles/PMC6436443/
- IELTS Speaking Band Descriptors (fluency/coherence, lessico, grammatica, pronuncia). https://takeielts.britishcouncil.org/sites/default/files/ielts_speaking_band_descriptors.pdf

---

*Fine del report. Da usare come specifica per il prossimo round di implementazione.*
