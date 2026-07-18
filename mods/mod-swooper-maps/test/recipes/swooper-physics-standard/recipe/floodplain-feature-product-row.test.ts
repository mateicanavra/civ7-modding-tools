import { describe, expect, it } from "bun:test";

import { createMockAdapter } from "@civ7/adapter";
import ecology from "@mapgen/domain/ecology/ops";
import { RIVER_CLASS_MAJOR } from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { createExtendedMapContext } from "@swooper/mapgen-core";
import { implementArtifactModules } from "@swooper/mapgen-core/authoring";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { PlanFloodplainsStep } from "../../../../src/recipes/standard/stages/ecology-features/steps/plan-floodplains/step.js";
import { FeaturesApplyStep } from "../../../../src/recipes/standard/stages/map-ecology/steps/features-apply/step.js";
import { normalizeOpSelectionOrThrow } from "../../../support/compiler-helpers.js";
import { createEmptyFeatureScoreLayers } from "../../../support/feature-score-layers.js";
import { buildTestDeps } from "../../../support/step-deps.js";

const FLOODPLAIN_INTENT_KEYS = [
  "desert-floodplain-minor",
  "desert-floodplain-navigable",
  "grassland-floodplain-minor",
  "grassland-floodplain-navigable",
  "plains-floodplain-minor",
  "plains-floodplain-navigable",
  "tropical-floodplain-minor",
  "tropical-floodplain-navigable",
  "tundra-floodplain-minor",
  "tundra-floodplain-navigable",
] as const;

const FLOODPLAIN_ENGINE_FEATURE_KEYS = [
  "FEATURE_DESERT_FLOODPLAIN_MINOR",
  "FEATURE_DESERT_FLOODPLAIN_NAVIGABLE",
  "FEATURE_GRASSLAND_FLOODPLAIN_MINOR",
  "FEATURE_GRASSLAND_FLOODPLAIN_NAVIGABLE",
  "FEATURE_PLAINS_FLOODPLAIN_MINOR",
  "FEATURE_PLAINS_FLOODPLAIN_NAVIGABLE",
  "FEATURE_TROPICAL_FLOODPLAIN_MINOR",
  "FEATURE_TROPICAL_FLOODPLAIN_NAVIGABLE",
  "FEATURE_TUNDRA_FLOODPLAIN_MINOR",
  "FEATURE_TUNDRA_FLOODPLAIN_NAVIGABLE",
] as const;

function floodplainAttemptCount(counts: Readonly<Record<string, number>> | undefined): number {
  let total = 0;
  for (const key of FLOODPLAIN_ENGINE_FEATURE_KEYS) total += counts?.[key] ?? 0;
  return total;
}

describe("floodplain feature product row", () => {
  it("materializes a lowland high-discharge floodplain-family fixture through feature apply", () => {
    const width = 5;
    const height = 3;
    const size = width * height;
    const riverIndex = 7;

    const landMask = new Uint8Array(size).fill(1);
    const riverClass = new Uint8Array(size);
    const navigableRiverMask = new Uint8Array(size);
    const discharge = new Float32Array(size);
    riverClass[riverIndex] = RIVER_CLASS_MAJOR;
    navigableRiverMask[riverIndex] = 1;
    discharge[riverIndex] = 160;

    const substrateConfig = normalizeOpSelectionOrThrow(ecology.ops.computeFeatureSubstrate, {
      ...ecology.ops.computeFeatureSubstrate.defaultConfig,
      config: {
        ...ecology.ops.computeFeatureSubstrate.defaultConfig.config,
        lowlandMaxElevationAboveSeaM: 80,
        floodplainDischargeMin: 96,
      },
    });
    const substrate = ecology.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask,
        landMask,
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge,
        sinkMask: new Uint8Array(size),
      },
      substrateConfig
    );

    const layers = createEmptyFeatureScoreLayers(size);
    for (let i = 0; i < size; i += 1) {
      if (substrate.floodplainMask[i] !== 1) continue;
      if (substrate.navigableRiverMask[i] === 1) {
        layers["plains-floodplain-navigable"][i] = 1;
      } else {
        layers["plains-floodplain-minor"][i] = 0.85;
      }
    }

    const env = {
      seed: 24681357,
      dimensions: { width, height },
      latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
    };
    // Keep the fixture on legal plains/flat terrain so the test exercises
    // floodplain intent/apply plumbing instead of soft rejection diagnostics.
    const adapter = createMockAdapter({ width, height });
    adapter.fillWater(false);
    const plainsBiome = adapter.getBiomeGlobal("BIOME_PLAINS");
    const flatTerrain = adapter.getTerrainTypeIndex("TERRAIN_FLAT");
    const navigableRiverTerrain = adapter.getTerrainTypeIndex("TERRAIN_NAVIGABLE_RIVER");
    for (let i = 0; i < size; i += 1) {
      const x = i % width;
      const y = Math.floor(i / width);
      adapter.setBiomeType(x, y, plainsBiome);
      adapter.setTerrainType(x, y, flatTerrain);
    }
    adapter.setTerrainType(
      riverIndex % width,
      Math.floor(riverIndex / width),
      navigableRiverTerrain
    );
    const ctx = createExtendedMapContext({ width, height }, adapter, env);

    const setupArtifacts = implementArtifactModules([
      ecologyArtifactModules.scoreLayers,
      ecologyArtifactModules.occupancyBase,
    ]);
    setupArtifacts.scoreLayers.publish(ctx, { width, height, layers });
    setupArtifacts.occupancyBase.publish(ctx, {
      width,
      height,
      featureOccupancyMask: new Uint8Array(size),
      reserved: new Uint8Array(size),
    });

    const planConfig = {
      planFloodplains: normalizeOpSelectionOrThrow(ecology.ops.planFloodplains, {
        ...ecology.ops.planFloodplains.defaultConfig,
        config: {
          ...ecology.ops.planFloodplains.defaultConfig.config,
          minConfidence01: 0.5,
        },
      }),
    };
    const planOps = ecology.ops.bind(PlanFloodplainsStep.contract.ops!).runtime;
    const planDeps = buildTestDeps(PlanFloodplainsStep);
    PlanFloodplainsStep.run(ctx, planConfig, planOps, planDeps);

    const floodplainIntents = planDeps.artifacts.featureIntentsFloodplains.read(ctx);
    expect(floodplainIntents.length).toBeGreaterThan(0);
    expect(
      floodplainIntents.every((intent) =>
        FLOODPLAIN_INTENT_KEYS.some((feature) => feature === intent.feature)
      )
    ).toBe(true);

    const emptyIntentArtifacts = implementArtifactModules([
      ecologyArtifactModules.featureIntentsVegetation,
      ecologyArtifactModules.featureIntentsWetlands,
      ecologyArtifactModules.featureIntentsReefs,
      ecologyArtifactModules.featureIntentsIce,
    ]);
    emptyIntentArtifacts.featureIntentsVegetation.publish(ctx, []);
    emptyIntentArtifacts.featureIntentsWetlands.publish(ctx, []);
    emptyIntentArtifacts.featureIntentsReefs.publish(ctx, []);
    emptyIntentArtifacts.featureIntentsIce.publish(ctx, []);

    const applyConfig = {
      apply: normalizeOpSelectionOrThrow(
        ecology.ops.applyFeatures,
        ecology.ops.applyFeatures.defaultConfig
      ),
    };
    const applyOps = ecology.ops.bind(FeaturesApplyStep.contract.ops!).runtime;
    FeaturesApplyStep.run(ctx, applyConfig, applyOps, buildTestDeps(FeaturesApplyStep));

    const diagnostics = ctx.artifacts.get(ecologyArtifacts.featureApplyDiagnostics.id) as
      | {
          attempted: number;
          applied: number;
          rejected: number;
          attemptedByFeature: Record<string, number>;
          appliedByFeature: Record<string, number>;
        }
      | undefined;

    if (!diagnostics) throw new Error("Missing feature application diagnostics");
    expect(diagnostics.attempted).toBe(floodplainIntents.length);
    expect(diagnostics.applied).toBe(diagnostics.attempted);
    expect(diagnostics.rejected).toBe(0);
    expect(floodplainAttemptCount(diagnostics.attemptedByFeature)).toBe(diagnostics.attempted);
    expect(floodplainAttemptCount(diagnostics.appliedByFeature)).toBe(diagnostics.applied);
  });

  it("does not author floodplains when the same valley lacks meaningful discharge", () => {
    const width = 5;
    const height = 3;
    const size = width * height;
    const riverIndex = 7;
    const riverClass = new Uint8Array(size);
    riverClass[riverIndex] = RIVER_CLASS_MAJOR;

    const substrateConfig = normalizeOpSelectionOrThrow(ecology.ops.computeFeatureSubstrate, {
      ...ecology.ops.computeFeatureSubstrate.defaultConfig,
      config: {
        ...ecology.ops.computeFeatureSubstrate.defaultConfig.config,
        lowlandMaxElevationAboveSeaM: 80,
        floodplainDischargeMin: 96,
      },
    });
    const substrate = ecology.ops.computeFeatureSubstrate.run(
      {
        width,
        height,
        riverClass,
        navigableRiverMask: new Uint8Array(size),
        landMask: new Uint8Array(size).fill(1),
        elevation: new Int16Array(size).fill(24),
        seaLevel: 0,
        discharge: new Float32Array(size).fill(8),
        sinkMask: new Uint8Array(size),
      },
      substrateConfig
    );

    expect(Array.from(substrate.floodplainMask).some((value) => value === 1)).toBe(false);
  });
});
