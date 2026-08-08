/* =========================================================================
   voice.js — ConcorsoAI · Riconoscimento vocale della risposta (STT)
   =========================================================================
   Cosa fa:
   • STT: Deepgram nova-3 via proxy serverless /api/stt (la chiave master
     resta sul server). Risposta: {text, words:[{word,start,end}]}.
   • VAD: Silero via @ricky0123/vad-web (WASM, client-side, €0) per le
     metriche paralinguistiche: tempo di risposta, pause, durata parlato.
   • Metriche: timeToAnswerMs, speechMs, pauseCount, wpm, fillerCount →
     diventano parte del feedback (mai perse).
   Il microfono è SOLO uno strumento per dare la risposta: si parla →
   si trascrive → si corregge → si invia. Nessuna voce generata dall'app.
   Tutto lazy-loaded dal CDN al primo uso: la pagina resta leggera.
   Nessuna chiave nel client: il modulo parla solo con /api/stt.
   ========================================================================= */
(function () {
  "use strict";

  var V = window.Voice = {
    ready: false,            // modulo inizializzato
    micSupported: false,
    recording: false,
    transcribing: false,
    _startPending: false,    // avvio in corso (getUserMedia/VAD): stop/cancel sicuri
    _analyser: null,         // AnalyserNode del microfono → waveform live reale
    _onStatus: null,         // callback stato UI
    _onResult: null,         // callback risultato trascrizione {text, words, metrics}
    _onInterim: null         // callback trascrizione progressiva (solo display)
  };

  /* Punti di ingresso CDN del VAD (verificati: rispondono 200). */
  var CDN = {
    ortUmd: "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.min.js",
    vadUmd: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/bundle.min.js",
    vadEsm: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/+esm",
    vadBase: "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.7/dist/"
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

  /* AudioContext per l'analizzatore del microfono. Creato in modo SINCRONO
     nel gestore del click (user gesture): altrimenti su Chrome parte
     "suspended" e la waveform non riceverebbe mai i livelli del microfono. */
  var audioCtx = null;
  function ensureAudioCtx() {
    if (!audioCtx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    return audioCtx;
  }

  /* Sblocco audio nella USER GESTURE. Chrome e iOS tengono sospeso un
     AudioContext nato senza interazione: l'analizzatore del microfono
     ne dipende. Da chiamare in modo SINCRONO nei click del microfono. */
  function unlockAudio() {
    var ctx = ensureAudioCtx();
    if (ctx && ctx.state === "suspended") {
      try {
        ctx.resume().catch(function () { /* noop */ });
      } catch (_) { /* noop */ }
    }
    return ctx;
  }

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
  var interimRec = null;       // Web Speech interim (solo display progressivo)
  var lastInterim = "";        // testo interim corrente (per l'endpointing dinamico)
  var vadModules = null;
  var vadActive = false;       // VAD realmente operativo (auto-stop + metriche)
  var silenceTimer = null;     // auto-stop su silenzio quando il VAD non c'è
  var quietMs = 0;
  var levelBuf = null;         // buffer riusato per la waveform (zero allocazioni/frame)

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
      fillerCount: 0
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
     _startPending rende safe lo stop durante l'avvio: se l'utente
     clicca "Ferma" mentre getUserMedia/VAD sono in corso, l'ascolto
     non parte mai (niente stato fantasma). */
  V.start = function () {
    if (V.recording || V.transcribing || V._startPending) return Promise.reject(new Error("already-busy"));
    if (!V.micSupported) return Promise.reject(new Error("mic-unsupported"));
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
      await teardown();
      var metrics = computeMetrics();
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
    return teardown();
  };

  /* ---------------------------- Init ---------------------------- */
  V.init = function (handlers) {
    handlers = handlers || {};
    if (handlers.onStatus) V._onStatus = handlers.onStatus;
    if (handlers.onResult) V._onResult = handlers.onResult;
    if (handlers.onInterim) V._onInterim = handlers.onInterim;
    V.micSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    V.ready = true;
  };

  /* Sblocco audio esplicito (lo usano i click principali della UI). */
  V.unlockAudio = unlockAudio;
})();
