# Prompt per rivoluzionare ConcorsoAI

## La missione

ConcorsoAI deve passare da "app fatta da uno bravo" a **"prodotto per cui la gente paga €100/mese senza pensarci due volte"**.

I candidati ai concorsi pubblici italiani già spendono:
- €200-500 per corsi preparazione
- €50-100/h per ripetizioni private
- €30-50 per libri e manuali
- Mesi di ansia e insicurezza

Un commissario AI che li interroga 24/7 **vale €100/mese** — ma solo se sembra, suona e si comporta come un prodotto serio, non un progettino.

## Per chi lo scrivi

Questo prompt va a **Opus**, un modello AI fortissimo. Deve eseguire tutto in autonomia, senza chiedere chiarimenti. Ogni task è auto-contenuto.

## Il tuo ruolo

Sei un product builder. Devi trasformare ConcorsoAI in un prodotto che un investitore guarda e dice "ok, qui c'è qualcosa". Un utente aprirebbe il portafoglio senza esitare.

## Come eseguire

1. Prima leggi TUTTI i file nella sezione "File da leggere" in fondo — non puoi modificare ciò che non conosci
2. Poi esegui i task NELL'ORDINE: Bug → Landing → Simulation → Dashboard → Auth
3. Ogni task va completato e verificato prima del successivo
4. Se un task richiede un'ora e non finisce, passa al prossimo e segna l'eccezione
5. Alla fine, fai un giro su tutte le pagine e verifica che non ci siano errori in console

## Exit criteria (quando hai finito)

Il prompt è completo quando:
- [ ] Apro index.html e in 3 secondi capisco cosa fa ConcorsoAI e voglio provarlo
- [ ] Faccio una simulazione completa (config → briefing → chat → summary) senza intoppi
- [ ] La dashboard mostra stats reali dopo la simulazione
- [ ] Lo storico mostra il grafico con punti
- [ ] Apro il sito da mobile (375px) e tutto è usabile
- [ ] Non ci sono errori in console su nessuna pagina
- [ ] Il codice è comprensibile: variabili in italiano, niente `!important`, niente regole CSS morte
- [ ] Se mostro il sito a un amico, dice "figo, quanto costa?"

## Cosa NON fare

- Non togliere i tier Pro/Coaching dall'UI (Stripe si fa dopo)
- Non introdurre framework (React, Next, Vue, Tailwind oltre al CDN)
- Non scrivere test automatizzati
- Non cambiare l'architettura Vercel (static files in public/, API in api/)
- Non generare dati finti o placeholder
- Non toccare calendario/notifiche/piano Coaching (da idee.md)

## Il prodotto che vogliamo

### Landing page che converte (index.html)

La landing attuale è carina ma non è calibrata per la conversione. Deve:

**Hero section:**
- Headline che colpisca: "Il commissario che ti allena 24/7. Supera l'orale del concorso."
- Subheadline che spiega: "Simulazioni orali con AI basate sul tuo bando. Feedback in tempo reale. Migliori a ogni risposta."
- CTA hero: "Inizia a simulare gratis" (porta a auth.html)
- Sfondo: pattern griglia + gradiente brand, più scuro/contrastato per far risaltare il testo

**Feature cards (già presenti, da migliorare):**
- Devono comunicare VALORE, non funzioni. Non "chat streaming" ma "Come un commissario vero, anzi meglio: non si stanca, non ha pregiudizi, ti corregge subito"
- 4 card massimo, con icona + titolo + descrizione + micro-animazione al hover
  1. "Commissario AI" — piattaforma DeepSeek v4, domande mirate sul bando
  2. "Feedback in tempo reale" — chiarezza, struttura, contenuto: sai subito dove migliorare
  3. "Bandi tuoi" — carica il PDF del concorso, l'AI lo legge e interroga su quello
  4. "Quando vuoi, dove vuoi" — 24/7, dal telefono, nessuna prenotazione

**Prova sociale (manca, va creata):**
- "Già X candidati si preparano con ConcorsoAI" — numero incrementale via localStorage (parte da 127, aumenta di 1 ogni giorno)
- Citazioni testuali credibili (non attribuite a persone reali): "Mi ha fatto passare l'orale al Comune di Milano" — Marco R. (nome di fantasia)
  Queste SONO finte nel senso che non abbiamo ancora utenti reali, ma non sono placeholder vuoti. Servono per mostrare il concept. Vanno sostituite con vere appena arrivano.

**Pricing (già presente, da rendere più vendibile):**
- Free: "Prova" — 3 simulazioni/mese, gratis
- Pro: €19/mese — "Per chi fa sul serio" — simulazioni illimitate
- Coaching: €99/mese — "Il pacchetto completo" — simulazioni + feedback avanzato + priorità
- Il prezzo €100/mese (Coaching) deve esistere ANCHE se Stripe non è integrato. Fa da anchor: Pro sembra un affare a €19
- Tabella comparativa sotto i prezzi: Free ✅3/mese | Pro ✅illimitate + ✅feedback dettagliato | Coaching ✅tutto + ✅priorità + ✅piano personalizzato

**Waitlist / early access:**
- Sotto il pricing, una riga: "Posti limitati nella beta — unisciti a X candidati già in lista"
- Form con solo email, salva in Supabase (tabella `waitlist` da creare)
- Dà immediatamente accesso (non è una vera waitlist, è un modo per catturare email)

**Footer:**
- Già presente, migliorare: "Made in Italy 🇮🇹 · Per superare l'orale del tuo concorso"

### Simulation che stupisce (simulation.html)

Questa è la pagina che VENDE. Se l'utente arriva qui e l'esperienza è mediocre, non tornerà mai più.

**Config (selezione bando):**
- Deve essere emozionante, non un form. "Preparati. Il commissario ti aspetta."
- Selezione bandi con card eleganti (già presenti)
- Durata con bottoni toggle (già presenti)
- Difficoltà: Facile / Realistico / Difficile (già presente)
- Bottone "Inizia simulazione" grande, con glow animation quando è pronto

**Briefing animato:**
- Schermata di transizione con orb pulsante e 3 step: "Analisi bandi → Calibrazione → Pronta domanda"
- Mostra il nome del bando e la difficoltà
- Durata: 2-3 secondi, poi parte automaticamente (già presente)

**Simulazione:**
- La chat deve SEMBRARE una chat vera, non una pagina web:
  - Bolla commissario con avatar CA, nome, badge "Online"
  - Bolla utente con avatar iniziale, allineata a destra
  - Feedback bars laterali animate (Chiarezza/Struttura/Contenuto)
  - Timer in alto che scorre
  - Input box elegante con microfono e invio

**Cosa manca / va migliorato:**

1. **Suono** — quando arriva un messaggio del commissario, un breve "notification pop" (riproduci un beep via Web Audio API, due righe di codice)
2. **Haptic feedback** — quando l'utente invia, far vibrare leggermente la chat (se su mobile, `navigator.vibrate(10)`)
3. **Micro-interazioni**:
   - Il pulsante invio si illumina quando c'è testo
   - Il feedback mostra un pulse quando lo score cambia
   - Le barre feedback passano da grigio a colorato con transizione fluida
4. **Empty state potente** — se non ci sono ancora messaggi, mostrare "Il commissario ti farà la prima domanda a breve..."
5. **Scroll automatico** — quando arriva una nuova bolla, scroll giù (fallo con `scrollIntoView({ behavior: 'smooth' })`)
6. **Typing indicator** — tre pallini che ballano mentre il commissario "pensa"
7. **Tempo di risposta** — dopo l'invio, mostrare quanto ci ha messo il commissario a rispondere ("Risposto in 2.3s")
8. **Waveform sul microfono** — quando premi il microfono, mostra barre animate che ballano

**Summary (dopo la simulazione):**
- Deva far sentire l'utente come se avesse appena finito un vero esame
- Score totale grande (es. "7.2/10")
- Grafico a barre con Chiarezza/Struttura/Contenuto
- Frasi motivazionali in base al risultato:
  - >8: "Eccellente. Sei pronto per l'orale."
  - 6-8: "Buono. Concentrati su [area più debole]."
  - <6: "Ci vuole pratica. Ti consigliamo il piano Pro per simulazioni illimitate."
- Bottone "Riprova" + Bottone "Torna alla dashboard"
- Se lo score è alto (>8), far cadere un po' di confetti (già presente)

### Dashboard che fidelizza (dashboard.html)

La dashboard è la home dell'utente loggato. Deve fargli venire voglia di tornare ogni giorno.

**Stats in alto (già presenti, da sistemare):**
- Numero simulazioni fatte
- Punteggio medio
- Bandi caricati
- Streak (giorni consecutivi)
- Tendenza freccia su/giù

**Aggiungere:**
- **Prossimo concorso** — countdown alla data del concorso (se l'utente l'ha inserita)
- **Messaggio giornaliero** — "Hai già fatto 2 simulazioni questa settimana. Continua così!"
- **Sezione "Continua"** — se c'è una simulazione in sospeso, mostra bannero "Riprendi simulazione"
- **Quick action** — bottone grande "Nuova simulazione" che va dritto a simulation.html

### Auth che ispira fiducia (auth.html)

- Logo grande sopra il form
- "Accedi" / "Registrati" con switch tab (già presente)
- Bottoni social: Google (funziona su localhost, su Vercel va configurato Supabase Console)
- Sotto il form: "Prova gratis · 3 simulazioni · Nessuna carta di credito"
- Footer piccolo: "ConcorsoAI · Privacy · Termini"

## Già fixato (non rifare)

Questi bug sono già stati corretti in una sessione precedente. Opus non deve ripararli:

- **overflow:clip su .config-card** — cambiato in overflow:hidden, il bottone Start ora si vede
- **Feedback panel dentro sim-layout** — estratto fuori, ora è drawer mobile + sidebar desktop
- **Nomi campi DB simulation → dashboard/history** — simulation.html ora salva clarity_score/structure_score/content_score, non feedback_chiarezza
- **History sparkline keys** — aggiornate da clarity/structure/content a clarity_score/structure_score/content_score
- **Dashboard r.difficulty** — cambiato in r.modalita
- **Paywall modale** — aggiunto in simulation.html con quota check
- **auth-patch.js documentElement bug** — non esiste nel file

## Bug da fixare (codice rotto)

Oltre al prodotto, ci sono buchi che fanno SCHIFO se un investitore o un utente li vede:

1. **Dashboard stats a zero** — simulation.html salva `feedback_chiarezza` ma dashboard legge `clarity_score`. Vedi simulation.html linea ~1493 e dashboard.html linea ~719
2. **History vuota** — stesso problema, history.html cerca `r.clarity` invece di `r.clarity_score`. Vedi history.html linea ~141
3. **Nessun controllo quota** — `api/quota.js` esiste ma non viene mai chiamato. Aggiungere chiamata fetch in simulation.html `startSimulation()`. Se free e 0 rimanenti, mostra modale paywall
4. **Paywall assente** — serve modale in simulation.html che dice "Hai finito le simulazioni. Passa a Pro." con CTA
5. **Timer inaffidabile** — `setInterval` rallenta in background. Usare `Date.now()` per calcolare il tempo reale
6. **Indicatore attesa fifone** — aspetta 800ms prima di mostrare "sta scrivendo". Farlo apparire SUBITO

## Cosa NON fare (ribadito)

- Non togliere riferimenti ai piani Pro/Coaching dalla UI
- Stripe si integra DOPO tutte queste modifiche
- Non riscrivere da zero — ogni pagina esiste già, va migliorata
- Non generare asset (immagini, logo, icone) — usare SVG inline o emoji
- Non aggiungere pagine nuove tranne pricing.html e 404.html
- **Non toccare la logica AI** in simulation.html: chiamaCommissario, chiamaCommissarioStream, system prompt, gestione chunk bando. Se non è rotto, non toccarlo
- **Non toccare l'auth flow** in auth.html — login/register/OAuth funzionano già
- **Non creare tabelle Supabase** tranne `waitlist` (se serve). simulation, bandi, utenti esistono già

## Analytics (serve per investor)

Non c'è nessun tracciamento. Aggiungere almeno:
- **`api/track.js`** (esiste già, è stub) — chiamata POST che salva evento in Supabase (tabella `events`: id, user_id, event, page, timestamp)
- Su ogni pagina, alla fine del `<body>`: `<script>fetch('/api/track', {method:'POST', body:JSON.stringify({event:'page_view', page:window.location.pathname})})</script>`
- Eventi da tracciare: page_view, simulazione_iniziata, simulazione_completata, bando_caricato, login, registro
- Questi dati servono per: investor deck, capire dove gli utenti abbandonano, migliorare conversione

## SEO (serve per utenti)

Aggiungere su TUTTE le pagine:
- `<meta name="description" content="...">` — descrizione unica per ogni pagina
- `<meta property="og:title" content="...">`
- `<meta property="og:description" content="...">`
- `<link rel="canonical" href="https://concorso-ai.vercel.app/...">`
- Articoli blog: `<script type="application/ld+json">` con schema Article

## Come verificare il lavoro

Prima di dichiarare finito un task:
- [ ] Apri la pagina in browser (localhost)
- [ ] Controlla che non ci siano errori in console
- [ ] Testa su viewport mobile (375px)
- [ ] Verifica che i dati arrivino da Supabase (non siano vuoti)
- [ ] Leggi il codice: è pulito? Ha senso?

## File da leggere PRIMA di iniziare

Leggi questi file nell'ordine per capire il progetto:
1. `AGENT_MEMORY.md` — stato progetto
2. `public/index.html` — landing (da migliorare come sopra)
3. `public/simulation.html` — core (1800+ righe, occhio)
4. `public/css/simulation.css` — CSS core
5. `public/dashboard.html` — dashboard
6. `public/history.html` — storico
7. `public/auth-patch.js` — auth injection
8. `api/chat.js` — serverless proxy
9. `api/quota.js` — quota
10. `vercel.json` — routing Vercel
