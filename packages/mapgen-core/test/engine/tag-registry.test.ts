import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineStep,
  implementArtifacts,
} from "@mapgen/authoring/index.js";
import { createExtendedMapContext } from "@mapgen/core/types.js";
import {
  compileExecutionPlan,
  InvalidDependencyTagDemoError,
  isDependencyTagSatisfied,
  PipelineExecutor,
  StepExecutionError,
  StepRegistry,
  TagRegistry,
  UnknownDependencyTagError,
  UnsatisfiedProvidesError,
} from "@mapgen/engine/index.js";
import { Type } from "typebox";

const TEST_TAGS = {
  effect: {
    failedPostcondition: "effect:test.failedPostcondition",
    passedPostcondition: "effect:test.passedPostcondition",
  },
} as const;

const baseEnv = {
  seed: 0,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
};

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

function compilePlan<TContext>(
  registry: StepRegistry<TContext>,
  env: typeof baseEnv,
  steps: readonly string[]
) {
  return compileExecutionPlan(
    {
      recipe: {
        schemaVersion: 2,
        steps: steps.map((id) => ({ id, config: {} })),
      },
      env,
    },
    registry
  );
}

describe("tag registry", () => {
  it("requires explicit provision and a passing artifact predicate for satisfaction", () => {
    const artifactTag = "artifact:test.generic";
    const context = { artifacts: new Map<string, unknown>() };
    const registry = new TagRegistry<typeof context>();
    registry.registerTag({
      id: artifactTag,
      kind: "artifact",
      satisfies: (current) => current.artifacts.has(artifactTag),
    });

    expect(
      isDependencyTagSatisfied(artifactTag, context, { satisfied: new Set([artifactTag]) }, registry)
    ).toBe(false);

    context.artifacts.set(artifactTag, {});
    expect(
      isDependencyTagSatisfied(artifactTag, context, { satisfied: new Set() }, registry)
    ).toBe(false);
    expect(
      isDependencyTagSatisfied(artifactTag, context, { satisfied: new Set([artifactTag]) }, registry)
    ).toBe(true);
  });

  it("fails fast on unknown dependency tags at registration", () => {
    const registry = new StepRegistry<unknown>();

    expect(() =>
      registry.register({
        id: "alpha",
        phase: "foundation",
        requires: ["artifact:missing"],
        provides: [],
        run: () => {},
      })
    ).toThrow(UnknownDependencyTagError);
  });

  it("fails fast on invalid demo payloads", () => {
    const registry = new TagRegistry();

    expect(() =>
      registry.registerTag({
        id: "artifact:demo",
        kind: "artifact",
        demo: "bad",
        validateDemo: (demo) => typeof demo === "number",
      })
    ).toThrow(InvalidDependencyTagDemoError);
  });

  it("surfaces effect postcondition failures with the effect tag id", () => {
    const adapter = createMockAdapter({ width: 2, height: 2 });
    const ctx = createExtendedMapContext({ width: 2, height: 2 }, adapter, baseEnv);

    const registry = new StepRegistry<typeof ctx>();
    registry.registerTag({
      id: TEST_TAGS.effect.failedPostcondition,
      kind: "effect",
      satisfies: (_context, _state) => false,
    });
    registry.register({
      id: "failing-provider",
      phase: "ecology",
      requires: [],
      provides: [TEST_TAGS.effect.failedPostcondition],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, baseEnv, ["failing-provider"]);
    const { stepResults } = executor.executePlanReport(ctx, plan);

    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.failedPostcondition);
  });

  it("accepts provides when effect postconditions pass", () => {
    const adapter = createMockAdapter({ width: 2, height: 2 });
    const ctx = createExtendedMapContext({ width: 2, height: 2 }, adapter, baseEnv);

    const registry = new StepRegistry<typeof ctx>();
    registry.registerTag({
      id: TEST_TAGS.effect.passedPostcondition,
      kind: "effect",
      satisfies: (_context, _state) => true,
    });
    registry.register({
      id: "passing-provider",
      phase: "morphology",
      requires: [],
      provides: [TEST_TAGS.effect.passedPostcondition],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, baseEnv, ["passing-provider"]);
    const { stepResults } = executor.executePlanReport(ctx, plan);

    expect(stepResults[0]?.success).toBe(true);
  });

  it("fails fast when a provider step skips artifact publish", () => {
    const artifact = defineArtifact({
      name: "artifactFoo",
      id: "artifact:test.foo",
      schema: Type.Object({}, { additionalProperties: false }),
    });

    const step = createStep(
      defineStep({
        id: "alpha",
        phase: "foundation",
        requires: [],
        provides: [],
        artifacts: { provides: [artifact] },
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      {
        artifacts: implementArtifacts([artifact], { artifactFoo: {} }),
        run: () => {},
      }
    );

    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "core.base",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    const adapter = createMockAdapter({ width: 2, height: 2 });
    const ctx = createExtendedMapContext({ width: 2, height: 2 }, adapter, baseEnv);

    let error: unknown;
    try {
      recipe.run(ctx, baseEnv, { foundation: { knobs: {}, alpha: {} } });
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(StepExecutionError);
    expect((error as StepExecutionError).cause).toBeInstanceOf(UnsatisfiedProvidesError);
  });
});
