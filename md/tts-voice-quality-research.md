# ConcorsoAI — Ricerca: una voce realistica per la commissione (TTS)

> **Stato**: ricerca e proposta — **nessuna implementazione** (come da workflow: prima decidiamo).
> **Data**: 08/08/2026 · **Obiettivo**: sostituire la voce `speechSynthesis` del browser (funziona dal round 72, ma è robotica) con una voce italiana realistica che legge bene, con budget ~zero e licenza commerciale.
> **Metodo**: fonti verificabili (repo ufficiali, model card HuggingFace, docs e pricing page dei provider). I numeri di costo/free tier vanno **rivalidati al momento dell'implementazione** (cambiano spesso).

---

## 0. Il punto di partenza

- **Oggi**: la commissione parla con `speechSynthesis` (voce di sistema it-IT). Funziona end-to-end (round 72) ma suona sintetica e "da app economica".
- **Vincoli**: budget ~zero, **italiano** corretto, licenza **commerciale**, latenza bassa, mobile ok, nessuna dipendenza fragile.
- **Buona notizia**: lo slot provider è già pronto in `voice.js` (`V.ttsProvider` / `effectiveProvider`, round 72). Qualunque opzione scelta si inserisce senza toccare la UI, il player o il turn-taking. La voce resta intercambiabile.

---

## 1. Correzione a una decisione precedente (importante)

Il report `voice-stt-tts-report.md` (§6, 07/08) aveva scelto **Kokoro on-device con "voci italiane native"** come default. **Questa premessa è sbagliata** e va corretta (verificato oggi):

| Canale | Stato italiano Kokoro |
|---|---|
| `kokoro-js` 1.2.1 (Transformers.js) | Solo inglese: voci `af_*`/`am_*`/`bf_*`/`bm_*`, phonemizer hardcoded `en`/`en-us`. **Niente italiano.** |
| `sherpa-onnx` (k2-fsa) | Supporta Kokoro **solo inglese+cinese**. La mappa voci contiene `if_sara`/`im_nicola` ma il warning ufficiale dice: *"It is a multi-lingual model, but we only add English and Chinese support for it"* ([docs sherpa-onnx Kokoro](https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/kokoro.html)). |
| Port multilingue sperimentali (es. spazi HF `kokoro-multi-lang-wasm`) | Demo sperimentali, non affidabili per produzione. |

**Conclusione**: oggi **nessuna voce Kokoro italiana on-device nel browser**. Kokoro resta un'ottima opzione per il futuro (il modello multilingue Python la supporta), ma non per questo round.

---

## 2. Cosa rende una voce "realistica" (in sintesi)

- Il **MOS (Mean Opinion Score)** è la metrica standard: punteggi ≥ ~4.0 sono percepiti come "qualità broadcast/radiofonica"; sotto ~3.5 si avverte la sintesi.
- Le architetture moderne (VITS, StyleTTS2/flow-matching, diffusion) hanno superato le voci concatenative e soprattutto le voci di sistema del browser, che variano moltissimo per OS e suonano piatte.
- Riferimenti utili: il modello **Kokoro-82M** (StyleTTS2, 82M parametri, Apache-2.0) rivendica nei test alla cieca del repo una qualità vicina a ElevenLabs ([github.com/hexgrad/kokoro](https://github.com/hexgrad/kokoro)); **Piper** (VITS) è descritto come pulito ma a volte "sintetico" (MOS di stima community ~3.8–4.2, vedi [piper-samples](https://rhasspy.github.io/piper-samples/)).
- Nota di precisione: il paper tecnico di Kokoro **non è su arXiv** (verificato: 0 risultati in `export.arxiv.org`); la documentazione ufficiale è il repo GitHub e la [model card HF](https://huggingface.co/hexgrad/Kokoro-82M).

---

## 3. Opzioni ON-DEVICE (€0, illimitati, senza chiavi)

| Motore | Italiano | Qualità | Licenza commerciale | Download/latenza | Integrazione |
|---|---|---|---|---|---|
| **Piper `it_IT-paola` / `it_IT-riccardo`** via **sherpa-onnx-wasm** | ✅ voci it-IT reali | Buona (VITS, pulita, ritmo naturale) | Motore **Apache-2.0** (sherpa-onnx) ✅; voce: licenza per-file da verificare su `rhasspy/piper-voices` (la maggior parte permissiva) | ~60 MB (high) / ~25 MB (medium); RTF <0.1 → on-device veloce anche su mobile | WASM + ONNX Runtime Web, modello già in cache dopo il primo download |
| Kokoro italiano nel browser | ❌ impossibile oggi (vedi §1) | — | — | — | — |
| `speechSynthesis` (attuale) | ✅ it-IT | Povera/robotica | ✅ | 0 | Resta solo come **fallback ultimo** |

> **Perché sherpa-onnx e non piper diretto**: il motore Piper attivo oggi (`OHF-Voice/piper1-gpl`) è **GPL-3.0** — problematico per un SaaS chiuso; il vecchio `rhasspy/piper` (MIT) è archiviato. **sherpa-onnx è Apache-2.0** e carica i modelli Piper (VITS) identici: via pulita per uso commerciale. sherpa-onnx supporta WASM nativo ([repo](https://github.com/k2-fsa/sherpa-onnx), sezione "It also supports WebAssembly").

---

## 4. Opzioni CLOUD (qualità massima; free tier o quasi-zero)

| Provider | Qualità it-IT | Free tier | Costo a regime | Latenza | Note |
|---|---|---|---|---|---|
| **Google Cloud TTS (Neural2/Wavenet it-IT)** | Ottima, molto naturale | ~**1M caratteri/mese** gratis | ~$16/1M | 200–400 ms | Richiede account GCP + billing abilitato; SSML completo (pause, enfasi, pronuncia) |
| Azure Speech (it-IT neural: Elsa, Isabella, Diego, Gianni) | Ottima | F0 ~**500K caratteri/mese** | ~$16/1M | 100–300 ms | Account Azure; SSML completo |
| OpenAI `gpt-4o-mini-tts` | Buona/ottima | Nessuno | **$0.60/1M** (molto economico) | 150–250 ms | Nessuna voce dedicata it-IT ma multilingue solido |
| ElevenLabs Multilingual | **Strepitosa** (espressiva) | ~10K crediti ≈ **10 min/mese** (non scala) | ~$100/1M (10×) | 250–400 ms | Riservata al **piano Pro** futuro |
| edge-tts (stesse voci Azure, "gratis") | Eccellente | "Gratis" | €0 | 200–400 ms | **Esclusa per produzione**: endpoint reverse-engineered di Microsoft, viola i ToS, rischio blocco IP |

*(numeri da `voice-stt-tts-report.md` §6.2, da rivalidare sulle pricing page ufficiali al momento dell'implementazione)*

---

## 5. Raccomandazione (due livelli, stesso slot provider)

### ✅ Scelta 1 — Subito, €0 per sempre: **Piper `it_IT` on-device via sherpa-onnx-wasm**
- Voce italiana vera, naturale, on-device: **nessuna chiave, nessun costo, funziona offline e su mobile**.
- Un solo download iniziale (~25–60 MB) messo in cache; dopo il primo utilizzo è quasi istantaneo.
- Si integra nel provider slot già esistente: basta un nuovo ramo `"piper"` in `effectiveProvider()`, stesso player Web Audio, stessi controlli pausa/velocità.
- Fallback automatico già presente: se il WASM non si carica → `speechSynthesis`.

### ✅ Scelta 2 — Qualità massima gratuita: **Google Cloud TTS (free tier ~1M char/mese)**
- La voce più naturale tra le opzioni gratuite; SSML per le pause naturali della commissione.
- Costo: €0 fino a ~1M caratteri/mese (≈ centinaia di simulazioni). Richiede: account Google Cloud + billing + una chiave **server-side** (mai nel client) → piccolo proxy `/api/tts` su Vercel (stesso pattern di `/api/stt`).
- Buona architettura "mista": Piper on-device come default, Google come upgrade quando serve più naturalezza.

### 🔮 Futuro (piano Pro): **ElevenLabs**
- La voce più espressiva in assoluto; va inserita nello stesso slot quando ci sarà un piano a pagamento (e il free tier da 10 min/mese è troppo piccolo per il default).

---

## 6. Costi stimati per sessione

- **Piper**: €0, illimitato.
- **Google free tier**: una sessione usa ~1–2K caratteri di testo parlato (domande + feedback) → il free tier da 1M copre **~500–1000 sessioni/mese** a €0.
- **OpenAI `gpt-4o-mini-tts`** (se un domani servisse): ~$0.001–0.002/sessione.

---

## 7. Fonti

- sherpa-onnx — motore WASM Apache-2.0 e pagine modelli: https://github.com/k2-fsa/sherpa-onnx · https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/kokoro.html (warning en/zh) · demo WASM: https://huggingface.co/spaces (spazi ufficiali k2-fsa)
- Kokoro — https://github.com/hexgrad/kokoro · model card: https://huggingface.co/hexgrad/Kokoro-82M · port JS: https://www.npmjs.com/package/kokoro-js
- Piper — voci e sample: https://rhasspy.github.io/piper-samples/ · motore attivo (GPL): https://github.com/OHF-Voice/piper1-gpl · motore storico (MIT, archiviato): https://github.com/rhasspy/piper
- Google Cloud TTS — https://cloud.google.com/text-to-speech/pricing (free tier e voci it-IT, da rivalidare)
- Azure Speech — https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/ (tier F0 e voci it-IT, da rivalidare)
- OpenAI TTS — https://openai.com/api/pricing/ (`gpt-4o-mini-tts` $0.60/1M char)
- ElevenLabs — https://elevenlabs.io/pricing (free tier 10K crediti)

---

## 8. Decisioni da prendere insieme

1. **Direzione**: Piper on-device subito (€0, nessuna chiave) oppure Google free tier (qualità massima, serve account GCP)?
2. **Voce**: femminile (`paola`), maschile (`riccardo`), o entrambe con scelta in-app?
3. Prima di implementare, vuoi **ascoltare i sample** delle voci it-IT di Piper per confermare la qualità?
