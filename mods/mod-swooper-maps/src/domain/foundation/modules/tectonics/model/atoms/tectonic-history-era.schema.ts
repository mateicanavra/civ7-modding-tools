import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Durable deformation fields retained for one reconstructed tectonic era. */
export const TectonicHistoryEraSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ cardinality: null }),
    upliftPotential: TypedArraySchemas.u8({ cardinality: null }),
    collisionPotential: TypedArraySchemas.u8({ cardinality: null }),
    subductionPotential: TypedArraySchemas.u8({ cardinality: null }),
    riftPotential: TypedArraySchemas.u8({ cardinality: null }),
    shearStress: TypedArraySchemas.u8({ cardinality: null }),
    volcanism: TypedArraySchemas.u8({ cardinality: null }),
    fracture: TypedArraySchemas.u8({ cardinality: null }),
  },
  {
    additionalProperties: false,
    description: "One reconstructed era's durable deformation and volcanic evidence.",
  }
);

/** Durable tectonic evidence retained for one reconstructed era. */
export type TectonicHistoryEra = Static<typeof TectonicHistoryEraSchema>;
