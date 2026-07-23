import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Per-cell origin and most-recent-boundary evidence reconstructed from tracers. */
export const TectonicProvenanceFieldsSchema = Type.Object(
  {
    originEra: TypedArraySchemas.u8({ cardinality: null }),
    originPlateId: TypedArraySchemas.i16({ cardinality: null }),
    lastBoundaryEra: TypedArraySchemas.u8({ cardinality: null }),
    lastBoundaryType: TypedArraySchemas.u8({ cardinality: null }),
    lastBoundaryPolarity: TypedArraySchemas.i8({ cardinality: null }),
    lastBoundaryIntensity: TypedArraySchemas.u8({ cardinality: null }),
    crustAge: TypedArraySchemas.u8({ cardinality: null }),
  },
  {
    additionalProperties: false,
    description: "Per-cell origin and most-recent-boundary evidence reconstructed from tracers.",
  }
);

/** Per-cell lineage evidence reconstructed from advected tectonic tracers. */
export type TectonicProvenanceFields = Static<typeof TectonicProvenanceFieldsSchema>;
