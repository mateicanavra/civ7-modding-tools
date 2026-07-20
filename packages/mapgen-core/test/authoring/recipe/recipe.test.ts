import { describe, expect, it } from "bun:test";
import {
  createRecipe,
  createStage,
  createStep,
  defineStep,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { RecipeCompileError } from "@mapgen/compiler/recipe-compile.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

const baseSetup = admitMapSetup({
  mapSeed: 42,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

const makeContract = (id: string, schema = EmptyStepConfigSchema) =>
  defineStep({
    id,
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

  it("createRecipe rejects duplicate stage identities before compiling indexed surfaces", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage, stage],
        compileOpsById: {},
      })
    ).toThrow('duplicate stage id "foundation"');
  });

  it("createRecipe rejects invalid tag prefixes", () => {
    const step = createStep(
      defineStep({
        id: "alpha",
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
    const plan = recipe.compile(baseSetup, config);
    expect(plan.nodes[0]?.config).toEqual({ count: 2 });

    expect(() =>
      recipe.compile(baseSetup, {
        foundation: { knobs: {}, alpha: { count: 1, extra: "nope" } },
      })
    ).toThrow(RecipeCompileError);
  });

  it("retains one immutable admitted setup identity through recipe compilation", () => {
    const step = createStep(makeContract("alpha"), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });
    const config = { foundation: { knobs: {}, alpha: {} } };
    const admittedSetup = admitMapSetup({
      mapSeed: 42,
      dimensions: { width: 2, height: 2 },
      latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
    });

    const plan = recipe.compile(admittedSetup, config);
    expect(plan.setup).toBe(admittedSetup);
    expect(Object.isFrozen(plan.setup)).toBe(true);

    expect(recipe.compile(baseSetup, config).setup).toBe(baseSetup);
  });

  it("snapshots recipe authorship before caller aliases or public structure can mutate", () => {
    const schema = Type.Object(
      { count: Type.Number({ default: 2 }) },
      { additionalProperties: false }
    );
    const step = createStep(makeContract("alpha", schema), { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const stages = [stage];
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages,
      compileOpsById: {},
    });

    Reflect.set(schema.properties.count, "minimum", 100);
    stages.length = 0;

    expect(Reflect.set(recipe.recipe.steps[0]!, "id", "forged")).toBe(false);
    expect(() => (recipe.recipe.steps as unknown[]).push({ id: "forged" })).toThrow();

    const plan = recipe.compile(baseSetup, { foundation: { knobs: {}, alpha: { count: 2 } } });
    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0]?.stepId).toBe("core.base.foundation.alpha");
    expect(plan.nodes[0]?.config).toEqual({ count: 2 });
  });
});
