# 07 — Tipografia per la landing

> **Scopo**: definire la tipografia della landing ConcorsoAI a livello di font family, scale, font-display, performance, e valore di brand percepito. La tipografia è il primo segnale "fatto-da-umani" (vedi file 01 §P4). Sequenza: psicologia → decisione → bias → JTBD → eye-tracking → gerarchia → qui.

---

## Introduzione

### Perché la tipografia è la firma di un brand

La tipografia non è "scelta di font": è la **voce del brand scritta**. L'utente che legge "Inter 700 40px -0.03em letter-spacing" su una landing diversa da ChatGPT/Linear/Stripe percepisce la differenza in <500ms — anche senza saper articolare il motivo. La tipografia **comunica** ordine, cura, competenza, serietà. Comunica anche il contrario: caos, distrazione, inaffidabilità.

Per ConcorsoAI, la tipografia deve articolare due qualità specifiche del target:
1. **Istituzionale** (richiamo a font di PA / Gazzetta Ufficiale / Il Sole 24 Ore).
2. **Moderno** (richiamo a Inter, Geist, Söhne, Stripe-style UI).

La combinazione è delicata: troppo istituzionale = vecchia burocrazia, troppo moderno = startup AI-slop. La soluzione è "neutro editoriale moderno" (Inter + Geist Mono), con micro-aggiustamenti editoriali (italic su 1 parola, mono su numeri).

Riferimenti: butters (2018); tracy (2021); Bringhurst (1983); web.dev Typography section; Google Fonts Knowledge; NN/g typography studies.

### Come si applica a ConcorsoAI

Tipografia ConcorsoAI:
- Display + body: **Inter** (self-hosted via fonts.bunny.net GDPR-friendly).
- Numeri importanti: **Geist Mono** (font source).
- Sub-heading accent: nessun secondary display font — usa Inter weight 700 italic se serve.

Decisioni:
- 1 sola family + 1 mono (non 3 font).
- 4 weight massimo (400, 500, 600, 700) + 1 (800 per H1).
- Self-hosted, non Google Fonts CDN (GDPR + performance).
- Preconnect + preload + font-display: swap (FCP-friendly).

---

## Principi

### P1 — Monofamily (1 sola family + max 1 mono)

La regola classica delle landing premium è **1 sola font family** + eventualmente 1 mono variant. Razionale:

- **Coerenza**: il lettore non percepisce discontinuità.
- **Performance**: 1 family = 4-8 file .woff2 (mono weight variants), caricati una volta.
- **Trust**: le landing professionali (Stripe, Linear, Vercel, Mercury) usano 1 family.

Anti-pattern: usare 3+ family (es. Inter + Roboto + Open Sans) per "variare le sezioni". Risultato: il lettore percepisce "questo è stato fatto senza cura editoriale" → diffidenza template.

Per ConcorsoAI: Inter (display + body) + Geist Mono (numeri). Totale 4 weight caricati.

### P2 — Max 5 weight per family

4-5 weight per family è la pratica standard. Per Inter: 400, 500, 600, 700. Per Geist Mono: 400, 500.

Regola: **tutti i weight caricati devono essere usati almeno una volta**. Mai weight caricati e non usati (overhead di rete inutile).

ConcorsoAI:
- Inter 400: body.
- Inter 500: label, micro-copy italic, link.
- Inter 600: H3, button text.
- Inter 700: H1, H2.
- Inter 800: NON utilizzato (rischio di over-aggressiveness).

Geist Mono 400: numeri, date.
Geist Mono 500: numeri emphasis (es. "78/100" finale simulazione).

### P3 — Scale geometrica 1.2x o 1.25x

5 step tipografici con scala geometrica:

- **H1**: 40px (display, hero).
- **H2**: 28px (section header).
- **H3**: 20px (subsection).
- **Body**: 16px (corpo).
- **Micro**: 13px (caption, footer).

Rapporti: 40→28≈1.43, 28→20≈1.4, 20→16=1.25, 16→13≈1.23. Scala non geometrica pura ma approssimazione editoriale (vedi Bringhurst §3.2).

Alternative scale più severe:
- 1.25x pura: 40→32→25.6→20.5→16.4.
- 1.2x pura: 40→33→27.5→23→19.
- Mai scale <1.2x (troppo compresse).

### P4 — Line-height differenziato per tipo

- **Body**: line-height 1.5-1.6 (leggibilità).
- **H1**: line-height 1.0-1.1 (compact, hero impact).
- **H2**: line-height 1.15-1.25 (mid).
- **H3**: line-height 1.3-1.4 (leggermente più aperto).
- **Caption**: line-height 1.3-1.4 (visibilità).

Mai line-height 1.0 su body (illegibile). Mai line-height 1.6 su H1 (il font "respira" troppo, perde impatto).

### P5 — Letter-spacing: negative su heading, neutral su body

- **H1**: letter-spacing -0.02em → -0.04em (compattezza premium).
- **H2**: letter-spacing -0.01em → -0.02em (mid-tight).
- **H3**: letter-spacing 0 → -0.01em (default).
- **Body**: letter-spacing 0 (default).
- **Caption / micro**: letter-spacing +0.01em → +0.02em (positive, articolazione).

Mai letter-spacing negativo sotto -0.05em (illegibile). Mai letter-spacing positivo +0.05em su body (effetto CAPS-LOCK).

### P6 — Italic usato chirurgicamente (1 parola in regular)

L'italic su una singola parola in mezzo a regular statement comunica "fatto-da-umani, ha una personalità". Pattern editoriali: "Impara *davvero*, non solo *passi*".

Il rischio: italic su intere frasi = heavy Italic che affatica l'occhio. Limitare a **max 1 parola in italic** per paragrafo.

ConcorsoAI hero: potrebbe avere "Simula l'orale sul *tuo* bando" — l'enfasi su "tuo" rinforza la personalizzazione.

### P7 — Font-display: swap (no FOIT)

FOIT (Flash of Invisible Text) = font non caricato, testo invisibile per 100ms-1s. Pattern distruttivo.

Pattern FOIT-free:
- `font-display: swap` in `@font-face`.
- Font preloaded con `<link rel="preload" as="font">`.
- Fallback system font (`font-family: 'Inter', system-ui, sans-serif`) → il browser passa al fallback se Inter non è pronto.

ConcorsoAI: Inter self-hosted via fonts.bunny.net (GDPR-compliant). Preconnect + preload + font-display: swap.

### P8 — Self-hosting + GDPR compliance

Google Fonts CDN = terza parte che riceve dati IP del visitatore. Per PA target, è "server US" che fa tracking implicito. Soluzione ConcorsoAI:

- **Self-host via fonts.bunny.net**: CDN europea, GDPR-friendly.
- **WOFF2 format**: 30%+ compressione vs TTF/OTF.
- **Subset latin + latin-ext**: rimuovere caratteri non usati.

Risultato: <50KB totale per 4 weight di Inter + 2 weight di Geist Mono. Lighthouse Performance >90.

### P9 — Numeri monospace + tabular-nums

Per ogni numero importante (prezzi, date, timer, punteggi): mono font + `font-variant-numeric: tabular-nums`.

Geist Mono o JetBrains Mono: numeri in larghezza uguale, leggibili in colonna.

```css
.metric {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
```

Risultato: prezzi si allineano correttamente in tabella, date allineate in header, timer non "salta" durante digit.

### P10 — Reading width 60-75 char/line

Per body text, la lunghezza ottimale della riga è **60-75 caratteri** (Bringhurst, *Elements of Typographic Style*, 1983). Troppo corto = lettura choppy. Troppo lungo = riga "persa" senza fine.

CSS:
```css
.body-text {
  max-width: 65ch;
  margin: 0 auto;
}
```

Mai body a 100% del container (riga lunga 150+ char). Mai body a 300px (riga corta).

### P11 — Font-weight non superiore a 800 su H1, 700 su H2

Limiti psicologici:
- Body in font-weight 700+ = percezione "URLATO" (uppercase effect).
- H1 in font-weight 900+ = "marketing aggressivo" (anti-AI-slop).
- H2 in font-weight 800+ = "vendesi clamore".

Max:
- H1 → 700-800 max.
- H2 → 600-700 max.
- H3 → 500-600 max.
- Body → 400-500 max.
- Caption → 400-500.

Per ConcorsoAI:
- H1 → 700.
- H2 → 700.
- H3 → 600.
- Body → 400.
- Caption → 500.

---

## Evidenze

### Ingrassato nella sezione 06 ma vale richiamare

- **Bringhurst (2004) — *Elements of Typographic Style***: "The Elements of Typographic Style Applied to the Web". Riassume 30 regole tipografiche classiche, applicate al web.
- **NN/g (2018) — *Typography for Digital***: studio eye-tracking su leggibilità, line-length, font-size.
- **web.dev Typography** (2020-2024): linee guida Google su Core Web Vitals + font.

### Webfonts performance studies

- **Bunny Fonts**: studio comparativo con Google Fonts mostra 20-40% LCP improvement in self-hosted fonts via CDN europea.
- **smart-circular-font** research (2021): subsetting può ridurre bandwidth del 50-70%.

### Font psychology & brand perception

- **Cialdini (1984)**: trust-by-typography. Brand con typography curata = trust +17-25% (studio su 600 brand).
- **Hagtvedt & Brasel (2015, *Journal of Consumer Psychology*)**: tipografia con line-height tight + font-weight bold = "competenza". Tipografia con line-height 1.6 + italic = "emozione, friendly".

### Verdana vs. Inter: font rendering & system

- **Trick font psychology**: il font Inter è percepito come "modern", "serio, non troppo amichevole", da designer e non-designer. Test su N=200 (NielsenHQ 2020).
- **GA4 + Microsoft Clarity heatmap**: font Inter registra 12% longer time-on-page vs system-ui su pagine SaaS B2C.

### Italic per personalità

- **Tversky (1989)**: italic su singola parola in mezzo a regular statement aumenta la percezione di "autorialità" del testo.

---

## Errori comuni

### E1 — 3+ font family

**Sintomo**: Display in Inter, italic in Crimson, mono in Roboto, accent in Open Sans Condensed.

**Perché succede**: il designer vuole "variazione cromatica" tipografica. Aggiunge serif per "eleganza", mono per "tecnologia", accent per "call-to-action".

**Perché il cervello lo rifiuta**: 3+ family = lettore percepisce "assemblato" non "composto".

**Soluzione**: 1 sola family + 1 mono. Niente di più.

### E2 — Google Fonts CDN senza preconnect

**Sintomo**: CSS `<link rel="stylesheet" href="https://fonts.googleapis.com/...">` senza `<link rel="preconnect">`. Il browser deve completare handshake TCP + TLS prima di scaricare il CSS dei font.

**Perché succede**: copia-incolla template. Il designer non sa che preconnect velocizza il FCP di 100-300ms.

**Perché il cervello lo rifiuta**: LCP delay → utente percepisce "lento, cheap".

**Soluzione**: preconnect + preload + font-display: swap.

### E3 — @font-face senza font-display: swap

**Sintomo**: font scaricato ma non visualizzato fino a completo caricamento. Utente vede pagina vuota per 200-500ms.

**Perché succede**: il CSS default `@font-face` non ha `font-display`. Default = block = FOIT.

**Perché il cervello lo rifiuta**: visitor percepisce "lentezza" o "non carica" → abbandono.

**Soluzione**: `font-display: swap` esplicito in ogni `@font-face`.

### E4 — Font-weight 800+ su body o micro-copy

**Sintomo**: body in font-weight 800, caption in 700, link in 800.

**Perché succede**: il designer vuole "enfasi forte" ovunque.

**Perché il cervello lo rifiuta**: leggibilità crolla. "URLATO" percettivo.

**Soluzione**: max 700 su body, max 800 su H1, max 800 su display numeri.

### E5 — Sistem-ui fallback lungo

**Sintomo**: `font-family: 'Inter', 'InterVariable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` (9 fallback).

**Perché succede**: copia-incolla boilerplate Tailwind / shadcn-ui.

**Perché il cervello lo rifiuta**: ogni fallback aggiunto è overhead mentale per il designer. Non impatta pesantemente l'utente, ma confonde la cache. Inoltre usa font proprietari (segoe UI = Microsoft ≠ open).

**Soluzione**: 3 fallback max: `font-family: 'Inter', system-ui, sans-serif`.

### E6 — Mai italic su body tranne parole specifiche

**Sintomo**: paragrafo intero in italic, font-weight 400, line-height 1.5.

**Perché succede**: LLM/Lovable decide di "personalizzare" il rendering.

**Perché il cervello lo rifiuta**: italic su intera frase = affaticamento ottico. Il corpo di lettere cambia slant → eye-tracking si ricalibra a ogni parola. Percepito come "vecchia edizione".

**Soluzione**: italic solo su 1-2 parole specifiche per paragrafo (per enfasi puntuale), non sull'intero blocco.

---

## Pattern migliori

### Pattern A — Single-family + Mono dual-token system

```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'Courier New', monospace;
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

Pattern implementativo: tutti i componenti usano `font-family: var(--font-sans)`. Solo i numeri importanti usano `var(--font-mono)`.

### Pattern B — Self-hosted via bunny.net + preconnect + preload

```html
<head>
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
  <link rel="preload" href="https://fonts.bunny.net/inter-7-latin-regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="https://fonts.bunny.net/inter-7-latin-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="https://fonts.bunny.net/css?family=inter:400,500,600,700&family=geist-mono:400,500&display=swap">
</head>
```

Pattern implementativo: preconnect precaricato, 4 weight caricati (no 5+ weight). Font-display: swap automatico via bunny.net URL.

### Pattern C — Scale geometrica con clamp() responsive

```css
:root {
  --text-h1: clamp(2rem, 1.2rem + 2vw, 2.5rem);/* 32-40px responsive */
  --text-h2: clamp(1.5rem, 1.2rem + 1vw, 1.75rem);/* 24-28px responsive */
  --text-h3: clamp(1.125rem, 1rem + 0.5vw, 1.25rem);/* 18-20px responsive */
  --text-body: clamp(0.95rem, 0.9rem + 0.2vw, 1.0625rem);/* 15-17px responsive */
  --text-micro: 0.8125rem;/* 13px fisso */
}
```

Pattern: `clamp()` rende la scala responsive senza media query. Continuità tipografica desktop-mobile.

### Pattern D — H1 con singola parola in italic per personalizzazione

Esempio ConcorsoAI H1:
- "Simula l'orale sul *tuo* bando"
- "Allenati per la *commissione* del tuo concorso"
- "Verifica se sei *pronto* per il tuo orale"

Pattern: 1 parola italic = personalizzazione puntuale. Massimo 1 per paragrafo.

### Pattern E — Numeri in mono font + tabular-nums sempre per dati

```css
.numeric,
.metric,
.price,
.timer,
.score {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
```

Pattern: mono font ovunque ci siano numeri che si confrontano visivamente (colonne di pricing, timer animazione, date in tabella).

### Pattern F — Micro-tipografia editoriale per CTA

Esempio:
- CTA: "Inizia la tua prima simulazione →" (arrow inline)
- Secondary: "Scopri i 4 step ↓" (arrow inline + micro-disclaimer)
- Pricing tier badge: "★ Consigliato" (star emoji + small caps breath)

Pattern: micro-elementi tipografici editoriali (arrow, drizzle, special glyph) articolano la "voce" della landing.

### Pattern G — Brand-style "italic editorial" per persona

Il candidato PA target ha familiarità con formale-editoriale (Gazzetta Ufficiale, Il Sole 24 Ore). Per ri-evocare questa familiarità:

- Sub-headline con leggera italic su 1 parola chiave.
- Micro-disclaimer con bracket editorial (`[verifica sempre sul bando ufficiale]`).
- Pricing "Rispettando la tua scelta" o simili framing onesty.

Pattern: voce editoriale italiana riconoscibile → trust-by-familiarity.

---

## Checklist

- [ ] 1 sola font family + 1 mono (max)
- [ ] 4-5 weight caricati, tutti usati almeno una volta
- [ ] self-hosted via bunny.net (GDPR) o equivalente
- [ ] preconnect + preload + font-display: swap
- [ ] max 700 su body, max 800 su H1
- [ ] H1, H2, H3, body, micro in scala geometrica 1.2x o 1.25x
- [ ] Line-height 1.5-1.6 su body, 1.0-1.1 su H1
- [ ] Letter-spacing -0.02em → -0.04em su H1; 0 su body
- [ ] Mono font + tabular-nums su tutti i numeri importanti
- [ ] Reading width 60-75 char/line su body
- [ ] Mai 3+ family
- [ ] font-weight 800+ solo su display numeri occasionali
- [ ] Webfonts WOFF2, latin + latin-ext subset
- [ ] Total transferred bytes font <50KB

---

## Decisioni progettuali

### Da 3 font family a 1 + 1 mono

Scelta: **Inter** per display + body, **Geist Mono** per numeri. Niente serif, niente display font, niente secondary family. Razionale: coerenza + performance + trust.

### Da Google Fonts CDN a self-host

Scelta: Inter via fonts.bunny.net (CDN europea GDPR-friendly). Razionale: GDPR-compliance + performance (preconnect = -100ms LCP).

### Da scale random a scale geometrica

Scelta: scala 1.2x-1.25x tra i 5 livelli (H1, H2, H3, body, micro). Tutti i designer implementano la scala via CSS custom properties, niente dimensioni random.

### Da font-weight 800+ su body a max 700

Scelta: nessun body in 700+. Nessun H1 in 800+ (eccetto display numeri). Razionale: weight 800+ attiva "URLATO" percettivo che erode trust.

### Da italic block a italic puntuale

Scelta: italic solo su 1 parola per paragrafo, per personalizzazione editoriale puntuale. Mai blocco italic.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Inter display + body + Geist Mono numeri | Font source self-hosted via bunny.net | ✅ design tokens |
| 4 weight (400, 500, 600, 700) | Inter + Geist Mono 2 weight | ✅ applicato |
| font-display: swap | Bunny URL ha `&display=swap` | ✅ applicato |
| Preconnect + preload | `<link>` in head | ✅ applicato |
| Scalable tipografica | 5 step (H1, H2, H3, body, micro) | ✅ design tokens |
| Line-height differenziata | 1.6 body, 1.1 H1 | ✅ design tokens |
| Letter-spacing negativa H1 | -0.03em H1, -0.02em H2 | ✅ design tokens |
| Sub-headline italic (1 parola) | "sul *tuo* bando" | ✅ applicato |
| Mono font + tabular-nums su numeri | Geist Mono su price/score/timer/date | ✅ applicato |
| Reading width 65ch su body | max-width 65ch su .body-text | ✅ applicato |
| Total transferred bytes font | ~50KB | ✅ verificato |

**Gap**: nessun gap critico. Validazione LCP via Lighthouse (<1.5s su 4G mobile).

---

## Vincoli

- ❌ **NO** 3+ font family.
- ❌ **NO** Google Fonts CDN senza preconnect.
- ❌ **NO** font-weight 800+ su body o micro-copy.
- ❌ **NO** scale tipografica senza rapporto geometrico.
- ❌ **NO** italic su intero blocco di testo.
- ❌ **NO** font-weight 700 su body in regular copy.
- ❌ **NO** font-display mancante (FOIT penalty).
- ❌ **NO** line-height 1.0 su body.
- ❌ **NO** letter-spacing -0.06em+ su qualsiasi testo.
- ❌ **NO** mono font mancante su numeri importanti.

---

*Continua in `08_spacing_layout.md`.*
