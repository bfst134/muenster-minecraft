// Karte im Minecraft-Look: Vektordaten von OpenFreeMap, Aufbau wie der OSM-Standardstil, aber in Blockfarben.
// Die Karte wird absichtlich in niedriger Auflösung gezeichnet und ohne Glättung hochskaliert (Pixel-Look).
// Beschriftungen liegen als zweite, scharfe Karte darüber; sie trägt auch die Marker.

import { pointInFeature } from "./biome.js?v=20261031d";

// Pixelgröße in CSS-Pixeln je Kartenpixel
export const PIXEL_SIZES = { fein: 1.5, mittel: 2, grob: 3 };

// ---------- Blockfarben je Dimension ----------
const PALETTES = {
  overworld: {
    grass: "#7fb238", park: "#8cc04a", leaves: "#2f6b1f", farmland: "#c9c26a", sand: "#e8d998",
    wetland: "#5f9a6a", water: "#3f76e4", cemetery: "#6f9a52", sports: "#5f9a34", track: "#b5553c",
    residential: "#cdc7bb",   // heller Andesit
    commercial: "#dcc0b4",    // Granit
    industrial: "#cbb7cc",    // Purpur
    education: "#efe2a8",     // Endstein
    plaza: "#e2dccd",
    brick: "#9a5a48", brickShadow: "#5e3328",
    casing: "#3b3229",
    motorway: "#c4543b",      // rote Terrakotta
    primary: "#e08a3c",       // orange Terrakotta
    secondary: "#e6cf6a",     // Sandstein
    minor: "#f1ece0",         // Quarz
    path: "#a5854c", cycleway: "#3f63c9", rail: "#4a4a4a", railTie: "#b0b0b0",
  },
  nether: {
    grass: "#6f2b2b",         // Netherrack
    park: "#2b6e66",          // Wirr-Nezel
    leaves: "#8c1f2c",        // Karmesin
    farmland: "#4e3b30", sand: "#5b4636", // Seelenerde, Seelensand
    wetland: "#3a2f3a", water: "#e0640f", // Lava statt Wasser
    cemetery: "#4a3a30", sports: "#2f5f5a", track: "#7a2a1a",
    residential: "#3a3438",   // Schwarzstein
    commercial: "#4d4a52",    // Basalt
    industrial: "#5a2a20",    // Magma
    education: "#e8c46a",     // Leuchtstein
    plaza: "#2e292e",
    brick: "#3d1c22", brickShadow: "#1c0b0f", // Netherziegel
    casing: "#140808",
    motorway: "#b8401c", primary: "#d48a2a", secondary: "#e8c46a",
    minor: "#e6ddd4",         // Netherquarz
    path: "#5a4535", cycleway: "#2fa39a", rail: "#2a2a2a", railTie: "#8a7a7a",
  },
};

// ---------- Selbst erzeugte Blocktexturen (8×8 Pixel) ----------
function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
function hex(c) { return [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); }
function pattern(seed, pick) {
  const n = 8, data = new Uint8Array(n * n * 4), r = rng(seed);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) data.set([...hex(pick(x, y, r)), 255], (y * n + x) * 4);
  return { width: n, height: n, data };
}
const from = (cols) => (x, y, r) => cols[Math.floor(r() * cols.length)];
// Ziegel: Fugen in Zeile 3 und 7, versetzte Stoßfugen
const bricks = (mortar, cols) => (x, y, r) => (y % 4 === 3 || x === (y < 4 ? 0 : 4) ? mortar : from(cols)(x, y, r));
const grid = (line, cols) => (x, y, r) => (x % 4 === 0 || y % 4 === 0 ? line : from(cols)(x, y, r));
const PATTERNS = {
  overworld: {
    "tex-grass": pattern(3, from(["#7fb238", "#7fb238", "#74a632", "#8cc03f", "#6a9a2c"])),
    "tex-park": pattern(4, from(["#8cc04a", "#8cc04a", "#80b442", "#98cc55", "#76a83c"])),
    "tex-leaves": pattern(5, from(["#2f6b1f", "#2f6b1f", "#3a7d27", "#24561a", "#1c4514"])),
    "tex-water": pattern(9, (x, y, r) => ((y + Math.floor(x / 3)) % 4 === 0 && r() > 0.3 ? "#5a8cf0" : r() > 0.5 ? "#3f76e4" : "#3a6fd8")),
    "tex-bricks": pattern(13, bricks("#8c8279", ["#9a5a48", "#9a5a48", "#a86450", "#8a4e3e"])),
    "tex-sand": pattern(19, from(["#e8d998", "#ded08c", "#f0e2a6"])),
    "tex-farmland": pattern(23, (x, y, r) => (y % 3 === 0 ? "#8a6a40" : r() > 0.4 ? "#c9c26a" : "#b8b05c")),
    "tex-andesite": pattern(29, from(["#cdc7bb", "#cdc7bb", "#c4beb2", "#d6d0c4"])),
    "tex-plaza": pattern(31, grid("#d2cbbb", ["#e2dccd", "#e8e2d4"])),
  },
  nether: {
    "tex-grass": pattern(3, from(["#6f2b2b", "#6f2b2b", "#5e2222", "#7d3333", "#4f1c1c"])),
    "tex-park": pattern(4, from(["#2b6e66", "#2b6e66", "#236058", "#358277", "#1d5048"])),
    "tex-leaves": pattern(5, from(["#8c1f2c", "#8c1f2c", "#a02838", "#741826", "#5e1220"])),
    "tex-water": pattern(9, (x, y, r) => ((y + Math.floor(x / 3)) % 4 === 0 && r() > 0.4 ? "#ffc040" : r() > 0.5 ? "#e0640f" : "#c94e0a")),
    "tex-bricks": pattern(13, bricks("#1c0b0f", ["#3d1c22", "#3d1c22", "#45222a", "#351820"])),
    "tex-sand": pattern(19, from(["#5b4636", "#4e3b2e", "#66503e", "#3f2f25"])),
    "tex-farmland": pattern(23, from(["#4e3b30", "#45342a", "#57443a"])),
    "tex-andesite": pattern(29, from(["#3a3438", "#3a3438", "#332d31", "#423b40"])),
    "tex-plaza": pattern(31, grid("#231f23", ["#2e292e", "#353035"])),
  },
};

// ---------- Hilfen für den Stil ----------
const texOpacity = ["interpolate", ["linear"], ["zoom"], 15.5, 0, 16.5, 1];
const notTunnel = ["match", ["get", "brunnel"], ["tunnel"], false, true];
const isLine = ["match", ["geometry-type"], ["LineString", "MultiLineString"], true, false];
const isArea = ["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false];
const cls = (...c) => ["match", ["get", "class"], c, true, false];
// Breite in CSS-Pixeln je Zoomstufe, grob wie im OSM-Standardstil
const width = (...stops) => ["interpolate", ["exponential", 1.4], ["zoom"], ...stops];
const name = ["coalesce", ["get", "name:de"], ["get", "name"]];
const visibleBuilding = ["!=", ["get", "hide_3d"], true];

function fill(id, sourceLayer, filter, color, extra = {}) {
  return { id, type: "fill", source: "omt", "source-layer": sourceLayer, filter, paint: { "fill-color": color, "fill-antialias": false }, ...extra };
}
function texture(id, sourceLayer, filter, tex) {
  return { id, type: "fill", source: "omt", "source-layer": sourceLayer, filter, minzoom: 15.5,
    paint: { "fill-pattern": tex, "fill-opacity": texOpacity, "fill-antialias": false } };
}
// stops: [zoom, Breite, zoom, Breite, …]; der Rand ist an jeder Stufe 2 px breiter
function road(id, filter, [color, casingColor], stops, minzoom = 0) {
  const casing = stops.map((v, i) => (i % 2 ? v + 2 : v));
  const base = { type: "line", source: "omt", "source-layer": "transportation", minzoom, filter: ["all", notTunnel, isLine, filter],
    layout: { "line-cap": "butt", "line-join": "miter" } };
  return [
    { ...base, id: `${id}-casing`, paint: { "line-color": casingColor, "line-width": width(...casing) } },
    { ...base, id, paint: { "line-color": color, "line-width": width(...stops) } },
  ];
}

// ---------- Kartenebenen: Flächen, Wasser, Gebäude, Straßen ----------
const residential = cls("residential", "suburb", "quarter", "neighbourhood");
const buildLayers = (C) => [
  { id: "bg", type: "background", paint: { "background-color": C.grass } },
  { id: "bg-tex", type: "background", minzoom: 15.5, paint: { "background-pattern": "tex-grass", "background-opacity": texOpacity } },

  fill("landuse-residential", "landuse", residential, C.residential),
  texture("landuse-residential-tex", "landuse", residential, "tex-andesite"),
  fill("landuse-commercial", "landuse", cls("commercial", "retail"), C.commercial),
  fill("landuse-industrial", "landuse", cls("industrial", "garages", "railway", "quarry", "military", "dam"), C.industrial),
  fill("landuse-education", "landuse", cls("school", "university", "college", "kindergarten", "hospital", "library"), C.education),
  fill("landcover-farmland", "landcover", cls("farmland"), C.farmland),
  texture("landcover-farmland-tex", "landcover", cls("farmland"), "tex-farmland"),
  fill("landcover-grass", "landcover", cls("grass"), C.grass),
  fill("park", "park", isArea, C.park),
  texture("park-tex", "park", isArea, "tex-park"),
  fill("landuse-cemetery", "landuse", cls("cemetery"), C.cemetery),
  fill("landcover-wood", "landcover", cls("wood"), C.leaves),
  texture("landcover-wood-tex", "landcover", cls("wood"), "tex-leaves"),
  fill("landcover-wetland", "landcover", cls("wetland"), C.wetland),
  fill("landcover-sand", "landcover", cls("sand"), C.sand),
  texture("landcover-sand-tex", "landcover", cls("sand"), "tex-sand"),
  fill("landuse-sports", "landuse", cls("pitch", "stadium", "playground"), C.sports),
  fill("landuse-track", "landuse", cls("track"), C.track),

  fill("water", "water", notTunnel, C.water),
  texture("water-tex", "water", notTunnel, "tex-water"),
  { id: "waterway", type: "line", source: "omt", "source-layer": "waterway", filter: notTunnel,
    paint: { "line-color": C.water, "line-width": width(...[[10, 1.5, 0.5], [14, 4, 1.5], [16, 10, 2.5], [18, 30, 8]]
      .flatMap(([z, river, stream]) => [z, ["match", ["get", "class"], ["river", "canal"], river, stream]])) } },

  // Plätze und Fußgängerzonen als Flächen
  fill("road-area", "transportation", isArea, C.plaza),
  texture("road-area-tex", "transportation", isArea, "tex-plaza"),

  // Gebäude als Backstein mit Schatten nach unten, wie ein Block mit Höhe
  fill("building-shadow", "building", visibleBuilding, C.brickShadow,
    { minzoom: 14, paint: { "fill-color": C.brickShadow, "fill-antialias": false, "fill-translate": [0, 2] } }),
  fill("building", "building", visibleBuilding, C.brick, { minzoom: 13 }),
  texture("building-tex", "building", visibleBuilding, "tex-bricks"),
  { id: "building-edge", type: "line", source: "omt", "source-layer": "building", minzoom: 15.5, filter: visibleBuilding,
    paint: { "line-color": C.brickShadow, "line-width": width(15.5, 1, 18, 2.5) } },

  // Wege: Trampelpfad gestrichelt, Radwege in Lapisblau
  { id: "path", type: "line", source: "omt", "source-layer": "transportation", minzoom: 14,
    filter: ["all", notTunnel, isLine, cls("path", "track"), ["!=", ["get", "subclass"], "cycleway"]],
    paint: { "line-color": C.path, "line-width": width(14, 1.5, 16, 2.5, 18, 5), "line-dasharray": [2, 1] } },
  { id: "cycleway", type: "line", source: "omt", "source-layer": "transportation", minzoom: 13,
    filter: ["all", notTunnel, isLine, cls("path"), ["==", ["get", "subclass"], "cycleway"]],
    paint: { "line-color": C.cycleway, "line-width": width(13, 1.5, 16, 2.5, 18, 5), "line-dasharray": [2, 1] } },

  // Straßen, von klein nach groß, jeweils mit dunklem Rand
  ...road("road-service", cls("service"), [C.minor, C.casing], [14, 1, 16, 3, 18, 9], 14),
  ...road("road-minor", cls("minor"), [C.minor, C.casing], [12, 0.8, 14, 2.5, 16, 7, 18, 18], 12),
  ...road("road-tertiary", cls("tertiary"), [C.minor, C.casing], [10, 1, 13, 2.5, 16, 9, 18, 22]),
  ...road("road-secondary", cls("secondary"), [C.secondary, C.casing], [9, 1, 13, 3, 16, 10, 18, 24]),
  ...road("road-primary", cls("primary"), [C.primary, C.casing], [8, 1, 13, 3.5, 16, 11, 18, 26]),
  ...road("road-motorway", cls("motorway", "trunk"), [C.motorway, C.casing], [6, 1, 13, 4, 16, 12, 18, 28]),

  // Schienen: dunkel mit hellen Schwellen
  { id: "rail", type: "line", source: "omt", "source-layer": "transportation", filter: ["all", notTunnel, cls("rail", "transit")],
    paint: { "line-color": C.rail, "line-width": width(10, 1, 14, 2.5, 18, 6) } },
  { id: "rail-ties", type: "line", source: "omt", "source-layer": "transportation", minzoom: 13, filter: ["all", notTunnel, cls("rail", "transit")],
    paint: { "line-color": C.railTie, "line-width": width(13, 1, 18, 3), "line-dasharray": [2, 2] } },
];
const MC_LAYERS = buildLayers(PALETTES.overworld);

const OMT = { type: "vector", url: "https://tiles.openfreemap.org/planet",
  attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Daten von <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' };

const baseStyle = (dimension) => ({
  version: 8,
  sources: {
    omt: OMT,
    osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, maxzoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>' },
  },
  layers: [
    ...buildLayers(PALETTES[dimension]),
    { id: "osm", type: "raster", source: "osm", layout: { visibility: "none" } },
    // Unsichtbar, aber immer aktiv: hält die Vektordaten auch bei der normalen Karte geladen (fürs Biom)
    { id: "probe", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-opacity": 0 } },
  ],
});

// ---------- Beschriftungen: weiß mit dunklem Rand wie Namensschilder ----------
const tag = { "text-color": "#ffffff", "text-halo-color": "rgba(30, 30, 30, 0.85)", "text-halo-width": 1.6 };
const waterTag = { "text-color": "#d6e4ff", "text-halo-color": "rgba(20, 40, 110, 0.9)", "text-halo-width": 1.6 };
const LABEL_LAYERS = [
  { id: "street-names", type: "symbol", source: "omt", "source-layer": "transportation_name", minzoom: 14.5,
    filter: cls("primary", "secondary", "tertiary", "minor", "trunk", "pedestrian", "service", "path"),
    layout: { "symbol-placement": "line", "text-field": name, "text-font": ["Noto Sans Bold"], "text-size": width(14.5, 10, 18, 14),
      "text-max-angle": 30, "text-padding": 4 }, paint: tag },
  { id: "water-names", type: "symbol", source: "omt", "source-layer": "water_name", minzoom: 12,
    layout: { "text-field": name, "text-font": ["Noto Sans Italic"], "text-size": 13 }, paint: waterTag },
  { id: "waterway-names", type: "symbol", source: "omt", "source-layer": "waterway", minzoom: 13,
    layout: { "symbol-placement": "line", "text-field": name, "text-font": ["Noto Sans Italic"], "text-size": 12 }, paint: waterTag },
  { id: "park-names", type: "symbol", source: "omt", "source-layer": "park", minzoom: 14,
    layout: { "text-field": name, "text-font": ["Noto Sans Italic"], "text-size": 12, "text-max-width": 8 },
    paint: { "text-color": "#e8ffd0", "text-halo-color": "rgba(30, 70, 20, 0.9)", "text-halo-width": 1.6 } },
  { id: "poi-names", type: "symbol", source: "omt", "source-layer": "poi", minzoom: 16, filter: ["<=", ["get", "rank"], 20],
    layout: { "text-field": name, "text-font": ["Noto Sans Regular"], "text-size": 12, "text-max-width": 8, "text-padding": 6 },
    paint: { ...tag, "text-color": "#ffff9a" } },
  { id: "housenumbers", type: "symbol", source: "omt", "source-layer": "housenumber", minzoom: 17.5,
    layout: { "text-field": ["get", "housenumber"], "text-font": ["Noto Sans Regular"], "text-size": 10 },
    paint: { "text-color": "#f3dcd3", "text-halo-color": "rgba(60, 25, 15, 0.9)", "text-halo-width": 1.2 } },
  { id: "places", type: "symbol", source: "omt", "source-layer": "place",
    filter: cls("city", "town", "village", "suburb", "quarter", "neighbourhood", "hamlet"),
    layout: { "text-field": name, "text-font": ["Noto Sans Bold"], "text-max-width": 8, "text-transform": "uppercase", "text-letter-spacing": 0.08,
      "text-size": ["match", ["get", "class"], "city", 18, "town", 16, "suburb", 14, 12] },
    paint: { ...tag, "text-halo-width": 2 } },
];
const LABEL_STYLE = {
  version: 8,
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sources: { omt: OMT },
  layers: LABEL_LAYERS,
};

// Route in Redstone-Rot; im roten Nether ginge das unter, dort leuchtet sie türkis wie Seelenfeuer
const ROUTE_COLORS = {
  overworld: { line: "#e0201c", casing: "#5a0d0b" },
  nether: { line: "#39d9e0", casing: "#0d3a3d" },
};
// Vom Routing-Server verlangt: Quellenangabe und ein Link, um Kartenfehler zu melden
const ROUTE_ATTRIBUTION = 'Route: <a href="https://routing.openstreetmap.de/about.html" target="_blank">FOSSGIS OSRM</a> · <a href="https://www.openstreetmap.org/fixthemap" target="_blank">Karte verbessern</a>';

// Genauigkeitskreis als Polygon mit Radius in Metern
function circle(lat, lon, radius, steps = 48) {
  const dLat = radius / 111320, dLon = radius / (111320 * Math.cos((lat * Math.PI) / 180));
  const ring = Array.from({ length: steps + 1 }, (_, i) => {
    const a = (i / steps) * 2 * Math.PI;
    return [lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)];
  });
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [ring] }, properties: {} };
}

export function createMcMap({ container, labelsContainer, center, zoom, pixelSize, kind = "mc", dimension = "overworld" }) {
  const state = { px: pixelSize, kind, dim: dimension };
  const view = { center, zoom };
  const map = new maplibregl.Map({
    container, style: baseStyle(state.dim), ...view, maxZoom: 19.5, minZoom: 10,
    pixelRatio: kind === "mc" ? 1 / pixelSize : window.devicePixelRatio,
    attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false,
  });
  const labels = new maplibregl.Map({ container: labelsContainer, style: LABEL_STYLE, ...view, interactive: false, attributionControl: false });
  map.touchZoomRotate.disableRotation();
  map.on("move", () => labels.jumpTo({ center: map.getCenter(), zoom: map.getZoom() }));
  map.on("error", (ev) => console.error("Karte:", ev.error?.message ?? ev));
  labels.on("error", (ev) => console.error("Beschriftung:", ev.error?.message ?? ev));

  // Texturpixel = Kartenpixel: die Bilder bekommen dieselbe Pixeldichte wie die Karte
  const addPattern = (id) => map.addImage(id, PATTERNS[state.dim][id], { pixelRatio: 1 / state.px });
  map.on("styleimagemissing", (ev) => { if (PATTERNS[state.dim][ev.id] && !map.hasImage(ev.id)) addPattern(ev.id); });

  // Dimension wechseln: nur Farben und Texturen tauschen, die Karte bleibt geladen
  function applyDimension() {
    for (const layer of buildLayers(PALETTES[state.dim])) {
      for (const [key, value] of Object.entries(layer.paint ?? {})) {
        if (!key.endsWith("pattern")) map.setPaintProperty(layer.id, key, value);
      }
    }
    for (const [id, img] of Object.entries(PATTERNS[state.dim])) if (map.hasImage(id)) map.updateImage(id, img);
    if (map.getLayer("route")) {
      map.setPaintProperty("route", "line-color", ROUTE_COLORS[state.dim].line);
      map.setPaintProperty("route-casing", "line-color", ROUTE_COLORS[state.dim].casing);
    }
  }

  // Route und Genauigkeitskreis der GPS-Position, liegen über allen Kartenebenen
  let pendingAccuracy = null, pendingRoute = null;
  const accuracyData = (f) => ({ type: "FeatureCollection", features: f ? [f] : [] });
  const routeData = (coordinates) => accuracyData(coordinates && { type: "Feature", geometry: { type: "LineString", coordinates }, properties: {} });
  map.on("load", () => {
    map.addSource("route", { type: "geojson", data: routeData(pendingRoute), attribution: ROUTE_ATTRIBUTION });
    const line = { type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" } };
    map.addLayer({ ...line, id: "route-casing", paint: { "line-color": ROUTE_COLORS[state.dim].casing, "line-width": width(12, 6, 16, 10, 18, 16) } });
    map.addLayer({ ...line, id: "route", paint: { "line-color": ROUTE_COLORS[state.dim].line, "line-width": width(12, 3, 16, 6, 18, 11) } });
    map.addSource("accuracy", { type: "geojson", data: accuracyData(pendingAccuracy) });
    map.addLayer({ id: "accuracy", type: "fill", source: "accuracy", paint: { "fill-color": "#3fc6d6", "fill-opacity": 0.18 } });
    map.addLayer({ id: "accuracy-edge", type: "line", source: "accuracy", paint: { "line-color": "#1d7e8a", "line-width": 1.5 } });
  });

  function applyKind() {
    const mc = state.kind === "mc";
    for (const l of MC_LAYERS) map.setLayoutProperty(l.id, "visibility", mc ? "visible" : "none");
    map.setLayoutProperty("osm", "visibility", mc ? "none" : "visible");
    for (const l of LABEL_LAYERS) labels.setLayoutProperty(l.id, "visibility", mc ? "visible" : "none");
    map.setPixelRatio(mc ? 1 / state.px : window.devicePixelRatio);
    container.classList.toggle("pixel", mc);
  }
  container.classList.toggle("pixel", kind === "mc");
  // Stil-Umschaltungen erst anwenden, wenn beide Karten geladen sind
  let loadedCount = 0, kindPending = kind !== "mc", dimPending = false;
  const ready = () => loadedCount === 2;
  const onLoaded = () => {
    loadedCount++;
    if (!ready()) return;
    if (kindPending) { kindPending = false; applyKind(); }
    if (dimPending) { dimPending = false; applyDimension(); }
  };
  map.once("load", onLoaded);
  labels.once("load", onLoaded);
  // Die kompakte Quellenangabe startet aufgeklappt; zugeklappt verdeckt sie nichts
  map.once("load", () => container.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show"));

  return {
    map,
    // Marker kommen auf die Beschriftungskarte, damit sie über den Namen liegen
    addMarker(element, lngLat) { return new maplibregl.Marker({ element }).setLngLat(lngLat).addTo(labels); },
    setAccuracy(lat, lon, radius) {
      const f = circle(lat, lon, radius);
      const src = map.getSource("accuracy");
      if (src) src.setData(accuracyData(f)); else pendingAccuracy = f;
    },
    // Route als Liste von [lon, lat]; null löscht sie
    setRoute(coordinates) {
      const src = map.getSource("route");
      if (src) src.setData(routeData(coordinates)); else pendingRoute = coordinates;
    },
    fitRoute(coordinates, padding) {
      const bounds = coordinates.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
      map.fitBounds(bounds, { padding, maxZoom: 17.5 });
    },
    setKind(kind) {
      state.kind = kind;
      if (ready()) applyKind(); else kindPending = true;
    },
    setDimension(dim) {
      if (dim === state.dim) return;
      state.dim = dim;
      if (ready()) applyDimension(); else dimPending = true;
    },
    setPixelSize(px) {
      state.px = px;
      if (state.kind === "mc") map.setPixelRatio(1 / px);
      for (const id of Object.keys(PATTERNS[state.dim])) {
        if (map.hasImage(id)) { map.removeImage(id); addPattern(id); }
      }
    },
    // Klassen der Flächen am Punkt, aus den geladenen Kacheln; null, solange noch nichts geladen ist
    areasAt(lngLat) {
      if (!map.getSource("omt")) return null;
      const hits = {};
      let any = false;
      for (const layer of ["water", "landcover", "landuse", "park"]) {
        let features;
        try { features = map.querySourceFeatures("omt", { sourceLayer: layer }); } catch { return null; }
        if (features.length) any = true;
        const hit = features.find((f) => (layer !== "water" || f.properties.brunnel !== "tunnel") && pointInFeature(lngLat, f.geometry));
        if (hit) hits[layer] = layer === "park" ? true : hit.properties.class ?? true;
      }
      return any ? hits : null;
    },
    metersPerCssPixel() {
      return (156543.03 * Math.cos((map.getCenter().lat * Math.PI) / 180)) / 2 ** map.getZoom();
    },
  };
}
