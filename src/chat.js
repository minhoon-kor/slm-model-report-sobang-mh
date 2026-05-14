import { loadEnv } from './env.js';

loadEnv();

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL || 'openai/gpt-5.2';
const prompt = process.argv.slice(2).join(' ') || 'Say hello in Korean.';

if (!apiKey) {
  console.error('Missing OPENROUTER_API_KEY.');
  process.exit(1);
}

const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:8787',
    'X-OpenRouter-Title': process.env.OPENROUTER_SITE_NAME || 'OpenCode Local Node Proxy'
  },
  body: JSON.stringify({
    model,
    messages: [{ role: 'user', content: prompt }]
  })
});

const payload = await response.json().catch(() => null);

if (!response.ok) {
  console.error(JSON.stringify(payload || { error: response.statusText }, null, 2));
  process.exit(1);
}

console.log(payload.choices?.[0]?.message?.content || '');
