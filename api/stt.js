const { createClient } = require('@supabase/supabase-js');
var HARDCODED_ANON_CHAT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';
var HARDCODED_URL_CHAT = 'https://xhifnparcouxsypkjcmn.supabase.co';

const ALLOWED_ORIGINS = [
  'https://concorso-ai.vercel.app',
  'https://concorsoai.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5500'
];

module.exports = async function handler(req, res) {
  var origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST permesso' });
  }

  try {
    var token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token mancante' });

    var supabase = createClient(HARDCODED_URL_CHAT, HARDCODED_ANON_CHAT);
    var { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) {
      return res.status(401).json({ error: 'Token non valido o scaduto' });
    }

    var groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY non configurata. Ottienila gratis su console.groq.com' });
    }

    var body = '';
    for await (var chunk of req) { body += chunk; }
    var parsed = JSON.parse(body);
    var base64Audio = parsed.audio;
    var mimeType = parsed.mime || 'audio/webm';

    if (!base64Audio) {
      return res.status(400).json({ error: 'Campo "audio" (base64) mancante' });
    }

    var audioBuffer = Buffer.from(base64Audio, 'base64');
    var ext = mimeType.includes('wav') ? 'wav' : 'webm';

    var blob = new Blob([audioBuffer], { type: mimeType });
    var fd = new FormData();
    fd.append('file', blob, 'audio.' + ext);
    fd.append('model', 'whisper-large-v3-turbo');
    fd.append('language', 'it');
    fd.append('response_format', 'json');

    var groqResp = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + groqKey
      },
      body: fd
    });

    if (!groqResp.ok) {
      var errBody = await groqResp.text();
      console.error('[stt] Groq error:', groqResp.status, errBody);
      return res.status(502).json({ error: 'Errore Groq: ' + groqResp.status });
    }

    var data = await groqResp.json();
    return res.json({ text: data.text || '' });

  } catch (err) {
    console.error('[stt] Internal error:', err.message);
    return res.status(500).json({ error: 'Errore interno server' });
  }
};
