// ============================================================
// ConcorsoAI — Proxy serverless verso BluesMinds (v4)
// ============================================================
// Cambiamenti rispetto a v3:
//   1) SUPABASE_ANON_KEY: aggiunto fallback hardcoded offuscato in
//      stile simulation.html (chiave publishable per design Supabase,
//      formato sb_publishable_*). Env var resta prioritaria (rotazione
//      1-click da Vercel). Override della convenzione fail-closed
//      originaria — decisione utente 07/07/2026.
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

// --- Config (fail-closed: nessun fallback hardcoded) ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xhifnparcouxsypkjcmn.supabase.co';
// SUPABASE_ANON_KEY: env var prioritaria (rotazione 1-click da Vercel),
// fallback hardcoded offuscato in stile simulation.html. Chiave
// publishable per design Supabase (formato sb_publishable_*) -> sicura
// da esporre pubblicamente. Override della convenzione fail-closed
// originaria (07/07/2026). Per cambiare progetto Supabase: aggiorna
// entrambi (env var + fallback hardcoded).
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
  || ['sb_publishable_','dVYESGcHAV13d5aI1uC7wQ','_pQ0r1qT2'].join('');
const BLUESMINDS_URL = 'https://api.bluesminds.com/v1/chat/completions';
const UPSTREAM_TIMEOUT_MS = 30000;
const FIXED_MODEL = 'deepseek-v4-flash';
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_PER_WINDOW = 30;
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

// Sweep periodica: rimuove record scaduti dalla Map.
// Necessaria per evitare memory leak su istanze warm (Vercel serverless).
const rateLimitSweep = setInterval(function () {
  const now = Date.now();
  for (const [ip, record] of rateLimits) {
    if (record.resetAt < now) rateLimits.delete(ip);
  }
}, RATE_LIMIT_SWEEP_INTERVAL_MS);
// Evita che il timer tenga vivo il processo Node se moduli parent terminano
if (typeof rateLimitSweep.unref === 'function') rateLimitSweep.unref();

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimits.get(ip);
  if (!record || record.resetAt < now) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true, remaining: RATE_LIMIT_MAX_PER_WINDOW - 1 };
  }
  if (record.count >= RATE_LIMIT_MAX_PER_WINDOW) {
    return { ok: false, remaining: 0, retryAfterMs: record.resetAt - now };
  }
  record.count++;
  return { ok: true, remaining: RATE_LIMIT_MAX_PER_WINDOW - record.count };
}

// --- CORS helper ---
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
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'SUPABASE_ANON_KEY mancante sia come env var sia come fallback hardcoded'
    });
  }

  // 2) Auth Supabase (deve venire PRIMA del rate limit)
  const authHeader = req.headers.authorization || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return res.status(401).json({ error: 'Token di autenticazione mancante' });
  }
  const userJwt = tokenMatch[1].trim();

  let supabaseUser = null;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: 'Bearer ' + userJwt } }
    });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data || !data.user) {
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }
    supabaseUser = data.user;
  } catch (authErr) {
    return res.status(401).json({ error: 'Verifica auth fallita' });
  }

  // 3) Rate limit per IP
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  if (!rate.ok) {
    res.setHeader('Retry-After', String(Math.ceil(rate.retryAfterMs / 1000)));
    return res.status(429).json({
      error: 'Troppe richieste',
      details: 'Limite di ' + RATE_LIMIT_MAX_PER_WINDOW + ' richieste al minuto. Riprova tra ' + Math.ceil(rate.retryAfterMs / 1000) + 's'
    });
  }

  // 4) API key BluesMinds
  const apiKey = process.env.BLUESMINDS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'Variabile BLUESMINDS_API_KEY mancante su Vercel'
    });
  }

  // 5) Body validation
  const v = validateBody(req.body);
  if (!v.ok) {
    return res.status(v.status).json({ error: v.error });
  }

  // 6) Decide modalita: stream vs buffer
  // Default: stream=true (consigliato, typewriter UX migliore).
  // Se il client esplicitamente chiede stream=false (vecchio client),
  // bufferizziamo l'output di BluesMinds in un JSON unico.
  // Default legacy non-stream per backward compat con chiamaCommissario esistente.
  // Solo client espliciti (chiamaCommissarioStream) mandano stream:true per SSE.
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
      return res.status(504).json({ error: 'Timeout upstream', details: 'BluesMinds non ha risposto entro ' + (UPSTREAM_TIMEOUT_MS / 1000) + 's' });
    }
    return res.status(502).json({ error: 'Fetch upstream fallita', details: fetchErr.message || String(fetchErr) });
  }

  if (!upstream.ok) {
    clearTimeout(timeoutId);
    let errBody;
    try { errBody = await upstream.json(); } catch (_) {
      try { errBody = { error: await upstream.text() }; } catch (__) { errBody = {}; }
    }
    return res.status(upstream.status).json({ error: 'Upstream error', details: errBody });
  }

  // 8) MODALITA NON-STREAM (legacy client): bufferizza SSE upstream in JSON
  if (!wantsStream) {
    try {
      const finalContent = await bufferSseStreamToContent(upstream.body, controller, timeoutId);
      // Sintetizza risposta OpenAI-compatibile (identica al vero upstream JSON)
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
