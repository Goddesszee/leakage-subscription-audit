const { anthropic, MODEL, extractJson } = require('./anthropicClient');

async function analyzeTransactions(transactionText) {
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
    messages: [{ role: 'user', content: `Here are the transactions:\n\n${trimmed}` }]
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  if (!textBlock) {
    throw new Error('No text response from model.');
  }

  let subscriptions = extractJson(textBlock.text);
  if (!Array.isArray(subscriptions)) subscriptions = [];

  const totalMonthly = subscriptions.reduce((sum, s) => {
    const amt = Number(s.amount) || 0;
    if (s.frequency === 'monthly') return sum + amt;
    if (s.frequency === 'weekly') return sum + amt * 4.33;
    if (s.frequency === 'quarterly') return sum + amt / 3;
    if (s.frequency === 'yearly') return sum + amt / 12;
    return sum + amt;
  }, 0);

  return {
    subscriptions,
    summary: {
      count: subscriptions.length,
      forgottenCount: subscriptions.filter((s) => s.likelyForgotten).length,
      estimatedMonthlySpend: Math.round(totalMonthly * 100) / 100
    }
  };
}

module.exports = { analyzeTransactions };
