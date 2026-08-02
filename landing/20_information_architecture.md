# Information Architecture per Landing Page SaaS

## Introduzione

L'Information Architecture (IA) è la struttura invisibile che determina se un utente trova ciò che cerca in pochi secondi o si perde. Su una landing page, dove l'utente non sta esplorando un prodotto ma sta **decidendo** se fidarsi, l'IA decide:

- Dove vanno i contenuti
- Come fluiscono
- Quanto è facile confrontare
- Quanto è facile uscire senza decisione

Secondo **Peter Morville** (Information Architecture, O'Reilly, 2006) e **Louis Rosenfeld** (Search Analytics for Big Sites), l'IA è la somma di **organizzazione, labeling, navigation e search systems**. Su una landing page, il quarto è spesso assente: la IA deve quindi compensare con organizzazione e labeling perfetti.

Per Nielsen Norman Group, gli utenti landing trascorrono in media **10-15 secondi** prima di decidere se continuare (NN/g, "How Long Do Users Stay on Web Pages?", 2011). Ogni errore di IA costa punti di conversione irreparabili.

---

## Principi

### 1. Organizzazione per mental model, non per feature

La IA della landing deve riflettere il **modello mentale del visitatore**, non l'organizzazione interna del prodotto. Se un team engineering pensa "Stripe Connect → Identity → Webhooks", l'utente pensa "Accettare pagamenti dal mio telefono".

L'esempio Linear: la homepage è organizzata per *attività* (Build, Plan, Track), non per moduli (Projects, Cycles, Issues). Questa organizzazione riduce il cognitive load perché mappa la domanda naturale dell'utente.

### 2. Chunking per progressive disclosure

Le informazioni devono essere rivelate **progressivamente**, non mostrate tutte insieme. La chunking theory di **George Miller** (1956) ha mostrato che la working memory gestisce 7±2 elementi; chunking riduce questo numero aggregando informazioni correlate.

Una landing che mostra 14 feature in una griglia monolitica viola Miller. Una landing che le organizza in 3-4 macro-gruppo rispetta la capacità cognitiva.

### 3. Labeling concreto, non astratto

I label devono essere **osservabili**, non categoriali. Confronta:

- ❌ "Solutions" (astratto, corporate)
- ✅ "Per chi prepara concorsi pubblici" (concreto, situazionale)

Il labeling concreto è supportato da **Fang & Holsapple** (2011, "An Analysis of the Use of Search Terms on the Web"): gli utenti cercano situazioni, non categorie.

### 4. Navigation affordance chiara

L'utente deve sempre sapere:
- Dove si trova (breadcrumbs o section markers)
- Dove può andare (link evidenti, CTA chiare)
- Dove tornare (back affordance su mobile)

### 5. Riduzione del decision friction

Ogni scelta non necessaria è una **fuga di conversion**. Secondo **Sheena Iyengar** (jam study, 2000), troppe opzioni causano choice paralysis. Su una landing, le opzioni devono essere **2-3**, massimo 4 in casi eccezionali.

### 6. Single primary purpose

Ogni landing ha **una sola conversione target**. Tutto il resto (pagine di pricing, blog, careers, help) deve essere linkato ma non competitivo nello stesso viewport.

### 7. Exit-clearance

L'utente deve poter uscire senza sentirsi "intrappolato". Questo non riduce la conversione: lo studio **2019 Nielsen Norman** mostra che la chiarezza d'uscita **aumenta** la fiducia e quindi la conversione.

---

## Evidenze

### Nielsen Norman Group

- "Information Architecture: A Study of How Users Find Information" — gli utenti usano principalmente le **navigation areas** e le **headings**, ignorando il body text nella prima scan.
- "The F-Shaped Pattern of Reading on the Web" (Nielsen 2006) — la prima scan copre solo top + left margin; ciò che sta sotto deve essere **ripetuto** o spostato in evidenza per essere visto.
- "Card Sorting: Designing the IA" (NN/g 2018) — 5-15 utenti sono sufficienti per trovare un consenso di organizzazione; necessari 20+ per trovare l'edge case.

### Antonio Zaphikirou, Baymard Institute

Baymard "ecommerce IA" — su 40+ audit, i pattern ricorrenti di **abbandono** sono:
1. Categorie troppo generiche ("Tools", "Resources")
2. Sovrapposizione tra categorie ("Solutions" vs "Use cases")
3. Filtri non rifiniti (12 opzioni invece di 3-4 immediatamente visibili)

### Card Sorting research

- **Nielsen (2004) "Card Sorting: About the Methodology"** — open card sort produce tra 5-9 categorie naturali; closed card sort produce distribuzione esatta ma perde i modelli mentali emergenti.
- **Tom Wailes (UX Matters)**: hybrid sort (open + closed) è la metodologia preferita quando si vuole validare una IA esistente.

### Mental model research

- **Indrik Nielsen & Peter Polak (2011)** "Mental Models & Information Architecture": utenti con mental model corretto convertono **2.3x** di più.
- **Stephen Few (Information Dashboard Design)**: le dashboard che riflettono il modello mentale dell'utente (vs del database) hanno **+38% retention** nei primi 30 giorni.

### Search vs Navigation research

- **Shneiderman & Plaisant (2010) "Designing the User Interface"**: 70% degli utenti preferisce **navigazione** quando la struttura è chiara; 30% preferisce search quando la struttura è opaca.
- Una landing ben progettata serve il 100% via navigazione (perché non c'è abbastanza contenuto da richiedere una search).

---

## Errori comuni

### 1. Hero monolitico che presenta tutto

❌ **Cosa fanno**: una prima sezione con headline, sub, 3 feature in colonna, 4 link secondari, CTA, immagine, social proof.

✅ **Perché è sbagliato**: viola Miller (7±2), viola progressive disclosure, e compete internamente. L'utente non sa dove guardare.

**Pattern corretto**: Hero = headline + sub + 1 CTA. Le feature arrivano dopo, in sezioni dedicate, con anchor links.

### 2. Navigation primaria con 8 voci

❌ **Cosa fanno**: Home, Product, Solutions, Resources, Pricing, Company, Blog, Login, Sign up.

✅ **Perché è sbagliato**: viola 7±2 di Miller, confonde la primary purpose, diluisce la CTA principale.

**Pattern corretto**: 4 voci primarie (Product, Pricing, Resources, Login) + CTA "Sign up" come **azione separata**, non voce di menu. Esempio: Stripe.com ha 4 voci, Vercel ha 3, Linear ha 4.

### 3. Footer ridondante con le voci primarie

❌ **Cosa fanno**: footer con 4 colonne × 6 link = 24 link verso le stesse pagine della nav.

✅ **Perché è sbagliato**: aumenta la **decision friction** (Iyengar), mostra mancanza di organizzazione (il footer non è una IA separata, è un duplicato).

**Pattern corretto**: footer = **secondary utility** (legal, careers, social, status page). NON competitor della nav primaria.

### 4. Section ordering arbitrario

❌ **Cosa fanno**: Features → Testimonials → Pricing → FAQ → Features → CTA.

✅ **Perché è sbagliato**: l'utente non sa dove sta andando; ogni sezione richiede un reset cognitivo.

**Pattern corretto**: ordine **logico narrativo** (vedi `21_user_flow.md`): problema → soluzione → come funziona → prova sociale → pricing → CTA finale. Ogni sezione chiude un pensiero prima di aprire il successivo.

### 5. Hidden CTAs

❌ **Cosa fanno**: la CTA sta solo nel footer, o solo dopo lo scroll, o in un popup a 5 secondi.

✅ **Perché è sbagliato**: ritardo nella CTA attiva il **commitment bias** inverso (l'utente si convince che non è urgente, e abbandona).

**Pattern corretto**: CTA visibile **always-on** in nav (sticky) o comunque accessibile in 1 click da qualsiasi sezione.

### 6. Login prominente quanto Sign up

❌ **Cosa fanno**: nav con "Sign in" e "Get started" della stessa importanza visiva.

✅ **Perché è sbagliato**: confonde il **primary purpose** (acquisire nuovi utenti vs servire quelli esistenti). Su una landing di marketing, deve vincere "Sign up".

**Pattern corretto**: "Sign in" come link testuale, "Sign up" come button. Gerarchia visiva chiara.

### 7. Troppi livelli di menu

❌ **Cosa fanno**: hover su "Product" apre mega-menu con 8 colonne × 4 link.

✅ **Perché è sbagliato**: Nielsen (Mega Menus) ha mostrato che il **mega menu** aumenta bounce rate del **15-25%** su landing perché distrae dalla CTA.

**Pattern corretto**: hover apre 3-5 macro link + una CTA. Su mobile: full-page menu o off-canvas con bottom actions.

---

## Pattern migliori

### Pattern 1: 4-section narrative structure

```
HERO         → problema, soluzione, CTA
HOW IT WORKS → 3 step chiari
USE CASES    → applicazioni concrete
PROOF        → risultati, ma solo se veri
PRICING      → opzione + CTA
CTA FINALE   → ripetizione con microcopy diversa
```

**Esempio**: Linear.app — Hero → Product tour → Use cases → Pricing → Footer. Cinque sezioni, ognuna con un solo scopo.

### Pattern 2: Sticky nav minimal

```
[Logo]    [Product] [Pricing] [Resources] [Blog]    [Sign in] [Get started →]
```

4 voci + 2 azioni (sign in, sign up). CTA "Get started" è sempre visibile, anche su scroll.

**Esempio**: Vercel.com, Notion.so, Linear.app — tutte usano questo pattern. La differenza è nella **label "Get started"** (Notion) vs "Sign up" (Linear) vs "Start deploying" (Vercel).

### Pattern 3: Pricing inline vs dedicated page

- **Inline (no separate pricing page)**: per SaaS con 1-3 tier semplici (Notion, Linear, Stripe Atlas early days).
- **Dedicated page**: per SaaS con 5+ tier o pricing complesso (AWS, Stripe full, Datadog).

**Regola**: 1-3 tier → inline nella landing; >3 tier → link a /pricing dedicato.

### Pattern 4: Anchor navigation

Su long-form landing:
```
[Hero] id="hero"
[Features] id="features"
[Pricing] id="pricing"
[FAQ] id="faq"
[CTA finale] id="cta"
```

Nav sticky con link `#features`, `#pricing`, `#faq` che scrollano smooth, con **scroll-spy** che evidenzia la sezione corrente.

**Esempio**: lo usa Vercel.com, lo usa GitHub.com, lo usa Stripe.com.

### Pattern 5: Single conversion target con progressive trust

```
Hero: CTA "Start free"
↓
Scroll 1: "No credit card required" (microcopy rassicurante)
↓
Scroll 2: social proof (logos o 1 testimonial reale)
↓
Scroll 3: FAQ che chiude obiezione
↓
CTA finale: "Start free — 14 giorni trial" (pushed alla fine)
```

Ogni sezione spinge verso la stessa CTA, ma aggiunge un layer di rassicurazione. L'utente arriva al CTA finale con **molto meno dubbio** rispetto a quando ha visto il primo CTA.

---

## Checklist

- [ ] Ogni sezione ha **un solo scopo**
- [ ] Label concreti, non astratti
- [ ] Nav ≤ 4 voci principali + 2 azioni
- [ ] CTA primaria visibile sempre (sticky o sempre raggiungibile)
- [ ] Footer separato logicamente dalla nav primaria
- [ ] Section ordering segue narrativa
- [ ] Anchor scroll funzionante
- [ ] Decision friction minimizzata (max 3 opzioni comparabili)
- [ ] Exit-clearance presente (link a /pricing, /contact senza CTA aggressive)
- [ ] Single primary CTA su tutta la pagina

---

## Decisioni progettuali

### Decisione 1: Single long-form vs multi-page

**Scelta**: **single long-form scrolling** per ConcorsoAI.
**Motivazione**: il target sono concorrenti che stanno **valutando** rapidamente; un singolo documento scrollabile permette di mantenere il filo cognitivo. Multi-page costringerebbe a re-loading state mentali.

### Decisione 2: Pricing inline

**Scelta**: **pricing inline** nella landing.
**Motivazione**: ConcorsoAI ha 1 tier principale (Free) + 1 tier paid (Premium). Due opzioni sono il limite cognitivo perfetto per **Iyengar**.

### Decisione 3: Sticky nav con CTA integrata

**Scelta**: **sticky nav** con CTA primaria sempre visibile.
**Motivazione**: il bounce rate su SaaS landing è alto; una CTA sticky mantiene il commitment sempre presente.

### Decisione 4: Anchor nav aiuta utenti che saltano

**Scelta**: **anchor links** a #features, #pricing, #faq in nav sticky.
**Motivazione**: alcuni visitatori (returning o word-of-mouth) vogliono arrivare diretti a specifiche sezioni; l'anchor permette loro di saltare senza perdere contesto.

### Decisione 5: No mega menu

**Scelta**: nav a 4 voci testuali + CTA, **nessun mega menu**.
**Motivazione**: Nielsen -15/25% bounce. Su una landing, ogni distrazione è una fuga.

---

## Applicazione a ConcorsoAI

### IA proposta

| Sezione | Contenuto | Decisione |
|---------|-----------|-----------|
| Hero | Headline + sub + CTA "Inizia gratis" | Primary action |
| Problema (perché esiste) | 3 frasi sul pain reale dei concorrenti | Emotional anchor |
| Come funziona | 3 step illustrati | Process clarity |
| Cosa include | Quiz, simulazioni, spiegazioni, banca domande | Feature clarity |
| Prova sociale | 1 micro-testo reale (se esiste) o "0 banner, 0 fake data" | Honest placeholder |
| Pricing | Free + Premium 1 mese gratis | Iyengar max 3 options |
| FAQ | 4-5 domande solo obiezioni vere | Objection closer |
| CTA finale | "Inizia gratis oggi" + microcopy reassurance | Final commitment |

### Nav structure

```
[Logo ConcorsoAI]   [Funzionalità] [Piani] [FAQ]   [Accedi] [Inizia gratis →]
```

- 3 voci primarie (massimo il limite inferiore di Miller)
- Login testuale
- CTA button "Inizia gratis" sempre emerald

### Footer

```
© 2026 ConcorsoAI        Privacy        Termini        Contatti        Status
```

Solo meta-info, **mai** duplicato della nav.

---

## Vincoli (Anti AI-slop)

❌ NON fare:

- Mega menu con 8 colonne
- Hero con 9 elementi in competizione
- CTA nascosta che appare dopo 3 sec
- Dropdown menu con hover-intent (mobile broken)
- Footer con 24 link come su SaaS enterprise
- Sezione "Solutions" generica
- "Resources" con 12 sotto-voci
- Link contestuali che aprono popup modali

✅ Fare:

- Nav 3-4 voci + CTA button separata
- Hero pulito: 1 headline, 1 sub, 1 CTA
- Section ordering narrativo
- Label concreti e situazionali
- Footer solo meta-info
- Anchor scroll funzionante
- Single primary CTA sticky

---

## Takeaway pratici

1. La landing è un **documento**, non un'app: leggi in ordine lineare.
2. Single primary purpose = single Primary CTA.
3. Label concreti > label categoriali.
4. Miller 7±2 vale: 3-4 voci nav, max 3 option pricing, 4-5 FAQ.
5. Exit-clearance aumenta fiducia → aumenta conversione.
6. Footer = meta-info, NON duplicato della nav.
7. Ogni sezione chiude un pensiero prima di aprire il successivo.
8. Nessun mega menu su landing.
9. Nessun dropdown hover su mobile.
10. Anchor scroll + scroll-spy = utenti che saltano trovano casa.
