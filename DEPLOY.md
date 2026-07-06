# DEPLOY.md — ConcorsoAI

Guida step-by-step per deployare `ConcorsoAI` su Vercel e verificare
che le modifiche recenti (auth + streaming + typewriter) funzionino
end-to-end in produzione.

> **Cross-platform**: tutti i comandi qui sono compatibili Windows
> (PowerShell) e Unix (bash). Adatta shell a piacere.

---

## 1. Pre-flight locale

Prima di deployare, verifica che i file critici ci siano:

```bash
ls -la api/chat.js public/auth-patch.js public/simulation.html
```

Output atteso:
- `api/chat.js` (~250 righe, contiene commento header `v3` e
  funzione `bufferSseStreamToContent`).
- `public/auth-patch.js` (~90 righe, commento "loaded active").
- `public/simulation.html` (~3400+ righe, contiene `<script
  src="auth-patch.js"></script>` subito dopo il tag GSAP).

Poi check che il package.json punti a Node 20:

```bash
node --version   # deve essere >= 20
cat package.json | grep engines
```

---

## 2. Environment Variables su Vercel

Nel Vercel dashboard del progetto → **Settings → Environment
Variables**, imposta:

| Chiave                  | Obbligatoria | Dove trovare il valore                                  |
|-------------------------|--------------|--------------------------------------------------------|
| `BLUESMINDS_API_KEY`    | SI           | Console BluesMinds (rotational secret)                  |
| `SUPABASE_URL`          | SI (default) | Già in api/chat.js come fallback                        |
| `SUPABASE_ANON_KEY`     | SI           | Settings → API di Supabase (chiave `anon`/`publishable`) |

> **Fail-closed**: senza `SUPABASE_ANON_KEY` il backend
> restituisce 500 su QUALSIASI richiesta. Senza
> `BLUESMINDS_API_KEY` stesso. Verifica le env PRIMA del primo
> deploy.

### Comando CLI (se preferisci)

```bash
vercel env add BLUESMINDS_API_KEY production
vercel env add SUPABASE_ANON_KEY production
# ... incolla i valori quando richiesto
```

---

## 3. Deploy

### Opzione A — Vercel CLI (consigliata)

```bash
npm i -g vercel          # una volta sola
vercel login             # se non l'hai mai fatto
vercel --prod            # primo deploy production
```

Output atteso: URL tipo `https://concorso-ai.vercel.app`. Annotalo:
serve per i test.

### Opzione B — GitHub integration

1. Push il repo su GitHub (vedi `git push` se serve).
2. Vercel dashboard → "Import Project" → seleziona il repo.
3. Aggiungi le env vars (vedi sezione 2) PRIMA del primo deploy.

---

## 4. Smoke tests (curl + browser)

### 4.1 Salute landing pubblica

```bash
curl -I https://concorso-ai.vercel.app/
```

Atteso: `HTTP/2 200`, `content-type: text/html`.

```bash
curl -I https://concorso-ai.vercel.app/auth-patch.js
```

Atteso: `HTTP/2 200`, `content-type: application/javascript`.

### 4.2 /api/chat senza auth → 401

```bash
curl -i -X POST https://concorso-ai.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"ciao"}]}'
```

Atteso: `HTTP/2 401`, body `{"error":"Token di autenticazione
mancante"}`.

### 4.3 /api/chat con auth fake → 401

```bash
curl -i -X POST https://concorso-ai.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer FAKE_TOKEN_NOT_REAL" \
  -d '{"messages":[{"role":"user","content":"ciao"}]}'
```

Atteso: `HTTP/2 401`, body `{"error":"Token non valido o scaduto"}`.

### 4.4 /api/chat con auth valido → 200

Questo richiede un browser perché il JWT Supabase va ottenuto via
login. Procedi con 4.5.

---

## 5. Test end-to-end nel browser

Apri Chrome/Firefox e procedi:

### Step 1 — Landing

Vai a `https://concorso-ai.vercel.app`. Atteso:
- Hero blu/bianco visibile.
- Click su "Accedi" o "Registrati" → redirect a `/auth.html`.

### Step 2 — Login

Compila email + password di un utente seeded in Supabase, oppure
registra un nuovo utente. Atteso: redirect a `/dashboard.html`.

### Step 3 — Carica un bando

Dashboard → "Carica bando PDF" → seleziona un PDF piccolo (es.
nota del comune). Atteso: progress bar fino a 100%, bando compare
in lista "Bandi caricati".

### Step 4 — Avvia simulazione

Click su "Inizia simulazione" sul bando. Atteso:
- Redirect a `/simulation.html`.
- Config phase visibile col bando preselezionato.
- Briefing animation quando click "Inizia Simulazione".

### Step 5 — Verifica typewriter

Quando il commissario inizia a rispondere, devi vedere:
- **Bubble con animazione `commBubbleReveal`** (clip-path che si
  apre da sinistra a destra in ~0.75s).
- **Console deve mostrare** `console.debug` MAI (typing wiring è
  perfetto). Se vedi `[ConcorsoAI] typewriter wiring fallback: ...`
  → problema.

### Step 6 — Rispondi e termina

Scrivi una risposta → aspetta follow-up del commissario → click
"Termina" → conferma → vedi la summary. Atteso: summary con
metriche feedback.

---

## 6. Verifica Auth tramite DevTools

Apri Chrome DevTools (F12) durante una simulazione, tab **Network**:

### Chiamata /api/chat con auth header

1. Filtra le richieste per `/api/chat`.
2. Click su una richiesta → tab **Headers**.
3. Atteso: `Authorization: Bearer eyJhbGciOi...` presente (anche se
   generato dal wrapper di `auth-patch.js`).

### Fallimento auth

1. Apri DevTools → tab **Application → Local Storage**.
2. Trova la chiave `sb-xhifnparcouxsypkjcmn-auth-token`.
3. Cancellala.
4. Torna alla simulazione → invia una risposta.
5. Atteso: toast di errore 401.

---

## 7. Test rate limit (opzionale, da amministratore)

```bash
for i in $(seq 1 35); do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST https://concorso-ai.vercel.app/api/chat \
    -H "Authorization: Bearer YOUR_VALID_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"ping"}]}'
done
```

Atteso: prime 30 → `200`, dalla 31 in poi → `429`.

> ⚠️ Non eseguire durante una simulazione live, consumerebbe
> budget reale.

---

## 8. Rollback rapido

Se qualcosa va storto in produzione, rollback Vercel con:

```bash
vercel rollback
```

oppure da dashboard: **Deployments → click sull'ultimo green →
"Promote to Production"**.

---

## 9. Troubleshooting comune

| Errore                                   | Causa probabile                          | Fix                                          |
|------------------------------------------|-----------------------------------------|----------------------------------------------|
| 401 "Token mancante"                     | auth-patch.js non caricato               | Verifica `<script src="auth-patch.js">`      |
| 401 "Token non valido"                   | JWT scaduto in localStorage              | Re-login da `/auth.html`                     |
| 429 "Troppe richieste"                   | Rate limit hit                          | Aspetta 60s o riduci il volume              |
| 500 "Configurazione incompleta"          | env vars mancanti                        | Aggiungi `SUPABASE_ANON_KEY`/`BLUESMINDS_API_KEY` |
| Bubble typewriter non animato            | auth-patch.js non eseguito o errore      | Check console per debug warning              |
| Magic link email non arriva              | Supabase SMTP non configurato            | Configura SMTP template                     |

---

## 10. Checklist pre-deploy (per l'utente)

Prima di dire "production ready":

- [ ] env vars tutte settate
- [ ] `vercel env pull .env.local` ha funzionato (se usi CLI)
- [ ] Smoke test 4.1 passa
- [ ] Smoke test 4.2 passa (401 senza auth)
- [ ] Smoke test 4.3 passa (401 con auth fake)
- [ ] Login funziona (4.5 step 2)
- [ ] Wizard config salvataggio bando funziona (4.5 step 3)
- [ ] Simulazione completa end-to-end con typewriter (4.5 step 5-6)
- [ ] Console non mostra errori 401/500 inaspettati
- [ ] Network tab mostra Authorization header su /api/chat

Se tutte le box sono verdi: **8.5/10 production-ready** come
precedentemente comunicato. Buon deploy!
