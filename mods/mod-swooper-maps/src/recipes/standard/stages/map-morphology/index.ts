import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { plotCoasts, plotContinents, plotMountains, plotVolcanoes } from "./steps/index.js";

const MapMorphologyKnobsSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map morphology knobs. Terrain projection currently has no author-facing stage knobs.",
  }
);

const MapMorphologyPublicSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description:
      "Map morphology projection controls. This stage materializes upstream landmass, coast, mountain, and volcano truth into Civ7 terrain fields without additional author-facing controls.",
  }
);

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
