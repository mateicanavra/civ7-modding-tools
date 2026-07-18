import { createTraceSession } from "@swooper/mapgen-core";
import type {
  VizGridLayerEmissionV1,
  VizGridLayerEntryV1,
  VizInlineRef,
  VizLayerEmissionV1,
  VizPathRef,
} from "@swooper/mapgen-viz";
import { describe, expect, it } from "vitest";
import type {
  BrowserRunEvent,
  BrowserVizLayerUpsertEvent,
} from "../../src/browser-runner/protocol";
import { createWorkerTraceSink } from "../../src/browser-runner/worker-trace-sink";
import { createWorkerVizDumper } from "../../src/browser-runner/worker-viz-dumper";

function assertBrowserRejectsPathRef(pathBackedReplayLayer: VizGridLayerEntryV1<VizPathRef>): void {
  // @ts-expect-error Browser live events categorically reject path-backed replay evidence.
  const invalidLiveBrowserLayer: BrowserVizLayerUpsertEvent["layer"] = pathBackedReplayLayer;
  void invalidLiveBrowserLayer;
}
void assertBrowserRejectsPathRef;

function captureVerboseStepEvent(
  run: (trace: ReturnType<ReturnType<typeof createTraceSession>["createStepScope"]>) => void
) {
  let data: unknown;
  const session = createTraceSession({
    runId: "worker-viz-test",
    planFingerprint: "worker-viz-plan",
    config: { enabled: true, steps: { "test.step": "verbose" } },
    sink: {
      emit: (event) => {
        if (event.kind === "step.event") data = event.data;
      },
    },
  });
  run(session.createStepScope({ stepId: "test.step", phase: "test" }));
  if (!data || typeof data !== "object" || !("layer" in data)) {
    throw new Error("Worker viz adapter did not emit a layer event.");
  }
  return (data as { layer: VizLayerEmissionV1<VizInlineRef> }).layer;
}

describe("createWorkerVizDumper", () => {
  it("copies the exact typed-array subview before the emitted buffer is transferred", () => {
    const source = new Uint8Array([90, 4, 7, 91]);
    const values = new Uint8Array(source.buffer, 1, 2);
    const layer = captureVerboseStepEvent((trace) => {
      createWorkerVizDumper().dumpGrid(trace, {
        dataTypeKey: "test.subview",
        spaceId: "tile.hexOddQ",
        dims: { width: 2, height: 1 },
        format: "u8",
        values,
      });
    });

    expect(layer.kind).toBe("grid");
    if (layer.kind !== "grid" || layer.field.data.kind !== "inline") {
      throw new Error("Expected an inline grid emission.");
    }
    const emitted = layer.field.data.buffer;
    expect(emitted).not.toBe(source.buffer);
    expect(emitted.byteLength).toBe(2);
    expect(Array.from(new Uint8Array(emitted))).toEqual([4, 7]);

    structuredClone(emitted, { transfer: [emitted] });
    expect(emitted.byteLength).toBe(0);
    expect(Array.from(source)).toEqual([90, 4, 7, 91]);
  });

  it("contains invalid optional evidence and continues with the next valid layer", () => {
    const emitted: unknown[] = [];
    const session = createTraceSession({
      runId: "worker-viz-refusal",
      planFingerprint: "worker-viz-plan",
      config: { enabled: true, steps: { "test.step": "verbose" } },
      sink: {
        emit: (event) => {
          if (event.kind === "step.event") emitted.push(event.data);
        },
      },
    });
    const trace = session.createStepScope({ stepId: "test.step", phase: "test" });
    const dumper = createWorkerVizDumper();

    dumper.dumpGrid(trace, {
      dataTypeKey: "test.invalid-format-view",
      spaceId: "tile.hexOddQ",
      dims: { width: 1, height: 1 },
      format: "u8",
      values: new Int8Array([1]),
    });
    dumper.dumpGrid(trace, {
      dataTypeKey: "test.valid-after-refusal",
      spaceId: "tile.hexOddQ",
      dims: { width: 1, height: 1 },
      format: "u8",
      values: new Uint8Array([1]),
    });

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({
      type: "viz.layer.emit.v1",
      layer: { dataTypeKey: "test.valid-after-refusal" },
    });
  });

  it("admits only branded inline evidence into the browser event lane", () => {
    const posted: BrowserRunEvent[] = [];
    const sink = createWorkerTraceSink({
      runToken: "run-token",
      generation: 1,
      post: (event) => posted.push(event),
    });
    const pathLayer: VizGridLayerEmissionV1<VizPathRef> = {
      kind: "grid",
      layerKey: "path-layer",
      dataTypeKey: "test.path",
      stepId: "test.step",
      spaceId: "tile.hexOddQ",
      bounds: [0, 0, 1, 1],
      dims: { width: 1, height: 1 },
      field: { format: "u8", data: { kind: "path", path: "data/path.bin" } },
    };
    const base = {
      tsMs: 0,
      runId: "run",
      planFingerprint: "plan",
      kind: "step.event" as const,
      stepId: "test.step",
    };

    sink.emit({ ...base, data: { type: "viz.layer.emit.v1", layer: pathLayer } });
    sink.emit({ ...base, data: { type: "viz.layer.emit.v1", layer: {} } });
    expect(posted).toEqual([]);
  });
});
