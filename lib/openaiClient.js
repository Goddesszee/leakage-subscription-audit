const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function extractJson(text) {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const altStart = cleaned.indexOf('{');
  const firstBracket = start === -1 ? altStart : (altStart === -1 ? start : Math.min(start, altStart));
  const lastBracket = Math.max(cleaned.lastIndexOf(']'), cleaned.lastIndexOf('}'));
  const slice = firstBracket !== -1 && lastBracket !== -1 ? cleaned.slice(firstBracket, lastBracket + 1) : cleaned;
  return JSON.parse(slice);
}

module.exports = { openai, MODEL, extractJson };
