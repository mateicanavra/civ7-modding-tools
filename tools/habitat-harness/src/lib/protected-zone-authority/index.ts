export {
  declarationForFileLayerRule,
  declarationForHostSurfacePath,
  matchesDeclarationPath,
} from "./declarations.js";
export { decisionDiagnostic } from "./diagnostics.js";
export { runFileLayerProtectedMutationRule } from "./file-layer.js";
export { evaluateProtectedMutationGuard } from "./guard.js";
export { modifiedStagedPaths, stagedPathsFromNameStatus } from "./path-actions.js";
export { renderRecoveryInstruction } from "./recovery.js";
export { decideScanRootProtection } from "./scan-root.js";
export {
  TransactionPathAuthorityProjectionSchema,
  ProtectedMutationGuardProjectionSchema,
} from "./schema.js";
export type {
  DeclarationReadiness,
  ForbiddenArtifactDeclaration,
  GeneratedSurfaceDeclaration,
  MutationPathAction,
  ProtectedMutationDecision,
  ProtectedMutationGuardProjection,
  ProtectedSurfaceDeclaration,
  ProtectedZoneOwner,
  ProtectedZoneRecoveryInstruction,
  ScanRootProtectionDecision,
  StagedMutationPath,
  TransactionPathAuthorityProjection,
} from "./schema.js";
