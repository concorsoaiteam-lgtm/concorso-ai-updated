# Idea: Piano di Studio AI + Calendario + Notifiche

## Concetto
Un assistente chat (secondo AI) che costruisce un piano di studio personalizzato, lo sincronizza con il calendario dell'utente e manda notifiche push con cosa fare esattamente. Esclusivo Pro.

## Flusso utente completo

### 1. Chat di onboarding ("Costruisci il tuo piano")
L'utente apre una chat e l'AI fa domande progressive:
- "Quando è il tuo concorso?"
- "Quanto tempo hai ogni giorno per studiare?"
- "Quali sono le tue materie più deboli?" (leggendo dai dati delle simulazioni passate)
- "Preferisci sessioni lunghe o brevi?"
- "Hai già impegni fissi in calendario?" (lavoro, palestra, ecc.)

### 2. Generazione del piano
L'AI produce un piano settimanale:
- Ogni giorno: 1-2 simulazioni mirate + ripasso mirato sugli errori
- Varietà: alterna materie forti/deboli
- Difficoltà progressiva: facile all'inizio, difficile vicino all'esame
- Una "simulazione lampo" giornaliera come riscaldamento

### 3. Sincronizzazione calendario
L'utente collega Google Calendar / Outlook / iCal.
Il piano diventa eventi reali sul calendario con:
- Titolo: "Simulazione: Diritto Amministrativo (art. 21-28)"
- Descrizione: "Obiettivo: migliorare struttura. Punto debole: citare la giurisprudenza. La prossima volta prova a iniziare con 'La norma di riferimento è...'"
- Link diretto: "Apri simulazione" → simulation.html preconfigurata
- Durata: calibrata sul tempo disponibile dell'utente

### 4. Notifiche push
- 10 minuti prima: "Tra 10 minuti hai simulazione di Contabilità Pubblica. Argomento: il pareggio di bilancio. Ripassa velocemente gli articoli 81-97 Cost."
- A inizio sessione: link diretto per cliccare e partire
- Se salta: "Hai saltato la simulazione di ieri. Recuperala oggi? Il piano si sta spostando."
- Report settimanale via notifica: "Questa settimana: 5/7 simulazioni completate. Punteggio medio in salita del 12%."

### 5. Adattamento continuo
- Se l'utente fa meglio del previsto: il piano accelera
- Se salta 2 giorni: il piano si riprogramma da solo
- Se si avvicina la data: aumenta intensità e difficoltà

## Problemi che risolve

| Problema | Soluzione |
|----------|-----------|
| "Non so da dove iniziare" | La chat guida passo passo alla prima simulazione |
| "Non ho tempo" | Il piano si adatta ai tuoi impegni reali |
| "Mi dimentico di studiare" | Notifiche push + calendario |
| "Studio sempre le stesse cose" | Il piano alterna materie e difficoltà |
| "Non so se sto migliorando" | Report settimanale con progressi visibili |
| "Mi blocco e mollo" | Recupero automatico + incoraggiamento mirato |
| "Devo aprire 5 pagine per iniziare" | Un clic dalla notifica → simulazione pronta |

## Architettura tecnica

### Lato client (già esistente)
- `dashboard.html` — nuovo tab "Piano" tra "Aggiungi materiale" e "Simulazione"
- Chat embedded nella dashboard (stile commissario ma tono coach)
- Servizio worker per notifiche push (Service Worker + Push API)
- iCalendar feed per sincronizzazione calendario

### Lato server (da costruire)
- **AI chat**: endpoint `/api/plan-chat` — conversazione per costruire il piano
- **Generazione piano**: endpoint `/api/generate-plan` — prende risposte chat + storico simulazioni → produce schedule JSON
- **Sync calendario**: libreria `ical-generator` per feed iCal + Google Calendar API
- **Notifiche push**: Web Push API + CRON giornaliero per reminder
- **Storage piano**: tabella `study_plans` su Supabase (user_id, week_start, schedule JSON, calendar_feed_url)

### Costi
- AI API: ~$0.01 per generazione piano (una volta a settimana), ~$0.002 per notifica motivazionale
- Push notifications: gratuite via Browser Push API / Telegram bot
- Google Calendar API: gratuita (limiti generosi)
- Infrastruttura: già esistente (Vercel + Supabase)
- **Costo totale stimato: $0.05/utente/mese**

## Perché vale €29/mese

1. **Sostituisce un coach privato** (che costa €50-80/h)
2. **Aumenta la retention**: chi attiva il piano apre l'app ogni giorno per le notifiche
3. **Riduce churn**: il piano recupera automaticamente chi salta sessioni
4. **Vendita emotiva**: "Non sei più solo. Hai un coach che ti segue, ti sprona, ti riprogramma gli impegni. 24/7."
5. **Lock-in**: dopo 1 mese il calendario è pieno di eventi ConcorsoAI — disdire significa perdere il piano

## Rischi e mitigazioni

| Rischio | Mitigazione |
|---------|-------------|
| L'utente non ha Google Calendar | Supporto anche iCal + download .ics + Telegram bot |
| Le notifiche push non arrivano su iOS | Fallback: email + SMS (via Supabase) |
| Il piano non rispetta gli imprevisti | L'AI chiede ogni settimana "Il piano è stato ok? Cosa cambieresti?" |
| L'utente ignora le notifiche e si sente in colpa | Tono sempre incoraggiante, mai giudicante. "Ricominciamo, nessun problema." |

## Conclusione
Questa feature è l'evoluzione naturale del prodotto: da "strumento per simulare" a "coach personale che organizza la tua preparazione". È realistica da costruire (tutta la base esiste già), costa pochissimo in infrastruttura e ha un valore percepito altissimo.
