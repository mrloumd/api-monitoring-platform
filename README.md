# APIFlow — API Monitoring Platform

An API observability platform built with NestJS and Next.js. Ingest request logs from any project, visualize traffic patterns, track errors, and analyze endpoint performance across dev and production environments.

## Features

- Request log ingestion via REST API
- Paginated log explorer with filters (method, status, endpoint, environment, date range)
- Analytics dashboard (total requests, error rate, avg response time)
- Status code distribution chart
- Top endpoints by request volume
- Response time stats per endpoint (min / avg / max)
- Daily request volume trends
- Recent errors view (4xx / 5xx)
- Multi-environment support (`ApiFlowDev` / `ApiFlowProd`)
- **API Playground** — interactive page to trigger live demo endpoints that auto-log to the dashboard
- **Auto-logging interceptor** — captures every request (method, path, status, response time, IP) without touching controller logic

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, TanStack Query, Recharts |
| Backend | NestJS 11, Mongoose, Multer |
| Database | MongoDB Atlas |
| Monorepo | Turborepo + npm workspaces |

## Project Structure

```
api-monitoring-platform/
├── apps/
│   ├── client/        # Next.js dashboard
│   └── server/        # NestJS REST API
│       └── src/modules/
│           ├── analytics/
│           ├── common/
│           │   ├── filters/
│           │   └── interceptors/   # LoggingInterceptor
│           ├── demo/               # API Playground endpoints
│           ├── health/
│           └── request-log/
└── packages/
    └── shared/        # Shared TypeScript types
```

## Local Development

```bash
# Install dependencies from repo root
npm install

# Run both apps concurrently
npm run dev

# Client → http://localhost:3000
# Server → http://localhost:3001
# Swagger → http://localhost:3001/api/docs
```

Requires a `.env` file in `apps/server/`:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=ApiFlowDev
PORT=3001
CLIENT_URL=http://localhost:3000
```

And a `.env` file in `apps/client/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Seed Demo Data

```bash
cd apps/server

# Seed into ApiFlowDev (default)
npm run seed

# Seed into a specific database
MONGODB_DB_NAME=ApiFlowProd npm run seed
```

Generates ~700 realistic request logs spread over the last 30 days. Clears existing logs before inserting.

## API Endpoints

### Core

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check + DB status |
| `POST` | `/request-logs` | Ingest a new request log |
| `GET` | `/request-logs` | List logs (paginated, filterable) |
| `GET` | `/request-logs/:id` | Get log by ID |
| `GET` | `/analytics/summary` | Total requests, errors, avg response time |
| `GET` | `/analytics/status-codes` | Distribution by HTTP status code |
| `GET` | `/analytics/response-times` | Min / avg / max per endpoint |
| `GET` | `/analytics/top-endpoints` | Most called endpoints |
| `GET` | `/analytics/errors` | Recent 4xx / 5xx logs |
| `GET` | `/analytics/trends` | Daily request volume over N days |

### Demo (API Playground)

Each endpoint is wrapped by `LoggingInterceptor` — every call is automatically saved to the request log collection.

| Method | Path | Simulates | Delay |
|--------|------|-----------|-------|
| `POST` | `/demo/files/upload` | File upload — accepts real file via `multipart/form-data`, processed in memory, not persisted | 800ms–3s |
| `POST` | `/demo/users` | User registration with email + name validation | 150–500ms |
| `POST` | `/demo/auth/login` | Authentication — 30% chance of 401 | 100–400ms |
| `GET` | `/demo/products` | Paginated product listing | 50–300ms |
| `POST` | `/demo/ai/analyze` | Heavy AI processing — 15% chance of 503 | 2–6s |

## Databases

| Database | Purpose |
|----------|---------|
| `ApiFlowDev` | Development and staging traffic |
| `ApiFlowProd` | Production traffic |

Switch by changing `MONGODB_DB_NAME` in `apps/server/.env`.

## Deployment

| Service | Platform |
|---------|----------|
| Client (Next.js) | Vercel |
| Server (NestJS) | Railway |
| Database | MongoDB Atlas |

**Railway** — set Root Directory to `apps/server`, Build Command to `npm run build`, Start Command to `node dist/main.js`.

**Vercel** — set Root Directory to `apps/client`, Build Command to `cd ../.. && npx turbo run build --filter=client...`, Install Command to `cd ../.. && npm install`.
