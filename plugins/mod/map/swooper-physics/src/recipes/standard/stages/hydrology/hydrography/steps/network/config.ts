import hydrology from "../../../../../../../domain/hydrology/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { artifacts as landformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

/** One completed physical computation publishes all mutually consistent water-network products. */
export const config = defineStep({
  id: "network",
  description:
    "Computes the explicitly selected physical water network before any exposure or native projection.",
  schema: Type.Object(
    {
      model: Type.Union([Type.Literal("legacy-sink-budget"), Type.Literal("certified-sill-spill")]),
    },
    { additionalProperties: false }
  ),
  requires: [climateArtifacts.baselineClimateField, landformsArtifacts.topography],
  provides: [
    hydrographyArtifacts.hydrography,
    hydrographyArtifacts.lakePlan,
    hydrographyArtifacts.riverNetwork,
  ],
  ops: {
    drainageRouting: hydrology.hydrography.ops.computeDrainageRouting,
    accumulateDischarge: hydrology.hydrography.ops.accumulateDischarge,
    projectRiverNetwork: hydrology.hydrography.ops.projectRiverNetwork,
    planLakes: hydrology.hydrography.ops.planLakes,
    classifyRiverNetwork: hydrology.hydrography.ops.classifyRiverNetwork,
    computeLocalRunoff: hydrology.hydrography.ops.computeLocalRunoff,
    computeDrainageBasins: hydrology.hydrography.ops.computeDrainageBasins,
    computeBasinNetwork: hydrology.hydrography.ops.computeBasinNetwork,
    classifyBasinRiverNetwork: hydrology.hydrography.ops.classifyBasinRiverNetwork,
  },
});
