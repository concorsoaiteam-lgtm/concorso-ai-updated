# Slop Registry — ConcorsoAI

> Lista dei pattern "AI-generated" trovati nel codice di ConcorsoAI e cosa è stato fatto per rimuoverli.
> Aggiornato: 28 luglio 2026.
> Framework di riferimento: `design-taste-frontend` v3 + ricerca anti-slop 2026.

## Cosa è stato rimosso (round del 28/07/2026)

| # | Pattern AI-slop | File / Riga | Cosa è stato fatto |
|---|----------------|-------------|---------------------|
| 1 | Numeri giganti decorativi `01 / 02 / 03` (text-7xl text-white/10 absolute) | `public/index.html` righe 421, 433, 445 | Rimossi completamente |
| 2 | `section-eyebrow` su 5 sezioni ("IL PROBLEMA", "PRIMA / DOPO", "COME FUNZIONA", "PREZZI", "FAQ") | `public/index.html` righe 350, 379, 414, 466, 542 | Rimossi tutti i 5 `<p>` tag. Regola framework: max 1 ogni 3 sezioni |
| 3 | Micro-labels `text-xs uppercase tracking-[.14em]` ("Setup: 2 minuti", "Domanda dopo domanda", "Sintesi → dettaglio → correzione") | `public/index.html` righe 428, 440, 452 | Rimossi tutti, sono "mock-poetic AI grammar" |
| 4 | `class="glass-card rounded-[2rem]"` wrapper nel hero mockup | `public/index.html` riga 230 | Rimosso glassmorphism. Inner card ora ha il proprio border; wrapper è solo padding |
| 5 | `class="premium-panel"` su 4 articoli (3 Come Funziona + 1 CTA finale) | `public/index.html` righe 420, 432, 444, 601 | Sostituito con `class="reveal relative"` (+ restore bg/border su CTA finale riga 601) |
| 6 | `bg-gradient-to-br from-white to-brand-50` su card PRIMA/DOPO | `public/index.html` riga 394 | Sostituito con `bg-brand-50` solido (no gradient quasi-invisibile) |
| 7 | `rounded-[2rem]` su 2 card | `public/index.html` righe 230, 601 | Convertito a `rounded-2xl` (16px) come da framework |
| 8 | `shadow-glowBlue` token nella tailwind.config | `public/index.html` sezione tailwind.config | Rimosso completamente. Non più referenziato |
| 9 | Em-dash `—` in copy visibile | `public/index.html` righe 304, 342, 567, 591, 604 | Sostituiti con `:`, `.`, o parentesi. Framework dice è "single most-violated Tell" |

## Cosa resta ancora da fare (round futuri)

| # | Pattern AI-slop | File / Riga | Cosa va fatto |
|---|----------------|-------------|---------------|
| 1 | `reveal` class usato 20+ volte (animazione fade-in) — è di per sé AI grammar (animazione fade-in su tutto uguale) | `public/index.html` (multipli) | Valutare se serve davvero, ridurre a 2-3 sezioni chiave |
| 2 | `card-hover` x3 — border-color che cambia al hover (animazione AI-default) | `public/index.html` 356, 361, 366 | OK, animazione semplice |
| 3 | `tracking-[-0.045em]` su H1 e `tracking-[-0.035em]` su H2 | multi | OK, è tracking-tight legittimo (Inter/Geist standard) |
| 4 | Hero con badge "Fatto in Italia" centrato in alto | `public/index.html` 198 | Da valutare — potrebbe rimanere come trust signal onesto |
| 5 | `text-gradient` su "commissario AI" nel H1 | `public/index.html` 204 | `text-gradient` usa gradient blu-petrolio → brand. È nel palette, OK |
| 6 | Mockup chat simulato nel hero | `public/index.html` 230-263 | Refactor: usare screenshot reale quando possibile |
| 7 | Dashboard e simulation.html non ancora controllate / pulite | `public/dashboard.html`, `public/simulation.html` | Round 2: replicare lo stesso filtro |

## Statistiche

- **Rimozioni applicate**: 9 categorie, ~22 occorrenze nel codice
- **File modificati**: solo `public/index.html` (più `slop-registry.md` + futuro AGENT_MEMORY.md update)
- **File NON toccati**: `dashboard.html`, `simulation.html`, `auth.html`, CSS files, API
- **Stima impatto designmeter**: da 28/46 → 40-55/100 (rimozione AI tells senza introdurre nuovi elementi è il pattern più sicuro)

## Anti-pattern che NON introduco

- Pillola "✨ NEW VERSION" sopra l'H1 — bandita
- Carousel testimonial finti — bandita (non ci sono ancora utenti)
- Trust logos in SVG statici senza fonte — bandita (nessun cliente reale)
- Em-dash nel copy — bandita in body, headline, button, FAQ
- Numeri giganti decorativi — banditi
- Gradient blu-viola — banditi
- Glassmorphism come default — bandito (solo focus rings legittimi)
- Mockup chat finta come screenshot — bandita (usare screenshot reale o rimuovere)
