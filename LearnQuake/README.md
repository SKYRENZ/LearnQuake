# LearnQuake

LearnQuake is a Vite + React application that visualises earthquake data and provides AI-generated hazard simulations. The frontend is bundled with Vite, while backend capabilities (map analysis via OpenAI and USGS lookups) are exposed through Netlify Functions so the entire experience can be deployed on Netlify without managing a standalone Node server.

## Prerequisites

- Node.js 18+
- npm 9+
- A Netlify account (for deployment)
- An OpenAI API key with access to the Chat Completions API
- (Optional) [Netlify CLI](https://docs.netlify.com/cli/get-started/) for local testing

## Installation

```bash
npm install
```

## Environment variables

Create a `.env` file (or use Netlify UI) and set the following:

```bash
OPENAI_API_KEY=<your-openai-api-key>
# Optional: override the default API base. When omitted, production builds use /.netlify/functions
VITE_API_BASE_URL=http://localhost:5000
```

On Netlify, add the same variables in **Site settings → Environment variables** so that functions can access `OPENAI_API_KEY` during deploys.

## Local development

For a seamless function + frontend dev loop, run Netlify Dev:

```bash
npx netlify dev
```

This proxies requests to `/.netlify/functions/*` to the local function bundle and serves the Vite dev server with hot reloading.

If you prefer to run the legacy Express server, start it from `backend/` and set `VITE_API_BASE_URL=http://localhost:5000` so the frontend targets it. The Netlify Functions share the same service layer, so behaviour remains consistent.

## Production build

```bash
npm run build
```

The output is written to `dist/` and Netlify is configured (see `netlify.toml`) to publish that directory while bundling functions from `netlify/functions`.

## Deploying to Netlify

1. Push your changes to GitHub.
2. Create a new Netlify site and connect the repository.
3. In the build settings, keep `npm run build` as the command and `dist` as the publish directory. The `netlify/functions` directory is already declared in `netlify.toml`.
4. Define the required environment variables (`OPENAI_API_KEY`, optional `VITE_API_BASE_URL`).
5. Trigger a deploy – Netlify will bundle the frontend and the serverless functions automatically.

## Project structure

- `src/` – React application
- `netlify/functions/` – Serverless handlers for map analysis and USGS queries
- `backend/services/` – Shared Node modules used by both the functions and (optionally) the legacy Express server
- `backend/server.js` – Legacy Express server retained for local or alternative hosting scenarios

## Testing & linting

```bash
npm run lint
```

Add your preferred testing framework (e.g. Vitest, Testing Library) as needed.
