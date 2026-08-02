# 06 — Visual hierarchy e gestione dell'attenzione

> **Scopo**: definire come la landing ConcorsoAI comunica importanza attraverso gerarchia tipografica, cromatica, posizionale, dimensionale. L'eye-tracking (file 05) descrive dove guarda l'occhio. La gerarchia descrive come **l'importanza** viene codificata visivamente. Sequenza: psicologia → decisione → bias → JTBD → eye-tracking → qui.

---

## Introduzione

### Perché la gerarchia è un linguaggio, non una decorazione

La gerarchia visiva è il sistema di codifica che permette al visitatore di identificare **a colpo d'occhio** cosa conta di più in una pagina. Senza gerarchia, tutti gli elementi sono "ugualmente importanti" → l'occhio non sa dove andare → cognitive load → abbandono.

Il designer usa 7 leve di gerarchia:

1. **Dimensione** (gerarchia tipografica).
2. **Colore** (saturazione + contrasto).
3. **Posizione** (Von Restorff, primo piano/fondo).
4. **Peso** (font-weight 400 vs 700).
5. **Spazio** (densità, breathing room).
6. **Pattern** (regole Gestalt).
7. **Movimento** (animazione, scroll).

Ogni leva ha un effetto specifico. Combinate in modo coerente generano "impressione coerente" (file 01 §P1). Combinate in modo incoerente generano "informational chaos".

Riferimenti: Colin Ware, *Information Visualization* (2012, ed. 4); Stephen Few, *Information Dashboard Design* (2006, ed. 2 aggiornata 2013); Edward Tufte, *The Visual Display of Quantitative Information* (1983, ed. 2 2001); UX Collective articles; NN/g hierarchy studies (2018-2024).

### Come si applica a ConcorsoAI

La landing ConcorsoAI ha 7 sezioni + mockup interattivo + pricing + FAQ. Il visitatore deve poter dire in 5 secondi:
- "Questo è un simulatore orale per concorsi pubblici" (H1 + visual).
- "Posso provarlo gratis" (CTA + 3 simulazioni).
- "Il mio bando reale è supportato" (mockup con materie PA reali).
- "I miei dati sono al sicuro" (trust band).

Ognuna di queste 4 percezioni richiede 1 gerarchia specifica. Se sono tutte allo stesso livello, il visitatore non percepisce priorità → confuso.

---

## Principi

### P1 — Dimensione = gerarchia primaria (tipografia chiara)

Il designer deve definire 5 livelli massimi di dimensione:
- **H1**: 32-48px desktop, 24-32px mobile. Font-weight 700+.
- **H2**: 24-32px desktop, 20-24px mobile. Font-weight 600-700.
- **H3**: 18-20px desktop, 16-18px mobile. Font-weight 500-600.
- **Body**: 16-17px desktop, 16px mobile (minimo iOS no-zoom). Font-weight 400.
- **Caption / micro**: 12-14px. Font-weight 400-500.

Mai H1 a 64px, H2 a 36px, H3 a 24px, body a 16px, micro a 12px in proporzione casuale. **Scala geometrica**: raddoppia o 1.5x tra i livelli.

Per ConcorsoAI: H1 40px → H2 28px (rapporto 1.43) → H3 20px (rapporto 1.4) → body 16px (rapporto 1.25) → micro 12px (rapporto 1.33). Scala basata su 4-step geometrico.

### P2 — Colore = gerarchia secondaria (Von Restorff cromatico)

Un solo colore brillante (CTA blu). Tutto il resto è neutro (grey + ink). Gli elementi che NON devono attirare attenzione sono in muted gray.

3 livelli cromatici:
- **Active**: colore brand (#2563EB blu), usato solo dalla CTA primaria + 1-2 elementi focali.
- **Standard**: text-color (#0F172A ink), usato dalla maggior parte del copy.
- **Muted**: grey (#475569), usato da label, micro-disclaimers, footer credits.

Mai la CTA secondaria usa blu. Solo la CTA primaria. La secondaria usa ghost button (transparent + border).

### P3 — Posizione = gerarchia spaziale (Von Restorff spaziale)

L'occhio legge sx→dx, top→bottom. Elementi in top-left hanno prominence massima. Elementi in bottom-right hanno prominence minima.

Conseguenze:
- Logo top-left (high prominence).
- H1 mid-left o subito dopo top-left.
- CTA sub H1, left-aligned.
- FAQ + footer in bottom.
- Mai elemento UX importante in mid-page senza left-alignment.

### P4 — Peso tipografico = gerarchia di accentuazione

Font-weight è la leva più economica per enfatizzare senza ingrandire. Convenzioni:

- **400 (regular)**: body, label, micro-copy.
- **500 (medium)**: body emphasis, link, button.
- **600 (semibold)**: H3, CTA secondary, label badge.
- **700 (bold)**: H2, CTA primary.
- **800 (extrabold)**: H1, large numbers, hero metrics.

Mai usare 800+ su body (affaticamento percettivo). Mai body in 600+ (il contrasto grassetto/corsivo vs regular non è leggibile sotto la fold).

### P5 — Spazio negativo = gerarchia di importanza

Lo spazio vuoto comunica "questo è importante". Densità eccessiva comunica "è tutto ugualmente importante, niente da evidenziare".

Per ConcorsoAI:
- Hero padding: 96px desktop, 64px mobile (respiro).
- Sezione padding: 96-128px desktop, 64-96px mobile (respiro tra sezioni).
- Card padding: 24-32px (respiro interno unità informative).
- CTA button padding: 16-20px verticale + 24-32px orizzontale (artifacts of "spazio intorno al click").

### P6 — Gestalt principles (Wertheimer 1923)

3 leggi Gestalt applicate alla landing:

- **Proximity**: elementi vicini = percepiti come gruppo logico.
- **Similarity**: elementi simili (forma/colore) = percepiti come gruppo.
- **Closure**: elementi che suggeriscono una forma chiusa = percepiti come unità.

Per ConcorsoAI:
- Prossimità: 3-4 sotto-elementi di 1 trust signal raggruppati, separati da 8-16px tra loro e 96px dal prossimo trust group.
- Similarità: le 3 tier card pricing hanno stessa struttura (H3, price, list, CTA bottom). La centrale è la "consigliata" ma rimane "simile" alle altre (stesso layout).
- Closure: il mockup 3-tab è "chiuso" visivamente (chrome border + inner grid), separato dal copy della hero.

### P7 — Movimento = gerarchia dinamica (interaction)

L'animazione può creare gerarchia visiva aggiuntiva. Pattern:

- **Hover micro-feedback**: background color shift 200ms + box-shadow inset (response alla SAP).
- **Scroll-driven entrance**: fade + 8px slide-up 400ms (cattura attention in entrata sezione).
- **Click feedback**: Transform scale 0.98 + color shift 100ms (risposta immediata).
- **Tab switch**: slide-in/out orizzontale 300ms (segnala "switch" senza spaesare).

**Mai animazioni decorative**: bounce, wiggle, infinite loop (vedi file 24).

### P8 — Density-as-credibility (per audience tecnico)

Per developer tool / SaaS B2B tecnico, densità informazionale = credibilità. Pattern Linear/Stripe/Vercel: stessa sezione contiene 6+ elementi (loghi, codice, metriche, UI) senza spazi vistosi. Il visitatore B2B tecnico percepisce "questa è una società seria che lavora sodo, non un template ridotto".

Ma: ConcorsoAI NON è B2B tecnico. È B2C PA-oriented. Audience diversa → density va ridotta, non aumentata. Pattern editoriale italiano (Il Sole 24 Ore, Corriere, Gazzetta Ufficiale): più respiro, meno elementi simultanei.

---

## Evidenze

### Tufte (1983, 2001) — *The Visual Display of Quantitative Information*

- Fondamentale di data visualization. Principio: "data-ink ratio" = quantità di inchiostro dedicata a informazione reale vs decorazione. Più alto = più efficace.
- Per landing: ogni pixel deve servire un'informazione reale. Mai "spazio decorativo senza scopo".

### Few (2006, 2013) — *Information Dashboard Design*

- 13 principi di visual design per dashboard. Applicati direttamente a landing: priorità visiva chiara, label chiare, no 3D inutile, niente colori che gridano.
- Source: perceptualedge.com

### Ware (2012, 2021) — *Information Visualization*

- Companion accademico. Definisce 4 livelli di elaborazione visiva: parallela (immediata), search (specifica), seriale (sequenza), memoria (recall). La landing opera su parallelo + search.
- Source: morgan-kaufmann.com

### NN/g Hierarchy Studies (2018-2024)

- Eye-tracking conferma: dimensione + posizione + colore sono le 3 leve percepite come "importanza" in <500ms. Veri gerarchici sono weight + spacing + small caps + iconografia.
- Source: nngroup.com/topic/visual-hierarchy/

### MIT Media Lab HCI e Google Material Design

- Material Design system (Google) ha standardizzato gerarchia visiva in Elevation, Color, Typography. Guideline: 13 livelli tipografici + 8 livelli di elevation (shadow + spacing). Adottati da designer in tutto il mondo.
- Source: material.io/design/communication

### Baymard (2024) — Visual Hierarchy on E-commerce

- Studio N>1000. Risultato chiave: gerarchia visiva confusa = 12% drop conversion su product page, 14% drop su checkout. CTA in posizione non-hierarchic = 8% drop mobile.
- Source: baymard.com

---

## Errori comuni

### E1 — H1 in 5 livelli di dimensione senza proporzione

**Sintomo**: H1 60px, H2 36px, H3 28px, body 18px, micro 14px. Tutti random, senza rapporto geometrico.

**Perché succede**: il designer imposta ogni dimensione "a occhio", non in scala.

**Perché il cervello lo rifiuta**: scala senza rapporto geometrico = "non sembra un sistema, ma un assemblaggio". L'occhio cerca pattern e non ne trova → diffidenza template.

**Soluzione**: scala basata su 1.2x o 1.25x o 1.33x (3 geometrie standard). Definire 5 step max.

### E2 — 3+ colori "accedi" simultanei

**Sintomo**: la landing usa 3-5 colori brillanti (blu, verde, arancione, viola) tutti come accent. Nessun isolato.

**Perché succede**: "coerenza cromatica" intesa come "uso tutti i colori della palette". Errore classico.

**Perché il cervello lo rifiuta**: Von Restorff richiede un solo isolato. Se 5 elementi sono brillanti, l'isolato scompare.

**Soluzione**: 1 solo accent color (per CTA). Tutto il resto in neutri (grigio + ink).

### E3 — Spacing monotono (24px su tutto)

**Sintomo**: la landing ha 24px di padding su tutti gli elementi, 24px di gap tra sezioni. Pattern monotono.

**Perché succede**: Tailwind utility classes inflazionate. Designer esperto mette 24px senza pensarci.

**Perché il cervello lo rifiuta**: monotonia spaziale = "nessuna importanza differenziata". Tutto piatto.

**Soluzione**: scala gerarchica 8/16/24/40/64/96/144px. Ogni livello di importanza ha il suo spacing.

### E4 — Elementi centrati con accumulazione mid-page

**Sintomo**: hero centrata, poi CTA centrata, poi H2 centrato, poi tier centrati, poi FAQ centrata. Tutto mid-page, tutto buttato sul centro del viewport.

**Perché succede**: design tradizionale "stampato", evoluzione diretta di template.

**Perché il cervello lo rifiuta**: F-pattern richiede elementi allineati a sx. Centrato = pattern perso.

**Soluzione**: sx-align come default. Centrato riservato a lista simmetrica di 3 elementi. Mai hero centrata.

### E5 — Mai mono font per numeri importanti

**Sintomo**: prezzi, date, punteggi sono in font generico (es. Inter), in formato proportional. Numeri irregolari (5 stretto, 8 largo), danno look disallineato.

**Perché succede**: il designer non sa che mono font + tabular-nums è specifico per dati numerici.

**Perché il cervello lo rifiuta**: tabular-nums vs proportional non è solo estetico: la lettura visiva di "47,32€" è più precisa se le cifre sono monospace.

**Soluzione**: prezzi/punteggi in mono font + tabular-nums. Esempio: `font-family: 'Geist Mono'; font-variant-numeric: tabular-nums`.

---

## Pattern migliori

### Pattern A — 5 step tipografici geometrici

Definizione dei 5 livelli con scala 1.25x:
- **H1**: 40px desktop, 28px mobile. Font-weight 700. Line-height 1.1. Letter-spacing -0.03em.
- **H2**: 28px desktop, 22px mobile. Font-weight 700. Line-height 1.2. Letter-spacing -0.02em.
- **H3**: 20px desktop, 18px mobile. Font-weight 600. Line-height 1.3.
- **Body**: 16px desktop, 16px mobile. Font-weight 400. Line-height 1.6.
- **Caption / micro**: 12-13px desktop. Font-weight 500. Line-height 1.4.

Implementazione: design tokens in CSS custom properties, usate everywhere.

### Pattern B — Single-accent Von Restorff

1 solo colore brillante (#2563EB). Tutti gli altri elementi in:
- **Neutral-900** (#0F172A ink, testo primario).
- **Neutral-700** (#334155, testo body).
- **Neutral-500** (#64748B, testo muted, caption).
- **Neutral-300** (#CBD5E1, border).
- **Neutral-100** (#F1F5F9, background button).
- **Neutral-50** (#F8FAFC, surface background).

Più 3 stati del blu:
- **Accent base**: #2563EB (CTA).
- **Accent hover**: #1D4ED8 (CTA hover).
- **Accent faint**: #DBEAFE (backgrounds, badge bg).

### Pattern C — Spacing scale 4/8 passo geometrico

Tutti i padding/margin/gap da una scala di 8 step:

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
```

Ogni sezione dichiara: `padding: var(--space-24) 0` (96px sopra/sotto). Mai `padding: 24px` generico.

### Pattern D — Gestaltung delle sezioni

Ogni sezione della landing ha:
- **Top**: padding-top = 96-128px desktop.
- **Bottom**: padding-bottom = 96-128px desktop.
- **Container**: max-width 1280px, padding-inline 24-48px.
- **H2**: a colonna sx, max-width 720px (leggibilità).
- **Sotto-elementi**: 3-col grid o tabella o lista, gap 24-32px.

Pattern: ogni sezione "respira" indipendentemente. Nessuna sezione compressa.

### Pattern E — Color tokens semantici

CSS custom property semantic (non letterali):
- `--color-bg`: bianco o off-white.
- `--color-surface`: card background.
- `--color-surface-elevated`: card hover state.
- `--color-text-primary`: ink.
- `--color-text-secondary`: grey.
- `--color-text-muted`: light grey.
- `--color-accent`: CTA.
- `--color-accent-hover`: CTA hover.
- `--color-accent-faint`: badge bg.
- `--color-border`: neutral-300.
- `--color-border-light`: neutral-200.

Mai codice colore esadecimale nei componenti. Sempre `var(--color-*)`.

---

## Checklist

- [ ] 5 step tipografici geometrici (H1, H2, H3, body, micro)
- [ ] Scala spacing basata su 4/8 (max 12 step)
- [ ] Un solo colore brillante (accent) — tutto il resto neutri
- [ ] Hero allineata a sx (non centrata)
- [ ] CTA primaria con isolazione cromatica + posizione
- [ ] Ogni sezione ha padding respiro (96-128px desktop, 64-96px mobile)
- [ ] Mono font + tabular-nums su tutti i numeri importanti
- [ ] Font-weight non superiore a 700 su body, non superiore a 800 su H1
- [ ] Nessun "tutti gli elementi sono ugualmente importanti"
- [ ] Token semantic CSS (var(--color-*)) per ogni colore
- [ ] Container max-width 1200-1280px desktop
- [ ] Tabella/lista/3-col grid per sezioni comparative (non centro singolo)

---

## Decisioni progettuali

### Da 10 dimensioni tipografiche a 5 step max

Scelta: limitare la tipografia a 5 livelli. Tutto il resto è variante di questi 5. Niente 6 livelli.

### Da accent multi-color a 1 solo accent blu

Scelta: 1 solo colore brillante (#2563EB blu istituzionale Stripe-style). Tutto il resto in neutri. Nessun verde, viola, rosso, giallo come accent.

### Da spacing 24px monotono a scala geometrica

Scelta: spacing scale 4/8 passo geometrico. 12 step al massimo. Mai "padding: 24px" generico.

### Da hero centered a sx-aligned Z-pattern

Scelta: H1 + sub allineati a sx. Mockup a destra in 60/40 split. CTA sotto sub.

### Da mono font mancante a mono font su numeri

Scelta: tutti i numeri importanti (prezzi, date, punteggi, timer) in mono font + tabular-nums.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| 5 step tipografici | Inter 700 40px H1; 28px H2; 20px H3; 16px body; 13px micro | ✅ design tokens |
| Spacing scale 4/8 | CSS custom properties --space-* | ✅ design tokens |
| 1 solo accent blu | #2563EB solo CTA, neutro su tutto il resto | ✅ design tokens |
| Hero sx-aligned | Z-pattern 60/40 | ✅ applicato |
| CTA isolata | Solo CTA hero è accent | ✅ applicato |
| Mono font su numeri | Geist Mono per prezzi, punteggi, timer | ✅ applicato |
| Token semantic CSS | var(--color-*) e var(--space-*) | ✅ applicato |

**Gap**: nessun gap critico. Validazione finale con A/B test su variazioni dimensioni H1.

---

## Vincoli

- ❌ **NO** scala tipografica senza rapporto geometrico (random dimensioni).
- ❌ **NO** multi-color accent (5+ colori brillanti simultanei).
- ❌ **NO** spacing monotono (24px ovunque).
- ❌ **NO** hero centrata.
- ❌ **NO** mono font mancante su numeri.
- ❌ **NO** uso di colore hex nei componenti (solo via token).
- ❌ **NO** font-weight 800+ su body (illegibile).
- ❌ **NO** letter-spacing negativo eccessivo (-0.06em+) su body.

---

*Continua in `07_tipografia.md`.*
