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
  var levelBuf = null;            // buffer riusato per la waveform (zero allocazioni/frame)

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
    V._startPending = true;
    return (async function () {
      try {
        // Carica i moduli VAD in parallelo alla richiesta del microfono.
        var vadP = ensureVadModules();
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        if (!V._startPending) { teardown(); return false; }
        var m = await vadP;
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
            // Nuovo segmento di parlato: annulla l'auto-stop pendente, così
            // una pausa >1.8s seguita da una ripresa NON taglia la risposta.
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

        if (!V._startPending) { teardown(); return false; }
        mediaRecorder.start(250);
        await vadInstance.start();
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
      // prossimo checkpoint (teardown + return false). Niente doppio teardown.
      V._startPending = false;
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
          out = { text: text, words: words, metrics: metrics };
          break;
        } catch (err) {
          // Niente retry sui 4xx (token, payload): sarebbe inutile.
          var retriable = !(err && err.message && /^http-4/.test(err.message));
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
    if (vadInstance) { try { vadInstance.destroy(); } catch (_) { /* noop */ } vadInstance = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(function (t) { t.stop(); }); mediaStream = null; }
    mediaRecorder = null;
    return Promise.resolve();
  }

  /* Ferma tutto senza trascrivere (es. cambio domanda, pausa sessione). */
  V.cancel = function () {
    V._startPending = false;
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
