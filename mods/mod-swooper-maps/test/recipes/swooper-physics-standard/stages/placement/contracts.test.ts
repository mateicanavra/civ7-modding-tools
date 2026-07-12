import { describe, expect, it } from "bun:test";
import standardRecipe from "../../../../../src/recipes/standard/recipe.js";
import {
  artifacts as placementArtifacts,
  validators as placementArtifactValidators,
} from "../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
import adjustResourcesStep from "../../../../../src/recipes/standard/stages/placement/steps/adjust-resources/index.js";
import assignAdvancedStartsStep from "../../../../../src/recipes/standard/stages/placement/steps/assign-advanced-starts/index.js";
import assignStartsStep from "../../../../../src/recipes/standard/stages/placement/steps/assign-starts/index.js";
import placeDiscoveriesStep from "../../../../../src/recipes/standard/stages/placement/steps/place-discoveries/index.js";
import placeNaturalWondersStep from "../../../../../src/recipes/standard/stages/placement/steps/place-natural-wonders/index.js";
import placeResourcesStep from "../../../../../src/recipes/standard/stages/placement/steps/place-resources/index.js";
import placementStep from "../../../../../src/recipes/standard/stages/placement/steps/placement/index.js";
import planResourcesStep from "../../../../../src/recipes/standard/stages/placement/steps/plan-resources/index.js";
import preparePlacementSurfaceStep from "../../../../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/index.js";
import {
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../../../../src/recipes/standard/tags.js";

describe("placement product/effect contracts", () => {
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

    expect(placeNaturalWondersStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced
    );
    expect(placeNaturalWondersStep.contract.artifacts.provides).toContain(
      placementArtifacts.naturalWonderPlacement
    );
    expect(preparePlacementSurfaceStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced
    );
    // S6: ordering after the wonder stamp is tag-only; the step declares no
    // read-and-discard artifact requirement on the wonder evidence.
    expect(preparePlacementSurfaceStep.contract.artifacts.requires).not.toContain(
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

    expect(planResourcesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned
    );
    expect(assignStartsStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlanned
    );
    expect(adjustResourcesStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned
    );
    expect(adjustResourcesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted
    );
    expect(adjustResourcesStep.contract.artifacts.provides).toContain(
      placementArtifacts.resourcePlanAdjusted
    );
    expect(placeResourcesStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesAdjusted
    );
    expect(placeResourcesStep.contract.artifacts.requires).toContain(
      placementArtifacts.resourcePlanAdjusted
    );
    expect(placeResourcesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced
    );
    expect(placeDiscoveriesStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.resourcesPlaced
    );
    expect(assignStartsStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.startsAssigned
    );
    expect(placeDiscoveriesStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.discoveriesPlaced
    );
    expect(assignAdvancedStartsStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned
    );
    expect(placementStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.advancedStartsAssigned
    );
    expect(placementStep.contract.artifacts.requires).toEqual(
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

    expect(placementStep.contract.provides).toContain(
      STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied
    );
    expect(placementStepIds.some((id) => id.includes(".terrain.validate"))).toBe(false);
    expect(placementStepIds.some((id) => id.includes(".areas.recalculate"))).toBe(false);
    expect(placementStepIds.some((id) => id.includes(".water.store"))).toBe(false);
    expect(placementStepIds.some((id) => id.includes(".fertility.recalculate"))).toBe(false);
  });

  it("validates rung counts and fairness report consistency", () => {
    const assignment = {
      width: 1,
      height: 1,
      positions: [],
      seats: [],
      fairnessReport: {
        tolerance: 0.1,
        parity: [],
        worstPairGap: null,
        balanced: true,
        swaps: [],
        relaxations: [],
      },
      status: "full",
      assigned: 0,
      unseatedCount: 0,
      rungCounts: {
        regional: 0,
        openPool: 0,
        qualityRelaxed: 0,
        spacingRelaxed: 0,
      },
      primaryAssigned: 0,
      islandClusterAssigned: 0,
      marginalAssigned: 0,
      noneAssigned: 0,
      candidateCount: 0,
      rejectionCounts: [],
      tierCounts: { primary: 0, islandCluster: 0, marginal: 0 },
      inputCoverage: [],
    };

    expect(placementArtifactValidators.startAssignment(assignment)).toEqual([]);

    const invalidRungCounts = {
      ...assignment,
      rungCounts: { ...assignment.rungCounts, regional: 1 },
    };
    expect(
      placementArtifactValidators
        .startAssignment(invalidRungCounts)
        .some((issue) => issue.message.includes("rungCounts.regional"))
    ).toBe(true);

    const invalidFairnessReport = {
      ...assignment,
      fairnessReport: { ...assignment.fairnessReport, parity: [1] },
    };
    expect(
      placementArtifactValidators
        .startAssignment(invalidFairnessReport)
        .some((issue) => issue.message.includes("fairnessReport.parity"))
    ).toBe(true);
  });
});
