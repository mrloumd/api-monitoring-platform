/**
 * Seed script — generates realistic demo data for APIFlow.
 * Dev + staging logs → ApiFlowDev collection
 * Prod logs          → ApiFlowProd collection
 *
 * Usage: cd apps/server && npm run seed
 */
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { RequestLogSchema } from '../request-log/schemas/request-log.schema';
import { REQUEST_LOG_MODEL } from '../common/constants';

// ---------------------------------------------------------------------------
// Data tables
// ---------------------------------------------------------------------------

const ENDPOINT_DEFS = [
  { path: '/api/users', methods: ['GET', 'POST'] },
  { path: '/api/users/:id', methods: ['GET', 'PUT', 'DELETE'] },
  { path: '/api/products', methods: ['GET', 'POST'] },
  { path: '/api/products/:id', methods: ['GET', 'PUT', 'DELETE'] },
  { path: '/api/orders', methods: ['GET', 'POST'] },
  { path: '/api/orders/:id', methods: ['GET', 'PUT'] },
  { path: '/api/auth/login', methods: ['POST'] },
  { path: '/api/auth/logout', methods: ['POST'] },
  { path: '/api/auth/profile', methods: ['GET'] },
  { path: '/api/auth/refresh', methods: ['POST'] },
  { path: '/api/dashboard/stats', methods: ['GET'] },
  { path: '/api/reports/daily', methods: ['GET'] },
  { path: '/api/notifications', methods: ['GET'] },
  { path: '/api/settings', methods: ['GET', 'PUT'] },
  { path: '/api/search', methods: ['GET'] },
  { path: '/api/webhooks/stripe', methods: ['POST'] },
  { path: '/api/files/upload', methods: ['POST'] },
  { path: '/api/emails/send', methods: ['POST'] },
];

const IP_ADDRESSES = [
  '192.168.1.1', '10.0.0.5', '172.16.0.1',
  '203.0.113.42', '198.51.100.7', '35.186.224.25',
  '104.154.35.22', '52.66.130.243', '34.89.100.15',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
  'PostmanRuntime/7.36.0', 'axios/1.6.2', 'curl/8.4.0',
  'insomnia/8.4.0', 'python-requests/2.31.0',
];

const ERROR_MESSAGES: Record<number, string[]> = {
  400: [
    'Invalid request body — missing required field: email',
    'Validation failed: id must be a valid integer',
    'Bad request: malformed JSON payload',
    'Missing required header: Authorization',
  ],
  401: [
    'Unauthorized: access token is missing or expired',
    'Invalid credentials',
    'Token signature verification failed',
    'Authentication required for this resource',
  ],
  403: [
    'Forbidden: insufficient role permissions',
    'Access denied — admin role required',
    'IP address is not whitelisted',
  ],
  404: [
    'Resource not found', 'User not found',
    'Product with given id does not exist',
    'Order not found', 'Endpoint does not exist',
  ],
  422: [
    'Unprocessable entity: duplicate email address',
    'Validation error: price must be greater than 0',
  ],
  500: [
    'Internal server error',
    'Database query execution timeout',
    'Unhandled exception in UserService.findOne()',
    'Connection pool exhausted — retry later',
    'Failed to send email: SMTP connection refused',
  ],
  502: ['Bad gateway: upstream service unavailable', 'Failed to connect to microservice'],
};

const ENVIRONMENTS: Array<'dev' | 'staging' | 'prod'> = ['dev', 'staging', 'prod'];
const ENV_WEIGHTS = [0.10, 0.25, 0.65];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generateStatusCode(): number {
  return weightedPick(
    [200, 201, 204, 400, 401, 403, 404, 422, 500, 502],
    [0.42, 0.14, 0.05, 0.08, 0.07, 0.03, 0.07, 0.03, 0.05, 0.02],
  );
}

function generateResponseTime(statusCode: number): number {
  if (statusCode >= 500) return Math.floor(Math.random() * 1500) + 800;
  if (Math.random() < 0.12) return Math.floor(Math.random() * 700) + 350;
  return Math.floor(Math.random() * 240) + 40;
}

function generateLog(daysAgo: number) {
  const def = pick(ENDPOINT_DEFS);
  const method = pick(def.methods);
  const endpoint = def.path.replace(':id', String(Math.floor(Math.random() * 500) + 1));

  let statusCode = generateStatusCode();
  if (method === 'POST' && statusCode === 200) statusCode = 201;
  if (method === 'DELETE' && statusCode === 200) statusCode = 204;

  const errorMessage =
    statusCode >= 400 && ERROR_MESSAGES[statusCode]
      ? pick(ERROR_MESSAGES[statusCode])
      : null;

  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  date.setSeconds(Math.floor(Math.random() * 60));
  date.setMilliseconds(Math.floor(Math.random() * 1000));

  return {
    method,
    endpoint,
    statusCode,
    responseTime: generateResponseTime(statusCode),
    ipAddress: pick(IP_ADDRESSES),
    userAgent: pick(USER_AGENTS),
    environment: weightedPick(ENVIRONMENTS, ENV_WEIGHTS),
    errorMessage,
    createdAt: date,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅  Connected\n');

  const RequestLogModel = mongoose.model(REQUEST_LOG_MODEL, RequestLogSchema);

  await RequestLogModel.deleteMany({});
  console.log('🗑   Cleared existing logs');

  // Generate logs spread over the last 30 days
  const logs: ReturnType<typeof generateLog>[] = [];
  for (let day = 0; day < 30; day++) {
    const count = Math.floor(Math.random() * 25) + 12; // 12-36 per day
    for (let i = 0; i < count; i++) {
      logs.push(generateLog(day));
    }
  }

  await RequestLogModel.insertMany(logs);
  console.log(`🌱  Seeded ${logs.length} request logs`);

  await mongoose.disconnect();
  console.log('👋  Done!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
