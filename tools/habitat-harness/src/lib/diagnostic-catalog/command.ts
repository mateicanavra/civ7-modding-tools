import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import type { HabitatCommandResult, HabitatProcessRequest } from "../habitat-process.js";
import type { DiagnosticAdapterFailureKind } from "./failure.js";

const DiagnosticCommandRequestMetadataSchema = Type.Object(
  {
    commandId: Type.String({ minLength: 1 }),
    executable: Type.String({ minLength: 1 }),
    argv: Type.Array(Type.String()),
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
  Type.Literal("current-tree-json-check"),
  Type.Literal("selected-rule-json-check"),
  Type.Literal("docs-text-check"),
  Type.Literal("docs-apply-dry-run-observation"),
]);

export const NativeGritOutputContractSchema = Type.Union([
  Type.Literal("json-report"),
  Type.Literal("standard-text-report"),
  Type.Literal("standard-apply-dry-run"),
]);

export const DiagnosticCacheRequirementSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("workspace-cache-allowed"),
      observable: Type.Literal(false),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("fresh-required"),
      observable: Type.Literal(true),
    },
    { additionalProperties: false }
  ),
]);

export const NativeGritCheckRequestSchema = Type.Interface(
  [Type.Pick(DiagnosticCommandRequestMetadataSchema, ["argv", "scanRoots"])],
  {
    commandFamily: NativeGritCommandFamilySchema,
    commandInvocationId: Type.String({ minLength: 1 }),
    executable: Type.Literal("grit"),
    cwd: Type.String({ minLength: 1 }),
    outputContract: NativeGritOutputContractSchema,
    cacheRequirement: DiagnosticCacheRequirementSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticCacheObservationSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("observed"),
      status: Type.Union([
        Type.Literal("fresh"),
        Type.Literal("cache-hit"),
        Type.Literal("replay"),
      ]),
      cacheDir: Type.Optional(Type.String({ minLength: 1 })),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("workspace-unobserved"),
      allowedBy: Type.Literal("ordinary-current-tree-diagnostic"),
      cacheDir: Type.Optional(Type.String({ minLength: 1 })),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("missing-required-observation"),
      failure: Type.Literal("GritCacheProvenanceMissing"),
      cacheDir: Type.Optional(Type.String({ minLength: 1 })),
    },
    { additionalProperties: false }
  ),
]);

export const DiagnosticCompletedCommandObservationSchema = Type.Interface(
  [DiagnosticCommandRequestMetadataSchema],
  {
    kind: Type.Literal("completed"),
    exit: Type.Object(
      {
        code: Type.Number(),
        interrupted: Type.Literal(false),
      },
      { additionalProperties: false }
    ),
    output: Type.Object(
      {
        stdout: DiagnosticOutputMetadataSchema,
        stderr: DiagnosticOutputMetadataSchema,
      },
      { additionalProperties: false }
    ),
    cache: DiagnosticCacheObservationSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticInterruptedCommandObservationSchema = Type.Interface(
  [DiagnosticCommandRequestMetadataSchema],
  {
    kind: Type.Literal("interrupted"),
    exit: Type.Object(
      {
        code: Type.Number(),
        interrupted: Type.Literal(true),
      },
      { additionalProperties: false }
    ),
    output: Type.Object(
      {
        stdout: DiagnosticOutputMetadataSchema,
        stderr: DiagnosticOutputMetadataSchema,
      },
      { additionalProperties: false }
    ),
    cache: DiagnosticCacheObservationSchema,
  },
  { additionalProperties: false }
);

export const DiagnosticCommandObservationSchema = Type.Union([
  DiagnosticCompletedCommandObservationSchema,
  DiagnosticInterruptedCommandObservationSchema,
  Type.Interface(
    [DiagnosticCommandRequestMetadataSchema],
    {
      kind: Type.Literal("tool-unavailable"),
      cause: Type.String(),
    },
    { additionalProperties: false }
  ),
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
export type DiagnosticCacheRequirement = Static<typeof DiagnosticCacheRequirementSchema>;
export type NativeGritCheckRequest = Static<typeof NativeGritCheckRequestSchema>;
export type DiagnosticCacheObservation = Static<typeof DiagnosticCacheObservationSchema>;
export type DiagnosticCompletedCommandObservation = Static<
  typeof DiagnosticCompletedCommandObservationSchema
>;
export type DiagnosticInterruptedCommandObservation = Static<
  typeof DiagnosticInterruptedCommandObservationSchema
>;
export type DiagnosticCommandObservation = Static<typeof DiagnosticCommandObservationSchema>;

export function diagnosticCacheRequirementForGritCheck(options: {
  cacheMode?: "workspace" | "fresh";
  requireObservableCacheStatus?: boolean;
}): DiagnosticCacheRequirement {
  if (options.cacheMode === "fresh" || options.requireObservableCacheStatus) {
    return { kind: "fresh-required", observable: true };
  }
  return { kind: "workspace-cache-allowed", observable: false };
}

export function nativeGritCheckRequestFromProcessRequest(input: {
  request: HabitatProcessRequest;
  commandFamily: NativeGritCommandFamily;
  outputContract: NativeGritOutputContract;
  cacheRequirement: DiagnosticCacheRequirement;
}): NativeGritCheckRequest {
  return Value.Parse(NativeGritCheckRequestSchema, {
    commandFamily: input.commandFamily,
    commandInvocationId: input.request.commandId,
    executable: input.request.executable,
    argv: [...input.request.argv],
    cwd: input.request.cwd,
    scanRoots: [...(input.request.scanRoots ?? [])],
    outputContract: input.outputContract,
    cacheRequirement: input.cacheRequirement,
  });
}

export function nativeGritCheckRequestFromCommandResult(
  commandResult: HabitatCommandResult,
  cacheRequirement: DiagnosticCacheRequirement
): NativeGritCheckRequest {
  const outputContract = commandResult.argv.includes("--json")
    ? "json-report"
    : "standard-text-report";
  return Value.Parse(NativeGritCheckRequestSchema, {
    commandFamily: outputContract === "json-report" ? "current-tree-json-check" : "docs-text-check",
    commandInvocationId: commandResult.commandId,
    executable: commandResult.executable,
    argv: [...commandResult.argv],
    cwd: commandResult.cwd,
    scanRoots: [...commandResult.scanRoots],
    outputContract,
    cacheRequirement,
  });
}

export function diagnosticCacheObservationFromCommand(
  commandResult: HabitatCommandResult,
  requirement: DiagnosticCacheRequirement
): DiagnosticCacheObservation {
  const cacheDir = commandResult.cachePolicy.cacheDir;
  switch (commandResult.cachePolicy.observableStatus) {
    case "fresh":
    case "cache-hit":
    case "replay":
      return { kind: "observed", status: commandResult.cachePolicy.observableStatus, cacheDir };
    case "unknown":
    case undefined:
      return requirement.kind === "fresh-required"
        ? { kind: "missing-required-observation", failure: "GritCacheProvenanceMissing", cacheDir }
        : { kind: "workspace-unobserved", allowedBy: "ordinary-current-tree-diagnostic", cacheDir };
  }
}

export function diagnosticCacheRequirementSatisfied(
  requirement: DiagnosticCacheRequirement,
  observation: DiagnosticCacheObservation
): boolean {
  if (requirement.kind === "workspace-cache-allowed") return true;
  return observation.kind === "observed" && observation.status === "fresh";
}

export function diagnosticCommandObservationFromResult(
  commandResult: HabitatCommandResult,
  requirement: DiagnosticCacheRequirement
): DiagnosticCommandObservation {
  if (commandResult.exit.interrupted) {
    return {
      ...commandMetadata(commandResult),
      kind: "interrupted",
      exit: {
        code: commandResult.exit.code,
        interrupted: true,
      },
      output: outputMetadataPair(commandResult),
      cache: diagnosticCacheObservationFromCommand(commandResult, requirement),
    };
  }
  return diagnosticCompletedCommandObservationFromResult(commandResult, requirement);
}

export function diagnosticCompletedCommandObservationFromResult(
  commandResult: HabitatCommandResult,
  requirement: DiagnosticCacheRequirement
): DiagnosticCompletedCommandObservation {
  if (commandResult.exit.interrupted) {
    throw new Error("Completed diagnostic command observation requires a non-interrupted command.");
  }
  return {
    ...commandMetadata(commandResult),
    kind: "completed",
    exit: {
      code: commandResult.exit.code,
      interrupted: false,
    },
    output: outputMetadataPair(commandResult),
    cache: diagnosticCacheObservationFromCommand(commandResult, requirement),
  };
}

export function diagnosticToolUnavailableObservation(input: {
  commandId: string;
  executable: string;
  argv: readonly string[];
  scanRoots: readonly string[];
  cause: string;
}): DiagnosticCommandObservation {
  return {
    kind: "tool-unavailable",
    commandId: input.commandId,
    executable: input.executable,
    argv: [...input.argv],
    scanRoots: [...input.scanRoots],
    cause: input.cause.slice(0, 1000),
  };
}

export function diagnosticAdapterFailureForCacheObservation(
  observation: DiagnosticCacheObservation
): DiagnosticAdapterFailureKind | null {
  return observation.kind === "missing-required-observation" ? observation.failure : null;
}

function outputMetadata(output: HabitatCommandResult["stdout"]): DiagnosticOutputMetadata {
  return {
    bytes: output.bytes,
    sha256: output.sha256,
    truncated: output.truncated,
  };
}

function outputMetadataPair(
  commandResult: HabitatCommandResult
): DiagnosticCompletedCommandObservation["output"] {
  return {
    stdout: outputMetadata(commandResult.stdout),
    stderr: outputMetadata(commandResult.stderr),
  };
}

function commandMetadata(
  commandResult: HabitatCommandResult
): Static<typeof DiagnosticCommandRequestMetadataSchema> {
  return {
    commandId: commandResult.commandId,
    executable: commandResult.executable,
    argv: [...commandResult.argv],
    scanRoots: [...commandResult.scanRoots],
  };
}
