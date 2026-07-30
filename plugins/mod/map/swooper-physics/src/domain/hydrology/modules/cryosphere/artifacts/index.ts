import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as cryosphere } from "./cryosphere.artifact.js";

/** Immutable snow and ground-ice evidence owned by the Hydrology cryosphere branch. */
export const artifacts = defineArtifactCatalog({ cryosphere });
