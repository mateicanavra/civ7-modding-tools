import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyLandformsArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_ENGINE_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Defines the translation from Ecology biome symbols to fixed official Civ7 biome identities.
 * Projected identities and current land/water parity remain invocation-local evidence.
 */
export const config = defineStep({
  id: "plot-biomes",
  engine: ["getBiomeGlobal", "setBiomeType", "isWater"] as const,
  requires: [],
  provides: [STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied],
  artifacts: {
    requires: [
      biomeArtifacts.biomeClassification,
      climateArtifacts.climateIndices,
      morphologyLandformsArtifacts.topography,
    ],
  },
  schema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Biome projection has no authored step configuration; stage policy binds Swooper biome symbols to official Civ7 identities.",
    }
  ),
});
