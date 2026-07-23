import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as initialCrust } from "./initial-crust.artifact.js";
import { artifact as plateGraph } from "./plate-graph.artifact.js";

/** Immutable lithosphere evidence owned by the Foundation lithosphere branch. */
export const artifacts = defineArtifactCatalog({ initialCrust, plateGraph });
