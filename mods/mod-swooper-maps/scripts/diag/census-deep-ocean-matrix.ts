#!/usr/bin/env bun
//
// census-deep-ocean-matrix — build-free headless terrain census across REAL Civ7 map
// sizes, seeds, and map-config classes. Reusable characterization tool for the abyssal
// crust-relief mechanism (foundation/compute-crust-evolution).
//
// PURPOSE: characterize how the strategy responds to its exposed knobs — the abyssal
// magnitude `oceanicAbyssalDepth` (op config) and the `continentalAbundance` lever — at
// the sizes the game actually ships (NOT 80x50, which is not a Civ size). This is
// "tuning config to TEST the algo", not chasing an output number: it sweeps knobs and
// REPORTS the emergent deepShareOfWater = OCEAN / (OCEAN + COAST). Pick defaults by
// physical reasoning from the table, never by bending the table to a target.
//
//   cd mods/mod-swooper-maps && bun scripts/diag/census-deep-ocean-matrix.ts
//
// Env (all optional):
//   CENSUS_CONFIG="swooper-earthlike"        map config id (file basename, no .config.json)
//   CENSUS_SIZES="STANDARD,HUGE"             TINY|SMALL|STANDARD|LARGE|HUGE or "all"
//   CENSUS_SEEDS="1337,7,42"                 integer seeds
//   CENSUS_ABUNDANCE="base,0.5,0.65"         continentalAbundance lever; "base" = config value
//   CENSUS_RELIEF="base,0.5,1"               continentalRelief lever; "base" = config value
//
// NOTE: the crust op config (oceanicAbyssalDepth etc.) is NOT author-settable via the map
// config — it is internal, reached only through the levers above. To characterize the abyssal
// magnitude in isolation, edit the op default in compute-crust-evolution/config.ts and re-run.
//
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createMockAdapter } from "@civ7/adapter";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import {
  createFinalSurfaceParityMapInfo,
  runLocalFinalSurfaceSnapshot,
} from "../../src/dev/diagnostics/live-parity.js";

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

/** Build the deep-merge override for one (abundance, relief) scenario; undefined = no override. */
function buildOverride(abundance: string, relief: string): unknown {
  const knobs: Record<string, number> = {};
  if (abundance !== "base") knobs.continentalAbundance = Number(abundance);
  if (relief !== "base") knobs.continentalRelief = Number(relief);
  if (Object.keys(knobs).length === 0) return undefined;
  return { "foundation-orogeny": { knobs } };
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
  const file = JSON.parse(readFileSync(cfgPath, "utf8")) as { config?: unknown };
  const config = file.config ?? file;

  const sizeKeys = (() => {
    const raw = process.env.CENSUS_SIZES;
    if (!raw || raw === "all") return ["STANDARD", "HUGE"];
    return parseList(raw, ["STANDARD", "HUGE"]).map((s) => s.toUpperCase());
  })();
  const seeds = parseList(process.env.CENSUS_SEEDS, ["1337", "7", "42"]).map(Number);
  const abundanceList = parseList(process.env.CENSUS_ABUNDANCE, ["base"]);
  const reliefList = parseList(process.env.CENSUS_RELIEF, ["base"]);

  console.log(
    `# config=${configId} sizes=${sizeKeys.join(",")} seeds=${seeds.join(",")} ` +
      `abundance=${abundanceList.join(",")} relief=${reliefList.join(",")}`
  );

  type Row = { scenario: string; size: string; deep: number[]; shelf: number[]; land: number[] };
  const rows: Row[] = [];

  for (const abundance of abundanceList) {
    for (const relief of reliefList) {
      const override = buildOverride(abundance, relief);
      const scenario = `abund=${abundance} relief=${relief}`;
      for (const sizeKey of sizeKeys) {
        const dims = SIZES[sizeKey];
        if (!dims) {
          console.error(`unknown size '${sizeKey}'`);
          continue;
        }
        const { width, height } = dims;
        const { mapInfo } = createFinalSurfaceParityMapInfo(width, height);
        const row: Row = { scenario, size: sizeKey, deep: [], shelf: [], land: [] };
        for (const seed of seeds) {
          const snap = runLocalFinalSurfaceSnapshot({ width, height, seed, config, override });
          const adapter = createMockAdapter({
            width,
            height,
            mapInfo,
            mapSizeId: mapInfo.MapSizeType ?? 1,
            rng: createLabelRng(seed),
          });
          const idx = (n: string) => adapter.getTerrainTypeIndex(n);
          const hist = terrainHistogram(snap.surfaces.terrain.values, idx);
          row.deep.push(hist.deepShare);
          row.shelf.push(hist.shelfShare);
          row.land.push(hist.landPct);
          console.log(JSON.stringify({ scenario, size: sizeKey, seed, ...hist }));
        }
        rows.push(row);
      }
    }
  }

  // Compact summary: mean deepShare (min–max) per scenario × size.
  console.log("\n# SUMMARY  deepShare%% mean[min-max] | shelf mean | land mean");
  for (const row of rows) {
    const dMin = Math.min(...row.deep);
    const dMax = Math.max(...row.deep);
    console.log(
      `${row.scenario.padEnd(22)} ${row.size.padEnd(9)} ` +
        `deep ${String(mean(row.deep)).padStart(5)} [${dMin}-${dMax}]  ` +
        `shelf ${String(mean(row.shelf)).padStart(5)}  land ${String(mean(row.land)).padStart(5)}`
    );
  }
  return 0;
}

process.exitCode = main();
