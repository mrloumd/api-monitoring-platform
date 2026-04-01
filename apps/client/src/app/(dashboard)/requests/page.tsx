"use client";

import { useState } from "react";
import { useRequestLogs } from "@/lib/hooks/useRequestLogs";
import { RequestsTable } from "@/components/requests/RequestsTable";
import { RequestFilters } from "@/components/requests/RequestFilters";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import type { QueryRequestLogParams } from "@/types";

const DEFAULT_FILTERS: QueryRequestLogParams = { page: 1, limit: 20 };

export default function RequestsPage() {
  const [filters, setFilters] = useState<QueryRequestLogParams>(DEFAULT_FILTERS);
  const { data, isLoading, isError } = useRequestLogs(filters);

  function handleFiltersChange(next: QueryRequestLogParams) {
    setFilters({ ...next, page: 1 });
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <div className="flex-1 p-6 space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Request Logs</h1>
          <p className="text-xs text-muted mt-0.5">
            {data ? `${data.total.toLocaleString()} total entries` : "All captured API requests"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <RequestFilters filters={filters} onChange={handleFiltersChange} onReset={handleReset} />

      {/* Table */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-red-400">Failed to load request logs. Check server connection.</p>
          </div>
        ) : (
          <>
            <RequestsTable logs={data?.data ?? []} />
            {data && (
              <Pagination
                page={data.page}
                totalPages={data.total_pages}
                total={data.total}
                limit={data.limit}
                onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
