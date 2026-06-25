#!/usr/bin/env bun
// THREAD 2 HARNESS — quantify the margin-contrast gap and the global-cutoff locality, and (layer a)
// SELF-VALIDATE the per-landmass cutoff localization byte-for-byte against the live shelf bins.
// Reads ONE diag:dump and the map config, anchors on live shelf artifacts, and self-validates three
// replicas (diff 0) before reporting:
//
//   M1  width-by-margin     : is the active-narrow / passive-wide shelf contrast real or muted?
//   M2  bathy <-> margin     : does the underwater seafloor already carry a margin signal?
//   M3  cutoff locality      : per-landmass vs global cutoff — the A2/A3 dual-arm counterfactual
//                              (continental shelf DOWN, total area HOLD via redistribution-to-islands)
//   M4  decoupling           : the A4-DECOUPLE causal test — an EXCLUSION counterfactual (recompute the
//                              cutoff with vs WITHOUT island nearshore samples): continental shelf moves
//                              ~0% under the LOCAL gate vs a large % under the GLOBAL gate (the Thread-1
//                              island->continent coupling). Plus a continent cutoff pool-robustness probe.
//   M5  floor sweep          : island-shelf (A3) sensitivity to localCutoffMinSamples, offline-exact.
//
// The harness stays an INDEPENDENT replica of compute-shelf-mask: it re-derives the per-component cutoff
// field from the raw bins with its OWN code (NOT an import of the op) and still solves the knob-folded
// effScale by fitting the live breakdepth bin. A diff of 0 then requires three independent derivations
// to agree (recomputed global quantile, harness Voronoi+blend field, fitted scale).
//
// Usage: bun scripts/diag/analyze-margin-contrast.ts <dumpDir> <configFile> [--json]
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

const BOUNDARY_CONVERGENT = 1;
const BOUNDARY_TRANSFORM = 3;
const CONTINENT_MIN = 100; // land-component tiles at/above which it is a "continent"
const WINDOW = 16; // spatial-window edge (tiles) for the regional-cutoff cross-check

const dumpDir = process.argv[2];
const configFile = process.argv[3];
const asJson = process.argv.includes("--json");
if (!dumpDir || !configFile) {
  console.error("usage: analyze-margin-contrast <dumpDir> <configFile> [--json]");
  process.exit(1);
}

const dataDir = join(dumpDir, "data");
const files = readdirSync(dataDir);
function pickPath(sub: string): string {
  const matches = files.filter((x) => x.toLowerCase().includes(sub) && x.endsWith(".bin"));
  if (!matches.length) throw new Error(`no bin matching ${sub}`);
  if (matches.length > 1) throw new Error(`ambiguous bin for ${sub}: ${matches.join(", ")}`);
  return join(dataDir, matches[0]!);
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

// shelf config from the map config (knob-agnostic for the structural params; the
// shelfWidth knob folds into an EFFECTIVE breakDepthScale we solve from live data).
const cfgJson = JSON.parse(readFileSync(configFile, "utf8")) as any;
const shelfCfg = cfgJson?.config?.["morphology-shelf"]?.shelf ?? {};
const sampleRadius: number = Math.max(1, Math.trunc(shelfCfg.breakDepthSampleRadius ?? 8));
const shallowQuantile: number = Math.max(0, Math.min(1, shelfCfg.shallowQuantile ?? 0.6));
const activeClosenessThreshold: number = Math.max(
  0,
  Math.min(1, shelfCfg.activeClosenessThreshold ?? 0.35)
);
const activeBreakDepthFactor: number = shelfCfg.activeBreakDepthFactor ?? 0.6;
const passiveBreakDepthFactor: number = shelfCfg.passiveBreakDepthFactor ?? 1.25;
const absoluteMaxShelfDepth: number = Math.min(
  0,
  Math.trunc(shelfCfg.absoluteMaxShelfDepth ?? -30)
);
const activeThresholdU8 = Math.floor(activeClosenessThreshold * 255);
// Layer (a) localization params (must mirror compute-shelf-mask normalize()).
const localizeCutoff: boolean = shelfCfg.localizeCutoff === false ? false : true;
const localCutoffMinSamples: number = Math.max(
  1,
  Math.min(4096, Math.trunc(shelfCfg.localCutoffMinSamples ?? 24))
);

// --- live shelf-stage artifacts (the exact state the op read + produced) ---
const bathy = readI16("shelf-bathymetryinput-tile");
const landMask = readU8("shelf-landmaskinput-tile");
const distLive = new Uint16Array(
  Uint8Array.from(readFileSync(pickPath("compute-shelf-morphology-shelf-distancetocoast-tile")))
    .buffer
);
const boundaryType = readU8("morphology-belts-boundarytype-tile");
const boundaryCloseness = readU8("morphology-belts-boundarycloseness-tile");
const liveShelf = readU8("compute-shelf-morphology-shelf-shelfmask-tile");
const liveBreak = readI16("shelf-breakdepth-tile");
const liveGate = readU8("shelf-depthgatemask-tile");
const liveActive = readU8("shelf-activemarginmask-tile");

for (const [n, a] of [
  ["bathy", bathy],
  ["landMask", landMask],
  ["distLive", distLive],
  ["boundaryType", boundaryType],
  ["boundaryCloseness", boundaryCloseness],
  ["liveShelf", liveShelf],
  ["liveBreak", liveBreak],
  ["liveGate", liveGate],
  ["liveActive", liveActive],
] as const) {
  if (a.length !== size) throw new Error(`${n} length ${a.length} != ${size} (${width}x${height})`);
}

function clampInt16(v: number): number {
  return Math.max(-32768, Math.min(32767, v | 0));
}
function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}
const isWater = (i: number) => landMask[i] !== 1;
const isActive = (i: number) =>
  (boundaryType[i] === BOUNDARY_CONVERGENT || boundaryType[i] === BOUNDARY_TRANSFORM) &&
  (boundaryCloseness[i] | 0) >= activeThresholdU8;

// ---------- stats helpers ----------
function summary(values: number[]): { n: number; mean: number; median: number; p90: number } {
  if (!values.length) return { n: 0, mean: 0, median: 0, p90: 0 };
  const v = values.slice().sort((a, b) => a - b);
  const mean = v.reduce((a, b) => a + b, 0) / v.length;
  const at = (q: number) => v[Math.min(v.length - 1, Math.floor(q * (v.length - 1)))]!;
  return { n: v.length, mean: +mean.toFixed(3), median: at(0.5), p90: at(0.9) };
}
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  let sx = 0,
    sy = 0,
    sxx = 0,
    syy = 0,
    sxy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i]!;
    sy += ys[i]!;
    sxx += xs[i]! * xs[i]!;
    syy += ys[i]! * ys[i]!;
    sxy += xs[i]! * ys[i]!;
  }
  const cov = sxy - (sx * sy) / n;
  const vx = sxx - (sx * sx) / n;
  const vy = syy - (sy * sy) / n;
  if (vx <= 0 || vy <= 0) return 0;
  return +(cov / Math.sqrt(vx * vy)).toFixed(3);
}
// Quantile estimator — MUST stay bit-identical to compute-shelf-mask's computeQuantileCutoff /
// computeQuantileCutoffFromArray (pinned by shelf-cutoff-quantile-equivalence.test.ts).
function quantileCutoff(samples: number[]): number {
  if (!samples.length) return 0;
  const v = samples.slice().sort((a, b) => a - b);
  return Math.min(0, v[Math.floor(shallowQuantile * (v.length - 1))] ?? 0);
}

// ---------- land components (odd-Q) + nearest-land Voronoi over water ----------
const landId = new Int32Array(size).fill(-1);
const landSizes: number[] = [];
{
  const stack: number[] = [];
  for (let i = 0; i < size; i++) {
    if (landMask[i] !== 1 || landId[i] !== -1) continue;
    const id = landSizes.length;
    let count = 0;
    stack.length = 0;
    stack.push(i);
    landId[i] = id;
    while (stack.length) {
      const idx = stack.pop()!;
      count++;
      const y = (idx / width) | 0;
      const x = idx - y * width;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (landMask[ni] === 1 && landId[ni] === -1) {
          landId[ni] = id;
          stack.push(ni);
        }
      });
    }
    landSizes.push(count);
  }
}
const isContinent = (id: number) => id >= 0 && landSizes[id]! >= CONTINENT_MIN;

// nearest-land-component label over water (multi-source BFS from all land tiles)
const nearestLand = new Int32Array(size).fill(-1);
{
  const dist = new Uint16Array(size).fill(65535);
  const queue = new Int32Array(size);
  let head = 0,
    tail = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) {
      dist[i] = 0;
      nearestLand[i] = landId[i];
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const idx = queue[head++]!;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    const nd = dist[idx] + 1;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (dist[ni] > nd) {
        dist[ni] = nd;
        nearestLand[ni] = nearestLand[idx];
        queue[tail++] = ni;
      }
    });
  }
}

// ---------- shared shelf primitives ----------
function floodFromGate(gate: Uint8Array): Uint8Array {
  const shelf = new Uint8Array(size);
  const queue = new Int32Array(size);
  let head = 0,
    tail = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (landMask[i] === 1 || gate[i] !== 1) continue;
      let adj = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        if (adj) return;
        if (landMask[ny * width + nx] === 1) adj = true;
      });
      if (!adj) continue;
      shelf[i] = 1;
      queue[tail++] = i;
    }
  }
  while (head < tail) {
    const idx = queue[head++]!;
    const y = (idx / width) | 0;
    const x = idx - y * width;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (landMask[ni] === 1 || shelf[ni] === 1 || gate[ni] !== 1) return;
      shelf[ni] = 1;
      queue[tail++] = ni;
    });
  }
  return shelf;
}
// breakDepth gate per tile from a per-tile cutoff field + effective scale.
function gateFromCutoffField(cutoffOf: (i: number) => number, effScale: number): Uint8Array {
  const gate = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) continue;
    const marginFactor = isActive(i) ? activeBreakDepthFactor : passiveBreakDepthFactor;
    const raw = cutoffOf(i) * effScale * marginFactor;
    const breakDepth = clampInt16(Math.max(absoluteMaxShelfDepth, Math.min(0, Math.round(raw))));
    if ((bathy[i] ?? 0) >= breakDepth) gate[i] = 1;
  }
  return gate;
}
const countOf = (m: Uint8Array): number => {
  let c = 0;
  for (let i = 0; i < size; i++) if (m[i]) c++;
  return c;
};

// ---------- layer (a): per-component nearshore samples -> blended cutoff field ----------
// (independent re-derivation of compute-shelf-mask's buildLocalCutoffField, over the live nearestLand)
const compNearshoreSamples = new Map<number, number[]>();
for (let i = 0; i < size; i++) {
  if (!isWater(i)) continue;
  const d = distLive[i] | 0;
  if (d <= 0 || d > sampleRadius) continue;
  const id = nearestLand[i];
  if (id < 0) continue;
  let arr = compNearshoreSamples.get(id);
  if (!arr) {
    arr = [];
    compNearshoreSamples.set(id, arr);
  }
  arr.push(Math.min(0, bathy[i] ?? 0));
}
function buildEffCutoffById(
  globalAnchor: number,
  floor: number = localCutoffMinSamples
): Map<number, number> {
  const m = new Map<number, number>();
  for (const [id, samples] of compNearshoreSamples) {
    const rawQ = quantileCutoff(samples);
    const w = clamp01(samples.length / floor);
    m.set(id, Math.min(0, w * rawQ + (1 - w) * globalAnchor));
  }
  return m;
}
function fieldFromEff(eff: Map<number, number>, globalAnchor: number): (i: number) => number {
  return (i: number) => {
    const id = nearestLand[i];
    const c = id >= 0 ? eff.get(id) : undefined;
    return c ?? globalAnchor;
  };
}

// ---------- global cutoff (recomputed) + effScale solve + FIELD self-validation ----------
const nearshore: number[] = [];
for (let i = 0; i < size; i++) {
  if (!isWater(i)) continue;
  const d = distLive[i] | 0;
  if (d <= 0 || d > sampleRadius) continue;
  nearshore.push(Math.min(0, bathy[i] ?? 0));
}
const recomputedCutoff = quantileCutoff(nearshore);

// Reconstruct (globalAnchor, effScale) the live op used by minimizing the break-depth diff against the
// live breakdepth bin. The cutoff FIELD matches the live op (local if localizeCutoff else global); the
// shelfWidth knob folds into effScale, solved by a brute-force sweep; the recomputed quantile can sit
// +/- a step from the op's anchor. self-validating: a diff of 0 proves the field reconstruction is
// byte-faithful, and downstream counterfactuals reuse the same (anchor, scale).
function liveFieldFor(globalAnchor: number): (i: number) => number {
  return localizeCutoff
    ? fieldFromEff(buildEffCutoffById(globalAnchor), globalAnchor)
    : (_i: number) => globalAnchor;
}
function breakDiffForField(cutoffOf: (i: number) => number, effScale: number): number {
  let diff = 0;
  for (let i = 0; i < size; i++) {
    if (landMask[i] === 1) continue;
    const marginFactor = isActive(i) ? activeBreakDepthFactor : passiveBreakDepthFactor;
    const raw = cutoffOf(i) * effScale * marginFactor;
    const bd = clampInt16(Math.max(absoluteMaxShelfDepth, Math.min(0, Math.round(raw))));
    if ((bd | 0) !== (liveBreak[i] | 0)) diff++;
  }
  return diff;
}
let globalCutoff = recomputedCutoff;
let effScale = shelfCfg.breakDepthScale ?? 1;
let breakDiff = Number.POSITIVE_INFINITY;
// Prefer the faithful recomputed anchor (offset 0); only fall back to +/-offsets if no effScale
// reproduces the live breakdepth at offset 0 (rounding can make pairs degenerate).
for (const co of [0, -1, 1, -2, 2, -3, 3]) {
  const anchor = Math.min(0, recomputedCutoff + co);
  const field = liveFieldFor(anchor);
  for (let s = 50; s <= 200; s++) {
    const sc = s / 100;
    const d = breakDiffForField(field, sc);
    if (d < breakDiff) {
      breakDiff = d;
      globalCutoff = anchor;
      effScale = sc;
    }
    if (breakDiff === 0) break;
  }
  if (breakDiff === 0) break;
}
const cutoffOffsetFromRecompute = globalCutoff - recomputedCutoff;

// validation B: offline flood from live gate == live shelf bin
const floodLive = floodFromGate(liveGate);
let floodDiff = 0;
for (let i = 0; i < size; i++) if ((floodLive[i] ? 1 : 0) !== (liveShelf[i] ? 1 : 0)) floodDiff++;

// validation C: my activeMargin classification == live activemarginmask bin (water only;
// the live op never labels land, so restrict the comparison to the water domain it owns).
let activeDiff = 0;
for (let i = 0; i < size; i++)
  if (isWater(i) && (isActive(i) ? 1 : 0) !== (liveActive[i] ? 1 : 0)) activeDiff++;

// ================= M1 — width by margin =================
const shelfActiveDist: number[] = [];
const shelfPassiveDist: number[] = [];
const shelfActiveBreak: number[] = [];
const shelfPassiveBreak: number[] = [];
for (let i = 0; i < size; i++) {
  if (!liveShelf[i]) continue;
  const d = distLive[i] | 0;
  if (liveActive[i]) {
    shelfActiveDist.push(d);
    shelfActiveBreak.push(liveBreak[i]!);
  } else {
    shelfPassiveDist.push(d);
    shelfPassiveBreak.push(liveBreak[i]!);
  }
}
// per-land-component apron: shelf tiles attributed to each land component (Voronoi)
type Comp = {
  id: number;
  landSize: number;
  continent: boolean;
  shelf: number;
  activeFrac: number;
  meanWidth: number;
  p90Width: number;
};
const compShelf = new Map<number, { dists: number[]; active: number }>();
for (let i = 0; i < size; i++) {
  if (!liveShelf[i]) continue;
  const id = nearestLand[i];
  if (id < 0) continue;
  const e = compShelf.get(id) ?? { dists: [], active: 0 };
  e.dists.push(distLive[i] | 0);
  if (liveActive[i]) e.active++;
  compShelf.set(id, e);
}
const comps: Comp[] = [];
for (const [id, e] of compShelf) {
  const s = summary(e.dists);
  comps.push({
    id,
    landSize: landSizes[id]!,
    continent: isContinent(id),
    shelf: e.dists.length,
    activeFrac: +(e.active / e.dists.length).toFixed(3),
    meanWidth: s.mean,
    p90Width: s.p90,
  });
}
comps.sort((a, b) => b.shelf - a.shelf);
// correlation across components (weighted by shelf tiles via repetition is overkill; use per-comp)
const compActiveFrac = comps.filter((c) => c.shelf >= 20).map((c) => c.activeFrac);
const compMeanWidth = comps.filter((c) => c.shelf >= 20).map((c) => c.meanWidth);

// CONTINENT-RESTRICTED width by margin: the per-tile active.mean above is artifact-prone —
// the active sample is tiny (n often <100) and on island-heavy seeds is dominated by single-tile
// island "dots" whose ring distance is structurally inflated. Restricting to shelf tiles
// attributed to a CONTINENT (landSize >= CONTINENT_MIN) is the honest margin-contrast metric.
const contActiveDist: number[] = [];
const contPassiveDist: number[] = [];
for (let i = 0; i < size; i++) {
  if (!liveShelf[i] || !isContinent(nearestLand[i])) continue;
  (liveActive[i] ? contActiveDist : contPassiveDist).push(distLive[i] | 0);
}
const caD = summary(contActiveDist);
const cpD = summary(contPassiveDist);

const aD = summary(shelfActiveDist);
const pD = summary(shelfPassiveDist);
const m1 = {
  designedLever: {
    breakDepthRatioPassiveOverActive: +(passiveBreakDepthFactor / activeBreakDepthFactor).toFixed(
      2
    ),
    note: "passive break is this many x deeper than active by config; realized width ratio below should track it if bathymetry translated the lever",
  },
  shelfWidthByMargin: {
    active: aD,
    passive: pD,
    widthRatioPassiveOverActive: aD.mean ? +(pD.mean / aD.mean).toFixed(2) : 0,
    note: "per-tile mean over ALL shelf tiles; active sample is small + island-dot-biased. Prefer continentRestricted below.",
  },
  continentRestricted: {
    active: caD,
    passive: cpD,
    widthRatioMeanPassiveOverActive: caD.mean ? +(cpD.mean / caD.mean).toFixed(2) : 0,
    widthRatioMedianPassiveOverActive: caD.median ? +(cpD.median / caD.median).toFixed(2) : 0,
    note: "honest margin contrast: shelf tiles on continents only (landSize >= 100), removes the single-tile-island inflation",
  },
  breakDepthByMargin: {
    activeMean: summary(shelfActiveBreak).mean,
    passiveMean: summary(shelfPassiveBreak).mean,
  },
  perComponent: {
    nComponents: comps.length,
    continents: comps.filter((c) => c.continent).length,
    islands: comps.filter((c) => !c.continent).length,
    activeFracVsMeanWidthPearson: pearson(compActiveFrac, compMeanWidth),
    top: comps.slice(0, 8).map((c) => ({
      landSize: c.landSize,
      kind: c.continent ? "continent" : "island",
      shelf: c.shelf,
      activeFrac: c.activeFrac,
      meanWidth: c.meanWidth,
      p90Width: c.p90Width,
    })),
  },
};

// ================= M2 — bathymetry <-> margin =================
const nsActive: number[] = [];
const nsPassive: number[] = [];
const corrCloseness: number[] = [];
const corrBathy: number[] = [];
const profByMargin: Record<string, { active: number[]; passive: number[] }> = {};
for (let i = 0; i < size; i++) {
  if (!isWater(i)) continue;
  const d = distLive[i] | 0;
  if (d <= 0 || d > sampleRadius) continue;
  const b = Math.min(0, bathy[i] ?? 0);
  if (liveActive[i]) nsActive.push(b);
  else nsPassive.push(b);
  const k = String(d);
  (profByMargin[k] ??= { active: [], passive: [] })[liveActive[i] ? "active" : "passive"].push(b);
  // correlation over convergent/transform tiles: does closeness predict depth?
  if (boundaryType[i] === BOUNDARY_CONVERGENT || boundaryType[i] === BOUNDARY_TRANSFORM) {
    corrCloseness.push(boundaryCloseness[i] | 0);
    corrBathy.push(b);
  }
}
const nsA = summary(nsActive);
const nsP = summary(nsPassive);
const m2 = {
  nearshoreBathymetryByMargin: {
    active: nsA,
    passive: nsP,
    meanDeltaActiveMinusPassive: +(nsA.mean - nsP.mean).toFixed(3),
    note: "≈0 => seafloor carries no margin signal => localizing the cutoff alone (a) cannot create contrast; margin-aware seafloor depth (b) is required",
  },
  closenessVsDepthPearson_onActiveBoundaries: pearson(corrCloseness, corrBathy),
  profileByDistanceAndMargin: Object.fromEntries(
    Array.from({ length: sampleRadius }, (_, k) => String(k + 1)).map((k) => [
      k,
      {
        active: summary(profByMargin[k]?.active ?? []),
        passive: summary(profByMargin[k]?.passive ?? []),
      },
    ])
  ),
};

// ================= M3 — cutoff locality (A2/A3 dual-arm counterfactual) =================
// (i) spatial windows
const windowCutoffs: number[] = [];
{
  const wx = Math.ceil(width / WINDOW);
  const wy = Math.ceil(height / WINDOW);
  const buckets: number[][] = Array.from({ length: wx * wy }, () => []);
  for (let i = 0; i < size; i++) {
    if (!isWater(i)) continue;
    const d = distLive[i] | 0;
    if (d <= 0 || d > sampleRadius) continue;
    const y = (i / width) | 0;
    const x = i - y * width;
    buckets[((y / WINDOW) | 0) * wx + ((x / WINDOW) | 0)]!.push(Math.min(0, bathy[i] ?? 0));
  }
  for (const b of buckets) if (b.length >= 8) windowCutoffs.push(quantileCutoff(b));
}
// (ii) per-land-component cutoff: RAW quantile + BLENDED (the cutoff the live op actually gates on),
//      plus attributed sample counts (A5 clearance: every continent must clear the floor).
const effById = buildEffCutoffById(globalCutoff);
const compCutoffs: {
  id: number;
  continent: boolean;
  landSize: number;
  samples: number;
  rawCutoff: number;
  blendedCutoff: number;
  weight: number;
}[] = [];
for (const [id, samples] of compNearshoreSamples) {
  compCutoffs.push({
    id,
    continent: isContinent(id),
    landSize: landSizes[id]!,
    samples: samples.length,
    rawCutoff: quantileCutoff(samples),
    blendedCutoff: effById.get(id)!,
    weight: +clamp01(samples.length / localCutoffMinSamples).toFixed(3),
  });
}
compCutoffs.sort((a, b) => b.samples - a.samples);
const continentCutoffs = compCutoffs.filter((c) => c.continent).map((c) => c.rawCutoff);
const islandCutoffs = compCutoffs.filter((c) => !c.continent).map((c) => c.rawCutoff);
const continentSampleCounts = compCutoffs.filter((c) => c.continent).map((c) => c.samples);
const continentsBelowFloor = compCutoffs.filter(
  (c) => c.continent && c.samples < localCutoffMinSamples
).length;

// (iii) A2/A3 dual-arm counterfactual: GLOBAL field vs LOCAL (Voronoi+blend) field, same effScale.
const globalField = (_i: number) => globalCutoff;
const localField = fieldFromEff(effById, globalCutoff);
const globalShelf = floodFromGate(gateFromCutoffField(globalField, effScale));
const localShelf = floodFromGate(gateFromCutoffField(localField, effScale));
const continentalShelf = (m: Uint8Array): number => {
  let c = 0;
  for (let i = 0; i < size; i++) if (m[i] && isContinent(nearestLand[i])) c++;
  return c;
};
const islandShelf = (m: Uint8Array): number => {
  let c = 0;
  for (let i = 0; i < size; i++)
    if (m[i] && nearestLand[i] >= 0 && !isContinent(nearestLand[i])) c++;
  return c;
};
const pct = (a: number, b: number): number => (b ? +(((a - b) / b) * 100).toFixed(1) : 0);
const gTot = countOf(globalShelf);
const lTot = countOf(localShelf);
const gCont = continentalShelf(globalShelf);
const lCont = continentalShelf(localShelf);
const gIsl = islandShelf(globalShelf);
const lIsl = islandShelf(localShelf);
// width-by-margin under the local field
const cfActiveDist: number[] = [];
const cfPassiveDist: number[] = [];
for (let i = 0; i < size; i++) {
  if (!localShelf[i]) continue;
  if (liveActive[i]) cfActiveDist.push(distLive[i] | 0);
  else cfPassiveDist.push(distLive[i] | 0);
}
const cfA = summary(cfActiveDist);
const cfP = summary(cfPassiveDist);

const m3 = {
  globalCutoff,
  recomputedQuantileCutoff: recomputedCutoff,
  cutoffOffsetFromRecompute, // 0 == recomputed quantile is the op's exact anchor
  effectiveBreakDepthScale: effScale,
  localizeCutoff,
  localCutoffMinSamples,
  spatialWindows: {
    edgeTiles: WINDOW,
    nWindows: windowCutoffs.length,
    ...summary(windowCutoffs),
    min: windowCutoffs.length ? Math.min(...windowCutoffs) : 0,
    max: windowCutoffs.length ? Math.max(...windowCutoffs) : 0,
    windowsDifferingFromGlobalBy1Plus: windowCutoffs.filter((c) => Math.abs(c - globalCutoff) >= 1)
      .length,
  },
  perComponentCutoff: {
    nComponents: compCutoffs.length,
    continentCutoff: summary(continentCutoffs),
    islandCutoff: summary(islandCutoffs),
    continentSampleCounts: summary(continentSampleCounts),
    continentsBelowFloor, // A5: must be 0 for full-weight localization on every continent
    note: "rawCutoff = per-component quantile; blendedCutoff = what the live op gates on; if continentsBelowFloor>0 some continent is partially blended to global",
    top: compCutoffs.slice(0, 8).map((c) => ({
      kind: c.continent ? "continent" : "island",
      landSize: c.landSize,
      samples: c.samples,
      weight: c.weight,
      rawCutoff: c.rawCutoff,
      blendedCutoff: c.blendedCutoff,
    })),
  },
  counterfactualLocalVsGlobal: {
    shelfTiles: { global: gTot, local: lTot, totalDeltaPct: pct(lTot, gTot) },
    continentalShelfTiles: { global: gCont, local: lCont, deltaPct: pct(lCont, gCont) },
    islandShelfTiles: { global: gIsl, local: lIsl, deltaPct: pct(lIsl, gIsl) },
    note: "A2 = continentalShelfTiles.deltaPct (DOWN, [-5%,-27%]); A3 = shelfTiles.totalDeltaPct (HOLD, [-5%,+10%]); redistribution = islandShelfTiles.deltaPct (UP)",
    widthByMargin_local: {
      active: cfA,
      passive: cfP,
      widthRatioPassiveOverActive: cfA.mean ? +(cfP.mean / cfA.mean).toFixed(2) : 0,
    },
  },
};

// ================= M4 — A4-DECOUPLE: island-density sensitivity of continental shelf =================
// PRIMARY (exclusion counterfactual — EXACT, no geometry recompute, no attribution drift): would
// continental shelf change if island nearshore samples did NOT contribute to the cutoff? Under the
// GLOBAL gate, island samples drag the single cutoff => continental shelf moves (the Thread-1
// island->continent coupling). Under the LOCAL gate, every full-weight continent reads ONLY its own
// pool, so excluding island samples changes nothing (delta ~0). This is the clean causal test for
// "does island density set continental shelf width"; it reuses the same effScale + flood as the live
// self-validation, so it is not a fragile perturbation.
const nearshoreContinentOnly: number[] = [];
for (let i = 0; i < size; i++) {
  if (!isWater(i)) continue;
  const d = distLive[i] | 0;
  if (d <= 0 || d > sampleRadius) continue;
  if (!isContinent(nearestLand[i])) continue;
  nearshoreContinentOnly.push(Math.min(0, bathy[i] ?? 0));
}
const gCutContinentsOnly = quantileCutoff(nearshoreContinentOnly);
const contShelfUnder = (cutoffOf: (i: number) => number): number =>
  continentalShelf(floodFromGate(gateFromCutoffField(cutoffOf, effScale)));
const exclGlobalAll = contShelfUnder(() => globalCutoff);
const exclGlobalContOnly = contShelfUnder(() => gCutContinentsOnly);
const exclLocalAll = contShelfUnder(fieldFromEff(buildEffCutoffById(globalCutoff), globalCutoff));
const exclLocalContOnly = contShelfUnder(
  fieldFromEff(buildEffCutoffById(gCutContinentsOnly), gCutContinentsOnly)
);
const exclusion = {
  globalCutoff,
  globalCutoffContinentsOnly: gCutContinentsOnly,
  global: {
    withIslandSamples: exclGlobalAll,
    withoutIslandSamples: exclGlobalContOnly,
    deltaPct: pct(exclGlobalAll, exclGlobalContOnly),
  },
  local: {
    withIslandSamples: exclLocalAll,
    withoutIslandSamples: exclLocalContOnly,
    deltaPct: pct(exclLocalAll, exclLocalContOnly),
  },
  note: "A4: |local.deltaPct| ~0 (continental cutoffs ignore island samples) while global.deltaPct shows the island->continent coupling. local can be nonzero only if a continent is below the sample floor (then its blend reads the island-influenced global anchor) — cross-check perComponentCutoff.continentsBelowFloor.",
};

// SECONDARY — continent cutoff pool-robustness (addresses the judge's Voronoi pool-membership concern
// WITHOUT the injected-island new-shelf artifact). If a near-coast island stole part of a continent's
// attributed nearshore pool, would the continent's quantile (and thus its gate depth) move? Drop a
// deterministic 25% of each continent's samples and report the cutoff shift; a large pool (samples >>
// floor) must keep the quantile stable, so pool-membership reassignment cannot move continental shelf.
const poolRobustness: {
  landSize: number;
  samples: number;
  fullCutoff: number;
  droppedCutoff: number;
  shift: number;
}[] = [];
for (const [id, samples] of compNearshoreSamples) {
  if (!isContinent(id)) continue;
  const full = quantileCutoff(samples);
  const kept = samples.filter((_, k) => k % 4 !== 0); // drop every 4th sample (~25%)
  const dropped = quantileCutoff(kept);
  poolRobustness.push({
    landSize: landSizes[id]!,
    samples: samples.length,
    fullCutoff: full,
    droppedCutoff: dropped,
    shift: dropped - full,
  });
}
const maxContinentCutoffShift = poolRobustness.reduce((m, r) => Math.max(m, Math.abs(r.shift)), 0);
const m4 = {
  primaryExclusionCounterfactual: exclusion,
  secondaryPoolRobustness: {
    maxContinentCutoffShift,
    perContinent: poolRobustness,
    note: "drop 25% of each continent's attributed nearshore pool; maxContinentCutoffShift ~0-1 unit => a continent's gate is robust to losing near-coast samples to an injected island (its pool >> the sample floor), so Voronoi pool-membership reassignment cannot meaningfully move continental shelf.",
  },
};

// ================= M5 — floor sweep (offline, EXACT) =================
// The sample-count floor only affects ISLAND shelf (continents are always full-weight), so it is a
// pure A3 knob: a higher floor blends more small islands toward the (shallower) global cutoff =>
// less island shelf => lower total. The local field is geometry-determined (nearestLand + samples
// are floor-independent; only the blend weight changes) and effScale is the floor-independent knob,
// so recomputing the counterfactual at floor X here is EXACTLY what regenerating the live op at
// floor X would produce. Continental% is ~floor-invariant; totalPct is the A3-relevant series.
const m5: { floor: number; continentalPct: number; totalPct: number; islandPct: number }[] = [];
for (const fl of [16, 24, 32, 40, 48, 64]) {
  const lf = fieldFromEff(buildEffCutoffById(globalCutoff, fl), globalCutoff);
  const sh = floodFromGate(gateFromCutoffField(lf, effScale));
  m5.push({
    floor: fl,
    continentalPct: pct(continentalShelf(sh), gCont),
    totalPct: pct(countOf(sh), gTot),
    islandPct: pct(islandShelf(sh), gIsl),
  });
}

const out = {
  meta: {
    dumpDir,
    configFile,
    dims: { width, height, size },
    shelfConfig: {
      sampleRadius,
      shallowQuantile,
      activeClosenessThreshold,
      activeBreakDepthFactor,
      passiveBreakDepthFactor,
      absoluteMaxShelfDepth,
      rawBreakDepthScale: shelfCfg.breakDepthScale ?? 1,
      solvedEffectiveScale: effScale,
      localizeCutoff,
      localCutoffMinSamples,
    },
  },
  validation: {
    breakDepthDiffVsLive: breakDiff, // 0 == per-component field reconstruction faithful (+ effScale correct)
    floodDiffVsLive: floodDiff, // 0 == flood replica faithful
    activeMarginDiffVsLive: activeDiff, // 0 == margin classification faithful
  },
  M1_widthByMargin: m1,
  M2_bathyVsMargin: m2,
  M3_cutoffLocality: m3,
  M4_injectionStability: m4,
  M5_floorSweep: m5,
};

console.log(JSON.stringify(out, null, asJson ? 0 : 2));
