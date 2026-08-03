# Auth Motion — ConcorsoAI

> Architettura del movimento del sistema di autenticazione.
> Non "aggiungiamo animazioni": ogni animazione ha evento, durata, easing,
> delay, stato di partenza/arrivo e condizione di NON partenza.
> Principio guida: **le animazioni si sentono, non si vedono**.
> Durata 120-220ms (max 320ms per gli ingressi di pannello), easing
> `cubic-bezier(0.16, 1, 0.3, 1)` (--ease). Mai bounce, mai elastic, mai zoom.

---

## 1. Token di motion (coerenti con landing.css)

| Token | Valore | Uso |
|---|---|---|
| `--t-fast` | 120ms | micro-stati (hover, active, toggle) |
| `--t-base` | 200ms | stati persistenti (colore, bordo, fill) |
| `--ease` | `cubic-bezier(0.16, 1, 0.3, 1)` | easing unico (ease-out esponenziale) |
| `--t-enter` | 320ms | ingresso pannelli (fade-up) |
| `--t-underline` | 280ms | underline tab |
| shimmer | 1.4s linear infinite | skeleton (perceived performance) |
| live-pulse | 2.2s ease-in-out infinite | dot "Live" (respiro, non allarme) |
| breathe | 6s ease-in-out infinite | progress bar preview (impercettibile) |
| caret | 1s steps(1) infinite | cursore della domanda (blink reale) |
| indeterminate | 1.1s | barra busy 1px sotto il bottone |

**Regola d'oro**: ogni animazione con `infinite` è **non essenziale** e va
uccisa sotto `prefers-reduced-motion`. Già coperto dal blocco
`@media (prefers-reduced-motion: reduce)` di auth.css.

---

## 2. Specifica microinterazioni

### 2.1 Hover — bottone primario (btn-primary)
| Campo | Valore |
|---|---|
| Evento | `:hover` / `:focus-visible` |
| Durata | 200ms |
| Easing | `--ease` |
| Da → A | bg ink → trasparente; testo bg → ink; bordo resta ink |
| Quando NON parte | `:disabled` (opacity 0.45, nessun cambio) |
| Note | Il bottone si "svuota": pattern premium, mai glow |

### 2.2 Hover — freccia del bottone (btn-arrow)
| Campo | Valore |
|---|---|
| Evento | `:hover` del bottone |
| Durata | 200ms |
| Easing | `--ease` |
| Da → A | `translateX(0)` → `translateX(4px)` |
| Quando NON parte | reduced-motion (transition azzerata) |
| Note | 4px è appena percettibile: la freccia "indica" l'azione |

### 2.3 Active — pressione bottone
| Campo | Valore |
|---|---|
| Evento | `:active` |
| Durata | 120ms |
| Easing | lineare |
| Da → A | `scale(1)` → `scale(0.985)` |
| Quando NON parte | `:disabled` |
| Note | 1.5% di compressione: feedback tattile senza bounce |

### 2.4 Focus ring
| Campo | Valore |
|---|---|
| Evento | `:focus-visible` |
| Durata | istantaneo (outline, non animato) |
| Valore | `outline: 2px solid var(--ink); outline-offset: 2px` |
| Eccezione | `.field-input` ha ring dedicato (border ink + box-shadow 3px rgba 6%) — escluso dal globale per evitare il doppio indicatore |
| Quando NON parte | mouse-click (solo :focus-visible, mai :focus) |

### 2.5 Input — hover e focus
| Campo | Valore |
|---|---|
| Evento | `:hover` → bordo `--ink-faint`; `:focus` → bordo ink + ring |
| Durata | 200ms |
| Easing | `--ease` |
| Da → A | border-color + box-shadow |
| Errore | `[aria-invalid=true]`: bordo `--error` + ring terracotta 10% |
| Quando NON parte | nessuno (gli input devono sempre rispondere) |

### 2.6 Placeholder
| Campo | Valore |
|---|---|
| Evento | nessuno (statico) |
| Colore | `--ink-faint` |
| Note | **Nessuna animazione**: il placeholder non "galleggia" (pattern float-label vietato — rumore) |

### 2.7 Tab switch (Accedi ⇄ Registrati)
| Campo | Valore |
|---|---|
| Evento | click / ArrowLeft / ArrowRight |
| Durata underline | 280ms |
| Easing | `--ease` |
| Da → A | `scaleX(0)` → `scaleX(1)`, origine sinistra |
| Ingresso pannello | `auth-fade-up` 320ms: opacity 0→1, translateY(6px)→0 |
| Stagger | nessuno (un solo pannello alla volta) |
| Quando NON parte | reduced-motion (animation: none) |
| Note | il reflow forzato (`void p.offsetWidth`) riavvia l'animazione a ogni switch |

### 2.8 Submit — stato busy
| Campo | Valore |
|---|---|
| Evento | submit valido |
| Durata | 1.1s loop |
| Easing | `--ease` |
| Da → A | barra 1px: `translateX(-110%)` → `translateX(110%)` (indeterminata) |
| Label | "Accesso in corso…" / "Creazione account…" / "Invio…" |
| Quando NON parte | reduced-motion (opacity 0) |
| Note | mai spinner; il pattern è Linear/Stripe (barra sottile in basso) |

### 2.9 Strength meter
| Campo | Valore |
|---|---|
| Evento | input keystroke |
| Durata | 260ms |
| Easing | `--ease` |
| Da → A | `width 0→33→66→100%` + colore (error/warn/ok) |
| Quando NON parte | password vuota (fill a 0, etichetta statica) |
| Note | la transizione di width rende il "giudizio" morbido, mai a scatti |

### 2.10 Toggle password
| Campo | Valore |
|---|---|
| Evento | click |
| Durata | 120ms |
| Easing | lineare |
| Da → A | colore icona `--ink-faint` → `--ink` (+ bg `--bg-2` su hover) |
| Note | nessun flip dell'icona: il cambio type è istantaneo, la percezione è nel colore |

### 2.11 Google button
| Campo | Valore |
|---|---|
| Evento | hover / active |
| Durata | 200ms / 120ms |
| Easing | `--ease` |
| Da → A | bordo `--line-2` → `--ink-faint` + bg → #fff; active scale 0.985 |
| Note | niente animazione del logo G (rumore) |

### 2.12 Checkmark "email inviata" (round 42)
| Campo | Valore |
|---|---|
| Evento | ingresso del pannello sent |
| Durata | 320ms |
| Easing | `--ease` |
| Da → A | stroke `dashoffset` → 0 (il segno di spunta si "disegna") |
| Quando NON parte | reduced-motion (stroke pieno, nessuna animazione) |
| Note | feedback di successo del pannello sent; sobrio, 1 colpo, mai loop (il toast §2.17 è l'altro feedback di successo, contesto diverso) |

### 2.13 Skeleton shimmer (preview)
| Campo | Valore |
|---|---|
| Evento | ciclo preview (nuova domanda → "l'AI sta rispondendo") |
| Durata | 1.4s linear infinite per barra; delay 0.18/0.36/0.54s (cascata) |
| Easing | linear |
| Da → A | background-position 200% → -200% |
| Quando NON parte | reduced-motion; preview loop spento in JS (`REDUCED_MOTION`) |
| Note | le 4 barre hanno larghezze diverse (92/78/65/86%) → niente metronomo |

### 2.14 Live dot (preview)
| Campo | Valore |
|---|---|
| Evento | continuo |
| Durata | 2.2s ease-in-out infinite |
| Da → A | opacity 1→0.45 + scale 1→0.92 |
| Quando NON parte | reduced-motion |
| Note | "respiro" da app viva, non allarme lampeggiante |

### 2.15 Progress bar preview
| Campo | Valore |
|---|---|
| Evento | continuo |
| Durata | 6s ease-in-out infinite |
| Da → A | width 74% ↔ 77% |
| Quando NON parte | reduced-motion |
| Note | ±3% è impercettibile se non guardato: segnala "in corso" senza agitazione |

### 2.16 Caret (domanda preview)
| Campo | Valore |
|---|---|
| Evento | continuo |
| Durata | 1s `steps(1)` infinite |
| Da → A | opacity 0.85 ↔ 0 |
| Quando NON parte | reduced-motion (fisso a 0.85) |
| Note | blink reale del cursore, non easing |

### 2.17 Toast
| Campo | Valore |
|---|---|
| Evento | azione completata (es. reset ok, resend ok) |
| Durata | 220ms |
| Easing | `--ease` |
| Da → A | translateY(8px)+opacity 0 → 0+1; esce in 220ms; auto-remove |
| Auto-dismiss | 3.2s |
| Quando NON parte | nessuno (il toast è feedback necessario) |
| Note | bottom center, `role=status`, aria-live polite |

### 2.18 Error box globale
| Campo | Valore |
|---|---|
| Evento | errore auth |
| Durata | nessuna animazione di ingresso (display block) |
| Auto-dismiss | 6s (timer) |
| Note | niente shake della pagina: il box appare, il focus resta nel campo |

### 2.19 Error field inline
| Campo | Valore |
|---|---|
| Evento | blur / submit fallito |
| Durata | nessuna animazione (apparizione istantanea) |
| Note | **niente shake** (shake = ansia + AI-slop). L'errore è testo + bordo, basta |

---

## 3. Quando NON animare (regole dure)

1. **Errori**: mai shake, mai flash rosso, mai pulse. L'errore è informazione, non spettacolo.
2. **Placeholder**: mai float-label.
3. **Logo/brand**: mai animazioni del logo in auth (la landing non le ha).
4. **Conferma di successo**: una sola (checkmark), mai confetti/particelle.
5. **Scroll**: nessun parallasse, nessun reveal legato allo scroll in auth (pagina corta, niente da rivelare).
6. **Hover del tab inattivo**: solo colore (mai grow/bounce).
7. **Sotto `prefers-reduced-motion`**: tutte le animation/transition azzerate (già in auth.css, blocco finale).

---

## 4. Mappa implementazione (round 42)

| Microinterazione | Stato round 41 | Azione round 42 |
|---|---|---|
| Hover/active/focus bottoni e input | ✅ presente | nessuna |
| Tab underline + fade-up pannello | ✅ presente | nessuna |
| Strength meter 260ms | ✅ presente | nessuna |
| Skeleton shimmer + stagger | ✅ presente | nessuna |
| Live dot / breathe / caret | ✅ presente | nessuna |
| Busy bar 1px | ✅ presente | nessuna |
| Toast | ✅ presente | nessuna |
| **Checkmark "disegnata"** | ❌ mancante | **aggiungere** (solo pannello sent) |
| **Shake su errore** | ✅ volutamente assente | **confermare assente** |

## 5. Fonti

- `md/ui-ux-master.md` — §motion design (timing, easing, reduced-motion).
- NN/g — perceived performance (skeleton), feedback immediato.
- Pattern osservati: Linear, Stripe, Raycast (barra 1px, zero bounce, checkmark sobrio).
- Fitts/Hick's Law via `auth-research.md` (feedback non deve rallentare l'azione).
