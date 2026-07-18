const Anthropic = require('@anthropic-ai/sdk');

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

module.exports = { anthropic, MODEL, extractJson };
