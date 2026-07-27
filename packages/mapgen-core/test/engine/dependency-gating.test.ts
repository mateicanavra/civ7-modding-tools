import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { defineArtifact } from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import {
  compileExecutionPlan,
  type DependencyEvidence,
  type MapSetup,
  MissingDependencyError,
  PipelineExecutor,
  StepExecutionError,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { publishTestArtifact } from "@mapgen/testing/index.js";
import { Type } from "typebox";

const ARTIFACT_IDS = {
  requiredInput: "artifact:test.requiredInput",
  output: "artifact:test.output",
} as const;

const TEST_TAGS = {
  effect: {
    requiredInputReady: "effect:test.required-input-ready",
    outputReady: "effect:test.output-ready",
    operationApplied: "effect:test.operationApplied",
    returnSnapshot: "effect:test.return-snapshot",
  },
} as const;

const EvidenceSchema = Type.Object({ valid: Type.Boolean() }, { additionalProperties: false });
const requiredInputArtifact = defineArtifact({
  name: "requiredInput",
  id: ARTIFACT_IDS.requiredInput,
  schema: EvidenceSchema,
});
const outputArtifact = defineArtifact({
  name: "output",
  id: ARTIFACT_IDS.output,
  schema: EvidenceSchema,
});

function hasRequiredInputEvidence(evidence: DependencyEvidence): boolean {
  const observation = evidence.observeArtifact(requiredInputArtifact);
  return observation.found && observation.value.valid === true;
}

function hasOutputEvidence(evidence: DependencyEvidence): boolean {
  const observation = evidence.observeArtifact(outputArtifact);
  return observation.found && observation.value.valid === true;
}

const TEST_TAG_DEFINITIONS = [
  {
    id: TEST_TAGS.effect.requiredInputReady,
    kind: "effect",
    satisfies: (evidence: DependencyEvidence) => hasRequiredInputEvidence(evidence),
  },
  {
    id: TEST_TAGS.effect.outputReady,
    kind: "effect",
    satisfies: (evidence: DependencyEvidence) => hasOutputEvidence(evidence),
  },
  {
    id: TEST_TAGS.effect.operationApplied,
    kind: "effect",
    satisfies: (evidence: DependencyEvidence) => hasOutputEvidence(evidence),
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
  it("binds authored mutation to the exact active step facade", () => {
    const registry = new StepRegistry();
    let retainedFirstContext: MapContext | undefined;
    let secondContext: MapContext | undefined;
    registry.register({
      id: "retain-first-context",
      stageId: "placement",
      requires: [],
      provides: [],
      run: (current) => {
        retainedFirstContext = current;
      },
    });
    registry.register({
      id: "exercise-second-context",
      stageId: "placement",
      requires: [],
      provides: [],
      run: (current) => {
        secondContext = current;
        expect(() =>
          publishTestArtifact(retainedFirstContext!, outputArtifact, { valid: true })
        ).toThrow("context returned by createMapContext");
        publishTestArtifact(current, outputArtifact, { valid: true });
      },
    });
    const plan = compilePlan(registry, ["retain-first-context", "exercise-second-context"]);
    const rootContext = createTestContext(plan.setup);

    new PipelineExecutor(registry).executePlan(rootContext, plan);

    expect(retainedFirstContext).not.toBe(rootContext);
    expect(secondContext).not.toBe(rootContext);
    expect(secondContext).not.toBe(retainedFirstContext);
    expect(() => publishTestArtifact(rootContext, requiredInputArtifact, { valid: true })).toThrow(
      "currently active step context"
    );
    expect(() =>
      publishTestArtifact(retainedFirstContext!, requiredInputArtifact, { valid: true })
    ).toThrow("context returned by createMapContext");
  });

  it("returns an immutable satisfaction snapshot rather than the executor ledger", () => {
    const tag = TEST_TAGS.effect.returnSnapshot;
    const registry = new StepRegistry();
    registry.registerTag({ id: tag, kind: "effect" });
    registry.register({
      id: "provide-snapshot-tag",
      stageId: "placement",
      requires: [],
      provides: [tag],
      run: () => {},
    });
    const plan = compilePlan(registry, ["provide-snapshot-tag"]);
    const context = createTestContext(plan.setup);

    const { satisfied } = new PipelineExecutor(registry).executePlan(context, plan);

    expect(Array.from(satisfied)).toEqual([tag]);
    expect(satisfied.has(tag)).toBe(true);
    expect(Object.isFrozen(satisfied)).toBe(true);
    expect(Reflect.get(satisfied, "add")).toBeUndefined();
    expect(() => Reflect.apply(Set.prototype.add, satisfied, ["effect:test.forged"])).toThrow(
      TypeError
    );
    expect(Array.from(satisfied)).toEqual([tag]);
  });

  it("fails fast when a dependent step runs without its required input", () => {
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "dependent-step",
      stageId: "placement",
      requires: [TEST_TAGS.effect.requiredInputReady],
      provides: [],
      run: () => {},
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["dependent-step"]);
    const context = createTestContext(plan.setup);

    const error = captureThrown(() => executor.executePlan(context, plan));
    expect(error).toBeInstanceOf(MissingDependencyError);
    expect(error instanceof MissingDependencyError && error.message).toMatch(
      /dependent-step.*effect:test\.required-input-ready/
    );
  });

  it("fails fast when a provided input has an invalid payload", () => {
    const registry = new StepRegistry();
    registry.registerTags(TEST_TAG_DEFINITIONS);
    registry.register({
      id: "provide-input",
      stageId: "placement",
      requires: [],
      provides: [TEST_TAGS.effect.requiredInputReady],
      run: (current) => {
        publishTestArtifact(current, requiredInputArtifact, { valid: false });
      },
    });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    const plan = compilePlan(registry, ["provide-input"]);
    const context = createTestContext(plan.setup);
    const { stepResults } = executor.executePlanReport(context, plan);

    expect(stepResults).toHaveLength(1);
    expect(stepResults[0]?.success).toBe(false);
    expect(stepResults[0]?.error).toContain("did not satisfy declared provides");
    expect(stepResults[0]?.error).toContain(TEST_TAGS.effect.requiredInputReady);
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
        publishTestArtifact(current, outputArtifact, { valid: false });
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

  it("never commits a failed postcondition to sync or async report evidence", async () => {
    const rejectedTag = "effect:test.rejected-postcondition";
    const registry = new StepRegistry();
    registry.registerTag({
      id: rejectedTag,
      kind: "effect",
      satisfies: () => false,
    });
    registry.register({
      id: "reject-postcondition",
      stageId: "placement",
      requires: [],
      provides: [rejectedTag],
      run: () => {},
    });
    const plan = compilePlan(registry, ["reject-postcondition"]);
    const executor = new PipelineExecutor(registry, { log: () => {} });

    const syncResult = executor.executePlanReport(createTestContext(plan.setup), plan);
    const asyncResult = await executor.executePlanReportAsync(createTestContext(plan.setup), plan);

    expect(syncResult.stepResults[0]?.success).toBe(false);
    expect(asyncResult.stepResults[0]?.success).toBe(false);
    expect(Array.from(syncResult.satisfied)).toEqual([]);
    expect(Array.from(asyncResult.satisfied)).toEqual([]);
  });
});
