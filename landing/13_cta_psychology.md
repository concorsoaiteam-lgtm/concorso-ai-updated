# 13 — CTA (Call to Action) psychology: tipografia, copy, posizione, gerarchia

> **Scopo**: definire la regolazione operativa delle CTA sulla landing ConcorsoAI. La CTA è il punto di **azione** della UI — dove il visitatore esprime commitment. Ogni proprietà della CTA (copy, dimensione, posizione, colore, copy microcopy) influenza conversion. Sequenza: copywriting (file 11), microcopy (file 12), CTA focus.</description>

---

## Introduzione

### Perché la CTA merita un file dedicato

La CTA è la **traduzione concreta dei bias cognitivi** del visitatore in **azione**:
- **Reciprocità** (file 03 §P1) → "Inizia gratis" → CTA in hero.
- **Foot-in-the-door** (file 03 §P2) → micro-CTA prima di prezzi.
- **Fitts's Law** (file 02 §P4 + file 18) → CTA deve essere **grande + vicino**.
- **Von Restorff** (file 05 §P3) → CTA isolata cromaticamente.
- **Specificity Effect** (file 03 §P8) → CTA copy = benefit specifico.

Ogni leva psicologica ha un **punto di applicazione fisico** nella UI = la CTA. Questo file raccoglie le regole in un unico referenziale.

Riferimenti: Fitts's Law (1954, ripreso Card/English/Burr 1978 in HCI); Hick's Law (1952); Norman, *The Design of Everyday Things* (1990); UI Patterns (Tidwell, 2011); Smashing Magazine (2018-2024) — CTA Design Patterns; NN/g (2018-2024) — Button Design.

### Come si applica a ConcorsoAI

CTA ConcorsoAI (pre-Stripe):
1. **CTA hero (primary)**: "Inizia la tua prima simulazione" → /auth?mode=register
2. **CTA pricing (Free tier)**: "Inizia gratis" → /auth?mode=register&plan=free
3. **CTA pricing (Pro tier, post-Stripe)**: "Sblocca Pro a €14,99/mese" → /auth?mode=register&plan=pro
4. **CTA footer (final)**: "Inizia la tua prima simulazione" → replica mnemonico hero
5. **CTA mobile sticky**: "Prova gratis: 3 simulazioni" → /auth?mode=register
6. **Secondary CTA hero**: "Scopri i 4 step ↓" → ancora interna

Tutte le CTA primary puntano a `/auth?mode=register` con copy specifico in posizione isolata.

---

## Principi

### P1 — Fitts's Law (1954): CTA grande + vicino

Tempo per cliccare un target digitale:
$$T = a + b \cdot \log_2\left(\frac{2D}{W}\right)$$

Dove $D$ = distanza dal cursore al target, $W$ = dimensione del target.

Risultato: target grandi + vicini = click più rapido.

Conseguenza operativa ConcorsoAI:
- **CTA primary**: altezza ≥56px desktop, ≥48px mobile, distanza <8px dal H1.
- **CTA mobile sticky**: bottom-sticky 64px altezza, full-width.
- **CTA pricing (tier centrale)**: card height 360-400px (più "ingombrante" rispetto agli altri).

### P2 — Hick's Law: max 2 CTA per viewport

Tempo di decisione cresce logaritmicamente con opzioni:
$$T = b \cdot \log_2(n+1)$$

Pattern operativo: max 1 CTA primary + 1 CTA secondary per viewport. Mai 2 primary stessa importanza visiva.

ConcorsoAI: hero = 1 primary ("Inizia la tua prima simulazione") + 1 secondary ("Scopri i 4 step ↓"). Mai 3-4 CTA primary contemporanei.

### P3 — Von Restorff: CTA isolata cromaticamente

CTA primary = unico elemento brillantemente colorato nella viewport iniziale. Tutti gli altri = neutri.

ConcorsoAI:
- **CTA primary**: `bg-accent #2563EB` + white text + 3px ring solid on focus-visible.
- **CTA secondary**: ghost button (transparent + border 1px text-color).
- **Link testuali**: text-color (ink) underline-on-hover.
- **Trust badges**: bg-faint + text-secondary (mai accent-color).

### P4 — Verbo d'azione specifico (mai "Get started")

CTA copy = verbo d'azione specifico → benefit specifico.

ConcorsoAI CTA canonici:
- ✅ "Inizia la tua prima simulazione" (verbo + benefit)
- ✅ "Sblocca tutte le materie del tuo bando" (pricing tier centrale)
- ✅ "Prova la tua prima simulazione gratis" (mobile sticky)
- ✅ "Scopri i 4 step" (secondary, scroll)
- ❌ "Inizia gratis" (generic)
- ❌ "Get started" (USA-format)
- ❌ "Scopri di più" (generic)
- ❌ "Clicca qui" (anti-pattern)

### P5 — CTA copy ≤5 parole

CTA label breve per chiarezza, scan-mode friendly. Pattern:
- "Inizia simulazione" (2 parole)
- "Vedi il tuo punteggio" (4 parole)
- "Sblocca tutte le materie" (3 parole)
- "Più info" (2 parole)
- "Prova gratis" (2 parole)

Mai CTA >5 parole.

### P6 — Primary vs Secondary: 2 livelli di gerarchia ben definiti

Gerarchia CTA esplicita:
- **Primary**: bg accent + white text + shadow su hover + bold font-weight.
- **Secondary**: transparent + border 1px + text-color + no shadow.
- **Tertiary**: text link underline (mai primary).

ConcorsoAI hero CTA:
- Primary: "Inizia la tua prima simulazione" → full-button style.
- Secondary: "Scopri i 4 step ↓" → link testuale with arrow.

### P7 — CTA repetition mnemonica (3-4-5 istanze)

L'utente deve poter trovare la CTA **a qualsiasi punto di scroll**. Pattern ConcorsoAI:
- **Hero** (above the fold).
- **Dopo social proof** (mid-page replica).
- **Pricing-Pro** (conversion finale).
- **Footer** (final mnemonico).
- **Mobile sticky** (persistent during scroll).

Totale 4-5 repliche. Tutte label identico (nessuna variazione).

### P8 — CTA sufficienti micro-interactions

Hover state deve comunicare "cliccabile" senza essere invasivo. Pattern:
- **Hover**: bg shifts +0.5 value (più scuro 10%) + opacity 0.95.
- **Active**: scale 0.98 + bg shifts +0.7 value.
- **Focus-visible**: outline 3px solid rgba(accent, 0.5) + outline-offset 3px.
- **Disabled**: opacity 0.55 + cursor not-allowed (mai gray disattivato).

ConcorsoAI:
```css
.btn-cta:hover { background: #1D4ED8; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
.btn-cta:active { transform: scale(0.98); }
.btn-cta:focus-visible { outline: 3px solid rgba(37, 99, 235, 0.5); outline-offset: 3px; }
.btn-cta:disabled { opacity: 0.55; cursor: not-allowed; }
```

Pattern: 4 stati (default/hover/active/focus-visible/disabled).

### P9 — CTA aria-label con verb d'azione

Ogni button CTA ha aria-label esplicito:
```html
<button class="btn-cta" aria-label="Inizia la tua prima simulazione">
  Inizia la tua prima simulazione
</button>
```

aria-label = main label (no variations). Per button icon-only, aria-label = verb.

### P10 — Post-CTA feedback (post-click)

Dopo click su CTA primary, il visitatore riceve feedback immediato:
- **Loading state** (se >400ms API call).
- **Navigation** (URL change).
- **Toast success** (se form submitted).
- **Browser focus** (se modal opening).

Mai CTA che non dà feedback.

### P11 — CTA su mobile sticky (thumb-reachable zone)

Su mobile (<768px), una CTA replica **bottom-sticky**: full-width 64-72px altezza, thumb-reachable.

ConcorsoAI mobile sticky:
- Position bottom 0.
- Padding-bottom `env(safe-area-inset-bottom)` per iOS Safari + iPhone notch.
- Background = `var(--color-bg)` (no transparency).
- Border-top + shadow sottile.

### P12 — CTA labeling per page type (coerenza cross-page)

Tutte le pagine del flow hanno CTA coerenti:
- **Landing hero**: "Inizia la tua prima simulazione"
- **Landing pricing**: "Inizia gratis" (Free) / "Sblocca Pro" (Pro)
- **Auth page**: "Accedi" / "Registrati" (form submit)
- **Auth page register**: "Crea il tuo account"
- **Dashboard primary**: "Nuova simulazione"
- **Simulation**: "Inizia la simulazione"
- **Cancellation**: "Cancella abbonamento" (destructive, conferma)

Pattern: ogni pagina/auth flow ha CTA coerente. Mai "Procedi", "Continua", "Avanti" (generic).

### P13 — CTA positive framing (urgency framing comparison)

Confronto CTA framing:
- **Gain framing** (visualizzare gain): "Inizia la tua prima simulazione" (anche se non c'è guadagno diretto, l'azione è attivante).
- **Loss framing** (visualizzare perdita): "Reagisci prima dell'orale" (anni di studio persi) — meno efficace per CTA primary.

Pattern ConcorsoAI: CTA primary = gain framing. CTA con copy motivational loss = secondary, context-dependent.

### P14 — CTA come affordance visiva (no just text)

CTA deve sembrare "cliccabile" anche prima del click. Pattern:
- **Visual affordance**: shadow + bg accent = "premi me".
- **Micro-anim**: hover lift 1px + bg shade darker 10%.
- **Cursor**: cursor: pointer (default per button).

Mai CTA che sembra text link (borderless + no shadow).

### P15 — CTA vs Pricing tier consistency

Quando una CTA è in pricing page, deve essere coerente con il tier:
- **Free tier CTA**: "Inizia gratis" o "Inizia la tua prima simulazione".
- **Pro tier CTA**: "Sblocca Pro a €14,99/mese" o "Passa a Pro" (con benefit).
- **Team tier CTA** (post-Stripe Q3): "Attiva per il tuo team" (se >3 utenti).

Pattern: label CTA riflette il tier specifico. Niente confusione "qual è il price".

---

## Evidenze

### Fitts (1954)

- Tempo per cliccare un target digitale. Formula canonica.
- Implicazioni: target grande + vicino = click più rapido.
- Adottato da Apple HIG 44x44pt minimum, WCAG 2.5.5 target size.

### Hick (1952)

- Tempo di decisione cresce logaritmicamente con n opzioni.
- Implicazione: max 2 CTA per viewport (primary + secondary).

### NN/g — *Button UX Best Practices* (2018-2024)

- Pattern consolidato:
  - **CTA primary = bg accent + white text + bold**.
  - **Hover state = bg darker 10% + shadow + transform**.
  - **Active state = scale 0.98 + bg darker 15%**.
  - **Focus-visible = outline 3px + offset**.
  - **Disabled = opacity 0.55 + cursor not-allowed**.

### Smashing Magazine (2018-2024) — Multiple articles on CTA

- Verbo d'azione specifico > generic.
- CTA copy ≤5 parole.
- CTA isolated columnatically.
- 1 sola CTA primary per viewport.

### Baymard Institute (2024) — CTA on E-commerce

- Studio N>500. Risultato:
  - 11% drop se CTA primary è button secondary style (no contrast).
  - 8% drop se CTA copy è "Submit" generic.
  - 6% drop se 3+ CTA primary nel viewport.

### WebAIM — CTA Accessibility (2018)

- WCAG compliance:
  - aria-label esplicito su ogni button.
  - Tag `<button>` non `<a>` per azioni (no navigation).
  - Focus-visible ring outline ≥2px + offset.

### Material Design (2014-2024) — *Buttons*

- Pattern FAB (Floating Action Button), outlined button, text button.
- Per SaaS: button primary + secondary, mai button text + outlined insieme.

### NN/g — *Sticky Bottom CTA Mobile* (2018)

- Pattern: bottom-sticky su mobile, full-width, ≥48px altezza.
- 80% dei top 100 SaaS apps mobile usa sticky CTA.

### Google Analytics benchmark (2018-2024)

- Mobile sticky CTA aumenta conversion 12-22% vs in-page CTA post-scroll.
- Su hero CTA sotto fold: 5% drop se non visibile above-fold.

---

## Errori comuni

### E1 — CTA primary "sparsa" senza isolamento cromatico

**Sintomo**: la CTA primary usa lo stesso colore (blu) di altri 5 elementi della hero.

**Perché succede**: copy pensa "coerenza cromatica = primary usa brand".

**Perché il cervello lo rifiuta**: Von Restorff richiede 1 solo isolato. Multi-accent = isolato scompare.

**Soluzione**: solo CTA primary usa `var(--color-accent)` brillante. Tutti gli altri elementi in neutri.

### E2 — CTA copy generic ("Inizia gratis", "Scopri di più")

**Sintomo**: tutte le CTA landing = "Inizia gratis" o "Scopri di più".

**Perché succede**: copy pensa "brevity = chiaro".

**Perché il cervello lo rifiuta**: label non comunica benefit. Clicco? Spesso no.

**Soluzione**: label specifico. "Inizia la tua prima simulazione" > "Inizia gratis".

### E3 — CTA >5 parole

**Sintomo**: button label "Scopri come funziona e inizia la tua simulazione gratuita".

**Perché succede**: copy tenta di condensare tutto nel button.

**Perché il cervello lo rifiuta**: button troncato su mobile. Read confuso.

**Soluzione**: max 5 parole. Sub-st explain sotto + scroll.

### E4 — CTA copy senza aria-label

**Sintomo**: button con text ma senza aria-label (= no screen reader).

**Perché succede**: developer dimentica accessibility copy.

**Perché il cervello lo rifiuta**: screen reader user non sa cosa fa button.

**Soluzione**: aria-label = main label (verb + benefit).

### E5 — Multiple CTA primary in same viewport

**Sintomo**: hero con 2 button "Prova gratis" + "Inizia ora" entrambi con stile primary.

**Perché succede**: copy pensa "more options = more clicks".

**Perché il cervello lo rifiuta**: Hick's Law → decision paralysis. Click su uno dei due = confusion.

**Soluzione**: 1 primary + 1 secondary max per viewport.

### E6 — CTA visivamente debolmente identificabile

**Sintomo**: la CTA ha lo stesso styling del copy circostante (es. text link con underline, no button).

**Perché succede**: designer vuole "minimalism".

**Perché il cervello lo rifiuta**: la CTA non sembra "cliccabile" → conversion drops.

**Soluzione**: button shape (bg + padding + border) + shadow su hover + standard 9:1 contrast.

### E7 — CTA private di micro-interaction (no hover/active feedback)

**Sintomo**: button senza :hover o :active. Click senza visual feedback.

**Perché succede**: developer o designer dimentica interactive states.

**Perché il cervello lo rifiuta**: utente pensa "non sto cliccando".

**Soluzione**: 4 stati (default/hover/active/focus-visible/disabled).

### E8 — CTA senza premium framing dopo Stripe live

**Sintomo**: ConcorsoAI dopo Stripe con CTA "Submit" o generic.

**Perché succede**: copy dimentica che "Submit" è NO-action copy.

**Perché il cervello lo rifiuta**: "Pagamento completato" button deve essere conversation = "Conferma il tuo abbonamento Pro".

**Soluzione**: CTA di pagamento = "Conferma Pro a €14,99/mese" > "Submit".

### E9 — CTA destructive senza confirm

**Sintomo**: "Elimina account" button senza modal confirmation.

**Perché succede**: copy pensa "1-click delete = efficient".

**Perché il cervello lo rifiuta**: errori umani non protetti. Trust erode.

**Soluzione**: modal + typing confirm pattern.

### E10 — CTA focus ring rimosso

**Sintomo**: button:focus { outline: none; } (rimuove focus indicator).

**Perché succede**: designer vuole "clean state".

**Perché il cervello lo rifiuta**: keyboard user non sa dove sono. WCAG 2.4.7 violation.

**Soluzione**: focus-visible outline 3px solid rgba(accent, 0.5) + offset.

### E11 — CTA mobile sticky sovrapposta a footer

**Sintomo**: sticky CTA copre footer + content bottom.

**Perché succede**: z-index mal calibrato.

**Perché il cervello lo rifiuta**: footer nascosto = trust link persi.

**Soluzione**: sticky CTA auto-hide quando scroll-arriva a footer (IntersectionObserver).

### E12 — CTA hover con scale transform eccessivo

**Sintomo**: button:hover { transform: scale(1.5); } (esagerato).

**Perché succede**: designer "creative hover effects".

**Perché il cervello lo rifiuta**: scale >1.1 attiva "buttons moving around me" = unsettling.

**Soluzione**: scale 0.98 (active), no scale on hover. Solo bg change + shadow.

### E13 — CTA su mobile sticky senza safe-area-inset-bottom iOS

**Sintomo**: sticky CTA bottom 0 su iOS Safari con notch + home indicator = nascosto.

**Perché succede**: developer non conosce env(safe-area-inset-bottom).

**Perché il cervello lo rifiuta**: button in parte fuori schermo. Apple HIG violation.

**Soluzione**: `padding-bottom: env(safe-area-inset-bottom)` su .sticky-mobile-cta.

---

## Pattern migliori

### Pattern A — Button primary canonico

```css
.btn-cta {
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 15px;
  line-height: 1;
  padding: 14px 24px;
  min-height: 48px;
  border-radius: 8px;
  background: #2563EB;
  color: white;
  border: none;
  cursor: pointer;
  transition: background 200ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 200ms;
}

.btn-cta:hover {
  background: #1D4ED8;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.btn-cta:active { transform: scale(0.98); }

.btn-cta:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.55);
  outline-offset: 3px;
}

.btn-cta:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
```

Pattern: 5 stati canonici. Default + 4 interattivi.

### Pattern B — Button secondary canonico (ghost button)

```css
.btn-secondary {
  font-weight: 500;
  font-size: 15px;
  padding: 14px 24px;
  min-height: 48px;
  border-radius: 8px;
  background: transparent;
  color: #0F172A;
  border: 1px solid #0F172A;
  cursor: pointer;
  transition: background 200ms;
}

.btn-secondary:hover {
  background: #F8FAFC;
}

.btn-secondary:focus-visible {
  outline: 3px solid rgba(15, 23, 42, 0.5);
  outline-offset: 2px;
}
```

Pattern: secondary è muted (no bg accent), solo border + transparent.

### Pattern C — CTA mobile sticky

```css
.sticky-mobile-cta {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  box-shadow: 0 -4px 16px rgba(15, 23, 42, 0.08);
}

.sticky-mobile-cta .btn-cta {
  width: 100%;
  min-height: 56px;
}

@media (min-width: 769px) {
  .sticky-mobile-cta { display: none; }
}
```

Pattern: solo mobile, fixed bottom, full-width, safe-area inset.

### Pattern D — Mobile sticky auto-hide su footer

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const stickyCta = document.querySelector('.sticky-mobile-cta');
    if (entry.target.classList.contains('footer')) {
      stickyCta.style.opacity = entry.isIntersecting ? '0' : '1';
      stickyCta.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
    }
  });
});
document.querySelectorAll('.footer').forEach(el => observer.observe(el));
```

Pattern: footer visibile → sticky CTA nascosta. Footer coperto → sticky CTA visibile.

### Pattern E — 4-stati visual accessibili

Pattern canonico:
- Default: bg accent + white text + 48px height.
- Hover: bg accent-hover (darker) + inset shadow.
- Active: transform 0.98 + bg accent-hover.
- Focus-visible: outline 3px solid rgba(accent, 0.55) + offset 3px.
- Disabled: opacity 0.55 + cursor not-allowed + no transform.

### Pattern F — CTA replica mnemonica

CTA replicata 4-5 volte nella pagina:
1. **Hero**: button full-width 200px max.
2. **Final mid-section**: button 200px (mid-page).
3. **Pricing tier centrale**: button 100% width card.
4. **Footer**: button replica mnemonica.
5. **Mobile sticky**: bottom-fixed button.

Tutte con copy identico. Pattern: nessuna variazione copy tra CTA repliche.

### Pattern G — CTA con arrow icon ("→")

CTA con arrow icon "→" inline per affordance visiva:
```html
<button class="btn-cta" aria-label="Inizia la tua prima simulazione">
  Inizia la tua prima simulazione
  <span aria-hidden="true" class="cta-arrow">→</span>
</button>
```

Pattern: arrow inline, screen reader ignores.

### Pattern H — CTA con tier-specific label (Stripe pattern)

Pattern Stripe-like: CTA label è specifico al tier.
- Free: "Inizia la tua prima simulazione" → register form.
- Pro: "Sblocca Pro · €14,99/mese" → register form pre-popolato plan=pro.
- Master: "Attiva Master PA · €29,99/mese" → register form pre-popolato plan=master.

Mai "Get Pro" generic. Sempre specific.

### Pattern I — CTA status dopo click

Post-click feedback:
1. **Click → loading state**: button → spinner + "Caricamento..." + disabled.
2. **Loading → success/error**: page change o toast.
3. **Toast auto-dismiss**: 1.5s success, persistent warning/error.

Pattern: feedback immediato per utente non si senta "abbandonato".

### Pattern J — CTA arrow micro-interaction

```css
.cta-arrow {
  display: inline-block;
  margin-left: 4px;
  transition: transform 200ms ease-out;
}

.btn-cta:hover .cta-arrow {
  transform: translateX(4px);
}
```

Pattern: arrow si muove 4px a destra al hover. Sub-affordance.

---

## Checklist

- [ ] CTA primary: 1 per viewport, isolata cromaticamente
- [ ] CTA secondary: max 1 per viewport, ghost style
- [ ] Copy CTA verb d'azione specifico, ≤5 parole
- [ ] Copy CTA "Inizia la tua prima simulazione" / "Sblocca Pro a €14,99/mese" / etc.
- [ ] Nessun "Get started" / "Submit" / "Click here" / "Scopri di più"
- [ ] aria-label su ogni button
- [ ] 4 stati canonici (default/hover/active/focus-visible/disabled)
- [ ] Hover state same hue darker (-10%) + inset shadow
- [ ] Active state scale 0.98
- [ ] Focus-visible outline ≥3px + offset (keyboard accessibility)
- [ ] Disabled state opacity 0.55 + cursor not-allowed
- [ ] Mobile sticky CTA bottom + safe-area-inset-bottom (iOS)
- [ ] Mobile sticky CTA auto-hide su footer
- [ ] CTA replica 4-5 volte in pagina
- [ ] Post-click feedback (loading → success/error toast)
- [ ] CTA copy specifico al tier (Free vs Pro vs Master)
- [ ] Nessun mix CTA primary + secondary stessa importanza

---

## Decisioni progettuali

### Da CTA multi-accent a CTA isolata

Scelta: CTA primary usa `var(--color-accent)` #2563EB. Tutto il resto in neutri. Mai 5+ elementi con stesso colore brillante.

### Da "Get started" a "Inizia la tua prima simulazione"

Scelta: tutti i CTA copy = verbo d'azione specifico + benefit specifico. Mai generic.

### Da scale-transform a bg-shift + inset shadow

Scelta: hover state = bg darker + box-shadow inset (no transform). Active state = scale 0.98 ONLY.

### Da footer overlap a auto-hide su footer

Scelta: mobile sticky CTA auto-hide when footer visible (IntersectionObserver).

### Da CTA without feedback to CTA with feedback

Scelta: dopo click → loading → success/error toast. Mai silent CTA.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| 1 sola CTA primary per viewport | Hero + pricing + footer | ✅ applicato |
| 1 sola CTA secondary max per viewport | "Scopri i 4 step ↓" hero | ✅ applicato |
| CTA copy specifico (verb + benefit) | "Inizia la tua prima simulazione" | ✅ applicato |
| aria-label esplicito | Tutti button hanno aria-label | ✅ applicato |
| 4 stati canonici CSS | Default + hover + active + focus-visible | ✅ applicato |
| Hover bg darker + shadow | #1D4ED8 + inset rgba | ✅ applicato |
| Active scale 0.98 | Transform in :active | ✅ applicato |
| Focus-visible ring outline | 3px solid rgba(accent, 0.55) + 3px offset | ✅ applicato |
| Disabled opacity 0.55 | :disabled state | ✅ applicato |
| Mobile sticky bottom-sticky | Fixed bottom + safe-area-inset | ✅ applicato |
| Mobile sticky auto-hide su footer | IntersectionObserver JS | ⏳ in progress |
| CTA replica 4-5 volte | Hero + mid + pricing + footer | ✅ applicato |
| Post-click feedback | Loading + toast success | ⏳ in progress |
| CTA copy specifico al tier | Free vs Pro pre-popolato plan=free/pro | ⏳ post-Stripe |

**Gap**: post-Stripe tier-specific CTA + post-click feedback implementation.

---

## Vincoli

- ❌ **NO** CTA primary "sparsa" senza isolamento cromatico.
- ❌ **NO** CTA copy generic ("Get started", "Submit").
- ❌ **NO** CTA >5 parole.
- ❌ **NO** aria-label mancante.
- ❌ **NO** 2+ CTA primary stessa importanza visiva.
- ❌ **NO** hover state senza feedback.
- ❌ **NO** active state scale >1.05 (anti-pattern movement).
- ❌ **NO** focus-visible outline rimosso.
- ❌ **NO** mobile sticky senza safe-area-inset.
- ❌ **NO** mobile sticky che copre footer.
- ❌ **NO** destructive CTA senza modal confirmation.
- ❌ **NO** CTA su shadow/background confuso (no contrast).
- ❌ **NO** CTA variation copy tra repliche (deve essere identico).

---

*Continua in `14_trust_building.md`.*
