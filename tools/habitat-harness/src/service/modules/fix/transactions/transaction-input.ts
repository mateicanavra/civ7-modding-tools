import {
  type ApplyAdmission,
  type ApplyDryRunCommand,
  ApplyDryRunCommandSchema,
  type ApplyTransactionInput,
  ApplyTransactionInputSchema,
} from "@internal/habitat-harness/service/modules/fix/patterns/index";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { NonEmptyStringSchema } from "./primitives.js";

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

export type GritDryRunCommandInput = ApplyDryRunCommand;
export type ResolvedTransactionInput = Static<typeof ResolvedTransactionInputSchema>;
export type TransactionInputResolution = Static<typeof TransactionInputResolutionSchema>;

const TransactionInputRegistrySchema = Type.Array(ApplyTransactionInputSchema);

export function resolveTransactionInput(
  admission: ApplyAdmission,
  inputs: readonly ApplyTransactionInput[]
): TransactionInputResolution {
  const inputErrors = [...Value.Errors(TransactionInputRegistrySchema, inputs)];
  if (inputErrors.length > 0) {
    return parseResolution({
      kind: "invalid-transaction-input",
      transactionInputRef: admission.transactionInputRef,
      message: inputErrors[0]?.message ?? "Invalid transaction contract.",
    });
  }

  const registry = Value.Parse(TransactionInputRegistrySchema, inputs);
  const refMatches = registry.filter(
    (input) => input.transactionInputRef === admission.transactionInputRef
  );
  const matched = refMatches.find(
    (input) =>
      input.patternId === admission.patternId && input.manifestPath === admission.manifestPath
  );

  if (matched) {
    return parseResolution({
      ...matched,
      kind: "resolved-transaction-input",
    });
  }

  if (refMatches.length > 0) {
    return parseResolution({
      kind: "mismatched-transaction-input",
      patternId: admission.patternId,
      manifestPath: admission.manifestPath,
      transactionInputRef: admission.transactionInputRef,
    });
  }

  return parseResolution({
    kind: "unresolved-transaction-input",
    transactionInputRef: admission.transactionInputRef,
  });
}

function parseResolution(value: unknown): TransactionInputResolution {
  return Value.Parse(TransactionInputResolutionSchema, value);
}
