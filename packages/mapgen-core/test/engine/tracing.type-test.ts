import type { StepTrace, TraceEvent, TraceSink } from "@mapgen/trace/index.js";

declare const trace: StepTrace;

trace.event({ nested: [1, true, null, "four", { finite: 5 }] });
trace.event(() => ({ kind: "lazy", rows: ["a", "b"] }));

const synchronousSink: TraceSink = {
  emit: (_event: TraceEvent) => undefined,
};
void synchronousSink;

const asynchronousSink: TraceSink = {
  // @ts-expect-error Trace sinks are synchronous observers, not asynchronous work queues.
  emit: async (_event: TraceEvent) => undefined,
};
void asynchronousSink;

const asynchronousTrace: StepTrace = {
  // @ts-expect-error Authored trace ports complete synchronously.
  event: async () => undefined,
};
void asynchronousTrace;

// @ts-expect-error Lazy trace payloads must be produced synchronously.
trace.event(async () => ({ kind: "async-payload" }));

// @ts-expect-error Step identity is executor-owned.
trace.stepId;
// @ts-expect-error Trace selection is executor-owned.
trace.isVerbose;

// @ts-expect-error Undefined object values are omitted by JSON rather than serialized.
trace.event({ missing: undefined });
// @ts-expect-error BigInt is not JSON-compatible.
trace.event({ bigint: 1n });
// @ts-expect-error Functions are not JSON-compatible.
trace.event({ callback: () => undefined });
// @ts-expect-error Typed arrays are binary values, not JSON arrays.
trace.event({ bytes: new Uint8Array([1, 2]) });
