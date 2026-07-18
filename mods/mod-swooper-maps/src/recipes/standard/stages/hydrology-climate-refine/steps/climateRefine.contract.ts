import hydrology from "@mapgen/domain/hydrology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { artifacts as hydrologyClimateBaselineArtifacts } from "../../hydrology-climate-baseline/artifacts/index.js";
import { artifacts as hydrologyHydrographyArtifacts } from "../../hydrology-hydrography/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "../../morphology/artifacts/index.js";
import { artifactModules as hydrologyClimateRefineArtifactModules } from "../artifacts/index.js";

/**
 * Hydrology refinement + diagnostics step (bounded, deterministic).
 *
 * This step refines rainfall/temperature locally (still mechanism-driven), computes land water budget indices,
 * runs bounded cryosphere feedback when enabled, and publishes diagnostic and derived index artifacts.
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
 * topography. It publishes refined physical fields and diagnostics together before Ecology
 * consumes climate truth.
 */
const ClimateRefineStepContract = defineStep({
  id: "climate-refine",
  phase: "hydrology",
  requires: [],
  provides: [],
  artifacts: {
    requires: [
      morphologyArtifacts.topography,
      hydrologyClimateBaselineArtifacts.climateField,
      hydrologyClimateBaselineArtifacts.windField,
      hydrologyHydrographyArtifacts.hydrography,
    ],
    provides: [
      hydrologyClimateRefineArtifactModules.climateIndices,
      hydrologyClimateRefineArtifactModules.cryosphere,
      hydrologyClimateRefineArtifactModules.climateDiagnostics,
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

export default ClimateRefineStepContract;
