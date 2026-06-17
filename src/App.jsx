import { useEffect, useMemo, useRef, useState } from "react";
import {
  Printer,
  Download,
  Sparkles,
  FilePlus2,
  FolderOpen,
  Save,
  Trash2,
  Clapperboard,
  PanelLeftClose,
  FileText,
} from "lucide-react";
import Editor from "./components/Editor.jsx";
import CallSheet from "./components/CallSheet.jsx";
import ImportModal from "./components/ImportModal.jsx";
import { emptySheet, sampleSheet, hydrate } from "./lib/model.js";
import {
  loadCurrent,
  saveCurrent,
  listDrafts,
  saveDraft,
  loadDraft,
  deleteDraft,
} from "./lib/storage.js";

// Immutable set on a dotted path: setPath(obj, "times.call", "07:00")
function setPath(obj, path, value) {
  const keys = path.split(".");
  const next = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = next;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return next;
}

// Normalize a freeform call time ("6:00A call", "6A", "07:00") to "HH:MM" for the
// <input type="time"> field. Returns "" if it can't be parsed cleanly.
function parseTime(raw) {
  if (!raw) return "";
  const ampm = String(raw).match(/(\d{1,2})(?::(\d{2}))?\s*([ap])/i);
  if (ampm) {
    let h = Number(ampm[1]) % 12;
    if (/p/i.test(ampm[3])) h += 12;
    return String(h).padStart(2, "0") + ":" + (ampm[2] || "00");
  }
  const h24 = String(raw).match(/^(\d{1,2}):(\d{2})$/);
  if (h24) return h24[1].padStart(2, "0") + ":" + h24[2];
  return "";
}

export default function App() {
  const [sheet, setSheet] = useState(() => {
    const saved = loadCurrent();
    return saved ? hydrate(saved) : emptySheet();
  });
  const [showImport, setShowImport] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState(() => listDrafts());
  const [mobileView, setMobileView] = useState("edit"); // edit | preview
  const [saved, setSaved] = useState("saved");
  const firstRender = useRef(true);

  const set = (path, value) => setSheet((s) => setPath(s, path, value));

  // Autosave the working sheet (debounced)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaved("saving");
    const id = setTimeout(() => {
      saveCurrent(sheet);
      setSaved("saved");
    }, 500);
    return () => clearTimeout(id);
  }, [sheet]);

  const refreshDrafts = () => setDrafts(listDrafts());

  const onNew = () => {
    if (confirm("Start a new blank call sheet? Your current one stays in Drafts only if you saved it.")) {
      setSheet(emptySheet());
    }
  };

  const onSaveDraft = () => {
    const name = prompt("Name this draft:", sheet.production.title || "Untitled call sheet");
    if (name == null) return;
    saveDraft(name, sheet);
    refreshDrafts();
    setShowDrafts(true);
  };

  const onLoadDraft = (id) => {
    const d = loadDraft(id);
    if (d) setSheet(hydrate(d));
    setShowDrafts(false);
  };

  const onDeleteDraft = (id, e) => {
    e.stopPropagation();
    deleteDraft(id);
    refreshDrafts();
  };

  // Merge a shoot into the current sheet (non-destructive prefill). Shared by the
  // Notion import picker and the deep link from the SLATE production calendar.
  const applyShoot = (shoot) => {
    setSheet((s) => {
      const next = { ...s, production: { ...s.production }, times: { ...s.times }, locations: [...s.locations] };
      if (shoot.title) next.production.title = shoot.title;
      if (shoot.date) next.production.date = shoot.date;
      if (shoot.location) {
        next.locations = [{ ...next.locations[0], name: shoot.location }, ...next.locations.slice(1)];
      }
      let callNote = "";
      if (shoot.call) {
        const t = parseTime(shoot.call);
        if (t) next.times.call = t;
        else callNote = `Call: ${shoot.call}`;
      }
      const extra = [shoot.type && `Type: ${shoot.type}`, shoot.talent && `Talent: ${shoot.talent}`, callNote]
        .filter(Boolean)
        .join("\n");
      if (extra) next.notes = next.notes ? `${next.notes}\n${extra}` : extra;
      return next;
    });
  };

  const onPickShoot = (shoot) => {
    applyShoot(shoot);
    setShowImport(false);
  };

  // Deep link from the SLATE production calendar: #cs=<encoded shoot JSON>
  useEffect(() => {
    const m = window.location.hash.match(/cs=([^&]+)/);
    if (!m) return;
    try {
      applyShoot(JSON.parse(decodeURIComponent(m[1])));
    } catch {
      /* ignore a malformed link */
    }
    history.replaceState(null, "", window.location.pathname + window.location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doc = useMemo(() => <CallSheet sheet={sheet} />, [sheet]);

  return (
    <div className="print-root flex h-screen flex-col overflow-hidden bg-slate-900">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header className="no-print z-20 flex shrink-0 items-center gap-3 border-b border-slate-700/80 bg-slate-850/95 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-amber text-ink">
            <Clapperboard size={17} strokeWidth={2.25} />
          </div>
          <div className="leading-none">
            <div className="font-display text-[15px] font-bold tracking-tight text-slate-100">Call Sheet Generator</div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">
              {saved === "saving" ? "saving…" : "autosaved · offline-ready"}
            </div>
          </div>
        </div>

        {/* mobile view toggle */}
        <div className="ml-auto flex rounded-md border border-slate-700 p-0.5 lg:hidden">
          {["edit", "preview"].map((v) => (
            <button
              key={v}
              onClick={() => setMobileView(v)}
              className={`rounded px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${
                mobileView === v ? "bg-amber text-ink" : "text-slate-400"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="ml-auto hidden items-center gap-1.5 lg:flex">
          <ToolBtn icon={Sparkles} label="Sample" onClick={() => setSheet(hydrate(sampleSheet()))} />
          <ToolBtn icon={FilePlus2} label="New" onClick={onNew} />
          <div className="relative">
            <ToolBtn icon={FolderOpen} label="Drafts" onClick={() => { refreshDrafts(); setShowDrafts((v) => !v); }} />
            {showDrafts && (
              <DraftsMenu drafts={drafts} onLoad={onLoadDraft} onDelete={onDeleteDraft} onClose={() => setShowDrafts(false)} />
            )}
          </div>
          <ToolBtn icon={Save} label="Save" onClick={onSaveDraft} />
          <ToolBtn icon={Download} label="Import" onClick={() => setShowImport(true)} accent />
          <button
            onClick={() => window.print()}
            className="ml-1 flex items-center gap-1.5 rounded-md bg-amber px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink transition hover:bg-amber-soft"
          >
            <Printer size={14} strokeWidth={2.5} /> Print / PDF
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Editor rail */}
        <aside
          className={`no-print w-full shrink-0 overflow-y-auto scroll-thin border-r border-slate-700/80 bg-slate-850 lg:block lg:w-[430px] ${
            mobileView === "edit" ? "block" : "hidden"
          }`}
        >
          <Editor sheet={sheet} set={set} />
          {/* mobile action row */}
          <div className="flex flex-wrap gap-2 p-4 lg:hidden">
            <button onClick={() => setSheet(hydrate(sampleSheet()))} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">Sample</button>
            <button onClick={() => setShowImport(true)} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">Import</button>
            <button onClick={onSaveDraft} className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300">Save draft</button>
            <button onClick={() => window.print()} className="rounded-md bg-amber px-3 py-2 text-xs font-semibold text-ink">Print / PDF</button>
          </div>
        </aside>

        {/* Preview */}
        <main
          className={`preview-pane min-w-0 flex-1 overflow-y-auto scroll-thin bg-slate-900 p-5 lg:p-8 ${
            mobileView === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="mx-auto max-w-[850px]">
            <div className="no-print mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <FileText size={12} /> Live preview — prints to US Letter
            </div>
            {doc}
            <div className="no-print h-10" />
          </div>
        </main>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} onPick={onPickShoot} />}
    </div>
  );
}

function ToolBtn({ icon: Icon, label, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider transition ${
        accent
          ? "border-amber/40 text-amber hover:bg-amber/10"
          : "border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100"
      }`}
    >
      <Icon size={13} strokeWidth={2.25} /> {label}
    </button>
  );
}

function DraftsMenu({ drafts, onLoad, onDelete, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-full z-40 mt-1.5 w-72 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-2xl">
        <div className="border-b border-slate-700 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          Saved drafts
        </div>
        {drafts.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-slate-500">No drafts yet. Use “Save”.</p>
        ) : (
          <div className="max-h-72 overflow-y-auto scroll-thin py-1">
            {drafts.map((d) => (
              <div
                key={d.id}
                onClick={() => onLoad(d.id)}
                className="group flex cursor-pointer items-center gap-2 px-3 py-2 transition hover:bg-slate-700/60"
              >
                <PanelLeftClose size={13} className="shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] text-slate-100">{d.name}</div>
                  <div className="font-mono text-[9px] text-slate-500">
                    {d.savedAt ? new Date(d.savedAt).toLocaleString() : ""}
                  </div>
                </div>
                <button onClick={(e) => onDelete(d.id, e)} className="text-slate-600 transition hover:text-safety" title="Delete draft">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
