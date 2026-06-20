export type {
  BaselineExpansionResult,
  CheckOptions,
  EmitCheckOptions,
  VerifyCheckSummary,
} from "./check/index.js";
export {
  CheckOutcomeSchema,
  checkCommandContext,
  checkOutcomeFromReport,
  createCheckReport,
  expandBaselines,
  HookCheckSummarySchema,
  hookCheckSummary,
  isDiagnosticUnavailableSummary,
  renderCheckReport,
  rulesForExecution,
  stagedPatternScanRoots,
  stringifyCheckReport,
  VerifyCheckSummarySchema,
  verifyCheckSummary,
} from "./check/index.js";
export { describeRuleSelectionFailure } from "./rule-selection.js";
