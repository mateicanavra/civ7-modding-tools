#!/usr/bin/env bun
//
// census-deep-ocean-matrix — build-free headless terrain census across REAL Civ7 map
// sizes, seeds, and map-config classes. Reusable characterization tool for the abyssal
// crust-relief mechanism (foundation/compute-crust-evolution).
//
// PURPOSE: characterize how a checked-in canonical map config behaves at the sizes the
// game actually ships (NOT 80x50, which is not a Civ size). It reports the emergent
// deepShareOfWater = OCEAN / (OCEAN + COAST) without mutating the admitted config.
//
//   cd mods/mod-swooper-maps && bun scripts/diag/census-deep-ocean-matrix.ts
//
// Env (all optional):
//   CENSUS_CONFIG="swooper-earthlike"        map config id (file basename, no .config.json)
//   CENSUS_SIZES="STANDARD,HUGE"             TINY|SMALL|STANDARD|LARGE|HUGE or "all"
//   CENSUS_SEEDS="1337,7,42"                 integer seeds
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  createFinalSurfaceParityMapInfo,
  runLocalFinalSurfaceSnapshot,
} from "../../src/dev/diagnostics/live-parity.js";
import { admitStandardMapConfig } from "../../src/maps/configs/canonical.js";

// Real Civ7 standard map sizes (packages/civ7-adapter/src/map-metadata.ts).
const SIZES: Record<string, { width: number; height: number }> = {
  TINY: { width: 60, height: 38 },
  SMALL: { width: 74, height: 46 },
  STANDARD: { width: 84, height: 54 },
  LARGE: { width: 96, height: 60 },
  HUGE: { width: 106, height: 66 },
};

function parseList(raw: string | undefined, fallback: string[]): string[] {
  if (!raw) return fallback;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function terrainHistogram(values: ReadonlyArray<number | null>, idx: (n: string) => number) {
  const OCEAN = idx("TERRAIN_OCEAN");
  const COAST = idx("TERRAIN_COAST");
  const c = { ocean: 0, coast: 0, land: 0, nullTiles: 0 };
  for (const v of values) {
    if (v === null || v === undefined) c.nullTiles += 1;
    else if (v === OCEAN) c.ocean += 1;
    else if (v === COAST) c.coast += 1;
    else c.land += 1;
  }
  const total = values.length;
  const water = c.ocean + c.coast;
  const r = (n: number, d: number) => (d === 0 ? 0 : +((100 * n) / d).toFixed(1));
  return {
    deepShare: r(c.ocean, water),
    shelfShare: r(c.coast, water),
    waterPct: r(water, total),
    landPct: r(c.land, total),
  };
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1);
}

function main(): number {
  const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
  const configId = process.env.CENSUS_CONFIG ?? "swooper-earthlike";
  const cfgPath = resolve(
    repoRoot,
    `mods/mod-swooper-maps/src/maps/configs/${configId}.config.json`
  );
  const config = admitStandardMapConfig(JSON.parse(readFileSync(cfgPath, "utf8")));

  const sizeKeys = (() => {
    const raw = process.env.CENSUS_SIZES;
    if (!raw || raw === "all") return ["STANDARD", "HUGE"];
    return parseList(raw, ["STANDARD", "HUGE"]).map((s) => s.toUpperCase());
  })();
  const seeds = parseList(process.env.CENSUS_SEEDS, ["1337", "7", "42"]).map(Number);

  console.log(`# config=${configId} sizes=${sizeKeys.join(",")} seeds=${seeds.join(",")}`);

  type Row = { size: string; deep: number[]; shelf: number[]; land: number[] };
  const rows: Row[] = [];

  for (const sizeKey of sizeKeys) {
    const dims = SIZES[sizeKey];
    if (!dims) {
      console.error(`unknown size '${sizeKey}'`);
      continue;
    }
    const { width, height } = dims;
    const { mapInfo, mapSizeId } = createFinalSurfaceParityMapInfo(width, height);
    const row: Row = { size: sizeKey, deep: [], shelf: [], land: [] };
    for (const seed of seeds) {
      const snap = runLocalFinalSurfaceSnapshot({ width, height, seed, config });
      const adapter = createMockAdapter({
        width,
        height,
        mapInfo,
        mapSizeId,
        rng: createLabelRng(seed),
      });
      const idx = (n: string) => adapter.getTerrainTypeIndex(n);
      const hist = terrainHistogram(snap.surfaces.terrain.values, idx);
      row.deep.push(hist.deepShare);
      row.shelf.push(hist.shelfShare);
      row.land.push(hist.landPct);
      console.log(JSON.stringify({ size: sizeKey, seed, ...hist }));
    }
    rows.push(row);
  }

  // Compact summary: mean deepShare (min-max) per size.
  console.log("\n# SUMMARY  deepShare%% mean[min-max] | shelf mean | land mean");
  for (const row of rows) {
    const dMin = Math.min(...row.deep);
    const dMax = Math.max(...row.deep);
    console.log(
      `${row.size.padEnd(9)} ` +
        `deep ${String(mean(row.deep)).padStart(5)} [${dMin}-${dMax}]  ` +
        `shelf ${String(mean(row.shelf)).padStart(5)}  land ${String(mean(row.land)).padStart(5)}`
    );
  }
  return 0;
}

process.exitCode = main();
