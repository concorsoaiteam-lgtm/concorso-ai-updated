# Landing — Knowledge Base

## Struttura

Questa cartella è la **knowledge base operativa** per progettare e implementare la landing page di ConcorsoAI (e qualsiasi SaaS premium futuro). Non è documentazione di marketing: è un manuale ingegneristico, basato su evidenza scientifica, focalizzato su **decisione operativa**.

Ogni file è indipendente ma costruito per essere letto in una sequenza logica. I file 01-19 sono **discipline distinte**, i file 20-25 sono **sintesi operativa**.

---

## Scopo di ogni file

### 01 — Psicologia utente (`01_psicologia_utente.md`)

Capire chi è il visitatore: la sua cognizione, attenzione, memoria di lavoro, emozioni in gioco. Base di Kahneman (System 1/2), Miller (7±2), Sweller (cognitive load).

### 02 — Decision making (`02_decision_making.md`)

Come l'utente prende la decisione di registrarsi (o non farlo). Modello Kahneman AKT, ProsTheory, Fogg MAP, Cialdini commitment.

### 03 — Behavioral economics (`03_behavioral_economics.md`)

Bias, euristiche, nudge, choice architecture. Thaler-Sunstein, Iyengar (jam study), Madrian (default effect).

### 04 — Jobs to be done (`04_jobs_to_be_done.md`)

Il "lavoro" che il visitatore vuole "assumere" il prodotto per fare. Framework Christensen, Dunford positioning, esempi Airbnb.

### 05 — Eye tracking (`05_eye_tracking.md`)

Dove guarda l'occhio. F-pattern, Z-pattern, scannability. Nielsen/Pernice, NN/g, Just-Carpenter, Ware.

### 06 — Visual hierarchy (`06_visual_hierarchy.md`)

Come l'occhio organizza la pagina. Bertin visual variables, gestalt, preattentive features, Tufte data-ink.

### 07 — Tipografia (`07_tipografia.md`)

Famiglia, scala, line-height. Bringhurst canonico, Inter Variable decision, anti-pattern typography.

### 08 — Spacing & layout (`08_spacing_layout.md`)

8px grid base, rhythmic spacing, container/grid. Müller-Brockmann, Ruder.

### 09 — Grid systems (`09_grid_systems.md`)

12/8/4 colonne responsive. Container max-width, breakpoint.

### 10 — Color psychology (`10_color_psychology.md`)

Emerald CTA decision, warm off-white bg, soft black fg. WCAG contrasti verificati.

### 11 — Copywriting (`11_copywriting.md`)

Hero copy, sub-headline, body. Schema Schwartz, Ogilvy headlines, copywriting ufficiale Anti-AI-slop.

### 12 — Microcopy (`12_microcopy.md`)

Label, button, reassurance, error states. Pattern AAA microcopy, Reinhart button study.

### 13 — CTA psychology (`13_cta_psychology.md`)

Verbo + promise, primary vs secondary, here-comes-no-Cialdini scarcity. Cialdini, Fogg MAP, Madrian default.

### 14 — Trust building (`14_trust_building.md`)

Trust active vs passive. Fogg "what makes a website credible", Cialdini authority, Sillence framework.

### 15 — Social proof (`15_social_proof.md`)

Loghi reali vs disclaimer. Cialdini specific trust. Anti-fake testimonial.

### 16 — Conversion patterns (`16_conversion_patterns.md`)

Baymard form usability, NN/g conversion research. Pattern di landing ad alta conversione.

### 17 — SaaS landing patterns (`17_saas_landing_patterns.md`)

Pattern da Linear, Vercel, Stripe, Notion, Pitch. Cosa funziona, cosa no.

### 18 — Mobile behavior (`18_mobile_behavior.md`）

Touch target, thumb zone, swipe patterns. NN/g mobile, Wroblewski Mobile First.

### 19 — Accessibility (`19_accessibility.md`)

WCAG 2.2 AA, focus management, screen reader. WAI-ARIA patterns.

### 20 — Information architecture (`20_information_architecture.md`)

Miller 7±2, Krug nav minimizzata, Morville IA. Decisione su nav, footer, anchor scroll.

### 21 — User flow (`21_user_flow.md`）

8 micro-passaggi cognitivi (Massey), Fogg MAP, Cialdini micro-yes pattern.

### 22 — Architettura finale (`22_architettura_finale.md`）

Sintesi architetturale operativa: 9 sezioni, ogni sezione con scopo, contenuto, decisioni vincolanti.

### 23 — Design system (`23_design_system.md`）

Token tipografici, colori, spacing, motion, componenti. Implementabile in codice.

### 24 — Checklist anti-slop (`24_checklist_antislop.md`)

Checklist finale pre-pubblicazione. Visuale, testuale, interattiva, informativa, compliance.

### 25 — Fonti complete (`25_fonti_complete.md`）

Bibliografia organizzata per categoria e per file. ~150 riferimenti.

---

## Dipendenze logiche tra i documenti

```
01-04 (psicologia) ─────────► 11, 12, 13 (copy, microcopy, CTA)
        │                          ▲
        │                          │
05-10 (visual) ──────────► 23, 22 (design system, architettura)
        │                          ▲
        │                          │
14-19 (trust/social/mobile/accessibility) ──► 22, 24 (architettura + checklist)
        │                          ▲
        │                          │
20-21 (IA + flow) ──────────────► 22, 23 (architettura + design system)

24-25 sono indipendenti: 24 è filtro finale, 25 è reference.
```

### Lettura "decision-first"

Se vuoi decidere rapidamente le scelte principali:

1. **04** Jobs to be done → capisci a chi parli
2. **02** Decision making → capisci come decide
3. **22** Architettura finale → vedi la struttura
4. **23** Design system → vedi i token
5. **24** Checklist → filtri finali

### Lettura "research-first"

Se vuoi costruire una visione completa prima di decidere:

1. **01** Psicologia utente
2. **02** Decision making
3. **03** Behavioral economics
4. **04** Jobs to be done
5. **05** Eye tracking
6. **06** Visual hierarchy
7. **07-09** Tipografia, spacing, grid
8. **10** Color psychology
9. **11-13** Copy, microcopy, CTA
10. **14-15** Trust + social proof
11. **16-17** Conversion patterns + SaaS
12. **18-19** Mobile + accessibility
13. **20-21** Information architecture + User flow
14. **22** Architettura finale
15. **23** Design system
16. **24** Checklist anti-slop
17. **25** Fonti complete

### Lettura "implementation-first"

Se devi implementare la landing oggi:

1. **22** Architettura finale → struttura
2. **23** Design system → token
3. **24** Checklist anti-slop → filtri
4. **25** Fonti complete → verifiche

---

## Ordine di lettura consigliato

### Prima sessione (decision-making)

1. **README** (questo file)
2. **22** Architettura finale
3. **23** Design system
4. **24** Checklist anti-slop

→ Obiettivo: decidere la struttura, i token, e cosa NON fare.

### Seconda sessione (approfondimento)

5. **04** Jobs to be done
6. **02** Decision making
7. **14** Trust building
8. **11-13** Copy / microcopy / CTA

→ Obiettivo: capire a chi parlare, cosa dire, come dirlo.

### Terza sessione (validazione)

9. **05-10** Eye tracking, visual hierarchy, tipografia, spacing, grid, color
10. **20-21** IA + user flow
11. **16-19** Conversion, SaaS patterns, mobile, accessibility
12. **25** Fonti complete

→ Obiettivo: validare le scelte con evidenza scientifica.

---

## Vincoli generali (Anti AI-slop)

La landing NON deve:

- ❌ Avere gradient inutili su CTA
- ❌ Avere glow / glassmorphism
- ❌ Avere cards infinite in 4-col grid
- ❌ Avere ombre pesanti (preferire border)
- ❌ Avere hero gigantesca senza contenuto
- ❌ Avere badge finti (TrustPilot 4.9 senza recensioni)
- ❌ Avere testimonial inventati con nome + foto stock
- ❌ Avere statistiche false
- ❌ Avere countdown fake
- ❌ Avere dark pattern (cookie banner aggressivi, exit-intent popup)
- ❌ Avere marketing aggressivo ("Only 3 spots left!")
- ❌ Avere buzzword ("revolutionize", "empower", "transform")
- ❌ Avere frasi motivazionali vuote
- ❌ Avere emoji casuali (🧠 📚 🎯 🚀)
- ❌ Avere layout da template (mega menu, carousel, modal)

La landing deve trasmettere:

- ✅ Competenza
- ✅ Serietà
- ✅ Fiducia
- ✅ Ordine
- ✅ Precisione
- ✅ Pulizia
- ✅ Credibilità
- ✅ Velocità
- ✅ Semplicità

Ogni **pixel**, **spazio**, **dimensione**, **parola**, **CTA**, **sezione** deve avere una **motivazione documentata**.

---

## Come usare questa cartella

### Per un designer

- Leggi **22** per la struttura
- Leggi **23** per i token
- Usa **24** come checklist pre-pubblicazione
- Approfondisci con **05-10** per dettagli

### Per un frontend engineer

- Leggi **22** per la struttura
- Implementa i token di **23** (variabili CSS o Tailwind config)
- Usa **24** come QA pre-deploy
- Verifica performance con Lighthouse (riferimento 19)

### Per un copywriter

- Leggi **04** (chi parla il visitatore)
- Leggi **11-13** (copy + microcopy + CTA)
- Usa la struttura di **22** come wireframe copy
- Filtra con **24** per evitare AI-slop

### Per un PM/proprietario

- Leggi **22** per la visione d'insieme
- Leggi **04** per confermare il positioning
- Usa **24** come pre-publish gate
- Tieni **25** come reference per eventuali dubbi

---

## Manutenzione

La cartella è **viva**. Quando esce nuova ricerca rilevante:

- Aggiornare il file specifico (es. **24** se escono nuovi anti-AI-slop patterns)
- Aggiornare **25** fonti
- Aggiornare **README** ordine di lettura se cambiano le priorità

Le scelte di **token** (color, type, spacing) in **23** sono **vincolanti**: cambiarle significa invalidare la landing. Modificarle richiede aggiornamento di tutti i file che le referenziano.

---

## Licenza e proprietà intellettuale

I principi citati (Kahneman, Cialdini, Fogg, ecc.) sono basati su letteratura accademica e professionale protetta da copyright. Le citazioni sono **parafrasi** e **riferimenti**, non riproduzioni. La sintesi e l'applicazione a ConcorsoAI in **22** è originale e riutilizzabile per questo progetto e adattamenti futuri.

---

## Takeaway finale

1. **25 file**, organizzati in 6 discipline → 1 sintesi architetturale → 1 design system → 1 checklist → 1 index bibliografico.
2. **Ogni decisione è motivata** da una fonte autorevole.
3. **Tre entry point**: decision-first / research-first / implementation-first.
4. **Anti AI-slop** è un vincolo non negoziabile.
5. La cartella è **viva**: aggiornala quando la ricerca avanza.

Per la sintesi operativa finale → vedi `MASTER_PLAYBOOK.md`.
