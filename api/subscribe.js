// Vercel serverless function — Beehiiv subscriber creation
// Env vars required: BEEHIIV_API_KEY, BEEHIIV_PUB_ID

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://golfspain.guide');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, handicap_index, num_rounds, locale } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const PUB_ID  = process.env.BEEHIIV_PUB_ID;
  const API_KEY = process.env.BEEHIIV_API_KEY;

  if (!PUB_ID || !API_KEY) {
    console.error('Missing BEEHIIV_PUB_ID or BEEHIIV_API_KEY env vars');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }

  try {
    const r = await fetch(
      `https://api.beehiiv.com/v2/publications/${PUB_ID}/subscriptions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          email,
          utm_source:          'calculator',
          utm_medium:          'web',
          utm_campaign:        'handicap_result',
          reactivate_existing: true,
          send_welcome_email:  false,
          custom_fields: [
            { name: 'handicap_index', value: String(handicap_index ?? '') },
            { name: 'num_rounds',     value: String(num_rounds     ?? '') },
            { name: 'locale',         value: String(locale         || 'en') },
          ],
        }),
      }
    );

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      console.error('Beehiiv error:', r.status, data);
      return res.status(502).json({ error: 'Subscription failed' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('Subscribe handler error:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};
