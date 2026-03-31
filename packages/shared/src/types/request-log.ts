export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type Environment = 'dev' | 'staging' | 'prod';

export interface RequestLog {
  _id: string;
  method: HttpMethod;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  environment: Environment;
  errorMessage?: string;
  createdAt: string;
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
  method?: HttpMethod;
  endpoint?: string;
  statusCode?: number;
  environment?: Environment;
  startDate?: string;
  endDate?: string;
  search?: string;
}
