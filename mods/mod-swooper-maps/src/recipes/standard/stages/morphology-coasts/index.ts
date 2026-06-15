import {
  MorphologyCoastRuggednessKnobSchema,
  MorphologySeaLevelKnobSchema,
  MorphologyShelfWidthKnobSchema,
} from "@mapgen/domain/morphology/config.js";
import {
  CoastConfigSchema,
  HypsometryConfigSchema,
  LandmaskConfigSchema,
  ReliefConfigSchema,
  ShelfMaskConfigSchema,
  SubstrateConfigSchema,
} from "@mapgen/domain/morphology/ops";
import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { landmassPlates, ruggedCoasts } from "./steps/index.js";

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
    additionalProperties: false,
    description:
      "Morphology-coasts controls for sea level, coast ruggedness, and shelf width applied as deterministic transforms.",
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
    additionalProperties: false,
    description:
      "Morphology coast and land/sea shaping controls for substrate, relief, water coverage, continents, coastline shape, and shelf width.",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config: config ?? {} };
}

export default createStage({
  id: "morphology-coasts",
  knobsSchema,
  public: publicSchema,
  steps: orderStandardStageSteps("morphology-coasts", {
    "landmass-plates": landmassPlates,
    "rugged-coasts": ruggedCoasts,
  }),
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
