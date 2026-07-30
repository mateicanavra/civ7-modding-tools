import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { VegetationFeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic vegetation-family intents selected from Ecology habitat evidence after
 * all earlier feature-family intents. Map projection consumes these rows later, keeping ecotype
 * choice separate from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "vegetationIntents",
  id: "artifact:ecology.vegetationIntents",
  schema: Type.Array(VegetationFeaturePlacementSchema, {
    description: "Ordered vegetation feature intents admitted before Civ7 projection.",
  }),
  refine: (intents, { issues }) => {
    issues.addGridCoordinates("vegetationIntents", intents);
  },
});
