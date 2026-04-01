export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type Environment = "dev" | "staging" | "prod";

export interface RequestLog {
  _id: string;
  method: HttpMethod;
  endpoint: string;
  status_code: number;
  response_time: number;
  ip_address: string;
  user_agent: string;
  environment: Environment;
  error_message?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface QueryRequestLogParams {
  page?: number;
  limit?: number;
  method?: string;
  endpoint?: string;
  status_code?: number;
  environment?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface AnalyticsSummary {
  total_requests: number;
  total_errors: number;
  error_rate: number;
  avg_response_time: number;
}

export interface StatusCodeDistribution {
  status_code: number;
  count: number;
  percentage: number;
}

export interface ResponseTimeStats {
  endpoint: string;
  avg_response_time: number;
  min_response_time: number;
  max_response_time: number;
  count: number;
}

export interface TopEndpoint {
  endpoint: string;
  method: string;
  count: number;
  error_count: number;
  avg_response_time: number;
}

export interface RequestTrend {
  date: string;
  total: number;
  errors: number;
}
