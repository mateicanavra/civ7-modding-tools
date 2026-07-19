import type { TraceScope } from "@mapgen/trace/index.js";

declare const trace: TraceScope;

trace.event({ nested: [1, true, null, "four", { finite: 5 }] });
trace.event(() => ({ kind: "lazy", rows: ["a", "b"] }));

// @ts-expect-error Undefined object values are omitted by JSON rather than serialized.
trace.event({ missing: undefined });
// @ts-expect-error BigInt is not JSON-compatible.
trace.event({ bigint: 1n });
// @ts-expect-error Functions are not JSON-compatible.
trace.event({ callback: () => undefined });
// @ts-expect-error Typed arrays are binary values, not JSON arrays.
trace.event({ bytes: new Uint8Array([1, 2]) });
