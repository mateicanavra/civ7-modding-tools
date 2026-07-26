import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { ReefFeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic reef-family intents selected from Ecology suitability after admitted
 * floodplain and ice intents. Map projection consumes these rows later, keeping habitat choice
 * separate from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "reefIntents",
  id: "artifact:ecology.reefIntents",
  schema: Type.Array(ReefFeaturePlacementSchema, {
    description: "Ordered reef-family feature intents admitted before Civ7 projection.",
  }),
  refine: (intents, { issues }) => {
    issues.addGridCoordinates("reefIntents", intents);
  },
});
