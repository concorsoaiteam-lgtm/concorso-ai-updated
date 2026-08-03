# Auth Performance — ConcorsoAI

> Analisi del percorso critico della pagina `/auth`. Obiettivo: la pagina più
> veloce possibile, zero layout shift, zero render-blocking evitabile.
> Principio: **l'auth non deve mai "pensare"** — percezione di velocità
> (skeleton, feedback istantaneo) conta quanto i byte.

---

## 1. Percorso critico attuale

| Risorsa | Dimensione | Nota |
|---|---|---|
| `auth.html` | ~11 KB (testo) | pronto al primo byte |
| `css/auth.css` | ~12 KB | render-blocking ma piccolo e locale |
| Font Inter (bunny.net) | 3 pesi, `display=swap` | non-blocking grazie a swap |
| `@supabase/supabase-js` UMD | **~211 KB** (non min? vedi §3) | il peso dominante |
| `js/telemetry.js` | ~1 KB | |
| `js/auth.js` | ~12 KB | |

**Ordine di caricamento**: HTML → CSS (blocking) → font (swap) → supabase.js
→ telemetry → auth.js. Tutti gli script a fine `body`: il DOM è pronto prima
dell'esecuzione, nessun `defer` necessario (ma innocuo).

---

## 2. Cosa è già ottimizzato (round 40-41)

1. **`display=swap`** sul font — il testo appare subito con fallback, niente FOIT.
2. **`preconnect` a fonts.bunny.net** — la handshake TLS parte prima della CSS.
3. **Script a fine body** — niente blocking del parsing.
4. **`min-height` stabili** nella preview (`preview-q-text` 3.1em, `preview-feedback` 96px) → **zero layout shift** quando la domanda cambia o lo skeleton diventa testo.
5. **Skeleton con shimmer** — perceived performance (NN/g): l'attesa della "risposta AI" è strutturata, non vuota.
6. **Nessuna immagine** → nessun LCP pesante: LCP = titolo o bottone (testo).
7. **CSP stretta su /auth** — blocca richieste impreviste (anche a livello di performance: niente tracker random).
8. **`font-variant-numeric: tabular-nums`** sulle cifre (progress, confidence, stats) → i numeri non ballano durante gli aggiornamenti (niente reflow orizzontale).

---

## 3. Interventi round 42

### 3.1 Pinnare il CDN Supabase a una versione esatta
- **Oggi**: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js`
- **Problema**: `@2` è un tag mobile → jsdelivr lo serve con cache più corta e
  un futuro `2.x` potrebbe cambiare comportamento silenziosamente (build non
  deterministica).
- **Fix**: `@supabase/supabase-js@2.112.0/dist/umd/supabase.min.js` — versione
  esatta verificata (200, 211062 byte). Cache immutabile, build riproducibile.
- **Impatto**: determinismo + cache; il file min è equivalente (già minificato).

### 3.2 Doppio `preload` della CSS? No.
- La CSS è piccola (~12 KB) e unica: `preload` aggiungerebbe una seconda
  richiesta. **Deciso: non fare.**

### 3.3 Inline del CSS critico? No.
- Il form (sopra la piega) usa quasi tutta la CSS. Lo split critico/non-critico
  non ripaga su una pagina così piccola. **Deciso: non fare.** Documentato
  come opzione se la pagina crescerà.

### 3.4 `loading="lazy"`? Nessuna immagine. N/A.
### 3.5 Hydration? Nessun framework. N/A.
### 3.6 `defer` sugli script? A fine body è equivalente. Nessun cambio.

---

## 4. Metriche target

| Metrica | Target | Come misuro |
|---|---|---|
| LCP | < 1.2s (3G) | Lighthouse / WebPageTest |
| CLS | 0 | nessuna immagine, min-height stabili |
| INP | < 200ms | nessun listener pesante; le validazioni sono O(1) |
| TBT | < 100ms | il JS gira in ~5ms (supabase.js è l'unico peso) |
| FCP | < 1s | CSS locale + font swap |

---

## 5. Perceived performance (non-tecnica)

1. **Skeleton prima della risposta** → l'attesa diventa "l'AI sta pensando",
   non "il sito è lento".
2. **Busy bar 1px sul bottone** → feedback immediato al submit, nessuna
   "pagina morta".
3. **Autofocus sull'email** → il primo keystroke possibile non richiede click.
4. **Tabs senza round-trip** → il passaggio login/register è istantaneo (zero
   rete), con fade 320ms che maschera il cambio pannello.
5. **Errori inline al blur** → l'utente corregge senza attendere il submit.

---

## 6. Rischi e note

| Rischio | Impatto | Mitigazione |
|---|---|---|
| CDN supabase.js giù | auth non funzionante | `guardSupabase()` → errore chiaro; il form resta usabile visivamente. Fallback offline = fuori scope (richiederebbe vendoring) |
| Font bunny giù | fallback system-ui | `font-family` con stack completo |
| 3G reale | ~211 KB di SDK dominano | Vendoring + code-split NON ripagano qui; valutare `supabase-js` v2 leggero solo se la dashboard userà più SDK |
| Aggiornamento minor di supabase-js | comportamento cambiato | pinning esatto (§3.1) |

---

## 7. Deciso di NON fare (con motivo)

- **Vendoring di supabase.js**: +211 KB sul nostro dominio invece del CDN
  (che è serverless edge e cacheato). Il CDN è già il posto giusto.
- **Font subsetting**: Inter ha solo 3 pesi caricati, il subsetting
  risparmierebbe poco su una pagina auth.
- **Prefetch della dashboard**: il redirect post-login è immediato (stessa
  origin), il prefetch di `/dashboard.html` è lecito ma aggiunge una richiesta
  per ogni visitatore del form. **Valutare** con dati di conversione reali.
- **Service worker / offline shell**: overkill per una landing + auth statiche.

---

## 8. Fonti

- NN/g — perceived performance, skeleton screens.
- web.dev — CLS, LCP, INP (Core Web Vitals).
- jsDelivr — cache immutabile con versioni esatte.
- `md/ui-ux-master.md` — §performance (fonte interna).
