# AGENT MEMORY — ConcorsoAI

## 🧠 Regole personali di Ruman (18/07/2026)
1. **Regola apprendimento**: ogni volta che imparo qualcosa di utile (un errore ricorrente, qualcosa su Ruman, o qualsiasi altra cosa utile) → aggiungerlo subito in `AGENT_MEMORY.md`
2. **Regola skill-first**: prima di modificare qualsiasi cosa, cercare la skill migliore per il contesto o chiedere a Ruman qual è la skill migliore

## Stato progetto (09/07/2026)
- **Budget**: €0 (free tier Vercel + Supabase + BluesMinds)
- **AI**: deepseek-v4-flash via BluesMinds API
- **Auth**: Supabase (email + Google OAuth)
- **Pagine**: landing (index), auth, dashboard, simulation, history, blog, terms, privacy
- **Stile**: Tailwind CDN + CSS esterni, tutto inline `<style>`, GSAP animazioni

## TODO completato
Tutti i punti della TODO list originale di Ruman sono stati fatti (10/10). Vedi `idee.md` per la feature idea futura.

## Altri agenti
- Alpha (agente parallelo): non ha mai risposto, zero file scritti.
- Tutto il lavoro è stato fatto da Beta (io, agente attuale).
- File `conversation/` e `agent-context/` puliti dopo completamento.

## Regole progetto
- Tutto inline `<style>` in ogni HTML
- Tailwind CDN, Supabase JS v2 CDN, GSAP CDN
- Nessun build system
- CSS esterni in `public/css/` ma anche inline nei file HTML
- Lancio sito metà Agosto 2026

## File chiave
- `plan.md` — piano corrente per far funzionare il commissario
- `idee.md` — idea feature premium (da costruire dopo lancio)
- `api/chat.js` — proxy serverless verso BluesMinds
- `public/simulation.html` — simulazione orale
- `public/dashboard.html` — dashboard utente
- `public/index.html` — landing page
- `public/auth.html` — login/registrazione

## FIXATI (09/07/2026)
- Temperatura variabile: Facile→0.3, Realistico→0.5, Difficile→0.7 (entrambi stream e non-stream)
- Auth header Bearer token su tutte le chiamate API (stream + non-stream)
- System prompt snellito (rimosse regole ridondanti 3-4-5) + fallback materie generali per chunks vuoti
- Error handling specifico: 401, 403, 429, 502, 503 con messaggi user-friendly
- CSS wave animation + mic-pulse aggiunti a simulation.css (parity con landing mockup)
- Max tokens portato a 700 (era 500) per risposte più complete

## ANTI-SLOP CLEANUP (28/07/2026)
**Round di rimozione AI-slop su public/index.html:**
- Rimosso tutti i 5 micro-eyebrows `section-eyebrow`
- Rimossi i 3 numeri giganti decorativi "01/02/03" in Come Funziona
- Rimosso `glass-card`, `premium-panel`, gradient decorativi
- Sostituiti em-dash nel copy
- Aggiunto palette `ink` (500/700/900) per contrasto WCAG-AA
- Creato `slop-registry.md` con i 12 pattern trovati

**Lezione importante per future sessioni:**
- NON aggiungere CTA più aggressive con bordo solido + drop shadow fisica — designmeter l'ha letto come "troppo contrasto/pesante" → Color Contrast Severe peggiorato da High. Tenere glow/diffusion per le CTA.
- Aggiungere elementi nuovi può peggiorare i punteggi quanto rimuoverli può migliorarli. Pure rimozioni sono più sicure.
- Em-dash è bandito dal framework anti-slop (`design-taste-frontend`): zero in copy, headline, button, pillola, FAQ.
- Quando rimuovi classi CSS che davano padding/bg/border, COMPENSA inline con classi Tailwind esplicite altrimenti gli elementi su dark bg diventano invisibili (caso reale: rimozione `.premium-panel` da articoli Come Funziona → ho dovuto aggiungere `border border-white/10 bg-white/5 p-7`).
- `shadow-glowBlue` token rimosso da tailwind.config, ma il `class="shadow-glowBlue"` era ancora usato su chat bubble hero (riga 257) → sostituito con `shadow-sm`. Sempre cercare residui per token rimossi.

## EDITORIAL REWRITE (28/07/2026 - round 2)
**Decisione**: il round 1 (rimozioni chirurgiche AI tells) ha portato il punteggio designmeter a 40/52 ma la pagina aveva ancora problemi strutturali (5 CTA con stesso intento, hero mockup fittizio, 8 sezioni dense). Le rimozioni superficiali non bastano quando la pagina è sovraccarica.

**Soluzione**: riscrittura completa di `public/index.html` come landing editoriale minimal.
- Da ~700 a ~290 righe (-59%)
- 8 sezioni → 4 sezioni (Navbar + Hero + Come Funziona + Prezzi)
- 5+ CTA con stesso intento → 4 CTA distinti (navbar / hero / prezzi-Pro / sticky mobile — sono entry-point, non duplicati)
- Hero mockup chat finta rimosso completamente
- Hero centered con H1 specifico + subhead onesto
- Pricing tight 2-card senza tier fantasma
- Footer leggero strip trust + 3 link

**Lezione importante**: per landing page SaaS dense come ConcorsoAI, **la riduzione di sezioni batte il pattern-by-pattern fixing**. Una pagina con 8 sezioni non può arrivare a UI>60 perché il designmeter la flagga come "decision fatigue".

**File di riferimento**:
- `slop-registry.md` — dettaglio rimozioni e regole anti-slop
- `public/index.html` — nuovo file (290 righe)
- `public/css/landing.css` — pulito a 50 righe (solo classi usate)

## ROUND 3 — POLISH + MOTION (28/07/2026)
**User feedback dopo round 2**: "buono e semplice, ma troppo solo font nero". Mancavano motion, button vero su "Scopri come funziona", pricing segmentato mensile/annuale, zona "Perche'" che spiega il valore. Anche "Prova gratis: 3 simulazioni" → "Inizia gratis" ovunque.

**Modifiche**:
- Motion system CSS-only + IntersectionObserver: hero-rise stagger (5 elementi con cubic-bezier .2/.8/.2/1, delay 80→600ms), reveal-on-scroll, savings-badge pulse, btn hover lift + shadow. Live-dot verde animate-pulse nel trust strip. Tutto respects prefers-reduced-motion.
- "Scopri come funziona" → btn-secondary con bordo 2px brand-600 (vero bottone, non più link testuale).
- CTA copy ovunque: "Prova gratis: 3 simulazioni" → "Inizia gratis".
- Sezione nuova **Perche' ConcorsoAI** tra Come Funziona e Prezzi: 3 value props concreti (prezzo vs ripetizioni private, adattamento ai punti deboli, progressi tracciati), stesso stile cards di Come Funziona per coerenza visuale.
- Prezzi: rimossa card Free. Card singola Pro con 2 CTA segmented Mensile/Annuale via `grid-cols-[3fr_4fr]`. Badge grafico "Risparmi €37/anno" con pulse animation sopra il bottone annuale. Free tier ora footnote link "Inizia gratis: 3 simulazioni al mese →".
- Savings reali calcolate: mensile 12,99x12=€155,88/anno vs annuale €119/anno = €36,88 arrotondato a €37.

**Decisione chiave**: la priorità "less is more" del round 2 si è scontrata col feedback utente "troppo piatto". Round 3 aggiunge motion + segmented pricing + zona perché **ma senza tornare a glassmorphism / mockup floating / carousel testimonial**. Risultato: 4 sezioni animate, ognuna con H2 tracking-tighter + text-balance + reveal-on-scroll al primo viewport.

**Lezione per future sessioni**: motion minima = motion che migliora percezione qualità, non motion decorativa. Ogni animation deve rispondere a "che valore porta?". Le 4 animazioni scelte HANNO un perché: hero-rise (sequenza di attenzione), reveal-on-scroll (page alive senza essere noisy), savings-badge (pubblicizza lo sconto senza testo puro), live-dot (trust signal continuo).

**File**:
- `public/index.html` — 440 righe (da 290, +51%). 4 sezioni + script IntersectionObserver inline. Schema.org JSON-LD aggiornato: highPrice=119, offerCount=3.
- `public/css/landing.css` — 130 righe (da 50, +160%). Motion system + enhanced btn hover + prefers-reduced-motion guard completo.

## Metriche post-round
- Round 0: UI 28, UX 50, Overall 28
- Round 1 (rimozione AI tells): UI 40, UX 52, Overall 44 (+56% UI)
- Round 2 (editorial minimal): non misurato in autonomia (commit pronto)
- Round 3 (editorial + motion + segmented pricing): atteso UI 52-62, UX 60-70, Overall 56-66. Focus sperato: Visual Hierarchy migliora via segmented CTA dominante, Conversion Clarity migliora via Perche' section, Accessibility migliora via button veri (focus-visible outline).

**Vincolo nuovo per future sessioni**: prima di aggiungere qualsiasi motion alla landing, chiedersi *"che valore porta?"*. Motion senza value = slop.

## ROUND 4 — COLOR POLISH (28/07/2026)

**User feedback dopo round 3**: "migliorato, colori devono essere una bestia". Ha richiesto un deep dive sui colori fatto bene, senza AI-slop, ma anche di non procedere piano piano: "nono è troppo piano fai tutto insieme".

**Workflow**:
1. Web research su SaaS color discipline 2025-2026 (Linear/Stripe/Plaid/Mercury, WCAG AA, anti-slop tells).
2. Thinker-with-files → audit specifico del progetto + 5 cambi prioritizzati (C1-C5).
3. Code-review identifica D-fix su C3: btn-secondary outline stesso colore del border → "double ring" ambiguo.
4. D-fix applicato: btn-secondary focus-visible ora brand-700 (#0B3A63) con offset 3px (più scuro del border + più ampio gap).

**Modifiche applicate**:
- **Pre**: rimosso `animate-pulse bg-emerald-500` dal trust strip hero (live-dot verde). Era micro-AI-tell template. Trust strip ora fermo, solo testo (text-ink-500).
- **C1 Logo navbar**: gradient `bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent` → `text-brand-600`. Single-accent discipline. Logo "AI" ora solido blu governativo.
- **C2 Badge Risparmi €37**: `bg-amber-400 text-amber-900 ring-white` → `bg-emerald-100 text-emerald-800 ring-brand-600`. Rispetta "green-only per status positivo" (Stripe/Linear convention). Tolta "advertising yellowness".
- **C3 Focus ring btn-primary**: `outline: 2px solid #0F4C81; outline-offset: 2px` (era `#2563EB` chiaro, ora brand coerente).
- **C3-focus ring (uniform bestia)**: btn-primary `outline: 2px solid #0F4C81; outline-offset: 2px` → `outline: 2px solid #0B3A63; outline-offset: 4px`. btn-secondary `outline: 2px solid #0B3A63; outline-offset: 3px` → `outline-offset: 4px`. **Pattern uniforme**: entrambi i button hanno stesso focus indicator (brand-700 + 4px spatial gap). border-secondary = brand-600, outline brand-700 = 1 tono scuro = differenziazione visiva netta via lightness + spatial gap. Niente più "doppio ring" ambiguo. WCAG AAA confermato per entrambi (outline su white = ~11:1, su slate-200 = ~9:1).
  - **Bestia finale upgrade**: outline `brand-700 #0B3A63` → `brand-900 #071D33` (lightness drop 22% → 8%, gap border-brand-600 a outline-brand-900 = ~18%, decisamente più "punchy" focus state). Ancora single-accent (brand-900 è in palette). WCAG AAA confermato anche per brand-900: outline vs white = ~17:1, vs slate-200 = ~13:1.
- **C4 Favicon SVG**: rimosso `<defs><linearGradient>` → solid `fill='%230F4C81'`. Single-accent discipline applicata al tab icon.
- **C5 Section bg**: `bg-brand-50` → `bg-slate-200` (#E2E8F0) in Come Funziona + Prezzi. "Bestia mode" = palette unita + sfondi decisi (slate-200 > slate-50). Alternation finale: Hero (white) → Come Funziona (slate-200) → Perché (white) → Prezzi (slate-200). Depth tra section grigia e card bianche dentro.

**Decisione chiave su C5**: slate-200 invece di slate-50 perché user vuole "bestia" (palette unita + depth marcato). Rischio percepito = look "agenzia delle entrate", ma bilanciato da hero minimal + brand-600 accenti. Se troppo austero in measure round, dial back a slate-100 in round 6.

**Lezione importante per future sessioni**:
- Quando un elemento ha `border: X`, NON usare `outline: X` su focus-visible → crea "double ring" visivo. Outline deve essere tonalità diversa dal border (#0F4C81 border → outline #0B3A63 brand-700 + offset 3px). Alternativa equivalente: inversione (#FFFFFF outline per elementi scuri), ma rompe single-accent discipline.
- "Bestia mode" = palette unita + 1 accent solido + sfondi decisi (slate-200 > slate-50). NON è multicolor o max saturation. Bestia = gravitas coerente, non rumore.
- AI-slop color tells sono spesso nel codice DEFAULT (Tailwind amber-400, gradient utilities) — non solo nel design iniziale. Cerca negli utilities che l'AI sceglie per default.

**File modificati**:
- `public/index.html` — 4 edits (logo + badge + favicon + section bg 2 occorrenze) + 1 rimozione live-dot = 5 cambi
- `public/css/landing.css` — 1 edit allowMultiple (2 occorrenze focus visible) + 1 D-fix specifico btn-secondary = 1 cambio netto

## Metriche post-round 4
- Round 0: UI 28, UX 50, Overall 28
- Round 1 (rimozione AI tells): UI 40, UX 52, Overall 44
- Round 2 (editorial minimal): non misurato
- Round 3 (motion + segmented pricing): non misurato
- Round 4 (colori bestia): atteso UI 55-65, UX 62-72. Single-accent + depth slate-200 + status emerald = miglioramento Visual Hierarchy e Color Contrast atteso. Se Visual Hierarchy o Color Contrast rimane Severe, dial-back slate-200 → slate-100.

**Vincolo nuovo per future sessioni**: prima di usare un colore fuori palette (amber/rose/sky/gradient utility default), chiedersi *"è nel Brand System o è Tailwind default?"*. Default Tailwind fuori brand 9-step + slate 5-step = AI-slop. Il verde emerald resta OK solo per badge status positivo, non per altri usi.

## ROUND 5 — BORDERS + SHADOWS + ELEVATION (28/07/2026)

**User feedback dopo round 4**: "bene sono cose piccole però migliora di 1.5x il sito ora fai tipo stili bordi ombre cose del genere". Vuole ricerca profonda prima + applicazione. Pattern utente confermato: bestia mode + "fai tutto insieme".

**Workflow**: Thinker-with-files legge public/index.html + public/css/landing.css + framework SaaS 2025-2026 border/shadow best practices → audit specifico → 4 cambi prioritizzati (B1-B4), applicati tutti in un colpo.

**Modifiche applicate**:
- **B1 Sezioni divider ridondanti**: tolto `border-t border-brand-200` da `bg-slate-200` sections (Come Funziona + Prezzi). Alt bg già fornisce il taglio netto (white→slate-200→white→slate-200). Il border aggiuntivo era slop visivo. **Perché** resta col border perché è su white bg (white→white invisibile senza border esplicito).
- **B2 Shadow-sm sulle card descrittive**: aggiunto `shadow-sm` (Tailwind built-in `0 1px 2px rgb(0 0 0 / 0.05)`) alle 6 card descrittive (3 li in Come Funziona + 3 div in Perché). Crea gerarchia depth 3-tier: section bg → cards (shadow-sm) → Pro pricing (shadow-card). Foundation → content → cta.
- **B3 Sticky mobile CTA radius normalization**: `rounded-2xl` → `rounded-xl`. Gerarchia radius: btn = xl (12px), cards = 2xl (16-24px), pill (rounded-full) solo per badge/elementi rotondi. Sticky mobile è ancora un button → xl.
- **B4 Savings badge anti-dissonance**: tolto `ring-2 ring-brand-600` (anello BLU su bg VERDE = dissonanza multi-color). Sostituito con `border-2 border-emerald-300` (su emerald-100 bg + emerald-300 border = on-theme). 2px + emerald-300 invece di 1px + emerald-200 per scelta bestia (più "punchy"). emerald-300 #6EE7B7 ha contrast decente vs emerald-100 #D1FAE5 (visibile chiaramente come border).

**Decisione chiave su B4**: thinker propose `border border-emerald-200` (subtle, 1px), ma utente vuole bestia mode → escalation a `border-2 border-emerald-300`. emerald-200 vs emerald-100 sarebbe stato troppo simile (border quasi invisibile). emerald-300 mantiene l'emerald theme ma aggiunge definition visibile.

**Decisione su B1**: rimozione border NON applicata uniformemente a tutte le sezioni. Logica condizionale:
- bg alternato (white↔slate-200 ↔ white↔slate-200) → border non serve, bg è divider
- bg stesso colore (white→white) → border serve, altrimenti transizione invisibile
Quindi solo Perché (white bg) mantiene border-t.

**Vincolo nuovo per future sessioni**: prima di aggiungere border-t tra sezioni, verificare se c'è alternanza cromatica di background (es. white↔slate-200). Se sì, il border è ridondante (anti-slop). Default = no border-t, aggiungi solo se bg non cambia.

**File modificati**: 
- `public/index.html` — 5 str_replace (B1 allowMultiple 2 sezioni, B2 li/div allowMultiple 6 cards totale, B3 sticky btn, B4 savings badge). Niente modifiche al CSS esterno — tutto Tailwind utilities pure.
- `public/css/landing.css` — invariato. round 5 non tocca shadow/ring custom.

## Metriche post-round 5
- Round 0: UI 28, UX 50, Overall 28
- Round 1 (rimozione AI tells): UI 40, UX 52
- Round 2 (editorial minimal): non misurato
- Round 3 (motion + segmented pricing): non misurato
- Round 4 (colori bestia): push-ready, non misurato
- Round 5 (borders + shadows bestia): atteso UI 60-70, UX 65-75. Bestia mode = 3-tier depth hierarchy, single-radius hierarchy, on-theme border coherence.

## ROUND 5.5 — FOLLOW-UP REFINEMENTS (28/07/2026)
**Code-reviewer del round 5 ha dato 2 improvement note**. Le applico entrambe per allineare al bestia mode dichiarato:

- **B1 follow-up (1-line)**: rimuovere anche `border-t border-brand-200` da Perche' section. Adesso tutte e 3 le sezioni di transizione (CF, Perche', Prezzi) gestite SOLO da bg alternation. Hero→CF: white→slate-200 (color only); CF→Perche': slate-200→white (color only); Perche'→Prezzi: white→slate-200 (color only). Zero border-t residui = rhythm pulito.
- **C escalation (6-line)**: cards descrittive shadow-sm → custom brand-tinted shadow `shadow-[0_2px_4px_rgba(15,76,129,.06)]`. Tailwind arbitrary value: underscores→spaces. Risultato: depth custom 2px blur + rgba(.06) = piu' "punch" del neutral shadow-sm, ma ancora restraint (anti-slop). Single-accent discipline: shadow tinta brand coerente col palette. Gerarchia finale: section bg < cards brand-tinted shadow < Pro card brand-tinted shadow-card (.12). 3-tier depth, tutto in palette.

**Lesson future sessioni**: quando rimuovi border-t da sezioni per rhythm, controlla TUTTE le transizioni white<->colored che possono avere border. Logica condizionale: bg cambia → border inutile. Stesso colore → border serve. Asimmetria = slop; uniformity = bestia. Quando scegli shadow, preferisci tinta-brand su shadow-neutral-gray se vuoi cohesion; shadow-sm default (neutral) e' valido ma meno espressivo.

## Metriche post-round 5.5
- Round 5 + B1-followup + C-escalation: atteso UI 62-72, UX 67-77. Asimmetria Perche' eliminata = rhythm uniforme. Shadow brand-tinted invece di neutral = single-accent compliance piena. Edge case designmeter: B asymmetria era forse 1-2 punti penalizzante ora tolto; C escalation aggiunge 1-3 punti su Visual Hierarchy per via di depth piu' "punchy".

## ROUND 5.6 — PERCHE' WHITE-ON-WHITE FIX (28/07/2026)

**Code-reviewer del round 5.5 ha trovato 1 issue reale**: section Perche' bg=white + cards Perche' bg=white = ZERO bg contrast interno. Cards di Perche' dipendevano solo da border-brand-200 1px + custom shadow opacity .06 per essere visibili. CF cards hanno slate-200 bg che li definisce naturalmente. Asimmetria di gerarchia visiva interna.

**Decisione chiave**: aggiungere `bg-brand-50` (#F7FBFF, ultra-light bluish white) alla section Perche'. Subtle ma sufficiente per dare contrasto alle 3 cards bianche interne. Mantiene single-accent discipline (brand-blue family), non introduce slate neutral.

**Alternativa non applicata**: bg-slate-50 (Tailwind #F8FAFC). Reviewer l'ha proposta come "piu' neutrale, non tira dentro il brand blue family". Scelta = brand-50 per coerenza con palette unita (single-accent discipline ha gia' eliminato slate neutrals fuori dai separatori di sezione forti).

**Rhythm finale page**: Hero (white) → Come Funziona (slate-200) → Perche' (brand-50, ultra-subtle blue) → Prezzi (slate-200) → Footer (white). 5-tone alternation con visual rhythm: hero white → slate-200 (strong) → brand-50 (subtle) → slate-200 (strong) → footer white. Asimmetria interna a Perche' eliminata = cards visible senza dipendere 100% da border+shadow.

**File modificati**: public/index.html — 1-line add (bg-brand-50 alla section #perche).

## Metriche post-round 5.6
- Round 5.5 + 5.6: atteso UI 65-75, UX 68-78. Asimmetria risolta. Cards visibility garantita da bg-contrast interno (white-on-brand-50). Shadow .06 resta restraint ma rinforzata da bg-context.
- Se dopo push utente segnala "cards sembrano piatte": escalation shadow a .10 (1-line x 6 cards, multi-line apply).

## ROUND 5.7 — PERCHE' BG REVISED TO bg-slate-200 (28/07/2026)

**Code-reviewer del 5.6 ha trovato problema reale**: `bg-brand-50` (#F7FBFF) vs white (#FFFFFF) ha contrast ratio ~1.04:1 = praticamente invisibile. Il "fix" per il problema white-on-white di Perche' in realta' non risolveva nulla — cards ancora dipendenti 100% da border + shadow opacity .06. Anche slate-50 (#F8FAFC) ha lo stesso problema (1.05:1 vs white).

**Decisione chiave**: invece di incrementali sub-1.1:1 che sembrano fix ma non lo sono, andare dritti a `bg-slate-200` per la section Perche', matchando CF e Prezzi. Risultato: le 3 content sections (CF, Perche', Prezzi) diventano un "CONTENT BLOCK" unificato su gray.

**Rationale bestia-mode**:
- Bg-contrast cards-bg-white vs section-bg-slate-200: 1.5:1 (vs 1.04:1 del brand-50 precedente) = cards hanno finalmente contesto bg reale, non solo border+shadow.
- Single-accent discipline: bg-slate-200 e' gia' usato da CF e Prezzi (no new color introdotto). Slate-200 + brand 9-step + emerald status = palette unita.
- Istituzionale/gravitas: layout "hero white frame → content body unified gray → footer white frame" = stile Linear/Stripe docs/Government documents. Boldest design move nel bestia mode.
- Trade-off accettato: rinuncia 5-tone bg rhythm alternation (era "white-slate-white-slate-white") per "white-gray-gray-gray-white" piu' audace. 2-tone rhythm page-level invece di 5-tone.

**Asimmetria risolta completamente**: Hero (white) → CF (slate-200) → Perche' (slate-200) → Prezzi (slate-200) → Footer (white). 3 content sections tutte gray. Cards tutte con bg-contrast reale 1.5:1. Bg-alternation ON SOLO ai boundaries (hero/CF + Prezzi/footer). Niente contrast ambiguo.

**Lesson importante per future sessioni**: quando "fissa" un problema di bg-contrast con toni piu' scuri dello stesso hue MA il fix risulta sub-1.1:1 vs target, e' inutile (visivamente indistinguibile). Meglio andare diretto a un bg con contrast dimostrato (es slate-200 1.5:1 > white) invece di sfumature incremental. "Subtle" non significa "imperceptible".

**File modificati**: public/index.html — 1-line replace `bg-brand-50` → `bg-slate-200` nella section Perche'.

## Metriche post-round 5.7
- Round 5 finale: atteso UI 65-75, UX 68-78. Round 5 + 5.5 + 5.6 + 5.7 = ascisse compiute:
  - B1 rimuove section dividers ridondanti.
  - B2 shadow-sm cards hierarchy.
  - B3 button radius xl unificato.
  - B4 savings badge border emerald on-theme.
  - C cards custom brand-tinted shadow (instead of neutral).
  - B1-followup rimuove anche Perche' border-t per rhythm uniformity (turn out non necessario perche' ora Perche' bg unificato).
  - 5.6 Perche' bg-brand-50 SUPERSEDED da 5.7 Perche' bg-slate-200.
- Effetto netto atteso: gestalt pages molto piu' integrato. CF+Perche'+Prezzi = unified content block gray. Cards finalmente definite da bg-contrast reale. Bestia mode pieno.

## ROUND 5.8 — CARDS SHADOW ESCALATION FINALE (28/07/2026)

**Code-reviewer del 5.7 ha sollevato "potential monotony issue"**: le 3 content sections tutte bg-slate-200 = sezioni senza differenziazione di bg. Cards dentro hanno bg-contrast 1.24:1 vs section ma sono visivamente "uguali" tra CF e Perche' (stessa struttura, stesso shadow). Visibilita' migliorabile.

**Decisione chiave**: rimanere sul perimetro del round 5 (borders + shadows + elevation) = ESCALATION CARDS SHADOW. Niente nuovi colori, niente eyebrow testuali (typo esula dal perimetro), niente bg alternation reversal (5.6 path fallito).

**Modifica applicata**:
- 6 cards (3 li CF + 3 div Perche'): `shadow-[0_2px_4px_rgba(15,76,129,.06)]` → `shadow-[0_4px_14px_rgba(15,76,129,.10)]`
  - 2px → 4px offset (piu' drop)
  - 4px → 14px blur (piu' diffusion = card piu' "sollevata")
  - 6% → 10% opacity (piu' presente ma ancora restraint)
- Risultato: cards finalmente "punchano" vs section bg slate-200.
- 3-tier depth hierarchy REALE:
  - Section bg slate-200 (piano base)
  - Cards descrittive shadow .10 (lift minore)
  - Pro card shadow-card .12 (lift forte, anchor)
- Designmete Visual Hierarchy: "cards hanno definizione chiara, Pro card emerge come primary action". Atteso +3-5 punti.

**Trade-off accettati**:
- Monotony bg non risolta (3 sections tutte slate-200) ma cards visibilita migliorata. Solution via depth, non via bg-tone.
- Cards shadow .10 ancora Brand-tinted single-accent (rgba(15,76,129,...)): palette compliance 100%.

**Alternative scartate explicitamente**:
- Eyebrows testuali ("IL METODO" / "IL VANTAGGIO" sopra h2): sarebbero typography, esulano dal perimetro "borders + shadows + elevation".
- Bg alternation slate-100/slate-200/slate-200: 5.6 path fallito (slate-100 vs white 1.09:1 invisibile), reversal sarebbe re-introduzione failure.
- Bg brand-tinted su Perche' (bg-brand-50): 5.6 stesso path = 1.04:1 invisibile. NO.

**File modificati**: public/index.html — 6 str_replace allowMultiple (3 li CF + 3 div Perche').

## Metriche post-round 5.8 finale
- Round 0: UI 28, UX 50, Overall 28
- Round 1 (rimozione AI tells): UI 40, UX 52
- Round 2 (editorial minimal): non misurato
- Round 3 (motion + segmented pricing): non misurato
- Round 4 (colori bestia): push-ready, non misurato
- Round 5-5.8 (borders + shadows + depth completo): atteso UI 68-78, UX 72-82. Cards depth escalation finale chiude il perimetro borders/shadows/elevation. Component stack completo: section bg < cards (.10) < Pro card (.12). Single-accent compliance mantenuta. Bestia mode pieno.

**Push-ready finale**: dopo 5.8 il round 5 (borders + shadows + elevation) e' completo. Prossima iterazione naturale: typography round (eyebrows, h2 weights, prose rhythm) o interactivity round (button micro-anim, hover state art direction).

## ROUND 6 — BIG VISUAL EFFECTS (28/07/2026)

**User feedback critico dopo 5.8**: "hai solo peggiorato i colori, non hai fatto ombra stili bagliore grandezze effetti animazioni". L'utente vuole IMPATTO VISIVO GRANDE, non micro-tweak timid. Cambio direzione radicale.

**Workflow**: Thinker-with-files ha letto lo stato corrente + pianificato 6 modifiche coordinate in bestia mode. Output = 6 cambi specifici con codice esatto. Applicati 12 cambi totali (6 HTML + 6 CSS) + 2 micro-fix reviewer = 14 modifiche totali.

**Modifiche HTML (6) public/index.html**:
1. **Tailwind config**: aggiunto `elevated: '0 40px 100px rgba(15,76,129,.18)'` in theme.extend.boxShadow.
2. **H1 escalation**: text-4xl/5xl/6xl → text-5xl/6xl/7xl + font-semibold → font-bold + leading-[1.1] → leading-[1.05]. Hero H1 ora DOMINA.
3. **Hero btn-primary**: aggiunto `hero-cta-pulse` class + size `px-7 py-4 text-base` → `px-8 py-5 text-lg`. Solo HERO (NON navbar/sticky/prezzi-Annuale).
4. **Hero btn-secondary**: size escalation come sopra.
5. **6 cards tactile-card**: aggiunto classe a 3 <li> in CF + 3 <div> in Perché (allowMultiple).
6. **Pro card shadow-elevated**: `shadow-card` → `shadow-elevated` (100px blur .18 = altare visivo).

**Modifiche CSS (6) public/css/landing.css**:
7. **btn-primary resting shadow**: `0 2px 8px (.18)` → `0 4px 14px (.25)`. Bottone "salta" dalla pagina gia' al resting.
8. **btn-primary:hover**: `translateY(-1px)` → `translateY(-3px)`, shadow `0 10px 24px (.32)` → `0 16px 40px (.35)`. Effetto gravitazionale reale.
9. **btn-primary:focus-visible**: aggiunto box-shadow `0 0 0 8px rgba(11,58,99,.20)` (focus glow brand-700 con alpha 20%).
10. **btn-secondary:focus-visible**: stesso glow.
11. **Blocco .tactile-card**: nuova classe con transition `.4s cubic-bezier(.16,1,.3,1)` (spring iOS/Stripe). Hover: translateY(-4px) + 2-layer shadow `0 20px 40px .12 + 0 8px 16px .06`. Active: translateY(-1px) + shadow compresso (micro-fix E applicato).
12. **@keyframes subtle-pulse + .hero-cta-pulse**: scale 1 → 1.02 → 1, 4s ease-in-out infinite (ultra-slow breathing). Reduced-motion block aggiornato.

**Code-reviewer post-round**: verdict push-ready + 2 micro-fix opzionali. Entrambi applicati:
- **E pressed feedback**: `.tactile-card:active` shadow compresso `0 1px 4px rgba(15,76,129,.08)` (vs default `0 4px 14px .10`) = vera feedback "pressed".
- **E-bis CSS self-containment**: `.tactile-card` block ora ha box-shadow default nel CSS, non dipende piu' da inline class. Inline `shadow-[...]` su 6 cards ora ridondante ma harmless.

**Risultato netto**: hero dominato da H1 7xl + 2 CTA oversize con shadow dramatic + focus glow + pulse breathing 4s. Cards "vive" con hover tattile 4px lift + 2-layer shadow + pressed feedback compresso. Pro pricing ha elevazione 100px blur = altare della pagina.

**Bestia mode discipline mantenuta**:
- Single-accent: tutti i nuovi effetti usano rgba(15,76,129,...) = brand-600 con alpha + rgba(11,58,99,...) = brand-700 con alpha. ZERO nuovi hex.
- prefers-reduced-motion rispettato per .tactile-card, .hero-cta-pulse, .savings-badge.
- No neon glow (no #00FF66), no glassmorphism pesante, no bouncy cartoon animations. Spring bezier (.16,1,.3,1) = iOS/Stripe feel.
- Hero CTA pulse scale 1.02 = breathing sobrio, NON bounce.

**Lezione fondamentale per future sessioni**: bestia mode = fare cose con IMPATTO VISIVO REALE, non micro-tweak timid.
- Hero H1 sempre >= text-5xl base / text-7xl lg.
- Hero CTA sempre px-8 py-5 minimum.
- btn-primary resting shadow sempre >= 4px blur .25 alpha.
- btn-primary:hover lift sempre >= 3px.
- Cards con interactive hover devono avere .tactile-card class (4px lift + 2-layer shadow).
- Focus state sempre con GLOW (box-shadow) oltre a outline.

## Metriche post-round 6
- Round 0: UI 28, UX 50
- Round 1 (AI tells removal): UI 40, UX 52
- Round 4 (colori bestia): atteso UI 55-65
- Round 5 (borders + shadows): atteso UI 60-70
- Round 5.8 (cards shadow escalation): atteso UI 65-75
- **Round 6 (BIG VISUAL EFFECTS): atteso UI 72-85, UX 75-85**. Hero dominance + tactile cards + dramatic CTA shadow + focus glow = impatto visivo finalmente al livello che l'utente chiedeva da 2 round.

**File modificati**:
- public/index.html — 6 modifiche (tailwind config +1 token, H1 +1, hero buttons +2, cards tactile-card x 6 allowMultiple, Pro card +1)
- public/css/landing.css — 6 modifiche + 2 micro-fix reviewer = 8 cambi totali
