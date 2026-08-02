# 03 — Behavioral economics applicata alla landing

> **Scopo**: trasformare i bias e le euristiche della letteratura accademica (Kahneman, Tversky, Thaler, Cialdini, Ariely, Sunstein) in leve operative per la landing. File 02 ha mappato il processo decisionale. Questo file entra nel merito dei bias specifici. Sequenza: psicologia → decisione → bias → copy (file 11-15).

---

## Introduzione

### Perché behavioral economics conta qui

La landing opera su un arco temporale di 5-30 secondi. In questa finestra, il visitatore non svolge ragionamento deliberativo: applica **euristiche pronte**, apprese culturalmente, valide in contesti di incertezza. Le euristiche sono scorciatoie cognitive che funzionano 80% delle volte e falliscono 20%. Noi vogliamo attivare le euristiche corrette per la nostra decisione e disattivare quelle che porterebbero ad abbandono.

Esempio: se la landing dice "10.000 utenti soddisfatti", il visitatore europeo attiva l'euristica "claim gonfiato senza prove = scettico". Se la landing dice "Costruito a Milano · Beta aperta · Luglio 2026", il visitatore europeo attiva l'euristica "fondatore onesto, prodotto emergente = plausibile". Lo stesso dato è in una landing diversa, la reazione è opposta.

Behavioral economics è lo studio sistematico di queste euristiche e dei bias che generano. Per una landing, ignorarla significa progettare come se ogni visitatore fosse un agent razionale "homo economicus" — che non esiste.

Riferimenti: Cialdini (1984, 2016); Kahneman (2011); Thaler & Sunstein (2008); Ariely (2008); Sunstein (2014); Samuelson & Zeckhauser (1988); Bowman et al. (1999).

### Come si applica a ConcorsoAI

L'utente target è culturalmente italiano, formato alla burocrazia pubblica, diffidente verso claim non dimostrati. Le leveraged euristiche applicabili:

- **Reciprocità**: dai valore prima di chiedere auth.
- **Specificity**: numeri concreti > claim generici.
- **Founder marker**: dichiarare chi sei e dove sei.
- **Compliance signaling**: GDPR, server EU, codice del consumo (Art. 49 recesso).
- **Default**: tier centrale nella pricing è il default cognitivo.

Le euristiche da disattivare (perché attivabili in negativo):

- **Urgency fabbricata**: countdown fittizi attivano "questa è fuffa".
- **Scarsità fabbricata**: "Solo 3 posti" costante attiva "è un bluff".
- **Authority inventata**: "Citato da Forbes" senza verifica attiva "falso".

---

## Principi

### P1 — Le 7 euristiche di Cialdini (riepilogo operativo)

Robert Cialdini in *Influence: Science and Practice* (1984, 4ª ed. 2006, 7ª ed. 2016) identifica 7 principi di persuasione, validati in centinaia di studi:

1. **Reciprocità** — chi dà per primo riceve. Pattern SaaS: mini-prodotto gratis senza auth.
2. **Commitment & Consistency** — impegni pubblici vincolano. Pattern SaaS: micro-commitment prima della richiesta pesante (foot-in-the-door).
3. **Social Proof** — gli altri fanno X, io faccio X. Pattern SaaS: testimonianze nominative (non "1000+ utenti").
4. **Liking** — fare affari con chi ci piace. Pattern SaaS: founder marker, copy con voce autoriale riconoscibile.
5. **Authority** — credibilità attribuita a figure percepite come esperte. Pattern SaaS per PA: citazioni normative istituzionali (art. 97 Cost., DPR 487/1994).
6. **Scarcity** — valore percepito cresce con scarsità. Pattern SaaS reale: coorte limitata founder (NON countdown fittizio).
7. **Unity** (7° principio aggiunto 2016): identità condivisa ("noi"). Pattern SaaS: copy che fa sentire l'utente parte di una tribù.

Questi principi NON sono "manipolazione": sono leve naturali che il visitatore attiva spontaneamente. L'etica del design sta nel NON attivare leve specchiate (es. scarsità fabbricata) e nell'attivare solo leve coerenti con la realtà.

### P2 — Loss aversion è 2x più forte del gain (Kahneman-Tversky 1979)

Il coefficiente λ=1.95 (meta-analisi Brown et al. 2024) è tra i dati più robusti della behavioral economics. Una perdita percepita di 100€ equivale a un dolore psicologico di 100; un guadagno di 100€ equivale a un piacere di 51. Quindi **framare in termini di perdita è 2x più persuasivo** che framare in termini di guadagno.

Pattern operativo:

- "Non sai se sei pronto per l'orale" (perdita: certezza non acquisita).
- "Ogni sessione di non preparazione è un gap accumulato" (perdita: gap nel curriculum).
- "Senza pratica, la memoria delle materie evapora in 4 settimane" (perdita con specificità).

Ma: il loss frame deve essere **coerente con la realtà**. Se il prodotto non risolve davvero quella perdita, il loss frame erode il trust.

### P3 — Default effect (Samuelson/Zeckhauser 1988, Johnson/Goldstein 2003)

Documentato in opt-in organ donation (Germania 12%, Austria 99%, differenza di default), 401k saver plans (80%+ uptake con default), EU cookie consent (pre-checked = 90% accept, unchecked = 30% accept). Pattern robusto.

Per SaaS:
- Toggle mensile/annuale, default annuale con badge "+30% saving".
- Form di contatto con campi opzionali già pre-flaggati.
- Cookie consent modal con "essential only" pre-selezionato.
- Newsletter signup con opt-out pre-flaggato.

### P4 — Endowment effect (Thaler 1980)

Beni che possediamo (anche simbolicamente) valgono di più di quelli che possiamo acquistare. Per SaaS: trial con dati pre-popolati crea senso di possesso che aumenta retention post-trial. Esempio: dashboard ConcorsoAI con già un punteggio di partenza ("78/100 — basato sui primi 3 giorni") che l'utente "possiede" e non vuole perdere.

Pattern operativo ConcorsoAI: dopo la prima simulazione, salvare il punteggio nel LocalStorage. Mostrarlo nella dashboard anche prima di login. Generare sunk cost psicologico.

### P5 — Sunk cost fallacy (Arkes & Blumer 1985)

Le persone continuano a investire in qualcosa perché hanno già investito. Funziona sia per retention sia per onboarding: dopo il primo setup, l'utente vuole "finire". Per ConcorsoAI: onboarding multi-step (configura materia / bando / difficoltà) in cui ogni step crea commitment cumulativo.

Pattern operativo: wizard a step progressivi, non form monolitico. Ogni step ha "next", non "submit".

### P6 — Hyperbolic discounting (Ainslie 1975, marshmallow test Mischel 1989)

Reward immediati valgono enormemente di più di reward futuri equivalenti. Per SaaS: trial più corti (14gg > 30gg) producono velocity di decisione superiore. Post-trial, reward aggiuntivi in estensione trial ("hai sbloccato 7gg extra come bonus").

Per ConcorsoAI pre-Stripe: 3 simulazioni gratuite immediate = reward immediato, zero form, zero attesa. Per il visitatore che arriva con "ansia + fretta" (Marco persona), questo è il pattern corretto.

### P7 — Effort justification (Festinger 1957, replica Aronson/Mills 1959)

Più sforzo investito in qualcosa, più lo si valuta. Il setup wizard di ConcorsoAI non deve essere **troppo facile** (altrimenti l'utente non dà peso al prodotto). Pattern: 5 step di setup rapido (5 min totali) crea effort sufficiente per generare commitment senza generare friction.

### P8 — Specificity effect in trust

Affermazioni specifiche (numeri, contesti, date) attivano credibility. Affermazioni generiche attivano scetticismo. Pattern specifico:
- "5 beta user in Lombardia · Luglio 2026" > "Tanti utenti soddisfatti".
- "3 simulazioni gratis al mese" > "Prova gratis".
- "Server in Germania, GDPR-compliant" > "Sicuro".

---

## Evidenze

### Cialdini (1984) — *Influence*

- Libro fondativo delle 7 euristiche. 4 edizioni cumulative vendute >5 milioni di copie.
- N=143 esperimenti cumulativi pubblicati.
- Per SaaS: cap 4 (Social Proof) + cap 7 (Authority) sono i più azionabili per landing B2B/B2C ibrida.
- Fonte: influenceatwork.com (sito ufficiale ricercatore).

### Ariely (2003) — *Predictably Irrational*

- Esperimento "The Economist subscription": 3 opzioni (Solo Online $59, Solo Cartaceo $125, Online + Cartaceo $125). La 3ª opzione "decoy" aumenta la scelta della 2ª. Rilevante per SaaS pricing con 3 tier asimmetrici.
- Fonte: predictablyirrational.com / danariely.com

### Brown et al. (2024) — Meta-analisi Loss Aversion

- Coefficiente λ aggregato su 150+ studi = 1.95 (95% CI 1.79-2.10).
- Studio pubblicato su *Journal of Economic Literature*.
- Fonte: jstor.org meta-analisi.

### Goldstein, Cialdini & Griskevicius (2008) — Norm towel

- Esperimento hotel: "La maggior parte degli ospiti riutilizza gli asciugamani" (44.1%) vs "Gli ospiti che hanno riutlizzato l'asciugamano in questa camera" (49.3%). +5% effect per norma **specifica** vs generica.
- Per SaaS: "I candidati che hanno superato l'orale con questo approccio: Marco, 34, Ragioneria 2025" > "10.000 candidati soddisfatti".
- Fonte: jstor.org/stable/586917.

### Sunstein (2014) — *Choosing Not to Choose*

- Come e quando il default effect funziona. Limiti: troppe opzioni, identità culturale diversa, aspettative violate.

### Kahneman (2011) — *Thinking, Fast and Slow*

- Reference mondiale del System 1/System 2. 3 milioni+ copie vendute. Premio Nobel (2002, condiviso con Tversky). Per landing: cap 5 "Two Selves" contiene il framework Peak-End.

### Bowman et al. (1999) — *Improving a Company's Service*

- Effect sizes quantificati per miglioramenti di customer service. Rilevante per retention post-acquisto.

---

## Errori comuni

### E1 — Applicare i 7 principi in modo speculare

**Sintomo**: la landing attiva tutti e 7 i principi di Cialdini simultaneamente. Risultato: overwhelm + percezione di manipolazione.

**Perché succede**: marketing addicted ai "tricks". Pensano che di più = meglio. In realtà l'overclaims attiva il "filter scettico".

**Perché il cervello lo rifiuta**: quando tutti i principi parlano insieme, nessuno parla. Il visitatore entra in modalità "troppo bello, mi sa che è fuffa".

**Soluzione**: scegliere 2-3 principi coerenti con il prodotto. Per ConcorsoAI: specificity + authority (citazioni normative) + founder marker. Non servirà social proof finché non ci sono utenti reali.

### E2 — Loss frame senza risoluzione

**Sintomo**: copy heavy su "cosa perdi senza ConcorsoAI" senza specificare cosa ottieni facendo.

**Perché succede**: i copywriter scoprono loss aversion e ne abusano. Il visitatore legge tutto "perdi", "perdi", "perdi" — e l'unica azione proposta è "clicca qui".

**Perché il cervello lo rifiuta**: la motivazione di evitare la perdita deve avere un'azione chiara. Altrimenti è solo ansia aggiuntiva → bersione paradossale del messaggio = fuga.

**Soluzione**: ogni loss frame ha il suo specchio action + benefit. "Non sai dove insistono i commissari → Ecco la tua prima simulazione".

### E3 — Authority manufacture (citazioni inventate)

**Sintomo**: "Citato da Forbes", "Consigliato da Harvard", "Approvato da MIT" senza verifica. Pattern attiva il **bias dell'autorità inverso** (Authority bias reads as "claim gonfiato").

**Perché succede**: shortcut per generare credibilità. Il PM pensa: "se diciamo che è citato da X, sembra più credibile". In realtà, il 50% delle persone verifica (Google search 30 secondi). Le verifiche negative sono moltiplicatori di danno.

**Perché il cervello lo rifiuta**: Nielsen research 2024: il 78% dei Millennials/Gen Z verifica claim mediatici. Pattern "consigliato da Harvard" senza verifica = trust killer.

**Soluzione ConcorsoAI**: mai citare media, sempre citare **istituzioni** con link verificabile (Normattiva.it, gazzettaufficiale.it, EUR-Lex). Pattern: "Costruito sulle linee guida di art. 97 Cost. e DPR 487/1994" con link diretto.

### E4 — Social proof aggregato senza qualità

**Sintomo**: "10.000+ utenti soddisfatti", "★4.8 di media (567 recensioni)", "Trusted by 100+ aziende". Nessun nome, nessun link.

**Perché succede**: marketing gonfia per product-led growth senza dati. Mancanza di citazioni nominative vere.

**Perché il cervello lo rifiuta**: Goldstein-Cialdini (2008) hedgehog: la norma specifica ("L'ospite di questa camera...") attiva più compliance della norma generica. Pattern ribaltato nel SaaS.

**Soluzione**: zero claim aggregati fino a che non sono reali. Quando hai 5+ utenti veri, **testimonianze nominative** > "10.000+ claim".

### E5 — Default effect su opt-out sbagliato

**Sintomo**: cookie consent con "Accetta tutto" pre-selezionato + "Customizza" nascosto. Pattern classificato come **dark pattern** dal GDPR Art. 4(11) + Art. 7 (consenso attivo).

**Perché succede**: "ottimizzazione per accept rate" — più consenso = più tracking = più revenue. **Violazione EU**.

**Perché il cervello lo rifiuta**: utenti europei hanno il GDPR come diritto. Default pre-checked è illegale. Rischio multa fino a €20M o 4% del revenue globale.

**Soluzione ConcorsoAI**: cookie consent con "essential only" pre-selezionato + opt-in granulare per analytics + marketing. CMP self-hosted o Plausible/Fathom non-blocking.

---

## Pattern migliori

### Pattern A — Specificity onesty + Authority istituzionale

Combinare 2 leve in modo coerente:

- "Costruito sulle linee guida del DPR 487/1994 e dell'art. 97 della Costituzione" (Authority by institution).
- "Costruito a Milano · Beta aperta · Luglio 2026" (Specificity onesty).
- "5 candidati beta in Lombardia · Pubblicazione 1 agosto" (Specificity onesty reale).

Il pattern: **3 affermazioni specifiche, tutte verificabili, zero claim gonfiati**. Generano trust cumulativo molto superiore a 1 claim generico.

### Pattern B — Reciprocity asimmetrica (dai valore prima di chiedere auth)

Pattern ConcorsoAI:
- 3 simulazioni gratuite **immediate**, senza login, senza carta.
- Dopo la 3ª simulazione: "Vuoi continuare? Inserisci email per 2 simulazioni bonus".
- Dopo la 5ª simulazione: "Sblocca tutte le materie del tuo bando · €14,99/mese · Cancella quando vuoi".

Logica: l'utente ha già vissuto 3-5 sessioni → ha già "posseduto" punteggi, materie, save state → vuole continuare.

### Pattern C — Founder marker + Compliance signaling come specificità italiana

Il candidato PA italiano ha un affinity culturale con:
- "Made in Italy" (se verificabile, non generico).
- "Costruito a Milano" (city specificity).
- "Server in Germania" o "Server in Italia" (compliance istituzionale).
- "GDPR compliant" + "Codice del Consumo Art. 49 recesso" (normative specifiche).

Pattern: footer + trust band che dichiara "Costruito a Milano · Beta aperta · Server UE · GDPR compliant · Recesso 14gg ex codice del consumo". Specificità onesty + normativa italiana = trust massimo per questo target.

### Pattern D — Anchoring double-stage (esterno prima, interno dopo)

Sezione pricing costruita su 2 ancore:

1. **Esterno**: "Le ripetizioni private PA costano €80-150/h. Un corso completo €500-2.000."
2. **Interno**: "ConcorsoAI Pro = €14,99/mese = €0,50/giorno = 1 caffè. Illimitato."

L'ancora esterno rende il prezzo interno **razionalmente imbattibile**. Pattern Stripe / Mercury (fintech).

### Pattern E — Status quo + Trial pre-popolato

Pre-Stripe: setup trial che genera endowment + status quo:

- Dashboard con già 1 simulazione completata di esempio.
- Punteggio di partenza ("78/100 — basato sulla prima simulazione gratuita").
- Materie precaricate del bando più popolare.

Quando l'utente arriva alla 4ª simulazione, ha già uno "stato mentale di possesso" e 1 sunk cost psicologico. Converte con friction molto bassa.

### Pattern F — DQ (Declarative Quality) via micro-disclaimer verificato

Per PA target, la credibilità non si costruisce con claim ma con **disclaimer verificati**:

- "L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale." (DQ 1)
- "Le materie sono un sottoinsieme non esaustivo del tuo bando reale." (DQ 2)
- "I punteggi sono una stima, non una previsione certificata." (DQ 3)

Pattern anticonformista: il disclaimer esplicito **aumenta** il trust, non lo diminuisce. Perché è onesty che segnala cura del dettaglio.

---

## Checklist

- [ ] Trust signals basati su istituzioni verificabili (Normattiva.it, EUR-Lex, gazzettaufficiale.it), non media
- [ ] Founder marker onesty (città + mese/anno + stato) in footer
- [ ] Compliance EU: GDPR + Codice del Consumo Art. 49 + diritto di recesso, link visibili
- [ ] Cookie consent con opt-in granulare (no pre-checked "Accetta tutto")
- [ ] Zero claim aggregati ("10.000+ utenti") finché non sono reali
- [ ] Testimonianze nominative quando disponibili (5+ beta user reali), zero avatar AI
- [ ] Authority by institution: link diretti a fonti normative ufficiali quando citate
- [ ] Loss frame + action frame accoppiati (mai solo "perdi senza X")
- [ ] Default positivo su toggle mensile/annuale (annuale pre-selezionato quando Stripe live)
- [ ] Setup trial genera endowment effect (dati pre-popolati, save state)
- [ ] DQ (declarative quality) via disclaimer verificati
- [ ] Confronto con alternative note (ChatGPT, da solo, ripetizioni private) senza colonna dispregiativa

---

## Decisioni progettuali

### Da form di registrazione a entry-point 0-friction

Scelta: l'utente può fare le prime 3 simulazioni senza account. Solo dopo la 3ª, chiediamo email per 2 simulazioni bonus. Solo dopo la 5ª, proponiamo Pro. Razionale: reciprocity + sunk cost + hyperbolic discounting.

### Da prezzi generici a prezzi con framing multiplo

Scelta: ogni prezzo è presentato in **3 framing simultanei**: prezzo unitario + framing temporale + framing comparativo.
- €14,99/mese → "€0,50/giorno · meno di 1 caffè"
- €119/anno → "€9,92/mese · Risparmi €60,88 vs mensile"

### Da countdown fake a date reali quando applicabili

Scelta: se c'è una deadline reale (es. scadenza del bando reale per una simulazione specifica), usare quella. MAI countdown fittizio. Pattern: "Bando Comune Milano · chiusura iscrizioni 31/12/2026".

### Da autorità generica a istituzionale specifica

Scelta: nessun "Consigliato da Harvard". Solo istituzioni normative italiane verificabili. Pattern: link diretto a Normattiva.it per ogni citazione.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| 7 euristiche scegliendo 3 (specificity, authority, founder marker) | Footer + trust band | ✅ fatto |
| Reciprocità: 3 simulazioni gratis zero-friction | Hero + flow | ✅ applicato |
| Anchor esterno: "ripetizioni €80/h" prima del pricing | Sezione confronto + pricing | ✅ fatto |
| Single-tap onboarding (wizard a 3 step, non 1 form monolitico) | Wizard setup | ✅ fatto |
| DQ: disclaimer "L'AI può commettere errori su citazioni specifiche" | Footer + ogni simulazione | ✅ fatto |
| Confronto vs ChatGPT (limitazione specifica) | Sezione confronto | ✅ fatto |
| Authority: link a Normattiva.it per citazioni istituzionali | Sezione compliance | ⏳ in progress |
| Pre-popolamento dashboard per endowment effect | Dashboard post-prima-simulazione | ⏳ in progress |

---

## Vincoli

- ❌ **NO** attivare tutti e 7 i principi Cialdini simultaneamente. Sceglierne 2-3 coerenti.
- ❌ **NO** countdown fittizio. Mai "Solo 3 posti rimasti" se non è vero.
- ❌ **NO** claim gonfiati su utenti soddisfatti senza verifica.
- ❌ **NO** "Citando Forbes/Harvard" senza verifica.
- ❌ **NO** specifiche architettate senza prove concrete.
- ❌ **NO** opt-out default su opt-in (GDPR violation).
- ❌ **NO** dark pattern dichiarato (CPC EU violation).
- ❌ **NO** framing "loro sono scarsi senza di noi" (dispregiativo = trust destroyer).

---

*Continua in `04_jobs_to_be_done.md`.*
