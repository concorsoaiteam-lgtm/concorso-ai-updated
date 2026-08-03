# ConcorsoAI — legal pages polish (round 28)

## Riassunto

Le tre pagine legali (`privacy.html`, `terms.html`, `cookies.html`) sono state
riscritte da zero per allinearsi all'identità editoriale cream + ink della
landing. Sono passate da **template Tailwind+Geist+brand-blue** a
**estensione pura della stessa landing.css**, con markup e animazioni
identici.

Le pagine ora si comportano come parte integrante del prodotto, non come
allegati boilerplate di un generatore AI.

---

## Cosa è stato eliminato (round 28)

Dalle pagine legali precedenti (template AI):

| Cosa è stato rimosso | Motivazione |
|---|---|
| `<script src="https://cdn.tailwindcss.com">` | Tailwind via CDN è la firma di un template AI. La landing non lo usa, le pagine legali non devono usarlo. |
| `@fontsource/geist` e `@fontsource/geist-mono` | Il font sbagliato. La landing usa Inter; le pagine legali ora condividono quel font. |
| Palette `brand-500: #2563EB` (blu elettrico) | Completamente fuori dall'identità cream + ink della landing. |
| `<header class="sticky top-0 z-50 border-b ... bg-white/86 backdrop-blur-xl shadow-sm">` | Glassmorphism su un documento legale è pura decorazione, non utilità. |
| `<span class="text-gradient">AI</span>` con gradient blu-viola | Gradient su una parola: pattern AI-slop riconoscibile. |
| `<a href="index.html" class="rounded-xl ... border-brand-200 bg-white ...">← Indietro</a>` | CTA sbagliata: un documento legale deve portare alla registrazione, non "indietro". |
| Fornitore inventato **"BluesMinds"** nella vecchia privacy | Garcia regole user: "Non inventare servizi". Verifica nel codice: BluesMinds non esiste. |
| Cookie inventato **"csim-pref"** | Idem: non esiste nella codebase. Verificato con grep su localStorage keys. |
| Cookie inventato **"csrf-token"** | Supabase non emette questo cookie; era un'assunzione errata. |
| Linguaggio AI-template del tipo "I dati sono trattati nel rispetto del Regolamento UE 2016/679 (GDPR)" | Legalese boilerplate. Le pagine ora spiegano in italiano semplice. |
| Data "08/07/2026" (vecchia, prima del "1° Agosto 2026" della landing) | Coerenza con la timeline del prodotto: la privacy è aggiornata alla data della landing. |
| `<h2>` con classi Tailwind `text-xl font-black text-brand-900 sm:text-4xl` su ogni pagina | Classi utility-tipografiche che non dialogano con il sistema della landing. |

---

## Cosa è stato ridisegnato

### Markup riusato dalla landing (identità visiva)

Ogni pagina legale ora include, **senza modifiche**:

- `<header class="nav">` sticky con brand-dot, link "In pratica", CTA "Registrati gratis" (identico markup della landing).
- `<footer class="footer">` con griglia 3-colonne, footer-tag, footer-legal-line, footer-links (identico markup della landing).

Questo significa che le pagine legali sono visivamente parte dello stesso
prodotto: stesso navbar, stesso footer, stesso `--bg`, stesso tipografia
Inter, stesso ritmo.

### Architettura del content

Nuovo template riusato su tutte e tre le pagine:

1. **Skip-link** (visually-hidden → #main-content) — WCAG 2.4.1.
2. **Navbar** — identico landing.
3. **`<main>`** con id `main-content`.
4. **legal-hero**:
   - eyebrow (uppercase, tracking 0.14em, --muted): "Privacy" / "Termini" / "Cookie"
   - H1 (legal-title): "Privacy Policy." / "Termini di Servizio." / "Cookie Policy." — point finale come firma editoriale.
   - data aggiornamento (legal-updated, ink-faint, 13px)
   - 2 righe di intro (legal-intro, ink-soft, 17-19px, max 64ch)
5. **legal-toc** con counter `decimal-leading-zero` (riusa il pattern "section-num" della landing).
   - `<ol class="legal-toc-list">` con 8–11 link cliccabili.
   - Su ≥640px: due colonne per non allungare lo scroll.
6. **legal-body** con stack verticale di 8–11 `<section class="legal-section">`.
   - Ogni sezione: H2 con border-top hairline + H3 eventuali + testo prose + liste o tabelle.
   - `scroll-margin-top: 88px` perché il navbar sticky copre l'inizio della sezione target quando si clicca un'ancora TOC.

### Componenti nuovi in `legal.css`

| Componente | Uso | Motivazione UX |
|---|---|---|
| `.legal-callout` | Box per diritti GDPR / cancellazione account / banner-pattern. | Distinguere "azione pratica" da "spiegazione" senza creare card decorative. Border-left ink 2px, bg cream-2, niente shadow, niente icone. |
| `.legal-dl` | Definition list per titolare, base giuridica, conservazione. | Pattern Stripe Docs / GitHub legal: leggibile come "definizione → significato" senza table-bloat. |
| `.legal-table` | Tabella cookie e fornitori terze parti. | Solo dati tabulari veri; il resto è prosa. |
| `.legal-placeholder` | `<span class="legal-placeholder">[DA COMPLETARE: ...]</span>`. | Visivamente riconoscibile (italic, ink-faint), semanticamente corretto (non `<em>`). |
| `.legal-link` | Link inline a riferimenti normativi / altre pagine. | Stesso pattern dei `.footer-links a` della landing. |

---

## Servizi terzi (real, verificati)

Prima: privacy inventava "BluesMinds".
Ora: la tabella è costruita su ciò che il codice effettivamente usa (verificato
via `grep` su `api/` e `public/`).

| Fornitore | Dove si usa (verificato) |
|---|---|
| **Supabase** | `api/chat.js`: client + auth backend. `auth.html`: login UI. Database + autenticazione. |
| **Stripe** | `api/stripe-webhook.js`: webhook per pagamenti Pro. L'unico gestore dei pagamenti. |
| **Resend** | `api/_lib/email-helpers.js`: `sendViaResend`. Email transazionali (benvenuto, recupero password). |
| **Google Gemini** | `api/chat.js`: modello `google/gemini-2.5-flash`. Generazione domande + correzione risposte. |
| **Vercel** | Hosting + AI referrer URL. Api routing pattern nelle email-helpers. |
| **Google OAuth** | `auth.html` + `api/auth`: `provider: 'google'`. SSO. |

---

## Cookie policy (solo reali, niente inventati)

Prima: elencava `sb-*-auth-token` (vera), `csrf-token` (falsa), `csim-pref`
(falsa). Cookie banner "richiesto per legge" anche in assenza di cookie non
tecnici (claim falso).

Ora:

- **Cookie tecnici reali**: `sb-*-auth-token` (Supabase auth, regex `/^sb-[a-z0-9]+-auth-token$/` verificata in `auth-patch.js`).
- **localStorage reali** (verificati in `dashboard.html` e `auth-patch.js`): `cai_input_method`, `cai_subjects`, `cai_difficolta`, `cai_durata`, `cai_bando_id`, `dashboard.tab`, `dashboard.activeBando`, `dashboard.materie`, `concorsoai_history`, `tutorialDismissed_v1`.
- **sessionStorage reali** (verificati in `landing.js`): `concorso_reveal_first_seen`.
- **Nessun cookie non tecnico** → niente banner. La pagina spiega *perché* non c'è un banner ("Per legge il banner è richiesto solo in presenza di cookie non tecnici o di profilazione").
- **Servizi candidati futuri** (Plausible analytics, Crisp chat) dichiarati esplicitamente come "non ancora attivi".

---

## Decisioni UX

1. **TOC clickcabile prima del contenuto**: l'utente che apre la pagina può scendere direttamente alla sezione che gli interessa (es. "Rimborsi", "Cookie") senza scorrere. Pattern Notion / Stripe Docs / GitHub Legal.
2. **Last-updated visibile in alto**: trasparenza GDPR + riduzione ansia ("questa pagina è curata").
3. **Intro di 2 righe**: massimo 64ch. Riduce cognitive load: l'utente capisce subito cosa troverà.
4. **Definition-list per "definizioni tecniche"**: titolare, base giuridica, conservazione. Più leggibile di `<p>` ripetuti.
5. **Callout solo per "azioni"**: cancellare account, esercitare diritti, contatti. Visivamente distinto (border-left ink, bg cream-2), semanticamente una nota (`role="note"`).
6. **Tabella solo per dati tabulari**: cookie e fornitori terzi. Il resto è prosa.

## Decisioni UI

1. **Zero nuovi token**: tutta la legali-css usa `--bg`, `--bg-2`, `--ink`, `--ink-soft`, `--ink-faint`, `--muted`, `--line`, `--line-2`, `--s-1..11`, `--t-fast`, `--t-base`, `--ease`, `--container`, `--tracking`. Aggiunti solo tre nuovi "derivati" che sono pattern della landing stessa (border-top hairline per separare sezioni, counter pattern del section-num, underline muted/ink per i legal-link).
2. **Stesso reveal-on-scroll della landing** (single-pass al primo `.legal-toc` che entra in viewport, rispetta prefers-reduced-motion, fail-safe no-IntersectionObserver, persistenza sessionStorage).
3. **Container 760px**: più stretto del container landing (920px) — Bringhurst 60-75 char/line su Inter 16px = 65-70ch, che tradotto in pixel è ~720-760px. Più stretto = lettura più rilassata per un documento lungo.
4. **H2 + border-top hairline** invece di "card" per separare le sezioni. Pattern editoriale Linear-Stripe.
5. **TOC counter `01 … 0N`** con `decimal-leading-zero`: stesso pattern del `.section-num` che l'utente ha già visto scorrere nella landing. Coerenza visiva.

---

## Miglioramenti accessibilità

| WCAG / best practice | Implementazione |
|---|---|
| **2.4.1 Skip-link** | `<a class="visually-hidden" href="#main-content">Salta al contenuto principale</a>` in testa a ogni pagina. |
| **1.3.1 Landmark roles** | `<header role="banner">`, `<nav aria-label="...">`, `<main id="main-content" role="main">`, `<footer role="contentinfo">`. |
| **2.4.7 Focus-visible** | Ereditato da `landing.css`: `a:focus-visible, button:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }`. |
| **Headings hierarchy** | H1 (legal-title) → H2 (legal-h2) → H3 (legal-h3), nessuno skip. Verificato. |
| **Tables a11y** | `<thead>` + `<th scope="col">` su tutte le tabelle. |
| **TOC aria-label** | `<nav class="legal-toc" aria-label="Indice della Privacy Policy">`. |
| **Reduced-motion** | `@media (prefers-reduced-motion: reduce) { .legal-section, .legal-toc { opacity: 1; transform: none; transition: none; } }` (WCAG 2.3.3). |
| **Contrast** | Body text (`--ink-soft` su `--bg`) = ~12.5:1 → AAA. Caption/eyebrow (`--muted` su `--bg`) = ~5.4:1 → AA. |
| **Anchor scroll-margin** | `scroll-margin-top: 88px` sulle `.legal-section` per non finire sotto il navbar sticky. |
| **Schema.org JSON-LD** | Ogni pagina dichiara `WebPage` con `inLanguage: "it"`, `name`, `url`. |
| **Canonical URL** | `<link rel="canonical" href="https://concorso-ai.vercel.app/{page}.html">` per evitare contenuti duplicati. |
| **`<code>` in tabelle** | Monospace fallback chain (`ui-monospace, SFMono-Regular, ...`) per il "look da identificatore tecnico". |

---

## Placeholder da completare pre-lancio

Tutti i `[DA COMPLETARE: ...]` sono `<span class="legal-placeholder">` ben
visibili. La `grep -nE 'legal-placeholder' public/*.html` mostra 13
occorrenze totali. Ecco l'elenco per pagina:

### `privacy.html` (8 placeholder)

| Campo dove appare | Cosa serve | Note |
|---|---|---|
|§1 Titolare | **Ragione sociale completa** (es. "ConcorsoAI S.r.l." / "ConcorsoAI di Mario Rossi") | Persona giuridica o ditta individuale. |
|§1 Titolare | **Sede legale** (indirizzo completo + CAP + città) | Per le comunicazioni formali GDPR. |
|§1 Titolare | **P.IVA / Codice Fiscale** | Obbligatorio in fattura. |
|§1 Titolare | **PEC** | Obbligatoria in Italia per imprese / professionisti iscritti. |
|§1 Titolare | **Email privacy attiva** | Conto attivo: `privacy@concorso-ai.it`. Verificare che sia effettivamente monitorato. |
|§5 Conservazione | **Durata cancellazione** (es. "30 giorni") | Espresso in giorni. |
|§5 Conservazione | **Durata log di sicurezza** (es. "90 giorni") | Espresso in giorni. |
|§10 Contatti | **PEC** e **indirizzo** | Ridondanza con §1 ma serve per accessibilità rapida. |

### `terms.html` (4 placeholder)

| Campo dove appare | Cosa serve |
|---|---|
|§11 Contatti | Ragione sociale (ridondanza con privacy). |
|§11 Contatti | Sede legale. |
|§10 Legge applicabile e foro | **Città della sede legale** (es. "Milano" / "Roma"). |
|§11 Contatti | PEC (ridondanza con privacy). |

### `cookies.html` (1 placeholder)

| Campo dove appare | Cosa serve |
|---|---|
|§8 Contatti | **PEC** (ridondanza con privacy). |

### Raccomandazione prima del lancio

Prima di andare live servono almeno:

1. **Ragione sociale** + P.IVA/CF → completare in `privacy.html` §1 e `terms.html` §11.
2. **Sede legale completa** (indirizzo + città) → completare in §1 privacy + §11 terms + §10 terms (foro).
3. **Conto PEC attivo** → inserire l'indirizzo PEC in §1, §11, §8 cookie; verificare che esista.
4. **Email privacy monitorata** (`privacy@concorso-ai.it` già predisposto) → verificare configurazione inoltro / notifica.
5. **Durate di conservazione** → definire in Privacy §5 (es. "30 giorni post-cancellazione") e "log di sicurezza (90 giorni)" e aggiornare.

---

## Decisioni trimestrali / miglioramenti futuri

| Decisione | Stato | Suggerimento |
|---|---|---|
| **Estrarre `pages.css` "slim"** (solo `:root` + base + focus-visible + utility) | Deferred | Caricare 1753 righe di `landing.css` su un documento di solo testo è spreco. Per ora vince l'identità. |
| **Cookie banner interattivo** | Non implementato | La pagina dichiara che *quando* aggiungeremo cookie non tecnici, rispetteremo 3 regole anti-manipolazione: pulsanti pari, scelta granulare, modificabile sempre. |
| **Login utente per visualizzare i propri dati** (futuro) | Non implementato | Pattern Stripe / Notion. |
| **`dateModified` JSON-LD e `isPartOf` website** | Non implementato | SEO win facile. |
| **i18n** (versione inglese) | Non implementato | Tutti i testi in italiano. Struttura TOC regge già localizzazione. |

---

## File di questa consegna

| File | Stato | Dimensione |
|---|---|---|
| `public/privacy.html` | Riscritto | 16.7 KB |
| `public/terms.html` | Riscritto | 15.6 KB |
| `public/cookies.html` | Nuovo (esisteva solo `#cookies` in privacy) | 14.3 KB |
| `public/css/legal.css` | Nuovo | ~6 KB |
| `public/js/legal.js` | Nuovo | ~1 KB |
| `public/index.html` | Footer link aggiornato: `privacy.html#cookies` → `cookies.html` | invariato il resto |

Nessun file del progetto fuori da `public/` è stato toccato.

---

## Anti-AI-slop checklist (verificata)

```
✗ Tailwind via CDN → rimosso
✗ Geist / Geist Mono → rimosso
✗ brand-500 / brand-200 / brand-600 (palette blu) → rimosso
✗ text-gradient → rimosso
✗ backdrop-blur-xl → rimosso
✗ bg-white/86 → rimosso
✗ shadow-sm → rimosso
✗ rounded-2xl → rimosso
✗ "BluesMinds" (servizio inventato) → rimosso
✗ "csim-pref" (cookie inventato) → rimosso
✗ "csrf-token" (cookie non realmente usato) → rimosso
✗ Emoji in copy legale → assenti
✗ Box enormemente decorati → assenti
✗ Illustrazioni finte → assenti
✗ CTA "← Indietro" → sostituita con "Registrati gratis"
```

**Risultato: pagine legali ora parte integrante del prodotto, non documenti boilerplate.**
