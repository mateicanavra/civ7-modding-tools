import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { landmassPlates, ruggedCoasts } from "./steps/index.js";
import {
  CoastConfigSchema,
  HypsometryConfigSchema,
  LandmaskConfigSchema,
  MorphologyCoastRuggednessKnobSchema,
  MorphologySeaLevelKnobSchema,
  MorphologyShelfWidthKnobSchema,
  ReliefConfigSchema,
  ShelfMaskConfigSchema,
  SubstrateConfigSchema,
} from "@mapgen/domain/morphology/config.js";

/**
 * Morphology-coasts knobs (seaLevel/coastRuggedness/shelfWidth).
 * Knobs apply after defaulted step config as deterministic transforms.
 */
const knobsSchema = Type.Object(
  {
    seaLevel: Type.Optional(MorphologySeaLevelKnobSchema),
    coastRuggedness: Type.Optional(MorphologyCoastRuggednessKnobSchema),
    shelfWidth: Type.Optional(MorphologyShelfWidthKnobSchema),
  },
  {
    description:
      "Morphology-coasts knobs (seaLevel/coastRuggedness/shelfWidth). Knobs apply after defaulted step config as deterministic transforms.",
  }
);

const publicSchema = Type.Object(
  {
    substrate: Type.Optional(SubstrateConfigSchema),
    relief: Type.Optional(ReliefConfigSchema),
    waterCoverage: Type.Optional(HypsometryConfigSchema),
    continents: Type.Optional(LandmaskConfigSchema),
    coastlineShape: Type.Optional(CoastConfigSchema),
    shelf: Type.Optional(ShelfMaskConfigSchema),
  },
  {
    description:
      "Morphology coast and land/sea shaping controls. Public keys are semantic authoring inputs; stage compilation lowers them to internal morphology step/op config.",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config: config ?? {} };
}

export default createStage({
  id: "morphology-coasts",
  knobsSchema,
  public: publicSchema,
  steps: [landmassPlates, ruggedCoasts],
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "landmass-plates": {
      beltDrivers: defaultEnvelope({}),
      substrate: defaultEnvelope(config.substrate),
      baseTopography: defaultEnvelope(config.relief),
      seaLevel: defaultEnvelope(config.waterCoverage),
      landmask: defaultEnvelope(config.continents),
    },
    "rugged-coasts": {
      coastlines: defaultEnvelope({ coast: config.coastlineShape ?? {} }),
      shelfMask: defaultEnvelope(config.shelf),
    },
  }),
} as const);
