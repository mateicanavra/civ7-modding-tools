import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../../contract-manifest.js";
import { PlotRiversStep } from "./steps/plot-rivers/step.js";

const NavigableRiverDensityKnobSchema = Type.Union(
  [
    Type.Null({
      description: "Preserves the independently authored river-projection thresholds.",
    }),
    Type.Literal("sparse"),
    Type.Literal("normal"),
    Type.Literal("dense"),
  ],
  {
    default: null,
    description:
      "Optional Civ-visible navigable river density. A preset overrides advanced thresholds after Hydrology authors the physical network; null preserves them.",
  }
);

const knobsSchema = Type.Object(
  {
    navigableRiverDensity: NavigableRiverDensityKnobSchema,
  },
  {
    additionalProperties: false,
    description:
      "Map-rivers knobs. Use navigableRiverDensity for MapGen-owned Civ-visible river projection after elevation is finalized.",
  }
);

/**
 * Navigable river materialization stage.
 *
 * River materialization is separated from static lake projection because
 * navigable rivers need the finalized elevation and water surface. MapGen owns
 * the river terrain selection; Civ7 is used only for terrain validation, cache
 * refresh, and naming at this boundary.
 */
export default createStage({
  id: "map-rivers",
  knobsSchema,
  steps: orderStandardStageSteps("map-rivers", {
    "plot-rivers": PlotRiversStep,
  }),
} as const);
