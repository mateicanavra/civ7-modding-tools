import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { plotRivers } from "./steps/index.js";

const NavigableRiverDensityKnobSchema = Type.Union(
  [Type.Literal("sparse"), Type.Literal("normal"), Type.Literal("dense")],
  {
    description:
      "Civ-visible navigable river trunk density (sparse/normal/dense). Applies after Hydrology has authored the physical river network.",
  }
);

const knobsSchema = Type.Object(
  {
    navigableRiverDensity: Type.Optional(NavigableRiverDensityKnobSchema),
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
  public: Type.Object(
    {},
    {
      additionalProperties: false,
      description:
        "Map river projection controls. Navigable river materialization currently uses recipe defaults and stage knobs rather than per-run authored fields.",
    }
  ),
  compile: () => ({
    "plot-rivers": {},
  }),
  steps: orderStandardStageSteps("map-rivers", {
    "plot-rivers": plotRivers,
  }),
} as const);
