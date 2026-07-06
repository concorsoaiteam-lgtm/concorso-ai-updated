# ConcorsoAI — Documentazione Tecnica

> SaaS per simulare l'esame orale dei concorsi pubblici con AI.
> Stack: HTML/CSS/JS vanilla + Supabase + GSAP + API serverless su Vercel.

---

## Indice

1. [Struttura del progetto](#1-struttura-del-progetto)
2. [Configurazione ambiente](#2-configurazione-ambiente)
3. [`api/chat.js` — Backend AI (Serverless)](#3-apichatjs--backend-ai-serverless)
4. [`public/index.html` — Landing page](#4-publicindexhtml--landing-page)
5. [`public/auth.html` — Autenticazione](#5-publicauthhtml--autenticazione)
6. [`public/dashboard.html` — Dashboard](#6-publicdashboardhtml--dashboard)
7. [`public/simulation.html` — Simulazione orale](#7-publicsimulationhtml--simulazione-orale)
8. [`vercel.json` — Routing](#8-verceljson--routing)
9. [Brand & Design System](#9-brand--design-system)

---

## 1. Struttura del progetto

```
/
├── api/
│   └── chat.js              # Serverless endpoint AI (CommonJS → Vercel)
├── public/
│   ├── index.html            # Landing page
│   ├── auth.html             # Login / Registrazione
│   ├── dashboard.html        # Dashboard utente
│   └── simulation.html       # Simulazione orale
├── .env.example              # Template variabili d'ambiente
├── .gitignore
├── .cursorrules              # Regole per AI coding assistant
├── package.json
├── vercel.json               # Rewrite rules Vercel
└── DOCS.md                   # Questo file
```

---

## 2. Configurazione ambiente

**File `.env`** (da creare copiando `.env.example`):

```env
SUPABASE_URL=https://tuo-progetto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tuo-service-role-key
SUPABASE_KEY=tuo-anon-public-key
BLUESMINDS_API_KEY=tuo-api-key-bluesminds
```

**Dipendenze** (solo lato client via CDN):
- Tailwind CSS 3.x (`cdn.tailwindcss.com`)
- Supabase JS v2 (`@supabase/supabase-js`)
- GSAP 3 (`gsap@3`)
- PDF.js 3.11 (`pdfjs-dist`)

---

## 3. `api/chat.js` — Backend AI (Serverless)

**Percorso:** `api/chat.js`
**Runtime:** Node.js 20.x (CommonJS)
**Deploy:** Vercel Serverless Functions

### Cosa fa

Proxy tra il frontend e l'API di BluesMinds (compatibile OpenAI). Supporta **streaming SSE** in tempo reale.

### Codice

```js
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const apiKey = process.env.BLUESMINDS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing BLUESMINDS_API_KEY' });

  const response = await fetch('https://api.bluesminds.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(req.body)
  });

  if (!response.ok) {
    const errText = await response.text();
    return res.status(response.status).json({ error: 'Upstream error', details: errText });
  }

  // Streaming SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value, { stream: true }));
  }
  res.end();
};
```

### Request (dal frontend)

```json
{
  "model": "deepseek-v4-flash",
  "messages": [
    { "role": "system", "content": "Sei un commissario d'esame..." },
    { "role": "user", "content": "Inizia l'esame." }
  ],
  "temperature": 0.4,
  "max_tokens": 300,
  "stream": true
}
```

### Response

SSE stream con eventi `data: {...}` contenenti delta di token. Il frontend pulisce il JSON in tempo reale per mostrare solo il campo `messaggio`.

---

## 4. `public/index.html` — Landing page

**Percorso:** `public/index.html` (703+ righe)

Landing page marketing. Static HTML con Tailwind via CDN.

### Sezioni

| Sezione | Descrizione |
|---------|-------------|
| Navbar | Sticky, link a #come-funziona, #prezzi, #faq |
| Hero | Mockup chat con commissario AI, CTA |
| Social Proof | "Pensato per 500.000+ candidati" |
| Problema | 3 card: ansia, imprevisto, nessun partner |
| Prima/Dopo | Confronto ripasso vs simulazione |
| Come funziona | 3 step: carica → simula → feedback |
| Features | 4 card: domande dal bando, timer, dashboard, feedback |
| Pricing | Free (€0) / Pro (€29/mese) |
| FAQ | Accordion con 6 domande frequenti |
| CTA Finale | Banner gradient con CTA "Crea account" |
| Footer | Links, copyright |

### Esempio: Card feature

```html
<article class="reveal card-hover rounded-3xl border border-brand-200 bg-white p-6 shadow-card sm:p-8">
  <div class="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
    <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v5l3 2M9 2h6M12 22a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
    </svg>
  </div>
  <h3 class="text-xl font-black text-brand-900">Timer & pressione</h3>
  <p class="mt-3 text-sm leading-7 text-brand-700">Simula la pressione del tempo reale.</p>
</article>
```

---

## 5. `public/auth.html` — Autenticazione

**Percorso:** `public/auth.html` (599 righe)

Login/Registrazione con Supabase Auth. Supporta OAuth Google + email/password.

### Flussi

1. **Login:** email + password → `supabase.auth.signInWithPassword()`
2. **Registrazione:** nome + email + password → `supabase.auth.signUp()`
3. **Google OAuth:** `supabase.auth.signInWithOAuth({ provider: 'google' })`

### Esempio: handleLogin

```js
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return showError(translateAuthError(error.message));
  window.location.href = DASHBOARD_URL; // '/dashboard.html'
}
```

### UI Features

- Password strength meter (debole/media/forte)
- Toggle visibilità password (eye icon)
- Tab switcher Login / Registrati con animazione indicatore
- Traduzione errori Supabase in italiano

---

## 6. `public/dashboard.html` — Dashboard

**Percorso:** `public/dashboard.html` (1500+ righe)

Dashboard principale dopo il login. Caricamento bandi, statistiche, avvio simulazione.

### Componenti

| Componente | Descrizione |
|------------|-------------|
| Navbar | Logo + menu utente (nome, logout) |
| Hero | Titolo "Ciao, [utente]" |
| CTA | Bottone "Inizia Simulazione" con effetto magnetico GSAP |
| Stats Grid | 4 card: simulazioni, voto medio, bandi, streak |
| Ultime simulazioni | Lista delle ultime 3 simulazioni |
| Aree da migliorare | Progress bar per chiarezza/struttura/contenuto |
| Upload | 3 tab: PDF, testo libero, materie |
| Onboarding | 3 step guida iniziale |

### Upload PDF (flusso completo)

1. User seleziona PDF → `processFiles()`
2. Lettura con `pdfjsLib.getDocument()` → estrazione testo per pagina
3. Chunking (500 parole, overlap 50) → `chunkText()`
4. Salvataggio in Supabase: tabella `bandi` + `chunks`
5. Progress bar real-time per ogni file

### Esempio: chunkText()

```js
function chunkText(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunkSize = 500;
  const overlap = 50;
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 10) chunks.push(chunk);
  }

  return { words, chunks };
}
```

---

## 7. `public/simulation.html` — Simulazione orale

**Percorso:** `public/simulation.html` (3200+ righe)

Il cuore dell'app. Simulazione dell'esame orale con commissario AI in streaming.

### Architettura

```
Config Phase → Briefing → Simulation Phase → Summary Phase
```

### Fasi

| Fase | Descrizione |
|------|-------------|
| **Config** | Selezione bando(i), difficoltà, durata |
| **Briefing** | Animazione "Preparazione commissione" (3 step) |
| **Simulation** | Chat con commissario, feedback live, timer |
| **Summary** | Riepilogo con punteggi, tempo usato |

### Flusso AI streaming

```
avviaCommissario()
  → mostraThinking() (disabilita input)
  → chiamaCommissario(messaggi, config)  // POST /api/chat
  → aggiungiMessaggioCommissario(response)
      → nascondiThinking()
      → reader.getReader() loop
      → estraiMessaggioDaStream()  // pulisce JSON in tempo reale
      → mostra testo nel bubble
      → aura blu GSAP durante streaming
  → parse finale JSON: aggiorna feedback bars
```

### Esempio: estrazione messaggio dal JSON streaming

```js
function estraiMessaggioDaStream(raw) {
  const full = raw.match(/"messaggio"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (full) return full[1];

  const partial = raw.match(/"messaggio"\s*:\s*"((?:[^"\\]|\\.)*)$/);
  if (partial) return partial[1];

  return null;
}
```

### System prompt del commissario

```
Sei un commissario d'esame per un concorso pubblico italiano.
FORMATO RISPOSTA — rispondi SEMPRE con questo JSON:
{"messaggio": "testo", "feedback": {"chiarezza": 5, "struttura": 5, "contenuto": 5}, "tipo": "domanda"}
APERTURA: inizia sempre con "Buongiorno." poi vai subito alla prima domanda.
LINGUA: italiano formale. Niente emoji.
```

### Feedback live

Le barre (Chiarezza, Struttura, Contenuto) partono da **0/10** e si animano con GSAP `expo.out`:

```js
gsap.to(fill, { width: (val * 10) + '%', duration: 0.7, ease: 'expo.out' });
```

**Colori:** Rosso `<5`, Blu `5-7`, Verde `>7`.

### Animazioni GSAP Premium

- **Staggered Reveal:** timeline con `-=0.1` per navbar → infobar → commissioner → feedback → input
- **Send button:** `back.out(1.2)` al click
- **Aura streaming:** box-shadow blu pulsante durante generazione AI
- **Briefing:** card slide + step progression + progress bar
- **Message entry:** fade + translateY su ogni nuovo messaggio

### Layout Claude-style

- `html, body { overflow: hidden }` — nessuna doppia scrollbar
- `.sim-phase { height: 100vh; display: flex; flex-direction: column }`
- `.chat-area { flex: 1; overflow-y: auto }` — solo chat scrolla

---

## 8. `vercel.json` — Routing

```json
{
  "rewrites": [
    { "source": "/dashboard", "destination": "/dashboard.html" },
    { "source": "/auth",       "destination": "/auth.html" },
    { "source": "/simulation", "destination": "/simulation.html" }
  ]
}
```

URL puliti senza estensione `.html`.

---

## 9. Brand & Design System

### Palette

| Ruolo | Colore | HEX |
|-------|--------|-----|
| Sfondo | Bianco | `#F7FBFF` / `#FFFFFF` |
| Testo principale | Blu notte | `#0F4C81` / `#0B2A4A` |
| Accento primario | Blu acceso | `#2563EB` |
| Superfici | Bianco con opacità | `rgba(255,255,255,.85)` |
| Bordo | Blu morbido | `rgba(37,99,235,.15)` |

### Convenzioni CSS

- Tutto lo stile in `<style>` inline in ogni HTML (nessun file CSS esterno)
- Custom properties via `:root`
- BEM-lite class naming (`.btn-primary`, `.feedback-panel`, `.chat-area`)
- Tailwind utility classes + custom CSS in cascata
- `@media (prefers-reduced-motion: reduce)` per accessibilità

### Convenzioni JS

- Supabase key sempre con pattern `.join('')` (offuscamento cosmetico)
- Try/catch su ogni chiamata Supabase con `console.warn` fallback
- `font-variant-numeric: tabular-nums` per punteggi/timer
- `aria-*` attributi su elementi interattivi

---

## Tabella riassuntiva API Supabase

| Tabella | Utilizzo | Pagina |
|---------|----------|--------|
| `bandi` | Upload PDF, elenco bandi | dashboard, simulation |
| `chunks` | Frammenti di testo dei PDF | simulation (RAG) |
| `simulazioni` | Storico simulazioni, punteggi | dashboard, simulation |
| `auth.users` | Gestita da Supabase Auth | auth |

---

*Documentazione generata il 06/07/2026.*
