// Lightweight localStorage-backed drafts. No backend, no accounts — the whole
// tool works offline. Drafts are keyed by a slug of their name.

const CURRENT_KEY = "csg:current";
const DRAFTS_KEY = "csg:drafts";

export function loadCurrent() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrent(sheet) {
  try {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(sheet));
  } catch {
    /* quota or private mode — fail silently, the app still works in-memory */
  }
}

export function listDrafts() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return Object.entries(map)
      .map(([id, v]) => ({ id, name: v.name, savedAt: v.savedAt }))
      .sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
  } catch {
    return [];
  }
}

function readDraftMap() {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDraft(name, sheet) {
  const map = readDraftMap();
  const id =
    (name || "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled";
  map[id] = { name: name || "Untitled", savedAt: Date.now(), sheet };
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(map));
  return id;
}

export function loadDraft(id) {
  const map = readDraftMap();
  return map[id]?.sheet || null;
}

export function deleteDraft(id) {
  const map = readDraftMap();
  delete map[id];
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(map));
}
