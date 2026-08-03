# ConcorsoAI — Auth Progress Log

> Aggiornato: round 43 (bug signup indagato empiricamente, errori inline, OTP, Turnstile)
> Regola: il progetto non viene MAI lasciato in uno stato incompleto. Questo file è la fonte di verità sullo stato.

---

## Cosa è stato fatto (round 43)

### 1. Bug "Esiste già un account" — causa radice (indagata, non workaround)

**Verifica empirica** contro l'endpoint reale (`POST /auth/v1/signup`, stessa anon key del codice):
- Email nuova → **200 + sessione immediata** (`email_confirmed_at` impostato) → il progetto ha **"Confirm email" DISATTIVATO**.
- Stessa email ripetuta → `{ error_code: "user_already_exists" }` (422).
- Login errato → `invalid_credentials`.

**Conclusione**: il client non inventa lo stato. Ogni email testata nelle prove viene **auto-confermata e resta registrata per sempre**; riusandola, Supabase risponde correttamente `user_already_exists` → il messaggio era vero ma *ambientale*. Il difetto reale era l'UX: l'errore appariva **sopra il form** (sembrava un bug) e mancava un flusso di verifica email (perché le conferme sono off).

**Fix applicati**: gestione esatta dei duplicati (rilevamento `identities.length === 0`, comportamento reale di GoTrue, oltre a `user_already_exists`), errori inline sotto il bottone, pannello OTP pronto.

### 2. Errori inline sotto il bottone (mai sopra il form)
- Rimosso il box globale in cima; 5 slot per-forma (`#form-error-login/register/forgot/verify/reset`) **subito sotto il bottone premuto**.
- Animazione leggera: **fade + slide 6px** (220ms, `--ease`), mai shake. `role="alert"`.

### 3. Bot protection — Cloudflare Turnstile (lazy)
- Slot nel form Registrati + caricamento **solo quando il pannello Registrati viene mostrato** e solo se configuri `window.__SUPABASE_CAPTCHA = { siteKey }`.
- Managed mode: il widget appare solo se Cloudflare lo ritiene necessario.
- Token **monouso**: scartato a ogni lettura e widget resettato dopo un submit fallito (niente `captcha_failed` al retry).

### 4. Registrazione → verifica email (flusso OTP)
- Nuovo pannello **verify**: codice a 6 cifre (input filtro solo cifre, `autocomplete="one-time-code"`), bottone "Verifica e inizia" (`verifyOtp({ type: "signup" })`), "Invia di nuovo" (`auth.resend`), "Usa un'altra email".
- **ATTIVO solo quando abiliti "Confirm email" in Supabase** (vedi azioni richieste sotto). Con conferme off il signup continua a dare sessione immediata → dashboard.

### 5. Password dimenticata — schermata completa
- Pannello sent ridisegnato: ✓ Email inviata · "Se l'indirizzo è registrato, riceverai un'email entro pochi minuti" · checklist (Spam / Promozioni / attendi / verifica indirizzo) · bottone "Invia di nuovo" (cooldown 4s). Anti-enumeration invariata.

### 6. Google che chiede il telefono — analisi
- **Non è dovuto a scope o configurazione OAuth**: è la verifica di sicurezza di Google sul SUO account (risk-based). Gli scope di default GoTrue (`email profile`) non sono stati modificati (come richiesto). Nessuna azione possibile dal client; nessun fix necessario.

### 7-8. Stati mancanti aggiunti
- `invalid_token` ("Codice non corretto. Controlla l'email e riprova."), timeout ("Il server ha impiegato troppo tempo…"), 5xx ("Il server è momentaneamente occupato…"), messaggio `otp_expired` aggiornato per coprire anche il codice. Ogni messaggio include la prossima azione.
- `errCode(err)` normalizza `err.code || err.error_code` (robustezza tra versioni supabase-js).

### Verifiche round 43
- `node -c` ✅ · coerenza ID HTML/JS ✅ · code review ✅ (fix applicati: token Turnstile monouso, `role` pannello verify, render lazy).
- Test API reali documentati sopra (email `diag-*@example.com` create nel progetto — da eliminare in dashboard Auth → Users).

---

## AZIONI RICHIESTE (per attivare i nuovi flussi)

| # | Azione | Dove | Effetto |
|---|---|---|---|
| A | **Abilitare "Confirm email"** | Supabase → Auth → Sign In / Up → Email | Attiva il flusso di verifica (pannello OTP). Senza questo, signup = sessione immediata |
| B | **Aggiungere `{{ .Token }}` al template** "Confirm signup" | Supabase → Auth → Email Templates | Fa arrivare il codice a 6 cifre al posto del solo link |
| C | **Site key Turnstile** | Cloudflare Dashboard → Turnstile | Configura `window.__SUPABASE_CAPTCHA = { siteKey }` in `auth.html` (o pagina di build) |
| D | **Turnstile provider in Supabase** | Supabase → Auth → Bot and Abuse Protection | Supabase valida il token ricevuto |
| E | **Pulire gli utenti di test** | Supabase → Auth → Users | Eliminare `diag-*@example.com` e `fresh*@example.com` creati durante la diagnosi |
| F | Redirect whitelist, Google provider, rate limit, SMTP, backup | vedi tabella round 41 sotto | Invariati |

---

## Cosa è stato fatto (round 42)

### Documentazione
- ✅ `md/auth-edge-cases.md` — 20 scenari limite progettati (sessioni, recovery, rete, OAuth, navigazione, abuso): cosa vede / cosa succede / cosa può fare / copy / CTA / comportamento UX. Mappa scenario → gestito da (Codice / Supabase / Config / Futuro).
- ✅ `md/auth-motion.md` — architettura del movimento: token di motion, 19 microinterazioni specificate (evento, durata, easing, delay, stato, quando NON parte, reduced-motion), regole dure (mai shake, mai confetti), mappa implementazione.
- ✅ `md/auth-performance.md` — percorso critico, metriche target (LCP<1.2s, CLS=0, INP<200ms), interventi (pin CDN), rischi, cose deliberate NON fatte con motivo.
- ✅ `md/auth-security-checklist.md` — audit completo per controllo: 40+ voci con stato ✔/⚠/❌, mappatura OWASP ASVS / NIST 800-63B, gap e piano.

### Codice (miglioramenti invisibili, niente redesign)
- ✅ **Pin CDN Supabase a `@2.112.0/dist/umd/supabase.min.js`** (prima `@2` = tag mobile): build deterministica + cache immutabile (`auth.html`).
- ✅ **Routing deep-linkabile per forgot**: click su "Password dimenticata?" → `history.replaceState(/auth.html?mode=forgot)` + routing in `init()` → il refresh non riporta al login (`auth.js`).
- ✅ **Checkmark "disegnata"** sul pannello email inviata: tratto SVG (pathLength=1) con stroke-dashoffset 320ms, un solo colpo, azzerata da reduced-motion (`auth.css` + `pathLength` in `auth.html`).
- ✅ **Copy errore email unificato** tra validazione live e handler submit (login/register/forgot): stessa frase, zero incoerenza.

### Motivazioni (sintesi)
- **UX**: nessun pannello si perde al refresh; il successo ha una chiusura sobria; gli errori dicono sempre la stessa cosa.
- **Performance**: il tag `@2` mobile era l'unica fonte di non-determinismo del bundle.
- **Sicurezza**: nessun cambiamento di superficie (audit completo in `auth-security-checklist.md`).

---

## Cosa è stato fatto (round 41)

### Architettura e documentazione
- ✅ `md/auth-architecture.md` — architettura completa: flow, session lifecycle, security flow, redirect flow, edge cases, threat model, compliance mapping OWASP/Supabase.
- ✅ Ricerca incrociata: OWASP Authentication/Session/Forgot-Password Cheat Sheets, Supabase docs (PKCE, rate limit, RLS, refresh token), Auth0/OWASP su token storage SPA, Baymard/NN/g su UX auth (vedi `md/auth-research.md`).

### Codice (public/js/auth.js)
- ✅ **PKCE esplicito** (`flowType: "pkce"`, autoRefreshToken, detectSessionInUrl, persistSession) — OAuth 2.1, mai implicit flow.
- ✅ **Guard di sessione**: `/auth` con sessione valida (validata lato server via `getUser()`) → redirect a `/dashboard.html`. Eccezione: flusso recovery mai rediretto.
- ✅ **Email confirmation**: `signUp` ora passa `emailRedirectTo` → il link di conferma atterra su `/auth.html?mode=login`.
- ✅ **Mapping errori per codice Supabase**: `invalid_credentials`, `email_not_confirmed`, `over_email_send_rate_limit`, `over_request_rate_limit`, `user_banned`, `captcha_failed`, `weak_password`, `otp_expired`, `already_registered`, `email_provider_disabled`, `signup_disabled`, network. Passato `err.code` in tutti i call-site.
- ✅ **Honeypot anti-bot** su login e register (submit ignorato silenziosamente se compilato).
- ✅ **Hook Turnstile dormiente** (`getCaptchaToken()`): si attiva solo con `window.__SUPABASE_CAPTCHA.siteKey` + provider abilitato in Supabase. Nessun claim falso.

### Codice (public/auth.html + public/css/auth.css)
- ✅ Honeypot fields (nascosti a utenti e screen reader, `aria-hidden`, `tabindex=-1`).
- ✅ `autocapitalize/autocorrect/spellcheck` off sulle email; `autocomplete` corretto (già presente).
- ✅ Meta `referrer: strict-origin-when-cross-origin`.

### Infrastruttura
- ✅ **vercel.json**: header globali (HSTS `max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`) + **CSP completa sulle rotte /auth** (script solo da self + jsdelivr + Turnstile; `object-src 'none'`; `base-uri 'self'`; `frame-ancestors 'none'`) + `Cross-Origin-Opener-Policy: same-origin`.
- ✅ **supabase/rls.sql**: tabella `profiles` + trigger `handle_new_user`, storage RLS bucket `bandi` (own-file), revoche su funzioni security definer. Idempotente.

---

## Cosa manca (pre-lancio, richiede azione umana)

| # | Item | Dove | Nota |
|---|---|---|---|
| 1 | **Redirect whitelist Supabase** | Supabase Dashboard → Auth → URL Configuration | Aggiungere `https://concorso-ai.vercel.app/auth.html`, `/auth`, `/dashboard.html`, `/dashboard` |
| 2 | **Provider Google** | Supabase Dashboard → Auth → Providers | Abilitare Google (client ID/secret dal Google Cloud Console) |
| 3 | **Template email** (conferma + recovery) | Supabase Dashboard → Auth → Email Templates | Personalizzare da default; la recovery deve puntare a `/auth.html?type=recovery` |
| 4 | **Rate limit tuning** | Supabase Dashboard → Auth → Rate Limits | Verificare default (≈ login 60/h, signup/recovery 30/h per IP); alzare signup se servono beta |
| 5 | **SMTP custom** (opzionale) | Supabase Dashboard → Auth → SMTP | Il default Supabase ha limite di invio; con volume reale serve SMTP |
| 6 | **Backup automatici + billing alerts** | Supabase Dashboard → Project Settings | Abilitare entrambi |
| 7 | **Eseguire `supabase/rls.sql`** | SQL Editor | Creare profiles + policy storage (idempotente) |
| 8 | **Delete account** | Futuro | Richiede Edge Function con service role (`admin.deleteUser`); RLS/storage pronti, funzione da scrivere |
| 9 | **MFA/2FA** | Futuro | Valutare per piano Pro; non previsto per il Free |

---

## Problemi trovati e risolti

| Problema | Fix |
|---|---|
| `signUp` senza `emailRedirectTo` → link conferma su default progetto | Aggiunto redirect a `/auth.html?mode=login` |
| Errori Supabase mappati solo su messaggio (fragile, lingue diverse) | Mapping primario per `err.code` |
| Utente già loggato su `/auth` vedeva il form | Guard con `getUser()` (server-validated) |
| Nessun anti-bot | Honeypot + hook Turnstile pronto |
| Nessun security header su Vercel | Header globali + CSP su /auth |
| Nessuna RLS per storage/profiles | `supabase/rls.sql` |

---

## Decisioni architetturali

1. **Token in localStorage** (non cookie HttpOnly): vincolo dello static hosting. Mitigato da CSP stretta, zero `innerHTML`, nessun contenuto utente renderizzato. Documentato come rischio residuo (§10 di auth-architecture).
2. **CSP solo su /auth**: dashboard/simulation hanno script inline → estenderla a tutto il sito richiede prima il refactor di quelle pagine (TODO sotto).
3. **Niente storageKey custom**: dashboard/simulation leggono la chiave default `sb-<ref>-auth-token`. Una chiave custom spezzerebbe il login.
4. **Niente campo nome alla signup**: dato chiesto in onboarding (profilo `profiles` già pronto in rls.sql).
5. **Anti-enumeration**: forgot password mostra sempre lo stesso messaggio, anche su errore.

---

## TODO tecnici

- [ ] Refactor script inline di `dashboard.html`/`simulation.html` (4 blocchi ciascuna) → estendere CSP a tutto il sito.
- [ ] Edge Function `delete-account` (service role) + UI in dashboard.
- [ ] Abilitare MFA per piano Pro.
- [ ] Aggiungere `security_headers` test in CI (es. `curl -I` su /auth).
- [ ] Monitorare la tabella `events` per picchi anomali di `auth_submit` (segnali di brute force).

---

## Stato complessivo

| Area | Stato |
|---|---|
| UI/UX auth | ✅ premium, coerente con landing (round 40) |
| Sicurezza client | ✅ round 41 (PKCE, guard, honeypot, error mapping) |
| Header HTTP | ✅ globali + CSP /auth |
| RLS database | ✅ esistente + rls.sql |
| Supabase Dashboard config | ⚠️ da completare (tabella # sopra) |
| Delete account / MFA | ⏳ futuri |
