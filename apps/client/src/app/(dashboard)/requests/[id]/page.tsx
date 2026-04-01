"use client";

import { use } from "react";
import Link from "next/link";
import { useRequestLog } from "@/lib/hooks/useRequestLogs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { EnvironmentBadge } from "@/components/ui/EnvironmentBadge";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { formatDate, formatResponseTime } from "@/lib/utils";

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: log, isLoading, isError } = useRequestLog(id);

  if (isLoading) return <div className="p-6"><PageLoader /></div>;

  if (isError || !log) {
    return (
      <div className="p-6 animate-fade-up">
        <Link href="/requests" className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground mb-6 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Requests
        </Link>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Request log not found.
        </div>
      </div>
    );
  }

  const isError5xx = log.status_code >= 500;
  const isError4xx = log.status_code >= 400 && log.status_code < 500;

  return (
    <div className="p-6 space-y-5 animate-fade-up">
      {/* Back */}
      <Link href="/requests" className="inline-flex items-center gap-2 text-xs text-muted hover:text-foreground transition-colors">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Requests
      </Link>

      {/* Header */}
      <div className={`rounded-2xl border p-5 ${isError5xx ? "border-red-500/20 bg-red-500/[0.03]" : isError4xx ? "border-amber-500/20 bg-amber-500/[0.03]" : "border-border bg-surface"}`}>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <MethodBadge method={log.method} />
          <code className="text-base font-mono font-semibold text-foreground break-all">
            {log.endpoint}
          </code>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <StatusBadge code={log.status_code} />
          <EnvironmentBadge env={log.environment} />
          <span className="text-xs text-muted">{formatDate(log.created_at)}</span>
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Status Code", value: <StatusBadge code={log.status_code} /> },
          { label: "Response Time", value: <span className={`font-mono font-semibold ${log.response_time > 500 ? "text-amber-400" : "text-foreground"}`}>{formatResponseTime(log.response_time)}</span> },
          { label: "Environment", value: <EnvironmentBadge env={log.environment} /> },
          { label: "Timestamp", value: <span className="text-xs text-foreground">{formatDate(log.created_at)}</span> },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">{label}</p>
            {value}
          </div>
        ))}
      </div>

      {/* Request info */}
      <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Request Details</p>

        <InfoRow label="Request ID" value={log._id} mono />
        <InfoRow label="IP Address" value={log.ip_address} mono />
        <InfoRow label="User Agent" value={log.user_agent} />

        {log.error_message && (
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Error Message</p>
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
              <p className="text-sm text-red-400 font-mono">{log.error_message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm text-foreground break-all ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
