import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { PlotRiversStep } from "./steps/plot-rivers/step.js";

const NavigableRiverDensityKnobSchema = Type.Union(
  [Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")],
  {
    default: "normal",
    description:
      "Civ-visible navigable river trunk density (sparse/normal/dense). Applies after Hydrology has authored the physical river network.",
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
  // The public density knob compiles into fixed internal selection policy during normalization.
  compile: () => ({}),
  steps: orderStandardStageSteps("map-rivers", {
    "plot-rivers": PlotRiversStep,
  }),
} as const);
