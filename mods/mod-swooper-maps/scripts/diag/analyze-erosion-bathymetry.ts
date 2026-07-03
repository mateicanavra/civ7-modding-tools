#!/usr/bin/env bun
// Isolate how much EROSION vs ISLAND injection drives continental-shelf width, by
// replaying the real shelf physics over three bathymetry snapshots from one diag:dump:
//   pre-erosion  : post-carve, pre-island  (morphology-coasts bathymetryPreErosion)
//   post-erosion : post-erosion, pre-island (morphology-erosion geomorphology bathymetry)
//   post-island  : the exact shelf input    (morphology-shelf bathymetryInput)
//
// The pre-R3 shelf was computed on the pre-erosion/pre-island state, so:
//   OLD shelf  ~= shelf(pre-erosion)
//   +d-erosion  = shelf(post-erosion) - shelf(pre-erosion)   [landmask/dist/boundary fixed]
//   +d-island   = shelf(post-island)  - shelf(post-erosion)  [island injection bundle]
//   NEW shelf   = shelf(post-island)  (validated against the live shelfMask bin)
//
// Usage: bun scripts/diag/analyze-erosion-bathymetry.ts <dumpDir> [--json]
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;

// latest-juicy morphology-shelf config, shelfWidth "wide" -> breakDepthScale 1 * 1.25.
const SHELF_CONFIG = {
  shallowQuantile: 0.6,
  breakDepthSampleRadius: 8,
  activeClosenessThreshold: 0.35,
  activeBreakDepthFactor: 0.6,
  passiveBreakDepthFactor: 1.25,
  absoluteMaxShelfDepth: -30,
  breakDepthScale: 1.25,
};

const dumpDir = process.argv[2];
const asJson = process.argv.includes("--json");
if (!dumpDir) {
  console.error("usage: analyze-erosion-bathymetry <dumpDir> [--json]");
  process.exit(1);
}
const dataDir = join(dumpDir, "data");
const files = readdirSync(dataDir);

function pickPath(sub: string): string {
  const f = files.find((x) => x.toLowerCase().includes(sub) && x.endsWith(".bin"));
  if (!f) throw new Error(`no bin matching ${sub}`);
  return join(dataDir, f);
}
const readU8 = (sub: string): Uint8Array => Uint8Array.from(readFileSync(pickPath(sub)));
const readI16 = (sub: string): Int16Array =>
  new Int16Array(Uint8Array.from(readFileSync(pickPath(sub))).buffer);

// dims from manifest
const manifest = JSON.parse(readFileSync(join(dumpDir, "manifest.json"), "utf8")) as any;
let width = 0;
let height = 0;
const findDims = (o: any): void => {
  if (o && typeof o === "object") {
    if (typeof o.width === "number" && typeof o.height === "number" && !width) {
      width = o.width;
      height = o.height;
    }
    for (const v of Object.values(o)) findDims(v);
  }
};
findDims(manifest);
const size = width * height;

// --- snapshots ---
const bathyPre = readI16("coastlinemetrics-bathymetrypreerosion-tile");
const bathyPost = readI16("geomorphology-morphology-topography-bathymetry-tile");
const bathyShelf = readI16("shelf-bathymetryinput-tile");
const lmPreIsland = readU8("geomorphology-morphology-topography-landmask-tile");
const lmPostIsland = readU8("shelf-landmaskinput-tile");
const boundaryCloseness = readU8("morphology-belts-boundarycloseness-tile");
const boundaryType = readU8("morphology-belts-boundarytype-tile");
const liveShelf = readU8("compute-shelf-morphology-shelf-shelfmask-tile");
const liveShelfDist = (() => {
  try {
    return new Uint16Array(
      Uint8Array.from(readFileSync(pickPath("compute-shelf-morphology-shelf-distancetocoast-tile")))
        .buffer
    );
  } catch {
    return null;
  }
})();

for (const [name, arr] of [
  ["bathyPre", bathyPre],
  ["bathyPost", bathyPost],
  ["bathyShelf", bathyShelf],
  ["lmPreIsland", lmPreIsland],
  ["lmPostIsland", lmPostIsland],
] as const) {
  if (arr.length !== size)
    throw new Error(`${name} length ${arr.length} != ${size} (${width}x${height})`);
}

// --- replicate shelf-op support: coastal adjacency + multi-source distance BFS ---
function coastalUnion(landMask: Uint8Array): Uint8Array {
  const coastal = new Uint8Array(size);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const land = landMask[i] === 1;
      let border = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        if (border) return;
        if ((landMask[ny * width + nx] === 1) !== land) border = true;
      });
      if (border) coastal[i] = 1; // land-adjacent-to-water OR water-adjacent-to-land
    }
  }
  return coastal;
}
function distanceToCoast(landMask: Uint8Array): Uint16Array {
  const coastal = coastalUnion(landMask);
  const dist = new Uint16Array(size).fill(65535);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;
  for (let i = 0; i < size; i++) {
    if (coastal[i] === 1) {
      dist[i] = 0;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const idx = queue[head++]!;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const nd = (dist[idx] + 1) as number;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (dist[ni] > nd) {
        dist[ni] = nd;
        queue[tail++] = ni;
      }
    });
  }
  return dist;
}

function clampInt16(v: number): number {
  return Math.max(-32768, Math.min(32767, v | 0));
}

// faithful replica of compute-shelf-mask/strategies/default.ts run()
// forcedCutoff: override the nearshore quantile cutoff (to isolate the cutoff-shift factor).
function shelf(
  landMask: Uint8Array,
  bathymetry: Int16Array,
  dist: Uint16Array,
  forcedCutoff?: number
) {
  const cfg = SHELF_CONFIG;
  const sampleRadius = cfg.breakDepthSampleRadius;
  const activeThresholdU8 = Math.floor(cfg.activeClosenessThreshold * 255);

  // 1) nearshore quantile cutoff
  const samples: number[] = [];
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) continue;
    const d = dist[i] | 0;
    if (d <= 0 || d > sampleRadius) continue;
    samples.push(Math.min(0, bathymetry[i] ?? 0));
  }
  samples.sort((a, b) => a - b);
  const q = Math.max(0, Math.min(1, cfg.shallowQuantile));
  const shallowCutoff =
    forcedCutoff !== undefined
      ? forcedCutoff
      : samples.length
        ? Math.min(0, samples[Math.floor(q * (samples.length - 1))] ?? 0)
        : 0;

  // 2) per-tile margin-modulated break depth + depth gate
  const depthGate = new Uint8Array(size);
  let activeMargin = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) continue;
    const t = boundaryType[i] | 0;
    const isActive =
      (t === BOUNDARY_CONVERGENT || t === BOUNDARY_TRANSFORM) &&
      (boundaryCloseness[i] | 0) >= activeThresholdU8;
    if (isActive) activeMargin++;
    const marginFactor = isActive ? cfg.activeBreakDepthFactor : cfg.passiveBreakDepthFactor;
    const rawBreak = shallowCutoff * cfg.breakDepthScale * marginFactor;
    const breakDepth = clampInt16(
      Math.max(cfg.absoluteMaxShelfDepth, Math.min(0, Math.round(rawBreak)))
    );
    if ((bathymetry[i] ?? 0) >= breakDepth) depthGate[i] = 1;
  }

  // 3) connectivity flood from land-adjacent depth-gated water
  const shelfMask = new Uint8Array(size);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (landMask[i] === 1 || depthGate[i] !== 1) continue;
      let adj = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        if (adj) return;
        if (landMask[ny * width + nx] === 1) adj = true;
      });
      if (!adj) continue;
      shelfMask[i] = 1;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const idx = queue[head++]!;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (landMask[ni] === 1 || shelfMask[ni] === 1 || depthGate[ni] !== 1) return;
      shelfMask[ni] = 1;
      queue[tail++] = ni;
    });
  }
  let count = 0;
  let depthGated = 0;
  for (let i = 0; i < size; i++) {
    if (shelfMask[i]) count++;
    if (depthGate[i]) depthGated++;
  }
  return { shelfMask, count, depthGated, shallowCutoff, activeMargin };
}

// --- bathymetry-by-distance profile (water tiles only) ---
function profile(landMask: Uint8Array, bathymetry: Int16Array, dist: Uint16Array) {
  const bins: Record<string, number[]> = {};
  const key = (d: number) => (d >= 9 ? "9+" : String(d));
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) continue;
    const d = dist[i] | 0;
    if (d <= 0 || d === 65535) continue;
    (bins[key(d)] ??= []).push(Math.min(0, bathymetry[i] ?? 0));
  }
  const out: Record<string, { n: number; mean: number; median: number }> = {};
  for (const k of ["1", "2", "3", "4", "5", "6", "7", "8", "9+"]) {
    const v = bins[k] ?? [];
    if (!v.length) {
      out[k] = { n: 0, mean: 0, median: 0 };
      continue;
    }
    v.sort((a, b) => a - b);
    out[k] = {
      n: v.length,
      mean: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(2),
      median: v[Math.floor(v.length / 2)] ?? 0,
    };
  }
  return out;
}

// distances per era
const distPre = distanceToCoast(lmPreIsland); // pre-erosion & post-erosion share the pre-island landmask
const distPost = distPre;
const distIsland = distanceToCoast(lmPostIsland);

// validation: my distance vs live shelf distance (post-island)
let distMismatch = -1;
if (liveShelfDist && liveShelfDist.length === size) {
  distMismatch = 0;
  for (let i = 0; i < size; i++) if (distIsland[i] !== liveShelfDist[i]) distMismatch++;
}

// shelves
const sPre = shelf(lmPreIsland, bathyPre, distPre);
const sPost = shelf(lmPreIsland, bathyPost, distPost);
const sIsland = shelf(lmPostIsland, bathyShelf, distIsland);
// Decompose the island delta: new geography at the OLD cutoff vs the global-cutoff shift.
const sIslandOldCutoff = shelf(lmPostIsland, bathyShelf, distIsland, sPre.shallowCutoff);

// validation: my post-island shelf vs the live shelfMask bin
let liveCount = 0;
let shelfDiff = 0;
for (let i = 0; i < size; i++) {
  if (liveShelf[i]) liveCount++;
  if ((sIsland.shelfMask[i] ? 1 : 0) !== (liveShelf[i] ? 1 : 0)) shelfDiff++;
}

const out = {
  dims: { width, height, size },
  validation: {
    distanceVsLive: distMismatch, // 0 == my distance BFS reproduces the live shelf distance
    offlineShelfTiles: sIsland.count,
    liveShelfTiles: liveCount,
    shelfMaskDiffTiles: shelfDiff, // 0 == faithful op replica
  },
  shelfTiles: {
    preErosion_old: sPre.count,
    postErosion_preIsland: sPost.count,
    postIsland_new: sIsland.count,
  },
  attribution: {
    erosionDelta: sPost.count - sPre.count,
    islandDelta: sIsland.count - sPost.count,
    totalGrowth: sIsland.count - sPre.count,
    erosionPctOfGrowth:
      sIsland.count - sPre.count !== 0
        ? +(((sPost.count - sPre.count) / (sIsland.count - sPre.count)) * 100).toFixed(1)
        : 0,
    // split the island delta: how much is the new island geography at the OLD cutoff,
    // vs the global nearshore-cutoff deepening (islands add samples -> cutoff -7 -> -9)?
    islandGeometryDelta: sIslandOldCutoff.count - sPost.count,
    globalCutoffShiftDelta: sIsland.count - sIslandOldCutoff.count,
  },
  shallowCutoff: {
    preErosion: sPre.shallowCutoff,
    postErosion: sPost.shallowCutoff,
    postIsland: sIsland.shallowCutoff,
  },
  depthGatedTiles: {
    preErosion: sPre.depthGated,
    postErosion: sPost.depthGated,
    postIsland: sIsland.depthGated,
  },
  nearshoreBathymetryByDistance: {
    preErosion: profile(lmPreIsland, bathyPre, distPre),
    postErosion: profile(lmPreIsland, bathyPost, distPost),
    postIsland: profile(lmPostIsland, bathyShelf, distIsland),
  },
};

console.log(JSON.stringify(out, null, asJson ? 0 : 2));
