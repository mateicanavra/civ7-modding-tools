import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic wetland-family intent selected from Ecology score, hydrology, and
 * occupancy truth. Map projection consumes these rows later, keeping habitat choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsWetlands",
  id: "artifact:ecology.featureIntents.wetlands",
  schema: Type.Array(FeaturePlacementSchema, {
    description: "Ordered wetland-family feature intents admitted before Civ7 projection.",
  }),
});
