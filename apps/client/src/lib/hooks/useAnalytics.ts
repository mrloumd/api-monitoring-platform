"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import type {
  AnalyticsSummary,
  StatusCodeDistribution,
  ResponseTimeStats,
  TopEndpoint,
  RequestLog,
  RequestTrend,
} from "@/types";

const POLL = 30_000;

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: ["analytics", "summary"],
    queryFn: () => analyticsApi.getSummary().then((r) => r.data),
    refetchInterval: POLL,
  });
}

export function useStatusCodes() {
  return useQuery<StatusCodeDistribution[]>({
    queryKey: ["analytics", "status-codes"],
    queryFn: () => analyticsApi.getStatusCodes().then((r) => r.data),
    refetchInterval: POLL,
  });
}

export function useResponseTimes() {
  return useQuery<ResponseTimeStats[]>({
    queryKey: ["analytics", "response-times"],
    queryFn: () => analyticsApi.getResponseTimes().then((r) => r.data),
    refetchInterval: POLL,
  });
}

export function useTopEndpoints() {
  return useQuery<TopEndpoint[]>({
    queryKey: ["analytics", "top-endpoints"],
    queryFn: () => analyticsApi.getTopEndpoints().then((r) => r.data),
    refetchInterval: POLL,
  });
}

export function useErrorLogs(limit?: number) {
  return useQuery<RequestLog[]>({
    queryKey: ["analytics", "errors", limit],
    queryFn: () => analyticsApi.getErrors(limit).then((r) => r.data),
    refetchInterval: POLL,
  });
}

export function useRequestTrends(days?: number) {
  return useQuery<RequestTrend[]>({
    queryKey: ["analytics", "trends", days],
    queryFn: () => analyticsApi.getTrends(days).then((r) => r.data),
    refetchInterval: POLL,
  });
}
