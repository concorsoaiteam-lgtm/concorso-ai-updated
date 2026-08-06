// ============================================================
// ConcorsoAI — Memoria di apprendimento (Pro; attiva per tutti
// nella fase pre-Stripe)
// ============================================================
// POST /api/memory  { sessione: { voto, dimensioni, punti_forti,
//                     deboli, argomenti, materia, durata_min } }
//   → aggiorna la memoria sintetica dell'utente usando il MODELLO
//     PICCOLO (AI_MEMORY_MODEL — economico e veloce, mai il modello
//     grande). Salva SOLO la memoria, mai le conversazioni.
// GET  /api/memory  → la memoria attuale (o vuota).
//
// Fail-open: se il modello o il DB falliscono, la simulazione non
// deve mai rompersi — si restituisce la memoria esistente.
// ============================================================

const auth = require('./_lib/auth');
const mem = require('./_lib/memory');
const { callCompletions } = require('./_lib/ai');
const crypto = require('crypto');

const AI_MEMORY_MODEL = process.env.AI_MEMORY_MODEL || 'deepseek/deepseek-chat';
const MEMORY_RATE_LIMIT_PER_HOUR = 15; // update/ora per utente (il modello è a pagamento)
const memoryRateLimits = new Map(); // per-user, sliding hour
const memoryLocks = new Map();      // serializza gli update per user (niente lost-update)

function hourKey() { return Math.floor(Date.now() / 3600000); }

function hashUserId(uid) {
  return crypto.createHash('sha256').update(String(uid)).digest('hex').slice(0, 8);
}

function checkMemoryRateLimit(userId) {
  const hk = hourKey();
  const rec = memoryRateLimits.get(userId);
  if (!rec || rec.hk !== hk) {
    memoryRateLimits.set(userId, { hk: hk, count: 1 });
    return { ok: true, count: 1, max: MEMORY_RATE_LIMIT_PER_HOUR };
  }
  if (rec.count >= MEMORY_RATE_LIMIT_PER_HOUR) {
    return { ok: false, count: rec.count, max: MEMORY_RATE_LIMIT_PER_HOUR };
  }
  rec.count += 1;
  return { ok: true, count: rec.count, max: MEMORY_RATE_LIMIT_PER_HOUR };
}

// Sweep periodica: evita memory leak delle mappe in-memory su istanze warm.
const memSweep = setInterval(function () {
  const hk = hourKey();
  for (const [uid, rec] of memoryRateLimits) { if (rec.hk !== hk) memoryRateLimits.delete(uid); }
}, 10 * 60 * 1000);
if (typeof memSweep.unref === 'function') memSweep.unref();

// Read → merge → write atomico per utente: le POST concorrenti sulla stessa
// memoria vengono eseguite in coda (nessuna merge persa).
function withMemoryLock(userId, fn) {
  const prev = memoryLocks.get(userId) || Promise.resolve();
  const next = prev.then(fn, fn);
  memoryLocks.set(userId, next);
  next.finally(function () {
    if (memoryLocks.get(userId) === next) memoryLocks.delete(userId);
  }).catch(function () { /* già gestito dal chiamante */ });
  return next;
}

function logMetric(event, fields) {
  const payload = Object.assign({ ts: new Date().toISOString(), route: '/api/memory', event: event }, fields || {});
  try { console.log('[ConcorsoAI-METRIC] ' + JSON.stringify(payload)); } catch (_) { /* swallow */ }
}

function setCorsHeaders(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// --- Validazione sessione (input shape minimo, mai fede cieca) ---
function cleanList(v, maxLen, fn) {
  if (!Array.isArray(v)) return [];
  return v.slice(0, maxLen).map(fn).filter(Boolean);
}

function validateSession(body) {
  var s = (body && body.sessione) || {};
  var out = {};
  out.voto = (typeof s.voto === 'number' && isFinite(s.voto)) ? Math.max(0, Math.min(10, s.voto)) : null;
  out.materia = String(s.materia || '').trim().slice(0, 80) || null;
  out.durata_min = (typeof s.durata_min === 'number' && isFinite(s.durata_min)) ? Math.max(1, Math.round(s.durata_min)) : null;

  out.punti_forti = cleanList(s.punti_forti, 8, function (p) {
    if (!p || typeof p !== 'object') return null;
    var text = String(p.text || '').trim().slice(0, 300);
    if (!text) return null;
    return { text: text, tag: String(p.tag || '').trim().slice(0, 60) };
  });

  out.deboli = cleanList(s.deboli, 10, function (p) {
    if (!p || typeof p !== 'object') return null;
    var text = String(p.text || '').trim().slice(0, 300);
    if (!text) return null;
    return { text: text, tag: String(p.tag || '').trim().slice(0, 60) };
  });

  out.argomenti = cleanList(s.argomenti, 10, function (a) {
    if (!a || typeof a !== 'object') return null;
    var argomento = String(a.argomento || '').trim().slice(0, 80);
    if (!argomento) return null;
    return { argomento: argomento, media: (typeof a.media === 'number' && isFinite(a.media)) ? Math.max(0, Math.min(10, a.media)) : null };
  });

  out.dimensioni = {};
  ['chiarezza', 'struttura', 'contenuto'].forEach(function (k) {
    var v = s.dimensioni && s.dimensioni[k];
    out.dimensioni[k] = (typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.min(10, v)) : null;
  });

  return out;
}

function sessionToText(s) {
  var lines = [];
  lines.push('Voto medio: ' + (s.voto != null ? s.voto.toFixed(1) : '—') + ' su 10' +
    (s.materia ? ' — materia: ' + s.materia : '') +
    (s.durata_min ? ' — durata: ' + s.durata_min + ' min' : ''));
  var dims = ['chiarezza', 'struttura', 'contenuto'].filter(function (k) { return s.dimensioni[k] != null; })
    .map(function (k) { return k + ': ' + s.dimensioni[k].toFixed(1); });
  if (dims.length) lines.push('Dimensioni valutate: ' + dims.join(', '));
  if (s.punti_forti.length) lines.push('Punti forti: ' + s.punti_forti.map(function (p) { return p.text + (p.tag ? ' [' + p.tag + ']' : ''); }).join(' | '));
  if (s.deboli.length) lines.push('Da lavorare: ' + s.deboli.map(function (p) { return p.text + (p.tag ? ' [' + p.tag + ']' : ''); }).join(' | '));
  if (s.argomenti.length) lines.push('Argomenti con media sotto soglia: ' + s.argomenti.map(function (a) { return a.argomento + ' (media ' + (a.media != null ? a.media.toFixed(1) : '—') + ')'; }).join(' | '));
  return lines.join('\n');
}

const PROMPT_SYSTEM =
  'Sei il coach che aggiorna la memoria di apprendimento di un candidato a un concorso pubblico italiano. ' +
  'La memoria è un oggetto JSON con: temi (array di {tema, livello 1-5 dove 5 = debolezza grave, note, occorrenze, ultima, stato "attivo" o "superato"}), ' +
  'abitudini (array di {descrizione, livello}), progressi (array di {tema, descrizione}). ' +
  'Ricevi la memoria attuale e il riepilogo dell\'ultima simulazione. ' +
  'Aggiorna: alza o abbassa i livelli dei temi esistenti; aggiungi temi nuovi emersi; nelle note indica il PATTERN specifico ' +
  '(es. "confonde silenzio-assenso e silenzio-diniego"); segna come superato (livello 1-2) i temi migliorati; ' +
  'se un tema non è più debole rimuovilo dai temi; aggiungi abitudini ricorrenti (es. "risponde senza struttura"); ' +
  'aggiungi ai progressi i temi in cui si vede un miglioramento reale. ' +
  'Non inventare debolezze che non emergono dal riepilogo. Rispondi SOLO con il JSON della memoria aggiornata, ' +
  'senza markdown, senza testo fuori dal JSON.';

function parseModelJson(content) {
  if (!content) return null;
  var cleaned = String(content).replace(/```json|```/g, '').trim();
  var start = cleaned.indexOf('{');
  var end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) { return null; }
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Usa GET o POST' });
  }

  const authHeader = req.headers.authorization || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return res.status(401).json({ error: 'Token di autenticazione mancante' });
  const jwt = tokenMatch[1].trim();

  let user;
  try {
    const authRes = await auth.verifySupabaseToken(jwt);
    if (authRes.error || !authRes.user) return res.status(401).json({ error: 'Token non valido o scaduto' });
    user = authRes.user;
  } catch (e) {
    logMetric('auth_fail', { reason: 'supabase_throw' });
    return res.status(401).json({ error: 'Verifica auth fallita' });
  }

  // ---- GET: lettura memoria ----
  if (req.method === 'GET') {
    try {
      const sb = auth.userClient(jwt);
      const { data, error } = await sb.from('memoria').select('memoria').eq('user_id', user.id).maybeSingle();
      if (error) {
        logMetric('read_db_error', { code: error.code || 'unknown' });
        return res.status(200).json({ memoria: mem.emptyMemory(), warning: true });
      }
      return res.status(200).json({ memoria: data && data.memoria ? data.memoria : mem.emptyMemory() });
    } catch (e) {
      return res.status(200).json({ memoria: mem.emptyMemory(), warning: true });
    }
  }

  // ---- POST: aggiornamento memoria ----
  const s = validateSession(req.body || {});
  // Chiama il modello SOLO se c'è davvero da imparare: debolezze o argomenti
  // sotto soglia. Il solo voto non aggiunge apprendimento (principio
  // "vale davvero questi token?").
  const hasSignal = s.deboli.length > 0 || s.argomenti.length > 0;
  if (!hasSignal) {
    return res.status(200).json({ memoria: mem.emptyMemory(), aggiornata: false, reason: 'no_signal' });
  }

  // Rate limit per utente: il modello è a pagamento.
  const rl = checkMemoryRateLimit(user.id);
  if (!rl.ok) {
    logMetric('memory_rate_limit', { userId: hashUserId(user.id) });
    return res.status(429).json({
      error: 'Troppi aggiornamenti della memoria',
      details: 'Limite di ' + rl.max + ' aggiornamenti all\'ora. Riprova tra poco.',
      max: rl.max
    });
  }

  // Update serializzati per utente: read → merge → write senza lost-update.
  return withMemoryLock(user.id, async function () {
    // 1) Legge la memoria attuale
    let current = mem.emptyMemory();
    try {
      const sb = auth.userClient(jwt);
      const { data } = await sb.from('memoria').select('memoria').eq('user_id', user.id).maybeSingle();
      if (data && data.memoria) current = data.memoria;
    } catch (_) { /* resta vuota */ }

    // 2) Modello PICCOLO: aggiorna la memoria. Fail-open su qualsiasi errore.
    const userMsg =
      'Memoria attuale (JSON):\n' + JSON.stringify(current) + '\n\n' +
      'Riepilogo dell\'ultima simulazione:\n' + sessionToText(s);

    const aiRes = await callCompletions(
      [{ role: 'system', content: PROMPT_SYSTEM }, { role: 'user', content: userMsg }],
      { model: AI_MEMORY_MODEL, maxTokens: 2500, temperature: 0.2 }
    );

    let merged = current;
    let aggiornata = false;
    if (aiRes.ok) {
      const parsed = parseModelJson(aiRes.content);
      if (parsed) {
        merged = mem.mergeMemory(current, parsed);
        aggiornata = true;
      }
    } else {
      logMetric('memory_model_fail', { reason: aiRes.error ? aiRes.error.slice(0, 120) : 'unknown' });
    }

    // 3) Salva (RLS: riga di proprietà dell'utente). Fail-open se il DB manca.
    try {
      const sb = auth.userClient(jwt);
      await sb.from('memoria').upsert(
        { user_id: user.id, memoria: merged, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    } catch (e) {
      logMetric('memory_write_error', { code: (e && (e.code || e.message)) || 'unknown' });
    }

    logMetric(aggiornata ? 'memory_updated' : 'memory_skipped', {
      temi: merged.temi ? merged.temi.length : 0,
      source: 'small_model'
    });

    return res.status(200).json({ memoria: merged, aggiornata: aggiornata });
  });
};
