# OpenCode + OpenRouter on Node.js

This project exposes a tiny local OpenAI-compatible Node.js proxy for OpenRouter.
OpenCode connects to the local proxy, and the proxy forwards chat completions to OpenRouter.

## 1. Configure `.env`

If `node` or `npm` is not available yet, install Node.js 18 or newer first.
On Windows, one option is:

```powershell
winget install OpenJS.NodeJS.LTS
```

Then open a new terminal so PATH is refreshed.

If `opencode` is not installed yet:

```powershell
npm install -g opencode-ai
```

On Windows PowerShell, script execution policy can block the generated `.ps1`
shims. If that happens, use the `.cmd` commands instead:

```powershell
npm.cmd install -g opencode-ai
opencode.cmd --version
```

Create `.env` from `.env.example`, then put your real OpenRouter key in it.
The Node.js scripts load `.env` automatically.

```text
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=minimax/minimax-m2.5:free
```

Optional:

```text
OPENROUTER_MODELS=openai/gpt-5.2,anthropic/claude-sonnet-4.5,google/gemini-2.5-pro
OPENROUTER_SITE_URL=http://localhost:8787
OPENROUTER_SITE_NAME=OpenCode Local Node Proxy
```

## 2. Start the Node.js proxy

```powershell
npm run server
```

PowerShell alternative:

```powershell
npm.cmd run server
```

If your current terminal still cannot find `npm.cmd` after installing Node.js,
either open a new terminal or run the project helper:

```powershell
.\start-openrouter-proxy.cmd
```

It listens on:

```text
http://127.0.0.1:8787/v1
```

## 3. Start OpenCode

From this directory:

```powershell
opencode
```

PowerShell alternative:

```powershell
opencode.cmd
```

If your current terminal still cannot find `opencode.cmd`, either open a new
terminal or run:

```powershell
.\start-opencode.cmd
```

The included `opencode.json` adds a provider named `openrouter-node`.
OpenCode sends a dummy local API key; the Node.js proxy reads your real OpenRouter key from `.env`.
Use `/models` in OpenCode if you want to switch models.

## Quick direct OpenRouter test

```powershell
npm run chat -- "Say this is an OpenRouter connection test from Node.js."
```

PowerShell alternative:

```powershell
npm.cmd run chat -- "Say this is an OpenRouter connection test from Node.js."
```

## Calculator frontend

```powershell
python -m http.server 8080 --bind 127.0.0.1 -d frontend
```

Then open:

```text
http://127.0.0.1:8080/
```

## Direct OpenCode option

OpenCode also supports OpenRouter directly. If you do not need the local Node.js proxy, run `/connect`, choose OpenRouter, paste your OpenRouter API key, then select a model with `/models`.
