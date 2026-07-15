# UX Audit — Landing, Dashboard & Autenticazione

> Report complementare a `UX-AUDIT-SIMULATION.md`. Copre le pagine **pubbliche (landing)**, **protette (dashboard)** e **di autenticazione**.

---

## 1. Architettura delle pagine

### 1.1 `public/index.html` — Landing (~55 KB, 717 righe)
Landing page SEO + conversione. Struttura:
```
Navbar (desktop: link sezioni; mobile: hamburger toggle)
├── Hero (headline, subheadline, CTA "Inizia gratuitamente" → auth.html)
├── Come Funziona (3-step spiegazione)
├── Demo (video/walkthrough embed)
├── Prezzi (toggle mensile/annuale, 3 card: Base/Pro/Expert)
├── Testimonial (carousel feedback utenti)
├── FAQ (accordion con domande/risposte)
└── Footer
Sticky mobile CTA (fissa in basso su mobile)
```
Dipendenze: Tailwind CSS (CDN), `landing.css`, GSAP (CDN).

### 1.2 `public/dashboard.html` — Dashboard (~58 KB, 1288 righe)
Hub privato post-login. Struttura:
```
Navbar sticky (logo, navigazione, avatar/logout)
├── Hero sezione (eyebrow, title, subtitle, CTA "Nuova simulazione")
├── Stats grid (4 card: bandi attivi, simulazioni, streak giorni, media punteggio)
├── Sezione bandi (lista card con titolo, materie, progresso)
├── Sezione ultime simulazioni (tabella/lista con data, bando, punteggio, durata)
├── Banner "Riprendi sessione" (se simulazione in corso)
├── Upload Bando (wizard tab: Carica PDF → Incolla testo → Seleziona materie)
├── Onboarding step guide (3 step per nuovo utente)
└── Coach tour overlay (visita guidata iniziale)
```
Dipendenze: Tailwind CSS (CDN), `dashboard.css`, Supabase JS, GSAP (CDN), pdf.js (CDN).

### 1.3 `public/auth.html` — Autenticazione (~35 KB, 601 righe)
Login/registrazione standalone. Struttura:
```
Logo (link a landing)
└── Auth card
    ├── Tab switcher (Accedi | Registrati) con indicatore animato
    ├── Pannello Login
    │   ├── Email input
    │   ├── Password input + toggle visibilità + "Password dimenticata?"
    │   └── Bottone "Accedi" (con spinner loading)
    ├── Pannello Registrati
    │   ├── Email input
    │   ├── Password input + strength meter + toggle visibilità
    │   ├── Checkbox Termini
    │   └── Bottone "Registrati"
    ├── Divisore "oppure"
    ├── Bottone Google OAuth
    └── Social proof (avatae utenti fittizi)
```
Dipendenze: Tailwind CSS (CDN), `auth.css`, Supabase JS.

### 1.4 `public/auth-patch.js` — Patch Autenticazione (~16 KB)
Override runtime di `chiamaCommissario()` per iniettare JWT Supabase nell'header `Authorization`. Pattern: salva riferimento originale, sostituisce con wrapper che aggiunge token prima di chiamare l'originale.

---

## 2. Flusso utente completo

```
[Anonimo] → index.html (Landing)
               │
               ▼ CTA "Inizia gratuitamente"
          auth.html?mode=register
               │
               ▼ Registrazione/Login
          auth.html (Supabase Auth)
               │
               ▼ Redirect a /dashboard.html
          dashboard.html (Hub privato)
               │
               ├── Carica bando (upload wizard)
               │
               ├── "Nuova simulazione" → simulation.html
               │
               ├── "Riprendi sessione" → simulation.html
               │
               └── Coach tour (prima visita)
```

---

## 3. Criticità UI/UX

### 3.1 Landing — `index.html`

| # | Criticità | Impatto | Suggerimento |
|---|-----------|---------|--------------|
| L1 | **Hero CTA generico** — "Inizia gratuitamente" non comunica il beneficio emotivo (es. "Vinci l'orale", "Simula ora") | Conversione | Testare varianti benefit-driven: "Inizia a simulare gratis", "Preparati all'orale" |
| L2 | **Navbar non sticky** — la navbar sparisce scrollando; su una pagina lunga l'utente perde navigazione rapida | Usabilità | `position: sticky; top: 0` con backdrop-filter glass |
| L3 | **Mobile menu hamburger** — presente ma il toggle icon (hamburger → X) usa classi `hidden` gestite manualmente; manca animazione crossfade | Percezione | Animare icona con rotazione/transizione SVG |
| L4 | **Pricing card** — il toggle mensile/annuale non mostra il risparmio % sull'annuale; confronto visivo debole | Conversione | Badge "Risparmi 20%" + subtotale annuale |
| L5 | **Testimonial carousel** — nessun controllo autoplay/pausa; nessun indicatore di avanzamento | Fiducia | Aggiungere dot indicator + autoplay con pausa hover |
| L6 | **FAQ accordion** — nessuna transizione di apertura/chiusura; nessuna icona expand/collab | Usabilità | Rotazione freccia + animazione altezza max-height |
| L7 | **Nessun anchor scroll fluido** — i link nav usano `#sezione` ma le sezioni non hanno `scroll-margin-top` per compensare la navbar (quando sarà sticky) | UX | `scroll-margin-top: 5rem` sulle section |
| L8 | **Sticky mobile CTA** — buona idea ma il padding-bottom di 72px può confliggere con browser mobile che hanno toolbar in basso | Mobile | Usare `env(safe-area-inset-bottom)` |
| L9 | **Nessuna micro-copy sul CTA Hero** — nessun elemento di fiducia sotto il pulsante (es. "Nessuna carta di credito", "Già 1.000+ utenti") | Fiducia | Aggiungere trust badge sotto CTA |

### 3.2 Dashboard — `dashboard.html`

| # | Criticità | Impatto | Suggerimento |
|---|-----------|---------|--------------|
| D1 | **Stats grid vuoto** — quando l'utente non ha dati, le card mostrano "0" o "--" senza guida all'azione | Attivazione | Sostituire zeri con empty state contestuale con CTA primaria |
| D2 | **Wizard upload complesso** — 3 tab (PDF/caricamento/testo) + materie; troppi passaggi senza indicazione visiva di progresso | Abbandono | Aggiungere step indicator sopra i tab ("1. Carica → 2. Materie → 3. Conferma") |
| D3 | **Bandi senza search/filter** — a differenza di simulation.html (dove abbiamo aggiunto `#searchBandi`), qui non c'è modo di filtrare la lista bandi | Usabilità | Aggiungere search + filtro per stato/materia |
| D4 | **Coach tour non riattivabile** — una volta chiuso, non c'è modo di rivederlo | Onboarding | Aggiungere pulsante "?" o "Guida" in navbar |
| D5 | **Banner "Riprendi sessione"** — positivo ma poco visibile; potrebbe essere un vero banner hero invece di un box tra le card | Ritenzione | Elevare a hero section con CTA forte |
| D6 | **Onboarding step** — mostra 3 step ma senza progresso percentuale o completion state | Motivazione | Aggiungere progress bar "Setup completato al X%" |
| D7 | **Tabella simulazioni** — nessuna azione rapida (elimina, ripeti) | Efficienza | Aggiungere menu azioni (⋮) su ogni riga |
| D8 | **Nuova simulazione CTA** — unico CTA primario, ma senza contesto se l'utente non ha caricato un bando | Chiarezza | Disabilitare con tooltip "Carica prima un bando" |
| D9 | **Skeleton loading** — già presente ma manca per la sezione bandi e simulazioni in caricamento | Percezione | Estendere skeleton a tutte le sezioni dati |
| D10 | **Nessuna conferma logout** — il logout è immediato senza undo | Sicurezza | Aggiungere confirm dialog o toast con undo |

### 3.3 Auth — `auth.html`

| # | Criticità | Impatto | Suggerimento |
|---|-----------|---------|--------------|
| A1 | **Nessuna indicazione email verification** — dopo signup l'utente non sa che deve verificare l'email (se Supabase richiede conferma) | Attivazione | Messaggio post-signup: "Ti abbiamo inviato un link di verifica" |
| A2 | **Errori generici** — i messaggi di errore sono tradotti ma generici; mancano suggerimenti di recupero | Usabilità | Accoppiare errore a link d'aiuto (es. "Password dimenticata?" sotto errore login) |
| A3 | **Loading state login/register** — lo spinner sostituisce il testo del bottone ma manca disabilitazione del form durante submit | Robustezza | Disabilitare input + bottone durante loading |
| A4 | **"Password dimenticata?" link** — presente ma non è l'ideale come UX; meglio pulsante separato | Accessibilità | Spostare sotto il form come link secondario |
| A5 | **Tab switch non resetta errori** — se l'utente ha un errore su login e passa a register, l'errore rimane visibile fino allo scroll | UX | `clearError()` al cambio tab |
| A6 | **Social proof fittizio** — "Unisciti a 1.000+ utenti" è generico; le avatae sono placeholder SVG | Fiducia | Se non ci sono dati reali, meglio rimuovere o rendere astratto |
| A7 | **Nessun autofocus** — il primo input del tab attivo non riceve focus automaticamente | Accessibilità | `autofocus` via JS al cambio tab |
| A8 | **Nessun supporto biometrico** — WebAuthn/passkey non implementato | Futuro | Valutare passkey per utenti su mobile/desktop |

### 3.4 Auth Patch — `auth-patch.js`

| # | Criticità | Impatto | Suggerimento |
|---|-----------|---------|--------------|
| P1 | **Nessun fallback JWT scaduto** — se il token è scaduto, la chiamata fallisce silenziosamente | Affidabilità | Aggiungere refresh token + retry |
| P2 | **Override senza cleanup** — chiamare `initAuthPatch()` più volte accumula override senza ripristino | Stabilità | Idempotenza: controllare se già patchato |
| P3 | **Nessun logging** — in caso di errore JWT non c'è traccia | Debugging | Aggiungere `console.warn` in dev mode |
| P4 | **Dipende da variabile globale** — `window.chiamaCommissario` deve esistere | Robustezza | Aggiungere guard: `if (typeof original !== 'function')` |

---

## 4. Scheletro codice essenziale

### 4.1 Landing — Sezioni chiave
```html
<!-- Navbar -->
<nav aria-label="Navigazione principale">
  <a href="/">ConcorsoAI</a>
  <div class="nav-links">
    <a href="#come-funziona">Come funziona</a>
    <a href="#demo">Demo</a>
    <a href="#prezzi">Prezzi</a>
    <a href="#faq">FAQ</a>
  </div>
  <a href="auth.html">Accedi</a>
  <a href="auth.html?mode=register">Registrati</a>
  <button id="menu-toggle" aria-controls="mobile-menu">☰</button>
</nav>
<div id="mobile-menu" class="hidden">...</div>

<!-- Hero -->
<section>
  <h1>Simula l'orale e vinci il concorso pubblico</h1>
  <p>Carica il bando, simula con un commissario AI, ricevi feedback live.</p>
  <a href="auth.html?mode=register">Inizia gratuitamente</a>
</section>

<!-- Sticky mobile CTA -->
<div class="sticky-mobile-cta">
  <a href="auth.html?mode=register">Inizia gratuitamente</a>
</div>
```

### 4.2 Dashboard — Scheletro
```html
<nav class="navbar">...</nav>
<main class="content">
  <div class="container">
    <section class="hero">
      <p class="eyebrow">Dashboard</p>
      <h1 class="hero-title">Bentornato, {{nome}}</h1>
      <p class="hero-subtitle">Monitora i tuoi progressi e preparati all'orale.</p>
      <a href="simulation.html" class="btn-primary">Nuova simulazione</a>
    </section>

    <section class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon">📋</div>
        <p class="stat-label">Bandi attivi</p>
        <p class="stat-number" id="bandi-count">--</p>
      </div>
      <!-- ... other 3 stats ... -->
    </section>

    <section class="cards-grid">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">I tuoi bandi</h2>
          <a href="#" class="card-link">Carica nuovo</a>
        </div>
        <div id="bandi-list"><!-- dynamic --></div>
      </div>
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Ultime simulazioni</h2>
          <a href="#" class="card-link">Vedi tutte</a>
        </div>
        <div id="simulazioni-list"><!-- dynamic --></div>
      </div>
    </section>

    <!-- Upload wizard -->
    <section id="upload-section">
      <div class="upload-tabs">
        <button class="upload-tab active">Carica PDF</button>
        <button class="upload-tab">Incolla testo</button>
        <button class="upload-tab">Seleziona materie</button>
      </div>
      <div class="upload-panel" data-tab="pdf"><!-- drop zone --></div>
      <div class="upload-panel hidden" data-tab="text"><!-- textarea --></div>
      <div class="upload-panel hidden" data-tab="materie"><!-- toggles --></div>
    </section>

    <!-- Onboarding -->
    <section id="onboarding">
      <div class="onboarding-grid">
        <div class="step"><span class="step-number">01</span>...</div>
        <div class="step"><span class="step-number">02</span>...</div>
        <div class="step"><span class="step-number">03</span>...</div>
      </div>
    </section>
  </div>
</main>
```

### 4.3 Auth — Scheletro
```html
<main class="flex min-h-screen flex-col px-4 py-6">
  <a href="/" class="logo">Concorso<span class="text-gradient">AI</span></a>
  <section class="auth-card">
    <div role="tablist">
      <span id="tab-indicator" class="tab-indicator"></span>
      <button id="login-tab" role="tab" aria-selected="true">Accedi</button>
      <button id="register-tab" role="tab" aria-selected="false">Registrati</button>
    </div>

    <!-- Error box -->
    <div id="error-box" class="error-box hidden" role="alert">
      <p id="error-text"></p>
    </div>

    <!-- Login panel -->
    <div id="login-panel" role="tabpanel">
      <form id="login-form">
        <input type="email" placeholder="La tua email" required>
        <input type="password" placeholder="La tua password" required>
        <a href="#" id="forgot-password-link">Password dimenticata?</a>
        <button type="submit" id="login-submit">Accedi</button>
      </form>
    </div>

    <!-- Register panel -->
    <div id="register-panel" class="is-fading" role="tabpanel" hidden>
      <form id="register-form">
        <input type="email" placeholder="La tua email" required>
        <input type="password" placeholder="Almeno 8 caratteri" required minlength="8">
        <div id="password-strength-bar"></div>
        <p id="password-strength-text">Inserisci una password</p>
        <label><input type="checkbox" id="terms-checkbox"> Accetto i Termini</label>
        <button type="submit" id="register-submit">Registrati</button>
      </form>
    </div>

    <div class="divider">oppure</div>
    <button class="btn-google" id="google-login">Continua con Google</button>
  </section>
</main>
```

### 4.4 Auth Patch — Schema override
```javascript
// auth-patch.js – schema logico
const ORIGINAL = window.chiamaCommissario;

window.chiamaCommissario = async function patch(body, onChunk, onDone) {
  const jwt = await getValidJwt(); // refresh se scaduto
  const authBody = {
    ...body,
    authToken: jwt
  };
  return ORIGINAL(authBody, onChunk, onDone);
};
```

---

## 5. Riepilogo miglioramenti prioritari

| Priorità | Pagina | Azione |
|----------|--------|--------|
| 🔴 Alta | Dashboard | Aggiungere search/filter bandi (come in simulation) |
| 🔴 Alta | Auth | Messaggio post-signup verifica email |
| 🔴 Alta | Auth | Reset errori al cambio tab |
| 🟡 Media | Landing | Sticky navbar + scroll-margin |
| 🟡 Media | Landing | Badge risparmio pricing |
| 🟡 Media | Dashboard | Empty state stats con CTA |
| 🟡 Media | Dashboard | Coach tour riattivabile |
| 🟢 Bassa | Landing | FAQ animation |
| 🟢 Bassa | Auth | Autofocus primo input |
| 🟢 Bassa | auth-patch.js | Fallback JWT refresh |

---

*Generato il 15/07/2026 — basato su analisi statica di `index.html` (717 righe), `dashboard.html` (1288 righe), `auth.html` (601 righe), `auth-patch.js` (~400 righe), `landing.css` (185 righe), `dashboard.css` (850 righe), `auth.css` (106 righe).*
