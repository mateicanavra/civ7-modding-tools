import type { MetricProjection } from "@swooper/mapgen-metrics";
import type { VizProjection } from "@swooper/mapgen-viz";

/**
 * Borrowed evidence a step projector may observe after the step's providers have been admitted.
 * Projectors must not mutate the result, config, or any nested shared storage such as typed arrays;
 * the shallow readonly surface is deliberately honest about JavaScript's mutable binary views.
 */
export type StepFacetInput<TResult, TConfig> = Readonly<{
  result: TResult;
  config: TConfig;
  dimensions: Readonly<{ width: number; height: number }>;
}>;

/** Synchronous evidence projectors authored beside a step's behavior. */
export type StepFacets<TConfig, TResult> = Readonly<{
  metrics?: (input: StepFacetInput<TResult, TConfig>) => MetricProjection;
  viz?: (input: StepFacetInput<TResult, TConfig>) => readonly VizProjection[];
}>;
