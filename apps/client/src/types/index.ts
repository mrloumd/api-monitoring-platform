export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Environment = "dev" | "staging" | "prod";

export interface RequestLog {
  _id: string;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  environment: Environment;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryRequestLogParams {
  page?: number;
  limit?: number;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  environment?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

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

export interface RequestTrend {
  date: string;
  total: number;
  errors: number;
}
