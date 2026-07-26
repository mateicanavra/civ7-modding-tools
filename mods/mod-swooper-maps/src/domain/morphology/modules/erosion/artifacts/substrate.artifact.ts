import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";
import { ErodibilityFieldSchema, SedimentDepthFieldSchema } from "../../../model/atoms/index.js";

/** Registers the canonical final substrate consumed by downstream stages. */
export const artifact = defineArtifact({
  name: "substrate",
  id: "artifact:morphology.substrate",
  schema: Type.Object(
    {
      erodibilityK: ErodibilityFieldSchema,
      sedimentDepth: SedimentDepthFieldSchema,
    },
    {
      additionalProperties: false,
      description: "Final Morphology substrate consumed by landform and Ecology stages.",
    }
  ),
});
