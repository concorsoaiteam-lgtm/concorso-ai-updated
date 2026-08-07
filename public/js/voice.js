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
    _onStatus: null,         // callback stato UI
    _onResult: null,         // callback risultato trascrizione {text, words, metrics}
    _onTtsState: null        // callback cambio stato TTS
  };

  var K_TTS = "cai_voice_tts";       // persistenza toggle voce commissione
  var K_INTERIM = "cai_voice_interim";

  /* Punti di ingresso CDN (verificati: tutti rispondono 200) */
  var CDN = {
    kokoroEsm: "https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm",
    vadEsm: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/+esm",
    vadBase: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/"
  };

  var VAD_MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX"; // modello ONNX ufficiale kokoro-js
  var KOKORO_VOICE = "if_sara"; // voce italiana femminile (fallback: prima voce disponibile)

  /* ---------------------------- Helpers ---------------------------- */
  function getToken() {
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

  /* ---------------------------- TTS: Kokoro ---------------------------- */
  var kokoroTts = null;          // istanza KokoroTTS
  var kokoroLoading = null;      // promise caricamento
  var audioCtx = null;
  var spokeViaSpeech = false;    // vero se almeno una volta è stato usato il fallback

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

  /* Creazione WAV dal Float32Array di Kokoro (sampleRate 24000) */
  function floatToWav(samples, sampleRate) {
    var buf = new ArrayBuffer(44 + samples.length * 2);
    var view = new DataView(buf);
    function writeStr(off, s) { for (var i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); }
    writeStr(0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true); writeStr(8, "WAVE");
    writeStr(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeStr(36, "data"); view.setUint32(40, samples.length * 2, true);
    var offset = 44;
    for (var i = 0; i < samples.length; i++) {
      var s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
    return new Blob([view], { type: "audio/wav" });
  }

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

  /* TTS pubblico: legge il testo, risolve quando ha finito (per il
     tempo di risposta) oppure rifiuta se impossibile.
     Regola (decisione voce): Kokoro on-device è SEMPRE il primario.
     speechSynthesis è SOLO un fallback, attivato se Kokoro non è
     caricabile — mai la voce del browser al primo posto. */
  V.speak = function (text) {
    var str = String(text || "").trim();
    if (!str) return Promise.resolve();
    if (!V.ttsEnabled) return Promise.resolve();
    // Kokoro pronto → usalo, senza se e senza ma.
    if (kokoroTts) {
      V.ttsKind = "kokoro";
      return kokoroSpeak(str);
    }
    // Non ancora pronto: se il fallback è già stato usato (perché il
    // caricamento Kokoro è fallito) usa speech; altrimenti carica Kokoro.
    if (spokeViaSpeech && window.speechSynthesis) {
      return speechSpeak(str);
    }
    return loadKokoro()
      .then(function () {
        V.ttsKind = "kokoro";
        return kokoroSpeak(str);
      })
      .catch(function () {
        spokeViaSpeech = true;
        V.ttsKind = "speech";
        return speechSpeak(str);
      });
  };

  var currentAudioEl = null;

  function kokoroSpeak(text) {
    ensureAudioCtx();
    return kokoroTts.tts.generate(text, { voice: kokoroTts.voice }).then(function (result) {
      var samples = result && result.audio ? result.audio : null;
      var rate = result && result.sampleRate ? result.sampleRate : 24000;
      if (!samples || !samples.length) return;
      var ctx = audioCtx || ensureAudioCtx();
      if (!ctx) return;
      var wav = floatToWav(samples, rate);
      var url = URL.createObjectURL(wav);
      return new Promise(function (resolve) {
        var el = new Audio(url);
        currentAudioEl = el;
        el.onended = function () { currentAudioEl = null; URL.revokeObjectURL(url); resolve(); };
        el.onerror = function () { currentAudioEl = null; URL.revokeObjectURL(url); resolve(); };
        el.play().catch(function () { currentAudioEl = null; URL.revokeObjectURL(url); resolve(); });
      });
    });
  }

  function speechSpeak(text) {
    return new Promise(function (resolve) {
      if (!window.speechSynthesis) { resolve(); return; }
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "it-IT";
      u.rate = 1;
      var voices = window.speechSynthesis.getVoices();
      var it = voices.find(function (v) { return /^it/i.test(v.lang); });
      if (it) u.voice = it;
      u.onend = resolve;
      u.onerror = resolve;
      window.speechSynthesis.speak(u);
    });
  }

  V.setTtsEnabled = function (on) {
    V.ttsEnabled = !!on;
    persistTts();
    if (V._onTtsState) V._onTtsState(V.ttsEnabled ? (V.ttsKind || "loading") : "off");
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

  function ensureVadModules() {
    if (vadModules) return Promise.resolve(vadModules);
    return import(/* webpackIgnore: true */ CDN.vadEsm).then(function (m) {
      vadModules = m;
      return vadModules;
    });
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
     mentre la commissione sta ancora leggendo la domanda. */
  V.start = function (opts) {
    opts = opts || {};
    if (V.recording || V.transcribing) return Promise.reject(new Error("already-busy"));
    if (!V.micSupported) return Promise.reject(new Error("mic-unsupported"));
    // Interruzione = l'utente ha avviato il mic mentre la commissione
    // stava ancora leggendo la domanda (flag esplicito da simulation.js).
    // Catturato in modo sincrono: la richiesta del microfono richiede
    // ~1s, in cui la TTS potrebbe terminare e il segnale andrebbe perso.
    V._interrupted = !!opts.interruptedByUser;
    return (async function () {
      // Carica i moduli VAD in parallelo alla richiesta del microfono.
      var vadP = ensureVadModules();
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      var m = await vadP;

      speechChunks = [];
      speechSegments = [];
      firstSpeechAt = 0;
      segStart = 0;
      lastSpeechEnd = 0;
      listenStartedAt = performance.now();

      // MediaRecorder per il blob (webm/opus) da inviare a /api/stt
      var mime = "audio/webm;codecs=opus";
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(mime)) {
        mime = "audio/webm";
      }
      if (typeof MediaRecorder === "undefined") {
        throw new Error("media-recorder-unsupported");
      }
      mediaRecorder = new MediaRecorder(mediaStream, { mimeType: mime });
      mediaRecorder.ondataavailable = function (e) {
        if (e.data && e.data.size > 0) speechChunks.push(e.data);
      };

      // VAD: metriche paralinguistiche in tempo reale (€0, client-side)
      vadInstance = await m.MicVAD.new({
        stream: mediaStream,
        baseAssetURL: CDN.vadBase,
        positiveSpeechThreshold: 0.7,
        negativeSpeechThreshold: 0.4,
        minSpeechFrames: 4,
        onSpeechStart: function () {
          var t = performance.now();
          if (!firstSpeechAt) firstSpeechAt = t;
          segStart = t;
          if (V._onStatus) V._onStatus("speaking");
        },
        onSpeechEnd: function () {
          var t = performance.now();
          if (segStart) speechSegments.push({ start: segStart, end: t });
          lastSpeechEnd = t;
          // Auto-stop dopo ~1.6s di silenzio (la risposta è finita).
          if (autoStopTimer) clearTimeout(autoStopTimer);
          autoStopTimer = setTimeout(function () {
            if (V.recording) V.stop();
          }, 1600);
          if (V._onStatus) V._onStatus("listening");
        },
        onVADMisfire: function () { /* troppo breve: ignora */ }
      });

      mediaRecorder.start(250);
      await vadInstance.start();
      setStatus("recording");
      return true;
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
     viene segnalato via onStatus. */
  V.stop = function () {
    if (!V.recording) return Promise.resolve({ text: "", words: [], metrics: computeMetrics() });
    return (async function () {
      if (autoStopTimer) clearTimeout(autoStopTimer);
      setStatus("transcribing");
      var blob = null;
      try {
        if (vadInstance) { try { await vadInstance.pause(); } catch (_) { /* noop */ } }
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          blob = await new Promise(function (resolve) {
            var done = false;
            var finish = function (b) { if (!done) { done = true; resolve(b); } };
            mediaRecorder.onstop = function () {
              finish(new Blob(speechChunks, { type: mediaRecorder.mimeType || "audio/webm" }));
            };
            try { mediaRecorder.stop(); } catch (_) { /* noop */ }
            setTimeout(function () { finish(new Blob(speechChunks, { type: "audio/webm" })); }, 1200);
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
      try {
        var b64 = await base64FromBlob(blob);
        var token = getToken();
        var resp = await fetch("/api/stt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token ? "Bearer " + token : ""
          },
          body: JSON.stringify({ audio: b64, mime: blob.type || "audio/webm" })
        });
        if (!resp.ok) throw new Error("http-" + resp.status);
        var data = await resp.json();
        var text = String(data.text || "").trim();
        var words = Array.isArray(data.words) ? data.words : [];
        var wpm = null;
        if (words.length && metrics.speechMs > 0) {
          wpm = Math.round(words.length / (metrics.speechMs / 60000));
        }
        metrics.wpm = wpm;
        metrics.fillerCount = countFillers(text);
        var out = { text: text, words: words, metrics: metrics };
        if (V._onResult) V._onResult(out);
        setStatus("idle");
        return out;
      } catch (err) {
        console.error("[voice] trascrizione fallita:", err && err.message);
        setStatus("idle");
        if (V._onStatus) V._onStatus("error");
        var failed = { text: "", words: [], metrics: metrics, error: (err && err.message) || "unknown" };
        if (V._onResult) V._onResult(failed);
        return failed;
      }
    })();
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
    if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
    if (vadInstance) { try { vadInstance.destroy(); } catch (_) { /* noop */ } vadInstance = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
    mediaRecorder = null;
    return Promise.resolve();
  }

  /* Ferma tutto senza trascrivere (es. cambio domanda, pausa sessione). */
  V.cancel = function () {
    setStatus("idle");
    return teardown();
  };

  /* ---------------------------- Init ---------------------------- */
  V.init = function (handlers) {
    handlers = handlers || {};
    if (handlers.onStatus) V._onStatus = handlers.onStatus;
    if (handlers.onResult) V._onResult = handlers.onResult;
    if (handlers.onTtsState) V._onTtsState = handlers.onTtsState;
    loadPersisted();
    V.micSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    V.ready = true;
    // Niente pre-caricamento e NIENTE fallback implicito: Kokoro resta
    // il primario. Il primo download (~100MB, una tantum) parte al primo
    // uso reale della voce, con stato "Carico la voce…" visibile.
  };
})();
