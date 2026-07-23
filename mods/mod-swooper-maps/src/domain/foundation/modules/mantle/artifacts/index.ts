import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as mantleForcing } from "./mantle-forcing.artifact.js";
import { artifact as mantlePotential } from "./mantle-potential.artifact.js";

/** Immutable mantle evidence owned by the Foundation mantle branch. */
export const artifacts = defineArtifactCatalog({ mantlePotential, mantleForcing });
