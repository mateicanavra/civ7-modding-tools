import { describe, expect, it } from "bun:test";

import ecology from "@mapgen/domain/ecology/ops";
import { implementArtifacts } from "@swooper/mapgen-core/authoring";
import featuresPlanStep from "../../src/recipes/standard/stages/ecology/steps/features-plan/index.js";
import featuresApplyStep from "../../src/recipes/standard/stages/map-ecology/steps/features-apply/index.js";
import { ecologyArtifacts } from "../../src/recipes/standard/stages/ecology/artifacts.js";
import { hydrologyHydrographyArtifacts } from "../../src/recipes/standard/stages/hydrology-hydrography/artifacts.js";
import { createFeaturesTestContext } from "./features-owned.helpers.js";
import { normalizeOpSelectionOrThrow } from "../support/compiler-helpers.js";
import { buildTestDeps } from "../support/step-deps.js";

describe("features plan/apply pipeline", () => {
  it("publishes intents and applies placements", () => {
    const { ctx } = createFeaturesTestContext({
      width: 4,
      height: 3,
      rng: () => 0,
    });

    const { width, height } = ctx.dimensions;
    const size = width * height;
    const hydrologyRuntime = implementArtifacts([hydrologyHydrographyArtifacts.hydrography], {
      hydrography: {},
    });
    hydrologyRuntime.hydrography.publish(ctx, {
      runoff: new Float32Array(size),
      discharge: new Float32Array(size),
      riverClass: new Uint8Array(size),
      sinkMask: new Uint8Array(size),
      outletMask: new Uint8Array(size),
    });

    const planConfig = {
      vegetationForest: normalizeOpSelectionOrThrow(ecology.ops.planVegetationForest, {
        strategy: "default",
        config: {},
      }),
      vegetationRainforest: normalizeOpSelectionOrThrow(ecology.ops.planVegetationRainforest, {
        strategy: "default",
        config: {},
      }),
      vegetationTaiga: normalizeOpSelectionOrThrow(ecology.ops.planVegetationTaiga, {
        strategy: "default",
        config: {},
      }),
      vegetationSavannaWoodland: normalizeOpSelectionOrThrow(ecology.ops.planVegetationSavannaWoodland, {
        strategy: "default",
        config: {},
      }),
      vegetationSagebrushSteppe: normalizeOpSelectionOrThrow(ecology.ops.planVegetationSagebrushSteppe, {
        strategy: "default",
        config: {},
      }),
      wetlands: normalizeOpSelectionOrThrow(ecology.ops.planWetlands, {
        strategy: "default",
        config: {},
      }),
      reefs: normalizeOpSelectionOrThrow(ecology.ops.planReefs, { strategy: "default", config: {} }),
      ice: normalizeOpSelectionOrThrow(ecology.ops.planIce, { strategy: "default", config: {} }),
      vegetatedPlacementForest: normalizeOpSelectionOrThrow(ecology.ops.planVegetatedPlacementForest, {
        strategy: "disabled",
        config: {},
      }),
      vegetatedPlacementRainforest: normalizeOpSelectionOrThrow(ecology.ops.planVegetatedPlacementRainforest, {
        strategy: "disabled",
        config: {},
      }),
      vegetatedPlacementTaiga: normalizeOpSelectionOrThrow(ecology.ops.planVegetatedPlacementTaiga, {
        strategy: "disabled",
        config: {},
      }),
      vegetatedPlacementSavannaWoodland: normalizeOpSelectionOrThrow(ecology.ops.planVegetatedPlacementSavannaWoodland, {
        strategy: "disabled",
        config: {},
      }),
      vegetatedPlacementSagebrushSteppe: normalizeOpSelectionOrThrow(ecology.ops.planVegetatedPlacementSagebrushSteppe, {
        strategy: "disabled",
        config: {},
      }),
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

    const applyConfig = {
      apply: normalizeOpSelectionOrThrow(ecology.ops.applyFeatures, { strategy: "default", config: {} }),
    };
    const applyOps = ecology.ops.bind(featuresApplyStep.contract.ops!).runtime;
    featuresApplyStep.run(ctx, applyConfig, applyOps, buildTestDeps(featuresApplyStep));

    const featureField = ctx.fields.featureType;
    expect(featureField).toBeDefined();
  });
});
