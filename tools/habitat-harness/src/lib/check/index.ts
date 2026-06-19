export { type BaselineExpansionResult, expandBaselines } from "./baseline.js";
export {
  executeSelectedRules,
  rulesForExecution,
  stagedGritScanRoots,
} from "./execution.js";
export {
  checkOutcomeFromReport,
  isDiagnosticUnavailableProjection,
  localFeedbackCheckProjection,
  verifyCheckSummaryProjection,
} from "./projections.js";
export { renderCheckReport, stringifyCheckReport } from "./render.js";
export { createCheckReport } from "./report.js";
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
  LocalFeedbackCheckProjection,
  RuleExecutionDisposition,
  RuleLane,
  RuleReport,
  RuleStatus,
  SelectorRefusal,
  SelectorRequest,
  StructuralCheckRequest,
  VerifyCheckSummaryProjection,
} from "./schema.js";
export {
  CheckOutcomeSchema,
  LocalFeedbackCheckProjectionSchema,
  VerifyCheckSummaryProjectionSchema,
} from "./schema.js";
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
