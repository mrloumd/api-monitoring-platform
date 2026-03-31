"use client";

import { useState } from "react";
import {
  useAnalyticsSummary,
  useRequestTrends,
  useStatusCodes,
  useResponseTimes,
  useTopEndpoints,
} from "@/lib/hooks/useAnalytics";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { RequestVolumeChart } from "@/components/charts/RequestVolumeChart";
import { StatusDistributionChart } from "@/components/charts/StatusDistributionChart";
import { ResponseTimeChart } from "@/components/charts/ResponseTimeChart";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { formatNumber, formatResponseTime } from "@/lib/utils";

export default function AnalyticsPage() {
  const [trendDays, setTrendDays] = useState(14);
  const { data: summary, isLoading: sumLoading } = useAnalyticsSummary();
  const { data: trends, isLoading: trendsLoading } = useRequestTrends(trendDays);
  const { data: statusCodes, isLoading: statusLoading } = useStatusCodes();
  const { data: responseTimes, isLoading: rtLoading } = useResponseTimes();
  const { data: topEndpoints } = useTopEndpoints();

  return (
    <div className="flex-1 p-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-xs text-muted mt-0.5">Aggregated metrics and performance insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Requests" value={summary ? formatNumber(summary.totalRequests) : "—"} loading={sumLoading} />
        <MetricCard title="Total Errors" value={summary ? formatNumber(summary.totalErrors) : "—"} variant="error" loading={sumLoading} />
        <MetricCard
          title="Error Rate"
          value={summary ? `${summary.errorRate}%` : "—"}
          variant={summary && summary.errorRate > 10 ? "warning" : "default"}
          loading={sumLoading}
        />
        <MetricCard
          title="Avg Response"
          value={summary ? formatResponseTime(summary.avgResponseTime) : "—"}
          variant={summary && summary.avgResponseTime > 500 ? "warning" : "default"}
          loading={sumLoading}
        />
      </div>

      {/* Request volume trend */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Request Volume Over Time</p>
            <p className="text-xs text-muted">Daily request and error counts</p>
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
        {trendsLoading ? <PageLoader /> : trends ? <RequestVolumeChart data={trends} /> : null}
      </div>

      {/* Status + Response time charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Status Code Distribution</p>
            <p className="text-xs text-muted">Breakdown by HTTP response status</p>
          </div>
          {statusLoading ? <PageLoader /> : statusCodes ? <StatusDistributionChart data={statusCodes} /> : null}

          {/* Status legend */}
          {statusCodes && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusCodes.map((s) => (
                <div key={s.statusCode} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted">{s.statusCode}</span>
                  <span className="text-foreground font-semibold">{s.count} <span className="text-muted font-normal">({s.percentage}%)</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-foreground">Slowest Endpoints</p>
            <p className="text-xs text-muted">Average response time by endpoint (top 8)</p>
          </div>
          {rtLoading ? <PageLoader /> : responseTimes ? <ResponseTimeChart data={responseTimes} /> : null}
        </div>
      </div>

      {/* Top endpoints table */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Endpoint Performance</p>
          <p className="text-xs text-muted">All endpoints ranked by call volume</p>
        </div>
        {topEndpoints && topEndpoints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["#", "Method", "Endpoint", "Total Calls", "Errors", "Error Rate", "Avg Time", "Slowest"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-semibold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topEndpoints.map((ep, i) => {
                  const errRate = ep.count > 0 ? ((ep.errorCount / ep.count) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={i} className="hover:bg-surface-raised transition-colors">
                      <td className="py-2.5 px-3 text-muted">{i + 1}</td>
                      <td className="py-2.5 px-3"><MethodBadge method={ep.method} size="sm" /></td>
                      <td className="py-2.5 px-3 font-mono text-foreground">{ep.endpoint}</td>
                      <td className="py-2.5 px-3 font-semibold text-foreground">{formatNumber(ep.count)}</td>
                      <td className="py-2.5 px-3 text-red-400">{ep.errorCount}</td>
                      <td className="py-2.5 px-3">
                        <span className={parseFloat(errRate) > 10 ? "text-red-400 font-semibold" : "text-muted"}>
                          {errRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-foreground">{formatResponseTime(ep.avgResponseTime)}</td>
                      <td className="py-2.5 px-3">
                        <div className="w-full max-w-[80px] bg-surface-raised rounded-full h-1.5">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${Math.min((ep.avgResponseTime / 1000) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
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
