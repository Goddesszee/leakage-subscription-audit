const { openai, MODEL, extractJson } = require('./openaiClient');

async function draftCancellation({ merchant, amount, currency, frequency }) {
  const systemPrompt = `You write short, polite, effective cancellation requests for subscriptions. Given a merchant name and billing details, write a cancellation email.

Respond with ONLY a JSON object with two fields:
- subject: a short email subject line
- body: the full email body, polite but direct, asking to cancel the subscription and confirm no further charges, signed "Thank you"

No markdown fences, no commentary, just the JSON object.`;

  const userPrompt = `Merchant: ${merchant}\nAmount: ${amount ?? 'unknown'} ${currency ?? ''}\nFrequency: ${frequency ?? 'unknown'}`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText) {
    throw new Error('No text response from model.');
  }

  return extractJson(rawText);
}

module.exports = { draftCancellation };
