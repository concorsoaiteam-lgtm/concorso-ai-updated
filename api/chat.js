module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const apiKey = process.env.BLUESMINDS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Manca API KEY su Vercel' });

  try {
    const response = await fetch('https://api.bluesminds.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Crash BluesMinds', details: error.message });
  }
};
