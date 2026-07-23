import {
  type DiagnosticProviderFailureKind,
  DiagnosticProviderFailureKindSchema,
  type DiagnosticScanRootRefusal,
  DiagnosticScanRootRefusalSchema,
  type HabitatDiagnostic,
  HabitatDiagnosticSchema,
  type HabitatSeverity,
} from "@habitat/cli/service/model/diagnostics/index";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export type { HabitatDiagnostic, HabitatSeverity };
export { HabitatDiagnosticSchema };

export const RuleStatusSchema = Type.Union([
  Type.Literal("pass"),
  Type.Literal("fail"),
  Type.Literal("advisory-findings"),
]);
export type RuleStatus = Static<typeof RuleStatusSchema>;

export const RuleLaneSchema = Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]);
export type RuleLane = Static<typeof RuleLaneSchema>;

export const RuleExecutionTimingSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("dedicated"),
      durationMs: Type.Number({ minimum: 0 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("shared"),
      groupId: Type.String({ minLength: 1 }),
      durationMs: Type.Number({ minimum: 0 }),
      ruleCount: Type.Number({ minimum: 1 }),
    },
    { additionalProperties: false }
  ),
]);
export type RuleExecutionTiming = Static<typeof RuleExecutionTimingSchema>;

export const SelectorRefusalSchema = Type.Object(
  {
    reason: Type.Union([
      Type.Literal("unknown-selector"),
      Type.Literal("wrong-selector-namespace"),
      Type.Literal("empty-selection"),
    ]),
    message: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);
export type SelectorRefusal = Static<typeof SelectorRefusalSchema>;

const RuleNotApplicableReasonSchema = Type.Union([
  Type.Literal("rule-not-in-requested-scope"),
  Type.Literal("no-matched-scan-roots"),
]);

const DiagnosticDependencyRefusedSchema = Type.Object(
  {
    kind: Type.Literal("dependency-refused"),
    source: Type.Literal("diagnostic-scan-root"),
    decision: DiagnosticScanRootRefusalSchema,
    detail: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const DiagnosticExecutionFailedSchema = Type.Object(
  {
    kind: Type.Literal("execution-failed"),
    source: Type.Literal("diagnostic-provider"),
    failure: DiagnosticProviderFailureKindSchema,
    detail: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const GitProviderExecutionFailedSchema = Type.Object(
  {
    kind: Type.Literal("execution-failed"),
    source: Type.Literal("git-provider"),
    failure: Type.Literal("visible-path-inventory-unavailable"),
    detail: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const ExecutionFailedSchema = Type.Union([
  DiagnosticExecutionFailedSchema,
  GitProviderExecutionFailedSchema,
]);

export const RuleReportDispositionSchema = Type.Union([
  Type.Object({ kind: Type.Literal("executed") }, { additionalProperties: false }),
  Type.Object(
    {
      kind: Type.Literal("not-applicable"),
      reason: RuleNotApplicableReasonSchema,
    },
    { additionalProperties: false }
  ),
  DiagnosticDependencyRefusedSchema,
  ExecutionFailedSchema,
  Type.Object(
    {
      kind: Type.Literal("selector-refused"),
      refusal: SelectorRefusalSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("baseline-integrity"),
      state: Type.Union([Type.Literal("passed"), Type.Literal("refused")]),
    },
    { additionalProperties: false }
  ),
]);
export type RuleReportDisposition = Static<typeof RuleReportDispositionSchema>;

export const RuleReportSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    runner: Type.String({ minLength: 1 }),
    lane: RuleLaneSchema,
    status: RuleStatusSchema,
    locked: Type.Boolean(),
    durationMs: Type.Number({ minimum: 0 }),
    timing: Type.Optional(RuleExecutionTimingSchema),
    disposition: RuleReportDispositionSchema,
    diagnostics: Type.Array(HabitatDiagnosticSchema),
    message: Type.String(),
    remediate: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false }
);
export type RuleReport = Static<typeof RuleReportSchema>;

export const CheckReportSchema = Type.Object(
  {
    schemaVersion: Type.Literal(2),
    command: Type.String({ minLength: 1 }),
    startedAt: Type.String({ minLength: 1 }),
    ok: Type.Boolean(),
    rules: Type.Array(RuleReportSchema),
  },
  { additionalProperties: false }
);
export type CheckReport = Static<typeof CheckReportSchema>;

export const SelectorRequestSchema = Type.Object(
  {
    owner: Type.Optional(Type.String({ minLength: 1 })),
    rule: Type.Optional(Type.String({ minLength: 1 })),
    rules: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
    runner: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);
export type SelectorRequest = Static<typeof SelectorRequestSchema>;

export const CheckCommandContextSchema = Type.Object(
  {
    bin: Type.Literal("habitat"),
    id: Type.Literal("check"),
    argv: Type.Array(Type.String()),
    serialized: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);
export type CheckCommandContext = Static<typeof CheckCommandContextSchema>;

const BaselineComparisonRequestSchema = Type.Object(
  {
    base: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

const StagedCheckScopeSchema = Type.Object(
  {
    stagedPaths: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false }
);

export const StructuralCheckRequestSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("current-tree-check"),
      selectors: SelectorRequestSchema,
      base: BaselineComparisonRequestSchema,
      command: CheckCommandContextSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("staged-check"),
      selectors: SelectorRequestSchema,
      staged: StagedCheckScopeSchema,
      base: BaselineComparisonRequestSchema,
      command: CheckCommandContextSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("baseline-authoring"),
      selectors: SelectorRequestSchema,
      base: BaselineComparisonRequestSchema,
      command: CheckCommandContextSchema,
    },
    { additionalProperties: false }
  ),
]);
export type StructuralCheckRequest = Static<typeof StructuralCheckRequestSchema>;

export const RuleExecutionDispositionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("executed"),
      durationMs: Type.Number({ minimum: 0 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("not-applicable"),
      reason: RuleNotApplicableReasonSchema,
    },
    { additionalProperties: false }
  ),
  DiagnosticDependencyRefusedSchema,
  ExecutionFailedSchema,
]);
export type RuleExecutionDisposition = Static<typeof RuleExecutionDispositionSchema>;

export const CheckOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("passed"),
      reports: Type.Array(RuleReportSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("failed"),
      reports: Type.Array(RuleReportSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("advisory-only"),
      reports: Type.Array(RuleReportSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("selector-refused"),
      report: RuleReportSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("dependency-refused"),
      reports: Type.Array(RuleReportSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("no-applicable-rules"),
      reports: Type.Array(RuleReportSchema),
    },
    { additionalProperties: false }
  ),
]);
export type CheckOutcome = Static<typeof CheckOutcomeSchema>;

export const HookCheckSummarySchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("pass"),
      Type.Literal("fail"),
      Type.Literal("advisory-only"),
      Type.Literal("selector-refused"),
      Type.Literal("dependency-refused"),
      Type.Literal("diagnostic-unavailable"),
      Type.Literal("execution-failed"),
      Type.Literal("baseline-refused"),
      Type.Literal("not-applicable"),
    ]),
    selectedRuleIds: Type.Array(Type.String()),
    failedRuleIds: Type.Array(Type.String()),
    advisoryRuleIds: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type HookCheckSummary = Static<typeof HookCheckSummarySchema>;

export const VerifyCheckSummarySchema = Type.Object(
  {
    reportSchemaVersion: Type.Literal(2),
    requestedSelectors: SelectorRequestSchema,
    selectedRuleIds: Type.Array(Type.String()),
    selectedRealRuleIds: Type.Array(Type.String()),
    builtInRuleIds: Type.Array(Type.String()),
    statusCounts: Type.Record(Type.String(), Type.Number({ minimum: 0 })),
    advisoryCount: Type.Number({ minimum: 0 }),
    failingCount: Type.Number({ minimum: 0 }),
    refusedCount: Type.Number({ minimum: 0 }),
    notApplicableCount: Type.Number({ minimum: 0 }),
    allowsAffectedExecution: Type.Boolean(),
    skippedAffectedReason: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);
export type VerifyCheckSummary = Static<typeof VerifyCheckSummarySchema>;

export function validateCheckReport(value: unknown): string[] {
  const schemaErrors = Value.Errors(CheckReportSchema, value).map((error) =>
    error.instancePath ? `${error.instancePath}: ${error.message}` : String(error.message)
  );
  if (schemaErrors.length > 0) return schemaErrors;

  const report = Value.Parse(CheckReportSchema, value);
  const dispositionErrors = report.rules.flatMap((rule, index) =>
    validateRuleReportDisposition(rule, index)
  );
  if (dispositionErrors.length > 0) return dispositionErrors;
  const selectorRefusalCount = report.rules.filter(
    (rule) => rule.disposition.kind === "selector-refused"
  ).length;
  if (selectorRefusalCount > 0 && report.rules.length !== 1) {
    return ["/rules: selector-refused disposition must be the sole report row"];
  }
  const hasFailingRule = report.rules.some((rule) => rule.status === "fail");
  if (report.ok && hasFailingRule) return ["ok must be false when any rule status is fail"];
  if (!report.ok && !hasFailingRule) return ["ok must be true when no rule status is fail"];
  return [];
}

function validateRuleReportDisposition(rule: RuleReport, index: number): string[] {
  if (rule.disposition.kind === "baseline-integrity" && rule.lane !== "enforced") {
    return [`/rules/${index}/lane: baseline-integrity disposition requires lane enforced`];
  }
  const expectedStatus = deriveRuleReportStatus(rule);
  if (rule.status === expectedStatus) return [];
  return [
    `/rules/${index}/status: ${rule.disposition.kind} disposition requires status ${expectedStatus}`,
  ];
}

/**
 * Derives public report status from lane, disposition, and diagnostics.
 * Any unbaselined enforced diagnostic fails regardless of provider severity or
 * disposition.
 */
export function deriveRuleReportStatus(
  report: Pick<RuleReport, "lane" | "disposition" | "diagnostics">
): RuleStatus {
  if (
    report.lane === "enforced" &&
    report.diagnostics.some((diagnostic) => !diagnostic.baselined)
  ) {
    return "fail";
  }

  switch (report.disposition.kind) {
    case "dependency-refused":
    case "execution-failed":
    case "selector-refused":
      return "fail";
    case "baseline-integrity":
      return report.disposition.state === "passed" ? "pass" : "fail";
    case "executed":
    case "not-applicable":
      if (report.lane === "advisory") {
        return report.diagnostics.length > 0 ? "advisory-findings" : "pass";
      }
      return "pass";
  }
}

export type { DiagnosticProviderFailureKind, DiagnosticScanRootRefusal };
