import { type Static, Type } from "typebox";

const NonEmptyStringSchema = Type.String({ minLength: 1 });

export const HostRecoveryInstructionSchema = Type.Object(
  {
    ownerId: NonEmptyStringSchema,
    actionKind: Type.Union([
      Type.Literal("command"),
      Type.Literal("documented-workflow"),
      Type.Literal("external-workflow"),
      Type.Literal("unsupported"),
    ]),
    command: Type.Optional(NonEmptyStringSchema),
    documentRef: Type.Optional(NonEmptyStringSchema),
    retryCondition: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const HostPolicyOwnerSchema = Type.Object(
  {
    ownerId: NonEmptyStringSchema,
    displayName: NonEmptyStringSchema,
    owningPackageOrWorkflow: NonEmptyStringSchema,
    recoveryContact: NonEmptyStringSchema,
    aliases: Type.Array(NonEmptyStringSchema),
  },
  { additionalProperties: false }
);

export const HostMatcherSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("prefix"), Type.Literal("exact")]),
    value: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

const hostDeclarationFields = {
  policyId: NonEmptyStringSchema,
  declarationId: NonEmptyStringSchema,
  ownerId: NonEmptyStringSchema,
  recovery: HostRecoveryInstructionSchema,
};

const hostSurfaceFields = {
  ...hostDeclarationFields,
  matcher: HostMatcherSchema,
  mutationLane: Type.Literal("blocked"),
};

export const HostGeneratedSurfaceDeclarationSchema = Type.Object(
  {
    ...hostSurfaceFields,
    kind: Type.Literal("generated-surface"),
    generatedZoneId: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const HostProtectedSurfaceDeclarationSchema = Type.Object(
  {
    ...hostSurfaceFields,
    kind: Type.Literal("protected-surface"),
  },
  { additionalProperties: false }
);

export const HostExternalResourceSurfaceDeclarationSchema = Type.Object(
  {
    ...hostSurfaceFields,
    kind: Type.Literal("external-resource-surface"),
    generatedZoneId: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const HostApplyGateTriggerClassSchema = Type.Union([
  Type.Literal("import-pattern"),
  Type.Literal("path-matcher"),
  Type.Literal("command-family"),
  Type.Literal("transaction-phase"),
]);

export const HostApplyGateDeclarationSchema = Type.Object(
  {
    ...hostDeclarationFields,
    kind: Type.Literal("apply-gate"),
    gateId: NonEmptyStringSchema,
    triggerClass: HostApplyGateTriggerClassSchema,
    gateContract: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const HostProjectSupportStateSchema = Type.Union([
  Type.Literal("supported"),
  Type.Literal("refused"),
  Type.Literal("blocked"),
]);

export const HostProjectSupportDeclarationSchema = Type.Object(
  {
    ...hostDeclarationFields,
    kind: Type.Literal("project-support"),
    requestClass: NonEmptyStringSchema,
    supportState: HostProjectSupportStateSchema,
  },
  { additionalProperties: false }
);

export const UnsupportedHostShapeDeclarationSchema = Type.Object(
  {
    ...hostDeclarationFields,
    kind: Type.Literal("unsupported-host-shape"),
    requestClass: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const HostPolicyDeclarationSchema = Type.Union([
  HostGeneratedSurfaceDeclarationSchema,
  HostProtectedSurfaceDeclarationSchema,
  HostExternalResourceSurfaceDeclarationSchema,
  HostApplyGateDeclarationSchema,
  HostProjectSupportDeclarationSchema,
  UnsupportedHostShapeDeclarationSchema,
]);

export const HostPolicyDocumentSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    policyId: NonEmptyStringSchema,
    owners: Type.Array(HostPolicyOwnerSchema),
    declarations: Type.Array(HostPolicyDeclarationSchema),
  },
  { additionalProperties: false }
);

export const HostPolicySourceStateSchema = Type.Union([
  Type.Literal("declared"),
  Type.Literal("missing"),
  Type.Literal("unavailable"),
  Type.Literal("malformed"),
  Type.Literal("conflicting"),
  Type.Literal("not-applicable"),
]);

export const HostPolicyStateSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("declared"),
      document: HostPolicyDocumentSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Union([
        Type.Literal("missing"),
        Type.Literal("unavailable"),
        Type.Literal("malformed"),
        Type.Literal("conflicting"),
      ]),
      policyId: NonEmptyStringSchema,
      issues: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export const HostSurfaceDecisionSchema = Type.Object(
  {
    kind: Type.Literal("host-surface-decision"),
    policyId: NonEmptyStringSchema,
    declarationId: Type.Optional(NonEmptyStringSchema),
    owner: Type.Optional(HostPolicyOwnerSchema),
    surfaceKind: Type.Union([
      Type.Literal("generated"),
      Type.Literal("protected"),
      Type.Literal("external-resource"),
      Type.Literal("not-host-owned"),
    ]),
    matcher: Type.Optional(HostMatcherSchema),
    mutationLane: Type.Union([
      Type.Literal("allowed"),
      Type.Literal("refused"),
      Type.Literal("blocked"),
    ]),
    recovery: Type.Optional(HostRecoveryInstructionSchema),
    declarationState: HostPolicySourceStateSchema,
  },
  { additionalProperties: false }
);

export const HostApplyGateDecisionSchema = Type.Object(
  {
    kind: Type.Literal("host-apply-gate-decision"),
    gateId: NonEmptyStringSchema,
    policyId: NonEmptyStringSchema,
    declarationId: Type.Optional(NonEmptyStringSchema),
    triggerClass: Type.Optional(HostApplyGateTriggerClassSchema),
    gateContract: Type.Optional(NonEmptyStringSchema),
    recovery: Type.Optional(HostRecoveryInstructionSchema),
    declarationState: HostPolicySourceStateSchema,
  },
  { additionalProperties: false }
);

export const HostProjectSupportDecisionSchema = Type.Object(
  {
    kind: Type.Literal("host-project-support-decision"),
    requestClass: NonEmptyStringSchema,
    supportState: HostProjectSupportStateSchema,
    declarationId: Type.Optional(NonEmptyStringSchema),
    owner: Type.Optional(HostPolicyOwnerSchema),
    noWrite: Type.Literal(true),
    recovery: Type.Optional(HostRecoveryInstructionSchema),
    declarationState: HostPolicySourceStateSchema,
  },
  { additionalProperties: false }
);

export const HostAuthoringBoundaryStateSchema = Type.Object(
  {
    kind: Type.Literal("host-authoring-boundary-state"),
    scenario: NonEmptyStringSchema,
    relation: NonEmptyStringSchema,
    futureOwner: Type.Optional(NonEmptyStringSchema),
    declarationState: HostPolicySourceStateSchema,
  },
  { additionalProperties: false }
);

export type HostRecoveryInstruction = Static<typeof HostRecoveryInstructionSchema>;
export type HostPolicyOwner = Static<typeof HostPolicyOwnerSchema>;
export type HostMatcher = Static<typeof HostMatcherSchema>;
export type HostPolicyDeclaration = Static<typeof HostPolicyDeclarationSchema>;
export type HostPolicyDocument = Static<typeof HostPolicyDocumentSchema>;
export type HostPolicySourceState = Static<typeof HostPolicySourceStateSchema>;
export type HostPolicyState = Static<typeof HostPolicyStateSchema>;
export type HostSurfaceDecision = Static<typeof HostSurfaceDecisionSchema>;
export type HostApplyGateDecision = Static<typeof HostApplyGateDecisionSchema>;
export type HostProjectSupportDecision = Static<typeof HostProjectSupportDecisionSchema>;
export type HostAuthoringBoundaryState = Static<typeof HostAuthoringBoundaryStateSchema>;
