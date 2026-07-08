// ============================================================
// ConcorsoAI — Email Benvenuto (v1.4: client branch only)
// ============================================================
// v1.4 — P0 fix review 08/07/2026:
//   • Rimossa dual-auth branch detection. Il path /api/email/welcome
//     ora accetta SOLO HMAC client (X-ConcorsoAI-* headers + secret).
//   • Supabase webhook è ora servito da /api/email/welcome-supabase
//     (path separato, Bearer SUPABASE_WEBHOOK_SECRET).
//   • Eliminata ambiguità "auth by body shape" (anti-pattern OWASP).
//   • Helper email (sendViaResend, buildWelcomeEmail, validateEmailStrict)
//     estratti in ./welcome.lib per DRY.
// ============================================================

const crypto = require('crypto');
const {
  getClientIp, readRawBody, checkRateLimit,
  verifyHmac, checkAndStoreNonce, startSweeps
} = require('../_lib/security');
const { sendViaResend, buildWelcomeEmail, validateEmailStrict } = require('../_lib/email-helpers');

const RATE_LIMIT_MAX_PER_WINDOW = 30;
const NONCE_TTL_MS = 10 * 60 * 1000;
const MAX_BODY_SIZE = 16 * 1024;

const rateLimits = new Map();
const seenNonces = new Map();

startSweeps([
  { store: rateLimits, ttlMs: 60 * 1000 },
  { store: seenNonces, ttlMs: NONCE_TTL_MS }
]);

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  // Secret HMAC client
  const secret = process.env.EMAIL_API_SECRET;
  if (!secret) {
    console.warn('[ConcorsoAI-METRIC] welcome_email config_error reason=missing_email_api_secret');
    return res.status(503).json({ error: 'EMAIL_API_SECRET non configurato' });
  }

  // Rate limit per IP
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip, RATE_LIMIT_MAX_PER_WINDOW, rateLimits);
  if (!rate.ok) return res.status(429).json({ error: 'Troppe richieste', retryAfterS: Math.ceil(rate.retryAfterMs / 1000) });

  // Raw body + size cap
  const rawBody = readRawBody(req);
  if (rawBody.length > MAX_BODY_SIZE) {
    console.warn('[ConcorsoAI-METRIC] welcome_email body_too_large size=' + rawBody.length);
    return res.status(413).json({ error: 'Body troppo grande (max 16KB)' });
  }

  // HMAC verify
  const ts = req.headers['x-concorsoai-timestamp'];
  const sig = req.headers['x-concorsoai-signature'];
  const reqId = req.headers['x-concorsoai-request-id'];
  const hmacCheck = verifyHmac({ secret, timestamp: ts, signature: sig, requestId: reqId, rawBody });
  if (!hmacCheck.ok) {
    console.warn('[ConcorsoAI-METRIC] welcome_email auth_fail reason=' + hmacCheck.reason);
    return res.status(401).json({ error: 'Firma HMAC non valida', reason: hmacCheck.reason });
  }

  // Anti-replay nonce
  const nonceCheck = checkAndStoreNonce(ts, reqId, seenNonces, NONCE_TTL_MS);
  if (!nonceCheck.ok) {
    console.warn('[ConcorsoAI-METRIC] welcome_email replay_blocked request_id_hash=' +
      crypto.createHash('sha256').update(String(reqId)).digest('hex').slice(0, 8));
    return res.status(409).json({ error: 'Richiesta già processata', reason: nonceCheck.reason });
  }

  // Parse + validate
  let body = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; }
  catch (_) { return res.status(400).json({ error: 'JSON non valido' }); }

  const email = body.email ? String(body.email).toLowerCase().trim() : null;
  const displayName = body.displayName;
  // Source whitelist: previene log injection / PII nel source field
  const ALLOWED_SOURCES = new Set(['signup', 'magic_link', 'admin_resend', 'manual']);
  const source = ALLOWED_SOURCES.has(body.source) ? body.source : 'signup';

  if (!validateEmailStrict(email)) {
    return res.status(400).json({ error: 'Email mancante o non valida' });
  }

  const { subject, html, text } = buildWelcomeEmail(displayName);

  if (process.env.EMAIL_DRY_RUN === 'true') {
    return res.status(200).json({ delivered: false, dry_run: true, subject, to: email });
  }

  try {
    await sendViaResend(email, subject, html, text);
    console.log('[ConcorsoAI-METRIC] welcome_email success to_hash=' +
      crypto.createHash('sha256').update(email).digest('hex').slice(0, 8) + ' source=' + source);
    return res.status(200).json({ delivered: true, source });
  } catch (e) {
    const errType = (e && (e.name || e.code)) || 'unknown';
    console.warn('[ConcorsoAI-METRIC] welcome_email fail err_type=' + errType);
    return res.status(200).json({ delivered: false, error: e.message || String(e), errorCode: errType });
  }
};
