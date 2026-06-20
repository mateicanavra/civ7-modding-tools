export { applyBaseline, baselineFailureDiagnostic, violationKey } from "./application.js";
export type { BaselineContractContext, RequiredBaselineContext } from "./context.js";
export { mergeBase, resolveBaselineContext } from "./context.js";
export {
  baselineIntegrityFindings,
  checkBaselineIntegrity,
  guardBaselineExpansion,
  writeBaseline,
} from "./integrity.js";
export type {
  BaselineApplicationResult,
  BaselineAuthorityResult,
  BaselineAuthorityState,
  BaselineContractValidation,
  BaselineExpansionDecision,
  BaselineIntegrityFinding,
  BaselineIntegrityResult,
  BaselineRefusal,
  BaselineRefusalReason,
  BaselineRuleContractInput,
  ExplicitDebtBaselineState,
  ExplicitEmptyBaselineState,
  RuleIntroductionBaselineManifest,
} from "./schema.js";
export {
  BaselineApplicationResultSchema,
  BaselineAuthorityResultSchema,
  BaselineAuthorityStateSchema,
  BaselineExpansionDecisionSchema,
  BaselineIntegrityFindingSchema,
  BaselineIntegrityResultSchema,
  BaselineRefusalReasonSchema,
  BaselineRefusalSchema,
  BaselineRuleContractInputSchema,
  RuleIntroductionBaselineManifestSchema,
} from "./schema.js";
export {
  BaselineAuthority,
  BaselineAuthorityLive,
  type BaselineAuthorityService,
  makeFakeBaselineAuthorityLayer,
} from "./service.js";
export {
  baselineAuthorityResult,
  baselinePath,
  isBaselineLocked,
  loadBaseline,
  loadBaselineState,
  parseBaselineArray,
  validateBaselineContract,
} from "./state.js";
