import type { MetricProjection } from "@swooper/mapgen-metrics";
import type { VizProjection } from "@swooper/mapgen-viz";

/**
 * Invocation-local evidence available after the step's providers have been admitted.
 * Projectors must not mutate the observation, config, or nested shared storage such as typed arrays;
 * the shallow readonly surface is deliberately honest about JavaScript's mutable binary views.
 */
export type StepFacetInput<TObservation, TConfig> = Readonly<{
  observation: TObservation;
  config: TConfig;
  dimensions: Readonly<{ width: number; height: number }>;
}>;

/** Synchronous evidence projectors authored beside a step's behavior. */
export type StepFacets<TConfig, TObservation> = Readonly<{
  metrics?: (input: StepFacetInput<TObservation, TConfig>) => MetricProjection;
  viz?: (input: StepFacetInput<TObservation, TConfig>) => readonly VizProjection[];
}>;
