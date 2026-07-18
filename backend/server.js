require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '2mb' }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-sonnet-4-5';

function extractJson(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const altStart = cleaned.indexOf('{');
  const firstBracket = start === -1 ? altStart : (altStart === -1 ? start : Math.min(start, altStart));
  const lastBracket = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  const slice = firstBracket !== -1 && lastBracket !== -1 ? cleaned.slice(firstBracket, lastBracket + 1) : cleaned;
  return JSON.parse(slice);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Analyze raw transaction text (pasted or from an uploaded CSV) and detect recurring subscriptions
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    let transactionText = '';

    if (req.file) {
      transactionText = req.file.buffer.toString('utf-8');
    } else if (req.body && req.body.transactions) {
      transactionText = req.body.transactions;
    }

    if (!transactionText || transactionText.trim().length === 0) {
      return res.status(400).json({ error: 'No transaction data provided.' });
    }

    // Truncate to a safe size for the model
    const trimmed = transactionText.slice(0, 40000);

    const systemPrompt = `You are a financial transaction analyst. You are given a raw list of bank or card transactions (from a CSV export or pasted statement). Identify recurring subscription charges among them.

A subscription is a charge from the same merchant that repeats at a roughly regular interval (weekly, monthly, quarterly, yearly) with the same or very similar amount.

For each detected subscription, output:
- merchant: cleaned-up merchant name (remove trailing numbers, store codes, city names)
- amount: the typical charge amount as a number
- currency: 3-letter currency code if determinable, otherwise "USD"
- frequency: "weekly" | "monthly" | "quarterly" | "yearly"
- occurrences: how many times this charge appears in the data
- firstSeen: earliest date seen (YYYY-MM-DD)
- lastSeen: most recent date seen (YYYY-MM-DD)
- totalSpent: sum of all occurrences of this charge, as a number
- likelyForgotten: boolean — true if the charge looks like something a person may have forgotten about (e.g. low usage signal, generic/niche service name, long-running small charge, duplicate-sounding services)
- reason: a short, one-sentence, plain-English explanation of why it was flagged (or not) as likely forgotten

Respond with ONLY a JSON array of these objects. No preamble, no markdown fences, no commentary. If no subscriptions are found, respond with an empty array [].`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: `Here are the transactions:\n\n${trimmed}` }
      ]
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock) {
      return res.status(502).json({ error: 'No text response from model.' });
    }

    let subscriptions;
    try {
      subscriptions = extractJson(textBlock.text);
    } catch (parseErr) {
      return res.status(502).json({ error: 'Could not parse model output.', raw: textBlock.text });
    }

    if (!Array.isArray(subscriptions)) {
      subscriptions = [];
    }

    const totalMonthly = subscriptions.reduce((sum, s) => {
      const amt = Number(s.amount) || 0;
      if (s.frequency === 'monthly') return sum + amt;
      if (s.frequency === 'weekly') return sum + amt * 4.33;
      if (s.frequency === 'quarterly') return sum + amt / 3;
      if (s.frequency === 'yearly') return sum + amt / 12;
      return sum + amt;
    }, 0);

    res.json({
      subscriptions,
      summary: {
        count: subscriptions.length,
        forgottenCount: subscriptions.filter((s) => s.likelyForgotten).length,
        estimatedMonthlySpend: Math.round(totalMonthly * 100) / 100
      }
    });
  } catch (err) {
    console.error('Error in /api/analyze:', err);
    res.status(500).json({ error: 'Internal server error while analyzing transactions.' });
  }
});

// Draft a cancellation message for a given subscription
app.post('/api/draft-cancellation', async (req, res) => {
  try {
    const { merchant, amount, currency, frequency } = req.body || {};

    if (!merchant) {
      return res.status(400).json({ error: 'merchant is required.' });
    }

    const systemPrompt = `You write short, polite, effective cancellation requests for subscriptions. Given a merchant name and billing details, write a cancellation email.

Respond with ONLY a JSON object with two fields:
- subject: a short email subject line
- body: the full email body, polite but direct, asking to cancel the subscription and confirm no further charges, signed "Thank you"

No markdown fences, no commentary, just the JSON object.`;

    const userPrompt = `Merchant: ${merchant}\nAmount: ${amount ?? 'unknown'} ${currency ?? ''}\nFrequency: ${frequency ?? 'unknown'}`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock) {
      return res.status(502).json({ error: 'No text response from model.' });
    }

    let draft;
    try {
      draft = extractJson(textBlock.text);
    } catch (parseErr) {
      return res.status(502).json({ error: 'Could not parse model output.', raw: textBlock.text });
    }

    res.json(draft);
  } catch (err) {
    console.error('Error in /api/draft-cancellation:', err);
    res.status(500).json({ error: 'Internal server error while drafting cancellation.' });
  }
});

app.listen(PORT, () => {
  console.log(`Subscription Audit backend listening on port ${PORT}`);
});
