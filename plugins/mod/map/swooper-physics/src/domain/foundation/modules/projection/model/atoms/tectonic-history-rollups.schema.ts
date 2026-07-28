import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Cumulative, recency, and plate-motion fields projected into map-tile space. */
export const ProjectedTectonicHistoryRollupsSchema = Type.Object(
  {
    upliftTotal: TypedArraySchemas.u8(),
    collisionTotal: TypedArraySchemas.u8(),
    subductionTotal: TypedArraySchemas.u8(),
    fractureTotal: TypedArraySchemas.u8(),
    volcanismTotal: TypedArraySchemas.u8(),
    upliftRecentFraction: TypedArraySchemas.u8(),
    collisionRecentFraction: TypedArraySchemas.u8(),
    subductionRecentFraction: TypedArraySchemas.u8(),
    lastActiveEra: TypedArraySchemas.u8(),
    lastCollisionEra: TypedArraySchemas.u8(),
    lastSubductionEra: TypedArraySchemas.u8(),
    movementU: TypedArraySchemas.i8(),
    movementV: TypedArraySchemas.i8(),
  },
  {
    additionalProperties: false,
    description: "Cumulative, recency, and plate-motion fields projected into map-tile space.",
  }
);

/** Tile-space rollups derived across all reconstructed tectonic eras. */
export type ProjectedTectonicHistoryRollups = Static<typeof ProjectedTectonicHistoryRollupsSchema>;
