// ============================================================
// ConcorsoAI — Memoria di apprendimento (logica pura)
// ============================================================
// Nessuna I/O, nessuna dipendenza: funzioni pure testabili.
//
// La memoria è una struttura SINTETICA, mai conversazioni intere:
//   { temi: [{ tema, livello(1-5), note, occorrenze, ultima, stato }],
//     abitudini: [{ descrizione, livello }],
//     progressi: [{ tema, descrizione }],
//     aggiornata }
//
// - `temi` è il diario degli errori: livello = debolezza residua.
//   stato 'superato' quando livello <= 2 ("quell'errore sparisce").
// - `abitudini` = pattern di comportamento (parla troppo in fretta…).
// - `progressi` = miglioramenti riconosciuti (feedback visibile).
//
// Regole di costo: array dimensionati (temi ≤ 24, abitudini ≤ 8,
// progressi ≤ 10), stringhe troncate. Un utente Pro "costruisce"
// memoria a ogni simulazione ma il dato resta minuscolo.
// ============================================================

var MAX_TEMI = 24;
var MAX_ABITUDINI = 8;
var MAX_PROGRESSI = 10;
var MAX_NOTE = 180;
var MAX_TEMA = 80;
var MAX_DESC = 140;

function emptyMemory() {
  return { temi: [], abitudini: [], progressi: [], aggiornata: null };
}

function nowISO() {
  return new Date().toISOString();
}

function clampInt(v, min, max, fallback) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clampStr(v, maxLen) {
  var s = String(v == null ? '' : v).trim();
  if (!s) return '';
  return s.slice(0, maxLen);
}

function normKey(s) {
  return clampStr(s, 64).toLowerCase().replace(/\s+/g, ' ');
}

// Sanifica un output del modello (o un payload) nella forma canonica.
// Non modifica l'input: restituisce un oggetto nuovo.
function sanitizeMemory(raw) {
  var out = emptyMemory();
  if (!raw || typeof raw !== 'object') return out;

  var seenTemi = {};
  if (Array.isArray(raw.temi)) {
    raw.temi.forEach(function (t) {
      if (!t || typeof t !== 'object') return;
      var tema = clampStr(t.tema, MAX_TEMA);
      if (!tema) return;
      var k = normKey(tema);
      if (seenTemi[k]) return; // dedupe case-insensitive
      seenTemi[k] = true;
      var livello = clampInt(t.livello, 1, 5, 3);
      out.temi.push({
        tema: tema,
        livello: livello,
        note: clampStr(t.note, MAX_NOTE),
        occorrenze: Math.max(1, clampInt(t.occorrenze, 1, 999, 1)),
        ultima: typeof t.ultima === 'string' && t.ultima ? t.ultima : nowISO(),
        stato: livello <= 2 ? 'superato' : 'attivo'
      });
    });
  }

  var seenAb = {};
  if (Array.isArray(raw.abitudini)) {
    raw.abitudini.forEach(function (a) {
      if (!a || typeof a !== 'object') return;
      var descrizione = clampStr(a.descrizione, MAX_DESC);
      if (!descrizione) return;
      var k = normKey(descrizione);
      if (seenAb[k]) return;
      seenAb[k] = true;
      out.abitudini.push({
        descrizione: descrizione,
        livello: clampInt(a.livello, 1, 5, 3)
      });
    });
  }

  var seenPr = {};
  if (Array.isArray(raw.progressi)) {
    raw.progressi.forEach(function (p) {
      if (!p || typeof p !== 'object') return;
      var tema = clampStr(p.tema, MAX_TEMA);
      var descrizione = clampStr(p.descrizione, MAX_DESC);
      if (!tema && !descrizione) return;
      var k = normKey(tema || descrizione);
      if (seenPr[k]) return;
      seenPr[k] = true;
      out.progressi.push({ tema: tema, descrizione: descrizione });
    });
  }

  return out;
}

// Fondi la memoria esistente con l'aggiornamento restituito dal modello
// (che riceve la memoria completa e risponde con quella aggiornata).
// Sicurezza: occorrenze deterministiche (niente fede cieca al modello),
// timestamp aggiornati, eviction LRU sui temi che sforano il cap.
function mergeMemory(current, update) {
  var base = sanitizeMemory(current);
  var upd = sanitizeMemory(update);
  var now = nowISO();

  var out = emptyMemory();
  out.aggiornata = now;

  var byKey = {};
  base.temi.forEach(function (t) { byKey[normKey(t.tema)] = t; });

  var updKeys = {};
  upd.temi.forEach(function (t) {
    var k = normKey(t.tema);
    updKeys[k] = true;
    var prev = byKey[k];
    t.occorrenze = prev ? (prev.occorrenze || 1) + 1 : 1;
    t.ultima = now;
    t.stato = t.livello <= 2 ? 'superato' : 'attivo';
    byKey[k] = t;
  });

  // DECAY — la memoria deve saper "dimenticare" (brief: quando migliori,
  // quell'errore sparisce). Il modello è istruito a rimuovere i temi
  // superati; se un tema NON compare nell'update, la debolezza si sta
  // attenuando → decadimento di 1 livello. Sotto soglia → 'superato'.
  // Questo realizza la promessa del prodotto senza però azzerare il diario
  // su un glitch del modello (niente rimozioni violente).
  Object.keys(byKey).forEach(function (k) {
    if (updKeys[k]) return;
    var t = byKey[k];
    t.livello = Math.max(1, (Number(t.livello) || 3) - 1);
    t.stato = t.livello <= 2 ? 'superato' : 'attivo';
  });

  out.temi = Object.keys(byKey).map(function (k) { return byKey[k]; });

  // Eviction: i temi attivi sono prioritari; i superati sono i primi a
  // uscire quando il diario sfora il cap (mantiene il dato minuscolo).
  if (out.temi.length > MAX_TEMI) {
    out.temi.sort(function (a, b) {
      var aActive = a.stato === 'attivo' ? 1 : 0;
      var bActive = b.stato === 'attivo' ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return (b.occorrenze || 1) - (a.occorrenze || 1);
    });
    out.temi = out.temi.slice(0, MAX_TEMI);
  }

  // Ordine diario: debolezza attiva prima, poi per livello.
  out.temi.sort(function (a, b) {
    var aActive = a.stato === 'attivo' ? 1 : 0;
    var bActive = b.stato === 'attivo' ? 1 : 0;
    if (aActive !== bActive) return bActive - aActive;
    return (b.livello || 0) - (a.livello || 0);
  });

  out.abitudini = upd.abitudini.slice(0, MAX_ABITUDINI);
  out.progressi = upd.progressi.slice(0, MAX_PROGRESSI);

  return out;
}

// I temi su cui allenarsi: attivi, con livello di debolezza >= 3.
// Restituisce i nomi (stringhe), ordinati per priorità.
function topWeakTopics(memory, k) {
  var mem = sanitizeMemory(memory);
  var weak = mem.temi
    .filter(function (t) { return t.stato === 'attivo' && t.livello >= 3; })
    .sort(function (a, b) {
      if (b.livello !== a.livello) return b.livello - a.livello;
      return (b.occorrenze || 1) - (a.occorrenze || 1);
    });
  var limit = Math.max(1, parseInt(k, 10) || 4);
  return weak.slice(0, limit).map(function (t) { return t.tema; });
}

module.exports = {
  emptyMemory,
  sanitizeMemory,
  mergeMemory,
  topWeakTopics,
  MAX_TEMI: MAX_TEMI,
  MAX_ABITUDINI: MAX_ABITUDINI,
  MAX_PROGRESSI: MAX_PROGRESSI
};
