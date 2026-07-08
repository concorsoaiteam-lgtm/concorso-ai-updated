// ============================================================
// ConcorsoAI — Event tracking endpoint (v1.3: DRY)
// ============================================================
// v1.3 — Riusa api/_lib/security.js. HMAC custom + anti-replay
// + body cap + value type filter. Secret dedicato TRACK_API_SECRET.
// ============================================================

const crypto = require('crypto');
const {
  getClientIp, readRawBody, checkRateLimit,
  verifyHmac, checkAndStoreNonce, startSweeps
} = require('./_lib/security');

const RATE_LIMIT_MAX_PER_WINDOW = 60;
const NONCE_TTL_MS = 10 * 60 * 1000;
const MAX_BODY_SIZE = 16 * 1024;

const rateLimits = new Map();
const seenNonces = new Map();

startSweeps([
  { store: rateLimits, ttlMs: 60 * 1000 },
  { store: seenNonces, ttlMs: NONCE_TTL_MS }
]);

function hashEmail(email) {
  if (!email) return null;
  return crypto.createHash('sha256').update(String(email).toLowerCase().trim()).digest('hex').slice(0, 8);
}
function hashUserId(id) {
  if (!id) return null;
  return crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 8);
}

const ALLOWED_EVENTS = new Set([
  'signup_started', 'signup_completed', 'login_completed',
  'bando_uploaded', 'bando_upload_failed',
  'simulation_started', 'simulation_completed', 'simulation_aborted',
  'paywall_shown', 'paywall_cta_clicked',
  'pro_plan_upgrade_started', 'pro_plan_upgrade_completed',
  'magic_link_requested', 'feedback_corrected', 'page_view'
]);

const ALLOWED_FIELDS = new Set([
  'plan', 'source', 'bando_id_hash', 'difficulty', 'duration_minutes', 'score_avg', 'error_type', 'page'
]);

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const secret = process.env.TRACK_API_SECRET;
  if (!secret) {
    console.warn('[ConcorsoAI-METRIC] track config_error reason=missing_track_api_secret');
    return res.status(503).json({ error: 'TRACK_API_SECRET non configurato' });
  }

  // Rate limit per IP
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip, RATE_LIMIT_MAX_PER_WINDOW, rateLimits);
  if (!rate.ok) return res.status(429).json({ error: 'Troppi eventi', retryAfterS: Math.ceil(rate.retryAfterMs / 1000) });

  // Raw body + size cap
  const rawBody = readRawBody(req);
  if (rawBody.length > MAX_BODY_SIZE) {
    console.warn('[ConcorsoAI-METRIC] track body_too_large size=' + rawBody.length);
    return res.status(413).json({ error: 'Body troppo grande (max 16KB)' });
  }

  // HMAC verify (anti-replay + RequestId)
  const ts = req.headers['x-concorsoai-timestamp'];
  const sig = req.headers['x-concorsoai-signature'];
  const reqId = req.headers['x-concorsoai-request-id'];
  const hmacCheck = verifyHmac({ secret, timestamp: ts, signature: sig, requestId: reqId, rawBody });
  if (!hmacCheck.ok) {
    console.warn('[ConcorsoAI-METRIC] track auth_fail reason=' + hmacCheck.reason);
    return res.status(401).json({ error: 'Firma HMAC non valida', reason: hmacCheck.reason });
  }

  const nonceCheck = checkAndStoreNonce(ts, reqId, seenNonces, NONCE_TTL_MS);
  if (!nonceCheck.ok) {
    console.warn('[ConcorsoAI-METRIC] track replay_blocked request_id_hash=' +
      crypto.createHash('sha256').update(String(reqId)).digest('hex').slice(0, 8));
    return res.status(409).json({ error: 'Event già processato', reason: nonceCheck.reason });
  }

  // Parse + sanity
  let body = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; }
  catch (_) { return res.status(400).json({ error: 'JSON non valido' }); }

  const eventName = body.event;
  if (!eventName || typeof eventName !== 'string') return res.status(400).json({ error: 'event mancante' });
  if (!ALLOWED_EVENTS.has(eventName)) return res.status(400).json({ error: 'event non supportato' });

  // Sanitize fields
  const fields = body.fields || {};
  const cleanFields = {};
  if (fields.email) cleanFields.email_hash = hashEmail(fields.email);
  if (fields.user_id) cleanFields.user_id_hash = hashUserId(fields.user_id);
  Object.keys(fields || {}).forEach(k => {
    if (!ALLOWED_FIELDS.has(k)) return;
    const v = fields[k];
    if (typeof v === 'string') cleanFields[k] = v.slice(0, 80);
    else if (typeof v === 'number' && Number.isFinite(v)) cleanFields[k] = v;
  });
  if (typeof body.value === 'number' && Number.isFinite(body.value)) cleanFields.value = body.value;

  try {
    const ref = req.headers.referer || req.headers.referrer || '';
    if (ref) {
      const url = new URL(ref);
      cleanFields.referer_domain = url.hostname;
    }
  } catch (_) { /* ignore */ }

  console.log('[ConcorsoAI-METRIC] track ' + JSON.stringify(Object.assign({
    ts: new Date().toISOString(),
    route: '/api/track',
    event: eventName
  }, cleanFields)));

  return res.status(200).json({ ok: true });
};
