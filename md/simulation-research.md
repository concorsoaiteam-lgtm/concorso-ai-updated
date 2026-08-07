# ConcorsoAI — Simulazione Orale: Ricerca Approfondita

> **Scopo**: progettare la migliore simulazione orale possibile (fedele a una vera commissione d'esame) con il minor costo API possibile.
> **Ruolo**: Senior Product Designer · UX Researcher · AI Engineer.
> **Metodo**: ogni affermazione è supportata da fonti autorevoli (paper peer-reviewed, università, NNGroup, Google/OpenAI/Anthropic/Microsoft Research, normativa italiana). Niente affermazioni non verificate.
> **Stato**: documento di ricerca — NON contiene modifiche di codice né file di progetto.

---

## INDICE

1. [Parte 1 — Come funziona una vera commissione](#parte-1--come-funziona-una-vera-commissione)
2. [Parte 2 — Come creare domande eccellenti](#parte-2--come-creare-domande-eccellenti)
3. [Parte 3 — Come deve rispondere l'AI](#parte-3--come-deve-rispondere-lai)
4. [Parte 4 — Due modalità: Simulazione e Allenamento](#parte-4--due-modalità-simulazione-e-allenamento)
5. [Parte 5 — Feedback](#parte-5--feedback)
6. [Parte 6 — Voce](#parte-6--voce)
7. [Parte 7 — Errori da evitare](#parte-7--errori-da-evitare)
8. [Parte 8 — Roadmap di implementazione](#parte-8--roadmap-di-implementazione)
9. [Riferimenti completi](#riferimenti-completi)

---

# PARTE 1 — Come funziona una vera commissione

## 1.1 Il pattern universale degli orali

La ricerca su esami orali in ambiti diversi (università, medicina, lingue, dottorati) converge su pattern comuni che definiscono come si comporta realmente una commissione.

### Domande formulate su più livelli
Le domande degli esaminatori sono **multistrato**: anche quando sembrano invitare a un racconto personale o professionale, sono formulate per elicitare un **discorso istituzionale** (astratto, basato su regole, giustificazione accademica/professionale) (Roberts et al., 2000 — MRCGP). Cioè: la domanda apparentemente semplice nasconde sempre una richiesta più profonda di ragionamento istituzionale.

### Strutturato vs improvvisato
Negli orali **non strutturati** le domande vengono generate sul momento → alta variabilità e bias dell'esaminatore. Negli orali **strutturati** (SOE — Structured Oral Examinations) le domande sono pre-formulate su card o blueprint, con verbi d'azione (*definisci, elenca, spiega*) che progrediscono per livelli cognitivi crescenti (Khilnani et al., 2015; Imran & Doshi, 2019). Gli studi randomizzati mostrano che l'orale strutturato produce **valutazioni più eque e riproducibili** rispetto a quello libero (Imran & Doshi, 2019).

> **Lezione per il prodotto**: una banca domande *pre-strutturata* (non generata a runtime) è più fedele alla realtà di una generazione libera, ed è anche l'unica strada per costi API vicini a zero.

### Il "tema preferito" dell'esaminatore
Gli esaminatori "deragliano" dai loro schemi seguendo preferenze personali o "hobby horse" clinici (Pearce & Chiavaroli, 2020). È un difetto reale delle commissioni umane — da *evitare* in un simulatore: la coerenza è un vantaggio dell'AI, non un limite.

## 1.2 Quando la commissione interrompe

L'interruzione avviene tipicamente quando il candidato:
- si ferma o resta in silenzio;
- prende una linea di ragionamento che **devia dalla risposta attesa** (Roberts et al., 2000).

In questi casi gli esaminatori "spostano il frame": da una domanda astratta istituzionale passano a un **frame concreto** (es. un'esperienza, un caso pratico). Attenzione: la ricerca nota che interruzioni rapide e "a raffica" **disorientano ulteriormente** il candidato e aumentano lo stress (Roberts et al., 2000).

> **Lezione per il prodotto**: l'AI deve interrompere **raramente e con funzione diagnostica** (riportare sul binario), mai per fare effetto. Una sola interruzione per risposta, con una micro-frase che la motiva.

## 1.3 Quando approfondisce: la differenza tra prompting e probing

Nella valutazione orale la distinzione tra stimolo primario e follow-up è fondamentale (letteratura sulle oral assessments):

- **Domanda primaria**: quesito iniziale, aperto o semi-strutturato, che testa la padronanza di un macro-argomento.
- **Prompting (sollecitazione di supporto)**: interventi minimi quando la risposta è incompleta ma nella direzione giusta (*"Può approfondire questo aspetto?"*). Aiuta senza suggerire la risposta.
- **Probing (esplorazione)**: follow-up mirati per testare i **confini** della conoscenza, la capacità di fronteggiare obiezioni, la robustezza delle argomentazioni. Non aiuta: sonda.

### La tassonomia del prompting (Pearce & Chiavaroli, 2020)
La ricerca più citata in materia (medicina) distingue un **continuum di comportamenti**:

1. **Presentare il compito / ripetere informazioni**: ricordare dati dimenticati ("Ricorda che il paziente ha 80 anni…") per permettere l'auto-correzione.
2. **Domande di chiarimento**: follow-up neutrali e non-leading (*"Può essere più specifico su cosa intende per X?"*). L'esaminatore deve mantenere **neutralità assoluta** per non segnalare approvazione o censura.
3. **Probing questions**: scavare nella razionalità (*"In quali circostanze quell'approccio sarebbe appropriato?"*).
4. **Domande leading / vaghe (da evitare!)**: dare indizi troppo generosi (*"Intende il Tipo II, vero?"*) o vaghi (*"Cos'altro?"*). Le domande leading rendono l'esaminatore **complice della performance del candidato** e compromettono la validità della valutazione.

> **Lezione per il prodotto**: l'AI deve avere questa gerarchia **esplicita nel system prompt**. Mai domande leading. Il chiarimento neutrale è lo strumento più sicuro per non regalare la risposta (vedi Parte 4: "quando aiutare").

## 1.4 Come cambia la difficoltà

- Negli orali strutturati le domande hanno un **gradiente di difficoltà incorporato**: si parte dal richiamo fondazionale (recall/riconoscimento) → applicazione e interpretazione → problem-solving complesso / difesa critica (Khilnani et al., 2015; Odongo et al., 2025).
- **Adattività dinamica**: se il candidato risponde bene alle facili, l'esaminatore **alza l'asticella per testare i confini** (identifica la prestazione di frontiera / il livello "borderline"). Se il candidato fatica, l'esaminatore **abbassa** con scaffolding o domande più semplici per valutare la competenza di base (Odongo et al., 2025).
- Rischio reale: l'adattamento non calibrato introduce bias tra esaminatori diversi (Pearce & Chiavaroli, 2020).

> **Lezione per il prodotto**: regola di adattività **deterministica** (zero costi API): risposta completa e corretta → +1 livello di difficoltà; risposta incompleta → scaffolding/chiarimento; errore grave su un fondamento → domanda di consolidamento al livello inferiore. La coerenza della regola è un vantaggio dell'AI sulle commissioni umane.

## 1.5 Come valuta: griglie e affidabilità

- Gli orali hanno **storicamente minore affidabilità inter-esaminatore** rispetto agli scritti, per bias come effetto alone, effetto contrasto, tendenza alla clemenza/severità (Faherty et al., 2020).
- Le contromisure adottate dalle organizzazioni serie: **griglie analitiche pre-codificate** (rubriche con indicatori comportamentali e tecnici), **commissioni collegiali** che motivano il punteggio, **rater training** (Faherty et al., 2020).
- In Italia, i criteri di valutazione delle prove devono essere **predeterminati e verbalizzati dalla commissione prima dell'inizio** delle prove, ai sensi del DPR 487/1994 (e s.m.i., DPR 82/2023), con le domande che si attengono ai programmi del bando pubblicato su inPA.

> **Lezione per il prodotto**: il report finale deve usare una **griglia analitica esplicita** (macro-competenze con indicatori), non un voto a sensazione. Questo è anche più credibile verso l'utente.

## 1.6 L'ansia da esame e il candidato in difficoltà

- L'ansia da test ha componenti cognitive (worry), di interferenza, di mancanza di fiducia e di arousal (Zeidner, 1998; Schillinger et al., 2021).
- Sotto pressione la **memoria di lavoro** si satura con i pensieri di worry → vuoti di memoria, *freezing*, discorsi disorganizzati (Schillinger et al., 2021; teoria del controllo attenzionale di Eysenck).
- Le strategie di facilitazione usate dagli esaminatori reali: **ripetere la domanda** (abbassa l'ansia acuta e ricentra l'attenzione), **semplificare sintatticamente**, **dare piccoli hint**. Un eccesso di hint invalida il test; una rigidità totale misura l'ansia, non la preparazione.

> **Lezione per il prodotto**: la simulazione deve includere uno **stato "candidato in difficoltà"**: se l'utente è bloccato, l'AI ripete/semplifica prima di dare aiuto (e l'aiuto ha un costo in valutazione, come nella realtà). Il pulsante "Non so rispondere" esistente nel prodotto è esattamente questo — va inquadrato come comportamento di commissione, non come feature.

## 1.7 Implicazioni di design (riassunto Parte 1)

| Pattern reale | Come si traduce nel prodotto |
|---|---|
| Domande multistrato (Roberts 2000) | Ogni domanda primaria deve richiedere *ragionamento istituzionale*, non definizione mnemonica |
| Orale strutturato > libero (Imran & Doshi 2019) | Banca domande pre-strutturata con verbi d'azione e gradiente di difficoltà |
| Interruzione diagnostica, mai a raffica (Roberts 2000) | Max 1 interruzione/risposta, motivata, frame concreto |
| Prompting → chiarimento → probing, mai leading (Pearce & Chiavaroli 2020) | Gerarchia esplicita nel system prompt |
| Difficoltà adattiva (Odongo 2025) | Regola deterministica senza chiamate extra |
| Griglie predeterminate (DPR 487/94; Faherty 2020) | Rubrica analitica fissa, verbalizzata nella UI |
| Ansia da esame (Schillinger 2021) | Stato "candidato bloccato" → ripeti → semplifica → aiuta con costo valutativo |

---

# PARTE 2 — Come creare domande eccellenti

## 2.1 Il testing effect: le domande *sono* apprendimento

Roediger & Karpicke (2006) hanno dimostrato che il recupero attivo (*retrieval practice*) non è solo diagnostico ma **potenzia la ritenzione a lungo termine**: a una settimana, chi si era testato ricordava il **61%** contro il **40%** di chi aveva riletto il materiale (PubMed, PMID 16507066). Dunlosky et al. hanno confermato che il practice testing è tra le strategie di apprendimento ad altissima utilità.

> **Lezione per il prodotto**: ogni domanda della simulazione è un evento di apprendimento. Le domande devono richiedere **sforzo di recupero** (effortful retrieval) e non essere cue-dependent (riconoscibili da indizi nel testo).

## 2.2 Socratic questioning: domande che costringono a ragionare

Il framework di Paul & Elder (The Art of Socratic Questioning) scompone il pensiero critico in domande su **scopo, problemi, dati, concetti, assunzioni, inferenze, implicazioni e punti di vista**, verificate con gli standard intellettuali (chiarezza, accuratezza, precisione, rilevanza, profondità, ampiezza, logica, correttezza).

Invece di chiedere definizioni, si interroga su:
- **assunzioni**: "Quali presupposti stiamo facendo qui?"
- **conseguenze**: "Se questa ipotesi è vera, cosa ne consegue per il sistema?"
- **punti di vista alternativi**: "Come la vedrebbe chi sostiene la posizione opposta?"

## 2.3 Bloom rivisto: perché i verbi non bastano

La tassonomia rivista (Anderson & Krathwohl, 2001) separa **processi cognitivi** (Ricordare, Capire, Applicare, Analizzare, Valutare, Creare) da **tipi di conoscenza** (fattuale, concettuale, procedurale, metacognitiva).

Critica empirica importante (Larsen et al., 2022): i verbi d'azione **non sono proxy affidabili** dei processi cognitivi. Una domanda con "spiega" può richiedere pura memoria (spiegazione memorizzata) o vero ragionamento (applicazione a un caso mai visto).

> **Come scrivere domande di ragionamento**: ancorare la domanda a un **caso, scenario o problema concreto mai visto** e spostarla verso Analisi/Valutazione su conoscenza procedurale o metacognitiva. Es. "In questo scenario, quale procedura fallirebbe e perché?" invece di "Elenca le fasi della procedura".

## 2.4 Adaptive questioning

I sistemi di apprendimento adattivo calibrano dinamicamente la sequenza e la difficoltà in base alla performance in tempo reale (Kabudi et al., 2021). Il CAT (Computer Adaptive Testing) usa modelli IRT: la domanda successiva dipende dall'abilità stimata. Il meccanismo si trasferisce agli orali: risposta concettuale corretta → sali; errore → scaffold o sotto-quesito diagnostico per individuare la radice dell'errore (concettuale vs procedurale).

> **Lezione per il prodotto**: l'adattività può essere **100% deterministica nel frontend** (nessun costo API): mapping domanda → livello → prossima domanda con lo stesso livello/argomento.

## 2.5 Varietà con qualità costante: Automatic Item Generation

Westacott et al. (2023, BMC Medical Education) hanno studiato le varianti generate automaticamente (AIG): la manipolazione di variabili **radicali** (che cambiano il ragionamento richiesto) altera la difficoltà; le variabili **incidentali** (di superficie) preservano l'isomorfismo.

> **Lezione per il prodotto**: per generare domande "diverse ma ugualmente buone" non basta cambiare i nomi o i dati: va preservata la **struttura di ragionamento sottostante** e variata la superficie. Un'item model con slot radicali/incidentali produce varianti infinite a costo quasi zero (generazione in batch una tantum, poi zero chiamate a runtime).

## 2.6 Domande progressive e follow-up naturali

La sequenza ideale parte da un **innesco fenomenologico o da un caso**, poi procede con follow-up basati sulle risposte reali (*"Perché hai escluso l'altra opzione?"*, *"Quale prova sostiene questa tua conclusione?"*). Questo:
- riduce il *guessing*;
- testa la **stabilità e coerenza del modello mentale**;
- valuta il *processo*, non solo il *prodotto*.

## 2.7 Implicazioni di design (riassunto Parte 2)

1. **Banca domande pre-generata** (batch): item model con struttura di ragionamento fissa + variabili incidentali per la varietà.
2. **Gradiente di difficoltà esplicito** per domanda (livello 1→3: richiamo → applicazione → valutazione/sintesi).
3. **Domande ancorate a casi/scenari**, mai definizioni nude.
4. **Follow-up predefiniti per domanda** (2-3 probing per ogni livello), oppure generati con template deterministici.
5. **Anti-guessing**: la domanda non deve contenere indizi nel testo.
6. Se serve generazione runtime, il **prompt deve specificare il livello Bloom** e vietare i verbi ambigui (Larsen 2022).

---

# PARTE 3 — Come deve rispondere l'AI

## 3.1 Il problema: l'"AI slop"

Shaib et al. (2025, Northeastern & Meta AI) definiscono l'AI slop su **tre dimensioni**:

1. **Utilità informativa**: bassa densità di proposizioni (troppe parole per poco), rilevanza debole, divagazioni per allungare.
2. **Qualità dello stile**: eccesso di *significance amplifiers* e cliché (*"è importante notare che…"*, *"in conclusione…"*, *delve, testament, tapestry*), struttura troppo simmetrica e "pulita", elenchi puntati identici, *rule of three*, sintassi templata, em-dash ripetuti.
3. **Forma/struttura**: pattern sintattici ripetuti riconoscibili.

> **Lezione per il prodotto**: il modo più economico per eliminare lo slop è **vietarlo esplicitamente nel prompt** (mai bullet nel parlato, mai frasi d'effetto, niente strutture simmetriche) e **fornire esempi few-shot** del tono desiderato (Velinov, 2025: "mimic this tone").

## 3.2 La percezione umana: meno è più

- NNGroup (chatbot UX research): l'utente percepisce un chatbot come intelligente non quando usa parole complesse, ma quando **ascolta il contesto, ammette i limiti, adatta il dettaglio** senza blocchi di testo standardizzati. E c'è un "linguistic uncanny valley": simulare emozioni finte o empatia smodata genera **rigetto**.
- Microsoft Research (Lee et al., 2025): l'uso acritico dell'AI riduce il pensiero critico umano. Per un *simulatore di esame* questo è un monito: l'AI deve **restituire lo sforzo cognitivo all'utente**, non sostituirlo.

## 3.3 Come deve parlare la commissione (in pratica)

Sintesi delle linee guida emerse (Paul & Elder per il metodo; Velinov per lo stile; NNGroup per la percezione; docs Anthropic/OpenAI/Google per i vincoli):

| Dimensione | Regola |
|---|---|
| **Lunghezza** | Domanda: 1-2 frasi. Follow-up: 1 frase. Mai più di 3 frasi per turno di commissione (vincolo esplicito `max_tokens` + istruzione). |
| **Tono** | Autorevole ma colloquiale; mai accademico, mai burocratico. |
| **Lessico** | Verbi d'azione e termini del bando; zero gergo da manuale ("è doveroso evidenziare"). |
| **Microfrasi** | "Va bene." / "Bene, cambiamo argomento." / "Senta, mi chiarisca una cosa." (vedi Parte 6). |
| **Transizioni** | Connettivi conversazionali (*comunque, allora, senta*), mai formali (*passiamo ora al prossimo argomento relativo a…*). |
| **Pause** | Rese nel testo con micro-frasi o separatori; la UI può aggiungere delay dinamici (Parte 6.4). |
| **Struttura** | MAI elenchi puntati nel parlato. Paratassi, frasi brevi alternate a periodi più lunghi (burstiness). |

## 3.4 Temperatura e parametri (il trade-off da gestire)

- Per **stabilità pedagogica** (domande, valutazione, adherence al prompt): temperatura **0.2–0.5** (consiglio dominante per tutor/assessors).
- Per **naturalità conversazionale** (la persona che parla): temperature **0.7–1.0** riducono la ripetitività robotica (docs OpenAI/Anthropic).

> **Scelta di design raccomandata**: un **doppio canale** — generazione/valutazione a bassa temperatura, "voce" (resa delle battute) a temperatura leggermente più alta, oppure una sola chiamata a 0.6 con vincoli di stile fortissimi e few-shot. Costo: la singola chiamata è più economica; il compromesso 0.6 + few-shot è la soluzione consigliata per minimizzare i costi (OmniRouter/OpenRouter).

## 3.5 Implicazioni di design (riassunto Parte 3)

1. System prompt con **vincoli negativi espliciti** (mai bullet, mai "è importante notare", mai formule di transizione formali).
2. **Few-shot**: 3 esempi di battute di commissione (domanda, follow-up, cambio argomento) scritti a mano — questo ancorà lo stile più di mille istruzioni.
3. `max_tokens` stringente per turno (es. 80–150) — costi bassi e risposte brevi.
4. Tempo di "riflessione" UI prima della risposta (Parte 6.4) per la percezione di naturalezza.
5. **Mai** elogi finti o empatia smodata (uncanny valley, NNGroup).

---

# PARTE 4 — Due modalità: Simulazione e Allenamento

## 4.1 La distinzione fondante

La ricerca distingue due funzioni opposte che il prodotto deve separare nettamente:

- **Simulazione** = valutazione **sommativa ad alta fedeltà**: riproduce la commissione, raccoglie evidenze, produce il report. La commissione *non* insegna: valuta (con i correttivi di 1.6).
- **Allenamento** = pratica **formativa**: errore → diagnosi → esercizio mirato → ripetizione fino a padronanza. Qui l'AI *deve* insegnare.

Mescolare le due funzioni degrada entrambe: se la commissione aiuta sempre, la valutazione è falsata; se l'allenamento non aiuta mai, non è allenamento.

## 4.2 Perché l'Allenamento funziona (le basi scientifiche)

- **Deliberate practice** (Ericsson et al., 1993): attività strutturata, finalizzata a migliorare la prestazione attuale, con feedback immediato e superamento della comfort zone. *Caveat*: spiega circa il 30% della varianza nelle prestazioni d'élite (Hambrick et al., 2020) — ma per un esame a soglia è più che sufficiente.
- **Mastery learning e il problema dei 2-sigma** (Bloom, 1984): con insegnamento individualizzato e tempo sufficiente, quasi tutti raggiungono l'eccellenza; il tutoring 1-a-1 produce +2 deviazioni standard. Questo è **esattamente ciò che l'AI può scalare** (Google LearnLM lo persegue con i tutor LLM).
- **Testing effect / practice testing**: recuperare attivamente rafforza la traccia mnestica più della rilettura (Roediger & Karpicke, 2006).
- **Interleaving** (Rohrer & Taylor, 2007): alternare argomenti migliora la discriminazione concettuale a lungo termine, anche se il blocco crea una falsa sensazione di padronanza a breve.
- **Spaced repetition** (Cepeda et al., 2006, 2008): l'intervallo ottimale di ripasso dipende dall'orizzonte temporale richiesto; il sistema Leitner e l'algoritmo SM-2 (Anki) sono implementazioni pratiche collaudate.

## 4.3 L'error diary (diario degli errori) — il cuore del Pro

La ricerca sull'apprendimento dagli errori (Narciss & Alemdag, 2024/25) e la pratica degli error log nei settori ad alto rischio (IOM "To Err Is Human" 1999; CRM in aviazione/sanità) convergono sulla stessa struttura:

1. **Contesto/trigger**: cosa stavo facendo, qual era l'obiettivo.
2. **Descrizione dell'errore**: l'errore specifico, senza giudizio morale.
3. **Root cause**: lacuna di conoscenza, distrazione, procedura.
4. **Azione correttiva**: la regola o il micro-esercizio da applicare.
5. **Review temporizzata**: reinserire nel sistema di ripetizione spaziata.

Rilevante: l'**effetto ipercorrezione** — gli errori commessi con alta fiducia iniziale vengono corretti con più efficacia (Narciss & Alemdag): il diario deve registrare anche la *sicurezza* del candidato al momento dell'errore.

> **Lezione per il prodotto**: il diario non deve contenere conversazioni, ma **schede di errore sintetiche** (domanda, errore, causa, correzione, livello di padronanza). Aggiornamento con modello piccolo (economico) — coerente con l'architettura già presente.

## 4.4 Quando aiutare, tacere, correggere, fermare

Basato su Pearce & Chiavaroli (2020) + Wood, Bruner & Ross (1976) + ZPD (Vygotsky):

| Situazione | SIMULAZIONE | ALLENAMENTO |
|---|---|---|
| Risposta corretta e completa | "Va bene. Prossima domanda." (nessun feedback lungo) | Conferma breve + passa al prossimo errore |
| Risposta corretta ma incompleta | Probing (chiarimento/probing, mai leading) | Scaffold: indizio → richiesta di completare |
| Errore lieve | Interruzione diagnostica 1 sola volta, poi annota | Correzione elaborata: spiega *perché* e chiedi di riprovare |
| Blocco / silenzio | Ripeti → semplifica → "Non so rispondere" con costo valutativo | Scaffold a gradini (Wood, Bruner, Ross: reclutamento, riduzione gradi di libertà, evidenziazione aspetti critici, controllo frustrazione) |
| Errore grave sui fondamenti | Cambia argomento, annota come lacuna prioritaria | Esercizio mirato sull'argomento specifico, non su tutto |

I 6 passi di scaffolding di Wood, Bruner & Ross (1976) sono la mappa per l'Allenamento:
1. **Reclutamento**: coinvolgere l'interesse.
2. **Riduzione dei gradi di libertà**: semplificare il compito.
3. **Mantenimento della direzione**: restare sull'obiettivo.
4. **Evidenziazione degli aspetti critici**: segnalare le discrepanze chiave senza risolverle.
5. **Controllo della frustrazione**: incoraggiamento calibrato.
6. **Dimostrazione**: esempio analogo (mai lo stesso) solo se bloccato del tutto.

## 4.5 Il "bias del dare la risposta" (answer-giving bias) e come bloccarlo

Gli LLM sono addestrati per essere utili → tendono a **regalare la soluzione** (answer-giving bias). Contromisure documentate (OpenAI best practices; architettura LearnLM/Khanmigo):

1. **Prompt prescrittivo, non solo negativo**: al posto di "non dare la risposta" → "Se il candidato chiede la soluzione, rispondi: 'Non posso darti la soluzione, ma posso aiutarti a scomporre il problema: qual è secondo te il primo passo?'".
2. **Guardrail a due livelli** (multi-agente): un agente genera, un agente "critico" verifica che non ci siano soluzioni complete prima di mostrare all'utente; se fallisce, rigenera.
3. **Stato dell'errore nel prompt**: passare al modello l'errore esatto e vincolarlo a interrogare solo quell'aspetto.
4. LearnLM (Google) e Khanmigo dimostrano che con prompt/RLHF dedicati il dialogo socratico supera il tutor umano in trasferibilità in alcuni RCT (Eedi/Google, 2025).

## 4.6 Implicazioni di design (riassunto Parte 4)

1. **Due modalità esplicite** con system prompt diversi (valutatore vs allenatore).
2. **Error diary strutturato** (5 campi) + livello di padronanza → alimenta l'Allenamento e il diario UI (stelle).
3. **Allenamento = solo gli errori della simulazione**, con esercizi a difficoltà calibrata e ripetizione fino a padronanza (mastery).
4. **Interleaving** degli argomenti nell'allenamento (Rohrer & Taylor).
5. **Spaced repetition** per programmare i ripassi (Leitner/SM-2 lato client, zero API).
6. **Blocco dell'answer-giving bias** nel prompt e, se serve, guardrail.

---

# PARTE 5 — Feedback

## 5.1 Il modello di Hattie & Timperley (2007)

Il framework di riferimento: tre domande + quattro livelli.

**Le tre domande**:
- *Feed up*: Dove sto andando? (obiettivi/criteri)
- *Feed back*: Come sta andando? (stato attuale)
- *Feed forward*: Qual è il prossimo passo? (azione)

**I quattro livelli** (dal più al meno efficace):
1. **Task** (compito): "La tua risposta è corretta ma manca X". Da solo produce apprendimento superficiale.
2. **Process** (processo): "Hai usato la strategia giusta per scomporre il problema, ma perché hai cambiato segno a quel passaggio?" — crea connessioni profonde.
3. **Self-regulation** (autoregolazione): "Quando incontri questo blocco, come puoi verificare da solo se la tua ipotesi regge prima di chiedere aiuto?" — favorisce l'autonomia.
4. **Self** (persona): "Sei brillante" — **il meno efficace**: distoglie dal compito, genera compiacimento o ansia.

> **Regola per il report**: MAI lodare la persona ("sei portato"), mai punteggi a sensazione; sempre task + process + feed forward.

## 5.2 Valutazione formativa (Black & Wiliam, 1998)

- "Inside the Black Box": la valutazione è formativa solo quando le evidenze **vengono usate per adattare** l'insegnamento.
- **Effect size 0.4–0.7**: tra i più alti in educazione; particolarmente efficace per chi parte svantaggiato.
- Pilastri: criteri di successo chiari, autovalutazione, feedback orientato alla crescita.

## 5.3 Il feedback sandwich non funziona

- Prochazka et al. (2020) e Parkes et al. (2013): il sandwich (lode → critica → lode) **migliora la percezione ma non la performance**; per primacy/recency la critica centrale si diluisce e crea confusione ("andava bene o no?").
- Le lodi superficiali svalutano la sincerità del feedback.
- **Alternativa basata sull'evidenza**: diretto, trasparente, centrato sui criteri (feed up/back/forward), tono fermo e di supporto, separando l'apprezzamento dell'impegno dalla correzione del prodotto.

## 5.4 Feedback correttivo elaborato e ipercorrezione

- Il feedback correttivo efficace è **elaborato** (elaborated feedback): non marca "sbagliato" ma dà indizi, spiegazioni concettuali, rimandi alle regole, così lo studente **rielabora attivamente** l'errore (Narciss, 2008).
- **Effetto ipercorrezione**: gli errori su cui si era più sicuri vengono corretti meglio → il report deve mostrare anche *dove* l'utente era sicuro di sé (spia di lacune nascoste).

## 5.5 Struttura del report post-simulazione (design proposto)

Basato su Hattie & Timperley + Narciss + error diary:

1. **Feed up — Criteri**: aprire con la griglia di valutazione usata (trasparenza, come da DPR 487/94).
2. **Feed back — Punti di forza**: 1-2 osservazioni *specifiche* su cosa ha funzionato (task/process).
3. **Feed back — Aree di miglioramento**: per ogni lacuna: errore concreto → causa (root cause) → perché è un problema → **esempio corretto** → esercizio da rifare.
4. **Feed forward — Prossimi passi**: 2-3 azioni concrete e ordinate (es. "Prima del prossimo test, ripassa il silenzio-assenso e rifai gli esercizi 1-3").
5. **Error diary**: schede degli errori con livello di padronanza (le stelle del diario) e sicurezza percepita.
6. **Niente voto singolo a sensazione**: eventuale voto derivato dalla griglia analitica, spiegato.

## 5.6 Implicazioni di design (riassunto Parte 5)

1. Report con sezioni **feed up / back / forward** esplicite.
2. Mai "sei portato/bravo" (livello self); sempre task+process.
3. Mai sandwich: prima il positivo specifico, poi il correttivo diretto, poi il piano.
4. Feedback **elaborato**: errore → causa → perché → esempio corretto → esercizio.
5. Registrare la **sicurezza** percepita per sfruttare l'ipercorrezione.
6. Il report è il momento di maggior valore del prodotto (il "dopo") — lì va investita la qualità.

---

# PARTE 6 — Voce

Come rendere il dialogo scritto realistico come un parlato. Niente TTS: il *testo* stesso deve suonare parlato.

## 6.1 Turn-taking (Sacks, Schegloff & Jefferson, 1974)

La conversazione è **sistematicamente organizzata**: i parlanti cambiano turno nei *Transition Relevance Places* (TRP) — punti in cui un'unità sintattica/frase è completa. Nel testo: ogni battuta della commissione deve essere **un'unità semantica completa** che "passa la palla" al candidato. Una domanda che si spezza su 4 righe viola il TRP e crea attrito cognitivo.

## 6.2 Pause e silenzi: il "silenzio massimo standard"

Jefferson (1989): nelle conversazioni quotidiane il silenzio tra turni ha un **massimo standard di ~1 secondo**. Ricerche successive sulla percezione (Kohtz et al., 2017): pause sotto i 200–300 ms sembrano interruzioni affrettate; ~1 s è la soglia naturale; oltre 1,5–2 s senza filler o segnale il silenzio viene percepito come rottura/esitazione.

> **Nel prodotto**: le pause vanno rese nel testo (frase breve separata, "…", micro-frase) e nella UI (delay di digitazione). Mai silenzi visivi > 2 s senza reazione della commissione.

## 6.3 I filler come segnali (Clark & Fox Tree, 2002)

"Uh" e "um" non sono rumore: sono **parole convenzionalizzate** che segnalano un ritardo minore o maggiore nel piano del discorso. In italiano l'equivalente sono *beh, ehm, allora, cioè, senta, guardi*. In un testo scritto, micro-frasi tipo "Allora…", "Senta, mi dica una cosa" segnalano elaborazione e rendono la voce organica. **Dosaggio**: 1 per turno max, mai esagerare (diventerebbe caricatura).

## 6.4 La latenza di risposta: più lenta = più umana (Gnewuch et al., 2018)

Gnewuch et al. (ECIS 2018): una **latenza dinamica proporzionale alla complessità dell'input e alla lunghezza attesa della risposta** aumenta la percezione di umanità, presenza sociale e soddisfazione. La risposta istantanea è percepita come robotica.

> **Nel prodotto**: prima di mostrare la battuta della commissione, il frontend deve attendere un delay **proporzionato** (es. 400–900 ms a seconda della lunghezza), poi mostrare la battuta con effetto di digitazione. Zero costo API, altissimo guadagno di naturalezza.

## 6.5 Cosa rende il testo "parlato" (sintesi operativa)

- **Paratassi**: coordinazione (*e, ma, quindi, allora*) invece di subordinate annidate.
- **Frasi brevi** alternate a periodi leggermente più lunghi (burstiness) — il ritmo del respiro.
- **Micro-transizioni**: *bene, allora, senta, comunque, vediamo* al posto di *inoltre, conseguentemente, per quanto concerne*.
- **Discourse markers di cambio argomento** (Fraser, 2009): *"Bene, adesso cambiamo argomento."*, *"Un'altra cosa, mi dica…"* — segnalano lo spostamento di common ground senza strappi.
- **Niente struttura da testo scritto**: no bullet, no titoli, no elenchi.

## 6.6 Implicazioni di design (riassunto Parte 6)

1. Template di **micro-frasi di commissione** (es. 20-30 battute standard: apertura, chiusura, transizione, chiarimento, interruzione, aiuto) scritte a mano e usate come *framing* deterministico attorno alle risposte AI.
2. **Delay dinamico** pre-risposta (Gnewuch) + effetto digitazione.
3. Ogni battuta = **un'unità semantica completa** (TRP).
4. Massimo 1 filler per turno.
5. Cambio argomento sempre segnalato da un discourse marker.
6. Zero elenchi puntati nel parlato della commissione.

---

# PARTE 7 — Errori da evitare

Checklist di tutto ciò che rende una simulazione *finta, robotica, AI slop, ripetitiva, prevedibile, troppo perfetta, troppo educativa, troppo gentile, troppo severa* — e come evitarlo.

## 7.1 Errori di stile (AI slop)

| Errore | Perché è sbagliato | Come evitarlo |
|---|---|---|
| Elenchi puntati nel parlato | Firma inequivocabile di LLM (Shaib 2025) | Divieto esplicito nel prompt + few-shot |
| "È importante notare che…" e formule d'effetto | Significance amplifiers (Shaib 2025) | Blacklist nel prompt |
| Struttura troppo simmetrica / rule of three | Pattern LLM riconoscibile (Shaib 2025) | Variare lunghezza e struttura delle battute |
| Lessico accademico | Sembra un manuale, non un commissario | Prompt: "come un commissario che spiega a voce" |
| Transizioni formali ("passiamo ora al prossimo argomento relativo a…") | Robotico | Micro-frasi conversazionali (Parte 6) |
| Risposta istantanea | Percepita come non umana (Gnewuch 2018) | Delay dinamico + digitazione |

## 7.2 Errori di comportamento

| Errore | Perché è sbagliato | Come evitarlo |
|---|---|---|
| **Troppo gentile** (aiuta sempre, mai interrompe) | Valutazione falsata; sembra finta (Roberts 2000; Pearce & Chiavaroli 2020) | Gerarchia prompting: chiarimento → probing; solo rari aiuti con costo valutativo |
| **Troppo severa** (mai aiuto) | Misura l'ansia, non la preparazione (Schillinger 2021) | Stato "candidato bloccato": ripeti → semplifica → aiuta |
| **Domande leading** ("Intende X, vero?") | L'esaminatore diventa complice; valutazione invalida (Pearce & Chiavaroli 2020) | Divieto assoluto nel prompt |
| **Interruzioni a raffica** | Disorientano e stressano (Roberts 2000) | Max 1 interruzione/risposta |
| **Risponde sempre al posto del candidato** (answer-giving bias) | Insegnamento deleterio; utente passivo (Microsoft Research 2025) | Prompt prescrittivo + guardrail |
| **Sempre le stesse domande** | Prevedibile, noiosa | Item model con varianti (Parte 2.5) |
| **Troppo perfetto** (mai esitazioni, mai errori di battuta) | Uncanny valley linguistico (NNGroup) | Filler rari, ritmo vario, ammissione di limite credibile |
| **Elogi finti** ("Ottima risposta!" a ogni costo) | Uncanny valley; svaluta il feedback (NNGroup; Parkes 2013) | Mai lodi al sé; feedback specifico e calibrato |
| **Feedback sandwich** | Percezione buona, performance zero (Prochazka 2020) | Feed up/back/forward (Parte 5) |
| **Voto senza spiegazione** | Non actionable, sembra arbitrio | Griglia analitica (DPR 487/94; Faherty 2020) |

## 7.3 Errori di sistema

| Errore | Perché è sbagliato | Come evitarlo |
|---|---|---|
| Chiamate AI per ogni micro-decisione | Costi esplosivi, latenza | Logica deterministica nel frontend (livelli, transizioni, cache) |
| Conversazioni intere salvate | Costi, privacy, rumore (il Pro non vende chat: vende memoria sintetica) | Error diary sintetico con modello piccolo |
| Rigenerare ciò che si può riusare | Costi doppi | Cache per domanda/tipo (già in produzione per l'help) |
| Dipendere da un solo provider | Rate limit / downtime / costi | Fallback multi-provider (già in produzione con OmniRouter) |
| Risposte > 150 token per turno | Sovraccarico cognitivo (Cognitive Load Theory) e costi | max_tokens stringente + istruzioni |

---

# PARTE 8 — Roadmap di implementazione

Ordinata dal **massimo impatto al minimo**, con metriche di priorità. Nota di contesto: l'app è già in produzione con OmniRouter (fallback multi-provider, modelli gratuiti) e OpenRouter; il vincolo è costi/latenza.

Legenda: 🔴 Alta · 🟡 Media · 🟢 Bassa

| # | Intervento | Difficoltà | Impatto utente | Costo API | Complessità | Priorità |
|---|---|---|---|---|---|---|
| 1 | **Banca domande pre-strutturata** (item model + varianti, gradiente 1-3) — generazione in batch una tantum, poi zero chiamate | 🟡 | 🔴 (fedeltà + varietà + zero attesa) | 🟢 (una tantum; poi 0) | 🟡 | **P0** |
| 2 | **Voce della commissione** (few-shot + vincoli anti-slop + micro-frasi deterministiche di framing) | 🟢 | 🔴 (sparisce l'effetto AI) | 🟢 (0 extra) | 🟢 | **P0** |
| 3 | **Latenza dinamica + effetto digitazione** (Gnewuch) | 🟢 | 🟡🔴 (naturalità percepita) | 🟢 (0) | 🟢 | **P0** |
| 4 | **Adattività deterministica della difficoltà** (corretto → sale; errore → scaffold; regola locale) | 🟡 | 🔴 (fedeltà alla commissione reale) | 🟢 (0) | 🟡 | **P0** |
| 5 | **Gerarchia prompting esplicita** (chiarimento → probing → mai leading) nel system prompt della Simulazione | 🟢 | 🔴 (valutazione credibile) | 🟢 (0) | 🟢 | **P0** |
| 6 | **Report feed up/back/forward** con griglia analitica, feedback elaborato, niente lodi al sé | 🟡 | 🔴 (il "dopo" è il valore) | 🟡 (1 chiamata/report) | 🟡 | **P1** |
| 7 | **Stato "candidato bloccato"** (ripeti → semplifica → aiuta con costo valutativo) | 🟡 | 🟡🔴 (riduce l'abbandono da frustrazione) | 🟢 | 🟡 | **P1** |
| 8 | **Error diary strutturato** (5 campi + sicurezza percepita) con modello piccolo | 🟡 | 🔴 (memoria Pro) | 🟢 (modello piccolo) | 🟡 | **P1** |
| 9 | **Modalità Allenamento** (solo errori → esercizi mirati → mastery; interleaving) | 🟡 | 🔴 (il differenziatore Pro) | 🟡 | 🟡🔴 | **P1** |
| 10 | **Blocco answer-giving bias** (prompt prescrittivo; guardrail opzionale) | 🟡 | 🟡 (credibilità didattica) | 🟢 (0) o 🟡 (guardrail) | 🟡 | **P1** |
| 11 | **Spaced repetition dei ripassi** (Leitner/SM-2 lato client) | 🟡 | 🟡 (ritenzione a lungo termine) | 🟢 (0) | 🟡 | **P2** |
| 12 | **Interleaving degli argomenti** nell'allenamento | 🟢 | 🟡 | 🟢 | 🟢 | **P2** |
| 13 | **Anti-guessing nelle domande** (rimozione indizi nel testo) | 🟢 | 🟡 | 🟢 | 🟢 | **P2** |
| 14 | **Doppia temperatura** (bassa per valutazione, alta per la voce) — se il budget lo consente | 🟢 | 🟡 | 🟡 (2 chiamate) | 🟢 | **P2** |
| 15 | **TTS / voce sintetizzata** | 🔴 | 🟡🔴 (immersione, ma rischiosa: uncanny valley se fatta male) | 🔴 | 🔴 | **P3 — non ora** |

## 8.1 Strategia di costo per simulazione (obiettivo: minimo)

1. **Zero chiamate per la selezione delle domande**: banca pre-strutturata + rotazione con seed (item #1).
2. **Una chiamata per la valutazione della risposta** (nel report), non una per battuta: le battute di framing/transizione sono deterministiche; l'AI genera solo ciò che serve davvero.
3. **Cache per domanda/tipo** (già in produzione): nessuna rigenerazione.
4. **Modello piccolo** per l'aggiornamento della memoria/error diary; modello grande solo per la valutazione e l'allenamento guidato.
5. **max_tokens stringente** (80–150 per turno di commissione; ~300–400 per il report) → costo per utente nell'ordine di frazioni di centesimo.
6. **Prompt caching** dove disponibile (Anthropic) per il system prompt fisso.

## 8.2 Priorità consigliata (percorso di rilascio)

- **Fase 1 (P0)**: #1, #2, #3, #4, #5 → la Simulazione diventa *credibile* senza aumentare i costi. È il 80% del valore percepito.
- **Fase 2 (P1)**: #6, #7, #8, #9, #10 → nasce il valore Pro (memoria + allenamento) e il report diventa il punto di forza.
- **Fase 3 (P2)**: #11, #12, #13, #14 → ritenzione e rifinitura.
- **Fase 4 (P3)**: #15 TTS → solo dopo che la voce testuale è perfetta; altrimenti amplifica gli errori invece di curarli.

---

# Riferimenti completi

## Commissioni reali e comportamento esaminatori (Parte 1)

1. Pearce, J., & Chiavaroli, N. (2020). *Prompting Candidates in Oral Assessment Contexts: A Taxonomy and Guiding Principles*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC7427130/
2. Khilnani et al. (2015). *Structured oral examination in pharmacology: factors influencing its implementation*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC4621678/
3. Roberts, C., et al. (2000). *Oral examinations — equal opportunities, ethnicity, and fairness in the MRCGP*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC1127149/
4. Odongo et al. (2025). *The viva voce innovation and experience at a new medical school in Rwanda*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC12210533/
5. Imran, M., & Doshi, D. (2019). *Structured and unstructured viva voce assessment: a double-blind, randomized, comparative evaluation*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC6436443/
6. Poole, B. (2015). *Examining the doctoral viva: perspectives from a sample of examiners*. — https://journals.uclpress.co.uk/lre/article/2695/galley/17076/view/
7. Faherty, A., et al. (2020). *Inter-rater reliability in clinical assessments: do examiner pairings influence candidate ratings?* — https://pmc.ncbi.nlm.nih.gov/articles/PMC7212618/
8. Schillinger, F. L., et al. (2021). *Revisiting the role of worries in explaining the link between test anxiety and test performance*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC8602212/
9. DPR 9 maggio 1994, n. 487 (accesso impieghi PA) e DPR 16 giugno 2023, n. 82. — https://www.codau.it/images/ufficio_studi/commento_DPR_487-94_modificato_dal_DPR_82-202345_1.pdf
10. Abilitazione forense (Legge 247/2012). — https://www.consiglionazionaleforense.it/testo-unitario/esame-avvocato

## Domande eccellenti (Parte 2)

11. Roediger, H. L., & Karpicke, J. D. (2006). *Test-enhanced learning*. — https://pubmed.ncbi.nlm.nih.gov/16507066/
12. Paul, R., & Elder, L. *Critical Thinking: The Art of Socratic Questioning*. — https://eric.ed.gov/?id=EJ832681
13. Larsen et al. (2022). *Probing Internal Assumptions of the Revised Bloom's Taxonomy*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC9727608/
14. Anderson & Krathwohl (2001). *A Taxonomy for Learning, Teaching, and Assessing*. — https://link.springer.com/rwe/10.1007/978-1-4419-1428-6_141
15. Kabudi, T., et al. (2021). *AI-enabled adaptive learning systems: a systematic mapping of the literature*. — https://www.sciencedirect.com/science/article/pii/S2666920X21000114
16. Westacott, R., et al. (2023). *Automated Item Generation: impact of item variants on performance*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC10496230/
17. Dunlosky, J., et al. *Improving Students' Learning With Effective Learning Techniques*. — https://files.eric.ed.gov/fulltext/ED536925.pdf

## AI slop e naturalità (Parte 3)

18. Shaib, C., et al. (2025). *Measuring AI "Slop" in Text* (Northeastern & Meta AI). — https://arxiv.org/html/2509.19163v1
19. Lee, H-P., et al. (2025). *The Impact of Generative AI on Critical Thinking* (Microsoft Research). — https://www.microsoft.com/en-us/research/publication/the-impact-of-generative-ai-on-critical-thinking-self-reported-reductions-in-cognitive-effort-and-confidence-effects-from-a-survey-of-knowledge-workers/
20. NNGroup. *The User Experience of Chatbots & AI Functionality Study Guide*. — https://www.nngroup.com/articles/chatbots/
21. Velinov, A. (2025). Few-shot tone mimicry guidance. — (sintetizzato da guide di settore; cfr. OpenAI Prompt Engineering)
22. OpenAI. *Best practices for prompt engineering*. — https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-openai-api
23. Anthropic. *System prompts & prompt caching documentation*. — https://docs.anthropic.com/

## Tutor ed esaminatori LLM (Parte 4)

24. Google LearnLM. *Improving Gemini for Learning*. — https://arxiv.org/abs/2412.16429
25. Google DeepMind & Eedi (2025). *AI tutoring RCT in UK classrooms*. — https://arxiv.org/html/2512.23633v1
26. Bloom, B. S. (1984). *The 2 Sigma Problem*. — https://web.mit.edu/5.95/readings/bloom-two-sigma.pdf
27. Wood, D., Bruner, J., & Ross, G. (1976). *The role of tutoring in problem solving*. — (cfr. sintesi in LearnLM/ZPD literature; concetto di scaffolding)
28. Vygotsky, L. (1978). *Zone of Proximal Development* (Mind in Society).
29. Ericsson, K. A., Krampe, R. T., & Tesch-Römer, C. (1993). *The role of deliberate practice in the acquisition of expert performance*. — https://psycnet.apa.org/record/1993-40718-001
30. Hambrick, D. Z., et al. (2020). *Deliberate practice: is that all it takes?* — https://pmc.ncbi.nlm.nih.gov/articles/PMC7461852/
31. Cepeda, N. J., et al. (2006). *Distributed practice in verbal recall tasks*. — https://www.yorku.ca/ncepeda/publications/CPVWR2006.html
32. Rohrer, D., & Taylor, K. (2007). *The shuffling of mathematics problems improves learning*. — http://uweb.cas.usf.edu/~drohrer/pdfs/Rohrer%26Taylor2007IS.pdf

## Feedback (Parte 5)

33. Hattie, J., & Timperley, H. (2007). *The Power of Feedback*. Review of Educational Research, 77(1). — https://journals.sagepub.com/doi/abs/10.3102/003465430298487
34. Black, P., & Wiliam, D. (1998). *Inside the Black Box*. Phi Delta Kappan. — https://kappanonline.org/inside-the-black-box-raising-standards-through-classroom-assessment/
35. Prochazka, J., et al. (2020). *Sandwich feedback: the empirical evidence of its effectiveness*. — https://www.sciencedirect.com/science/article/abs/pii/S0023969020301429
36. Parkes, J., et al. (2013). *Feedback sandwiches affect perceptions but not performance*. — https://pubmed.ncbi.nlm.nih.gov/22581568/
37. Narciss, S., & Alemdag, E. (2024/25). *Learning from errors and failure in educational contexts*. — https://pmc.ncbi.nlm.nih.gov/articles/PMC11803059/
38. IOM (1999). *To Err Is Human*. — https://www.aapd.org/globalassets/media/safety-toolkit/to-err-is-human.pdf

## Voce e conversazione (Parte 6)

39. Sacks, H., Schegloff, E. A., & Jefferson, G. (1974). *A simplest systematics for the organization of turn-taking for conversation*. Language, 50(4). — https://www.researchgate.net/publication/215439057_A_Simple_Systematic_for_the_Organisation_of_Turn_Taking_in_Conversation
40. Jefferson, G. (1989). *Preliminary notes on a possible metric which provides for a "standard maximum" silence of approximately one second in conversation*. — https://www.scirp.org/reference/referencespapers?referenceid=3101180
41. Clark, H. H., & Fox Tree, J. E. (2002). *Using uh and um in spontaneous speaking*. Cognition, 84(1). — https://www.sciencedirect.com/science/article/abs/pii/S0010027702000173
42. Gnewuch, U., et al. (2018). *Faster is Not Always Better: Understanding the Effect of Dynamic Response Delays in Human-Chatbot Interaction*. ECIS 2018. — https://aisel.aisnet.org/ecis2018_rp/113/
43. Kohtz, L. S., et al. (2017). *How long is too long? How pause features affect the perception of willingness*. Interspeech. — https://www.isca-archive.org/interspeech_2017/kohtz17_interspeech.pdf
44. Fraser, B. (2009). *Topic orientation markers* / discourse markers. — https://dictionary.cambridge.org/us/grammar/british-grammar/discourse-markers-so-right-okay

---

*Documento generato da ricerca su fonti autorevoli. Nessun codice prodotto: questo file è puramente informativo e funge da base di design per i prossimi round di sviluppo.*
