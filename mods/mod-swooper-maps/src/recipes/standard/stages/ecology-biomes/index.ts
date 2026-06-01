import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  EcologyBiomesPublicSchema,
  compileEcologyBiomesPublicConfig,
} from "../ecology-public-config.js";
import biomes from "./steps/biomes/index.js";

/**
 * Biome classification is its own truth stage because downstream feature and
 * projection stages consume the biome artifact as a stable ecology boundary.
 */
export default createStage({
  id: "ecology-biomes",
  knobsSchema: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Ecology-biomes currently has no stage-level knobs; authoring control lives in biome classification.",
    }
  ),
  public: EcologyBiomesPublicSchema,
  steps: [biomes],
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compileEcologyBiomesPublicConfig(config),
} as const);
