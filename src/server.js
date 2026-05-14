import http from 'node:http';
import { loadEnv } from './env.js';

loadEnv();

const upstreamBaseUrl = 'https://openrouter.ai/api/v1';
const port = Number(process.env.PORT || 8787);
const defaultModel = process.env.OPENROUTER_MODEL || 'openai/gpt-5.2';
const modelNames = (process.env.OPENROUTER_MODELS || defaultModel)
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean);

function json(res, status, body) {
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(text)
  });
  res.end(text);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function bearerToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ') && header !== 'Bearer dummy') {
    return header.slice('Bearer '.length);
  }

  return process.env.OPENROUTER_API_KEY;
}

async function forwardChatCompletion(req, res) {
  const apiKey = bearerToken(req);

  if (!apiKey) {
    json(res, 401, {
      error: {
        message: 'Missing OpenRouter API key. Set OPENROUTER_API_KEY or send Authorization: Bearer <key>.'
      }
    });
    return;
  }

  const bodyText = await readBody(req);
  const requestBody = bodyText ? JSON.parse(bodyText) : {};

  if (!requestBody.model) {
    requestBody.model = defaultModel;
  }

  const upstream = await fetch(`${upstreamBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'http://localhost:8787',
      'X-OpenRouter-Title': process.env.OPENROUTER_SITE_NAME || 'OpenCode Local Node Proxy'
    },
    body: JSON.stringify(requestBody)
  });

  res.writeHead(upstream.status, {
    'Content-Type': upstream.headers.get('content-type') || 'application/json'
  });

  if (upstream.body) {
    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
  }

  res.end();
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || '127.0.0.1'}`);

    if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/v1/health')) {
      json(res, 200, { ok: true, upstream: 'openrouter', defaultModel });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/v1/models') {
      json(res, 200, {
        object: 'list',
        data: modelNames.map((id) => ({
          id,
          object: 'model',
          created: 0,
          owned_by: 'openrouter'
        }))
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/v1/chat/completions') {
      await forwardChatCompletion(req, res);
      return;
    }

    json(res, 404, { error: { message: `No route for ${req.method} ${url.pathname}` } });
  } catch (error) {
    json(res, 500, {
      error: {
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`OpenRouter proxy listening on http://127.0.0.1:${port}/v1`);
  console.log(`Default model: ${defaultModel}`);
});
