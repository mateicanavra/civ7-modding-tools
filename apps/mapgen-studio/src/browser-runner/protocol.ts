import type { VizLayerEntryV1 } from "@swooper/mapgen-viz";

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
   * Studio-only "world settings" used when running outside the Civ7 engine.
   * These are translated into mock MapInfo values inside the worker.
   */
  playerCount?: number;
  resourcesMode?: "balanced" | "strategic";
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
  layer: VizLayerEntryV1;
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
