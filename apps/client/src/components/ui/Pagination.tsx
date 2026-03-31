interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onPageChange }: PaginationProps) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-border">
      <p className="text-xs text-muted">
        Showing <span className="text-foreground font-medium">{start}–{end}</span> of{" "}
        <span className="text-foreground font-medium">{total}</span> entries
      </p>
      <div className="flex items-center gap-1">
        <PageBtn disabled={page <= 1} onClick={() => onPageChange(page - 1)} label="←" />
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="px-1 text-muted text-xs">…</span>
          ) : (
            <PageBtn
              key={p}
              active={p === page}
              onClick={() => onPageChange(p as number)}
              label={String(p)}
            />
          ),
        )}
        <PageBtn disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} label="→" />
      </div>
    </div>
  );
}

function PageBtn({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
        active
          ? "bg-brand text-white"
          : disabled
          ? "text-muted cursor-not-allowed opacity-40"
          : "text-muted hover:text-foreground hover:bg-surface-raised"
      }`}
    >
      {label}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}
