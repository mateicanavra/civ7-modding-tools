import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as mesh } from "./mesh.artifact.js";

/** Immutable mesh evidence owned by the Foundation mesh branch. */
export const artifacts = defineArtifactCatalog({ mesh });
