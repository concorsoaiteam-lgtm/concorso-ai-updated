// ============================================================
// ConcorsoAI — Proxy serverless verso il provider AI (OpenAI-compatible)
// ============================================================
// Configurazione interamente via env vars (vedi .env.example):
//   SUPABASE_URL / SUPABASE_ANON_KEY  — progetto Supabase (auth utenti)
//   AI_API_URL / AI_MODEL / AI_API_KEY — provider AI (default OpenRouter)
//   AI_REFERRER / AI_TITLE            — metadati OpenRouter
// Comportamento:
//   - stream: true (o non specificato) -> SSE forward
//   - stream: false                    -> bufferizza upstream SSE
//                                         e ritorna JSON OpenAI-compat
//   - Rate limit per IP + per utente, con sweep periodica.
// ============================================================

const { createClient } = require('@supabase/supabase-js');
// Safety: ws non piu' passato al client, ma lo teniamo per eventuali
// dipendenze transitive di @supabase/realtime-js in Node.js
try { require('ws'); } catch (_) { /* opzionale */ }
const crypto = require('crypto'); // hash per log metric (no PII)

// Config progetto Supabase condivisa: env con fallback documentato e
// verifica token resiliente (JWT-ref) — vedi _lib/auth.js (round 53).
const auth = require('./_lib/auth');

const SUPABASE_URL = auth.resolveSupabaseUrl();
const SUPABASE_ANON_KEY = auth.resolveAnonKey();
// Provider AI configurabile via env var (default: OpenRouter OpenAI-compatible API)
const AI_API_URL = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = process.env.AI_MODEL || 'google/gemini-2.5-flash';
const AI_REFERRER = process.env.AI_REFERRER || 'https://concorso-ai.vercel.app';
const AI_TITLE = process.env.AI_TITLE || 'ConcorsoAI';
// Failover (round 53): se configurato, il fallback entra in gioco quando
// il provider primario esaurisce i tentativi retryable (503/rete/timeout).
const AI_FALLBACK_URL = process.env.AI_FALLBACK_URL;
const AI_FALLBACK_KEY = String(process.env.AI_FALLBACK_KEY || '').trim();
const AI_FALLBACK_MODEL = process.env.AI_FALLBACK_MODEL;
const UPSTREAM_TIMEOUT_MS = 30000;
const FIXED_MODEL = AI_MODEL;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_PER_WINDOW = 30; // per IP (uno IP puó essere molti utenti dietro NAT)
const RATE_LIMIT_MAX_PER_WINDOW_PER_USER = 60; // TURNO 31: per user (piú generoso del per-IP)
const DAILY_LIMIT_PIANO_CHAT = 10; // TURNO 33 (Fase 5): max messaggi/giorno per user sul mode='piano'
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
const dailyPianoCounts = new Map(); // TURNO 33 (Fase 5): per-user daily counter (mode='piano') con dayKey rollover

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

// TURNO 33 (Fase 5): rate limit giornaliero per la chat del piano.
// Ogni utente ha max 10 messaggi al giorno contro /api/chat con mode='piano'.
// dayKey rollover a mezzanotte UTC.
function todayKey() {
  var d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
function checkDailyPianoLimit(userId) {
  var dk = todayKey();
  var rec = dailyPianoCounts.get(userId);
  if (!rec || rec.dayKey !== dk) {
    dailyPianoCounts.set(userId, { dayKey: dk, count: 1 });
    return { ok: true, count: 1, max: DAILY_LIMIT_PIANO_CHAT, retryTomorrow: false };
  }
  if (rec.count >= DAILY_LIMIT_PIANO_CHAT) {
    return { ok: false, count: rec.count, max: DAILY_LIMIT_PIANO_CHAT, retryTomorrow: true };
  }
  rec.count += 1;
  return { ok: true, count: rec.count, max: DAILY_LIMIT_PIANO_CHAT, retryTomorrow: false };
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
    // Range ampio perché i client usano 900 (feedback) e fino a 8000
    // (generazione question bank). Il provider applica i suoi limiti.
    if (!Number.isFinite(m) || m < 1 || m > 8000) {
      return { ok: false, status: 400, error: 'max_tokens fuori range [1, 8000]' };
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
    const authRes = await auth.verifySupabaseToken(userJwt);
    if (authRes.error || !authRes.user) {
      logMetric('auth_fail', { reason: 'supabase_rejected' });
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }
    supabaseUser = authRes.user;
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

  // TURNO 33 (Fase 5): rate limit giornaliero SOLO per mode='piano'.
  if (req.body && req.body.mode === 'piano') {
    var daily = checkDailyPianoLimit(supabaseUser.id);
    if (!daily.ok) {
      return res.status(429).json({
        error: 'Limite giornaliero raggiunto',
        details: 'Hai raggiunto il limite di ' + daily.max + ' messaggi al giorno per la chat del piano. Riprova domani.',
        scope: 'daily-piano',
        limit: daily.max,
        retryAfterS: 24 * 60 * 60,
        dayKey: todayKey()
      });
    }
  }

  // 4) API key AI — AI_API_KEY (preferito) o BLUESMINDS_API_KEY (legacy)
  const rawKey = String(process.env.AI_API_KEY || process.env.BLUESMINDS_API_KEY || '');
  const apiKey = rawKey.trim();
  var keySource = process.env.AI_API_KEY ? 'AI_API_KEY' : 'BLUESMINDS_API_KEY';
  if (!apiKey || apiKey.length < 10) {
    logMetric('config_error', { reason: 'ai_api_key_invalid', source: keySource });
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'Chiave API AI mancante o troppo corta (env: ' + keySource + '). ' +
        'Imposta AI_API_KEY nel progetto Vercel: Settings → Environment Variables, ' +
        'poi ridistribuisci. Il file .env locale non viene usato dal deploy.'
    });
  }
  // Nota: se la chiave legacy BLUESMINDS_API_KEY è impostata ma non AI_API_KEY,
  // viene usata contro l'URL di default (OpenRouter) e fallirà con 401 upstream.
  if (keySource === 'BLUESMINDS_API_KEY' && !process.env.AI_API_URL) {
    logMetric('config_error', { reason: 'bluesminds_key_without_url' });
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'È presente solo BLUESMINDS_API_KEY (legacy) ma AI_API_URL non è configurata: ' +
        'la chiave verrebbe inviata a OpenRouter e fallirebbe. Imposta AI_API_KEY e AI_API_URL ' +
        'nelle Environment Variables del progetto Vercel.'
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

  // 7) Forward verso AI provider — retry + FAILOVER (round 53)
  // TURNO 33 (Fase 5): mode='piano' inietta il system prompt canonico dell'utente.
  // Sovrascrive/aggiunge la system message in posizione 0.
  var SYSTEM_PROMPT_PIANO = 'Sei un coach AI per concorsi pubblici italiani. Rispondi sempre in italiano. Sii diretto e concreto. Max 2-3 frasi per messaggio. Se modifichi il piano spiega brevemente perché.';
  var forwardBody;
  if (req.body && req.body.mode === 'piano') {
    var msgs = Array.isArray(req.body.messages) ? req.body.messages.slice() : [];
    var hasSystem = msgs.length > 0 && msgs[0] && msgs[0].role === 'system';
    if (!hasSystem) {
      msgs.unshift({ role: 'system', content: SYSTEM_PROMPT_PIANO });
    } else {
      msgs[0] = { role: 'system', content: SYSTEM_PROMPT_PIANO };
    }
    forwardBody = { ...req.body, stream: true, messages: msgs };
  } else {
    forwardBody = { ...req.body, stream: true };
  }
  // Il modello è deciso per-provider (il fallback può usare un modello
  // diverso, tipicamente più economico).
  var providers = [{ url: AI_API_URL, key: apiKey, model: FIXED_MODEL, name: 'primary' }];
  if (AI_FALLBACK_URL && AI_FALLBACK_KEY) {
    providers.push({ url: AI_FALLBACK_URL, key: AI_FALLBACK_KEY, model: AI_FALLBACK_MODEL || FIXED_MODEL, name: 'fallback' });
  }
  var MAX_ATTEMPTS_PER_PROVIDER = 2;
  var overallStart = Date.now();
  var upstream = null;
  var lastRetryableErr = null;
  var usedProvider = null;
  // Dichiarati fuori dal loop così sono visibili dopo (sezioni 8 e 9)
  var activeController = null;
  var activeTimeoutId = null;

  outer:
  for (var pi = 0; pi < providers.length; pi++) {
    var provider = providers[pi];
    for (var attempt = 1; attempt <= MAX_ATTEMPTS_PER_PROVIDER; attempt++) {
      var ctrl = new AbortController();
      var tId = setTimeout(function () { ctrl.abort(); }, UPSTREAM_TIMEOUT_MS);
      activeController = ctrl;
      activeTimeoutId = tId;
      var tStart = Date.now();

      try {
        upstream = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + provider.key,
            'HTTP-Referer': AI_REFERRER,
            'X-Title': AI_TITLE
          },
          body: JSON.stringify(Object.assign({}, forwardBody, { model: provider.model })),
          signal: ctrl.signal
        });
        var tElapsed = Date.now() - tStart;

        if (upstream.ok) {
          // SUCCESSO — esce da entrambi i loop
          usedProvider = provider.name;
          clearTimeout(tId);
          break outer;
        }

        // Non-ok: 5xx/429 sono retryable (stesso provider prima, poi fallback)
        if (upstream.status === 503 || upstream.status === 502 || upstream.status === 500 || upstream.status === 429) {
          var rawBodyRetry;
          try { rawBodyRetry = await upstream.text(); } catch (_) { rawBodyRetry = '(unreadable)'; }
          lastRetryableErr = { status: upstream.status, body: rawBodyRetry, elapsedMs: tElapsed, provider: provider.name };
          if (attempt < MAX_ATTEMPTS_PER_PROVIDER) {
            logMetric('upstream_retry', { userId: hashUserId(supabaseUser.id), provider: provider.name, status: upstream.status, attempt: attempt });
            clearTimeout(tId);
            await new Promise(function (r) { setTimeout(r, 800 * attempt); });
            continue;
          }
          logMetric('upstream_provider_exhausted', { userId: hashUserId(supabaseUser.id), provider: provider.name, status: upstream.status, attempts: attempt });
          clearTimeout(tId);
          break; // passa al fallback (o termina)
        }

        // Non-retryable (400, 401, ...) — fail subito
        clearTimeout(tId);
        var rawBodyFail;
        try { rawBodyFail = await upstream.text(); } catch (_) { rawBodyFail = '(unreadable)'; }
        var parsedFail;
        try { parsedFail = JSON.parse(rawBodyFail); } catch (_) { parsedFail = { raw_text: rawBodyFail.slice(0, 2000) }; }
        logMetric('upstream_status_error', { userId: hashUserId(supabaseUser.id), status: upstream.status, provider: provider.name, elapsedMs: tElapsed });
        return res.status(upstream.status).json({ error: 'Upstream error', upstream_status: upstream.status, upstream_body: parsedFail });

      } catch (fetchErr) {
        clearTimeout(tId);
        var tCatch = Date.now() - tStart;
        var errName = (fetchErr && (fetchErr.name || fetchErr.code)) || 'unknown';
        var errMsg = fetchErr ? (fetchErr.message || String(fetchErr)) : 'null';

        if (errName === 'AbortError') {
          lastRetryableErr = { name: 'AbortError', message: errMsg, elapsedMs: tCatch, provider: provider.name };
          if (attempt < MAX_ATTEMPTS_PER_PROVIDER) {
            await new Promise(function (r) { setTimeout(r, 800 * attempt); });
            continue;
          }
          logMetric('upstream_timeout', { userId: hashUserId(supabaseUser.id), provider: provider.name, elapsedMs: tCatch, attempts: attempt });
          break; // passa al fallback (o termina)
        }

        // Errore di rete — retry sullo stesso provider, poi fallback
        lastRetryableErr = { name: errName, message: errMsg, elapsedMs: tCatch, provider: provider.name };
        logMetric('upstream_fetch_retry', { userId: hashUserId(supabaseUser.id), provider: provider.name, errType: errName, attempts: attempt });
        if (attempt < MAX_ATTEMPTS_PER_PROVIDER) {
          await new Promise(function (r) { setTimeout(r, 800 * attempt); });
          continue;
        }
        logMetric('upstream_provider_fail', { userId: hashUserId(supabaseUser.id), provider: provider.name, errType: errName, elapsedMs: tCatch, attempts: attempt });
        break; // passa al fallback (o termina)
      }
    }
  }

  // Tutti i provider esauriti senza successo
  if (!upstream || !upstream.ok) {
    logMetric('upstream_retries_exhausted', { userId: hashUserId(supabaseUser.id), provider: usedProvider || 'none', overallMs: Date.now() - overallStart });
    if (lastRetryableErr && lastRetryableErr.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout upstream', details: 'I server AI non rispondono entro ' + (UPSTREAM_TIMEOUT_MS / 1000) + 's', elapsedMs: lastRetryableErr.elapsedMs });
    }
    if (lastRetryableErr && lastRetryableErr.name) {
      // Errore di rete su tutti i provider (non uno status HTTP).
      return res.status(502).json({ error: 'Fetch upstream fallita', details: lastRetryableErr.message || String(lastRetryableErr.name), errType: lastRetryableErr.name });
    }
    return res.status(503).json({ error: 'Servizio di generazione temporaneamente sovraccarico', details: 'I server AI non rispondono dopo più tentativi. Riprova tra qualche istante.', attempts: providers.length * MAX_ATTEMPTS_PER_PROVIDER });
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
