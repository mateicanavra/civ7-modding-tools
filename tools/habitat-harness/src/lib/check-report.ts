export type {
  CheckOptions,
  EmitCheckOptions,
  VerifyCheckSummary,
} from "../domains/structural-check/index.js";
export {
  CheckOutcomeSchema,
  checkCommandContext,
  checkOutcomeFromReport,
  HookCheckSummarySchema,
  hookCheckSummary,
  isDiagnosticUnavailableSummary,
  renderCheckReport,
  stringifyCheckReport,
  VerifyCheckSummarySchema,
  verifyCheckSummary,
} from "../domains/structural-check/index.js";
export { describeRuleSelectionFailure } from "./rule-selection.js";
