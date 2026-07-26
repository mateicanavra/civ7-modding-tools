import { classifyThenable, containThenable } from "@mapgen/lib/async/thenable.js";
import { createPortableJsonSnapshot } from "@mapgen/lib/json/portable-snapshot.js";
import type { TraceConfig, TraceLevel } from "@mapgen/trace/config.js";
import {
  type StepTrace,
  type TraceEvent,
  TraceEventSchema,
  type TraceJsonValue,
  type TraceSink,
} from "@mapgen/trace/index.js";
import { Value } from "typebox/value";

/** @internal Exact step identity supplied by the executor for trace evidence. */
type TraceStepMeta = Readonly<{
  stepId: string;
  stageId: string;
  stepIndex: number;
}>;

/** @internal Revocable author trace port owned by one executor step invocation. */
type TraceStepLease = Readonly<{
  trace: StepTrace;
  close: () => void;
}>;

type TraceEventPayload =
  | Readonly<{ kind: "run.start" }>
  | Readonly<{ kind: "run.finish"; success: boolean; error?: string }>
  | (TraceStepMeta & Readonly<{ kind: "step.start" }>)
  | (TraceStepMeta &
      Readonly<{
        kind: "step.finish";
        durationMs?: number;
        success?: boolean;
        error?: string;
      }>)
  | (TraceStepMeta & Readonly<{ kind: "step.event"; data?: TraceJsonValue }>);

/** @internal Executor-owned lifecycle for one run's trace evidence. */
export interface TraceSession {
  readonly emitRunStart: () => void;
  readonly emitRunFinish: (result: { success: boolean; error?: string }) => void;
  readonly emitStepStart: (meta: TraceStepMeta) => void;
  readonly emitStepFinish: (
    meta: TraceStepMeta & { durationMs?: number; success?: boolean; error?: string }
  ) => void;
  readonly openStepTrace: (meta: TraceStepMeta) => TraceStepLease;
}

/** @internal Complete inputs for an enabled trace session. */
export interface TraceSessionOptions {
  runId: string;
  planFingerprint: string;
  config: TraceConfig;
  sink: TraceSink;
  nowMs?: () => number;
}

const NOOP_STEP_TRACE: StepTrace = Object.freeze({ event: () => undefined });
const NOOP_STEP_LEASE: TraceStepLease = Object.freeze({
  trace: NOOP_STEP_TRACE,
  close: () => undefined,
});
const NOOP_SESSION: TraceSession = Object.freeze({
  emitRunStart: () => undefined,
  emitRunFinish: () => undefined,
  emitStepStart: () => undefined,
  emitStepFinish: () => undefined,
  openStepTrace: () => NOOP_STEP_LEASE,
});

function nowMs(): number {
  try {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
  } catch {
    // Embedded runtimes may not expose the browser performance clock.
  }
  return Date.now();
}

function safeEmit(sink: TraceSink, event: TraceEvent): void {
  try {
    const snapshot = createPortableJsonSnapshot(event, "/trace");
    if (!snapshot.ok || !Value.Check(TraceEventSchema, snapshot.value)) return;
    const emitted = sink.emit(snapshot.value as TraceEvent) as unknown;
    containThenable(classifyThenable(emitted));
  } catch {
    // Observation must never alter generation behavior.
  }
}

function resolveTraceLevel(config: TraceConfig, stepId: string): TraceLevel {
  return config.steps?.[stepId] ?? "basic";
}

/** @internal Creates the executor's disabled session without inventing identity or events. */
export function createNoopTraceSessionInternal(): TraceSession {
  return NOOP_SESSION;
}

/** @internal Creates an executor-owned trace session from admitted selection and sink authority. */
export function createTraceSessionInternal(options: TraceSessionOptions): TraceSession {
  const { runId, planFingerprint, sink } = options;
  const config: TraceConfig = Object.freeze({
    steps: Object.freeze({ ...(options.config.steps ?? {}) }),
  });
  const now = options.nowMs ?? nowMs;
  const emit = (event: TraceEventPayload): void => {
    safeEmit(sink, { tsMs: now(), runId, planFingerprint, ...event });
  };

  return Object.freeze({
    emitRunStart: () => emit({ kind: "run.start" }),
    emitRunFinish: (result: { success: boolean; error?: string }) =>
      emit({
        kind: "run.finish",
        success: result.success,
        ...(result.error === undefined ? {} : { error: result.error }),
      }),
    emitStepStart: (meta: TraceStepMeta) => {
      if (resolveTraceLevel(config, meta.stepId) !== "off") {
        emit({ kind: "step.start", ...meta });
      }
    },
    emitStepFinish: (
      meta: TraceStepMeta & { durationMs?: number; success?: boolean; error?: string }
    ) => {
      if (resolveTraceLevel(config, meta.stepId) === "off") return;
      emit({
        kind: "step.finish",
        stepId: meta.stepId,
        stageId: meta.stageId,
        stepIndex: meta.stepIndex,
        ...(meta.durationMs === undefined ? {} : { durationMs: meta.durationMs }),
        ...(meta.success === undefined ? {} : { success: meta.success }),
        ...(meta.error === undefined ? {} : { error: meta.error }),
      });
    },
    openStepTrace: (meta: TraceStepMeta) => {
      const verbose = resolveTraceLevel(config, meta.stepId) === "verbose";
      if (!verbose) return NOOP_STEP_LEASE;
      let emitStepEvent: ((data?: TraceJsonValue | (() => TraceJsonValue)) => void) | undefined = (
        data
      ) => {
        try {
          const payload = typeof data === "function" ? data() : data;
          const completion = classifyThenable(payload);
          if (completion.kind !== "none") {
            containThenable(completion);
            return;
          }
          emit({
            kind: "step.event",
            ...meta,
            ...(payload === undefined ? {} : { data: payload }),
          });
        } catch {
          // Lazy observation payloads must not alter step behavior.
        }
      };
      const trace: StepTrace = Object.freeze({
        event: (data?: TraceJsonValue | (() => TraceJsonValue)): undefined => {
          emitStepEvent?.(data);
          return undefined;
        },
      });
      return Object.freeze({
        trace,
        close: () => {
          emitStepEvent = undefined;
        },
      });
    },
  });
}
