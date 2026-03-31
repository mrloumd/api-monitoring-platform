interface StatusBadgeProps {
  code: number;
  size?: "sm" | "md";
}

export function StatusBadge({ code, size = "md" }: StatusBadgeProps) {
  let cls = "";

  if (code < 300) {
    cls = "bg-emerald-500/10 border-emerald-500/25 text-emerald-500";
  } else if (code < 400) {
    cls = "bg-blue-500/10 border-blue-500/25 text-blue-400";
  } else if (code < 500) {
    cls = "bg-amber-500/10 border-amber-500/25 text-amber-500";
  } else {
    cls = "bg-red-500/10 border-red-500/25 text-red-400";
  }

  const px = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs";

  return (
    <span className={`inline-flex items-center rounded border font-mono font-semibold ${cls} ${px}`}>
      {code}
    </span>
  );
}
