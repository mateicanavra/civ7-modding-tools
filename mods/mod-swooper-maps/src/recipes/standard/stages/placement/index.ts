import { createStage } from "@swooper/mapgen-core/authoring";
import {
  assignAdvancedStarts,
  assignStarts,
  derivePlacementInputs,
  placeDiscoveries,
  placeNaturalWonders,
  placeResources,
  placement,
  planResources,
  plotLandmassRegions,
  preparePlacementSurface,
} from "./steps/index.js";
import {
  PlacementKnobsSchema,
  PlacementPublicSchema,
  compilePlacementPublicConfig,
} from "../placement-public-config.js";

/**
 * Placement exposes each gameplay product as a step boundary. Surface
 * preparation remains grouped because terrain validation, area recalc, water
 * storage, and landmass-region restamping form one transactional precondition
 * for all downstream placement products.
 */
export default createStage({
  id: "placement",
  knobsSchema: PlacementKnobsSchema,
  public: PlacementPublicSchema,
  steps: [
    derivePlacementInputs,
    plotLandmassRegions,
    placeNaturalWonders,
    preparePlacementSurface,
    planResources,
    placeResources,
    assignStarts,
    placeDiscoveries,
    assignAdvancedStarts,
    placement,
  ],
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compilePlacementPublicConfig(config),
} as const);
