#!/usr/bin/env bun
//
// census-reef-features — reef-family + deep-ocean census across seeds for ONE map config,
// using the same collectWorldBalanceStats harness the gate test uses. Answers "are cold
// reefs reliably 0 / bimodal / robust on this geography?" without trusting a single seed.
//
//   cd mods/mod-swooper-maps && bun scripts/diag/census-reef-features.ts [seed ...]
//
// Env: CENSUS_CONFIG (default swooper-earthlike), CENSUS_W/CENSUS_H (default 106x66).
//
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";
import { collectWorldBalanceStats } from "../../test/support/world-balance-stats.js";

const WIDTH = process.env.CENSUS_W ? Number(process.env.CENSUS_W) : 106;
const HEIGHT = process.env.CENSUS_H ? Number(process.env.CENSUS_H) : 66;
const CONFIG_ID = process.env.CENSUS_CONFIG ?? "swooper-earthlike";

const SEEDS = (() => {
  const parsed = process.argv
    .slice(2)
    .map(Number)
    .filter((n) => Number.isInteger(n));
  return parsed.length > 0 ? parsed : [1018, 1, 2, 3, 42, 99, 1234, 7777];
})();

function main(): number {
  const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
  const cfgPath = resolve(
    repoRoot,
    `mods/mod-swooper-maps/src/maps/configs/${CONFIG_ID}.config.json`
  );
  const raw = JSON.parse(readFileSync(cfgPath, "utf8"));
  const config = canonicalRecipeConfig(raw);

  console.log(`# config=${CONFIG_ID} ${WIDTH}x${HEIGHT} seeds=${SEEDS.join(",")}`);
  let coldZero = 0;
  for (const seed of SEEDS) {
    const stats = collectWorldBalanceStats({
      label: `${CONFIG_ID}:${seed}`,
      config,
      seed,
      width: WIDTH,
      height: HEIGHT,
    });
    const cold = stats.featureCounts.FEATURE_COLD_REEF ?? 0;
    const atoll = stats.featureCounts.FEATURE_ATOLL ?? 0;
    const reef = stats.featureCounts.FEATURE_REEF ?? 0;
    if (cold === 0) coldZero += 1;
    const varietyFloor = Math.min(stats.resourceDemandTypeCount, stats.resourcePlannedCount);
    console.log(
      JSON.stringify({
        seed,
        deepShare: +(100 * stats.deepOceanShareOfWater).toFixed(1),
        coldReef: cold,
        atoll,
        warmReef: reef,
        coldReefShareOfCoastWater: +stats.coldReefShareOfCoastWater.toFixed(4),
        uniqueTypes: stats.resourceUniquePlannedTypes,
        varietyFloor,
        varietyGap: varietyFloor - stats.resourceUniquePlannedTypes,
      })
    );
  }
  console.log(`# coldReef==0 on ${coldZero}/${SEEDS.length} seeds`);
  return 0;
}

process.exitCode = main();
