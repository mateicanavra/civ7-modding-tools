import hydrology from "@mapgen/domain/hydrology";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "@mapgen/domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Hydrology refinement step with optional diagnostic projection (bounded, deterministic).
 *
 * This step refines rainfall/temperature locally (still mechanism-driven), computes land water budget indices,
 * runs bounded cryosphere feedback when enabled, and publishes refined physical artifacts.
 *
 * Configuration posture:
 * - No step-local config. All author-facing control flows through Hydrology knobs compiled at stage compile time.
 */
const ClimateRefineStepConfigSchema = Type.Object(
  {},
  {
    description:
      "Climate refine step config (empty). Use Hydrology knobs (dryness/temperature/cryosphere) to influence behavior deterministically.",
  }
);

/**
 * Defines cryosphere/albedo refinement and derived climate indices over baseline climate and
 * topography. It publishes the final-refined climate surface and derived physical indices before
 * Ecology and engine projection consume the result; advisory diagnostics flow only to facets.
 */
export const ClimateRefineStepContract = defineStep({
  id: "climate-refine",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyLandformsArtifacts.topography,
      climateArtifacts.baselineClimateField,
      climateArtifacts.windField,
      hydrographyArtifacts.hydrography,
    ],
    provides: [
      climateArtifacts.climateField,
      climateArtifacts.climateIndices,
      cryosphereArtifacts.cryosphere,
    ],
  },
  ops: {
    computePrecipitation: {
      contract: hydrology.climate.ops.computePrecipitation,
      defaultStrategy: "refine",
    },
    computeRadiativeForcing: hydrology.climate.ops.computeRadiativeForcing,
    computeThermalState: hydrology.climate.ops.computeThermalState,
    applyAlbedoFeedback: hydrology.cryosphere.ops.applyAlbedoFeedback,
    computeCryosphereState: hydrology.cryosphere.ops.computeCryosphereState,
    computeLandWaterBudget: hydrology.climate.ops.computeLandWaterBudget,
    computeClimateDiagnostics: hydrology.climate.ops.computeClimateDiagnostics,
  },
  schema: ClimateRefineStepConfigSchema,
});
