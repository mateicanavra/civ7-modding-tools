#!/usr/bin/env bun
//
// census-deep-ocean — build-free headless terrain census for the crust-relief
// drowned-map bisect. Runs the FULL recipe in-process (runLocalFinalSurfaceSnapshot)
// for swooper-earthlike at HUGE dimensions and reports the hypsometry split,
// focusing on deepShareOfWater = OCEAN / (OCEAN + COAST).
//
// This file is intentionally untracked so it survives `git checkout <commit>`:
// run it at each candidate commit to localize where deep-ocean share collapses.
//
//   cd mods/mod-swooper-maps && bun scripts/live/census-deep-ocean.ts [seed ...]
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

// HUGE by default (106 x 66, matching the live readback); override via CENSUS_W/CENSUS_H.
const WIDTH = process.env.CENSUS_W ? Number(process.env.CENSUS_W) : 106;
const HEIGHT = process.env.CENSUS_H ? Number(process.env.CENSUS_H) : 66;

const SEEDS = (() => {
  const parsed = process.argv.slice(2).map(Number).filter((n) => Number.isInteger(n));
  return parsed.length > 0 ? parsed : [1337];
})();

function terrainHistogram(values: ReadonlyArray<number | null>, idx: (n: string) => number) {
  const OCEAN = idx("TERRAIN_OCEAN");
  const COAST = idx("TERRAIN_COAST");
  const FLAT = idx("TERRAIN_FLAT");
  const HILL = idx("TERRAIN_HILL");
  const MOUNTAIN = idx("TERRAIN_MOUNTAIN");
  const NAVR = idx("TERRAIN_NAVIGABLE_RIVER");
  const c = { ocean: 0, coast: 0, flat: 0, hill: 0, mountain: 0, navRiver: 0, other: 0, nullTiles: 0 };
  for (const v of values) {
    if (v === null || v === undefined) c.nullTiles += 1;
    else if (v === OCEAN) c.ocean += 1;
    else if (v === COAST) c.coast += 1;
    else if (v === FLAT) c.flat += 1;
    else if (v === HILL) c.hill += 1;
    else if (v === MOUNTAIN) c.mountain += 1;
    else if (v === NAVR) c.navRiver += 1;
    else c.other += 1;
  }
  const total = values.length;
  const water = c.ocean + c.coast;
  const land = c.flat + c.hill + c.mountain + c.navRiver + c.other;
  const r = (n: number, d: number) => (d === 0 ? 0 : +((100 * n) / d).toFixed(2));
  return {
    counts: c,
    total,
    waterPct: r(water, total),
    landPct: r(land, total),
    deepShareOfWater: r(c.ocean, water),
    shelfShareOfWater: r(c.coast, water),
    mountainShareOfLand: r(c.mountain, land),
  };
}

function main(): number {
  const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
  const cfgPath = resolve(
    repoRoot,
    "mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json"
  );
  const file = JSON.parse(readFileSync(cfgPath, "utf8")) as { config?: unknown };
  // Pass the INNER pipeline config directly (no dependency on canonical.js).
  const config = file.config ?? file;

  // Optional deep-merge override (CENSUS_OVERRIDE='{"foundation-orogeny":{"knobs":{...}}}').
  const overrideRaw = process.env.CENSUS_OVERRIDE;
  const override = overrideRaw ? JSON.parse(overrideRaw) : undefined;
  const label = process.env.CENSUS_LABEL ?? (override ? overrideRaw : "baseline");

  const { mapInfo } = createFinalSurfaceParityMapInfo(WIDTH, HEIGHT);

  for (const seed of SEEDS) {
    const snap = runLocalFinalSurfaceSnapshot({ width: WIDTH, height: HEIGHT, seed, config, override });
    const adapter = createMockAdapter({
      width: WIDTH,
      height: HEIGHT,
      mapInfo,
      mapSizeId: mapInfo.MapSizeType ?? 1,
      rng: createLabelRng(seed),
    });
    const idx = (n: string) => adapter.getTerrainTypeIndex(n);
    const hist = terrainHistogram(snap.surfaces.terrain.values, idx);
    console.log(JSON.stringify({ label, seed, width: WIDTH, height: HEIGHT, ...hist }));
  }
  return 0;
}

process.exitCode = main();
