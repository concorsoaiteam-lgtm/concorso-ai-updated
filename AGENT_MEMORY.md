# AGENT_MEMORY.md — ConcorsoAI

> **File di memoria contestuale per agenti AI** (Buffy, Claude, ecc.).
> **Leggilo SEMPRE per primo** all'inizio di ogni nuova conversazione su
> questo progetto. Aggiornalo ogni volta che cambia qualcosa di strutturale
> (nuovo servizio, nuova endpoint, nuova convenzione).

---

## 1. Il progetto in 30 secondi

- **Cos'è**: SaaS italiano che simula l'esame orale dei concorsi pubblici
  con un commissario AI.
- **Flusso utente**: landing → registrazione/login (Supabase Auth) → upload
  bando PDF (Supabase Storage/RAG) → simulazione orale in chat con
  feedback live → summary punteggi.
- **Pubblico**: candidati a concorsi pubblici in Italia.
- **Mercato-target** (landing): "500.000+ candidati".

---

## 2. Stack tecnico — dove vivono le cose

| Pezzo                         | Dove / Come                                       | Note chiave                                |
|-------------------------------|---------------------------------------------------|--------------------------------------------|
| HTML/CSS/JS (UI)              | `public/*.html` (uno per pagina)                  | Vanilla puro. **NO** build system.          |
| Tailwind CSS                  | CDN `cdn.tailwindcss.com`                         | Config custom `brand-*` palette in ogni HTML |
| GSAP                          | CDN `gsap@3`                                      | Reveal, stagger, `expo.out`, `back.out`    |
| Supabase JS v2                | CDN `@supabase/supabase-js@2`                     | Auth + DB (bandi/chunks/simulazioni)        |
| PDF.js                        | CDN `pdfjs-dist@3.11`                             | Estrazione testo PDF solo lato client       |
| Backend AI                    | `api/chat.js` (Vercel Serverless, **Node 20**)    | Proxy verso BluesMinds, dual-mode SSE/JSON  |
| Storage dati                  | Supabase Postgres                                 | Tabelle: `bandi`, `chunks`, `simulazioni`   |
| LLM upstream                  | BluesMinds (`https://api.bluesminds.com/...`)     | Modello **forzato** server-side a `deepseek-v4-flash` |
| Deploy                        | Vercel — `outputDirectory: public`                | HTML statici + function serverless          |
| Routing URL puliti            | `vercel.json` rewrites                            | `/dashboard` → `/dashboard.html` ecc.       |
| **Niente CSS esterno**        | Tutto `<style>` inline nei singoli HTML            | MAI creare file `.css` separati            |
| **Niente bundler**            | Nessun `webpack`, `vite`, ecc.                    | MAI proporre di aggiungerlo                |

---

## 3. Convenzioni DA NON ROMPERE

- **NO build system, NO bundler, NO framework JS** (niente React/Vue/Svelte).
- **NO file CSS esterno**: tutto inline in `<style>` per pagina.
- **Offuscamento chiavi Supabase**: SEMPRE pattern `.join('')` con prefisso
  `sb_publishable_` per le anon key. MAI hardcodare la stringa intera.
- **Italiano con accenti propri** sempre: `è, à, ò, ù, ì`. MAI `e', a'`.
- **`font-variant-numeric: tabular-nums`** su timer/punteggi/feedback
  numerici.
- **`@media (prefers-reduced-motion: reduce)`** su TUTTE le animazioni.
- **`aria-*`** su tutti gli elementi interattivi (pulsanti, tab, link).
- **Palette `brand`** definita come custom color Tailwind in ogni HTML
  (vedi sezione `<script>tailwind.config = ...` in auth.html per tokens
  completi).
- **CSS custom properties**: usare `var(--bg)`, `var(--text)`, ecc. quando
  si vuole un design token riutilizzabile.
- **Try/catch SEMPRE** su chiamate Supabase, con `console.warn` come
  fallback soft.
- **Commenti nel codice**: italiano sintetico per i `.js` runtime, inglese
  per log/debug se preferisci.

---

## 4. Mappa rapida: "voglio fare X → quale file tocco"

| Obiettivo                                                  | File da aprire                                       |
|------------------------------------------------------------|------------------------------------------------------|
| Cambiare copy/testo della landing                          | `public/index.html`                                  |
| Cambiare flusso login o registrazione                      | `public/auth.html` (sezione `<script>` inline)       |
| Cambiare dashboard (stats, upload PDF, onboarding)        | `public/dashboard.html`                              |
| Cambiare la simulazione orale (UI, fasi, GSAP)             | `public/simulation.html`                             |
| Cambiare il system prompt del commissario AI               | `public/simulation.html` → funzione `buildSystemPrompt()` |
| Cambiare regole/limiti/messaggi del backend `/api/chat`    | `api/chat.js`                                        |
| Cambiare come si inietta il Bearer token nelle fetch       | `public/auth-patch.js`                               |
| Cambiare URL puliti (`/dashboard`, `/auth`, `/simulation`) | `vercel.json`                                        |
| Cambiare i colori del brand                                | Tailwind config in TUTTI i 4 HTML + `:root` nei CSS   |
| Cambiare animazione typewriter/reveal delle bolle           | `public/auth-patch.js` (CSS inject) + GSAP in `simulation.html` |
| Aggiungere una nuova pagina statica                        | Crea nuovo `public/*.html` + aggiungi rewrite in `vercel.json` |
| Aggiungere una nuova API endpoint                           | Crea `api/<nome>.js` (CommonJS handler `(req, res)`) |

---

## 5. Architettura logica della simulazione

```
Config Phase → Briefing → Simulation Phase → Summary Phase
```

1. **Config**: utente sceglie bando/i, difficoltà, durata.
2. **Briefing**: animazione "Preparazione commissione" (3 step GSAP con
   progress bar).
3. **Simulation**: chat con commissario AI in streaming + 3 barre
   feedback live (`Chiarezza`, `Struttura`, `Contenuto`, ognuna 0–10).
4. **Summary**: punteggi finali, tempo usato, bottone retry.

### System prompt del commissario (in `simulation.html`)

- Output JSON fisso: `{"messaggio": "...", "feedback": {...}, "tipo": "..."}`.
- Apertura SEMPRE: "Buongiorno." poi prima domanda.
- Lingua: italiano formale, NO emoji.
- Colori feedback: Rosso `<5`, Blu `5–7`, Verde `>7`.

### Flusso streaming AI end-to-end

```
avviaCommissario()
  → mostraThinking()
  → chiamaCommissario(messaggi, config)   // GET override da auth-patch.js window.fetch
  → POST /api/chat con stream:true
  → SSE forwards dell'upstream BluesMinds
  → estraiMessaggioDaStream(): pulisce JSON realtime
  → bolla con animazione commBubbleReveal (clip-path 0.7s)
  → feedback bars con GSAP expo.out
```

---

## 6. Auth: come funziona davvero

- **Login/registrazione** → Supabase Auth (`auth.html`).
- **JWT** salvato in `localStorage` con chiave `sb-<projectref>-auth-token`.
- **`/api/chat` richiede** header `Authorization: Bearer <jwt>`.
- **L'iniezione automatica è in `public/auth-patch.js`**: wrappa
  `window.fetch` aggiungendo il Bearer su qualunque POST a `/api/chat`.
- **NON aggiungere Authorization a mano** nel codice di `simulation.html`:
  il wrapper lo fa già. Aggiungerlo due volte provoca solo confusione.

---

## 7. Cose delicate (si rompono facilmente) ⚠️

- **`api/chat.js` v3 ha DUE MODALITÀ** (vedi sezione `wantsStream`):
  - `stream: true` → SSE in tempo reale (usato da `chiamaCommissarioStream`).
  - `stream: false` o assente → bufferizza SSE upstream e ritorna un
    singolo JSON OpenAI-compat (legacy).
- **Rate limit**: 30 richieste/min per IP (Map con sweep ogni 60s).
  Attenzione a `vercel warm instances` ⇒ Map potrebbe persistere.
- **Typewriter fallback**: se in DevTools vedi
  `console.debug('[ConcorsoAI] typewriter wiring fallback: ...')`, allora
  l'override di `chiamaCommissario` in `auth-patch.js` non è andato a
  buon fine e la simulazione usa il vecchio path non-stream.
- **`simulation.html` ha `html, body { overflow: hidden }`**: serve per
  evitare la doppia scrollbar insieme a
  `.sim-phase { height: 100vh }` + `.chat-area { overflow-y: auto }`.
  Se cambi layout, **rispetta questa regola** o romprai la UX Claude-style.
- **`PDF.js` worker**: l'estrazione PDF nella dashboard richiede che
  il worker sia caricato correttamente. Se cambi `pdfjsLib.GlobalWorkerOptions.workerSrc`,
  testalo su un PDF reale.
- **CORS whitelist in `api/chat.js`** (`ALLOWED_ORIGINS`): se aggiungi un
  dominio custom, ricordati di aggiornare la lista.
- **`SUPABASE_URL` HA fallback hardcoded** in `api/chat.js`,
  **`SUPABASE_ANON_KEY` NO** (fail-closed). Se cambi progetto Supabase,
  aggiorna entrambi (env var + fallback hardcoded solo per URL).

---

## 8. Variabili d'ambiente Vercel (obbligatorie)

| Chiave               | Obbligatoria | Fallback hardcoded?                            | Dove recuperare                      |
|----------------------|--------------|-----------------------------------------------|--------------------------------------|
| `BLUESMINDS_API_KEY` | SÌ           | ❌ (→ 500)                                      | Console BluesMinds (rotational)       |
| `SUPABASE_ANON_KEY`  | SÌ           | ❌ (→ 500 fail-closed)                          | Supabase → Settings → API (`anon`)   |
| `SUPABASE_URL`       | consigliata  | ✅ `https://xhifnparcouxsypkjcmn.supabase.co` | Supabase → Settings → API            |

> **Fail-closed**: senza `ANON_KEY` o `BLUESMINDS_API_KEY` → 500 su
> **QUALSIASI** chiamata `/api/chat`, anche doc `/api/chat` con payload
> valido. Controlla le env PRIMA del primo deploy.

---

## 9. Come mi comporto come agente su questo progetto

### Piano fisso per qualsiasi task non banale

1. **Leggi il contesto rilevante in parallelo**:
   - `file-picker` su directories sconosciute
   - `code-searcher` per pattern specifici (regex, function names)
   - `researcher-docs` / `researcher-web` per librerie/standard
2. **Pianifica con `write_todos`** TUTTI i step, anche piccoli.
3. **Apporta modifiche minimamente invasive**: MAI riscrivere un file
   intero se basta un `str_replace`. MAI toccare cose fuori scope.
4. **Rispetta le convenzioni** sopra, anche se avrei preferito fare
   diversamente. Il "meglio" è quello che sta bene nel progetto.
5. **Dopo le modifiche**:
   - `code-reviewer-minimax-m3` per review del diff
   - Se cambia API/backend, aprire il file e ricontrollare la sintassi
   - Se cambia qualcosa di architetturale (nuova convenzione, nuovo
     servizio, nuovo file shape), **aggiorna questo file**.
6. **Test**: non esiste `npm test`. Valida così:
   - Apri il file HTML nel browser e verifica manualmente.
   - Backend AI: `curl -i -X POST <HOST>/api/chat -H "..." -d '{...}'`
   - UI: usa `browser-use` agent (Chrome DevTools) per verificare
     click, layout, console errors.

### Quando NON fare

- **Non proporre bundler, framework, build system**. Il progetto è
  vanilla apposta.
- **Non proporre CSS file separati**. Sono proibiti per convenzione.
- **Non proporre librerie nuove** senza prima verificare se qualcosa
  esiste già nel progetto (Tailwind/GSAP/Supabase sono già CDN).
- **Non iniettare JWT manualmente** nelle fetch — il wrapper di
  `auth-patch.js` lo fa già.
- **Non usare `set_output`** come Buffy: è riservato ai sub-agent.

### Stile di interazione con l'utente

Questa sezione vale per OGNI agente che lavora su questo progetto.
L'utente preferisce agenti **proattivi, autonomi, concisi**, non agenti
che gli girano mille domande.

- **Decidi tu**: se il contesto del progetto suggerisce una scelta
  ragionevole, falla. Non chiedere per questioni che puoi risolvere da
  solo leggendo i file o applicando le convenzioni sopra.
- **Banditi i `ask_user` multi-select lunghi**: l'utente li percepisce
  come rumorosi e li "perde a fondo pagina" perché il layout della
  CLI li copre. Se proprio devi chiedere qualcosa, **scrivilo come
  testo libero in italiano**: una domanda breve per messaggio, massimo
  due, dirette. Niente radio button, niente "label + description".
- **Conferma SOLO le azioni costose o irreversibili**: `git push`,
  `vercel --prod`, drop di tabelle Supabase, cancellazione di file
  importanti, commit che vanno sul main. Per tutto il resto (modifiche
  locali, refactor, aggiornamenti di doc, install di deps già
  discusse) → fallo e basta.
- **Default pragmatici > domande di design**: se devi scegliere tra due
  pattern equivalenti, prendi quello più semplice/coerente con il
  codice esistente. Non creare un sondaggio.
- **Procedi in parallelo** quando i task sono indipendenti (file-picker,
  code-searcher, ricerche web, basher, browser-use): il throughput
  conta più del "vai passo passo".
- **Concisione nel riepilogo finale**: **una frase** o **3–5 bullet
  corti**. Niente prosa lunga. L'utente vuole sapere subito cosa è
  cambiato, non leggere un report.
- **Scrivi in italiano**, sia tu che i commenti nel codice, a meno che
  non sia materiale ripreso da documentazione ufficiale in inglese.
- **Sub-agent sempre**: usa `spawn_agents` (i "plugin") per context
  gathering, review, test, ricerche. Non fare tutto a mano se puoi
  parallelizzare.

---

## 10. File map (riepilogo)

```
concorso-ai/
├── api/
│   └── chat.js                       ← Backend AI (Node 20, Serverless)
├── public/
│   ├── index.html                    ← Landing (marketing)
│   ├── auth.html                     ← Login / Registrazione / OAuth Google
│   ├── dashboard.html                ← Upload bando, stats, lista simulazioni
│   ├── simulation.html               ← Simulazione orale (cuore del prodotto)
│   └── auth-patch.js                 ← Wrapper fetch + typewriter CSS inject
├── vercel.json                       ← outputDirectory + rewrites URL puliti
├── package.json                      ← 1 sola runtime dep: @supabase/supabase-js (per api/chat.js); frontend tutto CDN
├── .cursorrules                      ← Regole sintetiche per Cursor
├── DOCS.md                           ← Doc tecnica dettagliata (lunga)
└── AGENT_MEMORY.md                   ← QUESTO FILE (memoria agenti AI)
```

`DOCS.md` resta la doc tecnica completa (più lunga). `AGENT_MEMORY.md`
(integrato da questo file) è il quick-reference per le AI. **NON
duplicare**: qui metti solo ciò che serve come "prima lettura" di un agente.

---

## 11. Comandi rapidi di deploy / smoke test

```bash
# Deploy produzione
vercel --prod

# Smoke test: landing pubblica
curl -I https://concorso-ai.vercel.app/

# /api/chat senza auth → atteso 401
curl -i -X POST https://concorso-ai.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ciao"}]}'

# Rollback rapido se qualcosa rompe in prod
vercel rollback
```

Per il flusso e2e completo nel browser (login → carica bando → simula →
typewriter → summary) vedi la sezione "Smoke tests" del vecchio
`DEPLOY.md` (ora rimosso) come reference logica, oppure chiedi all'utente
di riassumertelo.

---

## 12. Differenza frontend vs backend (chiarimento)

- **Frontend (`public/*.html`)**: 100% vanilla + CDN. Zero bundler, zero npm
  install, zero CSS esterno. Tutto quello che serve sta già nei link CDN.
- **Backend (`api/chat.js`)**: CommonJS, gira su Vercel Serverless Node 20,
  richiede `@supabase/supabase-js` (`require('@supabase/supabase-js')`) →
  per questo `package.json` ha quella dipendenza. Non è "metadata pura",
  è una vera runtime dep ma **solo lato server**. NON aggiungere altre dep
  senza pensarci (aumentano il cold-start delle serverless function).
- Il fatto che entrambi (CDN lato client + npm lato server) coesistano è
  voluto: il client vuole zero-install per semplicità, il server vuole
  stabilità con la libreria Supabase per la verifica JWT in modo deterministico.

---

## 13. Skill & MCP consigliati (set operativo)

Le skill/plugin qui sotto sono **selezionate dalla community** (tutti
repo ufficiali o con 100K+ install combinati: Anthropic, Vercel,
Supabase, Matt Pocock, obra/superpowers, pbakaus/impeccable,
leonxlnx/taste-skill, coreyhaines31/marketingskills). Sono organizzate
per area. Un agente che arriva su questo progetto dovrebbe **averle già
caricate** prima di toccare codice.

> ⚠️ Installazione richiede `bash` + `npx`. Da Codebuff CLI su questa
> macchina bash non è disponibile → comandi documentati qui, pronti da
> copia-incollare in Git Bash o WSL. Vedi sezione D per i comandi.

### A. "Pensare meglio" — Meta-skill anti-AI-generica

Repo di riferimento: `obra/superpowers` + `mattpocock/skills`.

| Skill                            | Perché su ConcorsoAI                                                  |
|----------------------------------|-----------------------------------------------------------------------|
| `systematic-debugging`           | Quando `api/chat.js` o SSE si rompono: niente "magia", metodo.         |
| `writing-plans`                  | Per task complessi: plan strutturato PRIMA di toccare codice.         |
| `verification-before-completion` | Costringe a verificare prima di dire "finito".                        |
| `dispatching-parallel-agents`    | Spawn sub-agent in parallelo (file-picker, code-searcher, ecc.).      |
| `using-superpowers`              | Meta-skill: insegna a usare TUTTE le altre del bundle.                |
| `test-driven-development`        | Quando aggiungeremo test, è già pronto.                               |
| `improve-codebase-architecture`  | Audit architetturale reale (DDD, anti-pattern, refactor plan).        |
| `domain-modeling`                | Stress-test del modello (bandi/chunks/simulazioni/feedback).          |
| `grill-me` / `grill-with-docs`   | Interrogatorio serrato del piano PRIMA di scriverlo.                  |

### B. Skill specifiche per lo stack ConcorsoAI

| Skill                            | Repo                              | Perché                                     |
|----------------------------------|-----------------------------------|--------------------------------------------|
| `supabase-postgres-best-practices`| `supabase/agent-skills`          | Schema/indici/RLS di bandi/chunks/simulazioni. |
| `supabase`                        | `supabase/agent-skills`          | Auth + RAG + Edge Functions Supabase.      |
| `better-auth-best-practices`      | `better-auth/skills`             | Audit del flow JWT/Bearer injection.       |
| `deploy-to-vercel`                | `vercel-labs/agent-skills`       | Check env vars + build + post-deploy smoke. |
| `web-design-guidelines`           | `vercel-labs/agent-skills`       | Checklist visiva/UX/responsive.            |
| `gsap`                            | `heygen-com/hyperframes`         | Best practice GSAP (stagger, expo.out, Flip).|
| `tailwind`                        | `heygen-com/hyperframes`         | Best practice Tailwind.                    |
| `frontend-design`                 | `anthropics/skills`              | Combatte l'"AI slop" nel design.           |
| `webapp-testing`                  | `anthropics/skills`              | Playwright/e2e sul flow completo.          |

### C. Skill UI/UX / Vendita / Copywriting (le 5 PRIME → vedi §14)

| Skill                | Repo                                  | Perché                                              |
|----------------------|---------------------------------------|-----------------------------------------------------|
| `impeccable` + `polish`/`audit`/`critique`/`animate`/`adapt`/`clarify`/`quieter` | `pbakaus/impeccable` | UI polish automatizzato + critique visivo. |
| `design-taste-*`     | `leonxlnx/taste-skill`                | Elimina estetica "AI slop" (industrial, minimalist, brandkit, stitch, gpt-taste). |
| `copywriting`        | `coreyhaines31/marketingskills`       | Copy persuasivo (CTA, microcopy, headline).         |
| `copy-editing`       | `coreyhaines31/marketingskills`       | Revisione stile/tono — perfetto per italiano formale.|
| `marketing-psych`   | `coreyhaines31/marketingskills`       | Bias cognitivi e psicologia applicata al copy.      |
| `churn-prevention`   | `coreyhaines31/marketingskills`       | Anti-abbandono free→Pro.                            |
| `sales-enablement`   | `coreyhaines31/marketingskills`       | Pitch/asset vendita.                                |
| `ui-ux-pro-max`      | `nextlevelbuilder/ui-ux-pro-max-skill`| Workflow UI/UX pro.                                 |

### D. Installazione — copia-incolla in Git Bash / WSL

```bash
# Meta-skill per pensare meglio
npx skills add obra/superpowers -g -y
npx skills add mattpocock/skills -g -y

# Stack-specific
npx skills add supabase/agent-skills@supabase-postgres-best-practices -g -y
npx skills add supabase/agent-skills@supabase -g -y
npx skills add better-auth/skills@better-auth-best-practices -g -y
npx skills add vercel-labs/agent-skills@deploy-to-vercel -g -y
npx skills add heygen-com/hyperframes@gsap -g -y

# UI/UX + Copy
npx skills add pbakaus/impeccable -g -y
npx skills add leonxlnx/taste-skill -g -y
npx skills add coreyhaines31/marketingskills -g -y
npx skills add anthropics/skills@frontend-design -g -y

# Discovery (per trovarne di nuove)
npx skills add vercel-labs/skills@find-skills -g -y
```

### E. MCP Server (per ambienti MCP-enabled)

```bash
npx -y @modelcontextprotocol/server-filesystem   # lettura/scrittura file
npx -y @modelcontextprotocol/server-git          # git ops avanzate
npx -y @modelcontextprotocol/server-postgres     # introspezione DB Supabase
npx -y @microsoft/playwright-mcp                 # e2e browser reali
npx -y @exa-labs/mcp-server                      # search web neurale
npx -y @modelcontextprotocol/server-fetch         # fetch + parsing HTML
npx -y @e2b/mcp-server                           # sandbox sicura per eseguire codice AI
```

---

## 14. Le 5 "prime" cose — principi NON-generici per ConcorsoAI

Questi sono **comportamenti operativi**, non consulenza generica.
Applicabili automaticamente da un agente, specifici a un SaaS italiano
educativo che simula esami orali pubblici.

### 1. 🪜 Trust Ladder (Human-in-the-Loop progressivo)

L'AI commissario **non si limita a dare un voto**. Mostra il ragionamento
in **3 livelli**: (a) sintesi → (b) dettaglio su click → (c) possibilità
di correzione utente.

Esempio:
1. "Punto trattato bene." (sintesi, sempre visibile)
2. "Hai omesso la data X — fondamentale per il contesto storico." (su click)
3. "Non sono d'accordo, ho citato X al minuto 2:03." (input utente → addestra)

→ **Regola**: ogni microcopy di feedback deve avere almeno 2 livelli.

### 2. 🧭 Micro-Copy Just-in-Time

NON inondare. Tooltip e suggerimenti appaiono **solo se**:
- l'utente **esita > 5s** su una risposta, OPPURE
- ha **3+ simulazioni senza migliorare** un'area specifica.

Esempio: "Ti senti bloccato? Ecco come strutturare questo concetto
senza usare termini tecnici." — appare solo al bisogno.

→ **Default di progetto**: tutto nascosto, si svela su bisogno.

### 3. 🎯 Risultati > Funzionalità (mai "modalità", sempre "obiettivo")

Cambia TUTTO il microcopy in base al beneficio diretto del candidato.

| ❌ Copy generico         | ✅ Copy orientato al risultato                          |
|--------------------------|--------------------------------------------------------|
| "Modalità simulazione"   | "Aumenta la tua sicurezza del 30% entro stasera"      |
| "Carica bando"           | "Vinci l'orale partendo dal bando vero"               |
| "Inizia simulazione"     | "Vivi un orale vero. Ricevi feedback vero."            |
| "Sezione feedback"       | "Scopri dove sei forte e dove migliorare"              |

Ogni CTA è collegata all'**obiettivo finale del candidato**: passare
l'orale, trovare posto, sentirsi pronto.

### 4. 📚 Linguaggio Tecnico Rispettato (mai semplificare troppo)

L'AI commissario **adotta il gergo del bando**. Se lo studente usa un
termine giuridico/amministrativo preciso, l'AI lo **valida**, non lo
"traduce".

Struttura preferita per distinguere concetti complessi: **incastro A
vs B** — "Questo si chiama A, mentre B è il suo opposto perché…".
**Precisione > leggibilità paternalistica**.

→ **Mai** sostituire "responsabilità extracontrattuale" con "il danno
fatto a terzi". Il candidato vuole sentirsi **preso sul serio** dal
linguaggio, non semplificato.

### 5. 🔁 Loop Implicito, mai domande continue

NON chiedere "Ti è stato utile?" (rompe il flusso). Impara da:

- **accetta/ignora** del suggerimento → aggiorna il peso di quel tipo
- **ripetizione nello stesso tema** → cambia strategia esposizione
  (meno teoria, più esempi) **senza chiedere permesso**
- **memoria persistente**: "Bentornato! Oggi facciamo un ripasso veloce
  di [Tema Fallito] prima del nuovo modulo" → valore reale che un
  software tradizionale **non può offrire**

→ Il candidato **non è una survey**. È una persona sotto pressione che
vuole allenarsi, non essere intervistata.

### 🎁 Bonus operativo (4 regole meta)

- **Italiano con accenti propri** (è, à, ò, ù, ì) — sempre.
- **MAI emoji** nel copy del commissario (formale, COI).
- **`font-variant-numeric: tabular-nums`** su tutti i numeri (timer, punteggi).
- **`@media (prefers-reduced-motion: reduce)`** su tutte le animazioni (a11y).

### Anti-pattern da EVITARE (se vedi, correggi)

- ❌ CTA vaghe tipo "Scopri di più" → sostituisci sempre con beneficio specifico.
- ❌ Microcopy che spiega il prodotto invece di aiutare l'utente.
- ❌ Popup/modali che fermano il flusso senza essere critici.
- ❌ Linguaggio "ti insegneremo" — meglio "ti allenerai".
- ❌ UI "cool vibes" — ConcorsoAI è formale, COI, italiano. Niente slang.

---

*Ultimo aggiornamento: 07/07/2026 (skill set + 5 principi aggiunti).*
