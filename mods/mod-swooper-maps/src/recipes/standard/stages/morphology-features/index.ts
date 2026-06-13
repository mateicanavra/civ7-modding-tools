import {
  MorphologyOrogenyKnobSchema,
  MorphologyVolcanismKnobSchema,
} from "@mapgen/domain/morphology/config.js";
import { IslandsConfigSchema, VolcanoesConfigSchema } from "@mapgen/domain/morphology/ops";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import {
  MountainRangesPublicSchema,
  resolveMountainRangesPublicConfig,
} from "./mountain-ranges-public-config.js";
import { islands, landmasses, mountains, volcanoes } from "./steps/index.js";

/**
 * Morphology-features owns landform intent before map projection. Volcanism
 * tunes volcano intent; orogeny tunes ridge/foothill/rough-land intent before
 * map-morphology stamps terrain.
 */
const knobsSchema = Type.Object(
  {
    orogeny: Type.Optional(MorphologyOrogenyKnobSchema),
    volcanism: Type.Optional(MorphologyVolcanismKnobSchema),
  },
  {
    additionalProperties: false,
    description:
      "Morphology-features controls for orogeny and volcanism applied as deterministic transforms.",
  }
);

const publicSchema = Type.Object(
  {
    islandChains: Type.Optional(IslandsConfigSchema),
    mountainRanges: Type.Optional(MountainRangesPublicSchema),
    volcanoes: Type.Optional(VolcanoesConfigSchema),
  },
  {
    additionalProperties: false,
    description:
      "Morphology landform intent controls for island chains, mountain ranges, volcanoes, and landmass summaries.",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config: config ?? {} };
}

export default createStage({
  id: "morphology-features",
  knobsSchema,
  public: publicSchema,
  steps: [islands, mountains, volcanoes, landmasses],
  compile: ({ config }: { config: Record<string, unknown> }) => {
    const mountainRanges = resolveMountainRangesPublicConfig(config.mountainRanges);
    return {
      islands: {
        islands: defaultEnvelope({ islands: config.islandChains ?? {} }),
      },
      mountains: {
        ridges: defaultEnvelope(mountainRanges),
        foothills: defaultEnvelope(mountainRanges),
        roughLands: defaultEnvelope(mountainRanges),
      },
      volcanoes: {
        volcanoes: defaultEnvelope(config.volcanoes),
      },
      landmasses: {
        landmasses: defaultEnvelope({}),
      },
    };
  },
} as const);
