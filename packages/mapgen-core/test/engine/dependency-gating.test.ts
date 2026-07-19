import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  defineArtifact,
  implementArtifactModules,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import {
  compileExecutionPlan,
  type MapSetup,
  MissingDependencyError,
  PipelineExecutor,
  StepExecutionError,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { Type } from "typebox";

const TEST_TAGS = {
  artifact: {
    requiredInput: "artifact:test.requiredInput",
    output: "artifact:test.output",
  },
  effect: {
    operationApplied: "effect:test.operationApplied",
  },
} as const;

const EvidenceSchema = Type.Object({ valid: Type.Boolean() }, { additionalProperties: false });
const requiredInputArtifact = defineArtifact({
  name: "requiredInput",
  id: TEST_TAGS.artifact.requiredInput,
  schema: EvidenceSchema,
});
const outputArtifact = defineArtifact({
  name: "output",
  id: TEST_TAGS.artifact.output,
  schema: EvidenceSchema,
});
const testArtifactRuntimes = implementArtifactModules([
  {
    artifact: requiredInputArtifact,
    validate: (value: unknown) => validateArtifactSchema(EvidenceSchema, value),
  },
  {
    artifact: outputArtifact,
    validate: (value: unknown) => validateArtifactSchema(EvidenceSchema, value),
  },
]);

function isValidEvidence(value: unknown): value is { readonly valid: boolean } {
  return typeof value === "object" && value !== null && "valid" in value && value.valid === true;
}

const TEST_TAG_DEFINITIONS = [
  {
    id: TEST_TAGS.artifact.requiredInput,
    kind: "artifact",
    satisfies: (context: MapContext) =>
      isValidEvidence(context.artifacts.get(TEST_TAGS.artifact.requiredInput)),
  },
  {
    id: TEST_TAGS.artifact.output,
    kind: "artifact",
    satisfies: (context: MapContext) =>
      isValidEvidence(context.artifacts.get(TEST_TAGS.artifact.output)),
  },
  {
    id: TEST_TAGS.effect.operationApplied,
    kind: "effect",
    satisfies: (context: MapContext) =>
      isValidEvidence(context.artifacts.get(TEST_TAGS.artifact.output)),
  },
] as const;

const TEST_ENV = {
  mapSeed: 0,
  dimensions: { width: 1, height: 1 },
  latitudeBounds: { topLatitude: 1, bottomLatitude: -1 },
};

function createTestContext(setup: MapSetup): MapContext {
  return createMapContext({
    setup,
    adapter: createMockAdapter({ width: 1, height: 1, rng: () => 0 }),
  });
}

function compilePlan(registry: StepRegistry, steps: readonly string[]) {
  return compileExecutionPlan(
    {
      recipe: {
        schemaVersion: 2,
        steps: steps.map((id) => ({ id, config: {} })),
      },
      setup: TEST_ENV,
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
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "dependent-step",
      stageId: "placement",
      requires: [TEST_TAGS.artifact.requiredInput],
      provides: [],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["dependent-step"]);
    const context = createTestContext(plan.setup);

    const error = captureThrown(() => executor.executePlan(context, plan));
    expect(error).toBeInstanceOf(MissingDependencyError);
    expect(error instanceof MissingDependencyError && error.message).toMatch(
      /dependent-step.*artifact:test\.requiredInput/
    );
  });

  it("fails fast when a provided input has an invalid payload", () => {
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "provide-input",
      stageId: "placement",
      requires: [],
      provides: [TEST_TAGS.artifact.requiredInput],
      run: (current) => {
        testArtifactRuntimes.requiredInput.publish(current, { valid: false });
      },
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["provide-input"]);
    const context = createTestContext(plan.setup);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.artifact.requiredInput);
  });

  it("fails fast when declared output effects are missing", () => {
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "apply-operation",
      stageId: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.operationApplied],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["apply-operation"]);
    const context = createTestContext(plan.setup);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.operationApplied);
  });

  it("fails fast when output effects are backed by invalid state", () => {
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "apply-operation",
      stageId: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.operationApplied],
      run: (current) => {
        testArtifactRuntimes.output.publish(current, { valid: false });
      },
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["apply-operation"]);
    const context = createTestContext(plan.setup);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.operationApplied);
  });

  it("throws StepExecutionError on unsatisfied provides", () => {
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "apply-operation",
      stageId: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.operationApplied],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["apply-operation"]);
    const context = createTestContext(plan.setup);

    const error = captureThrown(() => executor.executePlan(context, plan));
    expect(error).toBeInstanceOf(StepExecutionError);
    expect(error instanceof StepExecutionError && error.message).toMatch(
      /apply-operation.*did not satisfy declared provides/
    );
  });
});
