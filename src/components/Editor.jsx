import { Upload, X } from "lucide-react";
import { Section, Field, TextArea, RepeatTable } from "./ui.jsx";

export default function Editor({ sheet, set }) {
  // `set(path, value)` updates a nested key, e.g. set("times.call", "07:00")
  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("brand.logo", reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {/* Production */}
      <Section title="Production">
        <Field label="Project / Title" value={sheet.production.title} onChange={(v) => set("production.title", v)} placeholder="e.g. Coastal — Spring Campaign" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Production company" value={sheet.brand.productionCompany} onChange={(v) => set("brand.productionCompany", v)} placeholder="Studio / company" />
          <Field label="Shoot date" type="date" value={sheet.production.date} onChange={(v) => set("production.date", v)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Day #" value={sheet.production.day} onChange={(v) => set("production.day", v)} placeholder="2" />
          <Field label="Of days" value={sheet.production.ofDays} onChange={(v) => set("production.ofDays", v)} placeholder="3" />
          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">Status</span>
            <select
              value={sheet.production.status}
              onChange={(e) => set("production.status", e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-amber focus:ring-2 focus:ring-amber/25"
            >
              <option value="PRELIM">PRELIM</option>
              <option value="FINAL">FINAL</option>
              <option value="REVISED">REVISED</option>
            </select>
          </label>
        </div>

        {/* Logo upload */}
        <div className="flex items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-800/40 p-2.5">
          {sheet.brand.logo ? (
            <img src={sheet.brand.logo} alt="logo" className="h-10 w-10 rounded object-contain ring-1 ring-slate-600" />
          ) : (
            <div className="grid h-10 w-10 place-items-center rounded bg-slate-900 text-slate-600">
              <Upload size={16} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Header logo</p>
            <p className="truncate text-[11px] text-slate-500">PNG/SVG, transparent background ideal</p>
          </div>
          <label className="cursor-pointer rounded-md border border-slate-600 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-300 transition hover:border-amber hover:text-amber">
            Upload
            <input type="file" accept="image/*" onChange={onLogo} className="hidden" />
          </label>
          {sheet.brand.logo && (
            <button type="button" onClick={() => set("brand.logo", null)} className="text-slate-500 transition hover:text-safety" title="Remove logo">
              <X size={15} />
            </button>
          )}
        </div>
      </Section>

      {/* Times & conditions */}
      <Section title="Times & Conditions">
        <div className="grid grid-cols-3 gap-3">
          <Field label="General call" type="time" value={sheet.times.call} onChange={(v) => set("times.call", v)} />
          <Field label="Lunch" type="time" value={sheet.times.lunch} onChange={(v) => set("times.lunch", v)} />
          <Field label="Est. wrap" type="time" value={sheet.times.wrap} onChange={(v) => set("times.wrap", v)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sunrise" type="time" value={sheet.times.sunrise} onChange={(v) => set("times.sunrise", v)} />
          <Field label="Sunset" type="time" value={sheet.times.sunset} onChange={(v) => set("times.sunset", v)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Weather" value={sheet.times.weather} onChange={(v) => set("times.weather", v)} placeholder="Clear" className="col-span-1" />
          <Field label="High °" value={sheet.times.tempHigh} onChange={(v) => set("times.tempHigh", v)} placeholder="74" />
          <Field label="Low °" value={sheet.times.tempLow} onChange={(v) => set("times.tempLow", v)} placeholder="58" />
        </div>
      </Section>

      {/* Locations */}
      <Section title="Locations" count={sheet.locations.length}>
        <RepeatTable
          rows={sheet.locations}
          onChange={(rows) => set("locations", rows)}
          addLabel="Add location"
          columns={[
            { key: "name", label: "Location name", span: "col-span-12" },
            { key: "address", label: "Address", span: "col-span-12" },
            { key: "notes", label: "Parking / notes", span: "col-span-12" },
          ]}
        />
      </Section>

      {/* Nearest hospital */}
      <Section title="Nearest Hospital" defaultOpen={false}>
        <Field label="Facility" value={sheet.hospital.name} onChange={(v) => set("hospital.name", v)} placeholder="Hospital name" />
        <Field label="Address" value={sheet.hospital.address} onChange={(v) => set("hospital.address", v)} placeholder="Street, City" />
        <Field label="Phone" value={sheet.hospital.phone} onChange={(v) => set("hospital.phone", v)} placeholder="(000) 000-0000" />
      </Section>

      {/* Key contacts */}
      <Section title="Key Contacts" count={sheet.contacts.length}>
        <RepeatTable
          rows={sheet.contacts}
          onChange={(rows) => set("contacts", rows)}
          addLabel="Add contact"
          columns={[
            { key: "name", label: "Name", span: "col-span-5" },
            { key: "role", label: "Role", span: "col-span-4" },
            { key: "phone", label: "Phone", span: "col-span-3" },
          ]}
        />
      </Section>

      {/* Cast / talent */}
      <Section title="Cast & Talent" count={sheet.cast.length}>
        <RepeatTable
          rows={sheet.cast}
          onChange={(rows) => set("cast", rows)}
          addLabel="Add talent"
          columns={[
            { key: "name", label: "Name", span: "col-span-4" },
            { key: "character", label: "Character", span: "col-span-4" },
            { key: "call", label: "Call", span: "col-span-2" },
            { key: "hmw", label: "HMW", span: "col-span-1" },
            { key: "onSet", label: "Set", span: "col-span-1" },
          ]}
        />
      </Section>

      {/* Crew */}
      <Section title="Crew" count={sheet.crew.length}>
        <RepeatTable
          rows={sheet.crew}
          onChange={(rows) => set("crew", rows)}
          addLabel="Add crew"
          columns={[
            { key: "dept", label: "Dept", span: "col-span-3" },
            { key: "role", label: "Role", span: "col-span-3" },
            { key: "name", label: "Name", span: "col-span-3" },
            { key: "call", label: "Call", span: "col-span-2" },
            { key: "contact", label: "Ph", span: "col-span-1" },
          ]}
        />
      </Section>

      {/* Schedule */}
      <Section title="Schedule" count={sheet.schedule.length}>
        <RepeatTable
          rows={sheet.schedule}
          onChange={(rows) => set("schedule", rows)}
          addLabel="Add schedule item"
          columns={[
            { key: "time", label: "Time", span: "col-span-2" },
            { key: "desc", label: "Description", span: "col-span-6" },
            { key: "location", label: "Location", span: "col-span-3" },
            { key: "pages", label: "Pgs", span: "col-span-1" },
          ]}
        />
      </Section>

      {/* Notes */}
      <Section title="Notes & Safety" defaultOpen={false}>
        <TextArea label="General notes" value={sheet.notes} onChange={(v) => set("notes", v)} placeholder="Walkie channels, catering, parking…" rows={3} />
        <TextArea label="Safety notes" value={sheet.safety} onChange={(v) => set("safety", v)} placeholder="Hazards, terrain, weather precautions…" rows={3} />
      </Section>
    </div>
  );
}
