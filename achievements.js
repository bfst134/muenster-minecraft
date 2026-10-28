// Fortschritte: Erfolge für besuchte Orte in Münster und ein paar Aktionen in der App.
// Orte: Koordinaten laut OpenStreetMap (Nominatim, Oktober 2026). Große Flächen als Rechteck (Süd, Nord, West, Ost).

const KEY = "mc-achievements";

export const ACHIEVEMENTS = [
  { id: "welcome", title: "Willkommen in Münster", desc: "Finde deine erste GPS-Position" },
  { id: "spawn", title: "Spawnpunkt erreicht", desc: "Steh am Dom", area: { lat: 51.9631113, lon: 7.6258077, r: 70 } },
  { id: "market", title: "Handelsposten", desc: "Bummel über den Prinzipalmarkt", area: { lat: 51.9621672, lon: 7.6281483, r: 70 } },
  { id: "lamberti", title: "Turmblick", desc: "Schau an St. Lamberti zu den drei Käfigen hinauf", area: { lat: 51.9628915, lon: 7.6288735, r: 50 } },
  { id: "aasee", title: "Wasserratte", desc: "Erreiche den Aasee", area: { bbox: [51.9421080, 51.9604686, 7.5944453, 7.6178277] } },
  { id: "schloss", title: "Ab in die Vorlesung", desc: "Besuche das Schloss", area: { lat: 51.9636072, lon: 7.6131357, r: 90 } },
  { id: "garden", title: "Grüner Daumen", desc: "Besuche den Botanischen Garten", area: { bbox: [51.9628954, 51.9647511, 7.6075384, 7.6117395] } },
  { id: "station", title: "Schnellreise", desc: "Erreiche den Hauptbahnhof", area: { lat: 51.9564055, lon: 7.6357920, r: 150 } },
  { id: "zoo", title: "Tierfreund", desc: "Besuche den Allwetterzoo", area: { bbox: [51.9441658, 51.9489332, 7.5846389, 7.5953081] } },
  { id: "harbour", title: "Hafenmeister", desc: "Erreiche den Stadthafen", area: { bbox: [51.9505898, 51.9516890, 7.6389776, 7.6495065] } },
  { id: "stadium", title: "Auf in die Arena", desc: "Besuche das Preußenstadion", area: { bbox: [51.9290958, 51.9304939, 7.6231909, 7.6259532] } },
  { id: "mill", title: "Zeitreise", desc: "Besuche das Mühlenhof-Freilichtmuseum", area: { bbox: [51.9490407, 51.9510698, 7.5976627, 7.6006635] } },
  { id: "tower", title: "Turmwächter", desc: "Finde den Buddenturm", area: { lat: 51.9663018, lon: 7.6230878, r: 50 } },
  { id: "far", title: "Weltenbummler", desc: "Sei 3000 Blöcke vom Spawn entfernt" },
  { id: "night", title: "Nachtschwärmer", desc: "Sei nachts mit GPS unterwegs" },
  { id: "rain", title: "Münsterländer Wetter", desc: "Sei bei Regen mit GPS unterwegs" },
  { id: "nether", title: "Heiße Sache", desc: "Reise in den Nether" },
  { id: "waypoint", title: "Kartograf", desc: "Speichere deinen ersten Wegpunkt" },
  { id: "share", title: "Gesprächig", desc: "Kopiere oder teile Koordinaten" },
];

// Rechtecke bekommen etwa 30 m Rand, damit der Eingang schon zählt
const MARGIN_LAT = 0.0003, MARGIN_LON = 0.0005;

function metersBetween(lat1, lon1, lat2, lon2) {
  const k = Math.PI / 180, R = 6371000;
  const x = (lon2 - lon1) * k * Math.cos(((lat1 + lat2) / 2) * k);
  const y = (lat2 - lat1) * k;
  return Math.hypot(x, y) * R;
}

// accuracy: GPS-Genauigkeit in Metern, wird bis 50 m zugunsten des Spielers angerechnet
export function inArea(lat, lon, area, accuracy = 0) {
  if (area.bbox) {
    const [s, n, w, e] = area.bbox;
    return lat >= s - MARGIN_LAT && lat <= n + MARGIN_LAT && lon >= w - MARGIN_LON && lon <= e + MARGIN_LON;
  }
  return metersBetween(lat, lon, area.lat, area.lon) <= area.r + Math.min(accuracy, 50);
}

// Ids der Orts-Fortschritte, die an dieser Position neu erreicht sind
export function placesReached(lat, lon, accuracy, unlocked) {
  return ACHIEVEMENTS.filter((a) => a.area && !unlocked[a.id] && inArea(lat, lon, a.area, accuracy)).map((a) => a.id);
}

export function loadUnlocked(storage = globalThis.localStorage) {
  try {
    const data = JSON.parse(storage.getItem(KEY) ?? "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

export function saveUnlocked(unlocked, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify(unlocked)); } catch {}
}
