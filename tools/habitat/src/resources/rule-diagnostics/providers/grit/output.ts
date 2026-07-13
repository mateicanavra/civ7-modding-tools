import type { HabitatCommandResult } from "@habitat/cli/resources/command/index";
import { type Static, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";
import {
  type DiagnosticCompletedCommandObservation,
  DiagnosticCompletedCommandObservationSchema,
  type DiagnosticFailedCommandObservation,
  DiagnosticFailedCommandObservationSchema,
  type DiagnosticInterruptedCommandObservation,
  DiagnosticInterruptedCommandObservationSchema,
  type DiagnosticToolUnavailableCommandObservation,
  DiagnosticToolUnavailableCommandObservationSchema,
  type NativeGritSelectedRuleApplyDryRunObservationRequest,
  NativeGritSelectedRuleApplyDryRunObservationRequestSchema,
  type NativeGritSelectedRuleJsonCheckRequest,
  NativeGritSelectedRuleJsonCheckRequestSchema,
  type NativeGritTargetCommandRequest,
  NativeGritTargetCommandRequestSchema,
} from "./command.schema.js";
import {
  type GritCompactEvent,
  GritCompactEventSchema,
  type GritReport,
  GritReportSchema,
} from "./types.js";

const GritCheckAcquisitionEvidenceSchema = Type.Object(
  {
    request: NativeGritSelectedRuleJsonCheckRequestSchema,
    command: DiagnosticCompletedCommandObservationSchema,
  },
  { additionalProperties: false }
);

const GritApplyAcquisitionEvidenceSchema = Type.Object(
  {
    request: NativeGritSelectedRuleApplyDryRunObservationRequestSchema,
    command: DiagnosticCompletedCommandObservationSchema,
  },
  { additionalProperties: false }
);

const GritCheckObservationSchema = Type.Object(
  {
    kind: Type.Literal("check"),
    report: GritReportSchema,
  },
  { additionalProperties: false }
);

const GritApplyDryRunObservationSchema = Type.Object(
  {
    kind: Type.Literal("apply-dry-run"),
    processed: Type.Integer({ minimum: 1 }),
    found: Type.Integer({ minimum: 0 }),
    findingPaths: Type.Array(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

const GritPreCommandFailureSchema = Type.Union([
  Type.Literal("DiagnosticScopePlanningFailed"),
  Type.Literal("DiagnosticRuleMaterializationFailed"),
  Type.Literal("DiagnosticProviderSetupFailed"),
]);

const GritParseFailureSchema = Type.Union([
  Type.Literal("DiagnosticOutputMissing"),
  Type.Literal("DiagnosticOutputChannelMismatch"),
  Type.Literal("DiagnosticOutputTruncated"),
  Type.Literal("DiagnosticOutputMalformed"),
  Type.Literal("DiagnosticOutputSchemaDrift"),
]);

const GritIncompleteFailureSchema = Type.Union([
  Type.Literal("DiagnosticOutputIncomplete"),
  Type.Literal("DiagnosticUnexpectedIdentity"),
]);

export const GritDiagnosticAcquisitionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("pre-command-failed"),
      failure: GritPreCommandFailureSchema,
      detail: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Union([
    Type.Object(
      {
        kind: Type.Literal("command-failed"),
        failure: Type.Literal("DiagnosticProviderUnavailable"),
        detail: Type.String({ minLength: 1 }),
        request: NativeGritTargetCommandRequestSchema,
        command: DiagnosticToolUnavailableCommandObservationSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        kind: Type.Literal("command-failed"),
        failure: Type.Literal("DiagnosticCommandFailed"),
        detail: Type.String({ minLength: 1 }),
        request: NativeGritTargetCommandRequestSchema,
        command: DiagnosticFailedCommandObservationSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        kind: Type.Literal("command-failed"),
        failure: Type.Literal("DiagnosticCommandInterrupted"),
        detail: Type.String({ minLength: 1 }),
        request: NativeGritTargetCommandRequestSchema,
        command: DiagnosticInterruptedCommandObservationSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        kind: Type.Literal("command-failed"),
        failure: Type.Literal("DiagnosticProviderIdentityMismatch"),
        detail: Type.String({ minLength: 1 }),
        request: NativeGritTargetCommandRequestSchema,
        command: Type.Union([
          DiagnosticCompletedCommandObservationSchema,
          DiagnosticToolUnavailableCommandObservationSchema,
        ]),
      },
      { additionalProperties: false }
    ),
  ]),
  Type.Object(
    {
      kind: Type.Literal("evidence-mismatch"),
      failure: Type.Literal("DiagnosticProviderContractViolation"),
      detail: Type.String({ minLength: 1 }),
      request: NativeGritTargetCommandRequestSchema,
      command: DiagnosticCompletedCommandObservationSchema,
    },
    { additionalProperties: false }
  ),
  Type.Union([
    Type.Object(
      {
        ...GritCheckAcquisitionEvidenceSchema.properties,
        kind: Type.Literal("parse-failed"),
        failure: GritParseFailureSchema,
        detail: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...GritApplyAcquisitionEvidenceSchema.properties,
        kind: Type.Literal("parse-failed"),
        failure: GritParseFailureSchema,
        detail: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  ]),
  Type.Union([
    Type.Object(
      {
        ...GritCheckAcquisitionEvidenceSchema.properties,
        kind: Type.Literal("parsed-incomplete"),
        failure: GritIncompleteFailureSchema,
        detail: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...GritApplyAcquisitionEvidenceSchema.properties,
        kind: Type.Literal("parsed-incomplete"),
        failure: GritIncompleteFailureSchema,
        detail: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false }
    ),
  ]),
  Type.Union([
    Type.Object(
      {
        ...GritCheckAcquisitionEvidenceSchema.properties,
        kind: Type.Literal("observed-complete"),
        observation: GritCheckObservationSchema,
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        ...GritApplyAcquisitionEvidenceSchema.properties,
        kind: Type.Literal("observed-complete"),
        observation: GritApplyDryRunObservationSchema,
      },
      { additionalProperties: false }
    ),
  ]),
]);

export type GritDiagnosticAcquisition = Static<typeof GritDiagnosticAcquisitionSchema>;
export type GritPreCommandFailure = Static<typeof GritPreCommandFailureSchema>;
export type GritParseFailure = Static<typeof GritParseFailureSchema>;
export type GritIncompleteFailure = Static<typeof GritIncompleteFailureSchema>;

export interface GritCheckAcquisitionEvidence {
  readonly request: NativeGritSelectedRuleJsonCheckRequest;
  readonly command: DiagnosticCompletedCommandObservation;
}

export interface GritApplyAcquisitionEvidence {
  readonly request: NativeGritSelectedRuleApplyDryRunObservationRequest;
  readonly command: DiagnosticCompletedCommandObservation;
}

export type GritAcquisitionEvidence = GritCheckAcquisitionEvidence | GritApplyAcquisitionEvidence;

export type GritCommandFailureCapture =
  | {
      readonly failure: "DiagnosticProviderUnavailable";
      readonly detail: string;
      readonly command: DiagnosticToolUnavailableCommandObservation;
    }
  | {
      readonly failure: "DiagnosticCommandFailed";
      readonly detail: string;
      readonly command: DiagnosticFailedCommandObservation;
    }
  | {
      readonly failure: "DiagnosticCommandInterrupted";
      readonly detail: string;
      readonly command: DiagnosticInterruptedCommandObservation;
    }
  | {
      readonly failure: "DiagnosticProviderIdentityMismatch";
      readonly detail: string;
      readonly command:
        | DiagnosticCompletedCommandObservation
        | DiagnosticToolUnavailableCommandObservation;
    };

type GritPreCommandFailureAcquisition = Extract<
  GritDiagnosticAcquisition,
  { kind: "pre-command-failed" }
>;
type GritCommandFailureAcquisition = Extract<GritDiagnosticAcquisition, { kind: "command-failed" }>;
type GritEvidenceMismatchAcquisition = Extract<
  GritDiagnosticAcquisition,
  { kind: "evidence-mismatch" }
>;
type GritParseFailureAcquisition = Extract<GritDiagnosticAcquisition, { kind: "parse-failed" }>;
type GritIncompleteFailureAcquisition = Extract<
  GritDiagnosticAcquisition,
  { kind: "parsed-incomplete" }
>;
type GritObservedCheckAcquisition = Extract<
  GritDiagnosticAcquisition,
  { kind: "observed-complete"; observation: { kind: "check" } }
>;
type GritObservedApplyAcquisition = Extract<
  GritDiagnosticAcquisition,
  { kind: "observed-complete"; observation: { kind: "apply-dry-run" } }
>;
type GritApplyDryRunObservation = Static<typeof GritApplyDryRunObservationSchema>;

export type GritAcquisitionEvidenceResult<Evidence extends GritAcquisitionEvidence> =
  | { readonly kind: "accepted"; readonly evidence: Evidence }
  | { readonly kind: "failed"; readonly acquisition: GritEvidenceMismatchAcquisition };

export type GritWireParse<T> =
  | { readonly kind: "parsed"; readonly value: T }
  | {
      readonly kind: "parse-failed";
      readonly failure: GritParseFailure;
      readonly detail: string;
    }
  | {
      readonly kind: "parsed-incomplete";
      readonly failure: GritIncompleteFailure;
      readonly detail: string;
    };

export function parseGritCheckCommand(
  commandResult: HabitatCommandResult
): GritWireParse<GritReport> {
  const streamFailure = pinnedStream(
    commandResult,
    "stderr",
    "Grit check must emit exactly one JSON document on stderr."
  );
  if (streamFailure.kind !== "parsed") return streamFailure;

  let decoded: unknown;
  try {
    decoded = JSON.parse(streamFailure.value);
  } catch {
    return parseFailure("DiagnosticOutputMalformed", "Grit check emitted malformed JSON.");
  }
  if (!Value.Check(GritReportSchema, decoded)) {
    return parseFailure(
      "DiagnosticOutputSchemaDrift",
      renderSchemaErrors(GritReportSchema, decoded, "Grit check JSON")
    );
  }
  return { kind: "parsed", value: Value.Parse(GritReportSchema, decoded) };
}

export function parseGritApplyDryRunCommand(commandResult: HabitatCommandResult): GritWireParse<{
  readonly processed: number;
  readonly found: number;
  readonly findings: readonly GritApplyFindingEvidence[];
}> {
  const streamFailure = pinnedStream(
    commandResult,
    "stdout",
    "Grit apply dry-run must emit compact JSONL on stdout only."
  );
  if (streamFailure.kind !== "parsed") return streamFailure;
  const eventParse = parseCompactEvents(streamFailure.value);
  if (eventParse.kind !== "parsed") return eventParse;
  return reconcileCompactEvents(eventParse.value);
}

export function preCommandFailure(
  failure: GritPreCommandFailure,
  detail: string
): GritPreCommandFailureAcquisition {
  return { kind: "pre-command-failed", failure, detail };
}

export function commandFailure(
  request: NativeGritTargetCommandRequest,
  capture: GritCommandFailureCapture
): GritCommandFailureAcquisition {
  return { kind: "command-failed", request, ...capture };
}

export function parseAcquisitionFailure(
  failure: GritParseFailure,
  detail: string,
  evidence: GritAcquisitionEvidence
): GritParseFailureAcquisition {
  return { kind: "parse-failed", failure, detail, ...evidence };
}

export function incompleteAcquisitionFailure(
  failure: GritIncompleteFailure,
  detail: string,
  evidence: GritAcquisitionEvidence
): GritIncompleteFailureAcquisition {
  return { kind: "parsed-incomplete", failure, detail, ...evidence };
}

export function completeCheckAcquisition(
  report: GritReport,
  evidence: GritCheckAcquisitionEvidence
): GritObservedCheckAcquisition {
  return {
    kind: "observed-complete",
    observation: { kind: "check", report },
    ...evidence,
  };
}

export function completeApplyAcquisition(
  observation: Omit<GritApplyDryRunObservation, "kind">,
  evidence: GritApplyAcquisitionEvidence
): GritObservedApplyAcquisition {
  return {
    kind: "observed-complete",
    observation: { kind: "apply-dry-run", ...observation },
    ...evidence,
  };
}

function pinnedStream(
  commandResult: HabitatCommandResult,
  expected: "stdout" | "stderr",
  detail: string
): GritWireParse<string> {
  if (commandResult.stdout.truncated || commandResult.stderr.truncated) {
    return parseFailure("DiagnosticOutputTruncated", `${detail} Captured output was truncated.`);
  }
  const expectedText = commandResult[expected].text;
  const otherText = commandResult[expected === "stdout" ? "stderr" : "stdout"].text;
  if (expectedText.trim().length === 0 && otherText.trim().length === 0) {
    return parseFailure("DiagnosticOutputMissing", `${detail} Both streams were empty.`);
  }
  if (expectedText.trim().length === 0 || otherText.trim().length > 0) {
    return parseFailure("DiagnosticOutputChannelMismatch", detail);
  }
  return { kind: "parsed", value: expectedText };
}

function parseCompactEvents(text: string): GritWireParse<readonly GritCompactEvent[]> {
  const lines = text.endsWith("\n") ? text.slice(0, -1).split("\n") : text.split("\n");
  if (lines.length === 0 || (lines.length === 1 && lines[0]?.length === 0)) {
    return parseFailure("DiagnosticOutputMissing", "Grit apply dry-run emitted no JSONL records.");
  }
  const events: GritCompactEvent[] = [];
  for (const [index, line] of lines.entries()) {
    if (line?.trim().length === 0) {
      return parseFailure(
        "DiagnosticOutputMalformed",
        `Grit apply dry-run emitted a blank JSONL record at line ${index + 1}.`
      );
    }
    let decoded: unknown;
    try {
      decoded = JSON.parse(line);
    } catch {
      return parseFailure(
        "DiagnosticOutputMalformed",
        `Grit apply dry-run emitted malformed JSONL at line ${index + 1}.`
      );
    }
    if (!Value.Check(GritCompactEventSchema, decoded)) {
      return parseFailure(
        "DiagnosticOutputSchemaDrift",
        renderSchemaErrors(GritCompactEventSchema, decoded, `Grit JSONL line ${index + 1}`)
      );
    }
    events.push(Value.Parse(GritCompactEventSchema, decoded));
  }
  return { kind: "parsed", value: events };
}

function reconcileCompactEvents(events: readonly GritCompactEvent[]): GritWireParse<{
  readonly processed: number;
  readonly found: number;
  readonly findings: readonly GritApplyFindingEvidence[];
}> {
  const terminalIndexes = events.flatMap((event, index) =>
    event.__typename === "AllDone" ? [index] : []
  );
  if (terminalIndexes.length !== 1 || terminalIndexes[0] !== events.length - 1) {
    return incomplete(
      "terminal-shape",
      "Grit apply dry-run requires exactly one final AllDone event."
    );
  }
  const terminal = events.at(-1);
  if (!terminal || terminal.__typename !== "AllDone") {
    return incomplete("terminal-shape", "Grit apply dry-run has no terminal AllDone event.");
  }
  if (terminal.reason !== "allMatchesFound") {
    return incomplete("terminal-reason", `Grit apply dry-run terminated with ${terminal.reason}.`);
  }
  if (terminal.processed === 0) {
    return incomplete("processed-zero", "Grit apply dry-run reported zero processed files.");
  }

  let observedFound = 0;
  const findings: GritApplyFindingEvidence[] = [];
  for (const event of events) {
    switch (event.__typename) {
      case "PatternInfo":
        if (!event.valid) {
          return incomplete(
            "invalid-pattern-info",
            "Grit reported PatternInfo.valid=false for the selected pattern."
          );
        }
        break;
      case "InputFile":
      case "AllDone":
        break;
      case "AnalysisLog":
        if (event.level < 400) {
          return incomplete(
            "analysis-failure",
            `Grit analysis failed at level ${event.level}: ${event.message}`
          );
        }
        break;
      case "Match":
        observedFound += Math.max(1, event.ranges.length);
        findings.push({ kind: "match", path: event.sourceFile });
        break;
      case "Rewrite":
        observedFound += Math.max(1, event.original.ranges.length);
        findings.push({ kind: "rewrite", path: event.original.sourceFile });
        break;
      case "CreateFile":
        observedFound += 1;
        findings.push({ kind: "create-file", path: event.rewritten.sourceFile });
        break;
      case "RemoveFile":
        return incomplete(
          "unproven-remove-file-cardinality",
          "Grit emitted RemoveFile, whose cardinality is not established for the pinned native."
        );
      default:
        assertNeverEvent(event);
    }
  }
  if (terminal.found !== observedFound) {
    return incomplete(
      "count-mismatch",
      `Grit AllDone found ${terminal.found}, but events establish ${observedFound}.`
    );
  }
  return {
    kind: "parsed",
    value: { processed: terminal.processed, found: terminal.found, findings },
  };
}

export interface GritApplyFindingEvidence {
  readonly kind: "match" | "rewrite" | "create-file";
  readonly path: string;
}

function parseFailure(failure: GritParseFailure, detail: string): GritWireParse<never> {
  return { kind: "parse-failed", failure, detail };
}

function incomplete(reason: string, detail: string): GritWireParse<never> {
  return {
    kind: "parsed-incomplete",
    failure: "DiagnosticOutputIncomplete",
    detail: `${reason}: ${detail}`,
  };
}

function renderSchemaErrors(schema: TSchema, value: unknown, label: string) {
  const errors = [...Value.Errors(schema, value)]
    .slice(0, 3)
    .map((error) => `${error.instancePath || "/"}: ${error.message}`)
    .join("; ");
  return `${label} did not match the pinned schema${errors ? `: ${errors}` : "."}`;
}

function assertNeverEvent(event: never): never {
  throw new Error(`Unhandled compact Grit event: ${JSON.stringify(event)}`);
}

export function checkAcquisitionEvidence(
  request: NativeGritSelectedRuleJsonCheckRequest,
  command: DiagnosticCompletedCommandObservation
): GritAcquisitionEvidenceResult<GritCheckAcquisitionEvidence> {
  return validateAcquisitionEvidence(GritCheckAcquisitionEvidenceSchema, { request, command });
}

export function applyAcquisitionEvidence(
  request: NativeGritSelectedRuleApplyDryRunObservationRequest,
  command: DiagnosticCompletedCommandObservation
): GritAcquisitionEvidenceResult<GritApplyAcquisitionEvidence> {
  return validateAcquisitionEvidence(GritApplyAcquisitionEvidenceSchema, { request, command });
}

function validateAcquisitionEvidence<Evidence extends GritAcquisitionEvidence>(
  schema: TSchema,
  evidence: Evidence
): GritAcquisitionEvidenceResult<Evidence> {
  const mismatches = [
    ...mismatch(
      evidence.request.commandInvocationId !== evidence.command.commandId,
      "commandInvocationId"
    ),
    ...mismatch(evidence.request.executable !== evidence.command.executable, "executable"),
    ...mismatch(!arraysEqual(evidence.request.argv, evidence.command.argv), "argv"),
    ...mismatch(evidence.request.cwd !== evidence.command.cwd, "cwd"),
    ...mismatch(!arraysEqual(evidence.request.scanRoots, evidence.command.scanRoots), "scanRoots"),
    ...mismatch(!Value.Check(schema, evidence), "schema"),
  ];
  if (mismatches.length === 0) {
    Value.Parse(schema, evidence);
    return { kind: "accepted", evidence };
  }
  return {
    kind: "failed",
    acquisition: {
      kind: "evidence-mismatch",
      failure: "DiagnosticProviderContractViolation",
      detail: `Completed Grit command evidence did not match its target request: ${mismatches.join(", ")}.`,
      ...evidence,
    },
  };
}

function mismatch(condition: boolean, field: string): readonly string[] {
  if (condition) return [field];
  return [];
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
