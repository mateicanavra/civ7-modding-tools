import { describe, expect, it } from "bun:test";

import standardRecipe from "../../src/recipes/standard/recipe.js";

import { standardConfig } from "../support/standard-config.js";

function getStrategy(config: unknown, key: string): string | undefined {
  if (!config || typeof config !== "object") return undefined;
  const entry = (config as Record<string, unknown>)[key];
  if (!entry || typeof entry !== "object") return undefined;
  const strategy = (entry as Record<string, unknown>).strategy;
  return typeof strategy === "string" ? strategy : undefined;
}

describe("features-plan advanced planner defaults", () => {
  it("keeps advanced planners disabled when keys are omitted", () => {
    const env = {
      seed: 1337,
      dimensions: { width: 32, height: 20 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    } as const;

    const plan = standardRecipe.compile(env, standardConfig);
    const node = plan.nodes.find(
      (entry) =>
        Boolean(entry) &&
        typeof entry === "object" &&
        (entry as Record<string, unknown>).stepId === "mod-swooper-maps.standard.ecology.features-plan"
    );
    if (!node) throw new Error("Missing features-plan node.");

    const config = (node as Record<string, unknown>).config;
    expect(getStrategy(config, "vegetatedPlacementForest")).toBe("disabled");
    expect(getStrategy(config, "vegetatedPlacementRainforest")).toBe("disabled");
    expect(getStrategy(config, "vegetatedPlacementTaiga")).toBe("disabled");
    expect(getStrategy(config, "vegetatedPlacementSavannaWoodland")).toBe("disabled");
    expect(getStrategy(config, "vegetatedPlacementSagebrushSteppe")).toBe("disabled");
    expect(getStrategy(config, "wetPlacementMarsh")).toBe("disabled");
    expect(getStrategy(config, "wetPlacementTundraBog")).toBe("disabled");
    expect(getStrategy(config, "wetPlacementMangrove")).toBe("disabled");
    expect(getStrategy(config, "wetPlacementOasis")).toBe("disabled");
    expect(getStrategy(config, "wetPlacementWateringHole")).toBe("disabled");
  });
});
