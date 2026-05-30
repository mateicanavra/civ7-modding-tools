import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  plotCoasts,
  plotContinents,
  plotMountains,
  plotVolcanoes,
} from "./steps/index.js";

export default createStage({
  id: "map-morphology",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [plotCoasts, plotContinents, plotMountains, plotVolcanoes],
} as const);
