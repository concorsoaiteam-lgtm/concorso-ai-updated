# Slop Registry — ConcorsoAI

> Pattern "AI-generated" rimossi da ConcorsoAI. Aggiornato: 28 luglio 2026.
> Framework di riferimento: `design-taste-frontend` skill v3 + ricerca anti-slop 2026.

## Direzione attuale: **Editorial Minimal**

Dopo il primo round di rimozioni (28/07 round 1) il punteggio designmeter è salito da 28/50 a 40/52 (+12 UI). Ma erano ancora flaggati come critici: Visual Hierarchy, Typography, Friction Points (peggiorato), Conversion Clarity.

**Causa strutturale**: la pagina aveva 8 sezioni, 5 CTA con stesso intento, mockup chat finta nell'hero. Era un "AI anti-slop style done wrong" — togliere i tells superficiali non bastava.

**Round 2 (questo)**: riscrittura editoriale minimal. 4 sezioni, 1 CTA primaria chiara, niente mockup, niente CTA duplicati, 0 micro-labels, 0 em-dash, 0 floating decorative numbers.

## Cosa contiene ora `public/index.html`

| Sezione | Tipo | CTA presenti |
|---------|------|--------------|
| 1. NAVBAR | sticky-minimal | "Prova gratis" (navbar) |
| 2. HERO | centered, niente mockup | "Prova gratis: 3 simulazioni" (primaria), "Scopri come funziona ↓" (link testuale) |
| 3. COME FUNZIONA | centered + 3 cards inline | Nessuna CTA — solo testo + numeri 1/2/3 piccoli |
| 4. PREZZI | 2 card (Free / Pro) | Free: "Inizia gratis" (secondary button). Pro: "Passa a Pro →" (primary button) |
| 5. FOOTER | trust strip + link | Nessuna CTA, solo link a Termini/Privacy/Accedi |
| Sticky mobile CTA | always visible below 768px | "Prova gratis: 3 simulazioni" |

**Totale CTA con intento SIGNUP**: 4 (navbar, hero, prezzo Pro, sticky mobile). Prima erano 5+ con copy vagamente diverse. Accettabile: navbar e sticky sono entry-point "above the fold", hero è il primary CTA in pagina, prezzi-pro è la conversion finale. Non è decision fatigue.

## Cosa è stato rimosso rispetto al precedente

- ❌ Hero mockup chat finta (`glass-card + div-based mockup`)
- ❌ Sezione "IL PROBLEMA" (3 cards ansia/paura/solitudine)
- ❌ Sezione "PRIMA / DOPO" (confronto con bando gradient-to)
- ❌ Sezione demo video (era placeholder)
- ❌ Sezione FAQ (4 domande — sostituita da FAQPage structured data)
- ❌ Micro-eyebrow tracking-[.18em] uppercase (5 sezioni)
- ❌ Numeri "01/02/03" floating text-7xl (decorativi)
- ❌ Classi `glass-card`, `premium-panel`, `card-hover`, `reveal`, `text-gradient` ad alta saturazione
- ❌ Em-dash `—` in tutto il copy
- ❌ Token `glowBlue` dalla tailwind config
- ❌ Animazione pageFade globale
- ❌ Hero con CTA shadow fisica aggressiva

## Cosa è stato preservato

- **Tailwind palette**: brand (blu petrolio) + ink (testo)
- **Tailwind font**: Geist + Geist Mono
- **iOS safe-area** per sticky mobile CTA
- **Schema.org JSON-LD** per SoftwareApplication + FAQPage
- **Open Graph tags** completi
- **Canonical link** a dominio principale
- **Italian copy onesta**: prezzi veri (€0, €12.99, €0.43/giorno), trust signals (Cifratura UE, Made in Italy, Nessuna carta), nessun numero inventato
- **Pricing logic matematica**: €0.43/giorno calcolato da €12.99/30, €119/anno reale

## File toccati

- ✅ `public/index.html` — riscritto completo (da ~700 a ~290 righe, -59% lines)
- ✅ `public/css/landing.css` — pulito (da ~190 a ~50 righe, -74%): solo btn-primary, btn-secondary, reduced-motion

## File ancora da processare (round futuri)

- ⏸️ `public/dashboard.html` — 1288 righe, probabile stesso pattern slop
- ⏸️ `public/simulation.html` — 1998 righe, probabile stesso pattern slop
- ⏸️ `public/auth.html` — 601 righe
- ⏸️ `public/blog.html`, `public/history.html`, `public/pricing.html`, `public/terms.html`, `public/privacy.html` — secondarie

**Decisione pending al prossimo round**: replica lo stesso pattern (rimozione AI tells SEMPLICI prima, poi se serve rewrite editorial).

## Anti-pattern che NON introduco

- Pillola "✨ NEW VERSION" sopra l'H1 — bandita
- Carousel testimonial finti — bandita (non ci sono ancora utenti)
- Trust logos SVG senza fonte reale — bandita
- Em-dash `—` nel copy — bandita
- Numeri giganti decorativi "01/02/03" floating — banditi
- Gradient blu-viola decorativi — banditi
- Glassmorphism come default — bandito
- Mockup chat finta come screenshot — bandita
- **Decisione nuova**: CTA con stesso intento più di 2 volte nella stessa pagina — bandito
