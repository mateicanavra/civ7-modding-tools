import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as pedology } from "./pedology.artifact.js";

/** Immutable soil evidence owned by the Ecology pedology branch. */
export const artifacts = defineArtifactCatalog({ pedology });
