import type { VizEvent } from "../../shared/vizEvents";
import type { VizManifestV2 } from "./model";

/** Reduces one browser-run visualization event into the current v2 manifest snapshot. */
export function ingestVizEvent(prev: VizManifestV2 | null, event: VizEvent): VizManifestV2 | null {
  if (event.type === "run.started") {
    return {
      version: 2,
      runId: event.runId,
      planFingerprint: event.planFingerprint,
      steps: [],
      layers: [],
    };
  }

  if (!prev) return prev;

  if (event.type === "run.progress") {
    if (event.kind !== "step.start") return prev;
    if (prev.steps.some((s) => s.stepId === event.stepId)) return prev;
    return {
      ...prev,
      steps: [
        ...prev.steps,
        { stepId: event.stepId, stageId: event.stageId, stepIndex: event.stepIndex },
      ],
    };
  }

  if (event.type === "viz.layer.upsert") {
    const layers = [...prev.layers];
    const idx = layers.findIndex((l) => l.layerKey === event.layer.layerKey);
    if (idx >= 0) layers[idx] = event.layer;
    else layers.push(event.layer);

    return { ...prev, layers };
  }

  return prev;
}
