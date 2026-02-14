import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  HydrologyRiverDensityKnobSchema,
} from "@mapgen/domain/hydrology/shared/knobs.js";
import { lakes, plotRivers } from "./steps/index.js";

const knobsSchema = Type.Object(
  {
    riverDensity: Type.Optional(HydrologyRiverDensityKnobSchema),
  },
  {
    description:
      "Map-hydrology knobs (riverDensity). Knobs apply to engine projection only.",
  }
);

export default createStage({
  id: "map-hydrology",
  knobsSchema,
  steps: [lakes, plotRivers],
} as const);
