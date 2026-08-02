# 17 — SaaS landing patterns: reverse engineering dei 20 prodotti premium mondiali

> **Scopo**: catalogare i pattern di landing SaaS premium mondiali (Stripe, Linear, Vercel, Notion, OpenAI, Anthropic, Mercury, Ramp, Framer, Cursor, ...), e selezionare quelli applicabili a ConcorsoAI. Sequenza: copywriting (11), CTA (13), trust (14), conversion (16), reverse engineering dei prodotti leader qui.

---

## Introduzione

### Perché il reverse engineering è la migliore fonte di pattern

La teoria dei bias cognitivi (file 02-03) e i pattern di conversione (file 16) definiscono i meccanismi. Ma i pattern **visibili** sulle landing del mondo sono la loro applicazione concreta, ripetuta 100+ volte. Imparare da Stripe / Linear / Vercel significa studiare pattern che sono stati:
1. Disegnati da team di designer di livello mondiale.
2. A/B tested su milioni di utenti.
3. Iterati nel tempo (le landing del 2025 sono diverse da quelle del 2020).

Pattern consolidati nel cluster "tool premium mondiale 2025":
- **Devtools** (Vercel, Linear, Cursor, Bolt, Lovable): hero con mockup interattivo chrome-framed.
- **AI tools** (OpenAI, Anthropic, Perplexity, ElevenLabs): hero testuale + minimal visual mockup.
- **Productivity** (Notion, Linear): hero split layout + ultra-custom typography.
- **Fintech** (Stripe, Mercury, Ramp): density-as-credibility + trust by compliance.

Riferimenti: Reverse engineering Stipe, Linear, Vercel, Notion, Mercury, OpenAI, Anthropic, Perplexity, ElevenLabs, Bolt, Cursor, Bolt, Warp, Rayscast, Lovable, Framer (tutti live 2025). Pattern operativi estratti da UI/UX community (Designercize, Daily Drop Cap, Awwwards).

### Come si applica a ConcorsoAI

Adozione spesifikka di ConcorsoAI:
- **Adotta** (alto valore): Trust by compliance PA, Micro-quiz pre-CTA, Density-as-credibility moderata, Visual first (mockup 3-tab hero), JTBD H1, Sandwich CTA.
- **NON adotta** (inappropriato): Dark mode default (PA target diffida), Glassmorphism inflazionato (anti-AI-slop), Bento grid (ConcorsoAI ha 3 features non 6+), Bento grid asymmetric (no 6+ features), Wall-of-Love VIP (pre-launch non ci sono).
- **Adatta**: Show-don't-tell (mockup ConcorsoAI con materie PA reali, non UI generico).

---

## Principi

### P1 — Product-as-marketing hero (show, don't tell)

Pattern (Perplexity, Vercel, Notion, Cursor, Bolt):
- Hero = mockup interattivo del prodotto reale.
- Tab/Workspace live che l'utente può provare senza clickare.
- Branding minimo: il prodotto È il brand.

ConcorsoAI:
- Hero = mockup 3-tab (Realtime score, Materie, Aree).
- Materie reali del bando (Diritto Amministrativo, Contabilità, ecc.).
- Citazioni normative reali (D.Lgs. 33/2013, art. 7-bis).
- Switch tra tab con click keyboard/pointer.

Pattern: il mockup È la hero. L'utente capisce in 5 secondi COSA fa il prodotto.

### P2 — Authority-by-silence (autorevolezza silenziosa)

Pattern (OpenAI, Anthropic):
- Spazio bianco ampio.
- Tipografia curata (display + body).
- Zero countdown o urgenza.
- Trust signal messo foot, non gridato ovunque.

ConcorsoAI:
- Off-white (`#FAF9F5` o `#FAF8F4`) bg di base.
- Inter + Geist Mono typography.
- Niente countdown / finta urgenza.
- Trust band sobria sotto CTA, footer compliance block.

Pattern: l'autorità si percepisce nel respiro, non nel volume.

### P3 — Density-as-credibility (Stripe, Linear)

Pattern (Stripe):
- Hero con canvas grafici + SDK + transazioni live + loghi enterprise.
- Density = segnale di profondità tecnica.
- Ogni elemento comunica capacità tecnica.

ConcorsoAI:
- **NON** adotta density elevata (PA target preferisce respiro editoriale).
- Density moderata: 5-8 elementi per viewport.
- Mockup "wow" ma non 12 elementi simultanei.

Pattern: density calibrata al contesto.

### P4 — Authority-by-VIP (Raycast, Granola)

Pattern (Raycast, Granola):
- Testimonial da founder/CEO di altri tool premium.
- "Wall of Love" con nomi noti.

ConcorsoAI:
- **NON** adotta pre-launch (no reciprocants disponibili).
- Post-launch: cercare testimonial da candidati PA che hanno usato, NON da founder di startup tecnologiche.

Pattern: social proof inversa solo quando ci sono ≥5+ beta user reali.

### P5 — Tipping question (Notion)

Pattern (Notion):
- Quiz interattivo: "Qual è il tuo ruolo? Sviluppatore / Designer / PM / ..."
- Risposta → customizza copy + pricing.
- Foot-in-the-door per commitment.

ConcorsoAI:
- Mini-quiz 5 materie pill (vedi Pattern F file 16).
- Risposta → preview materie specifiche del bando.
- CTA "Continua con la tua prima simulazione completa".

Pattern: micro-quiz = foot-in-the-door per commitment generale.

### P6 — Default society (Linear, Vercel)

Pattern:
- Toggle mensile/annuale, default annuale con badge.
- Tier centrale pre-selezionata.

ConcorsoAI post-Stripe:
- Default annuale (€119/anno).
- Tier centrale "Pro" pre-selezionata come default.

Pattern: scelta naturale = default comportamentale.

### P7 — Live demo interactive hero (Perplexity, Bolt)

Pattern:
- Hero = tool mini-runnable (search bar Perplexity / prompt input Bolt).
- Utente prova senza registrarsi.
- Conversion da "wow, funziona" → "lo voglio usare".

ConcorsoAI:
- Hero = mockup con tab interattivi (no live ma interattivi via JS).
- Ogni tab ha micro-animazione (slide-switch 300ms).
- Risultato del mini-quiz visibile.

Pattern: micro-demo interattiva SENZA live run. UI fa "finta interazione reale" per capire logica prodotto.

### P8 — Typographic minimalism (Anthropic, Linear)

Pattern:
- 1 sola font family + 1 mono.
- Scale tipografica 1.2x geometrica.
- Letter-spacing negativo su heading.

ConcorsoAI:
- Inter + Geist Mono.
- Scale 5 livelli (H1 40, H2 28, H3 20, body 16, micro 13).
- Letter-spacing -0.02em H1, -0.04em display.

Pattern: tipografia editoriale, non "design system template".

### P9 — Bottom-sticky for mobile (Stripe, Linear, Tutti)

Pattern:
- Mobile sticky CTA bottom-thumb-zone.
- Full-width, ≥48px altezza.
- Safe-area-inset iOS.

ConcorsoAI: ✅ applicato.

Pattern: standard stabilito per premium 2024+.

### P10 — Footer-rich con recap CTA + legal block (Stripe, Mercury)

Pattern:
- Footer 4 colonne (Prodotto | Risorse | Azienda | Legale).
- CTA button replica finale.
- Compliance block (privacy, cookie, ToS, recesso).
- Founder marker onesty.

ConcorsoAI: ✅ applicato.

Pattern: standard consolidato.

### P11 — Privacy/GDPR cookie banner (EU compliance, Omnipresente)

Pattern (EU tutti):
- Cookie banner con opt-in granulare.
- "Essential only" pre-selezionato (no pre-checked "Accetta tutto").
- Link a privacy policy dettagliata.

ConcorsoAI: ✅ implementato (Plausible cookieless = no banner needed; ma privacy + GDPR compliance doc sempre presente).

Pattern: GDPR Art. 4(11) + Art. 7 compliance minima.

### P12 — Friction-as-feature (Superhuman, Linear pre-launch)

Pattern:
- Premium pricing + keyboard-only = filtro elite.
- Recommendation only = "solo per high-perf team".

ConcorsoAI:
- **NON** adotta. PA target non ha "elite keyboard-only" patterns.
- ConcorsoAI preferisce zero-attrito.

Pattern: friction appropriata al contesto.

### P13 — Bento grid multi-feature (Linear, Stripe)

Pattern:
- Multi-tile asymmetric grid (2 large + 4 small).
- Ogni tile = 1 feature + screenshot/mockup.

ConcorsoAI:
- **NON** adotta. ConcorsoAI ha 3 features, non 6+.
- Layout simmetrico 3-col.

Pattern: Bento appropriato solo se features >4.

### P14 — Pricing transparency premium (Stripe, Mercury)

Pattern:
- Prezzi pubblici (no "Contact Sales" per tier base).
- Tier comparison table con features esplicite.
- Garanzia rimborso prominente.

ConcorsoAI: ✅ pattern adottato (vedi file 16 Pattern B).

### P15 — Show-numbers live stream (Stripe, Linear post-launch)

Pattern:
- "X online adesso" (counter live).
- "Triggers modal/popup with social signal".

ConcorsoAI:
- **NON** pre-launch (no utenti live).
- Post-launch: "47 candidati in formazione oggi" calcolato Supabase.

Pattern: live count significativo solo se >50 utenti.

---

## Pattern cross-SaaS (sintesi)

### Cluster 1 — DevTools (Vercel, Linear, Cursor)

- **Hero**: mockup interattivo chrome-framed.
- **Typography**: monofamily + mono su numeri (es. Linear Inter + Geist Mono, Vercel Geist).
- **CTAs**: 4-5 repliche con copy identico.
- **Trust**: founder marker + sponsor/case study schedule.
- **Color**: dark mode + ultra-spaced.

Applicazione ConcorsoAI: hero mockup, typography, replica.
NON applicazione: dark mode default (PA target resistance).

### Cluster 2 — AI Labs (OpenAI, Anthropic, Perplexity, ElevenLabs)

- **Hero**: minimal text + 1 visual discrete (logo, oggetto geometrico).
- **Typography**: serif editorial + sans clean.
- **CTAs**: 1 sola CTA primary (rare volte replica).
- **Trust**: "Mission" focus + paper/research footer.
- **Color**: off-white + ink + 1 colore brand.

Applicazione ConcorsoAI: typography serif-style, off-white bg, 1 colore brand.

### Cluster 3 — Productivity (Notion, Linear, Framer, Superhuman)

- **Hero**: split layout + 1 mockup interattivo.
- **Typography**: monofamily strong (es. Notion Inter custom).
- **CTAs**: "Get Notion free" + "Request a demo" (2 CTA contrastanti).
- **Trust**: "Trusted by millions" generico (no specifico).
- **Color**: pastel/cream/warm.

Applicazione ConcorsoAI: hero split 60/40, typography editorial.
NON applicazione: pastel (PA target prefers institutional).

### Cluster 4 — Fintech / Compliance (Stripe, Mercury, Ramp, Brex)

- **Hero**: canvas grafici + charts + density alta.
- **Typography**: mono/spaced (Stripe Söhne, Mercury custom).
- **CTAs**: 3-5 repliche con pattern A/B.
- **Trust**: regulatory compliance prominente (PCI, FDIC, GDPR).
- **Color**: indigo/blue + ultra-clean.

Applicazione ConcorsoAI: density MEDIUM (PA prefers editorial), trust by compliance prominente.

### Pattern riassuntivo

| Pattern | Cluster 1 Dev | Cluster 2 AI | Cluster 3 Productivity | Cluster 4 Fintech | ConcorsoAI |
|---|---|---|---|---|---|
| Hero mockup | ✅ | ✅ light | ✅ | ✅ light | ✅ |
| Typography monofamily | ✅ | ✅ serif | ✅ | ✅ mono | ✅ |
| CTA replica | ✅ | ❌ 1 sola | ✅ | ✅ | ✅ |
| Trust by compliance | ✅ | minimal | ✅ | ✅ critical | ✅ CRITICAL |
| Dark mode default | ✅ | ❌ | ❌ | ❌ | ❌ PA diffida |
| Glassmorphism | ❌ | ❌ | ❌ | ❌ | ❌ anti-AI-slop |
| Density high | ✅ | minimal | ✅ mittel | ✅ critical | ⚙️ MEDIUM |
| Bento grid | ❌ | ❌ | ✅ | ❌ | ❌ 3 features only |
| Founder marker | ✅ light | ❌ | ✅ | ✅ | ✅ onesty |
| Video hero | ❌ rare | ❌ | ✅ rare | ❌ | ❌ |
| CTA "Get started" | ❌ specific | ❌ | ❌ | ❌ specific | ❌ specific |

---

## Evidenze

### Reverse engineering Stripe (2024)

- Pattern consolidati: hero con canvas, density alta, trust by compliance PCI/SOC2, prezzi pubblici, founder marker.

### Reverse engineering Linear (2024)

- Pattern: monofamily Inter, mockup interattivi, dark mode immersive, purple signature `#5E6AD2`, Bento per features >4.

### Reverse engineering Vercel (2024)

- Pattern: monofamily Geist, hero CLI live, logo carousel, "Deploy now" CTA replica.

### Reverse engineering Mercure (2024)

- Pattern: hero canvas, trust by FDIC prominently, founder marker "Costruito da ex-tech", pricing transparency.

### Reverse engineering Notion (2024)

- Pattern: hero split, Inter custom, "Get Notion free" + secondary "Request a demo".

### Reverse engineering OpenAI (2024)

- Pattern: minimal text, mission focal, NO countdown, "Try ChatGPT" + "Explore our research".

### Reverse engineering Anthropic (2024)

- Pattern: ivory bg + serif display, "Try Claude" + "Read our research", density LOW + respiro massimo.

### Reverse engineering Perplexity (2024)

- Pattern: search bar integrated in hero (show-don't-tell massimo).

### Reverse engineering ElevenLabs (2024)

- Pattern: player multimediali integrati in hero, scroll-driven animations, "Listen to samples" CTA.

### Reverse engineering Bolt (2024)

- Pattern: prompt textarea = hero CTA, webcontainer demo, "Build with your words".

### Reverse engineering Cursor (2024)

- Pattern: minimalismo Apple-style, "Cursor is the best AI coding agent" (declarativo), "Download" CTA replica OS-specific.

### Reverse engineering Raycast (2024)

- Pattern: command bar hero, "Your shortcut to everything", Wall of Love VIP (Guillermo Rauch/MKBHD/Wathan).

### Reverse engineering Lovable (2024)

- Pattern: prompt input hero, ship-fast demo, "Turn ideas into apps".

### Awwwards (2024-2025) — Awwarded SaaS sito

- Pattern consolidati: tipografia custom, hero split + mockup, dark mode luxury, micro-animations.

### Designercize (2024) — Cluster analysis

- 4 cluster (Dev, AI, Productivity, Fintech) con pattern specifici. Pattern ConcorsoAI = ibrido Cluster 2 (AI tool minimal) + Cluster 4 (Fintech compliance).

### NN/g (2024) — SaaS Conversion Patterns

- Studio cross-SaaS. Pattern: 4-5 CTA replica + footer recap + trust band sub-CTA = top conversion.

---

## Errori comuni

### E1 — Dark mode default applicato a SaaS B2C PA-oriented

**Sintomo**: SaaS B2C PA implementato in dark mode per "trendy" senza verificare target.

**Perché succede**: il designer imita Stripe/Linear/Vercel style senza considerare audience.

**Perché il cervello lo rifiuta**: PA target diffida dark mode (vedi file 01 + 14).

**Soluzione**: PA-oriented = light mode default.

### E2 — Bento grid 6+ tiles per 3 features

**Sintomo**: la landing usa Bento grid (2 large + 4 small) per 3 features.

**Perché succede**: designer copia Linear.

**Perché il cervello lo rifiuta**: visual padding senza contenuto = "design senza sostanza".

**Soluzione**: Bento SOLO se features ≥5. Per 3 features, layout simmetrico 3-col.

### E3 — Micro-quiz troppo lungo (10+ step)

**Sintomo**: micro-quiz hero 10 step.

**Perché succede**: copy pensa "più dati = più personalizzazione".

**Perché il cervello lo rifiuta**: working memory limit 4±1 (Cowan 2001). 10 step = overhead cognitivo.

**Soluzione**: max 5 step per micro-quiz.

### E4 — Mockup hero con UI generica

**Sintomo**: mockup ConcorsoAI con "Sample User", "Lorem Ipsum", placeholder numerici.

**Perché succede**: developer non sa cosa mettere nel mockup.

**Perché il cervello lo rifiuta**: PA target identifica placeholder (Metzger 2020 78%). Trust erode.

**Soluzione**: mockup con dati REALI del prodotto (materie bando, citazioni normative, punteggi realistici).

### E5 — Trust by compliance copy vuota

**Sintomo**: landing ConcorsoAI scrive "GDPR compliant" senza link a privacy policy.

**Perché succede**: copy pensa "claim self-explanatory".

**Perché il cervello lo rifiuta**: claim senza link = dark pattern sospetto.

**Soluzione**: claim + link a doc specifica.

### E6 — "Contact Sales" pattern per tier base

**Sintomo**: tier Free / Pro chiede "Contact Sales" per vedere prezzo.

**Perché succede**: marketing vuole qualificare lead.

**Perché il cervello lo rifiuta**: Omnious EU violation + friction eccessiva.

**Soluzione**: prezzi pubblici sempre.

### E7 — Founder marker "made with ❤️" generico

**Sintomo**: "Made with ❤️ by passionate creators around the world for dreamers and doers" → footer.

**Perché succede**: template standard.

**Perché il cervello lo rifiuta**: claim generico + emoji = AI-slop.

**Soluzione**: founder marker specifico ("Marco V., Milano · Beta aperta Agosto 2026").

### E8 — Glossy/glassmorphism hero (Apple style)

**Sintomo**: la landing ha glassmorphism inflazionato (blur + saturation + outline).

**Perché succede**: designer imita Apple Big Sur visual.

**Perché il cervello lo rifiuta**: anti-AI-slop template detection.

**Soluzione**: niente backdrop-filter inflazionato. No glassmorphism.

### E9 — Trust by VIP senza VIP veri

**Sintomo**: landing ConcorsoAI dichiara "Recommended by [CEO di Stripe]" senza verifica.

**Perché succede**: copy pensa "VIP recommendation = trust boost massimo".

**Perché il cervello lo rifiuta**: claim falso → trust eroso completamente.

**Soluzione**: no claim VIP senza verifica. Solo reali.

### E10 — Mockup con "Sample data" generico

**Sintomo**: mockup mostra dashboard con "Total Sales $45,231" o "Mario Rossi, voto 95%".

**Perché succede**: developer mette placeholder.

**Perché il cervello lo rifiuta**: PA target identifica fake placeholder → trust erode.

**Soluzione**: dati REALI del prodotto. Es: "78/100 su Diritto Amministrativo art. 21-28."

---

## Pattern migliori

### Pattern A — Hero mockup interattivo (show-don't-tell)

Pattern ConcorsoAI:
- Mockup 3-tab (Realtime score · Materie · Aree basse).
- Materie reali del bando PA (Diritto Amministrativo, Contabilità, Penale).
- Citazioni normative reali (D.Lgs. 33/2013, art. 7-bis).
- Tab switch con animazione slide-switch.

### Pattern B — Density moderata per PA

ConcorsoAI: density editorial moderata. 5-8 elementi per viewport. Mai 12+ simultanei (Stripe hero).

### Pattern C — Trust by compliance prominente

Pattern:
- Trust band 3 elementi sub-CTA.
- Footer compliance block 4 link legali.
- Authority cite Normattiva.

Mai "trust us" alone.

### Pattern D — Typography editorial

Inter + Geist Mono.
Scale 5 step geometrici.
Letter-spacing negativo su H1/H2.

### Pattern E — Micro-quiz 5 materie (foot-in-the-door)

5 materie pill interattive.
Risultato preview del bando.
CTA finale weight superiore.

### Pattern F — Sandwich CTA replica

4-5 CTA repliche copy identico "Inizia la tua prima simulazione".

### Pattern G — Footer rico compliance

4 colonne (Prodotto | Risorse | Azienda | Legale).
CTA button finale.
Compliance block + founder marker onesty.

### Pattern H — Mobile sticky bottom-sticky

Bottom-fixed, full-width, ≥48px altezza, safe-area-inset iOS, auto-hide footer.

### Pattern I — Pricing external anchor

Anchor: "Ripetizioni private €80-150/h".
Interno: "ConcorsoAI Pro = €14,99/mese = €0,50/day".

### Pattern J — Comparison rispettosa

Tabella Noi vs ChatGPT vs Da solo con limitazioni specifiche.

### Pattern K — Privacy/GDPR baseline

Privacy policy + cookie banner compatto + diritto di recesso Art. 49 footer link.

### Pattern L — Hero Z-pattern + aria-label accessibile

H1 + sub allineati a sx.
Mockup a destra 60/40.
Trust band sub-CTA.
Tutto con aria-label.

---

## Checklist

- [ ] Hero mockup 3-tab con materie PA reali + citazioni normative reali
- [ ] Density moderata (5-8 elementi per viewport, mai 12+)
- [ ] Trust by compliance prominente (3 banner + footer legal block)
- [ ] Typography editorial: Inter + Geist Mono, scale geometrica
- [ ] Micro-quiz 5 materie nel hero (foot-in-the-door)
- [ ] Sandwich CTA 4-5 repliche copy identico
- [ ] Footer 4-colonne compliance block + founder marker
- [ ] Mobile sticky CTA bottom-sticky
- [ ] Pricing external anchor quando Stripe live
- [ ] Comparison vs alternative con limiti specifici
- [ ] Privacy/GDPR baseline + diritto di recesso link
- [ ] Z-pattern hero + aria-label semantico
- [ ] **NO** dark mode default (PA target resistance)
- [ ] **NO** glassmorphism inflazionato
- [ ] **NO** Bento grid per 3 features (solo se >4)
- [ ] **NO** countdown fittizio
- [ ] **NO** emoji hero

---

## Decisioni progettuali

### Da cluster choice a ConcorsoAI hybrid

Scelta: ConcorsoAI ibrido Cluster 2 (AI minimal) + Cluster 4 (Fintech compliance). Light mode + density moderata + trust istituzionale.

### Da mockup generico a mockup con dati PA reali

Scelta: mockup ConcorsoAI con materie PA reali + citazioni normative reali. Niente placeholder.

### Da dark mode a light mode default per PA

Scelta: light mode default. NO dark mode toggle.

### Da Bento grid a 3-col simmetrico

Scelta: 3-col simmetrico (3 features). Niente Bento.

### Da "Contact Sales" a prezzi pubblici

Scelta: prezzi pubblici sempre post-Stripe. NO "Contact Sales".

### Da emoji hero a no emoji

Scelta: zero emoji nella landing. NO 🚀✨🎯.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Hero mockup 3-tab PA reali | Diritto Amministrativo, Contabilità, Penale | ✅ applicato |
| Density moderata | 5-8 elementi viewport | ✅ applicato |
| Trust by compliance prominente | 3 banners + footer legal | ✅ applicato |
| Typography editorial | Inter + Geist Mono scale 5 | ✅ design tokens |
| Micro-quiz 5 materie | Pattern planned | ⏳ planned |
| Sandwich CTA 4-5 repliche | Hero + mid + footer + mobile sticky | ✅ applicato |
| Footer compliance block | Privacy + Cookie + ToS + Recesso | ✅ applicato |
| Mobile sticky CTA implemented | bottom-fixed safe-area | ✅ applicato |
| External anchor pricing | Ripetizioni €80/h vs €14,99/mese | ✅ applicato |
| Comparison rispettosa | Tabella Noi vs ChatGPT vs Da solo | ✅ applicato |
| Privacy/GDPR baseline | Documentazione live | ✅ applicato |
| Z-pattern hero | H1 + sub sx + mockup 60/40 | ✅ applicato |

**Gap**: micro-quiz hero non ancora implementato.

---

## Vincoli

- ❌ **NO** dark mode default (PA target).
- ❌ **NO** glassmorphism.
- ❌ **NO** Bento per <5 features.
- ❌ **NO** countdown fittizio.
- ❌ **NO** emoji hero.
- ❌ **NO** "Trending now" o "Hot" mini-badge.
- ❌ **NO** cluster crowding (Stripe-style 12+ elementi).
- ❌ **NO** mockup con placeholder generici.
- ❌ **NO** glassmorphism inflazionato.
- ❌ **NO** trust claim VIP falso.
- ❌ **NO** Wall of Love fittizio.

---

*Continua in `18_mobile_behavior.md`.*
