import { type Static, Type } from "typebox";

export const PatternAuthorityLifecycleSchema = Type.Union([
  Type.Literal("candidate"),
  Type.Literal("registered-advisory"),
  Type.Literal("registered-enforced"),
]);

export const PatternAuthorityOwnerToolSchema = Type.Union([
  Type.Literal("grit-check"),
  Type.Literal("grit-apply"),
]);

export const PatternAuthoritySourceKindSchema = Type.Union([
  Type.Literal("frame"),
  Type.Literal("taxonomy"),
  Type.Literal("canonical-doc"),
  Type.Literal("accepted-spec"),
  Type.Literal("adr"),
  Type.Literal("agent-router"),
]);

export const PatternAuthorityProvingSourceKindSchema = Type.Union([
  Type.Literal("native-grit-sample"),
  Type.Literal("current-tree-scan"),
  Type.Literal("injected-violation"),
  Type.Literal("retired-mechanism"),
  Type.Literal("test"),
  Type.Literal("manual-review"),
]);

export const PatternAuthorityCurrentTreeResultClassSchema = Type.Union([
  Type.Literal("zero-findings"),
  Type.Literal("accepted-baseline"),
  Type.Literal("findings-block-registration"),
]);

export const PatternAuthorityBaselineActionSchema = Type.Union([
  Type.Literal("committed-empty"),
  Type.Literal("committed-debt"),
  Type.Literal("blocked"),
]);

export const PatternAuthorityHookDecisionSchema = Type.Union([
  Type.Literal("none"),
  Type.Literal("pre-commit"),
]);

const NonEmptyStringSchema = Type.String({ minLength: 1 });

export const PatternAuthorityApplySafetySchema = Type.Union([
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
      noWriteProof: NonEmptyStringSchema,
      appliedDiffProof: NonEmptyStringSchema,
      rollbackProof: NonEmptyStringSchema,
      typeAndTestProof: NonEmptyStringSchema,
    },
    { additionalProperties: false }
  ),
]);

export const PatternAuthoritySourceSchema = Type.Object(
  {
    kind: PatternAuthoritySourceKindSchema,
    pathOrUrl: NonEmptyStringSchema,
    claim: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const PatternAuthorityProvingSourceSchema = Type.Object(
  {
    kind: PatternAuthorityProvingSourceKindSchema,
    pathOrCommand: NonEmptyStringSchema,
    claim: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const PatternAuthorityManifestBaseSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    ruleId: NonEmptyStringSchema,
    patternName: NonEmptyStringSchema,
    lifecycle: PatternAuthorityLifecycleSchema,
    openspecChangeId: NonEmptyStringSchema,
    ownerProject: NonEmptyStringSchema,
    ownerTool: PatternAuthorityOwnerToolSchema,
  },
  { additionalProperties: false }
);

const CandidatePatternAuthorityManifestFieldsSchema = Type.Object(
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

const RegisteredPatternAuthorityManifestFieldsSchema = Type.Object(
  {
    lifecycle: Type.Union([
      Type.Literal("registered-advisory"),
      Type.Literal("registered-enforced"),
    ]),
    normativeSources: Type.Array(PatternAuthoritySourceSchema, { minItems: 1 }),
    provingSources: Type.Array(PatternAuthorityProvingSourceSchema, { minItems: 1 }),
    language: Type.Object(
      {
        gritLanguage: NonEmptyStringSchema,
        parserVariant: NonEmptyStringSchema,
        officialDocsSource: NonEmptyStringSchema,
        localProofCommand: NonEmptyStringSchema,
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
        resultClass: PatternAuthorityCurrentTreeResultClassSchema,
        evidencePath: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    baselineContract: Type.Object(
      {
        baselinePath: NonEmptyStringSchema,
        ruleIntroductionManifest: NonEmptyStringSchema,
        baselineAction: PatternAuthorityBaselineActionSchema,
      },
      { additionalProperties: false }
    ),
    hookScope: Type.Object(
      {
        decision: PatternAuthorityHookDecisionSchema,
        rationale: NonEmptyStringSchema,
        costAndScopeEvidence: NonEmptyStringSchema,
      },
      { additionalProperties: false }
    ),
    applySafety: PatternAuthorityApplySafetySchema,
  },
  { additionalProperties: false }
);

export const CandidatePatternAuthorityManifestSchema = Type.Interface(
  [Type.Omit(PatternAuthorityManifestBaseSchema, ["lifecycle"])],
  CandidatePatternAuthorityManifestFieldsSchema.properties,
  { additionalProperties: false }
);

export const RegisteredPatternAuthorityManifestSchema = Type.Interface(
  [Type.Omit(PatternAuthorityManifestBaseSchema, ["lifecycle"])],
  RegisteredPatternAuthorityManifestFieldsSchema.properties,
  { additionalProperties: false }
);

export const PatternAuthorityManifestSchema = Type.Union([
  CandidatePatternAuthorityManifestSchema,
  RegisteredPatternAuthorityManifestSchema,
]);

export const PatternAuthorityRuleReferenceSchema = Type.Object(
  {
    ruleId: NonEmptyStringSchema,
    patternName: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    ownerTool: NonEmptyStringSchema,
    lifecycle: Type.Union([Type.Literal("advisory"), Type.Literal("enforced")]),
  },
  { additionalProperties: false }
);

export const PatternAuthorityRuleReferenceInputSchema = Type.Partial(
  PatternAuthorityRuleReferenceSchema,
  { additionalProperties: false }
);

export const PatternAdmissionRefusalReasonSchema = Type.Union([
  Type.Literal("missing-manifest"),
  Type.Literal("malformed-manifest"),
  Type.Literal("placeholder-manifest"),
  Type.Literal("contradicted-manifest"),
  Type.Literal("orphan-manifest"),
  Type.Literal("manifest-invalid-candidate"),
  Type.Literal("grit-metadata-only"),
  Type.Literal("nx-options-only"),
  Type.Literal("missing-d2-governance-facts"),
  Type.Literal("missing-d5-baseline-authority"),
  Type.Literal("baseline-contract-rejected"),
  Type.Literal("missing-d6-diagnostic-identity"),
  Type.Literal("diagnostic-projection-rejected"),
  Type.Literal("missing-fixture-strategy"),
  Type.Literal("missing-false-positive-model"),
  Type.Literal("current-tree-blocks-registration"),
  Type.Literal("hook-scope-mismatch"),
  Type.Literal("apply-safety-missing"),
  Type.Literal("apply-safety-contradicted"),
  Type.Literal("active-artifact-collision"),
  Type.Literal("retired-pattern-referenced"),
  Type.Literal("public-surface-compatibility-missing"),
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

export const CandidatePatternIdentitySchema = Type.Pick(CandidatePatternAuthorityManifestSchema, [
  "ruleId",
  "patternName",
  "openspecChangeId",
  "ownerProject",
  "ownerTool",
]);

export const PatternAuthorityProjectionSchema = Type.Object(
  {
    patternId: NonEmptyStringSchema,
    manifestPath: Type.Optional(NonEmptyStringSchema),
    lifecycle: Type.Union([
      Type.Literal("candidate-draft"),
      Type.Literal("candidate-under-review"),
      Type.Literal("manifest-invalid-candidate"),
      Type.Literal("diagnostic-admitted"),
      Type.Literal("local-feedback-admitted"),
      Type.Literal("apply-admitted"),
      Type.Literal("refused"),
      Type.Literal("retired"),
    ]),
    admittedCapabilities: Type.Array(
      Type.Union([Type.Literal("diagnostic"), Type.Literal("local-feedback"), Type.Literal("apply")])
    ),
    refusalReason: Type.Optional(PatternAdmissionRefusalReasonSchema),
    supersededBy: Type.Optional(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const DiagnosticAdmissionProjectionSchema = Type.Object(
  {
    kind: Type.Literal("diagnostic-admission"),
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    diagnosticIdentity: NonEmptyStringSchema,
    fixtureStrategyRef: NonEmptyStringSchema,
    falsePositiveAssessment: NonEmptyStringSchema,
    currentTreeDisposition: NonEmptyStringSchema,
    nonClaims: Type.Array(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const LocalFeedbackAdmissionProjectionSchema = Type.Object(
  {
    kind: Type.Literal("local-feedback-admission"),
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    eligibility: Type.Literal("eligible"),
    nextOwner: Type.Literal("D11"),
    nonClaims: Type.Array(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const ApplyAdmissionProjectionSchema = Type.Object(
  {
    kind: Type.Literal("apply-admission"),
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    transactionInputRef: NonEmptyStringSchema,
    protectedZoneRef: Type.Optional(NonEmptyStringSchema),
    hostPolicyRef: Type.Optional(NonEmptyStringSchema),
    nonClaims: Type.Array(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const CandidateHandoffProjectionSchema = Type.Object(
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

export const PatternRecoveryProjectionSchema = Type.Object(
  {
    kind: Type.Literal("pattern-recovery"),
    patternId: NonEmptyStringSchema,
    owner: NonEmptyStringSchema,
    reason: PatternAdmissionRefusalReasonSchema,
    nextAction: NonEmptyStringSchema,
    nonClaims: Type.Array(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const PatternRetirementDecisionSchema = Type.Object(
  {
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    reason: NonEmptyStringSchema,
    replacementPatternId: Type.Optional(NonEmptyStringSchema),
    recovery: PatternRecoveryProjectionSchema,
  },
  { additionalProperties: false }
);

export const PatternAuthorityStateSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("candidate-draft"),
      candidate: CandidatePatternAuthorityManifestSchema,
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
      admission: DiagnosticAdmissionProjectionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("local-feedback-admitted"),
      admission: LocalFeedbackAdmissionProjectionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("apply-admitted"),
      admission: ApplyAdmissionProjectionSchema,
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

export type PatternAuthorityLifecycle = Static<typeof PatternAuthorityLifecycleSchema>;
export type PatternAuthorityOwnerTool = Static<typeof PatternAuthorityOwnerToolSchema>;
export type PatternAuthoritySourceKind = Static<typeof PatternAuthoritySourceKindSchema>;
export type PatternAuthorityProvingSourceKind = Static<
  typeof PatternAuthorityProvingSourceKindSchema
>;
export type PatternAuthorityCurrentTreeResultClass = Static<
  typeof PatternAuthorityCurrentTreeResultClassSchema
>;
export type PatternAuthorityBaselineAction = Static<typeof PatternAuthorityBaselineActionSchema>;
export type PatternAuthorityHookDecision = Static<typeof PatternAuthorityHookDecisionSchema>;
export type PatternAuthorityApplySafety = Static<typeof PatternAuthorityApplySafetySchema>;
export type PatternAuthoritySource = Static<typeof PatternAuthoritySourceSchema>;
export type PatternAuthorityProvingSource = Static<typeof PatternAuthorityProvingSourceSchema>;
export type CandidatePatternAuthorityManifest = Static<
  typeof CandidatePatternAuthorityManifestSchema
>;
export type RegisteredPatternAuthorityManifest = Static<
  typeof RegisteredPatternAuthorityManifestSchema
>;
export type PatternAuthorityManifest = Static<typeof PatternAuthorityManifestSchema>;
export type PatternAuthorityRuleReference = Static<typeof PatternAuthorityRuleReferenceSchema>;
export type PatternAuthorityRuleReferenceInput = Static<
  typeof PatternAuthorityRuleReferenceInputSchema
>;
export type PatternAuthorityValidationFailureReason = Static<
  typeof PatternAdmissionRefusalReasonSchema
>;
export type PatternAuthorityValidationIssue = {
  reason: PatternAuthorityValidationFailureReason;
  path: string;
  message: string;
};
export type PatternAdmissionRefusalReason = Static<typeof PatternAdmissionRefusalReasonSchema>;
export type PatternAdmissionRefusal = Static<typeof PatternAdmissionRefusalSchema>;
export type PatternAuthorityProjection = Static<typeof PatternAuthorityProjectionSchema>;
export type DiagnosticAdmissionProjection = Static<typeof DiagnosticAdmissionProjectionSchema>;
export type LocalFeedbackAdmissionProjection = Static<
  typeof LocalFeedbackAdmissionProjectionSchema
>;
export type ApplyAdmissionProjection = Static<typeof ApplyAdmissionProjectionSchema>;
export type CandidateHandoffProjection = Static<typeof CandidateHandoffProjectionSchema>;
export type PatternRecoveryProjection = Static<typeof PatternRecoveryProjectionSchema>;
export type PatternRetirementDecision = Static<typeof PatternRetirementDecisionSchema>;
export type PatternAuthorityState = Static<typeof PatternAuthorityStateSchema>;
