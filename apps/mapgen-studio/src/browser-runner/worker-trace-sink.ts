import type { TraceEvent, TraceSink } from "@swooper/mapgen-core";
import type { VizBinaryRef, VizLayerEmissionV1, VizLayerEntryV1 } from "@swooper/mapgen-viz";
import type { BrowserRunEvent } from "./protocol";

type Post = (event: BrowserRunEvent, transfer?: Transferable[]) => void;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}


function collectTransferablesFromBinaryRef(ref: VizBinaryRef, into: Transferable[]): void {
  if (ref.kind !== "inline") return;
  into.push(ref.buffer);
}

function collectTransferables(layer: VizLayerEntryV1): Transferable[] {
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
    for (const field of Object.values(layer.fields)) collectTransferablesFromBinaryRef(field.data, transfer);
  }
  return transfer;
}

export function createWorkerTraceSink(options: {
  runToken: string;
  post: Post;
  generation: number;
  abortSignal?: { readonly aborted: boolean } | null;
}): TraceSink {
  const { runToken, post, generation, abortSignal } = options;

  const stepIndexById = new Map<string, number>();
  let nextStepIndex = 0;

  const emit = (event: TraceEvent): void => {
    // If a run is canceled, we stop emitting user-facing events. The worker
    // will explicitly emit `run.canceled` once the execution unwinds.
    if (abortSignal?.aborted) return;

    if (event.kind === "step.start" && event.stepId) {
      let stepIndex = stepIndexById.get(event.stepId);
      if (stepIndex === undefined) {
        stepIndex = nextStepIndex++;
        stepIndexById.set(event.stepId, stepIndex);
      }
      post({
        type: "run.progress",
        runToken,
        generation,
        kind: "step.start",
        stepId: event.stepId,
        phase: event.phase,
        stepIndex,
      });
      return;
    }

    if (event.kind === "step.finish" && event.stepId) {
      const stepIndex = stepIndexById.get(event.stepId) ?? -1;
      post({
        type: "run.progress",
        runToken,
        generation,
        kind: "step.finish",
        stepId: event.stepId,
        phase: event.phase,
        stepIndex,
        durationMs: event.durationMs,
      });
      return;
    }

    if (event.kind === "run.finish") {
      post({ type: "run.finished", runToken, generation });
      return;
    }

    if (event.kind !== "step.event" || !event.stepId) return;
    const data = event.data;
    if (!isPlainObject(data)) return;
    if (data.type !== "viz.layer.emit.v1") return;

    const payload = data as unknown as { type: "viz.layer.emit.v1"; layer: VizLayerEmissionV1 };
    const stepIndex = stepIndexById.get(event.stepId) ?? -1;
    const layer: VizLayerEntryV1 = { ...payload.layer, stepIndex };
    post({ type: "viz.layer.upsert", runToken, generation, layer }, collectTransferables(layer));
  };

  return { emit };
}
