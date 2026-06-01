import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  assignAdvancedStarts,
  assignStarts,
  derivePlacementInputs,
  placeDiscoveries,
  placeNaturalWonders,
  placeResources,
  placement,
  plotLandmassRegions,
  preparePlacementSurface,
} from "./steps/index.js";

/**
 * Placement exposes each gameplay product as a step boundary. Surface
 * preparation remains grouped because terrain validation, area recalc, water
 * storage, and landmass-region restamping form one transactional precondition
 * for all downstream placement products.
 */
export default createStage({
  id: "placement",
  knobsSchema: Type.Object({}, { additionalProperties: false }),
  steps: [
    derivePlacementInputs,
    plotLandmassRegions,
    placeNaturalWonders,
    preparePlacementSurface,
    placeResources,
    assignStarts,
    placeDiscoveries,
    assignAdvancedStarts,
    placement,
  ],
} as const);
