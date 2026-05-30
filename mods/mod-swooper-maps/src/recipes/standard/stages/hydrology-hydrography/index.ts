import { Type, createStage } from "@swooper/mapgen-core/authoring";
import { lakes, rivers } from "./steps/index.js";
import {
  HydrologyLakeinessKnobSchema,
  HydrologyRiverDensityKnobSchema,
} from "@mapgen/domain/hydrology/config.js";

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
     * - Transforms `plan-lakes` over the defaulted op config.
     * - Does not call Civ7 lake generation or tune projection frequency.
     */
    lakeiness: Type.Optional(HydrologyLakeinessKnobSchema),
  },
  {
    description:
      "Hydrology hydrography knobs (riverDensity/lakeiness). Knobs apply after defaulted step config as deterministic transforms.",
  }
);

export default createStage({
  id: "hydrology-hydrography",
  knobsSchema,
  steps: [rivers, lakes],
} as const);
