import { artifacts as biomeArtifacts } from "@mapgen/domain/ecology/modules/biomes/artifacts/index.js";
import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { artifacts as morphologyArtifacts } from "@mapgen/domain/morphology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring/contracts";
import {
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../../tag-contracts.js";
import { artifacts as mapEcologyArtifacts } from "../../artifacts/index.js";

/**
 * Defines the translation from Ecology biome symbols to fixed official Civ7 biome identities. It
 * applies engine IDs and publishes binding evidence without moving engine identity into
 * Ecology truth.
 */
export const PlotBiomesStepContract = defineStep({
  id: "plot-biomes",
  engine: ["getBiomeGlobal", "setBiomeType", "isWater"] as const,
  requires: [],
  provides: [
    STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.ecologyBiomesParityCaptured,
  ],
  artifacts: {
    requires: [
      biomeArtifacts.biomeClassification,
      climateArtifacts.climateIndices,
      morphologyArtifacts.topography,
    ],
    provides: [mapEcologyArtifacts.biomeBindings],
  },
  schema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Biome projection has no authored step configuration; the local projection policy binds Swooper biome symbols to official Civ7 identities.",
    }
  ),
});
