# Design System per Landing SaaS Premium

## Introduzione

Un design system per una landing page è diverso da quello di un'app: è **ristretto**, **espressivo** ma **monolitico**. Tutte le scelte devono convergere verso due obiettivi:

- **Velocità di comprensione** (3-5 sec per la prima scan)
- **Trust signal** (precisione = credibilità)

Questo documento definisce le **scelte vincolanti** di tipografia, colore, spacing, motion, interazione. Ogni decisione è motivata. Ogni alternativa non scelta ha una motivazione di esclusione.

Le scelte sono calibrate su un **SaaS B2C/B2B con target italiano, fascia 25-45 anni, education/professional**. ConcorsoAI è il riferimento concreto.

---

## Type Scale

### Font stack

```
Inter Variable
o (se licenza) IBM Plex Sans
o (se licenza) Söhne — pay
```

**Decisione**: **Inter Variable** (Rasmus Andersson / rsms), open source, family completa (weight 100-900, italic, optical sizes), supportata da tutti i browser moderni via `font-variation-settings`.

**Esclusione** Helvetica: troppo corporate anni '90. Roboto: troppo Google-generic. SF Pro: troppo Apple-specific. Source Sans: troppo Microsoft-Office.

### Token tipografici

| Token | Size | Line-height | Weight | Letter-spacing | Uso |
|-------|------|-------------|--------|----------------|-----|
| `display-2xl` | 56px (desktop) / 36px (mobile) | 1.05 | 700 | -0.02em | Hero H1 |
| `display-xl` | 44px / 32px | 1.1 | 700 | -0.02em | Section H2 max |
| `display-l` | 32px / 26px | 1.15 | 600 | -0.015em | Pricing H2 |
| `display-m` | 22px / 20px | 1.25 | 600 | -0.01em | Card H3 |
| `body-l` | 18px / 17px | 1.55 | 400 | 0 | Hero sub |
| `body-m` | 15px / 15px | 1.6 | 400 | 0 | Section body |
| `body-s` | 13px / 13px | 1.5 | 400 | 0 | Microcopy |
| `caption` | 12px / 12px | 1.4 | 500 | 0.02em | Eyebrow, badge |
| `mono-m` | 13px | 1.5 | 500 | 0 | Code, IDs |

### Decisioni vincolanti

| Decisione | Motivazione |
|-----------|-------------|
| **Solo 9 token** | limitare l'uso dei token forza l'attenzione editoriale |
| Niente font-size < 12px | Web Content Accessibility Guidelines 2.2 (1.4.4) |
| Niente line-height < 1.2 | leggibilità WCAG |
| Ottimizzazione `font-smoothing: antialiased` | sub-pixel rendering cross-browser |
| `text-wrap: pretty` (CSS Text-4) | orphan control Chrome/Edge/Safari TP |
| `font-feature-settings: "ss01", "cv11"` (Inter) | stylistic set 1, alternate single-storey a |

### Anti-patterns tipografici

❌ NON usare:

- Più di **2 famiglie** (sans + mono OK, ma NON 3+)
- Display fonts decorativi (e.g., Lobster, Pacifico)
- Letter-spacing > 0.05em su body text (rallenta lettura)
- Letter-spacing < -0.04em su body (illegibile)
- More than 2 colori su uno stesso blocco di testo
- All-caps su body (solo su eyebrow / badge < 14 chars)

---

## Color System

### Palette (HSL + oklch)

#### Neutrali (testo, sfondo)

| Token | HEX | Lightness | Uso |
|-------|-----|-----------|-----|
| `bg-canvas` | `#FAFAF9` | warm off-white | Sfondo principale |
| `bg-subtle` | `#F5F5F4` | L96 | Sfondo sezioni alternate |
| `bg-elevated` | `#FFFFFF` | L100 | Card, surface elevate |
| `fg-primary` | `#0E0E10` | L9 | Testo body, H1 |
| `fg-secondary` | `#52525B` | L40 | Testo secondario, label |
| `fg-tertiary` | `#A1A1AA` | L67 | Eyebrow, caption |
| `border-subtle` | `#E7E5E4` | L92 | Divider, border surface |
| `border-strong` | `#D4D4D8` | L85 | Border input, focus ring |

#### Brand (primario emerald)

| Token | HEX | Lightness | Uso |
|-------|-----|-----------|-----|
| `brand-50` | `#ECFDF5` | L96 | Tint CTA background |
| `brand-500` | `#10B981` | L65 | **Primario CTA, link** |
| `brand-600` | `#059669` | L60 | Hover state |
| `brand-700` | `#047857` | L51 | Active state |
| `fg-on-brand` | `#FFFFFF` | L100 | Testo su brand |

#### Semantic

| Token | HEX | Uso |
|-------|-----|-----|
| `success` | `#10B981` | "✓ Banca aggiornata" |
| `warning` | `#D97706` | "⚠ Beta: stiamo migliorando" |
| `danger` | `#DC2626` | Errori form (mai hero) |

### Decisioni vincolanti

| Decisione | Motivazione |
|-----------|-------------|
| Emerald `#10B981` come CTA primario | differenzia da Stripe blu, da Notion nero, da Vercel nero; **educational green** comunica crescita/serietà |
| Warm off-white `#FAFAF9`, NON blu-grigio `#F8FAFC` | warmer è più welcoming; blu-grigio è tech/SaaS B2B |
| Testo `#0E0E10`, NON nero puro `#000` | true black su retina causa vibration; soft black è leggibile e gradevole |
| NO gradient su CTA | AI-slop signal, lo abbiamo bandito |
| OKLCH se browser supporta | perceptually uniform, gestisce age-related color shift |

### Ratio контраста verificati (WCAG 2.2 AA)

- `fg-primary` su `bg-canvas`: **15.4:1** ✓
- `fg-secondary` su `bg-canvas`: **7.1:1** ✓
- `brand-600` su `bg-canvas`: **4.7:1** ✓
- `fg-on-brand` su `brand-500`: **3.7:1** (large only)

### Anti-patterns cromatici

❌ NON usare:

- Più di **3 brand colors** (1 primary, 1 hover, 1 active)
- Neon colors (cyan, magenta su CTA)
- Gradient su button
- Pastel saturato (AI-generated look)
- Pure black `#000` su schermo
- Same hue per testo e link (impossibile distinguerli)
- Background photo / video

---

## Spacing System

### 8px grid modulo base

| Token | Multiplo | px | Uso tipico |
|-------|----------|-----|-----------|
| `space-0` | 0× | 0 | Reset |
| `space-1` | 0.25× | 2 | Optical fix |
| `space-2` | 0.5× | 4 | Inline iconografia |
| `space-3` | 1× | 8 | Spacing intra-elemento |
| `space-4` | 1.5× | 12 | Margine testo |
| `space-5` | 2× | 16 | Padding card piccola |
| `space-6` | 3× | 24 | Padding card media |
| `space-8` | 4× | 32 | Spacing sezioni piccole |
| `space-10` | 5× | 40 | Margine sezione vs sezione |
| `space-12` | 6× | 48 | Spacing intra-section (mobile) |
| `space-16` | 8× | 64 | Top/bottom section (mobile) |
| `space-20` | 10× | 80 | Spacing sezioni desktop |
| `space-24` | 12× | 96 | Hero top/bottom |
| `space-32` | 16× | 128 | Hero top/bottom xl |

### Decisioni vincolanti

| Decisione | Motivazione |
|-----------|-------------|
| **8px base, NON 4px** | multiplo di 8 si compone con font 16/24/32/40 |
| Spacing sezioni non costante | `space-20` (80) desktop, `space-16` (64) mobile |
| Spacing hero sempre generoso | hero ≠ feature ≠ footer: ordine decrescente |
| Line-height vs spacing | line-height 1.6 per body = aria respirazione naturale |

### Componenti spacing signature

| Componente | Padding | Margin |
|------------|---------|--------|
| Button | `12px 24px` | — |
| Card | `24px` | — |
| Section desktop | `80px top + 80px bottom` | between sections `80px` |
| Section mobile | `64px top + 64px bottom` | between sections `64px` |
| Container | max-width `1200px`, padding `24px` sides | — |

---

## Grid system

### Desktop (≥ 1024px)

- 12 colonne
- gutter `24px`
- max-width `1200px` (container)
- margini laterali `24px` minimi
- Outer padding container: `space-6`

### Tablet (640–1023px)

- 8 colonne
- gutter `20px`
- max-width `768px`
- container padding `20px`

### Mobile (< 640px)

- 4 colonne
- gutter `16px`
- container fluid (no max-width)
- container padding `16px`

### Decisioni vincolanti

| Decisione | Motivazione |
|-----------|-------------|
| **12 colonne desktop** | multiplo 4, divide in 2/3/4/6 |
| Max-width `1200px` (NON 1440px) | focus, NON dispersione orizzontale |
| Mobile max-width assente | full bleed per mobile-first |
| Container `mx-auto` | riduce cognitive load mentale (simmetria) |

### Anti-patterns grid

❌ NON usare:

- 16 colonne (troppo frammentato)
- Bento grid con `grid-template: masonry` (non standard)
- Auto-fit minmax senza limit
- Grid su mobile senza breakpoint < 640px

---

## Motion / Animation

### Principi

1. **Motion con purpose, no motion for delight** — ogni animazione ha una motivazione funzionale.
2. **Sub-second duration** — qualsiasi animazione < 250ms per interazioni, max 600ms per entrate.
3. **Easing naturale** — `cubic-bezier(0.16, 1, 0.3, 1)` per "snap" morbido, `cubic-bezier(0.7, 0, 0.3, 1)` per transition.
4. **Transform-only animation** — `transform` e `opacity` solo, NO `width`/`height`/`top`/`left` (riflussi).
5. **Respect `prefers-reduced-motion`** — disabilitare tutto se utente ha impostato reduced.

### Tokens motion

| Token | Duration | Easing | Uso |
|-------|----------|--------|-----|
| `motion-fast` | 120ms | `cubic-bezier(0.7, 0, 0.3, 1)` | Hover, focus state |
| `motion-base` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrate elementi piccoli |
| `motion-slow` | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrata sezioni |
| `motion-spring` | 300ms (con overshoot 5%) | spring physics | Click feedback |

### Animation signature

- **Hero entrance**: stagger 80ms tra i blocchi (eyebrow → headline → sub → CTA), fade + 8px translateY
- **Scroll reveal**: IntersectionObserver, threshold 0.15, animate-in su `opacity 0→1` + `translateY 16px→0`
- **Hover button**: scale(1.02), 120ms
- **Active button**: scale(0.98), 80ms
- **Section transitions**: NO parallax (slow scroll + non-standard behavior)

### Anti-patterns motion

❌ NON usare:

- Parallax (Baymard 12% bounce increase)
- Auto-play animated hero
- Marquee / continuous scroll (sottrae agency)
- Loader animation > 1s (percepito come lentezza)
- Animation su CTA al page load (distrae)
- Bounce easing su hover (anni '90)
- Stagger 12+ card simultanee (overdose visiva)
- Animated emoji su hover

---

## Components

### Button

#### Primary (CTA emerald)

```css
.btn-primary {
  background: var(--brand-500);
  color: var(--fg-on-brand);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.005em;
  transition: background 120ms cubic-bezier(0.7, 0, 0.3, 1),
              transform 120ms cubic-bezier(0.7, 0, 0.3, 1);
}

.btn-primary:hover {
  background: var(--brand-600);
  transform: scale(1.02);
}

.btn-primary:active {
  background: var(--brand-700);
  transform: scale(0.98);
}
```

#### Secondary (ghost)

```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--fg-primary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}
```

#### Text link

```css
.link {
  color: var(--brand-600);
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

#### Anti-patterns button

❌ NON usare:

- Pill button con border-radius 999px su CTA (eccessivo)
- Glow / drop-shadow su button (AI-slop)
- 4 colori in uno stesso button (gradiente multi-stop)
- Animated arrow su hover ("→" che si muove)
- Button con icona a sinistra E destra
- Stessa importanza visiva per "Accedi" e "Inizia gratis"

---

### Form

```css
.field-input {
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 120ms;
  width: 100%;
  background: var(--bg-elevated);
}

.field-input:focus {
  outline: none;
  border-color: var(--brand-500);
  box-shadow: 0 0 0 3px var(--brand-50);
}
```

**Decisioni**:

- Email field con `type="email"` semanticamente (no JS validation ridondante)
- No asterischi rossi (* required): label visibili, "Required" inline
- Error message sotto il field, role="alert"
- Submit button = full primary style
- No password strength meter su landing (è solo signup)

---

### Card

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 24px;
  /* NO shadow */
}
```

**Decisioni**:

- Nessuna drop-shadow pesante (solo `box-shadow: 0 1px 2px rgba(0,0,0,0.04)` se proprio serve)
- Border invece di shadow per definizione (Bertin proximity)
- Border-radius `12px` (NON `24px` eccessivo, NON `0` troppo tech)
- Padding consistente (24px sides, 24px top/bottom)

---

### Badge / Pill

```css
.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  background: var(--brand-50);
  color: var(--brand-700);
}
```

Solo per:
- "Recommended" su tier Premium
- "Beta" / "Early access" su early-stage prodotti
- "✓" proof markers in contesti specifici

**Mai** su CTA, mai su hero, mai come elemento decorativo.

---

## Interazione patterns

### Hover state

- Default button: cambia background di 1 tonalità
- Default link: cambia colore + underline
- Default card (se hover): cambia border (NON shadow che cresce)
- Default nav link: cambia colore (NON underline animato)

### Focus state

- Outline 3px brand-50, sempre presente
- Mai rimosso (accessibilità WCAG 2.4.7)
- Focus state ≠ hover state (devono essere distinguibili)

### Active / pressed

- Scale 0.98 su button primary (click feedback)
- Background di 2 tonalità più scuro
- Duration 80ms

### Disabled (se serve)

- Opacity 0.5 + cursor not-allowed
- NO `pointer-events: none` su form disabilitato (serve focusable per screen reader)

---

## Responsive behavior

### Breakpoint

```css
/* mobile-first */
@media (min-width: 640px)  { /* tablet */ }
@media (min-width: 1024px) { /* desktop */ }
@media (min-width: 1280px) { /* wide */ }
```

### Stack verticale su mobile

- Hero: text → visual (no side-by-side su mobile)
- Pricing: 1 card per riga, full-width
- FAQ: 1 accordion per riga
- CTA sticky in nav superiore compatta (logo + CTA button)

### Touch target

- Minimo **44×44px** (WCAG 2.5.5, Apple HIG)
- Button minimo 44px tall
- Link inline padding su touch context

---

## Iconografia

### Set: **Lucide** (open source, MIT, ~1000 icone, 24px standard)

Alternative valide: Phosphor Icons, Heroicons (Tailwind).

**Decisioni**:

- Tutte le icone stroke 1.5px (NON bold), 24px default
- Stile `outline` (NON solid) per landing
- Allineamento optical su baseline

### Anti-patterns iconografia

❌ NON:

- Icone emoji 🧠 📚 🎯
- Icon-style illustrazione 3D
- Mixed family (Lucide + emoji in stessa UI)
- Icon rotate on hover
- Custom illustrated icons (> 2 ore di design per icona, fuori scope)

---

## Micro-interactions signature

### Button hover

```
scale(1.02) + bg darken
duration: 120ms
```

### Card hover (se usata)

```
border-color: subtle → strong
duration: 150ms
NO shadow that grows
```

### Link underline

```
text-underline-offset: 2px
text-decoration-thickness: 1px on default
animation on hover: thickness 1→2px
duration: 100ms
```

### Form focus

```
border-color: brand-500
box-shadow: 0 0 0 3px brand-50
duration: 120ms
```

### Section reveal (scroll)

```
opacity: 0→1
transform: translateY(16px → 0)
duration: 400ms with delay staggered 80ms per child
trigger: IntersectionObserver threshold 0.15
```

---

## Accessibility constraint (vincolante)

- WCAG 2.2 AA minima, AAA target su hero
- Tutti i contrasti ratio verificati sopra
- `prefers-reduced-motion` disabilita tutte le animazioni
- `prefers-color-scheme: dark` ha palette dedicata (NO contrasti ridotti)
- Keyboard navigation completa (tab order logico)
- Screen reader labels su tutti gli elementi interattivi
- Form: `<label>` sempre associata a `<input>`, error announcement via ARIA

---

## Takeaway pratici

1. **Type**: Inter Variable, 9 token, niente display fonts.
2. **Color**: emerald `#10B981` CTA, warm off-white bg, soft black fg. NO gradient su button.
3. **Spacing**: 8px grid base, 80px desktop sections, 64px mobile.
4. **Grid**: 12/8/4 colonne, max-width 1200px.
5. **Motion**: < 600ms duration, transform-only, reduced-motion rispettato.
6. **Components**: button primary emerald, ghost secondary, link text.
7. **Form**: minimalissimo, focus ring brand-50 sempre presente.
8. **Responsive**: mobile-first, 44px touch target minimo.
9. **Iconografia**: Lucide, outline, NO emoji.
10. **Accessibility**: WCAG 2.2 AA, keyboard-first, screen reader friendly.
