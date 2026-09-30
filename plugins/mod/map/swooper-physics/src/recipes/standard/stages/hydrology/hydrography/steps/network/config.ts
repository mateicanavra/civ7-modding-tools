import hydrology from "../../../../../../../domain/hydrology/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as landformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/** One completed physical computation publishes all mutually consistent water-network products. */
export const config = defineStep({
  id: "network",
  description:
    "Computes the basin-aware physical water network before any exposure or native projection.",
  requires: [climateArtifacts.baselineClimateField, landformsArtifacts.topography],
  provides: [
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    hydrographyArtifacts.riverNetwork,
  ],
  ops: {
    projectRiverNetwork: hydrology.hydrography.ops.projectRiverNetwork,
    computeLocalRunoff: hydrology.hydrography.ops.computeLocalRunoff,
    computeDrainageBasins: hydrology.hydrography.ops.computeDrainageBasins,
    computeBasinNetwork: hydrology.hydrography.ops.computeBasinNetwork,
    classifyBasinRiverNetwork: hydrology.hydrography.ops.classifyBasinRiverNetwork,
  },
});
