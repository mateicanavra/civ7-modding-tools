export type {
  HabitatConfigService,
  HabitatConfigValue,
  HabitatTimeoutPolicy,
  WorkspaceToolPolicy,
} from "./config/index.js";
export {
  HabitatConfig,
  HabitatConfigLive,
  makeHabitatConfig,
  makeHabitatConfigLayer,
} from "./config/index.js";
export {
  CommandInterrupted,
  CommandUnavailable,
  ConfigUnavailable,
  FileReadFailed,
  FileWriteFailed,
  renderHabitatError,
} from "./errors/index.js";
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
  CheckOptions,
  EmitCheckOptions,
} from "./lib/check-report.js";
export {
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
export { readGitState } from "./lib/git-state.js";
export { runGraph } from "./lib/graph.js";
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
  VerifyBaseResolutionSchema,
  VerifyBaseSchema,
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
export type {
  CommandCachePolicy,
  GritParseStatus,
  HabitatCommandKind,
  HabitatCommandResult,
  HabitatProcessRequest,
} from "./providers/command/index.js";
export {
  makeFakeCommandRunnerLayer,
  makeHabitatCommandResult,
} from "./providers/command/index.js";
export type { GritAdapterFailure, GritAdapterFailureTag } from "./providers/grit/failures.js";
export {
  createGritAdapterFailure,
  GritToolUnavailable,
  gritAdapterFailureTags,
  isGritAdapterFailureTag,
  renderGritAdapterFailure,
} from "./providers/grit/failures.js";
export { type HarnessRule, ruleById, rules } from "./rules/architecture.js";
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
export { HabitatRuntimeLive } from "./runtime/index.js";
