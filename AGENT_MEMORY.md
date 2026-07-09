# AGENT MEMORY — ConcorsoAI

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
