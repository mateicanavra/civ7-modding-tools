import type { MapContext } from "@mapgen/core/map-context.js";
import type { MapSetup } from "@mapgen/core/map-setup.js";
import type { TSchema } from "typebox";
import type { StepFacets } from "./step-projectors.js";

export type DependencyTag = string;
/** Setup and stage knobs available while compiling one step's internal configuration. */
export type NormalizeContext<TKnobs = unknown> = Readonly<{
  setup: MapSetup;
  knobs: TKnobs;
}>;

/** One registered execution node over the single authentic MapGen context for a run. */
export interface MapGenStep<TConfig = unknown, TResult = unknown> {
  readonly id: string;
  /** Recipe-composition stage that owns this executable occurrence. */
  readonly stageId: string;
  readonly requires: readonly DependencyTag[];
  readonly provides: readonly DependencyTag[];
  readonly configSchema?: TSchema;
  readonly normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  readonly run: (context: MapContext, config: TConfig) => TResult | Promise<TResult>;
  /** Optional synchronous projectors dispatched by the executor after provides validation. */
  readonly facets?: StepFacets<TConfig, TResult>;
}

export interface PipelineStepResult {
  stepId: string;
  success: boolean;
  durationMs?: number;
  error?: string;
}
