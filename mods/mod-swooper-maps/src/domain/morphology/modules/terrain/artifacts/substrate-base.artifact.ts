import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { ErodibilityFieldSchema, SedimentDepthFieldSchema } from "../../../model/atoms/index.js";

/** Registers the base substrate consumed only by geomorphology. */
export const artifact = defineArtifact({
  name: "baseSubstrate",
  id: "artifact:morphology.substrate.base",
  schema: Type.Object(
    {
      erodibilityK: ErodibilityFieldSchema,
      sedimentDepth: SedimentDepthFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Tectonically derived substrate before geomorphic erosion.",
    }
  ),
});
