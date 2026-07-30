import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as shelf } from "./shelf.artifact.js";

/** Immutable continental-shelf classification published for coastal and Ecology consumers. */
export const artifacts = defineArtifactCatalog({ shelf });
