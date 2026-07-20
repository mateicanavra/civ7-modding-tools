import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import {
  compilePlacementPublicConfig,
  PlacementKnobsSchema,
  PlacementPublicSchema,
} from "../placement-public-config.js";
import { AdjustResourcesStep } from "./steps/adjust-resources/step.js";
import { AssignAdvancedStartsStep } from "./steps/assign-advanced-starts/step.js";
import { AssignStartsStep } from "./steps/assign-starts/step.js";
import { DerivePlacementInputsStep } from "./steps/derive-placement-inputs/step.js";
import { PlaceDiscoveriesStep } from "./steps/place-discoveries/step.js";
import { PlaceNaturalWondersStep } from "./steps/place-natural-wonders/step.js";
import { PlaceResourcesStep } from "./steps/place-resources/step.js";
import { PlacementStep } from "./steps/placement/step.js";
import { PlanResourcesStep } from "./steps/plan-resources/step.js";
import { PlotLandmassRegionsStep } from "./steps/plot-landmass-regions/step.js";
import { PreparePlacementSurfaceStep } from "./steps/prepare-placement-surface/step.js";

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
    "derive-placement-inputs": DerivePlacementInputsStep,
    "plot-landmass-regions": PlotLandmassRegionsStep,
    "place-natural-wonders": PlaceNaturalWondersStep,
    "prepare-placement-surface": PreparePlacementSurfaceStep,
    "plan-resources": PlanResourcesStep,
    "assign-starts": AssignStartsStep,
    "adjust-resources": AdjustResourcesStep,
    "place-resources": PlaceResourcesStep,
    "place-discoveries": PlaceDiscoveriesStep,
    "assign-advanced-starts": AssignAdvancedStartsStep,
    placement: PlacementStep,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) =>
    compilePlacementPublicConfig(config),
} as const);
