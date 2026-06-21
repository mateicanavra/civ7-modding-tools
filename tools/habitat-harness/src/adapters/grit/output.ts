import {
  type DiagnosticAdapterFailureKind,
  DiagnosticAdapterFailureKindSchema,
  type DiagnosticCacheRequirement,
  DiagnosticCommandObservationSchema,
  DiagnosticCompletedCommandObservationSchema,
  DiagnosticScanRootRefusalSchema,
  diagnosticCacheRequirementForGritCheck,
  diagnosticCommandObservationFromResult,
  diagnosticCompletedCommandObservationFromResult,
  type NativeGritCheckRequest,
  NativeGritCheckRequestSchema,
  nativeGritCheckRequestFromCommandResult,
} from "@internal/habitat-harness/core/domains/diagnostic-pattern-catalog/index";
import { toRepoRelative } from "@internal/habitat-harness/substrate/lib/paths";
import type { HabitatCommandResult } from "@internal/habitat-harness/substrate/providers/command/index";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  type GritParseFailureStatus,
  GritParseFailureStatusSchema,
  GritReportSchema,
  type GritResult,
  type GritWireReport,
  GritWireReportSchema,
} from "./provider/types.js";

export const GritDiagnosticAcquisitionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("parsed"),
      request: NativeGritCheckRequestSchema,
      report: GritReportSchema,
      parseStatus: Type.Literal("parsed"),
      command: DiagnosticCompletedCommandObservationSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("adapter-failed"),
      request: NativeGritCheckRequestSchema,
      failure: DiagnosticAdapterFailureKindSchema,
      parseStatus: GritParseFailureStatusSchema,
      message: Type.String(),
      command: DiagnosticCommandObservationSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("scan-root-refused"),
      decision: DiagnosticScanRootRefusalSchema,
      message: Type.String(),
      command: Type.Object(
        {
          kind: Type.Literal("not-run"),
          reason: Type.Literal("scan-root-refused"),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
]);

export type GritDiagnosticAcquisition = Static<typeof GritDiagnosticAcquisitionSchema>;

const defaultCacheRequirement = diagnosticCacheRequirementForGritCheck({});

export function parseGritCheckTextOutput(
  commandResult: HabitatCommandResult,
  cacheRequirement: DiagnosticCacheRequirement = defaultCacheRequirement,
  request: NativeGritCheckRequest = nativeGritCheckRequestFromCommandResult(
    commandResult,
    cacheRequirement
  )
): GritDiagnosticAcquisition {
  if (commandResult.exit.interrupted) {
    return parseFailure(
      commandResult,
      cacheRequirement,
      request,
      "GritCommandFailed",
      "unparsed",
      "Grit command was interrupted."
    );
  }

  const text = `${commandResult.stdout.text}\n${commandResult.stderr.text}`;
  const results = parseGritTextResults(text);
  if (commandResult.exit.code !== 0 && results.length === 0) {
    return parseFailure(
      commandResult,
      cacheRequirement,
      request,
      "GritCommandFailed",
      "unparsed",
      `Grit command exited ${commandResult.exit.code}.`
    );
  }

  return parsedAcquisition(
    commandResult,
    cacheRequirement,
    request,
    [...new Set(results.map((result) => result.path).filter(isString))],
    results
  );
}

export function parseGritCheckOutput(
  commandResult: HabitatCommandResult,
  cacheRequirement: DiagnosticCacheRequirement = defaultCacheRequirement,
  request: NativeGritCheckRequest = nativeGritCheckRequestFromCommandResult(
    commandResult,
    cacheRequirement
  )
): GritDiagnosticAcquisition {
  if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
    return parseFailure(
      commandResult,
      cacheRequirement,
      request,
      "GritCommandFailed",
      "unparsed",
      `Grit command exited ${commandResult.exit.code}.`
    );
  }

  const candidates = [
    {
      stream: "stdout",
      text: commandResult.stdout.text,
      truncated: commandResult.stdout.truncated,
    },
    {
      stream: "stderr",
      text: commandResult.stderr.text,
      truncated: commandResult.stderr.truncated,
    },
  ];
  const nonEmpty = candidates.filter((candidate) => candidate.text.trim().length > 0);
  if (nonEmpty.length === 0) {
    return parseFailure(
      commandResult,
      cacheRequirement,
      request,
      "GritNoJson",
      "no-json",
      "Grit emitted no JSON output."
    );
  }
  const truncated = nonEmpty.find((candidate) => candidate.truncated);
  if (truncated) {
    return parseFailure(
      commandResult,
      cacheRequirement,
      request,
      "GritAdapterInternalContractViolation",
      "unsupported-mode",
      `Grit ${truncated.stream} output exceeded the parser capture limit.`
    );
  }

  for (const candidate of nonEmpty) {
    const trimmed = candidate.text.trim();
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue;
    try {
      const parsed: unknown = JSON.parse(trimmed);
      return validateGritReport(commandResult, cacheRequirement, request, parsed);
    } catch {
      return parseFailure(
        commandResult,
        cacheRequirement,
        request,
        "GritMalformedJson",
        "malformed",
        `Grit ${candidate.stream} is not valid JSON.`
      );
    }
  }

  const containsJsonLikeText = nonEmpty.some(
    (candidate) => candidate.text.includes("{") || candidate.text.includes("}")
  );
  return parseFailure(
    commandResult,
    cacheRequirement,
    request,
    containsJsonLikeText ? "GritMalformedJson" : "GritNoJson",
    containsJsonLikeText ? "malformed" : "no-json",
    containsJsonLikeText
      ? "Grit output contains wrapper text around JSON; Habitat requires exact JSON."
      : "Grit output did not contain a JSON object."
  );
}

function validateGritReport(
  commandResult: HabitatCommandResult,
  cacheRequirement: DiagnosticCacheRequirement,
  request: NativeGritCheckRequest,
  value: unknown
): GritDiagnosticAcquisition {
  const issues = [...Value.Errors(GritWireReportSchema, value)];
  if (issues.length > 0) {
    const first = issues[0];
    const failure =
      first?.instancePath === "" || first?.instancePath === "/results"
        ? "GritSchemaDrift"
        : "GritUnexpectedResultShape";
    return parseFailure(
      commandResult,
      cacheRequirement,
      request,
      failure,
      "schema-drift",
      first?.message ?? "Grit JSON does not match the expected report schema."
    );
  }
  const report: GritWireReport = Value.Parse(GritWireReportSchema, value);
  return parsedAcquisition(
    commandResult,
    cacheRequirement,
    request,
    report.paths ?? [],
    report.results
  );
}

function parsedAcquisition(
  commandResult: HabitatCommandResult,
  cacheRequirement: DiagnosticCacheRequirement,
  request: NativeGritCheckRequest,
  paths: readonly string[],
  results: readonly GritResult[]
): GritDiagnosticAcquisition {
  return {
    kind: "parsed",
    request,
    report: {
      paths: [...paths],
      results: [...results],
    },
    parseStatus: "parsed",
    command: diagnosticCompletedCommandObservationFromResult(commandResult, cacheRequirement),
  };
}

function parseGritTextResults(text: string): GritResult[] {
  const results: GritResult[] = [];
  let currentPath = ".";
  let currentLine: number | undefined;
  let currentColumn: number | undefined;

  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (line.includes(" files with ") || line.startsWith("Run grit check ")) continue;
    if (!line.startsWith(" ") && !line.includes(" files with ")) {
      currentPath = normalizeGritPath(line.trim());
      currentLine = undefined;
      currentColumn = undefined;
      continue;
    }

    const positionMatch = line.match(/^\s+(\d+):(\d+)\s+/);
    if (positionMatch) {
      currentLine = Number(positionMatch[1]);
      currentColumn = Number(positionMatch[2]);
    }

    const patternMatch = line.match(/\b([a-z][a-z0-9_]+)\s*$/);
    if (!patternMatch) continue;
    results.push({
      local_name: patternMatch[1],
      path: currentPath,
      start: currentLine ? { line: currentLine, col: currentColumn } : undefined,
    });
  }

  return results;
}

function normalizeGritPath(gritPath: string | undefined): string {
  if (!gritPath) return ".";
  return toRepoRelative(gritPath.replace(/^\.\//, ""));
}

function parseFailure(
  commandResult: HabitatCommandResult,
  cacheRequirement: DiagnosticCacheRequirement,
  request: NativeGritCheckRequest,
  failure: DiagnosticAdapterFailureKind,
  parseStatus: GritParseFailureStatus,
  message: string
): GritDiagnosticAcquisition {
  return {
    kind: "adapter-failed",
    request,
    failure,
    parseStatus,
    message,
    command: diagnosticCommandObservationFromResult(commandResult, cacheRequirement),
  };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
