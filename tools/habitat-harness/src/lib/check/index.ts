export { renderCheckReport, stringifyCheckReport } from "./render.js";
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
} from "./schema.js";
export { stagedPatternScanRoots } from "./staged-scan-roots.js";
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
