export type {
  BaselineContractFailure,
  BaselineContractFailureReason,
  BaselineContractValidation,
  BaselineState,
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
} from "./lib/baseline.js";
export type {
  Classification,
  ClassifiedTarget,
  ClassifyOptions,
  DiffClassification,
  RuleScopeKind,
  ScopedRule,
  UnavailableClassifiedTarget,
} from "./lib/command-engine.js";
export {
  buildHabitatCommand,
  classifyPath,
  classifyTarget,
  commandSummary,
  createCheckReport,
  expandBaselines,
  renderCheckReport,
  resolveVerifyBase,
  runAffectedVerification,
  runFix,
  runGraph,
  runHook,
  selectRules,
  stringifyCheckReport,
} from "./lib/command-engine.js";
export type {
  CheckReport,
  HabitatDiagnostic,
  HabitatSeverity,
  RuleReport,
} from "./lib/diagnostics.js";
export { validateCheckReport } from "./lib/diagnostics.js";
export { effectParityProbeProgram, runEffectParityProbe } from "./lib/effect-parity.js";
export { runHabitatEffect } from "./lib/effect-runtime.js";
export { readGitState } from "./lib/git-state.js";
export { injectedProbeRoot } from "./lib/grit.js";
export type {
  GritApplyRewriteInventoryEntry,
  GritApplyTransactionOptions,
  GritApplyTransactionProof,
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
  AdapterProofArtifact,
  AdapterProofClass,
  WriteAdapterProofArtifactInput,
} from "./lib/proof-artifact.js";
export {
  adapterProofArtifactPath,
  buildAdapterProofArtifact,
  ProofArtifactWriteFailure,
  ProofArtifactWriter,
  ProofArtifactWriterLive,
  writeAdapterProofArtifact,
} from "./lib/proof-artifact.js";
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
