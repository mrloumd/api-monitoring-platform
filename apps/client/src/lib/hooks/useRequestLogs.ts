"use client";

import { useQuery } from "@tanstack/react-query";
import { requestLogsApi } from "@/lib/api";
import type { QueryRequestLogParams } from "@/types";

export function useRequestLogs(params?: QueryRequestLogParams) {
  return useQuery({
    queryKey: ["request-logs", params],
    queryFn: () => requestLogsApi.getAll(params).then((r) => r.data),
  });
}

export function useRequestLog(id: string) {
  return useQuery({
    queryKey: ["request-log", id],
    queryFn: () => requestLogsApi.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}
