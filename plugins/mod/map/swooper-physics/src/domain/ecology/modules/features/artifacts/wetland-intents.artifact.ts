import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { WetlandFeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic wetland-family intents selected from Ecology and hydrology evidence
 * after admitted floodplain, ice, and reef intents. Map projection consumes these rows later,
 * keeping habitat choice separate from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "wetlandIntents",
  id: "artifact:ecology.wetlandIntents",
  schema: Type.Array(WetlandFeaturePlacementSchema, {
    description: "Ordered wetland-family feature intents admitted before Civ7 projection.",
  }),
  refine: (intents, { issues }) => {
    issues.addGridCoordinates("wetlandIntents", intents);
  },
});
