/* =========================================================================
   simulation.js — ConcorsoAI · Pagina di simulazione dell'orale
   State machine a fasi: boot → gate → setup → briefing → running
   (feedback) → paused → report. Nessuna libreria: CSS transitions + rAF.
   Persistenza: Supabase (simulazioni) + localStorage (draft, coda, bank).
   Riuso: window.Dash (dash-common.js), window.telemetry (telemetry.js).
   ========================================================================= */
(function () {
  "use strict";

  var D = (typeof window.Dash !== "undefined") ? window.Dash : null;
  var $ = function (id) { return document.getElementById(id); };
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Stato globale della pagina
     ------------------------------------------------------------------ */
  var S = {
    phase: "boot",              // boot|gate|setup|briefing|running|paused|report
    user: null,                 // {id, email, displayName, plan}
    bando: null,                // bando attivo da localStorage
    subject: null,              // materia dell'allenamento libero (senza bando)
    allenaIntent: /[?&]allena=1/.test(window.location.search), // "Allenati" dalla dashboard
    used: 0,                    // simulazioni usate questo mese
    mode: "standard",           // standard|rapida|difficile|ripasso
    questions: [],              // [{id, testo, argomento}]
    qBankReady: false,
    idx: 0,                     // indice domanda corrente
    simId: null,                // id simulazione nel DB (se creata)
    simCreated: false,
    answers: [],                // [{q, risposta, scores, feedback, suggerimento}]
    startedAt: 0,               // epoch ms
    elapsedMs: 0,               // accumulato (pausa)
    timerHandle: null,
    countdownHandle: null,
    sending: false,
    feedbackDone: false,
    streamCtrl: null,           // AbortController del fetch corrente
    helpBusy: false,            // aiuto "non so rispondere" in corso
    helpCtrl: null,             // AbortController dell'aiuto corrente
    helpCache: {},              // spunto/risposta già generati per domanda (q.id → {spunto, risposta})
    resumeData: null,           // sessione da riprendere
    bankLoading: null,          // Promise generazione bank
    voiceMetrics: null,         // metriche paralinguistiche ultima risposta vocale
    voiceTtsEndAt: 0,           // performance.now() quando la TTS della domanda è finita
    voiceSpeaking: false,       // la commissione sta ancora leggendo la domanda
    oralScope: null,            // 'question' | 'response' — testo attivo del palco
    lastFeedback: null,         // {scores, feedback, suggerimento} dell'ultimo turno
    interaction: lsGet("cai_interaction") === "vocale" ? "vocale" : "scritta" // scritta|vocale
  };

  /* ------------------------------------------------------------------
     Chiavi localStorage (prefisso cai_* come dashboard)
     ------------------------------------------------------------------ */
  var K_BANK = "cai_qbank_";          // + bandoId → {ts, domande:[...]}
  var K_DRAFT = "cai_sim_draft_";      // + simId → sessione completa
  var K_OPS = "cai_pending_ops";       // coda scritture fallite
  var K_LAST_SIM = "cai_last_sim";     // ultima simulazione (ripresa)
  var K_ONBOARD = "cai_onboard_choice"; // micro-decisione di ingresso: "demo" | "bando"
  var K_INTERACTION = "cai_interaction"; // preferenza modalità risposta: "scritta" | "vocale"
  var BANK_TTL = 7 * 24 * 3600 * 1000; // 7 giorni
  var REC_DONE_MS = 2500;   // "Messaggio pronto" visibile prima della chiusura
  var REC_SUBMIT_MS = 2600; // invio automatico (solo modalità vocale), dopo il "pronto"
  var V_REC_DONE_MS = 1000;  // vocale: l'orale non aspetta — "pronto" breve, poi la commissione riflette
  var V_REC_SUBMIT_MS = 1150;
  var ORAL_NEXT_DELAY = 1000; // pausa naturale prima della domanda successiva (simulazione vocale)
  var recSubmitTimer = null; // invio automatico pendente: annullato se l'utente ri-registra
  var voiceNextTimer = null; // auto-avanzamento domanda dopo il feedback parlato

  var MODES = {
    standard: {
      label: "Standard", n: 12, pro: false, badge: "",
      desc: "12 domande sul tuo bando, una alla volta. Dopo ogni risposta il commissario ti dà punteggi e correzione. ~20 minuti."
    },
    rapida: {
      label: "Rapida", n: 6, pro: false, badge: "",
      desc: "6 domande, meno di 15 minuti. Ideale per iniziare o per i giorni pieni."
    },
    difficile: {
      label: "Difficile", n: 12, pro: true, badge: "Pro",
      desc: "12 domande con interruzioni e approfondimenti, come un orale tosto. Timer per domanda nelle ultime 3. Incluso in Pro."
    }
  };

  /* ------------------------------------------------------------------
     Materie per l'allenamento libero (senza bando caricato).
     Sono le materie più ricorrenti negli orali dei concorsi pubblici
     italiani (Comuni, Regioni, Ministeri, ASL, Agenzie fiscali).
     L'utente ne estrae una a caso e può cambiarla prima di iniziare.
     ------------------------------------------------------------------ */
  var FREE_SUBJECTS = [
    { id: "diritto-amministrativo", name: "Diritto amministrativo",
      hint: "procedimento amministrativo, legge 241/1990, nullità e annullabilità, discrezionalità, diritti del cittadino" },
    { id: "diritto-costituzionale", name: "Diritto costituzionale",
      hint: "principi della Costituzione, art. 3 e 97, formazione delle leggi, decreti-legge, diritti fondamentali" },
    { id: "enti-locali", name: "Ordinamento degli enti locali (TUEL)",
      hint: "organi del Comune, Consiglio e Giunta, delibere, rapporto politica-gestione, Segretario comunale" },
    { id: "contabilita-pubblica", name: "Contabilità pubblica e degli enti locali",
      hint: "bilancio di previsione, rendiconto, principi di veridicità e pareggio, fasi di entrata e di spesa" },
    { id: "contratti-pubblici", name: "Contratti pubblici",
      hint: "codice dei contratti (d.lgs. 36/2023), soglie europee, affidamento diretto, principi del risultato e della fiducia" },
    { id: "legislazione-sanitaria", name: "Legislazione sanitaria e organizzazione ASL",
      hint: "organizzazione dell'ASL, SSN, principi di universalità uguaglianza ed equità, d.lgs. 502/1992" },
    { id: "lavoro-pubblico", name: "Diritto del lavoro e pubblico impiego",
      hint: "privatizzazione del pubblico impiego, d.lgs. 165/2001, doveri del dipendente, codice di comportamento, sanzioni disciplinari" },
    { id: "anticorruzione", name: "Anticorruzione e trasparenza",
      hint: "legge 190/2012, d.lgs. 33/2013, PIAO, accesso civico semplice e generalizzato (FOIA), codice di comportamento" },
    { id: "privacy", name: "Privacy e protezione dei dati (GDPR)",
      hint: "principi del trattamento dati, regolamento UE 2016/679, ruolo del DPO, diritti dell'interessato" },
    { id: "organizzazione-pa", name: "Organizzazione e gestione della PA",
      hint: "misurazione della performance, cittadinanza digitale, CAD, qualità dei servizi pubblici" },
    { id: "informatica", name: "Informatica di base",
      hint: "hardware e software, reti LAN/WAN, sicurezza informatica, phishing, firma digitale, PEC, fogli di calcolo" },
    { id: "inglese", name: "Lingua inglese",
      hint: "presentazione personale, conversazione su lavoro e pubblica amministrazione, traduzione di brevi testi" }
  ];

  var bankGen = 0; // generazione della bank: invalida le promise vecchie

  /* Cambia materia: la bank precedente NON vale più. La promise LLM in volo
     viene invalidata via generazione (bankGen): al resolve scrive solo se la
     sua generazione è ancora l'ultima. */
  function pickRandomSubject() {
    var idx = Math.floor(Math.random() * FREE_SUBJECTS.length);
    if (FREE_SUBJECTS.length > 1 && S.subject) {
      var cur = FREE_SUBJECTS.indexOf(S.subject);
      if (idx === cur) idx = (idx + 1) % FREE_SUBJECTS.length;
    }
    S.subject = FREE_SUBJECTS[idx];
    invalidateBank();
    return S.subject;
  }

  function invalidateBank() {
    bankGen += 1;
    S.qBankReady = false;
    S.questions = [];
    S.bankLoading = null;
  }

  /* ------------------------------------------------------------------
     Persistenza locale
     ------------------------------------------------------------------ */
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* noop */ } }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) { /* noop */ } }

  function saveDraft() {
    var payload = {
      simId: S.simId, mode: S.mode, idx: S.idx, startedAt: S.startedAt,
      elapsedMs: S.elapsedMs, answers: S.answers,
      questions: S.questions.map(function (q) {
        return { id: q.id, testo: q.testo, argomento: q.argomento };
      }),
      bandoId: S.bando ? S.bando.id : null,
      subjectId: S.subject ? S.subject.id : null,
      draftAnswer: (S.phase === "session") ? ($("answer-textarea").value || "") : "",
      interaction: S.interaction
    };
    if (S.simId) lsSet(K_DRAFT + S.simId, payload);
    lsSet(K_LAST_SIM, payload);
  }

  function clearDraft() {
    if (S.simId) lsDel(K_DRAFT + S.simId);
    lsDel(K_LAST_SIM);
  }

  /* ------------------------------------------------------------------
     Coda scritture fallite → flush su 'online'
     ------------------------------------------------------------------ */
  function queueOp(op) {
    var q = lsGet(K_OPS) || [];
    q.push(op);
    lsSet(K_OPS, q);
  }

  /* Un errore DB è "permanente" quando riprovare non può funzionare:
     tabella/colonna mancante (PGRST2xx), vincolo, permessi (SQLSTATE 42*)
     o 4xx definitivi. In quei casi l'op viene scartata una volta, senza
     riaccodarla all'infinito (che sporca la console e cresce la coda). */
  function isPermanentDbError(err) {
    if (!err) return false;
    var code = String(err.code || "");
    var status = Number(err.status || err.statusCode || 0);
    if (code.indexOf("PGRST") === 0) return true;            // schema/relation/column
    if (/^42/.test(code)) return true;                        // SQLSTATE 42* (RLS inclusa)
    if (status >= 400 && status < 500 && status !== 429 && status !== 408) return true; // 4xx definitivi
    return false;
  }

  function flushOps() {
    var q = lsGet(K_OPS) || [];
    if (!q.length || !D || !D.supabase) return;
    lsSet(K_OPS, []);
    q.forEach(function (op) { persistWrite(op); });
  }

  /* ------------------------------------------------------------------
     Persistenza Supabase — scritture non bloccanti, optimistic
     ------------------------------------------------------------------ */
  function persistWrite(op) {
    if (!D || !D.supabase || !S.user) { queueOp(op); return; }
    var db = D.supabase;
    var chain;
    if (op.type === "insert_sim") {
      chain = db.from("simulazioni").insert(op.data).select("id");
    } else if (op.type === "update_sim") {
      chain = db.from("simulazioni").update(op.data).eq("id", op.id);
    } else if (op.type === "insert_domanda") {
      // La domanda ha bisogno dell'id della simulazione: se l'insert_sim è
      // ancora in volo (S.simId nullo), attende in memoria e parte al flush.
      if (!S.simId) {
        S.pendingDomande = S.pendingDomande || [];
        S.pendingDomande.push(op.data);
        return;
      }
      chain = db.from("simulazione_domande").insert(op.data);
    } else {
      chain = Promise.resolve({ error: null });
    }
    chain.then(function (res) {
      if (res && res.error) {
        if (isPermanentDbError(res.error)) {
          // Mai un retry infinito: la sessione resta comunque in localStorage
          // (draft), quindi nessun dato va perso per l'utente.
          if (D) D.track("sim_persist_dropped", {
            type: op.type, code: res.error.code || String(res.error.status || "")
          });
          return;
        }
        queueOp(op);
        return;
      }
      if (op.type === "insert_sim" && res && res.data && res.data[0] && res.data[0].id && !S.simId) {
        S.simId = res.data[0].id;
        S.simCreated = true;
        saveDraft();
        flushPendingDomande();
      }
    }).catch(function () { queueOp(op); });
  }

  /* Scrive le domande arrivate prima che l'id della simulazione esistesse.
     Mai bloccante: se il write fallisce vale la stessa logica di persistWrite. */
  function flushPendingDomande() {
    var q = S.pendingDomande || [];
    S.pendingDomande = [];
    q.forEach(function (data) {
      if (!S.simId || !D || !D.supabase) return;
      // La riga è stata messa in coda quando S.simId era ancora nullo:
      // la copia con l'id reale evita un insert con FK/RLS null.
      var row = Object.assign({}, data, { simulazione_id: S.simId });
      D.supabase.from("simulazione_domande").insert(row)
        .then(function (res) {
          if (res && res.error && !isPermanentDbError(res.error)) {
            queueOp({ type: "insert_domanda", data: data });
          }
        })
        .catch(function () { queueOp({ type: "insert_domanda", data: data }); });
    });
  }

  function beginSessionDb() {
    persistWrite({
      type: "insert_sim",
      data: {
        user_id: S.user.id,
        bando_id: S.bando ? (Number(S.bando.id) || null) : null,
        modalita: S.mode,
        status: "in_progress",
        started_at: new Date(S.startedAt).toISOString()
      }
    });
    if (D) D.track("sim_started", {
      bando_id: S.bando ? S.bando.id : null,
      subject_id: S.subject ? S.subject.id : null,
      mode: S.mode
    });
  }

  function updateSessionDb(fields) {
    if (!S.simId) return; // sessione locale pura, nessun id DB
    persistWrite({ type: "update_sim", id: S.simId, data: fields });
  }

  function persistAnswerLocal(q, risposta, scores, feedback, suggerimento) {
    var entry = {
      q: { id: q.id, testo: q.testo, argomento: q.argomento },
      risposta: risposta,
      scores: scores,          // {chiarezza, struttura, contenuto, lessico, pertinenza}
      feedback: feedback,
      suggerimento: suggerimento
    };
    // Le metriche vocali fanno parte della risposta: mai perse.
    if (S.voiceMetrics) entry.voice = S.voiceMetrics;
    S.answers.push(entry);
    saveDraft();
  }

  /* ------------------------------------------------------------------
     Question bank — cache 7gg + fallback LLM onesto
     ------------------------------------------------------------------ */
  function bankCacheKey() {
    if (S.bando) return K_BANK + S.bando.id;
    if (S.subject) return K_BANK + "subj-" + S.subject.id;
    return null;
  }

  function loadBankFromCache() {
    var key = bankCacheKey();
    if (!key) return null;
    var c = lsGet(key);
    if (c && c.domande && Array.isArray(c.domande) && c.domande.length) {
      if (!c.ts || (Date.now() - c.ts) < BANK_TTL) {
        return c.domande;
      }
    }
    return null;
  }

  /* Genera la bank via /api/chat (fallback onesto: la tabella question_bank
     non esiste ancora nel progetto). Non blocca mai la UI.
     Funziona in due modalità: con bando attivo (domande dal bando) oppure
     in allenamento libero (materia estratta a caso, senza bando). */
  function ensureBank() {
    if (!S.bando && !S.subject) return Promise.resolve(null);
    if (S.qBankReady || S.bankLoading) return S.bankLoading || Promise.resolve(null);

    var cached = loadBankFromCache();
    if (cached) {
      S.questions = cached;
      S.qBankReady = true;
      return Promise.resolve(cached);
    }

    // 1) Tenta la tabella reale (solo con bando: la question_bank è legata
    //    al bando; in allenamento libero si va direttamente alla LLM).
    var nativePromise = null;
    if (D && D.supabase && S.bando) {
      nativePromise = D.supabase
        .from("question_bank")
        .select("id, testo, argomento_id")
        .eq("bando_id", Number(S.bando.id))
        .limit(30)
        .then(function (res) {
          if (res && res.data && res.data.length) {
            S.questions = res.data.map(function (r) {
              return { id: r.id, testo: r.testo, argomento: "Dal bando" };
            });
            S.qBankReady = true;
            return S.questions;
          }
          return null;
        })
        .catch(function () { return null; });
    }

    // 2) Se la tabella non c'è o è vuota → generazione LLM + cache.
    var gen = bankGen;
    S.bankLoading = Promise.resolve(nativePromise).then(function (native) {
      if (native && native.length) return native;
      return generateBankViaLlm();
    }).then(function (qs) {
      if (gen !== bankGen) return null; // materia cambiata nel frattempo
      S.bankLoading = null;
      if (qs && qs.length) {
        S.questions = qs;
        S.qBankReady = true;
        lsSet(bankCacheKey(), { ts: Date.now(), domande: qs });
      }
      return qs;
    }).catch(function () {
      if (gen !== bankGen) return null;
      S.bankLoading = null;
      return null;
    });
    return S.bankLoading;
  }

  function generateBankViaLlm() {
    var n = 14; // generiamo un surplus: standard/difficile ne usano 12
    var sys;
    if (S.subject) {
      // Allenamento libero: domande sulla materia estratta a caso.
      sys = "Sei il preparatore di un candidato a un concorso pubblico italiano. " +
        "Il candidato si sta allenando sulla materia: «" + S.subject.name + "». " +
        "Argomenti di riferimento: " + S.subject.hint + ". " +
        "Genera " + n + " domande orali tipiche per un concorso pubblico su QUESTA materia. " +
        "Ogni domanda deve essere una richiesta aperta di esposizione (mai a scelta multipla), " +
        "come le farebbe una commissione, e deve restare in italiano; per la materia " +
        "«Lingua inglese» chiedi una breve conversazione o presentazione in inglese. " +
        "Rispondi SOLO con un array JSON senza markdown: " +
        '[{"testo":"Domanda?","argomento":"' + S.subject.name + '"}]';
    } else {
      var bandoName = S.bando ? (S.bando.filename || "il tuo bando") : "il tuo bando";
      sys = "Sei il preparatore di un candidato a un concorso pubblico italiano. " +
        "Il candidato ha caricato il bando: «" + bandoName + "». " +
        "Genera " + n + " domande orali tipiche per un concorso pubblico: materie giuridiche " +
        "(diritto amministrativo, costituzionale, degli enti locali, contratti pubblici, privacy, " +
        "organizzazione, trasparenza), senza inventare leggi specifiche del bando non note. " +
        "Ogni domanda deve essere una richiesta aperta di esposizione (mai a scelta multipla), " +
        "come le farebbe una commissione. Rispondi SOLO con un array JSON senza markdown: " +
        '[{"testo":"Domanda?","argomento":"Materia"}]';
    }
    return llmJson(sys, [], 8000).then(function (parsed) {
      if (!parsed || !Array.isArray(parsed)) return null;
      var out = [];
      parsed.forEach(function (item, i) {
        var t = String(item && item.testo || "").trim();
        var a = String(item && item.argomento || "Dal bando").trim();
        if (t) out.push({ id: "llm-" + (i + 1), testo: t, argomento: a });
      });
      return out.length ? out : null;
    }).catch(function () { return null; });
  }

  /* ------------------------------------------------------------------
     LLM helper — /api/chat (SSE proxy esistente)
     - llmJson: modalità bufferizzata (stream:false) → JSON parso
     - llmStream: modalità SSE (stream:true) → callback per chunk
     ------------------------------------------------------------------ */
  function llmHeaders() {
    var h = { "Content-Type": "application/json" };
    if (D && D.supabase && D.supabase.auth) {
      var sess = D.supabase.auth.getSession();
      var token = sess && sess.data && sess.data.session && sess.data.session.access_token;
      if (token) h.Authorization = "Bearer " + token;
    }
    return h;
  }

  function llmJson(sys, messages, maxTokens) {
    var msgs = [];
    if (sys) msgs.push({ role: "system", content: sys });
    (messages || []).forEach(function (m) { msgs.push(m); });
    return fetch("/api/chat", {
      method: "POST",
      headers: llmHeaders(),
      body: JSON.stringify({ messages: msgs, stream: false, max_tokens: maxTokens || 1500 })
    }).then(function (r) {
      if (!r.ok) throw new Error("http-" + r.status);
      return r.json();
    }).then(function (data) {
      var content = data && data.choices && data.choices[0] &&
        data.choices[0].message && data.choices[0].message.content;
      if (!content) throw new Error("empty");
      var cleaned = content.replace(/```json|```/g, "").trim();
      var start = cleaned.indexOf("[");
      if (start !== -1 && cleaned.indexOf("{") === -1) {
        var end = cleaned.lastIndexOf("]");
        cleaned = cleaned.slice(start, end + 1);
      }
      var startB = cleaned.indexOf("{");
      if (startB !== -1 && cleaned.indexOf("[") === -1) {
        var endB = cleaned.lastIndexOf("}");
        cleaned = cleaned.slice(startB, endB + 1);
      }
      return JSON.parse(cleaned);
    });
  }

  /* Variante testo libero (niente parse JSON): per spunti e risposte modello
     dell'aiuto "non so rispondere". Stesso proxy /api/chat, stream:false. */
  function llmText(sys, maxTokens, userMsg, signal) {
    return fetch("/api/chat", {
      method: "POST",
      headers: llmHeaders(),
      body: JSON.stringify({
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userMsg || "Scrivi la risposta." }
        ],
        stream: false,
        max_tokens: maxTokens || 700
      }),
      signal: signal || undefined
    }).then(function (r) {
      if (!r.ok) throw new Error("http-" + r.status);
      return r.json();
    }).then(function (data) {
      var content = data && data.choices && data.choices[0] &&
        data.choices[0].message && data.choices[0].message.content;
      if (!content) throw new Error("empty");
      return String(content).replace(/```/g, "").trim();
    });
  }

  /* ------------------------------------------------------------------
     Rendering delle fasi (view switching)
     ------------------------------------------------------------------ */
  var PHASES = ["boot", "gate", "setup", "briefing", "session", "report"];

  function showPhase(phase) {
    S.phase = phase;
    var target = phase === "session" ? "view-session" : "view-" + phase;
    PHASES.forEach(function (p) {
      var id = p === "session" ? "view-session" : "view-" + p;
      var el = $(id);
      if (el) el.classList.toggle("is-active", id === target);
    });
    // Focus sul contenuto per gli screen reader (il focus è gestito
    // esplicitamente per domanda e fasi, mai perso su elementi nascosti).
    var focusTarget = $("contenuto");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ------------------------------------------------------------------
     Gate
     ------------------------------------------------------------------ */
  function renderGate() {
    // Intento "Allenati" dalla dashboard: si salta il gate e si arriva
    // al setup con la CTA mirata (la materia resta un'ancora visiva).
    if (S.allenaIntent && !S.bando && !S.resumeData) {
      pickRandomSubject();
      showPhase("setup");
      renderSetup();
      return;
    }

    var rd = S.resumeData;
    // Chi ha già scelto la demo non rivive la domanda: va dritto al setup
    // con una materia a caso (mai ripetere una micro-decisione già presa).
    if (!S.bando && !rd && lsGet(K_ONBOARD) === "demo") {
      if (!S.subject) pickRandomSubject();
      showPhase("setup");
      renderSetup();
      return;
    }

    showPhase("gate");
    var title = $("gate-title");
    var text = $("gate-text");
    var actions = $("gate-actions");
    var resume = $("gate-resume");

    if (!S.bando && !rd) {
      // Micro-decisione di ingresso (onboarding round 55): un solo punto di
      // scelta, due strade spiegate in una riga ciascuna, mai un muro.
      var chosenBando = lsGet(K_ONBOARD) === "bando";
      title.textContent = "Da qui iniziamo.";
      text.textContent = chosenBando
        ? "Hai scelto di partire dal tuo bando. Caricane uno, oppure inizia subito con una materia a caso."
        : "Due strade per arrivare preparato all\u2019orale. Puoi cambiare strada quando vuoi: qui non si sbaglia.";
      actions.innerHTML =
        '<div class="gate-path is-primary" id="gate-path-demo" role="button" tabindex="0">' +
          '<span class="gate-path-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>' +
          '</span>' +
          '<span class="gate-path-main">' +
            '<span class="gate-path-name">Subito con una materia a caso</span>' +
            '<span class="gate-path-desc">Prova il format adesso, senza preparare nulla: ti assegniamo una materia da concorso.</span>' +
          '</span>' +
          '<span class="gate-path-cta">Simula ora<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>' +
        '</div>' +
        '<div class="gate-path" id="gate-path-bando" role="button" tabindex="0">' +
          '<span class="gate-path-icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.75h9.75L19.5 6.5V21.25a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V3.5A.75.75 0 0 1 6 2.75Z"/><path d="M9 14h6M9 17.5h4"/></svg>' +
          '</span>' +
          '<span class="gate-path-main">' +
            '<span class="gate-path-name">Con il tuo bando</span>' +
            '<span class="gate-path-desc">Le domande nasceranno dal PDF che carichi: il programma reale del tuo concorso.</span>' +
          '</span>' +
          '<span class="gate-path-cta">Carica il bando<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span>' +
        '</div>' +
        '<a class="btn btn-ghost btn-block" href="dashboard.html">Torna alla dashboard</a>';
      resume.classList.add("hidden");

      var demo = $("gate-path-demo");
      if (demo) {
        var goDemo = function () {
          lsSet(K_ONBOARD, "demo");
          pickRandomSubject();
          S.mode = "standard";
          if (D) D.track("sim_onboard_choice", { choice: "demo", subject: S.subject.id });
          showPhase("setup");
          renderSetup();
        };
        demo.addEventListener("click", goDemo);
        demo.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goDemo(); }
        });
      }
      var bando = $("gate-path-bando");
      if (bando) {
        var goBando = function () {
          lsSet(K_ONBOARD, "bando");
          if (D) D.track("sim_onboard_choice", { choice: "bando" });
          window.location.href = "dashboard.html#bandi";
        };
        bando.addEventListener("click", goBando);
        bando.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goBando(); }
        });
      }
      if (D) D.track("sim_gate_nobando", { onboard: lsGet(K_ONBOARD) || null });
      return;
    }

    // Bando presente: vai a setup. Se c'è una sessione da riprendere, banner nel gate.
    if (rd) {
      showPhase("gate");
      title.textContent = "Hai una sessione in corso.";
      var modeName = (MODES[rd.mode] && MODES[rd.mode].label) || rd.mode;
      var tot = (rd.questions && rd.questions.length) || 12;
      var at = Math.min((rd.idx || 0) + 1, tot);
      var interName = rd.interaction === "vocale" ? "in modalità vocale" : "in modalità scritta";
      text.textContent = "Hai interrotto «" + modeName + " · " + tot +
        " domande» alla domanda " + at + ", " + interName + ". Da dove riparti?";
      actions.innerHTML =
        '<button type="button" class="btn btn-primary btn-block" id="resume-yes">Continua ' +
          (rd.interaction === "vocale" ? "in modalità vocale" : "in modalità scritta") + '</button>' +
        '<button type="button" class="btn btn-ghost btn-block" id="resume-switch">' +
          (rd.interaction === "vocale" ? "Passa alla modalità scritta" : "Passa alla modalità vocale") + '</button>' +
        '<button type="button" class="btn btn-ghost btn-block" id="resume-new">Nuova simulazione</button>';
      resume.classList.add("hidden");
      var yes = $("resume-yes");
      if (yes) yes.addEventListener("click", function () { resumeSession(rd); });
      var sw = $("resume-switch");
      if (sw) sw.addEventListener("click", function () {
        rd.interaction = rd.interaction === "vocale" ? "scritta" : "vocale";
        resumeSession(rd);
      });
      var nw = $("resume-new");
      if (nw) nw.addEventListener("click", function () {
        clearDraft();
        S.resumeData = null;
        showPhase("setup");
        renderSetup();
        if (D) D.track("sim_gate_resume_new", {});
      });
      if (D) D.track("sim_gate_resume", { mode: rd.mode, idx: rd.idx, interaction: rd.interaction });
      return;
    }

    showPhase("setup");
    renderSetup();
  }

  /* ------------------------------------------------------------------
     Setup
     ------------------------------------------------------------------ */
  function renderSetup() {
    showPhase("setup");

    // Card bando / materia (allenamento libero)
    var icon = $("setup-bando-icon");
    var tag = $("setup-bando-tag");
    var altBando = $("setup-alt-bando");
    if (S.bando) {
      $("setup-bando-card").classList.remove("is-free");
      $("setup-bando-name").textContent = String(S.bando.filename || "Bando").replace(/\.pdf$/i, "");
      var meta = [];
      if (S.bando.total_pages) meta.push(S.bando.total_pages + " pagine");
      if (S.bando.created_at) meta.push("caricato il " + D.fmtDateShortIT(S.bando.created_at));
      meta.push("domande dal bando");
      $("setup-bando-meta").textContent = meta.join(" · ");
      $("setup-bando-change").textContent = "Cambia";
      if (tag) tag.classList.add("hidden");
      if (altBando) altBando.classList.add("hidden");
      if (icon) icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2.75h9.75L19.5 6.5V21.25a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V3.5A.75.75 0 0 1 6 2.75Z"/><path d="M9 14h6M9 17.5h4"/></svg>';
      var sub = $("setup-sub");
      if (sub) sub.textContent = "Ogni sessione è completa: domande dal tuo bando, risposta libera e correzione della commissione.";
    } else {
      // Allenamento libero: materia estratta a caso, cambiabile.
      if (!S.subject) pickRandomSubject();
      $("setup-bando-card").classList.add("is-free");
      $("setup-bando-name").textContent = S.subject.name;
      $("setup-bando-meta").textContent = "Materia da concorso, estratta a caso";
      $("setup-bando-change").textContent = "Cambia materia";
      // Via d'uscita dalla demo: chi ha scelto la materia a caso può sempre
      // passare al bando (la promessa del gate: "puoi cambiare strada quando vuoi").
      if (tag) tag.classList.remove("hidden");
      if (altBando) altBando.classList.remove("hidden");
      if (icon) icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>';
      var sub2 = $("setup-sub");
      if (sub2) sub2.textContent = "Ogni sessione è completa: domande su " + S.subject.name +
        ", risposta libera e correzione della commissione.";
    }

    // Banner "Allenati" dalla dashboard: intent dichiarato, CTA dedicata.
    var allenaZone = $("setup-dynamic");
    if (S.allenaIntent && allenaZone) {
      allenaZone.innerHTML =
        '<div class="setup-allena-hint" role="status">Allenamento mirato: le domande nascono dai punti deboli del tuo diario.</div>';
    }

    // Modalità — radiogroup
    var list = $("mode-list");
    var isPro = S.user && S.user.plan === "pro";
    list.innerHTML = Object.keys(MODES).map(function (key) {
      var m = MODES[key];
      var locked = m.pro && !isPro;
      return '<button type="button" class="mode-card" role="radio" aria-checked="' +
        (S.mode === key ? "true" : "false") + '" data-mode="' + key + '" id="mode-' + key + '">' +
        '<span class="mode-radio" aria-hidden="true"></span>' +
        '<span class="mode-main">' +
          '<span class="mode-name">' + m.label +
            (m.badge ? '<span class="mode-pro-tag">' + m.badge + "</span>" : "") +
            (m.badge ? "" : "") +
          "</span>" +
          '<span class="mode-desc">' + m.n + " domande" +
            (locked ? " · Pro" : "") +
          "</span>" +
        "</span>" +
      "</button>";
    }).join("");

    list.querySelectorAll(".mode-card").forEach(function (card) {
      card.addEventListener("click", function () {
        selectMode(card.getAttribute("data-mode"));
      });
    });

    // Tastiera radiogroup: frecce + 1/2/3
    list.addEventListener("keydown", function (e) {
      var keys = Object.keys(MODES);
      var cur = keys.indexOf(S.mode);
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = keys[(cur + 1) % keys.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = keys[(cur - 1 + keys.length) % keys.length];
      else if (e.key === "1") next = keys[0];
      else if (e.key === "2") next = keys[1];
      else if (e.key === "3") next = keys[2];
      if (next) {
        e.preventDefault();
        selectMode(next);
        var el = $("mode-" + next);
        if (el) el.focus();
      }
    });

    selectMode(S.mode, true);

    // CTA
    var start = $("setup-start");
    start.onclick = null;
    if (!S.bando && !S.subject) {
      start.disabled = true;
      start.textContent = "Carica il bando per iniziare";
      start.onclick = function () { window.location.href = "dashboard.html#bandi"; };
      return;
    }
    start.disabled = false;
    if (isQuotaExhausted()) {
      start.textContent = "Quota del mese usata — vedi le opzioni";
      start.onclick = function () { renderSpringboard(); };
    } else if (S.mode === "difficile" && !isPro) {
      start.textContent = "Difficile è un piano Pro — scopri di più";
      start.onclick = function () { renderProPreview(); };
    } else if (S.allenaIntent) {
      start.textContent = "Allenati sui punti deboli";
      start.onclick = function () { startAllenati(); };
    } else {
      start.textContent = "Inizia la simulazione →";
      start.onclick = function () { beginSession(); };
    }
  }

  function isPro() { return S.user && S.user.plan === "pro"; }
  function isQuotaExhausted() { return !isPro() && S.used >= 5; }

  function selectMode(mode, skipRender) {
    if (!MODES[mode]) return;
    // Scelta esplicita dell'utente (click/tastiera): l'intento "Allenati"
    // si azzera — chi sceglie una modalità vuole quella modalità.
    if (!skipRender) S.allenaIntent = false;
    S.mode = mode;
    document.querySelectorAll(".mode-card").forEach(function (c) {
      c.setAttribute("aria-checked", String(c.getAttribute("data-mode") === mode));
    });
    var m = MODES[mode];
    $("mode-sub-detail").textContent = m.desc;
    var note = $("mode-note");
    if (mode === "rapida") {
      note.innerHTML = "Sei in ansia? La Rapida è l'esposizione giusta per iniziare: meno posta, stesso format.";
    } else if (mode === "difficile" && !isPro()) {
      note.innerHTML = "<b>Difficile è incluso in Pro.</b> Continua con Standard, oppure scopri cosa fa.";
    } else {
      note.textContent = "Durata consigliata: ~" + (mode === "rapida" ? "15" : "20") + " minuti.";
    }
    // Anteprima Pro / springboard si aggiornano al click su Inizia, non qui.
    if (!skipRender) {
      var start = $("setup-start");
      start.disabled = !(S.bando || S.subject);
      if (isQuotaExhausted()) {
        start.textContent = "Quota del mese usata — vedi le opzioni";
        start.onclick = function () { renderSpringboard(); };
      } else if (mode === "difficile" && !isPro()) {
        start.textContent = "Difficile è un piano Pro — scopri di più";
        start.onclick = function () { renderProPreview(); };
      } else if (S.allenaIntent) {
        start.textContent = "Allenati sui punti deboli";
        start.onclick = function () { startAllenati(); };
      } else {
        start.textContent = "Inizia la simulazione →";
        start.onclick = function () { beginSession(); };
      }
    }
    if (D) D.track("sim_setup_viewed", { mode: mode });
  }










  /* ------------------------------------------------------------------
     Anteprima Pro (una sola superficie di upgrade per schermata)
     ------------------------------------------------------------------ */
  function renderProPreview() {
    var zone = $("setup-dynamic");
    zone.innerHTML =
      '<div class="pro-preview" role="region" aria-label="Piano Pro">' +
        '<p class="pro-preview-eyebrow">Piano Pro</p>' +
        "<h3>Porta l'allenamento a un altro livello.</h3>" +
        '<p class="pro-preview-sub">Il Pro non toglie un limite: aggiunge potenza all\'allenamento.</p>' +
        '<ul class="pro-preview-list">' +
          "<li>Simulazioni illimitate</li>" +
          "<li>Piano settimanale generato dal tuo bando</li>" +
          "<li>Ripasso automatico delle domande deboli</li>" +
        "</ul>" +
        '<div class="pro-preview-sample"><b>Difficile:</b> 12 domande con interruzioni e richieste di fonte, come un orale tosto. Timer per domanda nelle ultime 3.</div>' +
        '<div class="pro-preview-actions">' +
          '<a class="btn btn-primary btn-block" href="pricing.html" data-pro-cta="setup">Passa a Pro — 29€/mese</a>' +
          '<button type="button" class="btn btn-ghost btn-block" id="pro-preview-back">Continua con Standard</button>' +
        "</div>" +
      "</div>";
    var back = $("pro-preview-back");
    if (back) back.addEventListener("click", function () {
      selectMode("standard");
      zone.innerHTML = "";
    });
    if (D) D.track("sim_upgrade_click", { surface: "setup" });
    zone.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
  }

  /* ------------------------------------------------------------------
     Springboard quota 0 (mai un muro)
     ------------------------------------------------------------------ */
  function renderSpringboard() {
    var zone = $("setup-dynamic");
    zone.innerHTML =
      '<div class="springboard" role="region" aria-label="Quota del mese usata">' +
        '<p class="springboard-eyebrow">Quota del mese usata</p>' +
        "<h2>Hai completato le 5 simulazioni gratuite.</h2>" +
        '<p class="springboard-sub">Il Pro non toglie un limite: aggiunge potenza.</p>' +
        '<ul class="springboard-list">' +
          '<li><span class="sb-num">1</span>Simulazioni illimitate</li>' +
          '<li><span class="sb-num">2</span>Diario di apprendimento: la memoria che ti segue</li>' +
          '<li><span class="sb-num">3</span>Piano settimanale generato dal tuo bando</li>' +
          '<li><span class="sb-num">4</span>Ripasso automatico delle domande deboli</li>' +
        "</ul>" +
        '<div class="pro-preview-actions">' +
          '<a class="btn btn-primary btn-block" href="pricing.html" data-pro-cta="springboard">Passa a Pro — 29€/mese</a>' +
          '<a class="btn btn-ghost btn-block" href="dashboard.html">Torna alla dashboard</a>' +
        "</div>" +
        '<p class="springboard-anchor">Meno di una lezione privata (25-50€/ora). Rinnovo il ' +
        (D ? D.nextRenewalLabel() : "1° del mese") + ".</p>" +
      "</div>";
    if (D) {
      D.track("sim_quota_springboard", { has_bando: !!S.bando });
      D.track("sim_upgrade_click", { surface: "springboard" });
    }
    zone.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "nearest" });
  }

  /* ------------------------------------------------------------------
     Avvio sessione
     ------------------------------------------------------------------ */
  function beginSession() {
    if (isQuotaExhausted()) { renderSpringboard(); return; }
    if (S.mode === "difficile" && !isPro()) { renderProPreview(); return; }
    if (S.allenaIntent) { showPhase("setup"); renderSetup(); return; }
    if (!S.bando && !S.subject) { renderGate(); return; }

    // La voce della commissione parte da questa user gesture ("Inizia"):
    // sblocchiamo subito l'AudioContext, altrimenti Chrome lo terrebbe
    // sospeso e il Web Audio sarebbe muto ai turni successivi.
    if (window.Voice && Voice.unlockAudio) Voice.unlockAudio();

    // La bank è già stata precaricata a init (path critico <1s se pronta).
    // In allenamento libero la bank si genera sulla materia scelta. Il
    // briefing (2.6s, skippabile) copre il caso in cui sia ancora in
    // generazione: startSessionSoon partirà appena pronta o col fallback onesto.
    ensureBank();
    showPhase("briefing");
    runBriefing();
  }

  function startSession() {
    // Numero domande della modalità, con edge case bank piccola.
    // In modalità "ripasso" le domande sono GIÀ state selezionate dal
    // chiamante (retryWeak/retryTopic): non rifiltrarle qui.
    var wanted = S.mode === "allenati" ? ALLENATI_N : (MODES[S.mode] ? MODES[S.mode].n : 12);
    if (S.mode !== "ripasso") {
      var n = Math.min(wanted, S.questions.length);
      S.questions = S.questions.slice(0, n);
      wanted = n;
    }
    if (!S.questions.length) S.questions = fallbackQuestions();
    S.idx = 0;
    S.answers = [];
    S.simId = null;
    S.simCreated = false;
    S.pendingDomande = [];
    S.startedAt = Date.now();
    S.elapsedMs = 0;
    S.sending = false;
    S.feedbackDone = false;
    feedbackRetries = 0;
    S.helpCache = {};
    resetOralHistory();

    beginSessionDb();
    showPhase("session");
    renderQuestion();
    startTimer();
  }

  /* ------------------------------------------------------------------
     Timer cronometro (puramente informativo) + countdown Difficile
     ------------------------------------------------------------------ */
  function startTimer() {
    stopTimer();
    var last = Date.now();
    S.timerHandle = window.setInterval(function () {
      var now = Date.now();
      S.elapsedMs += now - last;
      last = now;
      $("sess-timer-value").textContent = fmtClock(S.elapsedMs);
    }, 1000);
    $("sess-timer-value").textContent = fmtClock(0);
  }

  function stopTimer() {
    if (S.timerHandle) { window.clearInterval(S.timerHandle); S.timerHandle = null; }
    if (S.countdownHandle) { window.clearInterval(S.countdownHandle); S.countdownHandle = null; }
  }

  function fmtClock(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    return String(m).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function startCountdown() {
    stopCountdown();
    var total = 90;
    var left = total;
    var el = $("sess-countdown");
    el.classList.remove("hidden");
    el.classList.remove("is-warn");
    el.textContent = fmtClock(left * 1000);
    S.countdownHandle = window.setInterval(function () {
      left -= 1;
      if (left <= 0) {
        stopCountdown();
        el.textContent = "00:00";
        var ta = $("answer-textarea");
        if (ta.value.trim()) {
          // Tempo scaduto: la risposta si invia automaticamente.
          submitAnswer(true);
        }
        return;
      }
      el.textContent = fmtClock(left * 1000);
      el.classList.toggle("is-warn", left <= 15);
      if (left <= 60) {
        el.setAttribute("aria-label", "Tempo rimasto " + left + " secondi");
      }
    }, 1000);
  }

  function stopCountdown() {
    if (S.countdownHandle) { window.clearInterval(S.countdownHandle); S.countdownHandle = null; }
    var el = $("sess-countdown");
    if (el) el.classList.add("hidden");
  }

  /* ------------------------------------------------------------------
     Palco multimodale (modalità vocale): testo e voce insieme.
     La domanda (e poi la risposta della commissione) è suddivisa in
     frasi: ognuna si accende mentre viene letta. Il testo occupa il
     suo spazio dall'inizio: zero layout shift, mai un vuoto.
     ------------------------------------------------------------------ */
  function splitText(text) {
    var parts = String(text || "").split(/(?<=[.!?;:])\s+/);
    return parts.map(function (p) { return p.trim(); }).filter(Boolean);
  }

  function renderQuestionText() {
    var qt = $("q-text");
    if (!qt) return;
    var q = S.questions[S.idx];
    if (!q) return;
    if (S.interaction === "vocale") {
      S.oralScope = "question";
      qt.innerHTML = splitText(q.testo).map(function (s) {
        return '<span class="q-sent">' + escHtml(s) + "</span> ";
      }).join("");
    } else {
      S.oralScope = null;
      qt.innerHTML = "";
      qt.appendChild(document.createTextNode("«" + q.testo + "»"));
    }
    qt.classList.remove("hidden");
  }

  function resetOralPalco() {
    var oa = $("oral-answer");
    if (oa) oa.hidden = true;
    var oat = $("oral-answer-text");
    if (oat) oat.innerHTML = "";
    S.oralScope = "question";
  }

  function applySentHighlight(containerId, idx) {
    var spans = document.querySelectorAll("#" + containerId + " .q-sent");
    for (var i = 0; i < spans.length; i++) {
      spans[i].classList.toggle("is-active", i === idx);
      spans[i].classList.toggle("is-done", i < idx);
    }
  }

  function settleSentHighlights(containerId) {
    var spans = document.querySelectorAll("#" + containerId + " .q-sent");
    for (var i = 0; i < spans.length; i++) {
      spans[i].classList.remove("is-active");
      spans[i].classList.add("is-done");
    }
  }

  /* Callback da voice.js: la frase in corso si accende mentre la
     commissione la legge (testo e voce sincronizzati). */
  function onTtsSentence(idx) {
    if (S.oralScope === "response") applySentHighlight("oral-answer-text", idx);
    else if (S.oralScope === "question") applySentHighlight("q-text", idx);
  }

  /* ------------------------------------------------------------------
     Rendering domanda corrente
     ------------------------------------------------------------------ */
  function renderQuestion() {
    if (!S.questions.length) return;
    var q = S.questions[S.idx];
    var tot = S.questions.length;

    $("sess-progress-label").textContent = "Domanda " + (S.idx + 1) + " di " + tot;
    var prog = $("sess-progress-fill");
    prog.style.width = "0%";
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        prog.style.width = Math.round(((S.idx + (S.feedbackDone ? 1 : 0)) / tot) * 100) + "%";
      });
    });
    var track = $("sess-progress-track");
    track.setAttribute("aria-valuenow", String(Math.round(((S.idx + 1) / tot) * 100)));

    var chip = $("q-chip");
    chip.textContent = q.argomento || "Dal bando";
    chip.classList.remove("hidden");
    $("q-skeleton").classList.remove("is-on");
    resetOralPalco();
    renderQuestionText();

    // Reset area risposta
    var ta = $("answer-textarea");
    ta.value = "";
    ta.disabled = false;
    $("answer-box").classList.remove("is-disabled");
    $("send-btn").disabled = true;
    $("send-btn").classList.remove("is-busy");
    $("word-count").textContent = "0 parole";
    $("volume-hint").classList.remove("is-on");
    S.sending = false;
    S.feedbackDone = false;
    feedbackRetries = 0;
    hideFeedback();
    hidePrevFeedback();
    resetHelp();
    resetVoiceForQuestion();
    applyInteractionUI();
    // Turno base del colloquio: se la commissione deve leggere la domanda,
    // speakQuestion lo sovrascrive subito con "q-speaking".
    setOral("user-turn", "Tocca a te");
    speakQuestion(q);
    ta.focus();

    if (S.mode === "difficile" && tot - S.idx <= 3) {
      startCountdown();
    } else {
      stopCountdown();
    }

    if (D) D.track("sim_question_viewed", { sim_id: S.simId, idx: S.idx });
  }

  /* ------------------------------------------------------------------
     Voce — stato per domanda + lettura della domanda da parte della
     commissione (TTS on-device). Le metriche vocali della risposta
     restano in S.voiceMetrics e diventano parte del feedback.
     ------------------------------------------------------------------ */
  function resetVoiceForQuestion() {
    S.voiceMetrics = null;
    S.voiceTtsEndAt = 0;
    S.voiceSpeaking = false;
    var m = $("voice-metrics");
    if (m) { m.classList.remove("is-on"); m.innerHTML = ""; }
    stopWaveLoop();
    cancelRecorderClose();
    closeRecorder();
    var vb = $("voice-btn");
    if (vb) {
      vb.disabled = false;
      vb.classList.remove("is-busy");
      vb.setAttribute("aria-pressed", "false");
      var lbl = $("voice-btn-label");
      if (lbl) lbl.textContent = (S.interaction === "vocale") ? "Premi e parla" : "Rispondi a voce";
    }
    if (window.Voice) { try { Voice.cancel(); } catch (_) { /* noop */ } }
  }

  /* La commissione legge la domanda ad alta voce (se la voce è attiva).
     Il timestamp di fine lettura serve a rilevare le interruzioni. */
  function speakQuestion(q) {
    if (!q || S.phase !== "session") return;
    if (!window.Voice || !Voice.ttsEnabled) return;
    S.voiceSpeaking = true;
    if (S.interaction === "vocale") {
      setOral("q-speaking", "La commissione sta parlando…");
    }
    // Niente « » in audio: puliti per la sintesi, restano a video.
    Voice.speak(q.testo).then(function () {
      S.voiceSpeaking = false;
      S.voiceTtsEndAt = performance.now();
      // Fine della lettura: ora tocca al candidato, il microfono invita.
      if (S.interaction === "vocale") setOral("user-turn", "Tocca a te");
    }).catch(function () {
      S.voiceSpeaking = false;
      if (S.interaction === "vocale") setOral("user-turn", "Tocca a te");
    });
  }

  function fmtVoiceMetrics(metrics) {
    if (!metrics) return "";
    var bits = [];
    if (metrics.timeToAnswerMs != null) {
      bits.push("risposta iniziata dopo " + Math.round(metrics.timeToAnswerMs / 1000) + "s");
    }
    if (metrics.speechMs) {
      bits.push(Math.round(metrics.speechMs / 1000) + "s di parlato");
    }
    if (metrics.pauseCount) {
      bits.push(metrics.pauseCount + (metrics.pauseCount === 1 ? " pausa" : " pause"));
    }
    if (metrics.wpm) bits.push(metrics.wpm + " parole/min");
    if (metrics.fillerCount) {
      bits.push(metrics.fillerCount + (metrics.fillerCount === 1 ? " riempitivo" : " riempitivi"));
    }
    if (metrics.interrupted) bits.push("domanda interrotta");
    return bits.join(" · ");
  }
  /* ------------------------------------------------------------------
     Invio risposta
     ------------------------------------------------------------------ */
  function submitAnswer(auto) {
    if (S.sending || S.phase !== "session") return;
    var ta = $("answer-textarea");
    var risposta = ta.value.trim();
    if (!risposta) return;

    S.sending = true;
    ta.disabled = true;
    $("answer-box").classList.add("is-disabled");
    $("help-trigger").disabled = true;
    var send = $("send-btn");
    send.classList.add("is-busy");
    send.disabled = true;

    // Hint volume non bloccante
    var words = countWords(risposta);
    var vh = $("volume-hint");
    if (words < 40) {
      vh.textContent = "Hai scritto " + words + " parole. Un orale vero vuole sostanza: prova ad argomentare di più, poi invia.";
      vh.classList.add("is-on");
    } else {
      vh.classList.remove("is-on");
    }

    clearMicAwait();
    // In modalità vocale l'attesa del feedback è una pausa naturale:
    // la commissione "riflette" prima di rispondere, mai un vuoto.
    if (S.interaction === "vocale") setOral("reflecting", "La commissione sta riflettendo…");
    showFeedbackSkeleton();
    if (D) D.track("sim_answer_sent", { sim_id: S.simId, idx: S.idx, words: words });

    var t0 = Date.now();
    requestFeedback(risposta, t0);
  }

  function countWords(text) {
    return String(text || "").trim().split(/\s+/).filter(Boolean).length;
  }

  /* Modalità: l'allenamento corregge subito (feedback immediato), la
     simulazione conduce come un orale vero (feedback solo nel report
     finale). La simulazione vocale è un colloquio, non una chat. */
  function isTraining() {
    return S.mode === "ripasso" || S.mode === "allenati";
  }

  function isVoiceSim() {
    return S.interaction === "vocale" && !isTraining();
  }

  /* ------------------------------------------------------------------
     Modalità di interazione: scritta ↔ vocale.
     Puro toggle di presentazione: cronologia, domanda e sessione non
     si toccano — si cambia solo il modo di rispondere. Per questo il
     passaggio non può mai perdere nulla.
     ------------------------------------------------------------------ */
  function setInteraction(m) {
    if (m !== "scritta" && m !== "vocale") return;
    if (m === S.interaction) { applyInteractionUI(); return; }
    S.interaction = m;
    lsSet(K_INTERACTION, m);
    // Modalità vocale = la commissione parla, per contratto: non serve
    // toccare il toggle "Voce della commissione", l'orale è sonoro.
    if (m === "vocale") ensureCommissionVoice();
    // Si cambia modalità a sessione ferma, mai a microfono aperto.
    if (window.Voice && (Voice.recording || Voice.transcribing)) Voice.cancel();
    // Post-feedback: cambiare modalità = passare avanti (mai uno stato
    // appeso, mai un feedback perso: resta nel report finale).
    if (S.phase === "session" && S.feedbackDone && !S.sending) {
      if (voiceNextTimer) { clearTimeout(voiceNextTimer); voiceNextTimer = null; }
      if (S.idx >= S.questions.length - 1) completeSession();
      else nextQuestion();
      return;
    }
    applyInteractionUI();
    // Palco coerente al volo: la domanda cambia forma e, entrando in
    // vocale a metà domanda, la commissione la legge.
    if (S.phase === "session" && S.questions[S.idx]) {
      renderQuestionText();
      if (m === "vocale") speakQuestion(S.questions[S.idx]);
    }
    if (D) D.track("sim_interaction", { mode: m });
  }

  function applyInteractionUI() {
    var box = $("answer-box");
    if (!box) return;
    var voc = S.interaction === "vocale";
    box.classList.toggle("is-voice", voc);
    var view = $("view-session");
    if (view) view.classList.toggle("is-voice", voc);
    var btScritta = $("interaction-scritta");
    var btVocale = $("interaction-vocale");
    if (btScritta) { btScritta.classList.toggle("is-on", !voc); btScritta.setAttribute("aria-pressed", String(!voc)); }
    if (btVocale) { btVocale.classList.toggle("is-on", voc); btVocale.setAttribute("aria-pressed", String(voc)); }
    var lbl = $("voice-btn-label");
    if (lbl) lbl.textContent = voc ? "Premi e parla" : "Rispondi a voce";
    var vb = $("voice-btn");
    if (vb) vb.setAttribute("aria-label", voc ? "Premi e parla per rispondere a voce" : "Rispondi a voce");
    // Simulazione vocale = colloquio: il pannello feedback non esiste
    // durante l'orale (sparisce anche dalla pagina, mai un residuo).
    document.body.classList.toggle("is-sim-voice", isVoiceSim());
    var hist = $("oral-history");
    if (hist) hist.classList.toggle("hidden", !voc || !S.answers.length);
  }

  /* ------------------------------------------------------------------
     Palco del colloquio (modalità vocale): chi parla ora è sempre chiaro.
     q-speaking → user-turn → (registrazione nel pannello) → reflecting
     → fb-speaking → user-turn / domanda successiva. Mai un vuoto.
     ------------------------------------------------------------------ */
  function setOral(state, label) {
    var el = $("oral-stage");
    var ok = S.interaction === "vocale" && S.phase === "session";
    if (!el) return;
    if (!ok) { el.classList.add("hidden"); return; }
    el.classList.remove("hidden");
    el.setAttribute("data-state", state || "user-turn");
    var lbl = $("oral-label");
    if (lbl && label) lbl.textContent = label;
    // Il microfono invita solo quando è davvero il turno del candidato.
    var vb = $("voice-btn");
    if (vb) vb.classList.toggle("is-awaiting", (state || "user-turn") === "user-turn");
  }

  function clearMicAwait() {
    var vb = $("voice-btn");
    if (vb) vb.classList.remove("is-awaiting");
  }

  /* La voce della commissione fa parte della modalità vocale: si attiva
     da sola all'ingresso, con il modello precaricato in background. */
  function ensureCommissionVoice() {
    if (!window.Voice) return;
    // In modalità vocale la commissione parla SEMPRE, per contratto della
    // modalità. Un "0" residuo (voce disattivata in passato in modalità
    // scritta) NON deve azzittare l'orale: il silenzio esplicito vale solo
    // se l'utente lo sceglie ORA dal toggle.
    Voice.setTtsEnabled(true);
    if (Voice.warmTts) Voice.warmTts();
    syncTtsToggle();
  }

  function syncTtsToggle() {
    var ttsBtn = $("voice-tts-toggle");
    if (!ttsBtn) return;
    var on = !!(window.Voice && Voice.ttsEnabled);
    ttsBtn.setAttribute("aria-pressed", on ? "true" : "false");
    var lbl = $("voice-tts-label");
    if (lbl) lbl.textContent = on ? "Voce: attiva" : "Voce della commissione";
  }

  /* ------------------------------------------------------------------
     Aiuto "Non so rispondere" — spunto o risposta modello
     Cache per tipo in S.helpCache[idx] = { spunto, risposta }: ogni
     tipo viene generato UNA volta sola per domanda. Riaprire lo stesso
     aiuto è istantaneo; chiedere l'altro tipo genera la sua richiesta
     (indipendente), mai duplicati, mai contenuti scambiati.
     ------------------------------------------------------------------ */
  function toggleHelp() {
    var panel = $("help-panel");
    var open = panel.classList.toggle("is-open");
    $("help-trigger").setAttribute("aria-expanded", String(open));
    if (open) {
      // Focus sul primo controllo utile, mai perso su elementi nascosti.
      var spunto = $("help-spunto");
      if (spunto) window.setTimeout(function () { spunto.focus({ preventScroll: true }); }, REDUCED ? 0 : 120);
    }
  }

  function closeHelp() {
    var panel = $("help-panel");
    var wasOpen = panel && panel.classList.contains("is-open");
    if (!panel) return;
    panel.classList.remove("is-open");
    $("help-trigger").setAttribute("aria-expanded", "false");
    if (wasOpen) $("help-trigger").focus({ preventScroll: true });
  }

  function resetHelp() {
    closeHelp();
    if (S.helpCtrl) { S.helpCtrl.abort(); S.helpCtrl = null; }
    S.helpBusy = false;
    var result = $("help-result");
    if (result) {
      result.hidden = true;
      result.classList.remove("is-on");
    }
    var skel = $("help-skeleton");
    if (skel) skel.classList.remove("is-on");
    var txt = $("help-result-text");
    if (txt) txt.textContent = "";
    var lbl = $("help-result-label");
    if (lbl) lbl.innerHTML = "";
    var trig = $("help-trigger");
    if (trig) trig.disabled = S.sending;
    enableHelpButtons(true);
  }

  function enableHelpButtons(enabled) {
    var s = $("help-spunto");
    var r = $("help-risposta");
    if (s) s.disabled = !enabled;
    if (r) r.disabled = !enabled;
  }

  /* Micro-interazione del click: compressione morbida e ritorno (200ms,
     easing del design system). Comunica che il click è stato ricevuto,
     senza decorare. Niente effetto con prefers-reduced-motion. */
  function pressFx(el) {
    if (REDUCED || !el) return;
    el.classList.add("is-pressing");
    window.setTimeout(function () { el.classList.remove("is-pressing"); }, 220);
  }

  /* Escape HTML sempre: il contenuto dei modelli non è mai fidato.
     niente markdown a video: il testo arriva già pulito o strutturato. */
  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* Spunto: il modello restituisce 3 righe ["etichetta: testo"].
     Le separiamo e le renderizziamo con una gerarchia tipografica vera
     (etichetta piccola + testo), mai asterischi o markdown a video. */
  function parseSpunto(text) {
    var lines = String(text || "")
      .replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "")
      .split(/\r?\n/)
      .map(function (l) { return l.trim(); })
      .filter(Boolean);
    var items = [];
    lines.forEach(function (line) {
      // "Etichetta: testo", "Etichetta — testo" oppure testo libero
      // Difesa: se arrivasse un asterisco residuo, via (mai markdown a video).
      var m = line.match(/^(.{3,40}?)[:–—-]\s+(.+)$/);
      if (m) {
        items.push({ label: m[1].trim(), text: m[2].trim().replace(/\*\*/g, "") });
      } else {
        items.push({ label: "", text: line.replace(/\*\*/g, "") });
      }
    });
    // Se il modello ha scritto un unico blocco senza etichette, lo si
    // lascia come testo semplice: mai mostrare righe vuote inutili.
    return items;
  }

  function renderSpunto(items) {
    var rows = items.map(function (it) {
      return '<div class="help-spunto-row">' +
        (it.label ? '<span class="help-spunto-label">' + escHtml(it.label) + "</span>" : "") +
        '<span class="help-spunto-text">' + escHtml(it.text) + "</span>" +
        "</div>";
    }).join("");
    return '<div class="help-spunto-list">' + rows + "</div>";
  }

  function showHelpResult(kind, text) {
    var result = $("help-result");
    result.hidden = false;
    result.classList.add("is-on");
    $("help-skeleton").classList.remove("is-on");
    var lbl = $("help-result-label");
    var isSpunto = kind === "spunto";
    var color = isSpunto ? "var(--warn)" : "var(--ok-bright)";
    var label = isSpunto ? "Uno spunto per partire" : "Risposta modello";
    lbl.innerHTML = '<span class="help-result-dot" style="background:' + color + '" aria-hidden="true"></span>' + label;
    var txt = $("help-result-text");
    if (isSpunto) {
      txt.innerHTML = renderSpunto(parseSpunto(text));
    } else {
      txt.innerHTML = escHtml(text);
    }
  }

  /* Chiede un aiuto via /api/chat: "spunto" (3 punti per ripartire) oppure
     "risposta" (modello completo da studiare). Se l'aiuto per questa
     domanda è già in cache, lo mostra subito: una sola richiesta AI.
     Mai bloccante: skeleton shimmer leggero, mai un muro; se la rete
     cade, il testo onesto lascia i bottoni attivi per riprovare. */
  function helpRequest(kind) {
    if (S.sending || S.helpBusy || S.feedbackDone || S.phase !== "session") return;
    var q = S.questions[S.idx];
    if (!q) return;

    // Aiuto già generato per QUESTO tipo di QUESTA domanda? Riusa senza
    // chiamate. La chiave è l'id della domanda (non l'indice): nei flussi
    // retry/ripresa l'indice riparte da 0 ma la domanda è un'altra, quindi
    // la cache non può mai mostrare l'aiuto della domanda sbagliata.
    var entry = S.helpCache[q.id];
    if (entry && entry[kind]) {
      showHelpResult(kind, entry[kind]);
      if (D) D.track("sim_help_cached", { kind: kind, sim_id: S.simId, idx: S.idx });
      return;
    }

    S.helpBusy = true;
    enableHelpButtons(false);
    var result = $("help-result");
    result.hidden = false;
    result.classList.add("is-on");
    $("help-skeleton").classList.add("is-on");
    var txt = $("help-result-text");
    txt.textContent = "";
    var lbl = $("help-result-label");
    lbl.innerHTML = "";

    if (S.helpCtrl) S.helpCtrl.abort();
    S.helpCtrl = new AbortController();

    var langRule = (S.subject && S.subject.id === "inglese")
      ? "Scrivi in inglese."
      : "Scrivi in italiano.";
    var sys;
    if (kind === "spunto") {
      sys = "Sei un tutor che prepara da anni candidati ai concorsi pubblici italiani. " +
        "Il candidato è bloccato su questa domanda d'orale: «" + q.testo + "». " +
        "Non scrivere la risposta completa. Dagli 3 spunti, UNO per riga, corti e concreti " +
        "(max 12 parole ciascuno): il primo indica l'angolo di attacco, il secondo un riferimento " +
        "normativo o un istituto chiave, il terzo un esempio da citare. " +
        "Ogni riga DEVE seguire questo formato esatto: «Etichetta: testo», dove l'etichetta è " +
        "Angolo di attacco, Riferimento o Esempio. " +
        "Niente introduzioni, niente frasi di contorno, niente elenchi numerati, " +
        "niente asterischi, niente markdown, niente grassetto. " + langRule;
    } else {
      sys = "Sei un commissario d'esame con anni di orali alle spalle, che sa spiegare in modo " +
        "chiaro e naturale. La domanda è: «" + q.testo + "». " +
        "Scrivi la risposta modello (180-220 parole) come la esporresti tu a voce: " +
        "apri con la risposta netta, sviluppa in 2-3 punti con i riferimenti normativi giusti, " +
        "chiudi tornando alla domanda. " +
        "Usa frasi brevi e linguaggio semplice, mai da manuale universitario: niente \"è " +
        "doveroso evidenziare\", niente incisi accademici. Il livello tecnico resta alto, " +
        "ma deve sembrare facile da seguire. Solo il testo della risposta. " + langRule;
    }

    if (D) D.track("sim_help_clicked", { kind: kind, sim_id: S.simId, idx: S.idx });
    var t0 = Date.now();
    var userMsg = kind === "spunto" ? "Dammi solo lo spunto." : "Scrivi la risposta modello.";
    llmText(sys, kind === "spunto" ? 350 : 700, userMsg, S.helpCtrl.signal)
      .then(function (text) {
        S.helpCtrl = null;
        S.helpBusy = false;
        S.helpCache[q.id] = S.helpCache[q.id] || {};
        S.helpCache[q.id][kind] = text;
        showHelpResult(kind, text);
        enableHelpButtons(true);
        if (D) D.track("sim_help_done", { kind: kind, latency_ms: Date.now() - t0 });
      })
      .catch(function (err) {
        S.helpCtrl = null;
        if (err && err.name === "AbortError") { S.helpBusy = false; return; }
        S.helpBusy = false;
        $("help-skeleton").classList.remove("is-on");
        var code = (err && err.message) || "";
        if (code === "http-401" || code === "http-403") {
          txt.textContent = "La sessione è scaduta. Riprova dopo aver riaperto l'app.";
        } else if (code === "http-429" || code === "http-402") {
          txt.textContent = "Troppe richieste in questo momento. Aspetta qualche secondo e riprova.";
        } else if (code.indexOf("http-5") !== -1) {
          txt.textContent = "Il tutor è in ritardo. Riprova tra un momento.";
        } else {
          txt.textContent = "Non è arrivato nulla. Riprova: la domanda è ancora qui.";
        }
        enableHelpButtons(true);
      });
  }

  /* ------------------------------------------------------------------
     Feedback — SSE via /api/chat (streaming con caret)
     Chiediamo al modello un JSON {chiarezza, struttura, contenuto, lessico,
     pertinenza, feedback, suggerimento} e streammamo il testo del feedback.
     ------------------------------------------------------------------ */
  function requestFeedback(risposta, t0) {
    if (S.streamCtrl) S.streamCtrl.abort();
    S.streamCtrl = new AbortController();

    var q = S.questions[S.idx];
    var ctx = "Sei un commissario di un concorso pubblico italiano. ";
    if (S.subject) ctx += "La prova è di «" + S.subject.name + "». ";
    ctx += "Stai interrogando un candidato sulla domanda: «" + q.testo + "». " +
      "Il candidato ha risposto: «" + risposta.slice(0, 4000) + "». ";
    // Il "come" conta quanto il "cosa": i dati di esposizione orale entrano
    // nella valutazione (mai persi). Solo se ci sono, mai inventati.
    if (S.voiceMetrics) {
      var vd = fmtVoiceMetrics(S.voiceMetrics);
      if (vd) {
        ctx += " Esposizione orale del candidato (dalla voce): " + vd + ". ";
        ctx += "Tienila in conto nel feedback solo se rilevante (es. troppe pause o risposta troppo lenta). ";
      }
    }
    var sys = ctx;
    // Continuità della conversazione: la commissione reagisce a ciò che
    // è appena accaduto, non a ogni domanda come se fosse la prima.
    if (S.answers.length) {
      var prevA = S.answers[S.answers.length - 1];
      sys += " Contesto della domanda precedente: «" + String(prevA.q.testo).slice(0, 200) + "». " +
        "La tua reazione è stata: «" + String(prevA.feedback || "").slice(0, 160) + "».";
    }
    // Simulazione vocale = orale vero: il feedback non esiste durante la
    // prova. Il campo "feedback" è la REAZIONE ORALE della commissione:
    // breve, parlata, mai un monologo, mai un elenco.
    if (isVoiceSim()) {
      sys += " Sei in un orale vero: il candidato NON vede punteggi né correzioni durante la prova. " +
        "Il campo \"feedback\" è ciò che dici AD ALTA VOCE: massimo 55 parole, in italiano parlato " +
        "naturale, frasi complete e scorrevoli, rivolgiti al candidato con il Lei. Reagisci a ciò che " +
        "ha appena detto citandolo una volta. Varia le formule di apertura e chiusura tra le domande " +
        "(es. \"Bene.\", \"Va bene.\", \"Procediamo.\", \"Passiamo alla prossima domanda.\"). " +
        "NON fare domande al candidato e non chiudere chiedendo se ha altro da dire: chiudi con una " +
        "transizione naturale. Il campo \"suggerimento\" resta solo per il report finale.";
    }
    sys += "Valuta con precisione su 5 dimensioni (0-10, massimo 1 decimale): chiarezza, struttura, " +
      "contenuto, lessico, pertinenza. Poi scrivi un feedback di max 90 parole in italiano " +
      "(se la materia è «Lingua inglese», scrivi il feedback in inglese): " +
      "1 frase che cita la risposta, 1-2 di correzione specifica, un suggerimento concreto. " +
      "Rispondi SOLO con JSON valido senza markdown: " +
      '{"chiarezza":7,"struttura":6,"contenuto":5,"lessico":7,"pertinenza":6,' +
      '"feedback":"testo del feedback","suggerimento":"la prossima volta prova a…"}';

    fetch("/api/chat", {
      method: "POST",
      headers: llmHeaders(),
      body: JSON.stringify({ messages: [
        { role: "system", content: sys },
        { role: "user", content: "Valuta la risposta del candidato." }
      ], stream: true, max_tokens: 900 })
    }).then(function (r) {
      if (!r.ok) throw new Error("http-" + r.status);
      return streamSse(r);
    }).then(function (json) {
      S.streamCtrl = null;
      var scores = normalizeScores(json);
      var feedback = String(json.feedback || "").trim();
      var sugg = String(json.suggerimento || "").trim();
      if (!feedback) feedback = fallbackFeedback(risposta, q);
      finishFeedback(scores, feedback, sugg, t0);
    }).catch(function (err) {
      S.streamCtrl = null;
      if (err && err.name === "AbortError") return;
      // Output malformato → correzione parziale onesta (punteggi euristici),
      // mai lasciare l'utente senza risposta (matrice errori master §13).
      var code = (err && err.message) || "";
      if (code === "no-json" || code === "empty") {
        var scores = heuristicScores(risposta);
        var feedback = fallbackFeedback(risposta, q);
        finishFeedback(scores, feedback, "Riprova la prossima domanda con una struttura più marcata.", t0);
        return;
      }
      onFeedbackError(err);
    });
  }

  function heuristicScores(risposta) {
    var words = countWords(risposta);
    var hasLaw = /art\.|legge|decreto|l\.\s?\d+/i.test(risposta);
    var opens = /^(in|secondo|il|la|gli|le|per|come|a|di)/i.test(risposta.trim());
    var closes = /\.$/.test(risposta.trim());
    var chiarezza = words >= 60 ? 7 : (words >= 30 ? 5.5 : 3.5);
    var struttura = (opens ? 2 : 0) + (closes ? 1.5 : 0) + (words >= 40 ? 2.5 : 1) + 1;
    var contenuto = (hasLaw ? 6 : 3.5) + (words >= 80 ? 2 : 0);
    return {
      chiarezza: Math.min(10, chiarezza),
      struttura: Math.min(10, struttura),
      contenuto: Math.min(10, contenuto),
      lessico: Math.min(10, chiarezza + 0.5),
      pertinenza: Math.min(10, contenuto + 0.5)
    };
  }

  /* Streaming SSE (formato OpenAI-compat passato da api/chat.js) → JSON.
     Accumula i delta e mostra il testo del feedback in streaming. */
  function streamSse(resp) {
    return new Promise(function (resolve, reject) {
      var reader = resp.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";

      function pump() {
        reader.read().then(function (r) {
          if (r.done) {
            try {
              resolve(extractJson(buffer));
            } catch (e) { reject(e); }
            return;
          }
          buffer += decoder.decode(r.value, { stream: true });
          pump();
        }).catch(reject);
      }
      pump();
    });
  }

  function extractJson(buf) {
    var cleaned = buf.replace(/^data:\s*/gm, "").split("\n").map(function (l) {
      return l.replace(/^data:\s*/, "");
    }).filter(function (l) {
      return l && l !== "[DONE]" && l.indexOf(": hb") === -1;
    }).join(" ");
    // Il proxy passa i delta OpenAI: il campo "content" di ogni delta è un
    // frammento del JSON del feedback. I contenuti possono contenere JSON
    // annidato (virgolette escaped), quindi estraiamo in modo robusto.
    var contents = [];
    var re = /"content"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
    var mm;
    while ((mm = re.exec(cleaned)) !== null) contents.push(mm[1]);
    if (contents.length) {
      // Il delta.content è il frammento di un JSON il cui testo è stato
      // serializzato dentro il payload SSE: le virgolette interne sono
      // escaped (\") e vanno ripristinate prima del parse.
      var full = contents.map(function (c) {
        return c.replace(/\\n/g, "");
      }).join("");
      full = full.replace(/\\"/g, "\"");
      full = full.replace(/\\\\/g, "\\");
      return extractJsonFromText(full);
    }
    return extractJsonFromText(cleaned);
  }

  function extractJsonFromText(text) {
    var s = text.indexOf("{");
    var e = text.lastIndexOf("}");
    if (s === -1 || e === -1 || e < s) throw new Error("no-json");
    var json = text.slice(s, e + 1);
    return JSON.parse(json);
  }

  function normalizeScores(json) {
    function n(v) {
      var x = Number(v);
      if (!isFinite(x)) return null;
      return Math.max(0, Math.min(10, x));
    }
    return {
      chiarezza: n(json.chiarezza),
      struttura: n(json.struttura),
      contenuto: n(json.contenuto),
      lessico: n(json.lessico) != null ? n(json.lessico) : n(json.chiarezza),
      pertinenza: n(json.pertinenza) != null ? n(json.pertinenza) : n(json.contenuto)
    };
  }

  function fallbackFeedback(risposta, q) {
    var words = countWords(risposta);
    var hasLaw = /art\.|legge|decreto|l\.\s?\d+/i.test(risposta);
    if (words < 40) {
      return "La risposta è troppo breve per l'orale. La commissione si aspetta argomentazione: " +
        "apri con la tesi, sviluppa con un esempio e chiudi. Cita almeno una fonte normativa.";
    }
    if (!hasLaw) {
      return "La risposta espone il ragionamento ma non cita fonti. " +
        "Aggiungi il riferimento normativo: legge, articolo, principio.";
    }
    return "Risposta strutturata e con fonti. Rafforza il passaggio finale: " +
      "chiudi riagganciando esplicitamente alla domanda della commissione.";
  }

  /* ------------------------------------------------------------------
     Fine feedback: punteggi + testo + bottone successiva
     ------------------------------------------------------------------ */
  function finishFeedback(scores, feedback, suggerimento, t0) {
    var q = S.questions[S.idx];
    persistAnswerLocal(q, $("answer-textarea").value.trim(), scores, feedback, suggerimento);
    updateSessionDb({
      clarity_score: scores.chiarezza != null ? Math.round(scores.chiarezza) : null,
      structure_score: scores.struttura != null ? Math.round(scores.struttura) : null,
      content_score: scores.contenuto != null ? Math.round(scores.contenuto) : null
    });
    persistWrite({
      type: "insert_domanda",
      data: {
        simulazione_id: S.simId,
        question_bank_id: q.id,
        risposta: $("answer-textarea").value.trim(),
        clarity: scores.chiarezza, structure: scores.struttura, content: scores.contenuto,
        lessico: scores.lessico, pertinenza: scores.pertinenza,
        feedback: feedback
      }
    });

    hideFeedbackSkeleton();
    S.lastFeedback = { scores: scores, feedback: feedback, suggerimento: suggerimento };
    // SIMULAZIONE VOCALE: niente pannello feedback durante l'orale. La
    // commissione risponde nel palco — a voce e a video — e il colloquio
    // prosegue da solo. I punteggi restano salvati per il report finale.
    if (isVoiceSim()) {
      renderOralResponse(feedback, suggerimento, t0);
      return;
    }
    var content = $("feedback-content");
    content.classList.add("is-on");
    renderMetrics(scores);
    renderPrevFeedback();

    // Testo con typewriter e caret. Batch di parole via rAF: un solo
    // reflow per frame invece di un setTimeout per parola (meno lavoro
    // per il browser, animazione più fluida).
    var fbEl = $("feedback-text");
    fbEl.classList.add("is-streaming");
    fbEl.textContent = "";
    var words = feedback.split(/(\s+)/);
    var i = 0;
    var batch = Math.max(2, Math.min(5, Math.round(words.length / 40)));
    var finish = function () {
      fbEl.classList.remove("is-streaming");
      var suggEl = $("feedback-suggestion");
      if (suggerimento) {
        suggEl.textContent = suggerimento;
        suggEl.classList.add("is-on");
      }
      S.feedbackDone = true;
      S.sending = false;
      $("help-trigger").disabled = false;
      if (S.interaction === "vocale") appendOralHistory(q, $("answer-textarea").value.trim());
      showFbListen(feedback, suggerimento);
      if (D) D.track("sim_feedback_received", {
        sim_id: S.simId, idx: S.idx,
        latency_ms: Date.now() - t0, scores: scores
      });
      scheduleNext();
      speakFeedbackTurn(feedback, suggerimento);
    };
    // prefers-reduced-motion: testo intero in un colpo, nessun loop.
    if (REDUCED) {
      fbEl.textContent = feedback;
      finish();
      return;
    }
    function type() {
      if (i >= words.length) { finish(); return; }
      var end = Math.min(i + batch, words.length);
      for (; i < end; i += 1) fbEl.textContent += words[i];
      window.requestAnimationFrame(type);
    }
    type();
  }

  /* SIMULAZIONE VOCALE — la commissione risponde nel palco. Il testo
     (reazione orale) appare per frasi, sincronizzato con la voce.
     Niente punteggi, niente pannello: solo la conversazione. */
  function renderOralResponse(feedback, suggerimento, t0) {
    // lastFeedback con i punteggi reali è già stato salvato da
    // finishFeedback (i punteggi restano per il report, mai null).
    S.feedbackDone = true;
    S.sending = false;
    $("help-trigger").disabled = false;
    appendOralHistory(S.questions[S.idx], $("answer-textarea").value.trim());
    var oa = $("oral-answer");
    if (oa) {
      oa.hidden = false;
      S.oralScope = "response";
      var oat = $("oral-answer-text");
      oat.innerHTML = splitText(feedback).map(function (s) {
        return '<span class="q-sent">' + escHtml(s) + "</span> ";
      }).join("");
      // La prima frase subito visibile (mai un vuoto), le altre si
      // accendono mentre vengono lette.
      applySentHighlight("oral-answer-text", 0);
    }
    if (D) D.track("sim_feedback_received", {
      sim_id: S.simId, idx: S.idx, latency_ms: Date.now() - (t0 || Date.now()), oral: true
    });
    speakOralTurn(feedback, S.idx);
  }

  /* La commissione prende il turno, a voce; a lettura finita il
     colloquio prosegue da solo dopo una pausa naturale. */
  function speakOralTurn(text, qAt) {
    if (S.interaction !== "vocale") return;
    if (!window.Voice || !Voice.ttsEnabled) {
      setOral("user-turn", "Tocca a te");
      scheduleOralNext(qAt);
      return;
    }
    setOral("fb-speaking", "La commissione risponde…");
    Voice.speak(text).then(function () {
      if (S.phase !== "session" || S.idx !== qAt) return;
      setOral("user-turn", "Tocca a te");
      scheduleOralNext(qAt);
    }).catch(function () {
      if (S.phase !== "session" || S.idx !== qAt) return;
      setOral("user-turn", "Tocca a te");
      // Mai un blocco: anche se la voce fallisce, il colloquio avanza.
      scheduleOralNext(qAt);
    });
  }

  function scheduleOralNext(qAt) {
    if (voiceNextTimer) clearTimeout(voiceNextTimer);
    voiceNextTimer = window.setTimeout(function () {
      voiceNextTimer = null;
      if (S.phase !== "session" || S.sending || S.idx !== qAt) return;
      if (S.idx >= S.questions.length - 1) completeSession();
      else nextQuestion();
    }, ORAL_NEXT_DELAY);
  }

  /* Cronologia del colloquio (modalità vocale): compatta e secondaria.
     Ogni scambio è una riga espandibile, mai bubble di chat. */
  function truncateText(t, n) {
    var s = String(t || "");
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  function appendOralHistory(q, risposta) {
    var hist = $("oral-history");
    if (!hist) return;
    hist.classList.remove("hidden");
    var n = S.answers.length;
    var el = document.createElement("details");
    el.className = "oral-ex";
    el.innerHTML = "<summary><span class=\"oral-ex-n\">" + n + "</span>" +
      escHtml(truncateText(q.testo, 90)) + "</summary>" +
      '<div class="oral-ex-body"><p class="oral-ex-q">' + escHtml(q.testo) + "</p>" +
      '<p class="oral-ex-a">' + escHtml(risposta || "—") + "</p></div>";
    hist.appendChild(el);
    // Solo le ultime righe: la cronologia non deve mai dominare. Il
    // titolo non viene mai contato né rimosso (query mirata sui details).
    while (hist.querySelectorAll("details.oral-ex").length > 6) {
      var firstEx = hist.querySelector("details.oral-ex");
      if (!firstEx) break;
      hist.removeChild(firstEx);
    }
  }

  function resetOralHistory() {
    var hist = $("oral-history");
    if (hist) { hist.innerHTML = ""; hist.classList.add("hidden"); }
    var oa = $("oral-answer");
    if (oa) oa.hidden = true;
    S.oralScope = "question";
  }

  /* La commissione risponde a voce (solo modalità vocale): parla il
     feedback, poi — dopo una pausa naturale — il colloquio va avanti
     da solo. In modalità scritta resta tutto manuale. */
  function speakFeedbackTurn(feedback, suggerimento) {
    if (S.interaction !== "vocale") return;
    if (!window.Voice || !Voice.ttsEnabled) { setOral("user-turn", "Tocca a te"); return; }
    setOral("fb-speaking", "La commissione risponde…");
    var spoken = feedback + (suggerimento ? " Suggerimento: " + suggerimento : "");
    var qAt = S.idx;
    Voice.speak(spoken).then(function () {
      if (S.phase !== "session" || S.idx !== qAt) return;
      setOral("user-turn", "Tocca a te");
      // Pausa naturale, poi la domanda successiva (o il risultato finale).
      if (voiceNextTimer) clearTimeout(voiceNextTimer);
      voiceNextTimer = window.setTimeout(function () {
        voiceNextTimer = null;
        if (S.phase !== "session" || S.sending || S.idx !== qAt) return;
        if (S.idx >= S.questions.length - 1) { completeSession(); return; }
        nextQuestion();
      }, 1400);
    }).catch(function () {
      setOral("user-turn", "Tocca a te");
    });
  }

  function scheduleNext() {
    var btn = $("next-btn");
    var isLast = S.idx >= S.questions.length - 1;
    btn.textContent = isLast ? "Vedi il risultato →" : "Domanda successiva →";
    // Compare dopo 2.5s (tempo di lettura del feedback = parte del valore)
    window.setTimeout(function () {
      if (S.phase !== "session") return;
      btn.classList.add("is-on");
      btn.onclick = function () {
        if (isLast) { completeSession(); }
        else { nextQuestion(); }
      };
      btn.focus({ preventScroll: true });
    }, 2500);
  }

  function nextQuestion() {
    if (voiceNextTimer) { clearTimeout(voiceNextTimer); voiceNextTimer = null; }
    hidePrevFeedback();
    if (window.Voice && (Voice.recording || Voice.transcribing)) Voice.cancel();
    S.idx += 1;
    renderQuestion();
  }

  /* ------------------------------------------------------------------
     Metriche (3 + 2 avanzate)
     ------------------------------------------------------------------ */
  var METRIC_LABELS = [
    ["chiarezza", "Chiarezza"],
    ["struttura", "Struttura"],
    ["contenuto", "Contenuto"],
    ["lessico", "Lessico"],
    ["pertinenza", "Pertinenza"]
  ];

  function renderMetrics(scores) {
    var main = $("metrics-main");
    main.innerHTML = METRIC_LABELS.slice(0, 3).map(function (pair) {
      return metricRow(pair[0], pair[1], scores[pair[0]]);
    }).join("");
    var extra = $("metrics-extra");
    extra.innerHTML = METRIC_LABELS.slice(3).map(function (pair) {
      return metricRow(pair[0], pair[1], scores[pair[0]]);
    }).join("");
    animateMetrics(main);
  }

  function metricRow(key, label, val) {
    var v = val != null ? val : 0;
    var cls = v >= 7 ? "is-ok" : (v >= 5 ? "is-warn" : "");
    return '<div class="metric">' +
      '<span class="metric-label">' + label + "</span>" +
      '<span class="metric-num" id="mnum-' + key + '">0</span>' +
      '<span class="metric-track"><span class="metric-fill ' + cls + '" id="mfill-' + key + '" style="width:0%"></span></span>' +
      "</div>";
  }

  function animateMetrics(scope) {
    window.setTimeout(function () {
      METRIC_LABELS.forEach(function (pair) {
        var key = pair[0];
        var num = $(scope ? "mnum-" + key : "mnum-" + key);
        var fill = $(scope ? "mfill-" + key : "mfill-" + key);
        if (!num || !fill) return;
        // valore già salvato in answers (ultimo)
        var last = S.answers.length ? S.answers[S.answers.length - 1].scores : null;
        var v = last ? last[key] : 0;
        num.textContent = (v != null ? v : 0).toLocaleString("it-IT", { maximumFractionDigits: 1 });
        fill.style.width = (v != null ? v : 0) * 10 + "%";
      });
    }, 60);
  }

  function hideFeedback() {
    $("feedback-skeleton").classList.remove("is-on");
    $("feedback-content").classList.remove("is-on");
    $("feedback-error").classList.remove("is-on");
    $("next-btn").classList.remove("is-on");
    $("feedback-text").classList.remove("is-streaming");
    $("feedback-suggestion").classList.remove("is-on");
    $("metrics-extra").classList.remove("is-open");
  }

  function showFeedbackSkeleton() {
    $("feedback-skeleton").classList.add("is-on");
    $("feedback-content").classList.remove("is-on");
    $("feedback-error").classList.remove("is-on");
  }

  function hideFeedbackSkeleton() {
    $("feedback-skeleton").classList.remove("is-on");
    var fl = $("fb-listen");
    if (fl) fl.hidden = true;
  }

  /* Feedback ascoltabile: mostra il pulsante "Ascolta" e, se la voce
     della commissione è attiva, legge il feedback ad alta voce. */
  function showFbListen(fbText, sugg) {
    var btn = $("fb-listen");
    if (!btn) return;
    btn.hidden = false;
    btn.classList.remove("is-playing");
    if (!window.Voice || !Voice.ttsEnabled || !fbText) return;
    Voice.speak(fbText + (sugg ? " Suggerimento: " + sugg : ""));
  }


  /* ------------------------------------------------------------------
     Errore feedback — mai un vicolo cieco
     ------------------------------------------------------------------ */
  var feedbackRetries = 0;

  function onFeedbackError(err) {
    // In vocale l'errore non blocca il colloquio: si torna al microfono.
    if (S.interaction === "vocale") setOral("user-turn", "Tocca a te");
    // Simulazione vocale: niente pannello errore da "app". La commissione
    // resta nel colloquio: l'utente riprova parlando. La risposta non si
    // perde mai (draft + coda locale).
    if (isVoiceSim()) {
      S.sending = false;
      var ta0 = $("answer-textarea");
      ta0.disabled = false;
      $("answer-box").classList.remove("is-disabled");
      var snd0 = $("send-btn");
      snd0.classList.remove("is-busy");
      snd0.disabled = !ta0.value.trim();
      $("help-trigger").disabled = false;
      setOral("user-turn", "Tocca a te");
      if (D && D.toast) D.toast("La connessione è caduta: riprova parlando di nuovo.");
      return;
    }
    feedbackRetries += 1;
    hideFeedbackSkeleton();
    $("feedback-content").classList.remove("is-on");
    var box = $("feedback-error");
    var code = (err && err.message) || "";
    var text = "La connessione è caduta. La tua risposta è al sicuro: riprova.";
    var authError = false;
    if (code.indexOf("http-401") !== -1 || code.indexOf("http-403") !== -1) {
      authError = true;
      text = "La sessione è scaduta. La tua risposta è al sicuro: accedi di nuovo e riprendi.";
    } else if (code.indexOf("http-429") !== -1 || code.indexOf("http-402") !== -1) {
      text = "Non riusciamo a verificare la quota. Riprova.";
    } else if (code.indexOf("http-5") !== -1 || code.indexOf("http-502") !== -1 ||
               code.indexOf("http-503") !== -1 || code.indexOf("http-504") !== -1) {
      text = "Il commissario è in ritardo. Riprova tra un momento.";
    } else if (code === "no-json" || code === "empty") {
      text = "La correzione è arrivata incompleta. Riprova.";
    }
    $("feedback-error-text").textContent = text;
    box.classList.add("is-on");

    var retry = $("feedback-retry");
    retry.onclick = null;
    if (authError) {
      // Sessione scaduta: un retry non basta, serve rientrare. Il draft
      // locale preserva la risposta, quindi il re-login non perde nulla.
      retry.textContent = "Accedi di nuovo";
      retry.onclick = function () {
        saveDraft();
        window.location.href = "auth.html?mode=login&next=simulation.html";
      };
    } else if (feedbackRetries >= 3) {
      retry.textContent = "Salva e riprendi";
      retry.onclick = function () { openPause(); };
    } else {
      retry.textContent = "Riprova";
      retry.onclick = function () {
        box.classList.remove("is-on");
        submitAnswer(false);
      };
    }

    // Riabilita l'area risposta: la risposta NON si perde mai
    var ta = $("answer-textarea");
    ta.disabled = false;
    $("answer-box").classList.remove("is-disabled");
    var send = $("send-btn");
    send.classList.remove("is-busy");
    send.disabled = !ta.value.trim();
    $("help-trigger").disabled = false;
    S.sending = false;
  }

  /* ------------------------------------------------------------------
     Accordion feedback precedente
     ------------------------------------------------------------------ */
  function renderPrevFeedback() {
    if (S.answers.length < 2) { hidePrevFeedback(); return; }
    var prev = S.answers[S.answers.length - 2];
    var box = $("prev-feedback");
    box.classList.remove("hidden");
    $("prev-feedback-label").textContent = "Feedback domanda " + (S.answers.length - 1) + " · " +
      (prev.scores && prev.scores.contenuto != null
        ? prev.scores.contenuto.toLocaleString("it-IT", { maximumFractionDigits: 1 })
        : "—");
    var inner = $("prev-feedback-inner");
    var sc = prev.scores || {};
    var chips = METRIC_LABELS.map(function (pair) {
      return '<span class="pf-metric">' + pair[1] + " <b>" +
        ((sc[pair[0]] != null ? sc[pair[0]] : 0).toLocaleString("it-IT", { maximumFractionDigits: 1 })) +
        "</b></span>";
    }).join("");
    inner.innerHTML = '<div class="pf-metrics">' + chips + "</div>" +
      "<p>" + (D ? D.escapeHtml(prev.feedback || "") : (prev.feedback || "")) + "</p>";
  }

  function hidePrevFeedback() {
    var box = $("prev-feedback");
    box.classList.add("hidden");
  }

  /* ------------------------------------------------------------------
     Pausa / ripresa / termina
     ------------------------------------------------------------------ */
  function openPause() {
    if (S.phase !== "session") return;
    S.phase = "paused";
    stopTimer();
    stopCountdown();
    if (window.Voice && (Voice.recording || Voice.transcribing)) Voice.cancel();
    saveDraft();
    if (D) D.track("sim_paused", { sim_id: S.simId });
    var overlay = $("pause-overlay");
    overlay.classList.add("is-on");
    // Il palco del colloquio non deve restare appeso dietro la pausa.
    var os = $("oral-stage");
    if (os) os.classList.add("hidden");
    var tot = S.questions.length;
    $("pause-meta").textContent = "«" + (MODES[S.mode] ? MODES[S.mode].label : S.mode) +
      " · " + tot + " domande» · domanda " + (S.idx + 1) + " di " + tot +
      " · " + fmtClock(S.elapsedMs);
    $("pause-resume").focus();
  }

  function closePause() {
    $("pause-overlay").classList.remove("is-on");
    if (S.phase === "paused") S.phase = "session";
    startTimer();
    // Simulazione vocale: se la pausa ha consumato la finestra di
    // avanzamento, il colloquio riprende da dove era. In vocale non
    // esiste il bottone "avanti": senza questo, un blocco. Mai.
    if (isVoiceSim() && S.feedbackDone && !S.sending) scheduleOralNext(S.idx);
    if (D) D.track("sim_resumed", { sim_id: S.simId });
  }

  function saveAndExit() {
    $("pause-overlay").classList.remove("is-on");
    stopTimer();
    stopCountdown();
    saveDraft();
    // La sessione resta in_progress nel DB; il gate la ripropone.
    window.location.href = "dashboard.html";
  }

  function terminateSession() {
    if (window.Voice) Voice.cancel();
    var html = "<h2>Vuoi terminare?</h2>" +
      "<p>Le risposte già date restano nello storico.</p>" +
      '<div class="modal-actions">' +
      '<button type="button" class="btn btn-primary" data-close>Continua</button>' +
      '<button type="button" class="btn btn-danger" id="term-confirm">Termina</button>' +
      "</div>";
    var closeFn = D ? D.openModal(html) : function () {};
    var btn = $("term-confirm");
    if (btn) btn.addEventListener("click", function () {
      completeSession(true);
      if (closeFn) closeFn();
    });
  }

  /* ------------------------------------------------------------------
     Completamento sessione → report
     ------------------------------------------------------------------ */
  function completeSession(abandoned) {
    if (voiceNextTimer) { clearTimeout(voiceNextTimer); voiceNextTimer = null; }
    stopTimer();
    stopCountdown();
    if (window.Voice) Voice.cancel();
    $("pause-overlay").classList.remove("is-on");
    // La sessione si chiude sempre (anche se abbandonata): le risposte già
    // date restano nello storico, mai un blocco orfano in_progress.
    updateSessionDb({
      status: "completata",
      voto_finale: Math.round(averageVoto() * 10) / 10,
      ended_at: new Date().toISOString(),
      durata_minuti: Math.max(1, Math.round(S.elapsedMs / 60000))
    });
    clearDraft();
    if (D) D.track(abandoned ? "sim_abandoned" : "sim_completed", {
      sim_id: S.simId, voto: averageVoto(), duration_min: Math.round(S.elapsedMs / 60000)
    });
    // Memoria di apprendimento: aggiornamento in background, mai blocca il report.
    updateMemoryAfterSession();
    renderReport();
  }

  function averageVoto() {
    var scored = S.answers.filter(function (a) { return a.scores; });
    if (!scored.length) return 0;
    var sum = 0;
    var count = 0;
    scored.forEach(function (a) {
      ["chiarezza", "struttura", "contenuto"].forEach(function (k) {
        if (a.scores[k] != null) { sum += a.scores[k]; count += 1; }
      });
    });
    return count ? sum / count : 0;
  }

  /* ------------------------------------------------------------------
     Report — peak-end rule
     ------------------------------------------------------------------ */
  function renderReport() {
    showPhase("report");
    var voto = averageVoto();
    var wrap = $("report-wrap");
    var durata = Math.max(1, Math.round(S.elapsedMs / 60000));
    var modeLabel = (MODES[S.mode] && MODES[S.mode].label) || (S.mode === "allenati" ? "Allenamento mirato" : "Ripasso");
    var etaLabel = voto < 6 ? "Da lavorare" : (voto < 8 ? "Solido" : "Forte");
    var avg3 = avgDimension("chiarezza", "struttura", "contenuto");

    // Confronto SOLO con il proprio storico (mai norme inventate, master §5.10)
    var compare = null;
    if (S.historyAvg != null) {
      compare = Math.round((voto - S.historyAvg) * 10) / 10;
    }

    var punti = buildPuntiForza();
    var deboli = buildDaLavorare();
    var topics = buildArgomentiDeboli();

    var html = "";
    html += '<p class="report-eyebrow">Simulazione completata · ' + modeLabel + " · " + durata + " min</p>";
    html += '<h1 class="report-h1">Hai chiuso la sessione con ' + fmtVoto(voto) + ".</h1>";
    html += '<p class="report-sub">' + reportSub(voto, avg3) + "</p>";

    // Gauge
    var stroke = 377 * (1 - voto / 10);
    var gcls = voto >= 7 ? "is-ok" : (voto >= 5 ? "is-warn" : "");
    html += '<div class="gauge-row">' +
      '<div class="gauge-wrap" role="img" aria-label="Voto medio ' + fmtVoto(voto) + " su 10\">" +
        '<svg viewBox="0 0 140 140" aria-hidden="true">' +
          '<circle class="gauge-bg" cx="70" cy="70" r="60"></circle>' +
          '<circle class="gauge-fill ' + gcls + '" cx="70" cy="70" r="60"></circle>' +
        "</svg>" +
        '<div class="gauge-num"><span id="gauge-num-val">0</span><small>su 10</small></div>' +
      "</div>" +
      '<div class="gauge-side">' +
        '<div class="gauge-label">' + etaLabel + "</div>" +
        '<p class="gauge-note">Media delle tre dimensioni principali: chiarezza, struttura, contenuto.</p>' +
        (compare != null
          ? '<span class="gauge-badge ' + (compare >= 0 ? "" : "is-neutral") + '">' +
            (compare >= 0 ? "+" : "") + fmtVoto(Math.abs(compare)) + " vs la tua media</span>"
          : "") +
      "</div>" +
    "</div>";

    // Dimensioni
    html += '<div class="report-metrics">' +
      METRIC_LABELS.slice(0, 3).map(function (pair) {
        var v = avgDimension(pair[0]);
        var cls = v >= 7 ? "is-ok" : (v >= 5 ? "is-warn" : "");
        return '<div class="rm-row">' +
          '<span class="rm-label">' + pair[1] + "</span>" +
          '<span class="rm-track"><span class="rm-fill ' + cls + '" id="rm-' + pair[0] + '" style="width:0%"></span></span>' +
          '<span class="rm-num" id="rmn-' + pair[0] + '">' + fmtVoto(v) + "</span>" +
        "</div>";
      }).join("") +
    "</div>";

    // Punti forti / da lavorare
    if (punti.length) {
      html += '<div class="report-card"><h3>I tuoi punti forti</h3><ul>' +
        punti.map(function (p) {
          return '<li><span class="dot is-ok"></span>' + D.escapeHtml(p.text) +
            ' <span class="tag">' + D.escapeHtml(p.tag) + "</span></li>";
        }).join("") + "</ul></div>";
    }
    if (deboli.length) {
      html += '<div class="report-card"><h3>Da lavorare</h3><ul>' +
        deboli.map(function (p) {
          return '<li><span class="dot is-warn"></span>' + D.escapeHtml(p.text) +
            ' <span class="tag">' + D.escapeHtml(p.tag) + "</span></li>";
        }).join("") + "</ul></div>";
    }

    // Argomenti deboli
    if (topics.length) {
      html += '<div class="report-card"><h3>Ripassa questi argomenti</h3>' +
        topics.map(function (t) {
          return '<div class="topic-row">' +
            '<div><div class="topic-name">' + D.escapeHtml(t.argomento) + "</div>" +
            '<div class="topic-meta">media ' + fmtVoto(t.media) + "</div></div>" +
            '<button type="button" class="btn btn-soft" data-ripassa="' + D.escapeHtml(t.argomento) + '">Rifai</button>' +
          "</div>";
        }).join("") + "</div>";
    }

    // Rivedi le domande
    html += '<div class="report-card"><h3>Rivedi le domande</h3><div class="review-list">' +
      S.answers.map(function (a, i) {
        var v = a.scores && a.scores.contenuto != null ? a.scores.contenuto : 0;
        return '<div class="review-item">' +
          '<button type="button" class="review-toggle" aria-expanded="false" data-rev="' + i + '">' +
            '<span class="rev-q">' + (i + 1) + ". " + D.escapeHtml(a.q.testo) + "</span>" +
            '<span class="rev-score">' + fmtVoto(v) + "</span>" +
            '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' +
          "</button>" +
          '<div class="review-panel" data-rev-panel="' + i + '">' +
            '<div class="review-inner">' +
              '<div class="rev-block"><span class="rev-label">La tua risposta</span>' +
                D.escapeHtml(a.risposta || "—") + "</div>" +
              '<div class="rev-block"><span class="rev-label">Feedback</span>' +
                D.escapeHtml(a.feedback || "—") + "</div>" +
            "</div>" +
          "</div>" +
        "</div>";
      }).join("") + "</div></div>";

    // CTA — "Allenati" è l'azione principale: chiude i buchi del diario.
    var hasWeak = deboli.length > 0;
    html += '<div class="report-actions">' +
      '<button type="button" class="btn btn-primary btn-lg btn-block" id="report-allena">Allenati sui punti deboli</button>' +
      (hasWeak
        ? '<button type="button" class="btn btn-soft btn-lg btn-block" id="report-retry-weak">Rifai questa sessione</button>'
        : '') +
      '<button type="button" class="btn btn-ghost btn-lg btn-block" id="report-new2">Nuova simulazione</button>' +
      (isPro()
        ? '<button type="button" class="btn btn-soft btn-lg btn-block" id="report-piano">Piano settimanale</button>'
        : '<div class="report-teaser"><h3>Il piano settimanale.</h3>' +
          '<p>Un piano di allenamento generato dal tuo bando, con ripasso automatico delle domande deboli. ' +
          "Il trend di questa sessione è il primo punto che il piano sfrutta.</p>" +
          '<a class="btn btn-primary btn-block" href="pricing.html" data-pro-cta="report">Passa a Pro — 29€/mese</a></div>') +
    "</div>";

    wrap.innerHTML = html;

    // Animazioni report
    animateGauge(voto);
    window.setTimeout(function () {
      METRIC_LABELS.slice(0, 3).forEach(function (pair) {
        var fill = $("rm-" + pair[0]);
        if (fill) fill.style.width = avgDimension(pair[0]) * 10 + "%";
      });
    }, 200);

    // Accordion rivedi domande
    wrap.querySelectorAll(".review-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = btn.getAttribute("data-rev");
        var panel = wrap.querySelector('[data-rev-panel="' + i + '"]');
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.classList.toggle("is-open", !open);
      });
    });

    // CTA
    var allenaBtn = $("report-allena");
    if (allenaBtn) allenaBtn.addEventListener("click", function () { startAllenati(); });
    var weakBtn = $("report-retry-weak");
    if (weakBtn) weakBtn.addEventListener("click", function () { retryWeak(); });
    var newBtn = $("report-new");
    if (newBtn) newBtn.addEventListener("click", function () { newSimulation(); });
    var new2 = $("report-new2");
    if (new2) new2.addEventListener("click", function () { newSimulation(); });
    var piano = $("report-piano");
    if (piano) piano.addEventListener("click", function () { window.location.href = "dashboard.html#piano"; });
    wrap.querySelectorAll("[data-ripassa]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        retryTopic(btn.getAttribute("data-ripassa"));
      });
    });

    if (D) D.track("sim_report_action", { action: "viewed" });
  }

  function fmtVoto(v) {
    var n = Number(v);
    if (!isFinite(n)) return "—";
    return n.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function avgDimension() {
    var keys = Array.prototype.slice.call(arguments);
    var sum = 0, count = 0;
    S.answers.forEach(function (a) {
      if (!a.scores) return;
      keys.forEach(function (k) {
        if (a.scores[k] != null) { sum += a.scores[k]; count += 1; }
      });
    });
    return count ? sum / count : 0;
  }

  function buildPuntiForza() {
    var out = [];
    var chi = avgDimension("chiarezza");
    var str = avgDimension("struttura");
    if (chi >= 6) out.push({ text: "Rispondere con chiarezza espositiva", tag: "Chiarezza" });
    if (str >= 6) out.push({ text: "Strutturare la risposta con apertura e chiusura", tag: "Struttura" });
    return out.slice(0, 2);
  }

  function buildDaLavorare() {
    var out = [];
    var con = avgDimension("contenuto");
    var chi = avgDimension("chiarezza");
    if (con < 6) out.push({ text: "Citare le fonti normative e approfondire il contenuto", tag: "Contenuto" });
    if (chi < 6) out.push({ text: "Rendere la risposta più diretta e meno dispersiva", tag: "Chiarezza" });
    return out.slice(0, 2);
  }

  function buildArgomentiDeboli() {
    var byTopic = {};
    S.answers.forEach(function (a) {
      if (!a.scores) return;
      var key = a.q.argomento || "Dal bando";
      if (!byTopic[key]) byTopic[key] = { sum: 0, count: 0 };
      byTopic[key].sum += a.scores.contenuto != null ? a.scores.contenuto : 0;
      byTopic[key].count += 1;
    });
    return Object.keys(byTopic).map(function (k) {
      return { argomento: k, media: byTopic[k].sum / byTopic[k].count };
    }).filter(function (t) { return t.media < 6; })
      .sort(function (a, b) { return a.media - b.media; }).slice(0, 2);
  }

  function reportSub(voto, avg3) {
    if (avg3 == null) return "Ogni risposta ha ricevuto una correzione. Rivedi le domande qui sotto.";
    if (voto >= 7) return "Un esito solido. I punti forti li trovi qui sotto, e la prossima volta prova a citare le fonti prima.";
    if (voto >= 5) return "Sei sulla strada giusta. Concentrati sulle aree segnalate e la prossima sessione andrà meglio.";
    return "Oggi il materiale non è uscito bene. È normale: la simulazione serve proprio a questo. Riparti dalle aree segnalate.";
  }

  function animateGauge(voto) {
    var num = $("gauge-num-val");
    var fill = document.querySelector(".gauge-fill");
    if (REDUCED) {
      num.textContent = fmtVoto(voto);
      if (fill) fill.style.strokeDashoffset = String(377 * (1 - voto / 10));
      return;
    }
    // count-up
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / 600);
      var eased = 1 - Math.pow(1 - p, 3);
      num.textContent = fmtVoto(voto * eased);
      if (fill) fill.style.strokeDashoffset = String(377 * (1 - (voto / 10) * eased));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------------
     Azioni report
     ------------------------------------------------------------------ */
  function newSimulation() {
    S.answers = [];
    S.questions = [];
    S.qBankReady = false;
    S.simId = null;
    S.simCreated = false;
    S.resumeData = null;
    resetOralHistory();
    S.mode = "standard";
    if (S.bando) S.subject = null;
    showPhase("setup");
    renderSetup();
    ensureBank();
    if (D) D.track("sim_report_action", { action: "new" });
  }

  function retryWeak() {
    // Nuova sessione con le domande deboli (voto <6 su una dimensione)
    var weak = S.answers.map(function (a, i) {
      return { a: a, i: i };
    }).filter(function (x) {
      return x.a.scores && (x.a.scores.chiarezza < 6 || x.a.scores.struttura < 6 || x.a.scores.contenuto < 6);
    });
    if (!weak.length) {
      if (D) D.toast("Nessuna domanda sotto la soglia in questa sessione.");
      return;
    }
    S.mode = "ripasso";
    S.questions = weak.map(function (x) { return x.a.q; });
    S.answers = [];
    S.idx = 0;
    S.simId = null;
    S.simCreated = false;
    S.pendingDomande = [];
    resetOralHistory();
    S.startedAt = Date.now();
    S.elapsedMs = 0;
    S.sending = false;
    S.feedbackDone = false;
    beginSessionDb();
    showPhase("session");
    renderQuestion();
    startTimer();
    if (D) D.track("sim_report_action", { action: "retry_weak" });
  }

  function retryTopic(argomento) {
    var qs = S.questions.filter(function (q) { return (q.argomento || "") === argomento; });
    if (!qs.length) return;
    S.mode = "ripasso";
    S.questions = qs;
    S.answers = [];
    S.idx = 0;
    S.simId = null;
    S.simCreated = false;
    S.pendingDomande = [];
    resetOralHistory();
    S.startedAt = Date.now();
    S.elapsedMs = 0;
    S.sending = false;
    S.feedbackDone = false;
    beginSessionDb();
    showPhase("session");
    renderQuestion();
    startTimer();
    if (D) D.track("sim_report_action", { action: "retry_topic" });
  }

  /* ------------------------------------------------------------------
     Memoria di apprendimento (diario) + ALLENATI
     Ogni sessione completa aggiorna la memoria sintetica via /api/memory
     (modello piccolo lato server). "Allenati" genera una banca NUOVA sui
     soli temi deboli del diario: non ripete la sessione, la chiude.
     ------------------------------------------------------------------ */
  var ALLENATI_N = 6;

  function updateMemoryAfterSession() {
    try {
      var voto = averageVoto();
      if (!voto) return; // sessione senza risposte valutate: niente segnale
      var punti = buildPuntiForza();
      var deboli = buildDaLavorare();
      var argomenti = buildArgomentiDeboli();
      var dims = {};
      ["chiarezza", "struttura", "contenuto"].forEach(function (k) {
        var v = avgDimension(k);
        dims[k] = (v != null && isFinite(v)) ? Math.round(v * 10) / 10 : null;
      });
      var materia = S.subject ? S.subject.name : (S.bando ? (S.bando.filename || null) : null);
      var body = {
        sessione: {
          voto: Math.round(voto * 10) / 10,
          dimensioni: dims,
          punti_forti: punti.slice(0, 8).map(function (p) { return { text: p.text, tag: p.tag }; }),
          deboli: deboli.slice(0, 10).map(function (p) { return { text: p.text, tag: p.tag }; }),
          argomenti: argomenti.slice(0, 10).map(function (a) { return { argomento: a.argomento, media: a.media }; }),
          materia: materia,
          durata_min: Math.max(1, Math.round(S.elapsedMs / 60000))
        }
      };
      fetch("/api/memory", {
        method: "POST",
        headers: llmHeaders(),
        body: JSON.stringify(body)
      }).catch(function () { /* mai bloccare il report */ });
    } catch (_) { /* ignora */ }
  }

  function readMemoria() {
    return fetch("/api/memory", { method: "GET", headers: llmHeaders() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { return (data && data.memoria) ? data.memoria : null; })
      .catch(function () { return null; });
  }

  function topWeakTopics(mem, k) {
    if (!mem || !Array.isArray(mem.temi)) return [];
    return mem.temi
      .filter(function (t) { return t && t.stato === "attivo" && Number(t.livello) >= 3; })
      .sort(function (a, b) {
        if ((b.livello || 0) !== (a.livello || 0)) return (b.livello || 0) - (a.livello || 0);
        return (b.occorrenze || 1) - (a.occorrenze || 1);
      })
      .slice(0, k)
      .map(function (t) { return t.tema; });
  }

  function generateAllenaBank(topics) {
    var sys = "Sei il preparatore di un candidato a un concorso pubblico italiano. " +
      "Obiettivo di questa sessione: chiudere le lacune. Il candidato deve migliorare esattamente " +
      "questi argomenti deboli: " + topics.join(", ") + ". " +
      "Genera " + ALLENATI_N + " domande orali tipiche SOLO su questi argomenti, distribuite in modo uniforme. " +
      "Ogni domanda deve essere una richiesta aperta di esposizione (mai a scelta multipla), " +
      "come le farebbe una commissione, in italiano. " +
      'Rispondi SOLO con un array JSON senza markdown: [{"testo":"Domanda?","argomento":"Materia"}]';
    return llmJson(sys, [], 8000).then(function (parsed) {
      if (!parsed || !Array.isArray(parsed)) return null;
      var out = [];
      parsed.forEach(function (item, i) {
        var t = String(item && item.testo || "").trim();
        var a = String(item && item.argomento || topics[0] || "Dal bando").trim();
        if (t) out.push({ id: "llm-all-" + (i + 1), testo: t, argomento: a });
      });
      return out.length ? out : null;
    }).catch(function () { return null; });
  }

  function startAllenaSession(qs) {
    S.mode = "allenati";
    S.questions = qs.slice(0, ALLENATI_N);
    S.answers = [];
    S.idx = 0;
    S.simId = null;
    S.simCreated = false;
    S.pendingDomande = [];
    S.startedAt = Date.now();
    S.elapsedMs = 0;
    S.sending = false;
    S.feedbackDone = false;
    beginSessionDb();
    showPhase("session");
    renderQuestion();
    startTimer();
    if (D) D.track("sim_report_action", { action: "allena" });
  }

  function startAllenati() {
    // Il diario si aggiorna a ogni sessione; "Allenati" chiude i buchi.
    if (isQuotaExhausted()) {
      if (D) D.toast("Quota gratuita del mese esaurita: le simulazioni ripartono il " +
        (D.nextRenewalLabel ? D.nextRenewalLabel() : "prossimo mese") + ".");
      return;
    }
    var btn = $("report-allena") || $("setup-start");
    if (btn && !btn.disabled) btn.disabled = true;
    if (btn) btn.textContent = "Preparo l'allenamento…";
    readMemoria().then(function (mem) {
      var weak = topWeakTopics(mem, 4);
      if (!weak.length) {
        if (btn) { btn.disabled = false; btn.textContent = "Allenati sui punti deboli"; }
        if (D) D.toast("Il diario è ancora vuoto: le prime simulazioni lo costruiscono.");
        S.allenaIntent = false;
        newSimulation();
        return null;
      }
      return generateAllenaBank(weak).then(function (qs) {
        if (btn) { btn.disabled = false; btn.textContent = "Allenati sui punti deboli"; }
        if (!qs || !qs.length) {
          if (D) D.toast("Non riesco a preparare le domande ora. Riprova.");
          S.allenaIntent = false;
          newSimulation();
          return null;
        }
        S.allenaIntent = false;
        startAllenaSession(qs);
        return qs;
      });
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.textContent = "Allenati sui punti deboli"; }
      S.allenaIntent = false;
      newSimulation();
    });
  }

  /* ------------------------------------------------------------------
     Ripresa sessione dal draft
     ------------------------------------------------------------------ */
  function resumeSession(rd) {
    if (!rd || !rd.questions || !rd.questions.length) return;
    S.mode = rd.mode || "standard";
    S.subject = null;
    if (rd.subjectId) {
      for (var si = 0; si < FREE_SUBJECTS.length; si += 1) {
        if (FREE_SUBJECTS[si].id === rd.subjectId) { S.subject = FREE_SUBJECTS[si]; break; }
      }
    }
    S.questions = rd.questions;
    S.answers = rd.answers || [];
    S.idx = Math.min(rd.idx || 0, S.questions.length - 1);
    S.simId = rd.simId || null;
    S.simCreated = !!S.simId;
    S.pendingDomande = [];
    S.startedAt = rd.startedAt || Date.now();
    S.elapsedMs = rd.elapsedMs || 0;
    S.sending = false;
    S.feedbackDone = false;
    S.resumeData = null;
    S.interaction = rd.interaction === "vocale" ? "vocale" : "scritta";
    lsSet(K_INTERACTION, S.interaction);
    if (S.interaction === "vocale") ensureCommissionVoice();
    showPhase("session");
    renderQuestion();
    startTimer();
    // Ripristina la risposta in corso se c'era (draft preservato)
    var ta = $("answer-textarea");
    if (rd.draftAnswer) {
      ta.value = rd.draftAnswer;
      updateWordCount();
      var send = $("send-btn");
      if (send) send.disabled = !ta.value.trim();
      autoSize(ta);
    }
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    if (!D || !D.supabase) { showPhase("gate"); return; }

    D.guard().then(function (ok) {
      if (!ok) return;
      return D.loadUser().then(function (user) {
        S.user = user;
        S.bando = D.getActiveBando();
        return D.loadCommon(user).then(function (c) {
          S.used = c.used;
          // Priorità assoluta: se c'è un bando attivo, il subject libero è null.
          if (S.bando) S.subject = null;
          // Ripresa: ultimo draft di sessione incompleta. Se ora c'è un bando
          // attivo, la sessione libera NON si ripropone: il bando ha priorità
          // e l'utente partirà dal setup con il bando.
          var last = lsGet(K_LAST_SIM);
          if (last && !S.bando && last.questions && last.answers &&
              last.answers.length < last.questions.length) {
            S.resumeData = last;
            if (last.subjectId) {
              for (var si = 0; si < FREE_SUBJECTS.length; si += 1) {
                if (FREE_SUBJECTS[si].id === last.subjectId) { S.subject = FREE_SUBJECTS[si]; break; }
              }
            }
          }
          // Arrivo in allenamento libero dalla dashboard (senza bando attivo)
          if (!S.bando && !S.subject) pickRandomSubject();
          // Media voti delle simulazioni precedenti (per i confronti del report).
          // Non deve MAI bloccare l'init: un fallimento qui è non critico.
          try { loadHistoryAvg(user); } catch (e) { /* non critico */ }
          // Precarica la bank in background (path critico <1s al click)
          ensureBank();
          renderGate();
        });
      }).catch(function () {
        renderGate();
      });
    });
  }

  /* Media dei voti delle simulazioni precedenti (confronti reali nel report).
     Mai norme inventate: se non c'è storico, il report non mostra confronti. */
  function loadHistoryAvg(user) {
    S.historyAvg = null;
    if (!D || !D.supabase || !user) return;
    D.supabase.from("simulazioni")
      .select("voto_finale")
      .eq("user_id", user.id)
      .not("voto_finale", "is", null)
      .limit(100)
      .then(function (res) {
        if (!res || res.error || !res.data || !res.data.length) return;
        var sum = 0, n = 0;
        res.data.forEach(function (r) {
          var v = Number(r.voto_finale);
          if (isFinite(v)) { sum += v; n += 1; }
        });
        if (n) S.historyAvg = sum / n;
      }).catch(function () { /* niente confronti, ok */ });
  }

  /* ------------------------------------------------------------------
     Event listeners globali
     ------------------------------------------------------------------ */
  function bindEvents() {
    // Ctrl/⌘+Invio per inviare
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (S.phase === "session" && !S.sending && S.feedbackDone !== true) {
          e.preventDefault();
          var ta = $("answer-textarea");
          if (ta && ta.value.trim()) submitAnswer(false);
        }
      }
      // Esc: chiude l'aiuto, poi l'overlay pausa, altrimenti pausa
      if (e.key === "Escape") {
        var helpPanel = $("help-panel");
        if (helpPanel && helpPanel.classList.contains("is-open")) { closeHelp(); return; }
        var overlay = $("pause-overlay");
        if (overlay && overlay.classList.contains("is-on")) { closePause(); return; }
        if (S.phase === "session" && !S.sending) openPause();
      }
    });

    // Textarea: autosize + word count + abilita invio.
    // autoSize legge scrollHeight (reflow): throttlato via rAF, al più
    // una misura per frame. Lo stato del bottone si confronta col DOM
    // live (mai cache stantia: renderQuestion/onFeedbackError lo
    // modificano fuori da questo listener).
    var ta = $("answer-textarea");
    var sizeFrame = null;
    ta.addEventListener("input", function () {
      updateWordCount();
      var empty = !ta.value.trim();
      var send = $("send-btn");
      if (send.disabled !== empty) send.disabled = empty;
      if (sizeFrame === null) {
        sizeFrame = window.requestAnimationFrame(function () {
          sizeFrame = null;
          autoSize(ta);
        });
      }
    });

    // Modalità di interazione: si cambia solo durante la sessione,
    // mai mentre una risposta è in volo.
    var iScritta = $("interaction-scritta");
    var iVocale = $("interaction-vocale");
    if (iScritta) iScritta.addEventListener("click", function () {
      if (S.phase === "session" && !S.sending) setInteraction("scritta");
    });
    if (iVocale) iVocale.addEventListener("click", function () {
      if (S.phase === "session" && !S.sending) setInteraction("vocale");
    });

    // Hint accordion
    $("answer-hint-btn").addEventListener("click", function () {
      var panel = $("answer-hint-panel");
      var open = panel.classList.toggle("is-open");
      this.setAttribute("aria-expanded", String(open));
    });

    // Aiuto "Non so rispondere"
    $("help-trigger").addEventListener("click", toggleHelp);
    $("help-trigger").addEventListener("pointerdown", function () { pressFx($("help-trigger")); });
    $("help-spunto").addEventListener("pointerdown", function () { pressFx($("help-spunto")); });
    $("help-spunto").addEventListener("click", function () { helpRequest("spunto"); });
    $("help-risposta").addEventListener("pointerdown", function () { pressFx($("help-risposta")); });
    $("help-risposta").addEventListener("click", function () { helpRequest("risposta"); });

    // Invia
    $("send-btn").addEventListener("click", function () { submitAnswer(false); });

    // Ascolta il feedback (voce della commissione)
    var fbListen = $("fb-listen");
    if (fbListen) {
      fbListen.addEventListener("click", function () {
        if (!window.Voice) return;
        if (!Voice.ttsEnabled) {
          // Attiva la voce al volo: il pulsante funziona anche se il
          // toggle "Voce della commissione" è spento.
          ensureCommissionVoice();
        }
        var fb = $("feedback-text").textContent.trim();
        var sugg = $("feedback-suggestion").textContent.trim();
        if (fb) Voice.speak(fb + (sugg ? " Suggerimento: " + sugg : ""));
      });
    }

    // ----- Voce -----
    // Inizializza il modulo vocale con i callback di stato (UI live,
    // mai una UI vuota: lo stato di ascolto/trascrizione è sempre visibile).
    if (window.Voice) {
      Voice.init({
        onStatus: onVoiceStatus,
        onResult: onVoiceResult,
        onTtsState: onVoiceTtsState,
        onTtsPlay: onTtsPlay,
        onTtsSentence: onTtsSentence,
        onInterim: onVoiceInterim
      });

      // Toggle "Rispondi a voce"
      var vBtn = $("voice-btn");
      if (vBtn) vBtn.addEventListener("click", onVoiceClick);

      // Toggle "Voce della commissione"
      var ttsBtn = $("voice-tts-toggle");
      if (ttsBtn) {
        ttsBtn.setAttribute("aria-pressed", Voice.ttsEnabled ? "true" : "false");
        $("voice-tts-label").textContent = Voice.ttsEnabled ? "Voce: attiva" : "Voce della commissione";
        ttsBtn.addEventListener("click", function () {
          Voice.setTtsEnabled(!Voice.ttsEnabled);
          var on = Voice.ttsEnabled;
          ttsBtn.setAttribute("aria-pressed", on ? "true" : "false");
          $("voice-tts-label").textContent = on ? "Voce: attiva" : "Voce della commissione";
          // Primo download del modello in background: la prossima domanda
          // parte subito, senza attesa della voce.
          if (on && Voice.warmTts) Voice.warmTts();
          if (D) D.track("sim_voice_tts", { on: on });
        });
      }

      // Riprova voce: dopo un errore del provider, ritenta di predisporre
      // la voce e rilegge la domanda corrente (mai un turno bloccato).
      var ttsRetry = $("voice-tts-retry");
      if (ttsRetry) ttsRetry.addEventListener("click", function () {
        ttsRetry.hidden = true;
        if (!window.Voice) return;
        if (Voice.warmTts) Voice.warmTts();
        if (S.interaction === "vocale" && S.phase === "session" && !S.sending && !S.feedbackDone && S.questions[S.idx]) {
          speakQuestion(S.questions[S.idx]);
        }
      });

      // Niente microfono → nascondi il controllo "Rispondi a voce".
      if (!Voice.micSupported && vBtn) {
        vBtn.closest(".voice-row").classList.add("hidden");
      }

      // Registratore vocale: chiusura (X, Escape, click fuori) e
      // pulsante principale coerente con lo stato di ascolto.
      var recClose = $("recorder-close");
      if (recClose) recClose.addEventListener("click", closeRecorderSafe);
      var recMain = $("recorder-main");
      if (recMain) recMain.addEventListener("click", onRecorderMain);
      var recOv = $("recorder-overlay");
      if (recOv) {
        recOv.addEventListener("click", function () {
          var rec = $("recorder");
          if (!rec || rec.hidden) return;
          var stt = rec.getAttribute("data-state") || "";
          if (stt === "error" || stt === "done" || stt === "transcribing" || stt === "reviewing") {
            closeRecorderSafe();
          }
        });
      }
      document.addEventListener("keydown", function (e) {
        var rec = $("recorder");
        if (e.key === "Escape" && rec && !rec.hidden) closeRecorderSafe();
      });

      // Player voce della commissione: pausa/riprendi, stop, replay,
      // velocità 1x → 1.25x → 1.5x (ciclica).
      var ttsPause = $("tts-pause");
      if (ttsPause) {
        ttsPause.addEventListener("click", function () {
          if (Voice.ttsState === "playing") Voice.ttsControl("pause");
          else if (Voice.ttsState === "paused") Voice.ttsControl("resume");
        });
      }
      var ttsReplay = $("tts-replay");
      if (ttsReplay) ttsReplay.addEventListener("click", function () { Voice.ttsControl("replay"); });
      var ttsStop = $("tts-stop");
      if (ttsStop) ttsStop.addEventListener("click", function () { Voice.ttsControl("stop"); });
      var ttsRateBtn = $("tts-rate");
      if (ttsRateBtn) {
        ttsRateBtn.addEventListener("click", function () {
          var cur = Voice.ttsGetRate ? Voice.ttsGetRate() : 1;
          var next = cur >= 1.5 ? 1 : (cur >= 1.25 ? 1.5 : 1.25);
          Voice.ttsSetRate(next);
          ttsRateBtn.textContent = next === 1 ? "1x" : next + "x";
        });
      }
    }

    // Pausa
    $("sess-pause").addEventListener("click", openPause);
    $("pause-resume").addEventListener("click", closePause);
    $("pause-save-exit").addEventListener("click", saveAndExit);
    $("pause-terminate").addEventListener("click", terminateSession);

    // Briefing
    $("briefing-skip").addEventListener("click", skipBriefing);
    $("briefing-start").addEventListener("click", skipBriefing);

    // Metrics extra toggle
    $("metrics-extra-toggle").addEventListener("click", function () {
      var extra = $("metrics-extra");
      var open = extra.classList.toggle("is-open");
      this.setAttribute("aria-expanded", String(open));
    });

    // Cambia bando / cambia materia (allenamento libero)
    var change = $("setup-bando-change");
    if (change) change.addEventListener("click", function () {
      if (!S.bando) {
        pickRandomSubject();
        if (D) D.track("sim_subject_changed", { subject: S.subject.id });
        renderSetup();
        return;
      }
      window.location.href = "dashboard.html#bandi";
    });

    // Draft su beforeunload: la risposta in corso non si perde mai.
    window.addEventListener("beforeunload", function () {
      if (S.phase === "session") saveDraft();
    });

    // Flush coda su online
    window.addEventListener("online", flushOps);

    // Prev feedback accordion
    $("prev-feedback-toggle").addEventListener("click", function () {
      var panel = $("prev-feedback-panel");
      var open = panel.classList.toggle("is-open");
      this.setAttribute("aria-expanded", String(open));
    });
  }

  function updateWordCount() {
    var ta = $("answer-textarea");
    var n = countWords(ta.value);
    $("word-count").textContent = n + (n === 1 ? " parola" : " parole");
  }

  /* ------------------------------------------------------------------
     Voce — handler UI (stato, risultato trascrizione, stato TTS)
     ------------------------------------------------------------------ */
  function onVoiceClick() {
    if (!window.Voice) return;
    var btn = $("voice-btn");
    if (Voice.recording) {
      pressFx(btn);
      Voice.stop();
      return;
    }
    if (Voice.transcribing || S.sending || S.phase !== "session") return;
    pressFx(btn);
    clearMicAwait();
    // Apre il registratore: feedback immediato, mai un click senza risposta.
    // Le linee partono subito mentre il microfono si prepara (permesso + VAD).
    cancelRecorderClose();
    openRecorder();
    setRecorderState("starting", "Preparo il microfono…");
    startWaveLoop();
    // Interruzione = il mic parte mentre la commissione legge ancora.
    Voice.start({ interruptedByUser: S.voiceSpeaking })
      .catch(function (err) {
        // "already-busy" = doppio click durante l'avvio: il primo start è
        // ancora in corso, NON chiudere il registratore.
        if (err && err.message === "already-busy") return;
        stopWaveLoop();
        var msg = (err && err.message === "mic-unsupported")
          ? "Il microfono non è supportato su questo browser."
          : "Microfono non disponibile: controlla i permessi e riprova.";
        setRecorderState("error", msg);
        scheduleRecorderClose(3400);
        if (D) D.track("sim_voice_error", { reason: (err && err.message) || "unknown" });
      });
  }

  /* ------------------------------------------------------------------
     Voce — registratore professionale. La waveform NON è decorativa:
     ogni frame legge il volume REALE del microfono via AnalyserNode
     (Web Audio API). Stati sempre chiari: ascolto → trascrizione →
     revisione finale → messaggio pronto. Mai un click senza risposta.
     ------------------------------------------------------------------ */
  var waveBars = [];
  var waveLoopId = 0;
  var waveTimerShown = "";

  // Gradiente "linee colorate" stile ChatGPT: grafite → verde profondo →
  // verde vivo (dai token del design system: ink, ok, ok-bright).
  var WAVE_COLORS = [
    [15, 17, 21],    // #0F1115 ink
    [34, 55, 47],
    [63, 107, 79],   // #3F6B4F ok
    [30, 158, 92]    // #1E9E5C ok-bright
  ];

  function waveColor(i, n) {
    var t = n <= 1 ? 0 : i / (n - 1);
    var seg = t * (WAVE_COLORS.length - 1);
    var idx = Math.min(WAVE_COLORS.length - 2, Math.floor(seg));
    var f = seg - idx;
    var c1 = WAVE_COLORS[idx];
    var c2 = WAVE_COLORS[idx + 1];
    return "rgb(" + Math.round(c1[0] + (c2[0] - c1[0]) * f) + "," +
      Math.round(c1[1] + (c2[1] - c1[1]) * f) + "," +
      Math.round(c1[2] + (c2[2] - c1[2]) * f) + ")";
  }

  function buildWave() {
    var w = $("recorder-wave");
    if (!w || waveBars.length) return;
    var n = 42;
    for (var i = 0; i < n; i++) {
      var b = document.createElement("span");
      b.className = "recorder-wave-bar";
      b.style.background = waveColor(i, n);
      w.appendChild(b);
      waveBars.push(b);
    }
  }

  /* Pannello registratore: apre/chiude, gestisce stati e auto-chiusura.
     Mai un click senza risposta visiva, mai un vuoto durante l'ascolto. */
  var recCloseTimer = null;

  function openRecorder() {
    var rec = $("recorder");
    if (!rec) return;
    var firstOpen = rec.hidden;
    rec.hidden = false;
    buildWave();
    var tEl = $("recorder-timer");
    if (tEl) { tEl.textContent = "0:00"; waveTimerShown = ""; }
    var irEl = $("recorder-interim");
    if (irEl) { irEl.textContent = ""; irEl.classList.remove("is-live"); }
    requestAnimationFrame(function () { rec.classList.add("is-open"); });
    document.body.classList.add("rec-open");
    // Focus solo al primo open: i cicli recording→listening non rubano
    // il focus al pulsante della pagina.
    if (firstOpen) {
      var close = $("recorder-close");
      if (close && close.focus) close.focus({ preventScroll: true });
    }
  }

  function closeRecorder(restoreFocus, focusId) {
    var rec = $("recorder");
    if (!rec) return;
    rec.classList.remove("is-open");
    rec.hidden = true;
    document.body.classList.remove("rec-open");
    var irEl2 = $("recorder-interim");
    if (irEl2) { irEl2.textContent = ""; irEl2.classList.remove("is-live"); }
    var vb = $("voice-btn");
    if (vb) {
      vb.classList.remove("is-busy");
      vb.setAttribute("aria-pressed", "false");
      var lbl = $("voice-btn-label");
      if (lbl) lbl.textContent = (S.interaction === "vocale") ? "Premi e parla" : "Rispondi a voce";
    }
    if (focusId) {
      // Destinazione esplicita: dopo "Messaggio pronto" il focus va
      // sulla textarea, dove l'utente correggerà la trascrizione.
      var target = $(focusId);
      if (target && target.focus) target.focus({ preventScroll: true });
      return;
    }
    if (restoreFocus && vb && vb.focus) vb.focus({ preventScroll: true });
  }

  function closeRecorderSafe() {
    if (window.Voice) { try { Voice.cancel(); } catch (_) { /* noop */ } }
    stopWaveLoop();
    closeRecorder(true);
  }

  function scheduleRecorderClose(ms, focusId) {
    if (recCloseTimer) window.clearTimeout(recCloseTimer);
    recCloseTimer = window.setTimeout(function () {
      recCloseTimer = null;
      stopWaveLoop();
      closeRecorder(false, focusId);
    }, ms);
  }

  function cancelRecorderClose() {
    if (recCloseTimer) { window.clearTimeout(recCloseTimer); recCloseTimer = null; }
    // Annulla anche l'invio automatico pendente (modalità vocale):
    // nuova registrazione o cambio modalità → niente submit dello zombie.
    if (recSubmitTimer) { window.clearTimeout(recSubmitTimer); recSubmitTimer = null; }
  }

  function setRecorderState(state, label) {
    var rec = $("recorder");
    if (!rec) return;
    var states = ["starting", "recording", "listening", "transcribing", "reviewing", "done", "error"];
    for (var i = 0; i < states.length; i++) {
      rec.classList.toggle("is-" + states[i], states[i] === state);
    }
    rec.setAttribute("data-state", state);
    var statusEl = $("recorder-status");
    if (statusEl && label != null) statusEl.textContent = label;
    var main = $("recorder-main");
    if (main) {
      // In trascrizione/revisione il pulsante è davvero inerte: non solo
      // visivamente (disabled toglie anche dal tab order).
      var inert = (state === "transcribing" || state === "reviewing");
      main.disabled = inert;
      main.setAttribute("aria-disabled", inert ? "true" : "false");
      var aria = "Ferma la registrazione";
      if (inert) aria = "Elaborazione in corso";
      else if (state === "done") aria = "Messaggio pronto";
      else if (state === "error") aria = "Chiudi";
      main.setAttribute("aria-label", aria);
    }
  }

  function onRecorderMain() {
    var rec = $("recorder");
    if (!rec || rec.hidden) return;
    var state = rec.getAttribute("data-state") || "";
    if (state === "recording" || state === "listening" || state === "starting") {
      if (window.Voice) Voice.stop();
    } else if (state === "error" || state === "done") {
      stopWaveLoop();
      closeRecorder(true);
    }
    // transcribing / reviewing: inerte (l'aria-label lo comunica).
  }

  function startWaveLoop() {
    if (waveLoopId) return;
    var tick = function () {
      if (!window.Voice || (!Voice.recording && !Voice._startPending)) { stopWaveLoop(); return; }
      var i;
      var rec = $("recorder");
      // Fase di preparazione: le barre le anima il CSS (rec-breathe), qui
      // aggiorniamo solo il timer.
      if (!(rec && rec.classList.contains("is-starting"))) {
        if (Voice.hasAnalyser && Voice.hasAnalyser()) {
          // Volume REALE del microfono via AnalyserNode (Web Audio API).
          var levels = Voice.levels(waveBars.length);
          for (i = 0; i < waveBars.length; i++) {
            var v = Math.max(0.08, Math.min(1, levels[i] || 0));
            waveBars[i].style.transform = "scaleY(" + v.toFixed(3) + ")";
          }
        } else {
          // Analizzatore non disponibile: onda dolce di riserva (mai linee
          // morte, il feedback visivo non manca mai).
          var t2 = performance.now();
          for (i = 0; i < waveBars.length; i++) {
            var v2 = 0.12 + 0.1 * Math.sin(t2 / 480 + i * 0.5);
            waveBars[i].style.transform = "scaleY(" + v2.toFixed(3) + ")";
          }
        }
      }
      var tEl = $("recorder-timer");
      if (tEl) {
        var sec = Math.floor((Voice.listenSince ? Voice.listenSince() : 0) / 1000);
        var label = Math.floor(sec / 60) + ":" + ("0" + (sec % 60)).slice(-2);
        if (label !== waveTimerShown) { tEl.textContent = label; waveTimerShown = label; }
      }
      waveLoopId = requestAnimationFrame(tick);
    };
    waveLoopId = requestAnimationFrame(tick);
  }

  function stopWaveLoop() {
    if (waveLoopId) { cancelAnimationFrame(waveLoopId); waveLoopId = 0; }
    waveTimerShown = "";
  }

  /* Stato live della registrazione: ogni stato del registratore è
     immediatamente riconoscibile. La UI non è mai "vuota" mentre la
     commissione ascolta o trascrive. */
  function onVoiceStatus(s) {
    switch (s) {
      case "recording":
        // In ascolto: la waveform reagisce al volume reale (AnalyserNode).
        cancelRecorderClose();
        openRecorder();
        startWaveLoop();
        setRecorderState("recording", "Ti stiamo ascoltando");
        if (S.interaction === "vocale") setOral("listening", "Ti ascolto…");
        break;
      case "speaking":
        // La commissione sta leggendo: nessun cambio di stato.
        break;
      case "listening":
        // Breve pausa tra i segmenti: restiamo in ascolto.
        setRecorderState("listening", "Ti stiamo ascoltando");
        break;
      case "transcribing":
        stopWaveLoop();
        setRecorderState("transcribing", "Trascrizione…");
        if (S.interaction === "vocale") setOral("transcribing", "Trascrivo la risposta…");
        break;
      case "error":
        stopWaveLoop();
        setRecorderState("error", "Trascrizione non riuscita: riprova o scrivi la risposta.");
        scheduleRecorderClose(3400);
        break;
      default:
        stopWaveLoop();
        closeRecorder();
        // Il turno resta del candidato: il microfono torna a invitare.
        if (S.interaction === "vocale" && S.phase === "session" && !S.sending) {
          setOral("user-turn", "Tocca a te");
        }
    }
  }

  /* Trascrizione progressiva (interim): il candidato si vede ascoltato
     mentre parla. Testo provvisorio nel registratore; la trascrizione
     finale (server) resta l'unica fonte vera. */
  function onVoiceInterim(text) {
    var el = $("recorder-interim");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("is-live", !!text);
  }

  /* Risultato della trascrizione: prima una piccola revisione finale
     (correzioni evidenti via modello economico), poi il testo riempie
     la textarea e le metriche vocali restano per il feedback. La UI
     non è mai "vuota": trascrizione → revisione → messaggio pronto. */
  function onVoiceResult(res) {
    var text = String(res.text || "").trim();
    var metrics = res.metrics || {};
    stopWaveLoop();
    // Errore di trascrizione: il messaggio "non ti ho sentito" sarebbe
    // fuorviante — l'utente è stato sentito, è il servizio che è fallito.
    if (res && res.error) {
      setRecorderState("error", "Trascrizione non riuscita: riprova o scrivi la risposta.");
      scheduleRecorderClose(3400);
      // Il turno resta del candidato: il microfono torna a invitare.
      if (S.interaction === "vocale") setOral("user-turn", "Tocca a te");
      if (D) D.track("sim_voice_error", { reason: String(res.error).slice(0, 80) });
      return;
    }
    if (!text) {
      setRecorderState("error", "Non ti ho sentito: riprova o scrivi la risposta.");
      scheduleRecorderClose(2600);
      // Il turno resta del candidato: il microfono torna a invitare.
      if (S.interaction === "vocale") setOral("user-turn", "Tocca a te");
      if (D) D.track("sim_voice_empty", {});
      return;
    }
    // Revisione finale: una piccola passata su un modello economico
    // corregge SOLO gli errori evidenti. Fail-open: se non risponde,
    // la trascrizione resta quella che è, mai persa.
    setRecorderState("reviewing", "Revisione finale…");
    reviewTranscription(text).then(function (finalText) {
      S.voiceMetrics = metrics;
      var ta = $("answer-textarea");
      ta.value = finalText;
      ta.disabled = false;
      updateWordCount();
      autoSize(ta);
      var send = $("send-btn");
      send.disabled = false;
      // Metriche visibili: il "come" ha parlato, non solo il "cosa".
      var mEl = $("voice-metrics");
      if (mEl) {
        mEl.innerHTML = "Parlando: <strong>" + escHtml(fmtVoiceMetrics(metrics)) + "</strong>";
        mEl.classList.add("is-on");
      }
      setRecorderState("done", "Messaggio pronto");
      if (S.interaction === "vocale") {
        // Modalità vocale = orale vero: la risposta parte da sola, con
        // una finestra breve (l'orale non aspetta) poi la commissione
        // "riflette". Timer tracciato: se l'utente ri-registra o cambia
        // modalità, l'invio pendente viene annullato (mai zombie).
        scheduleRecorderClose(V_REC_DONE_MS, null);
        if (recSubmitTimer) window.clearTimeout(recSubmitTimer);
        recSubmitTimer = window.setTimeout(function () {
          recSubmitTimer = null;
          var ta2 = $("answer-textarea");
          if (ta2 && ta2.value.trim() && !S.sending && S.phase === "session" && S.feedbackDone !== true) {
            submitAnswer(true);
          }
        }, V_REC_SUBMIT_MS);
      } else {
        scheduleRecorderClose(REC_DONE_MS, "answer-textarea");
      }
      if (D) D.track("sim_voice_result", {
        words: countWords(finalText),
        time_to_answer: metrics.timeToAnswerMs,
        pauses: metrics.pauseCount,
        wpm: metrics.wpm
      });
    });
  }

  /* Revisione finale della trascrizione via /api/stt/review (modello
     piccolo, fail-open). Timeout client di 9s: anche con rete lenta
     la trascrizione non viene mai persa. */
  function reviewTranscription(text) {
    var sess = (D && D.supabase && D.supabase.auth) ? D.supabase.auth.getSession() : null;
    var token = sess && sess.data && sess.data.session && sess.data.session.access_token;
    var p = fetch("/api/stt/review", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? "Bearer " + token : ""
      },
      body: JSON.stringify({ text: text })
    }).then(function (r) {
      if (!r.ok) throw new Error("http-" + r.status);
      return r.json();
    }).then(function (data) {
      if (data && typeof data.text === "string" && data.text.trim()) return data.text;
      throw new Error("empty");
    });
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (v) { if (!done) { done = true; resolve(v); } };
      p.then(function (t) { finish(t); }, function () { finish(text); });
      window.setTimeout(function () { finish(text); }, 9000);
    });
  }

  /* Stato TTS: mostra il caricamento della voce (una volta sola) e
     il fallback in caso di errore: la UI non mente mai. */
  function onVoiceTtsState(s) {
    var ttsBtn = $("voice-tts-toggle");
    var lbl = $("voice-tts-label");
    if (!ttsBtn) return;
    var retry = $("voice-tts-retry");
    if (s === "loading") {
      ttsBtn.classList.add("is-loading");
      if (Voice.ttsEnabled) lbl.textContent = "Carico la voce…";
    } else if (s === "error") {
      ttsBtn.classList.remove("is-loading");
      lbl.textContent = "Voce non disponibile";
      if (retry) retry.hidden = false;
      // Mai un blocco: il turno continua, il testo resta la guida.
      if (S.interaction === "vocale" && S.phase === "session") {
        setOral("voice-unavailable", "Voce non disponibile — rispondi pure, seguiamo dal testo");
      }
    } else {
      ttsBtn.classList.remove("is-loading");
      if (retry) retry.hidden = true;
    }
  }

  /* ------------------------------------------------------------------
     Player voce della commissione — UI. La waveform reagisce al volume
     REALE dell'audio (AnalyserNode del player): si vede davvero la
     commissione parlare. Stati: preparazione → riproduzione → pausa →
     fine/stop. Compatto e silenzioso, mai effetti da assistente AI.
     ------------------------------------------------------------------ */
  var ttsBars = [];
  var ttsWaveLoopId = 0;
  var ttsHideTimer = null;

  function buildTtsWave() {
    var w = $("tts-wave");
    if (!w || ttsBars.length) return;
    var n = 24;
    for (var i = 0; i < n; i++) {
      var b = document.createElement("span");
      b.className = "tts-wave-bar";
      b.style.background = waveColor(i, n);   // grafite → verde (design system)
      w.appendChild(b);
      ttsBars.push(b);
    }
  }

  function startTtsWaveLoop() {
    if (ttsWaveLoopId) return;
    var tick = function () {
      if (!window.Voice || Voice.ttsState !== "playing") { stopTtsWaveLoop(); return; }
      var levels = (Voice.ttsWaveLevels && ttsBars.length)
        ? Voice.ttsWaveLevels(ttsBars.length) : null;
      for (var i = 0; i < ttsBars.length; i++) {
        var v = 0.1;
        if (levels && levels[i] != null) {
          v = Math.max(0.08, Math.min(1, levels[i] * 1.35));
        } else {
          v = 0.1 + 0.07 * Math.sin(performance.now() / 520 + i * 0.45);
        }
        ttsBars[i].style.transform = "scaleY(" + v.toFixed(3) + ")";
      }
      ttsWaveLoopId = requestAnimationFrame(tick);
    };
    ttsWaveLoopId = requestAnimationFrame(tick);
  }

  function stopTtsWaveLoop() {
    if (ttsWaveLoopId) { cancelAnimationFrame(ttsWaveLoopId); ttsWaveLoopId = 0; }
  }

  function resetTtsBars() {
    for (var i = 0; i < ttsBars.length; i++) ttsBars[i].style.transform = "scaleY(0.1)";
  }

  function setTtsPauseIcon(paused) {
    var btn = $("tts-pause");
    if (!btn) return;
    var pi = btn.querySelector(".tts-pause-ic");
    var pl = btn.querySelector(".tts-play-ic");
    if (pi) pi.hidden = paused;
    if (pl) pl.hidden = !paused;
    btn.setAttribute("aria-label", paused ? "Riprendi" : "Pausa");
  }

  /* Stato del player segnalato da voice.js: la UI non mente mai. */
  function onTtsPlay(state) {
    var pl = $("tts-player");
    if (!pl) return;
    var note = $("tts-note");
    if (state === "preparing") {
      pl.hidden = false;
      pl.classList.add("is-preparing");
      pl.classList.remove("is-playing", "is-paused");
      buildTtsWave();
      if (note) note.textContent = "Preparo la voce…";
      if (ttsHideTimer) { clearTimeout(ttsHideTimer); ttsHideTimer = null; }
    } else if (state === "playing") {
      pl.hidden = false;
      pl.classList.add("is-playing");
      pl.classList.remove("is-preparing", "is-paused");
      buildTtsWave();
      if (note) note.textContent = "";
      setTtsPauseIcon(false);
      startTtsWaveLoop();
      var fb = $("fb-listen");
      if (fb && !fb.hidden) fb.classList.add("is-playing");
    } else if (state === "paused") {
      pl.classList.add("is-paused");
      pl.classList.remove("is-playing");
      if (note) note.textContent = "In pausa";
      setTtsPauseIcon(true);
      stopTtsWaveLoop();
      resetTtsBars();
    } else {
      // done | stopped
      stopTtsWaveLoop();
      resetTtsBars();
      setTtsPauseIcon(false);
      // Testo stabilizzato: dopo la lettura tutto resta leggibile.
      settleSentHighlights("q-text");
      settleSentHighlights("oral-answer-text");
      var fb2 = $("fb-listen");
      if (fb2) fb2.classList.remove("is-playing");
      if (pl.hidden) return;
      if (ttsHideTimer) clearTimeout(ttsHideTimer);
      if (state === "done") {
        if (note) note.textContent = "";
        ttsHideTimer = setTimeout(function () {
          ttsHideTimer = null;
          pl.hidden = true;
        }, 1100);
      } else {
        pl.hidden = true;
      }
    }
  }

  function autoSize(ta) {
    ta.style.height = "auto";
    var h = Math.min(ta.scrollHeight, 12 * 26);
    ta.style.height = Math.max(96, h) + "px";
  }

  /* ------------------------------------------------------------------
     Briefing — 3 card, 800ms l'una, skippabile
     ------------------------------------------------------------------ */
  var briefingTimer = null;

  function runBriefing() {
    // Adatta la prima card al contesto (bando vs allenamento libero)
    var b1 = $("briefing-1");
    if (b1) {
      if (S.subject) {
        b1.textContent = "Ti alleni su «" + S.subject.name + "». Le domande arriveranno da lì.";
      } else if (!S.bando) {
        b1.textContent = "Hai davanti il tuo bando. Le domande arriveranno da lì.";
      }
    }
    var cards = ["briefing-1", "briefing-2", "briefing-3"];
    cards.forEach(function (id, i) {
      var el = $(id);
      el.classList.remove("is-in");
      window.setTimeout(function () {
        el.classList.add("is-in");
      }, i * (REDUCED ? 0 : 800));
    });
    if (REDUCED) { startSessionSoon(); return; }
    briefingTimer = window.setTimeout(startSessionSoon, 2600);
  }

  function skipBriefing() {
    if (briefingTimer) { window.clearTimeout(briefingTimer); briefingTimer = null; }
    startSessionSoon();
  }

  function startSessionSoon() {
    // La sessione parte quando la bank è pronta (o con il fallback onesto).
    // ensureBank() è già stata lanciata a init: se pronta, parte subito.
    if (S.qBankReady || S.questions.length) {
      startSession();
    } else {
      // Attesa breve: se dopo 3s la bank non c'è, fallback onesto.
      window.setTimeout(function () {
        if (!S.qBankReady && !S.questions.length) {
          S.questions = fallbackQuestions();
          S.qBankReady = true;
        }
        startSession();
      }, 3000);
    }
  }

  /* Fallback onesto quando la generazione LLM non arriva: domande generiche
     della materia scelta (o di diritto amministrativo senza materia). */
  function fallbackQuestions() {
    var base = S.subject
      ? [
          "Mi illustri i principi fondamentali di «" + S.subject.name + "».",
          "Quali sono gli istituti principali di «" + S.subject.name + "» che un candidato deve conoscere?",
          "Mi spieghi, con un esempio concreto, come si applica «" + S.subject.name + "» nell'attività della pubblica amministrazione.",
          "Cosa distingue un profilo teorico da uno pratico nello studio di «" + S.subject.name + "»?",
          "Quali riferimenti normativi o fonti sono centrali in «" + S.subject.name + "»?",
          "Mi parli di un caso tipico che un concorsista deve saper inquadrare in «" + S.subject.name + "».",
          "Come si collega «" + S.subject.name + "» agli altri istituti del diritto pubblico?",
          "Mi indichi i punti da approfondire per una risposta eccellente in «" + S.subject.name + "».",
          "Quali errori commette spesso un candidato quando espone «" + S.subject.name + "»?",
          "Mi illustri come imposterebbe una risposta completa su un tema di «" + S.subject.name + "».",
          "Quali aggiornamenti normativi recenti riguardano «" + S.subject.name + "»?",
          "Mi parli della rilevanza pratica di «" + S.subject.name + "» per il lavoro nella pubblica amministrazione."
        ]
      : [
          "Mi illustri il principio di legalità dell'azione amministrativa.",
          "Quali sono i principi dell'attività amministrativa ai sensi della legge 241/1990?",
          "Mi parli della trasparenza amministrativa e degli obblighi di pubblicazione.",
          "Come si articola il procedimento amministrativo nelle sue fasi principali?",
          "Cosa distingue un atto discrezionale da uno vincolato?",
          "Mi spieghi la differenza tra vizi di legittimità e vizi di merito.",
          "Quali sono i diritti del cittadino nel procedimento amministrativo?",
          "Mi illustri la responsabilità della pubblica amministrazione.",
          "Come funziona il ricorso amministrativo e giurisdizionale?",
          "Mi parli dell'organizzazione degli enti locali: organi e funzioni.",
          "Cosa sono i contratti pubblici e quali principi li governano?",
          "Mi spieghi il ruolo della privacy nel trattamento di dati da parte della PA."
        ];
    var arg = S.subject ? S.subject.name : "Diritto amministrativo";
    return base.map(function (t, i) {
      return { id: "fb-" + (i + 1), testo: t, argomento: arg };
    });
  }

  // Boot → init
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { bindEvents(); init(); });
  } else {
    bindEvents();
    init();
  }

  // Hook di test (attivo solo se esplicitamente richiesto dal test):
  // espone stato e funzioni interne per i test jsdom senza dover guidare
  // i click del gate. Mai attivo in produzione.
  if (window.__SIM_TEST__) {
    window.__SIM_TEST__ = {
      S: S,
      renderQuestion: renderQuestion,
      submitAnswer: submitAnswer,
      finishFeedback: finishFeedback,
      setInteraction: setInteraction,
      onVoiceResult: onVoiceResult,
      renderOralResponse: renderOralResponse,
      onTtsSentence: onTtsSentence,
      splitText: splitText,
      renderQuestionText: renderQuestionText,
      isVoiceSim: isVoiceSim,
      isTraining: isTraining,
      setOral: setOral,
      appendOralHistory: appendOralHistory,
      resetOralHistory: resetOralHistory,
      scheduleOralNext: scheduleOralNext,
      closePause: closePause,
      openPause: openPause,
      ensureCommissionVoice: ensureCommissionVoice,
      onVoiceTtsState: onVoiceTtsState,
      syncTtsToggle: syncTtsToggle
    };
  }
})();
