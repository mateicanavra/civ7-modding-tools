import * as foundationCrustTiles from "./foundation-crust-tiles.artifact.js";
import * as foundationPlates from "./foundation-plates.artifact.js";
import * as foundationTectonicHistoryTiles from "./foundation-tectonic-history-tiles.artifact.js";
import * as foundationTectonicProvenanceTiles from "./foundation-tectonic-provenance-tiles.artifact.js";
import * as foundationTileToCellIndex from "./foundation-tile-to-cell-index.artifact.js";
import * as landmassRegionSlotByTile from "./landmass-region-slot-by-tile.artifact.js";
import * as placementEngineTerrainSnapshot from "./placement-engine-terrain-snapshot.artifact.js";
import * as placementSurfaceValidationBoundary from "./placement-surface-validation-boundary.artifact.js";
import * as projectionMeta from "./projection-meta.artifact.js";

export { foundationCrustTiles, foundationPlates, foundationTectonicHistoryTiles, foundationTectonicProvenanceTiles, foundationTileToCellIndex, landmassRegionSlotByTile, placementEngineTerrainSnapshot, placementSurfaceValidationBoundary, projectionMeta };

export const artifactContracts = {
  foundationCrustTiles,
  foundationPlates,
  foundationTectonicHistoryTiles,
  foundationTectonicProvenanceTiles,
  foundationTileToCellIndex,
  landmassRegionSlotByTile,
  placementEngineTerrainSnapshot,
  placementSurfaceValidationBoundary,
  projectionMeta,
} as const;

export const validators = {
  foundationCrustTiles: foundationCrustTiles.validate,
  foundationPlates: foundationPlates.validate,
  foundationTectonicHistoryTiles: foundationTectonicHistoryTiles.validate,
  foundationTectonicProvenanceTiles: foundationTectonicProvenanceTiles.validate,
  foundationTileToCellIndex: foundationTileToCellIndex.validate,
  landmassRegionSlotByTile: landmassRegionSlotByTile.validate,
  placementEngineTerrainSnapshot: placementEngineTerrainSnapshot.validate,
  placementSurfaceValidationBoundary: placementSurfaceValidationBoundary.validate,
  projectionMeta: projectionMeta.validate,
} as const;
