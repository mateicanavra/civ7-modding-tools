import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Registers Foundation's mantle-forcing artifact. */
export const artifact = defineArtifact({
  name: "foundationMantleForcing",
  id: "artifact:foundation.mantleForcing",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      cellCount: Type.Integer({ minimum: 1 }),
      stress: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      forcingU: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      forcingV: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      forcingMag: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      upwellingClass: TypedArraySchemas.i8({ cardinality: ["cellCount"] }),
      divergence: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
    },
    {
      additionalProperties: false,
      description: "Mantle velocity, stress, divergence, and vertical-motion signals by mesh cell.",
    }
  ),
});
