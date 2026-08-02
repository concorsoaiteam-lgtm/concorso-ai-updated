# 12 — Microcopy: button labels, error messages, tooltip, empty states

> **Scopo**: definire la regole di microcopy (testo breve in UI elementi specifici) della landing ConcorsoAI: button labels, form labels, error messages, tooltips, empty states, validation feedback, loading states. Sequenza: dopo il copywriting (file 11), questo file entra nel dettaglio UI element-specific copy.

---

## Introduzione

### Perché la microcopy non è "decorazione UI", è "micro-decision making"

Ogni elemento UI ha un **momento decisionale dell'utente**:
- Leggere un button label = "devo cliccare?".
- Ricevere un error message = "cosa è andato storto? cosa faccio?".
- Vedere un empty state = "ho perso?".
- Leggere un caption = "questo è importante?".

La microcopy governa ciascuno di questi momenti. Pattern consolidati:

- **Button label**: verbo d'azione + benefit (vedi file 11 §P3).
- **Form label**: noun + placeholder specifico ("Email · nome@esempio.it").
- **Error message**: cosa + perché + cosa fare.
- **Tooltip**: 1 frase 1 idea, max 80 caratteri.
- **Empty state**: cosa manca + prossima azione + rassicurazione.
- **Validation feedback**: success/warning/error con iconografia + testo breve.

Pattern ConcorsoAI: **istituzionale-moderno**, specifico, low-jargon, onesty.

Riferimenti: Microcopy: The Complete Guide (Kinneret Yifrah, 2018); Messages That Stick (Chip & Dan Heath, 2007); NN/g error message pattern (2018-2024); Google Material Design forms (2014-2024).

### Come si applica a ConcorsoAI

Ogni UI element ha una microcopy standard ConcorsoAI:

- **Button hero**: "Inizia la tua prima simulazione" + arrow →
- **Submit form**: "Accedi" / "Registrati" / "Cancella quando vuoi" (esplicito)
- **Field label**: "Email · nome@esempio.it" (placeholder come esempio)
- **Error**: "Errore di rete. Riprova o scrivi a supporto@concorsoai.it."
- **Empty state**: "Nessuna simulazione ancora. Inizia la prima per vedere le tue statistiche."
- **Validation**: ✓ "Salvato", ⚠ "Conferma la tua decisione", ✕ "Errore di rete"
- **Loading**: "Caricamento..." (NO spinner alone senza testo)

---

## Principi

### P1 — Button labels = verb + benefit

I button labels sono la microcopy più visibile della landing. Pattern:
- **Verbo d'azione**: Inizia, Sblocca, Prova, Scarica, Continua, Scopri, Conferma.
- **Benefit specifico**: "la tua prima simulazione", "tutte le materie", "30 giorni senza impegno".

Max 5 parole. Mai CTA generico.

### P2 — Field labels = noun + specific placeholder

Ogni campo del form ha:
- **Label**: noun + colon optional ("Email").
- **Placeholder**: specifico con esempio ("nome@esempio.it").
- **Help text**: solo se necessario (es. per password strength).

ConcorsoAI:
- `Email` → placeholder "nome@esempio.it"
- `Password` → placeholder "Almeno 8 caratteri" + strength meter
- `Conferma password` → placeholder "Ripetere la password"

### P3 — Error messages = cosa + perché + cosa fare

3-part pattern per errori UI:
1. **Cosa è successo**: "Errore di rete".
2. **Perché (opzionale)**: "Il nostro server non risponde".
3. **Cosa fare**: "Riprova o scrivi a supporto@concorsoai.it".

Mai:
- "Errore generico" (nessun aiuto).
- "Something went wrong" (USA-stile, traduzione italiana).
- "Try again later" (vago).

### P4 — Tooltips ≤80 caratteri, 1 idea

Tooltip UX:
- 1 frase, 1 idea.
- Max 80 caratteri.
- Icon ? trigger → tooltip su `:hover`/`focus`.
- Click-outside dismiss.

ConcorsoAI:
- Su "47 posti lifetime Pro": "Coorte Q3 2026. Aggiornato in tempo reale."
- Su "Mat. 30gg rimborsabili": "Disdici in 1 click. Nessuna domanda."

### P5 — Empty state = reassuring CTA

Quando un dato non c'è ancora (dashboard vuota, no simulazioni), empty state pattern:
- **Iconografia sobria** (NO illustrazione AI-generating).
- **1 frase che spiega cosa manca**: "Nessuna simulazione ancora".
- **1 frase che rassicura + spiega prossimo step**: "Inizia la prima per vedere le tue statistiche".
- **CTA primaria**: "Inizia la prima simulazione".

Mai empty state senza CTA o rassicurazione.

### P6 — Validation states = visivo + testo + iconografia

3 validation states:
- **Success**: `bg-green-50` + ✓ + "Salvato correttamente" + 1.5s auto-dismiss.
- **Warning**: `bg-amber-50` + ⚠ + "Attenzione: campo richiesto" + inline.
- **Error**: `bg-red-50` + ✕ + "Errore di rete" + inline.

Mai "X" alone (color blindness). Mai solo color senza iconografia.

### P7 — Loading state = testo + spinner o progress bar

Loading ≥400ms (Doherty threshold):
- **Testo esplicito**: "Caricamento..." o "Salvataggio in corso...".
- **Spinner o progress bar**: affianco al testo.
- **Disabilita interaction**: button → disabled durante submit + spinner.

Mai spinner alone senza testo.

### P8 — Destructive actions confirmation

Eliminazione account, cancellazione sim, refund richiesta:
- Button "Elimina" → modal di conferma.
- Conferma richiede digitazione utente ("Conferma digitando 'Elimina'").
- NO one-click delete (anti-pattern destructive UI).

ConcorsoAI:
- Dashboard "Cancella account" → modal: "Sei sicuro di voler cancellare il tuo account? Digita 'Cancella' per confermare."

### P9 — Status messages in conversational tone

User-facing status messages (post-azione):
- "Salvato. Punteggio: 78/100."
- "Simulazione completata. Puoi ora vedere il feedback."
- "Account verificato. Ora puoi iniziare la tua prima simulazione."

Mai:
- "Operazione eseguita con successo" (burocratese).
- "La tua richiesta è stata processata correttamente" (passive voice pesante).

### P10 — Placeholder è esempio, non label

Il placeholder NON sostituisce il label. Pattern:
- Label sempre presente (anche visivamente dopo il focus).
- Placeholder = esempio concreto.
- Accessibilità: inputs hanno sia for che aria-label.

ConcorsoAI:
- `<label for="email">Email</label> <input type="email" placeholder="nome@esempio.it" required>`

### P11 — Visibilità del successo

Dopo una azione positiva (post-azione), comunicare visibilmente:
- Animation micro-celebrativa (Pulse sui numeri, confetti minimal).
- Badge sbloccato ("Simulazione 1 di 3 ✓").
- Conversational tone ("Ottimo lavoro. Il punteggio è calcolato.").

Mai:
- Animazione eccessiva (vedi file 24 anti-slop #18).
- Manipolazione emotiva (vedi file 23 anti-slop #33).

### P12 — Sistemi di errore recovery

Errori devono avere **chiara exit route**:
- "Errore di rete" → "Riprova ora" button + link mailto supporto.
- "Campo non valido" → focus automatico + hint inline.
- "Pagamento fallito" → "Il tuo metodo di pagamento è rifiutato. Aggiornalo o contatta supporto."

Mai bloccare l'utente senza "come ne esco".

### P13 — Accessibilità copy (screen reader friendly)

Ogni iconografia UI ha aria-label:
- `<button aria-label="Inizia la tua prima simulazione">`
- `<span role="alert">Errore di rete. Riprova o scrivi a supporto@concorsoai.it.</span>`
- `<div role="status" aria-live="polite">Salvato correttamente.</div>`

Mai iconografia senza label accessibile.

### P14 — Specificità nei numeri

I numeri in microcopy devono essere specifici:
- "Salvataggio..." → "Salvataggio in corso..."
- "Invio..." → "Invio email di recupero..."
- "Caricamento..." → "Caricamento delle tue 5 sessioni precedenti..."

Mai generic "Attendere..." (invita a confusione).

### P15 — Mai colonna / riga segnaposto

Le label visive NON devono essere "Lorem ipsum" o "Sample data". Mai placeholder visibili all'utente finale.

---

## Evidenze

### Kinneret Yifrah (2018) — *Microcopy: The Complete Guide*

- Manuale di microcopy. Pattern:
  - Verbo d'azione specifico (vs generic).
  - Field labels + placeholders espliciti.
  - Error messages con 3-part (cosa/perché/recovery).
  - Empty states rassicuranti.

### Google Material Design (Forms / Errors)

- Pattern standard per error messages:
  - **Inline errors** sotto il campo, appaiono dopo blur o submit.
  - **Form-level errors** in alto, appaiono al submit con focus automatico sul primo errore.
  - **Iconografia paired** con color (✓, ⚠, ✕).

### NN/g — *Error Messages UX Best Practices* (2018-2024)

- Studio eye-tracking su errori. Risultato:
  - Errori inline sotto il campo > errori form-level generici.
  - Linguaggio umano > linguaggio tecnico (es. "Password troppo corta" > "Errore 422").
  - Color + iconografia > color alone.

### Chip & Dan Heath (2007) — *Made to Stick*

- "Concrete language > abstract". Pattern per microcopy:
  - "Cosa fare" specifico (non "verificare e ritentare").
  - Concrete nouns (non abstract state).

### UX Collective (2020-2024) — Multiple articles on microcopy

- Pattern consolidati:
  - **Button labels**: solo verbi d'azione.
  - **Loading state**: spinner + testo sempre.
  - **Validation**: success auto-dismiss + warning persistente + error blocca.
  - **Empty state**: illustration sobria + CTA primary + reassurance.

### Apple Human Interface Guidelines (HIG)

- Standard iOS/macOS usabili su web:
  - Empty state con illustrationi sobrie.
  - Loading state con progress bar.
  - Error messages human-readable.

### NN/g — *Fitts's Law & Button Design* (2018)

- Button: min 44x44px, label ≤5 parole, label centrato, contrasto 4.5:1.

### European Accessibility Act (EAA, 2025)

- Compliance: tutti gli screen reader devono poter leggere button labels + error messages.

---

## Errori comuni

### E1 — Button label static + generic

**Sintomo**: button label "OK" o "Submit" o "Clicca qui".

**Perché succede**: copy non pensa al "perché l'utente clicca qui".

**Perché il cervello lo rifiuta**: label non comunica benefit. Clicco o no? Spesso no = bounce.

**Soluzione**: "Inizia la tua prima simulazione" > "OK".

### E2 — Error message generico

**Sintomo**: "Errore generico" / "Something went wrong" / "Errore 500".

**Perché succede**: developer pensa al logging. Copywriter non sa cosa scrivere.

**Perché il cervello lo rifiuta**: utente non sa cosa fare. Abbandona.

**Soluzione**: "Errore di rete. Riprova o scrivi a supporto@concorsoai.it." Più chiaro + recoverable.

### E3 — Empty state con disegno noioso o assente

**Sintomo**: tabella vuota con "0" o "--" senza CTA.

**Perché succede**: copy pensa "non ci sono dati, non c'è copy".

**Perché il cervello lo rifiuta**: utente pensa "ho perso, sono in dead-end".

**Soluzione**: empty state rassicurante + CTA: "Nessuna simulazione ancora. Inizia la prima per vedere le tue statistiche."

### E4 — Placeholder sostituisce label

**Sintomo**: `<input placeholder="Email">` senza `<label>`.

**Perché succede**: design ha dimenticato label visible.

**Perché il cervello lo rifiuta**: screen reader non riceve label. UX confuse (placeholder sparisce al focus).

**Soluzione**: label always present + placeholder esempio. Pattern WCAG 4.1.2.

### E5 — Solo color per validation

**Sintomo**: campo con border rosso senza iconografia + testo.

**Perché succede**: copy pensa "border rosso = errori".

**Perché il cervello lo rifiuta**: color blindness, screen reader mute.

**Soluzione**: validation = color + iconografia + testo. Es: "bg-red-50 + ✕ + 'Email non valida'".

### E6 — Loading state senza testo

**Sintomo**: spinner alone senza messaggio.

**Perché succede**: copy dimentica il loading state.

**Perché il cervello lo rifiuta**: utente pensa "è bloccato o sta funzionando?".

**Soluzione**: spinner + testo "Caricamento in corso...".

### E7 — Tooltip su click invece di hover/focus

**Sintomo**: tooltip che appare solo su click (non accessibile keyboard).

**Perché succede**: developer UX focus su mouse-only.

**Perché il cervello lo rifiuta**: keyboard-only user non può accedere info.

**Soluzione**: tooltip su :hover + :focus. Pattern WCAG AA.

### E8 — Loading state troppo lento (>5 secondi senza feedback)

**Sintomo**: click → 8 secondi di silenzio → risultato.

**Perché succede**: API lenti senza progress indication.

**Perché il cervello lo rifiuta**: utente pensa "è rotto". Abbandona.

**Soluzione**: skeleton UI + spinner testuale + progress bar se >5s.

### E9 — Destructive action one-click

**Sintomo**: button "Elimina" → eliminazione immediata.

**Perché succede**: developer non pensa all'UX safety.

**Perché il cervello lo rifiuta**: errori umani. Destructive action senza confirmation = lawsuit.

**Soluzione**: modal confirmation + digitazione obbligatoria.

### E10 — Status messages troppo generici

**Sintomo**: "Operazione eseguita" / "Salvataggio..." / "Invio..."

**Perché succede**: copy deve essere "breve" ma diventa vuoto.

**Perché il cervello lo rifiuta**: utente non sa cosa sta succedendo.

**Soluzione**: status specifico. "Salvataggio della tua terza simulazione..." > "Salvataggio...".

### E11 — Nessuna micro-copy in empty state

**Sintomo**: dashboard vuota con solo "Nessun dato".

**Perché succede**: copy pensa "è ovvio, cosa manca".

**Perché il cervello lo rifiuta**: utente non sa cosa fare. Generic empty.

**Soluzione**: empty state con 1 frase + CTA primary.

### E12 — Loading "fake quick" (Spinner mostra finto 100ms loading)

**Sintomo**: spinner 100ms → operazione reale 3 secondi. UX inconsistent.

**Perché succede**: developer mette spinner anche se non serve.

**Perché il cervello lo rifiuta**: utente confuso. Performance cross-perceived.

**Soluzione**: spinner solo se >400ms (Doherty). Nessuno spinner sotto soglia.

---

## Pattern migliori

### Pattern A — Button labels canonici

3 lunghezze di button labels:
- **1 parola**: "Accedi", "Conferma"
- **2-3 parole**: "Inizia simulazione"
- **4-5 parole**: "Inizia la tua prima simulazione"

Mai più di 5 parole. Mai emoji. Mai generic ("OK", "Submit").

### Pattern B — Field labels con placeholder concreto

Pattern: label always visible + placeholder = example.

```html
<label for="email">Email</label>
<input type="email" id="email" name="email" placeholder="nome@esempio.it" required>
```

Placeholder NON sostituisce label. La label rimane visibile sopra o accanto al campo.

### Pattern C — Error message 3-part

Pattern canonico:
```html
<div class="error-message" role="alert">
  <strong>Errore di rete.</strong>
  <span>Il tuo browser non è riuscito a connettersi al nostro server. <a href="#">Riprova ora</a> o scrivi a supporto@concorsoai.it.</span>
</div>
```

3-part: scope (errore) + descrizione (cosa) + recovery (cosa fare).

### Pattern D — Empty state rassicurante

Pattern canonico empty state dashboard:
```html
<div class="empty-state">
  <div class="empty-state__icon" aria-hidden="true">✓</div>
  <h3 class="empty-state__title">Nessuna simulazione ancora</h3>
  <p class="empty-state__body">La tua prima simulazione ti permette di vedere i materiali specifici del tuo bando e ricevere un feedback iniziale.</p>
  <a href="/auth" class="btn-cta">Inizia la prima simulazione</a>
</div>
```

Pattern: icon + title + reassuring body + CTA primary.

### Pattern E — Tooltip breve specifico

Pattern canonico tooltip:
```html
<button aria-describedby="tip-lifetime">47 posti lifetime Pro</button>
<div id="tip-lifetime" class="tooltip" role="tooltip">
  Coorte Q3 2026, aggiornati in tempo reale.
</div>
```

Pattern: 1 frase 1 idea. Max 80 caratteri.

### Pattern F — Validation state canonico

3 tipologie:
```html
<!-- Success -->
<div class="valid-feedback success" role="status" aria-live="polite">
  <span aria-hidden="true">✓</span>
  <span>Salvato correttamente.</span>
</div>

<!-- Warning -->
<div class="warning" role="status" aria-live="polite">
  <span aria-hidden="true">⚠</span>
  <span>Conferma la tua decisione prima di procedere.</span>
</div>

<!-- Error -->
<div class="error" role="alert" role="status" aria-live="assertive">
  <span aria-hidden="true">✕</span>
  <span>Errore di rete. <a href="#">Riprova</a> o scrivi a supporto@concorsoai.it.</span>
</div>
```

Pattern: iconografia + colore + testo. Per screen reader + color blindness.

### Pattern G — Loading state canonico

Pattern canonico loading:
```html
<div role="status" aria-live="polite" class="loading">
  <div class="spinner" aria-hidden="true"></div>
  <span>Caricamento della tua terza simulazione...</span>
</div>
```

Pattern: spinner + testo specifico + aria-live per screen reader.

### Pattern H — Destructive action confirmation

Pattern canonico:
```html
<dialog open class="confirm-dialog">
  <h2>Sei sicuro di voler cancellare il tuo account?</h2>
  <p>Questa azione eliminerà tutte le tue 5 sessioni salvate e non può essere annullata.</p>
  <label for="confirm-text">Digita "Cancella" per confermare</label>
  <input type="text" id="confirm-text" name="confirm-text">
  <button type="submit" class="btn-destructive" disabled>Cancella account</button>
  <button type="button" class="btn-secondary">Annulla</button>
</dialog>
```

Pattern: dialog con confirm text + button destructive disabilitato finché il confirm non è digitato.

### Pattern I — Status messages specifici e conversazionali

Pattern:
```html
<div role="status" aria-live="polite" class="toast-success">
  <strong>Simulazione 3 di 3 ✓</strong>
  <p>Punteggio: 78/100. Pronto per il tuo orale. <a href="/dashboard">Vedi il riepilogo</a></p>
</div>
```

Pattern: fattuale, conversazionale, link recovery.

### Pattern J — Aria-label per iconografia UI

Tutti i button icon-only hanno aria-label:
```html
<button aria-label="Chiudi" class="btn-icon-only">
  <span aria-hidden="true">×</span>
</button>
```

Pattern: text icon for screen reader, icon-only per visual users.

---

## Checklist

- [ ] Button labels ≤5 parole, verbo d'azione + benefit
- [ ] Field labels sempre presenti (no label-as-placeholder)
- [ ] Placeholder = esempio concreto (non label)
- [ ] Error messages 3-part: cosa + perché + recovery
- [ ] Empty state sempre rassicurante + CTA primary
- [ ] Validation state: color + iconografia + testo (mai color alone)
- [ ] Loading state ≥400ms (Doherty) con spinner + testo specifico
- [ ] Tooltip ≤80 caratteri, 1 idea, su :hover + :focus
- [ ] Destructive action: confirmation dialog + typing confirm
- [ ] Status messages specifici + conversazionali
- [ ] aria-label su iconografia UI
- [ ] aria-live su status messages (polite per info, assertive per errori)
- [ ] role="alert" su errori submit
- [ ] No emoji decorativi in microcopy
- [ ] No one-click destructive

---

## Decisioni progettuali

### Da button generic a verb + benefit

Scelta: tutti i button label = verbo + benefit. Mai "OK", "Submit", "Clicca qui". Mai emoji.

### Da error generic a 3-part message

Scelta: errori come "Cosa + Perché + Recovery". Mai "Something went wrong".

### Da placeholder-as-label a label-as-label

Scelta: label sempre visibile. Placeholder = esempio concreto. WCAG compliant.

### Da empty generico a empty reassuring

Scelta: empty state = reassuring + CTA primary. Mai tabella "0" senza context.

### Da validation color-only a validation color + icon + testo

Scelta: status messages = color + iconografia + testo. Mai color alone (color blindness + SR compatibility).

### Da loading senza testo a loading con testo specifico

Scelta: loading >400ms = spinner + testo specifico. Mai silenzio.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Button labels canonici | "Inizia la tua prima simulazione" (5 parole) | ✅ applicato |
| Field labels + placeholder | Label visible + placeholder "nome@esempio.it" | ✅ applicato |
| Error messages 3-part | "Errore di rete. Riprova o scrivi a supporto@concorsoai.it." | ✅ pattern |
| Empty state rassicurante | "Nessuna simulazione ancora. Inizia la prima..." | ✅ design tokens |
| Validation states canonici | 3 tipologie (success/warning/error) + aria | ✅ pattern |
| Loading state con testo | Spinner + "Caricamento della tua sessione..." | ✅ pattern |
| Tooltip breve specifico | Max 80 caratteri, 1 idea | ✅ pattern |
| Destructive action confirmation | Modal + typing confirm | ✅ pattern |
| aria-label su iconografia | Implementato su tutti button icon-only | ✅ applicato |
| aria-live su status | polite per info, assertive per errori | ✅ pattern |
| No emoji decorativi | Lista nera runtime | ✅ verificato |

**Gap**: nessun gap critico.

---

## Vincoli

- ❌ **NO** button labels generic ("OK", "Submit", "Click here").
- ❌ **NO** error messages generic ("Errore", "Something went wrong").
- ❌ **NO** empty state senza CTA primary.
- ❌ **NO** placeholder-as-label (WCAG violation).
- ❌ **NO** validation color-only (color blindness issue).
- ❌ **NO** loading state senza testo.
- ❌ **NO** destructive one-click (anti-pattern safety).
- ❌ **NO** emoji in microcopy.
- ❌ **NO** tooltip su click-only (no keyboard access).
- ❌ **NO** status messages "operazione eseguita" generici.
- ❌ **NO** aria-label mancante su iconografia UI.

---

*Continua in `13_cta_psychology.md`.*
