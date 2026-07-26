import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic floodplain intent selected from Ecology score and occupancy truth.
 * Map projection consumes these rows later, keeping feature choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsFloodplains",
  id: "artifact:ecology.featureIntents.floodplains",
  schema: Type.Array(FeaturePlacementSchema, {
    description: "Ordered floodplain feature intents admitted before Civ7 projection.",
  }),
});
