import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { defineArtifact, readArtifact } from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import {
  type CompletionId,
  compileExecutionPlan,
  type MapSetup,
  MissingArtifactPublicationError,
  PipelineExecutor,
  StepExecutionError,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { publishTestArtifact } from "@mapgen/testing/index.js";
import { Type } from "typebox";

const COMPLETIONS = {
  prerequisite: "completion:test.prerequisite",
  operation: "completion:test.operation",
} as const satisfies Readonly<Record<string, CompletionId>>;

const EvidenceSchema = Type.Object({ valid: Type.Boolean() }, { additionalProperties: false });
const requiredInputArtifact = defineArtifact({
  name: "requiredInput",
  id: "artifact:test.required-input",
  schema: EvidenceSchema,
});
const outputArtifact = defineArtifact({
  name: "output",
  id: "artifact:test.output",
  schema: EvidenceSchema,
});

const TEST_SETUP = {
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
      setup: TEST_SETUP,
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
  it("admits only canonical completion dependency identities", () => {
    const registry = new StepRegistry();
    expect(() =>
      registry.register({
        id: "invalid-completion",
        stageId: "placement",
        requires: [],
        provides: ["invalid:test.legacy" as never],
        run: () => undefined,
      })
    ).toThrow("must match completion:");
    expect(() =>
      registry.register({
        id: "canonical-completion",
        stageId: "placement",
        requires: [],
        provides: [COMPLETIONS.operation],
        run: () => undefined,
      })
    ).not.toThrow();
  });

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

  it("executes a selected completion provider before its consumer", () => {
    const registry = new StepRegistry();
    const order: string[] = [];
    registry.register({
      id: "complete-prerequisite",
      stageId: "placement",
      requires: [],
      provides: [COMPLETIONS.prerequisite],
      run: () => {
        order.push("provider");
      },
    });
    registry.register({
      id: "consume-prerequisite",
      stageId: "placement",
      requires: [COMPLETIONS.prerequisite],
      provides: [],
      run: () => {
        order.push("consumer");
      },
    });
    const plan = compilePlan(registry, ["complete-prerequisite", "consume-prerequisite"]);

    const { stepResults } = new PipelineExecutor(registry).executePlan(
      createTestContext(plan.setup),
      plan
    );

    expect(order).toEqual(["provider", "consumer"]);
    expect(stepResults.map(({ stepId, success }) => ({ stepId, success }))).toEqual([
      { stepId: "complete-prerequisite", success: true },
      { stepId: "consume-prerequisite", success: true },
    ]);
  });

  it("never executes a completion consumer after its provider fails", async () => {
    const registry = new StepRegistry();
    let providerRuns = 0;
    let consumerRuns = 0;
    registry.register({
      id: "failed-provider",
      stageId: "placement",
      requires: [],
      provides: [COMPLETIONS.operation],
      run: () => {
        providerRuns += 1;
        throw new Error("provider failed");
      },
    });
    registry.register({
      id: "unreachable-consumer",
      stageId: "placement",
      requires: [COMPLETIONS.operation],
      provides: [],
      run: () => {
        consumerRuns += 1;
      },
    });
    const plan = compilePlan(registry, ["failed-provider", "unreachable-consumer"]);
    const executor = new PipelineExecutor(registry, { log: () => undefined });

    const syncResult = executor.executePlanReport(createTestContext(plan.setup), plan);
    const asyncResult = await executor.executePlanReportAsync(createTestContext(plan.setup), plan);

    expect(syncResult.stepResults).toHaveLength(1);
    expect(asyncResult.stepResults).toHaveLength(1);
    expect(syncResult.stepResults[0]).toMatchObject({ stepId: "failed-provider", success: false });
    expect(asyncResult.stepResults[0]).toMatchObject({ stepId: "failed-provider", success: false });
    expect(providerRuns).toBe(2);
    expect(consumerRuns).toBe(0);
  });

  it("never executes a completion consumer after its provider rejects asynchronously", async () => {
    const registry = new StepRegistry();
    let providerRuns = 0;
    let consumerRuns = 0;
    registry.register({
      id: "rejected-provider",
      stageId: "placement",
      requires: [],
      provides: [COMPLETIONS.operation],
      run: () => {
        providerRuns += 1;
        return Promise.reject(new Error("async provider failed"));
      },
    });
    registry.register({
      id: "unreachable-async-consumer",
      stageId: "placement",
      requires: [COMPLETIONS.operation],
      provides: [],
      run: () => {
        consumerRuns += 1;
      },
    });
    const plan = compilePlan(registry, ["rejected-provider", "unreachable-async-consumer"]);

    const report = await new PipelineExecutor(registry, {
      log: () => undefined,
    }).executePlanReportAsync(createTestContext(plan.setup), plan);

    expect(report.stepResults).toHaveLength(1);
    expect(report.stepResults[0]).toMatchObject({
      stepId: "rejected-provider",
      success: false,
      error: "async provider failed",
    });
    expect(providerRuns).toBe(1);
    expect(consumerRuns).toBe(0);
  });

  it("admits an artifact once while its ordered consumer and terminal reads observe it", () => {
    let admissions = 0;
    const admittedArtifact = defineArtifact({
      name: "admittedOnce",
      id: "artifact:test.admitted-once",
      schema: EvidenceSchema,
      refine: () => {
        admissions += 1;
      },
    });
    const registry = new StepRegistry();
    const order: string[] = [];
    registry.register({
      id: "publish-input",
      stageId: "placement",
      requires: [],
      provides: [admittedArtifact],
      run: (current) => {
        order.push("provider");
        publishTestArtifact(current, admittedArtifact, { valid: true });
      },
    });
    registry.register({
      id: "consume-input",
      stageId: "placement",
      requires: [admittedArtifact],
      provides: [],
      run: () => {
        order.push("consumer");
      },
    });
    const plan = compilePlan(registry, ["publish-input", "consume-input"]);
    const context = createTestContext(plan.setup);

    const { stepResults } = new PipelineExecutor(registry).executePlan(context, plan);

    expect(order).toEqual(["provider", "consumer"]);
    expect(stepResults.every(({ success }) => success)).toBe(true);
    expect(readArtifact(context, admittedArtifact)).toEqual({ valid: true });
    expect(admissions).toBe(1);
  });

  it("refuses a declared artifact that the provider did not publish", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "omit-publication",
      stageId: "placement",
      requires: [],
      provides: [outputArtifact],
      run: () => undefined,
    });
    const plan = compilePlan(registry, ["omit-publication"]);
    const executor = new PipelineExecutor(registry, { log: () => undefined });

    const report = executor.executePlanReport(createTestContext(plan.setup), plan);

    expect(report.stepResults[0]?.success).toBe(false);
    expect(report.stepResults[0]?.error).toContain(outputArtifact.id);

    const thrown = captureThrown(() => executor.executePlan(createTestContext(plan.setup), plan));
    expect(thrown).toBeInstanceOf(StepExecutionError);
    expect(thrown instanceof StepExecutionError && thrown.cause).toBeInstanceOf(
      MissingArtifactPublicationError
    );
  });

  it("does not satisfy a declared artifact through another authority with the same id", () => {
    const publishedAuthority = defineArtifact({
      name: "publishedAuthority",
      id: "artifact:test.exact-authority",
      schema: EvidenceSchema,
    });
    const declaredAuthority = defineArtifact({
      name: "declaredAuthority",
      id: publishedAuthority.id,
      schema: EvidenceSchema,
    });
    const registry = new StepRegistry();
    registry.register({
      id: "publish-different-authority",
      stageId: "placement",
      requires: [],
      provides: [declaredAuthority],
      run: (context) => {
        publishTestArtifact(context, publishedAuthority, { valid: true });
      },
    });
    const plan = compilePlan(registry, ["publish-different-authority"]);

    const report = new PipelineExecutor(registry).executePlanReport(
      createTestContext(plan.setup),
      plan
    );

    expect(report.stepResults[0]?.success).toBe(false);
    expect(report.stepResults[0]?.error).toContain(declaredAuthority.id);
  });
});
