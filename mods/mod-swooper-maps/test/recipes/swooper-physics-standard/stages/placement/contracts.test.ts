import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { admitMapSetup, createMapContext } from "@swooper/mapgen-core";
import standardRecipe from "../../../../../src/recipes/standard/recipe.js";
import { artifacts as ecologyArtifacts } from "../../../../../src/recipes/standard/stages/ecology/artifacts/index.js";
import {
  artifactModules as placementArtifactModules,
  artifacts as placementArtifacts,
} from "../../../../../src/recipes/standard/stages/placement/artifacts/index.js";
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
  STANDARD_TAG_DEFINITIONS,
} from "../../../../../src/recipes/standard/tags.js";
import {
  publishTestArtifact,
  withMapContextExecutionForTest,
} from "../../../../support/step-deps.js";

function makeValidStartAssignment(seatCount: number, assigned = seatCount) {
  const seats = Array.from({ length: seatCount }, (_value, seatIndex) => {
    const seated = seatIndex < assigned;
    return {
      seatIndex,
      playerId: seatIndex,
      playerIdSource: "alive-majors" as const,
      regionSlot: seatIndex % 2 === 0 ? 1 : 2,
      realizedRegionSlot: seated ? (seatIndex % 2 === 0 ? 1 : 2) : 0,
      plotIndex: seated ? seatIndex : -1,
      rung: seated ? ("regional" as const) : ("spacing-relaxed" as const),
      status: seated ? ("full" as const) : ("degraded" as const),
      tier: seated ? ("primary" as const) : ("none" as const),
      score: seated ? 1 : 0,
      components: {
        freshwater: 0,
        fertility: 0,
        expansion: 0,
        climate: 0,
        resource: 0,
        roughness: 0,
      },
      achievedSpacing: seated ? 1 : -1,
      imputedFlags: seated ? [] : ["unseated"],
    };
  });
  return {
    width: Math.max(1, seatCount),
    height: 1,
    positions: seats.map((seat) => seat.plotIndex),
    seats,
    fairnessReport: {
      tolerance: 0.3,
      parity: seats.map((seat) => seat.score),
      worstPairGap: null,
      balanced: true,
      swaps: [],
      relaxations: [],
    },
    status: assigned === seatCount ? ("full" as const) : ("degraded" as const),
    assigned,
    unseatedCount: seatCount - assigned,
    rungCounts: {
      regional: assigned,
      openPool: 0,
      qualityRelaxed: 0,
      spacingRelaxed: 0,
    },
    primaryAssigned: assigned,
    islandClusterAssigned: 0,
    marginalAssigned: 0,
    noneAssigned: 0,
    candidateCount: seatCount,
    rejectionCounts: [],
    tierCounts: { primary: seatCount, islandCluster: 0, marginal: 0 },
    inputCoverage: [],
  };
}

describe("placement product/effect contracts", () => {
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

  it("closes placement against the admitted start assignment instead of map slot capacity", () => {
    const definition = STANDARD_TAG_DEFINITIONS.find(
      ({ id }) => id === STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied
    );
    if (!definition?.satisfies) throw new Error("Missing placement completion predicate.");

    const createContext = () =>
      createMapContext({
        setup: admitMapSetup({
          mapSeed: 1,
          dimensions: { width: 10, height: 1 },
          latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
        }),
        adapter: createMockAdapter({ width: 10, height: 1 }),
      });
    const state = {
      satisfied: new Set([STANDARD_ENGINE_EFFECT_TAGS.engine.placementApplied]),
    };
    const satisfies = (
      assignment: ReturnType<typeof makeValidStartAssignment>,
      startsAssigned: number
    ) => {
      const context = createContext();
      return withMapContextExecutionForTest(context, () => {
        publishTestArtifact(context, placementArtifactModules.startAssignment, assignment);
        publishTestArtifact(context, placementArtifactModules.placementOutputs, {
          naturalWondersCount: 0,
          resourcesCount: 0,
          startsAssigned,
          discoveriesCount: 0,
        });
        return definition.satisfies?.(context, state);
      });
    };

    const completeAssignment = makeValidStartAssignment(10);
    expect(placementArtifactModules.startAssignment.validate(completeAssignment)).toEqual([]);
    expect(satisfies(completeAssignment, 10)).toBe(true);
    expect(satisfies(completeAssignment, 11)).toBe(false);

    const partialAssignment = makeValidStartAssignment(10, 9);
    expect(placementArtifactModules.startAssignment.validate(partialAssignment)).toEqual([]);
    expect(satisfies(partialAssignment, 9)).toBe(false);
  });

  it("validates rung counts and fairness report consistency", () => {
    const assignment = makeValidStartAssignment(0);

    expect(placementArtifactModules.startAssignment.validate(assignment)).toEqual([]);

    const invalidRungCounts = {
      ...assignment,
      rungCounts: { ...assignment.rungCounts, regional: 1 },
    };
    expect(
      placementArtifactModules.startAssignment
        .validate(invalidRungCounts)
        .some((issue) => issue.message.includes("rungCounts.regional"))
    ).toBe(true);

    const invalidFairnessReport = {
      ...assignment,
      fairnessReport: { ...assignment.fairnessReport, parity: [1] },
    };
    expect(
      placementArtifactModules.startAssignment
        .validate(invalidFairnessReport)
        .some((issue) => issue.message.includes("fairnessReport.parity"))
    ).toBe(true);

    const complete = makeValidStartAssignment(1);
    const invalidRealizedRegion = {
      ...complete,
      seats: [{ ...complete.seats[0]!, realizedRegionSlot: 0 }],
    };
    expect(
      placementArtifactModules.startAssignment
        .validate(invalidRealizedRegion)
        .some((issue) => issue.message.includes("realizedRegionSlot 1 or 2"))
    ).toBe(true);
  });
});
