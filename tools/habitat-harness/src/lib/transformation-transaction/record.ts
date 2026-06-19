import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { ApplyAdmissionProjectionSchema } from "../../rules/pattern-governance/index.js";
import { NonEmptyStringSchema, TransactionNonClaimIdArraySchema } from "./primitives.js";
import { TransformationTransactionRequestSchema } from "./request.js";
import { TransactionRefusalSchema } from "./refusal.js";

const DryRunCommandResultSchema = Type.Object(
  {
    commandId: NonEmptyStringSchema,
    exitCode: Type.Number(),
    interrupted: Type.Boolean(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false }
);

export const TransformationRefusedOutcomeSchema = Type.Object(
  {
    kind: Type.Literal("refused"),
    refusal: TransactionRefusalSchema,
  },
  { additionalProperties: false }
);

export const TransformationDryRunCompletedOutcomeSchema = Type.Object(
  {
    kind: Type.Literal("dry-run-completed"),
    admission: ApplyAdmissionProjectionSchema,
    commandResults: Type.Array(DryRunCommandResultSchema),
    nonClaims: TransactionNonClaimIdArraySchema,
  },
  { additionalProperties: false }
);

export const TransformationOutcomeSchema = Type.Union([
  TransformationRefusedOutcomeSchema,
  TransformationDryRunCompletedOutcomeSchema,
]);

export const TransformationTransactionRecordSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    request: TransformationTransactionRequestSchema,
    outcome: TransformationOutcomeSchema,
  },
  { additionalProperties: false }
);

export type TransformationRefusedOutcome = Static<typeof TransformationRefusedOutcomeSchema>;
export type TransformationDryRunCompletedOutcome = Static<
  typeof TransformationDryRunCompletedOutcomeSchema
>;
export type TransformationOutcome = Static<typeof TransformationOutcomeSchema>;
export type TransformationTransactionRecord = Static<typeof TransformationTransactionRecordSchema>;

export function parseTransformationTransactionRecord(
  value: unknown
): TransformationTransactionRecord {
  return Value.Parse(TransformationTransactionRecordSchema, value);
}
