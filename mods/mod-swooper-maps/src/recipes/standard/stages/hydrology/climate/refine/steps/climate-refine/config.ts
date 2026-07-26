import {
  default as hydrology,
  artifactModules as hydrologyArtifactModules,
  artifacts as hydrologyArtifacts,
} from "@mapgen/domain/hydrology";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
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
      morphologyArtifacts.topography,
      hydrologyArtifacts.baselineClimateField,
      hydrologyArtifacts.windField,
      hydrologyArtifacts.hydrography,
    ],
    provides: [
      hydrologyArtifactModules.climateField,
      hydrologyArtifactModules.climateIndices,
      hydrologyArtifactModules.cryosphere,
    ],
  },
  ops: {
    computePrecipitation: {
      contract: hydrology.ops.computePrecipitation,
      defaultStrategy: "refine",
    },
    computeRadiativeForcing: hydrology.ops.computeRadiativeForcing,
    computeThermalState: hydrology.ops.computeThermalState,
    applyAlbedoFeedback: hydrology.ops.applyAlbedoFeedback,
    computeCryosphereState: hydrology.ops.computeCryosphereState,
    computeLandWaterBudget: hydrology.ops.computeLandWaterBudget,
    computeClimateDiagnostics: hydrology.ops.computeClimateDiagnostics,
  },
  schema: ClimateRefineStepConfigSchema,
});
