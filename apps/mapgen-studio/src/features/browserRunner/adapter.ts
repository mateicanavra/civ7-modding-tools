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
        layer: {
          key: event.layer.key,
          kind: event.layer.kind,
          layerId: event.layer.layerId,
          stepId: event.layer.stepId,
          phase: event.layer.phase,
          stepIndex: event.layer.stepIndex,
          bounds: event.layer.bounds,
          format: event.layer.kind === "grid" ? event.layer.format : undefined,
          valueFormat: event.layer.kind === "grid" ? undefined : event.layer.valueFormat,
          dims: event.layer.kind === "grid" ? event.layer.dims : undefined,
          count: event.layer.kind === "grid" ? undefined : event.layer.count,
          meta: event.layer.meta,
        },
        payload: event.payload,
      };
    case "run.finished":
      return { type: "run.finished" };
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
