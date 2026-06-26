export type {
  DiagnosticCatalogEntry,
  DiagnosticMatchContract,
  DiagnosticScanContract,
  GritDiagnosticCatalogEntry,
  GritDiagnosticMatchContract,
  GritDiagnosticScanContract,
  NativeDiagnosticAcquisitionContract,
  NativeDiagnosticCatalogEntry,
  NativeDiagnosticMatchContract,
  NativeDiagnosticScanContract,
} from "./dto/diagnostic-catalog.schema.js";
export {
  DiagnosticCatalogEntrySchema,
  DiagnosticMatchContractSchema,
  DiagnosticScanContractSchema,
  diagnosticCatalogEntryFromNativeRule,
  diagnosticCatalogEntryFromRuleSourceFacts,
  GritDiagnosticCatalogEntrySchema,
  GritDiagnosticMatchContractSchema,
  GritDiagnosticScanContractSchema,
  NativeDiagnosticAcquisitionContractSchema,
  NativeDiagnosticCatalogEntrySchema,
  NativeDiagnosticMatchContractSchema,
  NativeDiagnosticScanContractSchema,
} from "./dto/diagnostic-catalog.schema.js";
export type {
  DiagnosticCacheObservation,
  DiagnosticCacheRequirement,
  DiagnosticCommandObservation,
  DiagnosticCompletedCommandObservation,
  DiagnosticInterruptedCommandObservation,
  DiagnosticOutputMetadata,
  NativeGritCheckRequest,
  NativeGritCommandFamily,
  NativeGritOutputContract,
} from "./dto/diagnostic-command.schema.js";
export {
  DiagnosticCacheObservationSchema,
  DiagnosticCacheRequirementSchema,
  DiagnosticCommandObservationSchema,
  DiagnosticCompletedCommandObservationSchema,
  DiagnosticInterruptedCommandObservationSchema,
  DiagnosticOutputMetadataSchema,
  diagnosticCacheObservationFromCommand,
  diagnosticCacheRequirementForGritCheck,
  diagnosticCacheRequirementSatisfied,
  diagnosticCommandObservationFromResult,
  diagnosticCompletedCommandObservationFromResult,
  diagnosticProviderFailureForCacheObservation,
  diagnosticToolUnavailableObservation,
  NativeGritCheckRequestSchema,
  NativeGritCommandFamilySchema,
  NativeGritOutputContractSchema,
  nativeGritCheckRequestFromCommandResult,
  nativeGritCheckRequestFromProcessRequest,
} from "./dto/diagnostic-command.schema.js";
export type {
  DiagnosticIdentity,
  GritDiagnosticIdentity,
  NativeDiagnosticIdentity,
  NativeDiagnosticIdentityValue,
  ObservedDiagnosticIdentity,
  ObservedGritDiagnosticIdentity,
  ObservedNativeDiagnosticIdentity,
} from "./dto/diagnostic-identity.schema.js";
export {
  DiagnosticIdentitySchema,
  GritDiagnosticIdentitySchema,
  gritDiagnosticIdentity,
  isObservedGritDiagnosticIdentity,
  NativeDiagnosticIdentitySchema,
  NativeDiagnosticIdentityValueSchema,
  nativeDiagnosticIdentity,
  ObservedDiagnosticIdentitySchema,
  ObservedGritDiagnosticIdentitySchema,
  ObservedNativeDiagnosticIdentitySchema,
  observedGritDiagnosticIdentity,
  observedGritIdentityMatches,
  observedNativeDiagnosticIdentity,
  renderUnexpectedObservedGritIdentity,
} from "./dto/diagnostic-identity.schema.js";
export type {
  DiagnosticConsumerResult,
  DiagnosticFinding,
  DiagnosticRunOutcome,
} from "./dto/diagnostic-outcome.schema.js";
export {
  DiagnosticConsumerResultSchema,
  DiagnosticFindingSchema,
  DiagnosticRunOutcomeSchema,
  diagnosticConsumerResultFromOutcome,
} from "./dto/diagnostic-outcome.schema.js";
export type {
  DiagnosticScanRootDecision,
  DiagnosticScanRootRefusal,
  DiagnosticScanRootRefusalReason,
} from "./dto/diagnostic-scan-root.schema.js";
export {
  DiagnosticScanRootDecisionSchema,
  DiagnosticScanRootRefusalReasonSchema,
  DiagnosticScanRootRefusalSchema,
  isDiagnosticScanRootDecision,
  renderDiagnosticScanRootRefusal,
} from "./dto/diagnostic-scan-root.schema.js";
export * from "./dto/host-policy.schema.js";
export type {
  DeclarationReadiness,
  ForbiddenArtifactDeclaration,
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
export type { DiagnosticProviderFailureKind } from "./errors/diagnostic-provider.errors.js";
export {
  DiagnosticProviderFailureKindSchema,
  diagnosticProviderFailureKinds,
  isDiagnosticProviderFailureKind,
  renderDiagnosticProviderFailure,
} from "./errors/diagnostic-provider.errors.js";
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
