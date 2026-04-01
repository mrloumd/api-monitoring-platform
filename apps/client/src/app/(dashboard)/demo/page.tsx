"use client";

import { useRef, useState } from "react";
import { demoApi } from "@/lib/api";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { formatResponseTime } from "@/lib/utils";
import axios from "axios";
import api from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RunState = "idle" | "loading" | "done";

interface TextField {
  kind: "text" | "email" | "password" | "textarea" | "number";
  key: string;
  label: string;
  placeholder: string;
}

interface EndpointDef {
  id: string;
  method: "GET" | "POST";
  path: string;
  description: string;
  detail: string;
  color: string;
  fields: TextField[];
  hasFileInput?: boolean;
  run: (values: Record<string, string>, file?: File | null) => Promise<unknown>;
}

// ---------------------------------------------------------------------------
// Endpoint definitions
// ---------------------------------------------------------------------------

const ENDPOINTS: EndpointDef[] = [
  {
    id: "upload",
    method: "POST",
    path: "/demo/files/upload",
    description: "File Upload",
    detail: "Pick a real file from your system. Accepts pdf, jpg, png, docx, xlsx, csv, zip (max 10 MB). Not saved to DB.",
    color: "blue",
    fields: [],
    hasFileInput: true,
    run: (_values, file) => {
      if (!file) return Promise.reject(new Error("No file selected"));
      const fd = new FormData();
      fd.append("file", file);
      return api.post("/demo/files/upload", fd).then((r) => r.data);
    },
  },
  {
    id: "register",
    method: "POST",
    path: "/demo/users",
    description: "User Registration",
    detail: "Email is validated server-side. 20% chance of 409 Conflict (duplicate email), 5% chance of 500.",
    color: "emerald",
    fields: [
      { kind: "text", key: "name", label: "Full name", placeholder: "Jane Doe" },
      { kind: "email", key: "email", label: "Email address", placeholder: "jane@example.com" },
    ],
    run: (v) =>
      demoApi.createUser({ name: v.name || "Jane Doe", email: v.email || "jane@example.com" }).then((r) => r.data),
  },
  {
    id: "login",
    method: "POST",
    path: "/demo/auth/login",
    description: "Authentication",
    detail: "Email + password validated. 30% chance of 401 Unauthorized, 5% chance of 500.",
    color: "violet",
    fields: [
      { kind: "email", key: "email", label: "Email address", placeholder: "user@example.com" },
      { kind: "password", key: "password", label: "Password", placeholder: "Min 6 characters" },
    ],
    run: (v) =>
      demoApi.login({ email: v.email || "user@example.com", password: v.password || "secret123" }).then((r) => r.data),
  },
  {
    id: "products",
    method: "GET",
    path: "/demo/products",
    description: "Product Listing",
    detail: "Paginated response with 50–300ms delay. 3% chance of 500.",
    color: "amber",
    fields: [
      { kind: "number", key: "page", label: "Page", placeholder: "1" },
      { kind: "number", key: "limit", label: "Items per page", placeholder: "10" },
    ],
    run: (v) =>
      demoApi.getProducts({ page: v.page || 1, limit: v.limit || 10 }).then((r) => r.data),
  },
  {
    id: "ai",
    method: "POST",
    path: "/demo/ai/analyze",
    description: "AI Analysis",
    detail: "Heavy task with 2–6s processing delay. 15% chance of 503 Service Unavailable.",
    color: "rose",
    fields: [
      { kind: "textarea", key: "text", label: "Input text", placeholder: "Enter text to analyze…" },
    ],
    run: (v) =>
      demoApi.analyzeWithAI({ text: v.text || "Analyze this product review." }).then((r) => r.data),
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// ---------------------------------------------------------------------------
// HTTP status badge
// ---------------------------------------------------------------------------

function HttpStatusBadge({ code }: { code: number }) {
  const color =
    code < 300 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    : code < 400 ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
    : code < 500 ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
    : "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-mono font-semibold ${color}`}>
      {code}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Endpoint card
// ---------------------------------------------------------------------------

interface CardState {
  status: RunState;
  statusCode: number | null;
  responseTime: number | null;
  response: unknown;
  error: string | null;
}

const ACCENT: Record<string, string> = {
  blue:   "border-blue-500/30   bg-blue-500/5",
  emerald:"border-emerald-500/30 bg-emerald-500/5",
  violet: "border-violet-500/30  bg-violet-500/5",
  amber:  "border-amber-500/30   bg-amber-500/5",
  rose:   "border-rose-500/30    bg-rose-500/5",
};

const DOT: Record<string, string> = {
  blue: "bg-blue-400", emerald: "bg-emerald-400",
  violet: "bg-violet-400", amber: "bg-amber-400", rose: "bg-rose-400",
};

function EndpointCard({ ep }: { ep: EndpointDef }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<CardState>({
    status: "idle", statusCode: null, responseTime: null, response: null, error: null,
  });

  // Client-side field validation
  function validate(): boolean {
    const errs: Record<string, string> = {};
    for (const f of ep.fields) {
      const v = values[f.key] ?? "";
      if (f.kind === "email" && v && !isValidEmail(v)) {
        errs[f.key] = "Enter a valid email address";
      }
      if (f.kind === "password" && v && v.length < 6) {
        errs[f.key] = "Password must be at least 6 characters";
      }
    }
    if (ep.hasFileInput && !file) {
      setFileError("Please select a file");
      return false;
    }
    setFieldErrors(errs);
    setFileError(null);
    return Object.keys(errs).length === 0;
  }

  async function handleRun() {
    if (!validate()) return;
    setState({ status: "loading", statusCode: null, responseTime: null, response: null, error: null });
    const start = Date.now();
    try {
      const data = await ep.run(values, file);
      setState({
        status: "done",
        statusCode: ep.id === "register" ? 201 : 200,
        responseTime: Date.now() - start,
        response: data,
        error: null,
      });
    } catch (err) {
      const elapsed = Date.now() - start;
      if (axios.isAxiosError(err) && err.response) {
        setState({ status: "done", statusCode: err.response.status, responseTime: elapsed, response: err.response.data, error: null });
      } else {
        setState({ status: "done", statusCode: 0, responseTime: elapsed, response: null, error: "Network error — is the server running?" });
      }
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileError(null);
    if (f && f.size > 10 * 1024 * 1024) {
      setFileError("File exceeds 10 MB limit");
      setFile(null);
    }
  }

  const ALLOWED_ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.gif,.txt,.csv,.docx,.xlsx,.zip";

  return (
    <div className={`rounded-2xl border bg-surface flex flex-col overflow-hidden ${ACCENT[ep.color]}`}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-border/50">
        <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${DOT[ep.color]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <MethodBadge method={ep.method} size="sm" />
            <code className="text-xs font-mono text-foreground">{ep.path}</code>
          </div>
          <p className="text-sm font-semibold text-foreground mt-1">{ep.description}</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{ep.detail}</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-4 space-y-3 flex-1">
        {/* File picker */}
        {ep.hasFileInput && (
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
              File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
                ${fileError ? "border-red-500/50 bg-red-500/5" : "border-border bg-surface-raised hover:border-brand/50"}`}
            >
              <svg className="w-4 h-4 text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className={`text-xs truncate ${file ? "text-foreground" : "text-muted"}`}>
                {file ? `${file.name} — ${formatBytes(file.size)}` : "Click to choose a file…"}
              </span>
              <input ref={fileInputRef} type="file" accept={ALLOWED_ACCEPT} className="hidden" onChange={handleFileChange} />
            </div>
            {fileError && <p className="text-[11px] text-red-400 mt-1">{fileError}</p>}
            <p className="text-[10px] text-muted mt-1">pdf, jpg, png, webp, gif, txt, csv, docx, xlsx, zip · max 10 MB</p>
          </div>
        )}

        {/* Text fields */}
        {ep.fields.map((f) => (
          <div key={f.key}>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">
              {f.label}
            </label>
            {f.kind === "textarea" ? (
              <textarea
                rows={3}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full text-xs bg-surface-raised border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none focus:border-brand transition-colors font-mono resize-none"
              />
            ) : (
              <input
                type={f.kind}
                value={values[f.key] ?? ""}
                onChange={(e) => {
                  setValues((v) => ({ ...v, [f.key]: e.target.value }));
                  if (fieldErrors[f.key]) setFieldErrors((e) => ({ ...e, [f.key]: "" }));
                }}
                placeholder={f.placeholder}
                className={`w-full text-xs bg-surface-raised border rounded-lg px-3 py-2 text-foreground placeholder:text-muted focus:outline-none transition-colors font-mono
                  ${fieldErrors[f.key] ? "border-red-500/50 focus:border-red-500" : "border-border focus:border-brand"}`}
              />
            )}
            {fieldErrors[f.key] && (
              <p className="text-[11px] text-red-400 mt-1">{fieldErrors[f.key]}</p>
            )}
          </div>
        ))}

        <button
          onClick={handleRun}
          disabled={state.status === "loading"}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-light disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
        >
          {state.status === "loading" ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Request
            </>
          )}
        </button>
      </div>

      {/* Response */}
      {state.status === "done" && (
        <div className="px-4 pb-4 space-y-2">
          <div className="h-px bg-border/50" />
          <div className="flex items-center gap-3 pt-1">
            {state.statusCode != null && state.statusCode > 0 && (
              <HttpStatusBadge code={state.statusCode} />
            )}
            {state.responseTime != null && (
              <span className="text-xs text-muted font-mono">{formatResponseTime(state.responseTime)}</span>
            )}
            <span className="text-[10px] text-emerald-400 ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              logged
            </span>
          </div>
          {state.error ? (
            <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2 border border-red-400/20">
              {state.error}
            </p>
          ) : (
            <pre className="text-[11px] font-mono text-muted bg-surface-raised rounded-lg p-3 overflow-auto max-h-52 border border-border/50 leading-relaxed">
              {JSON.stringify(state.response, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DemoPage() {
  const [runningAll, setRunningAll] = useState(false);

  async function handleRunAll() {
    setRunningAll(true);
    for (const ep of ENDPOINTS) {
      try { await ep.run({}, null); } catch { /* each card shows its own result */ }
      await new Promise((r) => setTimeout(r, 400));
    }
    setRunningAll(false);
  }

  return (
    <div className="flex-1 p-6 space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">API Playground</h1>
          <p className="text-xs text-muted mt-0.5">
            Trigger live API calls — each request is logged and visible in Dashboard &amp; Requests.
          </p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={runningAll}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border border-brand text-brand hover:bg-brand/10 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-all"
        >
          {runningAll ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running all…
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Run All
            </>
          )}
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
        <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs text-muted leading-relaxed">
          Each endpoint simulates realistic production behavior — random delays, occasional errors, and varied status codes.
          All requests are captured by the logging interceptor and stored in{" "}
          <span className="text-foreground font-medium">ApiFlowDev</span>.
          File uploads are processed in memory and <span className="text-foreground font-medium">never persisted</span>.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {ENDPOINTS.map((ep) => (
          <EndpointCard key={ep.id} ep={ep} />
        ))}
      </div>
    </div>
  );
}
