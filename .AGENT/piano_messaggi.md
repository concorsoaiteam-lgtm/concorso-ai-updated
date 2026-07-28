# PIANO DEI MESSAGGI — PROJECT ATLAS

> **File operativo complementare a `piano.md`.**
> Questo file dice all'agente **cosa fare in OGNI messaggio** che invia all'utente.
> L'utente dice "vai" → l'agente esegue **M1**, ottiene conferma → esegue **M2**, ecc.
> I messaggi sono **unità logiche** (deliverable + checkpoint), non micro-task.

**Regola cardinale**: dopo ogni messaggio, fermati. Mai concatenare 3 messaggi in uno.
**Sequenza totale**: 28 messaggi, mappati 1:1 sulle 6 fasi di `piano.md`.

---

## FASE 1 — FONDAMENTA, COSTITUZIONE & DESIGN SYSTEM (M1–M4)

### MESSAGGIO 1: Kickoff Governance — Costituzione v2 + Anti-Slop Hall of Shame

**Precondizione**: nessuna (è il kickoff) — è il kickoff che sigilla le 12 regole prima di qualsiasi pixel UI.
**Postcondizione**: `.AGENT/costituzione.md` firmata dal Founder + `anti-slop-shame.md` con 10 esempi visivi concreti + `DECISIONS.md` con 3 entry append-only (paletta, font pair, motion standard).
**Tempo stimato**: 45 minuti.

**Obiettivo**: Sigillare le 12 regole non negoziabili. Niente pixel di UI finché il fondamento non è firmato dal Founder.

**Cosa fare**:
1. Scrivi `.AGENT/costituzione.md` con i 12 principi (gli 8 di `metodo.md` + 4 nuovi: ZERO emoji in UI, ZERO bounce, RADIUS ≤ 12, ASIMMETRIA controllata).
2. Crea `.AGENT/anti-slop-shame.md` con 10 esempi VISIVI concreti (markup statico linkabile, non solo descrizioni).
3. Crea `.AGENT/DECISIONS.md` come log append-only e inserisci le prime 3 decisioni chiuse (paletta brand, font pair, motion standard).

**Cosa NON fare**:
- Non iniziare a scrivere CSS, JS, HTML: troppo presto.
- Non chiedere "ti piace la paletta?" — è una DECISION LOG question, non un sondaggio.

**Come comportarsi**:
- Tono: istituzionale, fermo, noioso nella serietà. "Queste sono le 12 regole. Se ne rompi una, il prodotto non esce."
- Rispondi a obiezioni con: "Ecco l'alternativa. Ecco perché la prima è AI Slop."

**Come NON comportarsi**:
- Non giustificarti con trend di design attuali. Il fondamento è atemporale, non stagionale.
- Non cedere su emoji o bounce solo perché il Founder dice "dai, è solo un'emoji".

**Cosa escludere**:
- Qualsiasi scelta di implementazione tecnica (Tailwind, token CSS, librerie).
- Qualasi discussione di strategia di prodotto oltre i principi.

**Anti-slop check** (binary): Founder legge i 12 principi ad alta voce. Acceptance: **Founder firma in-call entro 1h** + **0 principi che fanno ridere o suonano "fighetti"**. Se 1 o più fallisce, riscrivi quello specifico prima di M2.

---

### MESSAGGIO 2: Atlas Tokens + Atlas Base — la fonte unica di verità visiva

**Precondizione**: M1 (paletta e font pair già chiusi in `DECISIONS.md`).
**Postcondizione**: `public/css/atlas-tokens.css` (~60 righe, solo custom properties) + `public/css/atlas-base.css` (~120 righe: reset, button 3 varianti, input, label, tipografia helper). Grep `grep -rE "#[0-9a-fA-F]{3,6}" public/css/ | grep -v atlas-tokens.css` deve restituire ZERO match.
**Tempo stimato**: 90 minuti.

**Obiettivo**: Costruire la base CSS che TUTTO il codice successivo consumerà. Zero colori hex nei file secondari.

**Cosa fare**:
1. Scrivi `public/css/atlas-tokens.css` (~60 righe): palette, tipografia, spacing (4/8/12/16/24/32/48/64), radius (6/8/10/12), ombre (sh-1 → sh-4), motion (`--ease-standard`, `--ease-emphasized`, durate 100/200/300/500ms). SOLO CSS custom properties.
2. Scrivi `public/css/atlas-base.css` (~120 righe): reset, body, link, focus-visible, button (3 varianti), input, label, typography helper.

**Cosa NON fare**:
- Non duplicare token nei file CSS esistenti (`dashboard.css`, `simulation.css`): cancellali dopo aver migrato.
- Non aggiungere shadow utilities "extra": solo le 4 ombre canoniche.

**Come comportarsi**:
- Tono: "Ho creato la fonte. Ogni nuova feature ora pompa solo da qui."
- Se Founder chiede "aggiungiamo un'ombra per i modal?", rispondi: "Estendiamo `--sh-3` o creiamo un nuovo token `--sh-5`? Prima decidiamo, poi ci sono entrambi."

**Come NON comportarsi**:
- Non mostrare "Guarda che bei token 🎨" — emoji vietata.
- Non presentare la paletta con screenshot mockup (avete già Pantone/HEX, basta).

**Cosa escludere**:
- Componenti, layout, dashboard. Solo tokens + base.
- Refactoring dei file CSS esistenti (lo fanno le fasi 2-3 man mano che migrano i componenti).

**Anti-slop check**: `grep -rE "#[0-9a-fA-F]{3,6}" public/css/ | grep -v atlas-tokens.css` deve restituire ZERO match.

---

### MESSAGGIO 3: core-components.html + 24 icone SVG — il catalogo vivente

**Precondizione**: M2 (variabili CSS già definite — i 24 componenti le consumano).
**Postcondizione**: `core-components.html` con 24 elementi renderizzati (8 macro × 3 varianti: default/active/disabled) + set 24 icone SVG inline (stroke 1.5, monochrome, 20px). Template Confusion Test passa (bottone principale ≠ Tailwind UI).
**Tempo stimato**: 120 minuti.

**Obiettivo**: Aggiornare/creare il catalogo HTML che mostra tutti i 24 elementi del design system (8 macro × 3 varianti).

**Cosa fare**:
1. Crea o aggiorna `core-components.html` (pagina statica): 8 macro-componenti (Bottone, Card, Input, Toggle, Pill, Toast, Tooltip, Avatar) × 3 varianti (default/active/disabled) = 24 elementi renderizzati con snippet HTML pronto per copia-incolla.
2. Genera 24 icone SVG inline con stroke 1.5, monochrome, dimensione 20px base. Lista: upload, calendar, trophy, fire, chevron, check, x, mic, send, edit, trash, plus, doc, brain, clock, lock, dotsVertical, refresh, settings, user, mail, bell, sparkle, messageCircle.
3. Ogni componente nel catalogo ha focus-visible keyboard testabile.

**Cosa NON fare**:
- Non usare emoji al posto di icone — emoji vietate.
- Non prendere set icone "gratis" da internet a caso: devono essere coerenti (peso visivo uniforme).

**Come comportarsi**:
- Tono: "Catalogo pronto. Ogni Developer/AP Designer lo consulta prima di scrivere nuova UI."
- Se c'è un'icona mancante, **NON LA FACCIO AL VOLO**. Aggiungo al set in modo controllato (1.5 stroke, monochrome) o ne propongo un'alternativa.

**Come NON comportarsi**:
- Non aggiungere icone "di fretta" fuori dal set.
- Non creare varianti di boolean: default/active/disabled è canonico. Se serve "loading", quello è una 4a macro, NON un quarto stato sulle 3 esistenti.

**Cosa escludere**:
- Componenti specifici della dashboard (Card Bando, Gauge, Calendar). Quelli arrivano in Fase 3.
- Animazioni avanzate. Stop a cascata, focus su statico.

**Anti-slop check**: **Template Confusion Test**. Sovrapponi un bottone di Tailwind UI al bottone principale nel catalogo. Se sono indistinguibili, FAIL.

---

### MESSAGGIO 4: Audit emoji→SVG — chiusura completa

**Precondizione**: M3 (set 24 icone SVG già pronto per sostituire le emoji).
**Postcondizione**: UI completamente bonificata da emoji. `grep -rP "[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]|[\x{1F000}-\x{1F2FF}]" public/*.html public/css/ public/js/` restituisce ZERO match. `!important` e `console.log` di debug rimossi dove non servono.
**Tempo stimato**: 45 minuti.

**Obiettivo**: Zero emoji Unicode sopravvive in UI. Tutto sostituito con SVG inline del set creato in M3.

**Cosa fare**:
1. `grep -rP "[\x{1F300}-\x{1FAFF}]|[\x{2600}-\x{27BF}]|[\x{1F000}-\x{1F2FF}]" public/*.html public/css/ public/js/` per trovare emoji residue.
2. Patch ogni emoji con SVG inline. Lista specifica: 📄→doc, 🟢🟡🔴→3 variabili colore, 🔥→sparkle/streak, 📖→book (se serve), 🎯→target (se serve), ✨→sparkle, ✓→check.
3. Rimuovi `console.log` di debug, dead code comments, `!important` dove non servono.

**Cosa NON fare**:
- Non aggiungere nuove emoji ("una per indicare la sessione completata"). Solo SVG.
- Non lasciare emoji come fallback per mancanza di icona SVG. Crea l'SVG o non mettere nulla.

**Come comportarsi**:
- Tono: meccanico, determinato. Ogni emoji trovata è un bug.
- Output: patch singolarmente PR per PR (non un mega-diff).

**Come NON comportarsi**:
- Non fare "emoji→icona" con emoji a colori restate nel back-end (es. nome classe `emoji-fire`).
- Non giustificare emoji "perché gli utenti le capiscono meglio": non è vero, gli SVG capiscono meglio tutti.

**Cosa escludere**:
- Refactoring dei componenti (solo emoji sostituite).
- Icone nei payload JSON delle API (emoji in DB è OK per analytics, ma in UI vietate).

**Anti-slop check**: il grep finale su `public/*.html` deve restituire ZERO match Unicode emoji block.

---

## FASE 2 — ARCHITETTURA & LAYOUT DEI 4 TAB (M5–M7)

### MESSAGGIO 5: Dashboard shell + topbar + Tab router

**Precondizione**: M2 (tokens e base CSS — il grid 12/6 colonne le consuma).
**Postcondizione**: `public/dashboard.html` con 4 `<section id="tab-N">` swappabili via classe `.is-active` + topbar ridisegnata (logo + 4 tab con underline 2px attivo + avatar/pill Free-Pro) + `public/css/layout.css` (~200 righe, grid 12 col desktop / 6 col mobile, container max-width 1280px). Squint Test passa.
**Tempo stimato**: 60 minuti.

**Obiettivo**: Costruire lo scheletro HTML della dashboard con i 4 Tab navigabili.

**Cosa fare**:
1. Rewrite `public/dashboard.html`: 4 `<section id="tab-N">` swappati via classe CSS (`.is-active`), nessun caricamento di pagina.
2. Topbar ridisegnata: logo + 4 tab orizzontali (active = underline 2px + label brand), avatar/badgetier (Free/Pro pill neutra).
3. Crea `public/css/layout.css` (≈200 righe): CSS Grid 12 colonne desktop / 6 colonne mobile, container max-width 1280px, gap principale 24px, secondario 12px.

**Cosa NON fare**:
- Non popolare i tab con contenuto: solo header + skeleton vuoto + empty state canonico.
- Non usare `position: absolute` per la topbar: deve essere fissa ma fluida.

**Come comportarsi**:
- Tono: "Shell pronta. Ogni Tab ora può accogliere contenuto in Fase 3."
- Niente "dai un'occhiata e dimmi se ti piace" — è struttura, è giusto/basagliato.

**Come NON comportarsi**:
- Non aggiungere micro-animazioni di transizione tra Tab. Solo cambio sezione.
- Non fare "active" con background colorato: solo underline + label. Niente pill, niente background colored.

**Cosa escludere**:
- Contenuto specifico dei Tab (Card Bando, Gauge, ecc.).
- Paywall (lo fa M6).
- Effetti hover/focus avanzati (solo focus-visible keyboard accessibile).

**Anti-slop check**: **Squint Test** sulla dashboard skeleton. Devono risaltare SOLO l'header + l'active tab + lo skeleton. Tutto il resto sfuma.

---

### MESSAGGIO 6: Paywall Tab 2 prototipo — Free state

[OK] **Implementato** (vedi `public/pricing.html`). Vista Free in `dashboard.html` (`#upgradeBtn` handler ora naviga a `/pricing.html` + event log in Supabase `events` table client-side). `pricing.html`: 2-tier layout Free €0 / Pro €29 al mese, FAQ con `<details>` nativi, dialog Pro waitlist (pagamenti in attivazione). Pro-first su mobile via `order: -1`. Anti-slop compliance: niente emoji, niente gradient sui CTA, niente badge "Consigliato", niente countdown. Code-reviewer round 2 OK.

---

### MESSAGGIO 7: Empty state canonico + mobile collapse (375px)

**Precondizione**: M5 (shell dashboard dove applicare le 4 varianti) + M3 (set SVG per le iconcine outline 24px degli empty state).
**Postcondizione**: Componente `.empty-state` canonico (icona 24px + titolo 1 riga + sottotitolo + CTA opzionale, padding 48px top/bottom) + 4 varianti applicate ("Nessun bando"/"Nessuna simulazione"/"Nessun piano"/"Classifica in arrivo") + viewport 375px (iPhone SE) testato zero-overflow.
**Tempo stimato**: 60 minuti.

**Obiettivo**: Definire l'empty state riusabile in TUTTE le viste vuote, e garantire usabilità su mobile.

**Cosa fare**:
1. Componente `.empty-state` canonico: icona outline (24px) sopra + titolo 1 riga + sottotitolo + CTA opzionale. Padding 48px top/bottom. Center-aligned.
2. Crea 4 varianti applicate: "Nessun bando ancora" (CTA: carica PDF), "Nessuna simulazione ancora" (CTA: inizia), "Nessun piano" (CTA: parla col coach), "Classifica in arrivo" (solo testo + form email).
3. Testa viewport 375px iPhone SE: topbar collassa a hamburger se serve, tab labels abbreviati se servono. Niente overflow orizzontale.

**Cosa NON fare**:
- Non disegnare illustrazioni custom per ogni empty state. Icona outline dal catalogo basta.
- Non lasciare uno stato "loading" persistente dopo empty state — passare al contenuto live non appena disponibile.

**Come comportarsi**:
- Tono: "Ecco l'empty state canonico. Si applica in 4 punti adesso. Si riuserà in futuro."
- Se Founder dice "qui manca un'illustrazione cool", rispondi: "Il manifesto dice 'silenzio'. Un'illustrazione cool è AI Slop."

**Come NON comportarsi**:
- Non aggiungere animazioni di "fade in" all'empty state.
- Non fare CTA con gradient o scale hover.

**Cosa escludere**:
- Empty states specifici della simulazione (gestiti in Fase 4).
- Skeleton loader avanzato (basta skeleton lineare 1.5s).

**Anti-slop check**: apri 4 pagine vuote (Tab 1, 2, 3, 4 Free) e fai Squint Test. Devono avere tutte lo stesso "respiro" visivo.

---

## FASE 3 — COMPONENTI CHIAVE (M8–M13)

### MESSAGGIO 8: Card Bando (Tab 1) + Toggle Difficoltà/Durata

**Precondizione**: M5 (dashboard grid CSS) + M7 (empty state canonico se M9 lo riusa nel Tab 2).
**Postcondizione**: `.bando-card` con 2 varianti (default/selected, quest'ultima si espande inline con i toggle config) + `.opt-toggle-group` 3×3 (Facile/Realistico/Difficile × 10/20/30 min) con `.opt-toggle--active` su `#EAF4FF`/border 1.5px `#2563EB`. Default selezionato: Realistico + 20min.
**Tempo stimato**: 60 minuti.

**Obiettivo**: Costruire l'interfaccia di setup della simulazione. Solo questo Tab, non gli altri.

**Cosa fare**:
1. `.bando-card` con 2 varianti (default, selected espansa). Selected: bordo brand 2px (non 4px), si espande mostrando config sotto. Click sulla card = toggle.
2. `.opt-toggle-group` con 3 opzioni × 3 opzioni (Facile/Realistico/Difficile × 10min/20min/30min). Active state = `.opt-toggle--active` con background `#EAF4FF` e bordo 1.5px `#2563EB`.

**Cosa NON fare**:
- Non mettere la config (toggles) FUORI dalla card espansa —_INLINE dentro, una sezione sotto.
- Non mostrare contatore "2/5 bandi selezionati" — la meta UI è confusion.

**Come comportarsi**:
- Tono: "Default: Realistico + 20min. Cambio solo con click esplicito."
- Se Founder chiede "perché solo 3 difficoltà?", rispondi: "3 è ritmo. 4 opzioni crea decision fatigue."

**Come NON comportarsi**:
- Non aggiungere "tooltip esplicativo" su ogni difficoltà — l'utente impara al primo click sbagliato.
- Non mettere icone emoji "🟢🟡🔴" per i tipi di difficoltà. Testo solo.

**Cosa escludere**:
- Backend logic (già esiste).
- Guess automatico della difficoltà (è compito del coach, non della UI).

**Anti-slop check**: la card selezionata deve avere VISIBILMENTE la stessa struttura della non selezionata, con solo il bordo diverso. Zero glassmorphism.

---

### MESSAGGIO 9: Calendar 7 giorni + Chat AI inline (Tab 2)

**Precondizione**: M5 (dashboard grid) + M6 (vista Pro placeholder da popolare). Riferimento esterno: `idee.md` per il flusso della chat di onboarding.
**Postcondizione**: Calendar 7 colonne (lun-dom, ognuna con data grande + tipo sessione icona outline + durata + stato) — grid 7 col desktop, 7 row mobile + chat AI inline nel Tab 2 (bubble commissario + bubble utente + system muted, base statica senza typewriter).
**Tempo stimato**: 120 minuti.

**Obiettivo**: Il Tab 2-Pro comincia a prendere forma: pianificazione settimanale + chat coaching mini.

**Cosa fare**:
1. Calendar 7 colonne (lun-dom): ogni cella mostra data grande + tipo sessione (icona outline) + durata + stato (completata/oggi/futuro/vuota). Grid 7 col desktop, 7 row mobile (mantieni leggibilità).
2. Chat AI inline: bubble commissario (avatar CA + nome + badge "Online"), bubble utente (avatar iniziale a destra), system messages in muted. Solo base, senza typewriter human (quello arriva in Fase 4).

**Cosa NON fare**:
- Non disegnare la chat con animazioni di "typing" elaborate: solo bubble statico per ora.
- Non fare la chat full-screen: deve stare DENTRO al Tab 2.

**Come comportarsi**:
- Tono: "Calendar è la spina dorsale del piano. Chat è il dialogo con il coach."
- Se Founder vuole "drag & drop delle sessioni nel calendar", rispondi: "Drag è gesture, gesture è complessità. Click + popup sposta è più chiaro."

**Come NON comportarsi**:
- Non usare librerie di calendario (FullCalendar, React Big Calendar). Vanilla CSS Grid per 7 colonne.
- Non aggiungere events "ricorrenti" — il piano è settimanale, non multi-mese.

**Cosa escludere**:
- Notifiche push (rimandate a v1.1).
- Sync Google Calendar (rimandato a v1.1).
- Memoria di seduta nella chat (Fase 4).

**Anti-slop check**: il calendar deve avere UN solo colore per stato. Non 4 colori diversi. Gerarchia tipografica, non cromatica.

---

### MESSAGGIO 10: Gauge SVG 140px + Streak austero (Tab 3)

**Precondizione**: M2 (tokens per tipografia Geist Mono + radius canonici).
**Postcondizione**: SVG Gauge 140px desktop / 100px mobile (stroke 10px, stroke-linecap round, stroke-dashoffset animation 1.2s, colore dinamico rosso/amber/verde) con centro Geist Mono 38px + Streak austero (numero 64px + label "giorni di fila" + record + colore dinamico gray→orange→red→violet, NO fiamma SVG).
**Tempo stimato**: 90 minuti.

**Obiettivo**: I due elementi "performance" della dashboard. Devono comunicare chiari, senza essere videogame.

**Cosa fare**:
1. SVG Gauge: 140px desktop, 100px mobile (da DESIGN.MD canonici). Stroke 10px, stroke-linecap round. Stroke-dashoffset animation 1.2s da 0 al valore. Colore dinamico (rosso < 6, amber 6-7.9, verde ≥ 8). Centro: numero Geist Mono 38px + label "Sufficiente/Eccellente/Da migliorare".
2. Streak: numero Geist Mono 64px + label "giorni di fila" + piccolo record + colore dinamico (gray→orange→red→violet). NO fiamma SVG videogame. Bordo viola sottile solo per "legend" (15+).

**Cosa NON fare**:
- Non mettere emoji 🔥 nello Streak (mai emoji).
- Non aggiungere animazione `gaugeBreathe` infinita di default — solo on user attention.

**Come comportarsi**:
- Tono: "I dati sono numeri. Le emozioni sono ridotte al minimo."
- Se Founder chiede "fammi vedere il gauge che si riempie con animazione wow", rispondi: "C'è già la stroke-dashoffset 1.2s. Basta. Più di così è spettacolo."

**Come NON comportarsi**:
- Non creare "celebration animation" quando l'utente raggiunge 10 giorni di streak. Solo cambio colore.
- Non usare number flipper animation morbosa.

**Cosa escludere**:
- Hover state avanzato sul gauge (click espande le aree, basta).
- Variant "high-fiving" dello Streak.

**Anti-slop check**: in DevTools, emula `prefers-reduced-motion: reduce`. Se gauge respira ancora o il numero pulsa, FAIL.

---

### MESSAGGIO 11: Accordion Aree + Sparkline trend (Tab 3)

**Precondizione**: M10 (Gauge definisce i dati di Chiarezza/Struttura/Contenuto che il trend plotta).
**Postcondizione**: `.aree-card` accordion (apertura via `grid-template-rows: 0fr → 1fr`, NO `max-height` hardcoded) con 3 righe (Chiarezza/Struttura/Contenuto: nome + valore Geist Mono + barra progresso) + sparkline trend SVG 160px (8 punti cliccabili, line brand + dot, banda varianza 10% opacity).
**Tempo stimato**: 90 minuti.

**Obiettivo**: Le specifiche del Tab 3 — i dettagli che rendono utile la pagina Progressi.

**Cosa fare**:
1. Accordion "Aree da migliorare" (default collapsed). Apertura via grid-template-rows: 0fr → 1fr (no max-height hardcoded). Header: titolo + chevron ruotante.
2. 3 aree inside: Chiarezza, Struttura, Contenuto. Ogni riga: nome + valore Geist Mono + barra progresso (gradient blu sobrio).
3. Sparkline trend SVG: 160px altezza, 8 punti clickabili, line blu + dot brand. Varianz band 10% opacity sotto.

**Cosa NON fare**:
- Non aggiungere tooltip esplicativi su ogni barra — già auto-evidente dal nome.
- Non aprire l'accordion di default (solo se voto < 6).

**Come comportarsi**:
- Tono: "Le aree sono leggibili, lo sparkline è discreto. Click sul dot apre dettaglio."
- Se Founder vuole "tooltip spiegone su Chiarezza vs Struttura", rispondi: "Glossario in /help, non qui. Qui è solo numeri chiari."

**Come NON comportarsi**:
- Non usare librerie charting (Chart.js, D3). Vanilla SVG, ~40 righe.
- Non highlightare giorni "festivi" nello sparkline (over-engineering).

**Cosa escludere**:
- Confronto con target utente (Classeifica è post-v1.0).
- Predizione "Andamento futuro" (no magic, no bullshit).

**Anti-slop check**: la transizione accordion Smoothstep (no easeInOut rimbalzante), 0.32s. Solo questo.

---

### MESSAGGIO 12: Toast system + Free/Pro badge

**Precondizione**: M5 (topbar dove risiede la pill Free/Pro).
**Postcondizione**: Toast system vanilla (3 tipi: success/error/warning, posizione fisso alto-destra, max 5s, queue mode max 1 visibile alla volta, ombra ≤8px) + Free/Pro pill neutra nella topbar (Free=grigio leggero, Pro=brand sfondo, NO animazioni).
**Tempo stimato**: 45 minuti.

**Obiettivo**: Utilities riusabili per tutta la dashboard + simulazione.

**Cosa fare**:
1. Toast system: 3 tipi (success/error/warning), posizione fissa alto-destra, max 5s, dismiss click. Max 1 visibile alla volta (queue mode).
2. Free/Pro pill neutra: badge piccolo a destra dell'avatar. Free = grigio leggero, Pro = brand sfondo. NO animazione shimmer o pulse.

**Cosa NON fare**:
- Non aggiungere il 4° tipo toast (info). Solo success/error/warning.
- Non mettere icone emoji nei toast. Solo SVG outline.

**Come comportarsi**:
- Tono: "Toast è utility. Pill è identity. Niente spettacolo."
- Se Founder chiede "toast con haptic feedback", rispondi: "Sì ma quello è in M20, qui no."

**Come NON comportarsi**:
- Non usare librerie tipo react-hot-toast. Vanilla JS ~30 righe.
- Non aggiungere suono al toast (lo fa M21).

**Cosa escludere**:
- Modal overlay (rimandato a Fase 4 paywall modal).
- Dismissible persistent toast.

**Anti-slop check**: ombra toast ≤8px blur. Non 32px. Da `.AGENT/anti-slop.md`.

---

### MESSAGGIO 13: Tutorial Coach Tooltip (3 step con persistenza)

**Precondizione**: M8 (Card Bando renderizzata = primo step utente del flusso).
**Postcondizione**: Tooltip Coach 3 step sequenziali (carica bando → seleziona → configura) con posizionamento dinamico, bottone SKIP persistente, persistenza in `localStorage.ATLAS_TUTORIAL_DONE` (mai resettare). Animazione: fade + slideY 4px. NON blocca interazione utente.
**Tempo stimato**: 90 minuti.

**Obiettivo**: Il primo utente deve capire senza rumore. I tooltips sono COACH, mai invasivi.

**Cosa fare**:
1. 3 step sequenziali (Step 1: carica bando, Step 2: seleziona, Step 3: configura). Posizionamento dinamico. NON bloccare interazione (utente può cliccare ovunque).
2. Bottone SKIP in alto-destra. Persistenza: `localStorage.ATLAS_TUTORIAL_DONE = true` dopo l'ultimo step o dopo skip. Mai resettare.
3. Priority tooltip su elementi (freccia + label). Animazione entrata: fade + slideY 4px. Uscita: invertita.

**Cosa NON fare**:
- Non fare 5 step. 3 è ritmo.
- Non bloccare la UI con overlay scuro semi-trasparente.

**Come comportarsi**:
- Tono: "Il tutorial è un collega che ti dice 'ehi, guarda qui'. Mai un maestro che ti blocca."
- Se Founder vuole "tutorial più dettagliato", rispondi: "Tooltips brevi + docs in /help. Mai step esplicativi lunghi."

**Come NON comportarsi**:
- Non fare modal "Welcome to Concorso AI!" con illustrazione. È AI Slop.
- Non usare emoji nel tooltip.

**Cosa escludere**:
- Tutorial per Tab 3 o 4 (solo Tab 1 li ha).
- Video tutorial (rimandato a v2.0).

**Anti-slop check**: il primo step deve apparire entro 800ms dal primo render. Non di più.

---

## FASE 4 — SIMULAZIONE CORE & MICRO-STATI (M14–M19)

### MESSAGGIO 14: Decomposizione simulation.html in 4 moduli

**Precondizione**: M8 (setup simulazione che porta a simulation.html). Riferimento esterno: `simulation.html` legacy monolitico (1998 righe) da cui si estrae.
**Postcondizione**: 4 moduli JS indipendenti — `public/js/sim-config.js` (~150 righe, init + startSimulation), `sim-briefing.js` (~80, orb + 3-step animazione 1.2s), `sim-chat.js` (~400, engine con typewriter base pausa fissa), `sim-summary.js` (~150, voto + metriche) + `simulation.html` shell < 600 righe con 4 `<script defer>`. `wc -l public/simulation.html` ≤ 600.
**Tempo stimato**: 120 minuti.

**Obiettivo**: Da monolite 1998 righe → shell < 600 righe + 4 moduli JS indipendenti.

**Cosa fare**:
1. Crea `public/js/sim-config.js` (~150 righe): selezione bando + toggle config. Esporta init() e startSimulation().
2. Crea `public/js/sim-briefing.js` (~80 righe): overlay 1.2s animazione con orb + 3 step "Analisi bandi → Calibrazione → Pronta domanda".
3. Crea `public/js/sim-chat.js` (~400 righe): engine chat con typewriter, pause, memoria (vuoto per ora).
4. Crea `public/js/sim-summary.js` (~150 righe): voto finale + metriche.
5. Riscrivi `simulation.html` come shell < 600 righe con 4 `<script defer>` alla fine.

**Cosa NON fare**:
- Non riscrivere la logica AI (chiamaCommissarioStream, gestione chunk). Solo modularizzare.
- Non toccare `api/chat.js`. Solo client-side decomposition.

**Come comportarsi**:
- Tono: "Monolite smontato. Ogni modulo ha una responsabilità. Niente side-effect nascosti."
- Se Founder chiede "perché 4 moduli e non 3?", rispondi: "Config (input utente), Briefing (transizione), Chat (cuore), Summary (output). 4 fasi = 4 responsabilità."

**Come NON comportarsi**:
- Non aggiungere un `sim-utils.js`. Ogni modulo è autonomo.
- Non lasciare logica "in pagina" residua nel nuovo `simulation.html`.

**Cosa escludere**:
- Riscrivere il prompt system LLM (in M17).
- Aggiungere nuove feature nella simulazione (focus su questo, non extra).

**Anti-slop check**: `wc -l public/simulation.html` deve essere ≤ 600 (vs 1998).

---

### MESSAGGIO 15: Typewriter con pause umane — anti-slop ATTIVO

**Precondizione**: M14 (`sim-chat.js` engine modularizzato dove iniettare il typewriter).
**Postcondizione**: Typewriter con token-parser (`.`=120ms / `,`=60ms / `\n\n`=280ms / `?`=100ms) + rendering chunk-by-chunk via `requestAnimationFrame` (NO `setInterval`) + test quantitativo superato: deviazione standard durata totale ≥ 15% su 5 simulazioni di 20min in condizioni identiche.
**Tempo stimato**: 120 minuti (include ciclo di test multiplo sull'AI).

**Obiettivo**: Il commissario respira come persona. Typewriter NON lineare — pause su punteggiatura.

**Cosa fare**:
1. Implementa parser di token che riconosce `.`, `,`, `\n\n`, `?`, `!`. Per ogni token, applica delay specifico (`.` = 120ms, `\n\n` = 280ms, `,` = 60ms, `?` = 100ms).
2. Rendering chunk-by-chunk con `requestAnimationFrame`. Durata totale del testo varia ±20% tra rendering della stessa stringa.
3. Misurazione di accettazione: lancia 5 simulazioni di 20min in condizioni identiche, misura deviazione standard della durata totale. Deve essere ≥ 15%.

**Cosa NON fare**:
- Non usare `setInterval` per il typewriter (rallenta in background). Usa `Date.now()` + `requestAnimationFrame`.
- Non mostrare "delay artificiale" di 500ms prima di iniziare — solo pause naturali sui token.

**Come comportarsi**:
- Tono: "Il commissario ora è una persona. Misurabile, testabile, umano."
- Se Founder dice "non si nota", è il MASSIMO complimento. Conferma che il typewriter sta funzionando.

**Come NON comportarsi**:
- Non aggiungere configurazioni di "velocità typewriter" come feature utente.
- Non randomizzare le pause: sono fisse per token type.

**Cosa escludere**:
- Suono "tick" per ogni carattere (rimandato a M21).
- Memoria di seduta (M17).

**Anti-slop check**: deviazione standard misurata deve essere ≥ 15%. Se è lineare (< 5%), qualcosa si è rotto.

---

### MESSAGGIO 16: Memoria di seduta + Reazioni commissario iterate

**Precondizione**: M14 (`sim-chat.js` engine indipendente) + `api/chat.js` (route streaming — la memoria viaggia lì). NOTA: M15 NON è precondizione (memoria è indipendente dal typewriter).
**Postcondizione**: `chatHistory` passato INTERAMENTE al LLM in ogni chiamata (NO truncation aggressiva) + prompt system aggiornato ("Non ripetere domande fatte. Se l'utente contraddice, menzionalo.") + 6 reazioni baseline nel prompt ("Non mi convince" / "Buona, ma..." / "Approfondiamo" / "Coraggio, vai avanti" / "Esatto" / "Esponi meglio") + test "prima hai detto X" superato (≥3/5 menzioni su 5 round contraddittori).
**Tempo stimato**: 90 minuti.

**Obiettivo**: Il commissario RICORDA cosa ha detto l'utente 3 turni fa. Non cambia argomento casualmente.

**Cosa fare**:
1. `chatHistory` passato INTERAMENTE al LLM in ogni chiamata. Nessuna truncation aggressiva. Aggiornamento prompt system: "Non ripetere domande fatte. Se l'utente contraddice, menzionalo."
2. Implementa 6 reazioni commissario baseline: "Non mi convince" / "Buona, ma..." / "Approfondiamo" / "Coraggio, vai avanti" / "Esatto" / "Esponi meglio". Selezione probabilistica via LLM (temperature 0.5).
3. Test "prima hai detto X": 5 round dove utente cambia idea. Commissario deve menzionare l'idea precedente ≥ 3 volte.

**Cosa NON fare**:
- Non limitare la history ai "ultimi 3 turni". Il full context è cruciale.
- Non codificare le 6 reazioni come regex pattern matching. Lasciale emergere dal prompt.

**Come comportarsi**:
- Tono: "Il commissario ora è arguto, non generico. Si ricorda e reagisce."
- Se Founder dice "il commissario è troppo aggressivo", calibra: riduci frequency delle reazioni negative.

**Come NON comportarsi**:
- Non aggiungere tracciamento utente per "personalizzare" reazioni (over-engineering).
- Non fare 12 reazioni. 6 sono ritmo.

**Cosa escludere**:
- Personalizzazione modello LLM per utente (v2.0 territory).
- Memoria cross-session (no, troppo creepy).

**Anti-slop check**: leggere 5 risposte del commissario come dialogo teatrale. Se in 30s non "suona" persona, prompt system va raffinato.

---

### MESSAGGIO 17: Feedback panel MOBILE redesign (drawer)

**Precondizione**: M14 (nuova struttura `simulation.html` + moduli, tra cui `sim-chat.js` che ospita il panel).
**Postcondizione**: Drawer bottom-sheet mobile (max-height 60vh, default collapsed, tap su handle per espandere, NO overlap con input, animazione `translateY` 250ms ease-out) + sidebar fissa desktop ≥ 768px. Test iPhone SE 375×667: chat sempre leggibile, mai coperta.
**Tempo stimato**: 60 minuti.

**Obiettivo**: Su mobile, il feedback panel NON copre più la chat. Risolve il problema UX più critico della simulazione.

**Cosa fare**:
1. Drawer bottom-sheet su mobile (max-height 60vh, default collapsed). Tap sull'handle per espandere. No overlap con input.
2. Su desktop, sidebar fissa a destra (size invariato, ma assicura che la chat sia leggibile).
3. Animazione drawer: translateY (no scale, no opacity combinata). 250ms ease-out.

**Cosa NON fare**:
- Non fare drawer full-screen (l'utente deve vedere la domanda del commissario).
- Non mettere indicatori "X nuove metrics" sul collapsed state.

**Come comportarsi**:
- Tono: "Il feedback ora respira. L'utente lo consulta quando vuole, non quando l'app lo impone."
- Se Founder chiede "sempre aperto in tablet?", rispondi: "Sì, breakpoint 768px = sidebar. < 768px = drawer."

**Come NON comportarsi**:
- Non aggiungere "modal feedback" full-screen.
- Non fare peek/trigger al passaggio del mouse (mobile first, niente mouse-only).

**Cosa escludere**:
- Drag-to-resize drawer.
- Personalizzazione posizione drawer (lato utente).

**Anti-slop check**: testa su iPhone SE (375x667). La chat è sempre leggibile MAI coperta dal drawer.

---

### MESSAGGIO 18: Empty state pre-prima-domanda + Quota check pre-startSimulation

[OK] **Implementato (parziale)** in `public/simulation.html`. Empty state chat (`#chatEmptyState`): "La commissione sta preparando la prima domanda." visibile pre-prima-domanda. Quota check bloccante in `checkQuota()` + safety net in `startSimulation()`: se Free con quota esaurita → `<dialog id="quotaModal">` nativo (lucchetto outline + "Hai finito le simulazioni di prova" + CTA "Vedi piani" → `/pricing`). CSS + JS (~50 righe totali) dentro il file. Bonus: `.summary-pro-cta` post-summary visibile solo per Free via `body.tier-free` (non in M18 spec, aggiunto per chiudere il loop di conversione). NON implementato: typewriter anticipata "ultimi 3 caratteri durante il pensiero". Anti-slop compliance: dialog nativo (no overlay custom), niente emoji, niente countdown, niente counter visibile durante flusso normale.

---

### MESSAGGIO 19: Telemetria 8 eventi (strumentazione invisibile)

[OK] **Implementato (foundation only)**. Helper canonico in `public/js/telemetry.js` (~75 righe, vanilla, fire-and-forget, silent fail): API `window.telemetry(event_name, meta)` con auto-resolve user via `supabase.auth.getUser()`, schema canonico `{event_name, page, meta, user_id, created_at}`, auto-fire `page_view` su DOMContentLoaded. Caricato sync in `<head>` di 6 pagine (`index.html`, `auth.html`, `dashboard.html`, `simulation.html`, `pricing.html`, `history.html`). Refactor di 3 handler ad-hoc esistenti verso helper canonico: `dashboard.html` `fase1HandleUpgrade` (`paywall_cta_clicked`) + `fase1HandleNotify` (`classifica_waitlist_join`), `simulation.html` summary-pro-cta click (`summary_pro_cta_clicked`), `pricing.js` `proCta` click (`paywall_cta_clicked`) + waitlist form (`pro_waitlist_join`, con belt-and-suspenders: localStorage + telemetry). 2 business event aggiunti: `simulazione_iniziata` in `startSimulation()`, `simulazione_completata` a `summaryOverlay.hidden=false`. NON implementato: endpoint `api/track.js` HMAC (kept on hold per spec original); eventi restanti `login`, `registro`, `bando_caricato`, `paywall_viewed`, `tutorial_completed` — rimandati a M19-followup. Architettura validata da thinker-with-files-gemini (5 decisioni: signature `telemetry(event, meta)`, loader sync in HEAD, race condition accettata per v1.0, timestamp server-side, priorità MUST-HAVE vs nice-to-have).

---

## FASE 5 — MOTION, HAPTIC & POLISH FINALE (M20–M23)

### MESSAGGIO 20: Haptic feedback (mobile, iOS fallback silente)

**Precondizione**: M14 (trigger points in `sim-chat.js`: invio utente / arrivo commissario / completamento simulazione stabiliti dopo la modularizzazione).
**Postcondizione**: Helper `haptic.js` (~30 righe: `haptic('light')` = `navigator.vibrate(10)`, `haptic('medium')` = `navigator.vibrate([20, 30, 20])`) + feature detection silenziosa iOS + toggle in `localStorage.ATLAS_HAPTICS` (default ON, disattivabile, mai locked) + 3 trigger points installati. Mai `console.error`. Mai UI "vibrate non supportato".
**Tempo stimato**: 30 minuti.

**Obiettivo**: Su mobile, l'utente deve sentire quando invia un messaggio. Su iOS, niente crash.

**Cosa fare**:
1. Helper `haptic.js` (~30 righe): `haptic('light')` = `navigator.vibrate(10)`, `haptic('medium')` = `navigator.vibrate([20, 30, 20])`.
2. Trigger points: invio messaggio utente (light), arrivo commissario (medium), completamento simulazione (long segnale via doppio medium).
3. Feature detection: `if ('vibrate' in navigator && navigator.vibrate)` → usa. Altrimenti silente. Mai console.error. Mai UI "vibrate non supportato".

**Cosa NON fare**:
- Non tentare workaround per iOS (nessuna libreria polyfill funziona davvero).
- Non rendere haptic obbligatorio (toggle in localStorage.ATLAS_HAPTICS).

**Come comportarsi**:
- Tono: "Haptic è invisible feedback. Su Android funziona. Su iOS silente. Zero crash."
- Se Founder chiede "default ON?", rispondi: "Sì, ma disattivabile. Mai locked."

**Come NON comportarsi**:
- Non vibrare troppo forte (light = 10ms è il massimo per messaggi).
- Non vibrare su errori (solo su success).

**Cosa escludere**:
- Vibrazione per toast notification (over-use).
- Vibrazione per click su CTA (troppo invasivo).

**Anti-slop check**: test obbligatorio iPhone 13+ Safari. Nessun `console.error`. Nessun "vibrate not supported" visibile.

---

### MESSAGGIO 21: Audio Experience (3 sub-feature, tutte default OFF)

**Differenza rispetto alla versione precedente**: questo messaggio ora include 3 feature audio coordinate per supportare l'utente "couch persona" (candidato che usa il simulatore come sessione vocale, seduto sul divano con cuffie). L'audio resta **mai default** — ogni sub-feature richiede opt-in esplicito. Settings "Audio" accessibile dall'avatar dropdown menu (2° livello, 2-click depth). L'audio è un differenziale esplicito, non un rumore.

**Precondizione**: M20 (stessi 3 trigger points dell'haptic — riusati come base comune). Haptic (`ATLAS_HAPTICS`) e Audio (`ATLAS_SOUND_FX`/`VOICE`/`INPUT`) sono opt-in indipendenti: l'utente può attivare haptic senza audio, e viceversa. Nessuna sincronizzazione nascosta tra i due sistemi sensoriali.
**Postcondizione**: 3 helper distinti — `feedback-audio.js` (~80 righe vanilla Web Audio API per gli effetti) + `feedback-voice.js` (~120 righe Web Speech API `speechSynthesis` it-IT per la voce del commissario) + `feedback-input.js` (~150 righe Web Speech API `webkitSpeechRecognition` it-IT per l'input vocale, con fallback silente su Firefox desktop) + settings panel accessibile dall'avatar dropdown menu (icona `audio-cog` SVG dal catalogo M3, 2-click depth) + 3 toggle separati in `localStorage.ATLAS_SOUND_FX` / `ATLAS_SOUND_VOICE` / `ATLAS_SOUND_INPUT` (TUTTI default `null` → OFF). Su iOS Safari 17.x: STT funziona nativamente, TTS funziona nativamente. Mai `console.error`. Mai UI "non supportato".
**Tempo stimato**: 150 minuti (suddivisi in 3 sotto-task da ~50 min ciascuno).
**Coerenza con manifesto**: questo messaggio è l'implementazione operativa del principio #6 ("Audio è opt-in, mai default"). Ogni sub-feature ha default OFF; ogni trigger è post-opt-in; nessun suono automatico a page-load.

**Obiettivo**: Supportare la "persona divano" trasformando il simulatore da esperienza di lettura a esperienza di **conversazione**. Per utenti che usano cuffie, l'audio diventa un differenziale vero del prodotto. Per utenti desktop normali che leggono chat, l'audio resta invisibile (mai default, opt-in esplicito).

**Cosa fare** (3 sub-feature):

**SUB-FEATURE A — Audio Effects (micro-sounds chat)**
1. Helper `feedback-audio.js` (~80 righe): sintetizza via Web Audio API 3 suoni → NO file mp3 da CDN.
   - `"tick"`: 40ms, 220Hz, exponential decay → arrivo commissario (nuova bolla renderizza).
   - `"confirm"`: 60ms, 660Hz, double-click (220Hz + 880Hz) → utente invia messaggio.
   - `"ending"`: 400ms sweep 440→880Hz con fadeout → fine simulazione (mostra summary).
2. Trigger points identici a `haptic.js` (riuso degli stessi punti M20): arrivo commissario / invio utente / completamento simulazione. Coerenza tra i due sistemi sensoriali.
3. Toggle in `localStorage.ATLAS_SOUND_FX`. Default **OFF**. Si attiva solo se l'utente ha già optato per voice o input vocale (sub-feature B/C) — coordinazione via `localStorage` cross-check al primo trigger.

**SUB-FEATURE B — Commissioner Voice (TTS, ascolto)**
1. Helper `feedback-voice.js` (~120 righe): Web Speech API `speechSynthesis`, voce italiana `it-IT` (la migliore disponibile nel browser — non forzare brand specifici in v1.0).
2. **Legge SOLO le bubble del commissario** — mai bubble utente, mai system messages, mai pannello feedback.
3. Velocità (`speechSynthesis.rate`): 0.95 (leggermente più lenta del parlato normale — meno "giocoso", più "istituzionale commissario").
4. Pitch (`speechSynthesis.pitch`): 0.95 (leggermente più grave, voce più "matura").
5. Prima attivazione: audio cue breve `"Modalità voce attivata"` (max 800ms, riconferma udibile che la feature è on). *Non viola manifesto #6: è la riconferma udibile dell'atto di opt-in stesso, non un suono automatico di servizio — l'utente l'ha appena attivato.*
6. `speechSynthesis.pause()` automatica quando `document.hidden === true` (rispetta concentrazione utente: se l'utente cambia tab, la voce si ferma).
7. Toggle in `localStorage.ATLAS_SOUND_VOICE`. Default **OFF**.

**SUB-FEATURE C — Speech Input (STT, parla)**
1. Helper `feedback-input.js` (~150 righe): Web Speech API `webkitSpeechRecognition` con feature detection → fallback silente su Firefox desktop.
2. Lingua: `it-IT` esclusivamente (italiano-only è decisione di scope iniziale §7.3 piano.md).
3. UI: icona microfono aggiunta nella input bar della simulazione (SVG `mic` dal catalogo M3). Tap → registra. Auto-stop su **1.8 secondi di silenzio** di default (range consentito 1.0–2.5s, configurabile a runtime) → testo inserito nell'input → utente **rivede e conferma manualmente** prima di inviare. **MAI auto-send** (l'utente deve poter correggere). Default 1.8s bilanciato per parlato lento / candidati senior (auto-stop a 1.5s può tagliare a metà frase).
4. Visual: pulse sottile dell'icona mic durante registrazione via opacity transition (mai waveform animata, rispetto anti-slop manifesto).
5. Permission flow curato (prima attivazione): copy chiaro *"L'audio viene elaborato solo localmente dal browser, non viene salvato sui nostri server."* Requisito GDPR-friendly (vedi §7.4 piano.md).
6. Visualizzazione live della trascrizione nell'input — l'utente vede cosa ha detto, può correggere prima dell'invio.
7. Toggle in `localStorage.ATLAS_SOUND_INPUT`. Default **OFF**.
8. Su Firefox desktop: feature detection → fallback silente (mai UI "non supportato", mai crash). Su iOS Safari 17.x: funziona completamente.

**Settings panel (avatar dropdown, 2° livello)**:
1. Click sull'avatar/badgetier top-right → menu dropdown si apre.
2. Aggiungere voce menu `"Audio"` tra `"Account"` e `"Logout"`. Icona: `audio-cog` SVG dal catalogo M3 (headphone + cog fusi) — 20px, stroke 1.5.
3. Click → settings panel si apre. Mostra: 3 toggle (FX / Voice / Input) + preview button `"Ascolta voce del commissario"` (4 secondi demo con frase fissa *"Buongiorno. Sono il commissario. Quando vuole, iniziamo."*). Nient'altro nel settings — niente equalizer, niente pitch slider, niente lingua dropdown (italiano-only).
4. Settings è 100% CSS-only quanto a layout (gli switch sono replica `.opt-toggle` del Tab 1, da atlas-components.css).

**Cosa NON fare**:
- Non fare nessuna delle 3 feature default ON al primo accesso. Mai.
- Non creare un `AudioContext` a page load — sempre lazy al primo `user gesture` (i browser bloccheranno altrimenti con policy autoplay).
- Non usare `webkitSpeechRecognition` direttamente senza feature detection (Firefox desktop fallirà).
- Non fare auto-send dopo trascrizione STT (l'utente deve poter correggere).
- Non mettere audio settings nella topbar come icona standalone — è dentro l'avatar dropdown per mantenerlo invisibile a chi non lo cerca (manifesto: calma).
- Non suonare all'apertura della pagina — autoplay vietato in tutte le sub-feature.
- Non aggiungere musica di sottofondo o suoni per errori.

**Come comportarsi**:
- Tono: *"L'audio è opt-in pesantemente. Per l'utente casuale è invisibile. Per la 'persona divano' è un differenziale esplicito."*
- Se Founder chiede "perché non default ON?", rispondi: *"Manifesto: calma. Un candidato che apre dopo una giornata pesante e sente 'tick' automatico chiude il sito. Mai."*
- Se Founder chiede "aggiungiamo musica ambient?", rispondi: *"No. È il tipo di cosa che va pianificata, non default. Se serve in futuro, diventa una sub-feature D in v1.1."*

**Come NON comportarsi**:
- Non implementare STT senza `webkitSpeechRecognition` fallback per Firefox (rischio console.error).
- Non chiamare `speechSynthesis.speak()` mentre l'utente è fuori focus (controlla sempre `document.hidden` prima).
- Non presentare le 3 feature come M21a/M21b/M21c separate (rimane un unico M21 con 3 sub-feature, come M22 ha streak + pulse CTA insieme, stile compatto).

**Cosa escludere**:
- Musica di sottofondo / "study ambient" audio bed (rinviato a v1.1, ipotesi sub-feature D).
- Voice picker (italiano-only nella v1.0).
- Pitch slider, velocità slider (manifesto: una domanda per schermata — niente knob su knob).
- Audio per toast (over-use sensoriale).
- Audio per paywall (decisione seria = silenzio).

**Anti-slop check** (binary):
1. `grep -r "Sound\|Audio\|speech\|webkit" public/js/` deve mostrare SOLO i 3 nuovi file (`feedback-audio.js`, `feedback-voice.js`, `feedback-input.js`) + interazione con `localStorage.ATLAS_SOUND_*`. Nessun audio emerso da altre feature.
2. Settings panel accessibile dall'avatar dropdown (NON icona standalone in topbar, mai).
3. TUTTI e 3 i `localStorage.ATLAS_SOUND_*` default `null` (mai `'true'` finché l'utente non opt-in). Acceptance su primo accesso: `localStorage.getItem('ATLAS_SOUND_FX') === null` AND `localStorage.getItem('ATLAS_SOUND_VOICE') === null` AND `localStorage.getItem('ATLAS_SOUND_INPUT') === null`. *Nota per chi scriverá il wiring*: se un futuro opt-out memorizza `'false'` invece di cancellare la chiave, il check si estende a `(get(k) === null OR get(k) === 'false')`. NON usare `'true'` come marker di ON — solo `delete()` o `'false'`.
4. Test iPhone 13+ Safari: STT funziona, TTS funziona, permission flow OK, zero `console.error`.
5. Test Firefox desktop: STT non supportato → fallback silente, zero `console.error`, zero UI "non supportato".
6. Test utente che apre app per la **prima volta**: nessun suono emesso. Mai. Mai autoplay.
7. `prefers-reduced-motion: reduce` → TTS ha pause più lunghe automaticamente via parametri `speechSynthesis` (rate 0.85 invece di 0.95). Acceptance: emulazione in DevTools → la voce rallenta, le pause aumentano.
8. `AudioContext` creato solo al primo `user gesture` (mai lazy-load diretto a page render).

---

### MESSAGGIO 22a: Streak final austero + Rimozione pulse CTA

**Precondizione**: M10 (Streak con `flameWrap`/`flameWave` da rimuovere; CTA hero con `ctaPulse` animation da rimuovere).
**Postcondizione**: 0 pulse CTA visibili (rimossa `ctaPulse` infinita, sostituita con hover `translateY(-2px)`) + 0 flame wrap nello Streak (rimosso `flameWrap` + `flameWave`). Solo numero + label + record con colore dinamico (gray→orange→red→violet). Test DevTools `prefers-reduced-motion: reduce`: nessun pulse/breath visibile.
**Tempo stimato**: 30 minuti.

**Obiettivo**: Eliminare le 2 tracce di videogame UI più visibili.

**Cosa fare**:
1. Rimuovi `ctaPulse` animation infinita dai CTA hero. Default NO animation. Hover = `transform: translateY(-2px)`. Stop alle infinite animations.
2. Streak: rimuovi `flameWrap` con `flameWave` animation. Solo numero + label + record. Colore dinamico (gray→orange→red→violet) senza animation.

**Cosa NON fare**:
- Non aggiungere nuovi CTA con pulse "per emergenza" (animation è impegno perpetuo).
- Non fare streak "high-five animation" sui record. Solo cambio colore.

**Come comportarsi**:
- Tono: "Due fix che chiudono le urla visive. Dashboard diventa silenziosa."
- Se Founder chiede "il hero sembra spento", rispondi: "È spento perché deve essere spento. Manifesto: calma."

**Come NON comportarsi**:
- Non aggiungere "una piccola animazione di attenzione" sui CTA hero. Stop.
- Non inventare un "loading shimmer" per le card.

**Cosa escludere**:
- Effetti su hover del logo.
- Animazioni di skeleton elaborate.

**Anti-slop check** (binary): DevTools `prefers-reduced-motion: reduce` attivo. Acceptance: **0 pulse CTA visibili** + **0 flame wrap nello Streak**. Se 1+ fail, rollback a M10 (Gauge SVG) e rivedi animation proprie.

---

### MESSAGGIO 22b: Linear-gradient audit + commit template guard

**Precondizione**: Tutto il CSS generato (M2–M17) + M22a già completato (rimozione pulse/flame).
**Postcondizione**: 0 `linear-gradient` e 0 `radial-gradient` in `public/css/` (`grep` restituisce ZERO match) + riga `anti-slop-check: gradiente-zero, no-pulse, no-bounce, no-emoji` aggiunta al commit template PR (se manca una parola, PR bloccato). Eccezione consentita: gradient su SVG (non CSS).
**Tempo stimato**: 30 minuti.

**Obiettivo**: Garantire che nessun CTA torni ad avere gradient. Anti-slop strutturale, non decorativo.

**Cosa fare**:
1. `grep -r "linear-gradient" public/css/` deve restituire ZERO match.
2. Rimuovi ogni `background: linear-gradient(...)` residuo. Sostituisci con `--accent` solido o `--brand` solido.
3. Aggiungi al commit template PR: una riga `anti-slop-check: gradiente-zero, no-pulse, no-bounce, no-emoji`. Se una parola manca, PR bloccato.

**Cosa NON fare**:
- Non lasciare `gradient` su background hero "per look professional" (è blocco di brand, non decorazione). Se serve contrasto, scuriamo il solido.
- Non fare eccezioni "per la landing" (Atlas rules apply ovunque).

**Come comportarsi**:
- Tono: "Meccanico, determinato. Ogni gradient è un bug. Grep è il cane da guardia."
- Se Founder chiede "e per il dark mode futuro?", rispondi: "Anche lì. Atlas non prende gradient. Mai."

**Come NON comportarsi**:
- Non fare audit "a campione" — `grep` su tutto `public/css/`.
- Non aggiungere eccezioni "per casi specifici" alla regola.

**Cosa escludere**:
- Gradients su immagini SVG (non CSS, OK).
- Gradients generati via tools esterni (Mapbox, Canvas, ecc.) — fuori dalla regola.

**Anti-slop check** (binary): `grep -r "linear-gradient" public/css/` + `grep -r "radial-gradient" public/css/`. Acceptance: **entrambi 0 match**. Se 1+ match, elimina prima di M23.

**Anti-slop check** (binary): `prefers-reduced-motion: reduce` attivo. Acceptance: **0 animazioni decorative visibili** (pulse CTA, breathing gauge, flame) + **grep -r "linear-gradient" public/css/ restituisce 0 match**. Se 1+ fail, rollback a M10 e rivedi.

---

### MESSAGGIO 23: Prefers-reduced-motion enforcement totale

**Precondizione**: Tutto il CSS generato (M2 + moduli di M5–M17) + M22a/b già chiusi (decorazioni rimosse).
**Postcondizione**: Wrapper `@media (prefers-reduced-motion: reduce)` GLOBALE in `atlas-base.css` che disabilita SOLO animazioni infinite / shimmer / pulse / breathing. Le transitions di stato (color, opacity, hover transform) RESTANO per accessibilità. Test: DevTools emula `reduce`, screenshot cross-pagina identico tranne dettagli trascurabili.
**Tempo stimato**: 60 minuti.

**Obiettivo**: Tutti i micro-stati rispettano `prefers-reduced-motion: reduce`. Le interazioni restano funzionali.

**Cosa fare**:
1. Audit `atlas-base.css`, `simulation.css`, `dashboard.css`, `landing.css` per qualsiasi `animation` o `transition` decorativa.
2. Aggiungi wrapper `@media (prefers-reduced-motion: reduce)` globale che disabilita animazioni INFINITE, shimmer, pulse, breathing.
3. Le transitions di stato (color, opacity, transform on hover) RESTANO — l'utente reduced-motion ha comunque bisogno di feedback per le sue azioni.
4. Test: DevTools → Emulate CSS prefers-reduced-motion: reduce → Cattura screenshot di TUTTE le pagine. Nessun elemento deve saltare/lampeggiare/breathare.

**Cosa NON fare**:
- Non disabilitare TUTTE le animations (l'utente reduced-motion deve comunque percepire feedback).
- Non aggiungere toggle "disabilita animazioni" manuale (è duplicato del system setting).

**Come comportarsi**:
- Tono: "Reduced-motion è accessibilità seria, non nice-to-have. W3C lo richiede."
- Se Founder chiede "aggiungiamo un toggle?", rispondi: "No. Rispetta il setting del sistema operativo. L'utente l'ha scelto lì."

**Come NON comportarsi**:
- Non aggiungere `aria-prefers-reduced-motion` override (preferenze OS).
- Non usare `display: none` su elementi che hanno animazioni — sostituisci con stato statico.

**Cosa escludere**:
- Toggle per "modalità focus" dedicata.
- Pause animation API custom (overkill).

**Anti-slop check**: `prefers-reduced-motion: reduce` attivo. Cattura screenshot dashboard + simulation. Confronto con stato "animato". Identici tranne per i dettagli trascurabili.

---

## FASE 6 — HANDOFF, QA & LANCIO VIVO (M24–M28)

### MESSAGGIO 24: Handoff package + RUNBOOK.md

**Precondizione**: M1–M23 tutti finalizzati e staging-stabili (reduced-motion enforced, gradient-free, typewriter testato).
**Postcondizione**: 4 file firmati: `core-components.html` v1.0-atlas (24+12 elementi renderizzati) + `atlas-tokens.css` v1.0-atlas immutabile + `.AGENT/DECISIONS.md` append-only chiuso + `.AGENT/RUNBOOK.md` (CEO test: chiunque rollbacka in 5 min leggendo solo questo — Vercel CLI/git push, rollback instant, env vars `AI_API_KEY`/`SUPABASE_URL`/`SUPABASE_ANON_KEY`/`BLUESMINDS_API_KEY`, 5 scenari troubleshooting).
**Tempo stimato**: 60 minuti.

**Obiettivo**: 4 file firmati che rappresentano il DNA del prodotto finito.

**Cosa fare**:
1. Finalizza `core-components.html` v1.0-atlas: tutti i 24+12 elementi renderizzati.
2. Finalizza `atlas-tokens.css` v1.0-atlas: tokens immutabili, signed.
3. Finalizza `.AGENT/DECISIONS.md`: append-only, tutte le decisioni di scope firmate.
4. Crea `.AGENT/RUNBOOK.md`: deploy manuale (Vercel CLI o git push), rollback immediate (Vercel instant rollback), env vars richieste (`AI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BLUESMINDS_API_KEY`), troubleshooting 5 scenari comuni.

**Cosa NON fare**:
- Non firmare col token `v1.0.0-atlas` qui (è in M28).
- Non lasciare TODO aperti nel RUNBOOK.

**Come comportarsi**:
- Tono: "Il DNA è firmato. Qualsiasi nuova feature deve passare da qui."
- Se Founder chiede "modifichiamo la palette?", rispondi: "Richiede Atlas Tokens Review Mensile (primo venerdì del mese), non è una decisione di handoff."

**Come NON comportarsi**:
- Non creare documentazione "per developer junior" (è documento di trasmissione, non tutorial).
- Non duplicare le informazioni in più file.

**Cosa escludere**:
- Documentazione utente-facing (gestita altrove).
- Test E2E scripts (overhead per ora).

**Anti-slop check**: il RUNBOOK ha istruzioni eseguibili da chiunque in 5 min senza chiamare nessuno. Test del "CEO test" — il CEO lo legge e riesce a rollbackare da solo.

---

### MESSAGGIO 25: Cross-browser QA + Lighthouse + User Test 5 utenti

**Precondizione**: M24 (handoff package firmato, staging stabile). NOTA: il tempo include SOLO la parte tecnica agente — scheduling 5 utenti e reportistica è lavoro Founder (escluso dal conteggio timer agente).
**Postcondizione**: Cross-browser QA superato (Chrome/Firefox/Safari desktop + 375px/414px/768px mobile, screenshot per ogni Tab, zero errori console) + Lighthouse Performance/Accessibility/Best Practices ≥ 90 su tutte le pagine (accettabile ≥ 85) + Founder firma screenshot QA + trascrizioni 5 user test (sentiment "calmo" 5/5 + frasi spontanee ≥3/5 "silenzioso/invisibile/non lo noto").
**Tempo stimato**: 120 minuti (solo fix tecnici cross-browser + tuning Lighthouse).

**Obiettivo**: Validazione finale oggettiva + soggettiva.

**Cosa fare**:
1. Cross-browser QA: Chrome, Firefox, Safari su desktop + mobile (375px, 414px, 768px). Cattura screenshot di ogni Tab. Zero errori console.
2. Lighthouse audit: Performance, Accessibility, Best Practices su tutte le pagine. Target ≥ 90 (accettabile ≥ 85).
3. User Test esterno: 5 candidati concorsi pubblici reali (NON insider team). 30 min l'uno. Task 1: simulazione 10 min. Task 2: Tab Progressi. Osserva: "non so cosa fare" (obiettivo 0), sentiment "calmo" (obiettivo 5/5), frasi spontanee (obiettivo ≥ 3/5 "silenzioso/invisibile/non lo noto").

**Cosa NON fare**:
- Non usare BrowserStack PRO (over-budget). Usa BrowserStack free o Equivalente.
- Non fare user test con membri interni del team.

**Come comportarsi**:
- Tono: "QA è oggettivo. User test è soggettivo. Insieme coprono qualità percepita + tecnica."
- Se Founder chiede "perché 5 utenti?", rispondi: "5 è saturation per UX observation. Nielsen Norman Group: 5 utenti trovano l'85% dei problemi."

**Come NON comportarsi**:
- Non riportare "Lighthouse 95" senza screenshot.
- Non riportare "utenti contenti" senza trascrizioni.

**Cosa escludere**:
- Performance budget (overhead per una singola pagina).
- A/B testing sui CTA (richiede infrastruttura).

**Anti-slop check**: Lighthouse score, screenshot QA, trascrizioni user test sono TUTTI firmati dal Founder prima di M28.

---

### MESSAGGIO 26: GDPR audit (cookie banner + retention + delete account)

**Precondizione**: Riferimento esterno: `privacy.html` esistente + `/api/delete-account` (stub già esistente). Audit legale esterno NON nello scope agente — la parte tecnica prepara i componenti, il legale firma compliance.
**Postcondizione**: `public/cookie-banner.js` bloccante (~60 righe, categorie necessari always-on + analytics opt-in, NO icone AI Slop, NO "accetta tutto" prominent) + `privacy.html` copy revisionata GDPR-compliant + Data Retention Policy pubblicata (dati simulazione 12 mesi poi anonimi) + `/api/delete-account` operativo (cancellazione 24h con email conferma). NO dark pattern, NO tracking pre-consent, NO cookie wall.
**Tempo stimato**: 60 minuti (solo setup tecnico pre-legale).

**Obiettivo**: Compliance EU reale, non placeholder. Concorso AI è prodotto EU, dati personali sono reali.

**Cosa fare**:
1. Crea `public/cookie-banner.js` (~60 righe): banner bloccante finché utente non acconsente. Categorie: necessari (always-on), analytics (opt-in). Mai icone AI Slop.
2. `pubblic/privacy.html` esiste già — rivedi copy con GDPR-compliant language.
3. Data Retention Policy: pubblica. Dati simulazione conservati 12 mesi poi anonimi. Account utente può chiedere cancellazione via email.
4. Endpoint `/api/delete-account` (esistente stub): completa cancellazione in 24h con conferma via email.

**Cosa NON fare**:
- Non mettere "accetta tutto" prominent + "rifiuta" nascosto (dark pattern vietato EU).
- Non tracking pre-consent.

**Come comportarsi**:
- Tono: "GDPR è legge. Non stiamo a trattare come optional. Ogni utente EU si fida se siamo puliti."
- Se Founder chiede "possiamo evitare il banner?", rispondi: "No. Banner è obbligatorio se usi analytics o localStorage persistenti."

**Come NON comportarsi**:
- Non usare "we value your privacy" come greenwashing. Lingua secca, trasparente.
- Non fare cookie wall (bloccare il sito finché non acconsenti è dark pattern).

**Cosa escludere**:
- Cookie _first party_ di analytics (non servono, sono EU server-side).
- Marketing tracking pixels.

**Anti-slop check**: audit GDPR pre-lancio fatto da legale esterno (o consulente). Noi facciamo la parte tecnica, lui firma compliance.

---

### MESSAGGIO 27: Copy review IT con madrelingua

**Precondizione**: Tutti i file HTML finali (landing + auth + dashboard 4 tab + simulation 4 fasi + history + paywall + cookie banner + privacy). Riferimento esterno: glossario terminologico bandierina consolidato.
**Postcondizione**: Copy UI in italiano revisionato da madrelingua (tono "collega preparato", MAI "insegnante severo" o "amico informale") + glossario bandierina applicato coerentemente (preferire "orale"/"commissione"/"bando"/"piano"/"feedback" — mai "esame orale"/"esaminatori"/"avviso"/"programma"/"valutazione") + lista 30 errori IT-evitabili (doppie spazi, accenti, articoli) verificata riga per riga. 3/3 reviewer esterni approvano.
**Tempo stimato**: 60 minuti.

**Obiettivo**: Nessun errore di tono, grammatica, o gergo concorsuale in UI.

**Cosa fare**:
1. Inventario completo dei testi UI in italiano: landing, auth, dashboard (4 Tab), simulation (4 fasi), history, paywall, cookie banner, privacy.
2. Revisione con madrelingua: tono "collega preparato" (mai "insegnante severo" o "amico informale").
3. Glossario termini bandierina: "orale" (mai "esame orale"), "commissione" (mai "esaminatori"), "bando" (mai "avviso"), "piano" (mai "programma"), "feedback" (mai "valutazione"). Verifica uso coerente.
4. Lista di 30 errori comuni in IT-evitabili (doppie spazi dopo punto, "perchè" senza accento).

**Cosa NON fare**:
- Non usare "caro candidato" (vecchio, paternalistico).
- Non tradurre letteralmente dall'inglese (es. "Let's get started" → "Cominciamo" — sì; → "Iniziamo ora" — meno bene).

**Come comportarsi**:
- Tono: istituzionale, caldo, professionale. "Tranquillo. Facciamolo bene." è il North Star.
- Se Founder vuole "più marketing", rispondi: "Il marketing copy è su landing e pricing, non nel prodotto."

**Come NON comportarsi**:
- Non usare Google Translate per revisionare.
- Non delegare la review a un tool automatico.

**Cosa escludere**:
- Blog posts / docs esterne.
- Email transazionali (rimandate a v1.1).

**Anti-slop check** (binary): 3 persone diverse leggono il copy completo (un designer esterno, un copy freelance, un utente target). Acceptance: **3/3 tutte "suona bene"** + **0 errori grammaticali IT** (doppie spazi, accenti, articoli) + **0 "caro candidato" o gergo paternalistico**. Se 1+ fail, FIX mirato sulla sezione specifica.

---

### MESSAGGIO 28: Cleanup CSS + Tag v1.0.0-atlas + Founder Why Test Live

**Precondizione**: M25 (Lighthouse ≥90 + QA passato) + M26 (GDPR compliance tecnico completo) + M27 (copy IT validato 3/3). Tutti i M1–M27 confermati.
**Postcondizione**: Cleanup CSS (`!important` rimossi ~12 attesi, dead code rimosso, `console.log` debug rimossi, CSS totale ≤ 60 KB = -40% vs baseline) + `git tag v1.0.0-atlas` con changelog firmato che elenca le 6 fasi completate + **Founder Why Test Live** superato (Founder chiede "perché?" su OGNI elemento visibile, ogni risposta è una frase, niente "è bello").
**Tempo stimato**: 90 minuti.

**Obiettivo**: Chiusura del progetto. Firma del Founder.

**Cosa fare**:
1. Cleanup CSS: rimuovi `!important` (~12 attesi), rimuovi dead code (regole CSS non usate), rimuovi `console.log` di debug. Target: CSS totale ≤ 60 KB (vs ~100 KB attuali). -40%.
2. `git tag v1.0.0-atlas` con changelog firmato: lista delle 6 fasi completate, metriche finali.
3. **Founder Why Test Live**: Founder apre Concorso AI davanti al Designer. Per OGNI elemento visibile chiede "perché?". Ogni risposta è una frase, non "è bello". Se delude, rifacimento LIVE prima del tag finale.

**Cosa NON fare**:
- Non taggare `v1.0.0-atlas` prima del Founder Why Test Live.
- Non dichiarare "fatto" prima che tutti i M1-M27 siano confermati.

**Come comportarsi**:
- Tono: "Fatto. Non perfetto, ma Atlas. Il Founder firma."
- Se Founder dice "v1.0 ma già vedo cose da migliorare", rispondi: "Atlas Tokens Review Mensile. Quelle cose vanno nel backlog di v1.1, non bloccano v1.0."

**Come NON comportarsi**:
- Non "rilasciare" prima che Founder Why Test sia passato.
- Non fare un "soft launch" silenzioso.

**Cosa escludere**:
- Marketing push post-lancio (è lavoro di altro team).
- Backlog cleanup di feature non richieste.

**Anti-slop check**: un designer esterno severo guarda Concorso AI per 30 min. Non trova AI Slop "lampante". Se lo trova, rollback a M22/M23.

---

## AUTO-ANALISI FINALE — IL TAGLIANDO DEL PIANO DEI MESSAGGI

### 1. Quanti messaggi hai previsto in totale?

**28 messaggi**, distribuiti sulle 6 fasi:

| Fase | Messaggi | Tempo previsto (deep work) |
|---|---:|---|
| FASE 1 — Fondamenta & Design System | M1, M2, M3, M4 (4) | ~5 ore |
| FASE 2 — Architettura & Layout | M5, M6, M7 (3) | ~2.5 ore |
| FASE 3 — Componenti Chiave | M8, M9, M10, M11, M12, M13 (6) | ~8 ore |
| FASE 4 — Simulazione Core | M14, M15, M16, M17, M18, M19 (6) | ~8 ore |
| FASE 5 — Motion, Haptic & Polish | M20, M21, M22, M23 (4) | ~4 ore |
| FASE 6 — Handoff, QA & Lancio | M24, M25, M26, M27, M28 (5) | ~6.5 ore |
| **TOTALE** | **28** | **~34 ore (~4 giornate piene)** |

Granularità: **1 messaggio = 1 deliverable + 1 checkpoint di accettazione**. Mai micro-task.

### 2. Quale messaggio è il più importante? Perché?

**M15 — Typewriter con pause umane**.

Perché:
- È l'unico deliverable che **misurabilmente rende Atlas riconoscibile senza logo**: chi guarda una simulazione in Atlas dice "si sente diverso", anche se non sa citare il motivo.
- È anti-slop ATTIVO, non passivo. Non dice "non fare AI Slop" ma "respirare come persona". Il test è quantitativo (deviazione standard ≥ 15%), non estetico.
- È strutturalmente il rischio più alto: se fallisce, viene percepito come "l'ennesimo chatbot AI". Se riesce, diventa la referenza del settore.
- Si combina con M16 (memoria + reazioni) e M19 (telemetria) per compostare l'esperienza. Da solo cambia tutto; senza di lui gli altri sono placebo.
- È il momento in cui il Lead Product Designer deve essere più spietato: nessun compromesso, nessuna animazione che distrae dal respiro del commissario.

Se Atlas fosse una statua, M15 è il primo colpo di scalpello che dà le sembianze umane.

### 3. Quale messaggio è il più a rischio di AI Slop? Come lo eviti?

**M22 — Streak final + Rimozione pulse CTA + Linear-gradient audit**. Seguito da **M20–M21** (Haptic + Audio).

Perché M22 è il più a rischio:
- È il momento in cui qualcuno potrebbe dire "ok basta, ora mettiamo un po' di vita con gradient/shimmer/pulse". La pressione a "renderlo vivace" è fortissima in fase polish.
- Il gradient `linear-gradient(90deg, #2563EB, #0F4C81)` è già presente in alcuni file (vedi git diff `index.html`, `dashboard.css`). È la tentazione più grande.
- I designer che amano "il bello" reintroducono pulse/breath/shimmer "perché comune in SaaS di qualità".

Come lo evito (3 meccanismi):
1. **Linear-gradient grep obbligatorio**: `grep -r "linear-gradient" public/css/` deve restituire ZERO. Il check è nel commit template. Se ne aggiungi uno, il commit è bloccato.
2. **Reduced-Motion Audit obbligatorio in DevTools**: emula `prefers-reduced-motion: reduce`. Se pulse/shimmer/breath sono ancora visibili, FAIL il messaggio. È il killer test.
3. **Manifesto come guardia**: rileggi `.AGENT/manifesto.md` ("calma, invisibile, riconoscibile senza logo"). Se l'azione che stai per committare viola uno dei 5 principi, fermati.

Per M20/M21 (Haptic + Audio):
- Limite fisico: suoni ≤50ms (tranne ending). Mai musica, mai autoplay bloccante, mai ui feedback "non supportato" mockato.
- Test device: iPhone 13+ Safari obbligatorio (niente `console.error`). Android Chrome (haptic deve vibrare davvero).
- Default disattivabile in `localStorage.ATLAS_SOUND` e `ATLAS_HAPTICS`.

### 4. Il piano rientra in un budget realistico?

**Totale cumulato: ~34 ore di deep work**, equivalenti a circa 4 giornate piene o 2 settimane di lavoro part-time focalizzato. Tutti i tempi sono single-session Atlas-quality (no quick-win).

Se serve comprimere (es. lancio in 1 settimana invece che 2), i candidati naturali al taglio temporaneo sono:

- **M20 (Haptic)** e **M21 (Audio)** — polish puro, riattivabili in v1.1.
- **M26 (GDPR)** — la parte tecnica è ~60 min; il resto è legale esterno (fuori scope agente).

Al contrario, **mai tagliare**: **M15 (Typewriter)**, **M16 (Memoria)**, **M19 (Telemetria)**. Sono i deliverable che rendono Atlas riconoscibile senza logo e misurabile nel tempo.

---

## NOTA OPERATIVA

L'agente deve:
- Fermarsi dopo ogni messaggio per conferma utente (mai concatenare).
- Se l'utente chiede "vai", eseguire **M1** immediatamente.
- Se l'utente chiede "salta a M15", saltare ma verificare che i prerequisiti (M14 decomp) siano soddisfatti.
- Se l'utente chiede "rivedi", aprire il file `piano.md` + questo file e far avanzamento vs obiettivi misurabili.

> *"Tranquillo. Facciamolo bene."*
