import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as beltDrivers } from "./belt-drivers.artifact.js";
import { artifact as baseSubstrate } from "./substrate-base.artifact.js";
import { artifact as baseTopography } from "./topography-base.artifact.js";

/** Immutable tectonic drivers and base terrain evidence owned by the Morphology terrain branch. */
export const artifacts = defineArtifactCatalog({ beltDrivers, baseTopography, baseSubstrate });
