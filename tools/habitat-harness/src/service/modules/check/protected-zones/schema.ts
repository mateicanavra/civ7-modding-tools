import {
  HostMatcherSchema,
  HostPolicyOwnerSchema,
  HostRecoveryInstructionSchema,
} from "@internal/habitat-harness/service/modules/check/protection-policy/schema";
import { type Static, Type } from "typebox";

const NonEmptyStringSchema = Type.String({ minLength: 1 });

export const RepoRelativePathSchema = Type.String({
  minLength: 1,
  pattern: "^[A-Za-z0-9_@.+-][A-Za-z0-9._@+-]*(?:/[A-Za-z0-9_@.+-][A-Za-z0-9._@+-]*)*$",
});

export const ProtectedZoneOwnerSchema = Type.Pick(HostPolicyOwnerSchema, [
  "ownerId",
  "displayName",
  "recoveryContact",
]);

export const MutationPathActionSchema = Type.Union([
  Type.Literal("added"),
  Type.Literal("modified"),
  Type.Literal("deleted"),
  Type.Literal("renamed-from"),
  Type.Literal("renamed-to"),
  Type.Literal("copied-from"),
  Type.Literal("copied-to"),
]);

export const MutationSurfaceKindSchema = Type.Union([
  Type.Literal("generated"),
  Type.Literal("protected"),
  Type.Literal("external-resource"),
  Type.Literal("forbidden-artifact"),
]);

export const ProtectedZoneRecoveryInstructionSchema = Type.Union([
  HostRecoveryInstructionSchema,
  Type.Object(
    {
      ownerId: NonEmptyStringSchema,
      actionKind: Type.Literal("remove-artifact"),
      instruction: NonEmptyStringSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ownerId: NonEmptyStringSchema,
      actionKind: Type.Literal("select-approved-scan-root"),
      instruction: NonEmptyStringSchema,
    },
    { additionalProperties: false }
  ),
]);

export const StagedMutationPathSchema = Type.Object(
  {
    path: RepoRelativePathSchema,
    action: MutationPathActionSchema,
  },
  { additionalProperties: false }
);

export const GeneratedSurfaceDeclarationSchema = Type.Object(
  {
    kind: Type.Literal("generated-surface"),
    zoneId: NonEmptyStringSchema,
    declarationId: NonEmptyStringSchema,
    surfaceKind: Type.Union([Type.Literal("generated"), Type.Literal("external-resource")]),
    matcher: HostMatcherSchema,
    owner: ProtectedZoneOwnerSchema,
    recovery: ProtectedZoneRecoveryInstructionSchema,
  },
  { additionalProperties: false }
);

export const ForbiddenArtifactDeclarationSchema = Type.Object(
  {
    kind: Type.Literal("forbidden-artifact"),
    declarationId: NonEmptyStringSchema,
    owner: ProtectedZoneOwnerSchema,
    fileNames: Type.Array(NonEmptyStringSchema, { minItems: 1 }),
    recovery: ProtectedZoneRecoveryInstructionSchema,
  },
  { additionalProperties: false }
);

export const ProtectedSurfaceDeclarationSchema = Type.Object(
  {
    kind: Type.Literal("protected-surface"),
    declarationId: NonEmptyStringSchema,
    surfaceKind: Type.Literal("protected"),
    matcher: HostMatcherSchema,
    owner: ProtectedZoneOwnerSchema,
    recovery: ProtectedZoneRecoveryInstructionSchema,
  },
  { additionalProperties: false }
);

export const DeclarationReadinessSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("ready"),
      declaration: Type.Union([
        GeneratedSurfaceDeclarationSchema,
        ProtectedSurfaceDeclarationSchema,
        ForbiddenArtifactDeclarationSchema,
      ]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("blocked-missing-host-declaration"),
      zoneId: NonEmptyStringSchema,
      ownerId: Type.Literal("host-policy"),
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("blocked-declaration-conflict"),
      zoneId: NonEmptyStringSchema,
      ownerId: Type.Literal("protected-zone-policy"),
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
]);

export const ProtectedMutationDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("not-applicable"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused-direct-generated-edit"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      zoneId: NonEmptyStringSchema,
      surfaceKind: Type.Union([Type.Literal("generated"), Type.Literal("external-resource")]),
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused-direct-protected-edit"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      surfaceKind: Type.Literal("protected"),
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused-forbidden-artifact"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("allowed-generator-write"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      zoneId: NonEmptyStringSchema,
      surfaceKind: Type.Union([Type.Literal("generated"), Type.Literal("external-resource")]),
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("allowed-host-policy-write"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      surfaceKind: Type.Literal("protected"),
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("allowed-transaction-write"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("blocked-missing-host-declaration"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      zoneId: NonEmptyStringSchema,
      ownerId: Type.Literal("host-policy"),
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("blocked-declaration-conflict"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      zoneId: NonEmptyStringSchema,
      ownerId: Type.Literal("protected-zone-policy"),
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
]);

export const ScanRootProtectionDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("accepted"),
      root: RepoRelativePathSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused-generated-output"),
      reason: Type.Literal("generated-output"),
      root: RepoRelativePathSchema,
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("refused-protected-root"),
      reason: Type.Literal("protected-root"),
      root: RepoRelativePathSchema,
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
]);

export const ProtectedMutationGuardSchema = Type.Object(
  {
    kind: Type.Literal("protected-mutation-guard"),
    decisions: Type.Array(ProtectedMutationDecisionSchema),
  },
  { additionalProperties: false }
);

export const TransactionPathDecisionSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("transaction-path-decision"),
      decision: Type.Literal("allowed"),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
      hostPolicyRef: NonEmptyStringSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("transaction-path-decision"),
      decision: Type.Union([Type.Literal("refused"), Type.Literal("blocked")]),
      path: RepoRelativePathSchema,
      action: MutationPathActionSchema,
      owner: ProtectedZoneOwnerSchema,
      recovery: ProtectedZoneRecoveryInstructionSchema,
    },
    { additionalProperties: false }
  ),
]);

export type MutationPathAction = Static<typeof MutationPathActionSchema>;
export type StagedMutationPath = Static<typeof StagedMutationPathSchema>;
export type ProtectedZoneOwner = Static<typeof ProtectedZoneOwnerSchema>;
export type ProtectedZoneRecoveryInstruction = Static<
  typeof ProtectedZoneRecoveryInstructionSchema
>;
export type GeneratedSurfaceDeclaration = Static<typeof GeneratedSurfaceDeclarationSchema>;
export type ForbiddenArtifactDeclaration = Static<typeof ForbiddenArtifactDeclarationSchema>;
export type ProtectedSurfaceDeclaration = Static<typeof ProtectedSurfaceDeclarationSchema>;
export type DeclarationReadiness = Static<typeof DeclarationReadinessSchema>;
export type ProtectedMutationDecision = Static<typeof ProtectedMutationDecisionSchema>;
export type ScanRootProtectionDecision = Static<typeof ScanRootProtectionDecisionSchema>;
export type ProtectedMutationGuard = Static<typeof ProtectedMutationGuardSchema>;
export type TransactionPathDecision = Static<typeof TransactionPathDecisionSchema>;
