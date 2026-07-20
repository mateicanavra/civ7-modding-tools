import type { VizGridLayerEntryV2, VizPathRef } from "@swooper/mapgen-viz";
import { describe, expect, it } from "vitest";
import type {
  BrowserRunEvent,
  BrowserVizLayerUpsertEvent,
} from "../../src/browser-runner/protocol";
import { createWorkerVizFacetSink } from "../../src/browser-runner/worker-viz-facet-sink";

function assertBrowserRejectsPathRef(pathBackedReplayLayer: VizGridLayerEntryV2<VizPathRef>): void {
  // @ts-expect-error Browser live events categorically reject path-backed replay evidence.
  const invalidLiveBrowserLayer: BrowserVizLayerUpsertEvent["layer"] = pathBackedReplayLayer;
  void invalidLiveBrowserLayer;
}
void assertBrowserRejectsPathRef;

describe("createWorkerVizFacetSink", () => {
  it("copies the exact typed-array subview and posts Core-owned identity and transferables", () => {
    const posted: Array<{ event: BrowserRunEvent; transfer: Transferable[] }> = [];
    const source = new Uint8Array([90, 4, 7, 91]);
    const values = new Uint8Array(source.buffer, 1, 2);
    const sink = createWorkerVizFacetSink({
      runToken: "facet-run",
      generation: 3,
      post: (event, transfer = []) => posted.push({ event, transfer }),
    });

    sink(
      [
        {
          kind: "grid",
          dataTypeKey: "test.facet-grid",
          spaceId: "tile.hexOddQ",
          dims: { width: 2, height: 1 },
          field: { format: "u8", values },
        },
      ],
      {
        runId: "core-run",
        planFingerprint: "core-plan",
        stepId: "test.facet-step",
        stageId: "foundation",
        stepIndex: 7,
      }
    );

    expect(posted).toHaveLength(1);
    expect(posted[0]?.event).toMatchObject({
      type: "viz.layer.upsert",
      runToken: "facet-run",
      generation: 3,
      layer: {
        dataTypeKey: "test.facet-grid",
        stepId: "test.facet-step",
        stageId: "foundation",
        stepIndex: 7,
      },
    });
    const event = posted[0]?.event;
    if (event?.type !== "viz.layer.upsert" || event.layer.kind !== "grid") {
      throw new Error("Expected one grid facet upsert.");
    }
    const emitted = event.layer.field.data.buffer;
    expect(emitted).not.toBe(source.buffer);
    expect(Array.from(new Uint8Array(emitted))).toEqual([4, 7]);
    expect(posted[0]?.transfer).toEqual([emitted]);

    structuredClone(emitted, { transfer: [emitted] });
    expect(emitted.byteLength).toBe(0);
    expect(Array.from(source)).toEqual([90, 4, 7, 91]);
  });

  it("suppresses an already-aborted run without materializing or posting evidence", () => {
    const posted: BrowserRunEvent[] = [];
    const sink = createWorkerVizFacetSink({
      runToken: "aborted-run",
      generation: 1,
      abortSignal: { aborted: true },
      post: (event) => posted.push(event),
    });

    sink(
      [
        {
          kind: "grid",
          dataTypeKey: "test.aborted",
          spaceId: "tile.hexOddQ",
          dims: { width: 1, height: 1 },
          field: { format: "u8", values: new Uint8Array([1]) },
        },
      ],
      {
        runId: "core-run",
        planFingerprint: "core-plan",
        stepId: "test.aborted-step",
        stageId: "foundation",
        stepIndex: 0,
      }
    );

    expect(posted).toEqual([]);
  });

  it("rejects a malformed projection batch before any prior layer enters the browser protocol", () => {
    const posted: BrowserRunEvent[] = [];
    const sink = createWorkerVizFacetSink({
      runToken: "invalid-run",
      generation: 1,
      post: (event) => posted.push(event),
    });

    expect(() =>
      sink(
        [
          {
            kind: "grid",
            dataTypeKey: "test.valid-before-invalid",
            spaceId: "tile.hexOddQ",
            dims: { width: 1, height: 1 },
            field: { format: "u8", values: new Uint8Array([1]) },
          },
          {
            kind: "grid",
            dataTypeKey: "test.invalid-cardinality",
            spaceId: "tile.hexOddQ",
            dims: { width: 2, height: 1 },
            field: { format: "u8", values: new Uint8Array([1]) },
          },
        ],
        {
          runId: "core-run",
          planFingerprint: "core-plan",
          stepId: "test.invalid-step",
          stageId: "foundation",
          stepIndex: 0,
        }
      )
    ).toThrow("requires 2 scalar values");
    expect(posted).toEqual([]);
  });

  it("rejects repeated canonical layer identity before posting any batch member", () => {
    const posted: BrowserRunEvent[] = [];
    const sink = createWorkerVizFacetSink({
      runToken: "duplicate-run",
      generation: 1,
      post: (event) => posted.push(event),
    });
    const projection = {
      kind: "grid" as const,
      dataTypeKey: "test.duplicate",
      spaceId: "tile.hexOddQ" as const,
      dims: { width: 1, height: 1 },
      field: { format: "u8" as const, values: new Uint8Array([1]) },
    };

    expect(() =>
      sink([projection, projection], {
        runId: "core-run",
        planFingerprint: "core-plan",
        stepId: "test.duplicate-step",
        stageId: "foundation",
        stepIndex: 0,
      })
    ).toThrow("duplicate layer key");
    expect(posted).toEqual([]);
  });
});
