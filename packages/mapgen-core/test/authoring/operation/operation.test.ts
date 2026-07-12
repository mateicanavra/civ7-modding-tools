import { describe, expect, it } from "bun:test";
import {
  bindCompileOps,
  bindRuntimeOps,
  createOp,
  createRecipe,
  createStage,
  createStep,
  createStrategy,
  defineOp,
  defineStep,
  runtimeOp,
} from "@mapgen/authoring/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";
import { Type } from "typebox";

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("operation authoring", () => {
  it("binds compile/runtime ops by contract ids", () => {
    const declarations = { trees: { id: "ecology/trees" } } as const;
    const contract = defineOp({
      kind: "plan",
      id: "ecology/trees",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.String(),
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const compileOp = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", { run: () => "ok" }),
      },
    });

    const compileOps = bindCompileOps(declarations, { [compileOp.id]: compileOp });
    expect(compileOps.trees).toBe(compileOp);

    const runtimeOps = bindRuntimeOps(declarations, { [compileOp.id]: runtimeOp(compileOp) });
    expect(runtimeOps.trees.id).toBe(compileOp.id);
  });

  it("bindCompileOps throws when registry is missing an op id", () => {
    const declarations = { trees: { id: "missing" } } as const;
    expect(() => bindCompileOps(declarations, {})).toThrow(/missing/i);
  });

  it("createRecipe rejects missing runtime op implementations for step-declared ops", () => {
    const contract = defineOp({
      kind: "plan",
      id: "test/ops/missing-runtime",
      input: Type.Object({}, { additionalProperties: false }),
      output: Type.Object({}, { additionalProperties: false }),
      strategies: { default: Type.Object({}, { additionalProperties: false }) },
    });
    const op = createOp(contract, {
      strategies: {
        default: createStrategy(contract, "default", {
          run: () => ({}),
        }),
      },
    });
    const step = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: [],
        provides: [],
        ops: { trees: contract },
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.base",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: { [op.id]: op },
        runtimeOpsById: {},
      })
    ).toThrow(/Missing op implementation/i);
  });
});
