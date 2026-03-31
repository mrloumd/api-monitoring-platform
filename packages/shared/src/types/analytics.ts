export interface AnalyticsSummary {
  totalRequests: number;
  totalErrors: number;
  errorRate: number;
  avgResponseTime: number;
}

export interface StatusCodeDistribution {
  statusCode: number;
  count: number;
  percentage: number;
}

export interface ResponseTimeStats {
  endpoint: string;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  count: number;
}

export interface TopEndpoint {
  endpoint: string;
  method: string;
  count: number;
  errorCount: number;
  avgResponseTime: number;
}

export interface ErrorEntry {
  _id: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  errorMessage?: string;
  environment: string;
  createdAt: string;
}

export interface RequestTrend {
  date: string;
  total: number;
  errors: number;
}
