import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { IceFeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic ice intents selected from Ecology suitability after admitted
 * floodplain intents. Map projection consumes these rows later, keeping feature choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "iceIntents",
  id: "artifact:ecology.iceIntents",
  schema: Type.Array(IceFeaturePlacementSchema, {
    description: "Ordered ice feature intents admitted before Civ7 projection.",
  }),
  refine: (intents, { issues }) => {
    issues.addGridCoordinates("iceIntents", intents);
  },
});
