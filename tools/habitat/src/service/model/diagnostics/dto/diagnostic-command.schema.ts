import path from "node:path";
import type {
  HabitatCommandResult,
  HabitatProcessRequest,
} from "@habitat/cli/resources/command/index";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  type DiagnosticSelectedScanRoots,
  DiagnosticSelectedScanRootsSchema,
  parseDiagnosticSelectedScanRoots,
} from "./diagnostic-scan-root.schema.js";

const DiagnosticCommandRequestMetadataSchema = Type.Object(
  {
    commandId: Type.String({ minLength: 1 }),
    executable: Type.String({ minLength: 1 }),
    argv: Type.Array(Type.String()),
    cwd: Type.String({ minLength: 1 }),
    scanRoots: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export const DiagnosticOutputMetadataSchema = Type.Object(
  {
    bytes: Type.Number({ minimum: 0 }),
    sha256: Type.String({ minLength: 1 }),
    truncated: Type.Boolean(),
  },
  { additionalProperties: false }
);

export const NativeGritCommandFamilySchema = Type.Union([
  Type.Literal("selected-rule-json-check"),
  Type.Literal("selected-rule-apply-dry-run-observation"),
  Type.Literal("pinned-native-preflight"),
]);

export const NativeGritOutputContractSchema = Type.Union([
  Type.Literal("json-report-on-stderr"),
  Type.Literal("compact-jsonl-on-stdout"),
  Type.Literal("version-on-stdout"),
]);

const NativeGritCommandRequestMetadataSchema = Type.Interface(
  [Type.Pick(DiagnosticCommandRequestMetadataSchema, ["argv"])],
  {
    commandInvocationId: Type.String({ minLength: 1 }),
    executable: Type.String({ minLength: 1 }),
    cwd: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const NativeGritSelectedRuleJsonCheckRequestSchema = Type.Interface(
  [NativeGritCommandRequestMetadataSchema],
  {
    commandFamily: Type.Literal("selected-rule-json-check"),
    outputContract: Type.Literal("json-report-on-stderr"),
    scanRoots: DiagnosticSelectedScanRootsSchema,
  },
  { additionalProperties: false }
);

export const NativeGritSelectedRuleApplyDryRunObservationRequestSchema = Type.Interface(
  [NativeGritCommandRequestMetadataSchema],
  {
    commandFamily: Type.Literal("selected-rule-apply-dry-run-observation"),
    outputContract: Type.Literal("compact-jsonl-on-stdout"),
    scanRoots: DiagnosticSelectedScanRootsSchema,
  },
  { additionalProperties: false }
);

export const NativeGritPinnedNativePreflightRequestSchema = Type.Interface(
  [NativeGritCommandRequestMetadataSchema],
  {
    commandFamily: Type.Literal("pinned-native-preflight"),
    outputContract: Type.Literal("version-on-stdout"),
    scanRoots: Type.Tuple([]),
  },
  { additionalProperties: false }
);

export const NativeGritTargetCommandRequestSchema = Type.Union([
  NativeGritSelectedRuleJsonCheckRequestSchema,
  NativeGritSelectedRuleApplyDryRunObservationRequestSchema,
]);

export const NativeGritCommandRequestSchema = Type.Union([
  NativeGritSelectedRuleJsonCheckRequestSchema,
  NativeGritSelectedRuleApplyDryRunObservationRequestSchema,
  NativeGritPinnedNativePreflightRequestSchema,
]);

export const DiagnosticCompletedCommandObservationSchema = Type.Interface(
  [DiagnosticCommandRequestMetadataSchema],
  {
    kind: Type.Literal("completed"),
    exit: Type.Object(
      { code: Type.Literal(0), interrupted: Type.Literal(false) },
      { additionalProperties: false }
    ),
    output: Type.Object(
      {
        stdout: DiagnosticOutputMetadataSchema,
        stderr: DiagnosticOutputMetadataSchema,
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);

export const DiagnosticFailedCommandObservationSchema = Type.Interface(
  [DiagnosticCommandRequestMetadataSchema],
  {
    kind: Type.Literal("failed"),
    exit: Type.Object(
      {
        code: Type.Union([Type.Integer({ maximum: -1 }), Type.Integer({ minimum: 1 })]),
        interrupted: Type.Literal(false),
      },
      { additionalProperties: false }
    ),
    output: Type.Union([
      Type.Object(
        {
          stdout: DiagnosticOutputMetadataSchema,
          stderr: DiagnosticOutputMetadataSchema,
        },
        { additionalProperties: false }
      ),
      Type.Null(),
    ]),
  },
  { additionalProperties: false }
);

export const DiagnosticInterruptedCommandObservationSchema = Type.Interface(
  [DiagnosticCommandRequestMetadataSchema],
  {
    kind: Type.Literal("interrupted"),
    timeoutMs: Type.Optional(Type.Number({ exclusiveMinimum: 0 })),
    exit: Type.Object(
      {
        code: Type.Union([Type.Integer(), Type.Null()]),
        signal: Type.Union([Type.String(), Type.Null()]),
        interrupted: Type.Literal(true),
      },
      { additionalProperties: false }
    ),
    output: Type.Union([
      Type.Object(
        {
          stdout: DiagnosticOutputMetadataSchema,
          stderr: DiagnosticOutputMetadataSchema,
        },
        { additionalProperties: false }
      ),
      Type.Null(),
    ]),
  },
  { additionalProperties: false }
);

export const DiagnosticToolUnavailableCommandObservationSchema = Type.Interface(
  [DiagnosticCommandRequestMetadataSchema],
  {
    kind: Type.Literal("tool-unavailable"),
    cause: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const DiagnosticCommandObservationSchema = Type.Union([
  DiagnosticCompletedCommandObservationSchema,
  DiagnosticFailedCommandObservationSchema,
  DiagnosticInterruptedCommandObservationSchema,
  DiagnosticToolUnavailableCommandObservationSchema,
  Type.Object(
    {
      kind: Type.Literal("not-run"),
      reason: Type.Literal("scan-root-refused"),
    },
    { additionalProperties: false }
  ),
]);

export type DiagnosticOutputMetadata = Static<typeof DiagnosticOutputMetadataSchema>;
export type NativeGritCommandFamily = Static<typeof NativeGritCommandFamilySchema>;
export type NativeGritOutputContract = Static<typeof NativeGritOutputContractSchema>;
export type NativeGritSelectedRuleJsonCheckRequest = Static<
  typeof NativeGritSelectedRuleJsonCheckRequestSchema
> & { readonly scanRoots: DiagnosticSelectedScanRoots };
export type NativeGritSelectedRuleApplyDryRunObservationRequest = Static<
  typeof NativeGritSelectedRuleApplyDryRunObservationRequestSchema
> & { readonly scanRoots: DiagnosticSelectedScanRoots };
export type NativeGritPinnedNativePreflightRequest = Static<
  typeof NativeGritPinnedNativePreflightRequestSchema
>;
export type NativeGritTargetCommandRequest =
  | NativeGritSelectedRuleJsonCheckRequest
  | NativeGritSelectedRuleApplyDryRunObservationRequest;
export type NativeGritCommandRequest =
  | NativeGritTargetCommandRequest
  | NativeGritPinnedNativePreflightRequest;
export type DiagnosticCompletedCommandObservation = Static<
  typeof DiagnosticCompletedCommandObservationSchema
>;
export type DiagnosticFailedCommandObservation = Static<
  typeof DiagnosticFailedCommandObservationSchema
>;
export type DiagnosticInterruptedCommandObservation = Static<
  typeof DiagnosticInterruptedCommandObservationSchema
>;
export type DiagnosticToolUnavailableCommandObservation = Static<
  typeof DiagnosticToolUnavailableCommandObservationSchema
>;
export type DiagnosticExecutedCommandObservation =
  | DiagnosticCompletedCommandObservation
  | DiagnosticFailedCommandObservation
  | DiagnosticInterruptedCommandObservation;
export type DiagnosticCommandObservation = Static<typeof DiagnosticCommandObservationSchema>;

const nativeGritOutputContractByFamily = {
  "selected-rule-json-check": "json-report-on-stderr",
  "selected-rule-apply-dry-run-observation": "compact-jsonl-on-stdout",
  "pinned-native-preflight": "version-on-stdout",
} as const satisfies Record<NativeGritCommandFamily, NativeGritOutputContract>;

export function nativeGritCommandRequestFromProcessRequest(input: {
  readonly request: HabitatProcessRequest;
  readonly commandFamily: "selected-rule-json-check";
}): NativeGritSelectedRuleJsonCheckRequest;
export function nativeGritCommandRequestFromProcessRequest(input: {
  readonly request: HabitatProcessRequest;
  readonly commandFamily: "selected-rule-apply-dry-run-observation";
}): NativeGritSelectedRuleApplyDryRunObservationRequest;
export function nativeGritCommandRequestFromProcessRequest(input: {
  readonly request: HabitatProcessRequest;
  readonly commandFamily: "pinned-native-preflight";
}): NativeGritPinnedNativePreflightRequest;
export function nativeGritCommandRequestFromProcessRequest(input: {
  readonly request: HabitatProcessRequest;
  readonly commandFamily: NativeGritCommandFamily;
}): NativeGritCommandRequest {
  const metadata = {
    commandFamily: input.commandFamily,
    commandInvocationId: input.request.commandId,
    executable: input.request.executable,
    argv: [...input.request.argv],
    cwd: path.resolve(input.request.cwd),
    outputContract: nativeGritOutputContractByFamily[input.commandFamily],
  };
  if (input.commandFamily === "pinned-native-preflight") {
    return Value.Parse(NativeGritPinnedNativePreflightRequestSchema, {
      ...metadata,
      scanRoots: [],
    });
  }
  const scanRoots = parseDiagnosticSelectedScanRoots(input.request.scanRoots ?? []);
  const parsed = Value.Parse(NativeGritTargetCommandRequestSchema, { ...metadata, scanRoots });
  return { ...parsed, scanRoots };
}

export function diagnosticCommandObservationFromResult(
  commandResult: HabitatCommandResult
): DiagnosticExecutedCommandObservation {
  const metadata = commandMetadata(commandResult);
  const output = {
    stdout: outputMetadata(commandResult.stdout),
    stderr: outputMetadata(commandResult.stderr),
  };
  if (commandResult.exit.interrupted) {
    return {
      ...metadata,
      kind: "interrupted",
      exit: {
        code: commandResult.exit.code,
        signal: commandResult.exit.signal,
        interrupted: true,
      },
      output,
    };
  }
  if (commandResult.exit.code !== 0) {
    return {
      ...metadata,
      kind: "failed",
      exit: { code: commandResult.exit.code, interrupted: false },
      output,
    };
  }
  return {
    ...metadata,
    kind: "completed",
    exit: { code: 0, interrupted: false },
    output,
  };
}

export function diagnosticCompletedCommandObservationFromResult(
  commandResult: HabitatCommandResult
): DiagnosticCompletedCommandObservation {
  return Value.Parse(
    DiagnosticCompletedCommandObservationSchema,
    diagnosticCommandObservationFromResult(commandResult)
  );
}

export function diagnosticFailedCommandObservation(input: {
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly scanRoots: readonly string[];
  readonly exitCode: number;
}): DiagnosticFailedCommandObservation {
  return Value.Parse(DiagnosticFailedCommandObservationSchema, {
    ...diagnosticCommandMetadata(input),
    kind: "failed",
    exit: { code: input.exitCode, interrupted: false },
    output: null,
  });
}

export function diagnosticInterruptedCommandObservation(input: {
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly scanRoots: readonly string[];
  readonly exitCode: number | null;
  readonly signal: string | null;
  readonly timeoutMs?: number;
}): DiagnosticInterruptedCommandObservation {
  return Value.Parse(DiagnosticInterruptedCommandObservationSchema, {
    ...diagnosticCommandMetadata(input),
    kind: "interrupted",
    ...optionalTimeoutMetadata(input.timeoutMs),
    exit: { code: input.exitCode, signal: input.signal, interrupted: true },
    output: null,
  });
}

export function diagnosticToolUnavailableObservation(input: {
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly scanRoots: readonly string[];
  readonly cause: string;
}): DiagnosticToolUnavailableCommandObservation {
  return Value.Parse(DiagnosticToolUnavailableCommandObservationSchema, {
    kind: "tool-unavailable",
    ...diagnosticCommandMetadata(input),
    cause: input.cause.slice(0, 1000),
  });
}

function diagnosticCommandMetadata(input: {
  readonly commandId: string;
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly scanRoots: readonly string[];
}): Static<typeof DiagnosticCommandRequestMetadataSchema> {
  return {
    commandId: input.commandId,
    executable: input.executable,
    argv: [...input.argv],
    cwd: path.resolve(input.cwd),
    scanRoots: [...input.scanRoots],
  };
}

function outputMetadata(output: HabitatCommandResult["stdout"]): DiagnosticOutputMetadata {
  return {
    bytes: output.bytes,
    sha256: output.sha256,
    truncated: output.truncated,
  };
}

function optionalTimeoutMetadata(timeoutMs: number | undefined): {} | { timeoutMs: number } {
  if (timeoutMs === undefined) return {};
  return { timeoutMs };
}

function commandMetadata(
  commandResult: HabitatCommandResult
): Static<typeof DiagnosticCommandRequestMetadataSchema> {
  return {
    commandId: commandResult.commandId,
    executable: commandResult.executable,
    argv: [...commandResult.argv],
    cwd: path.resolve(commandResult.cwd),
    scanRoots: [...commandResult.scanRoots],
  };
}
