import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";
import { canonicalRecipeConfig } from "../../src/maps/configs/canonical.js";
import { mapArtifacts } from "../../src/recipes/standard/map-artifacts.js";
import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { artifacts as morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts/index.js";

const PROBE_WIDTH = 106;
const PROBE_HEIGHT = 66;
const PROBE_SEED = 1337;

function loadEarthlikeConfig(): StandardRecipeConfig {
  const raw = JSON.parse(
    readFileSync(
      new URL("../../src/maps/configs/swooper-earthlike.config.json", import.meta.url),
      "utf8"
    )
  ) as Record<string, unknown>;
  return structuredClone(canonicalRecipeConfig(raw as any)) as StandardRecipeConfig;
}

function runStandardContext(args: {
  width: number;
  height: number;
  seed: number;
  config: StandardRecipeConfig;
}) {
  const { width, height, seed, config } = args;
  const mapInfo = {
    GridWidth: width,
    GridHeight: height,
    MinLatitude: -60,
    MaxLatitude: 60,
    PlayersLandmass1: 4,
    PlayersLandmass2: 4,
    StartSectorRows: 4,
    StartSectorCols: 4,
  };
  const env = {
    seed,
    dimensions: { width, height },
    latitudeBounds: {
      topLatitude: mapInfo.MaxLatitude,
      bottomLatitude: mapInfo.MinLatitude,
    },
  };

  // compileConfig may normalize/mutate inputs; keep the runtime config object pristine for standardRecipe.run.
  const adapter = createMockAdapter({
    width,
    height,
    mapInfo,
    mapSizeId: 1,
    rng: createLabelRng(seed),
  });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, {
    mapInfo,
    logPrefix: "[mountains-probe]",
  });
  standardRecipe.run(context, env, config, { log: () => {} });
  return { context, env } as const;
}

function countMask(mask: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < mask.length; i++) n += mask[i] === 1 ? 1 : 0;
  return n;
}

function maxU8(values: Uint8Array): number {
  let m = 0;
  for (let i = 0; i < values.length; i++) {
    const v = values[i] ?? 0;
    if (v > m) m = v;
  }
  return m;
}

function maxU8Where(values: Uint8Array, mask: Uint8Array): number {
  let m = 0;
  for (let i = 0; i < values.length; i++) {
    if (mask[i] !== 1) continue;
    const v = values[i] ?? 0;
    if (v > m) m = v;
  }
  return m;
}

function countNonzeroWhere(values: Uint8Array, mask: Uint8Array): number {
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if (mask[i] !== 1) continue;
    if ((values[i] ?? 0) > 0) n += 1;
  }
  return n;
}

function countEqWhere(values: Uint8Array, mask: Uint8Array, expected: number): number {
  const expectedByte = expected | 0;
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if (mask[i] !== 1) continue;
    if (((values[i] ?? 0) | 0) === expectedByte) n += 1;
  }
  return n;
}

function maxU8WhereEq(
  values: Uint8Array,
  mask: Uint8Array,
  types: Uint8Array,
  expectedType: number
): number {
  const t = expectedType | 0;
  let m = 0;
  for (let i = 0; i < values.length; i++) {
    if (mask[i] !== 1) continue;
    if (((types[i] ?? 0) | 0) !== t) continue;
    const v = values[i] ?? 0;
    if (v > m) m = v;
  }
  return m;
}

describe("pipeline: mountains nonzero canonical probe (earthlike)", () => {
  it("produces nonzero orogeny + mountains, and keeps volcano points nonzero", {
    timeout: 20_000,
  }, () => {
    const config = loadEarthlikeConfig();
    const { context } = runStandardContext({
      width: PROBE_WIDTH,
      height: PROBE_HEIGHT,
      seed: PROBE_SEED,
      config,
    });

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as any;
    const belts = context.artifacts.get(morphologyArtifacts.beltDrivers.id) as any;
    const mountains = context.artifacts.get(morphologyArtifacts.mountains.id) as any;
    const volcanoes = context.artifacts.get(morphologyArtifacts.volcanoes.id) as any;
    const historyTiles = context.artifacts.get(
      mapArtifacts.foundationTectonicHistoryTiles.id
    ) as any;

    const size = PROBE_WIDTH * PROBE_HEIGHT;
    expect(topography?.landMask).toBeInstanceOf(Uint8Array);
    expect((topography?.landMask as Uint8Array)?.length).toBe(size);
    expect(belts?.boundaryCloseness).toBeInstanceOf(Uint8Array);
    expect((belts?.boundaryCloseness as Uint8Array)?.length).toBe(size);

    const beltStats = {
      all: {
        boundaryClosenessMax: maxU8(belts.boundaryCloseness),
        boundaryTypeMax: maxU8(belts.boundaryType),
        upliftPotentialMax: maxU8(belts.upliftPotential),
        riftPotentialMax: maxU8(belts.riftPotential),
        tectonicStressMax: maxU8(belts.tectonicStress),
      },
      land: {
        boundaryClosenessMax: maxU8Where(belts.boundaryCloseness, topography.landMask),
        boundaryTypeMax: maxU8Where(belts.boundaryType, topography.landMask),
        upliftPotentialMax: maxU8Where(belts.upliftPotential, topography.landMask),
        riftPotentialMax: maxU8Where(belts.riftPotential, topography.landMask),
        tectonicStressMax: maxU8Where(belts.tectonicStress, topography.landMask),
        upliftPotentialNonzero: countNonzeroWhere(belts.upliftPotential, topography.landMask),
        tectonicStressNonzero: countNonzeroWhere(belts.tectonicStress, topography.landMask),
        boundaryTypeCounts: {
          convergent: countEqWhere(belts.boundaryType, topography.landMask, 1),
          divergent: countEqWhere(belts.boundaryType, topography.landMask, 2),
          transform: countEqWhere(belts.boundaryType, topography.landMask, 3),
        },
        convergentMax: {
          boundaryClosenessMax: maxU8WhereEq(
            belts.boundaryCloseness,
            topography.landMask,
            belts.boundaryType,
            1
          ),
          upliftPotentialMax: maxU8WhereEq(
            belts.upliftPotential,
            topography.landMask,
            belts.boundaryType,
            1
          ),
          tectonicStressMax: maxU8WhereEq(
            belts.tectonicStress,
            topography.landMask,
            belts.boundaryType,
            1
          ),
        },
      },
      foundation: {
        upliftTotalMax: maxU8Where(
          historyTiles?.rollups?.upliftTotal ?? new Uint8Array(size),
          topography.landMask
        ),
        upliftRecentFractionMax: maxU8Where(
          historyTiles?.rollups?.upliftRecentFraction ?? new Uint8Array(size),
          topography.landMask
        ),
        volcanismTotalMax: maxU8Where(
          historyTiles?.rollups?.volcanismTotal ?? new Uint8Array(size),
          topography.landMask
        ),
        fractureTotalMax: maxU8Where(
          historyTiles?.rollups?.fractureTotal ?? new Uint8Array(size),
          topography.landMask
        ),
      },
    };

    // This is recipe-level evidence: mountain truth must be published by
    // morphology-features before map-morphology projects terrain. The test does
    // not call the ops directly, so it guards the production boundary instead of
    // reimplementing the stage's internal wiring.
    expect(mountains?.orogenyPotential).toBeInstanceOf(Uint8Array);
    const maxOrogeny = maxU8(mountains.orogenyPotential);
    if (maxOrogeny <= 0) {
      throw new Error(
        `Expected nonzero orogenyPotential on canonical probe; got max=${maxOrogeny}. beltStats=${JSON.stringify(
          beltStats
        )}`
      );
    }

    expect(mountains?.mountainMask).toBeInstanceOf(Uint8Array);
    const maxMountain = maxU8(mountains.mountainMask);
    if (maxMountain !== 1) {
      throw new Error(
        `Expected nonzero mountainMask on canonical probe; got max=${maxMountain}. beltStats=${JSON.stringify(
          beltStats
        )}`
      );
    }
    expect(countMask(mountains.mountainMask)).toBeGreaterThan(0);

    expect(mountains?.hillMask).toBeInstanceOf(Uint8Array);

    // Volcanoes are planned via a separate step, but the artifact should remain non-degenerate.
    const volcanoList = Array.isArray(volcanoes?.volcanoes) ? volcanoes.volcanoes : [];
    expect(volcanoList.length).toBeGreaterThan(0);
  });
});
