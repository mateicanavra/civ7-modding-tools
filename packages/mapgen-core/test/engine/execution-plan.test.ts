import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createMapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import {
  compileExecutionPlan,
  computePlanFingerprint,
  type ExecutionPlan,
  ExecutionPlanCompileError,
  type MapGenStep,
  PipelineExecutor,
  type RunRequest,
  StepRegistry,
} from "@mapgen/engine/index.js";
import type { TraceEvent } from "@mapgen/trace/index.js";
import { Type } from "typebox";

const TEST_TAGS = {
  artifact: {
    foundationPlates: "artifact:test.foundationPlates",
  },
} as const;

const baseSetup = {
  mapSeed: 123,
  dimensions: { width: 10, height: 10 },
  latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
};

describe("compileExecutionPlan", () => {
  it("compiles a linear recipe into ordered plan nodes", () => {
    const registry = new StepRegistry();
    registry.registerTags([{ id: TEST_TAGS.artifact.foundationPlates, kind: "artifact" }]);
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [TEST_TAGS.artifact.foundationPlates],
      configSchema: Type.Object(
        {
          value: Type.Number({ default: 3 }),
        },
        { additionalProperties: false }
      ),
      run: (_context, _config) => {},
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [
            {
              id: "alpha",
              config: { value: 3 },
            },
          ],
        },
        setup: baseSetup,
      },
      registry
    );

    expect(plan.nodes).toHaveLength(1);
    expect(plan.nodes[0].stepId).toBe("alpha");
    expect(plan.nodes[0].stageId).toBe("foundation");
    expect(plan.nodes[0].config).toEqual({ value: 3 });
    expect(plan.nodes[0].requires).toEqual([]);
    expect(plan.nodes[0].provides).toEqual([TEST_TAGS.artifact.foundationPlates]);
  });

  it("snapshots mutable setup before retaining it on the plan", () => {
    const registry = new StepRegistry();
    const setup = {
      mapSeed: 7,
      dimensions: { width: 10, height: 10 },
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
    };
    const plan = compileExecutionPlan({ recipe: { schemaVersion: 2, steps: [] }, setup }, registry);

    setup.mapSeed = 11;
    setup.dimensions.width = 20;
    expect(plan.setup.mapSeed).toBe(7);
    expect(plan.setup.dimensions.width).toBe(10);
    expect(Object.isFrozen(plan.setup)).toBe(true);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.nodes)).toBe(true);
  });

  it("freezes the setup association and node topology retained by the plan", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });
    const plan = compileExecutionPlan(
      {
        recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] },
        setup: baseSetup,
      },
      registry
    );

    expect(Object.isFrozen(plan.nodes[0])).toBe(true);
    expect(Object.isFrozen(plan.nodes[0].requires)).toBe(true);
    expect(Object.isFrozen(plan.nodes[0].provides)).toBe(true);
    expect(() => Object.assign(plan, { setup: baseSetup })).toThrow();
  });

  it("binds execution to the frozen step registered before plan compilation", () => {
    const observed: string[] = [];
    const registry = new StepRegistry();
    const step = {
      id: "alpha",
      stageId: "foundation" as MapGenStep["stageId"],
      requires: [],
      provides: [],
      run: () => {
        observed.push("registered");
      },
    };
    registry.register(step);
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] }, setup: baseSetup },
      registry
    );

    step.stageId = "placement";
    step.run = () => {
      observed.push("mutated");
    };

    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10, rng: () => 0 }),
    });
    new PipelineExecutor(registry, { log: () => {} }).executePlan(context, plan);

    expect(plan.nodes[0]?.stageId).toBe("foundation");
    expect(observed).toEqual(["registered"]);
    expect(Object.isFrozen(registry.get("alpha"))).toBe(true);
  });

  it("executes from the dependency-tag authority captured during plan compilation", () => {
    const effectTag = "effect:test.compiled-authority";
    const registry = new StepRegistry();
    registry.registerTag({ id: effectTag, kind: "effect" });
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [effectTag],
      run: () => {},
    });
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] }, setup: baseSetup },
      registry
    );
    Object.defineProperty(registry, "getTagRegistry", {
      value: () => {
        throw new Error("execution reread the live tag registry");
      },
    });

    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10, rng: () => 0 }),
    });

    expect(() => new PipelineExecutor(registry).executePlan(context, plan)).not.toThrow();
  });

  it("rejects accessor-bearing recipe topology before it can diverge from execution", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });
    let reads = 0;
    const step = {
      get id() {
        reads += 1;
        return reads === 1 ? "alpha" : "beta";
      },
    };

    expect(() =>
      compileExecutionPlan(
        {
          recipe: { schemaVersion: 2, steps: [step] },
          setup: baseSetup,
        },
        registry
      )
    ).toThrow("Accessors are not portable JSON properties");
    expect(reads).toBe(0);
  });

  it("refuses unsupported recipe schema versions at the plan-admission boundary", () => {
    const registry = new StepRegistry();
    const request = {
      recipe: { schemaVersion: 3, steps: [] },
      setup: baseSetup,
    } as unknown as RunRequest;

    expect(() => compileExecutionPlan(request, registry)).toThrow(ExecutionPlanCompileError);
    try {
      compileExecutionPlan(request, registry);
    } catch (error) {
      expect((error as ExecutionPlanCompileError).errors).toContainEqual(
        expect.objectContaining({ code: "runRequest.invalid", path: "/recipe/schemaVersion" })
      );
    }
  });

  it("reports malformed recipe topology as a typed compile error", () => {
    const registry = new StepRegistry();
    const request = {
      recipe: { schemaVersion: 2, steps: "not-an-array" },
      setup: baseSetup,
    } as unknown as RunRequest;

    expect(() => compileExecutionPlan(request, registry)).toThrow(ExecutionPlanCompileError);
    try {
      compileExecutionPlan(request, registry);
    } catch (error) {
      expect((error as ExecutionPlanCompileError).errors).toContainEqual(
        expect.objectContaining({ code: "runRequest.invalid", path: "/recipe/steps" })
      );
    }
  });

  it("refuses extra authority at the closed run-request boundary", () => {
    const registry = new StepRegistry();
    const request = {
      recipe: { schemaVersion: 2, steps: [] },
      setup: baseSetup,
      trace: { enabled: true },
    } as unknown as RunRequest;

    expect(() => compileExecutionPlan(request, registry)).toThrow(ExecutionPlanCompileError);
    try {
      compileExecutionPlan(request, registry);
    } catch (error) {
      expect((error as ExecutionPlanCompileError).errors).toContainEqual(
        expect.objectContaining({ code: "runRequest.invalid", path: "/trace" })
      );
    }
  });

  it("keys registered steps by the same owned identity retained for execution", () => {
    let reads = 0;
    const registry = new StepRegistry();
    registry.register({
      get id() {
        reads += 1;
        return reads === 1 ? "alpha" : "beta";
      },
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });

    expect(registry.has("alpha")).toBe(true);
    expect(registry.get("alpha").id).toBe("alpha");
    expect(registry.has("beta")).toBe(false);
    expect(reads).toBe(1);
  });

  it("includes exact dependency topology in the plan fingerprint", () => {
    const first = new StepRegistry();
    first.registerTags([{ id: "artifact:test.first", kind: "artifact" }]);
    first.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: ["artifact:test.first"],
      run: () => {},
    });
    const second = new StepRegistry();
    second.register({
      id: "alpha",
      stageId: "placement",
      requires: [],
      provides: [],
      run: () => {},
    });
    const request = {
      recipe: { schemaVersion: 2 as const, steps: [{ id: "alpha" }] },
      setup: baseSetup,
    };

    expect(computePlanFingerprint(compileExecutionPlan(request, first))).not.toBe(
      computePlanFingerprint(compileExecutionPlan(request, second))
    );
  });

  it("snapshots and freezes step configuration retained by the plan", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });
    const config = { value: { nested: 3 } };
    const plan = compileExecutionPlan(
      {
        recipe: { schemaVersion: 2, steps: [{ id: "alpha", config }] },
        setup: baseSetup,
      },
      registry
    );

    config.value.nested = 9;
    expect(plan.nodes[0].config).toEqual({ value: { nested: 3 } });
    expect(Object.isFrozen(plan.nodes[0].config)).toBe(true);
    expect(Object.isFrozen((plan.nodes[0].config as { value: object }).value)).toBe(true);
  });

  it("omits disabled steps from the plan", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: (_context, _config) => {},
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [
            {
              id: "alpha",
              enabled: false,
            },
          ],
        },
        setup: baseSetup,
      },
      registry
    );

    expect(plan.nodes).toHaveLength(0);
  });

  it("enforces unique step ids within a recipe", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });

    expect(() =>
      compileExecutionPlan(
        {
          recipe: {
            schemaVersion: 2,
            steps: [{ id: "alpha" }, { id: "alpha" }],
          },
          setup: baseSetup,
        },
        registry
      )
    ).toThrow(ExecutionPlanCompileError);

    try {
      compileExecutionPlan(
        {
          recipe: {
            schemaVersion: 2,
            steps: [{ id: "alpha" }, { id: "alpha" }],
          },
          setup: baseSetup,
        },
        registry
      );
    } catch (err) {
      expect(err).toBeInstanceOf(ExecutionPlanCompileError);
      const errors = (err as ExecutionPlanCompileError).errors;
      expect(errors[0]?.code).toBe("runRequest.invalid");
      expect(errors[0]?.path).toBe("/recipe/steps/1/id");
      expect(errors[0]?.message).toContain('Duplicate step id "alpha"');
    }
  });

  it("enforces recipe identity uniqueness even when one duplicate is disabled", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });

    expect(() =>
      compileExecutionPlan(
        {
          recipe: {
            schemaVersion: 2,
            steps: [{ id: "alpha", enabled: false }, { id: "alpha" }],
          },
          setup: baseSetup,
        },
        registry
      )
    ).toThrow('Duplicate step id "alpha"');
  });

  it("fails fast on unknown step IDs", () => {
    const registry = new StepRegistry();

    expect(() =>
      compileExecutionPlan(
        {
          recipe: {
            schemaVersion: 2,
            steps: [{ id: "missing" }],
          },
          setup: baseSetup,
        },
        registry
      )
    ).toThrow(ExecutionPlanCompileError);

    try {
      compileExecutionPlan(
        {
          recipe: {
            schemaVersion: 2,
            steps: [{ id: "missing" }],
          },
          setup: baseSetup,
        },
        registry
      );
      throw new Error("Expected compile to fail for unknown step");
    } catch (err) {
      expect(err).toBeInstanceOf(ExecutionPlanCompileError);
      const errors = (err as ExecutionPlanCompileError).errors;
      expect(errors[0].code).toBe("step.unknown");
      expect(errors[0].path).toBe("/recipe/steps/0/id");
    }
  });

  it("does not validate per-step config during plan compilation", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object(
        {
          value: Type.Number(),
        },
        { additionalProperties: false }
      ),
      run: () => {},
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [{ id: "alpha", config: { value: "bad", extra: 9 } }],
        },
        setup: baseSetup,
      },
      registry
    );

    expect(plan.nodes[0].config).toEqual({ value: "bad", extra: 9 });
  });

  it("passes config through to step.run without defaulting", () => {
    const registry = new StepRegistry();
    let observedConfig: unknown = null;
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object(
        {
          value: Type.Number({ default: 7 }),
        },
        { additionalProperties: false }
      ),
      run: (_context, config) => {
        observedConfig = config;
      },
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [{ id: "alpha", config: { value: 11 } }],
        },
        setup: baseSetup,
      },
      registry
    );

    const adapter = createMockAdapter({ width: 10, height: 10, rng: () => 0 });
    const context = createMapContext({ setup: plan.setup, adapter });
    const executor = new PipelineExecutor(registry, { log: () => {} });
    executor.executePlan(context, plan);

    expect(observedConfig).toEqual({ value: 11 });
  });

  it("admits exactly one execution attempt per context", async () => {
    let releaseStep: (() => void) | undefined;
    let markStarted: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      markStarted = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      releaseStep = resolve;
    });
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: async () => {
        markStarted?.();
        await blocked;
      },
    });
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] }, setup: baseSetup },
      registry
    );
    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10 }),
    });
    const executor = new PipelineExecutor(registry);

    const firstExecution = executor.executePlanAsync(context, plan);
    await started;
    await expect(executor.executePlanAsync(context, plan)).rejects.toThrow(
      "MapGen context is already executing."
    );
    releaseStep?.();
    await firstExecution;
    expect(() => executor.executePlan(context, plan)).toThrow(
      "MapGen context has already completed an execution."
    );
  });

  it("rejects recursive sync execution and makes the completed context terminal", () => {
    const registry = new StepRegistry();
    let plan: ExecutionPlan;
    let context: ReturnType<typeof createMapContext>;
    let executor: PipelineExecutor;
    let recursiveRefusal = "";
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {
        try {
          executor.executePlan(context, plan);
        } catch (error) {
          recursiveRefusal = error instanceof Error ? error.message : String(error);
        }
      },
    });
    plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] }, setup: baseSetup },
      registry
    );
    context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10 }),
    });
    executor = new PipelineExecutor(registry);

    executor.executePlan(context, plan);
    expect(recursiveRefusal).toBe("MapGen context is already executing.");
    expect(() => executor.executePlan(context, plan)).toThrow(
      "MapGen context has already completed an execution."
    );
  });

  it("makes failed sync and async executions terminal", async () => {
    const registry = new StepRegistry();
    registry.register({
      id: "fail",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: () => {
        throw new Error("expected failure");
      },
    });
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "fail" }] }, setup: baseSetup },
      registry
    );
    const syncContext = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10 }),
    });
    const asyncContext = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10 }),
    });
    const executor = new PipelineExecutor(registry);

    expect(() => executor.executePlan(syncContext, plan)).toThrow("expected failure");
    expect(() => executor.executePlanReport(syncContext, plan)).toThrow(
      "MapGen context has already completed an execution."
    );
    await expect(executor.executePlanAsync(asyncContext, plan)).rejects.toThrow("expected failure");
    await expect(executor.executePlanReportAsync(asyncContext, plan)).rejects.toThrow(
      "MapGen context has already completed an execution."
    );
  });

  it("canonicalizes missing and explicit empty config to one frozen behavior and fingerprint", () => {
    const observedConfigs: Readonly<Record<string, unknown>>[] = [];
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: (_context, config) => {
        observedConfigs.push(config as Readonly<Record<string, unknown>>);
      },
    });

    const missingConfigPlan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] }, setup: baseSetup },
      registry
    );
    const explicitEmptyPlan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [{ id: "alpha", config: {} }] }, setup: baseSetup },
      registry
    );

    expect(missingConfigPlan.nodes[0].config).toBe(explicitEmptyPlan.nodes[0].config);
    expect(missingConfigPlan.nodes[0].config).toEqual({});
    expect(Object.isFrozen(missingConfigPlan.nodes[0].config)).toBe(true);
    expect(computePlanFingerprint(missingConfigPlan)).toBe(
      computePlanFingerprint(explicitEmptyPlan)
    );

    const executor = new PipelineExecutor(registry, { log: () => {} });
    executor.executePlan(
      createMapContext({
        setup: missingConfigPlan.setup,
        adapter: createMockAdapter({ width: 10, height: 10 }),
      }),
      missingConfigPlan
    );
    executor.executePlan(
      createMapContext({
        setup: explicitEmptyPlan.setup,
        adapter: createMockAdapter({ width: 10, height: 10 }),
      }),
      explicitEmptyPlan
    );
    expect(observedConfigs).toHaveLength(2);
    expect(observedConfigs[0]).toBe(observedConfigs[1]);
  });

  it("does not invoke step normalize during plan compilation", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object(
        {
          value: Type.Number(),
        },
        {
          additionalProperties: false,
        }
      ),
      normalize: () => {
        throw new Error("normalize should not be called");
      },
      run: () => {},
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [{ id: "alpha", config: { value: 12 } }],
        },
        setup: baseSetup,
      },
      registry
    );

    expect(plan.nodes[0].config).toEqual({ value: 12 });
  });

  it("refuses a context that does not retain the plan's exact setup", async () => {
    const registry = new StepRegistry();
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [] }, setup: baseSetup },
      registry
    );
    const adapter = createMockAdapter({ width: 10, height: 10, rng: () => 0 });
    const mismatchedContext = createMapContext({ setup: admitMapSetup({ ...baseSetup }), adapter });
    const executor = new PipelineExecutor(registry, { log: () => {} });
    const message =
      "Pipeline context setup must be the exact admitted setup retained by the execution plan.";

    expect(() => executor.executePlan(mismatchedContext, plan)).toThrow(message);
    expect(() => executor.executePlanReport(mismatchedContext, plan)).toThrow(message);
    await expect(executor.executePlanAsync(mismatchedContext, plan)).rejects.toThrow(message);
    await expect(executor.executePlanReportAsync(mismatchedContext, plan)).rejects.toThrow(message);
  });

  it("rejects forged contexts before emitting any run evidence", async () => {
    const registry = new StepRegistry();
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [] }, setup: baseSetup },
      registry
    );
    const events: TraceEvent[] = [];
    const trace = {
      config: {},
      sink: { emit: (event: TraceEvent) => events.push(event) },
    };
    const forgedContext = { setup: plan.setup } as ReturnType<typeof createMapContext>;
    const executor = new PipelineExecutor(registry, { log: () => {} });
    const message = "MapGen execution requires a context returned by createMapContext.";

    expect(() => executor.executePlan(forgedContext, plan, { trace })).toThrow(message);
    expect(() => executor.executePlanReport(forgedContext, plan, { trace })).toThrow(message);
    await expect(executor.executePlanAsync(forgedContext, plan, { trace })).rejects.toThrow(
      message
    );
    await expect(executor.executePlanReportAsync(forgedContext, plan, { trace })).rejects.toThrow(
      message
    );
    expect(events).toEqual([]);
  });

  it("rejects a structurally forged plan before reading its nodes", () => {
    const registry = new StepRegistry();
    const setup = admitMapSetup(baseSetup);
    const context = createMapContext({
      setup,
      adapter: createMockAdapter({ width: 10, height: 10 }),
    });
    let nodesRead = false;
    const forgedShape = {
      recipeSchemaVersion: 2,
      setup,
      get nodes(): readonly never[] {
        nodesRead = true;
        throw new Error("forged nodes were read");
      },
    };
    // @ts-expect-error ExecutionPlan is intentionally opaque to structural construction.
    const compileTimeForgery: ExecutionPlan = forgedShape;
    const forgedPlan = compileTimeForgery as ExecutionPlan;

    expect(() => new PipelineExecutor(registry).executePlan(context, forgedPlan)).toThrow(
      "authentic execution plan"
    );
    expect(() => computePlanFingerprint(forgedPlan)).toThrow("authentic execution plan");
    expect(nodesRead).toBe(false);
  });

  it("rejects plans compiled against a different registry", async () => {
    const compilingRegistry = new StepRegistry();
    const executingRegistry = new StepRegistry();
    const plan = compileExecutionPlan(
      { recipe: { schemaVersion: 2, steps: [] }, setup: baseSetup },
      compilingRegistry
    );
    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 10, height: 10 }),
    });
    const executor = new PipelineExecutor(executingRegistry);
    const message = "Execution plan was compiled against a different step registry.";

    expect(() => executor.executePlan(context, plan)).toThrow(message);
    expect(() => executor.executePlanReport(context, plan)).toThrow(message);
    await expect(executor.executePlanAsync(context, plan)).rejects.toThrow(message);
    await expect(executor.executePlanReportAsync(context, plan)).rejects.toThrow(message);
  });
});
