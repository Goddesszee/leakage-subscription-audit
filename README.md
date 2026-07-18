# Leakage — Subscription Audit Agent

An Agent Service Provider (ASP) built for the OKX.AI Genesis Hackathon (Finance Copilot track).

Leakage reads a bank/card statement (pasted text or a CSV/TXT upload), uses OpenAI to detect
recurring subscription charges, flags the ones that look forgotten or overpriced, and drafts a
ready-to-send cancellation email for any of them.

This is a standalone, from-scratch project — no code, contracts, or infrastructure shared with
any other project.

## Project structure

```
subscription-audit-agent/
  backend/     Express API, calls the Anthropic API to analyze transactions and draft emails
  frontend/    React + Vite single-page app (upload, dashboard, cancellation modal)
```

## Running locally

### 1. Backend

```
cd backend
npm install
cp .env.example .env
# edit .env and set OPENAI_API_KEY
npm start
```

Backend runs on `http://localhost:8787` by default.

### 2. Frontend

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173` by default and talks to the backend at the URL set in
`VITE_API_BASE`.

## How it works

1. **Upload** — paste transactions or drop a `.csv`/`.txt` export. A "Use sample statement"
   button is included for quick demoing.
2. **Analyze** — `POST /api/analyze` sends the raw transaction text to OpenAI with a prompt that
   extracts recurring charges (merchant, amount, frequency, total spent, first/last seen) and
   flags ones that look likely forgotten, with a plain-English reason.
3. **Dashboard** — results are shown as receipt-style cards: estimated monthly/annual spend,
   flagged count, and one card per subscription.
4. **Draft cancellation** — `POST /api/draft-cancellation` asks OpenAI to write a short, polite
   cancellation email for a specific subscription, shown in a modal with a copy button.

## Deployment (suggested)

- Frontend → Vercel (static build via `npm run build`, output in `frontend/dist`)
- Backend → Vercel (serverless functions under `backend/api`), with `OPENAI_API_KEY` and
  `ALLOWED_ORIGIN` set as environment variables

## Hackathon submission checklist

- [ ] Deploy frontend + backend
- [ ] List the ASP on OKX.AI and pass internal review
- [ ] Post on X with `#OKXAI`, including a demo under 90 seconds
- [ ] Submit the Google form with ASP details + link to the X post before **July 27, 23:59 UTC**
