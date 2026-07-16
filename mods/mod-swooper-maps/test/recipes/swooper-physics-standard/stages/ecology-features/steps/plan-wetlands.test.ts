import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import { artifacts as ecologyArtifacts } from "../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import planWetlandsStep from "../../../../../../src/recipes/standard/stages/ecology-features/steps/plan-wetlands/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { normalizeOpSelectionOrThrow } from "../../../../../support/compiler-helpers.js";
import { createEmptyFeatureScoreLayers } from "../../../../../support/feature-score-layers.js";
import { buildTestDeps } from "../../../../../support/step-deps.js";

describe("ecology-features plan-wetlands step", () => {
  it("publishes wetland intents and occupancy snapshot", () => {
    const width = 3;
    const height = 2;
    const size = width * height;
    const env = {
      seed: 123,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);

    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    const layers = createEmptyFeatureScoreLayers(size);
    layers.marsh.fill(1);

    const stageArtifacts = implementArtifacts(
      [
        ecologyArtifacts.biomeClassification,
        ecologyArtifacts.scoreLayers,
        ecologyArtifacts.occupancyReefs,
        hydrologyHydrographyArtifacts.hydrography,
        hydrologyHydrographyArtifacts.lakePlan,
        morphologyArtifacts.topography,
        morphologyArtifacts.mountains,
        morphologyArtifacts.volcanoes,
      ],
      {
        biomeClassification: {},
        scoreLayers: {},
        occupancyReefs: {},
        hydrography: {},
        lakePlan: {},
        topography: {},
        mountains: {},
        volcanoes: {},
      }
    );
    stageArtifacts.biomeClassification.publish(ctx, {
      width,
      height,
      biomeIndex: new Uint8Array(size).fill(BIOME_SYMBOL_TO_INDEX.temperateHumid),
      vegetationDensity: new Float32Array(size).fill(0.4),
      effectiveMoisture: new Float32Array(size).fill(120),
      surfaceTemperature: new Float32Array(size).fill(20),
      aridityIndex: new Float32Array(size).fill(0.4),
      freezeIndex: new Float32Array(size),
      groundIce01: new Float32Array(size),
      permafrost01: new Float32Array(size),
      meltPotential01: new Float32Array(size),
      treeLine01: new Float32Array(size),
    });
    stageArtifacts.scoreLayers.publish(ctx, { width, height, layers });
    stageArtifacts.occupancyReefs.publish(ctx, {
      width,
      height,
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    });
    stageArtifacts.hydrography.publish(ctx, {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      flowDir: new Int32Array(size).fill(-1),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });
    stageArtifacts.lakePlan.publish(ctx, {
      width,
      height,
      lakeMask: new Uint8Array(size),
      plannedLakeTileCount: 0,
      sinkLakeCount: 0,
    });
    stageArtifacts.topography.publish(ctx, {
      elevation: new Int16Array(size),
      seaLevel: 0,
      landMask: new Uint8Array(size).fill(1),
      bathymetry: new Int16Array(size),
    });
    stageArtifacts.mountains.publish(ctx, {
      mountainMask: new Uint8Array(size),
      mountainRegionMask: new Uint8Array(size),
      mountainRegionIdByTile: new Int32Array(size).fill(-1),
      hillMask: new Uint8Array(size),
      foothillMask: new Uint8Array(size),
      roughLandMask: new Uint8Array(size),
      orogenyPotential: new Uint8Array(size),
      fracturePotential: new Uint8Array(size),
      roughnessPotential: new Uint8Array(size),
    });
    stageArtifacts.volcanoes.publish(ctx, {
      volcanoMask: new Uint8Array(size),
      volcanoes: [],
    });

    const config = {
      planWetlands: normalizeOpSelectionOrThrow(
        ecology.ops.planWetlands,
        ecology.ops.planWetlands.defaultConfig
      ),
    };
    const ops = ecology.ops.bind(planWetlandsStep.contract.ops!).runtime;
    planWetlandsStep.run(ctx, config, ops, buildTestDeps(planWetlandsStep));

    const intents = ctx.artifacts.get(ecologyArtifacts.featureIntentsWetlands.id);
    expect(intents).toBeTruthy();
    expect(Array.isArray(intents)).toBe(true);
    expect((intents as unknown[]).length).toBeGreaterThan(0);

    const occupancy = ctx.artifacts.get(ecologyArtifacts.occupancyWetlands.id) as any;
    expect(occupancy).toBeTruthy();
    expect(occupancy.width).toBe(width);
    expect(occupancy.height).toBe(height);
    expect(occupancy.featureOccupancyMask instanceof Uint8Array).toBe(true);
    expect(occupancy.reserved instanceof Uint8Array).toBe(true);
  });
});
