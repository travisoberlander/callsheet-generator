import { MapPin, Phone, Cross, Sun, Sunset, CloudSun } from "lucide-react";

/* ── formatting helpers ─────────────────────────────────────────────────── */
function fmtTime(t) {
  if (!t) return "";
  const [h, m] = String(t).split(":");
  if (h == null || m == null) return t;
  const hr = parseInt(h, 10);
  if (Number.isNaN(hr)) return t;
  const ap = hr >= 12 ? "PM" : "AM";
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}:${m} ${ap}`;
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  if (Number.isNaN(dt.getTime())) return d;
  return dt
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
    .replace(",", " ·");
}
const hasContent = (row) => Object.values(row).some((v) => String(v || "").trim() !== "");
const filled = (rows) => rows.filter(hasContent);

/* ── small document atoms ───────────────────────────────────────────────── */
function Head({ children }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-ink/90">
        {children}
      </span>
      <span className="h-px flex-1 bg-ink/15" />
    </div>
  );
}
function TimeCell({ label, value, big, icon: Icon }) {
  return (
    <div className={`flex-1 px-3 py-2 ${big ? "bg-amber/25" : ""}`}>
      <div className="flex items-center gap-1 text-[8.5px] font-semibold uppercase tracking-[0.14em] text-ink/55">
        {Icon && <Icon size={10} strokeWidth={2.5} />} {label}
      </div>
      <div className={`font-mono ${big ? "text-[19px] font-semibold" : "text-[13px]"} leading-tight text-ink`}>
        {value || "—"}
      </div>
    </div>
  );
}

/* ── the document ───────────────────────────────────────────────────────── */
export default function CallSheet({ sheet }) {
  const { production: p, brand, times: t, hospital } = sheet;
  const locations = filled(sheet.locations);
  const contacts = filled(sheet.contacts);
  const cast = filled(sheet.cast);
  const crew = filled(sheet.crew);
  const schedule = filled(sheet.schedule);
  const tempStr = [t.tempHigh && `H ${t.tempHigh}°`, t.tempLow && `L ${t.tempLow}°`].filter(Boolean).join(" / ");

  return (
    <div className="doc-surface print-area mx-auto w-full max-w-[850px] shadow-doc">
      {/* clapper stripe */}
      <div className="clapper-stripe h-2.5 w-full" />

      {/* header */}
      <header className="flex items-stretch justify-between gap-4 bg-ink px-7 py-5 text-paper">
        <div className="flex min-w-0 items-center gap-4">
          {brand.logo && (
            <img src={brand.logo} alt="" className="h-14 w-14 shrink-0 rounded object-contain" />
          )}
          <div className="min-w-0">
            {brand.productionCompany && (
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber">
                {brand.productionCompany}
              </div>
            )}
            <h1 className="truncate font-display text-[26px] font-bold leading-tight text-paper">
              {p.title || "Untitled Production"}
            </h1>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/55">
              Call Sheet
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper/60">
            Day {p.day || "—"} {p.ofDays && <span className="text-paper/40">of {p.ofDays}</span>}
          </div>
          <div className="mt-1 font-display text-[17px] font-bold text-paper">{fmtDate(p.date)}</div>
          <span className="mt-1.5 inline-block rounded-sm bg-amber px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-ink">
            {p.status}
          </span>
        </div>
      </header>

      {/* key times strip */}
      <div className="flex divide-x divide-ink/12 border-b-2 border-ink bg-paper">
        <TimeCell label="General Call" value={fmtTime(t.call)} big />
        <TimeCell label="Lunch" value={fmtTime(t.lunch)} />
        <TimeCell label="Est. Wrap" value={fmtTime(t.wrap)} />
        <TimeCell label="Sunrise" value={fmtTime(t.sunrise)} icon={Sun} />
        <TimeCell label="Sunset" value={fmtTime(t.sunset)} icon={Sunset} />
        <TimeCell label="Weather" value={[t.weather, tempStr].filter(Boolean).join("  ") || "—"} icon={CloudSun} />
      </div>

      <div className="space-y-5 px-7 py-5 text-ink">
        {/* locations + hospital | contacts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="avoid-break">
            <Head>Locations</Head>
            <div className="space-y-2.5">
              {locations.length ? (
                locations.map((l, i) => (
                  <div key={i} className="text-[12px] leading-snug">
                    <div className="flex items-start gap-1.5 font-semibold">
                      <MapPin size={12} className="mt-[2px] shrink-0 text-amber-deep" /> {l.name || "Location"}
                    </div>
                    {l.address && <div className="pl-[18px] text-ink/70">{l.address}</div>}
                    {l.notes && <div className="pl-[18px] text-[11px] italic text-ink/55">{l.notes}</div>}
                  </div>
                ))
              ) : (
                <p className="text-[11px] italic text-ink/40">No locations added.</p>
              )}
            </div>

            {(hospital.name || hospital.address || hospital.phone) && (
              <div className="mt-3 rounded border border-safety/45 bg-safety/[0.06] p-2.5 avoid-break">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-safety">
                  <Cross size={11} strokeWidth={3} /> Nearest Hospital
                </div>
                <div className="mt-1 text-[12px] font-semibold leading-snug">{hospital.name}</div>
                {hospital.address && <div className="text-[11px] text-ink/70">{hospital.address}</div>}
                {hospital.phone && (
                  <div className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-ink">
                    <Phone size={10} /> {hospital.phone}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="avoid-break">
            <Head>Key Contacts</Head>
            {contacts.length ? (
              <table className="w-full text-[12px]">
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={i} className="border-b border-ink/8 last:border-0">
                      <td className="py-1 pr-2 font-semibold">{c.name}</td>
                      <td className="py-1 pr-2 text-ink/65">{c.role}</td>
                      <td className="py-1 text-right font-mono text-[11px] tabular-nums">{c.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-[11px] italic text-ink/40">No contacts added.</p>
            )}
          </div>
        </div>

        {/* schedule */}
        {schedule.length > 0 && (
          <div className="avoid-break">
            <Head>Schedule</Head>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-ink/[0.04] text-left font-mono text-[9px] uppercase tracking-[0.14em] text-ink/55">
                  <th className="w-[78px] py-1.5 pl-2 font-semibold">Time</th>
                  <th className="py-1.5 font-semibold">Description</th>
                  <th className="w-[150px] py-1.5 font-semibold">Location</th>
                  <th className="w-[42px] py-1.5 pr-2 text-right font-semibold">Pgs</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((s, i) => (
                  <tr key={i} className="border-b border-ink/8">
                    <td className="py-1.5 pl-2 font-mono font-semibold tabular-nums">{fmtTime(s.time) || s.time}</td>
                    <td className="py-1.5 pr-2">{s.desc}</td>
                    <td className="py-1.5 pr-2 text-ink/70">{s.location}</td>
                    <td className="py-1.5 pr-2 text-right font-mono text-[11px] tabular-nums text-ink/70">{s.pages}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* cast */}
        {cast.length > 0 && (
          <div className="avoid-break">
            <Head>Cast &amp; Talent</Head>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-ink/[0.04] text-left font-mono text-[9px] uppercase tracking-[0.14em] text-ink/55">
                  <th className="py-1.5 pl-2 font-semibold">Name</th>
                  <th className="py-1.5 font-semibold">Character</th>
                  <th className="w-[70px] py-1.5 text-right font-semibold">Call</th>
                  <th className="w-[70px] py-1.5 text-right font-semibold">HMW</th>
                  <th className="w-[70px] py-1.5 pr-2 text-right font-semibold">On Set</th>
                </tr>
              </thead>
              <tbody>
                {cast.map((c, i) => (
                  <tr key={i} className="border-b border-ink/8">
                    <td className="py-1.5 pl-2 font-semibold">{c.name}</td>
                    <td className="py-1.5 pr-2 text-ink/70">{c.character}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{fmtTime(c.call) || c.call}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-ink/70">{fmtTime(c.hmw) || c.hmw}</td>
                    <td className="py-1.5 pr-2 text-right font-mono tabular-nums text-ink/70">{fmtTime(c.onSet) || c.onSet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* crew */}
        {crew.length > 0 && (
          <div className="avoid-break">
            <Head>Crew</Head>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-ink/[0.04] text-left font-mono text-[9px] uppercase tracking-[0.14em] text-ink/55">
                  <th className="w-[110px] py-1.5 pl-2 font-semibold">Dept</th>
                  <th className="py-1.5 font-semibold">Role</th>
                  <th className="py-1.5 font-semibold">Name</th>
                  <th className="w-[70px] py-1.5 text-right font-semibold">Call</th>
                  <th className="w-[110px] py-1.5 pr-2 text-right font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody>
                {crew.map((c, i) => (
                  <tr key={i} className="border-b border-ink/8">
                    <td className="py-1.5 pl-2 font-semibold">{c.dept}</td>
                    <td className="py-1.5 pr-2">{c.role}</td>
                    <td className="py-1.5 pr-2 text-ink/80">{c.name}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums">{fmtTime(c.call) || c.call}</td>
                    <td className="py-1.5 pr-2 text-right font-mono text-[11px] tabular-nums text-ink/70">{c.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* notes + safety */}
        {(sheet.notes || sheet.safety) && (
          <div className="grid grid-cols-2 gap-6 avoid-break">
            {sheet.notes && (
              <div>
                <Head>Notes</Head>
                <p className="whitespace-pre-wrap text-[11.5px] leading-relaxed text-ink/80">{sheet.notes}</p>
              </div>
            )}
            {sheet.safety && (
              <div className={sheet.notes ? "" : "col-span-2"}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-safety">
                    Safety
                  </span>
                  <span className="h-px flex-1 bg-safety/25" />
                </div>
                <p className="whitespace-pre-wrap rounded border border-safety/30 bg-safety/[0.05] p-2.5 text-[11.5px] leading-relaxed text-ink/85">
                  {sheet.safety}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <footer className="flex items-center justify-between border-t border-ink/15 px-7 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink/40">
        <span>{p.title || "Call Sheet"} · Day {p.day || "—"}</span>
        <span>Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </footer>
    </div>
  );
}
