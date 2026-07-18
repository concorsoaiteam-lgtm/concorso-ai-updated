# Bucket List — Analisi Video & Miglioramenti ConcorsoAI

## Video Analizzati (Rilevanti per il progetto)

### 1. Simone Chiarelli — Dirigente PA reale
- **Canale**: https://www.youtube.com/@simonechiarelli
- **Ruolo**: Dirigente Pubblica Amministrazione Locale, laurea in Giurisprudenza + Economia, dottore in Diritto Pubblico
- **Playlist chiave**: "Simulazione prova ORALE" — https://www.youtube.com/playlist?list=PLnc9N-ztTF5duYf4i0AAwGUTQ1h-wKPlQ
- **Video specifici**:
  - `6KOI7YlkNPo` — SIM06: Prova orale aperta a tutti (ott 2024)
  - `YmhRcxyZbIk` — SIM05: Prova orale aperta a tutti (feb 2023)
  - `Mdf4DJu2S4g` — Chiarelli interroga Alberto — simulazione reale
  - `mc8D6BCu_yE` — Chiarelli Interviews — esercizio soft orale (dic 2024)
- **Cosa mostra**: Commissario reale che interroga candidati su diritto amministrativo, costituzionale, enti locali. Valuta in tempo reale, fa domande di follow-up, corregge errori.
- **Rilevanza**: **ALTISSIMA** — è la fonte più vicina a ciò che ConcorsoAI vuole simulare

### 2. "Ti preparo al concorso pubblico" — Canale YouTube
- **Canale**: https://www.youtube.com/@tipreparoalconcorsopubblico
- **Playlist**: "Come metterti alla prova ad un orale... sul serio?" (6 episodi)
- **Video specifici**:
  - `V-D2yBaSEY4` — "Vi svelo alcune DRITTE per l'orale" (gen 2026)
  - `2zGNbvQyIzA` — "Che terminologia usare durante l'orale?" (gen 2026)
- **Cosa tratta**: Consigli pratici per affrontare l'orale, terminologia da usare, errori da evitare
- **Rilevanza**: **ALTA** — spunti su come il commissario valuta la terminologia e l'esposizione

### 3. Articoli / Guide correlati

#### Promosso.ai — "Come prepararsi alla prova orale"
- https://www.promosso.ai/blog/come-prepararsi-alla-prova-orale-di-un-concorso-guida-completa-e-consigli
- **Punti chiave**:
  - Durata orale: 15-30 minuti
  - Materie: diritto amministrativo, costituzionale, normativa specifica
  - Prove aggiuntive: lingua straniera, informatica
  - La prova orale incide 30-50% del punteggio finale
  - Errori tipici: non simulare, ignorare domande motivazionali, parlare troppo veloce

#### Edises Blog — "La prova orale in 10 step"
- https://blog.edises.it/prova-orale-concorsi-pubblici-guida-26037
- **Punti chiave**:
  - Leggere il bando per struttura e criteri
  - Progettare l'intervento (colloquio individuale vs gruppo)
  - Collegamenti tra argomenti — molto apprezzati dai commissari
  - Linguaggio del corpo: postura, tono, gestualità

#### Ratio Iuris — Sentenza Consiglio di Stato n. 3607/2025
- https://ratioiuris.it/la-valutazione-delle-prove-concorsuali-alla-luce-dei-principi-di-legalita-imparzialita-e-buon-andamento-la-sentenza-del-consiglio-di-stato-n-3607-2025/
- **Punti chiave** (utili per calibrare il commissario):
  - I commissari determinano i quesiti prima dell'orale, li sigillano e li estraggono a sorte
  - Discrezionalità tecnica della commissione: sindacabile solo per errori macroscopici
  - Non serve pubblicare elenco ammessi all'orale per validità
  - Rapporti personali tra commissario e candidato: devono essere "più saldi di quelli d'ufficio" per generare incompatibilità

---

## Miglioramenti per ConcorsoAI (dall'analisi)

### A — Commissario più realistico

| # | Cosa fare | Da dove | Priorità |
|---|---|---|---|
| A1 | **Aggiungere momenti di "pausa di riflessione"** — il commissario reale non risponde in 500ms. Il typewriter già c'è, ma si può aggiungere un delay iniziale variabile (2-5s) prima di iniziare a scrivere. | Video Chiarelli | Alta |
| A2 | **Reazioni emotive calibrated** — il commissario deve mostrare espressioni diverse: "Non mi convince", "Buona risposta, ma...", "Approfondiamo questo punto". Già parzialmente nel prompt, ma da rendere più vario. | Video Chiarelli + "Ti preparo" | Alta |
| A3 | **Domande di follow-up COLANTI** — se il candidato sbaglia su un punto, il commissario deve INCALZARE su quel punto, non cambiare argomento. Oggi il prompt lo dice ma non sempre funziona. | Video Chiarelli | Alta |
| A4 | **Terminologia da valutare** — nei video "Ti preparo" sottolineano che la terminologia giusta fa salire il voto. Da aggiungere una dimensione "lessico" nel feedback o nel prompt. | "Ti preparo" video | Media |
| A5 | **Valutazione più granulare** — passare da 3 dimensioni (chiarezza, struttura, contenuto) a 4-5 (aggiungendo "pertinenza" e "lessico tecnico"). | Analisi griglie valutazione reali | Media |
| A6 | **Inserire citazioni da sentenze reali** — il commissario potrebbe dire "Come ha ricordato il Consiglio di Stato nella sentenza 3607/2025..." per sembrare più credibile. | Ratio Iuris | Bassa |

### B — Esperienza utente

| # | Cosa fare | Da dove | Priorità |
|---|---|---|---|
| B1 | **Timer più visibile** — nei concorsi reali il tempo è una pressione costante. Oggi il timer è piccolo in alto. Da ingrandire o mettere in evidenza. | Struttura orale reale | Alta |
| B2 | **Suggerimenti "terminologia" contestuali** — durante la simulazione, mostrare pillole tipo "Stai usando il termine giusto? Ricorda: 'procedimento' non 'processo'". | "Ti preparo" video | Media |
| B3 | **Feedback specifici per materia** — oggi il feedback è generico (chiarezza, struttura, contenuto). Se il candidato risponde su diritto amministrativo, i dettagli dovrebbero essere specifici per quella materia. | Analisi generale | Media |
| B4 | **Modalità "solo domande"** — una modalità senza feedback in tempo reale, solo voto finale, per simulare la tensione reale dove non sai come stai andando fino alla fine. | Struttura orale reale | Bassa |

### C — Tecnico

| # | Cosa fare | Da dove | Priorità |
|---|---|---|---|
| C1 | **Attivare lo streaming** (già fatto) | — | Fatto |
| C2 | **Prompt più umano** (già fatto) | — | Fatto |
| C3 | **Storico messaggi: non troncare le correzioni** — quando l'utente corregge, il sistema deve ricordare la valutazione precedente e confrontarla. Oggi il correction flow è migliorato ma va testato. | Video Chiarelli (lui ricorda cosa ha detto il candidato prima) | Alta |
| C4 | **Rate limiting lato UI** — mostrare un avviso se l'utente invia troppe risposte in rapida successione (simula il ritmo reale di un orale). | Struttura orale reale | Media |

### D — Contenuti da approfondire (video da guardare)

| # | Video | Perché | Fatto? |
|---|---|---|---|
| D1 | https://www.youtube.com/watch?v=6KOI7YlkNPo | SIM06 — orale simulato completo, vedere come Chiarelli valuta in tempo reale | No |
| D2 | https://www.youtube.com/watch?v=Mdf4DJu2S4g | Chiarelli interroga Alberto — simulazione 1:1 più corta | No |
| D3 | https://www.youtube.com/watch?v=V-D2yBaSEY4 | "Dritte per l'orale" — consigli pratici terminologia | No |
| D4 | https://www.youtube.com/watch?v=2zGNbvQyIzA | "Che terminologia usare" — lessico specifico | No |

### E — Idee future (da valutare)

| # | Idea | Dalla fonte |
|---|---|---|
| E1 | **Commissario con "memoria di seduta"** — tenere traccia di TUTTE le risposte precedenti e farci riferimento ("Prima hai detto X, ora invece sostieni Y, mi spieghi questa differenza?") | Video Chiarelli |
| E2 | **Feedback "a seduta conclusa"** — invece di 3 barre live, un report finale strutturato con punteggi analitici e commento del commissario | Struttura reale |
| E3 | **Simulazione con più commissari** — 3 commissari (come nella realtà) che danno voti separati e poi viene calcolata la media | Legge concorsi pubblici |
| E4 | **Modalità "preselettiva -> scritto -> orale"** — percorso completo come nelle simulazioni di Chiarelli | Simone Chiarelli SIM05/SIM06 |

---

## Log modifiche
- **15 Lug 2026**: Creazione file. Analizzati canali Simone Chiarelli, "Ti preparo al concorso pubblico", articoli Promosso.ai, Edises, Ratio Iuris.
