import { describe, expect, it } from "vitest";
import { getRuntimeRecipe } from "../../src/browser-runner/recipeRuntime";
import { TEST_BROWSER_RUN_INITIAL_SETUP } from "../setup";

describe("browser recipe runtime", () => {
  it("projects mock-engine identity from the admitted plan rather than the portable request", () => {
    const recipe = getRuntimeRecipe("standard");
    const aliveMajorPlayerIds = [7, 2, 11];
    const plan = recipe.recipe.compile(
      {
        ...TEST_BROWSER_RUN_INITIAL_SETUP,
        aliveMajorPlayerIds,
        options: {
          ...TEST_BROWSER_RUN_INITIAL_SETUP.options,
          player: aliveMajorPlayerIds.map((playerId) => ({ playerId, options: {} })),
        },
      },
      recipe.defaultConfig
    );
    aliveMajorPlayerIds[0] = 0;

    const adapterSetup = recipe.recipe.projectAdapterSetup(plan);

    expect(adapterSetup.aliveMajorPlayerIds).toEqual([7, 2, 11]);
    expect(adapterSetup.mapSeed).toBe(TEST_BROWSER_RUN_INITIAL_SETUP.mapSeed);
    expect(adapterSetup.mapSizeId).toBe(TEST_BROWSER_RUN_INITIAL_SETUP.mapSizeId);
    expect(adapterSetup.dimensions).toEqual(TEST_BROWSER_RUN_INITIAL_SETUP.dimensions);
  });
});
