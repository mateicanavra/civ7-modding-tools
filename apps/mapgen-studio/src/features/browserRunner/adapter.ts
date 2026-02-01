import type { BrowserRunEvent } from "../../browser-runner/protocol";
import type { VizEvent } from "../../shared/vizEvents";

export function toVizEvent(event: BrowserRunEvent): VizEvent {
  switch (event.type) {
    case "run.started":
      return {
        type: "run.started",
        runId: event.runId,
        planFingerprint: event.planFingerprint,
      };
    case "run.progress":
      return {
        type: "run.progress",
        kind: event.kind,
        stepId: event.stepId,
        phase: event.phase,
        stepIndex: event.stepIndex,
        durationMs: event.durationMs,
      };
    case "viz.layer.upsert":
      return {
        type: "viz.layer.upsert",
        layer: event.layer,
      };
    case "run.finished":
      return { type: "run.finished" };
    case "run.canceled":
      return { type: "run.canceled" };
    case "run.error":
      return {
        type: "run.error",
        name: event.name,
        message: event.message,
        details: event.details,
        stack: event.stack,
      };
  }
}
