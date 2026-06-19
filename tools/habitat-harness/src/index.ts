export type {
  BaselineApplicationResult,
  BaselineAuthorityProjection,
  BaselineAuthorityState,
  BaselineContractValidation,
  BaselineExpansionDecision,
  BaselineIntegrityFinding,
  BaselineIntegrityResult,
  BaselineRefusal,
  BaselineRefusalReason,
  BaselineRuleContractInput,
  ExternalExceptionSource,
  RuleIntroductionBaselineManifest,
} from "./lib/baseline.js";
export {
  applyBaseline,
  baselineFailureDiagnostic,
  checkBaselineIntegrity,
  guardBaselineExpansion,
  isBaselineLocked,
  loadBaseline,
  loadBaselineState,
  mergeBase,
  validateBaselineContract,
  violationKey,
  writeBaseline,
} from "./lib/baseline.js";
export {
  BaselineApplicationResultSchema,
  BaselineAuthorityProjectionSchema,
  BaselineAuthorityStateSchema,
  BaselineExpansionDecisionSchema,
  BaselineIntegrityFindingSchema,
  BaselineIntegrityResultSchema,
  BaselineRefusalReasonSchema,
  BaselineRefusalSchema,
  BaselineRuleContractInputSchema,
  ExternalExceptionSourceSchema,
  RuleIntroductionBaselineManifestSchema,
} from "./lib/baseline.js";
export type {
  BaselineExpansionResult,
  CheckOptions,
  EmitCheckOptions,
} from "./lib/check-report.js";
export {
  createCheckReport,
  expandBaselines,
  renderCheckReport,
  stringifyCheckReport,
} from "./lib/check-report.js";
export type {
  ClassifiedTarget,
  ClassifyOptions,
  ClassifyResult,
  PathClassification,
  RuleCoverageKind,
  RuleRouting,
  UnavailableClassifiedTarget,
} from "./lib/classify.js";
export {
  classifyPath,
  classifyPathResult,
  classifyTarget,
  classifyTargetResult,
  commandSummary,
  stringifyClassifyResult,
  validateClassifyResult,
} from "./lib/classify.js";
export type {
  CheckReport,
  HabitatDiagnostic,
  HabitatSeverity,
  RuleReport,
} from "./lib/diagnostics.js";
export { validateCheckReport } from "./lib/diagnostics.js";
export { effectParityProbeProgram, runEffectParityProbe } from "./lib/effect-parity.js";
export { runHabitatEffect } from "./lib/effect-runtime.js";
export type { FixOptions } from "./lib/fix.js";
export { runFix } from "./lib/fix.js";
export { readGitState } from "./lib/git-state.js";
export { runGraph } from "./lib/graph.js";
export { injectedProbeRoot } from "./lib/grit.js";
export type {
  GritApplyRewriteInventoryEntry,
  GritApplyTransactionOptions,
  GritApplyTransactionRecord,
  GritApplyTransactionResult,
} from "./lib/grit-apply.js";
export {
  classifyApplyRewriteInventory,
  parseApplyRewriteInventory,
  runGritApplyTransaction,
} from "./lib/grit-apply.js";
export type { GritAdapterFailure, GritAdapterFailureTag } from "./lib/grit-failures.js";
export {
  createGritAdapterFailure,
  gritAdapterFailureTags,
  isGritAdapterFailureTag,
  renderGritAdapterFailure,
} from "./lib/grit-failures.js";
export type {
  InjectedGritProbeFailure,
  InjectedGritProbeInput,
  InjectedGritProbeResult,
  InjectedProbeScope,
} from "./lib/grit-injected-probe.js";
export {
  injectedGritProbeProgram,
  runInjectedGritProbe,
} from "./lib/grit-injected-probe.js";
export type {
  CommandCachePolicy,
  GritParseStatus,
  HabitatCommandKind,
  HabitatCommandResult,
  HabitatProcessRequest,
} from "./lib/habitat-process.js";
export {
  GritToolUnavailable,
  HabitatProcess,
  HabitatProcessLive,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
} from "./lib/habitat-process.js";
export type {
  RuleSelection,
  RuleSelectionEmptyIntersection,
  RuleSelectionFailureReason,
  RuleSelectionResult,
  RuleSelectorFact,
  RuleSelectorKind,
} from "./lib/rule-selection.js";
export { describeRuleSelectionFailure, selectRules } from "./lib/rule-selection.js";
export type { VerifyNonClaimId, VerifyOptions, VerifyReceipt } from "./lib/verify-receipt.js";
export {
  createVerifyReceipt,
  isVerifyReceipt,
  resolveVerifyBase,
  runAffectedVerification,
  stringifyVerifyReceipt,
  validateVerifyReceipt,
  VerifyBaseSchema,
  VerifyCommandRecordSchema,
  VerifyHabitatCheckSummarySchema,
  VerifyNonClaimIdSchema,
  VerifyNxAffectedSchema,
  VerifyNxCacheTaskSchema,
  VerifyPostStateSchema,
  VerifyReceiptSchema,
  verifyAffectedTargets,
} from "./lib/verify-receipt.js";
export type {
  HabitatToolExecutionPlane,
  MaterializedHabitatCommand,
} from "./lib/workspace-tools.js";
export { materializeHabitatCommand } from "./lib/workspace-tools.js";
export { executeRule, type HarnessRule, ruleById, rules } from "./rules/architecture.js";
export type {
  CandidatePatternAuthorityManifest,
  PatternAuthorityManifest,
  PatternAuthorityRuleReference,
  PatternAuthorityValidationFailureReason,
  PatternAuthorityValidationIssue,
  PatternAuthorityValidationOptions,
  PatternAuthorityValidationResult,
  RegisteredPatternAuthorityManifest,
} from "./rules/pattern-authority/manifest.js";
export {
  patternAuthorityCandidateRoot,
  patternAuthorityManifestPath,
  patternAuthorityManifestRoot,
  patternAuthorityManifestSchemaVersion,
  validatePatternAuthorityManifest,
} from "./rules/pattern-authority/manifest.js";
