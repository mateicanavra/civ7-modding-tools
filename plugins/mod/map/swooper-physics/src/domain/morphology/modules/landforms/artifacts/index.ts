import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as landmasses } from "./landmasses.artifact.js";
import { artifact as mountains } from "./mountains.artifact.js";
import { artifact as topography } from "./topography.artifact.js";
import { artifact as volcanoes } from "./volcanoes.artifact.js";

/** Immutable relief, landmass, mountain, and volcano evidence owned by the landforms branch. */
export const artifacts = defineArtifactCatalog({ topography, landmasses, mountains, volcanoes });
