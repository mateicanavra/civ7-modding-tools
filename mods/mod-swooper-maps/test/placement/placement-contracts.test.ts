import { describe, expect, it } from "bun:test";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import {
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../src/recipes/standard/tags.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";
import placeNaturalWondersStep from "../../src/recipes/standard/stages/placement/steps/place-natural-wonders/index.js";
import placementStep from "../../src/recipes/standard/stages/placement/steps/placement/index.js";

describe("placement product/effect contracts", () => {
  it("promotes natural wonder stamping as a product/effect boundary before final placement", () => {
    const placementStepIds = standardRecipe.recipe.steps
      .map((step) => step.id)
      .filter((id) => id.includes(".placement."));

    expect(placementStepIds).toContain("mod-swooper-maps.standard.placement.place-natural-wonders");
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-natural-wonders")
    ).toBeLessThan(placementStepIds.indexOf("mod-swooper-maps.standard.placement.placement"));

    expect(placeNaturalWondersStep.contract.provides).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced
    );
    expect(placeNaturalWondersStep.contract.artifacts.provides).toContain(
      placementArtifacts.naturalWonderPlacement
    );
    expect(placementStep.contract.requires).toContain(
      PLACEMENT_PRODUCT_EFFECT_TAGS.placement.naturalWondersPlaced
    );
    expect(placementStep.contract.artifacts.requires).toContain(
      placementArtifacts.naturalWonderPlacement
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
});
