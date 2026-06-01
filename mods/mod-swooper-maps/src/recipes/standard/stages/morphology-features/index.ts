import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { islands, landmasses, mountains, volcanoes } from "./steps/index.js";
import {
  MorphologyOrogenyKnobSchema,
  MorphologyVolcanismKnobSchema,
} from "@mapgen/domain/morphology/config.js";
import {
  IslandsConfigSchema,
  MountainsConfigSchema,
  VolcanoesConfigSchema,
} from "@mapgen/domain/morphology/ops";

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
    mountainRanges: Type.Optional(MountainsConfigSchema),
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
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    islands: {
      islands: defaultEnvelope({ islands: config.islandChains ?? {} }),
    },
    mountains: {
      ridges: defaultEnvelope(config.mountainRanges),
      foothills: defaultEnvelope(config.mountainRanges),
      roughLands: defaultEnvelope(config.mountainRanges),
    },
    volcanoes: {
      volcanoes: defaultEnvelope(config.volcanoes),
    },
    landmasses: {
      landmasses: defaultEnvelope({}),
    },
  }),
} as const);
