module.exports = async function handler(req, res) {
  console.log('API Key presente:', !!process.env.BLUESMINDS_API_KEY);
  console.log('Body ricevuto:', JSON.stringify(req.body).slice(0, 100));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch(
      'https://api.bluesminds.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BLUESMINDS_API_KEY}`
        },
        body: JSON.stringify(req.body)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    // Streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }

    res.end();
  } catch (error) {
    console.error('Errore:', error.message);
    res.status(500).json({ error: error.message });
  }
}
