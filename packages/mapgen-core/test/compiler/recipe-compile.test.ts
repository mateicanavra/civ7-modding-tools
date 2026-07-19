import { describe, expect, it } from "bun:test";
import { createOp, createStage, createStrategy, defineOp } from "@mapgen/authoring/index.js";
import { compileRecipeConfig, RecipeCompileError } from "@mapgen/compiler/recipe-compile.js";
import { admitMapSetup, type MapSetup } from "@mapgen/core/map-setup.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

const TEST_SETUP = admitMapSetup({
  mapSeed: 1,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});

function expectCompileError(run: () => unknown): RecipeCompileError {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(RecipeCompileError);
    return error as RecipeCompileError;
  }
  throw new Error("Expected RecipeCompileError");
}

describe("compileRecipeConfig", () => {
  it("retains one admitted setup snapshot while stage compilation observes it", () => {
    const setupInput = {
      mapSeed: 17,
      dimensions: { width: 4, height: 3 },
      latitudeBounds: { topLatitude: 60, bottomLatitude: -60 },
    };
    const setup = admitMapSetup(setupInput);
    let observedSetup: MapSetup | undefined;
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const stage = {
      id: "stage",
      knobsSchema,
      surfaceSchema: Type.Object({ knobs: knobsSchema }, { additionalProperties: false }),
      toInternal: ({ setup }: { setup: MapSetup }) => {
        observedSetup = setup;
        setupInput.mapSeed = 99;
        setupInput.dimensions.width = 10;
        return { knobs: {}, rawSteps: {} };
      },
      steps: [],
    };

    compileRecipeConfig({
      setup,
      recipe: { stages: [stage] },
      config: { stage: { knobs: {} } },
      compileOpsById: {},
    });

    expect(observedSetup).toBe(setup);
    expect(observedSetup?.mapSeed).toBe(17);
    expect(observedSetup?.dimensions).toEqual({ width: 4, height: 3 });
    expect(Object.isFrozen(observedSetup)).toBe(true);
    expect(Object.isFrozen(observedSetup?.dimensions)).toBe(true);
  });

  it("refuses invalid setup before compiling any stage", () => {
    expect(() =>
      compileRecipeConfig({
        setup: {
          mapSeed: 1,
          dimensions: { width: 2, height: 2 },
          latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
        } as unknown as MapSetup,
        recipe: { stages: [] },
        config: {},
        compileOpsById: {},
      })
    ).toThrow("Map setup topLatitude must be greater than bottomLatitude.");
  });

  it("materializes stage-produced op defaults before running normalizers", () => {
    const calls: string[] = [];
    const op = defineOp({
      kind: "plan",
      id: "test/op",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      defaultStrategy: "default",
      strategies: {
        default: Type.Object(
          { tag: Type.String({ default: "before-op" }) },
          { additionalProperties: false }
        ),
      },
    } as const);
    const stepSchema = Type.Object(
      { value: Type.String(), trees: op.config },
      { additionalProperties: false }
    );
    const step = {
      contract: {
        id: "alpha",
        schema: stepSchema,
        ops: { trees: op },
      },
      normalize: (config: unknown) => {
        calls.push("step.normalize");
        const value = Value.Parse(stepSchema, config);
        expect(value.trees).toEqual({ strategy: "default", config: { tag: "before-op" } });
        return { ...value, value: "step" };
      },
    };
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const publicSchema = Type.Object(
      { publicValue: Type.String() },
      { additionalProperties: false }
    );
    const stage = createStage({
      id: "stage",
      knobsSchema,
      public: publicSchema,
      compile: ({ config }) => ({ alpha: { value: config.publicValue } }),
      steps: [step],
    });
    const compileOp = createOp(op, {
      strategies: {
        default: createStrategy(op, "default", {
          normalize: (config) => {
            calls.push("op.normalize");
            return { ...config, tag: "op" };
          },
          run: () => ({}),
        }),
      },
    });

    const result = compileRecipeConfig({
      setup: TEST_SETUP,
      recipe: { stages: [stage] },
      config: { stage: { knobs: {}, publicValue: "base" } },
      compileOpsById: { [compileOp.id]: compileOp },
    });

    expect(calls).toEqual(["step.normalize", "op.normalize"]);
    expect(result).toEqual({
      stage: {
        alpha: {
          value: "step",
          trees: { strategy: "default", config: { tag: "op" } },
        },
      },
    });
  });

  it("rejects incomplete public config without changing it", () => {
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const publicSchema = Type.Object(
      { productRate: Type.Number({ default: 2 }) },
      { additionalProperties: false }
    );
    const stage = createStage({
      id: "stage",
      knobsSchema,
      public: publicSchema,
      compile: () => ({}),
      steps: [],
    });
    const incomplete = { stage: { knobs: {}, productRate: 2 } };
    Reflect.deleteProperty(incomplete.stage, "productRate");

    const error = expectCompileError(() =>
      compileRecipeConfig({
        setup: TEST_SETUP,
        recipe: { stages: [stage] },
        config: incomplete,
        compileOpsById: {},
      })
    );

    expect(
      error.errors.some(
        (item) => item.path === "/config/stage" && item.message.includes("productRate")
      )
    ).toBe(true);
    expect(incomplete.stage).not.toHaveProperty("productRate");
    expect(Object.keys(incomplete.stage)).toEqual(["knobs"]);
  });

  it("rejects a step normalizer that deletes a required field", () => {
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const publicSchema = Type.Object({}, { additionalProperties: false });
    const stage = createStage({
      id: "stage",
      knobsSchema,
      public: publicSchema,
      compile: () => ({ alpha: { requiredValue: "present" } }),
      steps: [
        {
          contract: {
            id: "alpha",
            schema: Type.Object({ requiredValue: Type.String() }, { additionalProperties: false }),
          },
          normalize: () => ({}),
        },
      ],
    });

    const error = expectCompileError(() =>
      compileRecipeConfig({
        setup: TEST_SETUP,
        recipe: { stages: [stage] },
        config: { stage: { knobs: {} } },
        compileOpsById: {},
      })
    );

    expect(error.errors.some((item) => item.code === "normalize.not.shape-preserving")).toBe(true);
    expect(
      error.errors.some(
        (item) => item.path === "/config/stage/alpha" && item.message.includes("requiredValue")
      )
    ).toBe(true);
  });

  it("rejects an op normalizer that deletes a required envelope field", () => {
    const op = defineOp({
      kind: "plan",
      id: "test/delete-required",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      defaultStrategy: "default",
      strategies: {
        default: Type.Object(
          { amount: Type.Number({ default: 1 }) },
          { additionalProperties: false }
        ),
      },
    } as const);
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const publicSchema = Type.Object({}, { additionalProperties: false });
    const stage = createStage({
      id: "stage",
      knobsSchema,
      public: publicSchema,
      compile: () => ({ alpha: {} }),
      steps: [
        {
          contract: {
            id: "alpha",
            schema: Type.Object({ terrain: op.config }, { additionalProperties: false }),
            ops: { terrain: op },
          },
        },
      ],
    });
    const invalidEnvelope = { strategy: "default" as const, config: { amount: 1 } };
    Reflect.deleteProperty(invalidEnvelope, "strategy");
    const compileOp = createOp(op, {
      strategies: {
        default: createStrategy(op, "default", { run: () => ({}) }),
      },
    });
    Reflect.set(compileOp, "normalize", () => invalidEnvelope);

    const error = expectCompileError(() =>
      compileRecipeConfig({
        setup: TEST_SETUP,
        recipe: { stages: [stage] },
        config: { stage: { knobs: {} } },
        compileOpsById: {
          [compileOp.id]: compileOp,
        },
      })
    );

    expect(error.errors.some((item) => item.path === "/config/stage/alpha/terrain")).toBe(true);
  });

  it("rejects unknown step ids returned by stage compilation", () => {
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const publicSchema = Type.Object({}, { additionalProperties: false });
    const stage = {
      id: "stage",
      knobsSchema,
      public: publicSchema,
      surfaceSchema: Type.Object({ knobs: knobsSchema }, { additionalProperties: false }),
      toInternal: () => ({ knobs: {}, rawSteps: { bogus: {} } }),
      steps: [
        {
          contract: {
            id: "alpha",
            schema: Type.Object({}, { additionalProperties: false }),
          },
        },
      ],
    };

    const error = expectCompileError(() =>
      compileRecipeConfig({
        setup: TEST_SETUP,
        recipe: { stages: [stage] },
        config: { stage: { knobs: {} } },
        compileOpsById: {},
      })
    );

    expect(error.errors[0]).toMatchObject({
      code: "stage.unknown-step-id",
      path: "/config/stage/bogus",
      stageId: "stage",
      stepId: "bogus",
    });
  });

  it("reports generic unknown-stage diagnostics", () => {
    const knobsSchema = Type.Object({}, { additionalProperties: false });
    const surfaceSchema = Type.Object({ knobs: knobsSchema }, { additionalProperties: false });
    const stages = ["ecology-pedology", "ecology-biomes"].map((id) => ({
      id,
      knobsSchema,
      surfaceSchema,
      toInternal: () => ({ knobs: {}, rawSteps: {} }),
      steps: [],
    }));
    const config = {
      "ecology-pedology": { knobs: {} },
      "ecology-biomes": { knobs: {} },
    };
    Reflect.set(config, "ecology", { knobs: {} });

    const error = expectCompileError(() =>
      compileRecipeConfig({
        setup: TEST_SETUP,
        recipe: { stages },
        config,
        compileOpsById: {},
      })
    );

    expect(error.errors).toContainEqual({
      code: "config.invalid",
      path: "/config/ecology",
      message: 'Unknown stage id "ecology"',
    });
  });
});
