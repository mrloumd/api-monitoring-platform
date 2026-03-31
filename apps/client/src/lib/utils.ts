/** Format milliseconds to human-readable string */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/** Format a date string to relative time (e.g. "3 min ago") */
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (day > 0) return `${day}d ago`;
  if (hour > 0) return `${hour}h ago`;
  if (min > 0) return `${min}m ago`;
  return `${sec}s ago`;
}

/** Format ISO date to short readable form */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Get status code color category */
export function getStatusCategory(
  code: number,
): "success" | "info" | "warning" | "error" {
  if (code < 300) return "success";
  if (code < 400) return "info";
  if (code < 500) return "warning";
  return "error";
}

/** Get method color key */
export function getMethodColor(method: string): string {
  const map: Record<string, string> = {
    GET: "blue",
    POST: "emerald",
    PUT: "amber",
    PATCH: "orange",
    DELETE: "rose",
  };
  return map[method] ?? "slate";
}

/** Truncate long strings */
export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

/** Format number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(Math.round(n));
}
