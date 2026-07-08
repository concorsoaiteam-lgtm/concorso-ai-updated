// ============================================================
// ConcorsoAI — Email Benvenuto Supabase webhook (v1.5)
// ============================================================
// v1.5 — P1 fix review 08/07/2026:
//   • Idempotency: dedup `seenSupabaseEvents: Set<string>` con TTL 24h.
//     Supabase webhooks retriggherano su 5xx/timeout. Senza dedup, lo
//     stesso auth.users.created potrebbe inviare N email.
//   • Shape validation: richiede `body.type === 'INSERT' && body.table === 'users'`,
//     difesa-in-depth nel caso (improbabile) di leak SUPABASE_WEBHOOK_SECRET.
//   • Helper email ora da /api/_lib/email-helpers.js (Vercel non espone).
// ============================================================

const crypto = require('crypto');
const {
  getClientIp, readRawBody, checkRateLimit, startSweeps
} = require('../_lib/security');
const { sendViaResend, buildWelcomeEmail, validateEmailStrict, extractSupabaseUserFields } = require('../_lib/email-helpers');

const RATE_LIMIT_MAX_PER_WINDOW = 60;
const MAX_BODY_SIZE = 16 * 1024;
const EVENT_DEDUP_TTL_MS = 24 * 60 * 60 * 1000; // 24h dedup window

const rateLimits = new Map();
const seenEvents = new Map(); // eventKey -> expiresAt

startSweeps([
  { store: rateLimits, ttlMs: 60 * 1000 },
  { store: seenEvents, ttlMs: EVENT_DEDUP_TTL_MS }
]);

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8')); }
  catch (_) { return false; }
}

function verifySupabaseBearer(req) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) return { ok: false, status: 503, reason: 'supabase_webhook_secret_not_configured' };
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) return { ok: false, status: 401, reason: 'missing_bearer' };
  const provided = match[1].trim();
  return timingSafeEqualStr(provided, secret)
    ? { ok: true } : { ok: false, status: 401, reason: 'bearer_mismatch' };
}

function validatePayloadShape(body) {
  // Supabase webhook eventi su auth.users hanno type='INSERT' e table='users'.
  if (!body || typeof body !== 'object') return { ok: false, reason: 'body_not_object' };
  if (body.type !== 'INSERT') return { ok: false, reason: 'type_not_insert' };
  if (body.table !== 'users') return { ok: false, reason: 'table_not_users' };
  if (!body.record || typeof body.record !== 'object') return { ok: false, reason: 'record_missing' };
  return { ok: true };
}

function checkAndStoreEvent(eventKey) {
  if (seenEvents.has(eventKey)) return { ok: false, reason: 'event_already_processed' };
  seenEvents.set(eventKey, Date.now() + EVENT_DEDUP_TTL_MS);
  return { ok: true };
}

// Grace delete: ritarda rimozione per consentire retry paralleli senza race.
// Se Resend fallisce, lasciamo 60s di "lock" prima di sbloccare il retry.
function releaseEventWithGrace(eventKey) {
  setTimeout(function () { seenEvents.delete(eventKey); }, 60 * 1000).unref();
}

function deriveEventKey(body) {
  if (!body || !body.record) return { ok: false, reason: 'record_missing' };
  if (body.record.id) return { ok: true, key: 'user_created|' + String(body.record.id) };
  if (body.record.email) {
    return { ok: true, key: 'user_created|email|' + crypto.createHash('sha256').update(String(body.record.email)).digest('hex').slice(0, 16) };
  }
  return { ok: false, reason: 'record_id_and_email_missing' };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  // Rate limit per IP
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip, RATE_LIMIT_MAX_PER_WINDOW, rateLimits);
  if (!rate.ok) return res.status(429).json({ error: 'Troppe richieste', retryAfterS: Math.ceil(rate.retryAfterMs / 1000) });

  // Bearer auth
  const auth = verifySupabaseBearer(req);
  if (!auth.ok) {
    console.warn('[ConcorsoAI-METRIC] welcome_supabase auth_fail reason=' + auth.reason);
    return res.status(auth.status).json({ error: 'Auth Supabase webhook fallita', reason: auth.reason });
  }

  // Body parse + size cap
  const rawBody = readRawBody(req);
  if (rawBody.length > MAX_BODY_SIZE) {
    console.warn('[ConcorsoAI-METRIC] welcome_supabase body_too_large size=' + rawBody.length);
    return res.status(413).json({ error: 'Body troppo grande (max 16KB)' });
  }

  let body = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; }
  catch (_) { return res.status(400).json({ error: 'JSON non valido' }); }

  // Shape validation (difesa-in-depth)
  const shape = validatePayloadShape(body);
  if (!shape.ok) {
    console.warn('[ConcorsoAI-METRIC] welcome_supabase shape_invalid reason=' + shape.reason);
    return res.status(400).json({ error: 'Payload shape non valido', reason: shape.reason });
  }

  // Idempotency dedup (TTL 24h)
  const keyResult = deriveEventKey(body);
  if (!keyResult.ok) {
    console.warn('[ConcorsoAI-METRIC] welcome_supabase shape_invalid reason=' + keyResult.reason);
    return res.status(400).json({ error: 'Payload shape non valido', reason: keyResult.reason });
  }
  const eventKey = keyResult.key;
  const dedup = checkAndStoreEvent(eventKey);
  if (!dedup.ok) {
    console.log('[ConcorsoAI-METRIC] welcome_supabase dedup_hit event_key=' + eventKey);
    return res.status(200).json({ delivered: false, reason: 'event_already_processed', idempotent: true });
  }

  // Estrai email
  const { email, displayName } = extractSupabaseUserFields(body);
  if (!validateEmailStrict(email)) {
    return res.status(400).json({ error: 'Email mancante o non valida' });
  }

  const { subject, html, text } = buildWelcomeEmail(displayName);

  if (process.env.EMAIL_DRY_RUN === 'true') {
    return res.status(200).json({ delivered: false, dry_run: true, subject, to: email });
  }

  try {
    await sendViaResend(email, subject, html, text);
    console.log('[ConcorsoAI-METRIC] welcome_supabase success to_hash=' +
      crypto.createHash('sha256').update(email).digest('hex').slice(0, 8));
    return res.status(200).json({ delivered: true, source: 'supabase_webhook' });
  } catch (e) {
    const errType = (e && (e.name || e.code)) || 'unknown';
    console.warn('[ConcorsoAI-METRIC] welcome_supabase fail err_type=' + errType);
    // Grace delete: rilascia dedup lock dopo 60s. Consente retry pulito di
    // Supabase (entro 24h) senza race window.
    releaseEventWithGrace(eventKey);
    return res.status(502).json({ error: 'Errore invio email', errorCode: errType, details: e.message || String(e) });
  }
};
