# 02 — Decision making cognitivo sulla landing

> **Scopo**: mappare i processi decisionali che portano il visitatore a fidarsi, cliccare, registrarsi o abbandonare. La psicologia del file 01 descrive *chi è l'utente*. Questo file descrive *come decide*. Sequenza gerarchica: prima la psicologia, poi la decisione, poi il comportamento (file 03), poi la persuasione (file 11-15).

---

## Introduzione

### Perché questo file è il secondo

La differenza tra "landing che converte" e "landing che non converte" non è quasi mai nel prodotto, è nella **decisione cognitiva dell'utente**. Lo stesso prodotto può essere valutato come "premium e affidabile" o come "sospetto e costoso" a seconda di come la landing gestisce la fase decisionale.

Il modello di decisione è stratificato su 4 livelli:

1. **Rappresentazione mentale del problema** (il visitatore ha un problema che il prodotto risolve?)
2. **Generazione di alternative** (esistono prodotti alternativi?)
3. **Valutazione delle alternative** (questo prodotto vale la pena rispetto agli altri?)
4. **Decisione finale** (cliccare, acquistare, abbandonare).

Ogni livello è veicolato da processi cognitivi diversi: euristiche, bias, regole di thumb, ragionamento analogico. Comprendere questi livelli permette di intervenire su ciascuno con leve specifiche.

Riferimenti teorici: Herbert Simon, *Bounded Rationality* (1957, premio Nobel 1978); Tversky & Kahneman, *Judgment Under Uncertainty* (1974); Kahneman, *Thinking, Fast and Slow* (2011); Thaler & Sunstein, *Nudge* (2008); Christensen, *Jobs to Be Done* (Harvard Business School).

### Come si applica a ConcorsoAI

Il candidato PA ha un problema specifico ("non so se sono pronto per l'orale"), un'alternativa nota ("potrei usare ChatGPT o studiare da solo"), un'alternativa pay nota ("ripetizioni private €80/h"). La landing deve muoversi lungo tutti e 4 i livelli: rendere evidente il problema, evidenziare la specificità rispetto alle alternative, far percepire il valore differenziale, rendere la decisione facile.

L'errore comune è fermarsi al livello 1 (problema) e al livello 4 (CTA). Saltare i livelli 2 e 3 (alternative + valutazione) significa lasciare il visitatore a fare il lavoro di confronto da solo — high effort → abbandono.

---

## Principi

### P1 — Bounded rationality (Simon 1957): decisione imperfetta è la norma

Le persone non sono agenti razionali che confrontano tutte le alternative e scelgono l'ottima. Sono agenti a **razionalità limitata** che:

- cercano **informazione sufficiente** (non completa)
- generano **poche alternative** (non esaustive)
- applicano **euristiche** (non ottimizzazione)
- si fermano alla prima **alternativa soddisfacente** (satisficing, non maximizing)

Conseguenza: la landing non deve presentare tutte le alternative esistenti sul mercato. Deve presentare **2-3 alternative rilevanti** (incluso "non fare nulla") e mostrare perché il prodotto è la scelta razionale SULLE ALTERNATIVE PRESENTATE.

### P2 — Availability heuristic (Tversky & Kahneman 1973)

La probabilità soggettiva di un evento è giudicata sulla base di **quanto facilmente viene in mente un esempio**. Se il visitatore ricorda facilmente una brutta esperienza con ChatGPT (citazioni normative sbagliate), giudicherà ChatGPT come rischioso. Se non ricorda ConcorsoAI, lo giudicherà incerto.

Conseguenza: la landing deve rendere **disponibili** i ricordi che favoriscono la scelta. Pattern:

- aneddoti concreti ("Marco V., 34 anni, concorso Ragioneria 2025")
- confronti espliciti ("Noi vs ChatGPT vs Da solo", tabella comparativa)
- visual che richiama contesto familiare (mockup con materie PA reali)

### P3 — Anchoring & adjustment (Tversky & Kahneman 1974)

Il primo numero percepito nella sequenza cognitiva diventa **riferimento inconscio** per tutte le valutazioni successive. L'utente che legge "€14,99 /mese" come primo dato di pricing poi valuterà "€119/anno" come caro, €0 come free, "30 giorni rimborsabili" come generoso.

Conseguenza: l'**ordine dei numeri** conta. Per ConcorsoAI:

- Settare l'anchor sul costo delle alternative (€80/h ripetizioni private, confrontabile su landing).
- Presentare il proprio prezzo **dopo** l'anchor esterno.
- Mai mettere tier premium a sinistra (occhio occidentale legge sx→dx, sx è percepito come "standard").

### P4 — Default effect / Status quo bias

Samuelson & Zeckhauser (1988), ripreso da Johnson & Goldstein (2003) per il contesto medico: pre-selezionare un'opzione fa sì che le persone la mantengano anche in presenza di alternative migliori. Pattern documentato in opt-in/opt-out per organ donation (50%+ vs 5%), 401k plans (40% default), energia elettrica.

Conseguenza: nella landing di un SaaS il **default effect** si applica in tre punti:

1. **Toggle mensile/annuale**: pre-selezionare annuale con badge "Risparmi 30%" aumenta uptake annuale. (Da validare post-Stripe.)
2. **CTA unica vs multiple**: CTA unica è il default cognitivo ("c'è solo un'azione possibile qui").
3. **No form preventivo**: il default è "non serve la carta" (rimozione frizione = default positivo).

### P5 — Choice architecture (Thaler & Sunstein 2008)

Ogni decisione è veicolata dall'architettura del contesto: ordine, presentazione, framing, default. Non esiste decisione "neutrale" — esiste solo decisione con architettura più o meno esplicita.

Conseguenza: il designer è un **choice architect**. Ogni sezione della landing è una micro-architettura decisionale:

- Sezione pricing: tier centrale evidenziato → la scelta naturale è il tier centrale.
- Sezione FAQ: prima domanda "costa davvero?" → la prima ansia è gestita, le altre vengono dopo.
- Sezione confronto: prima riga = vantaggio principale → confermato prima delle sfumature.

### P6 — Peak-End rule (Kahneman & Fredrickson 1993)

L'esperienza ricordata è dominata dal **momento di picco emozionale** (massimo o minimo) e dalla **fine**, non dalla durata complessiva. Duration neglect.

Conseguenza: la landing deve progettare **due momenti** nella sequenza dell'utente:

1. Il **picco**: la hero con mockup + CTA che dimostra il valore (peak emozionale alto).
2. La **fine**: la conferma d'azione con feedback gratificante ("Simulazione completata · Punteggio 78/100 · Pronto per il tuo orale").

Il resto della pagina deve essere "respirazione", non source di ulteriore decisione cognitiva.

### P7 — Loss aversion λ≈1.95 (Kahneman & Tversky 1979, meta-analisi Brown et al. 2024)

Il dolore percepito per una perdita è circa **2 volte superiore al piacere percepito per un guadagno equivalente**. Per la landing, questo significa: **framare le conseguenze dell'INAZIONE** è più persuasivo che framare i benefici dell'AZIONE.

Conseguenza: copy che evita la perdita è 2x più efficace di copy che promette il guadagno. Per ConcorsoAI:

- "Non sai dove insistono i commissari del tuo bando" (loss) > "Saprai dove insistono" (gain).
- "30 giorni di simulazioni gratis · senza carta" (gain, perché la baseline è free).
- "Cancella quando vuoi · 30gg rimborsabili" (rimozione rischio perdita = inverso).

---

## Evidenze

### Kahneman & Tversky (1979) — Prospect Theory

- Studio fondativo della behavioral economics. N=43 esperimenti, replicato in oltre 200 studi successivi.
- Risultato chiave: la funzione di valore è concava nei guadagni (sensibilità decrescente), convessa nelle perdite (sensibilità crescente), e più ripida nelle perdite.
- Coefficiente λ medio stimato da meta-analisi (Brown et al. 2024, *Journal of Economic Literature*) = **1.95**.
- Fonte: jstor.org/stable/1879431 (articolo originale); jstor.org meta-analisi aggiornata.

### Thaler & Sunstein (2008) — *Nudge*

- Libro fondativo della choice architecture. 4 edizioni (2008, 2021). Riferimento mondiale per default effect, opt-in/opt-out, salience.
- Per SaaS: pattern "default positivo" per l'iscrizione, "friction rimossa" per il downgrade, "reminder" per la retention.
- Fonte: thefreemanonline.org (recensioni peer-reviewed).

### Iyengar & Lepper (2000) — Marmellate

- Esperimento classico: al supermercato, banco con 24 marmellate = 3% conversion; banco con 6 marmellate = 30% conversion. N=370 shoppers.
- Risultato: choice overload riduce tassi di decisione e di soddisfazione post-scelta.
- Conseguenza per SaaS: limitare le scelte nella pricing page (3 tier max) aumenta la probabilità di selezione di UNA di esse.
- Fonte: psycnet.apa.org/record/2000-15106-006 (Journal of Personality and Social Psychology).

### Wharton & Cooper (1990) — Cognitive Walkthrough

- Metodo formale per valutare l'usabilità predittiva di un'interfaccia, basato su modelli cognitivi (Norman 1986). Applicabile a landing page.
- Sequenza: (1) identificare utenti target e loro goal; (2) identificare sequenza di azioni; (3) per ogni azione, chiedere "l'utente capisce che può fare X? capisce come fare X? riceve feedback adeguato?".
- Fonte: cognitivetaskdesign.co.uk/cogwalk (academic).

### Sunstein (2014) — *Choosing Not to Choose*

- Studio su quando il default effect fallisce: troppe opzioni, informazione incompleta, identità culturale diversa. Per ConcorsoAI: il candidato PA è culturalmente italiano, default effect funziona bene (es. codice civile come "base" mentale per tutto).

---

## Errori comuni

### E1 — Presentare il prodotto senza presentare le alternative

**Sintomo**: la landing descrive cosa fa il prodotto, ma non lo confronta con cosa fa l'alternativa (ChatGPT, studiare da solo, ripetizioni private).

**Perché succede**: i copywriter tendono a descrivere solo il prodotto. Pensano che il confronto sia "negativo" o aggressivo. In realtà, senza confronto, il visitatore non sa DOVE collocare il prodotto nella sua mappa mentale.

**Perché il cervello lo rifiuta**: bounded rationality — senza alternative esplicite, il visitatore "inventa" le alternative peggiori (es. ChatGPT, che ha già provato e trovato carente). Se la landing non sconfigge quelle, perde.

### E2 — Troppi tier pricing o troppi fattori di scelta

**Sintomo**: pricing con 5+ tier, ognuno con 8+ feature, matrice di confronto complicata.

**Perché succede**: "trasparenza" male intesa. Il PM pensa che mostrare tutte le opzioni sia sinonimo di fiducia. In realtà moltiplica il carico cognitivo.

**Perché il cervello lo rifiuta**: studio Iyengar & Lepper (2000) — si moltiplica per 4 la "decision paralysis". Nei SaaS, 5+ tier riduce conversion di 30-45% (Unbounce benchmark 2025, N=18.639).

### E3 — Prezzi nascosti o "Contattaci" per tier standard

**Sintomo**: tier basso/medio dice "contattaci per pricing", tier base mostrato ma fee nascosti. Questo è classificato come **dark pattern** dalla **Omnibus Directive EU 2019/2161** (aggravamento della Direttiva 2005/29/CE), in vigore dal 28 maggio 2022.

**Perché succede**: l'azienda vuole "qualificare" il lead prima di mostrare il prezzo, o vuole nascondere che il prezzo è più alto di quanto sembri. Entrambi sono tecniche commerciali aggressive.

**Perché il cervello lo rifiuta**: il visitatore PA italiano è culturalmente formato alla trasparenza istituzionale (burocrazia pubblica, normative). L'opacità di pricing attiva sospetto di frode.

### E4 — Trigger di decisione sbagliati (urgenza fabbricata, scarsità fabbricata)

**Sintomo**: countdown fittizio "L'offerta finisce tra 3:59:59" o "Solo 5 posti rimasti" che si resetta ad ogni refresh. Pattern classificato come **dark pattern** dalla **CPC Sweeps European Commission 2022-2025**.

**Perché succede**: i marketer pensano che la scarsità/urgenza creino velocity decisionale. Sì, nel breve. Ma erodono il trust nel medio termine (l'utente che torna vede la stessa offerta, si convince che era fuffa).

**Perché il cervello lo rifiuta**: moderni consumatori (Gen Z + Millennaria, ma anche over 35 digitalizzati) hanno pattern recognition attivato su questi pattern. Una landing con claim del genere attiva diffidenza istantanea.

### E5 — Trust signals non specifici ("Sicuro e affidabile")

**Sintomo**: copy con claim generici su sicurezza/affidabilità/qualità, senza prove concrete.

**Perché succede**: il PM pensa che "dire che è sicuro" generi fiducia. In realtà, senza prove specifiche, il claim attiva filtro scettico (il visitatore si chiede "perché lo dice se non ha prove?").

**Perché il cervello lo rifiuta**: Specificity Effect (vedi file 03 §3.1). Affermazione specifica → credibile. Affermazione vaga → boost di scetticismo. Pattern Linear/Stripe: 1 frase con 3 numeri verificabili > 1 paragrafo di claim generici.

---

## Pattern migliori

### Pattern A — Confronto esplicito con alternativa nota

Creare una sezione "Noi vs [alternativa nota] vs [fare nulla]". Esempio ConcorsoAI:

- "Da solo: studi ma non ti misuri su materie specifiche del tuo bando."
- "ChatGPT: generico, non conosce il tuo bando, non ricorda le tue sessioni precedenti."
- "ConcorsoAI: carica il tuo PDF, estrae materie specifiche, ti interroga solo su quelle, ricorda le tue performance."

Pattern implementativo: tabella comparativa senza colonna dispregiativa (mai dire "loro sono scarsi", sempre dire "loro hanno X limitazione specifica").

### Pattern B — Anchor esterno + prezzo interno

Aprire la sezione pricing con l'**anchor esterno** (es. "Le ripetizioni private costano €80-150/h"). Poi presentare il prezzo del prodotto come confronto diretto. Esempio: "ConcorsoAI Pro = €14,99/mese = €0,50/giorno = prezzo di 1 caffè al giorno."

Pattern implementativo: 1 anchor + 1 calcolo diretto + 1 framing temporale ("al giorno", "alla settimana"). Il prezzo percepito cala di 5-10 volte.

### Pattern C — Loss frame per call-out di inazione

Per CTA copy e header, framare la **non-azione** come la perdita più concreta. Esempi:

- "Non sai dove insistono i commissari del tuo bando." (loss)
- "Ogni orale a cui arrivi impreparato è un'opportunità persa." (loss)
- "Passi l'orale solo se ti alleni come se fosse già domani." (rimozione rischio + JTBD)

Pattern implementativo: ogni claim "azione → guadagno" deve avere il suo specchio "non-azione → perdita". Senza specchio, manca la metà persuasiva del messaggio.

### Pattern D — Peak-end in due momenti della sequenza utente

1. **Peak nella hero**: il mockup interattivo con punteggio live, materie reali del bando, timer. Peak emozionale = "capisco cosa farà per me".
2. **End nella fine simulazione / conferma registrazione**: animazione celebrativa micro + badge "Simulazione completata" + punteggio.

Pattern implementativo: il resto della sequenza è "respirazione" — non deve aggiungere né sottrarre emozione. Concentrare emozione in due momenti è più efficace che distribuirla uniformemente.

### Pattern E — Default effect esplicito su toggle annuale

Quando Stripe sarà attivo (Q3 2026): toggle mensile/annuale, con default = annuale + badge "Risparmi €37/anno". Pattern Stripe / Linear / Vercel.

Pattern implementativo: aria-pressed="true" sul toggle annuale + visivamente highlighted. JS disable del toggle mensile se l'utente ha già scelto annuale (no confusione).

---

## Checklist

- [ ] Sezione "confronto con alternative" presente (vs ChatGPT, vs da solo, vs ripetizioni private)
- [ ] Tabella comparativa senza colonna dispregiativa, solo limitazioni concrete
- [ ] Anchor esterno presentato prima del proprio pricing (es. €80/h ripetizioni → €14,99/mese)
- [ ] CTA copy con framing misto (gain + loss specchio)
- [ ] Max 3 tier nella pricing page (Hick's law)
- [ ] Tier centrale evidenziato con bordo + badge "Consigliato"
- [ ] Toggle mensile/annuale, default annuale con badge
- [ ] Tutti i prezzi visibili senza "Contattaci" (compliance Omnibus EU)
- [ ] Peak emozionale in hero (mockup + demo interattiva)
- [ ] End celebrativo in chiusura azione (corfimazione / completamento)
- [ ] Zero countdown fittizio, zero scarsità fabbricata (compliance CPC EU)
- [ ] Trust signals specifici con numeri verificabili (vedi file 14)

---

## Decisioni progettuali

### Da tier pricing a 3 (Goldilocks)

Scelta: limitarsi a **2 tier pre-Stripe** (Free + Pro) e **3 tier post-Stripe** (Free + Pro + Team oppure + Master PA con coaching). Mai 4+. Razionale: Hick's Law + studio Iyengar & Lepper marmellate (3 vs 24 = 30% vs 3% conversion).

### Da anchor a competitor pricing

Scelta: ancorare il pricing al costo noto delle ripetizioni private PA (€80-150/h). Far percepire il proprio prodotto come "razione economicamente superiore per definizione".

### Da CTA copy a action-verb specifico

Scelta: sostituire tutti i "Inizia gratis", "Scopri di più", "Get started" con action-verb specifico:
- "Inizia la tua prima simulazione" (hero)
- "Vedi il tuo punteggio realistico" (CTA secondaria in mockup)
- "Sblocca tutte le materie del tuo bando" (pricing → Pro)
- "Cancella quando vuoi" (footer / FAQ)

### Da peak a doppio anchor emozionale

Scelta: costruire due momenti emozionali forti — hero (mockup) + fine simulazione (animazione celebrativa) — e lasciare "neutro" il resto della sequenza.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Sezione confronto "Noi vs ChatGPT vs Da solo" | Tabella 3-colonne | ✅ applicato |
| Anchor "ripetizioni €80/h" | Sotto pricing o in sezione confronto | ✅ applicato |
| Loss frame in hero | "Scopri se supereresti l'orale del tuo bando" | ✅ fatto / variante |
| Max 2 tier pre-Stripe | Free + Pro €14,99/mese | ✅ applicato |
| Toggle annuale/mensile post-Stripe | Default annuale | ⏳ Q3 2026 |
| Peak in hero + end in chiusura | Mockup 3-tab + animazione fine | ✅ fatto |
| Zero countdown fittizio | Nessun countdown presente | ✅ applicato |

**Gap**: la sezione "Noi vs ChatGPT" può diventare più specifica (citazioni normative reali come termine di paragone). La sezione prenotazione del tier Team va definita quando Stripe sarà attivo.

---

## Vincoli

- ❌ **NO** tree decisionali che nascondono il prezzo o "qualificano" il lead dietro form intermediari.
- ❌ **NO** urgenza fabbricata o scarsità fabbricata (CPC EU violation + trust destroyer).
- ❌ **NO** chiamata a "contattaci" per tier standard (Omnibus EU violation).
- ❌ **NO** tabella comparativa con colonna dispregiativa ("Loro sono scarsi").
- ❌ **NO** peak emozionale sintetico (animazioni fake "wow!") che erode il trust.
- ❌ **NO** gerarchia di copy che nasconde i trade-off reali del prodotto.

---

*Continua in `03_behavioral_economics.md`.*
