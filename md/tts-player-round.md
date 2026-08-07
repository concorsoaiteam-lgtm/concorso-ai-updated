# Round 68 — Player della commissione: ricerca provider + architettura

> Decisione presa con i dati qui sotto. Aggiornamento di `voice-stt-tts-report.md`
> per la parte TTS: il provider NON cambia (Kokoro), ma l'architettura ora lo
> rende intercambiabile in un file.

---

## 1. Ricerca: quale provider TTS per l'italiano (2025-2026)?

Criteri richiesti: qualità voce, latenza, costo, piano gratuito, qualità italiano,
streaming, semplicità integrazione, uso commerciale.

| Provider | Qualità IT | Latenza | Costo | Gratis | Streaming | Integrazione web | Commerciale |
|---|---|---|---|---|---|---|---|
| **Kokoro-82M on-device** ✅ | Buona-pulita | Molto bassa (dopo warmup) | **€0** | Sì (open source) | Sì (on-device) | Semplice (WASM, niente server) | **Apache-2.0** |
| ElevenLabs | Altissima | Bassa (streaming) | ~$50-100/1M char | 10k char/mese | Sì | Facile | A pagamento |
| OpenAI tts-1 | Buona | Bassa | $15/1M char | No | Sì | Facilissima | Sì |
| Google Cloud TTS | Eccellente (Chirp) | Bassa | ~$4-160/1M | 1M char/mese | Sì | Complessa (GCP/IAM) | Sì |
| Cartesia Sonic | Molto alta | Bassissima | ~$39/1M | 10k crediti | Sì (WebSocket) | Facile | A pagamento |
| MiniMax / Fish | Alta | Bassa | $15-100/1M | Limitato | Sì | Facile | A pagamento |
| Edge TTS (gratis) | Alta | Media | €0 | Sì | Limitato | Hacky | **Grigia (ToS Azure)** |
| Piper | Robotic | Istantanea | €0 | Sì | In locale | Self-host | MIT/GPL |

### Verdetto

**Kokoro-82M resta la scelta migliore per questo prodotto:**
1. **Costo reale €0** — gira nel browser dell'utente (WASM), nessuna API key, nessun
   server, nessuna quota. Il piano gratuito di ElevenLabs (10k char/mese) basterebbe
   per ~40 domande; non scala.
2. **Licenza Apache-2.0** — uso commerciale pieno, senza sorprese. Edge TTS è gratis
   ma viola i termini Azure in produzione: non accettabile per un SaaS.
3. **Italiano nativo** (voce `if_sara`) e latenza irrisoria dopo il primo download
   (~100MB una tantum, cache HF).
4. **Privacy** — l'audio non esce mai dal dispositivo.

**Quando cambierà provider:** quando (e se) servirà una voce di livello
ElevenLabs/Cartesia a pagamento, l'architettura a provider permette di registrare
il nuovo provider in `voice.js` (un file, una funzione) senza toccare player, UI o
controlli. Il client parla con il server `/api/tts` (da creare) e il provider
server-side restituisce un URL/stream audio.

---

## 2. Architettura implementata

### Interfaccia provider (in `public/js/voice.js`)

Ogni provider implementa la stessa interfaccia; oggi sono registrati:

- **`kokoro`** — `kokoroSynth(text) → AudioBuffer` (on-device, primario).
- **`speech`** — speechSynthesis del browser (fallback ultimo, mai primario).

La selezione avviene in `buildSegments(sentences, gen)`. Per aggiungere un provider
futuro basta una funzione con la stessa firma e la logica di scelta.

### Player Web Audio (pausa/riprendi/stop/replay/velocità)

- Sintesi **per frase** (`splitSentences`) con pause naturali (400ms) tra le frasi:
  suona come una persona che scandisce il discorso, non come un blob unico.
- `AudioBufferSourceNode` + catena `source → AnalyserNode → gain → destination`:
  la waveform del player legge i **livelli reali dell'audio** (`V.ttsWaveLevels`).
- **Pausa/riprendi**: un `AudioBufferSourceNode` non riparte, quindi si registra
  l'offset e si crea un nuovo source dal punto giusto.
- **Velocità**: `playbackRate` live sul source (funziona anche in pausa→riprendi).
- **Interruzione**: `V.start()` (microfono) ferma subito la commissione
  (`stopTtsPlayback`) — l'utente risponde quando vuole.
- Token di generazione (`ttsGen`): uno stop durante la sintesi invalida i segmenti
  in costruzione, mai audio fantasma dopo un'interruzione.

### API pubblica (usata da `simulation.js`)

```
V.speak(text)                → Promise che risolve a riproduzione finita/interrotta
V.ttsControl("pause|resume|stop|replay")
V.ttsSetRate(1|1.25|1.5)     V.ttsGetRate()
V.ttsWaveLevels(n)           V.warmTts()
onTtsPlay(state)             → preparing|playing|paused|done|stopped
```

### UI

- **Player nella card domanda** (`#tts-player`): waveform 24 barre (gradiente
  grafite→verde del design system) + pulsanti pausa/riprendi, stop, replay e chip
  velocità 1x/1.25x/1.5x. Appare solo quando la commissione parla.
- **Feedback ascoltabile**: pulsante "Ascolta" accanto a "Commissario"; se la voce
  è attiva, il feedback viene letto automaticamente a fine stream.
- Accessibilità: `aria-live` sulla nota, `aria-label` sui controlli, focus
  `:focus-visible`, `prefers-reduced-motion` rispettato.
