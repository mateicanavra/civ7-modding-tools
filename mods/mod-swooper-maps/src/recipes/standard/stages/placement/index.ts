import { createStage } from "@swooper/mapgen-core/authoring";
import {
  compilePlacementPublicConfig,
  PlacementKnobsSchema,
  PlacementPublicSchema,
} from "../placement-public-config.js";
import {
  adjustResources,
  assignAdvancedStarts,
  assignStarts,
  derivePlacementInputs,
  placeDiscoveries,
  placement,
  placeNaturalWonders,
  placeResources,
  planResources,
  plotLandmassRegions,
  preparePlacementSurface,
} from "./steps/index.js";

/**
 * Placement exposes each gameplay product as a step boundary. Surface
 * preparation remains grouped because terrain validation, area recalc, water
 * storage, and landmass-region restamping form one transactional precondition
 * for all downstream placement products.
 *
 * Resource ordering (S5, D3 contract change): planning stays before starts;
 * stamping runs after the resource↔start support pass —
 * plan-resources → assign-starts → adjust-resources → place-resources.
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
    assignStarts,
    adjustResources,
    placeResources,
    placeDiscoveries,
    assignAdvancedStarts,
    placement,
  ],
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compilePlacementPublicConfig(config),
} as const);
