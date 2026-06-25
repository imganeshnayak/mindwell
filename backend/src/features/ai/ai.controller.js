// backend/src/features/ai/ai.controller.js
// Proxies chat completions to the FreeLLM API proxy, using the server-side API key.

async function handleAIChat(req, res, next) {
  try {
    const payload = req.body;
    const apiKey = process.env.FREELLM_API_KEY;
    const proxyUrl = process.env.FREELLM_PROXY_URL;

    if (!proxyUrl) {
      return res.status(500).json({ error: 'FREELLM_PROXY_URL is not configured' });
    }

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Upstream API error: ${errorText}` });
    }

    const data = await response.json();
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

module.exports = { handleAIChat };
