interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = "No data found",
  description = "There are no entries matching your criteria.",
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon ? (
        <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border flex items-center justify-center text-muted mb-4">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 rounded-2xl bg-surface-raised border border-border flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      )}
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      <p className="text-xs text-muted max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
