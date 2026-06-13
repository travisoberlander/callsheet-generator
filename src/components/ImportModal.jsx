import { useEffect, useState } from "react";
import { X, CalendarDays, Loader2, AlertCircle, ChevronRight } from "lucide-react";

// Fetches upcoming shoots from /api/shoots (the Vercel serverless function that
// holds the Notion token) and lets the user prefill a call sheet from one.
export default function ImportModal({ onClose, onPick }) {
  const [state, setState] = useState("loading"); // loading | ok | error
  const [shoots, setShoots] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    fetch("/api/shoots")
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({})))?.error || `HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!live) return;
        setShoots(data.shoots || []);
        setState("ok");
      })
      .catch((err) => {
        if (!live) return;
        setMessage(String(err.message || err));
        setState("error");
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="no-print fixed inset-0 z-50 grid place-items-center bg-slate-900/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-700 bg-slate-850 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-700 px-5 py-3.5">
          <CalendarDays size={16} className="text-amber" />
          <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-200">
            Import from Shoot Calendar
          </h2>
          <button onClick={onClose} className="ml-auto text-slate-500 transition hover:text-slate-200">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scroll-thin p-2">
          {state === "loading" && (
            <div className="flex items-center gap-2 px-4 py-10 text-sm text-slate-400">
              <Loader2 size={16} className="animate-spin" /> Loading shoots from Notion…
            </div>
          )}

          {state === "error" && (
            <div className="m-2 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber">
                <AlertCircle size={15} /> Couldn’t reach the shoot calendar
              </div>
              <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-slate-400">{message}</p>
              <p className="mt-2.5 text-[12px] leading-relaxed text-slate-400">
                The import needs the <code className="text-slate-300">/api/shoots</code> function running with a
                <code className="text-slate-300"> NOTION_TOKEN</code>. Run <code className="text-slate-300">vercel dev</code> locally,
                or just fill the form by hand — everything else works offline.
              </p>
            </div>
          )}

          {state === "ok" && shoots.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-slate-400">No upcoming shoots found.</p>
          )}

          {state === "ok" &&
            shoots.map((s, i) => (
              <button
                key={i}
                onClick={() => onPick(s)}
                className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-800"
              >
                <div className="w-[78px] shrink-0 font-mono text-[11px] text-amber">{s.date || "TBD"}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-100">{s.title || "Untitled shoot"}</div>
                  <div className="truncate text-[11px] text-slate-500">
                    {[s.type, s.location, s.status].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>
                <ChevronRight size={15} className="shrink-0 text-slate-600 transition group-hover:text-amber" />
              </button>
            ))}
        </div>

        <div className="border-t border-slate-700 px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Prefills production · date · location — you fill the rest
        </div>
      </div>
    </div>
  );
}
