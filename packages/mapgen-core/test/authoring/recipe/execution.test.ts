import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  createOp,
  createRecipe,
  createStage,
  createStep,
  createStrategy,
  defineOp,
  defineStep,
  deriveRecipeConfigSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import type { ExecutionPlan, MapSetup, StepFacetSinks } from "@mapgen/engine/index.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

const baseSetup = admitMapSetup({
  mapSeed: 1,
  dimensions: { width: 8, height: 6 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
});
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("authoring: hello recipe compile/execute", () => {
  it("compiles and executes a minimal recipe module", () => {
    const executions: string[] = [];
    const helloContract = defineStep({
      id: "hello",
      requires: [],
      provides: [],
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const helloStep = createStep(helloContract, {
      run: () => {
        executions.push("hello");
      },
    });

    const helloStage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [helloStep],
    });

    const recipe = createRecipe({
      id: "hello",
      namespace: "test",
      tagDefinitions: [],
      stages: [helloStage],
      compileOpsById: {},
    });

    const adapter = createMockAdapter({ width: 8, height: 6, mapSizeId: 1 });
    const ctx = createMapContext({ setup: baseSetup, adapter });

    const plan = recipe.compile(baseSetup, { foundation: { knobs: {}, hello: {} } });
    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0]?.stepId).toContain("hello");

    recipe.execute(ctx, plan);
    expect(executions).toContain("hello");
  });

  it("executes an exact plan without renormalizing and run compiles only once", async () => {
    const observedSeeds: number[] = [];
    let normalizationCount = 0;
    const contract = defineStep({
      id: "observe-seed",
      requires: [],
      provides: [],
      schema: Type.Object({ seed: Type.Number() }, { additionalProperties: false }),
    });
    const step = createStep(contract, {
      normalize: (_config, { setup }) => {
        normalizationCount += 1;
        return { seed: (setup as MapSetup).mapSeed };
      },
      run: (_context, config) => {
        observedSeeds.push(config.seed);
      },
    });
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [step],
    });
    const recipe = createRecipe({
      id: "setup-authority",
      namespace: "test",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });
    const setup = admitMapSetup({ ...baseSetup, mapSeed: 444 });
    const adapter = createMockAdapter({ width: 8, height: 6, mapSizeId: 1 });
    const context = createMapContext({ setup, adapter });
    const config = { foundation: { knobs: {}, "observe-seed": { seed: 0 } } };
    const plan = recipe.compile(setup, config);

    expect(normalizationCount).toBe(1);
    recipe.execute(context, plan);
    expect(normalizationCount).toBe(1);
    recipe.run(createMapContext({ setup, adapter }), config);

    expect(normalizationCount).toBe(2);
    expect(observedSeeds).toEqual([444, 444]);

    const equalSetup = admitMapSetup({ ...setup });
    const mismatchedContext = createMapContext({ setup: equalSetup, adapter });
    expect(() => recipe.execute(mismatchedContext, plan)).toThrow(
      "Pipeline context setup must be the exact admitted setup retained by the execution plan."
    );

    let forgedPropertyReads = 0;
    const forged = Object.defineProperties(
      {},
      {
        setup: {
          get: () => {
            forgedPropertyReads += 1;
            return setup;
          },
        },
        nodes: {
          get: () => {
            forgedPropertyReads += 1;
            return [];
          },
        },
      }
    ) as ExecutionPlan;
    expect(() => recipe.execute(context, forged)).toThrow(
      "authentic execution plan returned by compileExecutionPlan"
    );
    await expect(recipe.executeAsync(context, forged)).rejects.toThrow(
      "authentic execution plan returned by compileExecutionPlan"
    );
    expect(forgedPropertyReads).toBe(0);
  });

  it("binds step-declared ops and compiles op defaults/normalization", () => {
    const executions: string[] = [];
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/tree-plan",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({ ok: Type.Boolean() }, { additionalProperties: false }),
      defaultStrategy: "default",
      strategies: {
        default: Type.Object(
          { enabled: Type.Boolean({ default: true }) },
          { additionalProperties: false }
        ),
      },
    });

    const treePlan = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          normalize: (config) => ({ ...config, enabled: false }),
          run: (_input, config) => ({ ok: config.enabled }),
        }),
      },
    });

    const stepContract = defineStep({
      id: "use-op",
      requires: [],
      provides: [],
      ops: {
        trees: contract,
      },
      schema: Type.Object({}, { additionalProperties: false }),
    });

    const step = createStep(stepContract, {
      run: (_context, config, ops) => {
        const result = ops.trees({}, config.trees);
        executions.push(`trees:${result.ok}`);
      },
    });

    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [step],
    });

    const recipe = createRecipe({
      id: "ops",
      namespace: "test",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: { [treePlan.id]: treePlan },
    });

    const adapter = createMockAdapter({ width: 8, height: 6, mapSizeId: 1 });
    const ctx = createMapContext({ setup: baseSetup, adapter });

    const configSchema = Type.Object(
      {
        foundation: Type.Object(
          { knobs: EmptyKnobsSchema, "use-op": stepContract.schema },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false }
    );
    expect(deriveRecipeConfigSchema([stage])).toEqual(configSchema);
    const config = Value.Create(configSchema);
    const plan = recipe.compile(baseSetup, config);
    expect(plan.nodes[0]?.config).toEqual({
      trees: { strategy: "default", config: { enabled: false } },
    });

    recipe.run(ctx, config);
    expect(executions).toContain("trees:false");
  });

  it("threads step facet sinks through synchronous and asynchronous recipe runs", async () => {
    const facetContract = defineStep({
      id: "facet-output",
      requires: [],
      provides: [],
      schema: Type.Object({ score: Type.Number() }, { additionalProperties: false }),
    });
    const facetStep = createStep(facetContract, {
      run: (_context, config) => ({ score: config.score }),
      metrics: ({ result }) => ({ score: result.score }),
      viz: () => [],
    });
    const stage = createStage({
      id: "foundation",
      knobsSchema: EmptyKnobsSchema,
      steps: [facetStep],
    });
    const recipe = createRecipe({
      id: "facets",
      namespace: "test",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });
    const adapter = createMockAdapter({ width: 8, height: 6, mapSizeId: 1 });
    const syncContext = createMapContext({ setup: baseSetup, adapter });
    const asyncContext = createMapContext({ setup: baseSetup, adapter });
    const config = { foundation: { knobs: {}, "facet-output": { score: 4 } } };
    const emitted: string[] = [];
    const facets = {
      metrics: (projection: Readonly<Record<string, unknown>>) => {
        emitted.push(`metrics:${String(projection.score)}`);
        return undefined;
      },
      viz: (projections: readonly unknown[]) => {
        emitted.push(`viz:${projections.length}`);
        return undefined;
      },
    } satisfies StepFacetSinks;

    const plan = recipe.compile(baseSetup, config);
    recipe.execute(syncContext, plan, { trace: null, facets });
    await recipe.executeAsync(asyncContext, plan, { trace: null, facets });

    expect(emitted).toEqual(["metrics:4", "viz:0", "metrics:4", "viz:0"]);
  });
});
