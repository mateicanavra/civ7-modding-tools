import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Durable deformation fields retained for one reconstructed tectonic era. */
export const TectonicHistoryEraSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    upliftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    collisionPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    subductionPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    riftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    shearStress: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    volcanism: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    fracture: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
  },
  {
    additionalProperties: false,
    description: "One reconstructed era's durable deformation and volcanic evidence.",
  }
);

/** Durable tectonic evidence retained for one reconstructed era. */
export type TectonicHistoryEra = Static<typeof TectonicHistoryEraSchema>;
