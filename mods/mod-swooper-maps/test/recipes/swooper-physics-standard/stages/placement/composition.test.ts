import { describe, expect, it } from "bun:test";
import standardRecipe from "../../../../../src/recipes/standard/recipe.js";
import { artifacts as ecologyArtifacts } from "../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import { artifacts as placementArtifacts } from "../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import { AdjustResourcesStep } from "../../../../../src/recipes/standard/stages/placement/steps/adjust-resources/step.js";
import { AssignAdvancedStartsStep } from "../../../../../src/recipes/standard/stages/placement/steps/assign-advanced-starts/step.js";
import { AssignStartsStep } from "../../../../../src/recipes/standard/stages/placement/steps/assign-starts/step.js";
import { DerivePlacementInputsStep } from "../../../../../src/recipes/standard/stages/placement/steps/derive-placement-inputs/step.js";
import { PlaceDiscoveriesStep } from "../../../../../src/recipes/standard/stages/placement/steps/place-discoveries/step.js";
import { PlaceNaturalWondersStep } from "../../../../../src/recipes/standard/stages/placement/steps/place-natural-wonders/step.js";
import { PlaceResourcesStep } from "../../../../../src/recipes/standard/stages/placement/steps/place-resources/step.js";
import { PlacementStep } from "../../../../../src/recipes/standard/stages/placement/steps/placement/step.js";
import { PlanResourcesStep } from "../../../../../src/recipes/standard/stages/placement/steps/plan-resources/step.js";
import { PreparePlacementSurfaceStep } from "../../../../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/step.js";
import {
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../../src/recipes/standard/tags.js";

describe("placement product boundaries", () => {
  it("consumes feature projection through admitted artifact evidence", () => {
    expect(DerivePlacementInputsStep.contract.requires).toContain(
      STANDARD_ENGINE_EFFECT_TAGS.engine.featuresApplied
    );
    expect(DerivePlacementInputsStep.contract.artifacts?.requires).toContain(
      ecologyArtifacts.featureEngineSnapshot
    );
    expect(DerivePlacementInputsStep.contract.requires.some((id) => id.startsWith("field:"))).toBe(
      false
    );
  });

  it("promotes natural wonder stamping as a product/effect boundary before final placement", () => {
    const placementStepIds = standardRecipe.recipe.steps
      .map((step) => step.id)
      .filter((id) => id.includes(".placement."));

    expect(placementStepIds).toContain("mod-swooper-maps.standard.placement.place-natural-wonders");
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-natural-wonders")
    ).toBeLessThan(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.prepare-placement-surface")
    );

    expect(PlaceNaturalWondersStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced
    );
    expect(
      PlaceNaturalWondersStep.contract.artifacts?.provides?.map(({ artifact }) => artifact)
    ).toContain(placementArtifacts.naturalWonderPlacement);
    expect(PreparePlacementSurfaceStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced
    );
    // S6: ordering after the wonder stamp is tag-only; the step declares no
    // read-and-discard artifact requirement on the wonder evidence.
    expect(PreparePlacementSurfaceStep.contract.artifacts?.requires).not.toContain(
      placementArtifacts.naturalWonderPlacement
    );
  });

  it("promotes resources, starts, discoveries, and advanced starts as product boundaries", () => {
    const placementStepIds = standardRecipe.recipe.steps
      .map((step) => step.id)
      .filter((id) => id.includes(".placement."));

    expect(placementStepIds).toEqual(
      expect.arrayContaining([
        "mod-swooper-maps.standard.placement.prepare-placement-surface",
        "mod-swooper-maps.standard.placement.plan-resources",
        "mod-swooper-maps.standard.placement.assign-starts",
        "mod-swooper-maps.standard.placement.adjust-resources",
        "mod-swooper-maps.standard.placement.place-resources",
        "mod-swooper-maps.standard.placement.place-discoveries",
        "mod-swooper-maps.standard.placement.assign-advanced-starts",
        "mod-swooper-maps.standard.placement.placement",
      ])
    );
    // S5 (D3 contract change): plan-resources -> assign-starts ->
    // adjust-resources (support pass) -> place-resources (stamp) ->
    // place-discoveries. Planning stays before starts; stamping moves after
    // the support pass.
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.plan-resources")
    ).toBeLessThan(placementStepIds.indexOf("mod-swooper-maps.standard.placement.assign-starts"));
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.assign-starts")
    ).toBeLessThan(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.adjust-resources")
    );
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.adjust-resources")
    ).toBeLessThan(placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-resources"));
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-resources")
    ).toBeLessThan(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-discoveries")
    );

    expect(PlanResourcesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned
    );
    expect(AssignStartsStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned
    );
    expect(AdjustResourcesStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned
    );
    expect(AdjustResourcesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted
    );
    expect(
      AdjustResourcesStep.contract.artifacts?.provides?.map(({ artifact }) => artifact)
    ).toContain(placementArtifacts.resourcePlanAdjusted);
    expect(PlaceResourcesStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted
    );
    expect(PlaceResourcesStep.contract.artifacts?.requires).toContain(
      placementArtifacts.resourcePlanAdjusted
    );
    expect(PlaceResourcesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced
    );
    expect(PlaceDiscoveriesStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced
    );
    expect(AssignStartsStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned
    );
    expect(PlaceDiscoveriesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced
    );
    expect(AssignAdvancedStartsStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned
    );
    expect(PlacementStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned
    );
    expect(PlacementStep.contract.artifacts?.requires).toEqual(
      expect.arrayContaining([
        placementArtifacts.resourcePlacementOutcomes,
        placementArtifacts.startAssignment,
        placementArtifacts.discoveryPlacementOutcomes,
        placementArtifacts.advancedStartAssignment,
      ])
    );
  });

  it("keeps maintenance operations transactional until they own an independent product contract", () => {
    const placementStepIds = standardRecipe.recipe.steps.map((step) => step.id);

    expect(PlacementStep.contract.provides).toContain(
      STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied
    );
    expect(placementStepIds.some((id) => id.includes(".terrain.validate"))).toBe(false);
    expect(placementStepIds.some((id) => id.includes(".areas.recalculate"))).toBe(false);
    expect(placementStepIds.some((id) => id.includes(".water.store"))).toBe(false);
    expect(placementStepIds.some((id) => id.includes(".fertility.recalculate"))).toBe(false);
  });
});
