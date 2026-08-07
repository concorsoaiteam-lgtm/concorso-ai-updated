# ConcorsoAI — Report Tecnico: Voce (STT + TTS)

> **Scopo**: scegliere la pipeline vocale per la simulazione orale — trascrizione che *ascolta davvero* (STT + paralinguistici) e voce della commissione naturale (TTS) — con budget ~zero, licenza commerciale e scalabilità futura.
> **Stato**: documento di ricerca e proposta — **nessuna implementazione**.

## ✅ DECISIONE FINALE (registrata il 07/08/2026)

| Scelta | Valore | Motivazione sintetica |
|---|---|---|
| **STT** | **Deepgram Nova-3** (streaming WebSocket) | Word timestamps, funziona su tutti i browser, $200 crediti iniziali (~430 ore), poi ~$0,0077/min. Architettura con chiave effimera via proxy Vercel. |
| **TTS** | **Kokoro on-device** (Apache 2.0, WASM) | €0, illimitato, voci italiane native (`if_sara`/`im_nicola`), zero latenza di rete. Nessuna chiave. |
| **Ambito lancio** | **Voce + paralinguistici completi** | Subito pause, time-to-answer, velocità, fillers, autocorrezioni, interruzioni nel report. Costo comunque €0 (Silero VAD client-side). |
| **Fallback** | Web Speech API (solo ultima risorsa) · Google Neural2 (TTS cloud futuro) | Come da report §9 e §6.2. |

**Implicazioni**: serve una `VITE_DEEPGRAM_API_KEY` (server-side, mai nel client — proxy su Vercel Function con ephemeral key). Nessuna chiave per il TTS (Kokoro gira nel browser). Prossimo passo: implementazione della Fase 0→3 del percorso (§7.1).
> **Metodo**: ogni affermazione supportata da fonti autorevoli (paper, documentazione ufficiale, pricing page). I numeri di prezzo/limiti vanno **rivalidati al momento dell'implementazione** (cambiano spesso).

---

## INDICE

1. [Contesto e obiettivi](#1-contesto-e-obiettivi)
2. [Stato attuale del progetto](#2-stato-attuale-del-progetto)
3. [Requisiti](#3-requisiti)
4. [PARTE A — STT: la trascrizione](#4-parte-a--stt-la-trascrizione)
5. [PARTE B — I paralinguistici: il vero differenziatore](#5-parte-b--i-paralinguistici-il-vero-differenziatore)
6. [PARTE C — TTS: la voce della commissione](#6-parte-c--tts-la-voce-della-commissione)
7. [Architettura proposta](#7-architettura-proposta)
8. [Costi e scalabilità](#8-costi-e-scalabilità)
9. [Rischi, limiti e fallback](#9-rischi-limiti-e-fallback)
10. [Proposta finale e decisioni da prendere](#10-proposta-finale-e-decisioni-da-prendere)
11. [Riferimenti](#11-riferimenti)

---

## 1. Contesto e obiettivi

L'obiettivo non è un chatbot con microfono: è una **commissione che ascolta davvero il candidato**. Due esigenze distinte:

1. **STT (utente → testo)**: trascrivere con streaming e *conservare* ciò che le trascrizioni normali buttano via: pause, esitazioni, "ehm", autocorrezioni, cambi di ritmo, tempo di risposta, velocità del parlato, interruzioni. Questi dati entrano nel feedback finale (Parte 5 del documento simulation-research.md: feedback elaborato su *processo*, non solo su contenuto).
2. **TTS (commissione → voce)**: una voce naturale in italiano, **non** la classica voce del browser (`speechSynthesis`), gratuita o quasi, con licenza commerciale.

Vincoli espliciti dell'utente:
- il parlato non deve sembrare economico;
- Web Speech API (sintesi) è ammessa **solo come fallback**;
- budget praticamente zero;
- decidere insieme, con report completo prima di toccare il codice.

## 2. Stato attuale del progetto

- **Verifica effettuata**: nessuna occorrenza di `speechSynthesis`, `SpeechRecognition`, `MediaRecorder`, `getUserMedia`, `audio` in `public/**` (html e js). **Non esiste alcun codice vocale**: campo libero, nessun debito.
- **Stack rilevante**: app statica HTML/CSS/JS su Vercel, funzioni serverless (`api/`), Supabase, LLM via OpenRouter/OmniRouter (fallback multi-provider già in produzione).
- **Implicazione architetturale**: le chiavi API non vanno mai nel client. STT/TTS cloud dovranno passare da una Vercel Function (proxy) o usare chiavi effimere (ephemeral keys) — vedi §7.

## 3. Requisiti

| Area | Requisito |
|---|---|
| **STT** | Streaming (risultati parziali), ottimo italiano, word timestamps (per i paralinguistici), latenza percepita bassa |
| **STT costi** | €0 a breve; costo per minuto trascurabile a regime; nessun limite giornaliero killer |
| **Paralinguistici** | Pause (durata/frequenza/posizione), time-to-answer, velocità (WPM), fillers ("ehm"), autocorrezioni, interruzioni |
| **TTS** | Naturale in italiano, licenza commerciale, latenza < 500ms, integrazione semplice |
| **TTS costi** | Free tier generoso o on-device illimitato; costo per carattere basso |
| **Privacy** | Consenso microfono; audio non conservato se non necessario |
| **Fallback** | Web Speech API solo come ultima risorsa |

---

# 4. PARTE A — STT: la trascrizione

## 4.1 Le opzioni valutate

| Opzione | Qualità IT | Latenza | Costo reale | Free tier / limiti | Integrazione web | Licenza commerciale |
|---|---|---|---|---|---|---|
| **Whisper API (OpenAI)** | Eccellente (99 lingue) | 1–3s (chunk) | $0.006/min | A pagamento da subito | REST + MediaRecorder | ✅ |
| **Groq Whisper (v3 / v3 Turbo)** | Eccellente (stessi pesi) | Molto bassa (LPU) | v3 $0.111/ora · Turbo $0.04/ora | Free tier con rate limit | REST, veloce | ✅ |
| **Deepgram Nova-3 (streaming)** | Eccellente, 36+ lingue | < 300ms (WebSocket) | ~$0.0077/min | **$200 crediti gratis** (nuovi account) | WebSocket nativo browser | ✅ |
| **AssemblyAI (streaming)** | Molto buona; streaming su 6 lingue (IT incluso) | Bassa | ~$0.15–0.45/ora | Crediti prova | WebSocket + SDK | ✅ |
| **ElevenLabs Scribe v2 Realtime** | Ottima, 90+ lingue | < 150ms | $0.22–0.39/ora | Crediti prova | WebSocket | ✅ |
| **Whisper locale (faster-whisper / whisper.cpp)** | Eccellente (stessi pesi) | 1–4s (dip. hardware) | **€0** (compute proprio) | Illimitato | WASM nel browser o backend Python | MIT/Apache-2.0 ✅ |
| **Vosk (offline)** | Buona ma sotto Whisper su parlato spontaneo accademico | Istantanea offline | **€0** | Illimitato | WASM/WebWorker | Apache-2.0 ✅ |
| **webkitSpeechRecognition (nativa)** | Molto buona (backend Google) | Quasi reale (interim) | **€0** | Illimitata | API nativa, zero backend | ✅ (Chrome/Edge/Safari solo in parte) |

## 4.2 Il punto chiave: Whisper non è nato per lo streaming

Whisper è un modello *non causale*: per trascrivere deve vedere l'audio completo. Il paper **"Turning Whisper into Real-Time Transcription System" (arXiv:2307.14743)** risolve il problema con:
- un **Voice Activity Detection (VAD)** che segmenta l'audio in arrivo;
- una **local agreement policy** (solo segmenti "stabili" vengono emessi);
- latenza ~3.3s senza attendere la fine dell'enunciato.

Implementazioni pronte: `ufal/whisper_streaming` (Python), `faster-whisper`, `whisper.cpp` (WASM nel browser possibile, ma download modello pesante).

**Conseguenza pratica**: per uno streaming vero, o si usa un servizio nativamente streaming (Deepgram, AssemblyAI, ElevenLabs Scribe, webkitSpeechRecognition) oppure si fa chunking 1–2s verso Groq/OpenAI (accettabile ma meno "vivo").

## 4.3 Analisi per il nostro caso

- **webkitSpeechRecognition** (Chrome/Edge, Android): **gratis, illimitata, ottimo italiano, risultati interim quasi in tempo reale, zero backend e zero chiavi**. Limiti reali: nessun word timestamp esposto, niente su Firefox, fillers spesso filtrati dal backend Google, dipendenza dalla rete/browser.
- **Deepgram Nova-3**: il miglior rapporto qualità/costo **streaming** con word timestamps e gestione fillers; i **$200 di crediti iniziali** coprono ~26.000 minuti (~430 ore) di trascrizione — moltissimo per un lancio.
- **Groq Whisper Turbo**: la via più economica *a regime* ($0.04/ora ≈ $0.0007/min, ~10x meno di OpenAI), non streaming ma velocissima; word timestamps via `verbose_json`.
- **Whisper locale**: €0 e privacy totale, ma serve un server Python (o WASM pesante) e la latenza dipende dall'hardware dell'utente.

> **Verdetto parziale**: la scelta STT è **secondaria** rispetto al VAD per i paralinguistici (Parte B). Qualunque ASR si scelga, i dati di *pause/tempo/velocità/interruzioni* vengono calcolati client-side con il VAD, non dall'ASR.

---

# 5. PARTE B — I paralinguistici: il vero differenziatore

Questa è la parte che distingue il prodotto da una chat AI: valutare **come** il candidato parla, non solo **cosa** dice.

## 5.1 Cosa catturare e come

| Segnale | Come si misura | Strumento |
|---|---|---|
| **Tempo di risposta** (time-to-answer) | Delta tra fine della domanda (audio TTS) e inizio del parlato del candidato | VAD client-side (onset del primo segmento di voce) |
| **Pause** (durata, frequenza, posizione) | Intervalli silenziosi tra segmenti di parlato; distinzione pausa a confine di frase (naturale) vs **pausa intra-clausola** (difficoltà di formulazione) | VAD + word timestamps (posizione della pausa rispetto alla sintassi) |
| **Velocità del parlato** | WPM (parole ÷ durata totale) e **articulation rate** (parole ÷ solo tempo di fonazione) | Transcript + VAD |
| **Fillers / esitazioni** ("ehm", "beh", "allora…") | Conteggio nel transcript (se l'ASR li conserva) + rilevazione acustica delle vocalizzazioni non lessicali | Transcript + analisi energia (Microsoft: disfluency detection da audio non trascritto) |
| **Autocorrezioni / ripetizioni** | Pattern di backtracking nel transcript temporizzato (ripetizione di parole in <1.5s) | Word timestamps |
| **Interruzioni** | Overlap tra parlato del candidato e audio della commissione (confronto timeline TTS vs VAD) | Timeline locale |

## 5.2 La base scientifica

- **Fluenza = velocità + rotture + riparazioni** (framework di Skehan: *speed, breakdown, repair*): è il modello standard per valutare la fluenza orale (Skehan 2003; Yan et al. 2025).
- Le **disfluenze non avvengono isolate**: formano *cluster* (pause + autocorrezioni + fillers insieme) che predicono il livello di competenza orale (Yan et al., *Studies in Second Language Acquisition*, 2025).
- **Dove cade la pausa conta**: pause a confine di frase = normale pianificazione; pause a metà clausola = rottura della formulazione (Huensch; Yan et al. 2025).
- **Mean Length of Run** (sillabe medie tra due pause): correlato ai livelli alti in IELTS/TOEFL (Tavakoli et al., British Council).
- **Speech rate vs articulation rate**: la variazione di velocità percepita è guidata dalle *pause*, non dalla velocità articolatoria (CSAP, Angelopoulou et al. 2024, *Brain Sciences*).
- La **rilevazione automatica delle disfluenze direttamente dall'audio** (senza trascrizione) è fattibile e matura (Microsoft Applied Sciences, "Automatic Disfluency Detection from Untranscribed Speech", 2023).

## 5.3 Architettura a costo zero (client-side)

1. `getUserMedia()` + filtro high-pass (80–100Hz) via Web Audio API.
2. **Silero VAD v5 in WASM** (`@ricky0123/vad`): <1ms per frame da 30ms sulla CPU del client → segmenti di parlato `[{start, end}]` con precisione → **pause, time-to-answer, phonation time**.
3. ASR (Parte A) per il testo + word timestamps.
4. **Fusione client-side**: correlazione word timestamps ↔ segmenti VAD → WPM, articulation rate, fillers, autocorrezioni, pause intra-clausola.
5. I risultati alimentano il report (feedback su processo) e la memoria sintetica dell'utente (diario errori).

**Costo: €0.** Tutto gira sul dispositivo dell'utente; nessun audio salvato (solo metriche).

---

# 6. PARTE C — TTS: la voce della commissione

## 6.1 On-device (gratis, illimitato)

| Motore | Qualità voci IT | Latenza (RTF CPU) | Costo | Integrazione browser | Licenza commerciale |
|---|---|---|---|---|---|
| **Kokoro-82M** | **Eccellente** (StyleTTS2, prosodia molto naturale); voci IT `if_sara` / `im_nicola` | RTF 0.1–0.2 | **€0** (82M params) | WASM via sherpa-onnx (download ~75–300MB) | **Apache 2.0 ✅** |
| **Piper** | Buona (VITS, pulita ma a volte sintetica); `it_IT-paola`, `it_IT-riccardo` | RTF 0.05–0.1 | **€0** | WASM via sherpa-onnx | MIT (repo originale) ma fork attivo **GPL-3.0** ⚠️ |
| **Coqui XTTS-v2** | Eccellente (clonazione voce, multilingue) | Lenta su CPU (serve GPU) | €0 software ma serve server GPU | Difficile nel browser | **CPML: NON commerciale** ❌ |
| **Meta MMS-TTS** | Discreta, piatta | RTF ~0.1 | €0 | ONNX/WASM possibile | **CC-BY-NC 4.0: NON commerciale** ❌ |

> **Kokoro** è la scelta on-device chiara: licenza **Apache 2.0**, voci italiane native, qualità molto naturale per un modello così piccolo, eseguibile in WASM nel browser. **Piper** è il piano B (ma occhio al fork GPL). **XTTS-v2 e MMS sono escluse per licenza** (non commerciali).

## 6.2 Cloud (free tier / pagamento)

| Provider | Qualità IT | Free tier | Costo a regime | Latenza | Integrazione | Licenza commerciale |
|---|---|---|---|---|---|---|
| **Azure Neural TTS** | **Top** (`it-IT-ElsaNeural`, `IsabellaNeural`, `DiegoNeural`), SSML completo | **500K char/mese** (F0) | ~$16/1M char | 100–300ms | REST/WebSocket, SDK JS | ✅ |
| **Google Cloud TTS Neural2** | Molto buona (`it-IT-Neural2-A/C`) | **1M char/mese** | ~$16/1M char | 200–400ms | REST/gRPC, SDK | ✅ |
| **ElevenLabs Multilingual v2** | **Strepitosa** (espressività) | 10K crediti/mese (~10 min) | ~$100/1M char (10x) | 250–400ms | REST/WebSocket | ✅ (su piani a pagamento) |
| **OpenAI tts-1** | Buona, fluida | Nessuno | $15/1M char | 150–250ms | REST | ✅ |
| **Deepgram Aura-2** | Buona, per agenti vocali | Crediti prova | ~$30/1M char | <200ms | WebSocket | ✅ |
| **Cartesia Sonic** | Alta espressività | Crediti prova | Pay-as-you-go | **75–150ms** | WebSocket/SSE | ✅ |
| **Unreal Speech** | Discreta, a volte rigida in IT | Free tier piccolo | $4–8/1M char | ~300ms | REST | ✅ |
| **edge-tts (non ufficiale)** | Eccellente (stesse voci Azure) | "Gratis" | €0 | 200–400ms | Solo wrapper | ❌ **Viola i ToS Microsoft in produzione** |

## 6.3 Analisi e verdetti

- **`edge-tts` esclusa per produzione**: usa l'endpoint pubblico "Read Aloud" di Microsoft via reverse engineering → viola i Termini di Servizio, rischio blocco IP/ban. Utilizzabile solo per demo/prototyping interno.
- **Azure vs Google**: entrambe eccellenti, SSML (pause, enfasi, pronuncia), licenza commerciale, ~$16/1M. **Google offre il doppio del free tier** (1M vs 500K char/mese).
- **ElevenLabs**: la voce più espressiva in assoluto, ma **10x il costo** e free tier minuscolo (10 min/mese). Perfetta come **voce premium del piano Pro** in futuro, non come default.
- **Kokoro on-device**: €0, illimitato, Apache 2.0, buona naturalezza — **il default perfetto per il vincolo "budget zero"**, con latenza zero di rete.
- **OpenAI/Cartesia/Deepgram/Unreal/Play.ht**: valide ma senza un vantaggio decisivo su Azure/Google/Kokoro per il nostro caso.

> **Verdetto TTS**: default **Kokoro on-device (€0, illimitato)**; upgrade **Google Cloud Neural2** (free 1M char/mese, SSML, licenza commerciale) per chi vuole la massima naturalezza cloud; **ElevenLabs riservata al piano Pro**; `speechSynthesis` solo come fallback ultimo.

---

# 7. Architettura proposta

```
┌─ BROWSER (client) ─────────────────────────────────────────────┐
│  getUserMedia() → Web Audio (high-pass)                        │
│      │                                                         │
│      ├─ Silero VAD (WASM, locale) → segmenti di parlato        │
│      │        → pause, time-to-answer, phonation time,          │
│      │          interruzioni (vs timeline TTS)                  │
│      │                                                          │
│      └─ STT (scelta) → transcript + word timestamps             │
│                → WPM, articulation rate, fillers, autocorr.     │
│                                                                 │
│  Fusione metriche (locale) → Feedback + Memoria (Supabase)      │
│                                                                 │
│  TTS: Kokoro (WASM) di default → audio commissione             │
│       │ (fallback: Vercel Function → Google/Azure)              │
└──────────────┬───────────────────────────────┬─────────────────┘
               │ (solo se cloud STT)           │ (solo se cloud TTS)
               ▼                               ▼
┌─ VERCEL FUNCTION (proxy) ──────────────── (chiavi server-side) ┐
│  Deepgram/Groq (STT) · Google/Azure (TTS) · OpenAI (LLM)        │
└─────────────────────────────────────────────────────────────────┘
```

Regole non negoziabili:
1. **Chiavi API mai nel client**: proxy serverless o ephemeral key (Deepgram le supporta).
2. **Il VAD è client-side e sempre attivo**: è la fonte dei paralinguistici, indipendente dall'ASR scelto.
3. **Nessun audio salvato**: si conservano solo metriche + transcript (e solo se l'utente acconsente).
4. **Consenso microfono esplicito** e UX che mostra lo stato "la commissione ti ascolta" (feedback dal vivo = la sensazione di essere ascoltati).
5. **Latenza di risposta della commissione**: delay dinamico proporzionale (Gnewuch et al., 2018 — la risposta istantanea è percepita come robotica), vedi simulation-research.md Parte 6.

## 7.1 Percorso di implementazione consigliato

| Fase | Cosa | Costo | Note |
|---|---|---|---|
| **0** | Architettura audio + consenso + VAD Silero (WASM) + metriche base | €0 | Indipendente dalla scelta ASR |
| **1** | STT nativa (`webkitSpeechRecognition`) come MVP streaming | €0 | Chrome/Edge/Android; UI avvisa se browser non supportato |
| **2** | Deepgram Nova-3 via proxy (o Groq Turbo) per browser non-Chrome + word timestamps | $0 (crediti) → ~$0.0077/min | Upgrade trasparente, stessa architettura |
| **3** | TTS Kokoro on-device (sherpa-onnx WASM) + voci commissione (femmina/maschio) | €0 | Caching modello nel client |
| **4** | Fallback TTS cloud (Google Neural2) + SSML per pause/enfasi | $0 (1M char/mese) | Solo quando serve |
| **5** | Feedback vocale completo: paralinguistici → report + diario errori | €0 | Il differenziatore |
| **6** (futuro) | Voci premium ElevenLabs per piano Pro; Whisper locale per privacy totale | a pagamento | Upsell |

---

# 8. Costi e scalabilità

## 8.1 STT
- **Zero-cost**: `webkitSpeechRecognition` — illimitato, gratis.
- **Cloud a regime**: Deepgram ~$0.0077/min ≈ **$0,46/ora**; con i $200 di crediti iniziali ≈ **430 ore di trascrizione gratis**. Groq Turbo: ~$0,04/ora (10x meno di OpenAI) come alternativa a costo minimo.
- **Locale**: faster-whisper/whisper.cpp €0 ma richiede server o WASM pesante.

## 8.2 TTS
- **On-device Kokoro**: €0, illimitato, nessuna latenza di rete, nessuna chiave → **scala senza costi marginali**.
- **Cloud**: Google 1M char/mese gratis (~20–30 min di parlato per la voce della commissione? no: ~1M char ≈ 2–3 ore di parlato) poi ~$16/1M char. Con ~150–300 char a battuta di commissione, 1M char ≈ **3.000–6.000 battute gratis al mese**.

## 8.3 Modello di costo per sessione (stima ordine di grandezza)
| Componente | Costo/sessione (20 min) |
|---|---|
| VAD + metriche (client) | €0 |
| STT nativa | €0 |
| STT Deepgram (se cloud) | ~$0,15 |
| TTS Kokoro (on-device) | €0 |
| TTS Google (se cloud, ~2.000 char) | ~$0,03 |
| LLM (già in produzione, OmniRouter) | variabile, già ottimizzato |

→ **Sessione a costo ~zero** con la configurazione default; **<$0,20** anche con tutto cloud.

---

# 9. Rischi, limiti e fallback

| Rischio | Impatto | Mitigazione |
|---|---|---|
| `webkitSpeechRecognition` solo su Chrome/Edge | Utenti Firefox/Safari senza STT | Fase 2: Deepgram via proxy; messaggio chiaro + fallback testo |
| Nessun word timestamp dalla STT nativa | Metriche di velocità meno precise | Il VAD fornisce comunque pause/tempo/velocità; i timestamp arrivano con Deepgram/Groq |
| Fillers filtrati dall'ASR | "ehm" persi nel transcript | Rilevazione acustica (Microsoft disfluency) + conteggio dei filler lessicali conservati |
| Qualità voci on-device percepita inferiore al cloud | Sensazione "economica" | Doppio percorso: Kokoro default, Google/ ElevenLabs come upgrade; test d'ascolto con utenti reali prima del lancio |
| Licenze: XTTS-v2/MMS non commerciali | Rischio legale | Escluse a monte (§6.1) |
| `edge-tts` | Violazione ToS, blocchi | Vietata in produzione (§6.3) |
| Modello Kokoro pesante nel browser | Download iniziale lungo | Quantizzazione (~75MB), caching, caricamento progressivo con skeleton |
| Prezzi/limiti free tier che cambiano | Sorprese di costo | Numeri rivalidati a ogni rilascio; architettura swappabile (interfaccia astratta ASR/TTS) |

---

# 10. Proposta finale e decisioni da prendere

## Proposta (default consigliato)

1. **STT**: `webkitSpeechRecognition` per l'MVP a costo zero (Chrome/Edge) **+ architettura pronta** per Deepgram Nova-3 via proxy (crediti $200) come upgrade universale con word timestamps.
2. **Paralinguistici**: **Silero VAD client-side** — sempre, in ogni configurazione. È il cuore del valore.
3. **TTS**: **Kokoro on-device (Apache 2.0)** come voce di default della commissione (€0, illimitato, nessuna chiave); **Google Cloud Neural2** come upgrade cloud con SSML; **ElevenLabs** riservata al piano Pro; **`speechSynthesis` solo come fallback**.
4. **Feedback**: i paralinguistici entrano nel report (velocità, pause, fillers, tempo di risposta, interruzioni) e nel diario errori.

## Decisioni da prendere insieme

- **D1 — STT**: nativa (€0, MVP) → Deepgram (qualità universale) → Groq (costo minimo a regime) → locale (privacy)? O una combinazione a fasi?
- **D2 — TTS**: Kokoro on-device (€0) vs Google cloud (free 1M char) vs entrambi con fallback?
- **D3 — Ambito voce per il lancio**: solo TTS commissione + risposta scritta (transcrizione visibile), o anche feedback paralinguistico completo da subito?
- **D4 — Priorità**: la voce prima o dopo le altre feature di simulation-research.md (P0: banca domande, voce commissione testuale)?

---

# 11. Riferimenti

## STT e streaming
1. Turning Whisper into Real-Time Transcription System (arXiv:2307.14743) — https://arxiv.org/abs/2307.14743
2. ufal/whisper_streaming (implementazione del paper) — https://github.com/ufal/whisper_streaming
3. Groq Speech-to-Text docs & pricing — https://console.groq.com/docs/speech-to-text · https://groq.com/pricing
4. Deepgram pricing (crediti free, costi streaming) — https://deepgram.com/pricing
5. AssemblyAI Real-Time STT — https://www.assemblyai.com/products/streaming-speech-to-text
6. ElevenLabs Scribe v2 Realtime — https://elevenlabs.io/blog/introducing-scribe-v2-realtime
7. OpenAI Whisper API — https://openrouter.ai/openai/whisper-1 (proxy) / OpenAI docs
8. Vosk (offline ASR, Apache-2.0) — https://alphacephei.com/vosk/
9. MDN Web Speech API — https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API

## Paralinguistici e fluenza
10. Silero VAD (GitHub) — https://github.com/snakers4/silero-vad
11. ricky0123/vad (Silero VAD in browser/WASM) — https://github.com/ricky0123/vad
12. Yan et al. (2025), Disfluency doesn't happen in isolation — https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/disfluency-doesnt-happen-in-isolation/CD61D198FCEE38E178225AE2245AC2B0
13. Bamdev et al. (2023), Automated Speech Scoring System Under The Lens — https://link.springer.com/article/10.1007/s40593-022-00291-5
14. Handley (2023), What do the Measures of Utterance Fluency in ASE tell us — https://eprints.whiterose.ac.uk/id/eprint/206035/
15. Angelopoulou et al. (2024), Quantifying silent pauses, speech rate, articulation rate (CSAP) — https://pmc.ncbi.nlm.nih.gov/articles/PMC11119743/
16. Microsoft Applied Sciences (2023), Automatic Disfluency Detection from Untranscribed Speech — https://www.microsoft.com/applied-sciences/uploads/publications/134/automatic-disfluency-detection.pdf
17. Tavakoli et al., Scoring Validity of the Aptis Speaking Test (British Council) — https://www.britishcouncil.org/sites/default/files/tavakoli_et_al_layout.pdf

## TTS
18. Kokoro-82M (Apache 2.0, voci IT) — https://huggingface.co/hexgrad/Kokoro-82M
19. Piper TTS (repo e licenze) — https://github.com/rhasspy/piper · https://github.com/rhasspy/piper/discussions/271
20. Coqui XTTS-v2 (CPML non commerciale) — https://huggingface.co/coqui/XTTS-v2 · https://github.com/coqui-ai/TTS/discussions/4304
21. Meta MMS-TTS (CC-BY-NC) — https://ai.meta.com/blog/multilingual-model-speech-recognition/
22. sherpa-onnx (runtime WASM per Piper/Kokoro) — https://github.com/k2-fsa/sherpa-onnx
23. Azure Speech pricing & language support — https://azure.microsoft.com/en-us/pricing/details/speech/ · https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support
24. Google Cloud TTS pricing & voci — https://cloud.google.com/text-to-speech/pricing
25. ElevenLabs pricing API — https://elevenlabs.io/pricing/api
26. OpenAI tts-1 — https://developers.openai.com/api/docs/models/tts-1
27. Deepgram TTS — https://deepgram.com/product/text-to-speech
28. Cartesia Sonic — https://www.cartesia.ai/sonic
29. edge-tts (avviso ToS) — https://github.com/rany2/edge-tts
30. Gnewuch et al. (2018), Dynamic response delays in human-chatbot interaction — https://aisel.aisnet.org/ecis2018_rp/113/

---

*Documento di ricerca e proposta. Nessun codice prodotto. Numeri di prezzo e free tier da rivalidare al momento dell'implementazione.*
