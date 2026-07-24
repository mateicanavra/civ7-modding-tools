import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as carvedCoastline } from "./carved-coastline.artifact.js";
import { artifact as carvedTopography } from "./topography-carved.artifact.js";

/** Immutable coastline and carved-relief evidence published by the Morphology coasts branch. */
export const artifacts = defineArtifactCatalog({ carvedTopography, carvedCoastline });
