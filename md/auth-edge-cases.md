# Auth Edge Cases — ConcorsoAI

> Progettazione UX di ogni scenario limite del sistema di autenticazione.
> Ogni scenario risponde a: cosa vede / cosa succede / cosa può fare /
> copy / CTA / comportamento UX. L'obiettivo è che **nessun caso resti
> scoperto**: l'utente non deve mai trovarsi in una pagina "morta".
>
> Convenzione colonna "Gestito da":
> - **Codice** — già gestito in `js/auth.js` (round 40-42)
> - **Supabase** — comportamento nativo del backend (verificare in dashboard)
> - **Config** — richiede configurazione umana in Supabase Dashboard (pre-lancio)
> - **Futuro** — non implementato, decisione differita

---

## 0. Mappa scenari → stato

| # | Scenario | Stato attuale | Gestito da |
|---|---|---|---|
| 1 | Utente cambia tab / torna dopo 20 minuti | ✅ sessione ancora viva (access token 1h, refresh automatico) | Supabase |
| 2 | Utente torna dopo 3 giorni | ✅ refresh token rinnova la sessione (validità default 30gg) | Supabase |
| 3 | Link recovery scaduto | ✅ errore + redirect al pannello forgot | Codice |
| 4 | Link recovery già usato | ✅ stessa gestione del punto 3 | Codice |
| 5 | Token non valido / malformato | ✅ `getSession()` fallisce → pannello reset → errore → forgot | Codice |
| 6 | Sessione scaduta durante l'uso | ✅ `getUser()` non valido → form login (guard) | Codice |
| 7 | Rete assente | ⚠️ errore generico + bottone riabilitato; niente stato morto | Codice |
| 8 | Supabase offline | ⚠️ `guardSupabase()` + error mapping "failed to fetch" | Codice |
| 9 | Google login fallito | ⚠️ errore tradotto, utente resta sul form | Codice |
| 10 | Popup Google chiuso | ⚠️ nessun feedback (limitazione OAuth); accettabile | Supabase |
| 11 | Rate limit (signup/login/recovery/email) | ✅ messaggi dedicati per codice | Codice + Supabase |
| 12 | Email non verificata | ✅ `email_not_confirmed` → messaggio con recovery action | Codice |
| 13 | Logout da altro dispositivo | ✅ sessione locale invalidata al prossimo refresh | Supabase |
| 14 | Due tab aperte | ⚠️ due sessioni indipendenti; logout da un tab non uccide l'altro | Supabase |
| 15 | Refresh durante il flusso | ✅ stato deep-linkable su login/register/forgot/reset | Codice |
| 16 | Back del browser | ✅ history.replaceState → URL pulito, pannello coerente | Codice |
| 17 | Browser chiuso e riaperto | ✅ persistSession (localStorage) ripristina | Supabase |
| 18 | Sessione ripristinata | ✅ autoRefreshToken la mantiene viva | Supabase |
| 19 | Password cambiata (reset) | ✅ Supabase invalida le sessioni esistenti; toast + redirect | Codice + Supabase |
| 20 | Logout automatico (token revocato) | ✅ al prossimo `getUser()` → form login | Codice |

---

## 1. Sessioni

### 1.1 Utente cambia tab e torna dopo 20 minuti
- **Cosa vede**: la pagina è esattamente dove l'aveva lasciata (stato del form conservato dal DOM; niente ricaricamento forzato).
- **Cosa succede**: l'access token (default 1h) è ancora valido; `autoRefreshToken` non è nemmeno intervenuto.
- **Cosa può fare**: continuare a digitare o premere submit.
- **Copy**: nessuna necessaria.
- **CTA**: invariate.
- **Comportamento UX**: zero interventi. La sessione vive finché l'utente non fa un'azione che richiede validazione.

### 1.2 Utente torna dopo 3 giorni
- **Cosa vede**: il form login (o register). Nessun messaggio.
- **Cosa succede**: se c'era una sessione in localStorage, `guardAuthenticated()` → `getUser()`: con refresh token valido (default 30gg) la sessione si rinnova → redirect a dashboard. Se il refresh token è scaduto/revocato → form, silenziosamente.
- **Cosa può fare**: accedere di nuovo.
- **Copy**: nessuna (non è un errore).
- **CTA**: "Entra".
- **Comportamento UX**: il passaggio da "sessione scaduta" a login è **invisibile e senza sensi di colpa** (mai "la sessione è scaduta" con tono accusatorio).

### 1.3 Sessione scaduta durante l'uso (utente in dashboard)
- **Cosa vede**: al prossimo refresh/azione protetta, redirect a `/auth.html` con il form login.
- **Cosa succede**: `getUser()` server-side fallisce → guard lo manda al form.
- **Cosa può fare**: riaccedere.
- **Copy**: nessuna (il redirect è la comunicazione).
- **CTA**: "Entra".
- **Comportamento UX**: il redirect deve avvenire **prima** che l'utente tenti azioni protette, non dopo un errore a metà flusso. Il guard su `/auth` copre il caso "torno dopo tanto"; il caso "in uso" è competenza di dashboard (TODO: intercettare 401 in dashboard e redirect a /auth).

### 1.4 Browser chiuso e riaperto
- **Cosa vede**: niente — la sessione è ripristinata automaticamente (persistSession in localStorage, chiave default `sb-<ref>-auth-token`).
- **Cosa succede**: al load, `getUser()` valida il JWT; se ok → nessuna richiesta di login.
- **Cosa può fare**: continuare.
- **Copy**: nessuna.
- **CTA**: nessuna.
- **Comportamento UX**: il ripristino è silenzioso. **Rischio residuo noto**: token in localStorage (vincolo static hosting) — mitigato da CSP stretta su /auth e zero innerHTML (vedi `auth-architecture.md §5.5`).

### 1.5 Logout da un altro dispositivo
- **Cosa vede**: sul dispositivo A, la sessione muore al prossimo refresh/azione protetta.
- **Cosa succede**: Supabase revoca le sessioni; `getUser()` torna 401.
- **Cosa può fare**: riaccedere con la password.
- **Copy**: nessuna.
- **CTA**: "Entra".
- **Comportamento UX**: logout globale è il comportamento desiderato per sicurezza; non serve UI specifica.

### 1.6 Due tab aperte
- **Cosa vede**: entrambe funzionano indipendentemente.
- **Cosa succede**: ogni tab ha il proprio client in memoria ma condivide lo stesso storage → i token si sincronizzano.
- **Cosa può fare**: nessuna azione necessaria.
- **Copy**: nessuna.
- **CTA**: nessuna.
- **Comportamento UX**: accettato. Nota: un logout dal tab B NON invalida il tab A in tempo reale (limite di architettura statica); al prossimo `getUser()` il tab A si accorge della revoca.

---

## 2. Link di recovery

### 2.1 Link recovery scaduto (default Supabase: ~24h)
- **Cosa vede**: pannello "Imposta la nuova password" → al submit: errore globale *"Il link non è più valido. Richiedine uno nuovo."* e ritorno al pannello "Recupera la password".
- **Cosa succede**: `ensureRecoverySession()` fallisce (nessuna sessione da `verifyOtp`, token scaduto).
- **Cosa può fare**: richiedere un nuovo link dal pannello forgot.
- **Copy** (errore): "Il link non è più valido. Richiedine uno nuovo."
- **CTA**: "Invia il link".
- **Comportamento UX**: l'errore arriva **subito al primo submit**, mai dopo aver digitato la password a vuoto due volte. Nessun sensazionalismo.

### 2.2 Link recovery già usato
- **Cosa vede**: identico a 2.1.
- **Cosa succede**: il token è monouso; il secondo `verifyOtp` fallisce.
- **Cosa può fare**: richiedere un nuovo link.
- **Copy / CTA**: come 2.1.
- **Comportamento UX**: non dire mai "questo link è già stato usato" (dettaglio inutile); il messaggio unico copre entrambi i casi.

### 2.3 Token non valido / malformato (link manipolato)
- **Cosa vede**: il pannello reset compare; al submit → stesso errore "link non valido" → forgot.
- **Cosa succede**: `token_hash` assente o non decodificabile → `getSession()` vuoto, `verifyOtp` fallisce.
- **Cosa può fare**: richiedere un nuovo link.
- **Copy / CTA**: come 2.1.
- **Comportamento UX**: **mai crashare** su hash malformato: `getParams()` è in try/catch, `verifyOtp` in catch → boolean false.

### 2.4 Password reimpostata con successo
- **Cosa vede**: toast *"Password aggiornata. Stai entrando…"* e redirect a dashboard dopo ~900ms.
- **Cosa succede**: `updateUser({password})` → Supabase invalida tutte le sessioni precedenti → nuova sessione attiva.
- **Cosa può fare**: niente (redirect automatico).
- **Copy**: toast sopra.
- **CTA**: nessuna.
- **Comportamento UX**: il toast dà chiusura prima del redirect; il timing (900ms) è appena percettibile, non un'animazione di attesa.

---

## 3. Rete e backend

### 3.1 Rete assente (submit senza connessione)
- **Cosa vede**: bottone torna attivo + errore *"Problema di connessione. Riprova tra qualche secondo."* (o il generico).
- **Cosa succede**: la fetch fallisce → catch → `translateAuthError` con "failed to fetch"/network → bottone riabilitato.
- **Cosa può fare**: riprovare quando torna la rete; i campi sono ancora compilati (nessun reset del form).
- **Copy**: "Problema di connessione. Riprova tra qualche secondo."
- **CTA**: il bottone stesso.
- **Comportamento UX**: **niente stato busy infinito**. Il bottone si riabilita sempre nel catch. I dati digitati NON vengono persi.

### 3.2 Supabase offline / CDN irraggiungibile
- **Cosa vede**: se il CDN non è caricato al load → al submit: *"Servizio non raggiungibile. Controlla la connessione e riprova."* (`guardSupabase()`).
- **Cosa succede**: `supabaseClient` è null; ogni handler esce prima di toccare il DOM in stato busy.
- **Cosa può fare**: riprovare; ricaricare la pagina.
- **Copy**: "Servizio non raggiungibile. Controlla la connessione e riprova."
- **CTA**: il bottone.
- **Comportamento UX**: mai un bottone bloccato per sempre senza feedback (fix round 40).

### 3.3 Rate limit Supabase
- **Cosa vede**: messaggi dedicati per codice:
  - *"Troppe email in poco tempo. Aspetta qualche minuto e riprova."* (over_email_send_rate_limit)
  - *"Troppi tentativi. Aspetta un minuto e riprova."* (over_request_rate_limit)
- **Cosa succede**: Supabase risponde 429 con codice specifico.
- **Cosa può fare**: attendere e riprovare (nessun countdown, nessuna ansia).
- **Copy**: sopra.
- **CTA**: il bottone (riabilitato).
- **Comportamento UX**: il messaggio dice **quanto aspettare in modo vago ma rassicurante** ("qualche minuto"), mai un timer che scorre (pattern ansia). Il resend button si disabilita 4s per mano nostra (cooldown locale).

### 3.4 Email non verificata (tenta login)
- **Cosa vede**: errore *"Conferma prima la tua email: trovi il link nella casella (o nello spam)."*
- **Cosa succede**: Supabase restituisce `email_not_confirmed`.
- **Cosa può fare**: aprire l'email di conferma, o fare una nuova registrazione con la stessa email (Supabase reinvia il link).
- **Copy**: sopra.
- **CTA**: riprovare dopo la conferma.
- **Comportamento UX**: il messaggio **non colpevolizza** e dà una recovery action immediata (dove cercare).

---

## 4. Google OAuth

### 4.1 Login Google fallito (errore provider)
- **Cosa vede**: errore tradotto in alto (`translateAuthError`).
- **Cosa succede**: `signInWithOAuth` catch → messaggio.
- **Cosa può fare**: riprovare o usare email+password.
- **Copy**: "Qualcosa non ha funzionato. Riprova tra qualche secondo." (o specifico se disponibile).
- **CTA**: "Continua con Google" / fallback email.
- **Comportamento UX**: il fallback email è **sempre visibile** (mai OAuth-only).

### 4.2 Popup Google chiuso dall'utente
- **Cosa vede**: la pagina resta sul form; nessun errore.
- **Cosa succede**: il popup viene chiuso → nessun callback di errore affidabile da Supabase con flow popup.
- **Cosa può fare**: ritentare o usare email.
- **Copy**: nessuna (evitare messaggi che puniscono la scelta dell'utente).
- **CTA**: invariate.
- **Comportamento UX**: **accettato come non-caso**. Nota: usiamo redirect flow (non popup) → in realtà il browser naviga a Google e torna; la chiusura manuale è quindi un caso raro. Da verificare in produzione.

### 4.3 Google non configurato (provider disabilitato)
- **Cosa vede**: redirect a una pagina di errore Supabase, oppure niente.
- **Cosa succede**: `signInWithOAuth` fallisce perché il provider non è abilitato.
- **Cosa può fare**: usare email+password.
- **Copy**: l'errore Supabase viene mostrato nel box globale.
- **CTA**: fallback email.
- **Comportamento UX**: pre-lancio richiede la configurazione (vedi checklist). Il fallback email resta l'unico percorso garantito.

---

## 5. Navigazione e stato

### 5.1 Refresh durante il flusso
- **Cosa vede**: il pannello corretto:
  - `/auth.html` → login
  - `/auth.html?mode=register` → register
  - `/auth.html?mode=forgot` → forgot (round 42)
  - `/auth.html?type=recovery` → reset
- **Cosa succede**: `init()` legge i parametri e mostra il pannello giusto; l'URL è sempre coerente con lo stato via `history.replaceState`.
- **Cosa può fare**: continuare da dov'era.
- **Copy**: nessuna.
- **CTA**: invariate.
- **Comportamento UX**: **nessun pannello si perde al refresh**. Lo stato "email inviata" è volutamente NON deep-linkable (stato transitorio).

### 5.2 Back del browser
- **Cosa vede**: la pagina con URL pulito (`/auth.html`, niente query sporche).
- **Cosa succede**: `replaceState` evita di inquinare la history; il back non crea stati incoerenti.
- **Cosa può fare**: nulla di speciale.
- **Copy**: nessuna.
- **CTA**: invariate.
- **Comportamento UX**: la history non si riempie di `?mode=register` → `?mode=forgot` → ... L'utente che preme back esce dalla pagina, non naviga tra pannelli a ritroso (comportamento atteso).

### 5.3 Doppio submit / click ripetuto
- **Cosa vede**: un solo submit.
- **Cosa succede**: `setBusy()` disabilita il bottone (pointer-events + disabled) durante l'operazione.
- **Cosa può fare**: aspettare il completamento.
- **Copy**: label busy ("Accesso in corso…").
- **CTA**: disabilitata.
- **Comportamento UX**: niente doppie registrazioni, niente doppi invii email.

### 5.4 Torna alla home
- **Cosa vede**: link "← Torna alla home" in alto a destra.
- **Cosa succede**: naviga a `/` (landing).
- **Cosa può fare**: rientrare in auth quando vuole.
- **Copy**: "← Torna alla home".
- **CTA**: link brand + link home.
- **Comportamento UX**: l'uscita è sempre disponibile ma mai invadente (nessun menu).

---

## 6. Protezione abuso

### 6.1 Bot che compila gli honeypot
- **Cosa vede**: i bot — niente (submit ignorato silenziosamente).
- **Cosa succede**: i campi `hp-field*` (nascosti a utenti e screen reader) vengono valorizzati dai bot → il submit viene scartato senza costo server.
- **Cosa può fare**: niente (è un non-event).
- **Copy**: nessuna.
- **CTA**: nessuna.
- **Comportamento UX**: il fallimento è silenzioso per non rivelare la difesa. Turnstile resta disponibile come livello successivo (`getCaptchaToken()`, dormiente).

### 6.2 Email-bombing sul recovery
- **Cosa vede**: l'utente legittimo — il normale pannello "email inviata".
- **Cosa succede**: honeypot sul form forgot + rate limit Supabase (30/h per endpoint di default).
- **Cosa può fare**: nulla di diverso dal normale.
- **Copy**: invariata (anti-enumeration).
- **CTA**: "Invia di nuovo" (cooldown 4s).
- **Comportamento UX**: stesso messaggio per email esistente e inesistente (anti-enumeration, OWASP).

---

## 7. Casi volutamente NON gestiti (decisioni)

| Caso | Perché non gestito | Quando rivedere |
|---|---|---|
| "La sessione è scaduta" come messaggio | La UX migliore è il redirect silenzioso al login | — |
| Countdown rate limit | Pattern ansia, vietato dal brand | — |
| Conferma email "password" | Ridondante con toggle + meter (Baymard/NIST) | — |
| Magic link | Backend non lo espone | Se Supabase lo renderà nativo |
| Login con telefono | Fuori scope del prodotto | Mai |
| Verifica email con OTP manuale | Il flusso email-link è sufficiente | Se gli utenti lo chiederanno |

---

## 8. Matrice di verifica pre-lancio

1. **Testare** il flusso recovery completo con email reale (dipende da Config §2.1-2.4 in `auth-progress.md`).
2. **Verificare** la scadenza default dei link (Supabase → Auth → email templates).
3. **Decidere** se intercettare i 401 in dashboard con redirect a `/auth` (TODO tecnico).
4. **Valutare** `storage` event listener per sincronizzare le due tab (opzionale, caso 1.6).

---

## 9. Fonti

- OWASP Authentication / Session Management / Forgot Password Cheat Sheets.
- NIST SP 800-63B (sessioni, revoca).
- Supabase Docs — Auth (session lifetime, refresh token, recovery link expiry, rate limits).
- Nielsen Norman Group — error recovery, session UX.
- `md/auth-architecture.md` — threat model e session lifecycle (fonte interna).
