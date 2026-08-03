# Auth Review — ConcorsoAI

> Audit post-implementazione di `auth.html` / `css/auth.css` / `js/auth.js`.
> Criterio: per ogni elemento — riduce attrito? aumenta fiducia? sembra
> premium? sembra parte del prodotto? comunica qualcosa? è necessario?

---

## 1. Verdetto per elemento

| Elemento | Riduce attrito | Aumenta fiducia | Premium | Coerente | Necessario |
|---|---|---|---|---|---|
| Split layout form + preview prodotto | ✅ mostra il valore durante la registrazione | ✅ | ✅ | ✅ | ✅ |
| Tabs Accedi/Registrati (underline editoriale) | ✅ orientamento senza peso | — | ✅ | ✅ | ✅ |
| Google sopra il form email | ✅ 1-click per chi non vuole password | ✅ (provider noto) | ✅ | ✅ | ✅ |
| Solo email + password (no nome) | ✅ 2 campi, niente conversion tax | — | ✅ | ✅ | ✅ |
| Validazione live al blur (Baymard) | ✅ errori prima del submit | ✅ competenza | ✅ | ✅ | ✅ |
| Strength meter onesto (NIST) | ✅ guida senza terrorizzare | ✅ trasparenza | ✅ | ✅ | ✅ |
| Toggle mostra/nascondi | ✅ elimina errori invisibili | — | ✅ | ✅ | ✅ |
| Terms con link a privacy/terms | — | ✅ | ✅ | ✅ | ✅ (legale) |
| Skeleton shimmer (preview) | ✅ attesa percepita più breve | ✅ | ✅ | ✅ | ✅ |
| Barra indeterminata 1px sul submit | ✅ feedback senza spinner | ✅ | ✅ | ✅ | ✅ |
| Pannello "email inviata" anti-enumeration | ✅ stesso messaggio sempre | ✅ privacy | ✅ | ✅ | ✅ |
| Pannello reset (deep link recovery) | ✅ recupero completo senza uscire | ✅ | ✅ | ✅ | ✅ |
| Trust line ("Dati in Europa · Nessuna carta") | ✅ rimuove paura finanziaria | ✅ | ✅ | ✅ | ✅ |
| Preview viva (domande cicliche, confidence) | ✅ "screenshot di software vero" | ✅ | ✅ | ✅ | ✅ |

## 2. Cosa è stato deliberatamente NON fatto

1. **Niente campo Nome** — richiesto in onboarding, dopo il primo valore.
2. **Niente conferma password** — ridondante con toggle + meter (Baymard).
3. **Niente spinner a cerchio** — skeleton per contenuti, barra 1px per submit.
4. **Niente magic link** — il backend non lo espone; password = pattern atteso.
5. **Niente badge "SSL sicuro"** — pattern spam, bandito dal brand.
6. **Niente animazioni di conferma** (confetti ecc.) — AI-slop.
7. **Preview nascosta su mobile** (<920px) — il form è l'unico obiettivo; il
   pattern premium (Stripe/Linear) fa lo stesso. La preview resta su desktop.

## 3. Accessibilità

- ✅ Contrasto AA (muted #6B6F78 su cream #FAF8F3 ≈ 5.9:1; ink su cream 17:1).
- ✅ `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls`.
- ✅ Errori: `role="alert"` + `aria-live="polite"`; errori inline con testo
  (mai solo colore).
- ✅ Toggle password: `aria-label` + `aria-pressed` dinamici.
- ✅ Focus management dopo switch pannello (primo campo o titolo).
- ✅ `prefers-reduced-motion`: animazioni azzerate (CSS) + ciclo preview
  disattivato (JS).
- ✅ Autocomplete corretti: `email`, `current-password`, `new-password`.
- ✅ Password manager / autofill compatibili (niente `autocomplete="off"`).

## 4. Sicurezza percepita

- Micro-line: *"Connessione cifrata · Password cifrata · Dati in Europa ·
  Nessuna carta richiesta"* — 12px, muted, nessun grid di badge.
- Anti-enumeration su forgot e su errore di registrazione.
- Messaggi d'errore in linguaggio semplice con recovery action.

## 5. Note operative PRIMA del lancio (placeholder)

Queste non sono risolvibili da codice frontend — vanno configurate nella
dashboard Supabase:

1. **URL di redirect**: in Supabase → Auth → URL Configuration, aggiungere
   `https://concorso-ai.vercel.app/auth.html` alla whitelist (serve al
   recupero password via `?type=recovery`).
2. **Provider Google**: abilitare Google in Authentication → Providers
   (client ID + secret) perché "Continua con Google" funzioni.
3. **Template email**: il template "Reset password" di Supabase deve
   puntare a `https://concorso-ai.vercel.app/auth.html?type=recovery`
   (o usare il redirectTo che già passa il client). Il template "Conferma
   email" punta già a `/dashboard.html` — va verificato.
4. **Site URL** di Supabase: deve essere `https://concorso-ai.vercel.app`.
5. La recovery non è testabile end-to-end senza un'email reale: il flusso
   `verifyOtp` + `updateUser` segue l'API ufficiale v2; da validare con un
   account reale dopo la configurazione dei punti 1-4.

## 6. Coerenza con la landing

- Stessi token (`:root` identico), stesso font (Inter), stesso tracking
  (0.14em), stessi radius (4px), stessa motion (`--ease`).
- La preview riusa il vocabolario della mockup della landing: chrome con
  dots, live-dot, progress 1px, skeleton shimmer, stat-row, confidence pill.
- Il passaggio Landing → Auth è continuo: stessi CTA ink, stessa carta.

## 7. Rimasti fuori scope (per sessioni future)

- Onboarding post-registrazione (upload bando) — deciso nel design system.
- Login con Passkey/WebAuthn — possibile evoluzione, non richiesta.
- A/B test sul posizionamento di Google (sopra vs sotto il form).
