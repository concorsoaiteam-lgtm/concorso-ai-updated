# Dashboard Rewrite — Documentazione Tecnica

**File:** `public/dashboard.html`  
**Data:** Luglio 2026  
**Design system:** `public/design.md`

---

## 🎯 Obiettivo

Riscrittura completa di `dashboard.html` da zero, preservando la business logic Supabase e riscrivendo interamente HTML, CSS, animazioni e funzioni di rendering secondo il design system `design.md`.

---

## 🔤 Tipografia

| Ruolo | Font | Weight | Note |
|---|---|---|---|
| Titoli (h1, h2, panel-title) | Geist | 600–700 | `letter-spacing: -0.02em / -0.04em` |
| Body, label | Geist | 400–500 | `line-height: 1.6` |
| Dati numerici (metriche, score, gauge) | Geist Mono | 700 | `font-variant-numeric: tabular-nums` |
| Bottoni CTA | Geist | 700 | 16px |
| Caption, chip | Geist | 500 | 12px |

**Rimosso:** Inter (sostituito con Geist + Geist Mono via jsdelivr CDN)  
**Vietato:** `font-weight: 800` o `900` (mai usati)

---

## 🎨 Palette colori

| Token | Valore | Uso |
|---|---|---|
| `--bg` | `#F7FBFF` | Sfondo pagina |
| `--surface` | `#FFFFFF` | Card, panel |
| `--surface-raised` | `#F0F6FF` | Hover, background elevati |
| `--border` | `#E2EEFF` | Bordi card e input |
| `--border-strong` | `#C5D8F5` | Bordi hover |
| `--brand` | `#0F4C81` | Primario, hero, navbar |
| `--accent` | `#2563EB` | Accent, link, glow |
| `--success` | `#16A34A` | Score ≥ 8 |
| `--warning` | `#D97706` | Score 5–7 |
| `--error` | `#DC2626` | Score < 5 |
| `--text-primary` | `#0A1628` | Testo principale |
| `--text-secondary` | `#3D5A8A` | Testo secondario |
| `--text-muted` | `#7B93B8` | Label, caption |

### Colori materie (icone)

| Materia | Colore |
|---|---|
| Diritto Amministrativo | `#2563EB` |
| Diritto Costituzionale | `#7C3AED` |
| Diritto Civile | `#0891B2` |
| Diritto Penale | `#DC2626` |
| Contabilità Pubblica | `#059669` |
| Diritto del Lavoro | `#D97706` |
| Informatica | `#4F46E5` |
| Inglese | `#0F4C81` |
| Diritto Tributario | `#9333EA` |
| Diritto Europeo | `#0284C7` |

---

## 🌑 Ombre (sempre brand-colored, mai nere)

| Livello | Valore | Uso |
|---|---|---|
| `--sh-1` | `0 1px 3px rgba(15,76,129,.06)` | Card a riposo |
| `--sh-2` | `0 4px 16px rgba(15,76,129,.10)` | Card hover, banner |
| `--sh-3` | `0 8px 32px rgba(15,76,129,.12)` | Dropdown, tooltip, toast |
| `--sh-4` | `0 20px 60px rgba(15,76,129,.16)` | Hero, CTA button |

---

## 📐 Border Radius

| Elemento | Valore | Token |
|---|---|---|
| Bottoni | 10px | `--r-btn` |
| Card | 16px | `--r-card` |
| Card grande (hero) | 20px | `--r-card-lg` |
| Chip/badge | 6px | `--r-chip` |
| Toast | 14px | `--r-toast` |
| Icon box | 12px | `--r-icon-box` |
| Avatar | 50% | — |

---

## 🧩 Componenti implementati

### 1. Navbar smart sticky
- **Comportamento:** si nasconde allo scroll verso il basso, riappare allo scroll verso l'alto
- **Classe:** `.navbar.nav-hidden` → `translateY(-110%)`
- **JS:** `initSmartNav()` — listener `scroll` con `passive: true`
- **Stile:** blur `20px`, altezza `56px`, bordo `#E2EEFF`

### 2. Hero
- **Sfondo:** gradiente `#071D33 → #0F4C81 → #2563EB` (brand gradient, non viola)
- **Griglia:** pattern di linee sottili con maschera radiale
- **Titolo:** "Ciao, [userName]" con sottolineatura SVG animata
- **Sottolineatura:** pseudo-elemento `::after` con `drawUnderline` keyframe (scaleX 0→1, 0.8s)
- **Sottotitolo:** dinamico, cambia in base a `state.average` e `state.simulations`
- **Gauge voto medio:** SVG radiale 140px, `stroke-dashoffset` animato via GSAP (1.2s ease-out)

### 3. CTA principale
- **Stile:** `linear-gradient(135deg, #0F4C81, #2563EB)`, height 52px, radius 12px
- **Glow ring:** animazione `ctaGlow` infinita (box-shadow 0→8px→0, 2.5s)
- **Particelle:** 10 particelle radiali al click, esplodono e svaniscono (GSAP)
- **Magnetic:** il bottone segue leggermente il cursore (GSAP `power2.out`)
- **Arrow:** si sposta a destra di 3px all'hover

### 4. Metriche (4 card tutte diverse)

| Metrica | Layout | Dettaglio |
|---|---|---|
| **Simulazioni** | Counter Geist Mono 32px + sparkline SVG | Sparkline: polyline SVG con area gradiente, animazione stroke-dashoffset |
| **Voto medio** | Gauge radiale SVG 100px + valore centrato | Colore dinamico (error/warning/success), animato con ScrollTrigger |
| **Bandi** | Counter + icona documento SVG 22px | Icon flip micro-interaction |
| **Streak** | 7 cerchi GitHub-style da 10px | Cerchi pieni (`#2563EB`) o vuoti (`border: 1.5px`), "oggi" ha pulse animation |

### 5. Ultime simulazioni
- **Layout:** lista verticale, ogni item flex orizzontale
- **Icona materia:** box 36px con colore materia al 15% di opacità su sfondo e 100% sull'icona
- **Hover:** `translateX(3px)` + background `--surface-raised`
- **Score pill:** Geist Mono 13px, background dinamico (error-light/warning-light/success-light)

### 6. Aree da migliorare
- **Barre:** gradiente fisso `#DC2626 → #D97706 → #16A34A`, background-size 1080px
- **Posizione:** `background-position` calcolata sul valore percentuale
- **Peggiore:** la prima barra (score più basso) ha `weakPulse` animation (opacità 1↔0.6)
- **Animazione:** width 0→valore via ScrollTrigger (0.8s power2.out, stagger 0.1s)

### 7. Trend punteggi
- **Grafico:** SVG 680×160, curva Bézier (4 punti di controllo per segmento)
- **Area:** gradiente verticale `#2563EB 18% → trasparente` sotto la curva
- **Punti:** cerchi r=3, l'ultimo ha `nowPulse` glow animation
- **Tooltip:** hover sui punti mostra score + data, posizionamento dinamico
- **Draw animation:** `stroke-dashoffset` full→0 via ScrollTrigger (1.2s ease-out)
- **Empty state:** icona + messaggio quando < 2 simulazioni

### 8. Upload bando
- **Tab indicator:** posizione assoluta, transizione `left` e `width` con cubic-bezier (0.25s)
- **Drop zone:** bordo dashed, shimmer animation al drag-over
- **Progress card:** barra con shimmer perpetuo, spinner rotante
- **Check animato:** SVG cerchio verde + checkmark bianco al completamento
- **Error state:** SVG cerchio rosso + X bianca
- **Materie:** griglia responsive, ripple animation al click, stato active con glow

### 9. Come funziona
- **3 step:** card con icona SVG + titolo + descrizione
- **Icone SVG:** stroke-dashoffset draw animation allo scroll (ScrollTrigger, 0.8s)
- **Hover:** `translateY(-2px)` + `--sh-2`

---

## 🎬 Animazioni

| Animazione | Trigger | Durata | Easing |
|---|---|---|---|
| Page load stagger | `DOMContentLoaded` | navbar→hero→metriche→panel (stagger 60ms) | `power2.out` |
| Hero underline | 600ms dopo load | 0.8s | `cubic-bezier(0.4,0,0.2,1)` |
| Counter metriche | Dopo `loadDashboardData` | 0.8s + pop 0.3s | `power2.out` + `back.out(2.6)` |
| Gauge hero | `setStat('average')` | 1.2s (hero) | `power2.out` |
| Gauge metric card | ScrollTrigger (`top 88%`) | 1.2s | `power2.out` |
| Barre miglioramento | ScrollTrigger (`top 88%`) | 0.8s stagger 0.1s | `power2.out` |
| Trend line draw | ScrollTrigger (`top 80%`) | 1.2s | `power2.out` |
| Icone how-to draw | ScrollTrigger (`top 85%`) | 0.8s | `power2.out` |
| CTA glow ring | Infinito | 2.5s | `ease-in-out` |
| CTA particelle | Click | 0.5–0.9s | `power2.out` |
| Streak dots pop | Dopo load | 0.35s stagger 0.08s | `back.out(2)` |
| Streak oggi pulse | Infinito | 1.6s | `ease-in-out` |
| Tab indicator | Click tab | 0.25s | `cubic-bezier(0.4,0,0.2,1)` |
| Toast enter/exit | `showToast()` | 0.3s / 0.2s | `back.out(1.4)` / `power2.in` |

### GSAP + ScrollTrigger
- Tutte le animazioni usano **GSAP 3** con **ScrollTrigger**
- `gsap.registerPlugin(ScrollTrigger)` chiamato in `initPageAnimations()`
- `prefers-reduced-motion: reduce` disabilita tutte le animazioni (duration 0.01ms)

---

## 🧱 Spacing (scala 4px)

| Token | Valore | Uso |
|---|---|---|
| xs | 4px | Gap icona-label |
| sm | 8px | Gap nav actions |
| md | 12px | Gap tra card metriche, content grid |
| lg | 16px | — |
| xl | 20px | Padding card |
| 2xl | 24px | Gap tra sezioni, padding laterale |
| 3xl | 32px | — |
| 4xl | 40px | Padding hero |

**Max-width contenuto:** 1080px centrato  
**Padding laterale:** 24px mobile, 64px desktop

---

## 📱 Responsive

| Breakpoint | Comportamento |
|---|---|
| `> 1024px` | Metriche 4 colonne, content grid 3:2 |
| `≤ 1024px` | Metriche 2 colonne, content grid 1 colonna |
| `≤ 640px` | Metriche 1 colonna, hero flex-direction column, how-to 1 colonna |

---

## 🔒 Logica preservata (non modificata)

- Configurazione Supabase (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `supabaseClient`)
- `state{}` object (`simulations`, `average`, `bandi`, `streak`, `recent`, `subjects`)
- `displayName()`, `scoreColor()`, `scoreHex()`, `relativeDate()`
- `loadDashboardData()`, `calcStreak()`, `calcSubjects()`
- `processFiles()`, `processSingleFile()`
- `saveText()`, `saveMaterie()`
- `getSupabase()`, `chunkText()`, `escapeHtml()`
- `bumpBandi()`, `createProgressCard()`, `updateProgressCard()`
- `switchUploadTab()`, `renderMaterieButtons()`, `updateWordCounter()`
- Costanti: `uploadCards`, `selectedMaterie`, `MAX_PDF_SIZE`, `MATERIE`
- `init()` — struttura preservata, adattata ai nuovi ID/elementi

---

## ❌ Pattern AI-slop rimossi

- ❌ Font Inter → ✅ Geist + Geist Mono
- ❌ Gradient viola-blu `#7C3AED → #2563EB` → ✅ Brand gradient `#071D33 → #0F4C81 → #2563EB`
- ❌ Ombre nere `rgba(0,0,0,...)` → ✅ Ombre brand `rgba(15,76,129,...)`
- ❌ `font-weight: 800/900` → ✅ Massimo 700
- ❌ Glassmorphism su card → ✅ Solo blur leggero sulla navbar
- ❌ Card senza bordo → ✅ Tutte le card hanno `border: 1px solid #E2EEFF`
- ❌ Emoji come icone → ✅ SVG Heroicons outline
- ❌ `rounded-2xl` ovunque → ✅ Radius differenziati per elemento
- ❌ Centered hero template → ✅ Layout asimmetrico con gauge a destra
- ❌ `bg-clip-text` gradient text → ✅ Testo solido
- ❌ Sfondo `#FFFFFF` → ✅ Sfondo `#F7FBFF`

---

## 📋 Checklist verifica

| # | Requisito | Stato |
|---|---|---|
| 1 | Font è Geist non Inter | ✅ |
| 2 | Ombre usano brand color non nero | ✅ |
| 3 | Gauge del voto si anima | ✅ stroke-dashoffset GSAP |
| 4 | Streak ha 7 cerchi | ✅ |
| 5 | Sparkline è SVG reale | ✅ polyline + area |
| 6 | Trend si disegna allo scroll | ✅ Bézier + ScrollTrigger |
| 7 | Particelle al click CTA | ✅ 10 radiali |
| 8 | Tab indicator scorre fluido | ✅ cubic-bezier transition |
| 9 | Toast ha progress bar interna | ✅ scaleX 1→0 in 3s |
| 10 | Tutto rispetta design.md | ✅ |
