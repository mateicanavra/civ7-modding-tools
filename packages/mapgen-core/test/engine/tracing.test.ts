import { describe, expect, it } from "bun:test";
import { createMockAdapter } from "@civ7/adapter";
import { createRecipe, createStage, createStep, defineStep } from "@mapgen/authoring/index.js";
import { createMapContext, type MapContext } from "@mapgen/core/map-context.js";
import { admitMapSetup } from "@mapgen/core/map-setup.js";
import {
  compileExecutionPlan,
  computePlanFingerprint,
  PipelineExecutor,
  StepRegistry,
} from "@mapgen/engine/index.js";
import { createTraceSessionForTest } from "@mapgen/testing/index.js";
import {
  sha256Hex,
  stableStringify,
  type TraceEvent,
  TraceEventSchema,
} from "@mapgen/trace/index.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

const EmptyKnobsSchema = Type.Object({}, { additionalProperties: false });

describe("pipeline tracing", () => {
  it("emits only schema-valid JSON-serializable events", () => {
    const events: TraceEvent[] = [];
    let timestamp = 0;
    const session = createTraceSessionForTest({
      runId: "trace-json",
      planFingerprint: "trace-plan",
      config: { steps: { "recipe.foundation.alpha": "verbose" } },
      sink: {
        emit: (event) => {
          events.push(event);
          return undefined;
        },
      },
      nowMs: () => ++timestamp,
    });
    const meta = { stepId: "recipe.foundation.alpha", stageId: "foundation", stepIndex: 0 };

    session.emitRunStart();
    session.emitStepStart(meta);
    const lease = session.openStepTrace(meta);
    lease.trace.event(() => ({
      kind: "test.nested",
      values: [1, true, null, "four", { finite: 5 }],
    }));
    const emittedCount = events.length;
    lease.trace.event(() => {
      throw new Error("diagnostic payload failure");
    });
    (lease.trace.event as (value: unknown) => void)({ invalid: 1n });
    expect(events).toHaveLength(emittedCount);
    lease.close();
    lease.trace.event({ ignoredAfterClose: true });
    session.emitStepFinish({ ...meta, durationMs: 2, success: true });
    session.emitRunFinish({ success: true });

    expect(events).toHaveLength(5);
    for (const event of events) {
      expect(Value.Check(TraceEventSchema, event)).toBe(true);
      const serialized = JSON.stringify(event);
      expect(Value.Check(TraceEventSchema, JSON.parse(serialized) as unknown)).toBe(true);
    }
  });

  it("emits detached immutable step evidence and refuses unsafe payloads", async () => {
    const events: TraceEvent[] = [];
    const source = {
      nested: { count: 1 },
      values: [2, 3],
    };
    let accessorReads = 0;
    const accessorPayload = {};
    Object.defineProperty(accessorPayload, "value", {
      enumerable: true,
      get: () => {
        accessorReads += 1;
        return 1;
      },
    });
    const cyclicPayload: { self?: unknown } = {};
    cyclicPayload.self = cyclicPayload;
    const unhandledRejections: unknown[] = [];
    const onUnhandledRejection = (reason: unknown) => unhandledRejections.push(reason);
    const session = createTraceSessionForTest({
      runId: "trace-snapshot",
      planFingerprint: "trace-plan",
      config: { steps: { "recipe.foundation.alpha": "verbose" } },
      sink: {
        emit: (event) => {
          events.push(event);
          if (event.kind === "step.event" && event.data && typeof event.data === "object") {
            expect(Object.isFrozen(event)).toBe(true);
            expect(Object.isFrozen(event.data)).toBe(true);
            const data = event.data as Readonly<{
              nested: Readonly<{ count: number }>;
              values: readonly number[];
            }>;
            expect(Object.isFrozen(data.nested)).toBe(true);
            expect(Object.isFrozen(data.values)).toBe(true);
            expect(Reflect.set(data.nested, "count", 99)).toBe(false);
          }
          return undefined;
        },
      },
    });
    const lease = session.openStepTrace({
      stepId: "recipe.foundation.alpha",
      stageId: "foundation",
      stepIndex: 0,
    });

    process.on("unhandledRejection", onUnhandledRejection);
    try {
      lease.trace.event(source);
      source.nested.count = 7;
      source.values[0] = 11;
      const emittedCount = events.length;
      (lease.trace.event as (value: unknown) => undefined)(accessorPayload);
      (lease.trace.event as (value: unknown) => undefined)(cyclicPayload);
      (lease.trace.event as (value: unknown) => undefined)({
        nested: Promise.reject(new Error("nested trace rejection")),
      });
      await Bun.sleep(0);

      expect(events).toHaveLength(emittedCount);
      expect(accessorReads).toBe(0);
      expect(unhandledRejections).toEqual([]);
      expect(events[0]).toEqual(
        expect.objectContaining({
          kind: "step.event",
          data: { nested: { count: 1 }, values: [2, 3] },
        })
      );
    } finally {
      process.off("unhandledRejection", onUnhandledRejection);
      lease.close();
    }
  });

  it("contains rejecting async trace observers without awaiting or retrying", async () => {
    let sinkCalls = 0;
    const rejection = new Error("async sink failure");
    const session = createTraceSessionForTest({
      runId: "trace-async-sink",
      planFingerprint: "trace-plan",
      config: {},
      sink: {
        emit: (() => {
          sinkCalls += 1;
          return Promise.reject(rejection);
        }) as unknown as (event: TraceEvent) => undefined,
      },
    });

    expect(() => session.emitRunStart()).not.toThrow();
    expect(sinkCalls).toBe(1);
    await Promise.resolve();
  });

  it("contains async lazy payloads and emits no step event", async () => {
    const events: TraceEvent[] = [];
    const session = createTraceSessionForTest({
      runId: "trace-async-payload",
      planFingerprint: "trace-plan",
      config: { steps: { "recipe.foundation.alpha": "verbose" } },
      sink: {
        emit: (event) => {
          events.push(event);
          return undefined;
        },
      },
    });
    const lease = session.openStepTrace({
      stepId: "recipe.foundation.alpha",
      stageId: "foundation",
      stepIndex: 0,
    });

    lease.trace.event((() => Promise.resolve({ ignored: true })) as unknown as () => Readonly<{
      ignored: true;
    }>);
    lease.trace.event((() =>
      Promise.reject(new Error("async payload failure"))) as unknown as () => Readonly<{
      ignored: true;
    }>);
    await Promise.resolve();

    expect(events).toEqual([]);
  });

  it("rejects dotted stage identities at the execution registry ingress", () => {
    const registry = new StepRegistry();
    expect(() =>
      registry.register({
        id: "recipe.bad-stage.alpha",
        stageId: "bad.stage",
        requires: [],
        provides: [],
        run: () => {},
      })
    ).toThrow("must be kebab-case");
  });

  it("hashes astral and malformed Unicode deterministically", () => {
    expect(sha256Hex("map 🗺")).toBe(
      "a3399eedfbf0fcd3256726d919a5d40808b8a3fa6b4afeb01323e776720ad2bf"
    );
    expect(sha256Hex("\ud800")).toBe(
      "83d544ccc223c057d2bf80d3f2a32982c32c3c0db8e2674820da5064783fb097"
    );
  });

  it("sorts canonical object keys by code unit rather than host locale", () => {
    expect(
      stableStringify({
        camelCase: 1,
        "kebab-case": 2,
        Alpha: 3,
      })
    ).toBe('{"Alpha":3,"camelCase":1,"kebab-case":2}');
  });

  it("emits run/step timing events with runId and plan fingerprint", () => {
    const registry = new StepRegistry();
    registry.register({
      id: "alpha",
      stageId: "foundation",
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
      sink: {
        emit: (event: TraceEvent) => {
          events.push(event);
          return undefined;
        },
      },
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
    expect(stepStart?.kind === "step.start" && stepStart.stepIndex).toBe(0);
    expect(stepFinish?.kind === "step.finish" && stepFinish.stepIndex).toBe(0);
    expect((stepStart as Record<string, unknown> | undefined)?.nodeId).toBeUndefined();
    expect((stepFinish as Record<string, unknown> | undefined)?.nodeId).toBeUndefined();
  });

  it("keeps repeated executions distinct while retaining one stable plan fingerprint", () => {
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
        sink: {
          emit: (event: TraceEvent) => {
            events.push(event);
            return undefined;
          },
        },
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
    let retainedAlphaContext: MapContext | undefined;
    let betaContext: MapContext | undefined;
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object({}),
      run: (context) => {
        retainedAlphaContext = context;
        context.trace.event({ step: "alpha" });
      },
    });
    registry.register({
      id: "beta",
      stageId: "foundation",
      requires: [],
      provides: [],
      configSchema: Type.Object({}),
      run: (context) => {
        betaContext = context;
        retainedAlphaContext?.trace.event({ step: "borrowed-alpha-context" });
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
      config: { steps: { alpha: "verbose", beta: "verbose" } },
      sink: {
        emit: (event: TraceEvent) => {
          events.push(event);
          return undefined;
        },
      },
    } as const;

    const adapter = createMockAdapter({ width: 4, height: 3, rng: () => 0 });
    const ctx = createMapContext({ setup: plan.setup, adapter });

    const executor = new PipelineExecutor(registry, { log: () => {} });
    executor.executePlan(ctx, plan, { trace });

    const stepEvents = events.filter((event) => event.kind === "step.event");
    expect(stepEvents.length).toBeGreaterThan(0);
    expect(stepEvents.every((event) => event.stepId === "alpha")).toBe(true);
    expect(retainedAlphaContext).not.toBe(betaContext);
    expect(retainedAlphaContext).not.toBe(ctx);
    expect(betaContext).not.toBe(ctx);
    expect(events).toContainEqual(
      expect.objectContaining({ kind: "step.start", stepId: "beta", stepIndex: 1 })
    );
    expect(events).toContainEqual(
      expect.objectContaining({ kind: "step.finish", stepId: "beta", stepIndex: 1 })
    );
  });

  it("snapshots trace selection and exposes no mutable identity or lifecycle authority", () => {
    const registry = new StepRegistry();
    const mutationResults: boolean[] = [];
    let traceFrozen = false;
    const config: { steps: Record<string, "off" | "basic" | "verbose"> } = {
      steps: { alpha: "verbose" },
    };
    registry.register({
      id: "alpha",
      stageId: "foundation",
      requires: [],
      provides: [],
      run: (context) => {
        config.steps.alpha = "off";
        traceFrozen = Object.isFrozen(context.trace);
        const authorTrace = context.trace as unknown as Record<string, unknown>;
        mutationResults.push(Reflect.set(authorTrace, "runId", "forged-run"));
        mutationResults.push(Reflect.set(authorTrace, "planFingerprint", "forged-plan"));
        mutationResults.push(Reflect.set(authorTrace, "stepId", "forged-step"));
        mutationResults.push(Reflect.set(authorTrace, "level", "off"));
        mutationResults.push(Reflect.set(authorTrace, "isVerbose", false));
        mutationResults.push(Reflect.set(authorTrace, "event", () => undefined));
        expect(Object.keys(context.trace)).toEqual(["event"]);
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
      sink: {
        emit: (event: TraceEvent) => {
          events.push(event);
          return undefined;
        },
      },
    };

    const context = createMapContext({
      setup: plan.setup,
      adapter: createMockAdapter({ width: 4, height: 3 }),
    });
    new PipelineExecutor(registry).executePlan(context, plan, { trace });

    expect(traceFrozen).toBe(true);
    expect(mutationResults).toEqual([false, false, false, false, false, false]);
    expect(events).toContainEqual(
      expect.objectContaining({
        kind: "step.event",
        stepId: "alpha",
        stepIndex: 0,
        data: { preserved: true },
      })
    );
  });

  it("restores the managed context trace after a step fails", () => {
    const registry = new StepRegistry();
    let activeTrace: ReturnType<typeof createMapContext>["trace"] | undefined;
    registry.register({
      id: "fail",
      stageId: "foundation",
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
    const events: TraceEvent[] = [];
    const trace = {
      config: { steps: { fail: "verbose" as const } },
      sink: {
        emit: (event: TraceEvent) => {
          events.push(event);
          return undefined;
        },
      },
    };

    expect(() => new PipelineExecutor(registry).executePlan(context, plan, { trace })).toThrow(
      "expected failure"
    );
    expect(activeTrace).not.toBe(initialTrace);
    expect(context.trace).toBe(initialTrace);
    const eventCount = events.length;
    activeTrace?.event({ ignoredAfterFailure: true });
    expect(events).toHaveLength(eventCount);
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
      requires: [],
      provides: [],
    });
    const step = createStep(contract, { run: () => {} });
    const stage = createStage({ id: "foundation", knobsSchema: EmptyKnobsSchema, steps: [step] });
    const recipe = createRecipe({
      id: "trace",
      tagDefinitions: [],
      stages: [stage],
      compileOpsById: {},
    });

    const config = { foundation: { knobs: {} } };
    const plan = recipe.compile(setup, config);
    const events: TraceEvent[] = [];

    recipe.run(untracedContext, config);
    expect(events).toEqual([]);

    recipe.run(tracedContext, config, {
      trace: {
        config: {},
        sink: {
          emit: (event: TraceEvent) => {
            events.push(event);
            return undefined;
          },
        },
      },
    });

    expect(events.some((event) => event.kind === "run.start")).toBe(true);
    expect(events.every((event) => event.planFingerprint === computePlanFingerprint(plan))).toBe(
      true
    );
  });
});
