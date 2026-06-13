export {
  applyBaseline,
  checkBaselineIntegrity,
  loadBaseline,
  mergeBase,
  violationKey,
} from "./lib/baseline.js";
export type {
  CheckReport,
  HabitatDiagnostic,
  HabitatSeverity,
  RuleReport,
} from "./lib/diagnostics.js";
export { validateCheckReport } from "./lib/diagnostics.js";
export { executeRule, type HarnessRule, ruleById, rules } from "./rules/architecture.js";
