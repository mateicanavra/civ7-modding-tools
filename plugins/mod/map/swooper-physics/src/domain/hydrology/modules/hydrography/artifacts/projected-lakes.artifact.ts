import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes the physical inland-water mask accepted at Hydrology's Civ7 boundary.
 * Native isLake classification is separate and can exclude larger water bodies.
 * The mask is immutable continuity evidence, not a retained engine snapshot.
 */
export const artifact = defineArtifact({
  name: "projectedLakes",
  id: "artifact:map.hydrology.projectedLakes",
  schema: Type.Object(
    {
      lakeMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Accepted inland-water footprint: legacy filtered candidates or the complete certified physical footprint; not a claim that every cell has native isLake classification.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Immutable accepted-lake projection consumed by later surface-continuity checks.",
    }
  ),
});
