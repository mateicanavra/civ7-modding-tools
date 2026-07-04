import {
  crustArtifact,
  crustInitArtifact,
  mantleForcingArtifact,
  mantlePotentialArtifact,
  meshArtifact,
  plateGraphArtifact,
  plateMotionArtifact,
  plateTopologyArtifact,
  tectonicsArtifact,
  tectonicHistoryArtifact,
  tectonicProvenanceArtifact,
  tectonicSegmentsArtifact,
} from "@mapgen/domain/foundation";
import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Foundation plates artifact payload (tile-space plate tensors). */
export const FoundationPlatesArtifactSchema = Type.Object(
  {
    /** Plate id per tile. */
    id: TypedArraySchemas.i16({ description: "Plate id per tile." }),
    /** Boundary proximity per tile (0..255). */
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    /** Boundary type per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
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
    movementU: TypedArraySchemas.i8({
      description: "Plate movement U component per tile (-127..127).",
    }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({
      description: "Plate movement V component per tile (-127..127).",
    }),
    /** Plate rotation per tile (-127..127). */
    rotation: TypedArraySchemas.i8({ description: "Plate rotation per tile (-127..127)." }),
  },
  { description: "Foundation plates artifact payload (tile-space plate tensors)." }
);

/** Nearest mesh cellIndex per tileIndex (canonical mesh→tile projection mapping). */
export const FoundationTileToCellIndexArtifactSchema = TypedArraySchemas.i32({
  shape: null,
  description: "Nearest mesh cellIndex per tileIndex (canonical mesh→tile projection mapping).",
});

/** Foundation crust tiles artifact payload (tile-space crust driver tensors). */
export const FoundationCrustTilesArtifactSchema = Type.Object(
  {
    /** Crust type per tile (0=oceanic, 1=continental), sampled via tileToCellIndex. */
    type: TypedArraySchemas.u8({
      shape: null,
      description: "Crust type per tile (0=oceanic, 1=continental), sampled via tileToCellIndex.",
    }),
    /** Crust maturity per tile (0=basaltic lid, 1=cratonic), sampled via tileToCellIndex. */
    maturity: TypedArraySchemas.f32({
      shape: null,
      description:
        "Crust maturity per tile (0=basaltic lid, 1=cratonic), sampled via tileToCellIndex.",
    }),
    /** Crust thickness proxy per tile (0..1), sampled via tileToCellIndex. */
    thickness: TypedArraySchemas.f32({
      shape: null,
      description: "Crust thickness proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Crust damage per tile (0..255), sampled via tileToCellIndex. */
    damage: TypedArraySchemas.u8({
      shape: null,
      description: "Crust damage per tile (0..255), sampled via tileToCellIndex.",
    }),
    /** Crust age per tile (0=new, 255=ancient), sampled via tileToCellIndex. */
    age: TypedArraySchemas.u8({
      shape: null,
      description: "Crust thermal age per tile (0=new, 255=ancient), sampled via tileToCellIndex.",
    }),
    /** Crust buoyancy proxy per tile (0..1), sampled via tileToCellIndex. */
    buoyancy: TypedArraySchemas.f32({
      shape: null,
      description: "Crust buoyancy proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Isostatic base elevation proxy per tile (0..1), sampled via tileToCellIndex. */
    baseElevation: TypedArraySchemas.f32({
      shape: null,
      description: "Isostatic base elevation proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
    /** Lithospheric strength proxy per tile (0..1), sampled via tileToCellIndex. */
    strength: TypedArraySchemas.f32({
      shape: null,
      description: "Lithospheric strength proxy per tile (0..1), sampled via tileToCellIndex.",
    }),
  },
  { description: "Foundation crust tiles artifact payload (tile-space crust driver tensors)." }
);

/** Foundation tectonic history tiles era payload (tile-space era fields). */
const FoundationTectonicHistoryTilesEraArtifactSchema = Type.Object(
  {
    /** Boundary type per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
    }),
    /** Convergent mask per tile (0/1). */
    convergentMask: TypedArraySchemas.u8({ description: "Convergent mask per tile (0/1)." }),
    /** Divergent mask per tile (0/1). */
    divergentMask: TypedArraySchemas.u8({ description: "Divergent mask per tile (0/1)." }),
    /** Transform mask per tile (0/1). */
    transformMask: TypedArraySchemas.u8({ description: "Transform mask per tile (0/1)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Collision-driven uplift potential per tile (0..255). */
    collisionPotential: TypedArraySchemas.u8({
      description: "Collision-driven uplift potential per tile (0..255).",
    }),
    /** Subduction-driven uplift potential per tile (0..255). */
    subductionPotential: TypedArraySchemas.u8({
      description: "Subduction-driven uplift potential per tile (0..255).",
    }),
    /** Rift potential per tile (0..255). */
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    /** Shear stress per tile (0..255). */
    shearStress: TypedArraySchemas.u8({ description: "Shear stress per tile (0..255)." }),
    /** Volcanism per tile (0..255). */
    volcanism: TypedArraySchemas.u8({ description: "Volcanism per tile (0..255)." }),
    /** Fracture potential per tile (0..255). */
    fracture: TypedArraySchemas.u8({ description: "Fracture potential per tile (0..255)." }),
  },
  { description: "Foundation tectonic history tiles era payload (tile-space era fields)." }
);

/** Foundation tectonic history tiles rollup payload (tile-space rollups). */
const FoundationTectonicHistoryTilesRollupArtifactSchema = Type.Object(
  {
    /** Accumulated uplift total per tile (0..255). */
    upliftTotal: TypedArraySchemas.u8({
      description: "Accumulated uplift total per tile (0..255).",
    }),
    /** Accumulated collision uplift total per tile (0..255). */
    collisionTotal: TypedArraySchemas.u8({
      description: "Accumulated collision uplift total per tile (0..255).",
    }),
    /** Accumulated subduction uplift total per tile (0..255). */
    subductionTotal: TypedArraySchemas.u8({
      description: "Accumulated subduction uplift total per tile (0..255).",
    }),
    /** Accumulated fracture total per tile (0..255). */
    fractureTotal: TypedArraySchemas.u8({
      description: "Accumulated fracture total per tile (0..255).",
    }),
    /** Accumulated volcanism total per tile (0..255). */
    volcanismTotal: TypedArraySchemas.u8({
      description: "Accumulated volcanism total per tile (0..255).",
    }),
    /** Fraction of uplift attributable to recent eras per tile (0..255). */
    upliftRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of uplift attributable to recent eras per tile (0..255).",
    }),
    /** Fraction of collision uplift attributable to recent eras per tile (0..255). */
    collisionRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of collision uplift attributable to recent eras per tile (0..255).",
    }),
    /** Fraction of subduction uplift attributable to recent eras per tile (0..255). */
    subductionRecentFraction: TypedArraySchemas.u8({
      description: "Fraction of subduction uplift attributable to recent eras per tile (0..255).",
    }),
    /** Last active era index per tile (0..255; 255 = never). */
    lastActiveEra: TypedArraySchemas.u8({
      description: "Last active era index per tile (0..255; 255 = never).",
    }),
    /** Last collision-active era index per tile (0..255; 255 = never). */
    lastCollisionEra: TypedArraySchemas.u8({
      description: "Last collision-active era index per tile (0..255; 255 = never).",
    }),
    /** Last subduction-active era index per tile (0..255; 255 = never). */
    lastSubductionEra: TypedArraySchemas.u8({
      description: "Last subduction-active era index per tile (0..255; 255 = never).",
    }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({
      description: "Plate movement U component per tile (-127..127).",
    }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({
      description: "Plate movement V component per tile (-127..127).",
    }),
  },
  { description: "Foundation tectonic history tiles rollup payload (tile-space rollups)." }
);

/** Foundation tectonic history tiles artifact payload (tile-space era fields + rollups). */
export const FoundationTectonicHistoryTilesArtifactSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of eras included in the history tiles payload. */
    eraCount: Type.Integer({
      minimum: 5,
      maximum: 8,
      description: "Number of eras included in the history tiles payload.",
    }),
    /** Per-era tile fields (length = eraCount). */
    perEra: Type.Immutable(
      Type.Array(FoundationTectonicHistoryTilesEraArtifactSchema, {
        description: "Per-era tile fields (length = eraCount).",
      })
    ),
    /** Rollup fields across eras. */
    rollups: FoundationTectonicHistoryTilesRollupArtifactSchema,
  },
  {
    description:
      "Foundation tectonic history tiles artifact payload (tile-space era fields + rollups).",
  }
);

/** Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars). */
export const FoundationTectonicProvenanceTilesArtifactSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Era index of first appearance per tile (0..eraCount-1). */
    originEra: TypedArraySchemas.u8({
      description: "Era index of first appearance per tile (0..eraCount-1).",
    }),
    /** Origin plate id per tile (plate id; -1 for unknown). */
    originPlateId: TypedArraySchemas.i16({
      description: "Origin plate id per tile (plate id; -1 for unknown).",
    }),
    /** Drift distance bucket per tile (0..255). */
    driftDistance: TypedArraySchemas.u8({
      description: "Drift distance bucket per tile (0..255).",
    }),
    /** Era index of most recent boundary event per tile (255 = none). */
    lastBoundaryEra: TypedArraySchemas.u8({
      description: "Era index of most recent boundary event per tile (255 = none).",
    }),
    /** Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none). */
    lastBoundaryType: TypedArraySchemas.u8({
      description: "Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none).",
    }),
  },
  {
    description:
      "Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars).",
  }
);

export const foundationArtifacts = {
  mesh: meshArtifact,
  mantlePotential: mantlePotentialArtifact,
  mantleForcing: mantleForcingArtifact,
  crustInit: crustInitArtifact,
  crust: crustArtifact,
  plateMotion: plateMotionArtifact,
  plateGraph: plateGraphArtifact,
  tectonicSegments: tectonicSegmentsArtifact,
  tectonicHistory: tectonicHistoryArtifact,
  tectonicProvenance: tectonicProvenanceArtifact,
  plateTopology: plateTopologyArtifact,
  tectonics: tectonicsArtifact,
} as const;
