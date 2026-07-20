import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineStep,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createExtendedMapContext } from "@mapgen/core/types.js";
import {
  compileExecutionPlan,
  InvalidDependencyTagDemoError,
  InvalidDependencyTagError,
  isDependencyTagSatisfied,
  PipelineExecutor,
  StepRegistry,
  TagRegistry,
  UnknownDependencyTagError,
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
  it("admits only artifact and effect dependency kinds", () => {
    const registry = new TagRegistry();

    expect(() =>
      registry.registerTag({ id: "artifact:test.snapshot", kind: "artifact" })
    ).not.toThrow();
    expect(() => registry.registerTag({ id: "effect:test.applied", kind: "effect" })).not.toThrow();
    expect(() => registry.registerTag({ id: "field:test.legacy", kind: "field" } as never)).toThrow(
      InvalidDependencyTagError
    );
  });

  it("rejects legacy field ids during recipe tag inference", () => {
    const step = createStep(
      defineStep({
        id: "legacy-field-consumer",
        phase: "foundation",
        requires: ["field:test.legacy"],
        provides: [],
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      { run: () => {} }
    );
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });

    expect(() =>
      createRecipe({
        id: "core.closed-dependency-kinds",
        tagDefinitions: [],
        stages: [stage],
        compileOpsById: {},
      })
    ).toThrow(/expected artifact:\/effect:/);
  });

  it("requires explicit provision and a passing artifact predicate for satisfaction", () => {
    const artifact = defineArtifact({
      name: "genericArtifact",
      id: "artifact:test.generic",
      schema: Type.Unknown(),
    });
    const context = { artifacts: new Map<string, unknown>() };
    const registry = new TagRegistry<typeof context>();
    registry.registerTag({
      id: artifact.id,
      kind: "artifact",
      satisfies: (current) => current.artifacts.has(artifact.id),
    });

    expect(
      isDependencyTagSatisfied(
        artifact.id,
        context,
        { satisfied: new Set([artifact.id]) },
        registry
      )
    ).toBe(false);

    context.artifacts.set(artifact.id, {});
    expect(isDependencyTagSatisfied(artifact.id, context, { satisfied: new Set() }, registry)).toBe(
      false
    );
    expect(
      isDependencyTagSatisfied(
        artifact.id,
        context,
        { satisfied: new Set([artifact.id]) },
        registry
      )
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
        artifacts: {
          provides: [
            {
              artifact,
              validate: (value: unknown) => validateArtifactSchema(artifact.schema, value),
            },
          ],
        },
        schema: Type.Object({}, { additionalProperties: false }),
      }),
      { run: () => {} }
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

    expect(() => recipe.run(ctx, baseEnv, { foundation: { knobs: {}, alpha: {} } })).toThrow(
      /did not satisfy declared provides/
    );
  });
});
