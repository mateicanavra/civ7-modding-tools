import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as biomeClassification } from "./biome-classification.artifact.js";

/** Immutable biome evidence owned by the Ecology biomes branch. */
export const artifacts = defineArtifactCatalog({ biomeClassification });
