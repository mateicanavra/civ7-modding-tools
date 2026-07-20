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
    const helloContract = defineStep({
      id: "hello",
      phase: "foundation",
      requires: [],
      provides: [],
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const helloStep = createStep(helloContract, {
      run: (context) => {
        context.metrics.warnings.push("hello");
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
    expect(ctx.metrics.warnings).toContain("hello");
  });

  it("binds step-declared ops and compiles op defaults/normalization", () => {
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
      run: (context, config, ops) => {
        const result = ops.trees({}, config.trees);
        context.metrics.warnings.push(`trees:${result.ok}`);
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
    expect(ctx.metrics.warnings).toContain("trees:false");
  });
});
