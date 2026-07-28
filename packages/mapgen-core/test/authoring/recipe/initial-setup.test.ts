import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  createRecipe,
  createStage,
  createStep,
  defineInitialSetup,
  defineStep,
} from "@mapgen/authoring/index.js";
import { createMapContext } from "@mapgen/core/map-context.js";
import { computePlanFingerprint } from "@mapgen/engine/index.js";
import { withMapContextExecutionForTest, withStepExecutionForTest } from "@mapgen/testing/index.js";
import { Type } from "typebox";

const PhysicalSchema = Type.Object(
  {
    mapSeed: Type.Integer(),
    dimensions: Type.Object(
      { width: Type.Integer(), height: Type.Integer() },
      { additionalProperties: false }
    ),
    latitudeBounds: Type.Object(
      { topLatitude: Type.Number(), bottomLatitude: Type.Number() },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);

const InitialSchema = Type.Object(
  {
    physical: PhysicalSchema,
    world: Type.Object(
      {
        climate: Type.String(),
        weights: Type.Array(Type.Number()),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);

function initialInput(climate = "temperate") {
  return {
    physical: {
      mapSeed: 17,
      dimensions: { width: 4, height: 3 },
      latitudeBounds: { topLatitude: 70, bottomLatitude: -70 },
    },
    world: {
      climate,
      weights: [1, 2],
    },
  };
}

function createInitialSetupRecipe(
  initialSetup: ReturnType<typeof createInitialSetupAuthority>,
  observed: unknown[]
) {
  const step = createStep(
    defineStep({
      id: "observe-initial",
      requires: [],
      provides: [],
      initialSetup,
    }),
    {
      run: (context) => {
        observed.push(context.initialSetup);
      },
    }
  );
  const stage = createStage({
    id: "foundation",
    knobsSchema: Type.Object({}, { additionalProperties: false }),
    steps: [step],
  });
  return createRecipe({
    id: "test.initial-setup",
    initialSetup,
    stages: [stage],
    operations: {},
  });
}

function createInitialSetupAuthority(id = "test/initial-setup") {
  return defineInitialSetup({
    id,
    schema: InitialSchema,
    physical: (value) => value.physical,
  });
}

describe("recipe initial setup authority", () => {
  it("detaches and freezes schema authority without invoking accessors", () => {
    const mutableSchema = Type.Object(
      {
        physical: PhysicalSchema,
        label: Type.String(),
      },
      { additionalProperties: false }
    );
    const authority = defineInitialSetup({
      id: "test/schema-snapshot",
      schema: mutableSchema,
      physical: (value) => value.physical,
    });

    Reflect.set(mutableSchema.properties.label, "minLength", 5);
    expect(Reflect.get(authority.schema.properties.label, "minLength")).toBeUndefined();
    expect(Object.isFrozen(authority.schema)).toBe(true);
    expect(Object.isFrozen(authority.schema.properties.label)).toBe(true);

    let accessorReads = 0;
    const accessorSchema = Object.defineProperty({}, "type", {
      enumerable: true,
      get: () => {
        accessorReads += 1;
        return "object";
      },
    });
    expect(() =>
      defineInitialSetup({
        id: "test/accessor-schema",
        schema: accessorSchema as never,
        physical: () => initialInput().physical,
      })
    ).toThrow("must contain data properties only");
    expect(accessorReads).toBe(0);
  });

  it("parses, snapshots, and deeply freezes the full input before deriving physical setup", () => {
    const observed: unknown[] = [];
    const authority = createInitialSetupAuthority();
    const recipe = createInitialSetupRecipe(authority, observed);
    const input = initialInput();
    const plan = recipe.compile(input, { foundation: { knobs: {} } });

    input.physical.mapSeed = 99;
    input.world.climate = "arid";
    input.world.weights[0] = 99;

    expect(plan.setup.mapSeed).toBe(17);
    expect(plan.setup.dimensions).toEqual({ width: 4, height: 3 });
    expect(plan.setup.latitudeBounds).toEqual({ topLatitude: 70, bottomLatitude: -70 });
    expect(Reflect.get(plan, "initialSetup")).toBeUndefined();

    const evidence = recipe.inspectPlan(plan);
    expect(evidence).toEqual({
      recipeId: "test.initial-setup",
      planFingerprint: computePlanFingerprint(plan),
      initialSetup: {
        definitionId: authority.id,
        value: initialInput(),
      },
    });
    expect(evidence.initialSetup.value).toBe(recipe.inspectPlan(plan).initialSetup.value);
    expect(Object.isFrozen(evidence)).toBe(true);
    expect(Object.isFrozen(evidence.initialSetup)).toBe(true);

    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });
    recipe.execute(context, plan);
    const runContext = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });
    recipe.run(runContext, { foundation: { knobs: {} } });

    expect(observed).toHaveLength(2);
    expect(observed[1]).toBe(observed[0]);
    expect(observed[0]).toBe(evidence.initialSetup.value);
    expect(observed[0]).toEqual(initialInput());
    expect(Object.isFrozen(observed[0])).toBe(true);
    expect(Object.isFrozen((observed[0] as ReturnType<typeof initialInput>).physical)).toBe(true);
    expect(Object.isFrozen((observed[0] as ReturnType<typeof initialInput>).world)).toBe(true);
    expect(Object.isFrozen((observed[0] as ReturnType<typeof initialInput>).world.weights)).toBe(
      true
    );
    expect(Reflect.get(context, "initialSetup")).toBeUndefined();
  });

  it("gives direct step tests the exact admitted setup while the root stays opaque", () => {
    const authority = createInitialSetupAuthority();
    const recipe = createInitialSetupRecipe(authority, []);
    const directStep = createStep(
      defineStep({
        id: "direct-initial-observer",
        requires: [],
        provides: [],
        initialSetup: authority,
      }),
      { run: () => undefined }
    );
    const plan = recipe.compile(initialInput(), { foundation: { knobs: {} } });
    const evidence = recipe.inspectPlan(plan);
    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });
    const opaqueContext = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });

    expect(Reflect.get(context, "initialSetup")).toBeUndefined();
    withMapContextExecutionForTest(opaqueContext, (stepContext) => {
      expect(Reflect.get(stepContext, "initialSetup")).toBeUndefined();
    });
    withStepExecutionForTest(context, directStep, (stepContext) => {
      expect(stepContext.initialSetup).toBe(evidence.initialSetup.value);
      expect(Object.isFrozen(stepContext)).toBe(true);
    });
    expect(Reflect.get(context, "initialSetup")).toBeUndefined();
  });

  it("refuses unknown full-input state before invoking the physical projection", () => {
    let physicalCalls = 0;
    const authority = defineInitialSetup({
      id: "test/closed-initial-setup",
      schema: InitialSchema,
      physical: (value) => {
        physicalCalls += 1;
        return value.physical;
      },
    });
    const recipe = createInitialSetupRecipe(authority, []);

    expect(() =>
      recipe.compile(
        {
          ...initialInput(),
          unknown: true,
        } as never,
        { foundation: { knobs: {} } }
      )
    ).toThrow("schema parsing failed");
    expect(physicalCalls).toBe(0);
  });

  it("aggregates semantic refinement issues before physical projection and closes the sink", () => {
    let refinementCalls = 0;
    let physicalCalls = 0;
    let retainedAdd: ((message: string) => void) | undefined;
    const authority = defineInitialSetup({
      id: "test/refined-initial-setup",
      schema: InitialSchema,
      refine: (value, { issues }) => {
        refinementCalls += 1;
        retainedAdd = issues.add;
        expect(Object.isFrozen(value)).toBe(true);
        expect(Object.isFrozen(value.world.weights)).toBe(true);
        expect(Object.isFrozen(issues)).toBe(true);
        if (value.world.weights.length !== value.physical.dimensions.width) {
          issues.add("world weights must match map width");
        }
        if (value.world.climate === "invalid") {
          issues.add("world climate is not supported");
        }
      },
      physical: (value) => {
        physicalCalls += 1;
        return value.physical;
      },
    });
    const recipe = createInitialSetupRecipe(authority, []);

    expect(() =>
      recipe.compile(
        {
          ...initialInput(),
          unknown: true,
        } as never,
        { foundation: { knobs: {} } }
      )
    ).toThrow("schema parsing failed");
    expect(refinementCalls).toBe(0);

    expect(() => recipe.compile(initialInput("invalid"), { foundation: { knobs: {} } })).toThrow(
      'Initial setup authority "test/refined-initial-setup" refused semantic admission: world weights must match map width; world climate is not supported'
    );
    expect(refinementCalls).toBe(1);
    expect(physicalCalls).toBe(0);
    expect(() => retainedAdd?.("too late")).toThrow(
      "Initial setup refinement issue sink is closed"
    );

    const valid = initialInput();
    valid.world.weights = [1, 2, 3, 4];
    recipe.compile(valid, { foundation: { knobs: {} } });
    expect(refinementCalls).toBe(2);
    expect(physicalCalls).toBe(1);
  });

  it("contains thenables returned by hostile physical projectors", async () => {
    const authority = defineInitialSetup({
      id: "test/async-physical-projection",
      schema: InitialSchema,
      physical: (async () => {
        throw new Error("late physical projection failure");
      }) as never,
    });
    const recipe = createInitialSetupRecipe(authority, []);

    expect(() => recipe.compile(initialInput(), { foundation: { knobs: {} } })).toThrow(
      "Initial setup physical projections must complete synchronously"
    );
    await Promise.resolve();
  });

  it("includes recipe-owned initial state in the execution-plan fingerprint", () => {
    const authority = createInitialSetupAuthority();
    const recipe = createInitialSetupRecipe(authority, []);
    const temperate = recipe.compile(initialInput("temperate"), {
      foundation: { knobs: {} },
    });
    const arid = recipe.compile(initialInput("arid"), {
      foundation: { knobs: {} },
    });

    expect(temperate.setup).toEqual(arid.setup);
    expect(computePlanFingerprint(temperate)).not.toBe(computePlanFingerprint(arid));
  });

  it("refuses to inspect a plan compiled by a different recipe authority", () => {
    const authority = createInitialSetupAuthority();
    const recipe = createInitialSetupRecipe(authority, []);
    const other = createInitialSetupRecipe(authority, []);
    const plan = other.compile(initialInput(), { foundation: { knobs: {} } });

    expect(() => recipe.inspectPlan(plan)).toThrow(
      "Execution plan was compiled against a different step registry."
    );
  });

  it("refuses recipe composition when a step declares a different exact authority", () => {
    const declared = createInitialSetupAuthority("test/declared");
    const recipeAuthority = createInitialSetupAuthority("test/recipe");
    const step = createStep(
      defineStep({
        id: "mismatched-initial",
        requires: [],
        provides: [],
        initialSetup: declared,
      }),
      { run: () => undefined }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: Type.Object({}, { additionalProperties: false }),
      steps: [step],
    });

    expect(() =>
      createRecipe({
        id: "test.mismatch",
        initialSetup: recipeAuthority,
        stages: [stage],
        operations: {},
      })
    ).toThrow(
      'declares initial setup authority "test/declared", not recipe authority "test/recipe"'
    );
  });

  it("preserves the physical-only recipe path and omits undeclared step access", () => {
    const observed: unknown[] = [];
    const step = createStep(
      defineStep({
        id: "physical-only",
        requires: [],
        provides: [],
      }),
      {
        run: (context, _config, _ops, deps) => {
          observed.push({
            setup: context.setup,
            hasInitialSetupContext: Object.hasOwn(context, "initialSetup"),
            hasInitialSetupDependency: Object.hasOwn(deps, "initialSetup"),
          });
        },
      }
    );
    const stage = createStage({
      id: "foundation",
      knobsSchema: Type.Object({}, { additionalProperties: false }),
      steps: [step],
    });
    const recipe = createRecipe({
      id: "test.physical-only",
      stages: [stage],
      operations: {},
    });
    const plan = recipe.compile(initialInput().physical, { foundation: { knobs: {} } });
    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });

    recipe.execute(context, plan);
    expect(observed).toEqual([
      {
        setup: plan.setup,
        hasInitialSetupContext: false,
        hasInitialSetupDependency: false,
      },
    ]);
  });
});
