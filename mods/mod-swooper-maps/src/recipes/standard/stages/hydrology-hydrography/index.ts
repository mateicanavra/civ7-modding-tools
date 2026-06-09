import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { lakes, rivers } from "./steps/index.js";
import {
  HydrologyLakeinessKnobSchema,
  HydrologyRiverDensityKnobSchema,
} from "@mapgen/domain/hydrology/config.js";
import { HydrologyHydrographyPublicSchema } from "../hydrology-public-config.js";

const knobsSchema = Type.Object(
  {
    /**
     * River projection density.
     *
     * Stage scope:
     * - Transforms projection thresholds/length bounds over the defaulted baseline.
     * - Does not change discharge routing truth (only projection/classification).
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
      "Hydrology hydrography knobs (riverDensity/lakeiness). Knobs apply after defaulted river and lake controls as deterministic transforms.",
  }
);

export default createStage({
  id: "hydrology-hydrography",
  knobsSchema,
  public: HydrologyHydrographyPublicSchema,
  steps: [rivers, lakes],
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
