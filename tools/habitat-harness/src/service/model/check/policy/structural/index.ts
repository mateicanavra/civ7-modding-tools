export { describeRuleSelectionFailure } from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
export { type BaselineExpansionResult, expandBaselinesEffect } from "./baseline-expansion.js";
export {
  approvedScanRootsForRules,
  executeSelectedRulesEffect,
  rulesForExecution,
  stagedSourceCheckNotApplicableRecords,
  stagedSourceCheckPaths,
} from "./execution.js";
export { renderCheckReport, stringifyCheckReport } from "./render.js";
export { createCheckReportEffect } from "./report.js";
export {
  baselineAuthoringRequest,
  type CheckOptions,
  checkCommandContext,
  type EmitCheckOptions,
  normalizeSelectorRequest,
  structuralCheckRequest,
} from "./request.js";
export type {
  CheckCommandContext,
  CheckOutcome,
  CheckReport,
  HabitatDiagnostic,
  HabitatSeverity,
  HookCheckSummary,
  RuleExecutionDisposition,
  RuleLane,
  RuleReport,
  RuleStatus,
  SelectorRefusal,
  SelectorRequest,
  StructuralCheckRequest,
  VerifyCheckSummary,
} from "./schema.js";
export {
  CheckOutcomeSchema,
  HookCheckSummarySchema,
  VerifyCheckSummarySchema,
  validateCheckReport,
} from "./schema.js";
export { selectorRefusalReport } from "./selection.js";
export {
  makeFakeStructuralCheckLayer,
  StructuralCheck,
  StructuralCheckLive,
  type StructuralCheckService,
} from "./service.js";
export type {
  BaselineApplicationOutcome,
  DiagnosticConsumptionOutcome,
  RuleExecutionPlan,
  RuleSelectionOutcome,
  StructuralRuleOutcome,
} from "./state.js";
export {
  BaselineApplicationOutcomeSchema,
  DiagnosticConsumptionOutcomeSchema,
  RuleExecutionPlanSchema,
  RuleSelectionOutcomeSchema,
  StructuralRuleOutcomeSchema,
} from "./state.js";
export {
  checkOutcomeFromReport,
  hookCheckSummary,
  isDiagnosticUnavailableSummary,
  verifyCheckSummary,
} from "./summaries.js";
