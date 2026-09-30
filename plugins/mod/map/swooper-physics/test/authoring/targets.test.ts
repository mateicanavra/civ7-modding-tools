import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "bun:test";
import { inspectGeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import { authoringTargets } from "../../authoring/index.js";
import { studioRecipeUiMeta } from "../../dist/recipes/standard-artifacts.js";
import { loadSwooperMapConfigCatalog } from "../../scripts/catalog-source.js";
import standardRecipe from "../../src/recipes/standard/recipe.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const configs = await loadSwooperMapConfigCatalog();
const catalogPlan = authoringTargets.mapCatalogMetadata.createPlan(configs);
const recipePlan = await authoringTargets.recipeAuthoringMetadata.createPlan();

describe("Swooper definition authoring targets", () => {
  it("owns one finite deterministic table of cold metadata plans", async () => {
    expect(Object.keys(authoringTargets)).toEqual([
      "mapCatalogMetadata",
      "recipeAuthoringMetadata",
    ]);
    expect(Object.values(authoringTargets).map((target) => target.id)).toEqual([
      "map-catalog-metadata",
      "recipe-authoring-metadata",
    ]);
    expect(catalogPlan.files.map((file) => file.relativePath)).toEqual([
      "dist/recipes/standard-map-config.schema.json",
      "dist/recipes/standard-map-configs.js",
      "dist/recipes/standard-map-configs.d.ts",
    ]);
    expect(recipePlan.files.map((file) => file.relativePath)).toEqual([
      "dist/recipes/standard.schema.json",
      "dist/recipes/standard.defaults.json",
      "dist/recipes/standard.d.ts",
      "dist/recipes/standard-artifacts.js",
      "dist/recipes/standard-artifacts.d.ts",
    ]);

    expect(authoringTargets.mapCatalogMetadata.createPlan(configs)).toEqual(catalogPlan);
    await expect(authoringTargets.recipeAuthoringMetadata.createPlan()).resolves.toEqual(
      recipePlan
    );
  });

  it("keeps every declared target current with its source-derived plan", async () => {
    await expect(
      inspectGeneratedFilePlan(catalogPlan, { outputRoot: packageRoot })
    ).resolves.toEqual({ kind: "current" });
    await expect(
      inspectGeneratedFilePlan(recipePlan, { outputRoot: packageRoot })
    ).resolves.toEqual({ kind: "current" });
  });

  it("matches generated step identities to the runtime recipe", () => {
    expect(
      studioRecipeUiMeta.stages.flatMap((stage) => stage.steps.map((step) => step.fullStepId))
    ).toEqual(standardRecipe.recipe.steps.map((step) => step.id));
  });
});
