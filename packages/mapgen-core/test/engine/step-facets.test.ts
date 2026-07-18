import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import {
  defineArtifact,
  implementArtifactModules,
  validateArtifactSchema,
} from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { PipelineAbortError } from "@mapgen/engine/errors.js";
import {
  compileExecutionPlan,
  computePlanFingerprint,
  type MapGenStep,
  type MapSetup,
  PipelineExecutor,
  type StepFacetFailure,
  type StepFacetSinkContext,
  type StepFacetSinks,
  StepRegistry,
} from "@mapgen/engine/index.js";
import type { TraceEvent } from "@mapgen/trace/index.js";
import { Type } from "typebox";

const PROVIDED_TAG = "artifact:test.faceted-step";
const facetedStepArtifact = defineArtifact({
  name: "facetedStep",
  id: PROVIDED_TAG,
  schema: Type.Boolean(),
});
const facetedStepArtifacts = implementArtifactModules([
  {
    artifact: facetedStepArtifact,
    validate: (value: unknown) => validateArtifactSchema(facetedStepArtifact.schema, value),
  },
]);
const TEST_ENV = {
  mapSeed: 7,
  dimensions: { width: 8, height: 6 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

type TestConfig = Readonly<{ scale: number }>;
type TestResult = Readonly<{ score: number }>;

function createTestContext(setup: MapSetup): MapContext {
  return createMapContext({
    setup,
    adapter: createMockAdapter({ width: 8, height: 6, rng: () => 0 }),
  });
}

function createPlan(registry: StepRegistry, stepId: string) {
  return compileExecutionPlan(
    {
      recipe: {
        schemaVersion: 2,
        id: "facet-test",
        steps: [{ id: stepId, config: { scale: 3 } }],
      },
      setup: TEST_ENV,
    },
    registry
  );
}

function captureFacetRegistry(
  step: MapGenStep<TestConfig, TestResult>,
  onProvides?: () => void
): StepRegistry {
  const registry = new StepRegistry();
  if (step.provides.includes(PROVIDED_TAG)) {
    registry.registerTags([
      {
        id: PROVIDED_TAG,
        kind: "artifact",
        satisfies: (context) => {
          onProvides?.();
          return context.artifacts.has(PROVIDED_TAG);
        },
      },
    ]);
  }
  registry.register(step);
  return registry;
}

describe("step facets", () => {
  it("projects after provides validation and emits metrics before visualization", () => {
    const order: string[] = [];
    let borrowedResult: TestResult | undefined;
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "faceted-step",
      phase: "foundation",
      requires: [],
      provides: [PROVIDED_TAG],
      run: (context, config) => {
        order.push("run");
        facetedStepArtifacts.facetedStep.publish(context, true);
        borrowedResult = { score: config.scale * 2 };
        return borrowedResult;
      },
      facets: {
        metrics: (input) => {
          order.push("metrics.project");
          if (!borrowedResult) throw new Error("Expected the step result before facet projection.");
          expect(input.result).toBe(borrowedResult);
          expect(input).toEqual({
            result: { score: 6 },
            config: { scale: 3 },
            dimensions: { width: 8, height: 6 },
          });
          expect(Object.isFrozen(input)).toBe(true);
          expect(Object.isFrozen(input.dimensions)).toBe(true);
          return { score: input.result.score };
        },
        viz: () => {
          order.push("viz.project");
          return [];
        },
      },
    };
    const registry = captureFacetRegistry(step, () => order.push("provides"));
    const plan = createPlan(registry, step.id);
    const contexts: StepFacetSinkContext[] = [];

    const execution = new PipelineExecutor(registry, { log: () => {} }).executePlan(
      createTestContext(plan.setup),
      plan,
      {
        facets: {
          metrics: (projection, context) => {
            order.push("metrics.sink");
            expect(projection).toEqual({ score: 6 });
            contexts.push(context);
          },
          viz: (projections, context) => {
            order.push("viz.sink");
            expect(projections).toEqual([]);
            contexts.push(context);
          },
        },
      }
    );

    expect(execution.stepResults[0]?.success).toBe(true);
    expect(order).toEqual([
      "run",
      "provides",
      "metrics.project",
      "metrics.sink",
      "viz.project",
      "viz.sink",
    ]);
    expect(contexts).toHaveLength(2);
    expect(contexts[0]?.runId.length).toBeGreaterThan(0);
    expect(contexts[0]?.planFingerprint.length).toBeGreaterThan(0);
    expect(contexts[0]?.stepId).toBe(step.id);
    expect(contexts[0]?.phase).toBe(step.phase);
    expect(contexts[0]?.stepIndex).toBe(0);
    expect(contexts[0]).toEqual(contexts[1]);
    expect(contexts[0]?.runId).not.toBe(contexts[0]?.planFingerprint);
  });

  it("shares each execution-owned identity between trace and facet evidence", async () => {
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "trace-identity",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: { metrics: ({ result }) => ({ score: result.score }) },
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);
    const planFingerprint = computePlanFingerprint(plan);
    const syncContexts: StepFacetSinkContext[] = [];
    const asyncContexts: StepFacetSinkContext[] = [];
    const syncEvents: TraceEvent[] = [];
    const asyncEvents: TraceEvent[] = [];
    const executor = new PipelineExecutor(registry, { log: () => {} });

    executor.executePlan(createTestContext(plan.setup), plan, {
      trace: { config: {}, sink: { emit: (event) => syncEvents.push(event) } },
      facets: {
        metrics: (_projection, context) => {
          syncContexts.push(context);
        },
      },
    });
    await executor.executePlanAsync(createTestContext(plan.setup), plan, {
      trace: { config: {}, sink: { emit: (event) => asyncEvents.push(event) } },
      facets: {
        metrics: (_projection, context) => {
          asyncContexts.push(context);
        },
      },
    });

    expect(syncContexts).toHaveLength(1);
    expect(asyncContexts).toHaveLength(1);
    const syncRunId = syncEvents.find((event) => event.kind === "run.start")?.runId;
    const asyncRunId = asyncEvents.find((event) => event.kind === "run.start")?.runId;
    expect(syncRunId).toBeTruthy();
    expect(asyncRunId).toBeTruthy();
    expect(syncRunId).not.toBe(asyncRunId);
    expect(syncContexts[0]).toMatchObject({ runId: syncRunId, planFingerprint });
    expect(asyncContexts[0]).toMatchObject({ runId: asyncRunId, planFingerprint });
  });

  it("allocates a fresh identity for each untraced facet execution", () => {
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "untraced-identity",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: { metrics: ({ result }) => ({ score: result.score }) },
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);
    const contexts: StepFacetSinkContext[] = [];
    const executor = new PipelineExecutor(registry, { log: () => {} });
    const execute = () =>
      executor.executePlan(createTestContext(plan.setup), plan, {
        facets: {
          metrics: (_projection, context) => {
            contexts.push(context);
          },
        },
      });

    execute();
    execute();

    expect(contexts).toHaveLength(2);
    expect(contexts[0]?.runId).not.toBe(contexts[1]?.runId);
    expect(contexts[0]?.planFingerprint).toBe(contexts[1]?.planFingerprint);
  });

  it("skips each projector when its matching sink is absent", () => {
    let metricProjects = 0;
    let vizProjects = 0;
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "optional-facets",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: {
        metrics: () => {
          metricProjects += 1;
          return { score: 1 };
        },
        viz: () => {
          vizProjects += 1;
          return [];
        },
      },
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);
    const executor = new PipelineExecutor(registry, { log: () => {} });

    executor.executePlan(createTestContext(plan.setup), plan);
    expect({ metricProjects, vizProjects }).toEqual({ metricProjects: 0, vizProjects: 0 });

    executor.executePlan(createTestContext(plan.setup), plan, { facets: { metrics: () => {} } });
    expect({ metricProjects, vizProjects }).toEqual({ metricProjects: 1, vizProjects: 0 });
  });

  it("contains and reports projector and sink failures without retrying either facet", () => {
    let metricProjects = 0;
    let vizProjects = 0;
    let vizEmits = 0;
    const metricError = new Error("metric projector failed");
    const vizError = new Error("viz sink failed");
    const failures: StepFacetFailure[] = [];
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "failing-facets",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: {
        metrics: () => {
          metricProjects += 1;
          throw metricError;
        },
        viz: () => {
          vizProjects += 1;
          return [];
        },
      },
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);

    const execution = new PipelineExecutor(registry, { log: () => {} }).executePlan(
      createTestContext(plan.setup),
      plan,
      {
        facets: {
          metrics: () => {
            throw new Error("unreachable metrics sink");
          },
          viz: () => {
            vizEmits += 1;
            throw vizError;
          },
          onError: (failure) => {
            failures.push(failure);
          },
        },
      }
    );

    expect(execution.stepResults[0]?.success).toBe(true);
    expect({ metricProjects, vizProjects, vizEmits }).toEqual({
      metricProjects: 1,
      vizProjects: 1,
      vizEmits: 1,
    });
    expect(failures.map(({ facet, operation, error }) => ({ facet, operation, error }))).toEqual([
      { facet: "metrics", operation: "project", error: metricError },
      { facet: "viz", operation: "emit", error: vizError },
    ]);
  });

  it("contains rejected thenables returned across untyped facet boundaries", async () => {
    let metricProjects = 0;
    let vizProjects = 0;
    let vizEmits = 0;
    const metricError = new Error("async metric projector failed");
    const vizError = new Error("async viz sink failed");
    const failures: StepFacetFailure[] = [];
    const unhandledRejections: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);
    const unsafeFacets = {
      metrics: () => {
        metricProjects += 1;
        return Promise.reject(metricError);
      },
      viz: () => {
        vizProjects += 1;
        return [];
      },
    } as unknown as NonNullable<MapGenStep<TestConfig, TestResult>["facets"]>;
    const unsafeSinks = {
      metrics: () => undefined,
      viz: () => {
        vizEmits += 1;
        return Promise.reject(vizError);
      },
      onError: (failure: StepFacetFailure) => {
        failures.push(failure);
      },
    } as unknown as StepFacetSinks;
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "rejected-facet-thenables",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: unsafeFacets,
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);

    process.on("unhandledRejection", onUnhandledRejection);
    try {
      const execution = new PipelineExecutor(registry, { log: () => {} }).executePlan(
        createTestContext(plan.setup),
        plan,
        { facets: unsafeSinks }
      );
      await Bun.sleep(0);

      expect(execution.stepResults[0]?.success).toBe(true);
      expect({ metricProjects, vizProjects, vizEmits }).toEqual({
        metricProjects: 1,
        vizProjects: 1,
        vizEmits: 1,
      });
      expect(failures.map(({ facet, operation, error }) => ({ facet, operation, error }))).toEqual([
        { facet: "metrics", operation: "project", error: expect.any(TypeError) },
        { facet: "viz", operation: "emit", error: expect.any(TypeError) },
      ]);
      expect(unhandledRejections).toEqual([]);
    } finally {
      process.off("unhandledRejection", onUnhandledRejection);
    }
  });

  it("checks abort after provides and before projecting async facets", async () => {
    const order: string[] = [];
    const abortSignal = { aborted: false };
    const step: MapGenStep<TestConfig, TestResult> = {
      id: "post-run-abort",
      phase: "foundation",
      requires: [],
      provides: [PROVIDED_TAG],
      run: async (context) => {
        order.push("run");
        facetedStepArtifacts.facetedStep.publish(context, true);
        abortSignal.aborted = true;
        return { score: 1 };
      },
      facets: {
        metrics: () => {
          order.push("metrics.project");
          return { score: 1 };
        },
        viz: () => {
          order.push("viz.project");
          return [];
        },
      },
    };
    const registry = captureFacetRegistry(step, () => order.push("provides"));
    const plan = createPlan(registry, step.id);

    let thrown: unknown;
    try {
      await new PipelineExecutor(registry, { log: () => {} }).executePlanAsync(
        createTestContext(plan.setup),
        plan,
        {
          abortSignal,
          facets: { metrics: () => {}, viz: () => {} },
        }
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(PipelineAbortError);
    expect(order).toEqual(["run", "provides"]);
  });
});
