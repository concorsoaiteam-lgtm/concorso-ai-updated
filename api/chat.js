module.exports = async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.BLUESMINDS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Missing BLUESMINDS_API_KEY on Vercel' });
    }

    const upstream = await fetch('https://api.bluesminds.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify(req.body)
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
    return res.send(text);
  } catch (err) {
    console.error('api/chat crash:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Function crashed', details: String(err && err.message ? err.message : err) });
  }
};
