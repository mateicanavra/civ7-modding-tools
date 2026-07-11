import type { SaveDeploySafeFailureCategory, StudioRuntimeFailure } from "@civ7/studio-contract";

export function publicSaveDeployFailureCategory(
  failure: StudioRuntimeFailure
): SaveDeploySafeFailureCategory {
  switch (failure.tag) {
    case "OperationBlocked":
      return "ownership";
    case "InvalidRequest":
    case "OperationExpired":
    case "OperationNotFound":
    case "DaemonIdentityMismatch":
    case "UnsupportedOperationType":
      return "request-validation";
    case "DependencyUnavailable":
    case "RuntimeDisposed":
      return "dependency-unavailable";
    case "DeployFailed":
      if (failure.reason === "save-failed") {
        return failure.diagnostics?.code === "save-deploy-cleanup-failed" ? "cleanup" : "save";
      }
      return failure.reason === "rollback-failed" ? "cleanup" : "deployment";
    case "MaterializationFailed":
    case "VerificationFailed":
    case "AutoplayStartStopFailed":
    case "AutoplayVerificationFailed":
      return "internal-defect";
  }
}

export function publicSaveDeployFailureMessage(category: SaveDeploySafeFailureCategory): string {
  switch (category) {
    case "request-validation":
      return "Save/Deploy request could not be accepted.";
    case "ownership":
      return "Save/Deploy is blocked by another Studio operation.";
    case "dependency-unavailable":
      return "Save/Deploy dependency is unavailable.";
    case "save":
      return "Saving the map configuration failed.";
    case "deployment":
      return "Deploying the map configuration failed.";
    case "cleanup":
      return "Save/Deploy recovery failed.";
    case "internal-defect":
      return "Save/Deploy failed.";
  }
}
