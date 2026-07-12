import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

export const BaselineRefusalReasonSchema = Type.Union([
  Type.Literal("missing-baseline"),
  Type.Literal("malformed-baseline"),
  Type.Literal("unsorted-baseline"),
  Type.Literal("duplicate-baseline-key"),
  Type.Literal("non-string-baseline-key"),
  Type.Literal("orphan-baseline"),
  Type.Literal("external-baseline-without-contract"),
  Type.Literal("baseline-growth-existing-rule"),
  Type.Literal("comparison-base-unavailable"),
  Type.Literal("base-rule-registry-missing"),
  Type.Literal("base-rule-registry-malformed"),
  Type.Literal("base-baseline-unreadable"),
  Type.Literal("parser-owned-baseline-without-contract"),
  Type.Literal("rule-introduction-manifest-missing"),
  Type.Literal("rule-introduction-manifest-malformed"),
  Type.Literal("rule-introduction-manifest-mismatch"),
]);

export const BaselineRefusalSchema = Type.Object(
  {
    kind: Type.Literal("baseline-refusal"),
    ruleId: Type.Optional(Type.String({ minLength: 1 })),
    path: Type.Optional(Type.String({ minLength: 1 })),
    reason: BaselineRefusalReasonSchema,
    message: Type.String({ minLength: 1 }),
    addedKeys: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false }
);

export const BaselineKeyArraySchema = Type.Array(Type.String());

export const ExplicitEmptyBaselineStateSchema = Type.Object(
  {
    kind: Type.Literal("explicit-empty"),
    ruleId: Type.String({ minLength: 1 }),
    path: Type.String({ minLength: 1 }),
    locked: Type.Literal(true),
    keys: Type.Tuple([]),
  },
  { additionalProperties: false }
);

export const ExplicitDebtBaselineStateSchema = Type.Object(
  {
    kind: Type.Literal("explicit-debt"),
    ruleId: Type.String({ minLength: 1 }),
    path: Type.String({ minLength: 1 }),
    locked: Type.Literal(false),
    keys: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

export const AcceptedBaselineAuthorityStateSchema = Type.Union([
  ExplicitEmptyBaselineStateSchema,
  ExplicitDebtBaselineStateSchema,
]);

export const BaselineAuthorityStateSchema = Type.Union([
  AcceptedBaselineAuthorityStateSchema,
  BaselineRefusalSchema,
]);

export const BaselineRuleContractInputSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    exceptionPath: Type.Optional(Type.String({ minLength: 1 })),
    baselinePath: Type.Optional(Type.String({ minLength: 1 })),
    ruleIntroductionManifestPath: Type.Optional(Type.String({ minLength: 1 })),
    ownerProject: Type.Optional(Type.String({ minLength: 1 })),
    runner: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: false }
);

export const RuleIntroductionBaselineManifestSchema = Type.Object(
  {
    changeId: Type.String({ minLength: 1 }),
    ruleId: Type.String({ minLength: 1 }),
    ownerProject: Type.String({ minLength: 1 }),
    runner: Type.String({ minLength: 1 }),
    baselinePath: Type.String({ minLength: 1 }),
    initialBaselineKeys: Type.Array(Type.String()),
    comparisonBase: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const BaselineIntegrityFindingSchema = Type.Object(
  {
    file: Type.String({ minLength: 1 }),
    ruleId: Type.String({ minLength: 1 }),
    addedKeys: Type.Array(Type.String()),
    reason: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false }
);

export const BaselineIntegrityResultSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("accepted"),
      refusals: Type.Tuple([]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("refused"),
      refusals: Type.Array(BaselineRefusalSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export const BaselineExpansionDecisionSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("accepted"),
      ruleId: Type.String({ minLength: 1 }),
      baselinePath: Type.String({ minLength: 1 }),
      keys: Type.Array(Type.String()),
      comparisonBase: Type.String({ minLength: 1 }),
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("refused"),
      refusal: BaselineRefusalSchema,
      message: Type.String({ minLength: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export const BaselineApplicationResultSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("applied"),
      diagnosticsCovered: Type.Number({ minimum: 0 }),
      refusals: Type.Tuple([]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("refused"),
      diagnosticsCovered: Type.Number({ minimum: 0 }),
      refusals: Type.Array(BaselineRefusalSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
]);

export const BaselineAuthorityResultSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("accepted"),
      state: AcceptedBaselineAuthorityStateSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("refused"),
      refusal: BaselineRefusalSchema,
    },
    { additionalProperties: false }
  ),
]);

export type BaselineRefusalReason = Static<typeof BaselineRefusalReasonSchema>;
export type BaselineRefusal = Static<typeof BaselineRefusalSchema>;
export type ExplicitEmptyBaselineState = Static<typeof ExplicitEmptyBaselineStateSchema>;
export type ExplicitDebtBaselineState = Static<typeof ExplicitDebtBaselineStateSchema>;
export type AcceptedBaselineAuthorityState = Static<typeof AcceptedBaselineAuthorityStateSchema>;
export type BaselineAuthorityState = Static<typeof BaselineAuthorityStateSchema>;
export type BaselineRuleContractInput = Static<typeof BaselineRuleContractInputSchema>;
export type RuleIntroductionBaselineManifest = Static<
  typeof RuleIntroductionBaselineManifestSchema
>;
export type BaselineIntegrityFinding = Static<typeof BaselineIntegrityFindingSchema>;
export type BaselineIntegrityResult = Static<typeof BaselineIntegrityResultSchema>;
export type BaselineExpansionDecision = Static<typeof BaselineExpansionDecisionSchema>;
export type BaselineApplicationResult = Static<typeof BaselineApplicationResultSchema>;
export type BaselineAuthorityResult = Static<typeof BaselineAuthorityResultSchema>;

export interface BaselineContractValidation {
  states: Map<string, BaselineAuthorityState>;
  refusals: BaselineRefusal[];
}

export function parseBaselineKeys(value: unknown): string[] {
  return Value.Parse(BaselineKeyArraySchema, value);
}
