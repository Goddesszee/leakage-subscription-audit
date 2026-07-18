const { anthropic, MODEL, extractJson } = require('./anthropicClient');

async function draftCancellation({ merchant, amount, currency, frequency }) {
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
    throw new Error('No text response from model.');
  }

  return extractJson(textBlock.text);
}

module.exports = { draftCancellation };
