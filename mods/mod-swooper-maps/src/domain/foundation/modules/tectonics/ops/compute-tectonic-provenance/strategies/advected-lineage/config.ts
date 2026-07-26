import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Closed configuration contract for reconstructing provenance from advected lineage. */
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
