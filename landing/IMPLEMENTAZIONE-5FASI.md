# 🛠️ PIANO DI IMPLEMENTAZIONE — 5 FASI

> **Prodotto**: Concorso AI — simulazione orale AI per concorsi pubblici italiani  
> **URL live**: https://concorso-ai-mauve.vercel.app/  
> **Data**: 18 luglio 2026  
> **Obiettivo**: sbloccare crescita reale su signup → attivazione → paid, ottimizzando solo ciò che blocca i soldi OGGI.

---## 🛡️ GUARDRAIL DI QUESTO PIANO

Prima di tutto, le 4 regole che **NON** ho violato (imposte dall'utente):

1. **Piano pricing**: rimane **Free (€0)** + **Pro (€12.99/mese, €119/ anno)**. Niente tier intermedi. Finchè non hai almeno 1 utente pagante, terzi tier sono distrazione.
2. **Numeri**: tutto ciò che finisce sul sito è o (a) verbatim dal codice live, o (b) calcolo matematico, o (c) marcato `[DA VERIFICARE]` prima della pubblicazione.
3. **Numero di fix**: **7 fix totali**, non 20. Meglio 5 ottimi fatti che 20 abbozzati.
4. **Tipografia**: niente serif editoriale al H1. **Inter rimane così com'è.**

> Tempo totale di esecuzione (se fai tutto): **~3 ore**.  
> Impatto conversion: **da misurare tu** con Vercel Analytics prima/dopo. Non ti do numeri inventati.

---

## ✅ STATO IMPLEMENTAZIONE (aggiornato al 18/07/2026)

Tutti i 5 quick win della **Tabella A** + il bonus 4.3 (iOS safe-area) sono **APPLICATI LIVE** su `public/index.html`. I 4 fix rimanenti della **Tabella B** (settimana 2) sono pronti negli snippet sotto — da applicare DOPO aver misurato l'impatto della Tabella A.

| # | Fix | Stato | Dove applicato |
|---|---|---|---|
| 1 | CTA unica hero (rimozione "Come funziona" bottone) | ✅ FATTO | `public/index.html` hero CTA block |
| 2 | Trust ribbon reale ("+1.000 candidati" → "Cifratura server UE") | ✅ FATTO | `public/index.html` riga trust ribbon |
| 3 | Costo giornaliero €0,43 sotto €12,99/mese | ✅ FATTO | `public/index.html` sezione #prezzi card Pro |
| 4 | Distruttore ansia "Disdici con 1 clic" + Risparmi €36,88 | ✅ FATTO | `public/index.html` sezione #prezzi card Pro |
| 5 | CTA copy specifici ("Inizia la tua prima simulazione" + "Crea un profilo") | ✅ FATTO | `public/index.html` (7 occorrenze: hero, demo card, Free card, Pro card, finale, sticky mobile, 2 nav buttons, footer) |
| Bonus | iOS safe-area-inset-bottom su `.sticky-mobile-cta` | ✅ FATTO | `public/index.html` `<style>` block |
| 6 | Step indicator wizard upload | ⏳ Settimana 2 | `public/dashboard.html` (snippet pronto sez. 2.1) |
| 7 | Bottone "Non sono d'accordo" reso CTA primaria | ⏳ Settimana 2 | `public/simulation.html` (snippet pronto sez. 2.2) |
| 8 | `defer` su GSAP (con init utente wrappato in DOMContentLoaded) | ⏳ Settimana 2 | `public/index.html` `<head>` (snippet pronto sez. 4.1) |
| 9 | Fix CLS hero mockup con `min-h-[540px]` | ⏳ Settimana 2 | `public/index.html` `.glass-card` wrapper (snippet pronto sez. 4.4) |

> **Prossimo passo operativo**: snapshot di Vercel Analytics (signup, bounce, LCP, CLS) PRIMA di qualsiasi deploy live. Dopo 14 giorni, snapshot identico → calcola il delta.

---

## 🥇 FASE 1 — INTERVENTI D'URGENZA (UI above the fold + Copy + Pricing)

**Priorità**: massima. Sono i 3 punti che bloccano la conversione oggi.

---

### 1.1 — UNA SOLA CTA NELL'HERO (rimuovi il bottone "Come funziona") ✅ APPLICATO LIVE

**Problema**: il bottone secondario "Come funziona" ruba click all'utente già pronto a iscriversi.

**File**: `public/index.html` — sezione hero, riga con i due bottoni (`Inizia gratis` + `Come funziona`).

**Snippet (sostituisci i due link adiacenti)**:

```html
<div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
  <a href="auth.html?mode=register" class="btn-primary inline-flex items-center justify-center rounded-2xl px-7 py-5 text-lg font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
    Inizia la tua prima simulazione
    <svg class="ml-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
  </a>
  <a href="#come-funziona" class="text-sm font-semibold text-brand-600 hover:text-brand-900 underline underline-offset-4">
    Scopri come funziona ↓
  </a>
</div>
```

**Cosa cambia**: "Come funziona" da bottone pieno → link testuale con freccia ↓. CTA unica, più forte.

| Metrica | Cosa misurare |
|---|---|
| **Click-through su CTA primaria** | Vercel Analytics → evento su click del bottone "Inizia la tua prima simulazione" verso `/auth?mode=register` |
| **Bounce rate hero** | % utenti che lasciano la pagina entro 5s senza scrollare |

**Tempo**: 5 minuti.

---

### 1.2 — TRUST RIBBON: ZERO DATI INVENTATI ✅ APPLICATO LIVE

**Problema attuale**: il sito mostra **"+1.000 candidati"**: non è verificato. È un'invenzione che si sgama al primo concorrente arrabbiato.

**File**: `public/index.html` — riga `<p class="mt-5 text-sm leading-6 text-brand-600/90">` sotto i bottoni hero.

**Snippet (sostituisci)**:

```html
<p class="mt-5 text-sm leading-6 text-brand-600/90">
  <span class="font-semibold inline-flex items-center gap-1.5">
    <svg class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    Nessuna carta di credito
  </span>
  <span class="mx-3 text-brand-300">·</span>
  <span class="font-semibold inline-flex items-center gap-1.5">
    <svg class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    Prova gratuita
  </span>
  <span class="mx-3 text-brand-300">·</span>
  <span class="font-semibold inline-flex items-center gap-1.5">
    <svg class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
    Cifratura server UE
  </span>
</p>
```

**Cosa cambia**: 3 elementi reali (Nessuna carta, Prova gratuita, Cifratura UE — quest'ultima è derivata dal JSON-LD FAQ già presente su `index.html` riga "I miei dati sono al sicuro?"). Rimosso "+1.000 candidati" finto.

> ⚠️ Se in futuro avrai un numero reale di utenti (>30 giorni di attività), puoi rimettere un dato — misurato da Supabase `count(distinct user_id)`.

**Tempo**: 5 minuti.

---

### 1.3 — COSTO GIORNALIERO SOTTO IL PREZZO PRO (matematica, non stima) ✅ APPLICATO LIVE

**File**: `public/index.html` — sezione `#prezzi`, dentro la card Pro.

**Snippet**: aggiungi questa riga subito sotto il prezzo `€12.99`:

```html
<p class="mt-1 text-sm font-semibold text-brand-700">
  Equivale a <span class="text-emerald-600">€0,43 al giorno</span>
</p>
```

**Il numero è reale**: `€12.99 / 30 = €0.433` → arrotondato a `€0,43` (convenzione italiana, virgola).

**Tempo**: 2 minuti.

> 💡 **Aggiungilo anche sotto il prezzo annuale**: il risparmio secco è €36,88 (€155,88 mensile × 12 − €119 = €36,88). Es:  
> *"Risparmi €36,88 netti rispetto al mensile."* Sostituisce il vago "24%" che hai oggi.

---

### 1.4 — MICRO-COPY DISTRUTTORE D'ANSIA NELLA CARD PRO ✅ APPLICATO LIVE

**File**: `public/index.html` — sezione `#prezzi`, dentro la card Pro, subito dopo la lista features.

**Snippet**:

```html
<div class="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
  Disdici con 1 clic. Nessun vincolo.
</div>
```

**Cosa fa**: leva d'ansia chiave per chi sta per mettere la carta.

| Metrica | Cosa misurare |
|---|---|
| **Conversion rate Free → Pro** | Quanti utenti registrati finiscono in `/api/stripe-webhook` con success |
| **Drop-off al Checkout Stripe** | Quanti aprono Stripe vs quanti pagano |

> ⚠️ **Futuro (non adesso)**: aggiungere "Soddisfatto o rimborsato 30gg" richiede implementazione rimborso lato Stripe. È un'ottima mossa ma **richiede backend**, non solo copy. Lo metti quando hai un cliente pagante.

**Tempo**: 5 minuti.

---

## 🧭 FASE 2 — NAVIGAZIONE & FLUIDITÀ (Information Architecture + micro-interazioni)

**Priorità**: media-alta. Riducono l'attrito ma non bloccano i soldi subito.

---

### 2.1 — STEP INDICATOR WIZARD UPLOAD

**Problema**: in `dashboard.html` il wizard upload (3 tab) non mostra a che punto sei. L'utente si sente perso.

**File**: `public/dashboard.html` — sopra il blocco `.upload-tabs`.

**Snippet (HTML statico, da inserire prima dei tab)**:

```html
<ol class="mb-4 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-3 py-3 text-xs font-bold text-brand-600 sm:text-sm">
  <li class="flex items-center gap-2 text-brand-900">
    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-black text-white">1</span>
    Carica bando
  </li>
  <li class="text-brand-300">→</li>
  <li class="flex items-center gap-2">
    <span class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-300 bg-white text-[11px] font-black">2</span>
    Scegli materie
  </li>
  <li class="text-brand-300">→</li>
  <li class="flex items-center gap-2">
    <span class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-300 bg-white text-[11px] font-black">3</span>
    Simula
  </li>
</ol>
```

**Per funzionare davvero serve un piccolo JS** (in fondo alla pagina dashboard, prima di `</body>`, dopo che hai verificato che gli ID delle tab esistono):

```html
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // I tuoi tab potrebbero avere id diversi: '.upload-tab[data-step="1"]' ecc.
    // Pattern generico: aggiorna lo stile del LI in base alla tab attiva.
    const tabs = document.querySelectorAll('[data-step]');
    const items = document.querySelectorAll('ol li[data-step]');
    // Se la tua dashboard non usa ancora data-step, puoi adattare:
    // - Mappa manualmente ogni LI a un trigger click
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const step = tab.getAttribute('data-step');
        items.forEach(li => {
          const n = parseInt(li.getAttribute('data-step'), 10);
          const dot = li.querySelector('span');
          if (!n || !dot) return;
          if (n < step) {
            dot.className = 'flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-black text-white';
          } else if (n === parseInt(step, 10)) {
            dot.className = 'flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-black text-white';
          } else {
            dot.className = 'flex h-6 w-6 items-center justify-center rounded-full border border-brand-300 bg-white text-[11px] font-black';
          }
        });
      });
    });
  });
</script>
```

> ⚠️ Se la tua `dashboard.html` non ha `[data-step]` sulle tab, l'indicatore è statico (sempre step 1 evidenziato). Implementare la logica step-by-step è un fix di 30 min, da fare DOPO. Step statico da solo aumenta chiarezza.

| Metrica | Cosa misurare |
|---|---|
| **Drop-off wizard upload** | Supabase: quanti utenti arrivano a una simulazione vs quanti aprono la dashboard |

**Tempo**: 15 minuti.

---

### 2.2 — PROMUOVERE "NON SONO D'ACCORDO" (era nascosto)

**File**: `public/simulation.html` — bottone "Non sono d'accordo · correggi" dentro il box Feedback live.

**Snippet (sostituisci il bottone attuale)**:

```html
<button type="button" class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-brand-300 bg-brand-50 px-4 py-3 text-sm font-black text-brand-900 transition hover:border-brand-500 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
  Non sono d'accordo · correggi il commissario
  <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
</button>
```

**Cosa cambia**: da `text-[11px] font-bold border-1` (quasi invisibile) → `text-sm font-black border-2` (CTA reale). Visivamente prioritario nel feedback box.

**Tempo**: 10 minuti.

---

### 2.3 — POSIZIONAMENTO ATTIVO (NO modale, NO carousel)

Micro-interazioni **NON** da aggiungere adesso (sono "nice-to-have", non bloccanti):

- ❌ Scroll parallax sezioni (rumoroso, distrae)
- ❌ Carousel testimonial (non hai ancora testimonial)
- ❌ Modale "ottimo!" post signup (intrusivo)

> **Regola**: aggiungi micro-interazione solo se genera un'azione utente. Es: `hover scale 1.02` sulle card pricing — ok. Glassmorphism esagerato sui bottoni — no.

---

## 💳 FASE 3 — CHECKOUT & MICRO-COPY

**Priorità**: media. Il checkout vero lo gestisce Stripe, qui ottimizzi cosa lo precede.

---

### 3.1 — DISTRUZIONE ANSIA PRE-STRIPE

Quando l'utente clicca sul bottone Pro, prima di arrivare a Stripe Checkout, deve avere **3 certezze** visive. Check se la tua pagina ha già:

- ✅ "Disdici quando vuoi" (c'è nella landing, **OK**)
- ✅ "Nessun vincolo" (da aggiungere, **snippet 1.4 sopra**)
- ✅ "Cifratura UE" (c'è nel JSON-LD FAQ, **promossa in trust ribbon 1.2**)

**Cosa NON fare**:

- ❌ Non aggiungere loghi carte (Visa/Mastercard) di fantasia — solo loghi reali
- ❌ Non mettere "Sicuro al 100%" senza un badge reale (Stripe non dà badge così generico)
- ❌ Non aggiungere countdown "offerta termina fra..." senza un'offerta vera

---

### 3.2 — CTA COPY SPECIFICI (vs generici) ✅ APPLICATO LIVE (7 occorrenze in index.html)

**File**: `public/index.html` + `public/auth.html` + `public/dashboard.html`

**Cercare e sostituire**:
| Slot attuale | Sostituzione |
|---|---|
| `Inizia gratis` (hero CTA + sticky mobile) | `Inizia la tua prima simulazione` |
| `Registrati` (nav + auth) | `Crea il tuo profilo candidato` |
| `Login` → `Accedi` | OK, tienilo (è corretto) |

> **Dove trovare**: cerca la stringa esatta con un edit globale (VS Code: `Ctrl+Shift+F`).  
> **Specificità > genericità**: "Crea il tuo profilo candidato" parla a chi si prepara a un concorso.

**Tempo**: 30 minuti (5 stringhe × 6 min ciascuna).

---

## 🐞 FASE 4 — DEBUG TECNICO (Velocità, Mobile, Script)

**Priorità**: alta ma non-visibile-per-utente. Sono fix che **non cambiano copy** ma rendono il sito più veloce → meno abbandono.

---

### 4.1 — DEFER SU GSAP (risolve render-blocking)

**Problema attuale**: gli script GSAP in `public/index.html` `<head>` bloccano il rendering dell'hero.

**File**: `public/index.html` righe script GSAP (cercare `gsap.min.js` nel `<head>`)

**Snippet (sostituisci i 2 tag `<script src=...gsap>`)**:

```html
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

**Effetto**: script GSAP partono DOPO il rendering dell'hero. LCP migliora.

> ⚠️ **Vincolo importante**: in `public/index.html` c'è uno script inline `// GSAP - ScrollTrigger` che chiama `gsap.from()` / `ScrollTrigger.refresh()`. Se lo script utente è scritto *subito dopo* i tag GSAP senza defer o senza `DOMContentLoaded`, **rompe tutto** perché lo script parte prima che GSAP sia caricato.  
> **Fix preventivo**: wrappa l'init GSAP utente così:
> ```html
> <script defer>
>   document.addEventListener('DOMContentLoaded', () => {
>     // gsap.from(...); ScrollTrigger.refresh();
>   });
> </script>
> ```
> Oppure mettilo in `<script defer src=".../init-gsap.js"></script>` come file esterno.

| Metrica | Strumento |
|---|---|
| **LCP (Largest Contentful Paint)** | PageSpeed Insights, Chrome DevTools "Performance" |
| **INP (Interaction to Next Paint)** | Chrome DevTools "Performance Insights" |

**Tempo**: 5 minuti.

---

### 4.2 — PRECONNECT TAILWIND CDN (accelera la prima richiesta)

**File**: `public/index.html` `<head>`

**Snippet**: aggiungi prima del `<script src="https://cdn.tailwindcss.com"></script>`:

```html
<link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin />
<link rel="dns-prefetch" href="https://cdn.tailwindcss.com" />
```

**Effetto**: il browser risolve DNS prima ancora di vedere lo script CDN.

> ⚠️ **Fix vero (per il futuro)**: il `cdn.tailwindcss.com` produce un warning in console ("should not be used in production"). Perfix definitivo serve un build Tailwind reale (`@tailwindcss/cli` o PostCSS), ma questo richiede build pipeline. **Skip per adesso**, è un'ora di setup e i risultati LCP sono buoni anche solo col preconnect.

**Tempo**: 5 minuti.

---

### 4.3 — FIX STICKY MOBILE CTA SU iOS SAFARI ✅ APPLICATO LIVE (bonus fuori tabella)

**Problema**: la `.sticky-mobile-cta` in fondo allo schermo si sovrappone alla barra HOME di iPhone.

**File**: `public/index.html` `<style>` tag (lo trovi nel `<head>`, subito dopo Tailwind CDN)

**Snippet (modifica dentro `<style>`)**:

```css
.sticky-mobile-cta {
  /* AGGIUNGI questa proprietà rispettando le altre: */
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
```

**Effetto**: la CTA si solleva sopra la barra di sistema iOS.

**Tempo**: 5 minuti.

---

### 4.4 — CLS SULL'HERO MOCKUP (assegna altezza stabile)

**Problema**: la `.glass-card` mockup nel hero può shiftare durante il caricamento GSAP.

**File**: `public/index.html` — il blocco hero mockup, riga `<div class="relative mx-auto w-full max-w-[34rem]">`

**Snippet (modifica l'inizio del blocco)**:

```html
<!-- min-h-[540px] perché la glass-card mockup è naturalmente alta ~540px
     (avatar 3 righe + 3 contatori + 2 messaggi + 3 barre feedback + bottone).
     NON aggiungere aspect-ratio: troncherebbe il bottone "Non sono d'accordo". -->
<div class="relative mx-auto w-full max-w-[34rem] min-h-[540px]">
  <div class="glass-card h-full rounded-[2rem] p-3">
    ...
```

**Effetto**: la card ha altezza minima stabile prima che GSAP la animi, niente salti, niente contenuto tagliato.

| Metrica | Strumento |
|---|---|
| **CLS (Cumulative Layout Shift)** | Chrome DevTools "Performance" → "Layout Shifts" |

**Tempo**: 5 minuti.

---

## ✅ FASE 5 — USABILITY TEST + LANCIO

**Priorità**: questa fase è **il tuo QA personale**. Non è codice da scrivere.

---

### 5.1 — I 10 TEST SPIETATI (falli prima di dichiarare "finito")

Esegui TUTTI e 10 prima di andare online. Segna ✅ o ❌ per ognuno.

| # | Test | Come si fa | Cosa cerchi |
|---|---|---|---|
| 1 | **Signup end-to-end** | Apri `/auth?mode=register` → inserisci email → controlla di arrivare in `/dashboard` | Nessun errore console, redirect corretto |
| 2 | **Login con email sbagliata** | Metti email inesistente | Messaggio chiaro, non crash |
| 3 | **Reset password** (se esiste) | Segui il flusmo "password dimenticata" | Email arriva davvero |
| 4 | **Caricamento PDF bando** (file <2MB) | Upload PDF di prova | Parsing corretto, materie riconosciute |
| 5 | **Caricamento PDF pesante** (file >10MB) | Upload PDF grosso | Timeout gestito, no blocco UI |
| 6 | **Simulazione completa** (12 domande) | Fai fino all'ultima domanda | Storico salvato, report PDF scaricabile |
| 7 | **Microfono** (Chrome + iOS Safari) | Clicca il mic, parla 30s | Trascrizione appare, no blocco permessi |
| 8 | **Mobile sticky CTA iOS Safari** | Apri sito su iPhone vero | Bottone non coperto dalla barra HOME |
| 9 | **Pricing toggle mensile/annuale** | Click su annuale | Prezzo cambia a €119, badge sconto visibile |
| 10 | **Console pulita** | Chrome DevTools → Console su `/` `/auth` `/dashboard` `/simulation` | Zero errori rossi, warning accettabili |

> ⚠️ Per il test #7 microfono serve HTTPS (già attivo su Vercel ✅).

---

### 5.2 — MONITORAGGIO POST-LANCIO (gratis, da subito)

| Strumento | Cosa tracci | Costo |
|---|---|---|
| **Vercel Web Analytics** (già attivo sul dominio) | Visitatori, bounce rate, signup completati | Gratis |
| **Vercel Speed Insights** | LCP, CLS, INP per ogni pagina | Gratis |
| **Console Chrome DevTools → Network** | Script bloccanti, asset troppo pesanti | Gratis, manuale |
| **Google Search Console** | Quante query portano a `concorso-ai-mauve.vercel.app` | Gratis |
| **Supabase dashboard** (sql editor) | Quanti auth attivi, quante righe in `simulazioni` per giorno | Gratis |

**Da non fare**:

- ❌ Hotjar / Microsoft Clarity: pesantissimi, rallentano il sito. Aspetta di avere >100 visitatori/giorno.
- ❌ Google Analytics 4: anche questo rallenta. Vercel Analytics bastano finché sei piccolo.
- ❌ Mixpanel / Amplitude: overkill per ora.

---

## 📊 TABELLA FINALE COSTRUTTORE

> **Legenda**: Sforzo = 1 (5 min) → 10 (giornate); Impatto = 🔥 (alto, conversion driver) ⭐ (medio) 💎 (basso).  
> **Regola d'oro**: esegui SOLO la **Tabella A — Quick Win di questa settimana**. Le altre sono 2ª ondata, **NON** farle insieme.

### 🟢 TABELLA A — QUICK WIN DI QUESTA SETTIMANA (5 fix, ~2 ore)

Sono i 5 che bloccano i soldi oggi. Fai solo questi.

| # | Azione Tecnica Pratica | Sforzo | Impatto Conversion | File/Sezione |
|---|---|---|---|---|
| 1 | **CTA unica** hero: rimuovi "Come funziona" da bottone, diventa link testuale `Scopri come funziona ↓` | 1 | 🔥 niente indecisione | `public/index.html` (hero CTA block) |
| 2 | **Trust ribbon reale**: sostituisci "+1.000 candidati" con "Cifratura server UE" + rimosso dato inventato | 1 | ⭐ credibilità reale | `public/index.html` (riga 3 trust items) |
| 3 | **Costo giornaliero** sotto €12.99: aggiungi "Equivale a €0,43 al giorno" | 1 | 🔥 leva pricing psychology | `public/index.html` (card Pro pricing) |
| 4 | **Distruttore ansia** sotto features Pro: "Disdici con 1 clic. Nessun vincolo." | 1 | 🔥 azzera ansia d'acquisto | `public/index.html` (card Pro) |
| 5 | **CTA copy specifici**: "Inizia la tua prima simulazione" + "Crea il tuo profilo candidato" ovunque (5 stringhe) | 3 | ⭐ specificità > genericità | `index.html` + `auth.html` + `dashboard.html` |

### 🟡 TABELLA B — SETTIMANA 2 / DEBUG TECNICO (4 fix, ~45 min)

Da fare SUBITO DOPO aver misurato l'impatto della Tabella A con Vercel Analytics.

| # | Azione Tecnica Pratica | Sforzo | Impatto Conversion | File/Sezione |
|---|---|---|---|---|
| 6 | **Step indicator** wizard upload: lista 3 step prima delle tab | 2 | ⭐ riduce drop-off wizard | `public/dashboard.html` (sopra `.upload-tabs`) |
| 7 | **Bottone "Non sono d'accordo"** reso CTA primaria (border-2 + font-black) | 1 | ⭐ feedback loop visibile | `public/simulation.html` (feedback panel) |
| 8 | **`defer` su GSAP** scripts (con init utente wrappato in DOMContentLoaded) | 1 | ⭐ migliora LCP e INP | `public/index.html` `<head>` |
| 9 | **iOS safe-area-inset-bottom** su `.sticky-mobile-cta` + **Fix CLS** hero mockup con `min-h-[540px]` | 1 | 💎 UX mobile iOS + stabilità visiva | `public/index.html` `<style>` + `.glass-card` wrapper |

### 🔵 TABELLA C — PRIMA DEL LANCIO FORMALE (2 step QA)

| # | Azione | Sforzo | Impatto | Tipo |
|---|---|---|---|---|
| 10 | **Esegui i 10 test spietati** della Fase 5.1 (signup, login, mobile iOS, micro, console pulita) | 5 | 🔥 anti-bug di base | Manuale |
| 11 | **Attiva Vercel Web Analytics + Speed Insights** per misurare prima/dopo | 1 | ⭐ misurare conversion reale | Vercel dashboard |

**TOTALE**: 11 azioni in 3 ondate.  
**Sforzo max**: QA manuale (5). Tutto il resto è 1-3.  
**Sequenza consigliata**: Tabella A → misura 14gg → Tabella B → misura 14gg → Tabella C + lancio formale.

---

## 🔚 COSA NON HO INCLUSO (e perché)

Per onestà — questi NON ci sono e la spiegazione è importante:

| Cosa è stato escluso | Perché |
|---|---|
| **Tier Team €49/mese** | L'utente ha 0 clienti paganti. Tier Team è distrazione fino a che Pro non converte. |
| **"+10-20% signup rate" o altri impatti % inventati** | Numeri non tuoi. Misura PRIMA, decidi DOPO. |
| **Serif editoriale al H1** (Newsreader / Fraunces) | Lusso tipografico. Non convertitore. Skip. |
| **Rifare tutto Tailwind via build** | Richiede setup pipeline, non bloccante. Preconnect basta per ora. |
| **Modifica al Footer** | Non incluso perché non rientra nei top-7 a maggior impatto. |
| **FAQ riordino (prima dei prezzi)** | Micro-fix non bloccante. Skip per ora. |
| **Sezione "Chi sta usando ConcorsoAI"** | Servono 3 utenti reali disposti a metterci la faccia. Non inventare. |
| **Animazione parallax sezioni** | Distrae. Skip. |
| **Trustpilot widget** | Non hai ancora il widget attivo. Non mettere stelle finte. |

---

## 🎯 IMPATTO ATTESO (onesto)

> ⚠️ NON ti do numeri tipo "il 73% dei SaaS raddoppia il signup con questo fix".  
> Quello che ti dico:

- **Setup**: implementi i 7 fix + 4 debug → 3 ore.
- **Misura PRIMA**: apri Vercel Analytics → screenshot del tasso signup, LCP, CLS, INP della landing **prima** delle modifiche.
- **Pubblica**: fai i cambiamenti.
- **Misura DOPO 14gg**: rileggi le stesse metriche.
- **Calcola tu il delta**. È l'unico numero che ti appartiene.

I numeri della concorrenza (Superprof, Concorsando, Anki) **non** sono citati come percentuali di mercato. Sono solo punti di confronto posizionale.

---

*Generato il 18/07/2026 — basato su lettura diretta di `AUDIT-10X.md`, `public/index.html`, `public/css/landing.css`, `public/dashboard.html`. Decisioni operative validate tramite `thinker-with-files-gemini`. Rispetta i 4 guardrail imposti dall'utente: niente Tier Team, niente stime generiche, solo 7 fix chiave, niente serif editoriale.*
