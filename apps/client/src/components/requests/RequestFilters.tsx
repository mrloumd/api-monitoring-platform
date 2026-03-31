"use client";

import { type QueryRequestLogParams } from "@/types";

interface Props {
  filters: QueryRequestLogParams;
  onChange: (filters: QueryRequestLogParams) => void;
  onReset: () => void;
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ENVIRONMENTS = ["dev", "staging", "prod"];
const STATUS_GROUPS = [
  { label: "2xx Success", value: "2" },
  { label: "3xx Redirect", value: "3" },
  { label: "4xx Client Error", value: "4" },
  { label: "5xx Server Error", value: "5" },
];

export function RequestFilters({ filters, onChange, onReset }: Props) {
  const hasFilters =
    filters.method || filters.environment || filters.search || filters.startDate || filters.endDate;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search endpoint or error message…"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined, page: 1 })}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-surface-raised text-foreground placeholder-muted focus:outline-none focus:border-brand transition-colors"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2">
        {/* Method */}
        <select
          value={filters.method ?? ""}
          onChange={(e) => onChange({ ...filters, method: e.target.value || undefined, page: 1 })}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-raised text-foreground focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Methods</option>
          {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>

        {/* Environment */}
        <select
          value={filters.environment ?? ""}
          onChange={(e) => onChange({ ...filters, environment: e.target.value || undefined, page: 1 })}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-raised text-foreground focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Envs</option>
          {ENVIRONMENTS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        {/* Status group filter */}
        <select
          value={filters.statusCode ? String(Math.floor(filters.statusCode / 100)) : ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange({
              ...filters,
              statusCode: v ? parseInt(v) * 100 : undefined,
              page: 1,
            });
          }}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-raised text-foreground focus:outline-none focus:border-brand cursor-pointer"
        >
          <option value="">All Status</option>
          {STATUS_GROUPS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={filters.startDate ?? ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined, page: 1 })}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-raised text-foreground focus:outline-none focus:border-brand cursor-pointer"
        />
        <input
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined, page: 1 })}
          className="px-3 py-1.5 text-xs rounded-lg border border-border bg-surface-raised text-foreground focus:outline-none focus:border-brand cursor-pointer"
        />

        {hasFilters && (
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted hover:text-foreground hover:bg-surface-raised transition-all"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
