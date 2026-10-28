// Münster ↔ Minecraft-Koordinaten, Maßstab 1:1 (1 Block = 1 m).
// Projektion: WGS84 (EPSG:4326) → ETRS89 / UTM 32N (EPSG:25832).
// Minecraft Java: X = Ost (+), Z = Süd (+), also Nord = −Z.

export const CONFIG = {
  // Ursprung (0, ~, 0). Koordinaten: Gebäudemittelpunkt laut OpenStreetMap (way 40967526).
  origin: { name: "St.-Paulus-Dom", lat: 51.9631113, lon: 7.6258077 },
  // Y = Höhe über NN (DHHN2016) + yOffset. Münster liegt ~60 m ü. NN, MC-Meeresspiegel ist Y = 63.
  yOffset: 0,
  // Browser-GPS liefert ellipsoidische Höhe. Geoidundulation am Dom laut GCG2016: 44,2 m.
  geoidUndulation: 44.2,
};

const UTM32N = "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs";

// Math.round liefert für -0.4 den Wert -0; "+ 0" macht daraus 0.
const roundBlock = (v) => Math.round(v) + 0;

export function createConverter(proj4, config = CONFIG) {
  const project = proj4("EPSG:4326", UTM32N);
  const [e0, n0] = project.forward([config.origin.lon, config.origin.lat]);

  function toMinecraft(lat, lon) {
    const [e, n] = project.forward([lon, lat]);
    return { x: roundBlock(e - e0), z: 0 - roundBlock(n - n0), e, n };
  }

  function fromMinecraft(x, z) {
    const e = e0 + x;
    const n = n0 - z;
    const [lon, lat] = project.inverse([e, n]);
    return { lat, lon, e, n };
  }

  // Höhe über NN → Y. Ohne Höhe gibt es kein Y.
  function yFromNN(heightNN) {
    if (heightNN == null || Number.isNaN(heightNN)) return null;
    return roundBlock(heightNN + config.yOffset);
  }

  function yFromEllipsoidal(heightEllipsoidal) {
    if (heightEllipsoidal == null) return null;
    return yFromNN(heightEllipsoidal - config.geoidUndulation);
  }

  return { origin: { e: e0, n: n0, ...config.origin }, toMinecraft, fromMinecraft, yFromNN, yFromEllipsoidal };
}

// Kompasskurs (Grad im Uhrzeigersinn ab Nord) → Facing wie im F3-Screen.
// MC-Yaw: Süd = 0, West = 90, Nord = ±180, Ost = −90.
export function facing(heading) {
  const h = ((heading % 360) + 360) % 360;
  const dirs = [
    { name: "north", towards: "Towards negative Z" },
    { name: "east", towards: "Towards positive X" },
    { name: "south", towards: "Towards positive Z" },
    { name: "west", towards: "Towards negative X" },
  ];
  const dir = dirs[Math.floor(((h + 45) % 360) / 90)];
  let yaw = h - 180;
  if (yaw <= -180) yaw += 360;
  return { ...dir, yaw };
}

// Nether-Koordinaten: Oberwelt / 8, abgerundet wie im Spiel.
export function nether(x, z) {
  return { x: Math.floor(x / 8), z: Math.floor(z / 8) };
}

// Zurück in die Oberwelt: Mitte des 8×8-Bereichs, den ein Netherblock abdeckt
export function fromNether(x, z) {
  return { x: x * 8 + 4, z: z * 8 + 4 };
}

// Weltgrenze in Minecraft Java.
const WORLD_BORDER = 30_000_000;

// Liest Koordinaten aus beliebigem eingefügtem Text, z. B. "639 60 736", "639, 736",
// "X: 639 Z: 736", "XYZ: 639 / 60 / 736", "/tp @s 639 ~ 736" oder einem Teilen-Link (?x=639&z=736).
// Ergebnis: { x, y, z } mit y = null, wenn keine Höhe angegeben ist; null, wenn nichts Eindeutiges drinsteht.
export function parseCoords(text) {
  if (typeof text !== "string") return null;
  const t = text.replace(/[−–]/g, "-");
  const num = (s) => Math.round(parseFloat(s));
  const valid = (c) => c && [c.x, c.z].every((v) => Number.isFinite(v) && Math.abs(v) <= WORLD_BORDER) ? c : null;

  // Beschriftete Werte: "x=639", "X: 639"
  const labeled = {};
  for (const m of t.matchAll(/(?:^|[^a-z])([xyz])\s*[:=]\s*(-?\d+(?:\.\d+)?)/gi)) {
    const axis = m[1].toLowerCase();
    if (!(axis in labeled)) labeled[axis] = num(m[2]);
  }
  if ("x" in labeled && "z" in labeled) return valid({ x: labeled.x, y: labeled.y ?? null, z: labeled.z });

  // Ganzer F3-Block eingefügt: nur die XYZ-Zeile zählt
  const xyzLine = t.split(/\r?\n/).find((l) => /xyz\s*:/i.test(l));
  const tokens = (xyzLine ?? t).match(/~|-?\d+(?:\.\d+)?/g) ?? [];
  const val = (s) => (s === "~" ? null : num(s));
  if (tokens.length === 3 && tokens[0] !== "~" && tokens[2] !== "~") {
    return valid({ x: val(tokens[0]), y: val(tokens[1]), z: val(tokens[2]) });
  }
  if (tokens.length === 2 && !tokens.includes("~")) return valid({ x: val(tokens[0]), y: null, z: val(tokens[1]) });
  return null;
}

// Text zum Kopieren, passend für /tp. Unbekannte Höhe wird zu "~".
export function formatCoords({ x, y, z }) {
  return `${x} ${y ?? "~"} ${z}`;
}
