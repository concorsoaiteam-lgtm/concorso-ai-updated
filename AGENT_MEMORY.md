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
