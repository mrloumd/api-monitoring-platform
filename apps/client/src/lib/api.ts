import axios from "axios";
import type {
  PaginatedResponse,
  QueryRequestLogParams,
  RequestLog,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

export const requestLogsApi = {
  getAll: (params?: QueryRequestLogParams) =>
    api.get<PaginatedResponse<RequestLog>>("/request-logs", { params }),
  getById: (id: string) => api.get<RequestLog>(`/request-logs/${id}`),
  create: (data: Partial<RequestLog>) => api.post<RequestLog>("/request-logs", data),
};

export const analyticsApi = {
  getSummary: () => api.get("/analytics/summary"),
  getStatusCodes: () => api.get("/analytics/status-codes"),
  getResponseTimes: () => api.get("/analytics/response-times"),
  getTopEndpoints: () => api.get("/analytics/top-endpoints"),
  getErrors: (limit?: number) =>
    api.get("/analytics/errors", { params: { limit } }),
  getTrends: (days?: number) =>
    api.get("/analytics/trends", { params: { days } }),
};

export const healthApi = {
  check: () => api.get("/health"),
};

export default api;
