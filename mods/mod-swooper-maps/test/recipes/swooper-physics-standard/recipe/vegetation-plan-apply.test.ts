import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { BIOME_SYMBOL_TO_INDEX } from "@mapgen/domain/ecology/model/schemas/index.js";
import ecology from "@mapgen/domain/ecology/ops";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifactModules } from "@swooper/mapgen-core/authoring";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import planVegetationStep from "../../../../src/recipes/standard/stages/ecology-features/steps/plan-vegetation/index.js";
import { artifactModules as hydrologyHydrographyArtifactModules } from "../../../../src/recipes/standard/stages/hydrology-hydrography/artifacts/index.js";
import featuresApplyStep from "../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/index.js";
import { artifactModules as morphologyArtifactModules } from "../../../../src/recipes/standard/stages/morphology/artifacts/index.js";
import { normalizeOpSelectionOrThrow } from "../../../support/compiler-helpers.js";
import { createEmptyFeatureScoreLayers } from "../../../support/feature-score-layers.js";
import { buildTestDeps } from "../../../support/step-deps.js";

describe("plan-vegetation/apply pipeline", () => {
  it("publishes vegetation intents and applies placements", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    // This test exercises plan->intents->apply WIRING, not the static
    // feature-legality policy; the synthetic context never stamps engine
    // biomes/terrain, so the policy oracle is overridden to accept. (S6:
    // features-apply now reifies the engine feature field unconditionally,
    // which exposed that the previous all-zeros field counted unapplied
    // tiles as applied.)
    const adapter = createMockAdapter({ width, height, canHaveFeature: () => true });
    adapter.fillWater(false);

    const ctx = createExtendedMapContext({ width, height }, adapter, env);
    ctx.buffers.heightfield.landMask.fill(1);
    ctx.buffers.heightfield.elevation.fill(100);

    const layers = createEmptyFeatureScoreLayers(size);
    layers.forest.fill(1);

    const stageArtifacts = implementArtifactModules([
      ecologyArtifactModules.scoreLayers,
      ecologyArtifactModules.occupancyWetlands,
      ecologyArtifactModules.biomeClassification,
      hydrologyHydrographyArtifactModules.hydrography,
      hydrologyHydrographyArtifactModules.lakePlan,
      morphologyArtifactModules.topography,
      morphologyArtifactModules.mountains,
      morphologyArtifactModules.volcanoes,
    ]);

    stageArtifacts.scoreLayers.publish(ctx, { width, height, layers });
    stageArtifacts.occupancyWetlands.publish(ctx, {
      width,
      height,
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    });
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
      elevation: ctx.buffers.heightfield.elevation,
      seaLevel: 0,
      landMask: ctx.buffers.heightfield.landMask,
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

    const planConfig = {
      planVegetation: normalizeOpSelectionOrThrow(
        ecology.ops.planVegetation,
        ecology.ops.planVegetation.defaultConfig
      ),
    };
    const planOps = ecology.ops.bind(planVegetationStep.contract.ops!).runtime;
    planVegetationStep.run(ctx, planConfig, planOps, buildTestDeps(planVegetationStep));

    // M3 stages: publish empty lists for non-vegetation families so the apply step has a complete surface.
    implementArtifactModules([ecologyArtifactModules.featureIntentsIce]).featureIntentsIce.publish(
      ctx,
      []
    );
    implementArtifactModules([
      ecologyArtifactModules.featureIntentsReefs,
    ]).featureIntentsReefs.publish(ctx, []);
    implementArtifactModules([
      ecologyArtifactModules.featureIntentsWetlands,
    ]).featureIntentsWetlands.publish(ctx, []);
    implementArtifactModules([
      ecologyArtifactModules.featureIntentsFloodplains,
    ]).featureIntentsFloodplains.publish(ctx, []);

    const vegetationIntents = ctx.artifacts.get(ecologyArtifacts.featureIntentsVegetation.id);
    expect(vegetationIntents).toBeTruthy();
    expect(Array.isArray(vegetationIntents)).toBe(true);
    expect((vegetationIntents as unknown[]).length).toBeGreaterThan(0);

    const applyConfig = {
      apply: normalizeOpSelectionOrThrow(
        ecology.ops.applyFeatures,
        ecology.ops.applyFeatures.defaultConfig
      ),
    };
    const applyOps = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;
    featuresApplyStep.run(ctx, applyConfig, applyOps, buildTestDeps(featuresApplyStep));

    const snapshot = ctx.artifacts.get(ecologyArtifacts.featureEngineSnapshot.id) as
      | { width: number; height: number; featureType: Int16Array }
      | undefined;
    expect(snapshot).toBeDefined();
    expect(snapshot).toMatchObject({ width, height });
    const featureField = snapshot?.featureType;
    if (!(featureField instanceof Int16Array)) throw new Error("Missing feature engine snapshot.");
    let applied = 0;
    for (let i = 0; i < featureField.length; i++) {
      const y = (i / width) | 0;
      const x = i - y * width;
      expect(featureField[i]).toBe(adapter.getFeatureType(x, y));
      if (featureField[i] !== adapter.NO_FEATURE) applied++;
    }
    expect(applied).toBeGreaterThan(0);
  });
});
