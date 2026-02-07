import { TypedArraySchemas, Type, defineOp } from "@swooper/mapgen-core/authoring";
import type { Static, TSchema } from "@swooper/mapgen-core/authoring";

import { FoundationMeshSchema } from "../compute-mesh/contract.js";
import { FoundationCrustSchema } from "../compute-crust/contract.js";
import { FoundationPlateGraphSchema } from "../compute-plate-graph/contract.js";
import { FoundationPlateMotionSchema } from "../compute-plate-motion/contract.js";
import { FoundationTectonicHistorySchema, FoundationTectonicsSchema } from "../compute-tectonic-history/contract.js";

function withDescription<T extends TSchema>(schema: T, description: string) {
  const { additionalProperties: _additionalProperties, default: _default, ...rest } = schema as any;
  return Type.Unsafe<Static<T>>({ ...rest, description } as any);
}

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
const FoundationTectonicProvenanceSchema = Type.Object(
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

/** Default strategy configuration for computing tile-space plate tensors. */
const StrategySchema = Type.Object(
  {
    /** Tile-distance influence radius for boundary closeness. */
    boundaryInfluenceDistance: Type.Integer({
      default: 5,
      minimum: 1,
      maximum: 32,
      description: "Tile-distance influence radius for boundary closeness.",
    }),
    /** Exponential decay applied to boundary closeness by distance. */
    boundaryDecay: Type.Number({
      default: 0.55,
      minimum: 0.05,
      maximum: 1,
      description: "Exponential decay applied to boundary closeness by distance.",
    }),
    /** Scale factor mapping plate velocity to int8 tile fields. */
    movementScale: Type.Number({
      default: 100,
      minimum: 1,
      maximum: 200,
      description: "Scale factor mapping plate velocity to int8 tile fields.",
    }),
    /** Scale factor mapping plate rotation to int8 tile fields. */
    rotationScale: Type.Number({
      default: 100,
      minimum: 1,
      maximum: 200,
      description: "Scale factor mapping plate rotation to int8 tile fields.",
    }),
  },
  { description: "Default strategy configuration for computing tile-space plate tensors." }
);

/** Input payload for foundation/compute-plates-tensors. */
const InputSchema = Type.Object(
  {
    /** Map width in tiles. */
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    /** Map height in tiles. */
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    /** Foundation mesh (cells, adjacency, site coordinates). */
    mesh: withDescription(FoundationMeshSchema, "Foundation mesh (cells, adjacency, site coordinates)."),
    /** Crust truth + derived drivers (maturity/thickness/thermalAge/damage + type/age/buoyancy/baseElevation/strength) per mesh cell. */
    crust: withDescription(
      FoundationCrustSchema,
      "Crust truth + derived drivers (maturity/thickness/thermalAge/damage + type/age/buoyancy/baseElevation/strength) per mesh cell."
    ),
    /** Plate graph per mesh cell (cellToPlate + per-plate metadata). */
    plateGraph: withDescription(
      FoundationPlateGraphSchema,
      "Plate graph per mesh cell (cellToPlate + per-plate metadata)."
    ),
    /** Plate motion per plate (mantle-derived translation + rotation). */
    plateMotion: withDescription(
      FoundationPlateMotionSchema,
      "Plate motion per plate (mantle-derived translation + rotation)."
    ),
    /** Tectonic drivers per mesh cell (boundary regime + stress/potential tensors). */
    tectonics: withDescription(
      FoundationTectonicsSchema,
      "Tectonic drivers per mesh cell (boundary regime + stress/potential tensors)."
    ),
    /** Tectonic history per mesh cell (per-era fields + rollups). */
    tectonicHistory: withDescription(
      FoundationTectonicHistorySchema,
      "Tectonic history per mesh cell (per-era fields + rollups)."
    ),
    /** Optional tectonic provenance payload (tracer history + scalars). */
    tectonicProvenance: Type.Optional(
      withDescription(FoundationTectonicProvenanceSchema, "Optional tectonic provenance payload (tracer history + scalars).")
    ),
  },
  { description: "Input payload for foundation/compute-plates-tensors." }
);

/** Crust drivers per tile, sampled via tileToCellIndex. */
const CrustTilesSchema = Type.Object(
  {
    /** Crust type per tile (0=oceanic, 1=continental), sampled via tileToCellIndex. */
    type: TypedArraySchemas.u8({
      description: "Crust type per tile (0=oceanic, 1=continental), sampled via tileToCellIndex.",
    }),
    /** Crust thermal age per tile (0=new, 255=ancient), sampled via tileToCellIndex. */
    age: TypedArraySchemas.u8({
      description: "Crust thermal age per tile (0=new, 255=ancient), sampled via tileToCellIndex.",
    }),
    /** Crust buoyancy proxy per tile (0..1), sampled via tileToCellIndex. */
    buoyancy: TypedArraySchemas.f32({
      description: "Crust buoyancy proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Isostatic base elevation proxy per tile (0..1), sampled via tileToCellIndex. */
    baseElevation: TypedArraySchemas.f32({
      description: "Isostatic base elevation proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Lithospheric strength proxy per tile (0..1), sampled via tileToCellIndex. */
    strength: TypedArraySchemas.f32({
      description: "Lithospheric strength proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
  },
  { description: "Crust drivers per tile, sampled via tileToCellIndex." }
);

/** Plate tensors per tile (id + boundary regime + potentials + motion fields). */
const PlatesTilesSchema = Type.Object(
  {
    /** Plate id per tile. */
    id: TypedArraySchemas.i16({ description: "Plate id per tile." }),
    /** Boundary proximity per tile (0..255). */
    boundaryCloseness: TypedArraySchemas.u8({ description: "Boundary proximity per tile (0..255)." }),
    /** Boundary regime per tile (BOUNDARY_TYPE values), sampled from mesh-space Foundation tectonics. */
    boundaryType: TypedArraySchemas.u8({
      description:
        "Boundary regime per tile (BOUNDARY_TYPE values), sampled from mesh-space Foundation tectonics.",
    }),
    /** Tectonic stress per tile (0..255). */
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    /** Shield stability per tile (0..255). */
    shieldStability: TypedArraySchemas.u8({ description: "Shield stability per tile (0..255)." }),
    /** Volcanism per tile (0..255). */
    volcanism: TypedArraySchemas.u8({ description: "Volcanism per tile (0..255)." }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({ description: "Plate movement U component per tile (-127..127)." }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({ description: "Plate movement V component per tile (-127..127)." }),
    /** Plate rotation per tile (-127..127). */
    rotation: TypedArraySchemas.i8({ description: "Plate rotation per tile (-127..127)." }),
  },
  { description: "Plate tensors per tile (id + boundary regime + potentials + motion fields)." }
);

/** Foundation tectonic history tiles era payload (tile-space per-era fields). */
const TectonicHistoryTilesEraSchema = Type.Object(
  {
    /** Boundary regime per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({ description: "Boundary regime per tile (BOUNDARY_TYPE values)." }),
    /** Convergent mask per tile (0/1). */
    convergentMask: TypedArraySchemas.u8({ description: "Convergent mask per tile (0/1)." }),
    /** Divergent mask per tile (0/1). */
    divergentMask: TypedArraySchemas.u8({ description: "Divergent mask per tile (0/1)." }),
    /** Transform mask per tile (0/1). */
    transformMask: TypedArraySchemas.u8({ description: "Transform mask per tile (0/1)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    /** Shear stress per tile (0..255). */
    shearStress: TypedArraySchemas.u8({ description: "Shear stress per tile (0..255)." }),
    /** Volcanism per tile (0..255). */
    volcanism: TypedArraySchemas.u8({ description: "Volcanism per tile (0..255)." }),
    /** Fracture potential per tile (0..255). */
    fracture: TypedArraySchemas.u8({ description: "Fracture potential per tile (0..255)." }),
  },
  { description: "Foundation tectonic history tiles era payload (tile-space per-era fields)." }
);

/** Foundation tectonic history tiles rollup payload (tile-space rollups). */
const TectonicHistoryTilesRollupSchema = Type.Object(
  {
    /** Accumulated uplift total per tile (0..255). */
    upliftTotal: TypedArraySchemas.u8({ description: "Accumulated uplift total per tile (0..255)." }),
    /** Accumulated fracture total per tile (0..255). */
    fractureTotal: TypedArraySchemas.u8({ description: "Accumulated fracture total per tile (0..255)." }),
    /** Accumulated volcanism total per tile (0..255). */
    volcanismTotal: TypedArraySchemas.u8({ description: "Accumulated volcanism total per tile (0..255)." }),
    /** Fraction of uplift attributable to recent eras per tile (0..255). */
    upliftRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of uplift attributable to recent eras per tile (0..255).",
    }),
    /** Last active era index per tile (0..255; 255 = never). */
    lastActiveEra: TypedArraySchemas.u8({ description: "Last active era index per tile (0..255; 255 = never)." }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({ description: "Plate movement U component per tile (-127..127)." }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({ description: "Plate movement V component per tile (-127..127)." }),
  },
  { description: "Foundation tectonic history tiles rollup payload (tile-space rollups)." }
);

/** Foundation tectonic history tiles artifact payload (tile-space era fields + rollups). */
const TectonicHistoryTilesSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of eras included in the history tiles payload. */
    eraCount: Type.Integer({ minimum: 5, maximum: 8, description: "Number of eras included in the history tiles payload." }),
    /** Per-era tile fields (length = eraCount). */
    perEra: Type.Immutable(
      Type.Array(TectonicHistoryTilesEraSchema, {
        description: "Per-era tile fields (length = eraCount).",
      })
    ),
    /** Rollup fields across eras. */
    rollups: TectonicHistoryTilesRollupSchema,
  },
  { description: "Foundation tectonic history tiles artifact payload (tile-space era fields + rollups)." }
);

/** Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars). */
const TectonicProvenanceTilesSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Era index of first appearance per tile (0..eraCount-1). */
    originEra: TypedArraySchemas.u8({ description: "Era index of first appearance per tile (0..eraCount-1)." }),
    /** Origin plate id per tile (plate id; -1 for unknown). */
    originPlateId: TypedArraySchemas.i16({ description: "Origin plate id per tile (plate id; -1 for unknown)." }),
    /** Drift distance bucket per tile (0..255). */
    driftDistance: TypedArraySchemas.u8({ description: "Drift distance bucket per tile (0..255)." }),
    /** Era index of most recent boundary event per tile (255 = none). */
    lastBoundaryEra: TypedArraySchemas.u8({
      description: "Era index of most recent boundary event per tile (255 = none).",
    }),
    /** Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none). */
    lastBoundaryType: TypedArraySchemas.u8({
      description: "Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none).",
    }),
  },
  { description: "Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars)." }
);

/** Output payload for foundation/compute-plates-tensors. */
const OutputSchema = Type.Object(
  {
    /** Nearest mesh cellIndex per tileIndex (canonical mesh→tile projection mapping). */
    tileToCellIndex: TypedArraySchemas.i32({
      description: "Nearest mesh cellIndex per tileIndex (canonical mesh→tile projection mapping).",
    }),
    /** Crust drivers per tile, sampled via tileToCellIndex. */
    crustTiles: CrustTilesSchema,
    /** Plate tensors per tile (id + boundary regime + potentials + motion fields). */
    plates: PlatesTilesSchema,
    /** Tectonic history tiles (per-era fields + rollups). */
    tectonicHistoryTiles: TectonicHistoryTilesSchema,
    /** Tectonic provenance tiles (provenance scalars). */
    tectonicProvenanceTiles: TectonicProvenanceTilesSchema,
  },
  { description: "Output payload for foundation/compute-plates-tensors." }
);

const ComputePlatesTensorsContract = defineOp({
  kind: "compute",
  id: "foundation/compute-plates-tensors",
  input: InputSchema,
  output: OutputSchema,
  strategies: {
    default: StrategySchema,
  },
});

export default ComputePlatesTensorsContract;
export type ComputePlatesTensorsConfig = Static<typeof StrategySchema>;
export type FoundationTectonicProvenance = Static<typeof FoundationTectonicProvenanceSchema>;
export type FoundationTectonicHistoryTiles = Static<typeof TectonicHistoryTilesSchema>;
export type FoundationTectonicProvenanceTiles = Static<typeof TectonicProvenanceTilesSchema>;
