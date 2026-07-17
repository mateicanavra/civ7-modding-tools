import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as foundationCrustTiles from "./foundation-crust-tiles.artifact.js";
import * as foundationPlates from "./foundation-plates.artifact.js";
import * as foundationTectonicHistoryTiles from "./foundation-tectonic-history-tiles.artifact.js";
import * as foundationTectonicProvenanceTiles from "./foundation-tectonic-provenance-tiles.artifact.js";
import * as foundationTileToCellIndex from "./foundation-tile-to-cell-index.artifact.js";
import * as landmassRegionSlotByTile from "./landmass-region-slot-by-tile.artifact.js";
import * as placementEngineTerrainSnapshot from "./placement-engine-terrain-snapshot.artifact.js";
import * as placementSurfaceValidationBoundary from "./placement-surface-validation-boundary.artifact.js";
import * as projectionMeta from "./projection-meta.artifact.js";

const catalog = defineArtifactCatalog({
  foundationCrustTiles,
  foundationPlates,
  foundationTectonicHistoryTiles,
  foundationTectonicProvenanceTiles,
  foundationTileToCellIndex,
  landmassRegionSlotByTile,
  placementEngineTerrainSnapshot,
  placementSurfaceValidationBoundary,
  projectionMeta,
});

/** Standard recipe-wide artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** Standard recipe-wide artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
