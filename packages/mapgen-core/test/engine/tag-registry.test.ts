import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  createRecipe,
  createStage,
  createStep,
  defineArtifact,
  defineStep,
  implementArtifactModules,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
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

const baseSetup = admitMapSetup({
  mapSeed: 0,
  dimensions: { width: 2, height: 2 },
  latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
});

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

function compilePlan(registry: StepRegistry, setup: typeof baseSetup, steps: readonly string[]) {
  return compileExecutionPlan(
    {
      recipe: {
        schemaVersion: 2,
        steps: steps.map((id) => ({ id, config: {} })),
      },
      setup,
    },
    registry
  );
}

function executeContextStep(context: MapContext, run: (context: MapContext) => void): void {
  const registry = new StepRegistry();
  registry.register({
    id: "tag-test-step",
    stageId: "foundation",
    requires: [],
    provides: [],
    run,
  });
  const plan = compilePlan(registry, context.setup, ["tag-test-step"]);
  new PipelineExecutor(registry).executePlan(context, plan);
}

describe("tag registry", () => {
  it("validates and retains one owned snapshot of each step dependency list", () => {
    let reads = 0;
    const varyingRequires = ["artifact:test.snapshot"];
    varyingRequires[Symbol.iterator] = () => {
      reads += 1;
      return [reads === 1 ? "artifact:test.snapshot" : "artifact:test.forged"][Symbol.iterator]();
    };
    const registry = new StepRegistry();
    registry.registerTag({ id: "artifact:test.snapshot", kind: "artifact" });

    registry.register({
      id: "snapshot-consumer",
      stageId: "foundation",
      requires: varyingRequires,
      provides: [],
      run: () => {},
    });

    expect(reads).toBe(1);
    expect(registry.get("snapshot-consumer").requires).toEqual(["artifact:test.snapshot"]);
  });

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
    const context = createMapContext({
      setup: baseSetup,
      adapter: createMockAdapter({ width: 2, height: 2, rng: () => 0 }),
    });
    const registry = new TagRegistry();
    registry.registerTag({
      id: artifact.id,
      kind: "artifact",
      satisfies: (current) => current.artifacts.has(artifact.id),
    });
    const runtimes = implementArtifactModules([
      {
        artifact,
        validate: (value: unknown) => validateArtifactSchema(artifact.schema, value),
      },
    ]);

    expect(
      isDependencyTagSatisfied(
        artifact.id,
        context,
        { satisfied: new Set([artifact.id]) },
        registry
      )
    ).toBe(false);

    executeContextStep(context, (activeContext) => {
      runtimes.genericArtifact.publish(activeContext, {});
    });
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

  it("snapshots tag predicates at registration", () => {
    const context = createMapContext({
      setup: baseSetup,
      adapter: createMockAdapter({ width: 2, height: 2, rng: () => 0 }),
    });
    const definition = {
      id: "effect:test.snapshot",
      kind: "effect" as const,
      satisfies: () => false,
    };
    const registry = new TagRegistry();
    registry.registerTag(definition);
    definition.satisfies = () => true;

    expect(
      isDependencyTagSatisfied(
        definition.id,
        context,
        { satisfied: new Set([definition.id]) },
        registry
      )
    ).toBe(false);
    expect(Object.isFrozen(registry.get(definition.id))).toBe(true);
  });

  it("snapshots selected authority without rerunning tag admission", () => {
    let validations = 0;
    const registry = new TagRegistry();
    registry.registerTag({
      id: "effect:test.selected-snapshot",
      kind: "effect",
      demo: { applied: true },
      validateDemo: () => {
        validations += 1;
        return true;
      },
    });

    const snapshot = registry.snapshot(["effect:test.selected-snapshot"]);

    expect(validations).toBe(1);
    expect(snapshot.get("effect:test.selected-snapshot")).toBe(
      registry.get("effect:test.selected-snapshot")
    );
  });

  it("keys registered tags by the same owned identity retained for satisfaction", () => {
    let reads = 0;
    const registry = new TagRegistry();
    registry.registerTag({
      get id() {
        reads += 1;
        return reads === 1 ? "effect:test.alpha" : "effect:test.beta";
      },
      kind: "effect",
    });

    expect(registry.has("effect:test.alpha")).toBe(true);
    expect(registry.get("effect:test.alpha").id).toBe("effect:test.alpha");
    expect(registry.has("effect:test.beta")).toBe(false);
    expect(reads).toBe(1);
  });

  it("fails fast on unknown dependency tags at registration", () => {
    const registry = new StepRegistry();

    expect(() =>
      registry.register({
        id: "alpha",
        stageId: "foundation",
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

    const registry = new StepRegistry();
    registry.registerTag({
      id: TEST_TAGS.effect.failedPostcondition,
      kind: "effect",
      satisfies: (_context, _state) => false,
    });
    registry.register({
      id: "failing-provider",
      stageId: "ecology",
      requires: [],
      provides: [TEST_TAGS.effect.failedPostcondition],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, baseSetup, ["failing-provider"]);
    const ctx = createMapContext({ setup: plan.setup, adapter });
    const { stepResults } = executor.executePlanReport(ctx, plan);

    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.failedPostcondition);
  });

  it("accepts provides when effect postconditions pass", () => {
    const adapter = createMockAdapter({ width: 2, height: 2 });

    const registry = new StepRegistry();
    registry.registerTag({
      id: TEST_TAGS.effect.passedPostcondition,
      kind: "effect",
      satisfies: (_context, _state) => true,
    });
    registry.register({
      id: "passing-provider",
      stageId: "morphology",
      requires: [],
      provides: [TEST_TAGS.effect.passedPostcondition],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, baseSetup, ["passing-provider"]);
    const ctx = createMapContext({ setup: plan.setup, adapter });
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
    const ctx = createMapContext({ setup: baseSetup, adapter });

    expect(() => recipe.run(ctx, { foundation: { knobs: {}, alpha: {} } })).toThrow(
      /did not satisfy declared provides/
    );
  });
});
