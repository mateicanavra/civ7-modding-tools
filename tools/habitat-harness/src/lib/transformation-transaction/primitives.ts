import { Type } from "typebox";

export const NonEmptyStringSchema = Type.String({ minLength: 1 });

export const TransactionNonClaimIdSchema = Type.Union([
  Type.Literal("does-not-run-grit"),
  Type.Literal("does-not-write-files"),
  Type.Literal("does-not-authorize-live-write"),
  Type.Literal("does-not-prove-apply-safety"),
]);

export const TransactionNonClaimIdArraySchema = Type.Array(TransactionNonClaimIdSchema, {
  minItems: 1,
});
