import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { createLabelRng } from "@swooper/mapgen-core/lib/rng";

import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";
import { initializeStandardRuntime } from "../../src/recipes/standard/runtime.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import planRidgesAndFoothills from "../../src/domain/morphology/ops/plan-ridges-and-foothills/index.js";

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

  const adapter = createMockAdapter({ width, height, mapInfo, mapSizeId: 1, rng: createLabelRng(seed) });
  const context = createExtendedMapContext({ width, height }, adapter, env);
  initializeStandardRuntime(context, { mapInfo, logPrefix: "[mountains-probe]", storyEnabled: true });
  standardRecipe.run(context, env, config, { log: () => {} });
  return context;
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

describe("pipeline: mountains nonzero canonical probe (earthlike)", () => {
  it("produces nonzero orogeny + mountains, and keeps volcano points nonzero", () => {
    const config = loadEarthlikeConfig();
    const context = runStandardContext({
      width: PROBE_WIDTH,
      height: PROBE_HEIGHT,
      seed: PROBE_SEED,
      config,
    });

    const topography = context.artifacts.get(morphologyArtifacts.topography.id) as any;
    const belts = context.artifacts.get(morphologyArtifacts.beltDrivers.id) as any;
    const volcanoes = context.artifacts.get(morphologyArtifacts.volcanoes.id) as any;

    const size = PROBE_WIDTH * PROBE_HEIGHT;
    expect(topography?.landMask).toBeInstanceOf(Uint8Array);
    expect((topography?.landMask as Uint8Array)?.length).toBe(size);
    expect(belts?.boundaryCloseness).toBeInstanceOf(Uint8Array);
    expect((belts?.boundaryCloseness as Uint8Array)?.length).toBe(size);

    // Physics-first guard: use zero fractal noise so mountains can't "appear" from fractal randomness alone.
    const zeros = new Int16Array(size);
    const plan = planRidgesAndFoothills.run(
      {
        width: PROBE_WIDTH,
        height: PROBE_HEIGHT,
        landMask: topography.landMask,
        boundaryCloseness: belts.boundaryCloseness,
        boundaryType: belts.boundaryType,
        upliftPotential: belts.upliftPotential,
        riftPotential: belts.riftPotential,
        tectonicStress: belts.tectonicStress,
        fractalMountain: zeros,
        fractalHill: zeros,
      },
      // Map-morphology step config shape: { strategy, config }.
      (config as any)?.["map-morphology"]?.mountains?.mountains ?? { strategy: "default", config: {} }
    ) as any;

    expect(plan?.orogenyPotential01).toBeInstanceOf(Uint8Array);
    expect(maxU8(plan.orogenyPotential01)).toBeGreaterThan(0);

    expect(plan?.mountainMask).toBeInstanceOf(Uint8Array);
    expect(maxU8(plan.mountainMask)).toBe(1);
    expect(countMask(plan.mountainMask)).toBeGreaterThanOrEqual(MIN_MOUNTAIN_TILES);

    // Volcanoes are planned via a separate step, but the artifact should remain non-degenerate.
    const volcanoList = Array.isArray(volcanoes?.volcanoes) ? volcanoes.volcanoes : [];
    expect(volcanoList.length).toBeGreaterThanOrEqual(MIN_VOLCANO_POINTS);
  });
});
