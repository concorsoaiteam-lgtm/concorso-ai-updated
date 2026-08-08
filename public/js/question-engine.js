/* =========================================================================
   question-engine.js — ConcorsoAI · Question Engine (logica pura)
   =========================================================================
   Specifica: md/question-engine-research.md (sezioni 16, 23, 24).
   Modulo DETERMINISTICO, senza dipendenze, senza I/O, senza Math.random:
   decide quale argomento e quale tipo di domanda per ogni turno.

   - planRealistic(blueprint, n)  → "cosa mi chiederebbe la commissione"
   - planTraining(memory, n)      → "cosa mi fa migliorare adesso"
   - validateQuestion(q, opts)    → quality-gate deterministico (§15/§24.3)

   Uso: browser → window.QuestionEngine; Node → require(). Nessun effetto
   collaterale. I tipi di domanda sono: esposizione, distinzione, caso,
   collegamento, trasferimento, argomentazione. La difficoltà è 1-3.
   ========================================================================= */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QuestionEngine = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* ------------------------------- Costanti ------------------------------ */
  var TYPES = ["esposizione", "distinzione", "caso", "collegamento", "trasferimento", "argomentazione"];

  // Mappa errore → tipi di domanda (primario + alternative per la rotazione).
  // §14.2/§23.4: conoscenza→esposizione, confusione→distinzione,
  // applicazione→caso, argomentazione→argomentazione.
  var ERRORE_TIPI = {
    conoscenza:    { primario: "esposizione",   altri: ["caso", "distinzione"] },
    confusione:    { primario: "distinzione",   altri: ["caso", "esposizione"] },
    applicazione:  { primario: "caso",          altri: ["trasferimento", "esposizione"] },
    argomentazione:{ primario: "argomentazione", altri: ["esposizione", "collegamento"] }
  };
  var ERRORE_DEFAULT = "conoscenza";

  // Difficoltà di base per tipo (§13/§23.7).
  var TIPO_DIFFICOLTA = {
    distinzione: 1, esposizione: 1, caso: 2, argomentazione: 2,
    collegamento: 2, trasferimento: 3
  };

  // Pesi di default (§16).
  var W_REAL = { importanza: 0.5, classicita: 0.3, collegabilita: 0.2, recency: 0.3, ripetizione: 0.5 };
  var W_ALL = { debolezza: 0.4, spacing: 0.3, diagnost: 0.2, monotonia: 0.3, rotazione: 0.2 };

  // Scala operativa del spacing (§16.2/§14.3): livello → intervallo target (giorni).
  var SPACING_LADDER = { 5: 1, 4: 3, 3: 7 };

  // Un tema non deve dominare la sessione di allenamento (§16.2, cap ~40%).
  var MAX_TEMA_SHARE = 0.4;

  var MAX_TESTO = 180;     // domanda principale: max caratteri (§15/§17)
  var MIN_TESTO = 8;

  /* ------------------------------- Helpers ------------------------------- */
  function clamp(v, min, max, fb) {
    var n = Number(v);
    if (!isFinite(n)) return fb;
    return Math.max(min, Math.min(max, n));
  }
  function str(v) { return String(v == null ? "" : v).trim(); }
  function norm(s) { return str(s).toLowerCase().replace(/\s+/g, " "); }
  function daysSince(iso) {
    if (!iso) return null; // mai esercitato
    var t = Date.parse(iso);
    if (!isFinite(t)) return null;
    return Math.max(0, Math.floor((Date.now() - t) / 86400000));
  }
  function intervalFor(livello) {
    return SPACING_LADDER[clamp(livello, 3, 5, 3)] || SPACING_LADDER[3];
  }
  function arrayFrom(x) { return Array.isArray(x) ? x : []; }

  /* --------------------------- Blueprint (Realistica) -------------------- */
  // Normalizza un blueprint: [{argomento, importanza 1-3, classicità 0-2,
  // collegabilità 0-2}], dedupe per argomento. I valori mancanti hanno i
  // default della materia (importanza 2 = "importante", classicità 1, collegabilità 1).
  function normalizeBlueprint(blueprint) {
    var byKey = {};
    arrayFrom(blueprint).forEach(function (b) {
      if (!b || typeof b !== "object") return;
      var arg = str(b.argomento);
      if (!arg) return;
      var k = norm(arg);
      if (!byKey[k]) {
        byKey[k] = {
          argomento: arg,
          importanza: clamp(b.importanza, 1, 3, 2),
          classicita: clamp(b.classicita, 0, 2, 1),
          collegabilita: clamp(b.collegabilita, 0, 2, 1)
        };
      } else {
        // Ricorrenza nel materiale = segnale debole di classicità (§16.1),
        // fino a un tetto. Niente doppioni nel piano.
        byKey[k].classicita = Math.min(2, byKey[k].classicita + 1);
      }
    });
    return Object.keys(byKey).map(function (k) { return byKey[k]; });
  }

  // Deriva il blueprint dalla bank esistente (array di domande generate).
  // Onora i campi opzionali importanza/classicità/collegabilità se il prompt
  // li fornisce (forward-compatible con §23.6); altrimenti default + frequenza.
  function buildBlueprint(questions) {
    return normalizeBlueprint(arrayFrom(questions).map(function (q) {
      return {
        argomento: (q && q.argomento) || null,
        importanza: q && q.importanza,
        classicita: q && q.classicita,
        collegabilita: q && q.collegabilita
      };
    }));
  }

  /* --------------------------- Realistica -------------------------------- */
  // Piano di una simulazione realistica: ampiezza→profondità (§6.3/§24.A.2).
  // Il primo blocco attinge agli argomenti ad alta importanza (esposizione,
  // difficoltà in rampa 1→2); le ultime `depth` domande attingono agli
  // argomenti ad alta collegabilità (tipo collegamento/caso, difficoltà 3).
  // Anti-ripetizione: mai lo stesso argomento due volte nello stesso piano.
  function planRealistic(blueprint, n, opts) {
    opts = opts || {};
    n = Math.max(0, parseInt(n, 10) || 0);
    var bps = normalizeBlueprint(blueprint);
    if (!n || !bps.length) return [];

    // Almeno una domanda di apertura resta ampiezza: per n piccoli la
    // profondità non deve mangiare tutto il piano (n≤3 → rampa ridotta, mai
    // tutto a difficoltà 3).
    var depth = Math.min(clamp(opts.depthLast, 0, 6, 3), Math.max(0, n - 1));
    var ampCount = n - depth;
    var session = arrayFrom(opts.sessionTopics).map(norm);
    var recencyWindow = clamp(opts.recencyWindow, 1, 10, 3);

    function recencyPenalty(b) {
      var idx = session.indexOf(norm(b.argomento));
      if (idx === -1) return 0;
      return idx >= session.length - recencyWindow ? 1 : 0;
    }
    function ripetizionePenalty(b) {
      return session.indexOf(norm(b.argomento)) !== -1 ? 1 : 0;
    }
    function score(b) {
      return W_REAL.importanza * b.importanza +
        W_REAL.classicita * b.classicita +
        W_REAL.collegabilita * b.collegabilita -
        W_REAL.recency * recencyPenalty(b) -
        W_REAL.ripetizione * ripetizionePenalty(b);
    }

    var scored = bps.map(function (b) { return { b: b, s: score(b) }; })
      .sort(function (a, c) { return c.s - a.s; });

    var plan = [];
    var used = {};

    // Blocco ampiezza: esposizione, difficoltà in rampa.
    var amp = scored.slice(0, ampCount);
    amp.forEach(function (x, i) {
      used[norm(x.b.argomento)] = true;
      plan.push({
        argomento: x.b.argomento,
        tipo: "esposizione",
        difficolta: i < Math.ceil(n / 3) ? 1 : 2
      });
    });

    // Blocco profondità: dal residuo con la collegabilità più alta.
    var rest = scored.slice(ampCount).filter(function (x) { return !used[norm(x.b.argomento)]; })
      .sort(function (a, c) {
        if (c.b.collegabilita !== a.b.collegabilita) return c.b.collegabilita - a.b.collegabilita;
        return c.s - a.s;
      });
    rest.slice(0, depth).forEach(function (x, i) {
      plan.push({
        argomento: x.b.argomento,
        tipo: (i % 2 === 0) ? "collegamento" : "caso",
        difficolta: 3
      });
    });

    return plan;
  }

  /* --------------------------- Allenamento ------------------------------- */
  // Tema debole come oggetto completo (livello, occorrenze, ultima,
  // tipo_errore, note). Ricalca topWeakTopics di api/_lib/memory.js
  // (duplicazione deliberata: il modulo è autosufficiente e client-side).
  function weakTopics(memory) {
    var temi = arrayFrom(memory && memory.temi).filter(function (t) {
      return t && t.stato === "attivo" && clamp(t.livello, 1, 5, 3) >= 3;
    });
    temi.sort(function (a, b) {
      if ((b.livello || 0) !== (a.livello || 0)) return (b.livello || 0) - (a.livello || 0);
      return (b.occorrenze || 1) - (a.occorrenze || 1);
    });
    return temi;
  }

  function debolezza(t) {
    var liv = clamp(t.livello, 1, 5, 3);
    return 0.7 * ((liv - 2) / 3) + 0.3 * Math.min(1, (Number(t.occorrenze) || 1) / 5);
  }
  function spacingGain(t) {
    var days = daysSince(t.ultima);
    if (days === null) return 1; // mai esercitato → è il momento
    return Math.min(1, days / intervalFor(clamp(t.livello, 3, 5, 3)));
  }
  function preferredTypes(tipoErrore) {
    var map = ERRORE_TIPI[tipoErrore] || ERRORE_TIPI[ERRORE_DEFAULT];
    return [map.primario].concat(map.altri);
  }
  function diagnost(mapa, tipo) {
    var map = ERRORE_TIPI[mapa] || ERRORE_TIPI[ERRORE_DEFAULT];
    if (tipo === map.primario) return 1;
    if (map.altri.indexOf(tipo) !== -1) return 0.6;
    return 0.3;
  }
  function mapErroreToTipo(tipoErrore) {
    return (ERRORE_TIPI[tipoErrore] || ERRORE_TIPI[ERRORE_DEFAULT]).primario;
  }

  // Piano di allenamento: argomenti deboli dal diario + tipo di domanda
  // giusto per l'errore + spacing + rotazione + cap di monotonia + quota
  // di argomenti nuovi (§16.2/§23.3/§24.1). Ogni slot ha un `motivo`
  // leggibile per i log e per il feedback.
  function planTraining(memory, n, opts) {
    opts = opts || {};
    n = Math.max(0, parseInt(n, 10) || 0);
    if (!n) return [];

    var weak = weakTopics(memory);
    var blueprint = normalizeBlueprint(opts.blueprint);
    var fallback = !weak.length;
    // Senza debolezze (primo accesso o diario vuoto) il piano si costruisce
    // sui pilastri del programma: TUTTI gli slot vengono dagli argomenti
    // del blueprint (§21.7), non da una "quota nuovi" residuale.
    var newSlots = fallback
      ? n
      : Math.max(0, clamp(opts.domandeNuove, 0, n, Math.max(1, Math.round(n / 4))));
    if (!blueprint.length) newSlots = 0;

    // Stato di sessione: ultimo tipo per tema e conteggi già usati in questa
    // sessione (rotazione e cap continuano tra un piano e l'altro, §23.3).
    var lastTipo = {};
    Object.keys(opts.lastTipoByTema || {}).forEach(function (k) {
      lastTipo[norm(k)] = opts.lastTipoByTema[k];
    });
    var stato = {};
    Object.keys(opts.usedCountByTema || {}).forEach(function (k) {
      stato[norm(k)] = Number(opts.usedCountByTema[k]) || 0;
    });
    var maxPerTema = Math.max(1, Math.ceil(MAX_TEMA_SHARE * n));
    var plan = [];

    function pickWeak() {
      var best = null;
      // Il cap di monotonia è "duro" SOLO se c'è un'alternativa sotto il cap:
      // con un unico tema debole il piano si riempie comunque (la monotonia
      // resta una penalità di punteggio, mai un buco nel piano).
      var anyBelow = false;
      weak.forEach(function (t) { if (stato[norm(t.tema)] < maxPerTema) anyBelow = true; });
      weak.forEach(function (t) {
        var k = norm(t.tema);
        if (stato[k] >= maxPerTema && anyBelow) return;
        var tipi = preferredTypes(t.tipo_errore);
        var tipo = tipi[0];
        if (lastTipo[k] && tipi.indexOf(lastTipo[k]) !== -1) {
          // Rotazione: mai lo stesso tipo due volte di fila sullo stesso tema.
          var alt = tipi.filter(function (x) { return x !== lastTipo[k]; });
          tipo = alt.length ? alt[0] : tipi[0];
        }
        var mono = 0;
        if (stato[k] >= maxPerTema - 1 && stato[k] > 0) mono = 0.5;
        if (stato[k] >= maxPerTema) mono = 1;
        var rot = (lastTipo[k] === tipo) ? 0 : 1;
        var s = W_ALL.debolezza * debolezza(t) +
          W_ALL.spacing * spacingGain(t) +
          W_ALL.diagnost * diagnost(t.tipo_errore, tipo) -
          W_ALL.monotonia * mono +
          W_ALL.rotazione * rot;
        if (!best || s > best.s) best = { t: t, tipo: tipo, s: s };
      });
      return best;
    }

    var weakNeeded = Math.max(0, n - newSlots);
    for (var i = 0; i < weakNeeded; i++) {
      var pick = pickWeak();
      if (!pick) break; // niente più temi disponibili: si riempie coi nuovi
      var k = norm(pick.t.tema);
      stato[k] = (stato[k] || 0) + 1;
      lastTipo[k] = pick.tipo;
      plan.push({
        argomento: pick.t.tema,
        tipo: pick.tipo,
        difficolta: clamp((opts.difficoltaByTema && opts.difficoltaByTema[k]), 1, 3, TIPO_DIFFICOLTA[pick.tipo]),
        motivo: "debolezza:livello " + pick.t.livello + " · " + (pick.t.tipo_errore || ERRORE_DEFAULT)
      });
    }

    // Argomenti nuovi (mai visti nel diario) o pilastri del programma
    // (fallback senza memoria): distribuiti a intervalli fissi.
    if (newSlots && blueprint.length) {
      var known = {};
      weak.forEach(function (t) { known[norm(t.tema)] = true; });
      var fresh = blueprint.filter(function (b) { return !known[norm(b.argomento)]; })
        .sort(function (a, b) { return b.importanza - a.importanza; });
      if (fresh.length) {
        var step = Math.max(1, Math.floor((n + 1) / (newSlots + 1)));
        var idx = 0;
        for (var j = 0; j < newSlots; j++) {
          var topic = fresh[idx % fresh.length];
          idx += 1;
          var ntipo = ["esposizione", "distinzione", "caso"][j % 3];
          var item = {
            argomento: topic.argomento,
            tipo: ntipo,
            difficolta: TIPO_DIFFICOLTA[ntipo],
            motivo: fallback ? "primo-allenamento" : "nuovo-argomento"
          };
          if (!plan.length) {
            // Fallback senza memoria: il piano è vuoto → si appende in ordine
            // di importanza (i pilastri prima gli importanti, mai invertiti).
            plan.push(item);
          } else {
            var slotPos = Math.min(plan.length, step * (j + 1) - 1);
            plan.splice(Math.max(0, slotPos), 0, item);
          }
        }
      }
    }

    return plan.slice(0, n);
  }

  /* --------------------------- Quality-gate (§15/§24.3) ------------------ */
  // Validazione deterministica di una domanda generata. Restituisce
  // { valid, issues[] }. Regole: un solo oggetto, lunghezza, tipo ∈ insieme,
  // argomento presente (e ∈ elenco ammesso se fornito), niente markdown,
  // niente \"elencare\", niente doppie domande (\">1 ?\"), difficoltà 1-3.
  function validateQuestion(q, opts) {
    opts = opts || {};
    var issues = [];
    if (!q || typeof q !== "object") return { valid: false, issues: ["oggetto mancante"] };

    var testo = str(q.testo);
    if (testo.length < MIN_TESTO) issues.push("testo troppo corto (<" + MIN_TESTO + ")");
    if (testo.length > MAX_TESTO) issues.push("testo troppo lungo (>" + MAX_TESTO + ")");
    if ((testo.match(/\?/g) || []).length !== 1) issues.push("deve contenere una sola domanda (un solo ?)");
    if (testo.indexOf("**") !== -1) issues.push("niente markdown (asterischi)");
    if (/\belenca(re|ndo)?\b|\bellenca\b/i.test(testo)) issues.push("evita 'elencare': un orale chiede di spiegare");
    if (TYPES.indexOf(q.tipo) === -1) issues.push("tipo non valido: " + str(q.tipo));

    var arg = str(q.argomento);
    if (!arg) issues.push("argomento mancante");
    // Confronto normalizzato (minuscole, spazi collassati): il modello può
    // restituire "Diritto Amministrativo " vs "Diritto amministrativo" —
    // un match esatto sarebbe un falso rifiuto.
    if (opts.argomenti && arg && arrayFrom(opts.argomenti).indexOf(arg) === -1) {
      var allowedNorm = arrayFrom(opts.argomenti).map(norm);
      if (allowedNorm.indexOf(norm(arg)) === -1) {
        issues.push("argomento fuori programma: " + arg);
      }
    }
    var diff = Number(q.difficolta);
    if (!isFinite(diff) || diff < 1 || diff > 3) issues.push("difficolta deve essere 1-3");

    return { valid: !issues.length, issues: issues };
  }

  /* ------------------------------ Export -------------------------------- */
  return {
    TYPES: TYPES,
    W_REAL: W_REAL,
    W_ALL: W_ALL,
    SPACING_LADDER: SPACING_LADDER,
    TIPO_DIFFICOLTA: TIPO_DIFFICOLTA,
    planRealistic: planRealistic,
    planTraining: planTraining,
    buildBlueprint: buildBlueprint,
    normalizeBlueprint: normalizeBlueprint,
    weakTopics: weakTopics,
    mapErroreToTipo: mapErroreToTipo,
    preferredTypes: preferredTypes,
    spacingGain: spacingGain,
    debolezza: debolezza,
    validateQuestion: validateQuestion
  };
});
