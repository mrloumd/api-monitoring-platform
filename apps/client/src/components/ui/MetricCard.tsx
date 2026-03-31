interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "error" | "warning" | "success";
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = "default",
  loading,
}: MetricCardProps) {
  const variantStyles = {
    default: "border-border hover:border-brand/30",
    error: "border-red-500/20 bg-red-500/[0.03] hover:border-red-500/40",
    warning: "border-amber-500/20 bg-amber-500/[0.03] hover:border-amber-500/40",
    success: "border-emerald-500/20 bg-emerald-500/[0.03] hover:border-emerald-500/40",
  };

  const iconBg = {
    default: "bg-brand/10 text-brand",
    error: "bg-red-500/10 text-red-400",
    warning: "bg-amber-500/10 text-amber-400",
    success: "bg-emerald-500/10 text-emerald-400",
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
        <div className="h-3 w-24 bg-surface-raised rounded mb-4" />
        <div className="h-7 w-20 bg-surface-raised rounded mb-2" />
        <div className="h-2.5 w-32 bg-surface-raised rounded" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border bg-surface p-5 transition-all duration-200 ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{title}</p>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg[variant]}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      {(subtitle || trend) && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend.positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
          )}
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      )}
    </div>
  );
}
