// ============================================================
// ConcorsoAI — Proxy serverless verso BluesMinds (v4)
// ============================================================
// Cambiamenti rispetto a v3:
//   1) SUPABASE_ANON_KEY: fallback hardcoded con chiave reale.
//      Env var resta prioritaria (rotazione 1-click da Vercel).
// ============================================================
// Cambiamenti rispetto a v2:
//   1) Rispetta la preferenza di stream del client:
//      - stream: true (o non specificato) -> SSE forward
//      - stream: false                    -> bufferizza upstream SSE
//                                            e ritorna JSON OpenAI-compat
//   [Nota: la SUPABASE_ANON_KEY fail-closed di v2 è stata sostituita
//    dal fallback hardcoded introdotto in v4 — vedi sopra.]
//   2) Rate limit Map: sweep periodica ogni 60s rimuove record scaduti
//      per evitare memory leak su istanze warm.
//   3) Auth check + body validation identici a v2 (mantiene sicurezza).
// ============================================================

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto'); // TURNO 33: hash per log metric (no PII)

// --- Config: accetta SUPABASE_ANON_KEY o SUPABASE_KEY come env var ---
function resolveAnonKey() {
  return process.env.SUPABASE_ANON_KEY
    || process.env.SUPABASE_KEY
    || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';
}
function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || 'https://xhifnparcouxsypkjcmn.supabase.co';
  const anonKey = resolveAnonKey();
  if (!process.env.SUPABASE_URL) {
    console.warn('[ConcorsoAI] SUPABASE_URL non configurata in process.env. Definisci SUPABASE_URL e SUPABASE_ANON_KEY per override.');
  }
  return { url, anonKey };
}
const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = getSupabaseConfig();
const BLUESMINDS_URL = 'https://api.bluesminds.com/v1/chat/completions';
const UPSTREAM_TIMEOUT_MS = 30000;
const FIXED_MODEL = 'deepseek-v4-flash';
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_PER_WINDOW = 30; // per IP (uno IP puó essere molti utenti dietro NAT)
const RATE_LIMIT_MAX_PER_WINDOW_PER_USER = 60; // TURNO 31: per user (piú generoso del per-IP)
const RATE_LIMIT_SWEEP_INTERVAL_MS = 60 * 1000;

// --- CORS whitelist ---
const ALLOWED_ORIGINS = [
  'https://concorso-ai.vercel.app',
  'https://concorsoai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500'
];

// --- Rate limit (in-memory, con sweep) ---
const rateLimits = new Map();
const userRateLimits = new Map(); // TURNO 31: per-user rate limit

// Sweep periodica: rimuove record scaduti dalla Map.
// Necessaria per evitare memory leak su istanze warm (Vercel serverless).
// TURNO 31: estesa per pulire anche userRateLimits.
const rateLimitSweep = setInterval(function () {
  const now = Date.now();
  for (const [ip, record] of rateLimits) {
    if (record.resetAt < now) rateLimits.delete(ip);
  }
  for (const [uid, record] of userRateLimits) {
    if (record.resetAt < now) userRateLimits.delete(uid);
  }
}, RATE_LIMIT_SWEEP_INTERVAL_MS);
// Evita che il timer tenga vivo il processo Node se moduli parent terminano
if (typeof rateLimitSweep.unref === 'function') rateLimitSweep.unref();

// --- Rate limit helpers (TURNO 32: estratta funzione generica) ---
// Logica comune per checkRateLimit/checkUserRateLimit. Le 2 funzioni
// specifiche sono thin wrapper che passano Map + max corretti.
function checkRateLimitMap(map, key, max) {
  const now = Date.now();
  const record = map.get(key);
  if (!record || record.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: max - 1 };
  }
  if (record.count >= max) {
    return { ok: false, remaining: 0, retryAfterMs: record.resetAt - now };
  }
  record.count++;
  return { ok: true, remaining: max - record.count };
}

// Wrapper thin: limite per IP (30/min). Limite piú stretto del per-user
// perché un IP puó rappresentare piú utenti (NAT, proxy, ecc.).
function checkRateLimit(ip) {
  return checkRateLimitMap(rateLimits, ip, RATE_LIMIT_MAX_PER_WINDOW);
}

// Wrapper thin: limite per user (60/min). Limite piú generoso del per-IP
// perché un utente legittimo puó trovarsi dietro NAT condiviso con altri.
// Previene abusi da singolo account anche se bypassa il limite per-IP.
function checkUserRateLimit(userId) {
  return checkRateLimitMap(userRateLimits, userId, RATE_LIMIT_MAX_PER_WINDOW_PER_USER);
}

// --- CORS helper ---
// --- Metriche logging (TURNO 33) ---
// Prefisso [ConcorsoAI-METRIC] per filtering facile in log aggregator.
// userId/IP hash prime 8 char di sha256 (no PII, no PII reversal possibile).
// Caveat: 8 hex = 32 bit → collisioni birthday paradox a ~65k utenti/IP.
// Non usare per conteggi esatti, solo per trend e cardinality approssimata.
function hashUserId(userId) {
  if (!userId) return 'anon';
  return crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 8);
}

function hashIp(ip) {
  if (!ip) return 'unknown';
  return crypto.createHash('sha256').update(String(ip)).digest('hex').slice(0, 8);
}

function logMetric(event, fields) {
  const payload = Object.assign({
    ts: new Date().toISOString(),
    route: '/api/chat',
    event: event
  }, fields || {});
  try { console.log('[ConcorsoAI-METRIC] ' + JSON.stringify(payload)); }
  catch (_) { /* swallow: logging non deve mai crashare la response */ }
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.indexOf(origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
}

// --- Input validation (pure: nessuna mutazione di req.body) ---
function validateBody(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, status: 400, error: 'Body non valido' };
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, status: 400, error: 'messages deve essere array non vuoto' };
  }
  if (body.messages.length > 50) {
    return { ok: false, status: 400, error: 'messages troppo lungo (max 50)' };
  }
  const allowedRoles = new Set(['system', 'user', 'assistant']);
  for (const msg of body.messages) {
    if (!msg || typeof msg !== 'object') {
      return { ok: false, status: 400, error: 'messaggio non valido' };
    }
    if (!allowedRoles.has(msg.role)) {
      return { ok: false, status: 400, error: 'role non consentito: ' + msg.role };
    }
    if (typeof msg.content !== 'string') {
      return { ok: false, status: 400, error: 'content deve essere stringa' };
    }
    if (msg.content.length > 8000) {
      return { ok: false, status: 400, error: 'content troppo lungo (max 8000 char per messaggio)' };
    }
  }
  if (body.temperature !== undefined) {
    const t = Number(body.temperature);
    if (!Number.isFinite(t) || t < 0 || t > 1.5) {
      return { ok: false, status: 400, error: 'temperature fuori range [0, 1.5]' };
    }
    // pure check: req.body resta immutato, forwardBody usa spread
  }
  if (body.max_tokens !== undefined) {
    const m = Number(body.max_tokens);
    if (!Number.isFinite(m) || m < 50 || m > 800) {
      return { ok: false, status: 400, error: 'max_tokens fuori range [50, 800]' };
    }
    // pure check: req.body resta immutato, forwardBody usa spread
  }
  return { ok: true };
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.socket && req.socket.remoteAddress || req.connection && req.connection.remoteAddress || 'unknown';
}

// ============================================================
// Handler principale (v3: dual-mode)
// ============================================================
module.exports = async function handler(req, res) {
  try {
    return await handleRequest(req, res);
  } catch (e) {
    const msg = String(e && e.message || e);
    console.error('[chat] unhandled error:', msg);
    if (!res.headersSent) {
      try { return res.status(500).json({ error: 'Errore interno server', details: msg }); } catch (_) { /* niente */ }
    }
  }
};

async function handleRequest(req, res) {
  setCorsHeaders(req, res);
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito. Usa POST.' });
  }

  // 1) DIFESA IN PROFONDITÀ: ora SUPABASE_ANON_KEY ha fallback hardcoded
  //    (vedi v4 changelog in cima al file), ma se qualcuno rimuove sia
  //    env var sia fallback (es. refactor accidentale) vogliamo bloccare
  //    qui invece di crashare in modo silenzioso dentro Supabase auth.
  if (!SUPABASE_ANON_KEY) {
    logMetric('config_error', { reason: 'supabase_anon_key_missing' });
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'SUPABASE_ANON_KEY mancante sia come env var sia come fallback hardcoded'
    });
  }

  // 2) Auth Supabase (deve venire PRIMA del rate limit)
  const authHeader = req.headers.authorization || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    logMetric('auth_fail', { reason: 'missing_bearer' });
    return res.status(401).json({ error: 'Token di autenticazione mancante' });
  }
  const userJwt = tokenMatch[1].trim();

  let supabaseUser = null;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });
    const { data, error } = await supabase.auth.getUser(userJwt);
    if (error || !data || !data.user) {
      logMetric('auth_fail', { reason: 'supabase_rejected' });
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }
    supabaseUser = data.user;
  } catch (authErr) {
    const errType = (authErr && (authErr.name || authErr.code)) || 'unknown';
    logMetric('auth_fail', { reason: 'supabase_throw', errType: errType });
    return res.status(401).json({ error: 'Verifica auth fallita' });
  }

  // 3) Rate limit per IP
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  if (!rate.ok) {
    res.setHeader('Retry-After', String(Math.ceil(rate.retryAfterMs / 1000)));
    logMetric('rate_limit', { scope: 'ip', ip: hashIp(ip), retryAfterS: Math.ceil(rate.retryAfterMs / 1000) });
    return res.status(429).json({
      error: 'Troppe richieste',
      details: 'Limite di ' + RATE_LIMIT_MAX_PER_WINDOW + ' richieste al minuto. Riprova tra ' + Math.ceil(rate.retryAfterMs / 1000) + 's'
    });
  }

  // 3b) Rate limit per user (TURNO 31) — dopo auth, previene abusi
  //     da singolo account anche se bypassa il limite per-IP (NAT condiviso).
  const userRate = checkUserRateLimit(supabaseUser.id);
  res.setHeader('X-UserRateLimit-Remaining', String(userRate.remaining));
  if (!userRate.ok) {
    res.setHeader('Retry-After', String(Math.ceil(userRate.retryAfterMs / 1000)));
    logMetric('rate_limit', { scope: 'user', userId: hashUserId(supabaseUser.id), retryAfterS: Math.ceil(userRate.retryAfterMs / 1000) });
    return res.status(429).json({
      error: 'Troppe richieste per utente',
      details: 'Limite di ' + RATE_LIMIT_MAX_PER_WINDOW_PER_USER + ' richieste al minuto per utente. Riprova tra ' + Math.ceil(userRate.retryAfterMs / 1000) + 's'
    });
  }

  // 4) API key BluesMinds
  const apiKey = process.env.BLUESMINDS_API_KEY;
  if (!apiKey) {
    logMetric('config_error', { reason: 'bluesminds_api_key_missing' });
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'Variabile BLUESMINDS_API_KEY mancante su Vercel'
    });
  }

  // 5) Body validation
  const v = validateBody(req.body);
  if (!v.ok) {
    logMetric('validation_fail', { reason: v.error });
    return res.status(v.status).json({ error: v.error });
  }

  // 6) Decide modalita: stream vs buffer
  const wantsStream = req.body.stream === true;

  // 7) Forward verso BluesMinds
  const forwardBody = { ...req.body, model: FIXED_MODEL, stream: true };
  const controller = new AbortController();
  const timeoutId = setTimeout(function () { controller.abort(); }, UPSTREAM_TIMEOUT_MS);
  let upstream;
  try {
    upstream = await fetch(BLUESMINDS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey.trim()
      },
      body: JSON.stringify(forwardBody),
      signal: controller.signal
    });
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    if (fetchErr && fetchErr.name === 'AbortError') {
      logMetric('upstream_timeout', { userId: hashUserId(supabaseUser.id) });
      return res.status(504).json({ error: 'Timeout upstream', details: 'BluesMinds non ha risposto entro ' + (UPSTREAM_TIMEOUT_MS / 1000) + 's' });
    }
    logMetric('upstream_fetch_fail', { userId: hashUserId(supabaseUser.id), errType: (fetchErr && (fetchErr.name || fetchErr.code)) || 'unknown' });
    return res.status(502).json({ error: 'Fetch upstream fallita', details: fetchErr.message || String(fetchErr) });
  }

  if (!upstream.ok) {
    clearTimeout(timeoutId);
    let errBody;
    try { errBody = await upstream.json(); } catch (_) {
      try { errBody = { error: await upstream.text() }; } catch (__) { errBody = {}; }
    }
    logMetric('upstream_status_error', { userId: hashUserId(supabaseUser.id), status: upstream.status });
    return res.status(upstream.status).json({ error: 'Upstream error', details: errBody });
  }

  // 8) MODALITA NON-STREAM (legacy client): bufferizza SSE upstream in JSON
  if (!wantsStream) {
    try {
      const finalContent = await bufferSseStreamToContent(upstream.body, controller, timeoutId);
      return res.status(200).json({
        id: 'chatcmpl-buffered-' + Date.now(),
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: FIXED_MODEL,
        choices: [{
          index: 0,
          message: { role: 'assistant', content: finalContent },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      });
    } catch (bufErr) {
      clearTimeout(timeoutId);
      if (bufErr && bufErr.name === 'AbortError') {
        return res.status(504).json({ error: 'Timeout upstream (buffer mode)' });
      }
      return res.status(502).json({ error: 'Buffer mode fallita', details: bufErr.message || String(bufErr) });
    }
  }

  // 9) MODALITA STREAM: pipe SSE al client
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-User-Id': supabaseUser.id
  });
  res.write(': connected\n\n');

  try {
    const reader = upstream.body.getReader();
    let aborted = false;
    const heartbeat = setInterval(function () {
      if (aborted) return;
      try { res.write(': hb\n\n'); } catch (_) { aborted = true; }
    }, 15000);

    try {
      while (true) {
        const r = await reader.read();
        if (r.done) break;
        if (aborted || res.writableEnded) break;
        res.write(Buffer.from(r.value));
      }
    } finally {
      clearInterval(heartbeat);
      clearTimeout(timeoutId);
      reader.releaseLock();
    }
    if (!res.writableEnded) res.end();
  } catch (pipeErr) {
    clearTimeout(timeoutId);
    try {
      if (!res.writableEnded) {
        const errPayload = JSON.stringify({ error: 'Stream interrotto', details: (pipeErr && pipeErr.message) || String(pipeErr) });
        res.write('data: ' + errPayload + '\n\n');
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (_) { /* swallow */ }
  }
};

// --- Helper: buffer SSE upstream in content string ---
async function bufferSseStreamToContent(body, controller, timeoutId) {
  if (!body || !body.getReader) {
    throw new Error('Stream reader non disponibile');
  }
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';
  try {
    while (true) {
      const r = await reader.read();
      if (r.done) break;
      buffer += decoder.decode(r.value, { stream: true });

      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const trimmed = chunk.trim();
        if (!trimmed || trimmed.charAt(0) === ':') continue;
        if (trimmed.indexOf('data:') !== 0) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === '[DONE]') break;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content;
          if (typeof delta === 'string' && delta.length) content += delta;
        } catch (_) { /* ignora chunk malformato */ }
      }
    }
  } finally {
    reader.releaseLock();
    clearTimeout(timeoutId);
  }
  return content;
}
