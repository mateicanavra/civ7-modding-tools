import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as landmasses } from "./landmasses.artifact.js";
import { artifact as mountains } from "./mountains.artifact.js";
import { artifact as initialTopography } from "./topography-initial.artifact.js";
import { artifact as volcanoes } from "./volcanoes.artifact.js";

/** Immutable initial relief, landmass, mountain, and volcano evidence owned by Landforms. */
export const artifacts = defineArtifactCatalog({ initialTopography, landmasses, mountains, volcanoes });
