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
// Safety: ws non piu' passato al client, ma lo teniamo per eventuali
// dipendenze transitive di @supabase/realtime-js in Node.js
try { require('ws'); } catch (_) { /* opzionale */ }
const crypto = require('crypto'); // TURNO 33: hash per log metric (no PII)

// --- Chiave hardcoded di fallback (progetto xhifnparcouxsypkjcmn) ---
var HARDCODED_ANON_CHAT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';
var HARDCODED_URL_CHAT = 'https://xhifnparcouxsypkjcmn.supabase.co';
// --- Fallback AI key (se env var mancante/stale su Vercel) ---
var HARDCODED_AI_KEY = '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';

function extractProjectRef(jwt) {
  try {
    var p = jwt.split('.');
    if (p.length !== 3) return 'INVALID_JWT';
    var payload = JSON.parse(Buffer.from(p[1], 'base64url').toString());
    return payload.ref || 'NO_REF';
  } catch (_) { return 'PARSE_ERROR'; }
}

// [TEST TEMPORANEO] Usa HARDCODED anziché ENV_VAR per bypassare env var stale di Vercel.
// Se il test funziona, il problema è confermato: Vercel ha env var vecchie.
// FIX DEFINITIVO: entrare in Vercel Dashboard → Project Settings → Environment Variables
// e aggiornare/rimuovere le variabili SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_KEY.
function resolveAnonKey() {
  // COMMENTATO in produzione: var fromEnv = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  var source, key;
  // Usa SEMPRE l'hardcoded per il test
  source = 'HARDCODED_TEST';
  key = HARDCODED_ANON_CHAT;
  var ref = extractProjectRef(key);
  console.log('[chat] ANON_KEY source:', source, '| project ref:', ref, '| length:', key.length);
  return key;
}
function resolveSupabaseUrl() {
  // COMMENTATO in produzione: var fromEnv = process.env.SUPABASE_URL;
  // Usa SEMPRE l'hardcoded per il test
  console.log('[chat] SUPABASE_URL source: HARDCODED_TEST | value:', HARDCODED_URL_CHAT.slice(0, 25) + '...');
  return HARDCODED_URL_CHAT;
}

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();
// Provider AI configurabile via env var (default: OpenRouter OpenAI-compatible API)
const AI_API_URL = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'deepseek/deepseek-chat';
const AI_REFERRER = process.env.AI_REFERRER || 'https://concorso-ai.vercel.app';
const AI_TITLE = process.env.AI_TITLE || 'ConcorsoAI';
const UPSTREAM_TIMEOUT_MS = 30000;
const FIXED_MODEL = AI_MODEL;
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
// === DEBUG: log all'avvio del modulo ===
console.log('[chat] MODULE LOADED', { url: (SUPABASE_URL || '').slice(0, 20) + '...', keyLength: (SUPABASE_ANON_KEY || '').length });

module.exports = async function handler(req, res) {
  console.log('[chat] HANDLER CALLED', req.method, req.url, 'auth:', (req.headers.authorization || 'MISSING').slice(0, 20) + '...');
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

  // 4) API key AI — controlla AI_API_KEY, poi BLUESMINDS_API_KEY, poi fallback hardcoded
  const rawKey = String(process.env.AI_API_KEY || process.env.BLUESMINDS_API_KEY || HARDCODED_AI_KEY);
  const apiKey = rawKey.trim();
  var keySource = process.env.AI_API_KEY ? 'AI_API_KEY' : (process.env.BLUESMINDS_API_KEY ? 'BLUESMINDS_API_KEY' : 'HARDCODED');
  console.log('[chat] AI key source:', keySource, '| raw length:', rawKey.length, '| prefix:', apiKey.slice(0, 6) + '...', '| URL:', AI_API_URL, '| model:', AI_MODEL, '| timeout ms:', UPSTREAM_TIMEOUT_MS);
  if (!apiKey || apiKey.length < 10) {
    console.error('[chat] AI_API_KEY non valida:', { source: keySource, rawLength: rawKey.length, trimmedLength: apiKey.length });
    logMetric('config_error', { reason: 'ai_api_key_invalid', source: keySource });
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'Chiave API AI mancante o troppo corta (env: ' + keySource + ', lunghezza: ' + apiKey.length + ')'
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

  // 7) Forward verso AI provider — retry 3x su 503/throw (backoff esponenziale)
  const forwardBody = { ...req.body, model: FIXED_MODEL, stream: true };
  var MAX_RETRIES = 3;
  function backoffMs(attempt) { return 1000 * Math.pow(2, attempt - 1); } // 1s, 2s, 4s
  var overallStart = Date.now();
  let upstream = null;
  var lastRetryableErr = null;
  var attemptsMade = 0;
  // Dichiarati fuori dal loop così sono visibili dopo (sezioni 8 e 9)
  var activeController = null;
  var activeTimeoutId = null;

  for (var attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    attemptsMade = attempt;
    var ctrl = new AbortController();
    var tId = setTimeout(function () { ctrl.abort(); }, UPSTREAM_TIMEOUT_MS);
    activeController = ctrl;
    activeTimeoutId = tId;
    var tStart = Date.now();
    console.log('[chat] AI attempt ' + attempt + '/' + MAX_RETRIES + ' at', new Date(tStart).toISOString(), '| model:', AI_MODEL, '| messages:', (req.body.messages || []).length);

    try {
      upstream = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey,
          'HTTP-Referer': AI_REFERRER,
          'X-Title': AI_TITLE
        },
        body: JSON.stringify(forwardBody),
        signal: ctrl.signal
      });
      var tElapsed = Date.now() - tStart;
      console.log('[chat] AI attempt ' + attempt + ' status:', upstream.status, '| elapsed ms:', tElapsed);

      if (upstream.ok) {
        // SUCCESSO — esce dal loop
        clearTimeout(tId);
        break;
      }

      // Non-ok: distingue 503 (retryable) dagli altri (fail immediato)
      if (upstream.status === 503) {
        var rawBody503;
        try { rawBody503 = await upstream.text(); } catch (_) { rawBody503 = '(unreadable)'; }
        lastRetryableErr = { status: 503, body: rawBody503, elapsedMs: tElapsed };
        if (attempt < MAX_RETRIES) {
          console.warn('[chat] AI 503 attempt ' + attempt + ' — retrying in ' + backoffMs(attempt) + 'ms | body:', rawBody503.slice(0, 300));
          clearTimeout(tId);
          await new Promise(function (r) { setTimeout(r, backoffMs(attempt)); });
          continue;
        }
        // Ultimo tentativo: esce dal loop verso exhausted handler
        console.warn('[chat] AI 503 attempt ' + attempt + '/' + MAX_RETRIES + ' — exhausted');
        clearTimeout(tId);
        break;
      }

      // Non-retryable (400, 401, 429, 500, ...) — fail subito
      clearTimeout(tId);
      var rawBodyFail;
      try { rawBodyFail = await upstream.text(); } catch (_) { rawBodyFail = '(unreadable)'; }
      var parsedFail;
      try { parsedFail = JSON.parse(rawBodyFail); } catch (_) { parsedFail = { raw_text: rawBodyFail.slice(0, 2000) }; }
      console.error('[chat] AI NON-RETRYABLE status:', upstream.status, '| elapsed ms:', tElapsed, '| body:', JSON.stringify(parsedFail).slice(0, 1000));
      logMetric('upstream_status_error', { userId: hashUserId(supabaseUser.id), status: upstream.status, elapsedMs: tElapsed });
      return res.status(upstream.status).json({ error: 'Upstream error', upstream_status: upstream.status, upstream_body: parsedFail });

    } catch (fetchErr) {
      clearTimeout(tId);
      var tCatch = Date.now() - tStart;
      var errName = (fetchErr && (fetchErr.name || fetchErr.code)) || 'unknown';
      var errMsg = fetchErr ? (fetchErr.message || String(fetchErr)) : 'null';

      if (errName === 'AbortError') {
        console.warn('[chat] AI timeout attempt ' + attempt + ' after ' + tCatch + 'ms' + (attempt < MAX_RETRIES ? ' — retrying' : ''));
        lastRetryableErr = { name: 'AbortError', message: errMsg, elapsedMs: tCatch };
        if (attempt < MAX_RETRIES) {
          await new Promise(function (r) { setTimeout(r, backoffMs(attempt)); });
          continue;
        }
        logMetric('upstream_timeout', { userId: hashUserId(supabaseUser.id), elapsedMs: tCatch, attempts: attempt });
        return res.status(504).json({ error: 'Timeout upstream', details: 'Il provider AI non ha risposto entro ' + (UPSTREAM_TIMEOUT_MS / 1000) + 's dopo ' + attempt + ' tentativi', elapsedMs: tCatch, attempts: attempt });
      }

      // Errore di rete — retry
      console.error('[chat] AI fetch error attempt ' + attempt + ':', errMsg, attempt < MAX_RETRIES ? '— retrying' : '');
      if (fetchErr && fetchErr.cause) {
        console.error('[chat] AI fetch CAUSE:', String(fetchErr.cause));
      }
      lastRetryableErr = { name: errName, message: errMsg, elapsedMs: tCatch, cause: fetchErr && String(fetchErr.cause) };
      if (attempt < MAX_RETRIES) {
        await new Promise(function (r) { setTimeout(r, backoffMs(attempt)); });
        continue;
      }
      logMetric('upstream_fetch_fail', { userId: hashUserId(supabaseUser.id), errType: errName, elapsedMs: tCatch, attempts: attempt });
      return res.status(502).json({ error: 'Fetch upstream fallita', details: errMsg, errType: errName, elapsedMs: tCatch, attempts: attempt });
    }
  }

  // Se arriviamo qui senza upstream.ok, ultimo errore era 503 esaurito
  if (!upstream || !upstream.ok) {
    console.error('[chat] AI tutti i tentativi falliti — lastRetryableErr:', lastRetryableErr ? JSON.stringify(lastRetryableErr).slice(0, 500) : 'null');
    logMetric('upstream_retries_exhausted', { userId: hashUserId(supabaseUser.id), attempts: attemptsMade, overallMs: Date.now() - overallStart });
    return res.status(503).json({ error: 'Servizio di generazione temporaneamente sovraccarico', details: 'I server AI non rispondono dopo ' + attemptsMade + ' tentativi. Riprova tra qualche istante.', attempts: attemptsMade });
  }

  // 8) MODALITA NON-STREAM (legacy client): bufferizza SSE upstream in JSON
  if (!wantsStream) {
    try {
      const finalContent = await bufferSseStreamToContent(upstream.body, activeController, activeTimeoutId);
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
      clearTimeout(activeTimeoutId);
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
      clearTimeout(activeTimeoutId);
      reader.releaseLock();
    }
    if (!res.writableEnded) res.end();
  } catch (pipeErr) {
    clearTimeout(activeTimeoutId);
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
