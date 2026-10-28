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
