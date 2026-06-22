import {
  HabitatDiagnosticSchema,
  RuleExecutionDispositionSchema,
  RuleLaneSchema,
  RuleReportSchema,
  SelectorRefusalSchema,
  SelectorRequestSchema,
} from "@internal/habitat-harness/service/model/check/index";
import { type Static, Type } from "typebox";

const RuleIdSchema = Type.String({ minLength: 1 });
const NonEmptyRuleIdsSchema = Type.Array(RuleIdSchema, { minItems: 1 });

export const RuleSelectionOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("selected"),
      selector: SelectorRequestSchema,
      selectedRuleIds: NonEmptyRuleIdsSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("selector-refused"),
      selector: SelectorRequestSchema,
      refusal: SelectorRefusalSchema,
    },
    { additionalProperties: false }
  ),
]);
export type RuleSelectionOutcome = Static<typeof RuleSelectionOutcomeSchema>;

export const RuleExecutionPlanSchema = Type.Object(
  {
    ruleId: RuleIdSchema,
    ownerTool: Type.String({ minLength: 1 }),
    lane: RuleLaneSchema,
    disposition: RuleExecutionDispositionSchema,
  },
  { additionalProperties: false }
);
export type RuleExecutionPlan = Static<typeof RuleExecutionPlanSchema>;

export const DiagnosticConsumptionOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("clean"),
      diagnostics: Type.Array(HabitatDiagnosticSchema, { maxItems: 0 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("findings"),
      diagnostics: Type.Array(HabitatDiagnosticSchema, { minItems: 1 }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("diagnostic-refused"),
      diagnostic: HabitatDiagnosticSchema,
    },
    { additionalProperties: false }
  ),
]);
export type DiagnosticConsumptionOutcome = Static<typeof DiagnosticConsumptionOutcomeSchema>;

export const BaselineApplicationOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("baseline-applied"),
      locked: Type.Boolean(),
      diagnostics: Type.Array(HabitatDiagnosticSchema),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("baseline-refused"),
      diagnostic: HabitatDiagnosticSchema,
    },
    { additionalProperties: false }
  ),
]);
export type BaselineApplicationOutcome = Static<typeof BaselineApplicationOutcomeSchema>;

export const StructuralRuleOutcomeSchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("rule-passed"),
      lane: RuleLaneSchema,
      report: RuleReportSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("rule-failed"),
      lane: RuleLaneSchema,
      report: RuleReportSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("rule-advisory-findings"),
      lane: Type.Literal("advisory"),
      report: RuleReportSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("rule-refused"),
      lane: RuleLaneSchema,
      report: RuleReportSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("rule-not-applicable"),
      lane: RuleLaneSchema,
      report: RuleReportSchema,
    },
    { additionalProperties: false }
  ),
]);
export type StructuralRuleOutcome = Static<typeof StructuralRuleOutcomeSchema>;
