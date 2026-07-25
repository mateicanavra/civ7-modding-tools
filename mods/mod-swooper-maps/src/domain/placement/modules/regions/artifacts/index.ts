import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as landmassRegionSlotByTile } from "./landmass-region-slot-by-tile.artifact.js";

/** Immutable gameplay-region classification owned by Placement regions. */
export const artifacts = defineArtifactCatalog({ landmassRegionSlotByTile });
