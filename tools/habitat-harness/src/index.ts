export {
  applyBaseline,
  checkBaselineIntegrity,
  loadBaseline,
  mergeBase,
  violationKey,
} from "./lib/baseline.js";
export {
  buildHabitatCommand,
  classifyPath,
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
export { runHabitatEffect } from "./lib/effect-runtime.js";
export { effectParityProbeProgram, runEffectParityProbe } from "./lib/effect-parity.js";
export {
  createGritAdapterFailure,
  gritAdapterFailureTags,
  isGritAdapterFailureTag,
  renderGritAdapterFailure,
} from "./lib/grit-failures.js";
export {
  classifyApplyRewriteInventory,
  parseApplyRewriteInventory,
  runGritApplyTransaction,
} from "./lib/grit-apply.js";
export type {
  GritApplyRewriteInventoryEntry,
  GritApplyTransactionOptions,
  GritApplyTransactionProof,
  GritApplyTransactionResult,
} from "./lib/grit-apply.js";
export {
  injectedGritProbeProgram,
  runInjectedGritProbe,
} from "./lib/grit-injected-probe.js";
export {
  HabitatProcess,
  HabitatProcessLive,
  GritToolUnavailable,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
} from "./lib/habitat-process.js";
export { readGitState } from "./lib/git-state.js";
export {
  adapterProofArtifactPath,
  buildAdapterProofArtifact,
  ProofArtifactWriter,
  ProofArtifactWriterLive,
  ProofArtifactWriteFailure,
  writeAdapterProofArtifact,
} from "./lib/proof-artifact.js";
export { materializeHabitatCommand } from "./lib/workspace-tools.js";
export type { GritAdapterFailure, GritAdapterFailureTag } from "./lib/grit-failures.js";
export type {
  InjectedGritProbeFailure,
  InjectedGritProbeInput,
  InjectedGritProbeResult,
  InjectedProbeScope,
} from "./lib/grit-injected-probe.js";
export type {
  CommandCachePolicy,
  GritParseStatus,
  HabitatCommandKind,
  HabitatCommandResult,
  HabitatProcessRequest,
} from "./lib/habitat-process.js";
export type {
  HabitatToolExecutionPlane,
  MaterializedHabitatCommand,
} from "./lib/workspace-tools.js";
export type {
  AdapterProofArtifact,
  AdapterProofClass,
  WriteAdapterProofArtifactInput,
} from "./lib/proof-artifact.js";
export type {
  CheckReport,
  HabitatDiagnostic,
  HabitatSeverity,
  RuleReport,
} from "./lib/diagnostics.js";
export { validateCheckReport } from "./lib/diagnostics.js";
export { executeRule, type HarnessRule, ruleById, rules } from "./rules/architecture.js";
