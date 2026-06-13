import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

// Section label in the editor: monospace, uppercase, amber tick — the
// production-document convention carried into the tool chrome.
export function Section({ title, count, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-slate-700/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-800/60"
      >
        <span className="h-3.5 w-[3px] rounded-full bg-amber" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          {title}
        </span>
        {count != null && (
          <span className="font-mono text-[10px] text-slate-500">[{count}]</span>
        )}
        <ChevronDown
          size={15}
          strokeWidth={2.5}
          className={`ml-auto text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-3 px-5 pb-5 pt-1">{children}</div>}
    </section>
  );
}

export function Field({ label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      )}
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25"
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      )}
      <textarea
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/25"
      />
    </label>
  );
}

// Generic repeatable rows. `columns` describes the fields; rows are plain objects.
export function RepeatTable({ rows, columns, onChange, addLabel = "Add row" }) {
  const update = (i, key, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r));
    onChange(next);
  };
  const add = () => onChange([...rows, Object.fromEntries(columns.map((c) => [c.key, ""]))]);
  const remove = (i) => onChange(rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows);

  return (
    <div className="space-y-2.5">
      {rows.map((row, i) => (
        <div
          key={i}
          className="group relative rounded-lg border border-slate-700/70 bg-slate-800/40 p-2.5"
        >
          <div className="grid grid-cols-12 gap-2">
            {columns.map((c) => (
              <div key={c.key} className={c.span || "col-span-6"}>
                <input
                  value={row[c.key] ?? ""}
                  placeholder={c.label}
                  onChange={(e) => update(i, c.key, e.target.value)}
                  className="w-full rounded border border-slate-700 bg-slate-900/70 px-2.5 py-1.5 text-[13px] text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-amber focus:ring-1 focus:ring-amber/30"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            title="Remove row"
            className="absolute -right-2 -top-2 hidden h-6 w-6 place-items-center rounded-full border border-slate-600 bg-slate-800 text-slate-400 transition hover:border-safety hover:text-safety group-hover:grid"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-slate-600 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-400 transition hover:border-amber hover:text-amber"
      >
        <Plus size={13} strokeWidth={2.5} /> {addLabel}
      </button>
    </div>
  );
}
