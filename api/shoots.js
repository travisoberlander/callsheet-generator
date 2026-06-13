// Vercel serverless function: queries a Notion "shoot calendar" database and
// returns a normalized list of upcoming shoots for the import picker.
//
// The Notion token stays server-side — it is never shipped to the browser.
// Configure these as Vercel environment variables (or in a local .env for
// `vercel dev`):
//   NOTION_TOKEN              — Notion internal integration secret
//   NOTION_SHOOT_CALENDAR_DB  — the shoot calendar database id
//
// Property names below match a typical shoot calendar; adjust the `prop()`
// lookups if your database uses different column names.

const DATE_PROP = "Shoot Date";

function plain(prop) {
  if (!prop) return "";
  switch (prop.type) {
    case "title":
      return (prop.title || []).map((t) => t.plain_text).join("");
    case "rich_text":
      return (prop.rich_text || []).map((t) => t.plain_text).join("");
    case "select":
      return prop.select?.name || "";
    case "status":
      return prop.status?.name || "";
    case "multi_select":
      return (prop.multi_select || []).map((s) => s.name).join(", ");
    case "date":
      return prop.date?.start || "";
    default:
      return "";
  }
}

export default async function handler(req, res) {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_SHOOT_CALENDAR_DB;

  if (!token || !dbId) {
    res.status(500).json({
      error: "Server is missing NOTION_TOKEN or NOTION_SHOOT_CALENDAR_DB.",
    });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page_size: 50,
        filter: { property: DATE_PROP, date: { on_or_after: today } },
        sorts: [{ property: DATE_PROP, direction: "ascending" }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      res.status(r.status).json({ error: `Notion API ${r.status}: ${detail.slice(0, 300)}` });
      return;
    }

    const data = await r.json();
    const shoots = (data.results || []).map((page) => {
      const props = page.properties || {};
      return {
        title: plain(props["Shoot Name"]) || plain(props["Name"]),
        date: plain(props[DATE_PROP]).slice(0, 10),
        location: plain(props["Location"]),
        type: plain(props["Shoot Type"]) || plain(props["Format"]),
        status: plain(props["Status"]),
        talent: plain(props["Products / Talent"]) || plain(props["Talent"]),
        url: page.url || "",
      };
    });

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    res.status(200).json({ shoots });
  } catch (err) {
    res.status(502).json({ error: String(err.message || err) });
  }
}
