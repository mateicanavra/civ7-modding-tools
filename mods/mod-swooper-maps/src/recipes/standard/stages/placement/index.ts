import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
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
  steps: orderStandardStageSteps("placement", {
    "derive-placement-inputs": derivePlacementInputs,
    "plot-landmass-regions": plotLandmassRegions,
    "place-natural-wonders": placeNaturalWonders,
    "prepare-placement-surface": preparePlacementSurface,
    "plan-resources": planResources,
    "assign-starts": assignStarts,
    "adjust-resources": adjustResources,
    "place-resources": placeResources,
    "place-discoveries": placeDiscoveries,
    "assign-advanced-starts": assignAdvancedStarts,
    placement,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compilePlacementPublicConfig(config),
} as const);
