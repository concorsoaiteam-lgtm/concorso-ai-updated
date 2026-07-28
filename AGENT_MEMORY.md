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
