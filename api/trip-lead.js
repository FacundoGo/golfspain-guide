// Vercel serverless function — golf trip plan leads
// Forwards each lead to a Google Apps Script web app that appends a row to a Google Sheet.
// Env var required: TRIP_LEADS_WEBHOOK (the Apps Script /exec URL, including its ?key=… secret)

const MAX = { name: 80, email: 120, page: 120 };
const CLUBS = ['bring', 'rent', 'unsure'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://golfspain.guide');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const b = req.body || {};

  // Honeypot: bots fill the hidden "website" field. Pretend success, store nothing.
  if (b.website) return res.status(200).json({ ok: true });

  const email = String(b.email || '').trim().slice(0, MAX.email);
  const name = String(b.name || '').trim().slice(0, MAX.name);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid name or email' });
  }
  if (!DATE.test(b.arrival || '') || !DATE.test(b.departure || '')) {
    return res.status(400).json({ error: 'Invalid dates' });
  }

  const lead = {
    received_at: new Date().toISOString(),
    name,
    email,
    arrival: b.arrival,
    departure: b.departure,
    players: Math.min(Math.max(parseInt(b.players, 10) || 1, 1), 8),
    courses: (Array.isArray(b.courses) ? b.courses : []).map(String).filter(c => /^[a-z-]{2,30}$/.test(c)).slice(0, 15).join(', '),
    clubs: CLUBS.includes(b.clubs) ? b.clubs : 'unsure',
    newsletter: b.newsletter === true ? 'yes' : 'no',
    page: String(b.page || '').slice(0, MAX.page),
    lang: b.lang === 'es' ? 'es' : 'en',
  };

  const url = process.env.TRIP_LEADS_WEBHOOK;
  if (!url) {
    console.error('TRIP_LEADS_WEBHOOK not set; lead not stored:', lead.received_at);
    return res.status(503).json({ error: 'Lead storage not configured' });
  }

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      redirect: 'follow',
    });
    if (!r.ok) {
      console.error('Lead webhook error:', r.status);
      return res.status(502).json({ error: 'Lead storage failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Lead webhook exception:', e);
    return res.status(500).json({ error: 'Internal error' });
  }
};
