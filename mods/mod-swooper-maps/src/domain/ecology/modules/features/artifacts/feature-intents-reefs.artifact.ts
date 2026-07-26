import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic reef-family intent selected from Ecology score and occupancy truth.
 * Map projection consumes these rows later, keeping habitat choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsReefs",
  id: "artifact:ecology.featureIntents.reefs",
  schema: Type.Array(FeaturePlacementSchema, {
    description: "Ordered reef-family feature intents admitted before Civ7 projection.",
  }),
});
