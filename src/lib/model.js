// Single source of truth for the call sheet shape. The form, the live preview,
// and the Notion import all read/write this one object.

export function emptyRow(kind) {
  switch (kind) {
    case "locations":
      return { name: "", address: "", notes: "" };
    case "contacts":
      return { name: "", role: "", phone: "" };
    case "crew":
      return { name: "", dept: "", role: "", call: "", contact: "" };
    case "cast":
      return { name: "", character: "", call: "", hmw: "", onSet: "" };
    case "schedule":
      return { time: "", desc: "", location: "", pages: "" };
    default:
      return {};
  }
}

export function emptySheet() {
  return {
    brand: { logo: null, productionCompany: "" },
    production: { title: "", day: "", ofDays: "", date: "", status: "PRELIM" },
    times: {
      call: "",
      lunch: "",
      wrap: "",
      sunrise: "",
      sunset: "",
      weather: "",
      tempHigh: "",
      tempLow: "",
    },
    locations: [emptyRow("locations")],
    hospital: { name: "", address: "", phone: "" },
    contacts: [emptyRow("contacts")],
    cast: [emptyRow("cast")],
    crew: [emptyRow("crew")],
    schedule: [emptyRow("schedule")],
    notes: "",
    safety: "",
  };
}

// A populated example so a first-time user sees what "good" looks like.
export function sampleSheet() {
  return {
    brand: { logo: null, productionCompany: "Northlight Pictures" },
    production: {
      title: "Coastal — Spring Campaign",
      day: "2",
      ofDays: "3",
      date: "2026-06-18",
      status: "FINAL",
    },
    times: {
      call: "07:00",
      lunch: "12:30",
      wrap: "18:30",
      sunrise: "05:48",
      sunset: "20:11",
      weather: "Clear, light wind",
      tempHigh: "74",
      tempLow: "58",
    },
    locations: [
      {
        name: "Base Camp — Will Rogers Beach Lot",
        address: "17000 CA-1, Pacific Palisades, CA 90272",
        notes: "Crew parking in north lot. Load-in via service gate.",
      },
      {
        name: "Set A — Tide pools (north jetty)",
        address: "5-min walk from base camp",
        notes: "Tide low 09:10. Watch footing on rocks.",
      },
    ],
    hospital: {
      name: "UCLA Santa Monica Medical Center",
      address: "1250 16th St, Santa Monica, CA 90404",
      phone: "(424) 259-6000",
    },
    contacts: [
      { name: "Travis Oberlander", role: "Director / Producer", phone: "(555) 010-2233" },
      { name: "Dana Reyes", role: "1st AD", phone: "(555) 010-7781" },
      { name: "Marcus Hale", role: "DP", phone: "(555) 010-4490" },
      { name: "On-set Medic", role: "Set Medic", phone: "(555) 010-9111" },
    ],
    cast: [
      { name: "Ava Lindqvist", character: "Lead / Hero", call: "07:30", hmw: "08:00", onSet: "09:00" },
      { name: "Theo Park", character: "Supporting", call: "08:30", hmw: "09:00", onSet: "10:00" },
    ],
    crew: [
      { name: "Marcus Hale", dept: "Camera", role: "DP", call: "06:45", contact: "(555) 010-4490" },
      { name: "Priya N.", dept: "Camera", role: "1st AC", call: "06:45", contact: "" },
      { name: "Sam Ortega", dept: "G&E", role: "Gaffer", call: "06:30", contact: "" },
      { name: "Jo Kim", dept: "Sound", role: "Mixer", call: "07:00", contact: "" },
      { name: "L. Fontaine", dept: "Art", role: "Stylist", call: "06:30", contact: "" },
    ],
    schedule: [
      { time: "07:00", desc: "Crew call · safety meeting", location: "Base Camp", pages: "" },
      { time: "08:00", desc: "Setup — Scene 4 (hero product on rocks)", location: "Set A", pages: "1 1/8" },
      { time: "09:15", desc: "Shoot — Scene 4", location: "Set A", pages: "1 1/8" },
      { time: "12:30", desc: "Lunch", location: "Base Camp", pages: "" },
      { time: "13:30", desc: "Shoot — Scene 7 (talent walk-and-talk)", location: "Beach", pages: "2/8" },
      { time: "17:30", desc: "Golden hour pickups", location: "North jetty", pages: "" },
    ],
    notes:
      "Walkie channel 1 = production, 2 = camera. Sunscreen + water at base camp. No drone today (wind permit pending).",
    safety:
      "Rocky/slick terrain at Set A — closed-toe footwear required. Watch incoming tide after 13:00. Nearest AED at base camp medic tent.",
  };
}

// Normalize whatever load returns so older drafts don't crash on a missing key.
export function hydrate(partial) {
  const base = emptySheet();
  if (!partial || typeof partial !== "object") return base;
  return {
    ...base,
    ...partial,
    brand: { ...base.brand, ...(partial.brand || {}) },
    production: { ...base.production, ...(partial.production || {}) },
    times: { ...base.times, ...(partial.times || {}) },
    hospital: { ...base.hospital, ...(partial.hospital || {}) },
    locations: partial.locations?.length ? partial.locations : base.locations,
    contacts: partial.contacts?.length ? partial.contacts : base.contacts,
    cast: partial.cast?.length ? partial.cast : base.cast,
    crew: partial.crew?.length ? partial.crew : base.crew,
    schedule: partial.schedule?.length ? partial.schedule : base.schedule,
  };
}
