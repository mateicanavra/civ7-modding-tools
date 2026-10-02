import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as substrate } from "./substrate.artifact.js";
import { artifact as erodedTopography } from "./topography-eroded.artifact.js";
import { artifact as topography } from "./topography.artifact.js";

/** Immutable early relief, sealed final ground, and substrate evidence owned by Erosion. */
export const artifacts = defineArtifactCatalog({ erodedTopography, topography, substrate });
