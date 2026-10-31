// Kleine Pixel-Icons als SVG. Jedes Zeichen im Raster ist ein Pixel; "." ist durchsichtig.
// Als Grafik statt Emoji, damit iOS keine bunten Emoji daraus macht.

const ICONS = {
  gear: ["....#....", ".#.###.#.", "..#####..", ".##...##.", "###...###", ".##...##.", "..#####..", ".#.###.#.", "....#...."],
  copy: ["######...", "#....#...", "#..######", "#..#....#", "####....#", "...#....#", "...#....#", "...######"],
  share: ["....#....", "...###...", "..#.#.#..", "....#....", "##..#..##", "#.......#", "#.......#", "#########"],
  paste: ["...###...", ".##...##.", ".#.###.#.", ".#.....#.", ".#.###.#.", ".#.....#.", ".#.###.#.", ".#######."],
  gps: ["....#....", "..#####..", ".#..#..#.", ".#.....#.", "###.#.###", ".#.....#.", ".#..#..#.", "..#####..", "....#...."],
  star: ["....#....", "...###...", "#########", ".#######.", "..#####..", "..##.##..", ".##...##.", ".#.....#."],
  list: ["#.#######", ".........", "#.#######", ".........", "#.#######", ".........", "#.#######"],
  trophy: ["#.#####.#", "#.#####.#", ".#######.", "..#####..", "...###...", "....#....", "...###...", "..#####.."],
  arrow: ["...#...", "..###..", ".#####.", "#######"],
  route: ["......##.", "......##.", ".......#.", ".....##..", "....#....", "..##.....", ".#.......", "##.......", "##......."],
  trash: ["..#####..", "#########", ".#.#.#.#.", ".#.#.#.#.", ".#.#.#.#.", ".#.#.#.#.", "..#####.."],
  // Netherportal: Obsidianrahmen (o), Portalfarben (p, l)
  portal: ["ooooooo", "oplpplo", "opplplo", "olpplpo", "opllppo", "oplpplo", "olppplo", "oplplpo", "ooooooo"],
};
const PALETTE = { o: "#2a1f40", p: "#8a3ad8", l: "#c48cf0" };

export function icon(name, { size = 20, color = "#fff", shadow = "#3f3f3f" } = {}) {
  const rows = ICONS[name];
  const w = Math.max(...rows.map((r) => r.length)), h = rows.length;
  const rects = (d, fill) => rows.flatMap((row, y) => [...row].map((c, x) => {
    if (c === ".") return "";
    const f = fill ?? (c === "#" ? color : PALETTE[c]);
    return `<rect x="${x + d}" y="${y + d}" width="1" height="1" fill="${f}"/>`;
  })).join("");
  const n = Math.max(w, h) + 1;
  // Raster mittig in ein quadratisches Feld setzen
  const ox = (n - 1 - w) / 2, oy = (n - 1 - h) / 2;
  return `<svg viewBox="${-ox} ${-oy} ${n} ${n}" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true">`
    + `${shadow ? rects(1, shadow) : ""}${rects(0)}</svg>`;
}
