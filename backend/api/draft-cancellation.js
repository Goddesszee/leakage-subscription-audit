const { draftCancellation } = require('../lib/draftCancellation');

module.exports = async (req, res) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const { merchant, amount, currency, frequency } = req.body || {};

    if (!merchant) {
      res.status(400).json({ error: 'merchant is required.' });
      return;
    }

    const draft = await draftCancellation({ merchant, amount, currency, frequency });
    res.status(200).json(draft);
  } catch (err) {
    console.error('Error in /api/draft-cancellation:', err);
    res.status(500).json({ error: 'Internal server error while drafting cancellation.' });
  }
};
