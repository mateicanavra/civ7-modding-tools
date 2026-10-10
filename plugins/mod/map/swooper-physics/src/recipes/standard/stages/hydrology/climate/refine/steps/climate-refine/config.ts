import hydrology from "../../../../../../../../domain/hydrology/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as cryosphereArtifacts } from "../../../../../../../../domain/hydrology/modules/cryosphere/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyErosionArtifacts } from "../../../../../../../../domain/morphology/modules/erosion/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Hydrology refinement step with optional diagnostic projection (bounded, deterministic).
 *
 * This step preserves atmospheric rainfall/humidity, applies albedo feedback to baseline temperature,
 * computes land water budget indices, and publishes bounded cryosphere and refined climate products.
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
    "Preserves atmospheric forcing and refines thermal, cryosphere, water-budget, and climate diagnostic evidence.",
  requires: [
    morphologyErosionArtifacts.topography,
    climateArtifacts.baselineClimateField,
    climateArtifacts.thermalField,
    climateArtifacts.windField,
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
  ],
  provides: [
    climateArtifacts.climateField,
    climateArtifacts.climateIndices,
    cryosphereArtifacts.cryosphere,
  ],

  ops: {
    applyAlbedoFeedback: hydrology.cryosphere.ops.applyAlbedoFeedback,
    computeCryosphereState: hydrology.cryosphere.ops.computeCryosphereState,
    computeLandWaterBudget: hydrology.climate.ops.computeLandWaterBudget,
    computePotentialDemand: hydrology.climate.ops.computePotentialDemand,
    computeClimateDiagnostics: hydrology.climate.ops.computeClimateDiagnostics,
  },
});
