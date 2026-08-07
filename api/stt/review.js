// ============================================================
// api/stt/review.js — Revisione finale della trascrizione
// ------------------------------------------------------------
// Dopo la trascrizione (Deepgram/Groq), una piccola passata con
// un modello economico corregge SOLO gli errori evidenti di
// trascrizione (termini giuridici, nomi propri, punteggiatura),
// senza aggiungere né togliere contenuto.
//
// Costi: una chiamata a modello PICCOLO (AI_MEMORY_MODEL se
// presente, altrimenti il modello di default) su ~200 parole.
// Fail-open: se l'AI non risponde, restituisce il testo originale
// con reviewed:false — la trascrizione non va mai persa.
//
// POST { text } → 200 { text, reviewed, original? }
// ============================================================

const { verifySupabaseToken } = require('../_lib/auth.js');
const { callCompletions } = require('../_lib/ai.js');

var ALLOWED_ORIGINS = [
  'https://concorso-ai.vercel.app',
  'https://concorsoai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500'
];

var SYSTEM_PROMPT =
  'Sei un correttore di trascrizioni vocali di esami orali di concorso. ' +
  'Correggi SOLO errori evidenti di trascrizione: parole mal trascritte ' +
  '("diritto amministrativo", "silenzio assenso", termini giuridici, nomi ' +
  'propri), punteggiatura mancante, doppioni, articoli sbagliati. ' +
  'NON aggiungere contenuto, NON riassumere, NON rispondere alla domanda, ' +
  'NON trasformare in elenchi. Se il testo è già corretto, restituiscilo ' +
  'identico. Restituisci SOLO il testo corretto, senza introduzioni né note.';

function setCors(req, res) {
  var origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.json({ ok: true, service: 'stt-review', hint: 'POST { text } → { text, reviewed }' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non permesso (usa POST o GET)' });
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

    var text = String(parsed.text || '').trim();
    if (!text) return res.status(400).json({ error: 'Campo "text" mancante o vuoto' });
    if (text.length > 6000) text = text.slice(0, 6000); // difesa: mai far esplodere i token

    var result = await callCompletions(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text }
      ],
      {
        model: process.env.AI_MEMORY_MODEL || undefined, // modello piccolo se configurato
        maxTokens: 2048,
        temperature: 0
      }
    );

    if (!result.ok || typeof result.content !== 'string') {
      console.error('[stt-review] revisione saltata (fail-open):', result.error || 'unknown');
      return res.json({ text: text, reviewed: false });
    }

    var fixed = result.content.trim();
    if (!fixed) return res.json({ text: text, reviewed: false });

    return res.json({ text: fixed, reviewed: true });
  } catch (err) {
    console.error('[stt-review] internal:', err.message);
    // Fail-open anche sugli errori interni: l'utente ha già la trascrizione.
    return res.json({ text: '', reviewed: false, error: 'review-skipped' });
  }
};
