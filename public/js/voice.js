/* =========================================================================
   voice.js — ConcorsoAI · Pipeline vocale della simulazione orale
   =========================================================================
   Cosa fa (decisione del round voce — vedi md/voice-stt-tts-report.md):
   • STT: Deepgram nova-3 via proxy serverless /api/stt (la chiave master
     resta sul server; le ephemeral keys richiedono scope keys:write che
     il piano free non ha). Risposta: {text, words:[{word,start,end}]}.
   • VAD: Silero via @ricky0123/vad-web (WASM, client-side, €0) per le
     metriche paralinguistiche: tempo di risposta, pause, durata parlato.
   • TTS: Kokoro-82M on-device (Apache 2.0, WASM, €0) con voci italiane;
     fallback SOLO a speechSynthesis se Kokoro non è caricabile.
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
    _onTtsPlay: null,        // callback stato player TTS (preparing/playing/paused/…)
    ttsState: "idle",        // idle|preparing|playing|paused|done|stopped
    ttsMode: null,           // 'audio' (Web Audio) | 'speech' (fallback)
    ttsRate: 1               // velocità di lettura (1 | 1.25 | 1.5)
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
  var audioCtx = null;
  var spokeViaSpeech = false;    // vero se almeno una volta è stato usato il fallback
  var ttsGen = 0;                // generazione: invalida i synth in corso su stop/interruzione
  var ttsResolve = null;         // resolve della speak() in corso

  function ensureAudioCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () { /* noop */ });
    }
    return audioCtx;
  }

  /* Stato del player segnalato alla UI (callback onTtsPlay). */
  function onTtsPlay(s) {
    V.ttsState = s;
    if (V._onTtsPlay) V._onTtsPlay(s);
  }

  /* Provider A — Kokoro on-device. Prima volta: download del modello
     (~100MB, una tantum, cache HF). Poi quasi istantaneo. */
  function loadKokoro() {
    if (kokoroTts) return Promise.resolve(kokoroTts);
    if (kokoroLoading) return kokoroLoading;
    kokoroLoading = (async function () {
      V.ttsStatus = "loading";
      if (V._onTtsState) V._onTtsState("loading");
      var mod = await import(/* webpackIgnore: true */ CDN.kokoroEsm);
      var tts = await mod.KokoroTTS.from_pretrained(VAD_MODEL_ID, {
        dtype: "q8",
        device: "wasm"
      });
      // Sceglie la voce italiana se disponibile, altrimenti la prima.
      var voices = [];
      try { voices = tts.list_voices ? tts.list_voices() : []; } catch (_) { voices = []; }
      var voice = voices.indexOf(KOKORO_VOICE) !== -1 ? KOKORO_VOICE : (voices[0] || KOKORO_VOICE);
      kokoroTts = { tts: tts, voice: voice };
      V.ttsStatus = "ready";
      V.ttsKind = "kokoro";
      if (V._onTtsState) V._onTtsState("ready");
      return kokoroTts;
    })();
    kokoroLoading.catch(function () {
      V.ttsStatus = "error";
      V.ttsKind = null;
      if (V._onTtsState) V._onTtsState("error");
      kokoroLoading = null;
    });
    return kokoroLoading;
  }

  /* Kokoro → AudioBuffer (niente blob WAV: il player Web Audio lavora
     sul buffer per pausa/riprendi/velocità). */
  function kokoroSynth(text) {
    ensureAudioCtx();
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
      player.gapTimer = setTimeout(onAdvance, seg.gapMs || 0);
    };
    player.source = src;
    player.playing = true;
    var ctx = audioCtx || ensureAudioCtx();
    player.startedAt = ctx ? ctx.currentTime : 0;
  }

  function playerPlaySegment(i) {
    var ctx = audioCtx || ensureAudioCtx();
    if (!ctx) return playerFinish();
    var seg = player.segments[i];
    if (!seg) return playerFinish();
    player.idx = i;
    var src = ctx.createBufferSource();
    src.buffer = seg.buf;
    player.manualStop = false;
    player.offset = 0;
    wireSource(src, seg, function () { playerPlaySegment(i + 1); });
    src.start(0, 0);
    onTtsPlay("playing");
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
    var ctx = audioCtx || ensureAudioCtx();
    if (!ctx || !player.segments.length || player.playing) return;
    var seg = player.segments[player.idx];
    if (!seg) return playerFinish();
    if (player.offset >= seg.buf.duration) {
      player.offset = 0;
      playerPlaySegment(player.idx + 1);
      return;
    }
    var src = ctx.createBufferSource();
    src.buffer = seg.buf;
    player.manualStop = false;
    wireSource(src, seg, function () {
      player.offset = 0;
      playerPlaySegment(player.idx + 1);
    });
    src.start(0, player.offset);
    onTtsPlay("playing");
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

  function speechNext() {
    if (speechSeq.cancelled) return;
    if (!window.speechSynthesis || speechSeq.idx >= speechSeq.texts.length) {
      finishSpeech();
      return;
    }
    var u = new SpeechSynthesisUtterance(speechSeq.texts[speechSeq.idx]);
    u.lang = "it-IT";
    u.rate = V.ttsRate;
    var voices = window.speechSynthesis.getVoices();
    var it = voices.find(function (v) { return /^it/i.test(v.lang); });
    if (it) u.voice = it;
    u.onend = function () {
      if (speechSeq.cancelled) return;
      speechSeq.current = null;
      speechSeq.idx += 1;
      if (!speechSeq.cancelled) onTtsPlay("playing");
      speechNext();
    };
    u.onerror = function () { finishSpeech(); };
    speechSeq.current = u;
    onTtsPlay("playing");
    window.speechSynthesis.speak(u);
  }

  function startSpeech(texts) {
    return new Promise(function (resolve) {
      speechSeq.texts = texts;
      speechSeq.idx = 0;
      speechSeq.current = null;
      speechSeq.cancelled = false;
      ttsResolve = resolve;
      // Difensivo: un replay dopo una pausa non deve restare in stato
      // "paused" su motori che non resettano lo stato con cancel().
      if (window.speechSynthesis && window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (_) { /* noop */ }
      }
      speechNext();
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

  function buildSegments(sentences, gen) {
    if (kokoroTts) return buildKokoroSegments(sentences, gen);
    if (spokeViaSpeech && window.speechSynthesis) return buildSpeechSegments(sentences, gen);
    return loadKokoro()
      .then(function () { return buildKokoroSegments(sentences, gen); })
      .catch(function () {
        spokeViaSpeech = true;
        V.ttsKind = "speech";
        return buildSpeechSegments(sentences, gen);
      });
  }

  async function buildKokoroSegments(sentences, gen) {
    V.ttsKind = "kokoro";
    V.ttsMode = "audio";
    var built = [];
    for (var i = 0; i < sentences.length; i++) {
      if (gen !== ttsGen) return [];   // fermato mentre sintetizzava
      var buf = await kokoroSynth(sentences[i]);
      if (buf) built.push({ buf: buf, gapMs: i < sentences.length - 1 ? 400 : 0 });
    }
    if (gen !== ttsGen) return [];
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
     interrotta). Kokoro SEMPRE primario; speech solo se non caricabile. */
  V.speak = function (text) {
    var str = String(text || "").trim();
    if (!str) return Promise.resolve();
    if (!V.ttsEnabled) return Promise.resolve();
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
      .catch(function () {
        if (gen === ttsGen) onTtsPlay("stopped");
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

  /* Pre-carica Kokoro in background (es. quando l'utente attiva la voce):
     la prima domanda parte subito, senza attesa del modello. */
  V.warmTts = function () {
    if (kokoroTts || spokeViaSpeech) return;
    loadKokoro().catch(function () { /* fallback automatico al primo speak */ });
  };

  V.setTtsEnabled = function (on) {
    on = !!on;
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
          if (quietMs >= 2500) { V.stop(); return; }
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
                // Auto-stop dopo ~1.8s di silenzio (la risposta è finita).
                if (autoStopTimer) clearTimeout(autoStopTimer);
                autoStopTimer = setTimeout(function () {
                  if (V.recording) V.stop();
                }, 1800);
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
    loadPersisted();
    V.micSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    V.ready = true;
    // Niente pre-caricamento e NIENTE fallback implicito: Kokoro resta
    // il primario. Il primo download (~100MB, una tantum) parte al primo
    // uso reale della voce, con stato "Carico la voce…" visibile.
  };
})();
