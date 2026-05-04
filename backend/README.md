# SignalTracker Backend

Production-grade Express + Mongoose backend for the SignalTracker crypto trading signal tracking system.

## Features

- ✅ Full CRUD for trading signals
- ✅ Strict validation (Zod) — direction-aware (BUY/SELL) price rules + time rules
- ✅ Live Binance price integration (`/api/v3/ticker/price`)
- ✅ Background cron worker (every 30s) — auto-evaluates all OPEN signals against live prices
- ✅ Final-state guarantee — TARGET_HIT / STOPLOSS_HIT / EXPIRED never revert
- ✅ Direction-aware ROI calculation, 2-decimal precision
- ✅ Historical entry support (up to 24h in past)
- ✅ Clean MVC structure: routes / controllers / services / models / validators

## Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # Mongoose connection
│   │   └── env.js             # Env loader + validation
│   ├── models/
│   │   └── Signal.js          # Mongoose schema (status, direction, prices, ROI)
│   ├── validators/
│   │   └── signal.validator.js # Zod schemas + business rules
│   ├── services/
│   │   ├── binance.service.js  # Live price fetcher (with in-memory 5s cache)
│   │   ├── signal.service.js   # CRUD + evaluation logic
│   │   └── evaluator.service.js # Status transition engine
│   ├── controllers/
│   │   └── signal.controller.js
│   ├── routes/
│   │   └── signal.routes.js
│   ├── middleware/
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   ├── jobs/
│   │   └── cron.js             # node-cron worker (every 30s)
│   ├── utils/
│   │   └── logger.js
│   ├── app.js                  # Express app
│   └── server.js               # Entry point
├── .env.example
├── package.json
└── README.md
```

### Separation of concerns

- **Controllers** — HTTP I/O only (parse req, call service, send res)
- **Services** — business logic (evaluation, ROI, persistence)
- **Models** — schema + DB constraints
- **Validators** — Zod schemas, used by controllers before service calls
- **Jobs** — cron worker, isolated from request lifecycle

## Setup

### 1. Install

```bash
cd backend
npm install
```

### 2. Configure env

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=4000
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/tradingapp
NODE_ENV=development
CORS_ORIGIN=*
EVALUATOR_CRON=*/30 * * * * *
```

> ⚠️ **Security:** rotate your MongoDB password immediately if you've shared it anywhere. Never commit `.env`.

### 3. Database

MongoDB Atlas — no schema migrations needed. Mongoose creates the `signals` collection on first insert. Indexes are auto-built on boot.

### 4. Run

```bash
npm run dev      # nodemon
npm start        # production
```

Server: `http://localhost:4000`
Health: `GET /health`

## API Documentation

Base URL: `http://localhost:4000/api`

### `POST /signals` — create a signal

```json
{
  "symbol": "BTCUSDT",
  "direction": "BUY",
  "entry_price": 65000,
  "stop_loss": 63000,
  "target_price": 70000,
  "entry_time": "2026-04-30T08:00:00Z",
  "expiry_time": "2026-05-02T08:00:00Z"
}
```

Validation:

- `BUY`: stop_loss < entry_price < target_price
- `SELL`: target_price < entry_price < stop_loss
- `expiry_time > entry_time`
- `entry_time` may be up to 24h in the past, not in the future
- `symbol` validated against Binance (must exist)

Returns: `201` + created signal.
Errors: `400` with `{ error, details: [{path, message}] }`.

### `GET /signals` — list all signals

Query params (optional): `status`, `symbol`, `direction`, `limit` (default 100), `sort` (default `-created_at`)
Returns: `200` + `{ data: [...], count }`

### `GET /signals/:id` — get single signal

Returns: `200` + signal with **fresh live price + ROI computed on the fly**.
Errors: `404` if not found.

### `GET /signals/:id/status` — quick status poll

Lightweight endpoint. Returns: `{ id, status, current_price, realized_roi }`.

### `DELETE /signals/:id`

Returns: `204`.

### `GET /health`

Returns: `{ status: "ok", db, uptime, evaluator }`.

## Business Logic

### Status transitions

```
OPEN ──► TARGET_HIT     (BUY: price ≥ target | SELL: price ≤ target)
OPEN ──► STOPLOSS_HIT   (BUY: price ≤ SL    | SELL: price ≥ SL)
OPEN ──► EXPIRED        (now > expiry_time, no hit)
```

Once any terminal state is set, status is **frozen**. The evaluator skips non-OPEN signals.

### ROI

```
BUY:  (current − entry) / entry × 100
SELL: (entry − current) / entry × 100
```

Stored to 2 decimals at the moment of state transition. Live ROI also returned on read endpoints for OPEN signals.

### Cron worker

Default: every 30 seconds. Pulls all OPEN signals, batches them by symbol, fetches Binance prices (1 call per unique symbol), and evaluates. Writes only on state change.

## Deployment

### Render.com (recommended)

1. Push backend folder to its own GitHub repo
2. Render → New Web Service → connect repo
3. Build: `npm install` · Start: `npm start`
4. Add env vars: `MONGO_URI`, `NODE_ENV=production`, `CORS_ORIGIN=https://your-frontend.lovable.app`
5. Deploy → copy the service URL

### Railway / Fly.io

Same pattern — deploy as a Node service, set env vars.

After deploy, set the frontend env var `VITE_API_BASE_URL` to your backend URL.

## Scaling notes

- Binance has a 1200 req/min weight limit per IP. Cron batches by symbol so 100 OPEN signals across 5 symbols = 5 API calls per cycle.
- For >1000 signals, switch the cron to a queue (BullMQ + Redis) and shard by symbol.
- The evaluator is idempotent — safe to run multiple workers behind a leader-election lock.
