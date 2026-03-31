const ENV_STYLES: Record<string, string> = {
  prod: "bg-brand/10 border-brand/20 text-brand",
  staging: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  dev: "bg-slate-500/10 border-slate-500/20 text-muted",
};

export function EnvironmentBadge({ env }: { env: string }) {
  const style = ENV_STYLES[env] ?? ENV_STYLES.dev;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${style}`}>
      {env}
    </span>
  );
}
