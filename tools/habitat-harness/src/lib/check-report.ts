export type {
  BaselineExpansionResult,
  CheckOptions,
  EmitCheckOptions,
} from "./check/index.js";
export {
  checkCommandContext,
  createCheckReport,
  expandBaselines,
  renderCheckReport,
  rulesForExecution,
  stagedGritScanRoots,
  stringifyCheckReport,
} from "./check/index.js";
export { describeRuleSelectionFailure } from "./rule-selection.js";
