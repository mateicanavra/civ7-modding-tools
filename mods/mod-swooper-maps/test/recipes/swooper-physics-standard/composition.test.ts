import { describe, expect, it } from "bun:test";
import { getCiv7StandardMapSizePreset } from "@civ7/adapter";
import { buildStandardRecipeDefaultConfig } from "../../../src/recipes/standard/artifacts.js";
import standardRecipe from "../../../src/recipes/standard/recipe.js";
import { STANDARD_TAG_DEFINITIONS } from "../../../src/recipes/standard/tags.js";
import { standardMapConfig } from "./fixtures/standard-recipe.js";

const tinyPreset = getCiv7StandardMapSizePreset("MAPSIZE_TINY");
const baseSettings = {
  mapSeed: 42,
  dimensions: tinyPreset.dimensions,
  latitudeBounds: standardMapConfig.latitudeBounds,
};

describe("standard recipe composition", () => {
  it("keeps tag definitions unique", () => {
    const ids = STANDARD_TAG_DEFINITIONS.map((tag) => tag.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("compiles without missing tag errors", () => {
    expect(() =>
      standardRecipe.compile(baseSettings, buildStandardRecipeDefaultConfig())
    ).not.toThrow();
  });

  it("orders Civ7 materialization from static water through ecology scoring", () => {
    const stepIds = standardRecipe.recipe.steps.map((step) => step.id);
    const indexOfStep = (stage: string, step: string): number =>
      stepIds.findIndex((id) => id.endsWith(`.${stage}.${step}`));

    const rainfall = indexOfStep("map-hydrology", "project-rainfall");
    const lakes = indexOfStep("map-hydrology", "lakes");
    const elevation = indexOfStep("map-elevation", "build-elevation");
    const rivers = indexOfStep("map-rivers", "plot-rivers");
    const ecologyScoring = indexOfStep("ecology-features", "score-layers");

    expect(rainfall).toBeGreaterThan(-1);
    expect(lakes).toBeGreaterThan(-1);
    expect(elevation).toBeGreaterThan(-1);
    expect(rivers).toBeGreaterThan(-1);
    expect(ecologyScoring).toBeGreaterThan(-1);
    expect(rainfall).toBeLessThan(lakes);
    expect(lakes).toBeLessThan(elevation);
    expect(elevation).toBeLessThan(rivers);
    expect(rivers).toBeLessThan(ecologyScoring);
  });
});
