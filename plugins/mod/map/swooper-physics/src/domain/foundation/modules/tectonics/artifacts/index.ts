import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as currentTectonics } from "./current-tectonics.artifact.js";
import { artifact as plateMotion } from "./plate-motion.artifact.js";
import { artifact as tectonicHistory } from "./tectonic-history.artifact.js";
import { artifact as tectonicProvenance } from "./tectonic-provenance.artifact.js";
import { artifact as tectonicSegments } from "./tectonic-segments.artifact.js";

/** Immutable multi-era tectonic evidence owned by the Foundation tectonics branch. */
export const artifacts = defineArtifactCatalog({
  plateMotion,
  tectonicSegments,
  tectonicHistory,
  currentTectonics,
  tectonicProvenance,
});
