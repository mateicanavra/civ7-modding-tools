import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import type { MetricProjection } from "@swooper/mapgen-metrics";
import type { VizProjection } from "@swooper/mapgen-viz";
import type { StepFacetInput, StepFacets } from "./step-projectors.js";

export type { StepFacetInput, StepFacets } from "./step-projectors.js";

/** Execution identity attached only after author-owned evidence has crossed into a sink. */
export type StepFacetSinkContext = Readonly<{
  runId: string;
  planFingerprint: string;
  stepId: string;
  stageId: string;
  stepIndex: number;
}>;

/** Bounded classification of an optional facet failure. */
export type StepFacetFailure = Readonly<{
  facet: "metrics" | "viz";
  operation: "project" | "emit";
  context: StepFacetSinkContext;
  error: unknown;
}>;

type SynchronousStepFacetConsumer<TArgs extends unknown[]> = (...args: TArgs) => undefined;

/**
 * Execution-owned consumers for optional step evidence and its non-fatal failure channel.
 * Projection sinks must complete synchronously; a returned thenable is reported as a sink failure.
 */
export type StepFacetSinks = Readonly<{
  metrics?: SynchronousStepFacetConsumer<
    [projection: MetricProjection, context: StepFacetSinkContext]
  >;
  viz?: SynchronousStepFacetConsumer<
    [projections: readonly VizProjection[], context: StepFacetSinkContext]
  >;
  onError?: SynchronousStepFacetConsumer<[failure: StepFacetFailure]>;
}>;

type StepFacetDispatchInput<TConfig, TObservation> = Readonly<{
  facets: StepFacets<TConfig, TObservation> | undefined;
  sinks: StepFacetSinks | undefined;
  observation: TObservation;
  config: TConfig;
  dimensions: Readonly<{ width: number; height: number }>;
  context: StepFacetSinkContext;
}>;

function reportFacetFailure(sinks: StepFacetSinks, failure: StepFacetFailure): void {
  try {
    const observed = sinks.onError?.(Object.freeze(failure)) as unknown;
    containThenable(classifyThenable(observed));
  } catch {
    // Optional evidence and its observer can never alter generation success.
  }
}

function emitMetrics<TConfig, TObservation>(
  input: StepFacetDispatchInput<TConfig, TObservation>,
  facetInput: StepFacetInput<TObservation, TConfig>,
  sinks: StepFacetSinks
): void {
  const project = input.facets?.metrics;
  const emit = sinks.metrics;
  if (!project || !emit) return;

  let projection: MetricProjection;
  try {
    projection = project(facetInput);
    const completion = classifyThenable(projection);
    if (completion.kind !== "none") {
      containThenable(completion);
      throw new TypeError("Step metrics projectors must be synchronous.");
    }
  } catch (error) {
    reportFacetFailure(sinks, {
      facet: "metrics",
      operation: "project",
      context: input.context,
      error,
    });
    return;
  }

  try {
    const emitted = emit(projection, input.context) as unknown;
    const completion = classifyThenable(emitted);
    if (completion.kind !== "none") {
      containThenable(completion);
      throw new TypeError("Step metrics sinks must be synchronous.");
    }
  } catch (error) {
    reportFacetFailure(sinks, {
      facet: "metrics",
      operation: "emit",
      context: input.context,
      error,
    });
  }
}

function emitViz<TConfig, TObservation>(
  input: StepFacetDispatchInput<TConfig, TObservation>,
  facetInput: StepFacetInput<TObservation, TConfig>,
  sinks: StepFacetSinks
): void {
  const project = input.facets?.viz;
  const emit = sinks.viz;
  if (!project || !emit) return;

  let projections: readonly VizProjection[];
  try {
    const projected = project(facetInput);
    const completion = classifyThenable(projected);
    if (completion.kind !== "none") {
      containThenable(completion);
      throw new TypeError("Step viz projectors must be synchronous.");
    }
    if (!Array.isArray(projected)) {
      throw new TypeError("Step viz projectors must return an array of projections.");
    }
    projections = Object.freeze([...projected]);
  } catch (error) {
    reportFacetFailure(sinks, {
      facet: "viz",
      operation: "project",
      context: input.context,
      error,
    });
    return;
  }

  try {
    const emitted = emit(projections, input.context) as unknown;
    const completion = classifyThenable(emitted);
    if (completion.kind !== "none") {
      containThenable(completion);
      throw new TypeError("Step viz sinks must be synchronous.");
    }
  } catch (error) {
    reportFacetFailure(sinks, {
      facet: "viz",
      operation: "emit",
      context: input.context,
      error,
    });
  }
}

/**
 * Dispatches optional post-step evidence in the single admitted order: metrics, then viz.
 * Missing sinks skip their projectors; every projector and sink is invoked at most once.
 */
export function dispatchStepFacets<TConfig, TObservation>(
  input: StepFacetDispatchInput<TConfig, TObservation>
): void {
  if (!input.facets || !input.sinks) return;
  const facetInput: StepFacetInput<TObservation, TConfig> = Object.freeze({
    observation: input.observation,
    config: input.config,
    dimensions: Object.freeze({ ...input.dimensions }),
  }) as StepFacetInput<TObservation, TConfig>;
  emitMetrics(input, facetInput, input.sinks);
  emitViz(input, facetInput, input.sinks);
}
