# 🎯 ConcorsoAI — TO-DO List Completa

> **Obiettivo**: Trasformare il sito in una macchina da conversione. Ogni elemento deve spingere l'utente a registrarsi, iniziare una simulazione e diventare un cliente pagante.

---

## 1. 🚨 RIMUOVERE AI SLOP (URGENTE)

| # | Cosa | Dove | Perché |
|---|------|------|--------|
| 1.1 | Sostituire tutte le emoji inline (📄, ✏️, 📚, 🎯, 💪, ✓, →) con icone SVG coerenti col brand | dashboard.html, index.html | Le emoji hanno rendering diverso per OS, sembrano poco professionali |
| 1.2 | Rimuovere pattern `['url','parte1','parte2'].join('')` per chiavi API | auth.html, dashboard.html, simulation.html | Obfuscation "cosmetica" dà falsa sicurezza; va sostituita con variabili d'ambiente reali o almeno un pattern più serio |
| 1.3 | Rimuovere i `!important` in eccesso da simulation.html | simulation.html | Ci sono ~43 `!important` — ereditati da iterazioni di polish senza refactoring |
| 1.4 | Standardizzare i CSS inline sparsi in file CSS esterni dedicati | Tutti i file | Ogni pagina ha il suo `<style>`. Creare `public/css/landing.css`, `dashboard.css`, `simulation.css`, `auth.css` |
| 1.5 | Rimuovere testo placeholder/vago nei piani pricing ("definiti al lancio", "dettagli finalizzati al lancio") | index.html | Sembra che il prodotto non sia pronto. Meglio mostrare feature specifiche o togliere la sezione |
| 1.6 | Sostituire skeleton generici con skeleton fedeli alla forma del contenuto reale | dashboard.html | Gli skeleton attuali sono rettangoli grigi senza forma |

---

## 2. 🔐 AUTH & ONBOARDING — CONVERSIONE

| # | Cosa | Dove | Priorità |
|---|------|------|----------|
| 2.1 | **Aggiungere "Accedi" e "Registrati" ben visibili nella navbar della landing** | index.html | 🔴 Alta |
| 2.2 | **Aggiungere "Inizia simulazione" nella navbar e come hero CTA primario** | index.html, dashboard.html | 🔴 Alta |
| 2.3 | Aggiungere pulsante "Inizia subito gratis" sticky in fondo su mobile | index.html | 🟠 Media |
| 2.4 | Aggiungere reCAPTCHA o proof-of-work lato client per prevenire spam registrazioni | auth.html | 🟠 Media |
| 2.5 | **Aggiungere magic link per login senza password** (opzione) | auth.html | 🟡 Bassa |
| 2.6 | **Aggiungere onboarding progressivo al primo login** (wizard 3 step overlay, non card statica) | dashboard.html | 🔴 Alta |
| 2.7 | Inviare email di benvenuto automatica dopo registrazione (da Supabase) | Supabase config | 🟠 Media |
| 2.8 | Aggiungere "Password dimenticata" funzionante (collegata a Supabase) | auth.html | 🟠 Media |
| 2.9 | Aggiungere CTA "Continua senza registrarti → Simulazione demo" sulla landing | index.html | 🟠 Media |
| 2.10 | Aggiungere pulsanti social proof "🎯 50+ candidati si allenano ora" in hero | index.html | 🟠 Media |

---

## 3. 🎨 UI/UX — PROFESSIONALITÀ & TRUST

| # | Cosa | Descrizione | Priorità |
|---|------|-------------|----------|
| 3.1 | **Aggiungere testimonials reali / recensioni** con foto profilo e nome | La sezione social proof è vuota (solo una riga di testo). Aggiungere 3-4 card testimonial | 🔴 Alta |
| 3.2 | **Aggiungere badge di fiducia** (dati cifrati, pagamenti sicuri, GDPR compliant) nel footer e nella hero | index.html | 🔴 Alta |
| 3.3 | Aggiungere contatore live "X simulazioni completate oggi" | index.html, dashboard.html | 🟠 Media |
| 3.4 | Aggiungere numero di utenti registrati (es. "Unisciti a 1.200+ candidati") | index.html | 🟠 Media |
| 3.5 | Migliorare la **sezione prezzi**: box di comparazione feature per feature, non solo bullet list | index.html | 🟠 Media |
| 3.6 | Aggiungere **comparison table** Free vs Pro vs Coaching con colonne | index.html | 🟠 Media |
| 3.7 | Aggiungere **Stato della simulazione** persistente (se torni alla dashboard, vedi "Hai una simulazione in corso") | dashboard.html | 🟠 Media |
| 3.8 | Migliorare il layout mobile della dashboard (le stat card in colonna su mobile sono troppo piccole) | dashboard.html | 🟠 Media |
| 3.9 | Aggiungere **dark mode toggle** (opzionale) | Globale | 🟡 Bassa |
| 3.10 | Aggiungere **progress bar annuale** ("Hai completato 12/40 simulazioni quest'anno") | dashboard.html | 🟡 Bassa |

---

## 4. 🎬 ANIMAZIONI — ENGAGEMENT

| # | Cosa | Dove | Priorità |
|---|------|------|----------|
| 4.1 | **Aggiungere micro-animazione sul counting delle stats** (GSAP già presente, mancano su alcuni numeri) | dashboard.html | 🟠 Media |
| 4.2 | **Transizione fluida index.html → auth.html** (page transition) | Tutte le pagine | 🟠 Media |
| 4.3 | Animazione **typewriter** sulla hero principale (sottotitolo che si scrive da solo) | index.html | 🟠 Media |
| 4.4 | **GSAP timeline sulla landing** con rivelazione progressiva delle sezioni (già c'è IntersectionObserver, ma si può migliorare) | index.html | 🟠 Media |
| 4.5 | Animazione **particle burst** sul click del CTA principale | index.html | 🟡 Bassa |
| 4.6 | **Micro-interazioni**: hover sulle card con effetto "tilt 3D" (parallasse leggero al mouse) | landing, dashboard | 🟡 Bassa |
| 4.7 | **Confetti animation** al completamento di una simulazione | simulation.html | 🟠 Media |
| 4.8 | **Progressivo loading** con scheletro animato più ricco (non solo shimmer) | dashboard.html, simulation.html | 🟡 Bassa |
| 4.9 | **Scroll-triggered counter** per "persone che si allenano ora" in tempo reale | index.html | 🟡 Bassa |
| 4.10 | **Animated gradient border** sulle card "popolari" (piano Pro) | index.html | 🟡 Bassa |

---

## 5. 💰 FEATURE PER MONETIZZAZIONE

| # | Cosa | Descrizione | Priorità |
|---|------|-------------|----------|
| 5.1 | **Pagamento integrato** (Stripe o Paddle) per piano Pro e Coaching | Collegare un payment provider. Oggi il pricing è finto | 🔴 Alta |
| 5.2 | **Sistema di crediti/simulazioni** per il piano Free (es. 5 simulazioni gratis/mese) | Backend + dashboard | 🔴 Alta |
| 5.3 | **Paywall upgrade** durante la simulazione ("Hai finito le simulazioni gratis. Passa a Pro") | simulation.html | 🟠 Media |
| 5.4 | **Registro delle simulazioni** persistente con storico ricco (non solo le ultime 3) | dashboard.html + nuova pagina | 🟠 Media |
| 5.5 | **Grafico dell'evoluzione del punteggio** (line chart chiaro/struttura/contenuto nel tempo) | dashboard.html | 🟠 Media |
| 5.6 | **Raccomandazione automatica** di aree da migliorare basata sui punteggi | dashboard.html | 🟠 Media |
| 5.7 | **Modalità "Sfida"** con altri utenti in tempo reale (o simulazione condivisa) | simulation.html | 🟡 Bassa |
| 5.8 | **Report PDF** della simulazione (scaricabile) con analisi dettagliata | simulation.html | 🟠 Media |
| 5.9 | **Condivisione social** del punteggio dopo simulazione (con link a concorso-ai) | simulation.html | 🟡 Bassa |

---

## 6. ⚡ FEATURE CORE — MIGLIORAMENTO ESPERIENZA

| # | Cosa | Dove | Priorità |
|---|------|------|----------|
| 6.1 | **Input vocale** (speech-to-text) per rispondere al commissario a voce | simulation.html | 🔴 Alta |
| 6.2 | **Timer + modalità "pressione"** con suono di scadenza (toc toc) | simulation.html | 🟠 Media |
| 6.3 | **Supporto multi-bando** in una singola simulazione (mescolare 2+ bandi) | simulation.html | 🟠 Media |
| 6.4 | **Salvataggio automatico della simulazione** in corso (se chiudi il browser, riprendi) | simulation.html | 🟠 Media |
| 6.5 | **Dark mode** nella simulazione (per occhi stanchi durante studio serale) | simulation.html | 🟡 Bassa |
| 6.6 | **Modalità esame completa**: 30 minuti, 3 materie, difficoltà crescente, timer per domanda | simulation.html | 🟠 Media |
| 6.7 | **Notifica push/web** per reminder "Non hai simulato oggi" | dashboard.html | 🟡 Bassa |
| 6.8 | **Sezione "Errori frequenti"** nella dashboard con suggerimenti specifici | dashboard.html | 🟠 Media |

---

## 7. 📱 RESPONSIVE & PERFORMANCE

| # | Cosa | Priorità |
|---|------|----------|
| 7.1 | Test su mobile reale: la simulation.html è 3900+ righe e potrebbe essere lenta | 🔴 Alta |
| 7.2 | **Lazy loading** delle sezioni sotto la fold nella landing | 🟠 Media |
| 7.3 | **Preconnect** e font-display swap per Inter (già fatto, ma verificare) | 🟡 Bassa |
| 7.4 | **Image optimization** per tutte le immagini (ora non ci sono immagini, ma se aggiungiamo screenshot/schemi) | 🟡 Bassa |
| 7.5 | **Deferred loading** di GSAP e PDF.js (caricarli solo quando servono) | 🟠 Media |
| 7.6 | **Code splitting**: simulation.html è ~142KB, va spezzata in file JS separati | 🟠 Media |
| 7.7 | **Service Worker** per caching offline della landing page | 🟡 Bassa |

---

## 8. 📈 MARKETING & SEO

| # | Cosa | Priorità |
|---|------|----------|
| 8.1 | **Blog** o contenuti SEO su "come superare l'orale del concorso pubblico" (attrae traffico organico) | 🟠 Media |
| 8.2 | **Schema markup** (FAQ, Product, Review) nella landing | 🟠 Media |
| 8.3 | **Meta tag** migliori per ogni pagina (titoli + description unici) | 🟠 Media |
| 8.4 | **Sitemap.xml** con tutte le pagine | 🟡 Bassa |
| 8.5 | **Open Graph images** reali (non SVG inline) per condivisione social | 🟠 Media |
| 8.6 | **Pagine "vs"** (ConcorsoAI vs studio da soli, vs ripetizioni private) per SEO | 🟡 Bassa |
| 8.7 | **Blog tecnico/guida** su "le 10 domande più frequenti in un orale di diritto amministrativo" | 🟡 Bassa |
| 8.8 | **Social proof badges** (numero di utenti, aziende che lo consigliano) | 🟠 Media |

---

## 9. 🐛 BUG & DEBT TECNICO

| # | Cosa | Priorità |
|---|------|----------|
| 9.1 | simulation.html: il CSS ha raggiunto ~142K caratteri, va rifattorizzato **SUBITO** per manutenibilità | 🔴 Alta |
| 9.2 | Standardizzare error handling: oggi ogni pagina ha la sua implementazione di toast/error | 🟠 Media |
| 9.3 | auth.html: il pulsante "Password dimenticata" punta a `auth.html` (stessa pagina) ma non fa nulla | 🟠 Media |
| 9.4 | dashboard.html: il JSON parse di `auth-patch.js` può fallire silenziosamente | 🟠 Media |
| 9.5 | testare il flusso completo: registrazione → upload PDF → simulazione → salvataggio risultato | 🔴 Alta |
| 9.6 | simulation.html: `!important` cleanup — molti ereditati da fix frettolosi | 🟠 Media |

---

## 10. 🚀 LANCIO — COSE DA FARE PRIMA DI PUBBLICARE

| # | Cosa | Priorità |
|---|------|----------|
| 10.1 | Mettere **prezzi veri** con pagamento funzionante (Stripe) | 🔴 Alta |
| 10.2 | Aggiungere **pagine Termini e Privacy** (ci sono, ma vanno verificate con un avvocato) | 🟠 Media |
| 10.3 | Sostituire `['url','path',''].join('')` con variabili d'ambiente reali | 🔴 Alta |
| 10.4 | **Test di carico** per l'API `/api/chat` (quanto tiene prima di andare in timeout?) | 🟠 Media |
| 10.5 | **Analytics** (Plausible o GA4) su tutte le pagine | 🟠 Media |
| 10.6 | **Tracking conversioni** (registrazione, simulazione iniziata, completata) | 🟠 Media |
| 10.7 | **Email di conferma** registrazione + email di benvenuto con primo passo guidato | 🟠 Media |
| 10.8 | **Piano di lancio**: Product Hunt, BetaList, directory concorsi, gruppi Telegram/WhatsApp | 🟠 Media |

---

## ⚡ PRIORITÀ ASSOLUTE — DA FARE SUBITO

1. **Rimuovere AI slop** (emoji, join pattern, placeholders) — Leggerezza percepita
2. **Accedi + Registrati + Inizia Simulazione** nella navbar di TUTTE le pagine — Conversione
3. **Aggiungere CTA primario "Inizia gratis" nella hero** con secondary CTA "Registrati"
4. **Prezzi reali** e pagamento Stripe — Monetizzazione
5. **Refactoring simulation.html** in file separati (CSS + JS) — Manutenibilità
6. **Testimonial reali** o almeno foto profilo e nome — Social proof
7. **Input vocale** — Killer feature per un orale simulato
8. **Onboarding guidato** alla prima registrazione — Riduce churn post-signup

---

> **Nota**: Ogni task ha una colonna `Priorità` (🔴 Alta / 🟠 Media / 🟡 Bassa). Inizia dall'alto e scendi. I task con **grassetto** sono quelli che hanno più impatto sulla conversione e sulla percezione professionale del prodotto.