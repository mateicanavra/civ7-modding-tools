import { type Static, Type } from "typebox";
import { NonEmptyStringSchema, TransactionNonClaimIdArraySchema } from "./primitives.js";

export const TransformationRefusalReasonSchema = Type.Union([
  Type.Literal("missing-apply-admission"),
  Type.Literal("apply-admission-refused"),
  Type.Literal("diagnostic-admission-only"),
  Type.Literal("missing-transaction-input"),
  Type.Literal("invalid-transaction-input"),
  Type.Literal("transaction-input-admission-mismatch"),
  Type.Literal("transaction-input-command-failed"),
  Type.Literal("dirty-worktree"),
  Type.Literal("invalid-request-mode"),
  Type.Literal("missing-protected-zone-decision"),
  Type.Literal("protected-zone-refused"),
  Type.Literal("missing-host-policy-decision"),
  Type.Literal("host-apply-gate-refused"),
  Type.Literal("write-path-outside-approved-set"),
  Type.Literal("write-action-not-admitted"),
  Type.Literal("formatter-handoff-not-declared"),
  Type.Literal("gate-handoff-not-declared"),
  Type.Literal("public-surface-compatibility-missing"),
]);

export const RecoveryInstructionSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("provide-apply-admission"),
      Type.Literal("provide-transaction-input"),
      Type.Literal("provide-protected-zone-decision"),
      Type.Literal("provide-host-policy-decision"),
      Type.Literal("inspect-worktree"),
      Type.Literal("inspect-dry-run-output"),
    ]),
    message: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const TransactionRefusalSchema = Type.Object(
  {
    reason: TransformationRefusalReasonSchema,
    message: NonEmptyStringSchema,
    recovery: Type.Array(RecoveryInstructionSchema, { minItems: 1 }),
    nonClaims: TransactionNonClaimIdArraySchema,
  },
  { additionalProperties: false }
);

export type TransformationRefusalReason = Static<typeof TransformationRefusalReasonSchema>;
export type RecoveryInstruction = Static<typeof RecoveryInstructionSchema>;
export type TransactionRefusal = Static<typeof TransactionRefusalSchema>;
