import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  MapMorphologyKnobsSchema,
  MapMorphologyPublicSchema,
} from "../map-projection-public-config.js";
import { plotCoasts, plotContinents, plotMountains, plotVolcanoes } from "./steps/index.js";

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
    "plot-coasts": plotCoasts,
    "plot-continents": plotContinents,
    "plot-mountains": plotMountains,
    "plot-volcanoes": plotVolcanoes,
  }),
} as const);
