import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Closed configuration contract for advecting tracers with reconstructed boundary drift. */
export default defineStrategy({
  id: "boundary-drift",
  config: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Tracer lineage follows reconstructed plate-boundary drift and exposes no authored parameters.",
    }
  ),
});
