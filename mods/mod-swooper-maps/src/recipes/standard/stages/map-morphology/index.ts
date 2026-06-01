import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  buildElevation,
  plotCoasts,
  plotContinents,
  plotMountains,
  plotVolcanoes,
} from "./steps/index.js";

export default createStage({
  id: "map-morphology",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [plotCoasts, plotContinents, plotMountains, plotVolcanoes, buildElevation],
} as const);
