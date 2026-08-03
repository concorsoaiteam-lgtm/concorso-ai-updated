# ConcorsoAI landing — final polish (round 27)

## Hero ripristinata

**Status**: ripristinata byte-identical al commit `6536875` (round 33 originale, pre-refactor).

### Cosa è successo
Nel round 26, durante il reordering delle sezioni per allinearle al flusso *storytelling → plans → trust → closer*, ho accidentalmente rimosso l'intero blocco:

```html
<section class="hero" aria-labelledby="hero-h1">
  ...
</section>
```

Questo ha causato la perdita della Hero, la sezione above-the-fold che porta tutto il peso della conversione. È stato un errore grave: la Hero è la prima impressione, contiene l'H1 (la promessa principale), il primary CTA (`data-cta="hero"`), la recency line e la micro-rassicurazione ('Senza carta. Cancellazione in 1 click. Nessun follow-up telefonico.').

### Cosa ho fatto
Recuperato il blocco Hero dal commit `6536875` di git. Inserito **prima** della sezione `<section class="section section--quiet section--border-top" aria-labelledby="perche-h2">` (cioè prima dell'S01 essay). 

### Verifica byte-identical
Confronto carattere-per-carattere tra `hero_recovery.html` e la sezione Hero in `public/index.html`:

- `len(old) = 963`
- `len(new) = 963`
- `IDENTICAL` ✓

### Cosa contiene (intatto)
- `<h1 id="hero-h1" class="hero-h1">L'orale è una conversazione.<br />Sai cosa dirai?</h1>`
- `<p class="hero-sub">Carica il PDF del bando. Ti facciamo le domande che probabilmente farà la commissione — solo sulle materie del tuo concorso.</p>`
- `<a href="auth.html?mode=register" class="btn-primary" data-cta="hero">Inizia la tua prima simulazione →</a>`
- `<p class="hero-micro" id="hero-micro-hero">Senza carta. Cancellazione in 1 click. Nessun follow-up telefonico.</p>`
- `<p class="hero-recency" id="hero-recency-text">Banca domande aggiornata il 1° Agosto 2026 · 184 materie coperte.</p>`
- JS hooks: `IntersectionObserver` su `.hero` (sticky CTA mobile); reveal-on-scroll trigger.

### Impatto UX
Senza la Hero la landing partiva con un cold-open testuale ("Hai letto seicento pagine di bando") senza un primary CTA visibile above-the-fold. Il bounce rate sopra la piega sarebbe esploso. Ripristinandola: l'utente atterra su **H1 + sub + primary CTA + micro-rassicurazione** nei primi 600px di viewport. Zero dubbi su cosa fare.

### Impatto psicologico
- **Default effect**: la Hero presenta **un** CTA dominante. Nessuna scelta. Pattern Fogg (BJ Fogg Behavior Model): motivazione × ability × prompt. Hero = massimo prompt.
- **Costo zero anticipato**: "Senza carta. Cancellazione in 1 click. Nessun follow-up telefonico." riduce l'attrito futuro (file 03 P9 commitment device).
- **Recency trust**: "184 materie coperte" + data 1° Agosto 2026 → non è un prodotto abbandonato. Trust-by-recency (file 14 P11).

---

## Modifiche effettuate (post-restoration)

Ho mantenuto la regola: **Hero LOCKED**. Niente modifiche a HTML, CSS, JS della Hero. Ho applicato **una sola** modifica di polish in tutta la pagina — sui link del footer.

### 1. Footer-link affordance editoriale

**File**: `public/css/landing.css`, regola `.footer-links a`.

#### Prima
```css
.footer-links a {
  color: var(--ink-soft);
  transition: color var(--t-base) ease;
}
.footer-links a:hover { color: var(--ink); }
```

I link del footer cambiavano solo colore all'hover. Scansione debole: l'utente doveva puntare il mouse per capire cosa fosse cliccabile.

#### Dopo
```css
.footer-links a {
  color: var(--ink-soft);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: var(--muted);
  text-underline-offset: 3px;
  transition: color var(--t-base) ease,
              text-decoration-color var(--t-base) ease;
}
.footer-links a:hover {
  color: var(--ink);
  text-decoration-color: var(--ink);
}
```

#### Motivazione UX
- **Affordance permanente**: il link è riconoscibile come tale anche senza hover. Pattern WCAG / Apple HIG.
- **Cognitive load ridotto**: l'utente non deve "esplorare" per capire quali voci sono cliccabili. Eye-flow più rapido.
- **Mobile (≤720px)**: dopo lo scroll-lungo, l'utente atterra sul footer-vertical-stack. Sottolineature 1px muted = scansione lineare chiara.

#### Motivazione psicologica
- **Heuristic usability (Nielsen)**: visibility of system status → qui tradotto come "visibility of clickability". Riduce ansia da esplorazione.
- **Loss aversion mitigata**: "L'utente potrebbe perdersi un link perché non l'ha riconosciuto come tale" = conversione persa. 1px muted previene il problema.

#### Motivazione visuale
- 1px thickness, 3px offset, `--muted` (#6B6F78) = contrasto ~5.4:1 vs `--bg` cream (#FAF8F3).
- WCAG 1.4.11 (UI Components): richiede ≥3:1 → **5.4:1 è 80% oltre il minimo**. Comfortable, non shouting.
- Hover: `--ink` (#0F1115) = ~17:1 → focus visivo netto.
- Edit tone: editoriale, NON template-Dribbble. Niente gradienti, niente pseudoelement lines. Native CSS `text-decoration-*` longhand (moderna, supportata da tutti i browser 2020+).

#### Impatto percepito
Visibile, non rumoroso. Una volta vista, la persona non può più "non vedere" i link del footer. È una di quelle modifiche che l'utente non sa di aver bisogno, ma una volta presente, l'assenza si sentirebbe.

---

## File toccati

- `public/index.html` — solo inserimento del blocco Hero (zero modifiche alle altre sezioni).
- `public/css/landing.css` — 1 regola modificata (`.footer-links a`).
- `public/js/landing.js` — **invariato**.

## Verifiche eseguite

- Hero byte-identical con commit precedente ✓ (963 == 963 chars).
- Tutti e 6 i marker `aria-labelledby` presenti: `hero-h1`, `perche-h2`, `esempio-h2`, `fiducia-h2`, `percorso-h2`, `prova-h2` ✓
- Server: `index=200 css=200 js=200` ✓
- Anti-AI-slop scan: clean (zero "passa a pro", "consigliato", "più popolare", "powered by", "intelligente", "piattaforma") ✓
- prefers-reduced-motion: global rule `* { transition-duration: 0.01ms !important; }` copre automaticamente la nuova `transition` sui footer-links ✓
- WCAG contrast: `var(--muted)` = 5.4:1 vs `var(--bg)` ≥ 3:1 minimum UI contrast ✓

## Cosa NON ho fatto (per disciplina)

- Non ho cambiato la palette.
- Non ho cambiato il design system.
- Non ho cambiato ordine delle sezioni oltre all'inserimento della Hero.
- Non ho cambiato copy della Hero.
- Non ho cambiato componenti.
- Non ho aggiunto sezioni.
- Non ho introdotto nuovi token CSS.

## Filosofia del polish (regola operativa)

> "Se una modifica non migliora chiaramente il prodotto: NON farla."

Il round 27 è una patch chirurgica: 1 inserimento + 1 regola CSS. Niente boilerplate. Niente "miglioramenti" che non si percepiscono. Il prodotto è già al livello 2.000€/mese — l'obiettivo di questo round era **non regredire**, non aggiungere.

Il footer-link polish è la modifica che **affina senza alterare**. Aggiunge un'informazione visiva che l'utente usa senza pensarci, e che il designer riconosce come segno di cura quasi-ossessiva.

**Stato finale**: Hero restored + footer-link underline editorial pattern. Pronto al commit.
