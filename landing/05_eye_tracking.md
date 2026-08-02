# 05 — Eye-tracking e scan pattern della landing

> **Scopo**: applicare i dati eye-tracking consolidati (NN/g, MIT Media Lab, Baymard, Findings Araujo 2021) al design della landing ConcorsoAI. Sequenza: psicologia → decisione → bias → JTBD → qui. L'eye-tracking traduce la psicologia in pattern visivi concreti.

---

## Introduzione

### Perché l'eye-tracking è il traduttore operativo della psicologia

I file 01-04 descrivono come l'utente pensa. L'eye-tracking descrive **dove guarda**. Questa è la traduzione operativa: senza un modello di dove l'occhio va, le leve psicologiche non hanno un punto di applicazione.

Per una landing page, l'eye-tracking classico (Nielsen, Pernice, Moran) ha documentato 3 pattern di scansione:

1. **F-pattern**: pagine dense con prosa. Margine sinistro + intestazioni + fine sezione.
2. **Z-pattern**: pagine brevi con elementi visivi distinti. Hero + footer con elementi fulcro.
3. **Layer-cake**: pagine a schede, ognuna con scan pattern proprio (es. SaaS pricing con tab separati).

Il visitatore NON legge la landing. La scansiona. Il designer deve disporre gli elementi in modo che siano visti anche senza lettura.

Riferimenti: NN/g (Pernice, Nielsen, Moran — 2006-2019); Buscher et al., HCI Eye-Tracking Studies (2008-2012); MIT Media Lab *Crowdsourced Eye-Tracking* (2017-2024); Baymard Institute *Visual Hierarchy* (2018-2024); GSAP team *Scroll-driven Storytelling* (2020-2024).

### Come si applica a ConcorsoAI

La landing ConcorsoAI ha 7 sezioni principali sopra e sotto la fold. La sequenza di scan è Z nella hero + F nelle sezioni successive. Le CTA primarie sono in posizioni Von Restorff (isolate cromaticamente). La scansione completa richiede 30-60 secondi, ma la decisione di abbandono avviene entro 5 secondi.

---

## Principi

### P1 — F-pattern NN/g aggiornato 2019

Il pattern a "F" descritto da Nielsen nel 2006 è stato rivisto nel 2019 (Kara Pernice). Risultato aggiornato:

- **Prima riga orizzontale**: scansione ampia, copertura ~80% della larghezza viewport.
- **Seconda riga orizzontale**: scansione ridotta a ~50% della larghezza, margine sx dominante.
- **Verticale sx**: scansione solo colonna sinistra, occasionali "taglio orizzontale" su titoli.

Conseguenza:
- H1 + sub-headline + CTA **devono** stare in colonna sinistra della viewport iniziale (non centrati).
- H2 + H3 di ogni sezione **devono** stare sul margine sx, dove l'occhio li intercetta.
- Liste dense e comparative (es. tier features) **devono** avere align sx, non centrato.

### P2 — Z-pattern nelle hero brevi

Per hero con visual + CTA + testo breve, il pattern è Z (top-left → top-right → middle → bottom-left → bottom-right). Due varianti:

- **Z semplice**: top-left (logo) → top-right (CTA nav) → mid-left (testo) → mid-right (visual) → bottom CTA.
- **Z diagonale**: top-left (H1) → mid-right (mockup) → bottom CTA.

Conseguenza:
- Logo top-left, CTA secondaria top-right (Login/Signup), H1 sub-CTA mid-left, mockup mid-right, CTA primaria bottom-center o bottom-right.

### P3 — Von Restorff / Isolation Effect (1933)

Tra elementi simili, quello che differisce cromaticamente o dimensionalmente è ricordato di più. Boost misurato: fino a +70% richiamo. Pattern operativo:

- CTA primaria = unico elemento **brillantemente colorato** nella viewport iniziale.
- Hero number ("3 simulazioni gratis") = unico numero grande della sezione.
- Badge "Consigliato" su tier centrale pricing = unico badge colorato della section.

Conseguenza: niente "tutti gli elementi sono importanti". La CTA primaria è isolata.

### P4 — Recency + Primacy (Ebbinghaus 1913 curva a U)

Items in posizione iniziale + finale di una sequenza sono ricordati meglio di quelli centrali. Implementing:

- **Primacy**: hero deve contenere i messaggi più importanti (H1, JTBD, CTA).
- **Recency**: footer (ultimo impatto mnemonico) deve contenere informazioni-chiave: founder marker, compliance, contatti.

Conseguenza: la sezione centrale (features, confronto) può essere più "respirazione" — il pattern mnemonico la ignora parzialmente. Concentrare il peso comunicativo in head + tail.

### P5 — Gaze plot sequencing (MIT Media Lab)

L'occhio umano compie **saccadi** (movimenti rapidi) intervallate da **fixation** (pause durante le quali la visione è nitida). Saccadi durano 30-80ms; fixation 200-300ms. L'utente NON vede durante i saccadi: cattura la visione solo in fixazioni ~250ms.

Conseguenza per il design:
- Elemento visibile durante una fixation di 250ms deve essere **comprensibile** in quel tempo.
- Sweep visivo di 6-8 fixazioni = 1.5-2.5 secondi = decisione di engagement.
- Mockup con dettagli fini NON viene letto: solo le sue parti isolate.

### P6 — Mobili UX eye-tracking (smartphone context)

Su mobile (≤768px), la scansione è **verticale + thumb zone**:
- Top quarter: scan denso (logo, hero H1).
- Mid screen: scan ridotto.
- Bottom quarter + thumb-reachable zone (1/3 basso): scan finale + click-target.

Consenguenza specifica per mobile (cfr. file 18):
- CTA primaria mobile in bottom-sticky (thumb-reachable).
- Trust badges in mid-screen.
- Hero H1 sub-CTA in top-quarter.

### P7 — Hotspot pattern (Geographic scan)

Pagine con visual + elementi UI sono scansionate come **mappe geografiche**: 4 quadranti + centro. Il primo sguardo va a un quadrante (dominante: top-left + top-right). Il secondo a un altro. Centro è spesso ignorato al primo scan.

Consenguenza: posizionare CTA nei quadranti + magari spostare elementi "anti-center" dove l'occhio arriva tardi.

### P8 — Selective attention & Banner Blindness

Quando l'utente percepisce la pagina come "piena", attiva **banner blindness**: filtra inconsciamente gli elementi che assomigliano a "pubblicità" (banner, badge generici, claim superlativi).

Consenguenza anti-AI-slop:
- Trust badge "Cifratura UE + GDPR" > badge pubblicitario gonfiato.
- Testimonianza nominativa ("Marco V., Ragioneria 2025") > "1000+ utenti soddisfatti".
- Citazione normativa con link > "Consigliato dagli esperti".

---

## Evidenze

### Nielsen, Pernice (2019) — F-pattern aggiornato

- Studio longitudinale N=300+ su scan pattern web. Aggiornamento metodologia 2019.
- Risultato chiave: il pattern non è "a F" pura. È una variabile "spider + F" che dipende dal contenuto. Pagine dense con prosa → F. Pagine lunghe con scrollytelling → spider.
- Fonte: nngroup.com/articles/f-shaped-pattern-reading-web-content/

### Moran (2018) — *Scrolling and Attention*

- Eye-tracking + meta-analisi. Risultato chiave: l'attenzione sotto la fold è ancora presente. Scroll è ammesso, anzi ricercato. Ma la decisione di restare avviene entro 5s sulla fold.
- Fonte: nngroup.com/articles/scrolling-and-attention/

### Baymard Institute (2024) — Visual Hierarchy

- 44 e-commerce UX heuristics aggiornate. Eye-tracking su N>1000. Risultati chiave:
  - 18% drop carrello se CTA above-the-fold mancante.
  - 14% drop se trust signals non visibili above the fold.
  - 11% drop se prezzo non visibile on first scan of pricing page.
  - Fonte: baymard.com

### Buscher, Dumais, Barreau (2008) — Eye-tracking on Information Foraging

- Studio Microsoft Research su come l'occhio "forages" informazione. Pattern identificato: scan entropy (variabilità del pattern) diminuisce man mano che l'utente trova ciò che cerca.
- Fonte: dl.acm.org (CHI 2008).

### Araujo et al. (2021) — *Tabular data and gaze plot*

- Studio eye-tracking su tabelle comparative. Risultato: la 1ª colonna a sinistra è la dominante, le altre sono confrontate in scan ricorsivi. Pattern di lettura = non lineare, ma ripetitivo.
- Fonte: arxiv.org (eye-tracking + info visualization).

### MIT Media Lab (2014-2020) — WebGazer + crowdsourced eye-tracking

- Crowdsourced eye-tracking con webcam. Risultato: web eye-tracking può essere democratizzato, ma richiede calibrazione per utente. Pattern di scan popolazione: conferma F + Z ma con alta varianza.
- Fonte: webgazer.csail.mit.edu (2016-2018).

### GSAP / Web Animation (2020-2024) — Scroll-driven storytelling

- Animazioni scroll-driven catturano il pattern Z e lo prolungano. Pattern "scroll narrative" può estendere l'engagement a 60+ secondi se le animazioni sono cued correttamente.
- Rilevante per ConcorsoAI: simulazione interattiva nella hero è un "Z-prolungato".

---

## Errori comuni

### E1 — H1 + sub centrati nella hero

**Sintomo**: H1 + sub-headline centrati orizzontalmente nella hero, non allineati a sx.

**Perché succede**: pattern "hero centered" ereditato da template Tailwind UI / Material. Sembra "bilanciato".

**Perché il cervello lo rifiuta**: il pattern F inizia dal margine sx. Centrato = l'occhio non sa dove cadere → nessun "primacy item" identificato → perde la gerarchia.

**Soluzione**: allinea H1 + sub + trust band a sx nella hero. Mockup o visual a destra. Pattern Stripe/Linear/Vercel.

### E2 — CTA primaria senza isolamento cromatico

**Sintomo**: la CTA primaria usa lo stesso blu "accent" di altri 5 elementi (link, hero band, badge, foot, ...). Nessun isolato.

**Perché succede**: il designer vuole coerenza cromatica. Mai elementi che "gridano".

**Perché il cervello lo rifiuta**: Von Restorff richiede uno solo elemento brillantemente colorato. Se 5 elementi hanno lo stesso colore brillante, l'isolamento scompare → la CTA perde prominence.

**Soluzione**: la CTA primaria usa un colore **brillante** (#2563EB + saturazione 80%+). Tutti gli altri elementi usano la palette neutra. Trust badges in sfondo chiaro, link in text-color, ecc.

### E3 — Troppa densità nella hero

**Sintomo**: hero con H1 + sub + 2 CTA + 4 trust badges + 1 badge "Beta aperta" + 3 micro-disclaimers + mockup + brand marker. Tutto in 800px di scroll.

**Perché succede**: copy + design tentano di "mettere tutto in hero".

**Perché il cervello lo rifiuta**: working memory 4±1 (vedi file 01 §P2). Più di 4 unità informative = cognitive load → abbandono.

**Soluzione**: 4 elementi hero massimo: H1, sub-headline, CTA, trust band. Mockup in posizione secondaria (anche se visivamente dominante, occupa "spazio visivo" non "unità informativa").

### E4 — Visual artwork senza focal point

**Sintomo**: visual hero con molteplici elementi (mockup + chat + avatar + timer + waves + dots). Nessun "focal point" per l'occhio.

**Perché succede**: il designer vuole "raccontare tutto" con un'unica immagine.

**Perché il cervello lo rifiuta**: il saccade-plot non sa dove fare la prima fixation. Perde 250-500ms nella "search" → la decisione di engagement ritarda.

**Soluzione**: il mockup hero ha 1 solo "focal point" evidenziato (1 numero grande, 1 chat con underline, 1 timer) e tutto il resto è secondario contestuale.

### E5 — Trust signals distribuiti ovunque

**Sintomo**: trust badges dappertutto. Sotto hero, sotto pricing, sotto footer, in nav, in sticky bar.

**Perché succede**: il designer crede che più visibility = più trust.

**Perché il cervello lo rifiuta**: 5 trust signals identici → banner blindness. L'utente li filtra e li ignora. Nessuno entra in memoria.

**Soluzione**: max 2-3 trust signals in posizioni strategiche: subito sotto la CTA (hero), e in footer. Mai altro.

---

## Pattern migliori

### Pattern A — Hero Z-pattern con focal point mockup

Layout:
- **Top-left**: Logo (sempre presente).
- **Top-right**: Nav links + CTA secondaria (Login/Accedi).
- **Mid-left**: Eyebrow + H1 + sub-headline + trust band + CTA primaria.
- **Mid-right**: Mockup o visual con 1 focal point (number alto, chat aperta, timer running).
- **Bottom**: Prosegue CTA strip (ridondante con CTA hero, mnemonico).

Pattern Z cattura l'occhio in 4 fixazioni:
- Fix 1: logo top-left + nav top-right (250ms).
- Fix 2: H1 mid-left (250ms).
- Fix 3: mockup focal point mid-right (250ms).
- Fix 4: CTA primaria (250ms).

Totale: 1.0-1.5 secondi. Decisione di engagement completata.

### Pattern B — F-pattern nelle sezioni lunghe

Sezioni densamente informative (es. sezione confronto, pricing a 3 tier, FAQ lunga):

- H2 a colonna sinistra (eye-catches).
- Sub-line a colonna sinistra.
- 3-4 sotto-elementi a destra (tabelle, card, FAQ accordion).
- Margine sx è "lettura verticale"; centro è "scan orizzontale".

Per ConcorsoAI pricing 2 tier:
- H2 "Prezzi" sx + sub-line "Scegli il piano più adatto" sx + 2 tier card (Free + Pro) + price anchor + footer info.

### Pattern C — Von Restorff application multiplo

3 diversi livelli di Von Restorff nella stessa pagina:

- **Livello 1 (hero)**: CTA primaria brillantemente colorata.
- **Livello 2 (pricing)**: tier centrale con bordo + badge "Consigliato".
- **Livello 3 (FAQ)**: 1 domanda "costa davvero?" con risposta BREVE e onesty in H2 (le altre FAQ hanno risposta lunga).

Pattern: ognuno emerge come "focal point" nel proprio contesto.

### Pattern D — Footer come recency anchor

Footer è l'**ultimo impatto mnemonico**. Deve contenere le 5 informazioni-chiave che l'utente deve ricordare dopo aver lasciato la pagina:

1. Founder marker: "Costruito a Milano · Beta aperta · 2026"
2. Pricing summary: "€14,99/mese · cancellabile quando vuoi"
3. Compliance: "GDPR · Server EU · 30gg rimborsabili"
4. Trust link: "Storia del founder · blog / contatti"
5. FAQ keypoint: "L'AI può commettere errori su citazioni specifiche · verifica sempre sul bando ufficiale"

Pattern: chiude mnemonicamente la sequenza di visita.

### Pattern E — Mockup 3-tab come Z-prolungato

Mockup con 3 tab (Score, Materie, Aree) nella hero = Z-pattern prolungato:
- Init scan: mockup center (250ms fissa).
- Switch tab "Score" → animazione slide-switch → another focal point (250ms).
- Switch tab "Materie" → riepilogo materie → another focal point.
- Switch tab "Aree" → aree da studiare → recency anchor.

Pattern: la micro-narrazione prolunga l'engagement hero da 1s a 4-6s.

---

## Checklist

- [ ] H1 + sub allineati a colonna sinistra (non centrati)
- [ ] CTA primaria = unico elemento brillantemente colorato nella viewport iniziale
- [ ] Mockup con 1 solo focal point (number grande, chat aperta, o timer)
- [ ] Trust band max 3 badge sotto CTA, mai 8
- [ ] Hero ≤4 unità informative (H1 + sub + CTA + trust band)
- [ ] Pricing tier centrale con bordo + badge "Consigliato"
- [ ] FAQ con 1 domanda chiave evidenziata + altre in elenco
- [ ] Footer 4-colonne + founder marker + GDPR + riepilogo pricing
- [ ] Mobile: CTA bottom-sticky (thumb-reachable)
- [ ] Mobile: hero H1 primo elemento top-quarter
- [ ] Mockup 3-tab con animazione slide-switch (Z-prolungato)
- [ ] Trust signals concentrati in 2 posizioni (sotto CTA + footer), non ovunque

---

## Decisioni progettuali

### Da hero centrato a hero Z-pattern sx-allineato

Scelta: abbandonare il pattern "hero centered" template. Il design adotta Z-pattern con H1 + sub allineati a sx. Logo top-left, nav top-right, mockup mid-right.

### Da CTA "blu tra tanti blu" a CTA isolata cromaticamente

Scelta: la CTA primaria usa un colore specifico **solo** nella CTA. Tutto il resto della pagina è neutrale (grey + ink). Il contrasto CTA/background deve essere >8:1 (AAA).

### Da trust signals distribuiti a trust signals strategicamente posizionati

Scelta: 2 soli blocchi trust nella pagina: sotto la CTA in hero, e in footer. 4-3 elementi per blocco (mai 8). Nessun altro trust signals altrove.

### Da mockup statico a mockup 3-tab animato

Scelta: mockup hero con 3 tab che cambiano al click o hover. Animazione slide-switch smooth (CSS @property-based). Pattern Z-prolungato per estendere engagement a 4-6 secondi.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Hero Z-pattern sx-allineato | Hero layout 60/40 sx/mockup | ✅ applicato |
| CTA blu isolata | Solo CTA hero è accent | ✅ applicato |
| Trust band sotto CTA | 3 badge specifici | ✅ applicato |
| Mockup 3-tab animato | Realtime Score, Materie, Aree | ✅ applicato |
| Pricing 2 tier con centrale evidenziato | Quando Stripe: Pro centrale + badge "Consigliato" | ✅ applicato |
| Footer founder marker | "Costruito a Milano · Beta aperta" | ✅ applicato |
| Mobile sticky CTA | CTA bottom su mobile (thumb-reachable) | ✅ applicato |
| Hero ≤4 unità informative | H1 + sub + CTA + trust band | ✅ applicato |

**Gap**: ulteriore ottimizzazione mobile per thumb-zone. Validazione eye-tracking formale (se disponibile budget).

---

## Vincoli

- ❌ **NO** hero centered (template AI-slop).
- ❌ **NO** "tutti gli elementi sono ugualmente importanti" — Von Restorff richiede isolamento.
- ❌ **NO** trust signals distribuiti ovunque — banner blindness.
- ❌ **NO** mockup con 5+ elementi visivi in primo piano — focal point uno solo.
- ❌ **NO** H1 con background-clip gradient (testo semi-trasparente inaccessibile).
- ❌ **NO** animazioni parallasse pesanti su mobile (lag notevole + retention crolla).
- ❌ **NO** fissazione su eye-tracking templates senza adattarli al target PA (il pattern può essere culturalmente diverso).

---

*Continua in `06_visual_hierarchy.md`.*
