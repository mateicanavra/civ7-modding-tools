import type { VizLayerMeta } from "@swooper/mapgen-core";

export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type BrowserRunStartRequest = {
  type: "run.start";
  runToken: string;
  generation: number;
  /**
   * A studio-level recipe identifier (typically `${namespace}/${recipeId}`) used
   * to select a bundled recipe runtime in the worker.
   */
  recipeId: string;
  seed: number;
  mapSizeId: string;
  dimensions: { width: number; height: number };
  latitudeBounds: { topLatitude: number; bottomLatitude: number };
  /**
   * Recipe-specific override payload. Treated as unknown at the protocol boundary
   * to keep the runner engine decoupled from any given recipe runtime.
   */
  configOverrides?: unknown;
};

export type BrowserRunCancelRequest = {
  type: "run.cancel";
  runToken: string;
  generation: number;
};

export type BrowserRunRequest = BrowserRunStartRequest | BrowserRunCancelRequest;

export type BrowserRunStartedEvent = {
  type: "run.started";
  runToken: string;
  generation: number;
  runId: string;
  planFingerprint: string;
};

export type BrowserRunProgressEvent = {
  type: "run.progress";
  runToken: string;
  generation: number;
  kind: "step.start" | "step.finish";
  stepId: string;
  phase?: string;
  stepIndex: number;
  durationMs?: number;
};

export type BrowserVizLayerUpsertEvent = {
  type: "viz.layer.upsert";
  runToken: string;
  generation: number;
  layer: BrowserVizLayerEntry;
  payload: BrowserVizLayerPayload;
};

export type BrowserRunFinishedEvent = {
  type: "run.finished";
  runToken: string;
  generation: number;
};

export type BrowserRunCanceledEvent = {
  type: "run.canceled";
  runToken: string;
  generation: number;
};

export type BrowserRunErrorEvent = {
  type: "run.error";
  runToken: string;
  generation: number;
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
  | BrowserRunCanceledEvent
  | BrowserRunErrorEvent;

export type BrowserVizLayerEntry =
  | {
      kind: "grid";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      format: VizScalarFormat;
      /** Row-major tile grid (index = y * width + x). */
      dims: { width: number; height: number };
      bounds: Bounds;
      meta?: VizLayerMeta;
      fileKey?: string;
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
      meta?: VizLayerMeta;
      fileKey?: string;
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
      meta?: VizLayerMeta;
      fileKey?: string;
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
