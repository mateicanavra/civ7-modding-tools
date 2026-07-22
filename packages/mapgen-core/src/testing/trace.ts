import type { StepTrace, TraceSink } from "@mapgen/trace/index.js";
import { createTraceSessionInternal } from "@mapgen/trace/session.js";

/** Executor-shaped step identity supplied explicitly by focused trace tests. */
export type TraceStepTestMeta = Readonly<{
  stepId: string;
  stageId: string;
  stepIndex: number;
}>;

/** Explicit test-only lifecycle surface for constructing trace evidence without a recipe run. */
export interface TraceSessionTestHarness {
  readonly emitRunStart: () => void;
  readonly emitRunFinish: (result: { success: boolean; error?: string }) => void;
  readonly emitStepStart: (meta: TraceStepTestMeta) => void;
  readonly emitStepFinish: (
    meta: TraceStepTestMeta & { durationMs?: number; success?: boolean; error?: string }
  ) => void;
  readonly openStepTrace: (meta: TraceStepTestMeta) => Readonly<{
    trace: StepTrace;
    close: () => void;
  }>;
}

/** Inputs for explicit trace-event construction in focused SDK and diagnostics tests. */
export type TraceSessionTestInput = Readonly<{
  runId: string;
  planFingerprint: string;
  config: Readonly<{
    steps?: Readonly<Record<string, "off" | "basic" | "verbose">>;
  }>;
  sink: TraceSink;
  nowMs?: () => number;
}>;

/**
 * Creates a trace lifecycle harness for tests that need schema-valid events without executing a
 * recipe. Production callers must provide trace selection and sinks through execution options.
 */
export function createTraceSessionForTest(input: TraceSessionTestInput): TraceSessionTestHarness {
  return createTraceSessionInternal(input);
}
