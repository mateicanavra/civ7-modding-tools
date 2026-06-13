export type {
  HabitatDiagnostic,
  RuleReport,
  CheckReport,
  HabitatSeverity,
} from "./lib/diagnostics.js";
export { validateCheckReport } from "./lib/diagnostics.js";
export { rules, ruleById, executeRule, type HarnessRule } from "./rules/architecture.js";
export {
  loadBaseline,
  violationKey,
  applyBaseline,
  checkBaselineIntegrity,
  mergeBase,
} from "./lib/baseline.js";
