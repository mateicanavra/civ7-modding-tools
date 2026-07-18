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
import { createExtendedMapContext } from "@mapgen/core/types.js";
import type { StepFacetSinks } from "@mapgen/engine/index.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

const baseSettings = {
  seed: 1,
  dimensions: { width: 8, height: 6 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};
const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("authoring: hello recipe compile/execute", () => {
  it("compiles and executes a minimal recipe module", () => {
    const executions: string[] = [];
    const helloContract = defineStep({
      id: "hello",
      phase: "foundation",
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
    const ctx = createExtendedMapContext({ width: 8, height: 6 }, adapter, baseSettings);

    const plan = recipe.compile(baseSettings, { foundation: { knobs: {}, hello: {} } });
    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0]?.stepId).toContain("hello");

    recipe.run(ctx, baseSettings, { foundation: { knobs: {}, hello: {} } });
    expect(executions).toContain("hello");
  });

  it("binds step-declared ops and compiles op defaults/normalization", () => {
    const executions: string[] = [];
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/tree-plan",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({ ok: Type.Boolean() }, { additionalProperties: false }),
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
      phase: "foundation",
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
    const ctx = createExtendedMapContext({ width: 8, height: 6 }, adapter, baseSettings);

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
    const plan = recipe.compile(baseSettings, config);
    expect(plan.nodes[0]?.config).toEqual({
      trees: { strategy: "default", config: { enabled: false } },
    });

    recipe.run(ctx, baseSettings, config);
    expect(executions).toContain("trees:false");
  });

  it("threads step facet sinks through synchronous and asynchronous recipe runs", async () => {
    const facetContract = defineStep({
      id: "facet-output",
      phase: "foundation",
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
    const ctx = createExtendedMapContext({ width: 8, height: 6 }, adapter, baseSettings);
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

    recipe.run(ctx, baseSettings, config, { trace: null, facets });
    await recipe.runAsync(ctx, baseSettings, config, { trace: null, facets });

    expect(emitted).toEqual(["metrics:4", "viz:0", "metrics:4", "viz:0"]);
  });
});
