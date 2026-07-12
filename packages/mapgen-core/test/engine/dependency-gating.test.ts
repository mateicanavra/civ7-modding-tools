import { describe, expect, it } from "bun:test";
import {
  compileExecutionPlan,
  type EngineContext,
  MissingDependencyError,
  PipelineExecutor,
  StepExecutionError,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { createNoopTraceScope } from "@mapgen/trace/index.js";

const TEST_TAGS = {
  artifact: {
    requiredInput: "artifact:test.requiredInput",
    output: "artifact:test.output",
  },
  effect: {
    operationApplied: "effect:test.operationApplied",
  },
} as const;

interface TestContext extends EngineContext {
  artifacts: Map<string, { valid: boolean }>;
}

const TEST_TAG_DEFINITIONS = [
  {
    id: TEST_TAGS.artifact.requiredInput,
    kind: "artifact",
    satisfies: (context: TestContext) =>
      context.artifacts.get(TEST_TAGS.artifact.requiredInput)?.valid === true,
  },
  {
    id: TEST_TAGS.artifact.output,
    kind: "artifact",
    satisfies: (context: TestContext) =>
      context.artifacts.get(TEST_TAGS.artifact.output)?.valid === true,
  },
  {
    id: TEST_TAGS.effect.operationApplied,
    kind: "effect",
    satisfies: (context: TestContext) =>
      context.artifacts.get(TEST_TAGS.artifact.output)?.valid === true,
  },
] as const;

const TEST_ENV = {
  seed: 0,
  dimensions: { width: 1, height: 1 },
  latitudeBounds: { topLatitude: 0, bottomLatitude: 0 },
};

function createTestContext(): TestContext {
  return {
    trace: createNoopTraceScope(),
    artifacts: new Map(),
  };
}

function compilePlan<TContext>(registry: StepRegistry<TContext>, steps: readonly string[]) {
  return compileExecutionPlan(
    {
      recipe: {
        schemaVersion: 2,
        steps: steps.map((id) => ({ id, config: {} })),
      },
      env: TEST_ENV,
    },
    registry
  );
}

function captureThrown(run: () => void): unknown {
  try {
    run();
  } catch (error: unknown) {
    return error;
  }
  throw new Error("Expected operation to throw.");
}

describe("dependency gating", () => {
  it("fails fast when a dependent step runs without its required input", () => {
    const context = createTestContext();

    const registry = new StepRegistry<TestContext>();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "dependent-step",
      phase: "placement",
      requires: [TEST_TAGS.artifact.requiredInput],
      provides: [],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["dependent-step"]);

    const error = captureThrown(() => executor.executePlan(context, plan));
    expect(error).toBeInstanceOf(MissingDependencyError);
    expect(error instanceof MissingDependencyError && error.message).toMatch(
      /dependent-step.*artifact:test\.requiredInput/
    );
  });

  it("fails fast when a provided input has an invalid payload", () => {
    const context = createTestContext();

    const registry = new StepRegistry<TestContext>();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "provide-input",
      phase: "placement",
      requires: [],
      provides: [TEST_TAGS.artifact.requiredInput],
      run: (current) => {
        current.artifacts.set(TEST_TAGS.artifact.requiredInput, { valid: false });
      },
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["provide-input"]);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.artifact.requiredInput);
  });

  it("fails fast when declared output effects are missing", () => {
    const context = createTestContext();

    const registry = new StepRegistry<TestContext>();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "apply-operation",
      phase: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.operationApplied],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["apply-operation"]);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.operationApplied);
  });

  it("fails fast when output effects are backed by invalid state", () => {
    const context = createTestContext();

    const registry = new StepRegistry<TestContext>();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "apply-operation",
      phase: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.operationApplied],
      run: (current) => {
        current.artifacts.set(TEST_TAGS.artifact.output, { valid: false });
      },
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["apply-operation"]);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.operationApplied);
  });

  it("throws StepExecutionError on unsatisfied provides", () => {
    const context = createTestContext();

    const registry = new StepRegistry<TestContext>();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "apply-operation",
      phase: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.operationApplied],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["apply-operation"]);

    const error = captureThrown(() => executor.executePlan(context, plan));
    expect(error).toBeInstanceOf(StepExecutionError);
    expect(error instanceof StepExecutionError && error.message).toMatch(
      /apply-operation.*did not satisfy declared provides/
    );
  });
});
