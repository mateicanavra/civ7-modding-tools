import { BiomeEngineBindingsSchema } from "@mapgen/domain/ecology";
import { defineStep, Type } from "@swooper/mapgen-core/authoring";

import {
  FIELD_DEPENDENCY_TAGS,
  MAP_PROJECTION_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../tags.js";
import { ecologyArtifacts } from "../../ecology/artifacts.js";
import { morphologyArtifacts } from "../../morphology/artifacts.js";

const PlotBiomesStepContract = defineStep({
  id: "plot-biomes",
  phase: "ecology",
  requires: [],
  provides: [
    FIELD_DEPENDENCY_TAGS.field.biomeId,
    STANDARD_ENGINE_EFFECT_TAGS.engine.biomesApplied,
    MAP_PROJECTION_EFFECT_TAGS.map.ecologyBiomesParityCaptured,
  ],
  artifacts: {
    requires: [ecologyArtifacts.biomeClassification, morphologyArtifacts.topography],
    provides: [ecologyArtifacts.biomeBindings],
  },
  schema: Type.Object(
    {
      bindings: Type.Optional(BiomeEngineBindingsSchema),
    },
    {
      description: "Optional overrides for binding biome symbols to engine biome globals.",
    }
  ),
});

export default PlotBiomesStepContract;
