import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { createMockAdapter } from "@civ7/adapter";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import featuresPlanStep from "../../src/recipes/standard/stages/ecology/steps/features-plan/index.js";
import featuresApplyStep from "../../src/recipes/standard/stages/map-ecology/steps/features-apply/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("features plan/apply pipeline", () => {
  it("publishes intents and applies placements", () => {
    const width = 4;
    const height = 3;
    const size = width * height;
    const env = {
      seed: 0,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };

    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);

    const ctx = createExtendedMapContext({ width, height }, adapter, env);
    ctx.buffers.heightfield.landMask.fill(1);
    ctx.buffers.heightfield.elevation.fill(100);

    const stageArtifacts = implementArtifacts(
      [
        ecologyArtifacts.biomeClassification,
        ecologyArtifacts.pedology,
        morphologyArtifacts.topography,
        hydrologyHydrographyArtifacts.hydrography,
      ],
      { biomeClassification: {}, pedology: {}, topography: {}, hydrography: {} }
    );

    stageArtifacts.topography.publish(ctx, {
      elevation: ctx.buffers.heightfield.elevation,
      seaLevel: 0,
      landMask: ctx.buffers.heightfield.landMask,
      bathymetry: new Int16Array(size),
    });
    stageArtifacts.pedology.publish(ctx, {
      width,
      height,
      soilType: new Uint8Array(size).fill(0),
      fertility: new Float32Array(size).fill(0.3),
    });
    stageArtifacts.biomeClassification.publish(ctx, {
      width,
      height,
      biomeIndex: new Uint8Array(size).fill(4),
      vegetationDensity: new Float32Array(size).fill(0.7),
      effectiveMoisture: new Float32Array(size).fill(180),
      surfaceTemperature: new Float32Array(size).fill(15),
      aridityIndex: new Float32Array(size).fill(0.2),
      freezeIndex: new Float32Array(size).fill(0.05),
      groundIce01: new Float32Array(size),
      permafrost01: new Float32Array(size),
      meltPotential01: new Float32Array(size),
      treeLine01: new Float32Array(size),
    });
    stageArtifacts.hydrography.publish(ctx, {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });

    const planConfig = {
      vegetation: { minScoreThreshold: 0.05 },
      vegetationSubstrate: normalizeOpSelectionOrThrow(ecology.ops.computeVegetationSubstrate, {
        strategy: "default",
        config: {},
      }),
      scoreVegetationForest: normalizeOpSelectionOrThrow(ecology.ops.scoreVegetationForest, {
        strategy: "default",
        config: {},
      }),
      scoreVegetationRainforest: normalizeOpSelectionOrThrow(ecology.ops.scoreVegetationRainforest, {
        strategy: "default",
        config: {},
      }),
      scoreVegetationTaiga: normalizeOpSelectionOrThrow(ecology.ops.scoreVegetationTaiga, {
        strategy: "default",
        config: {},
      }),
      scoreVegetationSavannaWoodland: normalizeOpSelectionOrThrow(ecology.ops.scoreVegetationSavannaWoodland, {
        strategy: "default",
        config: {},
      }),
      scoreVegetationSagebrushSteppe: normalizeOpSelectionOrThrow(ecology.ops.scoreVegetationSagebrushSteppe, {
        strategy: "default",
        config: {},
      }),
      wetlands: normalizeOpSelectionOrThrow(ecology.ops.planWetlands, {
        strategy: "default",
        config: {},
      }),
      reefs: normalizeOpSelectionOrThrow(ecology.ops.planReefs, { strategy: "default", config: {} }),
      ice: normalizeOpSelectionOrThrow(ecology.ops.planIce, { strategy: "default", config: {} }),
      wetPlacementMarsh: normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementMarsh, {
        strategy: "disabled",
        config: {},
      }),
      wetPlacementTundraBog: normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementTundraBog, {
        strategy: "disabled",
        config: {},
      }),
      wetPlacementMangrove: normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementMangrove, {
        strategy: "disabled",
        config: {},
      }),
      wetPlacementOasis: normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementOasis, {
        strategy: "disabled",
        config: {},
      }),
      wetPlacementWateringHole: normalizeOpSelectionOrThrow(ecology.ops.planWetPlacementWateringHole, {
        strategy: "disabled",
        config: {},
      }),
    };
    const planOps = ecology.ops.bind(featuresPlanStep.contract.ops!).runtime;
    featuresPlanStep.run(ctx, planConfig, planOps, buildTestDeps(featuresPlanStep));

    const vegetationIntents = ctx.artifacts.get(ecologyArtifacts.featureIntentsVegetation.id);
    expect(vegetationIntents).toBeTruthy();
    expect(Array.isArray(vegetationIntents)).toBe(true);
    expect((vegetationIntents as unknown[]).length).toBeGreaterThan(0);

    const applyConfig = {
      apply: normalizeOpSelectionOrThrow(ecology.ops.applyFeatures, { strategy: "default", config: {} }),
    };
    const applyOps = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;
    featuresApplyStep.run(ctx, applyConfig, applyOps, buildTestDeps(featuresApplyStep));

    const featureField = ctx.fields.featureType;
    expect(featureField).toBeDefined();
    if (!(featureField instanceof Int16Array)) throw new Error("Missing featureType field.");
    let applied = 0;
    for (let i = 0; i < featureField.length; i++) {
      if (featureField[i] !== -1) applied++;
    }
    expect(applied).toBeGreaterThan(0);
  });
});
