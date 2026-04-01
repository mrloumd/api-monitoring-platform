"use client";

import { useAnalyticsSummary, useRequestTrends, useStatusCodes, useTopEndpoints } from "@/lib/hooks/useAnalytics";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { RequestVolumeChart } from "@/components/charts/RequestVolumeChart";
import { StatusDistributionChart } from "@/components/charts/StatusDistributionChart";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { formatNumber, formatResponseTime } from "@/lib/utils";
import { useState } from "react";

export default function DashboardPage() {
  const [trendDays, setTrendDays] = useState(7);
  const { data: summary, isLoading: sumLoading } = useAnalyticsSummary();
  const { data: trends, isLoading: trendsLoading } = useRequestTrends(trendDays);
  const { data: statusCodes, isLoading: statusLoading } = useStatusCodes();
  const { data: topEndpoints } = useTopEndpoints();

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">Real-time platform overview · auto-refreshes every 30s</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-xs text-muted">Live</span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value={summary ? formatNumber(summary.total_requests) : "—"}
          subtitle="all time"
          loading={sumLoading}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />
        <MetricCard
          title="Total Errors"
          value={summary ? formatNumber(summary.total_errors) : "—"}
          subtitle="4xx + 5xx responses"
          loading={sumLoading}
          variant="error"
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          }
        />
        <MetricCard
          title="Error Rate"
          value={summary ? `${summary.error_rate}%` : "—"}
          subtitle="of total requests"
          loading={sumLoading}
          variant={summary && summary.error_rate > 10 ? "warning" : "default"}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          }
        />
        <MetricCard
          title="Avg Response Time"
          value={summary ? formatResponseTime(summary.avg_response_time) : "—"}
          subtitle="across all endpoints"
          loading={sumLoading}
          variant={summary && summary.avg_response_time > 500 ? "warning" : "default"}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Volume trend */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Request Volume</p>
              <p className="text-xs text-muted">Daily totals vs errors</p>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised border border-border">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setTrendDays(d)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    trendDays === d ? "bg-brand text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {trendsLoading ? (
            <PageLoader />
          ) : trends ? (
            <RequestVolumeChart data={trends} />
          ) : null}
        </div>

        {/* Status distribution */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Status Distribution</p>
            <p className="text-xs text-muted">Requests by HTTP status code</p>
          </div>
          {statusLoading ? (
            <PageLoader />
          ) : statusCodes ? (
            <StatusDistributionChart data={statusCodes} />
          ) : null}
        </div>
      </div>

      {/* Top endpoints */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Top Endpoints</p>
          <p className="text-xs text-muted">Most frequently called endpoints</p>
        </div>
        {topEndpoints && topEndpoints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Method", "Endpoint", "Calls", "Errors", "Error Rate", "Avg Response"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topEndpoints.slice(0, 8).map((ep, i) => {
                  const errRate = ep.count > 0 ? ((ep.error_count / ep.count) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={i} className="hover:bg-surface-raised transition-colors">
                      <td className="py-2.5 px-3"><MethodBadge method={ep.method} size="sm" /></td>
                      <td className="py-2.5 px-3 font-mono text-foreground max-w-[200px] truncate">{ep.endpoint}</td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">{formatNumber(ep.count)}</td>
                      <td className="py-2.5 px-3 text-red-400 font-semibold">{ep.error_count}</td>
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${parseFloat(errRate) > 10 ? "text-red-400" : "text-muted"}`}>
                          {errRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-foreground">{formatResponseTime(ep.avg_response_time)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted py-6 text-center">No endpoint data available</p>
        )}
      </div>
    </div>
  );
}
