import {
  type ExecutionPlan,
  getExecutionPlanBindingInternal,
} from "@mapgen/engine/execution-plan.js";
import type { TraceConfig, TraceSink } from "@mapgen/trace/index.js";
import { createTraceSessionInternal, type TraceSession } from "@mapgen/trace/session.js";

/** Observation configuration for one execution attempt of a compiled plan. */
export type PlanTraceOptions = Readonly<{
  config: TraceConfig;
  sink: TraceSink;
}>;

/**
 * Hashes recipe identity, admitted physical setup, exact step topology, and compiled config.
 * Observation policy and sinks are excluded because they cannot change generated map behavior.
 */
export function computePlanFingerprint(plan: ExecutionPlan): string {
  return getExecutionPlanBindingInternal(plan).fingerprint;
}

/** @internal Builds trace evidence from the identity allocated by the active MapContext. */
export function createTraceSessionForExecutionInternal(
  runId: string,
  planFingerprint: string,
  trace: PlanTraceOptions
): TraceSession {
  return createTraceSessionInternal({
    runId,
    planFingerprint,
    config: trace.config,
    sink: trace.sink,
  });
}
