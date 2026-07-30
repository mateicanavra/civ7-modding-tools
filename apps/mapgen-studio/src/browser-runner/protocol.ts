import type { VizInlineRef, VizLayerEntryV2 } from "@swooper/mapgen-viz";

/** Portable setup values authored in Studio and projected by the selected recipe runtime. */
export type BrowserRunSetupOptionValue = string | number | boolean | readonly string[];

/** Explicit initial-state axes carried to a browser recipe runtime without recipe-specific shape. */
export type BrowserRunInitialSetup = Readonly<{
  mapSeed: number;
  gameSeed: number;
  mapSizeId: string;
  dimensions: Readonly<{ width: number; height: number }>;
  latitudeBounds: Readonly<{ topLatitude: number; bottomLatitude: number }>;
  aliveMajorPlayerIds: readonly number[];
  options: Readonly<{
    map: Readonly<Record<string, BrowserRunSetupOptionValue>>;
    game: Readonly<Record<string, BrowserRunSetupOptionValue>>;
    player: readonly Readonly<{
      playerId: number;
      options: Readonly<Record<string, BrowserRunSetupOptionValue>>;
    }>[];
  }>;
}>;

type BrowserRunStartRequest = {
  type: "run.start";
  runToken: string;
  generation: number;
  /**
   * A studio-level recipe identifier (typically `${namespace}/${recipeId}`) used
   * to select a bundled recipe runtime in the worker.
   */
  recipeId: string;
  /**
   * Complete explicit browser-run setup facts. The selected recipe registry
   * projects these portable axes into its own admitted initial-setup shape.
   */
  initialSetup: BrowserRunInitialSetup;
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
