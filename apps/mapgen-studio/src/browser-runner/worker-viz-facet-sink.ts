import type { StepFacetSinks } from "@swooper/mapgen-core";
import {
  assertUniqueVizLayerKeys,
  materializeVizProjection,
  type VizBinaryMaterializer,
  type VizInlineRef,
  type VizLayerEmissionV2,
  type VizLayerEntryV2,
  type VizProjection,
} from "@swooper/mapgen-viz";
import type { WorkerEventPost } from "./worker-trace-sink";

function collectTransferablesFromBinaryRef(ref: VizInlineRef, into: Transferable[]): void {
  into.push(ref.buffer);
}

function collectTransferables(layer: VizLayerEntryV2<VizInlineRef>): Transferable[] {
  const transfer: Transferable[] = [];
  if (layer.kind === "grid") {
    collectTransferablesFromBinaryRef(layer.field.data, transfer);
  } else if (layer.kind === "points") {
    collectTransferablesFromBinaryRef(layer.positions, transfer);
    if (layer.values) collectTransferablesFromBinaryRef(layer.values.data, transfer);
  } else if (layer.kind === "segments") {
    collectTransferablesFromBinaryRef(layer.segments, transfer);
    if (layer.values) collectTransferablesFromBinaryRef(layer.values.data, transfer);
  } else if (layer.kind === "gridFields") {
    for (const field of Object.values(layer.fields)) {
      collectTransferablesFromBinaryRef(field.data, transfer);
    }
  }
  return transfer;
}

function postWorkerVizLayer(options: {
  post: WorkerEventPost;
  runToken: string;
  generation: number;
  layer: VizLayerEntryV2<VizInlineRef>;
}): void {
  const { post, runToken, generation, layer } = options;
  post({ type: "viz.layer.upsert", runToken, generation, layer }, collectTransferables(layer));
}

function cloneArrayBuffer(view: ArrayBufferView): ArrayBuffer {
  const copy = new Uint8Array(view.byteLength);
  copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return copy.buffer;
}

const materializeInline: VizBinaryMaterializer<VizInlineRef> = ({ source }) => ({
  kind: "inline",
  buffer: cloneArrayBuffer(source),
});

function materializeWorkerProjection(
  projection: VizProjection,
  identity: Readonly<{ stepId: string; stageId: string }>
): VizLayerEmissionV2<VizInlineRef> {
  return materializeVizProjection(projection, identity, materializeInline);
}

/**
 * Creates the execution-owned browser sink for pure step visualization projections.
 * The complete step batch is materialized before any layer is posted, so malformed evidence cannot
 * leave a partial browser view. Admitted layers carry detached bytes and Core-owned step identity;
 * aborted runs emit nothing.
 */
export function createWorkerVizFacetSink(options: {
  runToken: string;
  generation: number;
  post: WorkerEventPost;
  abortSignal?: { readonly aborted: boolean } | null;
}): NonNullable<StepFacetSinks["viz"]> {
  const { runToken, generation, post, abortSignal } = options;
  return (projections, context) => {
    if (abortSignal?.aborted) return;
    const layers = projections.map((projection) => {
      const emitted = materializeWorkerProjection(projection, {
        stepId: context.stepId,
        stageId: context.stageId,
      });
      return { ...emitted, stepIndex: context.stepIndex };
    });
    assertUniqueVizLayerKeys(layers, "Worker visualization batch");
    for (const layer of layers) {
      postWorkerVizLayer({
        post,
        runToken,
        generation,
        layer,
      });
    }
  };
}
