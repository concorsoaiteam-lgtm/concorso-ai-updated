# ConcorsoAI — Auth Architecture

> Stato: **production-hardening round 41**
> Scritto da un punto di vista di Security Architect. Fonte di verità per il sistema di autenticazione.
> Documenti correlati: `md/auth-research.md` (perché di ogni scelta), `md/auth-review.md` (audit UX post-build), `md/auth-progress.md` (stato lavori), `supabase/rls.sql` (RLS + storage), `scripts/*.sql` (schema dati).

---

## 1. Stack e vincoli architetturali

| Livello | Scelta | Motivo |
|---|---|---|
| Hosting | Vercel static (`outputDirectory: public`) | Già in produzione; nessun server persistente |
| Auth provider | Supabase Auth (progetto `xhifnparcouxsypkjcmn`) | Già integrato da landing/dashboard/simulation |
| Client | `@supabase/supabase-js` v2 (UMD via CDN jsdelivr) | Stesso SDK di tutto il resto del prodotto |
| Auth flow | Authorization Code + **PKCE** (`flowType: "pkce"`) | Standard OAuth 2.1 per SPA; rifiuta implicit flow |
| Storage token | `localStorage` (default SDK) | Static hosting: impossibile usare cookie HttpOnly senza backend. Mitigato con CSP + zero `innerHTML` + testi statici |
| Password hash | Supabase (bcrypt, cost elevato) | Mai gestita lato client |

**Vincolo non negoziabile**: questa è una SPA statica. Non possiamo emettere cookie `HttpOnly` (richiede un server o Edge Function). La strategia è quindi: token in `localStorage` + **tutte** le mitigazioni XSS/CSRF disponibili lato static (CSP stretta, `textContent` ovunque, niente user content renderizzato, SameSite implicito perché niente cookie, PKCE).

---

## 2. Flow completo

```
Landing (/) ──CTA──▶ /auth.html?mode=register
                          │
        ┌─────────────────┼─────────────────────┐
        │ email+password   │ Google OAuth        │
        ▼                 ▼                     ▼
   signUp()          signInWithOAuth()      (redirect su supabase → Google → callback)
        │                 │
        ▼                 └──────▶ /dashboard.html (session creata, guard la trova)
   email di conferma
        │
        ▼  (click link → #access_token, detectSessionInUrl)
   /auth.html?mode=login ──guard──▶ /dashboard.html

Login:   /auth.html?mode=login ──signInWithPassword──▶ /dashboard.html
Recovery:/auth.html?mode=forgot ──resetPasswordForEmail──▶ pannello "email inviata"
         click link (type=recovery) ──▶ /auth.html?type=recovery ──▶ pannello reset
         updateUser({password}) ──▶ Supabase invalida TUTTE le sessioni ──▶ login
Logout:  dashboard ──signOut()──▶ revoca refresh token ──▶ / (session storage pulito)
```

---

## 3. Schermate (panelli di /auth)

| Pannello | Rotte | Comportamento |
|---|---|---|
| `panel-login` | `?mode=login` (default) | email + password + Google |
| `panel-register` | `?mode=register` | email + password (min 8) + terms. Niente nome (onboarding) |
| `panel-forgot` | click "Password dimenticata?" | email sola; **anti-enumeration**: stesso esito sempre |
| `panel-sent` | dopo signup/forgot | messaggio generico + "Invia di nuovo" con cooldown 4s |
| `panel-reset` | `?type=recovery` (deep link) | nuova password; richiede sessione recovery valida |

**Guard di sessione**: su `/auth` con sessione attiva (validata via `getUser()`, lato server) → redirect a `/dashboard.html`. **Eccezione**: `?type=recovery` non redirige mai (l'utente deve poter impostare la password anche da un dispositivo con sessione residua).

---

## 4. Session flow e token lifecycle

| Parametro | Valore | Note |
|---|---|---|
| Access token | JWT, ~1h | `autoRefreshToken: true` lo rinnova prima della scadenza |
| Refresh token | rotating, ~30gg | Ogni refresh ruota il token; il vecchio viene revocato |
| Reuse detection | Supabase lato server | Refresh token riusato → tutte le sessioni dell'utente revocate |
| Persistenza | `localStorage` (chiave default `sb-<ref>-auth-token`) | **NON** usiamo `storageKey` custom: dashboard/simulation creano client con default; una chiave diversa spezzerebbe il login |
| `detectSessionInUrl` | `true` | Necessario per deep link OAuth e recovery (`#access_token`, `#token_hash`) |
| Cambio password | — | `updateUser({password})` → Supabase **invalida tutte le sessioni esistenti** (OWASP: password change ⇒ revoca) |
| Logout | — | `signOut()` revoca il refresh token lato server e pulisce lo storage locale |

`getSession()` legge solo lo storage locale (veloce, ma non valida il token). `getUser()` valida il JWT lato server → è il metodo usato dal guard di sessione (anti-tamper dello storage).

---

## 5. Security flow

### 5.1 Autenticazione email/password
- **Hash**: gestito da Supabase (bcrypt). Mai in chiaro, mai nel client, mai nei log.
- **Minimo 8 caratteri** lato client (NIST 800-63B: lunghezza > complessità). Nessuna regola punitiva (niente obbligo maiuscole/simboli).
- **Rate limiting**: Supabase limita login/signup/recovery per IP+email (default ~30/h per endpoint, configurabile). Il client mappa gli errori `over_*_rate_limit` in messaggi chiari con suggerimento di attesa.

### 5.2 Email verification
- Obbligatoria per signup (config Supabase: "Confirm email" on). Fino alla conferma l'utente non può entrare (`email_not_confirmed` → messaggio dedicato).
- `signUp` ora passa `emailRedirectTo: origin + "/auth.html?mode=login"` così il link di conferma atterra su una pagina del nostro dominio (mai sul default del progetto).
- Il pannello "sent" offre resend con cooldown (4s client-side + rate limit server-side).

### 5.3 Password reset / recovery
- Link con token **monouso e con scadenza** (default 1h, configurabile) generato da Supabase.
- **Anti-enumeration**: il flusso forgot mostra lo stesso messaggio identico per email esistente e non esistente, anche in caso di errore.
- `redirectTo: origin + "/auth.html?type=recovery"` → il client intercetta `type=recovery` e mostra il pannello reset.
- La sessione recovery viene ottenuta da: (a) `detectSessionInUrl` se il link porta `#access_token`, oppure (b) `verifyOtp({type: "recovery", token_hash})` come fallback.
- Link scaduto/invalido → messaggio "Il link non è più valido" → ritorno a forgot.

### 5.4 Sessione
- Access token in memoria/localStorage, refresh automatico, rotazione, reuse detection (Supabase).
- Logout revoca server-side.
- Cambio password revoca tutte le sessioni (Supabase).
- **Niente cookie** ⇒ il classico attacco CSRF (cookie auto-allegato cross-site) non è applicabile: i token viaggiano nell'header `Authorization: Bearer`, che un sito terzo non può forgiare.

### 5.5 XSS (il rischio #1 in SPA con localStorage)
- CSP stretta sulle rotte `/auth` (script solo da `'self'` + jsdelivr + Turnstile).
- **Zero `innerHTML`/`insertAdjacentHTML`**: ogni scrittura DOM usa `textContent`.
- Nessun contenuto utente viene renderizzato (preview = dati statici).
- `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.

### 5.6 Bot protection
- Honeypot nascosto nei form (botte compilano i campi nascosti) → se valorizzato, il submit viene ignorato silenziosamente.
- Hook Turnstile **preparato ma dormiente**: `signUp` accetta `options.captchaToken`; si attiva quando verrà configurato un site key (`window.__SUPABASE_CAPTCHA.siteKey`) e il provider abilitato in Supabase. Nessun claim falso oggi.
- Rate limiting Supabase come rete di sicurezza server-side.

### 5.7 Header di sicurezza (vercel.json)
- **Globali (tutte le rotte)**: HSTS (`max-age=63072000; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`.
- **Solo `/auth` e `/auth.html`**: CSP completa (le altre pagine hanno script inline — CSP stretta le romperebbe; TODO: rifattorizzare dashboard/simulation e poi estendere la CSP a tutto il sito).

---

## 6. Redirect flow

| Flusso | redirectTo | Punto di arrivo |
|---|---|---|
| Conferma signup | `origin + "/auth.html?mode=login"` | Guard → dashboard |
| Reset password | `origin + "/auth.html?type=recovery"` | Pannello reset |
| Google OAuth | `origin + "/dashboard.html"` | Dashboard diretta |

**Da configurare in Supabase Dashboard** (Auth → URL Configuration):
- Site URL: `https://concorso-ai.vercel.app`
- Redirect URLs (whitelist): `https://concorso-ai.vercel.app/auth.html`, `https://concorso-ai.vercel.app/auth`, `https://concorso-ai.vercel.app/dashboard.html`, `https://concorso-ai.vercel.app/dashboard`
- Email templates: personalizzare conferma + recovery.

⚠️ **Host header injection**: i redirectTo sono costruiti da `window.location.origin`, mai dall'header `Host` → niente poisoning del link di reset (OWASP Forgot Password Cheat Sheet).

---

## 7. Edge cases

| Caso | Comportamento |
|---|---|
| CDN Supabase irraggiungibile | `guardSupabase()` → messaggio chiaro, mai bottone busy per sempre |
| Token scaduto su /auth | `getUser()` fallisce → si mostra il form (re-login) |
| Deep link recovery su dispositivo già loggato | Guard saltato per `type=recovery` → reset possibile |
| Link recovery scaduto | `verifyOtp` fallisce → "Il link non è più valido" → forgot |
| Email già registrata (signup) | Messaggio "Esiste già un account" → l'utente va su Accedi (non enumera in modo abusabile; è lo standard SaaS) |
| Rate limit email | Messaggio attesa + cooldown resend |
| Utente bannato | `user_banned` → messaggio dedicato |
| Botte | Honeypot → silenzioso no-op |
| Riduzione motion | Tutte le animazioni disattivate (prefers-reduced-motion) |
| Dati user in DOM | Mai renderizzati; solo `textContent` su testi statici |

---

## 8. Error handling e loading states

- **Validazione live**: al blur, poi live dopo il primo blur (Baymard). Mai solo a submit.
- **Errore globale** `role="alert"` + errori inline per campo con `aria-invalid`.
- **Mai spinner**: submit → stato busy sul bottone con barra indeterminata 1px; contenuti preview → **skeleton shimmer** (NN/g perceived performance).
- **Traduzione errori**: mapping per codice Supabase (`err.code`) + fallback sul messaggio: `invalid_credentials`, `email_not_confirmed`, `over_email_send_rate_limit`, `over_request_rate_limit`, `user_banned`, `captcha_failed`, `weak_password`, `otp_expired`, `email_provider_disabled`, `signup_disabled`, `network`.
- **Mai log di segreti**: solo `console.debug` con `err.message` (mai token/password). Niente dati sensibili nei log.

---

## 9. Access control e interazione database

### 9.1 Principi
- **Anon key nel frontend** (pubblica, non è un segreto) — la vera protezione è RLS, non la chiave.
- **Service role key**: SOLO server-side (Edge Function). Mai nel client. Nessuna chiave `service_role` presente nel frontend.
- **Least privilege**: le policy RLS concedono solo ciò che serve (select/insert/update/delete sulla propria riga).

### 9.2 Policy RLS esistenti (già applicate in `scripts/*.sql`)
| Tabella | Policy | Nota |
|---|---|---|
| `simulazioni` | select/insert/update/delete `auth.uid() = user_id` | ✓ |
| `bandi` | select/insert/delete `auth.uid() = user_id` | ✓ |
| `piano_settimanale` | select/insert/update/delete `auth.uid() = user_id` | ✓ + trigger week-start |
| `streak` | select/insert/update/delete `auth.uid() = user_id` | ✓ + trigger guard |
| `events` | insert `WITH CHECK (true)` (anon telemetry) + select own | ✓ — insert anonimo voluto per analytics; nessun dato sensibile |
| `waitlist` | insert/select `true` | ✓ (lista pubblica di attesa) |

### 9.3 Da aggiungere (`supabase/rls.sql`)
1. Tabella `profiles` (id = auth.users.id, display_name, created_at) + trigger `handle_new_user` → RLS own-row. Preparata per l'onboarding futuro.
2. **Storage RLS**: bucket privato per i PDF dei bandi (`bandi/`) — policy: autenticato legge/scrive SOLO i propri file (`(storage.foldername(name))[1] = auth.uid()::text`). Idempotente (DO block), non rompe nulla se il bucket non esiste.
3. `REVOKE` espliciti + commenti di hardening (revoke public su funzioni, niente `security definer` non necessario).

### 9.4 API interaction
- Il client parla SOLO con le API Supabase (auth + PostgREST + storage) attraverso l'anon key.
- Nessun endpoint custom oggi. In futuro (Edge Functions per delete account/payment): autenticazione con JWT dell'utente + verifica ruolo, mai fidarsi dell'input client.

---

## 10. Threat model

| Minaccia | Vettore | Mitigazione |
|---|---|---|
| Credential stuffing / brute force | login API | Rate limiting Supabase per IP+email; messaggi generici |
| User enumeration | forgot password | Messaggio identico sempre; niente "email inesistente" |
| Token theft via XSS | localStorage | CSP, zero innerHTML, niente user content nel DOM |
| CSRF | cookie auto-allegati | Nessun cookie: bearer header non forgiabile cross-site |
| Token in URL (implicit flow) | OAuth | PKCE + Authorization Code; niente token nell'URL finale |
| Refresh token theft/replay | storage compromesso | Rotazione + reuse detection (revoca tutto) |
| Session fixation | login | Nuova sessione emessa a ogni login; logout revoca |
| Link reset poisoning | Host header | redirectTo da `location.origin`, mai da `Host` |
| Clickjacking | iframe | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| MITM | rete | HSTS + HTTPS-only (Vercel) |
| Data breach (DB) | Supabase | Hash bcrypt, RLS, least privilege, backup automatici Supabase |
| Banned account | — | `user_banned` → messaggio dedicato |

**Rischi residui dichiarati**:
1. `localStorage` è vulnerabile a XSS persistente — mitigato ma non eliminabile su static hosting. Evoluzione: Edge Function per cookie HttpOnly (TODO).
2. CSP stretta solo su `/auth` (le altre pagine hanno script inline). TODO: refactor dashboard/simulation → CSP globale.
3. Niente MFA/2FA oggi — coerente con un onboarding zero-friction; valutare per piano Pro (TODO).
4. Delete account: richiede Edge Function con service role (`admin.deleteUser`) — preparata la tabella `profiles` con cascade, resta la funzione server-side da scrivere (TODO).

---

## 11. Compliance checklist (OWASP/security, mapping)

| Requisito | Stato |
|---|---|
| Password hash (bcrypt via Supabase) | ✅ gestito da provider |
| Email verification | ✅ obbligatoria |
| Password reset con scadenza | ✅ token monouso 1h |
| Session expiration + refresh | ✅ JWT 1h + refresh rotating |
| HttpOnly cookies | ⚠️ N/A su static hosting (documentato) — bearer token + CSP |
| Secure/SameSite cookies | ⚠️ N/A (nessun cookie) |
| HTTPS only / HSTS | ✅ header HSTS globali |
| CSRF protection | ✅ nessun cookie + bearer header |
| XSS protection | ✅ CSP /auth + textContent ovunque |
| Rate limiting login/register/forgot | ✅ Supabase (server-side) + UX mappata |
| Bot protection | ✅ honeypot + hook Turnstile pronto |
| RLS su ogni tabella | ✅ esistente + `rls.sql` per profiles/storage |
| Least privilege | ✅ policy own-row; service role mai in frontend |
| Env vars / secret management | ✅ anon key pubblica (non segreta); service role solo server |
| Nessuna password/token nei log | ✅ |
| Errori generici / anti-enumeration | ✅ |
| Logout invalida sessione | ✅ signOut revoca |
| Cambio password invalida sessioni | ✅ Supabase revoca tutte |
| Validazione server-side | ✅ Supabase valida; RLS applica |
| Validazione client-side | ✅ live |
| Security headers | ✅ globali + CSP auth |
| CSP / Referrer / HSTS / XFO / XCTO | ✅ |
| Input sanitization | ✅ textContent; upload → policy storage RLS |
| Access control su ogni endpoint | ✅ RLS su tutte le tabelle |
| Solo l'utente legge i propri dati | ✅ `auth.uid() = user_id` |

---

## 12. Ordine di lettura

1. `md/auth-research.md` — evidenze dietro le scelte
2. questo documento — architettura e threat model
3. `supabase/rls.sql` + `scripts/*.sql` — schema e RLS
4. `public/auth.html` → `public/css/auth.css` → `public/js/auth.js` — implementazione
5. `md/auth-review.md` — audit UX
6. `md/auth-progress.md` — stato e TODO pre-lancio
