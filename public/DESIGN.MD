FONT: Geist (di Vercel) + Geist Mono
PERSONALITÀ: Strumento serio
RIFERIMENTO: Linear.app + Vercel Dashboard

PERCHÉ:

ConcorsoAI è usato da persone di 25-45 anni
che vogliono passare un concorso pubblico.
Non vogliono qualcosa di "carino".
Vogliono qualcosa che ispiri FIDUCIA.

"Questo tool mi farà passare l'esame."

Linear e Vercel comunicano esattamente questo:
serio, preciso, professionale.
Ma non freddo. Hanno calore nei dettagli.
📄 DESIGN.MD — ConcorsoAI:
Markdown

# DESIGN SYSTEM — ConcorsoAI
# Versione 1.0 — Luglio 2026
# Leggi TUTTO prima di scrivere una riga.

---

## IDENTITÀ DEL PRODOTTO

ConcorsoAI è uno strumento serio per persone 
serie. I nostri utenti hanno 25-45 anni. 
Vogliono passare un concorso pubblico. 
Hanno poco tempo e alta pressione.

NON è un gioco. NON è un social. NON è 
uno strumento per ragazzi.

Il design deve comunicare:
→ "Questo strumento è all'altezza 
    della posta in gioco."
→ "Ogni centesimo che ho pagato è 
    giustificato."
→ "Mi fido di questo prodotto."

Riferimenti visivi obbligatori:
- linear.app (struttura, tipografia)
- vercel.com/dashboard (dati, metriche)
- apple.com (dettagli, precisione)

---

## TIPOGRAFIA

### Font primario: Geist
Carica da: https://vercel.com/font
CDN: @fontsource/geist (npm) oppure
     jsdelivr.net/npm/@fontsource/geist

### Font secondario: Geist Mono
Per: numeri nelle metriche, 
     dati numerici, codici, date
CDN: @fontsource/geist-mono

### PERCHÉ Geist e non Inter:
Inter è il font di default di ogni AI.
Geist è disegnato per tool professionali.
Ha una personalità più netta, 
più verticale, più autorevole.

### Scale tipografica:
Display (hero): 32px / 700 / -0.04em H1: 24px / 700 / -0.03em H2: 18px / 600 / -0.02em H3: 15px / 600 / -0.01em Body large: 16px / 400 / -0.01em Body: 14px / 400 / 0em Body small: 13px / 400 / 0em Caption: 12px / 500 / 0.01em Monospace (dati): Geist Mono, 14px

text


### Line height:
Display/H1: 1.15 H2/H3: 1.3 Body: 1.6 Caption: 1.4

text


### REGOLE TIPOGRAFIA:
✅ Usa letter-spacing negativo 
   sui titoli grandi
✅ I numeri nelle metriche usano 
   Geist Mono sempre
✅ Font-weight 700 solo per titoli 
   e CTA
✅ Font-weight 500 per label e caption
✅ Font-weight 400 per body text
❌ MAI font-weight 800 o 900
❌ MAI text-transform: uppercase 
   su testi lunghi
❌ MAI italic nel corpo del testo

---

## COLORI

### Palette base (NON CAMBIARE):
Background: #F7FBFF Surface: #FFFFFF Surface raised:#F0F6FF Border: #E2EEFF Border strong: #C5D8F5

Text primary: #0A1628 Text secondary:#3D5A8A Text muted: #7B93B8 Text disabled: #B8CDE8

text


### Brand:
Brand 50: #F0F7FF Brand 100: #DCF0FF
Brand 200: #B8DCFF Brand 400: #5EA0E8 Brand 500: #2563EB ← accento principale Brand 600: #0F4C81 ← brand primario Brand 700: #0B3A63 Brand 900: #071D33

text


### Stato:
Success: #16A34A Success light: #DCFCE7 Success muted: #F0FDF4

Warning: #D97706 Warning light: #FEF3C7 Warning muted: #FFFBEB

Error: #DC2626 Error light: #FEE2E2 Error muted: #FFF5F5

text


### Colori metriche (Voto medio):
Voto < 5: #DC2626 (error) Voto 5-7: #D97706 (warning)
Voto > 7: #16A34A (success)

text


### Colori materie (per icone):
Diritto Amministrativo: #2563EB Diritto Costituzionale: #7C3AED Diritto Civile: #0891B2 Diritto Penale: #DC2626 Contabilità Pubblica: #059669 Diritto del Lavoro: #D97706 Informatica: #4F46E5 Inglese: #0F4C81 Diritto Tributario: #9333EA Diritto Europeo: #0284C7

text


### REGOLE COLORI:
✅ Background è SEMPRE #F7FBFF
   MAI bianco puro (#FFFFFF) come sfondo
✅ Le card sono SEMPRE #FFFFFF su #F7FBFF
✅ Il contrasto testo/sfondo 
   deve essere > 4.5:1 (WCAG AA)
❌ MAI gradient viola-blu (#7C3AED → #2563EB)
❌ MAI gradient su sfondi di card
❌ MAI colori neon o saturazione > 80%
❌ MAI più di 2 colori accent 
   in una stessa sezione

---

## SPACING

### Base unit: 4px
2px → micro (gap tra icona e label) 4px → xs 8px → sm 12px → md 16px → lg ← padding interno card piccole 20px → xl 24px → 2xl ← padding interno card normali 32px → 3xl ← gap tra sezioni 40px → 4xl 48px → 5xl ← padding sezioni principali 64px → 6xl ← gap tra sezioni major

text


### REGOLE SPACING:
✅ Il contenuto principale ha 
   max-width: 1080px centrato
✅ Padding laterale pagina: 
   24px mobile, 40px tablet, 64px desktop
✅ Gap tra card: 12px
✅ Gap tra sezioni: 32px
✅ Padding interno card: 20px o 24px
❌ MAI padding diverso da queste misure
❌ MAI gap > 24px tra elementi 
   della stessa sezione

---

## BORDER RADIUS
Bottoni: 10px Card: 16px Card grande: 20px Input: 10px Badge/chip: 6px Avatar: 50% (cerchio) Tooltip: 10px Toast: 14px Icone box: 12px

text


### REGOLE BORDER RADIUS:
✅ Usa i valori esatti sopra
✅ La stessa categoria ha 
   SEMPRE lo stesso radius
❌ MAI border-radius > 24px 
   su qualcosa che non sia modal
❌ MAI mischiare radius diversi 
   nello stesso componente
❌ MAI border-radius: 50% su 
   elementi non circolari

---

## OMBRE
Livello 0 (niente): nessuna ombra

Livello 1 (card a riposo): 0 1px 3px rgba(15,76,129,0.06), 0 1px 2px rgba(15,76,129,0.04)

Livello 2 (card hover): 0 4px 16px rgba(15,76,129,0.10), 0 2px 6px rgba(15,76,129,0.06)

Livello 3 (card elevata/dropdown): 0 8px 32px rgba(15,76,129,0.12), 0 2px 8px rgba(15,76,129,0.06)

Livello 4 (modal/CTA): 0 20px 60px rgba(15,76,129,0.16), 0 4px 16px rgba(15,76,129,0.08)

Glow CTA (brand pulsante): 0 0 0 0px rgba(37,99,235,0.4) → 0 0 0 8px rgba(37,99,235,0) (keyframe animato)

Glow successo: 0 4px 20px rgba(22,163,74,0.20)

Glow errore: 0 4px 20px rgba(220,38,38,0.20)

text


### REGOLE OMBRE:
✅ Il colore dell'ombra è SEMPRE 
   una versione scura del brand (#0F4C81)
✅ Le ombre diventano più forti al hover
✅ Ogni livello ha UNA sola ombra 
   composta (non 3 ombre separate)
❌ MAI ombre nere (rgba(0,0,0,...))
❌ MAI ombre colorate diverse dal brand
   tranne glow success/error/warning
❌ MAI box-shadow su testo

---

## BORDI
Border standard: 1px solid #E2EEFF Border strong: 1px solid #C5D8F5 Border focus: 2px solid #2563EB Border error: 1px solid #DC2626 Border success: 1px solid #16A34A

text


### REGOLE BORDI:
✅ Le card hanno SEMPRE un bordo 
   (non solo ombra)
✅ Al hover la card cambia 
   da border standard a border strong
✅ I bottoni primary NON hanno bordo
✅ I bottoni secondary hanno bordo
❌ MAI border: none su input
❌ MAI bordi doppi

---

## ICONE

### Set: Heroicons (outline, stroke-width 1.5)
CDN: unpkg.com/heroicons

### Misure:
Icona in testo: 16px × 16px Icona standalone: 20px × 20px Icona decorativa: 24px × 24px Icona hero section: 32px × 32px

text


### Box icona (quando l'icona è 
    in un container colorato):
Small: 32px × 32px, radius 8px Medium: 40px × 40px, radius 10px Large: 48px × 48px, radius 12px

Sfondo: versione 10% del colore Icona: versione 100% del colore

text


### REGOLE ICONE:
✅ Usa SOLO outline (non solid)
   tranne per: stati attivi, bottoni CTA
✅ stroke-width: 1.5 SEMPRE
✅ Le icone nelle metriche hanno 
   il box colorato (vedi sopra)
✅ Le icone inline con testo: 
   vertical-align: -2px
❌ MAI emoji come icone
❌ MAI mix di outline e solid
   nella stessa interfaccia
❌ MAI icone > 32px nel body
❌ MAI più di 1 icona in un bottone

---

## BOTTONI

### Primary (azione principale):
Background: #0F4C81 Text: #FFFFFF Font: 14px / 600 / Geist Padding: 12px 24px Radius: 10px Height: 42px Shadow: Livello 2 Hover: background #2563EB, shadow L3 Active: scale(0.97) + shadow L1 Transition: 0.15s cubic-bezier(0.4,0,0.2,1)

text


### Secondary (azione secondaria):
Background: #FFFFFF Text: #0F4C81 Border: 1px solid #C5D8F5 Font: 14px / 600 / Geist Padding: 11px 23px Radius: 10px Height: 42px Hover: background #F0F6FF Active: scale(0.97)

text


### Ghost (azione terziaria):
Background: transparent Text: #3D5A8A Border: none Font: 14px / 500 / Geist Padding: 8px 16px Hover: background #F0F6FF

text


### CTA hero (bottone principale):
Background: linear-gradient( 135deg, #0F4C81, #2563EB ) Text: #FFFFFF Font: 16px / 700 / Geist Padding: 14px 32px Radius: 12px Height: 52px Shadow: Livello 4 + Glow animato Hover: brightness(1.1) + shadow++ Active: scale(0.97) Animation: glow pulsante 2.5s infinite

text


### REGOLE BOTTONI:
✅ Max 1 bottone Primary per sezione
✅ Il CTA hero è l'unico con gradient
✅ Tutti i bottoni hanno 
   transition su transform E shadow
✅ Active sempre scale(0.97) 
   senza eccezioni
❌ MAI gradient sui bottoni secondary
❌ MAI border-radius > 12px sui bottoni
❌ MAI testo uppercase nei bottoni
❌ MAI più di 2 parole nel testo CTA

---

## COMPONENTI SPECIFICI

### Metrica — Simulazioni:
Layout: verticale Label: 12px / 500 / text-muted / uppercase letter-spacing 0.06em Valore: 36px / 700 / Geist Mono / text-primary letter-spacing -0.03em Sparkline: SVG 80px × 32px linea 1.5px brand-500 area gradiente brand-500 10%→0% ultimi 7 giorni

text


### Metrica — Voto Medio:
Layout: centrato con gauge Gauge: SVG arco 120px × 120px stroke-width 8px colore: dinamico (error/warning/success) animazione: stroke-dashoffset da 0 al valore (1.2s ease-out) Valore: al centro, 28px / 700 / Geist Mono Label: sotto, 12px / 500 / text-muted

text


### Metrica — Streak:
Layout: verticale 7 cerchi: 10px × 10px ciascuno gap: 6px pieni: background brand-500 vuoti: background transparent, border 1.5px solid border "Oggi" vuoto: animation pulse Valore: 24px / 700 / Geist Mono / text-primary Suffix: "gg" inline, 14px / 400 / text-muted

text


### Card simulazione recente:
Layout: flex orizzontale, gap 12px Height: 56px Padding: 0 4px Border-bottom: 1px solid border (tranne ultima) Hover: background surface-raised translateX(3px) transition 0.15s ease

Icon box: 36px × 36px, radius 10px background: colore materia 10% icona: 16px, colore materia 100%

Content: flex column Title: 14px / 600 / text-primary Date: 12px / 400 / text-muted

Score pill: Height: 24px Padding: 0 8px Radius: 6px Font: 13px / 700 / Geist Mono Colore: dinamico (error/warning/success) background light variant

text


### Barra area da migliorare:
Layout: verticale, gap 4px Header: flex between Label: 13px / 500 / text-secondary Score: 13px / 700 / Geist Mono / colore dinamico

Track: height 6px, radius 3px background #E2EEFF Fill: background-image: linear-gradient( 90deg, #DC2626, #D97706, #16A34A ) background-size: 1080px 6px background-position: calcolato sul valore (0-100%) border-radius: 3px transition: width 0.8s cubic-bezier(0.4,0,0.2,1)

La barra peggiore: animation: weakBarPulse 2s ease-in-out infinite

@keyframes weakBarPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.65 } }

text


### Grafico Trend:
Container: 100% × 160px SVG: viewBox "0 0 100 40" preserveAspectRatio

Area: path fill gradiente verticale: brand-500 20% → trasparente 100% opacity: 0.12

Linea: path stroke brand-500, stroke-width 1.5 curve Bézier smooth animation: stroke-dashoffset da full-length a 0 duration 1.2s ease-out

Punti: circle r=2.5 fill: white stroke: brand-500, stroke-width 1.5 hover: r diventa 4, appare tooltip

Tooltip: background white border: 1px solid border shadow: livello 2 radius: 8px padding: 6px 10px font: 12px Geist Mono

text


### Upload tab indicator:
Tabs container: position relative Indicator: position absolute bottom: 0 height: 2px background: brand-500 border-radius: 2px transition: left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1) (aggiornato via JS al click)

text


### Toast:
Position: fixed bottom-right, 24px margin Width: max 320px Padding: 14px 16px Radius: 14px Font: 14px / 600 / Geist Gap icon-text: 10px Shadow: livello 3 Backdrop: blur(8px)

Entrata: translateX(80px) + opacity 0 → translateX(0) + opacity 1 duration 0.3s back.out(1.4)

Uscita: translateX(80px) + opacity 0 duration 0.2s power2.in

Progress bar interna: height: 3px, bottom: 0 background: currentColor, opacity 0.25 scaleX: 1 → 0 in 3s linear

Success: background: rgba(240,253,244,0.95) border: 1px solid rgba(22,163,74,0.2) color: #15803D

Error: background: rgba(254,242,242,0.95) border: 1px solid rgba(220,38,38,0.2) color: #DC2626

text


---

## ANIMAZIONI

### Easing curves:
Standard: cubic-bezier(0.4, 0, 0.2, 1) Enter: cubic-bezier(0, 0, 0.2, 1) Exit: cubic-bezier(0.4, 0, 1, 1) Spring: cubic-bezier(0.34, 1.56, 0.64, 1)

text


### Durate:
Micro (hover, active): 100-150ms Short (transizioni): 200-250ms Medium (entrata UI): 300-400ms Long (grafici, draw): 600-1200ms

text


### Animazioni obbligatorie:
Page load stagger: navbar (0ms) → hero (100ms) → CTA (200ms) → metriche (300ms stagger 60ms) → panels (500ms stagger 60ms)

Counter numeri: 0 → valore reale, 800ms power2.out

pop finale scale(1.1→1) 300ms
Gauge voto medio: stroke-dashoffset draw, 1200ms ease-out parte solo quando visibile (ScrollTrigger)

Barre miglioramento: width 0 → valore, 800ms power2.out stagger 100ms, parte allo scroll

Trend line draw: stroke-dashoffset full → 0 1200ms ease-out parte allo scroll

CTA glow pulse: box-shadow 0 → 8px → 0 2500ms ease-in-out infinite

Card tilt 3D: rotateX e rotateY max ±3deg verso il cursore, 200ms standard

Scroll reveal panels: opacity 0 + translateY(16px) → opacity 1 + translateY(0) 400ms power2.out trigger: top 88%

text


### REGOLE ANIMAZIONI:
✅ Usa GSAP per tutto
✅ Rispetta prefers-reduced-motion:
   @media (prefers-reduced-motion: reduce)
   → disabilita TUTTE le animazioni
   → mantieni solo le transizioni 
     di stato (hover, focus)
✅ Le animazioni dei grafici partono 
   SOLO quando l'elemento è visibile
✅ Il page load stagger è < 600ms totali
❌ MAI animazioni infinite 
   tranne glow CTA e streak pulse
❌ MAI bounce su elementi di testo
❌ MAI animazioni > 1.5s
❌ MAI usare animate CSS invece di GSAP
❌ MAI transform su elementi con 
   position: fixed

---

## PATTERN VIETATI (AI SLOP)

Questa sezione lista esplicitamente 
cosa NON fare. Se non è qui permesso, 
probabilmente non dovresti farlo.

❌ Gradient viola-blu 
   (#7C3AED → #2563EB o simili)
❌ Glassmorphism 
   (backdrop-filter su card principali)
❌ Card tutte identiche in griglia 3 col
❌ Inter font
❌ Emoji come icone UI
❌ Hero section con H1 enorme centrato
❌ "Gradient text" (background-clip: text)
❌ Particelle/confetti come decorazione 
   permanente (solo al click CTA)
❌ Skeleton grigio (#E5E7EB)
   → Usa il nostro shimmer brand-colored
❌ Hover che cambia solo background-color
❌ Border-radius > 20px su card
❌ Ombre nere (rgba(0,0,0,...))
❌ Progress bar con solo colore piatto
❌ Card senza bordo (solo ombra)
❌ Spaziatura non dalla nostra scala
❌ Font-weight 800 o 900
❌ Sezioni alternate chiaro/scuro
❌ "Features section" con 6 card identiche
❌ Divider decorativi (solo funzionali)
❌ Scroll infinito orizzontale
❌ Carousel di qualsiasi tipo
❌ Testo bianco su colore brand 
   tranne bottoni primary/CTA

---

## SKELETON LOADER

### Colori:
Base: #EAF4FF Shimmer: #D6E8FF

Gradient: linear-gradient( 90deg, #EAF4FF 0%, #D6E8FF 40%, #EAF4FF 80% ) background-size: 400px 100% animation: shimmer 1.4s ease-in-out infinite

@keyframes shimmer { 0% { background-position: -400px 0 } 100% { background-position: 400px 0 } }

text


### Forme skeleton:
Numero metrica: 60px × 36px, radius 6px Label: 80px × 12px, radius 4px Sparkline: 80px × 32px, radius 6px Gauge: 120px × 120px, radius 50% Card simulazione:100% × 56px, radius 10px Barra: 100% × 6px, radius 3px

text


---

## RESPONSIVE
Mobile first: < 640px Tablet: 640px - 1024px Desktop: > 1024px

Breakpoints (come Tailwind): sm: 640px md: 768px lg: 1024px xl: 1280px

text


### Griglia metriche:
Mobile: 2 colonne (sim+streak / voto+bandi) Tablet: 2 colonne Desktop: 4 colonne (tutte in riga)

text


### Griglia contenuto principale:
Mobile: 1 colonna Tablet: 1 colonna Desktop: 2 colonne (recenti 3/5 + migliorare 2/5)

text


### Navbar mobile:
Logo a sinistra Solo avatar (niente nome) a destra Niente altri bottoni visibili
# GERARCHIA VISIVA (Aggiunta post-ricerca)

## Regola fondamentale:
"Questo design sembra DECISO, non generato."
Ogni elemento ha un peso diverso.
Niente è uguale a niente altro.

## Zona dominante:
Una sola area domina la pagina: 
il voto medio + gauge.
Occupa 7/12 colonne su desktop.
È il motivo per cui l'utente torna.

## Zone di supporto:
Streak, simulazioni, bandi: 5/12 colonne.
Meno peso visivo. Meno contrasto.

## Regola peso visivo:
Ogni sezione ha UNA SOLA cosa 
con il massimo contrasto.
Il resto è quieto.

## Dati reali sopra il fold:
La prima cosa visibile dopo la navbar
deve essere un dato reale, non un hero art.
Il gauge del voto medio è il dato principale.

## Motion solo per stato:
Animare SOLO quando qualcosa cambia:
- Numero aumenta → counter
- Simulazione completata → update
- Upload completato → feedback
NON animare l'entrata di elementi 
puramente decorativi.

## Asimmetria intenzionale:
In ogni griglia, UNO span è 7-8 col.
L'altro è 4-5 col.
MAI due blocchi 6+6.

## Empty states:
1 azione primaria.
1 frase sola.
1 visual cue piccolo.
BASTA.

## "Proof of care" per schermata:
Un dettaglio di precisione visibile:
- Focus rings perfetti
- Numeri tabulari allineati
- Skeleton che matcha la geometria
  del contenuto reale
  # ENERGIA E MOTIVAZIONE
# (Aggiornamento basato su ricerca 
#  Duolingo + Fitness Apps + Gaming)

## Il modello giusto per ConcorsoAI:
NON Linear (troppo freddo)
NON Stripe (troppo bancario)
SÌ: Coaching app energica per adulti seri
Riferimento: Duolingo adulto + Apple Fitness

## Colore reward:
Aggiungi ai token esistenti:
--reward: #F59E0B (amber)
--reward-light: rgba(245,158,11,0.1)
--reward-border: rgba(245,158,11,0.25)

Usato SOLO per:
- Streak milestone (3, 7, 14, 30 giorni)
- Score > 8.5
- Prima simulazione completata
- Badge 7/7 streak settimanale

MAI usato come colore decorativo.

## Breathing — UNA SOLA cosa:
Solo il gauge del voto medio "respira":
animation: breathe 2.8s ease-in-out infinite
Scale: 1.0 → 1.015 → 1.0
Saturate: 1.0 → 1.12 → 1.0
NIENTE ALTRO respira nella pagina.

## Celebrazioni — solo su milestone:
Trigger SOLO su:
- Prima simulazione completata
- Streak 3, 7, 14, 30 giorni
- Score > 8.5 (personal best)
- Score sale di banda (es. 6.9→7.0)

Durata: 500-800ms massimo
Poi torna immediamente alla calma.
MAI celebrazioni su click normali.

## Score come storia:
Quando il voto cambia:
- Mostra "+0.6" in amber per 2 secondi
- Il numero sale con overshoot
  (arriva a 7.6 prima di stabilizzarsi a 7.4)
- Colore del gauge cambia con transizione

## Streak come identità:
NON "simulazioni: 12"
SÌ "7 giorni consecutivi di pratica orale"

## Near-completion glow:
Quando gauge > 85%:
Il ring ha un shimmer che gira lentamente
colore amber-white
"Quasi all'eccellenza"

## Live indicator:
Accanto all'ultima simulazione:
piccolo dot che pulsa ogni 4s
+ "aggiornato X min fa" che incrementa
Fa sentire il prodotto "vivo"

## Magnetic button:
Max 6-8px di spostamento
Disabilitato su touch
Press: scale(0.97) + shadow--
Release: spring a scale(1.02) → scale(1.0)

## Stop motion durante lettura:
Quando l'utente è nella sezione feedback
o nelle aree da migliorare:
pausa la breathing animation
Chiarezza > energia in quel momento
# STRUTTURA DASHBOARD (Aggiornamento Luglio 2026)

## Navigazione: 3 TAB
La dashboard NON è una pagina unica con scroll.
È divisa in 3 tab nella navbar:

TAB 1: "Prepara"
TAB 2: "Progressi"  
TAB 3: "Classifica"

La navbar è:
Logo a sinistra | Tab al centro | Avatar+nome+badge a destra

---

## TAB 1 — "Prepara"

### Sezione Upload (3 tab interni):
[Carica PDF] [Incolla Testo] [Materie]
- Un tab alla volta. Non tutto insieme.
- Ogni tab mostra SOLO il suo contenuto.
- Pulsante "Carica Bando" secondario in basso a destra.

### Sezione Bandi:
- Lista di card orizzontali compatte
- Card selezionata: bordo brand-500 4px SOLO
  NO badge "SELEZIONATO"
- Auto-selezione se c'è 1 solo bando
- Ordinamento per data (più recente in alto)
- Ogni card mostra:
  nome bando | data caricamento | 
  numero materie | stato (Pronto/In attesa)

### Bottone Inizia Simulazione:
- Posizione: sotto la lista bandi
- Disabilitato se nessuna card selezionata
- Testo disabilitato: "Seleziona un bando per iniziare"
- Testo attivo: "Inizia Simulazione →"
- NON è un floating button fisso

### Stato caricamento (bando "In attesa"):
Al click del bottone:
1. Bottone → disabilitato + spinner
2. Barra progresso sotto il bottone (4px)
3. Testo dinamico sotto la barra:
   0-30%:  "Sto leggendo il PDF..."
   30-70%: "Estrazione argomenti..."
   70-99%: "Strutturazione simulazione..."
   100%:   "Pronto!"
4. Al 100%: barra sparisce, bottone torna attivo
5. RICHIEDE secondo click per avviare
   (non parte automaticamente)

---

## TAB 2 — "Progressi"

### Sottotitolo: "Come stai andando — continua così"

### Layout desktop (> 640px):
Row superiore: 2 colonne 50%/50%
  Sinistra: Gauge voto medio
  Destra:   Streak
Sotto: Aree da migliorare (accordion)
Sotto: Trend nel tempo (grafico)

### Layout mobile (< 640px):
Stack verticale:
  Prima: Gauge (larghezza piena, 100px)
  Poi:   Streak (larghezza piena)
  Poi:   Aree da migliorare
  Poi:   Trend

### GAUGE VOTO MEDIO:
- Cerchio SVG animato
- Si riempie da 0 al valore reale al caricamento
- Diametro: 120px desktop, 100px mobile
- Numero al centro: Geist Mono 36px desktop, 28px mobile
- Sotto il numero: label della band

3 STATI COLORE (NON solo 2):
< 6.0  → #DC2626 (rosso)   label: "Da migliorare"
6.0-7.9 → #D97706 (amber)  label: "Sufficiente"
≥ 8.0  → #16A34A (verde)   label: "Eccellente"

Cliccabile: apre/chiude le aree da migliorare

### STREAK:
- Stile: gaming con ricompense giornaliere
- Icona fuoco SVG con animazione (NON emoji)
- Numero enorme: 72px desktop, 56px mobile
- Sotto: "giorni di fila" + "Record: X giorni"

Colore fuoco dinamico:
0-2 giorni:  grigio (spento, no animazione)
3-6 giorni:  #F97316 (arancione)
7-14 giorni: #DC2626 (rosso acceso)
15+ giorni:  #7C3AED (viola/leggendario + scintille)

Milestone celebrazioni:
Streak 3:   badge amber "3 giorni"
Streak 7:   tutti i cerchi pulsano + 
            badge "Settimana completa!"
Streak 14+: badge "Imbattibile"

### AREE DA MIGLIORARE:
- Accordion (espandibile/chiudibile)
- Aperto di default SE voto < 6.0
- Chiuso di default SE voto >= 6.0
- Si apre anche cliccando il gauge
- 3 barre: Chiarezza, Struttura, Contenuto
- Gradiente fisso: rosso → amber → verde
- Ogni barra ha icona 💡 "consiglio"
  che apre tooltip con suggerimento pratico
- La barra più bassa pulsa leggermente

### TREND NEL TEMPO:
- Grafico SVG linea smooth (curve Bézier)
- Asse X: DATE REALI formato "12 lug", "19 lug"
  NON "S1, S2, S3"
  Su mobile: salta una data su due se non ci stanno
- Asse Y: 0-10
- Linea brand-500, area gradiente sotto
- Punti interattivi con tooltip hover
- La linea si DISEGNA da sinistra allo scroll
- Nota sotto: "Ultima simulazione: [data] – [voto]
  (+X% rispetto alla precedente)"

### STATO ZERO (0 simulazioni):
Gauge:
- Cerchio grigio senza riempimento
- Centro: "—" (NON "0")
- Sotto: "Nessuna simulazione"

Streak:
- Fuoco grigio spento
- Numero: "—"
- Sotto: "Ancora nessun giorno di fila"

Aree da migliorare:
- COMPLETAMENTE NASCOSTA
- Non renderizzare neanche l'header

Trend:
- Area vuota con linea tratteggiata
- Messaggio: "Non hai ancora completato simulazioni."
- Bottone primario: "Vai a Prepara"
  (cambia il tab attivo a TAB 1)

---

## TAB 3 — "Classifica" (PLACEHOLDER)

Cosa mostra:
- Icona trofeo SVG
- Titolo: "In arrivo — sfida altri candidati"
- Testo: "Stiamo preparando la sfida tra 
  candidati. Presto potrai confrontare il tuo 
  punteggio con altri utenti della tua regione 
  e materia."
- Bottone secondario: "Avvisami quando è pronto"
  → click → toast "Ti avviseremo via email!"

NON costruire la classifica adesso.
Solo il placeholder.

---

## REGOLE GENERALI DASHBOARD:

✅ Ogni sezione ha UNA funzione
✅ Stato zero sempre progettato
✅ Mobile: stack verticale sotto 640px
✅ Dati reali > decorazioni
✅ Il prodotto reagisce ai dati
   (accordion auto-aperto se voto < 6)
❌ NON pagina unica con scroll infinito
❌ NON mostrare sezioni vuote senza messaggio
❌ NON partire automaticamente dopo elaborazione
❌ NON badge ridondanti (bordo già basta)