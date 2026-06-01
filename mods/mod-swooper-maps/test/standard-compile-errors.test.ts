import { describe, expect, it } from "bun:test";

import { Type, createStage } from "@swooper/mapgen-core/authoring";
import {
  RecipeCompileError,
  compileRecipeConfig,
} from "@swooper/mapgen-core/compiler/recipe-compile";

import standardRecipe, { compileOpsById } from "../src/recipes/standard/recipe.js";
import pedologyStep from "../src/recipes/standard/stages/ecology-pedology/steps/pedology/index.js";

const baseSettings = {
  seed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

const foundationConfig = {
  knobs: { plateCount: 28, plateActivity: 0.5 },
};

function expectCompileError(fn: () => void): RecipeCompileError {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(RecipeCompileError);
    return error as RecipeCompileError;
  }
  throw new Error("Expected RecipeCompileError");
}

describe("standard recipe compile errors (ecology)", () => {
  it("flags unknown stage public keys", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        foundation: foundationConfig,
        "ecology-biomes": {
          extraField: {},
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) => item.code === "config.invalid" && item.path === "/config/ecology-biomes/extraField"
      )
    ).toBe(true);
  });

  it("flags schema errors within ecology step configs", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        foundation: foundationConfig,
        "ecology-biomes": {
          biomes: {
            classify: 123,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) => item.code === "config.invalid" && item.path.includes("/config/ecology-biomes/biomes")
      )
    ).toBe(true);
  });

  it("flags unknown keys in Foundation authoring surface", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        foundation: {
          ...foundationConfig,
          forbiddenKinematics: { velocity: [1, 2, 3] },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/foundation/forbiddenKinematics")
      )
    ).toBe(true);
  });

  it("rejects legacy Foundation step/op envelope config", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        foundation: {
          mesh: {
            computeMesh: {
              strategy: "default",
              config: { plateCount: 28 },
            },
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) => item.code === "config.invalid" && item.path.includes("/config/foundation/mesh")
      )
    ).toBe(true);
  });

  it("rejects derived Foundation mesh cellCount on the public surface", () => {
    const err = expectCompileError(() =>
      standardRecipe.compileConfig(baseSettings, {
        foundation: {
          meshResolution: {
            cellCount: 128,
          },
        },
      } as any)
    );

    expect(
      err.errors.some(
        (item) =>
          item.code === "config.invalid" &&
          item.path.includes("/config/foundation/meshResolution/cellCount")
      )
    ).toBe(true);
  });

  it("flags unknown step ids returned by ecology stage compile", () => {
    const brokenStage = createStage({
      id: "ecology-pedology",
      knobsSchema: Type.Object({}, { additionalProperties: false, default: {} }),
      public: Type.Object(
        {
          pedology: Type.Optional(pedologyStep.contract.schema),
        },
        { additionalProperties: false, default: {} }
      ),
      compile: ({ config }) => ({
        "unknown-step": config.pedology,
      }),
      steps: [pedologyStep],
    });

    const err = expectCompileError(() =>
      compileRecipeConfig({
        env: baseSettings,
        recipe: { stages: [brokenStage] },
        config: { "ecology-pedology": { pedology: {} } },
        compileOpsById,
      })
    );

    expect(
      err.errors.some(
        (item) => item.code === "stage.unknown-step-id" && item.stepId === "unknown-step"
      )
    ).toBe(true);
  });
});
