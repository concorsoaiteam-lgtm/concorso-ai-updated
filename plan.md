# Piano: Commissario AI funzionante

## Goal
Il commissario interroga bene, con domande reali dal bando, difficoltà calibrata, feedback utili. La UI è bella come la landing (o meglio).

## Fase 1 — UI/UX (matchare mockup landing)

### 1.1 Chat come nella landing
La landing mostra una chat finta perfetta: avatar CA, timer, feedback bars, bolla commissario, bolla utente con waveform. La simulation.html HA già tutto questo ma è meno rifinita.

- Allineare stili: usare gli stessi border-radius, ombre, font della landing mockup
- Aggiungere `mic-pulse` animation quando l'utente parla (già in index.html:223)
- Rendere la commissioner card fluttuante come nella landing (`floating` class)

### 1.2 Feedback bars animate come mockup
Le barre di feedback (Chiarezza/Struttura/Contenuto) sulla landing hanno dettagli testo sotto. Nella simulation sono già presenti ma più basiche. Arricchire con:
- Stessa palette colori del mockup (amber per struttura, emerald per contenuto)
- Dettaglio con suggerimento testuale (già presente come `buildDetail`)
- Aprire dettaglio al click sulla barra (già presente)

### 1.3 Stato iniziale
Prima che l'utente risponda, il feedback mostra "In attesa della tua prima risposta" — già fatto.

### 1.4 Responsive
La simulation su mobile è già decente ma il pannello feedback si può migliorare (toggle button già presente).

## Fase 2 — AI che funziona

### 2.1 Temperatura variabile per difficoltà
Ora è fissata a `temperature: 0.4`. Cambiare in base alla difficoltà:
- Facile: 0.3 (più prevedibile, rassicurante)
- Realistico: 0.5 (equilibrato, default)
- Difficile: 0.7 (più imprevedibile, incalzante)

File: `simulation.html:917,1173`

### 2.2 System prompt — più bando, meno regole
Il system prompt ha una sezione "REGOLE" molto lunga che potrebbe limitare la qualità. Le regole 3-4-5 dicono "non correggere, non dire ottimo" — a volte l'AI ignora le regole perché troppe.

- Snellire: mantenere solo regole 1, 2, 6, 7 (le essenziali)
- Rimuovere regole 3-4-5 (l'AI le ignora comunque)
- Aggiungere riga: "Se il candidato dà una risposta vuota, insisti con gentilezza."

### 2.3 Chunks del bando — verificarli
`config.chunks` contiene il testo del bando. Se è vuoto o troncato, l'AI non può fare domande pertinenti.

- Aggiungere fallback: se chunks vuoto, usare materie generali (Diritto Amministrativo, Costituzionale, ecc.)
- Verificare che `loadBandi()` porti i contenuti testuali (attualmente seleziona solo id, filename, total_pages, file_size — ma il contenuto vero è nella tabella `materiali` o `bandi.content`)

### 2.4 Prompt engineering — testare con utenti veri
Prima di ottimizzare oltre, fare 5 simulazioni con amici/potenziali utenti. Registrare:
- Le domande sono pertinenti al bando?
- Il feedback è utile o vago?
- La difficoltà si sente?

### 2.5 max_tokens
Ora è 500. Per domande brevi basta. Per approfondimenti forse serve 700-800.

## Fase 3 — Auth & streaming

### 3.1 chaimataCommissario (non-stream)
La funzione `chiamaCommissario` a `simulation.html:1160` NON invia l'Authorization header. Il backend richiede Bearer token. Attualmente auth-patch.js tenta di ovviare con un shim ma è fragile.

- O unificare tutto su `chiamaCommissarioStream` (già funzionante con auth)
- O aggiungere header Authorization a `chiamaCommissario`

### 3.2 Gestione errori
Se l'API key BluesMinds scade o l'AI non risponde, l'utente vede un messaggio generico. Aggiungere errore specifico:
- "BluesMinds non risponde" → "Il commissario è momentaneamente offline. Riprova tra 30 secondi."
- "Token scaduto" → "Sessione scaduta. Vai alla dashboard e rifai login."
- "Rate limit" → "Troppe richieste. Aspetta un minuto."

## Ordine esecuzione

1. Fase 1.1 + 1.2 (UI) — ~2h
2. Fase 2.1 + 2.2 (temperatura + prompt snello) — ~1h
3. Fase 2.3 (chunks bando) — ~2h
4. Fase 2.4 (test con utenti) — ~2h
5. Fase 3.1 (auth) — ~1h
6. Fase 3.2 (error handling) — ~1h

**Totale: ~9h di lavoro**
