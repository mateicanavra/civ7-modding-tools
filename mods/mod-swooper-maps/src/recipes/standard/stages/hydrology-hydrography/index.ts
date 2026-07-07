import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { HydrologyHydrographyPublicSchema } from "../hydrology-public-config.js";
import { lakes, rivers } from "./steps/index.js";

const HydrologyRiverDensityKnobSchema = Type.Union(
  [Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")],
  {
    default: "normal",
    description:
      "Physical river-network classification density preset (sparse/normal/dense). Applies as a deterministic transform over Hydrology river classification thresholds; Civ-visible projection remains downstream.",
  }
);

const HydrologyLakeinessKnobSchema = Type.Union(
  [Type.Literal("few"), Type.Literal("normal"), Type.Literal("many")],
  {
    default: "normal",
    description:
      "Lake intent preset (few/normal/many). Applies as a deterministic transform over sink-derived lake planning; engine projection remains downstream.",
  }
);

const knobsSchema = Type.Object(
  {
    /**
     * Physical river-network classification density.
     *
     * Stage scope:
     * - Transforms Hydrology river classification thresholds over the defaulted baseline.
     * - Does not change canonical drainage routing or Civ-visible projection ownership.
     */
    riverDensity: Type.Optional(HydrologyRiverDensityKnobSchema),
    /**
     * Hydrology lake intent density.
     *
     * Stage scope:
     * - Transforms lake planning over the defaulted lake controls.
     * - Does not call Civ7 lake generation or tune projection frequency.
     */
    lakeiness: Type.Optional(HydrologyLakeinessKnobSchema),
  },
  {
    description:
      "Hydrology hydrography knobs (riverDensity/lakeiness). Knobs apply as deterministic transforms over Hydrology river classification and lake-intent planning; Civ-visible projection remains downstream.",
  }
);

export default createStage({
  id: "hydrology-hydrography",
  knobsSchema,
  public: HydrologyHydrographyPublicSchema,
  steps: orderStandardStageSteps("hydrology-hydrography", { rivers, lakes }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    rivers: {
      drainageRouting: { strategy: "default", config: config.drainageRouting ?? {} },
      accumulateDischarge: { strategy: "default", config: config.runoff ?? {} },
      projectRiverNetwork: { strategy: "default", config: config.riverNetwork ?? {} },
    },
    lakes: {
      planLakes: { strategy: "default", config: config.lakes ?? {} },
    },
  }),
} as const);
