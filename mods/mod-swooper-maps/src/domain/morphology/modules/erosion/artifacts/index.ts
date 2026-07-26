import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as substrate } from "./substrate.artifact.js";
import { artifact as erodedTopography } from "./topography-eroded.artifact.js";

/** Immutable eroded-relief and substrate evidence published by the Morphology erosion branch. */
export const artifacts = defineArtifactCatalog({ erodedTopography, substrate });
