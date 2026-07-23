import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** One reconstructed era's tectonic fields projected into map-tile space. */
export const ProjectedTectonicHistoryEraSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8(),
    convergentMask: TypedArraySchemas.u8(),
    divergentMask: TypedArraySchemas.u8(),
    transformMask: TypedArraySchemas.u8(),
    upliftPotential: TypedArraySchemas.u8(),
    collisionPotential: TypedArraySchemas.u8(),
    subductionPotential: TypedArraySchemas.u8(),
    riftPotential: TypedArraySchemas.u8(),
    shearStress: TypedArraySchemas.u8(),
    volcanism: TypedArraySchemas.u8(),
    fracture: TypedArraySchemas.u8(),
  },
  {
    additionalProperties: false,
    description: "One reconstructed era's tectonic fields projected into map-tile space.",
  }
);

/** Tile-space tectonic evidence for one reconstructed era. */
export type ProjectedTectonicHistoryEra = Static<typeof ProjectedTectonicHistoryEraSchema>;
