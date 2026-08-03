# Auth Research — ConcorsoAI

> Documento di ricerca per il sistema di autenticazione.
> Obiettivo: massimizzare il **completamento della registrazione** senza
> percepire manipolazione. L'utente arriva dalla landing, ha già deciso di
> cliccare "Registrati gratis": il nostro lavoro è **non farlo abbandonare**.
>
> Fonti principali: Baymard Institute, Nielsen Norman Group, NIST SP 800-63B,
> Google UX Research, design system interno (`md/ui-ux-master.md`), analisi di
> prodotto su Stripe / Linear / Cursor / Notion / Vercel / Mercury.

---

## 1. Quanti campi chiedere al signup

### Evidenza

- Baymard: ogni campo extra al signup è una "conversion tax". Ridurre il form
  a **email + password** produce aumenti a doppia cifra della conversione
  rispetto a form con nome, telefono, azienda.
- Il principio è la **riduzione del carico cognitivo** (Sweller) + **Hick's
  Law**: ogni scelta/input extra è attrito prima del primo valore.
- Stripe, Linear, Notion, Cursor: massimo 2-3 campi, zero domande di
  qualificazione prima dell'account.

### Cosa applichiamo

- **Email + password. Punto.** Niente nome, niente cognome, niente telefono.
- Il nome verrà chiesto **dopo**, nell'onboarding (progressive profiling),
  quando l'utente ha già visto valore.
- Niente "conferma password": Baymard e NIST la considerano ridondante quando
  c'è il toggle mostra/nascondi; riduce il completamento.

### Cosa NON applichiamo

- Niente "email-first" a due step (Slack/Google): per un pubblico poco
  tecnico e ansioso, un unico form visibile è più prevedibile. Il nostro
  pubblico di riferimento (preparazione concorsi) non conosce il pattern
  "prima email, poi password": un solo passo riduce l'incertezza.

---

## 2. Validazione: live, mai dopo il submit

### Evidenza

- Baymard: il **31%** dei siti non fa validazione inline → scoperta errori
  solo al submit → abbandono. La validazione inline riduce errori del 42% e
  abbandoni del 22%.
- Regole d'oro Baymard:
  1. **Non validare mentre si digita** (prima del blur) → errori prematuri
     ("email non valida" a metà digitazione) frustrano.
  2. L'errore deve **sparire al keystroke** appena corretto.
  3. Feedback **positivo** quando il campo è valido (rassicurazione).
- NN/g: gli errori vanno **inline sotto il campo** interessato, non in cima
  alla pagina; mai solo colore (accessibilità) → icona/segno + testo.

### Cosa applichiamo

- Validazione al **blur** del campo; dopo il primo blur, live al keystroke.
- Errori inline sotto il campo, con testo chiaro e recovery action.
- Il **meter della password** è il feedback positivo live.
- Errori globali (auth Supabase) in una regione `role="alert"` in alto.

### Cosa NON applichiamo

- Niente checkmark verde a ogni campo valido: in un design monocolore
  cream+ink il "verde diffuso" crea rumore. Il feedback positivo è già nel
  meter e nell'assenza di errori.

---

## 3. Password: NIST SP 800-63B

### Evidenza

- NIST 800-63B: la **lunghezza** conta più della complessità. Minimo 8
  caratteri, massimo niente (lunghe passphrase ok). Vietato imporre rotazione
  periodica. Vietate le password più comuni.
- I **strength meter** aiutano solo se onesti (scoring tipo zxcvbn); un meter
  che sorride sempre è controproducente (falsa sicurezza).
- Il **toggle mostra/nascondi** riduce gli errori di digitazione ed è
  raccomandato (l'input nascosto senza fallback causa errori invisibili).
- La **conferma password** non è necessaria con toggle + meter (Baymard).

### Cosa applichiamo

- Minimo **8 caratteri** (requisito unico, senza lista spaventosa).
- Meter onesto a 4 livelli (vuoto / debole / media / forte), basato su
  lunghezza + varietà, con etichette concrete ("Aggiungi una maiuscola").
- Toggle mostra/nascondi su ogni campo password, accessibile (aria-label
  dinamico, stato).
- `autocomplete="new-password"` / `"current-password"` + password manager
  supportati (niente `autocomplete="off"`).

### Cosa NON applichiamo

- Niente requisiti esotici ("almeno 1 simbolo, 1 maiuscola, 1 numero, max 12
  caratteri, niente ripetizioni") — è il pattern che fa abbandonare.
- Niente "forza password" come giudizio: solo supporto.

---

## 4. Skeleton loader vs spinner

### Evidenza

- NN/g + studi di perceived performance: gli **skeleton (shimmer)** fanno
  percepire l'attesa più breve rispetto allo spinner perché danno struttura
  e anticipazione del contenuto.
- Gli skeleton vanno usati dove arriva **contenuto** (feed, dashboard,
  risposte AI). Lo spinner resta adatto solo ad azioni puntuali brevissime.

### Cosa applichiamo

- **Skeleton con shimmer** nella colonna preview del prodotto: la risposta
  AI "arriva" con barre shimmer, poi testo + confidence pill (pattern della
  landing, identico vocabolario).
- Sul **submit del form**: nessuno spinner a cerchio. Barra indeterminata
  sottile (1px) sotto il bottone + cambio label. È il pattern premium
  (Linear/Stripe): feedback senza "ruota che gira".
- Mai fullscreen loader in auth (ruba il controllo — ui-ux-master §15.4).

### Cosa NON applichiamo

- Niente spinner a cerchio nel form; niente skeleton dove il contenuto è
  istantaneo (i form sono statici, mostrare skeleton lì sarebbe finto).

---

## 5. Fiducia e sicurezza percepita

### Evidenza

- Baymard: gli utenti non capiscono la crittografia a livello tecnico;
  decidono su **indizi visivi e microcopy**. "Nessuna carta richiesta"
  rimuove la paura finanziaria (conversione ↑).
- La **residenza dati UE** è un segnale di fiducia rilevante per utenti
  B2B/privacy-aware (il nostro pubblico italiano lo apprezza, anche per
  culture del concorso pubblico).
- **SSO** (Google/Apple) riduce attrito; va posizionato in evidenza ma **mai
  come unica via** (fallback email sempre presente).
- NN/g: mai terrorismo sulla sicurezza ("inserisci la password o i tuoi dati
  verranno rubati") — rassicurazione sobria.

### Cosa applichiamo

- Micro-line sotto il form: *"Connessione cifrata · Password cifrata · Dati
  in Europa · Nessuna carta richiesta"* — 12px, muted, niente icone grid.
- **Continua con Google** come opzione primaria secondaria (riduce attrito),
  con fallback email sempre visibile.
- Microcopy "Usiamo Google solo per l'accesso. Non pubblichiamo nulla."
- Footer auth con "Cancellazione libera" (già nel design system).

### Cosa NON applichiamo

- Niente badge "SSL sicuro" o sigilli finti (pattern spam).
- Niente countdown, niente "ultimi 3 posti" — dark pattern vietato dal brand.

---

## 6. Privacy e anti-enumeration

### Evidenza

- NN/g + best practice auth: **non rivelare se un'email esiste**.
  "Password dimenticata" deve mostrare sempre lo stesso messaggio,
  registrata o no (anti-enumeration + anti-phishing).

### Cosa applichiamo

- Il pannello "email inviata" mostra un messaggio **identico** in ogni caso:
  *"Se l'indirizzo è registrato, troverai il link. Controlla anche lo spam."*
- Registrazione con email già esistente → messaggio generico con recovery
  ("Prova ad accedere") senza confermare lo stato dell'account.

---

## 7. Pattern premium osservati (Stripe, Linear, Cursor, Notion, Vercel)

| Pattern | Perché funziona | Applicato |
|---|---|---|
| **Split layout**: form + preview prodotto a destra | Il prodotto è il protagonista; l'utente vede cosa otterrà mentre si registra | ✅ |
| **Un solo obiettivo per schermata** (login ≠ signup ≠ reset) | Riduce il carico decisionale | ✅ (pannelli separati, non scroll infinito) |
| **Titolo breve + subline di una riga** | Gerarchia tipografica netta | ✅ |
| **Switch "Accedi/Registrati" come tab testuale con underline** | Orientamento senza peso visivo | ✅ |
| **Google sopra il form email** | Riduce attrito per chi non vuole password | ✅ |
| **Trust line sotto il CTA** | Rassicura nel punto di decisione | ✅ |
| **Autofocus sull'email** | Primo input = primo atto | ✅ |
| Preview del prodotto **viva** (skeleton, progress, confidence) | "Non è un mockup statico" | ✅ |
| **Niente sidebar/nav** nella pagina auth | Focus totale | ✅ |

### Cosa NON applichiamo

- Niente "magic link" al posto della password (il backend Supabase non lo
  espone in modo semplice; la password resta il pattern atteso dal pubblico).
- Niente login sociale multiplo (solo Google, che è configurato).
- Niente animazione "confetti" post-registrazione (AI-slop).

---

## 8. Accessibilità (WCAG)

- Contrasto AA su tutti i testi (muted su cream: 6.7:1 ✅).
- Focus visibile `:focus-visible` (ring sottile ink).
- `role="tablist/tab/tabpanel"`, `aria-selected`, `aria-controls`.
- Errori: `role="alert"` + `aria-live="polite"`.
- Toggle password: `aria-label` che cambia stato.
- `prefers-reduced-motion`: tutte le animazioni disattivate.
- Autocomplete/autofill corretti per password manager.

---

## 9. Fonti

- Baymard Institute — Form UX, inline validation, checkout trust.
- Nielsen Norman Group — Error message guidelines, skeleton screens, form
  design, cognitive load.
- NIST SP 800-63B — Digital Identity Guidelines (password).
- Google UX Research — form usability principles.
- Sweller (cognitive load), Hick's Law (decision time).
- `md/ui-ux-master.md` — §§12.2-12.6, 15.1-15.5 (Signup, Login, Reset,
  Verification, Auth patterns) — fonte interna di riferimento.
- Analisi diretta: stripe.com/checkout, linear.app/signup, cursor.com,
  notion.so/login, vercel.com/signup, mercury.com, basecamp.
