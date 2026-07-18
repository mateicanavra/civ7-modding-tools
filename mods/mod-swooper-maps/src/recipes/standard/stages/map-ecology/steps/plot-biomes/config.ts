import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";

import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../tag-contracts.js";
import {
  artifactModules as ecologyArtifactModules,
  artifacts as ecologyArtifacts,
} from "../../../ecology/artifacts/index.js";
import { BiomeEngineBindingsSchema } from "../../../map-projection-public-config.js";
import { artifacts as morphologyArtifacts } from "../../../morphology/artifacts/index.js";

/**
 * Defines the translation from Ecology biome symbols to configured Civ7 biome globals. It
 * applies engine IDs and publishes binding evidence without moving engine identity into
 * Ecology truth.
 */
export const PlotBiomesStepContract = defineStep({
  id: "plot-biomes",
  phase: "ecology",
  requires: [],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.ecologyBiomesParityCaptured,
  ],
  artifacts: {
    requires: [ecologyArtifacts.biomeClassification, morphologyArtifacts.topography],
    provides: [ecologyArtifactModules.biomeBindings],
  },
  schema: Type.Object(
    {
      bindings: BiomeEngineBindingsSchema,
    },
    {
      additionalProperties: false,
      description: "Complete bindings from biome symbols to engine biome globals.",
    }
  ),
});
