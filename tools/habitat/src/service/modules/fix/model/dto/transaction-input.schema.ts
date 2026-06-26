import { type Static, Type } from "typebox";
import {
  type ApplyDryRunCommand,
  ApplyDryRunCommandSchema,
  ApplyTransactionInputSchema,
} from "./pattern-management.schema.js";
import { NonEmptyStringSchema } from "./shared.schema.js";

export const GritDryRunCommandInputSchema = ApplyDryRunCommandSchema;

const ApplyTransactionInputFieldsSchema = Type.Omit(ApplyTransactionInputSchema, ["kind"]);

export const ResolvedTransactionInputSchema = Type.Object(
  {
    kind: Type.Literal("resolved-transaction-input"),
    ...ApplyTransactionInputFieldsSchema.properties,
  },
  { additionalProperties: false }
);

export const UnresolvedTransactionInputResolutionSchema = Type.Object(
  {
    kind: Type.Literal("unresolved-transaction-input"),
    transactionInputRef: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const MismatchedTransactionInputResolutionSchema = Type.Object(
  {
    kind: Type.Literal("mismatched-transaction-input"),
    patternId: NonEmptyStringSchema,
    manifestPath: NonEmptyStringSchema,
    transactionInputRef: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const InvalidTransactionInputResolutionSchema = Type.Object(
  {
    kind: Type.Literal("invalid-transaction-input"),
    transactionInputRef: NonEmptyStringSchema,
    message: NonEmptyStringSchema,
  },
  { additionalProperties: false }
);

export const TransactionInputResolutionSchema = Type.Union([
  ResolvedTransactionInputSchema,
  UnresolvedTransactionInputResolutionSchema,
  MismatchedTransactionInputResolutionSchema,
  InvalidTransactionInputResolutionSchema,
]);

export const TransactionInputRegistrySchema = Type.Array(ApplyTransactionInputSchema);

export type GritDryRunCommandInput = ApplyDryRunCommand;
export type ResolvedTransactionInput = Static<typeof ResolvedTransactionInputSchema>;
export type TransactionInputResolution = Static<typeof TransactionInputResolutionSchema>;
