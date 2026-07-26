import hydrology from "@mapgen/domain/hydrology";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * River projection + hydrography publication step.
 *
 * This step is where Hydrology’s discharge-derived hydrography becomes the canonical pipeline read-path.
 * Engine “modeled rivers” are projection-only and must not replace the authored source evidence.
 */
/**
 * Defines canonical drainage, discharge, and river classification from baseline climate and
 * final topography. It publishes Hydrology evidence before map-rivers performs any engine
 * projection.
 */
export const config = defineStep({
  id: "rivers",
  description:
    "Publishes hydrography and river-classification evidence before later engine projection.",
  requires: [],
  provides: [],
  artifacts: {
    requires: [climateArtifacts.baselineClimateField, morphologyLandformsArtifacts.topography],
    provides: [hydrographyArtifacts.hydrography],
  },
  ops: {
    drainageRouting: hydrology.hydrography.ops.computeDrainageRouting,
    accumulateDischarge: hydrology.hydrography.ops.accumulateDischarge,
    projectRiverNetwork: hydrology.hydrography.ops.projectRiverNetwork,
  },
});
