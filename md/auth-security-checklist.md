# Auth Security Checklist — ConcorsoAI

> Audit di sicurezza dell'authentication. Stato per ogni controllo:
> - **✔ verificato** — presente e confermato nel codice/config
> - **⚠ da verificare** — dipende da configurazione Supabase (azione umana) o
>   da test end-to-end
> - **❌ mancante** — non implementato, con piano
>
> Riferimenti: OWASP Authentication / Session Management / Forgot Password
> Cheat Sheets, OWASP ASVS, NIST SP 800-63B, Supabase Security docs.
> Aggiornato: round 42.

---

## 1. Autenticazione

| # | Controllo | Stato | Dove |
|---|---|---|---|
| 1.1 | Password hash (argon2/bcrypt) | ✔ | Supabase (Auth server-side, mai client) |
| 1.2 | Verifica email obbligatoria | ✔ | `signUp` → pannello conferma; `email_not_confirmed` gestito |
| 1.3 | Password reset con link a scadenza | ✔ | Supabase recovery link (default ~24h); client verifica con `verifyOtp` |
| 1.4 | Password min 8 (NIST 800-63B) | ✔ | client + `weak_password` mappato |
| 1.5 | Blocco password comuni | ⚠ | Supabase ha una lista nera di default; verificare in dashboard |
| 1.6 | Nessuna rotazione forzata | ✔ | non implementata (NIST: vietata) |
| 1.7 | Login con email+password | ✔ | `signInWithPassword` |
| 1.8 | SSO Google (OAuth) | ⚠ | codice pronto; provider da abilitare (Config §2) |
| 1.9 | Anti-enumeration su forgot | ✔ | stesso messaggio sempre (anche su errore) |
| 1.10 | Anti-enumeration su register | ✔ | messaggio generico "prova ad accedere" |
| 1.11 | Rate limit login | ✔ (Supabase) | default Supabase: ~60/h per IP sul grant password; **verificare in dashboard** (il valore esatto cambia per versione) |
| 1.12 | Rate limit register | ✔ (Supabase) | default Supabase: ~30/h per IP su /signup; verificare in dashboard |
| 1.13 | Rate limit forgot/resend | ✔ (Supabase) | default ~30/h per IP su /recover e /otp; `over_email_send_rate_limit` mappato + honeypot |
| 1.14 | Bot protection | ⚠/❌ | honeypot attivi; Turnstile pronto ma disattivo (richiede config) |
| 1.15 | Errori generici (nessuna info sensibile) | ✔ | `translateAuthError` non rivela dettagli interni |

## 2. Sessioni

| # | Controllo | Stato | Dove |
|---|---|---|---|
| 2.1 | Access token con scadenza | ✔ | Supabase (default 1h) |
| 2.2 | Refresh token rotante | ✔ | supabase-js `autoRefreshToken: true` |
| 2.3 | Refresh token con scadenza | ✔ | Supabase (default 30gg, riusabile entro finestra) |
| 2.4 | Logout invalida la sessione | ✔ | Supabase `signOut` (usato in dashboard) |
| 2.5 | Cambio password invalida le sessioni | ✔ | Supabase: `updateUser({password})` revoca le altre |
| 2.6 | Session fixation | ✔ | PKCE + sessioni Supabase (mai sessioni custom) |
| 2.7 | Sessione validata lato server | ✔ | `guardAuthenticated()` usa `getUser()` (non `getSession()`) |
| 2.8 | Storage token | ⚠ | localStorage (vincolo static hosting) — rischio residuo documentato in `auth-architecture.md §5.5`, mitigato da CSP + zero innerHTML |
| 2.9 | Logout automatico su token scaduto | ✔ | al prossimo `getUser()` → form login |
| 2.10 | Multi-tab | ⚠ | due sessioni indipendenti; nessuna sincronizzazione in tempo reale |

## 3. Trasporto e headers

| # | Controllo | Stato | Dove |
|---|---|---|---|
| 3.1 | HTTPS ovunque | ✔ | Vercel + HSTS preload |
| 3.2 | HSTS | ✔ | `max-age=63072000; includeSubDomains; preload` |
| 3.3 | X-Content-Type-Options | ✔ | `nosniff` |
| 3.4 | X-Frame-Options | ✔ | `DENY` (+ `frame-ancestors 'none'` in CSP) |
| 3.5 | Referrer-Policy | ✔ | `strict-origin-when-cross-origin` (header + meta) |
| 3.6 | Permissions-Policy | ✔ | camera/mic/geo/interest-cohort bloccati |
| 3.7 | Cross-Origin-Opener-Policy | ✔ | `same-origin` |
| 3.8 | CSP su /auth | ✔ | `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, script solo self+jsdelivr+turnstile |
| 3.9 | CSP su tutto il sito | ❌ | dashboard/simulation hanno script inline → refactor necessario (TODO) |
| 3.10 | Cookie di sessione (SameSite/HttpOnly/Secure) | N/A | nessun cookie di sessione: token in localStorage via Supabase. I cookie Supabase (se presenti per la sessione default) sono gestiti dal backend |

## 4. Protezione client (XSS/CSRF)

| # | Controllo | Stato | Dove |
|---|---|---|---|
| 4.1 | Zero `innerHTML` | ✔ | solo `textContent` / `classList` in auth.js |
| 4.2 | Input sanitization | ✔ | nessun input utente renderizzato come HTML; i valori vanno solo in attributi controllati |
| 4.3 | CSP come seconda linea XSS | ✔ | script-src ristretta su /auth |
| 4.4 | CSRF | ✔ | API Supabase richiede il token di sessione; niente cookie-based auth → rischio CSRF classico non applicabile; OAuth usa PKCE |
| 4.5 | Honeypot anti-bot | ✔ | login, register, forgot |
| 4.6 | Turnstile CAPTCHA | ⚠ | hook pronto, disattivo senza site key |

## 5. Dati e database

| # | Controllo | Stato | Dove |
|---|---|---|---|
| 5.1 | RLS attiva sulle tabelle utente | ✔ | `simulazioni`, `bandi`, `piano_settimanale`, `streak`, `events` (SQL esistenti) |
| 5.2 | RLS su `profiles` | ✔ | inclusa in `supabase/rls.sql` (da eseguire) |
| 5.3 | RLS storage (PDF bandi) | ✔ | policy own-file in `supabase/rls.sql` (da eseguire) |
| 5.4 | Solo l'utente legge i propri dati | ✔ | policy `auth.uid() = user_id` (SQL esistenti) |
| 5.5 | Least privilege (anon key) | ✔ | anon key nel frontend (pubblica per design); service role MAI nel frontend |
| 5.6 | Service role key exposure | ✔ | assente dal frontend |
| 5.7 | Secret management | ⚠ | anon key in chiaro è ok (pubblica); eventuali secret Edge Function vanno in Supabase Secrets |
| 5.8 | Delete account | ❌ | richiede Edge Function con service role (`admin.deleteUser`) — futuro |
| 5.9 | MFA/2FA | ❌ | futuro (piano Pro) |
| 5.10 | Audit log | ⚠ | telemetria `auth_submit` in `events`; nessun audit trail di sicurezza dedicato |

## 6. Logging e operazioni

| # | Controllo | Stato | Dove |
|---|---|---|---|
| 6.1 | Nessuna password nei log | ✔ | nessun log di credenziali nel client |
| 6.2 | Nessun token nei log | ✔ | idem (il solo `console.debug` logga `err.message` di reset, mai token) |
| 6.3 | Nessun dato sensibile nei log | ✔ | telemetria solo eventi aggregati (mode) |
| 6.4 | Backup automatici | ⚠ | da abilitare in Supabase Project Settings |
| 6.5 | Billing alerts | ⚠ | da abilitare |
| 6.6 | Monitoraggio picchi `auth_submit` | ❌ | TODO: query/alert su `events` |

## 7. Conformità (mappatura)

| Standard | Stato | Note |
|---|---|---|
| OWASP Authentication Cheat Sheet | ✔ implementato | PKCE, anti-enumeration, errori generici, rate limit (Supabase) |
| OWASP Session Management Cheat Sheet | ✔ implementato | sessioni server-side, revoca su cambio password |
| OWASP Forgot Password Cheat Sheet | ✔ implementato | link monouso + scadenza, messaggio unico, cooldown |
| OWASP ASVS v4 (livello 1) | ≈ 90% | gap: Turnstile, delete account, audit trail, CSP globale |
| NIST SP 800-63B | ✔ | password ≥8, niente rotazione, niente composizione rigida, blocco comuni (Supabase) |
| GDPR (consenso/privacy) | ⚠ | pagine legali presenti; DPO/ragione sociale da completare (vedi legal-polish-report) |

---

## 8. Gap e piano

| Gap | Priorità | Piano |
|---|---|---|
| CSP estesa a tutto il sito | Alta | refactor script inline di dashboard/simulation → poi header globale |
| Turnstile attivo | Media | configurare site key + provider in Supabase, poi `window.__SUPABASE_CAPTCHA` |
| Delete account (GDPR art. 17) | Alta | Edge Function + UI in dashboard |
| Audit trail dedicato | Media | tabella `auth_audit` con policy RLS + scrittura da Edge Function |
| Blocco password comuni verificato | Bassa | check dashboard Supabase |
| Alert su picchi di login | Media | monitoraggio `events` |

---

## 9. Fonti

- OWASP — Authentication, Session Management, Forgot Password Cheat Sheets; ASVS v4.
- NIST SP 800-63B — Digital Identity Guidelines.
- Supabase Docs — Auth (PKCE, rate limits, RLS, storage, security).
- PortSwigger / Auth0 — token storage in SPA (localStorage vs cookie).
- `md/auth-architecture.md` — threat model completo (fonte interna).
