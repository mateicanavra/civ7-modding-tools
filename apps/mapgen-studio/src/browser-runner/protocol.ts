import type { VizInlineRef, VizLayerEntryV2 } from "@swooper/mapgen-viz";

type BrowserRunStartRequest = {
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
   * Studio-selected alive major-player count used when running outside Civ7.
   * Static map metadata remains owned by the selected Civ7 map-size preset.
   */
  playerCount?: number;
  /**
   * Complete recipe config JSON for this browser run. The worker validates exact
   * identity against the bundled recipe artifacts before compilation.
   */
  pipelineConfig: unknown;
};

type BrowserRunCancelRequest = {
  type: "run.cancel";
  runToken: string;
  generation: number;
};

export type BrowserRunRequest = BrowserRunStartRequest | BrowserRunCancelRequest;

type BrowserRunStartedEvent = {
  type: "run.started";
  runToken: string;
  generation: number;
  runId: string;
  planFingerprint: string;
};

type BrowserRunProgressEvent = {
  type: "run.progress";
  runToken: string;
  generation: number;
  kind: "step.start" | "step.finish";
  stepId: string;
  stageId: string;
  stepIndex: number;
  durationMs?: number;
};

export type BrowserVizLayerUpsertEvent = {
  type: "viz.layer.upsert";
  runToken: string;
  generation: number;
  layer: VizLayerEntryV2<VizInlineRef>;
};

type BrowserRunFinishedEvent = {
  type: "run.finished";
  runToken: string;
  generation: number;
};

type BrowserRunCanceledEvent = {
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
