import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  ApplyDryRunCommandProjectionSchema,
  ApplyTransactionInputProjectionSchema,
  type ApplyAdmissionProjection,
  type ApplyDryRunCommandProjection,
  type ApplyTransactionInputProjection,
} from "../../rules/pattern-governance/index.js";
import { NonEmptyStringSchema } from "./primitives.js";

export const GritDryRunCommandInputSchema = ApplyDryRunCommandProjectionSchema;

const ApplyTransactionInputProjectionFieldsSchema = Type.Omit(ApplyTransactionInputProjectionSchema, [
  "kind",
]);

export const ResolvedTransactionInputSchema = Type.Object(
  {
    kind: Type.Literal("resolved-transaction-input"),
    ...ApplyTransactionInputProjectionFieldsSchema.properties,
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

export type GritDryRunCommandInput = ApplyDryRunCommandProjection;
export type ResolvedTransactionInput = Static<typeof ResolvedTransactionInputSchema>;
export type TransactionInputResolution = Static<typeof TransactionInputResolutionSchema>;

const TransactionInputRegistrySchema = Type.Array(ApplyTransactionInputProjectionSchema);

export function resolveTransactionInput(
  admission: ApplyAdmissionProjection,
  inputs: readonly ApplyTransactionInputProjection[]
): TransactionInputResolution {
  const inputErrors = [...Value.Errors(TransactionInputRegistrySchema, inputs)];
  if (inputErrors.length > 0) {
    return parseResolution({
      kind: "invalid-transaction-input",
      transactionInputRef: admission.transactionInputRef,
      message: inputErrors[0]?.message ?? "Invalid transaction input projection.",
    });
  }

  const registry = Value.Parse(TransactionInputRegistrySchema, inputs);
  const refMatches = registry.filter(
    (input) => input.transactionInputRef === admission.transactionInputRef
  );
  const matched = refMatches.find(
    (input) => input.patternId === admission.patternId && input.manifestPath === admission.manifestPath
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
