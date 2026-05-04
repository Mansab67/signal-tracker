# Signal Tracker Pro

A comprehensive crypto trading signal tracking system with real-time price monitoring, automated signal evaluation, and intuitive UI.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Backend Flow](#backend-flow)
- [Frontend Flow](#frontend-flow)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Overview

Signal Tracker Pro is a full-stack application designed to help traders track and manage crypto trading signals. It features:

- Real-time signal creation and tracking
- Live price integration with Binance
- Automated signal evaluation based on target/stop-loss conditions
- Intuitive dashboard for monitoring signal performance
- Responsive UI built with modern React components

## Architecture

```
signal-tracker-pro-main/
├── backend/                  # Node.js/Express backend
│   └── src/
│       ├── app.js            # Express app configuration
│       ├── server.js         # Server entry point
│       ├── config/           # Database & environment config
│       ├── controllers/      # Request handlers
│       ├── routes/           # API route definitions
│       ├── services/         # Business logic
│       ├── models/           # Data models
│       ├── validators/       # Input validation (Zod)
│       ├── middleware/       # Custom middleware
│       └── jobs/             # Background tasks (cron)
└── src/                      # Frontend (React/Vite)
    ├── routes/               # Page components
    ├── components/           # UI components
    ├── lib/                  # Utility functions
    └── hooks/                # Custom React hooks
```

## Backend Flow

### 1. Request Lifecycle

```
HTTP Request → server.js → createApp() → Middleware Chain → Routes → Controllers → Services → Models → Database
```

### 2. Detailed Component Flow

#### Server Initialization (`backend/src/server.js`)

1. Connects to MongoDB via `connectDB()`
2. Creates Express app via `createApp()`
3. Starts HTTP server on configured port
4. Initializes background evaluator cron job
5. Sets up graceful shutdown handlers

#### App Configuration (`backend/src/app.js`)

1. Sets up security middleware (helmet, cors)
2. Configures JSON body parsing with size limits
3. Adds request logging (morgan)
4. Defines health check endpoint (`/health`)
5. Registers API routes (`/api/signals`)
6. Attaches error handling middleware

#### Routing (`backend/src/routes/signal.routes.js`)

Maps HTTP methods to controller functions:

- `POST /` → `ctrl.create` (create signal)
- `GET /` → `ctrl.list` (list signals)
- `GET /:id` → `ctrl.getById` (get signal by ID)
- `GET /:id/status` → `ctrl.getStatus` (get signal status)
- `DELETE /:id` → `ctrl.remove` (delete signal)

#### Controllers (`backend/src/controllers/signal.controller.js`)

1. Handle HTTP requests and responses
2. Validate input using Zod schemas
3. Call service layer functions
4. Transform service responses to HTTP responses
5. Handle errors (validation, not found, server errors)

#### Services (`backend/src/services/signal.service.js`)

1. Contain business logic
2. Interact with data models
3. Perform data transformation
4. Coordinate between multiple models if needed
5. Handle transactions and complex operations

#### Models (`backend/src/models/Signal.js`)

1. Define data structure and validation
2. Handle database interactions (MongoDB/Mongoose)
3. Contain schema definitions, indexes, and model methods
4. Include instance methods and static methods

#### Validation (`backend/src/validators/signal.validator.js`)

1. Use Zod for schema validation
2. Define schemas for:
   - Signal creation (`createSignalSchema`)
   - ID parameter validation (`idParamSchema`)
   - Query parameters for listing (`listQuerySchema`)
3. Provide reusable validation logic

#### Background Jobs (`backend/src/jobs/cron.js`)

1. Start/stop evaluator cron job
2. Process signals periodically
3. Update signal statuses based on market data
4. Interact with external services (Binance)

#### External Services (`backend/src/services/`)

1. `binance.service.js`: Interface with Binance API
2. `evaluator.service.js`: Logic for evaluating signals

## Frontend Flow

### 1. Application Entry Point

- Vite dev server or built assets
- React router handles client-side routing via `src/router.tsx`

### 2. State Management

- React hooks for local state (`useState`, `useEffect`)
- Custom hooks for data fetching (`src/hooks/`)
- Context API for global state (if implemented)

### 3. API Communication

- `src/lib/api.ts`: Centralized API client
- Wrapper around fetch with error handling
- Type-safe API calls matching backend endpoints
- Automatic base URL configuration via environment variables

### 4. Component Architecture

- Reusable UI components in `src/components/ui/`
- Page-specific components in route directories (`src/routes/`)
- Signal-specific components in `src/components/signals/`
- Layout components in `src/components/layout/`

### 5. Key Frontend Flows

#### Signal Creation Flow

1. User navigates to "New Signal" page (`src/routes/signals.new.tsx`)
2. Fills out form in `CreateSignalForm.tsx`
3. Form submission triggers `api.createSignal()` call
4. On success, redirects to signals list with notification
5. On error, displays validation errors via form state

#### Signal Listing Flow

1. User visits homepage (`src/routes/index.tsx`)
2. Component mounts and fetches signals via `api.listSignals()`
3. Displays loading state while fetching
4. Renders signals table using `SignalsTable.tsx`
5. Each row shows signal details with live price/ROI
6. Status badges update based on signal status
7. Auto-refresh mechanism for live data

#### Signal Detail Flow

1. User clicks on a signal in the table
2. Navigates to signal detail view
3. Fetches signal data via `api.getSignal(id)`
4. Displays comprehensive signal information
5. Shows live price updates and ROI calculations
6. Provides delete functionality with confirmation

### 6. UI Components

- Built using shadcn/ui primitives
- Responsive design for mobile/desktop
- Toast notifications via sonner
- Loading skeletons for better UX
- Interactive tables with sorting/pagination
- Form validation with visual feedback

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Binance API access (for live prices)

### Installation

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev  # Development
# or
npm start    # Production
```

#### Frontend Setup

```bash
cd ..
npm install
npm run dev  # Starts Vite dev server
```

### Environment Variables

#### Backend (`.env`)

```
PORT=4000
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/tradingapp
NODE_ENV=development
CORS_ORIGIN=*
EVALUATOR_CRON=*/30 * * * * *
```

#### Frontend (`.env` or Vite config)

```
VITE_API_BASE_URL=http://localhost:4000/api
```

## API Documentation

### Base URL

`http://localhost:4000/api`

### Endpoints

#### Signals

- `POST /signals` - Create a new signal
- `GET /signals` - List all signals (with filtering)
- `GET /signals/:id` - Get signal by ID
- `GET /signals/:id/status` - Get signal status only
- `DELETE /signals/:id` - Delete a signal

#### Health

- `GET /health` - Check API health status

### Signal Model

```javascript
{
  id: string,
  symbol: string,        // e.g., "BTCUSDT"
  direction: "BUY" | "SELL",
  entry_price: number,
  stop_loss: number,
  target_price: number,
  entry_time: string (ISO),
  expiry_time: string (ISO),
  status: "OPEN" | "TARGET_HIT" | "STOPLOSS_HIT" | "EXPIRED",
  realized_roi: number | null,
  realized_price: number | null,
  realized_at: string | null,
  created_at: string (ISO),
  updated_at: string (ISO),
  current_price?: number | null,
  live_roi?: number | null
}
```

## Deployment

### Backend (Render.com recommended)

1. Push backend to GitHub repo
2. Render → New Web Service → connect repo
3. Build: `npm install` · Start: `npm start`
4. Add env vars: `MONGO_URI`, `NODE_ENV=production`, `CORS_ORIGIN`
5. Deploy and copy service URL

### Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy dist folder to static hosting
3. Set `VITE_API_BASE_URL` to your backend URL

## Features

### Backend Features

- ✅ Full CRUD for trading signals
- ✅ Strict validation (Zod) with direction-aware rules
- ✅ Live Binance price integration with caching
- ✅ Background cron worker (every 30s) for auto-evaluation
- ✅ Final-state guarantee (terminal states never revert)
- ✅ Direction-aware ROI calculation (2-decimal precision)
- ✅ Historical entry support (up to 24h in past)
- ✅ Clean MVC architecture

### Frontend Features

- ✅ Modern React 18 + Vite setup
- ✅ TypeScript for type safety
- ✅ Responsive UI with shadcn/ui components
- ✅ Real-time signal updates
- ✅ Interactive data tables
- ✅ Form validation with Zod schemas
- ✅ Toast notifications for user feedback
- ✅ Loading states and skeletons
- ✅ Mobile-friendly design

## Business Logic

### Status Transitions

```
OPEN ──► TARGET_HIT     (BUY: price ≥ target | SELL: price ≤ target)
OPEN ──► STOPLOSS_HIT   (BUY: price ≤ SL    | SELL: price ≥ SL)
OPEN ──► EXPIRED        (now > expiry_time, no hit)
```

Once terminal state is set, status is frozen. Evaluator skips non-OPEN signals.

### ROI Calculation

```
BUY:  (current − entry) / entry × 100
SELL: (entry − current) / entry × 100
```

Stored to 2 decimals at state transition. Live ROI returned for OPEN signals.

### Cron Worker

- Default: every 30 seconds
- Pulls all OPEN signals
- Batches by symbol for efficient Binance API usage
- Evaluates and writes only on state change
- Idempotent safe for multiple workers

## Security Features

- Helmet.js for security headers
- Configurable CORS
- Input validation with Zod (prevents injection)
- Environment variable configuration
- No sensitive data in client-side code
- Secure HTTP headers

## Error Handling

Centralized error handling with:

- Validation errors (400) with detailed messages
- Not found errors (404)
- Server errors (500) with logging
- Client-side error boundaries and toast notifications

## Monitoring & Health

- `/health` endpoint returns API status, DB connectivity, evaluator status
- Comprehensive logging via winston-style logger
- Uptime tracking
- External service health (Binance connectivity)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

Please follow existing code style and conventions.

## License

MIT License - see LICENSE file for details.

---

_Signal Tracker Pro - Empowering traders with intelligent signal tracking_
