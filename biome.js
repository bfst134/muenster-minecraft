// Biom an einem Punkt, abgeleitet aus den Kartenflächen (OpenMapTiles-Klassen).

// Liegt [lon, lat] in einem GeoJSON-Polygon oder -Multipolygon? (Ray-Casting, Löcher werden berücksichtigt)
export function pointInFeature([lon, lat], geometry) {
  const inRing = (ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const inPolygon = (rings) => inRing(rings[0]) && !rings.slice(1).some(inRing);
  if (geometry.type === "Polygon") return inPolygon(geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.some(inPolygon);
  return false;
}

// hits: Klassen der Flächen am Punkt, z. B. { water: "lake", landcover: "wood", landuse: "residential", park: true }
export function biomeFor(hits, dimension = "overworld") {
  const { water, landcover, landuse, park } = hits;
  if (dimension === "nether") {
    if (water) return "minecraft:basalt_deltas";
    if (landuse === "cemetery") return "minecraft:soul_sand_valley";
    if (landcover === "wood") return "minecraft:crimson_forest";
    if (park || landcover === "grass") return "minecraft:warped_forest";
    return "minecraft:nether_wastes";
  }
  if (water) return ["river", "canal", "stream", "ditch", "drain"].includes(water) ? "minecraft:river" : "minecraft:ocean";
  if (landcover === "wood") return "minecraft:forest";
  if (landcover === "wetland") return "minecraft:swamp";
  if (landcover === "sand") return "minecraft:beach";
  if (landuse === "cemetery") return "minecraft:dark_forest";
  if (landcover === "farmland") return "minecraft:sunflower_plains";
  if (park) return "minecraft:meadow";
  return "minecraft:plains";
}
