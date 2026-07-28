import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as crustTiles } from "./crust-tiles.artifact.js";
import { artifact as plateTopology } from "./plate-topology.artifact.js";
import { artifact as plates } from "./plates.artifact.js";
import { artifact as tectonicHistoryTiles } from "./tectonic-history-tiles.artifact.js";
import { artifact as tectonicProvenanceTiles } from "./tectonic-provenance-tiles.artifact.js";

/** Immutable tile-space Foundation evidence owned by the projection branch. */
export const artifacts = defineArtifactCatalog({
  plates,
  crustTiles,
  tectonicHistoryTiles,
  tectonicProvenanceTiles,
  plateTopology,
});
