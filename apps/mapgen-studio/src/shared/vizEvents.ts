import type { VizInlineRef, VizLayerEntryV2 } from "@swooper/mapgen-viz";

export type VizEvent =
  | { type: "run.started"; runId: string; planFingerprint: string }
  | {
      type: "run.progress";
      kind: "step.start" | "step.finish";
      stepId: string;
      stageId: string;
      stepIndex: number;
      durationMs?: number;
    }
  | { type: "viz.layer.upsert"; layer: VizLayerEntryV2<VizInlineRef> }
  | { type: "run.finished" }
  | { type: "run.canceled" }
  | { type: "run.error"; name?: string; message: string; details?: string; stack?: string };
