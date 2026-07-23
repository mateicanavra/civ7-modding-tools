import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

/** Per-cell origin and most-recent-boundary evidence reconstructed from tracers. */
export const TectonicProvenanceFieldsSchema = Type.Object(
  {
    originEra: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    originPlateId: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
    lastBoundaryEra: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    lastBoundaryType: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    lastBoundaryPolarity: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
    lastBoundaryIntensity: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    crustAge: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
  },
  {
    additionalProperties: false,
    description: "Per-cell origin and most-recent-boundary evidence reconstructed from tracers.",
  }
);

/** Per-cell lineage evidence reconstructed from advected tectonic tracers. */
export type TectonicProvenanceFields = Static<typeof TectonicProvenanceFieldsSchema>;
