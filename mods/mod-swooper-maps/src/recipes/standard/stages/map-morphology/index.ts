import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  MapMorphologyKnobsSchema,
  MapMorphologyPublicSchema,
} from "../map-projection-public-config.js";
import { PlotCoastsStep } from "./steps/plot-coasts/step.js";
import { PlotContinentsStep } from "./steps/plot-continents/step.js";
import { PlotMountainsStep } from "./steps/plot-mountains/step.js";
import { PlotVolcanoesStep } from "./steps/plot-volcanoes/step.js";

/**
 * Projects Morphology truth in engine lifecycle order: coasts, continents,
 * mountains, then volcanoes, with no landform planning in this stage.
 */
export default createStage({
  id: "map-morphology",
  knobsSchema: MapMorphologyKnobsSchema,
  public: MapMorphologyPublicSchema,
  compile: () => ({
    "plot-coasts": {},
    "plot-continents": {},
    "plot-mountains": {},
    "plot-volcanoes": {},
  }),
  steps: orderStandardStageSteps("map-morphology", {
    "plot-coasts": PlotCoastsStep,
    "plot-continents": PlotContinentsStep,
    "plot-mountains": PlotMountainsStep,
    "plot-volcanoes": PlotVolcanoesStep,
  }),
} as const);
