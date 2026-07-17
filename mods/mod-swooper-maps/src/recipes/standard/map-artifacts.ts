import { artifactContracts as standardArtifactContracts } from "./artifacts/index.js";

/**
 * Stable recipe-wide artifact handles shared by their producer, consumer, and
 * diagnostic modules. Callers use these identities rather than reconstructing
 * ids or schemas locally.
 */
export const mapArtifacts = {
  projectionMeta: standardArtifactContracts.projectionMeta.artifact,
  foundationTileToCellIndex: standardArtifactContracts.foundationTileToCellIndex.artifact,
  foundationCrustTiles: standardArtifactContracts.foundationCrustTiles.artifact,
  foundationTectonicHistoryTiles: standardArtifactContracts.foundationTectonicHistoryTiles.artifact,
  foundationTectonicProvenanceTiles:
    standardArtifactContracts.foundationTectonicProvenanceTiles.artifact,
  foundationPlates: standardArtifactContracts.foundationPlates.artifact,
  landmassRegionSlotByTile: standardArtifactContracts.landmassRegionSlotByTile.artifact,
  placementEngineTerrainSnapshot: standardArtifactContracts.placementEngineTerrainSnapshot.artifact,
  placementSurfaceValidationBoundary:
    standardArtifactContracts.placementSurfaceValidationBoundary.artifact,
} as const;
