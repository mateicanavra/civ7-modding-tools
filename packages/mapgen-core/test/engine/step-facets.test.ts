import { describe, expect, it } from "bun:test";
import { PipelineAbortError } from "@mapgen/engine/errors.js";
import {
  compileExecutionPlan,
  type EngineContext,
  type MapGenStep,
  PipelineExecutor,
  type StepFacetFailure,
  type StepFacetSinkContext,
  type StepFacetSinks,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { createNoopTraceScope, createTraceSession } from "@mapgen/trace/index.js";

const PROVIDED_TAG = "artifact:test.faceted-step";
const TEST_ENV = {
  seed: 7,
  dimensions: { width: 8, height: 6 },
  latitudeBounds: { topLatitude: 90, bottomLatitude: -90 },
};

interface TestContext extends EngineContext {
  provided: boolean;
}

type TestConfig = Readonly<{ scale: number }>;
type TestResult = Readonly<{ score: number }>;

function createTestContext(): TestContext {
  return { trace: createNoopTraceScope(), provided: false };
}

function createPlan(registry: StepRegistry<TestContext>, stepId: string) {
  return compileExecutionPlan(
    {
      recipe: {
        schemaVersion: 2,
        id: "facet-test",
        steps: [{ id: stepId, config: { scale: 3 } }],
      },
      env: TEST_ENV,
    },
    registry
  );
}

function captureFacetRegistry(
  step: MapGenStep<TestContext, TestConfig, TestResult>,
  onProvides?: () => void
): StepRegistry<TestContext> {
  const registry = new StepRegistry<TestContext>();
  if (step.provides.includes(PROVIDED_TAG)) {
    registry.registerTags([
      {
        id: PROVIDED_TAG,
        kind: "artifact",
        satisfies: (context) => {
          onProvides?.();
          return context.provided;
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
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
      id: "faceted-step",
      phase: "foundation",
      requires: [],
      provides: [PROVIDED_TAG],
      run: (context, config) => {
        order.push("run");
        context.provided = true;
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
      createTestContext(),
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
    expect(contexts[0]?.runId).toBe(contexts[0]?.planFingerprint);
  });

  it("uses one supplied trace identity for synchronous and asynchronous facet sinks", async () => {
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
      id: "trace-identity",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: { metrics: ({ result }) => ({ score: result.score }) },
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);
    Object.defineProperty(plan.nodes[0]?.config, "fingerprintTrap", {
      enumerable: true,
      get: () => {
        throw new Error("A supplied trace identity must not recompute the plan fingerprint.");
      },
    });
    const trace = createTraceSession({
      runId: "custom-run",
      planFingerprint: "custom-plan",
      config: { enabled: true },
      sink: { emit: () => undefined },
    });
    const syncContexts: StepFacetSinkContext[] = [];
    const asyncContexts: StepFacetSinkContext[] = [];
    const executor = new PipelineExecutor(registry, { log: () => {} });

    executor.executePlan(createTestContext(), plan, {
      trace,
      facets: {
        metrics: (_projection, context) => {
          syncContexts.push(context);
        },
      },
    });
    await executor.executePlanAsync(createTestContext(), plan, {
      trace,
      facets: {
        metrics: (_projection, context) => {
          asyncContexts.push(context);
        },
      },
    });

    expect(syncContexts).toHaveLength(1);
    expect(asyncContexts).toHaveLength(1);
    expect(syncContexts[0]).toMatchObject({ runId: "custom-run", planFingerprint: "custom-plan" });
    expect(asyncContexts[0]).toMatchObject({
      runId: "custom-run",
      planFingerprint: "custom-plan",
    });
  });

  it("does not fingerprint a plan without a matching projector and sink", async () => {
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
      id: "no-applicable-facets",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: { metrics: ({ result }) => ({ score: result.score }) },
    };
    const registry = captureFacetRegistry(step);
    const plan = createPlan(registry, step.id);
    Object.defineProperty(plan.nodes[0]?.config, "fingerprintTrap", {
      enumerable: true,
      get: () => {
        throw new Error("An inapplicable facet must not compute the plan fingerprint.");
      },
    });
    const executor = new PipelineExecutor(registry, { log: () => {} });

    expect(executor.executePlan(createTestContext(), plan).stepResults[0]?.success).toBe(true);
    expect(
      (
        await executor.executePlanAsync(createTestContext(), plan, {
          facets: { viz: () => undefined },
        })
      ).stepResults[0]?.success
    ).toBe(true);
  });

  it("skips each projector when its matching sink is absent", () => {
    let metricProjects = 0;
    let vizProjects = 0;
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
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

    executor.executePlan(createTestContext(), plan);
    expect({ metricProjects, vizProjects }).toEqual({ metricProjects: 0, vizProjects: 0 });

    executor.executePlan(createTestContext(), plan, { facets: { metrics: () => {} } });
    expect({ metricProjects, vizProjects }).toEqual({ metricProjects: 1, vizProjects: 0 });
  });

  it("contains and reports projector and sink failures without retrying either facet", () => {
    let metricProjects = 0;
    let vizProjects = 0;
    let vizEmits = 0;
    const metricError = new Error("metric projector failed");
    const vizError = new Error("viz sink failed");
    const failures: StepFacetFailure[] = [];
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
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

    const execution = new PipelineExecutor(registry, { log: () => {} }).executePlan(
      createTestContext(),
      createPlan(registry, step.id),
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
    } as unknown as NonNullable<MapGenStep<TestContext, TestConfig, TestResult>["facets"]>;
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
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
      id: "rejected-facet-thenables",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => ({ score: 1 }),
      facets: unsafeFacets,
    };
    const registry = captureFacetRegistry(step);

    process.on("unhandledRejection", onUnhandledRejection);
    try {
      const execution = new PipelineExecutor(registry, { log: () => {} }).executePlan(
        createTestContext(),
        createPlan(registry, step.id),
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
    const step: MapGenStep<TestContext, TestConfig, TestResult> = {
      id: "post-run-abort",
      phase: "foundation",
      requires: [],
      provides: [PROVIDED_TAG],
      run: async (context) => {
        order.push("run");
        context.provided = true;
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

    let thrown: unknown;
    try {
      await new PipelineExecutor(registry, { log: () => {} }).executePlanAsync(
        createTestContext(),
        createPlan(registry, step.id),
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
