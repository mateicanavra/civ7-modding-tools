import { artifactContracts as standardArtifactContracts } from "./artifacts/index.js";

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
