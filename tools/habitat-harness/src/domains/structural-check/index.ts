export { describeRuleSelectionFailure } from "../../domains/rule-selection/index.js";
export { type BaselineExpansionResult, expandBaselinesEffect } from "./baseline-expansion.js";
export {
  approvedScanRootsForRules,
  executeSelectedRulesEffect,
  rulesForExecution,
  stagedPatternScanRoots,
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
