"use client";

import Link from "next/link";
import type { RequestLog } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime, formatResponseTime, truncate } from "@/lib/utils";

interface Props {
  logs: RequestLog[];
}

export function RequestsTable({ logs }: Props) {
  if (!logs.length) {
    return (
      <EmptyState
        title="No requests found"
        description="No request logs match the current filters. Try adjusting your search."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {["Method", "Endpoint", "Status", "Response Time", "Environment", "Time"].map((h) => (
              <th key={h} className="text-left py-3 px-3 text-[10px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr
              key={log._id}
              className={`group hover:bg-surface-raised transition-colors duration-100 ${
                log.statusCode >= 500
                  ? "bg-red-500/[0.03]"
                  : log.statusCode >= 400
                  ? "bg-amber-500/[0.02]"
                  : ""
              }`}
            >
              <td className="py-3 px-3 whitespace-nowrap">
                <MethodBadge method={log.method} size="sm" />
              </td>
              <td className="py-3 px-3 max-w-[260px]">
                <Link
                  href={`/requests/${log._id}`}
                  className="font-mono text-xs text-foreground hover:text-brand transition-colors"
                  title={log.endpoint}
                >
                  {truncate(log.endpoint, 40)}
                </Link>
                {log.errorMessage && (
                  <p className="text-[10px] text-red-400 mt-0.5 truncate max-w-[240px]">
                    {log.errorMessage}
                  </p>
                )}
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <StatusBadge code={log.statusCode} size="sm" />
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <span
                  className={`font-mono text-xs ${
                    log.responseTime > 500
                      ? "text-amber-400"
                      : log.responseTime > 1000
                      ? "text-red-400"
                      : "text-foreground"
                  }`}
                >
                  {formatResponseTime(log.responseTime)}
                </span>
              </td>
              <td className="py-3 px-3 whitespace-nowrap">
                <EnvironmentBadge env={log.environment} />
              </td>
              <td className="py-3 px-3 whitespace-nowrap text-xs text-muted">
                {formatRelativeTime(log.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
