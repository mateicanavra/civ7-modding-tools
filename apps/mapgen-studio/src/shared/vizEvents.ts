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
  | {
      type: "viz.layer.upsert";
      layer: {
        key: string;
        kind: "grid" | "points" | "segments";
        layerId: string;
        stepId: string;
        phase?: string;
        stepIndex: number;
        bounds: [minX: number, minY: number, maxX: number, maxY: number];
        format?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
        valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32";
        dims?: { width: number; height: number };
        count?: number;
        meta?: import("@swooper/mapgen-core").VizLayerMeta;
        fileKey?: string;
      };
      payload:
        | { kind: "grid"; values: ArrayBuffer; valuesByteLength: number; format: "u8" | "i8" | "u16" | "i16" | "i32" | "f32" }
        | { kind: "points"; positions: ArrayBuffer; values?: ArrayBuffer; valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32" }
        | { kind: "segments"; segments: ArrayBuffer; values?: ArrayBuffer; valueFormat?: "u8" | "i8" | "u16" | "i16" | "i32" | "f32" };
    }
  | { type: "run.finished" }
  | { type: "run.canceled" }
  | { type: "run.error"; name?: string; message: string; details?: string; stack?: string };
