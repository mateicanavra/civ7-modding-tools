import type { TraceScope } from "@mapgen/trace/index.js";
import type { TSchema } from "typebox";
import type { StepFacets } from "./step-projectors.js";

export interface EngineContext {
  trace: TraceScope;
}

export type GenerationPhase =
  | "setup"
  | "foundation"
  | "morphology"
  | "gameplay"
  | "hydrology"
  | "ecology"
  | "placement";

export type DependencyTag = string;
export type NormalizeContext<TEnv = unknown, TKnobs = unknown> = Readonly<{
  env: TEnv;
  knobs: TKnobs;
}>;

export interface MapGenStep<TContext = EngineContext, TConfig = unknown, TResult = unknown> {
  id: string;
  phase: GenerationPhase;
  requires: readonly DependencyTag[];
  provides: readonly DependencyTag[];
  configSchema?: TSchema;
  normalize?: (config: TConfig, ctx: NormalizeContext) => TConfig;
  run: (context: TContext, config: TConfig) => TResult | Promise<TResult>;
  /** Optional synchronous projectors dispatched by the executor after provides validation. */
  facets?: StepFacets<TConfig, TResult>;
}

export interface PipelineStepResult {
  stepId: string;
  success: boolean;
  durationMs?: number;
  error?: string;
}
