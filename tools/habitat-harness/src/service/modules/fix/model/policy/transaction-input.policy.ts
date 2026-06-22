import { Value } from "typebox/value";
import {
  type ApplyAdmission,
  type ApplyTransactionInput,
} from "../dto/pattern-management.schema.js";
import {
  TransactionInputRegistrySchema,
  type TransactionInputResolution,
  TransactionInputResolutionSchema,
} from "../dto/transaction-input.schema.js";

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
