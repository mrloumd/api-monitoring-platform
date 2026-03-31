"use client";

import { useState } from "react";
import Link from "next/link";
import { useErrorLogs } from "@/lib/hooks/useAnalytics";
import { useAnalyticsSummary, useStatusCodes } from "@/lib/hooks/useAnalytics";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatRelativeTime, formatResponseTime, truncate } from "@/lib/utils";

const STATUS_FILTERS = [
  { label: "All Errors", value: "" },
  { label: "4xx Client", value: "4" },
  { label: "5xx Server", value: "5" },
];

export default function ErrorsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: errors, isLoading } = useErrorLogs(100);
  const { data: summary } = useAnalyticsSummary();
  const { data: statusCodes } = useStatusCodes();

  const errorStatusCodes = statusCodes?.filter((s) => s.statusCode >= 400) ?? [];
  const clientErrors = errorStatusCodes.filter((s) => s.statusCode < 500);
  const serverErrors = errorStatusCodes.filter((s) => s.statusCode >= 500);

  const filteredErrors = (errors ?? []).filter((e) => {
    if (!statusFilter) return true;
    return String(e.statusCode).startsWith(statusFilter);
  });

  return (
    <div className="flex-1 p-6 space-y-5 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Errors</h1>
        <p className="text-xs text-muted mt-0.5">4xx and 5xx responses — recent 100 entries</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="Error Rate"
          value={summary ? `${summary.errorRate}%` : "—"}
          subtitle="of all requests"
          variant={summary && summary.errorRate > 10 ? "warning" : "default"}
        />
        <MetricCard
          title="4xx Client Errors"
          value={clientErrors.reduce((s, e) => s + e.count, 0)}
          subtitle="bad requests, unauthorized, not found"
          variant="warning"
        />
        <MetricCard
          title="5xx Server Errors"
          value={serverErrors.reduce((s, e) => s + e.count, 0)}
          subtitle="internal errors, timeouts"
          variant="error"
        />
      </div>

      {/* Status code breakdown */}
      {errorStatusCodes.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Error Breakdown by Status Code</p>
          <div className="flex flex-wrap gap-2">
            {errorStatusCodes.map((s) => {
              const is5xx = s.statusCode >= 500;
              return (
                <div
                  key={s.statusCode}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    is5xx
                      ? "border-red-500/20 bg-red-500/[0.05]"
                      : "border-amber-500/20 bg-amber-500/[0.05]"
                  }`}
                >
                  <span className={`font-mono text-sm font-bold ${is5xx ? "text-red-400" : "text-amber-500"}`}>
                    {s.statusCode}
                  </span>
                  <span className="text-xs text-foreground font-semibold">{s.count}</span>
                  <span className="text-[10px] text-muted">({s.percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error log table */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Error Log</p>
            <p className="text-xs text-muted">{filteredErrors.length} entries</p>
          </div>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised border border-border">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  statusFilter === f.value ? "bg-brand text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <PageLoader />
        ) : filteredErrors.length === 0 ? (
          <EmptyState
            title="No errors found"
            description="No error logs match the selected filter."
            icon={
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Method", "Endpoint", "Status", "Response Time", "Error Message", "Env", "Time"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredErrors.map((log) => (
                  <tr
                    key={log._id}
                    className={`hover:bg-surface-raised transition-colors ${
                      log.statusCode >= 500 ? "bg-red-500/[0.03]" : "bg-amber-500/[0.02]"
                    }`}
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <MethodBadge method={log.method} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 max-w-[180px]">
                      <Link
                        href={`/requests/${log._id}`}
                        className="font-mono text-foreground hover:text-brand transition-colors"
                        title={log.endpoint}
                      >
                        {truncate(log.endpoint, 30)}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge code={log.statusCode} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap text-foreground">
                      {formatResponseTime(log.responseTime)}
                    </td>
                    <td className="py-2.5 px-3 max-w-[220px]">
                      {log.errorMessage ? (
                        <span className="text-red-400 truncate block" title={log.errorMessage}>
                          {truncate(log.errorMessage, 45)}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <EnvironmentBadge env={log.environment} />
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-muted" title={formatDate(log.createdAt)}>
                      {formatRelativeTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
