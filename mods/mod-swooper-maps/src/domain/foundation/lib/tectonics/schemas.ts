import { TypedArraySchemas, Type } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";

const EraFieldsSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({ shape: null, description: "Boundary regime per mesh cell (BOUNDARY_TYPE values)." }),
    upliftPotential: TypedArraySchemas.u8({ shape: null, description: "Uplift potential per mesh cell (0..255)." }),
    collisionPotential: TypedArraySchemas.u8({
      shape: null,
      description: "Collision-driven uplift potential per mesh cell (0..255).",
    }),
    subductionPotential: TypedArraySchemas.u8({
      shape: null,
      description: "Subduction-driven uplift potential per mesh cell (0..255).",
    }),
    riftPotential: TypedArraySchemas.u8({ shape: null, description: "Rift potential per mesh cell (0..255)." }),
    shearStress: TypedArraySchemas.u8({ shape: null, description: "Shear stress per mesh cell (0..255)." }),
    volcanism: TypedArraySchemas.u8({ shape: null, description: "Volcanism potential per mesh cell (0..255)." }),
    fracture: TypedArraySchemas.u8({ shape: null, description: "Fracture potential per mesh cell (0..255)." }),
  },
  { additionalProperties: false }
);

export const FoundationTectonicHistorySchema = Type.Object(
  {
    eraCount: Type.Integer({ minimum: 5, maximum: 8 }),
    eras: Type.Immutable(Type.Array(EraFieldsSchema, { description: "Era fields (oldest→newest)." })),
    plateIdByEra: Type.Immutable(
      Type.Array(TypedArraySchemas.i16({ shape: null, description: "Plate id per mesh cell for the era." }), {
        description: "Era plate membership (oldest→newest).",
      })
    ),
    upliftTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated uplift across eras (0..255)." }),
    collisionTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated collision uplift across eras (0..255)." }),
    subductionTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated subduction uplift across eras (0..255)." }),
    fractureTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated fracture across eras (0..255)." }),
    volcanismTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated volcanism across eras (0..255)." }),
    upliftRecentFraction: TypedArraySchemas.u8({
      shape: null,
      description: "Fraction of total uplift contributed by newest era (0..255).",
    }),
    collisionRecentFraction: TypedArraySchemas.u8({
      shape: null,
      description: "Fraction of collision uplift contributed by newest era (0..255).",
    }),
    subductionRecentFraction: TypedArraySchemas.u8({
      shape: null,
      description: "Fraction of subduction uplift contributed by newest era (0..255).",
    }),
    lastActiveEra: TypedArraySchemas.u8({
      shape: null,
      description: "Most recent active era index per cell (0..eraCount-1), or 255 when never active.",
    }),
    lastCollisionEra: TypedArraySchemas.u8({
      shape: null,
      description: "Most recent collision-active era index per cell (0..eraCount-1), or 255 when never collision-active.",
    }),
    lastSubductionEra: TypedArraySchemas.u8({
      shape: null,
      description:
        "Most recent subduction-active era index per cell (0..eraCount-1), or 255 when never subduction-active.",
    }),
  },
  { additionalProperties: false }
);

export const FoundationTectonicsSchema = Type.Object(
  {
    boundaryType: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary type per mesh cell (BOUNDARY_TYPE values; 0 when non-boundary/unknown).",
    }),
    upliftPotential: TypedArraySchemas.u8({ shape: null, description: "Uplift potential per mesh cell (0..255)." }),
    riftPotential: TypedArraySchemas.u8({ shape: null, description: "Rift potential per mesh cell (0..255)." }),
    shearStress: TypedArraySchemas.u8({ shape: null, description: "Shear stress per mesh cell (0..255)." }),
    volcanism: TypedArraySchemas.u8({ shape: null, description: "Volcanism per mesh cell (0..255)." }),
    fracture: TypedArraySchemas.u8({ shape: null, description: "Fracture potential per mesh cell (0..255)." }),
    cumulativeUplift: TypedArraySchemas.u8({
      shape: null,
      description: "Accumulated uplift per mesh cell (0..255).",
    }),
  },
  { additionalProperties: false }
);

const FoundationTectonicProvenanceScalarsSchema = Type.Object(
  {
    originEra: TypedArraySchemas.u8({
      shape: null,
      description: "Era index of first appearance per mesh cell (0..eraCount-1).",
    }),
    originPlateId: TypedArraySchemas.i16({
      shape: null,
      description: "Origin plate id per mesh cell (plate id; -1 for unknown).",
    }),
    lastBoundaryEra: TypedArraySchemas.u8({
      shape: null,
      description: "Era index of most recent boundary event per mesh cell (255 = none).",
    }),
    lastBoundaryType: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none).",
    }),
    lastBoundaryPolarity: TypedArraySchemas.i8({
      shape: null,
      description: "Boundary polarity associated with lastBoundaryEra (-1, 0, +1).",
    }),
    lastBoundaryIntensity: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary intensity associated with lastBoundaryEra (0..255).",
    }),
    crustAge: TypedArraySchemas.u8({
      shape: null,
      description: "Normalized crust age per mesh cell (0=new, 255=ancient).",
    }),
  },
  { description: "Foundation provenance scalars payload (per-cell, newest-era state)." }
);

export const FoundationTectonicProvenanceSchema = Type.Object(
  {
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    eraCount: Type.Integer({ minimum: 5, maximum: 8, description: "Number of eras included in the provenance payload." }),
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    tracerIndex: Type.Immutable(
      Type.Array(
        TypedArraySchemas.u32({
          shape: null,
          description: "Tracer source cell index per mesh cell (length = cellCount).",
        }),
        { description: "Per-era tracer indices (length = eraCount; each entry length = cellCount)." }
      )
    ),
    provenance: FoundationTectonicProvenanceScalarsSchema,
  },
  { additionalProperties: false, description: "Foundation tectonic provenance payload (tracer history + scalars)." }
);

export type FoundationTectonicHistory = Static<typeof FoundationTectonicHistorySchema>;
export type FoundationTectonics = Static<typeof FoundationTectonicsSchema>;
export type FoundationTectonicProvenance = Static<typeof FoundationTectonicProvenanceSchema>;
