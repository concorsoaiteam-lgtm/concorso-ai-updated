# 01 — Psicologia dell'utente sulla landing

> **Scopo**: definire chi arriva sulla landing ConcorsoAI, cosa pensa nei primi 30 secondi, e come il suo cervello decide in pochi millisecondi. Tutto ciò che segue nei file 02-24 discende da queste basi. Se la psicologia è sbagliata, la copy è sbagliata; se la copy è sbagliata, il design è inutile. La sequenza è gerarchica.

---

## Introduzione

### Perché questo file è il primo

Una landing page non è un poster. È una macchina cognitivo-emotiva che deve convertire **uno stato mentale iniziale** (ignoto, diffidente, distratto) in uno **stato di azione** (cliccare, registrarsi, fidarsi). L'utente non legge le sezioni in ordine: scansiona, pesa, decide. La metafora corretta non è "lettura" ma **valutazione in tempo reale** di un rischio: "questo prodotto serve a me, è affidabile, ne vale la pena?".

Per costruire una landing efficace serve prima di tutto **modellizzare la mente del visitatore**. Tre sotto-domande:

1. **Dove guarda** (eye-tracking, pattern F, Z, scorrimento).
2. **Cosa pensa** (modello mentale, ansia, credulità).
3. **Cosa lo fa uscire** (frizione, diffidenza, confusione, scarsità di attenzione).

Ogni decisione di copy, design, CTA, colore, spaziatura risponde a una di queste sotto-domande. Senza modello mentale, si producono interfaccie decorative — esteticamente gradevoli ma cognitivamente vuote.

Riferimenti fondativi: Don Norman, *The Design of Everyday Things* (1990, expanded 2013); NN/G *Scrolling and Attention* (Kate Moran, 2018); Baymard Institute; la tradizione HCI di Stanford / Carnegie Mellon / MIT Media Lab.

### Come si applica a ConcorsoAI

Il visitatore di ConcorsoAI è un candidato italiano ai concorsi pubblici (25-45 anni, ansia alta sull'orale, tech-literacy medio-bassa, abituato a burocrazia istituzionale, diffidente verso claim gonfiati). Il suo modello mentale è diverso da quello del developer Stripe o del designer Linear. Non risponde a hype words, non accetta countdown finti, vuole prove concrete di compliance (GDPR, server EU, accuratezza normativa). Il KB è tarato su questo target — non è una guida valida per qualsiasi SaaS.

---

## Principi

### P1 — Il cervello decide prima di pensare (System 1, Kahneman 2011)

Kahneman in *Thinking, Fast and Slow* distingue due sistemi:

- **System 1**: veloce, automatico, intuitivo, emozionale, parallelo. Decide impressioni in <500ms. Non ha capacità verbale — non sa spiegare le proprie decisioni.
- **System 2**: lento, deliberativo, logico, verbale, seriale. Entra in funzione solo per scelte non familiari o quando System 1 rileva un conflitto.

Una landing page comunica a **System 1**. L'utente non "legge" la hero: la percepisce, ne ricava un'impressione, decide se restare o andarsene. System 2 entra in funzione solo per la sezione FAQ, la scelta del pricing, il confronto tra opzioni.

**Conseguenza operativa**: la hero è progettata per impressione, non per spiegazione. Ogni parola deve combaciare con l'impressione già formata, non aggiungere informazioni.

### P2 — Working memory limitata: 4 ± 1 elementi (Cowan 2001)

La "regola del 7±2" di Miller (1956) è stata ricalibrata da Cowan (2001) a **4 ± 1 chunk** in compiti complessi. Il visitatore può mantenere attivamente 4 informazioni simultanee della landing. Oltre, sorge **cognitive load** con abbandono (Sweller, *Cognitive Load Theory*, 1988).

**Conseguenza operativa**: la hero deve comunicare al massimo 4 unità informative. Esempio ConcorsoAI: prodotto + JTBD + beneficio concreto + CTA. La quinta parola è già sovraccarico.

### P3 — F-pattern di lettura su web (NN/g, 2019 update)

Nielsen Norman Group ha condotto eye-tracking longitudinale (N>300) sul comportamento di scansione di pagine web. Il pattern emergente non è semplice "a F" ma è una variante moderna con assunzioni critiche:

- sopra la fold: scansione orizzontale ampia
- scorrendo verso il basso: scansione sempre più verticale a colonna sinistra
- occasione: micro-scansioni orizzontali su CTA e prezzi

**Conseguenza operativa**: contenuti importanti in colonna sinistra (i margini sono leggibili, il centro è scan-mode debole). CTA primaria in alto-destra o bottom-center del viewport iniziale. Subheadline deve rompere il pattern (Von Restorff).

### P4 — Pattern recognition under incertezza (Kahneman, *Noise*, 2016)

Quando l'utente non ha abbastanza informazioni per decidere razionalmente (il caso tipico in hero), ricorre a **euristiche**: similarità con altri prodotti conosciuti, "seems familiar = seems safe", ricordo di pattern già visti. Questo crea due fenomeni:

- **Familiarity bias**: pattern noti attivano fiducia automatica (OpenAI/Anthropic hero pattern → trust).
- **Uncanny valley del design**: layout "troppo pulito", "troppo perfetto" attiva diffidenza — il cervello percepisce artificiosità predatoria.

**Conseguenza operativa**: la landing deve essere recognizable come SaaS premium (Linear / Stripe / Vercel) ma avere un dettaglio d'identità unica (palette, micro-interazione, fondatore marker) per evitare uncanny valley da eccesso di template.

### P5 — Tre domande automatiche nei primi 5 secondi

In eye-tracking su landing page, NN/g misura che nei primi 5 secondi l'utente risponde inconsapevolmente a tre domande:

1. **"Cos'è?"** (categoria mentale del prodotto)
2. **"È per me?"** (rilevanza)
3. **"Cosa posso fare adesso?"** (affordance CTA)

Se una delle tre non riceve risposta visibile above-the-fold, l'abbandono entro 8 secondi sale dal 17% (Baymard 2024, durata media sessione) al 45%+ (Petrocelli 2023, eye-tracking Stripe).

**Conseguenza operativa**: H1 = "cos'è + per chi" (JTBD cristallino). CTA = affordance chiara "Cosa posso fare adesso". Trust band = trust-by-familiarity ("è per me davvero").

---

## Evidenze

### Nielsen Norman Group — Eye-tracking su landing

- *Scrolling and Attention* (Kate Moran, 2018, aggiornato 2024): N=300 eye-tracking + meta-analisi. Risultato chiave: l'attenzione è distribuita (non concentrata above-the-fold) ma la **decisione** di restare/uscire avviene entro 5s sopra la fold. Lo scroll è ammesso, ma la decisione no.
  - Fonte: nngroup.com/articles/scrolling-and-attention/
- *F-Shaped Pattern of Reading on the Web* (Kara Pernice, Jakob Nielsen, 2019 update): N=300+ longitudinale. Conferma F-pattern su pagine dense + variante "spider" su landing brevi.
  - Fonte: nngroup.com/articles/f-shaped-pattern-reading-web-content/
- *5-Second Test for First Impression* (2020): N=300 usability test. Misura impressione sopra la fold prima di scroll.
  - Fonte: nngroup.com/articles/first-5-seconds-usability/

### Baymard Institute — Abbandono e form fields

- 44 E-Commerce UX Heuristics (aggiornato 2024). Studio aggregato su N>1.000 checkout reali. Risultati rilevanti per landing:
  - **17%** dei visitatori esce a causa di **complessità del form** (ideale ≤8 campi).
  - **18%** esce a causa di **dubbi sicurezza percepita** (assenza di trust signals).
  - **14%** esce a causa di **CTA poco visibile** above-the-fold.
  - Fonte: baymard.com/blog/checkout-flow-average-form-fields (Edward Scott, 2024)

### Carnegie Mellon / MIT Media Lab — Cognitive walkthrough

- Wharton, R. & Cooper, R., *Cognitive Walkthrough Method* (1990). Protocollo per valutare usabilità predittiva senza utenti reali. Applicato a ConcorsoAI: la landing è "cognitive walk-through compatibile" se alla prima occhiata il visitatore può:
  1. Identificare il prodotto.
  2. Identificarsi come target.
  3. Identificare l'azione primaria.
  4. Identificare il rischio (trust signals).

### Stanford Persuasive Tech Lab (B.J. Fogg)

- *Persuasive Technology: Using Computers to Change What We Think and Do* (Fogg, 2003). Modello **Behavior Model**:
  - **B (Behavior) = M (Motivation) × A (Ability) × P (Prompt)**
  - Una CTA convertente richiede che **tutti e tre** siano presenti contemporaneamente.
  - Per ConcorsoAI: Motivation = "voglio passare l'orale" (alto per il target). Ability = "capisco cosa devo fare" (la CTA deve essere chiara). Prompt = "la CTA è visibile e l'azione è chiara" (Von Restorff, hero CTA).
  - Fonte: captology.stanford.edu

---

## Errori comuni

### E1 — Trattare la landing come lettura, non come percezione

**Sintomo**: copy dense, prosa continua, paragrafi >3 righe sopra la fold. L'utente "non legge" le prime 200 parole: le percepisce come blocco di testo. Se non rompe il pattern di scanning, abbandona.

**Perché succede**: i copywriter addestrati alla stampa (PA-friendly tone) producono prosa argomentativa. Ma su web l'utente non argomenta: scansiona. La prosa è il mezzo sbagliato.

**Perché il cervello lo rifiuta**: System 1 non legge prosa; System 2 si attiva solo per task deliberativi. Se la hero è prosa continua, l'utente deve forzare System 2 per capire — costo cognitivo → abbandono.

### E2 — Concentrarsi sui 30 giorni, non sui 5 secondi

**Sintomo**: copy, design e CTA ottimizzati per utenti che leggono l'intera pagina. La realtà: oltre il 70% dei visitatori decide entro 5s sulla fold se restare o uscire (NN/g 2018, Baymard 2024).

**Perché succede**: il designer lavora con scroll completi; il copywriter scrive con l'intenzione di costruire argomentazione; nessuno dei due ottimizza per l'impressione above-the-fold.

**Perché il cervello lo rifiuta**: System 1 forma l'impressione in <500ms. Se quella impressione è "non capisco / non è per me / non mi fido", l'utente esce. Non c'è una "seconda possibilità" sotto la fold.

### E3 — Zero prove del modello mentale utente

**Sintomo**: decisioni di copy/design prese senza aver mai guardato l'utente target. "Sembra bello" senza misura "sembra chiaro per lui".

**Perché succede**: project manager e designer costruiscono la landing a partire dal benchmark "cosa fanno gli altri", non da "cosa cerca lui". Mancanza di interviste, mancanza di eye-tracking, mancanza di A/B test continui.

**Perché il cervello lo rifiuta**: l'utente target non è "l'utente medio". Il candidato PA italiano ha ansia alta sull'orale, diffida dell'AI, vuole prove normative concrete. Una landing scritta per "developer che cerca AI tool" non funziona su questo target.

### E4 — Trattare System 2 come dominante

**Sintomo**: copy complessa con claim multipli, paragrafi comparativi, micro-disclaimers ovunque. L'utente non ha pazienza di elaborare: System 1 deve avere già deciso prima che System 2 possa intervenire.

**Perché succede**: il committente vuole "tutti i messaggi chiave in hero". Il risultato è una hero con 8 claim e zero gerarchia percettiva.

**Perché il cervello lo rifiuta**: working memory limitata (4±1). Se System 2 non riesce a elaborare, l'informazione evapora. L'utente esce con la sensazione confusa di "letto ma non capito".

---

## Pattern migliori

### Pattern A — Hero con impressione System 1 coerente

La hero comunica a System 1 una sola "impressione coerente". L'utente nei primi 5 secondi deve poter dire a sé stesso: "questo è un tool serio per simulare l'orale del mio concorso".

Esempio Linear ("A new species of product tool"): impressione = "visionario, opinionated". Esempio ConcorsoAI ("Simula l'orale sul tuo bando"): impressione = "JTBD specifico, istituzionale, low-hype".

**Pattern implementativo**: H1 ≤8 parole, JTBD cristallino, subheadline 12-25 parole, trust band specifico (3 badge), CTA unica button. Total font-bundle above-the-fold: 1 font family, max 2 weight, 1 mono per i numeri.

### Pattern B — Modello mentale utente dichiarato esplicitamente

Documento di 1-2 pagine che descrive chi è l'utente, cosa pensa nei primi 30 secondi, quali sono le sue 3 obiezioni principali, come risolverle. Esempio ConcorsoAI:

- Persona 1 (Marco, 26, orale fra 15 giorni): ansia + fretta + diffidenza dell'AI. Vuole partire in 1 click, vede un mockup credibile. La prima obiezione è "quanto tempo ci metto?".
- Persona 2 (Giulia, 41, diffida dell'AI): non cerca velocità, cerca prove di compliance. La prima obiezione è "i miei dati sono al sicuro?".
- Questi due modelli mentali **coesistono**. La landing deve parlare a entrambi, non solo al più rappresentativo.

### Pattern C — Pre-flight cognitive walkthrough

Prima di pubblicare, un designer o un product strategist esegue un cognitive walkthrough esplicito (Wharton & Cooper 1990): "Guardando la hero, posso in 5 secondi...":

1. Identificare prodotto? [sì / no / dubbio]
2. Identificarsi come target? [sì / no / dubbio]
3. Identificare azione? [sì / no / dubbio]
4. Identificare rischio? [sì / no / dubbio]

Se una risposta è "dubbio", c'è un blocco cognitivo da sciogliere. Questo check è più rapido di un A/B test e precede il design di dettaglio.

---

## Checklist

- [ ] H1 ≤8 parole, risponde alla domanda "cos'è + per chi"
- [ ] Subheadline 12-25 parole, completa la percezione senza ridondanza
- [ ] CTA unica visibile above-the-fold
- [ ] Trust band minima 3 elementi verificabili (non claim gonfiati)
- [ ] Test 5-second test eseguito con 3-5 persone del target (informal)
- [ ] Cognitive walkthrough (4 domande Wharton-Cooper) superato
- [ ] Working memory audit: sopra la fold non più di 4 unità informative
- [ ] Famiglia di font: 1 sola (max 2 weight) + 1 mono per numeri
- [ ] Modello mentale utente scritto e disponibile al team (1-2 pagine)
- [ ] Zero claim gonfiati (numeri senza fonte, "10K utenti soddisfatti")

---

## Decisioni progettuali

### Da H1 a JTBD crystallino

La H1 deve rispondere alla domanda System 1 in <500ms. Decisione: scrivere l'H1 come formula JTBD **[verbo d'azione] + [oggetto specifico] + [contesto]**. Esempio: "Simula l'orale sul tuo bando" (= verbo "Simula" + oggetto "l'orale" + contesto "sul tuo bando").

Escludere claim generici ("La piattaforma AI per concorsi"), claim iperbolici ("Rivoluziona la tua preparazione"), claim vaghi ("Studia meglio").

### Da subheadline a percezione di benefit

Sub-headline ≤25 parole, complemento della H1 senza ridondanza. Per ConcorsoAI: "3 simulazioni gratis al mese · Senza carta · Beta aperta" → comunica benefit immediato + rimuove ansia commerciale + segnala incompletezza onesta.

### Da CTA a affordance chiara

CTA primaria deve rispondere a "Cosa posso fare adesso?". Non "Get started" (generico), non "Learn more" (vago). Per ConcorsoAI: "Inizia la tua prima simulazione" (= guarda cosa ottieni, prima di registrarti).

### Da trust band a familiarità istituzionale

Trust band 3 elementi sopra la fold (subito sotto la CTA): pattern riconoscibili del dominio (GDPR, server EU, garanzia rimborsabile, no LLM USA). Per il candidato PA italiano la compliance visibile è trust-by-familiarity: si fida perché il pattern è istituzionale-noto.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato attuale |
|---|---|---|
| H1 JTBD | "Simula l'orale sul tuo bando" — 6 parole, JTBD cristallino | ✅ applicato |
| Sub-headline | "3 simulazioni gratis al mese · Senza carta · Beta aperta" | ✅ applicato |
| Trust band | GDPR + Server EU + No LLM USA, badge specifici | ✅ applicato |
| CTA unica | "Inizia la tua prima simulazione" — visibile above-the-fold | ✅ applicato |
| Modello mentale | Documento di 2 pagine in `landing/fase-01-modello-mentale-visitatore.md` (archiviato, migrato qui) | ✅ fatto |
| Cognitive walkthrough | Eseguito a ogni iterazione di `public/index.html` | ⚠️ da formalizzare |
| 5-second test | Eseguiti informalmente in 2 round | ✅ fatto |

**Gap da presidiare**: il cognitive walkthrough va reso procedurale (1 check pre-publish obbligatorio). La redazione del modello mentale va mantenuta viva (aggiornare a ogni nuova persona identificata).

---

## Vincoli

- ❌ **NO** copy generata da LLM senza revisione manuale. Ogni riga della landing deve essere verificata da una persona reale che possa difenderne la scelta.
- ❌ **NO** "test 5-secondi" con persone sbagliate (developer interni che valutano per candidato PA → bias fortissimo).
- ❌ **NO** claim di impressione above-the-fold non verificati (es. "sembra istituzionale" senza eye-tracking).
- ❌ **NO** decisioni di copy design basate solo su benchmark "cosa fanno gli altri SaaS" — il benchmark è informativo, non decisionale.
- ❌ **NO** cognitivo-walkthrough auto-valutato del designer (System 1 del designer è diverso da System 1 del candidato PA).

---

*Continua in `02_decision_making.md`.*
