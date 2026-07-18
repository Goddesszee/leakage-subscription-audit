# Leakage — Subscription Audit Agent

An Agent Service Provider (ASP) built for the OKX.AI Genesis Hackathon (Finance Copilot track).

Leakage reads a bank/card statement (pasted text or a CSV/TXT upload), uses OpenAI to detect
recurring subscription charges, flags the ones that look forgotten or overpriced, and drafts a
ready-to-send cancellation email for any of them.

This is a standalone, from-scratch project — no code, contracts, or infrastructure shared with
any other project.

## Project structure

```
leakage-subscription-audit/
  api/           Vercel serverless functions (health, analyze, draft-cancellation)
  lib/           Shared logic used by the api functions (OpenAI calls, prompts)
  frontend/      React + Vite single-page app (upload, dashboard, cancellation modal)
  local-dev-server.js   Local-only Express wrapper around the same api/ handlers
  vercel.json    Deploys frontend as static output + api/ as serverless functions, as ONE project
```

This deploys as a **single Vercel project** — one import, one URL. The frontend calls `/api/...`
on the same origin, so there's no CORS setup and no second project to manage.

## Running locally

### 1. Install everything

```
npm install
cd frontend && npm install && cd ..
```

### 2. Set your OpenAI key

```
cp .env.example .env
# edit .env and set OPENAI_API_KEY
```

### 3. Run the API locally

```
npm run local
```

This starts a local Express server on `http://localhost:8787` that mounts the exact same
`api/*.js` handlers used in production — no duplicated logic.

### 4. Run the frontend

```
cd frontend
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173` and talks to `http://localhost:8787` (set in
`frontend/.env`).

## Deploying to Vercel (single project)

1. Vercel → **Add New Project** → import this GitHub repo
2. Leave **Root Directory** empty (repo root) — do not set it to `frontend` or `backend`
3. Framework Preset: **Other**
4. Add environment variable: `OPENAI_API_KEY` = your real key
   (optionally `OPENAI_MODEL`, defaults to `gpt-4o-mini`)
5. Click **Deploy**

Vercel will run the `buildCommand` in `vercel.json` (builds the frontend into `frontend/dist`)
and deploy everything in `api/` as serverless functions — all under one URL, one project.

Once deployed, verify with `<your-url>/api/health` — should return `{"status":"ok"}`.

## How it works

1. **Upload** — paste transactions or drop a `.csv`/`.txt` export (read client-side as text). A
   "Use sample statement" button is included for quick demoing.
2. **Analyze** — `POST /api/analyze` sends the transaction text to OpenAI with a prompt that
   extracts recurring charges (merchant, amount, frequency, total spent, first/last seen) and
   flags ones that look likely forgotten, with a plain-English reason.
3. **Dashboard** — results are shown as receipt-style cards: estimated monthly/annual spend,
   flagged count, and one card per subscription.
4. **Draft cancellation** — `POST /api/draft-cancellation` asks OpenAI to write a short, polite
   cancellation email for a specific subscription, shown in a modal with a copy button.

## Hackathon submission checklist

- [ ] Deploy (single Vercel project, steps above)
- [ ] List the ASP on OKX.AI and pass internal review
- [ ] Post on X with `#OKXAI`, including a demo under 90 seconds
- [ ] Submit the Google form with ASP details + link to the X post before **July 27, 23:59 UTC**
