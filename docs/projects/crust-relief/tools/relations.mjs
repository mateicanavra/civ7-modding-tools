import { readFileSync } from "node:fs";
import { join } from "node:path";

// ============================================================================
// relations.mjs — crust-relief acceptance harness (R1–R4)
//
//   node relations.mjs <runDir> [label]
//
// Reads a diagnostics dump directory (manifest.json + .bin layers) and computes
// the cross-map relational acceptance metrics R1–R4. Mirrors the manifest/.bin
// reading pattern of the sibling tools hypso.mjs and drowned.mjs exactly: same
// `pick`/`rd` helpers, same dataTypeKey strings, same odd-r hex neighbour
// offsets. Emits a single pretty (2-space) JSON object on stdout.
// ============================================================================

const runDir = process.argv[2],
  label = process.argv[3] || "";
const m = JSON.parse(readFileSync(join(runDir, "manifest.json"), "utf8"));

// --- manifest helpers (copied from sibling tools) ---------------------------
const pick = (k) => {
  const a = m.layers.filter((l) => l.kind === "grid" && l.dataTypeKey === k);
  return a.length ? a.slice().sort((x, y) => (y.stepIndex ?? 0) - (x.stepIndex ?? 0))[0] : null;
};
// rd returns { v, w, h } like drowned.mjs (width/height from the layer dims),
// or null if the layer is absent so optional layers can be skipped gracefully.
const rd = (k, kind) => {
  const l = pick(k);
  if (!l) return null;
  const b = readFileSync(join(runDir, l.field.data.path));
  const d = l.dims;
  if (kind === "u8")
    return { v: new Uint8Array(b.buffer, b.byteOffset, b.byteLength), w: d.width, h: d.height };
  if (kind === "i16")
    return {
      v: new Int16Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 2)),
      w: d.width,
      h: d.height,
    };
  if (kind === "f32")
    return {
      v: new Float32Array(b.buffer, b.byteOffset, Math.floor(b.byteLength / 4)),
      w: d.width,
      h: d.height,
    };
  return null;
};

// --- layers (same keys as the sibling tools) --------------------------------
const land = rd("map.morphology.continents.landMask", "u8"); // required
const crust = rd("foundation.crustTiles.type", "u8"); // 1 = continental
const buoy = rd("foundation.crustTiles.buoyancy", "f32"); // optional
const elev = rd("morphology.topography.elevation", "i16"); // required
const bathy = rd("morphology.topography.bathymetry", "i16"); // optional
const shelf = rd("map.morphology.coasts.shelfMask", "u8"); // optional
const coastal = rd("map.morphology.coasts.coastalWater", "u8"); // optional

if (!land) {
  console.error("FATAL: missing required layer map.morphology.continents.landMask");
  process.exit(1);
}
if (!elev) {
  console.error("FATAL: missing required layer morphology.topography.elevation");
  process.exit(1);
}

// Width/height come from the layer dims (as in drowned.mjs: land.w, land.h).
const W = land.w,
  H = land.h,
  N = W * H;

const notes = [];

// --- odd-r hex neighbours (copied verbatim from drowned.mjs) ----------------
const DIFF = [
  [
    [+1, 0],
    [0, -1],
    [-1, -1],
    [-1, 0],
    [-1, +1],
    [0, +1],
  ],
  [
    [+1, 0],
    [+1, -1],
    [0, -1],
    [-1, 0],
    [0, +1],
    [+1, +1],
  ],
];
function neighbors(x, y) {
  const out = [];
  for (const [dx, dy] of DIFF[y & 1]) {
    const nx = x + dx,
      ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) out.push(ny * W + nx);
  }
  return out;
}

// --- small numeric helpers --------------------------------------------------
const pct = (x, d) => (d > 0 ? +((100 * x) / d).toFixed(2) : null);
function quantile(sortedAsc, p) {
  if (!sortedAsc.length) return null;
  return sortedAsc[Math.floor(p * (sortedAsc.length - 1))];
}
function median(sortedAsc) {
  return quantile(sortedAsc, 0.5);
}

// ============================================================================
// Sea level — derived as in hypso.mjs (infer from water elevation).
//
// hypso treats the morphology elevation field as the hypsometric surface and
// uses 0 as the sea-level cut. Here we infer: if any non-land (water) tile has
// elevation > 0 the field is NOT yet sea-level-relative, so sea level = the max
// elevation among water tiles; otherwise the field is already sea-level-relative
// and sea level = 0. We print which branch we used.
// ============================================================================
let waterMaxElev = -Infinity,
  sawWater = false;
for (let i = 0; i < N; i++) {
  if (land.v[i] !== 1) {
    sawWater = true;
    if (elev.v[i] > waterMaxElev) waterMaxElev = elev.v[i];
  }
}
let seaLevel, seaLevelMode;
if (sawWater && waterMaxElev > 0) {
  seaLevel = waterMaxElev;
  seaLevelMode =
    "inferred-from-water-elevation (field not sea-level-relative; seaLevel = max elevation among water tiles)";
} else {
  seaLevel = 0;
  seaLevelMode = "zero (elevations already sea-level-relative; no water tile has elevation > 0)";
}
// rel = elevation relative to sea level, used throughout.
const rel = (i) => elev.v[i] - seaLevel;

// ============================================================================
// R1 — bidirectional continental relief (symmetry).
//   Over continental-crust tiles (crustType == 1) measure how relief splits
//   above/below the waterline, its spread, the near-waterline flat lump (the
//   pathology), and whether the rel distribution dips at the waterline
//   (bimodal antimode).
// ============================================================================
function computeR1() {
  if (!crust) {
    notes.push("R1 skipped: missing foundation.crustTiles.type");
    return null;
  }
  const relVals = [];
  let emerged = 0,
    drowned = 0,
    nearBand = 0;
  for (let i = 0; i < N; i++) {
    if (crust.v[i] !== 1) continue;
    const r = rel(i);
    relVals.push(r);
    if (r > 0) emerged++;
    else drowned++;
    if (Math.abs(r) <= 10) nearBand++;
  }
  const n = relVals.length;
  if (n === 0) {
    notes.push("R1 skipped: no continental-crust tiles");
    return null;
  }
  const sorted = relVals.slice().sort((a, b) => a - b);
  const p10 = quantile(sorted, 0.1),
    p50 = quantile(sorted, 0.5),
    p90 = quantile(sorted, 0.9);

  // bimodality: histogram of continental rel over [-80, 60] in 28 bins.
  const LO = -80,
    HI = 60,
    NB = 28,
    w = (HI - LO) / NB;
  const hgram = new Array(NB).fill(0);
  for (const r of relVals) {
    if (r < LO || r >= HI) continue;
    hgram[Math.min(NB - 1, Math.floor((r - LO) / w))]++;
  }
  const binOf = (val) => {
    const clamped = Math.max(LO, Math.min(HI - 1e-9, val));
    return Math.min(NB - 1, Math.max(0, Math.floor((clamped - LO) / w)));
  };
  // antimode at waterline: the bin containing rel=0 is a local MINIMUM relative
  // to a bin ~25 above and a bin ~25 below (a dip at the waterline = bimodal).
  const bWater = binOf(0);
  const bAbove = binOf(25);
  const bBelow = binOf(-25);
  const cWater = hgram[bWater],
    cAbove = hgram[bAbove],
    cBelow = hgram[bBelow];
  const antimodeAtWaterline = cWater < cAbove && cWater < cBelow;

  return {
    n,
    contEmergedPct: pct(emerged, n),
    contDrownedPct: pct(drowned, n),
    relP10: p10,
    relP50: p50,
    relP90: p90,
    relSpread: p90 != null && p10 != null ? p90 - p10 : null,
    nearWaterlineBandPct: pct(nearBand, n),
    bimodalCheck: {
      antimodeAtWaterline,
      waterlineBinCount: cWater,
      aboveBinCount: cAbove,
      belowBinCount: cBelow,
      bins: {
        lo: LO,
        hi: HI,
        nbins: NB,
        width: w,
        waterlineBin: bWater,
        aboveBin: bAbove,
        belowBin: bBelow,
      },
    },
  };
}

// ============================================================================
// R2 — coast/ocean bimodality.
//   Over water tiles (landMask == 0) using bathymetry (<= 0): how the sea floor
//   splits between a shallow shelf and an abyssal deep, and the median
//   separation between the two modes.
// ============================================================================
function computeR2() {
  if (!bathy) {
    notes.push("R2 skipped: missing morphology.topography.bathymetry");
    return null;
  }
  const shelfVals = [],
    deepVals = [];
  let total = 0,
    shelfN = 0,
    deepN = 0,
    midN = 0;
  for (let i = 0; i < N; i++) {
    if (land.v[i] !== 0) continue;
    const b = bathy.v[i];
    if (b > 0) continue; // only sea floor (<= 0)
    total++;
    if (b >= -30) {
      shelfN++;
      shelfVals.push(b);
    } else if (b <= -60) {
      deepN++;
      deepVals.push(b);
    } else {
      midN++;
    }
  }
  if (total === 0) {
    notes.push("R2 skipped: no water tiles with bathymetry <= 0");
    return null;
  }
  shelfVals.sort((a, b) => a - b);
  deepVals.sort((a, b) => a - b);
  const shelfMedian = median(shelfVals),
    deepMedian = median(deepVals);
  return {
    waterTilesWithBathy: total,
    shelfPct: pct(shelfN, total),
    deepPct: pct(deepN, total),
    midPct: pct(midN, total),
    shelfMedian,
    deepMedian,
    separation: shelfMedian != null && deepMedian != null ? shelfMedian - deepMedian : null,
  };
}

// ============================================================================
// R3 — shelf belongs to land (continental coherence).
//   Flood-fill (odd-r hex, 6-neighbour) connected components over continental
//   crust (crustType == 1, land OR water). A "substantial" component is size
//   >= 13; it "has an emerged core" if it contains >= 1 land tile. Also: orphan
//   shelf = shelfMask water tiles farther than 3 hex steps from any land
//   (reusing a multi-source BFS from land like drowned.mjs).
// ============================================================================
function computeR3() {
  let components = null;
  if (crust) {
    const comp = new Int32Array(N).fill(-1);
    let nComp = 0,
      substantial = 0,
      withEmerged = 0;
    const stack = [];
    for (let s = 0; s < N; s++) {
      if (crust.v[s] !== 1 || comp[s] !== -1) continue;
      // flood-fill this continental-crust component
      const id = nComp++;
      comp[s] = id;
      stack.length = 0;
      stack.push(s);
      let size = 0,
        hasLand = false;
      while (stack.length) {
        const i = stack.pop();
        size++;
        if (land.v[i] === 1) hasLand = true;
        const y = (i / W) | 0,
          x = i - y * W;
        for (const ni of neighbors(x, y)) {
          if (crust.v[ni] === 1 && comp[ni] === -1) {
            comp[ni] = id;
            stack.push(ni);
          }
        }
      }
      if (size >= 13) {
        substantial++;
        if (hasLand) withEmerged++;
      }
    }
    components = {
      substantialContComponents: substantial,
      withEmergedCore: withEmerged,
      emergedCoreFraction: substantial > 0 ? +(withEmerged / substantial).toFixed(4) : null,
    };
  } else {
    notes.push("R3 components skipped: missing foundation.crustTiles.type");
  }

  // orphan shelf: multi-source BFS distance from land (like drowned.mjs).
  let orphanShelfPct = null;
  if (shelf) {
    const dist = new Int32Array(N).fill(-1);
    const q = [];
    for (let i = 0; i < N; i++)
      if (land.v[i] === 1) {
        dist[i] = 0;
        q.push(i);
      }
    let head = 0;
    while (head < q.length) {
      const i = q[head++];
      const y = (i / W) | 0,
        x = i - y * W;
      for (const ni of neighbors(x, y))
        if (dist[ni] === -1) {
          dist[ni] = dist[i] + 1;
          q.push(ni);
        }
    }
    let shelfWater = 0,
      orphan = 0;
    for (let i = 0; i < N; i++) {
      if (shelf.v[i] !== 1 || land.v[i] === 1) continue; // shelfMask water tiles
      shelfWater++;
      if (dist[i] === -1 || dist[i] > 3) orphan++; // not within 3 hex steps of land
    }
    orphanShelfPct = pct(orphan, shelfWater);
  } else {
    notes.push("R3 orphanShelfPct skipped: missing map.morphology.coasts.shelfMask");
  }

  if (components == null && orphanShelfPct == null) return null;
  return {
    ...(components || {
      substantialContComponents: null,
      withEmergedCore: null,
      emergedCoreFraction: null,
    }),
    orphanShelfPct,
  };
}

// ============================================================================
// R4 — landmass size spectrum.
//   Flood-fill (odd-r hex) connected components over land (landMask == 1) and
//   bucket their sizes: specks 1-12, micro 13-60, small 61-500, large 501+.
//   middleNonEmpty asks whether the spectrum has any mid-size landmasses.
// ============================================================================
function computeR4() {
  const comp = new Int32Array(N).fill(-1);
  let nComp = 0;
  let specks = 0,
    micro = 0,
    small = 0,
    large = 0,
    largest = 0;
  const stack = [];
  for (let s = 0; s < N; s++) {
    if (land.v[s] !== 1 || comp[s] !== -1) continue;
    const id = nComp++;
    comp[s] = id;
    stack.length = 0;
    stack.push(s);
    let size = 0;
    while (stack.length) {
      const i = stack.pop();
      size++;
      const y = (i / W) | 0,
        x = i - y * W;
      for (const ni of neighbors(x, y)) {
        if (land.v[ni] === 1 && comp[ni] === -1) {
          comp[ni] = id;
          stack.push(ni);
        }
      }
    }
    if (size > largest) largest = size;
    if (size <= 12) specks++;
    else if (size <= 60) micro++;
    else if (size <= 500) small++;
    else large++;
  }
  return {
    specks,
    micro,
    small,
    large,
    totalLandmasses: nComp,
    largestSize: largest,
    middleNonEmpty: micro + small > 0,
  };
}

// --- run --------------------------------------------------------------------
const R1 = computeR1();
const R2 = computeR2();
const R3 = computeR3();
const R4 = computeR4();

const out = {
  label,
  dims: { width: W, height: H, tiles: N },
  seaLevel,
  seaLevelMode,
  R1,
  R2,
  R3,
  R4,
  summary: {
    contEmergedPct: R1 ? R1.contEmergedPct : null,
    nearWaterlineBandPct: R1 ? R1.nearWaterlineBandPct : null,
    "R1.antimodeAtWaterline": R1 ? R1.bimodalCheck.antimodeAtWaterline : null,
    "R2.separation": R2 ? R2.separation : null,
    "R3.emergedCoreFraction": R3 ? R3.emergedCoreFraction : null,
    "R4.buckets": R4
      ? { specks: R4.specks, micro: R4.micro, small: R4.small, large: R4.large }
      : null,
  },
  notes,
};

console.log(JSON.stringify(out, null, 2));
