"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ResponseTimeStats } from "@/types";
import { truncate } from "@/lib/utils";

interface Props {
  data: ResponseTimeStats[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ResponseTimeStats;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-lg text-xs max-w-[220px]">
      <p className="font-mono text-[10px] text-muted mb-1.5 break-all">{d.endpoint}</p>
      <p className="text-muted">Avg: <span className="text-foreground font-semibold">{d.avgResponseTime}ms</span></p>
      <p className="text-muted">Min: <span className="text-foreground font-semibold">{d.minResponseTime}ms</span></p>
      <p className="text-muted">Max: <span className="text-foreground font-semibold">{d.maxResponseTime}ms</span></p>
      <p className="text-muted">Calls: <span className="text-foreground font-semibold">{d.count}</span></p>
    </div>
  );
};

export function ResponseTimeChart({ data }: Props) {
  const formatted = data.slice(0, 8).map((d) => ({
    ...d,
    label: truncate(d.endpoint.replace("/api/", ""), 18),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        layout="vertical"
        data={formatted}
        margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        barSize={14}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          unit="ms"
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-raised)" }} />
        <Bar dataKey="avgResponseTime" fill="#1e9aa0" radius={[0, 4, 4, 0]} name="Avg Response Time" />
      </BarChart>
    </ResponsiveContainer>
  );
}
