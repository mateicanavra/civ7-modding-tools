import type { Artifact } from "@mapgen/authoring/artifact/contract.js";
import type { MapContext } from "@mapgen/core/map-context.js";
import type { MapSetup } from "@mapgen/core/map-setup.js";
import type { CompletionId } from "@mapgen/engine/completion.js";
import type { TSchema } from "typebox";
import type { StepFacets } from "./step-projectors.js";

/** Exact artifact authority or payload-free completion selected by one step edge. */
export type PipelineDependency = Artifact | CompletionId;

/** Setup and stage knobs available while compiling one step's internal configuration. */
export type NormalizeContext<TKnobs = unknown> = Readonly<{
  setup: MapSetup;
  knobs: TKnobs;
}>;

/** One registered execution node over the single authentic MapGen context for a run. */
export interface MapGenStep<TConfig = unknown, TObservation = unknown> {
  readonly id: string;
  /** Recipe-composition stage that owns this executable occurrence. */
  readonly stageId: string;
  readonly requires: readonly PipelineDependency[];
  readonly provides: readonly PipelineDependency[];
  /** Internal occurrence flag selecting projection of its recipe's admitted initial setup. */
  readonly projectsInitialSetup?: true;
  readonly configSchema?: TSchema;
  readonly normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  readonly run: (context: MapContext, config: TConfig) => TObservation | Promise<TObservation>;
  /** Optional synchronous projectors dispatched by the executor after provides validation. */
  readonly facets?: StepFacets<TConfig, TObservation>;
}

export interface PipelineStepResult {
  stepId: string;
  success: boolean;
  durationMs?: number;
  error?: string;
}
