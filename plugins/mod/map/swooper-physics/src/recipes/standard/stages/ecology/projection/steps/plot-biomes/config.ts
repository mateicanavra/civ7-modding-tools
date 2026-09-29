import { artifacts as biomeArtifacts } from "../../../../../../../domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "../../../../../../../domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Defines the translation from Ecology biome symbols to fixed official Civ7 biome identities.
 * Projected identities and current land/water parity remain invocation-local evidence.
 */
export const config = defineStep({
  id: "plot-biomes",
  description: "Projects Swooper biome symbols into fixed official Civ7 biome identities.",
  engine: ["getBiomeGlobal", "setBiomeType", "readCurrentMapWaterMask"] as const,
  requires: [
    biomeArtifacts.biomeClassification,
    climateArtifacts.climateIndices,
    morphologyLandformsArtifacts.topography,
  ],
  provides: [STANDARD_COMPLETIONS.biomesApplied],
});
