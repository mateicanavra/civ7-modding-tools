import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes the exact lake mask accepted at Hydrology's Civ7 projection boundary.
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
          "Mountain-filtered Hydrology lake candidates accepted as water immediately after Civ7 stamping.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Immutable accepted-lake projection consumed by later surface-continuity checks.",
    }
  ),
});
