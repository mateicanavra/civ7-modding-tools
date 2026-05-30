import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  derivePlacementInputs,
  placeNaturalWonders,
  placement,
  plotLandmassRegions,
} from "./steps/index.js";

/**
 * Placement exposes true gameplay products as step boundaries while keeping
 * maintenance sequencing inside the transactional placement step.
 */
export default createStage({
  id: "placement",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [derivePlacementInputs, plotLandmassRegions, placeNaturalWonders, placement],
} as const);
