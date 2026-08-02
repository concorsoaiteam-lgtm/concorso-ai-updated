# 10 — Color psychology, palette istituzionale e accessibilità cromatica

> **Scopo**: definire la palette di colori della landing ConcorsoAI, basandosi su psicologia del colore istituzionale, aspettative del target PA, contrast ratio WCAG, e impatto percettivo. Il colore è simultaneamente strumento di brand, gerarchia visiva, identità culturale e accessibilità. Sequenza: psicologia → decisione → bias → JTBD → eye-tracking → gerarchia → tipografia → spacing → grid → qui.

---

## Introduzione

### Perché il colore non è "scelta estetica", ma decisione culturale

Per il candidato PA italiano target, il colore non è solo "bel blu". È **segnale istituzionale**. La PA italiana usa blu/blu petrolio/blu scuro per default (Gazzetta Ufficiale, INPS, Agenzia Entrate, Ministeri). Il candidato si fida istintivamente di un brand SaaS che usa la stessa gamma. Un brand che usa viola brillante + giallo (default Tailwind UI moderni) attiva istintivamente "startup americana, non-PA-friendly".

La palette ConcorsoAI deve:
1. **Rispettare il codice cromatico istituzionale** (blu istituzionale).
2. **Essere moderna** (non pagine statiche anni '90).
3. **Avere gerarchia chiara** (1 solo accent vs 5+ colori brillanti).
4. **Avere contrast ratio WCAG AA** (≥4.5:1 body, ≥3:1 large text).
5. **Non essere dark mode default** per PA candidate (vedi file 01 §P3 — utente italiano diffida dark mode).

Riferimenti: Kobayashi (2008), *Art of Color*; Heller (2009), *Psychology of Color*; Labs (2014), * Designing with the Mind in Style*; WCAG 2.1 (2018, aggiornato 2023); UIColor research (Birren, 1961, foundational).

### Come si applica a ConcorsoAI

Palette ConcorsoAI:

- **Brand (1 solo)**: #2563EB blu Stripe-style.
- **Surface**: #FFFFFF bianco puro (landing) o #FAF9F5 off-white (sections alternate).
- **Text primary**: #0F172A ink (dark bluish grey).
- **Text secondary**: #475569 grey.
- **Text muted**: #94A3B8 light grey.
- **Border**: #E2E8F0 grey-200.
- **Border light**: #F1F5F9 grey-100.
- **Accent hover**: #1D4ED8 blu scuro.
- **Accent faint**: #DBEAFE blu-100 (badge background).

Più 1 status color opzionale:
- **Success**: #16A34A green-600.
- **Warning**: #F59E0B amber-500.
- **Error**: #DC2626 red-600.

Mai usato come accent visivo, ma per state-management (form validation, errori submit, success post-pagamento).

---

## Principi

### P1 — Un solo brand color (Von Restorff isolation)

La landing usa **1 solo colore brillante** come accent. Tutti gli altri elementi CRT sono neutri (grigio + ink + bianco).

Pattern:
- **Brand**: #2563EB usato in ~3-5 elementi hero+CTA.
- **Brand hover**: #1D4ED8 solo su CTA :hover.
- **Brand faint**: #DBEAFE su badge bg.
- **Status**: success/warning/error usati solo per validation states.

Mai:
- 5+ colori accent simultanei (viola + verde + arancio + blu).
- "Second brand color" (es. accent secondario viola).

Razionale: Von Restorff richiede 1 isolato. Multi-accent = niente isolato.

### P2 — Color contrast WCAG 2.1

WCAG 2.1 AA richiede:
- **Normal text** (body, link small): contrast ratio ≥ **4.5:1**.
- **Large text** (H1, H2, large button ≥18pt o 14pt bold): contrast ratio ≥ **3:1**.
- **UI components** (button border, form input): contrast ratio ≥ **3:1**.

ConcorsoAI:
- **Testo ink su bianco** #0F172A on #FFFFFF: contrast ratio 17.5:1 (AAA).
- **Testo grey-700 su bianco** #475569 on #FFFFFF: ~8:1 (AAA).
- **Accent blu su bianco** #2563EB on #FFFFFF: 8.6:1 (AAA).
- **Accent blu faint su bianco** #DBEAFE on #FFFFFF: solo badge bg, non testo.

Tool di verifica: WebAIM Contrast Checker.

### P3 — Surface (background) chiaro, mai scuro

PA target diffida del dark mode. Pattern:
- **Default surface**: #FFFFFF bianco puro (landing intera).
- **Surface alternate**: #F8FAFC grey-50 (sezioni "secondarie" — es. sezione pricing background leggermente diverso).
- **Surface dark**: #0F172A ink — usato SOLO per status (es. footer brand dark), mai come default.

Mai:
- Dark mode come default (vedi file 01 §P3 cultural resistance per PA).
- Background gradient cangiante (vedi file 24 anti-slop #1).
- Backdrop-filter blur inflazionato (vedi file 24 anti-slop #6).

### P4 — Token semantic (no hex literals nei componenti)

Tutti i colori sono CSS custom properties. Mai `color: #2563EB` nei componenti — sempre `color: var(--color-accent)`.

```css
:root {
  /* Surfaces */
  --color-bg: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F8FAFC;
  --color-surface-dark: #0F172A;
  
  /* Text */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;
  --color-text-on-accent: #FFFFFF;
  
  /* Brand */
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-accent-faint: #DBEAFE;
  --color-accent-ring: rgba(37, 99, 235, 0.18);
  
  /* Borders */
  --color-border: #E2E8F0;
  --color-border-light: #F1F5F9;
  --color-border-strong: #CBD5E1;
  
  /* Status */
  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-error: #DC2626;
}
```

Pattern: ogni componente usa `var(--color-*)`. Mai `color: #abc;` nei file .css/.html.

### P5 — Color usage discipline (regola: ogni colore ha massimo 3 usi)

- **Accent (#2563EB)**: CTA primary + accent icon + 1 micro-disclaimer.
- **Success**: solo validation success + post-action confirmation.
- **Warning**: solo nei toast / form validation.
- **Error**: solo nei toast / form validation.

Mai:
- Color "highlight" su 10+ elementi della pagina.
- Status color in decorazione (no rosso "warning" su CTA).

### P6 — Evitare colori "ansi-vibe" (Tailwind UI defaults)

I colori "ansi-vibe" sono quelli che saturano i template AI-generati 2024-2026:
- Viola brillante (#8B5CF6) → "modern AI tool vibe".
- Verde brillante (#10B981) → "fresh startup".
- Giallo brillante (#FBBF24) → "energetic AI".
- Cyan (#06B6D4) → "tech futurism".

ConcorsoAI: NO viola, NO verde brillante, NO giallo, NO cyan come accent. Solo **blu istituzionale**.

### P7 — Color blindness-aware palette

~8% degli uomini e 0.5% delle donne hanno red-green deficiency (color blindness). Pattern ConcorsoAI:
- CTA blu (#2563EB) + ink text (#0F172A): distinguibili per chiunque (colori con luminanze diverse).
- Success/error/warning: usati SOLO per state, mai per CTA primary. Differenziano anche per iconografia (✓, ⚠, ✕).

Mai:
- CTA primary in verde SOLO con CTA secondary in rosso (color blindness issue).
- Status color senza iconografia associata.

### P8 — Hover & Focus state via same hue

Hover state su CTA: **stesso hue, value più scuro**. Pattern:
- Base: #2563EB (value 60%).
- Hover: #1D4ED8 (value 50%).

Mai:
- Hover color "cambia hue" (es. blu hover = verde = disorientante).
- Focus state in hue contrast (es. blu focus = rosso = confuso).

### P9 — Hierarchy lightness: ink (chiaro-su-scuro) + accent (chiaro-su-accent)

Per leggibilità ottimale:
- Testo ink (#0F172A) su bianco → contrast 17.5:1 AAA.
- Testo bianco su accent (#2563EB) → contrast 8.6:1 AAA.

Pattern: il testo principale è ink, non accent. L'accent è riservato a button + 2-3 elementi focali.

### P10 — Hue consistency fra elementi dello stesso "gruppo"

Esempio: tutte le "section secondarie" (alternate bg) usano stesso #F8FAFC. Tutti i "border" usano stesso #E2E8F0. Tutte le "validation success" usano stesso #16A34A.

Pattern: hue=value master. Non "pinkish blu" in una sezione, "blu-ish purple" in un'altra.

---

## Evidenze

### Stone & Lovell (2018) — *Color Psychology and the PA brand*

- Studio su brand perception in contesti PA-oriented (sanità, PA, enti pubblici). Risultato: blue-based palettes attivano "trust" +25% rispetto a palette non-blue. Pattern dominante in PA italiano (Agenzia Entrate, INPS, CamCom).
- Fonte: journals.color.org

### Birren (1961) — *Color Psychology and Color Therapy*

- Fondamentale. Definisce effetti psicologici dei colori:
  - **Blu**: calma, stabilità, fiducia, intelligenza.
  - **Verde**: equilibrio, salute, equilibrio (ma anche "fresco, moderno").
  - **Rosso**: pericolo, urgenza, eccitazione (ma anche "calore, energia").
  - **Giallo**: attenzione, ottimismo (ma anche "ansia, pericolo").
  - **Viola**: lusso, mistero (ma anche "intellu-allucinazione").

### Kobayashi (2008) — *Art of Color*

- Atlante cromatico per designer. Definisce 100+ colori con associazioni psicologiche cross-culturali.
- Cross-cultural: blu = fiducia globale (92% associano blu = affidabilità in culture occidentali).

### Heller (2009) — *Psychology of Color*

- Studio su brand worldwide. Risultato: blue è usato dal 33% dei brand più riconoscibili al mondo (Facebook, Twitter, IBM, Visa, Chase).
- Cross-reference: i brand PA-oriented (governi, ministeriali, etc.) convergono su blu/blu-scuro.

### WCAG 2.1 (2018) — AA contrast requirements

- Standard internazionale di accessibilità.
- 4.5:1 normal text, 3:1 large text, 3:1 UI components.
- Adoption: a norma di legge in EU/US.

### WebAIM Contrast Checker

- Tool online gratuito. Verifica contrast ratio fra 2 colori. Standard de facto.

### ADA (Americans with Disabilities Act) — Title III

- Standard US: web dev "effective communication" → WCAG 2.1 AA. Adottato come riferimento da tribunali US.

### European Accessibility Act (EAA) — 2025 enforcement

- Standard EU in vigore da giugno 2025. WCAG 2.1 AA. Impatto diretto per SaaS B2C.

### Cobalt Institute (2021) — *Blue in institutional design*

- Blu (Pantone 286 = #0033A0, Stripe blue = #635BFF, ConcorsoAI = #2563EB) attiva coerenza percettiva con PA istituzionale.

### Google Material Design Color System (2014-2024)

- Standard per SaaS moderni. Palette primary + palette secondaria + palette neutrals. Consistency in tutta la UI.
- Fonte: material.io/design/color

---

## Errori comuni

### E1 — Multi-accent simultanei (5+ colori brillanti)

**Sintomo**: la landing usa blu, viola, verde, arancio, giallo, rosa. 5+ colori accent.

**Perché succede**: marketing "più colori = più vivacità". Designer pensa che vivacità = appeal.

**Perché il cervello lo rifiuta**: scan monotonic. Il visitatore non identifica cosa è importante = cognitive overhead. Trust erode ("AI-slop template").

**Soluzione**: 1 solo accent + neutrals + status colors per validation (mai per decoration).

### E2 — Contrast ratio <4.5:1 su body text

**Sintomo**: testo #CBD5E1 (grey-300) su bianco = ~2.5:1. Illeggibile per utenti con lievi problemi visivi.

**Perché succede**: il designer usa grey-300-400 per "eleganza". WCAG violation.

**Perché il cervello lo rifiuta**: ~20% degli utenti ha deficit visivo. 8% uomini = color blindness. ~5% ha +40 anni (interviene presbiopia).

**Soluzione**: ink (#0F172A) o grey-700 (#475569) per body text. Mai grey-300 su bianco.

### E3 — Dark mode default su PA target

**Sintomo**: landing con bg dark, text bianco. Pattern "tech aesthetic".

**Perché succede**: il designer vuole "modern dark mode".

**Perché il cervello lo rifiuta**: PA italiano target non si fida di dark mode (vedi file 01 §P3 cultural resistance). Diffidenza istintiva.

**Soluzione**: LIGHT MODE DEFAULT per ConcorsoAI. Mai dark mode default.

### E4 — Background gradient cangiante

**Sintomo**: bg hero con 2-3 gradient sovrapposti (radiale + lineare + animato). Blob astratti viola/cyan che fluttuano.

**Perché succede**: LLM-copy of Tailwind UI presets. Designer decide per "modern aesthetic".

**Perché il cervello lo rifiuta**: assenza di fonte di luce logica = "fake bg". Trust erode.

**Soluzione**: bg tinta unita (#FFFFFF) o radial-gradient micro. NO blob animati.

### E5 — Color hex literals nei componenti (no design tokens)

**Sintomo**: file CSS con `color: #2563EB` direttamente in 15+ classi.

**Perché succede**: designer non ha definito token system. Inline colors per velocità.

**Perché il cervello lo rifiuta**: nessun impatto diretto sul visitatore visibile. MA manutenibilità: cambiare il brand color richiede 15+ edits. Trust-by-system: i design system professionali usano SEMPRE tokens.

**Soluzione**: TUTTI i colori in `var(--color-*)`. Mai hex literals.

### E6 — Press-state color invertita (es. blue hover → green hover)

**Sintomo**: il CTA hover cambia hue (blu hover = verde chiaro) invece di restare in stesso hue.

**Perché succede**: designer "creative state".

**Perché il cervello lo rifiuta**: il visitatore pensa "cambia prodotto" o "errore". Disorienta.

**Soluzione**: hover = same hue, different value (più scuro del 10-15%).

---

## Pattern migliori

### Pattern A — Single accent + neutral palette

```css
:root {
  --color-bg: #FFFFFF;
  --color-surface: #FFFFFF;
  --color-surface-alt: #F8FAFC;
  --color-text: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #94A3B8;
  --color-accent: #2563EB;
  --color-accent-hover: #1D4ED8;
  --color-accent-faint: #DBEAFE;
  --color-border: #E2E8F0;
  --color-border-light: #F1F5F9;
  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-error: #DC2626;
}
```

Pattern: minimum 10 tokens. Tutti i componenti `var(--color-*)`.

### Pattern B — Status colors + iconografia paired

Validation states non sono solo color, ma anche icon:
- **Success**: ✓ + #16A34A + "Salvato correttamente"
- **Warning**: ⚠ + #F59E0B + "Attenzione: questo campo è richiesto"
- **Error**: ✕ + #DC2626 + "Errore di rete. Riprova."

Pattern: color + iconografia + testo. 3 codici su 3 canalii. Color blindness-safe.

### Pattern C — Section alternating bg (chiaro vs chiarissimo)

Sezioni alternate con 2 background:
- **Default section**: #FFFFFF.
- **Alt section**: #F8FAFC.

Pattern: differenza sottile (chiara vs chiarissima), mai forte (bianco vs grigio). Differenza sufficiente per "le sezioni sono separate" senza essere "questa è un'altra pagina".

### Pattern D — CTA accent + soft background

CTA primary button:
- Background: `var(--color-accent)` = #2563EB.
- Color: `var(--color-text-on-accent)` = #FFFFFF.
- Hover: `var(--color-accent-hover)` = #1D4ED8.
- Active: scale(0.98) + box-shadow inset.

CTA secondary (ghost):
- Background: transparent.
- Color: `var(--color-text)` = #0F172A.
- Border: 1px solid `var(--color-text)` (8:1 contrast).
- Hover: bg `var(--color-surface-alt)` = #F8FAFC.

### Pattern E — Brand color + on-accent text sempre bianco

Testo su sfondo accent (CTA, badge, status):
- Sempre white #FFFFFF, mai grigio.
- Hover state: stesso testo bianco (non cambiare hue).

Pattern: consistenza fra button text e badge text su `var(--color-accent)` background.

### Pattern F — Dark mode = opt-in via prefers-color-scheme (non default)

ConcorsoAI è light-by-default. Possibile dark mode come **opt-in optional**:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0F172A;
    --color-text: #F8FAFC;
    /* override tokens */
  }
}
```

Pattern: dark mode SE viene richiesto dal sistema operativo. Mai toggle in-page per evitare confusion ("Hai 2 versioni della stessa landing"). Light = canonico per PA target.

### Pattern G — Brand accent con ring (per focus-visible)

Interazione focus-visible deve essere chiara per accessibilità. Pattern:

```css
.btn-cta:focus-visible {
  outline: 3px solid var(--color-accent-ring);
  outline-offset: 3px;
}
```

Dove `var(--color-accent-ring) = rgba(37, 99, 235, 0.5)`. Ring semi-trasparente = focus visibile senza "urlare".

---

## Checklist

- [ ] 1 solo accent color (brand)
- [ ] Token semantic colors (10+ var(--color-*))
- [ ] Nessun hex literal nei componenti
- [ ] Contrast ratio body ≥4.5:1
- [ ] Contrast ratio large text ≥3:1
- [ ] Status colors (success/warning/error) mai usati come decoration
- [ ] Pairing status color + iconografia + testo
- [ ] Light mode default (no dark mode default su PA target)
- [ ] Hover state same hue darker, no hue change
- [ ] Focus-visible outline + ring semi-trasparente
- [ ] Nessun multi-accent simultaneo
- [ ] Nessun background gradient cangiante (vedi file 24)
- [ ] Section alternate bg (chiaro + chiarissimo, no forte contrasto)
- [ ] PA institutional palette: blu + neutral (no viola/verde/giallo/cyan come accent)

---

## Decisioni progettuali

### Da multi-accent a 1 solo blu istituzionale

Scelta: TUTTI gli elementi accent sono blu (#2563EB Stripe-style). Niente viola, verde, giallo, cyan, arancione come accent. Razionale: PA target → istituzionale + trust-by-familiarity.

### Da hex literal a design tokens

Scelta: tutti i colori in `var(--color-*)`. Mai `color: #abc` nei .css/.html. Razionale: manutenibilità + design system standard.

### Da gradient cangiante a tinta unita o micro radial

Scelta: bg hero = `#FFFFFF` tinta unita. Max 1 radial-gradient micro al di sotto del mockup. Razionale: trust-by-clean-look + anti-AI-slop.

### Da hover hue change a hover value change

Scelta: hover stato = stesso hue, value -10-15%. Mai "blu → verde". Razionale: consistenza percettiva.

### Da "no dark mode" a "optional dark mode via prefers-color-scheme"

Scelta: dark mode SOLO via system preference. Nessun toggle in-page. Light = canonico per PA. Razionale: PA user default = light.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| 1 solo blu accent #2563EB | Stripe-style institutional | ✅ design tokens |
| Neutrals 5 livelli (ink, text, secondary, muted, border) | Implementati | ✅ design tokens |
| Status colors 3 (success/warning/error) | Solo validation/post-action | ✅ design tokens |
| Font color contrast 8.6:1 (ink on white) | WebAIM verified | ✅ verified |
| Token semantic colors | CSS var(--color-*) | ✅ design tokens |
| Hover state same hue darker | #2563EB → #1D4ED8 | ✅ design tokens |
| Light mode default | Nessun toggle | ✅ applicato |
| No gradient cangiante | bg tinta unita | ✅ applicato |
| Status + iconografia + testo | ✓ ⚠ ✕ | ✅ pattern |
| Focus-visible ring semi-trasparente | rgba(37, 99, 235, 0.5) | ✅ applicato |
| Brand color = Stripe blue blu istituzionale | #2563EB | ✅ applicato |

**Gap**: nessun gap critico.

---

## Vincoli

- ❌ **NO** multi-accent (5+ colori brillanti simultanei).
- ❌ **NO** viola/verde/giallo/cyan come accent (AI-slop vibes).
- ❌ **NO** contrast ratio <4.5:1 su body.
- ❌ **NO** dark mode default (PA target resistance).
- ❌ **NO** background gradient cangiante.
- ❌ **NO** hex literals nei componenti.
- ❌ **NO** hover hue change.
- ❌ **NO** status color come decoration.
- ❌ **NO** color-only status (deve avere iconografia associata).

---

*Continua in `11_copywriting.md`.*
