import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers publish-once geomorphic routing derived from carved relief before erosion.
 * Morphology erosion and landform planning consume this snapshot; Hydrology derives its
 * separate depression-conditioned drainage evidence from final Morphology topography.
 */
export const artifact = defineArtifact({
  name: "routing",
  id: "artifact:morphology.routing",
  schema: Type.Object(
    {
      flowDir: TypedArraySchemas.i32({
        cardinality: "map-grid",
        description: "Steepest-descent receiver index per tile (or -1 for sinks/edges).",
      }),
      flowAccum: TypedArraySchemas.f32({
        cardinality: "map-grid",
        description: "Drainage area proxy per tile.",
      }),
      basinId: TypedArraySchemas.i32({
        cardinality: "map-grid",
        description: "Drainage basin identifier per tile (or -1 when unassigned).",
      }),
    },
    {
      description:
        "Immutable Morphology drainage routing snapshot with one receiver and accumulation value per tile.",
    }
  ),
});
