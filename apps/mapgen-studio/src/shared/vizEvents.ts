import type { VizLayerEntryV1 } from "@swooper/mapgen-viz";

export type VizEvent =
  | { type: "run.started"; runId: string; planFingerprint: string }
  | {
      type: "run.progress";
      kind: "step.start" | "step.finish";
      stepId: string;
      phase?: string;
      stepIndex: number;
      durationMs?: number;
    }
  | { type: "viz.layer.upsert"; layer: VizLayerEntryV1 }
  | { type: "run.finished" }
  | { type: "run.canceled" }
  | { type: "run.error"; name?: string; message: string; details?: string; stack?: string };
