// Sonnenstand und Minecraft-Tageszeit, vereinfachte Formeln nach NOAA (auf etwa 0,5° genau).

const RAD = Math.PI / 180;

function sunCoords(date) {
  const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000; // Tage seit J2000
  const g = (357.529 + 0.98560028 * d) * RAD;                        // mittlere Anomalie
  const q = (280.459 + 0.98564736 * d) % 360;                        // mittlere Länge
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD; // ekliptikale Länge
  const e = (23.439 - 0.00000036 * d) * RAD;                         // Schiefe der Ekliptik
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / RAD;
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  // Zeitgleichung in Stunden, auf ±12 h normiert
  let eqt = (((q - ra) % 360) + 540) % 360 - 180;
  return { d, ra, dec, eqtHours: eqt / 15 };
}

// Höhe der Sonne über dem Horizont in Grad
export function sunElevation(date, lat, lon) {
  const { d, ra, dec } = sunCoords(date);
  const gmst = 18.697374558 + 24.06570982441908 * d;
  const ha = ((gmst + lon / 15) * 15 - ra) * RAD;
  const φ = lat * RAD;
  return Math.asin(Math.sin(φ) * Math.sin(dec) + Math.cos(φ) * Math.cos(dec) * Math.cos(ha)) / RAD;
}

// Minecraft-Zeit: 0 = 6 Uhr Sonnenzeit, 6000 = Mittag, 12000 = 18 Uhr, 18000 = Mitternacht
export function mcTicks(date, lon) {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const solar = utcHours + lon / 15 + sunCoords(date).eqtHours;
  return Math.floor(((((solar - 6) % 24) + 24) % 24) * 1000);
}

export function dayPhase(elevation) {
  if (elevation > 6) return "Tag";
  if (elevation > -6) return "Dämmerung";
  return "Nacht";
}

// Farbe für die Multiplizieren-Ebene über der Karte; null bei vollem Tageslicht
export function skyTint(elevation) {
  const stops = [
    [-12, [55, 65, 125]],   // Nacht: dunkles Blau
    [-4, [150, 120, 190]],  // Dämmerung: Violett
    [2, [255, 190, 140]],   // Sonne am Horizont: Orange
    [10, [255, 255, 255]],  // Tag: keine Färbung
  ];
  if (elevation >= stops.at(-1)[0]) return null;
  if (elevation <= stops[0][0]) return `rgb(${stops[0][1].join(",")})`;
  const i = stops.findIndex(([e]) => e > elevation);
  const [e0, c0] = stops[i - 1], [e1, c1] = stops[i];
  const t = (elevation - e0) / (e1 - e0);
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(",")})`;
}
