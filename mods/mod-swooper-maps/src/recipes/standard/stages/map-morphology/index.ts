import { createStage } from "@swooper/mapgen-core/authoring";
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
  steps: [plotCoasts, plotContinents, plotMountains, plotVolcanoes],
} as const);
