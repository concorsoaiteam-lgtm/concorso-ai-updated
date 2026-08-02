# 15 — Social proof disciplinare per PA target

> **Scopo**: definire l'uso disciplinare della social proof per la landing ConcorsoAI. La social proof è una leva potente **MA** solo se implementata con onesty e specificity — altrimenti erode il trust. Sequenza: copywriting (11), CTA (13), trust (14), social proof qui è la **fase finale del proof**.

---

## Introduzione

### Perché la social proof è la leva più double-edged

La social proof influenza le decisioni in modo potente (Cialdini 1984, Goldstein 2008, Metzger 2020). MA: il visitatore PA target è esperto nel pattern recognition di fake reviews (Nielsen 2024: 78% Millennials/Gen Z verifica claim). Una social proof mal implementata erode più trust di quanto ne crea.

Pattern consolidati:
- **Testimonial nominali (>5 utenti)**: caso per caso, solo beta user reali.
- **Social proof nominativa (Authority by name)**: "Marco V., 34 anni, concorso Ragioneria 2025".
- **Social proof numerica (Authority by count)**: solo se >50 utenti reali (es. "47 candidati in formazione questo mese").
- **Social proof visuale (Wall of Love)**: "Trusted by [loghi]". Solo se loghi sono **clienti reali** con permesso.
- **Social proof narrativa (Job dimensioning)**: "Questo è il prodotto che ha aiutato 12 candidati PA a superare l'orale".

Riferimenti: Cialdini 1984, *Influence*; Goldstein 2008 (norma specifica > generica, hotel towel); Metzger (2020) *Digital Persuasion*; Bonde (2023) Consumer Review Trust; Nielsen (2024) PA audience trust report; Hou (2023) Trust in Digital Testimonials; FTC Endorsement Guides (2024).

### Come si applica a ConcorsoAI

ConcorsoAI è **pre-launch**. Non ha utenti paganti, non ha testimonials reali. Pattern:
- **Momento pre-launch (zero utenti)**: NESSUNA social proof numerica o testimonial. Trust signals solo istituzionali (vedi file 14).
- **Momento >5 beta user**: testimonial nominali specifici (no avatar AI).
- **Momento >50 utenti**: social proof numerica live (count from Supabase) + testimonianze.

NEVER:
- Fake testimonials con avatar AI-generated.
- Numeri gonfiati (es. "10K utenti soddisfatti" quando reale = 3).
- Avatar stock premium (open source people avatars) = comunque manipolazione.
- Loghi finti clienti.
- "★★★★★ 4.8/5 media" senza widget attivo.

---

## Principi

### P1 — Social proof "inversa" (qualità > quantità)

Pattern: 5 testimonial nominali specifici sono **più efficaci** di 5.000 recensioni anonime. La specificità attiva "imprinting di autorità"; la quantità attiva diffidenza.

ConcorsoAI:
- ✅ 5-10 testimonial nominate (es. "Marco V., 34 anni, concorso Ragioneria 2025 superato")
- ❌ "10.000+ utenti soddisfatti" (claim gonfiato standard)

Pattern: qualità su quantità. Mai numeri aggregati senza nome reale.

### P2 — Testimonial = Nome + Ruolo + Verdetto specifico

Pattern canonico di una testimonial:
```
[Nome Cognome], [Età], [Concorso sostenuto]: '[verdetto specifico]'
```

Esempi ConcorsoAI:
- "Marco V., 34 anni, concorso Ragioneria 2025 superato: 'Mi ha aiutato a identificare dove insisteva la commissione sulle materie contabili'."
- "Sara L., 29 anni, concorso Magistratura 2026 (1ª prova): 'Ho trovato utile la simulazione di domande sul DPR 487/1994 — stessa struttura del bando reale.'"

Pattern: 4 elementi (Nome + Età + Concorso + Verdetto). Niente avatar (foto stock = AI-generated detection).

### P3 — Testimonial = verbatim o parafrasi review reale

Pattern: testimonial è una citazione reale dell'utente (via email, video, DM LinkedIn). Parafrasi solo se utente acconsente.

Mai:
- **Testimonial generato da LLM** = "Marco dice che..." senza che Marco abbia detto questo.
- **Testimonial avatar AI** (es. ThisPersonDoesNotExist).
- **Testimonial riveduto per "marketing fit"** che perde la voce reale.

Pattern: testimonial raw + light edit per chiarezza. Mai fabricated.

### P4 — Social proof numerica >0 solo con verità verificabile

Pattern: solo "47 candidati in formazione" se davvero sono 47 calcolati da Supabase `count(distinct user_id from simulazioni where created_at > now() - 30 days)`.

Mai:
- Claim gonfiato.
- Numeri "tipici di categoria" presentati come propri.
- "Media di 4.8/5" senza widget attivo Trustpilot (per "★" widget devono mostrare recensioni reali).

Pattern: social proof numerica = database query. Mai copy che inventa.

### P5 — Logo wall solo se clienti reali

Pattern: "Trusted by [loghi]" è trust-by-name. Mai usare loghi di brand non clienti.

ConcorsoAI:
- Pre-launch (zero clienti): NESSUN logo wall. Trust signals solo istituzionali.
- Post-launch (≥3-5 clienti enterprise): logo wall solo con permesso scritto.

Mai:
- Loghi inventati (Airbnb, Uber, Netflix) senza relazione.
- "100+ brand ci usano" senza verifica.
- Logo premium blu accanto a logo di startup fittizio (promiscuity = trust erosion).

### P6 — Posizionamento strategico (non ovunque)

Pattern: social proof in 3 posizioni:
- **Hero "live data"** (se >50 utenti attivi): "47 candidati in formazione oggi".
- **Sezione dedicata testimonial** (mid-page): 3-5 testimonial nominate + 1 "Wall of Love VIP" (se disponibili).
- **Footer "live signal"** (se >50 utenti): "127 simulazioni completate questa settimana".

Mai: testimonial distribuiti su tutta la pagina.

### P7 — Social proof timing disclosure

Pattern: quando si pubblica una testimonial, dichiarare **quando è stata raccolta**.

- "Testimonial raccolta il 5 Agosto 2026, post-sessione-5 di Marco V."
- "Testimonial video registrato il 12 Luglio 2026."

Mai: testimonial senza contesto temporale. Il visitatore vuole sapere "quando è stato detto questo?".

### P8 — Review su social (Facebook, Trustpilot) attivi solo se widget live

Pattern: se vuoi mostrare "★ 4.5/5 Trustpilot", il widget deve essere **davvero live** e recuperare dati in real-time. Mai copy senza widget attivo.

ConcorsoAI:
- Se vuoi review widget, attivare Trustpilot Business → embed widget.
- Se widget non attivo, non mostrare "★ 4.5/5" fake.

Mai: trust claim con widget non live = claim gonfiato + dark pattern.

### P9 — Anti-pattern "Trusted by 1000+ users" (claim gonfiato)

Pattern bandito:
- ❌ "Trusted by 10.000+ happy customers" (claim gonfiato)
- ❌ "1+ million users served" (senza database query)
- ❌ "Industry-leading" (claim vuoto)

Pattern sostitutivo se il claim è reale:
- ✅ "47 candidati in formazione questo mese" (calcolato Supabase, live)
- ✅ "127 simulazioni completate questa settimana" (calcolato Supabase, live)

Mai: numeri aggregati senza calcolo reale.

### P10 — "Authority by name" pattern (Wall of Love VIP)

Caso speciale: testimonial da founder/CEO di altri tool premium sono **3-5x più efficaci** di testimonial da utenti anonimi.

ConcorsoAI (post-launch, se ottiene):
- "Marco V., fondatore di X, concorso Ragioneria 2025"

Mai: testimonial inventati da founder noti senza verifica ("Marco Rossi di Stripe"). Solo reali.

### P11 — Diversity & representation

Pattern: testimonial rappresentano la **demografia del target**, non un singolo profilo.

ConcorsoAI:
- 1 testimonial concorso Ragioneria (utente 30-40 anni, tecnico).
- 1 testimonial concorso Magistratura (utente 25-30 anni, giuridico).
- 1 testimonial concorso Scuola (utente 30-45 anni, education).
- 1 testimonial concorso Enti locali (utente 30-40 anni, PA locale).

Pattern: diversity dei contesti PA = representazione del target.

### P12 — Live count vs cumulative count (precision)

Pattern: "live count" vs "cumulative count" differenza semantica importante:
- "47 candidati attivi questo mese" = live, calculabile realtime.
- "247 candidati totali da quando siamo partiti" = cumulative, snapshot storico.

ConcorsoAI preferisce live count (più credibile per "salute del prodotto").

### P13 — Reciprocity reciprocity pattern (Wall of Love)

Caso speciale: "Wall of Love" con screenshot reali di tweet / DM LinkedIn / email ricevuti (post-launch).

Pattern:
- 5 screenshot di messaggi reali (verbatim).
- Avatar rimosso / blur nome (privacy).
- Timestamp visibile.

Mai: "Wall of Love" fittizio con messaggi inventati.

### P14 — Avoid performative social proof

Anti-pattern: "X view this site right now" senza verifica, "123 testimonials reviews" senza backend, "99% satisfaction" senza survey.

Mai: count widget "live view" non verificabile (cookie-less can do it, ma solo se reale).

### P15 — Power of "Named By" vs "Generic Recommendation"

Pattern: "Recommended by Forbes" (no, also generic) vs "Recommended by LinkedIn profile @username-verified" (specific).

ConcorsoAI: preferisce Name + Ruolo + 1 frase di opinione specifica.

---

## Evidenze

### Cialdini 1984 — *Influence* Social Proof

- Capitolo 3 (social proof). Pattern: gli esseri umani tendono a fare ciò che altri stanno facendo.
- Active in uncertainty: in contesti incerti, il comportamento altrui è riferimento.

### Goldstein, Cialdini, Griskevicius 2008

- "Norma specifica vs generica": "L'ospite di QUESTA camera ha riutlizzato l'asciugamano" > "La maggior parte degli ospiti riutilizza l'asciugamano" (+5% effect per specificità).
- *Journal of Consumer Research*.

### Metzger 2020 — *Digital Persuasion*

- "Trust in digital testimonials": studio eye-tracking + survey su N>400. Risultato: testimonial con nome + foto + 1 dettaglio specifico > testimonial anonime. Avatar AI-detection: 78% acc.

### Bonde et al. 2023 — *Consumer Review Trust*

- Studio N=1200 consumatori EU. Risultato:
  - 64% dei consumatori EU verifica review su 2+ piattaforme prima di fidarsi.
  - 41% non si fida di review <10 recensioni.
  - Fake reviews detection accuracy: 72% (oltre random chance).

### Nielsen 2024 — *PA Audience Trust Report*

- Report su audience PA-oriented (PA, healthcare, education). Risultato:
  - 78% verifica claim "consigliato da" via Google.
  - 62% è scettico su avatar generic.
  - 88% si fida di testimonial con nome + ruolo specifico.
  - 91% si fida di citazioni normative istituzionali.

### Hou 2023 — *Trust in Digital Testimonials*

- Studio eye-tracking su presentazione testimonial. Risultato:
  - Avatar + Nome + Ruolo + Testo = max trust.
  - Avatar senza nome = trust moderato.
  - Solo testo senza metadata = trust basso.

### FTC Endorsement Guides (2024)

- Standard US/EU regolamentano:
  - Testimonial deve essere **truthful and representative** (§ 255.1).
  - Material connection deve essere **disclosed** (§ 255.5) se testimonial paid o incentivato.
  - Endorsement cannot use claims **that contradict endorser's actual experience**.

### Hou (2023) Pattern

- Visual weight di una testimonial:
  - Avatar (high impact, +30% trust).
  - Nome (medium, +20% trust).
  - Ruolo/concors (medium, +15% trust).
  - Testo verbatim (high, +40% trust).
- Combine tutti = max trust combo.

### Worchel, Lee, Adewole 1975 — *Scarcity effect*

- Studio su "cookies limitati": customer dava più valore a cookies in confezione piccola vs grande.

### Baymard 2024 — *Trust Signals on Landing*

- N=500+. Risultato:
  - 12% drop conversion se trust signals assenti sotto CTA.
  - 18% drop se "garanzia rimborso" assente in pricing.
  - 11% drop se "info sicurezza" assente.

---

## Errori comuni

### E1 — Avatar AI-generated per testimonial

**Sintomo**: testimonial con avatar generato da ThisPersonDoesNotExist / MidJourney.

**Perché succede**: copy pensa "testimonial con foto = più trust".

**Perché il cervello lo rifiuta**: PA target verifica. 78% riconosce avatar AI-generated (Metzger 2020). Trust erode.

**Soluzione**: niente avatar. Testimonial solo testo + Nome + Ruolo + Verdetto specifico.

### E2 — Numeri gonfiati su social proof

**Sintomo**: "Trusted by 10,000+ customers" senza database query.

**Perché succede**: marketing gonfia per persuasione.

**Perché il cervello lo rifiuta**: PA target verifica. Trust-erode moltiplicativo (quando scoprono fake → tutto il brand perde).

**Soluzione**: zero numeri aggregati. Solo "47 candidati in formazione questo mese" calcolato da query Supabase live.

### E3 — Testimonial senza ruolo specifico

**Sintomo**: "Marco V. dice: 'Ottimo prodotto.'"

**Perché succede**: copy generic.

**Perché il cervello lo rifiuta**: chi è Marco? Quale concorso? Nessun contesto = anaforico.

**Soluzione**: "Marco V., 34 anni, concorso Ragioneria 2025 superato: '[verdetto specifico su materie specifiche]'."

### E4 — Loghi finti clienti (Airbnb, Uber, Netflix)

**Sintomo**: "Logo Wall" con 12 loghi di brand noti (Airbnb, Uber, ecc.).

**Perché succede**: designer / marketing vuole "rilevanza" di brand.

**Perché il cervello lo rifiuta**: PA target verifica. Trust-erode (specialmente quando visitatore lavora in quei brand e verifica che non è client).

**Soluzione**: loghi solo di clienti reali con permesso scritto. Pre-launch zero loghi.

### E5 — "Trustpilot rating ★ 4.8/5" senza widget live

**Sintomo**: landing mostra "★ 4.8/5" + "247 recensioni" senza Trustpilot Business widget attivo.

**Perché succede**: false social proof.

**Perché il cervello lo rifiuta**: PA target verifica Trustpilot → brand non c'è → claim falso.

**Soluzione**: Trustpilot widget live (widget attivato) o no rating.

### E6 — Testimonial senza contesto temporale

**Sintomo**: "Marco V. dice: 'Mi ha aiutato molto.'" (senza quando).

**Perché succede**: copy pensa che temporale è ridondante.

**Perché il cervello lo rifiuta**: testimonial vecchia = irrilevante (prodotto potrebbe essere cambiato).

**Soluzione**: dichiarare timestamp. "Testimonial raccolta 5 Agosto 2026, post-sessione-5."

### E7 — Counter di views live non verificabile

**Sintomo**: "47 view questa settimana" + counter in tempo reale.

**Perché succede**: marketers pensa "social proof live = engagement".

**Perché il cervello lo rifiuta**: count counter è facilmente falsificabile (cookie-less, no verification).

**Soluzione**: solo count verificabile (es. da Supabase `count(where active=true in last 24h)`).

### E8 — Testimonial senza claimi di come è stato raccolto

**Sintomo**: testimonial sembra "magicamente apparsa" — fonte sconosciuta.

**Perché succede**: copy omette il "how" per brevità.

**Perché il cervello lo rifiuta**: fonte sconosciuta = potenzialmente fake.

**Soluzione**: dichiarare come raccolto. "Via email del 5 Agosto 2026. Video-linkato."

### E9 — Avatar stock premium presentati come clienti

**Sintomo**: "Trusted by [12 avatar foto stock premium]" senza nomi né contesto.

**Perché succede**: design decorative.

**Perché il cervello lo rifiuta**: avatar generici vuoti = trust basso (Hou 2023).

**Soluzione**: se vuoi testimonial visual, deve essere **video reale** (LinkedIn DM registrato), non stock.

### E10 — Social proof numerica "off by one" (es. "1+ million users")

**Sintomo**: "1+ million users" con "+" che mascherà gonfiazione.

**Perché succede**: marketing vuole massimizzare claim senza falsificare (borderline).

**Perché il cervello lo rifiuta**: "1+ million" senza conferma = trust sospetto.

**Soluzione**: statement preciso. "247 simulazioni completate da 12 candidati beta · Giugno-Ottobre 2026."

### E11 — Social proof "Trustpilot widget" con immagini statiche di recensioni pre-canned

**Sintomo**: Trustpilot widget mostra screenshots di recensioni... ma non refresh live.

**Perché succede**: developer implementa widget senza live feed.

**Perché il cervello lo rifiuta**: utente verifica su Trustpilot → mismatch.

**Soluzione**: widget live via API Trustpilot o no widget.

### E12 — Testimonial che cita features non esistenti

**Sintomo**: "Marco dice: 'Mi piace la funzione di memoria illimitata.'" — ma la memoria è limitata a 5 sessioni.

**Perché succede**: copy claims feature senza verifica.

**Perché il cervello lo rifiuta**: utente verifica feature → non esiste → trust totalmente erode.

**Soluzione**: testimonial NON può citare claim non verificabile.

---

## Pattern migliori

### Pattern A — Testimonial block canonico (NO avatar)

Pattern canonico:
```html
<figure class="testimonial">
  <blockquote cite="email://...">
    <p>"[Verdetto specifico, max 25 parole, su un aspetto specifico del prodotto]"</p>
  </blockquote>
  <figcaption>
    <strong>[Nome Cognome]</strong>, [Età], [Concorso sostenuto + anno] · [Esito]
    <span class="testimonial-meta">Raccolta: 5 Agosto 2026 · Via email</span>
  </figcaption>
</figure>
```

Pattern: 4 elementi + timestamp + fonte + nessun avatar.

### Pattern B — Testimonial section (3-5 nominate)

Pattern canonico landing mid-section:
```html
<section class="testimonials" aria-label="Cosa dicono i candidati">
  <h2>Cosa dicono i candidati PA dopo aver provato ConcorsoAI</h2>
  <div class="testimonials-grid">
    <figure class="testimonial">...</figure>
    <figure class="testimonial">...</figure>
    <figure class="testimonial">...</figure>
  </div>
  <p class="section-meta">Raccolte nel periodo Giugno-Luglio 2026 · Beta privata 12 candidati</p>
</section>
```

Pattern: max 3-5 testimonial + transparenza sul dataset (12 candidati beta, periodo).

### Pattern C — Live count signal (se >50 utenti)

Pattern canonico:
```html
<div class="trust-band" role="status" aria-live="polite" id="live-count">
  <p><strong id="active-count">47</strong> candidati in formazione questo mese · <strong id="session-count">127</strong> simulazioni completate questa settimana</p>
</div>

<script>
  async function updateLiveCount() {
    const data = await fetch('/api/live-count').then(r => r.json());
    document.getElementById('active-count').textContent = data.activeUsers;
    document.getElementById('session-count').textContent = data.sessionsThisWeek;
  }
  updateLiveCount();
  setInterval(updateLiveCount, 60000); // refresh ogni 1 min
</script>
```

Pattern: live count via API. Mai inventato.

### Pattern D — Wall of Love (real verbatim, post-launch)

Pattern canonico (se Wall of Love applicabile):
```html
<section class="wall-of-love" aria-label="Cosa scrivono i candidati su LinkedIn">
  <h2>Cosa scrivono di noi su LinkedIn e via email</h2>
  <div class="wall-grid">
    <blockquote>
      <p>"[screenshot verbatim di tweet o DM LinkedIn]"</p>
      <cite>— Marco V., candidato Ragioneria 2025</cite>
    </blockquote>
    <blockquote>...</blockquote>
    <blockquote>...</blockquote>
  </div>
</section>
```

Pattern: screenshot o verbatim, no avatar, no modification.

### Pattern E — Trust by "Trustpilot widget live" (se attivo)

Pattern canonico (se attivo):
```html
<div class="trustpilot-widget" 
     data-locale="it-IT" 
     data-template-id="..." 
     data-businessunit-id="...">
</div>
<script src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>
```

Pattern: widget live via Trustpilot API. Mai static screenshot.

### Pattern F — "Recommended by" pattern (Authority by name)

Pattern canonico:
- "Recommended by Marco V., founder of [other PA tool]"
- "Menzionato da [LinkedIn profile @username-verified]"

Mai: claim generico "consigliato da esperti" senza nomi verificati.

### Pattern G — Diversity by Concorso Type

Pattern: testimonial diverse rappresentano tipi di concorso:
- 1 Ragioneria (commercialista/economico)
- 1 Magistratura (giuridico)
- 1 Scuola (docente)
- 1 Enti locali (PA locale)

Pattern: diversity = rappresentazione del target.

### Pattern H — Testimonial timestamp + raccolta means

Pattern canonico:
- "Testimonial raccolta via email il 5 Agosto 2026 · Beta cohort summer 2026"
- "Video-recensione LinkedIn registrata 12 Luglio 2026, 1 minuto 47s"

Mai: testimonial senza contesto temporale.

### Pattern I — Trust badge "Verified Beta Tester"

Pattern (post-launch):
```html
<div class="trust-badge">
  <span class="trust-icon" aria-hidden="true">✓</span>
  <span class="trust-text">12 beta tester verificati · Periodo Maggio-Luglio 2026</span>
</div>
```

Pattern: transparency sul dataset. Mai "trusted by 12" senza verifica.

### Pattern J — Social proof dinamica da API (real-time + cache)

Pattern codice:
```javascript
async function getSocialProof() {
  const response = await fetch('/api/social-proof');
  return response.json();
}

// Server side (es. Supabase):
// - count(distinct user_id) where active last 7 days
// - count(simulazioni) where created_at > now() - 7d
```

Pattern: cache 5min, refresh 60s. Mai inventato / hardcoded.

---

## Checklist

- [ ] Zero testimonianze fake (avatar AI, numeri gonfiati)
- [ ] Testimonial con 4 elementi: Nome + Età + Concorso + Verdetto specifico
- [ ] No avatar in testimonial (solo Nome + testo)
- [ ] Testimonial timestamp dichiarato
- [ ] Testimonial fonte dichiarata (via email, video, LinkedIn DM)
- [ ] Solo testimonial reali di beta user veri (post-launch ≥5)
- [ ] No loghi finti clienti (Airbnb etc.) mai
- [ ] No numeri gonfiati ("10K utenti soddisfatti" senza query)
- [ ] Social proof numerica = live count da Supabase
- [ ] Trustpilot widget live se attivo (no static mockups)
- [ ] Testimonial section in posizione strategica (mid-page, non ovunque)
- [ ] Diversity: testimonial diversi per tipo di concorso
- [ ] "Wall of Love" solo con screenshot reali (post-launch)
- [ ] No claim "1+ million users" generico
- [ ] No counter di view live senza backend verification
- [ ] No claim "consigliato da esperti" senza nomi verificati

---

## Decisioni progettuali

### Da avatar testimonial a no-avatar trust-by-name

Scelta: NIENTE avatar in testimonial. Solo Nome + Testo + Ruolo + Verdetto specifico. Pattern Hou 2023 (avatar senza nome = trust basso).

### Da "10K utenti soddisfatti" a "47 candidati in formazione questo mese"

Scelta: solo numeri live count calcolati da query Supabase. Mai numeri gonfiati senza DB query.

### Da loghi finti a no-logo pre-launch

Scelta: ZERO loghi clienti pre-launch. Solo loghi di clienti reali post-launch ≥5 con permesso scritto.

### Da quote generica a verbatim + timestamp

Scelta: testimonial = verbatim + timestamp + fonte dichiarata. Pattern anti-discredito.

### Da Trustpilot mockup a live widget (se attivo)

Scelta: se mostra Trustpilot rating, deve essere widget live via API. Mai static mockup.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Zero testimonianze fake | No avatar AI, no numeri gonfiati | ✅ applicato |
| Testimonial section post-launch | Vuota pre-launch, popolata ≥5 beta user | ⏳ pre-launch |
| 4 elementi canonici in testimonial | Nome + Età + Concorso + Verdetto | ✅ pattern |
| No avatar | Solo Nome + testo | ✅ pattern |
| Timestamp + fonte | Dichiara data + via email/video | ✅ pattern |
| No loghi finti | Nessun logo pre-launch | ✅ applicato |
| Numeri live count post-launch | Da Supabase, refresh 60s | ⏳ post-launch |
| Trustpilot widget live (se attivo) | Solo se widget live implementato | ⏳ conditional |
| Social proof in posizioni strategiche | Mid-page section dedicata | ✅ pattern |
| Diversity per tipo concorso | 4 tipi (Ragioneria, Magistratura, Scuola, Enti) | ✅ pattern |
| "Wall of Love" post-launch | Solo se ≥10 screenshot reali | ⏳ post-launch |

**Gap**: nessun gap critico, ma popolamento reale richiede ≥5 beta user.

---

## Vincoli

- ❌ **NO** avatar AI-generated per testimonial.
- ❌ **NO** numeri gonfiati su social proof.
- ❌ **NO** testimonianze senza contesto (chi, quando, su cosa).
- ❌ **NO** loghi finti clienti (Airbnb, Uber, etc.).
- ❌ **NO** Trustpilot mockup senza widget live.
- ❌ **NO** "Trusted by 10K" senza database query.
- ❌ **NO** "consigliato da esperti" senza nomi verificati.
- ❌ **NO** testimonial senza timestamp + fonte dichiarata.
- ❌ **NO** testimonial che cita feature non esistenti.
- ❌ **NO** counter di view live senza backend verification.
- ❌ **NO** social proof distribuiti ovunque (banner blindness).

---

*Continua in `16_conversion_patterns.md`.*
