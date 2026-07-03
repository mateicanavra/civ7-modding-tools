import { type Static, Type } from "typebox";

export const PatternLifecycleSchema = Type.Union([
  Type.Literal("candidate"),
  Type.Literal("registered-advisory"),
  Type.Literal("registered-enforced"),
]);

export const PatternOwnerToolSchema = Type.Union([
  Type.Literal("pattern-check"),
  Type.Literal("pattern-apply"),
]);

export const PatternSourceKindSchema = Type.Union([
  Type.Literal("frame"),
  Type.Literal("taxonomy"),
  Type.Literal("canonical-doc"),
  Type.Literal("accepted-spec"),
  Type.Literal("adr"),
  Type.Literal("agent-router"),
]);

export const PatternCurrentTreeResultClassSchema = Type.Union([
  Type.Literal("zero-findings"),
  Type.Literal("accepted-baseline"),
  Type.Literal("findings-block-registration"),
]);

export const PatternBaselineActionSchema = Type.Union([
  Type.Literal("committed-empty"),
  Type.Literal("committed-debt"),
  Type.Literal("blocked"),
]);

const NonEmptyStringSchema = Type.String({ minLength: 1 });
export const RepoRelativePathSchema = Type.String({
  minLength: 1,
  pattern: "^[A-Za-z0-9_@+-][A-Za-z0-9._@+-]*(?:/[A-Za-z0-9_@+-][A-Za-z0-9._@+-]*)*$",
});
export const ApplyPatternPathSchema = Type.String({
  minLength: 1,
  pattern: "^\\.habitat/patterns/apply/[A-Za-z0-9_-]+(?:/[A-Za-z0-9_-]+)*\\.md$",
});

export const PatternApplySafetySchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("not-apply"),
      rationale: NonEmptyStringSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("apply"),
      dryRunCommand: NonEmptyStringSchema,
    },
    { additionalProperties: false }
  ),
]);

export const PatternSourceSchema = Type.Object(
  {
    kind: PatternSourceKindSchema,
    pathOrUrl: NonEmptyStringSchema,
    summary: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const PatternManifestBaseSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    ruleId: NonEmptyStringSchema,
    patternName: NonEmptyStringSchema,
    lifecycle: PatternLifecycleSchema,
    openspecChangeId: NonEmptyStringSchema,
    ownerProject: NonEmptyStringSchema,
    ownerTool: PatternOwnerToolSchema,
  },
  { additionalProperties: false }
);

const CandidatePatternManifestFieldsSchema = Type.Object(
  {
    lifecycle: Type.Literal("candidate"),
    candidateArtifacts: Type.Object(
      {
        patternPath: NonEmptyStringSchema,
        manifestPath: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    registration: Type.Object(
      {
        accepted: Type.Literal(false),
        reason: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    requiredForRegistration: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
  },
  { additionalProperties: false }
);

const RegisteredPatternManifestFieldsSchema = Type.Object(
  {
    lifecycle: Type.Union([
      Type.Literal("registered-advisory"),
      Type.Literal("registered-enforced"),
    ]),
    normativeSources: Type.Array(PatternSourceSchema, { minItems: 1 }),
    language: Type.Object(
      {
        gritLanguage: NonEmptyStringSchema,
        parserVariant: NonEmptyStringSchema,
        officialDocsSource: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    scanRoots: Type.Object(
      {
        include: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
        exclude: Type.Array(NonEmptyStringSchema),
        gritignorePolicy: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    fixtureStrategy: Type.Object(
      {
        positive: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
        negative: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
        parserEdge: Type.Array(NonEmptyStringSchema),
        falsePositive: Type.Array(NonEmptyStringSchema),
      },
      { additionalProperties: false }
    ),
    falsePositiveModel: Type.Object(
      {
        risk: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
        controls: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
        suppressionPolicy: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    currentTreeScan: Type.Object(
      {
        command: NonEmptyStringSchema,
        resultClass: PatternCurrentTreeResultClassSchema,
      },
      { additionalProperties: false }
    ),
    baselineContract: Type.Object(
      {
        baselinePath: NonEmptyStringSchema,
        ruleIntroductionManifest: NonEmptyStringSchema,
        baselineAction: PatternBaselineActionSchema,
      },
      { additionalProperties: false }
    ),
    applySafety: PatternApplySafetySchema,
  },
  { additionalProperties: false }
);

export const CandidatePatternManifestSchema = Type.Interface(
  [Type.Omit(PatternManifestBaseSchema, ["lifecycle"])],
  CandidatePatternManifestFieldsSchema.properties,
  { additionalProperties: false }
);

export const RegisteredPatternManifestSchema = Type.Interface(
  [Type.Omit(PatternManifestBaseSchema, ["lifecycle"])],
  RegisteredPatternManifestFieldsSchema.properties,
  { additionalProperties: false }
);

export const PatternManifestSchema = Type.Union([
  CandidatePatternManifestSchema,
  RegisteredPatternManifestSchema,
]);

export const PatternRuleReferenceSchema = Type.Object(
  {
    ruleId: NonEmptyStringSchema,
    patternName: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    ownerTool: NonEmptyStringSchema,
    lifecycle: Type.Union([Type.Literal("advisory"), Type.Literal("enforced")]),
  },
  { additionalProperties: false }
);

export const PatternRuleReferenceInputSchema = Type.Partial(PatternRuleReferenceSchema, {
  additionalProperties: false,
});

export const PatternAdmissionRefusalReasonSchema = Type.Union([
  Type.Literal("missing-manifest"),
  Type.Literal("malformed-manifest"),
  Type.Literal("placeholder-manifest"),
  Type.Literal("contradicted-manifest"),
  Type.Literal("orphan-manifest"),
  Type.Literal("manifest-invalid-candidate"),
  Type.Literal("metadata-only"),
  Type.Literal("nx-options-only"),
  Type.Literal("missing-rule-management"),
  Type.Literal("missing-baseline-contract"),
  Type.Literal("baseline-contract-rejected"),
  Type.Literal("missing-diagnostic-identity"),
  Type.Literal("diagnostic-input-rejected"),
  Type.Literal("missing-fixture-strategy"),
  Type.Literal("missing-false-positive-model"),
  Type.Literal("current-tree-blocks-registration"),
  Type.Literal("apply-safety-missing"),
  Type.Literal("apply-safety-contradicted"),
  Type.Literal("active-artifact-collision"),
  Type.Literal("retired-pattern-referenced"),
  Type.Literal("public-contract-missing"),
]);

export const PatternAdmissionRefusalSchema = Type.Object(
  {
    kind: Type.Literal("pattern-admission-refusal"),
    reason: PatternAdmissionRefusalReasonSchema,
    patternId: Type.Optional(NonEmptyStringSchema),
    path: NonEmptyStringSchema,
    message: NonEmptyStringSchema,
    protectedPaths: Type.Array(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const CandidatePatternIdentitySchema = Type.Pick(CandidatePatternManifestSchema, [
  "ruleId",
  "patternName",
  "openspecChangeId",
  "ownerProject",
  "ownerTool",
]);

export const PatternViewSchema = Type.Object(
  {
    patternId: NonEmptyStringSchema,
    manifestPath: Type.Optional(NonEmptyStringSchema),
    lifecycle: Type.Union([
      Type.Literal("candidate-draft"),
      Type.Literal("candidate-under-review"),
      Type.Literal("manifest-invalid-candidate"),
      Type.Literal("diagnostic-admitted"),
      Type.Literal("apply-admitted"),
      Type.Literal("refused"),
      Type.Literal("retired"),
    ]),
    admittedCapabilities: Type.Array(
      Type.Union([Type.Literal("diagnostic"), Type.Literal("apply")])
    ),
    refusalReason: Type.Optional(PatternAdmissionRefusalReasonSchema),
    supersededBy: Type.Optional(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const DiagnosticAdmissionSchema = Type.Object(
  {
    kind: Type.Literal("diagnostic-admission"),
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    diagnosticIdentity: NonEmptyStringSchema,
    fixtureStrategyRef: NonEmptyStringSchema,
    falsePositiveAssessment: NonEmptyStringSchema,
    currentTreeDisposition: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const ApplyDryRunOutputModeSchema = Type.Union([
  Type.Literal("compact"),
  Type.Literal("standard"),
]);

export const ApplyAdmissionSchema = Type.Object(
  {
    kind: Type.Literal("apply-admission"),
    patternId: NonEmptyStringSchema,
    manifestPath: ApplyPatternPathSchema,
    transactionInputRef: NonEmptyStringSchema,
    transactionInputRuleIds: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
    protectedZoneRef: Type.Optional(NonEmptyStringSchema),
    hostPolicyRef: Type.Optional(NonEmptyStringSchema),
    dryRunOutput: ApplyDryRunOutputModeSchema,
  },
  { additionalProperties: false }
);

export const ApplyDryRunCommandSchema = Type.Object(
  {
    kind: Type.Literal("dry-run-command"),
    commandId: NonEmptyStringSchema,
    patternPath: ApplyPatternPathSchema,
    roots: Type.Array(RepoRelativePathSchema, { minItems: 1 }),
    output: ApplyDryRunOutputModeSchema,
  },
  { additionalProperties: false }
);

export const ApplyTransactionInputSchema = Type.Object(
  {
    kind: Type.Literal("apply-transaction-input"),
    patternId: NonEmptyStringSchema,
    manifestPath: ApplyPatternPathSchema,
    transactionInputRef: NonEmptyStringSchema,
    dryRunCommands: Type.Array(ApplyDryRunCommandSchema),
  },
  { additionalProperties: false }
);

export const CandidateHandoffSchema = Type.Object(
  {
    kind: Type.Literal("candidate-handoff"),
    patternId: NonEmptyStringSchema,
    candidatePaths: Type.Object(
      {
        patternPath: NonEmptyStringSchema,
        manifestPath: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    registrationPrerequisites: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
    refusal: Type.Optional(PatternAdmissionRefusalSchema),
  },
  { additionalProperties: false }
);

export const PatternRecoverySchema = Type.Object(
  {
    kind: Type.Literal("pattern-recovery"),
    patternId: NonEmptyStringSchema,
    reason: PatternAdmissionRefusalReasonSchema,
    nextAction: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const PatternRetirementDecisionSchema = Type.Object(
  {
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    reason: NonEmptyStringSchema,
    replacementPatternId: Type.Optional(NonEmptyStringSchema),
    recovery: PatternRecoverySchema,
  },
  { additionalProperties: false }
);

export const PatternStateSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("candidate-draft"),
      candidate: CandidatePatternManifestSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("candidate-under-review"),
      candidate: CandidatePatternIdentitySchema,
      missingInputs: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("manifest-invalid-candidate"),
      refusal: PatternAdmissionRefusalSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("diagnostic-admitted"),
      admission: DiagnosticAdmissionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("apply-admitted"),
      admission: ApplyAdmissionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused"),
      refusal: PatternAdmissionRefusalSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("retired"),
      retirement: PatternRetirementDecisionSchema,
    },
    { additionalProperties: false }
  ),
]);

export type PatternLifecycle = Static<typeof PatternLifecycleSchema>;
export type PatternOwnerTool = Static<typeof PatternOwnerToolSchema>;
export type PatternSourceKind = Static<typeof PatternSourceKindSchema>;
export type PatternCurrentTreeResultClass = Static<typeof PatternCurrentTreeResultClassSchema>;
export type PatternBaselineAction = Static<typeof PatternBaselineActionSchema>;
export type PatternApplySafety = Static<typeof PatternApplySafetySchema>;
export type PatternSource = Static<typeof PatternSourceSchema>;
export type CandidatePatternManifest = Static<typeof CandidatePatternManifestSchema>;
export type RegisteredPatternManifest = Static<typeof RegisteredPatternManifestSchema>;
export type PatternManifest = Static<typeof PatternManifestSchema>;
export type PatternRuleReference = Static<typeof PatternRuleReferenceSchema>;
export type PatternRuleReferenceInput = Static<typeof PatternRuleReferenceInputSchema>;
export type PatternValidationFailureReason = Static<typeof PatternAdmissionRefusalReasonSchema>;
export type PatternValidationIssue = {
  reason: PatternValidationFailureReason;
  path: string;
  message: string;
};
export type PatternAdmissionRefusalReason = Static<typeof PatternAdmissionRefusalReasonSchema>;
export type PatternAdmissionRefusal = Static<typeof PatternAdmissionRefusalSchema>;
export type PatternView = Static<typeof PatternViewSchema>;
export type DiagnosticAdmission = Static<typeof DiagnosticAdmissionSchema>;
export type ApplyAdmission = Static<typeof ApplyAdmissionSchema>;
export type ApplyDryRunCommand = Static<typeof ApplyDryRunCommandSchema>;
export type ApplyTransactionInput = Static<typeof ApplyTransactionInputSchema>;
export type CandidateHandoff = Static<typeof CandidateHandoffSchema>;
export type PatternRecovery = Static<typeof PatternRecoverySchema>;
export type PatternRetirementDecision = Static<typeof PatternRetirementDecisionSchema>;
export type PatternState = Static<typeof PatternStateSchema>;
