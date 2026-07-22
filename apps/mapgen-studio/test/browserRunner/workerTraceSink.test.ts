import type { TraceEvent } from "@swooper/mapgen-core";
import { describe, expect, it } from "vitest";
import type { BrowserRunEvent } from "../../src/browser-runner/protocol";
import { createWorkerTraceSink } from "../../src/browser-runner/worker-trace-sink";

const identity = {
  tsMs: 1,
  runId: "worker-trace-run",
  planFingerprint: "worker-trace-plan",
} as const;

describe("createWorkerTraceSink", () => {
  it("forwards executor-owned step indexes without reconstructing lifecycle order", () => {
    const events: BrowserRunEvent[] = [];
    const sink = createWorkerTraceSink({
      runToken: "run-token",
      generation: 3,
      post: (event) => events.push(event),
    });
    const traceEvents: TraceEvent[] = [
      {
        ...identity,
        kind: "step.finish",
        stepId: "test.late-finish",
        stageId: "foundation",
        stepIndex: 7,
        durationMs: 12,
      },
      {
        ...identity,
        kind: "step.start",
        stepId: "test.earlier-start",
        stageId: "morphology",
        stepIndex: 2,
      },
      {
        ...identity,
        kind: "step.event",
        stepId: "test.earlier-start",
        stageId: "morphology",
        stepIndex: 2,
        data: { observed: true },
      },
    ];

    for (const event of traceEvents) sink.emit(event);

    expect(events).toEqual([
      {
        type: "run.progress",
        runToken: "run-token",
        generation: 3,
        kind: "step.finish",
        stepId: "test.late-finish",
        stageId: "foundation",
        stepIndex: 7,
        durationMs: 12,
      },
      {
        type: "run.progress",
        runToken: "run-token",
        generation: 3,
        kind: "step.start",
        stepId: "test.earlier-start",
        stageId: "morphology",
        stepIndex: 2,
      },
    ]);
  });

  it("does not translate executor completion evidence into product terminal state", () => {
    const events: BrowserRunEvent[] = [];
    const sink = createWorkerTraceSink({
      runToken: "run-token",
      generation: 4,
      post: (event) => events.push(event),
    });

    sink.emit({ ...identity, kind: "run.finish", success: false });
    sink.emit({ ...identity, kind: "run.finish", success: true });

    expect(events).toEqual([]);
  });

  it("suppresses all trace events after cancellation", () => {
    const events: BrowserRunEvent[] = [];
    const abortSignal = { aborted: true };
    const sink = createWorkerTraceSink({
      runToken: "canceled-token",
      generation: 5,
      abortSignal,
      post: (event) => events.push(event),
    });

    sink.emit({ ...identity, kind: "run.finish", success: false });

    expect(events).toEqual([]);
  });
});
