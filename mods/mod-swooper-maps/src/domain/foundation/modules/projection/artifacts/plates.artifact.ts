import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers tile-space plate identity, motion, boundary, stress, and volcanism
 * fields projected from Foundation mesh truth.
 */
export const artifact = defineArtifact({
  name: "foundationPlates",
  id: "artifact:foundation.plates",
  schema: Type.Object(
    {
      id: TypedArraySchemas.i16({ cardinality: "map-grid" }),
      boundaryCloseness: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      boundaryType: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      tectonicStress: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      upliftPotential: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      riftPotential: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      shieldStability: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      volcanism: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      movementU: TypedArraySchemas.i8({ cardinality: "map-grid" }),
      movementV: TypedArraySchemas.i8({ cardinality: "map-grid" }),
      rotation: TypedArraySchemas.i8({ cardinality: "map-grid" }),
    },
    {
      additionalProperties: false,
      description: "Plate identity, deformation, stability, and motion projected into tile space.",
    }
  ),
});
