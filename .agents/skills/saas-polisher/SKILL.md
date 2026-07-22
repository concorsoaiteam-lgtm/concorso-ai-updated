---
name: saas-polisher
description: "Applica 3 micro-layer (fisico, luce, stato) a qualsiasi componente quando l'utente chiede di 'lucidare', 'polish', o 'rifinire' un elemento UI. Usa GSAP per spring-physics, gradienti radiali mouse-following, e color-coding positivo/negativo sui dati."
---

# SaaS-Polisher — Micro-Layer System

## When to Activate

Attiva questa skill quando l'utente usa una qualsiasi di queste trigger words:
- "lucida", "lucidare", "lucidatura"
- "polish", "polishing"
- "rifinisci", "rifinire"
- "aggiungi polish a [componente]"
- "rendi premium [componente]"
- "fai brillare [componente]"
- "SaaS-Polisher"

**NON attivare** per: refactoring strutturale (usa `improve-codebase-architecture`), redesign completo (usa `impeccable` o `design-taste-frontend`), o bug fixing (usa `diagnosing-bugs`).

## Core Concepts

Tre micro-layer, applicati in ordine. Ogni layer è indipendente e cumulativo. Puoi applicare 1, 2, o tutti e 3 a seconda del contesto.

1. **Layer Fisico**: Ogni movimento ha inerzia. Niente scatti. GSAP `inertia` plugin o `spring` config obbligatorio.
2. **Layer Di Luce**: Gradient radiale che segue il cursore dentro il componente. CSS `--mx` / `--my` pattern.
3. **Layer Di Stato**: Il componente comunica il suo stato (positivo/negativo/neutro) con colore, non solo con testo.

## Workflow

### Step 1 — Identifica il componente target
L'utente indica quale elemento lucidare (es. "la card delle simulazioni", "il pulsante CTA", "il toast").

### Step 2 — Applica i 3 layer in ordine

#### LAYER FISICO (GSAP Spring Physics)

**Inerzia su hover:**
```js
import { gsap } from 'gsap';

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  gsap.to(card, {
    rotateX: y * -8,    // max 8° tilt
    rotateY: x * 8,
    duration: 0.6,
    ease: 'power2.out',
    overwrite: 'auto'
  });
});

card.addEventListener('mouseleave', () => {
  gsap.to(card, {
    rotateX: 0,
    rotateY: 0,
    duration: 1.2,
    ease: 'elastic.out(1, 0.4)'  // spring settle
  });
});
```

**Spring su press (bottoni):**
```js
btn.addEventListener('pointerdown', () => {
  gsap.to(btn, { scale: 0.96, duration: 0.1, ease: 'power2.in' });
});
btn.addEventListener('pointerup', () => {
  gsap.to(btn, { 
    scale: 1.02, duration: 0.15, ease: 'power2.out',
    onComplete: () => gsap.to(btn, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' })
  });
});
```

**Regola d'oro**: Ogni transizione usa `power2.out` o `elastic.out`. MAI `linear`. MAI `ease: 'none'`.

#### LAYER DI LUCE (Radial Mouse-Following)

**CSS:**
```css
.component {
  --mx: 50%;
  --my: 50%;
  --glow-intensity: 0;
  position: relative;
  overflow: hidden;
  background: 
    radial-gradient(
      180px circle at var(--mx) var(--my),
      rgba(37, 99, 235, calc(0.08 * var(--glow-intensity))),
      transparent 60%
    ),
    var(--surface);
  transition: background 0.2s ease;
}
```

**JS:**
```js
el.addEventListener('mousemove', (e) => {
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
  el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  el.style.setProperty('--glow-intensity', '1');
});
el.addEventListener('mouseleave', () => {
  el.style.setProperty('--glow-intensity', '0');
});
```

**Regola d'oro**: Il gradient NON deve mai saturare. Max 8-10% opacity. Deve essere percettibile ma mai dominante.

#### LAYER DI STATO (Color-Coding Dati)

Mappa i valori numerici in 3 stati visivi:

| Stato | Soglia | Colore | Trattamento |
|-------|--------|--------|-------------|
| Positivo | > 7/10 o > 70% | `#16A34A` (success) | Glow verde + badge "✓" |
| Neutro | 5-7/10 o 40-70% | `#D97706` (warning) | Nessun glow extra |
| Negativo | < 5/10 o < 40% | `#DC2626` (error) | Sfondo `error-light` + pulse |

**Implementazione JS:**
```js
function getState(value, max) {
  const pct = (value / max) * 100;
  if (pct > 70) return { state: 'positive', color: '#16A34A', bg: '#DCFCE7', icon: '✓' };
  if (pct < 40) return { state: 'negative', color: '#DC2626', bg: '#FEE2E2', icon: '!' };
  return { state: 'neutral', color: '#D97706', bg: '#FEF3C7', icon: '~' };
}
```

**CSS per stato positivo:**
```css
.component[data-state="positive"] {
  border-color: rgba(22, 163, 74, 0.3);
  box-shadow: 0 0 16px rgba(22, 163, 74, 0.12);
}
.component[data-state="negative"] {
  border-color: rgba(220, 38, 38, 0.2);
  background: linear-gradient(135deg, #FEE2E2, #FFFFFF);
  animation: statePulse 2s ease-in-out infinite;
}
@keyframes statePulse {
  0%, 100% { border-color: rgba(220, 38, 38, 0.3); }
  50% { border-color: rgba(220, 38, 38, 0.08); }
}
```

## Examples

### Esempio 1: Lucidare una card metrica

**Input**: "Lucidami la card delle simulazioni"

**Output**:
1. **Layer Fisico**: Aggiunge tilt 3D al passaggio del mouse + spring settle (`elastic.out(1, 0.4)`)
2. **Layer Di Luce**: Aggiunge gradient radiale brand-500 8% che segue il cursore dentro la card
3. **Layer Di Stato**: Se il numero è > 7 → bordo verde + glow; se < 3 → bordo rosso + pulse

### Esempio 2: Lucidare un pulsante CTA

**Input**: "Polish the CTA button"

**Output**:
1. **Layer Fisico**: Sostituisce `transition: transform 0.15s` con GSAP `elastic.out(1, 0.3)` su press/release. Aggiunge micro-magnetic (±4px) verso il cursore.
2. **Layer Di Luce**: Aggiunge `::after` pseudo-element con gradient radiale bianco 15% che si sposta col mouse.
3. **Layer Di Stato**: Non applicabile (i bottoni non hanno dati). Skip.

### Esempio 3: Lucidare solo il layer fisico

**Input**: "Aggiungi solo spring physics al dropdown menu"

**Output**: Applica SOLO il Layer Fisico (GSAP `elastic.out` sull'apertura/chiusura). Skip Luce e Stato.

## Guidelines

1. ✅ Applica i layer in ordine: Fisico → Luce → Stato
2. ✅ Ogni layer è opzionale e skippabile se non pertinente
3. ✅ Usa GSAP, MAI `transition` CSS per il layer fisico
4. ✅ Il gradient di luce NON supera MAI il 10% di opacity
5. ✅ Lo stato si basa su SOGLIE NUMERICHE, non su interpretazioni
6. ✅ Aggiungi `data-state="positive|neutral|negative"` sul DOM per debug
7. ✅ Rispetta `prefers-reduced-motion`: se attivo, salta il layer fisico
8. ❌ NON cambiare la struttura HTML del componente
9. ❌ NON modificare la logica di business
10. ❌ NON aggiungere animazioni > 600ms (tranne spring settle che può arrivare a 1.2s)

## Gotchas

- **GSAP non disponibile**: Se il progetto non ha GSAP, usa `transition` CSS con `cubic-bezier(0.34, 1.56, 0.64, 1)` come fallback. Segnala all'utente che GSAP darebbe risultati migliori.
- **Componenti annidati**: Il gradient di luce su un parent si applica ANCHE ai children se hanno `background: transparent`. Forza `background: inherit` o `var(--surface)` sui children.
- **Stato senza dati**: Se il componente non ha un valore numerico associato, chiedi all'utente quale metrica usare per determinare lo stato.
- **Conflitto con `overflow: hidden`**: Il tilt 3D (rotateX/rotateY) richiede `perspective` sul parent e NON funziona bene con `overflow: hidden`. Usa `overflow: visible` o applica il tilt al parent container.

## Integration

- **Con `impeccable`**: `impeccable` gestisce il design system (colori, spazi, tipografia). `saas-polisher` aggiunge i micro-layer SOPRA il design system. Usa `impeccable` prima, `saas-polisher` dopo.
- **Con `ui-ux-pro-max`**: `ui-ux-pro-max` fornisce riferimenti di stile. `saas-polisher` esegue l'implementazione GSAP + gradienti.
- **Con `design-taste-frontend`**: `design-taste-frontend` fa redesign completo. `saas-polisher` lucida componenti esistenti senza redesign.

## Checklist Rapida

Prima di consegnare un componente lucidato, verifica:
- [ ] Layer Fisico: le transizioni usano GSAP `power2.out` o `elastic.out`?
- [ ] Layer Di Luce: il gradient radiale è al massimo 8-10% opacity?
- [ ] Layer Di Stato: i dati numerici sono mappati in positivo/negativo/neutro?
- [ ] `prefers-reduced-motion` è rispettato?
- [ ] Il DOM ha `data-state="..."` per debugging?
- [ ] Nessuna animazione supera 600ms (tranne spring settle)?
