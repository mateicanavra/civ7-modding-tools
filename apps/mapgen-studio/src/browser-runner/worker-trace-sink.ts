import type { TraceEvent, TraceSink } from "@swooper/mapgen-core";
import type { BrowserRunEvent } from "./protocol";

/**
 * Worker-owned transport boundary for one browser-run event and its optional transferable buffers.
 * Callers must post the event and transfer list together and must not reuse transferred storage.
 */
export type WorkerEventPost = (event: BrowserRunEvent, transfer?: Transferable[]) => void;

/**
 * Creates the run-correlated worker sink for browser progress events.
 * Aborted runs emit nothing and step indexes remain stable for the lifetime of one sink.
 */
export function createWorkerTraceSink(options: {
  runToken: string;
  post: WorkerEventPost;
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

    if (event.kind === "step.start") {
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
        stageId: event.stageId,
        stepIndex,
      });
      return;
    }

    if (event.kind === "step.finish") {
      const stepIndex = stepIndexById.get(event.stepId) ?? -1;
      post({
        type: "run.progress",
        runToken,
        generation,
        kind: "step.finish",
        stepId: event.stepId,
        stageId: event.stageId,
        stepIndex,
        durationMs: event.durationMs,
      });
      return;
    }

    if (event.kind === "run.finish") {
      post({ type: "run.finished", runToken, generation });
      return;
    }
  };

  return { emit };
}
