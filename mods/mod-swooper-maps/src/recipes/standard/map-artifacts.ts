import { Type, TypedArraySchemas, defineArtifact } from "@swooper/mapgen-core/authoring";
import {
  FoundationCrustTilesArtifactSchema,
  FoundationPlatesArtifactSchema,
  FoundationTectonicHistoryTilesArtifactSchema,
  FoundationTectonicProvenanceTilesArtifactSchema,
  FoundationTileToCellIndexArtifactSchema,
} from "./stages/foundation/artifacts.js";

const ProjectionMetaArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    wrapX: Type.Literal(true, { description: "Civ7 topology lock: wrap X is always enabled." }),
    wrapY: Type.Literal(false, { description: "Civ7 topology lock: wrap Y is always disabled." }),
  },
  {
    additionalProperties: false,
    description:
      "Gameplay-owned projection metadata for interpreting tile-indexed rasters under Phase 2 topology locks.",
  }
);

const LandmassRegionSlotByTileArtifactSchema = Type.Object(
  {
    slotByTile: TypedArraySchemas.u8({
      description: "Per-tile landmass region slot (0=none, 1=west, 2=east), in tileIndex order.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Gameplay-owned region slot projection derived from Morphology landmasses (Phase 2: slots, not engine ids).",
  }
);

const EngineTerrainSnapshotArtifactSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot (e.g. map-hydrology/lakes).",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask snapshot (1=land, 0=water), tile order.",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot (tile order).",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot (tile order).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Machine-readable engine terrain snapshot captured at a projection boundary for parity diagnostics.",
  }
);

const EngineTerrainFactsSnapshotSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step boundary that produced this terrain fact snapshot.",
    }),
    terrain: TypedArraySchemas.i32({
      description: "Engine terrain type readback at this boundary.",
    }),
    waterMask: TypedArraySchemas.u8({
      description: "Engine isWater readback at this boundary (1=water,0=not water).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description: "Engine isLake readback at this boundary (1=lake,0=not lake).",
    }),
    areaId: TypedArraySchemas.i32({
      description: "Engine area id readback at this boundary.",
    }),
  },
  {
    additionalProperties: false,
    description: "Engine terrain/water/lake/area facts captured at a maintenance boundary.",
  }
);

const PlacementSurfaceValidationBoundaryArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    beforeValidate: EngineTerrainFactsSnapshotSchema,
    afterValidate: EngineTerrainFactsSnapshotSchema,
    afterMaintenance: EngineTerrainFactsSnapshotSchema,
  },
  {
    additionalProperties: false,
    description:
      "Diagnostic placement surface readback around validateAndFixTerrain, area recalculation, and water cache storage.",
  }
);

export const mapArtifacts = {
  projectionMeta: defineArtifact({
    name: "projectionMeta",
    id: "artifact:map.projectionMeta",
    schema: ProjectionMetaArtifactSchema,
  }),
  foundationTileToCellIndex: defineArtifact({
    name: "foundationTileToCellIndex",
    id: "artifact:map.foundationTileToCellIndex",
    schema: FoundationTileToCellIndexArtifactSchema,
  }),
  foundationCrustTiles: defineArtifact({
    name: "foundationCrustTiles",
    id: "artifact:map.foundationCrustTiles",
    schema: FoundationCrustTilesArtifactSchema,
  }),
  foundationTectonicHistoryTiles: defineArtifact({
    name: "foundationTectonicHistoryTiles",
    id: "artifact:map.foundationTectonicHistoryTiles",
    schema: FoundationTectonicHistoryTilesArtifactSchema,
  }),
  foundationTectonicProvenanceTiles: defineArtifact({
    name: "foundationTectonicProvenanceTiles",
    id: "artifact:map.foundationTectonicProvenanceTiles",
    schema: FoundationTectonicProvenanceTilesArtifactSchema,
  }),
  foundationPlates: defineArtifact({
    name: "foundationPlates",
    id: "artifact:map.foundationPlates",
    schema: FoundationPlatesArtifactSchema,
  }),
  landmassRegionSlotByTile: defineArtifact({
    name: "landmassRegionSlotByTile",
    id: "artifact:map.landmassRegionSlotByTile",
    schema: LandmassRegionSlotByTileArtifactSchema,
  }),
  placementEngineTerrainSnapshot: defineArtifact({
    name: "placementEngineTerrainSnapshot",
    id: "artifact:map.placementEngineTerrainSnapshot",
    schema: EngineTerrainSnapshotArtifactSchema,
  }),
  placementSurfaceValidationBoundary: defineArtifact({
    name: "placementSurfaceValidationBoundary",
    id: "artifact:map.placementSurfaceValidationBoundary",
    schema: PlacementSurfaceValidationBoundaryArtifactSchema,
  }),
} as const;
