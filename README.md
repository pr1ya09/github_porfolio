# priya.agent — portfolio

Personal portfolio for Priya Deshwal, styled as an interactive AI agent.
Pure static — HTML/CSS/JS only, no build step, no backend. Works on GitHub Pages as-is.

## Deploy to GitHub Pages

1. Delete the old contents of your `github_porfolio` repo (keep the repo itself).
2. Copy everything in this folder into the repo root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `Resume_Priya.pdf` (the résumé download button points to this filename)
3. Commit + push. GitHub Pages serves it at `https://pr1ya09.github.io/github_porfolio/`.

All paths are relative, so it works both as a project site (`/github_porfolio/`) and
as a user site (`pr1ya09.github.io` repo root).

## How the "AI chat" works

GitHub Pages is static hosting — a real LLM would need a backend to hide API keys.
Instead, `script.js` ships a client-side simulated agent:

- **Intent router** — keyword scoring + slash commands (`/projects`, `/skills`, …)
- **Trace renderer** — fake LangGraph-style tool-call traces before each answer
- **Scripted synthesis** — rich pre-written answer cards per intent

Zero cost, zero latency, zero keys. The `/how` command tells visitors this honestly.

### Upgrade path to a real LLM later

Add a free Cloudflare Worker (or Vercel edge function) that proxies to an LLM API
with your key stored as a secret, then swap `handleQuery()` to `fetch()` that endpoint.
The UI already supports streaming-style rendering.

## Editing content

- Chat answers: `INTENTS` array at the top of `script.js`
- Sections (experience / projects / skills / contact): straight HTML in `index.html`
- Colors: CSS variables in `:root` at the top of `style.css`
