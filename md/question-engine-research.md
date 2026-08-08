# ConcorsoAI — Question Engine: Ricerca Approfondita

> Documento di specifica del **sistema che decide cosa chiedere a una persona e perché**.
> Base per l'implementazione del question engine delle due simulazioni (Realistica e Allenamento).
> Complementare a `md/simulation-research.md` (esperienza dell'orale) e `md/voice-conversation-research.md` (voce).
> Tutte le fonti sono riportate con URL nella sezione dedicata. Ogni principio è accompagnato da: fonte · cosa dimostra · forza dell'evidenza · applicazione al prodotto.

---

## INDICE

1. Executive summary
2. Obiettivo del question engine
3. Definizione della simulazione realistica
4. Definizione della simulazione di allenamento
5. Differenze fondamentali (tabella)
6. Ricerca sul realismo degli orali
7. Ricerca sulla progettazione delle domande
8. Retrieval practice
9. Deliberate practice
10. Feedback e formative assessment
11. Adaptive questioning
12. Follow-up e interazione della commissione
13. Difficoltà
14. Errori e debolezze nel tempo
15. Criteri per valutare una domanda
16. Sistema di scoring/ranking delle domande
17. Come evitare domande AI-slop
18. Esempi concreti (realistica / allenamento / AI-slop)
19. Architettura logica consigliata
20. Cosa NON costruire
21. Rischi e limiti
22. Fonti complete e verificabili
23. Specifica finale pronta per l'implementazione
24. "Se dovessimo costruirlo domani"

---

# 1. Executive summary

Il question engine ha **un solo compito**: dato un bando/PDF + una materia + lo storico dell'utente, decidere **la prossima domanda**. Oggi il prodotto genera la bank una volta (14 domande LLM, cache 7 giorni) e l'allenamento prende i primi 4 argomenti deboli dal diario (`topWeakTopics`, default k=4) e chiede al modello "genera 6 domande SOLO su questi argomenti, distribuite in modo uniforme". È un buon punto di partenza, ma le due simulazioni condividono la stessa logica: cambia solo il prompt di generazione.

La ricerca mostra che due logiche **davvero diverse** sono giustificate e necessarie:

- **Realistica** = simulare l'esame. La domanda giusta è quella che una commissione reale **farebbe davvero**, scelta in base a *probabilità reale di essere posta* (importanza dell'argomento, frequenza, struttura della prova). La difficoltà deriva dalla **natura della prova**, non dall'utente. Il ciclo segue l'evidenza sugli orali reali: la commissione copre ampiezza nella prima parte e poi scava in profondità su 1-2 argomenti focali; usa pochi follow-up mirati, mai domande che suggeriscono la risposta.
- **Allenamento** = migliorare proprio ciò che non sai. La domanda giusta è quella con il **maggior valore di apprendimento per quell'utente adesso**: colpisce la debolezza residua, la colpisce nel modo giusto (non sempre "ridai la definizione": alterna riconoscimento dell'errore, distinzione tra concetti simili, applicazione, collegamento, spiegazione con parole proprie), e rispetta i tempi del **retrieval spacing** (non insistere troppo presto né troppo tardi).

**I numeri che contano** (verificati, sezione fonti): il testing effect vale ~0.61 (Adesope 2017) e a una settimana il gruppo "test ripetuti" ricorda il 61% contro il 40% del gruppo "rilettura" (Roediger & Karpicke 2006). La pratica distribuita massimizza la ritenzione con intervalli pari al 10-20% dell'intervallo di ritenzione target (Cepeda 2006). L'interleaving (mescolare i tipi di domanda invece di raggrupparli) batte la pratica a blocchi (Rohrer & Taylor 2007). Il feedback formativo muove di 0.4-0.7 deviazioni standard (Black & Wiliam 1998). Il mastery learning ha effetto ~0.59 (Guskey & Pigott). Le domande generate da LLM tendono a essere **più facili e più superficiali** di quelle umane (Law et al. 2025: difficoltà 0.78 vs 0.69, più inesattezze 6% vs 4%, più spesso inappropriate 14% vs 1%) → serve un layer di qualità, non fidarsi del modello.

**Decisione strategica consigliata**: mantenere la generazione LLM per il contenuto (economica, è il nostro unico modo di coprire un bando arbitrario) ma aggiungere un **layer di decisione deterministico** (puro, testabile, ~100 righe) che sceglie *quale argomento* e *quale tipo di domanda*, più un **layer di qualità** (regole + auto-verifica a basso costo). Il costo per simulazione resta quasi nullo: una chiamata per generare la bank + una per il feedback per risposta, come oggi.

---

# 2. Obiettivo del question engine

La domanda non è un'unità isolata: è l'anello di un ciclo:

```
Domanda → Risposta → Valutazione → Identificazione della lacuna → Decisione sulla prossima domanda
```

Il question engine è il **cervello** di questo ciclo. Obiettivi misurabili:

1. **Realismo**: in modalità Realistica l'utente deve poter pensare "questa domanda me la farebbero davvero". Non deve mai pensare "ma chi te l'ha chiesta, questa?".
2. **Apprendimento**: in modalità Allenamento ogni domanda deve avere un **perché** esplicito rispetto allo storico dell'utente (debolezza X, tipo di errore Y, ultima volta Z).
3. **Economia**: massimo apprendimento/realismo per token. La ricerca è la base per non sprecare chiamate LLM.
4. **Coerenza**: il sistema deve saper rispondere a "perché questa domanda adesso?" — per l'utente (nel feedback) e per noi (nei log).

**Principio fondante del prodotto** (dal brief): *non voglio una domanda difficile, voglio una domanda utile*. Una domanda facile ma diagnostica vale più di una difficile che non insegna nulla.

---

# 3. Definizione della simulazione realistica

**Domanda guida**: "Se fossi davvero davanti alla commissione, cosa sarebbe ragionevole aspettarmi che mi chieda?"

**Priorità**: realismo > difficoltà artificiale.

**Caratteristiche**:
- Le domande appartengono a un **programma**: materie del bando, in proporzione alla loro importanza/peso nella prova reale (non uniforme a caso).
- La sequenza segue il pattern osservato negli orali reali: **ampiezza** prima (coprire più argomenti), poi **profondità** su pochi argomenti focali (il pattern "compressed judgement", Folwell/Tan 2023).
- La difficoltà **emerge dalla prova**: domande aperte di esposizione, richieste di fonte normativa, approfondimenti nelle ultime domande (come oggi in modalità Difficile: timer nelle ultime 3).
- I follow-up sono **pochi e mirati** (Pearce & Chiavaroli 2020): chiarire se la risposta è ambigua, approfondire se è corretta ma superficiale, mai suggerire la risposta.
- **Il turno della commissione è conversazionale**: dopo ogni risposta il commissario *reagisce* a voce (breve giudizio parlato + eventuale follow-up), ma **i punteggi e il pannello di feedback compaiono solo nel report finale**. Il prodotto attuale mostra un pannello punteggiato a ogni turno: è una **decisione di prodotto esplicita** di questa spec (vedi sezioni 12 e 23), da non introdurre per sbaglio nell'implementazione.
- L'utente può non sapere: la commissione non si arrabbia, passa avanti (mai punire il vuoto).
- **Non** usa lo storico degli errori dell'utente per "colpirlo": la simulazione realistica è un test della preparazione reale, non un'esercitazione mirata. (Lo storico serve solo per il report finale: "questi sono i tuoi punti deboli, allenati".)

**Come stimare la probabilità che una domanda venga posta** (sezione 6): pesare importanza + frequenza + rilevanza al programma + struttura della prova. Nessuna fonte pubblica offre frequenze statistiche per i concorsi italiani; l'unico modo pratico è una stima strutturata fatta dal modello con regole (importanza nel programma, classicità dell'argomento, collegamenti), validata da un layer di controllo.

---

# 4. Definizione della simulazione di allenamento

**Domanda guida**: "Quale domanda mi aiuta di più a migliorare adesso?"

**Priorità**: apprendimento > simulazione.

**Caratteristiche**:
- Usa **obbligatoriamente** la memoria dell'utente: `temi` (diario degli errori con livello 1-5 e occorrenze), `abitudini`, `progressi` (schema reale già in `api/_lib/memory.js`).
- Colpisce le debolezze attive (livello ≥ 3, stato `attivo`), **ma** con rotazione dei tipi di domanda per non diventare monotono: non sempre "ripeti la definizione sbagliata".
- Ogni domanda ha un **tipo** esplicito (sezione 15) e il tipo cambia in base all'errore:
  - confonde due concetti → *distinzione* ("Qual è la differenza tra X e Y?");
  - non sa applicare → *caso* ("Un cittadino presenta un'istanza… cosa succede?");
  - conosce ma non argomenta → *spiegazione con parole proprie*;
  - ha recuperato l'argomento → *collegamento* a un altro concetto;
  - quasi padrone → *trasferimento* a una situazione nuova.
- Rispetta il **retrieval spacing**: un concetto sbagliato 3 volte non va ripetuto 3 volte di fila. Va riprovato a intervalli crescenti (prima nella stessa sessione con tipo diverso, poi a 1-3 giorni), e quando il livello scende sotto soglia il diario lo segna `superato` (già implementato: livello ≤ 2 → `superato`; decay −1 per sessione senza errore).
- Il feedback è **immediato e correttivo** (Black & Wiliam 1998; Bangert-Drowns 1991): verifica + elaborazione ("cosa hai sbagliato, perché, come si fa"), perché in modalità pratica l'errore non va mai lasciato consolidare.
- L'utente deve vedere il progresso: "avevi confuso X e Y, ora li distingui" (→ `progressi`).

---

# 5. Differenze fondamentali

| Dimensione | REALISTICA | ALLENAMENTO |
|---|---|---|
| **Obiettivo** | Simulare l'esame: "cosa mi chiederanno davvero?" | Migliorare: "cosa mi serve davvero adesso?" |
| **Tipo di domanda** | Esposizione aperta, come le farebbe la commissione; sequenza ampiezza→profondità | Domande a tipo mirato (riconosci, distingui, applica, collega, spiega, trasferisci) che colpiscono l'errore specifico |
| **Difficoltà** | Deriva dalla natura della prova (programma, struttura, ultime domande con timer/follow-up) | Adattata all'utente: si alza quando l'utente recupera, si abbassa cambiando tipo quando è bloccato |
| **Uso degli errori precedenti** | Nessuno durante la prova (solo nel report finale) | È il motore: il diario errori (livello, occorrenze, ultima) seleziona l'argomento e il tipo di domanda |
| **Follow-up** | Rari e naturali: chiarire se ambiguo, approfondire se corretto ma superficiale (1-2 per turno al massimo, più frequenti in modalità Difficile) | La "domanda successiva" è pianificata dal ciclo di apprendimento, non improvvisata |
| **Feedback** | Solo conversazionale durante l'orale (il commissario reagisce, mai un pannello punteggi a ogni turno); i punteggi e la correzione arrivano **solo nel report finale**. In Difficile: brevi interruzioni come una commissione tosta | Immediato e correttivo dopo ogni risposta: verifica + elaborazione + esercizio equivalente |
| **Realismo** | Massimo: formulazioni plausibili, ritmo da orale | Subordinato all'apprendimento (ma il testo resta naturale, mai "da quiz") |
| **Apprendimento** | Indiretto: il testing effect scatta comunque perché rispondere è recupero attivo | Diretto: ogni domanda è progettata per correggere una lacuna specifica |
| **Quando usarla** | Verificare dove sei; avvicinarsi alla prova; abituarsi alla pressione | Colmare lacune note; ripassare i punti deboli del diario; prepararsi a una simulazione realistica |
| **Input al sistema** | Bando/PDF + materia (e l'eventuale storico SOLO per il report) | Bando/PDF + materia + memoria utente (`/api/memory`) |
| **Output al report** | Voto, punti forti/deboli, errori principali | Aggiornamento del diario: livello, occorrenze, progressi, superati |

**Regola**: le due modalità NON devono differire solo per il testo di una descrizione. Differiscono per **logica di selezione** (cosa scegliere), **struttura della sequenza** (come ordinare), **gestione del follow-up** (quando approfondire) e **feedback** (quando correggere).

---

# 6. Ricerca sul realismo degli orali

## 6.1 Le dimensioni dell'assessment orale (Joughin, 1998)

Joughin ha definito il framework di riferimento per l'oral assessment: sei dimensioni — tipo di contenuto primario, **interazione**, **autenticità**, **struttura** (grado di standardizzazione), esaminatori, oralità. Due dimensioni ci riguardano direttamente:

- **Interazione**: l'esaminatore può adattare le domande in tempo reale — è il vantaggio unico dell'orale e insieme la sua minaccia alla validità (più interazione = più variabilità).
- **Autenticità**: quanto la prova somiglia alla situazione professionale reale. Per noi: quanto la simulazione somiglia a un vero orale di concorso.

**Applicazione**: il question engine deve bilanciare *struttura* (un piano di domande prevedibile, per non essere caotico) e *interazione* (follow-up naturali). Mai un copione rigido che ignora la risposta (sembra un quiz), mai un caos totale (sembra un chatbot).

## 6.2 Come agisce l'esaminatore: la tassonomia del prompting (Pearce & Chiavaroli, 2020)

Studio verificato (PMC7427130). Gli autori classificano il comportamento dell'esaminatore in un **continuum di 5 tipi di prompting**:

1. **Presentare il compito**: la domanda base, uguale per tutti.
2. **Ripetere informazioni**: ri-orientare un candidato che divaga ("si ricorda che…").
3. **Domande di chiarimento**: "cosa intende per X?" — verificano la comprensione **senza dare la risposta**.
4. **Domande di probing (approfondimento)**: scavano sulla base della risposta data ("quali implicazioni ha questa scelta?") — è il punto in cui l'esaminatore decide se approfondire o andare avanti.
5. **Domande suggestive (leading)**: suggeriscono la risposta ("intende il tipo II, vero?") — **minaccia alla validità**, da evitare.

Principi operativi per gli esaminatori: **neutralità, coerenza, trasparenza, riflessività**.

**Applicazione al prodotto**:
- La **presentazione del compito** = la domanda principale generata dal engine.
- Il **chiarimento** = usato SOLO quando la risposta è ambigua (non a ogni turno).
- Il **probing** = riservato alle risposte corrette ma superficiali o alle ultime domande (modalità Difficile); massimo 1-2 per turno.
- Il **leading** = vietato: se l'utente non sa, la commissione passa avanti (o l'utente usa esplicitamente l'aiuto "Non so rispondere").
- La **ripetizione** = usata raramente e solo per ri-orientare chi divaga troppo.

## 6.3 La selezione degli argomenti: "compressed judgement" e blueprinting (Folwell 2026; Tan 2023)

L'evidenza più recente mostra che **gli orali reali non campionano casualmente il programma**: funzionano come *giudizi compressi* sotto vincoli di tempo (15-30 minuti → solo una frazione del programma può essere coperta). Gli esaminatori usano:

- **Core competency pillars**: gli argomenti-soglia che "aprono" la professione (per noi: i pilastri della materia, es. procedimento amministrativo e legge 241/1990 per il diritto amministrativo);
- **Diagnostic probing triggers**: argomenti scelti perché rivelano errori comuni documentati;
- **Traiettoria**: la prima domanda fa da "pre-autorizzazione" che determina i rami dei follow-up.

Pratica osservata: **ampiezza nel primo terzo, profondità su 1-2 argomenti focali nel resto**.

**Applicazione**: il engine Realistica deve usare un **blueprint** della materia (importanza relativa degli argomenti) e una sequenza ampiezza→profondità, non una selezione uniforme. La prima domanda "apre" la materia; le ultime scavano.

## 6.4 Pesare le fonti di probabilità (senza confondere aneddoto e statistica)

Per i concorsi pubblici italiani **non esistono** dataset pubblici di frequenza delle domande (al contrario dell'ambito medico con banche dati strutturate). Le fonti disponibili sono: bandi reali (programma ufficiale → peso per materie), tracce/verbali diffusi dagli utenti (aneddotici, NON statisticamente rappresentativi), esperienza dei candidati (aneddotica). Lezioni operative:

1. **Il programma del bando è la fonte più solida**: il peso va derivato da lì (numero di materie, argomenti elencati), non da sensazioni.
2. **Le tracce aneddotiche valgono come segnale debole**: utili per "classicità" di un argomento (se decine di persone riportano la stessa domanda, probabilmente è ricorrente), inutili per frequenze precise.
3. **In mancanza di dati, la stima strutturata dell'LLM con regole esplicite** (importanza nel programma + classicità + collegabilità) è il miglior approccio pratico, con un layer deterministico che applica le regole di peso (sezione 16).

---

# 7. Ricerca sulla progettazione delle domande

## 7.1 Le regole di scrittura degli item (Haladyna, Downing & Rodriguez, 2002)

La review di riferimento per la scrittura degli item (31 regole). Per le domande a risposta aperta le regole universali sono: **chiarezza dello stem** (il testo della domanda), **allineamento cognitivo** (la domanda deve testare il livello voluto), **niente ambiguità** (le domande aperte sono ancora più vulnerabili: senza opzioni, lo spazio di risposta è delimitato solo dalla formulazione), **niente negazioni trabocchetto** (NOT/EXCEPT), niente doppie domande ("spiega X e Y" → due domande in una, impossibile da valutare in modo affidabile).

**Applicazione**: una regola di quality-gate per il engine: ogni domanda deve avere **un solo verbo principale**, un **solo oggetto**, e un **criterio di risposta riconoscibile** dall'utente. Le doppie domande vanno segnalate e spezzate.

**Forza dell'evidenza**: alta (revisione sistematica di standard di settore, base delle linee guida per gli item); la parte "aperta" è un'estensione ragionata, non misura sperimentale diretta.

## 7.2 Automatic Item Generation (Gierl & Haladyna)

L'AIG genera item da **modelli cognitivi**: template con elementi mutabili e vincoli → istanziazione → item unici con rationale diagnostico → validazione (revisione esperti + analisi psicometrica). La lezione chiave: **il modello cognitivo è il cuore**, la generazione è la parte meccanica.

**Applicazione**: per noi il "modello cognitivo" è la scheda argomento del bando (contenuti, concetti chiave, errori tipici). Il prompt LLM non deve essere "genera domande belle" ma "istanzia il modello di questo argomento": struttura fissa (esposizione aperta) + contenuto dell'argomento + livello di profondità richiesto. Questo rende la qualità più costante (varietà con qualità stabile).

**Forza dell'evidenza**: media-alta come framework di ingegneria degli item; l'uso con LLM è un'adattamento pratico del nostro caso, non un protocollo validato.

## 7.3 Qualità delle domande LLM: la prova concreta (Law et al., 2025)

Studio verificato (PMC11806894): domande a scelta multipla generate da ChatGPT-4o vs esperti umani per un esame ad alto rischio. Risultati:

- Domande AI **più facili** (indice di difficoltà 0.78 vs 0.69, p<0.01), discriminazione simile (0.22 vs 0.26);
- Domande AI **prevalentemente di livello cognitivo basso** (Remember/Understand), mentre gli umani producevano più analisi e applicazione (χ²=14.27, p=0.003);
- AI con **più inesattezze fattuali** (6% vs 4%), **irrilevanza** (6% vs 0%), **difficoltà inappropriata** (14% vs 1%);
- **Vantaggio enorme di velocità**: 24.5 ore contro 96.

**Applicazione**: il layer di generazione non può essere "prompt e via". Serve (a) prompt con esempi di livello alto e istruzione esplicita di difficoltà adeguata, (b) un **auto-controllo a basso costo** (regole deterministiche + opzionalmente una seconda chiamata economica di verifica: la domanda è fattualmente corretta? ha un solo verbo? è una richiesta di esposizione? la risposta è effettivamente disponibile nel bando?) e (c) difficoltà target esplicita invece di lasciarla al modello.

**Forza dell'evidenza**: alta per il fatto documentato (studio di coorte verificato su MCQ in esame ad alto rischio); il trasferimento agli orali è un'estensione ragionevole, da monitorare con i nostri log.

## 7.4 Domande diagnostiche: i concept inventory (Hestenes et al., 1992)

Il Force Concept Inventory dimostra il principio: **ogni distrattore è costruito per catturare una specifica misconcezione documentata**. La domanda è diagnostica quando la risposta dell'utente identifica *quale* errore concettuale ha, non solo se sa o no.

**Applicazione all'allenamento**: quando l'utente ha confuso X con Y, la domanda successiva non è "dimmi X" ma "ecco un caso in cui X e Y divergono: cosa accade?" — la risposta sbagliata rivela se la confusione è stabile o risolta. Il feedback diventa specifico per l'errore osservato, non generico.

## 7.5 Livelli cognitivi che contano per noi (e perché Bloom da solo non basta)

La ricerca (e la critica a Bloom: tassonomia a una dimensione) suggerisce che per l'orale contano livelli operativi, non etichette: **recall → comprensione → applicazione → analisi → trasferimento**. Per il nostro prodotto, l'utile è definirli come **tipi di domanda** (sezione 15) con un verbo guida ciascuno, perché l'allenamento li usa come leva di difficoltà e rotazione. La simulazione realistica li usa implicitamente: le domande reali oscillano tra esposizione (recall/comprensione), approfondimento (analisi) e casi (applicazione).

---

# 8. Retrieval practice

**Che cosa dimostra** (fonti verificate):
- **Roediger & Karpicke (2006)**: a 5 minuti rileggere batte testare; **a 1 settimana** il gruppo "test ripetuti" ricorda il **61%** contro il **40%** del gruppo "rilettura". Il testing effect è *differito*: scomodo subito, vincente dopo.
- **Karpicke & Blunt (2011)**: retrieval practice batte il concept mapping sull'apprendimento concettuale (0.67 vs 0.45, ~22 punti percentuali).
- **Adesope et al. (2017)**, meta-analisi: effetto complessivo **g = 0.61** (moderato-grande).

**Forza dell'evidenza**: alta (esperimenti controllati + meta-analisi). È tra gli effetti più robusti della psicologia dell'apprendimento.

**Applicazione al prodotto**:
- Ogni domanda (in entrambe le modalità) è già una forma di retrieval practice: rispondere senza rileggere.
- Nell'allenamento, il ciclo "errore → correzione → **riprova a distanza**" è esattamente il protocollo che massimizza la ritenzione: mai "rileggi la definizione", sempre "recuperala".
- Il report e il diario devono comunicare il concetto: "hai recuperato X senza errori per 2 sessioni → è tuo" (il `progressi` già esistente).

---

# 9. Deliberate practice

**Che cosa dimostra**:
- **Ericsson (1993)** definisce la pratica deliberata: attività progettate *specificamente* per superare una debolezza, con feedback immediato e obiettivo chiaro. Non è "fare tanto".
- **Macnamara et al. (2014)**, meta-analisi: la pratica deliberata spiega solo il **~12% della varianza** nelle prestazioni complessive (26% nei giochi, ~1% nelle professioni). L'interpretazione onesta: conta, ma non è l'unico fattore; per la formazione professionale l'effetto è più debole che per lo sport.

**Forza dell'evidenza**: moderata. La definizione di Ericsson è accettata; la sua onnipotenza è stata ridimensionata dalla meta-analisi.

**Applicazione al prodotto**:
- L'allenamento è pratica deliberata se (e solo se) ogni domanda ha **un obiettivo di miglioramento esplicito** (colpisce un errore noto) e **feedback immediato**. Altrimenti è solo "esercizio".
- Non promettere risultati magici nel marketing: "allenati sui punti deboli" è corretto, "diventerai perfetto in 3 giorni" no.
- Il tipo di errore guida il tipo di esercizio (sezione 15): questo è il cuore della pratica deliberata applicata.

---

# 10. Feedback e formative assessment

**Che cosa dimostra**:
- **Black & Wiliam (1998)**: il formative assessment muove di **0.4-0.7 deviazioni standard**; beneficia di più gli studenti in difficoltà (chiude i divari).
- **Bangert-Drowns et al. (1991)**, meta-analisi: il feedback è efficace quando è **intenzionale**, riferito a criteri, e induce elaborazione cognitiva (non semplice "giusto/sbagliato").
- **Kulhavy & Stock**: il feedback ottimale ha due parti — **verifica** (giusto/sbagliato) + **elaborazione** (perché, come correggere). Il modello Hattie & Timperley (2007) già citato in `simulation-research.md` conferma: feedback su "come procedere" > feedback su "come sei".

**Applicazione**:
- **Realistica**: niente feedback a ogni turno (romperebbe l'illusione dell'orale). Il report finale è il momento del feedback (già implementato).
- **Allenamento**: feedback **immediato e corretto**: verifica + "cosa hai sbagliato" + "perché" + "come si fa" + (se serve) una domanda equivalente. La "revisione finale" STT già esiste; il feedback scritto del commissario è già strutturato in punteggi (chiarezza, struttura, contenuto, lessico, pertinenza).
- La **riprova immediata** dopo correzione (esercizio equivalente) è più efficace della sola spiegazione: è l'applicazione del feedback elaborato.

---

# 11. Adaptive questioning

**Che cosa dimostra**:
- **Bayesian Knowledge Tracing — BKT (Corbett & Anderson, 1995)**: modella la conoscenza di un'abilità come stato latente binario (padroneggiata/non), aggiornato a ogni risposta con 4 parametri: P(L0) probabilità iniziale di conoscere, P(T) probabilità di apprendere, P(G) probabilità di indovinare, P(S) probabilità di sbagliare per distrazione. I Cognitive Tutors che lo usano producono apprendimento equivalente in **1/3-1/2 del tempo**.
- **Deep Knowledge Tracing — DKT (Piech et al., 2015)**: reti neurali; supera il BKT in accuratezza predittiva ma richiede dataset enormi e GPU → **da NON costruire** per noi.
- **Mastery learning (Bloom 1984; Guskey & Pigott)**: padronanza a soglia (es. ≥85%) su più sessioni prima di passare oltre; effetto medio ~0.59.
- **Formative assessment e dynamic testing**: valutare la *reattività* all'aiuto (quanto l'utente migliora con un indizio) misura il potenziale di apprendimento meglio dello stato statico.

**Applicazione pratica (senza ML pesante)**:
- Il BKT ridotto a una **scala di mastery per argomento**: invece di probabilità formali, usare il livello del diario (1-5, già esistente) aggiornato con regole deterministiche: risposta buona → +1; sbagliata → −1 (o reset); soglia ≤2 → superato (già implementato in `memory.js`).
- **Criterio di mastery a doppia sessione**: un concetto è "in recupero" quando riesci in 2 sessioni consecutive (non 2 volte nella stessa sessione: serve il gap temporale del spacing).
- **Quando insistere e quando smettere**: un concetto sbagliato 3 volte NON va ripetuto all'infinito. Dopo il picco di errore si cambia tipo di domanda; se continua a fallire, si abbassa la difficoltà (tipo più semplice) e si ripete a distanza; quando il diario lo segna superato e l'utente risponde bene 2 sessioni consecutive, esce dall'allenamento attivo.
- **Dynamic testing**: l'aiuto a gradini del "Non so rispondere" (spunto → risposta modello) è già una forma di misura: se l'utente risponde bene dopo lo *spunto*, la lacuna è parziale; se non risponde nemmeno con lo spunto, è profonda. Questa informazione può entrare nel diario (lacuna parziale vs profonda).

---

# 12. Follow-up e interazione della commissione

**Che cosa dimostra**:
- **Pearce & Chiavaroli (2020)** (verificato): il probing è ciò che distingue l'orale dal questionario. L'esaminatore approfondisce quando la risposta è corretta ma superficiale, chiarisce quando è ambigua, e **cambia argomento quando il candidato è in difficoltà** (non spreca tempo né umilia). Le domande suggestive (leading) corrompono la validità.
- La letteratura sull'oral assessment (Joughin) attribuisce all'**interazione** sia il valore sia il rischio dell'orale: l'approfondimento adattivo è ciò che rende l'orale più informativo di un test scritto.

**Applicazione — quando fare follow-up (regole esplicite, non "a ogni risposta")**:
1. **Risposta corretta ma generica/senza fonte** → 1 probing: "Può citare il riferimento normativo?" o "Mi faccia un esempio concreto." (max 1-2 per turno).
2. **Risposta parzialmente corretta** → 1 chiarimento mirato sul punto carente: "Cosa intende per X?" (chiarimento, mai leading).
3. **Risposta sbagliata o vuoto** → in Realistica: la commissione passa avanti con naturalezza ("Va bene, passiamo oltre."). L'aiuto è un comando esplicito dell'utente, non della commissione.
4. **Modalità Difficile** → follow-up più frequenti e più aggressivi (interruzioni, richieste di fonte, "e se cambiasse questa condizione?") — già coerente con la modalità.
5. **Allenamento** → il follow-up non è improvvisato: la "domanda successiva" è pianificata dal ciclo di apprendimento (stesso argomento, tipo diverso; oppure argomento collegato).

**Costo**: il follow-up è una chiamata LLM aggiuntiva. Per contenere i costi: generare il follow-up **nella stessa chiamata della reazione conversazionale della commissione** (il commissario dice "Bene. E mi faccia un esempio" come parte del turno — questo è il "feedback" del turno in Realistica: conversazionale, mai un pannello punteggiato) oppure limitare i follow-up a un sottinsieme di turni (es. 30% delle risposte corrette, 100% in Difficile).

---

# 13. Difficoltà

## 13.1 Le leve della difficoltà (non "facile/medio/difficile")

La ricerca sulla progettazione dei test indica che la difficoltà si modula su assi concreti. Per noi, in ordine di costo/beneficio:

| Leva | Come si usa | Costo |
|---|---|---|
| **Profondità richiesta** | Domanda di superficie ("che cos'è X") vs domanda che richiede di spiegare il meccanismo ("come funziona il procedimento, passo per passo") | Basso |
| **Collegamento tra concetti** | "X da sola" vs "come si collega X a Y" | Basso |
| **Applicazione a un caso** | Esposizione teorica vs caso concreto ("un cittadino presenta un'istanza…") | Medio |
| **Pressione temporale** | Timer sulle ultime domande (già in Difficile) | Zero |
| **Follow-up** | Chiedere fonte, esempio, "e se cambiasse la condizione?" | Medio (costo LLM) |
| **Ambiguità controllata** | Domande volutamente aperte ("qual è la cosa più importante da ricordare?") — usare con cautela | Basso |

## 13.2 La differenza fondamentale tra le due modalità

- **Realistica**: la difficoltà **deriva dalla natura della prova** (programma, struttura dell'orale, domande finali più profonde, timer). Non si adatta all'utente: un orale vero non si fa più facile se il candidato è bravo né più difficile se è impreparato. Si adatta solo nel modo in cui la commissione *conduce* (passa oltre, approfondisce).
- **Allenamento**: la difficoltà **si adatta all'utente** in modo reattivo: per un concetto fallito, si parte dal tipo più semplice (riconoscimento/distinzione), si sale (applicazione → collegamento → trasferimento) man mano che recupera; se l'utente è bloccato, si scende di tipo o si offre l'aiuto a gradini. La zona di difficoltà ottimale è quella dove l'utente ha ~50-80% di successo (abbastanza da imparare, abbastanza da non frustrarsi).

**Regola anti-slop**: mai "difficoltà casuale" o "rendiamo la domanda più astrusa per sembrare intelligente". Ogni variazione di difficoltà deve avere un motivo (struttura della prova O stato dell'utente).

---

# 14. Errori e debolezze nel tempo

**Il caso del brief**: l'utente ha sbagliato l'articolo 6 GDPR tre volte. Il sistema deve capire: *cosa non sa* (mancata conoscenza), *cosa confonde* (confusione con altro articolo/concetto), *se l'errore è stabile* (tre volte di fila = stabile), *se è migliorato* (risposta buona = migliorata), *quale domanda serve adesso*, *quando riprovare*, *quando smettere di insistere*.

## 14.1 Le evidenze

- **Spacing / spaced retrieval (Cepeda et al., 2006)**: la ritenzione è massimizzata con intervalli tra sessioni pari a **~10-20% dell'intervallo di ritenzione target** (per ricordare a 1 settimana, riprovare dopo ~12-24 ore; per ricordare a 1 mese, riprovare dopo ~3-6 giorni). Il diario deve usare `ultima` (già presente) per schedulare la riprova, non solo il livello.
- **Mastery learning**: soglia di padronanza su **sessioni successive**, non su una risposta singola.
- **Corrective feedback**: l'errore va corretto subito (in allenamento) e riprovato nella forma giusta; l'errore non corretto si consolida.
- **Knowledge tracing (BKT)**: modello semplice per tracciare mastery per abilità — noi lo riduciamo alla scala livello 1-5 del diario.
- **Error-based learning**: l'errore è informazione diagnostica; il valore è nel *tipo* di errore, non solo nel fatto.

## 14.2 Proposta: tre attributi di errore per ogni tema del diario

Lo schema attuale (`temi: [{tema, livello, note, occorrenze, ultima, stato}]`) è una buona base. Estensione minima e sufficiente — **un campo in più**:

```
temi[]: {
  tema, livello(1-5), occorrenze, ultima, stato,
  tipo_errore: "conoscenza" | "confusione" | "applicazione" | "argomentazione"
}
```

- `conoscenza` = non sa la nozione → prossima domanda: esposizione guidata, poi aiuto a gradini.
- `confusione` = confonde con un altro concetto → prossima domanda: **distinzione** ("qual è la differenza tra X e Y?"), la più diagnostica.
- `applicazione` = sa la teoria ma non la usa nei casi → prossima domanda: **caso applicativo**.
- `argomentazione` = sa ma non argomenta/fonte → prossima domanda: **spiegazione con fonte/parole proprie**.

## 14.3 La macchina a stati per "quando riprovare"

Per ogni tema attivo:

1. **Ora** (stessa sessione, tipo diverso): l'utente ha appena sbagliato → riprova immediata con tipo di domanda diverso (da `confusione` → domanda di distinzione).
2. **A distanza** (sessione successiva): se l'errore è stabile (occorrenze ≥ 2) → il tema entra nel "ripasso" con intervallo crescente (1d → 3d → 7d, massimo ~30d) usando `ultima`. L'intervallo di partenza è la scala operativa di §16.2: `intervallo_target = {livello 5 → 1g, livello 4 → 3g, livello 3 → 7g}`.
3. **Superato**: livello ≤ 2 (già in `memory.js`) E risposta buona in 2 sessioni consecutive → esce dall'allenamento attivo, resta nel diario come `superato`/`progressi`.
4. **Smettere di insistere**: se dopo 3 tentativi a distanza l'utente non migliora, abbassa il tipo di difficoltà (torna a riconoscimento/distinzione) e alterna con altri argomenti — mai più di ~40% delle domande di una sessione sullo stesso tema (anti-monotonia).

**Regola anti-"ripeti la definizione sbagliata"**: il sistema non deve mai produrre due volte di fila la stessa domanda per lo stesso errore. La rotazione dei tipi (sezione 15) è il meccanismo che lo garantisce.

---

# 15. Criteri per valutare una domanda

Una domanda del engine è buona se soddisfa questi criteri (checklist, verificabile):

1. **Un solo oggetto**: chiede UNA cosa (niente "spiega X e Y").
2. **Verbo di azione esplicito**: espone, confronta, applica, collega, giustifica — mai "parlami di" (troppo vago) salvo apertura reale dell'orale.
3. **Rispondibile dal materiale**: la risposta corretta è ricavabile dal bando/programma (nessuna invenzione di leggi specifiche ignote — già nel prompt della bank).
4. **Criterio di valutazione riconoscibile**: l'utente capisce cosa costituisce una buona risposta (completezza, fonte, esempio).
5. **Difficoltà giustificata**: la difficoltà corrisponde alla leva scelta (profondità/collegamento/caso/tempo), non è casuale.
6. **Non diagnostica per sbaglio**: in Realistica non deve "colpire" le debolezze note dell'utente; in Allenamento deve colpire *esattamente* il tipo di errore noto.
7. **Formulazione naturale**: nessun AI-slop (sezione 17), meno di ~30 parole per la domanda principale.
8. **Nessuna doppia negazione / nessun trabocchetto**: regole di Haladyna.
9. **Non suggestiva**: non contiene la risposta (anti-leading, Pearce & Chiavaroli).
10. **Valutabile**: il modello che darà il feedback deve poter distinguere buona/cattiva risposta senza ambiguità.

La checklist deriva dalle fonti delle sezioni 6-7 (Joughin, Pearce & Chiavaroli, Haladyna, Law et al.): forza dell'evidenza per i punti 1-4 e 8-10 alta (standard consolidati), per i punti 5-7 alta (regole derivate dal brief di prodotto e dai marcatori di naturalità).

**Quality-gate a costo zero**: il prompt di generazione istruisce il modello a produrre una scheda JSON per ogni domanda con i campi `testo`, `tipo` (esposizione|distinzione|caso|collegamento|trasferimento|argomentazione), `argomento`, `difficolta` (1-3), `fonte` (se applicabile). Il layer deterministico valida: un solo oggetto (regola euristica), lunghezza ≤ soglia, tipo ∈ insieme, argomento ∈ programma. Le domande che falliscono vengono scartate o rigenerate (max 1 retry per risparmiare token).

---

# 16. Sistema di scoring/ranking delle domande

Proposta di modello di valore (semplice, deterministico, spiegabile):

## 16.1 Modalità REALISTICA

```
score_realistica(t) = w1 · importanza(t) + w2 · classicità(t) + w3 · collegabilità(t)
                     − w4 · recency(t) − w5 · ripetizione(t)
```

- `importanza(t)`: peso dell'argomento nel programma (derivato dal bando: numero di volte citato, posizione nell'elenco, giudizio strutturato del modello su 1-3).
- `classicità(t)`: quanto l'argomento è "da orale" (ricorrente nelle tracce aneddotiche, pilastro della materia) — 0-2.
- `collegabilità(t)`: quanto si presta a follow-up e collegamenti (per le ultime domande profonde) — 0-2.
- `recency(t)`: penalità se l'argomento è stato chiesto di recente nella stessa sessione (anti-ripetizione).
- `ripetizione(t)`: penalità se compare già in questa simulazione.

**Sequenza**: ordinamento per score; il primo terzo attinge dagli argomenti ad alta importanza (ampiezza); le ultime 3 domande attingono agli argomenti ad alta collegabilità/profondità (focali). Default pesi: w1=0.5, w2=0.3, w3=0.2, w4=0.3, w5=0.5.

## 16.2 Modalità ALLENAMENTO

```
score_allenamento(t) = w1 · debolezza(t) + w2 · spacing_gain(t) + w3 · diagnosticità(tipo)
                     − w4 · monotonia(t) + w5 · rotazione_tipo(t)
```

- `debolezza(t)`: dal diario — livello (3-5), stato attivo, occorrenze (tema con livello 5 e 4 occorrenze ha priorità).
- `spacing_gain(t)`: quanto è *il momento giusto* per riprovare — in base a `ultima` e all'intervallo target (Cepeda 10-20%): troppo presto = ancora in memoria a breve (basso valore), troppo tardi = quasi dimenticato (alto valore fino a un tetto). Forma semplice: `gain = min(1, giorni_da_ultima / intervallo_target(t))`, dove `intervallo_target(t)` è definito dal livello del diario: **livello 5 → 1 giorno, livello 4 → 3 giorni, livello 3 → 7 giorni** (livello ≤ 2 = fuori dall'allenamento attivo).
- `diagnosticità(tipo)`: il tipo di domanda giusto per il tipo di errore (distinzione per confusione = 1.0; esposizione per conoscenza = 0.7; …).
- `monotonia(t)`: penalità se il tema domina la sessione (cap ~40% delle domande).
- `rotazione_tipo(t)`: premia il tipo di domanda *non* usato nell'ultimo tentativo su quel tema (anti-"ridai la definizione").

**Pesi di default**: w1=0.4, w2=0.3, w3=0.2, w4=0.3, w5=0.2. Il tutto è una **somma pesata spiegabile**: il log può dire "questa domanda è qui perché livello 5 + intervallo scaduto + tipo distinzione per confusione nota".

## 16.3 Nota sui pesi

I pesi sono **euristiche iniziali**, non parametri da calibrare con IRT (serve N≫100, non lo abbiamo). Il prodotto non deve pretendere precisione psicometrica: deve scegliere *ragionevolmente meglio* del caso. Un A/B semplice (tasso di completamento, soddisfazione, miglioramento del diario) può rifinire i pesi nel tempo. L'IRT resta fuori scope (sezione 20).

---

# 17. Come evitare domande AI-slop

## 17.1 L'evidenza

- **Law et al. (2025)**: le domande LLM tendono a essere più facili, più superficiali (livelli cognitivi bassi) e più spesso inesatte o irrilevanti. Il problema non è la *forma* ma la *qualità di progettazione*: il modello senza guida produce domande "da quiz", non "da orale".
- **Ricerca sui marcatori linguistici dell'AI text**: ritmo uniforme (frasi di lunghezza simile), abuso di connettivi formali ("inoltre", "è importante notare"), hedges eccessivi, struttura a elenchi/grassetti, diversità lessicale ridotta.
- **Percezione (Jain et al.; Nakano et al.)**: la rivelazione dell'origine AI erode fiducia/autenticità; gli utenti con alta AI literacy sono più tolleranti. Non possiamo nascondere che sia AI, quindi dobbiamo **sembrare umani** nel contenuto: la naturalità è un requisito di prodotto, non di immagine.
- **Anthropic, prompting best practices**: per evitare lo slop: istruzioni di stile negative esplicite, **few-shot con esempi reali**, niente struttura a elenchi quando non serve, ruolo definito.

## 17.2 Che cosa rende una domanda "AI slop" (checklist)

- Formulazione **troppo perfetta/accademica**: "Si prega di illustrare compiutamente il principio…" → mai un esaminatore parla così.
- **Eccessiva lunghezza**: domande da 60+ parole con premesse e incisi.
- **Difficoltà casuale**: "approfondisca l'intersezione tra il principio di buon andamento e le recenti riforme…" — nessuno chiederebbe così.
- **Collegamenti artificiosi**: obbligare a collegare X e Y che non c'entrano, per sembrare intelligente.
- **Richiesta impossibile**: chiedere l'articolo di legge specifico di un bando che il modello non conosce (già gestito dal prompt, da mantenere).
- **Elenco di cose**: "elencare i 5 principi" → un orale chiede di *spiegare*, non di elencare.
- **Doppie domande**: "spieghi X e indichi Y".
- **Gergo da bando ripetuto a pappagallo**: copiare la nomenclatura del bando senza capirla.

## 17.3 Le regole operative nel prompt (prima/dopo)

**PRIMA (AI-slop)**: *"Illustri esaustivamente il principio di legalità, evidenziando le interconnessioni con il principio di buon andamento e fornendo un'analisi critica delle implicazioni operative, corredata da riferimenti normativi."* → 40+ parole, doppio oggetto, pretesa accademica.

**DOPO (naturale)**: *"Il principio di legalità: in cosa consiste concretamente, e da quale articolo della Costituzione deriva?"* → un solo oggetto, verbo semplice, richiesta di fonte, formulazione parlata.

Il prompt di generazione deve includere: (a) 2-3 esempi di domande naturali come few-shot (stile da commissione reale, ~15-25 parole); (b) divieti espliciti (niente "elencare", niente doppie domande, niente formulazioni accademiche, massimo 30 parole); (c) la regola "come la direbbe una persona davanti al candidato, non come la scriverebbe un documento".

---

# 18. Esempi concreti

Argomento generico per i tre esempi: **il silenzio assenso nella legge 241/1990** (utente che in passato ha confuso silenzio assenso e silenzio inadempimento — errore di tipo `confusione`).

## 18.1 Domanda REALISTICA

> *"Il silenzio assenso: come funziona in pratica e in che rapporti sta col silenzio-inadempimento?"*

**Perché funziona**: è una domanda da vera commissione — espone il meccanismo (procedimento), chiede il confronto con l'istituto gemello (molto frequente negli orali), e apre a follow-up naturali ("e quali procedimenti ne sono esclusi?"). Formulazione parlata (~20 parole), un solo oggetto. La commissione la farebbe davvero perché il silenzio assenso è un pilastro della 241/1990 (alta importanza + alta classicità).

## 18.2 Domanda di ALLENAMENTO (stesso argomento, dopo l'errore di confusione)

> *"Un cittadino presenta un'istanza e l'amministrazione non risponde entro 30 giorni. In quale caso il silenzio vale come accoglimento e in quale invece no?"*

**Perché funziona**: è una domanda di **distinzione applicata** — colpisce esattamente l'errore noto (confonde i due silenzi) senza ripetere la definizione; il caso concreto forza l'utente a recuperare le condizioni (procedimenti a istanza di parte, no interessi sensibili). Il tipo (caso/distinzione) è diverso dall'ultimo tentativo (rotazione), il feedback potrà dire "qui avevi confuso: nel silenzio inadempimento non c'è accoglimento, c'è rimedio in sede giudiziaria".

## 18.3 Domanda AI-SLOP (da NON fare)

> *"Esplori in modo esaustivo il fenomeno del silenzio assenso, analizzando criticamente l'evoluzione normativa dall'originaria formulazione della legge 241/1990 fino alle più recenti modifiche, e ne illustri le interconnessioni con i principi di buon andamento ed efficacia dell'azione amministrativa, senza trascurare le implicazioni in tema di autotutela."*

**Perché è slop**: doppio/triplo oggetto, 45+ parole, pretesa accademica ("esplori", "analizzando criticamente"), collegamenti artificiosi (buon andamento + autotutela impilati), nessun esaminatore parlerebbe così; la risposta sarebbe un tema, non un orale; la valutazione sarebbe ambigua (troppi criteri). L'utente percepisce "domanda generata da AI per sembrare intelligente".

---

# 19. Architettura logica consigliata

Tre strati separati e testabili (ognuno puro/unit-testabile):

```
[Input]  bando/PDF → estrattore programma (esistente)
         materia   → blueprint materia (importanza argomenti)
         utente    → memoria (temi/abitudini/progressi) via /api/memory

        ┌────────────────────────────────────────────┐
        │ 1. STRATO DI DECISIONE (deterministico)     │  ← NUOVO (puro, ~100 righe)
        │    - seleziona argomento: score_modalità    │
        │    - seleziona TIPO di domanda per l'errore │
        │    - ordina la sequenza (ampiezza→profondità│  o rotazione tipi + spacing)
        │    - vincoli anti-ripetizione/monotonia     │
        └──────────────┬─────────────────────────────┘
                       ▼
        ┌────────────────────────────────────────────┐
        │ 2. STRATO DI GENERAZIONE (LLM, una chiamata)│  ← esistente, da rifinire
        │    prompt per argomenti+tipi selezionati,   │
        │    few-shot naturale, regole anti-slop,     │
        │    output JSON {testo, tipo, argomento,     │
        │                difficolta, fonte}           │
        └──────────────┬─────────────────────────────┘
                       ▼
        ┌────────────────────────────────────────────┐
        │ 3. STRATO DI QUALITÀ (deterministico +      │  ← NUOVO (leggero)
        │    auto-verifica economica opzionale)       │
        │    - validazione campi/schemi               │
        │    - regole: un solo oggetto, lunghezza,    │
        │      rispondibile dal materiale             │
        │    - max 1 retry, poi fallback su domanda   │
        │      della cache precedente                 │
        └──────────────┬─────────────────────────────┘
                       ▼
        [Sessione]  domanda → risposta → valutazione LLM (esistente)
                    → identificazione lacuna {tema, tipo_errore}
                    → aggiornamento memoria (/api/memory, esistente)
                    → prossima decisione (torna a strato 1)
```

**Ciclo in sessione (Realistica)**: sequenza pre-pianificata dallo strato 1 con score; il feedback finale alimenta il report; la memoria si aggiorna solo a fine simulazione (l'orale non interrompe). I follow-up sono scelti dallo strato 1 *a runtime* in base alla risposta (regole sezione 12) e generati insieme al feedback per risparmiare token.

**Ciclo in sessione (Allenamento)**: ogni risposta → valutazione → `tipo_errore` → lo strato 1 decide la prossima domanda *istantaneamente* (stesso argomento tipo diverso, oppure argomento collegato, oppure spacing). Aggiornamento memoria dopo ogni risposta (o a fine sessione con un unico update — più economico; consigliato: a fine sessione, con i dati della sessione nel payload).

**Costi stimati per sessione** (invariati rispetto a oggi): Realistica = 1 chiamata bank (o cache) + N chiamate feedback/follow-up; Allenamento = 1 chiamata bank mirata (6 domande) + N chiamate feedback. L'aggiunta di strato 1 e 3 è **deterministica, costo zero**.

---

# 20. Cosa NON costruire

1. **Niente Deep Knowledge Tracing / reti neurali**: richiede dataset e GPU; il BKT ridotto a regole deterministiche sul livello del diario basta e avanza.
2. **Niente IRT vera / calibrazione item**: richiede centinaia di risposte per item; usiamo euristiche esplicite e spieghiamo perché.
3. **Niente database di domande pre-scritte**: un bando arbitrario non è copribile a mano; la generazione LLM con cache 7 giorni è la scelta giusta (già esistente).
4. **Niente "memoria conversazionale" delle simulazioni**: solo la memoria sintetica (già scelta nel brief; `memory.js` la implementa). Il question engine legge SOLO temi/abitudini/progressi.
5. **Niente parsing sofisticato del PDF** per estrarre "domande": l'estrazione del programma basta; le domande le genera il modello sui contenuti.
6. **Niente modelli di difficoltà a 5 livelli con calibrazione**: 3 livelli con le leve della sezione 13, basta.
7. **Niente feedback a ogni turno in Realistica**: rompe l'illusione dell'orale e raddoppia i costi.
8. **Niente AI slop layer "letterario"** (riscrivere il testo per farlo sembrare umano con un'altra chiamata): la naturalità si ottiene nel prompt di generazione, non con un post-processo.
9. **Niente sistema di raccomandazione cross-utente** ("altri utenti che hanno sbagliato X…"): dati insufficienti, zero valore, costo di privacy.
10. **Niente follow-up obbligatorio a ogni risposta**: le regole della sezione 12 valgono anche come budget.

---

# 21. Rischi e limiti

1. **Qualità della valutazione = limite principale**: il ciclo (domanda → valutazione → prossima domanda) vale quanto il feedback del modello. Se il feedback è vago ("risposta insufficiente"), il `tipo_errore` estratto è rumoroso e l'allenamento sceglie male. Mitigazione: estrarre il tipo di errore con un formato JSON guidato dal modello (come si fa con la memoria), con fallback a `conoscenza` se incerto; il layer deterministico valida i campi.
2. **Sovradattamento al diario**: se l'utente ha 10 temi deboli e l'allenamento gira solo su quelli, diventa monotono e frustrante. Mitigazione: cap 40% per tema, quota di domande "nuove" per sessione (es. 1-2 su argomenti mai visti), e la regola anti-monotonia.
3. **Stime di importanza senza dati**: `importanza(t)` per il bando è una stima del modello. Mitigazione: usare il bando come ancora (nomenclatura, ordine) e non pretendere precisione; il livello 1-3 è sufficiente per ordinare.
4. **Costo LLM del follow-up**: ogni follow-up è una chiamata. Mitigazione: follow-up incorporato nel turno di feedback (stessa chiamata) o limitato per turno.
5. **Dimenticanza della memoria**: il decay −1 per sessione (in `mergeMemory`) può segnare `superato` un tema che l'utente ha semplicemente evitato. Mitigazione: il decay è già prudente (1 livello a sessione, mai a zero), e la condizione di `superato` (livello ≤ 2) va abbinata a un controllo nelle sessioni successive (se ri-sbaglia, il livello torna su).
6. **Doppio invio / interruzioni**: già gestite dal flusso vocale/`S.sending`; il question engine non introduce stati nuovi.
7. **Utente senza storico (primo accesso)**: l'allenamento senza memoria non può essere mirato → degrada elegantemente a "domande sui pilastri della materia con rotazione di tipi" (allenamento generico), con il report che costruisce la prima memoria.

---

# 22. Fonti complete e verificabili

## Realismo degli orali
- **Joughin, G. (1998)**. *Dimensions of oral assessment*. Assessment & Evaluation in Higher Education, 23(4), 367–378. — Sei dimensioni dell'oral assessment; interazione e autenticità. [ERIC EJ579818](https://eric.ed.gov/?id=EJ579818) | [Taylor & Francis](https://www.tandfonline.com/doi/abs/10.1080/0260293980230404)
- **Pearce, J., & Chiavaroli, N. (2020)**. *Prompting candidates in oral assessment contexts: a taxonomy and guiding principles*. Journal of Medical Education and Curricular Development, 7. — Tassonomia dei 5 tipi di prompting; principi di neutralità/coerenza/trasparenza/riflessività. **Verificato**: [PMC7427130](https://pmc.ncbi.nlm.nih.gov/articles/PMC7427130/)
- **Folwell, E. (2026)**; **Tan, W. C. (2023)**. Orali reali come *compressed judgement*: blueprinting, argomenti-àncora, ampiezza→profondità. [Taylor & Francis (compressed judgement)](https://www.tandfonline.com/doi/full/10.1080/02602938.2026.2656293) | [Springer (Tan, 2023)](https://link.springer.com/article/10.1007/s44217-023-00083-6) — da usare con cautela (evidenza qualitativa, non statistica).

## Progettazione delle domande
- **Haladyna, T. M., Downing, S. M., & Rodriguez, M. C. (2002)**. *A review of multiple-choice item-writing guidelines for classroom assessment*. Applied Measurement in Education, 15(3), 309–333. — Regole di scrittura item; quelle universali valgono per le domande aperte. [ERIC EJ660246](https://eric.ed.gov/?id=EJ660246)
- **Gierl, M. J., & Haladyna, T. M. (2013)**. *Automatic Item Generation: Theory and Practice*. Routledge. — Modello cognitivo → template → istanziazione → validazione. [Routledge](https://www.routledge.com/Automatic-Item-Generation-Theory-Practice/Gierl-Haladyna/p/book/9780415897518) | [Gierl & Lai (2018) PMC5978592](https://pmc.ncbi.nlm.nih.gov/articles/PMC5978592/)
- **Law, A. K. K., et al. (2025)**. *AI versus human-generated multiple-choice questions for medical education: a cohort study*. BMC Medical Education, 25, 208. — AI più facile e più superficiale; più inesattezze; 4x più veloce. **Verificato**: [PMC11806894](https://pmc.ncbi.nlm.nih.gov/articles/PMC11806894/)
- **Hestenes, D., Wells, M., & Swackhamer, G. (1992)**. *Force Concept Inventory*. The Physics Teacher, 30, 141–158. — Distrattori costruiti sulle misconcezioni documentate. [PhysPort FCI](https://www.physport.org/assessments/FCI)

## Learning science
- **Roediger, H. L., & Karpicke, J. D. (2006)**. *Test-enhanced learning: taking memory tests improves long-term retention*. Psychological Science, 17(3), 249–255. — 61% vs 40% a 1 settimana. [PubMed 16507066](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- **Karpicke, J. D., & Blunt, J. R. (2011)**. *Retrieval practice produces more learning than elaborative studying with concept mapping*. Science, 331, 772–775. — 0.67 vs 0.45. [PubMed 21252317](https://pubmed.ncbi.nlm.nih.gov/21252317/)
- **Adesope, O. O., Trevisan, D. A., & Sundararajan, N. (2017)**. *Rethinking the use of tests: a meta-analysis of practice testing*. Review of Educational Research, 87(3), 659–701. — g = 0.61. [ERIC EJ1141817](https://eric.ed.gov/?id=EJ1141817)
- **Cepeda, N. J., et al. (2006)**. *Distributed practice in verbal recall tasks*. Psychological Bulletin, 132(3), 354–380. — Intervallo ottimale 10-20% dell'intervallo di ritenzione. [ResearchGate](https://www.researchgate.net/publication/7062225_Distributed_Practice_in_Verbal_Recall_Tasks_A_Review_and_Quantitative_Synthesis)
- **Rohrer, D., & Taylor, K. (2007)**. *The shuffling of mathematics problems improves learning*. Instructional Science, 35, 481–498. — Interleaving > blocked. [Springer](https://link.springer.com/article/10.1007/s11251-007-9015-8)
- **Bloom, B. S. (1984)**. *The 2 sigma problem: the search for methods of group instruction as effective as one-to-one tutoring*. Educational Researcher, 13(6), 4–16. [JSTOR](https://www.jstor.org/stable/1175554)
- **Macnamara, B. N., Hambrick, D. Z., & Oswald, F. L. (2014)**. *Deliberate practice and performance in music, games, sports, education, and professions*. Psychological Science, 25(8), 1608–1618. — ~12% della varianza complessiva. [PubMed 24986855](https://pubmed.ncbi.nlm.nih.gov/24986855/)

## Sistemi adattivi e feedback
- **Corbett, A. T., & Anderson, J. R. (1995)**. *Knowledge tracing: modeling the acquisition of procedural knowledge*. User Modeling and User-Adapted Interaction, 4, 253–278. — BKT, 4 parametri. [CMU/ACT-R](http://act-r.psy.cmu.edu/wordpress/wp-content/uploads/2012/12/893CorbettAnderson1995.pdf)
- **Piech, C., et al. (2015)**. *Deep Knowledge Tracing*. NeurIPS. [arXiv:1506.05908](https://arxiv.org/abs/1506.05908)
- **Open Spaced Repetition / FSRS**. Algoritmo di spaced repetition open source (modello DSR). [GitHub](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler) — da non integrare per intero, ma il concetto di intervalli su difficulty/stability/retrievability ispira la schedula del diario.
- **Bangert-Drowns, R. L., Kulik, C.-L. C., Kulik, J. A., & Morgan, M. (1991)**. *The instructional effect of feedback in test-like events*. Review of Educational Research, 61(2), 213–238. [Sage](https://journals.sagepub.com/doi/abs/10.3102/00346543061002213)
- **Black, P., & Wiliam, D. (1998)**. *Inside the Black Box*. Phi Delta Kappan. — Formative assessment 0.4-0.7 SD. [Kappan](https://kappanonline.org/inside-the-black-box-raising-standards-through-classroom-assessment/)
- **Winget, M., & Persky, A. M. (2022)**. *A practical review of mastery learning*. American Journal of Pharmaceutical Education. — Mastery learning e criteri. [PMC10159400](https://pmc.ncbi.nlm.nih.gov/articles/PMC10159400/)

## AI text e naturalità
- **Jain, G., et al.** *Revealing the source: how awareness alters perceptions of AI and human-generated responses*. — Percezione cambia con la disclosure. [PMC11090870](https://pmc.ncbi.nlm.nih.gov/articles/PMC11090870/)
- **Nakano, R., et al. (2025)**. *Understanding reader perception shifts upon disclosure of AI authorship*. arXiv:2510.24011. [arXiv](https://arxiv.org/html/2510.24011v1)
- **Anthropic**. *Claude prompting best practices* — few-shot, stile negativo esplicito, niente bullet-slop. [docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

## Riferimenti interni
- `md/simulation-research.md` — esperienza dell'orale (Parti 1-8), tassonomie, roadmap.
- `api/_lib/memory.js` — schema memoria sintetica (temi/abitudini/progressi, merge, decay, topWeakTopics).
- `public/js/simulation.js` — bank, modalità, `startAllenati`, `retryWeak/retryTopic`, ciclo feedback.

---

# 23. Specifica finale pronta per l'implementazione

Questa specifica è l'input diretto per il codice. Ogni punto è testabile.

### A. Strato di decisione (nuovo, puro, deterministico)

1. **Blueprint della materia** (Realistica): per ogni argomento del programma (dal bando o dalla materia demo) una tripla `{argomento, importanza(1-3), classicità(0-2), collegabilità(0-2)}`. La tripla è generata UNA volta dal modello insieme alla bank (stessa chiamata, zero costo extra) e validata dal layer di qualità.
2. **Selezione Realistica**: `score = 0.5·importanza + 0.3·classicità + 0.2·collegabilità − 0.3·recency − 0.5·ripetizione`. Primo terzo: argomenti ad alta importanza. Ultime 3: alta collegabilità/profondità.
3. **Selezione Allenamento**: legge `/api/memory` → `topWeakTopics` (esistente) → per ogni tema debole calcola `spacing_gain` da `ultima`; sceglie il tipo di domanda dal `tipo_errore` (mappa sotto); vincoli: cap 40% per tema, quota 1-2 domande nuove, mai lo stesso tipo 2 volte di fila sullo stesso tema.
4. **Mappa errore → tipo di domanda**:
   - `conoscenza` → esposizione guidata ("in cosa consiste X, e da quale norma deriva?")
   - `confusione` → distinzione ("differenza tra X e Y?")
   - `applicazione` → caso ("un cittadino fa Y: cosa succede?")
   - `argomentazione` → spiegazione con fonte/parole proprie
   - (nessuno storico) → domande sui pilastri, tipi a rotazione
5. **Anti-ripetizione**: una domanda non compare mai 2 volte nella stessa sessione; un tema non più di una volta per "blocco" Realistica; `recency` e `monotonia` nei punteggi.

### B. Strato di generazione (rifinire il prompt esistente)

6. Il prompt richiede **output JSON per domanda**: `{testo, tipo, argomento, difficolta(1-3), fonte?}` — `tipo ∈ {esposizione, distinzione, caso, collegamento, trasferimento, argomentazione}`.
7. Il prompt include **2-3 esempi few-shot di domande naturali** (~15-25 parole) e i **divieti anti-slop** (niente elenchi, niente doppie domande, niente formulazioni accademiche, max ~30 parole, mai inventare norme non note).
8. In Allenamento il prompt riceve: argomenti selezionati + tipo per ciascuno + (se disponibile) il contenuto dell'errore dal diario (`note`) per formulare il caso mirato.

### C. Strato di qualità (nuovo, leggero)

9. Validazione deterministica: campi presenti, `tipo` ∈ insieme, `argomento` ∈ programma, lunghezza testo ≤ 180 caratteri, niente "**", niente "elencare", niente "?". doppie domande (euristica: presenza di 2+ verbi principali separati da "e" → scarta).
10. **Auto-verifica economica** (opzionale, budget permettendo): una chiamata piccola "la domanda è fattualmente corretta rispetto al programma? rispondi solo OK/CORREGGI" — default OFF, attivabile.
11. Fallback: se la generazione fallisce o scarta tutto → si usa la bank in cache precedente (esiste già la cache 7 giorni) o il `fallbackQuestions()` esistente.

### D. Ciclo in sessione

12. **Realistica**: sequenza pre-pianificata; dopo la risposta, lo strato 1 decide SE fare follow-up (regole sezione 12); il follow-up è generato insieme alla **reazione conversazionale** della commissione (stessa chiamata LLM del turno: il commissario reagisce a voce, con eventuale follow-up; **niente pannello punteggi a ogni turno** — i punteggi solo nel report finale, §5). A fine sessione: `/api/memory` update + report.
13. **Allenamento**: dopo ogni risposta, il feedback include il **tipo di errore** della risposta (campo JSON); lo strato 1 decide la domanda successiva istantaneamente. A fine sessione: un unico `/api/memory` update con `temi` aggiornati (livello ±1 per tema, occorrenze, `ultima`, `tipo_errore`).
14. **Spacing**: il diario mantiene `ultima`; l'allenamento ripropone un tema solo se `spacing_gain` è nella finestra utile (non prima di ~1 giorno, non oltre ~7 giorni per temi a priorità media).

### E. Metriche per valutare il question engine

15. Log per sessione: per ogni domanda `{modalità, argomento, tipo, score_componenti, esito (buona/parziale/errata), followup_eseguito, costo_token}`.
16. KPI: % di risposte corrette per modalità; % temi deboli che passano a `superato` entro 30 giorni; tasso di completamento; tempo medio risposta (indicatore di difficoltà percepita); tasso di "aiuto non so rispondere" (indicatore di difficoltà oggettiva).
17. A/B possibile sui pesi (w) senza toccare la logica.

---

# 24. "Se dovessimo costruirlo domani"

Questa è la specifica minimale, nell'ordine in cui la costruirei. Budget: quasi zero. Nessuna nuova infrastruttura: solo logica pura + i prompt esistenti.

## Il flusso in una riga

**REALISTICA**: `bando/materia → blueprint (importanza, classicità, collegabilità) → score → sequenza ampiezza→profondità → domanda → feedback finale → memoria aggiornata a fine sessione`.

**ALLENAMENTO**: `memoria (temi con livello, tipo_errore, ultima) → argomento debole + tipo di domanda giusto per l'errore → domanda → feedback immediato con tipo_errore → prossima domanda (stesso tema, tipo diverso, oppure spacing) → memoria aggiornata a fine sessione`.

## Cosa costruire domani (in ordine)

1. **`questionEngine.js` — logica pura, zero dipendenze, unit-testabile.** Due funzioni:
   - `planRealistic(blueprint, n)` → array ordinato di `{argomento, tipo, difficolta}` con la regola ampiezza→profondità e i punteggi.
   - `planTraining(memory, n, {domandeNuove})` → array di `{argomento, tipo, difficolta, motivo}` usando `topWeakTopics` esistente + `tipo_errore` + `ultima` (spacing) + vincoli (cap 40%, rotazione tipi, 1-2 nuove).
   - La logica della mappa errore→tipo e dei punteggi è già tutta in questo file. ~100-150 righe. È il 90% del valore del question engine.
2. **Prompt di generazione aggiornato** (in `simulation.js`/`api/chat`): richiedi `{testo, tipo, argomento, difficolta}` per ogni domanda; aggiungi 2 esempi few-shot naturali e i divieti anti-slop; per l'Allenamento passa `tipo` mirato + `note` dell'errore. Output JSON già parsato dal layer esistente (`llmJson`).
3. **Layer di qualità minimale** (nello stesso `questionEngine.js` o in `validateQuestions.js`): 8 regole deterministiche dalla sezione 15 (un solo oggetto, lunghezza, tipo ∈ insieme, argomento ∈ programma, niente "elencare", niente doppie domande). Scarta/1 retry/fallback.
4. **Estensione minima del diario**: aggiungere `tipo_errore` a `temi` in `api/_lib/memory.js` (sanitize, merge) e istruire il modello di memoria a popolarlo; il decay già esistente fa il resto. Nessuna migrazione: il campo è opzionale, i dati vecchi funzionano.
5. **Wire-up in `simulation.js`**: `startSession`/`startAllenati` chiamano `planRealistic`/`planTraining` al posto della logica attuale (che prendeva la bank e basta); `startAllenati` continua a usare `/api/memory`. Il ciclo "prossima domanda" in Allenamento riordina la bank rimanente dopo ogni feedback in base al nuovo `tipo_errore`.
6. **Log + 4 KPI** (sezione E) per decidere i pesi con i dati.

## Cosa NON fare domani

- Niente DKT/ML, niente IRT, niente DB domande, niente memoria conversazionale, niente follow-up a ogni risposta, niente "layer letterario" anti-slop (si risolve nel prompt), niente sistema cross-utente.

## Costi

- Implementazione: ~1 file di logica pura (~150 righe) + ritocchi a 3 file esistenti (prompt bank, prompt memory, wire-up). Nessuna dipendenza nuova.
- Runtime: identico a oggi (una chiamata di generazione + una per feedback per risposta). L'eventuale auto-verifica è OFF di default.
- Test: unit test sulla logica pura (pianificazione, mappa errori, spacing, qualità) senza rete; i test jsdom esistenti coprono il wire-up.

**Questa è la specifica.** Quando approvi, la implemento in questo ordine: `questionEngine.js` → prompt → qualità → `tipo_errore` nel diario → wire-up → log/KPI.
