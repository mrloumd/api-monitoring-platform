"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { StatusCodeDistribution } from "@/types";

interface Props {
  data: StatusCodeDistribution[];
}

function getBarColor(code: number): string {
  if (code < 300) return "#34d399"; // emerald
  if (code < 400) return "#60a5fa"; // blue
  if (code < 500) return "#fbbf24"; // amber
  return "#f87171"; // red
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{d.statusCode}</p>
      <p className="text-muted">Count: <span className="text-foreground font-medium">{d.count}</span></p>
      <p className="text-muted">Share: <span className="text-foreground font-medium">{d.percentage}%</span></p>
    </div>
  );
};

export function StatusDistributionChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="statusCode"
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-raised)" }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.statusCode} fill={getBarColor(entry.statusCode)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
