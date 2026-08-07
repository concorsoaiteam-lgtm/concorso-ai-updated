// ============================================================
// api/stt.js — Trascrizione vocale (STT)
// Provider primario: Deepgram (nova-3, italiano, word timestamps)
// Fallback: Groq Whisper (se DEEPGRAM_API_KEY manca o fallisce)
//
// Proxy serverless: la chiave master resta sul server, il browser
// non la vede mai (le ephemeral keys richiedono scope keys:write
// che il piano free dell'utente non ha: usiamo il REST proxy).
//
// POST { audio: base64, mime: "audio/webm" }
//  → 200 { text, words: [{word, start, end, confidence}] }
//  → 401 token non valido · 400 payload errato · 502 provider
// ============================================================

const { verifySupabaseToken } = require('./_lib/auth.js');

var ALLOWED_ORIGINS = [
  'https://concorso-ai.vercel.app',
  'https://concorsoai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500'
];

// --- Timeout: per-chiamata 45s, ma con una scadenza GLOBALE unica
// --- (Deepgram + eventuale fallback Groq) che resta SOTTO il
// --- maxDuration della Function (60s, vedi vercel.json): così il
// --- fallback ha sempre tempo di girare senza che la piattaforma
// --- uccida la funzione a metà.
var PROVIDER_TIMEOUT_MS = 45000;
var DEADLINE_MS = 55000;

function setCors(req, res) {
  var origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
}

function timeoutSignal(ms) {
  var ctrl = new AbortController();
  var t = setTimeout(function () { ctrl.abort(); }, ms);
  if (typeof t.unref === 'function') t.unref();
  return { signal: ctrl.signal, clear: function () { clearTimeout(t); } };
}

// --- Deepgram REST: restituisce transcript + word timestamps ---
async function transcribeDeepgram(apiKey, audioBuffer, mimeType, deadline) {
  var params = new URLSearchParams({
    model: 'nova-3',
    language: 'it',
    punctuate: 'true',
    timestamps: 'true',
    filler_words: 'true',
    smart_format: 'true',
    utterances: 'true'
  }).toString();

  var to = timeoutSignal(Math.max(2000, Math.min(PROVIDER_TIMEOUT_MS, deadline - Date.now())));
  try {
    var resp = await fetch('https://api.deepgram.com/v1/listen?' + params, {
      method: 'POST',
      headers: {
        'Authorization': 'Token ' + apiKey,
        'Content-Type': mimeType || 'audio/webm'
      },
      body: audioBuffer,
      signal: to.signal
    });
    if (!resp.ok) {
      var errBody = '';
      try { errBody = (await resp.text()).slice(0, 300); } catch (_) { /* noop */ }
      throw new Error('Deepgram HTTP ' + resp.status + ': ' + errBody);
    }
    var data = await resp.json();
    var alt = data && data.results && data.results.channels &&
              data.results.channels[0] && data.results.channels[0].alternatives &&
              data.results.channels[0].alternatives[0];
    if (!alt) return { text: '', words: [] };
    var words = Array.isArray(alt.words) ? alt.words.map(function (w) {
      return {
        word: String(w.word || '').trim(),
        start: typeof w.start === 'number' ? w.start : null,
        end: typeof w.end === 'number' ? w.end : null,
        confidence: typeof w.confidence === 'number' ? w.confidence : null
      };
    }).filter(function (w) { return w.word; }) : [];
    return { text: String(alt.transcript || '').trim(), words: words };
  } finally {
    to.clear();
  }
}

// --- Groq Whisper: fallback economico (niente word timestamps) ---
async function transcribeGroq(apiKey, audioBuffer, mimeType, deadline) {
  var ext = String(mimeType || '').includes('wav') ? 'wav' : 'webm';
  var blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
  var fd = new FormData();
  fd.append('file', blob, 'audio.' + ext);
  fd.append('model', 'whisper-large-v3-turbo');
  fd.append('language', 'it');
  fd.append('response_format', 'json');

  var to = timeoutSignal(Math.max(2000, Math.min(PROVIDER_TIMEOUT_MS, deadline - Date.now())));
  try {
    var resp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      body: fd,
      signal: to.signal
    });
    if (!resp.ok) {
      var errBody = '';
      try { errBody = (await resp.text()).slice(0, 300); } catch (_) { /* noop */ }
      throw new Error('Groq HTTP ' + resp.status + ': ' + errBody);
    }
    var data = await resp.json();
    return { text: String(data.text || '').trim(), words: [] };
  } finally {
    to.clear();
  }
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST permesso' });
  }

  try {
    var token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Token mancante' });

    var auth = await verifySupabaseToken(token);
    if (auth.error || !auth.user) {
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }

    var body = '';
    for await (var chunk of req) { body += chunk; }
    var parsed;
    try { parsed = JSON.parse(body); }
    catch (_) { return res.status(400).json({ error: 'JSON non valido' }); }

    var base64Audio = parsed.audio;
    var mimeType = parsed.mime || 'audio/webm';
    if (!base64Audio || typeof base64Audio !== 'string') {
      return res.status(400).json({ error: 'Campo "audio" (base64) mancante' });
    }
    // Cap ~10MB: una risposta orale raramente supera questa soglia.
    var audioBuffer = Buffer.from(base64Audio, 'base64');
    if (audioBuffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Audio troppo grande (max ~10MB)' });
    }

    var deepgramKey = process.env.DEEPGRAM_API_KEY;
    var groqKey = process.env.GROQ_API_KEY;
    var deadline = Date.now() + DEADLINE_MS;

    // 1) Deepgram primario
    if (deepgramKey) {
      try {
        var dg = await transcribeDeepgram(deepgramKey, audioBuffer, mimeType, deadline);
        return res.json(dg);
      } catch (err) {
        console.error('[stt] Deepgram fallito:', err.message);
        // Se non c'è fallback, propaga l'errore con status 502.
        if (!groqKey) {
          return res.status(502).json({ error: 'Trascrizione non disponibile: ' + err.message });
        }
      }
    }

    // 2) Fallback Groq
    if (groqKey) {
      try {
        var gq = await transcribeGroq(groqKey, audioBuffer, mimeType, deadline);
        return res.json(gq);
      } catch (err) {
        console.error('[stt] Groq fallito:', err.message);
        return res.status(502).json({ error: 'Trascrizione non disponibile: ' + err.message });
      }
    }

    return res.status(500).json({ error: 'Nessuna chiave STT configurata (DEEPGRAM_API_KEY o GROQ_API_KEY). Ottienila gratis su deepgram.com' });

  } catch (err) {
    console.error('[stt] Internal error:', err.message);
    return res.status(500).json({ error: 'Errore interno server' });
  }
};
