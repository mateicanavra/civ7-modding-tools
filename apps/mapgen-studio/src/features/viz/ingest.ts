import type { VizEvent } from "../../shared/vizEvents";
import { getLayerKey, type VizLayerEntryV0, type VizManifestV0 } from "./model";

export function ingestVizEvent(prev: VizManifestV0 | null, event: VizEvent): VizManifestV0 | null {
  if (event.type === "run.started") {
    return {
      version: 0,
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
      steps: [...prev.steps, { stepId: event.stepId, phase: event.phase, stepIndex: event.stepIndex }],
    };
  }

  if (event.type === "viz.layer.upsert") {
    const key = event.layer.key;
    const entry: VizLayerEntryV0 =
      event.layer.kind === "grid"
        ? {
            kind: "grid",
            layerId: event.layer.layerId,
            stepId: event.layer.stepId,
            phase: event.layer.phase,
            stepIndex: event.layer.stepIndex,
            format: event.layer.format ?? "u8",
            dims: event.layer.dims ?? { width: 1, height: 1 },
            values: event.payload.kind === "grid" ? event.payload.values : undefined,
            bounds: event.layer.bounds,
            meta: event.layer.meta,
            key,
          }
        : event.layer.kind === "points"
          ? {
              kind: "points",
              layerId: event.layer.layerId,
              stepId: event.layer.stepId,
              phase: event.layer.phase,
              stepIndex: event.layer.stepIndex,
              count: event.layer.count ?? 0,
              positions: event.payload.kind === "points" ? event.payload.positions : undefined,
              values: event.payload.kind === "points" ? event.payload.values : undefined,
              valueFormat: event.layer.valueFormat,
              bounds: event.layer.bounds,
              meta: event.layer.meta,
              key,
            }
          : {
              kind: "segments",
              layerId: event.layer.layerId,
              stepId: event.layer.stepId,
              phase: event.layer.phase,
              stepIndex: event.layer.stepIndex,
              count: event.layer.count ?? 0,
              segments: event.payload.kind === "segments" ? event.payload.segments : undefined,
              values: event.payload.kind === "segments" ? event.payload.values : undefined,
              valueFormat: event.layer.valueFormat,
              bounds: event.layer.bounds,
              meta: event.layer.meta,
              key,
            };

    const layers = [...prev.layers];
    const idx = layers.findIndex((l) => getLayerKey(l) === key);
    if (idx >= 0) layers[idx] = entry;
    else layers.push(entry);

    return { ...prev, layers };
  }

  return prev;
}
