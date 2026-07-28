CONCORSO AI – SPECIFICHE COMPLETE PER LO SVILUPPO (Freebuff)
Questo documento contiene il design completo di tutte e 4 le tab della dashboard di ConcorsoAI. È pensato per essere implementato in Freebuff (Bubble) con HTML/CSS/JS vanilla, Supabase, GSAP, font Geist + Geist Mono. Nessuna libreria UI esterna.

INDICE
Struttura generale

TAB 1 – Prepara

TAB 2 – Il tuo piano

TAB 3 – Progressi

TAB 4 – Classifica

Prima di implementare

STRUTTURA GENERALE
Navbar (fissa su tutti i tab)
text
+------------------------------------------------------------------+
|  Logo "ConcorsoAI"   |  Prepara  |  Il tuo piano  |  Progressi  |  Classifica  |  👤 Nome  |  [Pro]  |
+------------------------------------------------------------------+
Logo: a sinistra, link alla dashboard (TAB 1).

Tab: 4 tab orizzontali. Quello attivo ha un indicatore (linea sotto o colore diverso).

Avatar + Nome: a destra, con badge "Pro" (blu scuro) o "Free" (grigio).

TAB 2 "Il tuo piano" è visibile solo agli utenti Pro. Gli utenti Free vedono un paywall (non progettato in questo documento).

Palette colori (da usare ovunque)
Ruolo	Colore	Hex
Sfondo	Bianco/azzurro	#F7FBFF
Brand	Blu scuro	#0F4C81
Accent	Blu	#2563EB
Success	Verde	#16A34A
Warning	Amber	#D97706
Error	Rosso	#DC2626
Font
Geist: tutto il testo (interfacce, etichette, paragrafi).

Geist Mono: numeri, voti, dati (gauge, streak, grafici).

Layout generale per tab
Ogni tab è una pagina separata (o un container visibile/nascosto) con:

Header: Titolo + sottotitolo.

Contenuto principale scrollabile verticalmente.

TAB 1 – "PREPARA"
Obiettivo
L'utente carica il bando, lo seleziona, configura difficoltà e durata, e avvia la simulazione.

Layout completo
text
+------------------------------------------------------------------+
|  TAB 1: PREPARA                                                   |
|  Sottotitolo: "Carica il tuo bando e scegli come simulare"       |
+------------------------------------------------------------------+
|                                                                    |
|  ┌─ SEZIONE 1 – CARICA MATERIALI ──────────────────────────────┐ |
|  │  [Carica PDF] [Incolla Testo] [Materie]  ← tab orizzontali │ |
|  │  +──────────────────────────────────────────────────────────+ │ |
|  │  │  Area di drop (o textarea, o lista materie)             │ │ |
|  │  │  [Pulsante "Carica Bando" – secondario, a destra]      │ │ |
|  │  +──────────────────────────────────────────────────────────+ │ |
|  └──────────────────────────────────────────────────────────────┘ │
|                                                                    |
|  ┌─ SEZIONE 2 – I TUOI BANDI ───────────────────────────────────┐ |
|  │  "I tuoi bandi (2)"                      [Ordina per data ▼] │ |
|  │  ┌──────────────────────────────────────────────────────────┐ │ |
|  │  │  CARD 1 (selezionata) ← bordo blu spesso               │ │ |
|  │  │  📄 Ministero Istruzione – 2026                        │ │ |
|  │  │  Caricato 15/07 | 3 materie | Stato: Pronto            │ │ |
|  │  │  ─────────────────────────────────────────────────────  │ │ |
|  │  │  Difficoltà: [Facile] [Media] [Difficile]              │ │ |
|  │  │  Durata: [10min] [20min] [30min]                      │ │ |
|  │  │  [Inizia Simulazione →]                                │ │ |
|  │  └──────────────────────────────────────────────────────────┘ │ |
|  │  ┌──────────────────────────────────────────────────────────┐ │ |
|  │  │  CARD 2 (non selezionata)                              │ │ |
|  │  │  📄 Comune di Roma – 2025                              │ │ |
|  │  │  Caricato 10/07 | 5 materie | Stato: In attesa         │ │ |
|  │  └──────────────────────────────────────────────────────────┘ │ |
|  └──────────────────────────────────────────────────────────────┘ │
|                                                                    |
+------------------------------------------------------------------+
Dettaglio elementi
Sezione 1 – Carica materiali
3 tab orizzontali: [Carica PDF] [Incolla Testo] [Materie]. Default: "Carica PDF" selezionato.

Contenuto attivo (es. "Carica PDF"):

Area di drop: bordo tratteggiato grigio, larga quasi tutta la larghezza, con icona di upload e testo "Trascina il PDF qui o clicca per sfogliare".

Pulsante "Carica Bando": secondario, in basso a destra.

Dopo il caricamento: toast "Bando caricato!" e la card appare in "I tuoi bandi".

"Incolla Testo": textarea con placeholder "Incolla qui il testo del bando".

"Materie": input per aggiungere materie (tag).

Sezione 2 – I tuoi bandi
Intestazione: "I tuoi bandi (X)" con dropdown "Ordina per data ▼" (opzioni: più recente, più vecchio, nome).

Card bando:

Non selezionata: bordo grigio sottile (1px), icona 📄 (SVG), nome bando, data, numero materie, badge stato (Pronto/In attesa/Errore).

Selezionata: bordo blu spesso (4px), si espande mostrando configurazione.

Click sulla card: la seleziona/deseleziona. Se selezionata, si espande mostrando:

Diffcoltà: [Facile] [Media] [Difficile] (default: Media)

Durata: [10min] [20min] [30min] (default: 20min)

[Inizia Simulazione →] (primario, attivo)

Nessun bando: messaggio "Nessun bando ancora. Carica il tuo primo bando sopra." con icona.

Tutorial primo accesso (tooltip sequenziali)
Attivazione: solo al primo accesso (nessuna simulazione completata).

Modalità: tooltip che appaiono uno dopo l'altro, senza coprire la dashboard. L'utente può interagire mentre il tutorial è visibile.

Step 1: "Carica il tuo bando" – punta all'area di drop.

Step 2: "Seleziona un bando dalla lista" – punta a una card.

Step 3: "Configura e inizia" – punta al bottone "Inizia Simulazione".

Bottone SKIP: in alto a destra di ogni tooltip. Chiude tutto il tutorial.

Scomparsa: dopo la prima simulazione completata (qualsiasi tipo).

Comportamento speciale: se l'utente carica un bando o clicca su "Avanti", lo step successivo appare. Il tutorial non blocca mai l'azione.

TAB 2 – "IL TUO PIANO"
Obiettivo
L'utente vede il piano settimanale personalizzato, generato dall'AI, e può modificarlo tramite chat.

Layout completo
text
+------------------------------------------------------------------+
|  TAB 2: IL TUO PIANO                                              |
|  Sottotitolo: "Il tuo piano settimanale personalizzato" [Pro]    |
+------------------------------------------------------------------+
|                                                                    |
|  ┌─ SEZIONE A – CALENDARIO SETTIMANALE ─────────────────────────┐ |
|  │  [< Settimana]  [Oggi]  [>]                                 │ |
|  │  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐        │ |
|  │  │ LUN  │ MAR  │ MER  │ GIO  │ VEN  │ SAB  │ DOM  │        │ |
|  │  │ 21   │ 22   │ 23   │ 24   │ 25   │ 26   │ 27   │        │ |
|  │  │  🟢   │  🟡   │  🔴   │  ○   │  ○   │  ○   │  ○   │        │ |
|  │  │ 20min │ 30min │ 25min │  —   │  —   │  —   │  —   │        │ |
|  │  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘        │ |
|  │  [Card dettaglio giorno]                                     │ |
|  └──────────────────────────────────────────────────────────────┘ |
|                                                                    |
|  ┌─ SEZIONE B – CHAT AI ────────────────────────────────────────┐ |
|  │  [Messaggi AI + utente]                                     │ |
|  │  [Inserisci messaggio...]  [Invia]                         │ |
|  └──────────────────────────────────────────────────────────────┘ |
+------------------------------------------------------------------+
Dettaglio elementi
Sezione A – Calendario settimanale
Navigazione: [< Settimana] [Oggi] [>] – click cambia settimana. "Oggi" torna alla settimana corrente.

Griglia 7 giorni: 7 colonne, ogni colonna mostra:

Nome del giorno (es. "LUN") in maiuscolo, grigio.

Data (es. "21") in nero, grande.

Icona del tipo di simulazione (🟢/🟡/🔴/🔵) – colore diverso per tipo.

Durata (es. "20min") in grigio piccolo.

Stato: ✅ (completata) / 🎯 (oggi) / ○ (futura)

Click su un giorno: apre la card dettaglio sotto la griglia.

Card dettaglio giorno:

Intestazione: "📅 Mercoledì 23 luglio"

Materia: "📖 Diritto Amministrativo"

Tipo e durata: "🟢 Sessione guidata · 25min"

Focus: "🎯 Focus: Principio di trasparenza"

Se futuro: [Inizia simulazione →] (primario)

Se oggi: [Inizia simulazione →] + "🎯 Oggi!"

Se completato: "Voto: 7.4" + [Rifai] (secondario)

Se saltato: "⏳ Saltata" + [Rifai]

Piano adattivo automatico:

Fine settimana: l'AI analizza i feedback.

Lunedì: nuovo piano già pronto.

Sopra il calendario: messaggio "Piano aggiornato in base ai tuoi risultati della settimana" con X per chiuderlo.

Sezione B – Chat AI
Stato iniziale (nessun piano):

Messaggio AI: "Ciao! Sono il tuo coach AI. Per creare il piano settimanale, rispondi a 3 domande:"

Domanda 1: "Quando è il tuo esame?" (date picker, solo date future)

Domanda 2: "Quanto tempo hai al giorno?" [15min] [30min] [1ora] (click seleziona uno)

Domanda 3: "Hai impegni fissi da escludere?" (textarea, opzionale)

[Invia] – l'AI genera il piano, il calendario si popola.

Stato con piano generato:

Messaggio AI: "✅ Piano generato! Lo vedi sopra nel calendario. Se vuoi modificare qualcosa, scrivimi qui sotto."

Area di input: [Inserisci messaggio...] [Invia]

L'utente può scrivere in linguaggio naturale: "Ho un impegno giovedì", "Voglio più simulazioni d'esame", "Sposta venerdì a domenica".

L'AI risponde e aggiorna il calendario in tempo reale (micro-loading sulle celle che cambiano).

Stati speciali
Nessun bando caricato: il calendario è vuoto (tutti i giorni "—"). La chat mostra: "📄 Prima di creare il piano, carica un bando in 'Prepara'." con bottone [Vai a Prepara].

Utente Free: il TAB 2 mostra un paywall (non progettato in questo documento).

TAB 3 – "PROGRESSI"
Obiettivo
L'utente vede feedback e statistiche sulle simulazioni completate.

Layout completo (2 colonne desktop, stack mobile)
text
+------------------------------------------------------------------+
|  TAB 3: PROGRESSI                                                 |
|  Sottotitolo: "Come stai andando — continua così"                |
+------------------------------------------------------------------+
|  ┌─ COLONNA SINISTRA (60%) ──────────────────────────────────────┐│
|  │                                                              ││
|  │  ┌─ GAUGE VOTO MEDIO ──────────────────────────────────────┐ ││
|  │  │  [GAUGE CIRCOLARE]  centro: "7.4"  sotto: "Sufficiente"│ ││
|  │  └─────────────────────────────────────────────────────────┘ ││
|  │                                                              ││
|  │  ┌─ AREE DA MIGLIORARE (accordion) ────────────────────────┐ ││
|  │  │  Chiarezza: ████████░░ 8/10 [💡]                      │ ││
|  │  │  Struttura: ██████░░░░ 6/10 [💡]                      │ ││
|  │  │  Contenuto: ████░░░░░░ 4/10 [💡]                      │ ││
|  │  └─────────────────────────────────────────────────────────┘ ││
|  │                                                              ││
|  │  ┌─ ULTIME 3 SIMULAZIONI ──────────────────────────────────┐ ││
|  │  │  16 lug 🟢 Sessione guidata · 7.4 [Rivedi]            │ ││
|  │  │  14 lug 🟡 Pratica libera · 6.8 [Rivedi]              │ ││
|  │  │  12 lug 🔴 Prova d'esame · 5.2 [Rivedi]               │ ││
|  │  └─────────────────────────────────────────────────────────┘ ││
|  └──────────────────────────────────────────────────────────────┘│
|  ┌─ COLONNA DESTRA (40%) ────────────────────────────────────────┐│
|  │  ┌─ STREAK ────────────────────────────────────────────────┐ ││
|  │  │  [🔥]  12  giorni  Record: 15 giorni                   │ ││
|  │  └─────────────────────────────────────────────────────────┘ ││
|  │                                                              ││
|  │  ┌─ GRAFICO ANDAMENTO ──────────────────────────────────────┐ ││
|  │  │  [Linea SVG con date reali]                            │ ││
|  │  │  "Ultima: 7.8 (+12%)"                                  │ ││
|  │  └─────────────────────────────────────────────────────────┘ ││
|  │                                                              ││
|  │  ┌─ DATI PER CLASSIFICA ───────────────────────────────────┐ ││
|  │  │  "In arrivo — i tuoi dati stanno già contribuendo"    │ ││
|  │  └─────────────────────────────────────────────────────────┘ ││
|  └──────────────────────────────────────────────────────────────┘│
+------------------------------------------------------------------+
Dettaglio elementi
Colonna sinistra (60%)
Gauge voto medio:

Cerchio con bordo spesso (riempimento da 0 a 10), diametro 140px.

Centro: numero (Geist Mono, 36px) o "—" se nessuna simulazione.

Sotto: etichetta di stato:

Rosso < 6.0 → "Da migliorare"

Amber 6.0–7.9 → "Sufficiente"

Verde ≥ 8.0 → "Eccellente"

Click sul gauge → espande le Aree da migliorare.

Zero state: grigio, centro "—", sotto "Nessuna simulazione".

Aree da migliorare (accordion):

Intestazione: "Aree da migliorare" + chevron (▶/▼).

Espanso di default se voto < 6.0.

Tre aree: Chiarezza, Struttura, Contenuto.

Ogni area: nome, barra orizzontale (gradiente blu), valore (es. "8/10"), pulsante [💡] che apre tooltip con consiglio pratico.

Zero state: intera sezione nascosta (nessun dato).

Ultime 3 simulazioni:

Tre righe: data, icona tipo, nome tipo, voto (colore dinamico: verde se > 6.0, rosso se < 6.0), pulsante [Rivedi].

Click su riga o "Rivedi" → apre modal con dettaglio della simulazione.

Modal: voto generale + 3 metriche + bottone "Vedi dettaglio completo" (espande a tutte le domande/risposte). Per ora da definire.

Zero state: "Nessuna simulazione ancora" con icona.

Colonna destra (40%)
Streak:

Icona 🔥 (SVG) animata (GSAP), 64px.

Numero (Geist Mono, 72px) o "—" se nessuna.

"giorni di fila" e "Record: X giorni".

Colore dinamico della fiamma: grigio (0-2), arancione (3-6), rosso (7-14), viola/rosso (15+).

Zero state: fuoco spento, "—", "Ancora nessun giorno di fila".

Grafico andamento:

Intestazione: "Andamento ultime 8 simulazioni".

SVG: linea blu (#2563EB), punti rossi (#DC2626), fascia di varianza (10% opacità), asse X con date reali (formato "12/7", "19/7").

Nota sotto: "Ultima simulazione: X.X (+X%)".

Zero state: area grigia con "Non hai ancora completato simulazioni" e bottone [Vai a Prepara] (secondario).

Dati per classifica (placeholder):

Intestazione: "In arrivo: Classifica".

Testo: "In arrivo — i tuoi dati stanno già contribuendo alla classifica."

Nessun numero inventato. Solo questo messaggio.

TAB 4 – "CLASSIFICA"
Obiettivo
Placeholder per la futura classifica. Deve essere accogliente, non vuoto.

Layout completo (centrato, verticale)
text
+------------------------------------------------------------------+
|  TAB 4: CLASSIFICA                                                |
|  Sottotitolo: "La sfida tra candidati sta arrivando"             |
+------------------------------------------------------------------+
|                                                                    |
|                    [ TROFEO SVG ]                                 |
|                    (illustrazione stilizzata)                     |
|                                                                    |
|              "In arrivo — sfida altri candidati"                  |
|                                                                    |
|   Stiamo preparando la classifica. I tuoi progressi stanno      |
|   già contribuendo. Presto potrai confrontare il tuo            |
|   punteggio con altri utenti della tua regione e materia.       |
|                                                                    |
|           [ Avvisami quando è pronto ]                           |
|                                                                    |
+------------------------------------------------------------------+
Dettaglio elementi
Trofeo SVG: illustrazione stilizzata in blu (#0F4C81 e #2563EB), dimensioni 120x120px.

Titolo principale: "In arrivo — sfida altri candidati" (n, grassetto, centrato).

Testo descrittivo: grigio, centrato, larghezza massima 480px.

Bottone: [Avvisami quando è pronto] – secondario, bordo blu, testo blu, sfondo trasparente.

Click sul bottone: toast "✅ Ti avviseremo via email quando la classifica sarà pronta!".

Stato speciale
Se nessuna simulazione: il testo descrittivo cambia in "Completa alcune simulazioni per accumulare dati. La classifica arriverà presto e i tuoi progressi saranno già pronti."

PRIMA DI IMPLEMENTARE
Su Freebuff (Bubble)
Crea 4 pagine (o 4 gruppi visibili/nascondibili) per i tab.

Imposta le variabili di stato:

bando_selezionato (ID del bando)

voto_medio (numero)

streak_giorni (numero)

piano_settimana (array di 7 giorni con simulazioni)

Collega i dati a Supabase per salvare bandi, simulazioni, feedback.

Componenti da creare
Gauge circolare (SVG o Canvas, con animazione GSAP al caricamento).

Grafico a linee (SVG, con punti e fascia di varianza).

Tooltip tutorial (3 step sequenziali, con posizionamento dinamico).

Card espandibile (bando selezionato che mostra configurazione).

Chat AI (area messaggi + input, collegata a Gemini 2.5 Flash).

Animazioni (GSAP)
Gauge: animazione di riempimento da 0 al valore attuale (1 secondo).

Card dettaglio giorno: slide-down quando cliccata.

Streak: fiamma che oscilla (loop).

Tooltip tutorial: fade-in + slide-up sequenziali.