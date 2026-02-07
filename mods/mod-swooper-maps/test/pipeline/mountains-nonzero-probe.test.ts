import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import planRidges from "../../src/domain/morphology/ops/plan-ridges/index.js";
import planFoothills from "../../src/domain/morphology/ops/plan-foothills/index.js";

const PROBE_WIDTH = 106;
const PROBE_HEIGHT = 66;
const PROBE_SEED = 1337;

const MIN_MOUNTAIN_TILES = 10;
const MIN_VOLCANO_POINTS = 1;

function loadEarthlikeConfig(): StandardRecipeConfig {
  const raw = JSON.parse(
    readFileSync(new URL("../../src/maps/configs/swooper-earthlike.config.json", import.meta.url), "utf8")
  ) as Record<string, unknown>;
  // The recipe schema is strict; `$schema` is editor metadata and not part of the runtime config surface.
  delete (raw as any).$schema;
  return raw as unknown as StandardRecipeConfig;
}

function runStandardContext(args: { width: number; height: number; seed: number; config: StandardRecipeConfig }) {
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
  const compiled = standardRecipe.compileConfig(env, JSON.parse(JSON.stringify(config)));
  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[mountains-probe]", storyEnabled: true });
  standardRecipe.run(context, env, config, { log: () => {} });
  return { context, env, compiled } as const;
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

function maxU8WhereEq(values: Uint8Array, mask: Uint8Array, types: Uint8Array, expectedType: number): number {
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
  it("produces nonzero orogeny + mountains, and keeps volcano points nonzero", () => {
    const config = loadEarthlikeConfig();
    const { context, compiled } = runStandardContext({
      width: PROBE_WIDTH,
      height: PROBE_HEIGHT,
      seed: PROBE_SEED,
      config,
    });

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as any;
    const belts = context.artifacts.get(morphologyArtifacts.beltDrivers.id) as any;
    const volcanoes = context.artifacts.get(morphologyArtifacts.volcanoes.id) as any;
    const historyTiles = context.artifacts.get(foundationArtifacts.tectonicHistoryTiles.id) as any;

    const size = PROBE_WIDTH * PROBE_HEIGHT;
    expect(topography?.landMask).toBeInstanceOf(Uint8Array);
    expect((topography?.landMask as Uint8Array)?.length).toBe(size);
    expect(belts?.boundaryCloseness).toBeInstanceOf(Uint8Array);
    expect((belts?.boundaryCloseness as Uint8Array)?.length).toBe(size);

    // Physics-first guard: use zero fractal noise so mountains can't "appear" from fractal randomness alone.
    const zeros = new Int16Array(size);
    const ridges = planRidges.run(
      {
        width: PROBE_WIDTH,
        height: PROBE_HEIGHT,
        landMask: topography.landMask,
        boundaryCloseness: belts.boundaryCloseness,
        boundaryType: belts.boundaryType,
        upliftPotential: belts.upliftPotential,
        riftPotential: belts.riftPotential,
        tectonicStress: belts.tectonicStress,
        beltAge: belts.beltAge,
        fractalMountain: zeros,
      },
      // Map-morphology step config shape: { strategy, config }.
      (compiled as any)?.["map-morphology"]?.["plot-mountains"]?.ridges ?? { strategy: "default", config: {} }
    ) as any;

    const foothills = planFoothills.run(
      {
        width: PROBE_WIDTH,
        height: PROBE_HEIGHT,
        landMask: topography.landMask,
        mountainMask: ridges.mountainMask,
        boundaryCloseness: belts.boundaryCloseness,
        boundaryType: belts.boundaryType,
        upliftPotential: belts.upliftPotential,
        riftPotential: belts.riftPotential,
        tectonicStress: belts.tectonicStress,
        beltAge: belts.beltAge,
        fractalHill: zeros,
      },
      (compiled as any)?.["map-morphology"]?.["plot-mountains"]?.foothills ?? { strategy: "default", config: {} }
    ) as any;

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
        upliftTotalMax: maxU8Where(historyTiles?.rollups?.upliftTotal ?? new Uint8Array(size), topography.landMask),
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

    expect(ridges?.orogenyPotential).toBeInstanceOf(Uint8Array);
    const maxOrogeny = maxU8(ridges.orogenyPotential);
    if (maxOrogeny <= 0) {
      throw new Error(
        `Expected nonzero orogenyPotential on canonical probe; got max=${maxOrogeny}. beltStats=${JSON.stringify(
          beltStats
        )}`
      );
    }

    expect(ridges?.mountainMask).toBeInstanceOf(Uint8Array);
    const maxMountain = maxU8(ridges.mountainMask);
    if (maxMountain !== 1) {
      throw new Error(
        `Expected nonzero mountainMask on canonical probe; got max=${maxMountain}. beltStats=${JSON.stringify(
          beltStats
        )}`
      );
    }
    expect(countMask(ridges.mountainMask)).toBeGreaterThanOrEqual(MIN_MOUNTAIN_TILES);

    expect(foothills?.hillMask).toBeInstanceOf(Uint8Array);

    // Volcanoes are planned via a separate step, but the artifact should remain non-degenerate.
    const volcanoList = Array.isArray(volcanoes?.volcanoes) ? volcanoes.volcanoes : [];
    expect(volcanoList.length).toBeGreaterThanOrEqual(MIN_VOLCANO_POINTS);
  });
});
