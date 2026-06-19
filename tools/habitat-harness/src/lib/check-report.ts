export type {
  BaselineExpansionResult,
  CheckOptions,
  EmitCheckOptions,
  VerifyCheckSummaryProjection,
} from "./check/index.js";
export {
  CheckOutcomeSchema,
  checkCommandContext,
  checkOutcomeFromReport,
  createCheckReport,
  expandBaselines,
  isDiagnosticUnavailableProjection,
  LocalFeedbackCheckProjectionSchema,
  localFeedbackCheckProjection,
  renderCheckReport,
  rulesForExecution,
  stagedGritScanRoots,
  stringifyCheckReport,
  VerifyCheckSummaryProjectionSchema,
  verifyCheckSummaryProjection,
} from "./check/index.js";
export { describeRuleSelectionFailure } from "./rule-selection.js";
