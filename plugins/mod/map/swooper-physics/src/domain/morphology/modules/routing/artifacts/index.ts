import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as routing } from "./routing.artifact.js";

/** Immutable geomorphic-routing evidence consumed by Morphology erosion and landform planning. */
export const artifacts = defineArtifactCatalog({ routing });
