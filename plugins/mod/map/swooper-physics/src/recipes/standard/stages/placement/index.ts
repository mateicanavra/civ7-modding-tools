import { createStage } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { AdjustResourcesStep } from "./steps/adjust-resources/step.js";
import { AssignAdvancedStartsStep } from "./steps/assign-advanced-starts/step.js";
import { AssignStartsStep } from "./steps/assign-starts/step.js";
import { ObservePlacementParityStep } from "./steps/observe-placement-parity/step.js";
import { PlaceDiscoveriesStep } from "./steps/place-discoveries/step.js";
import { PlaceNaturalWondersStep } from "./steps/place-natural-wonders/step.js";
import { PlaceResourcesStep } from "./steps/place-resources/step.js";
import { PlanNaturalWondersStep } from "./steps/plan-natural-wonders/step.js";
import { PlanResourceDemandsStep } from "./steps/plan-resource-demands/step.js";
import { PlotLandmassRegionsStep } from "./steps/plot-landmass-regions/step.js";
import { PreparePlacementSurfaceStep } from "./steps/prepare-placement-surface/step.js";
import { SelectResourceSitesStep } from "./steps/select-resource-sites/step.js";

/**
 * Placement exposes each gameplay product as a step boundary. Surface
 * preparation remains grouped because terrain validation, area recalc, water
 * storage, and coast restoration form one transaction consumed by later
 * engine-surface readers. Landmass-region projection is independently driven
 * by admitted topology artifacts. Terminal parity remains last in the complete
 * recipe while depending only on the prepared surface it measures.
 *
 * Resource ordering (S5, D3 contract change): planning stays before starts;
 * stamping runs after the resource↔start support pass —
 * plan-resource-demands → select-resource-sites → assign-starts →
 * adjust-resources → place-resources.
 */
export default createStage({
  id: "placement",
  steps: orderStandardStageSteps("placement", {
    "plan-natural-wonders": PlanNaturalWondersStep,
    "place-natural-wonders": PlaceNaturalWondersStep,
    "prepare-placement-surface": PreparePlacementSurfaceStep,
    "plot-landmass-regions": PlotLandmassRegionsStep,
    "plan-resource-demands": PlanResourceDemandsStep,
    "select-resource-sites": SelectResourceSitesStep,
    "assign-starts": AssignStartsStep,
    "adjust-resources": AdjustResourcesStep,
    "place-resources": PlaceResourcesStep,
    "place-discoveries": PlaceDiscoveriesStep,
    "assign-advanced-starts": AssignAdvancedStartsStep,
    "observe-placement-parity": ObservePlacementParityStep,
  }),
} as const);
