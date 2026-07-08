// ============================================================
// ConcorsoAI — Shared security helpers (DRY)
// ============================================================
// Helpers riusati da /api/email/welcome, /api/track, e futuri
// endpoint HMAC-protected. Vercel ignora i file in /api/_*/
// (prefix underscore) per il routing delle serverless functions,
// quindi è sicuro come modulo condiviso.
//
// Esporta:
//   • getClientIp(req)
//   • checkRateLimit(ip, maxPerMinute, store)
//   • timingSafeEqualHex(a, b)
//   • escapeHtml(s)
//   • verifyHmac({secret, timestamp, signature, requestId, rawBody,
//                 toleranceSec})
//   • checkAndStoreNonce(timestamp, requestId, seenNonces, ttlMs)
//   • readRawBody(req)
//   • startSweeps([intervals])
// ============================================================
// Convenzione HMAC (vedi AGENT_MEMORY §18):
//   signature = sha256(secret + "." + timestamp + "." + requestId +
//                       "." + rawBody)
//   headers: X-ConcorsoAI-Timestamp, X-ConcorsoAI-Signature,
//            X-ConcorsoAI-Request-Id (UUID v4)

const crypto = require('crypto');

// --- Utilities ---

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) return xff.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')); }
  catch (_) { return false; }
}

function readRawBody(req) {
  if (typeof req.body === 'string') return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req.rawBody && Buffer.isBuffer(req.rawBody)) return req.rawBody.toString('utf8');
  return JSON.stringify(req.body || {});
}

function checkRateLimit(ip, maxPerMinute, store) {
  const now = Date.now();
  const r = store.get(ip);
  if (!r || r.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return { ok: true, remaining: maxPerMinute - 1 };
  }
  if (r.count >= maxPerMinute) {
    return { ok: false, remaining: 0, retryAfterMs: r.resetAt - now };
  }
  r.count++;
  return { ok: true, remaining: maxPerMinute - r.count };
}

function verifyHmac({ secret, timestamp, signature, requestId, rawBody, toleranceSec }) {
  const tolerance = typeof toleranceSec === 'number' ? toleranceSec : 300;
  if (!secret) return { ok: false, reason: 'missing_secret_on_server' };
  if (!timestamp || !signature || !requestId) return { ok: false, reason: 'missing_headers' };
  const tsNum = parseInt(timestamp, 10);
  if (!Number.isFinite(tsNum) || tsNum <= 0) return { ok: false, reason: 'malformed_timestamp' };
  if (Math.abs(Math.floor(Date.now() / 1000) - tsNum) > tolerance) {
    return { ok: false, reason: 'timestamp_out_of_tolerance' };
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
    return { ok: false, reason: 'malformed_request_id' };
  }
  const expected = crypto.createHmac('sha256', secret)
    .update(String(timestamp) + '.' + requestId + '.' + rawBody, 'utf8')
    .digest('hex');
  return timingSafeEqualHex(expected, String(signature))
    ? { ok: true } : { ok: false, reason: 'signature_mismatch' };
}

function checkAndStoreNonce(timestamp, requestId, seenNonces, ttlMs) {
  const key = String(timestamp) + '|' + String(requestId);
  const expiresAt = Date.now() + ttlMs;
  if (seenNonces.has(key)) return { ok: false, reason: 'nonce_already_seen' };
  seenNonces.set(key, expiresAt);
  return { ok: true };
}

function startSweeps(intervals) {
  // intervals: [{ store, ttlMs, label? }]
  const handles = intervals.map(({ store, ttlMs }) => {
    const t = setInterval(function () {
      const now = Date.now();
      for (const [k, exp] of store) if (exp < now) store.delete(k);
    }, ttlMs);
    if (typeof t.unref === 'function') t.unref();
    return t;
  });
  return handles;
}

// UUID v4 generator (client-side equivalente: crypto.randomUUID())
function newRequestId() {
  return crypto.randomUUID();
}

// HMAC client helper per browser/test (NON usare in produzione:
// esporrebbe il secret). Solo per documentazione + dev convenience.
function clientSign({ secret, timestamp, requestId, rawBody }) {
  return crypto.createHmac('sha256', secret)
    .update(String(timestamp) + '.' + String(requestId) + '.' + String(rawBody), 'utf8')
    .digest('hex');
}

module.exports = {
  escapeHtml,
  getClientIp,
  timingSafeEqualHex,
  readRawBody,
  checkRateLimit,
  verifyHmac,
  checkAndStoreNonce,
  startSweeps,
  newRequestId,
  clientSign
};
