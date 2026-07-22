import type { TraceEvent, TraceSink } from "@swooper/mapgen-core";
import type { BrowserRunEvent } from "./protocol";

/**
 * Worker-owned transport boundary for one browser-run event and its optional transferable buffers.
 * Callers must post the event and transfer list together and must not reuse transferred storage.
 */
export type WorkerEventPost = (event: BrowserRunEvent, transfer?: Transferable[]) => void;

/**
 * Creates the run-correlated worker sink for browser step-progress events.
 * Aborted runs emit nothing; executor-owned step indexes pass through unchanged.
 * Product terminal state remains owned by the execution promise in the worker.
 */
export function createWorkerTraceSink(options: {
  runToken: string;
  post: WorkerEventPost;
  generation: number;
  abortSignal?: { readonly aborted: boolean } | null;
}): TraceSink {
  const { runToken, post, generation, abortSignal } = options;

  const emit = (event: TraceEvent): undefined => {
    // If a run is canceled, we stop emitting user-facing events. The worker
    // will explicitly emit `run.canceled` once the execution unwinds.
    if (abortSignal?.aborted) return undefined;

    if (event.kind === "step.start") {
      post({
        type: "run.progress",
        runToken,
        generation,
        kind: "step.start",
        stepId: event.stepId,
        stageId: event.stageId,
        stepIndex: event.stepIndex,
      });
      return undefined;
    }

    if (event.kind === "step.finish") {
      post({
        type: "run.progress",
        runToken,
        generation,
        kind: "step.finish",
        stepId: event.stepId,
        stageId: event.stageId,
        stepIndex: event.stepIndex,
        durationMs: event.durationMs,
      });
      return undefined;
    }

    return undefined;
  };

  return { emit };
}
