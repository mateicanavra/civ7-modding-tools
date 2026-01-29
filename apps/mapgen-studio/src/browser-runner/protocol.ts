import type { BrowserTestRecipeConfig } from "@mapgen/browser-test-recipe";

export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type BrowserRunStartRequest = {
  type: "run.start";
  runToken: string;
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  configOverrides?: BrowserTestRecipeConfig;
};

export type BrowserRunCancelRequest = {
  type: "run.cancel";
  runToken: string;
};

export type BrowserRunRequest = BrowserRunStartRequest | BrowserRunCancelRequest;

export type BrowserRunStartedEvent = {
  type: "run.started";
  runToken: string;
  runId: string;
  planFingerprint: string;
};

export type BrowserRunProgressEvent = {
  type: "run.progress";
  runToken: string;
  kind: "step.start" | "step.finish";
  stepId: string;
  phase?: string;
  stepIndex: number;
  durationMs?: number;
};

export type BrowserVizLayerUpsertEvent = {
  type: "viz.layer.upsert";
  runToken: string;
  layer: BrowserVizLayerEntry;
  payload: BrowserVizLayerPayload;
};

export type BrowserRunFinishedEvent = {
  type: "run.finished";
  runToken: string;
};

export type BrowserRunErrorEvent = {
  type: "run.error";
  runToken: string;
  name?: string;
  message: string;
  details?: string;
  stack?: string;
};

export type BrowserRunEvent =
  | BrowserRunStartedEvent
  | BrowserRunProgressEvent
  | BrowserVizLayerUpsertEvent
  | BrowserRunFinishedEvent
  | BrowserRunErrorEvent;

export type BrowserVizLayerEntry =
  | {
      kind: "grid";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      format: VizScalarFormat;
      dims: { width: number; height: number };
      bounds: Bounds;
      key: string;
    }
  | {
      kind: "points";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      valueFormat?: VizScalarFormat;
      bounds: Bounds;
      key: string;
    }
  | {
      kind: "segments";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      valueFormat?: VizScalarFormat;
      bounds: Bounds;
      key: string;
    };

export type BrowserVizLayerPayload =
  | { kind: "grid"; values: ArrayBuffer; valuesByteLength: number; format: VizScalarFormat }
  | {
      kind: "points";
      positions: ArrayBuffer;
      values?: ArrayBuffer;
      valueFormat?: VizScalarFormat;
    }
  | {
      kind: "segments";
      segments: ArrayBuffer;
      values?: ArrayBuffer;
      valueFormat?: VizScalarFormat;
    };
