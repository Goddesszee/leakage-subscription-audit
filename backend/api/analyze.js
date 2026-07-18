const { analyzeTransactions } = require('../lib/analyzeTransactions');

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
    const transactionText = req.body && req.body.transactions;

    if (!transactionText || String(transactionText).trim().length === 0) {
      res.status(400).json({ error: 'No transaction data provided.' });
      return;
    }

    const result = await analyzeTransactions(String(transactionText));
    res.status(200).json(result);
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: 'Internal server error while analyzing transactions.' });
  }
};
