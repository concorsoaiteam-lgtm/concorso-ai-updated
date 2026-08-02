# 16 — Conversion patterns cross-industry (oltre i bias individuali)

> **Scopo**: catalogare i pattern di conversione consolidati cross-industry che vanno oltre i singoli bias cognitivi (file 02-03) e che hanno un **ciclo di vita misurabile** sulla landing. Sequenza: copywriting (11), CTA (13), trust (14), social proof (15), conversion patterns qui.

---

## Introduzione

### Perché servono pattern cross-industry, non solo principi singoli

I file 02-03 catalogano i bias cognitivi (reciprocity, scarcity, anchoring, ...). Ma le landing premium del 2025-2026 adottano **pattern compositi** che combinano 3-5 bias in una sequenza narrativa.

Pattern cross-industry consolidati:
- **Sandwich CTA** (vedi pattern A): hero CTA + impact section + pricing CTA + footer CTA = 4-5 istanze same-action.
- **Pricing 3-tier Goldilocks**: tier centrale evidenziato con bordo + badge.
- **Free trial pattern** (zero-friction + reciprocity + commit).
- **Guarantee as risk reversal** (loss aversion + Cialdini reciprocity).
- **Micro-quiz as micro-commitment** (foot-in-the-door + commitment).
- **Tipping question pattern**: "qual è il tuo ruolo?" → customize pricing.

Questi pattern non sono "bias singoli" ma **combinazioni sequenziali** con A/B testing evidence.

Riferimenti: Baymard Institute (2024); Unbounce Conversion Benchmark Report (2025); Optimizely experimentation data; VWO experimentation framework; Sumo, Crazy Egg, Hotjar benchmark; Stripe and Linear public behavioral design.

### Come si applica a ConcorsoAI

ConcorsoAI è pre-Stripe (zero pagamenti). I pattern adottati:
- **Pattern A (Sandwich CTA)**: hero + mid + pricing + footer = 4 CTA repliche.
- **Pattern C (Free trial 0-friction)**: 3 simulazioni gratis senza registrazione = micro-commitment pre-Card.
- **Pattern D (Guarantee as risk reversal)**: "30gg soddisfatti o rimborsati" (quando Stripe Q3 2026).
- **Pattern E (Micro-quiz as micro-commitment)**: 5-materie pill nella hero = commitment cumulativo.
- **Pattern F (Compare vs alternative)**: tabella Noi vs ChatGPT vs Da solo.
- **Pattern G (Authority by Istituzione)**: link Normattiva + DPR 487/1994.
- **Pattern I (Pricing pillar anchored)**: external anchor (€80/h ripetizioni) prima del proprio pricing.

Pattern NON adottati (inappropriati per PA target):
- ❌ Countdown timer finto (CPC EU violation).
- ❌ Finta scarsità ("Only 3 spots left").
- ❌ Pop-up exit-intent (CPC EU violation + premium anti-pattern).
- ❌ Modali automatici (Timer "wait before you leave").
- ❌ Subscription trap (Omnibus EU violation).

---

## Principi

### P1 — Sandwich CTA (replicazione mnemonica)

Pattern: la CTA appare 4-5 volte nella pagina, sempre con **copy identico**, per supportare l'utente che scrolla e dimentica dove fosse la CTA.

ConcorsoAI 4-5 repliche:
1. **Hero** (above-the-fold, primary).
2. **Dopo social proof** (mid-page replica mnemonica).
3. **Pricing tier centrale** (conversion finale).
4. **Footer** (recency anchor).
5. **Mobile sticky** (persistent during scroll).

Pattern: nessuna variazione copy tra istanze. Tutte "Inizia la tua prima simulazione".

### P2 — Pricing 3-tier Goldilocks (post-Stripe)

Pattern: 3 tier (Free / Pro / Master) con tier centrale evidenziata da bordo + badge "Consigliato" + lieve ingrandimento visivo.

ConcorsoAI quando Stripe Q3 2026:
- **Free**: €0 / 3 simulazioni / mese, materie base.
- **Pro [⭐ Consigliato]**: €14,99 / mese, illimitato, materie avanzate, analytics.
- **Master**: €29,99 / mese, Pro + coaching 1-on-1.

Pattern: tier centrale "consigliata" = scelta naturale (Goldilocks / extremeness aversion).

### P3 — Pricing toggle mensal/annual (default annuale)

Pattern: toggle mensile/annuale, default annuale con badge "Risparmi 30%". Pattern Stripe / Notion / Linear / Vercel.

ConcorsoAI post-Stripe:
- Default annuale (badge "+30% saving · 119€/anno").
- Click mensile mensile opzionale.
- JS che switch dei prezzi senza page reload.

Pattern: pre-commit annuale = LTV superiore per il SaaS.

### P4 — Free trial pattern (zero-friction)

Pattern (Rovio / Spotify / Atlassian / Notion):
- Trial senza auth (zero friction).
- Auth richiesto dopo primo valore ottenuto.
- Pagamento richiesto dopo fine trial, o prima se utente vuole estendere.

ConcorsoAI pre-Stripe:
- 3 simulazioni gratis SENZA auth.
- Email richiesto dopo 3a simulazione (per 2 bonus gratuite).
- Pro richiesto dopo 5a simulazione.

Pattern: reciprocity + sunk cost + hyperbolic discounting.

### P5 — Guarantee as risk reversal (loss aversion inverse)

Pattern: la garanzia rimborsabile elimina la paura di perdita. Coeffice λ=1.95 per la paura → senza garanzia, user esita.

ConcorsoAI:
- **Quando Stripe live**: "30 giorni soddisfatti o rimborsati" prominente in pricing.
- **Step pratico**: "Scrivi a supporto@concorsoai.it · Rimborso in 3gg lavorativi".
- **No domande fastidiose**: "Nessun modulo. Nessuna domanda scritta."

Pattern: loss aversion reversa (togli la paura di perdita → aumenta conversion +12-25%).

### P6 — Micro-quiz as micro-commitment (foot-in-the-door)

Pattern: piccoli commitment incrementali prima del commitment pesante.

ConcorsoAI Hero R1 mini-quiz:
- 5 materie pill interattive (click sequenziale).
- Ogni click = micro-commitment.
- Risultato mini-quiz = display di materie specifiche del tuo bando.
- Dopo mini-quiz = CTA "Inizia la tua prima simulazione completa" (commitment peso superiore).

Pattern: foot-in-the-door (Freedman & Fraser 1966) → commitment crescendo → CTA peso maggiore ha acceptance +20%.

### P7 — Compare vs alternative (senza disprezzo)

Pattern: tabella comparativa con limite specifiche alternative, non "loro sono scarsi".

ConcorsoAI:
- **Noi**: materie specifiche del tuo bando, ricorda 5 sessioni precedenti, server EU.
- **ChatGPT**: generalista, non conosce il tuo bando, non ricorda sessioni.
- **Da solo**: studi ma non ti misuri, feedback self-assessment.

Pattern: limitazione specifica = trust. Disprezzo = dark pattern.

### P8 — External anchor + Internal pricing (Ariely)

Pattern: ancorare il prezzo interno a un prezzo esterno noto (riferimento di mercato).

ConcorsoAI pre-Stripe:
- "Le ripetizioni private PA costano €80-150/h" (anchor esterno).
- "ConcorsoAI Pro = €14,99/mese = €0,50/giorno = 1 caffè" (interno).

Pattern: anchor esterno relativo a competitor credibile = riduzione percezione del proprio prezzo.

### P9 — Authority by Istituzione (Cialdini reinforcement)

Pattern: citazioni normative istituzionali creano autorità "per delega".

ConcorsoAI sezione compliance:
- "Costruito sulle linee guida del DPR 487/1994 · art. 97 della Costituzione · L. 241/1990 · D.Lgs. 33/2013"
- Link a Normattiva.it, EUR-Lex, gazzettaufficiale.it.

Pattern: autorità istituzionale riconosciuta = trust superiore.

### P10 — Pricing pillar (3-tier vs single)

Caso speciale: per SaaS nuovi, single pricing è più frequente (start-stage, evita complexity). 3-tier entra quando business matura.

ConcorsoAI Q3 2026 evolution:
- v1.0 (oggi): 1 pricing post-Stripe = €14,99/mese.
- v2.0 (Q4 2026+): 3-tier (Free + Pro + Team) se market richiede segmentazione.

Pattern: non over-engineer pricing early. Single tier + Free limit = sufficiente.

### P11 — Hero "Live" demo (Reciprocity + Show-don't-tell)

Pattern: hero con UI live del prodotto (es. Perplexity search bar, Vercel CLI live).

ConcorsoAI mockup 3-tab:
- Tab 1 "Realtime score" con punteggio live.
- Tab 2 "Materie" con materie reali del bando.
- Tab 3 "Aree basse" con aree di miglioramento.

Pattern: hero "show, don't tell" → user capisce in 5 secondi.

### P12 — Sticky bottom CTA (mobile-only)

Pattern: mobile sticky CTA bottom-thumb-zone, persistent during scroll.

ConcorsoAI mobile sticky:
- Bottom-fixed.
- Full-width.
- Safe-area-inset-bottom iOS.
- Auto-hide su footer (IntersectionObserver).

Pattern: mobile thumb-zone + always-available = +12-22% mobile conversion.

### P13 — Footer recency anchor

Pattern: footer come ultimo impatto mnemonico (recency effect).

ConcorsoAI footer:
- **CTA replica**: "Inizia la tua prima simulazione" (CTA replica).
- **Founder marker**: "Costruito a Milano · Beta aperta Agosto 2026".
- **Compliance link**: Privacy + Cookie + ToS + Recesso.

Pattern: il visitatore ricorda il footer anche se non ha interagito.

### P14 — Trust-band above-CTA (visual)

Pattern: 3 trust badge specifics subito sotto CTA per ridurre "ansia da impegno".

ConcorsoAI trust band:
- "GDPR compliant" + link /privacy
- "Server UE" + link /security#data-residency
- "No data shared with US LLM" + link /architecture

Pattern: 3 specific elements + 3 link = trust-by-detail.

### P15 — Confronto "Noi vs ChatGPT vs Da solo" come micro-quiz

Pattern: tabella comparativa + tono rispettoso + limitazioni specifiche = +trust anche su chi NON sceglie noi.

ConcorsoAI sezione comparativa "Perché ConcorsoAI vs ChatGPT o studiare da solo":
- 3-colonne affiancate.
- 6-12 righe di confronto.
- Nessuna colonna dispregiativa ("loro scarsi"), solo limiti specifici.

Pattern: comparazione rispettosa = trust elevato anche su no-decision.

---

## Evidenze

### Unbounce Conversion Benchmark Report (2025)

- Studio su N=18.639 landing pages, 57M conversioni.
- Risultati chiave:
  - 1 CTA = 13.5% conversion.
  - 2 CTA = 11.9% conversion.
  - 3+ CTA = 10.5% conversion.
  - **3-tier pricing > 4+**, 5+ tier = -30% (decision paralysis).
  - **Trust signals above-fold** = +8-10% conversion.
  - **External anchor pricing** = +15% uptake (vs solo internal pricing).
  - **Footer recap of guarantee** = +12% click-to-rimborso.

### Baymard Institute (2024) — 44 UX Heuristics

- Studio N>1000 checkout reali.
- Risultati rilevanti per landing:
  - 11% drop se CTA primary assente above-fold.
  - 18% drop se CTA payment senza garanzia.
  - 14% drop se trust signals assenti above-fold.
  - 12% drop se hero "medesimo copy paragrafo" (prosa).
  - 8% drop su mobile se sticky CTA assente.

### VWO Experimentation Library (2024)

- A/B test cases cross-vertical:
  - **3-tier pricing** con tier centrale evidenziata: +24% conversion vs 2-tier.
  - **External anchor pricing**: +15% uptake.
  - **Sandwich CTA replicazione**: +5-8% total click.
  - **Free trial senza auth**: +18-22% trial uptake.
  - **Authority by istituzione cite**: +12-18% trust score.

### Optimizely A/B Test Data (2024)

- Pattern confermati cross-industry:
  - **Hero live demo vs statico**: +14% scroll-depth.
  - **Micro-quiz pre-CTA**: +20-25% micro-commitment → main CTA.
  - **Comparison table con limiti specifici**: +12-18% trust.

### Crazy Egg Heat Map Studies (2023)

- Pattern confermati:
  - **CTA replica 4-5 volte**: +6-8% total CTA click (vs 1 sola istanza).
  - **Sotto hero CTA replica**: leggera diminuzione ma mnemonica.
  - **Above-fold trust badge**: +9% sub-CTA dwelltime.

### Sumo + Hotjar Synthesis (2023)

- Pattern mobile-specific:
  - **Mobile sticky bottom**: +15-25% mobile conversion.
  - **Mobile Hero 60/40 split**: +10% scroll-depth vs centered.
  - **Mobile touch target ≥48px**: -8% misclick.

### Stripe public design notes (2018-2024)

- Pattern consolidati:
  - Free tier (no card) = +35% trial uptake.
  - Pricing 3-tier con annual default.
  - Footer recap guarantee.

### Linear public design notes (2020-2024)

- Pattern:
  - Live demo hero.
  - Micro-quiz pre-CTA.
  - Tier centrale "consigliata".
  - Founder marker footer.

### Mercury / Ramp fintech case study (2023-2024)

- Pattern:
  - External anchor (competitor cost vs product cost).
  - Trust band 3 elementi specifici.
  - Founder marker onesty.

---

## Errori comuni

### E1 — CTA replicata con variazione copy

**Sintomo**: CTA hero "Inizia gratis" + CTA mid "Scopri di più" + CTA footer "Get started" (3 copy diverse).

**Perché succede**: copy pensa "variazione = no ridondanza".

**Perché il cervello lo rifiuta**: 3 copy diverse = 3 azioni percepite = confusion.

**Soluzione**: 4-5 CTA copy identico "Inizia la tua prima simulazione".

### E2 — Pricing 5+ tier

**Sintomo**: pricing con Starter / Basic / Plus / Pro / Enterprise / Team / Custom.

**Perché succede**: copy pensa "più opzioni = più conversion".

**Perché il cervello lo rifiuta**: decision paralysis (Iyengar 2000 marmellate 24 vs 6 → 3% vs 30%). 5+ tier = -30% conversion.

**Soluzione**: max 3 tier (Free / Pro / Master) o 2 tier pre-Stripe (Free / Pro).

### E3 — CTA senza garanzia rimborso

**Sintomo**: pricing tier senza "rimborso 30gg" o simili.

**Perché succede**: "non vogliamo sembrare cheap".

**Perché il cervello lo rifiuta**: paura di perdita non rimossa → user esita → bersione -12-25%.

**Soluzione**: garanzia prominente sotto pricing tier. "30 giorni soddisfatti o rimborsati."

### E4 — Countdown fittizio ("Solo 5 posti rimasti")

**Sintomo**: hero con "Solo 5 posti lifetime Pro rimasti! Affrettati!"

**Perché succede**: marketers pensa "scarsità = urgency = conversion boost".

**Perché il cervello lo rifiuta**: CPC EU dark pattern violation + trust erode per utenti esperti.

**Soluzione**: no countdown fittizio. Solo date reali (es. "Coorte Q3 2026 chiude il 31 Ottobre").

### E5 — Pop-up exit-intent

**Sintomo**: popup che appare quando l'utente sta per uscire: "Sei sicuro? Rimani con noi 1 minuto!".

**Perché succede**: marketers pensa "ultima chance per conversion".

**Perché il cervello lo rifiuta**: dark pattern classico. CPC EU violation. Trust erode fortemente.

**Soluzione**: no exit-intent popups. Mai.

### E6 — Modali automatici (time-based)

**Sintomo**: modale "Iscriviti gratis alla newsletter" che appare dopo 15s di scroll.

**Perché succede**: marketers vuole massimizzare lead capture.

**Perché il cervello lo rifiuta**: interruption del flow + dark pattern.

**Soluzione**: no time-based modali. Solo dismiss-able dopo azione utente.

### E7 — Single pricing senza Free tier

**Sintomo**: landing con €14,99/mese senza free trial o freemium.

**Perché succede**: copy "no freemium = no cani randagi".

**Perché il cervello lo rifiuta**: PA target sopra 35 anni diffida di "pay first". L'utente vuole provare → abandon.

**Soluzione**: Free limit (3 simulazioni/mese) + tier Pro.

### E8 — Anchor pricing senza competitor specifico

**Sintomo**: "ConcorsoAI è molto meno caro della concorrenza!" — senza citare competitor.

**Perché succede**: copy pensa "generic claim = sufficiente".

**Perché il cervello lo rifiuta**: claim generic senza competitor reale = trust basso.

**Soluzione**: anchor specifico. "Ripetizioni private PA €80-150/h. ConcorsoAI Pro = €14,99/mese."

### E9 — Authority institution cite senza link

**Sintomo**: "Costruito su DPR 487/1994" senza link a Normattiva.

**Perché succede**: copywriter dimentica linking.

**Perché il cervello lo rifiuta**: claim autorità senza link = claim vuoto (PA target verifica).

**Soluzione**: link diretto Normattiva.it per ogni citazione.

### E10 — Micro-quiz senza risultato chiaro

**Sintomo**: micro-quiz hero 5 materie → utente clicca → nessun feedback visibile → confusion.

**Perché succede**: implementazione semi-fatta.

**Perché il cervello lo rifiuta**: commitment senza reward = abbandono.

**Soluzione**: ogni step del quiz ha feedback visibile (selected state + preview del risultato).

### E11 — Footer recap CTA senza CTA-button (solo link testuale)

**Sintomo**: footer con "Inizia la prima simulazione" come link testuale senza button.

**Perché succede**: designer vuole "minimalism".

**Perché il cervello lo rifiuta**: link testuale + CTA = ambigu. Copy button + CTA button.

**Soluzione**: footer CTA sempre button style (var(--btn-cta)).

### E12 — Tab pricing senza visualizzazione del tier centrale

**Sintomo**: 3 tab affiancati con stesso styling. Nessun "consigliato" evidente.

**Perché succede**: copy neutrale. "Tutti ugualmente importanti."

**Perché il cervello lo rifiuta**: extremeness aversion → utente non sa quale scegliere → decision paralysis.

**Soluzione**: tier centrale sempre con bordo colorato + badge "Consigliato" + slight scale 1.02.

---

## Pattern migliori

### Pattern A — Sandwich CTA (4-5 repliche identity)

Pattern: 4-5 CTA con copy identico in posizioni strategiche:
1. **Hero** (above-fold, primary button).
2. **Mid-page social proof section CTA** (mnemonico).
3. **Pricing tier centrale CTA** (conversion finale).
4. **Footer CTA button** (recency anchor).
5. **Mobile sticky** (persistent during scroll).

Pattern: nessuna variazione copy.

```html
<button class="btn-cta" aria-label="Inizia la tua prima simulazione">
  Inizia la tua prima simulazione
  ...
</button>
```

### Pattern B — Pricing 3-tier Goldilocks

Pattern:
```html
<section class="pricing" aria-label="Pricing">
  <h2>Scegli il piano più adatto</h2>
  <div class="pricing-grid">
    <article class="tier tier-basic">
      <h3>Free</h3>
      <p class="tier-price">€0</p>
      <p class="tier-desc">3 simulazioni/mese · Materie base</p>
      <button class="btn-secondary" aria-label="Inizia gratis">Inizia gratis</button>
    </article>
    <article class="tier tier-recommended">
      <span class="tier-badge">Consigliato</span>
      <h3>Pro Concorsi</h3>
      <p class="tier-price">€14,99<small>/mese</small></p>
      <p class="tier-desc">Illimitato · Materie avanzate · Analytics</p>
      <button class="btn-cta" aria-label="Passa a Pro" data-plan="pro">Passa a Pro</button>
    </article>
    <article class="tier tier-premium">
      <h3>Master PA + Coaching</h3>
      <p class="tier-price">€29,99<small>/mese</small></p>
      <p class="tier-desc">Pro + 4 sessioni coaching/anno</p>
      <button class="btn-secondary" aria-label="Attiva Master">Attiva Master</button>
    </article>
  </div>
  <p class="pricing-meta">30 giorni soddisfatti o rimborsati · Cancella quando vuoi · €0.43/giorno</p>
</section>
```

Pattern: tier centrale evidenziata con bordo + badge + lieve scale 1.02 + bg accent faint.

### Pattern C — Pricing toggle mensal/annual

```html
<div class="pricing-toggle" role="group" aria-label="Toggle prezzi">
  <button type="button" role="button" aria-pressed="false" data-period="monthly">Mensile</button>
  <button type="button" role="button" aria-pressed="true" data-period="yearly" class="active">
    Annuale <span class="badge-savings">Risparmi 30%</span>
  </button>
</div>
```

Pattern: default annuale + JS che switch dei prezzi senza page reload.

### Pattern D — Free trial 0-friction

Pattern (ConcorsoAI pre-Stripe):
```
Step 1: Hero "Inizia la tua prima simulazione" → /simulation?bando=DEMO (zero auth)
Step 2: simulazione completa → "Vuoi salvare i progressi? Inserisci email." (auth light)
Step 3: email inserita → 3a simulazione bonus → "Vuoi continuare oltre 3? Attiva Pro."
```

Pattern: incremental commitment. Ogni step aumenta il sunk cost.

### Pattern E — Guarantee as risk reversal

Pattern (pricing):
```html
<div class="pricing-guarantee" role="region" aria-label="Garanzia">
  <span class="guarantee-icon" aria-hidden="true">✓</span>
  <p class="guarantee-title">30 giorni soddisfatti o rimborsati</p>
  <p class="guarantee-body">Scrivi a <a href="mailto:supporto@concorsoai.it">supporto@concorsoai.it</a>. Rimborso in 3gg lavorativi. Nessuna domanda.</p>
</div>
```

Pattern: prominente sotto pricing. Loss aversion reverse.

### Pattern F — Micro-quiz hero (foot-in-the-door)

Pattern (5 materie pill):
```html
<section class="hero-quiz" role="region" aria-label="Mini quiz materie">
  <p class="quiz-prompt">Quali materie del tuo bando ti preoccupano di più?</p>
  <div class="quiz-options" role="group">
    <button class="quiz-option" data-materia="dir-amministrativo" aria-pressed="false">Diritto Amministrativo</button>
    <button class="quiz-option" data-materia="contabilita" aria-pressed="false">Contabilità di Stato</button>
    <button class="quiz-option" data-materia="penale" aria-pressed="false">Diritto Penale</button>
    <button class="quiz-option" data-materia="costituzione" aria-pressed="false">Diritto Costituzionale</button>
    <button class="quiz-option" data-materia="civile" aria-pressed="false">Diritto Civile</button>
  </div>
  <p class="quiz-result" hidden></p>
  <button class="btn-cta" data-quiz-final>Continua con la tua prima simulazione</button>
</section>
```

Pattern: 5 micro-commitment + reveal del risultato + CTA peso superiore.

### Pattern G — Compare vs alternative (rispetto)

Pattern (sezione comparativa):
```html
<section class="comparison" aria-label="Confronto con alternative">
  <h2>Perché ConcorsoAI vs ChatGPT o studiare da solo</h2>
  <table>
    <thead>
      <tr><th>Cosa conta</th><th>ConcorsoAI</th><th>ChatGPT</th><th>Da solo</th></tr>
    </thead>
    <tbody>
      <tr><td>Materie specifiche del tuo bando</td><td class="check">✓</td><td>—</td><td>—</td></tr>
      <tr><td>Ricorda le tue 5 sessioni</td><td class="check">✓</td><td>—</td><td>—</td></tr>
      <tr><td>Feedback 3 metriche live</td><td class="check">✓</td><td>—</td><td>✓ (self)</td></tr>
      <tr><td>Server EU · GDPR</td><td class="check">✓</td><td>—</td><td>—</td></tr>
      <tr><td>Compliance Normattiva cite</td><td class="check">✓</td><td>—</td><td>—</td></tr>
      <tr><td>Comparazione eseguibile</td><td class="check">✓</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>
  <p class="comparison-dq">L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale.</p>
</section>
```

Pattern: limiti specifici, no disprezzo.

### Pattern H — Pricing external anchor

Pattern (sezione pricing lead-in):
```html
<section class="pricing-anchor" aria-label="Confronto con alternative">
  <p>Le ripetizioni private per concorsi PA costano <strong>€80-150/h</strong>.</p>
  <p>Un corso completo di preparazione costa <strong>€500-2.000</strong>.</p>
  <p>ConcorsoAI Pro = <strong>€14,99/mese</strong> = <strong>€0,50/giorno</strong> = 1 caffè. Illimitato.</p>
</section>
```

Pattern: anchor esterno → prezzo interno → framing temporale.

### Pattern I — Authority by Istituzione (Normattiva link)

Pattern (sezione compliance):
```html
<section class="compliance" aria-label="Compliance istituzionale">
  <h2>Costruito sulle linee guida dei concorsi pubblici italiani</h2>
  <ul class="compliance-citations">
    <li><a href="https://www.normattiva.it/...">art. 97 della Costituzione</a></li>
    <li><a href="https://www.normattiva.it/...">DPR 487/1994</a></li>
    <li><a href="https://www.normattiva.it/...">L. 241/1990</a></li>
    <li><a href="https://www.gazzettaufficiale.it/...">D.Lgs. 33/2013</a></li>
    <li><a href="https://eur-lex.europa.eu/...">EU AI Act 2026</a></li>
  </ul>
  <p class="compliance-dq">L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale.</p>
</section>
```

Pattern: link diretto alle fonti primarie.

### Pattern J — Trust band above-CTA (visual)

Pattern (sotto CTA hero):
```html
<div class="trust-band" role="region" aria-label="Trust signals">
  <a class="trust-badge" href="/privacy">
    <span class="trust-icon" aria-hidden="true">🔒</span>
    <span class="trust-text">GDPR compliant</span>
    <span class="trust-link">Privacy →</span>
  </a>
  <a class="trust-badge" href="/security#data-residency">
    <span class="trust-icon" aria-hidden="true">🌍</span>
    <span class="trust-text">Server in Europa</span>
    <span class="trust-link">Dove sono i dati →</span>
  </a>
  <a class="trust-badge" href="/architecture">
    <span class="trust-icon" aria-hidden="true">🇪🇺</span>
    <span class="trust-text">No data condivisa con LLM USA</span>
    <span class="trust-link">Architettura →</span>
  </a>
</div>
```

Pattern: 3 trust badges specifici + 3 link a doc.

### Pattern K — Mobile sticky auto-hide su footer

Pattern (JS):
```javascript
const observer = new IntersectionObserver((entries) => {
  const stickyCta = document.querySelector('.sticky-mobile-cta');
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.classList.contains('footer')) {
      stickyCta.style.opacity = '0';
      stickyCta.style.pointerEvents = 'none';
    } else {
      stickyCta.style.opacity = '1';
      stickyCta.style.pointerEvents = 'auto';
    }
  });
});
document.querySelectorAll('.footer').forEach(el => observer.observe(el));
```

Pattern: mobile sticky on/off su IntersectionObserver.

### Pattern L — Pricing pillar (single tier pre-Stripe)

Pattern (ConcorsoAI pre-Stripe v1):
```
- Free: €0 / 3 simulazioni/mese
- [Stripe Q3 2026]: Pro €14,99/mese
```

Pattern: single tier iniziale. Tier 3 (Master) entra quando business matura.

---

## Checklist

- [ ] Sandwich CTA: 4-5 repliche con copy identico
- [ ] Pricing 3-tier max (Free / Pro / Master) o 2 tier pre-Stripe
- [ ] Tier centrale evidenziata con bordo + badge + lieve scale 1.02
- [ ] Pricing toggle mensal/annual default annuale (post-Stripe)
- [ ] Free trial zero-friction pre-Stripe
- [ ] Guarantee "30gg soddisfatti" prominente sotto pricing (post-Stripe)
- [ ] Micro-quiz 5 step pre-CTA (hero)
- [ ] Compare vs alternative 1 sola tabella rispettosa
- [ ] Anchor external pricing (ripetizioni €80/h vs €0,50/day)
- [ ] Authority cite con link Normattiva (art. 97 Cost, DPR 487/1994)
- [ ] Trust band 3 elementi sotto CTA hero
- [ ] Mobile sticky bottom + safe-area-inset + auto-hide footer
- [ ] Footer recap CTA button (non solo link testuale)
- [ ] No countdown fittizio (CPC EU compliance)
- [ ] No pop-up exit-intent (CPC EU compliance)
- [ ] No modali time-based (anti-pattern)
- [ ] Single CTA copy (no variazione)

---

## Decisioni progettuali

### Da CTA variation a CTA identity mnemonica

Scelta: 4-5 istanze stesso copy "Inizia la tua prima simulazione". Mai variazione copy.

### Da 5+ tier a 3 tier Goldilocks (post-Stripe)

Scelta: max 3 tier (Free + Pro + Master) o single Pro pre-Stripe. Mai 4+.

### Da Free trial auth a free trial zero-friction

Scelta: 3 simulazioni gratuite senza auth pre-Stripe. Auth richiesto dopo valore ottenuto.

### Da generic guarantee a "30 giorni soddisfatti" prominente

Scelta: garanzia prominente sotto pricing post-Stripe. "Scrivi a supporto@concorsoai.it · Rimborso 3gg."

### Da pop-up exit-intent a no pop-up

Scelta: NO exit-intent pop-up. NO time-based modali. Mai.

### Da countdown fittizio a date reali only

Scelta: solo date reali deadline (es. "Coorte Q3 2026 chiude 31 Ottobre"). No countdown fittizio.

### Da comparison dispregiativa a comparison rispettosa

Scelta: limitazioni specifiche alternative, no "loro sono scarsi".

### Da single in-page CTA a mobile sticky

Scelta: mobile sticky bottom-sticky su thumb-zone, auto-hide su footer.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Sandwich CTA (4-5 repliche) | Hero + mid + footer + mobile sticky | ✅ applicato |
| Pricing 2 tier pre-Stripe | Free + Pro €14,99/mese | ✅ applicato |
| Free trial zero-friction | 3 simulazioni gratis senza auth | ✅ applicato |
| Micro-quiz pre-CTA | 5 materie pill | ⏳ planned |
| Compare vs alternative | Tabella Noi vs ChatGPT vs Da solo | ✅ applicato |
| Pricing external anchor | Ripetizioni €80/h vs €14,99/mese | ✅ applicato |
| Authority cite Normattiva | Link diretto | ⏳ in progress |
| Trust band visual | 3 badge sotto CTA | ✅ applicato |
| Mobile sticky implemented | bottom-fixed full-width safe-area | ✅ applicato |
| Footer recap CTA button | button replica mnemonica | ✅ applicato |
| No countdown fittizio | Mai usato | ✅ applicato |
| No pop-up exit-intent | Mai usato | ✅ applicato |

**Gap**: micro-quiz hero non ancora implementato.

---

## Vincoli

- ❌ **NO** countdown fittizio.
- ❌ **NO** pop-up exit-intent.
- ❌ **NO** modali time-based.
- ❌ **NO** variazione CTA copy tra repliche.
- ❌ **NO** pricing 5+ tier.
- ❌ **NO** fake guarantee.
- ❌ **NO** claim di "risparmio" senza calcolo reale.
- ❌ **NO** timer "Coucou USD 50 off in 3:59:59".
- ❌ **NO** "Subscribe & Save" su tier base.
- ❌ **NO** "Limited time offer" artificiale.
- ❌ **NO** comparison dispregiativa.

---

*Continua in `17_saas_landing_patterns.md`.*
