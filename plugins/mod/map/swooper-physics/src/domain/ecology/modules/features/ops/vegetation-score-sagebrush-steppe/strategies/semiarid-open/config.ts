import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Projects warm semiarid conditions and sparse biomass into bounded sagebrush-steppe suitability.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "semiarid-open",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Sagebrush-steppe suitability uses fixed warm, semiarid, sparse-biomass response curves with no authored parameters.",
    }
  ),
});
