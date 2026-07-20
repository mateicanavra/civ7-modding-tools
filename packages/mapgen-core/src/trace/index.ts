import { StageIdSchema } from "@mapgen/authoring/stage-id.js";
import { encodeUtf8 } from "@mapgen/lib/encoding/utf8.js";
import type { TraceConfig, TraceLevel } from "@mapgen/trace/config.js";
import { Type } from "typebox";
import { Value } from "typebox/value";

export type { TraceConfig, TraceLevel } from "@mapgen/trace/config.js";
export { TraceConfigSchema, TraceLevelSchema } from "@mapgen/trace/config.js";

const TraceEventIdentitySchema = {
  tsMs: Type.Number(),
  runId: Type.String({ minLength: 1 }),
  planFingerprint: Type.String({ minLength: 1 }),
} as const;

const TraceStepIdentitySchema = {
  ...TraceEventIdentitySchema,
  stepId: Type.String({ minLength: 1 }),
  stageId: StageIdSchema,
} as const;

/** Recursive value contract accepted by JSON serialization without coercion or omission. */
export type TraceJsonValue =
  | null
  | boolean
  | number
  | string
  | readonly TraceJsonValue[]
  | TraceJsonObject;

/** Record-shaped JSON trace payload used by diagnostic event producers. */
export type TraceJsonObject = Readonly<{ [key: string]: TraceJsonValue }>;

const TraceJsonValueCyclicSchema = Type.Cyclic(
  {
    JsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("JsonValue")),
      Type.Record(Type.String(), Type.Ref("JsonValue")),
    ]),
  },
  "JsonValue"
);

/** Runtime schema for recursive JSON-compatible trace payloads. */
export const TraceJsonValueSchema = Type.Unsafe<TraceJsonValue>(TraceJsonValueCyclicSchema);

/** Closed serialized evidence emitted by one pipeline run or authored step. */
export const TraceEventSchema = Type.Union([
  Type.Object(
    { ...TraceEventIdentitySchema, kind: Type.Literal("run.start") },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...TraceEventIdentitySchema,
      kind: Type.Literal("run.finish"),
      success: Type.Boolean(),
      error: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    { ...TraceStepIdentitySchema, kind: Type.Literal("step.start") },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...TraceStepIdentitySchema,
      kind: Type.Literal("step.finish"),
      durationMs: Type.Optional(Type.Number({ minimum: 0 })),
      success: Type.Optional(Type.Boolean()),
      error: Type.Optional(Type.String()),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ...TraceStepIdentitySchema,
      kind: Type.Literal("step.event"),
      data: Type.Optional(TraceJsonValueSchema),
    },
    { additionalProperties: false }
  ),
]);

type TraceEventIdentity = Readonly<{
  tsMs: number;
  runId: string;
  planFingerprint: string;
}>;

type TraceEventPayload =
  | Readonly<{ kind: "run.start" }>
  | Readonly<{ kind: "run.finish"; success: boolean; error?: string }>
  | Readonly<{ kind: "step.start"; stepId: string; stageId: string }>
  | Readonly<{
      kind: "step.finish";
      stepId: string;
      stageId: string;
      durationMs?: number;
      success?: boolean;
      error?: string;
    }>
  | Readonly<{
      kind: "step.event";
      stepId: string;
      stageId: string;
      data?: TraceJsonValue;
    }>;

/** Closed run-versus-step evidence emitted by one pipeline execution. */
export type TraceEvent = TraceEventIdentity & TraceEventPayload;

/** Receives immutable execution evidence without participating in pipeline control flow. */
export interface TraceSink {
  emit(event: TraceEvent): void;
}

/** Exact authored step identity supplied by the executor for step-scoped trace evidence. */
export interface TraceStepMeta {
  stepId: string;
  stageId: string;
}

/** Step-local trace capability whose identity is fixed by recipe composition. */
export interface TraceScope {
  readonly runId: string;
  readonly planFingerprint: string;
  readonly stepId: string;
  readonly stageId: string;
  readonly level: TraceLevel;
  readonly isEnabled: boolean;
  readonly isVerbose: boolean;
  readonly event: (data?: TraceJsonValue | (() => TraceJsonValue)) => void;
}

/** Run-scoped trace lifecycle owned by one pipeline execution. */
export interface TraceSession {
  readonly enabled: boolean;
  readonly runId: string;
  readonly planFingerprint: string;
  readonly emitRunStart: () => void;
  readonly emitRunFinish: (result: { success: boolean; error?: string }) => void;
  readonly emitStepStart: (meta: TraceStepMeta) => void;
  readonly emitStepFinish: (
    meta: TraceStepMeta & { durationMs?: number; success?: boolean; error?: string }
  ) => void;
  readonly createStepScope: (meta: TraceStepMeta) => TraceScope;
}

const NOOP_SCOPE: TraceScope = Object.freeze({
  runId: "",
  planFingerprint: "",
  stepId: "",
  stageId: "",
  level: "off",
  isEnabled: false,
  isVerbose: false,
  event: () => undefined,
});
const NOOP_SESSION: TraceSession = Object.freeze({
  enabled: false,
  runId: "",
  planFingerprint: "",
  emitRunStart: () => undefined,
  emitRunFinish: () => undefined,
  emitStepStart: () => undefined,
  emitStepFinish: () => undefined,
  createStepScope: () => NOOP_SCOPE,
});

function nowMs(): number {
  try {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
  } catch {
    // ignore
  }
  return Date.now();
}

function safeEmit(sink: TraceSink, event: TraceEvent): void {
  try {
    if (!Value.Check(TraceEventSchema, event)) return;
    sink.emit(event);
  } catch {
    // tracing should never alter execution flow
  }
}

/** Returns the immutable disabled scope installed when no trace capability was supplied. */
export function createNoopTraceScope(): TraceScope {
  return NOOP_SCOPE;
}

/** Creates the executor's explicit disabled session without inventing trace identity or events. */
export function createNoopTraceSession(): TraceSession {
  return NOOP_SESSION;
}

/** Creates a diagnostic sink that writes complete structured trace events to the host console. */
export function createConsoleTraceSink(): TraceSink {
  return {
    emit: (event) => {
      console.log("[trace]", event);
    },
  };
}

/** Resolves one step's trace level, defaulting an enabled session to basic lifecycle events. */
export function resolveTraceLevel(config: TraceConfig, stepId: string): TraceLevel {
  const level = config.steps?.[stepId];
  return level ?? "basic";
}

/** Complete inputs for an enabled trace session; absence is represented outside this contract. */
export interface TraceSessionOptions {
  runId: string;
  planFingerprint: string;
  config: TraceConfig;
  sink: TraceSink;
  nowMs?: () => number;
}

/** Creates an enabled trace session from explicit identity, selection, and event-sink authority. */
export function createTraceSession(options: TraceSessionOptions): TraceSession {
  const { runId, planFingerprint, sink } = options;
  const config: TraceConfig = Object.freeze({
    steps: Object.freeze({ ...(options.config.steps ?? {}) }),
  });

  const now = options.nowMs ?? nowMs;
  const emit = (event: TraceEventPayload): void => {
    safeEmit(sink, {
      tsMs: now(),
      runId,
      planFingerprint,
      ...event,
    });
  };

  const emitRunStart = (): void => {
    emit({ kind: "run.start" });
  };

  const emitRunFinish = (result: { success: boolean; error?: string }): void => {
    emit({
      kind: "run.finish",
      success: result.success,
      ...(result.error === undefined ? {} : { error: result.error }),
    });
  };

  const emitStepStart = (meta: TraceStepMeta): void => {
    if (resolveTraceLevel(config, meta.stepId) === "off") return;
    emit({ kind: "step.start", ...meta });
  };

  const emitStepFinish = (
    meta: TraceStepMeta & { durationMs?: number; success?: boolean; error?: string }
  ): void => {
    if (resolveTraceLevel(config, meta.stepId) === "off") return;
    emit({
      kind: "step.finish",
      stepId: meta.stepId,
      stageId: meta.stageId,
      ...(meta.durationMs === undefined ? {} : { durationMs: meta.durationMs }),
      ...(meta.success === undefined ? {} : { success: meta.success }),
      ...(meta.error === undefined ? {} : { error: meta.error }),
    });
  };

  const createStepScope = (meta: TraceStepMeta): TraceScope => {
    const level = resolveTraceLevel(config, meta.stepId);
    const isEnabled = level !== "off";
    const isVerbose = level === "verbose";

    const event = (data?: TraceJsonValue | (() => TraceJsonValue)): void => {
      if (!isVerbose) return;
      const payload = typeof data === "function" ? data() : data;
      emit({
        kind: "step.event",
        ...meta,
        ...(payload === undefined ? {} : { data: payload }),
      });
    };

    return Object.freeze({
      runId,
      planFingerprint,
      stepId: meta.stepId,
      stageId: meta.stageId,
      level,
      isEnabled,
      isVerbose,
      event,
    });
  };

  return Object.freeze({
    enabled: true,
    runId,
    planFingerprint,
    emitRunStart,
    emitRunFinish,
    emitStepStart,
    emitStepFinish,
    createStepScope,
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/** Converts supported trace data into a deterministic JSON-compatible representation. */
export function canonicalize(value: unknown): unknown {
  if (value == null || typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((entry) => canonicalize(entry));
  }

  if (value instanceof Map) {
    const entries: Array<[string, unknown]> = Array.from(value.entries()).map(([key, entry]) => [
      String(key),
      canonicalize(entry),
    ]);
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries;
  }

  if (value instanceof Set) {
    const entries = Array.from(value.values()).map((entry) => canonicalize(entry));
    entries.sort((a, b) => stableKey(a).localeCompare(stableKey(b)));
    return entries;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    const keys = Object.keys(value).sort((a, b) => a.localeCompare(b));
    for (const key of keys) {
      const entry = value[key];
      if (entry === undefined) continue;
      result[key] = canonicalize(entry);
    }
    return result;
  }

  return value;
}

function stableKey(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(canonicalize(value)) ?? String(value);
}

/** Serializes trace data with deterministic key ordering across supported hosts. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function rotr(value: number, shift: number): number {
  return (value >>> shift) | (value << (32 - shift));
}

/**
 * Hashes a JavaScript string through deterministic UTF-8 into lowercase SHA-256.
 * Lone surrogates follow `TextEncoder` semantics and encode as the replacement
 * character, keeping trace identities stable across browser, Node, and Civ7 hosts.
 */
export function sha256Hex(input: string): string {
  const bytes = encodeUtf8(input);
  const bitLen = BigInt(bytes.length) * 8n;
  const paddedLength = ((bytes.length + 9 + 63) >> 6) << 6;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  const lengthPos = paddedLength - 8;
  view.setUint32(lengthPos, Number(bitLen >> 32n), false);
  view.setUint32(lengthPos + 4, Number(bitLen & 0xffffffffn), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const base = offset + i * 4;
      w[i] =
        (padded[base] << 24) |
        (padded[base + 1] << 16) |
        (padded[base + 2] << 8) |
        padded[base + 3];
    }

    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const toHex = (value: number): string => value.toString(16).padStart(8, "0");

  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(
    h6
  )}${toHex(h7)}`;
}
