// ============================================================
// ConcorsoAI — Proxy serverless verso BluesMinds
// ============================================================
// Questo file gira su Vercel come funzione Node.js (CommonJS).
// Fa da intermediario sicuro tra il frontend e l'API BluesMinds:
// 1) Non espone la API key al browser (legge da env BLUESMINDS_API_KEY)
// 2) Forza l'uso del modello "minimax-m3" per evitare abusi
// 3) Inoltra messaggi / temperatura / max_tokens ricevuti dal client
// 4) Restituisce la risposta JSON completa (per ora no streaming,
//    cosi possiamo verificare subito l'integrazione end-to-end)
// ============================================================

module.exports = async function handler(req, res) {
  // Blocca subito qualunque chiamata non-POST (es. test dal browser)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito. Usa POST.' });
  }

  // Leggiamo la chiave dalle env di Vercel (mai esposta al client)
  const apiKey = process.env.BLUESMINDS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Configurazione server incompleta',
      details: 'Variabile BLUESMINDS_API_KEY mancante su Vercel'
    });
  }

  try {
    // Prepariamo il body da inoltrare a BluesMinds.
    // Forziamo il modello per coerenza con la scelta di prodotto,
    // ma lasciamo passare temperature, max_tokens, messages, stream.
    const forwardBody = {
  ...(req.body || {}),
  model: 'deepseek-v4-flash',
  stream: false
};

    // Timeout di sicurezza: 25 secondi. Se BluesMinds si impunta,
    // abortiamo la richiesta e rispondiamo 504 invece di lasciar
    // appeso il client.
    const upstreamController = new AbortController();
    const upstreamTimeout = setTimeout(() => upstreamController.abort(), 25000);

    let upstream;
    try {
      upstream = await fetch('https://api.bluesminds.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(forwardBody),
      signal: upstreamController.signal
    });
    } finally {
      clearTimeout(upstreamTimeout);
    }

    // BluesMinds risponde con JSON OpenAI-compatibile.
    // Leggiamo in modo sicuro anche quando upstream manda testo non-JSON.
    let data;
    try {
      data = await upstream.json();
    } catch (parseErr) {
      const rawText = await upstream.text().catch(() => '');
      return res.status(502).json({
        error: 'Risposta upstream non valida',
        details: String(parseErr.message || parseErr) + ' / raw=' + rawText.slice(0, 200)
      });
    }

    // Inoltriamo lo stesso status code cosi il client puo distinguere
    // 401/429/500 ureturn res.status(upstream.status).json(data);pstream e mostrare un messaggio sensato.
    
  } catch (error) {
    // Gestione esplicita del timeout upstream (AbortController)
    if (error && error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Timeout upstream',
        details: 'BluesMinds non ha risposto entro 25 secondi'
      });
    }

    // Crash locale (rete, fetch fallita, ecc.)
    return res.status(500).json({
      error: 'Crash backend proxy',
      details: error && error.message ? error.message : String(error)
    });
  }
};
