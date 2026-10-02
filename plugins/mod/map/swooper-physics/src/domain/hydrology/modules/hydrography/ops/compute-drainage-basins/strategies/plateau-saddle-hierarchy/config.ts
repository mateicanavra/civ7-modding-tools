import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Admits external exits explicitly; a closed map never acquires a synthetic ocean connection. */
export default defineStrategy({
  id: "plateau-saddle-hierarchy",
  config: Type.Object(
    {
      allowExternalEdgeOutlets: Type.Boolean({
        default: false,
        description: "Allows north/south boundary land to terminate externally; X always wraps.",
      }),
    },
    {
      additionalProperties: false,
      description: "Builds an elevation-cohort basin hierarchy with explicitly admitted external edge outlets.",
    }
  ),
});
