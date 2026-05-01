# Signal Tracker Pro - Architecture Overview

## Application Structure

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

## Data Flow Overview

### 1. Request Lifecycle (Backend)

```
HTTP Request → Server.js → createApp() → Middleware Chain → Routes → Controllers → Services → Models → Database
```

### 2. Key Components Explained

#### Server Initialization (`backend/src/server.js`)
- Connects to MongoDB via `connectDB()`
- Creates Express app via `createApp()`
- Starts HTTP server on configured port
- Initializes background evaluator cron job
- Sets up graceful shutdown handlers

#### App Configuration (`backend/src/app.js`)
- Sets up security middleware (helmet, cors)
- Configures JSON body parsing with size limits
- Adds request logging (morgan)
- Defines health check endpoint (`/health`)
- Registers API routes (`/api/signals`)
- Attaches error handling middleware

#### Routing (`backend/src/routes/signal.routes.js`)
- Maps HTTP methods to controller functions:
  - `POST /` → `ctrl.create` (create signal)
  - `GET /` → `ctrl.list` (list signals)
  - `GET /:id` → `ctrl.getById` (get signal by ID)
  - `GET /:id/status` → `ctrl.getStatus` (get signal status)
  - `DELETE /:id` → `ctrl.remove` (delete signal)

#### Controllers (`backend/src/controllers/signal.controller.js`)
- Handle HTTP requests and responses
- Validate input using Zod schemas
- Call service layer functions
- Transform service responses to HTTP responses
- Handle errors (validation, not found, server errors)

#### Services (`backend/src/services/signal.service.js`)
- Contain business logic
- Interact with data models
- Perform data transformation
- Coordinate between multiple models if needed
- Handle transactions and complex operations

#### Models (`backend/src/models/Signal.js`)
- Define data structure and validation
- Handle database interactions (MongoDB/Mongoose)
- Contain schema definitions, indexes, and model methods
- Include instance methods and static methods

#### Validation (`backend/src/validators/signal.validator.js`)
- Use Zod for schema validation
- Define schemas for:
  - Signal creation (`createSignalSchema`)
  - ID parameter validation (`idParamSchema`)
  - Query parameters for listing (`listQuerySchema`)
- Provide reusable validation logic

#### Background Jobs (`backend/src/jobs/cron.js`)
- Start/stop evaluator cron job
- Process signals periodically
- Update signal statuses based on market data
- Interact with external services (Binance)

#### External Services (`backend/src/services/`)
- `binance.service.js`: Interface with Binance API
- `evaluator.service.js`: Logic for evaluating signals

### 3. Frontend Flow

#### Entry Point
- Vite dev server or built assets
- React router handles client-side routing

#### State Management
- React hooks for local state
- Potential context or state management libraries
- Custom hooks for data fetching (`src/hooks/`)

#### API Communication
- `src/lib/api.ts`: Centralized API client
- Wrapper around fetch/axios with error handling
- Type-safe API calls matching backend endpoints

#### Component Architecture
- Reusable UI components in `src/components/ui/`
- Page-specific components in route directories
- Composition pattern for complex UIs

### 4. Database Design

MongoDB collections (primarily):
- **Signals**: Store trading signals with fields like:
  - `_id`: Unique identifier
  - `symbol`: Trading pair (e.g., BTCUSDT)
  - `direction`: LONG/SHORT
  - `entryPrice`: Entry price level
  - `targetPrices`: Array of target prices
  - `stopLoss`: Stop loss price
  - `status`: ACTIVE, HIT_TARGET, STOPPED_LOSS, EXPIRED
  - `timestamps`: createdAt, updatedAt

### 5. Security Features

- **Helmet.js**: Sets security headers
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Zod schemas prevent injection attacks
- **Rate Limiting**: Not implemented but could be added
- **SQL/NoSQL Injection Prevention**: Mongoose/ORM handles this
- **Environment Variables**: Sensitive config via `.env`

### 6. Error Handling

Centralized error handling in:
- `backend/src/middleware/error.middleware.js`
- Controllers catch and transform errors
- Validation errors return 400 with details
- Not found errors return 404
- Server errors return 500

### 7. Health Checks & Monitoring

- `/health` endpoint returns:
  - API status
  - Database connectivity
  - Evaluator job status
  - Uptime timestamp
- Logging via `winston` or similar (logger.js)

### 8. Configuration

- Environment variables via `dotenv` (`backend/src/config/env.js`)
- Separate configs for development/production
- Port, database URL, CORS origins, etc.

### 9. Scalability Considerations

- Stateless horizontal scaling possible
- Database connection pooling
- Efficient indexing strategy
- Background jobs can run on separate instances
- CDN for static frontend assets

## Conclusion

Signal Tracker Pro follows a modern RESTful API architecture with clear separation of concerns:
- **Controllers** handle HTTP concerns
- **Services** contain business logic
- **Models** manage data persistence
- **Validators** ensure data integrity
- **Routes** define API contracts
- **Middleware** handles cross-cutting concerns

The frontend consumes the API through well-defined endpoints, creating a decoupled, maintainable system.