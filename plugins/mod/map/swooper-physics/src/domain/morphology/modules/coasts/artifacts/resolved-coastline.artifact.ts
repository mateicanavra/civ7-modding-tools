import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Final dry/wet shoreline, distinct from the initial geometry used by atmospheric forcing. */
export const artifact = defineArtifact({
  name: "resolvedCoastline",
  id: "artifact:morphology.resolvedCoastline",
  schema: Type.Object({
    coastalLand: TypedArraySchemas.u8({ cardinality: "map-grid", description: "Resolved dry ground adjacent to final water." }),
    coastalWater: TypedArraySchemas.u8({ cardinality: "map-grid", description: "Final external or finite water adjacent to resolved dry ground." }),
    distanceToCoast: TypedArraySchemas.u16({ cardinality: "map-grid", description: "Wrapped-hex distance in tiles to the resolved shoreline." }),
  }, { additionalProperties: false }),
});
