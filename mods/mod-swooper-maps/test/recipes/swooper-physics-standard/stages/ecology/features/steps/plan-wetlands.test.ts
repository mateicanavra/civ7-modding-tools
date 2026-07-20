import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import {
  buildStepTestDependencies,
  normalizeOperationSelectionForTest,
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { PlanWetlandsStep as planWetlandsStep } from "../../../../../../../src/recipes/standard/stages/ecology-features/steps/plan-wetlands/step.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { createEmptyFeatureScoreLayers } from "../fixtures/feature-score-layers.js";

describe("ecology-features plan-wetlands step", () => {
  it("publishes wetland intents and occupancy snapshot", () => {
    const syntheticDimensions = { width: 3, height: 2 } as const;
    const { width, height } = syntheticDimensions;
    const size = width * height;
    const setup = admitMapSetup({
      mapSeed: 123,
      dimensions: syntheticDimensions,
      latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
    });

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);

    const ctx = createMapContext({ setup, adapter });

    withMapContextExecutionForTest(ctx, () => {
      const layers = createEmptyFeatureScoreLayers(size);
      layers.marsh.fill(1);

      publishTestArtifact(ctx, ecologyArtifactModules.biomeClassification, {
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
      publishTestArtifact(ctx, ecologyArtifactModules.scoreLayers, { width, height, layers });
      publishTestArtifact(ctx, ecologyArtifactModules.occupancyReefs, {
        width,
        height,
        featureOccupancyMask: new Uint8Array(size),
        reserved: new Uint8Array(size),
      });
      publishTestArtifact(ctx, hydrologyHydrographyArtifactModules.hydrography, {
        runoff: new Float32Array(size),
        discharge: new Float32Array(size),
        riverClass: new Uint8Array(size),
        flowDir: new Int32Array(size).fill(-1),
        sinkMask: new Uint8Array(size),
        outletMask: new Uint8Array(size),
      });
      publishTestArtifact(ctx, hydrologyHydrographyArtifactModules.lakePlan, {
        width,
        height,
        lakeMask: new Uint8Array(size),
        plannedLakeTileCount: 0,
        sinkLakeCount: 0,
      });
      publishTestArtifact(ctx, morphologyArtifactModules.topography, {
        elevation: new Int16Array(size),
        seaLevel: 0,
        landMask: new Uint8Array(size).fill(1),
        bathymetry: new Int16Array(size),
      });
      publishTestArtifact(ctx, morphologyArtifactModules.mountains, {
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
      publishTestArtifact(ctx, morphologyArtifactModules.volcanoes, {
        volcanoMask: new Uint8Array(size),
        volcanoes: [],
      });

      const config = {
        planWetlands: normalizeOperationSelectionForTest(
          ecology.ops.planWetlands,
          ecology.ops.planWetlands.defaultConfig
        ),
      };
      const ops = ecology.ops.bind(planWetlandsStep.contract.ops!).runtime;
      planWetlandsStep.run(ctx, config, ops, buildStepTestDependencies(planWetlandsStep));

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
});
