import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  buildElevation,
  plotCoasts,
  plotContinents,
  plotMountains,
  plotVolcanoes,
} from "./steps/index.js";
import { MorphologyOrogenyKnobSchema } from "@mapgen/domain/morphology/config.js";

export default createStage({
  id: "map-morphology",
  knobsSchema: Type.Object(
    {
      orogeny: Type.Optional(MorphologyOrogenyKnobSchema),
    },
    {
      description:
        "Map-morphology knobs (orogeny). Knobs apply after defaulted step config as deterministic transforms.",
    }
  ),
  steps: [plotCoasts, plotContinents, plotMountains, plotVolcanoes, buildElevation],
} as const);
