import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as baseCoastline } from "./base-coastline.artifact.js";

/** Immutable base-coastline evidence published by the Morphology coasts branch. */
export const artifacts = defineArtifactCatalog({ baseCoastline });
