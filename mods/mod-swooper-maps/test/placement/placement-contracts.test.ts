import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import standardRecipe from "../../src/recipes/standard/recipe.js";
import {
  PLACEMENT_PRODUCT_EFFECT_TAGS,
  STANDARD_ENGINE_EFFECT_TAGS,
} from "../../src/recipes/standard/tags.js";
import { placementArtifacts } from "../../src/recipes/standard/stages/placement/artifacts.js";
import assignAdvancedStartsStep from "../../src/recipes/standard/stages/placement/steps/assign-advanced-starts/index.js";
import assignStartsStep from "../../src/recipes/standard/stages/placement/steps/assign-starts/index.js";
import placeNaturalWondersStep from "../../src/recipes/standard/stages/placement/steps/place-natural-wonders/index.js";
import placeDiscoveriesStep from "../../src/recipes/standard/stages/placement/steps/place-discoveries/index.js";
import placeResourcesStep from "../../src/recipes/standard/stages/placement/steps/place-resources/index.js";
import placementStep from "../../src/recipes/standard/stages/placement/steps/placement/index.js";
import preparePlacementSurfaceStep from "../../src/recipes/standard/stages/placement/steps/prepare-placement-surface/index.js";

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
    expect(preparePlacementSurfaceStep.contract.artifacts.requires).toContain(
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
        "mod-swooper-maps.standard.placement.place-resources",
        "mod-swooper-maps.standard.placement.assign-starts",
        "mod-swooper-maps.standard.placement.place-discoveries",
        "mod-swooper-maps.standard.placement.assign-advanced-starts",
        "mod-swooper-maps.standard.placement.placement",
      ])
    );
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-resources")
    ).toBeLessThan(placementStepIds.indexOf("mod-swooper-maps.standard.placement.assign-starts"));
    expect(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.assign-starts")
    ).toBeLessThan(
      placementStepIds.indexOf("mod-swooper-maps.standard.placement.place-discoveries")
    );

    expect(placeResourcesStep.contract.provides).toContain(
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

  it("models start assignment as deterministic tiered policy, not fallback telemetry", () => {
    const placementSources = listSourceFiles(PLACEMENT_STEPS_DIR)
      .map((file) => ({ file, source: readFileSync(file, "utf8") }))
      .filter(({ file }) => !file.endsWith("/placement-contracts.test.ts"));
    const artifactSource = readFileSync(
      join(import.meta.dir, "../../src/recipes/standard/stages/placement/artifacts.ts"),
      "utf8"
    );

    for (const { file, source } of placementSources) {
      expect(source, file).not.toMatch(/fallbackAssigned|fallbackUsed|deterministic fallback/);
    }
    expect(artifactSource).not.toMatch(/fallbackAssigned|fallbackUsed|deterministic fallback/);
    expect(artifactSource).toContain("openPoolAssigned");
    expect(artifactSource).toContain("openPoolUsed");
  });
});
