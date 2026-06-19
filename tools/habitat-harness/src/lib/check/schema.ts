import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const HabitatSeveritySchema = Type.Union([Type.Literal("error"), Type.Literal("advisory")]);
export type HabitatSeverity = Static<typeof HabitatSeveritySchema>;

export const HabitatDiagnosticSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    path: Type.String({ minLength: 1 }),
    line: Type.Optional(Type.Number()),
    message: Type.String({ minLength: 1 }),
    severity: HabitatSeveritySchema,
    baselined: Type.Boolean(),
  },
  { additionalProperties: false }
);
export type HabitatDiagnostic = Static<typeof HabitatDiagnosticSchema>;

export const RuleStatusSchema = Type.Union([
  Type.Literal("pass"),
  Type.Literal("fail"),
  Type.Literal("advisory-findings"),
]);
export type RuleStatus = Static<typeof RuleStatusSchema>;

export const RuleLaneSchema = Type.Union([Type.Literal("enforced"), Type.Literal("advisory")]);
export type RuleLane = Static<typeof RuleLaneSchema>;

export const RuleReportSchema = Type.Object(
  {
    ruleId: Type.String({ minLength: 1 }),
    ownerTool: Type.String({ minLength: 1 }),
    lane: RuleLaneSchema,
    status: RuleStatusSchema,
    locked: Type.Boolean(),
    durationMs: Type.Number({ minimum: 0 }),
    diagnostics: Type.Array(HabitatDiagnosticSchema),
    detect: Type.Array(Type.String()),
    message: Type.String(),
    remediate: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false }
);
export type RuleReport = Static<typeof RuleReportSchema>;

export const CheckReportSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
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
    tool: Type.Optional(Type.String({ minLength: 1 })),
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
      reason: Type.Union([
        Type.Literal("staged-scope-no-approved-roots"),
        Type.Literal("rule-not-in-requested-scope"),
      ]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("dependency-refused"),
      owner: Type.Union([
        Type.Literal("rule-registry"),
        Type.Literal("workspace-graph"),
        Type.Literal("baseline-authority"),
        Type.Literal("diagnostic-catalog"),
        Type.Literal("protected-zone-authority"),
      ]),
      reason: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("execution-failed"),
      reason: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
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

export const LocalFeedbackCheckProjectionSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("pass"),
      Type.Literal("fail"),
      Type.Literal("advisory-only"),
      Type.Literal("selector-refused"),
      Type.Literal("dependency-refused"),
      Type.Literal("diagnostic-unavailable"),
      Type.Literal("baseline-refused"),
      Type.Literal("not-applicable"),
    ]),
    selectedRuleIds: Type.Array(Type.String()),
    failedRuleIds: Type.Array(Type.String()),
    advisoryRuleIds: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);
export type LocalFeedbackCheckProjection = Static<typeof LocalFeedbackCheckProjectionSchema>;

export const VerifyCheckSummaryProjectionSchema = Type.Object(
  {
    reportSchemaVersion: Type.Literal(1),
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
export type VerifyCheckSummaryProjection = Static<typeof VerifyCheckSummaryProjectionSchema>;

export function validateCheckReport(value: unknown): string[] {
  const schemaErrors = Value.Errors(CheckReportSchema, value).map((error) =>
    error.instancePath ? `${error.instancePath}: ${error.message}` : String(error.message)
  );
  if (schemaErrors.length > 0) return schemaErrors;

  const report = Value.Parse(CheckReportSchema, value);
  const hasFailingRule = report.rules.some((rule) => rule.status === "fail");
  if (report.ok && hasFailingRule) return ["ok must be false when any rule status is fail"];
  if (!report.ok && !hasFailingRule) return ["ok must be true when no rule status is fail"];
  return [];
}
