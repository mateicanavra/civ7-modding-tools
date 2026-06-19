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
  RuleIntroductionBaselineManifest,
} from "./lib/baseline.js";
export {
  applyBaseline,
  BaselineApplicationResultSchema,
  BaselineAuthorityResultSchema,
  BaselineAuthorityStateSchema,
  BaselineExpansionDecisionSchema,
  BaselineIntegrityFindingSchema,
  BaselineIntegrityResultSchema,
  BaselineRefusalReasonSchema,
  BaselineRefusalSchema,
  BaselineRuleContractInputSchema,
  baselineFailureDiagnostic,
  checkBaselineIntegrity,
  guardBaselineExpansion,
  isBaselineLocked,
  loadBaseline,
  loadBaselineState,
  mergeBase,
  RuleIntroductionBaselineManifestSchema,
  validateBaselineContract,
  violationKey,
  writeBaseline,
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
export { runHabitatEffect } from "./lib/effect-runtime.js";
export { runFix } from "./lib/fix.js";
export { readGitState } from "./lib/git-state.js";
export { runGraph } from "./lib/graph.js";
export type { GritAdapterFailure, GritAdapterFailureTag } from "./lib/grit-failures.js";
export {
  createGritAdapterFailure,
  gritAdapterFailureTags,
  isGritAdapterFailureTag,
  renderGritAdapterFailure,
} from "./lib/grit-failures.js";
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
export type { VerifyBaseResolution, VerifyOptions, VerifyReceipt } from "./lib/verify/index.js";
export {
  createVerifyReceipt,
  isVerifyReceipt,
  readVerifyTargetPlan,
  resolveVerifyBase,
  runAffectedVerification,
  stringifyVerifyReceipt,
  VerifyBaseSchema,
  VerifyBaseResolutionSchema,
  VerifyCommandRecordSchema,
  VerifyHabitatCheckSummarySchema,
  VerifyNxAffectedSchema,
  VerifyNxCacheTaskSchema,
  VerifyPostStateSchema,
  VerifyReceiptSchema,
  validateVerifyReceipt,
  verifyAffectedTargets,
} from "./lib/verify/index.js";
export type {
  HabitatToolExecutionPlane,
  MaterializedHabitatCommand,
  WorkspaceToolProviderService,
} from "./lib/workspace-tools.js";
export {
  materializeHabitatCommand,
  materializeWorkspaceToolCommand,
  WorkspaceToolProvider,
  WorkspaceToolProviderLive,
} from "./lib/workspace-tools.js";
export { executeRule, type HarnessRule, ruleById, rules } from "./rules/architecture.js";
export type {
  CandidatePatternManifest,
  PatternManifest,
  PatternRuleReference,
  PatternValidationFailureReason,
  PatternValidationIssue,
  PatternValidationOptions,
  PatternValidationResult,
  RegisteredPatternManifest,
} from "./rules/patterns/index.js";
export {
  patternCandidateRoot,
  patternManifestPath,
  patternManifestRoot,
  patternManifestSchemaVersion,
  validatePatternManifest,
} from "./rules/patterns/index.js";
