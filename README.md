# Call Sheet Generator

A fast, offline-friendly tool for building print-ready production call sheets in the
browser. Fill the form, watch the call sheet build live, and export to PDF via your
browser's print dialog. Optionally prefill from a Notion shoot calendar.

Built to replace a StudioBinder-style workflow with something you own.

![two-pane: dark editor on the left, paper call sheet on the right]

## Features

- **Live two-pane editor** — form on the left, print-ready call sheet on the right
- **Everything a crew needs** — production header, call/lunch/wrap times, sunrise/sunset,
  weather, locations, nearest hospital, key contacts, cast, crew, schedule, notes & safety
- **Generic branding** — upload any logo; neutral professional template
- **Export to PDF** — Print → *Save as PDF*, laid out for US Letter on one or more pages
- **Offline + autosaving** — works with no network; drafts live in your browser
- **Named drafts** — save/load/delete multiple call sheets locally
- **Notion import (optional)** — prefill production, date, and location from your shoot
  calendar via a serverless function that keeps your Notion token server-side

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Click **Sample** to load an example call sheet, or start filling the form. Hit
**Print / PDF** and choose *Save as PDF*.

### Build / deploy

```bash
npm run build        # outputs to dist/
```

Deploys to Vercel as-is (Vite static build + the `api/shoots.js` function).

## Notion import (optional)

The manual form needs nothing. To enable **Import from shoot calendar**:

1. Create a Notion internal integration, share your shoot-calendar database with it.
2. Set env vars (Vercel project settings, or `.env.local` for local `vercel dev`):
   - `NOTION_TOKEN`
   - `NOTION_SHOOT_CALENDAR_DB` (the database id)
3. Locally, run the function alongside the app:
   ```bash
   vercel dev          # serves /api/shoots; Vite proxies to it
   ```
   In production on Vercel, `/api/shoots` is served automatically.

The function maps common shoot-calendar columns (`Shoot Name`/`Name`, `Shoot Date`,
`Location`, `Shoot Type`/`Format`, `Status`, `Products / Talent`). Adjust the property
names in [api/shoots.js](api/shoots.js) if your database differs.

## Print tips

- Use the browser's *Save as PDF* destination.
- Turn **Background graphics ON** so the header band, amber highlights, and section
  rules render.
- Margins: *Default* (the layout already targets a 0.45in page margin).

## Stack

Vite · React 18 · Tailwind 3 · lucide-react. No backend required for the core tool.
