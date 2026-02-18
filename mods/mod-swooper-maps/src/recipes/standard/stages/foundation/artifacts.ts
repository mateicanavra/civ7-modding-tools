import { TypedArraySchemas, Type, defineArtifact } from "@swooper/mapgen-core/authoring";
import {
  FOUNDATION_CRUST_ARTIFACT_TAG,
  FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG,
  FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG,
  FOUNDATION_MESH_ARTIFACT_TAG,
  FOUNDATION_PLATE_MOTION_ARTIFACT_TAG,
  FOUNDATION_PLATE_GRAPH_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG,
  FOUNDATION_TECTONICS_ARTIFACT_TAG,
} from "@swooper/mapgen-core";

const FOUNDATION_TECTONIC_SEGMENTS_ARTIFACT_TAG = "artifact:foundation.tectonicSegments";
const FOUNDATION_TECTONIC_HISTORY_ARTIFACT_TAG = "artifact:foundation.tectonicHistory";
const FOUNDATION_PLATE_TOPOLOGY_ARTIFACT_TAG = "artifact:foundation.plateTopology";
const FOUNDATION_CRUST_INIT_ARTIFACT_TAG = "artifact:foundation.crustInit";

/** Bounding box in mesh-space units. */
const BoundingBoxSchema = Type.Object(
  {
    /** Left X coordinate of the bounding box (mesh space). */
    xl: Type.Number({ description: "Left X coordinate of the bounding box (mesh space)." }),
    /** Right X coordinate of the bounding box (mesh space). */
    xr: Type.Number({ description: "Right X coordinate of the bounding box (mesh space)." }),
    /** Top Y coordinate of the bounding box (mesh space). */
    yt: Type.Number({ description: "Top Y coordinate of the bounding box (mesh space)." }),
    /** Bottom Y coordinate of the bounding box (mesh space). */
    yb: Type.Number({ description: "Bottom Y coordinate of the bounding box (mesh space)." }),
  },
  { description: "Bounding box in mesh-space units." }
);

/** Plate metadata entry (seed + classification). */
const FoundationPlateMetadataSchema = Type.Object(
  {
    /** Plate id (0..plateCount-1). */
    id: Type.Integer({ minimum: 0, description: "Plate id (0..plateCount-1)." }),
    /** Plate role classification. */
    role: Type.Union([Type.Literal("polarCap"), Type.Literal("polarMicroplate"), Type.Literal("tectonic")], {
      description: "Plate role classification.",
    }),
    /** Plate size classification. */
    kind: Type.Union([Type.Literal("major"), Type.Literal("minor")], { description: "Plate size classification." }),
    /** Plate seed X coordinate in mesh space. */
    seedX: Type.Number({ description: "Plate seed X coordinate in mesh space." }),
    /** Plate seed Y coordinate in mesh space. */
    seedY: Type.Number({ description: "Plate seed Y coordinate in mesh space." }),
  },
  { description: "Plate metadata entry (seed + classification)." }
);

/** Plate centroid in mesh-space coordinates. */
const FoundationPlateCentroidSchema = Type.Object(
  {
    /** Plate centroid X coordinate (mesh space). */
    x: Type.Number({ description: "Plate centroid X coordinate (mesh space)." }),
    /** Plate centroid Y coordinate (mesh space). */
    y: Type.Number({ description: "Plate centroid Y coordinate (mesh space)." }),
  },
  { description: "Plate centroid in mesh-space coordinates." }
);

/** Plate topology entry (area + centroid + adjacency). */
const FoundationPlateTopologySchema = Type.Object(
  {
    /** Plate id (0..plateCount-1). */
    id: Type.Integer({ minimum: 0, description: "Plate id (0..plateCount-1)." }),
    /** Plate area in mesh cells. */
    area: Type.Integer({ minimum: 0, description: "Plate area in mesh cells." }),
    /** Plate centroid in mesh-space coordinates. */
    centroid: FoundationPlateCentroidSchema,
    /** Neighbor plate ids. */
    neighbors: Type.Array(Type.Integer({ minimum: 0, description: "Neighbor plate id." }), {
      default: [],
      description: "Neighbor plate ids.",
    }),
  },
  { description: "Plate topology entry (area + centroid + adjacency)." }
);

/** Foundation tectonic segments artifact payload. */
const FoundationTectonicSegmentsArtifactSchema = Type.Object(
  {
    /** Number of tectonic boundary segments. */
    segmentCount: Type.Integer({ minimum: 0, description: "Number of tectonic boundary segments." }),
    /** Mesh cell index for side A of each segment. */
    aCell: TypedArraySchemas.i32({ shape: null, description: "Mesh cell index for side A of each segment." }),
    /** Mesh cell index for side B of each segment. */
    bCell: TypedArraySchemas.i32({ shape: null, description: "Mesh cell index for side B of each segment." }),
    /** Plate id for side A of each segment. */
    plateA: TypedArraySchemas.i16({ shape: null, description: "Plate id for side A of each segment." }),
    /** Plate id for side B of each segment. */
    plateB: TypedArraySchemas.i16({ shape: null, description: "Plate id for side B of each segment." }),
    /** Boundary regime for each segment (BOUNDARY_TYPE values). */
    regime: TypedArraySchemas.u8({ shape: null, description: "Boundary regime for each segment (BOUNDARY_TYPE values)." }),
    /** Boundary polarity for each segment (signed indicator). */
    polarity: TypedArraySchemas.i8({ shape: null, description: "Boundary polarity for each segment (signed indicator)." }),
    /** Compression component for each segment (0..255). */
    compression: TypedArraySchemas.u8({ shape: null, description: "Compression component for each segment (0..255)." }),
    /** Extension component for each segment (0..255). */
    extension: TypedArraySchemas.u8({ shape: null, description: "Extension component for each segment (0..255)." }),
    /** Shear component for each segment (0..255). */
    shear: TypedArraySchemas.u8({ shape: null, description: "Shear component for each segment (0..255)." }),
    /** Volcanism potential for each segment (0..255). */
    volcanism: TypedArraySchemas.u8({ shape: null, description: "Volcanism potential for each segment (0..255)." }),
    /** Fracture potential for each segment (0..255). */
    fracture: TypedArraySchemas.u8({ shape: null, description: "Fracture potential for each segment (0..255)." }),
    /** Drift vector U component for each segment (-127..127). */
    driftU: TypedArraySchemas.i8({ shape: null, description: "Drift vector U component for each segment (-127..127)." }),
    /** Drift vector V component for each segment (-127..127). */
    driftV: TypedArraySchemas.i8({ shape: null, description: "Drift vector V component for each segment (-127..127)." }),
  },
  { description: "Foundation tectonic segments artifact payload." }
);

/** Foundation tectonic history era payload (per-era tectonic driver tensors). */
const FoundationTectonicHistoryEraArtifactSchema = Type.Object(
  {
    /** Boundary type per mesh cell (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({ shape: null, description: "Boundary type per mesh cell (BOUNDARY_TYPE values)." }),
    /** Uplift potential per mesh cell (0..255). */
    upliftPotential: TypedArraySchemas.u8({ shape: null, description: "Uplift potential per mesh cell (0..255)." }),
    /** Collision-driven uplift potential per mesh cell (0..255). */
    collisionPotential: TypedArraySchemas.u8({
      shape: null,
      description: "Collision-driven uplift potential per mesh cell (0..255).",
    }),
    /** Subduction-driven uplift potential per mesh cell (0..255). */
    subductionPotential: TypedArraySchemas.u8({
      shape: null,
      description: "Subduction-driven uplift potential per mesh cell (0..255).",
    }),
    /** Rift potential per mesh cell (0..255). */
    riftPotential: TypedArraySchemas.u8({ shape: null, description: "Rift potential per mesh cell (0..255)." }),
    /** Shear stress per mesh cell (0..255). */
    shearStress: TypedArraySchemas.u8({ shape: null, description: "Shear stress per mesh cell (0..255)." }),
    /** Volcanism per mesh cell (0..255). */
    volcanism: TypedArraySchemas.u8({ shape: null, description: "Volcanism per mesh cell (0..255)." }),
    /** Fracture potential per mesh cell (0..255). */
    fracture: TypedArraySchemas.u8({ shape: null, description: "Fracture potential per mesh cell (0..255)." }),
  },
  { description: "Foundation tectonic history era payload (per-era tectonic driver tensors)." }
);

/** Foundation tectonic history artifact payload (fixed-count eras + cumulative fields). */
const FoundationTectonicHistoryArtifactSchema = Type.Object(
  {
    /** Number of eras included in the history payload. */
    eraCount: Type.Integer({ minimum: 5, maximum: 8, description: "Number of eras included in the history payload." }),
    /** Era payloads (length = eraCount). */
    eras: Type.Immutable(
      Type.Array(FoundationTectonicHistoryEraArtifactSchema, { description: "Era payloads (length = eraCount)." })
    ),
    /** Plate id per mesh cell for each era (length = eraCount; each entry length = cellCount). */
    plateIdByEra: Type.Immutable(
      Type.Array(TypedArraySchemas.i16({ shape: null, description: "Plate id per mesh cell for the era." }), {
        description: "Era plate membership (oldest→newest).",
      })
    ),
    /** Accumulated uplift total per mesh cell (0..255). */
    upliftTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated uplift total per mesh cell (0..255)." }),
    /** Accumulated collision uplift total per mesh cell (0..255). */
    collisionTotal: TypedArraySchemas.u8({
      shape: null,
      description: "Accumulated collision uplift total per mesh cell (0..255).",
    }),
    /** Accumulated subduction uplift total per mesh cell (0..255). */
    subductionTotal: TypedArraySchemas.u8({
      shape: null,
      description: "Accumulated subduction uplift total per mesh cell (0..255).",
    }),
    /** Accumulated fracture total per mesh cell (0..255). */
    fractureTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated fracture total per mesh cell (0..255)." }),
    /** Accumulated volcanism total per mesh cell (0..255). */
    volcanismTotal: TypedArraySchemas.u8({ shape: null, description: "Accumulated volcanism total per mesh cell (0..255)." }),
    /** Fraction of uplift attributable to recent eras per mesh cell (0..255). */
    upliftRecentFraction: TypedArraySchemas.u8({
      shape: null,
      description: "Fraction of uplift attributable to recent eras per mesh cell (0..255).",
    }),
    /** Fraction of collision uplift attributable to recent eras per mesh cell (0..255). */
    collisionRecentFraction: TypedArraySchemas.u8({
      shape: null,
      description: "Fraction of collision uplift attributable to recent eras per mesh cell (0..255).",
    }),
    /** Fraction of subduction uplift attributable to recent eras per mesh cell (0..255). */
    subductionRecentFraction: TypedArraySchemas.u8({
      shape: null,
      description: "Fraction of subduction uplift attributable to recent eras per mesh cell (0..255).",
    }),
    /** Last active era index per mesh cell (0..255). */
    lastActiveEra: TypedArraySchemas.u8({ shape: null, description: "Last active era index per mesh cell (0..255)." }),
    /** Last collision-active era index per mesh cell (0..255; 255 = never). */
    lastCollisionEra: TypedArraySchemas.u8({
      shape: null,
      description: "Last collision-active era index per mesh cell (0..255; 255 = never).",
    }),
    /** Last subduction-active era index per mesh cell (0..255; 255 = never). */
    lastSubductionEra: TypedArraySchemas.u8({
      shape: null,
      description: "Last subduction-active era index per mesh cell (0..255; 255 = never).",
    }),
  },
  { description: "Foundation tectonic history artifact payload (fixed-count eras + cumulative fields)." }
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

/** Foundation tectonic provenance artifact payload (tracer history + scalars). */
const FoundationTectonicProvenanceArtifactSchema = Type.Object(
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
  { description: "Foundation tectonic provenance artifact payload (tracer history + scalars)." }
);

/** Foundation plates artifact payload (tile-space plate tensors). */
export const FoundationPlatesArtifactSchema = Type.Object(
  {
    /** Plate id per tile. */
    id: TypedArraySchemas.i16({ description: "Plate id per tile." }),
    /** Boundary proximity per tile (0..255). */
    boundaryCloseness: TypedArraySchemas.u8({ description: "Boundary proximity per tile (0..255)." }),
    /** Boundary type per tile (BOUNDARY_TYPE values). */
    boundaryType: TypedArraySchemas.u8({ description: "Boundary type per tile (BOUNDARY_TYPE values)." }),
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
  { description: "Foundation plates artifact payload (tile-space plate tensors)." }
);

/** Foundation mesh artifact payload (cells + adjacency + site coordinates). */
const FoundationMeshArtifactSchema = Type.Object(
  {
    /** Number of mesh cells. */
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    /** Periodic wrap width in mesh-space units (hex space). */
    wrapWidth: Type.Number({ description: "Periodic wrap width in mesh-space units (hex space)." }),
    /** X coordinate per mesh cell (hex space). */
    siteX: TypedArraySchemas.f32({ shape: null, description: "X coordinate per mesh cell (hex space)." }),
    /** Y coordinate per mesh cell (hex space). */
    siteY: TypedArraySchemas.f32({ shape: null, description: "Y coordinate per mesh cell (hex space)." }),
    /** CSR offsets into neighbors array (length = cellCount + 1). */
    neighborsOffsets: TypedArraySchemas.i32({
      shape: null,
      description: "CSR offsets into neighbors array (length = cellCount + 1).",
    }),
    /** CSR neighbor indices. */
    neighbors: TypedArraySchemas.i32({ shape: null, description: "CSR neighbor indices." }),
    /** Cell area per mesh cell (hex-space units). */
    areas: TypedArraySchemas.f32({ shape: null, description: "Cell area per mesh cell (hex-space units)." }),
    /** Bounding box in mesh-space units. */
    bbox: BoundingBoxSchema,
  },
  { description: "Foundation mesh artifact payload (cells + adjacency + site coordinates)." }
);

/** Foundation mantle potential artifact payload (mesh-space forcing potential). */
const FoundationMantlePotentialArtifactSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of mesh cells. */
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    /** Mantle potential per mesh cell (normalized -1..1). */
    potential: TypedArraySchemas.f32({
      shape: null,
      description: "Mantle potential per mesh cell (normalized -1..1).",
    }),
    /** Number of mantle sources. */
    sourceCount: Type.Integer({ minimum: 0, description: "Number of mantle sources." }),
    /** Source type per source (+1 upwelling, -1 downwelling). */
    sourceType: TypedArraySchemas.i8({
      shape: null,
      description: "Source type per source (+1 upwelling, -1 downwelling).",
    }),
    /** Source mesh cell index per source. */
    sourceCell: TypedArraySchemas.u32({
      shape: null,
      description: "Source mesh cell index per source.",
    }),
    /** Source amplitude per source (signed). */
    sourceAmplitude: TypedArraySchemas.f32({
      shape: null,
      description: "Source amplitude per source (signed).",
    }),
    /** Source radius per source (mesh-distance units). */
    sourceRadius: TypedArraySchemas.f32({
      shape: null,
      description: "Source radius per source (mesh-distance units).",
    }),
  },
  { description: "Foundation mantle potential artifact payload (mesh-space forcing potential)." }
);

/** Foundation mantle forcing artifact payload (derived stress/velocity fields). */
const FoundationMantleForcingArtifactSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of mesh cells. */
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    /** Stress proxy per mesh cell (normalized 0..1). */
    stress: TypedArraySchemas.f32({
      shape: null,
      description: "Stress proxy per mesh cell (normalized 0..1).",
    }),
    /** Forcing velocity X component per mesh cell. */
    forcingU: TypedArraySchemas.f32({
      shape: null,
      description: "Forcing velocity X component per mesh cell.",
    }),
    /** Forcing velocity Y component per mesh cell. */
    forcingV: TypedArraySchemas.f32({
      shape: null,
      description: "Forcing velocity Y component per mesh cell.",
    }),
    /** Forcing magnitude per mesh cell (normalized 0..1). */
    forcingMag: TypedArraySchemas.f32({
      shape: null,
      description: "Forcing magnitude per mesh cell (normalized 0..1).",
    }),
    /** Upwelling classification per mesh cell (+1 upwelling, -1 downwelling, 0 neutral). */
    upwellingClass: TypedArraySchemas.i8({
      shape: null,
      description: "Upwelling classification per mesh cell (+1 upwelling, -1 downwelling, 0 neutral).",
    }),
    /** Divergence per mesh cell (normalized -1..1). */
    divergence: TypedArraySchemas.f32({
      shape: null,
      description: "Divergence per mesh cell (normalized -1..1).",
    }),
  },
  { description: "Foundation mantle forcing artifact payload (derived stress/velocity fields)." }
);

/** Foundation plate motion artifact payload (mantle-derived rigid kinematics). */
const FoundationPlateMotionArtifactSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of mesh cells. */
    cellCount: Type.Integer({ minimum: 1, description: "Number of mesh cells." }),
    /** Number of plates. */
    plateCount: Type.Integer({ minimum: 1, description: "Number of plates." }),
    /** Plate rotation center X coordinate per plate (mesh space, unwrapped). */
    plateCenterX: TypedArraySchemas.f32({
      shape: null,
      description: "Plate rotation center X coordinate per plate (mesh space, unwrapped).",
    }),
    /** Plate rotation center Y coordinate per plate (mesh space, unwrapped). */
    plateCenterY: TypedArraySchemas.f32({
      shape: null,
      description: "Plate rotation center Y coordinate per plate (mesh space, unwrapped).",
    }),
    /** Plate translation X component per plate. */
    plateVelocityX: TypedArraySchemas.f32({
      shape: null,
      description: "Plate translation X component per plate.",
    }),
    /** Plate translation Y component per plate. */
    plateVelocityY: TypedArraySchemas.f32({
      shape: null,
      description: "Plate translation Y component per plate.",
    }),
    /** Plate angular velocity per plate. */
    plateOmega: TypedArraySchemas.f32({
      shape: null,
      description: "Plate angular velocity per plate.",
    }),
    /** RMS fit error per plate (mesh-space residual magnitude). */
    plateFitRms: TypedArraySchemas.f32({
      shape: null,
      description: "RMS fit error per plate (mesh-space residual magnitude).",
    }),
    /** P90 fit error per plate (mesh-space residual magnitude). */
    plateFitP90: TypedArraySchemas.f32({
      shape: null,
      description: "P90 fit error per plate (mesh-space residual magnitude).",
    }),
    /** Plate fit quality scalar per plate (0..255). */
    plateQuality: TypedArraySchemas.u8({
      shape: null,
      description: "Plate fit quality scalar per plate (0..255).",
    }),
    /** Per-cell fit residual (normalized 0..255). */
    cellFitError: TypedArraySchemas.u8({
      shape: null,
      description: "Per-cell fit residual (normalized 0..255).",
    }),
  },
  { description: "Foundation plate motion artifact payload (mantle-derived rigid kinematics)." }
);

/** Foundation crust artifact payload (mesh-space crust driver tensors). */
const FoundationCrustArtifactSchema = Type.Object(
  {
    /** Crust maturity per mesh cell (0=basaltic lid, 1=cratonic). */
    maturity: TypedArraySchemas.f32({
      shape: null,
      description: "Crust maturity per mesh cell (0=basaltic lid, 1=cratonic).",
    }),
    /** Crust thickness proxy per mesh cell (0..1). */
    thickness: TypedArraySchemas.f32({
      shape: null,
      description: "Crust thickness proxy per mesh cell (0..1).",
    }),
    /** Crust thermal age per mesh cell (0..255). */
    thermalAge: TypedArraySchemas.u8({
      shape: null,
      description: "Crust thermal age per mesh cell (0..255).",
    }),
    /** Crust damage per mesh cell (0..255). */
    damage: TypedArraySchemas.u8({
      shape: null,
      description: "Crust damage per mesh cell (0..255).",
    }),
    /** Crust type per mesh cell (0=oceanic, 1=continental). */
    type: TypedArraySchemas.u8({
      shape: null,
      description: "Crust type per mesh cell (0=oceanic, 1=continental).",
    }),
    /** Crust age per mesh cell (0=new, 255=ancient). */
    age: TypedArraySchemas.u8({
      shape: null,
      description: "Crust thermal age per mesh cell (0=new, 255=ancient).",
    }),
    /** Crust buoyancy proxy per mesh cell (0..1). */
    buoyancy: TypedArraySchemas.f32({
      shape: null,
      description: "Crust buoyancy proxy per mesh cell (0..1).",
    }),
    /** Isostatic base elevation proxy per mesh cell (0..1). */
    baseElevation: TypedArraySchemas.f32({
      shape: null,
      description: "Isostatic base elevation proxy per mesh cell (0..1).",
    }),
    /** Lithospheric strength proxy per mesh cell (0..1). */
    strength: TypedArraySchemas.f32({
      shape: null,
      description: "Lithospheric strength proxy per mesh cell (0..1).",
    }),
  },
  { description: "Foundation crust artifact payload (mesh-space crust driver tensors)." }
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
      description: "Crust maturity per tile (0=basaltic lid, 1=cratonic), sampled via tileToCellIndex.",
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
    boundaryType: TypedArraySchemas.u8({ description: "Boundary type per tile (BOUNDARY_TYPE values)." }),
    /** Convergent mask per tile (0/1). */
    convergentMask: TypedArraySchemas.u8({ description: "Convergent mask per tile (0/1)." }),
    /** Divergent mask per tile (0/1). */
    divergentMask: TypedArraySchemas.u8({ description: "Divergent mask per tile (0/1)." }),
    /** Transform mask per tile (0/1). */
    transformMask: TypedArraySchemas.u8({ description: "Transform mask per tile (0/1)." }),
    /** Uplift potential per tile (0..255). */
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    /** Collision-driven uplift potential per tile (0..255). */
    collisionPotential: TypedArraySchemas.u8({ description: "Collision-driven uplift potential per tile (0..255)." }),
    /** Subduction-driven uplift potential per tile (0..255). */
    subductionPotential: TypedArraySchemas.u8({ description: "Subduction-driven uplift potential per tile (0..255)." }),
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
    upliftTotal: TypedArraySchemas.u8({ description: "Accumulated uplift total per tile (0..255)." }),
    /** Accumulated collision uplift total per tile (0..255). */
    collisionTotal: TypedArraySchemas.u8({ description: "Accumulated collision uplift total per tile (0..255)." }),
    /** Accumulated subduction uplift total per tile (0..255). */
    subductionTotal: TypedArraySchemas.u8({ description: "Accumulated subduction uplift total per tile (0..255)." }),
    /** Accumulated fracture total per tile (0..255). */
    fractureTotal: TypedArraySchemas.u8({ description: "Accumulated fracture total per tile (0..255)." }),
    /** Accumulated volcanism total per tile (0..255). */
    volcanismTotal: TypedArraySchemas.u8({ description: "Accumulated volcanism total per tile (0..255)." }),
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
    lastActiveEra: TypedArraySchemas.u8({ description: "Last active era index per tile (0..255; 255 = never)." }),
    /** Last collision-active era index per tile (0..255; 255 = never). */
    lastCollisionEra: TypedArraySchemas.u8({ description: "Last collision-active era index per tile (0..255; 255 = never)." }),
    /** Last subduction-active era index per tile (0..255; 255 = never). */
    lastSubductionEra: TypedArraySchemas.u8({ description: "Last subduction-active era index per tile (0..255; 255 = never)." }),
    /** Plate movement U component per tile (-127..127). */
    movementU: TypedArraySchemas.i8({ description: "Plate movement U component per tile (-127..127)." }),
    /** Plate movement V component per tile (-127..127). */
    movementV: TypedArraySchemas.i8({ description: "Plate movement V component per tile (-127..127)." }),
  },
  { description: "Foundation tectonic history tiles rollup payload (tile-space rollups)." }
);

/** Foundation tectonic history tiles artifact payload (tile-space era fields + rollups). */
export const FoundationTectonicHistoryTilesArtifactSchema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Number of eras included in the history tiles payload. */
    eraCount: Type.Integer({ minimum: 5, maximum: 8, description: "Number of eras included in the history tiles payload." }),
    /** Per-era tile fields (length = eraCount). */
    perEra: Type.Immutable(
      Type.Array(FoundationTectonicHistoryTilesEraArtifactSchema, {
        description: "Per-era tile fields (length = eraCount).",
      })
    ),
    /** Rollup fields across eras. */
    rollups: FoundationTectonicHistoryTilesRollupArtifactSchema,
  },
  { description: "Foundation tectonic history tiles artifact payload (tile-space era fields + rollups)." }
);

/** Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars). */
export const FoundationTectonicProvenanceTilesArtifactSchema = Type.Object(
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

/** Foundation plate graph artifact payload (mesh-space plate assignment + metadata). */
const FoundationPlateGraphArtifactSchema = Type.Object(
  {
    /** Plate id per mesh cell. */
    cellToPlate: TypedArraySchemas.i16({ shape: null, description: "Plate id per mesh cell." }),
    /** Plate metadata array (indexed by plate id). */
    plates: Type.Immutable(
      Type.Array(FoundationPlateMetadataSchema, { description: "Plate metadata array (indexed by plate id)." })
    ),
  },
  { description: "Foundation plate graph artifact payload (mesh-space plate assignment + metadata)." }
);

/** Foundation plate topology artifact payload (plate adjacency + centroid/area). */
const FoundationPlateTopologyArtifactSchema = Type.Object(
  {
    /** Number of plates included in the topology payload. */
    plateCount: Type.Integer({ minimum: 1, description: "Number of plates included in the topology payload." }),
    /** Plate topology array (indexed by plate id). */
    plates: Type.Immutable(
      Type.Array(FoundationPlateTopologySchema, { description: "Plate topology array (indexed by plate id)." })
    ),
  },
  { description: "Foundation plate topology artifact payload (plate adjacency + centroid/area)." }
);

/** Foundation tectonics artifact payload (mesh-space tectonic driver tensors). */
const FoundationTectonicsArtifactSchema = Type.Object(
  {
    /** Boundary type per mesh cell (BOUNDARY_TYPE values; 0 when non-boundary/unknown). */
    boundaryType: TypedArraySchemas.u8({
      shape: null,
      description: "Boundary type per mesh cell (BOUNDARY_TYPE values; 0 when non-boundary/unknown).",
    }),
    /** Uplift potential per mesh cell (0..255). */
    upliftPotential: TypedArraySchemas.u8({ shape: null, description: "Uplift potential per mesh cell (0..255)." }),
    /** Rift potential per mesh cell (0..255). */
    riftPotential: TypedArraySchemas.u8({ shape: null, description: "Rift potential per mesh cell (0..255)." }),
    /** Shear stress per mesh cell (0..255). */
    shearStress: TypedArraySchemas.u8({ shape: null, description: "Shear stress per mesh cell (0..255)." }),
    /** Volcanism per mesh cell (0..255). */
    volcanism: TypedArraySchemas.u8({ shape: null, description: "Volcanism per mesh cell (0..255)." }),
    /** Fracture potential per mesh cell (0..255). */
    fracture: TypedArraySchemas.u8({ shape: null, description: "Fracture potential per mesh cell (0..255)." }),
    /** Accumulated uplift per mesh cell (0..255). */
    cumulativeUplift: TypedArraySchemas.u8({
      shape: null,
      description: "Accumulated uplift per mesh cell (0..255).",
    }),
  },
  { description: "Foundation tectonics artifact payload (mesh-space tectonic driver tensors)." }
);

export const foundationArtifacts = {
  mesh: defineArtifact({
    name: "foundationMesh",
    id: FOUNDATION_MESH_ARTIFACT_TAG,
    schema: FoundationMeshArtifactSchema,
  }),
  mantlePotential: defineArtifact({
    name: "foundationMantlePotential",
    id: FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG,
    schema: FoundationMantlePotentialArtifactSchema,
  }),
  mantleForcing: defineArtifact({
    name: "foundationMantleForcing",
    id: FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG,
    schema: FoundationMantleForcingArtifactSchema,
  }),
  crustInit: defineArtifact({
    name: "foundationCrustInit",
    id: FOUNDATION_CRUST_INIT_ARTIFACT_TAG,
    schema: FoundationCrustArtifactSchema,
  }),
  crust: defineArtifact({
    name: "foundationCrust",
    id: FOUNDATION_CRUST_ARTIFACT_TAG,
    schema: FoundationCrustArtifactSchema,
  }),
  plateMotion: defineArtifact({
    name: "foundationPlateMotion",
    id: FOUNDATION_PLATE_MOTION_ARTIFACT_TAG,
    schema: FoundationPlateMotionArtifactSchema,
  }),
  plateGraph: defineArtifact({
    name: "foundationPlateGraph",
    id: FOUNDATION_PLATE_GRAPH_ARTIFACT_TAG,
    schema: FoundationPlateGraphArtifactSchema,
  }),
  tectonicSegments: defineArtifact({
    name: "foundationTectonicSegments",
    id: FOUNDATION_TECTONIC_SEGMENTS_ARTIFACT_TAG,
    schema: FoundationTectonicSegmentsArtifactSchema,
  }),
  tectonicHistory: defineArtifact({
    name: "foundationTectonicHistory",
    id: FOUNDATION_TECTONIC_HISTORY_ARTIFACT_TAG,
    schema: FoundationTectonicHistoryArtifactSchema,
  }),
  tectonicProvenance: defineArtifact({
    name: "foundationTectonicProvenance",
    id: FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG,
    schema: FoundationTectonicProvenanceArtifactSchema,
  }),
  plateTopology: defineArtifact({
    name: "foundationPlateTopology",
    id: FOUNDATION_PLATE_TOPOLOGY_ARTIFACT_TAG,
    schema: FoundationPlateTopologyArtifactSchema,
  }),
  tectonics: defineArtifact({
    name: "foundationTectonics",
    id: FOUNDATION_TECTONICS_ARTIFACT_TAG,
    schema: FoundationTectonicsArtifactSchema,
  }),
} as const;
