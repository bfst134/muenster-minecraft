// Wegpunkte: eigene Orte mit Namen und Farbe, nur im Browser gespeichert. Koordinaten immer in der Oberwelt.

const KEY = "mc-waypoints";
const MAX = 100;

// Farbstoff-Farben zur Auswahl
export const COLORS = {
  rot: "#d33a2a", orange: "#e8862a", gelb: "#f5d742", grün: "#5fbf3f", blau: "#3f63c9", lila: "#8a3ad8",
};

export function loadWaypoints(storage = globalThis.localStorage) {
  try {
    const list = JSON.parse(storage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((w) => Number.isFinite(w.x) && Number.isFinite(w.z)) : [];
  } catch {
    return [];
  }
}

export function saveWaypoints(list, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(list)); return true; } catch { return false; }
}

export function addWaypoint(list, { name, x, y = null, z, color = "rot" }) {
  const clean = String(name ?? "").trim().slice(0, 24) || `Wegpunkt ${list.length + 1}`;
  const wp = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: clean, x, y, z, color: color in COLORS ? color : "rot",
  };
  return [...list, wp].slice(-MAX);
}

export function removeWaypoint(list, id) {
  return list.filter((w) => w.id !== id);
}
