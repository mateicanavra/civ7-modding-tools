import { describe, expect, it } from "bun:test";
import {
  createRecipe,
  createStage,
  createStep,
  defineStep,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { RecipeCompileError } from "@mapgen/compiler/recipe-compile.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

const baseSettings = {
  seed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

const makeContract = (id: string, schema = EmptyStepConfigSchema) =>
  defineStep({
    id,
    phase: "foundation",
    requires: [],
    provides: [],
    schema,
  });

describe("recipe authoring", () => {
  it("createRecipe rejects missing tagDefinitions", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipeWithoutTags = {
      id: "core.base",
      stages: [stage],
      compileOpsById: {},
    } as unknown as Parameters<typeof createRecipe>[0];

    expect(() => createRecipe(recipeWithoutTags)).toThrow(/tagDefinitions/);
  });

  it("createRecipe produces Recipe schema v2 (no instance ids)", () => {
    const stepA = createStep(makeContract("alpha"), { run: () => {} });
    const stepB = createStep(makeContract("beta"), { run: () => {} });
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [stepA, stepB],
    });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    expect(recipe.recipe.schemaVersion).toBe(2);
    expect(recipe.recipe.steps[0]).toHaveProperty("id");
    expect(recipe.recipe.steps[0]).not.toHaveProperty("instanceId");
  });

  it("createRecipe derives deterministic step ids", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    expect(recipe.recipe.steps[0]?.id).toBe("core.base.foundation.alpha");
  });

  it("createRecipe rejects invalid tag prefixes", () => {
    const step = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: ["bad:tag"],
        provides: [],
        schema: EmptyStepConfigSchema,
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({ id: "core.base", tagDefinitions: [], stages: [stage], compileOpsById: {} })
    ).toThrow(/Invalid dependency tag/);
  });

  it("compiles recipe-created complete config and rejects unknown keys", () => {
    const schema = Type.Object(
      { count: Type.Number({ default: 2 }) },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("alpha", schema), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    const configSchema = Type.Object(
      {
        foundation: Type.Object(
          { knobs: EmptyKnobsSchema, alpha: schema },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false }
    );
    expect(deriveRecipeConfigSchema([stage])).toEqual(configSchema);
    const config = Value.Create(configSchema);
    const plan = recipe.compile(baseSettings, config);
    expect(plan.nodes[0]?.config).toEqual({ count: 2 });

    expect(() =>
      recipe.compile(baseSettings, {
        foundation: { knobs: {}, alpha: { count: 1, extra: "nope" } },
      })
    ).toThrow(RecipeCompileError);
  });
});
