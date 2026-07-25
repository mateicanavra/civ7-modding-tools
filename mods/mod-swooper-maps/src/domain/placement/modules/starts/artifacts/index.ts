import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as startAssignment } from "./start-assignment.artifact.js";

/** Immutable player-start assignment evidence owned by Placement starts. */
export const artifacts = defineArtifactCatalog({ startAssignment });
