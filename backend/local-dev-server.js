require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { analyzeTransactions } = require('./lib/analyzeTransactions');
const { draftCancellation } = require('./lib/draftCancellation');

const app = express();
const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const transactionText = req.body && req.body.transactions;

    if (!transactionText || String(transactionText).trim().length === 0) {
      return res.status(400).json({ error: 'No transaction data provided.' });
    }

    const result = await analyzeTransactions(String(transactionText));
    res.json(result);
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: 'Internal server error while analyzing transactions.' });
  }
});

app.post('/api/draft-cancellation', async (req, res) => {
  try {
    const { merchant, amount, currency, frequency } = req.body || {};

    if (!merchant) {
      return res.status(400).json({ error: 'merchant is required.' });
    }

    const draft = await draftCancellation({ merchant, amount, currency, frequency });
    res.json(draft);
  } catch (err) {
    console.error('Error in /api/draft-cancellation:', err);
    res.status(500).json({ error: 'Internal server error while drafting cancellation.' });
  }
});

app.listen(PORT, () => {
  console.log(`Subscription Audit backend listening on port ${PORT}`);
});
