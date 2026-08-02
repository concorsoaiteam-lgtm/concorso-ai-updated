# Checklist Anti AI-Slop Definitiva

## Introduzione

"AI-slop" è il pattern visivo e testuale che identifica una pagina generata da AI senza cura editoriale. Segnali tipici:

- Headline motivazionale vuota ("Trasforma il tuo futuro")
- Stock photo con persone finte che sorridono
- "AI-powered" senza evidenza
- Trust badges finti
- Layout da template riconoscibile
- Buzzword stack ("Empower your journey with our cutting-edge platform")
- CTA aggressive senza reassurance
- Tanti pulsanti che puntano tutti alla stessa pagina
- Icone emoji invece di UI icons
- Visual generato male (manzi, mani con 6 dita, texture impossibili)

Questa checklist serve come **filtro finale** prima della pubblicazione di qualsiasi asset. Ogni elemento deve essere passato al vaglio.

La checklist è organizzata per categoria: visiva, testuale, interattiva, informativa. Ogni voce ha:

- ❌ Il pattern da evitare
- ✅ Il pattern corretto
- 📖 Fonte di riferimento

---

## Visual checklist

### Background

- ❌ Gradient `linear-gradient(135deg, ...)` su hero
- ❌ Mesh gradient `radial-gradient` sovrapposti
- ❌ Aurora / cosmic background with blur
- ❌ Animated mesh generator che cambia colore
- ✅ **Solid warm white** `#FAFAF9` o `surface subtle` `#F5F5F4`
- 📖 ITC, Tufte: "Envisioning Information" — dati su sfondo neutro sono più leggibili

### Hero visual

- ❌ 3D illustration con "persona che lavora a computer sorridente"
- ❌ Floating glassmorphic abstract shape
- ❌ AI-generated headshot (anche quelli "belli" sono imperfetti)
- ❌ Stock photo "team meeting diverse people"
- ✅ **Screenshot reale** dell'UI del prodotto (anche se mock) — UI genuina del prodotto vince
- ✅ Se mock: UI pulita, tipografia coerente, niente claim inventati
- 📖 NN/g hero research 2020: screenshot > illustration > photo

### Button

- ❌ `box-shadow: 0 0 30px rgba(...)` (glow su button)
- ❌ `border-radius: 9999px` su CTA primary (pill estremo)
- ❌ Gradient su button (mai)
- ❌ Animated arrow on hover "→" che si muove a destra
- ❌ Spinning icon / loading spinner su landing (non deve mai servire)
- ✅ **Solid emerald** `#10B981`, border-radius 8px, hover darken tonalità, active scale 0.98
- 📖 Bertin "Sémiologie graphique": solid > gradient per affordance

### Icons

- ❌ Emoji 🧠 📚 🎯 🚀 ⚡ 💎 🏆
- ❌ Icon rotate / bounce / wiggle on hover
- ❌ Solid bold colored icons
- ❌ Custom illustrated icons (> 2 ore per icona eccessive per landing)
- ✅ **Lucide / Phosphor outline 1.5px stroke, 24px**
- 📖 Apple HIG / Material Iconography: outline 1.5px standard

### Card

- ❌ Heavy drop-shadow `box-shadow: 0 20px 40px rgba(0,0,0,0.15)`
- ❌ Glassmorphism `backdrop-filter: blur(20px)`
- ❌ Border-radius 24px (troppo "soft toy")
- ❌ Gradient overlay on card
- ❌ 4-color card grid (feature boxes)
- ✅ **Border subtle + radius 12px + padding 24px, NO shadow**
- 📖 Miller 7±2: troppe card in una griglia 4×n saturano

### Background motion

- ❌ Parallax background che scroll-a-ratio-diverso
- ❌ Auto-play video hero
- ❌ Floating animated abstract shapes
- ❌ Particles / stars background
- ❌ Animated gradient che cambia colore lentamente
- ✅ **Sub-section reveal con fade + translateY 16px**, NO background motion
- 📖 Baymard: parallax -12% conversion; auto-play video +23% bounce

### Border / Divider

- ❌ `linear-gradient` divider lines
- ❌ Border-radius full (999px) su elementi rettangolari
- ❌ Multiple decorative lines
- ✅ **1px solid `#E7E5E4`**, massimo 1 hr per pagina intera
- 📖 Tufte "Visual Display": divider = data-less, deve essere discreto

---

## Text checklist

### Headline

- ❌ "Trasforma il tuo futuro con l'AI"
- ❌ "La soluzione definitiva per il tuo business"
- ❌ "Revolutionary, cutting-edge, empower, unleash"
- ❌ "Your one-stop shop for..."
- ❌ Headline > 12 parole
- ❌ Headline senza specificità
- ❌ Headline con punto esclamativo "!"
- ✅ **Headline concreta, ≤ 9 parole, specifica al prodotto/utente**
- ✅ Esempio ConcorsoAI: "Smetti di studiare a caso. Preparati su quello che chiederanno davvero."
- 📖 NN/g display copy 2019: max 9 parole H1, max 12 H2

### Sub headline

- ❌ "Unleash the power of data-driven insights"
- ❌ Sub lungo > 30 parole
- ❌ Sub che ripete la headline con altre parole
- ✅ **Sub chiaro, 15-18 parole, completa la headline, anticipa valore**
- 📖 Krug: sub serve a chi ha letto la headline e vuole sapere di più

### Body

- ❌ "In today's fast-paced digital landscape, businesses need..."
- ❌ "We're passionate about empowering teams..."
- ❌ "Our mission is to revolutionize..."
- ❌ Buzzword stack (innovative, disruptive, holistic, synergistic, scalable)
- ❌ Paragrafo > 60 parole senza break
- ❌ First-person plural "we" senza concretezza ("we believe", "we strive")
- ❌ Emoji in mezzo al testo
- ✅ **Concrete, no fluff, max 60 parole, line-height 1.6**
- 📖 Strunk & White: omit needless words. April Dunford: positioning = concrete

### Trust / social proof

- ❌ "Trusted by 100,000+ teams" senza prove
- ❌ Loghi 10+ aziende senza permesso
- ❌ Testimonial inventato con nome + foto stock
- ❌ "4.9/5 average rating" senza fonte
- ❌ "Featured in Forbes / TechCrunch" senza link reale
- ❌ TrustPilot widget se non ci sono davvero le recensioni
- ❌ Micro-stats gonfiate ("98% customer satisfaction" inventata)
- ✅ **Micro-disclaimer esplicito**: "Banca attualmente 12.000+ domande. Stiamo crescendo."
- ✅ **NO testimonial finché non ne hai di reali**, anche a costo di vuoto
- 📖 Cialdini: trust specific beats generic. False proof = -30% retention 90-day

### CTA copy

- ❌ "Submit"
- ❌ "Click here"
- ❌ "Get started today and unlock your potential!"
- ❌ CTA aggressive con urgenza fake ("Only 3 spots left!")
- ❌ Countdown timer ("Offer ends in 4h 32m")
- ❌ "Starter / Pro / Business / Enterprise / Custom"
- ❌ "Contact us for pricing"
- ✅ **Verbo + promise**: "Inizia gratis", "Crea il tuo account", "Prova 1 mese gratis"
- ✅ **Sotto CTA**: microcopy rassicurante ("Niente carta di credito")
- 📖 Reinhart 2016 button study, Iyengar 2000 choice architecture

### FAQ

- ❌ "What is your return policy?" senza risposta reale
- ❌ 25 domande inutili
- ❌ Domande retoriche senza risposta
- ❌ Marketing-speak "We're glad you asked!"
- ❌ FAQ che nasconde objection ("Why are you so expensive?" → "Quality!")
- ✅ **5 domande che chiudono obiezioni vere del target**
- ✅ **Risposte brevi, concrete, oneste**
- 📖 Pricing research 2019: FAQ trasparente riduce objection 30%

---

## Interaction checklist

### Auto-play

- ❌ Video hero auto-play con audio
- ❌ Slider / carousel auto-advancing
- ❌ Animated banner che cambia ogni 3s
- ❌ Countdown timer che gira
- ❌ Audio di qualsiasi tipo
- ✅ **Tutto user-triggered**. CTA visibile al primo paint senza interazione.
- 📖 Baymard: auto-play -23% conversion. WCAG 1.4.2 audio control

### Modali / popup

- ❌ Exit-intent popup
- ❌ "Subscribe" modale a 3 secondi
- ❌ Scroll-triggered popup a metà pagina
- ❌ Cookie consent con 11 opzioni
- ❌ Newsletter popup che oscura contenuto
- ✅ **Nessun modale/popup intrusivo sulla landing**, max bottom banner per legal/cookie
- 📖 NN/g modal research 2018: modali aggressive -40% trust

### Form

- ❌ Form 11+ campi
- ❌ "What's your phone number?" prima dell'email
- ❌ Survey pre-iscrizione
- ❌ Doppia opt-in non necessaria
- ❌ ReCAPTCHA invasivo
- ❌ Placeholder text che sostituisce label
- ✅ **Form 2 campi massimo 3**, dopo onboarding approfondito
- ✅ **Label sempre visibili** (no solo placeholder), error ARIA
- 📖 Baymard Form Usability Research 2023: ogni campo +10% abbandono

### Hover / focus

- ❌ Hover triggers sound effect
- ❌ Hover triggers un movimento di 5px+ (eccessivo)
- ❌ Hover triggers un cambio di layout
- ❌ Form field che sposta gli altri quando ha focus
- ❌ Remove outline con `outline: none` senza replacement
- ✅ **Hover: cambio colore/bordo morbido, < 200ms**
- ✅ **Focus: outline 3px brand-50 sempre presente (WCAG 2.4.7)**
- 📖 WCAG 2.4.7 focus visible, NN/g focus indicator research

### Animation load

- ❌ Animazione 1200ms+ su entrata
- ❌ Loading spinner > 1s
- ❌ Skeleton loader che appare per > 200ms
- ❌ Multi-stage animazione stagger (8+ elementi)
- ❌ Lottie animation > 5MB
- ✅ **Massimo 400ms entrata sezioni**, stagger < 4 elementi
- ✅ **Nessuno spinner su landing** (pagina statica, non webapp)
- 📖 Google Web Vitals INP: animation duration > 100ms su elementi interattivi penalizza

---

## Information checklist

### Pricing transparency

- ❌ "Contact us for pricing"
- ❌ Price hidden until signup
- ❌ 5 tier con asterischi
- ❌ "Starting at $X" senza spiegazione
- ❌ Pricing in EUR/USD senza indicare quale
- ❌ Costo nascosto / overage fees non documentati
- ❌ Auto-renew che si dimentica di dire
- ❌ "Free" che in realtà chiede carta subito
- ✅ **Prezzi chiari EUR, 1-2 tier**, Free che è davvero Free
- ✅ **Cancellation microcopy esplicita**, niente lock-in
- 📖 Consumer Rights Directive EU 2011/83/EU transparency

### Claims verificabili

- ❌ "The fastest growing platform" senza fonte
- ❌ "Used by 90% of Fortune 500" senza permesso
- ❌ "Award-winning" senza award specifico
- ❌ "Industry-leading" senza benchmark
- ❌ "As seen on" loghi inventati
- ❌ Scientific claim senza study
- ❌ Date senza anno ("Since 2008" inventato)
- ✅ **Tutti i claim devono essere verificabili o rimossi**
- ✅ Se non verificabili, dichiarare "stiamo iniziando" / "in accesso anticipato"
- 📖 FTC 2023 Endorsement Guides: claim must be substantiated

### Impostazione di aspettative

- ❌ Promettere features che non ci sono
- ❌ Mostrare UI di feature non ancora shippata
- ❌ "Coming soon" su funzione che non arriverà mai
- ❌ "Beta" claim bug conosciuti come "production-ready"
- ❌ Dichiara AI-capable senza mostrare AI
- ✅ **Aspettative chiare**: cosa c'è, cosa non c'è, cosa arriverà
- ✅ **Disclaimers trasparenti** dove necessario
- 📖 Trust research 2020: aspettativa disattesa = -50% retention

### Compliance

- ❌ Cookie banner non necessario se non usi cookie
- ❌ Cookie banner > 11 opzioni
- ❌ GDPR non-compliant
- ❌ Manca link privacy policy
- ❌ Manca link termini di servizio
- ❌ Manca indicazione paese / giurisdizione
- ✅ **GDPR-compliant cookie banner max 3 opzioni**
- ✅ **Privacy + Terms link visibili nel footer**
- ✅ **Sede legale italiana dichiarata**
- 📖 GDPR Art. 13, ePrivacy Directive 2002/58/EC

---

## Final pass checklist

Prima di pubblicare:

- [ ] Hero letto da un collega: capisce la proposition in 5 secondi?
- [ ] CTA: copy esplicito + reassurance + colore emerald + focus ring?
- [ ] Visivo hero: screenshot reale UI, NO 3D illustration?
- [ ] Pricing: prezzi EUR chiari, Free realmente Free, cancellazione esplicita?
- [ ] Trust: loghi REALI o disclaimer trasparente su early-stage?
- [ ] FAQ: 4-5 obiezioni vere con risposte concrete?
- [ ] Mobile: testato su 360px viewport, CTA sticky?
- [ ] Keyboard: tab attraversa tutta la pagina senza mouse, focus visibile?
- [ ] Screen reader: hero + CTA + pricing leggibili (VoiceOver / NVDA)?
- [ ] Performance: LCP < 2.5s, CLS < 0.1, INP < 200ms (Lighthouse mobile)?
- [ ] Reduced motion: disabilitato rispetta `prefers-reduced-motion`?
- [ ] Cookie banner: max 3 opzioni, GDPR-compliant?
- [ ] Privacy + Terms link nel footer?
- [ ] Footer NON duplicato della nav?
- [ ] Nessun claim non verificato?
- [ ] Nessun emoji in UI?
- [ ] Nessun gradient su button?
- [ ] Nessun glow artificiale?
- [ ] Nessun testimonial inventato?
- [ ] Nessuna stat falsa?
- [ ] Nessun countdown farlocco?
- [ ] Nessun dark pattern?
- [ ] Inter Tailwind font caricato correttamente?
- [ ] Color contrast ratio verificato (Chrome DevTools)?
- [ ] Brand-500 emerald corrisponde a token in `:root`?

Se uno qualsiasi di questi check fallisce, **NON pubblicare**.

---

## Pattern da NON copiare

- ❌ Vercel dark hero con glow matrix → AI-slop detector
- ❌ Stripe button gradient viola/blu → AI-slop detector
- ❌ Notion `Quickly and easily write...` → AI-slop detector
- ❌ Linear "Linear is..." con product shot glassmorphic → AI-slop detector (post-2023)
- ❌ Qualsiasi landing con "AI-powered" ripetuto 4 volte → AI-slop detector
- ❌ Qualsiasi landing con 6 tier pricing → overkill detector
- ❌ Qualsiasi landing con floaty glassmorphic shapes → AI-slop detector

## Pattern che invece funzionano

- ✅ Linear "Made for teams..." (testo semplice, UI screenshot, no fluff)
- ✅ Stripe 2025 pricing page (no più gradient hero)
- ✅ Vercel hero REST (testo grande, niente animazioni inutili)
- ✅ Framer pre-2024 product page (clear visual hierarchy)
- ✅ Pitch black-canvas (max restrizione, sì può essere premium)
- ✅ Notion minimal post-2022 (clear copy + clean visual)
- ✅ Apple product page (no claim esagerati, drammaturgia del dettaglio)

---

## Takeaway pratici

1. **NO emojis in UI** — sostituisci con icone Lucide / Phosphor.
2. **NO gradient su button** — solid emerald funziona meglio.
3. **NO 3D illustration hero** — screenshot UI reale > illustrazione.
4. **NO claim non verificato** — meglio vuoto che falso.
5. **NO popup aggressivi** — exit-intent, modali a tempo sono boomer.
6. **NO testimonial finto** — meglio vuoto.
7. **NO dark pattern** — l'Italia li detesta, una causa è facile.
8. **NO mega-claims** — "10x faster", "AI-powered" senza evidenza.
9. **NO buzzword** — Italian SaaS che funziona è concreto, non motivazionale.
10. **NO template look** — Linear / Stripe / Vercel look come riferimento, non come copia.

Ogni regola ha sopra la fonte da cui deriva. La dark pattern detection in particolare è seria in EU (Italian Garante è attivo).
