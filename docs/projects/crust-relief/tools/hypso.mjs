import { readFileSync } from "node:fs";
import { join } from "node:path";

const runDir = process.argv[2],
  label = process.argv[3] || "";
const m = JSON.parse(readFileSync(join(runDir, "manifest.json"), "utf8"));
const pick = (k) => {
  const a = m.layers.filter((l) => l.kind === "grid" && l.dataTypeKey === k);
  return a.length ? a.slice().sort((x, y) => (y.stepIndex ?? 0) - (x.stepIndex ?? 0))[0] : null;
};
const rd = (k, kind) => {
  const l = pick(k);
  if (!l) return null;
  const b = readFileSync(join(runDir, l.field.data.path));
  if (kind === "u8") return new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
  if (kind === "i16") return new Int16Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 2));
  if (kind === "f32") return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 4));
};
const type = rd("foundation.crustTiles.type", "u8");
const baseEl = rd("foundation.crustTiles.baseElevation", "f32"); // crustUnit (0..1)
const buoy = rd("foundation.crustTiles.buoyancy", "f32");
const topoEl = rd("morphology.topography.elevation", "i16"); // post base-topo + sculpt
const finalEl = rd("map.elevation.elevation", "i16");
const land = rd("map.morphology.continents.landMask", "u8");
const N = type.length;

// --- histogram helper ---
function hist(vals, lo, hi, nbins) {
  const w = (hi - lo) / nbins;
  const h = new Array(nbins).fill(0);
  let under = 0,
    over = 0;
  for (const v of vals) {
    if (v < lo) {
      under++;
      continue;
    }
    if (v >= hi) {
      over++;
      continue;
    }
    h[Math.min(nbins - 1, Math.floor((v - lo) / w))]++;
  }
  return { lo, hi, w, h, under, over, n: vals.length };
}
function bar(h, scale) {
  return h.map((c) => "#".repeat(Math.round(c / scale))).map((s, i) => s);
}
function printHist(title, H, fmt = (x) => x.toFixed(2)) {
  console.log(
    `\n${title}  (n=${H.n}, under<${fmt(H.lo)}=${H.under}, over>=${fmt(H.hi)}=${H.over})`
  );
  const max = Math.max(...H.h, 1);
  const scale = max / 40;
  for (let i = 0; i < H.h.length; i++) {
    const a = H.lo + i * H.w,
      b = a + H.w;
    const pct = ((100 * H.h[i]) / H.n).toFixed(1).padStart(5);
    console.log(
      `  [${fmt(a).padStart(7)},${fmt(b).padStart(7)}) ${String(H.h[i]).padStart(6)} ${pct}% ${"#".repeat(Math.round(H.h[i] / scale))}`
    );
  }
}

// crust split
const contUnit = [],
  ocUnit = [],
  contBuoy = [],
  ocBuoy = [];
const contTopo = [],
  ocTopo = [];
for (let i = 0; i < N; i++) {
  if (type[i] === 1) {
    contUnit.push(baseEl[i]);
    contBuoy.push(buoy[i]);
    contTopo.push(topoEl[i]);
  } else {
    ocUnit.push(baseEl[i]);
    ocBuoy.push(buoy[i]);
    ocTopo.push(topoEl[i]);
  }
}
const q = (arr, p) => {
  const a = arr.slice().sort((x, y) => x - y);
  return a[Math.floor(p * (a.length - 1))];
};
const stat = (arr) => ({
  n: arr.length,
  min: +q(arr, 0).toFixed(3),
  p10: +q(arr, 0.1).toFixed(3),
  p25: +q(arr, 0.25).toFixed(3),
  p50: +q(arr, 0.5).toFixed(3),
  p75: +q(arr, 0.75).toFixed(3),
  p90: +q(arr, 0.9).toFixed(3),
  max: +q(arr, 1).toFixed(3),
});

console.log(`=== ${label} : crust counts ===`);
console.log(
  JSON.stringify({
    total: N,
    continental: contUnit.length,
    oceanic: ocUnit.length,
    contPct: +((100 * contUnit.length) / N).toFixed(1),
  })
);
console.log(
  "\ncrustUnit (baseElevation, fed to base-topo) — continental:",
  JSON.stringify(stat(contUnit))
);
console.log("crustUnit — oceanic:", JSON.stringify(stat(ocUnit)));

// crustUnit histograms — is the continental cluster narrow / near the drowning value?
// earthlike: elevation 0 <-> crustUnit = 0.75/1.29 = 0.581
printHist("crustUnit CONTINENTAL", hist(contUnit, 0, 1, 20));
printHist("crustUnit OCEANIC", hist(ocUnit, 0, 1, 20));

// THE HYPSOMETRIC CURVE — post-sculpt base topography elevation (all tiles)
const allTopo = Array.from(topoEl);
printHist(
  "HYPSOMETRY: morphology.topography.elevation ALL TILES",
  hist(allTopo, -90, 60, 30),
  (x) => x.toFixed(0)
);
printHist("HYPSOMETRY: topo.elevation CONTINENTAL crust", hist(contTopo, -90, 60, 30), (x) =>
  x.toFixed(0)
);
printHist("HYPSOMETRY: topo.elevation OCEANIC crust", hist(ocTopo, -90, 60, 30), (x) =>
  x.toFixed(0)
);

// where does sea level land? final landMask cut
let landMin = 1e9,
  waterMax = -1e9;
const landEl = [],
  waterEl = [];
for (let i = 0; i < N; i++) {
  if (land[i] === 1) {
    landEl.push(finalEl[i]);
  } else {
    waterEl.push(finalEl[i]);
  }
}
console.log("\nfinal land/water split (map.elevation):");
console.log(
  "  land elev:",
  JSON.stringify(stat(landEl)),
  "n=",
  landEl.length,
  `(${((100 * landEl.length) / N).toFixed(1)}%)`
);
console.log(
  "  water elev:",
  JSON.stringify(stat(waterEl)),
  "n=",
  waterEl.length,
  `(${((100 * waterEl.length) / N).toFixed(1)}%)`
);

// "drowning zone" mass: continental crust whose topo elevation is in [-15,+15]
let cz = 0,
  cAbove = 0,
  cBelow = 0;
for (const e of contTopo) {
  if (e >= -15 && e <= 15) cz++;
  else if (e > 15) cAbove++;
  else cBelow++;
}
console.log("\nCONTINENTAL crust by topo-elevation band:");
console.log(
  `  clearly above (>+15): ${cAbove} (${((100 * cAbove) / contTopo.length).toFixed(1)}%)`
);
console.log(
  `  DROWNING ZONE [-15,+15]: ${cz} (${((100 * cz) / contTopo.length).toFixed(1)}%)  <-- flat-near-sea-level mass`
);
console.log(
  `  clearly below (<-15): ${cBelow} (${((100 * cBelow) / contTopo.length).toFixed(1)}%)`
);
