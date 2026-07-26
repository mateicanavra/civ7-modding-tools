import hydrology from "@mapgen/domain/hydrology";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "@mapgen/domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Hydrology refinement step with optional diagnostic projection (bounded, deterministic).
 *
 * This step refines rainfall/temperature locally (still mechanism-driven), computes land water budget indices,
 * runs bounded cryosphere feedback when enabled, and publishes refined physical artifacts.
 *
 * Configuration posture:
 * - Bound operation envelopes expose exact advanced controls.
 * - Hydrology knobs apply relative product-level transforms during step normalization.
 */
/**
 * Defines cryosphere/albedo refinement and derived climate indices over baseline climate and
 * topography. It publishes the final-refined climate surface and derived physical indices before
 * Ecology and engine projection consume the result; advisory diagnostics flow only to facets.
 */
export const config = defineStep({
  id: "climate-refine",
  description:
    "Refines precipitation, thermal, cryosphere, water-budget, and climate diagnostic evidence.",
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
});
