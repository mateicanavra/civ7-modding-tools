export * from "./dto/host-policy.schema.js";
export type {
  DeclarationReadiness,
  ForbiddenFileDeclaration,
  GeneratedSurfaceDeclaration,
  MutationPathAction,
  ProtectedMutationDecision,
  ProtectedMutationGuard,
  ProtectedSurfaceDeclaration,
  ProtectedZoneOwner,
  ProtectedZoneRecoveryInstruction,
  ScanRootProtectionDecision,
  StagedMutationPath,
  TransactionPathDecision,
} from "./dto/protected-zone.schema.js";
export {
  ProtectedMutationGuardSchema,
  TransactionPathDecisionSchema,
} from "./dto/protected-zone.schema.js";
export {
  hostApplyGateDecision,
  hostAuthoringBoundaryState,
  hostGeneratedSurfaceDeclarations,
  hostProjectSupportDecision,
  hostSurfaceDecisionForGeneratedZone,
  hostSurfaceDecisionForPath,
  hostSurfaceDecisionForScanRoot,
  matchesHostMatcher,
  renderHostRecoveryInstruction,
} from "./policy/host-policy-decisions.policy.js";
export { defaultHostPolicyDocument } from "./policy/host-policy-declarations.policy.js";
export {
  defaultHostPolicyState,
  missingHostPolicyState,
  parseHostPolicyDocument,
  readHostPolicyState,
  unavailableHostPolicyState,
} from "./policy/host-policy-state.policy.js";
export {
  declarationForFileLayerRule,
  declarationForHostSurfacePath,
  matchesDeclarationPath,
} from "./policy/protected-zone-declarations.policy.js";
export { decisionDiagnostic } from "./policy/protected-zone-diagnostics.policy.js";
export { runFileLayerProtectedMutationRule } from "./policy/protected-zone-file-layer.policy.js";
export { evaluateProtectedMutationGuard } from "./policy/protected-zone-guard.policy.js";
export {
  modifiedStagedPaths,
  stagedPathsFromNameStatus,
} from "./policy/protected-zone-path-actions.policy.js";
export { renderRecoveryInstruction } from "./policy/protected-zone-recovery.policy.js";
export { decideScanRootProtection } from "./policy/protected-zone-scan-root.policy.js";
