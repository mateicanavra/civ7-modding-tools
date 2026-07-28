import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Declares a parameter-free provenance posture: admitted tracer history, plate graph, and era
 * fields fully determine lineage and boundary resets.
 */
export default defineStrategy({
  id: "advected-lineage",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Tectonic provenance follows advected tracer lineage and boundary encounters with no authored parameters.",
    }
  ),
});
