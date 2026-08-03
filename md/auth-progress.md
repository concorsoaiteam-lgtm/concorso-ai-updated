# ConcorsoAI — Auth Progress Log

> Aggiornato: round 41 (production hardening)
> Regola: il progetto non viene MAI lasciato in uno stato incompleto. Questo file è la fonte di verità sullo stato.

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
| 4 | **Rate limit tuning** | Supabase Dashboard → Auth → Rate Limits | Verificare default (30/h per endpoint); alzare signup se servono beta |
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
