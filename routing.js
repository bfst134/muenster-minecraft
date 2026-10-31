// Route zum Ziel über den OSRM-Server von FOSSGIS (routing.openstreetmap.de, ohne Schlüssel).
// Nutzungsregeln: Quellenangabe, Link "Karte verbessern", höchstens eine Anfrage pro Sekunde.
// Deshalb auf Knopfdruck und danach nur neu, wenn man die Route verlässt; den Fortschritt rechnet das Handy selbst.
// Die eigene Position geht bei jeder dieser Anfragen an den Server.

export const ROUTE_MODES = ["bike", "foot"];

// Wo auf der Route steht man? coordinates: [[lon, lat], …], position: [lon, lat].
// Ergebnis: Abstand zur Route (m), Reststrecke (m), Gesamtlänge (m) und die Linie ab dem nächsten Punkt.
export function routeProgress(coordinates, [lon, lat]) {
  const kx = 111320 * Math.cos((lat * Math.PI) / 180), ky = 110540;
  const toMeters = ([x, y]) => [(x - lon) * kx, (y - lat) * ky]; // Position liegt im Nullpunkt
  let total = 0;
  let best = { offRoute: Infinity, index: 0, t: 0, walked: 0 };
  for (let i = 0; i + 1 < coordinates.length; i++) {
    const [ax, ay] = toMeters(coordinates[i]), [bx, by] = toMeters(coordinates[i + 1]);
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy, len = Math.sqrt(len2);
    const t = len2 ? Math.min(1, Math.max(0, -(ax * dx + ay * dy) / len2)) : 0;
    const offRoute = Math.hypot(ax + t * dx, ay + t * dy);
    if (offRoute < best.offRoute) best = { offRoute, index: i, t, walked: total + t * len };
    total += len;
  }
  const a = coordinates[best.index], b = coordinates[best.index + 1] ?? a;
  const point = [a[0] + best.t * (b[0] - a[0]), a[1] + best.t * (b[1] - a[1])];
  return {
    offRoute: best.offRoute, remaining: total - best.walked, total,
    coordinates: [point, ...coordinates.slice(best.index + 1)],
  };
}

export function routeUrl(from, to, mode) {
  const profile = ROUTE_MODES.includes(mode) ? mode : "bike";
  const point = (p) => `${p.lon.toFixed(6)},${p.lat.toFixed(6)}`;
  return `https://routing.openstreetmap.de/routed-${profile}/route/v1/driving/${point(from)};${point(to)}?overview=full&geometries=geojson`;
}

// Antwort des Servers → { coordinates, distance (m), duration (s) }; null, wenn es keine Route gibt
export function parseRoute(json) {
  const route = json?.code === "Ok" ? json.routes?.[0] : null;
  if (!route?.geometry?.coordinates?.length) return null;
  return { coordinates: route.geometry.coordinates, distance: route.distance, duration: route.duration };
}

export async function fetchRoute(from, to, mode) {
  const res = await fetch(routeUrl(from, to, mode), { signal: AbortSignal.timeout(15000) });
  // 400 heißt bei OSRM meist: kein Weg zwischen den Punkten gefunden
  if (res.status === 400) return null;
  if (!res.ok) throw new Error(`Route: HTTP ${res.status}`);
  return parseRoute(await res.json());
}

export function formatDuration(seconds) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}
