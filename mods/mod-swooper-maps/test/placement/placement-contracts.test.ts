import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import { artifacts as placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts/index.js";
import { startAssignment } from "../../src/recipes/standard/stages/placement/artifacts/index.js";
import adjustResourcesStep from "../../src/recipes/standard/stages/placement/steps/adjust-resources/index.js";
import assignAdvancedStartsStep from "../../src/recipes/standard/stages/placement/steps/assign-advanced-starts/index.js";
import assignStartsStep from "../../src/recipes/standard/stages/placement/steps/assign-starts/index.js";
import placeDiscoveriesStep from "../../src/recipes/standard/stages/placement/steps/place-discoveries/index.js";
import placeNaturalWondersStep from "../../src/recipes/standard/stages/placement/steps/place-natural-wonders/index.js";
import placeResourcesStep from "../../src/recipes/standard/stages/placement/steps/place-resources/index.js";
import placementStep from "../../src/recipes/standard/stages/placement/steps/placement/index.js";
import planResourcesStep from "../../src/recipes/standard/stages/placement/steps/plan-resources/index.js";
import preparePlacementSurfaceStep from "../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/index.js";
import {
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../src/recipes/standard/tags.js";

const PLACEMENT_STEPS_DIR = join(
  import.meta.dir,
  "../../src/recipes/standard/stages/placement/steps"
);

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...listSourceFiles(path));
      continue;
    }
    if (path.endsWith(".ts")) files.push(path);
  }
  return files;
}

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

  it("keeps product steps independent from terminal placement summary owners", () => {
    const siblingFiles = listSourceFiles(PLACEMENT_STEPS_DIR).filter(
      (path) => !path.includes("/placement/")
    );

    for (const file of siblingFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("../placement/apply.js");
      expect(source, file).not.toContain("../placement/inputs.js");
    }
  });

  it("models start assignment as op-owned ladder selection with per-seat records", () => {
    const placementSources = listSourceFiles(PLACEMENT_STEPS_DIR)
      .map((file) => ({ file, source: readFileSync(file, "utf8") }))
      .filter(({ file }) => !file.endsWith("/placement-contracts.test.ts"));
    const startAssignmentSchema = JSON.stringify(startAssignment.Schema);

    for (const { file, source } of placementSources) {
      expect(source, file).not.toMatch(/fallbackAssigned|fallbackUsed|deterministic fallback/);
      // Selection authority moved into the plan-starts op (S4); the recipe
      // layer must not re-grow selection logic or the deleted desperation path.
      expect(source, file).not.toMatch(/desperation|chooseStartTiles|chooseRankedFromPool/);
      expect(source, file).not.toMatch(/startSector/);
    }
    expect(startAssignmentSchema).not.toMatch(
      /fallbackAssigned|fallbackUsed|deterministic fallback/
    );
    expect(startAssignmentSchema).toContain("rungCounts");
    expect(startAssignmentSchema).toContain("fairnessReport");
  });
});
