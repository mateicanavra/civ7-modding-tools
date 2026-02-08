import { TypedArraySchemas, Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static } from "@swooper/mapgen-core/authoring";
import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationMantleForcingSchema } from "../compute-mantle-forcing/contract.js";
import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationPlateGraphSchema } from "../compute-plate-graph/contract.js";
import { FoundationPlateMotionSchema } from "../compute-plate-motion/contract.js";
import { FoundationTectonicSegmentsSchema } from "../compute-tectonic-segments/contract.js";

const StrategySchema = Type.Object(
  {
    eraWeights: Type.Array(Type.Number({ minimum: 0, maximum: 10 }), {
      default: [0.3, 0.25, 0.2, 0.15, 0.1],
      minItems: 5,
      maxItems: 8,
      description: "Per-era weight multipliers (oldest→newest). Array length defines eraCount (5..8).",
    }),
    driftStepsByEra: Type.Array(Type.Integer({ minimum: 0, maximum: 16 }), {
      default: [12, 9, 6, 3, 1],
      minItems: 5,
      maxItems: 8,
      description:
        "How many discrete neighbor steps to drift segment seeds per era (oldest→newest). Array length defines eraCount (5..8).",
    }),
    beltInfluenceDistance: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description: "Maximum belt influence distance in mesh-neighbor steps.",
    }),
    beltDecay: Type.Number({
      default: 0.55,
      minimum: 0.01,
      maximum: 10,
      description: "Exponential decay coefficient for belt influence per mesh-neighbor step.",
    }),
    activityThreshold: Type.Integer({
      default: 1,
      minimum: 0,
      maximum: 255,
      description: "Threshold used to compute lastActiveEra (0..255).",
    }),
  },
  { additionalProperties: false }
);

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

/** Foundation provenance scalars payload (per-cell, newest-era state). */
const FoundationTectonicProvenanceScalarsSchema = Type.Object(
  {
    /** Era index of first appearance per mesh cell (0..eraCount-1). */
    originEra: TypedArraySchemas.u8({
      shape: null,
      description: "Era index of first appearance per mesh cell (0..eraCount-1).",
    }),
    /** Origin plate id per mesh cell (plate id; -1 for unknown). */
    originPlateId: TypedArraySchemas.i16({
      shape: null,
      description: "Origin plate id per mesh cell (plate id; -1 for unknown).",
    }),
    /** Era index of most recent boundary event per mesh cell (255 = none). */
    lastBoundaryEra: TypedArraySchemas.u8({
      shape: null,
      description: "Era index of most recent boundary event per mesh cell (255 = none).",
    }),
    /** Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none). */
    lastBoundaryType: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none).",
    }),
    /** Boundary polarity associated with lastBoundaryEra (-1, 0, +1). */
    lastBoundaryPolarity: TypedArraySchemas.i8({
      shape: null,
      description: "Boundary polarity associated with lastBoundaryEra (-1, 0, +1).",
    }),
    /** Boundary intensity associated with lastBoundaryEra (0..255). */
    lastBoundaryIntensity: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary intensity associated with lastBoundaryEra (0..255).",
    }),
    /** Normalized crust age per mesh cell (0=new, 255=ancient). */
    crustAge: TypedArraySchemas.u8({
      shape: null,
      description: "Normalized crust age per mesh cell (0=new, 255=ancient).",
    }),
  },
  { description: "Foundation provenance scalars payload (per-cell, newest-era state)." }
);

/** Foundation tectonic provenance payload (tracer history + scalars). */
export const FoundationTectonicProvenanceSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of eras included in the provenance payload. */
    eraCount: Type.Integer({ minimum: 5, maximum: 8, description: "Number of eras included in the provenance payload." }),
    /** Number of mesh cells. */
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    /** Per-era tracer indices (length = eraCount; each entry length = cellCount). */
    tracerIndex: Type.Immutable(
      Type.Array(
        TypedArraySchemas.u32({
          shape: null,
          description: "Tracer source cell index per mesh cell (length = cellCount).",
        }),
        { description: "Per-era tracer indices (length = eraCount; each entry length = cellCount)." }
      )
    ),
    /** Provenance scalars (final state at newest era). */
    provenance: FoundationTectonicProvenanceScalarsSchema,
  },
  { additionalProperties: false, description: "Foundation tectonic provenance payload (tracer history + scalars)." }
);

const ComputeTectonicHistoryContract = defineOp({
  kind: "compute",
  id: "foundation/compute-tectonic-history",
  input: Type.Object(
    {
      mesh: FoundationMeshSchema,
      crust: FoundationCrustSchema,
      mantleForcing: FoundationMantleForcingSchema,
      plateGraph: FoundationPlateGraphSchema,
      plateMotion: FoundationPlateMotionSchema,
      segments: FoundationTectonicSegmentsSchema,
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      tectonicHistory: FoundationTectonicHistorySchema,
      tectonics: FoundationTectonicsSchema,
      tectonicProvenance: FoundationTectonicProvenanceSchema,
    },
    { additionalProperties: false }
  ),
  strategies: {
    default: StrategySchema,
  },
});

export default ComputeTectonicHistoryContract;
export type ComputeTectonicHistoryConfig = Static<typeof StrategySchema>;
export type FoundationTectonicHistory = Static<typeof FoundationTectonicHistorySchema>;
export type FoundationTectonics = Static<typeof FoundationTectonicsSchema>;
export type FoundationTectonicProvenance = Static<typeof FoundationTectonicProvenanceSchema>;
