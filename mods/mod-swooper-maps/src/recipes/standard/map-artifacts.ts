import { artifact as foundationCrustTilesArtifact } from "./artifacts/foundation-crust-tiles.artifact.js";
import { artifact as foundationPlatesArtifact } from "./artifacts/foundation-plates.artifact.js";
import { artifact as foundationTectonicHistoryTilesArtifact } from "./artifacts/foundation-tectonic-history-tiles.artifact.js";
import { artifact as foundationTectonicProvenanceTilesArtifact } from "./artifacts/foundation-tectonic-provenance-tiles.artifact.js";
import { artifact as foundationTileToCellIndexArtifact } from "./artifacts/foundation-tile-to-cell-index.artifact.js";
import { artifact as landmassRegionSlotByTileArtifact } from "./artifacts/landmass-region-slot-by-tile.artifact.js";
import { artifact as placementEngineTerrainSnapshotArtifact } from "./artifacts/placement-engine-terrain-snapshot.artifact.js";
import { artifact as placementSurfaceValidationBoundaryArtifact } from "./artifacts/placement-surface-validation-boundary.artifact.js";
import { artifact as projectionMetaArtifact } from "./artifacts/projection-meta.artifact.js";

export const mapArtifacts = {
  projectionMeta: projectionMetaArtifact,
  foundationTileToCellIndex: foundationTileToCellIndexArtifact,
  foundationCrustTiles: foundationCrustTilesArtifact,
  foundationTectonicHistoryTiles: foundationTectonicHistoryTilesArtifact,
  foundationTectonicProvenanceTiles: foundationTectonicProvenanceTilesArtifact,
  foundationPlates: foundationPlatesArtifact,
  landmassRegionSlotByTile: landmassRegionSlotByTileArtifact,
  placementEngineTerrainSnapshot: placementEngineTerrainSnapshotArtifact,
  placementSurfaceValidationBoundary: placementSurfaceValidationBoundaryArtifact,
} as const;
