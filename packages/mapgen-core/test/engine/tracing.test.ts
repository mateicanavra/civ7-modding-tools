import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createRecipe, createStage, createStep, defineStep } from "@mapgen/authoring/index.js";
import { createMapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import {
  compileExecutionPlan,
  computePlanFingerprint,
  PipelineExecutor,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { createNoopTraceSession, sha256Hex, type TraceEvent } from "@mapgen/trace/index.js";
import { Type } from "typebox";

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("pipeline tracing", () => {
  it("hashes astral and malformed Unicode deterministically", () => {
    expect(sha256Hex("map 🗺")).toBe(
      "a3399eedfbf0fcd3256726d919a5d40808b8a3fa6b4afeb01323e776720ad2bf"
    );
    expect(sha256Hex("\ud800")).toBe(
      "83d544ccc223c057d2bf80d3f2a32982c32c3c0db8e2674820da5064783fb097"
    );
  });

  it("emits run/step timing events with runId and plan fingerprint", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      phase: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object({}),
      run: () => {},
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [{ id: "alpha", config: {} }],
        },
        setup: {
          mapSeed: 123,
          dimensions: { width: 4, height: 3 },
          latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        },
      },
      registry
    );

    const events: TraceEvent[] = [];
    const trace = {
      config: {},
      sink: { emit: (event: TraceEvent) => events.push(event) },
    };

    const adapter = createMockAdapter({ width: 4, height: 3, rng: () => 0 });
    const ctx = createMapContext({ setup: plan.setup, adapter });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    executor.executePlan(ctx, plan, { trace });

    const runStart = events.find((event) => event.kind === "run.start");
    const runFinish = events.find((event) => event.kind === "run.finish");
    const stepStart = events.find((event) => event.kind === "step.start");
    const stepFinish = events.find((event) => event.kind === "step.finish");

    expect(runStart).toBeTruthy();
    expect(runFinish).toBeTruthy();
    expect(stepStart).toBeTruthy();
    expect(stepFinish).toBeTruthy();
    expect(runStart?.runId).toBe(runFinish?.runId);
    expect(runStart?.planFingerprint).toBe(runFinish?.planFingerprint);
    expect(stepStart?.runId).toBe(runStart?.runId);
    expect(stepFinish?.planFingerprint).toBe(runStart?.planFingerprint);
    expect((stepStart as Record<string, unknown> | undefined)?.nodeId).toBeUndefined();
    expect((stepFinish as Record<string, unknown> | undefined)?.nodeId).toBeUndefined();
  });

  it("keeps repeated executions distinct while retaining one stable plan fingerprint", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      phase: "foundation",
      requires: [],
      provides: [],
      run: () => {},
    });
    const plan = compileExecutionPlan(
      {
        recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] },
        setup: {
          mapSeed: 123,
          dimensions: { width: 4, height: 3 },
          latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        },
      },
      registry
    );
    const executor = new PipelineExecutor(registry, { log: () => {} });
    const execute = (): TraceEvent[] => {
      const events: TraceEvent[] = [];
      const trace = {
        config: {},
        sink: { emit: (event: TraceEvent) => events.push(event) },
      };
      executor.executePlan(
        createMapContext({
          setup: plan.setup,
          adapter: createMockAdapter({ width: 4, height: 3 }),
        }),
        plan,
        { trace }
      );
      return events;
    };

    const first = execute();
    const second = execute();
    const firstRunId = first[0]?.runId;
    const secondRunId = second[0]?.runId;
    const planFingerprint = computePlanFingerprint(plan);

    expect(firstRunId).toBeTruthy();
    expect(secondRunId).toBeTruthy();
    expect(firstRunId).not.toBe(secondRunId);
    expect(first.every((event) => event.runId === firstRunId)).toBe(true);
    expect(second.every((event) => event.runId === secondRunId)).toBe(true);
    expect([...first, ...second].every((event) => event.planFingerprint === planFingerprint)).toBe(
      true
    );
  });

  it("emits step.event only for verbose steps", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      phase: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object({}),
      run: (context) => {
        context.trace.event({ step: "alpha" });
      },
    });
    registry.register({
      id: "beta",
      phase: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object({}),
      run: (context) => {
        context.trace.event({ step: "beta" });
      },
    });

    const plan = compileExecutionPlan(
      {
        recipe: {
          schemaVersion: 2,
          steps: [
            { id: "alpha", config: {} },
            { id: "beta", config: {} },
          ],
        },
        setup: {
          mapSeed: 123,
          dimensions: { width: 4, height: 3 },
          latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        },
      },
      registry
    );

    const events: TraceEvent[] = [];
    const trace = {
      config: { steps: { alpha: "verbose", beta: "off" } },
      sink: { emit: (event: TraceEvent) => events.push(event) },
    } as const;

    const adapter = createMockAdapter({ width: 4, height: 3, rng: () => 0 });
    const ctx = createMapContext({ setup: plan.setup, adapter });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    executor.executePlan(ctx, plan, { trace });

    const stepEvents = events.filter((event) => event.kind === "step.event");
    expect(stepEvents.length).toBeGreaterThan(0);
    expect(stepEvents.every((event) => event.stepId === "alpha")).toBe(true);
  });

  it("snapshots trace selection and prevents steps from mutating trace identity or capability", () => {
    const registry = new StepRegistry();
    const mutationResults: boolean[] = [];
    let scopeFrozen = false;
    let observedRunId = "";
    let observedPlanFingerprint = "";
    const config: { steps: Record<string, "off" | "basic" | "verbose"> } = {
      steps: { alpha: "verbose" },
    };
    registry.register({
      id: "alpha",
      phase: "foundation",
      requires: [],
      provides: [],
      run: (context) => {
        config.steps.alpha = "off";
        scopeFrozen = Object.isFrozen(context.trace);
        observedRunId = context.trace.runId;
        observedPlanFingerprint = context.trace.planFingerprint;
        const scope = context.trace as unknown as Record<string, unknown>;
        mutationResults.push(Reflect.set(scope, "runId", "forged-run"));
        mutationResults.push(Reflect.set(scope, "planFingerprint", "forged-plan"));
        mutationResults.push(Reflect.set(scope, "stepId", "forged-step"));
        mutationResults.push(Reflect.set(scope, "level", "off"));
        mutationResults.push(Reflect.set(scope, "isVerbose", false));
        mutationResults.push(Reflect.set(scope, "event", () => undefined));
        context.trace.event({ preserved: true });
      },
    });
    const plan = compileExecutionPlan(
      {
        recipe: { schemaVersion: 2, steps: [{ id: "alpha" }] },
        setup: {
          mapSeed: 123,
          dimensions: { width: 4, height: 3 },
          latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
        },
      },
      registry
    );
    const events: TraceEvent[] = [];
    const trace = {
      config,
      sink: { emit: (event: TraceEvent) => events.push(event) },
    };

    expect(Object.isFrozen(createNoopTraceSession())).toBe(true);

    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });
    new PipelineExecutor(registry).executePlan(context, plan, { trace });

    expect(scopeFrozen).toBe(true);
    expect(mutationResults).toEqual([false, false, false, false, false, false]);
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "step.event",
        runId: observedRunId,
        planFingerprint: observedPlanFingerprint,
        stepId: "alpha",
        data: { preserved: true },
      })
    );
  });

  it("restores the managed context trace after a step fails", () => {
    const registry = new StepRegistry();
    let activeTrace: ReturnType<typeof createMapContext>["trace"] | undefined;
    registry.register({
      id: "fail",
      phase: "foundation",
      requires: [],
      provides: [],
      run: (context) => {
        activeTrace = context.trace;
        throw new Error("expected failure");
      },
    });
    const plan = compileExecutionPlan(
      {
        recipe: { schemaVersion: 2, steps: [{ id: "fail" }] },
        setup: {
          mapSeed: 4,
          dimensions: { width: 2, height: 2 },
          latitudeBounds: { topLatitude: 45, bottomLatitude: -45 },
        },
      },
      registry
    );
    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 2, height: 2 }),
    });
    const initialTrace = context.trace;
    const trace = { config: {}, sink: { emit: () => {} } };

    expect(() => new PipelineExecutor(registry).executePlan(context, plan, { trace })).toThrow(
      "expected failure"
    );
    expect(activeTrace).not.toBe(initialTrace);
    expect(context.trace).toBe(initialTrace);
  });

  it("keeps trace configuration outside setup and requires an explicit sink", () => {
    const adapter = createMockAdapter({ width: 4, height: 3, rng: () => 0 });
    const setup = admitMapSetup({
      mapSeed: 5,
      dimensions: { width: 4, height: 3 },
      latitudeBounds: { topLatitude: 45, bottomLatitude: -45 },
    });
    const untracedContext = createMapContext({ setup, adapter });
    const tracedContext = createMapContext({ setup, adapter });

    const contract = defineStep({
      id: "alpha",
      phase: "foundation",
      requires: [],
      provides: [],
      schema: Type.Object({}, { additionalProperties: false }),
    });
    const step = createStep(contract, { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "trace",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    const config = { foundation: { knobs: {}, alpha: {} } };
    const plan = recipe.compile(setup, config);
    const events: TraceEvent[] = [];

    recipe.run(untracedContext, config);
    expect(events).toEqual([]);

    recipe.run(tracedContext, config, {
      trace: {
        config: {},
        sink: { emit: (event: TraceEvent) => events.push(event) },
      },
    });

    expect(events.some((event) => event.kind === "run.start")).toBe(true);
    expect(events.every((event) => event.planFingerprint === computePlanFingerprint(plan))).toBe(
      true
    );
  });
});
