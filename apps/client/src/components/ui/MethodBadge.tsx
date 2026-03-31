interface MethodBadgeProps {
  method: string;
  size?: "sm" | "md";
}

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  POST: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  PUT: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  PATCH: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  DELETE: "bg-red-500/10 border-red-500/20 text-red-400",
};

export function MethodBadge({ method, size = "md" }: MethodBadgeProps) {
  const style = METHOD_STYLES[method] ?? "bg-slate-500/10 border-slate-500/20 text-slate-400";
  const px = size === "sm" ? "px-1.5 py-0.5 text-[10px] min-w-[42px]" : "px-2 py-1 text-xs min-w-[50px]";

  return (
    <span className={`inline-flex items-center justify-center rounded border font-mono font-bold ${style} ${px}`}>
      {method}
    </span>
  );
}
