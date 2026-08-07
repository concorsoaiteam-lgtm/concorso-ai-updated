// ============================================================
// ConcorsoAI — Provider AI condiviso (api/_lib/*)
// ============================================================
// Chiamate non-streaming (JSON) con:
//   - retry su 503 / errore di rete / timeout (backoff esponenziale)
//   - FAILOVER: se configurato un fallback, lo prova quando il
//     provider primario esaurisce i tentativi retryable
//   - modello per task (es. modello piccolo per la memoria)
//
// Env vars:
//   AI_API_URL / AI_API_KEY / AI_MODEL        — provider primario
//   AI_FALLBACK_URL / AI_FALLBACK_KEY / AI_FALLBACK_MODEL — fallback
// ============================================================

var PRIMARY_TIMEOUT_MS = 25000;
var FALLBACK_TIMEOUT_MS = 30000;
var MAX_ATTEMPTS_PER_PROVIDER = 2;

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

// Lista dei provider da provare, in ordine. Il fallback entra solo se
// configurato (mai assumere provider alternativi che non esistono).
function resolveProviders(modelOverride) {
  var providers = [];
  var primaryUrl = process.env.AI_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
  var primaryKey = String(process.env.AI_API_KEY || process.env.BLUESMINDS_API_KEY || '').trim();
  // Chiave legacy BLUESMINDS senza AI_API_URL esplicita: verrebbe inviata a
  // OpenRouter (default) e fallirebbe con 401. Coerente con la guardia in
  // api/chat.js: in tal caso il provider non viene nemmeno aggiunto.
  var legacyKeyWithoutUrl = !process.env.AI_API_KEY && process.env.BLUESMINDS_API_KEY && !process.env.AI_API_URL;
  if (primaryKey && primaryKey.length >= 10 && !legacyKeyWithoutUrl) {
    providers.push({
      url: primaryUrl,
      key: primaryKey,
      model: modelOverride || process.env.AI_MODEL || 'google/gemini-2.5-flash',
      name: 'primary'
    });
  }
  var fbUrl = process.env.AI_FALLBACK_URL;
  var fbKey = String(process.env.AI_FALLBACK_KEY || '').trim();
  if (fbUrl && fbKey && fbKey.length >= 10) {
    providers.push({
      url: fbUrl,
      key: fbKey,
      model: modelOverride || process.env.AI_FALLBACK_MODEL || process.env.AI_MODEL || 'google/gemini-2.5-flash',
      name: 'fallback'
    });
  }
  return providers;
}

function isRetryableStatus(status) {
  return status === 503 || status === 429 || status === 500 || status === 502;
}

// Un singolo tentativo verso un provider. Ritorna
//   { ok, content, status, error, retryable }
async function attempt(provider, messages, opts) {
  var ctrl = new AbortController();
  var timeoutMs = provider.name === 'fallback' ? FALLBACK_TIMEOUT_MS : PRIMARY_TIMEOUT_MS;
  var tId = setTimeout(function () { ctrl.abort(); }, timeoutMs);
  var start = Date.now();
  try {
    var resp = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + provider.key,
        'HTTP-Referer': process.env.AI_REFERRER || 'https://concorso-ai.vercel.app',
        'X-Title': process.env.AI_TITLE || 'ConcorsoAI'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages,
        stream: false,
        temperature: (opts && opts.temperature != null) ? opts.temperature : 0.2,
        max_tokens: (opts && opts.maxTokens) || 2000
      }),
      signal: ctrl.signal
    });
    var elapsed = Date.now() - start;
    var raw = await resp.text();
    if (!resp.ok) {
      return { ok: false, status: resp.status, error: raw.slice(0, 500), retryable: isRetryableStatus(resp.status), elapsedMs: elapsed };
    }
    var parsed;
    try { parsed = JSON.parse(raw); } catch (_) { parsed = null; }
    var content = parsed && parsed.choices && parsed.choices[0] &&
      parsed.choices[0].message && parsed.choices[0].message.content;
    if (typeof content !== 'string' || !content.trim()) {
      return { ok: false, status: 200, error: 'empty content', retryable: true, elapsedMs: elapsed };
    }
    return { ok: true, content: content, status: 200, elapsedMs: elapsed };
  } catch (e) {
    var name = (e && e.name) || 'unknown';
    var msg = (e && e.message) || String(e);
    return { ok: false, status: 0, error: name + ': ' + msg, retryable: true, elapsedMs: Date.now() - start };
  } finally {
    clearTimeout(tId);
  }
}

// Prova ogni provider in ordine; per ciascuno fino a MAX_ATTEMPTS
// tentativi retryable. Prima risposta ok → vince.
async function callCompletions(messages, opts) {
  var modelOverride = opts && opts.model;
  var providers = resolveProviders(modelOverride);
  if (!providers.length) {
    return { ok: false, error: 'Nessuna chiave AI configurata', config: true };
  }
  var last = null;
  for (var p = 0; p < providers.length; p++) {
    var provider = providers[p];
    for (var attemptNo = 1; attemptNo <= MAX_ATTEMPTS_PER_PROVIDER; attemptNo++) {
      last = await attempt(provider, messages, opts);
      if (last.ok) return last;
      if (!last.retryable) break; // 400/401: niente retry sullo stesso provider
      if (attemptNo < MAX_ATTEMPTS_PER_PROVIDER) await sleep(800 * attemptNo);
    }
    // Provider esaurito ma resta il fallback: si passa oltre.
    if (p < providers.length - 1) await sleep(300);
  }
  return last || { ok: false, error: 'Tutti i provider non disponibili' };
}

module.exports = { callCompletions, resolveProviders };
