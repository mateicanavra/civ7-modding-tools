import { type Static, type TSchema, Type } from "typebox";

/** Closed reasons why an authored Civ7 setup option could not be captured as detached evidence. */
export const Civ7SetupOptionUnavailableReasonSchema = Type.Union([
  Type.Literal("configuration-api-unavailable"),
  Type.Literal("no-authored-value-key"),
  Type.Literal("overlapping-projection-keys"),
  Type.Literal("read-failed"),
  Type.Literal("value-unavailable"),
  Type.Literal("value-not-snapshotable"),
]);

/** Reason why an authored Civ7 setup option could not produce detached evidence. */
export type Civ7SetupOptionUnavailableReason = Static<
  typeof Civ7SetupOptionUnavailableReasonSchema
>;

/**
 * Defines exact available-or-unavailable evidence for one generated Civ7 setup parameter.
 *
 * The generator calls this with a literal ParameterID and that parameter's canonical value
 * schema, keeping key and value identity correlated in the resulting discriminated union.
 */
export function defineCiv7SetupOptionEvidenceSchema<
  const Key extends string,
  const ValueSchema extends TSchema,
>(key: Key, valueSchema: ValueSchema) {
  return Type.Union([
    Type.Object(
      {
        status: Type.Readonly(Type.Literal("available")),
        key: Type.Readonly(Type.Literal(key)),
        value: Type.Immutable(valueSchema),
      },
      { additionalProperties: false }
    ),
    Type.Object(
      {
        status: Type.Readonly(Type.Literal("unavailable")),
        key: Type.Readonly(Type.Literal(key)),
        reason: Type.Readonly(Civ7SetupOptionUnavailableReasonSchema),
      },
      { additionalProperties: false }
    ),
  ]);
}
