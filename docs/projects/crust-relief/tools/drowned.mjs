import { readFileSync } from "node:fs";
import { join } from "node:path";
const runDir = process.argv[2], label = process.argv[3] || "";
const m = JSON.parse(readFileSync(join(runDir, "manifest.json"), "utf8"));
const pick = (k) => { const a = m.layers.filter((l) => l.kind === "grid" && l.dataTypeKey === k); return a.length ? a.slice().sort((x, y) => (y.stepIndex ?? 0) - (x.stepIndex ?? 0))[0] : null; };
const rd = (k, kind) => { const l = pick(k); if (!l) return null; const b = readFileSync(join(runDir, l.field.data.path)); const d = l.dims; if (kind === "u8") return { v: new Uint8Array(b.buffer, b.byteOffset, b.byteLength), w: d.width, h: d.height }; return { v: new Int16Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 2)), w: d.width, h: d.height }; };
const land = rd("map.morphology.continents.landMask", "u8");
const shelf = rd("map.morphology.coasts.shelfMask", "u8");
const coastal = rd("map.morphology.coasts.coastalWater", "u8");
const crust = rd("foundation.crustTiles.type", "u8");
const bathy = rd("morphology.topography.bathymetry", "i16");
const W = land.w, H = land.h, N = W * H;
const isCoast = (i) => (shelf && shelf.v[i] === 1) || (coastal && coastal.v[i] === 1);

// odd-r hex neighbors
const DIFF = [
  [[+1, 0], [0, -1], [-1, -1], [-1, 0], [-1, +1], [0, +1]],
  [[+1, 0], [+1, -1], [0, -1], [-1, 0], [0, +1], [+1, +1]],
];
function neighbors(x, y) {
  const out = [];
  for (const [dx, dy] of DIFF[y & 1]) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx); }
  return out;
}
// multi-source BFS distance from land over ALL tiles
const dist = new Int32Array(N).fill(-1);
let q = [];
for (let i = 0; i < N; i++) if (land.v[i] === 1) { dist[i] = 0; q.push(i); }
let head = 0;
while (head < q.length) { const i = q[head++]; const y = (i / W) | 0, x = i - y * W; for (const ni of neighbors(x, y)) if (dist[ni] === -1) { dist[ni] = dist[i] + 1; q.push(ni); } }

// classify
let landN = 0, waterN = 0, coastN = 0, oceanN = 0;
let contTot = 0, contLand = 0, contSub = 0, contSubShelf = 0;
let ocTot = 0, ocSub = 0, ocShelf = 0;
const coastByDist = {}; // distance bucket of coast tiles
const coastContByDist = {}; // coast tiles on continental crust by dist
function bucket(d) { if (d <= 1) return "1"; if (d <= 2) return "2"; if (d <= 4) return "3-4"; if (d <= 8) return "5-8"; return "9+"; }
let contSubElev = [];
for (let i = 0; i < N; i++) {
  const c = crust ? crust.v[i] : 0;
  if (land.v[i] === 1) { landN++; if (c === 1) { contTot++; contLand++; } else { ocTot++; } continue; }
  waterN++;
  const co = isCoast(i);
  if (co) coastN++; else oceanN++;
  const b = bucket(dist[i]);
  if (co) { coastByDist[b] = (coastByDist[b] || 0) + 1; }
  if (c === 1) { contTot++; contSub++; if (co) { contSubShelf++; coastContByDist[b] = (coastContByDist[b] || 0) + 1; } contSubElev.push(bathy ? bathy.v[i] : 0); }
  else { ocTot++; ocSub++; if (co) ocShelf++; }
}
contSubElev.sort((a, b) => a - b);
const qv = (p) => contSubElev.length ? contSubElev[Math.floor(p * (contSubElev.length - 1))] : 0;
const pct = (x, d) => +(100 * x / d).toFixed(1);
console.log(JSON.stringify({
  label,
  map: { land: landN, water: waterN, coast: coastN, ocean: oceanN, coastPctMap: pct(coastN, N), oceanPctMap: pct(oceanN, N) },
  coastByDistToLand: coastByDist,
  coastOnContinentalByDist: coastContByDist,
  crustOfCoast: { onContinental: contSubShelf, onOceanic: ocShelf, contShareOfCoast: pct(contSubShelf, coastN) },
  continentalCrust: { total: contTot, emergentLand: contLand, submerged: contSub, submergedPctOfCont: pct(contSub, contTot), submergedThatAreShelf: contSubShelf },
  submergedContinentalBathy: { n: contSubElev.length, min: contSubElev[0], p10: qv(0.1), p50: qv(0.5), p90: qv(0.9), max: contSubElev[contSubElev.length - 1] },
}, null, 2));
