import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic vegetation-family intent selected from Ecology habitat scores and
 * occupancy truth. Map projection consumes these rows later, keeping ecotype choice separate
 * from Civ7 acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsVegetation",
  id: "artifact:ecology.featureIntents.vegetation",
  schema: Type.Array(FeaturePlacementSchema, {
    description: "Ordered vegetation feature intents admitted before Civ7 projection.",
  }),
});
