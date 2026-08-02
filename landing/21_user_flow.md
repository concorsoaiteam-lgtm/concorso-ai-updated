# User Flow per Landing Page SaaS

## Introduzione

Lo **user flow** è la sequenza di decisioni che l'utente compie dal momento in cui vede la landing fino al momento in cui clicca (o abbandona). Su una landing page, il flow non è quello classico di un'app (onboarding, settings, ecc.) ma un **flusso persuasivo** dove ogni step deve ridurre un dubbio specifico.

Secondo **Brian Massey (Conversion Sciences)**, ogni landing ha **8 micro-passaggi cognitivi**:
1. Orientation — "Che cos'è?"
2. Evaluation — "È per me?"
3. Trust — "È affidabile?"
4. Comparison — "Meglio di cosa?"
5. Price — "Costa quanto?"
6. Objection — "Funzionerà per me?"
7. Action — "Provo?"
8. Confirmation — "Ho fatto bene?"

Ogni sezione della landing deve rispondere **almeno a uno** di questi micro-passaggi, senza riderli o saltarli. Saltare un passaggio crea un **gap cognitivo** che l'utente riempie con dubbio.

---

## Principi

### 1. Cognitive sequencing

Le sezioni devono seguire l'ordine cognitivo, non l'ordine del product team. Un errore classico: mettere "Features" prima di "Problema". L'utente legge una feature senza sapere perché dovrebbe importargli.

### 2. Friction budget

Ogni interazione costa **cognitivo + motor + decisionale**. Una CTA dietro un modulo costa 4-5 unità. Una CTA diretta costa 1. Il flow deve rimanere entro un **budget totale di 8-10 unità** prima della conversione.

### 3. Micro-yes pattern

Ogni sezione deve chiedere un **micro-sì** (un'affermazione cognitiva semplice), non un impegno. Esempio: invece di "Iscriviti alla newsletter" (impegno), meglio "Scopri come funziona" (affermazione). Ogni micro-sì prepara il sì finale.

### 4. Inverse funnel

Su una landing, il **cono è inverso**: la prima sezione deve essere la **più ampia** (più visitatori), l'ultima la **più stretta** (meno visitatori ma più decisivi). Non è un funnel tradizionale di prodotto.

### 5. Fallback paths

L'utente che abbandona la CTA non è perso. Deve avere **exit paths** naturali: link a /pricing, /contact, /blog. Catturare un email secondario o un segnale di interesse è meglio che perdere l'utente.

### 6. Sequencing ottimizzato per primo momento

I primi 3 secondi decidono la continuazione. Flow deve essere progettato perché lo **scrolling iniziale** sia **ricompensato** con valore immediato.

---

## Evidenze

### Nielsen Norman: User Flow research

- **"The 3-Seconds Rule" (NN/g, 2018)**: gli utenti decidono di continuare a leggere entro **3-5 secondi** dal primo paint. La prima scan copre headline, immagine hero, CTA.
- **"First 20 Seconds" (NN/g, 2013)**: gli utenti decidono di cliccare entro **20 secondi** se la pagina è ben progettata, altrimenti abbandonano.
- **"Reading on the Web" (Nielsen 2008)**: utenti esperti scrollano rapidamente verso **anchor points** che sembrano informativi; la flow deve mettere i "value moments" dove il pattern visivo li intercetta.

### Krug: Don't Make Me Think

- **Steve Krug** (Don't Make Me Think, 2000, 2014): ogni click che richiede "pensare" è una **fuga**. Click intuitivi = nav minimizzata, label chiari, primary action visibile.
- **3-click rule**: qualsiasi sezione importante deve essere raggiungibile entro 3 click (per landing, anche 1 click).

### Cialdini: Commitment and Consistency

- **Robert Cialdini** (Influence, 1984/2006): l'utente che ha già fatto un **piccolo impegno** (anche solo letto 3 sezioni, scrollato fino a pricing) è più propenso a fare l'impegno finale. Il flow deve **costruire commitment incrementale**.

### Fogg: Behavior Model

- **BJ Fogg (Stanford)**: B = MAP (Behavior = Motivation + Ability + Prompt). Il flow deve massimizzare **Ability** (ridurre attrito) e **Prompt** (CTA evidenti).
- "Hot triggers" funzionano quando Motivation è alta; "Facilitators" funzionano quando Ability è bassa. Su una landing, Ability è la leva principale.

### Thaler & Sunstein: Choice Architecture

- **Richard Thaler, Cass Sunstein (Nudge, 2008)**: l'architettura delle scelte influenza le decisioni. Il flow deve **impostare le scelte** in modo che la decisione naturale sia quella desiderata.
- **Default effect**: rendere la free trial il default aumenta signup del **20-30%** (Madrian & Shea, 2001, 401(k) study).

### Google HEART framework

- **Google Research (HEART framework, Rodden et al. 2010)**: Happiness, Engagement, Adoption, Retention, Task success. Una landing ha 1 dimensione: **Adoption**. Tutte le altre sezioni servono la Adoption.

---

## Errori comuni

### 1. Features-first flow

❌ **Cosa fanno**: Hero → Features (8 colonne) → Testimonials → Pricing.
✅ **Perché è sbagliato**: l'utente vede feature **prima di capire il problema**. Genera "*cool, ma per me?*".
**Pattern corretto**: Problema → Soluzione → Feature come evidenza → Prova → CTA.

### 2. Pricing a metà pagina senza transizione

❌ **Cosa fanno**: dopo 4 sezioni features, **improvvisamente** Pricing.
✅ **Perché è sbagliato**: lo user deve fare un **reset cognitivo**. Pensa "*devo decidere*" invece di "*devo capire*".
**Pattern corretto**: sezione di transizione che prepara il prezzo ("E quanto costa?", "Quali piani abbiamo?", ecc.).

### 3. CTA competing flows

❌ **Cosa fanno**: 2 CTA "Sign up" + 1 CTA "Contattaci" + 1 CTA "Scarica PDF" nella stessa pagina.
✅ **Perché è sbagliato**: l'utente non sa **quale è la primary**. Dilata il tempo decisionale.
**Pattern corretto**: 1 primary CTA per sezione, 1 primary CTA globale (sticky).

### 4. Dead-end dopo CTA

❌ **Cosa fannno**: dopo il click sulla CTA, l'utente atterra su una pagina generica.
✅ **Perché è sbagliato**: **conversion dropoff** di 30-50% (Unbounce Conversion Benchmark Report). L'utente ha appena fatto il commitment massimo, e la pagina post-click glielo fa perdere.
**Pattern corretto**: post-click page coerente con la landing: stessa UI, stesso copy concept, form minimo (3-5 campi).

### 5. Nessuna uscita chiara

❌ **Cosa fanno**: solo CTA, nessun link a info secondarie.
✅ **Perché è sbagliato**: l'utente curioso ma non-deciso **abbandona del tutto**.
**Pattern corretto**: link testuali a /pricing, /contact, /blog nel footer o in nav. Non è una "rinuncia" tecnica, è un'architettura del dubbio che **trattiene** l'utente.

### 6. Auto-play video hero

❌ **Cosa fanno**: hero è un video auto-play con audio.
✅ **Perché è sbagliato**: viola Baymard (auto-play video increases bounce 23%); consuma banda mobile (Google Web Vitals negative).
**Pattern corretto**: video opzionale con play su click, thumbnail statica di qualità, **no audio**.

### 7. Modulo con 11 campi

❌ **Cosa fanno**: form di signup con nome, cognome, email, telefono, posizione, ecc.
✅ **Perché è sbagliato**: **Baymard Form Usability Research (2023)**: ogni campo aumenta abbandono del **+10%**. 11 campi = -110%.
**Pattern corretto**: form minimo — solo email, o email + nome, **massimo 3 campi**. Profilazione in onboarding post-signup.

### 8. CTA "Invia" senza label umana

❌ **Cosa fannno**: bottone submit dice solo "Submit".
✅ **Perché è sbagliato**: viola Reinhart "Submit" study (no commit signal).
**Pattern corretto**: "Inizia gratis", "Crea il mio account", "Comincia ora" — verbo + promessa.

---

## Pattern migliori

### Pattern 1: Linear Optimal Flow

```
Hero (3 sec) → stabilisce la proposition
↓
How it works (10 sec) → riduce complexity
↓
Use cases / Social proof (15 sec) → genera fiducia
↓
Pricing (20 sec) → abilita decisione
↓
FAQ (10 sec) → chiude obiezioni
↓
CTA finale (5 sec) → commitment
```

Ogni step ha un **tempo medio** che l'utente gli dedica. La somma è 60-90 secondi. Per visitatori con attenzione alta (returning utenti, referrals diretti), il flow si comprime a 30-40 secondi grazie a scroll-spy.

**Esempio**: Linear.app, Vercel.com, Stripe.com (pre-radar 2020).

### Pattern 2: Activated Scroll Pattern

Hero CTA → Scroll triggered engagement → Sidemenu CTA sempre disponibile.

L'utente che scrolla vede **CTA laterali** (sticky) che lo seguono. L'utente che vuole uscire ha un bottone "Go to login" sempre raggiungibile.

**Esempio**: lo usava Stripe Atlas (CTA laterale destra "Start now"). Lo usa Basecamp (sticky "Try it free").

### Pattern 3: Trust Flow embedded

```
Pricing
↓
"Trusted by 12.000 teams" piccolo + 6-9 loghi
↓
"4.8/5 average" con link a recensioni verificabili
↓
"It only takes 90 seconds to start"
```

Trust **integrato** nel flow, non una sezione separata che l'utente può saltare.

**Esempio**: Slack (storica), Notion (current), Linear (current).

### Pattern 4: Objection Closer Flow

```
Pricing presentato
↓
Sezione FAQ che chiude 4-5 obiezioni vere
↓
CTA finale che ricomincia
```

Le obiezioni più frequenti:
1. "Costa troppo?" → risposta con TCO comparison
2. "Funziona per me?" → caso d'uso simile
3. "È difficile?" → "90 secondi per iniziare"
4. "Dov'è la prova?" → loghi o estratto recensione
5. "Posso cancellare?" → "Cancella in 1 click, nessun commitment"

**Esempio**: lo usa Stripe.com, Shopify, Notion.

### Pattern 5: Reduced Flow per Returning Visitor

Per utenti che tornano (via word-of-mouth o referral), il flow deve avere un **accelerator**: una sezione "Start now" che salta direttamente alla CTA con form pre-convalidato.

**Pattern**: riconosci utente via cookie/URL param → mostra CTA short-form → riduci il flow a 3 step.

---

## Checklist

- [ ] Ogni sezione risponde a un micro-passaggio cognitivo
- [ ] Friction budget totale ≤ 10 unità
- [ ] Single primary CTA globale
- [ ] Single primary post-click destination
- [ ] Exit paths puliti presenti
- [ ] No auto-play video hero
- [ ] Form max 3 campi
- [ ] CTA labels umane (verb + promise)
- [ ] 8 micro-passaggi coperti (anche implicitamente)
- [ ] Trust progressively built, non come sezione isolata
- [ ] FAQ addresses 4-5 obiezioni reali
- [ ] Returning visitor accelerator presente (anche solo via URL param)

---

## Decisioni progettuali

### Decisione 1: Section ordering narrativo

**Scelta**: Problema → Soluzione → Come funziona → Cosa include → Prova → Pricing → FAQ → CTA finale.
**Motivazione**: ogni sezione chiude un dubbio prima di aprire il successivo. Il flow è una **conversazione**, non un elenco prodotto.

### Decisione 2: Trust progressivo, non sezione isolata

**Scelta**: loghi, micro-testi, micro-disclaimer sparsi nelle sezioni, NON una sezione "Trusted by" monopolitica.
**Motivazione**: una sezione "Trusted by" gigante su una landing di nicchia è **segnale di AI-slop** endemico; il trust reale è built nella texture della pagina.

### Decisione 3: Single primary CTA globale ("Inizia gratis")

**Scelta**: CTA globale sticky = "Inizia gratis" emerald button.
**Motivazione**: Iyengar + Thaler default effect: 1 opzione chiara = massimo signup.

### Decisione 4: Form post-click = 2 campi

**Scelta**: post-click form = solo email (max nome opzionale). Profilazione in onboarding.
**Motivazione**: Baymard -10% per campo. 11 campi = landing di casino online, non SaaS serale.

### Decisione 5: FAQ section con 4-5 obiezioni vere

**Scelta**: FAQ integrata che chiude:
- "Funziona senza internet?"
- "Quante domande ha la banca?"
- "Posso provare gratis?"
- "Come funziona il rinnovo?"
- "È per il mio concorso specifico?"
**Motivazione**: il concorrente italiano **vuole rassicurazioni specifiche**, non generic talks.

### Decisione 6: Exit paths chiari nel footer

**Scelta**: footer con link a /privacy, /terms, /contatti, /blog. Niente "Sign up competition".
**Motivazione**: uscita pulita = trust retention = referrer.

---

## Applicazione a ConcorsoAI

### Flow proposto

```
HERO       — Headline "Smetti di studiare a caso" + Sub + CTA
PROBLEMA   — "Studiare 600 pagine di un bando è inutile se non sai cosa chiederanno"
SOLUZIONE  — "Una banca di 12.000+ domande reali, raggruppate per materia e tipologia"
COME       — 3 step: Scopri cosa studiare → Fai simulazione → Ricevi feedback mirato
COSA INCLUDE — Quiz mirati + Spiegazioni + Banca aggiornata
PROVA/REPUTATION  — micro-stat solo se vera (es. "12.000+ domande"), niente invenzione
PRICING    — Free + Premium (1 mese gratis)
FAQ        — 4-5 obiezioni vere
CTA FINALE — "Inizia gratis, 1 minuto per cominciare"
```

### Micro-passaggi coperti

| Sezione | Micro-passaggio |
|---------|-----------------|
| HERO | Orientation |
| PROBLEMA | Evaluation trigger |
| SOLUZIONE | Evaluation answer |
| COME | Ability (BJ Fogg) |
| COSA INCLUDE | Clarity on what's inside |
| PROVA | Trust |
| PRICING | Comparison |
| FAQ | Objection closer |
| CTA FINALE | Action + Confirmation |

### Post-click destination

Pagina signup con:
- Stesso design della landing (coerenza)
- Form 2 campi: email + (opzionale) nome
- Submit = "Crea account"
- Dopo signup: onboarding 3-step in-app (NON sulla landing)

---

## Vincoli

❌ NON fare:

- Video auto-play hero
- Modulo 11 campi
- 2 CTA primary nella stessa pagina
- Tab che cambiano CTA
- "Contattaci per prezzi"
- CTA nascosta dietro scroll fino al fondo
- Popup modale dopo 3 secondi
- Autoplay audio
- Survey pre-signup

✅ Fare:

- CTA sempre accessibile
- 1 sola CTA primaria per sezione
- Form minimo
- Trust progressivo e embedded
- FAQ chiusura obiezioni vere
- Exit paths puliti

---

## Takeaway pratici

1. Ogni sezione chiude **un dubbio** prima di aprire il successivo.
2. Friction budget: max 8-10 unità cognitive prima del click.
3. Micro-yes pattern: chiedi affermazioni, non commitment.
4. Single primary CTA globale.
5. Post-click page coerente con la landing.
6. Exit paths puliti = retention + trust.
7. NO auto-play video, audio, popup aggressivi.
8. Form minimo (2 campi, max 3).
9. Verbo + promessa nella CTA, mai solo "Submit".
10. Trust progressivo embedded, non separato.
