#!/usr/bin/env bun
// Quantify continental-shelf "spottiness" + attribution from a diag:dump dir.
// Usage: bun scripts/diag/analyze-shelf-spottiness.ts <dumpDir> [--json]
//
// Reads the dumped waterClass (0=land,1=coast,2=ocean) + shelfMask u8 grids,
// builds land + shelf connected components with the SAME odd-Q hex adjacency the
// pipeline uses, then classifies each shelf component as:
//   continental  - borders a "continent" land component (>= CONTINENT_MIN tiles)
//   island       - borders only "island" land components (< CONTINENT_MIN tiles)
//   bank         - borders no land at all (isolated open-ocean shallow patch)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { forEachHexNeighborOddQ } from "@swooper/mapgen-core/lib/grid";

const CONTINENT_MIN = 100; // land-component tile count at/above which it is a "continent"

const dumpDir = process.argv[2];
const asJson = process.argv.includes("--json");
if (!dumpDir) {
  console.error("usage: analyze-shelf-spottiness <dumpDir> [--json]");
  process.exit(1);
}

const dataDir = join(dumpDir, "data");
const files = readdirSync(dataDir);
const pick = (sub: string): Uint8Array => {
  const f = files.find((x) => x.includes(sub) && x.endsWith(".bin"));
  if (!f) throw new Error(`no bin matching ${sub}`);
  return new Uint8Array(readFileSync(join(dataDir, f)));
};
const pickOpt = (sub: string): Uint8Array | null => {
  const f = files.find((x) => x.includes(sub) && x.endsWith(".bin"));
  return f ? new Uint8Array(readFileSync(join(dataDir, f))) : null;
};
const wc = pick("map-morphology-coasts-waterclass");
// R3 stores shelfMask in the morphology-shelf stage; pre-R3 stored it in coastlineMetrics.
const sm = pickOpt("morphology-shelf-shelfmask") ?? pick("morphology-coastlinemetrics-shelfmask");

// infer width/height from the manifest dims
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
if (sm.length !== size || wc.length !== size) {
  throw new Error(
    `grid size mismatch: dims ${width}x${height}=${size} vs wc ${wc.length} sm ${sm.length}`
  );
}

function components(member: (i: number) => boolean): number[][] {
  const seen = new Uint8Array(size);
  const comps: number[][] = [];
  const stack: number[] = [];
  for (let i = 0; i < size; i++) {
    if (seen[i] || !member(i)) continue;
    const comp: number[] = [];
    stack.length = 0;
    stack.push(i);
    seen[i] = 1;
    while (stack.length) {
      const idx = stack.pop() as number;
      comp.push(idx);
      const y = (idx / width) | 0;
      const x = idx - y * width;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const ni = ny * width + nx;
        if (!seen[ni] && member(ni)) {
          seen[ni] = 1;
          stack.push(ni);
        }
      });
    }
    comps.push(comp);
  }
  return comps;
}

const isLand = (i: number) => wc[i] === 0;
const isShelf = (i: number) => sm[i] === 1;

const landComps = components(isLand);
const shelfComps = components(isShelf);

// land-component id per tile + size lookup
const landId = new Int32Array(size).fill(-1);
landComps.forEach((c, id) => c.forEach((i) => (landId[i] = id)));
const landSize = landComps.map((c) => c.length);
const continents = landSize.filter((s) => s >= CONTINENT_MIN).length;
const islands = landSize.filter((s) => s < CONTINENT_MIN).length;

// classify each shelf component by the land it borders
let shelfTiles = 0;
const classTiles = { continental: 0, island: 0, bank: 0 };
const classComps = { continental: 0, island: 0, bank: 0 };
const compSizes: number[] = [];
for (const comp of shelfComps) {
  shelfTiles += comp.length;
  compSizes.push(comp.length);
  let bordersContinent = false;
  let bordersIsland = false;
  for (const idx of comp) {
    const y = (idx / width) | 0;
    const x = idx - y * width;
    forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
      const ni = ny * width + nx;
      if (isLand(ni)) {
        if (landSize[landId[ni]] >= CONTINENT_MIN) bordersContinent = true;
        else bordersIsland = true;
      }
    });
  }
  const cls = bordersContinent ? "continental" : bordersIsland ? "island" : "bank";
  classComps[cls] += 1;
  classTiles[cls] += comp.length;
}

compSizes.sort((a, b) => b - a);
const bucket = (lo: number, hi: number) => compSizes.filter((s) => s >= lo && s <= hi).length;
const land = landComps.reduce((a, c) => a + c.length, 0);
const coast = wc.reduce((a, b) => a + (b === 1 ? 1 : 0), 0);
const ocean = wc.reduce((a, b) => a + (b === 2 ? 1 : 0), 0);
const water = coast + ocean;

const out = {
  dims: { width, height, size },
  landShare: +(land / size).toFixed(4),
  coastShareOfWater: +(coast / water).toFixed(4),
  counts: { land, coast, ocean, shelfTiles },
  landComponents: {
    total: landComps.length,
    continents,
    islands,
    largest: landSize.slice().sort((a, b) => b - a)[0] ?? 0,
  },
  shelfComponents: {
    total: shelfComps.length,
    largest: compSizes[0] ?? 0,
    sizeBuckets: {
      "1 (singleton)": bucket(1, 1),
      "2-5": bucket(2, 5),
      "6-20": bucket(6, 20),
      "21-50": bucket(21, 50),
      "51+": bucket(51, 1e9),
    },
    top5: compSizes.slice(0, 5),
  },
  shelfAttribution: {
    byTiles: {
      continental: classTiles.continental,
      island: classTiles.island,
      bank: classTiles.bank,
      islandPlusBankPct: +(((classTiles.island + classTiles.bank) / shelfTiles) * 100).toFixed(1),
    },
    byComponents: classComps,
  },
  // spottiness: how fragmented is the shelf relative to the number of landmasses?
  fragmentation: {
    shelfCompsPerLandComp: +(shelfComps.length / Math.max(1, landComps.length)).toFixed(2),
    tinyShelfCompShare: +((bucket(1, 5) / Math.max(1, shelfComps.length)) * 100).toFixed(1),
  },
};

if (asJson) {
  console.log(JSON.stringify(out));
} else {
  console.log(JSON.stringify(out, null, 2));
}
