import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../model/atoms/index.js";

/**
 * Registers deterministic ice intent selected from Ecology score, biome, and occupancy truth.
 * Map projection consumes these rows later, keeping feature choice separate from Civ7
 * acceptance.
 */
export const artifact = defineArtifact({
  name: "featureIntentsIce",
  id: "artifact:ecology.featureIntents.ice",
  schema: Type.Array(FeaturePlacementSchema, {
    description: "Ordered ice feature intents admitted before Civ7 projection.",
  }),
});
