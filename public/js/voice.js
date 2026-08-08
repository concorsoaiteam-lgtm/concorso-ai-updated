/* =========================================================================
   voice.js — ConcorsoAI · Pipeline vocale della simulazione orale
   =========================================================================
   Cosa fa (decisione del round voce — vedi md/voice-stt-tts-report.md):
   • STT: Deepgram nova-3 via proxy serverless /api/stt (la chiave master
     resta sul server; le ephemeral keys richiedono scope keys:write che
     il piano free non ha). Risposta: {text, words:[{word,start,end}]}.
   • VAD: Silero via @ricky0123/vad-web (WASM, client-side, €0) per le
     metriche paralinguistiche: tempo di risposta, pause, durata parlato.
   • TTS: Piper on-device via vits-web (MIT, WASM, €0) con voci italiane
     vere (Paola / Riccardo) come voce realistica della commissione; la
     voce di sistema it-IT (speechSynthesis) copre i turni mentre il
     modello si prepara (primo download in OPFS, poi offline); Kokoro
     resta come slot opzionale forzato.
   • Metriche: timeToAnswerMs, speechMs, pauseCount, wpm, fillerCount,
     interrupted → diventano parte del feedback (mai perse).
   Tutto lazy-loaded dal CDN al primo uso: la pagina resta leggera.
   Nessuna chiave nel client: il modulo parla solo con /api/stt.
   ========================================================================= */
(function () {
  "use strict";

  var V = window.Voice = {
    ready: false,            // modulo inizializzato
    micSupported: false,
    ttsEnabled: false,       // voce della commissione attiva (persistita)
    ttsKind: null,           // 'kokoro' | 'speech' (fallback) | null
    ttsStatus: "idle",       // idle|loading|ready|error
    recording: false,
    transcribing: false,
    _startPending: false,    // avvio in corso (getUserMedia/VAD): stop/cancel sicuri
    _analyser: null,         // AnalyserNode del microfono → waveform live reale
    _onStatus: null,         // callback stato UI
    _onResult: null,         // callback risultato trascrizione {text, words, metrics}
    _onTtsState: null,       // callback stato TTS engine (loading/ready/error)
    _onTtsSentence: null,    // callback frase corrente (testo sincronizzato con la voce)
    _onInterim: null,        // callback trascrizione progressiva (solo display)
    _onTtsPlay: null,        // callback stato player TTS (preparing/playing/paused/…)
    ttsState: "idle",        // idle|preparing|playing|paused|done|stopped
    ttsMode: null,           // 'audio' (Web Audio) | 'speech' (fallback)
    ttsRate: 1,              // velocità di lettura (1 | 1.25 | 1.5)
    ttsProvider: "auto",     // 'auto' | 'piper' | 'kokoro' | 'speech'
    ttsProviderReason: "",   // perché è stato scelto il provider attivo (debug)
    piperStatus: "idle",     // piper: idle|loading|ready|error
    piperProgress: 0         // 0..1 download modello on-device (OPFS)
  };

  var K_TTS = "cai_voice_tts";       // persistenza toggle voce commissione
  var K_INTERIM = "cai_voice_interim";

  /* Punti di ingresso CDN (verificati: tutti rispondono 200) */
  var CDN = {
    kokoroEsm: "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm",
    ortUmd: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.min.js",
    vadUmd: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js",
    vadEsm: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/+esm",
    vadBase: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/"
  };

  var VAD_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX"; // modello ONNX ufficiale kokoro-js
  var KOKORO_VOICE = "if_sara"; // voce italiana femminile (fallback: prima voce disponibile)

  /* Piper — voce realistica della commissione via vits-web (MIT). I
     modelli italiani del repo ufficiale rhasspy/piper-voices si scaricano
     una sola volta e restano in OPFS (cache persistente del browser,
     offline). paola-medium va aggiunta alla PATH_MAP di vits-web (la
     mappa base contiene solo riccardo-x_low). */
  var K_PIPER_VOICE = "cai_piper_voice";
  var PIPER_CDN = "https://cdn.jsdelivr.net/npm/@diffusionstudio/vits-web@1.0.3/+esm";
  var PIPER_VOICES = {
    paola: { id: "it_IT-paola-medium", path: "it/it_IT/paola/medium/it_IT-paola-medium.onnx" },
    riccardo: { id: "it_IT-riccardo-x_low", path: "it/it_IT/riccardo/x_low/it_IT-riccardo-x_low.onnx" }
  };

  /* ---------------------------- Helpers ---------------------------- */
  function getToken() {
    // Stessa fonte usata da simulation.js per /api/chat (il client già
    // autenticato): è la più affidabile, il localStorage è il fallback.
    try {
      if (window.D && window.D.supabase && window.D.supabase.auth) {
        var sess = window.D.supabase.auth.getSession();
        var tk = sess && sess.data && sess.data.session && sess.data.session.access_token;
        if (tk) return tk;
      }
    } catch (_) { /* noop */ }
    try {
      var raw = window.localStorage.getItem("sb-" + (window.__SUPABASE_URL || "").replace(/^https:\/\//, "").replace(/\.supabase\.co$/, "") + "-auth-token");
      if (raw) {
        var data = JSON.parse(raw);
        if (data && data.access_token) return data.access_token;
      }
    } catch (_) { /* noop */ }
    try {
      var raw2 = window.localStorage.getItem("sb-auth-token");
      if (raw2) {
        var d2 = JSON.parse(raw2);
        if (d2 && d2.access_token) return d2.access_token;
      }
    } catch (_) { /* noop */ }
    return "";
  }

  function setStatus(s) {
    V.recording = (s === "recording");
    V.transcribing = (s === "transcribing");
    if (V._onStatus) V._onStatus(s);
  }

  function loadPersisted() {
    try {
      V.ttsEnabled = window.localStorage.getItem(K_TTS) === "1";
    } catch (_) { V.ttsEnabled = false; }
  }

  function persistTts() {
    try { window.localStorage.setItem(K_TTS, V.ttsEnabled ? "1" : "0"); } catch (_) { /* noop */ }
  }

  /* Debug TTS a stadi, ATTIVO solo su richiesta (?ttsdebug=1 oppure
     localStorage cai_tts_debug=1). Zero log in produzione, zero dati
     sensibili: solo tag di stadio, durate e nomi provider. In console:
     TTS_REQUEST → TTS_PROVIDER → AUDIO_RECEIVED → AUDIO_READY →
     PLAY_ATTEMPT → PLAY_SUCCESS / PLAY_ERROR, oppure la catena
     SPEECH_START → SPEECH_END / SPEECH_ERROR. */
  var TTS_DEBUG = (function () {
    try {
      return /[?&]ttsdebug=1\b/.test(window.location.search) ||
        window.localStorage.getItem("cai_tts_debug") === "1";
    } catch (_) { return false; }
  })();
  function tdbg(tag, msg, data) {
    if (!TTS_DEBUG) return;
    var extra = "";
    try { if (data !== undefined) extra = " " + JSON.stringify(data); } catch (_) { extra = ""; }
    try { console.log("[tts:" + tag + "]", msg + extra); } catch (_) { /* noop */ }
  }

  /* =====================================================================
     TTS — voce della commissione. Architettura a provider INTERCAMBIABILI:
     ogni provider implementa la stessa interfaccia e il player/UI non
     cambiano se domani si passa a ElevenLabs, Cartesia o altro via API.
     • kokoro — Kokoro-82M on-device (Apache-2.0, €0, italiano): PRIMARIO.
     • speech — speechSynthesis del browser: SOLO fallback ultimo.
     Player: Web Audio (AudioBufferSourceNode) con pausa/riprendi/stop/
     replay e velocità live, waveform reale via AnalyserNode, segmenti
     per frase con pause naturali tra una frase e l'altra.
     ===================================================================== */
  var kokoroTts = null;          // istanza KokoroTTS
  var kokoroLoading = null;      // promise caricamento
  var piperMod = null;           // modulo vits-web caricato
  var piperLoading = null;       // promise preparazione piper (modulo + modello)
  var piperVoiceId = null;       // voiceId attivo (it_IT-paola-medium | it_IT-riccardo-x_low)
  var piperLoadGen = 0;          // generazione: invalida le preparazioni vecchie al cambio voce
  var piperLoadStart = 0;        // performance.now() inizio preparazione
  var audioCtx = null;
  var spokeViaSpeech = false;    // vero se almeno una volta è stato usato il fallback
  var ttsGen = 0;                // generazione: invalida i synth in corso su stop/interruzione
  var ttsResolve = null;         // resolve della speak() in corso

  function ensureAudioCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        audioCtx = new AC();
        tdbg("AUDIO_CTX", "creato", audioCtx.state);
      }
    }
    return audioCtx;
  }

  /* Sblocco audio nella USER GESTURE. Chrome e iOS tengono sospeso un
     AudioContext nato senza interazione: il Web Audio resta MUTO pur
     sembrando attivo. Da chiamare in modo SINCRONO nei click (inizio
     simulazione, microfono) e alla prima interazione globale. */
  function unlockAudio() {
    var ctx = ensureAudioCtx();
    if (ctx && ctx.state === "suspended") {
      try {
        ctx.resume().then(
          function () { tdbg("AUDIO_CTX", "riprendi (running)"); },
          function (e) { tdbg("AUDIO_CTX", "resume fallito", e && e.message); }
        );
      } catch (_) { /* noop */ }
    }
    return ctx;
  }

  /* Attende che il contesto sia DAVVERO in esecuzione prima di suonare:
     un src.start() su contesto sospeso non produce audio. */
  function ensureAudioRunning() {
    var ctx = ensureAudioCtx();
    if (!ctx) return Promise.resolve(null);
    if (ctx.state === "running") return Promise.resolve(ctx);
    return ctx.resume().then(function () { return ctx; }, function () { return ctx; });
  }

  /* Prima interazione globale → sblocco audio (una volta sola). Copre
     qualsiasi percorso di ingresso (toggle, inizio, resume, microfono). */
  function bindAudioUnlock() {
    if (!window.AudioContext && !window.webkitAudioContext) return;
    var done = false;
    var unlock = function () {
      if (done) return;
      done = true;
      unlockAudio();
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      tdbg("AUDIO_UNLOCK", "prima interazione utente");
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
  }

  /* Stato del player segnalato alla UI (callback onTtsPlay). */
  function onTtsPlay(s) {
    V.ttsState = s;
    if (V._onTtsPlay) V._onTtsPlay(s);
  }

  /* Callback di frase: la UI evidenzia la frase corrente mentre la
     commissione la legge (testo e voce sincronizzati, mai una chat). */
  function onTtsSentence(i) {
    if (V._onTtsSentence) V._onTtsSentence(i);
  }

  /* Provider A — Kokoro on-device (slot opzionale, non più il default:
     l'italiano in kokoro-js ≤1.2.1 è impossibile). Prima volta: download
     del modello (~90MB, una tantum, cache HF). Poi quasi istantaneo.
     ATTENZIONE:
     kokoro-js ≤1.2.1 ha SOLO voci inglesi (af_, am_, bf_, bm_) e
     list_voices() restituisce undefined (fa solo console.table): la
     selezione voce qui NON deve mai chiamarla, o il modello appena
     scaricato viene buttato con un TypeError. */
  /* Seleziona la voce Kokoro dalla MAPPA voci (mai list_voices(): in
     kokoro-js ≤1.2.1 restituisce undefined e farebbe crashare il
     caricamento appena scaricato). Se la preferita non c'è, la prima
     disponibile; se non c'è nulla, la preferita (il generate fallirà
     con messaggio chiaro, mai un crash nel caricamento). */
  function pickKokoroVoice(tts) {
    var voices = [];
    try {
      var voicesObj = tts && tts.voices ? tts.voices : {};
      voices = Object.keys(voicesObj);
    } catch (_) { voices = []; }
    return voices.indexOf(KOKORO_VOICE) !== -1 ? KOKORO_VOICE : (voices[0] || KOKORO_VOICE);
  }

  function loadKokoro() {
    if (kokoroTts) return Promise.resolve(kokoroTts);
    if (kokoroLoading) return kokoroLoading;
    kokoroLoading = (async function () {
      V.ttsStatus = "loading";
      if (V._onTtsState) V._onTtsState("loading");
      tdbg("TTS_MODEL", "download modello q8/wasm avviato");
      var t0 = performance.now();
      var mod = await import(/* webpackIgnore: true */ CDN.kokoroEsm);
      var tts = await mod.KokoroTTS.from_pretrained(VAD_MODEL_ID, {
        dtype: "q8",
        device: "wasm"
      });
      // Mappa voci = tts.voices (oggetto). Mai list_voices().
      var voice = pickKokoroVoice(tts);
      kokoroTts = { tts: tts, voice: voice };
      V.ttsStatus = "ready";
      V.ttsKind = "kokoro";
      if (V._onTtsState) V._onTtsState("ready");
      tdbg("TTS_MODEL", "pronto", { voice: voice, ms: Math.round(performance.now() - t0) });
      return kokoroTts;
    })();
    kokoroLoading.catch(function (err) {
      V.ttsStatus = "error";
      V.ttsKind = null;
      if (V._onTtsState) V._onTtsState("error");
      kokoroLoading = null;
      tdbg("TTS_MODEL_ERROR", (err && err.message) || String(err));
    });
    return kokoroLoading;
  }

  /* Kokoro → AudioBuffer (niente blob WAV: il player Web Audio lavora
     sul buffer per pausa/riprendi/velocità). */
  function kokoroSynth(text) {
    ensureAudioCtx();
    tdbg("TTS_SYNTH", "generazione", { voice: kokoroTts.voice });
    return kokoroTts.tts.generate(text, { voice: kokoroTts.voice })
      .then(function (result) {
        var samples = result && result.audio ? result.audio : null;
        var rate = result && result.sampleRate ? result.sampleRate : 24000;
        if (!samples || !samples.length) return null;
        var ctx = audioCtx || ensureAudioCtx();
        if (!ctx) return null;
        var buf = ctx.createBuffer(1, samples.length, rate);
        var ch = buf.getChannelData(0);
        for (var i = 0; i < samples.length; i++) {
          var v = samples[i];
          ch[i] = v < -1 ? -1 : (v > 1 ? 1 : v);
        }
        return buf;
      });
  }

  /* ---------------- Player Web Audio: pausa/riprendi/stop/replay ---------------- */
  var player = {
    segments: [],      // [{ buf, gapMs }]
    idx: 0,
    source: null,      // AudioBufferSourceNode attivo
    analyser: null,    // per la waveform reale della commissione
    gain: null,
    startedAt: 0,
    offset: 0,         // secondi già riprodotti del segmento corrente
    playing: false,
    rate: 1,
    gapTimer: null,
    manualStop: false
  };
  var ttsLevelBuf = null;   // buffer riusato per la waveform (zero alloc/frame)

  function ttsAnalyserChain() {
    var ctx = audioCtx || ensureAudioCtx();
    if (!player.analyser && ctx) {
      player.analyser = ctx.createAnalyser();
      player.analyser.fftSize = 128;
      player.gain = ctx.createGain();
      player.gain.gain.value = 1;
      player.analyser.connect(player.gain);
      player.gain.connect(ctx.destination);
    }
    return player.analyser;
  }

  function wireSource(src, seg, onAdvance) {
    src.playbackRate.value = player.rate;
    var an = ttsAnalyserChain();
    if (an) src.connect(an);
    src.onended = function () {
      player.source = null;
      if (player.manualStop) return;
      player.offset = 0;
      tdbg("PLAY_SUCCESS", "segmento riprodotto");
      player.gapTimer = setTimeout(onAdvance, seg.gapMs || 0);
    };
    player.source = src;
    player.playing = true;
    var ctx = audioCtx || ensureAudioCtx();
    player.startedAt = ctx ? ctx.currentTime : 0;
  }

  function playerPlaySegment(i) {
    var seg = player.segments[i];
    if (!seg) return playerFinish();
    player.idx = i;
    // Attende il contesto in RUNNING: su Chrome un contesto sospeso
    // (nato senza user gesture) ingoierebbe l'audio in silenzio.
    ensureAudioRunning().then(function (ctx) {
      if (player.segments[i] !== seg) return;   // fermato/azzerato nel frattempo
      if (!ctx) return playerFinish();          // nessun audio possibile
      var src = ctx.createBufferSource();
      src.buffer = seg.buf;
      player.manualStop = false;
      player.offset = 0;
      wireSource(src, seg, function () { playerPlaySegment(i + 1); });
      src.start(0, 0);
      onTtsPlay("playing");
      onTtsSentence(i);
    });
  }

  function playerPause() {
    var ctx = audioCtx;
    if (!player.playing || !player.source || !ctx) return;
    player.offset += ctx.currentTime - player.startedAt;
    player.manualStop = true;
    try { player.source.stop(); } catch (_) { /* noop */ }
    try { player.source.disconnect(); } catch (_) { /* noop */ }
    player.source = null;
    player.playing = false;
    onTtsPlay("paused");
  }

  function playerResume() {
    if (!player.segments.length || player.playing) return;
    var seg = player.segments[player.idx];
    if (!seg) return playerFinish();
    if (player.offset >= seg.buf.duration) {
      player.offset = 0;
      playerPlaySegment(player.idx + 1);
      return;
    }
    ensureAudioRunning().then(function (ctx) {
      if (!ctx || player.segments[player.idx] !== seg) return;
      var src = ctx.createBufferSource();
      src.buffer = seg.buf;
      player.manualStop = false;
      wireSource(src, seg, function () {
        player.offset = 0;
        playerPlaySegment(player.idx + 1);
      });
      src.start(0, player.offset);
      onTtsPlay("playing");
    });
  }

  function playerTeardown() {
    if (player.gapTimer) { clearTimeout(player.gapTimer); player.gapTimer = null; }
    if (player.source) {
      player.manualStop = true;
      try { player.source.stop(); } catch (_) { /* noop */ }
      try { player.source.disconnect(); } catch (_) { /* noop */ }
      player.source = null;
    }
    if (player.analyser) {
      try { player.analyser.disconnect(); } catch (_) { /* noop */ }
      player.analyser = null;
    }
    if (player.gain) {
      try { player.gain.disconnect(); } catch (_) { /* noop */ }
      player.gain = null;
    }
    player.playing = false;
    player.segments = [];
    player.idx = 0;
    player.offset = 0;
  }

  function playerFinish() {
    var done = ttsResolve;
    ttsResolve = null;
    playerTeardown();
    onTtsPlay("done");
    if (done) done();
  }

  function playSegments(built) {
    tdbg("PLAY_ATTEMPT", "avvio player", { segmenti: built.length });
    return new Promise(function (resolve) {
      player.segments = built;
      player.idx = 0;
      player.offset = 0;
      ttsResolve = resolve;
      playerPlaySegment(0);
    });
  }

  /* ---------- Modalità speech (fallback): utterance con controlli ---------- */
  var speechSeq = { texts: [], idx: 0, current: null, cancelled: true };

  /* Migliore voce italiana del sistema: preferisce "Google italiano"
     (desktop Chrome), altrimenti la prima it-IT. null se non esistono
     voci it → utterance con la voce di default del motore. */
  function pickItalianVoice() {
    if (!window.speechSynthesis) return null;
    var vs = [];
    try { vs = window.speechSynthesis.getVoices() || []; } catch (_) { vs = []; }
    if (!vs.length) return null;
    var it = [];
    for (var i = 0; i < vs.length; i++) {
      if (vs[i] && /^it/i.test(vs[i].lang || "")) it.push(vs[i]);
    }
    if (!it.length) return null;
    for (var j = 0; j < it.length; j++) {
      if (it[j] && /google/i.test(it[j].name || "")) return it[j];
    }
    return it[0];
  }

  function speechNext() {
    if (speechSeq.cancelled) return;
    if (!window.speechSynthesis || speechSeq.idx >= speechSeq.texts.length) {
      finishSpeech();
      return;
    }
    var u = new SpeechSynthesisUtterance(speechSeq.texts[speechSeq.idx]);
    u.lang = "it-IT";
    u.rate = V.ttsRate;
    u.volume = 1;
    var it = pickItalianVoice();
    if (it) u.voice = it;
    u.onend = function () {
      if (speechSeq.cancelled) return;
      tdbg("SPEECH_END", "frase " + speechSeq.idx);
      speechSeq.current = null;
      speechSeq.idx += 1;
      if (!speechSeq.cancelled) onTtsPlay("playing");
      speechNext();
    };
    u.onerror = function (ev) {
      var code = ev && ev.error;
      tdbg("SPEECH_ERROR", code || "utterance-error");
      // Interruzione/cancellazione = comportamento NORMALE (stop, nuova
      // domanda, microfono avviato): niente stato di errore. Ogni altro
      // codice (audio-busy, synthesis-failed, language-unavailable…) è un
      // fallimento reale del provider → stato chiaro + Riprova in UI.
      if (code === "interrupted" || code === "canceled") { finishSpeech(); return; }
      V.ttsStatus = "error";
      if (V._onTtsState) V._onTtsState("error");
      finishSpeech();
    };
    speechSeq.current = u;
    onTtsPlay("playing");
    onTtsSentence(speechSeq.idx);
    tdbg("SPEECH_START", "frase " + speechSeq.idx, { voce: it ? it.name : "default" });
    window.speechSynthesis.speak(u);
  }

  function startSpeech(texts) {
    return new Promise(function (resolve) {
      speechSeq.texts = texts;
      speechSeq.idx = 0;
      speechSeq.current = null;
      speechSeq.cancelled = false;
      ttsResolve = resolve;
      tdbg("SPEECH_PLAN", texts.length + " frasi da leggere");
      // Difensivi sui noti bug di Chrome: uno stato "paused" non riparte
      // con speak() nuovo, e una coda pendente senza gesture non parte.
      // Un piccolo tick separa il cancel() dalla nuova speak.
      if (window.speechSynthesis) {
        try {
          if (window.speechSynthesis.paused) window.speechSynthesis.resume();
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
          }
        } catch (_) { /* noop */ }
      }
      setTimeout(speechNext, 40);
    });
  }

  function finishSpeech() {
    speechSeq.cancelled = true;
    speechSeq.current = null;
    var done = ttsResolve;
    ttsResolve = null;
    onTtsPlay("done");
    if (done) done();
  }

  /* ---------- Sintesi: split in frasi + scelta provider ---------- */
  function splitSentences(text) {
    var parts = String(text || "").split(/(?<=[.!?;:])\s+/);
    var out = [];
    parts.forEach(function (p) {
      p = p.trim();
      if (p) out.push(p);
    });
    return out.length ? out : [String(text || "").trim()];
  }

  /* ------------------------------------------------------------------
     Provider B — Piper on-device (vits-web, MIT). Voci italiane vere del
     repo ufficiale rhasspy: paola-medium (femminile, ~63MB, default) e
     riccardo-x_low (maschile, ~28MB). Il modello si scarica una volta
     sola in OPFS; poi è offline e istantaneo. La scelta è persistita e
     si cambia in-app dal selettore Paola/Riccardo.
     ------------------------------------------------------------------ */
  function getPiperVoice() {
    try {
      if (window.localStorage.getItem(K_PIPER_VOICE) === "riccardo") return "riccardo";
    } catch (_) { /* noop */ }
    return "paola";
  }

  /* Cambio voce: la preferenza è persistita e, se la nuova voce non è
     già in cache, la preparazione riparte (download dell'altro modello
     in background). Se fallisce, la voce di sistema copre i turni:
     mai un silenzio. */
  V.setPiperVoice = function (id) {
    var v = id === "riccardo" ? "riccardo" : "paola";
    var prev = getPiperVoice();
    try { window.localStorage.setItem(K_PIPER_VOICE, v); } catch (_) { /* noop */ }
    tdbg("PIPER_VOICE", "voce scelta", { voce: v });
    if (v === prev && V.piperStatus === "ready") return v;
    // Invalida la preparazione in corso e riparte per il nuovo modello.
    // Il modulo si ri-importa dalla cache del browser (istanza stessa),
    // il download è solo quello del modello nuovo.
    piperLoadGen += 1;
    piperLoading = null;
    piperMod = null;
    piperVoiceId = null;
    V.piperStatus = "idle";
    V.piperProgress = 0;
    if (V._onTtsState) V._onTtsState("off");
    if (V.ttsEnabled) loadPiper().catch(function () { /* resta speech finché pronto */ });
    return v;
  };

  V.getPiperVoice = getPiperVoice;

  /* Prepara Piper: import del modulo vits-web, estensione della PATH_MAP
     (paola-medium non è nella mappa base) e download del modello in OPFS
     con progresso reale (V.piperProgress 0..1). Deduplicata: se già
     pronta o già in corso, restituisce la stessa promise. Non tocca la
     UI direttamente: lo stato arriva via onTtsState. */
  function loadPiper() {
    if (V.piperStatus === "ready" && piperMod) return Promise.resolve(piperMod);
    if (piperLoading) return piperLoading;
    if (!navigator.storage || !navigator.storage.getDirectory) {
      // Niente OPFS (browser/privacy): Piper non può tenere il modello.
      return Promise.reject(new Error("opfs-unavailable"));
    }
    var gen = ++piperLoadGen;
    V.piperStatus = "loading";
    V.piperProgress = 0;
    piperLoadStart = performance.now();
    if (V._onTtsState) V._onTtsState("loading");
    tdbg("PIPER_LOAD", "avvio piper (vits-web + modello on-device)");
    piperLoading = (async function () {
      var mod = await import(/* webpackIgnore: true */ PIPER_CDN);
      if (gen !== piperLoadGen) return;
      var voiceKey = getPiperVoice();
      var vv = PIPER_VOICES[voiceKey];
      mod.PATH_MAP[vv.id] = vv.path;   // binding live di vits-web
      piperVoiceId = vv.id;
      piperMod = mod;
      tdbg("PIPER_MODULE", "vits-web pronto", { voce: vv.id });
      // Modello già in OPFS? stored() elenca i .onnx in cache.
      var cached = [];
      try { cached = await mod.stored(); } catch (_) { cached = []; }
      if (gen !== piperLoadGen) return;
      if (cached.indexOf(vv.id) === -1) {
        tdbg("PIPER_DOWNLOAD", "download modello " + vv.id);
        var lastShown = -1;
        await mod.download(vv.id, function (ev) {
          V.piperProgress = ev && ev.total ? Math.min(1, ev.loaded / ev.total) : 0;
          var pct = Math.round(V.piperProgress * 100);
          if (pct !== lastShown) {
            lastShown = pct;
            tdbg("PIPER_DOWNLOAD", pct + "%");
            if (V._onTtsState) V._onTtsState("loading");
          }
        });
      } else {
        V.piperProgress = 1;
        tdbg("PIPER_DOWNLOAD", "modello già in cache (OPFS)");
      }
      if (gen !== piperLoadGen) return;
      V.piperStatus = "ready";
      V.ttsKind = "piper";
      if (V._onTtsState) V._onTtsState("ready");
      tdbg("PIPER_READY", "pronto", { voce: vv.id, ms: Math.round(performance.now() - piperLoadStart) });
      return mod;
    })();
    piperLoading.catch(function (err) {
      if (gen !== piperLoadGen) return;
      V.piperStatus = "error";
      V.ttsKind = null;
      piperLoading = null;
      if (V._onTtsState) V._onTtsState("error");
      tdbg("PIPER_ERROR", (err && err.message) || String(err));
    });
    return piperLoading;
  }

  /* Frazioni di durata per frase ∝ lunghezza del testo. Il turno è
     sintetizzato in UN'UNICA inferenza (veloce, il modello è in memoria)
     e poi tagliato per frasi: la UI evidenzia la frase mentre la voce
     la legge. Funzione pura → testabile. */
  function sentenceBoundaries(sentences, totalLen) {
    if (!sentences.length) return [0, 1];   // funzione totale anche su input vuoto
    var out = [0];
    var acc = 0;
    var n = totalLen > 0 ? totalLen : 1;
    for (var i = 0; i < sentences.length; i++) {
      acc += sentences[i].length;
      out.push(Math.min(1, acc / n));
    }
    out[out.length - 1] = 1;
    return out;
  }

  function sliceBuffer(buf, fromSec, toSec) {
    var ctx = audioCtx || ensureAudioCtx();
    if (!ctx) return null;
    var sr = buf.sampleRate;
    var i0 = Math.max(0, Math.floor(fromSec * sr));
    var i1 = Math.min(buf.length, Math.ceil(toSec * sr));
    var n = i1 - i0;
    if (n < Math.floor(sr * 0.05)) return null;   // < 50ms: non è una frase
    var out = ctx.createBuffer(buf.numberOfChannels, n, sr);
    for (var c = 0; c < buf.numberOfChannels; c++) {
      out.copyToChannel(buf.getChannelData(c).subarray(i0, i1), c);
    }
    return out;
  }

  /* Piper → segmenti per frase. Stesso player Web Audio, stessa
     evidenziazione sincronizzata: nessuna ri-sintesi per frase. */
  async function buildPiperSegments(sentences, gen) {
    V.ttsKind = "piper";
    V.ttsMode = "audio";
    var full = sentences.join(" ");
    tdbg("PIPER_SYNTH", "sintesi turno", { caratteri: full.length, frasi: sentences.length });
    var blob = await piperMod.predict({ text: full, voiceId: piperVoiceId });
    if (gen !== ttsGen) return [];
    var arr = await blob.arrayBuffer();
    var ctx = ensureAudioCtx();
    if (!ctx) return [];
    var buf = await ctx.decodeAudioData(arr);
    if (gen !== ttsGen) return [];
    tdbg("AUDIO_RECEIVED", "turno sintetizzato", { secondi: +buf.duration.toFixed(2) });
    var frac = sentenceBoundaries(sentences, full.length);
    var built = [];
    var prevF = 0;
    for (var i = 0; i < sentences.length; i++) {
      if (gen !== ttsGen) return [];
      var fEnd = frac[i + 1];
      var slice = sliceBuffer(buf, prevF * buf.duration, fEnd * buf.duration);
      prevF = fEnd;
      if (slice) built.push({ buf: slice, gapMs: i < sentences.length - 1 ? 400 : 0 });
    }
    if (!built.length) built.push({ buf: buf, gapMs: 0 });
    if (gen !== ttsGen) return [];
    tdbg("AUDIO_READY", built.length + " segmenti pronti");
    return built;
  }

  /* Scelta provider effettiva. Vincolo reale: la commissione parla in
     ITALIANO. Piper (on-device, voci italiane vere) è la voce realistica
     in "auto"; finché il modello si prepara (primo download in OPFS) la
     voce di sistema it-IT copre i turni — mai un silenzio. Kokoro-js
     1.2.1 parla solo inglese: resta un slot opzionale forzato. */
  function effectiveProvider() {
    if (V.ttsProvider === "kokoro") return "kokoro";
    if (V.ttsProvider === "speech") return "speech";
    if (V.ttsProvider === "piper") return V.piperStatus === "error" ? "speech" : "piper";
    if (V.piperStatus === "ready") return "piper";
    if (window.speechSynthesis) return "speech";
    return "kokoro";
  }

  function buildSegments(sentences, gen) {
    var p = effectiveProvider();
    V.ttsProviderReason = p === "piper"
      ? "voce realistica on-device (Piper)"
      : (p === "kokoro"
          ? (window.speechSynthesis ? "forzato" : "speechSynthesis non disponibile")
          : (V.piperStatus === "loading" ? "piper in preparazione — voce di sistema" : "voce italiana di sistema"));
    // TTS_RESPONSE = il provider che ha risposto alla TTS_REQUEST.
    tdbg("TTS_RESPONSE", p, { piper: V.piperStatus, kokoroLoaded: !!kokoroTts, speechSynth: !!window.speechSynthesis, forzato: V.ttsProvider });
    if (p === "piper") {
      // Piper pronto: sintesi on-device. In auto questo ramo è raggiunto
      // solo a modello pronto (loadPiper risolve subito). Se forzato
      // mentre il modello si scarica, l'attesa è CAPPATA: mai un turno
      // bloccato sul download. Se la sintesi fallisse (modello corrotto,
      // OPFS svuotata a metà), per QUESTO turno si scende a speech.
      var lp = loadPiper();
      if (V.ttsProvider === "piper" && V.piperStatus !== "ready") {
        lp = Promise.race([lp, new Promise(function (_, rej) {
          setTimeout(function () { rej(new Error("piper-load-timeout")); }, 12000);
        })]);
      }
      return lp
        .then(function () { return buildPiperSegments(sentences, gen); })
        .catch(function (err) {
          tdbg("TTS_FALLBACK", "piper fallito → speech", err && err.message);
          spokeViaSpeech = true;
          V.ttsKind = "speech";
          V.ttsProviderReason = "piper-failed";
          return buildSpeechSegments(sentences, gen);
        });
    }
    if (p === "kokoro") {
      if (kokoroTts) return buildKokoroSegments(sentences, gen);
      return loadKokoro()
        .then(function () { return buildKokoroSegments(sentences, gen); })
        .catch(function (err) {
          tdbg("TTS_FALLBACK", "kokoro fallito → speech", err && err.message);
          spokeViaSpeech = true;
          V.ttsKind = "speech";
          V.ttsProviderReason = "kokoro-failed";
          return buildSpeechSegments(sentences, gen);
        });
    }
    return buildSpeechSegments(sentences, gen);
  }

  async function buildKokoroSegments(sentences, gen) {
    V.ttsKind = "kokoro";
    V.ttsMode = "audio";
    var built = [];
    for (var i = 0; i < sentences.length; i++) {
      if (gen !== ttsGen) return [];   // fermato mentre sintetizzava
      var buf = await kokoroSynth(sentences[i]);
      if (buf) {
        built.push({ buf: buf, gapMs: i < sentences.length - 1 ? 400 : 0 });
        tdbg("AUDIO_RECEIVED", "frase " + i, { secondi: +buf.duration.toFixed(2) });
      }
    }
    if (gen !== ttsGen) return [];
    tdbg("AUDIO_READY", built.length + " segmenti pronti");
    return built;
  }

  function buildSpeechSegments(sentences, gen) {
    V.ttsKind = "speech";
    V.ttsMode = "speech";
    return Promise.resolve(sentences);
  }

  /* Ferma qualsiasi riproduzione in corso (es. microfono avviato, nuova
     domanda). Non emette stato: lo fa il chiamante. */
  function stopTtsPlayback(invalidate) {
    if (invalidate) ttsGen += 1;
    // Attivo anche in "preparing": se l'utente interrompe mentre il modello
    // si carica o la frase si sintetizza, il player NON deve restare appeso.
    var wasActive = V.ttsState !== "idle";
    speechSeq.cancelled = true;
    speechSeq.current = null;
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }
    }
    playerTeardown();
    var done = ttsResolve;
    ttsResolve = null;
    if (done) done();
    if (wasActive) onTtsPlay("stopped");
  }

  /* TTS pubblico: legge il testo e risolve a riproduzione finita (o
     interrotta). Provider scelto da effectiveProvider(). Se NESSUN
     provider può parlare, stato "error" chiaro per la UI — mai un
     turno bloccato. */
  V.speak = function (text) {
    var str = String(text || "").trim();
    if (!str) return Promise.resolve();
    if (!V.ttsEnabled) return Promise.resolve();
    tdbg("TTS_REQUEST", str.length + " caratteri", { provider: effectiveProvider() });
    // Ordine critico: prima si invalida il gen del precedente (stop), POI
    // si crea il nuovo gen. Altrimenti il nuovo speak si auto-invaliderebbe.
    stopTtsPlayback(true);
    var gen = ++ttsGen;
    onTtsPlay("preparing");
    return buildSegments(splitSentences(str), gen)
      .then(function (built) {
        if (gen !== ttsGen) return;                    // superato da stop/interruzione
        if (!built || !built.length) { onTtsPlay("stopped"); return; }
        // Il provider decide il player: audio (Web Audio) o speech (utterance).
        if (V.ttsMode === "speech") return startSpeech(built);
        return playSegments(built);
      })
      .catch(function (err) {
        if (gen !== ttsGen) return;
        V.ttsStatus = "error";
        if (V._onTtsState) V._onTtsState("error");
        onTtsPlay("stopped");
        tdbg("PLAY_ERROR", (err && err.message) || String(err));
      });
  };

  /* Controlli del player: pause | resume | stop | replay. */
  V.ttsControl = function (cmd) {
    if (V.ttsMode === "speech") {
      if (!window.speechSynthesis) return;
      if (cmd === "pause") { if (!speechSeq.cancelled) { window.speechSynthesis.pause(); onTtsPlay("paused"); } }
      else if (cmd === "resume") { if (!speechSeq.cancelled) { window.speechSynthesis.resume(); onTtsPlay("playing"); } }
      else if (cmd === "stop") { stopTtsPlayback(true); }
      else if (cmd === "replay") {
        var texts = speechSeq.texts.slice();
        stopTtsPlayback(false);
        if (texts.length) startSpeech(texts);
      }
      return;
    }
    if (cmd === "pause") playerPause();
    else if (cmd === "resume") playerResume();
    else if (cmd === "stop") { stopTtsPlayback(true); }
    else if (cmd === "replay") {
      var segs = player.segments.slice();
      stopTtsPlayback(false);
      if (segs.length) playSegments(segs);
    }
  };

  V.ttsSetRate = function (r) {
    var v = r === 1.25 ? 1.25 : (r === 1.5 ? 1.5 : 1);
    V.ttsRate = v;
    if (player.source) player.source.playbackRate.value = v;   // cambio live
    if (speechSeq.current) { try { speechSeq.current.rate = v; } catch (_) { /* noop */ } }
  };
  V.ttsGetRate = function () { return V.ttsRate; };

  /* Livelli REALI dell'audio della commissione (0..1 per n barre) per la
     waveform. Se il player non è attivo o manca l'analizzatore, zeri: la
     UI usa l'onda procedurale di riserva, mai un errore. */
  V.ttsWaveLevels = function (n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(0);
    if (!player.analyser || !player.playing) return out;
    try {
      if (!ttsLevelBuf || ttsLevelBuf.length !== player.analyser.frequencyBinCount) {
        ttsLevelBuf = new Uint8Array(player.analyser.frequencyBinCount);
      }
      player.analyser.getByteFrequencyData(ttsLevelBuf);
      var freq = ttsLevelBuf;
      var per = freq.length / n;
      for (i = 0; i < n; i++) {
        var st = Math.floor(i * per);
        var en = Math.max(st + 1, Math.floor((i + 1) * per));
        var sum = 0;
        for (var j = st; j < en; j++) sum += freq[j];
        var avg = sum / (en - st);
        out[i] = Math.pow(Math.min(1, avg / 255), 1.5);
      }
    } catch (_) { /* noop */ }
    return out;
  };

  /* Pre-carica il provider di destinazione in background. In "auto" il
     provider è Piper (voce realistica): il modello si scarica in
     background mentre la voce di sistema copre i turni. Kokoro (~90MB)
     si scarica solo se forzato o senza speechSynthesis. Gli errori non
     sono fatali: un errore fa solo riprovare al prossimo warmTts. */
  V.warmTts = function () {
    if (V.ttsProvider === "kokoro") {
      if (kokoroTts || spokeViaSpeech) return;
      loadKokoro().catch(function () { /* fallback automatico al primo speak */ });
      return;
    }
    if (V.ttsProvider === "speech") return;
    if (V.piperStatus === "ready" || V.piperStatus === "loading") return;
    loadPiper().catch(function () { /* fallback speech al primo speak */ });
  };

  V.setTtsEnabled = function (on) {
    on = !!on;
    tdbg("TTS_TOGGLE", on ? "attiva" : "disattiva");
    if (V.ttsEnabled && !on) stopTtsPlayback(true);
    V.ttsEnabled = on;
    persistTts();
    if (V._onTtsState) V._onTtsState(on ? (V.ttsKind || "loading") : "off");
  };

  /* ---------------------------- VAD + registrazione ---------------------------- */
  var vadInstance = null;
  var mediaRecorder = null;
  var mediaStream = null;
  var speechChunks = [];
  var listenStartedAt = 0;     // inizio ascolto (performance.now)
  var firstSpeechAt = 0;       // primo onset parlato
  var speechSegments = [];     // [{start, end}] in ms (performance.now)
  var segStart = 0;
  var lastSpeechEnd = 0;
  var autoStopTimer = null;
  var interimRec = null;      // Web Speech interim (solo display progressivo)
  var lastInterim = "";       // testo interim corrente (per l'endpointing dinamico)
  var vadModules = null;
  var vadActive = false;        // VAD realmente operativo (auto-stop + metriche)
  var silenceTimer = null;      // auto-stop su silenzio quando il VAD non c'è
  var quietMs = 0;
  var levelBuf = null;            // buffer riusato per la waveform (zero allocazioni/frame)

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error("script-failed")); };
      document.head.appendChild(s);
    });
  }

  /* Carica il VAD (Silero) nel modo documentato per il browser:
     onnxruntime-web globale + bundle UMD. Il +esm si rompe in pagine
     senza bundler (su Chrome: "Cannot read properties of undefined
     (reading 'create')"), quindi è solo un ultimo tentativo.
     Il VAD resta OTTIMALE, mai bloccante: se non si carica o non
     parte, la registrazione continua lo stesso (auto-stop su silenzio). */
  var vadLoading = null;
  function loadVad() {
    if (vadModules) return Promise.resolve(vadModules);
    if (vadLoading) return vadLoading;
    vadLoading = (async function () {
      // Timeout DURA di 8s: se il CDN è lento o pende, la registrazione
      // parte comunque senza VAD (auto-stop su silenzio). L'utente non
      // deve MAI restare bloccato su un terzo-party.
      var hard = new Promise(function (_, rej) {
        setTimeout(function () { rej(new Error("vad-load-timeout")); }, 8000);
      });
      await Promise.race([
        (async function () {
          try {
            if (typeof window.ort === "undefined") {
              try { await loadScript(CDN.ortUmd); } catch (_) { /* continua */ }
            }
            if (typeof window.vad === "undefined") {
              try { await loadScript(CDN.vadUmd); } catch (_) { /* continua */ }
            }
            if (window.vad && window.vad.MicVAD) { vadModules = window.vad; return; }
          } catch (_) { /* continua al fallback esm */ }
          var m = await import(/* webpackIgnore: true */ CDN.vadEsm);
          if (m && m.MicVAD) { vadModules = m; return; }
          throw new Error("vad-unavailable");
        })(),
        hard
      ]);
      return vadModules;
    })();
    vadLoading.catch(function () { vadLoading = null; });
    return vadLoading;
  }

  /* Auto-stop senza VAD: solo DOPO aver sentito la voce, se l'analizzatore
     non rileva suono per 2.5s, la risposta è finita e si trascrive.
     Il requisito "heardSpeech" evita lo stop prematuro su chi parte con
     calma: senza parlato rilevato non si ferma mai (resta il tasto Ferma).
     Il watcher si rischedula sempre: un blip dell'analizzatore (tab switch)
     non lo uccide. */
  function startSilenceWatcher() {
    stopSilenceWatcher();
    quietMs = 0;
    var heardSpeech = false;
    var check = function () {
      if (!V.recording || V._startPending) return;
      if (V.hasAnalyser()) {
        var lv = V.levels(1);
        var level = lv ? lv[0] : 0;
        if (level >= 0.05) {
          heardSpeech = true;
          quietMs = 0;
        } else if (heardSpeech) {
          quietMs += 250;
          // Endpointing dinamico anche senza VAD: la pausa da attendere
          // dipende dall'interim (frase chiusa vs filler), mai un tempo fisso.
          if (quietMs >= endpointTimeout(lastInterim)) { V.stop(); return; }
        }
      }
      silenceTimer = setTimeout(check, 250);
    };
    silenceTimer = setTimeout(check, 250);
  }

  function stopSilenceWatcher() {
    if (silenceTimer) { clearTimeout(silenceTimer); silenceTimer = null; }
    quietMs = 0;
  }

  /* Endpointing DINAMICO (ricerca voce): il timeout di silenzio NON è
     fisso. Se la trascrizione incrementale mostra una frase chiusa →
     timeout breve (950ms); se mostra un filler o una frase incompleta
     → timeout lungo (2600ms); in corso → 1500ms; senza testo → 1800ms.
     Nessun modello: euristica sul testo, €0, la trascrizione finale
     resta quella del server. */
  var ENDPOINT_FILLERS = ["ehm", "uhm", "mmh", "cioè", "quindi", "allora", "ecco", "beh", "boh", "mah", "vabbeh", "insomma", "praticamente", "diciamo", "tipo"];
  function endpointTimeout(text) {
    var t = String(text || "").trim();
    if (!t) return 1800;
    if (/[.!?;:]$/.test(t)) return 950;                        // frase chiusa
    var words = t.split(/\s+/);
    var last = (words[words.length - 1] || "").toLowerCase().replace(/[^a-zà-ù]/g, "");
    for (var i = 0; i < ENDPOINT_FILLERS.length; i++) {
      if (last === ENDPOINT_FILLERS[i]) return 2600;            // sta cercando la parola
    }
    return 1500;                                                // ancora in corso
  }

  /* Trascrizione PROGRESSIVA (interim): Web Speech API in parallelo al
     registratore. Puramente visiva — il candidato si vede ascoltato
     mentre parla — mai autorevole: la trascrizione finale è quella
     del server. Se il browser non la supporta, si continua senza
     (waveform + stato del registratore). */
  function startInterimRecognition() {
    stopInterimRecognition();
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    try {
      var rec = new SR();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "it-IT";
      rec.onresult = function (e) {
        var out = "";
        for (var i = e.resultIndex; i < e.results.length; i++) {
          var r = e.results[i];
          out += r[0].transcript;
          if (r.isFinal) out += " ";
        }
        lastInterim = out.trim();
        if (V._onInterim) V._onInterim(lastInterim, false);
      };
      rec.onerror = function () { stopInterimRecognition(); };
      rec.onend = function () { /* il server resta la fonte finale */ };
      rec.start();
      interimRec = rec;
    } catch (_) { interimRec = null; }
  }

  function stopInterimRecognition() {
    if (interimRec) {
      try { interimRec.stop(); } catch (_) { /* noop */ }
      interimRec = null;
    }
  }

  function base64FromBlob(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var b64 = String(fr.result).split(",")[1] || "";
        resolve(b64);
      };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  function computeMetrics() {
    var now = performance.now();
    var metrics = {
      timeToAnswerMs: firstSpeechAt ? Math.max(0, Math.round(firstSpeechAt - listenStartedAt)) : null,
      speechMs: 0,
      pauseCount: 0,
      meanPauseMs: null,
      wpm: null,
      fillerCount: 0,
      interrupted: false
    };
    // Durata parlato = somma segmenti; pause = gap tra segmenti > 300ms
    var prevEnd = 0;
    speechSegments.forEach(function (seg) {
      metrics.speechMs += (seg.end - seg.start);
      if (prevEnd && (seg.start - prevEnd) > 300) metrics.pauseCount += 1;
      prevEnd = seg.end;
    });
    if (metrics.speechMs > 0) {
      metrics.meanPauseMs = metrics.pauseCount > 0
        ? Math.round((now - listenStartedAt - metrics.speechMs) / metrics.pauseCount)
        : null;
    }
    return metrics;
  }

  /* Avvia l'ascolto: microfono + VAD (metriche) + MediaRecorder (blob).
     `interruptedByUser` (bool) segnala l'interruzione: il mic parte
     mentre la commissione sta ancora leggendo la domanda.
     _startPending rende safe lo stop durante l'avvio: se l'utente
     clicca "Ferma" mentre getUserMedia/VAD sono in corso, l'ascolto
     non parte mai (niente stato fantasma). */
  V.start = function (opts) {
    opts = opts || {};
    if (V.recording || V.transcribing || V._startPending) return Promise.reject(new Error("already-busy"));
    if (!V.micSupported) return Promise.reject(new Error("mic-unsupported"));
    // Interruzione = l'utente ha avviato il mic mentre la commissione
    // stava ancora leggendo la domanda (flag esplicito da simulation.js).
    // Catturato in modo sincrono: la richiesta del microfono richiede
    // ~1s, in cui la TTS potrebbe terminare e il segnale andrebbe perso.
    V._interrupted = !!opts.interruptedByUser;
    // L'utente sta per parlare: la commissione si zittisce subito.
    stopTtsPlayback(true);
    V._startPending = true;
    // AudioContext creato in modo SINCRONO nel gestore del click (user
    // gesture): altrimenti su Chrome parte "suspended" e la waveform
    // non riceverebbe mai i livelli del microfono.
    ensureAudioCtx();
    return (async function () {
      try {
        // Carica il VAD in parallelo alla richiesta del microfono.
        // Il VAD è opzionale: loadVad non fallisce mai (fallback interni).
        var vadP = loadVad();
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        if (!V._startPending) { teardown(); return false; }

        // Waveform live: AnalyserNode collegato al microfono. La UI legge
        // V.levels(n) a 60fps e disegna barre che reagiscono al volume REALE.
        V._analyser = null;
        var ac = ensureAudioCtx();
        if (ac) {
          try {
            var src = ac.createMediaStreamSource(mediaStream);
            var an = ac.createAnalyser();
            an.fftSize = 1024;
            an.smoothingTimeConstant = 0.55;
            src.connect(an);
            V._analyser = an;
          } catch (_) { V._analyser = null; }
        }

        speechChunks = [];
        speechSegments = [];
        firstSpeechAt = 0;
        segStart = 0;
        lastSpeechEnd = 0;
        listenStartedAt = performance.now();

        // MediaRecorder: catena di formati. Safari/iOS NON supporta webm:
        // senza questo fallback la registrazione lancia un TypeError e la
        // voce sarebbe rotta su iPhone. Il server riceve sempre il mime reale.
        if (typeof MediaRecorder === "undefined") {
          throw new Error("media-recorder-unsupported");
        }
        var mime = "audio/webm;codecs=opus";
        if (typeof MediaRecorder.isTypeSupported === "function" && !MediaRecorder.isTypeSupported(mime)) {
          mime = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
        }
        mediaRecorder = new MediaRecorder(mediaStream, mime ? { mimeType: mime } : undefined);
        mediaRecorder.ondataavailable = function (e) {
          if (e.data && e.data.size > 0) speechChunks.push(e.data);
        };
        // Parte SUBITO: niente audio perso mentre il VAD si carica.
        mediaRecorder.start(250);
        // Interim live (opzionale): il testo si forma mentre parli.
        startInterimRecognition();

        // VAD: metriche paralinguistiche in tempo reale (€0, client-side).
        // OTTIMALE: se MicVAD non parte in 8s, continuiamo senza (auto-stop
        // su silenzio). Un errore del VAD NON deve mai rompere la registrazione.
        vadActive = false;
        try {
          var vadMod = await vadP;
          if (vadMod && vadMod.MicVAD) {
            // Timeout ANCHE su MicVAD.new: scarica il modello ONNX (~1.5MB)
            // da un CDN terzo — se la rete pende, NON deve bloccare l'avvio.
            // Il catch sotto ripulisce l'istanza e si passa all'auto-stop
            // su silenzio.
            var vadNewP = vadMod.MicVAD.new({
              stream: mediaStream,
              baseAssetURL: CDN.vadBase,
              positiveSpeechThreshold: 0.7,
              negativeSpeechThreshold: 0.4,
              minSpeechFrames: 4,
              onSpeechStart: function () {
                var t = performance.now();
                if (!firstSpeechAt) firstSpeechAt = t;
                segStart = t;
                // Nuovo segmento di parlato: annulla l'auto-stop pendente,
                // così una pausa >1.8s seguita da una ripresa NON taglia
                // la risposta.
                if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
                if (V._onStatus) V._onStatus("speaking");
              },
              onSpeechEnd: function () {
                var t = performance.now();
                if (segStart) speechSegments.push({ start: segStart, end: t });
                lastSpeechEnd = t;
                // Auto-stop DINAMICO: la pausa da attendere dipende da ciò
                // che il candidato ha appena detto (frase chiusa vs filler).
                if (autoStopTimer) clearTimeout(autoStopTimer);
                autoStopTimer = setTimeout(function () {
                  if (V.recording) V.stop();
                }, endpointTimeout(lastInterim));
                if (V._onStatus) V._onStatus("listening");
              },
              onVADMisfire: function () { /* troppo breve: ignora */ }
            });
            vadInstance = await Promise.race([
              vadNewP,
              new Promise(function (_, rej) {
                setTimeout(function () { rej(new Error("vad-new-timeout")); }, 10000);
              })
            ]);
            await Promise.race([
              vadInstance.start(),
              new Promise(function (_, rej) {
                setTimeout(function () { rej(new Error("vad-start-timeout")); }, 8000);
              })
            ]);
            vadActive = true;
          }
        } catch (_) {
          try { if (vadInstance) { vadInstance.destroy(); } } catch (_2) { /* noop */ }
          vadInstance = null;
        }
        if (!vadActive) startSilenceWatcher();

        if (!V._startPending) { teardown(); return false; }
        V._startPending = false;
        setStatus("recording");
        return true;
      } catch (err) {
        V._startPending = false;
        teardown();
        setStatus("idle");
        if (V._onStatus) V._onStatus("error");
        if (V._onResult) V._onResult({ text: "", words: [], metrics: computeMetrics(), error: (err && err.message) || "start-failed" });
        throw err;
      }
    })();
  };

  /* Interrompe la lettura della domanda (es. l'utente clicca il mic
     mentre la commissione sta ancora parlando). */
  V.stopSpeaking = function () {
    if (currentAudioEl) {
      try { currentAudioEl.pause(); } catch (_) { /* noop */ }
      currentAudioEl = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }
    }
  };

  /* Ferma, trascrive e calcola le metriche. Non deve MAI lasciare la
     UI bloccata: ogni errore (rete, 401, provider) riporta a idle e
     viene segnalato via onStatus. Un solo retry sui guasti di rete
     (5xx/timeout): un singolo hiccup non perde l'intera risposta. */
  V.stop = function () {
    if (V._startPending) {
      // Stop durante l'avvio: il start() in corso si chiude da sé al
      // prossimo checkpoint (teardown + return false). Niente doppio teardown,
      // ma il flag di interruzione va comunque azzerato.
      V._startPending = false;
      V._interrupted = false;
      setStatus("idle");
      return Promise.resolve({ text: "", words: [], metrics: computeMetrics() });
    }
    if (!V.recording) return Promise.resolve({ text: "", words: [], metrics: computeMetrics() });
    return (async function () {
      if (autoStopTimer) clearTimeout(autoStopTimer);
      // L'interim smette con l'ascolto: da qui conta solo il server.
      stopInterimRecognition();
      setStatus("transcribing");
      var blob = null;
      try {
        if (vadInstance) { try { await vadInstance.pause(); } catch (_) { /* noop */ } }
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          var recMime = mediaRecorder.mimeType || "audio/webm";
          blob = await new Promise(function (resolve) {
            var done = false;
            var finish = function (b) { if (!done) { done = true; resolve(b); } };
            mediaRecorder.onstop = function () {
              finish(new Blob(speechChunks, { type: recMime }));
            };
            try { mediaRecorder.stop(); } catch (_) { /* noop */ }
            setTimeout(function () { finish(new Blob(speechChunks, { type: recMime })); }, 1200);
          });
        }
      } catch (_) { /* noop */ }
      // Snapshot PRIMA di teardown(): teardown resetta il flag.
      var interrupted = V._interrupted;
      await teardown();
      var metrics = computeMetrics();
      if (interrupted) metrics.interrupted = true;
      if (!blob || blob.size < 100) {
        var empty = { text: "", words: [], metrics: metrics };
        if (V._onResult) V._onResult(empty);
        setStatus("idle");
        return empty;
      }
      var b64 = await base64FromBlob(blob);
      var token = getToken();
      var attempts = 0;
      var out = null;
      while (attempts < 2) {
        attempts++;
        try {
          var ctrl = new AbortController();
          var t = setTimeout(function () { ctrl.abort(); }, 40000);
          var resp;
          try {
            resp = await fetch("/api/stt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? "Bearer " + token : ""
              },
              body: JSON.stringify({ audio: b64, mime: blob.type || "audio/webm" }),
              signal: ctrl.signal
            });
          } finally { clearTimeout(t); }
          if (!resp.ok) {
            // L'errore del server è leggibile (es. "Trascrizione non
            // configurata su questo deployment…"): mai un opaco "http-500".
            var ebody = "";
            try {
              var jbody = await resp.json();
              if (jbody && jbody.error) ebody = String(jbody.error);
            } catch (_) { /* noop */ }
            var ferr = new Error(ebody || ("http-" + resp.status));
            ferr.status = resp.status;
            throw ferr;
          }
          var data = await resp.json();
          var text = String(data.text || "").trim();
          var words = Array.isArray(data.words) ? data.words : [];
          var wpm = null;
          if (words.length && metrics.speechMs > 0) {
            wpm = Math.round(words.length / (metrics.speechMs / 60000));
          }
          metrics.wpm = wpm;
          metrics.fillerCount = countFillers(text);
          out = { text: text, words: words, metrics: metrics };
          break;
        } catch (err) {
          // Niente retry sui 4xx (token, payload): sarebbe inutile.
          var retriable = !(err && typeof err.status === "number" && err.status >= 400 && err.status < 500);
          if (attempts >= 2 || !retriable) {
            console.error("[voice] trascrizione fallita:", err && err.message);
            setStatus("idle");
            if (V._onStatus) V._onStatus("error");
            out = { text: "", words: [], metrics: metrics, error: (err && err.message) || "unknown" };
            if (V._onResult) V._onResult(out);
            return out;
          }
          // Backoff leggero prima del retry.
          await new Promise(function (r) { setTimeout(r, 700 + Math.random() * 600); });
        }
      }
      if (V._onResult) V._onResult(out);
      setStatus("idle");
      return out;
    })();
  };

  /* True se l'analizzatore sta ricevendo davvero il microfono.
     La UI usa questo flag per scegliere tra dati reali e animazione
     procedurale di riserva (mai linee morte). */
  V.hasAnalyser = function () {
    return !!(V._analyser && V._analyser.context && V._analyser.context.state === "running");
  };

  /* Livello audio reale del microfono (0..1) per n barre della waveform.
     Senza AnalyserNode (browser molto vecchi) restituisce zeri: la UI
     mostra la linea di base, mai un errore. */
  V.levels = function (n) {
    var out = [];
    var i, j;
    for (i = 0; i < n; i++) out.push(0);
    if (!V._analyser || !V._analyser.context || V._analyser.context.state !== "running") return out;
    try {
      if (!levelBuf || levelBuf.length !== V._analyser.frequencyBinCount) {
        levelBuf = new Uint8Array(V._analyser.frequencyBinCount);
      }
      V._analyser.getByteFrequencyData(levelBuf);
      var freq = levelBuf;
      var per = freq.length / n;
      for (i = 0; i < n; i++) {
        var start = Math.floor(i * per);
        var end = Math.max(start + 1, Math.floor((i + 1) * per));
        var sum = 0;
        for (j = start; j < end; j++) sum += freq[j];
        var avg = sum / (end - start);
        // Curva: alza i valori bassi, smorza il rumore di fondo.
        out[i] = Math.pow(Math.min(1, avg / 255), 1.5);
      }
    } catch (_) { /* noop */ }
    return out;
  };

  /* Millisecondi dall'inizio dell'ascolto (per il timer live). */
  V.listenSince = function () {
    return listenStartedAt ? Math.max(0, performance.now() - listenStartedAt) : 0;
  };

  /* Esposto per i test: l'euristica dell'endpointing dinamico. */
  V.endpointTimeout = endpointTimeout;

  /* Solo filler NON lessicali: "allora"/"cioè"/"ecco" sono parole
     normali del discorso italiano e falserebbero il conteggio. */
  function countFillers(text) {
    var fillers = ["ehm", "uhm", "mmh", "beh", "mah", "boh", "vabbeh", "insomma"];
    var lower = " " + String(text || "").toLowerCase() + " ";
    var n = 0;
    fillers.forEach(function (f) {
      var re = new RegExp("\\b" + f + "\\b", "g");
      var m = lower.match(re);
      if (m) n += m.length;
    });
    return n;
  }

  function teardown() {
    V._interrupted = false;
    V._startPending = false;
    V._analyser = null;
    stopInterimRecognition();
    lastInterim = "";
    if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
    stopSilenceWatcher();
    vadActive = false;
    if (vadInstance) { try { vadInstance.destroy(); } catch (_) { /* noop */ } vadInstance = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
    mediaRecorder = null;
    return Promise.resolve();
  }

  /* Ferma tutto senza trascrivere (es. cambio domanda, pausa sessione). */
  V.cancel = function () {
    V._startPending = false;
    setStatus("idle");
    stopTtsPlayback(true);
    return teardown();
  };

  /* ---------------------------- Init ---------------------------- */
  V.init = function (handlers) {
    handlers = handlers || {};
    if (handlers.onStatus) V._onStatus = handlers.onStatus;
    if (handlers.onResult) V._onResult = handlers.onResult;
    if (handlers.onTtsState) V._onTtsState = handlers.onTtsState;
    if (handlers.onTtsPlay) V._onTtsPlay = handlers.onTtsPlay;
    if (handlers.onTtsSentence) V._onTtsSentence = handlers.onTtsSentence;
    if (handlers.onInterim) V._onInterim = handlers.onInterim;
    loadPersisted();
    V.micSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    V.ready = true;
    // Sblocco audio alla PRIMA interazione (pointerdown/keydown): senza
    // questa gesture Chrome/iOS tengono sospeso l'AudioContext e il Web
    // Audio sarebbe muto. Copre inizio simulazione, toggle e microfono.
    bindAudioUnlock();
    // Chrome popola getVoices() in modo asincrono: forziamo il refresh.
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = function () { tdbg("SPEECH_VOICES", "elenco voci aggiornato"); };
        }
      } catch (_) { /* noop */ }
    }
  };

  /* Sblocco audio esplicito (lo usano i click principali della UI). */
  V.unlockAudio = unlockAudio;

  /* Provider effettivo attivo (debug e test). */
  V.effectiveProvider = effectiveProvider;

  /* Selezione voce Kokoro (esposta per i test). */
  V._pickKokoroVoice = pickKokoroVoice;

  /* Esposti per i test: preparazione piper e slicing proporzionale. */
  V._loadPiper = loadPiper;
  V._sentenceBoundaries = sentenceBoundaries;

  /* Diagnostica TTS on-demand: dump completo dello stato interno. */
  V.ttsDebug = function () {
    var nVoices = 0;
    if (window.speechSynthesis) {
      try { nVoices = (window.speechSynthesis.getVoices() || []).length; } catch (_) { nVoices = 0; }
    }
    return {
      enabled: V.ttsEnabled,
      provider: effectiveProvider(),
      providerReason: V.ttsProviderReason || "",
      forced: V.ttsProvider || "auto",
      kind: V.ttsKind,
      status: V.ttsStatus,
      piper: V.piperStatus,
      piperProgress: Math.round(V.piperProgress * 100),
      piperVoice: getPiperVoice(),
      state: V.ttsState,
      mode: V.ttsMode,
      kokoroLoaded: !!kokoroTts,
      speechSynthesis: !!window.speechSynthesis,
      voices: nVoices,
      audioCtx: audioCtx ? audioCtx.state : null,
      micSupported: V.micSupported,
      recording: V.recording
    };
  };
})();
