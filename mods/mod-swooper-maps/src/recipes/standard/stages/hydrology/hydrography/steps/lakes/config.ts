import hydrology from "@mapgen/domain/hydrology";
import { artifacts as hydrographyArtifacts } from "@mapgen/domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Lake intent step contract.
 *
 * `planLakes` is declared through `contract.ops`, so the authoring layer owns
 * the op envelope and default strategy injection. The step schema stays empty
 * to avoid a second, divergent config surface for the same operation.
 */
/**
 * Defines deterministic lake intent and river-network classification from canonical hydrography and
 * topography. It plans Hydrology truth only; map-hydrology owns later Civ7 water
 * materialization.
 */
export const config = defineStep({
  id: "lakes",
  description: "Plans deterministic lake intent from admitted hydrography and topography.",
  requires: [],
  provides: [],
  artifacts: {
    requires: [morphologyLandformsArtifacts.topography, hydrographyArtifacts.hydrography],
    provides: [hydrographyArtifacts.lakePlan, hydrographyArtifacts.riverNetwork],
  },
  ops: {
    planLakes: hydrology.hydrography.ops.planLakes,
    classifyRiverNetwork: hydrology.hydrography.ops.classifyRiverNetwork,
  },
});
